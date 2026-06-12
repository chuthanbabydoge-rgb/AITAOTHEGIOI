/* ============================
   TERRITORY WAR SYSTEM — territoryWarSystem.js
   Creator God V6 — Faction Influence Map
   Tích hợp với Spatial World Viewer.
   KHÔNG phá code cũ.
   ============================ */

"use strict";

// ============================
// FACTION COLOR MAP
// Mỗi tông môn / quốc gia có màu riêng
// ============================
var FACTION_COLORS = {
  // Tông Môn (Sects)
  "Thanh Vân Tông":   { color: "#22d3ee", glow: "#06b6d4", hex: 0x22d3ee, name: "Thanh Vân Tông",   type: "sect" },
  "Huyết Ma Tông":    { color: "#ef4444", glow: "#dc2626", hex: 0xef4444, name: "Huyết Ma Tông",    type: "sect" },
  "Thiên Kiếm Môn":  { color: "#facc15", glow: "#eab308", hex: 0xfacc15, name: "Thiên Kiếm Môn",  type: "sect" },
  "Vạn Thú Sơn":     { color: "#4ade80", glow: "#16a34a", hex: 0x4ade80, name: "Vạn Thú Sơn",     type: "sect" },
  "Thiên Cơ Các":    { color: "#a78bfa", glow: "#7c3aed", hex: 0xa78bfa, name: "Thiên Cơ Các",    type: "sect" },
  // Quốc Gia (Nations)
  "Thiên Vũ Quốc":   { color: "#fb923c", glow: "#ea580c", hex: 0xfb923c, name: "Thiên Vũ Quốc",   type: "nation" },
  "Đại Hạ Quốc":     { color: "#67e8f9", glow: "#0891b2", hex: 0x67e8f9, name: "Đại Hạ Quốc",     type: "nation" },
  "Thương Lan Quốc": { color: "#f472b6", glow: "#db2777", hex: 0xf472b6, name: "Thương Lan Quốc", type: "nation" },
  "Huyền Thiên Quốc":{ color: "#94a3b8", glow: "#475569", hex: 0x94a3b8, name: "Huyền Thiên Quốc",type: "nation" },
  // Trung lập
  "neutral":         { color: "#334155", glow: "#1e293b", hex: 0x334155, name: "Trung Lập",        type: "neutral" },
};

// Dynamic color pool cho factions mới được tạo ra
var FACTION_COLOR_POOL = [
  "#06b6d4","#8b5cf6","#10b981","#f59e0b","#ec4899",
  "#3b82f6","#84cc16","#d946ef","#0ea5e9","#e11d48",
];
var _factionColorIdx = 0;

function getFactionColor(factionName) {
  if (!factionName) return FACTION_COLORS["neutral"];
  if (FACTION_COLORS[factionName]) return FACTION_COLORS[factionName];
  // Tự động gán màu cho faction mới
  var c = FACTION_COLOR_POOL[_factionColorIdx % FACTION_COLOR_POOL.length];
  _factionColorIdx++;
  FACTION_COLORS[factionName] = { color: c, glow: c, hex: parseInt(c.replace("#",""), 16), name: factionName, type: "dynamic" };
  return FACTION_COLORS[factionName];
}

// ============================
// WAR STATE
// ============================
var territoryWarLog    = [];     // { year, attacker, defender, territory, result }
var activeWars         = [];     // { attackerName, defenderName, territoryId, startYear, warType }
var alliances          = [];     // { nation1, nation2, formedYear }
var _warLogMaxLen      = 80;

// ============================
// TERRITORY OWNERSHIP HELPERS
// ============================

// Gắn owner cho territory nếu chưa có
function ensureTerritoryOwners() {
  if (!window.world || !window.world.territories) return;
  var livingFactions = _getLivingFactions();
  window.world.territories.forEach(function(t) {
    if (!t.owner || t.owner === "" || t.owner === "neutral") {
      // Giao ngẫu nhiên cho faction hoặc để neutral
      if (Math.random() < 0.7 && livingFactions.length) {
        t.owner = livingFactions[Math.floor(Math.random() * livingFactions.length)].name;
      } else {
        t.owner = "neutral";
      }
    }
    if (!t.militaryPower) t.militaryPower = Math.floor(t.population * 0.1 + Math.random() * 500);
    if (!t.resources)     t.resources = { lingshi: t.spiritualEnergy || 100, minerals: t.minerals || 100 };
    if (!t.contestedBy)   t.contestedBy = null; // faction đang tấn công
  });
}

