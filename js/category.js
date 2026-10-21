const categoryLabels = {
  "phim-bo": "Phim bộ",
  "phim-le": "Phim lẻ",
  "hoat-hinh": "Hoạt hình",
  "tv-shows": "TV Shows"
};

function loadCategory(type) {
  const label = categoryLabels[type] || "Phim theo danh mục";
  if (typeof resetFiltersForNavigation === "function") resetFiltersForNavigation(type);
  return loadMovies(label, (page) => fetchCategory(type, page), label);
}
