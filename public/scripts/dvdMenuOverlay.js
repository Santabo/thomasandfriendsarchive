/**
 * DVD Menu Overlay System – Thomas Archive
 * Plays the real DVD menu video as background, overlays interactive buttons.
 * Falls back to still image if browser cannot play the VOB file.
 */
(function () {
  'use strict';

  const CSS = `
    #dmo-overlay{display:none;position:fixed;inset:0;z-index:3000;font-family:'Flange BQ Bold',-apple-system,sans-serif;}
    #dmo-overlay.dmo-open{display:block;}
    #dmo-bg-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none;}
    #dmo-bg-image{position:absolute;inset:0;width:100%;height:100%;background-size:cover;background-position:center;z-index:0;display:none;}
    #dmo-bg-video.dmo-err{display:none;}
    #dmo-bg-video.dmo-err~#dmo-bg-image{display:block;}
    #dmo-vignette{position:absolute;inset:0;z-index:1;background:radial-gradient(ellipse at 28% 50%,transparent 25%,rgba(0,0,0,0.42) 100%);pointer-events:none;}
    #dmo-close{position:absolute;top:1rem;right:1rem;z-index:10;width:2.2rem;height:2.2rem;background:rgba(0,0,0,0.55);border:2px solid rgba(255,255,255,0.35);border-radius:50%;color:#fff;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,transform .2s;}
    #dmo-close:hover{background:rgba(180,0,0,.75);transform:rotate(90deg);}

    /* MENU SCREEN */
    #dmo-menu-screen{position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:flex-end;padding-right:clamp(2rem,6vw,7rem);}
    #dmo-menu-panel{display:flex;flex-direction:column;align-items:center;gap:clamp(.3rem,.8vh,.7rem);}
    #dmo-title{text-align:center;user-select:none;display:flex;flex-direction:column;align-items:center;}
    #dmo-brand{font-size:clamp(.7rem,1.4vw,1.05rem);letter-spacing:.15em;color:#fff;text-shadow:1px 1px 0 #003;}
    #dmo-t1,#dmo-t2{font-size:clamp(2.5rem,6vw,4.8rem);line-height:.9;color:#1260cc;-webkit-text-stroke:clamp(2px,.35vw,3.5px) #09256a;paint-order:stroke fill;text-shadow:3px 3px 0 rgba(0,0,0,.45);letter-spacing:.03em;}
    #dmo-tamp{font-size:clamp(.85rem,1.8vw,1.5rem);color:#f5c518;-webkit-text-stroke:1px #9a7a00;margin:-.1em 0;}
    #dmo-hex-wrap{position:relative;width:clamp(185px,24vw,340px);}
    #dmo-hex-svg{width:100%;display:block;}
    #dmo-hex-btns{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:19% 13% 21%;}
    .dmo-mb{width:100%;background:none;border:none;font-family:inherit;font-size:clamp(.6rem,1.25vw,.9rem);letter-spacing:.07em;text-transform:uppercase;color:#fff;text-shadow:1px 1px 3px rgba(0,0,0,.75);cursor:pointer;padding:.27em .4em;border-radius:3px;text-align:center;user-select:none;transition:color .12s,text-shadow .12s,transform .1s;}
    .dmo-mb:hover{color:#f5c518;text-shadow:0 0 14px rgba(255,200,0,.85),1px 1px 3px rgba(0,0,0,.8);transform:scale(1.07);}
    .dmo-mb:active{transform:scale(.96);}
    .dmo-mb[disabled]{opacity:.38;cursor:default;pointer-events:none;}

    /* SUBSCREEN */
    #dmo-sub{position:absolute;inset:0;z-index:5;background:rgba(0,0,0,.88);backdrop-filter:blur(6px) saturate(.7);display:flex;align-items:center;justify-content:center;}
    #dmo-sub-panel{background:linear-gradient(155deg,#0d3a6e 0%,#071e3d 100%);border:3px solid #4ab8f0;border-radius:18px;padding:clamp(1.2rem,3vw,2.2rem) clamp(1.4rem,4vw,2.8rem);max-width:560px;width:92vw;box-shadow:0 12px 48px rgba(0,0,0,.85);max-height:90vh;overflow-y:auto;}
    #dmo-sub-title{font-size:clamp(1.1rem,3.2vw,1.85rem);color:#f5c518;letter-spacing:.09em;text-align:center;margin-bottom:1rem;text-shadow:2px 2px 0 rgba(0,0,0,.5);border-bottom:none;}
    #dmo-sub-list{list-style:none;padding:0;display:flex;flex-direction:column;gap:.38rem;}
    #dmo-sub-list li button{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(74,184,240,.25);border-radius:8px;color:#fff;font-family:inherit;font-size:clamp(.76rem,1.35vw,.9rem);padding:.52em .9em;cursor:pointer;text-align:left;display:flex;align-items:center;gap:.6em;transition:background .13s,border-color .13s,transform .1s;}
    #dmo-sub-list li button:hover{background:rgba(74,184,240,.17);border-color:#4ab8f0;transform:translateX(5px);}
    .dmo-en{font-size:1.05em;color:#f5c518;min-width:1.7em;text-align:center;}
    #dmo-sub-back{display:block;margin:1rem auto 0;background:rgba(255,255,255,.09);border:2px solid rgba(255,255,255,.28);border-radius:8px;color:#fff;font-family:inherit;font-size:.8rem;padding:.46em 1.4em;cursor:pointer;letter-spacing:.05em;transition:background .13s;}
    #dmo-sub-back:hover{background:rgba(255,255,255,.18);}

    /* PLAYER */
    #dmo-player{position:absolute;inset:0;z-index:4;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.6rem;}
    #dmo-iframe{width:min(96vw,170vh);aspect-ratio:16/9;border:none;border-radius:6px;background:#000;}
    #dmo-pstatus{color:rgba(255,255,255,.62);font-size:.82rem;text-align:center;}
    #dmo-pbar{display:flex;align-items:center;gap:.7rem;flex-wrap:wrap;justify-content:center;}
    .dmo-pb{background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.28);border-radius:8px;color:#fff;font-family:inherit;font-size:.8rem;padding:.46em 1.05em;cursor:pointer;transition:background .13s;}
    .dmo-pb:hover{background:rgba(255,255,255,.22);}
    .dmo-pb:disabled{opacity:.28;cursor:default;}
    #dmo-pmenu{background:rgba(0,70,150,.5);border-color:rgba(74,184,240,.5);}
    #dmo-pmenu:hover{background:rgba(0,70,150,.8);}
    #dmo-pclose{background:rgba(150,0,0,.5);border-color:rgba(255,80,80,.5);}
    #dmo-pclose:hover{background:rgba(150,0,0,.85);}
    .dmo-hidden{display:none!important;}

    /* DVD menu badge on case */
    .dvd-menu-badge{display:inline-block;margin:.2rem 0 .4rem;background:#005eb8;color:#fff;font-size:.68rem;padding:.18em .6em;border-radius:20px;font-weight:bold;letter-spacing:.04em;}
  `;

  function injectStyles() {
    if (document.getElementById('dmo-styles')) return;
    const s = document.createElement('style');
    s.id = 'dmo-styles'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  function buildOverlay() {
    if (document.getElementById('dmo-overlay')) return;
    const el = document.createElement('div');
    el.id = 'dmo-overlay';
    el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true');
    el.innerHTML = `
      <video id="dmo-bg-video" autoplay muted loop playsinline></video>
      <div id="dmo-bg-image"></div>
      <div id="dmo-vignette"></div>
      <button id="dmo-close" aria-label="Close">✕</button>

      <div id="dmo-menu-screen">
        <div id="dmo-menu-panel">
          <div id="dmo-title">
            <span id="dmo-brand">THOMAS &amp; FRIENDS</span>
            <span id="dmo-t1"></span>
            <span id="dmo-tamp"></span>
            <span id="dmo-t2"></span>
          </div>
          <div id="dmo-hex-wrap">
            <svg id="dmo-hex-svg" viewBox="0 0 300 340" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="dmoG" cx="50%" cy="38%" r="62%">
                  <stop offset="0%" stop-color="#2d94e8"/>
                  <stop offset="100%" stop-color="#08316a"/>
                </radialGradient>
                <pattern id="dmoP" x="0" y="0" width="20" height="23.1" patternUnits="userSpaceOnUse">
                  <polygon points="10,0 20,5.77 20,17.32 10,23.1 0,17.32 0,5.77" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.6"/>
                </pattern>
              </defs>
              <polygon points="150,5 295,87.5 295,252.5 150,335 5,252.5 5,87.5" fill="url(#dmoG)" stroke="#5ac8fa" stroke-width="4.5"/>
              <polygon points="150,5 295,87.5 295,252.5 150,335 5,252.5 5,87.5" fill="url(#dmoP)"/>
              <polygon points="150,20 280,92 280,248 150,320 20,248 20,92" fill="none" stroke="rgba(255,255,255,0.13)" stroke-width="1.5"/>
            </svg>
            <div id="dmo-hex-btns">
              <button class="dmo-mb" id="dmo-play-all">PLAY ALL</button>
              <button class="dmo-mb" id="dmo-sel-ep">SELECT AN EPISODE</button>
              <button class="dmo-mb" id="dmo-bonus">BONUS FEATURES</button>
              <button class="dmo-mb" disabled>SUBTITLES ON / OFF</button>
            </div>
          </div>
        </div>
      </div>

      <div id="dmo-sub" class="dmo-hidden">
        <div id="dmo-sub-panel">
          <h2 id="dmo-sub-title"></h2>
          <ul id="dmo-sub-list"></ul>
          <button id="dmo-sub-back">◀ BACK TO MENU</button>
        </div>
      </div>

      <div id="dmo-player" class="dmo-hidden">
        <iframe id="dmo-iframe" allow="autoplay; fullscreen" allowfullscreen title="Episode player"></iframe>
        <div id="dmo-pstatus"></div>
        <div id="dmo-pbar">
          <button class="dmo-pb" id="dmo-pprev">⏮ Prev</button>
          <button class="dmo-pb" id="dmo-pmenu">☰ Menu</button>
          <button class="dmo-pb" id="dmo-pnext">Next ⏭</button>
          <button class="dmo-pb" id="dmo-pclose">✕ Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(el);
  }

  const S = { dvd:null, tracks:[], bonus:[], queue:[], qi:0 };
  const g = id => document.getElementById(id);

  function fmtUrl(url) {
    if (!url) return '';
    if (url.includes('drive.google.com') && !url.includes('/preview')) return url.replace('/view','/preview');
    return url;
  }

  function showMenu() {
    g('dmo-menu-screen').classList.remove('dmo-hidden');
    g('dmo-sub').classList.add('dmo-hidden');
    g('dmo-player').classList.add('dmo-hidden');
    g('dmo-iframe').src = '';
    const v = g('dmo-bg-video');
    if (v && !v.classList.contains('dmo-err')) v.play().catch(()=>{});
  }

  function showSub(title, items, onPick) {
    g('dmo-sub-title').textContent = title;
    const list = g('dmo-sub-list');
    list.innerHTML = '';
    items.forEach((item, i) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.innerHTML = `<span class="dmo-en">${i+1}</span>${item.title}`;
      btn.onclick = () => onPick(i);
      li.appendChild(btn); list.appendChild(li);
    });
    g('dmo-menu-screen').classList.add('dmo-hidden');
    g('dmo-sub').classList.remove('dmo-hidden');
    g('dmo-player').classList.add('dmo-hidden');
  }

  function showPlayer() {
    g('dmo-menu-screen').classList.add('dmo-hidden');
    g('dmo-sub').classList.add('dmo-hidden');
    g('dmo-player').classList.remove('dmo-hidden');
    const v = g('dmo-bg-video'); if (v) v.pause();
    renderTrack();
  }

  function playQueue(tracks, idx) { S.queue=tracks; S.qi=idx||0; showPlayer(); }

  function renderTrack() {
    const t = S.queue[S.qi]; if(!t) return;
    g('dmo-iframe').src = fmtUrl(t.url);
    g('dmo-pstatus').textContent = `▶  ${t.title}  (${S.qi+1} / ${S.queue.length})`;
    g('dmo-pprev').disabled = S.qi===0;
    g('dmo-pnext').textContent = S.qi===S.queue.length-1 ? '✓ Finish' : 'Next ⏭';
  }

  function nextT() { if(S.qi<S.queue.length-1){S.qi++;renderTrack();}else showMenu(); }
  function prevT() { if(S.qi>0){S.qi--;renderTrack();} }

  function close() {
    g('dmo-overlay').classList.remove('dmo-open');
    g('dmo-iframe').src='';
    const v=g('dmo-bg-video'); if(v){v.pause();v.removeAttribute('src');v.load();}
    document.body.style.overflow='';
  }

  function applyTheme(dvd) {
    const m = dvd.menu||{};
    const vid = g('dmo-bg-video');
    const bgImg = g('dmo-bg-image');

    if (m.video_url) {
      // Try multiple MIME types — VOB is MPEG-2, may work in Firefox/Safari
      vid.innerHTML = `
        <source src="${m.video_url}" type="video/mpeg">
        <source src="${m.video_url}" type="video/mp4">
      `;
      vid.load();
      const tryPlay = () => vid.play().catch(() => vid.classList.add('dmo-err'));
      vid.addEventListener('canplay', tryPlay, { once: true });
      vid.addEventListener('error', () => vid.classList.add('dmo-err'), { once: true });
      setTimeout(() => { if(vid.readyState<2) vid.classList.add('dmo-err'); }, 4000);
    } else {
      vid.classList.add('dmo-err');
    }

    if (m.background_image) bgImg.style.backgroundImage = `url('${m.background_image}')`;

    g('dmo-t1').textContent = m.title_line1 || dvd.title;
    g('dmo-tamp').textContent = m.title_amp || '';
    g('dmo-t2').textContent = m.title_line2 || '';
    g('dmo-tamp').style.display = m.title_amp ? '' : 'none';
    g('dmo-t2').style.display = m.title_line2 ? '' : 'none';
  }

  let bound = false;
  function bindEvents() {
    if (bound) return; bound = true;
    g('dmo-play-all').onclick = () => playQueue(S.tracks, 0);
    g('dmo-sel-ep').onclick = () => showSub('🦕 SELECT AN EPISODE', S.tracks, i => playQueue(S.tracks, i));
    g('dmo-bonus').onclick = () => {
      if (!S.bonus.length) return;
      if (S.bonus.length===1) playQueue(S.bonus,0);
      else showSub('⭐ BONUS FEATURES', S.bonus, i => playQueue(S.bonus, i));
    };
    g('dmo-sub-back').onclick = showMenu;
    g('dmo-pmenu').onclick = showMenu;
    g('dmo-pprev').onclick = prevT;
    g('dmo-pnext').onclick = nextT;
    g('dmo-close').onclick = close;
    g('dmo-pclose').onclick = close;
    document.addEventListener('keydown', e => {
      if (!g('dmo-overlay').classList.contains('dmo-open')) return;
      const playing = !g('dmo-player').classList.contains('dmo-hidden');
      if (e.key==='Escape') { if(playing) showMenu(); else close(); }
      if (e.key==='ArrowRight' && playing) nextT();
      if (e.key==='ArrowLeft' && playing) prevT();
    });
  }

  window.openDvdMenuOverlay = function(dvd, resolvedTracks) {
    injectStyles(); buildOverlay(); bindEvents();
    S.dvd=dvd; S.tracks=resolvedTracks; S.bonus=(dvd.menu&&dvd.menu.bonus_tracks)||[]; S.queue=[]; S.qi=0;
    // Reset video error state for fresh open
    const v=g('dmo-bg-video'); if(v) v.classList.remove('dmo-err');
    applyTheme(dvd); showMenu();
    g('dmo-overlay').classList.add('dmo-open');
    document.body.style.overflow='hidden';
  };
})();
