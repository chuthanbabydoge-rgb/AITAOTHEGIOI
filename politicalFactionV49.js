(function() {
  "use strict";
  const SAVE_KEY = "cgv6_faction_v49";

  // ============================================================
  // POLITICAL FACTION V49 — Phe Phái Chính Trị
  // 5 phe phái · Power struggle · Coalition · AI decision-making
  // Mở rộng livingCivilizationAI.js — KHÔNG thay thế
  // ============================================================

  const FACTION_TYPES = {
    CONSERVATIVE: {
      id: "CONSERVATIVE", name: "Bảo Thủ", icon: "🏰", color: "#f59e0b",
      desc: "Bảo vệ truyền thống và trật tự cũ. Chống lại thay đổi nhanh.",
      agenda: { stability: +15, economy: -5, reform_speed: -20, military: +10 },
      policies: ["Duy trì luật cũ", "Tăng cường quân sự", "Bảo vệ quý tộc", "Hạn chế ngoại thương"],
    },
    REFORMIST: {
      id: "REFORMIST", name: "Cải Cách", icon: "📜", color: "#22c55e",
      desc: "Ủng hộ cải cách tiến bộ, quyền bình đẳng và mở cửa xã hội.",
      agenda: { stability: -5, economy: +10, reform_speed: +25, military: -5 },
      policies: ["Cải cách thuế", "Mở rộng quyền dân", "Phát triển giáo dục", "Tự do thương mại"],
    },
    MILITARIST: {
      id: "MILITARIST", name: "Quân Sự", icon: "⚔️", color: "#dc2626",
      desc: "Đặt quân sự lên hàng đầu. Tin rằng sức mạnh là nền tảng an ninh.",
      agenda: { stability: +5, economy: -10, reform_speed: -10, military: +25 },
      policies: ["Tăng quân bị", "Mở rộng lãnh thổ", "Bắt buộc nghĩa vụ", "Đối ngoại cứng rắn"],
    },
    RELIGIOUS: {
      id: "RELIGIOUS", name: "Tôn Giáo", icon: "⛪", color: "#a78bfa",
      desc: "Đặt đức tin và giáo lý lên trên chính trị. Muốn thần quyền hóa nhà nước.",
      agenda: { stability: +10, economy: 0, reform_speed: -5, religion_power: +30 },
      policies: ["Thần quyền hóa luật pháp", "Xây dựng thánh đường", "Thánh chiến", "Trừng phạt dị giáo"],
    },
    MERCHANT: {
      id: "MERCHANT", name: "Thương Nhân", icon: "💰", color: "#06b6d4",
      desc: "Ưu tiên kinh tế và thương mại. Muốn giảm thuế và mở cửa thị trường.",
      agenda: { stability: 0, economy: +20, reform_speed: +10, military: -10 },
      policies: ["Giảm thuế thương mại", "Mở tuyến đường mới", "Bảo vệ thương nhân", "Ký hiệp ước thương mại"],
    },
  };

  function defaultData() {
    return {
      entityFactions: {},    // { entityId: { factions: [...], dominant: factionId, coalition: [...], log: [...] } }
      globalEvents: [],      // Political faction events across all entities
      lastTick: 0,
      stats: {
        totalFactionEntities: 0,
        coups: 0,
        coalitionsFormed: 0,
        dominantFactions: {},
        legislationPassed: 0,
      },
    };
  }

  window.factionV49Data = window.factionV49Data || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.factionV49Data)); } catch(e) {} }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.factionV49Data = Object.assign(defaultData(), JSON.parse(d));
    } catch(e) { window.factionV49Data = defaultData(); }
  }

  // ── INITIALIZE FACTIONS FOR ENTITY ──
  function initEntityFactions(entityId, entityName) {
    const d = window.factionV49Data;
    if (d.entityFactions[entityId]) return;

    const factions = Object.values(FACTION_TYPES).map(f => ({
      ...f,
      power: 10 + Math.floor(Math.random() * 40),    // 0-100% power
      seats: Math.floor(Math.random() * 20) + 5,
      satisfaction: 40 + Math.floor(Math.random() * 40),
      leader: _randomFactionLeader(f.name),
    }));

    // Normalize power to sum ~100
    const totalPower = factions.reduce((s, f) => s + f.power, 0);
    factions.forEach(f => { f.power = Math.round(f.power / totalPower * 100); });

    // Find dominant faction
    const dominant = factions.sort((a, b) => b.power - a.power)[0];

    d.entityFactions[entityId] = {
      entityId,
      entityName,
      factions: Object.fromEntries(factions.map(f => [f.id, f])),
      dominant: dominant.id,
      coalition: [],
      currentPolicy: dominant.policies[0],
      satisfaction: 60,
      log: [{ year: window.year || 1, event: `Hệ thống phe phái được thành lập. ${dominant.icon} ${dominant.name} chiếm ưu thế.` }],
    };

    d.stats.totalFactionEntities++;
    d.stats.dominantFactions[dominant.id] = (d.stats.dominantFactions[dominant.id] || 0) + 1;
    save();
  }

  function _randomFactionLeader(factionName) {
    const names = ["Nguyễn","Trần","Lê","Phạm","Hoàng"];
    const lasts = ["Bình","Minh","Tuấn","Anh","Quân","Hùng","Thắng","Linh"];
    return `${names[Math.floor(Math.random()*names.length)]} ${lasts[Math.floor(Math.random()*lasts.length)]}`;
  }

  // ── POWER STRUGGLE ──
  function updatePowerStruggle(entityId) {
    const d = window.factionV49Data;
    const ef = d.entityFactions[entityId];
    if (!ef) return;

    const factions = Object.values(ef.factions);
    // Each tick: factions gain/lose power
    factions.forEach(f => {
      // Base power drift toward equilibrium
      const change = Math.floor(Math.random() * 6) - 3;
      f.power = Math.max(5, Math.min(60, f.power + change));
      // Satisfaction changes
      f.satisfaction = Math.max(10, Math.min(100, f.satisfaction + Math.floor(Math.random() * 6) - 3));
    });

    // Normalize
    const total = factions.reduce((s, f) => s + f.power, 0);
    factions.forEach(f => { f.power = Math.round(f.power / total * 100); });

    // Update dominant faction
    const newDominant = factions.sort((a, b) => b.power - a.power)[0];
    if (newDominant.id !== ef.dominant) {
      const old = ef.dominant;
      ef.dominant = newDominant.id;
      ef.currentPolicy = newDominant.policies[Math.floor(Math.random() * newDominant.policies.length)];
      const year = window.year || 1;
      ef.log.unshift({ year, event: `${newDominant.icon} ${newDominant.name} giành quyền kiểm soát từ phe ${FACTION_TYPES[old]?.name || old}` });
      if (ef.log.length > 100) ef.log.pop();

      d.globalEvents.unshift({ year, entityName: ef.entityName, factionId: newDominant.id, factionName: newDominant.name, event: "power_shift" });
      if (d.globalEvents.length > 200) d.globalEvents.pop();

      if (typeof window.htAddEvent === "function") {
        window.htAddEvent({ year, type: "politics", title: `${newDominant.icon} ${ef.entityName}: Phe ${newDominant.name} lên nắm quyền!`, color: newDominant.color });
      }
      if (typeof window.waeAddAlert === "function") {
        window.waeAddAlert({ type: "faction", msg: `${newDominant.icon} ${ef.entityName}: Phe ${newDominant.name} giành ưu thế!` });
      }
      if (typeof window.addLog === "function") {
        window.addLog(`${newDominant.icon} ${ef.entityName}: Phe ${newDominant.name} nắm quyền kiểm soát.`, "info");
      }
    }
    save();
  }

  // ── COALITION FORMATION ──
  function tryFormCoalition(entityId) {
    const d = window.factionV49Data;
    const ef = d.entityFactions[entityId];
    if (!ef || Math.random() > 0.2) return;

    const factions = Object.values(ef.factions);
    const weaker = factions.filter(f => f.power < 25);
    if (weaker.length < 2) return;

    const coalition = weaker.slice(0, 2).map(f => f.id);
    const combined = coalition.reduce((s, id) => s + (ef.factions[id]?.power || 0), 0);
    if (combined > (ef.factions[ef.dominant]?.power || 0)) {
      ef.coalition = coalition;
      const year = window.year || 1;
      const names = coalition.map(id => FACTION_TYPES[id]?.name || id).join(" + ");
      ef.log.unshift({ year, event: `Liên minh: ${names} hợp tác chống lại ${FACTION_TYPES[ef.dominant]?.name}` });
      if (ef.log.length > 100) ef.log.pop();

      d.stats.coalitionsFormed++;
      if (typeof window.addLog === "function") {
        window.addLog(`🤝 ${ef.entityName}: Liên minh phe phái ${names} được thành lập!`, "info");
      }
      save();
    }
  }

  // ── PASS LEGISLATION ──
  function passLegislation(entityId) {
    const d = window.factionV49Data;
    const ef = d.entityFactions[entityId];
    if (!ef || Math.random() > 0.1) return;

    const dominant = ef.factions[ef.dominant];
    if (!dominant) return;
    const policy = dominant.policies[Math.floor(Math.random() * dominant.policies.length)];
    const year = window.year || 1;

    ef.log.unshift({ year, event: `Phe ${dominant.name} thông qua luật: "${policy}"` });
    if (ef.log.length > 100) ef.log.pop();

    d.stats.legislationPassed++;
    if (typeof window.wmeAddMemory === "function") {
      window.wmeAddMemory({ year, category: "Chính Trị", title: `📜 ${ef.entityName}: ${policy}`, content: `Phe ${dominant.name} thành công thông qua chính sách mới.` });
    }
    if (typeof window.addLog === "function") {
      window.addLog(`📜 ${ef.entityName}: Phe ${dominant.icon} ${dominant.name} thông qua "${policy}"`, "info");
    }
    save();
  }

  // ── SYNC ENTITIES ──
  function syncEntities() {
    const d = window.factionV49Data;
    const ks = window.kingdomData && window.kingdomData.kingdoms ? window.kingdomData.kingdoms : {};
    const es = window.empireData && window.empireData.empires ? window.empireData.empires : {};
    const cs = (window.countries || []).slice(0, 15);

    if (typeof ks === "object" && !Array.isArray(ks)) {
      Object.entries(ks).forEach(([id, k]) => { if (k && !k.isCollapsed) initEntityFactions("k_"+id, k.name); });
    }
    if (typeof es === "object" && !Array.isArray(es)) {
      Object.entries(es).forEach(([id, e]) => { if (e && !e.collapsed) initEntityFactions("e_"+id, e.name); });
    }
    cs.filter(c => !c.collapsed).forEach(c => initEntityFactions("c_"+c.id, c.name));
  }

  // ── GAME TICK ──
  window.factionV49Tick = function() {
    const d = window.factionV49Data;
    d.lastTick = (d.lastTick || 0) + 1;
    if (d.lastTick % 25 === 1) syncEntities();
    if (d.lastTick % 40 === 0) {
      Object.keys(d.entityFactions).forEach(entityId => {
        updatePowerStruggle(entityId);
        tryFormCoalition(entityId);
        passLegislation(entityId);
      });
    }
  };

  // ── PUBLIC API ──
  window.facV49GetEntity = (entityId) => window.factionV49Data.entityFactions[entityId];
  window.facV49GetAll = () => Object.values(window.factionV49Data.entityFactions);
  window.facV49GetEvents = () => window.factionV49Data.globalEvents;
  window.facV49GetStats = () => window.factionV49Data.stats;
  window.facV49GetTypes = () => FACTION_TYPES;
  window.facV49InitEntity = initEntityFactions;
  window.facV49TriggerStruggle = updatePowerStruggle;

  // ── INIT ──
  function init() {
    load();
    syncEntities();
    const _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); try { window.factionV49Tick(); } catch(e) {} };
    const entityCount = Object.keys(window.factionV49Data.entityFactions).length;
    console.log("[PoliticalFactionV49] ⚖️ Phe Phái Chính Trị V49 — 5 loại phe · " + entityCount + " thực thể · Power struggle sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 5500); });
  } else {
    setTimeout(init, 5500);
  }
})();
