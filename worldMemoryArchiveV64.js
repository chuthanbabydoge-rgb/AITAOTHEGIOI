(function() {
  "use strict";
  const SAVE_KEY = "cgv6_world_memory_archive_v64";

  window.worldMemoryArchiveV64Data = {
    version: 64,
    eras: [],           // [{name, startYear, endYear, description, keyEvents:[]}]
    divineActs: [],     // [{year, title, description, type, impact}]
    greatDisasters: [], // [{year, name, type, casualties, region}]
    legendaryHeroes: [],// [{name, deeds:[], bornYear, diedYear, realm}]
    worldMilestones: [],// [{year, title, content, importance}]
    lastArchive: 0
  };

  function save() {
    try {
      const d = window.worldMemoryArchiveV64Data;
      const slim = {
        version: d.version,
        lastArchive: d.lastArchive,
        eras: d.eras.slice(-20),
        divineActs: d.divineActs.slice(-100),
        greatDisasters: d.greatDisasters.slice(-50),
        legendaryHeroes: d.legendaryHeroes.slice(-50),
        worldMilestones: d.worldMilestones.slice(-100)
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(slim));
    } catch(e) { console.warn("[WorldMemoryArchiveV64] save error:", e); }
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) window.worldMemoryArchiveV64Data = { ...window.worldMemoryArchiveV64Data, ...JSON.parse(raw) };
    } catch(e) {}
  }

  // Public API
  window.wma64RecordEra = function(eraName, startYear, description) {
    const d = window.worldMemoryArchiveV64Data;
    // Close previous era
    if (d.eras.length > 0 && !d.eras[d.eras.length-1].endYear) {
      d.eras[d.eras.length-1].endYear = startYear;
    }
    d.eras.push({ name: eraName, startYear, description, keyEvents: [], endYear: null });
    d.worldMilestones.push({
      year: startYear, importance: 5,
      title: `Kỷ Nguyên Mới: ${eraName}`,
      content: `Năm ${startYear}: ${description}`
    });
    if (typeof window.mem64Record === "function") {
      window.mem64Record("era", `Kỷ Nguyên ${eraName}`, description, 5, ["era_transition"]);
    }
  };

  window.wma64RecordDivineAct = function(title, description, type, impact) {
    const year = window.year || 0;
    window.worldMemoryArchiveV64Data.divineActs.push({ year, title, description, type, impact });
    window.worldMemoryArchiveV64Data.worldMilestones.push({
      year, importance: 5,
      title: `Thần Tích: ${title}`,
      content: description
    });
  };

  window.wma64RecordDisaster = function(name, type, casualties, region) {
    const year = window.year || 0;
    window.worldMemoryArchiveV64Data.greatDisasters.push({ year, name, type, casualties, region });
    window.worldMemoryArchiveV64Data.worldMilestones.push({
      year, importance: 4,
      title: `Đại Thảm: ${name}`,
      content: `${name} tàn phá ${region || "thế giới"} năm ${year}. Thương vong: ${casualties || "không thể đếm"}.`
    });
    if (typeof window.mem64Record === "function") {
      window.mem64Record("disaster", name, `${name} tàn phá ${region || "thế giới"}`, 4, ["great_disaster"]);
    }
  };

  window.wma64RecordLegendaryHero = function(heroName, realm, deeds, bornYear, diedYear) {
    const d = window.worldMemoryArchiveV64Data;
    const existing = d.legendaryHeroes.find(h => h.name === heroName);
    if (existing) {
      if (deeds) existing.deeds.push(deeds);
      if (diedYear) existing.diedYear = diedYear;
    } else {
      d.legendaryHeroes.push({
        name: heroName, realm, deeds: deeds ? [deeds] : [],
        bornYear: bornYear || 0, diedYear: diedYear || null
      });
      d.worldMilestones.push({
        year: bornYear || window.year || 0, importance: 4,
        title: `Anh Hùng Huyền Thoại: ${heroName}`,
        content: `${heroName} (${realm || "Tu Sĩ"}) xuất thế, lưu danh vạn cổ.`
      });
    }
  };

  window.wma64GetTimeline = function(limit = 30) {
    return window.worldMemoryArchiveV64Data.worldMilestones
      .sort((a,b) => b.year - a.year)
      .slice(0, limit);
  };

  window.wma64GetCurrentEra = function() {
    const eras = window.worldMemoryArchiveV64Data.eras;
    return eras.length > 0 ? eras[eras.length-1] : null;
  };

  window.wma64GetStats = function() {
    const d = window.worldMemoryArchiveV64Data;
    return {
      eras: d.eras.length,
      divineActs: d.divineActs.length,
      greatDisasters: d.greatDisasters.length,
      legendaryHeroes: d.legendaryHeroes.length,
      worldMilestones: d.worldMilestones.length,
      currentEra: d.eras.length > 0 ? d.eras[d.eras.length-1].name : "Chưa Xác Định"
    };
  };

  window.wma64GetJarvisChronicle = function() {
    const d = window.worldMemoryArchiveV64Data;
    const year = window.year || 0;
    let chronicle = `📚 **BIÊN NIÊN SỬ THẾ GIỚI** (Năm ${year})\n\n`;

    if (d.eras.length > 0) {
      chronicle += `**Kỷ Nguyên Hiện Tại:** ${d.eras[d.eras.length-1].name}\n`;
      chronicle += `**Tổng Kỷ Nguyên:** ${d.eras.length}\n\n`;
    }

    if (d.divineActs.length > 0) {
      chronicle += `**Thần Tích Đã Ghi:** ${d.divineActs.length} lần\n`;
    }
    if (d.greatDisasters.length > 0) {
      chronicle += `**Đại Thảm Họa:** ${d.greatDisasters.length} sự kiện\n`;
    }
    if (d.legendaryHeroes.length > 0) {
      chronicle += `**Anh Hùng Huyền Thoại:** ${d.legendaryHeroes.length} người\n`;
    }

    const top = d.worldMilestones.sort((a,b) => b.importance - a.importance).slice(0, 5);
    if (top.length > 0) {
      chronicle += `\n**Sự Kiện Quan Trọng Nhất:**\n`;
      top.forEach(m => chronicle += `• [Năm ${m.year}] ${m.title}\n`);
    }
    return chronicle;
  };

  function scanWorldEvents() {
    const year = window.year || 0;
    const d = window.worldMemoryArchiveV64Data;

    // Scan age transitions from V25
    if (window.ageV25Data && window.ageV25Data.currentAge) {
      const age = window.ageV25Data.currentAge;
      const exists = d.eras.some(e => e.name === age);
      if (!exists) {
        window.wma64RecordEra(age, year, `Thế giới bước vào kỷ nguyên ${age}.`);
      }
    }

    // Scan boss kills from V59
    if (window.worldBossV59Data && window.worldBossV59Data.defeatedBosses) {
      window.worldBossV59Data.defeatedBosses.forEach(boss => {
        const exists = d.legendaryHeroes.some(h => h.name === boss.name);
        if (!exists && boss.name) {
          window.wma64RecordDisaster(boss.name, "World Boss", "Vô số", "Toàn thế giới");
        }
      });
    }

    // Scan creator miracles from V51
    if (window.miracleV51Data && window.miracleV51Data.miracles) {
      window.miracleV51Data.miracles.forEach(m => {
        const exists = d.divineActs.some(a => a.title === (m.name||m.type) && a.year === (m.castYear||0));
        if (!exists && m.castYear) {
          window.wma64RecordDivineAct(m.name || m.type, `Phép màu ${m.name||m.type} được thi triển.`, "miracle", "Thần thánh");
        }
      });
    }
  }

  window.worldMemoryArchiveV64Tick = function() {
    const year = window.year || 0;
    const d = window.worldMemoryArchiveV64Data;
    if (year - d.lastArchive < 40) return;
    d.lastArchive = year;
    scanWorldEvents();
    if (year % 200 === 0) save();
  };

  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      window.worldMemoryArchiveV64Tick();
    };
    console.log("[WorldMemoryArchiveV64] ✅ Kho lưu trữ ký ức thế giới khởi động — Lịch sử được ghi chép.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 13100); });
  } else {
    setTimeout(init, 13100);
  }
})();
