(function() {
  "use strict";
  const SAVE_KEY = "cgv6_creator_memory_v64";

  window.creatorMemoryV64Data = {
    version: 64,
    creatorName: "Thần Sáng Thế",
    creatorTitle: "Người Tạo Ra Tất Cả",
    interventions: [],    // [{year, type, title, target, effect, importance}]
    miracles: [],         // [{year, type, name, target, impact}]
    godlyDisasters: [],   // [{year, type, name, description, casualties}]
    decrees: [],          // [{year, type, target, effect}]
    creatorLegacy: [],    // [{year, title, content, importance}] — how world remembers creator
    totalInterventions: 0,
    lastScan: 0
  };

  function save() {
    try {
      const d = window.creatorMemoryV64Data;
      const slim = { ...d };
      slim.interventions = slim.interventions.slice(-200);
      slim.miracles = slim.miracles.slice(-100);
      slim.godlyDisasters = slim.godlyDisasters.slice(-50);
      slim.decrees = slim.decrees.slice(-100);
      slim.creatorLegacy = slim.creatorLegacy.slice(-50);
      localStorage.setItem(SAVE_KEY, JSON.stringify(slim));
    } catch(e) { console.warn("[CreatorMemoryV64] save error:", e); }
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) window.creatorMemoryV64Data = { ...window.creatorMemoryV64Data, ...JSON.parse(raw) };
    } catch(e) {}
  }

  // Public API — called by other systems when creator acts
  window.creatorMem64RecordIntervention = function(type, title, target, effect, importance) {
    const year = window.year || 0;
    window.creatorMemoryV64Data.interventions.push({ year, type, title, target, effect, importance: importance || 4 });
    window.creatorMemoryV64Data.totalInterventions++;

    // Auto-generate legacy memory
    const legacyTexts = {
      miracle: `Ngài đã ban phép màu ${title} lên ${target}.`,
      decree: `Ngài phán lệnh: ${title} ảnh hưởng đến ${target}.`,
      disaster: `Ngài gửi thiên tai ${title} xuống ${target}.`,
      blessing: `Ngài ban phước lành ${title} cho ${target}.`,
      curse: `Ngài giáng lời nguyền ${title} lên ${target}.`
    };
    const legacyContent = legacyTexts[type] || `Ngài đã can thiệp: ${title}.`;
    window.creatorMemoryV64Data.creatorLegacy.push({
      year, importance: importance || 4,
      title: `${title}`,
      content: legacyContent
    });

    // Propagate to global memory
    if (typeof window.mem64Record === "function") {
      window.mem64Record("creator", title, legacyContent, importance || 4, ["creator_act"]);
    }
    save();
  };

  window.creatorMem64RecordMiracle = function(miracleName, target, impact) {
    const year = window.year || 0;
    window.creatorMemoryV64Data.miracles.push({ year, name: miracleName, target, impact });
    window.creatorMem64RecordIntervention("miracle", miracleName, target, impact, 5);
  };

  window.creatorMem64RecordDisaster = function(disasterName, description, casualties) {
    const year = window.year || 0;
    window.creatorMemoryV64Data.godlyDisasters.push({ year, name: disasterName, description, casualties });
    window.creatorMem64RecordIntervention("disaster", disasterName, description, casualties, 5);
  };

  window.creatorMem64RecordDecree = function(decreeName, target, effect) {
    const year = window.year || 0;
    window.creatorMemoryV64Data.decrees.push({ year, type: decreeName, target, effect });
    window.creatorMem64RecordIntervention("decree", decreeName, target, effect, 4);
  };

  window.creatorMem64GetLegacy = function() {
    return window.creatorMemoryV64Data.creatorLegacy
      .sort((a,b) => b.importance - a.importance || b.year - a.year)
      .slice(0, 20);
  };

  window.creatorMem64GetStats = function() {
    const d = window.creatorMemoryV64Data;
    return {
      name: d.creatorName,
      title: d.creatorTitle,
      totalInterventions: d.totalInterventions,
      miracles: d.miracles.length,
      disasters: d.godlyDisasters.length,
      decrees: d.decrees.length,
      legacyEvents: d.creatorLegacy.length,
      firstIntervention: d.interventions[0] ? `Năm ${d.interventions[0].year}: ${d.interventions[0].title}` : "Chưa có",
      mostRecent: d.interventions.length > 0 ? d.interventions[d.interventions.length-1] : null
    };
  };

  window.creatorMem64GetWorldPerspective = function() {
    const d = window.creatorMemoryV64Data;
    if (d.totalInterventions === 0) return "Thần Sáng Thế vẫn chưa hiện thân trong thế giới này.";
    const pronouncements = [
      `"Ngài là vị thần đã ban ${d.miracles.length} phép màu cho thế giới chúng tôi."`,
      `"Chúng tôi nhớ ${d.totalInterventions} lần Ngài can thiệp vào vận mệnh của chúng tôi."`,
      `"Ngài đã gửi ${d.godlyDisasters.length} thiên tai như lời thử thách và ${d.decrees.length} sắc lệnh như luật trời."`,
      `"Tên Ngài được khắc vào lịch sử qua ${d.creatorLegacy.length} sự kiện không thể quên."`
    ];
    return pronouncements[Math.floor(d.totalInterventions / 5) % pronouncements.length];
  };

  // Scan V51 miracle/decree/event data
  function scanCreatorActions() {
    const year = window.year || 0;
    const d = window.creatorMemoryV64Data;

    // Sync from miracleSystemV51
    if (window.miracleV51Data && window.miracleV51Data.miracles) {
      window.miracleV51Data.miracles.forEach(m => {
        const key = "miracle_" + m.type + "_" + (m.castYear || 0);
        const exists = d.miracles.some(x => x.name === m.type && x.year === (m.castYear||0));
        if (!exists && m.castYear) {
          window.creatorMem64RecordMiracle(m.name || m.type, m.target || "Thế Giới", "Phép màu thần thánh");
        }
      });
    }

    // Sync from globalEventControlV51
    if (window.globalEventV51Data && window.globalEventV51Data.activeEvents) {
      window.globalEventV51Data.activeEvents.forEach(ev => {
        const exists = d.interventions.some(x => x.title === (ev.name || ev.type));
        if (!exists && ev.name) {
          window.creatorMem64RecordIntervention("decree", ev.name, "Toàn Thế Giới", ev.description || "", 4);
        }
      });
    }
  }

  window.creatorMemoryV64Tick = function() {
    const year = window.year || 0;
    const d = window.creatorMemoryV64Data;
    if (year - d.lastScan < 25) return;
    d.lastScan = year;
    scanCreatorActions();
  };

  function init() {
    load();

    // Set creator name from worldDNA if available
    setTimeout(function() {
      if (window.wdna62GetCreator && typeof window.wdna62GetCreator === "function") {
        const creator = window.wdna62GetCreator();
        if (creator && creator.title) window.creatorMemoryV64Data.creatorTitle = creator.title;
      }
    }, 2000);

    const _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      window.creatorMemoryV64Tick();
    };
    console.log("[CreatorMemoryV64] ✅ Ký ức tạo hóa khởi động — Thế giới bắt đầu nhớ Ngài.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 12900); });
  } else {
    setTimeout(init, 12900);
  }
})();
