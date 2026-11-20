/* Solara Games — frontend only. Game data lives in JSON files. */

const CATALOG_URL = "data/games.json";
const WEBGL_URL = "data/unity-games.json";

const state = {
  games: [],
  webGames: [],
  platform: "all",
  query: "",
  currentWebGame: null,
};

const els = {
  header: document.getElementById("siteHeader"),
  navLinks: document.getElementById("navLinks"),
  navToggle: document.getElementById("navToggle"),
  grid: document.getElementById("gamesGrid"),
  gamesEmpty: document.getElementById("gamesEmpty"),
  webGrid: document.getElementById("webGrid"),
  webEmpty: document.getElementById("webEmpty"),
  webCount: document.getElementById("webCount"),
  resultCount: document.getElementById("resultCount"),
  chips: document.getElementById("platformChips"),
  search: document.getElementById("searchInput"),
  statTitles: document.getElementById("statTitles"),
  statPlatforms: document.getElementById("statPlatforms"),
  statWeb: document.getElementById("statWeb"),
  trailerModal: document.getElementById("trailerModal"),
  trailerTitle: document.getElementById("trailerTitle"),
  ytFrame: document.getElementById("ytFrame"),
  playerModal: document.getElementById("playerModal"),
  playerFrame: document.getElementById("playerFrame"),
  playerTitle: document.getElementById("playerTitle"),
  playerOverlay: document.getElementById("playerOverlay"),
  playerMessage: document.getElementById("playerMessage"),
};

/* ------------------------------- helpers ------------------------------- */

const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));

const PLACEHOLDER_IMG =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#161b2b"/><stop offset="1" stop-color="#0b0d15"/>' +
    "</linearGradient></defs>" +
    '<rect width="640" height="640" fill="url(#g)"/>' +
    '<g fill="none" stroke="#ffc857" stroke-opacity=".45" stroke-width="3">' +
    '<circle cx="320" cy="320" r="46"/><path d="m308 302 30 18-30 18z" fill="#ffc857" stroke="none"/>' +
    "</g></svg>"
  );

/* Game images live in /images and are referenced by file name in the JSON. */
const IMAGE_DIR = "images/";

function imageUrl(name) {
  const value = String(name ?? "").trim();
  if (!value) return PLACEHOLDER_IMG;
  /* Absolute URLs, data URIs and explicit paths keep working as-is. */
  if (/^(?:https?:|data:|\/|\.{1,2}\/)/i.test(value) || value.includes("/")) return value;
  return IMAGE_DIR + value;
}

const storeLabel = (key) => {
  const map = {
    steam: "Steam",
    googlePlay: "Google Play",
    itch: "itch.io",
    appStore: "App Store",
    epic: "Epic Games",
    website: "Website",
  };
  return map[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
};

/* ------------------------------- data ------------------------------- */

async function loadJson(url, fallback = []) {
  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    return Array.isArray(data) ? data : fallback;
  } catch (err) {
    console.warn(`Could not load ${url}:`, err);
    return fallback;
  }
}

function organiseWebGames(list) {
  const seen = new Set();
  return list
    .filter((g) => g && g.title)
    .map((g) => {
      const id = String(g.id || g.title).trim();
      let path = g.path || `unity-games/${id}/index.html`;
      if (/^[\w.-]+\/index\.html$/.test(path)) path = `unity-games/${path}`;
      return { ...g, id, path };
    })
    .filter((g) => (seen.has(g.id) ? false : seen.add(g.id)));
}

function platformsOf(games) {
  return [...new Set(games.flatMap((g) => g.platforms || []))].filter(Boolean);
}

/* ------------------------------- stats ------------------------------- */

function updateStats() {
  const platforms = platformsOf(state.games);
  els.statTitles.textContent = state.games.length;
  els.statPlatforms.textContent = platforms.length;
  els.statWeb.textContent = state.webGames.length;
  els.webCount.textContent = `${state.webGames.length} playable`;
}

/* ------------------------------- catalogue ------------------------------- */

function renderChips() {
  const platforms = ["all", ...platformsOf(state.games)];
  els.chips.innerHTML = platforms
    .map((p) => {
      const label = p === "all" ? "All platforms" : p;
      return `<button class="chip" role="tab" data-platform="${esc(p)}"
        aria-selected="${state.platform === p}">${esc(label)}</button>`;
    })
    .join("");
}

function renderCatalog() {
  const q = state.query.trim().toLowerCase();
  const filtered = state.games.filter((g) => {
    const onPlatform = state.platform === "all" || (g.platforms || []).includes(state.platform);
    const haystack = [g.title, ...(g.tags || [])].join(" ").toLowerCase();
    return onPlatform && (!q || haystack.includes(q));
  });

  els.grid.innerHTML = filtered.map(catalogCard).join("");
  els.gamesEmpty.hidden = filtered.length > 0;
  els.resultCount.textContent = `${filtered.length} of ${state.games.length} games`;
}

