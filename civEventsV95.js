(function() {
  "use strict";

  var SAVE_KEY = "cgv6_civ_events_v95";

  window.cevV95Data = {
    events: [],
    totalEvents: 0
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.cevV95Data)); } catch(e) {}
  }
  function load() {
    try { var d = localStorage.getItem(SAVE_KEY); if (d) window.cevV95Data = JSON.parse(d); } catch(e) {}
  }

  // ── EVENT TEMPLATES ───────────────────────────────────────────────────────
  var EVENTS = {
    expansion: {
      icon: '🗺️', color: '#22c55e', label: 'Mở Rộng',
      list: [
        { title: 'Chinh Phục Lãnh Thổ Mới', desc: 'Các chiến binh mở rộng biên giới về phía {dir}.', terr: 2 },
        { title: 'Định Cư Vùng Đất Mới',    desc: 'Nhóm di cư thành lập khu định cư mới.',           terr: 1 },
        { title: 'Đồng Hóa Bộ Lạc Nhỏ',    desc: 'Một bộ lạc nhỏ hơn sáp nhập vào nền văn minh.',  terr: 1 }
      ]
    },
    alliance: {
      icon: '🤝', color: '#3b82f6', label: 'Liên Minh',
      list: [
        { title: 'Hiệp Ước Hòa Bình',    desc: 'Hai nền văn minh ký kết hiệp ước không xâm phạm.',        stab: 10 },
        { title: 'Liên Minh Thương Mại', desc: 'Tuyến đường thương mại được thiết lập, thịnh vượng tăng.', know: 5  },
        { title: 'Hội Nghị Văn Minh',    desc: 'Các nhà lãnh đạo họp mặt trao đổi tri thức và văn hóa.',  cult: 10 }
      ]
    },
    split: {
      icon: '⚡', color: '#ef4444', label: 'Phân Ly',
      list: [
        { title: 'Nội Chiến',         desc: 'Xung đột nội bộ làm suy yếu sự ổn định.',  stab: -20 },
        { title: 'Ly Khai',           desc: 'Một vùng tuyên bố độc lập.',               stab: -10 },
        { title: 'Khủng Hoảng Kế Vị', desc: 'Tranh cãi về người kế nhiệm gây bất ổn.',  stab: -15 }
      ]
    },
    golden_age: {
      icon: '✨', color: '#f59e0b', label: 'Thời Hoàng Kim',
      list: [
        { title: 'Kỷ Nguyên Vàng',       desc: 'Văn minh đạt đỉnh cao về văn hóa và khoa học.', know: 15, cult: 15 },
        { title: 'Phát Minh Vĩ Đại',     desc: 'Một phát minh đột phá thay đổi xã hội mãi mãi.', know: 20           },
        { title: 'Nghệ Thuật Phát Triển', desc: 'Những tác phẩm nghệ thuật bất hủ ra đời.',       cult: 20          }
      ]
    },
    war: {
      icon: '⚔️', color: '#dc2626', label: 'Chiến Tranh',
      list: [
        { title: 'Xung Đột Lãnh Thổ',  desc: 'Tranh chấp biên giới leo thang thành chiến tranh.',   stab: -15 },
        { title: 'Thánh Chiến',        desc: 'Chiến tranh nhân danh tín ngưỡng và văn hóa.',         stab: -20 },
        { title: 'Chiến Dịch Thống Nhất', desc: 'Nỗ lực thống nhất các khu vực dưới một biểu ngữ.', terr: 1, stab: -10 }
      ]
    }
  };

  var DIRECTIONS = ['bắc', 'nam', 'đông', 'tây', 'đông bắc', 'tây nam'];

  function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function fireEvent(yr) {
    var civs = typeof window.cecV95GetAll === 'function' ? window.cecV95GetAll() : [];
    if (!civs.length) return null;

    var civ = pickRandom(civs);
    var roll = Math.random() * 100;

    var type;
    // Weight depends on civ stability
    var isUnstable = civ.stability < 50;
    if (roll < 25) type = 'expansion';
    else if (roll < 45) type = 'alliance';
    else if (roll < 60) type = 'golden_age';
    else if (isUnstable && roll < 80) type = 'split';
    else if (roll < 80) type = 'expansion';
    else type = 'war';

    var evCat = EVENTS[type];
    var template = pickRandom(evCat.list);
    var title = template.title;
    var desc = template.desc.replace('{dir}', pickRandom(DIRECTIONS));

    // Apply effects
    if (template.stab) civ.stability = Math.max(10, Math.min(100, (civ.stability || 70) + template.stab));
    if (template.know) civ.knowledge = Math.min(100, (civ.knowledge || 0) + template.know);
    if (template.cult) civ.culture   = Math.min(100, (civ.culture   || 0) + template.cult);
    if (template.terr) {
      civ.territory = (civ.territory || 1) + template.terr;
      // Maybe add a new city
      if (civ.territory % 2 === 0) {
        var newCity = generateCityName();
        civ.cities = civ.cities || [];
        civ.cities.push({ name: newCity, isCapital: false, pop: Math.floor((civ.population || 100) * 0.05), yr: yr });
      }
    }

    var entry = {
      year: yr,
      civId: civ.id,
      civName: civ.name,
      civIcon: civ.stageIcon,
      speciesIcon: civ.speciesIcon,
      type: type,
      title: civ.stageIcon + ' ' + civ.name + ': ' + title,
      desc: desc,
      icon: evCat.icon,
      color: evCat.color,
      label: evCat.label,
      timestamp: Date.now()
    };

    window.cevV95Data.events.unshift(entry);
    if (window.cevV95Data.events.length > 300) window.cevV95Data.events.pop();
    window.cevV95Data.totalEvents++;
    save();

    // Write to chronicle & history
    if (typeof window.wchV92AddEvent === 'function') window.wchV92AddEvent({ year: yr, type: type, title: entry.title, desc: desc, icon: evCat.icon, color: evCat.color });
    if (typeof window.htAddEvent === 'function') window.htAddEvent({ year: yr, type: type, title: evCat.icon + ' ' + entry.title, color: evCat.color });

    return entry;
  }

  function generateCityName() {
    var prefixes = ['Thiên','Địa','Huyền','Vân','Long','Phượng','Kim','Ngọc','Bạch','Tử','Thanh','Ánh','Thái','Nguyên'];
    var suffixes = ['Thành','Kinh','Đô','Trì','Phủ','Quan','Lĩnh','Nguyên','Châu','Môn'];
    return prefixes[Math.floor(Math.random() * prefixes.length)] + ' ' + suffixes[Math.floor(Math.random() * suffixes.length)];
  }

  // ── PUBLIC API ────────────────────────────────────────────────────────────
  window.cevV95GetEvents  = function(n) { return window.cevV95Data.events.slice(0, n || 10); };
  window.cevV95FireManual = function()  { return fireEvent(window.year || 1); };

  // ── YEAR LISTENER ─────────────────────────────────────────────────────────
  var _lastEventYear = 0;
  function onYearChange(yr) {
    if (!window.world || !window.world.name) return;
    var civs = typeof window.cecV95GetAll === 'function' ? window.cecV95GetAll() : [];
    if (!civs.length) return;
    if (yr === _lastEventYear) return;
    _lastEventYear = yr;

    // Fire 1 civ event every year once there are civs
    // 2 events if there are 3+ civs
    var count = civs.length >= 3 ? 2 : 1;
    for (var i = 0; i < count; i++) {
      (function(delay) { setTimeout(function() { fireEvent(yr); }, delay); })(i * 800);
    }
  }

  function init() {
    load();
    if (typeof window.wacV92AddListener === 'function') {
      window.wacV92AddListener(onYearChange);
    }
    console.log("[CivEvents V95] 🗺️ Civilization Events khởi động — 5 loại · " + window.cevV95Data.totalEvents + " sự kiện văn minh đã xảy ra.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 25300); });
  } else {
    setTimeout(init, 25300);
  }
})();
