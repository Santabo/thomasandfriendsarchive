# Thomas & Friends Archive

Static Thomas archive site hosted on Vercel.

## Project layout

- `public/`: static web app, episode pages, and data files.
- `public/scripts/`: browser-side behavior.
- `generate_previews.py`: utility script to regenerate social-preview redirect pages.
- `vercel.json`: Vercel rewrites, redirects, and response headers.

## Regenerating preview pages

Run the generator from repo root:

```bash
python3 generate_previews.py
```

You can also limit generation to one language:

```bash
python3 generate_previews.py --lang en-gb
python3 generate_previews.py --lang en-us
```

The script regenerates HTML files under:

- `public/en-gb/episodes/**`
- `public/en-us/episodes/**`
- `public/*/specials/**`
- `public/*/jackandthepack/**`
- `public/tugs/**`
