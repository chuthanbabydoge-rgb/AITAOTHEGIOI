---
name: V83 Web Worker Engine
description: NPC AI offloaded to Web Worker background thread — 4 files, 4 task types, priority queue, auto-respawn
---

# V83 — Web Worker Engine

**Why:** 328 gameTick hooks block main thread. NPC AI (mood/wealth/health delta) và economy math có thể offload hoàn toàn sang background thread mà không cần SharedArrayBuffer.

## 4 Files

| File | Context | Save Key | Init |
|---|---|---|---|
| npcAIWorker.js | Web Worker standalone (KHÔNG phải IIFE, không có window) | — | Worker |
| webWorkerEngine.js | Main thread coordinator | cgv6_web_worker_v83 | 22400ms |
| workerPoolManager.js | Priority task queue, ephemeral | — | 22500ms |
| webWorkerRegistryV83.js | UI inject creator-hub-v32 | — | 22600ms |

## Quan Trọng: Worker Pattern

- `npcAIWorker.js` KHÔNG có IIFE, không có `window`, chỉ dùng `self.onmessage`
- Serialize data qua `JSON.parse(JSON.stringify(batch))` trước khi postMessage (tránh transferable objects)
- Apply results về `window.npcs[i]` trên main thread sau khi nhận message
- Sau khi apply gọi `window.npcCacheInvalidate()` để invalidate V82 NPC cache

## 4 Task Types

- `PROCESS_NPC_AI` — mood/happiness/health/wealth/power delta · every 10 ticks · max 150 NPCs
- `PROCESS_ECONOMY` — growth/inflation per country · every 30 ticks · max 30 countries
- `PROCESS_RELATIONSHIPS` — relationship score drift · every 45 ticks · max 50 NPCs
- `PROCESS_HISTORY_SCORE` — civ score từ event log · every 60 ticks · max 200 events

## Public API
```javascript
window.ww83DispatchNPCAI()              // dispatch batch ngay
window.ww83QueueTask({ type, data, priority, callback })  // priority 1=high/2=normal/3=low
window.ww83GetStatus()                  // { supported, ready, enabled, pending, stats }
window.ww83RestartWorker()              // terminate + respawn
window.ww83ToggleEnabled()             // bật/tắt offloading
window.ww83GetPoolStatus()             // pool info + task history
```

## How to Apply
- V84+ có thể thêm task types vào npcAIWorker.js (case trong switch self.onmessage)
- Không trùng với living-world-engine.js (V83 là delta-based, không replace decision logic)
- Next version init từ 22700ms+
