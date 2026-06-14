# WORLD AUDIT REPORT — Creator God V6
> Báo cáo trạng thái thế giới hiện tại dựa trên code thực tế
> Ngày: 2026-06-14 (cập nhật sau V73 — Universe Hub Pass)
> Tổng: ~299 JS files · 241 panels · 68 nav buttons · 190+ save keys · 122 gameTick hooks

---

## 🌌 V73 — UNIVERSE HUB PASS (MỚI NHẤT)

### Tầm Nhìn
Creator Panel = quản lý thế giới của bản thân. Universe Hub = kết nối với các thế giới khác. Tab sidebar meta-platform đầu tiên được phép tạo kể từ V38.

### 6 Tabs Nội Bộ
```
🌍 Worlds        — 8 thế giới có thể khám phá · Filter/Search · Portal + Follow
👤 Creators      — Hồ sơ Creator · 8 Creators khác · Online/Offline · Reputation tier
🗺️ Universe Map — Canvas 2D · starfield · animated portal connections · 3 clusters
🌀 Portals       — Portal management · Stats tracking · XR integration guide
🎯 Events        — 4 sự kiện (Liên Thế Giới/Toàn Nền Tảng/Cộng Đồng) · Tham gia + reward
🏆 Rankings      — Sort by CivScore/Worlds/Population · Player auto-included · 6 tiers
```

### Portal Flow
```
Worlds → "🌀 Mở Portal" → uhub73OpenPortal() → lưu portal → htAddEvent()
                                                    ↓
Portals tab → "🚀 Thăm ngay" → uhubV73VisitWorld() → fullscreen overlay → quay về
```

### 8 Demo Worlds
| Thế Giới | CivScore | Tier |
|---|---|---|
| Azureth — Băng Giá | 8,420 | Master |
| Draconia — Đất Rồng | 11,200 | Legendary |
| Sylvaria — Rừng Bất Tận | 5,100 | Elite |
| Mechatopia — Cơ Học | 9,800 | Master |
| Abyssara — Bóng Tối | **15,600** | **Mythic** |
| Celestara — Thiên Giới | 7,300 | Master |
| Sandoria — Sa Mạc | 6,200 | Master |
| Aquarion — Đại Dương | 9,100 | Master |

### XR Readiness: 84%
- Portal Traversal: bước qua cổng như thực tế ảo
- Universe Map: hologram 3D trong XR space
- World Visit Overlay: tự động chuyển immersive mode
- Creator Profiles: floating cards trong XR

### Files
- `universeHubCore.js` (init 17800ms · save: cgv6_universe_hub_v73)
- `universeHubMap.js` (init 17900ms · no save · Canvas engine)
- `universeHubRegistry.js` (init 18000ms · 6-tab UI · dynamic inject)

---

## 🥽 V72 — XR WORLD PASS (MỚI NHẤT)

### Tầm Nhìn
Creator đeo Meta Quest / Vision Pro / AR Glasses và **bước vào thế giới của chính mình**. Thế giới hiện ra như sa bàn sống — phóng to, thu nhỏ, xoay, kéo. Zoom từ Vũ Trụ → Thành Phố → Đường Phố → NPC. NPC nhìn thấy, chào đón, cầu nguyện. Creator can thiệp như thần.

### 8 View Levels
```
🌌 Vũ Trụ     — Toàn bộ đa vũ trụ (scale 0.01x)
⭐ Thiên Hà   — Hàng triệu ngôi sao (scale 0.05x)
🌍 Hành Tinh  — Thế giới hiện tại (scale 0.15x)
🗺️ Lục Địa   — Một lục địa (scale 0.35x)
🏰 Vương Quốc — Một vương quốc (scale 0.60x)
🏙️ Thành Phố — Thành phố sống động (scale 1.00x)
🏘️ Đường Phố — Đường phố, cửa hàng (scale 1.80x)
👤 NPC        — Một cá nhân (scale 3.00x)
```

