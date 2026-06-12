/* ============================
   CREATOR GOD V6 — ĐA THẾ GIỚI SYSTEM
   multiWorldSystem.js
   Load AFTER app.js
   ============================ */

// ============================
// MULTI-WORLD STATE
// ============================

let worlds         = [];          // Array of all world save snapshots
let currentWorldId = null;        // ID of the active world

// ============================
// WORLD SNAPSHOT HELPERS
// ============================

/** Capture all live state into a single world object */
function captureWorldSnapshot() {
  return {
    id:               currentWorldId,
    name:             world ? world.name : "Vô Danh",
    template:         world ? (world.templateKey || "cultivation") : "cultivation",
    genre:            world ? (world.genre || "") : "",
    createdYear:      world ? (world.createdYear || 1) : 1,
    currentEra:       world ? (world.currentEra || "") : "",
    npcs:             JSON.parse(JSON.stringify(npcs)),
    sects:            JSON.parse(JSON.stringify(sects)),
    countries:        JSON.parse(JSON.stringify(countries)),
    bosses:           JSON.parse(JSON.stringify(bosses)),
    regions:          JSON.parse(JSON.stringify(regions)),
    secretRealms:     JSON.parse(JSON.stringify(secretRealms.slice(0, 80))),
    logs:             JSON.parse(JSON.stringify(logs.slice(0, 200))),
    eventTimeline:    JSON.parse(JSON.stringify(eventTimeline.slice(0, 100))),
    worldHistory:     JSON.parse(JSON.stringify(worldHistory.slice(0, 500))),
    dynasties:        JSON.parse(JSON.stringify(dynasties || {})),
    hallOfFame:       JSON.parse(JSON.stringify(hallOfFame)),
    worldEvents:      JSON.parse(JSON.stringify((worldEvents || []).slice(0, 80))),
    activeWorldEvent: JSON.parse(JSON.stringify(activeWorldEvent || null)),
    sectWarLogs:      JSON.parse(JSON.stringify((sectWarLogs || []).slice(0, 100))),
    activeWars:       JSON.parse(JSON.stringify(activeWars || [])),
    year,
    heavenPoints,
    _npcIdCounter,
    savedAt:          Date.now(),
    // ── PER-WORLD SYSTEMS ──
    dungeons:         JSON.parse(JSON.stringify(typeof dungeons !== "undefined" ? (dungeons || []).slice(0, 100) : [])),
    _dungeonIdCtr:    typeof _dungeonIdCtr !== "undefined" ? _dungeonIdCtr : 1,
    thiendinhState:   typeof thiendinhState !== "undefined" ? JSON.parse(JSON.stringify(thiendinhState)) : null,
    playerQuests:     typeof playerQuests   !== "undefined" ? JSON.parse(JSON.stringify(playerQuests))   : null,
    questLog:         typeof questLog       !== "undefined" ? JSON.parse(JSON.stringify((questLog || []).slice(0, 200))) : [],
  };
}

