# Solara Games Website (Go API + GitHub Pages Frontend)

This is a ready-to-deploy starter for **Solara**:
- **Frontend**: Static HTML/CSS/JS (deploy on GitHub Pages).
- **Backend**: Go API for games data + contact form (deploy anywhere you can run a container).

## Project Structure
```
solara-site/
  backend/        # Go API (CORS enabled)
    Dockerfile
    main.go
  frontend/       # Static site for GitHub Pages
    assets/
      app.js
      styles.css
    data/
      games.json  # Local fallback data (also used for dev)
    config.js     # Set API_BASE when your backend is live
    index.html
```

## How it works
- The site tries `GET {API_BASE}/api/games`. If `API_BASE` is not set or unavailable, it falls back to `data/games.json`.
- The **Contact** form POSTs to `{API_BASE}/api/contact`. If no API is configured, users are warned and the form won’t send.
- Trailer buttons open a modal with a YouTube embed (IDs prefilled for games you shared).

## Local development
Open `frontend/index.html` in a browser (you can use a simple server to avoid CORS):
```bash
cd frontend
python3 -m http.server 8000
# then visit http://localhost:8000
```
For the API locally:
```bash
cd backend
go run main.go
# API at http://localhost:8080
# You may set ALLOW_ORIGIN=http://localhost:8000 for CORS during dev.
```

## Deploy the backend (one option: Fly.io)
1. Install Fly.io CLI and login.
2. From `backend/`, run:
   ```bash
   fly launch --now --build-only=false --copy-config --generate-name
   # accept defaults, choose closest region
   fly secrets set ALLOW_ORIGIN=https://<your-username>.github.io
   ```
3. After deployment, note your public URL, e.g. `https://solara-api.fly.dev`.
4. Set that in `frontend/config.js` as `API_BASE`.

(You can also use Render, Railway, Google Cloud Run, etc. Anywhere that runs a container works. The provided Dockerfile builds a small static Go binary.)

## Deploy the frontend on GitHub Pages
1. Create a new GitHub repo (e.g., `solara-games`).
2. Commit/push the contents of `frontend/` to the repo root (or keep this entire project and publish only the `frontend/` folder via GitHub Actions).
3. In **Settings → Pages**, choose the branch (e.g., `main`) and `/ (root)`.
4. Your site will be at `https://<your-username>.github.io/<repo>/` or at the user site root if using the special `username.github.io` repo.

> If your Pages URL includes a subpath, everything here works as-is because the site uses relative paths.

## Environment
- `PORT` (default `8080`)
- `ALLOW_ORIGIN` (default `*`) — set this to your GitHub Pages origin for stricter CORS in production, e.g. `https://<your-username>.github.io`

## Extending the API
- Add new games by editing the `games` slice in `backend/main.go` and the `frontend/data/games.json` fallback.
- Integrate email by wiring `/api/contact` to your SMTP or a provider (SendGrid/Mailgun).

## Notes
- Images currently use YouTube thumbnails for games with trailers. Replace with your own artwork by editing `images.cover` fields.
- The site is fully static and framework‑free; you can later port it to React/Vue if you want dynamic routing.
