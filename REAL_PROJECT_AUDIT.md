# REAL PROJECT AUDIT — Creator God V6
> Tạo bằng cách quét mã nguồn thực tế — KHÔNG dựa vào next-version.md
> Ngày audit: 2026-06-14 (cập nhật sau V81 — Personal Universe OS Pass)
> Phương pháp: Quét toàn bộ *.js, index.html, localStorage keys, gameTick hooks

---

## 💰 V84 — AI COST MANAGER (MỚI NHẤT)

### Vấn Đề Giải Quyết
- `divineOracleV77.js` dùng `claude-opus-4-5` cho 300 tokens → lãng phí 94.8%
- Không có cache — cùng prompt gọi AI lặp lại vô tận
- Không tracking chi phí, không budget limit
- System prompts dài 2000+ chars tốn input tokens

### 2 Files Mới

| File | Chức Năng | Save Key | Init |
|---|---|---|---|
| `aiCostManager.js` | Cache LRU 60 entries · Budget $0.50 · Tracking per-model/engine · `window.aiCall()` | `cgv6_ai_cost_manager_v84` | 22700ms |
| `modelRoutingEngine.js` | Task→Model routing · Engine override · Prompt summarizer · Force controls | `cgv6_model_router_v84` | 22800ms |

### Routing Mặc Định

| Engine / Task | Trước | Sau | Tiết Kiệm |
|---|---|---|---|
| divineOracleV77 (oracle) | Opus | 🟢 Haiku | **-94.8%** |
| worldLoreGenerator (lore) | Opus | 🟡 Sonnet | **-80%** |
| story / diplomacy / analysis | Sonnet | Sonnet | — (OK) |
| genesis / narrative / world_build | Opus | Opus | — (justified) |

### Public API
- `window.aiCall({ model, system, messages, taskType, engine })` — unified, cached, routed
- `window.aiSmartCall(engine, task, system, msg, tokens)` — all-in-one
- `window.aiSummarizePrompt(text, 800)` — compress prompts dài
- `window.aiForceHaiku()` · `window.aiForceSonnet()` · `window.aiForceAuto()`
- `window.aiEstimateCost(model, system, msg, outTokens)` — tính giá trước khi call
- `window.aiCostGetReport()` — full report với per-model/engine breakdown

### Next Version
- V85 init từ 22900ms+

---

## 🧵 V83 — WEB WORKER ENGINE

### Vấn Đề Giải Quyết
- Main thread bị block bởi NPC AI computation mỗi tick
- 328 gameTick hooks → UI jank khi world có 100+ NPC
- Relationship updates + economy math chạy synchronous trên main thread

### 4 Files Mới

| File | Vai Trò | Save Key | Init |
|---|---|---|---|
| `npcAIWorker.js` | Web Worker standalone — 4 task types | — (Worker context) | — |
| `webWorkerEngine.js` | Main thread coordinator · dispatch · apply results | `cgv6_web_worker_v83` | 22400ms |
| `workerPoolManager.js` | Priority task queue · pool management | — (ephemeral) | 22500ms |
| `webWorkerRegistryV83.js` | UI monitoring panel · status · stats | — | 22600ms |

### 4 Task Types (chạy trong Worker thread)
- `PROCESS_NPC_AI` — mood/happiness/health/wealth delta mỗi 10 ticks
- `PROCESS_ECONOMY` — growth/inflation per country mỗi 30 ticks
- `PROCESS_RELATIONSHIPS` — relationship score drift mỗi 45 ticks
- `PROCESS_HISTORY_SCORE` — civilisation score từ event log mỗi 60 ticks

### Public API
- `window.ww83DispatchNPCAI()` — gửi batch NPC AI ngay lập tức
- `window.ww83QueueTask({ type, data, priority })` — priority queue (1=high)
- `window.ww83GetStatus()` — worker status + stats
- `window.ww83RestartWorker()` — respawn worker
- `window.ww83ToggleEnabled()` — bật/tắt offloading
- `window.ww83GetPoolStatus()` — pool info + task history

### Hiệu Quả
- NPC AI computation: **main thread → background thread**
- Auto-respawn nếu worker crash
- Batch max 150 NPCs/dispatch
- Serialize/deserialize qua JSON.parse(JSON.stringify()) để tránh SharedArrayBuffer

### Next Version
- V84 init từ 22700ms+

---

## ⚡ V82 — PERFORMANCE OPTIMIZATION PASS

### Bottleneck Thực Tế (quét code)
- **328 gameTick hooks** — mỗi tick gọi chain 328 functions
- **713 innerHTML calls** — full re-render không cache
- **820 localStorage ops** — ghi phân tán, không batch
- **20+ NPC filter/tick** — mỗi engine tự filter window.npcs

### 2 Files Mới

| File | Save Key | Init |
|---|---|---|
| `performanceMonitor.js` | `cgv6_perf_monitor_v82` | 22200ms |
| `performanceProfiler.js` | `cgv6_perf_profiler_v82` | 22300ms |

### 4 Optimization Layers
- **NPC Cache**: `getNPCsAlive()` / `getNPCsHeroes()` / `getNPCsByJob()` — -95% filter ops
- **Render Cache**: `renderCache.get/set()` TTL 5s — -80% re-renders
- **Save Batcher**: `perfSave(key, data)` debounce 600ms — -80% localStorage I/O
- **Lazy Tick**: `perfTick.registerCritical/Normal/Lazy()` — phân tier tick execution

### Public API
- `window.getNPCsAlive()` · `window.getNPCsHeroes()` · `window.getNPCsByJob(job)`
- `window.renderCache.get/set/invalidate/invalidateAll()`
- `window.perfSave(key, data)` · `window.perfSaveFlush()`
- `window.perfTick.registerLazy/Normal/Critical(fn, id)`
- `window.perfIdleQueue.push(fn)` · `window.perfIsVisible()`
- `window.perfVirtualize(items, fn, pageSize, page)`
- `window.perfMon82GetReport()` · `window.uhmon81GetHealthScore()`

### Next Version
- V83 init từ 22400ms+

---

## 🪐 V81 — PERSONAL UNIVERSE OPERATING SYSTEM

### Tầm Nhìn
"Mỗi người dùng sở hữu một Vũ Trụ Cá Nhân" — PUOS là lớp hệ điều hành tổng hợp tất cả 40+ engines thành một hệ thống thống nhất có thể theo dõi, đo lường và quản lý toàn bộ vũ trụ.

### 6 Files Mới (không file nào ghi đè engine cũ)

| File | Chức Năng | Save Key | Init |
|---|---|---|---|
| `puosCore.js` | PUOS Core — Universe ID, scan 40 engines, boot log | `cgv6_puos_core_v81` | 21600ms |
| `universeKernel.js` | Universe Kernel — 9 layers, integration score | `cgv6_universe_kernel_v81` | 21700ms |
| `universeServiceManager.js` | 7 Services health check (World/Memory/NPC/Civ/Economy/XR/MV) | `cgv6_universe_services_v81` | 21800ms |
| `universeLifecycleManager.js` | 9 giai đoạn + 14 milestones tự động, gameTick hook | `cgv6_universe_lifecycle_v81` | 21900ms |
| `universeHealthMonitor.js` | 8 metrics real-time + Jarvis health report, gameTick hook | `cgv6_health_monitor_v81` | 22000ms |
| `puosRegistryV81.js` | UI 6 tabs inject creator-hub-v32 (không sidebar mới) | — | 22100ms |

### UI (6 tabs trong creator-hub-v32, section: puos81-section-wrapper)
```
🪐 Tổng Quan   — World name/year/stage · Population · Countries · Religions · Health/Kernel/XR/MV gauges · DNA
🔮 Kernel      — 9 layers grid · Integration score · Each layer status + metrics
⚙️ Services    — 7 services running status · Metrics per service
💚 Sức Khỏe   — Health score 0–100 · 8 metric bars · World Size/NPC/AI Load/Memory/Evolution/Civ/XR/MV
🌟 Vòng Đời   — 9 lifecycle stages · 14 milestones · Progress bar
🤖 Jarvis OS   — Health analysis · 3 stats cards · Predictions · Boot log
```

### gameTick Hooks (2 hooks mới)
- `universeLifecycleManager.js` — Kiểm tra milestones mỗi 50 ticks
- `universeHealthMonitor.js` — Đo health metrics mỗi 100 ticks

### Save Keys V81 (5 keys)
`cgv6_puos_core_v81` · `cgv6_universe_kernel_v81` · `cgv6_universe_services_v81` · `cgv6_universe_lifecycle_v81` · `cgv6_health_monitor_v81`

### Tích Hợp
- Đọc từ: 40 global objects (window.world → window.multiverseEvoV80Data)
- KHÔNG ghi đè bất kỳ engine cũ nào
- Ghi vào: `window.htAddEvent()` khi milestone mới đạt
- Tương thích ngược: 100%

### Next Version
- V82 init từ 22200ms+

---

## 📊 TỔNG QUAN SỐ LIỆU

| Chỉ Số | V78 | V79 | V80 (Mới Nhất) |
|---|---|---|---|
| **Tổng file .js trên disk** | ~322 | ~329 | **~334** |
| **Tổng file được load trong index.html** | ~314 | ~321 | **~326** |
| **File dormant** | 1 | 1 | **1 (serve.js)** |
| **Tổng panel divs trong HTML** | 241 | 241 | **241** (V79/V80 inject vào hub — không thêm panel mới) |
| **Tổng nav buttons (data-panel)** | 68 | 68 | **68** (không tạo sidebar mới từ V38+) |
| **Tổng localStorage save keys (unique)** | 211+ | 217+ | **222+** |
| **Engine hook vào gameTick** | 134 | 140 | **144** (V80 thêm 4 hooks) |
| **Phiên bản hiện tại** | V78 | V79 | **V80 — Multiverse Evolution Pass** |

---

## ✅ HỆ THỐNG ĐÃ TRIỂN KHAI ĐẦY ĐỦ

