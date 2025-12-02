document.addEventListener('DOMContentLoaded', () => {
    const dvdContainer = document.querySelector('.dvd-grid');
    const modal = document.getElementById("video-modal");
    const iframe = document.getElementById("modal-video");
    const closeBtn = document.getElementById("modal-close");
    const statusDiv = document.getElementById("queue-status");
    const controlsDiv = document.getElementById("modal-controls");
    const btnNext = document.getElementById("btn-next");
    const btnPrev = document.getElementById("btn-prev");
    
    // Get Language from URL (default to en-gb)
    const lang = window.LANG_CODE || 'en-gb';

    let currentQueue = [];
    let currentTrackIndex = 0;

    // --- 1. FETCH AND RENDER DVDS ---
    fetch('/data/dvds.json')
        .then(response => response.json())
        .then(dvds => {
            if (!dvdContainer) return;
            dvdContainer.innerHTML = '';

            dvds.forEach(dvd => {
                // REGION CHECK: If 'regions' is defined, ensure current lang is allowed.
                if (dvd.regions && !dvd.regions.includes(lang)) {
                    return; // Skip this DVD for this region
                }

                const dvdItem = document.createElement('div');
                dvdItem.className = 'dvd-item';
                
                // Select Cover based on Language
                let coverImage = dvd.covers['default'];
                if (dvd.covers[lang]) {
                    coverImage = dvd.covers[lang];
                }

                const trackListHtml = dvd.tracks.map((t, i) => 
                    `<li>${i + 1}. ${t.title}</li>`
                ).join('');

                dvdItem.innerHTML = `
                    <div class="dvd-case">
                        <div class="dvd-spine" style="background-color: ${dvd.spine_color || '#333'};">
                            ${dvd.title.toUpperCase()}
                        </div>
                        <div class="dvd-face dvd-front">
                            <img src="${coverImage}" alt="${dvd.title} Cover" loading="lazy">
                        </div>
                    </div>
                    <div class="dvd-info">
                        <h3>${dvd.title}</h3>
                        <ul class="tracklist">
                            ${trackListHtml}
                        </ul>
                    </div>
                `;

                dvdItem.addEventListener('click', () => {
                    prepareAndPlayDvd(dvd);
                });

                dvdContainer.appendChild(dvdItem);
            });
        })
        .catch(err => console.error("Error loading DVDs:", err));


    // --- 2. DATA RESOLUTION LOGIC ---
    
    async function prepareAndPlayDvd(dvd) {
        // 1. Identify which Season JSONs we need to fetch
        const seasonsToFetch = [...new Set(dvd.tracks
            .filter(t => !t.is_direct_link && t.season_id)
            .map(t => t.season_id)
        )];

        const seasonDataCache = {};

        // 2. Fetch required Season Data
        try {
            await Promise.all(seasonsToFetch.map(async (seasonId) => {
                // Construct path: /en-gb/data/season18.json
                const url = `/${lang}/data/${seasonId}.json`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Season not found: ${seasonId}`);
                const data = await response.json();
                
                // Normalize data structure
                seasonDataCache[seasonId] = data[seasonId] ? data[seasonId].episodes : data.episodes;
            }));
            
            // 3. Build the Playable Queue
            currentQueue = dvd.tracks.map(track => {
                if (track.is_direct_link) {
                    return { title: track.title, url: track.url };
                }
                
                const episodes = seasonDataCache[track.season_id];
                if (!episodes) return null;

                const epData = episodes.find(e => e.episode_number === track.episode_number);
                
                if (epData) {
                    return {
                        title: track.title, // Always use DVD track title to avoid spoilers
                        url: epData.link
                    };
                } else {
                    console.warn(`Episode not found: ${track.season_id} #${track.episode_number}`);
                    return null;
                }
            }).filter(item => item !== null); 

            // 4. Start Player
            if (currentQueue.length > 0) {
                currentTrackIndex = 0;
                startPlayerUI();
            } else {
                alert("Could not load episodes for this DVD.");
            }

        } catch (err) {
            console.error("Error fetching season data for DVD:", err);
            // Hide alert if it's just a 404 for a missing US season file
            if(lang !== 'en-us') alert("Error loading DVD data. Please try again.");
        }
    }

    // --- 3. PLAYER UI & CONTROLS ---

    function startPlayerUI() {
        if(controlsDiv) controlsDiv.style.display = "flex";
        if(statusDiv) statusDiv.style.display = "block";
        
        openModal();
        loadTrack();
    }

    function openModal() {
        modal.classList.remove("hidden");
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        iframe.src = "";
        modal.classList.add("hidden");
        modal.style.display = "none";
        document.body.style.overflow = "";
        currentQueue = [];
        if(statusDiv) statusDiv.innerHTML = "";
        if(controlsDiv) controlsDiv.style.display = "none";
    }

    if(closeBtn) closeBtn.addEventListener('click', closeModal);
    if(modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Helper to format URLs
    function formatVideoUrl(url) {
        if (!url) return "";
        
        // Handle Google Drive
        if (url.includes('drive.google.com')) {
            return url.replace('/view', '/preview');
        }
        
        // Handle YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const separator = url.includes('?') ? '&' : '?';
            // added modestbranding=1 to attempt to reduce title visibility
            return `${url}${separator}autoplay=1&modestbranding=1&rel=0`; 
        }
        
        return url;
    }

    window.loadTrack = function() {
        if (currentQueue.length === 0) return;
        const track = currentQueue[currentTrackIndex];
        
        iframe.src = formatVideoUrl(track.url);
        
        // Display the safe title from the JSON, not the YouTube title
        if(statusDiv) statusDiv.innerHTML = `Playing: ${track.title} <span style="font-size:0.8em">(${currentTrackIndex+1}/${currentQueue.length})</span>`;
        
        if(btnPrev) btnPrev.disabled = currentTrackIndex === 0;
        if(btnNext) {
            btnNext.innerHTML = currentTrackIndex === currentQueue.length - 1 ? "Finish" : "Next ⏭";
        }
    };

    window.nextTrack = function() {
        if (currentTrackIndex < currentQueue.length - 1) {
            currentTrackIndex++;
            loadTrack();
        } else {
            closeModal();
        }
    };

    window.prevTrack = function() {
        if (currentTrackIndex > 0) {
            currentTrackIndex--;
            loadTrack();
        }
    };
});
