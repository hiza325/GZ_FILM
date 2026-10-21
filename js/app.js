const movieGrid =
document.getElementById("movieGrid");

let currentMovies = [];

function renderMovies(movieList){

  movieGrid.innerHTML = "";

  movieList.forEach(movie => {

    const image =
    movie.poster_url
    ? `https://phimimg.com/${movie.poster_url}`
    : movie.thumb_url;

    movieGrid.innerHTML += `

      <div class="movie-card">

        <img
          src="${image}"
          class="movie-image"
        >

        <div class="movie-info">

          <div class="movie-title">
            ${movie.name}
          </div>

          <div class="movie-year">
            ${movie.year || "2025"}
          </div>

          <button
            class="watch-btn"
            onclick="watchMovie('${movie.slug}')"
          >
            Xem phim
          </button>

        </div>

      </div>

    `;

  });

}

async function loadLatestMovies(){

  const movies =
  await fetchMovies();

  currentMovies = movies;

  renderMovies(movies);

}

loadLatestMovies();