/* ==========================================================
   Configuration EmailJS
   ----------------------------------------------------------
   Remplace ces trois valeurs par celles de ton compte EmailJS.
   Voir README.md pour la procédure détaillée.

   Recommandation sécurité :
   -> Depuis le dashboard EmailJS, active "Allowed Origins"
      et limite l'envoi à ton domaine GitHub Pages
      (ex: https://ton-user.github.io) afin d'éviter
      l'utilisation abusive de ta clé publique.
   ========================================================== */
const EMAILJS_PUBLIC_KEY = "VOTRE_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "VOTRE_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "VOTRE_TEMPLATE_ID";

/* ==========================================================
   Données modifiables : les activités proposées
   Change librement le titre, l'emoji ou la description.
   ========================================================== */
const activities = [
  {
    id: "theme-park",
    emoji: "🎢",
    title: "Journée dans un parc d’attractions",
    description: "Des manèges, des cris, des sensations fortes… et probablement moi qui prétends ne pas avoir peur."
  },
  {
    id: "chill-cinema",
    emoji: "🍿",
    title: "Journée chill : cinéma et balade",
    description: "Programme intensif : film, détente, balade et potentiellement beaucoup trop de nourriture."
  },
  {
    id: "mystery-city",
    emoji: "🗺️",
    title: "Balade surprise dans une ville inconnue",
    description: "Une journée dans un endroit mystérieux. Le lieu est inconnu, mais l’accompagnateur est normalement fiable."
  },
  {
    id: "north-sea",
    emoji: "🌊",
    title: "Renouer avec la mer du Nord",
    description: "Du vent, la mer, peut-être du sable dans les chaussures… Mais t’inquiète, ça va être romantique. Mdrr."
  },
  {
    id: "nature-walk",
    emoji: "🌿",
    title: "Balade dans la nature",
    description: "Une escapade au calme, à marcher, discuter et prendre des photos comme de vrais aventuriers."
  }
];

/* ID spécial : quand cette activité est dans le podium, la section film apparaît */
const CINEMA_ID = "chill-cinema";

const movieGenres = [
  { id: "comedie", emoji: "😂", label: "Comédie" },
  { id: "romance", emoji: "❤️", label: "Romance" },
  { id: "horreur", emoji: "😱", label: "Horreur" },
  { id: "sf", emoji: "🚀", label: "Science-fiction" },
  { id: "super-heros", emoji: "🦸", label: "Super-héros" },
  { id: "thriller", emoji: "🔍", label: "Thriller" },
  { id: "auteur", emoji: "🎭", label: "Film d’auteur" },
  { id: "surprise", emoji: "🍿", label: "Peu importe, surprends-moi" }
];

const restaurantLabels = {
  oui: "Évidemment, je ne suis pas venue pour manger des pâtes 🍷",
  non: "Non merci, garde ton argent 🥲",
  surprise: "Surprends-moi 🎁"
};

/* ==========================================================
   État de l'application
   ========================================================== */
const STORAGE_KEY = "date-choice-state-v1";
const SENT_KEY = "date-choice-sent-v1";

let state = {
  podium: [null, null, null], // tableau d'ids d'activités
  restaurant: null,           // "oui" | "non" | "surprise"
  movieGenre: null,           // id de genre de film
  message: ""
};

