# AI_COST_REPORT.md — Creator God V6 V84
> Ngày: 2026-06-14 · Version: V84 — AI Cost Optimization Pass
> Phương pháp: Phân tích 9 engines gọi AI, pricing thực tế, routing recommendations

---

## 1. HIỆN TRẠNG — TRƯỚC V84

### Engines Gọi AI (9 files)

| Engine | Model Đang Dùng | Tier | max_tokens | Ghi Chú |
|---|---|---|---|---|
| `aiGenesisEngine.js` | claude-opus-4-5 | 🔴 Opus | 3000 | World genesis — justified |
| `worldGenerationPipeline.js` | claude-opus-4-5 | 🔴 Opus | ~2000 | Complex world build — justified |
| `narrativeGeneratorV68.js` | claude-opus-4-5 | 🔴 Opus | variable | Long narrative — justified |
| `divineOracleV77.js` | claude-opus-4-5 | 🔴 Opus | **300** | ❌ LÃNG PHÍ — oracle ngắn |
| `aiWorldGenerator.js` | claude-sonnet-4-20250514 | 🟡 Sonnet | 4000 | OK |
| `worldHub.js` | claude-sonnet-4-20250514 | 🟡 Sonnet | 1000 | OK |
| `worldStorySystem.js` | claude-sonnet-4-20250514 | 🟡 Sonnet | 1000 | OK |
| `worldLoreGenerator.js` | claude-opus-4-5 | 🔴 Opus | ~1500 | 🟡 Có thể dùng Sonnet |
| `serve.js` | — | — | — | Proxy /api/claude |

### Vấn Đề Phát Hiện

| # | Vấn Đề | Impact | Giải Pháp |
|---|---|---|---|
| 1 | `divineOracleV77.js` dùng Opus cho 300 tokens | 🔴 Chi phí 94% cao hơn cần thiết | Route → Haiku |
| 2 | Không có cache — cùng prompt gọi lại nhiều lần | 🔴 100% lãng phí | Cache với TTL |
| 3 | System prompts có thể dài 2000+ chars | 🟡 Tốn input tokens | Prompt optimizer |
| 4 | Không tracking — không biết chi bao nhiêu | 🟡 Không có visibility | Cost tracker |
| 5 | Không có budget limit | 🟡 Có thể overrun | Budget system |
| 6 | `worldLoreGenerator.js` dùng Opus cho lore ngắn | 🟡 Có thể dùng Sonnet | Route → Sonnet |

---

## 2. MODEL PRICING (USD per 1M tokens)

| Model | Input | Output | Tier | Ghi Chú |
|---|---|---|---|---|
| claude-haiku-4-5 | $0.80 | $4.00 | 🟢 Haiku | Rẻ nhất · Tốt cho tasks ngắn |
| claude-3-5-haiku-20241022 | $0.80 | $4.00 | 🟢 Haiku | Haiku phiên bản 3.5 |
| claude-sonnet-4-20250514 | $3.00 | $15.00 | 🟡 Sonnet | Medium · Cân bằng |
| claude-opus-4-5 | $15.00 | $75.00 | 🔴 Opus | Đắt nhất · Chỉ khi cần deep reasoning |

**Chi phí ví dụ — 1 lần gọi oracle (300 tokens output):**
- Với Opus: ~300 input + 300 output = $0.0000045 + $0.0000225 = **$0.0000270**
- Với Haiku: ~300 input + 300 output = $0.00000024 + $0.0000012 = **$0.0000014**
- **Tiết kiệm: 94.8%** chỉ bằng cách đổi model cho oracle calls

**Chi phí ví dụ — 10 lần oracle/session:**
- Với Opus: $0.000270
- Với Haiku: $0.000014
- **Tiết kiệm: ~$0.000256/session** · ~$0.094/năm với 365 sessions

---

## 3. GIẢI PHÁP ĐÃ TRIỂN KHAI — V84

### aiCostManager.js (init: 22700ms · save: cgv6_ai_cost_manager_v84)

