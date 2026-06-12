/* ============================================================
   HỆ THỐNG GIỚI HẠN DÂN SỐ — populationLimitSystem.js
   Creator God V6 — Tối Ưu Hóa Hiệu Suất Thế Giới
   ─────────────────────────────────────────────────────────────
   MỤC TIÊU: Giữ NPC hoạt động trong khoảng 100–500
   GIỚI HẠN CỨNG: Tối đa 500 NPC hoạt động mỗi lúc
   DÂN SỐ TRỪU TƯỢNG: Dân số vượt 500 → chuyển thành số liệu
   TƯƠNG THÍCH: Mọi file lưu cũ đều hoạt động bình thường
   ============================================================ */

// ============================
// HẰNG SỐ & CẤU HÌNH
// ============================

const POP_LIMIT = {
  HARD_CAP:         500,   // Giới hạn cứng NPC hoạt động tối đa
  SOFT_TARGET:      400,   // Bắt đầu nén khi vượt ngưỡng này
  MIN_ACTIVE:       100,   // Ngưỡng tối thiểu — dưới này sẽ thúc đẩy sinh sản
  COMPRESS_BATCH:   200,   // Số NPC nén mỗi lần (tránh giật)
  PROMOTE_CHANCE:   0.04,  // Xác suất thăng cấp từ dân số trừu tượng mỗi tick
  ABSTRACT_GROWTH:  0.008, // Tốc độ tăng trưởng dân số trừu tượng mỗi tick
};

// Trạng thái hệ thống
let popLimitState = {
  enabled:           true,
  abstractPop:       {},   // { [regionName]: { population, avgRealm, avgWealth } }
  totalAbstract:     0,    // Tổng dân số trừu tượng (tính lại mỗi tick)
  lastCompressYear:  0,
  stats: {
    totalCompressed: 0,    // Tổng NPC đã chuyển thành trừu tượng
    totalPromoted:   0,    // Tổng NPC được thăng cấp từ trừu tượng
  }
};

// ============================
// MIGRATION — TƯƠNG THÍCH LƯU CŨ
// ============================

function ensurePopLimitFields() {
  if (!popLimitState) {
    popLimitState = {
      enabled: true,
      abstractPop: {},
      totalAbstract: 0,
      lastCompressYear: 0,
      stats: { totalCompressed: 0, totalPromoted: 0 }
    };
  }
  if (popLimitState.enabled           === undefined) popLimitState.enabled = true;
  if (!popLimitState.abstractPop)      popLimitState.abstractPop = {};
  if (!popLimitState.stats)            popLimitState.stats = { totalCompressed: 0, totalPromoted: 0 };
  if (popLimitState.totalAbstract      === undefined) popLimitState.totalAbstract = 0;
  if (popLimitState.lastCompressYear   === undefined) popLimitState.lastCompressYear = 0;

  // Đồng bộ với populationGroups từ LOD system nếu có
  if (typeof populationGroups !== "undefined" && Array.isArray(populationGroups) && populationGroups.length > 0) {
    populationGroups.forEach(g => {
      if (!popLimitState.abstractPop[g.region]) {
        popLimitState.abstractPop[g.region] = {
          population: g.population,
          avgRealm:   g.avgRealm || 0,
          avgWealth:  g.avgWealth || 0,
        };
      }
    });
  }

  _recalcTotalAbstract();
}

function _recalcTotalAbstract() {
  popLimitState.totalAbstract = Object.values(popLimitState.abstractPop)
    .reduce((s, g) => s + (g.population || 0), 0);
}

// ============================
// PHÂN LOẠI NPC CÓ THỂ NÉN
// ============================

/**
 * NPC có thể chuyển thành dân số trừu tượng khi vượt giới hạn:
 * - Không quan trọng (không phải thiên tài, tông chủ, trưởng lão, người chơi)
 * - Cảnh giới thấp (Luyện Khí = 0 hoặc Trúc Cơ = 1)
 * - Không trong bí cảnh
 * - Không có người chơi tương tác gần đây
 */
