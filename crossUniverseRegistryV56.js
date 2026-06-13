(function() {
  "use strict";

  function getYear() { return (typeof window.year === "number") ? window.year : 0; }
  function pct(v) { return Math.max(0, Math.min(100, Math.round(v))); }
  function fmtNum(n) { return (n || 0).toLocaleString(); }

  function _card(label, value, bg, border) {
    return '<div style="background:' + (bg || "#0d0d1a") + ';border-radius:8px;padding:10px;text-align:center;border:1px solid ' + (border || "#333") + ';">' +
      '<div style="color:#888;font-size:0.78em;">' + label + '</div>' +
      '<div style="color:#e0e0e0;font-weight:bold;font-size:1.05em;margin-top:4px;">' + value + '</div></div>';
  }

  function _section(title, items, emptyMsg) {
    return '<div style="margin-bottom:14px;background:#0d0d1a;border-radius:8px;padding:12px;">' +
      '<div style="color:#9b59b6;font-weight:bold;margin-bottom:8px;">' + title + '</div>' +
      (items.length === 0 ? '<div style="color:#888;font-size:0.85em;">' + (emptyMsg || "Chưa có dữ liệu") + '</div>' :
      items.map(function(i) { return '<div style="color:#ccc;font-size:0.85em;padding:3px 0;">• ' + i + '</div>'; }).join('')) + '</div>';
  }

  window.cur56RenderGates = function() {
    var el = document.getElementById("panel-cx-gates-v56");
    if (!el) return;
    var gates = (typeof window.g56GetPlayerGates === "function") ? window.g56GetPlayerGates() : [];
    var stats = (typeof window.g56GetStats === "function") ? window.g56GetStats() : {};
    var gateData = (typeof window.gateV56Data !== "undefined") ? window.gateV56Data : {};

    el.innerHTML = '<div style="padding:16px;font-family:serif;color:#e0e0e0;">' +
      '<h2 style="color:#3498db;text-align:center;margin-bottom:12px;">🌀 Cổng Liên Vũ Trụ</h2>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;">' +
      _card("🌀 Tổng Cổng", (stats.totalGates || 0), "#0d1a2e", "#3498db") +
      _card("✅ Đang Mở", (stats.openGates || 0), "#0d1a0d", "#2ecc71") +
      _card("💰 Tổng Toll", fmtNum(stats.totalToll), "#1a0d00", "#f39c12") +
      '</div>' +
      '<div style="background:#1a1a2e;border-radius:8px;padding:10px;margin-bottom:12px;">' +
      '<div style="color:#3498db;font-weight:bold;margin-bottom:8px;">🛠️ Xây Cổng Mới</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
      [1,2,3,4].map(function(tier) {
        var tiers = [null, {n:"Sơ Khai",c:5000}, {n:"Bạc",c:20000}, {n:"Vàng",c:80000}, {n:"Thần",c:500000}];
        var t = tiers[tier];
        return '<button onclick="var r=window.g56BuildGate(\'default\',\'universe_'+tier+'\','+tier+');alert(r.msg);window.cur56RenderGates();" ' +
          'style="padding:8px;background:#1a2a3a;color:#ccc;border:1px solid #3498db;border-radius:6px;cursor:pointer;font-size:0.8em;">' +
          'Cấp ' + tier + ': ' + (t ? t.n : "") + '<br><span style="color:#f39c12;">' + (t ? fmtNum(t.c) : 0) + ' vàng</span></button>';
      }).join('') +
      '</div></div>' +
      (gates.length === 0 ? '<div style="color:#888;text-align:center;padding:20px;">Chưa có cổng nào · Xây dựng cổng đầu tiên!</div>' :
      gates.map(function(g) {
        var stabColor = g.stability >= 70 ? "#2ecc71" : g.stability >= 40 ? "#f39c12" : "#e74c3c";
        return '<div style="background:#0d0d1a;border-radius:8px;padding:12px;margin-bottom:8px;border-left:3px solid ' + stabColor + ';">' +
          '<div style="display:flex;justify-content:space-between;">' +
          '<span style="color:#e0e0e0;font-weight:bold;">' + (g.tierIcon || "🌀") + ' ' + g.tierName + ' — ' + g.fromName + ' → ' + g.toName + '</span>' +
          '<span style="color:' + stabColor + ';">' + Math.round(g.stability) + '% ổn định</span></div>' +
          '<div style="display:flex;gap:16px;margin-top:6px;color:#aaa;font-size:0.85em;">' +
          '<span>💰 ' + fmtNum(g.totalRevenue) + ' thu nhập</span>' +
          '<span>👤 ' + (g.activeTravelers || 0) + ' du khách</span>' +
          '<span>' + (g.isOpen ? "🟢 Mở" : "🔴 Đóng") + '</span></div>' +
          '<div style="margin-top:6px;display:flex;gap:6px;">' +
          '<button onclick="var r=window.g56UpgradeGate(\'' + g.id + '\');alert(r.msg);window.cur56RenderGates();" style="background:#3498db;color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:0.78em;">⬆️ Nâng Cấp</button>' +
          '<button onclick="var r=window.g56CloseGate(\'' + g.id + '\');alert(r.msg);window.cur56RenderGates();" style="background:#e74c3c;color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:0.78em;">🔒 Đóng</button></div></div>';
      }).join('')) +
      (gateData.gateEvents && gateData.gateEvents.length > 0 ? _section("⚡ Sự Kiện Cổng", gateData.gateEvents.slice(0,5).map(function(e) { return "Năm " + e.year + " · " + e.icon + " " + e.event + " (" + e.gateName + ")"; })) : "") +
      '</div>';
  };

  window.cur56RenderExploration = function() {
    var el = document.getElementById("panel-cx-explore-v56");
    if (!el) return;
    var stats = (typeof window.exp56GetStats === "function") ? window.exp56GetStats() : {};
    var discoveries = (typeof window.exp56GetDiscoveries === "function") ? window.exp56GetDiscoveries(15) : [];
    var activeMissions = (typeof window.exp56GetMissions === "function") ? window.exp56GetMissions() : [];
    var jarvis = (typeof window.exp56GetJarvisReport === "function") ? window.exp56GetJarvisReport() : "";

    el.innerHTML = '<div style="padding:16px;font-family:serif;color:#e0e0e0;">' +
      '<h2 style="color:#f39c12;text-align:center;margin-bottom:12px;">🔭 Khám Phá Vũ Trụ</h2>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;">' +
      _card("💎 Điểm KP", fmtNum(stats.points), "#0d0d1a", "#f39c12") +
      _card("🌌 Vũ Trụ Khám", (stats.exploredUniverses || 0), "#0d0d1a", "#3498db") +
      _card("✅ NV Thành Công", (stats.successMissions || 0) + "/" + (stats.totalMissions || 0), "#0d0d1a", "#2ecc71") +
      _card("🔍 Phát Hiện", (stats.discoveries || 0), "#0d0d1a", "#9b59b6") +
      '</div>' +
      '<div style="background:#1a1000;border-radius:8px;padding:12px;margin-bottom:14px;">' +
      '<div style="color:#f39c12;font-weight:bold;margin-bottom:8px;">🚀 Phái Nhiệm Vụ Thám Hiểm</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
      [
        {id:"scout",n:"🔭 Trinh Sát",d:10,c:100},
        {id:"survey",n:"📡 Khảo Sát",d:30,c:500},
        {id:"deep",n:"🌊 Thám Hiểm Sâu",d:60,c:2000},
        {id:"void",n:"⬛ Khoảng Trống",d:100,c:10000}
      ].map(function(m) {
        return '<button onclick="var r=window.exp56StartMission(\'' + m.id + '\',\'universe_\'+Math.floor(Math.random()*99));alert(r.msg);window.cur56RenderExploration();" ' +
          'style="padding:8px;background:#1a1000;color:#ccc;border:1px solid #f39c12;border-radius:6px;cursor:pointer;font-size:0.78em;text-align:left;">' +
          m.n + '<br><span style="color:#aaa;">' + m.d + ' năm · ' + fmtNum(m.c) + ' 🪙</span></button>';
      }).join('') + '</div>' +
      (activeMissions.length > 0 ? '<div style="margin-top:8px;color:#2ecc71;font-size:0.85em;">🔄 Đang chạy: ' + activeMissions.map(function(m) { return m.missionName + " (kết thúc năm " + m.endYear + ")"; }).join(", ") + '</div>' : "") +
      '</div>' +
      (discoveries.length > 0 ? '<div style="color:#f39c12;font-weight:bold;margin-bottom:8px;">💎 Phát Hiện Mới Nhất</div>' +
      discoveries.map(function(d) {
        var rarColor = d.rarity === "epic" ? "#9b59b6" : d.rarity === "rare" ? "#e74c3c" : d.rarity === "uncommon" ? "#3498db" : "#2ecc71";
        return '<div style="padding:8px;margin-bottom:6px;background:#0d0d1a;border-radius:6px;border-left:3px solid ' + rarColor + ';">' +
          '<div style="display:flex;gap:8px;">' +
          '<span style="font-size:1.3em;">' + d.icon + '</span>' +
          '<div><div style="color:#e0e0e0;font-size:0.9em;">' + d.name + ' <span style="color:' + rarColor + ';">[' + d.rarity + ']</span></div>' +
          '<div style="color:#aaa;font-size:0.8em;">' + d.reward + '</div></div></div></div>';
      }).join('') : '<div style="color:#888;text-align:center;padding:20px;">Chưa có phát hiện nào · Phái nhiệm vụ để khám phá!</div>') +
      '</div>';
  };

  window.cur56RenderColonies = function() {
    var el = document.getElementById("panel-cx-colonies-v56");
    if (!el) return;
    var cols = (typeof window.col56GetPlayerColonies === "function") ? window.col56GetPlayerColonies() : [];
    var stats = (typeof window.col56GetStats === "function") ? window.col56GetStats() : {};
    var events = (typeof window.col56GetRecentEvents === "function") ? window.col56GetRecentEvents(5) : [];
    var aicols = (typeof window.colonyV56Data !== "undefined") ? (window.colonyV56Data.aiColonies || []) : [];

    el.innerHTML = '<div style="padding:16px;font-family:serif;color:#e0e0e0;">' +
      '<h2 style="color:#2ecc71;text-align:center;margin-bottom:12px;">🏕️ Thuộc Địa Liên Vũ Trụ</h2>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;">' +
      _card("🏕️ Thuộc Địa", (stats.totalColonies || 0), "#0d1a0d", "#2ecc71") +
      _card("💰 Thu Nhập", fmtNum(stats.netIncome) + "/tick", "#0d1a00", "#f39c12") +
      _card("👥 Dân Số", fmtNum(stats.totalPopulation), "#0d0d1a", "#3498db") +
      '</div>' +
      '<div style="background:#0d1a0d;border-radius:8px;padding:12px;margin-bottom:14px;">' +
      '<div style="color:#2ecc71;font-weight:bold;margin-bottom:8px;">🌱 Thành Lập Thuộc Địa Mới</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">' +
      [
        {id:"outpost",n:"🏕️ Tiền Đồn",c:2000},
        {id:"settlement",n:"🏘️ Khu Định Cư",c:10000},
        {id:"colony",n:"🏙️ Thuộc Địa",c:50000}
      ].map(function(ct) {
        return '<button onclick="var nm=prompt(\'Tên thuộc địa:\');if(nm){var r=window.col56FoundColony(\'universe_\'+Date.now(),\'Vũ Trụ Mới\',\'' + ct.id + '\',nm);alert(r.msg);window.cur56RenderColonies();}" ' +
          'style="padding:8px;background:#0a1a0a;color:#ccc;border:1px solid #2ecc71;border-radius:6px;cursor:pointer;font-size:0.78em;">' +
          ct.n + '<br><span style="color:#aaa;">' + fmtNum(ct.c) + ' 🪙</span></button>';
      }).join('') + '</div></div>' +
      (cols.length === 0 ? '<div style="color:#888;text-align:center;padding:20px;">Chưa có thuộc địa · Thành lập thuộc địa đầu tiên!</div>' :
      cols.map(function(c) {
        var stabColor = c.stability >= 70 ? "#2ecc71" : c.stability >= 40 ? "#f39c12" : "#e74c3c";
        return '<div style="background:#0d0d1a;border-radius:8px;padding:12px;margin-bottom:8px;border-left:3px solid ' + stabColor + ';">' +
          '<div style="font-weight:bold;">' + c.typeName + ': ' + c.name + '</div>' +
          '<div style="color:#aaa;font-size:0.85em;margin-top:4px;">📍 ' + c.universeName + ' · 👥 ' + fmtNum(c.population) + ' dân · 💰 ' + fmtNum(c.income) + '/tick</div>' +
          '<div style="color:#aaa;font-size:0.85em;">Ổn định: <span style="color:' + stabColor + ';">' + Math.round(c.stability) + '%</span> · Tổng TN: ' + fmtNum(c.totalIncome) + '</div>' +
          '<button onclick="var r=window.col56UpgradeColony(\'' + c.id + '\');alert(r.msg);window.cur56RenderColonies();" style="margin-top:6px;background:#2ecc71;color:#000;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:0.78em;">⬆️ Nâng Cấp</button></div>';
      }).join('')) +
      (aicols.length > 0 ? _section("🤖 Thuộc Địa AI (" + aicols.length + ")", aicols.slice(0,5).map(function(c) { return c.owner + ": " + c.typeName + " tại " + c.universeName; })) : "") +
      (events.length > 0 ? _section("📋 Sự Kiện Gần Đây", events.map(function(e) { return "Năm " + e.year + " · " + e.icon + " " + e.event + " · " + e.colonyName; })) : "") +
      '</div>';
  };

  window.cur56RenderDiplomacy = function() {
    var el = document.getElementById("panel-cx-diplomacy-v56");
    if (!el) return;
    var rels = (typeof window.dip56GetRelations === "function") ? window.dip56GetRelations() : [];
    var treaties = (typeof window.dip56GetTreaties === "function") ? window.dip56GetTreaties() : [];
    var stats = (typeof window.dip56GetStats === "function") ? window.dip56GetStats() : {};
    var events = (typeof window.diplomacyV56Data !== "undefined") ? (window.diplomacyV56Data.diplomaticEvents || []) : [];
    var jarvis = (typeof window.dip56GetJarvisReport === "function") ? window.dip56GetJarvisReport() : "";
    var TTYPES = ["nonAggression","trade","alliance","federation"];

    el.innerHTML = '<div style="padding:16px;font-family:serif;color:#e0e0e0;">' +
      '<h2 style="color:#e67e22;text-align:center;margin-bottom:12px;">🌐 Ngoại Giao Đa Vũ Trụ</h2>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;">' +
      _card("🟢 Thân Thiện", (stats.friendly || 0), "#0d1a0d", "#2ecc71") +
      _card("🟡 Trung Lập", (stats.neutral || 0), "#1a1a00", "#f39c12") +
      _card("🔴 Thù Địch", (stats.hostile || 0), "#1a0d0d", "#e74c3c") +
      _card("📜 Hiệp Ước", (stats.activeTreaties || 0), "#0d0d1a", "#9b59b6") +
      '</div>' +
      (jarvis ? '<div style="background:#1a0d00;border-radius:8px;padding:12px;margin-bottom:12px;border-left:3px solid #e67e22;white-space:pre-line;font-size:0.85em;">' + jarvis + '</div>' : "") +
      rels.map(function(r) {
        var scoreColor = r.score >= 30 ? "#2ecc71" : r.score >= -29 ? "#f39c12" : "#e74c3c";
        var barPct = pct((r.score + 100) / 2);
        return '<div style="background:#0d0d1a;border-radius:8px;padding:12px;margin-bottom:8px;">' +
          '<div style="display:flex;justify-content:space-between;margin-bottom:6px;">' +
          '<span style="font-weight:bold;">' + r.icon + ' ' + r.name + '</span>' +
          '<span style="color:' + scoreColor + ';">' + r.score + '/100</span></div>' +
          '<div style="height:4px;background:#1a1a2e;border-radius:2px;margin-bottom:8px;">' +
          '<div style="height:100%;width:' + barPct + '%;background:' + scoreColor + ';border-radius:2px;"></div></div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:4px;">' +
          TTYPES.map(function(tid) {
            var names = {nonAggression:"📜 BXP",trade:"💹 TM",alliance:"🤝 LM",federation:"⭐ LB"};
            return '<button onclick="var r=window.dip56ProposeTreaty(\'' + r.factionId + '\',\'' + tid + '\');alert(r.msg);window.cur56RenderDiplomacy();" ' +
              'style="padding:4px 6px;background:#1a1a2e;color:#ccc;border:1px solid #e67e22;border-radius:4px;cursor:pointer;font-size:0.72em;">' + names[tid] + '</button>';
          }).join('') +
          '<button onclick="var r=window.dip56DeclareHostility(\'' + r.factionId + '\');alert(r.msg);window.cur56RenderDiplomacy();" ' +
          'style="padding:4px 6px;background:#1a0d0d;color:#e74c3c;border:1px solid #e74c3c;border-radius:4px;cursor:pointer;font-size:0.72em;">⚔️ Thù Địch</button>' +
          '<button onclick="window.dip56ImproveRelation(\'' + r.factionId + '\',10);window.cur56RenderDiplomacy();" ' +
          'style="padding:4px 6px;background:#0d1a0d;color:#2ecc71;border:1px solid #2ecc71;border-radius:4px;cursor:pointer;font-size:0.72em;">🎁 Tặng Quà</button>' +
          '</div></div>';
      }).join('') +
      (events.length > 0 ? _section("📋 Sự Kiện Ngoại Giao", events.slice(0,5).map(function(e) { return "Năm " + e.year + " · " + e.icon + " " + e.msg; })) : "") +
      '</div>';
  };

  window.cur56RenderPassport = function() {
    var el = document.getElementById("panel-cx-passport-v56");
    if (!el) return;
    var profile = (typeof window.pass56GetProfile === "function") ? window.pass56GetProfile() : {};
    var travelLog = (typeof window.pass56GetTravelLog === "function") ? window.pass56GetTravelLog(10) : [];
    var VTYPES = [{id:"tourist",n:"🎒 Du Lịch",c:100},{id:"merchant",n:"💹 Thương Nhân",c:500},{id:"diplomat",n:"📜 Ngoại Giao",c:2000},{id:"conqueror",n:"⚔️ Chinh Phục",c:10000}];

    el.innerHTML = '<div style="padding:16px;font-family:serif;color:#e0e0e0;">' +
      '<h2 style="color:#9b59b6;text-align:center;margin-bottom:12px;">🛂 Chứng Minh Thư Vũ Trụ</h2>' +
      '<div style="background:#1a0d2e;border-radius:10px;padding:16px;text-align:center;margin-bottom:14px;border:2px solid #9b59b6;">' +
      '<div style="font-size:2.5em;">' + (profile.rankIcon || "🟤") + '</div>' +
      '<div style="font-size:1.3em;font-weight:bold;color:#9b59b6;margin:6px 0;">' + (profile.rankName || "Lữ Hành Giả") + '</div>' +
      '<div style="color:#aaa;font-size:0.85em;">Cấp bậc: ' + (profile.rank || 1) + '/5 · Danh tiếng: ' + (profile.reputation || 0) + '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px;">' +
      _card("🚀 Chuyến Đi", (profile.totalTravels || 0)) +
      _card("🌌 Vũ Trụ Thăm", (profile.visitedUniverses || 0)) +
      _card("🛤️ Tuyến Mở", (profile.unlockedRoutes || 0)) +
      '</div></div>' +
      (profile.activeVisa ? '<div style="background:#0d1a0d;border-radius:8px;padding:10px;margin-bottom:12px;border:1px solid #2ecc71;">' +
        '<div style="color:#2ecc71;font-weight:bold;">✅ Visa Hiện Tại: ' + profile.activeVisa.typeName + '</div>' +
        '<div style="color:#aaa;font-size:0.85em;">Hết hạn năm: ' + profile.activeVisa.expiresYear + '</div></div>' :
        '<div style="background:#1a0d0d;border-radius:8px;padding:10px;margin-bottom:12px;border:1px solid #e74c3c;">' +
        '<div style="color:#e74c3c;">❌ Không có Visa · Không thể du hành!</div></div>') +
      '<div style="background:#0d0d1a;border-radius:8px;padding:12px;margin-bottom:12px;">' +
      '<div style="color:#9b59b6;font-weight:bold;margin-bottom:8px;">🗂️ Xin Visa Mới</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">' +
      VTYPES.map(function(v) {
        return '<button onclick="var r=window.pass56GetVisa(\'' + v.id + '\');alert(r.msg);window.cur56RenderPassport();" ' +
          'style="padding:8px;background:#0d0d2e;color:#ccc;border:1px solid #9b59b6;border-radius:6px;cursor:pointer;font-size:0.78em;">' +
          v.n + '<br><span style="color:#aaa;">' + fmtNum(v.c) + ' 🪙</span></button>';
      }).join('') + '</div></div>' +
      '<div style="background:#0d0d1a;border-radius:8px;padding:12px;margin-bottom:10px;">' +
      '<div style="color:#9b59b6;font-weight:bold;margin-bottom:8px;">🚀 Du Hành Nhanh</div>' +
      '<div style="display:flex;gap:8px;">' +
      '<input id="cx56-dest" placeholder="ID hoặc tên vũ trụ..." style="flex:1;padding:8px;background:#1a1a2e;border:1px solid #9b59b6;border-radius:6px;color:#fff;font-size:0.85em;">' +
      '<button onclick="var dest=document.getElementById(\'cx56-dest\').value||\'universe_\'+Date.now();var r=window.pass56Travel(dest,dest);alert(r.msg);window.cur56RenderPassport();" ' +
      'style="background:#9b59b6;color:#fff;border:none;padding:8px 14px;border-radius:6px;cursor:pointer;">🚀 Đi</button></div></div>' +
      (travelLog.length > 0 ? _section("📋 Nhật Ký Du Hành", travelLog.map(function(l) { return "Năm " + l.year + " → " + l.toName + " [" + l.visaType + "]"; })) : "") +
      '</div>';
  };

  window.cur56RenderMap = function() {
    var el = document.getElementById("panel-cx-map-v56");
    if (!el) return;
    var passData = (typeof window.passportV56Data !== "undefined") ? window.passportV56Data : {};
    var gateData = (typeof window.gateV56Data !== "undefined") ? window.gateV56Data : {};
    var expData  = (typeof window.explorationV56Data !== "undefined") ? window.explorationV56Data : {};
    var colData  = (typeof window.colonyV56Data !== "undefined") ? window.colonyV56Data : {};
    var dipData  = (typeof window.diplomacyV56Data !== "undefined") ? window.diplomacyV56Data : {};

    var nodes = [{ id: "home", name: "🏠 Vũ Trụ Chính", x: 50, y: 50, color: "#3498db", size: 20 }];
    var visited = passData.visitedUniverses || [];
    var explored = expData.exploredUniverses || [];
    var allUids = Array.from(new Set(visited.concat(explored)));
    var rnd = function(seed) { var x = Math.sin(seed++) * 10000; return x - Math.floor(x); };
    allUids.slice(0, 15).forEach(function(uid, i) {
      var angle = (i / 15) * Math.PI * 2;
      var dist = 25 + rnd(i * 17) * 15;
      nodes.push({ id: uid, name: "🌌 " + uid.replace("universe_","VT-"), x: 50 + Math.cos(angle)*dist, y: 50 + Math.sin(angle)*dist, color: "#9b59b6", size: 10 });
    });

    var svgNodes = nodes.map(function(n) {
      return '<circle cx="' + n.x + '%" cy="' + n.y + '%" r="' + (n.size/2) + '" fill="' + n.color + '" stroke="#fff" stroke-width="0.5" opacity="0.85"/>' +
        '<text x="' + n.x + '%" y="calc(' + n.y + '% + 14px)" text-anchor="middle" fill="#e0e0e0" font-size="7" font-family="serif">' + n.name.substring(0,10) + '</text>';
    }).join('');

    var gates = gateData.playerGates || [];
    var svgGates = gates.map(function(g, i) {
      var n1 = nodes[0]; var n2 = nodes[(i % (nodes.length - 1)) + 1] || nodes[0];
      return '<line x1="' + n1.x + '%" y1="' + n1.y + '%" x2="' + n2.x + '%" y2="' + n2.y + '%" stroke="#3498db" stroke-width="1" stroke-dasharray="3,2" opacity="0.6"/>';
    }).join('');

    el.innerHTML = '<div style="padding:16px;font-family:serif;color:#e0e0e0;">' +
      '<h2 style="color:#3498db;text-align:center;margin-bottom:12px;">🗺️ Bản Đồ Đa Vũ Trụ</h2>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;">' +
      _card("🌌 Đã Thăm", visited.length, "#0d0d1a", "#9b59b6") +
      _card("🔭 Đã Khám", explored.length, "#0d0d1a", "#f39c12") +
      _card("🌀 Cổng", gateData.playerGates ? gateData.playerGates.length : 0, "#0d0d1a", "#3498db") +
      _card("🏕️ Thuộc Địa", colData.playerColonies ? colData.playerColonies.length : 0, "#0d0d1a", "#2ecc71") +
      '</div>' +
      '<div style="background:#050510;border-radius:10px;overflow:hidden;position:relative;height:280px;border:1px solid #3498db;">' +
      '<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">' +
      '<rect width="100" height="100" fill="#050510"/>' +
      [0,1,2,3,4].map(function(i) { return '<circle cx="50" cy="50" r="' + (i*10+5) + '" fill="none" stroke="#1a1a3a" stroke-width="0.3"/>'; }).join('') +
      svgGates + svgNodes + '</svg>' +
      '<div style="position:absolute;bottom:8px;left:10px;font-size:0.7em;color:#666;">🔵 Đã thăm · 🟣 Đã khám phá · --- Cổng</div>' +
      '</div>' +
      (allUids.length === 0 ? '<div style="color:#888;text-align:center;padding:16px;margin-top:10px;">Chưa có bản đồ · Hãy khám phá vũ trụ đầu tiên!</div>' : "") +
      '</div>';
  };

  window.crossUniverseV56HubSection = function() {
    var tabs = [
      { id: "cx-gates",     label: "🌀 Cổng",      fn: "cur56RenderGates" },
      { id: "cx-explore",   label: "🔭 Khám Phá",  fn: "cur56RenderExploration" },
      { id: "cx-colonies",  label: "🏕️ Thuộc Địa", fn: "cur56RenderColonies" },
      { id: "cx-diplomacy", label: "🌐 Ngoại Giao", fn: "cur56RenderDiplomacy" },
      { id: "cx-passport",  label: "🛂 Hộ Chiếu",  fn: "cur56RenderPassport" },
      { id: "cx-map",       label: "🗺️ Bản Đồ",    fn: "cur56RenderMap" }
    ];
    return '<div style="display:flex;flex-wrap:wrap;gap:6px;padding:10px;background:#080820;border-bottom:1px solid #3498db;">' +
      tabs.map(function(t) {
        return '<button onclick="window.' + t.fn + '();document.querySelectorAll(\'[data-v56tab]\').forEach(function(p){p.style.display=\'none\'});var pp=document.getElementById(\'panel-' + t.id + '-v56\');if(pp){pp.style.display=\'\'}" ' +
          'style="padding:6px 10px;background:#0d1a2e;color:#ccc;border:1px solid #3498db;border-radius:5px;cursor:pointer;font-size:0.82em;">' + t.label + '</button>';
      }).join('') + '</div>';
  };

  function patchMvHub() {
    var existing = window.mvHubRenderPanel;
    if (!existing) return;
    window.mvHubRenderPanel = function() {
      existing();
      var container = document.getElementById("panel-multiverse-hub-v35");
      if (!container) return;
      var v56Section = document.getElementById("v56-hub-section");
      if (!v56Section) {
        v56Section = document.createElement("div");
        v56Section.id = "v56-hub-section";
        v56Section.style.cssText = "margin-top:16px;border-top:2px solid #3498db;padding-top:12px;";
        v56Section.innerHTML = '<div style="color:#3498db;font-weight:bold;font-size:1.1em;padding:8px 12px;background:#080820;">🌌 V56 — Cross-Universe Travel</div>' + window.crossUniverseV56HubSection();
        container.appendChild(v56Section);
      }
      var panels = ["cx-gates","cx-explore","cx-colonies","cx-diplomacy","cx-passport","cx-map"];
      panels.forEach(function(id) {
        var p = document.getElementById("panel-" + id + "-v56");
        if (p && !container.contains(p)) container.appendChild(p);
      });
      if (typeof window.cur56RenderGates === "function") window.cur56RenderGates();
    };
  }

  function init() {
    patchMvHub();
    console.log("[CrossUniverseRegistryV56] 🌌 Du Hành Liên Vũ Trụ V56 — 6 tabs (Cổng/Khám Phá/Thuộc Địa/Ngoại Giao/Hộ Chiếu/Bản Đồ) trong multiverse-hub-v35 sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 9400); });
  } else { setTimeout(init, 9400); }
})();
