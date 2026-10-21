const categoryNavKeys = {
  "phim-bo": "series",
  "phim-le": "movies",
  "hoat-hinh": "anime",
  "tv-shows": "tv"
};

function loadCategory(type) {
  const navKey = categoryNavKeys[type] || "";
  const titleKey = navKey ? `nav.${navKey}` : "category.fallback";
  if (typeof resetFiltersForNavigation === "function") resetFiltersForNavigation(type);
  return loadMovies(() => t(titleKey), (page) => fetchCategory(type, page), navKey);
}
