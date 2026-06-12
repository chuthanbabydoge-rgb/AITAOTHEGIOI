// ============================================================
// HISTORICAL TIMELINE V23
// CREATOR GOD — V23 EMPIRE & KINGDOM ENGINE
// Lưu lịch sử vĩnh viễn — Kingdoms, Empires, Dynasties, Wars
// Tương thích 100% save cũ — KHÔNG xóa dữ liệu
// ============================================================

const HT_SAVE_KEY = "cgv6_historical_timeline";
const HT_VERSION  = 23;
const HT_MAX_EVENTS = 2000;

// ── INIT ──
function htInit() {
  if (!window.htData) {
    const saved = localStorage.getItem(HT_SAVE_KEY);
    window.htData = saved ? JSON.parse(saved) : {
      events:    [],
      idCounter: 0,
      version:   HT_VERSION,
    };
  }
  if (!window.htData.events)    window.htData.events    = [];
  if (!window.htData.idCounter) window.htData.idCounter = 0;
}

function htSave() {
  // Giới hạn số event để tránh vượt localStorage quota
  if (window.htData.events.length > HT_MAX_EVENTS) {
    window.htData.events = window.htData.events.slice(-HT_MAX_EVENTS);
  }
  try { localStorage.setItem(HT_SAVE_KEY, JSON.stringify(window.htData)); } catch(e) {}
}

// ── Thêm sự kiện ──
function htAddEvent(opts) {
  if (!window.htData) htInit();
  const evId = ++window.htData.idCounter;
  const event = {
    id:         evId,
    year:       opts.year !== undefined ? opts.year : (window.year || 0),
    type:       opts.type       || "general",
    text:       opts.text       || "",
    emoji:      opts.emoji      || htGetEmoji(opts.type || "general"),
    kingdomId:  opts.kingdomId  || null,
    empireId:   opts.empireId   || null,
    npcId:      opts.npcId      || null,
    importance: opts.importance || htGetImportance(opts.type || "general"),
  };
  window.htData.events.push(event);

  // Auto-save mỗi 50 events
  if (evId % 50 === 0) htSave();

  return event;
}

function htGetEmoji(type) {
  const map = {
    kingdom_founded:    "🏰",
    kingdom_upgrade:    "⬆️",
    kingdom_collapsed:  "💀",
    empire_founded:     "👑",
    empire_event:       "⚡",
    empire_collapsed:   "💀",
    wonder_built:       "🏛️",
    succession_peaceful:"✅",
    succession_contest: "⚔️",
    succession_civil_war:"🔥",
    succession_split:   "💔",
    succession_collapse:"💀",
    ruler_death:        "☠️",
    house_founded:      "🏛️",
    house_rebel:        "🔥",
    house_war:          "⚔️",
    house_extinct:      "💀",
    bloodline_hero:     "🌟",
    bloodline_extinct:  "💀",
    ranking_changed:    "🏆",
    general:            "📜",
  };
  return map[type] || "📜";
}

function htGetImportance(type) {
  const high = ["empire_founded","empire_collapsed","kingdom_collapsed","wonder_built","succession_civil_war","succession_collapse","bloodline_hero"];
  const med  = ["kingdom_founded","kingdom_upgrade","empire_event","house_rebel","ruler_death"];
  if (high.includes(type)) return "high";
  if (med.includes(type))  return "medium";
  return "low";
}

// ── Lọc sự kiện ──
function htGetEventsByYear(year) {
  if (!window.htData) return [];
  return window.htData.events.filter(e => e.year === year);
}

function htGetEventsByType(type) {
  if (!window.htData) return [];
  return window.htData.events.filter(e => e.type === type);
}

function htGetRecentEvents(n) {
  if (!window.htData) return [];
  return window.htData.events.slice(-n).reverse();
}

