// public/js/episodes.js
async function loadEpisodes() {
  try {
    const response = await fetch('/data/season1.json');
    const data = await response.json();

    const episodesContainer = document.getElementById('episodes-list');
    episodesContainer.innerHTML = '';

    if (!data.season1 || !data.season1.episodes) {
      episodesContainer.innerHTML = '<p>No episodes found.</p>';
      return;
    }

    const sortedEpisodes = data.season1.episodes.sort(
      (a, b) => a.episode_number - b.episode_number
    );

    sortedEpisodes.forEach(episode => {
      const episodeEl = document.createElement('div');
      episodeEl.className = 'episode-entry';
      episodeEl.innerHTML = `
        <h4>Episode ${episode.episode_number}: ${episode.uk_title}</h4>
        <p><a href="${episode.link}" target="_blank">Watch (UK Dub)</a></p>
      `;
      episodesContainer.appendChild(episodeEl);
    });
  } catch (error) {
    console.error('Error loading episodes:', error);
    document.getElementById('episodes-list').innerHTML = '<p>Failed to load episodes.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadEpisodes);
