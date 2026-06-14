---
name: V84 AI Cost Manager
description: Cache LRU + model routing + prompt summarizer để giảm chi phí AI gọi /api/claude
---

# V84 — AI Cost Manager

**Why:** 9 engines gọi AI trực tiếp, không cache, không routing. divineOracleV77 dùng Opus cho 300 tokens = lãng phí 94.8%.

## 2 Files

| File | Key | Init |
|---|---|---|
| aiCostManager.js | cgv6_ai_cost_manager_v84 | 22700ms |
| modelRoutingEngine.js | cgv6_model_router_v84 | 22800ms |

## Key Routing Rules

- oracle/prophecy → Haiku (-94.8% vs Opus)
- story/lore/diplomacy/analysis/summary → Sonnet (-80% vs Opus)
- genesis/narrative/world_build/deep_lore → Opus (justified)

## Engine Overrides

- divineOracleV77 → Haiku
- worldLoreGenerator → Sonnet
- narrativeGeneratorV68, aiGenesisEngine, worldGenerationPipeline → Opus (kept)

## API Pattern cho engines mới

```javascript
// All-in-one:
const r = await window.aiSmartCall("myEngine", "oracle", systemPrompt, userMsg, 300);
const text = r.content;  // cached or fresh

// Verbose:
const r = await window.aiCall({
  model: "claude-opus-4-5",  // sẽ được route tự động theo taskType
  system: systemPrompt,
  messages: [{ role: "user", content: userMsg }],
  max_tokens: 300,
  engine: "myEngine",
  taskType: "oracle"
});
```

## Cache Details

- Key = hash(model + system[0:180] + userMsg[0:180])
- TTL: oracle 30min · world 1h · lore/narrative 2h
- Max 60 entries, LRU eviction
- Clear: `window.aiCostClearCache()`

## How to Apply

- Engines V85+ dùng `window.aiCall()` hoặc `window.aiSmartCall()` thay vì fetch trực tiếp
- Engines cũ KHÔNG cần sửa — routing chỉ kích hoạt khi dùng API mới
- Force override: `window.aiForceHaiku()` để test rẻ nhất, `window.aiForceAuto()` để về auto
- Next version init từ 22900ms+