// ── Thống kê ──
function htGetStats() {
  if (!window.htData) return {};
  const events = window.htData.events;
  const byType = {};
  events.forEach(e => { byType[e.type] = (byType[e.type] || 0) + 1; });
  return {
    total:        events.length,
    highImportance: events.filter(e => e.importance === "high").length,
    medImportance:  events.filter(e => e.importance === "medium").length,
    oldestYear:   events.length > 0 ? events[0].year : null,
    newestYear:   events.length > 0 ? events[events.length-1].year : null,
    byType,
  };
}

// ── RENDER PANEL ──
function htRenderPanel() {
  const panel = document.getElementById("panel-historical-timeline");
  if (!panel) return;
  if (!window.htData) htInit();

  const stats    = htGetStats();
  const events   = window.htData.events || [];
  const filterType = (document.getElementById("htFilterType") || {}).value || "";
  const filterSearch = ((document.getElementById("htFilterSearch") || {}).value || "").toLowerCase();
  const filterImportance = (document.getElementById("htFilterImportance") || {}).value || "";

  let filtered = [...events].reverse();
  if (filterType)       filtered = filtered.filter(e => e.type === filterType);
  if (filterSearch)     filtered = filtered.filter(e => e.text.toLowerCase().includes(filterSearch));
  if (filterImportance) filtered = filtered.filter(e => e.importance === filterImportance);

  panel.innerHTML = `
    <div class="panel-toolbar" style="flex-wrap:wrap;gap:8px;margin-bottom:12px">
      <input id="htFilterSearch" class="dao-input small" placeholder="🔍 Tìm kiếm..." oninput="htRenderPanel()" style="min-width:160px">
      <select id="htFilterType" class="dao-select small" onchange="htRenderPanel()">
        <option value="">Tất cả loại</option>
        <option value="kingdom_founded">🏰 Kingdom Thành Lập</option>
        <option value="kingdom_collapsed">💀 Kingdom Sụp Đổ</option>
        <option value="empire_founded">👑 Đế Quốc Thành Lập</option>
        <option value="empire_collapsed">💀 Đế Quốc Sụp Đổ</option>
        <option value="wonder_built">🏛️ Kỳ Quan</option>
        <option value="succession_civil_war">🔥 Nội Chiến Kế Vị</option>
        <option value="ruler_death">☠️ Vua Băng Hà</option>
        <option value="house_rebel">🔥 Phản Loạn</option>
        <option value="bloodline_hero">🌟 Danh Nhân</option>
      </select>
      <select id="htFilterImportance" class="dao-select small" onchange="htRenderPanel()">
        <option value="">Mức quan trọng</option>
        <option value="high">🔴 Quan Trọng Cao</option>
        <option value="medium">🟡 Trung Bình</option>
        <option value="low">⚪ Thông Thường</option>
      </select>
      <span style="margin-left:auto;font-size:12px;color:var(--white-dim)">${filtered.length}/${events.length} sự kiện</span>
      <button class="btn-secondary" style="padding:5px 10px;font-size:11px" onclick="htSave();if(typeof toast==='function')toast('💾 Đã lưu timeline!')">💾 Lưu</button>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px">
      ${[
        ["📜","Tổng sự kiện",stats.total || 0],
        ["🔴","Trọng đại",stats.highImportance || 0],
        ["📅","Năm đầu", stats.oldestYear !== null ? "Năm "+stats.oldestYear : "—"],
        ["📅","Năm gần nhất", stats.newestYear !== null ? "Năm "+stats.newestYear : "—"],
      ].map(([icon,label,val]) => `
        <div class="card" style="padding:10px;text-align:center">
          <div style="font-size:18px;margin-bottom:4px">${icon}</div>
          <div style="font-size:15px;font-weight:800;color:var(--gold)">${val}</div>
          <div style="font-size:9px;color:var(--white-dim)">${label}</div>
        </div>
      `).join("")}
    </div>

    <div class="card">
      <div class="card-title">⏳ Dòng Thời Gian Vĩnh Cửu — V23 Empire & Kingdom Engine</div>
      ${filtered.length === 0 ? `
        <div style="text-align:center;padding:40px;color:var(--white-dim)">
          <div style="font-size:40px;margin-bottom:12px">📜</div>
          <div>Chưa có sự kiện lịch sử nào được ghi lại.<br>Hãy chạy mô phỏng để tạo lịch sử!</div>
        </div>
      ` : `
        <div style="display:flex;flex-direction:column;gap:0;max-height:600px;overflow-y:auto">
          ${filtered.slice(0, 200).map(e => htRenderEventRow(e)).join("")}
          ${filtered.length > 200 ? `<div style="text-align:center;padding:12px;color:var(--white-dim);font-size:12px">...và ${filtered.length - 200} sự kiện khác</div>` : ""}
        </div>
      `}
    </div>
  `;
}

