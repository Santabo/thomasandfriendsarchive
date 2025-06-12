document.addEventListener('DOMContentLoaded', () => {
  const seasons = ['season1', 'season2']; // Add more as you add JSON files
  const container = document.getElementById('episode-list');
  container.innerHTML = '';

  seasons.forEach(seasonKey => {
    fetch(`/data/${seasonKey}.json`)
      .then(response => response.json())
      .then(data => {
        const episodes = data[seasonKey].episodes;

        // Create season container
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
      })
      .catch(err => {
        console.error(`Error loading ${seasonKey}:`, err);
        const errorMsg = document.createElement('p');
        errorMsg.textContent = `Failed to load ${seasonKey}.`;
        container.appendChild(errorMsg);
      });
  });
});
