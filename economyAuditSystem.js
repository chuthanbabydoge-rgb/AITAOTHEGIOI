/* ============================================================
   ECONOMY AUDIT SYSTEM — economyAuditSystem.js
   Creator God V6 — Giai đoạn tiếp theo: Hệ Thống Kiểm Toán Kinh Tế
   ─────────────────────────────────────────────────────────────
   Bổ sung cho economySystem.js (KHÔNG sửa file gốc, chỉ override/hook):

     • Lạm phát (inflation index) — tài phú danh nghĩa vs thực tế
     • Tiêu hao tài sản (wealth sinks):
         - Tu luyện (cultivation upkeep)
         - Bảo trì cổ vật (artifact maintenance)
         - Chiến tranh (war attrition)
         - Bảo trì môn phái (sect upkeep)
         - Bảo trì thành phố / quốc gia (city/country upkeep)
     • Giới hạn mềm (soft caps) theo logistic decay thay vì bleed cứng
     • Phát hiện tăng trưởng cấp số nhân + tự điều chỉnh MỘT LẦN
       cho các save cũ đã bị lạm phát quá mức (KHÔNG xóa localStorage,
       chỉ rebase số liệu hiện có)
     • Tab "🧮 Kiểm Toán" mới trong panel Kinh Tế:
         - Tổng tài sản thế giới (danh nghĩa & thực)
         - Tỷ lệ tăng trưởng theo năm
         - Bảng tài sản theo năm
         - NPC giàu nhất / Môn phái giàu nhất
         - Cảnh báo tăng trưởng bất thường

   Tương thích ngược: tất cả field mới đều có giá trị mặc định khi
   migrate từ save cũ; không field cũ nào bị xóa hay đổi kiểu.
   ============================================================ */

// ============================
// STATE
// ============================

// Lưu trữ trạng thái kiểm toán kinh tế (persist qua localStorage)
let econAudit = {
  inflationIndex:   1,      // 1.0 = giá trị gốc; tăng dần theo cung tiền
  baseMoneySupply:  null,   // mốc cung tiền ban đầu để tính lạm phát
  assetHistory:     [],     // [{ year, total, real, growthRate }]
  rebaseApplied:    false,  // đã rebase save cũ bị lạm phát hay chưa
  rebaseFactor:     1,      // hệ số đã chia khi rebase (để hiển thị minh bạch)
  lastTotalAssets:  0,
  exponentialAlert: null,   // { year, ratio } nếu phát hiện tăng trưởng bất thường
};

// Ngưỡng coi là "vỡ trận" — vượt quá mức này sẽ kích hoạt rebase 1 lần
const ECON_SANITY_CEILING = 1e15; // 1 triệu tỷ Linh Thạch — đủ lớn cho gameplay bình thường

// Hệ số kiểm soát soft-cap: tài sản tiệm cận trần nhưng không bao giờ chạm cứng
const ECON_SOFTCAP_NPC_BASE     = 80000;   // trần "mềm" cơ bản cho 1 tu sĩ ở Luyện Khí
const ECON_SOFTCAP_NPC_PER_REALM= 1.8;     // hệ số nhân trần theo mỗi cảnh giới
const ECON_SOFTCAP_SECT_BASE    = 50000;   // trần mềm lingshi tông môn mỗi cấp
const ECON_SOFTCAP_COUNTRY_BASE = 2_000_000; // trần mềm vàng quốc gia mỗi cấp

// ============================
// INIT / MIGRATION
// ============================

