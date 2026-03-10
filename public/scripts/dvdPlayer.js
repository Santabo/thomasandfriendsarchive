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

    const LQIP = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop stop-color='%23dce8f5'/%3E%3Cstop offset='1' stop-color='%23b8d0ea'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='16' height='9' fill='url(%23g)'/%3E%3C/svg%3E";
    const imageCache = new Map();
    let activeSplashSrc = '';

    function preloadImage(src) {
        if (!src) return Promise.resolve();
        if (imageCache.has(src)) return imageCache.get(src);
        const p = new Promise((res, rej) => { const i = new Image(); i.onload = () => res(src); i.onerror = rej; i.src = src; });
        imageCache.set(src, p);
        return p;
    }

    function upgradeImg(el, src) {
        if (!el || !src) return;
        el.src = LQIP; el.classList.add('loading');
        preloadImage(src).then(() => { el.src = src; el.classList.remove('loading'); el.classList.add('loaded'); })
                         .catch(() => { el.src = src; el.classList.remove('loading'); });
    }

    function getCover(dvd) { return (dvd.covers && (dvd.covers[lang] || dvd.covers.default)) || ''; }
    function getSplash(dvd) {
        if (dvd.splash_images) return { low: dvd.splash_images.low || LQIP, high: dvd.splash_images.high || '' };
        return { low: '', high: '' };
    }

    function showSplash(dvd) {
        if (!splash) return;
        const { low, high } = getSplash(dvd);
        if (!low && !high) return;
        activeSplashSrc = high;
        splash.style.opacity = '0.7';
        splash.classList.add('is-low-res');
        splash.style.backgroundImage = `url('${low || LQIP}')`;
        if (high) preloadImage(high).then(() => { if (activeSplashSrc !== high) return; splash.style.backgroundImage = `url('${high}')`; splash.classList.remove('is-low-res'); }).catch(() => {});
    }
    function hideSplash() { if (!splash) return; splash.style.opacity = '0'; activeSplashSrc = ''; }

    fetch('/data/dvds.json')
        .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(dvds => {
            if (!dvdContainer) return;
            dvdContainer.innerHTML = '';
            dvds.forEach(dvd => {
                if (dvd.regions && !dvd.regions.includes(lang)) return;
                const cover = getCover(dvd);
                preloadImage(cover).catch(() => {});
                preloadImage(getSplash(dvd).high).catch(() => {});

                const item = document.createElement('div');
                item.className = 'dvd-item';
                const badge = dvd.menu ? `<span class="dvd-menu-badge">🎬 Interactive Menu</span>` : '';
                const tracks = (dvd.tracks || []).map((t, i) => `<li>${i+1}. ${t.title}</li>`).join('');
                item.innerHTML = `
                    <div class="dvd-case">
                        <div class="dvd-spine" style="background-color:${dvd.spine_color||'#333'}" aria-hidden="true"></div>
                        <div class="dvd-face dvd-front"><img class="dvd-cover" src="${LQIP}" alt="${dvd.title} Cover" loading="lazy" decoding="async"></div>
                    </div>
                    <div class="dvd-info"><h3>${dvd.title}</h3>${badge}<ul class="tracklist">${tracks}</ul></div>`;
                upgradeImg(item.querySelector('.dvd-cover'), cover);
                item.addEventListener('mouseenter', () => showSplash(dvd));
                item.addEventListener('mouseleave', hideSplash);
                item.addEventListener('click', () => handleDvdClick(dvd));
                dvdContainer.appendChild(item);
            });
        })
        .catch(err => console.error('DVDs load error:', err));

    async function handleDvdClick(dvd) {
        const seasons = [...new Set((dvd.tracks||[]).filter(t=>!t.is_direct_link && t.season_id).map(t=>t.season_id))];
        const cache = {};
        try {
            await Promise.all(seasons.map(async sid => {
                const r = await fetch(`/${lang}/data/${sid}.json`);
                if (!r.ok) throw new Error(sid);
                const d = await r.json();
                cache[sid] = d[sid] ? d[sid].episodes : d.episodes;
            }));
            const resolved = (dvd.tracks||[]).map(t => {
                if (t.is_direct_link) return { title: t.title, url: t.url };
                const eps = cache[t.season_id]; if (!eps) return null;
                const ep = eps.find(e => e.episode_number === t.episode_number); if (!ep) return null;
                return { title: t.title, url: ep.link };
            }).filter(Boolean);

            if (!resolved.length) { alert('Could not load episodes for this DVD.'); return; }

            if (dvd.menu && typeof window.openDvdMenuOverlay === 'function') {
                window.openDvdMenuOverlay(dvd, resolved);
            } else {
                currentQueue = resolved; currentTrackIndex = 0; startPlayerUI();
            }
        } catch(e) { console.error(e); alert('Error loading DVD data.'); }
    }

    function startPlayerUI() { if(controlsDiv) controlsDiv.style.display='flex'; if(statusDiv) statusDiv.style.display='block'; openModal(); loadTrack(); }
    function openModal() { if(!modal) return; modal.classList.remove('hidden'); modal.style.display='flex'; document.body.style.overflow='hidden'; }
    function closeModal() { if(iframe) iframe.src=''; if(modal){modal.classList.add('hidden');modal.style.display='none';} document.body.style.overflow=''; currentQueue=[]; if(statusDiv) statusDiv.innerHTML=''; if(controlsDiv) controlsDiv.style.display='none'; }

    if(closeBtn) closeBtn.addEventListener('click', closeModal);
    if(btnNext) btnNext.addEventListener('click', ()=>window.nextTrack());
    if(btnPrev) btnPrev.addEventListener('click', ()=>window.prevTrack());
    if(modal) modal.addEventListener('click', e=>{ if(e.target===modal) closeModal(); });
    document.addEventListener('keydown', e=>{ if(!modal||modal.classList.contains('hidden')) return; if(e.key==='Escape') closeModal(); if(e.key==='ArrowRight') window.nextTrack(); if(e.key==='ArrowLeft') window.prevTrack(); });

    function fmtUrl(url) {
        if(!url) return '';
        if(url.includes('drive.google.com')) return url.replace('/view','/preview');
        if(url.includes('youtube.com')||url.includes('youtu.be')){ const sep=url.includes('?')? '&':'?'; return `${url}${sep}autoplay=1&modestbranding=1&rel=0`; }
        return url;
    }

    window.loadTrack = function(){ if(!currentQueue.length) return; const t=currentQueue[currentTrackIndex]; if(iframe) iframe.src=fmtUrl(t.url); if(statusDiv) statusDiv.innerHTML=`Playing: ${t.title} <span style="font-size:0.8em">(${currentTrackIndex+1}/${currentQueue.length})</span>`; if(btnPrev) btnPrev.disabled=currentTrackIndex===0; if(btnNext) btnNext.innerHTML=currentTrackIndex===currentQueue.length-1?'Finish':'Next ⏭'; };
    window.nextTrack = function(){ if(currentTrackIndex<currentQueue.length-1){currentTrackIndex++;loadTrack();}else closeModal(); };
    window.prevTrack = function(){ if(currentTrackIndex>0){currentTrackIndex--;loadTrack();} };
});
