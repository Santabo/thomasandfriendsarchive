document.addEventListener('DOMContentLoaded', () => {
  const lang = window.LANG_CODE || 'en-gb';

  const sections = [
    ...Array.from({ length: 24 }, (_, i) => `season${i + 1}`),
    'jackandthepack',
    'tugs',
    'specials',
    'fan'
  ];

  const container = document.getElementById('episode-list');
  const selectorWrapper = document.querySelector('.series-selector-wrapper'); // Changed selector target
  const modal = document.getElementById('video-modal');
  const iframe = document.getElementById('modal-video');
  const searchInput = document.getElementById('episode-search');

  // --- 1. SELECTOR BUILDER ---
  const selector = document.createElement('div');
  selector.className = 'series-selector';
  
  sections.forEach((key, i) => {
    let label;
    if (key === 'fan') { label = 'Fan Creations'; } 
    else if (key === 'specials') { label = 'Specials'; } 
    else if (key === 'jackandthepack') { label = lang === 'en-gb' ? 'Jack & the Pack' : 'Jack & the Pack'; } 
    else if (key === 'tugs') { label = 'TUGS'; } 
    else { label = `Series ${i + 1}`; }

    const button = document.createElement('button');
    button.className = 'selector-btn';
    button.textContent = label;
    button.dataset.target = key;
    if (i === 0) button.classList.add('active');
    selector.appendChild(button);
  });
  
  if(selectorWrapper) selectorWrapper.appendChild(selector);

  // --- 2. FETCH DATA ---
  const fetchSeasonData = sections.map((key, index) => {
    let url;
    if (key === 'fan') url = '/data/fanContent.json';
    else if (key === 'specials') url = `/${lang}/data/specials.json`;
    else if (key === 'tugs') url = '/data/tugs.json';
    else url = `/${lang}/data/${key}.json`;

    return fetch(url)
        .then(res => res.json())
        .then(data => {
            let episodes = [];
            if(key === 'fan') episodes = data;
            else if(key === 'specials') episodes = data.specials.episodes;
            else if(key === 'tugs') episodes = data.tugs.episodes;
            else episodes = data[key].episodes;
            
            return { type: key, seasonKey: key, episodes: episodes };
        })
        .catch(err => ({ seasonKey: key, error: err }));
  });

  Promise.all(fetchSeasonData).then(results => {
    results.forEach(({ type, seasonKey, episodes, error }) => {
      if (error) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'season';
      wrapper.dataset.series = seasonKey;
      // Default: Only show season 1
      if (seasonKey !== 'season1') wrapper.style.display = 'none';

      const content = document.createElement('div');
      content.className = 'season-content'; // Standard class for CSS styling

      episodes.forEach((ep, i) => {
        let epId = '00';
        let title = ep.title || ep.uk_title;
        let cover = ep.cover || '';
        let url = ep.link || ep.video_url;

        // ID Logic simplification for brevity
        if(seasonKey.startsWith('season')) {
            const sNum = String(seasonKey.replace('season','')).padStart(2,'0');
            epId = `${sNum}${String(ep.episode_number).padStart(2,'0')}`;
        }

        const div = document.createElement('div');
        div.className = 'episode';
        div.setAttribute('data-epid', epId);
        div.innerHTML = `
          <a class="video-link" data-url="${url}" data-epid="${epId}">
            <img src="${cover}" alt="${title}" loading="lazy" />
          </a>
          <h3>${title}</h3>
        `;
        content.appendChild(div);
      });
      wrapper.appendChild(content);
      container.appendChild(wrapper);
    });

    // Event Listeners for new elements
    setupInteractions();
  });

  function setupInteractions() {
      // Tabs
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

      // Video Clicks
      document.querySelectorAll('a.video-link').forEach(link => {
          link.addEventListener('click', e => {
              e.preventDefault();
              openVideoModal(link.dataset.url);
          });
      });
  }

  // --- SEARCH LOGIC ---
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        
        // If searching, show ALL seasons, hide non-matching eps
        document.querySelectorAll('.season').forEach(season => {
            if(term === '') {
                // Reset to active tab logic
                const activeBtn = document.querySelector('.selector-btn.active');
                season.style.display = (activeBtn && activeBtn.dataset.target === season.dataset.series) ? 'block' : 'none';
            } else {
                season.style.display = 'block'; // Show container to search inside
            }
            
            const eps = season.querySelectorAll('.episode');
            let hasVisible = false;
            eps.forEach(ep => {
                const title = ep.querySelector('h3').textContent.toLowerCase();
                if(title.includes(term)) {
                    ep.style.display = 'block';
                    hasVisible = true;
                } else {
                    ep.style.display = 'none';
                }
            });
            
            // Hide empty seasons during search
            if(term !== '' && !hasVisible) season.style.display = 'none';
        });
    });
  }

  function openVideoModal(url) {
      if (!modal || !iframe) return;
      
      let embedUrl = url;
      // Basic parser
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
          const vId = url.split('v=')[1] || url.split('/').pop();
          embedUrl = `https://www.youtube.com/embed/${vId}?autoplay=1`;
      } else if (url.includes('drive.google.com')) {
          const fId = url.match(/\/d\/(.+?)(\/|$)/)?.[1];
          if(fId) embedUrl = `https://drive.google.com/file/d/${fId}/preview`;
      }

      iframe.src = embedUrl;
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
  }

  // Close Logic
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if(e.target === modal) closeModal(); });

  function closeModal() {
      iframe.src = '';
      modal.classList.add('hidden');
      modal.style.display = 'none';
  }
});