### God Scale Shift
```
⚡ THẦN KHỔNG LỒ (God Scale)
   → Cao 1000m · Bóng che khuất cả thành phố
   → Nhìn thấy nhiều quốc gia cùng lúc
   → Dân chúng ngã xuống sợ hãi

🧑 TỶ LỆ NGƯỜI (Human Scale)
   → Cao 1.75m · Đi giữa dân chúng
   → NPC nhìn thấy và phản ứng
   → Nghe tiếng chợ búa, ngửi mùi thành phố
```

### 6 Loại Phản Ứng NPC
```
🙏 Cầu Nguyện  — Priest, Monk, Tư Tế có faith cao
😱 Khiếp Sợ   — Civilian, Low-power NPC
👋 Chào Đón   — Ngẫu nhiên (20% chance)
🤔 Hoài Nghi  — Scholar (thường)
💬 Trò Chuyện — Ngẫu nhiên (13% chance)
✨ Cầu Khẩn   — High-faith NPC
```

### 8 Divine Commands (từ XR Companion)
```
✨ Ban Phước Thành Phố — 80⚡  Mùa màng bội thu 50 năm
🌧️ Tạo Mưa Phép Màu   — 60⚡  Mưa vàng — Thiên Ân
⚡ Trừng Phạt Kẻ Ác   — 120⚡ Sét thần · Stability +15
💊 Chữa Lành Đại Dịch — 150⚡ Xóa plague tại vùng đó
⚔️ Triệu Hồi Anh Hùng — 180⚡ NPC warrior → Anh hùng
🌅 Khai Mở Kỷ Nguyên  — 200⚡ Ghi Historical Timeline
🔮 Phán Lời Tiên Tri  — 80⚡  Tạo prophecy V66
📣 Thần Ngôn           — 50⚡  Gọi divVoice66Send
```

### 5 History Replay Types
```
⚔️ Chiến Tranh Lịch Sử   — warsActive + htData.events[war]
👑 Đế Quốc Đã Sụp Đổ     — empireData.empires
🦸 Hành Trình Anh Hùng    — npcs[power>70 or isHero]
✨ Can Thiệp Thần Linh    — mfst71GetLog + das71GetAppearanceLog
🌋 Thảm Họa Lớn           — disasterData.history
```

### Jarvis XR Companion
```
🚶 Đồng Hành — Đi cùng Creator, bình luận cảnh vật
📖 Giải Thích — Lịch sử thành phố, dân số, tôn giáo, kinh tế
🧭 Hướng Dẫn — Tip XR, cách tương tác, gợi ý tối ưu
```

### 5 Thiết Bị XR Hỗ Trợ
```
🥽 Meta Quest        — VR · XR Score 92/100 · Hand Tracking · God Hand
🍎 Apple Vision Pro  — MR · XR Score 95/100 · Eye Tracking · Spatial Audio
👓 AR Glasses        — AR · XR Score 70/100 · Plane Detection
🖥️ Desktop Browser  — Flat · XR Score 40/100 · Mouse Orbit
📱 Mobile Browser    — Flat · XR Score 55/100 · Touch Pinch
```

### Files (4 files · 3 save keys)
```
xrWorldEngine.js      — cgv6_xr_world_v72    — init 17400ms
xrPresenceSystem.js   — cgv6_xr_presence_v72 — init 17500ms
xrGodInteraction.js   — cgv6_xr_god_v72      — init 17600ms
xrWorldRegistry.js    — (no save)             — init 17700ms
```

### UI (5 tabs trong creator-hub-v32)
```
🥽 XR World    — World Table Mode: Kích Hoạt · Scale · Xoay · View Levels
🌍 Enter World — Bước vào quốc gia · NPC nearby · Trò chuyện
⚡ God Scale   — Thần Khổng Lồ vs Tỷ Lệ Người · Luồng trải nghiệm
📽️ XR Replay  — 5 loại History Replay · Progress bar · Step-by-step
🤖 XR Companion— Jarvis XR · 8 Divine Commands · Command log
```

---

## 👁️ V71 — AVATAR OF GOD PASS

### Tầm Nhìn
Người dùng không còn là người quan sát. Creator bước vào thế giới với hình thức vật lý — NPC nhận ra, phản ứng, lập tôn giáo, kể truyền thuyết 1000 năm sau.

