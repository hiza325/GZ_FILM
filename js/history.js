const HISTORY_KEY = "gz-film-history-v1";
const HISTORY_LIMIT = 24;
const HISTORY_DISPLAY_LIMIT = 8;
const RESUMABLE_SECONDS = 5;
const HISTORY_SAVE_INTERVAL = 5000;

function readHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry) => entry && typeof entry.slug === "string" && entry.slug);
  } catch (_error) {
    return [];
  }
}

function writeHistory(entries) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch (_error) {
    // Bỏ qua khi trình duyệt chặn localStorage (chế độ riêng tư, quota đầy...).
  }
}

function getHistoryEntry(slug) {
  if (!slug) return null;
  return readHistory().find((entry) => entry.slug === slug) || null;
}

function saveHistoryEntry(entry) {
  if (!entry?.slug) return;
  const history = readHistory().filter((item) => item.slug !== entry.slug);
  history.unshift(entry);
  writeHistory(history.slice(0, HISTORY_LIMIT));
}

function removeHistoryEntry(slug) {
  if (!slug) return;
  writeHistory(readHistory().filter((entry) => entry.slug !== slug));
}

function clearHistory() {
  writeHistory([]);
}

function formatWatchTime(seconds) {
  const value = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const rest = value % 60;
  const pad = (number) => String(number).padStart(2, "0");
  return hours ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${minutes}:${pad(rest)}`;
}

function isResumableEntry(entry) {
  if (!entry || !Number.isFinite(entry.currentTime)) return false;
  if (entry.currentTime < RESUMABLE_SECONDS) return false;
  if (Number.isFinite(entry.duration) && entry.duration > 0 && entry.currentTime >= entry.duration - 10) return false;
  return true;
}

function historyPosterSource(entry) {
  const path = entry?.poster || "";
  if (!path) return "";
  return path.startsWith("http") ? path : `https://phimimg.com/${path.replace(/^\//, "")}`;
}

function buildContinueCard(entry) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "continue-card";
  card.setAttribute("aria-label", t("history.continueAria", { name: entry.name || "" }));

  const poster = document.createElement("div");
  poster.className = "continue-poster";
  const source = historyPosterSource(entry);
  if (source) {
    const image = document.createElement("img");
    image.src = source;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => {
      image.remove();
      poster.classList.add("is-empty");
    }, { once: true });
    poster.append(image);
  } else {
    poster.classList.add("is-empty");
  }

  const ratio = entry.duration > 0 ? Math.min(1, entry.currentTime / entry.duration) : 0;
  const track = document.createElement("div");
  track.className = "continue-progress";
  const fill = document.createElement("span");
  fill.style.width = `${Math.max(2, Math.round(ratio * 100))}%`;
  track.append(fill);
  poster.append(track);

  if (entry.episodesCount > 1) {
    const badge = document.createElement("span");
    badge.className = "continue-episode";
    badge.textContent = t("history.episode", { number: entry.episodeIndex + 1 });
    poster.append(badge);
  }

  const name = document.createElement("p");
  name.className = "continue-name";
  name.textContent = entry.name || t("movie.unknownName");

  const meta = document.createElement("p");
  meta.className = "continue-meta";
  const timeText = Number.isFinite(entry.duration) && entry.duration > 0
    ? `${formatWatchTime(entry.currentTime)} / ${formatWatchTime(entry.duration)}`
    : formatWatchTime(entry.currentTime);
  meta.textContent = timeText;

  card.append(poster, name, meta);
  card.addEventListener("click", () => watchMovie(entry.slug, entry.name, entry.poster));
  return card;
}

function refreshContinueWatching() {
  const section = document.getElementById("continueSection");
  const grid = document.getElementById("continueGrid");
  if (!section || !grid) return;

  const entries = readHistory()
    .filter((entry) => entry.currentTime >= RESUMABLE_SECONDS)
    .slice(0, HISTORY_DISPLAY_LIMIT);

  grid.replaceChildren();
  section.hidden = entries.length === 0;
  if (!entries.length) return;

  const fragment = document.createDocumentFragment();
  entries.forEach((entry) => fragment.append(buildContinueCard(entry)));
  grid.append(fragment);
}

document.getElementById("clearHistory")?.addEventListener("click", () => {
  clearHistory();
  refreshContinueWatching();
});

window.addEventListener("storage", (event) => {
  if (event.key === HISTORY_KEY) refreshContinueWatching();
});

refreshContinueWatching();
