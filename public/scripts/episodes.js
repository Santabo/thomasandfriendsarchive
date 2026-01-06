document.addEventListener('DOMContentLoaded', () => {
  const lang = window.LANG_CODE || 'en-gb';

  // Define ALL sections clearly
  const sections = [
    ...Array.from({ length: 24 }, (_, i) => `season${i + 1}`), // season1 to season24
    'jackandthepack',
    'tugs',
    'specials',
    'fan'
  ];

  const container = document.getElementById('episode-list');
  // Removed .series-selector-wrapper lookup as we are reverting to container.before()
  const modal = document.getElementById('video-modal');
  const iframe = document.getElementById('modal-video');
  const searchInput = document.getElementById('episode-search');

  // --- 1. GLOBAL EVENT DELEGATION (Fixes "No episodes play") ---
  document.body.addEventListener('click', (e) => {
      const link = e.target.closest('a.video-link');
      if (link) {
          e.preventDefault();
          const url = link.dataset.url;
          const epid = link.dataset.epid;
          if (url) openVideoModal(url, epid);
      }
  });

  // --- 2. BUILD SERIES TABS ---
  const selector = document.createElement('div');
  selector.className = 'series-selector';
  
  sections.forEach((key, i) => {
    let label;
    if (key === 'fan') label = 'Fan Creations';
    else if (key === 'specials') label = 'Specials';
    else if (key === 'jackandthepack') label = lang === 'en-gb' ? 'Jack & the Pack' : 'Jack & the Pack';
    else if (key === 'tugs') label = 'TUGS';
    else label = `Series ${i + 1}`; 

    const button = document.createElement('button');
    button.className = 'selector-btn';
    button.textContent = label;
    button.dataset.target = key;
    // Default active is season1
    if (key === 'season1') button.classList.add('active');
    
    // Tab Click Logic
    button.addEventListener('click', () => {
        // Update UI
        document.querySelectorAll('.selector-btn').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        
        // Show/Hide Containers
        document.querySelectorAll('.season').forEach(s => {
            if(s.dataset.series === key) {
                s.style.display = 'grid'; 
                s.classList.remove('hidden'); 
            } else {
                s.style.display = 'none';
                s.classList.add('hidden');
            }
        });
    });

    selector.appendChild(button);
  });
  
  // Inject selector directly before container (Classic Layout)
  container.before(selector);

  // --- 3. FETCH AND RENDER ---
  const fetchSeasonData = sections.map((key) => {
    let url;
    // Define Paths
    if (key === 'fan') url = '/data/fanContent.json';
    else if (key === 'specials') url = `/${lang}/data/specials.json`;
    else if (key === 'tugs') url = '/data/tugs.json';
    else url = `/${lang}/data/${key}.json`;

    return fetch(url)
        .then(res => {
            if(!res.ok) throw new Error(`HTTP error ${res.status}`);
            return res.json();
        })
        .then(data => {
            let episodes = [];
            // Normalize Data Structure
            if(key === 'fan') episodes = data;
            else if(key === 'specials') episodes = data.specials.episodes;
            else if(key === 'tugs') episodes = data.tugs.episodes;
            else if(data[key]) episodes = data[key].episodes;
            else if(data.episodes) episodes = data.episodes; // Fallback
            
            return { type: key, seasonKey: key, episodes: episodes };
        })
        .catch(err => {
            // console.warn(`Failed to load ${key}:`, err);
            return { seasonKey: key, error: true }; 
        });
  });

  Promise.all(fetchSeasonData).then(results => {
    results.forEach(({ seasonKey, episodes, error }) => {
      if (error || !episodes) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'season';
      wrapper.dataset.series = seasonKey;
      
      // Default Visibility
      if (seasonKey !== 'season1') {
          wrapper.style.display = 'none';
          wrapper.classList.add('hidden');
      } else {
          wrapper.style.display = 'grid';
      }

      wrapper.classList.add('season-content'); 

      episodes.forEach((ep) => {
        let epId = '00';
        let title = ep.title || ep.uk_title || 'Unknown Episode';
        let cover = ep.cover || 'https://via.placeholder.com/300x169?text=No+Image';
        let url = ep.link || ep.video_url;
        
        // ADDED: Episode Number Display Logic
        let epNumDisplay = '';
        if (ep.episode_number) {
            if (seasonKey === 'fan') epNumDisplay = `Fan Creation #${ep.episode_number}`;
            else if (seasonKey === 'specials') epNumDisplay = `Special`;
            else epNumDisplay = `Episode ${ep.episode_number}`;
        }

        // Generate ID
        if(seasonKey.startsWith('season')) {
            const sNum = String(seasonKey.replace('season','')).padStart(2,'0');
            epId = `${sNum}${String(ep.episode_number).padStart(2,'0')}`;
        }

        const div = document.createElement('div');
        div.className = 'episode';
        div.innerHTML = `
          <a class="video-link" data-url="${url}" data-epid="${epId}" href="#">
            <img src="${cover}" alt="${title}" loading="lazy" />
          </a>
          <h3>${title}</h3>
          ${epNumDisplay ? `<p class="ep-num">${epNumDisplay}</p>` : ''}
        `;
        wrapper.appendChild(div);
      });
      
      container.appendChild(wrapper);
    });
    
    // Check for Redirect
    handleDirectUrlOpen();
  });

  // --- 4. VIDEO PLAYER LOGIC ---
  function openVideoModal(url, epId) {
      if (!modal || !iframe) return;
      
      let embedUrl = url;
      try {
          if (url.includes('youtube.com') || url.includes('youtu.be')) {
              const vId = url.split('v=')[1] || url.split('/').pop();
              const cleanVid = vId.split('?')[0]; 
              embedUrl = `https://www.youtube.com/embed/${cleanVid}?autoplay=1&modestbranding=1&rel=0`;
          } else if (url.includes('drive.google.com')) {
              // Extract ID safely
              let fId = '';
              const match = url.match(/\/d\/(.+?)(\/|$)/);
              if (match) fId = match[1];
              else {
                  const urlObj = new URL(url);
                  fId = urlObj.searchParams.get('id');
              }
              
              if(fId) embedUrl = `https://drive.google.com/file/d/${fId}/preview`;
          }
      } catch(e) {
          console.error("URL Parse Error", e);
      }

      iframe.src = embedUrl;
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
      
      const shield = document.getElementById('title-shield');
      if(shield) {
          shield.classList.add('active');
          setTimeout(() => shield.classList.remove('active'), 3000);
      }
  }

  function handleDirectUrlOpen() {
      // Direct link logic placeholder
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
