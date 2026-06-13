(function() {
  "use strict";
  const SAVE_KEY = "cgv6_mp_worldsync_v34";

  window.mpSyncData = {
    lastSync: 0,
    snapshots: {},
    version: "V34"
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.mpSyncData)); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.mpSyncData = Object.assign(window.mpSyncData, JSON.parse(d));
    } catch(e) {}
  }

  function _toArr(val) {
    if (!val) return [];
    return Array.isArray(val) ? val : Object.values(val);
  }

  // Tạo snapshot thế giới hiện tại (chỉ công khai, không nhạy cảm)
  function buildSnapshot() {
    const kingdoms = _toArr(window.kingdomData && window.kingdomData.kingdoms)
      .filter(k => !k.collapsed).slice(0, 20)
      .map(k => ({ id: k.id, name: k.name, power: k.power||0, population: k.population||0, stage: k.stage||"?" }));
    const empires = _toArr(window.empireData && window.empireData.empires)
      .filter(e => !e.collapsed).slice(0, 10)
      .map(e => ({ id: e.id, name: e.name, power: e.power||0, territories: (e.territories||[]).length }));
    const wars = (window.warsActive || []).slice(0, 10)
      .map(w => ({ attacker: w.attacker, defender: w.defender, year: w.startYear }));
    const bosses = ((window.wbv31Data && window.wbv31Data.activeBosses) || []).slice(0, 5)
      .map(b => ({ name: b.name, tier: b.tier, hp: Math.round(b.hp||0) }));
    const topNpcs = (window.npcs || [])
      .filter(n => n.alive || n.alive === undefined)
      .sort((a,b) => (b.power||b.qi||0) - (a.power||a.qi||0)).slice(0,5)
      .map(n => ({ name: n.name, realm: n.realm||"?", power: n.power||n.qi||0 }));
    const deities = ((window.divineBeingData && window.divineBeingData.deities) || []).slice(0,5)
      .map(d => ({ name: d.name, domain: d.domain||"?", tier: d.tier||"?" }));

    return {
      sessionId: window.mpData && window.mpData.sessionId,
      year: window.year || 0,
      worldName: window.world && window.world.name,
      kingdoms, empires, wars, bosses, topNpcs, deities,
      stability: typeof window.waGetWorldStabilityScore === 'function' ? window.waGetWorldStabilityScore() : 50,
      ts: Date.now()
    };
  }

  // Gửi snapshot tới các tab khác
  window.mpSyncWorld = function() {
    if (!window.world || !window.world.name) return;
    const snapshot = buildSnapshot();
    window.mpSyncData.snapshots[snapshot.sessionId || "local"] = snapshot;
    window.mpSyncData.lastSync = Date.now();
    save();
    if (typeof window.mpBroadcast === 'function') {
      window.mpBroadcast("world_sync", snapshot);
    }
  };

  // Nhận snapshot từ tab khác
  window.mpReceiveWorldSync = function(msg) {
    if (!msg || !msg.data) return;
    const snap = msg.data;
    if (snap && snap.sessionId) {
      window.mpSyncData.snapshots[snap.sessionId] = snap;
      save();
      // Thêm vào event feed nếu có thay đổi lớn
      if (snap.wars && snap.wars.length > 0 && typeof window.efAddFeedItem === 'function') {
        // Only log first war per sync (avoid spam)
      }
    }
  };

  // Lấy tổng hợp thế giới từ tất cả tab
  window.mpGetWorldSummary = function() {
    const allSnaps = Object.values(window.mpSyncData.snapshots || {});
    if (!allSnaps.length) return null;
    // Lấy snapshot mới nhất
    return allSnaps.sort((a,b) => (b.ts||0) - (a.ts||0))[0];
  };

  // Lấy danh sách kingdoms từ tất cả snapshots (cross-tab)
  window.mpGetAllKingdoms = function() {
    const allSnaps = Object.values(window.mpSyncData.snapshots || {});
    const seen = {};
    const result = [];
    allSnaps.forEach(snap => {
      (snap.kingdoms || []).forEach(k => {
        if (!seen[k.id || k.name]) {
          seen[k.id || k.name] = true;
          result.push(k);
        }
      });
    });
    // Thêm local kingdoms
    const localKingdoms = _toArr(window.kingdomData && window.kingdomData.kingdoms).filter(k => !k.collapsed);
    localKingdoms.forEach(k => {
      if (!seen[k.id || k.name]) result.push({ id: k.id, name: k.name, power: k.power||0, population: k.population||0, stage: k.stage||"?" });
    });
    return result;
  };

  // Tick sync mỗi 30 tick
  let _syncTick = 0;
  function syncTick() {
    _syncTick++;
    if (_syncTick % 30 === 0) window.mpSyncWorld();
  }

  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); syncTick(); };
    console.log("[WorldSyncEngine V34] 🔄 Đồng Bộ Thế Giới khởi động — Snapshot mỗi 30 ticks · BroadcastChannel sync.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 2550); });
  } else {
    setTimeout(init, 2550);
  }
})();
