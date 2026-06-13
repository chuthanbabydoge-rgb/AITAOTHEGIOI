(function() {
  "use strict";
  const SAVE_KEY = "cgv6_crisis_v49";

  // ============================================================
  // POLITICAL CRISIS V49 — Khủng Hoảng Chính Trị
  // Đảo Chính · Nội Chiến · Biểu Tình · Kế Vị · Ly Khai
  // Mở rộng espionageEngine + continentalPoliticsEngine — KHÔNG thay thế
  // ============================================================

  const CRISIS_TYPES = {
    COUP: {
      id: "COUP", name: "Đảo Chính", icon: "⚔️", color: "#dc2626",
      severity: ["Âm Mưu", "Đảo Chính Thất Bại", "Đảo Chính Thành Công", "Cách Mạng Đẫm Máu"],
      desc: "Quân đội hoặc phe phái nổi dậy lật đổ chính quyền hiện tại.",
      effects: {
        stability: [-10, -25, -50, -80],
        military:  [0, -10, -5, -20],
        economy:   [-5, -15, -25, -40],
      },
      resolution: ["Đàm phán", "Trấn áp", "Chính phủ mới", "Thỏa thuận bí mật"],
    },
    CIVIL_WAR: {
      id: "CIVIL_WAR", name: "Nội Chiến", icon: "🔥", color: "#f97316",
      severity: ["Xung Đột Nhỏ", "Nội Chiến Cục Bộ", "Đại Nội Chiến", "Tuyệt Diệt Quốc Gia"],
      desc: "Các phe phái trong quốc gia giao chiến với nhau, đất nước chia rẽ.",
      effects: {
        stability: [-20, -45, -70, -95],
        military:  [-10, -25, -40, -60],
        economy:   [-15, -35, -60, -90],
        population:[-5, -15, -30, -60],
      },
      resolution: ["Hòa giải", "Thắng lợi quân sự", "Chia cắt lãnh thổ", "Can thiệp ngoại bang"],
    },
    PROTEST: {
      id: "PROTEST", name: "Biểu Tình", icon: "✊", color: "#f59e0b",
      severity: ["Bất Bình Nhỏ", "Biểu Tình Lớn", "Bạo Loạn", "Cách Mạng Nhân Dân"],
      desc: "Dân chúng xuống đường phản đối chính sách của nhà nước.",
      effects: {
        stability: [-5, -15, -30, -55],
        economy:   [-3, -10, -20, -35],
        military:  [0, 0, -5, -15],
      },
      resolution: ["Nhượng bộ", "Đàn áp", "Cải cách", "Thiết quân luật"],
    },
    SUCCESSION_CRISIS: {
      id: "SUCCESSION_CRISIS", name: "Khủng Hoảng Kế Vị", icon: "👑", color: "#a78bfa",
      severity: ["Tranh Giành Nhẹ", "Tranh Chấp Lớn", "Nội Chiến Kế Vị", "Sụp Đổ Vương Triều"],
      desc: "Nhiều người tranh giành ngôi vị sau khi lãnh đạo qua đời hoặc thoái vị.",
      effects: {
        stability: [-8, -20, -40, -70],
        economy:   [-5, -12, -25, -50],
        military:  [0, -5, -20, -40],
      },
      resolution: ["Giải quyết qua hội đồng", "Chiến thắng người kế vị", "Hôn nhân chính trị", "Chia ngôi"],
    },
    SECESSION: {
      id: "SECESSION", name: "Ly Khai", icon: "🗺️", color: "#06b6d4",
      severity: ["Phong Trào Nhỏ", "Đòi Tự Trị", "Tuyên Bố Độc Lập", "Ly Khai Hoàn Toàn"],
      desc: "Một vùng lãnh thổ tuyên bố độc lập và tách khỏi quốc gia.",
      effects: {
        stability: [-10, -25, -45, -70],
        territory: [0, -10, -25, -50],
        economy:   [-5, -15, -30, -50],
      },
      resolution: ["Đàm phán tự trị", "Trấn áp quân sự", "Công nhận độc lập", "Liên bang hóa"],
    },
  };

  function defaultData() {
    return {
      activeCrises: [],
      history: [],
      resolutions: [],
      lastTick: 0,
      stats: {
        totalCrises: 0,
        coups: 0,
        civilWars: 0,
        protests: 0,
        successionCrises: 0,
        secessions: 0,
        resolved: 0,
        mostUnstable: null,
      },
    };
  }

  window.crisisV49Data = window.crisisV49Data || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.crisisV49Data)); } catch(e) {} }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.crisisV49Data = Object.assign(defaultData(), JSON.parse(d));
    } catch(e) { window.crisisV49Data = defaultData(); }
  }

  // ── TRIGGER CRISIS ──
  function triggerCrisis(typeId, entityName, severityIdx, reason) {
    const d = window.crisisV49Data;
    const type = CRISIS_TYPES[typeId];
    if (!type) return null;

    const year = window.year || 1;
    const sevIdx = severityIdx !== undefined ? severityIdx : Math.floor(Math.random() * 4);

    const crisis = {
      id: "crisis_" + Date.now() + "_" + Math.random().toString(36).slice(2,6),
      typeId,
      name: type.name,
      icon: type.icon,
      color: type.color,
      severity: type.severity[sevIdx],
      severityIdx: sevIdx,
      entityName,
      year,
      reason: reason || "Tình hình nội bộ xấu đi",
      desc: type.desc,
      active: true,
      duration: Math.max(3, (sevIdx + 1) * 10),
      resolution: null,
      effects: {},
    };

    // Apply effects to world
    const countries = window.countries || [];
    const affected = countries.find(c => c.name === entityName);
    if (affected) {
      const effStab = type.effects.stability[sevIdx] || 0;
      const effEcon = type.effects.economy[sevIdx] || 0;
      const effPop  = type.effects.population?.[sevIdx] || 0;
      if (affected.stability !== undefined) {
        affected.stability = Math.max(0, Math.min(100, (affected.stability || 50) + effStab));
        crisis.effects.stability = effStab;
      }
      if (affected.gdp && effEcon) {
        const loss = Math.abs(Math.floor(affected.gdp * Math.abs(effEcon) / 100));
        affected.gdp = Math.max(0, affected.gdp - loss);
        crisis.effects.economy = -loss;
      }
      if (affected.population && effPop) {
        const loss = Math.abs(Math.floor(affected.population * Math.abs(effPop) / 100));
        affected.population = Math.max(10, affected.population - loss);
        crisis.effects.population = -loss;
      }
    }

    // Government transition for successful coups
    if (typeId === "COUP" && sevIdx >= 2 && typeof window.govV49TriggerTransition === "function") {
      const govs = typeof window.govV49GetAll === "function" ? window.govV49GetAll() : [];
      const govEntry = govs.find(g => g.entityName === entityName);
      if (govEntry) {
        const newTypes = Object.keys({ REPUBLIC: 1, MONARCHY: 1, MILITARIST: 1, COUNCIL: 1 }).filter(t => t !== govEntry.type);
        window.govV49TriggerTransition(govEntry.entityId, newTypes[Math.floor(Math.random() * newTypes.length)], "Đảo chính thành công");
      }
    }

    // Faction effects
    if (typeof window.facV49GetAll === "function") {
      const factions = window.facV49GetAll();
      const ef = factions.find(f => f.entityName === entityName);
      if (ef && typeId === "COUP") {
        window.facV49TriggerStruggle && window.facV49TriggerStruggle(ef.entityId);
      }
    }

    // Track stats
    d.activeCrises.push(crisis);
    d.history.unshift(crisis);
    if (d.history.length > 300) d.history.pop();
    d.stats.totalCrises++;
    if (typeId === "COUP")               d.stats.coups++;
    if (typeId === "CIVIL_WAR")          d.stats.civilWars++;
    if (typeId === "PROTEST")            d.stats.protests++;
    if (typeId === "SUCCESSION_CRISIS")  d.stats.successionCrises++;
    if (typeId === "SECESSION")          d.stats.secessions++;

    // Notifications
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year, type: "crisis", title: `${type.icon} ${type.name}: ${type.severity[sevIdx]} — ${entityName}`, color: type.color });
    }
    if (typeof window.wmeAddMemory === "function") {
      window.wmeAddMemory({ year, category: "Khủng Hoảng Chính Trị", title: `${type.icon} ${type.name} tại ${entityName}`, content: `${type.desc} Mức độ: ${type.severity[sevIdx]}. Nguyên nhân: ${crisis.reason}.` });
    }
    if (typeof window.waeAddAlert === "function") {
      window.waeAddAlert({ type: "crisis", msg: `${type.icon} KHỦNG HOẢNG: ${type.name} (${type.severity[sevIdx]}) tại ${entityName}!` });
    }
    if (typeof window.addLog === "function") {
      window.addLog(`${type.icon} ${type.name} (${type.severity[sevIdx]}) tại ${entityName}! — ${crisis.reason}`, "danger");
    }

    save();
    return crisis;
  }

  // ── RESOLVE CRISIS ──
  function resolveCrisis(crisisId, resolutionIdx) {
    const d = window.crisisV49Data;
    const crisis = d.activeCrises.find(c => c.id === crisisId);
    if (!crisis) return;

    const type = CRISIS_TYPES[crisis.typeId];
    const resolution = type ? type.resolution[resolutionIdx || Math.floor(Math.random() * type.resolution.length)] : "Tự giải quyết";
    crisis.active = false;
    crisis.resolution = resolution;
    crisis.resolvedYear = window.year || 1;

    d.activeCrises = d.activeCrises.filter(c => c.id !== crisisId);
    d.resolutions.unshift({ ...crisis, resolution });
    if (d.resolutions.length > 100) d.resolutions.pop();
    d.stats.resolved++;

    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: window.year || 1, type: "crisis_resolved", title: `✅ ${crisis.name} tại ${crisis.entityName} được giải quyết: ${resolution}`, color: "#22c55e" });
    }
    if (typeof window.addLog === "function") {
      window.addLog(`✅ ${crisis.icon} ${crisis.name} tại ${crisis.entityName}: ${resolution}`, "success");
    }
    save();
  }

  // ── AUTO-EXPIRE ──
  function expireCrises() {
    const d = window.crisisV49Data;
    const year = window.year || 1;
    d.activeCrises.forEach(c => {
      if (c.active && year >= c.year + c.duration) {
        resolveCrisis(c.id, Math.floor(Math.random() * 4));
      }
    });
  }

  // ── AUTO-TRIGGER FROM STABILITY ──
  function autoTrigger() {
    const countries = window.countries || [];
    const year = window.year || 1;

    countries.filter(c => !c.collapsed && (c.stability || 50) < 30).forEach(c => {
      const existingCrisis = window.crisisV49Data.activeCrises.some(cr => cr.entityName === c.name);
      if (!existingCrisis && Math.random() < 0.15) {
        const types = Object.keys(CRISIS_TYPES);
        const typeId = types[Math.floor(Math.random() * types.length)];
        const sevIdx = c.stability < 15 ? 2 + Math.floor(Math.random() * 2) : Math.floor(Math.random() * 3);
        triggerCrisis(typeId, c.name, sevIdx, "Bất ổn nội bộ kéo dài");
      }
    });

    // Also auto-trigger succession crises when gov leaders are old
    if (typeof window.govV49GetAll === "function") {
      window.govV49GetAll().forEach(gov => {
        if (gov.leader && gov.leader.age > 75 && Math.random() < 0.02) {
          const existing = window.crisisV49Data.activeCrises.some(c => c.entityName === gov.entityName && c.typeId === "SUCCESSION_CRISIS");
          if (!existing) triggerCrisis("SUCCESSION_CRISIS", gov.entityName, Math.floor(Math.random() * 3), `Lãnh đạo ${gov.leader.name} già yếu`);
        }
      });
    }

    // Trigger from disaster stability hits
    const disasterData = window.disasterData || {};
    (disasterData.activeDisasters || []).slice(0, 3).forEach(dis => {
      if (dis.region && Math.random() < 0.04) {
        const existing = window.crisisV49Data.activeCrises.some(c => c.entityName === dis.region);
        if (!existing) triggerCrisis("PROTEST", dis.region, 1, `Thiên tai ${dis.name} gây bất mãn`);
      }
    });
  }

  // ── GAME TICK ──
  window.crisisV49Tick = function() {
    const d = window.crisisV49Data;
    d.lastTick = (d.lastTick || 0) + 1;
    if (d.lastTick % 40 === 0) {
      autoTrigger();
      expireCrises();
    }
  };

  // ── PUBLIC API ──
  window.criV49Trigger = triggerCrisis;
  window.criV49Resolve = resolveCrisis;
  window.criV49GetActive = () => window.crisisV49Data.activeCrises;
  window.criV49GetHistory = () => window.crisisV49Data.history;
  window.criV49GetStats = () => window.crisisV49Data.stats;
  window.criV49GetTypes = () => CRISIS_TYPES;

  // ── INIT ──
  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); try { window.crisisV49Tick(); } catch(e) {} };
    const active = window.crisisV49Data.activeCrises.length;
    console.log("[PoliticalCrisisV49] 🔥 Khủng Hoảng Chính Trị V49 — Đảo Chính · Nội Chiến · Biểu Tình · Kế Vị · Ly Khai · " + active + " đang diễn ra.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 5600); });
  } else {
    setTimeout(init, 5600);
  }
})();
