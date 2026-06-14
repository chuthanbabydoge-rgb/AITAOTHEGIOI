(function() {
  "use strict";

  var activeTab = "xrworld";
  var replayInterval = null;
  var jarvisInterval = null;

  var TABS = [
    { id: "xrworld",   icon: "🥽", label: "XR World"    },
    { id: "enterworld",icon: "🌍", label: "Enter World"  },
    { id: "godscale",  icon: "⚡", label: "God Scale"    },
    { id: "xrreplay",  icon: "📽️", label: "XR Replay"   },
    { id: "jarvisxr",  icon: "🤖", label: "XR Companion" }
  ];

  function getEl(id) { return document.getElementById(id); }

  function getCountries() {
    var arr = window.countries;
    if (!Array.isArray(arr)) arr = (arr && typeof arr === "object") ? Object.values(arr) : [];
    return arr.filter(function(c) { return c && c.name; });
  }

  function getNpcs() {
    var arr = window.npcs;
    if (!Array.isArray(arr)) arr = (arr && typeof arr === "object") ? Object.values(arr) : [];
    return arr.filter(function(n) { return n && n.name; });
  }

  function renderTabBar() {
    return '<div style="display:flex;gap:4px;margin-bottom:12px;flex-wrap:wrap;">' +
      TABS.map(function(t) {
        var active = activeTab === t.id;
        return '<button onclick="xrw72RegistryTab(\'' + t.id + '\')" style="padding:6px 12px;border-radius:8px;border:none;cursor:pointer;font-size:12px;font-weight:' + (active ? "700" : "500") + ';background:' + (active ? "#8b5cf6" : "#1e1b4b") + ';color:' + (active ? "#fff" : "#a78bfa") + ';transition:all 0.2s;">' + t.icon + " " + t.label + '</button>';
      }).join("") +
    '</div>';
  }

  function renderDeviceBanner() {
    var d = typeof window.xrw72GetData === "function" ? window.xrw72GetData() : {};
    var profile = typeof window.xrw72GetDeviceProfile === "function" ? window.xrw72GetDeviceProfile() : { name: "Desktop", icon: "🖥️", tier: "Flat", score: 40 };
    return '<div style="background:linear-gradient(135deg,#1e1b4b,#312e81);border-radius:10px;padding:10px 14px;margin-bottom:10px;display:flex;align-items:center;gap:12px;">' +
      '<span style="font-size:28px;">' + profile.icon + '</span>' +
      '<div>' +
        '<div style="color:#c4b5fd;font-size:11px;font-weight:600;letter-spacing:1px;">THIẾT BỊ HIỆN TẠI</div>' +
        '<div style="color:#fff;font-size:14px;font-weight:700;">' + profile.name + ' <span style="font-size:11px;background:#8b5cf6;padding:2px 6px;border-radius:4px;">' + profile.tier + '</span></div>' +
        '<div style="color:#a78bfa;font-size:11px;">XR Score: <b style="color:#fbbf24;">' + profile.score + '/100</b></div>' +
      '</div>' +
      '<div style="margin-left:auto;text-align:right;">' +
        '<div style="color:#6ee7b7;font-size:11px;">' + (d.worldTable && d.worldTable.active ? "🟢 World Table ON" : "⚫ World Table OFF") + '</div>' +
        '<div style="color:#c4b5fd;font-size:11px;">' + (d.godScaleMode === "god" ? "⚡ God Scale" : "🧑 Human Scale") + '</div>' +
      '</div>' +
    '</div>';
  }

  function renderXRWorldTab() {
    var d = typeof window.xrw72GetData === "function" ? window.xrw72GetData() : {};
    var wt = d.worldTable || {};
    var levels = typeof window.xrw72GetViewLevels === "function" ? window.xrw72GetViewLevels() : [];
    var log = typeof window.xrw72GetLog === "function" ? window.xrw72GetLog() : [];
    var curView = d.currentView || "planet";

    var html = '<div style="font-weight:700;color:#c4b5fd;font-size:13px;margin-bottom:10px;">🌍 WORLD TABLE MODE</div>';

    html += '<div style="background:#1e1b4b;border-radius:10px;padding:12px;margin-bottom:10px;">';
    html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">';
    html += '<div style="flex:1;">';
    html += '<div style="color:#a78bfa;font-size:11px;margin-bottom:4px;">Trạng Thái</div>';
    html += '<div style="font-size:15px;font-weight:700;color:' + (wt.active ? "#6ee7b7" : "#f87171") + ';">' + (wt.active ? "🟢 ĐANG HOẠT ĐỘNG" : "⚫ TẮT") + '</div>';
    html += '</div>';
    html += '<button onclick="' + (wt.active ? "window.xrw72DeactivateWorldTable" : "window.xrw72ActivateWorldTable") + '();window.xrw72RegistryRender();" style="padding:8px 16px;border-radius:8px;border:none;cursor:pointer;font-weight:700;font-size:12px;background:' + (wt.active ? "#7f1d1d" : "#4c1d95") + ';color:#fff;">' + (wt.active ? "❌ Tắt" : "🌍 Kích Hoạt") + '</button>';
    html += '</div>';

    if (wt.active) {
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">';
      html += '<div style="background:#0f0a1e;border-radius:8px;padding:8px;text-align:center;"><div style="color:#a78bfa;font-size:10px;">Scale</div><div style="color:#fbbf24;font-size:16px;font-weight:700;">' + (wt.scale || 1).toFixed(2) + 'x</div></div>';
      html += '<div style="background:#0f0a1e;border-radius:8px;padding:8px;text-align:center;"><div style="color:#a78bfa;font-size:10px;">Xoay</div><div style="color:#fbbf24;font-size:16px;font-weight:700;">' + (wt.rotation || 0).toFixed(0) + '°</div></div>';
      html += '</div>';

      html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">';
      html += '<button onclick="window.xrw72ScaleUp();window.xrw72RegistryRender();" style="flex:1;padding:6px;border-radius:6px;border:none;cursor:pointer;background:#1d4ed8;color:#fff;font-size:11px;font-weight:600;">🔍 Phóng To</button>';
      html += '<button onclick="window.xrw72ScaleDown();window.xrw72RegistryRender();" style="flex:1;padding:6px;border-radius:6px;border:none;cursor:pointer;background:#1d4ed8;color:#fff;font-size:11px;font-weight:600;">🔭 Thu Nhỏ</button>';
      html += '<button onclick="window.xrw72Rotate(45);window.xrw72RegistryRender();" style="flex:1;padding:6px;border-radius:6px;border:none;cursor:pointer;background:#1d4ed8;color:#fff;font-size:11px;font-weight:600;">🔄 Xoay 45°</button>';
      html += '</div>';

      html += '<div style="display:flex;gap:6px;">';
      html += '<button onclick="window.xrw72Rotate(-90);window.xrw72RegistryRender();" style="flex:1;padding:6px;border-radius:6px;border:none;cursor:pointer;background:#374151;color:#fff;font-size:11px;">◀ -90°</button>';
      html += '<button onclick="window.xrw72SetScale(1);window.xrw72RegistryRender();" style="flex:1;padding:6px;border-radius:6px;border:none;cursor:pointer;background:#374151;color:#fff;font-size:11px;">⟳ Reset</button>';
      html += '<button onclick="window.xrw72Rotate(90);window.xrw72RegistryRender();" style="flex:1;padding:6px;border-radius:6px;border:none;cursor:pointer;background:#374151;color:#fff;font-size:11px;">▶ +90°</button>';
      html += '</div>';
    }
    html += '</div>';

    html += '<div style="font-weight:700;color:#c4b5fd;font-size:13px;margin-bottom:8px;">🌌 VIEW HIỆN TẠI</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:10px;">';
    levels.forEach(function(lv) {
      var isCur = lv.id === curView;
      html += '<button onclick="window.xrw72SetView(\'' + lv.id + '\');window.xrw72RegistryRender();" style="padding:6px 2px;border-radius:6px;border:2px solid ' + (isCur ? "#8b5cf6" : "transparent") + ';cursor:pointer;background:' + (isCur ? "#2e1065" : "#1e1b4b") + ';color:' + (isCur ? "#e9d5ff" : "#a78bfa") + ';font-size:10px;text-align:center;">' +
        '<div style="font-size:16px;">' + lv.icon + '</div>' +
        '<div style="font-weight:' + (isCur ? "700" : "500") + '">' + lv.name + '</div>' +
      '</button>';
    });
    html += '</div>';

    if (log.length > 0) {
      html += '<div style="font-weight:700;color:#c4b5fd;font-size:11px;margin-bottom:6px;">📋 LOG GẦN ĐÂY</div>';
      html += '<div style="max-height:120px;overflow-y:auto;">';
      log.slice(0, 8).forEach(function(entry) {
        html += '<div style="font-size:11px;color:#9ca3af;border-left:2px solid #4c1d95;padding-left:6px;margin-bottom:4px;">';
        html += '<span style="color:#6b7280;font-size:10px;">[' + (entry.year || 0) + ']</span> ' + (entry.msg || "");
        html += '</div>';
      });
      html += '</div>';
    }

    return html;
  }

  function renderEnterWorldTab() {
    var pData = typeof window.xrp72GetData === "function" ? window.xrp72GetData() : {};
    var inWorld = pData.enterWorldMode;
    var pos = pData.worldPosition || {};
    var nearby = pData.nearbyNpcs || [];
    var conversations = typeof window.xrp72GetConversations === "function" ? window.xrp72GetConversations() : [];
    var countries = getCountries();

    var html = '<div style="font-weight:700;color:#c4b5fd;font-size:13px;margin-bottom:10px;">🌍 ENTER WORLD MODE</div>';

    html += '<div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);border-radius:10px;padding:12px;margin-bottom:10px;">';
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">';
    html += '<div style="font-size:28px;">' + (inWorld ? "🟢" : "🚪") + '</div>';
    html += '<div>';
    html += '<div style="color:#fff;font-size:14px;font-weight:700;">' + (inWorld ? "Đang Ở Trong Thế Giới" : "Chưa Bước Vào Thế Giới") + '</div>';
    if (inWorld) {
      html += '<div style="color:#93c5fd;font-size:12px;">📍 ' + (pos.country || "?") + ' — ' + (pos.city || "?") + '</div>';
    }
    html += '</div>';
    html += '</div>';

    if (!inWorld) {
      html += '<div style="margin-bottom:8px;"><label style="color:#a78bfa;font-size:11px;">Chọn Quốc Gia Để Bước Vào:</label>';
      html += '<select id="xr72-enter-country" style="width:100%;margin-top:4px;padding:6px;border-radius:6px;background:#0f172a;color:#fff;border:1px solid #4c1d95;font-size:12px;">';
      countries.slice(0, 20).forEach(function(c) {
        html += '<option value="' + c.name + '">' + c.name + (c.population ? " (" + Math.round(c.population / 1000) + "K dân)" : "") + '</option>';
      });
      if (countries.length === 0) html += '<option>Thế Giới Chưa Có Quốc Gia</option>';
      html += '</select></div>';
      html += '<button onclick="var sel=document.getElementById(\'xr72-enter-country\');if(sel&&typeof window.xrp72EnterWorld===\'function\'){var r=window.xrp72EnterWorld(sel.value);window.xrw72RegistryRender();}" style="width:100%;padding:10px;border-radius:8px;border:none;cursor:pointer;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;font-weight:700;font-size:13px;">🌍 BƯỚC VÀO THẾ GIỚI</button>';
    } else {
      html += '<button onclick="if(typeof window.xrp72ExitWorld===\'function\')window.xrp72ExitWorld();window.xrw72RegistryRender();" style="width:100%;padding:8px;border-radius:8px;border:none;cursor:pointer;background:#7f1d1d;color:#fff;font-weight:600;font-size:12px;margin-bottom:8px;">🚪 Rời Khỏi Thế Giới</button>';

      if (nearby.length > 0) {
        html += '<div style="font-weight:600;color:#6ee7b7;font-size:11px;margin-bottom:6px;">👥 NPC GẦN ĐÂY (' + nearby.length + ')</div>';
        html += '<div style="display:flex;flex-direction:column;gap:6px;max-height:200px;overflow-y:auto;">';
        nearby.forEach(function(npc) {
          html += '<div style="background:#0f172a;border-radius:8px;padding:8px;border-left:3px solid #4c1d95;">';
          html += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">';
          html += '<span style="font-size:16px;">' + npc.icon + '</span>';
          html += '<span style="color:#e2e8f0;font-size:12px;font-weight:600;">' + npc.name + '</span>';
          html += '<span style="color:#6b7280;font-size:10px;">' + npc.career + '</span>';
          html += '<span style="margin-left:auto;font-size:10px;background:#312e81;padding:2px 6px;border-radius:4px;color:#a78bfa;">' + npc.label + '</span>';
          html += '</div>';
          html += '<div style="color:#94a3b8;font-size:11px;font-style:italic;">"' + npc.quote + '"</div>';
          html += '<div style="display:flex;gap:4px;margin-top:6px;">';
          html += '<button onclick="if(typeof window.xrp72TriggerNpcReaction===\'function\')window.xrp72TriggerNpcReaction(\'' + npc.name.replace(/'/g,"") + '\',\'pray\');window.xrw72RegistryRender();" style="flex:1;padding:4px;border-radius:4px;border:none;cursor:pointer;background:#1e3a5f;color:#93c5fd;font-size:10px;">🙏 Cầu Nguyện</button>';
          html += '<button onclick="if(typeof window.xrp72StartConversation===\'function\')window.xrp72StartConversation(\'' + npc.name.replace(/'/g,"") + '\');window.xrw72RegistryRender();" style="flex:1;padding:4px;border-radius:4px;border:none;cursor:pointer;background:#1e3a5f;color:#93c5fd;font-size:10px;">💬 Trò Chuyện</button>';
          html += '</div>';
          html += '</div>';
        });
        html += '</div>';
      }

      if (conversations.length > 0) {
        html += '<div style="font-weight:600;color:#fbbf24;font-size:11px;margin:8px 0 4px;">💬 CUỘC TRÒ CHUYỆN GẦN ĐÂY</div>';
        conversations.slice(0, 3).forEach(function(c) {
          html += '<div style="background:#0f172a;border-radius:6px;padding:8px;margin-bottom:4px;border-left:3px solid #fbbf24;">';
          html += '<div style="color:#fbbf24;font-size:11px;font-weight:600;">' + c.npc + ' <span style="color:#6b7280;font-weight:400;">' + c.career + '</span></div>';
          html += '<div style="color:#94a3b8;font-size:11px;margin-top:2px;">' + c.response + '</div>';
          html += '</div>';
        });
      }
    }
    html += '</div>';

    html += '<div style="font-weight:700;color:#c4b5fd;font-size:11px;margin-bottom:6px;">📊 THỐNG KÊ HIỆN DIỆN</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">';
    html += '<div style="background:#1e1b4b;border-radius:8px;padding:8px;text-align:center;"><div style="color:#a78bfa;font-size:10px;">Tổng Gặp NPC</div><div style="color:#6ee7b7;font-size:16px;font-weight:700;">' + (pData.totalNpcEncounters || 0) + '</div></div>';
    html += '<div style="background:#1e1b4b;border-radius:8px;padding:8px;text-align:center;"><div style="color:#a78bfa;font-size:10px;">Cuộc Trò Chuyện</div><div style="color:#fbbf24;font-size:16px;font-weight:700;">' + (conversations.length || 0) + '</div></div>';
    html += '</div>';

    return html;
  }

  function renderGodScaleTab() {
    var wData = typeof window.xrw72GetData === "function" ? window.xrw72GetData() : {};
    var pData = typeof window.xrp72GetData === "function" ? window.xrp72GetData() : {};
    var curScale = wData.godScaleMode || "god";

    var html = '<div style="font-weight:700;color:#c4b5fd;font-size:13px;margin-bottom:10px;">⚡ GOD SCALE SHIFT</div>';

    html += '<div style="background:linear-gradient(135deg,#1a0533,#2e1065);border-radius:12px;padding:14px;margin-bottom:12px;text-align:center;">';
    html += '<div style="font-size:48px;margin-bottom:8px;">' + (curScale === "god" ? "⚡" : "🧑") + '</div>';
    html += '<div style="font-size:16px;font-weight:700;color:#fff;margin-bottom:4px;">' + (curScale === "god" ? "THẦN KHỔNG LỒ" : "TỶ LỆ NGƯỜI") + '</div>';
    html += '<div style="font-size:12px;color:#a78bfa;">' + (curScale === "god" ? "Bóng thần che khuất cả thành phố · Nhìn thấy mọi quốc gia cùng lúc" : "Đi bộ giữa dân chúng · Nghe thấy tiếng chợ búa và tiếng người") + '</div>';
    html += '</div>';

    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">';

    html += '<div onclick="if(typeof window.xrp72SetGodScale===\'function\')window.xrp72SetGodScale(\'god\');window.xrw72RegistryRender();" style="border-radius:12px;padding:16px;text-align:center;cursor:pointer;border:3px solid ' + (curScale === "god" ? "#8b5cf6" : "transparent") + ';background:' + (curScale === "god" ? "linear-gradient(135deg,#2e1065,#4c1d95)" : "#1e1b4b") + ';transition:all 0.2s;">';
    html += '<div style="font-size:36px;margin-bottom:8px;">⚡</div>';
    html += '<div style="color:#e9d5ff;font-size:13px;font-weight:700;margin-bottom:4px;">THẦN KHỔNG LỒ</div>';
    html += '<div style="color:#a78bfa;font-size:10px;">Cao 1000m · Nhìn từ trên cao</div>';
    html += '<div style="color:#a78bfa;font-size:10px;">Mỗi bước chân = 1 dặm</div>';
    if (curScale === "god") html += '<div style="color:#6ee7b7;font-size:10px;margin-top:4px;font-weight:600;">✓ ĐANG CHỌN</div>';
    html += '</div>';

    html += '<div onclick="if(typeof window.xrp72SetGodScale===\'function\')window.xrp72SetGodScale(\'human\');window.xrw72RegistryRender();" style="border-radius:12px;padding:16px;text-align:center;cursor:pointer;border:3px solid ' + (curScale === "human" ? "#f59e0b" : "transparent") + ';background:' + (curScale === "human" ? "linear-gradient(135deg,#451a03,#92400e)" : "#1e1b4b") + ';transition:all 0.2s;">';
    html += '<div style="font-size:36px;margin-bottom:8px;">🧑</div>';
    html += '<div style="color:#fef3c7;font-size:13px;font-weight:700;margin-bottom:4px;">TỶ LỆ NGƯỜI</div>';
    html += '<div style="color:#fcd34d;font-size:10px;">Cao 1.75m · Đi giữa dân chúng</div>';
    html += '<div style="color:#fcd34d;font-size:10px;">NPC nhìn thấy · Trò chuyện trực tiếp</div>';
    if (curScale === "human") html += '<div style="color:#6ee7b7;font-size:10px;margin-top:4px;font-weight:600;">✓ ĐANG CHỌN</div>';
    html += '</div>';
    html += '</div>';

    html += '<div style="background:#1e1b4b;border-radius:10px;padding:12px;margin-bottom:10px;">';
    html += '<div style="font-weight:600;color:#c4b5fd;font-size:11px;margin-bottom:8px;">⚙️ LUỒNG TRẢI NGHIỆM</div>';
    var steps = [
      { icon: "🌌", text: "Bắt đầu tại Universe View — nhìn toàn bộ đa vũ trụ" },
      { icon: "⚡", text: "God Scale: Thu nhỏ thế giới · Nhìn như cầm quả cầu trong tay" },
      { icon: "🏙️", text: "Zoom vào thành phố mong muốn — dân số, chiến tranh, kinh tế" },
      { icon: "🧑", text: "Chuyển Human Scale — bước vào đường phố, trò chuyện NPC" },
      { icon: "✨", text: "Ra lệnh thần từ tỷ lệ bạn đang ở — tác động thay đổi theo scale" }
    ];
    steps.forEach(function(s, i) {
      html += '<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;">';
      html += '<div style="background:#312e81;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#e9d5ff;flex-shrink:0;margin-top:1px;">' + (i+1) + '</div>';
      html += '<div style="color:#cbd5e1;font-size:11px;">' + s.icon + ' ' + s.text + '</div>';
      html += '</div>';
    });
    html += '</div>';

    var scaleHistory = pData.scaleHistory || [];
    if (scaleHistory.length > 0) {
      html += '<div style="font-weight:600;color:#c4b5fd;font-size:11px;margin-bottom:4px;">🕐 LỊCH SỬ THAY ĐỔI</div>';
      html += '<div style="max-height:80px;overflow-y:auto;">';
      scaleHistory.slice(-5).reverse().forEach(function(h) {
        html += '<div style="font-size:10px;color:#6b7280;border-left:2px solid #4c1d95;padding-left:6px;margin-bottom:2px;">[' + h.year + '] → ' + (h.mode === "god" ? "⚡ Thần" : "🧑 Người") + '</div>';
      });
      html += '</div>';
    }

    return html;
  }

  function renderXRReplayTab() {
    var gData = typeof window.xrg72GetData === "function" ? window.xrg72GetData() : {};
    var replayTypes = typeof window.xrg72GetReplayTypes === "function" ? window.xrg72GetReplayTypes() : [];
    var currentReplay = gData.currentReplay;
    var step = gData.replayStep || 0;

    var html = '<div style="font-weight:700;color:#c4b5fd;font-size:13px;margin-bottom:10px;">📽️ XR WORLD HISTORY REPLAY</div>';

    html += '<div style="display:grid;grid-template-columns:1fr;gap:6px;margin-bottom:10px;">';
    replayTypes.forEach(function(rt) {
      html += '<button onclick="if(typeof window.xrg72LoadReplay===\'function\')window.xrg72LoadReplay(\'' + rt.id + '\',{fromYear:Math.max(0,(window.year||0)-500),toYear:window.year||0});window.xrw72RegistryRender();" style="padding:10px;border-radius:8px;border:none;cursor:pointer;background:linear-gradient(135deg,#0f172a,' + rt.color + '22);border:1px solid ' + rt.color + '44;color:#e2e8f0;font-size:12px;font-weight:600;text-align:left;display:flex;align-items:center;gap:8px;">';
      html += '<span style="font-size:20px;">' + rt.icon + '</span>';
      html += '<div><div style="color:#fff;">' + rt.label + '</div><div style="color:#9ca3af;font-size:10px;font-weight:400;">' + rt.desc + '</div></div>';
      html += '</button>';
    });
    html += '</div>';

    if (currentReplay) {
      html += '<div style="background:linear-gradient(135deg,#0f172a,#1a1a2e);border-radius:10px;padding:12px;margin-bottom:10px;border:1px solid ' + (currentReplay.color || "#4c1d95") + '44;">';
      html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">';
      html += '<span style="font-size:20px;">' + currentReplay.icon + '</span>';
      html += '<div><div style="color:#fff;font-size:13px;font-weight:700;">' + currentReplay.label + '</div>';
      html += '<div style="color:#6b7280;font-size:10px;">' + currentReplay.events.length + ' sự kiện · Năm ' + currentReplay.fromYear + ' → ' + currentReplay.toYear + '</div></div>';
      html += '<div style="margin-left:auto;color:#6b7280;font-size:11px;">' + step + '/' + currentReplay.events.length + '</div>';
      html += '</div>';

      html += '<div style="background:#111827;border-radius:6px;height:6px;margin-bottom:8px;overflow:hidden;">';
      html += '<div style="background:' + (currentReplay.color || "#8b5cf6") + ';height:100%;width:' + (currentReplay.events.length > 0 ? Math.round(step / currentReplay.events.length * 100) : 0) + '%;transition:width 0.3s;"></div>';
      html += '</div>';

      if (step > 0 && currentReplay.events[step - 1]) {
        var ev = currentReplay.events[step - 1];
        html += '<div style="background:#0f172a;border-radius:8px;padding:10px;margin-bottom:8px;border-left:3px solid ' + (currentReplay.color || "#8b5cf6") + ';">';
        html += '<div style="color:#9ca3af;font-size:10px;margin-bottom:2px;">SỰ KIỆN HIỆN TẠI · NĂM ' + ev.year + '</div>';
        html += '<div style="color:#fff;font-size:13px;font-weight:600;">' + ev.icon + ' ' + ev.title + '</div>';
        if (ev.desc) html += '<div style="color:#94a3b8;font-size:11px;margin-top:4px;">' + ev.desc + '</div>';
        html += '</div>';
      }

      var allEvents = currentReplay.events;
      if (allEvents.length > 0) {
        html += '<div style="max-height:120px;overflow-y:auto;margin-bottom:8px;">';
        allEvents.forEach(function(ev, i) {
          var isPast = i < step;
          html += '<div style="display:flex;align-items:center;gap:6px;padding:4px 6px;border-radius:4px;background:' + (isPast ? "#1a1a2e" : "transparent") + ';margin-bottom:2px;opacity:' + (isPast ? "1" : "0.5") + ';">';
          html += '<span style="font-size:12px;">' + ev.icon + '</span>';
          html += '<span style="color:#94a3b8;font-size:10px;">[' + ev.year + ']</span>';
          html += '<span style="color:' + (isPast ? "#e2e8f0" : "#6b7280") + ';font-size:11px;">' + ev.title + '</span>';
          html += '</div>';
        });
        html += '</div>';
      }

      html += '<div style="display:flex;gap:6px;">';
      html += '<button onclick="if(typeof window.xrg72ResetReplay===\'function\')window.xrg72ResetReplay();window.xrw72RegistryRender();" style="padding:6px 10px;border-radius:6px;border:none;cursor:pointer;background:#374151;color:#fff;font-size:11px;">⟳ Reset</button>';
      html += '<button onclick="if(typeof window.xrg72StepReplay===\'function\')window.xrg72StepReplay();window.xrw72RegistryRender();" style="flex:1;padding:8px;border-radius:8px;border:none;cursor:pointer;background:linear-gradient(135deg,' + (currentReplay.color || "#7c3aed") + ',#1d4ed8);color:#fff;font-weight:700;font-size:12px;" ' + (step >= allEvents.length ? 'disabled' : '') + '>' + (step >= allEvents.length ? "✅ Kết Thúc" : "▶ Bước Tiếp →") + '</button>';
      html += '</div>';
      html += '</div>';
    }

    var stats = typeof window.xrg72GetStats === "function" ? window.xrg72GetStats() : {};
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">';
    html += '<div style="background:#1e1b4b;border-radius:8px;padding:8px;text-align:center;"><div style="color:#a78bfa;font-size:10px;">Tổng Replay</div><div style="color:#fbbf24;font-size:16px;font-weight:700;">' + (stats.totalReplays || 0) + '</div></div>';
    html += '<div style="background:#1e1b4b;border-radius:8px;padding:8px;text-align:center;"><div style="color:#a78bfa;font-size:10px;">Lệnh Thần</div><div style="color:#f87171;font-size:16px;font-weight:700;">' + (stats.totalCommands || 0) + '</div></div>';
    html += '</div>';

    return html;
  }

  function renderJarvisXRTab() {
    var gData = typeof window.xrg72GetData === "function" ? window.xrg72GetData() : {};
    var jarvis = gData.jarvisXR || {};
    var queue = jarvis.messageQueue || [];
    var commands = typeof window.xrg72GetCommands === "function" ? window.xrg72GetCommands() : [];
    var cmdLog = typeof window.xrg72GetCommandLog === "function" ? window.xrg72GetCommandLog() : [];
    var stats = gData.stats || {};

    var html = '<div style="font-weight:700;color:#c4b5fd;font-size:13px;margin-bottom:10px;">🤖 JARVIS XR COMPANION</div>';

    html += '<div style="background:linear-gradient(135deg,#0a0f1e,#1a1a3e);border-radius:12px;padding:14px;margin-bottom:10px;border:1px solid ' + (jarvis.active ? "#8b5cf6" : "#374151") + ';">';
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">';
    html += '<div style="font-size:32px;">' + (jarvis.active ? "🤖" : "💤") + '</div>';
    html += '<div>';
    html += '<div style="color:#fff;font-size:14px;font-weight:700;">Jarvis XR ' + (jarvis.active ? "— ĐANG HOẠT ĐỘNG" : "— ĐANG NGỦ") + '</div>';
    html += '<div style="color:#6b7280;font-size:11px;">' + (jarvis.active ? "Chế độ: " + (jarvis.mode || "companion") : "Kích hoạt để Jarvis đồng hành cùng bạn") + '</div>';
    html += '</div>';
    html += '<button onclick="if(typeof window.xrg72JarvisActivate===\'function\'){window.xrg72JarvisActivate(\'' + (jarvis.mode || "companion") + '\');}window.xrw72RegistryRender();" style="margin-left:auto;padding:6px 12px;border-radius:8px;border:none;cursor:pointer;background:' + (jarvis.active ? "#1f2937" : "#4c1d95") + ';color:#fff;font-size:11px;font-weight:600;">' + (jarvis.active ? "🔄 Refresh" : "🚀 Kích Hoạt") + '</button>';
    html += '</div>';

    if (jarvis.lastMessage) {
      html += '<div style="background:#0f172a;border-radius:8px;padding:10px;border-left:3px solid #8b5cf6;">';
      html += '<div style="color:#a78bfa;font-size:10px;margin-bottom:4px;">🤖 JARVIS NÓI:</div>';
      html += '<div style="color:#e2e8f0;font-size:12px;font-style:italic;">"' + jarvis.lastMessage + '"</div>';
      html += '</div>';
    }
    html += '</div>';

    html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px;">';
    var modes = [
      { id: "companion", icon: "🚶", label: "Đồng Hành" },
      { id: "explain", icon: "📖", label: "Giải Thích" },
      { id: "guide", icon: "🧭", label: "Hướng Dẫn" }
    ];
    modes.forEach(function(m) {
      var active = jarvis.mode === m.id;
      html += '<button onclick="if(typeof window.xrg72JarvisActivate===\'function\')window.xrg72JarvisActivate(\'' + m.id + '\');window.xrw72RegistryRender();" style="padding:8px 4px;border-radius:8px;border:2px solid ' + (active ? "#8b5cf6" : "transparent") + ';cursor:pointer;background:' + (active ? "#2e1065" : "#1e1b4b") + ';color:#e9d5ff;font-size:11px;text-align:center;">' +
        '<div>' + m.icon + '</div><div>' + m.label + '</div>' +
      '</button>';
    });
    html += '</div>';

    html += '<div style="background:#1e1b4b;border-radius:10px;padding:12px;margin-bottom:10px;">';
    html += '<div style="font-weight:700;color:#fbbf24;font-size:12px;margin-bottom:8px;">⚡ LỆNH THẦN LINH</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">';
    commands.forEach(function(cmd) {
      html += '<button onclick="if(typeof window.xrg72ExecuteCommand===\'function\'){var r=window.xrg72ExecuteCommand(\'' + cmd.id + '\');if(r&&r.result)alert(r.result);}window.xrw72RegistryRender();" style="padding:6px 4px;border-radius:6px;border:none;cursor:pointer;background:#0f172a;color:#e2e8f0;font-size:10px;text-align:left;display:flex;align-items:center;gap:4px;" title="' + cmd.desc + '">';
      html += '<span>' + cmd.icon + '</span>';
      html += '<div><div style="font-weight:600;font-size:10px;">' + cmd.label + '</div><div style="color:#f59e0b;font-size:9px;">' + cmd.cost + '⚡</div></div>';
      html += '</button>';
    });
    html += '</div>';
    html += '</div>';

    if (jarvis.active) {
      html += '<button onclick="if(typeof window.xrg72JarvisContextComment===\'function\'){var m=window.xrg72JarvisContextComment();window.xrw72RegistryRender();}" style="width:100%;padding:8px;border-radius:8px;border:none;cursor:pointer;background:#1d4ed8;color:#fff;font-weight:600;font-size:12px;margin-bottom:8px;">💬 Jarvis Nhận Xét Ngay</button>';
    }

    if (cmdLog.length > 0) {
      html += '<div style="font-weight:600;color:#c4b5fd;font-size:11px;margin-bottom:6px;">📜 LỊCH SỬ LỆNH GẦN ĐÂY</div>';
      html += '<div style="max-height:150px;overflow-y:auto;">';
      cmdLog.slice(0, 8).forEach(function(entry) {
        html += '<div style="background:#0f172a;border-radius:6px;padding:8px;margin-bottom:4px;border-left:3px solid #4c1d95;">';
        html += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">';
        html += '<span style="font-size:14px;">' + entry.icon + '</span>';
        html += '<span style="color:#e2e8f0;font-size:11px;font-weight:600;">' + entry.label + '</span>';
        html += '<span style="margin-left:auto;color:#6b7280;font-size:10px;">[' + (entry.year || 0) + '] ' + entry.country + '</span>';
        html += '</div>';
        html += '<div style="color:#94a3b8;font-size:10px;">' + (entry.result || "").substring(0, 100) + (entry.result && entry.result.length > 100 ? "..." : "") + '</div>';
        html += '</div>';
      });
      html += '</div>';
    }

    if (queue.length > 0) {
      html += '<div style="font-weight:600;color:#a78bfa;font-size:11px;margin:8px 0 4px;">🤖 ĐÃ NÓI (' + queue.length + ')</div>';
      html += '<div style="max-height:80px;overflow-y:auto;">';
      queue.slice(0, 5).forEach(function(q) {
        html += '<div style="font-size:10px;color:#6b7280;border-left:2px solid #4c1d95;padding-left:6px;margin-bottom:3px;">[' + q.year + '] "' + q.msg.substring(0, 60) + (q.msg.length > 60 ? "..." : "") + '"</div>';
      });
      html += '</div>';
    }

    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px;">';
    html += '<div style="background:#1e1b4b;border-radius:6px;padding:6px;text-align:center;"><div style="color:#a78bfa;font-size:9px;">Lệnh Thần</div><div style="color:#f59e0b;font-size:14px;font-weight:700;">' + (stats.totalCommands || 0) + '</div></div>';
    html += '<div style="background:#1e1b4b;border-radius:6px;padding:6px;text-align:center;"><div style="color:#a78bfa;font-size:9px;">Phước Lành</div><div style="color:#6ee7b7;font-size:14px;font-weight:700;">' + (stats.totalBlessings || 0) + '</div></div>';
    html += '<div style="background:#1e1b4b;border-radius:6px;padding:6px;text-align:center;"><div style="color:#a78bfa;font-size:9px;">Phép Màu</div><div style="color:#f87171;font-size:14px;font-weight:700;">' + (stats.totalMiracles || 0) + '</div></div>';
    html += '</div>';

    return html;
  }

  function buildSection() {
    var hub = document.getElementById("panel-creator-hub-v32");
    if (!hub) return;
    if (document.getElementById("xrw72-section-wrapper")) return;

    var wrapper = document.createElement("div");
    wrapper.id = "xrw72-section-wrapper";
    wrapper.style.cssText = "border-top:2px solid #4c1d95;margin-top:16px;padding-top:16px;";
    wrapper.innerHTML =
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">' +
        '<span style="font-size:22px;">🥽</span>' +
        '<div>' +
          '<div style="font-size:16px;font-weight:700;color:#e9d5ff;letter-spacing:0.5px;">XR WORLD PASS <span style="font-size:11px;background:#8b5cf6;padding:2px 6px;border-radius:4px;margin-left:6px;">V72</span></div>' +
          '<div style="font-size:11px;color:#7c3aed;">Đeo Meta Quest · Bước vào thế giới của chính bạn</div>' +
        '</div>' +
      '</div>' +
      '<div id="xrw72-tab-content" style="background:#0d0d1a;border-radius:12px;padding:14px;"></div>';

    hub.appendChild(wrapper);
  }

  window.xrw72RegistryTab = function(tabId) {
    activeTab = tabId;
    window.xrw72RegistryRender();
  };

  window.xrw72RegistryRender = function() {
    buildSection();
    var contentEl = document.getElementById("xrw72-tab-content");
    if (!contentEl) return;
    var html = renderTabBar();
    if (activeTab === "xrworld")    html += renderXRWorldTab();
    else if (activeTab === "enterworld") html += renderEnterWorldTab();
    else if (activeTab === "godscale")   html += renderGodScaleTab();
    else if (activeTab === "xrreplay")  html += renderXRReplayTab();
    else if (activeTab === "jarvisxr")  html += renderJarvisXRTab();
    contentEl.innerHTML = html;
  };

  function init() {
    var _origHub = window.hubRenderPanel;
    window.hubRenderPanel = function(panelId) {
      if (typeof _origHub === "function") _origHub(panelId);
      if (panelId === "creator-hub-v32") {
        setTimeout(function() {
          buildSection();
          window.xrw72RegistryRender();
        }, 100);
      }
    };
    console.log("[XR World Registry V72] 🥽 UI sẵn sàng — 5 tabs trong creator-hub-v32");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 17700); });
  } else {
    setTimeout(init, 17700);
  }
})();
