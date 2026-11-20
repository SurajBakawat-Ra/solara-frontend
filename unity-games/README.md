# Web games (Unity WebGL)

Each playable browser game lives in **its own GitHub repository**, published with GitHub Pages. This
repository stores no game builds — only the card data in `data/unity-games.json` and a cover image in
`images/`. The site embeds the published game in an iframe.

```
rocket-autos repo (Unity WebGL build)
        │  GitHub Pages
        ▼
https://<user>.github.io/rocket-autos/   ← iframe src from data/unity-games.json
```

## The JSON entry

`data/unity-games.json`:

```json
[
  {
    "id": "rocket-autos",
    "title": "Rocket Autos",
    "image": "rocket-autos.jpg",
    "platforms": ["WebGL"],
    "description": "One or two sentences about the game.",
    "path": "https://<user>.github.io/rocket-autos/"
  }
]
```

| Field | Meaning |
| --- | --- |
| `id` | Stable slug. Used by the play buttons and for the cover file name. |
| `title` | Card heading. |
| `image` | Cover file name inside `images/` (see below). |
| `platforms` | Badges shown on the card. |
| `description` | Card text. |
| `path` | Where the build is served from. **An absolute URL** loads the game from its own Pages site. **A relative path or omitting it** falls back to `unity-games/<id>/index.html` inside this repo (handy for local testing). |

## Publish a game (once per game)

1. **In Unity:** `File → Build Settings → WebGL → Switch Platform`, then `Build`.
   In *Player Settings → Publishing Settings*:
   - enable **Decompression Fallback** — GitHub Pages will not send `Content-Encoding`, so the loader
     must decompress in the browser;
   - leave *Development Build* off.
2. **Create a repo** for the game (for example `rocket-autos`) and push the **contents** of the build
   output to its root, so `index.html`, `Build/` and `TemplateData/` sit at the top level.
3. **Enable Pages:** repo → *Settings → Pages → Source: Deploy from a branch → `main` → `/ (root)`*.
4. Wait for the deployment, then open `https://<user>.github.io/<repo>/` on its own. The game must run
   there before the site can embed it.
5. Paste that URL into `path` in `data/unity-games.json` and add a cover (below).

A custom domain works too — use whatever Pages reports as the site URL.

## Updating a game

Push to the game repo. Pages redeploys on its own, so the new build is live without touching this site.
Pages caches for a few minutes; Unity also caches builds in IndexedDB, so a hard refresh may be needed
after a large upload.

## Adding or removing a game on the site

- **Add:** one object in `data/unity-games.json` + `images/<id>.jpg`. Nothing else.
- **Remove:** delete the JSON object (and its cover). The game repo can stay online or be deleted
  separately.

## Cover images

Covers are not hotlinked — they live in this repository's `images/` folder and the JSON stores only the
file name.

- Square (1:1), 640 × 640 JPG: `images/rocket-autos.jpg`.
- Absolute URLs still work if a cover has to live elsewhere.

## Local development

- To test the real published game: just serve this site (`python -m http.server`) with internet access.
- To test a build locally: drop it in `unity-games/<id>/index.html`, leave `path` relative or remove it,
  and serve over HTTP. Opening the page from `file://` will not load WebGL builds.

## Notes

- Everything is HTTPS, and cross-origin iframes are fine — GitHub Pages does not send `X-Frame-Options`.
- Relative asset paths are what make this work: the Unity loader requests `Build/…` next to its own
  `index.html`, so the build must be at the repo root (a `<repo>/build/` subfolder also works if
  `path` points at it).
- The game repo is public, so a careful reader can find and play the build directly. Fine for public
  games; not a place for anything private.