#### Cache Layer
```
Cache key  = hash(model + system[0:180] + userMsg[0:180])
TTL        = 30 phút (oracle/prophecy) · 1 giờ (world) · 2 giờ (lore/narrative)
Max size   = 60 entries (LRU eviction)
Invalidate = aiCostClearCache()
```

**Khi nào cache hiệu quả nhất:**
- Oracle hỏi cùng câu lặp lại → 100% cache hit sau lần đầu
- Lore generation cho cùng region → cache hit
- World description đã generate → không generate lại

#### Budget System
```
Session limit  = $0.50 (có thể đổi qua aiCostSetBudget(amount))
Alert at       = $0.30 (60% budget)
Budget exceeded → trả về message thay vì gọi API
Reset          = aiCostResetSession()
```

#### window.aiCall() — Unified API
```javascript
const result = await window.aiCall({
  model: "claude-opus-4-5",   // sẽ được route tự động
  system: "...",               // sẽ được optimize/summarize
  messages: [...],
  max_tokens: 500,
  engine: "myEngine",          // để track
  taskType: "oracle"           // để route model
});
// result.cached = true nếu từ cache
// result.cost.total = chi phí thực
// result.content = text response
```

#### Tracking Stats
- Theo dõi per-model: calls, cost, tokens, cache hits
- Theo dõi per-engine: calls, cost, cache hits
- Call log 100 entries gần nhất
- Session spend + all-time spend

---

### modelRoutingEngine.js (init: 22800ms · save: cgv6_model_router_v84)

#### Task Type → Model Mapping

| Task Type | Model | Lý Do |
|---|---|---|
| oracle | 🟢 Haiku | Câu trả lời ngắn 300 tokens — Haiku đủ |
| prophecy | 🟢 Haiku | Văn ngắn, không cần deep reasoning |
| npc_name / npc_bio | 🟢 Haiku | Tên và tiểu sử đơn giản |
| event_title | 🟢 Haiku | Chỉ cần 1 câu |
| story / lore | 🟡 Sonnet | Medium complexity |
| diplomacy / analysis | 🟡 Sonnet | Cần coherence nhưng không cần Opus |
| summary | 🟡 Sonnet | Tóm tắt — Sonnet đủ |
| genesis / narrative | 🔴 Opus | Complex world building cần best model |
| deep_lore / world_build | 🔴 Opus | Mythology depth cần Opus |

#### Engine Routing (override mặc định)

| Engine | Trước | Sau | Tiết Kiệm |
|---|---|---|---|
| `divineOracleV77.js` | Opus | 🟢 Haiku | **-94%** |
| `worldLoreGenerator.js` | Opus | 🟡 Sonnet | **-80%** |
| `worldStorySystem.js` | Sonnet | Sonnet | — (OK) |
| `worldHub.js` | Sonnet | Sonnet | — (OK) |
| `narrativeGeneratorV68.js` | Opus | Opus | — (justified) |
| `aiGenesisEngine.js` | Opus | Opus | — (justified) |

#### Force Override Controls
```javascript
window.aiForceHaiku()    // Tất cả → Haiku (test cheapest)
window.aiForceSonnet()   // Tất cả → Sonnet (balance)
window.aiForceAuto()     // Khôi phục auto routing
window.aiSetTaskModel("oracle", "haiku")   // Custom override
window.aiSetEngineModel("divineOracleV77", "haiku")
```

#### Memory Summarizer
```javascript
window.aiSummarizePrompt(text, 800)
// Phân tích line-by-line, giữ dòng có keywords quan trọng
// (name, world, year, kingdom, war, religion, goal...)
// Trim còn maxLength characters
// Cache kết quả để không process lại

window.aiOptimizePrompt(prompt)
// Remove multiple newlines → double newline
// Trim whitespace per line
// Dedup adjacent identical lines
```

---

## 4. PUBLIC API ĐẦY ĐỦ

### aiCostManager.js
```javascript
window.aiCall(options)           // Unified AI caller (cache + routing + tracking)
window.aiCostGetReport()         // Full cost report object
window.aiCostSetBudget(0.50)     // Set session budget limit
window.aiCostResetSession()      // Reset session stats + call log
window.aiCostClearCache()        // Xóa toàn bộ response cache
window.aiCostToggle()            // Bật/tắt cost manager
```

