# GoClaw Runtime — Áp dụng cho Media OS / Linh Cẩu

> **Nguồn upstream (đọc khi cần chi tiết):**  
> - Platform: [nextlevelbuilder/goclaw](https://github.com/nextlevelbuilder/goclaw)  
> - Docs: [docs.goclaw.sh](https://docs.goclaw.sh) · index LLM: [llms.txt](https://docs.goclaw.sh/llms.txt)  
> - Cursor ops: [nextlevelbuilder/goclaw-mcp](https://github.com/nextlevelbuilder/goclaw-mcp)  
>  
> **SSOT dự án:** [`PROJECT_STATUS.md`](../PROJECT_STATUS.md) · [`TELEGRAM_ONLY_GUIDE.md`](./TELEGRAM_ONLY_GUIDE.md) · [`PILOT_ALPHA_AUDIT_STATUS.md`](./PILOT_ALPHA_AUDIT_STATUS.md)

**Production:** `https://agent.hoa-homes.com` (GoClaw gateway)  
**Cập nhật:** 2026-05-21 — Web Search Provider Chain (Exa/Tavily/Brave/DDG)

---

## 1. Ba agent trên cùng nền GoClaw

| Agent GoClaw | Bot / kênh TG | Vai trò | Skill / context trong repo |
|--------------|---------------|---------|----------------------------|
| **Linh Cẩu** 🐆 | `@linhcau79_bot` | Edu, vault Q&A, cộng đồng — **không sales** | [`goclaw-export/linh-cau-community-skill.md`](./goclaw-export/linh-cau-community-skill.md) + Vault **Shared** |
| **Media OS Orchestrator** | Chat / TG (cửa vào) | Router Team → delegate worker | [`media-os-orchestrator-skill.md`](./goclaw-export/media-os-orchestrator-skill.md) · [`briefs/goclaw-media-os-orchestrator-team-brief.md`](./briefs/goclaw-media-os-orchestrator-team-brief.md) |
| **Alpha Content Writer** | Worker (media) | Media pack → Zernio X/Threads | [`goclaw-export/alpha-content-writer-skill.md`](./goclaw-export/alpha-content-writer-skill.md) |
| **Alpha CSKH** _(sau P7)_ | Bot brand Alpha riêng | Sales 1:1 TG | [`goclaw-export/alpha-cskh-1to1-skill.md`](./goclaw-export/alpha-cskh-1to1-skill.md) |

**lungmat-agent** (`src/`) = dev factory: persona, vault seed, `/content`, `/coach` — **không** thay GoClaw runtime prod.

---

## 2. Map repo → GoClaw (áp dụng ngay)

### 2.1 Knowledge Vault (P1)

| Repo | GoClaw upload |
|------|----------------|
| `docs/vault-seed/**/*.md` (38 file) | Vault UI → scope **Shared** (TA, SMC, psychology…) |
| Tags / folder | Theo [`vault-seed/README.md`](./vault-seed/README.md) |

**GoClaw behavior (từ docs):**

- Agent gọi tool **`vault_search`** — không auto-inject toàn bộ vault vào prompt.
- Scope: `shared` = cả tenant; `personal` / `team` = tách sales FAQ sau.
- Smoke sau upload: *"FVG là gì?"*, *"R-multiple?"*, *"Tilt?"*, *"Spring Wyckoff?"*
- **Không upload giá realtime / news realtime vào Vault.** Vault chỉ chứa kiến thức nền evergreen; dữ liệu thị trường phải đi qua tool/feed có timestamp.

Ref: [Knowledge Vault](https://docs.goclaw.sh/advanced/knowledge-vault.md)

### 2.1b Market data cho Linh Cẩu / Alpha Writer

Vấn đề đã gặp: bot trả lời DXY bằng nguồn/search result không đủ chuẩn rồi tự dựng setup Entry/SL/TP. Cách sửa là tách nguồn theo lớp:

| Loại thông tin | Nạp/cấu hình ở đâu | Dùng cho |
|----------------|--------------------|----------|
| Kiến thức TA/SMC/psychology/risk | Vault Shared (`docs/vault-seed/**/*.md`) | Giải thích FVG, R-multiple, tilt, Wyckoff |
| Persona + luật trả lời | Agent context files / Skill | Giọng Linh Cẩu, cấm signal, cấm bịa data |
| Giá XAUUSD, DXY, FX spot, yield live | MCP/API/Built-in Tool/market-data node có timestamp | Market context nhanh, kiểm tra số liệu hiện tại |
| Macro official | Web tool tới Fed, BLS, BEA, U.S. Treasury, CME | Fed/CPI/NFP/PCE/yield/FedWatch |
| Tin/headline | **Web Search Provider Chain** (`web_search`) | Exa → Tavily → Brave → DuckDuckGo fallback — bối cảnh, không phải giá live |

**Rule bắt buộc cho agent:**

- Trả lời giá/DXY/news hiện tại phải có `source + timestamp + timezone`.
- Nếu GoClaw chưa có feed realtime: bot phải nói "chưa verify được giá live", không được đoán.
- Search snippet không đủ làm nguồn cho giá live.
- Linh Cẩu không được tạo setup có Entry/SL/TP/lot size. Nếu cần phân tích, chỉ nói theo dạng giáo dục/conditional.

**Nguồn nên cấu hình cho FX nhanh/chính xác nhất:**

1. **Broker/MT5 feed đang giao dịch** cho XAUUSD/FX spot vì đây là giá user thực thi lệnh.
2. **TradingView/data vendor có API hoặc widget/feed timestamp** để cross-check.
3. **ICE/CME official/vendor feed** cho DXY/futures/FX futures nếu cần chuẩn institutional.
4. **Official macro sources**: Fed, BLS, BEA, U.S. Treasury, CME FedWatch.
5. Free website/news chỉ dùng backup/context, không dùng để bot chốt con số "hiện tại".

**Web Search Provider Chain (GoClaw UI mới):** Built-in Tools → Web → kéo thứ tự provider. Pilot: **#1 Exa**, **#2 Tavily** (có key), **#3 Brave** (bật, thêm key khi cần), **#4 DuckDuckGo** always-on. Chi tiết: [`handbook/06-builtin-tools.md`](./goclaw-export/handbook/06-builtin-tools.md) §6.5.

### 2.2 Linh Cẩu personality

| Repo | GoClaw |
|------|--------|
| `src/llm/persona.ts` | Nội dung → Skill hoặc **SOUL.md** context file |
| `IDENTITY.md` | **IDENTITY.md** trên agent (tên, emoji 🐆) |
| `docs/lung-mat/SOUL.md` | Tham khảo giọng Lửng — **Linh Cẩu ngắn hơn**, không copy dump group |

Paste: [`linh-cau-community-skill.md`](./goclaw-export/linh-cau-community-skill.md)

### 2.3 Media Alpha (P5–P7)

| Bước | GoClaw UI | Doc dự án |
|------|-----------|-----------|
| P4 ảnh | **Skipped** pilot v1 | — |
| P5 Writer | Agent + Skill | [`GOCLAW_P4_P7_MEDIA_RUNBOOK.md`](./GOCLAW_P4_P7_MEDIA_RUNBOOK.md) § P5 |
| P6 Cron | `08:00` `Asia/Ho_Chi_Minh` | Runbook § P6 |
| P7 Publish | Zernio CLI node + `OK đăng` | [`SOP_GoClaw_Zernio_PUBLISH.md`](./SOP_GoClaw_Zernio_PUBLISH.md) |

### 2.4 Telegram channel (Linh Cẩu + admin)

Ref: [Telegram channel](https://docs.goclaw.sh/channels/telegram.md)

| Cấu hình | Gợi ý Media OS |
|----------|----------------|
| Group **privacy** | @BotFather `/setprivacy` → **Disable** (đọc được tin group) |
| `require_mention` | `true` group — tránh spam; DM mở |
| `dm_policy` | `pairing` hoặc `allowlist` admin |
| Multi-bot group | `mention_mode: yield` nếu có nhiều bot |
| Admin duyệt media | **Không** dùng callback `approve:x:` lungmat — reply text `OK đăng` trên GoClaw |

---

## 3. Context files chuẩn GoClaw (Linh Cẩu)

GoClaw dùng tối đa 8 file markdown/agent ([Context Files](https://docs.goclaw.sh/agents/context-files.md)):

| File | Linh Cẩu — gợi ý nội dung |
|------|---------------------------|
| **SOUL.md** | Giọng 🐆, hard rules trading (không signal), redirect sales |
| **IDENTITY.md** | Từ repo [`IDENTITY.md`](../IDENTITY.md) |
| **CAPABILITIES.md** | XAUUSD edu, vault, market context — không CRM, không publish |
| **TOOLS.md** | Ghi chú: Zernio chỉ agent Writer; Linh Cẩu không `posts:create` |
| **USER.md** | _(tuỳ founder)_ |
| Skill (UI) | [`linh-cau-community-skill.md`](./goclaw-export/linh-cau-community-skill.md) |

---

## 4. Cron & Skills (upstream)

| Tính năng | Doc GoClaw | Dự án |
|-----------|------------|-------|
| Cron | [Scheduling & Cron](https://docs.goclaw.sh/advanced/scheduling-cron.md) | Alpha Writer 08:00 VN |
| Skills | [Skills](https://docs.goclaw.sh/advanced/skills.md) | Folder `docs/goclaw-export/` |
| MCP | [MCP Integration](https://docs.goclaw.sh/advanced/mcp-integration.md) | Zernio CLI, optional `goclaw-mcp` Cursor |
| Media ảnh | [Media Generation](https://docs.goclaw.sh/advanced/media-generation.md) | P4 skipped — bật lại sau |

---

## 5. Vận hành GoClaw từ Cursor (`goclaw-mcp`)

Copy [`.cursor/mcp.json.example`](../.cursor/mcp.json.example) → `.cursor/mcp.json` (gitignore nếu có token).

```json
{
  "mcpServers": {
    "goclaw": {
      "command": "npx",
      "args": ["-y", "goclaw-mcp"],
      "env": {
        "GOCLAW_SERVER": "https://agent.hoa-homes.com",
        "GOCLAW_TOKEN": "<admin-bearer-token>"
      }
    }
  }
}
```

**Tool hữu ích cho Founder/Cursor:**

| MCP tool | Việc |
|----------|------|
| `goclaw_agent_list` / `goclaw_agent_get` | Kiểm tra Linh Cẩu vs Alpha Writer |
| `goclaw_agent_files_set` | Đẩy SOUL/IDENTITY từ repo (cẩn thận prod) |
| `goclaw_cron_list` / `goclaw_cron_run` | P6 verify |
| `goclaw_skill_list` | Skill đã paste |
| `goclaw_trace_list` | Debug draft lỗi JSON |

Ref: [goclaw-mcp README](https://github.com/nextlevelbuilder/goclaw-mcp)

---

## 6. Checklist triển khai (copy)

### Linh Cẩu (edu)

- [ ] Agent bound → `@linhcau79_bot`
- [ ] Vault 38/38 Shared + smoke 4 câu
- [ ] SOUL + IDENTITY + Skill `linh-cau-community-skill.md`
- [ ] Group: privacy off, mention gating đúng ý
- [ ] Test redirect: hỏi giá VIP → trỏ bot Alpha (khi CSKH live)

### Alpha media (song song)

- [ ] `zernio accounts list` → accountId
- [ ] P5 Writer + Skill text-only
- [ ] P6 Cron 08:00 VN
- [ ] P7 `OK đăng` → URL post trong [`PILOT_ALPHA_AUDIT_STATUS.md`](./PILOT_ALPHA_AUDIT_STATUS.md)

---

## 7. Không nhầm với lungmat

| Việc | GoClaw prod | lungmat dev |
|------|-------------|-------------|
| Free-text khách edu | Linh Cẩu agent | ❌ chỉ `/commands` |
| Duyệt bài media | Admin DM text OK | Inline `approve:` (legacy) |
| Publish X/Threads | Zernio CLI | Typefully legacy |
| Coach ops | _(optional GoClaw sau)_ | `/coach` admin |

---

## 8. Link nhanh docs.goclaw.sh

| Chủ đề | URL |
|--------|-----|
| Telegram | https://docs.goclaw.sh/channels/telegram.md |
| Creating agents | https://docs.goclaw.sh/agents/creating-agents.md |
| Knowledge Vault | https://docs.goclaw.sh/advanced/knowledge-vault.md |
| Cron | https://docs.goclaw.sh/advanced/scheduling-cron.md |
| Personal assistant (recipe) | https://docs.goclaw.sh/recipes/personal-assistant.md |
| Production checklist | https://docs.goclaw.sh/deployment/production-checklist.md |

*Khi upstream đổi behavior — đối chiếu `llms.txt` trước khi sửa runbook dự án.*

**Worklog phiên tạo file này:** [`ai-worklog/sessions/2026-05-19-goclaw-runtime-cowork-handoff.md`](./ai-worklog/sessions/2026-05-19-goclaw-runtime-cowork-handoff.md)