/** Restore live state from a snapshot */
function restoreWorldSnapshot(snap) {
  world             = { name: snap.name, genre: snap.genre, templateKey: snap.template, createdYear: snap.createdYear, currentEra: snap.currentEra };
  npcs              = snap.npcs              || [];
  sects             = snap.sects             || [];
  countries         = snap.countries         || [];
  bosses            = snap.bosses            || [];
  regions           = snap.regions           || [];
  secretRealms      = snap.secretRealms      || [];
  logs              = snap.logs              || [];
  eventTimeline     = snap.eventTimeline     || [];
  worldHistory      = snap.worldHistory      || [];
  dynasties         = snap.dynasties         || {};
  hallOfFame        = snap.hallOfFame        || [];
  worldEvents       = snap.worldEvents       || [];
  activeWorldEvent  = snap.activeWorldEvent  || null;
  sectWarLogs       = snap.sectWarLogs       || [];
  activeWars        = snap.activeWars        || [];
  year              = snap.year              || 1;
  heavenPoints      = snap.heavenPoints      || 1000;
  _npcIdCounter     = snap._npcIdCounter     || 1;
  currentWorldId    = snap.id;

  // ── PER-WORLD SYSTEMS ──
  // Dungeon
  if (typeof dungeons !== "undefined")     dungeons      = snap.dungeons      || [];
  if (typeof _dungeonIdCtr !== "undefined") _dungeonIdCtr = snap._dungeonIdCtr || 1;

  // Thiên Đình — reset về state của world này, rồi render lại
  if (typeof thiendinhState !== "undefined" && snap.thiendinhState) {
    var td = snap.thiendinhState;
    Object.keys(td).forEach(function(k) { thiendinhState[k] = td[k]; });
    if (!thiendinhState.officials)  thiendinhState.officials  = {};
    if (!thiendinhState.undead)     thiendinhState.undead      = [];
    if (!thiendinhState.pathNpcs)   thiendinhState.pathNpcs    = {};
    if (!thiendinhState.undeadSet)  thiendinhState.undeadSet   = {};
    // Đồng bộ genre với world mới
    if (typeof _gc0 !== "undefined" && typeof GENRE_HEAVEN_CONFIG !== "undefined") {
      try { window._gc0 = GENRE_HEAVEN_CONFIG[snap.template] || GENRE_HEAVEN_CONFIG.cultivation; } catch(e) {}
    }
    if (typeof renderThiendinhPanel === "function") { try { renderThiendinhPanel(); } catch(e) {} }
  } else if (typeof thiendinhState !== "undefined" && !snap.thiendinhState) {
    // Thế giới mới chưa có thiendinhState — reset về blank
    thiendinhState.founded      = false;
    thiendinhState.thienDe      = null;
    thiendinhState.officials    = {};
    thiendinhState.totalAscended = 0;
    thiendinhState.heavenHistory = [];
    thiendinhState.undead       = [];
    thiendinhState.undeadSet    = {};
    thiendinhState.pathNpcs     = {};
  }

  // Quest per-world
  if (typeof playerQuests !== "undefined" && snap.playerQuests) {
    playerQuests = snap.playerQuests;
    if (!playerQuests.active)    playerQuests.active    = [];
    if (!playerQuests.completed) playerQuests.completed = [];
    if (!playerQuests.available) playerQuests.available = [];
  } else if (typeof playerQuests !== "undefined" && !snap.playerQuests) {
    playerQuests = { active: [], completed: [], available: [] };
  }
  if (typeof questLog !== "undefined") questLog = snap.questLog || [];

  // migration guards
  // EMERGENT: không tự fill sects/countries — để NPC tự lập
  if (!sects.length)     sects     = [];
  if (!countries.length) countries = [];
  else {
    countries.forEach(c => {
      if (c.economy    === undefined) c.economy    = Math.floor((c.wealth || 0) * 0.4) || 1000;
      if (c.military   === undefined) c.military   = c.army || 10000;
      if (c.technology === undefined) c.technology = randInt(1, 5);
      if (c.culture    === undefined) c.culture    = randInt(1, 5);
      if (c.level      === undefined) c.level      = 1;
      if (!c.civHistory) c.civHistory = [];
    });
  }
  if (!regions.length) regions = JSON.parse(JSON.stringify(REGIONS_DATA));
}

/** Generate a unique world ID */
function newWorldId() {
  return "w_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
}

// ============================
// PERSISTENCE — MULTI-WORLD LAYER
// ============================

function saveWorlds() {
  try {
    // Update current world snapshot inside the worlds array
    if (currentWorldId) {
      const idx = worlds.findIndex(w => w.id === currentWorldId);
      const snap = captureWorldSnapshot();
      if (idx >= 0) worlds[idx] = snap;
      else worlds.push(snap);
    }
    localStorage.setItem("cgv6_worlds",        JSON.stringify(worlds));
    localStorage.setItem("cgv6_currentWorldId", currentWorldId || "");
  } catch(e) { console.warn("saveWorlds failed:", e); }
}

function loadWorlds() {
  try {
    const raw = localStorage.getItem("cgv6_worlds");
    worlds = raw ? JSON.parse(raw) : [];
    currentWorldId = localStorage.getItem("cgv6_currentWorldId") || null;
  } catch(e) {
    console.warn("loadWorlds failed:", e);
    worlds = [];
    currentWorldId = null;
  }
}