### 🌌 Multiverse Evolution Pass V80 ← NEWEST (5 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `multiverseEvolutionEngine.js` | 8 loại thế giới · 6 giai đoạn tiến hóa · World connections · Dominant tracking · gameTick | `cgv6_multiverse_evo_v80` | 21100ms |
| `crossWorldInfluenceEngine.js` | 6 loại ảnh hưởng · 5 cấp độ · Network dominance · Auto-propagate 100 năm · gameTick | `cgv6_cross_world_v80` | 21200ms |
| `universeClusterEngine.js` | 6 loại cụm · Auto-form 300 năm · Power tracking · gameTick | `cgv6_universe_cluster_v80` | 21300ms |
| `multiverseHistoryEngine.js` | 7 kỷ nguyên · 8 sự kiện · Đế quốc liên thế giới · Anh hùng xuyên chiều · gameTick | `cgv6_multiverse_history_v80` | 21400ms |
| `multiverseTimelineSystem.js` | UI 5 tabs · XR Portal · Migration · Patch uhubV73Render+hubRenderPanel | `cgv6_multiverse_timeline_v80` | 21500ms |

**Global Objects:** `window.multiverseEvoV80Data` · `window.crossWorldV80Data` · `window.universeClusterV80Data` · `window.multiverseHistoryV80Data` · `window.mvTimelineV80Data`
**Constants:** `window.MEVO80_TYPES/STAGES` · `window.CWI80_TYPES/STRENGTHS` · `window.UCLU80_TYPES` · `window.MHIST80_ERAS/EVENTS`
**API:** `mevo80RegisterWorld/Evolve/ConnectWorlds()` · `cwi80SendInfluence/GetInfluenceNetwork/GetDominantInfluencer()` · `uclu80CreateCluster/AddMember/GetWorldCluster()` · `mhist80TransitionEra/FormCrossWorldEmpire/RecordLegend()` · `mvt80EnterPortal/ExitPortal/RecordMigration()`
**UI:** 5 tabs inject vào Universe Hub V73 + fallback Creator Hub (Đa VT/Timeline/Cụm/Ảnh Hưởng/Di Cư) · XR Portal system
**gameTick hooks:** +4 hooks (mevo80/cwi80/uclu80/mhist80) — tổng ~144 hooks
**Cross-module:** `mevo80GetAlive()` làm nguồn dữ liệu chung cho cả cwi80/uclu80/mhist80

---

### 🏛️ Sentient Civilization Pass V79 (7 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `civilizationConsciousnessEngine.js` | 5 mục tiêu · 8 căn tính · 10 giá trị · Cohesion · Ideological Tension · Jarvis · gameTick | `cgv6_civ_consciousness_v79` | 20400ms |
| `culturalEvolutionEngine.js` | 10 traits · 5 hybrid cultures · 5 kênh lan truyền · Extinct/Revive · gameTick | `cgv6_cultural_evo_v79` | 20500ms |
| `collectiveMemoryEngine.js` | 10 loại ký ức · Auto-scan wars/disasters/plagues/golden ages · gameTick | `cgv6_collective_memory_v79` | 20600ms |
| `academyEngine.js` | 8 loại học viện · 12 tên học giả · Khám phá · Auto-spawn 200 năm · gameTick | `cgv6_academy_v79` | 20700ms |
| `cultureEngine.js` | 10 phong cách nghệ thuật · 8 công trình · Tác phẩm tự sinh · gameTick | `cgv6_culture_art_v79` | 20800ms |
| `philosophyEngine.js` | 10 trường phái triết · 5 cải cách tôn giáo · Xung đột tư tưởng · gameTick | `cgv6_philosophy_v79` | 20900ms |
| `sentientCivRegistryV79.js` | UI 5 tabs creator-hub-v32 · Patch hubRenderPanel | — | 21000ms |

**Global Objects:** `window.civConsciousnessV79Data` · `window.culturalEvoV79Data` · `window.collectiveMemoryV79Data` · `window.academyV79Data` · `window.cultureArtV79Data` · `window.philosophyV79Data`
**Constants:** `window.CCE79_GOALS/ARCHETYPES` · `window.CEVO79_TRAITS/CHANNELS` · `window.CMEM79_CATEGORIES` · `window.ACAD79_TYPES` · `window.CULT79_STYLES/LANDMARKS` · `window.PHIL79_SCHOOLS/REFORMS`
**API:** `cce79GetOrCreate/GetProfile/UpdateCohesion/AddIdeologicalTension/GetJarvisAnalysis()` · `cevo79Hybridize/Propagate/Extinct/Revive()` · `cmem79Record/GetMemories/GetNarrativeSummary()` · `acad79FoundAcademy/SpawnScholar/RecordDiscovery()` · `cult79GenerateWork/BuildLandmark()` · `phil79AssignSchool/SpawnDebate/TriggerReligiousReform()`
**UI:** 5 tabs inject vào creator-hub-v32 (Căn Tính/Văn Hóa/Triết Học/Học Viện/Ký Ức) · KHÔNG tạo sidebar tab mới
**gameTick hooks:** +6 hooks (cce79/cevo79/cmem79/acad79/cult79/phil79) — tổng ~140 hooks
**Cross-module:** Đọc `warsActive` · `disasterData` · `plagueData` · `window.countries` · V79 inter-module calls
**Ghi vào:** `window.htAddEvent()` (học viện/khám phá/công trình/triết học/tôn giáo)

---

### 🧬 Digital Life Pass V78 (6 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `digitalLifeEngine.js` | Core Digital Lifeform — 8 triết học · 8 mục tiêu · 15 giá trị · Influence score · gameTick | `cgv6_digital_life_v78` | 19800ms |
| `personalityEvolutionEngine.js` | Tiến Hóa Tính Cách — 10 triggers · 8 chiều · Auto-scan wars/disasters · gameTick | `cgv6_personality_evo_v78` | 19900ms |
| `selfReflectionEngine.js` | Tự Phản Chiếu — 8 loại suy ngẫm · Thought-change system · Auto-reflect · gameTick | `cgv6_self_reflection_v78` | 20000ms |
| `ideologyEngine.js` | Hệ Tư Tưởng — 10 ideologies · 12 tên học phái · 4 loại phong trào · Auto-spawn · gameTick | `cgv6_ideology_v78` | 20100ms |
| `consciousnessLayer.js` | Lớp Ý Thức — 7 inner states · 6 reasoning patterns · 10 motivations · Auto-consciousness · gameTick | `cgv6_consciousness_v78` | 20200ms |
| `digitalLifeRegistryV78.js` | UI Registry — 5 tabs creator-hub-v32 · Patch hubRenderPanel | — | 20300ms |

**Global Objects:** `window.digitalLifeV78Data` · `window.personalityEvoV78Data` · `window.selfReflectionV78Data` · `window.ideologyV78Data` · `window.consciousnessV78Data`
**API:** `dl78GetOrCreate/GetProfile/AddExperience/GetTopInfluencers/GetAll/GetStats()` · `pe78ApplyTrigger/GetDimensions/GetHistory/GetDominant/GetTopEvolved()` · `sr78Reflect/ChangeThought/GetReflections/GetThoughtChanges/GetAllReflections()` · `ideo78AssignToNPC/SpawnSchool/SpawnMovement/GetNPCIdeology/GetSchools/GetMovements()` · `cs78GetOrCreate/AddThought/SetInnerState/LogAction/GenerateInnerVoice/GetAll/GetState()`
**UI:** 5 tabs inject vào creator-hub-v32 (Digital Life/Tính Cách/Tư Tưởng/Ý Thức/Cuộc Đời) · KHÔNG tạo sidebar tab mới
**gameTick hooks:** +5 hooks (dl78/pe78/sr78/ideo78/cs78) — tổng 134 hooks
**Không trùng:** npcLifeEngineV65.js (career/dream/fear) · npcRelationshipSystemV65.js (9 relationship types) · npcMemorySystemV64.js (memory archive) · livingCivilizationAI.js
**Đọc từ:** `window.npcs` · `window.warsActive` · `window.disasterData` · V78 cross-module reads
**Ghi vào:** `window.htAddEvent()` · `window.wmeAddMemory()` (qua chính các module V78)

---

### 📜 Ancient Prophecy & Fate Web V77 (5 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `ancientProphecyEngineV77.js` | 8 loại tiên tri · Auto-generate · Auto-fulfill · gameTick | `cgv6_ancient_prophecy_v77` | 19300ms |
| `fateThreadSystemV77.js` | 6 loại sợi duyên · Entity fate web · Auto-scan · gameTick | `cgv6_fate_threads_v77` | 19400ms |
| `destinyScoreV77.js` | 6 chiều điểm định mệnh · Player/Country/NPC scores · gameTick every 30 | `cgv6_destiny_score_v77` | 19500ms |
| `divineOracleV77.js` | 5 loại oracle · Claude claude-opus-4-5 · History 15 entries | `cgv6_divine_oracle_v77` | 19600ms |
| `prophecyRegistryV77.js` | UI 4 tabs creator-hub-v32 · Canvas fate web · Patch hubRenderPanel | — | 19700ms |

**UI:** 4 tabs creator-hub-v32 (Tiên Tri/Vận Mệnh/Định Mệnh/Thần Sấm)
**gameTick hooks:** +3 hooks (ap77/ft77/ds77)

---

### 🌱 AI Universe Evolution Pass V76 ← (5 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `universeEvolutionEngine.js` | Core evolution — 7 loại tự sinh (Country/Race/Religion/Tech/Culture/Hero/Surprise) · gameTick · Speed 0.5-5x | `cgv6_universe_evolution_v76` | 18800ms |
| `adaptiveHistoryEngine.js` | Lịch sử thích nghi — 8 chronicle templates · Emergent characters (4 roles) · World forecast 8 tiên tri · gameTick | `cgv6_adaptive_history_v76` | 18900ms |
| `emergentCivilizationEngine.js` | Văn minh tự sinh — Phát minh/Luật pháp/Triết học/Kiến trúc · Sụp đổ · Sáp nhập · gameTick | `cgv6_emergent_civ_v76` | 19000ms |
| `languageEvolutionSystem.js` | Ngôn ngữ tiến hóa — 5 ngôn ngữ gốc · Phân nhánh/Tiến hóa/Biến mất · Influence map · gameTick | `cgv6_language_evo_v76` | 19100ms |
| `timelineBranchEngineV76.js` | Timeline nhánh V76 + UI Registry — 4 tabs creator-hub-v32 · Jarvis Evolution Mode · Save/Branch/Compare · RIÊNG BIỆT với V36 | `cgv6_timeline_branch_v76` | 19200ms |

