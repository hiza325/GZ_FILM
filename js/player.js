const playerModal =
document.getElementById("playerModal");

const videoPlayer =
document.getElementById("videoPlayer");

const closeBtn =
document.getElementById("closeBtn");

async function watchMovie(slug){

  const data =
  await fetchMovieDetail(slug);

  const episodes =
  data.episodes[0].server_data;

  const movieLink =
  episodes[0].link_m3u8;

  playerModal.style.display = "flex";

  if(Hls.isSupported()){

    const hls = new Hls();

    hls.loadSource(movieLink);

    hls.attachMedia(videoPlayer);

  }

  else{

    videoPlayer.src = movieLink;

  }

}

closeBtn.addEventListener("click", () => {

  playerModal.style.display = "none";

  videoPlayer.pause();

});