function ensureEconAuditFields() {
  if (!econAudit) {
    econAudit = {
      inflationIndex: 1, baseMoneySupply: null, assetHistory: [],
      rebaseApplied: false, rebaseFactor: 1, lastTotalAssets: 0, exponentialAlert: null,
    };
  }
  if (econAudit.inflationIndex   === undefined) econAudit.inflationIndex   = 1;
  if (econAudit.baseMoneySupply  === undefined) econAudit.baseMoneySupply  = null;
  if (!Array.isArray(econAudit.assetHistory))   econAudit.assetHistory     = [];
  if (econAudit.rebaseApplied    === undefined) econAudit.rebaseApplied    = false;
  if (econAudit.rebaseFactor     === undefined) econAudit.rebaseFactor     = 1;
  if (econAudit.lastTotalAssets  === undefined) econAudit.lastTotalAssets  = 0;
  if (econAudit.exponentialAlert === undefined) econAudit.exponentialAlert = null;
}

// ============================
// TOTAL WORLD ASSETS
// ============================

/** Tổng tài sản danh nghĩa của toàn thế giới (Linh Thạch quy đổi). */
function calcTotalWorldAssets() {
  let total = 0;

  if (typeof npcs !== "undefined") {
    npcs.forEach(n => {
      if (n.status !== "alive") return;
      total += (n.wealth || 0);
      total += (n.spiritStone || 0) * 10; // spiritStone quy đổi giá trị cao hơn lingshi thường
      if (n.resources?.lingshi) total += n.resources.lingshi;
    });
  }
  if (typeof sects !== "undefined") {
    sects.forEach(s => {
      const r = s.resources || {};
      total += (r.lingshi || 0) + (r.lingyao || 0) * 5 + (r.xuantie || 0) * 8 + (r.jingshi || 0) * 20;
    });
  }
  if (typeof countries !== "undefined") {
    countries.forEach(c => {
      const r = c.resource || {};
      total += (r.gold || 0) + (r.spirit || 0) * 15;
    });
  }
  return total;
}

// ============================
// SANITY REBASE (one-time, save-compatible)
// ============================

/**
 * Nếu tổng tài sản thế giới vượt ngưỡng phi lý (do lỗi tăng trưởng cấp số nhân
 * tích lũy từ trước), thực hiện rebase MỘT LẦN: chia toàn bộ wealth/lingshi/gold
 * cho một hệ số lớn để đưa về mức hợp lý. KHÔNG xóa save, chỉ điều chỉnh số liệu.
 */
function _econSanityRebaseIfNeeded() {
  if (econAudit.rebaseApplied) return;

  const total = calcTotalWorldAssets();
  if (total <= ECON_SANITY_CEILING) {
    // Không cần rebase — đánh dấu đã kiểm tra để không tốn thời gian mỗi tick
    econAudit.rebaseApplied = true;
    econAudit.rebaseFactor  = 1;
    return;
  }

  // Tính hệ số chia sao cho tổng tài sản về khoảng 10K-1M sau rebase
  const targetTotal = 500_000;
  let factor = total / targetTotal;
  // Làm tròn factor về lũy thừa của 10 cho dễ hiểu
  factor = Math.pow(10, Math.ceil(Math.log10(factor)));
  if (factor < 10) factor = 10;

  if (typeof npcs !== "undefined") {
    npcs.forEach(n => {
      if (n.wealth)               n.wealth               = Math.max(0, Math.floor(n.wealth / factor));
      if (n.spiritStone)          n.spiritStone          = Math.max(0, Math.floor(n.spiritStone / factor));
      if (n.resources?.lingshi)   n.resources.lingshi    = Math.max(0, Math.floor(n.resources.lingshi / factor));
      if (n.reputation)           n.reputation           = Math.max(0, Math.floor(n.reputation / Math.sqrt(factor)));
    });
  }
  if (typeof sects !== "undefined") {
    sects.forEach(s => {
      if (!s.resources) return;
      ["lingshi","lingyao","xuantie","jingshi"].forEach(k => {
        if (s.resources[k]) s.resources[k] = Math.max(0, Math.floor(s.resources[k] / factor));
      });
      if (s.treasury) s.treasury = s.resources.lingshi || 0;
      if (s.prestige) s.prestige = Math.max(0, Math.floor(s.prestige / Math.sqrt(factor)));
    });
  }
  if (typeof countries !== "undefined") {
    countries.forEach(c => {
      if (!c.resource) return;
      ["gold","grain","iron","spirit"].forEach(k => {
        if (c.resource[k]) c.resource[k] = Math.max(0, Math.floor(c.resource[k] / factor));
      });
      c.wealth  = c.resource.gold;
      c.economy = c.resource.gold;
    });
  }

  econAudit.rebaseApplied = true;
  econAudit.rebaseFactor  = factor;
  econAudit.assetHistory  = []; // dữ liệu lịch sử cũ không còn ý nghĩa sau rebase
  if (typeof economyHistory !== "undefined") economyHistory = [];

  if (typeof addLog === "function") {
    addLog(`🧮 KIỂM TOÁN: Phát hiện tài sản thế giới vượt ngưỡng (${_fmtBig(total)}). Đã hiệu chỉnh tỷ lệ ÷${_fmtBig(factor)} để ổn định nền kinh tế.`, "important");
  }
  if (typeof toast === "function") {
    toast(`🧮 Hệ thống Kiểm Toán đã hiệu chỉnh nền kinh tế (÷${_fmtBig(factor)})`, 6000);
  }
}

