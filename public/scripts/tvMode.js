document.addEventListener('DOMContentLoaded', () => {
    const tvBtn = document.getElementById('tv-mode-btn');
    const body = document.body;
    
    // Check for saved preference
    if (localStorage.getItem('tvMode') === 'enabled') {
        enableTVMode();
    }

    tvBtn.addEventListener('click', () => {
        if (body.classList.contains('tv-mode')) {
            disableTVMode();
        } else {
            enableTVMode();
        }
    });

    function enableTVMode() {
        body.classList.add('tv-mode');
        // Change button text/icon
        if(tvBtn) tvBtn.innerHTML = '💻 <span class="btn-text">Desktop Mode</span>';
        localStorage.setItem('tvMode', 'enabled');
        
        // Optional: Enter fullscreen for true TV feel
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(err => {
                // Ignore errors if user didn't interact nicely
            });
        }
    }

    function disableTVMode() {
        body.classList.remove('tv-mode');
        if(tvBtn) tvBtn.innerHTML = '📺 <span class="btn-text">TV Mode</span>';
        localStorage.setItem('tvMode', 'disabled');
        
        if (document.exitFullscreen && document.fullscreenElement) {
            document.exitFullscreen();
        }
    }
});
