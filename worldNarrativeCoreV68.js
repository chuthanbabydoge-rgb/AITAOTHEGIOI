(function() {
  "use strict";

  // ════════════════════════════════════════
  // WORLD NARRATIVE CORE V68
  // Quản lý chapters + data pipeline cho AI
  // ════════════════════════════════════════

  const SAVE_KEY = "cgv6_world_narrative_v68";

  window.worldNarrativeV68Data = {
    version: 68,
    chapters: [],        // { id, year, era, title, content, generatedAt, wordCount, tags }
    totalGenerated: 0,
    lastGeneratedYear: 0,
    settings: {
      style: "su_thi",       // su_thi / truyen_ky / bien_nien_su / su_thi_anh_hung
      length: "medium",      // short / medium / long
      language: "vi",        // vi (Vietnamese classical)
      autoGenerate: false,   // auto generate every N years
      autoInterval: 500      // years between auto-chapters
    }
  };

  // ════ STYLES ════
  window.wn68Styles = [
    { id:"su_thi",         label:"📜 Sử Thi",          desc:"Văn phong sử thi hào hùng, trang trọng" },
    { id:"truyen_ky",      label:"📖 Truyện Ký",        desc:"Văn phong kể chuyện, sinh động" },
    { id:"bien_nien_su",   label:"🗞️ Biên Niên Sử",    desc:"Ghi chép theo trình tự thời gian" },
    { id:"su_thi_anh_hung",label:"⚔️ Sử Thi Anh Hùng", desc:"Tập trung vào anh hùng hào kiệt" }
  ];

  // ════ SAVE / LOAD ════
  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.worldNarrativeV68Data)); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) {
        const parsed = JSON.parse(d);
        window.worldNarrativeV68Data = Object.assign(window.worldNarrativeV68Data, parsed);
      }
    } catch(e) {}
  }
  window.wn68Save = save;

  // ════ ADD CHAPTER ════
  window.wn68AddChapter = function(chapter) {
    const d = window.worldNarrativeV68Data;
    chapter.id = "ch_" + Date.now();
    chapter.generatedAt = new Date().toISOString();
    chapter.wordCount = chapter.content ? chapter.content.split(/\s+/).length : 0;
    d.chapters.push(chapter);
    d.totalGenerated++;
    d.lastGeneratedYear = chapter.year || 0;
    save();

    // Save to World Memory V64
    if (typeof window.wmeAddMemory === "function") {
      window.wmeAddMemory({
        year: chapter.year,
        category: "narrative",
        title: chapter.title,
        content: chapter.content ? chapter.content.substring(0, 400) + "..." : ""
      });
    }
    // Add to historical timeline
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({
        year: chapter.year,
        type: "narrative",
        title: "📜 " + chapter.title,
        color: "#fbbf24"
      });
    }
    return chapter;
  };

  // ════ GET CHAPTERS (sorted by year) ════
  window.wn68GetChapters = function() {
    return [...window.worldNarrativeV68Data.chapters].sort((a, b) => (a.year || 0) - (b.year || 0));
  };

  window.wn68DeleteChapter = function(id) {
    const d = window.worldNarrativeV68Data;
    d.chapters = d.chapters.filter(c => c.id !== id);
    save();
  };

  // ════ BUILD WORLD SNAPSHOT (for AI prompt) ════
  window.wn68BuildSnapshot = function() {
    const year = window.year || 0;
    const snap = { year, sections: [] };

    // World basics
    const worldName = (window.world && window.world.name) ? window.world.name : "Thế Giới Không Tên";
    snap.worldName = worldName;

    // Current age/era
    if (window.ageV25Data && window.ageV25Data.current) {
      snap.era = window.ageV25Data.current.name || "Kỷ Nguyên Hiện Tại";
    } else {
      snap.era = "Kỷ Nguyên Hiện Tại";
    }

    // Countries (top 8 by population)
    const countries = (window.countries || [])
      .sort((a, b) => (b.population || 0) - (a.population || 0))
      .slice(0, 8)
      .map(c => `${c.name} (dân số: ${c.population || 0}, ổn định: ${c.stability || 0}%)`);
    if (countries.length > 0) snap.sections.push({ heading: "Các Quốc Gia Hùng Mạnh", items: countries });

    // Active wars
    if (window.warsActive && window.warsActive.length > 0) {
      const wars = window.warsActive.slice(0, 5).map(w =>
        `${w.attacker || "?"} đang chiến với ${w.defender || "?"} (bắt đầu năm ${w.startYear || year})`
      );
      snap.sections.push({ heading: "Chiến Tranh Đang Diễn Ra", items: wars });
    }

    // Empires
    if (window.empireData && window.empireData.empires) {
      const es = Array.isArray(window.empireData.empires) ? window.empireData.empires : Object.values(window.empireData.empires || {});
      const empires = es.slice(0, 5).map(e => `${e.name || "?"} (sức mạnh: ${e.power || 0})`);
      if (empires.length > 0) snap.sections.push({ heading: "Đế Quốc", items: empires });
    }

    // Top NPCs (heroes/legends)
    const heroNpcs = (window.npcs || [])
      .filter(n => n.status === "alive" && (n.power || 0) > 200)
      .sort((a, b) => (b.power || 0) - (a.power || 0))
      .slice(0, 6)
      .map(n => `${n.name} (${n.class || n.profession || "anh hùng"}, sức mạnh: ${n.power || 0}, quốc gia: ${n.country || "?"})`);
    if (heroNpcs.length > 0) snap.sections.push({ heading: "Anh Hùng Hào Kiệt", items: heroNpcs });

    // Recent historical events (last 15)
    const ht = window.historicalTimeline || window.htData || [];
    const htArray = (Array.isArray(ht) ? ht : Object.values(ht)).filter(e => e && e.year);
    const recentEvents = htArray
      .sort((a, b) => (b.year || 0) - (a.year || 0))
      .slice(0, 15)
      .reverse()
      .map(e => `Năm ${e.year}: ${e.title || "Sự kiện"}`);
    if (recentEvents.length > 0) snap.sections.push({ heading: "Sự Kiện Lịch Sử Gần Đây", items: recentEvents });

    // Divine acts (V66)
    if (window.creatorLegacyV66Data && window.creatorLegacyV66Data.legacyEntries) {
      const divActs = window.creatorLegacyV66Data.legacyEntries
        .slice(-8)
        .map(e => `Năm ${e.year || 0}: ${e.title || "Hành động thần linh"} (mục tiêu: ${e.target || "?"})`);
      if (divActs.length > 0) snap.sections.push({ heading: "Hành Động Của Đấng Sáng Thế", items: divActs });
    }

    // Active prophecies
    const prophs = [];
    if (window.prophecyV51Data && window.prophecyV51Data.active) {
      window.prophecyV51Data.active.slice(0, 3).forEach(p => prophs.push(p.text || p.content || "Lời tiên tri..."));
    }
    if (window.prophecyV66Data && window.prophecyV66Data.watching) {
      window.prophecyV66Data.watching.slice(0, 3).forEach(w => {
        const found = (window.prophecyV66Data.prophecies || []).find(p => p.id === w.prophecyId);
        if (found && !w._fulfilled) prophs.push(found.text || "Lời tiên tri...");
      });
    }
    if (prophs.length > 0) snap.sections.push({ heading: "Tiên Tri Chưa Ứng Nghiệm", items: prophs.slice(0, 5) });

    // God status
    if (typeof window.creatorLeg66GetGodRank === "function") {
      const rank = window.creatorLeg66GetGodRank();
      const score = typeof window.creatorLeg66GetGodScore === "function" ? window.creatorLeg66GetGodScore() : 0;
      snap.godStatus = `${rank.icon} ${rank.title} (Thần Uy: ${score} điểm)`;
    }

    return snap;
  };

  // ════ GAMETIC HOOK (auto-generate) ════
  let _lastAutoYear = 0;
  window.wn68Tick = function() {
    const d = window.worldNarrativeV68Data;
    if (!d.settings.autoGenerate) return;
    const yr = window.year || 0;
    if (yr - _lastAutoYear >= d.settings.autoInterval && yr > 0) {
      _lastAutoYear = yr;
      // Auto-generate silently
      if (typeof window.ng68GenerateChapter === "function") {
        window.ng68GenerateChapter(true).catch(() => {});
      }
    }
  };

  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); window.wn68Tick(); };
    _lastAutoYear = window.worldNarrativeV68Data.lastGeneratedYear || 0;
    console.log("[WorldNarrativeCoreV68] 📜 World Narrative Core khởi động — " +
      window.worldNarrativeV68Data.chapters.length + " chapters.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 15200); });
  } else {
    setTimeout(init, 15200);
  }
})();
