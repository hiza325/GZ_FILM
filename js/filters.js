const genreFilter = document.getElementById("genreFilter");
const countryFilter = document.getElementById("countryFilter");
const listFilter = document.getElementById("listFilter");
const clearFiltersButton = document.getElementById("clearFilters");
const FILTER_CACHE_KEY = "gz-film-filter-options-v1";

function filterItems(response) {
  return response?.data?.items || response?.items || [];
}

function toFilterOptions(items) {
  return (Array.isArray(items) ? items : [])
    .filter((item) => item?.slug && item?.name)
    .map((item) => ({ slug: item.slug, name: item.name }));
}

function addFilterOptions(select, items) {
  items.forEach((item) => {
    if (!item?.slug || !item?.name) return;
    if (select.querySelector(`option[value="${CSS.escape(item.slug)}"]`)) return;
    const option = document.createElement("option");
    option.value = item.slug;
    option.textContent = item.name;
    select.append(option);
  });
}

function readFilterCache() {
  try {
    const raw = sessionStorage.getItem(FILTER_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.genres) || !Array.isArray(parsed?.countries)) return null;
    return parsed;
  } catch (_error) {
    return null;
  }
}

function writeFilterCache(data) {
  try {
    sessionStorage.setItem(FILTER_CACHE_KEY, JSON.stringify(data));
  } catch (_error) {
    // Bỏ qua khi trình duyệt chặn sessionStorage.
  }
}

async function initializeFilterOptions() {
  const cached = readFilterCache();
  if (cached) {
    addFilterOptions(genreFilter, cached.genres);
    addFilterOptions(countryFilter, cached.countries);
    return;
  }

  const [genres, countries] = await Promise.allSettled([
    fetchFilterOptions("the-loai"),
    fetchFilterOptions("quoc-gia")
  ]);
  const payload = { genres: [], countries: [] };

  if (genres.status === "fulfilled") payload.genres = toFilterOptions(filterItems(genres.value));
  else console.warn("Không tải được danh sách thể loại:", genres.reason);

  if (countries.status === "fulfilled") payload.countries = toFilterOptions(filterItems(countries.value));
  else console.warn("Không tải được danh sách quốc gia:", countries.reason);

  addFilterOptions(genreFilter, payload.genres);
  addFilterOptions(countryFilter, payload.countries);
  if (payload.genres.length || payload.countries.length) writeFilterCache(payload);
}

function selectedFilterName(select) {
  return select.selectedOptions[0]?.textContent || "";
}

function applyFilters() {
  searchInput.value = "";
  setActiveNav("");
  const listName = selectedFilterName(listFilter).replace(/^Danh Sách:\s*/, "");
  const activeFilters = [genreFilter.value && selectedFilterName(genreFilter), countryFilter.value && selectedFilterName(countryFilter)].filter(Boolean);
  const title = activeFilters.length ? `${listName} · ${activeFilters.join(" · ")}` : listName;
  loadMovies(title, (page) => fetchFilteredMovies({
    list: listFilter.value,
    genre: genreFilter.value,
    country: countryFilter.value,
    page
  }));
}

function resetFiltersForNavigation(list = "phim-moi-cap-nhat") {
  if (listFilter.querySelector(`option[value="${CSS.escape(list)}"]`)) listFilter.value = list;
  genreFilter.value = "";
  countryFilter.value = "";
}

[genreFilter, countryFilter, listFilter].forEach((select) => {
  select.addEventListener("change", () => applyFilters());
});

clearFiltersButton.addEventListener("click", () => {
  resetFiltersForNavigation();
  applyFilters();
});

initializeFilterOptions();
