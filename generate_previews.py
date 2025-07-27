import json
import os
import html

# Adjust paths as needed
DATA_DIR = "public/data/en-gb"
OUTPUT_BASE_DIR = "public/en-gb/episodes"  # nested output folders

# Base URL pattern for episode pages on your site (language + season + episode)
BASE_EPISODE_URL = "https://thomasarchive.vercel.app/en-gb/episodes"

# Site-wide static info
SITE_TITLE = "Thomas the Tank Engine Archive"
SITE_DESC = "Complete collection of Thomas the Tank Engine episodes, specials, and fan-made content."
SITE_FAVICON = "https://i.ibb.co/SDBYYshc/image-2025-07-09-212116843.png"
FONT_FACE_CSS = """
@font-face {
  font-family: 'Flange BQ Bold';
  src: url('/flangebq_bold.ttf') format('truetype');
  font-weight: bold;
  font-style: normal;
}
/* Modal styling */
#video-modal {
  display: none;
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.85);
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
#video-modal:not(.hidden) {
  display: flex;
}
#video-modal .modal-content {
  position: relative;
  width: 90%;
  max-width: 960px;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}
#video-modal iframe {
  width: 100%;
  height: 100%;
  border: none;
}
#modal-close {
  position: absolute;
  top: 0.5rem;
  right: 0.75rem;
  font-size: 2rem;
  color: white;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 10;
}
"""

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def generate_preview_html(ep_code, title, cover_url, season_num, episode_num, video_url):
    # Escape values for safe HTML usage
    title_esc = html.escape(title)
    cover_esc = html.escape(cover_url)
    desc = f"Watch '{title}' from Series {season_num} on the Thomas Archive."
    desc_esc = html.escape(desc)
    url = f"{BASE_EPISODE_URL}/{str(season_num).zfill(2)}/{str(episode_num).zfill(2)}"
    url_esc = html.escape(url)

    # Extract embed URL for OG Twitter player tag (simplified for YouTube and Drive)
    embed_url = video_url
    try:
        if "youtube.com" in video_url:
            if "/embed/" in video_url:
                embed_url = video_url
            else:
                from urllib.parse import urlparse, parse_qs
                parsed = urlparse(video_url)
                qs = parse_qs(parsed.query)
                v = qs.get("v", [None])[0]
                if v:
                    embed_url = f"https://www.youtube.com/embed/{v}"
        elif "drive.google.com" in video_url:
            import re
            m = re.search(r"/d/([^/]+)/", video_url)
            if m:
                embed_url = f"https://drive.google.com/file/d/{m.group(1)}/preview"
    except Exception:
        pass

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title_esc} | {SITE_TITLE}</title>
  <meta name="description" content="{desc_esc}" />
  
  <!-- Open Graph -->
  <meta property="og:type" content="video.other" />
  <meta property="og:title" content="{title_esc}" />
  <meta property="og:description" content="{desc_esc}" />
  <meta property="og:image" content="{cover_esc}" />
  <meta property="og:url" content="{url_esc}" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="player" />
  <meta name="twitter:title" content="{title_esc}" />
  <meta name="twitter:description" content="{desc_esc}" />
  <meta name="twitter:image" content="{cover_esc}" />
  <meta name="twitter:player" content="{embed_url}" />

  <link rel="stylesheet" href="/style.css" />
  <link rel="icon" href="{SITE_FAVICON}" type="image/png" />
  <style>{FONT_FACE_CSS}</style>
</head>
<body>
  <!-- Removed episode title and image from body -->

  <!-- Video Modal -->
  <div id="video-modal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="video-title">
    <div class="modal-content">
      <button id="modal-close" aria-label="Close video modal">&times;</button>
      <iframe id="modal-video" title="Video player" allow="autoplay" allowfullscreen></iframe>
    </div>
  </div>

  <script>
    const modal = document.getElementById('video-modal');
    const iframe = document.getElementById('modal-video');
    const closeBtn = document.getElementById('modal-close');

    function openVideoModal(url) {{
      let embedUrl = url;
      try {{
        if (url.includes('youtube.com')) {{
          if (url.includes('/embed/')) {{
            embedUrl = url.includes('?') ? `${{url}}&autoplay=1` : `${{url}}?autoplay=1`;
          }} else {{
            const videoId = new URL(url).searchParams.get('v');
            if (videoId) embedUrl = `https://www.youtube.com/embed/${{videoId}}?autoplay=1`;
          }}
        }} else if (url.includes('drive.google.com')) {{
          const match = url.match(/\\/d\\/([^\\/]+)\\//);
          if (match && match[1]) embedUrl = `https://drive.google.com/file/d/${{match[1]}}/preview`;
        }}
      }} catch(e) {{
        console.error('Error parsing video URL:', e);
      }}
      iframe.src = embedUrl;
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
    }}

    function closeVideoModal() {{
      iframe.src = '';
      modal.classList.add('hidden');
      modal.style.display = 'none';
      // Redirect back to archive root on close
      window.location.href = "/en-gb/";
    }}

    closeBtn.addEventListener('click', closeVideoModal);
    modal.addEventListener('click', e => {{
      if (e.target === modal) closeVideoModal();
    }});

    // Open modal automatically on page load
    document.addEventListener('DOMContentLoaded', () => {{
      openVideoModal({html.escape(repr(video_url))});
    }});
  </script>
</body>
</html>
"""

def main():
    for filename in os.listdir(DATA_DIR):
        if not filename.startswith("season") or not filename.endswith(".json"):
            continue

        season_num = filename[len("season") : -len(".json")]
        season_str = str(season_num).zfill(2)
        season_path = os.path.join(DATA_DIR, filename)

        with open(season_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        season_key = f"season{season_num}"
        episodes = data.get(season_key, {}).get("episodes", [])
        if not episodes:
            print(f"No episodes found in {filename}")
            continue

        for ep in episodes:
            ep_num = ep.get("episode_number")
            if ep_num is None:
                continue

            ep_num_str = str(ep_num).zfill(2)
            ep_code = f"{season_str}{ep_num_str}"

            title = ep.get("uk_title", f"Episode {ep_num_str}")
            cover = ep.get("cover", "")
            video_url = ep.get("link", "")  # Assuming 'link' contains video URL

            html_content = generate_preview_html(
                ep_code, title, cover, season_num, ep_num, video_url
            )

            # Create nested folders for season/episode
            output_dir = os.path.join(OUTPUT_BASE_DIR, season_str, ep_num_str)
            ensure_dir(output_dir)

            output_path = os.path.join(output_dir, "index.html")
            with open(output_path, "w", encoding="utf-8") as out_file:
                out_file.write(html_content)

            print(f"Generated preview for episode {ep_code}: {title}")

    print("All previews generated!")

if __name__ == "__main__":
    main()
