const BASE_URL = "https://phimapi.com";
const REQUEST_TIMEOUT = 15000;

async function requestJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Không thể tải dữ liệu (${response.status}).`);
    return await response.json();
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Máy chủ phản hồi quá lâu. Vui lòng kiểm tra mạng và thử lại.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Chuẩn hóa phản hồi danh sách của phimapi.
 * API v1 trả items ở `data.items` và phân trang ở `data.params.pagination`,
 * còn endpoint cũ trả `items` + `pagination` ở gốc.
 */
function normalizeList(data) {
  const items = data?.data?.items ?? data?.items ?? [];
  const list = Array.isArray(items) ? items : [];
  const pagination = data?.data?.params?.pagination ?? data?.pagination ?? data?.data?.pagination ?? null;
  return {
    items: list,
    pagination: {
      currentPage: Number(pagination?.currentPage) || 1,
      totalPages: Math.max(1, Number(pagination?.totalPages) || 1),
      totalItems: Number(pagination?.totalItems) || list.length
    }
  };
}

async function fetchMovies(page = 1) {
  return normalizeList(await requestJson(`${BASE_URL}/danh-sach/phim-moi-cap-nhat?page=${page}`));
}

async function fetchMovieDetail(slug) {
  return requestJson(`${BASE_URL}/phim/${encodeURIComponent(slug)}`);
}

async function fetchSearch(keyword, page = 1) {
  const params = new URLSearchParams({ keyword, page: String(page) });
  return normalizeList(await requestJson(`${BASE_URL}/v1/api/tim-kiem?${params}`));
}

async function fetchCategory(type, page = 1) {
  return normalizeList(await requestJson(`${BASE_URL}/v1/api/danh-sach/${encodeURIComponent(type)}?page=${page}`));
}

async function fetchFilterOptions(type) {
  return requestJson(`${BASE_URL}/v1/api/${type}`);
}

async function fetchFilteredMovies({ list, genre, country, page = 1 }) {
  const params = new URLSearchParams({ page: String(page) });
  if (genre) params.set("category", genre);
  if (country) params.set("country", country);
  return normalizeList(await requestJson(`${BASE_URL}/v1/api/danh-sach/${encodeURIComponent(list)}?${params}`));
}
