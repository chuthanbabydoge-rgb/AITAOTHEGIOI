(function() {
  "use strict";
  const SAVE_KEY = "cgv6_cause_effect_v60";

  window.causeEffectV60Data = {
    activeChains: [],
    completedChains: [],
    chainHistory: [],
    tickCount: 0,
    totalTriggered: 0,
    version: "V60"
  };

  const CHAIN_DEFS = [
    {
      id: "disaster_to_war",
      name: "Thiên Tai → Chiến Tranh",
      icon: "🌋→⚔️",
      steps: [
        { label: "Thiên Tai Bùng Phát", icon: "🌋" },
        { label: "Thiếu Lương Thực", icon: "🌾" },
        { label: "Khủng Hoảng Kinh Tế", icon: "💸" },
        { label: "Bạo Loạn Nổ Ra", icon: "🔥" },
        { label: "Đảo Chính", icon: "⚡" },
        { label: "Chiến Tranh", icon: "⚔️" }
      ],
      trigger: function() {
        const dis = window.disasterData || {};
        return Array.isArray(dis.activeDisasters) && dis.activeDisasters.length >= 2;
      },
      effect: function(chain) {
        const countries = window.countries || [];
        if (countries.length > 0) {
          const c = countries[Math.floor(Math.random() * countries.length)];
          if (c) {
            c.stability = Math.max(0, (c.stability || 50) - 10);
            c.economy = Math.max(0, (c.economy || 50) - 8);
          }
        }
        if (typeof window.htAddEvent === "function") {
          window.htAddEvent({ year: window.year || 0, type: "disaster", title: "⚡ Chuỗi Nhân Quả: Thiên Tai → Bất Ổn", color: "#e74c3c" });
        }
      },
      cooldown: 80,
      lastFired: -999
    },
    {
      id: "war_to_hero",
      name: "Chiến Tranh → Anh Hùng",
      icon: "⚔️→🦸",
      steps: [
        { label: "Chiến Tranh Bùng Phát", icon: "⚔️" },
        { label: "Thế Giới Hỗn Loạn", icon: "🌪️" },
        { label: "Anh Hùng Xuất Hiện", icon: "🦸" },
        { label: "Trận Chiến Quyết Định", icon: "🗡️" },
        { label: "Kỷ Nguyên Mới", icon: "🌅" }
      ],
      trigger: function() {
        return Array.isArray(window.warsActive) && window.warsActive.length >= 3;
      },
      effect: function(chain) {
        const npcs = window.npcs || [];
        const hero = npcs.find(n => n.status === "alive" && !n.isHero);
        if (hero) {
          hero.isHero = true;
          hero.fame = (hero.fame || 0) + 500;
        }
        if (typeof window.htAddEvent === "function") {
          window.htAddEvent({ year: window.year || 0, type: "hero", title: "🦸 Chuỗi Nhân Quả: Chiến Tranh → Anh Hùng Ra Đời", color: "#f39c12" });
        }
        if (typeof window.wmeAddMemory === "function") {
          window.wmeAddMemory({ year: window.year || 0, category: "cause_effect", title: "Chiến Tranh Sinh Anh Hùng", content: "Từ lửa chiến tranh, một anh hùng được đúc nên." });
        }
      },
      cooldown: 60,
      lastFired: -999
    },
    {
      id: "economy_collapse",
      name: "Kinh Tế Sụp Đổ → Cách Mạng",
      icon: "💸→🔥",
      steps: [
        { label: "Kinh Tế Khủng Hoảng", icon: "💸" },
        { label: "Dân Chúng Nổi Dậy", icon: "👥" },
        { label: "Chính Quyền Lung Lay", icon: "🏛️" },
        { label: "Cách Mạng", icon: "🔥" },
        { label: "Tái Cơ Cấu", icon: "♻️" }
      ],
      trigger: function() {
        const crisis = window.econCrisisData || {};
        return Array.isArray(crisis.activeEvents) && crisis.activeEvents.length >= 2;
      },
      effect: function(chain) {
        const countries = window.countries || [];
        countries.forEach(c => {
          c.stability = Math.max(0, (c.stability || 50) - 5);
        });
        if (typeof window.htAddEvent === "function") {
          window.htAddEvent({ year: window.year || 0, type: "political", title: "🔥 Chuỗi Nhân Quả: Khủng Hoảng KT → Cách Mạng", color: "#e67e22" });
        }
      },
      cooldown: 70,
      lastFired: -999
    },
    {
      id: "religion_rise",
      name: "Tôn Giáo Trỗi Dậy → Thánh Chiến",
      icon: "⛩️→⚔️",
      steps: [
        { label: "Tôn Giáo Lan Rộng", icon: "⛩️" },
        { label: "Giáo Phái Cực Đoan", icon: "🔱" },
        { label: "Kêu Gọi Thánh Chiến", icon: "📯" },
        { label: "Chiến Tranh Tôn Giáo", icon: "⚔️" },
        { label: "Kỷ Nguyên Đức Tin", icon: "✨" }
      ],
      trigger: function() {
        const rel = window.politicalReligionData || window.religionData || {};
        const beliefs = Array.isArray(rel.beliefs) ? rel.beliefs : [];
        return beliefs.filter(b => (b.followers || 0) > 50).length >= 3;
      },
      effect: function(chain) {
        if (typeof window.htAddEvent === "function") {
          window.htAddEvent({ year: window.year || 0, type: "religion", title: "⛩️ Chuỗi Nhân Quả: Tôn Giáo → Thánh Chiến", color: "#9b59b6" });
        }
      },
      cooldown: 90,
      lastFired: -999
    },
    {
      id: "golden_age_rise",
      name: "Thịnh Vượng → Kỷ Nguyên Vàng",
      icon: "✨→🌅",
      steps: [
        { label: "Kinh Tế Phát Triển", icon: "📈" },
        { label: "Văn Hóa Nở Rộ", icon: "🎨" },
        { label: "Công Nghệ Bước Đột Phá", icon: "⚗️" },
        { label: "Dân Số Tăng Mạnh", icon: "👥" },
        { label: "Kỷ Nguyên Vàng", icon: "🌅" }
      ],
      trigger: function() {
        const countries = window.countries || [];
        const prosperous = countries.filter(c => (c.economy || 0) > 75 && (c.stability || 0) > 70);
        return prosperous.length >= 3;
      },
      effect: function(chain) {
        const countries = window.countries || [];
        countries.forEach(c => {
          c.culture = Math.min(100, (c.culture || 50) + 5);
          c.population = Math.floor((c.population || 1000) * 1.03);
        });
        if (typeof window.htAddEvent === "function") {
          window.htAddEvent({ year: window.year || 0, type: "golden_age", title: "🌅 Chuỗi Nhân Quả: Thịnh Vượng → Kỷ Nguyên Vàng", color: "#f1c40f" });
        }
        if (typeof window.wmeAddMemory === "function") {
          window.wmeAddMemory({ year: window.year || 0, category: "cause_effect", title: "Bình Minh Kỷ Nguyên Vàng", content: "Thịnh vượng kéo theo văn hóa và công nghệ nở rộ." });
        }
      },
      cooldown: 120,
      lastFired: -999
    },
    {
      id: "multiverse_invasion",
      name: "Sự Kiện ĐVT → Xâm Lăng",
      icon: "🌌→💥",
      steps: [
        { label: "Cổng ĐVT Mở", icon: "🌌" },
        { label: "Lực Lượng Bên Ngoài Tràn Vào", icon: "👾" },
        { label: "Liên Minh Phòng Thủ", icon: "🛡️" },
        { label: "Trận Chiến Liên Vũ Trụ", icon: "💥" },
        { label: "Ranh Giới Được Thiết Lập", icon: "🔮" }
      ],
      trigger: function() {
        const mv = window.mvEventV59Data || {};
        return Array.isArray(mv.activeEvents) && mv.activeEvents.length >= 2;
      },
      effect: function(chain) {
        if (typeof window.htAddEvent === "function") {
          window.htAddEvent({ year: window.year || 0, type: "multiverse", title: "🌌 Chuỗi Nhân Quả: ĐVT Xâm Lăng → Liên Minh", color: "#1abc9c" });
        }
      },
      cooldown: 100,
      lastFired: -999
    }
  ];

  function save() {
    try {
      const saveData = {
        chainHistory: window.causeEffectV60Data.chainHistory.slice(-50),
        completedChains: window.causeEffectV60Data.completedChains.slice(-30),
        totalTriggered: window.causeEffectV60Data.totalTriggered,
        tickCount: window.causeEffectV60Data.tickCount
      };
      CHAIN_DEFS.forEach(c => { saveData["lastFired_" + c.id] = c.lastFired; });
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    } catch(e) {}
  }

  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) {
        const p = JSON.parse(d);
        window.causeEffectV60Data.chainHistory = p.chainHistory || [];
        window.causeEffectV60Data.completedChains = p.completedChains || [];
        window.causeEffectV60Data.totalTriggered = p.totalTriggered || 0;
        window.causeEffectV60Data.tickCount = p.tickCount || 0;
        CHAIN_DEFS.forEach(c => {
          if (p["lastFired_" + c.id] !== undefined) c.lastFired = p["lastFired_" + c.id];
        });
      }
    } catch(e) {}
  }

  function checkChains() {
    const yr = window.year || 0;
    CHAIN_DEFS.forEach(def => {
      if (yr - def.lastFired < def.cooldown) return;
      if (!def.trigger()) return;
      def.lastFired = yr;
      window.causeEffectV60Data.totalTriggered++;
      const entry = {
        id: def.id,
        name: def.name,
        icon: def.icon,
        year: yr,
        steps: def.steps.map(s => s.label),
        timestamp: Date.now()
      };
      window.causeEffectV60Data.chainHistory.unshift(entry);
      if (window.causeEffectV60Data.chainHistory.length > 50) window.causeEffectV60Data.chainHistory.pop();
      window.causeEffectV60Data.activeChains = [entry];
      try { def.effect(entry); } catch(e) {}
      setTimeout(function() {
        window.causeEffectV60Data.activeChains = window.causeEffectV60Data.activeChains.filter(c => c.id !== def.id);
        window.causeEffectV60Data.completedChains.unshift(entry);
        if (window.causeEffectV60Data.completedChains.length > 30) window.causeEffectV60Data.completedChains.pop();
      }, 5000);
      save();
    });
  }

  window.cee60GetActiveChains = function() { return window.causeEffectV60Data.activeChains; };
  window.cee60GetHistory = function() { return window.causeEffectV60Data.chainHistory; };
  window.cee60GetChainDefs = function() { return CHAIN_DEFS.map(c => ({ id: c.id, name: c.name, icon: c.icon, steps: c.steps, cooldown: c.cooldown, lastFired: c.lastFired })); };
  window.cee60TriggerChain = function(id) {
    const def = CHAIN_DEFS.find(c => c.id === id);
    if (!def) return false;
    def.lastFired = -999;
    checkChains();
    return true;
  };
  window.cee60GetStats = function() {
    return {
      totalChains: CHAIN_DEFS.length,
      totalTriggered: window.causeEffectV60Data.totalTriggered,
      activeNow: window.causeEffectV60Data.activeChains.length,
      historyCount: window.causeEffectV60Data.chainHistory.length
    };
  };

  function tick() {
    window.causeEffectV60Data.tickCount++;
    if (window.causeEffectV60Data.tickCount % 50 === 0) {
      checkChains();
    }
  }

  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); tick(); };
    console.log("[CauseEffectEngineV60] 🔗 Nhân Quả V60 khởi động — " + CHAIN_DEFS.length + " chuỗi · Thiên tai→Chiến tranh · Thịnh vượng→Kỷ nguyên vàng · Tổng đã kích: " + window.causeEffectV60Data.totalTriggered);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 11600); });
  } else {
    setTimeout(init, 11600);
  }
})();
