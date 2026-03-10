document.addEventListener('DOMContentLoaded', () => {
  const lang = window.LANG_CODE || 'en-gb';

  const sections = [
    ...Array.from({ length: 24 }, (_, i) => `season${i + 1}`),
    'jackandthepack', 'tugs', 'specials', 'fan'
  ];

  const container = document.getElementById('episode-list');
  const modal = document.getElementById('video-modal');
  const iframe = document.getElementById('modal-video');
  const searchInput = document.getElementById('episode-search');

  // ── Global click delegation ──────────────────────────────────────────────
  document.body.addEventListener('click', e => {
    const link = e.target.closest('a.video-link');
    if (link) { e.preventDefault(); openVideoModal(link.dataset.url, link.dataset.epid); }
  });

  // ── Series tabs ──────────────────────────────────────────────────────────
  const selector = document.createElement('div');
  selector.className = 'series-selector';

  sections.forEach((key, i) => {
    let label = key === 'fan' ? 'Fan Creations'
               : key === 'specials' ? 'Specials'
               : key === 'jackandthepack' ? 'Jack & the Pack'
               : key === 'tugs' ? 'TUGS'
               : `Series ${i + 1}`;

    const btn = document.createElement('button');
    btn.className = 'selector-btn' + (key === 'season1' ? ' active' : '');
    btn.textContent = label;
    btn.dataset.target = key;

    btn.addEventListener('click', () => {
      document.querySelectorAll('.selector-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.season').forEach(s => {
        const show = s.dataset.series === key;
        s.style.display = show ? 'grid' : 'none';
        s.classList.toggle('hidden', !show);
      });
      // Clear search when switching series
      if (searchInput) searchInput.value = '';
    });

    selector.appendChild(btn);
  });

  container.before(selector);

  // ── Fetch + render ───────────────────────────────────────────────────────
  Promise.all(sections.map(key => {
    const url = key === 'fan'     ? '/data/fanContent.json'
               : key === 'specials' ? `/${lang}/data/specials.json`
               : key === 'tugs'    ? '/data/tugs.json'
               : `/${lang}/data/${key}.json`;

    return fetch(url)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => {
        let episodes = [];
        if (key === 'fan')      episodes = data;
        else if (key === 'specials') episodes = data.specials?.episodes || [];
        else if (key === 'tugs')     episodes = data.tugs?.episodes || [];
        else if (data[key])          episodes = data[key].episodes || [];
        else if (data.episodes)      episodes = data.episodes;
        return { key, episodes };
      })
      .catch(() => ({ key, episodes: [] }));
  })).then(results => {
    results.forEach(({ key, episodes }) => {
      if (!episodes.length) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'season season-content';
      wrapper.dataset.series = key;
      wrapper.style.display = key === 'season1' ? 'grid' : 'none';
      if (key !== 'season1') wrapper.classList.add('hidden');

      episodes.forEach(ep => {
        // Support both title formats
        const title = ep.title || ep.uk_title || ep.us_title || 'Unknown Episode';
        const cover = ep.cover || 'https://via.placeholder.com/300x169?text=No+Image';
        const url   = ep.link  || ep.video_url || '';

        let epNumDisplay = '';
        if (ep.episode_number) {
          if (key === 'fan') epNumDisplay = `Fan #${ep.episode_number}`;
          else if (key === 'specials') epNumDisplay = 'Special';
          else if (key === 'tugs') epNumDisplay = `Episode ${ep.episode_number}`;
          else epNumDisplay = `Episode ${ep.episode_number}`;
        }

        let epId = '00';
        if (key.startsWith('season')) {
          const sNum = String(key.replace('season', '')).padStart(2, '0');
          epId = `${sNum}${String(ep.episode_number || '0').padStart(2, '0')}`;
        }

        const div = document.createElement('div');
        div.className = 'episode';
        div.innerHTML = `
          <a class="video-link" data-url="${url}" data-epid="${epId}" href="#" aria-label="Watch ${title}">
            <img src="${cover}" alt="${title}" loading="lazy" />
          </a>
          <h3>${title}</h3>
          ${epNumDisplay ? `<p class="ep-num">${epNumDisplay}</p>` : ''}
        `;
        wrapper.appendChild(div);
      });

      container.appendChild(wrapper);
    });

    setupSearch();
  });

  // ── Search ───────────────────────────────────────────────────────────────
  function setupSearch() {
    if (!searchInput) return;
    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const q = searchInput.value.trim().toLowerCase();
        if (!q) {
          // Restore normal series tab view
          const active = document.querySelector('.selector-btn.active')?.dataset.target;
          document.querySelectorAll('.season').forEach(s => {
            const show = s.dataset.series === active;
            s.style.display = show ? 'grid' : 'none';
            s.classList.toggle('hidden', !show);
            s.querySelectorAll('.episode').forEach(e => e.style.display = '');
          });
          return;
        }

        // Show all series, filter episodes by title
        document.querySelectorAll('.season').forEach(s => {
          let hasMatch = false;
          s.querySelectorAll('.episode').forEach(ep => {
            const title = ep.querySelector('h3')?.textContent.toLowerCase() || '';
            const visible = title.includes(q);
            ep.style.display = visible ? '' : 'none';
            if (visible) hasMatch = true;
          });
          s.style.display = hasMatch ? 'grid' : 'none';
          s.classList.toggle('hidden', !hasMatch);
        });
      }, 200);
    });
  }

  // ── Video modal ──────────────────────────────────────────────────────────
  function openVideoModal(url, epId) {
    if (!modal || !iframe || !url) return;

    let embedUrl = url;
    try {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const vid = (url.split('v=')[1] || url.split('/').pop()).split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${vid}?autoplay=1&modestbranding=1&rel=0`;
      } else if (url.includes('drive.google.com')) {
        const match = url.match(/\/d\/(.+?)(\/|$)/);
        const fid = match ? match[1] : new URL(url).searchParams.get('id');
        if (fid) embedUrl = `https://drive.google.com/file/d/${fid}/preview`;
      }
    } catch (e) { console.error('URL parse error', e); }

    iframe.src = embedUrl;
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  const closeModal = () => {
    iframe.src = '';
    modal.classList.add('hidden');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  };

  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) closeModal();
  });
});