// ============================
// LEGACY MIGRATION
// ============================
// If old save has cgv6_world but no cgv6_worlds, wrap it automatically.

function migrateLegacySave() {
  const hasMulti = localStorage.getItem("cgv6_worlds");
  if (hasMulti) return; // Already using new format

  const legacyWorld = localStorage.getItem("cgv6_world");
  if (!legacyWorld) return; // Nothing to migrate

  // At this point init() has already called load() so live state is populated.
  // Just wrap whatever is in memory into a worlds snapshot.
  try {
    if (!world) {
      // Try parsing legacy world directly
      const parsed = JSON.parse(legacyWorld);
      if (!parsed) return;
      // load() should have set world already; if not, bail
      return;
    }

    const id = newWorldId();
    currentWorldId = id;
    const snap = captureWorldSnapshot();
    snap.id   = id;
    snap.name = world.name || "Thế Giới Cũ";
    worlds    = [snap];

    localStorage.setItem("cgv6_worlds",         JSON.stringify(worlds));
    localStorage.setItem("cgv6_currentWorldId",  id);
    console.info("✅ Đã migrate save cũ sang hệ thống đa thế giới:", snap.name);
  } catch(e) {
    console.warn("migrateLegacySave failed:", e);
  }
}

// ============================
// SWITCH WORLD
// ============================

function switchWorld(id) {
  if (id === currentWorldId) { closeWorldManager(); return; }

  const snap = worlds.find(w => w.id === id);
  if (!snap) { toast("⚠️ Không tìm thấy thế giới!"); return; }

  // Save current world first
  if (currentWorldId) saveWorlds();

  // Stop simulation
  if (simInterval) { clearInterval(simInterval); simInterval = null; }

  restoreWorldSnapshot(snap);

  // Reset AI state cho world mới
  if (typeof window.autoPlayerAI !== "undefined" && typeof window.autoPlayerAI.resetForNewWorld === "function") {
    setTimeout(function() { window.autoPlayerAI.resetForNewWorld(); }, 500);
  }

  // Restart simulation
  simRunning = true;
  startSim();
  renderAll();
  updateWorldManagerUI();
  closeWorldManager();

  toast(`🌍 Đã chuyển sang thế giới: ${snap.name}`);
}

// ============================
// CREATE NEW WORLD  (from manager panel)
// ============================