// ============================
// INFLATION
// ============================

/**
 * Cập nhật chỉ số lạm phát dựa trên tốc độ tăng cung tiền.
 * Cung tiền tăng nhanh hơn "tăng trưởng tự nhiên" kỳ vọng (~3%/tick) → lạm phát tăng.
 * Cung tiền tăng chậm/giảm → lạm phát hạ nhiệt dần.
 */
function _tickInflation() {
  const total = calcTotalWorldAssets();

  if (econAudit.baseMoneySupply === null || econAudit.baseMoneySupply <= 0) {
    econAudit.baseMoneySupply = Math.max(total, 1);
    econAudit.lastTotalAssets = total;
    return;
  }

  const prev = econAudit.lastTotalAssets || econAudit.baseMoneySupply;
  const growthRatio = prev > 0 ? total / prev : 1;
  const expectedGrowth = 1.03; // tăng trưởng kỳ vọng 3%/tick

  // Lạm phát điều chỉnh dựa trên chênh lệch giữa tăng trưởng thực tế và kỳ vọng
  const delta = (growthRatio - expectedGrowth) * 0.5;
  econAudit.inflationIndex = Math.max(1, econAudit.inflationIndex * (1 + Math.max(-0.02, Math.min(0.05, delta))));

  // Trần lạm phát để không vỡ số liệu hiển thị (x1000 là đã siêu lạm phát)
  if (econAudit.inflationIndex > 1000) econAudit.inflationIndex = 1000;

  econAudit.lastTotalAssets = total;
}

/** Giá trị thực (đã trừ lạm phát) của một số tài phú danh nghĩa. */
function econRealValue(nominal) {
  ensureEconAuditFields();
  return nominal / Math.max(1, econAudit.inflationIndex);
}

// ============================
// WEALTH SINKS — tiêu hao tài sản
// ============================

/**
 * 1) Tu luyện: tu sĩ càng cảnh giới cao càng tốn nhiều linh thạch để duy trì tu vi.
 * 2) Bảo trì cổ vật: NPC sở hữu trang bị/cổ vật phải trả phí bảo dưỡng định kỳ.
 */