### modelRoutingEngine.js
```javascript
window.aiRouteModel(taskType, requestedModel)   // Route model theo task
window.aiRouteByEngine(engineName, model)        // Route theo engine
window.aiSummarizePrompt(text, maxLen)           // Compress system prompt
window.aiOptimizePrompt(prompt)                  // Clean up prompt
window.aiSmartCall(engine, task, system, msg, tokens) // All-in-one helper
window.aiEstimateCost(model, system, msg, outTok)    // Tính giá trước
window.aiForceHaiku()   window.aiForceSonnet()   window.aiForceAuto()
window.aiSetTaskModel(type, "haiku"|"sonnet"|"opus")
window.aiSetEngineModel(engine, "haiku"|"sonnet"|"opus")
```

---

## 5. KẾT QUẢ KỲ VỌNG

| Tình Huống | Trước V84 | Sau V84 | Cải Thiện |
|---|---|---|---|
| Oracle call (300 tokens) | $0.0000270 | $0.0000014 | **-94.8%** |
| Cùng oracle hỏi 2 lần | $0.0000540 | $0.0000014 | **-97.4%** (cache) |
| Lore generation dài | $0.0045 | $0.0009 | **-80%** (Opus→Sonnet) |
| Session 20 oracle calls | $0.000540 | $0.000028 | **-94.8%** |
| Budget exceeded | Không kiểm soát | Dừng tự động | ✅ Protected |
| Visibility | Không biết | Full dashboard | ✅ New |

---

## 6. UI (2 widgets trong creator-hub-v32)

```
💰 AI Cost Manager V84
  ├─ Budget bar: $0.0000 / $0.50 (0%)
  ├─ 4 cards: API Calls · Cache Hit% · Cache Hits · Saved$
  ├─ Per-model breakdown: model → calls · cost · cached
  └─ Recent call log: model · engine · [cached] · cost

🧭 Model Router V84
  ├─ Force buttons: ⬇ Haiku · ≡ Sonnet · ⚡ Auto
  ├─ Status: Auto Routing / Forced · total routings · saved$
  ├─ Task→Model table (8 tasks)
  └─ Engine→Model table (8 engines)
```

---

## 7. CÁCH TÍCH HỢP VÀO ENGINE HIỆN CÓ

### Cách đơn giản nhất (không sửa engine cũ):
Engine hiện tại tiếp tục dùng `fetch("/api/claude", ...)` — routing và cache chỉ kích hoạt khi engine **chọn dùng** `window.aiCall()`.

### Cách tích hợp tốt hơn (engine mới):
```javascript
// THAY VÌ:
const resp = await fetch("/api/claude", {
  method: "POST",
  body: JSON.stringify({ model: "claude-opus-4-5", max_tokens: 300, ... })
});
const json = await resp.json();
const text = json.content[0].text;

// DÙNG:
const result = await window.aiCall({
  model: "claude-opus-4-5",   // sẽ tự route → haiku nếu taskType="oracle"
  system: systemPrompt,
  messages: messages,
  max_tokens: 300,
  engine: "divineOracleV77",
  taskType: "oracle"
});
const text = result.content;   // từ cache hoặc API
```

### Tích hợp nhanh nhất:
```javascript
const result = await window.aiSmartCall(
  "divineOracleV77",  // engineName
  "oracle",           // taskType → auto-routes to Haiku
  systemPrompt,       // sẽ được summarize nếu > 1200 chars
  userMessage,        // user query
  300                 // max_tokens
);
const text = result.content;
```

---

## 8. FILES TẠO MỚI

| File | Save Key | Init |
|---|---|---|
| `aiCostManager.js` | `cgv6_ai_cost_manager_v84` | 22700ms |
| `modelRoutingEngine.js` | `cgv6_model_router_v84` | 22800ms |
| `AI_COST_REPORT.md` | — | — |

**Next Version:** V85 init từ 22900ms+
