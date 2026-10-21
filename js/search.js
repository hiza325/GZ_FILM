const searchInput = document.getElementById("searchInput");
let searchTimer;

function runSearch(keyword) {
  loadMovies(`Kết quả cho “${keyword}”`, (page) => fetchSearch(keyword, page));
}

searchInput.addEventListener("input", () => {
  window.clearTimeout(searchTimer);
  ++requestVersion;
  const keyword = searchInput.value.trim();
  if (keyword.length < 2) {
    if (!keyword) {
      loadLatestMovies();
    } else {
      sectionTitle.textContent = "Tìm kiếm phim";
      showMessage("Nhập thêm một chút", "Từ khóa cần có ít nhất 2 ký tự để tìm phim.");
    }
    return;
  }

  if (typeof resetFiltersForNavigation === "function") resetFiltersForNavigation();
  setActiveNav("");
  searchTimer = window.setTimeout(() => runSearch(keyword), 350);
});

document.querySelectorAll(".nav-link").forEach((button) => {
  button.addEventListener("click", () => {
    window.clearTimeout(searchTimer);
    searchInput.value = "";
  });
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  window.clearTimeout(searchTimer);
  const keyword = searchInput.value.trim();
  if (keyword.length < 2) {
    searchInput.dispatchEvent(new Event("input"));
    return;
  }
  if (typeof resetFiltersForNavigation === "function") resetFiltersForNavigation();
  setActiveNav("");
  runSearch(keyword);
});

document.addEventListener("keydown", (event) => {
  const tag = document.activeElement?.tagName;
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(tag)) {
    event.preventDefault();
    searchInput.focus();
  }
});
