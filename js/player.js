const playerModal = document.getElementById("playerModal");
const videoPlayer = document.getElementById("videoPlayer");
const closeBtn = document.getElementById("closeBtn");
const playerTitle = document.getElementById("playerTitle");
const episodePanel = document.getElementById("episodePanel");
const episodeList = document.getElementById("episodeList");
const episodeCount = document.getElementById("episodeCount");
const episodeHeadingTitle = document.getElementById("episodeHeadingTitle");
const serverTabs = document.getElementById("serverTabs");
const resumePrompt = document.getElementById("resumePrompt");
const resumeTime = document.getElementById("resumeTime");
const resumeEpisode = document.getElementById("resumeEpisode");
const resumeContinue = document.getElementById("resumeContinue");
const resumeRestart = document.getElementById("resumeRestart");

let activeHls = null;
let lastFocusedElement = null;
let currentServers = [];
let currentServerIndex = 0;
let currentEpisodes = [];
let currentEpisodeIndex = 0;
let currentMovieName = "Đang phát";
let currentMovieSlug = "";
let currentMoviePoster = "";
let playerRequestVersion = 0;
let pendingSeek = 0;
let lastHistorySave = 0;
let currentResumeEntry = null;

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

function hideResumePrompt() {
  resumePrompt.hidden = true;
  currentResumeEntry = null;
}

function showResumePrompt(entry) {
  currentResumeEntry = entry;
  resumeTime.textContent = formatWatchTime(entry.currentTime);
  resumeEpisode.textContent = entry.episodesCount > 1
    ? t("player.resumeEpisode", { number: entry.episodeIndex + 1 })
    : "";
  resumePrompt.hidden = false;
}

function saveCurrentProgress() {
  if (!currentMovieSlug || !currentEpisodes.length) return;
  const time = videoPlayer.currentTime;
  const duration = videoPlayer.duration;
  if (!Number.isFinite(time) || time < RESUMABLE_SECONDS) return;
  if (Number.isFinite(duration) && duration > 0 && time >= duration - 5) {
    removeHistoryEntry(currentMovieSlug);
    return;
  }
  saveHistoryEntry({
    slug: currentMovieSlug,
    name: currentMovieName,
    poster: currentMoviePoster,
    episodeIndex: currentEpisodeIndex,
    serverIndex: currentServerIndex,
    currentTime: time,
    duration: Number.isFinite(duration) ? duration : 0,
    episodesCount: currentEpisodes.length,
    updatedAt: Date.now()
  });
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
  saveCurrentProgress();
  ++playerRequestVersion;
  playerModal.classList.remove("is-open");
  playerModal.setAttribute("aria-hidden", "true");
  if (typeof syncBodyScroll === "function") syncBodyScroll();
  else document.body.classList.remove("modal-open");
  stopCurrentSource();
  clearEpisodeList();
  hideResumePrompt();
  playerTitle.textContent = t("player.title");
  currentMovieSlug = "";
  currentMoviePoster = "";
  if (typeof refreshContinueWatching === "function") refreshContinueWatching();
  if (lastFocusedElement?.isConnected) lastFocusedElement.focus();
}

function updatePanelVisibility() {
  const episodeTotal = currentEpisodes.length;
  const serverTotal = currentServers.length;
  const showEpisodes = episodeTotal > 1;
  const showServers = serverTotal > 1;

  episodePanel.hidden = !showEpisodes && !showServers;
  episodeHeadingTitle.textContent = showEpisodes ? t("player.episodes") : t("player.servers");
  episodeCount.textContent = showEpisodes
    ? t("player.episodesCount", { count: episodeTotal })
    : t("player.serversCount", { count: serverTotal });
  serverTabs.hidden = !showServers;
  episodeList.hidden = !showEpisodes;
}

function serverLabel(server, index) {
  return server?.server_name || t("player.serverFallback", { number: index + 1 });
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
    const fallback = t("player.episodeLabel", { number: index + 1 });
    const button = document.createElement("button");
    button.type = "button";
    button.className = "episode-button";
    button.setAttribute("aria-label", episode.name || fallback);
    const number = document.createElement("span");
    number.className = "episode-number";
    number.textContent = String(index + 1).padStart(2, "0");
    const name = document.createElement("span");
    name.className = "episode-name";
    name.textContent = episode.name || fallback;
    button.append(number, name);
    button.addEventListener("click", () => playEpisode(index));
    episodeList.append(button);
  });
  updatePanelVisibility();
}

function selectServer(index, options = {}) {
  if (!currentServers[index]) return;
  saveCurrentProgress();
  currentServerIndex = index;
  updateServerTabs();
  const episodes = currentServers[index].server_data || [];
  if (!episodes.length) {
    currentEpisodes = [];
    episodeList.replaceChildren();
    updatePanelVisibility();
    playerTitle.textContent = t("player.noSource");
    return;
  }

  renderEpisodes(episodes);
  const episodeIndex = Math.min(Math.max(Number(options.episodeIndex) || 0, 0), episodes.length - 1);
  const startTime = Number(options.time) || 0;
  playEpisode(episodeIndex, false, startTime);

  if (options.offer && startTime > 0) {
    showResumePrompt({ currentTime: startTime, episodeIndex, episodesCount: episodes.length });
  } else {
    hideResumePrompt();
  }
}

