---
name: V75 AI Genesis Architecture
description: AI World Genesis Pass — Claude AI tạo thế giới hoàn chỉnh từ text prompt. 4 files, 4 tabs creator-hub-v32, hook hubRenderPanel.
---

# V75 AI World Genesis Pass

## 4 Files
- `aiGenesisEngine.js` — init 18400ms · save: `cgv6_ai_genesis_v75`
- `promptToWorldEngine.js` — init 18500ms · save: `cgv6_prompt_world_v75`
- `worldGenerationPipeline.js` — init 18600ms · save: `cgv6_world_pipeline_v75`
- `worldLoreGenerator.js` — init 18700ms · save: `cgv6_lore_gen_v75`

## Claude API
- Model: `claude-opus-4-5`
- Endpoint: POST `/api/claude`
- max_tokens: 3000
- Trả về JSON thuần — không markdown block
- Fallback: strip ` ```json ` trước khi parse

## 7 Genre Detection
`cultivation` (tu tiên) · `fantasy` (kỳ huyễn) · `scifi` (khoa học) · `mythology` (thần thoại) · `apocalypse` (tận thế) · `cyberpunk` · `hybrid` (default)

## JSON Schema Output Bắt Buộc
```
worldName · worldDesc · genre · theme · magicSystem · cosmology
countries[]: name,government,population,power,stability,religion,culture,capital
races[]: name,desc,trait,power,magic,wisdom
religions[]: name,deity,doctrine,followers
creatures[]: name,type,desc,power,rarity
heroes[]: name,title,backstory,power
lore: {originMyth,firstAge,greatWar,prophecy,legend}
economy: {type,mainResource,tradeRoutes}
scale · civScore
```

## UI Hook Pattern
```javascript
// worldLoreGenerator.js hooks creator-hub-v32
const _orig = window.hubRenderPanel;
window.hubRenderPanel = function(panelId) {
  if (_orig) _orig(panelId);
  if (panelId === "creator-hub-v32") {
    setTimeout(() => wgl75RenderSection(), 60);
  }
};
```

## Apply Pipeline
```
wgp75Generate(prompt) → wgp75GetPending() → wgp75ApplyWorld()
  → window.world (name/desc/genre/civScore/aiGenerated)
  → window.countries[0..N] (government/population/power/stability/religion)
  → window.npcs[0..2] (name/title/power — từ heroes)
  → htAddEvent(4 events) + wmeAddMemory(2 entries)
```

## Keyword Hints → Prompt Context
- `dark` → Stability 20-50, thêm dark note vào system prompt
- `war` → 5 quốc gia, power chênh lệch lớn

## KHÔNG Trùng Với
- `aiWorldGenerator.js` — random seeded RNG, KHÔNG có Claude
- `worldCreationWizard.js` — manual 5-step UI, KHÔNG AI
- `originStoryEngine.js` — static lore template banks
- `worldDNAEngine.js` — DNA/seed system

## Next Version
V76 init bắt đầu từ **18800ms+**

**Why:** Text-to-world cần riêng biệt với manual world creation wizard (V62) và static lore generator (V62 originStory) — V75 tập trung pure AI-driven generation qua Claude.
