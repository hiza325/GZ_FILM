# movie-hub / GZ FILM

A movie streaming website (static frontend) that pulls data from the public **phimapi.com** API and plays HLS video with **hls.js**.

## Running the project

No build step. You only need a static server (opening `index.html` directly works too, but prefer a server to avoid `file://` CORS/cache limitations):

```bash
python -m http.server 5500
# or
npx serve .
```

Then open `http://localhost:5500`.

## Deploy

The site is 100% static with no build step. The quickest option is **GitHub Pages**:

1. Go to the repo → **Settings → Pages**.
2. **Source**: `Deploy from a branch` → **Branch**: `main` → folder `/ (root)` → **Save**.
3. Wait ~1 minute; the site is live at `https://hiza325.github.io/movie-hub/`.

Every path in the project is relative, so it works both on a custom domain and in a subdirectory (tested with `/movie-hub/`). The `.nojekyll` file is included so Pages does not process the site through Jekyll.

Deploy notes:
- Movie data and images depend on `phimapi.com` / `phimimg.com` (third parties, no SLA).
- `hls.js` is loaded from jsDelivr; if that CDN is blocked, download it to `js/vendor/hls.min.js` and update the path in `index.html`.
- If you deploy to a different domain, update `og:image` in `index.html` with the correct URL.

## Structure

```
index.html            Single page: header, banner, filters, movie grid, player modal
css/                  style, header, banner, movie-card, player, responsive, theme
js/api.js             API layer + data/pagination normalization
js/i18n.js            VI/EN dictionaries + translation applied across the whole UI
js/theme.js           Light/dark theme toggle
js/history.js         Watch history + the "Continue watching" section on the home page
js/app.js             Movie grid rendering, skeleton, pagination, request orchestration
js/banner.js          Hero slider: animated background, movie thumbnails, auto-rotation
js/player.js          Player modal, HLS, server/episode selection, auto next episode
js/search.js          Search with 350ms debounce, "/" keyboard shortcut
js/category.js        Category navigation (series/single/animation/TV shows)
js/filters.js         Genre/country/list filters + sessionStorage cache
js/welcome.js         Welcome popup, random cat image on every page load
```

## Backend

This repo **contains no backend code**. All data comes from the third-party service `https://phimapi.com`:

| Function in `api.js` | Endpoint |
|---|---|
| `fetchMovies(page)` | `GET /danh-sach/phim-moi-cap-nhat?page=` |
| `fetchMovieDetail(slug)` | `GET /phim/{slug}` |
| `fetchSearch(keyword, page)` | `GET /v1/api/tim-kiem?keyword=&page=` |
| `fetchCategory(type, page)` | `GET /v1/api/danh-sach/{type}?page=` |
| `fetchFilteredMovies({list, genre, country, page})` | `GET /v1/api/danh-sach/{list}?page=&category=&country=` |
| `fetchFilterOptions(type)` | `GET /v1/api/{the-loai|quoc-gia}` |

Responses are normalized in `normalizeList()` because the v1 API puts data in `data.items` and pagination in `data.params.pagination`, while the older endpoint puts `items`/`pagination` at the root.

If you need your own backend (proxy, caching, hiding API keys, adding rate limits), you can build a thin service that keeps the same contract and then change `BASE_URL` in `js/api.js`.

## Watch history

- Stored in `localStorage` under the key `gz-film-history-v1` (up to 24 movies, most recent first).
- While playing, the position is saved every 5 seconds and when the player is closed / the tab is hidden / the page is left.
- The home page shows a **"Continue watching"** section (up to 8 movies) with a progress bar and episode number.
- Reopening a partially watched movie asks **"Resume"** or **"Start over"**.
- Movies watched almost to the end (under 5 seconds remaining) or in the first 5 seconds are not saved.
- A **"Clear history"** button in the Continue watching section resets everything.
- Data stays on the user's machine and is never sent to a server.

## Hero slider

- The banner picks the 6 newest movies and auto-advances every 7 seconds with a fade + slight zoom; text slides left and then reappears.
- A thumbnail strip in the right corner (and left/right swipes on mobile) selects a movie; the ← → keys work when a thumbnail is focused.
- Hovering or focusing the banner pauses it; a hidden tab or an open player pauses it too.
- With `prefers-reduced-motion` enabled, auto-rotation and the zoom effect are disabled.
- Title, original title, year, quality, current episode and description come from the API; the description is fetched separately for each movie when its slide appears (and cached).
- Image quality: API thumbnails are usually only 780px. When the screen needs more resolution (HiDPI), the banner checks and upgrades to a larger poster if one exists; if not, it applies a light sharpening filter (SVG unsharp mask) to compensate for the upscaling.
- If the API fails, the banner keeps its default static content.

## Welcome popup

- Shown on every page load (state is no longer remembered in `sessionStorage`).
- The image is picked at random from `assets/welcome/meme-1..5.jpg`, always different from the previous one (the choice is stored in `localStorage` under the key `gz-film-welcome-image`).
- Close it with the × button, by clicking the dark backdrop, or with the Esc key; it appears again on the next page load.

## UI & language

- **Light/dark**: button in the top-right of the header, stored in `localStorage` (`gz-film-theme`). On the first visit it follows the OS setting (`prefers-color-scheme`). The theme is applied before the CSS loads to avoid a flash of wrong colors.
- **VI/EN**: two flag buttons in the header, stored in `localStorage` (`gz-film-lang`), defaulting to Vietnamese.
- All UI strings live in `js/i18n.js` and are translated through `data-i18n`, `data-i18n-html`, `data-i18n-placeholder`, `data-i18n-aria`, or the `t(key, vars)` function in JS.
- The hero banner and the video player always stay dark in both themes because white text sits on images/video.
- Genre/country names and movie/episode titles are API data, so they still display in their original language.