### 6 Hình Thức Avatar
```
🧑 Hình Người          — Gần gũi, có thể nhầm là người thường (50% power)
👼 Thiên Sứ            — Cánh vàng, ánh sáng thánh thiện (75% power)
🐉 Rồng Thần           — Biểu tượng quyền năng tuyệt đối (100% power)
✨ Thực Thể Ánh Sáng   — Thuần năng lượng, không hình thể (90% power)
🌀 Hologram            — Hình chiếu kỹ thuật số, huyền bí (70% power)
⚡ Tùy Chỉnh           — Hình dạng do Creator chọn (80% power)
```

### 5 Phản Ứng NPC (theo nghề nghiệp & tính cách)
```
🙏 Tôn Kính    — Cúi đầu, dâng lễ vật (Priests · Farmers)
😱 Sợ Hãi      — Bỏ chạy, trốn tránh (Civilians · Low-power NPCs)
🤔 Hoài Nghi   — Quan sát, đặt câu hỏi (Scholars)
⭐ Sùng Bái    — Quỳ lạy, trở thành môn đồ (High-faith NPCs)
⚔️ Chống Đối   — Kêu gọi kháng cự (Warriors · Rival religions)
```

### 5 Tiến Hóa Tôn Giáo
```
✨ Thờ Đấng Sáng Thế    — NPC lập đền thờ Creator làm thần tối cao
👑 Thần Tối Cao          — Creator đứng trên mọi thần linh
🔥 Thần Hủy Diệt         — Creator bị xem là kẻ phải chống lại
📜 Giáo Lý Mới           — NPC tự tạo giáo lý từ những gì thấy
🌟 Ngôn Sứ Xuất Hiện     — Một NPC nhận thiên khải, thành prophet
```

### 8 Loại Hiện Thân (mfst71Perform)
```
🌟 Giáng Thế     — 100⚡  Xuất hiện trước dân chúng
🛡️ Cứu Thế      — 150⚡  Cứu thành phố/quốc gia
🔮 Ban Tiên Tri  — 80⚡   Phán lời tiên tri → khắc vào đá
✨ Đại Phúc Lành — 120⚡  Ban phước cả thành phố
💥 Hủy Diệt      — 200⚡  Trừng phạt kẻ tội lỗi
⚔️ Triệu Anh Hùng— 180⚡  Biến NPC thường thành anh hùng
📣 Thần Ngôn     — 60⚡   Nói với toàn thế giới
🌈 Phép Màu      — 130⚡  Tạo phép màu không thể giải thích
```

### 8 Loại Xuất Hiện (das71TriggerAppearance)
```
🏙️ Giáng Thế Thành Phố · ⚔️ Thần Trên Chiến Trường
⛪ Thần Hiện Linh     · 💊 Thần Chữa Bệnh
📜 Chữ Thần Trên Vách Đá · 🌟 Cứu Anh Hùng
⚡ Trừng Phạt Bạo Chúa  · 🌅 Mở Kỷ Nguyên Mới
```

### 5 UI Tabs (trong creator-hub-v32)
```
👁️ Avatar          — Chọn hình thức · Đặt tên Thần · Danh hiệu · Jarvis
✨ Hiện Diện        — State (Absent/Watch/Present/Active) · Bước Vào Thế Giới · Reaction log
🌟 Hiện Thân        — 8 nút hiện thân · Tiêu Thần Năng · Kết quả live · Lịch sử
🙏 Môn Đồ           — Phân loại roles · Giáo phái · Sự kiện tôn giáo
📜 Di Sản Thần Linh  — Stats tổng · Truyền thuyết · Sử sách · Nhật ký
```

### 5 File Mới
| File | Save Key | Init |
|---|---|---|
| avatarOfGodEngine.js | cgv6_avatar_god_v71 | 16900ms |
| divinePresenceSystem.js | cgv6_divine_presence_v71 | 17000ms |
| creatorManifestationSystem.js | cgv6_manifestation_v71 | 17100ms |
| divineAppearanceSystem.js | cgv6_divine_appearance_v71 | 17200ms |
| avatarOfGodRegistry.js | — | 17300ms |

