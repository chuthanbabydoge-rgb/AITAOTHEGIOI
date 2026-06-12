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
