# SOP đội Edit — Upload media vào Drive cho n8n auto-publish

> File hướng dẫn cho team thiết kế/edit ảnh + video của LungMat Media OS.
> Tuân thủ SOP này = n8n tự động pick up, upload CDN, đăng X + Threads + Telegram.
> Last updated: 2026-05-22

---

## 1. Trước khi bắt đầu

Đội edit cần:
- Email Google Workspace được Founder share quyền **Editor** vào folder brand mình phụ trách (ví dụ `/media-output/alpha/`).
- Hiểu lịch nội dung từng brand (Founder cấp Google Sheet `content-calendar`).
- Tool edit: Photoshop / Figma / Canva / DaVinci Resolve (tuỳ).

---

## 2. Folder structure trên Drive (Founder đã tạo)

```
/media-output/                       ← KHÔNG upload trực tiếp đây
  /alpha/
    /2026-05/                        ← Upload vào tháng tương ứng
      alpha_20260522_morning_chart.png
  /raymond/2026-05/
  /vip10x/2026-05/
  /linhcau/2026-05/
  /lungmat/2026-05/
  /_archive/                         ← n8n tự move sau khi đăng (DON'T touch)
  /_failed/                          ← File sai format n8n báo lỗi (kiểm tra & sửa)
```

**Quy tắc**: Upload vào đúng folder brand + tháng. KHÔNG upload vào root, KHÔNG đụng `/_archive/` và `/_failed/`.

---

## 3. Naming convention (BẮT BUỘC)

```
{brand_id}_{YYYYMMDD}_{slot}_{type}.{ext}
```

### 3.1. brand_id (lowercase, không dấu)

| brand_id | Brand |
|---|---|
| `alpha` | Alpha Trading Lab |
| `raymond` | Raymond DWH |
| `vip10x` | VIP 10X |
| `linhcau` | Linh Cẩu |
| `lungmat` | Lửng Mật |
| (5 brand mở rộng sau) | TBD |

### 3.2. YYYYMMDD

Ngày **dự kiến đăng**, không phải ngày tạo file.
Ví dụ: bài đăng 22/05/2026 → `20260522`.

### 3.3. slot

| slot | Khi nào dùng |
|---|---|
| `morning` | Bài cron 08:00 VN |
| `midday` | Bài cron 15:00 VN (Forex London open) |
| `evening` | Bài cron 21:00 VN (NY session) |
| `signal1` ... `signal5` | Signal trading số N trong ngày |
| `event` | Bài sự kiện (Fed, CPI, biến động mạnh) |
| `promo` | Bài sale, khoá học, upgrade VIP |

### 3.4. type

| type | Mô tả | Yêu cầu kỹ thuật |
|---|---|---|
| `chart` | Biểu đồ XAUUSD, structure, FVG, … | 1200×675 (16:9) hoặc 1080×1080 vuông |
| `thumb` | Thumbnail nổi bật cho post (kèm logo brand) | 1200×675 |
| `carousel-1` ... `carousel-10` | Carousel multi-image (1 post nhiều slide) | 1080×1080 vuông, mỗi slide riêng file |
| `video` | Video shorts/reel/post | 9:16 vertical 1080×1920, max 60s X/IG/Reels; 16:9 cho YouTube |

### 3.5. ext

**Chỉ chấp nhận:**
- `png` cho ảnh chart/thumb (lossless tốt cho chart đường)
- `jpg` cho ảnh nhiều màu / ảnh chụp / carousel
- `mp4` cho video (H.264, AAC audio)

**KHÔNG upload:** `webp`, `bmp`, `gif`, `mov`, `avi`, `mkv`, `psd`, `ai`, `fig`, `pdf`.

### 3.6. Ví dụ hợp lệ

```
✅ alpha_20260522_morning_chart.png
✅ raymond_20260522_evening_thumb.jpg
✅ vip10x_20260523_premium_carousel-1.jpg
✅ vip10x_20260523_premium_carousel-2.jpg
✅ alpha_20260524_signal1_video.mp4
✅ lungmat_20260525_event_chart.png
```

### 3.7. Ví dụ SAI (sẽ vào `/_failed/`)

```
❌ XAUUSD 22.05 chart.png         (có khoảng trắng, không có brand)
❌ alpha-22-05-chart.png          (sai date format, dùng dấu - không phải _)
❌ alpha_20260522.png             (thiếu slot + type)
❌ Alpha_20260522_morning_chart.png  (uppercase brand_id)
❌ alpha_20260522_morning_chart.webp (sai ext)
❌ alpha_20260522_morning_chart_v2.png (thêm version số → fail regex)
```

---

## 4. Yêu cầu kỹ thuật cho từng type

### 4.1. Chart (biểu đồ trading)