function createNewWorldFromManager() {
  const nameEl = document.getElementById("mwNewName");
  const tmplEl = document.getElementById("mwNewTemplate");
  if (!nameEl || !nameEl.value.trim()) { toast("⚠️ Nhập tên thế giới!"); return; }

  const wName = nameEl.value.trim();
  const tKey  = tmplEl ? tmplEl.value : "cultivation";

  // Save current first
  if (currentWorldId) saveWorlds();

  // Stop sim
  if (simInterval) { clearInterval(simInterval); simInterval = null; }

  // Reset live state
  const id = newWorldId();
  currentWorldId = id;
  year          = 1;
  heavenPoints  = 1000;
  _npcIdCounter = 1;
  npcs = []; bosses = []; logs = []; eventTimeline = [];
  worldHistory = []; dynasties = {}; hallOfFame = [];
  worldEvents = []; activeWorldEvent = null;
  sectWarLogs = []; activeWars = [];

  // ── Reset per-world systems ──
  if (typeof dungeons     !== "undefined") dungeons      = [];
  if (typeof _dungeonIdCtr !== "undefined") _dungeonIdCtr = 1;
  if (typeof playerQuests !== "undefined") playerQuests  = { active: [], completed: [], available: [] };
  if (typeof questLog     !== "undefined") questLog      = [];
  if (typeof thiendinhState !== "undefined") {
    thiendinhState.founded       = false;
    thiendinhState.thienDe       = null;
    thiendinhState.officials     = {};
    thiendinhState.totalAscended = 0;
    thiendinhState.heavenHistory = [];
    thiendinhState.undead        = [];
    thiendinhState.undeadSet     = {};
    thiendinhState.pathNpcs      = {};
    // Cập nhật genre config cho thế giới mới
    if (typeof GENRE_HEAVEN_CONFIG !== "undefined") {
      try { window._gc0 = GENRE_HEAVEN_CONFIG[tKey] || GENRE_HEAVEN_CONFIG.cultivation; } catch(e) {}
    }
  }

  const tmpl    = (typeof WORLD_TEMPLATES !== "undefined" && WORLD_TEMPLATES[tKey]) ? WORLD_TEMPLATES[tKey] : null;
  // EMERGENT: thế giới mới bắt đầu trống
  sects     = [];
  countries = [];
  regions   = JSON.parse(JSON.stringify(tmpl ? (tmpl.regions   || REGIONS_DATA)   : REGIONS_DATA));
  secretRealms = [];

  const meta = (typeof TEMPLATE_META !== "undefined" && TEMPLATE_META[tKey]) ? TEMPLATE_META[tKey] : { genre: tKey };
  world = { name: wName, genre: meta.genre || tKey, templateKey: tKey, createdYear: 1, currentEra: "Hồng Hoang Kỷ" };

  addLog(`🌍 Thiên Đạo khai sinh thế giới [${wName}]`, "important");

  // Save snap
  const snap = captureWorldSnapshot();
  snap.id = id;
  worlds.push(snap);
  localStorage.setItem("cgv6_worlds",         JSON.stringify(worlds));
  localStorage.setItem("cgv6_currentWorldId",  id);

  simRunning = true;
  startSim();

  // ── Dân số ban đầu: do người chơi chọn (0 = thế giới trống) ──
  const _popEl   = document.getElementById("mwInitialPop");
  const _initPop = _popEl ? (parseInt(_popEl.value) || 0) : 0;
  if (_initPop > 0 && typeof createNPC === "function") {
    for (let _pi = 0; _pi < _initPop; _pi++) {
      const _npc = createNPC(false);
      npcs.push(_npc);
    }
    addLog(`🌱 Thiên Đạo gieo ${_initPop} sinh linh đầu tiên vào thế giới [${wName}].`, "important");
    addTimeline(`🌱 ${_initPop} sinh linh đầu tiên xuất hiện`, "important", "🌱");
  } else {
    addLog(`✨ Thế giới [${wName}] khởi đầu trong Hư Không. Chưa có sinh linh nào.`, "important");
  }

  renderAll();
  closeWorldManager();

  // Reset AI state cho world mới
  if (typeof window.autoPlayerAI !== "undefined" && typeof window.autoPlayerAI.resetForNewWorld === "function") {
    setTimeout(function() { window.autoPlayerAI.resetForNewWorld(); }, 500);
  }

  toast(`✨ Thế giới ${wName} đã được khai sinh!`);
}

// ============================
// DELETE WORLD
// ============================

function deleteWorld(id) {
  if (worlds.length <= 1) { toast("⚠️ Phải có ít nhất 1 thế giới!"); return; }
  const snap = worlds.find(w => w.id === id);
  if (!snap) return;
  if (!confirm(`Xóa thế giới "${snap.name}"? Hành động này không thể hoàn tác!`)) return;

  worlds = worlds.filter(w => w.id !== id);

  if (currentWorldId === id) {
    // Switch to first available
    if (simInterval) { clearInterval(simInterval); simInterval = null; }
    restoreWorldSnapshot(worlds[0]);
    simRunning = true;
    startSim();
    renderAll();
  }

  saveWorlds();
  renderWorldManagerList();
  toast(`🗑 Đã xóa thế giới: ${snap.name}`);
}

// ============================
// DUPLICATE WORLD
// ============================

function duplicateWorld(id) {
  const snap = worlds.find(w => w.id === id);
  if (!snap) return;

  const newId    = newWorldId();
  const newSnap  = JSON.parse(JSON.stringify(snap));
  newSnap.id     = newId;
  newSnap.name   = snap.name + " (Bản Sao)";
  newSnap.savedAt = Date.now();
  worlds.push(newSnap);
  saveWorlds();
  renderWorldManagerList();
  toast(`📋 Đã sao chép thế giới: ${snap.name}`);
}

