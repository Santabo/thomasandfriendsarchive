document.addEventListener('DOMContentLoaded', () => {
  const seasons = ['season1', 'season2', 'season3']; // Add more as needed
  const container = document.getElementById('episode-list');
  container.innerHTML = '';

  // Fetch all seasons in parallel and render in defined order
  const fetchPromises = seasons.map(seasonKey =>
    fetch(`/data/${seasonKey}.json`)
      .then(response => response.json())
      .then(data => ({ seasonKey, episodes: data[seasonKey].episodes }))
      .catch(error => ({ seasonKey, error }))
  );

  Promise.all(fetchPromises).then(results => {
    results.forEach(({ seasonKey, episodes, error }) => {
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
      toggleButton.textContent = seasonKey.replace('season', 'Season ');
      toggleButton.setAttribute('aria-expanded', 'false');

      const content = document.createElement('div');
      content.className = 'season-content';
      content.hidden = true;

      episodes
        .sort((a, b) => a.episode_number - b.episode_number)
        .forEach(ep => {
          const div = document.createElement('div');
          div.className = 'episode';
          div.innerHTML = `
            <a href="#" class="video-link" data-url="${ep.link}">
              <img src="${ep.cover}" alt="E${ep.episode_number} cover" />
            </a>
            <h3>E${ep.episode_number}: ${ep.uk_title}</h3>
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
  });
});

// Unified video modal logic
document.addEventListener('click', function (e) {
  const link = e.target.closest('.video-link');
  if (link) {
    e.preventDefault();
    const url = link.dataset.url;
    const modal = document.getElementById('video-modal');
    const iframe = document.getElementById('modal-video');

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
  }

  if (e.target.id === 'modal-close') {
    const modal = document.getElementById('video-modal');
    const iframe = document.getElementById('modal-video');
    iframe.src = '';
    modal.classList.add('hidden');
  }
});
