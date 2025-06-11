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
            <p><a href="#" class="video-link" data-url="${ep.link}">Watch</a></p>
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

document.body.addEventListener('click', function (e) {
  if (e.target.classList.contains('video-link')) {
    e.preventDefault();
    const url = e.target.dataset.url;
    const modal = document.getElementById('video-modal');
    const iframe = document.getElementById('modal-video');

    // Determine embed format
    let embedUrl = url;

    if (url.includes('youtube.com')) {
      const videoId = new URL(url).searchParams.get('v');
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
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