// ============================
// EXPORT / IMPORT
// ============================

function exportWorld(id) {
  // Save current snapshot first
  if (id === currentWorldId) saveWorlds();

  const snap = worlds.find(w => w.id === id);
  if (!snap) { toast("⚠️ Không tìm thấy thế giới!"); return; }

  const json = JSON.stringify(snap, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `world_${snap.name.replace(/\s/g, "_")}_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast(`📤 Đã xuất thế giới: ${snap.name}`);
}

function exportAllWorlds() {
  if (currentWorldId) saveWorlds();
  const json = JSON.stringify({ version: "cgv6_multiworld", worlds }, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `all_worlds_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast(`📤 Đã xuất tất cả ${worlds.length} thế giới!`);
}

function importWorldFromFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      // Support both single world and full export
      if (data.version === "cgv6_multiworld" && Array.isArray(data.worlds)) {
        // Full export: import all worlds
        data.worlds.forEach(snap => {
          const existing = worlds.find(w => w.id === snap.id);
          if (existing) snap.id = newWorldId(); // avoid collision
          worlds.push(snap);
        });
        saveWorlds();
        renderWorldManagerList();
        toast(`📥 Đã nhập ${data.worlds.length} thế giới!`);
      } else if (data.id && data.name) {
        // Single world snapshot
        const existing = worlds.find(w => w.id === data.id);
        if (existing) data.id = newWorldId();
        worlds.push(data);
        saveWorlds();
        renderWorldManagerList();
        toast(`📥 Đã nhập thế giới: ${data.name}`);
      } else {
        toast("⚠️ File không hợp lệ!");
      }
    } catch(err) {
      toast("⚠️ Lỗi đọc file: " + err.message);
    }
  };
  reader.readAsText(file);
}

// ============================
// WORLD MANAGER UI
// ============================

function openWorldManager() {
  // Save current snapshot first
  if (currentWorldId) saveWorlds();
  const overlay = document.getElementById("worldManagerOverlay");
  if (overlay) {
    overlay.classList.remove("hidden");
    renderWorldManagerList();
  }
}

function closeWorldManager() {
  const overlay = document.getElementById("worldManagerOverlay");
  if (overlay) overlay.classList.add("hidden");
}