**Global Objects:** `window.universeEvoV76Data` · `window.adaptiveHistoryV76Data` · `window.emergentCivV76Data` · `window.languageEvoV76Data` · `window.timelineBranchV76Data`
**API:** `uevo76GenerateCountry/Race/Religion/Tech/Hero/Surprise()` · `ah76GenerateChronicle/Character/Forecast()` · `eciv76Invent/CreateLaw/SpawnPhilosophy/CollapseCountry/MergeCivs()` · `lang76Branch/Kill/Evolve()` · `tb76SaveMainTimeline/CreateBranch/CompareBranches/JarvisAnalyze()`
**UI:** 4 tabs inject vào creator-hub-v32 (Evolution/Timeline Branches/World Forecast/Emerging Civilizations) · height 320px · KHÔNG tạo sidebar tab mới
**gameTick hooks:** +4 hooks (uevo76Tick/ah76Tick/eciv76Tick/lang76Tick) — tổng 126 hooks
**Không trùng:** civEvolutionEngineV38 (UI-driven) · timelineBranchEngine.js V36 (auto-branch collapse) · livingCivilizationAI V58
**Lưu ý file:** `timelineBranchEngine.js` đã là V36 → tạo `timelineBranchEngineV76.js` (save key khác: v76)

---

### 🤖 AI World Genesis Pass V75 (4 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `aiGenesisEngine.js` | Claude claude-opus-4-5 caller · 7 genre detector · JSON parser · History 30 entries | `cgv6_ai_genesis_v75` | 18400ms |
| `promptToWorldEngine.js` | Prompt analyzer · Keyword hints · 7 templates · System prompt builder | `cgv6_prompt_world_v75` | 18500ms |
| `worldGenerationPipeline.js` | Pipeline orchestrator · Apply world.countries.npcs.lore · stageLog | `cgv6_world_pipeline_v75` | 18600ms |
| `worldLoreGenerator.js` | UI Registry · 4 tabs creator-hub-v32 (AI Genesis/Prompt Builder/World Preview/Generated Worlds) · hook hubRenderPanel | `cgv6_lore_gen_v75` | 18700ms |

**Global Objects:** `window.aiGenesisV75Data` · `window.promptToWorldV75Data` · `window.worldPipelineV75Data` · `window.worldLoreGenV75Data` · `window.GENESIS75_GENRES` · `window.PROMPT75_TEMPLATES`
**API:** `ag75DetectGenre/BuildSystemPrompt/CallClaude/ParseWorldJSON/SaveGeneration/GetHistory/GetStats()` · `ptw75AnalyzePrompt/BuildFullPrompt/SavePrompt/GetTemplates/GetSaved()` · `wgp75Generate/ApplyWorld/GetPending/GetApplied/GetStats()` · `wgl75SwitchTab/StartGenerate/UseTemplate/ApplyWorld/RenderSection()`
**UI:** 4 tabs inject vào creator-hub-v32 (phần dưới, height 310px) · KHÔNG tạo sidebar tab mới · Hook hubRenderPanel const _orig pattern
**Claude Flow:** `ptw75BuildFullPrompt()` → `ag75CallClaude()` → `ag75ParseWorldJSON()` → `wgp75ApplyWorld()` → inject window.world/countries/npcs/htAddEvent/wmeAddMemory
**7 Templates:** Thần Thoại Bắc Âu · Tu Tiên Hắc Ám · Khoa Học Viễn Tưởng · Tận Thế Sinh Hóa · Hy Lạp Cổ Đại · Cyberpunk Neo · Đông Phương Kỳ Bí
**Không trùng với:** aiWorldGenerator.js (random RNG V1) · worldCreationWizard.js (manual 5-step) · originStoryEngine.js (static lore banks)
**GameTick hooks:** KHÔNG CÓ (pure async interactive layer)

---

### 🏪 Creator Economy Pass V74 (3 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `creatorAssetEngine.js` | Asset engine — 6 loại (Race/Creature/Religion/Technology/Civilization/Lore) · 8 demo assets · 6 bậc rarity · CRUD + Rating + Import | `cgv6_creator_assets_v74` | 18100ms |
| `worldBlueprintEngine.js` | Blueprint engine — 3 loại BP (World/Country/Race) · Export World/Country · Share Codes CGV6-BP-* · 4 demo blueprints | `cgv6_world_blueprints_v74` | 18200ms |
| `creatorAssetRegistry.js` | UI registry — 6 tabs inject vào Universe Hub (Assets/Blueprints/Races/Creatures/Lore/Imports) · Hook uhubV73Render const _orig pattern | `cgv6_asset_registry_v74` | 18300ms |

**Global Objects:** `window.creatorAssetV74Data` · `window.worldBlueprintV74Data` · `window.ASSET74_TYPES` · `window.ASSET74_RARITY` · `window.ASSET74_DEMOS` · `window.BLUEPRINT74_DEMOS`
**API:** `ca74CreateAsset/PublishAsset/ImportAsset/RateAsset/GetAllPublic/GetMyAssets/GetImported/GetByType/GetStats()` · `wbp74ExportWorld/ExportCountry/ImportBlueprint/ShareBlueprint/GetAll/GetMine/GetImported/GetStats()`
**UI:** 6 tabs inject vào panel-universe-hub-v73 (phần dưới) — KHÔNG tạo sidebar tab mới · Asset Economy section height 260px
**GameTick hooks:** KHÔNG CÓ (pure interactive creator economy layer)
**Demo Assets:** 8 assets từ 8 Demo Worlds · CivScore-linked rarity · Import/Rate system
**Demo Blueprints:** 4 blueprints (2 World/1 Country/1 Race) · Share codes CGV6-BP-*
**Không trùng với:** creatorEconomyEngine.js V57 (CP system) · universeTemplateSystemV57.js (world templates) · creatorProfileSystem.js (profile) · contentRegistryV57.js (content versioning)
**Tính năng nổi bật:** Asset Market · Blueprint Export/Import · World Clone · Race Creator · Creature Creator · Lore Creator · Share Code system

---

### 🌌 Universe Hub Pass V73 (3 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `universeHubCore.js` | Data engine — 8 Demo Worlds · 8 Creators · 4 Events · Portal System · Rankings · Follow System · Stats | `cgv6_universe_hub_v73` | 17800ms |
| `universeHubMap.js` | Canvas 2D Universe Map — starfield · animated connections · 3 clusters · click-to-info · node glow | — | 17900ms |
| `universeHubRegistry.js` | Full UI 6 tabs (Worlds/Creators/Map/Portals/Events/Rankings) · Dynamic sidebar button inject · Dynamic panel inject | `cgv6_universe_hub_registry_v73` | 18000ms |

**Global Objects:** `window.universeHubV73Data` · `window.UHUB73_DEMO_WORLDS` · `window.UHUB73_DEMO_CREATORS` · `window.UHUB73_DEMO_EVENTS` · `window.universeMapV73`  
**API:** `uhub73GetWorlds/GetCreators/GetEvents/GetRankings/GetProfile/GetData/GetStats()` · `uhub73OpenPortal/VisitWorld/FollowWorld/UnfollowWorld/JoinEvent/BuildUniverseMap()` · `umap73Init/Stop/Refresh()`  
**UI:** 🌌 Universe Hub — tab sidebar MỚI (đầu tiên kể từ V38) · Inject dynamically · 6 tabs nội bộ  
**GameTick hooks:** KHÔNG CÓ (pure interactive meta-platform layer)  
**XR Readiness:** 84% — Portal traversal · Universe Map hologram · World Visit overlay · Controller-compatible buttons  
**Demo Worlds:** 8 thế giới · CivScore range 5,100 → 15,600 · Mythic→Active tiers  
**Demo Creators:** 8 creators · Online/Offline status · Reputation tiers: Mythic/Legendary/Master/Elite  
**Events:** 4 sự kiện · Types: cross_world/platform/community  
**Rankings:** Sort by CivScore/Worlds/Population · Player profile auto-included  

---

### 🥽 XR World Pass V72 (4 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `xrWorldEngine.js` | 8 view levels · World Table controls (scale/rotate/zoom) · 5 device profiles · xrw72ActivateWorldTable/SetView/SetScale/Rotate/SetGodScale/FocusEntity/GetData() | `cgv6_xr_world_v72` | 17400ms |
| `xrPresenceSystem.js` | Enter World Mode · God Scale Shift (god/human) · 6 NPC reaction types · Conversation System · xrp72EnterWorld/ExitWorld/SetGodScale/TriggerNpcReaction/StartConversation() | `cgv6_xr_presence_v72` | 17500ms |
| `xrGodInteraction.js` | 8 Divine Commands · 5 History Replay types · Jarvis XR 3 modes · xrg72ExecuteCommand/LoadReplay/StepReplay/JarvisActivate/JarvisSpeak/JarvisContextComment() | `cgv6_xr_god_v72` | 17600ms |
| `xrWorldRegistry.js` | UI 5 tabs creator-hub-v32 (XR World/Enter World/God Scale/XR Replay/XR Companion) · Patch hubRenderPanel | — | 17700ms |

**Global Objects:** `window.xrWorldV72Data` · `window.xrPresenceV72Data` · `window.xrGodV72Data` · `window.XRW72_VIEW_LEVELS` · `window.XRW72_DEVICE_PROFILES`  
**Đọc từ:** V69 xrEngine · V70 imm70ZoomTo · V71 avg71SpendEnergy/avg71GetJarvisComment/mfst71GetLog/das71GetAppearanceLog/dps71EnterPresence · `window.countries` · `window.npcs` · `window.warsActive` · `window.htAddEvent()`  
**Ghi vào:** `window.htAddEvent()` · `window.wmeAddMemory()` · proph66Create (nếu có) · divVoice66Send (nếu có) · countries[x].stability · plagueData.activePlagues  
**UI:** 5 tabs nội bộ creator-hub-v32 — KHÔNG tạo sidebar tab mới  
**GameTick hooks:** KHÔNG CÓ (pure interactive layer)  
**XR Devices:** Meta Quest (92/100) · Apple Vision Pro (95/100) · AR Glasses (70/100) · Desktop (40/100) · Mobile (55/100)

---

