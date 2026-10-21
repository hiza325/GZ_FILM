const movieGrid = document.getElementById("movieGrid");
const sectionTitle = document.getElementById("sectionTitle");
const resultsLabel = document.getElementById("resultsLabel");
const pagination = document.getElementById("pagination");
const moviesSection = document.getElementById("movies");

let currentMovies = [];
let requestVersion = 0;
const loadState = { page: 1, totalPages: 1, request: null };

/** Khóa cuộn khi có modal mở, nhưng không khóa nếu modal kia đã đóng nhầm. */
function syncBodyScroll() {
  const player = document.getElementById("playerModal");
  const welcome = document.getElementById("welcomeToast");
  const playerOpen = player ? player.classList.contains("is-open") : false;
  const welcomeOpen = welcome ? !welcome.hidden : false;
  document.body.classList.toggle("modal-open", playerOpen || welcomeOpen);
}

function setActiveNav(navKey) {
  document.querySelectorAll(".nav-link").forEach((button) => {
    const isActive = button.dataset.nav === navKey;
    button.classList.toggle("is-active", isActive);
    if (isActive) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
}

function showLoading() {
  movieGrid.setAttribute("aria-busy", "true");
  resultsLabel.textContent = "";
  movieGrid.innerHTML = Array.from({ length: 10 }, () => `
    <div class="skeleton-card" aria-hidden="true">
      <div class="skeleton-poster"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </div>`).join("");
}

function playPageTransition() {
  [document.querySelector(".section-heading"), movieGrid].forEach((target, index) => {
    if (!target) return;
    target.classList.remove("page-enter");
    // Restart the animation when categories are changed quickly.
    void target.offsetWidth;
    target.style.setProperty("--enter-delay", `${index * 55}ms`);
    target.classList.add("page-enter");
  });
}

function showMessage(title, message, retry) {
  movieGrid.setAttribute("aria-busy", "false");
  movieGrid.replaceChildren();
  resultsLabel.textContent = "";
  pagination.hidden = true;
  const state = document.createElement("div");
  state.className = "state-message";
  const heading = document.createElement("strong");
  heading.textContent = title;
  const detail = document.createElement("p");
  detail.textContent = message;
  state.append(heading, detail);
  if (retry) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = t("state.retry");
    button.addEventListener("click", retry, { once: true });
    state.append(button);
  }
  movieGrid.append(state);
}

function posterUrl(movie) {
  const path = movie.poster_url || movie.thumb_url || "";
  if (!path) return "";
  return path.startsWith("http") ? path : `https://phimimg.com/${path.replace(/^\//, "")}`;
}

function renderMovies(movieList) {
  movieGrid.setAttribute("aria-busy", "false");
  movieGrid.replaceChildren();
  const movies = Array.isArray(movieList) ? movieList.filter(Boolean) : [];
  currentMovies = movies;
  resultsLabel.textContent = movies.length ? t("movie.count", { count: movies.length }) : "";

  if (!movies.length) {
    showMessage(t("state.emptyTitle"), t("state.emptyDesc"));
    return;
  }

  const cards = document.createDocumentFragment();
  movies.forEach((movie) => {
    const card = document.createElement("article");
    card.className = "movie-card";

    const posterWrap = document.createElement("div");
    posterWrap.className = "movie-poster-wrap";
    const image = document.createElement("img");
    const source = posterUrl(movie);
    if (source) {
      image.src = source;
      image.alt = movie.name ? `${movie.name}` : "";
      image.className = "movie-image";
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("error", () => {
        image.hidden = true;
        posterWrap.classList.add("poster-missing");
      }, { once: true });
      posterWrap.append(image);
    } else {
      posterWrap.classList.add("poster-missing");
    }

    const badge = document.createElement("span");
    badge.className = "movie-badge";
    badge.textContent = movie.episode_current || movie.quality || t("movie.suggested");
    posterWrap.append(badge);

    const info = document.createElement("div");
    info.className = "movie-info";
    const title = document.createElement("h3");
    title.className = "movie-title";
    title.textContent = movie.name || t("movie.unknownName");
    title.title = movie.name || "";
    const originalTitle = document.createElement("p");
    originalTitle.className = "movie-original-title";
    originalTitle.textContent = movie.origin_name || movie.year || "GZ FILM";
    originalTitle.title = movie.origin_name || "";
    const meta = document.createElement("div");
    meta.className = "movie-meta";
    const year = document.createElement("span");
    year.className = "movie-year";
    year.textContent = movie.year || t("movie.unknownYear");
    const category = document.createElement("span");
    category.textContent = movie.lang || movie.quality || t("movie.defaultLabel");
    meta.append(year, category);
    const watchButton = document.createElement("button");
    watchButton.type = "button";
    watchButton.className = "watch-btn";
    watchButton.textContent = t("movie.watch");
    watchButton.disabled = !movie.slug;
    watchButton.addEventListener("click", () => watchMovie(movie.slug, movie.name, source));
    info.append(title, originalTitle, meta, watchButton);
    card.append(posterWrap, info);
    cards.append(card);
  });
  movieGrid.append(cards);
}

function pageWindow(current, total) {
  const pages = new Set([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((page) => pages.add(page));
  if (current >= total - 2) [total - 1, total - 2, total - 3].forEach((page) => pages.add(page));
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  const output = [];
  sorted.forEach((page, index) => {
    if (index && page - sorted[index - 1] > 1) output.push("…");
    output.push(page);
  });
  return output;
}

function createPageButton(label, ariaLabel, page, disabled) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "pagination-button";
  button.textContent = label;
  button.setAttribute("aria-label", ariaLabel);
  button.disabled = disabled;
  if (!disabled) button.addEventListener("click", () => goToPage(page));
  return button;
}

function renderPagination(currentPage, totalPages) {
  pagination.replaceChildren();
  pagination.setAttribute("aria-label", t("pagination.aria"));
  if (!totalPages || totalPages <= 1) {
    pagination.hidden = true;
    return;
  }
  pagination.hidden = false;
  const fragment = document.createDocumentFragment();

  const prev = createPageButton("‹", t("pagination.prev"), currentPage - 1, currentPage <= 1);
  prev.classList.add("pagination-arrow");
  fragment.append(prev);

  pageWindow(currentPage, totalPages).forEach((page) => {
    if (page === "…") {
      const gap = document.createElement("span");
      gap.className = "pagination-gap";
      gap.textContent = "…";
      gap.setAttribute("aria-hidden", "true");
      fragment.append(gap);
      return;
    }
    const button = createPageButton(String(page), t("pagination.page", { number: page }), page, false);
    if (page === currentPage) {
      button.classList.add("is-current");
      button.setAttribute("aria-current", "page");
    }
    fragment.append(button);
  });

  const next = createPageButton("›", t("pagination.next"), currentPage + 1, currentPage >= totalPages);
  next.classList.add("pagination-arrow");
  fragment.append(next);

  const summary = document.createElement("span");
  summary.className = "pagination-summary";
  summary.textContent = t("pagination.summary", { current: currentPage, total: totalPages });
  fragment.append(summary);

  pagination.append(fragment);
}

function goToPage(page) {
  if (!loadState.request || page < 1 || page > loadState.totalPages || page === loadState.page) return;
  runLoad(loadState.request, page);
  if (moviesSection) moviesSection.scrollIntoView({ block: "start" });
}

function resolveTitle(request) {
  return typeof request.title === "function" ? request.title() : request.title;
}

async function runLoad(request, page = 1) {
  const version = ++requestVersion;
  loadState.request = request;
  loadState.page = page;
  sectionTitle.textContent = resolveTitle(request);
  if (request.navKey !== undefined) setActiveNav(request.navKey);
  playPageTransition();
  showLoading();
  renderPagination(1, 0);
  try {
    const result = await request.loader(page);
    if (version !== requestVersion) return;
    const isPlainList = Array.isArray(result);
    const items = isPlainList ? result : result?.items || [];
    renderMovies(items);
    document.dispatchEvent(new CustomEvent("gz:movies-loaded", {
      detail: { items, navKey: request.navKey }
    }));
    const currentPage = Number(isPlainList ? page : result?.pagination?.currentPage) || page;
    const totalPages = Number(isPlainList ? 1 : result?.pagination?.totalPages) || 1;
    loadState.page = currentPage;
    loadState.totalPages = totalPages;
    renderPagination(currentPage, totalPages);
  } catch (error) {
    if (version !== requestVersion) return;
    console.error("Không tải được danh sách phim:", error);
    showMessage(
      t("state.errorTitle"),
      error?.message || t("state.errorDesc"),
      () => runLoad(request, page)
    );
  }
}

function loadMovies(title, loader, navKey) {
  return runLoad({ title, loader, navKey }, 1);
}

function loadLatestMovies() {
  if (typeof resetFiltersForNavigation === "function") resetFiltersForNavigation();
  return loadMovies(() => t("nav.latest"), (page) => fetchMovies(page), "latest");
}

function initializeNavigation() {
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.category;
      if (category && typeof loadCategory === "function") loadCategory(category);
      else loadLatestMovies();
    });
  });
  loadLatestMovies();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeNavigation, { once: true });
} else {
  initializeNavigation();
}
