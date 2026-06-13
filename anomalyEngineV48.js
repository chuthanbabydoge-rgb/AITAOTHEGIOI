(function() {
  "use strict";
  const SAVE_KEY = "cgv6_anomaly_v48";

  // ============================================================
  // ANOMALY ENGINE V48 — Dị Tượng Thần Bí
  // Cổng Không Gian · Mưa Thần Lực · Dị Giới Xâm Nhập · Thần Linh Thức Tỉnh · Ma Giới Mở Cửa
  // ============================================================

  const ANOMALY_TYPES = [
    {
      id: "space_portal", name: "Cổng Không Gian", icon: "🌀", color: "#8b5cf6",
      rarity: 0.008,
      effects: {
        desc: "Một cổng không gian bí ẩn mở ra giữa hư không, dẫn đến thế giới chưa biết.",
        worldEffect: "multiverse_connect",
        duration: [10, 50],
        power: [20, 80],
        bonuses: { exploration: 30, danger: 20, trade: -10 },
      },
    },
    {
      id: "mana_rain", name: "Mưa Thần Lực", icon: "✨", color: "#f59e0b",
      rarity: 0.015,
      effects: {
        desc: "Linh khí từ tầng cao thiên giới đổ xuống như mưa, vạn vật thấm đẫm nguồn năng lượng huyền bí.",
        worldEffect: "mana_surge",
        duration: [3, 15],
        power: [30, 100],
        bonuses: { cultivation: 50, agriculture: 20, population: 5 },
      },
    },
    {
      id: "otherworld_invasion", name: "Dị Giới Xâm Nhập", icon: "👾", color: "#dc2626",
      rarity: 0.006,
      effects: {
        desc: "Sinh vật từ dị giới xé toạc không gian xâm nhập vào thế giới này, mang theo hỗn loạn và hủy diệt.",
        worldEffect: "invasion",
        duration: [20, 100],
        power: [40, 90],
        bonuses: { population: -15, stability: -30, military: -20, cultivation: -10 },
      },
    },
    {
      id: "divine_awakening", name: "Thần Linh Thức Tỉnh", icon: "☀️", color: "#fbbf24",
      rarity: 0.005,
      effects: {
        desc: "Một vị thần cổ đại thức tỉnh từ giấc ngủ vạn năm, ánh hào quang thần thánh bao trùm khắp đại địa.",
        worldEffect: "divine_surge",
        duration: [30, 200],
        power: [50, 100],
        bonuses: { religion: 60, cultivation: 40, stability: 20, economy: 15 },
      },
    },
    {
      id: "demon_realm_open", name: "Ma Giới Mở Cửa", icon: "🌑", color: "#7c3aed",
      rarity: 0.007,
      effects: {
        desc: "Ma giới phong ấn ngàn năm bị phá vỡ, ma khí tràn lan, ác quỷ kéo nhau xâm nhập dương gian.",
        worldEffect: "demon_surge",
        duration: [25, 150],
        power: [35, 85],
        bonuses: { stability: -40, population: -20, corruption: 50, cultivation: -25 },
      },
    },
    {
      id: "time_distortion", name: "Biến Dạng Thời Gian", icon: "⌛", color: "#06b6d4",
      rarity: 0.004,
      effects: {
        desc: "Dòng thời gian cục bộ bị bóp méo — một số vùng trải qua hàng thế kỷ trong chốc lát, nơi khác đứng yên.",
        worldEffect: "time_warp",
        duration: [5, 30],
        power: [40, 100],
        bonuses: { population: -5, technology: 30, aging_speed: 200 },
      },
    },
  ];

  function defaultData() {
    return {
      activeAnomalies: [],
      history: [],
      totalCount: 0,
      lastTick: 0,
      stats: {
        totalAnomalies: 0,
        mostFrequent: null,
        mostPowerful: null,
        divineAwakenings: 0,
        demonRealmsOpened: 0,
        portalsOpened: 0,
      },
    };
  }

  window.anomalyV48Data = window.anomalyV48Data || defaultData();

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.anomalyV48Data)); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.anomalyV48Data = Object.assign(defaultData(), JSON.parse(d));
    } catch(e) { window.anomalyV48Data = defaultData(); }
  }

  // ── TRIGGER ANOMALY ──
  function triggerAnomaly(typeId, regionName) {
    const d = window.anomalyV48Data;
    const type = ANOMALY_TYPES.find(t => t.id === typeId);
    if (!type) return null;

    const countries = window.countries || [];
    const region = regionName || (countries.length ? countries[Math.floor(Math.random() * countries.length)].name : "Vùng Huyền Bí");
    const year = window.year || 1;
    const power = type.effects.power[0] + Math.floor(Math.random() * (type.effects.power[1] - type.effects.power[0]));
    const duration = type.effects.duration[0] + Math.floor(Math.random() * (type.effects.duration[1] - type.effects.duration[0]));

    const anomaly = {
      id: "an_" + Date.now() + "_" + Math.random().toString(36).slice(2),
      typeId: type.id,
      name: type.name,
      icon: type.icon,
      color: type.color,
      region,
      year,
      power,
      duration,
      endYear: year + duration,
      desc: type.effects.desc,
      worldEffect: type.effects.worldEffect,
      bonuses: type.effects.bonuses,
      active: true,
    };

    // Apply bonus effects to affected countries
    const powerMult = power / 100;
    const affected = countries.filter(c => c.name === region || Math.random() < 0.25 * powerMult);
    affected.forEach(c => {
      const bonuses = type.effects.bonuses;
      if (bonuses.population && c.population) {
        const delta = Math.floor(c.population * Math.abs(bonuses.population) / 100);
        c.population = Math.max(10, bonuses.population > 0 ? c.population + delta : c.population - delta);
      }
      if (bonuses.stability !== undefined && c.stability !== undefined) {
        c.stability = Math.max(0, Math.min(100, (c.stability || 50) + bonuses.stability * powerMult));
      }
    });

    // Special effects by type
    if (type.id === "space_portal" && typeof window.mvData !== "undefined") {
      d.stats.portalsOpened++;
    }
    if (type.id === "divine_awakening") {
      d.stats.divineAwakenings++;
      if (typeof window.htAddEvent === "function") {
        window.htAddEvent({ year, type: "divine", title: `☀️ Thần Linh Thức Tỉnh tại ${region}!`, color: "#fbbf24" });
      }
    }
    if (type.id === "demon_realm_open") {
      d.stats.demonRealmsOpened++;
      if (typeof window.htAddEvent === "function") {
        window.htAddEvent({ year, type: "demon", title: `🌑 Ma Giới Mở Cửa tại ${region}!`, color: "#7c3aed" });
      }
    }

    d.activeAnomalies.push(anomaly);
    d.history.unshift(anomaly);
    if (d.history.length > 300) d.history.pop();
    d.totalCount++;
    d.stats.totalAnomalies++;

    if (!d.stats.mostPowerful || power > d.stats.mostPowerful.power) {
      d.stats.mostPowerful = { name: type.name, region, year, power };
    }

    // Update most frequent
    const freq = {};
    d.history.forEach(h => { freq[h.typeId] = (freq[h.typeId] || 0) + 1; });
    const topType = Object.entries(freq).sort((a,b) => b[1]-a[1])[0];
    if (topType) d.stats.mostFrequent = ANOMALY_TYPES.find(t => t.id === topType[0])?.name;

    // Notifications
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year, type: "anomaly", title: `${type.icon} Dị Tượng: ${type.name} tại ${region}`, color: type.color });
    }
    if (typeof window.wmeAddMemory === "function") {
      window.wmeAddMemory({ year, category: "Dị Tượng", title: `${type.icon} ${type.name}`, content: `${type.effects.desc} Vùng xuất hiện: ${region}. Sức mạnh: ${power}%. Kéo dài ${duration} năm.` });
    }
    if (typeof window.waeAddAlert === "function") {
      window.waeAddAlert({ type: "anomaly", msg: `${type.icon} Dị Tượng: ${type.name} xuất hiện tại ${region}! (Sức mạnh: ${power}%)` });
    }
    if (typeof window.addLog === "function") {
      window.addLog(`${type.icon} Dị Tượng ${type.name} tại ${region}! (${power}% sức mạnh)`, "important");
    }

    save();
    return anomaly;
  }

  // ── EXPIRE ANOMALIES ──
  function expireAnomalies() {
    const d = window.anomalyV48Data;
    const year = window.year || 1;
    d.activeAnomalies.forEach(an => {
      if (an.active && year >= an.endYear) {
        an.active = false;
        if (typeof window.addLog === "function") {
          window.addLog(`${an.icon} Dị Tượng ${an.name} tại ${an.region} đã kết thúc.`, "info");
        }
      }
    });
    d.activeAnomalies = d.activeAnomalies.filter(an => an.active);
    save();
  }

  // ── AUTO TRIGGER ──
  function autoTrigger() {
    ANOMALY_TYPES.forEach(type => {
      if (Math.random() < type.rarity) {
        const countries = window.countries || [];
        const region = countries.length ? countries[Math.floor(Math.random() * countries.length)].name : null;
        triggerAnomaly(type.id, region);
      }
    });
    expireAnomalies();
  }

  // ── GAME TICK ──
  window.anomalyV48Tick = function() {
    const d = window.anomalyV48Data;
    d.lastTick = (d.lastTick || 0) + 1;
    if (d.lastTick % 45 === 0) autoTrigger();
  };

  // ── PUBLIC API ──
  window.anomV48Trigger = triggerAnomaly;
  window.anomV48GetActive = function() { return window.anomalyV48Data.activeAnomalies; };
  window.anomV48GetHistory = function() { return window.anomalyV48Data.history; };
  window.anomV48GetStats = function() { return window.anomalyV48Data.stats; };
  window.anomV48GetTypes = function() { return ANOMALY_TYPES; };

  // ── INIT ──
  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); try { window.anomalyV48Tick(); } catch(e) {} };
    console.log("[AnomalyEngineV48] 🌀 Dị Tượng Thần Bí V48 — 6 loại · " + window.anomalyV48Data.stats.totalAnomalies + " đã xuất hiện.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 5100); });
  } else {
    setTimeout(init, 5100);
  }
})();
