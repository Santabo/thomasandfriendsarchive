document.addEventListener('DOMContentLoaded', () => {
    const dvdContainer = document.querySelector('.dvd-grid');
    const modal = document.getElementById("video-modal");
    const iframe = document.getElementById("modal-video");
    const closeBtn = document.getElementById("modal-close");
    const statusDiv = document.getElementById("queue-status");
    const controlsDiv = document.getElementById("modal-controls");
    const btnNext = document.getElementById("btn-next");
    const btnPrev = document.getElementById("btn-prev");
    
    let currentQueue = [];
    let currentTrackIndex = 0;

    // --- 1. FETCH AND RENDER DVDS ---
    fetch('/data/dvds.json')
        .then(response => response.json())
        .then(dvds => {
            if (!dvdContainer) return;
            dvdContainer.innerHTML = '';

            dvds.forEach(dvd => {
                const dvdItem = document.createElement('div');
                dvdItem.className = 'dvd-item';
                
                const trackListHtml = dvd.tracks.map((t, i) => 
                    `<li>${i + 1}. ${t.title}</li>`
                ).join('');

                dvdItem.innerHTML = `
                    <div class="dvd-case">
                        <div class="dvd-spine" style="background-color: ${dvd.spine_color || '#333'};">
                            ${dvd.title.toUpperCase()}
                        </div>
                        <div class="dvd-face dvd-front">
                            <img src="${dvd.cover_url}" alt="${dvd.title} Cover" loading="lazy">
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
                    startDvdQueue(dvd.title, dvd.tracks);
                });

                dvdContainer.appendChild(dvdItem);
            });
        })
        .catch(err => console.error("Error loading DVDs:", err));


    // --- 2. PLAYER LOGIC ---

    function startDvdQueue(title, tracks) {
        currentQueue = tracks;
        currentTrackIndex = 0;
        
        // Show Queue Controls (hidden for normal episodes)
        if(controlsDiv) controlsDiv.style.display = "flex";
        if(statusDiv) statusDiv.style.display = "block";
        
        openModal();
        loadTrack();
    }

    function openModal() {
        modal.classList.remove("hidden");
        modal.style.display = "flex";
        document.body.style.overflow = "hidden"; // Disable scroll
    }

    function closeModal() {
        iframe.src = "";
        modal.classList.add("hidden");
        modal.style.display = "none";
        
        // CRITICAL: Re-enable scrolling
        document.body.style.overflow = "";
        
        // Reset queue
        currentQueue = [];
        if(statusDiv) statusDiv.innerHTML = "";
        if(controlsDiv) controlsDiv.style.display = "none";
    }

    // Attach listeners
    // Note: episodes.js also attaches a close listener. 
    // This one specifically ensures DVD queue state is reset.
    if(closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // Also close on background click
    if(modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Navigation Functions
    window.loadTrack = function() {
        if (currentQueue.length === 0) return;
        const track = currentQueue[currentTrackIndex];
        
        // Simple Iframe load (same as episodes)
        const separator = track.url.includes('?') ? '&' : '?';
        iframe.src = `${track.url}${separator}autoplay=1`;
        
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
