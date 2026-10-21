const bannerSection = document.getElementById("banner");
const bannerLayers = document.getElementById("bannerLayers");
const bannerThumbs = document.getElementById("bannerThumbs");
const bannerContent = document.getElementById("bannerContent");
const heroTitle = document.getElementById("heroTitle");
const heroOriginal = document.getElementById("heroOriginal");
const heroMeta = document.getElementById("heroMeta");
const heroDesc = document.getElementById("heroDesc");
const heroCta = document.getElementById("heroCta");
const heroCtaLabel = document.getElementById("heroCtaLabel");
const heroCtaIcon = document.getElementById("heroCtaIcon");

const SLIDE_LIMIT = 6;
const AUTOPLAY_DELAY = 7000;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let slides = [];
let activeIndex = 0;
let displayedIndex = 0;
let sliderReady = false;
let autoplayTimer = null;
let switchTimer = null;
let paused = false;
let controlsBound = false;
const detailCache = new Map();
const detailPending = new Set();

function bannerImage(movie) {
  const path = movie?.thumb_url || movie?.poster_url || "";
  if (!path) return "";
  return path.startsWith("http") ? path : `https://phimimg.com/${path.replace(/^\/+/, "")}`;
}

function posterImage(movie) {
  const path = movie?.poster_url || movie?.thumb_url || "";
  if (!path) return "";
  return path.startsWith("http") ? path : `https://phimimg.com/${path.replace(/^\/+/, "")}`;
}

function textFromHtml(html) {
  const holder = document.createElement("div");
  holder.innerHTML = html || "";
  return (holder.textContent || "").replace(/\s+/g, " ").trim();
}

