(function() {
  "use strict";
  const SAVE_KEY = "cgv6_worldmap_civ_v121";

  window.wmCivV121 = {
    civZones: {},       // civId -> {x,y,radius,color,name,stage,pop,cities:[]}
    warFronts: [],      // [{ax,ay,dx,dy,year,status}]
    disasterMarkers: [],// [{x,y,type,name,year}]
    visible: { civs: true, wars: true, disasters: true, cities: true },
    lastBuildYear: -1,
    lastBuildCivCount: -1
  };

  var CIV_STAGE_RADIUS = { tribe: 4.5, town: 6, city: 7.5, kingdom: 9.5, empire: 13 };
  var DISASTER_ICONS = { earthquake:"🌋", volcano:"🌋", drought:"☀️", flood:"🌊", storm:"⛈️", fire:"🔥", plague:"☠️", unknown:"⚠️" };

  // Deterministic position for civ (based on cecV95Data index, spread evenly)
  function civBasePos(idx, total) {
    var total2 = Math.max(1, total);
    var angle = (idx / total2) * Math.PI * 2;
    var r = 25 + (idx % 3) * 10;
    return {
      x: 50 + r * Math.cos(angle),
      y: 50 + r * Math.sin(angle) * 0.7
    };
  }

  function buildCivZones() {
    var d = window.wmCivV121;
    var yr = (typeof year !== "undefined") ? year : 0;
    var civs = (typeof window.cecV95Data !== "undefined" && Array.isArray(window.cecV95Data.civs))
      ? window.cecV95Data.civs : [];

    if (d.lastBuildYear === yr && d.lastBuildCivCount === civs.length) return;
    d.lastBuildYear = yr;
    d.lastBuildCivCount = civs.length;
    d.civZones = {};

    civs.forEach(function(civ, idx) {
      var pos = civBasePos(idx, civs.length);
      // Use civ's own territory score to scale radius
      var territoryScore = civ.territory || 1;
      var stageRadius = CIV_STAGE_RADIUS[civ.stageId] || 6;
      var radius = stageRadius + Math.min(15, territoryScore * 0.4);

      // Derive color from civ.color or fallback
      var color = civ.color || ("#" + ((idx * 61 + 137) % 0xFFFFFF).toString(16).padStart(6,"0"));

      // Build city list from civ.cities
      var cities = (civ.cities || []).map(function(c, ci) {
        var ang = (ci / Math.max(1, civ.cities.length)) * Math.PI * 2;
        var cr = radius * 0.55;
        return {
          name: c.name || ("Thành " + (ci+1)),
          isCapital: c.isCapital || ci === 0,
          pop: c.pop || 0,
          age: yr - (c.yr || yr),
          x: pos.x + cr * Math.cos(ang),
          y: pos.y + cr * Math.sin(ang) * 0.75
        };
      });

      d.civZones[civ.id] = {
        id: civ.id,
        name: civ.name || "Văn Minh",
        color: color,
        x: pos.x, y: pos.y,
        radius: radius,
        stage: civ.stageLabel || civ.stageId || "tribe",
        stageIcon: civ.stageIcon || "🏕️",
        pop: civ.population || 0,
        tech: civ.techPoints || 0,
        cities: cities,
        speciesIcon: civ.speciesIcon || "👥"
      };
    });
  }

  function buildWarFronts() {
    var d = window.wmCivV121;
    var wars = (typeof window.warsActive !== "undefined" && Array.isArray(window.warsActive))
      ? window.warsActive : [];
    var civs = d.civZones;
    var civArr = Object.values(civs);

    d.warFronts = [];
    wars.forEach(function(w) {
      if (w.status !== "active") return;
      // Try to find matching civs by name
      var aCiv = civArr.find(function(c) { return c.name.indexOf(w.attacker) >= 0 || (w.attacker||"").indexOf(c.name) >= 0; });
      var dCiv = civArr.find(function(c) { return c.name.indexOf(w.defender) >= 0 || (w.defender||"").indexOf(c.name) >= 0; });

      // Fallback: use positional offset if no match
      var ax = aCiv ? aCiv.x : (20 + wars.indexOf(w) * 15);
      var ay = aCiv ? aCiv.y : 35;
      var dx = dCiv ? dCiv.x : (ax + 20);
      var dy = dCiv ? dCiv.y : (ay + 15);

      d.warFronts.push({
        ax: ax, ay: ay, dx: dx, dy: dy,
        attacker: w.attacker || "?",
        defender: w.defender || "?",
        year: w.startYear || 0,
        reason: w.reason || ""
      });
    });
  }

  function buildDisasterMarkers() {
    var d = window.wmCivV121;
    d.disasterMarkers = [];
    var civArr = Object.values(d.civZones);

    function addFromSource(src, typeKey) {
      if (!src) return;
      var items = Array.isArray(src) ? src : (src.active || []);
      (items || []).forEach(function(ev, idx) {
        var assignedCiv = civArr[idx % Math.max(1, civArr.length)];
        d.disasterMarkers.push({
          x: assignedCiv ? assignedCiv.x + (idx%3 - 1)*6 : 20 + idx*8,
          y: assignedCiv ? assignedCiv.y + (idx%2)*5 : 30 + idx*5,
          type: ev.type || typeKey,
          name: ev.name || ev.title || ev.type || "Thảm Họa",
          year: ev.year || ev.startYear || 0,
          severity: ev.severity || ev.level || 1
        });
      });
    }

    addFromSource(typeof window.disasterData !== "undefined" ? window.disasterData.active : null, "earthquake");
    addFromSource(typeof window.plagueData !== "undefined" ? window.plagueData.active : null, "plague");
    addFromSource(typeof window.econCrisisData !== "undefined" ? window.econCrisisData.active : null, "drought");
  }

  // ── DRAW CIV TERRITORIES ──────────────────────────────────────────────────

  function hexToRgb(hex) {
    var r = parseInt(hex.slice(1,3),16)||80;
    var g = parseInt(hex.slice(3,5),16)||80;
    var b = parseInt(hex.slice(5,7),16)||80;
    return r+","+g+","+b;
  }

  function drawCivLayer(ctx, sw, sh, wx, wy, z) {
    var civs = window.wmCivV121.civZones;
    Object.values(civs).forEach(function(civ) {
      var cx = wx(civ.x), cy = wy(civ.y);
      var rad = wx(civ.radius);
      var rgb = hexToRgb(civ.color);

      // Territory blob
      var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      grad.addColorStop(0,   "rgba("+rgb+",0.28)");
      grad.addColorStop(0.65,"rgba("+rgb+",0.15)");
      grad.addColorStop(1,   "rgba("+rgb+",0.02)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI*2);
      ctx.fill();

      // Border ring
      ctx.strokeStyle = "rgba("+rgb+",0.55)";
      ctx.lineWidth = Math.max(1, z * 1.2);
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI*2);
      ctx.stroke();
      ctx.setLineDash([]);

      if (z >= 0.5) {
        // Civ label
        ctx.fillStyle = civ.color;
        ctx.font = "bold " + Math.max(9, Math.round(11*z)) + "px Cinzel,serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(civ.speciesIcon + " " + civ.name, cx, cy - rad*0.65);

        // Stage badge
        if (z >= 0.7) {
          ctx.font = Math.max(8, Math.round(9*z)) + "px sans-serif";
          ctx.fillStyle = "rgba(255,255,255,0.65)";
          ctx.fillText(civ.stageIcon + " " + civ.stage, cx, cy - rad*0.65 + Math.max(12, 14*z));
        }
      }
    });
  }

  function drawCivCities(ctx, sw, sh, wx, wy, z) {
    if (!window.wmCivV121.visible.cities) return;
    var civs = window.wmCivV121.civZones;
    Object.values(civs).forEach(function(civ) {
      civ.cities.forEach(function(ct) {
        var cx = wx(ct.x), cy = wy(ct.y);
        var r = ct.isCapital ? Math.max(4, 5*z) : Math.max(2.5, 3.5*z);
        var rgb = hexToRgb(civ.color);

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI*2);
        ctx.fillStyle = ct.isCapital ? civ.color : "rgba("+rgb+",0.7)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 0.8;
        ctx.stroke();

        if (z >= 0.8) {
          ctx.font = (ct.isCapital ? "bold " : "") + Math.max(7, Math.round(8.5*z)) + "px Cinzel,serif";
          ctx.fillStyle = ct.isCapital ? "#facc15" : "rgba(255,255,255,0.7)";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          var label = (ct.isCapital ? "★ " : "") + ct.name;
          ctx.fillText(label, cx, cy + r + 2);
          if (z >= 1.1 && ct.pop > 0) {
            ctx.font = Math.max(6, Math.round(7.5*z)) + "px sans-serif";
            ctx.fillStyle = "rgba(200,220,255,0.6)";
            ctx.fillText("👥 " + (ct.pop > 1000 ? (ct.pop/1000).toFixed(0)+"k" : ct.pop), cx, cy + r + 2 + Math.round(9*z));
          }
        }
      });
    });
  }

  function drawWarFronts(ctx, sw, sh, wx, wy, z) {
    if (!window.wmCivV121.visible.wars) return;
    var now = Date.now() / 1000;
    window.wmCivV121.warFronts.forEach(function(wf) {
      var ax = wx(wf.ax), ay = wy(wf.ay);
      var dx = wx(wf.dx), dy = wy(wf.dy);
      var mid = { x: (ax+dx)/2, y: (ay+dy)/2 };

      // Animated pulse alpha
      var pulse = 0.5 + 0.35 * Math.sin(now * 2.5 + wf.year * 0.3);

      // War line (dashed red)
      ctx.strokeStyle = "rgba(239,68,68," + pulse + ")";
      ctx.lineWidth = Math.max(1.5, 2.5*z);
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(dx, dy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Contested zone circle at midpoint
      var cRad = Math.max(8, 18 * z);
      var grd = ctx.createRadialGradient(mid.x, mid.y, 0, mid.x, mid.y, cRad);
      grd.addColorStop(0, "rgba(239,68,68," + (pulse*0.45) + ")");
      grd.addColorStop(1, "rgba(239,68,68,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(mid.x, mid.y, cRad, 0, Math.PI*2);
      ctx.fill();

      // ⚔️ icon
      if (z >= 0.5) {
        ctx.font = Math.max(10, 14*z) + "px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⚔️", mid.x, mid.y);
      }

      // Label
      if (z >= 0.85) {
        ctx.font = Math.max(8, 9*z) + "px sans-serif";
        ctx.fillStyle = "rgba(252,165,165,0.9)";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(wf.attacker + " vs " + wf.defender, mid.x, mid.y + Math.max(10, 14*z) + 2);
      }
    });
  }

  function drawDisasterMarkers(ctx, sw, sh, wx, wy, z) {
    if (!window.wmCivV121.visible.disasters) return;
    var now = Date.now() / 1000;
    window.wmCivV121.disasterMarkers.forEach(function(ev, idx) {
      var cx = wx(ev.x), cy = wy(ev.y);
      var pulse = 0.6 + 0.35 * Math.sin(now * 1.8 + idx * 1.1);
      var icon = DISASTER_ICONS[ev.type] || "⚠️";

      // Glow
      var r = Math.max(6, (6 + ev.severity * 2) * z);
      var grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grd.addColorStop(0, "rgba(251,146,60," + (pulse*0.5) + ")");
      grd.addColorStop(1, "rgba(251,146,60,0)");
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();

      if (z >= 0.4) {
        ctx.font = Math.max(10, 12*z) + "px sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(icon, cx, cy);
      }
      if (z >= 0.9) {
        ctx.font = Math.max(7, 8*z) + "px sans-serif";
        ctx.fillStyle = "rgba(253,186,116,0.85)";
        ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillText(ev.name, cx, cy + Math.max(8, 10*z));
      }
    });
  }

  // ── HOOK INTO EXISTING drawMap ────────────────────────────────────────────

  function hookDraw() {
    if (typeof window.drawCountries !== "function") return false;

    var _origCountries = window.drawCountries;
    window.drawCountries = function(ctx, md, wx, wy, z) {
      // Draw V121 civ territories BEFORE countries
      if (window.wmCivV121.visible.civs) {
        buildCivZones();
        buildWarFronts();
        buildDisasterMarkers();
        var sw = ctx.canvas.width / ((typeof mapState !== "undefined" ? mapState.zoom : 1) || 1);
        var sh = ctx.canvas.height / ((typeof mapState !== "undefined" ? mapState.zoom : 1) || 1);
        drawCivLayer(ctx, sw, sh, wx, wy, z);
        drawCivCities(ctx, sw, sh, wx, wy, z);
        drawWarFronts(ctx, sw, sh, wx, wy, z);
        drawDisasterMarkers(ctx, sw, sh, wx, wy, z);
      }
      _origCountries.apply(this, arguments);
    };
    return true;
  }

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ visible: window.wmCivV121.visible }));
    } catch(e) {}
  }
  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        var p = JSON.parse(raw);
        if (p.visible) Object.assign(window.wmCivV121.visible, p.visible);
      }
    } catch(e) {}
  }

  // Expose toggles
  window.wmToggleCivLayer = function(layer) {
    var vis = window.wmCivV121.visible;
    if (layer in vis) { vis[layer] = !vis[layer]; save(); }
  };

  function patchSaveLoad() {
    var _os = window.save;
    window.save = function() { if (_os) _os(); save(); };
    var _ol = window.load;
    window.load = function() { if (_ol) _ol(); load(); };
  }

  function init() {
    load();
    var ok = hookDraw();
    if (!ok) {
      var t = 0;
      var iv = setInterval(function() { if (hookDraw() || ++t > 30) clearInterval(iv); }, 400);
    }
    patchSaveLoad();
    console.log("[WorldMap Civ V121] 🏛️ Civ Territory Engine khởi động — Lãnh thổ văn minh · Mặt trận chiến tranh · Thảm họa tự nhiên · Thành phố sống.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 28600); });
  } else {
    setTimeout(init, 28600);
  }
})();
