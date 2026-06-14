# AI GENESIS REPORT — Creator God V6 V75
> Ngày tạo: 2026-06-14 (AI World Genesis Pass)
> "Text → World trong 60 giây" — Claude AI tạo thế giới hoàn chỉnh từ mô tả tự nhiên

---

## 1. Tầm Nhìn

**"User không cần tạo thủ công. User chỉ cần mô tả. AI tự tạo thế giới."**

```
Input:  "Tạo thế giới thần thoại Bắc Âu nơi Ragnarok chưa từng xảy ra."
         ↓ 30-60 giây
Output: Thế giới hoàn chỉnh với:
        • 3-5 Quốc gia (tên, chính phủ, dân số, ổn định, tôn giáo)
        • 3 Chủng tộc (lore, chỉ số, đặc trưng)
        • 2-3 Tôn giáo (thần, giáo lý, tín đồ)
        • 3 Sinh vật (loại, sức mạnh, độ hiếm)
        • 3 Anh hùng (lý lịch, danh hiệu, sức mạnh)
        • Lore đầy đủ (khai thiên, kỷ nguyên, đại chiến, tiên tri, huyền thoại)
        • Kinh tế (loại, tài nguyên, tuyến thương mại)
        • CivScore, Scale
```

---

## 2. Files Được Tạo (4 files)

| File | Hệ Thống | Init | Save Key |
|---|---|---|---|
| `aiGenesisEngine.js` | Claude API caller · 7 genre detector · JSON parser · Generation history | 18400ms | `cgv6_ai_genesis_v75` |
| `promptToWorldEngine.js` | Prompt analyzer · Keyword extraction · 7 templates · System prompt builder | 18500ms | `cgv6_prompt_world_v75` |
| `worldGenerationPipeline.js` | Pipeline orchestrator · Apply world to game · Country/NPC/Lore injection | 18600ms | `cgv6_world_pipeline_v75` |
| `worldLoreGenerator.js` | UI Registry · 4 tabs trong creator-hub-v32 · Hook hubRenderPanel | 18700ms | `cgv6_lore_gen_v75` |

---

## 3. Genre Detection System — 7 Thể Loại

| Thể Loại | Icon | Keywords Detect |
|---|---|---|
| Tu Tiên | ⚗️ | tu tiên, tu luyện, tiên, đan, kiếm, pháp, thánh, đạo |
| Kỳ Huyễn | ⚔️ | fantasy, kỳ huyễn, phép thuật, rồng, elf, dwarf, phù thủy |
| Khoa Học | 🚀 | sci-fi, khoa học, không gian, robot, AI, công nghệ, tương lai |
| Thần Thoại | ⚡ | thần thoại, bắc âu, hy lạp, ai cập, norse, odin, thor, zeus |
| Tận Thế | ☢️ | tận thế, zombie, apocalypse, hậu tận, sinh tồn, hạt nhân |
| Cyberpunk | 🤖 | cyberpunk, neo, hack, corp, neon, implant, matrix |
| Lai Ghép | 🌀 | (default — không match genre nào) |

---

## 4. Prompt Analysis System

### Keyword Hints Detection

| Hint | Keywords Detect | Ảnh Hưởng |
|---|---|---|
| `dark` | hắc ám, tối tăm, bóng tối, ma đạo, tà ác | Stability 20-50, tông màu bi kịch |
| `light` | thiên đường, ánh sáng, thánh, chính đạo, hòa bình | Stability 70-90, tông hùng tráng |
| `war` | chiến tranh, xung đột, chinh phạt, bá quyền | 5 quốc gia (nhiều xung đột) |
| `ancient` | cổ đại, thượng cổ, ngàn năm | Era: Cổ Đại |
| `fallen` | sụp đổ, suy tàn, diệt vong | Trạng thái: Thế Giới Đang Sụp Đổ |

### Analysis Output
```javascript
{
  genre: { id, name, emoji },
  hints: ["dark", "war"],
  wordCount: 12,
  complexity: "Trung Bình",
  estimatedTime: "15-45 giây",
  features: {
    countries: "5 quốc gia (nhiều xung đột)",
    tone: "Hắc Ám / Bi Kịch",
    era: "Cổ Đại",
    state: "Thế Giới Đang Sụp Đổ"
  }
}
```

---

## 5. Claude API Integration