function _isCompressibleNPC(npc) {
  if (!npc || npc.status !== "alive") return false;

  // Giữ người chơi
  if (typeof player !== "undefined" && player && npc.id === player.id) return false;

  // Giữ thiên tài
  if (npc.isTianJiao) return false;

  // Giữ cảnh giới cao (Kim Đan trở lên = realm >= 2)
  if ((npc.realm || 0) >= 2) return false;

  // Giữ NPC có danh hiệu
  if (Array.isArray(npc.titles) && npc.titles.length > 0) return false;

  // Giữ tông chủ / trưởng lão
  if (typeof sects !== "undefined") {
    for (const s of sects) {
      if (s.leader === npc.id) return false;
      if (Array.isArray(s.elders) && s.elders.includes(npc.id)) return false;
      if (s.founder === npc.id) return false;
    }
  }

  // Giữ NPC trong bí cảnh
  if (npc.inSecretRealm) return false;

  // Giữ NPC có quest liên quan
  if (typeof playerQuests !== "undefined" && playerQuests) {
    const allQuests = [
      ...(playerQuests.active || []),
      ...(playerQuests.available || [])
    ];
    for (const q of allQuests) {
      if (q.targetNpcId === npc.id || q.npcId === npc.id) return false;
    }
  }

  return true;
}

// ============================
// NÉN DÂN SỐ → TRỪU TƯỢNG
// ============================

/**
 * Chuyển NPC thường dân vượt giới hạn thành dân số trừu tượng.
 * Gọi mỗi tick trước simulateWorld chính.
 */
function _enforcePopulationCap() {
  if (!popLimitState.enabled) return;
  if (typeof npcs === "undefined") return;

  const alive = npcs.filter(n => n.status === "alive");
  const currentCount = alive.length;

  if (currentCount <= POP_LIMIT.SOFT_TARGET) return;

  const excess = currentCount - POP_LIMIT.SOFT_TARGET;
  if (excess <= 0) return;

  // Chọn ứng viên nén: không quan trọng, cảnh giới thấp nhất trước
  const candidates = alive
    .filter(_isCompressibleNPC)
    .sort((a, b) => (a.realm || 0) - (b.realm || 0) || (a.wealth || 0) - (b.wealth || 0));

  if (!candidates.length) return;

  const toCompress = candidates.slice(0, Math.min(excess, POP_LIMIT.COMPRESS_BATCH));
  if (!toCompress.length) return;

  // Gom theo vùng → cộng vào abstractPop
  const byRegion = {};
  toCompress.forEach(n => {
    const r = n.region || "Vô Danh";
    if (!byRegion[r]) byRegion[r] = [];
    byRegion[r].push(n);
  });

  Object.entries(byRegion).forEach(([region, list]) => {
    if (!popLimitState.abstractPop[region]) {
      popLimitState.abstractPop[region] = { population: 0, avgRealm: 0, avgWealth: 0 };
    }
    const g = popLimitState.abstractPop[region];
    const prevPop = g.population;
    const addCount = list.length;
    const addRealm  = list.reduce((s, n) => s + (n.realm || 0), 0) / addCount;
    const addWealth = list.reduce((s, n) => s + (n.wealth || 0), 0) / addCount;

    if (prevPop > 0) {
      g.avgRealm  = (g.avgRealm  * prevPop + addRealm  * addCount) / (prevPop + addCount);
      g.avgWealth = (g.avgWealth * prevPop + addWealth * addCount) / (prevPop + addCount);
    } else {
      g.avgRealm  = addRealm;
      g.avgWealth = addWealth;
    }
    g.population += addCount;
  });

  // Loại khỏi mảng npcs
  const compressIds = new Set(toCompress.map(n => n.id));
  npcs = npcs.filter(n => !compressIds.has(n.id));

  popLimitState.stats.totalCompressed += toCompress.length;
  _recalcTotalAbstract();

  // Đồng bộ với populationGroups của LOD system
  _syncWithLODGroups();

  if (typeof addLog === "function" && toCompress.length >= 30) {
    addLog(`📊 [Giới Hạn Dân Số] Đã chuyển ${toCompress.length} thường dân thành dân số trừu tượng. NPC hoạt động: ${npcs.filter(n=>n.status==="alive").length}`, "normal");
  }
}

// ============================
// KIỂM SOÁT SINH SẢN
// ============================

