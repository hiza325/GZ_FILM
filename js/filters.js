const genreFilter = document.getElementById("genreFilter");
const countryFilter = document.getElementById("countryFilter");
const listFilter = document.getElementById("listFilter");
const clearFiltersButton = document.getElementById("clearFilters");

function filterItems(response) {
  return response?.data?.items || response?.items || [];
}

function addFilterOptions(select, items) {
  items.forEach((item) => {
    if (!item?.slug || !item?.name) return;
    const option = document.createElement("option");
    option.value = item.slug;
    option.textContent = item.name;
    select.append(option);
  });
}

async function initializeFilterOptions() {
  const [genres, countries] = await Promise.allSettled([
    fetchFilterOptions("the-loai"),
    fetchFilterOptions("quoc-gia")
  ]);
  if (genres.status === "fulfilled") addFilterOptions(genreFilter, filterItems(genres.value));
  else console.warn("Không tải được danh sách thể loại:", genres.reason);
  if (countries.status === "fulfilled") addFilterOptions(countryFilter, filterItems(countries.value));
  else console.warn("Không tải được danh sách quốc gia:", countries.reason);
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
  loadMovies(title, async () => filterItems(await fetchFilteredMovies({
    list: listFilter.value,
    genre: genreFilter.value,
    country: countryFilter.value
  })));
}

function resetFiltersForNavigation(list = "phim-moi-cap-nhat") {
  listFilter.value = list;
  genreFilter.value = "";
  countryFilter.value = "";
}

[genreFilter, countryFilter, listFilter].forEach((select) => {
  select.addEventListener("change", applyFilters);
});

clearFiltersButton.addEventListener("click", () => {
  resetFiltersForNavigation();
  applyFilters();
});

initializeFilterOptions();
