(function() {
  "use strict";
  const SAVE_KEY = "cgv6_worldmap_terrain_v121";
  const GRID = 22;

  const TERRAIN_COLORS = [
    "rgba(12,45,110,0.42)",   // 0 ocean
    "rgba(65,125,45,0.30)",   // 1 plains
    "rgba(18,75,32,0.38)",    // 2 forest
    "rgba(190,150,45,0.32)",  // 3 desert
    "rgba(105,88,70,0.38)",   // 4 mountain
    "rgba(25,105,195,0.48)"   // 5 river
  ];

  const TERRAIN_NAMES = ["Đại Dương","Đồng Bằng","Rừng Rậm","Sa Mạc","Núi Non","Sông Ngòi"];
  const TERRAIN_ICONS = ["🌊","🌾","🌲","🏜️","⛰️","🏞️"];

  window.wmTerrainV121 = { grid: [], worldId: null, visible: true };

  function strHash(s) {
    var h = 0;
    for (var i = 0; i < (s||"").length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    return Math.abs(h) || 12345;
  }

  function seededRand(seed) {
    seed = seed | 0;
    return function() {
      seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function generateTerrain(wid) {
    var rand = seededRand(strHash(String(wid)));
    var grid = [];
    // weighted terrain distribution
    var pool = [0,0,1,1,1,1,2,2,3,3,4,4,5];
    for (var r = 0; r < GRID; r++) {
      grid[r] = [];
      for (var c = 0; c < GRID; c++) {
        var edge = Math.min(r, GRID-1-r, c, GRID-1-c);
        var t;
        if (edge <= 1 && rand() < 0.55) {
          t = 0; // ocean bias at edges
        } else {
          t = pool[Math.floor(rand() * pool.length)];
        }
        grid[r][c] = t;
      }
    }
    // Carve 2–3 river paths
    for (var ri = 0; ri < 3; ri++) {
      var col = 2 + Math.floor(rand() * (GRID - 4));
      var curR = 0;
      while (curR < GRID) {
        grid[curR][Math.max(0, Math.min(GRID-1, col))] = 5;
        col += Math.floor(rand() * 3) - 1;
        curR++;
      }
    }
    return grid;
  }

  function ensureTerrain() {
    var wid = (typeof world !== "undefined" && world) ? (world.id || world.name || "world0") : "world0";
    var d = window.wmTerrainV121;
    if (d.worldId !== wid || !d.grid.length) {
      d.grid = generateTerrain(wid);
      d.worldId = wid;
      save();
    }
  }

  // Expose for other V121 modules
  window.wmGetTerrainAt = function(x, y) {
    var d = window.wmTerrainV121;
    if (!d.grid || !d.grid.length) return 1;
    var col = Math.max(0, Math.min(GRID-1, Math.floor(x / 100 * GRID)));
    var row = Math.max(0, Math.min(GRID-1, Math.floor(y / 100 * GRID)));
    return d.grid[row][col] || 1;
  };

  window.wmTerrainNameAt = function(x, y) {
    return TERRAIN_NAMES[window.wmGetTerrainAt(x, y)] || "Đồng Bằng";
  };

  window.wmToggleTerrain = function() {
    window.wmTerrainV121.visible = !window.wmTerrainV121.visible;
    save();
  };

  window.wmRegenTerrain = function() {
    window.wmTerrainV121.worldId = null;
    ensureTerrain();
  };

  function hookDraw() {
    if (typeof window.drawBiomeBackground !== "function") return false;
    var _orig = window.drawBiomeBackground;
    window.drawBiomeBackground = function(ctx, sw, sh, md, wx, wy) {
      if (window.wmTerrainV121.visible) {
        ensureTerrain();
        var grid = window.wmTerrainV121.grid;
        var cw = sw / GRID, ch = sh / GRID;
        for (var r = 0; r < GRID; r++) {
          for (var c = 0; c < GRID; c++) {
            ctx.fillStyle = TERRAIN_COLORS[grid[r][c]] || TERRAIN_COLORS[1];
            ctx.fillRect(c * cw, r * ch, cw + 0.5, ch + 0.5);
          }
        }
      }
      _orig.apply(this, arguments);
    };
    return true;
  }

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        worldId: window.wmTerrainV121.worldId,
        grid: window.wmTerrainV121.grid,
        visible: window.wmTerrainV121.visible
      }));
    } catch(e) {}
  }

  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      var p = JSON.parse(raw);
      if (p.worldId) window.wmTerrainV121.worldId = p.worldId;
      if (p.grid && p.grid.length === GRID) window.wmTerrainV121.grid = p.grid;
      if (typeof p.visible === "boolean") window.wmTerrainV121.visible = p.visible;
    } catch(e) {}
  }

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
    console.log("[WorldMap Terrain V121] 🌍 Terrain Engine khởi động — " + GRID + "×" + GRID + " grid · 6 loại địa hình · Seed từ worldId.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 28500); });
  } else {
    setTimeout(init, 28500);
  }
})();