function _getLivingFactions() {
  var result = [];
  var liveSects     = (typeof sects     !== "undefined" && Array.isArray(sects))     ? sects     : [];
  var liveCountries = (typeof countries !== "undefined" && Array.isArray(countries)) ? countries : [];
  liveSects.forEach(function(s)     { result.push({ name: s.name, type: "sect",   obj: s }); });
  liveCountries.forEach(function(c) { result.push({ name: c.name, type: "nation", obj: c }); });
  return result;
}

function getTerritoriesByOwner(ownerName) {
  if (!window.world || !window.world.territories) return [];
  return window.world.territories.filter(function(t) { return t.owner === ownerName; });
}

// ============================
// RENDER: FACTION INFLUENCE MAP
// Canvas-based hex grid với màu realtime
// ============================
var _fimCanvas = null;
var _fimCtx    = null;
var _fimAnimId = null;
var _fimInited = false;
var _fimPulse  = 0;   // cho animation

function renderFactionInfluence() {
  var container = document.getElementById("factionInfluenceMap");
  if (!container) return;

  ensureTerritoryOwners();

  // Build canvas once
  if (!_fimInited || !_fimCanvas) {
    container.innerHTML = "";
    _fimCanvas = document.createElement("canvas");
    _fimCanvas.style.cssText = "width:100%;height:100%;display:block;cursor:crosshair;border-radius:10px;";
    container.appendChild(_fimCanvas);
    _fimInited = true;
    _fimCanvas.addEventListener("click", _fimHandleClick);
    _fimCanvas.addEventListener("mousemove", _fimHandleHover);
  }

  _fimDrawFrame();
}

