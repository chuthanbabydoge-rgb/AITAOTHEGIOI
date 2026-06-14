---
name: V68 Narrative Engine Architecture
description: 4-file World Narrative Engine — uses /api/claude to write Vietnamese literary chronicles · 4 styles · chapter list + reader UI · patch creator-hub-v32
---

## Files (4 files, init 15200→15500ms)
- worldNarrativeCoreV68.js (15200ms) — chapter data, snapshot builder, auto-generate via gameTick hook
- narrativeGeneratorV68.js (15300ms) — prompt builder, fetch /api/claude, extractTitle/Tags, progress display
- narrativeBookV68.js (15400ms) — 2-panel UI (chapter list + reader), markdown→HTML, copy/delete
- narrativeRegistryV68.js (15500ms) — patch creator-hub-v32 (nr68-section-wrapper), Jarvis banner, quick generate

## Save Keys
cgv6_world_narrative_v68 (single key, all chapter data)

## Global Objects
window.worldNarrativeV68Data · window.narrativeGenV68State · window.wn68Styles

## Key Public APIs
- wn68BuildSnapshot() → world data object for prompt
- wn68AddChapter(chapter) → saves + calls V64 wmeAddMemory + htAddEvent
- wn68GetChapters() → sorted by year
- wn68DeleteChapter(id)
- wn68Save()
- ng68GenerateChapter(silent, customFocus) → async, calls /api/claude
- ng68GenerateWithFocus(text) → shortcut
- nb68RenderPanel() → full panel HTML
- nb68ReadChapter(id) → show chapter in reader
- nr68Refresh() → re-render #nr68-book-content
- nr68_quickGenerate() → quick generate button handler

## Claude API Call Pattern
```javascript
fetch("/api/claude", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-opus-4-5",
    max_tokens: 400|800|1400,
    messages: [{ role: "user", content: prompt }]
  })
})
```
Response: data.content[0].text

## 4 Style Prompts
- su_thi: sử thi trang trọng, hào hùng, từ ngữ cổ kính
- truyen_ky: truyện kể sinh động như tiểu thuyết lịch sử
- bien_nien_su: [Năm X] format, khách quan, súc tích
- su_thi_anh_hung: tập trung anh hùng, ẩn dụ hùng tráng

## Prompt Data Sources (8 categories)
1. Top 8 countries by population
2. Top 5 empires by power
3. Active wars (top 5)
4. Top 6 NPCs alive by power
5. Last 15 historical events (htData/historicalTimeline)
6. Last 8 divine acts (creatorLegacyV66Data.legacyEntries)
7. Active prophecies V51+V66 (up to 5)
8. Current era (ageV25Data.current) + God status

## V64 Integration
Each chapter → wmeAddMemory() + htAddEvent({type:"narrative", color:"#fbbf24"})

## UI IDs
nr68-section-wrapper (patch check) · nr68-book-content · nr68-jarvis-banner
ng68-progress · ng68-style-select · ng68-length-select · ng68-focus-input
nb68-panel · nb68-chapter-list · nb68-reader

## Section Placement
Injected into panel-creator-hub-v32 via patchCreatorHub() at setTimeout 200ms after hubRenderPanel("creator-hub-v32")

## Auto-Generate
Settings: autoGenerate (bool) + autoInterval (100-5000 years). Hook via gameTick. Silent generation = no UI progress shown.

## Next Version
V69 init từ 15600ms+
