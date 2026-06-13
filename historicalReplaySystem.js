(function() {
  "use strict";
  const SAVE_KEY = "cgv6_hist_replay_v55";

  window.histReplayData = {
    events: [],
    wars: [],
    eraChanges: [],
    disasters: [],
    heroMoments: [],
    kingdomRiseFall: [],
    totalRecorded: 0,
    version: "V55"
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.histReplayData)); } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) Object.assign(window.histReplayData, JSON.parse(d));
    } catch(e) {}
  }

  function getYear() { return (typeof window.year === "number") ? window.year : 0; }

  window.hrs55RecordEvent = function(obj) {
    var entry = {
      id: "evt_" + Date.now() + "_" + Math.floor(Math.random()*9999),
      year: obj.year || getYear(),
      category: obj.category || "general",
      icon: obj.icon || "📜",
      title: obj.title || "Sự kiện lịch sử",
      detail: obj.detail || "",
      importance: obj.importance || 1,
      ts: Date.now()
    };
    window.histReplayData.events.unshift(entry);
    if (window.histReplayData.events.length > 200) window.histReplayData.events.length = 200;
    window.histReplayData.totalRecorded++;
    if (window.histReplayData.totalRecorded % 5 === 0) save();
    return entry.id;
  };

  window.hrs55RecordWar = function(attacker, defender, outcome, year) {
    var entry = { year: year || getYear(), attacker: attacker, defender: defender, outcome: outcome, ts: Date.now() };
    window.histReplayData.wars.unshift(entry);
    if (window.histReplayData.wars.length > 50) window.histReplayData.wars.length = 50;
    window.hrs55RecordEvent({ category: "war", icon: "⚔️", title: attacker + " vs " + defender, detail: "Kết quả: " + outcome, importance: 3, year: year });
  };

  window.hrs55RecordEraChange = function(fromEra, toEra, year) {
    var entry = { year: year || getYear(), fromEra: fromEra, toEra: toEra, ts: Date.now() };
    window.histReplayData.eraChanges.unshift(entry);
    if (window.histReplayData.eraChanges.length > 20) window.histReplayData.eraChanges.length = 20;
    window.hrs55RecordEvent({ category: "era", icon: "🌅", title: "Kỷ Nguyên Mới: " + toEra, detail: "Từ " + fromEra + " → " + toEra, importance: 5, year: year });
  };

  window.hrs55RecordDisaster = function(type, region, severity, year) {
    var entry = { year: year || getYear(), type: type, region: region, severity: severity, ts: Date.now() };
    window.histReplayData.disasters.unshift(entry);
    if (window.histReplayData.disasters.length > 50) window.histReplayData.disasters.length = 50;
    window.hrs55RecordEvent({ category: "disaster", icon: "🌋", title: type + " tại " + region, detail: "Mức độ: " + severity, importance: 3, year: year });
  };

  window.hrs55RecordHeroMoment = function(heroName, achievement, year) {
    var entry = { year: year || getYear(), hero: heroName, achievement: achievement, ts: Date.now() };
    window.histReplayData.heroMoments.unshift(entry);
    if (window.histReplayData.heroMoments.length > 50) window.histReplayData.heroMoments.length = 50;
    window.hrs55RecordEvent({ category: "hero", icon: "⭐", title: heroName + ": " + achievement, importance: 2, year: year });
  };

  window.hrs55RecordKingdomChange = function(name, change, year) {
    var entry = { year: year || getYear(), name: name, change: change, ts: Date.now() };
    window.histReplayData.kingdomRiseFall.unshift(entry);
    if (window.histReplayData.kingdomRiseFall.length > 100) window.histReplayData.kingdomRiseFall.length = 100;
    window.hrs55RecordEvent({ category: "kingdom", icon: "👑", title: name + ": " + change, importance: 2, year: year });
  };

  window.hrs55GetEvents = function(category, limit) {
    var evts = window.histReplayData.events;
    if (category && category !== "all") evts = evts.filter(function(e) { return e.category === category; });
    return evts.slice(0, limit || 50);
  };

  window.hrs55GetTimeline = function() {
    return window.histReplayData.events.slice().sort(function(a, b) { return b.year - a.year; });
  };

  window.hrs55GetStats = function() {
    var d = window.histReplayData;
    return {
      totalRecorded: d.totalRecorded,
      wars: d.wars.length,
      eraChanges: d.eraChanges.length,
      disasters: d.disasters.length,
      heroMoments: d.heroMoments.length,
      kingdomRiseFall: d.kingdomRiseFall.length
    };
  };

  window.hrs55GetJarvisChronicle = function() {
    var d = window.histReplayData;
    var yr = getYear();
    var lines = ["📜 **Biên Niên Sử Vũ Trụ** — Năm " + yr];
    if (d.eraChanges.length > 0) lines.push("🌅 Kỷ nguyên: " + d.eraChanges.length + " lần thay đổi · Hiện tại: " + (d.eraChanges[0] ? d.eraChanges[0].toEra : "Chưa xác định"));
    if (d.wars.length > 0) lines.push("⚔️ Chiến tranh: " + d.wars.length + " trận · Gần nhất: " + (d.wars[0] ? d.wars[0].attacker + " vs " + d.wars[0].defender : ""));
    if (d.disasters.length > 0) lines.push("🌋 Thảm họa: " + d.disasters.length + " lần");
    if (d.heroMoments.length > 0) lines.push("⭐ Anh hùng: " + d.heroMoments.length + " khoảnh khắc huyền thoại");
    lines.push("📊 Tổng " + d.totalRecorded + " sự kiện đã ghi vào lịch sử");
    return lines.join("\n");
  };

  function autoRecord() {
    var yr = getYear();

    if (typeof window.warsActive !== "undefined" && Array.isArray(window.warsActive)) {
      window.warsActive.forEach(function(w) {
        if (w && w.attacker && w.defender && !w._hrs55logged) {
          window.hrs55RecordWar(w.attacker, w.defender, "Đang diễn ra", yr);
          w._hrs55logged = true;
        }
      });
    }

    if (typeof window.ageV25Data !== "undefined" && window.ageV25Data && window.ageV25Data.currentAge) {
      var ageId = window.ageV25Data.currentAge;
      if (ageId !== window.histReplayData._lastKnownAge) {
        if (window.histReplayData._lastKnownAge) {
          window.hrs55RecordEraChange(window.histReplayData._lastKnownAge, ageId, yr);
        }
        window.histReplayData._lastKnownAge = ageId;
      }
    }
  }

  window.historicalReplayTick = function() {
    if (window.histReplayData._tickCount === undefined) window.histReplayData._tickCount = 0;
    window.histReplayData._tickCount++;
    if (window.histReplayData._tickCount % 50 === 0) {
      autoRecord();
      save();
    }
  };

  function init() {
    load();

    if (typeof window.owp55GetOfflineEvents === "function") {
      var offEvts = window.owp55GetOfflineEvents();
      offEvts.forEach(function(evt) {
        window.hrs55RecordEvent({ year: evt.year, category: evt.category, icon: evt.icon, title: "[Offline] " + evt.title, detail: evt.detail || "", importance: 2 });
      });
    }

    var _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); window.historicalReplayTick(); };

    save();
    console.log("[HistoricalReplaySystem V55] 📜 Tái Hiện Lịch Sử khởi động — " + window.histReplayData.totalRecorded + " sự kiện đã ghi · Biên niên sử sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 8500); });
  } else {
    setTimeout(init, 8500);
  }
})();
