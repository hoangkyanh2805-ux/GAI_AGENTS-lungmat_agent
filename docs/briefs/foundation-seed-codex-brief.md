# Brief — Foundation Knowledge Seed cho GoClaw Vault

> **Giao cho:** Codex (hoặc AI agent có file write).
> **Output:** ~30-40 file `.md` paste vào GoClaw Vault (`agent.hoa-homes.com/vault`).
> **Owner:** Founder XAUUSD AI Media OS.
> **Generated:** 2026-05-18.

---

## 1. Context

Founder vận hành 3 Telegram brand trading XAUUSD:
- **Alpha Trading Lab** — institutional, smart money, liquidity (audience trung cấp → pro)
- **Raymond - Gold Trading Expert** — mentor, education, psychology (beginner → intermediate)
- **VIP 10X - Gold master Signals** — momentum, session energy (action-oriented)

Bot **Linh Cẩu @linhcau79_bot** đã chạy trên **GoClaw platform** (Go + PostgreSQL + Gemini, self-host). Vault hiện trống → cần seed kiến thức Foundation để bot retrieve khi reply.

**Persona Linh Cẩu (tham chiếu):** `linh-cau/linhcau79/persona.md` đã upload. Voice: xưng "em", gọi user "anh/ae", tiếng Việt thuần, slang Gen Z mix technical term EN (FVG, COT, DXY, sweep). Hard rule: KHÔNG khuyến nghị buy/sell cụ thể.

---

## 2. Mission

Tạo **~30-40 doc Markdown** trong folder `docs/vault-seed/` của repo. Mỗi doc = 1 concept canonical, paraphrase từ 7 sách + 3 framework SMC dưới đây. Founder sẽ upload thủ công qua GoClaw UI (hoặc bulk API khi có).

---

## 3. ⚠️ Copyright & quality constraints (CỨNG)

**MUST follow:**

1. **KHÔNG copy verbatim** — không trích câu/đoạn dài >1 câu nguyên văn từ sách. Paraphrase hoàn toàn bằng từ ngữ riêng.
2. **Synthesize, không transcribe** — kết hợp insight + ví dụ XAUUSD/gold trading context VN (không phải example từ sách).
3. **Cite source rõ ràng** — cuối mỗi doc ghi `Source: <Author> — *<Book Title>* (<Year>), Chapter <N> / Lesson <N>`. Người đọc muốn dig deep có pointer.
4. **Nếu không tự tin có đủ kiến thức về 1 concept** — SKIP doc đó, ghi `// SKIPPED: <reason>` vào output report cuối. Đừng bịa.
5. **200-400 từ/doc** — concise, retrieval-friendly. Concept dài quá → split 2 doc.
6. **Tiếng Việt thuần** — technical term EN giữ nguyên (FVG, liquidity sweep, drawdown, R-multiple, DXY). Không dịch máy clunky.
7. **Tone neutral/educational** — KHÔNG persona Linh Cẩu trong content (bot sẽ overlay persona khi reply). Đây là raw knowledge.

**MUST NOT:**

- KHÔNG paste exercise / quiz / worksheet từ sách
- KHÔNG copy diagram description chi tiết (high-level mention OK)
- KHÔNG reproduce chronological case study từ sách (tự tạo XAUUSD example)
- KHÔNG khuyến nghị buy/sell concrete trong example
- KHÔNG copy table of contents nguyên văn

---

## 4. Output spec

### File structure

