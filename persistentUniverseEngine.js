(function() {
  "use strict";
  const SAVE_KEY = "cgv6_persistent_univ_v55";

  const REAL_MS_PER_GAME_YEAR = 60000;

  window.persistentUnivData = {
    enabled: true,
    lastOnlineTimestamp: null,
    lastOfflineDurationMs: 0,
    lastOfflineDurationYears: 0,
    totalRealTimeMs: 0,
    totalGameYearsSimulated: 0,
    sessionStartTimestamp: null,
    tickCount: 0,
    offlinePending: false,
    unifiedTickLog: [],
    version: "V55"
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.persistentUnivData)); } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) {
        var parsed = JSON.parse(d);
        Object.assign(window.persistentUnivData, parsed);
      }
    } catch(e) {}
  }

  function calcOfflineTime() {
    var data = window.persistentUnivData;
    if (!data.lastOnlineTimestamp) return 0;
    var now = Date.now();
    var elapsed = now - data.lastOnlineTimestamp;
    if (elapsed < 5000) return 0;
    return elapsed;
  }

  window.puv55GetOfflineYears = function() {
    return window.persistentUnivData.lastOfflineDurationYears;
  };

  window.puv55GetOfflineMs = function() {
    return window.persistentUnivData.lastOfflineDurationMs;
  };

  window.puv55GetStats = function() {
    var d = window.persistentUnivData;
    return {
      totalRealTimeMs: d.totalRealTimeMs,
      totalGameYearsSimulated: d.totalGameYearsSimulated,
      lastOfflineDurationMs: d.lastOfflineDurationMs,
      lastOfflineDurationYears: d.lastOfflineDurationYears,
      offlinePending: d.offlinePending,
      tickCount: d.tickCount,
      sessionStartTimestamp: d.sessionStartTimestamp
    };
  };

  window.puv55AddTickLog = function(entry) {
    var log = window.persistentUnivData.unifiedTickLog;
    log.unshift({ year: window.year || 0, ts: Date.now(), msg: entry });
    if (log.length > 50) log.length = 50;
  };

  window.puv55GetTickLog = function() {
    return window.persistentUnivData.unifiedTickLog;
  };

  window.puv55GetMsPerGameYear = function() {
    return REAL_MS_PER_GAME_YEAR;
  };

  window.persistentUniverseTick = function() {
    var d = window.persistentUnivData;
    d.tickCount++;
    d.lastOnlineTimestamp = Date.now();
    if (d.tickCount % 10 === 0) save();
  };

  function init() {
    load();

    var data = window.persistentUnivData;
    data.sessionStartTimestamp = Date.now();

    var offlineMs = calcOfflineTime();
    if (offlineMs > 0) {
      var offlineYears = Math.floor(offlineMs / REAL_MS_PER_GAME_YEAR);
      data.lastOfflineDurationMs = offlineMs;
      data.lastOfflineDurationYears = offlineYears;
      data.offlinePending = offlineYears > 0;
      data.totalRealTimeMs += offlineMs;
      data.totalGameYearsSimulated += offlineYears;

      if (offlineYears > 0) {
        window.puv55AddTickLog("🌙 Vắng " + _fmtDuration(offlineMs) + " → mô phỏng " + offlineYears + " năm offline");
        if (typeof window.htAddEvent === "function") {
          window.htAddEvent({ year: window.year || 0, type: "persistent", title: "🌙 Hệ thống Offline: " + offlineYears + " năm lịch sử đã trôi qua", color: "#9b59b6" });
        }
      }
    } else {
      data.lastOfflineDurationMs = 0;
      data.lastOfflineDurationYears = 0;
      data.offlinePending = false;
    }

    data.lastOnlineTimestamp = Date.now();
    save();

    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      window.persistentUniverseTick();
    };

    console.log("[PersistentUniverseEngine V55] 🌌 Vũ Trụ Liên Tục khởi động — Offline: " + (data.lastOfflineDurationYears || 0) + " năm · Real-time tracking · Unified tick sẵn sàng.");
  }

  function _fmtDuration(ms) {
    if (ms < 60000) return Math.floor(ms/1000) + " giây";
    if (ms < 3600000) return Math.floor(ms/60000) + " phút";
    if (ms < 86400000) return Math.floor(ms/3600000) + " giờ";
    return Math.floor(ms/86400000) + " ngày";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 8300); });
  } else {
    setTimeout(init, 8300);
  }
})();
