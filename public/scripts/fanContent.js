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
        <a href="#" class="video-link" data-url="${item.video_url}">
          <img src="${item.cover}" alt="Cover for ${item.title}" style="width: 100%; max-width: 400px; cursor: pointer; border-radius: 8px;" />
        </a>
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