function htRenderEventRow(e) {
  const importanceColor = { high:"#f87171", medium:"#facc15", low:"rgba(255,255,255,0.2)" }[e.importance] || "rgba(255,255,255,0.1)";
  return `
    <div style="display:flex;gap:10px;padding:7px 8px;border-bottom:1px solid rgba(255,255,255,0.03);transition:background .15s" onmouseenter="this.style.background='rgba(255,255,255,0.02)'" onmouseleave="this.style.background='transparent'">
      <div style="flex-shrink:0;display:flex;align-items:center;gap:6px;min-width:80px">
        <div style="width:6px;height:6px;border-radius:50%;background:${importanceColor};flex-shrink:0"></div>
        <span style="font-size:10px;color:var(--gold-dim);font-variant-numeric:tabular-nums">Năm ${e.year}</span>
      </div>
      <div style="font-size:12px;color:var(--white-dim);line-height:1.4">${e.emoji} ${e.text}</div>
    </div>
  `;
}

function htShowNavBtn() {
  const btn = document.querySelector('.nav-btn[data-panel="historical-timeline"]');
  if (btn) { btn.style.display = ""; btn.classList.remove("ec-hidden"); }
}

document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    htInit();
    htShowNavBtn();
    // Ghi lại sự kiện từ lịch sử game hiện có nếu có
    _htMigrateWorldHistory();
    setInterval(function() {
      const active = document.querySelector('.nav-btn.active[data-panel="historical-timeline"]');
      if (active) htRenderPanel();
    }, 15000);
  }, 800);
});

// ── Migrate sự kiện từ worldHistory ──
function _htMigrateWorldHistory() {
  if (!window.worldHistory || !Array.isArray(window.worldHistory)) return;
  if (!window.htData) return;

  // Chỉ migrate nếu chưa có events
  if (window.htData.events.length > 0) return;

  const slice = window.worldHistory.slice(-100);
  slice.forEach(h => {
    if (!h || !h.text) return;
    htAddEvent({
      year:       h.year || 0,
      type:       h.type || "general",
      text:       h.text || "",
      importance: "low",
    });
  });
  htSave();
}

// ============================================================
// HISTORICAL TIMELINE V23 — EXPANSION PACK
// War Chronicle, Religion Events, Richer Filter UI,
// Event Categories, Timeline Export
// EXPAND ONLY — không xóa dữ liệu cũ
// ============================================================

// ── Mở rộng bảng emoji & importance ──
const HT_EXTRA_TYPES = {
  holy_war:           { emoji:"⚔️🔥", importance:"high"   },
  faith_spread:       { emoji:"✝️",   importance:"low"    },
  temple_built:       { emoji:"🏯",   importance:"medium" },
  kingdom_war:        { emoji:"⚔️",   importance:"high"   },
  vassal_rebellion:   { emoji:"🔥👑", importance:"high"   },
  empire_conquest:    { emoji:"🏴",   importance:"high"   },
  bloodline_mutation: { emoji:"🧬✨", importance:"medium" },
  house_rivalry:      { emoji:"⚔️🏛️",importance:"low"    },
  house_alliance:     { emoji:"🤝🏛️",importance:"low"    },
  house_marriage:     { emoji:"💍",   importance:"low"    },
  house_war:          { emoji:"⚔️🏛️",importance:"high"   },
  succession_contest: { emoji:"⚔️👑", importance:"medium" },
  succession_split:   { emoji:"💔👑", importance:"high"   },
};