function catalogCard(g) {
  const platforms = (g.platforms || []).filter(Boolean);
  const tags = (g.tags || []).filter(Boolean);
  const stores = Object.entries(g.stores || {}).filter(([, url]) => Boolean(url));

  const badges = tags.map((t) => `<span class="badge">${esc(t)}</span>`).join("");
  const storeActions = stores
    .slice(0, 2)
    .map(
      ([key, url]) =>
        `<a class="btn btn-sm btn-store" href="${esc(url)}" target="_blank" rel="noopener">${esc(storeLabel(key))}</a>`
    )
    .join("");
  const trailerAction = g.trailer
    ? `<button class="btn btn-sm btn-ghost" data-trailer="${esc(g.trailer)}" data-title="${esc(g.title)}">
         <svg viewBox="0 0 24 24" aria-hidden="true" class="icon">
           <path d="M9 6.5v11l9-5.5-9-5.5Z" fill="currentColor" />
         </svg>
         Trailer
       </button>`
    : "";

  return `
    <article class="game-card">
      <div class="thumb">
        <img src="${esc(imageUrl(g.images?.cover))}" alt="${esc(g.title)} cover art" loading="lazy"
          onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}'" />
        ${platforms.length ? `<span class="thumb-platform">${esc(platforms[0])}</span>` : ""}
      </div>
      <div class="card-body">
        <h3>${esc(g.title)}</h3>
        <p class="card-desc">${esc(g.description)}</p>
        ${badges ? `<div class="badges">${badges}</div>` : ""}
        <div class="actions">${storeActions}${trailerAction}</div>
      </div>
    </article>`;
}

/* ------------------------------- browser games ------------------------------- */

function renderWebGames() {
  els.webGrid.innerHTML = state.webGames.map(webCard).join("");
  els.webEmpty.hidden = state.webGames.length > 0;
}

function webCard(g) {
  const platforms = (g.platforms || []).filter(Boolean);
  return `
    <article class="web-card">
      <div class="web-thumb">
        <img src="${esc(imageUrl(g.image))}" alt="${esc(g.title)} cover art" loading="lazy"
          onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}'" />
        <div class="web-play">
          <button class="play-btn" data-play="${esc(g.id)}" aria-label="Play ${esc(g.title)}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" /></svg>
          </button>
        </div>
      </div>
      <div class="web-body">
        <h3>${esc(g.title)}</h3>
        <p>${esc(g.description)}</p>
        <div class="web-foot">
          <div class="badges">${platforms.map((p) => `<span class="badge">${esc(p)}</span>`).join("")}</div>
          <button class="btn btn-sm btn-primary" data-play="${esc(g.id)}">Play now</button>
        </div>
      </div>
    </article>`;
}

/* ------------------------------- webgl player ------------------------------- */

/* A game build is either an absolute URL (its own GitHub Pages repo) or a
   folder inside this repo. `path` is optional and defaults to the folder. */
function resolveGamePath(g) {
  const path = String(g.path ?? "").trim();
  if (!path) return `unity-games/${g.id}/index.html`;
  return /^https?:\/\//i.test(path) ? path : path.replace(/^\.?\//, "");
}

async function openPlayer(id) {
  const game = state.webGames.find((g) => g.id === id);
  if (!game) return;

  const url = resolveGamePath(game);
  const isRemote = /^https?:\/\//i.test(url);

  state.currentWebGame = game;
  els.playerTitle.textContent = game.title;
  els.playerMessage.textContent = "Loading the build…";
  els.playerOverlay.classList.remove("hidden");
  els.playerOverlay.querySelector(".spinner")?.classList.remove("hidden");
  els.playerFrame.src = "about:blank";

  els.playerModal.showModal();

  if (!isRemote) {
    /* Friendly message when the build folder has not been dropped in yet. */
    try {
      const res = await fetch(url, { method: "HEAD", cache: "no-store" });
      if (!res.ok) {
        showPlayerError(
          `No build found at ${url}. Add the Unity WebGL export to that folder, or run the site from a local web server (file:// cannot serve WebGL builds).`
        );
        return;
      }
    } catch {
      showPlayerError(
        "Could not reach the build. If you opened this page directly from disk, serve the site over HTTP instead — WebGL builds will not load from file://."
      );
      return;
    }
  }

  els.playerFrame.src = url;
}

function showPlayerError(message) {
  els.playerOverlay.classList.remove("hidden");
  els.playerOverlay.querySelector(".spinner")?.classList.add("hidden");
  els.playerMessage.textContent = message;
}

function closePlayer() {
  els.playerModal.close();
}

function resetPlayer() {
  els.playerFrame.src = "about:blank";
  state.currentWebGame = null;
  const element = document.fullscreenElement || document.webkitFullscreenElement;
  if (element) {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (exit) Promise.resolve(exit.call(document)).catch(() => {});
  }
}