function _tickCultivationAndArtifactUpkeep() {
  if (typeof npcs === "undefined") return;
  const alive = npcs.filter(n => n.status === "alive");

  alive.forEach(npc => {
    const realmTier = (npc.realm || 0) + 1;

    // --- Tu luyện: phí duy trì tỷ lệ với cảnh giới (cấp số nhân nhẹ) ---
    const cultivationCost = Math.floor(realmTier * realmTier * 2);
    if (cultivationCost > 0) {
      npc.wealth = Math.max(0, (npc.wealth || 0) - cultivationCost);
    }

    // --- Bảo trì cổ vật: mỗi món trang bị/tàng phẩm có giá trị → phí 0.5% giá trị/tick ---
    let equipValue = 0;
    if (npc.equipment) {
      ["weapon","armor","artifact"].forEach(slot => {
        const it = npc.equipment[slot];
        if (it && it.value) equipValue += it.value;
      });
    }
    if (Array.isArray(npc.inventory)) {
      npc.inventory.forEach(it => { if (it && it.value) equipValue += it.value * 0.3; }); // tàng phẩm trong túi tốn ít hơn
    }
    if (equipValue > 0) {
      const maintCost = Math.floor(equipValue * 0.005);
      if (maintCost > 0) npc.wealth = Math.max(0, (npc.wealth || 0) - maintCost);
    }
  });
}

/**
 * 3) Chiến tranh: các tông môn vừa giao tranh gần đây (đang trong warCooldown)
 *    tiêu hao linh thạch/tài nguyên để bù đắp tổn thất chiến tranh.
 */
function _tickWarAttrition() {
  if (typeof sects === "undefined") return;

  sects.forEach(s => {
    if (!(s.warCooldown > 0)) return; // chỉ tông môn vừa đánh nhau gần đây mới chịu tổn thất
    if (!s.resources) return;
    const armyPower = s.armyPower || 100;
    // Chi phí chiến tranh: tỷ lệ với quy mô quân đội, giảm dần theo cooldown còn lại
    const intensity = Math.min(1, s.warCooldown / 15);
    const cost = Math.floor(armyPower * 0.08 * intensity);
    s.resources.lingshi  = Math.max(0, (s.resources.lingshi  || 0) - cost);
    s.resources.xuantie  = Math.max(0, (s.resources.xuantie  || 0) - Math.floor(cost * 0.2));
    s.treasury = s.resources.lingshi;
  });
}

/**
 * 4) Bảo trì môn phái: mỗi tông môn tốn linh thạch/tài nguyên để duy trì cơ sở
 *    vật chất, tỷ lệ với cấp độ và số thành viên.
 * 5) Bảo trì thành phố/quốc gia: mỗi quốc gia tốn vàng để duy trì hạ tầng,
 *    tỷ lệ với dân số và cấp độ.
 */
function _tickSectAndCityUpkeep() {
  if (typeof sects !== "undefined") {
    sects.forEach(s => {
      if (!s.resources) return;
      const lvl = s.level || 1;
      const memberCount = (typeof npcById === "function")
        ? (s.members || []).map(id => npcById(id)).filter(n => n && n.status === "alive").length
        : (s.members || []).length;

      const upkeep = Math.floor(lvl * lvl * 8 + memberCount * 1.5);
      s.resources.lingshi = Math.max(0, (s.resources.lingshi || 0) - upkeep);
      s.treasury = s.resources.lingshi;
    });
  }

  if (typeof countries !== "undefined") {
    countries.forEach(c => {
      if (!c.resource) return;
      const lvl = c.level || 1;
      const pop = c.population || 100000;

      const upkeep = Math.floor(lvl * lvl * 200 + pop * 0.0008);
      c.resource.gold = Math.max(0, (c.resource.gold || 0) - upkeep);
      c.wealth  = c.resource.gold;
      c.economy = c.resource.gold;
    });
  }
}

// ============================
// SOFT CAPS — giới hạn mềm (logistic decay)
// ============================

/**
 * Thay vì "bleed cứng" (cắt thẳng % khi vượt trần như economySystem.js cũ),
 * dùng decay mềm: càng vượt trần xa, tốc độ "rò rỉ" về trần càng nhanh,
 * nhưng không bao giờ cắt đột ngột — tạo cảm giác tự nhiên.
 */