/**
 * Hook vào _fertilityRate để giảm tỷ lệ sinh khi NPC đang tiếp cận giới hạn,
 * và tăng tỷ lệ sinh khi dân số đang thấp.
 */
function _patchFertilityRate() {
  if (typeof _fertilityRate !== "function") return;
  if (window._popLimitFertilityPatched) return;
  window._popLimitFertilityPatched = true;

  const _origFertility = _fertilityRate;
  window._fertilityRate = function(mother, father) {
    if (!popLimitState.enabled) return _origFertility.apply(this, arguments);

    const aliveCount = (typeof npcs !== "undefined")
      ? npcs.filter(n => n.status === "alive").length
      : 0;

    // Giảm mạnh tỷ lệ sinh khi NPC sắp đạt giới hạn cứng
    let capFactor = 1.0;
    if (aliveCount >= POP_LIMIT.HARD_CAP) {
      capFactor = 0.0; // Dừng sinh sản hoàn toàn khi đạt giới hạn cứng
    } else if (aliveCount >= POP_LIMIT.SOFT_TARGET) {
      // Giảm dần từ 1.0 → 0.05 trong khoảng SOFT_TARGET → HARD_CAP
      const ratio = (aliveCount - POP_LIMIT.SOFT_TARGET) / (POP_LIMIT.HARD_CAP - POP_LIMIT.SOFT_TARGET);
      capFactor = Math.max(0.05, 1.0 - ratio * 0.95);
    } else if (aliveCount < POP_LIMIT.MIN_ACTIVE) {
      // Tăng tỷ lệ sinh khi dân số thấp
      capFactor = 2.5;
    }

    return _origFertility.apply(this, arguments) * capFactor;
  };
}

// ============================
// NGĂN SINH CON VƯỢT HARD CAP
// ============================

/**
 * Hook vào _spawnChild để không tạo NPC mới nếu đã đạt giới hạn cứng.
 * NPC "sinh" nhưng trở thành dân số trừu tượng ngay lập tức.
 */
function _patchSpawnChild() {
  if (typeof _spawnChild !== "function") return;
  if (window._popLimitSpawnPatched) return;
  window._popLimitSpawnPatched = true;

  const _origSpawnChild = _spawnChild;
  window._spawnChild = function(mother, father) {
    if (!popLimitState.enabled) return _origSpawnChild.apply(this, arguments);

    const aliveCount = (typeof npcs !== "undefined")
      ? npcs.filter(n => n.status === "alive").length
      : 0;

    // Nếu đạt HARD_CAP, đứa trẻ trở thành dân số trừu tượng
    if (aliveCount >= POP_LIMIT.HARD_CAP) {
      const region = (mother && mother.region) || "Vô Danh";
      if (!popLimitState.abstractPop[region]) {
        popLimitState.abstractPop[region] = { population: 0, avgRealm: 0, avgWealth: 0 };
      }
      popLimitState.abstractPop[region].population += 1;
      popLimitState.stats.totalCompressed += 1;
      _recalcTotalAbstract();
      _syncWithLODGroups();

      // Trả về một object giả để code gốc không bị lỗi
      // (mother.childrenIds.push(child.id) vẫn chạy nhưng id là giả)
      const fakeChild = {
        id: -Date.now(),
        name: "Dân Số Trừu Tượng",
        status: "abstract",
        region: region,
        realm: 0,
        wealth: 0,
        childrenIds: [],
        biography: [],
      };

      if (typeof popStats !== "undefined") popStats._tickBirths++;
      if (typeof popStats !== "undefined") popStats.births++;

      // Không push vào npcs — đây là điểm mấu chốt
      return fakeChild;
    }

    return _origSpawnChild.apply(this, arguments);
  };
}

// ============================
// TĂNG TRƯỞNG DÂN SỐ TRỪU TƯỢNG
// ============================

function _tickAbstractPop() {
  if (!popLimitState.enabled) return;

  Object.keys(popLimitState.abstractPop).forEach(region => {
    const g = popLimitState.abstractPop[region];
    if (!g || g.population <= 0) return;

    // Tăng trưởng tự nhiên
    const growth = g.population * (POP_LIMIT.ABSTRACT_GROWTH + Math.random() * 0.004);
    g.population = Math.max(0, Math.floor(g.population + growth));
  });

  // Loại bỏ nhóm rỗng
  Object.keys(popLimitState.abstractPop).forEach(k => {
    if ((popLimitState.abstractPop[k].population || 0) <= 0) {
      delete popLimitState.abstractPop[k];
    }
  });

  _recalcTotalAbstract();
}

