const searchInput = document.getElementById("searchInput");
let searchTimer;

searchInput.addEventListener("input", () => {
  window.clearTimeout(searchTimer);
  ++requestVersion;
  const keyword = searchInput.value.trim();
  if (keyword.length < 2) {
    if (!keyword) loadLatestMovies();
    else {
      ++requestVersion;
      sectionTitle.textContent = "Tìm kiếm phim";
      showMessage("Nhập thêm một chút", "Từ khóa cần có ít nhất 2 ký tự để tìm phim.");
    }
    return;
  }

  if (typeof resetFiltersForNavigation === "function") resetFiltersForNavigation();
  setActiveNav("");
  searchTimer = window.setTimeout(() => {
    loadMovies(`Kết quả cho “${keyword}”`, async () => {
      const data = await fetchSearch(keyword);
      return data?.data?.items || data?.items || [];
    });
  }, 350);
});

document.querySelectorAll(".nav-link").forEach((button) => {
  button.addEventListener("click", () => {
    window.clearTimeout(searchTimer);
    searchInput.value = "";
  });
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    window.clearTimeout(searchTimer);
    searchInput.dispatchEvent(new Event("input"));
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    searchInput.focus();
  }
});