### Tích Hợp
- Ghi vào: V64 `mem64Record()` · `window.htAddEvent()` · `window.wmeAddMemory()`
- Đọc từ: V65 `window.npcs` profiles · V66 divine energy · `window.countries` · `window.warsActive` · `window.disasterData` · `window.plagueData`
- Extends V66: `creatorLegacySystemV66` (không ghi đè)
- Không hook gameTick — pure interactive layer
- XR Ready: tương thích Meta Quest · Apple Vision Pro · AR Glasses

### Hành Trình Creator
```
Creator chọn hình thức → Đặt tên Thần
         ↓
Bước vào thế giới tại một địa điểm
         ↓
NPC nhận ra: 🙏 quỳ · 😱 bỏ chạy · ⭐ sùng bái · ⚔️ chống đối
         ↓
Một số NPC lập giáo phái thờ Creator
         ↓
Creator hiện thân: Giáng Thế · Cứu Thế · Phán Tiên Tri...
         ↓
Mọi sự kiện → Sử sách · Truyền thuyết · Ký ức tập thể V64
         ↓
1000 năm sau vẫn còn truyền thuyết về lần xuất hiện đó
```

---

## 🌌 V70 — WORLD IMMERSION PASS

### Tầm Nhìn
Creator có thể zoom liên tục từ toàn vũ trụ xuống một NPC cụ thể, quan sát cuộc đời của họ qua hàng thế kỷ.

### 9 Cấp Độ Zoom (Universe → NPC)
```
Scale 0: 🌌 Vũ Trụ    — Toàn bộ đa vũ trụ
Scale 1: ⭐ Thiên Hà  — Một thiên hà
Scale 2: 🌍 Hành Tinh — Thế giới hiện tại (mặc định)
Scale 3: 🗺️ Lục Địa  — Một lục địa
Scale 4: 🏰 Vương Quốc— Một kingdom/empire
Scale 5: 🏙️ Thành Phố — Living city
Scale 6: 🏘️ Khu Phố  — Đường phố, shops
Scale 7: 🏠 Công Trình— Một tòa nhà
Scale 8: 👤 NPC       — Một cá nhân
```

### 5 UI Tabs (trong creator-hub-v32)
```
🌌 Immersion View  — Scale navigator · Jarvis narration · Stats
🔍 World Zoom      — Canvas 2D animated (scroll/pinch/click)
👤 NPC Observer    — Dropdown chọn NPC · Lifeline · Ký ức · Gia đình
👑 Dynasty View    — Gia tộc nổi bật · Canvas tree · Lịch sử
📽️ Historical Replay — Walkthrough · Auto Replay · Jarvis Tour Guide
```

### 8 File Mới
| File | Save Key | Init |
|---|---|---|
| immersionEngine.js | cgv6_immersion_engine_v70 | 16100ms |
| worldScaleEngine.js | cgv6_world_scale_v70 | 16200ms |
| dynamicZoomSystem.js | cgv6_dynamic_zoom_v70 | 16300ms |
| cityImmersionSystem.js | cgv6_city_immersion_v70 | 16400ms |
| npcObservationSystem.js | cgv6_npc_observation_v70 | 16500ms |
| dynastyVisualizationSystem.js | cgv6_dynasty_viz_v70 | 16600ms |
| worldWalkthroughSystem.js | cgv6_walkthrough_v70 | 16700ms |
| immersionRegistry.js | — | 16800ms |

### Tích Hợp
- Đọc từ: V64 Memory · V65 NPC Life/Family · V55 Replay · V67 Spatial · V69 XR
- Không hook gameTick — pure visual/immersion layer
- XR Ready: pinch zoom · AR overlay · canvas 2D coords khớp V67

### Đề Xuất Tiếp Theo: V71 — God Eye Pass
- First-Person NPC View qua Claude API
- Dream System · Memory Theater · Time Travel Mode
- Init từ 16900ms+

---

## 🌍 KIẾN TRÚC THẾ GIỚI