function _fimDrawFrame() {
  if (!_fimCanvas) return;
  var container = document.getElementById("factionInfluenceMap");
  if (!container) return;

  var W = container.clientWidth  || 600;
  var H = container.clientHeight || 400;
  if (W < 10 || H < 10) { W = 600; H = 400; }

  _fimCanvas.width  = W;
  _fimCanvas.height = H;
  var ctx = _fimCanvas.getContext("2d");
  _fimCtx = ctx;

  var territories = (window.world && window.world.territories) ? window.world.territories : [];

  // Background
  ctx.fillStyle = "#0a0a1a";
  ctx.fillRect(0, 0, W, H);

  // Grid bg pattern
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  ctx.lineWidth = 1;
  for (var gx = 0; gx < W; gx += 30) { ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,H); ctx.stroke(); }
  for (var gy = 0; gy < H; gy += 30) { ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(W,gy); ctx.stroke(); }

  if (!territories.length) {
    ctx.fillStyle = "#475569";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⚠️ Chưa có lãnh địa. Hãy khai sinh thế giới mới.", W/2, H/2);
    return;
  }

  // Layout: pack territories into hex-like grid
  var cols     = Math.ceil(Math.sqrt(territories.length * (W/H)));
  var rows     = Math.ceil(territories.length / cols);
  var cellW    = Math.floor(W / cols);
  var cellH    = Math.floor(H / Math.max(rows, 1));
  var hexR     = Math.min(cellW, cellH) * 0.42;

  _fimPulse    = (_fimPulse + 0.04) % (Math.PI * 2);

  territories.forEach(function(t, i) {
    var col = i % cols;
    var row = Math.floor(i / cols);
    var cx  = cellW * col + cellW / 2;
    var cy  = cellH * row + cellH / 2;
    // Hex offset for odd rows
    if (row % 2 === 1) cx += cellW * 0.5;

    t._mapX = cx; t._mapY = cy; t._mapR = hexR;

    var fc      = getFactionColor(t.owner || "neutral");
    var isContest = t.contestedBy && t.contestedBy !== t.owner;
    var pulse   = isContest ? 0.6 + 0.4 * Math.sin(_fimPulse * 3) : 1;

    // Draw hexagon
    _drawHex(ctx, cx, cy, hexR, fc.color, fc.glow, pulse, isContest);

    // Territory name
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var fontSize = Math.max(8, Math.min(12, hexR * 0.28));
    ctx.font = `bold ${fontSize}px 'Segoe UI', sans-serif`;
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.9)";
    ctx.shadowBlur = 4;
    // Short name (max 6 chars)
    var shortName = t.name.length > 7 ? t.name.substring(0, 6) + "…" : t.name;
    ctx.fillText(shortName, cx, cy - fontSize * 0.3);

    // Owner icon
    var ownerLabel = "";
    if (t.owner && t.owner !== "neutral") {
      var fType = getFactionColor(t.owner).type;
      ownerLabel = fType === "sect" ? "⚔" : (fType === "nation" ? "🏛" : "●");
    } else {
      ownerLabel = "○";
    }
    ctx.font = `${Math.max(9, fontSize * 0.85)}px sans-serif`;
    ctx.fillStyle = fc.color;
    ctx.fillText(ownerLabel, cx, cy + fontSize * 0.9);
    ctx.restore();

    // War indicator
    if (isContest) {
      ctx.save();
      ctx.font = `${Math.max(10, hexR * 0.3)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("⚔️", cx, cy - hexR * 0.55);
      ctx.restore();
    }
  });

  // Legend
  _drawInfluenceLegend(ctx, W, H);
}

function _drawHex(ctx, cx, cy, r, color, glow, alpha, contested) {
  ctx.save();
  ctx.globalAlpha = Math.max(0.15, alpha);

  // Glow
  var grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r * 1.2);
  grad.addColorStop(0, color + "55");
  grad.addColorStop(1, color + "00");
  ctx.fillStyle = grad;
  ctx.beginPath();
  _hexPath(ctx, cx, cy, r * 1.3);
  ctx.fill();

  // Fill
  ctx.globalAlpha = Math.max(0.3, alpha * 0.85);
  var fillGrad = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  fillGrad.addColorStop(0, color + "cc");
  fillGrad.addColorStop(1, color + "44");
  ctx.fillStyle = fillGrad;
  ctx.beginPath();
  _hexPath(ctx, cx, cy, r);
  ctx.fill();

  // Border
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = contested ? "#fbbf24" : color;
  ctx.lineWidth   = contested ? 2.5 : 1.5;
  ctx.shadowColor = glow;
  ctx.shadowBlur  = contested ? 14 : 7;
  ctx.beginPath();
  _hexPath(ctx, cx, cy, r);
  ctx.stroke();

  ctx.restore();
}

function _hexPath(ctx, cx, cy, r) {
  ctx.moveTo(cx + r, cy);
  for (var a = 1; a < 7; a++) {
    ctx.lineTo(
      cx + r * Math.cos(a * Math.PI / 3),
      cy + r * Math.sin(a * Math.PI / 3)
    );
  }
  ctx.closePath();
}

function _drawInfluenceLegend(ctx, W, H) {
  var factions = _getLivingFactions();
  var y0       = H - 16 - factions.length * 18;
  if (y0 < 10) y0 = 10;
  var x0       = 12;

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.beginPath();
  ctx.roundRect(x0 - 6, y0 - 8, 170, factions.length * 18 + 16, 8);
  ctx.fill();

  factions.forEach(function(f, i) {
    var fc     = getFactionColor(f.name);
    var owned  = getTerritoriesByOwner(f.name).length;
    var yy     = y0 + i * 18;

    ctx.fillStyle = fc.color;
    ctx.shadowColor = fc.glow;
    ctx.shadowBlur  = 6;
    ctx.beginPath();
    ctx.arc(x0 + 7, yy + 4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#e2e8f0";
    ctx.font      = "11px 'Segoe UI', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(f.name.substring(0, 10) + (f.name.length > 10 ? "…" : "") + " (" + owned + ")", x0 + 18, yy + 8);
  });
  ctx.restore();
}

var _fimHoverInfo = null;
function _fimHandleHover(e) {
  var rect = _fimCanvas.getBoundingClientRect();
  var mx   = (e.clientX - rect.left) * (_fimCanvas.width  / rect.width);
  var my   = (e.clientY - rect.top)  * (_fimCanvas.height / rect.height);
  var territories = (window.world && window.world.territories) ? window.world.territories : [];
  var hit = null;
  territories.forEach(function(t) {
    if (!t._mapX) return;
    var dx = mx - t._mapX, dy = my - t._mapY;
    if (Math.sqrt(dx*dx + dy*dy) < t._mapR) hit = t;
  });
  _fimHoverInfo = hit;
  var tooltip = document.getElementById("fimTooltip");
  if (tooltip && hit) {
    var fc = getFactionColor(hit.owner || "neutral");
    tooltip.innerHTML = `
      <div style="font-weight:700;color:${fc.color};margin-bottom:4px;">${hit.name}</div>
      <div style="color:#94a3b8;font-size:11px;">${hit.region || ""}</div>
      <div>🏛 Chủ: <b style="color:${fc.color}">${hit.owner || "Trung Lập"}</b></div>
      <div>👥 Dân số: ${(hit.population||0).toLocaleString()}</div>
      <div>⚔️ Quân lực: ${(hit.militaryPower||0).toLocaleString()}</div>
      <div>✨ Linh khí: ${hit.spiritualEnergy||0}</div>
      ${hit.contestedBy ? `<div style="color:#fbbf24">⚠️ Đang tranh chiến: ${hit.contestedBy}</div>` : ""}
    `;
    tooltip.style.display = "block";
    tooltip.style.left = (e.clientX - rect.left + 14) + "px";
    tooltip.style.top  = (e.clientY - rect.top  - 10) + "px";
  } else if (tooltip) {
    tooltip.style.display = "none";
  }
}

function _fimHandleClick(e) {
  if (!_fimHoverInfo) return;
  var t = _fimHoverInfo;
  toast(`🗺 ${t.name} — Chủ: ${t.owner || "Trung Lập"} · Quân lực: ${(t.militaryPower||0).toLocaleString()}`);
}

// Continuous animation loop for war pulse
var _fimLoopRunning = false;
function _fimStartLoop() {
  if (_fimLoopRunning) return;
  _fimLoopRunning = true;
  (function loop() {
    if (!_fimLoopRunning) return;
    _fimDrawFrame();
    requestAnimationFrame(loop);
  })();
}
function _fimStopLoop() { _fimLoopRunning = false; }

// ============================
// RENDER: TERRITORY WAR MAP (list view with faction colors)
// ============================
function renderTerritoryMap() {
  var container = document.getElementById("territoryWarMapList");
  if (!container) return;
  ensureTerritoryOwners();
  var territories = (window.world && window.world.territories) ? window.world.territories : [];
  if (!territories.length) {
    container.innerHTML = `<div style="text-align:center;color:#475569;padding:30px;">
      🌍 Chưa có lãnh địa. Hãy khai sinh thế giới mới.
    </div>`;
    return;
  }

  // Group by owner
  var byOwner = {};
  territories.forEach(function(t) {
    var key = t.owner || "neutral";
    if (!byOwner[key]) byOwner[key] = [];
    byOwner[key].push(t);
  });

  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">';
  territories.forEach(function(t) {
    var fc = getFactionColor(t.owner || "neutral");
    var isContest = t.contestedBy && t.contestedBy !== t.owner;
    var borderColor = isContest ? "#fbbf24" : fc.color;
    html += `
    <div style="
      background:rgba(15,15,30,0.9);
      border:1.5px solid ${borderColor};
      border-radius:8px;
      padding:10px;
      position:relative;
      box-shadow: 0 0 8px ${fc.color}33;
    ">
      ${isContest ? `<span style="position:absolute;top:6px;right:8px;font-size:14px;animation:pulse 1s infinite;">⚔️</span>` : ""}
      <div style="font-weight:700;font-size:13px;color:${fc.color};margin-bottom:4px;">${t.name}</div>
      <div style="font-size:10px;color:#475569;margin-bottom:6px;">${t.region||""}</div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
        <span style="width:8px;height:8px;border-radius:50%;background:${fc.color};display:inline-block;box-shadow:0 0 6px ${fc.color};"></span>
        <span style="font-size:11px;color:${fc.color};font-weight:600;">${t.owner || "Trung Lập"}</span>
        <span style="font-size:10px;color:#64748b;">${fc.type === "sect" ? "(Tông Môn)" : fc.type === "nation" ? "(Quốc Gia)" : ""}</span>
      </div>
      <div style="font-size:10px;color:#94a3b8;">⚔️ ${(t.militaryPower||0).toLocaleString()} · 👥 ${(t.population||0).toLocaleString()}</div>
      ${t.contestedBy ? `<div style="font-size:10px;color:#fbbf24;margin-top:3px;">🔥 ${t.contestedBy} đang tấn công!</div>` : ""}
    </div>`;
  });
  html += "</div>";
  container.innerHTML = html;
}

// ============================
// SIMULATE TERRITORY WAR
// ============================

// Tông Môn: đánh chiếm lãnh địa
function simulateSectConquest() {
  var liveSects  = (typeof sects !== "undefined" && Array.isArray(sects)) ? sects : [];
  var territories = (window.world && window.world.territories) ? window.world.territories : [];
  if (!liveSects.length || !territories.length) return;

  liveSects.forEach(function(sect) {
    if (sect.warCooldown && sect.warCooldown > 0) { sect.warCooldown--; return; }
    if (Math.random() > 0.25) return; // 25% chance mỗi tick

    // Tìm lãnh địa để đánh chiếm (không phải của mình)
    var targets = territories.filter(function(t) { return t.owner !== sect.name; });
    if (!targets.length) return;
    var target = targets[Math.floor(Math.random() * targets.length)];

    // Tính sức mạnh tông môn
    var sectPower = (sect.prestige || 500) + (sect.treasury || 1000) * 0.1 + (sect.level || 1) * 200;
    sectPower    += Math.random() * 300;

    var defPower = (target.militaryPower || 200) * (target.owner !== "neutral" ? 1.5 : 1.0);
    defPower    += Math.random() * 200;

    // Đánh chiếm
    target.contestedBy = sect.name;
    _fimDrawFrame();

    var result, msg;
    if (sectPower > defPower) {
      var prevOwner = target.owner || "neutral";
      target.owner         = sect.name;
      target.contestedBy   = null;
      target.militaryPower = Math.floor(target.militaryPower * 0.7 + sectPower * 0.05);
      sect.prestige       += 30;
      sect.treasury       -= 200;
      sect.warCooldown     = 3;
      result = "win";
      msg    = `⚔️ ${sect.name} chiếm được ${target.name}! (từ tay ${prevOwner})`;
      addLog(msg, "important");
      addTimeline(msg, "war", "⚔️");
      // Realtime update map
      if (typeof renderTerritoryMap === "function") renderTerritoryMap();
      _fimDrawFrame();
    } else {
      target.contestedBy  = null;
      target.militaryPower= Math.floor(target.militaryPower * 1.1);
      sect.prestige       -= 10;
      sect.treasury       -= 100;
      sect.warCooldown     = 2;
      result = "lose";
      msg    = `🛡 ${sect.name} thất bại khi tấn công ${target.name}`;
    }

    territoryWarLog.unshift({ year: (typeof year !== "undefined" ? year : 0), attacker: sect.name, territory: target.name, result: result, msg: msg });
    if (territoryWarLog.length > _warLogMaxLen) territoryWarLog.pop();
  });
}

// Quốc Gia: tuyên chiến, phòng thủ, liên minh
function simulateNationWar() {
  var liveCountries = (typeof countries !== "undefined" && Array.isArray(countries)) ? countries : [];
  var territories   = (window.world && window.world.territories) ? window.world.territories : [];
  if (!liveCountries.length || !territories.length) return;

  liveCountries.forEach(function(nation) {
    var roll = Math.random();

    // === TUYÊN CHIẾN ===
    if (roll < 0.15) {
      var enemies = liveCountries.filter(function(n) {
        return n.id !== nation.id && (nation.relations[n.id] !== "ally");
      });
      if (!enemies.length) return;
      var enemy = enemies[Math.floor(Math.random() * enemies.length)];

      // Chiếm lãnh địa của địch
      var enemyTerrs = territories.filter(function(t) { return t.owner === enemy.name; });
      if (!enemyTerrs.length) return;
      var target = enemyTerrs[Math.floor(Math.random() * enemyTerrs.length)];

      var attPow = (nation.military || 10000) + Math.random() * 5000;
      var defPow = (enemy.military  || 10000) + (target.militaryPower || 500) + Math.random() * 5000;

      target.contestedBy = nation.name;
      _fimDrawFrame();

      var msg;
      if (attPow > defPow * 0.85) {
        target.owner       = nation.name;
        target.contestedBy = null;
        nation.military   -= Math.floor(attPow * 0.1);
        enemy.military    -= Math.floor(defPow * 0.2);
        nation.wealth     += target.population * 0.01;
        msg = `🏛 ${nation.name} tuyên chiến & chiếm ${target.name} từ ${enemy.name}!`;
        addLog(msg, "important");
        addTimeline(msg, "war", "⚔️");
        // Update war relation
        nation.relations[enemy.id]  = "enemy";
        enemy.relations[nation.id]  = "enemy";
        if (typeof renderTerritoryMap === "function") renderTerritoryMap();
        _fimDrawFrame();
      } else {
        target.contestedBy = null;
        msg = `🛡 ${enemy.name} đẩy lùi ${nation.name} tại ${target.name}`;
        nation.relations[enemy.id]  = "enemy";
        enemy.relations[nation.id]  = "enemy";
      }
      territoryWarLog.unshift({ year: (typeof year !== "undefined" ? year : 0), attacker: nation.name, defender: enemy.name, territory: target.name, result: attPow > defPow * 0.85 ? "win" : "lose", msg: msg });
      if (territoryWarLog.length > _warLogMaxLen) territoryWarLog.pop();
    }

    // === LIÊN MINH ===
    else if (roll < 0.20) {
      var potentialAllies = liveCountries.filter(function(n) {
        return n.id !== nation.id && nation.relations[n.id] !== "enemy" && nation.relations[n.id] !== "ally";
      });
      if (!potentialAllies.length) return;
      var ally = potentialAllies[Math.floor(Math.random() * potentialAllies.length)];
      nation.relations[ally.id] = "ally";
      ally.relations[nation.id] = "ally";
      alliances.push({ nation1: nation.name, nation2: ally.name, formedYear: (typeof year !== "undefined" ? year : 0) });
      var allyMsg = `🤝 ${nation.name} và ${ally.name} kết minh!`;
      addLog(allyMsg, "normal");
      addTimeline(allyMsg, "civilization", "🤝");
    }

    // === PHÒNG THỦ: tăng cường quân lực lãnh địa ===
    else if (roll < 0.35) {
      var ownedTerrs = territories.filter(function(t) { return t.owner === nation.name; });
      ownedTerrs.forEach(function(t) {
        t.militaryPower = Math.floor((t.militaryPower || 200) * 1.05 + 50);
      });
    }
  });
}

// Main hook — gọi từ simulateWorld()
function simulateTerritoryWar() {
  if (!window.world || !window.world.territories) return;
  ensureTerritoryOwners();
  simulateSectConquest();
  simulateNationWar();
  // Refresh influence panel nếu đang hiển thị
  var warPanel = document.getElementById("panel-territory-war");
  if (warPanel && warPanel.classList.contains("active")) {
    renderWarLog();
    renderFactionStats();
  }
}

// ============================
// RENDER: WAR LOG
// ============================
function renderWarLog() {
  var el = document.getElementById("territoryWarLog");
  if (!el) return;
  if (!territoryWarLog.length) {
    el.innerHTML = `<div style="color:#475569;text-align:center;padding:20px;">Chưa có sự kiện chiến tranh.</div>`;
    return;
  }
  el.innerHTML = territoryWarLog.slice(0, 30).map(function(e) {
    var isWin = e.result === "win";
    var color  = isWin ? "#4ade80" : "#f87171";
    var icon   = isWin ? "⚔️" : "🛡";
    return `<div style="padding:5px 8px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px;">
      <span style="color:#475569;font-variant-numeric:tabular-nums;min-width:44px;display:inline-block;">Năm ${e.year}</span>
      <span style="color:${color};">${icon} ${e.msg || (e.attacker + " vs " + e.territory)}</span>
    </div>`;
  }).join("");
}

// ============================
// RENDER: FACTION STATS (chiếm bao nhiêu lãnh địa)
// ============================
function renderFactionStats() {
  var el = document.getElementById("factionStatsGrid");
  if (!el) return;
  var territories = (window.world && window.world.territories) ? window.world.territories : [];
  var factions    = _getLivingFactions();
  if (!factions.length) { el.innerHTML = ""; return; }

  var totalCount = territories.length || 1;
  var html = factions.map(function(f) {
    var fc    = getFactionColor(f.name);
    var owned = getTerritoriesByOwner(f.name);
    var pct   = Math.round(owned.length / totalCount * 100);
    var totalPop = owned.reduce(function(s,t){ return s + (t.population||0); }, 0);
    var totalMil = owned.reduce(function(s,t){ return s + (t.militaryPower||0); }, 0);
    return `
    <div style="
      background:rgba(15,15,30,0.85);
      border:1px solid ${fc.color}44;
      border-left:3px solid ${fc.color};
      border-radius:8px;
      padding:10px 12px;
    ">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span style="width:10px;height:10px;border-radius:50%;background:${fc.color};box-shadow:0 0 8px ${fc.color};display:inline-block;"></span>
        <span style="font-weight:700;font-size:13px;color:${fc.color};">${f.name}</span>
        <span style="margin-left:auto;font-size:10px;color:#64748b;">${fc.type === "sect" ? "⚔ Tông Môn" : "🏛 Quốc Gia"}</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
        <div style="flex:1;height:6px;background:#1e293b;border-radius:3px;overflow:hidden;">
          <div style="width:${pct}%;height:100%;background:${fc.color};border-radius:3px;transition:width 0.5s;box-shadow:0 0 6px ${fc.color};"></div>
        </div>
        <span style="font-size:11px;color:#94a3b8;min-width:30px;">${pct}%</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;">
        <div style="text-align:center;">
          <div style="font-size:14px;font-weight:700;color:${fc.color};">${owned.length}</div>
          <div style="font-size:9px;color:#475569;">Lãnh địa</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:12px;font-weight:700;color:#94a3b8;">${(totalPop/1000).toFixed(1)}K</div>
          <div style="font-size:9px;color:#475569;">Dân số</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:12px;font-weight:700;color:#f87171;">${(totalMil/1000).toFixed(1)}K</div>
          <div style="font-size:9px;color:#475569;">Quân lực</div>
        </div>
      </div>
    </div>`;
  }).join("");
  el.innerHTML = html;
}

// ============================
// PANEL INIT
// ============================
function initTerritoryWarPanel() {
  ensureTerritoryOwners();
  renderFactionInfluence();
  renderTerritoryMap();
  renderFactionStats();
  renderWarLog();
  _fimStartLoop();
}

// Hook vào simulateWorld (non-destructive)
(function hookSimulate() {
  var _origSimulate = null;
  function tryHook() {
    if (typeof simulateWorld === "function" && !simulateWorld._twsHooked) {
      var orig = simulateWorld;
      window.simulateWorld = function() {
        orig.apply(this, arguments);
        try { simulateTerritoryWar(); } catch(e) { /* silent */ }
      };
      window.simulateWorld._twsHooked = true;
    }
  }
  // Retry until app.js is loaded
  var _hookInterval = setInterval(function() {
    if (typeof simulateWorld === "function") {
      tryHook();
      clearInterval(_hookInterval);
    }
  }, 200);
})();

// Hook vào createWorld để gán owner sau khi tạo thế giới
(function hookCreateWorld() {
  var _hookInterval = setInterval(function() {
    if (typeof createWorld === "function" && !createWorld._twsHooked) {
      var orig = createWorld;
      window.createWorld = function() {
        orig.apply(this, arguments);
        setTimeout(ensureTerritoryOwners, 200);
      };
      window.createWorld._twsHooked = true;
      clearInterval(_hookInterval);
    }
  }, 300);
})();

// Expose globals
window.renderTerritoryMap       = renderTerritoryMap;
window.renderFactionInfluence   = renderFactionInfluence;
window.simulateTerritoryWar     = simulateTerritoryWar;
window.initTerritoryWarPanel    = initTerritoryWarPanel;
window.getFactionColor          = getFactionColor;
window.ensureTerritoryOwners    = ensureTerritoryOwners;
window.renderFactionStats       = renderFactionStats;
window.renderWarLog             = renderWarLog;
window.FACTION_COLORS           = FACTION_COLORS;
