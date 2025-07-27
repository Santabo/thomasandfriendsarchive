import json
import os

# Adjust paths as needed
DATA_DIR = "public/data"
OUTPUT_DIR = "public/previews"

# Base URL of your site
BASE_EPISODE_URL = "https://thomasarchive.vercel.app/?ep="

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def generate_preview_html(ep_code, title, cover_url, season):
    page_url = f"{BASE_EPISODE_URL}{ep_code}"
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>{title}</title>
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="Watch '{title}' from Series {season} on the Thomas Archive." />
  <meta property="og:image" content="{cover_url}" />
  <meta property="og:url" content="{page_url}" />
  <meta name="twitter:card" content="summary_large_image" />
</head>
<body>
  <script>location.href = "{page_url}";</script>
</body>
</html>
"""
    return html

def main():
    ensure_dir(OUTPUT_DIR)

    for filename in os.listdir(DATA_DIR):
        if not filename.startswith("season") or not filename.endswith(".json"):
            continue

        season_num = filename[len("season") : -len(".json")]
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
            season_str = str(season_num).zfill(2)
            ep_code = f"{season_str}{ep_num_str}"

            title = ep.get("uk_title", f"Episode {ep_num_str}")
            cover = ep.get("cover", "")

            html_content = generate_preview_html(ep_code, title, cover, season_num)

            output_path = os.path.join(OUTPUT_DIR, f"{ep_code}.html")
            with open(output_path, "w", encoding="utf-8") as out_file:
                out_file.write(html_content)

            print(f"Generated preview for episode {ep_code}: {title}")

    print("All previews generated!")

if __name__ == "__main__":
    main()
