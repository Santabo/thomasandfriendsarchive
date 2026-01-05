async function loadDiscordWidget() {
  try {
    const res = await fetch("https://discord.com/api/guilds/859512547379118120/widget.json");
    if (!res.ok) throw new Error("Failed to fetch Discord data");
    const data = await res.json();

    // Bot usernames to exclude from counts/lists
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
      "Keto",
      "DTools"
    ];

    // Filter out bot members
    const realMembers = data.members.filter(
      member => !botUsernames.includes(member.username)
    );

    // 1. Update invite link
    const inviteBtn = document.getElementById("discord-invite");
    if (inviteBtn) inviteBtn.href = data.instant_invite;

    // 2. Update online stats (Count restored, text simplified)
    const stats = document.getElementById("discord-stats");
    if (stats) {
      const count = realMembers.length;
      stats.textContent = `● ${count} Online`;
      stats.style.color = "#43b581"; // Discord green
      stats.style.fontWeight = "bold";
    }

    // 3. Clear Widget Avatars (Made anonymous as requested)
    const avatarsContainer = document.getElementById("discord-avatars");
    if (avatarsContainer) {
      avatarsContainer.innerHTML = ""; 
    }

    // 4. Update "Special Thanks" Profile Pictures
    // This looks for users in the Special Thanks section and updates their PFP if they are online in the widget.
    const creditItems = document.querySelectorAll('.credit-item');
    if (creditItems.length > 0) {
        creditItems.forEach(item => {
            const nameEl = item.querySelector('strong');
            const imgEl = item.querySelector('img');
            
            if (nameEl && imgEl) {
                const username = nameEl.textContent.trim();
                // Find matching user in the online list
                const onlineUser = realMembers.find(m => m.username === username || m.username.toLowerCase() === username.toLowerCase());
                
                if (onlineUser && onlineUser.avatar_url) {
                    imgEl.src = onlineUser.avatar_url;
                }
            }
        });
    }

  } catch (error) {
    console.error("Discord widget error:", error);
    const stats = document.getElementById("discord-stats");
    if (stats) stats.textContent = "";
  }
}

window.addEventListener("DOMContentLoaded", loadDiscordWidget);
