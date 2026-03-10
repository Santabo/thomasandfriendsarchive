/**
 * DVD Menu Overlay System – Thomas Archive
 *
 * - Uses still background image (no video - browser compat)
 * - Hex button panel overlaid on right side matching real disc
 * - Player layout always fits screen with controls visible
 * - Works on old browsers (no clamp, aspect-ratio, etc in critical paths)
 */
(function () {
  'use strict';

  var CSS = [
    /* Overlay container */
    '#dmo-overlay{display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:3000;font-family:\'Flange BQ Bold\',-apple-system,BlinkMacSystemFont,sans-serif;overflow:hidden;}',
    '#dmo-overlay.dmo-open{display:block;}',

    /* Background image - always used, fills screen */
    '#dmo-bg{position:absolute;top:0;left:0;right:0;bottom:0;background-size:cover;background-position:center center;background-repeat:no-repeat;z-index:0;}',

    /* Gradient overlay to darken left side slightly so menu panel pops */
    '#dmo-vignette{position:absolute;top:0;left:0;right:0;bottom:0;z-index:1;pointer-events:none;background:linear-gradient(to left,rgba(0,0,0,0.18) 0%,transparent 55%);}',

    /* Close button */
    '#dmo-close{position:absolute;top:12px;right:12px;z-index:20;width:36px;height:36px;background:rgba(0,0,0,0.55);border:2px solid rgba(255,255,255,0.38);border-radius:50%;color:#fff;font-size:16px;cursor:pointer;line-height:1;padding:0;}',
    '#dmo-close:hover{background:rgba(160,0,0,0.75);}',

    /* MENU SCREEN */
    '#dmo-menu-screen{position:absolute;top:0;left:0;right:0;bottom:0;z-index:2;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:end;-ms-flex-pack:end;justify-content:flex-end;padding-right:5vw;}',
    '#dmo-menu-panel{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:center;-ms-flex-align:center;align-items:center;gap:8px;}',

    /* Title text */
    '#dmo-title{text-align:center;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:center;-ms-flex-align:center;align-items:center;}',
    '#dmo-brand{font-size:14px;letter-spacing:.15em;color:#fff;text-shadow:1px 1px 0 #003;}',
    '#dmo-t1,#dmo-t2{font-size:72px;line-height:.9;color:#1260cc;-webkit-text-stroke:3px #09256a;text-shadow:3px 3px 0 rgba(0,0,0,.45);letter-spacing:.03em;}',
    '#dmo-tamp{font-size:22px;color:#f5c518;-webkit-text-stroke:1px #9a7a00;margin:0;}',

    /* Hex panel */
    '#dmo-hex-wrap{position:relative;width:280px;}',
    '#dmo-hex-svg{width:100%;display:block;}',
    '#dmo-hex-btns{position:absolute;top:0;left:0;right:0;bottom:0;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;padding:54px 36px 58px;}',
    '.dmo-mb{width:100%;background:transparent;border:none;font-family:inherit;font-size:13px;letter-spacing:.07em;text-transform:uppercase;color:#fff;text-shadow:1px 1px 3px rgba(0,0,0,.75);cursor:pointer;padding:5px 4px;text-align:center;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;}',
    '.dmo-mb:hover{color:#f5c518;text-shadow:0 0 14px rgba(255,200,0,.85),1px 1px 3px rgba(0,0,0,.8);}',
    '.dmo-mb:active{opacity:.8;}',
    '.dmo-mb[disabled]{opacity:.38;cursor:default;}',

    /* Sub-screen (episode list) */
    '#dmo-sub{position:absolute;top:0;left:0;right:0;bottom:0;z-index:5;background:rgba(0,0,0,.88);display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;overflow-y:auto;}',
    '#dmo-sub-panel{background:linear-gradient(155deg,#0d3a6e,#071e3d);border:3px solid #4ab8f0;border-radius:16px;padding:24px 32px;max-width:520px;width:90%;box-shadow:0 12px 48px rgba(0,0,0,.85);max-height:88vh;overflow-y:auto;}',
    '#dmo-sub-title{font-size:26px;color:#f5c518;letter-spacing:.09em;text-align:center;margin-bottom:14px;text-shadow:2px 2px 0 rgba(0,0,0,.5);border:none;}',
    '#dmo-sub-list{list-style:none;padding:0;margin:0;}',
    '#dmo-sub-list li{margin-bottom:6px;}',
    '#dmo-sub-list li button{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(74,184,240,.25);border-radius:8px;color:#fff;font-family:inherit;font-size:14px;padding:10px 14px;cursor:pointer;text-align:left;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;gap:10px;}',
    '#dmo-sub-list li button:hover{background:rgba(74,184,240,.17);border-color:#4ab8f0;}',
    '.dmo-en{font-size:15px;color:#f5c518;min-width:26px;text-align:center;}',
    '#dmo-sub-back{display:block;margin:14px auto 0;background:rgba(255,255,255,.09);border:2px solid rgba(255,255,255,.28);border-radius:8px;color:#fff;font-family:inherit;font-size:13px;padding:8px 22px;cursor:pointer;}',
    '#dmo-sub-back:hover{background:rgba(255,255,255,.18);}',

    /* Player screen - key fix: use calc to leave room for controls */
    '#dmo-player{position:absolute;top:0;left:0;right:0;bottom:0;z-index:4;background:#000;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;padding:8px 8px 70px;}',
    '#dmo-iframe-wrap{width:100%;-webkit-box-flex:1;-ms-flex:1 1 auto;flex:1 1 auto;min-height:0;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;}',
    '#dmo-iframe{max-width:100%;max-height:100%;width:100%;border:none;border-radius:6px;background:#000;}',
    '#dmo-pfoot{position:absolute;bottom:0;left:0;right:0;height:62px;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;gap:4px;background:rgba(0,0,0,.7);padding:4px 8px;}',
    '#dmo-pstatus{color:rgba(255,255,255,.65);font-size:12px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:90vw;}',
    '#dmo-pbar{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;gap:8px;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;}',
    '.dmo-pb{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.3);border-radius:6px;color:#fff;font-family:inherit;font-size:12px;padding:5px 14px;cursor:pointer;white-space:nowrap;}',
    '.dmo-pb:hover{background:rgba(255,255,255,.24);}',
    '.dmo-pb:disabled{opacity:.28;cursor:default;}',
    '#dmo-pmenu{background:rgba(0,60,140,.5);border-color:rgba(74,184,240,.5);}',
    '#dmo-pmenu:hover{background:rgba(0,60,140,.8);}',
    '#dmo-pclose{background:rgba(140,0,0,.5);border-color:rgba(255,70,70,.5);}',
    '#dmo-pclose:hover{background:rgba(140,0,0,.85);}',

    /* Utilities */
    '.dmo-hidden{display:none!important;}',
    '.dvd-menu-badge{display:inline-block;margin:3px 0 5px;background:#005eb8;color:#fff;font-size:11px;padding:2px 8px;border-radius:20px;letter-spacing:.04em;}',

    /* Responsive: small screens / portrait */
    '@media(max-width:600px){',
    '#dmo-t1,#dmo-t2{font-size:44px;}',
    '#dmo-tamp{font-size:14px;}',
    '#dmo-hex-wrap{width:200px;}',
    '#dmo-hex-btns{padding:38px 26px 42px;}',
    '.dmo-mb{font-size:10px;padding:3px 2px;}',
    '}',
    '@media(max-height:500px){',
    '#dmo-title{display:none;}',
    '#dmo-hex-wrap{width:190px;}',
    '}'
  ].join('');

  function injectStyles() {
    if (document.getElementById('dmo-styles')) return;
    var s = document.createElement('style');
    s.id = 'dmo-styles';
    s.textContent !== undefined ? (s.textContent = CSS) : (s.styleSheet.cssText = CSS);
    document.head.appendChild(s);
  }

  function buildOverlay() {
    if (document.getElementById('dmo-overlay')) return;
    var el = document.createElement('div');
    el.id = 'dmo-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.innerHTML = [
      '<div id="dmo-bg"></div>',
      '<div id="dmo-vignette"></div>',
      '<button id="dmo-close" aria-label="Close DVD menu">\u2715</button>',

      /* MENU */
      '<div id="dmo-menu-screen">',
        '<div id="dmo-menu-panel">',
          '<div id="dmo-title">',
            '<span id="dmo-brand">THOMAS &amp; FRIENDS</span>',
            '<span id="dmo-t1"></span>',
            '<span id="dmo-tamp"></span>',
            '<span id="dmo-t2"></span>',
          '</div>',
          '<div id="dmo-hex-wrap">',
            '<svg id="dmo-hex-svg" viewBox="0 0 300 340" xmlns="http://www.w3.org/2000/svg">',
              '<defs>',
                '<radialGradient id="dmoG" cx="50%" cy="38%" r="62%">',
                  '<stop offset="0%" stop-color="#2d94e8"/>',
                  '<stop offset="100%" stop-color="#08316a"/>',
                '</radialGradient>',
                '<pattern id="dmoP" x="0" y="0" width="20" height="23.1" patternUnits="userSpaceOnUse">',
                  '<polygon points="10,0 20,5.77 20,17.32 10,23.1 0,17.32 0,5.77" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.6"/>',
                '</pattern>',
              '</defs>',
              '<polygon points="150,5 295,87.5 295,252.5 150,335 5,252.5 5,87.5" fill="url(#dmoG)" stroke="#5ac8fa" stroke-width="4.5"/>',
              '<polygon points="150,5 295,87.5 295,252.5 150,335 5,252.5 5,87.5" fill="url(#dmoP)"/>',
              '<polygon points="150,20 280,92 280,248 150,320 20,248 20,92" fill="none" stroke="rgba(255,255,255,0.13)" stroke-width="1.5"/>',
            '</svg>',
            '<div id="dmo-hex-btns">',
              '<button class="dmo-mb" id="dmo-play-all">PLAY ALL</button>',
              '<button class="dmo-mb" id="dmo-sel-ep">SELECT AN EPISODE</button>',
              '<button class="dmo-mb" id="dmo-bonus">BONUS FEATURES</button>',
              '<button class="dmo-mb" disabled>SUBTITLES ON / OFF</button>',
            '</div>',
          '</div>',
        '</div>',
      '</div>',

      /* SUB-SCREEN */
      '<div id="dmo-sub" class="dmo-hidden">',
        '<div id="dmo-sub-panel">',
          '<h2 id="dmo-sub-title"></h2>',
          '<ul id="dmo-sub-list"></ul>',
          '<button id="dmo-sub-back">\u25c4 BACK TO MENU</button>',
        '</div>',
      '</div>',

      /* PLAYER */
      '<div id="dmo-player" class="dmo-hidden">',
        '<div id="dmo-iframe-wrap">',
          '<iframe id="dmo-iframe" allow="autoplay; fullscreen" allowfullscreen title="Episode player"></iframe>',
        '</div>',
        '<div id="dmo-pfoot">',
          '<div id="dmo-pstatus"></div>',
          '<div id="dmo-pbar">',
            '<button class="dmo-pb" id="dmo-pprev">\u23ee Prev</button>',
            '<button class="dmo-pb" id="dmo-pmenu">\u2630 Menu</button>',
            '<button class="dmo-pb" id="dmo-pnext">Next \u23ed</button>',
            '<button class="dmo-pb" id="dmo-pclose">\u2715 Close</button>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
    document.body.appendChild(el);
  }

  /* ── State ── */
  var S = { dvd: null, tracks: [], bonus: [], queue: [], qi: 0 };
  function g(id) { return document.getElementById(id); }

  function fmtUrl(url) {
    if (!url) return '';
    if (url.indexOf('drive.google.com') !== -1 && url.indexOf('/preview') === -1)
      return url.replace('/view', '/preview');
    return url;
  }

  /* ── iframe sizing: fill available height minus footer ── */
  function sizeIframe() {
    var wrap = g('dmo-iframe-wrap');
    var frame = g('dmo-iframe');
    if (!wrap || !frame) return;
    var wh = wrap.clientHeight || window.innerHeight - 70;
    var ww = wrap.clientWidth  || window.innerWidth;
    /* 16:9 fitting */
    var byHeight = wh;
    var byWidth  = ww;
    var h = Math.min(byHeight, byWidth * 9 / 16);
    var w = h * 16 / 9;
    frame.style.width  = Math.floor(w) + 'px';
    frame.style.height = Math.floor(h) + 'px';
  }

  /* ── Screen transitions ── */
  function showMenu() {
    g('dmo-menu-screen').classList.remove('dmo-hidden');
    g('dmo-sub').classList.add('dmo-hidden');
    g('dmo-player').classList.add('dmo-hidden');
    g('dmo-iframe').src = '';
  }

  function showSub(title, items, onPick) {
    g('dmo-sub-title').textContent = title;
    var list = g('dmo-sub-list');
    list.innerHTML = '';
    items.forEach(function(item, i) {
      var li  = document.createElement('li');
      var btn = document.createElement('button');
      var num = document.createElement('span');
      num.className = 'dmo-en';
      num.textContent = i + 1;
      btn.appendChild(num);
      btn.appendChild(document.createTextNode(item.title));
      btn.onclick = function() { onPick(i); };
      li.appendChild(btn);
      list.appendChild(li);
    });
    g('dmo-menu-screen').classList.add('dmo-hidden');
    g('dmo-sub').classList.remove('dmo-hidden');
    g('dmo-player').classList.add('dmo-hidden');
  }

  function showPlayer() {
    g('dmo-menu-screen').classList.add('dmo-hidden');
    g('dmo-sub').classList.add('dmo-hidden');
    g('dmo-player').classList.remove('dmo-hidden');
    /* Wait a tick for layout to settle then size iframe */
    setTimeout(sizeIframe, 50);
    renderTrack();
  }

  function playQueue(tracks, idx) {
    S.queue = tracks;
    S.qi    = idx || 0;
    showPlayer();
  }

  function renderTrack() {
    var t = S.queue[S.qi];
    if (!t) return;
    g('dmo-iframe').src = fmtUrl(t.url);
    g('dmo-pstatus').textContent = '\u25b6  ' + t.title + '  (' + (S.qi + 1) + ' / ' + S.queue.length + ')';
    g('dmo-pprev').disabled = S.qi === 0;
    g('dmo-pnext').textContent = S.qi === S.queue.length - 1 ? '\u2713 Finish' : 'Next \u23ed';
  }

  function nextT() { if (S.qi < S.queue.length - 1) { S.qi++; renderTrack(); } else showMenu(); }
  function prevT() { if (S.qi > 0) { S.qi--; renderTrack(); } }

  function closeOverlay() {
    g('dmo-overlay').classList.remove('dmo-open');
    g('dmo-iframe').src = '';
    document.body.style.overflow = '';
  }

  /* ── Theme ── */
  function applyTheme(dvd) {
    var m = dvd.menu || {};
    /* Always use still image - no video needed */
    if (m.background_image) {
      g('dmo-bg').style.backgroundImage = 'url(\'' + m.background_image + '\')';
    }
    g('dmo-t1').textContent = m.title_line1 || dvd.title;
    g('dmo-tamp').textContent = m.title_amp || '';
    g('dmo-t2').textContent   = m.title_line2 || '';
    g('dmo-tamp').style.display = m.title_amp   ? '' : 'none';
    g('dmo-t2').style.display   = m.title_line2 ? '' : 'none';
  }

  /* ── Events ── */
  var bound = false;
  function bindEvents() {
    if (bound) return;
    bound = true;

    g('dmo-play-all').onclick = function() { playQueue(S.tracks, 0); };
    g('dmo-sel-ep').onclick   = function() { showSub('\ud83e\udd95 SELECT AN EPISODE', S.tracks, function(i) { playQueue(S.tracks, i); }); };
    g('dmo-bonus').onclick    = function() {
      if (!S.bonus.length) return;
      if (S.bonus.length === 1) playQueue(S.bonus, 0);
      else showSub('\u2b50 BONUS FEATURES', S.bonus, function(i) { playQueue(S.bonus, i); });
    };

    g('dmo-sub-back').onclick = showMenu;
    g('dmo-pmenu').onclick    = showMenu;
    g('dmo-pprev').onclick    = prevT;
    g('dmo-pnext').onclick    = nextT;
    g('dmo-close').onclick    = closeOverlay;
    g('dmo-pclose').onclick   = closeOverlay;

    window.addEventListener('resize', function() {
      if (!g('dmo-player').classList.contains('dmo-hidden')) sizeIframe();
    });

    document.addEventListener('keydown', function(e) {
      if (!g('dmo-overlay').classList.contains('dmo-open')) return;
      var playing = !g('dmo-player').classList.contains('dmo-hidden');
      var key = e.key || e.keyCode;
      if (key === 'Escape' || key === 27)       { if (playing) showMenu(); else closeOverlay(); }
      if ((key === 'ArrowRight' || key === 39) && playing) nextT();
      if ((key === 'ArrowLeft'  || key === 37) && playing) prevT();
    });
  }

  /* ── Public API ── */
  window.openDvdMenuOverlay = function(dvd, resolvedTracks) {
    injectStyles();
    buildOverlay();
    bindEvents();

    S.dvd    = dvd;
    S.tracks = resolvedTracks;
    S.bonus  = (dvd.menu && dvd.menu.bonus_tracks) || [];
    S.queue  = [];
    S.qi     = 0;

    applyTheme(dvd);
    showMenu();

    g('dmo-overlay').classList.add('dmo-open');
    document.body.style.overflow = 'hidden';
  };

})();