/* ==========================================================
   Sélecteurs
   ========================================================== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ==========================================================
   Initialisation
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // Initialiser EmailJS
  try {
    if (window.emailjs && EMAILJS_PUBLIC_KEY && !EMAILJS_PUBLIC_KEY.startsWith("VOTRE_")) {
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    }
  } catch (e) {
    console.warn("EmailJS non initialisé :", e);
  }

  loadState();
  renderActivities();
  renderMovieGenres();
  updatePodiumUI();
  updateMovieSectionVisibility();
  updateRestaurantUI();
  restoreMessage();
  spawnFloatingHearts();

  // Bouton démarrer
  $("#start-btn").addEventListener("click", () => {
    const section = $("#activities-section");
    section.classList.remove("hidden");
    setTimeout(() => {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  });

  // Podium : boutons "retirer"
  $$(".btn-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      const rank = parseInt(btn.dataset.remove, 10);
      state.podium[rank - 1] = null;
      compactPodium();
      persistState();
      renderActivities();
      updatePodiumUI();
      updateMovieSectionVisibility();
    });
  });

  // Restaurant
  $$("[data-resto]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.restaurant = btn.dataset.resto;
      persistState();
      updateRestaurantUI();
    });
  });

  // Message perso
  $("#personal-message").addEventListener("input", (e) => {
    state.message = e.target.value;
    persistState();
  });

  // Envoi
  $("#submit-btn").addEventListener("click", handleSubmitClick);
  $("#reset-btn").addEventListener("click", resetAll);
  $("#restart-btn").addEventListener("click", resetAll);

  // Modale
  $("#confirm-yes").addEventListener("click", sendEmail);
  $$("[data-close-modal]").forEach(el => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
});

/* ==========================================================
   Rendu : cartes activités
   ========================================================== */
function renderActivities() {
  const grid = $("#activities-grid");
  grid.innerHTML = "";
  activities.forEach((act, index) => {
    const rank = getRank(act.id); // 1, 2, 3 ou 0
    const isSelected = rank > 0;

    const card = document.createElement("article");
    card.className = "activity-card" + (isSelected ? " selected" : "");
    card.setAttribute("role", "listitem");
    card.style.animationDelay = `${index * 0.08}s`;

    card.innerHTML = `
      <div class="activity-emoji" aria-hidden="true">${act.emoji}</div>
      <h3 class="activity-title">${escapeHtml(act.title)}</h3>
      <p class="activity-desc">${escapeHtml(act.description)}</p>
      <div class="activity-actions">
        <span class="activity-rank-badge" aria-live="polite">${rankLabel(rank)}</span>
        <button class="activity-btn ${isSelected ? "is-in-podium" : ""}" type="button">
          ${isSelected ? "Retirer" : "Ajouter au top 3"}
        </button>
      </div>
    `;

    card.querySelector(".activity-btn").addEventListener("click", () => toggleActivity(act.id));
    grid.appendChild(card);
  });
}

function rankLabel(rank) {
  if (rank === 1) return "🥇 Or";
  if (rank === 2) return "🥈 Argent";
  if (rank === 3) return "🥉 Bronze";
  return "";
}

function getRank(id) {
  const idx = state.podium.indexOf(id);
  return idx === -1 ? 0 : idx + 1;
}

function toggleActivity(id) {
  const rank = getRank(id);
  if (rank > 0) {
    state.podium[rank - 1] = null;
    compactPodium();
  } else {
    const freeSlot = state.podium.indexOf(null);
    if (freeSlot === -1) {
      flashError("Ton podium est complet ! Retire un choix pour en ajouter un autre. 😉");
      return;
    }
    state.podium[freeSlot] = id;
  }
  persistState();
  renderActivities();
  updatePodiumUI();
  updateMovieSectionVisibility();
}

/* Compacte le podium pour éviter les trous : [A, null, C] -> [A, C, null] */
function compactPodium() {
  const filled = state.podium.filter(x => x !== null);
  while (filled.length < 3) filled.push(null);
  state.podium = filled;
}

/* ==========================================================
   Rendu : podium
   ========================================================== */
function updatePodiumUI() {
  for (let i = 1; i <= 3; i++) {
    const id = state.podium[i - 1];
    const slot = $(`.podium-slot[data-rank="${i}"]`);
    const valueEl = $(`.podium-value[data-slot="${i}"]`);
    const removeBtn = $(`.btn-remove[data-remove="${i}"]`);
    if (id) {
      const act = activities.find(a => a.id === id);
      valueEl.textContent = `${act.emoji}  ${act.title}`;
      slot.classList.add("filled");
      removeBtn.hidden = false;
    } else {
      valueEl.textContent = "Aucun choix pour l’instant";
      slot.classList.remove("filled");
      removeBtn.hidden = true;
    }
  }
  const complete = state.podium.every(x => x !== null);
  $("#podium-comment").hidden = !complete;
}

