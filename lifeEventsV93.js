(function() {
  "use strict";

  var SAVE_KEY = "cgv6_life_events_v93";

  window.lev93EventData = {
    events: [],
    totalEvents: 0
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.lev93EventData)); } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.lev93EventData = JSON.parse(d);
    } catch(e) {}
  }

  var LIFE_EVENT_TYPES = {
    reproduction: {
      icon: '🍼', color: '#22c55e', label: 'Sinh Sản',
      list: [
        { title: 'Bùng Nổ Sinh Sản', desc: 'Điều kiện thuận lợi khiến tỷ lệ sinh tăng vọt.', popMod: 0.25 },
        { title: 'Mùa Giao Phối', desc: 'Thời điểm thuận lợi cho sự sinh sôi nảy nở của loài.', popMod: 0.15 },
        { title: 'Thế Hệ Mới Ra Đời', desc: 'Một làn sóng sinh linh mới chào đời, mang lại sức sống mới.', popMod: 0.20 }
      ]
    },
    migration: {
      icon: '🚶', color: '#3b82f6', label: 'Di Cư',
      list: [
        { title: 'Làn Sóng Di Cư Lớn', desc: 'Một phần quần thể di chuyển đến vùng đất mới.', popMod: 0 },
        { title: 'Tái Định Cư', desc: 'Nhiều nhóm sinh linh tìm đến vùng đất màu mỡ hơn.', popMod: 0 },
        { title: 'Thuộc Địa Hóa', desc: 'Loài mở rộng lãnh thổ sang vùng đất chưa ai khai phá.', popMod: 0.1 }
      ]
    },
    plague: {
      icon: '💀', color: '#ef4444', label: 'Bệnh Dịch',
      list: [
        { title: 'Dịch Bệnh Bùng Phát', desc: 'Một căn bệnh lây lan nhanh chóng trong quần thể.', popMod: -0.20 },
        { title: 'Ký Sinh Trùng Nguy Hiểm', desc: 'Một loại ký sinh trùng mới gây chết chóc hàng loạt.', popMod: -0.15 },
        { title: 'Nạn Đói Kéo Dài', desc: 'Thiếu lương thực gây suy yếu và tử vong nhiều.', popMod: -0.12 }
      ]
    },
    extinction: {
      icon: '☠️', color: '#6b7280', label: 'Suy Tàn',
      list: [
        { title: 'Nguy Cơ Tuyệt Chủng', desc: 'Loài đứng trước bờ vực diệt vong do nhiều yếu tố.', popMod: -0.40 },
        { title: 'Sụp Đổ Quần Thể', desc: 'Số lượng giảm sút đột ngột, loài mất khả năng hồi phục.', popMod: -0.35 },
        { title: 'Vùng Sinh Thái Phá Hủy', desc: 'Môi trường sống bị tàn phá, loài không còn nơi trú ngụ.', popMod: -0.30 }
      ]
    },
    adaptation: {
      icon: '🔬', color: '#a78bfa', label: 'Tiến Hóa',
      list: [
        { title: 'Đột Biến Tiến Hóa', desc: 'Loài phát triển đặc tính mới giúp thích nghi tốt hơn.', popMod: 0.05 },
        { title: 'Kháng Bệnh Tự Nhiên', desc: 'Quần thể phát triển khả năng miễn dịch với bệnh tật.', popMod: 0.08 },
        { title: 'Tiến Hóa Vượt Bậc', desc: 'Loài đạt cột mốc tiến hóa mới — một bước ngoặt lịch sử.', popMod: 0.10 }
      ]
    }
  };

  function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function pickType() {
    var keys = Object.keys(LIFE_EVENT_TYPES);
    // Weighted: reproduction > migration > adaptation > plague > extinction
    var weights = { reproduction: 30, migration: 25, adaptation: 25, plague: 15, extinction: 5 };
    var total = 0;
    keys.forEach(function(k) { total += weights[k] || 10; });
    var r = Math.random() * total;
    var acc = 0;
    for (var i = 0; i < keys.length; i++) {
      acc += weights[keys[i]] || 10;
      if (r < acc) return keys[i];
    }
    return keys[0];
  }

  function fireLifeEvent(year) {
    var species = typeof window.spv93GetAlive === 'function' ? window.spv93GetAlive() : [];
    if (!species.length) return null;

    var sp = pickRandom(species);
    var type = pickType();

    // Extinction only if population very low
    if (type === 'extinction' && sp.population > 1000) {
      type = 'adaptation';
    }

    var cat = LIFE_EVENT_TYPES[type];
    var ev = pickRandom(cat.list);

    // Apply population modifier to species
    if (ev.popMod !== 0 && sp.population > 0) {
      var oldPop = sp.population;
      sp.population = Math.max(1, Math.round(sp.population * (1 + ev.popMod)));
      // Update status
      if (sp.population === 1) sp.status = 'endangered';
      if (typeof window.spv93Data !== 'undefined') {
        try {
          var found = window.spv93Data.species.find(function(s) { return s.id === sp.id; });
          if (found) found.population = sp.population;
        } catch(e) {}
      }
    }

    var entry = {
      year: year,
      type: type,
      speciesId: sp.id,
      speciesName: sp.name,
      speciesIcon: sp.icon,
      title: sp.icon + ' ' + sp.name + ': ' + ev.title,
      desc: ev.desc,
      icon: cat.icon,
      color: cat.color,
      label: cat.label,
      popBefore: sp.population,
      popMod: ev.popMod,
      timestamp: Date.now()
    };

    window.lev93EventData.events.unshift(entry);
    if (window.lev93EventData.events.length > 200) window.lev93EventData.events.pop();
    window.lev93EventData.totalEvents++;
    save();

    // Write to chronicle
    if (typeof window.wchV92AddEvent === 'function') {
      window.wchV92AddEvent({ year: year, type: type, title: entry.title, desc: entry.desc, icon: cat.icon, color: cat.color });
    }
    if (typeof window.htAddEvent === 'function') {
      window.htAddEvent({ year: year, type: type, title: cat.icon + ' ' + entry.title, color: cat.color });
    }

    return entry;
  }

  window.lev93GetLifeEvents   = function(n) { return window.lev93EventData.events.slice(0, n || 8); };
  window.lev93FireManual      = function() { return fireLifeEvent(window.year || 1); };

  function onYearChange(year) {
    if (!window.world || !window.world.name) return;
    var species = typeof window.spv93GetAlive === 'function' ? window.spv93GetAlive() : [];
    if (!species.length) return;

    // Fire 1 life event every year, 2 if many species
    var count = species.length >= 4 ? 2 : 1;
    for (var i = 0; i < count; i++) {
      (function(delay) { setTimeout(function() { fireLifeEvent(year); }, delay); })(i * 600);
    }
  }

  function init() {
    load();
    if (typeof window.wacV92AddListener === 'function') {
      window.wacV92AddListener(onYearChange);
    }
    console.log("[LifeEvents V93] 🍼 Life Events khởi động — 5 loại · " + window.lev93EventData.totalEvents + " sự kiện sinh học đã xảy ra.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 24900); });
  } else {
    setTimeout(init, 24900);
  }
})();