function renderWorldManagerList() {
  const container = document.getElementById("worldManagerList");
  if (!container) return;

  if (!worlds.length) {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--white-dim);font-style:italic">
      Chưa có thế giới nào. Hãy tạo thế giới đầu tiên!
    </div>`;
    return;
  }

  container.innerHTML = worlds.map(snap => {
    const isActive  = snap.id === currentWorldId;
    const npcCount  = (snap.npcs || []).length;
    const aliveCount = (snap.npcs || []).filter(n => n.status === "alive").length;
    const tmplMeta  = (typeof TEMPLATE_META !== "undefined" && TEMPLATE_META[snap.template]) ? TEMPLATE_META[snap.template] : null;
    const tmplIcon  = tmplMeta ? tmplMeta.desc.split(" ")[0] : "🌍";
    const savedDate = snap.savedAt ? new Date(snap.savedAt).toLocaleString("vi-VN") : "—";

    return `<div class="mw-world-card ${isActive ? "mw-active" : ""}" id="mwcard_${snap.id}">
      <div class="mw-card-left">
        <div class="mw-world-icon">${tmplIcon}</div>
        <div class="mw-world-info">
          <div class="mw-world-name">
            ${snap.name}
            ${isActive ? '<span class="mw-active-badge">⚡ ĐANG CHƠI</span>' : ""}
          </div>
          <div class="mw-world-meta">
            <span>📅 Năm ${snap.year || 1}</span>
            <span>👥 ${aliveCount}/${npcCount} tu sĩ</span>
            <span>🌐 ${tmplMeta ? tmplMeta.genre : snap.template}</span>
          </div>
          <div class="mw-world-saved">💾 ${savedDate}</div>
        </div>
      </div>
      <div class="mw-card-actions">
        ${!isActive ? `<button class="btn-primary mw-btn" onclick="switchWorld('${snap.id}')">▶ Vào</button>` : ""}
        <button class="btn-secondary mw-btn" onclick="duplicateWorld('${snap.id}')" title="Sao chép">📋</button>
        <button class="btn-secondary mw-btn" onclick="exportWorld('${snap.id}')" title="Xuất">📤</button>
        ${worlds.length > 1 ? `<button class="btn-danger mw-btn" onclick="deleteWorld('${snap.id}')" title="Xóa">🗑</button>` : ""}
      </div>
    </div>`;
  }).join("");

  // Update footer count
  const countEl = document.querySelector(".mw-footer div[style*='margin-left:auto']");
  if (countEl) countEl.textContent = worlds.length + " thế giới";
}

function updateWorldManagerUI() {
  // Update the top-bar world switcher badge
  const badge = document.getElementById("currentWorldBadge");
  if (badge) {
    badge.textContent = world ? world.name : "—";
  }
}

// ============================
// OVERRIDE save() / load() TO USE MULTI-WORLD
// ============================

// Preserve original save/load for legacy compatibility
// Use window property so hoisting doesn't cause self-reference
const _legacySave = (typeof window.save === "function") ? window.save.bind(window) : null;
const _legacyLoad = (typeof window.load === "function") ? window.load.bind(window) : null;

// Replace with multi-world versions (assign to window to avoid hoisting collision)
window.save = function save() {
  if (_legacySave) _legacySave(); // still write legacy keys (single-world apps still work)
  saveWorlds();
};

// Patch createWorld to integrate with multi-world
// Called after app.js is loaded so createWorld is available
function _patchCreateWorld() {
  const _orig = createWorld;
  createWorld = function() {
    if (!currentWorldId) currentWorldId = newWorldId();
    _orig();
    // Sync snapshot into worlds array
    const idx = worlds.findIndex(w => w.id === currentWorldId);
    const snap = captureWorldSnapshot();
    if (idx >= 0) worlds[idx] = snap;
    else worlds.push(snap);
    localStorage.setItem("cgv6_worlds",         JSON.stringify(worlds));
    localStorage.setItem("cgv6_currentWorldId",  currentWorldId);
    updateWorldManagerUI();
    renderWorldManagerList();
  };
}

// ============================
// BOOT — runs after DOM + other scripts load
// ============================

function initMultiWorldSystem() {
  // 1. Try legacy migration
  migrateLegacySave();

  // 2. Load worlds array
  loadWorlds();

  // 3. If we have worlds and a currentWorldId, restore active world
  if (worlds.length && currentWorldId) {
    const snap = worlds.find(w => w.id === currentWorldId);
    if (snap) restoreWorldSnapshot(snap);
  } else if (worlds.length) {
    // fallback: restore first world
    restoreWorldSnapshot(worlds[0]);
  }
  // else: no worlds — wait for user to createWorld

  // 4. Inject world switcher button into sidebar
  injectWorldManagerButton();

  // 5. Build the manager overlay if not already in DOM
  injectWorldManagerDOM();

  // 6. Patch createWorld to register in multi-world on creation
  _patchCreateWorld();

  // 7. Update badge
  updateWorldManagerUI();

  // 8. If worlds restored, re-render all
  if (world) {
    if (typeof renderAll === "function") renderAll();
    if (typeof updateWorldManagerUI === "function") updateWorldManagerUI();
  }
  // 9. Enforce EC sidebar visibility after inject
  setTimeout(function() { if (typeof ecRenderDynamicSidebar === 'function') ecRenderDynamicSidebar(); }, 100);
}

// ============================
// DOM INJECTION
// ============================

function injectWorldManagerButton() {
  if (document.getElementById("worldManagerNavBtn")) return;
  const nav = document.querySelector(".sidebar-nav");
  if (!nav) return;

  const btn = document.createElement("button");
  btn.id        = "worldManagerNavBtn";
  btn.className = "nav-btn ec-hidden";
  btn.style.display = "none";
  btn.setAttribute("data-panel", "worlds");
  btn.innerHTML = `<span class="nav-icon">🌐</span><span>Quản Lý Thế Giới</span>`;
  btn.onclick   = openWorldManager;

  // Insert at the top of nav, before first child
  nav.insertBefore(btn, nav.firstChild);
}

function injectWorldManagerDOM() {
  if (document.getElementById("worldManagerOverlay")) return;

  const overlay = document.createElement("div");
  overlay.id        = "worldManagerOverlay";
  overlay.className = "mw-overlay hidden";
  overlay.innerHTML = `
    <div class="mw-panel">
      <div class="mw-header">
        <div class="mw-title">🌐 Quản Lý Đa Thế Giới</div>
        <button class="mw-close-btn" onclick="closeWorldManager()">✕</button>
      </div>

      <!-- Create new world section -->
      <div class="mw-create-section">
        <div class="mw-section-title">✨ Khai Sinh Thế Giới Mới</div>
        <div class="mw-create-row">
          <input id="mwNewName" class="dao-input" placeholder="Tên thế giới mới..." style="flex:1;min-width:0">
          <select id="mwNewTemplate" class="dao-input" style="width:150px;flex-shrink:0">
            <option value="cultivation">☯️ Tu Tiên</option>
            <option value="fantasy">🧙 Fantasy</option>
            <option value="zombie">🧟 Zombie</option>
            <option value="mythology">⚡ Thần Thoại</option>
            <option value="scifi">🚀 Sci-Fi</option>
          </select>
          <select id="mwInitialPop" class="dao-input" style="width:170px;flex-shrink:0" title="Dân số ban đầu">
            <option value="0">✨ Hư Không (0 NPC)</option>
            <option value="10">🌱 Khai Nguyên (10)</option>
            <option value="20">🌿 Thảo Nguyên (20)</option>
            <option value="50" selected>🌳 Thịnh Vượng (50)</option>
            <option value="100">🌟 Đại Thế (100)</option>
          </select>
          <button class="btn-primary" onclick="createNewWorldFromManager()" style="white-space:nowrap;flex-shrink:0">+ Tạo</button>
        </div>
        <div style="font-size:11px;color:#64748b;padding:4px 0">💡 Thiên Đình cứu rỗi dân số là tùy chọn thủ công. Thế giới có thể tự nhiên tuyệt chủng.</div>
      </div>

      <!-- World list -->
      <div class="mw-section-title" style="padding:0 20px 10px">📚 Danh Sách Thế Giới</div>
      <div id="worldManagerList" class="mw-list"></div>

      <!-- Footer actions -->
      <div class="mw-footer">
        <button class="btn-secondary" onclick="document.getElementById('mwImportInput').click()">📥 Nhập Thế Giới</button>
        <button class="btn-secondary" onclick="exportAllWorlds()">📤 Xuất Tất Cả</button>
        <input id="mwImportInput" type="file" accept=".json" style="display:none"
               onchange="importWorldFromFile(this.files[0]); this.value=''">
        <div style="margin-left:auto;font-size:11px;color:var(--white-dim)">
          ${worlds.length} thế giới
        </div>
      </div>
    </div>
  `;

  // Click outside to close
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeWorldManager();
  });

  document.body.appendChild(overlay);
}

// ============================
// CSS INJECTION
// ============================

function injectMultiWorldCSS() {
  if (document.getElementById("multiWorldCSS")) return;
  const style = document.createElement("style");
  style.id = "multiWorldCSS";
  style.textContent = `
/* ============================
   MULTI-WORLD SYSTEM CSS
   ============================ */

.mw-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.mw-overlay.hidden { display: none !important; }

.mw-panel {
  background: var(--bg-secondary);
  border: 1px solid var(--border-hover);
  border-radius: 16px;
  width: 100%;
  max-width: 720px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(250,204,21,0.1);
}

.mw-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.mw-title {
  font-family: var(--font-heading);
  font-size: 16px;
  color: var(--gold);
  letter-spacing: 1.5px;
}
.mw-close-btn {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--white-dim);
  cursor: pointer;
  padding: 4px 10px;
  font-size: 14px;
  transition: all 0.2s;
}
.mw-close-btn:hover { border-color: var(--red); color: var(--red); }