// ── Patch htGetEmoji để hỗ trợ loại mới ──
const _htGetEmoji_orig = htGetEmoji;
function htGetEmoji_v23(type) {
  if (HT_EXTRA_TYPES[type]) return HT_EXTRA_TYPES[type].emoji;
  return _htGetEmoji_orig(type);
}
window.htGetEmoji = htGetEmoji_v23;

// ── Patch htGetImportance để hỗ trợ loại mới ──
const _htGetImportance_orig = htGetImportance;
function htGetImportance_v23(type) {
  if (HT_EXTRA_TYPES[type]) return HT_EXTRA_TYPES[type].importance;
  return _htGetImportance_orig(type);
}
window.htGetImportance = htGetImportance_v23;

// ── Ghi lại sự kiện chiến tranh từ warEngine ──
function htRecordWarEvent(opts) {
  htAddEvent({
    year:       opts.year || (window.year || 0),
    type:       opts.type || "kingdom_war",
    text:       opts.text || "",
    kingdomId:  opts.attacker || null,
    empireId:   opts.empire || null,
    importance: "high",
  });
}

// ── Ghi lại sự kiện tôn giáo ──
function htRecordReligionEvent(opts) {
  htAddEvent({
    year:      opts.year || (window.year || 0),
    type:      opts.type || "faith_spread",
    text:      opts.text || "",
    kingdomId: opts.kingdomId || null,
    importance: HT_EXTRA_TYPES[opts.type] ? HT_EXTRA_TYPES[opts.type].importance : "low",
  });
}

// ── Thống kê nâng cao ──
function htGetAdvancedStats() {
  if (!window.htData) return {};
  const events = window.htData.events;
  const warTypes = ["kingdom_war","holy_war","vassal_rebellion","empire_conquest","house_war","succession_civil_war"];
  const relTypes = ["faith_spread","holy_war","temple_built"];

  return {
    totalWars:    events.filter(e => warTypes.includes(e.type)).length,
    totalReligion: events.filter(e => relTypes.includes(e.type)).length,
    totalEmpire:  events.filter(e => e.type.startsWith("empire")).length,
    totalSuccession: events.filter(e => e.type.startsWith("succession")).length,
    totalBloodline: events.filter(e => e.type.startsWith("bloodline")).length,
    totalHouses:  events.filter(e => e.type.startsWith("house")).length,
  };
}

