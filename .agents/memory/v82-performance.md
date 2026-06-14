---
name: V82 Performance Optimization
description: Performance monitor + profiler với 4 optimization layers — NPC Cache, Render Cache, Save Batcher, Lazy Tick
---

# V82 — Performance Optimization Pass

**Why:** Project có 328 gameTick hooks, 713 innerHTML, 820 localStorage ops — cần optimization layer mà không phá engines cũ.

## 2 Files

| File | Key | Init |
|---|---|---|
| performanceMonitor.js | cgv6_perf_monitor_v82 | 22200ms |
| performanceProfiler.js | cgv6_perf_profiler_v82 | 22300ms |

## Public API Quan Trọng (engines mới NÊN dùng)

```javascript
// NPC Cache — thay thế window.npcs.filter()
window.getNPCsAlive()           // cached, invalidate khi length thay đổi
window.getNPCsHeroes()          // power > 70 || isHero
window.getNPCsByJob(job)        // theo nghề
window.npcCacheInvalidate()     // force invalidate

// Render Cache — thay thế re-render mỗi timer
window.renderCache.get(key, year)    // null nếu expired (TTL 5s)
window.renderCache.set(key, html)    // lưu cache
window.renderCache.invalidate(key)   // xóa 1 key
window.renderCache.invalidateAll()   // xóa tất cả

// Save Batcher — thay thế localStorage.setItem()
window.perfSave(key, data)           // debounce 600ms
window.perfSave(key, data, true)     // immediate
window.perfSaveFlush()               // force flush

// Lazy Tick — thay thế const _orig gameTick chain (engines V83+)
window.perfTick.registerCritical(fn, id)  // mỗi tick
window.perfTick.registerNormal(fn, id)    // mỗi 3 ticks
window.perfTick.registerLazy(fn, id)      // mỗi 15 ticks
window.perfTick.unregister(id)

// Bonus
window.perfIsVisible()               // false khi tab ẩn → skip canvas
window.perfVirtualize(arr, fn, 20)   // render 20 items thay vì toàn bộ
window.perfIdleQueue.push(fn)        // heavy tasks khi browser rảnh
```

## How to Apply
- Engines V83+ dùng perfTick.registerLazy() thay vì chain gameTick trực tiếp
- Next version init từ 22400ms+
- Không trùng với universeHealthSystem V55, universeHealthMonitor V81, godAuditPanel V51