| Tiêu chí | Yêu cầu |
|---|---|
| Kích thước | 1200×675 (16:9) **hoặc** 1080×1080 (vuông) |
| File size | ≤ 5MB |
| Format | PNG (ưu tiên) |
| Background | Đen hoặc tối — phù hợp brand voice |
| Logo | Có watermark logo brand góc phải dưới |
| Text | Font dễ đọc trên mobile (min 16px), không quá 30% ảnh là chữ |
| Mô tả | Tên cặp + khung TF (vd `XAUUSD H1`) + giá hiện tại |

### 4.2. Thumbnail

| Tiêu chí | Yêu cầu |
|---|---|
| Kích thước | 1200×675 |
| File size | ≤ 3MB |
| Format | JPG |
| Logo + brand color | Bắt buộc |

### 4.3. Carousel

| Tiêu chí | Yêu cầu |
|---|---|
| Kích thước | 1080×1080 (vuông) cho mỗi slide |
| Số slide | 2–10 (theo `-1` đến `-10` trong filename) |
| File size | ≤ 3MB / slide |
| Format | JPG hoặc PNG |
| Order | slide-1 = hook, slide cuối = CTA |

### 4.4. Video

| Tiêu chí | Yêu cầu |
|---|---|
| Tỉ lệ | 9:16 vertical (1080×1920) cho X/IG/Reels/TikTok |
| Tỉ lệ alternate | 16:9 (1920×1080) chỉ cho YouTube |
| Độ dài | ≤ 60s cho X/IG/Reels, ≤ 5min cho Threads |
| File size | ≤ 50MB (vượt sẽ chỉ đăng được Telegram, không X/Threads) |
| Codec | H.264 video + AAC audio, MP4 container |
| Frame rate | 24/30 fps |
| Caption | Burnt-in (cứng) cho 70%+ viewer xem không sound |

---

## 5. Quy trình làm việc

```
1. Founder lên content calendar (Sheet) → notify đội edit ngày + brand + slot cần gì
2. Editor làm asset theo SOP → save file đúng naming
3. Upload vào /media-output/{brand}/{YYYY-MM}/ trên Drive
4. n8n tự pick up trong vòng 5-15 phút:
   - Parse filename
   - Validate
   - Re-upload sang ImgBB / Telegram CDN
   - Append Sheet media_queue
   - Move source vào /_archive/
5. Cron 08:00 / 15:00 / 21:00 VN → n8n đọc Sheet → publish kèm media
6. Founder duyệt qua Telegram → đăng X + Threads + Telegram channel
```

---

## 6. Editor kiểm tra hôm nay đăng OK chưa?

3 cách:
1. Check Drive folder `/_archive/{brand}/{YYYY-MM}/` — file đã move đây = đã pick up.
2. Check Sheet `media_queue` — status column = `published` ⇒ đã đăng.
3. Check Telegram channel brand — bài có ảnh = OK.

Nếu file vào `/_failed/`:
- Mở file, đọc tên — sai chỗ nào? (xem §3.7)
- Sửa tên + upload lại đúng folder.
- KHÔNG duplicate — sửa tên file gốc luôn.

---

## 7. Edge case + xử lý

| Tình huống | Editor làm gì |
|---|---|
| Founder đổi nội dung sau khi mình đã upload | Upload file mới đè lên (same name) — n8n trigger lại |
| Bài đã đăng, cần thay ảnh | Báo Founder, KHÔNG upload đè (vì n8n không re-publish) |
| File quá lớn (>50MB video) | Compress trước (HandBrake) hoặc báo Founder dùng Telegram-only |
| Brand mới chưa có folder | Báo Founder tạo folder + share quyền |
| Nhầm tháng (upload vào /2026-04/ thay vì /2026-05/) | n8n vẫn pick up nếu YYYYMMDD đúng — nhưng nên move tay sang đúng folder để gọn |
| Drive đầy quota | Báo Founder upgrade |

---

## 8. Tools hỗ trợ editor

| Tool | Use case | Free? |
|---|---|---|
| TradingView screenshot + caption | Chart cơ bản | Có (basic) |
| Canva template Pro | Thumb + carousel | Có (free đủ 1 brand) |
| Figma | Bộ template đa brand | Có (free) |
| Photoshop / Affinity Photo | Tùy chỉnh sâu | Photoshop trả phí |
| DaVinci Resolve | Edit video | Có (Studio trả phí) |
| HandBrake | Compress video MP4 | Có |

---

## 9. Liên hệ + escalate

- **Bug n8n không pick up file đúng SOP** → ping Founder + chụp screenshot file Drive + filename.
- **Câu hỏi naming case lạ** → ping Founder, đừng tự sáng tạo pattern mới.
- **Đề xuất cải tiến SOP** → comment vào file này trong Drive hoặc Telegram nhóm edit.

---

## 10. Phiên bản

| Version | Date | Thay đổi |
|---|---|---|
| v1.0 | 2026-05-22 | Initial — sau quyết định kiến trúc n8n + Drive |
