const LANG_KEY = "gz-film-lang";
const SUPPORTED_LANGS = ["vi", "en"];

const TRANSLATIONS = {
  vi: {
    "app.title": "GZ FILM — Khám phá phim",
    "app.description": "Khám phá phim mới và phim được yêu thích trên GZ FILM.",
    "logo.aria": "GZ FILM — Trang chủ",
    "nav.label": "Danh mục phim",
    "nav.latest": "Mới cập nhật",
    "nav.series": "Phim bộ",
    "nav.movies": "Phim lẻ",
    "nav.anime": "Hoạt hình",
    "nav.tv": "TV Shows",
    "search.placeholder": "Tìm tên phim...",
    "banner.eyebrow": "RẠP PHIM CỦA BẠN",
    "banner.title": "Câu chuyện hay<br>luôn đáng để xem.",
    "banner.desc": "Khám phá những bộ phim mới và chọn ngay bộ phim phù hợp với bạn.",
    "banner.cta": "Khám phá phim",
    "banner.play": "Xem phim",
    "banner.slide": "Xem phim {name}",
    "banner.thumbsAria": "Phim nổi bật",
    "hero.note": "CHỌN PHIM<br>THEO CÁCH CỦA BẠN",
    "section.kicker": "DÀNH CHO BẠN",
    "continue.kicker": "XEM TIẾP",
    "continue.title": "Tiếp tục xem",
    "continue.clear": "Xoá lịch sử",
    "filters.genre": "Thể Loại",
    "filters.country": "Quốc Gia",
    "filters.list": "Danh Sách",
    "filters.listLatest": "Danh Sách: Mới cập nhật",
    "filters.listSeries": "Danh Sách: Phim bộ",
    "filters.listMovies": "Danh Sách: Phim lẻ",
    "filters.listAnime": "Danh Sách: Hoạt hình",
    "filters.listTv": "Danh Sách: TV Shows",
    "filters.clear": "Xóa lọc",
    "filters.aria": "Lọc phim",
    "welcome.message": "Bạn đang xem phim trên <strong>GZ FILM</strong>-<span>A Product of the GZ Group</span>",
    "welcome.closeAria": "Đóng thông báo",
    "player.title": "Đang phát",
    "player.hint": "Nhấn Esc hoặc nút đóng để thoát",
    "player.kicker": "XEM TIẾP",
    "player.episodes": "Các tập",
    "player.servers": "Nguồn phát",
    "player.episodeLabel": "Tập {number}",
    "player.episodesCount": "{count} tập",
    "player.serversCount": "{count} nguồn",
    "player.serverFallback": "Nguồn {number}",
    "player.resume": "Bạn đã xem đến",
    "player.resumeEpisode": "· Tập {number}",
    "player.continue": "Xem tiếp",
    "player.restart": "Xem lại từ đầu",
    "player.loading": "Đang tải phim…",
    "player.noEpisodes": "Phim này chưa có tập để phát.",
    "player.noLink": "{name} chưa có đường dẫn phát.",
    "player.hlsUnsupported": "Trình duyệt này chưa hỗ trợ phát video HLS.",
    "player.hlsError": "Không phát được video. Hãy thử chọn tập hoặc nguồn khác.",
    "player.noSource": "Nguồn này chưa có tập để phát.",
    "player.openError": "Không mở được phim. Vui lòng thử lại.",
    "player.closeAria": "Đóng trình phát",
    "player.episodesAria": "Danh sách tập",
    "player.serversAria": "Chọn nguồn phát",
    "player.episodeListAria": "Chọn tập phim",
    "player.videoAria": "Video đang phát",
    "movie.watch": "Xem phim",
    "movie.unknownName": "Chưa có tên phim",
    "movie.unknownYear": "Chưa rõ năm",
    "movie.defaultLabel": "Phim",
    "movie.suggested": "Đề xuất",
    "movie.count": "{count} phim",
    "state.emptyTitle": "Chưa tìm thấy phim",
    "state.emptyDesc": "Thử từ khóa khác hoặc chọn một danh mục phim khác.",
    "state.retry": "Thử tải lại",
    "state.errorTitle": "Không tải được phim",
    "state.errorDesc": "Kiểm tra kết nối mạng rồi thử lại.",
    "search.results": "Kết quả cho “{keyword}”",
    "search.title": "Tìm kiếm phim",
    "search.tooShortTitle": "Nhập thêm một chút",
    "search.tooShortDesc": "Từ khóa cần có ít nhất 2 ký tự để tìm phim.",
    "category.fallback": "Phim theo danh mục",
    "pagination.prev": "Trang trước",
    "pagination.next": "Trang sau",
    "pagination.page": "Trang {number}",
    "pagination.summary": "Trang {current}/{total}",
    "pagination.aria": "Phân trang phim",
    "footer.tagline": "Khám phá câu chuyện bạn yêu thích.",
    "footer.copyright": "Bản quyền thuộc về GZ Group",
    "footer.top": "Lên đầu trang ↑",
    "theme.toggle": "Chuyển giao diện sáng/tối",
    "lang.label": "Ngôn ngữ",
    "api.error": "Không thể tải dữ liệu ({status}).",
    "api.timeout": "Máy chủ phản hồi quá lâu. Vui lòng kiểm tra mạng và thử lại.",
    "history.episode": "Tập {number}",
    "history.continueAria": "Xem tiếp {name}"
  },
  en: {
    "app.title": "GZ FILM — Discover movies",
    "app.description": "Discover new releases and fan favourites on GZ FILM.",
    "logo.aria": "GZ FILM — Home",
    "nav.label": "Movie categories",
    "nav.latest": "Latest",
    "nav.series": "Series",
    "nav.movies": "Movies",
    "nav.anime": "Animation",
    "nav.tv": "TV Shows",
    "search.placeholder": "Search movies...",
    "banner.eyebrow": "YOUR CINEMA",
    "banner.title": "Great stories<br>are always worth watching.",
    "banner.desc": "Discover new releases and pick the movie that fits you right now.",
    "banner.cta": "Browse movies",
    "banner.play": "Watch now",
    "banner.slide": "Play {name}",
    "banner.thumbsAria": "Featured movies",
    "hero.note": "PICK MOVIES<br>YOUR WAY",
    "section.kicker": "FOR YOU",
    "continue.kicker": "KEEP WATCHING",
    "continue.title": "Continue watching",
    "continue.clear": "Clear history",
    "filters.genre": "Genre",
    "filters.country": "Country",
    "filters.list": "List",
    "filters.listLatest": "List: Latest",
    "filters.listSeries": "List: Series",
    "filters.listMovies": "List: Movies",
    "filters.listAnime": "List: Animation",
    "filters.listTv": "List: TV Shows",
    "filters.clear": "Clear filters",
    "filters.aria": "Filter movies",
    "welcome.message": "You are watching on <strong>GZ FILM</strong>-<span>A Product of the GZ Group</span>",
    "welcome.closeAria": "Close notice",
    "player.title": "Now playing",
    "player.hint": "Press Esc or the close button to exit",
    "player.kicker": "KEEP WATCHING",
    "player.episodes": "Episodes",
    "player.servers": "Sources",
    "player.episodeLabel": "Episode {number}",
    "player.episodesCount": "{count} episodes",
    "player.serversCount": "{count} sources",
    "player.serverFallback": "Source {number}",
    "player.resume": "You stopped at",
    "player.resumeEpisode": "· Episode {number}",
    "player.continue": "Resume",
    "player.restart": "Start over",
    "player.loading": "Loading movie…",
    "player.noEpisodes": "This movie has no playable episodes yet.",
    "player.noLink": "{name} has no playback link yet.",
    "player.hlsUnsupported": "This browser does not support HLS playback.",
    "player.hlsError": "Playback failed. Try another episode or source.",
    "player.noSource": "This source has no episodes yet.",
    "player.openError": "Could not open the movie. Please try again.",
    "player.closeAria": "Close player",
    "player.episodesAria": "Episode list",
    "player.serversAria": "Choose a source",
    "player.episodeListAria": "Choose an episode",
    "player.videoAria": "Video player",
    "movie.watch": "Watch",
    "movie.unknownName": "Untitled",
    "movie.unknownYear": "Year unknown",
    "movie.defaultLabel": "Movie",
    "movie.suggested": "Featured",
    "movie.count": "{count} movies",
    "state.emptyTitle": "No movies found",
    "state.emptyDesc": "Try a different keyword or pick another category.",
    "state.retry": "Retry",
    "state.errorTitle": "Could not load movies",
    "state.errorDesc": "Check your connection and try again.",
    "search.results": "Results for “{keyword}”",
    "search.title": "Search results",
    "search.tooShortTitle": "Keep typing",
    "search.tooShortDesc": "Enter at least 2 characters to search.",
    "category.fallback": "Category",
    "pagination.prev": "Previous page",
    "pagination.next": "Next page",
    "pagination.page": "Page {number}",
    "pagination.summary": "Page {current}/{total}",
    "pagination.aria": "Movie pagination",
    "footer.tagline": "Discover the stories you love.",
    "footer.copyright": "Copyright GZ Group",
    "footer.top": "Back to top ↑",
    "theme.toggle": "Toggle light/dark theme",
    "lang.label": "Language",
    "api.error": "Could not load data ({status}).",
    "api.timeout": "The server took too long. Check your connection and try again.",
    "history.episode": "Episode {number}",
    "history.continueAria": "Resume {name}"
  }
};

