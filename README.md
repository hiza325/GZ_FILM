# movie-hub / GZ FILM

Website xem phim (frontend tĩnh) lấy dữ liệu từ API công khai của **phimapi.com** và phát video HLS bằng **hls.js**.

## Chạy dự án

Không cần build. Chỉ cần một static server (mở trực tiếp `index.html` cũng được, nhưng nên chạy server để tránh giới hạn CORS/cache của `file://`):

```bash
python -m http.server 5500
# hoặc
npx serve .
```

Sau đó mở `http://localhost:5500`.

## Cấu trúc

```
index.html            Trang duy nhất: header, banner, bộ lọc, lưới phim, modal player
css/                  style, header, banner, movie-card, player, responsive
js/api.js             Lớp gọi API + chuẩn hóa dữ liệu/phân trang
js/app.js             Render lưới phim, skeleton, phân trang, điều phối request
js/player.js          Modal phát phim, HLS, chọn server/tập, tự chuyển tập
js/search.js          Tìm kiếm debounce 350ms, phím tắt "/"
js/category.js        Điều hướng danh mục (phim bộ/lẻ/hoạt hình/TV shows)
js/filters.js         Bộ lọc thể loại/quốc gia/danh sách + cache sessionStorage
js/welcome.js         Popup chào mừng (nhớ trạng thái trong sessionStorage)
```

## Backend

Repo **không chứa code backend**. Toàn bộ dữ liệu đến từ dịch vụ bên thứ ba `https://phimapi.com`:

| Hàm trong `api.js` | Endpoint |
|---|---|
| `fetchMovies(page)` | `GET /danh-sach/phim-moi-cap-nhat?page=` |
| `fetchMovieDetail(slug)` | `GET /phim/{slug}` |
| `fetchSearch(keyword, page)` | `GET /v1/api/tim-kiem?keyword=&page=` |
| `fetchCategory(type, page)` | `GET /v1/api/danh-sach/{type}?page=` |
| `fetchFilteredMovies({list, genre, country, page})` | `GET /v1/api/danh-sach/{list}?page=&category=&country=` |
| `fetchFilterOptions(type)` | `GET /v1/api/{the-loai|quoc-gia}` |

Phản hồi được chuẩn hóa trong `normalizeList()` vì API v1 đặt dữ liệu ở `data.items` và phân trang ở `data.params.pagination`, còn endpoint cũ đặt `items`/`pagination` ở gốc.

Nếu cần tự triển khai backend (proxy, cache, ẩn API key, thêm rate limit), có thể dựng một service mỏng giữ nguyên contract trên rồi đổi `BASE_URL` trong `js/api.js`.