```
docs/vault-seed/
├── psychology/
│   ├── douglas-01-probabilistic-mindset.md
│   ├── douglas-02-five-fundamental-truths.md
│   ├── douglas-03-edge-as-probability.md
│   ├── douglas-04-mental-framework-discipline.md
│   ├── tendler-01-tilt-types.md
│   ├── tendler-02-injecting-logic.md
│   ├── tendler-03-confidence-vs-arrogance.md
│   ├── steenbarger-01-deliberate-practice.md
│   ├── steenbarger-02-emotional-recognition.md
│   ├── steenbarger-03-best-practices-process.md
│   ├── steenbarger-04-self-coaching-feedback.md
│   ├── steenbarger-05-journaling-pattern.md
│   ├── steenbarger-06-flow-state.md
│   ├── steenbarger-07-risk-of-ruin-emotional.md
│   └── steenbarger-08-mentor-relationship.md
├── ta-foundation/
│   ├── murphy-01-dow-theory-basics.md
│   ├── murphy-02-trend-types.md
│   ├── murphy-03-support-resistance.md
│   ├── murphy-04-volume-confirmation.md
│   ├── murphy-05-chart-types.md
│   └── murphy-06-moving-averages-roles.md
├── price-action/
│   ├── brooks-01-bar-by-bar-reading.md
│   ├── brooks-02-trading-ranges.md
│   ├── brooks-03-trend-bars-signal.md
│   └── brooks-04-breakout-failure.md
├── candlestick/
│   └── nison-12-key-patterns.md       # 1 doc bao 12 pattern, mỗi pattern 1 paragraph ngắn
├── position-sizing/
│   ├── tharp-01-r-multiple.md
│   ├── tharp-02-position-sizing-models.md
│   └── tharp-03-expectancy-formula.md
├── smc/
│   ├── ict-01-fair-value-gap.md
│   ├── ict-02-order-block.md
│   ├── ict-03-liquidity-sweep.md
│   ├── ict-04-premium-discount.md
│   ├── ict-05-killzones.md
│   ├── wyckoff-01-accumulation.md
│   ├── wyckoff-02-distribution.md
│   ├── wyckoff-03-spring-upthrust.md
│   └── liquidity-general-concepts.md
└── README.md                            # Index + upload mapping table
```

### Template mỗi doc

```markdown
# <Concept Title>

> **Vault tag:** <skill | memory | episodic | context>
> **Brand fit:** <Alpha | Raymond | VIP10X | Tất cả>
> **Source:** <Author> — *<Book>* (<Year>), <Chapter/Lesson>

## Concept

<200-300 từ paraphrase concept core. Không quote nguyên văn.>

## XAUUSD context (ví dụ áp dụng)

<50-100 từ — ví dụ cụ thể cho trader vàng. Tự tạo, không lấy từ sách.>

## Key takeaway

<1-2 câu — học gì + áp dụng thế nào.>

---

*Source: <full citation>. Doc này paraphrase + synthesize, không phải bản dịch.*
```

### README.md (index)

Bảng map tất cả doc → folder/tag/brand:

| File | Vault path đề xuất | Tag | Brand fit |
|---|---|---|---|
| douglas-01-probabilistic-mindset.md | lung-mat/psychology/ | memory | Raymond ⭐ |
| ... | ... | ... | ... |

---

## 5. Per-source tasks

### 5.1 Mark Douglas — *Trading in the Zone* (2000)

**4 docs** từ 4 chương đầu. Concept core:

| # | File | Concept (Codex tự tìm trong chapter) | Tag |
|---|---|---|---|
| 1 | douglas-01-probabilistic-mindset.md | Probabilistic thinking — coi mỗi trade là 1 sample trong distribution, không phải 1 prediction | memory |
| 2 | douglas-02-five-fundamental-truths.md | 5 nguyên lý cơ bản về market behavior trader phải accept | memory |
| 3 | douglas-03-edge-as-probability.md | Edge không guarantee mỗi trade thắng — edge là probabilistic advantage qua N trade | memory |
| 4 | douglas-04-mental-framework-discipline.md | Cấu trúc tâm lý ngăn impulse trade, lý do "kỷ luật" không phải willpower mà framework | memory |

**Brand fit:** Raymond ⭐⭐⭐ (core mentor content)

### 5.2 Jared Tendler — *The Mental Game of Trading* (2021)

**3 docs:**

