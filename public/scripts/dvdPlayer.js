document.addEventListener('DOMContentLoaded', () => {
    const dvdContainer = document.querySelector('.dvd-grid');
    const modal = document.getElementById("video-modal");
    const iframe = document.getElementById("modal-video");
    const closeBtn = document.getElementById("modal-close");
    const statusDiv = document.getElementById("queue-status");
    const controlsDiv = document.getElementById("modal-controls");
    const btnNext = document.getElementById("btn-next");
    const btnPrev = document.getElementById("btn-prev");
    const canvas = document.getElementById("static-canvas");
    
    // Safety check if canvas exists (it might not be in index.html yet)
    const ctx = canvas ? canvas.getContext("2d") : null;

    let currentQueue = [];
    let currentTrackIndex = 0;
    let staticAnimationId;

    // --- 1. FETCH AND RENDER DVDS ---
    fetch('/data/dvds.json')
        .then(response => response.json())
        .then(dvds => {
            if (!dvdContainer) return;
            dvdContainer.innerHTML = ''; // Clear loading/static content

            dvds.forEach(dvd => {
                // Create DVD Item
                const dvdItem = document.createElement('div');
                dvdItem.className = 'dvd-item';
                
                // Build the HTML structure
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

                // Add Click Event to Play
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
        
        // Show Controls
        if(controlsDiv) controlsDiv.style.display = "flex";
        if(statusDiv) statusDiv.style.display = "block";
        
        openModal();
        loadTrack();
    }

    function openModal() {
        modal.classList.remove("hidden");
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
        playStaticEffect();
    }

    function closeModal() {
        iframe.src = "";
        modal.classList.add("hidden");
        modal.style.display = "none";
        document.body.style.overflow = "";
        currentQueue = [];
        if(statusDiv) statusDiv.innerHTML = "";
    }

    // Attach close event
    if(closeBtn) closeBtn.onclick = closeModal;

    // Navigation Functions
    window.loadTrack = function() {
        if (currentQueue.length === 0) return;
        const track = currentQueue[currentTrackIndex];
        
        // Delay slightly for static effect
        setTimeout(() => {
            const separator = track.url.includes('?') ? '&' : '?';
            iframe.src = `${track.url}${separator}autoplay=1`;
        }, 300);
        
        if(statusDiv) statusDiv.innerHTML = `Now Playing: ${track.title} <span style="font-size:0.8em">(${currentTrackIndex+1}/${currentQueue.length})</span>`;
        
        if(btnPrev) btnPrev.disabled = currentTrackIndex === 0;
        if(btnNext) {
            btnNext.innerHTML = currentTrackIndex === currentQueue.length - 1 ? "Finish" : "Next ⏭";
        }
    };

    window.nextTrack = function() {
        if (currentTrackIndex < currentQueue.length - 1) {
            currentTrackIndex++;
            playStaticEffect();
            loadTrack();
        } else {
            closeModal();
        }
    };

    window.prevTrack = function() {
        if (currentTrackIndex > 0) {
            currentTrackIndex--;
            playStaticEffect();
            loadTrack();
        }
    };

    // --- 3. CANVAS STATIC EFFECT ---
    function playStaticEffect() {
        if (!canvas || !ctx) return;
        
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
        canvas.style.opacity = "1";
        
        function draw() {
            const w = canvas.width;
            const h = canvas.height;
            const idata = ctx.createImageData(w, h);
            const buffer32 = new Uint32Array(idata.data.buffer);
            
            for (let i = 0; i < buffer32.length; i++) {
                if (Math.random() < 0.1) buffer32[i] = 0xffffffff; // White
                else if(Math.random() < 0.05) buffer32[i] = 0xff000000; // Black
                else buffer32[i] = 0x00000000; // Transparent
            }
            ctx.putImageData(idata, 0, 0);
            staticAnimationId = requestAnimationFrame(draw);
        }
        
        draw();

        // Stop after 600ms
        setTimeout(() => {
            canvas.style.opacity = "0";
            cancelAnimationFrame(staticAnimationId);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 600);
    }
});
