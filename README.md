# Thân Đức Việt — RTL Design & FPGA Portfolio

Portfolio single page dùng React + Vite + Tailwind, nội dung Việt/Anh, dark/light mode và 8 dự án (5 dự án RTL có sơ đồ khối, waveform mô phỏng thật và bảng kết quả). Font và minh họa SVG được phục vụ cùng website, không cần gọi API bên ngoài để hiển thị trang.

## Chạy nhanh

Yêu cầu Node.js 22.12+ hoặc Node.js 24 LTS.

```powershell
npm ci
npm run dev
```

Mở địa chỉ Vite in ra trong terminal, thường là `http://127.0.0.1:5173/`.

Để xem bản production:

```powershell
npm run build
npm run preview
```

Hoặc chạy `node scripts/serve.mjs --open` khi đã có thư mục `dist/`. Trên Windows có thể bấm đúp `XEM-WEBSITE.cmd`; cửa sổ terminal cần giữ mở trong lúc xem.

## Sửa nội dung

| File | Nội dung |
| --- | --- |
| `src/data/profile.js` | Email, GitHub, LinkedIn, thông tin học tập, skills và timeline |
| `src/data/projects.js` | Dữ liệu 8 dự án: mô tả, vai trò, quyết định thiết kế, kiểm chứng, hình, kết quả, nguồn số liệu (`evidence`), links |
| `src/data/diagrams.js` | Sơ đồ khối từng dự án (toạ độ SVG, viewBox rộng 1000), vẽ bằng `src/components/BlockDiagram.jsx` |
| `public/figures/` | Waveform (SVG, sinh từ VCD mô phỏng thật) và biểu đồ QC-LDPC |
| `public/cv/`, `public/img/` | File CV PDF và ảnh đại diện |
| `src/i18n/messages.js` | Nhãn và nội dung các section bằng Việt/Anh |
| `src/styles/globals.css` | Màu ở `:root` / `[data-theme='light']`, bố cục, responsive, reduced motion |
| `src/components/Artwork.jsx` | Minh họa chip, datapath và neural network bằng SVG |
| `src/sections/About.jsx` | Ảnh đại diện (`public/img/avatar.webp`) |
| `index.html` | Metadata, Open Graph và favicon |

Mỗi dự án có `id` duy nhất. Đường dẫn chia sẻ dùng `#project/<id>`, ví dụ `#project/tiny-mnist`. Bộ lọc dùng `filters`: `rtl`, `verification`, `other` (Ngoài RTL).

Nội dung song ngữ lưu dưới dạng `{ en: '...', vi: '...' }`. Khi thêm dự án, giữ đủ `role`, `problem`, `architecture`, `verification`, `results`, `limits`, `links`; tuỳ chọn `diagram` (khoá trong diagrams.js), `decisions`, `figures`, `table`, `evidence`, `credit`; `metric` và `eyebrow` cần cho card nổi bật.

Email CTA dùng `mailto:`; nút copy có phản hồi và hướng dẫn sao chép thủ công nếu trình duyệt chặn clipboard. Website không có form gửi email hoặc backend.

## Đưa lên Vercel

1. Đưa mã nguồn trong thư mục này lên repository của bạn; không đưa `node_modules/` lên Git.
2. Import repository trong Vercel, chọn framework **Vite**.
3. Build command: `npm run build`; output directory: `dist`.
4. Dùng base mặc định `/`, không đặt `VITE_BASE_PATH` khi host ở gốc tên miền.

Nếu đặt source trong thư mục con của repository, chọn đúng Root Directory trong cấu hình Vercel. Website không cần biến môi trường bí mật.

## Đưa lên GitHub Pages

File workflow tại `.github/workflows/pages.yml` hỗ trợ triển khai thủ công:

1. Đẩy source lên GitHub.
2. Trong **Settings → Pages**, chọn nguồn **GitHub Actions**.
3. Vào **Actions → Deploy portfolio to GitHub Pages → Run workflow**.

Workflow lấy base path từ GitHub Pages để hỗ trợ cả repository thường và repository `<username>.github.io`. Dialog dùng hash, nên không cần rewrite server cho deep link.

Để build thủ công cho repository con, ví dụ `portfolio`:

```powershell
$env:VITE_BASE_PATH='/portfolio/'
npm run build
Remove-Item Env:VITE_BASE_PATH
```

Không mở trực tiếp `dist/index.html` bằng `file://`; dùng HTTP server hoặc hosting tĩnh để tải ES modules và đường dẫn asset đúng.

## Nội dung và hình ảnh

- Ba dự án nổi bật: AES-256, Floating-Point ALU, TINY_MNIST.
- Bốn nhóm bổ trợ: QC-LDPC, PCB, Digital Logic Labs, Embedded Display/Motor Control.
- Chân dung hiện là monogram TV theo yêu cầu. Các sơ đồ SVG là minh họa kiến trúc, không phải ảnh chụp waveform hay kết quả đo.
- Kết quả được ghi rõ là log lưu, tài liệu dự án báo cáo hoặc báo cáo tổng hợp; không nhận là phép đo board mới.
- Links dự án hiện dẫn tới GitHub cá nhân với nhãn đúng. Có thể đổi sang repository riêng trong `projects.js` khi đã xác định link công khai chính xác.
- CV PDF chưa gắn nút tải: bản trích xuất có chuỗi email khác địa chỉ người dùng xác nhận. Có thể thêm bản đã kiểm tra vào `public/cv/` và gắn liên kết từ giao diện sau.
- Li-Fi, Gesture/ESP32, Smart Trash Bin và CMOS DFF giữ ở backlog nội dung do chưa đủ tài liệu để làm case study có kết quả cụ thể.
- File `public/licenses/` chứa giấy phép font đi kèm bản phân phối.

## Kiểm tra và giới hạn

Xem `docs/BAO-CAO-KIEM-TRA.md` cùng các ảnh trong thư mục `preview/`. Kiểm tra trình duyệt được thực hiện với Chrome Headless Shell trên Windows; responsive là mô phỏng viewport, chưa phải thử trên thiết bị vật lý.

Các tài liệu lập kế hoạch trong `docs/`: `plan.md`, `noi-dung-portfolio.md`, `kiem-ke-nguon.md`. Website hiện là bản local, sẵn sàng để đưa lên hosting; chưa tạo deployment Vercel/GitHub Pages.

Tài liệu triển khai tham khảo: [Vite static deployment](https://vite.dev/guide/static-deploy.html), [GitHub configure-pages](https://github.com/actions/configure-pages).
