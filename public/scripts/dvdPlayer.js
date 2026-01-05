document.addEventListener('DOMContentLoaded', () => {
    const dvdContainer = document.querySelector('.dvd-grid');
    const modal = document.getElementById("video-modal");
    const modalContent = document.querySelector("#video-modal .modal-content"); // Needed for hover detection
    const iframe = document.getElementById("modal-video");
    const closeBtn = document.getElementById("modal-close");
    const statusDiv = document.getElementById("queue-status");
    const controlsDiv = document.getElementById("modal-controls");
    const btnNext = document.getElementById("btn-next");
    const btnPrev = document.getElementById("btn-prev");
    const titleShield = document.getElementById("title-shield");
    
    // Get Language from URL (default to en-gb)
    const lang = window.LANG_CODE || 'en-gb';

    let currentQueue = [];
    let currentTrackIndex = 0;

    // --- SHIELD & TIMER VARIABLES ---
    let shieldTimeout;
    let isHoveringModal = false;
    let isShieldNeededForTrack = false;

    // --- 1. FETCH AND RENDER DVDS ---
    fetch('/data/dvds.json')
        .then(response => response.json())
        .then(dvds => {
            if (!dvdContainer) return;
            dvdContainer.innerHTML = '';

            dvds.forEach(dvd => {
                if (dvd.regions && !dvd.regions.includes(lang)) {
                    return; 
                }

                const dvdItem = document.createElement('div');
                dvdItem.className = 'dvd-item';
                
                let coverImage = dvd.covers['default'];
                if (dvd.covers[lang]) {
                    coverImage = dvd.covers[lang];
                }

                const trackListHtml = dvd.tracks.map((t, i) => 
                    `<li>${i + 1}. ${t.title}</li>`
                ).join('');

                // Spine text kept in HTML for accessibility but hidden via CSS
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

                // Splash Screen Logic for Dinos & Discoveries
                if (dvd.title.toLowerCase().includes("dinos") && dvd.title.toLowerCase().includes("discoveries")) {
                    dvdItem.addEventListener('mouseenter', () => {
                        const splash = document.getElementById('dvd-splash-bg');
                        if(splash) {
                            splash.style.backgroundImage = "url('https://i.ibb.co/0R6mFYXz/image.png')";
                            splash.style.opacity = '0.7'; 
                        }
                    });
                    dvdItem.addEventListener('mouseleave', () => {
                        const splash = document.getElementById('dvd-splash-bg');
                        if(splash) splash.style.opacity = '0';
                    });
                }

                dvdItem.addEventListener('click', () => {
                    prepareAndPlayDvd(dvd);
                });

                dvdContainer.appendChild(dvdItem);
            });
        })
        .catch(err => console.error("Error loading DVDs:", err));


    // --- 2. DATA RESOLUTION LOGIC ---
    async function prepareAndPlayDvd(dvd) {
        const seasonsToFetch = [...new Set(dvd.tracks
            .filter(t => !t.is_direct_link && t.season_id)
            .map(t => t.season_id)
        )];

        const seasonDataCache = {};

        try {
            await Promise.all(seasonsToFetch.map(async (seasonId) => {
                const url = `/${lang}/data/${seasonId}.json`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Season not found: ${seasonId}`);
                const data = await response.json();
                seasonDataCache[seasonId] = data[seasonId] ? data[seasonId].episodes : data.episodes;
            }));
            
            currentQueue = dvd.tracks.map(track => {
                if (track.is_direct_link) {
                    return { 
                        title: track.title, 
                        url: track.url, 
                        hide_embed_title: track.hide_embed_title || false 
                    };
                }
                
                const episodes = seasonDataCache[track.season_id];
                if (!episodes) return null;

                const epData = episodes.find(e => e.episode_number === track.episode_number);
                
                if (epData) {
                    return {
                        title: track.title, 
                        url: epData.link,
                        hide_embed_title: false
                    };
                } else {
                    return null;
                }
            }).filter(item => item !== null); 

            if (currentQueue.length > 0) {
                currentTrackIndex = 0;
                startPlayerUI();
            } else {
                alert("Could not load episodes for this DVD.");
            }

        } catch (err) {
            console.error("Error fetching season data:", err);
            if(lang !== 'en-us') alert("Error loading DVD data.");
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
        
        // Reset Shield state
        clearTimeout(shieldTimeout);
        if(titleShield) titleShield.classList.remove("active");
        isShieldNeededForTrack = false;

        if(statusDiv) statusDiv.innerHTML = "";
        if(controlsDiv) controlsDiv.style.display = "none";
    }

    if(closeBtn) closeBtn.addEventListener('click', closeModal);
    if(modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // --- HOVER HANDLERS FOR SHIELD ---
    if(modalContent && titleShield) {
        // When mouse enters modal content area
        modalContent.addEventListener('mouseenter', () => {
            isHoveringModal = true;
            // If this track needs a shield, show it immediately and stop hide timer
            if(isShieldNeededForTrack) {
                clearTimeout(shieldTimeout);
                titleShield.classList.add("active");
            }
        });

        // When mouse leaves modal content area
        modalContent.addEventListener('mouseleave', () => {
            isHoveringModal = false;
            // If this track needs a shield, start timer to hide it
            if(isShieldNeededForTrack) {
                startShieldTimer();
            }
        });
    }

    function startShieldTimer() {
        clearTimeout(shieldTimeout);
        // Hide after 3 seconds, unless currently hovering
        shieldTimeout = setTimeout(() => {
            if(!isHoveringModal && titleShield) {
                titleShield.classList.remove("active");
            }
        }, 3000); 
    }

    function formatVideoUrl(url) {
        if (!url) return "";
        if (url.includes('drive.google.com')) return url.replace('/view', '/preview');
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const separator = url.includes('?') ? '&' : '?';
            return `${url}${separator}autoplay=1&modestbranding=1&rel=0`; 
        }
        return url;
    }

    window.loadTrack = function() {
        if (currentQueue.length === 0) return;
        const track = currentQueue[currentTrackIndex];
        
        // --- SHIELD LOGIC ON LOAD ---
        clearTimeout(shieldTimeout); // Clear previous timers
        
        if (titleShield) {
            if (track.hide_embed_title) {
                isShieldNeededForTrack = true;
                // Show immediately on load
                titleShield.classList.add("active");
                // Start timer to hide it
                startShieldTimer();
            } else {
                isShieldNeededForTrack = false;
                titleShield.classList.remove("active");
            }
        }

        iframe.src = formatVideoUrl(track.url);
        
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
