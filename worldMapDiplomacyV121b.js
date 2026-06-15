(function() {
  "use strict";
  // V121b — Diplomacy Visualization Layer
  // Wraps drawCountries (after V121 civ layer) to draw alliance/trade/rivalry lines
  // Init: 28750ms · Extends V121 (KHÔNG ghi đè)

  window.wmDiploV121 = {
    lines: [],        // [{ax,ay,dx,dy,type,label}]
    visible: { alliances: true, trade: true, rivals: true, treaties: true },
    lastBuildYear: -1
  };

  // ── BUILD DIPLOMACY LINES ─────────────────────────────────────────────────

  function getCivPos(name) {
    if (!window.wmCivV121) return null;
    var zones = window.wmCivV121.civZones;
    // Try exact match first
    var keys = Object.keys(zones);
    for (var i = 0; i < keys.length; i++) {
      var z = zones[keys[i]];
      if (z.name === name) return { x: z.x, y: z.y };
    }
    // Fuzzy match
    for (var j = 0; j < keys.length; j++) {
      var z2 = zones[keys[j]];
      if (z2.name.indexOf(name) >= 0 || name.indexOf(z2.name) >= 0) return { x: z2.x, y: z2.y };
    }
    return null;
  }

  function getCountryPos(name) {
    if (!window.countries || !Array.isArray(window.countries)) return null;
    var c = window.countries.find(function(cc) { return cc.name === name || (cc.name||"").indexOf(name) >= 0; });
    if (!c) return null;
    // Spread countries in a ring around center
    var idx = window.countries.indexOf(c);
    var total = window.countries.length;
    var angle = (idx / Math.max(1, total)) * Math.PI * 2;
    return { x: 50 + 28 * Math.cos(angle), y: 50 + 20 * Math.sin(angle) };
  }

  function resolvePosFor(name) {
    return getCivPos(name) || getCountryPos(name) || null;
  }

  function buildDiploLines() {
    var d = window.wmDiploV121;
    var yr = (typeof year !== "undefined") ? year : 0;
    if (d.lastBuildYear === yr) return;
    d.lastBuildYear = yr;
    d.lines = [];

    // ── ALLIANCES ──────────────────────────────────────────────────────────
    if (typeof window.allianceData !== "undefined") {
      var alliances = Array.isArray(window.allianceData) ? window.allianceData
                    : (window.allianceData.alliances || []);
      alliances.forEach(function(al) {
        if (!al || al.status === "dissolved") return;
        var members = al.members || [al.memberA, al.memberB];
        members = members.filter(Boolean);
        for (var i = 0; i < members.length - 1; i++) {
          var posA = resolvePosFor(members[i]);
          var posB = resolvePosFor(members[i+1]);
          if (!posA || !posB) continue;
          d.lines.push({ ax: posA.x, ay: posA.y, dx: posB.x, dy: posB.y,
            type: "alliance", label: al.name || "Liên Minh" });
        }
      });
    }

    // ── TREATIES ───────────────────────────────────────────────────────────
    if (typeof window.treatyData !== "undefined") {
      var treaties = Array.isArray(window.treatyData) ? window.treatyData
                   : (window.treatyData.treaties || []);
      treaties.forEach(function(tr) {
        if (!tr || tr.status === "broken") return;
        var posA = resolvePosFor(tr.partA || tr.memberA || "");
        var posB = resolvePosFor(tr.partB || tr.memberB || "");
        if (!posA || !posB) return;
        d.lines.push({ ax: posA.x, ay: posA.y, dx: posB.x, dy: posB.y,
          type: "treaty", label: tr.type || "Hiệp Ước" });
      });
    }

    // ── SANCTIONS / RIVALRIES ──────────────────────────────────────────────
    if (typeof window.sanctionData !== "undefined") {
      var sanctions = Array.isArray(window.sanctionData) ? window.sanctionData
                    : (window.sanctionData.sanctions || []);
      sanctions.forEach(function(sc) {
        if (!sc || sc.lifted) return;
        var posA = resolvePosFor(sc.sender || "");
        var posB = resolvePosFor(sc.target || "");
        if (!posA || !posB) return;
        d.lines.push({ ax: posA.x, ay: posA.y, dx: posB.x, dy: posB.y,
          type: "rival", label: sc.reason || "Trừng Phạt" });
      });
    }

    // ── TRADE ROUTES from V54 ──────────────────────────────────────────────
    var tradeData = window.tradeNetworkV54Data || window.tradeNetworkCoreV54Data;
    if (tradeData) {
      var routes = Array.isArray(tradeData) ? tradeData
                 : (tradeData.routes || tradeData.activeRoutes || []);
      routes.forEach(function(rt, idx) {
        if (!rt) return;
        var posA = resolvePosFor(rt.from || rt.origin || rt.cityA || "");
        var posB = resolvePosFor(rt.to || rt.destination || rt.cityB || "");
        if (!posA || !posB) return;
        d.lines.push({ ax: posA.x, ay: posA.y, dx: posB.x, dy: posB.y,
          type: "trade", label: rt.name || rt.good || "Thương Mại" });
      });
    }

    // Fallback: if we have civs but no explicit diplomacy data, draw some inferred lines
    // from allianceEngine V24 helper window.aeAreAllied
    if (typeof window.aeAreAllied === "function" && window.wmCivV121) {
      var zones = Object.values(window.wmCivV121.civZones);
      for (var a = 0; a < zones.length; a++) {
        for (var b = a + 1; b < zones.length; b++) {
          var za = zones[a], zb = zones[b];
          try {
            if (window.aeAreAllied(za.name, zb.name)) {
              // Only add if not already present
              var alreadyHas = d.lines.some(function(l) {
                return l.type === "alliance"
                  && Math.abs(l.ax - za.x) < 2 && Math.abs(l.dx - zb.x) < 2;
              });
              if (!alreadyHas) {
                d.lines.push({ ax: za.x, ay: za.y, dx: zb.x, dy: zb.y,
                  type: "alliance", label: "Đồng Minh" });
              }
            }
          } catch(e) {}

          // Rivalry: if drGetRelation score < -30 → rival
          try {
            if (typeof window.drGetRelation === "function") {
              var score = window.drGetRelation(za.name, zb.name);
              if (typeof score === "number" && score < -30) {
                d.lines.push({ ax: za.x, ay: za.y, dx: zb.x, dy: zb.y,
                  type: "rival", label: "Thù Địch (" + score + ")" });
              }
            }
          } catch(e) {}
        }
      }
    }
  }

  // ── DRAW DIPLOMACY LAYER ──────────────────────────────────────────────────

  var LINE_STYLES = {
    alliance: { color: "rgba(74,222,128,{a})",  dash: [],       width: 1.8, icon: "🤝" },
    treaty:   { color: "rgba(96,165,250,{a})",  dash: [5,3],    width: 1.4, icon: "📜" },
    trade:    { color: "rgba(251,191,36,{a})",  dash: [3,5,1,5],width: 1.2, icon: "💰" },
    rival:    { color: "rgba(248,113,113,{a})", dash: [2,3],    width: 1.5, icon: "💢" }
  };

  function colorWithAlpha(tpl, alpha) {
    return tpl.replace("{a}", alpha.toFixed(2));
  }

  function drawDiploLayer(ctx, wx, wy, z) {
    var d = window.wmDiploV121;
    var vis = d.visible;
    var now = Date.now() / 1000;

    d.lines.forEach(function(ln, idx) {
      var typeKey = ln.type;
      var style = LINE_STYLES[typeKey];
      if (!style) return;
      if (typeKey === "alliance" && !vis.alliances) return;
      if (typeKey === "trade"    && !vis.trade)     return;
      if ((typeKey === "rival" || typeKey === "sanction") && !vis.rivals) return;
      if (typeKey === "treaty"   && !vis.treaties)  return;

      var ax = wx(ln.ax), ay = wy(ln.ay);
      var dx = wx(ln.dx), dy = wy(ln.dy);

      // Animated alpha pulse
      var pulse = 0.55 + 0.3 * Math.sin(now * 1.2 + idx * 0.7);

      ctx.strokeStyle = colorWithAlpha(style.color, pulse);
      ctx.lineWidth = style.width * Math.max(0.8, z);
      ctx.setLineDash(style.dash);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(dx, dy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Midpoint icon
      if (z >= 0.55) {
        var mx = (ax + dx) / 2;
        var my = (ay + dy) / 2;
        ctx.font = Math.max(9, Math.round(10 * z)) + "px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(style.icon, mx, my);

        if (z >= 1.0 && ln.label) {
          ctx.font = Math.max(7, Math.round(7.5 * z)) + "px sans-serif";
          ctx.fillStyle = colorWithAlpha(style.color, 0.8);
          ctx.textBaseline = "top";
          ctx.fillText(ln.label, mx, my + Math.max(9, 10 * z) + 1);
        }
      }
    });
  }

  // ── HOOK INTO drawCountries (AFTER V121 civ hook) ─────────────────────────

  function hookDraw() {
    if (typeof window.drawCountries !== "function") return false;
    var _orig = window.drawCountries;
    window.drawCountries = function(ctx, md, wx, wy, z) {
      _orig.apply(this, arguments);
      // Draw diplomacy AFTER everything else
      buildDiploLines();
      drawDiploLayer(ctx, wx, wy, z);
    };
    return true;
  }

  // ── SIDEBAR EXTENSION — add 🤝 Ngoại Giao tab ────────────────────────────

  function injectDiploTab() {
    var tabParent = document.querySelector("#wm121-sidebar-panel > div:first-child");
    if (!tabParent || document.getElementById("wm121-diplo-tab")) return;
    var btn = document.createElement("button");
    btn.id = "wm121-diplo-tab";
    btn.style.cssText = "flex:1;min-width:70px;padding:4px 6px;font-size:10px;border-radius:6px;cursor:pointer;border:1px solid rgba(74,222,128,0.3);background:rgba(74,222,128,0.08);color:#86efac";
    btn.textContent = "🤝 Ngoại Giao";
    btn.setAttribute("onclick", "window.wmRegistryV121&&(window.wmRegistryV121.activeTab='diplo')&&wmV121RebuildSidebar()");
    tabParent.appendChild(btn);
  }

  // Expose toggle
  window.wmToggleDiplo = function(layer) {
    var vis = window.wmDiploV121.visible;
    if (layer in vis) { vis[layer] = !vis[layer]; }
  };

  // Expose diplo data for report
  window.wmGetDiploStats = function() {
    var lines = window.wmDiploV121.lines;
    return {
      alliances: lines.filter(function(l){ return l.type === "alliance"; }).length,
      trade:     lines.filter(function(l){ return l.type === "trade"; }).length,
      rivals:    lines.filter(function(l){ return l.type === "rival"; }).length,
      treaties:  lines.filter(function(l){ return l.type === "treaty"; }).length
    };
  };

  // ── INIT ──────────────────────────────────────────────────────────────────

  function init() {
    var ok = hookDraw();
    if (!ok) {
      var t = 0;
      var iv = setInterval(function() { if (hookDraw() || ++t > 30) clearInterval(iv); }, 400);
    }

    // Try to inject diplomacy tab after registry sidebar appears
    setInterval(function() {
      var panel = document.getElementById("panel-worldmap");
      if (panel && panel.classList.contains("active")) {
        injectDiploTab();
        // Force rebuild diplo lines
        window.wmDiploV121.lastBuildYear = -1;
        buildDiploLines();
      }
    }, 3500);

    console.log("[WorldMap Diplomacy V121b] 🤝 Ngoại Giao Layer — Alliance Lines · Trade Routes · Rivalries · Treaty Lines · drGetRelation inferred.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 28750); });
  } else {
    setTimeout(init, 28750);
  }
})();
