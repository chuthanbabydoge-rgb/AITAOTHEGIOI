(function() {
  "use strict";

  var SAVE_KEY = "cgv6_autonomous_events_v92";

  window.aeeV92Data = {
    events: [],
    totalEvents: 0,
    lastEventYear: 0
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.aeeV92Data)); } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.aeeV92Data = JSON.parse(d);
    } catch(e) {}
  }

  var EVENT_BANK = {
    harvest: {
      icon: '🌾', color: '#22c55e', label: 'Mùa Màng',
      list: [
        { title: 'Mùa Vụ Bội Thu', desc: 'Đất đai màu mỡ, lương thực dồi dào — dân số tăng trưởng nhanh.' },
        { title: 'Hạn Hán Kéo Dài', desc: 'Mưa không xuống, mùa màng thất bát — dân chúng thiếu lương thực.' },
        { title: 'Lũ Lụt Lớn', desc: 'Nước dâng ngập đồng ruộng nhưng phù sa bồi đắp tạo vùng đất phì nhiêu.' },
        { title: 'Mùa Xuân Ấm Áp', desc: 'Thiên nhiên hồi sinh, muôn loài phát triển mạnh — thế giới tràn sức sống.' },
        { title: 'Đông Giá Khắc Nghiệt', desc: 'Băng tuyết phủ kín núi đồi, con người học cách sinh tồn trong giá lạnh.' },
        { title: 'Mưa Thuận Gió Hòa', desc: 'Khí hậu ôn hòa suốt cả năm, muôn vật sinh trưởng bình yên.' }
      ]
    },
    disaster: {
      icon: '🌋', color: '#ef4444', label: 'Thiên Tai',
      list: [
        { title: 'Núi Lửa Thức Giấc', desc: 'Dung nham chảy khắp nơi — đất bị thiêu rụi nhưng trở nên màu mỡ sau đó.' },
        { title: 'Đại Địa Chấn', desc: 'Mặt đất rung chuyển mạnh — sông núi thay hình, cảnh quan thay đổi hoàn toàn.' },
        { title: 'Cơn Bão Thiên Niên Kỷ', desc: 'Sấm sét vang trời, mưa như trút nước suốt nhiều ngày liên tiếp.' },
        { title: 'Dịch Bệnh Nhỏ', desc: 'Một căn bệnh lạ lan rộng — các thầy thuốc vất vả tìm cách chữa trị.' },
        { title: 'Thiên Thạch Rơi', desc: 'Một tảng đá vũ trụ lao xuống — tạo ra hố thiên thạch và ánh sáng rực trời.' },
        { title: 'Sóng Thần Ập Đến', desc: 'Biển nổi sóng dữ — vùng ven biển bị tàn phá nhưng hồi sinh nhanh chóng.' }
      ]
    },
    discovery: {
      icon: '🔭', color: '#3b82f6', label: 'Khám Phá',
      list: [
        { title: 'Vùng Đất Mới Được Khám Phá', desc: 'Những nhà thám hiểm dũng cảm tìm ra vùng đất chưa ai đặt chân đến.' },
        { title: 'Mỏ Khoáng Sản Quý Hiếm', desc: 'Phát hiện mỏ quặng hiếm — mang lại thịnh vượng cho cả vùng lãnh thổ.' },
        { title: 'Cổ Vật Bí Ẩn Khai Quật', desc: 'Di tích văn minh cổ xưa lộ ra — tiết lộ bí mật đã chìm vào quên lãng.' },
        { title: 'Bí Quyết Thiên Nhiên Sáng Tỏ', desc: 'Học giả khám phá quy luật tự nhiên mới — kiến thức nhân loại tăng vọt.' },
        { title: 'Bản Đồ Huyền Thoại Tái Xuất', desc: 'Một tấm bản đồ cổ chỉ đường đến vùng đất được coi là huyền thoại.' },
        { title: 'Giao Thoa Văn Minh', desc: 'Hai nền văn minh xa lạ gặp nhau lần đầu — trao đổi tri thức và phong tục.' }
      ]
    },
    conflict: {
      icon: '⚔️', color: '#f59e0b', label: 'Xung Đột',
      list: [
        { title: 'Tranh Chấp Biên Giới', desc: 'Hai vùng lãnh thổ xung đột về đường ranh giới — đàm phán căng thẳng kéo dài.' },
        { title: 'Nổi Dậy Của Dân Chúng', desc: 'Người dân bất mãn vùng lên đòi thay đổi — quyền lực bị thách thức.' },
        { title: 'Ám Sát Chính Khách', desc: 'Một lãnh đạo quan trọng bị ám sát — quyền lực thay đổi tay đột ngột.' },
        { title: 'Hòa Ước Lịch Sử', desc: 'Các thế lực lớn ngồi lại đàm phán — hòa ước được ký sau nhiều năm xung đột.' },
        { title: 'Liên Minh Mới Hình Thành', desc: 'Những kẻ thù cũ bắt tay nhau trước mối đe dọa chung — thế giới thay đổi.' },
        { title: 'Cuộc Nổi Loạn Bị Dập Tắt', desc: 'Một cuộc nổi loạn bị đánh bại — trật tự được khôi phục nhưng vết thương còn đó.' }
      ]
    },
    invention: {
      icon: '💡', color: '#a78bfa', label: 'Phát Minh',
      list: [
        { title: 'Công Cụ Thay Đổi Thời Đại', desc: 'Một loại công cụ mới ra đời — thay đổi hoàn toàn cách con người lao động.' },
        { title: 'Kỹ Thuật Nông Nghiệp Đột Phá', desc: 'Phương pháp canh tác tiên tiến — sản lượng tăng gấp đôi trong một mùa vụ.' },
        { title: 'Trường Phái Nghệ Thuật Mới', desc: 'Một phong cách nghệ thuật mới xuất hiện — truyền cảm hứng cho cả thế hệ sau.' },
        { title: 'Thuốc Chữa Bệnh Nan Y', desc: 'Thầy thuốc tìm ra phương pháp chữa căn bệnh mà trước đây không có thuốc.' },
        { title: 'Công Trình Vĩ Đại Hoàn Thành', desc: 'Một công trình kỳ vĩ được xây dựng xong — trở thành biểu tượng của thời đại.' },
        { title: 'Chữ Viết Mới Ra Đời', desc: 'Một hệ thống chữ viết mới được tạo ra — tri thức được truyền lại dễ dàng hơn.' }
      ]
    }
  };

  function getRand() {
    return Math.random();
  }

  function pickRandom(arr) {
    return arr[Math.floor(getRand() * arr.length)];
  }

  function pickType() {
    var types = Object.keys(EVENT_BANK);
    return types[Math.floor(getRand() * types.length)];
  }

  function fireEvent(year) {
    if (!window.world || !window.world.name) return null;

    var type = pickType();
    var cat = EVENT_BANK[type];
    var ev = pickRandom(cat.list);

    var entry = {
      year: year,
      type: type,
      title: ev.title,
      desc: ev.desc,
      icon: cat.icon,
      color: cat.color,
      label: cat.label,
      timestamp: Date.now()
    };

    window.aeeV92Data.events.unshift(entry);
    if (window.aeeV92Data.events.length > 300) window.aeeV92Data.events.pop();
    window.aeeV92Data.totalEvents++;
    window.aeeV92Data.lastEventYear = year;
    save();

    if (typeof window.htAddEvent === 'function') {
      try {
        window.htAddEvent({ year: year, type: type, title: cat.icon + ' ' + ev.title, color: cat.color });
      } catch(e) {}
    }
    if (typeof window.wmeAddMemory === 'function') {
      try {
        window.wmeAddMemory({ year: year, category: type, title: ev.title, content: ev.desc });
      } catch(e) {}
    }
    if (typeof window.wchV92AddEvent === 'function') {
      try { window.wchV92AddEvent(entry); } catch(e) {}
    }

    return entry;
  }

  function eventsPerYear() {
    var npcs = (window.npcs || []).length;
    var ctrs = (window.countries || []).length;
    if (npcs > 80 || ctrs > 15) return 3;
    if (npcs > 30 || ctrs > 6) return 2;
    return 1;
  }

  window.aeeV92GetRecentEvents = function(n) {
    return window.aeeV92Data.events.slice(0, n || 5);
  };

  window.aeeV92FireManual = function() {
    return fireEvent(window.year || 1);
  };

  function onYearChange(year) {
    var count = eventsPerYear();
    for (var i = 0; i < count; i++) {
      (function(delay) {
        setTimeout(function() { fireEvent(year); }, delay);
      })(i * 400);
    }
  }

  function init() {
    load();

    if (typeof window.wacV92AddListener === 'function') {
      window.wacV92AddListener(onYearChange);
    } else {
      var _lastYear = window.year || 1;
      var _orig = window.gameTick;
      window.gameTick = function() {
        if (_orig) _orig();
        var cy = window.year || 1;
        if (cy !== _lastYear) { onYearChange(cy); _lastYear = cy; }
      };
    }

    console.log("[AutonomousEventEngine V92] 🎲 Event Engine khởi động — 5 loại · " + window.aeeV92Data.totalEvents + " sự kiện đã xảy ra.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 24300); });
  } else {
    setTimeout(init, 24300);
  }
})();
