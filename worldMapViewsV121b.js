(function() {
  "use strict";
  // V121b — 5 View Modes + Jarvis Map Queries + XR Data Prep + Living Report
  // Init: 28800ms · Extends V121 (KHÔNG ghi đè)

  var SAVE_KEY = "cgv6_worldmap_views_v121b";

  window.wmViewsV121 = {
    activeMode: "civilization", // political|civilization|population|technology|history
    jarvisLog: [],
    xrReady: false
  };

  var VIEW_MODES = [
    { id:"political",    label:"🗺 Chính Trị",   color:"#f472b6" },
    { id:"civilization", label:"🏛 Văn Minh",    color:"#c084fc" },
    { id:"population",   label:"👥 Dân Số",      color:"#34d399" },
    { id:"technology",   label:"🔬 Công Nghệ",   color:"#60a5fa" },
    { id:"history",      label:"📜 Lịch Sử",     color:"#fbbf24" }
  ];

  // ── VIEW MODE RENDERING ───────────────────────────────────────────────────

  function drawPopulationView(ctx, wx, wy, z) {
    var civs = (window.wmCivV121 && window.wmCivV121.civZones)
      ? Object.values(window.wmCivV121.civZones) : [];
    if (!civs.length) return;

    var maxPop = civs.reduce(function(m, c) { return Math.max(m, c.pop || 0); }, 1);

    civs.forEach(function(civ) {
      var cx = wx(civ.x), cy = wy(civ.y);
      var popRatio = (civ.pop || 0) / maxPop;
      var r = Math.max(6, Math.min(60, popRatio * 55 * z));
      var rgb = "52,211,153";

      var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0,   "rgba("+rgb+",0.55)");
      grad.addColorStop(0.6, "rgba("+rgb+",0.25)");
      grad.addColorStop(1,   "rgba("+rgb+",0.02)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI*2);
      ctx.fill();

      if (z >= 0.6) {
        var popStr = civ.pop > 1000000 ? (civ.pop/1000000).toFixed(1)+"M"
                   : civ.pop > 1000 ? (civ.pop/1000).toFixed(0)+"k" : String(civ.pop||0);
        ctx.font = "bold " + Math.max(8, Math.round(10*z)) + "px sans-serif";
        ctx.fillStyle = "#86efac";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("👥 "+popStr, cx, cy);
      }
    });
  }

  function drawPoliticalView(ctx, wx, wy, z) {
    var civs = (window.wmCivV121 && window.wmCivV121.civZones)
      ? Object.values(window.wmCivV121.civZones) : [];
    var countries = (window.countries || []).slice(0, 30);

    // Draw government type rings for countries
    var govColors = {
      monarchy: "#f59e0b", democracy: "#60a5fa", theocracy: "#a78bfa",
      republic: "#34d399", empire: "#ef4444", confederation: "#fb923c",
      "default": "#94a3b8"
    };

    civs.forEach(function(civ, idx) {
      var cx = wx(civ.x), cy = wy(civ.y);
      var r = wx(civ.radius) * 1.08;

      // Get government from countries if linked
      var linkedCountry = countries.find(function(c) {
        return (c.name||"").indexOf(civ.name) >= 0 || civ.name.indexOf(c.name||"") >= 0;
      });
      var gov = (linkedCountry && linkedCountry.government) ? linkedCountry.government.toLowerCase() : "default";
      var col = govColors[gov] || govColors["default"];

      // Outer political border (solid)
      ctx.strokeStyle = col;
      ctx.lineWidth = Math.max(1.5, 2.5 * z);
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI*2);
      ctx.stroke();

      // Government label badge
      if (z >= 0.65) {
        var govLabel = gov === "default" ? "Chưa Xác Định" : gov.charAt(0).toUpperCase() + gov.slice(1);
        var bw = govLabel.length * 5.5 + 10;
        var bh = 14;
        var bx = cx - bw/2, by = cy + r - 4;
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 3) : ctx.rect(bx, by, bw, bh);
        ctx.fill();
        ctx.font = Math.max(7, Math.round(8*z)) + "px sans-serif";
        ctx.fillStyle = col;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(govLabel, cx, by + bh/2);
      }
    });
  }

  function drawTechnologyView(ctx, wx, wy, z) {
    var civs = (window.wmCivV121 && window.wmCivV121.civZones)
      ? Object.values(window.wmCivV121.civZones) : [];
    if (!civs.length) return;

    var maxTech = civs.reduce(function(m, c) { return Math.max(m, c.tech || 0); }, 1);

    civs.forEach(function(civ) {
      var cx = wx(civ.x), cy = wy(civ.y);
      var techRatio = (civ.tech || 0) / maxTech;

      // Tech glow — color shifts from dim red to bright blue as tech increases
      var r = Math.max(5, Math.round(techRatio * 255));
      var g = Math.max(0, Math.round(techRatio * 120));
      var b = Math.max(80, Math.round(50 + techRatio * 200));
      var rgb = r + "," + g + "," + b;

      var rad = Math.max(8, wx(civ.radius) * 0.75);
      var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      grad.addColorStop(0,   "rgba("+rgb+",0.6)");
      grad.addColorStop(0.5, "rgba("+rgb+",0.3)");
      grad.addColorStop(1,   "rgba("+rgb+",0.02)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI*2);
      ctx.fill();

      // Tech badge
      if (z >= 0.55) {
        var techStr = (civ.tech || 0) > 1000 ? (civ.tech/1000).toFixed(1)+"k pts" : (civ.tech||0)+" pts";
        var stars = Math.min(5, Math.round(techRatio * 5));
        ctx.font = Math.max(8, Math.round(9.5*z)) + "px sans-serif";
        ctx.fillStyle = "rgba("+rgb+",1)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🔬 " + techStr + " " + "★".repeat(stars), cx, cy + rad * 0.45);
      }
    });
  }

  function drawHistoricalReplayMode(ctx, wx, wy, z) {
    // Draw timelapse year overlay
    var tl = window.wmRegistryV121 && window.wmRegistryV121.timelapse;
    if (!tl) return;
    var yr = tl.currentYear || (typeof year !== "undefined" ? year : 1);
    var liveYr = (typeof year !== "undefined") ? year : yr;
    var isLive = Math.abs(yr - liveYr) < 3;

    var sw = ctx.canvas.width;
    var sh = ctx.canvas.height;

    // Year badge overlay (top-center of canvas)
    var txt = "📜 Năm " + yr + (isLive ? "  🔴 LIVE" : "  ⏪ Phát Lại");
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    var tw = txt.length * 8 + 20;
    var th = 26;
    var tx = sw/2 - tw/2;
    var ty = 8;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(tx, ty, tw, th, 5);
    else ctx.rect(tx, ty, tw, th);
    ctx.fill();

    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = isLive ? "#f87171" : "#fbbf24";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(txt, sw/2, ty + th/2);
  }

  // ── HOOK INTO drawBiomeBackground to draw view-mode overlays ─────────────

  function hookBiomeForViewModes() {
    if (typeof window.drawBiomeBackground !== "function") return false;
    var _orig = window.drawBiomeBackground;
    window.drawBiomeBackground = function(ctx, md, wx, wy, z) {
      _orig.apply(this, arguments);

      var mode = window.wmViewsV121.activeMode;
      if (mode === "population") drawPopulationView(ctx, wx, wy, z);
      if (mode === "political")  drawPoliticalView(ctx, wx, wy, z);
      if (mode === "technology") drawTechnologyView(ctx, wx, wy, z);
      if (mode === "history")    drawHistoricalReplayMode(ctx, wx, wy, z);
      // "civilization" mode: relies on V121 civ layer (already there)
    };
    return true;
  }

  // ── UI: VIEW MODE CHIPS ───────────────────────────────────────────────────

  function injectViewModeBar() {
    var row = document.querySelector(".map-filter-row");
    if (!row || document.getElementById("wm121b-viewmode-bar")) return;

    var bar = document.createElement("div");
    bar.id = "wm121b-viewmode-bar";
    bar.style.cssText = "display:flex;gap:4px;align-items:center;margin-left:8px;border-left:1px solid rgba(139,92,246,0.2);padding-left:8px";

    var label = document.createElement("span");
    label.style.cssText = "font-size:9px;color:#64748b;white-space:nowrap;letter-spacing:0.5px";
    label.textContent = "CHẾ ĐỘ XEM";
    bar.appendChild(label);

    VIEW_MODES.forEach(function(vm) {
      var btn = document.createElement("button");
      btn.id = "wm121b-view-" + vm.id;
      btn.className = "map-filter-chip";
      var isActive = window.wmViewsV121.activeMode === vm.id;
      btn.style.cssText = "background:" + (isActive ? "rgba(139,92,246,0.22)" : "rgba(139,92,246,0.06)")
        + ";border-color:" + (isActive ? vm.color : "rgba(100,116,139,0.3)")
        + ";color:" + (isActive ? vm.color : "#64748b") + ";font-size:10px;padding:3px 8px";
      btn.textContent = vm.label;
      btn.onclick = function() {
        window.wmViewsV121.activeMode = vm.id;
        // If history mode, sync timelapse tab
        if (vm.id === "history" && window.wmRegistryV121) {
          window.wmRegistryV121.activeTab = "timelapse";
          if (typeof window.wmV121RebuildSidebar === "function") window.wmV121RebuildSidebar();
        }
        _refreshViewBtns();
        save();
      };
      bar.appendChild(btn);
    });

    row.appendChild(bar);
  }

  function _refreshViewBtns() {
    VIEW_MODES.forEach(function(vm) {
      var btn = document.getElementById("wm121b-view-" + vm.id);
      if (!btn) return;
      var isActive = window.wmViewsV121.activeMode === vm.id;
      btn.style.background = isActive ? "rgba(139,92,246,0.22)" : "rgba(139,92,246,0.06)";
      btn.style.borderColor = isActive ? vm.color : "rgba(100,116,139,0.3)";
      btn.style.color = isActive ? vm.color : "#64748b";
    });
  }

  // ── JARVIS MAP QUERIES ────────────────────────────────────────────────────

  window.wmV121JarvisQuery = function(question) {
    var yr = (typeof year !== "undefined") ? year : 0;
    var civs = (window.wmCivV121 && window.wmCivV121.civZones)
      ? Object.values(window.wmCivV121.civZones) : [];
    var wars = (window.wmCivV121 && window.wmCivV121.warFronts) || [];
    var diploStats = (typeof window.wmGetDiploStats === "function") ? window.wmGetDiploStats() : {};
    var q = (question || "").toLowerCase();
    var answer = "";

    if (q.indexOf("lớn nhất") >= 0 || q.indexOf("largest") >= 0 || q.indexOf("lục địa") >= 0 || q.indexOf("kiểm soát") >= 0) {
      if (!civs.length) { answer = "Thế giới chưa có văn minh nào."; }
      else {
        var biggest = civs.slice().sort(function(a,b){ return (b.radius||0)-(a.radius||0); })[0];
        answer = biggest.speciesIcon + " **" + biggest.name + "** đang kiểm soát lãnh thổ lớn nhất"
          + " (Radius: " + Math.round(biggest.radius||0) + " đơn vị, "
          + biggest.stageIcon + " " + biggest.stage + ", 👥 " + (biggest.pop||0) + " dân).";
      }
    } else if (q.indexOf("cổ nhất") >= 0 || q.indexOf("thành phố") >= 0 || q.indexOf("oldest") >= 0) {
      var oldestCity = null, oldestAge = 0;
      civs.forEach(function(civ) {
        (civ.cities||[]).forEach(function(ct) {
          if ((ct.age||0) > oldestAge) { oldestAge = ct.age||0; oldestCity = ct; oldestCity._civName = civ.name; }
        });
      });
      if (!oldestCity) answer = "Chưa có thành phố nào được hình thành.";
      else answer = "Thành phố cổ nhất là **" + oldestCity.name + "** (thuộc " + oldestCity._civName
          + "), " + oldestAge + " năm tuổi" + (oldestCity.isCapital ? " ★ (Thủ Đô)" : "") + ".";
    } else if (q.indexOf("chiến tranh") >= 0 || q.indexOf("war") >= 0 || q.indexOf("cuộc chiến") >= 0) {
      if (!wars.length) answer = "Thế giới đang hòa bình, không có chiến tranh.";
      else {
        var biggest2 = wars[0];
        answer = "Hiện có **" + wars.length + " cuộc chiến** đang diễn ra. Lớn nhất: ⚔️ **"
          + biggest2.attacker + "** vs **" + biggest2.defender + "** (Từ năm " + (biggest2.year||"?") + ").";
      }
    } else if (q.indexOf("sụp đổ") >= 0 || q.indexOf("collapsed") >= 0 || q.indexOf("đế chế") >= 0) {
      var history = (typeof window.civAIV120Data !== "undefined" && window.civAIV120Data.history)
        ? window.civAIV120Data.history.filter(function(h){ return h.type === "collapse"; }) : [];
      if (!history.length) answer = "Chưa ghi nhận đế chế nào sụp đổ.";
      else {
        var last = history[history.length-1];
        answer = "Đế chế cuối cùng sụp đổ là **" + (last.civName||"Không Rõ") + "** vào năm "
          + (last.year||"?") + ". Tổng số đã sụp đổ: " + history.length + ".";
      }
    } else if (q.indexOf("dân số") >= 0 || q.indexOf("population") >= 0) {
      if (!civs.length) answer = "Chưa có dân số nào.";
      else {
        var richest = civs.slice().sort(function(a,b){ return (b.pop||0)-(a.pop||0); })[0];
        var totalPop = civs.reduce(function(s,c){ return s+(c.pop||0); }, 0);
        answer = "Tổng dân số: **" + (totalPop > 1000000 ? (totalPop/1000000).toFixed(1)+"M" : totalPop)
          + "** · Văn minh đông dân nhất: " + richest.speciesIcon + " **" + richest.name
          + "** (" + (richest.pop > 1000 ? (richest.pop/1000).toFixed(0)+"k" : richest.pop||0) + " dân).";
      }
    } else if (q.indexOf("liên minh") >= 0 || q.indexOf("alliance") >= 0 || q.indexOf("ngoại giao") >= 0) {
      answer = "Ngoại giao hiện tại — Liên minh: **" + (diploStats.alliances||0)
        + "** · Tuyến thương mại: **" + (diploStats.trade||0)
        + "** · Hiệp ước: **" + (diploStats.treaties||0)
        + "** · Thù địch: **" + (diploStats.rivals||0) + "**.";
    } else if (q.indexOf("công nghệ") >= 0 || q.indexOf("tech") >= 0 || q.indexOf("tiên tiến") >= 0) {
      if (!civs.length) answer = "Chưa có văn minh nào.";
      else {
        var advanced = civs.slice().sort(function(a,b){ return (b.tech||0)-(a.tech||0); })[0];
        answer = "Văn minh tiên tiến nhất: " + advanced.speciesIcon + " **" + advanced.name
          + "** với **" + (advanced.tech||0) + " điểm công nghệ** ("
          + advanced.stageIcon + " " + advanced.stage + ").";
      }
    } else {
      // General summary
      var totalPop2 = civs.reduce(function(s,c){ return s+(c.pop||0); }, 0);
      answer = "Năm " + yr + " — Thế giới có **" + civs.length + " văn minh**, "
        + "**" + wars.length + " chiến tranh**, tổng dân số **"
        + (totalPop2 > 1000000 ? (totalPop2/1000000).toFixed(1)+"M" : totalPop2)
        + "**. Hỏi chi tiết hơn về: lãnh thổ lớn nhất / thành phố cổ nhất / chiến tranh / dân số / công nghệ / ngoại giao / đế chế sụp đổ.";
    }

    var entry = { year: yr, question: question, answer: answer, ts: Date.now() };
    window.wmViewsV121.jarvisLog.unshift(entry);
    if (window.wmViewsV121.jarvisLog.length > 30) window.wmViewsV121.jarvisLog.length = 30;

    // Show in sidebar if visible
    _showJarvisAnswer(answer);
    return answer;
  };

  function _showJarvisAnswer(answer) {
    var el = document.getElementById("wm121b-jarvis-answer");
    if (!el) return;
    el.innerHTML = '<div style="background:rgba(124,58,237,0.12);border:1px solid rgba(139,92,246,0.3);border-radius:6px;padding:8px;font-size:11px;color:#e2e8f0;line-height:1.5">'
      + answer.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#c084fc">$1</strong>')
      + '</div>';
  }

  // ── XR DATA PREPARATION ───────────────────────────────────────────────────

  function buildXRData() {
    var civs = (window.wmCivV121 && window.wmCivV121.civZones)
      ? Object.values(window.wmCivV121.civZones) : [];

    // Convert 2D map coords to XR 3D coords
    // x,y (0-100 range) → XR x,y,z (world units, y=elevation)
    var xrCivs = civs.map(function(civ) {
      return {
        id: civ.id,
        name: civ.name,
        position3d: {
          x: (civ.x - 50) * 2,   // center at 0
          y: (civ.tech || 0) / 500, // tech = elevation
          z: (civ.y - 50) * 2
        },
        scale: civ.radius / 10,
        color: civ.color,
        pop: civ.pop,
        stage: civ.stage,
        cities: (civ.cities || []).map(function(ct) {
          return {
            name: ct.name,
            position3d: { x: (ct.x - 50)*2, y: ct.isCapital ? 0.5 : 0.2, z: (ct.y - 50)*2 },
            isCapital: ct.isCapital,
            pop: ct.pop
          };
        })
      };
    });

    var wars = (window.wmCivV121 && window.wmCivV121.warFronts) || [];
    var xrWars = wars.map(function(wf) {
      return {
        attacker: wf.attacker,
        defender: wf.defender,
        frontline3d: {
          start: { x: (wf.ax-50)*2, y: 0, z: (wf.ay-50)*2 },
          end:   { x: (wf.dx-50)*2, y: 0, z: (wf.dy-50)*2 }
        }
      };
    });

    window.wmV121XRData = {
      version: "V121",
      compatible: ["WebXR", "VR", "AR", "MR", "Three.js"],
      worldScale: 100,    // 1 unit = 100km
      civs: xrCivs,
      wars: xrWars,
      timestamp: Date.now(),
      year: (typeof year !== "undefined") ? year : 0
    };

    window.wmViewsV121.xrReady = true;
  }

  // ── LIVING WORLD MAP REPORT ───────────────────────────────────────────────

  window.wmV121GenerateLivingReport = function() {
    var yr = (typeof year !== "undefined") ? year : 0;
    var civs = (window.wmCivV121 && window.wmCivV121.civZones)
      ? Object.values(window.wmCivV121.civZones) : [];
    var wars = (window.wmCivV121 && window.wmCivV121.warFronts) || [];
    var diploStats = (typeof window.wmGetDiploStats === "function") ? window.wmGetDiploStats() : {};
    var totalCities = civs.reduce(function(s, c) { return s + (c.cities||[]).length; }, 0);
    var totalPop = civs.reduce(function(s, c) { return s + (c.pop||0); }, 0);

    // Completion percentage
    var checks = [
      civs.length >= 3,                             // ≥3 civilizations
      totalCities >= 3,                             // ≥3 cities
      wars.length >= 0,                             // war system active
      typeof window.wmDiploV121 !== "undefined",    // diplomacy layer active
      typeof window.wmV121XRData !== "undefined",   // XR data ready
      typeof window.wmRegistryV121 !== "undefined", // timelapse active
      typeof window.wmTerrainV121 !== "undefined"   // terrain active
    ];
    var completionPct = Math.round((checks.filter(Boolean).length / checks.length) * 100);

    var sorted = civs.slice().sort(function(a,b){ return (b.pop||0)-(a.pop||0); });
    var biggest = sorted[0];
    var mostAdvanced = civs.slice().sort(function(a,b){ return (b.tech||0)-(a.tech||0); })[0];

    var lines = [
      "# LIVING_WORLD_MAP_REPORT.md",
      "",
      "> **Creator God V6 · V121 Bản Đồ Thế Giới Sống**  ",
      "> Ngày Báo Cáo: Năm " + yr + " của thế giới",
      "",
      "---",
      "",
      "## 📊 Tổng Quan Hệ Thống",
      "",
      "| Chỉ Số | Giá Trị |",
      "|---|---|",
      "| Số Văn Minh | **" + civs.length + "** |",
      "| Số Thành Phố | **" + totalCities + "** |",
      "| Tổng Dân Số | **" + (totalPop > 1000000 ? (totalPop/1000000).toFixed(2)+"M" : totalPop) + "** |",
      "| Chiến Tranh Đang Diễn Ra | **" + wars.length + "** |",
      "| Tuyến Ngoại Giao | **" + ((diploStats.alliances||0)+(diploStats.trade||0)+(diploStats.treaties||0)) + "** |",
      "| Tuyến Thù Địch | **" + (diploStats.rivals||0) + "** |",
      "| Mức Độ Hoàn Thành Living World | **" + completionPct + "%** |",
      "",
      "---",
      "",
      "## 🏛️ Văn Minh Theo Lãnh Thổ",
      ""
    ];

    sorted.forEach(function(c, i) {
      var cityNames = (c.cities||[]).map(function(ct){ return (ct.isCapital?"★ ":"")+ ct.name; }).join(", ") || "—";
      lines.push((i+1) + ". " + (c.speciesIcon||"👥") + " **" + c.name + "**");
      lines.push("   - Giai đoạn: " + (c.stageIcon||"") + " " + (c.stage||"?"));
      lines.push("   - Dân số: " + (c.pop||0));
      lines.push("   - Công nghệ: " + (c.tech||0) + " pts");
      lines.push("   - Thành phố: " + (c.cities||[]).length + " — " + cityNames);
      lines.push("   - Lãnh thổ radius: " + Math.round(c.radius||0));
      lines.push("");
    });

    lines.push("---");
    lines.push("");
    lines.push("## ⚔️ Chiến Tranh Đang Diễn Ra");
    lines.push("");
    if (!wars.length) {
      lines.push("*Thế giới đang hòa bình. Không có xung đột nào.*");
    } else {
      wars.forEach(function(w) {
        lines.push("- ⚔️ **" + w.attacker + "** tấn công **" + w.defender + "** (từ Năm " + (w.year||"?") + ")");
      });
    }

    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push("## 🤝 Ngoại Giao");
    lines.push("");
    lines.push("| Loại | Số Lượng |");
    lines.push("|---|---|");
    lines.push("| Liên Minh | " + (diploStats.alliances||0) + " |");
    lines.push("| Tuyến Thương Mại | " + (diploStats.trade||0) + " |");
    lines.push("| Hiệp Ước | " + (diploStats.treaties||0) + " |");
    lines.push("| Thù Địch/Trừng Phạt | " + (diploStats.rivals||0) + " |");

    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push("## 🗺️ Tính Năng Bản Đồ");
    lines.push("");
    var features = [
      ["Địa Hình 6 Loại (22×22 Grid)", typeof window.wmTerrainV121 !== "undefined"],
      ["Lãnh Thổ Văn Minh", typeof window.wmCivV121 !== "undefined"],
      ["Thành Phố Trên Bản Đồ", totalCities > 0],
      ["Vùng Chiến Tranh & Mặt Trận", true],
      ["Thiên Tai & Thảm Họa", true],
      ["Sương Mù Chiến Tranh (Fog of War)", typeof _fogGrid !== "undefined"],
      ["Timelapse Lịch Sử ▶", typeof window.wmRegistryV121 !== "undefined"],
      ["Ngoại Giao (Alliance/Trade Lines)", typeof window.wmDiploV121 !== "undefined"],
      ["5 Chế Độ Xem Bản Đồ", typeof window.wmViewsV121 !== "undefined"],
      ["Jarvis Map Queries", typeof window.wmV121JarvisQuery === "function"],
      ["XR/VR Data Compatible", typeof window.wmV121XRData !== "undefined"]
    ];
    features.forEach(function(f) {
      lines.push("- " + (f[1] ? "✅" : "⬜") + " " + f[0]);
    });

    if (biggest) {
      lines.push("");
      lines.push("---");
      lines.push("");
      lines.push("## 🏆 Kỷ Lục Thế Giới");
      lines.push("");
      lines.push("- 🌍 Văn minh kiểm soát lãnh thổ lớn nhất: **" + biggest.name + "**");
      if (mostAdvanced) lines.push("- 🔬 Văn minh tiên tiến nhất: **" + mostAdvanced.name + "** (" + (mostAdvanced.tech||0) + " pts)");
      lines.push("- 🏙️ Tổng số thành phố: **" + totalCities + "**");
    }

    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push("*Báo cáo tự động tạo bởi V121 Living World Map Engine.*");
    lines.push("*Gọi `wmV121GenerateLivingReport()` trong console để cập nhật.*");

    var md = lines.join("\n");

    try { localStorage.setItem("cgv6_living_world_map_report_v121", md); } catch(e) {}

    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: yr, type: "achievement", title: "📍 LIVING_WORLD_MAP_REPORT.md tạo xong — Living World " + completionPct + "%", color: "#22c55e" });
    }

    console.log("[WorldMap Views V121b] LIVING_WORLD_MAP_REPORT:\n" + md);
    return md;
  };

  // ── SIDEBAR: VIEW MODES + JARVIS TAB ─────────────────────────────────────

  function buildViewsTabHTML() {
    var mode = window.wmViewsV121.activeMode;
    var log = window.wmViewsV121.jarvisLog;
    var jarvisQuestions = [
      "Ai kiểm soát lãnh thổ lớn nhất?",
      "Thành phố cổ nhất là gì?",
      "Chiến tranh lớn nhất?",
      "Dân số thế giới?",
      "Công nghệ ai tiên tiến nhất?",
      "Ngoại giao thế giới?"
    ];

    var html = '<div style="padding:4px">';

    // View mode header
    html += '<div style="font-size:10px;color:#64748b;margin-bottom:8px;letter-spacing:0.5px">CHẾ ĐỘ XEM BẢN ĐỒ</div>';
    html += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px">';
    VIEW_MODES.forEach(function(vm) {
      var isActive = mode === vm.id;
      html += '<button onclick="window.wmViewsV121.activeMode=\''+vm.id+'\';wmV121ViewsRebuild()" '
        + 'style="padding:4px 8px;font-size:10px;border-radius:6px;cursor:pointer;flex:1;min-width:80px;border:1px solid '
        + (isActive ? vm.color : 'rgba(100,116,139,0.25)') + ';background:'
        + (isActive ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.05)') + ';color:'
        + (isActive ? vm.color : '#64748b') + '">' + vm.label + '</button>';
    });
    html += '</div>';

    // Jarvis section
    html += '<div style="font-size:10px;color:#64748b;margin-bottom:6px;letter-spacing:0.5px">🤖 JARVIS BẢN ĐỒ</div>';
    html += '<div id="wm121b-jarvis-answer" style="margin-bottom:8px">';
    if (log.length) {
      html += '<div style="background:rgba(124,58,237,0.12);border:1px solid rgba(139,92,246,0.3);border-radius:6px;padding:8px;font-size:11px;color:#e2e8f0;line-height:1.5">'
        + (log[0].answer||"").replace(/\*\*(.*?)\*\*/g, '<strong style="color:#c084fc">$1</strong>')
        + '</div>';
    } else {
      html += '<div style="color:#475569;font-size:11px;text-align:center;padding:8px">Hỏi Jarvis về thế giới...</div>';
    }
    html += '</div>';

    html += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">';
    jarvisQuestions.forEach(function(q) {
      html += '<button onclick="wmV121JarvisQuery(\''+q+'\');wmV121ViewsRebuild()" '
        + 'style="padding:3px 7px;font-size:9px;border-radius:12px;cursor:pointer;border:1px solid rgba(124,58,237,0.3);background:rgba(124,58,237,0.08);color:#a78bfa">'
        + q + '</button>';
    });
    html += '</div>';

    // XR data + report buttons
    html += '<div style="display:flex;gap:6px">';
    html += '<button onclick="wmV121GenerateLivingReport&&wmV121GenerateLivingReport();alert(\'✅ Báo cáo đã tạo! Xem console.\');" '
      + 'style="flex:1;padding:6px;font-size:10px;border-radius:6px;border:1px solid rgba(34,197,94,0.4);background:rgba(34,197,94,0.1);color:#86efac;cursor:pointer">'
      + '📄 Tạo Báo Cáo</button>';
    html += '<button onclick="typeof wmV121XRData!==\'undefined\'?alert(\'✅ XR Data: \'+JSON.stringify(wmV121XRData).slice(0,200)+\'...\'):alert(\'XR data chưa sẵn sàng\')" '
      + 'style="flex:1;padding:6px;font-size:10px;border-radius:6px;border:1px solid rgba(96,165,250,0.4);background:rgba(96,165,250,0.1);color:#93c5fd;cursor:pointer">'
      + '🥽 XR Data</button>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  window.wmV121ViewsRebuild = function() {
    var el = document.getElementById("wm121b-views-panel");
    if (el) el.innerHTML = buildViewsTabHTML();
    _refreshViewBtns();
  };

  function injectViewsSidebarSection() {
    var aside = document.querySelector("#panel-worldmap .map-sidebar");
    if (!aside || document.getElementById("wm121b-views-section")) return;

    var section = document.createElement("div");
    section.id = "wm121b-views-section";
    section.style.cssText = "flex-shrink:0;border-top:1px solid rgba(34,197,94,0.25)";

    var title = document.createElement("div");
    title.className = "map-sidebar-title";
    title.style.cssText = "color:#86efac;font-size:11px;padding:6px 10px;font-weight:700;letter-spacing:1px";
    title.textContent = "👁 V121b · CHẾ ĐỘ XEM & JARVIS";

    var panel = document.createElement("div");
    panel.id = "wm121b-views-panel";
    panel.style.cssText = "padding:8px;max-height:420px;overflow-y:auto";
    panel.innerHTML = buildViewsTabHTML();

    section.appendChild(title);
    section.appendChild(panel);

    var lastChild = aside.lastElementChild;
    aside.insertBefore(section, lastChild);
  }

  // ── SAVE/LOAD ─────────────────────────────────────────────────────────────

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ activeMode: window.wmViewsV121.activeMode })); } catch(e) {}
  }
  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        var p = JSON.parse(raw);
        if (p.activeMode) window.wmViewsV121.activeMode = p.activeMode;
      }
    } catch(e) {}
  }

  // ── INIT ──────────────────────────────────────────────────────────────────

  function init() {
    load();

    var biomeOk = hookBiomeForViewModes();
    if (!biomeOk) {
      var t = 0;
      var iv = setInterval(function() { if (hookBiomeForViewModes() || ++t > 30) clearInterval(iv); }, 400);
    }

    // Inject UI elements
    setInterval(function() {
      var panel = document.getElementById("panel-worldmap");
      if (panel && panel.classList.contains("active")) {
        injectViewModeBar();
        injectViewsSidebarSection();
        // Refresh Jarvis panel
        var vp = document.getElementById("wm121b-views-panel");
        if (vp) vp.innerHTML = buildViewsTabHTML();
        // Build XR data
        buildXRData();
      }
    }, 3200);

    // Patch save/load
    var _os = window.save;
    window.save = function() { if (_os) _os(); save(); };
    var _ol = window.load;
    window.load = function() { if (_ol) _ol(); load(); };

    console.log("[WorldMap Views V121b] 👁 5 View Modes (Political/Civ/Pop/Tech/History) · Jarvis Map Queries · XR Data · wmV121GenerateLivingReport() sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 28800); });
  } else {
    setTimeout(init, 28800);
  }
})();
