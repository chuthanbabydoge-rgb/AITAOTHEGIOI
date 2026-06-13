(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTIVERSE WAR ANALYTICS V39 — Thống Kê Chiến Tranh Đa Vũ Trụ
  // Rankings: Vũ Trụ · Đế Quốc · Thần Linh · Tông Môn · Chiến Tranh Lịch Sử
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── COLLECT RANKINGS ─────────────────────────────────────────────────────
  function _buildRankings() {
    var rankings = {};

    // 1. Mạnh nhất theo vũ trụ (từ mvData)
    rankings.universes = [];
    if (window.mvData && window.mvData.universes) {
      rankings.universes = window.mvData.universes
        .filter(function(u){ return u.status==="active"; })
        .map(function(u) {
          var wins = (window.mv39WarData && window.mv39WarData.victorBoard && window.mv39WarData.victorBoard[u.id]) || 0;
          var mwWins = (window.mwData && window.mwData.totalVictors && window.mwData.totalVictors[u.id]) || 0;
          return {
            id: u.id, name: u.name, icon: "🌌", type: "universe",
            power: u.power||0, population: u.population||0,
            wins: wins + mwWins, stability: u.stability||0,
            kingdoms: u.kingdoms||0, gods: u.gods||0,
            color: u.typeColor||"#8b5cf6",
          };
        })
        .sort(function(a,b){ return b.power - a.power; });
    }

    // 2. Đế quốc xuyên vũ trụ (từ empireData)
    rankings.empires = [];
    if (window.empireData) {
      var eArr = Array.isArray(window.empireData.empires)
        ? window.empireData.empires
        : Object.values(window.empireData.empires||{});
      rankings.empires = eArr
        .filter(function(e){ return !e.isCollapsed; })
        .map(function(e) {
          return {
            id: e.empireId||e.id, name: e.empireName||e.name||"Đế Chế", icon: "👑", type: "empire",
            power: (e.military||0)+(e.economy||0), military: e.military||0,
            economy: e.economy||0, territories: e.territories||0,
            color: "#8b5cf6",
          };
        })
        .sort(function(a,b){ return b.power - a.power; })
        .slice(0,10);
    }

    // 3. Thần giới mạnh nhất (từ divV30Data)
    rankings.divines = [];
    if (window.divV30Data && window.divV30Data.beings) {
      var bArr = Array.isArray(window.divV30Data.beings)
        ? window.divV30Data.beings
        : Object.values(window.divV30Data.beings||{});
      rankings.divines = bArr
        .map(function(b) {
          return {
            id: b.id, name: b.name||"Thần Linh", icon: "✨", type: "divine",
            power: (b.power||b.divinity||0)*2, domains: (b.domains||[]).join(", ")||"—",
            color: "#fbbf24",
          };
        })
        .sort(function(a,b){ return b.power - a.power; })
        .slice(0,10);
    }

    // 4. Tông môn mạnh nhất (từ sectV29Data)
    rankings.sects = [];
    if (window.sectV29Data && window.sectV29Data.sects) {
      var sArr = Array.isArray(window.sectV29Data.sects)
        ? window.sectV29Data.sects
        : Object.values(window.sectV29Data.sects||{});
      rankings.sects = sArr
        .filter(function(s){ return !s.isDestroyed; })
        .map(function(s) {
          return {
            id: s.id||s.sectId, name: s.name||"Tông Môn", icon: "🏯", type: "sect",
            power: (s.strength||s.power||0)+(s.disciples||0)*2,
            disciples: s.disciples||0, strength: s.strength||s.power||0,
            color: "#a78bfa",
          };
        })
        .sort(function(a,b){ return b.power - a.power; })
        .slice(0,10);
    }

    // 5. Thống kê chiến tranh tổng hợp
    var v35Wars  = (window.mwData  && window.mwData.wars)      ? window.mwData.wars      : [];
    var v39Wars  = (window.mv39WarData && window.mv39WarData.wars) ? window.mv39WarData.wars : [];
    var invasions= (window.mv39InvData && window.mv39InvData.invasions) ? window.mv39InvData.invasions : [];
    var alliances= (window.mvaData  && window.mvaData.alliances) ? window.mvaData.alliances : [];
    var occupied = typeof window.mv39GetOccupied === "function" ? window.mv39GetOccupied() : [];

    rankings.warStats = {
      totalWarsV35:    v35Wars.length,
      totalWarsV39:    v39Wars.length,
      activeWars:      v39Wars.filter(function(w){ return w.status==="ongoing"; }).length
                     + v35Wars.filter(function(w){ return w.status==="ongoing"; }).length,
      totalInvasions:  invasions.length,
      activeInvasions: invasions.filter(function(i){ return i.status==="active"; }).length,
      totalAlliances:  alliances.filter(function(a){ return a.status==="active"; }).length,
      totalOccupied:   occupied.length,
    };

    return rankings;
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  window.mv39StatsRenderPanel = function() {
    var el = document.getElementById("panel-mv-warstats-v39");
    if (!el) return;
    var ranks = _buildRankings();
    var ws    = ranks.warStats;

    function _statCard(val, label, color) {
      return '<div style="background:#0f172a;border:1px solid ' + color + '33;border-radius:8px;padding:10px;text-align:center">'
        + '<div style="font-size:20px;font-weight:700;color:' + color + '">' + val + '</div>'
        + '<div style="font-size:9px;color:#64748b">' + label + '</div>'
        + '</div>';
    }

    function _rankSection(title, icon, color, items, fields) {
      if (items.length===0) return '<div style="color:#475569;font-size:11px;padding:10px">Chưa có dữ liệu.</div>';
      return '<div style="margin-bottom:20px">'
        + '<div style="font-size:13px;color:' + color + ';font-weight:600;margin-bottom:10px;font-family:Cinzel,serif">' + icon + ' ' + title + '</div>'
        + '<div style="display:flex;flex-direction:column;gap:5px">'
        + items.slice(0,8).map(function(item, idx) {
            var fieldHtml = fields.map(function(f) {
              return '<span style="font-size:10px;padding:2px 7px;border-radius:5px;background:' + item.color + '22;color:' + item.color + '">' + f.label + ': ' + (item[f.key]||0) + '</span>';
            }).join("");
            return '<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.05)">'
              + '<span style="font-size:11px;color:#475569;width:20px">' + (idx+1) + '</span>'
              + '<span style="font-size:16px">' + (item.icon||"🏛️") + '</span>'
              + '<div style="flex:1;min-width:0">'
              + '<div style="font-size:12px;color:#e2e8f0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + item.name + '</div>'
              + '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:3px">' + fieldHtml + '</div>'
              + '</div>'
              + '<div style="font-size:15px;font-weight:700;color:' + item.color + '">' + (item.power||0) + '</div>'
              + '</div>';
          }).join("")
        + '</div></div>';
    }

    el.innerHTML = '<div style="padding:20px;font-family:\'Noto Serif SC\',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">'
      + '<div style="margin-bottom:16px"><h3 style="margin:0 0 3px;font-size:18px;color:#fbbf24;font-family:Cinzel,serif">📊 Thống Kê Chiến Tranh Đa Vũ Trụ V39</h3></div>'

      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;margin-bottom:24px">'
      + _statCard(ws.activeWars,    "Chiến Tranh",    "#ef4444")
      + _statCard(ws.activeInvasions,"Xâm Lược",      "#f97316")
      + _statCard(ws.totalAlliances, "Liên Minh",     "#3b82f6")
      + _statCard(ws.totalOccupied,  "Bị Chiếm",      "#dc2626")
      + _statCard(ws.totalWarsV39 + ws.totalWarsV35, "Tổng Chiến Tranh", "#94a3b8")
      + '</div>'

      + _rankSection("Vũ Trụ Mạnh Nhất",  "🌌", "#8b5cf6",  ranks.universes,
          [{ key:"power", label:"Sức Mạnh" }, { key:"wins", label:"Thắng" }, { key:"stability", label:"Ổn Định" }])

      + _rankSection("Đế Quốc Xuyên Vũ Trụ", "👑", "#f59e0b", ranks.empires,
          [{ key:"military", label:"Quân" }, { key:"economy", label:"Kinh Tế" }])

      + _rankSection("Thần Giới Mạnh Nhất",  "✨", "#fbbf24",  ranks.divines,
          [{ key:"power", label:"Thần Lực" }])

      + _rankSection("Tông Môn Xuyên Vũ Trụ","🏯", "#a78bfa",  ranks.sects,
          [{ key:"disciples", label:"Đệ Tử" }, { key:"strength", label:"Sức Mạnh" }])

      + '</div>';
  };

  // ─── INIT (không gameTick — analytics là passive) ─────────────────────────
  function init() {
    console.log("[MultiverseWarAnalytics V39] 📊 Rankings · Thống Kê Chiến Tranh Đa Vũ Trụ sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 6000); });
  } else {
    setTimeout(init, 6000);
  }
})();