function truncate(text, max = 190) {
  if (!text || text.length <= max) return text || "";
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 90 ? lastSpace : max).trim()}…`;
}

function ratingOf(movie, detail) {
  const tmdb = detail?.tmdb?.vote_average ?? movie?.tmdb?.vote_average ?? 0;
  if (Number(tmdb) > 0) return Number(tmdb);
  const imdb = detail?.imdb?.vote_average ?? movie?.imdb?.vote_average ?? 0;
  return Number(imdb) > 0 ? Number(imdb) : 0;
}

function renderMeta(movie, detail) {
  heroMeta.replaceChildren();
  const badge = (text, accent = false) => {
    const element = document.createElement("span");
    element.className = `hero-badge${accent ? " is-accent" : ""}`;
    element.textContent = text;
    heroMeta.append(element);
  };

  if (detail?.quality) badge(detail.quality);
  if (movie.year) badge(String(movie.year));
  if (detail?.episode_current) badge(detail.episode_current, true);

  const rating = ratingOf(movie, detail);
  if (rating) {
    const score = document.createElement("span");
    score.className = "hero-rating";
    score.textContent = rating.toFixed(1);
    const source = detail?.tmdb?.vote_average ?? movie?.tmdb?.vote_average ? "TMDb" : "IMDb";
    score.setAttribute("aria-label", `${source} ${rating.toFixed(1)}`);
    heroMeta.append(score);
  }

  heroMeta.hidden = !heroMeta.children.length;
}

function updateBannerCta() {
  if (!sliderReady) return;
  heroCtaLabel.textContent = t("banner.play");
  heroCtaIcon.textContent = "▶";
  const movie = slides[activeIndex];
  heroCta.setAttribute("aria-label", t("banner.slide", { name: movie?.name || "" }));
}

function renderSlide() {
  const movie = slides[activeIndex];
  if (!movie) return;
  displayedIndex = activeIndex;
  const detail = detailCache.get(movie.slug);

  heroTitle.textContent = movie.name || t("movie.unknownName");
  heroOriginal.textContent = movie.origin_name || "";
  heroOriginal.hidden = !movie.origin_name;

  renderMeta(movie, detail);

  const description = truncate(textFromHtml(detail?.content));
  heroDesc.textContent = description;
  heroDesc.hidden = !description;

  updateBannerCta();
}

function updateThumbState() {
  Array.from(bannerThumbs.children).forEach((thumb, index) => {
    const isActive = index === activeIndex;
    thumb.classList.toggle("is-active", isActive);
    thumb.setAttribute("aria-pressed", String(isActive));
    thumb.tabIndex = isActive ? 0 : -1;
  });
}

function loadDetail(index) {
  const movie = slides[index];
  if (!movie?.slug || detailCache.has(movie.slug) || detailPending.has(movie.slug)) return;
  detailPending.add(movie.slug);
  fetchMovieDetail(movie.slug)
    .then((data) => {
      detailCache.set(movie.slug, data?.movie || {});
      if (slides[activeIndex]?.slug === movie.slug) renderSlide();
    })
    .catch(() => {
      detailCache.set(movie.slug, {});
    })
    .finally(() => detailPending.delete(movie.slug));
}

function stopAutoplay() {
  window.clearTimeout(autoplayTimer);
  autoplayTimer = null;
}

function scheduleNext() {
  stopAutoplay();
  if (!sliderReady || slides.length < 2 || paused || reducedMotion.matches) return;
  autoplayTimer = window.setTimeout(() => {
    if (document.hidden || document.body.classList.contains("modal-open")) {
      scheduleNext();
      return;
    }
    showSlide(activeIndex + 1);
  }, AUTOPLAY_DELAY);
}

function showSlide(index, { animate = true } = {}) {
  if (!slides.length) return;
  activeIndex = (index + slides.length) % slides.length;

  Array.from(bannerLayers.children).forEach((layer, layerIndex) => {
    layer.classList.toggle("is-active", layerIndex === activeIndex);
  });
  updateThumbState();
  loadDetail(activeIndex);

  window.clearTimeout(switchTimer);
  if (!animate) {
    bannerContent.classList.remove("is-leaving");
    renderSlide();
  } else {
    bannerContent.classList.add("is-leaving");
    switchTimer = window.setTimeout(() => {
      renderSlide();
      bannerContent.classList.remove("is-leaving");
    }, 260);
  }

  scheduleNext();
}

function goToSlide(index) {
  if (!slides.length || index === activeIndex) {
    scheduleNext();
    return;
  }
  showSlide(index);
}

function initBanner(items) {
  if (sliderReady) return;
  const movies = (Array.isArray(items) ? items : [])
    .filter((movie) => movie?.slug && bannerImage(movie))
    .slice(0, SLIDE_LIMIT);
  if (!movies.length) return;

  slides = movies;
  sliderReady = true;
  bannerSection.classList.add("has-slider");

  // Nội dung banner giờ do slider quản lý, bỏ các khóa dịch tĩnh để không bị ghi đè.
  heroTitle.removeAttribute("data-i18n-html");
  heroDesc.removeAttribute("data-i18n");
  heroCtaLabel.removeAttribute("data-i18n");

  const layerFragment = document.createDocumentFragment();
  const thumbFragment = document.createDocumentFragment();

  slides.forEach((movie, index) => {
    const layer = document.createElement("div");
    layer.className = "banner-layer";
    layer.style.backgroundImage = `url("${bannerImage(movie)}")`;
    layerFragment.append(layer);

    const thumb = document.createElement("button");
    thumb.type = "button";
    thumb.className = "banner-thumb";
    thumb.setAttribute("aria-pressed", "false");
    thumb.setAttribute("aria-label", t("banner.slide", { name: movie.name || "" }));
    thumb.tabIndex = -1;
    const image = document.createElement("img");
    image.src = bannerImage(movie);
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    thumb.append(image);
    thumb.addEventListener("click", () => goToSlide(index));
    thumbFragment.append(thumb);
  });

  bannerLayers.replaceChildren(layerFragment);
  bannerThumbs.replaceChildren(thumbFragment);
  bannerThumbs.hidden = slides.length < 2;

  updateThumbState();
  showSlide(0, { animate: false });
  bindControls();
}

function bindControls() {
  if (controlsBound) return;
  controlsBound = true;

  bannerSection.addEventListener("mouseenter", () => {
    paused = true;
    stopAutoplay();
  });
  bannerSection.addEventListener("mouseleave", () => {
    if (bannerSection.contains(document.activeElement) && document.activeElement.matches(":focus-visible")) return;
    paused = false;
    scheduleNext();
  });
  bannerSection.addEventListener("focusin", (event) => {
    if (!event.target.matches(":focus-visible")) return;
    paused = true;
    stopAutoplay();
  });
  bannerSection.addEventListener("focusout", (event) => {
    if (!bannerSection.contains(event.relatedTarget) && !bannerSection.matches(":hover")) {
      paused = false;
      scheduleNext();
    }
  });

  bannerThumbs.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextIndex = activeIndex + (event.key === "ArrowRight" ? 1 : -1);
    showSlide(nextIndex);
    bannerThumbs.children[activeIndex]?.focus();
  });

  heroCta.addEventListener("click", () => {
    if (!sliderReady) {
      document.getElementById("movies")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const movie = slides[displayedIndex];
    if (movie?.slug) watchMovie(movie.slug, movie.name, posterImage(movie));
    scheduleNext();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoplay();
    else scheduleNext();
  });

  let touchStartX = null;
  bannerSection.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0]?.clientX ?? null;
  }, { passive: true });
  bannerSection.addEventListener("touchend", (event) => {
    if (touchStartX === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
    touchStartX = null;
    if (Math.abs(delta) < 45) return;
    showSlide(activeIndex + (delta < 0 ? 1 : -1));
  }, { passive: true });
}

/** Được gọi từ i18n.js mỗi khi đổi ngôn ngữ. */
function refreshBannerLanguage() {
  if (!sliderReady) return;
  Array.from(bannerThumbs.children).forEach((thumb, index) => {
    thumb.setAttribute("aria-label", t("banner.slide", { name: slides[index]?.name || "" }));
  });
  renderSlide();
}

document.addEventListener("gz:movies-loaded", (event) => {
  if (sliderReady) return;
  if (event.detail?.navKey !== "latest") return;
  initBanner(event.detail.items);
});
