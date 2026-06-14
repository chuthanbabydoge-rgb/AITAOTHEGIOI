(function() {
  "use strict";
  const SAVE_KEY = "cgv6_npc_family_v65";

  window.npcFamilyV65Data = {
    version: 65,
    families: {},    // key=familyId → {name, patriarch, matriarch, members:[], tree:[], founded, generationCount}
    genealogy: {},   // key=npcId → {parentA, parentB, children:[], siblings:[], spouseId, generation}
    dynasticLines: [],
    lastScan: 0
  };

  // ════ ENSURE ════
  function ensureFamily(familyId) {
    if (!window.npcFamilyV65Data.families[familyId]) {
      window.npcFamilyV65Data.families[familyId] = {
        id: familyId,
        name: familyId,
        patriarch: null,
        matriarch: null,
        members: [],
        tree: [],
        founded: window.year || 0,
        generationCount: 1,
        totalBorn: 0,
        totalDied: 0
      };
    }
    return window.npcFamilyV65Data.families[familyId];
  }

  function ensureGenealogy(npcId) {
    if (!window.npcFamilyV65Data.genealogy[npcId]) {
      window.npcFamilyV65Data.genealogy[npcId] = {
        npcId,
        parentA: null,
        parentB: null,
        children: [],
        siblings: [],
        spouseId: null,
        generation: 1
      };
    }
    return window.npcFamilyV65Data.genealogy[npcId];
  }

  // ════ PUBLIC API ════
  window.npcFam65RegisterMember = function(familyId, npcId, npcName, parentAId, parentBId) {
    const family = ensureFamily(familyId);
    const gen = ensureGenealogy(npcId);
    const year = window.year || 0;

    if (!family.members.includes(npcId)) {
      family.members.push(npcId);
      family.totalBorn++;
      family.tree.push({ npcId, npcName, joinYear: year, parentA: parentAId||null, parentB: parentBId||null });
    }

    if (parentAId) {
      gen.parentA = parentAId;
      const parentGenA = ensureGenealogy(parentAId);
      if (!parentGenA.children.includes(npcId)) {
        parentGenA.children.push(npcId);
        gen.generation = parentGenA.generation + 1;
        if (gen.generation > family.generationCount) family.generationCount = gen.generation;
        // Record siblings
        parentGenA.children.forEach(sibId => {
          if (sibId !== npcId) {
            const sibGen = ensureGenealogy(sibId);
            if (!sibGen.siblings.includes(npcId)) sibGen.siblings.push(npcId);
            if (!gen.siblings.includes(sibId)) gen.siblings.push(sibId);
          }
        });
      }
    }
    if (parentBId) {
      gen.parentB = parentBId;
      const parentGenB = ensureGenealogy(parentBId);
      if (!parentGenB.children.includes(npcId)) parentGenB.children.push(npcId);
    }

    // Set patriarch/matriarch
    if (!family.patriarch && parentAId === null) family.patriarch = npcId;

    // Propagate to V64 family memory
    if (typeof window.npcMem64AddMemory === "function" && parentAId) {
      window.npcMem64AddMemory(npcId, "family", `Ra Đời Trong Gia Tộc ${familyId}`, `${npcName} sinh ra trong gia tộc ${familyId}. Thế hệ ${gen.generation}.`, 3);
    }
  };

  window.npcFam65RecordMarriage = function(npcIdA, npcIdB, familyId) {
    const year = window.year || 0;
    const genA = ensureGenealogy(npcIdA);
    const genB = ensureGenealogy(npcIdB);
    genA.spouseId = npcIdB;
    genB.spouseId = npcIdA;
    if (familyId) {
      const family = ensureFamily(familyId);
      if (!family.members.includes(npcIdB)) {
        family.members.push(npcIdB);
        family.tree.push({ npcId: npcIdB, joinYear: year, reason: "marriage" });
      }
    }
    if (typeof window.npcMem64AddMemory === "function") {
      window.npcMem64AddMemory(npcIdA, "family", `Kết Hôn Với ${npcIdB}`, `Gia đình được kết hợp. Năm ${year}.`, 4);
    }
  };

  window.npcFam65RecordDeath = function(npcId, familyId) {
    if (familyId) {
      const family = window.npcFamilyV65Data.families[familyId];
      if (family) family.totalDied++;
    }
    // Pass family memory to children
    const gen = window.npcFamilyV65Data.genealogy[npcId];
    if (gen && gen.children.length > 0 && typeof window.npcMem64AddMemory === "function") {
      const npcs = window.npcs || [];
      const npc = npcs.find(n => (n.id||n.name) === npcId);
      const name = npc ? npc.name : npcId;
      gen.children.forEach(childId => {
        window.npcMem64AddMemory(childId, "family", `Mất Đi ${name}`, `${name} — cha/mẹ của chúng ta — đã rời khỏi thế giới. Ký ức về Người sẽ mãi trong tim.`, 5);
      });
    }
  };

  window.npcFam65GetFamilyTree = function(familyId) {
    const family = window.npcFamilyV65Data.families[familyId];
    if (!family) return null;
    const npcs = window.npcs || [];
    const enriched = family.members.map(id => {
      const npc = npcs.find(n => (n.id||n.name) === id);
      const gen = window.npcFamilyV65Data.genealogy[id] || {};
      return {
        id, name: npc ? npc.name : id,
        age: npc ? npc.age : null,
        realm: npc ? npc.realm : null,
        status: npc ? (npc.status||"alive") : "unknown",
        generation: gen.generation || 1,
        children: gen.children || [],
        spouseId: gen.spouseId || null
      };
    });
    return {
      ...family,
      memberDetails: enriched,
      maxGeneration: Math.max(...enriched.map(m => m.generation||1), 1)
    };
  };

  window.npcFam65GetNpcGenealogy = function(npcId) {
    const gen = window.npcFamilyV65Data.genealogy[npcId];
    if (!gen) return null;
    const npcs = window.npcs || [];
    function getName(id) { const n = npcs.find(x => (x.id||x.name)===id); return n ? n.name : id; }
    return {
      npcId,
      parentA: gen.parentA ? { id: gen.parentA, name: getName(gen.parentA) } : null,
      parentB: gen.parentB ? { id: gen.parentB, name: getName(gen.parentB) } : null,
      spouse: gen.spouseId ? { id: gen.spouseId, name: getName(gen.spouseId) } : null,
      children: gen.children.map(id => ({ id, name: getName(id) })),
      siblings: gen.siblings.map(id => ({ id, name: getName(id) })),
      generation: gen.generation || 1
    };
  };

  window.npcFam65GetAllFamilies = function() {
    return Object.values(window.npcFamilyV65Data.families)
      .sort((a,b) => b.members.length - a.members.length);
  };

  window.npcFam65GetStats = function() {
    const d = window.npcFamilyV65Data;
    const families = Object.values(d.families);
    const maxGen = families.length > 0 ? Math.max(...families.map(f => f.generationCount||1)) : 0;
    return {
      familyCount: families.length,
      totalMembers: Object.keys(d.genealogy).length,
      maxGenerations: maxGen,
      largestFamily: families.length > 0 ? families.sort((a,b)=>b.members.length-a.members.length)[0]?.name : "N/A"
    };
  };

  window.npcFam65GetFamilyNarrative = function(familyId) {
    const tree = window.npcFam65GetFamilyTree(familyId);
    if (!tree) return `Gia tộc ${familyId} chưa được ghi chép.`;
    const alive = tree.memberDetails.filter(m => m.status === "alive").length;
    const dead = tree.memberDetails.filter(m => m.status === "dead").length;
    let narrative = `👨‍👩‍👧‍👦 **Gia Tộc ${tree.name}**\n`;
    narrative += `Được lập từ năm ${tree.founded} · ${tree.maxGeneration} thế hệ\n`;
    narrative += `👥 ${alive} thành viên còn sống · ⚰️ ${dead} đã qua đời\n`;
    narrative += `🌱 Tổng ${tree.totalBorn} sinh · Thủy Tổ: ${tree.patriarch||"Không rõ"}\n`;
    if (tree.memberDetails.length > 0) {
      narrative += `\nThành Viên Hiện Tại:\n`;
      tree.memberDetails.filter(m => m.status === "alive").slice(0,5).forEach(m => {
        narrative += `• [Thế hệ ${m.generation}] ${m.name}${m.realm ? ' ('+m.realm+')' : ''}${m.age ? ' · '+m.age+'t' : ''}\n`;
      });
    }
    return narrative;
  };

  // ════ AUTO SCAN ════
  function scanFamilies() {
    const year = window.year || 0;
    const npcs = window.npcs || [];

    npcs.forEach(npc => {
      const id = npc.id || npc.name;
      if (!id) return;
      const familyId = npc.family || npc.dynasty;
      if (!familyId) return;

      // Register member
      const family = window.npcFamilyV65Data.families[familyId];
      const alreadyMember = family && family.members.includes(id);
      if (!alreadyMember) {
        window.npcFam65RegisterMember(familyId, id, npc.name, null, null);
        // V64 dynasty memory sync
        if (typeof window.dynMem64AddMember === "function") {
          window.dynMem64AddMember(familyId, npc.name, npc.role||"Thành Viên", year);
        }
      }

      // Marriage sync
      if (npc.spouse) {
        const spouseGen = window.npcFamilyV65Data.genealogy[id];
        if (!spouseGen || spouseGen.spouseId !== npc.spouse) {
          window.npcFam65RecordMarriage(id, npc.spouse, familyId);
        }
      }

      // Death sync
      if (npc.status === "dead") {
        const gen = window.npcFamilyV65Data.genealogy[id];
        if (gen && !gen._deathProcessed) {
          gen._deathProcessed = true;
          window.npcFam65RecordDeath(id, familyId);
        }
      }

      // Set patriarch from oldest alive member
      const fam = window.npcFamilyV65Data.families[familyId];
      if (fam && !fam.patriarch && npc.status !== "dead") {
        fam.patriarch = id;
      }
    });
  }

  function save() {
    try {
      const d = window.npcFamilyV65Data;
      const slim = { ...d, families: {}, genealogy: {} };
      Object.entries(d.families).forEach(([id, f]) => {
        slim.families[id] = { ...f, tree: f.tree.slice(-50) };
      });
      Object.entries(d.genealogy).forEach(([id, g]) => {
        slim.genealogy[id] = { ...g, children: g.children.slice(-30), siblings: g.siblings.slice(-20) };
      });
      localStorage.setItem(SAVE_KEY, JSON.stringify(slim));
    } catch(e) { console.warn("[NpcFamilyV65] save error:", e); }
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) window.npcFamilyV65Data = { ...window.npcFamilyV65Data, ...JSON.parse(raw) };
    } catch(e) {}
  }

  window.npcFamilyV65Tick = function() {
    const year = window.year || 0;
    const d = window.npcFamilyV65Data;
    if (year - d.lastScan < 20) return;
    d.lastScan = year;
    scanFamilies();
    if (year % 100 === 0) save();
  };

  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      window.npcFamilyV65Tick();
    };
    console.log("[NpcFamilySystemV65] ✅ Hệ thống gia tộc khởi động — Gia phả bắt đầu được viết qua các thế hệ.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 13600); });
  } else {
    setTimeout(init, 13600);
  }
})();
