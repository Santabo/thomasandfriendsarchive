document.addEventListener('DOMContentLoaded', () => {
  fetch('/data/season1.json')  // updated path here
    .then(response => response.json())
    .then(data => {
      const episodes = data.season1.episodes;
      const container = document.getElementById('episode-list');
      container.innerHTML = '';

      episodes
        .sort((a, b) => a.episode_number - b.episode_number)
        .forEach(ep => {
          const div = document.createElement('div');
          div.innerHTML = `
            <h3>Episode ${ep.episode_number}: ${ep.uk_title}</h3>
            <p><a href="${ep.link}" target="_blank" rel="noopener noreferrer">Watch on Google Drive</a></p>
          `;
          container.appendChild(div);
        });
    })
    .catch(err => {
      console.error('Error loading episodes:', err);
      const container = document.getElementById('episode-list');
      container.innerHTML = 'Failed to load episodes.';
    });
});
