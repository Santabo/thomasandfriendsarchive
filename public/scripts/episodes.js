fetch('data/episodes.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('episodes-container');

    Object.entries(data).forEach(([seasonKey, seasonData]) => {
      const seasonDiv = document.createElement('div');
      seasonDiv.className = 'season-block';

      const title = document.createElement('h3');
      title.textContent = seasonKey.replace('season', 'Season ');
      seasonDiv.appendChild(title);

      seasonData.episodes.forEach(ep => {
        const card = document.createElement('div');
        card.className = 'episode-card';

        card.innerHTML = `
          <h4>${ep.episode_number}. ${ep.uk_title}</h4>
          <img src="${ep.image}" alt="${ep.uk_title}" width="300">
          <p>${ep.summary}</p>
          <p><strong>Air Date:</strong> ${ep.air_date}</p>
          <p><a href="${ep.link}" target="_blank">Watch UK Version</a></p>
        `;

        seasonDiv.appendChild(card);
      });

      container.appendChild(seasonDiv);
    });
  })
  .catch(err => console.error("Failed to load episodes:", err));