// ── Panel timeline mở rộng ──
function htRenderPanel_v23() {
  const panel = document.getElementById("panel-historical-timeline");
  if (!panel) return;
  if (!window.htData) htInit();

  const stats    = htGetStats();
  const advStats = htGetAdvancedStats();
  const events   = window.htData.events || [];

  const filterType      = (document.getElementById("htFilterType")       || {}).value || "";
  const filterSearch    = ((document.getElementById("htFilterSearch")    || {}).value || "").toLowerCase();
  const filterImportance= (document.getElementById("htFilterImportance") || {}).value || "";
  const filterCategory  = (document.getElementById("htFilterCategory")   || {}).value || "";

  let filtered = [...events].reverse();
  if (filterType)       filtered = filtered.filter(e => e.type === filterType);
  if (filterSearch)     filtered = filtered.filter(e => e.text.toLowerCase().includes(filterSearch));
  if (filterImportance) filtered = filtered.filter(e => e.importance === filterImportance);
  if (filterCategory === "war")       filtered = filtered.filter(e => ["kingdom_war","holy_war","vassal_rebellion","empire_conquest","house_war","succession_civil_war"].includes(e.type));
  if (filterCategory === "religion")  filtered = filtered.filter(e => ["faith_spread","holy_war","temple_built"].includes(e.type));
  if (filterCategory === "empire")    filtered = filtered.filter(e => e.type.startsWith("empire"));
  if (filterCategory === "bloodline") filtered = filtered.filter(e => e.type.startsWith("bloodline"));
  if (filterCategory === "house")     filtered = filtered.filter(e => e.type.startsWith("house"));
  if (filterCategory === "succession")filtered = filtered.filter(e => e.type.startsWith("succession") || e.type === "ruler_death");

  panel.innerHTML = `
    <div class="panel-toolbar" style="flex-wrap:wrap;gap:8px;margin-bottom:12px">
      <input id="htFilterSearch" class="dao-input small" placeholder="🔍 Tìm kiếm..." oninput="htRenderPanel_v23()" style="min-width:140px">
      <select id="htFilterCategory" class="dao-select small" onchange="htRenderPanel_v23()">
        <option value="">📂 Tất cả danh mục</option>
        <option value="war">⚔️ Chiến Tranh</option>
        <option value="religion">✝️ Tôn Giáo</option>
        <option value="empire">👑 Đế Quốc</option>
        <option value="succession">👑 Kế Vị</option>
        <option value="bloodline">🧬 Huyết Mạch</option>
        <option value="house">🏛️ Gia Tộc</option>
      </select>
      <select id="htFilterType" class="dao-select small" onchange="htRenderPanel_v23()">
        <option value="">Tất cả loại</option>
        <option value="kingdom_founded">🏰 Kingdom TL</option>
        <option value="kingdom_war">⚔️ Chiến Tranh</option>
        <option value="holy_war">⚔️🔥 Thánh Chiến</option>
        <option value="faith_spread">✝️ Truyền Giáo</option>
        <option value="temple_built">🏯 Đền Thờ</option>
        <option value="empire_founded">👑 Đế Quốc TL</option>
        <option value="empire_conquest">🏴 Chinh Phục</option>
        <option value="vassal_rebellion">🔥 Chư Hầu Phản</option>
        <option value="wonder_built">🏛️ Kỳ Quan</option>
        <option value="succession_civil_war">🔥 Nội Chiến</option>
        <option value="succession_split">💔 Chia Cắt</option>
        <option value="ruler_death">☠️ Vua Băng Hà</option>
        <option value="bloodline_mutation">🧬 Đột Biến</option>
        <option value="bloodline_hero">🌟 Danh Nhân</option>
        <option value="house_war">⚔️🏛️ Chiến Gia Tộc</option>
        <option value="house_marriage">💍 Hôn Nhân CT</option>
        <option value="kingdom_collapsed">💀 Kingdom Sụp</option>
        <option value="empire_collapsed">💀 Đế Quốc Sụp</option>
      </select>
      <select id="htFilterImportance" class="dao-select small" onchange="htRenderPanel_v23()">
        <option value="">Mức quan trọng</option>
        <option value="high">🔴 Cao</option>
        <option value="medium">🟡 Trung Bình</option>
        <option value="low">⚪ Thấp</option>
      </select>
      <span style="margin-left:auto;font-size:11px;color:var(--white-dim);align-self:center">${filtered.length}/${events.length}</span>
      <button class="btn-secondary" style="padding:5px 10px;font-size:11px" onclick="htSave();if(typeof toast==='function')toast('💾 Đã lưu!')">💾</button>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px">
      ${[
        ["📜","Tổng sự kiện",  stats.total||0,            "#60a5fa"],
        ["⚔️","Chiến tranh",   advStats.totalWars||0,     "#f87171"],
        ["✝️","Tôn giáo",      advStats.totalReligion||0, "#facc15"],
        ["🔴","Trọng đại",     stats.highImportance||0,   "#c084fc"],
      ].map(([icon,label,val,color]) => `
        <div class="card" style="padding:8px;text-align:center;border-top:2px solid ${color}">
          <div style="font-size:16px;margin-bottom:3px">${icon}</div>
          <div style="font-size:18px;font-weight:900;color:${color}">${val}</div>
          <div style="font-size:9px;color:var(--white-dim)">${label}</div>
        </div>
      `).join("")}
    </div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">
      ${[
        ["👑","Đế Quốc",    advStats.totalEmpire||0],
        ["🧬","Huyết Mạch", advStats.totalBloodline||0],
        ["🏛️","Gia Tộc",   advStats.totalHouses||0],
      ].map(([icon,label,val]) => `
        <div class="card" style="padding:6px;text-align:center;display:flex;align-items:center;gap:8px;justify-content:center">
          <span style="font-size:14px">${icon}</span>
          <div>
            <div style="font-size:14px;font-weight:700;color:var(--gold)">${val}</div>
            <div style="font-size:9px;color:var(--white-dim)">${label}</div>
          </div>
        </div>
      `).join("")}
    </div>

    <div class="card">
      <div class="card-title">⏳ Dòng Thời Gian Vĩnh Cửu</div>
      ${filtered.length === 0 ? `
        <div style="text-align:center;padding:40px;color:var(--white-dim)">
          <div style="font-size:40px;margin-bottom:12px">📜</div>
          <div>Chưa có sự kiện lịch sử.<br>Hãy chạy mô phỏng để tạo lịch sử!</div>
        </div>
      ` : `
        <div style="display:flex;flex-direction:column;gap:0;max-height:580px;overflow-y:auto">
          ${filtered.slice(0, 300).map(e => htRenderEventRow_v23(e)).join("")}
          ${filtered.length > 300 ? `<div style="text-align:center;padding:10px;color:var(--white-dim);font-size:11px">...và ${filtered.length - 300} sự kiện khác</div>` : ""}
        </div>
      `}
    </div>
  `;
}

