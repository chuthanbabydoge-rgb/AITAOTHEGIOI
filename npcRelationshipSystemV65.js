(function() {
  "use strict";
  const SAVE_KEY = "cgv6_npc_relationship_v65";

  window.npcRelV65Data = {
    version: 65,
    relationships: {},  // key=npcId → [{targetId, targetName, type, score, events:[], since}]
    socialGroups: [],   // [{name, members:[], type, founded}]
    loveStories: [],    // [{a, b, startYear, endYear, outcome}]
    rivalries: [],      // [{a, b, startYear, reason}]
    lastScan: 0
  };

  const REL_TYPES = {
    friend:     { label: "Bạn Bè",     icon: "🤝", color: "#4ade80" },
    enemy:      { label: "Kẻ Thù",     icon: "⚔️", color: "#f87171" },
    ally:       { label: "Đồng Minh",  icon: "🛡️", color: "#60a5fa" },
    lover:      { label: "Người Yêu",  icon: "💕", color: "#f472b6" },
    rival:      { label: "Đối Thủ",    icon: "🔥", color: "#fb923c" },
    mentor:     { label: "Sư Phụ",     icon: "📖", color: "#c084fc" },
    apprentice: { label: "Đệ Tử",      icon: "🌱", color: "#34d399" },
    sibling:    { label: "Huynh Đệ",   icon: "👫", color: "#fbbf24" },
    spouse:     { label: "Vợ/Chồng",   icon: "💒", color: "#e879f9" }
  };
  window.npcRelV65Types = REL_TYPES;

  function ensureRel(npcId) {
    if (!window.npcRelV65Data.relationships[npcId]) {
      window.npcRelV65Data.relationships[npcId] = [];
    }
    return window.npcRelV65Data.relationships[npcId];
  }

  // ════ PUBLIC API ════
  window.npcRel65RecordRelationship = function(npcIdA, npcIdB, type, score, reason) {
    const year = window.year || 0;
    const relsA = ensureRel(npcIdA);
    const relsB = ensureRel(npcIdB);

    // Check existing
    const existingA = relsA.find(r => r.targetId === npcIdB && r.type === type);
    if (existingA) {
      existingA.score = Math.min(100, Math.max(-100, (existingA.score||0) + (score||10)));
      if (reason) existingA.events.push({ year, note: reason });
      return;
    }

    const relObjA = { targetId: npcIdB, targetName: npcIdB, type, score: score||50, events: reason ? [{year, note: reason}] : [], since: year };
    const relObjB = { targetId: npcIdA, targetName: npcIdA, type, score: score||50, events: reason ? [{year, note: reason}] : [], since: year };
    relsA.push(relObjA);
    relsB.push(relObjB);

    // Track special types
    if (type === "lover" || type === "spouse") {
      if (!window.npcRelV65Data.loveStories.find(l => (l.a===npcIdA&&l.b===npcIdB)||(l.a===npcIdB&&l.b===npcIdA))) {
        window.npcRelV65Data.loveStories.push({ a: npcIdA, b: npcIdB, startYear: year, endYear: null, outcome: "ongoing" });
      }
    }
    if (type === "enemy" || type === "rival") {
      if (!window.npcRelV65Data.rivalries.find(r => (r.a===npcIdA&&r.b===npcIdB)||(r.a===npcIdB&&r.b===npcIdA))) {
        window.npcRelV65Data.rivalries.push({ a: npcIdA, b: npcIdB, startYear: year, reason: reason||"Mâu thuẫn" });
      }
    }

    // Propagate to social memory
    if (typeof window.npcMem64AddMemory === "function") {
      const meta = REL_TYPES[type] || { label: type };
      window.npcMem64AddMemory(npcIdA, "social", `${meta.icon||''} ${meta.label} Mới`, `Mối quan hệ ${meta.label} với ${npcIdB} bắt đầu năm ${year}.`, 3);
    }
  };

  window.npcRel65GetRelationships = function(npcId, type) {
    const rels = window.npcRelV65Data.relationships[npcId] || [];
    return type ? rels.filter(r => r.type === type) : rels;
  };

  window.npcRel65GetScore = function(npcIdA, npcIdB) {
    const rels = window.npcRelV65Data.relationships[npcIdA] || [];
    const rel = rels.find(r => r.targetId === npcIdB);
    return rel ? rel.score : 0;
  };

  window.npcRel65GetBestFriends = function(npcId, limit) {
    const rels = window.npcRelV65Data.relationships[npcId] || [];
    return rels.filter(r => r.type === "friend" || r.type === "ally").sort((a,b) => b.score - a.score).slice(0, limit||3);
  };

  window.npcRel65GetEnemies = function(npcId, limit) {
    const rels = window.npcRelV65Data.relationships[npcId] || [];
    return rels.filter(r => r.type === "enemy" || r.type === "rival").sort((a,b) => a.score - b.score).slice(0, limit||3);
  };

  window.npcRel65GetSocialProfile = function(npcId) {
    const rels = window.npcRelV65Data.relationships[npcId] || [];
    const friends = rels.filter(r => r.type === "friend").length;
    const enemies = rels.filter(r => r.type === "enemy").length;
    const allies  = rels.filter(r => r.type === "ally").length;
    const lover   = rels.find(r => r.type === "lover" || r.type === "spouse");
    const mentor  = rels.find(r => r.type === "mentor");
    const totalScore = rels.reduce((s,r) => s + Math.max(0, r.score), 0);
    return { npcId, friends, enemies, allies, lover: lover?.targetId || null, mentor: mentor?.targetId || null, totalScore, totalRels: rels.length };
  };

  window.npcRel65GetTopSocial = function(limit) {
    return Object.entries(window.npcRelV65Data.relationships)
      .map(([id, rels]) => ({ id, count: rels.length, friends: rels.filter(r=>r.type==="friend").length }))
      .sort((a,b) => b.count - a.count)
      .slice(0, limit||10);
  };

  window.npcRel65GetLoveStories = function(limit) {
    return window.npcRelV65Data.loveStories.slice(-(limit||10)).reverse();
  };

  window.npcRel65GetRivalries = function(limit) {
    return window.npcRelV65Data.rivalries.slice(-(limit||10)).reverse();
  };

  window.npcRel65GetStats = function() {
    const d = window.npcRelV65Data;
    const totalRels = Object.values(d.relationships).reduce((s,r)=>s+r.length,0);
    return {
      npcWithRels: Object.keys(d.relationships).length,
      totalRelationships: Math.floor(totalRels / 2),
      loveStories: d.loveStories.length,
      rivalries: d.rivalries.length,
      socialGroups: d.socialGroups.length
    };
  };

  // ════ AUTO SCAN ════
  function scanRelationships() {
    const year = window.year || 0;
    const npcs = window.npcs || [];

    npcs.forEach(npc => {
      const id = npc.id || npc.name;
      if (!id || npc.status === "dead") return;

      // Spouse relationship
      if (npc.spouse) {
        const spouseId = npc.spouse;
        const existing = (window.npcRelV65Data.relationships[id]||[]).find(r => r.targetId === spouseId && r.type === "spouse");
        if (!existing) window.npcRel65RecordRelationship(id, spouseId, "spouse", 90, "Kết đôi");
      }

      // Sect mentor relationship (from sect elder)
      if (npc.sect && npc.soul && npc.soul.ambition === "scholar") {
        const sectMates = npcs.filter(n => n.sect === npc.sect && (n.id||n.name) !== id && n.status === "alive");
        if (sectMates.length > 0) {
          const mentor = sectMates.find(m => (m.age||0) > (npc.age||0) + 30);
          if (mentor) {
            const mentorId = mentor.id || mentor.name;
            const ex = (window.npcRelV65Data.relationships[id]||[]).find(r => r.targetId === mentorId && r.type === "mentor");
            if (!ex) window.npcRel65RecordRelationship(id, mentorId, "mentor", 70, "Tông môn đồng đạo");
          }
        }
      }

      // Enemy from war: if at war with npc's country
      if (npc.country && window.warsActive && Array.isArray(window.warsActive)) {
        window.warsActive.forEach(w => {
          if (w.attacker === npc.country || w.defender === npc.country) {
            const enemySide = w.attacker === npc.country ? w.defender : w.attacker;
            const enemies = npcs.filter(n => n.country === enemySide && (n.id||n.name) !== id && n.status === "alive").slice(0,2);
            enemies.forEach(en => {
              const enId = en.id || en.name;
              const ex = (window.npcRelV65Data.relationships[id]||[]).find(r => r.targetId === enId && r.type === "enemy");
              if (!ex) window.npcRel65RecordRelationship(id, enId, "enemy", -60, `Chiến tranh ${w.attacker} vs ${w.defender}`);
            });
          }
        });
      }
    });
  }

  function save() {
    try {
      const d = window.npcRelV65Data;
      const slim = { ...d, relationships: {} };
      Object.entries(d.relationships).forEach(([id, rels]) => {
        slim.relationships[id] = rels.slice(-15);
      });
      localStorage.setItem(SAVE_KEY, JSON.stringify(slim));
    } catch(e) { console.warn("[NpcRelV65] save error:", e); }
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) window.npcRelV65Data = { ...window.npcRelV65Data, ...JSON.parse(raw) };
    } catch(e) {}
  }

  window.npcRelV65Tick = function() {
    const year = window.year || 0;
    const d = window.npcRelV65Data;
    if (year - d.lastScan < 15) return;
    d.lastScan = year;
    scanRelationships();
    if (year % 100 === 0) save();
  };

  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      window.npcRelV65Tick();
    };
    console.log("[NpcRelationshipV65] ✅ Hệ thống quan hệ NPC khởi động — Bạn bè, kẻ thù, tình yêu bắt đầu hình thành.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 13500); });
  } else {
    setTimeout(init, 13500);
  }
})();
