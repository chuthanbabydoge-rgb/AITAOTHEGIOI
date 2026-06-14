(function() {
  "use strict";
  const SAVE_KEY = "cgv6_divine_intervention_v66";

  window.divineInterventionV66Data = {
    version: 66,
    divineEnergy: 1000,
    maxEnergy: 1000,
    energyRegen: 5,
    interventions: [],
    worldEdits: [],
    blessings: [],
    lastRegen: 0,
    totalInterventions: 0
  };

  // ════ DIVINE ENERGY ════
  window.div66GetEnergy = function() { return window.divineInterventionV66Data.divineEnergy; };
  window.div66GetMaxEnergy = function() { return window.divineInterventionV66Data.maxEnergy; };

  window.div66SpendEnergy = function(amount) {
    const d = window.divineInterventionV66Data;
    if (d.divineEnergy < amount) return false;
    d.divineEnergy = Math.max(0, d.divineEnergy - amount);
    return true;
  };

  window.div66AddEnergy = function(amount) {
    const d = window.divineInterventionV66Data;
    d.divineEnergy = Math.min(d.maxEnergy, d.divineEnergy + amount);
  };

  // ════ INTERVENTION TYPES ════
  const INTERVENTION_TYPES = [
    { id:"bless_nation",     label:"Ban Phước Quốc Gia",    icon:"✨", cost:80,  color:"#4ade80",  category:"blessing" },
    { id:"bless_npc",        label:"Ban Phước Sinh Linh",   icon:"🌟", cost:40,  color:"#fbbf24",  category:"blessing" },
    { id:"bless_army",       label:"Gia Hộ Quân Đội",       icon:"⚔️", cost:60,  color:"#60a5fa",  category:"blessing" },
    { id:"smite",            label:"Thiên Lôi Giáng",       icon:"⚡", cost:100, color:"#f87171",  category:"punishment" },
    { id:"cleanse",          label:"Tẩy Trừ Tội Lỗi",       icon:"💧", cost:50,  color:"#67e8f9",  category:"blessing" },
    { id:"raise_mountain",   label:"Nâng Núi Thần",         icon:"🏔️", cost:200, color:"#94a3b8",  category:"world" },
    { id:"create_river",     label:"Tạo Sông Thiêng",       icon:"🌊", cost:150, color:"#38bdf8",  category:"world" },
    { id:"create_continent", label:"Khai Mở Lục Địa",       icon:"🌍", cost:500, color:"#86efac",  category:"world" },
    { id:"create_sea",       label:"Tạo Đại Dương",         icon:"🌊", cost:300, color:"#0ea5e9",  category:"world" },
    { id:"forbidden_zone",   label:"Vùng Cấm Thần Thánh",   icon:"🚫", cost:180, color:"#c084fc",  category:"world" },
    { id:"holy_war",         label:"Thánh Chiến Thần Linh", icon:"🕊️", cost:120, color:"#f59e0b",  category:"divine" },
    { id:"divine_peace",     label:"Thiên Hòa Vĩnh Cửu",   icon:"☮️", cost:90,  color:"#a3e635",  category:"divine" }
  ];
  window.div66GetInterventionTypes = function() { return INTERVENTION_TYPES; };
  window.div66GetInterventionByCategory = function(cat) { return INTERVENTION_TYPES.filter(t => t.category === cat); };

  // ════ CORE: PERFORM INTERVENTION ════
  window.div66Perform = function(typeId, targetName, targetType) {
    const year = window.year || 0;
    const iType = INTERVENTION_TYPES.find(t => t.id === typeId);
    if (!iType) return { ok: false, msg: "Loại can thiệp không hợp lệ." };

    if (!window.div66SpendEnergy(iType.cost)) {
      return { ok: false, msg: `Thần Năng không đủ! Cần ${iType.cost}, hiện có ${Math.floor(window.divineInterventionV66Data.divineEnergy)}.` };
    }

    const entry = {
      id: typeId, label: iType.label, icon: iType.icon,
      target: targetName || "Thế Giới",
      targetType: targetType || "world",
      year, category: iType.category,
      energyCost: iType.cost
    };

    window.divineInterventionV66Data.interventions.push(entry);
    window.divineInterventionV66Data.totalInterventions++;

    // Apply effects
    _applyEffect(typeId, targetName, targetType, year, iType);

    // Record in V64 memory
    if (typeof window.mem64Record === "function") {
      window.mem64Record("divine", `${iType.icon} ${iType.label}`, `Đấng Sáng Thế thực hiện ${iType.label} với ${targetName||'thế giới'}. Năm ${year}.`, 5, ["divine_intervention"]);
    }
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year, type: "divine", title: `${iType.icon} ${iType.label}`, color: iType.color });
    }

    // Record in Legacy V66
    if (typeof window.creatorLeg66Record === "function") {
      window.creatorLeg66Record("intervention", iType.label, targetName||"Thế Giới", `${iType.icon} ${iType.label} thực thi bởi Đấng Sáng Thế.`, 5);
    }

    save();
    return { ok: true, msg: `✅ ${iType.icon} ${iType.label} đã được thực thi với "${targetName||'Thế Giới'}"!`, entry };
  };

  function _applyEffect(typeId, targetName, targetType, year, iType) {
    const npcs = window.npcs || [];

    if (typeId === "bless_nation") {
      const countries = window.countries || [];
      const target = countries.find(c => c.name === targetName);
      if (target) {
        target.stability = Math.min(100, (target.stability||50) + 30);
        target.population = Math.floor((target.population||1000) * 1.1);
      }
      window.divineInterventionV66Data.blessings.push({ target: targetName, type: "nation", year, effect: "stability+30 population+10%" });
    }

    if (typeId === "bless_npc") {
      const npc = npcs.find(n => n.name === targetName);
      if (npc) {
        npc.power = Math.floor((npc.power||100) * 1.2);
        npc._divineBlessed = true;
        npc._blessYear = year;
        if (typeof window.npcLife65RecordLifeEvent === "function") {
          window.npcLife65RecordLifeEvent(npc.id||npc.name, "Nhận Thần Ân", `${npc.name} được Đấng Sáng Thế ban phước. Sức mạnh tăng vọt!`, 5);
        }
        if (typeof window.npcMem64AddMemory === "function") {
          window.npcMem64AddMemory(npc.id||npc.name, "social", "Được Thần Ban Phước", `Đấng Sáng Thế đích thân chọn ta làm người được ban ân huệ. Nguyện không phụ sự tin tưởng của Ngài.`, 5);
        }
      }
    }

    if (typeId === "smite") {
      const npc = npcs.find(n => n.name === targetName && n.status === "alive");
      if (npc) {
        npc.status = "dead";
        npc.deathReason = "Thiên Lôi Thần Linh";
        if (typeof window.npcLife65RecordLifeEvent === "function") {
          window.npcLife65RecordLifeEvent(npc.id||npc.name, "Thiên Lôi Giáng", `${npc.name} bị Đấng Sáng Thế giáng thiên lôi, ngã xuống trước sức mạnh thiên linh.`, 5);
        }
      }
    }

    if (typeId === "raise_mountain" || typeId === "create_river" || typeId === "create_sea" || typeId === "create_continent" || typeId === "forbidden_zone") {
      window.divineInterventionV66Data.worldEdits.push({
        type: typeId, name: targetName || `${iType.label} (Năm ${year})`,
        year, label: iType.label, icon: iType.icon
      });
    }

    if (typeId === "divine_peace") {
      if (window.warsActive && Array.isArray(window.warsActive)) {
        window.warsActive.splice(0, Math.min(2, window.warsActive.length));
      }
    }
  }

  // ════ WORLD EDITS ════
  window.div66GetWorldEdits = function() { return window.divineInterventionV66Data.worldEdits; };
  window.div66GetBlessings = function() { return window.divineInterventionV66Data.blessings; };
  window.div66GetInterventionLog = function(limit) {
    return window.divineInterventionV66Data.interventions.slice(-(limit||20)).reverse();
  };
  window.div66GetStats = function() {
    const d = window.divineInterventionV66Data;
    return {
      energy: Math.floor(d.divineEnergy),
      maxEnergy: d.maxEnergy,
      totalInterventions: d.totalInterventions,
      blessings: d.blessings.length,
      worldEdits: d.worldEdits.length
    };
  };

  // ════ TICK: Energy Regen ════
  function tick() {
    const year = window.year || 0;
    const d = window.divineInterventionV66Data;
    if (year - d.lastRegen < 10) return;
    d.lastRegen = year;
    d.divineEnergy = Math.min(d.maxEnergy, d.divineEnergy + d.energyRegen * 10);
    // Worship bonus: more religions = more energy from believers
    const worshipBonus = (typeof window.religionData !== "undefined") ? 20 : 0;
    if (worshipBonus > 0) d.divineEnergy = Math.min(d.maxEnergy, d.divineEnergy + worshipBonus);
    if (year % 100 === 0) save();
  }

  function save() {
    try {
      const d = window.divineInterventionV66Data;
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        ...d,
        interventions: d.interventions.slice(-100),
        worldEdits: d.worldEdits.slice(-50),
        blessings: d.blessings.slice(-50)
      }));
    } catch(e) {}
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) window.divineInterventionV66Data = { ...window.divineInterventionV66Data, ...JSON.parse(raw) };
    } catch(e) {}
  }

  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); tick(); };
    console.log("[DivineInterventionV66] ⚡ Thần Năng khởi động — Đấng Sáng Thế có thể can thiệp thế giới.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 13800); });
  } else {
    setTimeout(init, 13800);
  }
})();