function _applySoftCaps() {
  if (typeof npcs !== "undefined") {
    npcs.forEach(npc => {
      if (npc.status !== "alive") return;
      const realmTier = (npc.realm || 0) + 1;
      const cap = ECON_SOFTCAP_NPC_BASE * Math.pow(ECON_SOFTCAP_NPC_PER_REALM, realmTier - 1);
      if ((npc.wealth || 0) > cap) {
        const excess = npc.wealth - cap;
        // Rò rỉ 1.5% phần vượt mỗi tick — giảm dần khi tiệm cận trần
        npc.wealth = Math.floor(cap + excess * 0.985);
      }
    });
  }

  if (typeof sects !== "undefined") {
    sects.forEach(s => {
      if (!s.resources) return;
      const lvl = s.level || 1;
      const cap = ECON_SOFTCAP_SECT_BASE * lvl;
      if ((s.resources.lingshi || 0) > cap) {
        const excess = s.resources.lingshi - cap;
        s.resources.lingshi = Math.floor(cap + excess * 0.98);
        s.treasury = s.resources.lingshi;
      }
    });
  }

  if (typeof countries !== "undefined") {
    countries.forEach(c => {
      if (!c.resource) return;
      const lvl = c.level || 1;
      const cap = ECON_SOFTCAP_COUNTRY_BASE * lvl;
      if ((c.resource.gold || 0) > cap) {
        const excess = c.resource.gold - cap;
        c.resource.gold = Math.floor(cap + excess * 0.98);
        c.wealth  = c.resource.gold;
        c.economy = c.resource.gold;
      }
    });
  }
}

// ============================
// EXPONENTIAL GROWTH DETECTION
// ============================

function _detectExponentialGrowth(total) {
  const hist = econAudit.assetHistory;
  if (hist.length < 3) return;

  const last3 = hist.slice(-3).map(h => h.total);
  const ratios = [];
  for (let i = 1; i < last3.length; i++) {
    if (last3[i-1] > 0) ratios.push(last3[i] / last3[i-1]);
  }
  if (!ratios.length) return;

  const avgRatio = ratios.reduce((a,b)=>a+b,0) / ratios.length;

  // Nếu tài sản tăng > 50%/tick liên tục trong 2+ tick → cảnh báo
  if (avgRatio > 1.5) {
    econAudit.exponentialAlert = { year: (typeof year !== "undefined" ? year : 0), ratio: avgRatio };
    if (typeof addLog === "function") {
      addLog(`⚠️ KIỂM TOÁN: Phát hiện tăng trưởng tài sản bất thường (×${avgRatio.toFixed(2)}/năm). Hệ thống tiêu hao đang được tăng cường.`, "important");
    }
  } else if (avgRatio < 1.2) {
    econAudit.exponentialAlert = null;
  }
}

// ============================
// ASSET HISTORY (by year)
// ============================

function _recordAssetSnapshot() {
  const total = calcTotalWorldAssets();
  const real  = econRealValue(total);
  const hist  = econAudit.assetHistory;
  const prevTotal = hist.length ? hist[hist.length-1].total : total;
  const growthRate = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;

  hist.push({
    year: (typeof year !== "undefined" ? year : 0),
    total, real, growthRate,
  });
  if (hist.length > 100) hist.shift();

  _detectExponentialGrowth(total);
  econAudit.lastTotalAssets = total;
}

// ============================
// MAIN AUDIT TICK (hooks into simulateEconomy)
// ============================

function _econAuditTick() {
  ensureEconAuditFields();
  _econSanityRebaseIfNeeded();

  _tickCultivationAndArtifactUpkeep();
  _tickWarAttrition();
  _tickSectAndCityUpkeep();
  _applySoftCaps();
  _tickInflation();
  _recordAssetSnapshot();
}

