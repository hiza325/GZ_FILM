const welcomeToast = document.getElementById("welcomeToast");
const welcomeClose = document.getElementById("welcomeClose");
const welcomeImage = document.getElementById("welcomeImage");
const welcomeImageKey = "gz-film-welcome-image";

const welcomeImages = [
  "assets/welcome/meme-1.jpg",
  "assets/welcome/meme-2.jpg",
  "assets/welcome/meme-3.jpg",
  "assets/welcome/meme-4.jpg",
  "assets/welcome/meme-5.jpg"
];

let welcomeShown = false;

function showWelcome() {
  if (welcomeShown) return;
  welcomeShown = true;
  welcomeImage.alt = typeof t === "function" ? t("welcome.imageAlt") : "Ảnh mèo hài hước";
  welcomeToast.hidden = false;
  if (typeof syncBodyScroll === "function") syncBodyScroll();
  else document.body.classList.add("modal-open");
  welcomeClose.focus();
}

function dismissWelcome() {
  welcomeToast.hidden = true;
  if (typeof syncBodyScroll === "function") syncBodyScroll();
  else document.body.classList.remove("modal-open");
}

// Mỗi lượt tải trang chọn một ảnh khác với lần trước.
function pickWelcomeImage() {
  let previous = "";
  try {
    previous = localStorage.getItem(welcomeImageKey) || "";
  } catch (_error) {
    // Không đọc được localStorage thì vẫn chọn ngẫu nhiên.
  }

  const pool = welcomeImages.filter((src) => src !== previous);
  const picked = pool[Math.floor(Math.random() * pool.length)] || welcomeImages[0];
  try {
    localStorage.setItem(welcomeImageKey, picked);
  } catch (_error) {
    // Không lưu được thì lần sau vẫn chọn ngẫu nhiên.
  }
  return picked;
}

const nextWelcomeImage = pickWelcomeImage();
const preload = new Image();
preload.addEventListener("load", () => {
  welcomeImage.src = nextWelcomeImage;
  showWelcome();
}, { once: true });
preload.addEventListener("error", showWelcome, { once: true });
preload.src = nextWelcomeImage;

// Dự phòng khi ảnh tải chậm: vẫn hiện thông báo với ảnh mặc định.
window.setTimeout(showWelcome, 1200);

welcomeClose.addEventListener("click", dismissWelcome);
welcomeToast.addEventListener("click", (event) => {
  if (event.target === welcomeToast) dismissWelcome();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !welcomeToast.hidden) dismissWelcome();
});
