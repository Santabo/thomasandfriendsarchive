// scripts/fanContent.js

async function loadFanContent() {
  const container = document.getElementById('fan-content-container');

  try {
    const response = await fetch('/data/fanContent.json');
    const fanItems = await response.json();

    if (fanItems.length === 0) {
      container.innerHTML = '<p>No fan content yet. Submit yours to be featured here!</p>';
      return;
    }

    container.innerHTML = ''; // Clear placeholder if any

    fanItems.forEach(item => {
      const card = document.createElement('div');
      card.className = 'fan-item';

      card.innerHTML = `
        <h3>${item.title}</h3>
        <p><a href="#" class="video-link" data-url="${item.video_url}">Watch Video</a></p>
        <p>By <a href="${item.author_url}" target="_blank" rel="noopener noreferrer">${item.author_name}</a></p>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    container.innerHTML = '<p>Failed to load fan content.</p>';
    console.error('Error loading fan content:', err);
  }
}

window.addEventListener('DOMContentLoaded', loadFanContent);

// Shared modal click handler
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