/* ==========================================================
   Rendu : section film (conditionnelle)
   ========================================================== */
function renderMovieGenres() {
  const grid = $("#movie-grid");
  grid.innerHTML = "";
  movieGenres.forEach(g => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "movie-btn" + (state.movieGenre === g.id ? " selected" : "");
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", state.movieGenre === g.id ? "true" : "false");
    btn.dataset.genre = g.id;
    btn.innerHTML = `<span aria-hidden="true">${g.emoji}</span> ${escapeHtml(g.label)}`;
    btn.addEventListener("click", () => {
      state.movieGenre = g.id;
      persistState();
      renderMovieGenres();
    });
    grid.appendChild(btn);
  });
}

function isCinemaInPodium() {
  return state.podium.includes(CINEMA_ID);
}

function updateMovieSectionVisibility() {
  const section = $("#movie-section");
  if (isCinemaInPodium()) {
    section.hidden = false;
  } else {
    section.hidden = true;
    // Réinitialiser la réponse si l'activité est retirée
    if (state.movieGenre !== null) {
      state.movieGenre = null;
      persistState();
      renderMovieGenres();
    }
  }
}

/* ==========================================================
   Rendu : restaurant
   ========================================================== */
function updateRestaurantUI() {
  $$("[data-resto]").forEach(btn => {
    const selected = btn.dataset.resto === state.restaurant;
    btn.classList.toggle("selected", selected);
    btn.setAttribute("aria-checked", selected ? "true" : "false");
  });
}

function restoreMessage() {
  $("#personal-message").value = state.message || "";
}

/* ==========================================================
   Envoi du formulaire
   ========================================================== */