### 👁️ Avatar of God Pass V71 (5 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `avatarOfGodEngine.js` | 6 hình thức avatar · Thần Năng 1000max · God name/title · Regen energy · Jarvis comment · avg71SelectForm/SpendEnergy/LogAppearance/GetJarvisComment() | `cgv6_avatar_god_v71` | 16900ms |
| `divinePresenceSystem.js` | 5 phản ứng NPC (venerate/fear/skeptic/worship/rebel) · 5 tiến hóa tôn giáo · Cult generation · Religion doctrine · dps71EnterPresence/TriggerReligionEvolution/ExitPresence() | `cgv6_divine_presence_v71` | 17000ms |
| `creatorManifestationSystem.js` | 8 loại hiện thân · Ghi sử sách · Tiêu hao Thần Năng · Tích hợp V66 prophecy · mfst71Perform/GetTypes/GetLog() | `cgv6_manifestation_v71` | 17100ms |
| `divineAppearanceSystem.js` | 8 loại xuất hiện · 5 vai trò môn đồ · Cult formation · Legend creation · das71TriggerAppearance/AddFollower/AssignRole/GetLegendLog() | `cgv6_divine_appearance_v71` | 17200ms |
| `avatarOfGodRegistry.js` | UI 5 tabs creator-hub-v32 · Patch hubRenderPanel · Toast notifications | — | 17300ms |

**Global Objects:** `window.avatarGodV71Data` · `window.divinePresenceV71Data` · `window.manifestationV71Data` · `window.divineAppearanceV71Data`  
**Đọc từ:** V64 mem64Record() · V65 window.npcs NPC profiles · V66 divineInterventionV66Data energy · `window.htAddEvent()` · `window.countries` · `window.warsActive`  
**UI:** 5 tabs nội bộ creator-hub-v32 — KHÔNG tạo sidebar tab mới  
**GameTick hooks:** KHÔNG CÓ (pure interactive layer)  
**XR Compatible:** Thiết kế tương thích Meta Quest · Apple Vision Pro · AR Glasses  

---

### 🌌 World Immersion Pass V70 (8 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `immersionEngine.js` | 9 scale levels · zoom pipeline · Jarvis narration · imm70ZoomTo/In/Out/Back/GetContextData/GetJarvisNarration() | `cgv6_immersion_engine_v70` | 16100ms |
| `worldScaleEngine.js` | Canvas 2D render theo 9 scale · animated nodes · wse70SetupCanvas/Render/StartLoop() | `cgv6_world_scale_v70` | 16200ms |
| `dynamicZoomSystem.js` | Smooth zoom · scroll/pinch · transition overlay · dzm70SetupWheelZoom/SetupPinchZoom/JumpToLevel/GetZoom() | `cgv6_dynamic_zoom_v70` | 16300ms |
| `cityImmersionSystem.js` | Living city: buildings · districts · social groups · cis70VisitCity/GetBuildings/RenderCity() | `cgv6_city_immersion_v70` | 16400ms |
| `npcObservationSystem.js` | NPC tracker: lifeline · family · descendants · nos70ObserveNpc/GetLifeline/GetProfile/GetDescendants() | `cgv6_npc_observation_v70` | 16500ms |
| `dynastyVisualizationSystem.js` | Dynasty tree canvas · history timeline · dv70VisitDynasty/RenderTree/GetStats/GetTimeline() | `cgv6_dynasty_viz_v70` | 16600ms |
| `worldWalkthroughSystem.js` | Walk: 8 scene types · Replay: events theo year range · wwt70Enter/Move/StartReplay/StepReplay() | `cgv6_walkthrough_v70` | 16700ms |
| `immersionRegistry.js` | UI: 5 tabs creator-hub-v32 · patches hubRenderPanel · imm70ShowTab/RefreshUI/ToggleAutoReplay() | — | 16800ms |

**Global Objects:** `window.immersionEngineV70Data` · `window.worldScaleV70Data` · `window.dynamicZoomV70Data` · `window.cityImmersionV70Data` · `window.npcObservationV70Data` · `window.dynastyVizV70Data` · `window.worldWalkthroughV70Data`  
**Đọc từ:** V64 Memory · V65 NPC Life/Family/Relationship · V55 histReplayData · V67 Spatial · V69 XR  
**UI:** 5 tabs nội bộ creator-hub-v32 — KHÔNG tạo sidebar tab mới  
**GameTick hooks:** KHÔNG CÓ (pure visual/immersion layer)  
**XR Compatible:** dzm70SetupPinchZoom · dzm70RenderOverlay · wse70SetupCanvas

---

### 🌍 Living Universe V60 (6 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `livingUniverseOrchestrator.js` | 12 domain · 16 links · Integration score · Alert system · luo60GetState/DomainScore/IntegrationScore/Stats() | `cgv6_universe_orchestrator_v60` | 11500ms |
| `causeEffectEngine.js` | 6 chains · Auto-trigger · Real effects · cee60GetActiveChains/History/TriggerChain/GetStats() | `cgv6_cause_effect_v60` | 11600ms |
| `worldNarrativeEngine.js` | Chronicle/Legend/TurningPoint/EpochSummary · Auto · wne60GenerateChronicle/Legend/GetAll/JarvisStory() | `cgv6_world_narrative_v60` | 11700ms |
| `universeMaturitySystem.js` | 8 chiều · 6 tier (Phôi Thai→Thần Thánh) · ums60GetScore/Dimensions/Tier/JarvisReport() | `cgv6_universe_maturity_v60` | 11800ms |
| `universeAnalyticsEngine.js` | 6 metrics · Trends · 20-point history · uae60GetAnalytics/Trends/Dashboard/Insights() | `cgv6_universe_analytics_v60` | 11900ms |
| `livingUniverseRegistryV60.js` | Patches creator-hub-v32 · 6 tabs · Omega Jarvis · lur60ShowTab() | — | 12000ms |

**Global Objects:** `window.luOrchestratorV60Data` · `window.causeEffectV60Data` · `window.worldNarrativeV60Data` · `window.universeMaturityV60Data` · `window.universeAnalyticsV60Data`
**Không thêm hệ thống mới** — Reads từ V59/V58/V57/V56/V55/V54/V53/V52/V51/V50/V49/V48/V25
**UI:** 6 tabs trong creator-hub-v32 (👁 Creator God V32) — KHÔNG tạo sidebar tab mới
**GameTick hooks:** luo60Tick · cee60Tick · wne60Tick · ums60Tick · uae60Tick (5 hooks mới)

---

### 🌍 Global Events Online V59 (8 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `globalEventSchedulerV59.js` | 10 loại sự kiện · Auto-trigger · Cooldowns · Priority · ges59ManualFire/GetActive/GetStats() | `cgv6_event_scheduler_v59` | 10700ms |
| `eventImpactSystemV59.js` | 8 tác động thực · countries/plagueData/V48/V49 · eis59GetLog/Stats/Map() | `cgv6_event_impact_v59` | 10800ms |
| `multiverseEventSystemV59.js` | 7 sự kiện ĐVT · Rarity tiers · mves59GetActive/ManualFire() | `cgv6_mv_event_v59` | 10900ms |
| `communityEventSystemV59.js` | 4 mùa · 5 AI · 5 Creator events · cev59TriggerCreatorEvent() | `cgv6_community_event_v59` | 11000ms |
| `worldBossSystemV59.js` | 5 mega-boss · AI Alliance · wb59SpawnBoss/AttackBoss/GetActive() | `cgv6_world_boss_v59` | 11100ms |
| `eventRewardEngineV59.js` | 10 danh hiệu · CP/Fame · Rankings · ere59GrantReward/GetTitles/GetRankings() | `cgv6_event_rewards_v59` | 11200ms |
| `eventArchiveSystemV59.js` | Archive events + boss kills · Jarvis · eas59GetArchive/BossKills/JarvisReport() | `cgv6_event_archive_v59` | 11300ms |
| `eventRegistryV59.js` | Patches mvHub+playerHub+creatorHub · 7 tabs · evReg59ShowTab() | — | 11400ms |

**Global Objects:** `window.eventSchedulerV59Data` · `window.eventImpactV59Data` · `window.mvEventV59Data` · `window.communityEventV59Data` · `window.worldBossV59Data` · `window.eventRewardV59Data` · `window.eventArchiveV59Data`
**Không trùng với:** `globalEventControlV51.js` (Creator manual) · `worldBossEngineV31.js` (V31 single) · `eventGenerator.js` (text-only) · `multiverseWarSystemV39.js` (NPC wars)
**UI:** 7 tabs nội bộ trong multiverse-hub-v35 + widget player-hub-v28 + Jarvis creator-hub-v32
**GameTick hooks:** globalEventSchedulerV59Tick · multiverseEventSystemV59Tick · communityEventSystemV59Tick · worldBossSystemV59Tick (4 hooks mới)

---

### 💰 Creator Economy V57 (7 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `creatorEconomyEngine.js` | 12 loại nội dung · CP system · Passive income · Auto-detect V40 creations · ce57RecordCreation/SpendCP/GetStats() | `cgv6_creator_economy_v57` | 9500ms |
| `creatorProfileSystem.js` | 6 cấp bậc (Người Tập Sự→Hóa Thân Tạo Hóa) · Titles · Showcase · Specialization · cps57SetName/Bio/GetRankProgress() | `cgv6_creator_profile_v57` | 9600ms |
| `contentRegistryV57.js` | Track nội dung · Versioning · Rating · Export/Import JSON · Mark Public · creg57Register/Search/Rate/Export/Import() | `cgv6_content_registry_v57` | 9700ms |
| `universeTemplateSystemV57.js` | 5 presets + player saves · World snapshot · Share codes (CGV6-XXXXXXXX) · Clone · uts57SaveTemplate/GenerateShareCode/CloneTemplate() | `cgv6_universe_template_v57` | 9800ms |
| `creatorReputationSystemV57.js` | 7 cấp (Vô Danh→Không Tử Tạo Hóa) · Content ratings · Monthly rep · crs57AddReputation/RateContent/GetStats() · Khác V28 playerRep | `cgv6_creator_reputation_v57` | 9900ms |
| `creatorRewardEngineV57.js` | 12 milestones · Jarvis Creator Mode (7 loại gợi ý AI) · cre57CheckMilestones/GetJarvisSuggestion() · gameTick every 200 | `cgv6_creator_reward_v57` | 10000ms |
| `creatorEconomyRegistryV57.js` | Patches hubRenderPanel('creator-hub-v32') · 6 tabs (Hub/Nội Dung/Template/Chia Sẻ/Phần Thưởng/Thống Kê) · Passive | — | 10100ms |