### Stack Công Nghệ
```
Frontend:  Vanilla JavaScript ES6+ (NO framework, NO build tool)
3D:        Three.js (dynamic import — worldViewer3D.js)
Storage:   localStorage (browser-only, NO backend DB)
Server:    Node.js + serve.js (static file server, port 5000)
API Proxy: /api/claude → Anthropic API (để bảo mật API key)
Fonts:     Google Fonts (Cinzel, Noto Serif SC)
Entry:     index.html
```

### Luồng Dữ Liệu
```
Browser localStorage
  ↕ (save/load)
app.js (state manager)
  ↕ (window.world, window.npcs, window.sects, window.countries, window.year)
All engines (read/write global state)
  ↕ (gameTick chain — 31 hooks)
Simulation tick (setInterval trong app.js)
```

---

## 🌐 KIẾN TRÚC ENGINE

### Layer 1 — Core Foundation
```
app.js ──────────────────── Core loop, state, save/load
├── worldTemplates.js      World creation templates
├── worldHub.js            World Hub V6 (multi-world UI)
├── multiWorldSystem.js    World management
└── living-world-engine.js NPC AI (soul/ambition/memory)
```

### Layer 2 — Simulation Systems
```
Economy:     economySystem → economyEngine → economyEngineV2 → worldMarketplace → economyAuditSystem
War:         warEngine → territorySystem → territoryWarSystem
Diplomacy:   diplomaticEngine(V1) → allianceEngine/treatyEngine/sanctionEngine/worldCouncilEngine(V24) → diplomacyEngine(hub)
Kingdom:     kingdomEngine+AI → empireEngine+AI → dynastyEngine → successionEngine → nobleHouseEngine → bloodlineEngine → livingCivilizationAI
World:       worldEventEngine → continentEngine → ageEngine → mythologyEngine → technologyEngine
             politicalReligionEngine → cultureHeritageEngine → migrationEngine → emergentCivilization
             historicalTimeline → worldMemoryEngine → aiStoryEngine → heavenlyDaoEngine
```

### Layer 3 — Extended V25-V31
```
V25: worldEventEngineV25, ageEngineV25, disasterEngine, plagueEngine, economicCrisisEngine
V26: continentEngineV26, migrationEngineV26, continentalPoliticsEngine
V27: navalEngine, fleetEngine, pirateEngine, colonyEngine, oceanTradeEngine
V29: sectEngineV29, sectWarEngineV29, guildEngineV29
V30: realmEngineV30, divineBeingEngine, divineWarEngine, pantheonEngineV30, portalEngineV30
V31: lootEngineV31, worldBossEngineV31, dungeonEngineV31, raidEngineV31, invasionEngineV31, bossEvolutionEngineV31, legendaryHuntEngineV31
```

### Layer 4 — Advanced Systems V35-V49
```
V35: multiverseEngine, universeManager, universeRegistry, portals, travel, economy, war, map
V36: timeline (9 files)
V37: universeGenerator, universeLaw, universeLifecycle, universeObservatory
V38: civEvolutionEngineV38
V39: multiverseWarSystem, conquestSystem, multiverseInvasion, multiverseAlliance, multiverseWarAnalytics
V40: creatorRace/God/Nation/Boss/Item/UniverseFactory (6 files)
V41: creatorBrain, creatorAI, creatorSuggestion, balanceAnalyzer, loreGenerator, eventGenerator, creatorReports (7 files)
V42: mythologyDatabase/GodSystem/CreatureSystem/ArtifactSystem/LoreSystem/Registry (6 files)
V43: worldAgeEngine, ageProgressionEngine, ageEventEngine, ageAnalytics, ageRegistry (5 files)
V44: raceEvolutionCore, raceAbilityEngine, raceWarEngine, raceRelationEngine, raceEvolutionRegistry (5 files)
V45: ecoClimateEngine, ecoResourceEngine, ecoCreatureEngine, ecoDisasterEngine, ecoRegistry (5 files)
V47: legendEngineV47, fameSystemV47, heroRegistryV47 (3 files)
V48: globalDisasterCoreV48, anomalyEngineV48, multiverseDisasterV48, disasterRegistryV48 (4 files)
V49: governmentSystemV49, politicalFactionV49, politicalCrisisV49, politicsRegistryV49 (4 files)
V50: playerCoreV50, professionSystemV50, playerAchievementV50, playerRegistryV50 (4 files)
V51: creatorAuthorityEngineV51, miracleSystemV51, prophecySystemV51, globalEventControlV51, godAuditPanelV51, creatorDashboardV51 (6 files)
V52: playerEconomyCoreV52, playerMarketplaceV52, businessSystemV52, taxationSystemV52, economyRegistryV52 (5 files)
V53: guildCoreV53, guildAllianceV53, playerEmpireV53, guildWarV53, guildRegistryV53 (5 files)
V54: tradeNetworkCoreV54, goodsSystemV54, supplyDemandV54, blackMarketV54, tradeRegistryV54 (5 files) ← NEWEST
```

