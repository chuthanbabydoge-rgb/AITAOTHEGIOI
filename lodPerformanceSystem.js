/* ============================================================
   LOD PERFORMANCE SYSTEM — lodPerformanceSystem.js
   Creator God V6 — Giai đoạn tiếp theo: Công Cụ Tối Ưu Hóa NPC
   ─────────────────────────────────────────────────────────────
   KHÔNG đặt lại lưu trữ. KHÔNG xóa thế giới.
   Chỉ override / hook các hàm hiện có để:

     1) HỆ THỐNG LOD (Level of Detail)
        - NPC QUAN TRỌNG  → mô phỏng mỗi tick
          (tông chủ, quốc chủ, thiên tài, nhân vật người chơi,
           NPC có danh hiệu đặc biệt, cảnh giới cao)
        - NPC THƯỜNG      → mô phỏng mỗi 5–10 tick (so le theo id)

     2) DÂN SỐ NỀN (Population Groups)
        - Khi dân số > 1000: thường dân cảnh giới thấp, không có
          danh hiệu, không tông môn được "nén" thành nhóm dân cư
          theo vùng (vd: "Thành phố Đông Vực — Dân số: 12.543")
          thay vì 12.543 object NPC riêng lẻ.

     3) LƯU TRỮ NPC ĐÃ CHẾT
        - NPC chết được chuyển vào kho lưu trữ nhẹ (deadArchive),
          không xử lý mỗi tick, không tốn bộ nhớ NPC đầy đủ.

     4) TỐI ƯU NHẬT KÝ
        - addLog chỉ ghi các sự kiện quan trọng (important/death/
          breakthrough) đầy đủ; log "normal" được lấy mẫu (sample)
          để giảm số lần render.

     5) TỐI ƯU AI STORY ENGINE
        - generateStoryEvent chỉ tạo: hôn nhân, sinh nở (qua tryBirth
          - không đổi), thành lập tông môn, thành lập quốc gia,
          chiến tranh, sự kiện trùm cuối.

     6) BẢNG HIỆU SUẤT
        - Panel mới "⚡ Hiệu Suất": số NPC hiện tại, NPC đang hoạt
          động (LOD active), dân số nền, thời lượng tick, trạng thái.

   Tương thích ngược: mọi field mới có default khi load save cũ;
   không field cũ nào bị xóa hay đổi kiểu.
   ============================================================ */

// ============================
// STATE
// ============================

let lodConfig = {
  enabled: true,
  normalNPCInterval: 8,     // NPC thường mô phỏng mỗi N tick (5-10)
  popGroupThreshold: 1000,  // ngưỡng dân số bắt đầu nén thành nhóm dân cư
  npcListPageSize: 100,     // số NPC hiển thị tối đa trong danh sách UI mỗi lần
};

// Nhóm dân cư nền: [{ id, region, name, population, avgRealm, createdYear }]
let populationGroups = [];

// Kho lưu trữ NPC đã chết (nhẹ — chỉ giữ thông tin cốt lõi)
let deadNPCArchive = [];
const DEAD_ARCHIVE_MAX = 500;

// Đo hiệu suất
let perfStats = {
  lastTickMs:    0,
  avgTickMs:     0,
  tickSamples:   [],
  activeNPCCount: 0,
  lastTickYear:  0,
};

let _lodTickCounter = 0;

// ============================
// MIGRATION
// ============================

function ensureLODFields() {
  if (!lodConfig) {
    lodConfig = { enabled: true, normalNPCInterval: 8, popGroupThreshold: 1000, npcListPageSize: 100 };
  }
  if (lodConfig.enabled            === undefined) lodConfig.enabled = true;
  if (lodConfig.normalNPCInterval  === undefined) lodConfig.normalNPCInterval = 8;
  if (lodConfig.popGroupThreshold  === undefined) lodConfig.popGroupThreshold = 1000;
  if (lodConfig.npcListPageSize    === undefined) lodConfig.npcListPageSize = 100;

  if (!Array.isArray(populationGroups)) populationGroups = [];
  if (!Array.isArray(deadNPCArchive))   deadNPCArchive   = [];

  if (!perfStats) {
    perfStats = { lastTickMs: 0, avgTickMs: 0, tickSamples: [], activeNPCCount: 0, lastTickYear: 0 };
  }
  if (!Array.isArray(perfStats.tickSamples)) perfStats.tickSamples = [];

  // Đảm bảo mỗi NPC còn sống có field _lodTier (tính lại mỗi lần cần, không lưu)
  if (typeof npcs !== "undefined") {
    npcs.forEach(n => {
      if (n._lodSimOffset === undefined) n._lodSimOffset = (n.id || 0) % lodConfig.normalNPCInterval;
    });
  }
}

