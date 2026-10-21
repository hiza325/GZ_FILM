const playerModal = document.getElementById("playerModal");
const videoPlayer = document.getElementById("videoPlayer");
const closeBtn = document.getElementById("closeBtn");
const playerTitle = document.getElementById("playerTitle");
const episodePanel = document.getElementById("episodePanel");
const episodeList = document.getElementById("episodeList");
const episodeCount = document.getElementById("episodeCount");
let activeHls = null;
let lastFocusedElement = null;
let currentEpisodes = [];
let currentEpisodeIndex = 0;
let currentMovieName = "Đang phát";
let playerRequestVersion = 0;

function clearEpisodeList() {
  currentEpisodes = [];
  currentEpisodeIndex = 0;
  episodeList.replaceChildren();
  episodePanel.hidden = true;
  episodeCount.textContent = "";
}

function stopCurrentSource() {
  videoPlayer.pause();
  if (activeHls) {
    activeHls.destroy();
    activeHls = null;
  }
  videoPlayer.removeAttribute("src");
  videoPlayer.load();
}

function closePlayer() {
  ++playerRequestVersion;
  playerModal.classList.remove("is-open");
  playerModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  stopCurrentSource();
  clearEpisodeList();
  if (lastFocusedElement?.isConnected) lastFocusedElement.focus();
}

function playEpisode(index, autoplay = false) {
  const episode = currentEpisodes[index];
  if (!episode) return;
  currentEpisodeIndex = index;
  const label = episode.name || `Tập ${index + 1}`;
  playerTitle.textContent = currentEpisodes.length > 1 ? `${currentMovieName} · ${label}` : currentMovieName;
  episodeList.querySelectorAll(".episode-button").forEach((button, buttonIndex) => {
    const isCurrent = buttonIndex === index;
    button.classList.toggle("is-current", isCurrent);
    if (isCurrent) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  });

  stopCurrentSource();
  const movieLink = episode.link_m3u8;
  if (!movieLink) {
    playerTitle.textContent = `${label} chưa có đường dẫn phát.`;
    return;
  }

  if (window.Hls && Hls.isSupported()) {
    activeHls = new Hls();
    activeHls.loadSource(movieLink);
    activeHls.attachMedia(videoPlayer);
    activeHls.on(Hls.Events.ERROR, (_event, info) => {
      if (info.fatal) playerTitle.textContent = "Không phát được video. Hãy thử chọn tập khác.";
    });
  } else if (videoPlayer.canPlayType("application/vnd.apple.mpegurl")) {
    videoPlayer.src = movieLink;
  } else {
    playerTitle.textContent = "Trình duyệt này chưa hỗ trợ phát video HLS.";
    return;
  }

  if (autoplay) {
    videoPlayer.play().catch(() => {});
  }
}

function renderEpisodes(episodes) {
  currentEpisodes = episodes;
  episodeList.replaceChildren();
  episodeCount.textContent = `${episodes.length} tập`;
  episodePanel.hidden = episodes.length < 2;

  episodes.forEach((episode, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "episode-button";
    button.setAttribute("aria-label", episode.name || `Tập ${index + 1}`);
    const number = document.createElement("span");
    number.className = "episode-number";
    number.textContent = String(index + 1).padStart(2, "0");
    const name = document.createElement("span");
    name.className = "episode-name";
    name.textContent = episode.name || `Tập ${index + 1}`;
    button.append(number, name);
    button.addEventListener("click", () => playEpisode(index));
    episodeList.append(button);
  });
}

async function watchMovie(slug, name = "Đang phát") {
  const version = ++playerRequestVersion;
  lastFocusedElement = document.activeElement;
  currentMovieName = name;
  playerTitle.textContent = "Đang tải phim…";
  clearEpisodeList();
  stopCurrentSource();
  playerModal.classList.add("is-open");
  playerModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  closeBtn.focus();
  try {
    const data = await fetchMovieDetail(slug);
    if (version !== playerRequestVersion) return;
    const firstServer = data?.episodes?.[0]?.server_data || [];
    if (!firstServer.length) throw new Error("Phim này chưa có tập để phát.");

    currentMovieName = data.movie?.name || name;
    const isSeries = data.movie?.type === "series" || firstServer.length > 1;
    if (isSeries) renderEpisodes(firstServer);
    else currentEpisodes = firstServer;
    playEpisode(0);
  } catch (error) {
    if (version !== playerRequestVersion) return;
    console.error("Không mở được phim:", error);
    playerTitle.textContent = error.message || "Không mở được phim. Vui lòng thử lại.";
  }
}

videoPlayer.addEventListener("ended", () => {
  if (currentEpisodeIndex < currentEpisodes.length - 1) playEpisode(currentEpisodeIndex + 1, true);
});
closeBtn.addEventListener("click", closePlayer);
playerModal.addEventListener("click", (event) => {
  if (event.target === playerModal) closePlayer();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && playerModal.classList.contains("is-open")) closePlayer();
});
