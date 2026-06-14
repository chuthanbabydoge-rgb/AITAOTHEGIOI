(function() {
  "use strict";
  const SAVE_KEY = "cgv6_timeline_branch_v76";

  var EVO_TABS = [
    { id: "evo76",      icon: "🌱", label: "Evolution" },
    { id: "timeline76", icon: "🌿", label: "Timeline Branches" },
    { id: "forecast76", icon: "🔮", label: "World Forecast" },
    { id: "emerging76", icon: "🏛️", label: "Emerging Civilizations" }
  ];

  var state = { activeTab: "evo76" };

  window.timelineBranchV76Data = {
    branches: [],
    activeBranch: "main",
    mainSnapshot: null,
    comparisons: [],
    jarvisNotes: [],
    tickCounter: 0,
    stats: { totalBranches: 0, totalComparisons: 0 },
    version: "V76"
  };

  function save() {
    try {
      var d = {
        branches: window.timelineBranchV76Data.branches.slice(-10),
        activeBranch: window.timelineBranchV76Data.activeBranch,
        mainSnapshot: window.timelineBranchV76Data.mainSnapshot,
        comparisons: window.timelineBranchV76Data.comparisons.slice(-10),
        jarvisNotes: window.timelineBranchV76Data.jarvisNotes.slice(-20),
        stats: window.timelineBranchV76Data.stats,
        version: "V76"
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(d));
    } catch(e) {}
  }
  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) {
        var p = JSON.parse(d);
        Object.assign(window.timelineBranchV76Data, p);
        window.timelineBranchV76Data.tickCounter = 0;
      }
    } catch(e) {}
  }

  function getYear() { return typeof window.year === "number" ? window.year : 1; }

  function snapWorld() {
    return {
      year: getYear(),
      time: Date.now(),
      world: window.world ? { name: (window.world.name||""), civScore: (window.world.civScore||0) } : {},
      countriesCount: Array.isArray(window.countries) ? window.countries.length : 0,
      countries: Array.isArray(window.countries) ? window.countries.slice(0,10).map(function(c) { return { name: c.name, power: c.power||0, stability: c.stability||0 }; }) : [],
      evoStats: (window.universeEvoV76Data && window.universeEvoV76Data.stats) ? Object.assign({}, window.universeEvoV76Data.stats) : {},
      langStats: (window.languageEvoV76Data && window.languageEvoV76Data.stats) ? Object.assign({}, window.languageEvoV76Data.stats) : {},
      civStats: (window.emergentCivV76Data && window.emergentCivV76Data.stats) ? Object.assign({}, window.emergentCivV76Data.stats) : {},
      histStats: window.adaptiveHistoryV76Data ? { totalChronicles: window.adaptiveHistoryV76Data.totalChronicles, chars: (window.adaptiveHistoryV76Data.emergentCharacters||[]).length } : {},
      emergentCountries: (window.universeEvoV76Data && window.universeEvoV76Data.emergentCountries) ? window.universeEvoV76Data.emergentCountries.length : 0,
      emergentRaces: (window.universeEvoV76Data && window.universeEvoV76Data.emergentRaces) ? window.universeEvoV76Data.emergentRaces.length : 0,
      aliveLangs: typeof window.lang76GetAlive === "function" ? window.lang76GetAlive().length : 0
    };
  }

  window.tb76SaveMainTimeline = function() {
    window.timelineBranchV76Data.mainSnapshot = snapWorld();
    save();
    return { ok: true, msg: "✅ Timeline chính đã lưu! Năm " + getYear() };
  };

  window.tb76CreateBranch = function(label) {
    var snap = snapWorld();
    var entry = { id: "br_" + Date.now(), label: label || ("Nhánh " + (window.timelineBranchV76Data.branches.length + 1)), snapshot: snap, year: getYear(), createdAt: new Date().toISOString().slice(0,16) };
    window.timelineBranchV76Data.branches.unshift(entry);
    if (window.timelineBranchV76Data.branches.length > 10) window.timelineBranchV76Data.branches.pop();
    window.timelineBranchV76Data.stats.totalBranches++;
    if (typeof window.htAddEvent === "function") window.htAddEvent({ year: getYear(), type: "timeline_branch", title: "🌿 Timeline phân nhánh: " + entry.label, color: "#10b981" });
    save();
    return { ok: true, branch: entry, msg: "✅ Nhánh \"" + entry.label + "\" đã lưu!" };
  };

  window.tb76CompareBranches = function(branchId) {
    var branch = window.timelineBranchV76Data.branches.find(function(b) { return b.id === branchId; });
    if (!branch) return { ok: false, msg: "Không tìm thấy nhánh!" };
    var main = window.timelineBranchV76Data.mainSnapshot || { year: 0, countriesCount: 0, emergentCountries: 0, emergentRaces: 0, aliveLangs: 0, evoStats: {}, civStats: {}, histStats: {} };
    var bs = branch.snapshot;
    var diff = {
      yearDiff: bs.year - main.year,
      countryDiff: bs.countriesCount - main.countriesCount,
      emergentCountryDiff: (bs.emergentCountries||0) - (main.emergentCountries||0),
      emergentRaceDiff: (bs.emergentRaces||0) - (main.emergentRaces||0),
      langDiff: (bs.aliveLangs||0) - (main.aliveLangs||0),
      newInventions: (bs.civStats && bs.civStats.inventions) ? bs.civStats.inventions - ((main.civStats && main.civStats.inventions)||0) : 0,
      newHeroes: (bs.evoStats && bs.evoStats.heroes) ? bs.evoStats.heroes - ((main.evoStats && main.evoStats.heroes)||0) : 0,
      newChronicles: bs.histStats ? (bs.histStats.totalChronicles||0) - ((main.histStats && main.histStats.totalChronicles)||0) : 0
    };
    var comp = { branchId: branchId, branchLabel: branch.label, diff: diff, time: Date.now() };
    window.timelineBranchV76Data.comparisons.unshift(comp);
    window.timelineBranchV76Data.stats.totalComparisons++;
    save();
    return { ok: true, comparison: comp, branch: branch, main: main };
  };

  window.tb76JarvisAnalyze = function() {
    var evo  = window.universeEvoV76Data || {};
    var lang = window.languageEvoV76Data || {};
    var civ  = window.emergentCivV76Data || {};
    var hist = window.adaptiveHistoryV76Data || {};
    var alive = typeof window.lang76GetAlive === "function" ? window.lang76GetAlive().length : 0;
    var note = [
      "🤖 JARVIS PHÂN TÍCH TIẾN HÓA [Năm " + getYear() + "]",
      "━━━━━━━━━━━━━━━━━━━━━━━━",
      "🌱 Tiến Hóa Vũ Trụ:",
      "  · Quốc gia tự sinh: " + ((evo.stats && evo.stats.countries) || 0),
      "  · Chủng tộc tự sinh: " + ((evo.stats && evo.stats.races) || 0),
      "  · Tôn giáo tự sinh: " + ((evo.stats && evo.stats.religions) || 0),
      "  · Anh hùng tự sinh: " + ((evo.stats && evo.stats.heroes) || 0),
      "  · Tổng tiến hóa: " + (evo.totalEvolutions || 0),
      "📖 Ngôn Ngữ:",
      "  · Đang sống: " + alive + " ngôn ngữ",
      "  · Đã biến mất: " + ((lang.stats && lang.stats.totalDead) || 0),
      "  · Phân nhánh: " + ((lang.stats && lang.stats.totalBranched) || 0),
      "🏛️ Văn Minh:",
      "  · Phát minh: " + ((civ.stats && civ.stats.inventions) || 0),
      "  · Sụp đổ: " + ((civ.stats && civ.stats.collapses) || 0),
      "  · Sáp nhập: " + ((civ.stats && civ.stats.merges) || 0),
      "📜 Lịch Sử:",
      "  · Biên niên: " + (hist.totalChronicles || 0),
      "  · Nhân vật: " + ((hist.emergentCharacters || []).length),
      "  · Tiên tri: " + ((hist.worldForecast || []).length),
      "🔮 NHẬN XÉT:",
      "  Xu hướng: " + ((civ.stats && civ.stats.collapses > civ.stats.merges) ? "Phân mảnh hóa 🔴" : "Thống nhất hóa 🟢"),
      "  Trạng thái: " + ((evo.totalEvolutions || 0) > 30 ? "Tiến hóa MẠNH ⚡" : (evo.totalEvolutions || 0) > 10 ? "Tiến hóa ổn định 🟡" : "Tiến hóa chậm 🔵")
    ].join("\n");
    var entry = { year: getYear(), note: note, time: Date.now() };
    window.timelineBranchV76Data.jarvisNotes.unshift(entry);
    if (window.timelineBranchV76Data.jarvisNotes.length > 20) window.timelineBranchV76Data.jarvisNotes.pop();
    save();
    return entry;
  };

  // ─── UI Helpers ─────────────────────────────────────────────
  function card(c, bc, bg) { return '<div style="background:' + (bg||"#0f0f1e") + ';border:1px solid ' + (bc||"#1e1e3a") + ';border-radius:10px;padding:12px;margin-bottom:8px">' + c + '</div>'; }
  function badge(t, c) { return '<span style="background:' + (c||"#1e1e3a") + '33;color:' + (c||"#9ca3af") + ';padding:2px 8px;border-radius:4px;font-size:10px;border:1px solid ' + (c||"#374151") + '44;margin-right:4px">' + t + '</span>'; }
  function sTitle(t, c) { return '<div style="color:' + (c||"#a78bfa") + ';font-weight:700;font-size:12px;margin:10px 0 6px">' + t + '</div>'; }
  function statRow(l, v, c) { return '<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #0a0a1a"><span style="color:#9ca3af;font-size:10px">' + l + '</span><span style="color:' + (c||"#e5e7eb") + ';font-size:10px;font-weight:600">' + v + '</span></div>'; }
  function btn(l, oc, c, bg, ex) { return '<button onclick="' + oc + '" style="padding:7px 12px;border-radius:8px;border:1px solid ' + (c||"#374151") + ';background:' + (bg||"transparent") + ';color:' + (c||"#9ca3af") + ';cursor:pointer;font-size:11px;' + (ex||"") + '">' + l + '</button>'; }

  // ─── TAB: Evolution ─────────────────────────────────────────
  function renderEvolution() {
    var evo  = window.universeEvoV76Data || {};
    var lang = window.languageEvoV76Data || {};
    var civ  = window.emergentCivV76Data || {};
    var log  = evo.evolutionLog || [];
    var alive = typeof window.lang76GetAlive === "function" ? window.lang76GetAlive().length : 0;
    return '<div style="padding:12px">' +
      card(
        '<div style="font-size:18px;margin-bottom:4px">🌱 Thế Giới Tự Tiến Hóa</div>' +
        '<div style="color:#9ca3af;font-size:11px;line-height:1.6">AI tự động tạo quốc gia · chủng tộc · tôn giáo · ngôn ngữ · văn minh mỗi tick.<br>Creator offline 1 tháng quay lại — thế giới đã hoàn toàn thay đổi.</div>',
        "#10b981", "#022c22"
      ) +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px">' +
        card(statRow("Tổng tiến hóa", evo.totalEvolutions||0, "#10b981") + statRow("QG tự sinh", (evo.stats||{}).countries||0, "#3b82f6") + statRow("Chủng tộc", (evo.stats||{}).races||0, "#8b5cf6") + statRow("Tôn giáo", (evo.stats||{}).religions||0, "#f59e0b") + statRow("Anh hùng", (evo.stats||{}).heroes||0, "#ef4444"), "#10b98144") +
        card(statRow("Ngôn ngữ sống", alive, "#10b981") + statRow("Ngôn ngữ đã chết", (lang.stats||{}).totalDead||0, "#ef4444") + statRow("Phân nhánh", (lang.stats||{}).totalBranched||0, "#8b5cf6") + statRow("Phát minh", (civ.stats||{}).inventions||0, "#10b981") + statRow("Sụp đổ VĂN MINH", (civ.stats||{}).collapses||0, "#ef4444"), "#374151") +
      '</div>' +
      '<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">' +
        btn("🌱 Kích Hoạt", "tbeForce()", "#10b981", "#022c22") +
        btn(evo.enabled !== false ? "⏸ Tạm Dừng" : "▶ Tiếp Tục", "tbeToggle()", evo.enabled !== false ? "#f59e0b" : "#10b981", "transparent") +
        btn("🤖 Jarvis", "tbeJarvis()", "#8b5cf6", "#1a0a3a") +
      '</div>' +
      '<div style="margin-bottom:10px"><span style="color:#9ca3af;font-size:11px">Tốc độ: </span>' +
        ["0.5x","1x","2x","5x"].map(function(s) {
          var v = parseFloat(s), active = Math.abs((evo.evolutionSpeed||1) - v) < 0.01;
          return '<button onclick="tbeSpeed(' + v + ')" style="padding:4px 10px;border-radius:5px;border:1px solid ' + (active ? "#10b981" : "#374151") + ';background:' + (active ? "#022c22" : "transparent") + ';color:' + (active ? "#10b981" : "#9ca3af") + ';cursor:pointer;font-size:10px;margin-left:4px">' + s + '</button>';
        }).join("") +
      '</div>' +
      sTitle("📜 Nhật Ký Tiến Hóa (" + log.length + ")") +
      '<div style="max-height:180px;overflow-y:auto">' +
        (log.length === 0 ? '<div style="color:#6b7280;font-size:11px;text-align:center;padding:12px">Chưa có sự kiện. Hãy đợi hoặc nhấn "Kích Hoạt".</div>' :
          log.slice(0, 25).map(function(e) {
            return '<div style="padding:5px 8px;border-left:2px solid ' + (e.color||"#8b5cf6") + ';margin-bottom:3px;background:#0a0a1a;border-radius:0 5px 5px 0">' +
              '<div style="color:#6b7280;font-size:9px">Năm ' + e.year + '</div>' +
              '<div style="color:#d1d5db;font-size:10px">' + e.msg + '</div>' +
            '</div>';
          }).join("")) +
      '</div>' +
    '</div>';
  }

  // ─── TAB: Timeline Branches ─────────────────────────────────
  function renderTimeline() {
    var branches = window.timelineBranchV76Data.branches;
    var main = window.timelineBranchV76Data.mainSnapshot;
    var jarvis = window.timelineBranchV76Data.jarvisNotes;
    return '<div style="padding:12px">' +
      sTitle("💾 Timeline Chính") +
      card(
        (main ? [
          '<div style="color:#10b981;font-size:12px;font-weight:600;margin-bottom:6px">✅ Đã lưu — Năm ' + main.year + '</div>',
          statRow("Quốc gia tổng", main.countriesCount, "#3b82f6"),
          statRow("QG tự sinh", main.emergentCountries||0, "#8b5cf6"),
          statRow("Chủng tộc tự sinh", main.emergentRaces||0, "#a78bfa"),
          statRow("Ngôn ngữ sống", main.aliveLangs||0, "#10b981"),
          statRow("Phát minh", (main.civStats && main.civStats.inventions)||0, "#10b981")
        ].join("") : '<div style="color:#6b7280;font-size:11px">Chưa lưu timeline chính. Nhấn "Lưu Timeline Chính" để tạo điểm tham chiếu.</div>') +
        '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">' +
          btn("💾 Lưu Timeline Chính", "tbeSaveMain()", "#10b981", "#022c22") +
          btn("🌿 Tạo Nhánh Mới", "tbeCreateBranch()", "#8b5cf6", "#1a0a3a") +
        '</div>',
        "#10b98144"
      ) +
      sTitle("🌿 Các Nhánh (" + branches.length + ")") +
      (branches.length === 0
        ? '<div style="color:#6b7280;font-size:11px;text-align:center;padding:12px">Chưa có nhánh. Nhấn "Tạo Nhánh Mới".</div>'
        : branches.map(function(b) {
          return card(
            '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
              '<div style="flex:1">' +
                '<div style="color:#e5e7eb;font-weight:600;font-size:11px;margin-bottom:2px">🌿 ' + b.label + '</div>' +
                '<div style="color:#6b7280;font-size:10px;margin-bottom:3px">' + b.createdAt + ' · Năm ' + b.year + '</div>' +
                badge(b.snapshot.countriesCount + " QG", "#3b82f6") + badge((b.snapshot.emergentRaces||0) + " chủng tộc", "#8b5cf6") + badge((b.snapshot.aliveLangs||0) + " ngôn ngữ", "#10b981") +
              '</div>' +
              btn("📊", "tbeCompare('" + b.id + "')", "#a78bfa", "transparent", "margin-left:6px;padding:4px 8px;flex-shrink:0") +
            '</div>',
            "#1e1e3a"
          );
        }).join("")) +
      sTitle("🤖 Jarvis Notes (" + jarvis.length + ")") +
      (jarvis.length === 0
        ? '<div style="color:#6b7280;font-size:11px;text-align:center;padding:10px">Chưa có. Nhấn "Jarvis" ở tab Evolution.</div>'
        : jarvis.slice(0, 2).map(function(n) {
          return card(
            '<div style="color:#6b7280;font-size:9px;margin-bottom:4px">Năm ' + n.year + '</div>' +
            '<pre style="white-space:pre-wrap;font-size:9px;color:#d1d5db;font-family:monospace;line-height:1.4;margin:0">' + n.note + '</pre>',
            "#8b5cf644", "#050510"
          );
        }).join("")) +
    '</div>';
  }

  // ─── TAB: World Forecast ─────────────────────────────────────
  function renderForecast() {
    var forecasts = typeof window.ah76GetForecast === "function" ? window.ah76GetForecast() : (window.adaptiveHistoryV76Data ? window.adaptiveHistoryV76Data.worldForecast : []) || [];
    var chars = typeof window.ah76GetCharacters === "function" ? window.ah76GetCharacters() : (window.adaptiveHistoryV76Data ? window.adaptiveHistoryV76Data.emergentCharacters : []) || [];
    var chronicles = typeof window.ah76GetChronicles === "function" ? window.ah76GetChronicles() : (window.adaptiveHistoryV76Data ? window.adaptiveHistoryV76Data.chronicles : []) || [];
    return '<div style="padding:12px">' +
      card('<div style="font-size:18px;margin-bottom:4px">🔮 Dự Báo Tương Lai</div><div style="color:#9ca3af;font-size:11px">AI tự sinh tiên tri và nhân vật dựa trên trạng thái thế giới.</div>', "#a78bfa", "#0a0a1a") +
      btn("🔮 Tạo Tiên Tri Mới", "tbeGenForecast()", "#a78bfa", "#1a0a3a", "margin-bottom:10px;display:block") +
      sTitle("🔮 Tiên Tri (" + forecasts.length + ")", "#a78bfa") +
      (forecasts.length === 0
        ? '<div style="color:#6b7280;font-size:11px;text-align:center;padding:16px">Chưa có tiên tri. Chờ thế giới tiến hóa.</div>'
        : forecasts.slice(0, 5).map(function(f) {
          return card('<div style="color:#6b7280;font-size:9px;margin-bottom:3px">Năm ' + f.year + '</div><div style="color:#d1d5db;font-size:11px;line-height:1.5;font-style:italic">' + f.text + '</div>', "#a78bfa44");
        }).join("")) +
      sTitle("⚔️ Nhân Vật Tự Sinh (" + chars.length + ")", "#ef4444") +
      (chars.length === 0
        ? '<div style="color:#6b7280;font-size:11px;text-align:center;padding:12px">Chưa có nhân vật tự sinh.</div>'
        : chars.slice(0, 5).map(function(c) {
          return card(
            '<div style="display:flex;justify-content:space-between">' +
              '<div><div style="color:#ef4444;font-weight:600;font-size:11px">⚔️ ' + c.name + '</div>' +
              '<div style="color:#9ca3af;font-size:10px">' + c.role + ' · ' + c.title + ' · ' + c.origin + '</div>' +
              '<div style="color:#6b7280;font-size:9px">Năm ' + c.born + '</div></div>' +
              '<div style="color:#f59e0b;font-size:13px;font-weight:700">' + c.power + '</div>' +
            '</div>',
            "#ef444444"
          );
        }).join("")) +
      sTitle("📜 Biên Niên Sử (" + chronicles.length + ")", "#f59e0b") +
      (chronicles.length === 0
        ? '<div style="color:#6b7280;font-size:11px;text-align:center;padding:10px">Chưa có.</div>'
        : chronicles.slice(0, 5).map(function(c) {
          return card('<div style="color:#6b7280;font-size:9px;margin-bottom:2px">Năm ' + c.year + '</div><div style="color:#d1d5db;font-size:11px;line-height:1.5">' + c.text + '</div>', "#f59e0b33");
        }).join("")) +
    '</div>';
  }

  // ─── TAB: Emerging Civilizations ────────────────────────────
  function renderEmerging() {
    var evo  = window.universeEvoV76Data || {};
    var civ  = window.emergentCivV76Data || {};
    var langAlive = typeof window.lang76GetAlive === "function" ? window.lang76GetAlive() : [];
    var langDead  = typeof window.lang76GetDead === "function" ? window.lang76GetDead() : [];
    var civLog = civ.civEvolutions || [];
    return '<div style="padding:12px">' +
      sTitle("🏰 Quốc Gia Tự Sinh (" + (evo.emergentCountries||[]).length + ")", "#3b82f6") +
      ((evo.emergentCountries||[]).length === 0 ? '<div style="color:#6b7280;font-size:11px;text-align:center;padding:10px">Chưa có.</div>' :
        (evo.emergentCountries||[]).slice(0,6).map(function(c) {
          return card('<div style="display:flex;justify-content:space-between"><div><div style="color:#3b82f6;font-weight:600;font-size:11px">🏰 ' + c.name + '</div><div style="color:#9ca3af;font-size:10px">' + c.government + ' · Năm ' + c.year + '</div></div><div style="font-size:10px;color:#9ca3af;text-align:right">⚡' + (c.power||0) + '<br>🕊️' + (c.stability||0) + '</div></div>', "#3b82f644");
        }).join("")) +
      sTitle("🧬 Chủng Tộc Tự Sinh (" + (evo.emergentRaces||[]).length + ")", "#8b5cf6") +
      ((evo.emergentRaces||[]).length === 0 ? '<div style="color:#6b7280;font-size:11px;text-align:center;padding:10px">Chưa có.</div>' :
        (evo.emergentRaces||[]).slice(0,4).map(function(r) {
          return card('<div style="color:#8b5cf6;font-weight:600;font-size:11px">🧬 ' + r.name + '</div><div style="color:#9ca3af;font-size:10px">Đặc trưng: ' + r.trait + ' · Năm ' + r.year + '</div>', "#8b5cf644");
        }).join("")) +
      sTitle("📖 Ngôn Ngữ (" + langAlive.length + " sống / " + langDead.length + " đã mất)", "#10b981") +
      (langAlive.length === 0 ? '<div style="color:#6b7280;font-size:11px;text-align:center;padding:8px">Chưa có.</div>' :
        '<div style="max-height:120px;overflow-y:auto">' + langAlive.slice(0,8).map(function(l) {
          return card('<div style="display:flex;justify-content:space-between"><div style="color:#10b981;font-size:10px">📖 ' + l.name + (l.parentName ? ' <span style="color:#6b7280">(← ' + l.parentName + ')</span>' : '') + '</div><div style="color:#9ca3af;font-size:9px">👥' + ((l.speakers||0) > 999 ? Math.floor((l.speakers||0)/1000)+"K" : l.speakers||0) + '</div></div>', "#10b98133");
        }).join("") + '</div>') +
      sTitle("🏛️ Nhật Ký Văn Minh (" + civLog.length + ")", "#a78bfa") +
      (civLog.length === 0 ? '<div style="color:#6b7280;font-size:11px;text-align:center;padding:8px">Chưa có.</div>' :
        civLog.slice(0,6).map(function(e) {
          return card('<div style="color:#6b7280;font-size:9px">Năm ' + e.year + '</div><div style="color:#d1d5db;font-size:10px">' + e.msg + '</div>', "#1e1e3a");
        }).join("")) +
    '</div>';
  }

  // ─── Main Render ─────────────────────────────────────────────
  function renderSection() {
    var tab = state.activeTab;
    var content = "";
    if      (tab === "evo76")      content = renderEvolution();
    else if (tab === "timeline76") content = renderTimeline();
    else if (tab === "forecast76") content = renderForecast();
    else if (tab === "emerging76") content = renderEmerging();
    return '<div id="tbe76-section" style="background:#050510;border-top:2px solid #10b98144;height:100%;display:flex;flex-direction:column">' +
      '<div style="background:#0a0a1a;padding:7px 12px 0;border-bottom:1px solid #1e1e3a;flex-shrink:0">' +
        '<div style="font-size:9px;color:#6b7280;margin-bottom:4px;letter-spacing:1px">▼ AI UNIVERSE EVOLUTION V76</div>' +
        '<div style="display:flex;gap:2px;overflow-x:auto">' +
          EVO_TABS.map(function(t) {
            var active = tab === t.id;
            return '<button onclick="tbeSwitch(\'' + t.id + '\')" style="padding:4px 9px;border-radius:5px 5px 0 0;border:1px solid ' + (active ? "#10b981" : "#1e1e3a") + ';background:' + (active ? "#022c22" : "transparent") + ';color:' + (active ? "#10b981" : "#9ca3af") + ';cursor:pointer;font-size:10px;white-space:nowrap;flex-shrink:0">' + t.icon + ' ' + t.label + '</button>';
          }).join("") +
        '</div>' +
      '</div>' +
      '<div style="flex:1;overflow-y:auto">' + content + '</div>' +
    '</div>';
  }

  // ─── Public Functions ────────────────────────────────────────
  window.tbeSwitch       = function(id) { state.activeTab = id; refresh(); };
  window.tbeForce        = function() {
    if (typeof window.uevo76GenerateSurprise === "function") window.uevo76GenerateSurprise();
    if (typeof window.ah76GenerateChronicle === "function") window.ah76GenerateChronicle();
    if (typeof window.eciv76Invent === "function") window.eciv76Invent();
    refresh(); showToast("🌱 Tiến hóa thủ công kích hoạt!", "#10b981");
  };
  window.tbeToggle       = function() {
    if (!window.universeEvoV76Data) return;
    var cur = window.universeEvoV76Data.enabled !== false;
    if (typeof window.uevo76SetEnabled === "function") window.uevo76SetEnabled(!cur);
    refresh(); showToast(!cur ? "▶ Tiến hóa đã bật!" : "⏸ Tiến hóa đã tắt.", !cur ? "#10b981" : "#f59e0b");
  };
  window.tbeSpeed        = function(v) { if (typeof window.uevo76SetSpeed === "function") window.uevo76SetSpeed(v); refresh(); showToast("⚡ Tốc độ: " + v + "x", "#10b981"); };
  window.tbeJarvis       = function() { window.tb76JarvisAnalyze(); state.activeTab = "timeline76"; refresh(); showToast("🤖 Jarvis phân tích xong!", "#8b5cf6"); };
  window.tbeSaveMain     = function() { var r = window.tb76SaveMainTimeline(); refresh(); showToast(r.msg, "#10b981"); };
  window.tbeCreateBranch = function() {
    var label = prompt("Đặt tên nhánh timeline:") || ("Nhánh Năm " + getYear());
    var r = window.tb76CreateBranch(label); refresh(); showToast(r.msg, "#10b981");
  };
  window.tbeCompare      = function(id) {
    var r = window.tb76CompareBranches(id);
    if (!r.ok) { showToast("❌ " + r.msg, "#ef4444"); return; }
    var d = r.comparison.diff;
    alert("📊 So Sánh: " + r.comparison.branchLabel + "\n━━━━━━━━━━━━━━━\nQuốc gia: " + (d.countryDiff >= 0?"+":"") + d.countryDiff + "\nQG tự sinh: +" + d.emergentCountryDiff + "\nChủng tộc: +" + d.emergentRaceDiff + "\nNgôn ngữ: " + (d.langDiff >= 0?"+":"") + d.langDiff + "\nAnh hùng: +" + d.newHeroes + "\nPhát minh: +" + d.newInventions + "\nBiên niên: +" + d.newChronicles);
  };
  window.tbeGenForecast  = function() { if (typeof window.ah76GenerateForecast === "function") window.ah76GenerateForecast(); refresh(); showToast("🔮 Tiên tri mới!", "#a78bfa"); };

  // ─── Register refresh for uevo76 to call ────────────────────
  window.uevo76RenderRefresh = function() { refresh(); };

  function refresh() {
    var bot = document.getElementById("tbe76-bottom");
    if (bot) bot.innerHTML = renderSection();
  }

  function showToast(msg, color) {
    var b = document.createElement("div");
    b.style.cssText = "position:fixed;top:60px;right:20px;z-index:9999;background:#0a0a1a;border:1px solid " + (color||"#10b981") + ";border-radius:8px;padding:10px 14px;color:" + (color||"#10b981") + ";font-size:11px;font-weight:600;max-width:280px;box-shadow:0 4px 20px rgba(0,0,0,0.6)";
    b.textContent = msg;
    document.body.appendChild(b);
    setTimeout(function() { if (b.parentNode) b.parentNode.removeChild(b); }, 3500);
  }

  // ─── Inject into creator-hub-v32 ────────────────────────────
  window.tbe76RenderSection = function() {
    var panel = document.getElementById("panel-creator-hub-v32");
    if (!panel) return;
    if (document.getElementById("tbe76-wrapper")) { refresh(); return; }
    var wrapper = document.createElement("div");
    wrapper.id = "tbe76-wrapper";
    wrapper.style.cssText = "height:100%;display:flex;flex-direction:column;overflow:hidden";
    var topDiv = document.createElement("div");
    topDiv.id = "tbe76-top";
    topDiv.style.cssText = "flex:1;overflow-y:auto;min-height:0";
    topDiv.innerHTML = panel.innerHTML;
    panel.innerHTML = "";
    var botDiv = document.createElement("div");
    botDiv.id = "tbe76-bottom";
    botDiv.style.cssText = "height:320px;flex-shrink:0;overflow:hidden";
    botDiv.innerHTML = renderSection();
    wrapper.appendChild(topDiv);
    wrapper.appendChild(botDiv);
    panel.appendChild(wrapper);
  };

  function hookHub() {
    if (typeof window.hubRenderPanel !== "function") return false;
    if (window._tbe76Hooked) return true;
    var _orig = window.hubRenderPanel;
    window.hubRenderPanel = function(panelId) {
      if (typeof _orig === "function") _orig(panelId);
      if (panelId === "creator-hub-v32") setTimeout(function() { window.tbe76RenderSection(); }, 100);
    };
    window._tbe76Hooked = true;
    return true;
  }

  function tryHook(n) { if (hookHub()) return; if (n <= 0) return; setTimeout(function() { tryHook(n-1); }, 500); }

  function init() {
    load();
    tryHook(20);
    console.log("[TimelineBranchEngineV76] 🌿 Timeline Nhánh V76 khởi động — " + window.timelineBranchV76Data.branches.length + " nhánh · 4 tabs (Evolution/Timeline/Forecast/Emerging) · inject creator-hub-v32 sẵn sàng. [RIÊNG BIỆT với V36]");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 19200); });
  } else { setTimeout(init, 19200); }
})();
