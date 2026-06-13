(function() {
  "use strict";
  const SAVE_KEY = "cgv6_world_alert_v33";
  const MAX_ALERTS = 100;

  window.worldAlertData = {
    alerts: [],
    unreadCount: 0,
    lastCheckYear: 0,
    version: "V33"
  };

  // Trạng thái snapshot để phát hiện thay đổi
  let _prevWarCount = 0;
  let _prevKingdomCount = 0;
  let _prevEmpireCount = 0;
  let _prevBossCount = 0;
  let _prevNpcCount = 0;
  let _prevDivineCount = 0;

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.worldAlertData)); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) {
        const parsed = JSON.parse(d);
        window.worldAlertData = Object.assign(window.worldAlertData, parsed);
      }
    } catch(e) {}
  }

  // Thêm cảnh báo mới
  window.waeAddAlert = function(level, title, message, category) {
    const alert = {
      id: Date.now() + Math.random(),
      level: level || "medium",   // critical | high | medium | low | info
      title: title || "",
      message: message || "",
      category: category || "general", // war | divine | economy | kingdom | empire | boss | disaster | ascension
      year: window.year || 0,
      ts: Date.now(),
      read: false
    };
    window.worldAlertData.alerts.unshift(alert);
    window.worldAlertData.unreadCount = (window.worldAlertData.unreadCount || 0) + 1;
    if (window.worldAlertData.alerts.length > MAX_ALERTS) {
      window.worldAlertData.alerts = window.worldAlertData.alerts.slice(0, MAX_ALERTS);
    }
    // Ghi vào memory
    if (typeof window.thtAddMemory === 'function') {
      window.thtAddMemory(category, title, message, window.year || 0);
    }
    save();
    return alert;
  };

  window.waeGetAlerts = function(filterLevel, filterCategory) {
    let list = window.worldAlertData.alerts || [];
    if (filterLevel) list = list.filter(a => a.level === filterLevel);
    if (filterCategory) list = list.filter(a => a.category === filterCategory);
    return list;
  };

  window.waeMarkAllRead = function() {
    window.worldAlertData.alerts.forEach(a => a.read = true);
    window.worldAlertData.unreadCount = 0;
    save();
  };

  window.waeClearOld = function() {
    const currentYear = window.year || 0;
    const cutoff = currentYear - 200;
    window.worldAlertData.alerts = window.worldAlertData.alerts.filter(a =>
      a.level === "critical" || a.year >= cutoff
    ).slice(0, MAX_ALERTS);
    save();
  };

  // Phát hiện thay đổi và tạo cảnh báo tự động
  function detectChanges() {
    if (!window.world || !window.world.name) return;
    const yr = window.year || 0;
    if (yr === window.worldAlertData.lastCheckYear) return;
    window.worldAlertData.lastCheckYear = yr;

    // === CHIẾN TRANH ===
    const wars = window.warsActive || [];
    if (wars.length > _prevWarCount) {
      const newWar = wars[0];
      if (newWar) {
        window.waeAddAlert("high", "⚔️ Chiến Tranh Nổ Ra",
          `${newWar.attacker || "?"} đã tuyên chiến với ${newWar.defender || "?"}. Năm ${yr}.`,
          "war");
      }
    }
    _prevWarCount = wars.length;

    // === VƯƠNG QUỐC SỤP ĐỔ ===
    const _kRaw = (window.kingdomData && window.kingdomData.kingdoms) ? window.kingdomData.kingdoms : [];
    const kingdoms = Array.isArray(_kRaw) ? _kRaw : Object.values(_kRaw);
    const kActive = kingdoms.filter(k => k.status === "active" || !k.status).length;
    if (kActive < _prevKingdomCount && _prevKingdomCount > 0) {
      window.waeAddAlert("medium", "🏯 Vương Quốc Sụp Đổ",
        `Một vương quốc đã sụp đổ vào năm ${yr}.`, "kingdom");
    }
    _prevKingdomCount = kActive;

    // === ĐẾ CHẾ HÌNH THÀNH ===
    const _eRaw = (window.empireData && window.empireData.empires) ? window.empireData.empires : [];
    const empires = Array.isArray(_eRaw) ? _eRaw : Object.values(_eRaw);
    const eActive = empires.filter(e => e.status === "active" || !e.status).length;
    if (eActive > _prevEmpireCount && _prevEmpireCount > 0) {
      window.waeAddAlert("high", "👑 Đế Chế Mới Hình Thành",
        `Một Đế Chế mới đã ra đời vào năm ${yr}.`, "empire");
    }
    _prevEmpireCount = eActive;

    // === WORLD BOSS ===
    const bosses = (window.wbv31Data && window.wbv31Data.activeBosses) ? window.wbv31Data.activeBosses : [];
    if (bosses.length > _prevBossCount && _prevBossCount >= 0) {
      const newBoss = bosses[bosses.length - 1];
      if (newBoss) {
        const tierMap = {rare:"Hiếm",epic:"Sử Thi",legendary:"Huyền Thoại",mythic:"Thần Thoại",divine:"Thần Thánh",creator:"Tạo Hóa"};
        const tierName = tierMap[newBoss.tier] || newBoss.tier || "?";
        const lvl = newBoss.tier === "critical" || newBoss.tier === "divine" || newBoss.tier === "creator" ? "critical" : "high";
        window.waeAddAlert(lvl, "👹 Boss Xuất Hiện",
          `[${tierName}] ${newBoss.name || "Boss Ẩn Danh"} đã xuất hiện tại năm ${yr}.`, "boss");
      }
    }
    _prevBossCount = bosses.length;

    // === THẦN THÁNH ===
    const divines = (window.divineBeingData && window.divineBeingData.deities) ? window.divineBeingData.deities : [];
    if (divines.length > _prevDivineCount && _prevDivineCount >= 0) {
      const newDivine = divines[divines.length - 1];
      if (newDivine) {
        window.waeAddAlert("high", "⚡ Thần Chủ Thức Tỉnh",
          `${newDivine.name || "Thần Ẩn Danh"} — ${newDivine.domain || "?"} đã thức tỉnh vào năm ${yr}.`, "divine");
      }
    }
    _prevDivineCount = divines.length;

    // === THIÊN TAI ===
    const disasters = (window.disasterData && window.disasterData.activeDisasters) ? window.disasterData.activeDisasters : [];
    disasters.forEach(d => {
      if (d.year === yr && !d._alerted) {
        d._alerted = true;
        window.waeAddAlert("medium", "🌋 Thiên Tai Xảy Ra",
          `${d.name || "Thiên tai"} cấp độ ${d.severity || "?"} tại ${d.region || "?"} — Năm ${yr}.`, "disaster");
      }
    });

    // === ĐẠI DỊCH ===
    const plagues = (window.plagueData && window.plagueData.activePlagues) ? window.plagueData.activePlagues : [];
    plagues.forEach(pl => {
      if (pl.year === yr && !pl._alerted) {
        pl._alerted = true;
        window.waeAddAlert("high", "💀 Đại Dịch Bùng Phát",
          `${pl.name || "Dịch bệnh"} đã bùng phát tại ${pl.origin || "?"} — Năm ${yr}.`, "disaster");
      }
    });

    // === NPC THĂNG THIÊN ===
    const npcs = window.npcs || [];
    const transcended = npcs.filter(n =>
      n.realm && (n.realm.includes("Tiên") || n.realm.includes("Thần") || n.realm.includes("Đế")) &&
      n._transcendYear === yr
    );
    if (transcended.length > 0) {
      transcended.slice(0, 2).forEach(n => {
        window.waeAddAlert("medium", "✨ Tu Sĩ Thăng Thiên",
          `${n.name || "?"} đã đột phá lên ${n.realm || "cảnh giới cao"} vào năm ${yr}.`, "ascension");
      });
    }

    // === XÂM LƯỢC ===
    const invasions = (window.iev31Data && window.iev31Data.activeInvasions) ? window.iev31Data.activeInvasions : [];
    invasions.forEach(inv => {
      if (inv.startYear === yr && !inv._alerted) {
        inv._alerted = true;
        const lvlMap = {demon:"Quỷ",undead:"Tử Linh",divine:"Thần Thánh",void:"Hư Không",titan:"Titan"};
        window.waeAddAlert("critical", "🌋 XÂM LƯỢC BẮT ĐẦU",
          `Làn sóng ${lvlMap[inv.type] || inv.type || "?"} xâm lược — ${inv.waves || 1} đợt. Năm ${yr}.`, "boss");
      }
    });

    save();
  }

  // Render panel cảnh báo
  window.waeRenderPanel = function() {
    const panel = document.getElementById("panel-alerts");
    if (!panel) return;
    window.waeMarkAllRead();

    const alerts = window.worldAlertData.alerts || [];
    const levelColors = { critical:"#ef4444", high:"#f97316", medium:"#eab308", low:"#22c55e", info:"#60a5fa" };
    const levelIcons = { critical:"🔴", high:"🟠", medium:"🟡", low:"🟢", info:"🔵" };

    let html = `<div style="padding:16px;font-family:'Noto Serif SC',serif;color:#e2e8f0">
      <h2 style="color:#f59e0b;margin:0 0 4px">🚨 Trung Tâm Cảnh Báo</h2>
      <p style="color:#94a3b8;margin:0 0 16px;font-size:13px">Năm ${window.year||0} · ${alerts.length} cảnh báo</p>`;

    // Bộ lọc
    html += `<div style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap">
      <button onclick="waeFilterAlerts(null)" style="padding:4px 10px;background:#1e293b;border:1px solid #f59e0b;border-radius:4px;color:#f59e0b;cursor:pointer;font-size:12px">Tất Cả</button>
      <button onclick="waeFilterAlerts('critical')" style="padding:4px 10px;background:#1e293b;border:1px solid #ef4444;border-radius:4px;color:#ef4444;cursor:pointer;font-size:12px">🔴 Khẩn Cấp</button>
      <button onclick="waeFilterAlerts('high')" style="padding:4px 10px;background:#1e293b;border:1px solid #f97316;border-radius:4px;color:#f97316;cursor:pointer;font-size:12px">🟠 Cao</button>
      <button onclick="waeFilterAlerts('medium')" style="padding:4px 10px;background:#1e293b;border:1px solid #eab308;border-radius:4px;color:#eab308;cursor:pointer;font-size:12px">🟡 Trung</button>
    </div>`;

    if (alerts.length === 0) {
      html += `<div style="text-align:center;padding:40px;color:#475569">
        <div style="font-size:40px">✅</div>
        <p>Không có cảnh báo nào.<br>Thế giới đang ổn định.</p>
      </div>`;
    } else {
      html += `<div id="alert-list-container">`;
      alerts.slice(0, 50).forEach(a => {
        const color = levelColors[a.level] || "#94a3b8";
        const icon = levelIcons[a.level] || "⚪";
        html += `<div style="background:#0f172a;border:1px solid ${color}44;border-left:3px solid ${color};border-radius:6px;padding:10px 14px;margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <span style="color:${color};font-weight:bold;font-size:13px">${icon} ${a.title||""}</span>
            <span style="color:#475569;font-size:11px">Năm ${a.year||0}</span>
          </div>
          <p style="margin:6px 0 0;color:#cbd5e1;font-size:12px">${a.message||""}</p>
          <span style="font-size:11px;color:#475569">[${a.category||""}]</span>
        </div>`;
      });
      html += `</div>`;
    }

    html += `<button onclick="waeClearOld();waeRenderPanel()" style="margin-top:12px;padding:6px 14px;background:#1e293b;border:1px solid #475569;border-radius:4px;color:#94a3b8;cursor:pointer;font-size:12px">🗑 Dọn Cảnh Báo Cũ</button>`;
    html += `</div>`;
    panel.innerHTML = html;
  };

  window.waeFilterAlerts = function(level) {
    const panel = document.getElementById("panel-alerts");
    if (!panel) return;
    const container = panel.querySelector("#alert-list-container");
    if (!container) return;
    const alerts = level ? window.waeGetAlerts(level) : window.worldAlertData.alerts;
    const levelColors = { critical:"#ef4444", high:"#f97316", medium:"#eab308", low:"#22c55e", info:"#60a5fa" };
    const levelIcons = { critical:"🔴", high:"🟠", medium:"🟡", low:"🟢", info:"🔵" };
    let html = "";
    alerts.slice(0, 50).forEach(a => {
      const color = levelColors[a.level] || "#94a3b8";
      const icon = levelIcons[a.level] || "⚪";
      html += `<div style="background:#0f172a;border:1px solid ${color}44;border-left:3px solid ${color};border-radius:6px;padding:10px 14px;margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <span style="color:${color};font-weight:bold;font-size:13px">${icon} ${a.title||""}</span>
          <span style="color:#475569;font-size:11px">Năm ${a.year||0}</span>
        </div>
        <p style="margin:6px 0 0;color:#cbd5e1;font-size:12px">${a.message||""}</p>
      </div>`;
    });
    container.innerHTML = html || `<p style="color:#475569;padding:20px">Không có cảnh báo nào.</p>`;
  };

  // gameTick hook
  function waeTick() {
    detectChanges();
  }

  function init() {
    load();
    // Khởi tạo snapshot
    _prevWarCount = (window.warsActive || []).length;
    const _kArr = window.kingdomData && window.kingdomData.kingdoms ? (Array.isArray(window.kingdomData.kingdoms) ? window.kingdomData.kingdoms : Object.values(window.kingdomData.kingdoms)) : [];
    _prevKingdomCount = _kArr.filter(k=>!k.collapsed).length;
    const _eArr = window.empireData && window.empireData.empires ? (Array.isArray(window.empireData.empires) ? window.empireData.empires : Object.values(window.empireData.empires)) : [];
    _prevEmpireCount = _eArr.filter(e=>!e.dissolved).length;
    _prevBossCount = ((window.wbv31Data && window.wbv31Data.activeBosses) ? window.wbv31Data.activeBosses.length : 0);
    _prevDivineCount = ((window.divineBeingData && window.divineBeingData.deities) ? window.divineBeingData.deities.length : 0);

    const _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      waeTick();
    };
    console.log("[WorldAlertEngine V33] 🚨 Hệ Thống Cảnh Báo Thế Giới khởi động — Giám sát 8 loại sự kiện.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 1900); });
  } else {
    setTimeout(init, 1900);
  }
})();