// ============================
// THĂNG CẤP TỪ TRỪU TƯỢNG
// ============================

/**
 * Một thường dân trong dân số trừu tượng có thể bước vào tu luyện.
 * Chỉ xảy ra khi NPC hiện tại < MIN_ACTIVE.
 */
function _maybePromoteAbstract() {
  if (!popLimitState.enabled) return;
  if (typeof npcs === "undefined") return;
  if (!Object.keys(popLimitState.abstractPop).length) return;

  const aliveCount = npcs.filter(n => n.status === "alive").length;

  // Thăng cấp tự do khi dân số thấp
  let promotionChance = POP_LIMIT.PROMOTE_CHANCE;
  if (aliveCount < POP_LIMIT.MIN_ACTIVE) {
    promotionChance = 0.15; // Tăng mạnh
  } else if (aliveCount > POP_LIMIT.SOFT_TARGET) {
    return; // Không thăng khi đã nhiều NPC
  }

  if (Math.random() > promotionChance) return;

  // Chọn nhóm ngẫu nhiên
  const regions = Object.keys(popLimitState.abstractPop).filter(
    k => popLimitState.abstractPop[k].population > 0
  );
  if (!regions.length) return;

  const region = regions[Math.floor(Math.random() * regions.length)];
  const g = popLimitState.abstractPop[region];
  if (!g || g.population <= 0) return;

  g.population -= 1;
  if (g.population <= 0) delete popLimitState.abstractPop[region];

  popLimitState.stats.totalPromoted += 1;
  _recalcTotalAbstract();
  _syncWithLODGroups();

  if (typeof createNPC === "function") {
    const newNPC = createNPC(false);
    newNPC.region  = region;
    newNPC.country = (typeof countries !== "undefined" && countries.length)
      ? countries.find(c => c.territory === region)?.name || countries[0]?.name || ""
      : "";
    npcs.push(newNPC);
    if (typeof addLog === "function") {
      addLog(`🌱 ${newNPC.name} từ dân cư ${region} bước ra khỏi bóng tối, bắt đầu con đường tu tiên!`, "normal");
    }
  }
}

// ============================
// ĐỒNG BỘ VỚI LOD SYSTEM
// ============================

/**
 * Đồng bộ dữ liệu abstractPop với populationGroups của lodPerformanceSystem
 * để không bị xung đột.
 */
function _syncWithLODGroups() {
  if (typeof populationGroups === "undefined") return;

  // Rebuild populationGroups từ abstractPop
  populationGroups = Object.entries(popLimitState.abstractPop).map(([region, g]) => ({
    id:           `popgrp_${region}`,
    region,
    name:         `Dân Cư ${region}`,
    population:   g.population,
    avgRealm:     g.avgRealm || 0,
    avgWealth:    g.avgWealth || 0,
    createdYear:  (typeof year !== "undefined" ? year : 0),
  }));
}

// ============================
// UI — HIỂN THỊ DÂN SỐ TRỪU TƯỢNG
// ============================

/**
 * Cập nhật hiển thị dân số trừu tượng trong panel vùng.
 * Hook vào renderRegions để thêm thông tin dân số trừu tượng.
 */
