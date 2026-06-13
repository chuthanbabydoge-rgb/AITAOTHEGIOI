(function() {
  "use strict";
  // Passive — no save key, no gameTick hook

  // ─── Hub Widget (cho mvHubRenderPanel) ──────────────────────────────────
  window.recHubRenderPanel = function() {
    var stats = typeof window.recGetStats === "function" ? window.recGetStats() : { alive:0, extinct:0, totalPop:0, topRace:null };
    var alliances = (window.rreData && window.rreData.alliances) ? window.rreData.alliances.filter(function(a){ return a.active; }).length : 0;
    var activeConflicts = typeof window.rweGetActive === "function" ? window.rweGetActive().length : 0;
    var races = typeof window.recGetAll === "function" ? window.recGetAll().filter(function(r){ return !r.extinct; }) : [];

    var html = '';
    // Stats bar
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px">';
    html += '<div style="background:#0f172a;border:1px solid #34d39944;border-radius:8px;padding:8px 14px;text-align:center"><div style="font-size:18px;font-weight:700;color:#34d399">'+stats.alive+'</div><div style="font-size:9px;color:#64748b">Chủng Tộc</div></div>';
    html += '<div style="background:#0f172a;border:1px solid #60a5fa44;border-radius:8px;padding:8px 14px;text-align:center"><div style="font-size:14px;font-weight:700;color:#60a5fa">'+Math.floor((stats.totalPop||0)/1000)+'K</div><div style="font-size:9px;color:#64748b">Dân Số</div></div>';
    html += '<div style="background:#0f172a;border:1px solid #ef444444;border-radius:8px;padding:8px 14px;text-align:center"><div style="font-size:18px;font-weight:700;color:#ef4444">'+activeConflicts+'</div><div style="font-size:9px;color:#64748b">Xung Đột</div></div>';
    html += '<div style="background:#0f172a;border:1px solid #34d39944;border-radius:8px;padding:8px 14px;text-align:center"><div style="font-size:18px;font-weight:700;color:#34d399">'+alliances+'</div><div style="font-size:9px;color:#64748b">Liên Minh</div></div>';
    html += '</div>';

    // Race icons
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;align-items:center">';
    races.slice(0,8).forEach(function(r) {
      var stage = typeof window.recGetStage === "function" ? window.recGetStage(r.evolutionPoints||0) : { icon:"🌱" };
      html += '<div title="'+r.name+' ['+stage.icon+']" style="text-align:center;cursor:pointer" onclick="showPanel(\'panel-race-overview-v44\');recRenderOverview()">';
      html += '<div style="font-size:22px">'+r.icon+'</div>';
      html += '<div style="font-size:9px;color:#475569">'+stage.icon+'</div>';
      html += '</div>';
    });
    html += '</div>';

    // Top race
    if (stats.topRace) {
      html += '<div style="font-size:11px;color:#64748b;margin-bottom:10px">🏆 Tiến hóa nhất: <span style="color:'+( stats.topRace.color||"#a78bfa")+'">'+stats.topRace.icon+' '+stats.topRace.name+'</span> ('+stats.topRace.evolutionPoints+' EP)</div>';
    }

    // Nav buttons
    html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px">';
    html += '<button onclick="showPanel(\'panel-race-overview-v44\');recRenderOverview()" style="padding:10px;background:#0f172a;border:1px solid #34d39944;border-radius:8px;color:#34d399;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif;text-align:left">🧬 <strong>Tổng Quan</strong><div style="font-size:10px;color:#475569;margin-top:2px">8 chủng tộc · Cards</div></button>';
    html += '<button onclick="showPanel(\'panel-race-evolution-v44\');recRenderEvolution()" style="padding:10px;background:#0f172a;border:1px solid #a78bfa44;border-radius:8px;color:#a78bfa;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif;text-align:left">📈 <strong>Tiến Hóa</strong><div style="font-size:10px;color:#475569;margin-top:2px">Chi tiết · 5 giai đoạn</div></button>';
    html += '<button onclick="showPanel(\'panel-race-abilities-v44\');raeRenderPanel()" style="padding:10px;background:#0f172a;border:1px solid #fbbf2444;border-radius:8px;color:#fbbf24;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif;text-align:left">⚡ <strong>Kỹ Năng</strong><div style="font-size:10px;color:#475569;margin-top:2px">50+ abilities · Mở khóa</div></button>';
    html += '<button onclick="showPanel(\'panel-race-conflicts-v44\');rweRenderPanel()" style="padding:10px;background:#0f172a;border:1px solid #ef444444;border-radius:8px;color:#ef4444;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif;text-align:left">⚔️ <strong>Xung Đột</strong><div style="font-size:10px;color:#475569;margin-top:2px">Chiến tranh · Thống trị</div></button>';
    html += '<button onclick="showPanel(\'panel-race-relations-v44\');rreRenderPanel()" style="padding:10px;background:#0f172a;border:1px solid #60a5fa44;border-radius:8px;color:#60a5fa;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif;text-align:left;grid-column:span 2">🤝 <strong>Quan Hệ Ngoại Giao</strong><div style="font-size:10px;color:#475569;margin-top:2px">Ma trận · Liên minh · Đồng hóa</div></button>';
    html += '</div>';

    return html;
  };

  // ─── Render helpers (proxy cho các panel chính) ───────────────────────────
  window.recRenderOverview = window.recRenderOverview || function() {
    var el = document.getElementById("panel-race-overview-v44");
    if (el) el.innerHTML = '<div style="padding:20px;color:#64748b">Đang tải hệ thống chủng tộc...</div>';
  };

  // ─── Init ────────────────────────────────────────────────────────────────
  function init() {
    console.log("[RaceEvolutionRegistry V44] 📋 Hub UI đã sẵn sàng · 5 sub-panels · widget mvHub loaded.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 3800); });
  } else {
    setTimeout(init, 3800);
  }
})();
