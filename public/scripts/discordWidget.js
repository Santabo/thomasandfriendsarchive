async function loadDiscordWidget() {
  try {
    const res = await fetch("https://discord.com/api/guilds/859512547379118120/widget.json");
    if (!res.ok) throw new Error("Failed to fetch Discord data");
    const data = await res.json();

    // Bot usernames to exclude
    const botUsernames = [
      "Arcane-chan ✨",
      "Birthday Bot",
      "DISBOARD",
      "Emoji.gg",
      "Friend Time",
      "Interaction Bot",
      "NQN",
      "Sapphire",
      "TTS Bot"
    ];

    // Filter real human members only
    const realMembers = (data.members || []).filter(
      member => member.username && !botUsernames.includes(member.username)
    );

    // Update Discord invite button
    const inviteBtn = document.getElementById("discord-invite");
    if (inviteBtn && data.instant_invite) {
      inviteBtn.href = data.instant_invite;
    }

    // Update stats text
    const stats = document.getElementById("discord-stats");
    if (stats) {
      const count = realMembers.length;
      stats.textContent =
        count > 0
          ? `🎉 ${count} real member${count !== 1 ? "s" : ""} online right now!`
          : `🔍 No human members online at the moment.`;
    }

    // Show real member avatars
    const avatarsContainer = document.getElementById("discord-avatars");
    if (avatarsContainer) {
      avatarsContainer.innerHTML = ""; // Clear existing

      const fragment = document.createDocumentFragment();

      realMembers.slice(0, 8).forEach(member => {
        if (!member.avatar_url) return;

        const img = document.createElement("img");
        img.src = member.avatar_url;
        img.alt = `${member.username}'s avatar`;
        img.title = member.username;
        img.style.width = "40px";
        img.style.height = "40px";
        img.style.borderRadius = "50%";
        img.style.margin = "0 4px";

        fragment.appendChild(img);
      });

      avatarsContainer.appendChild(fragment);
    }
  } catch (error) {
    console.error("Discord widget error:", error);
    const stats = document.getElementById("discord-stats");
    if (stats) stats.textContent = "⚠️ Unable to load Discord info right now.";
  }
}

window.addEventListener("DOMContentLoaded", loadDiscordWidget);
