(function() {
  "use strict";
  const SAVE_KEY = "cgv6_government_v49";

  // ============================================================
  // GOVERNMENT SYSTEM V49 — Chế Độ Chính Trị & Lãnh Đạo AI
  // 8 chế độ · Leaders 6 stats · Succession · Transitions
  // KHÔNG thay thế kingdomEngine/empireEngine — CHỈ MỞ RỘNG
  // ============================================================

  const GOVERNMENT_TYPES = {
    MONARCHY: {
      id: "MONARCHY", name: "Quân Chủ", icon: "👑", color: "#f59e0b",
      desc: "Một người cai trị tối cao. Quyền lực cha truyền con nối.",
      bonuses: { stability: 15, military: 10, economy: -5, reform_speed: -20 },
      successionTypes: ["hereditary", "election_by_nobles"],
      crisisRisk: { coup: 0.15, succession: 0.25, civil_war: 0.10 },
    },
    EMPIRE: {
      id: "EMPIRE", name: "Đế Chế", icon: "🏛️", color: "#dc2626",
      desc: "Hoàng đế cai trị nhiều vương quốc chư hầu. Quyền lực tuyệt đối.",
      bonuses: { stability: 20, military: 20, economy: 10, reform_speed: -30 },
      successionTypes: ["hereditary", "military_coup"],
      crisisRisk: { coup: 0.20, succession: 0.30, civil_war: 0.20 },
    },
    REPUBLIC: {
      id: "REPUBLIC", name: "Cộng Hòa", icon: "🗳️", color: "#22c55e",
      desc: "Dân chúng bầu chọn lãnh đạo. Quyền lực phân tán.",
      bonuses: { stability: 5, economy: 15, reform_speed: 20, military: -5 },
      successionTypes: ["election", "appointment"],
      crisisRisk: { coup: 0.10, succession: 0.05, civil_war: 0.08, protest: 0.20 },
    },
    THEOCRACY: {
      id: "THEOCRACY", name: "Thần Quyền", icon: "⛪", color: "#a78bfa",
      desc: "Tôn giáo cai trị quốc gia. Lãnh đạo là người được thần thánh chọn.",
      bonuses: { stability: 10, religion_power: 30, economy: -10, military: 5 },
      successionTypes: ["divine_selection", "religious_council"],
      crisisRisk: { coup: 0.08, succession: 0.15, heresy: 0.25 },
    },
    ARISTOCRACY: {
      id: "ARISTOCRACY", name: "Quý Tộc", icon: "🎭", color: "#06b6d4",
      desc: "Giới quý tộc nắm quyền. Hội đồng귀족 quyết định mọi việc.",
      bonuses: { stability: 8, economy: 5, military: 8, reform_speed: -15 },
      successionTypes: ["election_by_nobles", "hereditary"],
      crisisRisk: { coup: 0.18, succession: 0.20, secession: 0.15 },
    },
    FEDERATION: {
      id: "FEDERATION", name: "Liên Bang", icon: "🔗", color: "#f97316",
      desc: "Nhiều quốc gia nhỏ hợp nhất, mỗi bang tự trị trong liên minh.",
      bonuses: { stability: 12, economy: 12, reform_speed: 10, military: -10 },
      successionTypes: ["election", "rotation"],
      crisisRisk: { coup: 0.05, secession: 0.30, civil_war: 0.15 },
    },
    COUNCIL: {
      id: "COUNCIL", name: "Hội Đồng", icon: "👥", color: "#10b981",
      desc: "Hội đồng bô lão cai trị. Mọi quyết định cần đa số đồng thuận.",
      bonuses: { stability: 18, economy: 8, reform_speed: 5, military: -8 },
      successionTypes: ["council_vote"],
      crisisRisk: { coup: 0.06, deadlock: 0.20 },
    },
    CUSTOM: {
      id: "CUSTOM", name: "Tùy Chỉnh", icon: "⚙️", color: "#94a3b8",
      desc: "Chế độ chính trị độc đáo, kết hợp nhiều yếu tố khác nhau.",
      bonuses: { stability: 0, economy: 0, reform_speed: 0, military: 0 },
      successionTypes: ["hereditary"],
      crisisRisk: { coup: 0.10, civil_war: 0.10 },
    },
  };

  // ── LEADER PERSONALITY TRAITS ──
  const LEADER_TRAITS = {
    AMBITIOUS:    { id: "AMBITIOUS",    name: "Tham Vọng",     icon: "🔥", desc: "Luôn muốn mở rộng quyền lực và lãnh thổ.",   bonus: { expansion: 20, stability: -5 } },
    DIPLOMATIC:   { id: "DIPLOMATIC",   name: "Ngoại Giao",    icon: "🤝", desc: "Ưu tiên đàm phán và liên minh hòa bình.",    bonus: { relations: 25, military: -10 } },
    MILITARIST:   { id: "MILITARIST",   name: "Hiếu Chiến",    icon: "⚔️", desc: "Tin vào sức mạnh quân sự để giải quyết mọi thứ.", bonus: { military: 20, stability: -8 } },
    CORRUPT:      { id: "CORRUPT",      name: "Tham Nhũng",    icon: "💰", desc: "Vơ vét ngân khố cho bản thân, bỏ bê triều chính.", bonus: { economy: -15, corruption: 30 } },
    REFORMIST:    { id: "REFORMIST",    name: "Cải Cách",      icon: "📜", desc: "Luôn cải cách luật lệ để phát triển quốc gia.", bonus: { reform_speed: 30, stability: 5 } },
    ISOLATIONIST: { id: "ISOLATIONIST", name: "Cô Lập",        icon: "🏔️", desc: "Tránh can thiệp vào ngoại giao quốc tế.",    bonus: { stability: 10, relations: -20 } },
    EXPANSIONIST: { id: "EXPANSIONIST", name: "Bành Trướng",   icon: "🌐", desc: "Muốn chinh phục và hợp nhất lãnh thổ mới.",  bonus: { territory: 20, war_risk: 25 } },
    PIOUS:        { id: "PIOUS",        name: "Mộ Đạo",        icon: "🙏", desc: "Đặt đức tin lên trên mọi thứ.",              bonus: { religion_power: 25, stability: 8 } },
  };

  function defaultData() {
    return {
      governments: {},       // { entityId: { type, leader, stats, founded, history } }
      successions: [],       // Upcoming/pending successions
      transitions: [],       // Government type transitions
      leaderHistory: [],     // All past leaders
      lastTick: 0,
      stats: {
        totalGovs: 0,
        transitions: 0,
        successorsCrowned: 0,
        corruptLeaders: 0,
        reformistLeaders: 0,
        govTypeCount: {},
      },
    };
  }

  window.govV49Data = window.govV49Data || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.govV49Data)); } catch(e) {} }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.govV49Data = Object.assign(defaultData(), JSON.parse(d));
    } catch(e) { window.govV49Data = defaultData(); }
  }

  // ── GET ALL ENTITIES ──
  function getEntities() {
    const list = [];
    const ks = window.kingdomData && window.kingdomData.kingdoms ? window.kingdomData.kingdoms : {};
    const es = window.empireData && window.empireData.empires ? window.empireData.empires : {};
    const cs = window.countries || [];

    if (typeof ks === "object" && !Array.isArray(ks)) {
      Object.entries(ks).forEach(([id, k]) => { if (k && !k.isCollapsed) list.push({ id: "k_"+id, name: k.name, type: "kingdom", source: k }); });
    }
    if (typeof es === "object" && !Array.isArray(es)) {
      Object.entries(es).forEach(([id, e]) => { if (e && !e.collapsed) list.push({ id: "e_"+id, name: e.name, type: "empire", source: e }); });
    }
    cs.filter(c => !c.collapsed).slice(0, 15).forEach(c => { list.push({ id: "c_"+c.id, name: c.name, type: "country", source: c }); });
    return list;
  }

  // ── GENERATE LEADER ──
  function generateLeader(entityName, govType) {
    const traits = Object.keys(LEADER_TRAITS);
    const trait1 = LEADER_TRAITS[traits[Math.floor(Math.random() * traits.length)]];
    const trait2Key = traits.filter(t => t !== trait1.id)[Math.floor(Math.random() * (traits.length - 1))];
    const trait2 = LEADER_TRAITS[trait2Key];

    const firstNames = ["Minh","Đại","Hùng","Thanh","Tuấn","Long","Phương","Quốc","Anh","Thiên","Bảo","Hải"];
    const lastNames  = ["Nguyễn","Trần","Lê","Phạm","Hoàng","Vũ","Lý","Đinh","Phan","Bùi"];
    const titles = { MONARCHY:"Vương", EMPIRE:"Hoàng Đế", REPUBLIC:"Chủ Tịch", THEOCRACY:"Thánh Chủ", ARISTOCRACY:"Công Tước", FEDERATION:"Chủ Tịch Liên Bang", COUNCIL:"Hội Trưởng", CUSTOM:"Thủ Lĩnh" };

    return {
      id: "ldr_" + Date.now() + "_" + Math.random().toString(36).slice(2,6),
      name: `${lastNames[Math.floor(Math.random()*lastNames.length)]} ${firstNames[Math.floor(Math.random()*firstNames.length)]}`,
      title: titles[govType] || "Lãnh Đạo",
      traits: [trait1, trait2],
      ambition: Math.floor(Math.random() * 100),
      diplomacy: Math.floor(Math.random() * 100),
      militancy: Math.floor(Math.random() * 100),
      corruption: trait1.id === "CORRUPT" || trait2.id === "CORRUPT" ? 50 + Math.floor(Math.random()*50) : Math.floor(Math.random()*30),
      prestige: Math.floor(Math.random() * 100),
      age: 25 + Math.floor(Math.random() * 40),
      reignStart: window.year || 1,
      entityName,
    };
  }

  // ── ASSIGN GOVERNMENT ──
  function assignGovernment(entityId, entityName, entityType, govTypeId) {
    const d = window.govV49Data;
    const govType = GOVERNMENT_TYPES[govTypeId] || GOVERNMENT_TYPES.MONARCHY;
    const leader = generateLeader(entityName, govTypeId);
    const year = window.year || 1;

    d.governments[entityId] = {
      entityId, entityName, entityType,
      type: govTypeId,
      typeName: govType.name,
      typeIcon: govType.icon,
      typeColor: govType.color,
      leader,
      founded: year,
      stability: 60 + Math.floor(Math.random() * 30),
      reformProgress: 0,
      history: [{ year, event: `Thành lập ${govType.name}`, leader: leader.name }],
    };

    d.stats.totalGovs++;
    d.stats.govTypeCount[govTypeId] = (d.stats.govTypeCount[govTypeId] || 0) + 1;
    save();
    return d.governments[entityId];
  }

  // ── AUTO-ASSIGN FOR ENTITIES THAT DON'T HAVE GOV ──
  function syncGovernments() {
    const d = window.govV49Data;
    const entities = getEntities();
    const govKeys = Object.keys(GOVERNMENT_TYPES);

    entities.forEach(e => {
      if (!d.governments[e.id]) {
        // Determine gov type from entity type
        let govType = "MONARCHY";
        if (e.type === "empire") govType = "EMPIRE";
        else if (e.source && e.source.isRepublic) govType = "REPUBLIC";
        else if (e.source && e.source.religion && Math.random() < 0.2) govType = "THEOCRACY";
        else if (Math.random() < 0.1) govType = govKeys[Math.floor(Math.random() * govKeys.length)];
        assignGovernment(e.id, e.name, e.type, govType);
      }
    });
  }

  // ── GOVERNMENT TRANSITION ──
  function triggerTransition(entityId, newGovTypeId, reason) {
    const d = window.govV49Data;
    const gov = d.governments[entityId];
    if (!gov) return;
    const oldType = gov.type;
    const year = window.year || 1;
    const newGovType = GOVERNMENT_TYPES[newGovTypeId];
    if (!newGovType) return;

    gov.type = newGovTypeId;
    gov.typeName = newGovType.name;
    gov.typeIcon = newGovType.icon;
    gov.typeColor = newGovType.color;
    gov.leader = generateLeader(gov.entityName, newGovTypeId);
    gov.history.unshift({ year, event: `Chuyển sang ${newGovType.name}`, reason, leader: gov.leader.name });
    if (gov.history.length > 50) gov.history.pop();

    d.stats.transitions++;
    d.transitions.unshift({ year, entityId, entityName: gov.entityName, from: oldType, to: newGovTypeId, reason });
    if (d.transitions.length > 100) d.transitions.pop();

    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year, type: "politics", title: `${newGovType.icon} ${gov.entityName} chuyển sang ${newGovType.name} (${reason})`, color: newGovType.color });
    }
    if (typeof window.waeAddAlert === "function") {
      window.waeAddAlert({ type: "politics", msg: `${newGovType.icon} ${gov.entityName}: Chuyển sang ${newGovType.name}!` });
    }
    if (typeof window.addLog === "function") {
      window.addLog(`${newGovType.icon} ${gov.entityName} chuyển sang ${newGovType.name}! (${reason})`, "important");
    }
    save();
    return gov;
  }

  // ── SUCCESSION ──
  function triggerSuccession(entityId) {
    const d = window.govV49Data;
    const gov = d.governments[entityId];
    if (!gov) return;
    const year = window.year || 1;
    const oldLeader = gov.leader;

    d.leaderHistory.unshift({ ...oldLeader, diedYear: year, entity: gov.entityName });
    if (d.leaderHistory.length > 200) d.leaderHistory.pop();

    gov.leader = generateLeader(gov.entityName, gov.type);
    gov.history.unshift({ year, event: `Kế vị: ${gov.leader.name} lên ngôi`, leader: gov.leader.name });
    d.stats.successorsCrowned++;

    if (gov.leader.corruption > 60) d.stats.corruptLeaders++;
    if (gov.leader.traits.some(t => t.id === "REFORMIST")) d.stats.reformistLeaders++;

    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year, type: "succession", title: `👑 ${gov.entityName}: ${gov.leader.title} ${gov.leader.name} lên nắm quyền`, color: "#f59e0b" });
    }
    if (typeof window.waeAddAlert === "function") {
      window.waeAddAlert({ type: "succession", msg: `👑 ${gov.entityName}: ${gov.leader.name} kế thừa ngôi vị!` });
    }
    if (typeof window.addLog === "function") {
      window.addLog(`👑 ${gov.entityName}: ${gov.leader.title} ${gov.leader.name} lên nắm quyền.`, "info");
    }
    save();
    return gov.leader;
  }

  // ── AI LEADER DECISIONS ──
  function makeLeaderDecision(govEntry) {
    const leader = govEntry.leader;
    if (!leader) return;
    const traits = leader.traits.map(t => t.id);
    const decisions = [];

    if (traits.includes("REFORMIST") && govEntry.reformProgress < 100) {
      govEntry.reformProgress = Math.min(100, govEntry.reformProgress + Math.floor(Math.random() * 10));
      decisions.push("Thúc đẩy cải cách pháp luật");
    }
    if (traits.includes("MILITARIST") && Math.random() < 0.05) {
      decisions.push("Tăng ngân sách quân sự");
    }
    if (traits.includes("DIPLOMATIC") && Math.random() < 0.04) {
      decisions.push("Đề xuất hiệp ước hòa bình mới");
      if (typeof window.waeAddAlert === "function") {
        window.waeAddAlert({ type: "diplomacy", msg: `🤝 ${govEntry.entityName}: ${leader.name} đề xuất đàm phán hòa bình` });
      }
    }
    if (traits.includes("CORRUPT")) {
      govEntry.stability = Math.max(0, govEntry.stability - 1);
    }
    if (traits.includes("AMBITIOUS") && Math.random() < 0.03) {
      decisions.push("Tuyên bố tham vọng mở rộng lãnh thổ");
    }

    return decisions;
  }

  // ── TICK ──
  window.govV49Tick = function() {
    const d = window.govV49Data;
    d.lastTick = (d.lastTick || 0) + 1;

    if (d.lastTick % 20 === 1) syncGovernments();

    if (d.lastTick % 30 === 0) {
      Object.values(d.governments).forEach(gov => {
        makeLeaderDecision(gov);
        gov.leader.age++;
        // Natural succession: old leader dies
        if (gov.leader.age > 70 + Math.floor(Math.random() * 20) || Math.random() < 0.005) {
          triggerSuccession(gov.entityId);
        }
        // Apply gov bonuses to source entity
        const govType = GOVERNMENT_TYPES[gov.type];
        if (govType && gov.stability < 40 && Math.random() < 0.01) {
          // Risk of government transition if very unstable
          const alternatives = Object.keys(GOVERNMENT_TYPES).filter(k => k !== gov.type);
          triggerTransition(gov.entityId, alternatives[Math.floor(Math.random() * alternatives.length)], "Khủng hoảng ổn định");
        }
      });
    }
  };

  // ── PUBLIC API ──
  window.govV49AssignGovernment = assignGovernment;
  window.govV49TriggerTransition = triggerTransition;
  window.govV49TriggerSuccession = triggerSuccession;
  window.govV49GetGovernment = (entityId) => window.govV49Data.governments[entityId];
  window.govV49GetAll = () => Object.values(window.govV49Data.governments);
  window.govV49GetLeader = (entityId) => window.govV49Data.governments[entityId]?.leader;
  window.govV49GetStats = () => window.govV49Data.stats;
  window.govV49GetTypes = () => GOVERNMENT_TYPES;
  window.govV49GetTraits = () => LEADER_TRAITS;

  // ── INIT ──
  function init() {
    load();
    syncGovernments();
    const _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); try { window.govV49Tick(); } catch(e) {} };
    const govCount = Object.keys(window.govV49Data.governments).length;
    console.log("[GovernmentSystemV49] 🏛️ Chế Độ Chính Trị V49 — 8 chế độ · " + govCount + " chính phủ · Leaders 6 stats sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 5400); });
  } else {
    setTimeout(init, 5400);
  }
})();