let currentLang = document.documentElement.dataset.lang === "en" ? "en" : "vi";

function t(key, vars) {
  const dictionary = TRANSLATIONS[currentLang] || TRANSLATIONS.vi;
  let value = dictionary[key];
  if (value === undefined) value = TRANSLATIONS.vi[key];
  if (value === undefined) return key;
  if (vars) {
    value = value.replace(/\{(\w+)\}/g, (match, name) => (vars[name] ?? match));
  }
  return value;
}

function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.documentElement.dataset.lang = currentLang;
  document.title = t("app.title");

  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute("content", t("app.description"));

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    element.innerHTML = t(element.dataset.i18nHtml);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAria));
  });

  document.querySelectorAll(".lang-btn").forEach((button) => {
    const isActive = button.dataset.lang === currentLang;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const playerTitle = document.getElementById("playerTitle");
  const playerModal = document.getElementById("playerModal");
  if (playerTitle && !playerModal?.classList.contains("is-open")) {
    playerTitle.textContent = t("player.title");
  }

  const episodePanel = document.getElementById("episodePanel");
  if (episodePanel && !episodePanel.hidden && typeof updatePanelVisibility === "function") {
    updatePanelVisibility();
  }

  if (typeof currentResumeEntry !== "undefined" && currentResumeEntry && typeof showResumePrompt === "function") {
    showResumePrompt(currentResumeEntry);
  }

  if (typeof refreshBannerLanguage === "function") refreshBannerLanguage();

  const pagination = document.getElementById("pagination");
  if (pagination && !pagination.hidden) pagination.setAttribute("aria-label", t("pagination.aria"));
}

function setLanguage(lang) {
  currentLang = SUPPORTED_LANGS.includes(lang) ? lang : "vi";
  try {
    localStorage.setItem(LANG_KEY, currentLang);
  } catch (_error) {
    // Bỏ qua khi localStorage bị chặn.
  }
  applyTranslations();
  if (typeof refreshContinueWatching === "function") refreshContinueWatching();
  if (typeof loadState !== "undefined" && loadState.request) {
    runLoad(loadState.request, loadState.page);
  } else if (typeof loadLatestMovies === "function") {
    loadLatestMovies();
  }
}

document.querySelectorAll(".lang-btn").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.lang !== currentLang) setLanguage(button.dataset.lang);
  });
});

applyTranslations();