**Global Objects:** `window.creatorEconData` · `window.creatorProfileData` · `window.contentRegV57Data` · `window.universeTemplateData` · `window.creatorRepData` · `window.creatorRewardData`
**Không trùng với:** `worldTemplates.js` (constants only) · `playerReputationEngine.js` V28 (war/trade rep) · `creatorDashboardV51.js` (authority/miracle) · `creatorLibrary.js` + factories (game entity creation) · `playerAchievementV50.js` (player achievements)
**UI:** 6 tabs bên trong creator-hub-v32 (panel-creator-hub-v32) — KHÔNG tạo sidebar tab mới
**GameTick hooks:** creatorEconomyV57Tick (mỗi tick) · creatorRewardV57Tick (mỗi 200 tick)
**Tính năng nổi bật:** Creator Points economy · Content versioning · Universe template with 5 presets · Share codes · Jarvis Creator Mode với 7 loại gợi ý thông minh

---

### 🚀 Cross-Universe Travel V56 (6 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `universeGateSystemV56.js` | Player-operated gates · 5 cấp (Sơ Khai/Bạc/Vàng/Thần/Tạo Hóa) · Toll system · 5 sự kiện · g56BuildGate/UpgradeGate/CloseGate() | `cgv6_cx_gate_v56` | 8900ms |
| `universeExplorationV56.js` | 4 nhiệm vụ (scout/survey/deep/void) · 8 loại phát hiện · Rarity system · exp56StartMission/GetDiscoveries/GetJarvisReport() | `cgv6_cx_exploration_v56` | 9000ms |
| `crossUniverseColonyV56.js` | 5 loại thuộc địa · 5 sự kiện · AI colonization 6 phe · col56FoundColony/UpgradeColony/GetStats() · Khác V27 local colonies | `cgv6_cx_colony_v56` | 9100ms |
| `multiverseDiplomacyV56.js` | 6 thế lực · 5 hiệp ước · dip56ProposeTreaty/ImproveRelation/DeclareHostility() · Player-facing · Khác V39 NPC alliances | `cgv6_cx_diplomacy_v56` | 9200ms |
| `universePassportV56.js` | 5 cấp (Vô Danh→Sứ Thần Tạo Hóa) · 5 visa · pass56GetVisa/Travel/GetProfile() · window.g56PassportData | `cgv6_cx_passport_v56` | 9300ms |
| `crossUniverseRegistryV56.js` | Patches mvHubRenderPanel() · 6 tabs (Cổng/Khám Phá/Thuộc Địa/Ngoại Giao/Hộ Chiếu/Bản Đồ) · SVG map · Passive | — | 9400ms |

**Global Objects:** `window.gateV56Data` · `window.explorationV56Data` · `window.colonyV56Data` · `window.diplomacyV56Data` · `window.passportV56Data`
**Không trùng với:** `portalNetwork.js` V35 (system portals) · `universeTravelEngine.js` V35 (journey engine) · `multiverseWarSystemV39.js` V39 (NPC war) · `multiverseAllianceSystemV39.js` V39 (NPC alliances) · `colonyEngineV27.js` V27 (local colonies) · `multiverseMapEngine.js` V35 (map display)
**UI:** 6 tabs trong multiverse-hub-v35 · 6 panel divs (panel-cx-gates/explore/colonies/diplomacy/passport/map-v56)
**GameTick hooks:** gateSystemV56Tick · universeExplorationV56Tick · crossUniverseColonyV56Tick · multiverseDiplomacyV56Tick (mỗi 40 tick)
**Tính năng nổi bật:** Player builds & operates cross-universe gates · Discovery missions · Colony empire · 6 faction diplomacy · Passport/visa system · SVG interactive map

---

### 🌌 Persistent Universe V55 (6 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `persistentUniverseEngine.js` | Theo dõi online/offline timestamp · 1 phút thực = 10 năm game · Unified tick · puv55GetOfflineYears/Stats/TickLog() | `cgv6_persistent_univ_v55` | 8300ms |
| `offlineWorldProcessor.js` | Tạo sự kiện offline ngẫu nhiên · 5 loại (War/Kingdom/Economy/Hero/Disaster) · Max 30 events · owp55GetOfflineEvents/WarOutcomes/KingdomChanges() | `cgv6_offline_proc_v55` | 8400ms |
| `historicalReplaySystem.js` | Ghi lịch sử lớn · Wars/EraChanges/Disasters/Heroes/Kingdoms · Auto-record 50 tick · Import offline events · hrs55RecordEvent/War/EraChange() · hrs55GetJarvisChronicle() | `cgv6_hist_replay_v55` | 8500ms |
| `universeHealthSystem.js` | 8 chỉ số sức khỏe (Dân Số/Ổn Định/Kinh Tế/Quân Sự/Tôn Giáo/Môi Trường/Văn Minh/Đa VT) · Auto mỗi 30 tick · uhs55GetMetrics/Overall/Alerts/JarvisReport() | `cgv6_univ_health_v55` | 8600ms |
| `eventDigestSystem.js` | Modal popup offline digest · Online event log 100 mục · eds55ShowDigest() · eds55GetOfflineDigest() · eds55GetOnlineEvents() | `cgv6_event_digest_v55` | 8700ms |
| `universeRegistryV55.js` | Patches mvHubRenderPanel() · 6 tabs (Vũ Trụ/Timeline/Digest/Sức Khỏe/Lịch Sử/Analytics) · Jarvis Chronicle Mode · Passive | — | 8800ms |

**Global Objects:** `window.persistentUnivData` · `window.offlineWorldData` · `window.histReplayData` · `window.univHealthData` · `window.eventDigestData`
**Không trùng với:** `historicalTimeline.js` (htAddEvent — V55 reads) · `worldMemoryEngine.js` (wmeAddMemory — V55 reads) · `timelineEngine.js` V36 (timeline branches — V55 offline simulation khác scope) · `saveManager.js` (V55 layer mới, không sửa core)
**UI:** 6 tabs trong multiverse-hub-v35 · 6 panel divs (panel-persistent/timeline/digest/health/replay/analytics-v55)
**GameTick hooks:** persistentUniverseTick · historicalReplayTick · universeHealthTick (mỗi 30 tick)
**Tính năng nổi bật:** Offline simulation · Event Digest popup · Historical replay · Universe health 8 metrics · Jarvis Chronicle Mode

---

### 💹 Marketplace Expansion & Trading Network V54 (5 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `tradeNetworkCoreV54.js` | 4 loại tuyến (Nội Địa/Quốc Tế/Đế Quốc/Liên Vũ Trụ) · 5 phương tiện · 6 sự kiện route · Guild/Empire routes · tn54EstablishRoute/UpgradeRoute/CloseRoute | `cgv6_trade_network_v54` | 7800ms |
| `goodsSystemV54.js` | 6 danh mục · 26 loại hàng hóa · Player/Guild/Empire warehouse · Custom goods · gs54BuyGoods/SellGoods/CreateCustomGood/GetInventory | `cgv6_goods_v54` | 7900ms |
| `supplyDemandV54.js` | Dynamic pricing · 7 sự kiện TT · Disaster+War+Age+Pop modifiers · Auto fluctuation 15 tick · sd54GetCurrentPrice/TriggerMarketEvent/GetAllPrices | `cgv6_supply_demand_v54` | 8000ms |
| `blackMarketV54.js` | 8 hàng cấm · 4 fence · 4 cấp mạng lưới ngầm · Risk+bust system · Guild black market · bm54BuyContraband/SellContraband/UpgradeNetwork | `cgv6_black_market_v54` | 8100ms |
| `tradeRegistryV54.js` | Patches player-hub-v28 · 6 tabs (Thương Mại/Tuyến Đường/Hàng Hóa/Logistics/Chợ Đen/Thống Kê) · tr54Render* · tradeV54HubRenderPanel() | Passive | 8200ms |

**Global Objects:** `window.tradeNetV54Data` · `window.goodsV54Data` · `window.supplyDemandV54Data` · `window.blackMarketV54Data`
**Không trùng với:** `oceanTradeEngineV27.js` (V27 ocean, V54 extends empire/multiverse) · `economyEngineV2.js` (ev2BlackMarkets NPC-level) · `multiverseEconomy.js` V35 (6 MV goods, V54 reads) · `playerMarketplaceV52.js` (item market)
**UI:** 6 tabs trong player-hub-v28 · 6 panel divs (panel-trade/routes/goods/logistics/blackmkt/tradestats-v54)
**GameTick hooks:** tradeNetworkCoreV54 (mỗi 6 tick) · supplyDemandV54 (mỗi 15 tick) · blackMarketV54 (mỗi 8 tick — guild income)

---

### ⚔️ Guild & Empire Online V53 (5 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `guildCoreV53.js` | Extends guildEngineV29 · 5 cấp bậc (GM/Vice/Elder/Officer/Member) · 8 công trình HQ · 10 nhiệm vụ · 7 AI guilds · Chiêu mộ NPC · g53CreateGuild/AddMember/RecruitNpc/PromoteMember/BuildHQ/AssignQuest | `cgv6_guild_core_v53` | 7300ms |
| `guildAllianceV53.js` | Guild-to-Guild alliances (khác V24) · 4 pact types (defense/trade/military/grand) · Đại Bang Liên · ga53FormAlliance/SignPact/BreakPact/GetEffectiveBonuses | `cgv6_guild_alliance_v53` | 7400ms |
| `playerEmpireV53.js` | Extends V28 Territory · 6 loại quan chức · 6 loại quân đội · 4 AI interactions · Thuế auto · Cống phẩm · emp53SetImperialName/AppointOfficial/RecruitArmy/InteractAI | `cgv6_player_empire_v53` | 7500ms |
| `guildWarV53.js` | 4 loại chiến tranh (Guild/Alliance/Territory/Annihilation) · Auto-resolve · Loot · BXH · gw53DeclareWar/BoostAttack/SurrenderWar/GetRankings | `cgv6_guild_war_v53` | 7600ms |
| `guildRegistryV53.js` | Patches player-hub-v28 · 6 tabs (Bang Hội/Liên Minh/Đế Quốc/Lãnh Thổ/Chiến Tranh/BXH) · gr53Render* · guildV53HubRenderPanel() | Passive | 7700ms |