function handleSubmitClick() {
  // Vérifier le podium
  if (!state.podium.every(x => x !== null)) {
    flashError("Minute papillon 🦋, il manque encore des activités dans ton top 3. Cette décision mérite un minimum de sérieux !");
    return;
  }
  // Vérifier genre de film si cinéma présent
  if (isCinemaInPodium() && !state.movieGenre) {
    flashError("Tu as mis le cinéma dans ton podium — dis-moi aussi quel genre de film te fait envie ! 🎬");
    $("#movie-section").scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  clearError();
  openModal();
}

function openModal() {
  const modal = $("#confirm-modal");
  const [id1, id2, id3] = state.podium;
  $("#recap-1").textContent = titleOf(id1);
  $("#recap-2").textContent = titleOf(id2);
  $("#recap-3").textContent = titleOf(id3);
  $("#recap-resto").textContent = state.restaurant ? restaurantLabels[state.restaurant] : "Pas de préférence";
  $("#recap-message").textContent = state.message.trim() || "— (aucun message)";

  const cinema = isCinemaInPodium();
  $("#recap-movie-item").hidden = !cinema;
  if (cinema) {
    const g = movieGenres.find(x => x.id === state.movieGenre);
    $("#recap-movie").textContent = g ? `${g.emoji} ${g.label}` : "—";
  }

  modal.hidden = false;
  $("#confirm-yes").focus();
}

function closeModal() {
  $("#confirm-modal").hidden = true;
}

function titleOf(id) {
  const a = activities.find(x => x.id === id);
  return a ? `${a.emoji} ${a.title}` : "—";
}

async function sendEmail() {
  closeModal();
  const overlay = $("#loading-overlay");
  overlay.hidden = false;

  const cinema = isCinemaInPodium();
  const movieLabel = cinema
    ? (movieGenres.find(g => g.id === state.movieGenre)?.label || "")
    : "Non concerné";

  const params = {
    first_choice: titleOf(state.podium[0]),
    second_choice: titleOf(state.podium[1]),
    third_choice: titleOf(state.podium[2]),
    restaurant_choice: state.restaurant ? restaurantLabels[state.restaurant] : "Pas de préférence",
    movie_genre: movieLabel,
    personal_message: state.message.trim() || "(aucun message)",
    submission_date: new Date().toLocaleString("fr-FR")
  };

  // Si EmailJS pas encore configuré : simuler l'envoi pour tester le flow
  const notConfigured =
    !window.emailjs ||
    EMAILJS_PUBLIC_KEY.startsWith("VOTRE_") ||
    EMAILJS_SERVICE_ID.startsWith("VOTRE_") ||
    EMAILJS_TEMPLATE_ID.startsWith("VOTRE_");

  try {
    if (notConfigured) {
      console.info("[DEMO] EmailJS non configuré — email non envoyé. Payload :", params);
      await new Promise(r => setTimeout(r, 900));
    } else {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
    }
    overlay.hidden = true;
    showSuccess();
    localStorage.setItem(SENT_KEY, "1");
  } catch (err) {
    console.error("Erreur EmailJS :", err);
    overlay.hidden = true;
    flashError("Aïe, l’envoi a échoué. Le pigeon voyageur a fait demi-tour. 🕊️ Réessaie dans un instant.");
  }
}

function showSuccess() {
  $("#welcome").hidden = true;
  $("#activities-section").classList.add("hidden");
  const success = $("#success-screen");
  success.hidden = false;
  success.scrollIntoView({ behavior: "smooth" });
  launchConfetti();
}

/* ==========================================================
   Reset
   ========================================================== */
function resetAll() {
  state = { podium: [null, null, null], restaurant: null, movieGenre: null, message: "" };
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SENT_KEY);
  $("#personal-message").value = "";
  renderActivities();
  renderMovieGenres();
  updatePodiumUI();
  updateMovieSectionVisibility();
  updateRestaurantUI();
  clearError();
  $("#success-screen").hidden = true;
  $("#welcome").hidden = false;
  $("#activities-section").classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ==========================================================
   Erreurs & helpers
   ========================================================== */
function flashError(msg) {
  const el = $("#form-error");
  el.textContent = msg;
  el.hidden = false;
  el.style.animation = "none";
  requestAnimationFrame(() => { el.style.animation = ""; });
}
function clearError() {
  const el = $("#form-error");
  el.hidden = true;
  el.textContent = "";
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

/* ==========================================================
   Persistance localStorage
   ========================================================== */
function persistState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { /* ignore */ }
}
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.podium) && parsed.podium.length === 3) {
        state = { ...state, ...parsed };
      }
    }
  } catch (e) { /* ignore */ }
}

/* ==========================================================
   Fond : petits cœurs / étoiles flottants
   ========================================================== */
function spawnFloatingHearts() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const container = $(".floating-bg");
  const emojis = ["💗", "✨", "💖", "🌸", "⭐", "💫"];
  const count = 14;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "floating-item";
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = `${Math.random() * 100}%`;
    el.style.fontSize = `${14 + Math.random() * 18}px`;
    const duration = 15 + Math.random() * 20;
    el.style.animationDuration = `${duration}s`;
    el.style.animationDelay = `${-Math.random() * duration}s`;
    container.appendChild(el);
  }
}

/* ==========================================================
   Confettis (canvas simple, sans dépendance)
   ========================================================== */
function launchConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = $("#confetti-canvas");
  const ctx = canvas.getContext("2d");
  const parent = canvas.parentElement;
  const resize = () => {
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
  };
  resize();
  window.addEventListener("resize", resize);

  const colors = ["#d94867", "#ff8fa3", "#ffd6e0", "#e5d4ff", "#ffe8d6", "#ffb3c1"];
  const pieces = Array.from({ length: 140 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height,
    r: 4 + Math.random() * 6,
    c: colors[Math.floor(Math.random() * colors.length)],
    vy: 2 + Math.random() * 3,
    vx: -1.5 + Math.random() * 3,
    rot: Math.random() * Math.PI,
    vr: -0.1 + Math.random() * 0.2
  }));

  const start = performance.now();
  function frame(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      ctx.restore();
    });
    if (t - start < 5000) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  requestAnimationFrame(frame);
}
