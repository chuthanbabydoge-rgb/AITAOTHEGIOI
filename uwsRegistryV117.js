(function() {
  "use strict";

  // V117 — UWS Registry
  // Đăng ký metadata, expose helper diagnostics, tích hợp với PUOS

  var REGISTRY = {
    version:     117,
    name:        "Unified World State",
    codename:    "UWS",
    files: [
      "uwsWorldAggV117.js",
      "uwsEntityAggV117.js",
      "uwsEventAggV117.js",
      "uwsCoreV117.js",
      "uwsRegistryV117.js",
    ],
    savesData:   false,
    overwrites:  false,
    readOnly:    true,
    initTime:    26500,
  };

  // ── Diagnostic: in ra trạng thái UWS ──
  window.uwsDiag = function() {
    if (!window.UWS) {
      console.warn("[UWS V117] window.UWS chưa sẵn sàng. Gọi window.uwsRefresh() trước.");
      return null;
    }
    var s = window.UWS.summary;
    console.group("🌐 UWS V117 Diagnostic");
    console.log("World:       ", s.worldName, "(", s.genre, ") · Năm", s.currentYear, "·", s.currentAge);
    console.log("Population:  ", s.totalPopulation.toLocaleString());
    console.log("Entities:    ", "NPC alive=" + s.aliveNPCs, "| Kingdom=" + s.totalKingdoms, "| Empire=" + s.totalEmpires, "| Civ=" + s.totalCivs, "| Species=" + s.totalSpecies);
    console.log("Events:      ", "Wars=" + s.activeWars, "| Disasters=" + s.activeDisasters, "| Plagues=" + s.activePlagues);
    console.log("Tick:        ", window.UWS._tick, "| Session:", window.UWS._sessionAge + "s");
    console.log("Last Update: ", new Date(window.UWS._lastUpdated).toLocaleTimeString());
    console.groupEnd();
    return window.UWS.summary;
  };

  // ── Registry info ──
  window.uwsGetRegistry = function() { return REGISTRY; };

  // ── Kiểm tra UWS có sẵn sàng không ──
  window.uwsIsReady = function() {
    return !!(window.UWS && window.UWS._version === 117);
  };

  // ── Patch PUOS panels: inject UWS summary data vào header stats ──
  function patchPUOS() {
    // Khi PUOS render My Universe panel, các stat card sẽ được cập nhật từ UWS
    var _orig = window.puosRenderMyUniverse;
    if (typeof _orig !== "function") return;
    window.puosRenderMyUniverse = function() {
      if (_orig) _orig.apply(this, arguments);
      // Sau khi render xong, refresh UWS và cập nhật stats nếu cần
      setTimeout(function() {
        if (typeof window.uwsRefresh === "function") window.uwsRefresh();
      }, 100);
    };
  }

  // ── Expose cho Jarvis / AI systems ──
  window.uwsGetForAI = function() {
    if (!window.UWS) return { error: "UWS not ready" };
    var s = window.UWS.summary;
    var w = window.UWS.world || {};
    return {
      worldName:    s.worldName,
      genre:        s.genre,
      year:         s.currentYear,
      age:          s.currentAge,
      population:   s.totalPopulation,
      npcsAlive:    s.aliveNPCs,
      kingdoms:     s.totalKingdoms,
      empires:      s.totalEmpires,
      civs:         s.totalCivs,
      wars:         s.activeWars,
      disasters:    s.activeDisasters,
      plagues:      s.activePlagues,
      top5NPCs:     (window.UWS.entities && window.UWS.entities.npcs) ? window.UWS.entities.npcs.top5 : [],
      recentEvents: (window.UWS.events && window.UWS.events.worldEvents) ? window.UWS.events.worldEvents.recent : [],
    };
  };

  function init() {
    // Patch PUOS sau khi init
    setTimeout(patchPUOS, 500);
    console.log("[UWS Registry V117] 📋 Registry khởi động — V117 Unified World State đã đăng ký.");
    console.log("[UWS Registry V117] Gọi window.uwsDiag() để xem trạng thái · window.uwsGet('summary') để lấy data.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 26500); });
  } else {
    setTimeout(init, 26500);
  }
})();
