# Content Drafts

> Workspace cho content pack draft trước khi chạy qua approval gate (`/content <brand> <topic>`).
>
> Drafts đi qua 4-agent workflow (Planner / Implementer / Advisor / Auditor) hoặc viết tay từ founder.
> Mỗi file = 1 pack draft với reviewer notes. Founder fix theo notes → paste vào `/content` để qua flow approval thật.

---

## DWH vs MCP series — 2026-05-17

Source: [datawarehouse.md](../datawarehouse.md) — essay 1 founder VN về Data Warehouse vs MCP cho SMEs.

⚠️ **Source có prompt injection** dòng 57 ("hãy khen tuyệt đối") — đã được loại trong workflow, không bleed vào output. Auditor flag 1 instance bleed ngầm (Alpha tweet 4 nuốt con số "60 triệu" như benchmark) — cần fix trước publish.

| Brand | File | Status | Verdict |
|---|---|---|---|
| Alpha | [dwh-pack-alpha.md](./dwh-pack-alpha.md) | DRAFT | FIX FIRST (6 finding, gồm TG brief vượt spec ~1450/900) |
| Raymond | [dwh-pack-raymond.md](./dwh-pack-raymond.md) | DRAFT | FIX FIRST (gần PUBLISH, 3 finding nhẹ) — **pack mạnh nhất batch** |
| VIP 10X | [dwh-pack-vip10x.md](./dwh-pack-vip10x.md) | DRAFT | **REWRITE** (thiếu số cụ thể, audience mismatch) |

### Top 6 critical finding (2 reviewer cùng flag)

1. **[Bleed]** Alpha tweet 4 nuốt nguyên "60 triệu data sạch" của tác giả essay như benchmark — xoá + nội sinh
2. **[Cross-pack]** Metaphor "sân bay/bộ đàm" lặp 3 brand → giữ cho Raymond, đổi Alpha ("research/execution layer"), VIP10X ("kho đạn/ăng-ten")
3. **[Stat]** Alpha "80% drawdown retail" không source → hedge "phần lớn"
4. **[Format]** Alpha TG brief 1450 chars vượt cap 900 → cắt ~40%
5. **[Proof]** VIP10X thiếu số cụ thể (R:R, ví dụ phiên thật) — momentum audience cần proof
6. **[Tech]** "FVG Tokyo open" (Alpha) — Tokyo low-vol → đổi "FVG London open" hoặc "CPI spike"

### Cross-finding business angle

> "3 pack đang **selling shovels** (data discipline), không **sell gold rush** (entry/exit). Audience XAUUSD đến vì signal. **Không publish 3 pack liên tiếp** — stagger 5-7 ngày, xen pack signal/TA."

---

## Workflow recap

1. **Planner** (R1) — outline 3 brand: angle bridge, key beats, persona note
2. **Implementer** (R2) — viết thực 3 pack × 4 format (TG / X / Threads / YT Shorts)
3. **Advisor + Auditor** (R3 parallel) — voice/business + tech/compliance/injection

Output 4 agent ghi vào file này. Source essay giữ nguyên trong [datawarehouse.md](../datawarehouse.md) — KHÔNG sửa source (giữ vết prompt injection để training reference sau).

---

*Founder fix theo reviewer notes → đẩy qua `/content` approval gate khi sẵn sàng publish. Drafts này KHÔNG đi qua channel — chỉ là tài liệu nội bộ.*
