# Cowork Playbook — Media OS

> **Vai trò Cowork:** điều phối vận hành, verify live, checklist, brief — **không** implement TypeScript lớn trong repo.  
> **SSOT:** đọc [`PROJECT_STATUS.md`](../../PROJECT_STATUS.md) đầu mỗi session.

---

## 1. Mở session (bắt buộc)

Paste đầu chat Cowork:

```text
Đọc @PROJECT_STATUS.md và @docs/cowork/PLAYBOOK.md.
Xác nhận phase + blocker. Đợi lệnh tiếp theo.
```

| Đọc thêm nếu… | File |
|----------------|------|
| Align context Phase 6 vs 7 | `docs/COWORK_ALIGNMENT_QA.md` |
| Verify Telegram | `docs/VERIFY_LIVE_TELEGRAM.md` |
| Typefully sau approve X | `docs/SOP_TYPEFULLY_HANDOFF.md` |

---

## 2. Cowork làm / không làm

| Làm | Không làm |
|-----|-----------|
| Chạy checklist verify, nhắc founder paste output | Sửa `RouterAgent`, `SupervisorAgent`, `index.ts` cron (giao Cursor) |
| Patch nhỏ prompt trong `MarketSummaryAgent` (đã có precedent Phase 6) | Tạo `ContentAgent` từ đầu — đã có trong repo |
| HTTP trigger `/command/command` (n8n) với payload chuẩn | Auto-approve production, post TG không người |
| Brief cho Cursor / Claude Code khi cần feature | Copy token, chat ID vào chat |
| Cập nhật nhắc founder: `PROJECT_STATUS` + `ai-worklog` cuối ngày | Commit `.env` |

---

## 3. Checklist verify live (ưu tiên)

Theo thứ tự [`VERIFY_LIVE_TELEGRAM.md`](../VERIFY_LIVE_TELEGRAM.md):

| # | Việc | Pass khi |
|---|------|----------|
| 1 | Founder: `taskkill` node + `npm run dev` | Log `mockLlm:false`, `hasAdminChatId:true`, TelegramReceiver started |
| 2 | `/debug_env` | 3 flag đúng |
| 3 | `/market_summary` | 6 sections (`📊 ⏱ 📰 📅 🎯 ⚠️`) |
| 4 | `/content alpha …` | Pack + admin DM + 3 approval id |
| 5 | Nút TG / X / Threads | Channel + Typefully copy |

**Nếu fail:** ghi triệu chứng → handoff Cursor (mục 5), không đoán sửa Router.

---

## 4. HTTP enqueue (sau verify, trước 7D cron)

```http
POST http://localhost:3000/command/command
x-agent-secret: <AGENT_SHARED_SECRET>
Content-Type: application/json

{
  "command": "/content",
  "user": "cowork",
  "source": "n8n",
  "payload": {
    "brand": "alpha",
    "topic": "liquidity sweep XAUUSD"
  }
}
```

- Cron **không** auto-post TG — founder duyệt trên admin DM.
- Chi tiết API: `docs/architecture.md`.

---

## 5. Handoff sang Cursor

Khi cần code (7D, bug approve, env):

```yaml
handoff_to: Cursor
from: Cowork
read_first:
  - PROJECT_STATUS.md
  - docs/architecture.md
task: "<mô tả 1 câu>"
repro: "<lệnh Telegram hoặc HTTP + output rút gọn>"
files_maybe: ["src/index.ts", "src/content/contentApprovals.ts"]
out_of_scope: ["đổi brand constitution", "X API auto-post"]
```

Paste block trên vào chat Cursor hoặc ticket.

---

## 6. Handoff sang Claude Code

Khi task refactor/test song song (xem [`COMMANDS_MAP.md`](../claude-code/COMMANDS_MAP.md)):

```yaml
handoff_to: Claude Code
read_first:
  - PROJECT_STATUS.md
  - docs/claude-code/COMMANDS_MAP.md
task: "<vd: implement 7D-1 cron alpha only>"
constraints:
  - G:\ canonical, runtime sync C:\lungmat_agent
  - Không đụng Router/Supervisor trừ khi task nói rõ
done_when:
  - npx tsc --noEmit pass
  - PROJECT_STATUS updated
```

---

## 7. Kết thúc session Cowork

Founder hoặc Cowork nhắc:

```text
Cập nhật PROJECT_STATUS.md: Last updated, blocker, việc vừa xong.
Thêm 1 dòng docs/ai-worklog/INDEX.md nếu có quyết định mới.
```

---

## 8. Map “kit-style” → Cowork (port khung, không cần mua kit)

| Pattern SDLC (tham khảo) | Cowork thực hiện bằng |
|--------------------------|------------------------|
| planner | Brief + ticket YAML (mục 4–5) |
| code-reviewer | Checklist verify + đọc diff founder paste |
| tester | Nhắc founder chạy `/content` / `/market_summary` trên TG |
| docs-manager | Nhắc cập nhật `PROJECT_STATUS` + worklog |
| debugger | Thu thập log startup + triệu chứng → handoff Cursor |

---

*Cập nhật khi verify pass hoặc khi 7D bắt đầu.*
