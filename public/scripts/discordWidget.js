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
      "TTS Bot",
      "DSMonitoring",
      "Keto"
    ];

    // Filter out bot members
    const realMembers = data.members.filter(
      member => !botUsernames.includes(member.username)
    );

    // Update invite link
    const inviteBtn = document.getElementById("discord-invite");
    if (inviteBtn) inviteBtn.href = data.instant_invite;

    // Update online stats with real users only
    const stats = document.getElementById("discord-stats");
    if (stats) {
      const count = realMembers.length;
      stats.textContent = `🎉 ${count} real member${count !== 1 ? "s" : ""} online right now!`;
    }

    // Show avatars (up to 8 real members)
    const avatarsContainer = document.getElementById("discord-avatars");
    if (avatarsContainer) {
      avatarsContainer.innerHTML = ""; // Clear existing avatars
      realMembers.slice(0, 8).forEach(member => {
        const img = document.createElement("img");
        img.src = member.avatar_url || "https://cdn.discordapp.com/embed/avatars/0.png"; // default avatar fallback
        img.alt = `${member.username}'s avatar`;
        img.title = member.username;
        img.style.width = "24px";
        img.style.height = "24px";
        img.style.borderRadius = "50%";
        img.style.marginRight = "4px";
        avatarsContainer.appendChild(img);
      });
    }

  } catch (error) {
    console.error("Discord widget error:", error);
    const stats = document.getElementById("discord-stats");
    if (stats) stats.textContent = "⚠️ Unable to load Discord info right now.";
  }
}

window.addEventListener("DOMContentLoaded", loadDiscordWidget);
