document.addEventListener('DOMContentLoaded', () => {
  const sections = [
    ...Array.from({ length: 19 }, (_, i) => `season${i + 1}`),
    'fan'
  ];

  const container = document.getElementById('episode-list');
  const selector = document.createElement('div');
  selector.className = 'series-selector';

  const modal = document.getElementById('video-modal');
  const iframe = document.getElementById('modal-video');

  if (!modal || !iframe) {
    console.error('Modal or iframe element not found in DOM!');
    return;
  }

  // Create selector buttons
  sections.forEach((key, i) => {
    const label = key === 'fan' ? 'Fan Creations' : `Series ${i + 1}`;
    const button = document.createElement('button');
    button.className = 'selector-btn';
    button.textContent = label;
    button.dataset.target = key;
    if (i === 0) button.classList.add('active');
    selector.appendChild(button);
  });
  container.before(selector);

  const fetchSeasonData = sections.map((key, index) => {
    if (key === 'fan') {
      return fetch('/data/fanContent.json')
        .then(res => res.json())
        .then(items => ({
          type: 'fan',
          seasonKey: key,
          seasonNumber: null,
          episodes: items
        }))
        .catch(err => ({ seasonKey: key, error: err }));
    } else {
      return fetch(`/data/${key}.json`)
        .then(res => res.json())
        .then(data => ({
          type: 'season',
          seasonKey: key,
          seasonNumber: index + 1,
          episodes: data[key].episodes
        }))
        .catch(err => ({ seasonKey: key, error: err }));
    }
  });

  Promise.all(fetchSeasonData).then(results => {
    results.forEach(({ type, seasonKey, seasonNumber, episodes, error }) => {
      if (error) {
        console.error(`Error loading ${seasonKey}:`, error);
        return;
      }

      const wrapper = document.createElement('div');
      wrapper.className = 'season';
      wrapper.dataset.series = seasonKey;
      wrapper.style.display = seasonKey === 'season1' ? 'block' : 'none';

      const content = document.createElement('div');
      content.className = type === 'fan' ? 'fan-content' : 'season-content';

      if (type === 'season') {
        episodes.sort((a, b) => a.episode_number - b.episode_number);
      }

      episodes.forEach((ep, i) => {
        const epId =
          type === 'fan'
            ? `F0${String(i).padStart(2, '0')}`
            : `${String(seasonNumber).padStart(2, '0')}${String(ep.episode_number).padStart(2, '0')}`;

        const url = type === 'fan' ? ep.video_url : ep.link;
        const title = type === 'fan' ? ep.title : `E${ep.episode_number}: ${ep.uk_title}`;
        const cover = ep.cover;

        const div = document.createElement('div');
        div.className = 'episode';
        div.setAttribute('data-epid', epId);
        div.innerHTML = `
          <a href="?ep=${epId}" class="video-link" data-url="${url}" data-epid="${epId}">
            <img src="${cover}" alt="${title} cover" />
          </a>
          <h3>${title}</h3>
          ${
            type === 'fan' && ep.author_name
              ? `<p>By <a href="${ep.author_url}" target="_blank">${ep.author_name}</a></p>`
              : ''
          }
        `;
        content.appendChild(div);
      });

      wrapper.appendChild(content);
      container.appendChild(wrapper);
    });

    document.querySelectorAll('.selector-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        document.querySelectorAll('.selector-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.season').forEach(s => {
          s.style.display = s.dataset.series === target ? 'block' : 'none';
        });
      });
    });

    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get('ep');
    if (requestedId) {
      const episodeEl = document.querySelector(`[data-epid="${requestedId}"] .video-link`);
      if (episodeEl) {
        openVideoModal(episodeEl.dataset.url, requestedId);
      }
    }
  });

  function openVideoModal(url, epId) {
    let embedUrl = url;

    try {
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
    } catch (err) {
      console.error('Error parsing video URL:', err);
    }

    iframe.src = embedUrl;
    modal.classList.remove('hidden');
    modal.style.display = 'flex';

    const currentUrl = new URL(window.location);
    currentUrl.searchParams.set('ep', epId);
    window.history.replaceState({}, '', currentUrl.toString());
  }

  document.addEventListener('click', e => {
    const link = e.target.closest('.video-link');
    if (link) {
      e.preventDefault();
      openVideoModal(link.dataset.url, link.dataset.epid);
    }

    if (e.target.id === 'modal-close') {
      iframe.src = '';
      modal.classList.add('hidden');
      modal.style.display = 'none';

      const currentUrl = new URL(window.location);
      currentUrl.searchParams.delete('ep');
      window.history.replaceState({}, '', currentUrl.toString());
    }
  });

  modal.addEventListener('click', e => {
    if (e.target === modal) {
      iframe.src = '';
      modal.classList.add('hidden');
      modal.style.display = 'none';

      const currentUrl = new URL(window.location);
      currentUrl.searchParams.delete('ep');
      window.history.replaceState({}, '', currentUrl.toString());
    }
  });
});