### Endpoint
```
POST /api/claude
```

### Model
```
claude-opus-4-5
max_tokens: 3000
```

### System Prompt Structure
```
[AI Sáng Thế identity]
[Genre phát hiện]
[JSON Schema bắt buộc]
[Dark/War hints nếu có]
[Extra context nếu có]
[User prompt]
```

### JSON Schema Output (Claude phải trả về)
```json
{
  "worldName": "Tên thế giới",
  "worldDesc": "Mô tả 2-3 câu",
  "genre": "cultivation/fantasy/scifi/mythology/apocalypse/cyberpunk/hybrid",
  "theme": "Chủ đề cốt lõi",
  "magicSystem": "Hệ thống ma thuật/công nghệ",
  "cosmology": "Cấu trúc vũ trụ",
  "countries": [{ "name", "government", "population", "power", "stability", "religion", "culture", "capital", "specialty" }],
  "races": [{ "name", "desc", "trait", "power", "magic", "wisdom" }],
  "religions": [{ "name", "deity", "doctrine", "followers" }],
  "creatures": [{ "name", "type", "desc", "power", "rarity" }],
  "lore": { "originMyth", "firstAge", "greatWar", "prophecy", "legend" },
  "heroes": [{ "name", "title", "backstory", "power" }],
  "economy": { "type", "mainResource", "tradeRoutes" },
  "scale": "Tiny/Small/Medium/Large/Massive",
  "civScore": 1000-20000
}
```

### Error Handling
- HTTP error → ghi failedCalls++, trả về `{ ok: false, error }`
- JSON parse error → cố làm sạch (trim, strip markdown) → thử lại parse
- Validation fail (`!worldName || !countries`) → trả về lỗi rõ ràng

---

## 6. Generation Pipeline

```
Prompt Input → ptw75AnalyzePrompt()
    ↓
Genre detect + Keyword hints
    ↓
ag75BuildSystemPrompt() → System prompt đầy đủ
    ↓
ag75CallClaude() → POST /api/claude
    ↓
ag75ParseWorldJSON() → Validate + parse JSON
    ↓
wgp75Generate() → Lưu pendingWorld
    ↓
wgl75RenderPreview() → Hiển thị World Preview tab
    ↓
[User click "Áp Dụng vào Game"]
    ↓
wgp75ApplyWorld() → Apply window.world / window.countries / window.npcs
    ↓
htAddEvent() + wmeAddMemory() → Ghi lịch sử
    ↓
✅ Thế giới AI sống trong game
```

---

## 7. Apply to Game State

### Objects được cập nhật:
| Object | Dữ Liệu Inject |
|---|---|
| `window.world` | name, desc, genre, civScore, aiGenerated, aiPrompt |
| `window.countries[0..N]` | name, government, population, power, stability, religion, culture, capital |
| `window.npcs[0..2]` | name, title, power (từ heroes data) |
| Historical Timeline | 4 events: Khai Thiên, Kỷ Nguyên Đầu, Đại Chiến, Tiên Tri |
| World Memory | 2 entries: Genesis + Legend |

---

## 8. UI — 4 Tabs trong Creator Hub V32

### Tab Structure (inject vào creator-hub-v32)

```
↑ Creator Hub V32 (existing content — KHÔNG xóa)
──────────────────── AI WORLD GENESIS V75 ────────
[🤖 AI Genesis] [✏️ Prompt Builder] [👁️ World Preview] [🌍 Generated Worlds]

Tab: AI Genesis
  → Textarea nhập prompt
  → Button "🚀 Tạo Thế Giới" → wgl75StartGenerate()
  → Stage log (mỗi bước hiện text)
  → Status bar (màu thay đổi: vàng → tím → xanh → đỏ)
  → 7 template buttons nhanh
  → Thống kê Claude API calls

Tab: Prompt Builder
  → Phân tích prompt hiện tại (genre/tone/complexity)
  → 7 template chi tiết với preview
  → Prompts đã lưu

Tab: World Preview
  → World summary card (name/desc/theme/civScore)
  → Danh sách Quốc Gia với stats
  → Danh sách Chủng Tộc với lore
  → Tôn Giáo / Sinh Vật / Anh Hùng
  → Full Lore (Origin Myth/First Age/Great War/Prophecy/Legend)
  → Sticky bottom bar: "✅ Áp Dụng" / "🔁 Tạo Lại" / "💾 Lưu Prompt"

Tab: Generated Worlds
  → Thế giới đã áp dụng (với genre/countries/races count)
  → Toàn bộ lịch sử tạo (status: preview/applied)
  → Button xem lại từng thế giới
```