function _patchRenderRegions() {
  if (typeof renderRegions !== "function") return;
  if (window._popLimitRegionsPatched) return;
  window._popLimitRegionsPatched = true;

  const _origRenderRegions = renderRegions;
  window.renderRegions = function() {
    _origRenderRegions.apply(this, arguments);

    if (!popLimitState.enabled) return;
    if (!Object.keys(popLimitState.abstractPop).length) return;

    // Thêm thông tin dân số trừu tượng vào mỗi region-box
    const regionBoxes = document.querySelectorAll(".region-box");
    regionBoxes.forEach(box => {
      const title = box.querySelector("h3");
      if (!title) return;
      const regionName = title.textContent.trim();
      const g = popLimitState.abstractPop[regionName];
      if (!g || g.population <= 0) return;

      // Kiểm tra đã có badge chưa (tránh trùng lặp)
      if (box.querySelector(".abstract-pop-badge")) return;

      const badge = document.createElement("div");
      badge.className = "abstract-pop-badge";
      badge.style.cssText = [
        "margin-top:6px",
        "padding:4px 8px",
        "border-radius:6px",
        "background:rgba(96,165,250,0.1)",
        "border:1px solid rgba(96,165,250,0.25)",
        "font-size:11px",
        "color:#60a5fa",
        "display:flex",
        "align-items:center",
        "gap:6px",
      ].join(";");
      badge.innerHTML = `🏘️ Dân số: <b style="color:#93c5fd">${g.population.toLocaleString()}</b> <span style="color:var(--white-dim)">(trừu tượng)</span>`;
      box.appendChild(badge);
    });
  };
}

/**
 * Cập nhật statsBar để hiển thị tổng dân số thực tế.
 */
function _patchStatsBar() {
  if (typeof renderAll !== "function") return;
  if (window._popLimitStatsPatched) return;
  window._popLimitStatsPatched = true;

  const _origRenderAll = renderAll;
  window.renderAll = function() {
    _origRenderAll.apply(this, arguments);
    _updatePopLimitStatsBar();
  };
}

function _updatePopLimitStatsBar() {
  if (!popLimitState.enabled) return;

  const statsBar = document.getElementById("worldStats");
  if (!statsBar) return;

  const aliveNPCs  = (typeof npcs !== "undefined") ? npcs.filter(n => n.status === "alive").length : 0;
  const abstractTotal = popLimitState.totalAbstract;

  if (abstractTotal <= 0) return; // Không thay đổi nếu chưa có dân số trừu tượng

  const era = (typeof world !== "undefined" && world && typeof ERA_STAGES !== "undefined")
    ? (ERA_STAGES.find(e => (typeof eraIndex !== "undefined" ? eraIndex : 0) === ERA_STAGES.indexOf(e)) || ERA_STAGES[0])
    : { name: "" };

  const sectCount    = (typeof sects     !== "undefined") ? sects.length     : 0;
  const countryCount = (typeof countries !== "undefined") ? countries.length : 0;
  const bossCount    = (typeof bosses    !== "undefined") ? bosses.length    : 0;

  statsBar.innerHTML = `
    👥 <span style="color:#facc15">${aliveNPCs.toLocaleString()}</span> tu sĩ
    <span style="color:#60a5fa;font-size:11px"> +${abstractTotal.toLocaleString()} dân</span>
    &nbsp;·&nbsp; 🏯 ${sectCount} tông môn
    &nbsp;·&nbsp; ⚔️ ${countryCount} quốc gia
    &nbsp;·&nbsp; 🐉 ${bossCount} boss
    ${era.name ? `&nbsp;·&nbsp; 🌐 ${era.name}` : ""}
  `;
}

/**
 * Cập nhật panel Hiệu Suất trong lodPerformanceSystem để hiển thị
 * thêm thông tin dân số trừu tượng từ hệ thống này.
 */
