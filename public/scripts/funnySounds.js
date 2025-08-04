window.addEventListener("DOMContentLoaded", () => {
  const gamesTitle = document.querySelector("#games > h2");
  const audio = new Audio("https://web.archive.org/web/20170606204654oe_/http://play.thomasandfriends.com/en-gb/Images/STH_HP_Games_tcm1402-195019.mp3");

  gamesTitle.addEventListener("mouseenter", () => {
    if (!audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }
    audio.play();
  });
});
