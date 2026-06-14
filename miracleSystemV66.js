(function() {
  "use strict";
  const SAVE_KEY = "cgv6_miracle_v66";

  // Extends miracleSystemV51.js — KHÔNG ghi đè
  window.miracleV66Data = {
    version: 66,
    miracles: [],
    grandMiracles: [],   // V66 exclusive: phép màu vĩ đại
    miracleCount: 0,
    lastMiracle: 0
  };

  // ════ V66 GRAND MIRACLE TYPES (vượt trội hơn V51) ════
  const GRAND_MIRACLES = [
    {
      id:"golden_age",     icon:"☀️", label:"Khai Mở Thời Đại Vàng Son",
      cost:300, cooldown:200, color:"#fbbf24",
      desc:"Toàn bộ thế giới bước vào kỷ nguyên thịnh vượng — văn minh, kinh tế, hòa bình đều đạt cực điểm.",
      lore:"Chỉ các vị thần thực sự vĩ đại mới có thể tạo ra Thời Đại Vàng Son."
    },
    {
      id:"divine_incarnation", icon:"👁️", label:"Thần Linh Hóa Thân",
      cost:400, cooldown:300, color:"#c084fc",
      desc:"Một NPC được chọn trở thành hiện thân của thần — nhận toàn bộ sức mạnh thần linh.",
      lore:"Chỉ một lần trong ngàn năm, Đấng Sáng Thế mới giáng thế."
    },
    {
      id:"genesis_wave",   icon:"🌌", label:"Sóng Khai Thiên",
      cost:500, cooldown:500, color:"#818cf8",
      desc:"Tái thiết một vùng của thế giới — xóa tất cả chiến tranh, dịch bệnh, thiên tai trong khu vực.",
      lore:"Phép màu của buổi ban đầu — khi thế giới còn chưa có tội lỗi."
    },
    {
      id:"sacred_covenant",icon:"📜", label:"Thần Giao Ước Thiêng",
      cost:200, cooldown:150, color:"#34d399",
      desc:"Tạo ra một giao ước thần thánh giữa hai thế lực — vi phạm sẽ bị thiên phạt tức thời.",
      lore:"Ngay cả thần linh cũng phải tuân thủ lời ước thiêng liêng."
    },
    {
      id:"world_memory",   icon:"🌍", label:"Thần Ký Thế Giới",
      cost:150, cooldown:100, color:"#60a5fa",
      desc:"Toàn bộ lịch sử thế giới được khắc vào Ký Ức Vũ Trụ — không bao giờ bị lãng quên.",
      lore:"Thế giới nhớ. Ngàn năm sau, con cháu vẫn kể về phép màu này."
    },
    {
      id:"hero_awakening", icon:"⚡", label:"Thức Tỉnh Anh Hùng",
      cost:180, cooldown:80, color:"#f59e0b",
      desc:"Một NPC thường dân đột ngột thức tỉnh tiềm năng anh hùng tiềm ẩn.",
      lore:"Phép màu không tạo ra anh hùng — nó chỉ giúp họ tìm thấy chính mình."
    },
    {
      id:"apocalypse_ward",icon:"🛡️", label:"Ngăn Chặn Tận Thế",
      cost:350, cooldown:250, color:"#ef4444",
      desc:"Hủy bỏ bất kỳ sự kiện tận thế nào đang cận kề — thế giới được thêm 500 năm.",
      lore:"Khi bóng tối nuốt chửng hy vọng cuối cùng, ánh sáng thần linh xuất hiện."
    }
  ];
  window.mir66GetGrandMiracleTypes = function() { return GRAND_MIRACLES; };

  // ════ CAST GRAND MIRACLE ════
  window.mir66CastGrandMiracle = function(miracleId, targetName) {
    const year = window.year || 0;
    const mType = GRAND_MIRACLES.find(m => m.id === miracleId);
    if (!mType) return { ok: false, msg: "Phép màu không tồn tại." };

    // Check cooldown
    const lastCast = window.miracleV66Data.miracles.filter(m => m.id === miracleId);
    if (lastCast.length > 0) {
      const lastYear = lastCast[lastCast.length - 1].year;
      if (year - lastYear < mType.cooldown) {
        return { ok: false, msg: `Phép màu đang hồi (${mType.cooldown - (year - lastYear)} năm nữa).` };
      }
    }

    // Spend divine energy
    if (typeof window.div66SpendEnergy === "function") {
      if (!window.div66SpendEnergy(mType.cost)) {
        return { ok: false, msg: `Thần Năng không đủ! Cần ${mType.cost}.` };
      }
    }

    const entry = { id: miracleId, label: mType.label, icon: mType.icon, target: targetName || "Thế Giới", year, cost: mType.cost };
    window.miracleV66Data.miracles.push(entry);
    window.miracleV66Data.grandMiracles.push(entry);
    window.miracleV66Data.miracleCount++;

    // Apply effects
    _applyGrandMiracle(miracleId, targetName, year);

    // Propagate to all memory systems
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year, type: "divine", title: `${mType.icon} ${mType.label}`, color: mType.color });
    }
    if (typeof window.wmeAddMemory === "function") {
      window.wmeAddMemory({ year, category: "divine", title: `Đại Thần Tích: ${mType.label}`, content: mType.lore });
    }
    if (typeof window.mem64Record === "function") {
      window.mem64Record("divine", `${mType.icon} ${mType.label}`, mType.lore, 5, ["grand_miracle"]);
    }
    if (typeof window.creatorLeg66Record === "function") {
      window.creatorLeg66Record("grand_miracle", mType.label, targetName||"Thế Giới", mType.lore, 5);
    }

    // NPC remember the miracle
    (window.npcs || []).filter(n => n.status === "alive").slice(0, 20).forEach(npc => {
      const id = npc.id || npc.name;
      if (typeof window.npcMem64AddMemory === "function") {
        window.npcMem64AddMemory(id, "social", `Chứng Kiến: ${mType.label}`, `Tôi đã chứng kiến ${mType.label} — đó là phép màu của Đấng Sáng Thế.`, 5);
      }
    });

    save();
    return { ok: true, msg: `✨ ${mType.icon} ${mType.label} đã được thực thi! Thế giới sẽ nhớ mãi điều này.`, entry };
  };

  function _applyGrandMiracle(id, targetName, year) {
    if (id === "golden_age") {
      if (typeof window.ageV25Data !== "undefined") {
        window.ageV25Data.currentAge = "golden";
        window.ageV25Data.ageStartYear = year;
      }
      (window.countries || []).forEach(c => { c.stability = Math.min(100, (c.stability||50) + 40); });
      (window.warsActive || []).splice(0);
    }

    if (id === "divine_incarnation") {
      const npcs = window.npcs || [];
      const chosen = npcs.find(n => n.name === targetName) || npcs.filter(n => n.status === "alive")[0];
      if (chosen) {
        chosen._divineIncarnation = true;
        chosen.power = Math.floor((chosen.power||100) * 3);
        chosen.realm = "Thần Linh Hóa Thân";
        if (typeof window.npcLife65RecordLifeEvent === "function") {
          window.npcLife65RecordLifeEvent(chosen.id||chosen.name, "Thần Linh Hóa Thân", `${chosen.name} trở thành hiện thân của Đấng Sáng Thế. Sức mạnh vượt xa mọi giới hạn phàm nhân.`, 5);
        }
      }
    }

    if (id === "genesis_wave") {
      (window.warsActive || []).splice(0);
      if (typeof window.plagueData !== "undefined" && window.plagueData.activePlagues) {
        window.plagueData.activePlagues = [];
      }
      if (typeof window.disasterData !== "undefined" && window.disasterData.activeDisasters) {
        window.disasterData.activeDisasters = [];
      }
    }

    if (id === "hero_awakening") {
      const npcs = window.npcs || [];
      const mortal = npcs.find(n => n.name === targetName && n.status === "alive") || npcs.filter(n => n.status === "alive" && !(n.soul && n.soul.ambition === "conqueror"))[0];
      if (mortal) {
        mortal._heroAwakened = true;
        mortal.power = Math.floor((mortal.power||100) * 2);
        mortal.fate = "Anh Hùng Được Thức Tỉnh";
        if (typeof window.npcLife65RecordLifeEvent === "function") {
          window.npcLife65RecordLifeEvent(mortal.id||mortal.name, "Thức Tỉnh Anh Hùng", `${mortal.name} đột ngột thức tỉnh tiềm năng ẩn sâu — trở thành anh hùng do Đấng Sáng Thế chọn.`, 5);
        }
      }
    }

    if (id === "world_memory") {
      if (typeof window.worldMem64ArchiveEra === "function") {
        window.worldMem64ArchiveEra(`Thần Ký — Năm ${year}`, `Đấng Sáng Thế khắc ghi toàn bộ lịch sử thế giới vào Ký Ức Vũ Trụ. Từ đây, mọi thứ sẽ được ghi nhớ mãi mãi.`);
      }
    }
  }

  // ════ WRAP V51 MIRACLES ════
  window.mir66CastV51 = function(typeId, targetName) {
    if (typeof window.cgv51CastMiracle !== "function") return { ok: false, msg: "Miracle V51 chưa sẵn sàng." };
    const result = window.cgv51CastMiracle(typeId, targetName);
    if (result && result.ok !== false) {
      if (typeof window.creatorLeg66Record === "function") {
        window.creatorLeg66Record("miracle_v51", typeId, targetName||"Thế Giới", `Phép màu V51: ${typeId}`, 4);
      }
    }
    return result;
  };

  window.mir66GetAllHistory = function(limit) {
    const v51 = typeof window.cgv51GetMiracleHistory === "function" ? window.cgv51GetMiracleHistory() : [];
    const v66 = window.miracleV66Data.miracles;
    return [...v51, ...v66].sort((a,b) => (b.year||0) - (a.year||0)).slice(0, limit||20);
  };

  window.mir66GetStats = function() {
    const v51Count = typeof window.cgv51GetMiracleStats === "function" ? (window.cgv51GetMiracleStats().total||0) : 0;
    return {
      v51Miracles: v51Count,
      v66GrandMiracles: window.miracleV66Data.grandMiracles.length,
      totalMiracles: v51Count + window.miracleV66Data.miracleCount
    };
  };

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        ...window.miracleV66Data,
        miracles: window.miracleV66Data.miracles.slice(-50),
        grandMiracles: window.miracleV66Data.grandMiracles.slice(-30)
      }));
    } catch(e) {}
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) window.miracleV66Data = { ...window.miracleV66Data, ...JSON.parse(raw) };
    } catch(e) {}
  }

  function init() {
    load();
    console.log("[MiracleSystemV66] ✨ Đại Thần Tích V66 khởi động — 7 Grand Miracles + extends V51.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 13900); });
  } else {
    setTimeout(init, 13900);
  }
})();
