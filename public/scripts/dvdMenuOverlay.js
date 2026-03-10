/**
 * DVD Menu Overlay System
 * Renders an interactive DVD-style menu as a fullscreen overlay over the video player.
 * Triggered when a DVD entry in dvds.json has a "menu" config object.
 */

(function () {
  'use strict';

  // ── Inject overlay HTML once ──────────────────────────────────────────────
  function injectOverlayHTML() {
    if (document.getElementById('dvd-menu-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'dvd-menu-overlay';
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('role', 'dialog');
    overlay.innerHTML = `
      <div id="dmo-bg"></div>
      <div id="dmo-inner">

        <!-- Left: video player sits here when playing; empty when showing menu -->
        <div id="dmo-video-area">
          <iframe id="dmo-iframe" allow="autoplay; fullscreen" allowfullscreen title="DVD video player"></iframe>
          <div id="dmo-video-controls">
            <button class="dmo-ctrl" id="dmo-prev">⏮ Prev</button>
            <button class="dmo-ctrl" id="dmo-menu-btn">☰ Menu</button>
            <button class="dmo-ctrl" id="dmo-next">Next ⏭</button>
          </div>
          <div id="dmo-track-status"></div>
        </div>

        <!-- Right: menu panel -->
        <div id="dmo-menu-panel">
          <div id="dmo-title-block">
            <span id="dmo-brand">THOMAS &amp; FRIENDS</span>
            <span id="dmo-title-line1"></span>
            <span id="dmo-title-amp"></span>
            <span id="dmo-title-line2"></span>
          </div>

          <div id="dmo-hex-wrap">
            <svg id="dmo-hex-svg" viewBox="0 0 300 340" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="dmoHexGrad" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stop-color="#2a8ae0"/>
                  <stop offset="100%" stop-color="#0a3a7a"/>
                </radialGradient>
                <pattern id="dmoHexPat" x="0" y="0" width="20" height="23.1" patternUnits="userSpaceOnUse">
                  <polygon points="10,0 20,5.77 20,17.32 10,23.1 0,17.32 0,5.77"
                    fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="0.5"/>
                </pattern>
              </defs>
              <polygon points="150,5 295,87.5 295,252.5 150,335 5,252.5 5,87.5"
                fill="url(#dmoHexGrad)" stroke="#5ac8fa" stroke-width="4"/>
              <polygon points="150,5 295,87.5 295,252.5 150,335 5,252.5 5,87.5"
                fill="url(#dmoHexPat)"/>
              <polygon points="150,18 282,91 282,249 150,322 18,249 18,91"
                fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
            </svg>
            <div id="dmo-hex-buttons">
              <button class="dmo-menu-item" id="dmo-play-all">PLAY ALL</button>
              <button class="dmo-menu-item" id="dmo-select-ep">SELECT AN EPISODE</button>
              <button class="dmo-menu-item" id="dmo-bonus">BONUS FEATURES</button>
              <button class="dmo-menu-item dmo-disabled" id="dmo-subtitles">SUBTITLES ON / OFF</button>
            </div>
          </div>
        </div>

        <!-- Sub-screens (episode select, bonus) -->
        <div id="dmo-subscreen" class="dmo-hidden">
          <div id="dmo-subscreen-panel">
            <h2 id="dmo-subscreen-title"></h2>
            <ul id="dmo-subscreen-list"></ul>
            <button id="dmo-subscreen-back">◀ BACK TO MENU</button>
          </div>
        </div>
      </div>

      <!-- Close button -->
      <button id="dmo-close" aria-label="Close DVD menu">✕</button>
    `;
    document.body.appendChild(overlay);
  }

  // ── State ─────────────────────────────────────────────────────────────────
  let state = {
    dvd: null,
    resolvedTracks: [],   // { title, url } after season data resolved
    bonusTracks: [],
    queue: [],
    queueIndex: 0,
    menuVisible: true,
  };

  // ── Open overlay for a DVD ────────────────────────────────────────────────
  window.openDvdMenuOverlay = async function (dvd, resolvedTracks) {
    injectOverlayHTML();

    state.dvd = dvd;
    state.resolvedTracks = resolvedTracks;
    state.bonusTracks = (dvd.menu && dvd.menu.bonus_tracks) || [];
    state.menuVisible = true;

    applyMenuTheme(dvd);
    showMenu();

    const overlay = document.getElementById('dvd-menu-overlay');
    overlay.classList.add('dmo-active');
    document.body.style.overflow = 'hidden';

    bindEvents();
  };

  // ── Apply theme from dvd.menu config ────────────────────────────────────
  function applyMenuTheme(dvd) {
    const m = dvd.menu || {};

    // Background
    const bg = document.getElementById('dmo-bg');
    bg.style.backgroundImage = m.background_image ? `url('${m.background_image}')` : '';

    // Title
    document.getElementById('dmo-title-line1').textContent = m.title_line1 || dvd.title;
    document.getElementById('dmo-title-amp').textContent = m.title_amp || '';
    document.getElementById('dmo-title-line2').textContent = m.title_line2 || '';

    // Hide amp/line2 if not set
    document.getElementById('dmo-title-amp').style.display = m.title_amp ? '' : 'none';
    document.getElementById('dmo-title-line2').style.display = m.title_line2 ? '' : 'none';
  }

  // ── Show/hide sections ────────────────────────────────────────────────────
  function showMenu() {
    state.menuVisible = true;
    document.getElementById('dmo-menu-panel').classList.remove('dmo-hidden');
    document.getElementById('dmo-video-area').classList.add('dmo-hidden');
    document.getElementById('dmo-subscreen').classList.add('dmo-hidden');
    document.getElementById('dmo-iframe').src = '';
  }

  function showVideo() {
    state.menuVisible = false;
    document.getElementById('dmo-menu-panel').classList.add('dmo-hidden');
    document.getElementById('dmo-video-area').classList.remove('dmo-hidden');
    document.getElementById('dmo-subscreen').classList.add('dmo-hidden');
    renderTrack();
  }

  function showSubscreen(title, items, onSelect) {
    document.getElementById('dmo-subscreen-title').textContent = title;
    const list = document.getElementById('dmo-subscreen-list');
    list.innerHTML = '';
    items.forEach((item, i) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.innerHTML = `<span class="dmo-ep-num">${i + 1}</span>${item.title}`;
      btn.addEventListener('click', () => onSelect(i));
      li.appendChild(btn);
      list.appendChild(li);
    });
    document.getElementById('dmo-subscreen').classList.remove('dmo-hidden');
    document.getElementById('dmo-menu-panel').classList.add('dmo-hidden');
  }

  // ── Player ────────────────────────────────────────────────────────────────
  function playQueue(tracks, startIndex) {
    state.queue = tracks;
    state.queueIndex = startIndex || 0;
    showVideo();
  }

  function renderTrack() {
    const track = state.queue[state.queueIndex];
    if (!track) return;

    const url = formatUrl(track.url);
    document.getElementById('dmo-iframe').src = url;

    const status = document.getElementById('dmo-track-status');
    status.textContent = `▶ ${track.title}  (${state.queueIndex + 1} / ${state.queue.length})`;

    document.getElementById('dmo-prev').disabled = state.queueIndex === 0;
    const nextBtn = document.getElementById('dmo-next');
    nextBtn.textContent = state.queueIndex === state.queue.length - 1 ? '✓ Finish' : 'Next ⏭';
  }

  function formatUrl(url) {
    if (!url) return '';
    if (url.includes('drive.google.com') && !url.includes('/preview'))
      return url.replace('/view', '/preview');
    return url;
  }

  function nextTrack() {
    if (state.queueIndex < state.queue.length - 1) {
      state.queueIndex++;
      renderTrack();
    } else {
      showMenu();
    }
  }

  function prevTrack() {
    if (state.queueIndex > 0) {
      state.queueIndex--;
      renderTrack();
    }
  }

  // ── Close overlay ─────────────────────────────────────────────────────────
  function closeOverlay() {
    const overlay = document.getElementById('dvd-menu-overlay');
    if (overlay) overlay.classList.remove('dmo-active');
    document.getElementById('dmo-iframe').src = '';
    document.body.style.overflow = '';
    state = { dvd: null, resolvedTracks: [], bonusTracks: [], queue: [], queueIndex: 0, menuVisible: true };
  }

  // ── Bind events (idempotent via flag) ─────────────────────────────────────
  let eventsBound = false;
  function bindEvents() {
    if (eventsBound) return;
    eventsBound = true;

    document.getElementById('dmo-play-all').addEventListener('click', () => {
      playQueue(state.resolvedTracks, 0);
    });

    document.getElementById('dmo-select-ep').addEventListener('click', () => {
      showSubscreen('🦕 SELECT AN EPISODE', state.resolvedTracks, (i) => {
        playQueue(state.resolvedTracks, i);
      });
    });

    document.getElementById('dmo-bonus').addEventListener('click', () => {
      if (state.bonusTracks.length === 0) return;
      if (state.bonusTracks.length === 1) {
        playQueue(state.bonusTracks, 0);
      } else {
        showSubscreen('⭐ BONUS FEATURES', state.bonusTracks, (i) => {
          playQueue(state.bonusTracks, i);
        });
      }
    });

    document.getElementById('dmo-menu-btn').addEventListener('click', showMenu);
    document.getElementById('dmo-prev').addEventListener('click', prevTrack);
    document.getElementById('dmo-next').addEventListener('click', nextTrack);
    document.getElementById('dmo-close').addEventListener('click', closeOverlay);
    document.getElementById('dmo-subscreen-back').addEventListener('click', showMenu);

    document.addEventListener('keydown', (e) => {
      const overlay = document.getElementById('dvd-menu-overlay');
      if (!overlay || !overlay.classList.contains('dmo-active')) return;
      if (e.key === 'Escape') {
        if (!state.menuVisible) showMenu();
        else closeOverlay();
      }
      if (e.key === 'ArrowRight' && !state.menuVisible) nextTrack();
      if (e.key === 'ArrowLeft' && !state.menuVisible) prevTrack();
    });
  }

})();