.mw-create-section {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.mw-section-title {
  font-size: 11px;
  letter-spacing: 1.5px;
  color: var(--gold-dim);
  margin-bottom: 10px;
  text-transform: uppercase;
}
.mw-create-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.mw-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mw-world-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
}
.mw-world-card:hover {
  border-color: var(--border-hover);
  background: rgba(250,204,21,0.03);
}
.mw-world-card.mw-active {
  border-color: rgba(250,204,21,0.5);
  background: linear-gradient(135deg, rgba(250,204,21,0.06), rgba(250,204,21,0.02));
  box-shadow: 0 0 12px rgba(250,204,21,0.1);
}

.mw-card-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}
.mw-world-icon {
  font-size: 28px;
  flex-shrink: 0;
  width: 40px;
  text-align: center;
}
.mw-world-info { flex: 1; min-width: 0; }
.mw-world-name {
  font-family: var(--font-title);
  font-size: 14px;
  color: var(--white-main);
  font-weight: 600;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.mw-active-badge {
  font-size: 9px;
  background: rgba(250,204,21,0.15);
  border: 1px solid rgba(250,204,21,0.4);
  color: var(--gold);
  padding: 1px 7px;
  border-radius: 10px;
  letter-spacing: 0.5px;
  font-weight: 700;
}
.mw-world-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 11px;
  color: var(--white-dim);
  margin-bottom: 4px;
}
.mw-world-saved {
  font-size: 10px;
  color: rgba(232,232,240,0.3);
  font-style: italic;
}