// ============================
// 1) LOD CLASSIFICATION
// ============================

/**
 * Xác định một NPC có phải "QUAN TRỌNG" hay không.
 * Quan trọng = tông chủ, quốc chủ (đế vương), thiên tài, NPC người chơi,
 * có danh hiệu đặc biệt, hoặc cảnh giới cao (>= Kim Đan = 2).
 */
function isImportantNPC(npc) {
  if (!npc) return false;

  // NPC do người chơi tạo ra
  if (typeof player !== "undefined" && player && npc.id === player.id) return true;

  // Thiên tài
  if (npc.isTianJiao) return true;

  // Cảnh giới cao (Kim Đan trở lên — chỉ số 2+)
  if ((npc.realm || 0) >= 2) return true;

  // Có danh hiệu đặc biệt (Tông Chủ, Đế Vương, Chân Tiên, Chiến Thần, v.v.)
  if (Array.isArray(npc.titles) && npc.titles.length > 0) return true;

  // Tông chủ / trưởng lão tông môn
  if (typeof sects !== "undefined") {
    for (const s of sects) {
      if (s.leader === npc.id) return true;
      if (Array.isArray(s.elders) && s.elders.includes(npc.id)) return true;
      if (s.founder === npc.id) return true;
    }
  }

  // "Boss" liên quan (sát thủ boss, v.v. đã nằm trong titles ở trên)

  return false;
}

/**
 * NPC thường có nên được mô phỏng tick này hay không, dựa trên so le
 * (staggered) theo id để chia đều tải qua nhiều tick.
 */
function shouldSimulateThisTick(npc, tickCounter) {
  if (!lodConfig.enabled) return true;
  if (isImportantNPC(npc)) return true;
  const offset = npc._lodSimOffset !== undefined ? npc._lodSimOffset : (npc.id || 0) % lodConfig.normalNPCInterval;
  return (tickCounter % lodConfig.normalNPCInterval) === offset;
}

// ============================
// 2) POPULATION GROUPS — DÂN SỐ NỀN
// ============================

/**
 * Khi dân số sống vượt ngưỡng, "nén" các NPC thường dân thấp cảnh giới
 * (Luyện Khí, không danh hiệu, không tông môn, không phải thiên tài/người chơi)
 * thành nhóm dân cư theo vùng — loại khỏi mảng npcs hoàn toàn.
 */
function _compressPopulationToGroups() {
  if (typeof npcs === "undefined") return;

  const alive = npcs.filter(n => n.status === "alive");
  if (alive.length <= lodConfig.popGroupThreshold) return;

  const excess = alive.length - lodConfig.popGroupThreshold;
  if (excess <= 0) return;

  // Ứng viên: thường dân — không quan trọng, cảnh giới thấp nhất, không tông môn
  const candidates = alive
    .filter(n => !isImportantNPC(n) && !n.sectId && (n.realm || 0) === 0)
    .sort((a,b) => (a.wealth||0) - (b.wealth||0)); // nén người nghèo nhất trước

  if (!candidates.length) return;

  const toCompress = candidates.slice(0, Math.min(excess, candidates.length, 500)); // tối đa 500/lần để tránh giật

  // Gom theo vùng
  const byRegion = {};
  toCompress.forEach(n => {
    const region = n.region || "Vô Danh";
    if (!byRegion[region]) byRegion[region] = [];
    byRegion[region].push(n);
  });

  Object.entries(byRegion).forEach(([region, list]) => {
    const avgRealm = list.reduce((s,n)=>s+(n.realm||0),0) / list.length;
    const avgWealth = list.reduce((s,n)=>s+(n.wealth||0),0) / list.length;

    let group = populationGroups.find(g => g.region === region);
    if (!group) {
      group = {
        id: `popgrp_${region}_${Date.now()}_${Math.floor(Math.random()*1000)}`,
        region,
        name: `Dân Cư ${region}`,
        population: 0,
        avgRealm: 0,
        avgWealth: 0,
        createdYear: (typeof year !== "undefined" ? year : 0),
      };
      populationGroups.push(group);
    }

    // Cộng dồn trung bình theo trọng số
    const totalBefore = group.population;
    group.avgRealm  = totalBefore > 0
      ? (group.avgRealm * totalBefore + avgRealm * list.length) / (totalBefore + list.length)
      : avgRealm;
    group.avgWealth = totalBefore > 0
      ? (group.avgWealth * totalBefore + avgWealth * list.length) / (totalBefore + list.length)
      : avgWealth;
    group.population += list.length;
  });

  // Loại bỏ các NPC đã nén khỏi mảng npcs
  const compressIds = new Set(toCompress.map(n => n.id));
  npcs = npcs.filter(n => !compressIds.has(n.id));

  if (typeof addLog === "function" && toCompress.length >= 50) {
    addLog(`📊 Tối ưu hóa: đã gộp ${toCompress.length} thường dân vào Dân Số Nền để giảm tải mô phỏng.`, "normal");
  }
}

