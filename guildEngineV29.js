(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════
  // GUILD ENGINE V29 — Bang Hội Người Chơi
  // Save key: cgv6_guild_v29
  // ═══════════════════════════════════════════════════════

  var SAVE_KEY = "cgv6_guild_v29";

  var GUILD_TYPES = {
    "bangHoi":     { name: "Bang Hội",              icon: "🏛",  color: "#60a5fa", desc: "Tổ chức đa năng, mạng lưới rộng lớn",       bonus: "Danh tiếng +25%, nhiệm vụ đa dạng" },
    "linhDao":     { name: "Công Ty Lính Đánh Thuê", icon: "⚔️",  color: "#f87171", desc: "Chiến binh chuyên nghiệp, bảo vệ thuê",    bonus: "Sức chiến đấu +40%, thu nhập từ bảo vệ" },
    "thuongMai":   { name: "Công Ty Thương Mại",     icon: "💰",  color: "#4ade80", desc: "Buôn bán khắp nơi, kiểm soát thị trường", bonus: "Thu nhập vàng +60%, giảm giá mua vào" },
    "thamHiem":    { name: "Hội Thám Hiểm",          icon: "🧭",  color: "#fbbf24", desc: "Khám phá bí cảnh, tìm kiếm bảo vật",       bonus: "Khám phá +50%, tỷ lệ phát hiện bảo vật +30%" }
  };

  var GUILD_RANKS = [
    { level: 0, name: "Tân Binh",      icon: "⚪", maxMembers: 10  },
    { level: 1, name: "Sơ Cấp",        icon: "🟢", maxMembers: 25  },
    { level: 2, name: "Trung Cấp",     icon: "🔵", maxMembers: 50  },
    { level: 3, name: "Cao Cấp",       icon: "🟡", maxMembers: 100 },
    { level: 4, name: "Tinh Anh",      icon: "🔶", maxMembers: 200 },
    { level: 5, name: "Huyền Thoại",   icon: "👑", maxMembers: 999 }
  ];

  var GUILD_MISSIONS = [
    { id:"m1", name:"Tuần tra biên giới",     type:"combat",   reward:{ gold:100, xp:50  }, duration:3, minLevel:0 },
    { id:"m2", name:"Hộ tống thương đoàn",    type:"escort",   reward:{ gold:200, xp:80  }, duration:5, minLevel:0 },
    { id:"m3", name:"Diệt trừ thú dữ",        type:"hunt",     reward:{ gold:150, xp:100 }, duration:4, minLevel:1 },
    { id:"m4", name:"Khám phá bí cảnh",       type:"explore",  reward:{ gold:300, xp:200 }, duration:8, minLevel:1 },
    { id:"m5", name:"Ám sát mục tiêu",        type:"assassin", reward:{ gold:500, xp:150 }, duration:6, minLevel:2 },
    { id:"m6", name:"Đàm phán thương mại",    type:"trade",    reward:{ gold:400, xp:100 }, duration:5, minLevel:2 },
    { id:"m7", name:"Bảo vệ tông môn đồng minh", type:"guard", reward:{ gold:350, xp:120 }, duration:7, minLevel:3 },
    { id:"m8", name:"Thu thập thông tin tình báo", type:"intel", reward:{ gold:250, xp:180 }, duration:6, minLevel:3 }
  ];

  window.guildV29Data = {
    guilds: [],
    playerGuildId: null,
    activeMissions: [],
    completedMissions: [],
    log: [],
    stats: { guildsCreated: 0, missionsCompleted: 0, totalGold: 0, totalXP: 0 }
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.guildV29Data)); } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) { var p = JSON.parse(d); Object.assign(window.guildV29Data, p); }
    } catch(e) {}
  }

  function _log(msg, type) {
    window.guildV29Data.log.unshift({ year: window.year || 0, msg: msg, type: type || "info" });
    if (window.guildV29Data.log.length > 100) window.guildV29Data.log.pop();
  }

  function _rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
  function _chance(p)   { return Math.random() < p; }
  function _pick(arr)   { return arr[Math.floor(Math.random() * arr.length)]; }
  function _esc(s)      { return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  // ─── Tạo Bang Hội ───
  window.guildV29Create = function(name, type) {
    if (!name || !name.trim()) { if (typeof toast === "function") toast("⚠️ Nhập tên bang hội!"); return; }
    var gType = GUILD_TYPES[type];
    if (!gType) { if (typeof toast === "function") toast("⚠️ Loại bang hội không hợp lệ!"); return; }

    var guildId = "g" + Date.now();
    var guild = {
      id: guildId,
      name: name.trim(),
      type: type,
      level: 0,
      members: [],
      npcMembers: [],
      treasury: 500,
      reputation: 100,
      influence: 10,
      founded: window.year || 0,
      territory: null,
      achievements: []
    };
    window.guildV29Data.guilds.push(guild);
    window.guildV29Data.playerGuildId = guildId;
    window.guildV29Data.stats.guildsCreated++;

    var msg = gType.icon + " Bang hội [" + name.trim() + "] được thành lập! [" + gType.name + "]";
    _log(msg, "found");
    if (typeof window.htAddEvent === "function") window.htAddEvent({ year: window.year || 0, type: "guild", title: msg, color: gType.color });
    if (typeof window.wmeAddMemory === "function") window.wmeAddMemory({ year: window.year || 0, category: "guild", title: "Thành lập " + gType.name + ": " + name.trim(), content: gType.desc });
    if (typeof toast === "function") toast(msg);
    save();
    return guildId;
  };

  // ─── Nhận nhiệm vụ ───
  window.guildV29AcceptMission = function(missionId, guildId) {
    var gId = guildId || window.guildV29Data.playerGuildId;
    var guild = window.guildV29Data.guilds.find(function(g) { return g.id === gId; });
    var mission = GUILD_MISSIONS.find(function(m) { return m.id === missionId; });
    if (!guild || !mission) return;
    if (guild.level < mission.minLevel) { if (typeof toast === "function") toast("⚠️ Cấp bang hội quá thấp!"); return; }

    var active = {
      id: "am" + Date.now(),
      missionId: missionId,
      guildId: gId,
      startYear: window.year || 0,
      endYear: (window.year || 0) + mission.duration,
      status: "active"
    };
    window.guildV29Data.activeMissions.push(active);
    _log("📋 " + guild.name + " nhận nhiệm vụ: " + mission.name, "mission");
    if (typeof toast === "function") toast("📋 Nhận nhiệm vụ: " + mission.name);
    save();
  };

  // ─── Tick ───
  window.guildV29Tick = function() {
    var curYear = window.year || 0;

    // Process active missions
    var toComplete = window.guildV29Data.activeMissions.filter(function(am) { return am.endYear <= curYear; });
    toComplete.forEach(function(am) {
      var mission = GUILD_MISSIONS.find(function(m) { return m.id === am.missionId; });
      var guild = window.guildV29Data.guilds.find(function(g) { return g.id === am.guildId; });
      if (!mission || !guild) return;

      var success = _chance(0.75);
      if (success) {
        guild.treasury   += mission.reward.gold;
        guild.reputation += _rand(5, 20);
        guild.influence  += _rand(1, 5);
        window.guildV29Data.stats.missionsCompleted++;
        window.guildV29Data.stats.totalGold += mission.reward.gold;
        window.guildV29Data.stats.totalXP   += mission.reward.xp;
        if (typeof window.culAddXP === "function") window.culAddXP(mission.reward.xp);
        if (typeof window.playerAddXP === "function") window.playerAddXP(mission.reward.xp, "guild_mission");
        _log("✅ " + guild.name + " hoàn thành: " + mission.name + " (+$" + mission.reward.gold + "g)", "success");
        // Level up check
        if (guild.reputation >= (guild.level + 1) * 500 && guild.level < 5) {
          guild.level++;
          _log("🎉 " + guild.name + " thăng lên " + (GUILD_RANKS[guild.level] || {name:"?"}).name + "!", "levelup");
          if (typeof toast === "function") toast("🎉 Bang hội thăng cấp: " + (GUILD_RANKS[guild.level] || {name:"?"}).name);
          if (typeof window.htAddEvent === "function") window.htAddEvent({ year: curYear, type: "guild", title: guild.name + " thăng lên " + (GUILD_RANKS[guild.level] || {name:"?"}).name, color: "#4ade80" });
        }
        am.status = "completed";
      } else {
        guild.treasury = Math.max(0, guild.treasury - Math.floor(mission.reward.gold * 0.1));
        _log("❌ " + guild.name + " thất bại nhiệm vụ: " + mission.name, "fail");
        am.status = "failed";
      }
      window.guildV29Data.completedMissions.unshift(am);
      if (window.guildV29Data.completedMissions.length > 30) window.guildV29Data.completedMissions.pop();
    });
    window.guildV29Data.activeMissions = window.guildV29Data.activeMissions.filter(function(am) { return am.status === "active"; });

    // Passive income
    window.guildV29Data.guilds.forEach(function(g) {
      var gType = GUILD_TYPES[g.type];
      var incomeBase = (g.level + 1) * 5;
      if (g.type === "thuongMai") incomeBase *= 2;
      g.treasury  += _rand(1, incomeBase);
      g.influence += _chance(0.1) ? 1 : 0;
    });

    // Auto-recruit NPC members
    if (_chance(0.05)) {
      var allNPCs = (typeof npcs !== "undefined" ? npcs : window.npcs) || [];
      window.guildV29Data.guilds.forEach(function(g) {
        var maxMem = (GUILD_RANKS[g.level] || {maxMembers:10}).maxMembers;
        if (g.npcMembers.length >= maxMem) return;
        var recruit = allNPCs.find(function(n) { return n.status === "alive" && g.npcMembers.indexOf(n.id) === -1 && !n.sectId; });
        if (recruit) {
          g.npcMembers.push(recruit.id);
          _log("👤 " + recruit.name + " gia nhập " + g.name + "!", "recruit");
        }
      });
    }

    if (Math.random() < 0.1) save();
  };

  // ─── Render Panel ───
  window.guildV29RenderPanel = function() {
    var el = document.getElementById("panel-guild-v29");
    if (!el) return;
    var curYear = window.year || 0;
    var hasGuild = window.guildV29Data.guilds.length > 0;

    var html = '<div style="padding:14px;max-width:900px;margin:0 auto;">';
    html += '<h2 style="color:#60a5fa;text-align:center;font-size:20px;margin-bottom:16px;">🏛 HỆ THỐNG BANG HỘI V29</h2>';

    // Create guild form
    if (!hasGuild) {
      html += '<div style="background:rgba(96,165,250,0.08);border:1px solid #60a5fa44;border-radius:12px;padding:20px;margin-bottom:20px;">';
      html += '<h3 style="color:#60a5fa;margin-bottom:14px;">✨ Thành Lập Bang Hội</h3>';
      html += '<input id="gv29-name" placeholder="Tên bang hội..." style="width:100%;padding:10px;background:rgba(0,0,0,0.3);border:1px solid #ffffff22;border-radius:8px;color:#e2e8f0;font-size:14px;margin-bottom:12px;box-sizing:border-box;">';
      html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:14px;">';
      Object.keys(GUILD_TYPES).forEach(function(k) {
        var gt = GUILD_TYPES[k];
        html += '<label style="background:rgba(0,0,0,0.2);border:1px solid ' + gt.color + '33;border-radius:8px;padding:10px;cursor:pointer;display:flex;gap:8px;align-items:flex-start;">';
        html += '<input type="radio" name="gv29type" value="' + k + '" style="margin-top:3px;">';
        html += '<div><div style="color:' + gt.color + ';font-weight:600;">' + gt.icon + ' ' + gt.name + '</div>';
        html += '<div style="color:#64748b;font-size:11px;">' + gt.desc + '</div>';
        html += '<div style="color:#475569;font-size:10px;margin-top:3px;">' + gt.bonus + '</div></div>';
        html += '</label>';
      });
      html += '</div>';
      html += '<button onclick="(function(){var n=document.getElementById(\'gv29-name\').value,t=document.querySelector(\'input[name=gv29type]:checked\');if(!t){if(typeof toast===\'function\')toast(\'⚠️ Chọn loại bang hội!\');return;}window.guildV29Create(n,t.value);window.guildV29RenderPanel();})()" style="width:100%;padding:12px;background:#60a5fa;border:none;border-radius:8px;color:#0f172a;font-weight:700;font-size:14px;cursor:pointer;">🏛 Thành Lập Bang Hội</button>';
      html += '</div>';
    }

    // Guild list
    if (hasGuild) {
      html += '<div style="display:grid;gap:16px;">';
      window.guildV29Data.guilds.forEach(function(g) {
        var gt = GUILD_TYPES[g.type] || GUILD_TYPES["bangHoi"];
        var gRank = GUILD_RANKS[g.level] || GUILD_RANKS[0];
        var isPlayer = g.id === window.guildV29Data.playerGuildId;
        var activeMiss = window.guildV29Data.activeMissions.filter(function(am) { return am.guildId === g.id; });

        html += '<div style="background:rgba(0,0,0,0.3);border:1px solid ' + gt.color + (isPlayer ? "88" : "33") + ';border-radius:12px;padding:16px;">';

        // Header
        html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">';
        html += '<div style="display:flex;align-items:center;gap:10px;">';
        html += '<span style="font-size:24px;">' + gt.icon + '</span>';
        html += '<div><div style="color:' + gt.color + ';font-weight:700;font-size:16px;">' + _esc(g.name) + (isPlayer ? ' <span style="font-size:11px;color:#4ade80;">[Của bạn]</span>' : '') + '</div>';
        html += '<div style="color:#64748b;font-size:12px;">' + gt.name + ' · ' + gRank.icon + ' ' + gRank.name + '</div></div>';
        html += '</div>';
        html += '<div style="text-align:right;font-size:12px;color:#94a3b8;">Năm thành lập: ' + g.founded + '</div>';
        html += '</div>';

        // Stats grid
        html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px;">';
        html += _gStat("👥", "Thành Viên", g.npcMembers.length, gt.color);
        html += _gStat("💰", "Ngân Quỹ", Math.floor(g.treasury) + "g", "#fde68a");
        html += _gStat("⭐", "Danh Tiếng", Math.floor(g.reputation), "#f0abfc");
        html += _gStat("🌐", "Ảnh Hưởng", Math.floor(g.influence), "#60a5fa");
        html += '</div>';

        // Bonus
        html += '<div style="font-size:11px;color:#4ade80;margin-bottom:10px;">⚡ ' + gt.bonus + '</div>';

        // Active missions
        if (activeMiss.length) {
          html += '<div style="font-size:12px;color:#94a3b8;margin-bottom:8px;">📋 Nhiệm vụ đang thực hiện (' + activeMiss.length + '):</div>';
          activeMiss.forEach(function(am) {
            var m = GUILD_MISSIONS.find(function(x) { return x.id === am.missionId; });
            if (!m) return;
            var remaining = am.endYear - curYear;
            html += '<div style="background:rgba(255,255,255,0.05);padding:6px 10px;border-radius:6px;margin-bottom:4px;font-size:12px;">';
            html += '🔄 ' + _esc(m.name) + ' <span style="color:#64748b;">— còn ' + Math.max(0, remaining) + ' năm</span>';
            html += '</div>';
          });
        }

        // Mission buttons
        if (isPlayer) {
          html += '<div style="margin-top:10px;">';
          html += '<div style="color:#64748b;font-size:11px;margin-bottom:6px;">Nhận nhiệm vụ mới:</div>';
          html += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
          GUILD_MISSIONS.forEach(function(m) {
            var canDo = g.level >= m.minLevel && activeMiss.length < 3;
            html += '<button ' + (canDo ? 'onclick="window.guildV29AcceptMission(\'' + m.id + '\');window.guildV29RenderPanel();"' : 'disabled') + ' style="background:rgba(255,255,255,0.05);border:1px solid ' + (canDo ? gt.color + "55" : "#33333388") + ';color:' + (canDo ? "#e2e8f0" : "#475569") + ';padding:5px 10px;border-radius:6px;font-size:11px;cursor:' + (canDo ? "pointer" : "default") + ';">';
            html += m.name + ' <span style="color:#4ade80;">+' + m.reward.gold + 'g</span></button>';
          });
          html += '</div></div>';
        }
        html += '</div>';
      });
      html += '</div>';

      // Add another guild button
      html += '<div style="text-align:center;margin-top:14px;">';
      html += '<button onclick="window.guildV29Data.guilds=[];window.guildV29Data.playerGuildId=null;window.guildV29RenderPanel();" style="background:rgba(255,255,255,0.05);border:1px solid #ffffff22;color:#94a3b8;padding:8px 18px;border-radius:8px;cursor:pointer;font-size:12px;">🔄 Giải Tán & Tạo Mới</button>';
      html += '</div>';
    }

    // Stats
    html += '<div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">';
    html += _statBox("📋", "Nhiệm Vụ Hoàn Thành", window.guildV29Data.stats.missionsCompleted, "#4ade80");
    html += _statBox("💰", "Tổng Vàng Kiếm Được", window.guildV29Data.stats.totalGold + "g", "#fde68a");
    html += _statBox("⭐", "Tổng XP Nhận", window.guildV29Data.stats.totalXP, "#a78bfa");
    html += '</div>';

    // Log
    if (window.guildV29Data.log.length) {
      html += '<div style="margin-top:16px;">';
      html += '<h3 style="color:#64748b;font-size:13px;margin-bottom:6px;">📋 Nhật Ký Bang Hội</h3>';
      html += '<div style="max-height:150px;overflow-y:auto;">';
      window.guildV29Data.log.slice(0, 20).forEach(function(entry) {
        var c = entry.type === "success" ? "#4ade80" : entry.type === "fail" ? "#f87171" : entry.type === "levelup" ? "#fde68a" : "#cbd5e1";
        html += '<div style="font-size:12px;color:' + c + ';padding:3px 8px;border-left:2px solid ' + c + '44;margin-bottom:2px;">';
        html += '<span style="color:#475569;font-size:10px;">Năm ' + entry.year + '</span> ' + _esc(entry.msg);
        html += '</div>';
      });
      html += '</div></div>';
    }

    html += '</div>';
    el.innerHTML = html;
  };

  function _gStat(icon, label, value, color) {
    return '<div style="background:rgba(0,0,0,0.2);border-radius:6px;padding:8px;text-align:center;">'
         + '<div style="color:' + color + ';font-weight:700;">' + value + '</div>'
         + '<div style="color:#64748b;font-size:10px;">' + icon + ' ' + label + '</div>'
         + '</div>';
  }

  function _statBox(icon, label, value, color) {
    return '<div style="background:rgba(0,0,0,0.3);border:1px solid ' + color + '44;border-radius:8px;padding:10px 14px;flex:1;min-width:120px;">'
         + '<div style="font-size:16px;">' + icon + '</div>'
         + '<div style="color:' + color + ';font-size:16px;font-weight:700;">' + value + '</div>'
         + '<div style="color:#64748b;font-size:11px;">' + label + '</div>'
         + '</div>';
  }

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      if (Math.random() < 0.2) window.guildV29Tick();
    };
    console.log("[GuildEngineV29] 🏛 Bang Hội V29 khởi động — 4 loại tổ chức · " + GUILD_MISSIONS.length + " nhiệm vụ · Tự động chiêu mộ NPC.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 3000); });
  } else {
    setTimeout(init, 3000);
  }
})();
