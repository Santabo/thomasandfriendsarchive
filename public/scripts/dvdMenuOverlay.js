/**
 * DVD Menu Overlay System – Thomas Archive
 *
 * Clean dark overlay with only the hexagon menu panel.
 * No background image spam — just the hex buttons and title.
 */
(function () {
  'use strict';

  var CSS = [
    /* ── Overlay shell ── */
    '#dmo-overlay{display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:3000;font-family:\'Flange BQ Bold\',-apple-system,BlinkMacSystemFont,sans-serif;overflow:hidden;}',
    '#dmo-overlay.dmo-open{display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;}',

    /* Dark backdrop — no image, clean */
    '#dmo-bg{position:absolute;top:0;left:0;right:0;bottom:0;z-index:0;background:radial-gradient(ellipse 90% 80% at 50% 50%,#0a2a5e 0%,#040e2a 100%);}',

    /* Close button */
    '#dmo-close{position:absolute;top:14px;right:14px;z-index:20;width:38px;height:38px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.22);border-radius:50%;color:rgba(255,255,255,0.75);font-size:17px;cursor:pointer;line-height:1;padding:0;transition:background 0.2s,color 0.2s;}',
    '#dmo-close:hover{background:rgba(180,0,0,0.75);color:#fff;border-color:rgba(255,100,100,0.5);}',

    /* ── MENU SCREEN ── */
    '#dmo-menu-screen{position:absolute;top:0;left:0;right:0;bottom:0;z-index:2;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;padding:20px;}',

    '#dmo-menu-panel{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:center;-ms-flex-align:center;align-items:center;gap:16px;z-index:1;}',

    /* Title above hex */
    '#dmo-title{text-align:center;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;}',
    '#dmo-brand{display:block;font-size:11px;letter-spacing:.2em;color:rgba(255,255,255,0.5);text-transform:uppercase;margin-bottom:4px;}',
    '#dmo-t1,#dmo-t2{display:block;font-size:clamp(32px,5.5vw,62px);line-height:.92;color:#1a6fd4;text-shadow:0 0 30px rgba(30,120,220,0.5),2px 2px 0 rgba(0,0,0,0.6);letter-spacing:.03em;}',
    '#dmo-tamp{display:block;font-size:clamp(13px,2vw,20px);color:#f5c518;margin:2px 0;text-shadow:0 0 12px rgba(245,197,24,0.4);}',

    /* Hex panel */
    '#dmo-hex-wrap{position:relative;width:clamp(200px,28vw,290px);}',
    '#dmo-hex-svg{width:100%;display:block;filter:drop-shadow(0 8px 24px rgba(0,80,200,0.5));}',
    '#dmo-hex-btns{position:absolute;top:0;left:0;right:0;bottom:0;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;padding:16% 14% 19%;}',
    '.dmo-mb{width:100%;background:transparent;border:none;font-family:inherit;font-size:clamp(11px,1.3vw,13px);letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,0.9);cursor:pointer;padding:clamp(4px,0.7vh,7px) 4px;text-align:center;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;transition:color 0.15s;}',
    '.dmo-mb:hover{color:#f5c518;text-shadow:0 0 12px rgba(255,200,0,0.7);}',
    '.dmo-mb:active{opacity:.75;}',
    '.dmo-mb[disabled]{opacity:.3;cursor:default;}',

    /* ── SUB-SCREEN (episode list) ── */
    '#dmo-sub{position:absolute;top:0;left:0;right:0;bottom:0;z-index:5;background:rgba(4,14,42,0.92);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;padding:16px;overflow-y:auto;}',
    '#dmo-sub-panel{background:linear-gradient(160deg,#0d3a6e 0%,#061428 100%);border:1px solid rgba(74,184,240,0.35);border-radius:14px;padding:clamp(18px,3vw,28px) clamp(20px,3.5vw,32px);max-width:500px;width:100%;box-shadow:0 16px 56px rgba(0,0,0,0.7);max-height:88vh;overflow-y:auto;}',
    '#dmo-sub-title{font-size:clamp(16px,2.5vw,22px);color:#f5c518;letter-spacing:.08em;text-align:center;margin-bottom:14px;border:none;}',
    '#dmo-sub-list{list-style:none;padding:0;margin:0;}',
    '#dmo-sub-list li{margin-bottom:4px;}',
    '#dmo-sub-list li button{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(74,184,240,0.18);border-radius:7px;color:rgba(255,255,255,0.88);font-family:inherit;font-size:clamp(12px,1.3vw,14px);padding:8px 12px;cursor:pointer;text-align:left;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;gap:10px;transition:background 0.12s,border-color 0.12s;}',
    '#dmo-sub-list li button:hover{background:rgba(74,184,240,0.14);border-color:rgba(74,184,240,0.5);}',
    '.dmo-en{font-size:13px;color:#f5c518;min-width:22px;text-align:center;-webkit-box-flex:0;-ms-flex:none;flex:none;opacity:.8;}',
    '#dmo-sub-back{display:block;margin:14px auto 0;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);border-radius:7px;color:rgba(255,255,255,0.7);font-family:inherit;font-size:12px;padding:7px 20px;cursor:pointer;transition:background 0.12s;}',
    '#dmo-sub-back:hover{background:rgba(255,255,255,0.14);color:#fff;}',

    /* ── PLAYER SCREEN ── */
    '#dmo-player{position:absolute;top:0;left:0;right:0;bottom:0;z-index:4;background:#000;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;padding:8px 8px 66px;}',
    '#dmo-iframe-wrap{width:100%;-webkit-box-flex:1;-ms-flex:1 1 auto;flex:1 1 auto;min-height:0;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;}',
    '#dmo-iframe{max-width:100%;max-height:100%;width:100%;border:none;background:#000;}',
    '#dmo-pfoot{position:absolute;bottom:0;left:0;right:0;height:60px;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;gap:5px;background:rgba(0,0,0,0.85);padding:4px 8px;border-top:1px solid rgba(255,255,255,0.07);}',
    '#dmo-pstatus{color:rgba(255,255,255,0.55);font-size:11px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:92vw;}',
    '#dmo-pbar{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;gap:6px;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;}',
    '.dmo-pb{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.22);border-radius:5px;color:rgba(255,255,255,0.85);font-family:inherit;font-size:12px;padding:4px 13px;cursor:pointer;white-space:nowrap;transition:background 0.12s;}',
    '.dmo-pb:hover{background:rgba(255,255,255,0.2);}',
    '.dmo-pb:disabled{opacity:.25;cursor:default;}',
    '#dmo-pmenu{background:rgba(0,55,130,0.45);border-color:rgba(74,184,240,0.4);}',
    '#dmo-pmenu:hover{background:rgba(0,55,130,0.75);}',
    '#dmo-pclose{background:rgba(130,0,0,0.45);border-color:rgba(255,70,70,0.4);}',
    '#dmo-pclose:hover{background:rgba(130,0,0,0.8);}',

    /* Utilities */
    '.dmo-hidden{display:none!important;}',
    '.dvd-menu-badge{display:inline-block;margin:3px 0 5px;background:#005eb8;color:#fff;font-size:11px;padding:2px 8px;border-radius:20px;letter-spacing:.04em;}',

    /* Mobile */
    '@media(max-width:500px){',
    '#dmo-hex-wrap{width:min(240px,72vw);}',
    '}',
    '@media(max-height:460px){',
    '#dmo-title{display:none;}',
    '#dmo-hex-wrap{width:min(175px,30vw);}',
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
                  '<stop offset="0%" stop-color="#2a8de0"/>',
                  '<stop offset="100%" stop-color="#06285a"/>',
                '</radialGradient>',
                '<pattern id="dmoP" x="0" y="0" width="20" height="23.1" patternUnits="userSpaceOnUse">',
                  '<polygon points="10,0 20,5.77 20,17.32 10,23.1 0,17.32 0,5.77" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.7"/>',
                '</pattern>',
              '</defs>',
              '<polygon points="150,5 295,87.5 295,252.5 150,335 5,252.5 5,87.5" fill="url(#dmoG)" stroke="#4ab8f0" stroke-width="3.5"/>',
              '<polygon points="150,5 295,87.5 295,252.5 150,335 5,252.5 5,87.5" fill="url(#dmoP)"/>',
              '<polygon points="150,18 283,91 283,249 150,322 17,249 17,91" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1.2"/>',
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
    if (url.indexOf('drive.google.com') !== -1) {
      var u = url.indexOf('/preview') === -1 ? url.replace('/view', '/preview') : url;
      var sep = u.indexOf('?') !== -1 ? '&' : '?';
      return u + sep + 'rm=minimal';
    }
    if (url.indexOf('youtube.com') !== -1 || url.indexOf('youtu.be') !== -1) {
      var sep2 = url.indexOf('?') !== -1 ? '&' : '?';
      return url + sep2 + 'autoplay=1&rel=0&vq=hd1080';
    }
    return url;
  }

  /* ── iframe sizing: 16:9 within available space ── */
  function sizeIframe() {
    var wrap = g('dmo-iframe-wrap');
    var frame = g('dmo-iframe');
    if (!wrap || !frame) return;
    var wh = wrap.clientHeight || (window.innerHeight - 66);
    var ww = wrap.clientWidth  || window.innerWidth;
    var h = Math.min(wh, ww * 9 / 16);
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

  /* ── Theme: set title only, no background image ── */
  function applyTheme(dvd) {
    var m = dvd.menu || {};
    g('dmo-t1').textContent  = m.title_line1 || dvd.title;
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
    g('dmo-sel-ep').onclick   = function() { showSub('\ud83c\udfa5 SELECT AN EPISODE', S.tracks, function(i) { playQueue(S.tracks, i); }); };
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
      if (key === 'Escape' || key === 27)        { if (playing) showMenu(); else closeOverlay(); }
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