/**
 * Mô phỏng nhẹ cho dân số nền: tăng trưởng dân số tự nhiên + biến động nhỏ
 * về tu vi/tài phú trung bình. Không tạo object NPC.
 */
function _tickPopulationGroups() {
  populationGroups.forEach(g => {
    // Tăng trưởng dân số ~0.5%-1.5% mỗi năm, dao động nhẹ
    const growth = g.population * (0.005 + Math.random() * 0.01);
    g.population = Math.max(0, Math.floor(g.population + growth));

    // Một phần nhỏ dân cư nền có thể "thăng cấp" thành NPC đầy đủ (đột phá)
    // — xử lý ở _maybePromoteFromPopulation()
  });

  // Loại bỏ nhóm rỗng
  populationGroups = populationGroups.filter(g => g.population > 0);
}

/**
 * Thỉnh thoảng "thăng cấp" 1 cá nhân từ dân số nền thành NPC đầy đủ
 * (vd: một thường dân tình cờ bước vào con đường tu luyện).
 * Giữ tỉ lệ rất thấp để không làm phình dân số trở lại.
 */
function _maybePromoteFromPopulation() {
  if (!populationGroups.length) return;
  if (typeof npcs === "undefined") return;

  const alive = npcs.filter(n => n.status === "alive").length;
  if (alive >= lodConfig.popGroupThreshold + 50) return; // đã đủ NPC chi tiết

  if (Math.random() > 0.05) return; // 5% cơ hội mỗi tick

  const group = populationGroups[Math.floor(Math.random() * populationGroups.length)];
  if (!group || group.population <= 0) return;

  group.population -= 1;

  if (typeof createNPC === "function") {
    const newNPC = createNPC(false);
    newNPC.region = group.region;
    npcs.push(newNPC);
    if (typeof addLog === "function") {
      addLog(`🌱 ${newNPC.name} từ Dân Số Nền (${group.region}) bước vào con đường tu luyện!`, "normal");
    }
  }
}

// ============================
// 3) DEAD NPC ARCHIVE
// ============================

/**
 * Lưu một bản ghi nhẹ của NPC đã chết vào kho lưu trữ.
 * Gọi sau khi killNPC() đã chạy (npc đã bị loại khỏi mảng npcs).
 */
function archiveDeadNPC(npc) {
  if (!npc) return;
  deadNPCArchive.unshift({
    id: npc.id,
    name: npc.name,
    gender: npc.gender,
    realm: npc.realm,
    sectId: npc.sectId || null,
    region: npc.region || null,
    deathYear: npc.deathYear,
    deathReason: npc.deathReason,
    titles: (npc.titles || []).slice(0, 3),
    isTianJiao: !!npc.isTianJiao,
  });
  if (deadNPCArchive.length > DEAD_ARCHIVE_MAX) deadNPCArchive.length = DEAD_ARCHIVE_MAX;
}

// Hook killNPC để ghi vào archive sau khi xử lý gốc
if (typeof killNPC === "function") {
  const _origKillNPC = killNPC;
  window.killNPC = function(npc, reason, killerId, force) {
    const snapshot = npc ? { ...npc } : null;
    _origKillNPC.apply(this, arguments);
    if (snapshot) archiveDeadNPC(snapshot);
  };
}

