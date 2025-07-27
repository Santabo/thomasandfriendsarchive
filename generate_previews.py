import json
import os
import html

DATA_DIR = "public/data/en-gb"
OUTPUT_BASE_DIR = "public/en-gb/episodes"
BASE_EPISODE_URL = "https://thomasarchive.vercel.app/en-gb/episodes"

SITE_TITLE = "Thomas the Tank Engine Archive"
SITE_DESC = "Complete collection of Thomas the Tank Engine episodes, specials, and fan-made content."
SITE_FAVICON = "https://i.ibb.co/SDBYYshc/image-2025-07-09-212116843.png"

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def generate_redirect_html(ep_code, title, cover_url, season_num, episode_num):
    title_esc = html.escape(title)
    desc = f"Watch '{title}' from Series {season_num} on the Thomas Archive."
    desc_esc = html.escape(desc)
    url = f"{BASE_EPISODE_URL}/{str(season_num).zfill(2)}/{str(episode_num).zfill(2)}"
    cover_esc = html.escape(cover_url)
    redirect_url = url  # Redirect target URL (main site episode page)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title_esc} | {SITE_TITLE}</title>
  <meta name="description" content="{desc_esc}" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="video.other" />
  <meta property="og:title" content="{title_esc} (UK)" />
  <meta property="og:description" content="{desc_esc}" />
  <meta property="og:image" content="{cover_esc}" />
  <meta property="og:url" content="{html.escape(redirect_url)}" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{title_esc} (UK)" />
  <meta name="twitter:description" content="{desc_esc}" />
  <meta name="twitter:image" content="{cover_esc}" />

  <link rel="icon" href="{SITE_FAVICON}" type="image/png" />

  <script>
    // Redirect immediately after page load
    window.location.replace("{html.escape(redirect_url)}");
  </script>
</head>
<body>
  <p>Redirecting to <a href="{html.escape(redirect_url)}">{html.escape(redirect_url)}</a>…</p>
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
            # video_url not needed here because no embed on redirect page

            html_content = generate_redirect_html(
                ep_code, title, cover, season_str, ep_num_str
            )

            output_dir = os.path.join(OUTPUT_BASE_DIR, season_str, ep_num_str)
            ensure_dir(output_dir)

            with open(os.path.join(output_dir, "index.html"), "w", encoding="utf-8") as out_file:
                out_file.write(html_content)

            print(f"Generated redirect page for episode {ep_code}: {title}")

    print("All redirect pages generated!")

if __name__ == "__main__":
    main()
