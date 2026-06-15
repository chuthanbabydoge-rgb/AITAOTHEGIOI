(function() {
  "use strict";

  var _activeTab = "directory";
  var _jarvisInput = "";

  // ─── Helpers ─────────────────────────────────────────────────────────────
  function fmtNum(n) { return (n || 0).toLocaleString(); }
  function genreColor(g) {
    return { cultivation:"#f59e0b", fantasy:"#60a5fa", scifi:"#34d399", mythology:"#a855f7", zombie:"#ef4444", custom:"#94a3b8" }[g] || "#94a3b8";
  }
  function maturityBadge(tier) {
    var colors = { "Thần Thánh":"#f59e0b","Hùng Mạnh":"#a855f7","Trưởng Thành":"#60a5fa","Phát Triển":"#34d399","Phôi Thai":"#64748b" };
    var c = colors[tier] || "#64748b";
    return '<span style="background:' + c + '22;color:' + c + ';border-radius:10px;padding:2px 8px;font-size:10px;font-weight:700">' + tier + '</span>';
  }
  function rankMedal(i) { return ["🥇","🥈","🥉","4️⃣","5️⃣"][i] || (i+1)+""; }

  // ─── Tab renderers ────────────────────────────────────────────────────────
  function renderDirectory() {
    var universes = window.mvr124GetAll ? window.mvr124GetAll() : [];
    var observing = window.mvo124GetCurrentObserved ? window.mvo124GetCurrentObserved() : null;
    if (observing) {
      return window.mvo124RenderObservation ? window.mvo124RenderObservation(observing) : "";
    }
    var cards = universes.map(function(u) {
      var gc = genreColor(u.genre);
      var isPlayer = !!u.isPlayer;
      return '<div style="background:#0f172a;border:1px solid ' + gc + '33;border-radius:10px;padding:12px;margin-bottom:8px">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">' +
          '<div style="flex:1">' +
            '<div style="font-weight:700;font-size:13px;color:#e2e8f0;margin-bottom:3px">' +
              (isPlayer ? '⭐ ' : '') + u.universeName +
            '</div>' +
            '<div style="color:#64748b;font-size:11px;margin-bottom:5px">' + u.creatorName + '</div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">' +
              maturityBadge(u.maturityTier) +
              '<span style="color:#64748b;font-size:11px">👥 ' + fmtNum(u.population) + '</span>' +
              '<span style="color:#64748b;font-size:11px">⏰ ' + (u.age || 0) + ' năm</span>' +
              '<span style="color:#64748b;font-size:11px">🏛️ ' + (u.civilizationCount || 0) + ' civ</span>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0">' +
            (!isPlayer
              ? '<button onclick="window.mvo124ObserveUniverse(\'' + u.universeId + '\');window.mvp124HubRender(\'directory\')" style="background:#1e3a5f;color:#93c5fd;border:none;border-radius:6px;padding:5px 10px;cursor:pointer;font-size:11px;white-space:nowrap">👁️ Quan Sát</button>'
              : '<span style="color:#34d399;font-size:11px;text-align:center">✅ Của Bạn</span>') +
            '<button onclick="window.mvp124HubRender(\'portals\',\'' + u.universeId + '\')" style="background:#1a0533;color:#a855f7;border:none;border-radius:6px;padding:5px 10px;cursor:pointer;font-size:11px;white-space:nowrap">🌀 Portal</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join("");

    var stats = [
      { label:"Tổng Universe", value: universes.length, icon:"🌌", color:"#a855f7" },
      { label:"Đang Quan Sát", value: window.mvObserverV124 && window.mvObserverV124.currentObserving ? 1 : 0, icon:"👁️", color:"#60a5fa" },
      { label:"Public", value: universes.filter(function(u) { return u.isPublic; }).length, icon:"🌐", color:"#34d399" },
      { label:"Portals Mở", value: window.mpe124GetOpenPortals ? window.mpe124GetOpenPortals().length : 0, icon:"🌀", color:"#f59e0b" }
    ];

    return '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px">' +
      stats.map(function(s) {
        return '<div style="background:#1e293b;border-radius:8px;padding:10px;text-align:center">' +
          '<div style="font-size:18px">' + s.icon + '</div>' +
          '<div style="font-size:16px;font-weight:800;color:' + s.color + '">' + s.value + '</div>' +
          '<div style="font-size:10px;color:#64748b">' + s.label + '</div>' +
        '</div>';
      }).join("") +
    '</div>' +
    '<div style="color:#e2e8f0;font-weight:700;margin-bottom:10px">🌌 Danh Sách Universe</div>' +
    cards;
  }

  function renderPortals(preSelectUniverse) {
    var portals = window.mpe124GetPortals ? window.mpe124GetPortals() : [];
    var universes = window.mvr124GetAll ? window.mvr124GetAll() : [];
    var eventLog = window.mpe124GetEventLog ? window.mpe124GetEventLog() : [];

    var unOptions = universes.filter(function(u) { return !u.isPlayer; }).map(function(u) {
      return '<option value="' + u.universeId + '"' + (preSelectUniverse === u.universeId ? " selected" : "") + '>' + u.universeName + '</option>';
    }).join("");

    var ptOptions = (window.MPE124_PORTAL_TYPES || []).map(function(t) {
      return '<option value="' + t.id + '">' + t.icon + " " + t.label + " — " + t.desc + '</option>';
    }).join("");

    var mvEventBtns = (window.MPE124_MV_EVENTS || []).map(function(e) {
      return '<button onclick="window._mvp124FireEvent(\'' + e.id + '\')" style="background:' + e.color + '22;color:' + e.color + ';border:1px solid ' + e.color + '44;border-radius:8px;padding:8px 12px;cursor:pointer;font-size:12px;font-weight:600">' + e.icon + ' ' + e.name + '</button>';
    }).join("");

    var portalCards = portals.length ? portals.map(function(p) {
      var statusColor = p.status === "open" ? "#34d399" : "#64748b";
      return '<div style="background:#0f172a;border:1px solid ' + statusColor + '44;border-radius:10px;padding:12px;margin-bottom:8px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
          '<div>' +
            '<div style="font-weight:700;color:#e2e8f0">' + p.nameA + ' ↔ ' + p.nameB + '</div>' +
            '<div style="color:#64748b;font-size:11px;margin-top:2px">Loại: ' + p.type + ' · ' + p.visits + ' lần thăm · Ổn định: ' + p.stability + '%</div>' +
            (p.lastEvent ? '<div style="color:#f59e0b;font-size:11px">Sự kiện cuối: ' + p.lastEvent + '</div>' : '') +
          '</div>' +
          '<div style="display:flex;gap:4px">' +
            (p.status === "open"
              ? '<button onclick="window.mpe124ClosePortal(\'' + p.portalId + '\');window.mvp124HubRender(\'portals\')" style="background:#4b1d1d;color:#fca5a5;border:none;border-radius:6px;padding:5px 10px;cursor:pointer;font-size:11px">Đóng</button>'
              : '<span style="color:#64748b;font-size:11px;padding:5px">Đã đóng</span>') +
          '</div>' +
        '</div>' +
      '</div>';
    }).join("") : '<div style="color:#64748b;text-align:center;padding:20px">Chưa có portal nào. Hãy mở portal đến universe khác!</div>';

    var logHtml = eventLog.slice(0, 5).map(function(l) {
      return '<div style="background:#1e293b;border-left:3px solid ' + (l.color || "#64748b") + ';border-radius:6px;padding:8px 10px;margin-bottom:6px">' +
        '<div style="display:flex;justify-content:space-between">' +
          '<span style="font-size:12px;font-weight:600;color:#e2e8f0">' + l.eventIcon + ' ' + l.eventName + '</span>' +
          '<span style="font-size:10px;color:#64748b">Năm ' + l.year + '</span>' +
        '</div>' +
        '<div style="font-size:11px;color:#94a3b8;margin-top:3px">' + l.description + '</div>' +
      '</div>';
    }).join("");

    return '<div style="background:#1e293b;border-radius:10px;padding:14px;margin-bottom:14px">' +
      '<div style="color:#a855f7;font-weight:700;margin-bottom:10px">🌀 Mở Portal Mới</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">' +
        '<select id="mv124-uni-select" style="background:#0f172a;color:#e2e8f0;border:1px solid #374151;border-radius:6px;padding:6px;width:100%">' + unOptions + '</select>' +
        '<select id="mv124-type-select" style="background:#0f172a;color:#e2e8f0;border:1px solid #374151;border-radius:6px;padding:6px;width:100%">' + ptOptions + '</select>' +
      '</div>' +
      '<button onclick="var u=document.getElementById(\'mv124-uni-select\').value;var t=document.getElementById(\'mv124-type-select\').value;window.mpe124OpenPlayerPortal(u,t);window.mvp124HubRender(\'portals\')" style="width:100%;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border:none;border-radius:8px;padding:10px;cursor:pointer;font-weight:700">🌀 Mở Portal</button>' +
    '</div>' +

    '<div style="background:#1e293b;border-radius:10px;padding:14px;margin-bottom:14px">' +
      '<div style="color:#f59e0b;font-weight:700;margin-bottom:10px">⚡ Kích Hoạt Sự Kiện Liên Vũ Trụ</div>' +
      '<div style="color:#64748b;font-size:11px;margin-bottom:8px">Chọn portal đang mở của bạn để kích hoạt sự kiện:</div>' +
      '<select id="mv124-portal-select" style="background:#0f172a;color:#e2e8f0;border:1px solid #374151;border-radius:6px;padding:6px;width:100%;margin-bottom:8px">' +
        portals.filter(function(p) { return p.status === "open"; }).map(function(p) {
          return '<option value="' + p.portalId + '">' + p.nameA + ' ↔ ' + p.nameB + '</option>';
        }).join("") +
      '</select>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px">' + mvEventBtns + '</div>' +
    '</div>' +

    '<div style="color:#e2e8f0;font-weight:700;margin-bottom:8px">🔗 Danh Sách Portals (' + portals.length + ')</div>' +
    portalCards +
    (logHtml ? '<div style="color:#94a3b8;font-weight:700;margin-top:12px;margin-bottom:8px">📜 Nhật Ký Sự Kiện</div>' + logHtml : '');
  }

  function renderRankings() {
    window.mvrank124Build && window.mvrank124Build();
    var categories = [
      { id:"oldest",        icon:"⏰", label:"Oldest Universe",         color:"#f59e0b", desc:"Tuổi đời lâu nhất" },
      { id:"largestPop",    icon:"👥", label:"Largest Population",      color:"#60a5fa", desc:"Dân số đông nhất" },
      { id:"mostAdvanced",  icon:"🏛️", label:"Most Advanced Civ",       color:"#a855f7", desc:"Văn minh phát triển nhất" },
      { id:"mostInfluential",icon:"👑", label:"Most Influential Creator",color:"#34d399", desc:"Creator ảnh hưởng nhất" }
    ];
    return categories.map(function(cat) {
      var items = window.mvrank124GetTop ? window.mvrank124GetTop(cat.id) : [];
      return '<div style="background:#0f172a;border:1px solid ' + cat.color + '33;border-radius:10px;padding:14px;margin-bottom:12px">' +
        '<div style="color:' + cat.color + ';font-weight:700;font-size:14px;margin-bottom:4px">' + cat.icon + ' ' + cat.label + '</div>' +
        '<div style="color:#64748b;font-size:11px;margin-bottom:10px">' + cat.desc + '</div>' +
        (items.length ? items.map(function(item, i) {
          return '<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid #1e293b">' +
            '<span style="font-size:16px;width:24px;text-align:center">' + rankMedal(i) + '</span>' +
            '<div style="flex:1">' +
              '<div style="font-size:12px;font-weight:600;color:' + (item.isPlayer ? cat.color : "#e2e8f0") + '">' + (item.name || item.creatorName || "") + (item.isPlayer ? ' ⭐' : '') + '</div>' +
              (item.creator ? '<div style="font-size:10px;color:#64748b">' + item.creator + '</div>' : '') +
            '</div>' +
            '<span style="color:' + cat.color + ';font-size:12px;font-weight:700;white-space:nowrap">' + item.value + '</span>' +
          '</div>';
        }).join("") : '<div style="color:#64748b;font-size:12px">Đang tải...</div>') +
      '</div>';
    }).join("");
  }

  function renderCreators() {
    var profiles = window.mvrank124GetAllCreators ? window.mvrank124GetAllCreators() : [];
    if (!profiles.length) { window.mvrank124Build && window.mvrank124Build(); profiles = window.mvrank124GetAllCreators ? window.mvrank124GetAllCreators() : []; }
    var repColors = { "c_player":"#f59e0b" };
    return '<div style="color:#e2e8f0;font-weight:700;margin-bottom:12px">👑 Creator Profiles</div>' +
      profiles.map(function(c, i) {
        var isPlayer = c.creatorId === "c_player";
        var inflScore = c.universeCount * 500 + c.totalCiv * 100 + Math.floor(c.totalPop / 10000);
        return '<div style="background:#0f172a;border:1px solid ' + (isPlayer ? "#f59e0b44" : "#1e293b") + ';border-radius:10px;padding:14px;margin-bottom:8px">' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">' +
            '<div>' +
              '<div style="font-weight:800;font-size:14px;color:' + (isPlayer ? "#f59e0b" : "#e2e8f0") + '">' + (isPlayer ? "⭐ " : "") + c.creatorName + '</div>' +
              '<div style="color:#64748b;font-size:11px">Influence Score: ' + inflScore + '</div>' +
            '</div>' +
            '<span style="background:#7c3aed22;color:#a855f7;border-radius:10px;padding:2px 10px;font-size:11px">#' + (i+1) + '</span>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">' +
            creatorStat("🌌 Universes", c.universeCount, "#a855f7") +
            creatorStat("👥 Tổng Dân", fmtNum(c.totalPop), "#60a5fa") +
            creatorStat("🏛️ Tổng Civ", c.totalCiv, "#34d399") +
            creatorStat("⏰ Tuổi Lớn Nhất", c.oldestAge + " năm", "#f59e0b") +
          '</div>' +
        '</div>';
      }).join("");
  }

  function creatorStat(label, value, color) {
    return '<div style="background:#1e293b;border-radius:8px;padding:7px;text-align:center">' +
      '<div style="font-size:11px;font-weight:700;color:' + color + '">' + value + '</div>' +
      '<div style="font-size:9px;color:#64748b;margin-top:2px">' + label + '</div>' +
    '</div>';
  }

  function renderUniverseProfiles() {
    var universes = window.mvr124GetAll ? window.mvr124GetAll() : [];
    var selected = window._mv124SelectedUniverse || (universes[0] && universes[0].universeId);
    var u = universes.find(function(x) { return x.universeId === selected; });

    var listHtml = universes.map(function(x) {
      var gc = genreColor(x.genre);
      var active = x.universeId === selected;
      return '<div onclick="window._mv124SelectedUniverse=\'' + x.universeId + '\';window.mvp124HubRender(\'profiles\')" ' +
        'style="padding:8px 10px;border-radius:6px;cursor:pointer;margin-bottom:4px;background:' + (active ? gc + "22" : "#1e293b") + ';border:1px solid ' + (active ? gc + "66" : "transparent") + '">' +
        '<div style="font-size:12px;font-weight:600;color:' + (active ? gc : "#e2e8f0") + '">' + (x.isPlayer ? "⭐ " : "") + x.universeName + '</div>' +
        '<div style="font-size:10px;color:#64748b">' + x.creatorName + ' · ' + (x.age || 0) + ' năm</div>' +
      '</div>';
    }).join("");

    var detailHtml = u ? (function() {
      var gc = genreColor(u.genre);
      var portals = (window.mpe124GetPortals ? window.mpe124GetPortals() : []).filter(function(p) {
        return p.universeAId === u.universeId || p.universeBId === u.universeId;
      });
      var pkg = null;
      return '<div>' +
        '<div style="font-size:16px;font-weight:800;color:' + gc + ';margin-bottom:4px">' + u.universeName + '</div>' +
        '<div style="color:#64748b;font-size:11px;margin-bottom:12px">Creator: ' + u.creatorName + ' · Seed: ' + (u.worldSeed || "N/A") + '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px">' +
          creatorStat("👥 Dân Số", fmtNum(u.population), gc) +
          creatorStat("⏰ Tuổi", (u.age || 0) + " năm", "#60a5fa") +
          creatorStat("🏛️ Văn Minh", u.civilizationCount || 0, "#a855f7") +
          creatorStat("🌱 Giai Đoạn", u.maturityTier, "#34d399") +
          creatorStat("🎭 Thể Loại", u.genre, gc) +
          creatorStat("🌀 Portals", portals.length, "#f59e0b") +
        '</div>' +
        '<div style="background:#1e293b;border-radius:8px;padding:10px;margin-bottom:10px;color:#94a3b8;font-size:12px;line-height:1.6">' + (u.description || "Không có mô tả.") + '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">' +
          (u.tags || []).map(function(t) { return '<span style="background:' + gc + '22;color:' + gc + ';border-radius:12px;padding:2px 10px;font-size:11px">' + t + '</span>'; }).join("") +
        '</div>' +
        (u.isPlayer
          ? '<button onclick="var pkg=window.mvo124ExportUniverse(\'u_player\');alert(\'Đã xuất Universe Package: \'+pkg.packageId)" style="background:#064e3b;color:#34d399;border:none;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:12px;font-weight:600">📦 Xuất Universe Package</button>'
          : '<div style="display:flex;gap:8px">' +
              '<button onclick="window.mvo124ObserveUniverse(\'' + u.universeId + '\');window.mvp124HubRender(\'directory\')" style="background:#1e3a5f;color:#93c5fd;border:none;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:12px">👁️ Quan Sát</button>' +
              '<button onclick="window.mpe124OpenPlayerPortal(\'' + u.universeId + '\',\'observation\');window.mvp124HubRender(\'portals\')" style="background:#1a0533;color:#a855f7;border:none;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:12px">🌀 Mở Portal</button>' +
            '</div>') +
      '</div>';
    })() : '<div style="color:#64748b;text-align:center;padding:20px">Chọn universe từ danh sách.</div>';

    return '<div style="display:grid;grid-template-columns:280px 1fr;gap:12px">' +
      '<div style="overflow-y:auto;max-height:500px">' + listHtml + '</div>' +
      '<div style="background:#0f172a;border-radius:10px;padding:14px">' + detailHtml + '</div>' +
    '</div>';
  }

  function renderJarvis() {
    var answer = window._mv124JarvisAnswer || "";
    return '<div style="background:#0f172a;border-radius:10px;padding:16px">' +
      '<div style="color:#a855f7;font-weight:700;font-size:14px;margin-bottom:4px">🤖 Jarvis — Multiverse Mode</div>' +
      '<div style="color:#64748b;font-size:11px;margin-bottom:14px">Hỏi về bất kỳ thông tin nào trong Multiverse</div>' +
      '<div style="display:flex;gap:8px;margin-bottom:12px">' +
        '<input id="mv124-jarvis-input" type="text" placeholder="VD: Universe nào lớn nhất? Creator nào ảnh hưởng nhất?" value="' + _jarvisInput + '" ' +
          'style="flex:1;background:#1e293b;color:#e2e8f0;border:1px solid #374151;border-radius:8px;padding:8px 12px;font-size:12px;outline:none" ' +
          'onkeydown="if(event.key===\'Enter\'){window._mv124JarvisAsk();}" />' +
        '<button onclick="window._mv124JarvisAsk()" style="background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border:none;border-radius:8px;padding:8px 16px;cursor:pointer;font-weight:700">Hỏi</button>' +
      '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">' +
        ['Universe lớn nhất?', 'Universe cổ nhất?', 'Văn minh phát triển nhất?', 'Creator ảnh hưởng nhất?', 'Tổng số portals?'].map(function(q) {
          return '<button onclick="document.getElementById(\'mv124-jarvis-input\').value=\'' + q + '\';window._mv124JarvisAsk()" ' +
            'style="background:#1e293b;color:#94a3b8;border:none;border-radius:20px;padding:5px 10px;cursor:pointer;font-size:11px">' + q + '</button>';
        }).join("") +
      '</div>' +
      (answer ? '<div style="background:#1a0533;border:1px solid #7c3aed44;border-radius:8px;padding:12px;color:#e2e8f0;font-size:13px;line-height:1.6">' + answer.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#a855f7">$1</strong>') + '</div>' : '') +
    '</div>';
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  window.mvp124HubRender = function(tab, extra) {
    if (tab) _activeTab = tab;
    var panel = document.getElementById("panel-multiverse-hub-v35");
    if (!panel || panel.style.display === "none") return;

    var tabs = [
      { id:"directory", icon:"🌌", label:"Directory" },
      { id:"portals",   icon:"🌀", label:"Portals" },
      { id:"rankings",  icon:"📊", label:"Rankings" },
      { id:"creators",  icon:"👑", label:"Creators" },
      { id:"profiles",  icon:"🪐", label:"Universe Profiles" },
      { id:"jarvis",    icon:"🤖", label:"Jarvis" }
    ];

    var tabHtml = tabs.map(function(t) {
      var active = t.id === _activeTab;
      return '<button onclick="window.mvp124HubRender(\'' + t.id + '\')" style="padding:6px 12px;border:none;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;background:' +
        (active ? "#7c3aed" : "#1e293b") + ';color:' + (active ? "#fff" : "#94a3b8") + '">' + t.icon + ' ' + t.label + '</button>';
    }).join(" ");

    var content = "";
    if (_activeTab === "directory") content = renderDirectory();
    else if (_activeTab === "portals") content = renderPortals(extra);
    else if (_activeTab === "rankings") content = renderRankings();
    else if (_activeTab === "creators") content = renderCreators();
    else if (_activeTab === "profiles") content = renderUniverseProfiles();
    else if (_activeTab === "jarvis") content = renderJarvis();

    var mv124Section = document.getElementById("mv124-section");
    if (!mv124Section) {
      mv124Section = document.createElement("div");
      mv124Section.id = "mv124-section";
      panel.innerHTML = "";
      panel.appendChild(mv124Section);
    }

    mv124Section.innerHTML =
      '<div style="padding:16px;font-family:\'Segoe UI\',sans-serif;color:#e2e8f0;max-height:calc(100vh - 80px);overflow-y:auto">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">' +
          '<div>' +
            '<div style="font-size:20px;font-weight:800;color:#a855f7">🌌 Multiverse Portal V124</div>' +
            '<div style="color:#64748b;font-size:11px">Đa Vũ Trụ · ' + (window.mvr124GetAll ? window.mvr124GetAll().length : 0) + ' universes · ' + (window.mpe124GetTotalConnections ? window.mpe124GetTotalConnections() : 0) + ' portals</div>' +
          '</div>' +
          '<button onclick="window.mvr124SyncPlayer && window.mvr124SyncPlayer();window.mvrank124Build && window.mvrank124Build();window.mvp124HubRender()" style="background:#1e293b;color:#60a5fa;border:none;border-radius:6px;padding:6px 12px;cursor:pointer;font-size:11px">🔄 Sync</button>' +
        '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">' + tabHtml + '</div>' +
        '<div>' + content + '</div>' +
      '</div>';
  };

  // Helper hàm global cho UI
  window._mv124JarvisAsk = function() {
    var inp = document.getElementById("mv124-jarvis-input");
    if (!inp) return;
    _jarvisInput = inp.value;
    window._mv124JarvisAnswer = window.mvrank124JarvisQuery ? window.mvrank124JarvisQuery(_jarvisInput) : "Đang tải Jarvis...";
    window.mvp124HubRender("jarvis");
  };

  window._mvp124FireEvent = function(eventId) {
    var sel = document.getElementById("mv124-portal-select");
    if (!sel || !sel.value) { alert("Chọn portal trước!"); return; }
    window.mpe124TriggerEvent(sel.value, eventId);
    window.mvp124HubRender("portals");
  };

  // ─── Patch multiverse-hub-v35 showPanel ───────────────────────────────────
  function patchShowPanel() {
    var _origShow = window.showPanel;
    window.showPanel = function(panelId) {
      if (_origShow) _origShow(panelId);
      if (panelId === "multiverse-hub-v35") {
        setTimeout(function() { window.mvp124HubRender(_activeTab); }, 50);
      }
    };
    // Also patch the nav button if it exists
    var btn = document.querySelector('[data-panel="multiverse-hub-v35"]');
    if (btn) {
      var _origClick = btn.onclick;
      btn.onclick = function() {
        if (_origClick) _origClick();
        setTimeout(function() { window.mvp124HubRender(_activeTab); }, 50);
      };
    }
  }

  function init() {
    patchShowPanel();
    // If panel is already visible, render immediately
    var panel = document.getElementById("panel-multiverse-hub-v35");
    if (panel && panel.style.display !== "none") {
      window.mvp124HubRender("directory");
    }
    console.log("[MultiversePortalHub V124] 🌀 Hub UI khởi động — 6 tabs: Directory·Portals·Rankings·Creators·Profiles·Jarvis · patch multiverse-hub-v35 sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 30500); });
  } else {
    setTimeout(init, 30500);
  }
})();