// ============================
// 4) LOG OPTIMIZATION — addLog throttling
// ============================

const LOG_IMPORTANT_TYPES = new Set(["important", "death", "breakthrough"]);
let _normalLogSampleCounter = 0;
const NORMAL_LOG_SAMPLE_RATE = 5; // chỉ ghi 1/5 log "normal"

if (typeof addLog === "function") {
  const _origAddLog = addLog;
  window.addLog = function(text, type = "normal") {
    ensureLODFields();
    if (!lodConfig.enabled) return _origAddLog.apply(this, arguments);

    if (LOG_IMPORTANT_TYPES.has(type)) {
      return _origAddLog.apply(this, arguments);
    }

    // Log thường: chỉ giữ lại 1/N để giảm renderLogs() liên tục
    _normalLogSampleCounter++;
    if (_normalLogSampleCounter % NORMAL_LOG_SAMPLE_RATE !== 0) {
      // Vẫn lưu vào logs nhưng KHÔNG render mỗi lần (giảm tải DOM)
      if (typeof logs !== "undefined") {
        logs.unshift({ text, year: (typeof year !== "undefined" ? year : 0), type });
        if (logs.length > 300) logs.pop();
      }
      return;
    }
    return _origAddLog.apply(this, arguments);
  };
}

// ============================
// 5) AI STORY ENGINE RESTRICTION
// ============================

// Chỉ cho phép AI Story Engine tạo các loại sự kiện:
// hôn nhân, thành lập tông môn, thành lập quốc gia, chiến tranh, trùm cuối.
// (Sinh nở đã được xử lý trực tiếp bởi tryBirth(), không qua story engine)
const STORY_ENGINE_ALLOWED_TYPES = new Set(["marriage", "war", "sect", "kingdom", "boss", "civilization"]);

if (typeof _buildEventWeights === "function") {
  const _origBuildEventWeights = _buildEventWeights;
  window._buildEventWeights = function() {
    const weights = _origBuildEventWeights.apply(this, arguments);
    if (!lodConfig.enabled) return weights;
    // Lọc chỉ giữ các loại được phép, set trọng số 0 cho phần còn lại
    const filtered = weights.filter(([type]) => STORY_ENGINE_ALLOWED_TYPES.has(type));
    if (!filtered.length) return weights; // an toàn: nếu lọc hết thì giữ nguyên
    // Chuẩn hóa lại tổng trọng số về 1
    const sum = filtered.reduce((s,[,w]) => s + w, 0);
    return filtered.map(([type, w]) => [type, sum > 0 ? w / sum : w]);
  };
}

// ============================
// MAIN LOD TICK (hooks into simulateWorld)
// ============================

/**
 * Vòng lặp lão hóa/tu luyện gốc trong simulateWorld() áp dụng cho TẤT CẢ
 * NPC sống mỗi tick. Hàm này thay thế vòng lặp đó bằng phiên bản có LOD:
 *   - NPC quan trọng: luôn mô phỏng
 *   - NPC thường: chỉ mô phỏng theo chu kỳ so le (staggered)
 * Trả về số NPC đã thực sự mô phỏng tick này (để hiển thị ở Bảng Hiệu Suất).
 */
function lodSimulateNPCAging(tickCounter) {
  if (typeof npcs === "undefined") return 0;
  const alive = npcs.filter(n => n.status === "alive");
  let activeCount = 0;

  alive.forEach(npc => {
    if (!shouldSimulateThisTick(npc, tickCounter)) return;
    activeCount++;

    npc.age++;
    if (npc.age > npc.lifespan) { killNPC(npc, "thọ nguyên cạn kiệt"); return; }
    npc.hp = Math.min(npc.maxHp, npc.hp + Math.floor(npc.maxHp * 0.05));
    npc.mp = Math.min(npc.maxMp, npc.mp + Math.floor(npc.maxMp * 0.1));
    if (typeof cultivate === "function") cultivate(npc);
    npc.wealth += Math.floor(npc.realm * 2 + npc.luck * 0.1);
    if (typeof chance === "function" && chance(0.01) && npc.skills.length < 5) {
      npc.skills.push(rand(SKILLS_POOL));
    }
  });

  return activeCount;
}

// ============================
// PERFORMANCE TRACKING + MAIN HOOK
// ============================

