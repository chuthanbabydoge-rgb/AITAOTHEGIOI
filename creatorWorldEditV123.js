(function() {
  "use strict";

  const TERRAIN = { plains: 1, forest: 2, desert: 3, mountain: 4, water: 5 };
  const TERRAIN_NAMES = { 1: "Đồng Bằng", 2: "Rừng", 3: "Sa Mạc", 4: "Núi", 5: "Biển/Sông" };
  const GRID = 22;

  function getGrid() {
    if (window.wmV121Data && window.wmV121Data.grid) return window.wmV121Data.grid;
    return null;
  }

  function snapGrid() {
    const g = getGrid();
    if (!g) return null;
    const copy = g.map(function(row) { return row.slice(); });
    return window.cpv123MakeSnapshot
      ? window.cpv123MakeSnapshot(function() {
          const grid = getGrid();
          if (!grid) return;
          copy.forEach(function(row, r) { row.forEach(function(v, c) { grid[r][c] = v; }); });
          refreshMap();
        })
      : null;
  }

  function refreshMap() {
    if (typeof window.wmV121Refresh === "function") { window.wmV121Refresh(); return; }
    const canvas = document.querySelector("#panel-WORLD-MAP canvas, #worldMapCanvas");
    if (canvas) {
      const evt = new CustomEvent("wmv121refresh");
      canvas.dispatchEvent(evt);
    }
    if (typeof window.onMapPanelShow === "function") { try { window.onMapPanelShow(); } catch(e) {} }
  }

  function fillArea(centerR, centerC, terrain, radius) {
    const grid = getGrid();
    if (!grid) return 0;
    radius = radius || 1;
    let count = 0;
    for (let r = Math.max(0, centerR - radius); r <= Math.min(GRID-1, centerR + radius); r++) {
      for (let c = Math.max(0, centerC - radius); c <= Math.min(GRID-1, centerC + radius); c++) {
        if (Math.abs(r - centerR) + Math.abs(c - centerC) <= radius) {
          grid[r][c] = terrain;
          count++;
        }
      }
    }
    return count;
  }

  window.cpv123CreateMountain = function(row, col, radius) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    row = row === undefined ? Math.floor(GRID/2) : row;
    col = col === undefined ? Math.floor(GRID/2) : col;
    radius = radius || 2;
    var snap = snapGrid();
    var cells = fillArea(row, col, TERRAIN.mountain, radius);
    refreshMap();
    window.cpv123LogAction("geography", "🏔️ Tạo Dãy Núi tại (" + row + "," + col + ")", cells + " ô địa hình đã chuyển thành núi.", snap);
  };

  window.cpv123CreateRiver = function(startR, startC, length) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    const grid = getGrid();
    if (!grid) return;
    startR = startR === undefined ? Math.floor(GRID/2) : startR;
    startC = startC === undefined ? Math.floor(GRID/2) : startC;
    length = length || 8;
    var snap = snapGrid();
    var r = startR, c = startC;
    for (var i = 0; i < length && r < GRID && c < GRID; i++) {
      grid[r][c] = TERRAIN.water;
      if (Math.random() < 0.6) r++; else c++;
      r = Math.min(r, GRID-1); c = Math.min(c, GRID-1);
    }
    refreshMap();
    window.cpv123LogAction("geography", "🌊 Tạo Dòng Sông từ (" + startR + "," + startC + ")", length + " ô sông đã tạo.", snap);
  };

  window.cpv123CreateSea = function(row, col, radius) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    row = row === undefined ? 4 : row;
    col = col === undefined ? 4 : col;
    radius = radius || 4;
    var snap = snapGrid();
    var cells = fillArea(row, col, TERRAIN.water, radius);
    refreshMap();
    window.cpv123LogAction("geography", "🌊 Tạo Vùng Biển tại (" + row + "," + col + ")", cells + " ô địa hình đã chuyển thành biển.", snap);
  };

  window.cpv123CreateIsland = function(row, col) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    row = row === undefined ? Math.floor(GRID/2) : row;
    col = col === undefined ? Math.floor(GRID/2) : col;
    var snap = snapGrid();
    fillArea(row, col, TERRAIN.water, 3);
    fillArea(row, col, TERRAIN.plains, 1);
    refreshMap();
    window.cpv123LogAction("geography", "🏝️ Tạo Hòn Đảo tại (" + row + "," + col + ")", "Biển 3 ô + đảo giữa.", snap);
  };

  window.cpv123CreateForest = function(row, col, radius) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    row = row === undefined ? Math.floor(GRID/2) : row;
    col = col === undefined ? Math.floor(GRID/2) : col;
    radius = radius || 3;
    var snap = snapGrid();
    var cells = fillArea(row, col, TERRAIN.forest, radius);
    refreshMap();
    window.cpv123LogAction("geography", "🌲 Tạo Rừng Nguyên Sinh tại (" + row + "," + col + ")", cells + " ô địa hình đã chuyển thành rừng.", snap);
  };

  window.cpv123CreateDesert = function(row, col, radius) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    row = row === undefined ? Math.floor(GRID/2) : row;
    col = col === undefined ? Math.floor(GRID/2) : col;
    radius = radius || 3;
    var snap = snapGrid();
    var cells = fillArea(row, col, TERRAIN.desert, radius);
    refreshMap();
    window.cpv123LogAction("geography", "🏜️ Tạo Sa Mạc tại (" + row + "," + col + ")", cells + " ô địa hình đã chuyển thành sa mạc.", snap);
  };

  window.cpv123TerrainNames = TERRAIN_NAMES;
  window.cpv123TerrainCodes = TERRAIN;
  window.cpv123GetGrid = getGrid;

  function init() {
    console.log("[CreatorWorldEdit V123] 🌍 World Edit Powers khởi động — 6 loại địa hình sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 29400); });
  } else {
    setTimeout(init, 29400);
  }
})();