| # | File | Concept | Tag |
|---|---|---|---|
| 1 | tendler-01-tilt-types.md | 7 loại tilt (anger, fear, mistake, revenge, hope, winner's, entitlement) — cách nhận diện | memory |
| 2 | tendler-02-injecting-logic.md | Kỹ thuật "inject logic" — phát hiện cảm xúc real-time, dùng câu logic counter-act trước khi quyết định | memory |
| 3 | tendler-03-confidence-vs-arrogance.md | Confidence vs overconfidence — phân biệt + dấu hiệu trader đang slide vào arrogance | memory |

**Brand fit:** Raymond ⭐⭐

### 5.3 Brett Steenbarger — *The Daily Trading Coach* (2009)

**8 docs** từ 60 lesson — group theo theme (không paraphrase từng lesson):

| # | File | Theme | Tag |
|---|---|---|---|
| 1 | steenbarger-01-deliberate-practice.md | Deliberate practice — repetition focused vs random screen time | episodic |
| 2 | steenbarger-02-emotional-recognition.md | Recognize emotional state TRƯỚC khi vào lệnh | episodic |
| 3 | steenbarger-03-best-practices-process.md | Build "best practices" cá nhân — process > outcome | episodic |
| 4 | steenbarger-04-self-coaching-feedback.md | Self-coaching feedback loop — log + review + adjust | episodic |
| 5 | steenbarger-05-journaling-pattern.md | Journaling effective — không phải write everything, write pattern | episodic |
| 6 | steenbarger-06-flow-state.md | Trader flow state — điều kiện trigger + nhận diện khi mất | episodic |
| 7 | steenbarger-07-risk-of-ruin-emotional.md | Emotional risk of ruin — tài khoản còn nguyên nhưng tâm lý đã cháy | episodic |
| 8 | steenbarger-08-mentor-relationship.md | Tự làm mentor cho chính mình — daily ritual | episodic |

**Brand fit:** Raymond ⭐⭐⭐

### 5.4 John Murphy — *Technical Analysis of the Financial Markets* (1999)

**6 docs** từ 3 chương intro:

| # | File | Concept | Tag |
|---|---|---|---|
| 1 | murphy-01-dow-theory-basics.md | Dow Theory 6 nguyên lý cốt lõi | skill |
| 2 | murphy-02-trend-types.md | 3 loại trend (primary/secondary/minor) + time horizons | skill |
| 3 | murphy-03-support-resistance.md | Support/resistance — cách identify + flip role | skill |
| 4 | murphy-04-volume-confirmation.md | Volume xác nhận price action — phân kỳ volume/price | skill |
| 5 | murphy-05-chart-types.md | Line/bar/candle/point-and-figure — khi nào dùng cái nào | skill |
| 6 | murphy-06-moving-averages-roles.md | MA roles — trend filter, dynamic S/R, crossover signal | skill |

**Brand fit:** Alpha ⭐⭐ + tất cả

### 5.5 Al Brooks — *Reading Price Charts Bar by Bar* (2009)

**4 docs:**

| # | File | Concept | Tag |
|---|---|---|---|
| 1 | brooks-01-bar-by-bar-reading.md | Đọc từng bar — open/close/high/low message gì | skill |
| 2 | brooks-02-trading-ranges.md | Trading range structure — phân biệt range thật vs sắp break | skill |
| 3 | brooks-03-trend-bars-signal.md | Trend bar vs signal bar — phân biệt | skill |
| 4 | brooks-04-breakout-failure.md | Breakout failure pattern — 80% breakout fail, cách identify | skill |

**Brand fit:** Alpha ⭐

### 5.6 Steve Nison — *Japanese Candlestick Charting Techniques* (1991)

**1 doc** bao 12 pattern phổ biến nhất (single + reversal + continuation):

| # | File | Concept | Tag |
|---|---|---|---|
| 1 | nison-12-key-patterns.md | 12 candlestick patterns: Doji, Hammer, Shooting Star, Engulfing (bull/bear), Harami, Morning/Evening Star, Three White Soldiers, Three Black Crows, Tweezer, Spinning Top, Marubozu. Mỗi pattern 1 paragraph ~50 từ (formation + bias + reliability). | skill |

**Brand fit:** Tất cả

### 5.7 Van Tharp — *Trade Your Way to Financial Freedom* (1998)

**3 docs:**

| # | File | Concept | Tag |
|---|---|---|---|
| 1 | tharp-01-r-multiple.md | R-multiple — đo P&L bằng bội số risk R (1R = số tiền risk per trade) | skill |
| 2 | tharp-02-position-sizing-models.md | Position sizing models — Fixed dollar, Fixed %, Percent volatility (ATR-based), Kelly | skill |
| 3 | tharp-03-expectancy-formula.md | Expectancy = (Win rate × Avg win R) − (Loss rate × Avg loss R). Áp dụng evaluate system | skill |

**Brand fit:** Raymond + Alpha ⭐⭐

### 5.8 SMC — ICT (Inner Circle Trader, Michael J. Huddleston)

**5 docs** từ free 2022 mentorship YouTube series:

| # | File | Concept | Tag |
|---|---|---|---|
| 1 | ict-01-fair-value-gap.md | FVG (Fair Value Gap) — 3-candle imbalance, mitigation theory, entry/SL placement | skill |
| 2 | ict-02-order-block.md | Order block — last candle trước đảo chiều mạnh, institutional footprint | skill |
| 3 | ict-03-liquidity-sweep.md | Liquidity sweep / stop hunt — equal highs/lows làm liquidity pool, sweep pattern | skill |
| 4 | ict-04-premium-discount.md | Premium/discount theory — fib 50% làm midline, sell premium / buy discount | skill |
| 5 | ict-05-killzones.md | Killzones (London 07-10 UTC, NY 12-15 UTC) — entry window prime | skill |

**Brand fit:** Alpha ⭐⭐⭐

⚠️ ICT controversial — paraphrase concept, KHÔNG promote ICT mentorship sale. Đừng cite "ICT 2022 Mentorship Lesson #X" cụ thể (membership-only). Cite "ICT concept (free YouTube material)" general.

### 5.9 Wyckoff Method

**3 docs:**

| # | File | Concept | Tag |
|---|---|---|---|
| 1 | wyckoff-01-accumulation.md | Accumulation phase — 5 phase (PS, SC, AR, ST, SOS), smart money build position | skill |
| 2 | wyckoff-02-distribution.md | Distribution phase — mirror accumulation, smart money exit | skill |
| 3 | wyckoff-03-spring-upthrust.md | Spring (false breakdown) + Upthrust (false breakout) — manipulation patterns | skill |

**Brand fit:** Alpha ⭐⭐

**Source citation:** Richard Wyckoff + Hank Pruden modern interpretation. Free PDF có sẵn (out of copyright cho original 1920s text).

### 5.10 Liquidity (general)

**1 doc:**

| # | File | Concept | Tag |
|---|---|---|---|
| 1 | liquidity-general-concepts.md | Liquidity zones, buy-side vs sell-side liquidity, why price seeks liquidity. Bridge từ Wyckoff + ICT concepts thành unified narrative. | skill |

**Brand fit:** Alpha + VIP10X

---

## 6. README.md output (index)

Cuối batch, tạo file `docs/vault-seed/README.md` chứa:

1. **Mục lục** — list tất cả file đã tạo + tag + brand fit
2. **Upload mapping** — Vault folder đề xuất cho từng doc (vd `lung-mat/psychology/` cho Douglas/Tendler/Steenbarger; `linh-cau/shared-xauusd/ta/` cho Murphy/Brooks/Nison/Tharp; `linh-cau/shared-xauusd/smc/` cho ICT/Wyckoff)
3. **Skipped items** — nếu có concept skip vì không đủ context, list lý do
4. **Total stats** — số doc, tổng từ, avg từ/doc

---

## 7. Verification checklist (codex tự run)

Trước khi finalize:

- [ ] Mỗi doc 200-400 từ (range check)
- [ ] KHÔNG có quote dài >1 câu từ source nào
- [ ] Mỗi doc có XAUUSD-context example (không copy example từ sách)
- [ ] Tag (`skill`/`memory`/`episodic`/`context`) consistent
- [ ] Citation cuối mỗi doc đầy đủ (author, title, year, chapter)
- [ ] Tiếng Việt natural, không clunky dịch máy
- [ ] Filename kebab-case match spec mục 5
- [ ] README.md có đủ mục lục + upload mapping

---

## 8. Delivery

Khi xong, output report:

```
✅ Done — <N> docs created in docs/vault-seed/
- Psychology: <count>
- TA Foundation: <count>
- Price Action: <count>
- Candlestick: <count>
- Position Sizing: <count>
- SMC: <count>

Total words: <total>
Skipped: <list with reasons>

Next: Founder upload qua GoClaw UI (Click + → folder → paste content → chọn tag → save).
```

---

## 9. Out-of-scope (KHÔNG làm)

- KHÔNG paraphrase sách khác ngoài 7 sách trên
- KHÔNG paraphrase YouTube content khác ngoài ICT/Wyckoff
- KHÔNG tạo content cho specific brand (Alpha/Raymond/VIP10X) — đó là content layer, không phải knowledge layer
- KHÔNG paraphrase macro data (FRED, CPI, NFP) — đó là dynamic data, sẽ MCP integrate
- KHÔNG paraphrase Vietnamese sources (TraderViet, Hari Investing) — separate brief sau
- KHÔNG upload thật vào GoClaw — founder làm thủ công qua UI

---

## 10. Founder review note

Sau khi codex xong, founder:
1. Review 3-5 doc random để verify quality (paraphrase đủ, citation OK, XAUUSD example hợp lý)
2. Spot-check 1 doc Mark Douglas với sách gốc (nếu có) — đảm bảo không quá gần verbatim
3. Upload từng folder vào Vault theo mapping README.md (~30-40 doc × 1 phút/doc = ~1 giờ upload)
4. Test bot Linh Cẩu: hỏi "FVG là gì?", "R-multiple tính sao?", "Tilt là gì?" — verify retrieval

---

*Brief generated 2026-05-18 bởi Claude Code session. Codex tự do bổ sung doc nếu thấy concept quan trọng còn thiếu — note vào README.md.*
