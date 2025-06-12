document.addEventListener('DOMContentLoaded', () => {
  const seasons = ['season1', 'season2']; // Add more as needed
  const container = document.getElementById('episode-list');
  container.innerHTML = '';

  seasons.forEach(seasonKey => {
    fetch(`/data/${seasonKey}.json`)
      .then(response => response.json())
      .then(data => {
        const episodes = data[seasonKey].episodes;

        // Create a season section
        const seasonSection = document.createElement('section');
        seasonSection.className = 'season-section';

        const seasonTitle = document.createElement('h2');
        seasonTitle.textContent = seasonKey.replace('season', 'Season ');
        seasonSection.appendChild(seasonTitle);

        const episodeGrid = document.createElement('div');
        episodeGrid.className = 'season-episode-grid';

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
            episodeGrid.appendChild(div);
          });

        seasonSection.appendChild(episodeGrid);
        container.appendChild(seasonSection);
      })
      .catch(err => {
        console.error(`Error loading ${seasonKey}:`, err);
        const errorMsg = document.createElement('p');
        errorMsg.textContent = `Failed to load ${seasonKey}.`;
        container.appendChild(errorMsg);
      });
  });
});
