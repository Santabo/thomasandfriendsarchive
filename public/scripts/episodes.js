document.addEventListener('DOMContentLoaded', () => {
  const lang = window.LANG_CODE || 'en-gb';

  const sections = [
    ...Array.from({ length: 22 }, (_, i) => `season${i + 1}`),
    'jackandthepack',
    'specials',
    'fan'
  ];

  const container = document.getElementById('episode-list');
  const selector = document.createElement('div');
  selector.className = 'series-selector';

  const modal = document.getElementById('video-modal');
  const iframe = document.getElementById('modal-video');

  if (!modal || !iframe) {
    console.error('Modal or iframe element not found in DOM!');
    return;
  }

  const openEpisodeIdFromRedirect = sessionStorage.getItem('openEpisode');
  if (openEpisodeIdFromRedirect) {
    sessionStorage.removeItem('openEpisode');
    window.__openEpisodeIdFromRedirect = openEpisodeIdFromRedirect;
  }

  sections.forEach((key, i) => {
    let label;
    if (key === 'fan') {
      label = 'Fan Creations';
    } else if (key === 'specials') {
      label = 'Specials';
    } else if (key === 'jackandthepack') {
      label = lang === 'en-gb' ? 'Jack & the Sodor Construction Company' : 'Jack & the Pack';
    } else {
      label = `Series ${i + 1}`;
    }

    const button = document.createElement('button');
    button.className = 'selector-btn';
    button.textContent = label;
    button.dataset.target = key;
    if (i === 0) button.classList.add('active');
    selector.appendChild(button);
  });
  container.before(selector);

  const fetchSeasonData = sections.map((key, index) => {
    if (key === 'fan') {
      return fetch('/data/fanContent.json')
        .then(res => res.json())
        .then(items => ({
          type: 'fan',
          seasonKey: key,
          seasonNumber: null,
          episodes: items
        }))
        .catch(err => ({ seasonKey: key, error: err }));
    } else if (key === 'specials') {
      return fetch(`/${lang}/data/specials.json`)
        .then(res => res.json())
        .then(data => ({
          type: 'specials',
          seasonKey: key,
          seasonNumber: null,
          episodes: data.specials.episodes
        }))
        .catch(err => ({ seasonKey: key, error: err }));
    } else {
      return fetch(`/${lang}/data/${key}.json`)
        .then(res => res.json())
        .then(data => ({
          type: 'season',
          seasonKey: key,
          seasonNumber: key.startsWith('season') ? index + 1 : null,
          episodes: data[key].episodes
        }))
        .catch(err => ({ seasonKey: key, error: err }));
    }
  });

  Promise.all(fetchSeasonData).then(results => {
    results.forEach(({ type, seasonKey, seasonNumber, episodes, error }) => {
      if (error) {
        console.error(`Error loading ${seasonKey}:`, error);
        return;
      }

      const wrapper = document.createElement('div');
      wrapper.className = 'season';
      wrapper.dataset.series = seasonKey;
      wrapper.style.display = seasonKey === 'season1' ? 'block' : 'none';

      const content = document.createElement('div');
      content.className = type === 'fan' ? 'fan-content' : 'season-content';

      if (type === 'season' || type === 'specials') {
        episodes.sort((a, b) => a.episode_number - b.episode_number);
      }

      episodes.forEach((ep, i) => {
        let epId, epUrl, title;
        if (type === 'fan') {
          epId = `F0${String(i).padStart(2, '0')}`;
          epUrl = ep.video_url;
          title = ep.title;
        } else if (type === 'specials') {
          epId = `SPL${String(ep.episode_number).padStart(2, '0')}`;
          epUrl = ep.link;
          title = ep.uk_title;
        } else {
          const seasonStr = String(seasonNumber ?? 0).padStart(2, '0');
          const epNumStr = String(ep.episode_number).padStart(2, '0');
          epId = `${seasonStr}${epNumStr}`;
          epUrl = ep.link;
          title = `E${epNumStr}: ${ep.uk_title}`;
        }

        let episodeLink = '';
        if (type === 'season') {
          const seasonStr = String(seasonNumber ?? 0).padStart(2, '0');
          const epNumStr = String(ep.episode_number).padStart(2, '0');
          episodeLink = `/${lang}/episodes/${seasonStr}/${epNumStr}`;
        } else if (type === 'specials') {
          episodeLink = `/${lang}/specials/${String(ep.episode_number).padStart(2, '0')}`;
        } else if (type === 'fan') {
          episodeLink = `/${lang}/fan/${String(i + 1).padStart(2, '0')}`;
        }

        const cover = ep.cover;

        const div = document.createElement('div');
        div.className = 'episode';
        div.setAttribute('data-epid', epId);
        div.innerHTML = `
          <a class="video-link" data-url="${epUrl}" data-epid="${epId}" title="Play ${title}" tabindex="0" role="button" aria-label="Play ${title}">
            <img src="${cover}" alt="${title} cover" />
          </a>
          <h3>${title}</h3>
          ${
            type === 'fan' && ep.author_name
              ? `<p>By <a href="${ep.author_url}" target="_blank" rel="noopener">${ep.author_name}</a></p>`
              : ''
          }
          <p class="episode-link-display" style="user-select: all; font-size: 0.8em; color: #888;">${episodeLink}</p>
        `;
        content.appendChild(div);
      });

      wrapper.appendChild(content);
      container.appendChild(wrapper);
    });

    // --- Handle redirect to specific episode ---
    if (window.__openEpisodeIdFromRedirect) {
      const epId = window.__openEpisodeIdFromRedirect;
      delete window.__openEpisodeIdFromRedirect;

      const episodeLink = container.querySelector(`a.video-link[data-epid="${epId}"]`);
      if (episodeLink) {
        openVideoModal(episodeLink.dataset.url, epId);

        if (epId.startsWith('SPL')) {
          document.querySelectorAll('.selector-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.target === 'specials');
          });
          document.querySelectorAll('.season').forEach(s => {
            s.style.display = s.dataset.series === 'specials' ? 'block' : 'none';
          });
        } else {
          const seasonNum = epId.slice(0, 2).replace(/^0+/, '') || '1';
          document.querySelectorAll('.selector-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.target === `season${seasonNum}`);
          });
          document.querySelectorAll('.season').forEach(s => {
            s.style.display = s.dataset.series === `season${seasonNum}` ? 'block' : 'none';
          });
        }
      }
    }

    document.querySelectorAll('.selector-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        document.querySelectorAll('.selector-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.season').forEach(s => {
          s.style.display = s.dataset.series === target ? 'block' : 'none';
        });
      });
    });

    container.querySelectorAll('a.video-link').forEach(link => {
      link.style.cursor = 'pointer';
      link.removeAttribute('href');

      link.addEventListener('click', e => {
        e.preventDefault();
        openVideoModal(link.dataset.url, link.dataset.epid);
      });
    });

    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    if (pathSegments.length >= 3) {
      const [langInPath, section, part1, part2] = pathSegments;
      if (langInPath === lang) {
        if (section === 'episodes' && part1 && part2) {
          const epId = String(part1).padStart(2, '0') + String(part2).padStart(2, '0');
          const episodeEl = container.querySelector(`[data-epid="${epId}"] a.video-link`);
          if (episodeEl) {
            openVideoModal(episodeEl.dataset.url, epId);
            document.querySelectorAll('.selector-btn').forEach(b => {
              b.classList.toggle('active', b.dataset.target === `season${parseInt(part1, 10)}`);
            });
            document.querySelectorAll('.season').forEach(s => {
              s.style.display = s.dataset.series === `season${parseInt(part1, 10)}` ? 'block' : 'none';
            });
          } else {
            window.location.replace(`/${lang}/`);
          }
        } else if (section === 'specials' && part1) {
          const epId = `SPL${String(part1).padStart(2, '0')}`;
          const episodeEl = container.querySelector(`[data-epid="${epId}"] a.video-link`);
          if (episodeEl) {
            openVideoModal(episodeEl.dataset.url, epId);
            document.querySelectorAll('.selector-btn').forEach(b => {
              b.classList.toggle('active', b.dataset.target === 'specials');
            });
            document.querySelectorAll('.season').forEach(s => {
              s.style.display = s.dataset.series === 'specials' ? 'block' : 'none';
            });
          } else {
            window.location.replace(`/${lang}/`);
          }
        }
      }
    }
  });

  function openVideoModal(url, epId) {
    let embedUrl = url;

    try {
      if (url.includes('youtube.com')) {
        if (url.includes('/embed/')) {
          embedUrl = url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;
        } else {
          const videoId = new URL(url).searchParams.get('v');
          if (videoId) {
            embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
          }
        }
      } else if (url.includes('drive.google.com')) {
        const match = url.match(/\/d\/(.+?)\//);
        if (match && match[1]) {
          embedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
        }
      }
    } catch (err) {
      console.error('Error parsing video URL:', err);
    }

    iframe.src = embedUrl;
    modal.classList.remove('hidden');
    modal.style.display = 'flex';

    const currentUrl = new URL(window.location);
    if (epId.startsWith('SPL')) {
      currentUrl.pathname = `/${lang}/specials/${epId.slice(3)}`;
    } else {
      currentUrl.pathname = `/${lang}/episodes/${epId.slice(0, 2)}/${String(epId.slice(2)).padStart(2, '0')}`;
    }
    currentUrl.search = '';
    window.history.replaceState({}, '', currentUrl.toString());
  }

  document.addEventListener('click', e => {
    if (e.target.id === 'modal-close') {
      iframe.src = '';
      modal.classList.add('hidden');
      modal.style.display = 'none';

      const currentUrl = new URL(window.location);
      currentUrl.pathname = `/${lang}/`;
      currentUrl.search = '';
      window.history.replaceState({}, '', currentUrl.toString());
    }
  });

  modal.addEventListener('click', e => {
    if (e.target === modal) {
      iframe.src = '';
      modal.classList.add('hidden');
      modal.style.display = 'none';

      const currentUrl = new URL(window.location);
      currentUrl.pathname = `/${lang}/`;
      currentUrl.search = '';
      window.history.replaceState({}, '', currentUrl.toString());
    }
  });
});
