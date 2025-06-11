document.addEventListener('DOMContentLoaded', () => {
  fetch('/data/season1.json')
    .then(response => response.json())
    .then(data => {
      const episodes = data.season1.episodes;
      const container = document.getElementById('episode-list');
      container.innerHTML = '';

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
          container.appendChild(div);
        });
    })
    .catch(err => {
      console.error('Error loading episodes:', err);
      const container = document.getElementById('episode-list');
      container.innerHTML = 'Failed to load episodes.';
    });
});

// Video modal handler with autoplay
document.body.addEventListener('click', function (e) {
  if (e.target.closest('.video-link')) {
    e.preventDefault();
    const link = e.target.closest('.video-link');
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
        embedUrl = `https://drive.google.com/file/d/${match[1]}/preview?autoplay=1`;
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
