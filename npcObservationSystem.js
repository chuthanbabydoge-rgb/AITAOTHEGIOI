(function () {
  "use strict";
  const SAVE_KEY = "cgv6_npc_observation_v70";

  window.npcObservationV70Data = {
    version: "V70",
    initialized: false,
    observedNpc: null,
    observedFamily: null,
    observationLog: [],
    generationTracker: {},
    lifelineData: [],
    statsSnapshot: [],
    watchMode: "single",
    followDynasty: false,
    dynastyRoot: null,
    observationHistory: [],
  };

  const D = window.npcObservationV70Data;

  function save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      observedNpc: D.observedNpc ? { id: D.observedNpc.id, name: D.observedNpc.name } : null,
      observationHistory: D.observationHistory.slice(-20),
      watchMode: D.watchMode,
    }));
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.watchMode) D.watchMode = p.watchMode;
        if (p.observationHistory) D.observationHistory = p.observationHistory;
      }
    } catch (e) {}
  }

  function addLog(msg, npcName) {
    D.observationLog.push({ t: Date.now(), year: window.year || 0, msg, npcName });
    if (D.observationLog.length > 60) D.observationLog = D.observationLog.slice(-60);
  }

  function observeNpc(npcIdOrObj) {
    let npc = null;
    if (typeof npcIdOrObj === "string") {
      npc = (window.npcs || []).find(function (n) { return n.id === npcIdOrObj || n.name === npcIdOrObj; });
    } else if (npcIdOrObj && npcIdOrObj.id) {
      npc = npcIdOrObj;
    }
    if (!npc) npc = (window.npcs || []).find(function (n) { return n.status === "alive"; });
    if (!npc) return null;

    D.observedNpc = npc;
    D.watchMode = "single";
    D.observationHistory.push({ id: npc.id, name: npc.name, year: window.year || 0 });

    buildNpcLifeline(npc);
    findNpcFamily(npc);

    if (typeof imm70SetFocus === "function") imm70SetFocus({ entityType: "npc", entityId: npc.id, entityName: npc.name });
    if (typeof imm70ZoomTo === "function") imm70ZoomTo(8, { type: "npc", id: npc.id, name: npc.name });

    addLog("Bắt đầu quan sát: " + npc.name, npc.name);
    save();
    return npc;
  }

  function observeFamily(familyId) {
    const fam = window.npcFamilyV65Data && window.npcFamilyV65Data.families ? window.npcFamilyV65Data.families[familyId] : null;
    if (!fam) return null;
    D.observedFamily = fam;
    D.watchMode = "family";
    addLog("Quan sát gia tộc: " + (fam.surname || familyId));
    return fam;
  }

  function buildNpcLifeline(npc) {
    if (!npc) return [];
    const lifeline = [];
    const birthYear = npc.birthYear || (npc.age ? (window.year || 1) - npc.age : 1);

    lifeline.push({ year: birthYear, event: "⭐ Sinh ra", type: "birth", important: true });

    const memories = window.npcMemoryV64Data && window.npcMemoryV64Data.npcMemories ? (window.npcMemoryV64Data.npcMemories[npc.id] || []) : [];
    memories.forEach(function (m) {
      lifeline.push({ year: m.year || birthYear + 10, event: "💭 " + (m.title || m.content || "Ký ức"), type: "memory", important: m.important });
    });

    const wars = window.warsActive || [];
    wars.forEach(function (w) {
      if (w.participants && w.participants.includes(npc.id)) {
        lifeline.push({ year: w.startYear || (window.year || 1), event: "⚔️ Tham chiến: " + w.name, type: "war", important: true });
      }
    });

    if (npc.deathYear) lifeline.push({ year: npc.deathYear, event: "💀 Qua đời", type: "death", important: true });
    if (npc.status === "alive") lifeline.push({ year: window.year || 1, event: "🟢 Đang sống — Tuổi: " + (npc.age || "?"), type: "current", important: false });

    lifeline.sort(function (a, b) { return a.year - b.year; });
    D.lifelineData = lifeline;
    return lifeline;
  }

  function findNpcFamily(npc) {
    if (!npc) return null;
    const families = window.npcFamilyV65Data && window.npcFamilyV65Data.families ? Object.values(window.npcFamilyV65Data.families) : [];
    const family = families.find(function (f) { return f.members && f.members.includes(npc.id); });
    if (family) {
      D.observedFamily = family;
      const members = (window.npcs || []).filter(function (n) { return family.members.includes(n.id); });
      family.resolvedMembers = members;
    }
    return family || null;
  }

  function getNpcFullProfile(npc) {
    if (!npc) return null;
    const n = npc;
    const memories = window.npcMemoryV64Data && window.npcMemoryV64Data.npcMemories ? (window.npcMemoryV64Data.npcMemories[n.id] || []) : [];
    const rel = window.npcRelationshipV65Data && window.npcRelationshipV65Data.relationships ? (window.npcRelationshipV65Data.relationships[n.id] || {}) : {};
    const relList = Object.entries(rel).slice(0, 6).map(function (kv) {
      const other = (window.npcs || []).find(function (x) { return x.id === kv[0]; });
      return { name: other ? other.name : kv[0], type: kv[1].type || "known", score: kv[1].score || 0 };
    });

    return {
      basic: { name: n.name, age: n.age || "?", status: n.status, gender: n.gender || "?", country: n.country || "?", region: n.region || "?" },
      stats: { attack: n.attack || 0, defense: n.defense || 0, realm: n.realm || 0, wealth: n.wealth || 0, fame: n.fame || 0 },
      memories: memories.slice(0, 5),
      relationships: relList,
      lifeline: D.lifelineData.length ? D.lifelineData : buildNpcLifeline(n),
      family: D.observedFamily,
      career: n.career || n.profession || "Thường dân",
      title: n.title || "",
      specialTraits: n.traits || [],
    };
  }

  function trackGeneration(npc, generation) {
    if (!npc) return;
    if (!D.generationTracker[npc.id]) D.generationTracker[npc.id] = { gen: generation || 1, born: npc.birthYear || 0, children: [] };
    const children = (window.npcs || []).filter(function (n) { return n.parentId === npc.id || (n.parents && n.parents.includes(npc.id)); });
    children.forEach(function (child) {
      if (!D.generationTracker[npc.id].children.includes(child.id)) {
        D.generationTracker[npc.id].children.push(child.id);
        trackGeneration(child, (generation || 1) + 1);
      }
    });
  }

  function getDescendants(npcId, maxGen) {
    const results = [];
    const max = maxGen || 5;
    function walk(id, gen) {
      if (gen > max) return;
      const children = (window.npcs || []).filter(function (n) { return n.parentId === id || (n.parents && n.parents.includes(id)); });
      children.forEach(function (child) {
        results.push({ npc: child, generation: gen });
        walk(child.id, gen + 1);
      });
    }
    walk(npcId, 1);
    return results;
  }

  function getNpcsByFamily(surname) {
    if (surname) {
      return (window.npcs || []).filter(function (n) { return n.surname === surname || (n.name && n.name.includes(surname)); });
    }
    const fam = D.observedFamily;
    if (!fam || !fam.members) return [];
    return (window.npcs || []).filter(function (n) { return fam.members.includes(n.id); });
  }

  function getObservationSummary() {
    const npc = D.observedNpc;
    if (!npc) return "Chưa quan sát NPC nào.";
    const profile = getNpcFullProfile(npc);
    if (!profile) return "";
    return [
      "👤 " + npc.name + " (" + (npc.age || "?") + " tuổi)",
      "📍 " + (npc.country || "?") + " — " + (npc.region || "?"),
      "💭 " + profile.memories.length + " ký ức | 👥 " + profile.relationships.length + " quan hệ",
      "📖 " + D.lifelineData.length + " sự kiện cuộc đời",
    ].join(" · ");
  }

  window.npcObservationV70Data = D;
  window.nos70ObserveNpc = observeNpc;
  window.nos70ObserveFamily = observeFamily;
  window.nos70GetProfile = getNpcFullProfile;
  window.nos70GetLifeline = function () { return D.lifelineData.slice(); };
  window.nos70GetFamily = function () { return D.observedFamily; };
  window.nos70GetDescendants = getDescendants;
  window.nos70GetFamilyMembers = getNpcsByFamily;
  window.nos70GetSummary = getObservationSummary;
  window.nos70GetLog = function () { return D.observationLog.slice(); };
  window.nos70TrackGen = trackGeneration;
  window.nos70GetCurrentNpc = function () { return D.observedNpc; };

  function init() {
    load();
    D.initialized = true;
    const alive = (window.npcs || []).filter(function (n) { return n.status === "alive"; });
    if (alive.length) observeNpc(alive[Math.floor(Math.random() * alive.length)]);
    console.log("[npcObservationSystem V70] 👤 NPC Observation System khởi động — Quan sát cuộc đời · Gia tộc · Thế hệ.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 16500); });
  } else {
    setTimeout(init, 16500);
  }
})();