**Global Objects:** `window.guildV53Data` · `window.guildAllianceV53Data` · `window.playerEmpireV53Data` · `window.guildWarV53Data`
**Không trùng với:** `guildEngineV29.js` (V29 cơ bản, V53 extends) · `allianceEngine.js` (V24 nation alliances) · `playerTerritorySystem.js` (V28 territory, V53 reads) · `territoryWarSystem.js` (world wars)
**UI:** 6 tabs trong player-hub-v28 · 6 panel divs (panel-guild/alliance/empire/territory/guildwar/ranking-v53)
**GameTick hooks:** guildCoreV53 (tick — complete quests/market income) · playerEmpireV53 (tick — army upkeep/tax collect) · guildWarV53 (tick — battle rounds/auto-resolve)

---

### 💰 Player Economy & Marketplace V52 (5 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `playerEconomyCoreV52.js` | Ví 5 tiền tệ · Thu nhập thụ động 11 nghề · Exchange 5% fee · Net Worth | `cgv6_player_economy_v52` | 6800ms |
| `playerMarketplaceV52.js` | 18 vật phẩm 5 danh mục tier 1-5 · Listing/Buy/Auction · Price history · Demand · NPC sellers | `cgv6_player_marketplace_v52` | 6900ms |
| `businessSystemV52.js` | 4 DN (Cửa Hàng/Công Ty/Học Viện/Ngân Hàng) · Level 5 · AI Competition (5 công ty) · Auto income | `cgv6_business_v52` | 7000ms |
| `taxationSystemV52.js` | 4 loại thuế · 5 chính sách (Tự Do TM/Chiến Tranh/Thịnh Vượng/Cải Cách/Thiên Đường) | `cgv6_taxation_v52` | 7100ms |
| `economyRegistryV52.js` | Patches player-hub-v28 · 6 tabs · Hub widget `econV52HubRenderPanel()` | Passive | 7200ms |

**Global Objects:** `window.playerEconV52Data` · `window.pmV52Data` · `window.bizV52Data` · `window.taxV52Data`
**Public API:**
- Wallet: `pec52GetWallet()` · `pec52AddCurrency(id,amt,src)` · `pec52SpendCurrency(id,amt,reason)` · `pec52Exchange(from,to,amt)` · `pec52GetNetWorthInDong()` · `pec52GetStats()` · `pec52GetCurrencies()` · `pec52GetIncomeLog()` · `pec52AddCustomCurrency(name,icon,worldId,rate)`
- Market: `pm52ListItem(itemId,qty,cur,price,seller,desc)` · `pm52BuyItem(listingId,buyer)` · `pm52CreateAuction(itemId,cur,startPrice,durYears,seller)` · `pm52PlaceBid(auctionId,bidder,amt,cur)` · `pm52SettleAuctions()` · `pm52GetActiveListings(cat)` · `pm52GetActiveAuctions()` · `pm52GetItems()` · `pm52GetPriceHistory(itemId)` · `pm52GetStats()` · `pm52GetRecentTrades(n)`
- Business: `biz52Found(typeId,name)` · `biz52Upgrade(bizId)` · `biz52Close(bizId)` · `biz52GetAll()` · `biz52GetTypes()` · `biz52GetAICompanies()` · `biz52GetTotalValue()` · `biz52GetStats()` · `biz52GetJarvisReport()` · `biz52ProcessIncome()`
- Tax: `tax52GetEffectiveRate(businessType)` · `tax52SetPolicy(policyId)` · `tax52GetCurrentPolicy()` · `tax52GetPolicies()` · `tax52GetTypes()` · `tax52GetStats()` · `tax52RecordPayment(typeId,amt,cur)` · `tax52GetJarvisReport()`
- UI: `er52RenderWallet()` · `er52RenderMarket(cat)` · `er52RenderBusiness()` · `er52RenderAuction()` · `er52RenderCurrency()` · `er52RenderEcoStats()` · `econV52HubRenderPanel()`

**5 Tiền Tệ:** Đồng🟤(x1) · Bạc⚪(x100) · Vàng🪙(x10K) · Tinh Thạch💎(x1M) · Thần Thạch✨(x1B)
**4 Loại Thuế:** Quốc Gia(8%) · Đế Chế(12%) · Thương Mại(5%) · Tu Luyện(3%)
**5 Chính Sách:** FreeTrade · WarEconomy · Prosperity · TaxReform · TaxHaven
**18 Vật Phẩm:** Vũ Khí(3) · Đan Dược(3) · Khoáng(3) · Pháp Bảo(2) · Nguyên Liệu(3) · Bất Động Sản(2) · Linh Thú(2)
**Không trùng với:** economyEngine.js (world) · economyEngineV2.js (NPC) · playerMarketplace.js V34 (multiworld sharing) · economyAuditSystem.js
**UI:** 6 tabs trong player-hub-v28 · 6 panel divs (panel-wallet/market/biz/auction/currency/ecostat-v52)

---

### 👁️ Creator God Online V51 (6 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `creatorAuthorityEngineV51.js` | 5 Sắc Lệnh · 5 Ban Phước · 4 Trừng Phạt · Thiên Năng system | `cgv6_creator_authority_v51` | 6200ms |
| `miracleSystemV51.js` | 8 Phép Màu · Cooldown · Effect persistence (expiresYear) | `cgv6_miracle_v51` | 6300ms |
| `prophecySystemV51.js` | 4 loại Tiên Tri · Auto-subject · Auto-fulfill theo year | `cgv6_prophecy_v51` | 6400ms |
| `globalEventControlV51.js` | 7 Sự Kiện Toàn Cầu · Duration · htAddEvent integration | `cgv6_global_event_v51` | 6500ms |
| `godAuditPanelV51.js` | Audit 58 hệ thống · Save Inspector · Jarvis God Mode | Passive | 6600ms |
| `creatorDashboardV51.js` | Patches creator-hub-v32 · 6 tabs | Passive | 6700ms |

**Global Objects:** `window.creatorAuthorityV51Data` · `window.miracleV51Data` · `window.prophecyV51Data` · `window.globalEventV51Data`
**Public API:**
- Authority: `cgv51IssueDecree(typeId, target)` · `cgv51BlessEntity(typeId, target)` · `cgv51CurseEntity(typeId, target)` · `cgv51GetEnergy()` · `cgv51GetMaxEnergy()` · `cgv51GetDecreeTypes()` · `cgv51GetBlessingTypes()` · `cgv51GetCurseTypes()` · `cgv51GetStats()`
- Miracle: `cgv51CastMiracle(typeId, target)` · `cgv51GetActiveEffects()` · `cgv51GetMiracleHistory()` · `cgv51GetMiracleStats()` · `cgv51GetMiracleTypes()`
- Prophecy: `cgv51CreateProphecy(typeId, subject, text)` · `cgv51AutoGenerateProphecy()` · `cgv51FulfillProphecy(id)` · `cgv51GetActiveProphecies()` · `cgv51GetFulfilledProphecies()` · `cgv51GetProphecyStats()` · `cgv51GetProphecyTypes()`
- Global Events: `cgv51TriggerGlobalEvent(typeId)` · `cgv51GetActiveGlobalEvents()` · `cgv51GetEventHistory()` · `cgv51GetGlobalEventStats()` · `cgv51GetGlobalEventTypes()`
- Audit: `cgv51GetAuditSystems()` · `cgv51GetAuditStats()` · `cgv51GetSaveReport()` · `cgv51GetJarvisReport()`
- Dashboard Quick: `v51QuickMiracle(typeId)` · `v51QuickEvent(typeId)` · `v51QuickProphecy()`

**UI:** 6 tabs trong creator-hub-v32 · 6 panel divs (panel-god-mode/divine-will/miracles/prophecies/world-events/god-audit-v51)

---

### 🏛️ Chính Trị AI V49 (4 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `governmentSystemV49.js` | 8 chế độ · Leaders 6 stats · 8 personality traits · Succession · Gov Transitions | `cgv6_government_v49` | 5400ms |
| `politicalFactionV49.js` | 5 phe phái · Power Struggle · Coalition Formation · Legislation Passing | `cgv6_faction_v49` | 5500ms |
| `politicalCrisisV49.js` | 5 khủng hoảng · 4 cấp độ · auto-trigger stability/age/disaster · Resolution | `cgv6_crisis_v49` | 5600ms |
| `politicsRegistryV49.js` | Hub Widget · 6 Sub-Panels (Tổng Quan/Chính Phủ/Phe Phái/Ngoại Giao/Gián Điệp/Khủng Hoảng) | Passive | 5700ms |

**Global Objects:** `window.govV49Data` · `window.factionV49Data` · `window.crisisV49Data`
**Public API:**
- Gov: `govV49AssignGovernment(id, name, type, govTypeId)` · `govV49TriggerTransition(entityId, newTypeId, reason)` · `govV49TriggerSuccession(entityId)` · `govV49GetAll()` · `govV49GetLeader(entityId)` · `govV49GetStats()` · `govV49GetTypes()` · `govV49GetTraits()`
- Faction: `facV49GetEntity(entityId)` · `facV49GetAll()` · `facV49GetEvents()` · `facV49GetStats()` · `facV49GetTypes()` · `facV49TriggerStruggle(entityId)`
- Crisis: `criV49Trigger(typeId, entityName, sevIdx, reason)` · `criV49Resolve(crisisId, resolutionIdx)` · `criV49GetActive()` · `criV49GetHistory()` · `criV49GetStats()` · `criV49GetTypes()`
- UI: `politicsV49HubRenderPanel()` · `politicsV49RenderPanel(tab)` (tabs: overview/government/factions/diplomacy/espionage/crisis)

