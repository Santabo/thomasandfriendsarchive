document.addEventListener('DOMContentLoaded', () => {
    const dvdContainer = document.querySelector('.dvd-grid');
    const splash = document.getElementById('dvd-splash-bg');
    const modal = document.getElementById('video-modal');
    const iframe = document.getElementById('modal-video');
    const closeBtn = document.getElementById('modal-close');
    const statusDiv = document.getElementById('queue-status');
    const controlsDiv = document.getElementById('modal-controls');
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');

    const lang = window.LANG_CODE || 'en-gb';

    let currentQueue = [];
    let currentTrackIndex = 0;

    const LQIP_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop stop-color='%23dce8f5'/%3E%3Cstop offset='1' stop-color='%23b8d0ea'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='16' height='9' fill='url(%23g)'/%3E%3C/svg%3E";
    const imageCache = new Map();
    let activeSplashHighSrc = '';

    function preloadImage(src) {
        if (!src) return Promise.resolve();
        if (imageCache.has(src)) return imageCache.get(src);

        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            img.decoding = 'async';
            img.onload = () => resolve(src);
            img.onerror = reject;
            img.src = src;
        });

        imageCache.set(src, promise);
        return promise;
    }

    function upgradeImageElement(imgEl, highSrc) {
        if (!imgEl || !highSrc) return;
        imgEl.src = LQIP_PLACEHOLDER;
        imgEl.classList.add('loading');

        preloadImage(highSrc)
            .then(() => {
                imgEl.src = highSrc;
                imgEl.classList.remove('loading');
                imgEl.classList.add('loaded');
            })
            .catch(() => {
                imgEl.src = highSrc;
                imgEl.classList.remove('loading');
            });
    }

    function getCoverImage(dvd) {
        return (dvd.covers && (dvd.covers[lang] || dvd.covers.default)) || '';
    }

    function getSplashImages(dvd) {
        if (dvd.splash_images) {
            return {
                low: dvd.splash_images.low || LQIP_PLACEHOLDER,
                high: dvd.splash_images.high || '',
            };
        }

        if (dvd.title?.toLowerCase().includes('dinos') && dvd.title?.toLowerCase().includes('discoveries')) {
            return {
                low: LQIP_PLACEHOLDER,
                high: 'https://i.ibb.co/0R6mFYXz/image.png',
            };
        }

        return { low: '', high: '' };
    }

    function showSplash(dvd) {
        if (!splash) return;

        const { low, high } = getSplashImages(dvd);
        if (!low && !high) return;

        activeSplashHighSrc = high;
        splash.style.opacity = '0.7';
        splash.classList.add('is-low-res');
        splash.style.backgroundImage = `url('${low || LQIP_PLACEHOLDER}')`;

        if (high) {
            preloadImage(high)
                .then(() => {
                    if (activeSplashHighSrc !== high) return;
                    splash.style.backgroundImage = `url('${high}')`;
                    splash.classList.remove('is-low-res');
                })
                .catch(() => {});
        }
    }

    function hideSplash() {
        if (!splash) return;
        splash.style.opacity = '0';
        activeSplashHighSrc = '';
    }

    fetch('/data/dvds.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(dvds => {
            if (!dvdContainer) return;
            dvdContainer.innerHTML = '';

            dvds.forEach(dvd => {
                if (dvd.regions && !dvd.regions.includes(lang)) return;

                const coverImage = getCoverImage(dvd);
                const splashImages = getSplashImages(dvd);

                preloadImage(coverImage).catch(() => {});
                preloadImage(splashImages.low).catch(() => {});
                preloadImage(splashImages.high).catch(() => {});

                const dvdItem = document.createElement('div');
                dvdItem.className = 'dvd-item';

                const trackListHtml = (dvd.tracks || [])
                    .map((t, i) => `<li>${i + 1}. ${t.title}</li>`)
                    .join('');

                dvdItem.innerHTML = `
                    <div class="dvd-case">
                        <div class="dvd-spine" style="background-color: ${dvd.spine_color || '#333'};" aria-hidden="true"></div>
                        <div class="dvd-face dvd-front">
                            <img class="dvd-cover" src="${LQIP_PLACEHOLDER}" alt="${dvd.title} Cover" loading="lazy" decoding="async">
                        </div>
                    </div>
                    <div class="dvd-info">
                        <h3>${dvd.title}</h3>
                        <ul class="tracklist">
                            ${trackListHtml}
                        </ul>
                    </div>
                `;

                const coverEl = dvdItem.querySelector('.dvd-cover');
                upgradeImageElement(coverEl, coverImage);

                dvdItem.addEventListener('mouseenter', () => showSplash(dvd));
                dvdItem.addEventListener('mouseleave', hideSplash);
                dvdItem.addEventListener('click', () => prepareAndPlayDvd(dvd));

                dvdContainer.appendChild(dvdItem);
            });
        })
        .catch(err => console.error('Error loading DVDs:', err));

    async function prepareAndPlayDvd(dvd) {
        const seasonsToFetch = [...new Set((dvd.tracks || [])
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

            currentQueue = (dvd.tracks || []).map(track => {
                if (track.is_direct_link) {
                    return {
                        title: track.title,
                        url: track.url,
                    };
                }

                const episodes = seasonDataCache[track.season_id];
                if (!episodes) return null;

                const epData = episodes.find(e => e.episode_number === track.episode_number);
                if (!epData) return null;

                return {
                    title: track.title,
                    url: epData.link,
                };
            }).filter(Boolean);

            if (currentQueue.length > 0) {
                currentTrackIndex = 0;
                startPlayerUI();
            } else {
                alert('Could not load episodes for this DVD.');
            }
        } catch (err) {
            console.error('Error fetching season data:', err);
            if (lang !== 'en-us') alert('Error loading DVD data.');
        }
    }

    function startPlayerUI() {
        if (controlsDiv) controlsDiv.style.display = 'flex';
        if (statusDiv) statusDiv.style.display = 'block';

        openModal();
        loadTrack();
    }

    function openModal() {
        if (!modal) return;
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if (iframe) iframe.src = '';
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
        document.body.style.overflow = '';
        currentQueue = [];

        if (statusDiv) statusDiv.innerHTML = '';
        if (controlsDiv) controlsDiv.style.display = 'none';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (btnNext) btnNext.addEventListener('click', () => window.nextTrack());
    if (btnPrev) btnPrev.addEventListener('click', () => window.prevTrack());

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (!modal || modal.classList.contains('hidden')) return;
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowRight') window.nextTrack();
        if (e.key === 'ArrowLeft') window.prevTrack();
    });

    function formatVideoUrl(url) {
        if (!url) return '';
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

        if (iframe) iframe.src = formatVideoUrl(track.url);

        if (statusDiv) {
            statusDiv.innerHTML = `Playing: ${track.title} <span style="font-size:0.8em">(${currentTrackIndex + 1}/${currentQueue.length})</span>`;
        }

        if (btnPrev) btnPrev.disabled = currentTrackIndex === 0;
        if (btnNext) {
            btnNext.innerHTML = currentTrackIndex === currentQueue.length - 1 ? 'Finish' : 'Next ⏭';
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
