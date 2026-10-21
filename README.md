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
css/                  style, header, banner, movie-card, player, responsive, theme
js/api.js             Lớp gọi API + chuẩn hóa dữ liệu/phân trang
js/i18n.js            Từ điển VI/EN + áp dụng bản dịch cho toàn bộ giao diện
js/theme.js           Chuyển giao diện sáng/tối
js/history.js         Lịch sử xem + khối "Tiếp tục xem" ở trang chủ
js/app.js             Render lưới phim, skeleton, phân trang, điều phối request
js/banner.js          Hero slider: ảnh nền chuyển động, thumbnail chọn phim, tự động xoay
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

## Lịch sử xem

- Lưu trong `localStorage`, key `gz-film-history-v1` (tối đa 24 phim, gần nhất trước).
- Mỗi lần phát, vị trí được ghi mỗi 5 giây và khi đóng player / ẩn tab / thoát trang.
- Trang chủ hiện khối **"Tiếp tục xem"** (tối đa 8 phim) kèm thanh tiến độ và số tập.
- Mở lại phim đã xem dở sẽ hỏi **"Xem tiếp"** hoặc **"Xem lại từ đầu"**.
- Phim xem gần hết (còn < 5 giây) hoặc dưới 5 giây đầu sẽ không được lưu.
- Nút **"Xoá lịch sử"** trong khối Tiếp tục xem để reset toàn bộ.
- Dữ liệu chỉ nằm trên máy người dùng, không gửi lên server.

## Hero slider

- Banner lấy 6 phim mới nhất, tự chuyển mỗi 7 giây với hiệu ứng mờ dần + zoom nhẹ; chữ trượt sang trái rồi hiện lại.
- Dải thumbnail ở góc phải (và vuốt trái/phải trên mobile) để chọn phim; phím ← → khi focus vào thumbnail.
- Hover hoặc focus vào banner sẽ tạm dừng; tab bị ẩn hoặc đang mở player cũng tạm dừng.
- Bật `prefers-reduced-motion` thì tắt tự động xoay và hiệu ứng zoom.
- Tiêu đề, tên gốc, năm, chất lượng, tập hiện tại và mô tả lấy từ API; mô tả được tải riêng cho từng phim khi slide xuất hiện (cache lại).
- Chất lượng ảnh: ảnh thumb của API thường chỉ 780px. Khi màn hình cần độ phân giải cao hơn (HiDPI), banner tự kiểm tra và nâng cấp sang ảnh poster lớn hơn nếu có; nếu không có bản lớn hơn thì làm nét nhẹ bằng bộ lọc SVG (unsharp mask) để bù phần bị phóng.
- Nếu API lỗi, banner giữ nguyên nội dung tĩnh mặc định.

## Giao diện & ngôn ngữ

- **Sáng/tối**: nút ở góc phải header, lưu lựa chọn trong `localStorage` (`gz-film-theme`). Lần đầu truy cập sẽ theo cài đặt hệ điều hành (`prefers-color-scheme`). Theme được áp trước khi CSS tải để không bị nháy màu.
- **VI/EN**: hai nút cờ ở header, lưu trong `localStorage` (`gz-film-lang`), mặc định là tiếng Việt.
- Toàn bộ chuỗi giao diện nằm trong `js/i18n.js` và dịch qua `data-i18n`, `data-i18n-html`, `data-i18n-placeholder`, `data-i18n-aria`, hoặc hàm `t(key, vars)` trong JS.
- Banner hero và trình phát video luôn giữ nền tối ở cả hai theme vì chữ trắng nằm trên ảnh/video.
- Tên thể loại/quốc gia và tên phim/tập là dữ liệu từ API nên vẫn hiển thị theo ngôn ngữ gốc.
