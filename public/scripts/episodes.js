// episodes.js
// This file dynamically loads episodes from the episodes folder and displays them.

const episodeContainer = document.getElementById("episode-list");

fetch("/data/season1.json")
  .then(res => res.json())
  .then(data => {
    const seasonHeader = document.createElement("h3");
    seasonHeader.textContent = "Season 1";
    episodeContainer.appendChild(seasonHeader);

    data.episodes.forEach(episode => {
      const episodeEl = document.createElement("div");
      episodeEl.className = "episode";

      episodeEl.innerHTML = `
        <img src="${episode.image}" alt="${episode.uk_title}">
        <h4>${episode.episode_number}. ${episode.uk_title}</h4>
        <p>${episode.summary}</p>
        <p><strong>Air Date:</strong> ${episode.air_date}</p>
        <p><strong>Audio Tracks:</strong> ${episode.audio_tracks.join(", ")}</p>
        <p><a href="${episode.link.uk}" target="_blank">Watch UK</a> | 
           <a href="${episode.link.us}" target="_blank">Watch US</a></p>
      `;

      episodeContainer.appendChild(episodeEl);
    });
  });
