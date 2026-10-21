const BASE_URL = "https://phimapi.com";

async function requestJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Không thể tải dữ liệu (${response.status}).`);
  return response.json();
}

async function fetchMovies(page = 1) {
  const data = await requestJson(`${BASE_URL}/danh-sach/phim-moi-cap-nhat?page=${page}`);
  return Array.isArray(data.items) ? data.items : [];
}

async function fetchMovieDetail(slug) {
  return requestJson(`${BASE_URL}/phim/${encodeURIComponent(slug)}`);
}

async function fetchSearch(keyword) {
  return requestJson(`${BASE_URL}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}`);
}

async function fetchCategory(type) {
  return requestJson(`${BASE_URL}/v1/api/danh-sach/${encodeURIComponent(type)}?page=1`);
}

async function fetchFilterOptions(type) {
  return requestJson(`${BASE_URL}/v1/api/${type}`);
}

async function fetchFilteredMovies({ list, genre, country }) {
  const params = new URLSearchParams({ page: "1" });
  if (genre) params.set("category", genre);
  if (country) params.set("country", country);
  return requestJson(`${BASE_URL}/v1/api/danh-sach/${encodeURIComponent(list)}?${params}`);
}
