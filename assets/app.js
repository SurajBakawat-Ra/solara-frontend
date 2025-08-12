/* global API_BASE */
const grid = document.getElementById("gamesGrid");
const platformFilter = document.getElementById("platformFilter");
const searchInput = document.getElementById("searchInput");
const trailerModal = document.getElementById("trailerModal");
const ytFrame = document.getElementById("ytFrame");
const closeModal = document.getElementById("closeModal");
const contactForm = document.getElementById("contactForm");
const contactHint = document.getElementById("contactHint");

document.getElementById("year").textContent = new Date().getFullYear();

let games = [];

async function loadGames() {
  try {
    if (API_BASE) {
      const res = await fetch(`${API_BASE}/api/games`);
      if (!res.ok) throw new Error("API error");
      games = await res.json();
      contactHint.textContent = "Contact form will send via your API.";
    } else {
      const res = await fetch("data/games.json");
      games = await res.json();
      contactHint.textContent = "No API configured yet, the form will not send.";
    }
  } catch (e) {
    console.error("Falling back to local data:", e);
    const res = await fetch("data/games.json");
    games = await res.json();
    contactHint.textContent = "API unavailable; using local data.";
  }
  render();
}

function render() {
  const q = searchInput.value.trim().toLowerCase();
  const pf = platformFilter.value;
  const filtered = games.filter(g => {
    const inPlatform = !pf || g.platforms?.includes(pf);
    const inQuery = !q || g.title.toLowerCase().includes(q) || (g.tags||[]).join(" ").toLowerCase().includes(q);
    return inPlatform && inQuery;
  });

  grid.innerHTML = "";
  for (const g of filtered) {
    grid.appendChild(gameCard(g));
  }
}

function gameCard(g) {
  const card = document.createElement("article");
  card.className = "game-card";

  const img = document.createElement("img");
  img.alt = `${g.title} cover`;
  img.src = g.images?.cover || "";
  card.appendChild(img);

  const content = document.createElement("div");
  content.className = "content";
  const h3 = document.createElement("h3");
  h3.textContent = g.title;
  const p = document.createElement("p");
  p.textContent = g.description || "";
  const badges = document.createElement("div");
  badges.className = "badges";
  for (const plat of (g.platforms || [])) {
    const b = document.createElement("span");
    b.className = "badge";
    b.textContent = plat;
    badges.appendChild(b);
  }
  for (const tag of (g.tags || [])) {
    const b = document.createElement("span");
    b.className = "badge";
    b.textContent = tag;
    badges.appendChild(b);
  }

  const actions = document.createElement("div");
  actions.className = "actions";
  const storeLinks = g.stores || {};
  if (storeLinks.steam) {
    const a = document.createElement("a");
    a.href = storeLinks.steam; a.target = "_blank"; a.rel = "noopener";
    a.textContent = "Steam";
    actions.appendChild(a);
  }
  if (storeLinks.googlePlay) {
    const a = document.createElement("a");
    a.href = storeLinks.googlePlay; a.target = "_blank"; a.rel = "noopener";
    a.textContent = "Google Play";
    actions.appendChild(a);
  }
  if (g.trailer) {
    const btn = document.createElement("button");
    btn.textContent = "Watch trailer";
    btn.addEventListener("click", () => openTrailer(g.trailer));
    actions.appendChild(btn);
  }

  content.appendChild(h3);
  content.appendChild(p);
  content.appendChild(badges);
  content.appendChild(actions);
  card.appendChild(content);
  return card;
}

function openTrailer(ytId) {
  ytFrame.src = `https://www.youtube.com/embed/${ytId}?autoplay=1`;
  trailerModal.showModal();
}
closeModal.addEventListener("click", () => {
  trailerModal.close();
  ytFrame.src = "";
});
trailerModal.addEventListener("close", () => { ytFrame.src = ""; });

platformFilter.addEventListener("change", render);
searchInput.addEventListener("input", render);

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(contactForm);
  const payload = Object.fromEntries(formData.entries());

  if (!API_BASE) {
    alert("No API configured yet. Set API_BASE in config.js after deploying your backend.");
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/api/contact`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to send");
    const j = await res.json();
    alert("Thanks! Message received.");
    contactForm.reset();
  } catch (err) {
    console.error(err);
    alert("Something went wrong sending your message.");
  }
});

loadGames();
