(function () {
  "use strict";

  var TABS = [
    { id: "avatar71",    label: "👁️ Avatar",          render: renderAvatarTab },
    { id: "presence71",  label: "✨ Hiện Diện",        render: renderPresenceTab },
    { id: "manifest71",  label: "🌟 Hiện Thân",        render: renderManifestationTab },
    { id: "followers71", label: "🙏 Môn Đồ",           render: renderFollowersTab },
    { id: "legacy71",    label: "📜 Di Sản Thần Linh", render: renderLegacyTab },
  ];

  var _activeTab = "avatar71";

  function switchTab(tid) {
    _activeTab = tid;
    TABS.forEach(function (t) {
      var btn = document.getElementById("avg71tab_" + t.id);
      var pnl = document.getElementById("avg71pnl_" + t.id);
      if (btn) btn.style.borderBottom = t.id === tid ? "2px solid #c084fc" : "2px solid transparent";
      if (pnl) pnl.style.display = t.id === tid ? "block" : "none";
    });
    var activeTab = TABS.find(function (t) { return t.id === tid; });
    if (activeTab) {
      var pnlEl = document.getElementById("avg71pnl_" + tid);
      if (pnlEl && activeTab.render) activeTab.render(pnlEl);
    }
  }

  function renderSection() {
    var data = window.avatarGodV71Data;
    if (!data) return "<p style='color:#94a3b8;padding:12px'>Đang tải Avatar of God System...</p>";

    var html = '<div id="avg71-section-wrapper" style="padding:12px;font-family:sans-serif;color:#e2e8f0">';
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">';
    html += '<span style="font-size:22px">👁️</span>';
    html += '<div><div style="font-size:15px;font-weight:700;color:#c084fc">AVATAR OF GOD — V71</div>';
    html += '<div style="font-size:11px;color:#94a3b8">Thần Sáng Thế Bước Vào Thế Giới</div></div>';
    html += '<div style="margin-left:auto;font-size:11px;padding:4px 8px;background:#1e1b4b;border-radius:6px;color:#c084fc">⚡ ' + (data.divineEnergy || 0) + '/' + (data.maxDivineEnergy || 1000) + ' Thần Năng</div>';
    html += '</div>';

    html += '<div style="display:flex;gap:4px;margin-bottom:12px;border-bottom:1px solid #374151;padding-bottom:8px;flex-wrap:wrap">';
    TABS.forEach(function (t) {
      html += '<button id="avg71tab_' + t.id + '" onclick="window._avg71Switch(\'' + t.id + '\')" style="padding:5px 10px;border:none;border-bottom:2px solid ' + (t.id === _activeTab ? "#c084fc" : "transparent") + ';background:transparent;color:' + (t.id === _activeTab ? "#c084fc" : "#94a3b8") + ';cursor:pointer;font-size:11px;white-space:nowrap">' + t.label + '</button>';
    });
    html += '</div>';

    TABS.forEach(function (t) {
      html += '<div id="avg71pnl_' + t.id + '" style="display:' + (t.id === _activeTab ? "block" : "none") + '">';
      if (t.id === _activeTab && t.render) html += t.render();
      html += '</div>';
    });

    html += '</div>';
    return html;
  }

  function renderAvatarTab() {
    var data = window.avatarGodV71Data;
    if (!data) return "<p style='color:#94a3b8'>Chưa tải.</p>";
    var forms = window.avg71GetForms ? window.avg71GetForms() : [];
    var currentForm = window.avg71GetForm ? window.avg71GetForm() : forms[0];

    var html = '<div style="display:grid;gap:10px">';
    html += '<div style="background:#1e1b4b;padding:10px;border-radius:8px;border:1px solid #312e81">';
    html += '<div style="font-size:12px;color:#a5b4fc;margin-bottom:8px">⚙️ TÊN & DANH HIỆU</div>';
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
    html += '<input id="avg71GodNameInput" type="text" placeholder="Tên Thần (vd: Ra, Zeus, Brahma...)" value="' + (data.godName || "") + '" style="flex:1;min-width:120px;padding:5px 8px;background:#0f172a;color:#e2e8f0;border:1px solid #374151;border-radius:5px;font-size:12px">';
    html += '<input id="avg71GodTitleInput" type="text" placeholder="Danh hiệu" value="' + (data.godTitle || "") + '" style="flex:1;min-width:120px;padding:5px 8px;background:#0f172a;color:#e2e8f0;border:1px solid #374151;border-radius:5px;font-size:12px">';
    html += '<button onclick="window._avg71SaveName()" style="padding:5px 12px;background:#7c3aed;color:#fff;border:none;border-radius:5px;cursor:pointer;font-size:11px">💾 Lưu</button>';
    html += '</div></div>';

    html += '<div style="font-size:12px;color:#a5b4fc;margin-bottom:6px">🎭 CHỌN HÌNH THỨC</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px">';
    forms.forEach(function (form) {
      var active = form.id === data.selectedForm;
      html += '<div onclick="window._avg71SelectForm(\'' + form.id + '\')" style="padding:10px;background:' + (active ? "#312e81" : "#1e1b4b") + ';border:2px solid ' + (active ? form.aura : "#374151") + ';border-radius:8px;cursor:pointer;text-align:center;transition:all .2s">';
      html += '<div style="font-size:24px">' + form.icon + '</div>';
      html += '<div style="font-size:11px;font-weight:600;color:' + (active ? form.aura : "#e2e8f0") + ';margin-top:4px">' + form.name + '</div>';
      html += '<div style="font-size:10px;color:#64748b;margin-top:2px">Sức mạnh: ' + form.power + '%</div>';
      if (active) html += '<div style="font-size:10px;color:' + form.aura + ';margin-top:4px">✓ Đang Chọn</div>';
      html += '</div>';
    });
    html += '</div>';

    if (data.selectedForm === "custom") {
      html += '<div style="background:#1e1b4b;padding:10px;border-radius:8px;border:1px solid #312e81;margin-top:4px">';
      html += '<div style="font-size:12px;color:#a5b4fc;margin-bottom:6px">⚡ TÙY CHỈNH HÌNH THỨC</div>';
      html += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
      html += '<input id="avg71CustomName" type="text" placeholder="Tên hình thức..." value="' + (data.customFormName || "") + '" style="flex:1;min-width:100px;padding:5px 8px;background:#0f172a;color:#e2e8f0;border:1px solid #374151;border-radius:5px;font-size:12px">';
      html += '<input id="avg71CustomIcon" type="text" placeholder="Icon (emoji)" value="' + (data.customFormIcon || "⚡") + '" style="width:60px;padding:5px 8px;background:#0f172a;color:#e2e8f0;border:1px solid #374151;border-radius:5px;font-size:12px;text-align:center">';
      html += '<button onclick="window._avg71SaveCustom()" style="padding:5px 12px;background:#7c3aed;color:#fff;border:none;border-radius:5px;cursor:pointer;font-size:11px">✅ Áp Dụng</button>';
      html += '</div></div>';
    }

    var jarvis = window.avg71GetJarvisComment ? window.avg71GetJarvisComment() : "";
    if (jarvis) {
      html += '<div style="background:#0c0a1e;border:1px solid #312e81;border-radius:8px;padding:10px;margin-top:4px">';
      html += '<div style="font-size:10px;color:#7c3aed;margin-bottom:4px">🤖 JARVIS</div>';
      html += '<div style="font-size:12px;color:#c4b5fd;font-style:italic">' + jarvis + '</div>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderPresenceTab() {
    var dpData = window.divinePresenceV71Data;
    var avData = window.avatarGodV71Data;
    if (!dpData) return "<p style='color:#94a3b8'>Chưa tải Divine Presence System.</p>";

    var countries = window.countries || [];
    var locationOptions = countries.slice(0, 15).map(function (c) { return '<option value="' + c.name + '">' + c.name + '</option>'; }).join("") || '<option value="Vùng Trung Tâm">Vùng Trung Tâm</option>';

    var html = '<div style="display:grid;gap:10px">';
    var presStates = window.avg71GetPresenceStates ? window.avg71GetPresenceStates() : [];
    var curState = window.avg71GetPresenceState ? window.avg71GetPresenceState() : { name: "Vắng Mặt", icon: "👁️" };

    html += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
    presStates.forEach(function (st) {
      var active = avData && avData.presenceState === st.id;
      html += '<button onclick="window._avg71SetState(\'' + st.id + '\')" style="flex:1;min-width:100px;padding:8px;background:' + (active ? "#312e81" : "#1e1b4b") + ';border:1px solid ' + (active ? "#c084fc" : "#374151") + ';color:' + (active ? "#c084fc" : "#94a3b8") + ';border-radius:6px;cursor:pointer;font-size:11px;text-align:center">' + st.icon + '<br>' + st.name + '</button>';
    });
    html += '</div>';

    html += '<div style="background:#1e1b4b;padding:10px;border-radius:8px;border:1px solid #312e81">';
    html += '<div style="font-size:12px;color:#a5b4fc;margin-bottom:8px">⚡ HIỆN THÂN TRONG THẾ GIỚI</div>';
    html += '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">';
    html += '<select id="avg71LocationSelect" style="flex:1;padding:5px 8px;background:#0f172a;color:#e2e8f0;border:1px solid #374151;border-radius:5px;font-size:12px">' + locationOptions + '</select>';
    html += '<button onclick="window._avg71EnterPresence()" style="padding:6px 14px;background:#7c3aed;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px">🌟 Bước Vào Thế Giới</button>';
    html += '<button onclick="window._avg71ExitPresence()" style="padding:6px 14px;background:#374151;color:#e2e8f0;border:none;border-radius:6px;cursor:pointer;font-size:12px">🚪 Rút Lui</button>';
    html += '</div></div>';

    var summary = window.dps71GetSummary ? window.dps71GetSummary() : {};
    html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">';
    var stats = [
      { label: "Tổng Phản Ứng", val: summary.totalReactions || 0, icon: "🔄" },
      { label: "Môn Đồ", val: summary.totalFollowers || 0, icon: "🙏" },
      { label: "Giáo Phái", val: summary.totalCults || 0, icon: "⛪" },
      { label: "Tác Động Tôn Giáo", val: (summary.religiousImpact || 0) + "%", icon: "✨" },
    ];
    stats.forEach(function (s) {
      html += '<div style="background:#1e1b4b;padding:8px;border-radius:6px;text-align:center"><div style="font-size:16px">' + s.icon + '</div><div style="font-size:18px;font-weight:700;color:#c084fc">' + s.val + '</div><div style="font-size:10px;color:#64748b">' + s.label + '</div></div>';
    });
    html += '</div>';

    html += '<div style="background:#1e1b4b;padding:10px;border-radius:8px;border:1px solid #312e81">';
    html += '<div style="font-size:12px;color:#a5b4fc;margin-bottom:8px">🔄 TIẾN HÓA TÔN GIÁO</div>';
    var evols = window.dps71GetReligionEvolutions ? window.dps71GetReligionEvolutions() : [];
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:6px">';
    evols.forEach(function (ev) {
      html += '<button onclick="window._avg71TriggerReligion(\'' + ev.id + '\')" style="padding:6px;background:#0f172a;border:1px solid #374151;color:#c084fc;border-radius:6px;cursor:pointer;font-size:10px;text-align:left"><div>' + ev.icon + ' ' + ev.name + '</div></button>';
    });
    html += '</div></div>';

    var rlog = window.dps71GetReactionLog ? window.dps71GetReactionLog() : [];
    if (rlog.length > 0) {
      html += '<div style="background:#0f172a;padding:10px;border-radius:8px;max-height:150px;overflow-y:auto">';
      html += '<div style="font-size:11px;color:#64748b;margin-bottom:6px">📋 LỊCH SỬ PHẢN ỨNG</div>';
      rlog.slice().reverse().forEach(function (entry) {
        var r = entry.reactions || {};
        html += '<div style="font-size:10px;color:#94a3b8;padding:4px 0;border-bottom:1px solid #1e293b">⚡ Năm ' + entry.year + ' — ' + entry.location + ' → 🙏' + (r.venerate || 0) + ' 😱' + (r.fear || 0) + ' ⭐' + (r.worship || 0) + ' ⚔️' + (r.rebel || 0) + '</div>';
      });
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderManifestationTab() {
    var mData = window.manifestationV71Data;
    var avData = window.avatarGodV71Data;
    if (!mData) return "<p style='color:#94a3b8'>Chưa tải Creator Manifestation System.</p>";

    var types = window.mfst71GetTypes ? window.mfst71GetTypes() : [];
    var energy = avData ? avData.divineEnergy : 0;

    var html = '<div style="display:grid;gap:10px">';
    html += '<div style="font-size:11px;color:#64748b;padding:4px 8px;background:#1e1b4b;border-radius:5px;display:inline-block">⚡ Thần Năng Hiện Có: <strong style="color:#c084fc">' + energy + '</strong></div>';

    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px">';
    types.forEach(function (t) {
      var canAfford = energy >= t.cost;
      html += '<div style="background:#1e1b4b;padding:10px;border-radius:8px;border:1px solid #374151">';
      html += '<div style="font-size:20px;text-align:center">' + t.icon + '</div>';
      html += '<div style="font-size:11px;font-weight:600;color:#e2e8f0;text-align:center;margin:4px 0">' + t.name + '</div>';
      html += '<div style="font-size:10px;color:#64748b;text-align:center;margin-bottom:6px">' + t.desc + '</div>';
      html += '<div style="text-align:center;font-size:10px;color:' + (canAfford ? "#a5b4fc" : "#ef4444") + ';margin-bottom:6px">⚡ ' + t.cost + ' Thần Năng</div>';
      html += '<button onclick="window._avg71Manifest(\'' + t.id + '\')" ' + (canAfford ? '' : 'disabled') + ' style="width:100%;padding:5px;background:' + (canAfford ? "#7c3aed" : "#374151") + ';color:#fff;border:none;border-radius:5px;cursor:' + (canAfford ? "pointer" : "not-allowed") + ';font-size:11px">Thực Hiện</button>';
      html += '</div>';
    });
    html += '</div>';

    if (mData.lastManifestation) {
      html += '<div style="background:#0c0a1e;border:1px solid #7c3aed;border-radius:8px;padding:10px">';
      html += '<div style="font-size:11px;color:#a5b4fc;margin-bottom:6px">⚡ KẾT QUẢ HIỆN THÂN CUỐI</div>';
      html += '<div style="font-size:12px;color:#c4b5fd">' + mData.lastManifestation.result + '</div>';
      html += '<div style="font-size:10px;color:#64748b;margin-top:4px">Năm ' + mData.lastManifestation.year + ' — ' + mData.lastManifestation.location + '</div>';
      html += '</div>';
    }

    var log = window.mfst71GetLog ? window.mfst71GetLog() : [];
    if (log.length > 0) {
      html += '<div style="background:#0f172a;padding:10px;border-radius:8px;max-height:140px;overflow-y:auto">';
      html += '<div style="font-size:11px;color:#64748b;margin-bottom:6px">📋 LỊCH SỬ HIỆN THÂN</div>';
      log.slice().reverse().slice(0, 8).forEach(function (e) {
        html += '<div style="font-size:10px;color:#94a3b8;padding:3px 0;border-bottom:1px solid #1e293b">' + e.icon + ' Năm ' + e.year + ' — ' + e.name + ' tại ' + e.location + '</div>';
      });
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderFollowersTab() {
    var dpData = window.divinePresenceV71Data;
    var daData = window.divineAppearanceV71Data;
    if (!dpData) return "<p style='color:#94a3b8'>Chưa tải hệ thống.</p>";

    var allF = window.das71GetAllFollowers ? window.das71GetAllFollowers() : { total: 0 };
    var cults = window.dps71GetCults ? window.dps71GetCults() : [];
    var relEv = window.dps71GetReligionEvents ? window.dps71GetReligionEvents() : [];

    var html = '<div style="display:grid;gap:10px">';

    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">';
    var fStats = [
      { label: "Tổng Môn Đồ", val: allF.total || 0, icon: "🙏" },
      { label: "Giáo Phái", val: cults.length, icon: "⛪" },
      { label: "Sự Kiện TG", val: relEv.length, icon: "✨" },
    ];
    fStats.forEach(function (s) {
      html += '<div style="background:#1e1b4b;padding:8px;border-radius:6px;text-align:center"><div style="font-size:18px">' + s.icon + '</div><div style="font-size:16px;font-weight:700;color:#c084fc">' + s.val + '</div><div style="font-size:10px;color:#64748b">' + s.label + '</div></div>';
    });
    html += '</div>';

    var rolesList = window.das71GetFollowerRoles ? window.das71GetFollowerRoles() : [];
    var follStats = (daData && daData.followersByRole) ? daData.followersByRole : {};
    html += '<div style="background:#1e1b4b;padding:10px;border-radius:8px">';
    html += '<div style="font-size:12px;color:#a5b4fc;margin-bottom:8px">👥 PHÂN LOẠI MÔN ĐỒ</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:6px">';
    rolesList.forEach(function (r) {
      html += '<div style="background:#0f172a;padding:8px;border-radius:6px;text-align:center"><div style="font-size:18px">' + r.icon + '</div><div style="font-size:13px;font-weight:700;color:#c084fc">' + (follStats[r.id] || 0) + '</div><div style="font-size:10px;color:#64748b">' + r.name + '</div></div>';
    });
    html += '</div></div>';

    if (cults.length > 0) {
      html += '<div style="background:#1e1b4b;padding:10px;border-radius:8px">';
      html += '<div style="font-size:12px;color:#a5b4fc;margin-bottom:8px">⛪ GIÁO PHÁI ĐÃ THÀNH LẬP</div>';
      cults.slice().reverse().slice(0, 5).forEach(function (cult) {
        html += '<div style="background:#0f172a;padding:8px;border-radius:6px;margin-bottom:6px">';
        html += '<div style="font-size:11px;font-weight:600;color:#e2e8f0">' + cult.icon + ' ' + cult.name + '</div>';
        html += '<div style="font-size:10px;color:#64748b">Thành lập năm ' + cult.founded + ' tại ' + cult.location + ' · ' + cult.followers + ' tín đồ</div>';
        html += '<div style="font-size:10px;color:#94a3b8;margin-top:4px;font-style:italic">' + cult.doctrine + '</div>';
        html += '</div>';
      });
      html += '</div>';
    }

    if (relEv.length > 0) {
      html += '<div style="background:#0f172a;padding:10px;border-radius:8px;max-height:130px;overflow-y:auto">';
      html += '<div style="font-size:11px;color:#64748b;margin-bottom:6px">📋 SỰ KIỆN TÔN GIÁO</div>';
      relEv.slice().reverse().forEach(function (e) {
        html += '<div style="font-size:10px;color:#94a3b8;padding:3px 0;border-bottom:1px solid #1e293b">⚡ Năm ' + e.year + ' — ' + e.event + '</div>';
      });
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderLegacyTab() {
    var avData = window.avatarGodV71Data;
    var daData = window.divineAppearanceV71Data;
    var mData = window.manifestationV71Data;

    var html = '<div style="display:grid;gap:10px">';

    var stats = avData ? avData.stats : {};
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">';
    [
      { label: "Lần Hiện Thân", val: stats.totalAppearances || 0, icon: "✨" },
      { label: "NPC Tin Theo", val: stats.npcsConverted || 0, icon: "🙏" },
      { label: "Truyền Thuyết", val: stats.legendsCreated || 0, icon: "📜" },
      { label: "Tôn Giáo TL", val: stats.religionsCreated || 0, icon: "⛪" },
      { label: "NPC Sợ Hãi", val: stats.npcsFeared || 0, icon: "😱" },
      { label: "Phước Lành", val: stats.totalBlessings || 0, icon: "🌟" },
    ].forEach(function (s) {
      html += '<div style="background:#1e1b4b;padding:8px;border-radius:6px;text-align:center"><div style="font-size:16px">' + s.icon + '</div><div style="font-size:15px;font-weight:700;color:#c084fc">' + s.val + '</div><div style="font-size:10px;color:#64748b">' + s.label + '</div></div>';
    });
    html += '</div>';

    var legends = window.das71GetLegendLog ? window.das71GetLegendLog() : [];
    if (legends.length > 0) {
      html += '<div style="background:#1e1b4b;padding:10px;border-radius:8px">';
      html += '<div style="font-size:12px;color:#a5b4fc;margin-bottom:8px">📖 TRUYỀN THUYẾT ĐÃ GHI</div>';
      legends.slice().reverse().slice(0, 5).forEach(function (l) {
        html += '<div style="background:#0f172a;padding:8px;border-radius:6px;margin-bottom:6px;border-left:3px solid #c084fc">';
        html += '<div style="font-size:11px;font-weight:600;color:#c084fc">' + l.title + '</div>';
        html += '<div style="font-size:10px;color:#94a3b8;margin-top:4px;font-style:italic">' + l.text + '</div>';
        html += '<div style="font-size:10px;color:#64748b;margin-top:4px">Năm ' + l.year + ' · ' + l.location + '</div>';
        html += '</div>';
      });
      html += '</div>';
    }

    var mlog = window.mfst71GetLog ? window.mfst71GetLog() : [];
    if (mlog.length > 0) {
      html += '<div style="background:#0f172a;padding:10px;border-radius:8px;max-height:150px;overflow-y:auto">';
      html += '<div style="font-size:11px;color:#64748b;margin-bottom:6px">⚡ SỬ SÁCH THẦN LINH</div>';
      mlog.slice().reverse().forEach(function (e) {
        html += '<div style="padding:5px 0;border-bottom:1px solid #1e293b">';
        html += '<div style="font-size:10px;font-weight:600;color:#a5b4fc">' + e.icon + ' Năm ' + e.year + ' — ' + e.name + '</div>';
        html += '<div style="font-size:10px;color:#94a3b8">' + e.result + '</div>';
        html += '</div>';
      });
      html += '</div>';
    }

    var avLog = avData ? avData.appearanceLog : [];
    if (avLog && avLog.length > 0) {
      html += '<div style="background:#0f172a;padding:10px;border-radius:8px;max-height:100px;overflow-y:auto">';
      html += '<div style="font-size:11px;color:#64748b;margin-bottom:6px">📋 NHẬT KÝ HOẠT ĐỘNG</div>';
      avLog.slice().reverse().slice(0, 8).forEach(function (e) {
        html += '<div style="font-size:10px;color:#94a3b8;padding:2px 0">⚡ Năm ' + e.year + ': ' + e.msg + '</div>';
      });
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  window._avg71Switch = switchTab;

  window._avg71SelectForm = function (formId) {
    if (window.avg71SelectForm) window.avg71SelectForm(formId);
    _patchHub();
  };

  window._avg71SaveName = function () {
    var nameEl = document.getElementById("avg71GodNameInput");
    var titleEl = document.getElementById("avg71GodTitleInput");
    if (window.avg71SetGodName) window.avg71SetGodName(nameEl ? nameEl.value : "", titleEl ? titleEl.value : "");
    _patchHub();
  };

  window._avg71SaveCustom = function () {
    var nameEl = document.getElementById("avg71CustomName");
    var iconEl = document.getElementById("avg71CustomIcon");
    if (window.avg71SetCustomForm) window.avg71SetCustomForm(nameEl ? nameEl.value : "", iconEl ? iconEl.value : "⚡");
    _patchHub();
  };

  window._avg71SetState = function (stateId) {
    if (window.avg71SetPresence) window.avg71SetPresence(stateId);
    _patchHub();
  };

  window._avg71EnterPresence = function () {
    var sel = document.getElementById("avg71LocationSelect");
    var loc = sel ? sel.value : null;
    var avData = window.avatarGodV71Data;
    var form = window.avg71GetForm ? window.avg71GetForm() : null;
    if (window.avg71SetPresence) window.avg71SetPresence("present", loc);
    if (window.dps71EnterPresence) window.dps71EnterPresence(loc, form ? form.id : "human");
    _patchHub();
  };

  window._avg71ExitPresence = function () {
    if (window.dps71ExitPresence) window.dps71ExitPresence();
    if (window.avg71SetPresence) window.avg71SetPresence("watching", null);
    _patchHub();
  };

  window._avg71TriggerReligion = function (evolId) {
    var sel = document.getElementById("avg71LocationSelect");
    var loc = sel ? sel.value : null;
    if (window.dps71TriggerReligionEvolution) {
      var result = window.dps71TriggerReligionEvolution(evolId, loc);
      if (result) _showToast("⛪ " + result.name + " đã thành lập!");
    }
    _patchHub();
  };

  window._avg71Manifest = function (typeId) {
    if (window.mfst71Perform) {
      var sel = document.getElementById("avg71LocationSelect");
      var loc = sel ? sel.value : null;
      var res = window.mfst71Perform(typeId, { location: loc });
      if (res && res.success) {
        _showToast(res.entry ? res.entry.icon + " " + res.entry.name + " thành công!" : "✅ Hiện thân thành công!");
        if (window.avg71RegenEnergy) window.avg71RegenEnergy();
      } else if (res) {
        _showToast("❌ " + (res.msg || "Thất bại"));
      }
    }
    _patchHub();
  };

  function _showToast(msg) {
    var t = document.createElement("div");
    t.style.cssText = "position:fixed;bottom:20px;right:20px;background:#312e81;color:#e2e8f0;padding:10px 16px;border-radius:8px;font-size:12px;z-index:9999;border:1px solid #c084fc;max-width:300px";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 3500);
  }

  function _patchHub() {
    var pnl = document.getElementById("avg71-section-wrapper");
    if (pnl) {
      var parent = pnl.parentElement;
      if (parent) {
        parent.innerHTML = renderSection();
      }
    } else {
      if (typeof window.hubRenderPanel === "function") window.hubRenderPanel("creator-hub-v32");
    }
  }

  function init() {
    var _origHub = window.hubRenderPanel;
    window.hubRenderPanel = function (panelId) {
      if (typeof _origHub === "function") _origHub(panelId);
      if (panelId === "creator-hub-v32") {
        setTimeout(function () {
          var hub = document.getElementById("panel-creator-hub-v32") || document.getElementById("creator-hub-v32");
          if (!hub) return;
          var existing = hub.querySelector("#avg71-section-wrapper");
          if (existing) return;
          var section = document.createElement("div");
          section.innerHTML = renderSection();
          hub.appendChild(section);
        }, 80);
      }
    };
    console.log("[avatarOfGodRegistry V71] 👁️ Avatar of God Registry khởi động — 5 tabs trong creator-hub-v32.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 17300); });
  } else {
    setTimeout(init, 17300);
  }
})();
