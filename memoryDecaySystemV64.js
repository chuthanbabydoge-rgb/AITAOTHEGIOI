(function() {
  "use strict";
  const SAVE_KEY = "cgv6_memory_decay_v64";

  window.memoryDecayV64Data = {
    version: 64,
    decayRate: 0.1,       // % phai nhạt mỗi 100 năm
    distortionThreshold: 50,   // decay% để bắt đầu bóp méo
    legendThreshold: 80,       // decay% để biến thành truyền thuyết
    legends: [],          // [{originalId, title, legendTitle, content, year, type}]
    distortedMemories: [],// [{originalId, originalTitle, distortedTitle, year}]
    lastDecay: 0
  };

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(window.memoryDecayV64Data));
    } catch(e) {}
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) window.memoryDecayV64Data = { ...window.memoryDecayV64Data, ...JSON.parse(raw) };
    } catch(e) {}
  }

  // Distortion templates — memories get poetic/mythologized
  const DISTORTIONS = {
    war: [
      m => `Trận chiến của ${m.title} được kể lại như một cuộc giao đấu giữa các vị thần.`,
      m => `Người ta nói rằng ${m.title} là cuộc chiến kéo dài nghìn năm.`,
      m => `Theo truyền thuyết, ${m.title} đã làm rung chuyển cả trời đất.`
    ],
    miracle: [
      m => `Phép màu của Tạo Hóa trong ${m.title} nay trở thành tín ngưỡng dân gian.`,
      m => `Con cháu kể lại ${m.title} như một điều kỳ diệu mà không ai dám nghi ngờ.`
    ],
    disaster: [
      m => `Đại thảm họa ${m.title} nay được coi là Thiên Phạt của các vị thần.`,
      m => `${m.title} được truyền miệng là ngày tận thế đầu tiên của thế giới.`
    ],
    hero: [
      m => `Anh hùng trong ${m.title} nay được thờ phụng như một vị thần.`,
      m => `${m.title} trở thành sử thi được hát mãi qua các thế hệ.`
    ],
    default: [
      m => `Sự kiện ${m.title} nay chỉ còn là huyền thoại mờ nhạt trong ký ức dân gian.`,
      m => `${m.title} được lưu truyền với nhiều dị bản khác nhau qua các thế kỷ.`
    ]
  };

  function getDistortionText(mem) {
    const pool = DISTORTIONS[mem.category] || DISTORTIONS.default;
    return pool[Math.floor(Math.random() * pool.length)](mem);
  }

  const LEGEND_TITLES = {
    war: ["Thiên Địa Đại Chiến", "Huyết Chiến Muôn Thuở", "Thần Ma Kịch Chiến"],
    miracle: ["Thần Tích Vĩnh Hằng", "Điều Kỳ Diệu Muôn Đời", "Ân Điển Thiên Thượng"],
    disaster: ["Thiên Phạt Khủng Khiếp", "Ngày Trời Đất Nổi Giận", "Đại Kiếp Nan"],
    hero: ["Huyền Thoại Bất Tử", "Anh Hùng Thiên Cổ", "Thánh Nhân Xuất Thế"],
    era: ["Kỷ Nguyên Huyền Thoại", "Thời Đại Của Các Vị Thần"],
    default: ["Huyền Thoại Cổ Xưa", "Sử Thi Vạn Cổ", "Ký Ức Thiên Thu"]
  };

  function getLegendTitle(mem) {
    const pool = LEGEND_TITLES[mem.category] || LEGEND_TITLES.default;
    return pool[Math.floor(pool.length * (mem.importance || 3) / 5) % pool.length];
  }

  // Public API
  window.decay64GetLegends = function(limit = 20) {
    return window.memoryDecayV64Data.legends
      .sort((a,b) => b.year - a.year)
      .slice(0, limit);
  };

  window.decay64GetDistorted = function(limit = 20) {
    return window.memoryDecayV64Data.distortedMemories
      .sort((a,b) => b.year - a.year)
      .slice(0, limit);
  };

  window.decay64GetStats = function() {
    const d = window.memoryDecayV64Data;
    return {
      legends: d.legends.length,
      distorted: d.distortedMemories.length,
      decayRate: d.decayRate,
      legendThreshold: d.legendThreshold
    };
  };

  window.decay64ForceDecay = function() {
    processDecay();
  };

  function processDecay() {
    if (!window.memoryV64Data) return;
    const year = window.year || 0;
    const d = window.memoryDecayV64Data;
    const memories = window.memoryV64Data.globalMemories;

    memories.forEach(mem => {
      const age = year - (mem.year || 0);
      if (age < 100) return;

      // Increase decay based on age and inverse importance
      const decayIncrease = (age / 100) * d.decayRate * (1 / Math.max(mem.importance, 1));
      mem.decay = Math.min(100, (mem.decay || 0) + decayIncrease);

      // Distortion stage
      if (mem.decay >= d.distortionThreshold && !mem._distorted) {
        mem._distorted = true;
        mem.content = getDistortionText(mem);
        d.distortedMemories.push({
          originalId: mem.id,
          originalTitle: mem.title,
          distortedTitle: `[Bóp Méo] ${mem.title}`,
          year,
          content: mem.content
        });
      }

      // Legend transformation
      if (mem.decay >= d.legendThreshold && !mem._legend && mem.importance >= 3) {
        mem._legend = true;
        const legendTitle = getLegendTitle(mem);
        d.legends.push({
          originalId: mem.id,
          title: legendTitle,
          originalTitle: mem.title,
          content: `Từ ký ức xa xưa về "${mem.title}", truyền thuyết "${legendTitle}" ra đời:\n${mem.content}`,
          year,
          type: mem.category || "unknown",
          importance: mem.importance
        });

        // Also push to world archive legends
        if (typeof window.wma64RecordDivineAct === "function" && mem.category === "creator") {
          // Legends of creator acts persist in archive
        }

        // Propagate to global mem64 as legend
        if (typeof window.mem64Record === "function") {
          window.mem64Record("legend", legendTitle, `Huyền thoại được sinh ra từ ký ức "${mem.title}".`, 4, ["born_from_memory"]);
        }
      }
    });
  }

  window.memoryDecayV64Tick = function() {
    const year = window.year || 0;
    const d = window.memoryDecayV64Data;
    if (year - d.lastDecay < 100) return;
    d.lastDecay = year;
    processDecay();
    save();
  };

  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      window.memoryDecayV64Tick();
    };
    console.log("[MemoryDecayV64] ✅ Hệ thống phai nhạt ký ức khởi động — Ký ức sẽ trở thành truyền thuyết.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 13200); });
  } else {
    setTimeout(init, 13200);
  }
})();
