import json
import os
import html

DATA_DIR = "public/data/en-gb"
OUTPUT_BASE_DIR = "public/en-gb/episodes"
BASE_EPISODE_URL = "https://thomasarchive.vercel.app/en-gb/episodes"

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
"""

PAGE_CSS = FONT_FACE_CSS + """
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #121212;
  color: #ddd;
  display: flex;
  height: 100vh;
  overflow: hidden;
}
main#video-player {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: black;
  padding: 1rem;
}
main#video-player iframe {
  width: 100%;
  height: 60vh;
  max-width: 960px;
  border: none;
  border-radius: 8px;
}
aside#sidebar {
  width: 300px;
  background: #1f1f1f;
  padding: 1rem;
  overflow-y: auto;
  border-left: 1px solid #333;
}
aside#sidebar h2 {
  margin-top: 0;
  font-size: 1.25rem;
  margin-bottom: 1rem;
  font-family: 'Flange BQ Bold', Arial, sans-serif;
}
a.sidebar-episode {
  display: flex;
  margin-bottom: 1rem;
  text-decoration: none;
  color: #ddd;
  transition: background 0.2s;
  border-radius: 4px;
  overflow: hidden;
  background: #2a2a2a;
}
a.sidebar-episode:hover {
  background: #3a3a3a;
}
a.sidebar-episode img {
  width: 80px;
  height: 45px;
  object-fit: cover;
  flex-shrink: 0;
}
.sidebar-ep-info {
  padding: 0.5rem;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}
.sidebar-empty {
  font-style: italic;
  color: #777;
}
"""

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def generate_sidebar_html(episodes, current_ep_code, season_num):
    items = []
    for ep in episodes:
        ep_num = ep.get("episode_number")
        if ep_num is None:
            continue
        ep_str = str(ep_num).zfill(2)
        ep_code = f"{str(season_num).zfill(2)}{ep_str}"
        title = ep.get("uk_title", f"Episode {ep_str}")
        cover = ep.get("cover", "")
        link = f"{BASE_EPISODE_URL}/{str(season_num).zfill(2)}/{ep_str}"
        active_class = "active" if ep_code == current_ep_code else ""
        items.append(f'''
        <a href="{link}" class="sidebar-episode {active_class}">
          <img src="{html.escape(cover)}" alt="{html.escape(title)} cover" />
          <div class="sidebar-ep-info">
            <span>{html.escape(title)}</span>
          </div>
        </a>
        ''')
    return '\n'.join(items) if items else '<p class="sidebar-empty">No episodes available</p>'

def generate_preview_html(ep_code, title, cover_url, season_num, episode_num, video_url, season_episodes):
    title_esc = html.escape(title)
    desc = f"Watch '{title}' from Series {season_num} on the Thomas Archive."
    desc_esc = html.escape(desc)
    url = f"{BASE_EPISODE_URL}/{str(season_num).zfill(2)}/{str(episode_num).zfill(2)}"
    embed_url = video_url

    try:
        if "youtube.com" in video_url:
            if "/embed/" not in video_url:
                from urllib.parse import urlparse, parse_qs
                parsed = urlparse(video_url)
                v = parse_qs(parsed.query).get("v", [None])[0]
                if v:
                    embed_url = f"https://www.youtube.com/embed/{v}?autoplay=1"
        elif "drive.google.com" in video_url:
            import re
            m = re.search(r"/d/([^/]+)/", video_url)
            if m:
                embed_url = f"https://drive.google.com/file/d/{m.group(1)}/preview"
    except Exception:
        pass

    sidebar_html = generate_sidebar_html(season_episodes, ep_code, season_num)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title_esc} | {SITE_TITLE}</title>
  <meta name="description" content="{desc_esc}" />
  <meta property="og:type" content="video.other" />
  <meta property="og:title" content="{title_esc} (UK)" />
  <meta property="og:description" content="{desc_esc}" />
  <meta property="og:image" content="{html.escape(cover_url)}" />
  <meta property="og:url" content="{html.escape(url)}" />
  <meta name="twitter:card" content="player" />
  <meta name="twitter:title" content="{title_esc} (UK)" />
  <meta name="twitter:description" content="{desc_esc}" />
  <meta name="twitter:image" content="{html.escape(cover_url)}" />
  <meta name="twitter:player" content="{embed_url}" />
  <link rel="stylesheet" href="/style.css" />
  <link rel="icon" href="{SITE_FAVICON}" type="image/png" />
  <style>{PAGE_CSS}</style>
</head>
<body>
  <main id="video-player" role="main">
    <iframe id="modal-video" src="{embed_url}" title="Video player" allow="autoplay" allowfullscreen></iframe>
  </main>
  <aside id="sidebar" role="complementary" aria-label="Episodes">
    <h2>Episodes</h2>
    {sidebar_html}
  </aside>
</body>
</html>
"""

def main():
    for filename in os.listdir(DATA_DIR):
        if not filename.startswith("season") or not filename.endswith(".json"):
            continue

        season_num = filename[len("season") : -len(".json")]
        season_str = str(season_num).zfill(2)

        with open(os.path.join(DATA_DIR, filename), "r", encoding="utf-8") as f:
            data = json.load(f)

        episodes = data.get(f"season{season_num}", {}).get("episodes", [])
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
            video_url = ep.get("link", "")

            html_content = generate_preview_html(
                ep_code, title, cover, season_str, ep_num_str, video_url, episodes
            )

            output_dir = os.path.join(OUTPUT_BASE_DIR, season_str, ep_num_str)
            ensure_dir(output_dir)

            with open(os.path.join(output_dir, "index.html"), "w", encoding="utf-8") as out_file:
                out_file.write(html_content)

            print(f"Generated preview for episode {ep_code}: {title}")

    print("All previews generated!")

if __name__ == "__main__":
    main()