---

## 📋 BÁO CÁO TOÀN BỘ HỆ THỐNG UI (87 tabs)

### Group 1: Luôn hiển thị (Always visible)
| Icon | Tab | Panel ID | Engine |
|---|---|---|---|
| 🌍 | Thế Giới | world | app.js |
| 👥 | Sinh Linh | npcs | app.js |
| ⚔️ | War Engine | war-engine | warEngine.js |
| 📋 | Nhật Ký | logs | app.js |
| 🐉 | Linh Vật | spirit-beast | spiritBeastSystem.js |

### Group 2: Tabs cơ bản (hiện sau khi tạo world)
| Icon | Tab | Panel ID | Engine |
|---|---|---|---|
| ⚔️ | Tông Môn | sects | app.js |
| 🏳 | Quốc Gia | countries | app.js |
| 💀 | Boss | boss | app.js |
| 🏆 | Leaderboard | leaderboard | app.js |
| ⚔️ | Tông Chiến | sectwars | app.js |
| 🗝️ | Bí Cảnh | secret-realms | dungeonSystem.js |
| 🏚️ | Dungeon | dungeon | dungeonSystem.js |
| 👤 | Nhân Vật | player | playerSystem.js |
| 🌐 | 3D World | world3d | worldViewer3D.js |
| 🗺️ | Bản Đồ | worldmap | worldMapSystem.js |

### Group 3: Economy tabs
| Panel ID | Engine |
|---|---|
| economy | economySystem.js |
| economy-engine | economyEngine.js |
| dashboard | economyAuditSystem.js (no nav btn — sub-panel) |

### Group 4: War & Territory
| Panel ID | Engine |
|---|---|
| territories | territorySystem.js |
| territory-war | territoryWarSystem.js |

### Group 5: History & Story
| Panel ID | Engine |
|---|---|
| world-history | historicalTimeline.js |
| historical-timeline | historicalTimeline.js |
| world-chronicle | aiStoryEngine.js |
| world-memory | worldMemoryEngine.js |
| world-event | worldEventEngine.js |

### Group 6: Civilization
| Panel ID | Engine |
|---|---|
| mythology | mythologyEngine.js |
| technology | technologyEngine.js |
| culture-heritage | cultureHeritageEngine.js |
| political-religion | politicalReligionEngine.js |
| religion | religionEngine.js |
| age | ageEngine.js |
| continent | continentEngine.js |
| migration | migrationEngine.js |
| living-civ | livingCivilizationAI.js |
| heavenly-dao | heavenlyDaoEngine.js |

### Group 7: Characters & Rankings
| Panel ID | Engine |
|---|---|
| hero-legend | heroLegendEngine.js |
| rankings | rankingsEngine.js |
| npc-reputation | npcReputationEngine.js |
| bloodlines | bloodlineEngine.js |
| noble-houses | nobleHouseEngine.js |
| succession | successionEngine.js |
| dynasty | dynastySystem.js |
| dynasty-engine | dynastyEngine.js |

### Group 8: Empire & Kingdom
| Panel ID | Engine |
|---|---|
| kingdoms | kingdomEngine.js |
| empires | empireEngine.js |
| empire | empireEngine.js |

