(function() {
  "use strict";
  const SAVE_KEY = "cgv6_universe_template_v57";

  const PRESET_TEMPLATES = [
    {
      id: "tpl_cultivation", name: "🏯 Tu Tiên Thế Giới", category: "cultivation",
      desc: "Thế giới tu luyện cổ điển — Tu luyện pháp lực · Tông môn · Thiên đình",
      settings: { worldType: "cultivation", startYear: 1, npcCount: 50, kingdomCount: 3, raceCount: 3, techLevel: "ancient" },
      author: "System", uses: 0, rating: 4.8
    },
    {
      id: "tpl_fantasy", name: "🐲 Kiếm Hiệp Kỳ Huyễn", category: "fantasy",
      desc: "Thế giới huyền huyễn — Rồng · Phép thuật · Đế quốc",
      settings: { worldType: "fantasy", startYear: 100, npcCount: 80, kingdomCount: 5, raceCount: 5, techLevel: "medieval" },
      author: "System", uses: 0, rating: 4.6
    },
    {
      id: "tpl_chaos", name: "🌀 Hỗn Mang Thần Giới", category: "chaos",
      desc: "Thế giới hỗn mang — Thần linh · Ác ma · Chiến tranh vũ trụ",
      settings: { worldType: "chaos", startYear: 0, npcCount: 30, kingdomCount: 2, raceCount: 8, techLevel: "divine" },
      author: "System", uses: 0, rating: 4.9
    },
    {
      id: "tpl_modern", name: "🌆 Dị Thế Hiện Đại", category: "modern",
      desc: "Thế giới hiện đại dị năng — Siêu năng lực · Tổ chức bí mật",
      settings: { worldType: "modern", startYear: 2000, npcCount: 100, kingdomCount: 8, raceCount: 2, techLevel: "modern" },
      author: "System", uses: 0, rating: 4.3
    },
    {
      id: "tpl_apocalypse", name: "☠️ Tận Thế Sinh Tồn", category: "apocalypse",
      desc: "Thế giới hậu tận thế — Zombie · Tài nguyên khan hiếm · Phe phái sống còn",
      settings: { worldType: "apocalypse", startYear: 2050, npcCount: 40, kingdomCount: 4, raceCount: 1, techLevel: "collapsed" },
      author: "System", uses: 0, rating: 4.5
    }
  ];

  window.universeTemplateData = {
    savedTemplates: [],
    presets: PRESET_TEMPLATES,
    sharedCodes: [],
    tick: 0,
    version: "V57"
  };

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.universeTemplateData)); } catch(e) {} }
  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) {
        var p = JSON.parse(d);
        if (p.savedTemplates) window.universeTemplateData.savedTemplates = p.savedTemplates;
        if (p.sharedCodes) window.universeTemplateData.sharedCodes = p.sharedCodes;
      }
    } catch(e) {}
  }

  function getYear() { return (typeof window.year === "number") ? window.year : 0; }

  function captureWorldSnapshot() {
    var snap = { capturedYear: getYear() };
    if (typeof window.world !== "undefined") snap.worldName = window.world.name || "Thế Giới";
    if (typeof window.year === "number") snap.year = window.year;
    if (typeof window.countries !== "undefined" && Array.isArray(window.countries)) snap.countryCount = window.countries.length;
    if (typeof window.npcs !== "undefined" && Array.isArray(window.npcs)) snap.npcCount = window.npcs.length;
    if (typeof window.kingdomData !== "undefined" && window.kingdomData.kingdoms) {
      var kings = Array.isArray(window.kingdomData.kingdoms) ? window.kingdomData.kingdoms : Object.values(window.kingdomData.kingdoms || {});
      snap.kingdomCount = kings.length;
    }
    if (typeof window.warsActive !== "undefined") snap.activeWars = window.warsActive.length;
    return snap;
  }

  window.uts57SaveTemplate = function(name, desc, tags) {
    var snapshot = captureWorldSnapshot();
    var template = {
      id: "utpl_" + Date.now(),
      name: name || ("Template Năm " + getYear()),
      desc: desc || "Bản mẫu thế giới tùy chỉnh",
      category: "custom", author: "player",
      snapshot: snapshot,
      settings: { worldType: "custom", savedYear: getYear() },
      tags: tags || [],
      uses: 0, rating: 0, ratingCount: 0,
      createdYear: getYear(),
      shareCode: null
    };
    window.universeTemplateData.savedTemplates.unshift(template);
    if (window.universeTemplateData.savedTemplates.length > 50) window.universeTemplateData.savedTemplates.length = 50;

    if (typeof window.creg57Register === "function") window.creg57Register("template", name, snapshot, "player");
    if (typeof window.ce57RecordCreation === "function") window.ce57RecordCreation("template", name, "player");
    save();
    return template;
  };

  window.uts57GenerateShareCode = function(templateId) {
    var t = window.universeTemplateData.savedTemplates.find(function(t) { return t.id === templateId; });
    if (!t) {
      var p = PRESET_TEMPLATES.find(function(p) { return p.id === templateId; });
      if (!p) return null;
      t = p;
    }
    var code = "CGV6-" + Math.random().toString(36).substr(2, 8).toUpperCase();
    t.shareCode = code;
    window.universeTemplateData.sharedCodes.push({ code: code, templateId: templateId, templateName: t.name, year: getYear() });
    if (window.universeTemplateData.sharedCodes.length > 50) window.universeTemplateData.sharedCodes.length = 50;
    save();
    return code;
  };

  window.uts57CloneTemplate = function(templateId) {
    var src = PRESET_TEMPLATES.find(function(p) { return p.id === templateId; }) ||
              window.universeTemplateData.savedTemplates.find(function(t) { return t.id === templateId; });
    if (!src) return null;
    src.uses = (src.uses || 0) + 1;
    var clone = Object.assign({}, src, {
      id: "utpl_clone_" + Date.now(),
      name: "[Clone] " + src.name,
      author: "player",
      createdYear: getYear()
    });
    window.universeTemplateData.savedTemplates.unshift(clone);
    save();
    return clone;
  };

  window.uts57GetTemplates = function() { return window.universeTemplateData.savedTemplates; };
  window.uts57GetPresets = function() { return window.universeTemplateData.presets; };
  window.uts57GetStats = function() {
    return {
      savedCount: window.universeTemplateData.savedTemplates.length,
      presetCount: PRESET_TEMPLATES.length,
      sharedCodes: window.universeTemplateData.sharedCodes.length,
      totalUses: window.universeTemplateData.savedTemplates.reduce(function(s, t) { return s + (t.uses || 0); }, 0)
    };
  };
  window.uts57GetJarvisSuggestion = function() {
    var snap = captureWorldSnapshot();
    var year = snap.capturedYear;
    var suggestions = [];
    if (snap.countryCount < 5) suggestions.push("💡 Thêm nhiều quốc gia để tạo template phong phú hơn");
    if ((snap.activeWars || 0) > 3) suggestions.push("⚡ Thế giới đang có chiến tranh — lý tưởng để lưu template kịch tính");
    if (year > 500) suggestions.push("📜 Thế giới đã có " + year + " năm lịch sử — đây là thời điểm tốt để lưu template");
    if (window.universeTemplateData.savedTemplates.length === 0) suggestions.push("🌍 Bạn chưa có template nào — hãy lưu template đầu tiên!");
    return suggestions.length > 0 ? suggestions : ["✅ Thế giới đang ổn định · Có thể lưu template bất cứ lúc nào"];
  };

  function init() {
    load();
    save();
    console.log("[UniverseTemplateSystemV57] 🗂️ Template Vũ Trụ V57 — " + PRESET_TEMPLATES.length + " preset · " + window.universeTemplateData.savedTemplates.length + " saved · Share codes · Jarvis suggestions sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 9800); });
  } else { setTimeout(init, 9800); }
})();
