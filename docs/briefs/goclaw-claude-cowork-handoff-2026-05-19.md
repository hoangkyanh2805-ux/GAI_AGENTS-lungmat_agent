# Brief — Giao Claude Cowork: GoClaw runtime + Pilot Alpha (P5→P7)

> **Giao cho:** **Claude Cowork** (điều phối Founder trên GoClaw UI — verify, checklist, báo cáo).  
> **Không giao:** Claude Code / Cursor trừ khi Founder cần sửa repo (đã có file sẵn).  
> **Owner thực thi:** Founder trên `https://agent.hoa-homes.com`  
> **Generated:** 2026-05-19

---

## Copy-paste mở session Cowork

```text
Bạn là Cowork điều phối Media OS — GoClaw production.

Đọc theo thứ tự:
1. docs/briefs/goclaw-claude-cowork-handoff-2026-05-19.md (brief này)
2. PROJECT_STATUS.md
3. docs/PILOT_ALPHA_AUDIT_STATUS.md
4. docs/GOCLAW_RUNTIME_GUIDE.md

Nhiệm vụ: dẫn Founder hoàn P5→P7 (P4 ảnh SKIPPED), củng Linh Cẩu @linhcau79_bot, báo cáo cuối session.
Không sửa code repo. Không paste API key vào chat.
Xác nhận đã đọc + liệt kê 3 việc làm tiếp theo — đợi Founder.
```

---

## 1. Bối cảnh (1 đoạn)

