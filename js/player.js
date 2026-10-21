const playerModal = document.getElementById("playerModal");
const videoPlayer = document.getElementById("videoPlayer");
const closeBtn = document.getElementById("closeBtn");
const playerTitle = document.getElementById("playerTitle");
const episodePanel = document.getElementById("episodePanel");
const episodeList = document.getElementById("episodeList");
const episodeCount = document.getElementById("episodeCount");
const episodeHeadingTitle = document.getElementById("episodeHeadingTitle");
const serverTabs = document.getElementById("serverTabs");

let activeHls = null;
let lastFocusedElement = null;
let currentServers = [];
let currentServerIndex = 0;
let currentEpisodes = [];
let currentEpisodeIndex = 0;
let currentMovieName = "Đang phát";
let playerRequestVersion = 0;

function clearEpisodeList() {
  currentServers = [];
  currentServerIndex = 0;
  currentEpisodes = [];
  currentEpisodeIndex = 0;
  episodeList.replaceChildren();
  serverTabs.replaceChildren();
  serverTabs.hidden = true;
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
  if (typeof syncBodyScroll === "function") syncBodyScroll();
  else document.body.classList.remove("modal-open");
  stopCurrentSource();
  clearEpisodeList();
  playerTitle.textContent = "Đang phát";
  if (lastFocusedElement?.isConnected) lastFocusedElement.focus();
}

function updatePanelVisibility() {
  const episodeTotal = currentEpisodes.length;
  const serverTotal = currentServers.length;
  const showEpisodes = episodeTotal > 1;
  const showServers = serverTotal > 1;

  episodePanel.hidden = !showEpisodes && !showServers;
  episodeHeadingTitle.textContent = showEpisodes ? "Các tập" : "Nguồn phát";
  episodeCount.textContent = showEpisodes ? `${episodeTotal} tập` : `${serverTotal} nguồn`;
  serverTabs.hidden = !showServers;
  episodeList.hidden = !showEpisodes;
}

function serverLabel(server, index) {
  return server?.server_name || `Nguồn ${index + 1}`;
}

function updateServerTabs() {
  serverTabs.querySelectorAll(".server-tab").forEach((tab, index) => {
    const isCurrent = index === currentServerIndex;
    tab.classList.toggle("is-active", isCurrent);
    tab.setAttribute("aria-selected", String(isCurrent));
    tab.tabIndex = isCurrent ? 0 : -1;
  });
}

function renderServers(servers) {
  currentServers = servers;
  currentServerIndex = 0;
  serverTabs.replaceChildren();
  if (servers.length < 2) {
    serverTabs.hidden = true;
    return;
  }
  servers.forEach((server, index) => {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "server-tab";
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", String(index === 0));
    tab.textContent = serverLabel(server, index);
    tab.addEventListener("click", () => selectServer(index));
    serverTabs.append(tab);
  });
  updateServerTabs();
}

function renderEpisodes(episodes) {
  currentEpisodes = episodes;
  currentEpisodeIndex = 0;
  episodeList.replaceChildren();
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
  updatePanelVisibility();
}

function selectServer(index, autoplay = true) {
  if (!currentServers[index]) return;
  currentServerIndex = index;
  updateServerTabs();
  const episodes = currentServers[index].server_data || [];
  if (episodes.length) {
    renderEpisodes(episodes);
    playEpisode(0, autoplay);
  } else {
    currentEpisodes = [];
    episodeList.replaceChildren();
    updatePanelVisibility();
    playerTitle.textContent = "Nguồn này chưa có tập để phát.";
  }
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
    playerTitle.textContent = `${currentMovieName} · ${label} chưa có đường dẫn phát.`;
    return;
  }

  if (window.Hls && Hls.isSupported()) {
    activeHls = new Hls({ enableWorker: true });
    activeHls.loadSource(movieLink);
    activeHls.attachMedia(videoPlayer);
    activeHls.on(Hls.Events.ERROR, (_event, info) => {
      if (!info.fatal) return;
      console.error("Lỗi HLS:", info);
      playerTitle.textContent = "Không phát được video. Hãy thử chọn tập hoặc nguồn khác.";
    });
  } else if (videoPlayer.canPlayType("application/vnd.apple.mpegurl")) {
    videoPlayer.src = movieLink;
  } else {
    playerTitle.textContent = "Trình duyệt này chưa hỗ trợ phát video HLS.";
    return;
  }

  if (autoplay) {
    videoPlayer.play().catch(() => {
      // Trình duyệt có thể chặn tự động phát; người dùng vẫn bấm play được.
    });
  }
}

function openPlayerUI() {
  lastFocusedElement = document.activeElement;
  playerModal.classList.add("is-open");
  playerModal.setAttribute("aria-hidden", "false");
  if (typeof syncBodyScroll === "function") syncBodyScroll();
  else document.body.classList.add("modal-open");
  closeBtn.focus();
}

async function watchMovie(slug, name = "Đang phát") {
  if (!slug) return;
  const version = ++playerRequestVersion;
  currentMovieName = name;
  playerTitle.textContent = "Đang tải phim…";
  clearEpisodeList();
  stopCurrentSource();
  openPlayerUI();
  try {
    const data = await fetchMovieDetail(slug);
    if (version !== playerRequestVersion) return;
    const servers = (Array.isArray(data?.episodes) ? data.episodes : [])
      .filter((server) => Array.isArray(server?.server_data) && server.server_data.length);
    if (!servers.length) throw new Error("Phim này chưa có tập để phát.");

    currentMovieName = data.movie?.name || name;
    renderServers(servers);
    selectServer(0, false);
  } catch (error) {
    if (version !== playerRequestVersion) return;
    console.error("Không mở được phim:", error);
    playerTitle.textContent = error?.message || "Không mở được phim. Vui lòng thử lại.";
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
