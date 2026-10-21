const BASE_URL = "https://phimapi.com";

async function fetchMovies(page = 1){

  const response =
  await fetch(
    `${BASE_URL}/danh-sach/phim-moi-cap-nhat?page=${page}`
  );

  const data =
  await response.json();

  return data.items;
}

async function fetchMovieDetail(slug){

  const response =
  await fetch(
    `${BASE_URL}/phim/${slug}`
  );

  return await response.json();
}

async function fetchSearch(keyword){

  const response =
  await fetch(
    `${BASE_URL}/v1/api/tim-kiem?keyword=${keyword}`
  );

  return await response.json();
}

async function fetchCategory(type){

  const response =
  await fetch(
    `${BASE_URL}/v1/api/danh-sach/${type}?page=1`
  );

  return await response.json();
}