### Group 9: Diplomacy
| Panel ID | Engine |
|---|---|
| diplomacy | diplomaticEngine.js |
| espionage | espionageEngine.js |
| diplomacy-v24 | diplomacyEngine.js |
| treaties-v24 | treatyEngine.js |
| world-council | worldCouncilEngine.js |
| intl-relations | diplomacyEngine.js |
| alliance-v24 | allianceEngine.js (no nav btn) |
| sanctions-v24 | sanctionEngine.js (no nav btn) |

### Group 10: V25 Extended Events
| Panel ID | Engine |
|---|---|
| world-event-v25 | worldEventEngineV25.js |
| age-v25 | ageEngineV25.js |
| disaster | disasterEngine.js |
| plague | plagueEngine.js |
| econ-crisis | economicCrisisEngine.js |

### Group 11: V26 Continental
| Panel ID | Engine |
|---|---|
| continent-v26 | continentEngineV26.js |
| migration-v26 | migrationEngineV26.js |
| cont-politics | continentalPoliticsEngine.js |

### Group 12: V27 Naval
| Panel ID | Engine |
|---|---|
| naval-v27 | navalEngine.js |
| naval-ocean | navalOceanEngine.js |
| pirates | pirateEngine.js |
| ocean-v27 | oceanTradeEngine.js |
| colonies | colonyEngine.js |

### Group 13: V29 Sect & Guild
| Panel ID | Engine |
|---|---|
| sect-v29 | sectEngineV29.js |
| sect-war-v29 | sectWarEngineV29.js |
| techniques-v29 | sectEngineV29.js |
| disciples-v29 | sectEngineV29.js |
| guild-v29 | guildEngineV29.js |

### Group 14: V30 Divine & Realm
| Panel ID | Engine |
|---|---|
| realm-v30 | realmEngineV30.js |
| divine-v30 | divineBeingEngine.js |
| domain-v30 | divineBeingEngine.js |
| divine-history-v30 | divineBeingEngine.js |
| divinewar-v30 | divineWarEngine.js |
| pantheon-v30 | pantheonEngineV30.js |
| portal-v30 | portalEngineV30.js |

### Group 15: V31 World Boss & Dungeon ← MỚI NHẤT
| Panel ID | Engine |
|---|---|
| worldboss-v31 | worldBossEngineV31.js |
| dungeon-v31 | dungeonEngineV31.js |
| raid-v31 | raidEngineV31.js |
| invasion-v31 | invasionEngineV31.js |
| hunt-v31 | legendaryHuntEngineV31.js |
| loot-v31 | lootEngineV31.js |

### Group 16: Utility
| Panel ID | Engine |
|---|---|
| project-status | projectStatusEngine.js |
| next-version | nextVersionEngine.js |

---

## 💾 BẢN ĐỒ DỮ LIỆU HOÀN CHỈNH

### Core Data (app.js manages)
```javascript
window.world      // World object (name, genre, year, template...)
window.npcs       // NPC array (soul, realm, stats, biography...)
window.sects      // Sect array
window.countries  // Country array
window.year       // Current simulation year
window.player     // Player object
window.heavenPoints // Heaven points for divine actions
```

### Engine Data (window.* globals)
```javascript
window.warsActive, window.warsHistory     // warEngine.js
window.allianceData                       // allianceEngine.js
window.treatyData                         // treatyEngine.js
window.sanctionData                       // sanctionEngine.js
window.kingdomData                        // kingdomEngine.js
window.empireData                         // empireEngine.js
window.guildV29Data                       // guildEngineV29.js
window.wbv31Data                          // worldBossEngineV31.js
window.dev31Data                          // dungeonEngineV31.js
window.rev31Data                          // raidEngineV31.js
window.iev31Data                          // invasionEngineV31.js
window.bevV31Data                         // bossEvolutionEngineV31.js
window.lhv31Data                          // legendaryHuntEngineV31.js
```

---

## 🔍 BUG ĐÃ PHÁT HIỆN