function htRenderEventRow_v23(e) {
  const importanceColor = { high:"#f87171", medium:"#facc15", low:"rgba(255,255,255,0.15)" }[e.importance] || "rgba(255,255,255,0.1)";
  const warTypes = ["kingdom_war","holy_war","vassal_rebellion","empire_conquest","house_war","succession_civil_war","succession_collapse"];
  const isWar = warTypes.includes(e.type);
  const bg = e.importance === "high" ? "rgba(248,113,113,0.04)"
           : e.importance === "medium" ? "rgba(250,204,21,0.03)" : "transparent";
  return `
    <div style="display:flex;gap:10px;padding:7px 8px;border-bottom:1px solid rgba(255,255,255,0.03);background:${bg};transition:background .1s" onmouseenter="this.style.background='rgba(255,255,255,0.03)'" onmouseleave="this.style.background='${bg}'">
      <div style="flex-shrink:0;display:flex;align-items:center;gap:5px;min-width:80px">
        <div style="width:6px;height:6px;border-radius:50%;background:${importanceColor};flex-shrink:0"></div>
        <span style="font-size:10px;color:var(--gold-dim);font-variant-numeric:tabular-nums">Năm ${e.year}</span>
      </div>
      <div style="font-size:12px;color:${isWar ? "#fca5a5" : "var(--white-dim)"};line-height:1.4;flex:1">${e.emoji} ${e.text}</div>
    </div>
  `;
}

// ── Patch htRenderPanel → dùng phiên bản mở rộng ──
window.htRenderPanel      = htRenderPanel_v23;
window.htRenderPanel_v23  = htRenderPanel_v23;
window.htRecordWarEvent   = htRecordWarEvent;
window.htRecordReligionEvent = htRecordReligionEvent;
window.htGetAdvancedStats = htGetAdvancedStats;
window.htRenderEventRow_v23 = htRenderEventRow_v23;
