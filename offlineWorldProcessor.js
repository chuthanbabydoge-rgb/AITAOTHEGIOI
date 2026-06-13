(function() {
  "use strict";
  const SAVE_KEY = "cgv6_offline_proc_v55";

  window.offlineWorldData = {
    processedOfflineYears: 0,
    lastProcessedAt: null,
    offlineEvents: [],
    warOutcomes: [],
    kingdomChanges: [],
    economicShifts: [],
    heroEvents: [],
    disasterEvents: [],
    totalEventsGenerated: 0,
    version: "V55"
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.offlineWorldData)); } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) Object.assign(window.offlineWorldData, JSON.parse(d));
    } catch(e) {}
  }

  function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  var WAR_OUTCOMES = ["Hòa bình được ký kết", "Chiến thắng quyết định", "Hiệp định đình chiến", "Sụp đổ quân sự", "Liên minh mới hình thành"];
  var KINGDOM_EVENTS = ["Vương triều mới lên ngôi", "Ổn định kinh tế phục hồi", "Nội chiến bùng phát", "Mở rộng lãnh thổ thành công", "Khủng hoảng kế vị xảy ra", "Cải cách chính trị lớn"];
  var ECON_EVENTS = ["Thị trường bùng nổ", "Suy thoái kinh tế", "Khám phá tài nguyên mới", "Chiến tranh thương mại", "Phát triển thương mại đột phá"];
  var HERO_EVENTS = ["Anh hùng huyền thoại xuất hiện", "Đại chiến anh hùng diễn ra", "Tu sĩ đột phá cảnh giới", "Thần quan mới thức tỉnh"];
  var DISASTER_EVENTS = ["Thiên tai lớn xảy ra", "Dịch bệnh lan tràn", "Núi lửa phun trào", "Lũ lụt nghiêm trọng", "Bão tuyết kỷ lục"];

  function generateOfflineEvents(offlineYears) {
    var data = window.offlineWorldData;
    data.offlineEvents = [];
    data.warOutcomes = [];
    data.kingdomChanges = [];
    data.economicShifts = [];
    data.heroEvents = [];
    data.disasterEvents = [];

    if (offlineYears <= 0) return;

    var baseYear = (typeof window.year === "number") ? window.year : 0;
    var eventsPerYear = 0.5;
    var totalEvents = Math.min(Math.ceil(offlineYears * eventsPerYear), 30);

    for (var i = 0; i < totalEvents; i++) {
      var eventYear = baseYear + Math.floor((i / totalEvents) * offlineYears);
      var type = rnd(0, 4);

      if (type === 0) {
        var w = { year: eventYear, outcome: pick(WAR_OUTCOMES), impact: pick(["Nhỏ","Trung bình","Lớn","Thảm khốc"]) };
        data.warOutcomes.push(w);
        data.offlineEvents.push({ year: eventYear, icon: "⚔️", category: "war", title: w.outcome, detail: "Tác động " + w.impact });
      } else if (type === 1) {
        var k = { year: eventYear, event: pick(KINGDOM_EVENTS) };
        data.kingdomChanges.push(k);
        data.offlineEvents.push({ year: eventYear, icon: "👑", category: "kingdom", title: k.event, detail: "" });
      } else if (type === 2) {
        var e = { year: eventYear, event: pick(ECON_EVENTS) };
        data.economicShifts.push(e);
        data.offlineEvents.push({ year: eventYear, icon: "💹", category: "economy", title: e.event, detail: "" });
      } else if (type === 3) {
        var h = { year: eventYear, event: pick(HERO_EVENTS) };
        data.heroEvents.push(h);
        data.offlineEvents.push({ year: eventYear, icon: "⭐", category: "hero", title: h.event, detail: "" });
      } else {
        var d2 = { year: eventYear, event: pick(DISASTER_EVENTS) };
        data.disasterEvents.push(d2);
        data.offlineEvents.push({ year: eventYear, icon: "🌋", category: "disaster", title: d2.event, detail: "" });
      }
    }

    data.offlineEvents.sort(function(a, b) { return a.year - b.year; });
    data.totalEventsGenerated += totalEvents;
    data.processedOfflineYears = offlineYears;
    data.lastProcessedAt = Date.now();
  }

  window.owp55GetOfflineEvents = function() { return window.offlineWorldData.offlineEvents; };
  window.owp55GetWarOutcomes = function() { return window.offlineWorldData.warOutcomes; };
  window.owp55GetKingdomChanges = function() { return window.offlineWorldData.kingdomChanges; };
  window.owp55GetEconomicShifts = function() { return window.offlineWorldData.economicShifts; };
  window.owp55GetHeroEvents = function() { return window.offlineWorldData.heroEvents; };
  window.owp55GetDisasterEvents = function() { return window.offlineWorldData.disasterEvents; };
  window.owp55GetStats = function() {
    var d = window.offlineWorldData;
    return {
      processedOfflineYears: d.processedOfflineYears,
      totalEvents: d.offlineEvents.length,
      totalEventsGenerated: d.totalEventsGenerated,
      lastProcessedAt: d.lastProcessedAt
    };
  };

  function init() {
    load();

    var offlineYears = (typeof window.puv55GetOfflineYears === "function") ? window.puv55GetOfflineYears() : 0;

    if (offlineYears > 0) {
      generateOfflineEvents(offlineYears);
      save();
      console.log("[OfflineWorldProcessor V55] 🌙 Đã xử lý " + offlineYears + " năm offline → " + window.offlineWorldData.offlineEvents.length + " sự kiện được tái tạo.");
    } else {
      console.log("[OfflineWorldProcessor V55] 🌙 Không có thời gian offline cần xử lý.");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 8400); });
  } else {
    setTimeout(init, 8400);
  }
})();
