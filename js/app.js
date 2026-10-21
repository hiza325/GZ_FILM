const movieGrid = document.getElementById("movieGrid");
const sectionTitle = document.getElementById("sectionTitle");
const resultsLabel = document.getElementById("resultsLabel");
let currentMovies = [];
let requestVersion = 0;

function setActiveNav(label) {
  document.querySelectorAll(".nav-link").forEach((button) => {
    const isActive = button.dataset.label === label;
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
    button.textContent = "Thử tải lại";
    button.addEventListener("click", retry, { once: true });
    state.append(button);
  }
  movieGrid.append(state);
}

function renderMovies(movieList) {
  movieGrid.setAttribute("aria-busy", "false");
  movieGrid.replaceChildren();
  const movies = Array.isArray(movieList) ? movieList.filter(Boolean) : [];
  currentMovies = movies;
  resultsLabel.textContent = movies.length ? `${movies.length} phim` : "";

  if (!movies.length) {
    showMessage("Chưa tìm thấy phim", "Thử từ khóa khác hoặc chọn một danh mục phim khác.");
    return;
  }

  const cards = document.createDocumentFragment();
  movies.forEach((movie) => {
    const card = document.createElement("article");
    card.className = "movie-card";

    const posterWrap = document.createElement("div");
    posterWrap.className = "movie-poster-wrap";
    const image = document.createElement("img");
    const posterPath = movie.poster_url || movie.thumb_url || "";
    image.src = posterPath.startsWith("http") ? posterPath : `https://phimimg.com/${posterPath.replace(/^\//, "")}`;
    image.alt = `Poster phim ${movie.name || ""}`;
    image.className = "movie-image";
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => {
      image.hidden = true;
      posterWrap.classList.add("poster-missing");
    }, { once: true });
    posterWrap.append(image);

    const badge = document.createElement("span");
    badge.className = "movie-badge";
    badge.textContent = movie.episode_current || movie.quality || "Đề xuất";
    posterWrap.append(badge);

    const info = document.createElement("div");
    info.className = "movie-info";
    const title = document.createElement("h3");
    title.className = "movie-title";
    title.textContent = movie.name || "Chưa có tên phim";
    title.title = movie.name || "";
    const originalTitle = document.createElement("p");
    originalTitle.className = "movie-original-title";
    originalTitle.textContent = movie.origin_name || movie.year || "GZ FILM";
    originalTitle.title = movie.origin_name || "";
    const meta = document.createElement("div");
    meta.className = "movie-meta";
    const year = document.createElement("span");
    year.className = "movie-year";
    year.textContent = movie.year || "Chưa rõ năm";
    const category = document.createElement("span");
    category.textContent = movie.lang || movie.quality || "Phim";
    meta.append(year, category);
    const watchButton = document.createElement("button");
    watchButton.type = "button";
    watchButton.className = "watch-btn";
    watchButton.textContent = "Xem phim";
    watchButton.disabled = !movie.slug;
    watchButton.addEventListener("click", () => watchMovie(movie.slug, movie.name));
    info.append(title, originalTitle, meta, watchButton);
    card.append(posterWrap, info);
    cards.append(card);
  });
  movieGrid.append(cards);
}

async function loadMovies(title, loader, navLabel) {
  const version = ++requestVersion;
  sectionTitle.textContent = title;
  if (navLabel) setActiveNav(navLabel);
  playPageTransition();
  showLoading();
  try {
    const movies = await loader();
    if (version !== requestVersion) return;
    renderMovies(movies);
  } catch (error) {
    if (version !== requestVersion) return;
    console.error("Không tải được danh sách phim:", error);
    showMessage("Không tải được phim", "Kiểm tra kết nối mạng rồi thử lại.", () => loadMovies(title, loader, navLabel));
  }
}

function loadLatestMovies() {
  if (typeof resetFiltersForNavigation === "function") resetFiltersForNavigation();
  return loadMovies("Phim mới cập nhật", () => fetchMovies(), "Phim mới cập nhật");
}

loadLatestMovies();
