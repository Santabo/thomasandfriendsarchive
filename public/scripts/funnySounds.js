window.addEventListener("DOMContentLoaded", () => {
  // Map section selectors to their audio URLs
  const sectionSounds = {
    "#games > h2": "https://web.archive.org/web/20170606204654oe_/http://play.thomasandfriends.com/en-gb/Images/STH_HP_Games_tcm1402-195019.mp3",
    "#completion-stats > h2": "/audio/completionProgress.mp3",
    "#episodes > h2": "/audio/episodes.mp3",
    "#credits > h2": "/audio/specialThanks.mp3"
  };

  // For each section title, add hover sound logic
  for (const selector in sectionSounds) {
    const title = document.querySelector(selector);
    if (!title) continue;

    const audio = new Audio(sectionSounds[selector]);

    title.addEventListener("mouseenter", () => {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
      audio.play();
    });
  }
});
