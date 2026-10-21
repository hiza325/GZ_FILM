const welcomeToast = document.getElementById("welcomeToast");
const welcomeClose = document.getElementById("welcomeClose");
const welcomeStorageKey = "gz-film-welcome-dismissed";

function dismissWelcome() {
  welcomeToast.hidden = true;
  if (typeof syncBodyScroll === "function") syncBodyScroll();
  else document.body.classList.remove("modal-open");
  try {
    sessionStorage.setItem(welcomeStorageKey, "true");
  } catch (_error) {
    // The notice still closes when session storage is unavailable.
  }
}

let welcomeWasDismissed = false;
try {
  welcomeWasDismissed = sessionStorage.getItem(welcomeStorageKey) === "true";
} catch (_error) {
  // Show the notice for this page view when session storage is unavailable.
}

if (!welcomeWasDismissed) {
  welcomeToast.hidden = false;
  if (typeof syncBodyScroll === "function") syncBodyScroll();
  else document.body.classList.add("modal-open");
  welcomeClose.focus();
}

welcomeClose.addEventListener("click", dismissWelcome);
welcomeToast.addEventListener("click", (event) => {
  if (event.target === welcomeToast) dismissWelcome();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !welcomeToast.hidden) dismissWelcome();
});
