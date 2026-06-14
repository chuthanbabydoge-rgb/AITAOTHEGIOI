# CLOUD ARCHITECTURE — Creator God V6
> Scale Design Document — Multi Region · Multi Tenant · World Isolation
> Version: V85 — Cloud Scale Pass
> Ngày tạo: 2026-06-14

---

## 🎯 Mục Tiêu

Chuẩn bị Creator God V6 scale từ single-instance localStorage lên kiến trúc cloud phân tán, hỗ trợ:
- **Multi Region**: Thế giới chạy trên nhiều vùng địa lý
- **Multi Tenant**: Nhiều Creator God độc lập cùng tồn tại
- **World Isolation**: Mỗi thế giới chạy trong shard riêng biệt

---

## 🗺️ Tổng Quan Kiến Trúc

```
┌─────────────────────────────────────────────────────────────┐
│                    UNIVERSE CLUSTER MANAGER                  │
│              (universeClusterManager.js — V85)               │
│  Extends: universeClusterEngine.js (V80)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   ┌───────────┐    ┌───────────┐    ┌───────────┐
   │ REGION-AS │    │ REGION-EU │    │ REGION-AP │
   │ Asia      │    │ Europe    │    │ Asia-Pac  │
   └─────┬─────┘    └─────┬─────┘    └─────┬─────┘
         │                │                │
    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
    │ TENANT  │      │ TENANT  │      │ TENANT  │
    │ Pool AS │      │ Pool EU │      │ Pool AP │
    └────┬────┘      └────┬────┘      └────┬────┘
         │                │                │
   ┌─────▼──────────────────────────────────────┐
   │              WORLD SHARD SYSTEM             │
   │           (worldShardSystem.js — V85)        │
   │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
   │  │ SHARD-01 │ │ SHARD-02 │ │ SHARD-03 │    │
   │  │ World A  │ │ World B  │ │ World C  │    │
   │  │ Isolated │ │ Isolated │ │ Isolated │    │
   │  └──────────┘ └──────────┘ └──────────┘    │
   └─────────────────────────────────────────────┘
```

---

## 🌍 Multi Region Design

### 3 Vùng Chính

| Region ID | Tên | Latency Target | World Capacity |
|---|---|---|---|
| `REGION-AS` | Asia (Primary) | < 50ms | 10,000 worlds |
| `REGION-EU` | Europe | < 80ms | 8,000 worlds |
| `REGION-AP` | Asia-Pacific | < 60ms | 8,000 worlds |

### Region Routing
- **Geo-routing**: Creator → Region gần nhất
- **Failover**: Auto-switch region khi health < 60%
- **Replication**: World data sync mỗi 300 game-years
- **Read replicas**: Mỗi region có read-only copy của Active worlds

### Region Health Metrics
```javascript
// window.ucm85GetRegionHealth(regionId)
{
  regionId: "REGION-AS",
  status: "ONLINE",           // ONLINE | DEGRADED | OFFLINE
  worldCount: 3420,
  tenantCount: 156,
  shardCount: 128,
  cpuLoad: 0.42,              // 0.0 → 1.0
  memoryUsage: 0.61,
  networkLatency: 38,         // ms
  replicationLag: 0,          // game-years behind
  lastHealthCheck: 1234567890
}
```

---

## 👥 Multi Tenant Design

### Tenant Tiers

| Tier | Max Worlds | Max NPCs/World | AI Calls/Day | Shards |
|---|---|---|---|---|
| `FREE` | 1 | 50 | 10 | Shared |
| `CREATOR` | 5 | 200 | 100 | Shared |
| `MASTER` | 20 | 500 | 500 | Dedicated |
| `DIVINE` | 100 | 2000 | Unlimited | Dedicated + Multi-Region |

### Tenant Isolation
- **Namespace**: `cgv6_tenant_{tenantId}_world_{worldId}_*` (localStorage prefix)
- **Quota enforcement**: CPU ticks, AI calls, NPC count, Save operations
- **Resource sharing**: FREE/CREATOR share shard pools; MASTER/DIVINE get dedicated shards
- **Data isolation**: Tenant data không thể cross-read

### Tenant Schema
```javascript
{
  tenantId: "tenant_uuid_v4",
  creatorId: "creator_uuid",
  tier: "CREATOR",
  region: "REGION-AS",
  quota: {
    maxWorlds: 5,
    maxNPCsPerWorld: 200,
    aiCallsPerDay: 100,
    aiCallsUsedToday: 23,
    storageBytes: 52428800,   // 50MB
    storageUsed: 12451234
  },
  worlds: ["world_id_1", "world_id_2"],
  shards: ["shard_id_1"],
  createdAt: 1234567890,
  lastActiveAt: 1234567890
}
```

---

## 🔒 World Isolation Design

### Shard Architecture

