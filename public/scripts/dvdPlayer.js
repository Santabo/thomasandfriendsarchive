// DVD Data Library
// Replace VIDEO_ID_X with real YouTube IDs or direct MP4 URLs
const dvdLibrary = {
  'dinos': {
    title: "Dinos & Discoveries",
    tracks: [
      { title: "Marion & The Dinosaurs", url: "https://www.youtube.com/embed/VIDEO_ID_1" },
      { title: "Millie & The Volcano", url: "https://www.youtube.com/embed/VIDEO_ID_2" },
      { title: "Timothy & The Rainbow Truck", url: "https://www.youtube.com/embed/VIDEO_ID_3" },
      { title: "Samson at the Scrap Yard", url: "https://www.youtube.com/embed/VIDEO_ID_4" },
      { title: "Emily Saves the World", url: "https://www.youtube.com/embed/VIDEO_ID_5" },
      { title: "Samson Sent for Scrap", url: "https://www.youtube.com/embed/VIDEO_ID_6" }
    ]
  },
  'chocolate': {
    title: "Percy's Chocolate Crunch",
    tracks: [
      { title: "Percy's Chocolate Crunch", url: "https://www.youtube.com/embed/VIDEO_ID_A" },
      { title: "Thomas, Percy & The Squeak", url: "https://www.youtube.com/embed/VIDEO_ID_B" },
      { title: "Gordon Takes a Tumble", url: "https://www.youtube.com/embed/VIDEO_ID_C" },
      { title: "Bonus: Buffer Bashing", url: "https://www.youtube.com/embed/VIDEO_ID_D" }
    ]
  }
};

let currentQueue = [];
let currentTrackIndex = 0;
let staticAnimationId;

// DOM Elements
const modal = document.getElementById("video-modal");
const iframe = document.getElementById("modal-video");
const closeBtn = document.getElementById("modal-close");
const statusDiv = document.getElementById("queue-status");
const controlsDiv = document.getElementById("modal-controls");
const btnNext = document.getElementById("btn-next");
const btnPrev = document.getElementById("btn-prev");
const canvas = document.getElementById("static-canvas");
const ctx = canvas ? canvas.getContext("2d") : null;

// --- CANVAS STATIC EFFECT ---
function resizeCanvas() {
  if(canvas && canvas.parentElement) {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }
}

function drawStatic() {
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  const idata = ctx.createImageData(w, h);
  const buffer32 = new Uint32Array(idata.data.buffer);
  const len = buffer32.length;

  for (let i = 0; i < len; i++) {
    if (Math.random() < 0.1) buffer32[i] = 0xffffffff; // White
    else if(Math.random() < 0.05) buffer32[i] = 0xff000000; // Black
    else buffer32[i] = 0x00000000; // Transparent
  }
  ctx.putImageData(idata, 0, 0);
  staticAnimationId = requestAnimationFrame(drawStatic);
}

function playStaticEffect() {
  if (!canvas) return;
  resizeCanvas();
  canvas.style.opacity = "1";
  drawStatic();
  
  // Stop static after 600ms
  setTimeout(() => {
    canvas.style.opacity = "0";
    cancelAnimationFrame(staticAnimationId);
    if(ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 600);
}

// --- PLAYER LOGIC ---
window.playDvd = function(dvdId) {
  const dvd = dvdLibrary[dvdId];
  if (!dvd) return;
  currentQueue = dvd.tracks;
  currentTrackIndex = 0;
  
  if(controlsDiv) controlsDiv.style.display = "flex";
  if(statusDiv) statusDiv.style.display = "block";
  
  openModal();
  loadTrack();
};

function openModal() {
  if(modal) {
    modal.classList.remove("hidden");
    modal.style.display = "flex"; // Ensure flex display
    document.body.style.overflow = "hidden";
    playStaticEffect();
  }
}

// Reuse existing close logic from episodes.js or overwrite it here specifically for DVD
if(closeBtn) {
  closeBtn.addEventListener('click', () => {
    iframe.src = "";
    modal.classList.add("hidden");
    document.body.style.overflow = "";
    currentQueue = [];
    if(statusDiv) statusDiv.innerHTML = "";
  });
}

window.loadTrack = function() {
  if (currentQueue.length === 0) return;
  const track = currentQueue[currentTrackIndex];
  
  // Delay video load slightly to sync with static fade out
  setTimeout(() => {
    // Add autoplay param
    iframe.src = track.url.includes('?') ? track.url + "&autoplay=1" : track.url + "?autoplay=1";
  }, 300);
  
  if(statusDiv) statusDiv.innerHTML = `Now Playing: ${track.title}`;
  
  if(btnPrev) btnPrev.disabled = currentTrackIndex === 0;
  if(btnNext) btnNext.innerHTML = currentTrackIndex === currentQueue.length - 1 ? "Finish" : "Next ⏭";
};

window.nextTrack = function() {
  if (currentTrackIndex < currentQueue.length - 1) {
    currentTrackIndex++;
    playStaticEffect();
    loadTrack();
  } else {
    // End of queue
    closeBtn.click();
  }
};

window.prevTrack = function() {
  if (currentTrackIndex > 0) {
    currentTrackIndex--;
    playStaticEffect();
    loadTrack();
  }
};
