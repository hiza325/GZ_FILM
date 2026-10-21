const THEME_KEY = "gz-film-theme";
const themeToggle = document.getElementById("themeToggle");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

function currentTheme() {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function syncThemeUI() {
  const theme = currentTheme();
  if (themeColorMeta) themeColorMeta.setAttribute("content", theme === "light" ? "#f5f4f1" : "#101114");
  if (themeToggle) themeToggle.setAttribute("aria-pressed", String(theme === "light"));
}

function applyTheme(theme) {
  const next = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch (_error) {
    // Bỏ qua khi localStorage bị chặn.
  }
  syncThemeUI();
}

themeToggle?.addEventListener("click", () => {
  applyTheme(currentTheme() === "light" ? "dark" : "light");
});

syncThemeUI();
