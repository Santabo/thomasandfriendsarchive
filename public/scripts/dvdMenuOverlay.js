/**
 * DVD Menu Overlay – Thomas Archive
 *
 * Clean dark overlay: hex panel + title only.
 * No background image. Works on old browsers.
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────────
     Injected CSS — no CSS custom properties here
     (old browsers don't support them in <style> tags
     added by JS), use hard values instead.
  ───────────────────────────────────────────────── */
  var CSS = [
    /* Overlay shell */
    '#dmo-overlay{display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:3000;font-family:\'Flange BQ Bold\',-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif;overflow:hidden;}',
    '#dmo-overlay.dmo-open{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;}',

    /* Dark backdrop */
    '#dmo-bg{position:absolute;top:0;left:0;right:0;bottom:0;z-index:0;background:radial-gradient(ellipse 90% 80% at 50% 50%,#0a2a5e 0%,#040e2a 100%);}',

    /* Close button */
    '#dmo-close{position:absolute;top:14px;right:14px;z-index:20;width:38px;height:38px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:50%;color:rgba(255,255,255,0.7);font-size:18px;cursor:pointer;line-height:1;padding:0;transition:background 0.18s,color 0.18s;}',
    '#dmo-close:hover,#dmo-close:focus-visible{background:rgba(160,0,0,0.75);color:#fff;border-color:rgba(255,100,100,0.4);outline:none;}',

    /* ── MENU SCREEN ── */
    '#dmo-menu-screen{position:absolute;top:0;left:0;right:0;bottom:0;z-index:2;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;padding:20px;}',

    '#dmo-menu-panel{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:center;-ms-flex-align:center;align-items:center;gap:14px;z-index:1;}',

    /* Title */
    '#dmo-title{text-align:center;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;}',
    '#dmo-brand{display:block;font-size:11px;letter-spacing:.2em;color:rgba(255,255,255,0.45);text-transform:uppercase;margin-bottom:6px;}',
    '#dmo-t1,#dmo-t2{display:block;font-size:56px;line-height:.9;color:#1a6fd4;text-shadow:0 0 28px rgba(30,120,220,0.45),2px 2px 0 rgba(0,0,0,0.55);letter-spacing:.03em;}',
    '#dmo-tamp{display:block;font-size:18px;color:#f5c518;margin:3px 0;text-shadow:0 0 10px rgba(245,197,24,0.35);}',

    /* Hex panel */
    '#dmo-hex-wrap{position:relative;width:270px;}',
    '#dmo-hex-svg{width:100%;display:block;-webkit-filter:drop-shadow(0 8px 22px rgba(0,80,200,0.45));filter:drop-shadow(0 8px 22px rgba(0,80,200,0.45));}',
    '#dmo-hex-btns{position:absolute;top:0;left:0;right:0;bottom:0;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;padding:15% 13% 18%;}',

    '.dmo-mb{width:100%;background:transparent;border:none;font-family:inherit;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,0.88);cursor:pointer;padding:6px 4px;text-align:center;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;transition:color 0.15s;border-radius:4px;}',
    '.dmo-mb:hover{color:#f5c518;text-shadow:0 0 10px rgba(255,200,0,0.65);}',
    '.dmo-mb:focus-visible{outline:2px solid rgba(245,197,24,0.7);outline-offset:2px;}',
    '.dmo-mb:active{opacity:.75;}',
    '.dmo-mb[disabled]{opacity:.28;cursor:default;}',

    /* ── SUB-SCREEN ── */
    '#dmo-sub{position:absolute;top:0;left:0;right:0;bottom:0;z-index:5;background:rgba(4,14,42,0.93);display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;padding:16px;overflow-y:auto;}',
    '#dmo-sub-panel{background:linear-gradient(160deg,#0d3a6e 0%,#061428 100%);border:1px solid rgba(74,184,240,0.3);border-radius:14px;padding:24px 28px;max-width:500px;width:100%;box-shadow:0 16px 52px rgba(0,0,0,0.65);max-height:88vh;overflow-y:auto;}',
    '#dmo-sub-title{font-size:20px;color:#f5c518;letter-spacing:.07em;text-align:center;margin-bottom:14px;border:none !important;display:block !important;padding-bottom:0 !important;}',
    '#dmo-sub-list{list-style:none;padding:0;margin:0;}',
    '#dmo-sub-list li{margin-bottom:4px;}',
    '#dmo-sub-list li button{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(74,184,240,0.16);border-radius:7px;color:rgba(255,255,255,0.85);font-family:inherit;font-size:13px;padding:9px 12px;cursor:pointer;text-align:left;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;gap:10px;transition:background 0.12s,border-color 0.12s;}',
    '#dmo-sub-list li button:hover,#dmo-sub-list li button:focus-visible{background:rgba(74,184,240,0.13);border-color:rgba(74,184,240,0.45);outline:none;}',
    '.dmo-en{font-size:12px;color:rgba(245,197,24,0.75);min-width:22px;text-align:center;-webkit-box-flex:0;-ms-flex:none;flex:none;}',
    '#dmo-sub-back{display:block;margin:14px auto 0;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.18);border-radius:7px;color:rgba(255,255,255,0.65);font-family:inherit;font-size:12px;padding:7px 20px;cursor:pointer;transition:background 0.12s,color 0.12s;}',
    '#dmo-sub-back:hover,#dmo-sub-back:focus-visible{background:rgba(255,255,255,0.13);color:#fff;outline:none;}',

    /* ── PLAYER SCREEN ── */
    '#dmo-player{position:absolute;top:0;left:0;right:0;bottom:0;z-index:4;background:#000;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;padding:8px 8px 62px;}',
    '#dmo-iframe-wrap{width:100%;-webkit-box-flex:1;-ms-flex:1 1 auto;flex:1 1 auto;min-height:0;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;}',
    '#dmo-iframe{max-width:100%;max-height:100%;width:100%;border:none;background:#000;}',
    '#dmo-pfoot{position:absolute;bottom:0;left:0;right:0;height:58px;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;gap:5px;background:rgba(0,0,0,0.86);padding:4px 12px;border-top:1px solid rgba(255,255,255,0.07);}',
    '#dmo-pstatus{color:rgba(255,255,255,0.5);font-size:11px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:94vw;}',
    '#dmo-pbar{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;gap:6px;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;}',
    '.dmo-pb{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:5px;color:rgba(255,255,255,0.82);font-family:inherit;font-size:12px;padding:5px 13px;cursor:pointer;white-space:nowrap;transition:background 0.12s,color 0.12s;}',
    '.dmo-pb:hover,.dmo-pb:focus-visible{background:rgba(255,255,255,0.2);color:#fff;outline:none;}',
    '.dmo-pb:disabled{opacity:.22;cursor:default;}',
    '#dmo-pmenu{background:rgba(0,55,130,0.4);border-color:rgba(74,184,240,0.35);}',
    '#dmo-pmenu:hover{background:rgba(0,55,130,0.75);}',
    '#dmo-pclose{background:rgba(130,0,0,0.4);border-color:rgba(255,70,70,0.35);}',
    '#dmo-pclose:hover{background:rgba(130,0,0,0.82);}',

    /* Utility */
    '.dmo-hidden{display:none!important;}',
    '.dvd-menu-badge{display:inline-block;margin:3px 0 5px;background:#005eb8;color:#fff;font-size:11px;padding:2px 9px;border-radius:999px;letter-spacing:.04em;}',

    /* ── Responsive ── */
    /* Small screens */
    '@media(max-width:520px){',
    '#dmo-t1,#dmo-t2{font-size:36px;}',
    '#dmo-tamp{font-size:13px;}',
    '#dmo-hex-wrap{width:220px;}',
    '.dmo-mb{font-size:11px;padding:5px 4px;}',
    '#dmo-sub-panel{padding:18px 16px;}',
    '}',

    /* Very small viewport height (landscape phone) */
    '@media(max-height:440px){',
    '#dmo-title{display:none;}',
    '#dmo-hex-wrap{width:190px;}',
    '}',

    /* Large screens — slightly bigger hex */
    '@media(min-width:1200px){',
    '#dmo-hex-wrap{width:300px;}',
    '#dmo-t1,#dmo-t2{font-size:64px;}',
    '#dmo-tamp{font-size:22px;}',
    '.dmo-mb{font-size:14px;}',
    '}'
  ].join('');

  function injectStyles() {
    if (document.getElementById('dmo-styles')) return;
    var s = document.createElement('style');
    s.id = 'dmo-styles';
    if (s.textContent !== undefined) {
      s.textContent = CSS;
    } else {
      s.styleSheet.cssText = CSS;  /* IE8 fallback */
    }
    document.head.appendChild(s);
  }

  function buildOverlay() {
    if (document.getElementById('dmo-overlay')) return;

    var el = document.createElement('div');
    el.id = 'dmo-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'DVD Menu');

    el.innerHTML = [
      '<div id="dmo-bg" aria-hidden="true"></div>',
      '<button id="dmo-close" aria-label="Close DVD menu">\u2715</button>',

      /* ── MENU SCREEN ── */
      '<div id="dmo-menu-screen">',
        '<div id="dmo-menu-panel">',
          '<div id="dmo-title" aria-hidden="true">',
            '<span id="dmo-brand">THOMAS &amp; FRIENDS</span>',
            '<span id="dmo-t1"></span>',
            '<span id="dmo-tamp"></span>',
            '<span id="dmo-t2"></span>',
          '</div>',
          '<nav id="dmo-hex-wrap" aria-label="DVD menu options">',
            '<svg id="dmo-hex-svg" viewBox="0 0 300 340" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
              '<defs>',
                '<radialGradient id="dmoG" cx="50%" cy="38%" r="62%">',
                  '<stop offset="0%" stop-color="#2a8de0"/>',
                  '<stop offset="100%" stop-color="#06285a"/>',
                '</radialGradient>',
                '<pattern id="dmoP" x="0" y="0" width="20" height="23.1" patternUnits="userSpaceOnUse">',
                  '<polygon points="10,0 20,5.77 20,17.32 10,23.1 0,17.32 0,5.77" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="0.7"/>',
                '</pattern>',
              '</defs>',
              '<polygon points="150,5 295,87.5 295,252.5 150,335 5,252.5 5,87.5" fill="url(#dmoG)" stroke="#4ab8f0" stroke-width="3"/>',
              '<polygon points="150,5 295,87.5 295,252.5 150,335 5,252.5 5,87.5" fill="url(#dmoP)"/>',
              '<polygon points="150,19 282,91 282,249 150,321 18,249 18,91" fill="none" stroke="rgba(255,255,255,0.09)" stroke-width="1.2"/>',
            '</svg>',
            '<div id="dmo-hex-btns" role="menu">',
              '<button class="dmo-mb" id="dmo-play-all" role="menuitem">PLAY ALL</button>',
              '<button class="dmo-mb" id="dmo-sel-ep"   role="menuitem">SELECT AN EPISODE</button>',
              '<button class="dmo-mb" id="dmo-bonus"    role="menuitem">BONUS FEATURES</button>',
              '<button class="dmo-mb" role="menuitem" disabled aria-disabled="true">SUBTITLES ON / OFF</button>',
            '</div>',
          '</nav>',
        '</div>',
      '</div>',

      /* ── SUB-SCREEN (episode list) ── */
      '<div id="dmo-sub" class="dmo-hidden" role="region" aria-label="Episode list">',
        '<div id="dmo-sub-panel">',
          '<h2 id="dmo-sub-title"></h2>',
          '<ul id="dmo-sub-list" aria-label="Episodes"></ul>',
          '<button id="dmo-sub-back">\u25c4 BACK TO MENU</button>',
        '</div>',
      '</div>',

      /* ── PLAYER SCREEN ── */
      '<div id="dmo-player" class="dmo-hidden" role="region" aria-label="Video player">',
        '<div id="dmo-iframe-wrap">',
          '<iframe id="dmo-iframe" allow="autoplay; fullscreen" allowfullscreen title="Episode player"></iframe>',
        '</div>',
        '<div id="dmo-pfoot">',
          '<div id="dmo-pstatus" aria-live="polite"></div>',
          '<div id="dmo-pbar">',
            '<button class="dmo-pb" id="dmo-pprev" aria-label="Previous episode">\u23ee Prev</button>',
            '<button class="dmo-pb" id="dmo-pmenu" aria-label="Back to menu">\u2630 Menu</button>',
            '<button class="dmo-pb" id="dmo-pnext" aria-label="Next episode">Next \u23ed</button>',
            '<button class="dmo-pb" id="dmo-pclose" aria-label="Close player">\u2715 Close</button>',
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
      return u + (u.indexOf('?') !== -1 ? '&' : '?') + 'rm=minimal';
    }
    if (url.indexOf('youtube.com') !== -1 || url.indexOf('youtu.be') !== -1) {
      return url + (url.indexOf('?') !== -1 ? '&' : '?') + 'autoplay=1&rel=0&vq=hd1080';
    }
    return url;
  }

  /* 16:9 iframe sizing */
  function sizeIframe() {
    var wrap  = g('dmo-iframe-wrap');
    var frame = g('dmo-iframe');
    if (!wrap || !frame) return;
    var wh = wrap.clientHeight || (window.innerHeight - 62);
    var ww = wrap.clientWidth  || window.innerWidth;
    var h  = Math.min(wh, ww * 9 / 16);
    var w  = h * 16 / 9;
    frame.style.width  = Math.floor(w) + 'px';
    frame.style.height = Math.floor(h) + 'px';
  }

  /* ── Screen helpers ── */
  function showMenu() {
    g('dmo-menu-screen').classList.remove('dmo-hidden');
    g('dmo-sub').classList.add('dmo-hidden');
    g('dmo-player').classList.add('dmo-hidden');
    g('dmo-iframe').src = '';
    g('dmo-play-all').focus();
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
      num.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-label', (i + 1) + '. ' + item.title);
      btn.appendChild(num);
      btn.appendChild(document.createTextNode(item.title));
      btn.onclick = function() { onPick(i); };
      li.appendChild(btn);
      list.appendChild(li);
    });
    g('dmo-menu-screen').classList.add('dmo-hidden');
    g('dmo-sub').classList.remove('dmo-hidden');
    g('dmo-player').classList.add('dmo-hidden');
    /* Focus first episode */
    var first = list.querySelector('button');
    if (first) first.focus();
  }

  function showPlayer() {
    g('dmo-menu-screen').classList.add('dmo-hidden');
    g('dmo-sub').classList.add('dmo-hidden');
    g('dmo-player').classList.remove('dmo-hidden');
    setTimeout(sizeIframe, 60);
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
    g('dmo-pprev').disabled = (S.qi === 0);
    g('dmo-pnext').textContent = S.qi === S.queue.length - 1 ? '\u2713 Finish' : 'Next \u23ed';
  }

  function nextT() {
    if (S.qi < S.queue.length - 1) { S.qi++; renderTrack(); }
    else showMenu();
  }
  function prevT() {
    if (S.qi > 0) { S.qi--; renderTrack(); }
  }

  function closeOverlay() {
    g('dmo-overlay').classList.remove('dmo-open');
    g('dmo-iframe').src = '';
    document.body.style.overflow = '';
    /* Return focus to whatever opened the overlay */
    if (S._trigger) { S._trigger.focus(); S._trigger = null; }
  }

  /* ── Theme: titles only, no background image ── */
  function applyTheme(dvd) {
    var m = dvd.menu || {};
    var title = m.title_line1 || dvd.title || '';
    g('dmo-t1').textContent   = title;
    g('dmo-tamp').textContent = m.title_amp   || '';
    g('dmo-t2').textContent   = m.title_line2 || '';
    g('dmo-tamp').style.display = m.title_amp   ? '' : 'none';
    g('dmo-t2').style.display   = m.title_line2 ? '' : 'none';
    g('dmo-overlay').setAttribute('aria-label', 'DVD Menu — ' + title);
    /* Disable bonus button if no bonus content */
    var bonusBtn = g('dmo-bonus');
    var hasBonus = !!(dvd.menu && dvd.menu.bonus_tracks && dvd.menu.bonus_tracks.length);
    bonusBtn.disabled = !hasBonus;
    bonusBtn.setAttribute('aria-disabled', hasBonus ? 'false' : 'true');
  }

  /* ── Event bindings (run once) ── */
  var bound = false;
  function bindEvents() {
    if (bound) return;
    bound = true;

    g('dmo-play-all').onclick = function() { playQueue(S.tracks, 0); };
    g('dmo-sel-ep').onclick   = function() {
      showSub('\ud83c\udfa5 SELECT AN EPISODE', S.tracks, function(i) { playQueue(S.tracks, i); });
    };
    g('dmo-bonus').onclick = function() {
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

    /* Click outside sub-panel to go back to menu */
    g('dmo-sub').addEventListener('click', function(e) {
      if (e.target === g('dmo-sub')) showMenu();
    });

    window.addEventListener('resize', function() {
      if (!g('dmo-player').classList.contains('dmo-hidden')) sizeIframe();
    });

    document.addEventListener('keydown', function(e) {
      if (!g('dmo-overlay').classList.contains('dmo-open')) return;
      var key     = e.key || e.keyCode;
      var playing = !g('dmo-player').classList.contains('dmo-hidden');
      var onSub   = !g('dmo-sub').classList.contains('dmo-hidden');

      if (key === 'Escape' || key === 27) {
        if (playing || onSub) showMenu();
        else closeOverlay();
        e.preventDefault();
      }
      if (playing) {
        if (key === 'ArrowRight' || key === 39) { nextT(); e.preventDefault(); }
        if (key === 'ArrowLeft'  || key === 37) { prevT(); e.preventDefault(); }
      }
    });
  }

  /* ── Public API ── */
  window.openDvdMenuOverlay = function(dvd, resolvedTracks, triggerElement) {
    injectStyles();
    buildOverlay();
    bindEvents();

    S.dvd      = dvd;
    S.tracks   = resolvedTracks;
    S.bonus    = (dvd.menu && dvd.menu.bonus_tracks) || [];
    S.queue    = [];
    S.qi       = 0;
    S._trigger = triggerElement || null;

    applyTheme(dvd);
    showMenu();

    g('dmo-overlay').classList.add('dmo-open');
    document.body.style.overflow = 'hidden';
    /* Focus the first menu button for keyboard users */
    g('dmo-play-all').focus();
  };

})();