### Hook Pattern
```javascript
const _orig = window.hubRenderPanel;
window.hubRenderPanel = function(panelId) {
  if (_orig) _orig(panelId);
  if (panelId === "creator-hub-v32") {
    setTimeout(() => wgl75RenderSection(), 60);
  }
};
```

---

## 9. 7 Built-in Templates

| Template | Tóm Tắt |
|---|---|
| ⚡ Thần Thoại Bắc Âu | Odin trị vì, Loki lập đế quốc bóng tối, Ragnarok chưa xảy ra |
| ⚗️ Tu Tiên Hắc Ám | Ma đạo thống trị, chính đạo sụp đổ, ma tôn nắm thiên đạo |
| 🚀 Khoa Học Viễn Tưởng | Năm 5000, AI giác ngộ, liên bang thiên hà |
| ☢️ Tận Thế Sinh Hóa | Hậu zombie 200 năm, loài người miễn dịch, thành bang độc lập |
| 🏛️ Hy Lạp Cổ Đại | Các thần vẫn can thiệp, Athena vs Ares cold war |
| 🤖 Cyberpunk Neo | Năm 2247, mega-corp kiểm soát chính phủ, hackers tự do |
| 🐉 Đông Phương Kỳ Bí | Rồng, phượng hoàng, nội công, thiên triều sụp đổ 1000 năm |

---

## 10. Save System — 4 Keys Mới

| Key | Engine | Nội Dung |
|---|---|---|
| `cgv6_ai_genesis_v75` | aiGenesisEngine.js | generationHistory (30 entries) · stats (calls/generated/failed) |
| `cgv6_prompt_world_v75` | promptToWorldEngine.js | savedPrompts (10) · currentPrompt |
| `cgv6_world_pipeline_v75` | worldGenerationPipeline.js | appliedWorlds (10) · stats |
| `cgv6_lore_gen_v75` | worldLoreGenerator.js | generatedLore (20) |

**Không trùng với 193+ keys cũ.**

---

## 11. Checklist Bảo Vệ

- ✅ KHÔNG xóa/ghi đè bất kỳ file cũ nào
- ✅ KHÔNG hook gameTick (pure interactive async layer)
- ✅ KHÔNG tạo sidebar tab mới (inject vào creator-hub-v32)
- ✅ Expand-only: hook `hubRenderPanel` bằng const _orig pattern
- ✅ Init staggered: 18400→18700ms (sau V74 kết thúc 18300ms)
- ✅ IIFE pattern cho cả 4 files
- ✅ 4 save keys mới — không trùng 193+ keys cũ
- ✅ KHÔNG trùng aiWorldGenerator.js (V1 dùng random, không AI), worldCreationWizard.js (manual UI)
- ✅ Tập trung: "Text → World · AI-Driven · 60 giây"

---

## 12. Không Trùng Với

| Engine Cũ | Khác Biệt |
|---|---|
| `aiWorldGenerator.js` | V1 dùng random seeded RNG — KHÔNG có Claude AI |
| `worldCreationWizard.js` | Manual 5-step wizard — người dùng tự điền từng bước |
| `originStoryEngine.js` | Lore templates tĩnh (5 genre banks) — KHÔNG AI-generated |
| `worldDNAEngine.js` | World DNA/Seed system — KHÔNG tạo nội dung |
| `worldEventEngineV25.js` | Event engine — KHÔNG tạo thế giới |

---

## 13. Đề Xuất V76

1. **AI Lore Expansion**: Gọi Claude để generate thêm sự kiện lịch sử, các anh hùng mới
2. **Multi-Round Genesis**: Chat với AI để tinh chỉnh thế giới sau khi tạo
3. **AI World Merge**: Kết hợp 2 world data từ lịch sử thành world hybrid mới
4. **Genesis Sharing**: Export prompt + world data thành share code trong Universe Hub
5. **AI NPC Dialogue**: Dùng Claude generate dialogue cho NPC trong Living NPC V65

---

*AI_GENESIS_REPORT.md — Generated 2026-06-14 sau V75 AI World Genesis Pass*
