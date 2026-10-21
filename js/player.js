const playerModal = document.getElementById("playerModal");
const videoPlayer = document.getElementById("videoPlayer");
const closeBtn = document.getElementById("closeBtn");
const playerTitle = document.getElementById("playerTitle");
let activeHls = null;
let lastFocusedElement = null;

function closePlayer() {
  playerModal.classList.remove("is-open");
  playerModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  videoPlayer.pause();
  videoPlayer.removeAttribute("src");
  videoPlayer.load();
  if (activeHls) {
    activeHls.destroy();
    activeHls = null;
  }
  if (lastFocusedElement?.isConnected) lastFocusedElement.focus();
}

async function watchMovie(slug, name = "Đang phát") {
  lastFocusedElement = document.activeElement;
  playerTitle.textContent = name;
  playerModal.classList.add("is-open");
  playerModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  closeBtn.focus();
  try {
    const data = await fetchMovieDetail(slug);
    const movieLink = data?.episodes?.[0]?.server_data?.[0]?.link_m3u8;
    if (!movieLink) throw new Error("Phim này chưa có đường dẫn phát.");
    if (window.Hls && Hls.isSupported()) {
      if (activeHls) activeHls.destroy();
      activeHls = new Hls();
      activeHls.loadSource(movieLink);
      activeHls.attachMedia(videoPlayer);
      activeHls.on(Hls.Events.ERROR, (_event, info) => {
        if (info.fatal) playerTitle.textContent = "Không phát được video. Hãy thử lại sau.";
      });
    } else if (videoPlayer.canPlayType("application/vnd.apple.mpegurl")) {
      videoPlayer.src = movieLink;
    } else {
      throw new Error("Trình duyệt này chưa hỗ trợ phát video HLS.");
    }
  } catch (error) {
    console.error("Không mở được phim:", error);
    playerTitle.textContent = error.message || "Không mở được phim. Vui lòng thử lại.";
  }
}

closeBtn.addEventListener("click", closePlayer);
playerModal.addEventListener("click", (event) => {
  if (event.target === playerModal) closePlayer();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && playerModal.classList.contains("is-open")) closePlayer();
});
