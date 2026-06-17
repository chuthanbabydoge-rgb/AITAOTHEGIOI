(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════
  // VISUAL MAP ENGINE — V127
  // Bản đồ thế giới trực quan — địa hình màu sắc, lãnh thổ, chiến tranh
  // Hoạt động độc lập với V121, inject canvas riêng vào panel worldmap
  // Init: 30800ms
  // ═══════════════════════════════════════════════════════════════

  var _canvas = null, _ctx = null, _raf = null, _t = 0;
  var _grid = null;      // 22x22 terrain grid từ wmTerrainV121
  var _mounted = false;

  // ── Màu địa hình ─────────────────────────────────────────────────
  var TERRAIN = {
    0: { name:"Đại Dương", color:"#0a2a4a", deep:"#061a30", glow:"rgba(30,100,200,0.3)" },
    1: { name:"Đồng Bằng", color:"#1a3d1a", deep:"#122812", glow:"rgba(40,160,40,0.2)" },
    2: { name:"Rừng",      color:"#0d2b0d", deep:"#091a09", glow:"rgba(20,120,20,0.25)" },
    3: { name:"Sa Mạc",    color:"#3d2e0a", deep:"#261d06", glow:"rgba(200,150,50,0.2)" },
    4: { name:"Núi",       color:"#252525", deep:"#181818", glow:"rgba(150,150,150,0.2)" },
    5: { name:"Sông",      color:"#0a3060", deep:"#061c40", glow:"rgba(50,150,255,0.3)" },
  };

  // ── Màu chính phủ ────────────────────────────────────────────────
  var GOV_COLORS = [
    "#e74c3c","#3498db","#2ecc71","#9b59b6","#f39c12",
    "#1abc9c","#e67e22","#34495e","#c0392b","#16a085",
    "#8e44ad","#d35400","#27ae60","#2980b9","#f1c40f",
  ];

  // ── Build hoặc lấy terrain grid ─────────────────────────────────
  function getGrid() {
    // Ưu tiên V121 terrain
    if (window.wmTerrainV121 && window.wmTerrainV121.grid &&
        Array.isArray(window.wmTerrainV121.grid) && window.wmTerrainV121.grid.length === 22) {
      return window.wmTerrainV121.grid;
    }
    // Tạo terrain từ world genre
    var genre = ((window.world && (window.world.genre || window.world.templateKey)) || "cultivation").toLowerCase();
    var grid = [];
    for (var r = 0; r < 22; r++) {
      var row = [];
      for (var c = 0; c < 22; c++) {
        var v;
        var n = Math.sin(r*1.7+c*2.3)*Math.cos(r*0.9+c*1.1);
        var dist = Math.sqrt((r-11)*(r-11)+(c-11)*(c-11));
        if (genre.includes("ocean") || genre.includes("naval")) {
          v = n < 0.1 ? 0 : (n < 0.4 ? 1 : (n < 0.6 ? 2 : 4));
        } else if (genre.includes("desert") || genre.includes("sand")) {
          v = dist > 9 ? 0 : (n < 0.5 ? 3 : (n < 0.7 ? 1 : 4));
        } else {
          v = dist > 10 ? 0 : (n < -0.3 ? 0 : (n < 0 ? 5 : (n < 0.3 ? 1 : (n < 0.5 ? 2 : (n < 0.7 ? 4 : 3)))));
        }
        row.push(v);
      }
      grid.push(row);
    }
    return grid;
  }

  // ── Lấy dữ liệu quốc gia ─────────────────────────────────────────
  function getCountries() {
    var c = window.countries || [];
    if (!Array.isArray(c)) c = [];
    return c.slice(0, 30);
  }

  // ── Lấy chiến tranh đang diễn ra ────────────────────────────────
  function getWars() {
    var w = window.warsActive || window.activeWars || [];
    if (!Array.isArray(w)) w = [];
    return w.slice(0, 20);
  }

  // ─────────────────────────────────────────────────────────────────
  // DRAW FUNCTIONS
  // ─────────────────────────────────────────────────────────────────

  function drawTerrain(ctx, W, H, grid) {
    if (!grid) return;
    var cellW = W / 22, cellH = H / 22;
    for (var r = 0; r < 22; r++) {
      for (var c = 0; c < 22; c++) {
        var type = grid[r][c] || 0;
        var t = TERRAIN[type] || TERRAIN[1];
        var x = c * cellW, y = r * cellH;
        // Base color
        ctx.fillStyle = t.color;
        ctx.fillRect(x, y, cellW+1, cellH+1);
        // Subtle gradient variation
        var shade = Math.sin(r*1.7+c*2.3)*0.08;
        ctx.fillStyle = "rgba(0,0,0," + Math.max(0,shade) + ")";
        ctx.fillRect(x, y, cellW+1, cellH+1);
      }
    }
  }

  function drawTerrainBorders(ctx, W, H, grid) {
    if (!grid) return;
    var cellW = W / 22, cellH = H / 22;
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 0.5;
    for (var r = 0; r < 22; r++) {
      for (var c = 0; c < 22; c++) {
        var cur = grid[r][c];
        if (c < 21 && grid[r][c+1] !== cur) {
          ctx.beginPath();
          ctx.moveTo((c+1)*cellW, r*cellH);
          ctx.lineTo((c+1)*cellW, (r+1)*cellH);
          ctx.stroke();
        }
        if (r < 21 && grid[r+1][c] !== cur) {
          ctx.beginPath();
          ctx.moveTo(c*cellW, (r+1)*cellH);
          ctx.lineTo((c+1)*cellW, (r+1)*cellH);
          ctx.stroke();
        }
      }
    }
  }

  function drawCivTerritories(ctx, W, H, countries, t) {
    if (!countries || !countries.length) return;
    var civZones = window.wmCivV121 && window.wmCivV121.civZones;
    countries.forEach(function(c, i) {
      var color = GOV_COLORS[i % GOV_COLORS.length];
      var r = parseInt(color.slice(1,3),16);
      var g = parseInt(color.slice(3,5),16);
      var b = parseInt(color.slice(5,7),16);

      var cx, cy, radius;
      if (civZones && civZones[c.id]) {
        var z = civZones[c.id];
        cx = z.x * W; cy = z.y * H;
        radius = (z.radius || 0.08) * Math.min(W,H);
      } else {
        // Phân bổ theo index
        var angle = (i / countries.length) * Math.PI * 2;
        var dist  = 0.25 + (i % 3) * 0.1;
        cx = W*0.5 + Math.cos(angle)*W*dist;
        cy = H*0.5 + Math.sin(angle)*H*dist;
        var pop = c.population || 1000;
        radius = Math.min(Math.max(Math.sqrt(pop/50), 20), W*0.18);
      }

      // Territory fill (radial gradient)
      var tg = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      tg.addColorStop(0, "rgba("+r+","+g+","+b+",0.35)");
      tg.addColorStop(0.6, "rgba("+r+","+g+","+b+",0.15)");
      tg.addColorStop(1, "rgba("+r+","+g+","+b+",0)");
      ctx.fillStyle = tg;
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI*2); ctx.fill();

      // Border ring (pulsing)
      var pulse = 0.5 + 0.5*Math.sin(t*0.03 + i*0.7);
      ctx.strokeStyle = "rgba("+r+","+g+","+b+","+(0.4+pulse*0.3)+")";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6,4]);
      ctx.beginPath(); ctx.arc(cx, cy, radius*0.85, 0, Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);

      // Capital dot + name
      ctx.fillStyle = "rgba("+r+","+g+","+b+",0.9)";
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI*2); ctx.fill();

      // Country name
      if (radius > 25) {
        ctx.save();
        ctx.shadowColor = "#000"; ctx.shadowBlur = 4;
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = "bold " + Math.max(9, Math.min(13, radius*0.22)) + "px Cinzel, serif";
        ctx.textAlign = "center";
        var name = c.name || ("QG "+i);
        if (name.length > 10) name = name.substring(0,9)+"…";
        ctx.fillText(name, cx, cy - 9);
        ctx.font = "10px Noto Serif, serif";
        ctx.fillStyle = "rgba(200,200,200,0.8)";
        ctx.fillText("👥 " + fmtN(c.population||0), cx, cy+16);
        ctx.textAlign = "left";
        ctx.restore();
      }
    });
  }

  function drawWarFronts(ctx, W, H, wars, countries, t) {
    if (!wars || !wars.length) return;
    wars.forEach(function(war, wi) {
      var a = findCountryPos(war.attackerId || war.attacker, countries, W, H, wi);
      var d = findCountryPos(war.defenderId || war.defender, countries, W, H, wi+5);
      if (!a || !d) return;

      // War line (pulsing red)
      var pulse = 0.4 + 0.6*Math.abs(Math.sin(t*0.04 + wi));
      var dash  = Math.floor(t*0.3 + wi*10) % 20;

      ctx.strokeStyle = "rgba(220,50,50,"+pulse+")";
      ctx.lineWidth = 2;
      ctx.setLineDash([8,6]);
      ctx.lineDashOffset = -dash;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(d.x, d.y); ctx.stroke();
      ctx.setLineDash([]); ctx.lineDashOffset = 0;

      // Explosion icon at midpoint
      var mx = (a.x+d.x)/2, my = (a.y+d.y)/2;
      ctx.font = "14px serif";
      ctx.textAlign = "center";
      ctx.fillText("⚔️", mx, my+5);
      ctx.textAlign = "left";
    });
  }

  function findCountryPos(id, countries, W, H, fallbackI) {
    var civZones = window.wmCivV121 && window.wmCivV121.civZones;
    if (civZones && id && civZones[id]) {
      return { x: civZones[id].x*W, y: civZones[id].y*H };
    }
    // Tìm theo index trong countries
    var idx = -1;
    for (var i = 0; i < countries.length; i++) {
      if (countries[i].id == id || countries[i].name == id) { idx = i; break; }
    }
    if (idx < 0) idx = fallbackI % Math.max(1, countries.length);
    var angle = (idx / Math.max(1,countries.length)) * Math.PI*2;
    var dist  = 0.25 + (idx%3)*0.1;
    return { x: W*0.5+Math.cos(angle)*W*dist, y: H*0.5+Math.sin(angle)*H*dist };
  }

  function drawDisasters(ctx, W, H, t) {
    var disasters = window.disasterData && window.disasterData.active;
    if (!disasters || !disasters.length) return;
    disasters.slice(0,8).forEach(function(d, i) {
      var dx = (0.1+i*0.12)*W + Math.sin(t*0.02+i)*5;
      var dy = (0.3+Math.cos(i*1.7)*0.25)*H;
      var icons = { earthquake:"🌋", flood:"🌊", drought:"☀️", plague:"💀", storm:"⛈️" };
      var icon = icons[d.type] || "🌋";
      var pulse = 0.7 + 0.3*Math.sin(t*0.08+i);
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.font = "16px serif";
      ctx.textAlign = "center";
      ctx.fillText(icon, dx, dy);
      ctx.textAlign = "left";
      ctx.restore();
    });
  }

  function drawLegend(ctx, W, H) {
    var legendX = W - 130, legendY = 8;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    roundRect(ctx, legendX-6, legendY-4, 128, Object.keys(TERRAIN).length*16+20, 8);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "10px Cinzel, serif";
    ctx.fillText("ĐỊA HÌNH", legendX, legendY+10);
    ctx.font = "10px Noto Serif, serif";
    Object.keys(TERRAIN).forEach(function(k, i) {
      var t = TERRAIN[k];
      ctx.fillStyle = t.color;
      ctx.fillRect(legendX, legendY+14+i*16, 10, 10);
      ctx.fillStyle = "rgba(220,220,220,0.85)";
      ctx.fillText(t.name, legendX+14, legendY+23+i*16);
    });
  }

  function drawHUD(ctx, W, H) {
    var w = window.world;
    if (!w) return;
    var countries = getCountries();
    var wars = getWars();
    var yr = typeof window.year !== "undefined" ? window.year : 1;

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    roundRect(ctx, 8, 8, 210, 65, 8);
    ctx.fill();

    ctx.fillStyle = "#facc15";
    ctx.font = "bold 13px Cinzel, serif";
    ctx.fillText((w.name || "Thế Giới").substring(0,18), 16, 27);

    ctx.fillStyle = "rgba(200,200,200,0.85)";
    ctx.font = "11px Noto Serif, serif";
    ctx.fillText("📅 Năm " + fmtN(yr) + "  ·  🏳️ " + countries.length + " quốc gia", 16, 44);
    ctx.fillText("⚔️ " + wars.length + " chiến tranh  ·  " + ((w.genre||w.templateKey||"")).toUpperCase(), 16, 60);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
    ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
    ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
    ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
    ctx.closePath();
  }

  function fmtN(n) { return (n||0).toLocaleString("vi-VN"); }

  // ─────────────────────────────────────────────────────────────────
  // MAIN LOOP
  // ─────────────────────────────────────────────────────────────────
  function renderMap() {
    if (!_canvas || !_ctx) return;
    var W = _canvas.width, H = _canvas.height;
    var countries = getCountries();
    var wars = getWars();

    _ctx.clearRect(0, 0, W, H);

    // 1. Terrain
    if (!_grid) _grid = getGrid();
    drawTerrain(_ctx, W, H, _grid);
    drawTerrainBorders(_ctx, W, H, _grid);

    // 2. Civ territories
    drawCivTerritories(_ctx, W, H, countries, _t);

    // 3. War fronts
    drawWarFronts(_ctx, W, H, wars, countries, _t);

    // 4. Disasters
    drawDisasters(_ctx, W, H, _t);

    // 5. Vignette
    var vg = _ctx.createRadialGradient(W/2, H/2, Math.min(W,H)*0.3, W/2, H/2, Math.min(W,H)*0.72);
    vg.addColorStop(0, "transparent");
    vg.addColorStop(1, "rgba(0,0,0,0.5)");
    _ctx.fillStyle = vg; _ctx.fillRect(0, 0, W, H);

    // 6. HUD + Legend
    drawHUD(_ctx, W, H);
    drawLegend(_ctx, W, H);

    _t++;
    _raf = requestAnimationFrame(renderMap);
  }

  // ─────────────────────────────────────────────────────────────────
  // PANEL INJECTION — tạo visual map panel riêng trong PUOS
  // ─────────────────────────────────────────────────────────────────
  function buildVisualMapPanel() {
    var panelId = "vme127-panel";
    if (document.getElementById(panelId)) return;

    // Tìm container PUOS để inject panel
    var puosContent = document.querySelector(".puos-content") ||
                      document.querySelector("[class*='puos']") ||
                      document.body;

    // Tạo div panel
    var panel = document.createElement("div");
    panel.id = panelId;
    panel.style.cssText = [
      "position:fixed;inset:0;z-index:99998",
      "background:#050810",
      "display:none;flex-direction:column",
    ].join(";");

    panel.innerHTML = [
      // Header
      '<div style="display:flex;align-items:center;gap:12px;padding:14px 20px;background:#0a0f1a;border-bottom:1px solid rgba(250,204,21,0.15);flex-shrink:0">',
      '<span style="font-family:Cinzel Decorative,serif;font-size:16px;color:#facc15">🗺️ Bản Đồ Thế Giới Trực Quan</span>',
      '<div style="margin-left:auto;display:flex;gap:8px">',
      '<button id="vme127-refresh-btn" style="background:#facc1522;border:1px solid #facc1544;color:#facc15;padding:6px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-family:Cinzel,serif">🔄 Làm mới</button>',
      '<button id="vme127-close-btn" style="background:#1e293b;border:1px solid #334155;color:#94a3b8;padding:6px 14px;border-radius:8px;cursor:pointer;font-size:12px">✕ Đóng</button>',
      '</div></div>',

      // Canvas area
      '<div style="flex:1;display:flex;align-items:stretch;padding:16px;gap:16px;overflow:hidden">',
      '<canvas id="vme127-canvas" style="flex:1;border-radius:12px;border:1px solid rgba(250,204,21,0.1);cursor:crosshair;min-height:400px"></canvas>',

      // Sidebar
      '<div id="vme127-sidebar" style="width:220px;flex-shrink:0;overflow-y:auto;display:flex;flex-direction:column;gap:10px">',
      '</div>',
      '</div>',
    ].join("");

    document.body.appendChild(panel);

    // Events
    document.getElementById("vme127-close-btn").onclick = function() {
      window.vme127Close();
    };
    document.getElementById("vme127-refresh-btn").onclick = function() {
      _grid = null; // reset terrain
    };

    // Canvas hover tooltip
    var canvas = document.getElementById("vme127-canvas");
    canvas.addEventListener("mousemove", function(e) {
      var rect = canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left, my = e.clientY - rect.top;
      var gridC = Math.floor((mx/rect.width)*22);
      var gridR = Math.floor((my/rect.height)*22);
      if (_grid && _grid[gridR] && _grid[gridR][gridC] !== undefined) {
        var terrain = TERRAIN[_grid[gridR][gridC]];
        canvas.title = terrain ? terrain.name : "";
      }
    });
  }

  function mountMapCanvas() {
    var canvas = document.getElementById("vme127-canvas");
    if (!canvas) return;
    _canvas = canvas;
    _canvas.width  = _canvas.clientWidth  || 800;
    _canvas.height = _canvas.clientHeight || 500;
    _ctx = _canvas.getContext("2d");
    _grid = getGrid();
    if (_raf) { cancelAnimationFrame(_raf); _raf = null; }
    renderMap();
    updateSidebar();

    // Resize
    if (window.ResizeObserver) {
      new ResizeObserver(function() {
        if (_canvas) {
          _canvas.width  = _canvas.clientWidth  || 800;
          _canvas.height = _canvas.clientHeight || 500;
        }
      }).observe(_canvas);
    }
  }

  function updateSidebar() {
    var sb = document.getElementById("vme127-sidebar");
    if (!sb) return;
    var countries = getCountries();
    var wars = getWars();

    var html = [];

    // Countries list
    html.push('<div style="background:#0f172a;border:1px solid rgba(250,204,21,0.12);border-radius:10px;padding:12px">');
    html.push('<div style="font-family:Cinzel,serif;font-size:11px;color:#94a3b8;letter-spacing:.08em;margin-bottom:10px">🏳️ QUỐC GIA (' + countries.length + ')</div>');
    countries.slice(0,15).forEach(function(c, i) {
      var color = GOV_COLORS[i%GOV_COLORS.length];
      html.push('<div style="display:flex;align-items:center;gap:7px;margin-bottom:7px">');
      html.push('<div style="width:10px;height:10px;border-radius:50%;background:'+color+';flex-shrink:0"></div>');
      html.push('<div style="flex:1;min-width:0">');
      html.push('<div style="font-size:11px;color:#e8e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+(c.name||"?")+'</div>');
      html.push('<div style="font-size:10px;color:#64748b">👥 '+fmtN(c.population||0)+'</div>');
      html.push('</div></div>');
    });
    html.push('</div>');

    // Wars
    if (wars.length > 0) {
      html.push('<div style="background:#1a0808;border:1px solid rgba(220,50,50,0.2);border-radius:10px;padding:12px">');
      html.push('<div style="font-family:Cinzel,serif;font-size:11px;color:#ef4444;letter-spacing:.08em;margin-bottom:8px">⚔️ CHIẾN TRANH (' + wars.length + ')</div>');
      wars.slice(0,8).forEach(function(w) {
        html.push('<div style="font-size:10px;color:#fca5a5;margin-bottom:5px;padding:5px;background:rgba(220,50,50,0.08);border-radius:5px">');
        html.push((w.attackerName||w.attacker||"?") + ' vs ' + (w.defenderName||w.defender||"?"));
        html.push('</div>');
      });
      html.push('</div>');
    }

    // Terrain legend (mobile)
    html.push('<div style="background:#0f172a;border:1px solid rgba(250,204,21,0.1);border-radius:10px;padding:12px">');
    html.push('<div style="font-family:Cinzel,serif;font-size:11px;color:#94a3b8;letter-spacing:.08em;margin-bottom:8px">🌍 ĐỊA HÌNH</div>');
    Object.keys(TERRAIN).forEach(function(k) {
      var t = TERRAIN[k];
      html.push('<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">');
      html.push('<div style="width:12px;height:12px;border-radius:2px;background:'+t.color+'"></div>');
      html.push('<div style="font-size:10px;color:#94a3b8">'+t.name+'</div>');
      html.push('</div>');
    });
    html.push('</div>');

    sb.innerHTML = html.join("");
  }

  // ─────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────
  window.vme127Open = function() {
    buildVisualMapPanel();
    var panel = document.getElementById("vme127-panel");
    if (!panel) return;
    panel.style.display = "flex";
    setTimeout(mountMapCanvas, 50);
  };

  window.vme127Close = function() {
    var panel = document.getElementById("vme127-panel");
    if (panel) panel.style.display = "none";
    if (_raf) { cancelAnimationFrame(_raf); _raf = null; }
  };

  window.vme127Refresh = function() {
    _grid = null;
    updateSidebar();
  };

  // ─────────────────────────────────────────────────────────────────
  // INJECT NÚT VÀO PUOS + PATCH puosRenderMyUniverse
  // ─────────────────────────────────────────────────────────────────
  function injectMapButton() {
    // Patch puosRenderMyUniverse để thêm nút mở map
    // container = #puos-main element truyền vào từ puosShell
    var _orig = window.puosRenderMyUniverse;
    window.puosRenderMyUniverse = function(container) {
      if (_orig) _orig.apply(this, arguments);
      var target = container || document.getElementById("puos-main");
      if (!target) return;
      setTimeout(function() {
        if (target.querySelector("#vme127-open-btn")) return;
        var btn = document.createElement("button");
        btn.id = "vme127-open-btn";
        btn.textContent = "🗺️ Mở Bản Đồ Thế Giới Trực Quan";
        btn.style.cssText = [
          "display:block;width:calc(100% - 24px);margin:10px 12px 0;padding:13px",
          "background:linear-gradient(135deg,rgba(96,165,250,0.12),rgba(59,130,246,0.06))",
          "border:1px solid rgba(96,165,250,0.3);border-radius:10px",
          "color:#60a5fa;font-size:13px;font-family:Cinzel,serif",
          "cursor:pointer;letter-spacing:.05em;transition:all .2s",
        ].join(";");
        btn.onmouseover = function() { btn.style.background = "rgba(96,165,250,0.2)"; };
        btn.onmouseout  = function() { btn.style.background = "linear-gradient(135deg,rgba(96,165,250,0.12),rgba(59,130,246,0.06))"; };
        btn.onclick = function() { window.vme127Open(); };
        target.appendChild(btn);
      }, 200);
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────────────────────────
  function init() {
    buildVisualMapPanel();
    injectMapButton();
    console.log("[VisualMapEngine V127] 🗺️ Bản đồ trực quan khởi động — Địa hình · Lãnh thổ · Chiến tranh · Live render sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 30800); });
  } else {
    setTimeout(init, 30800);
  }

})();