.mw-card-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}
.mw-btn {
  padding: 5px 10px !important;
  font-size: 12px !important;
  min-width: 36px;
}

.btn-danger {
  background: transparent;
  border: 1px solid rgba(248,113,113,0.3);
  color: var(--red);
  border-radius: 6px;
  cursor: pointer;
  padding: 6px 12px;
  font-size: 12px;
  transition: all 0.2s;
}
.btn-danger:hover {
  background: rgba(248,113,113,0.1);
  border-color: var(--red);
}

.mw-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 10px;
  align-items: center;
  flex-shrink: 0;
  flex-wrap: wrap;
}

/* Top-bar world badge */
#currentWorldBadge {
  font-size: 12px;
  color: var(--gold);
  background: rgba(250,204,21,0.08);
  border: 1px solid rgba(250,204,21,0.2);
  border-radius: 20px;
  padding: 2px 10px;
  cursor: pointer;
  transition: all 0.2s;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
#currentWorldBadge:hover {
  background: rgba(250,204,21,0.15);
  border-color: var(--gold);
}

@media (max-width: 768px) {
  .mw-panel { max-height: 95vh; border-radius: 12px; }
  .mw-card-left { flex-direction: column; align-items: flex-start; }
  .mw-world-icon { display: none; }
}
  `;
  document.head.appendChild(style);
}

// ============================
// INJECT WORLD BADGE IN TOP-BAR
// ============================

function injectWorldBadge() {
  if (document.getElementById("currentWorldBadge")) return;
  const topLeft = document.querySelector(".top-bar-left");
  if (!topLeft) return;
  const badge = document.createElement("span");
  badge.id        = "currentWorldBadge";
  badge.title     = "Mở Quản Lý Thế Giới";
  badge.onclick   = openWorldManager;
  badge.textContent = world ? world.name : "—";
  topLeft.appendChild(badge);
}

// ============================
// AUTO-SAVE EVERY N YEARS (hook into simulation)
// ============================

// Patch tickYear (if it exists) to auto-save worlds
const _origTickYear = (typeof tickYear === "function") ? tickYear : null;
if (_origTickYear) {
  tickYear = function() {
    _origTickYear();
    // Auto-save worlds every 10 in-game years
    if (year % 10 === 0) saveWorlds();
  };
}

// ============================
// INIT ON DOM READY
// ============================

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    injectMultiWorldCSS();
    initMultiWorldSystem();
    injectWorldBadge();
  });
} else {
  injectMultiWorldCSS();
  initMultiWorldSystem();
  injectWorldBadge();
}