- **Linh Cẩu** `@linhcau79_bot` chạy trên **GoClaw** (không phải lungmat VPS prod).
- Repo `lungmat-agent` = nguồn Skill, vault seed, dev `/content` — Cursor đã sync docs upstream [nextlevelbuilder/goclaw](https://github.com/nextlevelbuilder/goclaw).
- **Pilot Alpha media:** P2–P3 Done (Zernio X+Threads + CLI). **P4 gpt-image-2 SKIPPED** — đăng **text-only**. **P5–P7 chưa làm** trên GoClaw UI.

---

## 2. Mục tiêu Cowork (done when)

| # | Mục tiêu | SSOT tick |
|---|----------|-----------|
| A | **Linh Cẩu:** paste skill + vault smoke (nếu chưa) | `linh-cau-community-skill.md` |
| B | `zernio accounts list` → điền **accountId** | `PILOT_ALPHA_AUDIT_STATUS.md` |
| C | **P5:** Agent Alpha Content Writer + Skill text-only + test draft admin TG | Compliance PASS |
| D | **P6:** Cron 08:00 `Asia/Ho_Chi_Minh` (+ optional Run now) | next run hiển thị |
| E | **P7:** Founder `OK đăng` → post live X + Threads (text OK) | URL post trong audit status |
| F | Báo cáo + cập nhật `PROJECT_STATUS.md` | Template §6 |

**Out of scope session này:** SalesMartly live, Alpha CSKH bot, Raymond/VIP10X, bật lại P4 ảnh.

---

## 3. Cowork LÀM / KHÔNG

| LÀM | KHÔNG |
|-----|-------|
| Dẫn Founder từng bước runbook | Login thay Founder |
| Verify: JSON draft, Compliance, Zernio post URL | Sửa `src/` TypeScript |
| Thu screenshot/log Founder paste | Commit / paste secrets |
| Điền báo cáo → nhắc Founder tick audit status | Auto-approve publish |
| Blocker code → brief Cursor | Dùng nút inline lungmat `approve:` (GoClaw = text `OK đăng`) |

---

## 4. Thứ tự thực hiện (~45–60 ph)

### Bước 0 — accountId (blocker P7)

```bash
zernio auth:check
zernio accounts list
```

Ghi id vào Skill `{ALPHA_ACCOUNT_IDS}` + bảng trong `docs/PILOT_ALPHA_AUDIT_STATUS.md`.

### Bước A — Linh Cẩu (song song hoặc trước)

1. GoClaw → Agent Linh Cẩu → paste **toàn bộ** `docs/goclaw-export/linh-cau-community-skill.md`
2. Vault: upload còn thiếu → **38/38** (`docs/vault-seed/`, scope Shared)
3. Smoke 4 câu trên `@linhcau79_bot`: FVG · R-multiple · Tilt · Spring Wyckoff
4. Test redirect: hỏi giá VIP → bot trỏ Alpha (khi CSKH live)

Chi tiết: `docs/GOCLAW_RUNTIME_GUIDE.md` §2–3.

### Bước B — P5 Alpha Content Writer

Runbook: `docs/GOCLAW_P4_P7_MEDIA_RUNBOOK.md` — mục **Đường nhanh** + § P5.

1. Create agent `Alpha Content Writer`
2. Tools: Vault · Web search · Zernio CLI — **không** OpenAI image
3. Paste `docs/goclaw-export/alpha-content-writer-skill.md` (bản text-only)
4. Test chat:

```text
Topic: test pilot P5 — XAUUSD liquidity và Fed tuần này.
Full JSON pack — KHÔNG tạo ảnh. Compliance PASS.
Gửi admin Telegram — KHÔNG Zernio.
```

**Pass:** JSON đủ field · `Compliance: PASS` · `Images: skipped (pilot text-only)`.

### Bước C — P6 Cron

- Name: `daily_alpha_xauusd`
- `08:00` · `Asia/Ho_Chi_Minh`
- Prompt: từ Skill (không nhắc ảnh)
- Verify next run; optional **Run now** 1 lần

### Bước D — P7 E2E

1. Draft admin TG → Founder reply: `OK đăng`
2. Zernio **không** `--media`:

```bash
zernio posts:create \
  --text "<x_thread>" \
  --platforms twitter,threads \
  --accounts <ALPHA_ACCOUNT_ID>
```

3. Verify [x.com/AlphaTrading79](https://x.com/AlphaTrading79) + Threads `@alphatrading.lab`
4. Điền URL vào `PILOT_ALPHA_AUDIT_STATUS.md` → P5–P7 **Done**

---

## 5. File đọc trước (Cowork)

| Ưu tiên | File |
|---------|------|
| 1 | `docs/briefs/goclaw-claude-cowork-handoff-2026-05-19.md` |
| 2 | `PROJECT_STATUS.md` |
| 3 | `docs/PILOT_ALPHA_AUDIT_STATUS.md` |
| 4 | `docs/GOCLAW_RUNTIME_GUIDE.md` |
| 5 | `docs/GOCLAW_P4_P7_MEDIA_RUNBOOK.md` |
| 6 | `docs/goclaw-export/alpha-content-writer-skill.md` |
| 7 | `docs/goclaw-export/linh-cau-community-skill.md` |
| 8 | `docs/SOP_GoClaw_Zernio_PUBLISH.md` |
| 9 | `docs/TELEGRAM_ONLY_GUIDE.md` |

Upstream khi kẹt: https://docs.goclaw.sh/channels/telegram.md · https://docs.goclaw.sh/advanced/scheduling-cron.md

---

## 6. Báo cáo cuối session (Cowork điền)

```markdown
## GoClaw Session — YYYY-MM-DD

### Trạng thái P0–P7
| Phase | Status | Bằng chứng |
|-------|--------|------------|
| P1 Vault | partial/done | __/38 + smoke |
| P2–P3 Zernio | done | (giữ) |
| P4 ảnh | skipped | — |
| P5 Writer | | |
| P6 Cron | | |
| P7 E2E | | URL: |

### Linh Cẩu
- Skill pasted: yes/no
- Smoke 4 câu: pass/fail
- accountId X: ___
- accountId Threads: ___

### Blocker → Cursor
- (none / mô tả)

### Founder tick
- [ ] Cập nhật docs/PILOT_ALPHA_AUDIT_STATUS.md
- [ ] Cập nhật PROJECT_STATUS.md
```

---

## 7. Handoff Cursor (chỉ khi cần)

| Blocker | Cursor làm |
|---------|------------|
| Skill/JSON lỗi format | Sửa `alpha-content-writer-skill.md` |
| Repo webhook / lungmat | `src/`, SalesMartly test script |
| Doc lệch thực tế | `architecture.md`, runbook |

---

## 8. Rủi ro nhắc Founder

1. Thiếu **accountId** → P7 fail dù X connected.
2. Nhầm duyệt: GoClaw = `OK đăng` text, không phải nút lungmat.
3. Vault 24/38 → draft yếu.
4. Zernio key từng lộ → revoke + key mới nếu chưa.

---

*Brief này thay thế checklist cũ có P4 bắt buộc ảnh — dùng bản P4 Skipped.*
