document.addEventListener('DOMContentLoaded', () => {
  const lang = window.LANG_CODE || 'en-gb';

  const sections = [
    ...Array.from({ length: 24 }, (_, i) => `season${i + 1}`),
    'jackandthepack', 'tugs', 'specials', 'fan'
  ];

  const container   = document.getElementById('episode-list');
  const modal       = document.getElementById('video-modal');
  const iframe      = document.getElementById('modal-video');
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
    const label = key === 'fan'            ? 'Fan Creations'
                : key === 'specials'       ? 'Specials'
                : key === 'jackandthepack' ? 'Jack & the Pack'
                : key === 'tugs'           ? 'TUGS'
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
        s.style.display = show ? '' : 'none';
        s.classList.remove('search-mode');
        s.querySelectorAll('.episode').forEach(ep => ep.style.display = '');
      });
      // Hide empty state + clear search
      const noRes = document.getElementById('ep-no-results');
      if (noRes) noRes.style.display = 'none';
      if (searchInput) searchInput.value = '';
    });

    selector.appendChild(btn);
  });

  container.before(selector);

  // ── Fetch + render ───────────────────────────────────────────────────────
  Promise.all(sections.map(key => {
    const url = key === 'fan'      ? '/data/fanContent.json'
               : key === 'specials' ? `/${lang}/data/specials.json`
               : key === 'tugs'     ? '/data/tugs.json'
               : `/${lang}/data/${key}.json`;

    return fetch(url)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => {
        let episodes = [];
        if (key === 'fan')           episodes = data;
        else if (key === 'specials') episodes = data.specials?.episodes || [];
        else if (key === 'tugs')     episodes = data.tugs?.episodes    || [];
        else if (data[key])          episodes = data[key].episodes     || [];
        else if (data.episodes)      episodes = data.episodes;
        return { key, episodes };
      })
      .catch(() => ({ key, episodes: [] }));
  })).then(results => {
    results.forEach(({ key, episodes }) => {
      if (!episodes.length) return;

      // Scroll row wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'season';
      wrapper.dataset.series = key;
      wrapper.style.display = key === 'season1' ? '' : 'none';
      if (key !== 'season1') wrapper.classList.add('hidden');

      episodes.forEach(ep => {
        const title  = ep.title || ep.uk_title || ep.us_title || 'Unknown Episode';
        const cover  = ep.cover || '';
        const url    = ep.link  || ep.video_url || '';

        let epNumDisplay = '';
        if (ep.episode_number != null) {
          if      (key === 'fan')      epNumDisplay = `Fan #${ep.episode_number}`;
          else if (key === 'specials') epNumDisplay = 'Special';
          else if (key === 'tugs')     epNumDisplay = `Ep ${ep.episode_number}`;
          else                         epNumDisplay = `Ep ${ep.episode_number}`;
        }

        let epId = '00';
        if (key.startsWith('season')) {
          const sNum = String(key.replace('season', '')).padStart(2, '0');
          epId = `${sNum}${String(ep.episode_number || '0').padStart(2, '0')}`;
        }

        const div = document.createElement('div');
        div.className = 'episode';
        // Use a blank 1px SVG as placeholder so the space is reserved before img loads
        const blankSrc = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 168 94'%3E%3Crect width='168' height='94' fill='%23e6edf8'/%3E%3C/svg%3E";
        div.innerHTML = `
          <a class="video-link" data-url="${url}" data-epid="${epId}" href="#" aria-label="Watch ${title}">
            <img src="${blankSrc}" data-src="${cover}" alt="${title}" width="168" height="94" loading="lazy" />
          </a>
          <h3>${title}</h3>
          ${epNumDisplay ? `<p class="ep-num">${epNumDisplay}</p>` : ''}
        `;
        wrapper.appendChild(div);
      });

      container.appendChild(wrapper);
    });

    // Lazy-load images as they scroll into view
    setupLazyImages();
    setupSearch();
  });

  // ── Lazy image loading via IntersectionObserver ──────────────────────────
  function setupLazyImages() {
    const imgs = container.querySelectorAll('img[data-src]');
    if (!imgs.length) return;

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const img = entry.target;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }
          obs.unobserve(img);
        });
      }, { rootMargin: '200px' });

      imgs.forEach(img => io.observe(img));
    } else {
      // Fallback: load all immediately
      imgs.forEach(img => {
        if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
      });
    }
  }

  // ── Search ───────────────────────────────────────────────────────────────
  function setupSearch() {
    if (!searchInput) return;
    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const q = searchInput.value.trim().toLowerCase();

        if (!q) {
          // Restore tab view
          const active = document.querySelector('.selector-btn.active')?.dataset.target;
          document.querySelectorAll('.season').forEach(s => {
            const show = s.dataset.series === active;
            s.style.display = show ? '' : 'none';
            s.classList.remove('search-mode', 'hidden');
            if (!show) s.classList.add('hidden');
            s.querySelectorAll('.episode').forEach(ep => ep.style.display = '');
          });
          const noRes = document.getElementById('ep-no-results');
          if (noRes) noRes.style.display = 'none';
          return;
        }

        let totalMatches = 0;
        document.querySelectorAll('.season').forEach(s => {
          let hasMatch = false;
          s.querySelectorAll('.episode').forEach(ep => {
            const title   = ep.querySelector('h3')?.textContent.toLowerCase() || '';
            const visible = title.includes(q);
            ep.style.display = visible ? '' : 'none';
            if (visible) { hasMatch = true; totalMatches++; }
          });
          s.style.display = hasMatch ? '' : 'none';
          // Switch matching rows to wrap mode so cards grid properly
          if (hasMatch) s.classList.add('search-mode');
          else          s.classList.remove('search-mode');
          s.classList.toggle('hidden', !hasMatch);
        });

        // Empty state
        let noRes = document.getElementById('ep-no-results');
        if (totalMatches === 0) {
          if (!noRes) {
            noRes = document.createElement('p');
            noRes.id = 'ep-no-results';
            container.appendChild(noRes);
          }
          noRes.textContent = `No episodes found for \u201c${q}\u201d`;
          noRes.style.display = '';
        } else if (noRes) {
          noRes.style.display = 'none';
        }
      }, 180);
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
        if (fid) embedUrl = `https://drive.google.com/file/d/${fid}/preview?rm=minimal`;
      }
    } catch(e) { console.error('URL parse error', e); }

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
