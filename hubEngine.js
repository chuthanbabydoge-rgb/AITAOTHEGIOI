(function() {
  "use strict";

  const HUB_CONFIGS = {
    "diplomacy-hub-v24": {
      icon: "🤝", title: "Ngoại Giao V24", color: "#60a5fa",
      tabs: [
        { id: "diplomacy-v24",   icon: "🤝", label: "Hub Ngoại Giao", fn: "de24RenderPanel" },
        { id: "treaties-v24",    icon: "📜", label: "Hiệp Ước",       fn: "teRenderPanel" },
        { id: "world-council",   icon: "🏛", label: "Hội Đồng TG",    fn: "wcRenderPanel" },
        { id: "intl-relations",  icon: "🌍", label: "Quan Hệ QT",     fn: "irRenderPanel" }
      ]
    },
    "event-hub-v25": {
      icon: "🌋", title: "Biến Cố V25", color: "#ef4444",
      tabs: [
        { id: "disaster",        icon: "🌋", label: "Thiên Tai",      fn: "deRenderPanel" },
        { id: "plague",          icon: "💀", label: "Đại Dịch",       fn: "plRenderPanel" },
        { id: "econ-crisis",     icon: "💹", label: "Sự Kiện KT",     fn: "ecRenderPanel" },
        { id: "world-event-v25", icon: "🗡️", label: "Chính Trị",      fn: "wev25RenderPanel" },
        { id: "age-v25",         icon: "🌅", label: "Thời Đại",       fn: "av25RenderPanel" }
      ]
    },
    "continent-hub-v26": {
      icon: "🌎", title: "Lục Địa V26", color: "#22c55e",
      tabs: [
        { id: "continent-v26",   icon: "🌎", label: "Lục Địa",       fn: "cev26RenderPanel" },
        { id: "migration-v26",   icon: "🚶", label: "Di Cư",          fn: "mev26RenderPanel" },
        { id: "cont-politics",   icon: "🏛️", label: "Chính Trị LC",   fn: "cpRenderPanel" }
      ]
    },
    "ocean-hub-v27": {
      icon: "🚢", title: "Hải Dương V27", color: "#22d3ee",
      tabs: [
        { id: "naval-v27",       icon: "🚢", label: "Hải Quân",       fn: "nvRenderPanel",
          extra: function(){ if(typeof window.feRenderFleets==='function') window.feRenderFleets('panel-naval-v27'); } },
        { id: "pirates",         icon: "🏴", label: "Cướp Biển",      fn: "piRenderPanel" },
        { id: "ocean-v27",       icon: "🌊", label: "Thương Mại Biển",fn: "otRenderPanel" },
        { id: "colonies",        icon: "🏝", label: "Thuộc Địa",      fn: "coRenderPanel" }
      ]
    },
    "cultivation-hub-v29": {
      icon: "🏯", title: "Tu Tiên V29", color: "#a78bfa",
      tabs: [
        { id: "sect-v29",        icon: "🏯", label: "Môn Phái",       fn: "seV29RenderPanel" },
        { id: "sect-war-v29",    icon: "⚔️", label: "CT Môn Phái",    fn: "swV29RenderPanel" },
        { id: "techniques-v29",  icon: "📖", label: "Kỹ Thuật",       fn: "seV29RenderTechPanel" },
        { id: "disciples-v29",   icon: "🎓", label: "Đệ Tử",          fn: "seV29RenderDiscPanel" },
        { id: "guild-v29",       icon: "🏛", label: "Bang Hội",        fn: "guildV29RenderPanel" }
      ]
    },
    "divine-hub-v30": {
      icon: "⚡", title: "Thần Thánh V30", color: "#fbbf24",
      tabs: [
        { id: "realm-v30",         icon: "🌌", label: "Các Cõi",       fn: "realmV30RenderPanel" },
        { id: "divine-v30",        icon: "👼", label: "Thần Linh",      fn: "divineV30RenderPanel" },
        { id: "domain-v30",        icon: "⚡", label: "Lĩnh Vực TT",   fn: "divineV30RenderDomainPanel" },
        { id: "pantheon-v30",      icon: "🏛", label: "Thần Điện",      fn: "panV30RenderPanel" },
        { id: "portal-v30",        icon: "🌀", label: "Cổng DChuyển",  fn: "portalV30RenderPanel" },
        { id: "divinewar-v30",     icon: "⚔️", label: "CT Thần Thánh", fn: "dwV30RenderPanel" },
        { id: "divine-history-v30",icon: "📜", label: "Sử Thần",       fn: "divineV30RenderHistoryPanel" }
      ]
    },
    "combat-hub-v31": {
      icon: "👹", title: "Chiến Đấu V31", color: "#f97316",
      tabs: [
        { id: "worldboss-v31",   icon: "👹", label: "World Boss",     fn: "wbv31RenderPanel" },
        { id: "dungeon-v31",     icon: "🏛", label: "Dungeon",         fn: "dev31RenderPanel" },
        { id: "raid-v31",        icon: "⚔️", label: "Raid",            fn: "rev31RenderPanel" },
        { id: "invasion-v31",    icon: "🌋", label: "Xâm Lược",       fn: "iev31RenderPanel" },
        { id: "hunt-v31",        icon: "🏆", label: "Săn Boss",        fn: "lhv31RenderPanel" },
        { id: "loot-v31",        icon: "🎁", label: "Loot",            fn: "lev31RenderPanel" }
      ]
    },
    "player-hub-v28": {
      icon: "👤", title: "Nhân Vật V28", color: "#6366f1",
      tabs: [
        { id: "player-v28",      icon: "👤", label: "Nhân Vật",       fn: "peRenderPanel" },
        { id: "inventory-v28",   icon: "🎒", label: "Kho Đồ",          fn: "invRenderPanel" },
        { id: "my-history",      icon: "📜", label: "Danh Tiếng",      fn: "prRenderPanel" },
        { id: "my-kingdom",      icon: "🏰", label: "Lãnh Thổ",        fn: "ptRenderMyKingdom" },
        { id: "my-empire",       icon: "👑", label: "Đế Chế",          fn: "ptRenderMyEmpire" },
        { id: "player-war",      icon: "⚔️", label: "Chiến Tranh",     fn: "ptRenderPlayerWar" },
        { id: "ascension-v28",   icon: "⭐", label: "Thăng Thiên",     fn: "ascRenderPanel" }
      ]
    },
    "creator-hub-v32": {
      icon: "👁", title: "Creator God V32", color: "#e2e8f0",
      tabs: [
        { id: "creator-control",    icon: "👁",  label: "Bảng Điều Khiển", fn: "creatorControlRenderPanel" },
        { id: "divine-admin",       icon: "👼", label: "Kiểm Soát Thần",  fn: "divineAdminRenderPanel" },
        { id: "creator-analytics",  icon: "📊", label: "Phân Tích TG",    fn: "creatorAnalyticsRenderPanel" }
      ]
    },
    "guardian-hub-v33": {
      icon: "🤖", title: "Thủ Hộ Thần V33", color: "#22c55e",
      tabs: [
        { id: "thuhothan",     icon: "🤖", label: "Thủ Hộ Thần",  fn: "thtRenderPanel" },
        { id: "world-news",    icon: "📢", label: "Tin Tức",        fn: "efRenderPanel" },
        { id: "alerts",        icon: "🚨", label: "Cảnh Báo",       fn: "waeRenderPanel" },
        { id: "advisor",       icon: "📊", label: "Cố Vấn",         fn: "paRenderPanel" },
        { id: "world-report",  icon: "📖", label: "Báo Cáo TG",    fn: "waRenderReportPanel" }
      ]
    }
  };

  window.hubActiveTab = window.hubActiveTab || {};

  // ─── RENDER HUB PANEL ────────────────────────────────────────────────────
  window.hubRenderPanel = function(hubId) {
    const cfg = HUB_CONFIGS[hubId];
    if (!cfg) return;
    const panel = document.getElementById("panel-" + hubId);
    if (!panel) return;

    if (!window.hubActiveTab[hubId]) window.hubActiveTab[hubId] = cfg.tabs[0].id;
    const activeTabId = window.hubActiveTab[hubId];

    const tabBar = cfg.tabs.map(function(t) {
      const isActive = t.id === activeTabId;
      return '<button onclick="sysHubSwitch(\'' + hubId + '\',\'' + t.id + '\')" ' +
        'style="padding:5px 8px;background:' + (isActive ? cfg.color + '22' : 'transparent') + ';' +
        'border:none;border-bottom:2px solid ' + (isActive ? cfg.color : 'transparent') + ';' +
        'color:' + (isActive ? cfg.color : '#64748b') + ';cursor:pointer;font-size:11px;' +
        'white-space:nowrap;transition:all 0.2s;font-family:\'Noto Serif SC\',serif">' +
        t.icon + ' ' + t.label + '</button>';
    }).join("");

    panel.innerHTML =
      '<div style="display:flex;flex-direction:column;height:100%;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">' +
        '<div style="background:#0a0f1a;padding:8px 12px 0;border-bottom:1px solid #1e293b;flex-shrink:0">' +
          '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">' +
            '<span style="font-size:14px;font-weight:bold;color:' + cfg.color + '">' + cfg.icon + ' ' + cfg.title + '</span>' +
          '</div>' +
          '<div style="display:flex;gap:0;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none">' + tabBar + '</div>' +
        '</div>' +
        '<div id="' + hubId + '-content" style="flex:1;overflow-y:auto;overflow-x:hidden"></div>' +
      '</div>';

    _hubLoadContent(hubId, activeTabId);
  };

  // ─── SWITCH TAB ──────────────────────────────────────────────────────────
  window.sysHubSwitch = function(hubId, tabId) {
    window.hubActiveTab[hubId] = tabId;
    window.hubRenderPanel(hubId);
  };

  // ─── LOAD CONTENT ────────────────────────────────────────────────────────
  function _hubLoadContent(hubId, tabId) {
    const cfg = HUB_CONFIGS[hubId];
    if (!cfg) return;
    const tabCfg = cfg.tabs.find(function(t) { return t.id === tabId; });
    if (!tabCfg) return;

    const area = document.getElementById(hubId + "-content");
    if (!area) return;

    area.innerHTML = '<div style="text-align:center;padding:20px;color:#334155;font-size:12px">⏳ Đang tải...</div>';

    try {
      var fn = window[tabCfg.fn];
      if (typeof fn === 'function') fn();
      if (typeof tabCfg.extra === 'function') tabCfg.extra();
    } catch(e) {
      console.warn('[HubEngine] Lỗi render', tabId, e);
    }

    var subPanel = document.getElementById("panel-" + tabId);
    if (subPanel && subPanel.innerHTML.trim().length > 10) {
      area.innerHTML = subPanel.innerHTML;
    } else {
      area.innerHTML =
        '<div style="text-align:center;padding:30px;color:#334155;font-size:12px">' +
          '<div style="font-size:24px;margin-bottom:8px">' + tabCfg.icon + '</div>' +
          '<div>' + tabCfg.label + '</div>' +
          '<div style="font-size:10px;color:#1e293b;margin-top:6px">Hệ thống đang khởi động hoặc chưa có dữ liệu</div>' +
        '</div>';
    }
  }

  console.log("[HubEngine V34] 🗂️ Gộp Tab — 10 hub · 49 sub-tab · Sidebar tối giản.");
})();