function _patchPerformancePanel() {
  if (typeof renderPerformancePanel !== "function") return;
  if (window._popLimitPerfPatched) return;
  window._popLimitPerfPatched = true;

  const _origPerfPanel = renderPerformancePanel;
  window.renderPerformancePanel = function() {
    _origPerfPanel.apply(this, arguments);

    const el = document.getElementById("perfPanelContent");
    if (!el) return;
    if (!popLimitState.enabled) return;

    const aliveNPCs = (typeof npcs !== "undefined") ? npcs.filter(n => n.status === "alive").length : 0;
    const abstractTotal = popLimitState.totalAbstract;
    const capPercent = Math.round((aliveNPCs / POP_LIMIT.HARD_CAP) * 100);
    const barColor = capPercent >= 95 ? "#f87171" : capPercent >= 80 ? "#fb923c" : "#4ade80";

    const section = document.createElement("div");
    section.className = "econ-section";
    section.innerHTML = `
      <div class="econ-section-title">🏘️ Hệ Thống Giới Hạn Dân Số</div>
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
          <span style="color:var(--white-dim)">NPC Hoạt Động</span>
          <span style="color:${barColor}">${aliveNPCs} / ${POP_LIMIT.HARD_CAP} (${capPercent}%)</span>
        </div>
        <div style="background:rgba(255,255,255,0.1);border-radius:4px;height:8px;overflow:hidden">
          <div style="background:${barColor};width:${Math.min(100,capPercent)}%;height:100%;transition:width 0.3s;border-radius:4px"></div>
        </div>
      </div>
      <div class="econ-stat-grid">
        <div class="econ-stat-card">
          <div class="econ-stat-icon">⚙️</div>
          <div class="econ-stat-val" style="color:${barColor}">${aliveNPCs.toLocaleString()}</div>
          <div class="econ-stat-lbl">NPC Hoạt Động</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">🏘️</div>
          <div class="econ-stat-val" style="color:#60a5fa">${abstractTotal.toLocaleString()}</div>
          <div class="econ-stat-lbl">Dân Số Trừu Tượng</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">🌐</div>
          <div class="econ-stat-val" style="color:#c084fc">${(aliveNPCs + abstractTotal).toLocaleString()}</div>
          <div class="econ-stat-lbl">Tổng Dân Số</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">📦</div>
          <div class="econ-stat-val" style="color:var(--white-dim)">${popLimitState.stats.totalCompressed.toLocaleString()}</div>
          <div class="econ-stat-lbl">Tổng Đã Nén</div>
        </div>
      </div>
      <div style="margin-top:8px">
        <div class="econ-section-title" style="font-size:12px;margin-bottom:6px">Phân Bổ Dân Số Trừu Tượng Theo Vùng</div>
        ${Object.entries(popLimitState.abstractPop)
          .filter(([,g]) => g.population > 0)
          .sort(([,a],[,b]) => b.population - a.population)
          .slice(0, 8)
          .map(([region, g]) => `
            <div style="display:flex;justify-content:space-between;font-size:11px;padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
              <span style="color:var(--white-dim)">${region}</span>
              <span style="color:#60a5fa">${g.population.toLocaleString()} dân</span>
            </div>
          `).join("") || "<div style='color:var(--white-dim);font-size:11px'>Chưa có dân số trừu tượng</div>"}
      </div>
      <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer">
          <input type="checkbox" ${popLimitState.enabled ? "checked" : ""}
            onchange="popLimitState.enabled=this.checked; if(typeof save==='function')save();">
          Bật Giới Hạn Dân Số (hard cap ${POP_LIMIT.HARD_CAP})
        </label>
      </div>
    `;

    el.appendChild(section);
  };
}

// ============================
// HOOK VÀO SIMULATE WORLD
// ============================

function _hookSimulateWorld() {
  if (typeof simulateWorld !== "function") return;
  if (window._popLimitSimPatched) return;
  window._popLimitSimPatched = true;

  const _origSim = simulateWorld;
  window.simulateWorld = function() {
    ensurePopLimitFields();

    // BƯỚC 1: Kiểm tra và nén trước khi simulate
    if (popLimitState.enabled) {
      _enforcePopulationCap();
    }

    // BƯỚC 2: Chạy simulate gốc
    _origSim.apply(this, arguments);

    // BƯỚC 3: Sau simulate — tăng trưởng trừu tượng + thăng cấp
    if (popLimitState.enabled) {
      _tickAbstractPop();
      _maybePromoteAbstract();
      _recalcTotalAbstract();
      _syncWithLODGroups();
    }

    // BƯỚC 4: Kiểm tra lần cuối — đảm bảo không vượt HARD_CAP
    if (popLimitState.enabled) {
      const aliveAfter = (typeof npcs !== "undefined")
        ? npcs.filter(n => n.status === "alive").length
        : 0;
      if (aliveAfter > POP_LIMIT.HARD_CAP) {
        _enforcePopulationCap();
      }
    }
  };
}

// ============================
// HOOK VÀO SAVE / LOAD
// ============================