function playEpisode(index, autoplay = false, startTime = 0) {
  const episode = currentEpisodes[index];
  if (!episode) return;
  saveCurrentProgress();
  hideResumePrompt();
  currentEpisodeIndex = index;
  const label = episode.name || t("player.episodeLabel", { number: index + 1 });
  playerTitle.textContent = currentEpisodes.length > 1 ? `${currentMovieName} · ${label}` : currentMovieName;
  episodeList.querySelectorAll(".episode-button").forEach((button, buttonIndex) => {
    const isCurrent = buttonIndex === index;
    button.classList.toggle("is-current", isCurrent);
    if (isCurrent) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  });

  stopCurrentSource();
  pendingSeek = Number(startTime) > 0 ? Number(startTime) : 0;

  const movieLink = episode.link_m3u8;
  if (!movieLink) {
    pendingSeek = 0;
    playerTitle.textContent = t("player.noLink", { name: `${currentMovieName} · ${label}` });
    return;
  }

  if (window.Hls && Hls.isSupported()) {
    activeHls = new Hls({ enableWorker: true });
    activeHls.loadSource(movieLink);
    activeHls.attachMedia(videoPlayer);
    activeHls.on(Hls.Events.ERROR, (_event, info) => {
      if (!info.fatal) return;
      console.error("Lỗi HLS:", info);
      playerTitle.textContent = t("player.hlsError");
    });
  } else if (videoPlayer.canPlayType("application/vnd.apple.mpegurl")) {
    videoPlayer.src = movieLink;
  } else {
    pendingSeek = 0;
    playerTitle.textContent = t("player.hlsUnsupported");
    return;
  }

  if (autoplay) {
    videoPlayer.play().catch(() => {
      // Trình duyệt có thể chặn tự động phát; người dùng vẫn bấm play được.
    });
  }
}

function applyPendingSeek() {
  if (!pendingSeek) return;
  const target = pendingSeek;
  const duration = videoPlayer.duration;
  pendingSeek = 0;
  if (Number.isFinite(duration) && duration > 0 && target >= duration - 2) return;
  try {
    videoPlayer.currentTime = target;
  } catch (_error) {
    // Một số nguồn HLS chưa cho seek ngay; bỏ qua để không chặn phát.
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

function getResumeEntry(slug) {
  if (typeof getHistoryEntry !== "function") return null;
  const entry = getHistoryEntry(slug);
  if (!isResumableEntry(entry)) return null;
  return entry;
}

async function watchMovie(slug, name = "", poster = "") {
  if (!slug) return;
  const version = ++playerRequestVersion;
  currentMovieSlug = slug;
  currentMovieName = name || t("player.title");
  currentMoviePoster = poster;
  playerTitle.textContent = t("player.loading");
  clearEpisodeList();
  hideResumePrompt();
  stopCurrentSource();
  openPlayerUI();
  try {
    const data = await fetchMovieDetail(slug);
    if (version !== playerRequestVersion) return;
    const servers = (Array.isArray(data?.episodes) ? data.episodes : [])
      .filter((server) => Array.isArray(server?.server_data) && server.server_data.length);
    if (!servers.length) throw new Error(t("player.noEpisodes"));

    currentMovieName = data.movie?.name || currentMovieName;
    currentMoviePoster = poster || data.movie?.poster_url || data.movie?.thumb_url || "";
    renderServers(servers);

    const entry = getResumeEntry(slug);
    const serverIndex = entry && servers[entry.serverIndex] ? entry.serverIndex : 0;
    selectServer(serverIndex, {
      episodeIndex: entry?.episodeIndex || 0,
      time: entry?.currentTime || 0,
      offer: Boolean(entry)
    });
  } catch (error) {
    if (version !== playerRequestVersion) return;
    console.error("Không mở được phim:", error);
    playerTitle.textContent = error?.message || t("player.openError");
  }
}

videoPlayer.addEventListener("loadedmetadata", applyPendingSeek);

videoPlayer.addEventListener("timeupdate", () => {
  const now = Date.now();
  if (now - lastHistorySave < HISTORY_SAVE_INTERVAL) return;
  lastHistorySave = now;
  saveCurrentProgress();
});

videoPlayer.addEventListener("ended", () => {
  saveCurrentProgress();
  if (currentEpisodeIndex < currentEpisodes.length - 1) playEpisode(currentEpisodeIndex + 1, true);
});

resumeContinue.addEventListener("click", () => {
  hideResumePrompt();
  videoPlayer.play().catch(() => {});
});

resumeRestart.addEventListener("click", () => {
  hideResumePrompt();
  if (currentMovieSlug) removeHistoryEntry(currentMovieSlug);
  try {
    videoPlayer.currentTime = 0;
  } catch (_error) {
    // Bỏ qua nếu nguồn chưa cho seek.
  }
  videoPlayer.play().catch(() => {});
});

closeBtn.addEventListener("click", closePlayer);
playerModal.addEventListener("click", (event) => {
  if (event.target === playerModal) closePlayer();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && playerModal.classList.contains("is-open")) closePlayer();
});
window.addEventListener("pagehide", saveCurrentProgress);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") saveCurrentProgress();
});
