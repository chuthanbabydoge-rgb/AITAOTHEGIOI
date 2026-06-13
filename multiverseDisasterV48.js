(function() {
  "use strict";
  const SAVE_KEY = "cgv6_mv_disaster_v48";

  // ============================================================
  // MULTIVERSE DISASTER V48 — Thảm Họa Đa Vũ Trụ
  // Sụp Đổ Vũ Trụ · Va Chạm Vũ Trụ · Nứt Dòng Thời Gian · Bão Không-Thời Gian
  // Kết nối: multiverseEngine V35 · TimelineEngine V36 · MultiverseWarSystem V39
  // ============================================================

  const MV_DISASTER_TYPES = [
    {
      id: "universe_collapse",
      name: "Sụp Đổ Vũ Trụ",
      icon: "💥",
      color: "#dc2626",
      rarity: 0.002,
      severity: ["Sụp Đổ Cục Bộ", "Sụp Đổ Một Phần", "Sụp Đổ Nghiêm Trọng", "Hủy Diệt Hoàn Toàn"],
      desc: "Cấu trúc không-thời gian của một vũ trụ bắt đầu tan rã, các quy luật vật lý sụp đổ từ từ.",
      worldEffect: {
        population:   [-10, -30, -60, -95],
        economy:      [-20, -50, -80, -100],
        stability:    [-30, -60, -90, -100],
        mana:         [-20, -50, -80, -100],
      },
    },
    {
      id: "universe_collision",
      name: "Va Chạm Vũ Trụ",
      icon: "🌌",
      color: "#7c3aed",
      rarity: 0.0015,
      severity: ["Giao Thoa Nhẹ", "Va Chạm Vừa", "Va Chạm Mạnh", "Hợp Nhất Cưỡng Bức"],
      desc: "Hai vũ trụ song song va chạm và giao thoa, tạo ra vùng không-thời gian hỗn loạn cực độ.",
      worldEffect: {
        population:   [-5, -20, -45, -70],
        chaos:        [30, 60, 85, 100],
        anomalies:    [10, 25, 50, 80],
        crossworld_connections: [20, 40, 60, 100],
      },
    },
    {
      id: "timeline_fracture",
      name: "Nứt Dòng Thời Gian",
      icon: "⏳",
      color: "#f59e0b",
      rarity: 0.003,
      severity: ["Nứt Nhỏ", "Vết Nứt Rộng", "Phân Nhánh Nguy Hiểm", "Vỡ Hoàn Toàn"],
      desc: "Dòng thời gian chính bị nứt vỡ, tạo ra các nhánh thời gian song song mâu thuẫn nhau.",
      worldEffect: {
        timeline_branches: [1, 3, 7, 20],
        stability:         [-10, -25, -50, -80],
        paradox_risk:      [20, 40, 70, 100],
        population:        [-2, -8, -20, -45],
      },
    },
    {
      id: "spacetime_storm",
      name: "Bão Không-Thời Gian",
      icon: "🌪️",
      color: "#06b6d4",
      rarity: 0.004,
      severity: ["Gió Nhẹ", "Cơn Bão", "Đại Bão", "Cơn Bão Hủy Diệt"],
      desc: "Bão năng lượng khổng lồ quét qua nhiều vũ trụ cùng lúc, xáo trộn vị trí và thời gian của mọi thứ.",
      worldEffect: {
        population:   [-3, -10, -25, -55],
        displacement: [10, 30, 60, 90],
        chaos:        [15, 35, 65, 95],
        duration_days:[5, 20, 50, 150],
      },
    },
  ];

  function defaultData() {
    return {
      activeDisasters: [],
      history: [],
      affectedUniverses: [],   // Vũ trụ bị ảnh hưởng
      crossworldLinks: [],      // Các kết nối xuyên vũ trụ mới tạo ra
      lastTick: 0,
      stats: {
        totalMvDisasters: 0,
        universesCollapsed: 0,
        timelineFractures: 0,
        collisions: 0,
        storms: 0,
        mostDestructive: null,
      },
    };
  }

  window.mvDisasterV48Data = window.mvDisasterV48Data || defaultData();

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.mvDisasterV48Data)); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.mvDisasterV48Data = Object.assign(defaultData(), JSON.parse(d));
    } catch(e) { window.mvDisasterV48Data = defaultData(); }
  }

  // ── TRIGGER MV DISASTER ──
  function triggerMvDisaster(typeId, universeId, severityIdx) {
    const d = window.mvDisasterV48Data;
    const type = MV_DISASTER_TYPES.find(t => t.id === typeId);
    if (!type) return null;

    const year = window.year || 1;
    const universes = (window.mvData && window.mvData.universes) ? window.mvData.universes : [];
    const targetUniverse = universeId
      ? universes.find(u => u.id === universeId)
      : (universes.length ? universes[Math.floor(Math.random() * universes.length)] : null);

    const universeName = targetUniverse ? (targetUniverse.name || `Vũ Trụ #${targetUniverse.id}`) : "Vũ Trụ Chưa Biết";
    const sevIdx = severityIdx !== undefined ? severityIdx : Math.floor(Math.random() * 4);

    const event = {
      id: "mvd_" + Date.now() + "_" + Math.random().toString(36).slice(2),
      typeId,
      name: type.name,
      icon: type.icon,
      color: type.color,
      severity: type.severity[sevIdx],
      severityIdx: sevIdx,
      universeId: targetUniverse ? targetUniverse.id : null,
      universeName,
      year,
      desc: type.desc,
      active: true,
      duration: Math.max(5, sevIdx * 20 + Math.floor(Math.random() * 30)),
    };

    // Apply world effects
    const countries = window.countries || [];
    const worldEffects = type.worldEffect;
    const intensity = (sevIdx + 1) / 4;

    if (worldEffects.population) {
      const pctChange = worldEffects.population[sevIdx] || 0;
      countries.forEach(c => {
        if (c.population && Math.random() < 0.4 * intensity) {
          const delta = Math.floor(c.population * Math.abs(pctChange) / 100);
          c.population = Math.max(10, pctChange > 0 ? c.population + delta : c.population - delta);
        }
      });
    }
    if (worldEffects.stability) {
      const stabChange = worldEffects.stability[sevIdx] || 0;
      countries.forEach(c => {
        if (c.stability !== undefined && Math.random() < 0.5 * intensity) {
          c.stability = Math.max(0, Math.min(100, (c.stability || 50) + stabChange));
        }
      });
    }

    // Special effects
    if (typeId === "universe_collapse") {
      d.stats.universesCollapsed++;
      if (targetUniverse) targetUniverse.status = sevIdx >= 3 ? "collapsed" : "damaged";
    }
    if (typeId === "timeline_fracture") {
      d.stats.timelineFractures++;
      if (typeof window.tlCreateBranch === "function") {
        window.tlCreateBranch();
      }
    }
    if (typeId === "universe_collision") {
      d.stats.collisions++;
      // Create a crossworld link
      if (universes.length >= 2) {
        const other = universes.find(u => u.id !== (targetUniverse?.id));
        if (other) {
          d.crossworldLinks.push({
            universeA: universeName,
            universeB: other.name || `Vũ Trụ #${other.id}`,
            year, strength: Math.floor(intensity * 100)
          });
        }
      }
    }
    if (typeId === "spacetime_storm") {
      d.stats.storms++;
      // Anomaly trigger
      if (typeof window.anomV48Trigger === "function") {
        window.anomV48Trigger("time_distortion", countries.length ? countries[0].name : null);
      }
    }

    d.activeDisasters.push(event);
    d.history.unshift(event);
    if (d.history.length > 200) d.history.pop();
    d.stats.totalMvDisasters++;

    if (!d.stats.mostDestructive || sevIdx > d.stats.mostDestructive.severityIdx) {
      d.stats.mostDestructive = { name: type.name, universeName, year, severityIdx: sevIdx };
    }

    // Notifications
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year, type: "mv_disaster", title: `${type.icon} Thảm Họa Đa Vũ Trụ: ${type.name} — ${universeName}`, color: type.color });
    }
    if (typeof window.wmeAddMemory === "function") {
      window.wmeAddMemory({ year, category: "Thảm Họa Đa Vũ Trụ", title: `${type.icon} ${type.name} (${type.severity[sevIdx]})`, content: `${type.desc} Vũ trụ bị ảnh hưởng: ${universeName}.` });
    }
    if (typeof window.waeAddAlert === "function") {
      window.waeAddAlert({ type: "mv_disaster", msg: `${type.icon} THẢM HỌA ĐA VŨ TRỤ: ${type.name} (${type.severity[sevIdx]}) — ${universeName}!` });
    }
    if (typeof window.addLog === "function") {
      window.addLog(`${type.icon} ${type.name} (${type.severity[sevIdx]}) tại ${universeName}!`, "danger");
    }

    save();
    return event;
  }

  // ── EXPIRE ACTIVE ──
  function expireActive() {
    const d = window.mvDisasterV48Data;
    const year = window.year || 1;
    d.activeDisasters = d.activeDisasters.filter(ev => {
      if (ev.active && year >= ev.year + ev.duration) {
        ev.active = false;
        if (typeof window.addLog === "function") {
          window.addLog(`${ev.icon} ${ev.name} tại ${ev.universeName} đã kết thúc.`, "info");
        }
        return false;
      }
      return ev.active;
    });
    save();
  }

  // ── AUTO TRIGGER ──
  function autoTrigger() {
    MV_DISASTER_TYPES.forEach(type => {
      if (Math.random() < type.rarity) {
        triggerMvDisaster(type.id);
      }
    });
    expireActive();
  }

  // ── GAME TICK ──
  window.mvDisasterV48Tick = function() {
    const d = window.mvDisasterV48Data;
    d.lastTick = (d.lastTick || 0) + 1;
    if (d.lastTick % 50 === 0) autoTrigger();
  };

  // ── PUBLIC API ──
  window.mvdV48Trigger = triggerMvDisaster;
  window.mvdV48GetActive = function() { return window.mvDisasterV48Data.activeDisasters; };
  window.mvdV48GetHistory = function() { return window.mvDisasterV48Data.history; };
  window.mvdV48GetStats = function() { return window.mvDisasterV48Data.stats; };
  window.mvdV48GetTypes = function() { return MV_DISASTER_TYPES; };
  window.mvdV48GetLinks = function() { return window.mvDisasterV48Data.crossworldLinks; };

  // ── INIT ──
  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); try { window.mvDisasterV48Tick(); } catch(e) {} };
    console.log("[MultiverseDisasterV48] 🌌 Thảm Họa Đa Vũ Trụ V48 — Sụp Đổ Vũ Trụ · Va Chạm · Nứt Thời Gian · Bão Không-Thời Gian sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 5200); });
  } else {
    setTimeout(init, 5200);
  }
})();