**UI Panel:** `panel-politics-v49` (main) + 5 sub-panels (panel-government-v49, panel-faction-v49, panel-diplomacy-v49, panel-espionage-v49, panel-political-crisis-v49)
**Extends (KHÔNG sửa):** `continentalPoliticsEngine.js` · `espionageEngine.js` · `diplomaticEngine.js` · `kingdomAI.js` · `empireAI.js` · `livingCivilizationAI.js`
**Integration:** `politicalCrisisV49.js` auto-trigger protest từ `disasterData.activeDisasters` (V48) · Reads `drData` (diplomaticEngine) · Reads `cgv6_espionage` localStorage
**8 Chế Độ:** MONARCHY(👑) · EMPIRE(🏛️) · REPUBLIC(🗳️) · THEOCRACY(⛪) · ARISTOCRACY(🎭) · FEDERATION(🔗) · COUNCIL(👥) · CUSTOM(⚙️)
**5 Phe Phái:** CONSERVATIVE(🏰) · REFORMIST(📜) · MILITARIST(⚔️) · RELIGIOUS(⛪) · MERCHANT(💰)
**5 Khủng Hoảng:** COUP(⚔️) · CIVIL_WAR(🔥) · PROTEST(✊) · SUCCESSION_CRISIS(👑) · SECESSION(🗺️)
**8 Leader Traits:** AMBITIOUS · DIPLOMATIC · MILITARIST · CORRUPT · REFORMIST · ISOLATIONIST · EXPANSIONIST · PIOUS

### 🌋 Thiên Tai & Thảm Họa Toàn Cầu V48 (4 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `globalDisasterCoreV48.js` | Chain Reaction 9 loại · Thiên Thạch · Băng Hà · AI Response 6 loại · Warning System | `cgv6_global_disaster_v48` | 5000ms |
| `anomalyEngineV48.js` | 6 Dị Tượng: Cổng KG · Mưa TL · Dị Giới · Thần Linh · Ma Giới · Biến Dạng TG | `cgv6_anomaly_v48` | 5100ms |
| `multiverseDisasterV48.js` | 4 Thảm Họa Đa Vũ Trụ: Sụp Đổ · Va Chạm · Nứt TG · Bão KTG | `cgv6_mv_disaster_v48` | 5200ms |
| `disasterRegistryV48.js` | Hub Widget · 6 Sub-Panels (Thiên Tai/Đại Dịch/Dị Tượng/Khủng Hoảng/Cảnh Báo/Thống Kê) | Passive | 5300ms |

**Global Objects:** `window.globalDisasterV48Data` · `window.anomalyV48Data` · `window.mvDisasterV48Data`
**Public API:** `gdV48TriggerNewDisaster(typeId, region, sev)` · `gdV48TriggerGlobal(typeId)` · `gdV48GetStats()` · `gdV48GetWarnings()` · `gdV48GetAIResponses()` · `gdV48GetChainQueue()` · `anomV48Trigger(typeId, region)` · `anomV48GetActive()` · `anomV48GetHistory()` · `anomV48GetStats()` · `mvdV48Trigger(typeId, univId, sev)` · `mvdV48GetActive()` · `mvdV48GetHistory()` · `mvdV48GetStats()` · `disasterV48HubRenderPanel()` · `disasterV48RenderPanel(tab)`
**UI Panel:** `panel-disaster-v48` (main) + 5 sub-panels (panel-plague-v48, panel-anomaly-v48, panel-crisis-v48, panel-warnings-v48, panel-disaster-stats-v48)
**Extends (KHÔNG sửa):** `disasterEngine.js` V25 · `plagueEngine.js` V25 · `economicCrisisEngine.js` V25 · `ecoDisasterEngine.js` V45
**Chain Reactions:** EQ→TSUNAMI(45%) · EQ→VOLCANO(30%) · VOLCANO→DROUGHT(55%) · VOLCANO→FLOOD(35%) · FLOOD→PLAGUE(40%) · DROUGHT→RECESSION(35%) · METEORITE→EQ(70%) · METEORITE→ICE_AGE(50%) · ICE_AGE→RECESSION(30%)

### ⚔️ Anh Hùng & Huyền Thoại V47 (3 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `legendEngineV47.js` | Sử Thi · Truyền Thuyết · Lời Tiên Tri · Biên Niên Sử | `cgv6_legend_v47` | 4400ms |
| `fameSystemV47.js` | Danh Tiếng 3 Cấp · 10 Archetypes · Legacy 6 Loại · AI Journey · Kình Địch | `cgv6_fame_v47` | 4500ms |
| `heroRegistryV47.js` | Hub Widget · 6 Sub-Panels (heroes/epics/folklore/fame/legacy/rankings) | Passive | 4600ms |

**Global Objects:** `window.legendV47Data` · `window.fameV47Data`
**Public API:** `legV47GetEpics()` · `legV47GetFolklore()` · `legV47GetProphecies()` · `fv47GetProfiles()` · `fv47GetHeroes()` · `fv47GetVillains()` · `fv47GetLegacies()` · `fv47GetTopByFame(type, limit)` · `heroV47HubRenderPanel()` · `heroV47RenderPanel(tab)`
**UI Panel:** `panel-hero-v47` (main) + 5 sub-panels (panel-epics-v47, panel-folklore-v47, panel-fame-v47, panel-legacy-v47, panel-hero-rankings-v47)
**Extends:** `heroLegendEngine.js` (không sửa) — đọc heroLegendData.heroes

### 🔷 Core Engine (6 files)
| File | Chức Năng |
|---|---|
| `app.js` | Core loop · NPC/Sect/Country · Save/Load · gameTick chính |
| `worldTemplates.js` | World initialization templates |
| `worldHub.js` | World Hub V6 · Multi-world UI |
| `multiWorldSystem.js` | Multi-world management |
| `living-world-engine.js` | NPC soul/ambition/memory AI |
| `saveManager.js` | Save/Load manager V1 |

### 💰 Economy (5 files)
`economySystem.js` · `economyEngine.js` · `economyEngineV2.js` · `economyAuditSystem.js` · `worldMarketplace.js`

### ⚔️ War & Territory (3 files)
`warEngine.js` · `territorySystem.js` · `territoryWarSystem.js`

### 🤝 Diplomacy V1 (2 files)
`diplomaticEngine.js` · `espionageEngine.js`

### 🤝 Diplomacy V24 (5 files)
`allianceEngine.js` · `treatyEngine.js` · `sanctionEngine.js` · `worldCouncilEngine.js` · `diplomacyEngine.js`

### 👑 Empire & Kingdom V23 (11 files)
`kingdomEngine.js` · `kingdomAI.js` · `empireEngine.js` · `empireAI.js` · `successionEngine.js`
`nobleHouseEngine.js` · `dynastyEngine.js` · `dynastySystem.js` · `bloodlineEngine.js`
`hereditaryBloodlineEngine.js` · `livingCivilizationAI.js`

### 🌍 World Simulation (14 files)
`worldEventEngine.js` · `worldEventEngineV25.js` · `worldMemoryEngine.js` · `worldAlertEngine.js`
`worldStorySystem.js` · `worldMapSystem.js` · `historicalTimeline.js` · `rankingsEngine.js`
`technologyEngine.js` · `politicalReligionEngine.js` · `cultureHeritageEngine.js`
`religionEngine.js` · `emergentCivilization.js` · `aiWorldGenerator.js`

### 🌋 World Events V25 (5 files) — WORLD-SCALE
`disasterEngine.js` · `plagueEngine.js` · `economicCrisisEngine.js` · `worldEventEngineV25.js` · `ageEngineV25.js`
> ⚠️ V25 = civilization-scale impact. KHÁC với ecoDisasterEngine.js V45 (ecosystem-scale)

### 🌍 Continent V26 (4 files)
`continentEngineV26.js` · `continentEngine.js` · `continentalPoliticsEngine.js` · `migrationEngineV26.js`

### 🌊 Ocean V27 (6 files)
`navalOceanEngine.js` · `navalEngine.js` · `oceanTradeEngine.js` · `fleetEngine.js` · `pirateEngine.js` · `colonyEngine.js`

### 🧘 Player V28 (14 files)
`playerEngine.js` · `playerSystem.js` · `cultivationPlayerEngine.js` · `ascensionEngine.js`
`playerInventory.js` · `playerQuestSystem.js` · `playerReputationEngine.js` · `playerTerritorySystem.js`
`playerMarketplace.js` · `playerPresenceEngine.js` · `playerSessionManager.js`
`playerAdvisor.js` · `autoPlayerAI.js` · `progressionSystem.js`

### ⛩️ Sect V29 (3 files)
`sectEngineV29.js` · `sectWarEngineV29.js` · `guildEngineV29.js`

### 🏛️ Divine V30 (7 files)
`pantheonEngineV30.js` · `divineBeingEngine.js` · `divineWarEngine.js` · `realmEngineV30.js`
`portalEngineV30.js` · `heavenlyDaoEngine.js` · `divineAdministration.js`

### ⚔️ Combat V31 (8 files)
`dungeonEngineV31.js` · `dungeonSystem.js` · `worldBossEngineV31.js` · `invasionEngineV31.js`
`raidEngineV31.js` · `lootEngineV31.js` · `legendaryHuntEngineV31.js` · `bossEvolutionEngineV31.js`

### 👁️ Creator God V32 (9 files)
`creatorGodEngine.js` · `creatorGodControl.js` · `creatorAnalytics.js` · `creatorLibrary.js`
`creatorAdvisor.js` · `hubEngine.js` · `worldAdvisor.js` · `projectStatusEngine.js` · `nextVersionEngine.js`

### 🤖 Thủ Hộ Thần V33 (5 files)
`thuhothanCore.js` · `thuhothanMemory.js` · `thuhothanPersonality.js` · `eventFeedEngine.js` · `worldAlertEngine.js`

### 👥 Multiplayer V34 (8 files)
`multiplayerEngine.js` · `multiplayerEventEngine.js` · `accountEngine.js` · `worldChatEngine.js`
`worldSyncEngine.js` · `antiCheatEngine.js` · `playerSessionManager.js` · `playerMarketplace.js`

### 🌌 Multiverse V35 (8 files)
`multiverseEngine.js` · `universeManager.js` · `universeRegistry.js` · `multiverseMapEngine.js`
`multiverseEconomy.js` · `multiverseWarEngine.js` · `portalNetwork.js` · `universeTravelEngine.js`