| # | Mức độ | Vị trí | Mô tả |
|---|---|---|---|
| 1 | Low | index.html line ~2860 | `data-panel="' + p + '"` — template literal không được xử lý, tạo ra nav button với giá trị sai |
| 2 | Low | index.html | `panel-alliance-v24` và `panel-sanctions-v24` có panel div nhưng không có nav button riêng |
| 3 | Low | warEngine.js | Duplicate alliance check còn thiếu |
| 4 | Low | webxrSystem.js | VR mode placeholder — không hoạt động thực tế |
| 5 | Medium | 13 dormant files | Có gameTick hook trong code nhưng không được load — nếu load thêm file có thể xung đột |

---

## 🏛️ V49 — CHÍNH TRỊ AI CHI TIẾT

### Chế Độ Chính Trị (8 loại)
| Chế Độ | Icon | Bonus | Rủi Ro |
|---|---|---|---|
| Quân Chủ | 👑 | Stability+15, Mil+10 | Coup15%, Succession25% |
| Đế Chế | 🏛️ | Stability+20, Mil+20 | Coup20%, CivilWar20% |
| Cộng Hòa | 🗳️ | Economy+15, Reform+20 | Protest20% |
| Thần Quyền | ⛪ | Religion+30, Stability+10 | Heresy25% |
| Quý Tộc | 🎭 | Economy+5, Mil+8 | Secession15% |
| Liên Bang | 🔗 | Economy+12, Reform+10 | Secession30% |
| Hội Đồng | 👥 | Stability+18, Economy+8 | Deadlock20% |
| Tùy Chỉnh | ⚙️ | - | Generic10% |

### Leader Traits (8 loại)
`AMBITIOUS(🔥)` · `DIPLOMATIC(🤝)` · `MILITARIST(⚔️)` · `CORRUPT(💰)` · `REFORMIST(📜)` · `ISOLATIONIST(🏔️)` · `EXPANSIONIST(🌐)` · `PIOUS(🙏)`

### Phe Phái (5 loại)
`CONSERVATIVE(🏰)` · `REFORMIST(📜)` · `MILITARIST(⚔️)` · `RELIGIOUS(⛪)` · `MERCHANT(💰)`

### Khủng Hoảng (5 loại × 4 cấp độ)
- ⚔️ **Đảo Chính**: Âm Mưu → Thất Bại → Thành Công → Cách Mạng Đẫm Máu
- 🔥 **Nội Chiến**: Xung Đột Nhỏ → Cục Bộ → Đại Nội Chiến → Tuyệt Diệt
- ✊ **Biểu Tình**: Bất Bình → Biểu Tình Lớn → Bạo Loạn → Cách Mạng Nhân Dân
- 👑 **Kế Vị**: Tranh Giành Nhẹ → Tranh Chấp → Nội Chiến Kế Vị → Sụp Đổ Vương Triều
- 🗺️ **Ly Khai**: Phong Trào → Tự Trị → Tuyên Bố Độc Lập → Ly Khai Hoàn Toàn

### Auto-Triggers
- `country.stability < 30` → random crisis
- `gov.leader.age > 75` → SUCCESSION_CRISIS
- `disasterData.activeDisasters` → PROTEST

## 📊 THỐNG KÊ PHÁT TRIỂN

| Chỉ số | V48 | V49 |
|---|---|---|
| Tổng file JS trên disk | 202 | **206** |
| Số file được load | 201 | **205** |
| gameTick hooks hoạt động | 87 | **90** |
| localStorage keys | 127+ | **130+** |
| UI panels | 198 | **204** |
| UI tabs sidebar | 67 | **67** |

---

## 🚀 ĐỀ XUẤT PHIÊN BẢN TIẾP THEO

### V50 — Kỷ Nguyên Người Chơi (ĐỀ XUẤT TIẾP THEO)
Cho phép người chơi thực sự tham gia vào nền chính trị thế giới:
- Chọn quốc gia để cai trị trực tiếp
- Ra lệnh cho lãnh đạo AI
- Tham gia / can thiệp vào khủng hoảng
- Đặc quyền Thánh Thần — thay đổi chế độ / áp đặt lãnh đạo
- Liên kết với V49 govData / factionData / crisisData

---

*Báo cáo được tạo tự động bằng cách quét mã nguồn thực tế — 2026-06-13 — V49*
