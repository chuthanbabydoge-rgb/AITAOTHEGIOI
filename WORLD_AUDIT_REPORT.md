# WORLD AUDIT REPORT — Creator God V6
> Báo cáo trạng thái thế giới hiện tại dựa trên code thực tế
> Ngày: 2026-06-13 (cập nhật sau V49 — Hệ Thống Chính Trị AI)
> Tổng: 206 JS files · 204 panels · 67 nav buttons · 130+ save keys · 90 gameTick hooks

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
V49: governmentSystemV49, politicalFactionV49, politicalCrisisV49, politicsRegistryV49 (4 files) ← NEWEST
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