### 🌀 Timeline V36 (9 files)
`timelineEngine.js` · `timelineBranchEngine.js` · `timelineEventEngine.js` · `timelineManager.js`
`timelineMergeEngine.js` · `timelineRegistry.js` · `timelineTravelEngine.js`
`timelineWarEngine.js` · `timelineAnalytics.js`

### ♾️ Infinite Universe V37 (4 files)
`universeGeneratorEngine.js` · `universeLawEngine.js` · `universeLifecycleEngine.js` · `universeObservatoryEngine.js`

### 🌟 Civilization Evolution V38 (1 file)
`civEvolutionEngineV38.js`

### ⚔️ Multiverse War V39 (5 files)
`multiverseWarSystemV39.js` · `conquestSystemV39.js` · `multiverseInvasionSystemV39.js`
`multiverseAllianceSystemV39.js` · `multiverseWarAnalyticsV39.js`

### 🏭 Creator Marketplace V40 (6 files)
`creatorRaceFactory.js` · `creatorGodFactory.js` · `creatorNationFactory.js`
`creatorBossFactory.js` · `creatorItemFactory.js` · `creatorUniverseFactory.js`

### 🤖 AI Creator Assistant V41 (7 files)
`creatorBrain.js` · `creatorAI.js` · `creatorSuggestionEngine.js` · `balanceAnalyzer.js`
`loreGenerator.js` · `eventGenerator.js` · `creatorReports.js`

### 📖 Thư Viện Thần Thoại V42 (6 files)
`mythologyDatabase.js` · `mythologyGodSystem.js` · `mythologyCreatureSystem.js`
`mythologyArtifactSystem.js` · `mythologyLoreSystem.js` · `mythologyRegistry.js`

### 🌀 Kỷ Nguyên Thế Giới V43 (5 files)
| File | Save Key |
|---|---|
| `worldAgeEngine.js` | cgv6_world_age_v43 |
| `ageProgressionEngine.js` | cgv6_age_prog_v43 |
| `ageEventEngine.js` | cgv6_age_events_v43 |
| `ageAnalytics.js` | cgv6_age_analytics_v43 |
| `ageRegistry.js` | — |

### 🧬 Chủng Tộc Tiến Hóa V44 (5 files)
| File | Save Key |
|---|---|
| `raceEvolutionCore.js` | cgv6_race_evo_core_v44 |
| `raceAbilityEngine.js` | cgv6_race_ability_v44 |
| `raceWarEngine.js` | cgv6_race_war_v44 |
| `raceRelationEngine.js` | cgv6_race_relation_v44 |
| `raceEvolutionRegistry.js` | — |

### 🌿 Hệ Sinh Thái Thế Giới V45 — NEWEST (5 files)
| File | Chức Năng | Save Key |
|---|---|---|
| `ecoClimateEngine.js` | 8 khí hậu · 4 mùa · effects · V43 age sync | cgv6_eco_climate_v45 |
| `ecoResourceEngine.js` | 5 tài nguyên · regen · trade routes | cgv6_eco_resource_v45 |
| `ecoCreatureEngine.js` | 20 sinh vật · food chain · extinction | cgv6_eco_creature_v45 |
| `ecoDisasterEngine.js` | 5 thiên tai eco-scale · auto-trigger | cgv6_eco_disaster_v45 |
| `ecoRegistry.js` | 6 panels · ecoHubRenderPanel() · ecoRenderPanel(id) | — |

**Panel IDs:** `panel-eco-overview-v45` · `panel-eco-climate-v45` · `panel-eco-seasons-v45` · `panel-eco-creatures-v45` · `panel-eco-resources-v45` · `panel-eco-disasters-v45`

**UI Location:** Section trong mvHubRenderPanel (inline index.html ~dòng 3352) — KHÔNG tạo tab sidebar mới

---

## 🗄️ SAVE KEYS NHÓM V45–V49

```
V45 (Ecosystem):    cgv6_eco_climate_v45 · cgv6_eco_resource_v45
                    cgv6_eco_creature_v45 · cgv6_eco_disaster_v45
V47 (Hero):         cgv6_legend_v47 · cgv6_fame_v47
V48 (Disaster):     cgv6_global_disaster_v48 · cgv6_anomaly_v48 · cgv6_mv_disaster_v48
V49 (Politics):     cgv6_government_v49 · cgv6_faction_v49 · cgv6_crisis_v49
```

*(Các keys V25–V44 xem grep SAVE_KEY *.js)*

---

## 🎮 GAME TICK HOOKS V49 (3 engines mới)

```
governmentSystemV49.js  — mỗi 30 ticks (AI decisions, succession, aging)
politicalFactionV49.js  — mỗi 40 ticks (power struggle, coalition, legislation)
politicalCrisisV49.js   — mỗi 40 ticks (auto-trigger, expire crises)
```

**Tổng cộng: 90 engines hook vào gameTick**

---

## 🌿 V45 GLOBAL API FUNCTIONS

```javascript
// Climate
window.ecoGetClimates()              // Tất cả 8 khí hậu + custom
window.ecoGetClimate(id)             // Khí hậu theo ID
window.ecoGetCurrentClimate()        // Khí hậu hiện tại { name, icon, color, ... }
window.ecoSetClimate(id)             // Thay đổi khí hậu (ghi history)
window.ecoAddCustomClimate(obj)      // Tạo khí hậu tùy chỉnh → return id
window.ecoGetSeasons()               // 4 mùa
window.ecoGetCurrentSeason()         // Mùa hiện tại { name, icon, bonuses }
window.ecoGetEffects()               // { popBonus, agriBonus, econBonus, warBonus, climate, season }

// Resources
window.ecoGetResources()             // Tất cả tài nguyên { current, max, regen, depleted }
window.ecoGetResource(id)            // Tài nguyên theo id
window.ecoGetResourceTypes()         // 5 loại tài nguyên (metadata)
window.ecoExtractResource(id, amt)   // Khai thác → return amount extracted
window.ecoAddTradeRoute(rid, amt, target) // Tuyến thương mại
window.ecoGetResourceStats()         // { total, thriving, depleted, byClimate }

// Creatures
window.ecoGetCreatures()             // Tất cả sinh vật (kể cả đã tuyệt chủng)
window.ecoGetCreature(id)            // Sinh vật theo id
window.ecoGetAliveCreatures()        // Chỉ sinh vật còn sống
window.ecoGetCreaturesByClimate(id)  // Lọc theo khí hậu
window.ecoGetCreaturesByEra(id)      // Lọc theo kỷ nguyên V43
window.ecoHuntCreature(predId, preyId) // Săn mồi thủ công
window.ecoGetFoodChain()             // Danh sách quan hệ predator→prey
window.ecoGetCreatureStats()         // { alive, extinct, endangered, totalPop, total }

// Disasters
window.ecoGetDisasterTypes()         // 5 loại thiên tai (metadata)
window.ecoGetActiveDisasters()       // Thiên tai đang diễn ra
window.ecoGetDisasterHistory()       // Lịch sử 40 vụ gần nhất
window.ecoTriggerDisaster(id, sev)   // Kích hoạt thủ công (sev: 0-3)
window.ecoGetDisasterStats()         // { total, active, byType }

// UI
window.ecoRenderPanel(panelId)       // Render sub-panel theo ID
window.ecoHubRenderPanel()           // Widget HTML cho mvHubRenderPanel
```

---

## 🗂️ HUB STRUCTURE — Multiverse Hub V35

### mvHubRenderPanel Sections (inline index.html ~dòng 3244)
| Section | Version | Widget Function |
|---|---|---|
| Multiverse Portal | V35 | (built-in) |
| Timeline | V36 | (built-in) |
| Universe Generator | V37 | (built-in) |
| CivEvo | V38 | (built-in) |
| MV War | V39 | (built-in) |
| World Age | V43 | `waeHubRenderPanel()` |
| Race Evolution | V44 | `recHubRenderPanel()` |
| Hệ Sinh Thái | V45 | `ecoHubRenderPanel()` |
| Anh Hùng & Huyền Thoại | V47 | `heroV47HubRenderPanel()` |
| Thiên Tai & Thảm Họa | V48 | `disasterV48HubRenderPanel()` |
| **Chính Trị AI** | **V49** | **`politicsV49HubRenderPanel()`** |

---

## ⚠️ LƯU Ý QUAN TRỌNG CHO AGENT

1. **Array Safety (V33):**
   ```javascript
   Array.isArray(x) ? x : Object.values(x||{})
   ```

2. **gameTick Hook Pattern:**
   ```javascript
   const _orig = window.gameTick;
   window.gameTick = function() { if (_orig) _orig(); myTick(); };
   ```

3. **Init Timing (staggered):**
   - V43: 2900ms–3300ms
   - V44: 3400ms–3800ms
   - V45: 3900ms–4300ms
   - V47: 4400ms–4600ms
   - V48: 5000ms–5300ms
   - **V49: 5400ms–5700ms**
   - **V50 trở đi: 5800ms+**

4. **UI Rule (V38+):** KHÔNG tạo tab sidebar mới. Mọi UI → hub hiện có (mvHubRenderPanel).

5. **V49 Politics Scope:**
   - `continentalPoliticsEngine.js` V26 = continental-scale (lục địa)
   - `governmentSystemV49.js` V49 = per-entity (kingdom/empire/country mỗi thực thể riêng)

6. **V49 Crisis Integration:**
   - `politicalCrisisV49.js` đọc `disasterData.activeDisasters` → auto-trigger protest
   - Auto-trigger succession khi `gov.leader.age > 75`
   - Auto-trigger crisis khi `country.stability < 30`

7. **Multiverse Hub:** mvHubRenderPanel là **inline JS trong index.html** ~dòng 3244, KHÔNG trong hubEngine.js. Thêm section VÀO TRƯỚC `+'</div>';` cuối cùng.

8. **V49 espionage reading:** `politicsRegistryV49.js` đọc trực tiếp từ `localStorage.getItem("cgv6_espionage")` — KHÔNG gọi hàm espionageEngine vì state là private closure.

---

## 📁 FILE STATUS SUMMARY

| Trạng Thái | Số Lượng |
|---|---|
| **Active game files (loaded in index.html)** | 205 |
| **Server file** | 1 (serve.js) |
| **Tổng trên disk** | 206 |

---

*Audit tự động từ quét mã nguồn thực — ngày 2026-06-13 — V49*