function _hookSaveLoad() {
  // SAVE
  if (typeof save === "function" && !window._popLimitSavePatched) {
    window._popLimitSavePatched = true;
    const _origSave = save;
    window.save = function() {
      _origSave.apply(this, arguments);
      try {
        localStorage.setItem("cgv6_popLimitState", JSON.stringify(popLimitState));
      } catch(e) {
        console.warn("[PopLimit] Save failed:", e);
      }
    };
  }

  // LOAD
  if (typeof load === "function" && !window._popLimitLoadPatched) {
    window._popLimitLoadPatched = true;
    const _origLoad = load;
    window.load = function() {
      _origLoad.apply(this, arguments);
      try {
        const saved = JSON.parse(localStorage.getItem("cgv6_popLimitState"));
        if (saved) {
          // Merge thận trọng — không ghi đè config mặc định nếu thiếu field
          if (saved.abstractPop)   popLimitState.abstractPop   = saved.abstractPop;
          if (saved.stats)         popLimitState.stats         = saved.stats;
          if (saved.totalAbstract !== undefined) popLimitState.totalAbstract = saved.totalAbstract;
          if (saved.lastCompressYear !== undefined) popLimitState.lastCompressYear = saved.lastCompressYear;
          // enabled mặc định là true — chỉ đổi nếu user đã tắt
          if (saved.enabled === false) popLimitState.enabled = false;
        }
      } catch(e) {
        console.warn("[PopLimit] Load failed:", e);
      }
      _recalcTotalAbstract();
      _syncWithLODGroups();
    };
  }
}

// ============================
// MIGRATION KHI LOAD SAVE CŨ
// ============================

/**
 * Khi load save cũ có nhiều hơn 500 NPC:
 * Ngay lập tức nén các NPC dư thừa xuống.
 * Chỉ chạy 1 lần sau khi load.
 */
function _migrateOldSave() {
  if (typeof npcs === "undefined") return;

  const alive = npcs.filter(n => n.status === "alive");
  if (alive.length <= POP_LIMIT.HARD_CAP) return;

  const excess = alive.length - POP_LIMIT.HARD_CAP;
  if (typeof addLog === "function") {
    addLog(`⚙️ [Giới Hạn Dân Số] Phát hiện ${alive.length} NPC (vượt giới hạn ${POP_LIMIT.HARD_CAP}). Đang tối ưu hóa...`, "important");
  }

  // Nén nhiều lần nếu cần
  let iterations = 0;
  while (
    (typeof npcs !== "undefined") &&
    npcs.filter(n => n.status === "alive").length > POP_LIMIT.HARD_CAP &&
    iterations < 20
  ) {
    _enforcePopulationCap();
    iterations++;
  }

  const afterCount = npcs.filter(n => n.status === "alive").length;
  if (typeof addLog === "function") {
    addLog(`✅ [Giới Hạn Dân Số] Tối ưu hóa hoàn tất: ${afterCount} NPC hoạt động, ${popLimitState.totalAbstract.toLocaleString()} dân trừu tượng.`, "important");
  }
}

// ============================
// KHỞI TẠO HỆ THỐNG
// ============================

function initPopulationLimitSystem() {
  ensurePopLimitFields();
  _patchFertilityRate();
  _patchSpawnChild();
  _patchRenderRegions();
  _patchStatsBar();
  _patchPerformancePanel();
  _hookSimulateWorld();
  _hookSaveLoad();

  // Đồng bộ với LOD system ngay lập tức
  _syncWithLODGroups();

  if (typeof addLog === "function") {
    addLog(`🏘️ Hệ Thống Giới Hạn Dân Số đã khởi động. Giới hạn cứng: ${POP_LIMIT.HARD_CAP} NPC hoạt động.`, "normal");
  }

  console.log(`[PopLimit] Initialized. Hard cap: ${POP_LIMIT.HARD_CAP}, Soft target: ${POP_LIMIT.SOFT_TARGET}`);
}

// ============================
// AUTO-INIT (sau khi DOM + app.js đã load)
// ============================

// Chờ toàn bộ script khác load xong
if (document.readyState === "complete") {
  setTimeout(function() {
    initPopulationLimitSystem();
    // Migration cho save cũ
    setTimeout(_migrateOldSave, 800);
  }, 200);
} else {
  window.addEventListener("load", function() {
    setTimeout(function() {
      initPopulationLimitSystem();
      setTimeout(_migrateOldSave, 800);
    }, 200);
  });
}