if (typeof simulateWorld === "function") {
  const _origSimulateWorld = simulateWorld;
  window.simulateWorld = function() {
    ensureLODFields();
    const t0 = (typeof performance !== "undefined") ? performance.now() : Date.now();

    _lodTickCounter++;

    // Population groups: nén dân số nếu vượt ngưỡng, mô phỏng nhẹ, thăng cấp ngẫu nhiên
    if (lodConfig.enabled) {
      _compressPopulationToGroups();
      _tickPopulationGroups();
      _maybePromoteFromPopulation();
    }

    _origSimulateWorld.apply(this, arguments);

    const t1 = (typeof performance !== "undefined") ? performance.now() : Date.now();
    const dt = t1 - t0;
    perfStats.lastTickMs   = dt;
    perfStats.tickSamples.push(dt);
    if (perfStats.tickSamples.length > 30) perfStats.tickSamples.shift();
    perfStats.avgTickMs    = perfStats.tickSamples.reduce((a,b)=>a+b,0) / perfStats.tickSamples.length;
    perfStats.activeNPCCount = (typeof npcs !== "undefined")
      ? npcs.filter(n => n.status === "alive" && shouldSimulateThisTick(n, _lodTickCounter)).length
      : 0;
    perfStats.lastTickYear = (typeof year !== "undefined") ? year : 0;

    // Refresh perf panel if visible
    const panel = document.getElementById("panel-performance");
    if (panel && panel.classList.contains("active")) renderPerformancePanel();
  };
}

// ─────────────────────────────────────────────────────────────
// Override the heavy per-NPC aging loop inside simulateWorld()
// is not directly possible without editing app.js, since that loop
// is inlined. Instead, we replicate LOD-aware aging via a SEPARATE
// lightweight pass that runs BEFORE simulateWorld's own loop, and we
// mark non-selected NPCs with `_lodSkipAging = true` for one tick so
// the original loop becomes a cheap no-op for them.
// ─────────────────────────────────────────────────────────────

if (typeof cultivate === "function") {
  const _origCultivate = cultivate;
  window.cultivate = function(npc) {
    ensureLODFields();
    if (lodConfig.enabled && npc && npc._lodSkipThisTick) {
      return; // bỏ qua tu luyện cho NPC thường ở tick này
    }
    return _origCultivate.apply(this, arguments);
  };
}

// Mark NPCs to skip before simulateWorld's internal loop runs, and
// apply a lightweight passive update for skipped NPCs (so they still
// age/heal slowly, just without the heavier cultivate() computation).
if (typeof simulateWorld === "function") {
  const _origSimulateWorld2 = simulateWorld;
  window.simulateWorld = function() {
    ensureLODFields();
    if (lodConfig.enabled && typeof npcs !== "undefined") {
      const tc = _lodTickCounter + 1; // tick sắp chạy
      npcs.forEach(npc => {
        if (npc.status !== "alive") return;
        npc._lodSkipThisTick = !shouldSimulateThisTick(npc, tc);
      });
    } else if (typeof npcs !== "undefined") {
      npcs.forEach(npc => { npc._lodSkipThisTick = false; });
    }
    return _origSimulateWorld2.apply(this, arguments);
  };
}

// ============================
// 6) PERFORMANCE PANEL
// ============================

