# Unity WebGL games

Every browser-playable game lives in its own folder inside this directory, and each one is listed in
`data/unity-games.json`.

```
unity-games/
  README.md
  example-game/          <- one folder per game
    index.html           <- the build's entry point
    Build/               <- loader.js, .data, .framework.js, .wasm
    TemplateData/
```

## Add a game

1. In Unity: **File → Build Settings → WebGL → Switch Platform**, then **Build**.
2. Copy the **contents** of the build output folder into a new folder here, e.g. `unity-games/my-game/`.
   Make sure `unity-games/my-game/index.html` exists (it is Unity's generated page).
3. Add an entry to `data/unity-games.json`:

```json
{
  "id": "my-game",
  "title": "My Game",
  "image": "my-game.jpg",
  "platforms": ["WebGL"],
  "description": "One or two sentences about the game."
}
```

`id` must match the folder name. `path` is optional and defaults to `unity-games/<id>/index.html`; set it only
when the build lives somewhere else (an external URL also works).

## Cover images

Game covers are not linked from other sites — they live in the repository's `images/` folder and the JSON only
stores the file name. Save the cover as `images/<id>.jpg` and point `image` at just the name (`"my-game.jpg"`).

- Cover images must be **square (1:1)**. `images/` uses 640 × 640 JPGs.
- Absolute URLs and paths (`https://…`, `images/foo.jpg`) still work if a file has to live elsewhere.

## Remove a game

Delete its folder and its object from `data/unity-games.json`.

## Notes

- WebGL builds must be served over HTTP(S). Opening `index.html` from the file system will not work — run a
  local server (`python -m http.server`) or deploy to GitHub Pages as usual.
- Keep the whole build folder. Unity's `.data`, `.wasm`, `.framework.js` and `TemplateData/` files are all
  required.
- `example-game/` is a placeholder page that explains this setup, with `images/example-game.jpg` as its cover.
  Delete the folder, the image and its JSON entry once you have real builds.
