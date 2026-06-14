(function() {
  "use strict";
  const SAVE_KEY = "cgv6_divine_punishment_v66";

  window.divinePunishmentV66Data = {
    version: 66,
    punishments: [],
    activeCurses: [],
    exiledNpcs: [],
    erasedFromHistory: [],
    totalPunishments: 0
  };

  const PUNISHMENT_TYPES = [
    { id:"thunderbolt",   icon:"⚡", label:"Thiên Lôi",        cost:80,  color:"#fbbf24", target:"npc",     desc:"Tiêu diệt tức thì một sinh linh bằng sét thần." },
    { id:"divine_plague", icon:"☠️", label:"Thần Dịch",        cost:120, color:"#a78bfa", target:"nation",  desc:"Dịch bệnh thần linh bùng phát trong quốc gia mục tiêu." },
    { id:"curse",         icon:"🔮", label:"Lời Nguyền",       cost:100, color:"#c084fc", target:"npc",     desc:"NPC bị nguyền rủa — sức mạnh giảm, vận xui kéo dài 100 năm." },
    { id:"exile",         icon:"🚷", label:"Thần Đày",         cost:60,  color:"#94a3b8", target:"npc",     desc:"NPC bị đày khỏi tông môn và quốc gia, lang thang vô định." },
    { id:"erase_history", icon:"📛", label:"Xóa Tên Khỏi Sử", cost:200, color:"#f87171", target:"npc",     desc:"Tên và ký ức về NPC bị xóa khỏi lịch sử — như chưa từng tồn tại." },
    { id:"nation_fall",   icon:"💥", label:"Quốc Gia Sụp Đổ", cost:250, color:"#ef4444", target:"nation",  desc:"Một quốc gia mất ổn định hoàn toàn, kinh tế sụp đổ." },
    { id:"family_curse",  icon:"💀", label:"Gia Tộc Bị Nguyền",cost:150, color:"#7c3aed", target:"family",  desc:"Toàn bộ gia tộc bị nguyền rủa — thế hệ tiếp theo suy vong." },
    { id:"divine_wrath",  icon:"🔥", label:"Thần Nộ",          cost:300, color:"#dc2626", target:"world",   desc:"Cơn thịnh nộ của Đấng Sáng Thế — mưa lửa thiêu đốt một vùng đất." }
  ];
  window.div66PunishGetTypes = function() { return PUNISHMENT_TYPES; };

  window.div66Punish = function(typeId, targetName, targetType) {
    const year = window.year || 0;
    const pType = PUNISHMENT_TYPES.find(p => p.id === typeId);
    if (!pType) return { ok: false, msg: "Loại trừng phạt không hợp lệ." };

    if (typeof window.div66SpendEnergy === "function") {
      if (!window.div66SpendEnergy(pType.cost)) {
        return { ok: false, msg: `Thần Năng không đủ! Cần ${pType.cost}.` };
      }
    }

    const entry = {
      id: typeId, label: pType.label, icon: pType.icon,
      target: targetName || "Mục Tiêu",
      year, cost: pType.cost
    };
    window.divinePunishmentV66Data.punishments.push(entry);
    window.divinePunishmentV66Data.totalPunishments++;

    const result = _applyPunishment(typeId, targetName, year, pType);

    // Record in history
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year, type: "divine", title: `${pType.icon} ${pType.label}: ${targetName||'?'}`, color: pType.color });
    }
    if (typeof window.mem64Record === "function") {
      window.mem64Record("divine", `${pType.icon} Thần Phạt: ${pType.label}`, `Đấng Sáng Thế giáng trừng phạt lên ${targetName||'?'} — ${pType.desc}`, 5, ["divine_punishment"]);
    }
    if (typeof window.creatorLeg66Record === "function") {
      window.creatorLeg66Record("punishment", pType.label, targetName||"?", pType.desc, 5);
    }

    // NPCs nearby witness and fear
    (window.npcs || []).filter(n => n.status === "alive").slice(0, 10).forEach(npc => {
      if ((npc.id||npc.name) === targetName) return;
      if (typeof window.npcLife65SetEmotion === "function") {
        window.npcLife65SetEmotion(npc.id||npc.name, "fearful", 85);
      }
      if (typeof window.npcMem64AddMemory === "function") {
        window.npcMem64AddMemory(npc.id||npc.name, "social", `Chứng Kiến Thần Phạt`, `Tôi chứng kiến ${pType.label} giáng xuống ${targetName||'?'}. Thần linh không dung tha kẻ sai trái.`, 4);
      }
    });

    save();
    return { ok: true, msg: `⚡ ${pType.icon} ${pType.label} đã giáng xuống "${targetName||'?'}"! ${result}`, entry };
  };

  function _applyPunishment(typeId, targetName, year, pType) {
    const npcs = window.npcs || [];

    if (typeId === "thunderbolt") {
      const npc = npcs.find(n => n.name === targetName && n.status === "alive");
      if (npc) {
        npc.status = "dead";
        npc.deathReason = "Thiên Lôi Thần Phạt";
        if (typeof window.npcLife65RecordLifeEvent === "function") {
          window.npcLife65RecordLifeEvent(npc.id||npc.name, "Bị Thiên Lôi Giáng", `${npc.name} bị Đấng Sáng Thế giáng thiên lôi vì tội lỗi của mình.`, 5);
        }
        return `${targetName} đã bị tiêu diệt.`;
      }
    }

    if (typeId === "curse") {
      const npc = npcs.find(n => n.name === targetName && n.status === "alive");
      if (npc) {
        npc._cursed = true;
        npc._curseYear = year;
        npc._curseDuration = 100;
        npc.power = Math.max(10, Math.floor((npc.power||100) * 0.5));
        window.divinePunishmentV66Data.activeCurses.push({ target: targetName, year, duration: 100 });
        if (typeof window.npcLife65RecordLifeEvent === "function") {
          window.npcLife65RecordLifeEvent(npc.id||npc.name, "Bị Thần Nguyền", `Đấng Sáng Thế đặt lên ${npc.name} một lời nguyền — sức mạnh suy giảm, vận xui không ngừng.`, 5);
        }
        return `${targetName} bị nguyền rủa 100 năm.`;
      }
    }

    if (typeId === "exile") {
      const npc = npcs.find(n => n.name === targetName && n.status === "alive");
      if (npc) {
        const oldCountry = npc.country;
        npc.country = "Lưu Đày";
        npc.sect = null;
        npc._exiled = true;
        window.divinePunishmentV66Data.exiledNpcs.push({ name: targetName, from: oldCountry, year });
        if (typeof window.npcLife65RecordLifeEvent === "function") {
          window.npcLife65RecordLifeEvent(npc.id||npc.name, "Bị Thần Đày", `${npc.name} bị Đấng Sáng Thế đày khỏi quê hương, lang thang vô định.`, 5);
        }
        return `${targetName} bị đày khỏi ${oldCountry||'quê hương'}.`;
      }
    }

    if (typeId === "erase_history") {
      const npc = npcs.find(n => n.name === targetName);
      if (npc) {
        npc._erasedFromHistory = true;
        window.divinePunishmentV66Data.erasedFromHistory.push({ name: targetName, year });
        // Remove from timeline
        if (typeof window.htAddEvent === "function") {
          // Cannot remove, but mark as erased
        }
        return `Tên ${targetName} đã bị xóa khỏi lịch sử.`;
      }
    }

    if (typeId === "divine_plague") {
      const countries = window.countries || [];
      const target = countries.find(c => c.name === targetName);
      if (target) {
        target.stability = Math.max(0, (target.stability||50) - 50);
        target.population = Math.floor((target.population||1000) * 0.7);
        return `${targetName} bị Thần Dịch tàn phá. Dân số -30%.`;
      }
    }

    if (typeId === "nation_fall") {
      const countries = window.countries || [];
      const target = countries.find(c => c.name === targetName);
      if (target) {
        target.stability = 0;
        target.economy = 0;
        return `${targetName} sụp đổ hoàn toàn.`;
      }
    }

    if (typeId === "divine_wrath") {
      (window.countries || []).slice(0, 3).forEach(c => {
        c.stability = Math.max(0, (c.stability||50) - 30);
      });
      if (typeof window.disasterData !== "undefined" && window.disasterData.activeDisasters) {
        window.disasterData.activeDisasters.push({ type:"divine_wrath", name:"Thần Nộ", year, severity:5 });
      }
      return "Cơn thịnh nộ thần linh tàn phá thế giới.";
    }

    return "Trừng phạt đã được thực thi.";
  }

  window.div66GetPunishmentLog = function(limit) {
    return window.divinePunishmentV66Data.punishments.slice(-(limit||20)).reverse();
  };
  window.div66GetActiveCurses = function() { return window.divinePunishmentV66Data.activeCurses; };
  window.div66GetExiled = function() { return window.divinePunishmentV66Data.exiledNpcs; };
  window.div66GetPunishStats = function() {
    const d = window.divinePunishmentV66Data;
    return { total: d.totalPunishments, curses: d.activeCurses.length, exiled: d.exiledNpcs.length, erased: d.erasedFromHistory.length };
  };

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        ...window.divinePunishmentV66Data,
        punishments: window.divinePunishmentV66Data.punishments.slice(-100)
      }));
    } catch(e) {}
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) window.divinePunishmentV66Data = { ...window.divinePunishmentV66Data, ...JSON.parse(raw) };
    } catch(e) {}
  }

  function init() {
    load();
    console.log("[DivinePunishmentV66] ⚡ Thần Phạt V66 khởi động — 8 hình phạt thần linh sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 14000); });
  } else {
    setTimeout(init, 14000);
  }
})();