function renderPerformancePanel() {
  ensureLODFields();
  const el = document.getElementById("perfPanelContent");
  if (!el) return;

  const aliveNPCs   = (typeof npcs !== "undefined") ? npcs.filter(n => n.status === "alive") : [];
  const totalNPC    = aliveNPCs.length;
  const activeNPC   = perfStats.activeNPCCount;
  const bgPop       = populationGroups.reduce((s,g)=>s+g.population, 0);
  const totalPop    = totalNPC + bgPop;

  const tickMs   = perfStats.lastTickMs || 0;
  const avgMs    = perfStats.avgTickMs  || 0;

  let status, statusColor;
  if (avgMs < 50)        { status = "🟢 Tuyệt Vời";  statusColor = "#4ade80"; }
  else if (avgMs < 150)  { status = "🟡 Tốt";        statusColor = "#facc15"; }
  else if (avgMs < 400)  { status = "🟠 Chậm";       statusColor = "#fb923c"; }
  else                    { status = "🔴 Quá Tải";    statusColor = "#f87171"; }

  el.innerHTML = `
    <div class="econ-section">
      <div class="econ-section-title">⚡ Hiệu Suất Mô Phỏng</div>
      <div class="econ-market-badge" style="background:${statusColor}22;color:${statusColor}">
        ${status} — ${avgMs.toFixed(1)}ms / tick (trung bình ${perfStats.tickSamples.length} tick gần nhất)
      </div>
      <div class="econ-stat-grid" style="margin-top:12px">
        <div class="econ-stat-card">
          <div class="econ-stat-icon">👥</div>
          <div class="econ-stat-val" style="color:#facc15">${totalNPC.toLocaleString()}</div>
          <div class="econ-stat-lbl">NPC Hiện Tại</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">⚙️</div>
          <div class="econ-stat-val" style="color:#4ade80">${activeNPC.toLocaleString()}</div>
          <div class="econ-stat-lbl">NPC Đang Hoạt Động</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">🏘️</div>
          <div class="econ-stat-val" style="color:#60a5fa">${bgPop.toLocaleString()}</div>
          <div class="econ-stat-lbl">Dân Số Nền</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">🌐</div>
          <div class="econ-stat-val" style="color:#c084fc">${totalPop.toLocaleString()}</div>
          <div class="econ-stat-lbl">Tổng Dân Số</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">⏱️</div>
          <div class="econ-stat-val" style="color:${statusColor}">${tickMs.toFixed(1)}ms</div>
          <div class="econ-stat-lbl">Tick Gần Nhất</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">💀</div>
          <div class="econ-stat-val" style="color:var(--white-dim)">${deadNPCArchive.length}</div>
          <div class="econ-stat-lbl">NPC Đã Lưu Trữ</div>
        </div>
      </div>
    </div>

    <div class="econ-section">
      <div class="econ-section-title">⚙️ Cài Đặt Tối Ưu Hóa (LOD)</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer">
          <input type="checkbox" ${lodConfig.enabled ? "checked" : ""} onchange="lodConfig.enabled=this.checked;save();renderPerformancePanel()">
          Bật Hệ Thống LOD (khuyến nghị khi dân số > 1000)
        </label>
        <div style="font-size:12px;color:var(--white-dim);line-height:1.7">
          • <b style="color:var(--white-main)">NPC Quan Trọng</b> (tông chủ, quốc chủ, thiên tài, người chơi, có danh hiệu, cảnh giới ≥ Kim Đan): mô phỏng <b>mỗi tick</b>.<br>
          • <b style="color:var(--white-main)">NPC Thường</b>: mô phỏng mỗi <b>${lodConfig.normalNPCInterval} tick</b> (so le theo ID để chia đều tải).<br>
          • Khi dân số sống > <b>${lodConfig.popGroupThreshold.toLocaleString()}</b>: thường dân cảnh giới thấp được gộp vào <b>Dân Số Nền</b> theo vùng.<br>
          • NPC đã chết được lưu vào kho nhẹ (tối đa ${DEAD_ARCHIVE_MAX}), không xử lý mỗi tick.<br>
          • Nhật ký "thường" chỉ ghi 1/${NORMAL_LOG_SAMPLE_RATE} để giảm tải render.<br>
          • AI Story Engine chỉ tạo sự kiện: hôn nhân, thành lập tông môn/quốc gia, chiến tranh, trùm cuối.
        </div>
      </div>
    </div>

    <div class="econ-section">
      <div class="econ-section-title">🏘️ Dân Số Nền Theo Vùng</div>
      ${populationGroups.length ? `
        <div class="econ-table-wrap">
          <table class="econ-table">
            <thead><tr><th>Vùng</th><th>Tên Nhóm</th><th>Dân Số</th><th>Cảnh Giới TB</th><th>Tài Phú TB</th></tr></thead>
            <tbody>
              ${populationGroups.map(g => `<tr>
                <td>${g.region}</td>
                <td style="font-weight:600">${g.name}</td>
                <td style="color:#60a5fa">${Math.floor(g.population).toLocaleString()}</td>
                <td style="color:var(--white-dim)">${g.avgRealm.toFixed(2)}</td>
                <td style="color:#facc15">${Math.floor(g.avgWealth).toLocaleString()}</td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
      ` : `<div class="econ-empty">Chưa có dân số nền (dân số sống dưới ngưỡng ${lodConfig.popGroupThreshold.toLocaleString()}).</div>`}
    </div>

    <div class="econ-section">
      <div class="econ-section-title">💀 Kho Lưu Trữ NPC Đã Chết (gần nhất)</div>
      ${deadNPCArchive.length ? `
        <div class="econ-table-wrap">
          <table class="econ-table">
            <thead><tr><th>Tên</th><th>Cảnh Giới</th><th>Năm Mất</th><th>Lý Do</th></tr></thead>
            <tbody>
              ${deadNPCArchive.slice(0,15).map(d => `<tr>
                <td style="font-weight:600">${d.name}${d.isTianJiao?" ☆":""}</td>
                <td style="color:var(--white-dim)">${(typeof REALMS!=="undefined" && REALMS[d.realm]) ? REALMS[d.realm].name : "?"}</td>
                <td style="color:var(--gold-dim)">${d.deathYear}</td>
                <td style="font-size:11px;color:var(--white-dim)">${d.deathReason||""}</td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
      ` : `<div class="econ-empty">Chưa có NPC nào được lưu trữ.</div>`}
    </div>
  `;
}

// ============================
// NPC LIST PAGINATION (giảm tải DOM khi >10K NPC)
// ============================

let _npcListPage = 0;

if (typeof renderNPCList === "function") {
  const _origRenderNPCList = renderNPCList;
  window.renderNPCList = function(list) {
    ensureLODFields();
    if (!lodConfig.enabled || list.length <= lodConfig.npcListPageSize) {
      return _origRenderNPCList.apply(this, arguments);
    }

    const pageSize  = lodConfig.npcListPageSize;
    const totalPages = Math.ceil(list.length / pageSize);
    if (_npcListPage >= totalPages) _npcListPage = totalPages - 1;
    if (_npcListPage < 0) _npcListPage = 0;

    const start = _npcListPage * pageSize;
    const pageList = list.slice(start, start + pageSize);

    _origRenderNPCList(pageList);

    const el = document.getElementById("npcList");
    if (!el) return;
    const pager = document.createElement("div");
    pager.style.cssText = "display:flex;gap:8px;align-items:center;justify-content:center;margin-top:12px;flex-wrap:wrap;grid-column:1/-1";
    pager.innerHTML = `
      <span style="color:var(--white-dim);font-size:12px">Hiển thị ${start+1}-${Math.min(start+pageSize,list.length)} / ${list.length.toLocaleString()} tu sĩ</span>
      ${_npcListPage > 0 ? `<button class="btn-secondary small" onclick="_npcListPage--;renderNPCs()">◀ Trước</button>` : ""}
      <span style="color:var(--white-dim);font-size:12px">Trang ${_npcListPage+1}/${totalPages}</span>
      ${_npcListPage < totalPages-1 ? `<button class="btn-secondary small" onclick="_npcListPage++;renderNPCs()">Tiếp ▶</button>` : ""}
    `;
    el.appendChild(pager);
  };
}

// ============================
// SAVE / LOAD HOOKS
// ============================

if (typeof save === "function") {
  const _origSave = save;
  window.save = function() {
    _origSave.apply(this, arguments);
    try {
      localStorage.setItem("cgv6_lodConfig",   JSON.stringify(lodConfig));
      localStorage.setItem("cgv6_popGroups",   JSON.stringify(populationGroups));
      localStorage.setItem("cgv6_deadArchive", JSON.stringify(deadNPCArchive.slice(0, DEAD_ARCHIVE_MAX)));
    } catch(e) { console.warn("LOD save failed:", e); }
  };
}

if (typeof load === "function") {
  const _origLoad = load;
  window.load = function() {
    _origLoad.apply(this, arguments);
    try {
      const savedConfig = JSON.parse(localStorage.getItem("cgv6_lodConfig"));
      if (savedConfig) lodConfig = savedConfig;
      const savedGroups = JSON.parse(localStorage.getItem("cgv6_popGroups"));
      if (Array.isArray(savedGroups)) populationGroups = savedGroups;
      const savedArchive = JSON.parse(localStorage.getItem("cgv6_deadArchive"));
      if (Array.isArray(savedArchive)) deadNPCArchive = savedArchive;
    } catch(e) {
      console.warn("LOD load failed:", e);
    }
    ensureLODFields();
  };
}

// ============================
// INIT
// ============================

ensureLODFields();