Mỗi **World Shard** là một execution context độc lập:

```
SHARD-{uuid}
├── worldState          ← window.world snapshot
├── npcPool             ← NPCs thuộc world này
├── countryPool         ← Countries thuộc world này
├── engineStates        ← States của tất cả engines cho world này
├── saveBuffer          ← Batched save queue (debounce 600ms)
├── tickScheduler       ← Isolated gameTick với tốc độ riêng
├── aiQuota             ← AI call budget riêng
└── isolation boundary  ← Không read/write vào shards khác
```

### Isolation Levels

| Level | Mô Tả | Use Case |
|---|---|---|
| `SOFT` | Shared process, namespace-isolated data | FREE tier |
| `MEDIUM` | Separate Web Worker per shard | CREATOR tier |
| `HARD` | Dedicated iframe sandbox + postMessage API | MASTER tier |
| `DIVINE` | Separate process + encrypted state | DIVINE tier |

### Cross-Shard Communication
Chỉ được phép qua **postMessage API** với protocol:
```javascript
// Gửi event cross-shard (VD: Cross-World Influence V80)
window.wss85SendCrossShardEvent({
  fromShard: "shard_a",
  toShard: "shard_b",
  eventType: "CROSS_WORLD_INFLUENCE",
  payload: { influenceType: "cultural", strength: 3 },
  authorized: true   // phải có tenant permission
});
```

---

## 📦 Data Layer

### Storage Strategy

| Layer | Technology | Scope | TTL |
|---|---|---|---|
| L1 Cache | In-memory (renderCache) | Per-tick | 5s |
| L2 Hot | localStorage (current) | Per-session | Persistent |
| L3 Warm | IndexedDB | Per-tenant | 30 days |
| L4 Cold | Cloud Object Storage | Archive | Indefinite |

### Save Key Naming Convention (Cloud-Ready)
```
Current:  cgv6_{system}_{version}
Cloud:    cgv6_t{tenantId}_w{worldId}_{system}_{version}

VD:       cgv6_tABC123_wXYZ789_universe_kernel_v81
```

---

## ⚡ Performance Targets

| Metric | Current | V85 Target | Scale Target |
|---|---|---|---|
| Worlds per instance | 1 | 1 (isolated) | 10,000 (cloud) |
| gameTick hooks | 144+ | 144+ (unchanged) | Parallel per shard |
| NPC AI latency | Main thread | Web Worker (V83) | Worker per shard |
| Save ops/s | 820 (V82 fixed) | Batched 600ms | Cloud batch 5s |
| Cross-world events | Sync | Async queue | Async + eventual consistency |

---

## 🔧 Integration với Existing Systems

### Tương Thích 100% Ngược

Tất cả V1–V84 systems **không thay đổi**. Cloud layer là wrapper:

```
[V1–V84 Engines] → unchanged, run inside shard
[worldShardSystem.js V85] → manages shard lifecycle
[universeClusterManager.js V85] → extends uclu80, adds cloud topology
```

### Dependency Map

```
universeClusterManager.js (V85)
  extends: universeClusterEngine.js (V80) → window.uclu80*
  reads:   universeHubCore.js (V73) → window.universeHubV73Data
  reads:   multiverseEvolutionEngine.js (V80) → window.mevo80GetAlive()
  reads:   puosCore.js (V81) → window.puosCoreV81Data

worldShardSystem.js (V85)
  reads:   webWorkerEngine.js (V83) → window.ww83QueueTask()
  reads:   performanceMonitor.js (V82) → window.perfMon82GetReport()
  reads:   aiCostManager.js (V84) → window.aiCostGetReport()
  writes:  window.htAddEvent() (history)
  extends: saveManager.js → perfSave() pattern
```

---

## 📋 Files Created — V85 Cloud Scale Pass

| File | Vai Trò | Save Key | Init |
|---|---|---|---|
| `cloudArchitecture.md` | Design document | — | — |
| `worldShardSystem.js` | World Isolation engine · Shard lifecycle · Multi-tenant quota | `cgv6_world_shard_v85` | 22900ms |
| `universeClusterManager.js` | Cloud-aware cluster manager · Multi-region topology · Extends uclu80 | `cgv6_universe_cluster_manager_v85` | 23000ms |
| `CLOUD_ARCHITECTURE_REPORT.md` | Report tổng kết | — | — |

---

## 🔮 Roadmap

### V85 (Current) — Foundation
- World Shard isolation (SOFT level)
- Tenant quota tracking
- Region topology metadata
- Cluster cloud topology (extends V80)

### V86 — Medium Isolation
- Web Worker per shard (MEDIUM level)
- IndexedDB migration layer
- Cross-shard message queue

### V87 — Full Cloud
- iframe sandbox isolation (HARD level)
- Cloud sync API endpoints
- Multi-region replication protocol
- Real-time tenant dashboard
