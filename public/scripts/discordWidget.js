/* Discord Widget - anonymous, hides entire section on failure */
(function() {
  function loadWidget() {
    var section = document.getElementById('join-discord');
    var statsEl = document.getElementById('discord-stats');
    var inviteEl = document.getElementById('discord-invite');

    /* Hide avatars container entirely - we don't show member avatars for privacy */
    var avatarsEl = document.getElementById('discord-avatars');
    if (avatarsEl) avatarsEl.style.display = 'none';

    fetch('https://discord.com/api/guilds/859512547379118120/widget.json')
      .then(function(res) {
        if (!res.ok) throw new Error('widget unavailable');
        return res.json();
      })
      .then(function(data) {
        /* Update invite link */
        if (inviteEl && data.instant_invite) inviteEl.href = data.instant_invite;

        /* Show only anonymous count, no usernames or avatars */
        if (statsEl) {
          var count = data.members ? data.members.length : 0;
          statsEl.textContent = count > 0 ? '\u25cf ' + count + ' online' : '';
        }

        /* Show the section now that we have data */
        if (section) section.style.display = '';
      })
      .catch(function() {
        /* Hide entire discord section if widget fails to load */
        if (section) section.style.display = 'none';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadWidget);
  } else {
    loadWidget();
  }
})();