// Override simulateEconomy to also run the audit tick (preserve original behavior)
if (typeof simulateEconomy === "function") {
  const _origSimulateEconomy = simulateEconomy;
  simulateEconomy = function() {
    _origSimulateEconomy.apply(this, arguments);
    _econAuditTick();
    // Re-render if the audit tab is active
    const panel = document.getElementById("panel-economy");
    if (panel && panel.classList.contains("active") && _econPanelTab === "audit") {
      _renderEconAudit();
    }
  };
}

// ============================
// SAVE / LOAD HOOKS
// ============================

if (typeof saveEconomy === "function") {
  const _origSaveEconomy = saveEconomy;
  saveEconomy = function() {
    _origSaveEconomy.apply(this, arguments);
    try {
      localStorage.setItem("cgv6_econAudit", JSON.stringify(econAudit));
    } catch(e) { console.warn("Economy audit save failed:", e); }
  };
}

if (typeof loadEconomy === "function") {
  const _origLoadEconomy = loadEconomy;
  loadEconomy = function() {
    _origLoadEconomy.apply(this, arguments);
    try {
      const saved = JSON.parse(localStorage.getItem("cgv6_econAudit"));
      if (saved) econAudit = saved;
      ensureEconAuditFields();
    } catch(e) {
      console.warn("Economy audit load failed:", e);
      ensureEconAuditFields();
    }
  };
}

// ============================
// PANEL — Tab "Kiểm Toán" 🧮
// ============================

// Add the audit tab to the tab bar (override _renderEconTabs)
if (typeof _renderEconTabs === "function") {
  const _origRenderEconTabs = _renderEconTabs;
  _renderEconTabs = function() {
    const bar = document.getElementById("econTabBar");
    if (!bar) return;
    const tabs = [
      { id:"overview",  label:"📊 Tổng Quan" },
      { id:"npcs",      label:"👥 Tu Sĩ" },
      { id:"sects",     label:"🏯 Tông Môn" },
      { id:"countries", label:"⚔️ Quốc Gia" },
      { id:"history",   label:"📈 Lịch Sử" },
      { id:"audit",     label:"🧮 Kiểm Toán" },
    ];
    bar.innerHTML = tabs.map(t => `
      <button class="econ-tab-btn ${_econPanelTab === t.id ? "active" : ""}"
              onclick="switchEconTab('${t.id}')">${t.label}</button>
    `).join("");
  };
}

// Hook the audit tab into the panel render switch
if (typeof renderEconomyPanel === "function") {
  const _origRenderEconomyPanel = renderEconomyPanel;
  renderEconomyPanel = function() {
    ensureEconAuditFields();
    if (typeof ensureEconomyFields === "function") ensureEconomyFields();
    _renderEconTabs();
    if (_econPanelTab === "audit") {
      _renderEconAudit();
    } else {
      _origRenderEconomyPanel.apply(this, arguments);
    }
  };
}

