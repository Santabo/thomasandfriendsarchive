document.addEventListener('DOMContentLoaded', () => {
  const seasons = ['season1', 'season2', 'season3', 'season4', 'season5', 'season6', 'season7', 'season8']; // Add more as needed
  const container = document.getElementById('episode-list');
  const modal = document.getElementById('video-modal');
  const iframe = document.getElementById('modal-video');

  container.innerHTML = '';

  const fetchSeasonData = seasons.map((seasonKey, index) =>
    fetch(`/data/${seasonKey}.json`)
      .then(response => response.json())
      .then(data => ({
        type: 'season',
        seasonKey,
        seasonNumber: index + 1,
        episodes: data[seasonKey].episodes,
      }))
      .catch(error => ({ type: 'season', seasonKey, error }))
  );

  const fetchFanData = fetch(`/data/fan.json`)
    .then(response => response.json())
    .then(data => ({
      type: 'fan',
      seasonKey: 'fan',
      episodes: data.fan.episodes,
    }))
    .catch(error => ({ type: 'fan', seasonKey: 'fan', error }));

  Promise.all([...fetchSeasonData, fetchFanData]).then(results => {
    results.forEach(({ type, seasonKey, seasonNumber, episodes, error }) => {
      if (error) {
        console.error(`Error loading ${seasonKey}:`, error);
        const errorMsg = document.createElement('p');
        errorMsg.textContent = `Failed to load ${seasonKey}.`;
        container.appendChild(errorMsg);
        return;
      }

      const seasonContainer = document.createElement('div');
      seasonContainer.className = 'season';

      const toggleButton = document.createElement('button');
      toggleButton.className = 'season-toggle';

      if (type === 'fan') {
        toggleButton.textContent = 'Fan Episodes';
      } else {
        toggleButton.textContent = seasonKey.replace('season', 'Series ');
      }

      toggleButton.setAttribute('aria-expanded', 'false');

      const content = document.createElement('div');
      content.className = 'season-content';
      content.hidden = true;

      episodes
        .sort((a, b) => {
          if (type === 'fan') return 0; // preserve original order
          return a.episode_number - b.episode_number;
        })
        .forEach((ep, i) => {
          let epId;
          if (type === 'fan') {
            epId = `F0${String(i).padStart(2, '0')}`;
          } else {
            epId = `${String(seasonNumber).padStart(2, '0')}${String(ep.episode_number).padStart(2, '0')}`;
          }

          const div = document.createElement('div');
          div.className = 'episode';
          div.setAttribute('data-epid', epId);
          div.innerHTML = `
            <a href="?ep=${epId}" class="video-link" data-url="${ep.link}" data-epid="${epId}">
              <img src="${ep.cover}" alt="E${ep.episode_number || i + 1} cover" />
            </a>
            <h3>E${ep.episode_number || i + 1}: ${ep.uk_title}</h3>
          `;
          content.appendChild(div);
        });

      toggleButton.addEventListener('click', () => {
        const expanded = toggleButton.getAttribute('aria-expanded') === 'true';
        toggleButton.setAttribute('aria-expanded', String(!expanded));
        content.hidden = expanded;
      });

      seasonContainer.appendChild(toggleButton);
      seasonContainer.appendChild(content);
      container.appendChild(seasonContainer);
    });

    // Auto-open episode modal if ep param is in URL
    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get('ep');
    if (requestedId) {
      const episodeEl = document.querySelector(`[data-epid="${requestedId}"] .video-link`);
      if (episodeEl) {
        openVideoModal(episodeEl.dataset.url, requestedId);
      }
    }
  });

  function openVideoModal(url, epId) {
    let embedUrl = url;

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

    iframe.src = embedUrl;
    modal.classList.remove('hidden');

    const currentUrl = new URL(window.location);
    currentUrl.searchParams.set('ep', epId);
    window.history.replaceState({}, '', currentUrl.toString());
  }

  document.addEventListener('click', function (e) {
    const link = e.target.closest('.video-link');
    if (link) {
      e.preventDefault();
      const url = link.dataset.url;
      const epId = link.dataset.epid;
      openVideoModal(url, epId);
    }

    if (e.target.id === 'modal-close') {
      iframe.src = '';
      modal.classList.add('hidden');

      // Remove ?ep from URL
      const currentUrl = new URL(window.location);
      currentUrl.searchParams.delete('ep');
      window.history.replaceState({}, '', currentUrl.toString());
    }
  });
});
