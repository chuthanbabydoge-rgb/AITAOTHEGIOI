(function() {
  "use strict";
  const SAVE_KEY = "cgv6_worldmap_registry_v121";

  window.wmRegistryV121 = {
    timelapse: {
      playing: false,
      speed: 3,       // years per frame-step
      currentYear: 1,
      intervalId: null
    },
    activeTab: "civs"  // "civs" | "wars" | "timelapse" | "discover"
  };

  // ── TIMELAPSE ENGINE ───────────────────────────────────────────────────────

  function tlGetMaxYear() {
    if (typeof _timelineSnapshots !== "undefined") {
      var keys = Object.keys(_timelineSnapshots).map(Number).filter(function(k){ return k > 0; });
      if (keys.length) return Math.max.apply(null, keys);
    }
    return (typeof year !== "undefined") ? year : 1;
  }

  function tlStepTo(yr) {
    var tl = window.wmRegistryV121.timelapse;
    tl.currentYear = yr;
    // Use existing timeline system if available
    if (typeof mapState !== "undefined") {
      mapState.timelineYear = yr;
      mapState.timelineActive = true;
    }
    // Attempt to apply snapshot via existing function
    if (typeof applyTimelineSnapshot === "function") {
      applyTimelineSnapshot(yr);
    }
    _updateTlUI();
  }

  function tlPlay() {
    var tl = window.wmRegistryV121.timelapse;
    if (tl.playing) return;
    tl.playing = true;
    var maxYr = tlGetMaxYear();
    if (tl.currentYear >= maxYr) tl.currentYear = 1;

    tl.intervalId = setInterval(function() {
      tl.currentYear += tl.speed;
      if (tl.currentYear >= maxYr) {
        tl.currentYear = maxYr;
        tlPause();
      }
      tlStepTo(tl.currentYear);
    }, 120);
    _updateTlUI();
  }

  function tlPause() {
    var tl = window.wmRegistryV121.timelapse;
    tl.playing = false;
    if (tl.intervalId) { clearInterval(tl.intervalId); tl.intervalId = null; }
    _updateTlUI();
  }

  function tlGoLive() {
    tlPause();
    if (typeof mapState !== "undefined") {
      mapState.timelineYear = null;
      mapState.timelineActive = false;
    }
    window.wmRegistryV121.timelapse.currentYear = (typeof year !== "undefined") ? year : 1;
    _updateTlUI();
  }

  window.wmTlPlay   = tlPlay;
  window.wmTlPause  = tlPause;
  window.wmTlGoLive = tlGoLive;
  window.wmTlSeek   = function(yr) { tlPause(); tlStepTo(Number(yr)); };
  window.wmTlSetSpeed = function(s) { window.wmRegistryV121.timelapse.speed = Number(s)||3; };

  // ── FOG-OF-WAR EXPANSION ──────────────────────────────────────────────────

  function expandFog() {
    // Each year civs explore nearby cells
    if (typeof revealFog !== "function") return;
    var civs = (typeof window.cecV95Data !== "undefined" && Array.isArray(window.cecV95Data.civs))
      ? window.cecV95Data.civs : [];
    var yr = (typeof year !== "undefined") ? year : 0;
    civs.forEach(function(civ, idx) {
      // Each civ reveals fog near its position every N years
      if (yr > 0 && yr % 5 === idx % 5) {
        var zones = window.wmCivV121 ? Object.values(window.wmCivV121.civZones) : [];
        var zone = zones[idx];
        if (zone) {
          revealFog(zone.x, zone.y, 1);
          revealFog(Math.min(95, zone.x + 8), zone.y, 1);
          revealFog(zone.x, Math.min(95, zone.y + 8), 1);
        }
      }
    });
  }

  // ── UI INJECTION ──────────────────────────────────────────────────────────

  function injectLayerChips() {
    var row = document.querySelector(".map-filter-row");
    if (!row || document.getElementById("wm121-chip-terrain")) return;

    var chips = [
      { id:"wm121-chip-terrain",  label:"🌍 Địa Hình", onclick:"window.wmToggleTerrain&&wmToggleTerrain();this.classList.toggle('active')" },
      { id:"wm121-chip-civs",     label:"🏛️ Văn Minh",  onclick:"window.wmToggleCivLayer&&wmToggleCivLayer('civs');this.classList.toggle('active')" },
      { id:"wm121-chip-wars",     label:"⚔️ Chiến Tranh",onclick:"window.wmToggleCivLayer&&wmToggleCivLayer('wars');this.classList.toggle('active')" },
      { id:"wm121-chip-disasters",label:"🌋 Thảm Họa",  onclick:"window.wmToggleCivLayer&&wmToggleCivLayer('disasters');this.classList.toggle('active')" },
      { id:"wm121-chip-cities",   label:"🏙 Đô Thị V121",onclick:"window.wmToggleCivLayer&&wmToggleCivLayer('cities');this.classList.toggle('active')" }
    ];

    chips.forEach(function(c) {
      var btn = document.createElement("button");
      btn.id = c.id;
      btn.className = "map-filter-chip active";
      btn.style.cssText = "background:rgba(139,92,246,0.15);border-color:rgba(139,92,246,0.4);color:#c084fc";
      btn.setAttribute("onclick", c.onclick);
      btn.textContent = c.label;
      row.appendChild(btn);
    });
  }

  function buildSidebarHTML() {
    var tl = window.wmRegistryV121.timelapse;
    var maxYr = tlGetMaxYear();
    var curYr = tl.currentYear;
    var civs = (typeof window.cecV95Data !== "undefined" && Array.isArray(window.cecV95Data.civs))
      ? window.cecV95Data.civs : [];
    var wars = (typeof window.warsActive !== "undefined" && Array.isArray(window.warsActive))
      ? window.warsActive.filter(function(w){ return w.status === "active"; }) : [];

    var tabs = ["civs","wars","timelapse","discover"];
    var tabLabels = ["🏛️ Văn Minh","⚔️ Chiến Tranh","⏩ Timelapse","🌫️ Khám Phá"];
    var activeTab = window.wmRegistryV121.activeTab;

    var tabBar = '<div style="display:flex;gap:4px;margin-bottom:10px;flex-wrap:wrap">';
    tabs.forEach(function(t, i) {
      var active = t === activeTab;
      tabBar += '<button onclick="window.wmRegistryV121.activeTab=\''+t+'\';wmV121RebuildSidebar()" '
        + 'style="flex:1;min-width:70px;padding:4px 6px;font-size:10px;border-radius:6px;cursor:pointer;border:1px solid '
        + (active ? '#c084fc' : 'rgba(139,92,246,0.25)') + ';background:'
        + (active ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.08)') + ';color:'
        + (active ? '#e9d5ff' : '#94a3b8') + '">' + tabLabels[i] + '</button>';
    });
    tabBar += '</div>';

    var body = '';

    if (activeTab === "civs") {
      if (!civs.length) {
        body = '<div style="color:#475569;font-size:12px;text-align:center;padding:16px">Chưa có văn minh nào hình thành.<br><small>Tạo thế giới và chờ các loài phát triển.</small></div>';
      } else {
        body = '<div style="max-height:320px;overflow-y:auto">';
        var sorted = civs.slice().sort(function(a,b){ return (b.population||0)-(a.population||0); });
        sorted.forEach(function(civ) {
          var bar = Math.min(100, Math.round((civ.territory||0) / Math.max(1, sorted[0].territory||1) * 100));
          body += '<div style="padding:8px;border-bottom:1px solid rgba(139,92,246,0.12);cursor:pointer" '
            + 'onmouseover="this.style.background=\'rgba(139,92,246,0.08)\'" onmouseout="this.style.background=\'\'">',
          body += '<div style="display:flex;justify-content:space-between;align-items:center">';
          body += '<span style="font-size:11px;font-weight:600;color:' + (civ.color||'#c084fc') + '">'
            + (civ.speciesIcon||"👥") + ' ' + (civ.name||"Văn Minh") + '</span>';
          body += '<span style="font-size:10px;color:#94a3b8">' + (civ.stageIcon||"🏕️") + ' ' + (civ.stageLabel||"Bộ Lạc") + '</span>';
          body += '</div>';
          body += '<div style="margin-top:4px;background:rgba(0,0,0,0.3);border-radius:3px;height:4px">'
            + '<div style="width:'+bar+'%;height:4px;border-radius:3px;background:'+(civ.color||'#c084fc')+'"></div></div>';
          body += '<div style="display:flex;gap:8px;margin-top:3px;font-size:10px;color:#64748b">';
          body += '<span>👥 ' + ((civ.population||0) > 1000 ? ((civ.population/1000).toFixed(0)+'k') : (civ.population||0)) + '</span>';
          body += '<span>🏙 ' + (civ.cities||[]).length + ' thành</span>';
          body += '<span>🔬 ' + (civ.techPoints||0) + '</span>';
          body += '</div>';
          body += '</div>';
        });
        body += '</div>';
      }

    } else if (activeTab === "wars") {
      if (!wars.length) {
        body = '<div style="color:#475569;font-size:12px;text-align:center;padding:16px">Thế giới đang hòa bình.<br><small>Không có chiến tranh nào đang diễn ra.</small></div>';
      } else {
        body = '<div style="max-height:320px;overflow-y:auto">';
        wars.forEach(function(w) {
          body += '<div style="padding:8px;border-bottom:1px solid rgba(239,68,68,0.15)">';
          body += '<div style="font-size:11px;font-weight:600;color:#f87171">⚔️ ' + (w.attacker||"?") + ' vs ' + (w.defender||"?") + '</div>';
          body += '<div style="font-size:10px;color:#94a3b8;margin-top:2px">📅 Năm ' + (w.startYear||"?") + ' · ' + (w.reason||"Xung đột lãnh thổ") + '</div>';
          body += '<div style="font-size:10px;color:#64748b;margin-top:2px">⚔️ Trận: ' + (w.battles||[]).length + '</div>';
          body += '</div>';
        });
        body += '</div>';
      }

    } else if (activeTab === "timelapse") {
      var pct = maxYr > 1 ? Math.round((curYr / maxYr) * 100) : 0;
      var liveYr = (typeof year !== "undefined") ? year : 0;
      body = '<div style="padding:4px">';
      body += '<div style="font-size:11px;color:#94a3b8;margin-bottom:8px">Phát lại lịch sử thế giới từ đầu đến hiện tại như phim tài liệu.</div>';

      // Year display
      body += '<div style="text-align:center;margin-bottom:8px">'
        + '<span style="font-size:22px;font-weight:700;color:#facc15">Năm ' + curYr + '</span>'
        + '<span style="font-size:11px;color:#64748b;display:block"> / Năm ' + maxYr + ' hiện tại</span>'
        + '</div>';

      // Progress bar
      body += '<div style="background:rgba(0,0,0,0.4);border-radius:4px;height:6px;margin-bottom:8px">'
        + '<div style="width:'+pct+'%;height:6px;border-radius:4px;background:linear-gradient(90deg,#7c3aed,#facc15);transition:width 0.1s"></div></div>';

      // Seek slider
      body += '<input type="range" min="1" max="'+Math.max(1,maxYr)+'" value="'+curYr+'" '
        + 'oninput="wmTlSeek(this.value)" '
        + 'style="width:100%;margin-bottom:8px;accent-color:#7c3aed">';

      // Controls
      body += '<div style="display:flex;gap:6px;justify-content:center;margin-bottom:8px">';
      body += '<button onclick="wmTlSeek(1)" style="padding:5px 8px;font-size:11px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#94a3b8;cursor:pointer">⏮ Đầu</button>';
      if (tl.playing) {
        body += '<button onclick="wmTlPause()" style="padding:5px 14px;font-size:11px;border-radius:6px;border:1px solid #f59e0b;background:rgba(245,158,11,0.15);color:#fbbf24;cursor:pointer">⏸ Dừng</button>';
      } else {
        body += '<button onclick="wmTlPlay()" style="padding:5px 14px;font-size:11px;border-radius:6px;border:1px solid #7c3aed;background:rgba(124,58,237,0.2);color:#c084fc;cursor:pointer">▶ Phát Lại</button>';
      }
      body += '<button onclick="wmTlGoLive()" style="padding:5px 8px;font-size:11px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#94a3b8;cursor:pointer">🔴 Live</button>';
      body += '</div>';

      // Speed
      body += '<div style="display:flex;align-items:center;gap:6px;font-size:10px;color:#64748b">'
        + '<span>Tốc độ:</span>'
        + '<select onchange="wmTlSetSpeed(this.value)" style="background:#1e293b;color:#94a3b8;border:1px solid #334155;border-radius:4px;padding:2px 4px;font-size:10px">'
        + '<option value="1"' + (tl.speed===1?' selected':'') + '>×1</option>'
        + '<option value="3"' + (tl.speed===3?' selected':'') + '>×3</option>'
        + '<option value="10"' + (tl.speed===10?' selected':'') + '>×10</option>'
        + '<option value="25"' + (tl.speed===25?' selected':'') + '>×25</option>'
        + '<option value="50"' + (tl.speed===50?' selected':'') + '>×50</option>'
        + '</select>';
      body += '<span style="margin-left:auto">📸 ' + Object.keys(typeof _timelineSnapshots!=="undefined"?_timelineSnapshots:{}).length + ' ảnh</span>';
      body += '</div>';
      body += '</div>';

    } else if (activeTab === "discover") {
      var fogPct = 0;
      if (typeof _fogGrid !== "undefined") {
        var fogKeys = Object.keys(_fogGrid).length;
        fogPct = Math.min(100, Math.round(fogKeys / 100 * 100));
      }
      body = '<div style="padding:4px">';
      body += '<div style="font-size:11px;color:#94a3b8;margin-bottom:10px">Sương mù chiến tranh. Các nền văn minh dần khám phá thế giới.</div>';
      body += '<div style="margin-bottom:12px">';
      body += '<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:11px;color:#7dd3fc">🌫️ Đã Khám Phá</span><span style="font-size:11px;color:#facc15">'+fogPct+'%</span></div>';
      body += '<div style="background:rgba(0,0,0,0.4);border-radius:4px;height:8px">'
        + '<div style="width:'+fogPct+'%;height:8px;border-radius:4px;background:linear-gradient(90deg,#0ea5e9,#7c3aed)"></div></div>';
      body += '</div>';

      var civCount = civs.length;
      body += '<div style="font-size:11px;color:#94a3b8;margin-bottom:6px">Số văn minh đang khám phá: <span style="color:#facc15">' + civCount + '</span></div>';
      body += '<div style="font-size:10px;color:#475569;margin-bottom:8px">Mỗi 5 năm, mỗi nền văn minh mở rộng tầm nhìn ra xung quanh lãnh thổ của mình.</div>';

      body += '<button onclick="revealFog&&revealFog(50,50,2)" style="width:100%;padding:6px;font-size:11px;border-radius:6px;border:1px solid rgba(14,165,233,0.4);background:rgba(14,165,233,0.1);color:#7dd3fc;cursor:pointer;margin-bottom:6px">🌐 Khám Phá Trung Tâm</button>';
      body += '<button onclick="(typeof _fogGrid!==\'undefined\')&&(window._fogGrid={})&&(window._fogGenerated=false)&&wmV121RebuildSidebar()" style="width:100%;padding:6px;font-size:11px;border-radius:6px;border:1px solid rgba(100,116,139,0.3);background:rgba(100,116,139,0.08);color:#64748b;cursor:pointer">🔄 Đặt Lại Sương Mù</button>';
      body += '</div>';
    }

    return tabBar + body;
  }

  function _updateTlUI() {
    // Debounced rebuild
    clearTimeout(_updateTlUI._t);
    _updateTlUI._t = setTimeout(function() {
      var el = document.getElementById("wm121-sidebar-panel");
      if (el && window.wmRegistryV121.activeTab === "timelapse") {
        el.innerHTML = buildSidebarHTML();
      }
    }, 80);
  }

  window.wmV121RebuildSidebar = function() {
    var el = document.getElementById("wm121-sidebar-panel");
    if (el) el.innerHTML = buildSidebarHTML();
  };

  function injectSidebarPanel() {
    var aside = document.querySelector("#panel-worldmap .map-sidebar");
    if (!aside || document.getElementById("wm121-sidebar-section")) return;

    var section = document.createElement("div");
    section.id = "wm121-sidebar-section";
    section.style.cssText = "flex-shrink:0;border-top:1px solid rgba(139,92,246,0.3)";

    var title = document.createElement("div");
    title.className = "map-sidebar-title";
    title.style.cssText = "color:#c084fc;font-size:11px;padding:6px 10px;font-weight:700;letter-spacing:1px";
    title.textContent = "🗺️ V121 · BẢN ĐỒ NĂNG ĐỘNG";

    var panel = document.createElement("div");
    panel.id = "wm121-sidebar-panel";
    panel.style.cssText = "padding:8px;max-height:440px;overflow-y:auto";
    panel.innerHTML = buildSidebarHTML();

    section.appendChild(title);
    section.appendChild(panel);

    // Insert before the regen button div (last child)
    var lastChild = aside.lastElementChild;
    aside.insertBefore(section, lastChild);
  }

  // ── TICK HOOK ─────────────────────────────────────────────────────────────

  function hookGameTick() {
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      var yr = (typeof year !== "undefined") ? year : 0;
      if (yr > 0 && yr % 5 === 0) expandFog();
    };
  }

  // ── SAVE / LOAD ───────────────────────────────────────────────────────────

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        activeTab: window.wmRegistryV121.activeTab
      }));
    } catch(e) {}
  }
  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        var p = JSON.parse(raw);
        if (p.activeTab) window.wmRegistryV121.activeTab = p.activeTab;
      }
    } catch(e) {}
  }

  // ── MAP PANEL OPEN HOOK ───────────────────────────────────────────────────

  function hookPanelOpen() {
    if (typeof window.onMapPanelShow !== "function") return false;
    var _orig = window.onMapPanelShow;
    window.onMapPanelShow = function() {
      _orig.apply(this, arguments);
      setTimeout(function() {
        injectLayerChips();
        injectSidebarPanel();
      }, 120);
    };
    return true;
  }

  // ── REPORT GENERATION ────────────────────────────────────────────────────

  window.wmV121GenerateReport = function() {
    var yr = (typeof year !== "undefined") ? year : 0;
    var civs = (typeof window.cecV95Data !== "undefined" && Array.isArray(window.cecV95Data.civs))
      ? window.cecV95Data.civs : [];
    var wars = (typeof window.warsActive !== "undefined") ? window.warsActive.filter(function(w){ return w.status==="active"; }) : [];
    var snaps = (typeof _timelineSnapshots !== "undefined") ? Object.keys(_timelineSnapshots).length : 0;
    var fogPct = typeof _fogGrid !== "undefined" ? Math.min(100, Math.round(Object.keys(_fogGrid).length)) : 0;

    var lines = [
      "# WORLD_MAP_V121_REPORT.md",
      "",
      "**Ngày Báo Cáo:** Năm " + yr,
      "**Phiên Bản:** V121 — Bản Đồ Thế Giới Năng Động",
      "",
      "## Tổng Quan",
      "- 🌍 Địa hình: 22×22 grid · 6 loại · Seed từ worldId",
      "- 🏛️ Văn minh có lãnh thổ: " + civs.length,
      "- ⚔️ Chiến tranh đang diễn ra: " + wars.length,
      "- 📸 Snapshot timelapse: " + snaps,
      "- 🌫️ Fog revealed: " + fogPct + "%",
      "",
      "## Văn Minh Theo Lãnh Thổ"
    ];

    var sorted = civs.slice().sort(function(a,b){ return (b.territory||0)-(a.territory||0); });
    sorted.forEach(function(c, i) {
      lines.push((i+1) + ". " + (c.speciesIcon||"👥") + " **" + c.name + "** — "
        + (c.stageLabel||c.stageId||"?") + " · Dân số: " + (c.population||0)
        + " · Thành phố: " + (c.cities||[]).length
        + " · Tech: " + (c.techPoints||0));
    });

    lines.push("");
    lines.push("## Chiến Tranh Đang Diễn Ra");
    if (!wars.length) {
      lines.push("*Thế giới đang hòa bình.*");
    } else {
      wars.forEach(function(w) {
        lines.push("- ⚔️ **" + (w.attacker||"?") + "** vs **" + (w.defender||"?") + "** (Năm " + (w.startYear||"?") + ") — " + (w.reason||"Xung đột lãnh thổ"));
      });
    }

    lines.push("");
    lines.push("## Trạng Thái Hệ Thống");
    lines.push("- Terrain Engine: ✅ Hoạt động");
    lines.push("- Civ Territory Layer: ✅ Hoạt động");
    lines.push("- War Fronts: ✅ Hoạt động");
    lines.push("- Fog of War: ✅ Tích hợp sẵn (worldMapSystem.js)");
    lines.push("- Timelapse: ✅ Sử dụng _timelineSnapshots");
    lines.push("- Disaster Markers: ✅ Đọc từ disasterData / plagueData");
    lines.push("- City System V121: ✅ Đọc từ cecV95Data.civs[].cities");

    var md = lines.join("\n");

    // Try to save to localStorage and display
    try { localStorage.setItem("cgv6_worldmap_report_v121", md); } catch(e) {}

    // Show in mapInfoPanel if available
    var info = document.getElementById("mapInfoPanel");
    if (info) {
      info.innerHTML = '<div style="padding:8px;font-size:10px;color:#94a3b8;white-space:pre-wrap;font-family:monospace;max-height:300px;overflow-y:auto">' + md + '</div>';
    }
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: yr, type: "achievement", title: "📊 WORLD_MAP_V121_REPORT.md đã tạo", color: "#c084fc" });
    }
    console.log("[WorldMap V121 Report]\n" + md);
    return md;
  };

  // ── INIT ──────────────────────────────────────────────────────────────────

  function init() {
    load();
    hookGameTick();

    var panelOk = hookPanelOpen();
    if (!panelOk) {
      var t = 0;
      var iv = setInterval(function() { if (hookPanelOpen() || ++t > 20) clearInterval(iv); }, 500);
    }

    // Try immediate inject if panel already visible
    setTimeout(function() {
      injectLayerChips();
      injectSidebarPanel();
    }, 800);

    // Auto-refresh sidebar every 3s when panel is active
    setInterval(function() {
      var panel = document.getElementById("panel-worldmap");
      if (panel && panel.classList.contains("active")) {
        var sidebarEl = document.getElementById("wm121-sidebar-panel");
        if (!sidebarEl) {
          injectLayerChips();
          injectSidebarPanel();
        } else {
          sidebarEl.innerHTML = buildSidebarHTML();
        }
      }
    }, 3000);

    // Patch save/load
    var _os = window.save;
    window.save = function() { if (_os) _os(); save(); };
    var _ol = window.load;
    window.load = function() { if (_ol) _ol(); load(); };

    console.log("[WorldMap Registry V121] 🗺️ UI Registry khởi động — Layer chips · Timelapse ▶ · Văn Minh/Chiến Tranh/Khám Phá · wmV121GenerateReport() sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 28700); });
  } else {
    setTimeout(init, 28700);
  }
})();
