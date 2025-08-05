import json
import os
import html

SITE_TITLE = "Thomas the Tank Engine Archive"
SITE_DESC = "Complete collection of Thomas the Tank Engine episodes, specials, and fan-made content."
SITE_FAVICON = "https://i.ibb.co/SDBYYshc/image-2025-07-09-212116843.png"

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def generate_redirect_html(ep_code, title, cover_url, season_num, episode_num, lang_code, country_name):
    title_esc = html.escape(title)
    desc = f"Watch '{title}' from Series {season_num} on the Thomas Archive."
    desc_esc = html.escape(desc)
    redirect_url = f"https://thomasarchive.vercel.app/{lang_code}/"

    # For TUGS, redirect to /tugs/{episode_num} instead of language root
    if ep_code.startswith("TG"):
        redirect_url = f"https://thomasarchive.vercel.app/tugs/{episode_num}/"

    return f"""<!DOCTYPE html>
<html lang="{lang_code}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title_esc} | {SITE_TITLE}</title>
  <meta name="description" content="{desc_esc}" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="video.other" />
  <meta property="og:title" content="{title_esc} ({country_name})" />
  <meta property="og:description" content="{desc_esc}" />
  <meta property="og:image" content="{html.escape(cover_url)}" />
  <meta property="og:url" content="{redirect_url}" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{title_esc} ({country_name})" />
  <meta name="twitter:description" content="{desc_esc}" />
  <meta name="twitter:image" content="{html.escape(cover_url)}" />

  <link rel="icon" href="{SITE_FAVICON}" type="image/png" />

  <script>
    sessionStorage.setItem('openEpisode', '{ep_code}');
    window.location.replace("{redirect_url}");
  </script>
</head>
<body>
  <p>Redirecting to <a href="{redirect_url}">{redirect_url}</a>…</p>
</body>
</html>
"""

def process_language(lang_code, country_name):
    data_dir = f"public/data/{lang_code}"
    output_base_dir = f"public/{lang_code}/episodes"
    output_jack_dir = f"public/{lang_code}/jackandthepack"
    output_specials_dir = f"public/{lang_code}/specials"

    print(f"\n🌍 Processing: {lang_code.upper()} ({country_name})")

    # Seasons
    for filename in os.listdir(data_dir):
        if not filename.startswith("season") or not filename.endswith(".json"):
            continue

        season_num = filename[len("season"):-len(".json")]
        season_str = season_num.zfill(2)

        with open(os.path.join(data_dir, filename), "r", encoding="utf-8") as f:
            data = json.load(f)

        episodes = data.get(f"season{season_num}", {}).get("episodes", [])
        if not episodes:
            print(f"⚠️ No episodes found in {filename}")
            continue

        for ep in episodes:
            ep_num = ep.get("episode_number")
            if ep_num is None:
                continue

            ep_num_str = str(ep_num).zfill(2)
            ep_code = f"{season_str}{ep_num_str}"
            title = ep.get("uk_title", f"Episode {ep_num_str}")
            cover = ep.get("cover", "")

            html_content = generate_redirect_html(
                ep_code, title, cover, season_str, ep_num_str, lang_code, country_name
            )

            output_dir = os.path.join(output_base_dir, season_str, ep_num_str)
            ensure_dir(output_dir)

            with open(os.path.join(output_dir, "index.html"), "w", encoding="utf-8") as out_file:
                out_file.write(html_content)

            print(f"✅ Generated episode {ep_code}: {title}")

    # Jack and the Pack
    jack_path = os.path.join(data_dir, "jackandthepack.json")
    if os.path.exists(jack_path):
        with open(jack_path, "r", encoding="utf-8") as f:
            jack_data = json.load(f)

        episodes = jack_data.get("jackandthepack", {}).get("episodes", [])
        if not episodes:
            print("⚠️ No Jack episodes found")
        else:
            for ep in episodes:
                ep_num = ep.get("episode_number")
                if ep_num is None:
                    continue

                ep_num_str = str(ep_num).zfill(2)
                ep_code = f"JACK{ep_num_str}"
                title = ep.get("uk_title", f"Jack Episode {ep_num_str}")
                cover = ep.get("cover", "")

                html_content = generate_redirect_html(
                    ep_code, title, cover, "Jack & the Sodor Construction Company", ep_num_str, lang_code, country_name
                )

                output_dir = os.path.join(output_jack_dir, ep_num_str)
                ensure_dir(output_dir)

                with open(os.path.join(output_dir, "index.html"), "w", encoding="utf-8") as out_file:
                    out_file.write(html_content)

                print(f"✅ Generated JACK{ep_num_str}: {title}")

    # Specials
    specials_path = os.path.join(data_dir, "specials.json")
    if os.path.exists(specials_path):
        with open(specials_path, "r", encoding="utf-8") as f:
            specials_data = json.load(f)

        specials = specials_data.get("specials", {}).get("episodes", [])
        if not specials:
            print("⚠️ No specials found")
        else:
            for ep in specials:
                ep_num = ep.get("episode_number")
                if ep_num is None:
                    continue

                ep_num_str = str(ep_num).zfill(2)
                ep_code = f"SPL{ep_num_str}"
                title = ep.get("uk_title", f"Special {ep_num_str}")
                cover = ep.get("cover", "")

                html_content = generate_redirect_html(
                    ep_code, title, cover, "Specials", ep_num_str, lang_code, country_name
                )

                output_dir = os.path.join(output_specials_dir, ep_num_str)
                ensure_dir(output_dir)

                with open(os.path.join(output_dir, "index.html"), "w", encoding="utf-8") as out_file:
                    out_file.write(html_content)

                print(f"✅ Generated SPL{ep_num_str}: {title}")

def process_tugs():
    tugs_data_path = "public/data/tugs.json"
    output_tugs_dir = "public/tugs"

    print("\n🚢 Processing: TUGS")

    if not os.path.exists(tugs_data_path):
        print("⚠️ TUGS data file not found")
        return

    with open(tugs_data_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    episodes = data.get("tugs", {}).get("episodes", [])
    if not episodes:
        print("⚠️ No TUGS episodes found")
        return

    for ep in episodes:
        ep_num = ep.get("episode_number")
        if ep_num is None:
            continue

        ep_num_str = str(ep_num).zfill(2)
        ep_code = f"TG{ep_num_str}"
        title = ep.get("uk_title", f"TUGS Episode {ep_num_str}")
        cover = ep.get("cover", "")

        # season_num can be a fixed string for TUGS since it is not a season/series
        season_num = "TUGS"

        html_content = generate_redirect_html(
            ep_code, title, cover, season_num, ep_num_str, "en-gb", "TUGS"
        )

        output_dir = os.path.join(output_tugs_dir, ep_num_str)
        ensure_dir(output_dir)

        with open(os.path.join(output_dir, "index.html"), "w", encoding="utf-8") as out_file:
            out_file.write(html_content)

        print(f"✅ Generated TG{ep_num_str}: {title}")

def main():
    languages = {
        "en-gb": "UK",
        "en-us": "US"
    }

    for lang_code, country_name in languages.items():
        process_language(lang_code, country_name)

    process_tugs()

    print("\n🎉 All redirect pages generated for all languages and TUGS!")

if __name__ == "__main__":
    main()
