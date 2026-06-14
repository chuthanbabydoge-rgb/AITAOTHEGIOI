---
name: V74 Creator Economy Architecture
description: Creator Economy Pass — Asset sharing system (6 types), World Blueprint export/import, UI inject vào Universe Hub V73
---

# V74 Creator Economy Pass

## 3 Files
- `creatorAssetEngine.js` — init 18100ms · save: `cgv6_creator_assets_v74`
- `worldBlueprintEngine.js` — init 18200ms · save: `cgv6_world_blueprints_v74`
- `creatorAssetRegistry.js` — init 18300ms · save: `cgv6_asset_registry_v74`

## Asset Types (6)
`race` · `creature` · `religion` · `technology` · `civilization` · `lore`

## Rarity Tiers (6)
`common(0)` · `uncommon(20+)` · `rare(50+)` · `epic(100+)` · `legendary(200+)` · `mythic(500+)` ← import count triggers

## Blueprint Share Code Format
```
CGV6-BP-W[8chars]  ← World
CGV6-BP-C[8chars]  ← Country
CGV6-BP-X[8chars]  ← Generic
```

## UI Pattern — EXPAND ONLY
- `creatorAssetRegistry.js` hooks `window.uhubV73Render` via const _orig pattern
- Injects Asset Economy section (height 260px) bên dưới Universe Hub content
- 6 tabs: Assets/Blueprints/Races/Creatures/Lore/Imports
- Render vào `uhub74-bottom` div trong `panel-universe-hub-v73`
- KHÔNG tạo sidebar tab mới · KHÔNG ghi đè universeHubRegistry.js

## Global API
```javascript
// Assets
window.ca74CreateAsset(typeId, name, desc, tags, stats)
window.ca74PublishAsset(assetId)
window.ca74ImportAsset(assetId)
window.ca74RateAsset(assetId, 1-5)
window.ca74GetAllPublic()  // DEMO_ASSETS + publicMarket
window.ca74GetMyAssets()
window.ca74GetImported()
window.ca74GetByType(typeId)

// Blueprints
window.wbp74ExportWorld()           // reads window.world · window.countries
window.wbp74ExportCountry(idx)
window.wbp74ImportBlueprint(bpId)
window.wbp74ShareBlueprint(bpId)
window.wbp74GetAll()                // DEMO_BLUEPRINTS + myBlueprints

// Registry (UI)
window.uhub74RenderAssets()         // trigger re-render Asset Economy section
window.ca74RegSwitchTab(tabId)      // switch to tab ('assets74','blueprints74',...)
```

## Demo Data
- 8 Demo Assets (1 per Demo World) — seeded vào ASSET74_DEMOS
- 4 Demo Blueprints (2 World / 1 Country / 1 Race) — seeded vào BLUEPRINT74_DEMOS

## KHÔNG Trùng Với
- `creatorEconomyEngine.js` V57 — CP system, passive income, milestones (khác hoàn toàn)
- `universeTemplateSystemV57.js` — world templates 5 presets (khác blueprint share)
- `contentRegistryV57.js` — content versioning V57 (khác asset registry V74)

## Next Version
V75 init bắt đầu từ **18400ms+**

**Why:** Asset economy cần riêng biệt với V57 creator economy (CP/income) — V74 tập trung vào chia sẻ nội dung (Race/Creature/Lore/Blueprint) giữa các Creator qua Universe Hub.
