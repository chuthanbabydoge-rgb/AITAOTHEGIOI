(function() {
  "use strict";
  var SAVE_KEY = "cgv6_multiverse_timeline_v80";

  var currentTab = "multiverse";
  var selectedWorld = null;
  var xrMode = false;

  /* ── State ───────────────────────────────────────── */
  window.mvTimelineV80Data = {
    worldRegistry: [],
    migrations: [],
    portalSessions: [],
    lastSaveYear: 0
  };

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        worldRegistry: window.mvTimelineV80Data.worldRegistry.slice(-20),
        migrations: window.mvTimelineV80Data.migrations.slice(-15),
        portalSessions: window.mvTimelineV80Data.portalSessions.slice(-8),
        lastSaveYear: window.mvTimelineV80Data.lastSaveYear
      }));
    } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.mvTimelineV80Data = JSON.parse(d);
    } catch(e) {}
  }

  /* ── Migration System ───────────────────────────── */
  window.mvt80RecordMigration = function(fromWorld, toWorld, what, migrationType) {
    var data = window.mvTimelineV80Data;
    var types = { race: "🧬 Chủng Tộc", religion: "⛪ Tôn Giáo", technology: "⚙️ Công Nghệ", hero: "🦸 Anh Hùng" };
    var migration = {
      year: window.year || 1,
      from: fromWorld, to: toWorld,
      what: what,
      type: migrationType || "race",
      typeLabel: types[migrationType] || types.race
    };
    data.migrations.push(migration);
    if (data.migrations.length > 15) data.migrations.shift();
    save();
    return migration;
  };

  /* ── XR Portal System ───────────────────────────── */
  window.mvt80EnterPortal = function(destWorld) {
    var data = window.mvTimelineV80Data;
    var session = { year: window.year || 1, destination: destWorld, entered: true, observations: [] };
    data.portalSessions.push(session);
    if (data.portalSessions.length > 8) data.portalSessions.shift();
    xrMode = true;
    selectedWorld = destWorld;
    save();
    if (typeof window.mvt80RenderPanel === "function") window.mvt80RenderPanel();
    return session;
  };

  window.mvt80ExitPortal = function() {
    xrMode = false;
    if (typeof window.mvt80RenderPanel === "function") window.mvt80RenderPanel();
  };

  /* ── Tab Switcher ────────────────────────────────── */
  window.mvt80ShowTab = function(tab) {
    currentTab = tab;
    ["multiverse", "timeline", "clusters", "influence", "migration"].forEach(function(t) {
      var el = document.getElementById("mvt80-tab-" + t);
      var btn = document.getElementById("mvt80-btn-" + t);
      if (el) el.style.display = (t === tab) ? "block" : "none";
      if (btn) btn.classList.toggle("mvt80-active", t === tab);
    });
    var renders = { multiverse: renderMultiverse, timeline: renderTimeline, clusters: renderClusters, influence: renderInfluence, migration: renderMigration };
    if (renders[tab]) renders[tab]();
  };

  window.mvt80SelectWorld = function(name) {
    selectedWorld = name;
    mvt80ShowTab("timeline");
  };

  /* ── Inject into Universe Hub (V73) ─────────────── */
  window.mvt80RenderPanel = function() {
    var panel = document.getElementById("panel-universe-hub-v73");
    if (!panel) {
      // Fallback to creator hub
      panel = document.getElementById("panel-creator-hub-v32");
    }
    if (!panel) return;

    if (document.getElementById("mvt80-section-wrapper")) {
      var renders2 = { multiverse: renderMultiverse, timeline: renderTimeline, clusters: renderClusters, influence: renderInfluence, migration: renderMigration };
      if (renders2[currentTab]) renders2[currentTab]();
      return;
    }

    var wrapper = document.createElement("div");
    wrapper.id = "mvt80-section-wrapper";
    wrapper.style.cssText = "margin-top:18px;border-top:2px solid #1abc9c;padding-top:12px;";
    wrapper.innerHTML = [
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">',
      '  <span style="font-size:1.3em;">🌌</span>',
      '  <span style="color:#1abc9c;font-weight:bold;font-size:1.05em;letter-spacing:1px;">V80 — MULTIVERSE EVOLUTION PASS</span>',
      '  <span style="color:#888;font-size:0.78em;">Đa Vũ Trụ Sống</span>',
      '</div>',
      '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px;">',
      '  <button id="mvt80-btn-multiverse" onclick="mvt80ShowTab(\'multiverse\')" class="mvt80-active" style="padding:5px 10px;border:1px solid #1abc9c;border-radius:4px;cursor:pointer;background:#1a1a2e;color:#1abc9c;font-size:0.82em;">🌌 Đa Vũ Trụ</button>',
      '  <button id="mvt80-btn-timeline"   onclick="mvt80ShowTab(\'timeline\')"   style="padding:5px 10px;border:1px solid #555;border-radius:4px;cursor:pointer;background:#1a1a2e;color:#aaa;font-size:0.82em;">⏳ Timeline</button>',
      '  <button id="mvt80-btn-clusters"   onclick="mvt80ShowTab(\'clusters\')"   style="padding:5px 10px;border:1px solid #555;border-radius:4px;cursor:pointer;background:#1a1a2e;color:#aaa;font-size:0.82em;">🔭 Cụm Vũ Trụ</button>',
      '  <button id="mvt80-btn-influence"  onclick="mvt80ShowTab(\'influence\')"  style="padding:5px 10px;border:1px solid #555;border-radius:4px;cursor:pointer;background:#1a1a2e;color:#aaa;font-size:0.82em;">🔀 Mạng Ảnh Hưởng</button>',
      '  <button id="mvt80-btn-migration"  onclick="mvt80ShowTab(\'migration\')"  style="padding:5px 10px;border:1px solid #555;border-radius:4px;cursor:pointer;background:#1a1a2e;color:#aaa;font-size:0.82em;">🚶 Di Cư</button>',
      '</div>',
      '<div id="mvt80-tab-multiverse">' + buildMultiverseHTML() + '</div>',
      '<div id="mvt80-tab-timeline"   style="display:none;"></div>',
      '<div id="mvt80-tab-clusters"   style="display:none;"></div>',
      '<div id="mvt80-tab-influence"  style="display:none;"></div>',
      '<div id="mvt80-tab-migration"  style="display:none;"></div>'
    ].join("");
    panel.appendChild(wrapper);

    var style = document.createElement("style");
    style.textContent = [
      "#mvt80-section-wrapper .mvt80-active{background:#1abc9c!important;color:#000!important;border-color:#1abc9c!important;}",
      ".mvt80-world-card{background:#0a1020;border:1px solid #1abc9c;border-radius:6px;padding:10px;margin-bottom:8px;cursor:pointer;transition:border-color 0.2s;}",
      ".mvt80-world-card:hover{border-color:#2ecc71;}",
      ".mvt80-event-card{background:#0d1a0d;border-left:3px solid #2ecc71;padding:8px;margin-bottom:6px;border-radius:0 4px 4px 0;}",
      ".mvt80-cluster-card{background:#1a1a0a;border:1px solid #f39c12;border-radius:5px;padding:9px;margin-bottom:7px;}",
      ".mvt80-inf-card{background:#0a0d1a;border:1px solid #3498db;border-radius:5px;padding:7px;margin-bottom:5px;}",
      ".mvt80-mig-card{background:#1a0a0a;border:1px solid #e74c3c;border-radius:5px;padding:7px;margin-bottom:5px;}",
      ".mvt80-xr-bar{background:linear-gradient(90deg,#0a2a1a,#1a4a2a);border:2px solid #2ecc71;border-radius:8px;padding:12px;margin-bottom:12px;}"
    ].join("");
    document.head.appendChild(style);
  };

  /* ── Tab 1: Đa Vũ Trụ ──────────────────────────── */
  function buildMultiverseHTML() {
    var worlds = typeof window.mevo80GetAll === "function" ? window.mevo80GetAll() : [];
    var stats = typeof window.mevo80GetStats === "function" ? window.mevo80GetStats() : {};
    var era = typeof window.mhist80GetCurrentEra === "function" ? window.mhist80GetCurrentEra() : { icon: "✨", label: "Sáng Thế" };
    var types = typeof window.MEVO80_TYPES !== "undefined" ? window.MEVO80_TYPES : [];

    var html = [
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">',
      '  <button onclick="(function(){var n=\'Thế Giới \'+( (typeof window.mevo80GetAll===\'function\'?window.mevo80GetAll():[]).length+1);var ts=typeof window.MEVO80_TYPES!==\'undefined\'?window.MEVO80_TYPES:[];if(ts.length){window.mevo80RegisterWorld(n,ts[Math.floor(Math.random()*ts.length)].id);mvt80ShowTab(\'multiverse\')}})()" style="padding:5px 12px;background:#1abc9c;color:#000;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;font-weight:bold;">🌌 Tạo Thế Giới</button>',
      '  <button onclick="(function(){if(typeof window.world!==\'undefined\'&&window.world&&window.world.name&&typeof window.mevo80RegisterWorld===\'function\'){window.mevo80RegisterWorld(window.world.name);mvt80ShowTab(\'multiverse\')}})()" style="padding:5px 10px;background:#27ae60;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;">➕ Thêm World Hiện Tại</button>',
      '  <button onclick="(function(){var es=typeof window.MHIST80_ERAS!==\'undefined\'?window.MHIST80_ERAS:[];if(es.length&&typeof window.mhist80TransitionEra===\'function\'){window.mhist80TransitionEra(es[Math.floor(Math.random()*es.length)].id);mvt80ShowTab(\'multiverse\')}})()" style="padding:5px 10px;background:#9b59b6;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;">⏳ Chuyển Kỷ Nguyên</button>',
      '</div>',
      '<div style="background:#0a1a1a;border:1px solid #1abc9c;border-radius:6px;padding:8px;margin-bottom:10px;display:flex;flex-wrap:wrap;gap:12px;">',
      '  <span style="color:#1abc9c;font-size:0.85em;font-weight:bold;">' + era.icon + ' ' + era.label + '</span>',
      '  <span style="color:#888;font-size:0.8em;">🌌 Tổng thế giới: <b style="color:#e8f8f5;">' + (stats.total || 0) + '</b></span>',
      '  <span style="color:#888;font-size:0.8em;">⚡ Sống: <b style="color:#2ecc71;">' + (stats.alive || 0) + '</b></span>',
      '  <span style="color:#888;font-size:0.8em;">👑 Thống trị: <b style="color:#f1c40f;">' + (stats.dominantWorld || "—") + '</b></span>',
      '  <span style="color:#888;font-size:0.8em;">🔀 Ảnh hưởng: <b style="color:#3498db;">' + (stats.totalInfluenceExchanges || 0) + '</b></span>',
      '</div>'
    ];

    if (types.length > 0) {
      html.push('<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">');
      types.forEach(function(t) { html.push('<span style="display:inline-block;padding:2px 7px;border-radius:10px;font-size:0.72em;border:1px solid #444;color:#ccc;">' + t.icon + ' ' + t.label + '</span>'); });
      html.push('</div>');
    }

    if (worlds.length === 0) {
      html.push('<div style="color:#888;text-align:center;padding:20px;">Chưa có thế giới nào trong đa vũ trụ. Bấm "Tạo Thế Giới" hoặc "Thêm World Hiện Tại".</div>');
    } else {
      worlds.slice(-12).reverse().forEach(function(w) {
        var stageColor = w.stage === "transcendent" ? "#f1c40f" : w.stage === "dominant" ? "#2ecc71" : w.stage === "declining" ? "#e74c3c" : "#aaa";
        html.push(
          '<div class="mvt80-world-card" onclick="mvt80SelectWorld(\'' + w.name.replace(/'/g, "\\'") + '\')">',
          '  <div style="display:flex;justify-content:space-between;align-items:center;">',
          '    <span style="color:#1abc9c;font-weight:bold;font-size:0.9em;">' + w.typeIcon + ' ' + w.name + '</span>',
          '    <span style="color:' + stageColor + ';font-size:0.75em;">' + w.stageIcon + ' ' + w.stageLabel + '</span>',
          '  </div>',
          '  <div style="color:#888;font-size:0.78em;margin-top:3px;">' + w.typeLabel + ' · Score: <b style="color:#e8f8f5;">' + w.evolutionScore + '</b> · Tuổi: ' + w.age + ' · Kết nối: ' + (w.connections ? w.connections.length : 0) + '</div>',
          '  <button onclick="event.stopPropagation();mvt80EnterPortal(\'' + w.name.replace(/'/g, "\\'") + '\')" style="margin-top:5px;padding:2px 8px;background:#2c3e50;color:#1abc9c;border:1px solid #1abc9c;border-radius:3px;cursor:pointer;font-size:0.75em;">🌀 Bước Qua Portal</button>',
          '  <button onclick="event.stopPropagation();(function(){var dest=\'' + w.name.replace(/'/g, "\\'") + '\';var all=typeof window.mevo80GetAll===\'function\'?window.mevo80GetAll():[];var other=all.filter(function(x){return x.name!==dest;});if(other.length>0){var s=other[Math.floor(Math.random()*other.length)];if(typeof window.cwi80SendInfluence===\'function\'){var ts=typeof window.CWI80_TYPES!==\'undefined\'?window.CWI80_TYPES:[];if(ts.length)window.cwi80SendInfluence(dest,s.name,ts[Math.floor(Math.random()*ts.length)].id,\'current\');}}mvt80ShowTab(\'influence\')})()" style="margin-top:5px;margin-left:4px;padding:2px 8px;background:#2c3e50;color:#3498db;border:1px solid #3498db;border-radius:3px;cursor:pointer;font-size:0.75em;">🔀 Gửi Ảnh Hưởng</button>',
          '</div>'
        );
      });
    }

    if (xrMode && selectedWorld) {
      html.push(
        '<div class="mvt80-xr-bar">',
        '  <div style="color:#2ecc71;font-weight:bold;margin-bottom:6px;">🌀 XR MODE — Đang quan sát: ' + selectedWorld + '</div>',
        '  <div style="color:#aaa;font-size:0.82em;">Creator đang đứng trong thế giới này. Bạn có thể theo dõi ảnh hưởng và lịch sử real-time.</div>',
        '  <button onclick="mvt80ExitPortal()" style="margin-top:6px;padding:4px 12px;background:#c0392b;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;">🚪 Rời Portal</button>',
        '</div>'
      );
    }
    return html.join("");
  }

  function renderMultiverse() { var el = document.getElementById("mvt80-tab-multiverse"); if (el) el.innerHTML = buildMultiverseHTML(); }

  /* ── Tab 2: Timeline ─────────────────────────────── */
  function renderTimeline() {
    var el = document.getElementById("mvt80-tab-timeline");
    if (!el) return;
    var events = typeof window.mhist80GetEvents === "function" ? window.mhist80GetEvents(15) : [];
    var empires = typeof window.mhist80GetEmpires === "function" ? window.mhist80GetEmpires() : [];
    var legends = typeof window.mhist80GetLegends === "function" ? window.mhist80GetLegends() : [];
    var stats = typeof window.mhist80GetStats === "function" ? window.mhist80GetStats() : {};
    var era = typeof window.mhist80GetCurrentEra === "function" ? window.mhist80GetCurrentEra() : { icon: "✨", label: "Sáng Thế" };

    var html = [
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">',
      '  <button onclick="(function(){var all=typeof window.mevo80GetAll===\'function\'?window.mevo80GetAll():[];if(all.length>=2){var a=all[0];var b=all[1];if(typeof window.mhist80FormCrossWorldEmpire===\'function\')window.mhist80FormCrossWorldEmpire(a.name,[a.name,b.name]);mvt80ShowTab(\'timeline\')}})()" style="padding:5px 10px;background:#9b59b6;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;">👑 Thành Lập Đế Quốc</button>',
      '  <button onclick="(function(){var all=typeof window.mevo80GetAll===\'function\'?window.mevo80GetAll():[];if(all.length>=2){var a=all[Math.floor(Math.random()*all.length)];var b=all[Math.floor(Math.random()*all.length)];if(a.name!==b.name&&typeof window.mhist80RecordLegend===\'function\'){var heroes=[\'Thần Kiếm Vô Song\',\'Đại Chiến Thần\',\'Huyền Sứ\',\'Thiên Tài Triết Nhân\'];window.mhist80RecordLegend(heroes[Math.floor(Math.random()*heroes.length)],a.name,b.name);mvt80ShowTab(\'timeline\')}}})()" style="padding:5px 10px;background:#f1c40f;color:#000;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;">🦸 Anh Hùng Vượt Chiều</button>',
      '  <span style="color:#888;font-size:0.78em;">' + era.icon + ' ' + era.label + ' · Sự kiện: ' + (stats.totalEvents || 0) + ' · Đế quốc: ' + (stats.empires || 0) + ' · Huyền thoại: ' + (stats.legends || 0) + '</span>',
      '</div>'
    ];

    if (empires.length > 0) {
      html.push('<div style="color:#9b59b6;font-size:0.85em;font-weight:bold;margin-bottom:6px;">👑 Đế Quốc Liên Thế Giới</div>');
      empires.slice(0, 4).forEach(function(e) {
        html.push('<div style="background:#1a0a1a;border:1px solid #9b59b6;border-radius:5px;padding:8px;margin-bottom:6px;font-size:0.82em;"><b style="color:#bb8fce;">' + e.name + '</b><div style="color:#aaa;margin-top:3px;">Lãnh đạo: ' + e.leader + ' · Thành viên: ' + e.members.join(", ") + ' · Sức mạnh: ' + e.power + '</div></div>');
      });
    }

    if (legends.length > 0) {
      html.push('<div style="color:#f1c40f;font-size:0.85em;font-weight:bold;margin:8px 0 6px;">🦸 Anh Hùng Xuyên Chiều</div>');
      legends.slice(0, 4).forEach(function(l) {
        html.push('<div style="background:#1a1a0a;border:1px solid #f1c40f;border-radius:5px;padding:7px;margin-bottom:5px;font-size:0.82em;"><span style="color:#f1c40f;font-weight:bold;">🦸 ' + l.heroName + '</span> <span style="color:#aaa;">' + l.homeWorld + '</span> → <span style="color:#e8f8f5;">' + l.crossedTo + '</span> <span style="color:#888;float:right;">Năm ' + l.year + '</span></div>');
      });
    }

    if (events.length > 0) {
      html.push('<div style="color:#2ecc71;font-size:0.85em;font-weight:bold;margin:8px 0 6px;">⏳ Sự Kiện Đa Vũ Trụ Gần Đây</div>');
      events.slice(0, 8).forEach(function(e) {
        html.push('<div class="mvt80-event-card"><span style="color:#2ecc71;font-size:0.82em;">' + e.typeIcon + ' ' + e.title + '</span><span style="color:#666;font-size:0.73em;float:right;">Năm ' + e.year + ' · ' + e.era + '</span></div>');
      });
    }

    if (events.length === 0 && empires.length === 0) {
      html.push('<div style="color:#888;text-align:center;padding:20px;">Chưa có lịch sử đa vũ trụ. Bấm "Thành Lập Đế Quốc" hoặc "Anh Hùng Vượt Chiều".</div>');
    }
    el.innerHTML = html.join("");
  }

  /* ── Tab 3: Cụm Vũ Trụ ──────────────────────────── */
  function renderClusters() {
    var el = document.getElementById("mvt80-tab-clusters");
    if (!el) return;
    var clusters = typeof window.uclu80GetAllClusters === "function" ? window.uclu80GetAllClusters() : [];
    var stats = typeof window.uclu80GetStats === "function" ? window.uclu80GetStats() : {};
    var types = typeof window.UCLU80_TYPES !== "undefined" ? window.UCLU80_TYPES : [];

    var html = [
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">',
      '  <button onclick="(function(){var ts=typeof window.UCLU80_TYPES!==\'undefined\'?window.UCLU80_TYPES:[];if(!ts.length)return;var worlds=typeof window.mevo80GetAll===\'function\'?window.mevo80GetAll():[];var t=ts[Math.floor(Math.random()*ts.length)];var leader=worlds.length>0?worlds[Math.floor(Math.random()*worlds.length)].name:null;if(typeof window.uclu80CreateCluster===\'function\'){var c=window.uclu80CreateCluster(t.id,leader);if(worlds.length>1&&c){var m=worlds.filter(function(w){return w.name!==leader;});if(m.length>0)window.uclu80AddMember(c.id,m[0].name);}}mvt80ShowTab(\'clusters\')})()" style="padding:5px 12px;background:#f39c12;color:#000;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;">🔭 Hình Thành Cụm</button>',
      '  <span style="color:#888;font-size:0.8em;">Tổng cụm: ' + (stats.total || 0) + ' · Đang hoạt động: ' + (stats.active || 0) + '</span>',
      '</div>',
      '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">',
    ];
    types.forEach(function(t) { html.push('<span style="display:inline-block;padding:2px 7px;border-radius:10px;font-size:0.72em;border:1px solid ' + t.color + ';color:' + t.color + ';">' + t.icon + ' ' + t.label + '</span>'); });
    html.push('</div>');

    if (clusters.length === 0) {
      html.push('<div style="color:#888;text-align:center;padding:20px;">Chưa có cụm vũ trụ nào. Bấm "Hình Thành Cụm" hoặc chờ auto-scan (300 năm).</div>');
    } else {
      clusters.forEach(function(c) {
        html.push(
          '<div class="mvt80-cluster-card" style="border-color:' + c.typeColor + ';">',
          '  <div style="display:flex;justify-content:space-between;align-items:center;">',
          '    <span style="color:' + c.typeColor + ';font-weight:bold;font-size:0.9em;">' + c.typeIcon + ' ' + c.name + '</span>',
          '    <span style="color:#888;font-size:0.75em;">Sức mạnh: ' + c.power + ' · Tuổi: ' + c.age + '</span>',
          '  </div>',
          '  <div style="color:#aaa;font-size:0.78em;margin-top:4px;">' + c.typeDesc + '</div>',
          '  <div style="color:#ccc;font-size:0.78em;margin-top:4px;">Lãnh đạo: <b>' + (c.leader || "—") + '</b> · Thành viên: <span style="color:#aaa;">' + (c.members.length > 0 ? c.members.join(", ") : "Chưa có") + '</span></div>',
          '  <div style="color:#888;font-size:0.75em;margin-top:2px;">Thành lập: Năm ' + c.foundedYear + '</div>',
          '</div>'
        );
      });
    }
    el.innerHTML = html.join("");
  }

  /* ── Tab 4: Mạng Ảnh Hưởng ──────────────────────── */
  function renderInfluence() {
    var el = document.getElementById("mvt80-tab-influence");
    if (!el) return;
    var infs = typeof window.cwi80GetInfluences === "function" ? window.cwi80GetInfluences() : [];
    var network = typeof window.cwi80GetInfluenceNetwork === "function" ? window.cwi80GetInfluenceNetwork() : [];
    var dominant = typeof window.cwi80GetDominantInfluencer === "function" ? window.cwi80GetDominantInfluencer() : null;
    var stats = typeof window.cwi80GetStats === "function" ? window.cwi80GetStats() : {};
    var infTypes = typeof window.CWI80_TYPES !== "undefined" ? window.CWI80_TYPES : [];

    var html = [
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">',
      '  <button onclick="(function(){var all=typeof window.mevo80GetAll===\'function\'?window.mevo80GetAll():[];if(all.length<2)return;var a=all[Math.floor(Math.random()*all.length)];var b=all[Math.floor(Math.random()*all.length)];if(a.name===b.name)return;var ts=typeof window.CWI80_TYPES!==\'undefined\'?window.CWI80_TYPES:[];var ss=typeof window.CWI80_STRENGTHS!==\'undefined\'?window.CWI80_STRENGTHS:[];if(ts.length&&ss.length&&typeof window.cwi80SendInfluence===\'function\'){window.cwi80SendInfluence(a.name,b.name,ts[Math.floor(Math.random()*ts.length)].id,ss[Math.floor(Math.random()*3)].id);}mvt80ShowTab(\'influence\')})()" style="padding:5px 12px;background:#3498db;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;">🔀 Gửi Ảnh Hưởng</button>',
      '  <span style="color:#888;font-size:0.8em;">Tổng: ' + (stats.total || 0) + ' · Mạng: ' + (stats.networkSize || 0) + ' thế giới</span>',
      (dominant ? '<span style="color:#f1c40f;font-size:0.8em;">👑 Thống trị: ' + dominant.name + ' (' + dominant.score + 'pts)</span>' : ''),
      '</div>'
    ];

    html.push('<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">');
    infTypes.forEach(function(t) { html.push('<span style="display:inline-block;padding:2px 7px;border-radius:10px;font-size:0.72em;border:1px solid ' + t.color + ';color:' + t.color + ';">' + t.icon + ' ' + t.label + '</span>'); });
    html.push('</div>');

    if (network.length > 0) {
      html.push('<div style="color:#3498db;font-size:0.85em;font-weight:bold;margin-bottom:6px;">📡 Thế Giới Ảnh Hưởng Nhất</div>');
      network.slice(0, 5).forEach(function(n) {
        html.push('<div style="background:#0a1020;border:1px solid #2c3e50;border-radius:4px;padding:6px;margin-bottom:4px;font-size:0.8em;display:flex;justify-content:space-between;align-items:center;">',
          '<span style="color:#85c1e9;">' + n.world + '</span>',
          '<span style="color:#888;">Gửi: <b style="color:#2ecc71;">' + n.stats.sent + '</b> · Nhận: <b style="color:#e74c3c;">' + n.stats.received + '</b> · Điểm: <b style="color:#f1c40f;">' + n.stats.dominanceScore + '</b></span>',
          '</div>');
      });
    }

    if (infs.length > 0) {
      html.push('<div style="color:#2ecc71;font-size:0.85em;font-weight:bold;margin:8px 0 6px;">🔀 Ảnh Hưởng Gần Đây</div>');
      infs.slice(0, 8).forEach(function(i) {
        html.push('<div class="mvt80-inf-card" style="border-color:' + i.typeColor + ';">',
          '<span style="color:' + i.typeColor + ';font-size:0.82em;">' + i.typeIcon + ' <b>' + i.from + '</b> → ' + i.to + '</span>',
          '<span style="color:#888;font-size:0.73em;float:right;">' + i.strengthLabel + ' · Năm ' + i.year + '</span>',
          '<div style="color:#aaa;font-size:0.75em;margin-top:2px;">' + i.content + '</div>',
          '</div>');
      });
    }

    if (infs.length === 0 && network.length === 0) {
      html.push('<div style="color:#888;text-align:center;padding:20px;">Chưa có ảnh hưởng nào. Bấm "Gửi Ảnh Hưởng" hoặc kết nối các thế giới.</div>');
    }
    el.innerHTML = html.join("");
  }

  /* ── Tab 5: Di Cư ───────────────────────────────── */
  function renderMigration() {
    var el = document.getElementById("mvt80-tab-migration");
    if (!el) return;
    var migrations = window.mvTimelineV80Data.migrations.slice().reverse();
    var sessions = window.mvTimelineV80Data.portalSessions.slice().reverse();

    var html = [
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">',
      '  <button onclick="(function(){var all=typeof window.mevo80GetAll===\'function\'?window.mevo80GetAll():[];if(all.length<2)return;var a=all[Math.floor(Math.random()*all.length)];var b=all[Math.floor(Math.random()*all.length)];if(a.name===b.name)return;var types=[\'race\',\'religion\',\'technology\',\'hero\'];var what=[\'Chủng tộc Elves\',\'Tôn giáo Ánh Sáng\',\'Kỹ thuật luyện thép\',\'Anh hùng huyền thoại\'];var idx=Math.floor(Math.random()*4);if(typeof window.mvt80RecordMigration===\'function\')window.mvt80RecordMigration(a.name,b.name,what[idx],types[idx]);mvt80ShowTab(\'migration\')})()" style="padding:5px 12px;background:#e74c3c;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;">🚶 Ghi Di Cư</button>',
      '  <span style="color:#888;font-size:0.8em;">Đã ghi: ' + migrations.length + ' đợt di cư · Portal: ' + sessions.length + ' lần</span>',
      '</div>'
    ];

    var migTypes = [
      { id: "race", label: "🧬 Chủng Tộc", color: "#e74c3c" },
      { id: "religion", label: "⛪ Tôn Giáo", color: "#9b59b6" },
      { id: "technology", label: "⚙️ Công Nghệ", color: "#3498db" },
      { id: "hero", label: "🦸 Anh Hùng", color: "#f1c40f" }
    ];
    html.push('<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">');
    migTypes.forEach(function(t) { html.push('<span style="display:inline-block;padding:2px 7px;border-radius:10px;font-size:0.72em;border:1px solid ' + t.color + ';color:' + t.color + ';">' + t.label + '</span>'); });
    html.push('</div>');

    if (sessions.length > 0) {
      html.push('<div style="color:#1abc9c;font-size:0.85em;font-weight:bold;margin-bottom:6px;">🌀 Phiên Portal</div>');
      sessions.slice(0, 4).forEach(function(s) {
        html.push('<div style="background:#0a1a1a;border:1px solid #1abc9c;border-radius:5px;padding:7px;margin-bottom:5px;font-size:0.82em;">🌀 Creator đến <b style="color:#1abc9c;">' + s.destination + '</b> <span style="color:#888;float:right;">Năm ' + s.year + '</span></div>');
      });
    }

    if (migrations.length > 0) {
      html.push('<div style="color:#e74c3c;font-size:0.85em;font-weight:bold;margin:8px 0 6px;">🚶 Di Cư Xuyên Thế Giới</div>');
      migrations.slice(0, 8).forEach(function(m) {
        html.push('<div class="mvt80-mig-card">',
          '<span style="color:#e8a0a0;font-size:0.82em;">' + m.typeLabel + ': <b>' + m.what + '</b></span>',
          '<span style="color:#888;font-size:0.73em;float:right;">Năm ' + m.year + '</span>',
          '<div style="color:#aaa;font-size:0.75em;margin-top:2px;">' + m.from + ' → ' + m.to + '</div>',
          '</div>');
      });
    }

    if (migrations.length === 0 && sessions.length === 0) {
      html.push('<div style="color:#888;text-align:center;padding:20px;">Chưa có di cư hay portal. Bấm "Ghi Di Cư" hoặc bước qua portal từ tab Đa Vũ Trụ.</div>');
    }
    el.innerHTML = html.join("");
  }

  /* ── Init ────────────────────────────────────────── */
  function init() {
    load();
    // Hook Universe Hub V73
    var _origUHub = window.uhubV73Render;
    if (typeof _origUHub === "function") {
      window.uhubV73Render = function() {
        _origUHub();
        setTimeout(window.mvt80RenderPanel, 300);
      };
    }
    // Also hook hubRenderPanel (fallback)
    var _origHub = window.hubRenderPanel;
    window.hubRenderPanel = function(panelId) {
      if (_origHub) _origHub(panelId);
      if (panelId === "universe-hub-v73" || panelId === "creator-hub-v32") {
        setTimeout(window.mvt80RenderPanel, 400);
      }
    };
    console.log("[MultiverseTimelineV80] 🌌 Dòng Thời Gian Đa Vũ Trụ khởi động — 5 tabs (Đa VT/Timeline/Cụm/Ảnh Hưởng/Di Cư) · XR Portal · inject Universe Hub + Creator Hub sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 21500); });
  } else {
    setTimeout(init, 21500);
  }
})();