function _renderEconAudit() {
  const el = document.getElementById("econPanelContent");
  if (!el) return;
  ensureEconAuditFields();

  const total = calcTotalWorldAssets();
  const real  = econRealValue(total);
  const hist  = econAudit.assetHistory;
  const lastN = hist.slice(-20).reverse();

  const lastGrowth = hist.length ? hist[hist.length-1].growthRate : 0;
  const growthColor = lastGrowth > 50 ? "#f87171" : lastGrowth > 15 ? "#facc15" : "#4ade80";

  // Richest NPC
  const alive = (typeof npcs !== "undefined") ? npcs.filter(n => n.status === "alive") : [];
  const richestNPC = alive.length ? [...alive].sort((a,b)=>(b.wealth||0)-(a.wealth||0))[0] : null;
  const richestNPCRealm = richestNPC && typeof REALMS !== "undefined" ? (REALMS[richestNPC.realm]?.name || "?") : "?";

  // Richest sect (by lingshi)
  const richestSect = (typeof sects !== "undefined" && sects.length)
    ? [...sects].sort((a,b)=>((b.resources?.lingshi||0))-((a.resources?.lingshi||0)))[0] : null;

  const alertHTML = econAudit.exponentialAlert
    ? `<div class="econ-market-badge" style="background:#450a0a;color:#fca5a5">
         ⚠️ Cảnh báo tăng trưởng cấp số nhân: ×${econAudit.exponentialAlert.ratio.toFixed(2)}/năm
         (Năm ${econAudit.exponentialAlert.year}) — hệ thống tiêu hao đang được tăng cường tự động.
       </div>`
    : `<div class="econ-market-badge" style="background:#14532d;color:#86efac">
         ✅ Tăng trưởng tài sản trong tầm kiểm soát.
       </div>`;

  const rebaseHTML = econAudit.rebaseFactor > 1
    ? `<div style="font-size:11px;color:var(--white-dim);margin-top:6px">
         ℹ️ Đã hiệu chỉnh tỷ lệ kinh tế ÷${_fmtBig(econAudit.rebaseFactor)} một lần do dữ liệu cũ vượt ngưỡng hợp lý. Dữ liệu lịch sử trước đó đã được làm mới.
       </div>`
    : "";

  const sparkTotal = _buildSparkline(hist.map(h => h.total), "#facc15", "Tổng Tài Sản (Danh Nghĩa)");
  const sparkReal  = _buildSparkline(hist.map(h => h.real),  "#60a5fa", "Tổng Tài Sản (Thực, đã trừ lạm phát)");
  const sparkGrowth= _buildSparkline(hist.map(h => h.growthRate), "#fb923c", "Tỷ Lệ Tăng Trưởng (%)");

  el.innerHTML = `
    <div class="econ-section">
      <div class="econ-section-title">🧮 Kiểm Toán Kinh Tế Thế Giới</div>
      ${alertHTML}
      ${rebaseHTML}
      <div class="econ-stat-grid" style="margin-top:12px">
        <div class="econ-stat-card">
          <div class="econ-stat-icon">💰</div>
          <div class="econ-stat-val" style="color:#facc15">${_fmtBig(total)}</div>
          <div class="econ-stat-lbl">Tổng Tài Sản (Danh Nghĩa)</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">💎</div>
          <div class="econ-stat-val" style="color:#60a5fa">${_fmtBig(real)}</div>
          <div class="econ-stat-lbl">Tổng Tài Sản (Thực)</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">📈</div>
          <div class="econ-stat-val" style="color:${growthColor}">${lastGrowth >= 0 ? "+" : ""}${lastGrowth.toFixed(2)}%</div>
          <div class="econ-stat-lbl">Tăng Trưởng / Năm</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">📉</div>
          <div class="econ-stat-val" style="color:#c084fc">×${econAudit.inflationIndex.toFixed(2)}</div>
          <div class="econ-stat-lbl">Chỉ Số Lạm Phát</div>
        </div>
      </div>
    </div>

    <div class="econ-section">
      <div class="econ-section-title">🏆 Kỷ Lục Kinh Tế</div>
      <div class="econ-topnpc-row">
        <span class="econ-topnpc-rank">👑</span>
        <span class="econ-topnpc-name">${richestNPC ? richestNPC.name : "—"}</span>
        <span class="econ-topnpc-realm" style="color:var(--white-dim)">${richestNPC ? richestNPCRealm : ""}</span>
        <span class="econ-topnpc-val" style="color:#facc15">💰 ${richestNPC ? _fmtBig(richestNPC.wealth||0) : "—"}</span>
        <span style="color:var(--white-dim);font-size:11px">NPC giàu nhất</span>
      </div>
      <div class="econ-topnpc-row">
        <span class="econ-topnpc-rank">🏯</span>
        <span class="econ-topnpc-name">${richestSect ? richestSect.name : "—"}</span>
        <span class="econ-topnpc-realm" style="color:var(--white-dim)">Lv.${richestSect ? (richestSect.level||1) : "?"}</span>
        <span class="econ-topnpc-val" style="color:#4ade80">💎 ${richestSect ? _fmtBig(richestSect.resources?.lingshi||0) : "—"}</span>
        <span style="color:var(--white-dim);font-size:11px">Môn phái giàu nhất</span>
      </div>
    </div>

    <div class="econ-section">
      <div class="econ-section-title">📊 Tổng Tài Sản Theo Thời Gian</div>
      ${sparkTotal}
    </div>
    <div class="econ-section">
      <div class="econ-section-title">💎 Tài Sản Thực (Đã Trừ Lạm Phát)</div>
      ${sparkReal}
    </div>
    <div class="econ-section">
      <div class="econ-section-title">📈 Tỷ Lệ Tăng Trưởng (%)</div>
      ${sparkGrowth}
    </div>

    <div class="econ-section">
      <div class="econ-section-title">📋 Tài Sản Theo Năm</div>
      <div class="econ-table-wrap">
        <table class="econ-table">
          <thead><tr>
            <th>Năm</th><th>Tổng Tài Sản</th><th>Tài Sản Thực</th><th>Tăng Trưởng</th>
          </tr></thead>
          <tbody>
            ${lastN.map(h => `<tr>
              <td style="color:var(--gold-dim)">${h.year}</td>
              <td style="color:#facc15">${_fmtBig(h.total)}</td>
              <td style="color:#60a5fa">${_fmtBig(h.real)}</td>
              <td style="color:${h.growthRate > 50 ? "#f87171" : h.growthRate > 15 ? "#facc15" : "#4ade80"}">
                ${h.growthRate >= 0 ? "+" : ""}${h.growthRate.toFixed(2)}%
              </td>
            </tr>`).join("") || `<tr><td colspan="4" style="text-align:center;color:var(--white-dim)">Chưa có dữ liệu</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>

    <div class="econ-section">
      <div class="econ-section-title">💸 Các Khoản Tiêu Hao Mỗi Năm</div>
      <div style="font-size:12px;color:var(--white-dim);line-height:1.8">
        🧘 <b style="color:var(--white-main)">Tu Luyện:</b> Tu sĩ tốn linh thạch theo cảnh giới (cấp số nhân nhẹ) để duy trì tu vi.<br>
        🗡️ <b style="color:var(--white-main)">Bảo Trì Cổ Vật:</b> Trang bị & tàng phẩm tốn ~0.5%/năm giá trị để bảo dưỡng.<br>
        ⚔️ <b style="color:var(--white-main)">Chiến Tranh:</b> Tông môn đang giao tranh tiêu hao linh thạch & huyền thiết theo quân lực.<br>
        🏯 <b style="color:var(--white-main)">Bảo Trì Môn Phái:</b> Tỷ lệ với cấp độ² và số thành viên.<br>
        🏛️ <b style="color:var(--white-main)">Bảo Trì Quốc Gia:</b> Tỷ lệ với cấp độ² và dân số.<br>
        🧮 <b style="color:var(--white-main)">Giới Hạn Mềm:</b> Tài sản vượt trần sẽ "rò rỉ" dần về mức hợp lý, không bị cắt đột ngột.
      </div>
    </div>
  `;
}

// ============================
// FORMATTING — hỗ trợ số cực lớn
// ============================

/** Định dạng số lớn với hậu tố K/M/B/T hoặc khoa học cho số siêu lớn. */
function _fmtBig(n) {
  if (n === undefined || n === null || isNaN(n)) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e15) return n.toExponential(2);
  if (abs >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (abs >= 1e9)  return (n / 1e9).toFixed(2) + "B";
  if (abs >= 1e6)  return (n / 1e6).toFixed(2) + "M";
  if (abs >= 1e3)  return (n / 1e3).toFixed(1) + "K";
  return Math.floor(n).toString();
}