/* ------------------------------- trailers ------------------------------- */

function openTrailer(ytId, title) {
  els.trailerTitle.textContent = title ? `${title} — trailer` : "Trailer";
  els.ytFrame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(ytId)}?autoplay=1&rel=0`;
  els.trailerModal.showModal();
}

function closeTrailer() {
  els.trailerModal.close();
  els.ytFrame.src = "";
}

/* ------------------------------- ui wiring ------------------------------- */

function wireUi() {
  document.getElementById("year").textContent = new Date().getFullYear();

  /* header state + mobile nav */
  const onScroll = () => els.header.classList.toggle("is-scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  els.navToggle.addEventListener("click", () => {
    const open = els.navToggle.getAttribute("aria-expanded") === "true";
    els.navToggle.setAttribute("aria-expanded", String(!open));
    els.navLinks.classList.toggle("open", !open);
  });
  els.navLinks.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      els.navLinks.classList.remove("open");
      els.navToggle.setAttribute("aria-expanded", "false");
    }
  });

  /* catalogue filters */
  els.chips.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-platform]");
    if (!chip) return;
    state.platform = chip.dataset.platform;
    els.chips.querySelectorAll(".chip").forEach((c) =>
      c.setAttribute("aria-selected", String(c.dataset.platform === state.platform))
    );
    renderCatalog();
  });

  let searchTimer;
  els.search.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.query = els.search.value;
      renderCatalog();
    }, 120);
  });

  /* cards: trailers + webgl play */
  document.addEventListener("click", (e) => {
    const playBtn = e.target.closest("[data-play]");
    if (playBtn) {
      openPlayer(playBtn.dataset.play);
      return;
    }
    const trailerBtn = e.target.closest("[data-trailer]");
    if (trailerBtn) {
      openTrailer(trailerBtn.dataset.trailer, trailerBtn.dataset.title);
    }
  });

  document.querySelector("[data-close-trailer]").addEventListener("click", closeTrailer);
  els.trailerModal.addEventListener("close", () => { els.ytFrame.src = ""; });
  els.trailerModal.addEventListener("click", (e) => {
    if (e.target === els.trailerModal) closeTrailer();
  });

  /* player */
  document.getElementById("playerClose").addEventListener("click", closePlayer);
  els.playerModal.addEventListener("close", resetPlayer);
  els.playerModal.addEventListener("click", (e) => {
    if (e.target === els.playerModal) closePlayer();
  });
  els.playerFrame.addEventListener("load", () => {
    if (els.playerFrame.src && els.playerFrame.src !== "about:blank") {
      els.playerOverlay.classList.add("hidden");
    }
  });
  const fsBtn = document.getElementById("playerFullscreen");
  const fsStage = document.getElementById("playerStage");
  const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement || null;
  const syncFullscreenUi = () => {
    const on = Boolean(fullscreenElement());
    fsBtn.classList.toggle("is-fs", on);
    fsBtn.setAttribute("aria-pressed", String(on));
    fsBtn.setAttribute("aria-label", on ? "Exit fullscreen" : "Enter fullscreen");
  };
  fsBtn.addEventListener("click", () => {
    if (fullscreenElement()) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) Promise.resolve(exit.call(document)).catch(() => {});
      return;
    }
    /* The stage goes fullscreen (not the dialog): the iframe then fills the screen. */
    const request = fsStage.requestFullscreen || fsStage.webkitRequestFullscreen;
    if (!request) {
      showPlayerError("This browser does not support fullscreen. Press F11 for a browser-wide fullscreen view.");
      return;
    }
    try {
      const result = request.call(fsStage);
      if (result && result.catch) result.catch(() => {});
    } catch {
      /* Ignore: the browser refused the request (e.g. permissions policy). */
    }
  });
  document.addEventListener("fullscreenchange", syncFullscreenUi);
  document.addEventListener("webkitfullscreenchange", syncFullscreenUi);

  /* copy email */
  const copyBtn = document.getElementById("copyEmail");
  const copyStatus = document.getElementById("copyStatus");
  copyBtn?.addEventListener("click", async () => {
    const email = copyBtn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      copyStatus.textContent = "Copied to clipboard.";
    } catch {
      copyStatus.textContent = email;
    }
    setTimeout(() => { copyStatus.textContent = ""; }, 3200);
  });

  /* scroll reveal */
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document
      .querySelectorAll(".section-head, .game-card, .web-card, .feature, .contact-panel, .studio-copy")
      .forEach((el) => el.classList.add("reveal"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: .08 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  }
}

/* ------------------------------- boot ------------------------------- */

async function init() {
  wireUi();

  const [games, webGames] = await Promise.all([
    loadJson(CATALOG_URL),
    loadJson(WEBGL_URL).then(organiseWebGames),
  ]);

  state.games = games;
  state.webGames = webGames;

  renderChips();
  renderCatalog();
  renderWebGames();
  updateStats();
}

init();
