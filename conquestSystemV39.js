(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // CONQUEST SYSTEM V39 — Chiếm Đóng & Bản Đồ Chiến Tranh Đa Vũ Trụ
  // Lãnh Thổ Chiếm Đóng · Kháng Cự · Cống Nạp · Phản Loạn · Bản Đồ SVG
  // ═══════════════════════════════════════════════════════════════════════════

  const SAVE_KEY = "cgv6_mv_conquest_v39";
  const TICK_INTERVAL = 10;

  function defaultData() {
    return {
      territories: [], totalConquests: 0, totalRebellions: 0, tick: 0,
    };
  }

  window.mv39ConqData = window.mv39ConqData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.mv39ConqData)); } catch(e) {} }
  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (raw) { var p = JSON.parse(raw); if (p && p.territories) window.mv39ConqData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  var _ctr = 1;
  function newId() { return "mv39c_" + Date.now() + "_" + (_ctr++); }

  function _notify(msg, icon) {
    if (typeof window.htAddEvent  === "function") window.htAddEvent({ year:window.year||0, type:"mv_conquest", title:msg, color:"#dc2626" });
    if (typeof window.waeAddAlert === "function") window.waeAddAlert({ type:"mv_conquest", icon:icon||"🏴", title:msg, year:window.year||0 });
    if (typeof window.addLog      === "function") window.addLog("[MV-CONQUEST-V39] " + msg);
  }

  // ─── GHI NHẬN CHIẾM ĐÓNG (gọi từ warSystem hoặc invasionSystem) ──────────
  window.mv39RecordConquest = function(obj) {
    var existing = window.mv39ConqData.territories.find(function(t){
      return t.conqueredUid === obj.conqueredUid && t.status === "occupied";
    });
    if (existing) {
      // Cập nhật chủ nhân mới
      existing.conquerorUid  = obj.conquerorUid;
      existing.conquerorName = obj.conquerorName;
      existing.since         = obj.year || window.year||0;
      existing.resistance    = 60;
      save(); return existing;
    }

    var territory = {
      id: newId(),
      conqueredUid:  obj.conqueredUid,  conqueredName:  obj.conqueredName,
      conquerorUid:  obj.conquerorUid,  conquerorName:  obj.conquerorName,
      since:        obj.year || window.year||0,
      resistance:   50 + Math.floor(Math.random()*30),
      tributeRate:  5  + Math.floor(Math.random()*15),
      resourcesExtracted: obj.resourcesAbsorbed || 0,
      territories:  obj.territories || 1,
      warType:      obj.warType || "war",
      status:       "occupied",
      events:       [],
    };

    window.mv39ConqData.territories.push(territory);
    window.mv39ConqData.totalConquests++;
    _notify("🏴 " + obj.conquerorName + " chiếm đóng " + obj.conqueredName + "!", "🏴");
    save();
    return territory;
  };

  // ─── PUBLIC ───────────────────────────────────────────────────────────────
  window.mv39GetTerritories  = function() { return window.mv39ConqData.territories; };
  window.mv39GetOccupied     = function() { return window.mv39ConqData.territories.filter(function(t){ return t.status==="occupied"; }); };

  // ─── RENDER: BẢN ĐỒ CHIẾN TRANH ─────────────────────────────────────────
  window.mv39RenderWarMapPanel = function() {
    var el = document.getElementById("panel-mv-warmap-v39");
    if (!el) return;
    var d          = window.mv39ConqData;
    var occupied   = window.mv39GetOccupied();
    var activeWars = typeof window.mv39GetActiveWars === "function" ? window.mv39GetActiveWars() : [];
    var activeInv  = typeof window.mv39GetActiveInvasions === "function" ? window.mv39GetActiveInvasions() : [];

    // SVG bản đồ đơn giản — nodes là vũ trụ, edges là chiến tranh/xâm lược
    var universes = (window.mvData && window.mvData.universes)
      ? window.mvData.universes.filter(function(u){ return u.status==="active"; })
      : [];

    var svgNodes = "";
    var svgEdges = "";
    var W = 600; var H = 300; var R = 22;
    var positions = {};

    universes.slice(0,12).forEach(function(u, i) {
      var angle  = (i / Math.min(universes.length, 12)) * Math.PI * 2;
      var cx     = W/2 + (W/2-60)*Math.cos(angle);
      var cy     = H/2 + (H/2-50)*Math.sin(angle);
      positions[u.id] = { cx:cx, cy:cy, name:u.name };

      var isOccupied = occupied.find(function(t){ return t.conqueredUid===u.id; });
      var isAttacking = activeWars.find(function(w){ return w.attackerUid===u.id||w.attackerUid===u.id; });
      var fill   = isOccupied ? "#dc262688" : (isAttacking ? "#ef444444" : "#1e293b");
      var stroke = isOccupied ? "#dc2626" : (u.typeColor||"#8b5cf6");

      svgNodes += '<circle cx="' + cx.toFixed(0) + '" cy="' + cy.toFixed(0) + '" r="' + R + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2"/>';
      svgNodes += '<text x="' + cx.toFixed(0) + '" y="' + (cy+5).toFixed(0) + '" text-anchor="middle" fill="#e2e8f0" font-size="7" font-family="Noto Serif SC">' + u.name.slice(0,8) + '</text>';
    });

    // Vẽ đường chiến tranh
    activeWars.slice(0,8).forEach(function(w) {
      var a = positions[w.attackerUid]; var b = positions[w.defenderUid];
      if (!a || !b) return;
      svgEdges += '<line x1="' + a.cx.toFixed(0) + '" y1="' + a.cy.toFixed(0)
        + '" x2="' + b.cx.toFixed(0) + '" y2="' + b.cy.toFixed(0)
        + '" stroke="' + (w.typeColor||"#ef4444") + '" stroke-width="2" stroke-dasharray="4,3" opacity="0.7"/>';
    });

    // Vẽ mũi tên xâm lược
    activeInv.slice(0,5).forEach(function(inv) {
      var a = positions[inv.attackerUid]; var b = positions[inv.targetUid];
      if (!a || !b) return;
      svgEdges += '<line x1="' + a.cx.toFixed(0) + '" y1="' + a.cy.toFixed(0)
        + '" x2="' + b.cx.toFixed(0) + '" y2="' + b.cy.toFixed(0)
        + '" stroke="#f97316" stroke-width="3" opacity="0.9"/>';
    });

    var svgMap = '<svg width="100%" viewBox="0 0 ' + W + ' ' + H + '" style="background:#0a0a1a;border-radius:10px;border:1px solid #1e293b">'
      + svgEdges + svgNodes + '</svg>';

    // Legend
    var legend = '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:8px">'
      + '<div style="display:flex;align-items:center;gap:4px"><div style="width:16px;height:3px;background:#ef4444;border-radius:2px"></div><span style="font-size:10px;color:#94a3b8">Chiến Tranh</span></div>'
      + '<div style="display:flex;align-items:center;gap:4px"><div style="width:16px;height:3px;background:#f97316"></div><span style="font-size:10px;color:#94a3b8">Xâm Lược</span></div>'
      + '<div style="display:flex;align-items:center;gap:4px"><div style="width:12px;height:12px;border-radius:50%;background:#dc262688;border:1px solid #dc2626"></div><span style="font-size:10px;color:#94a3b8">Bị Chiếm</span></div>'
      + '</div>';

    // Danh sách lãnh thổ chiếm đóng
    var terrList = occupied.length===0
      ? '<div style="text-align:center;padding:20px;color:#475569">Chưa có lãnh thổ bị chiếm đóng.</div>'
      : occupied.map(function(t){
          return '<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;background:rgba(220,38,38,0.06);border:1px solid rgba(220,38,38,0.2);margin-bottom:6px">'
            + '<span style="font-size:18px">🏴</span>'
            + '<div style="flex:1">'
            + '<div style="font-size:12px;color:#e2e8f0">' + t.conqueredName + '</div>'
            + '<div style="font-size:10px;color:#94a3b8">Chủ: <span style="color:#fbbf24">' + t.conquerorName + '</span> · Từ năm ' + t.since + '</div>'
            + '</div>'
            + '<div style="text-align:right">'
            + '<div style="font-size:11px;color:#f97316">Cống: ' + t.tributeRate + '%</div>'
            + '<div style="font-size:10px;color:#64748b">Kháng: ' + t.resistance + '</div>'
            + '</div>'
            + '</div>';
        }).join("");

    el.innerHTML = '<div style="padding:20px;font-family:\'Noto Serif SC\',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">'
      + '<div style="margin-bottom:14px"><h3 style="margin:0 0 3px;font-size:18px;color:#dc2626;font-family:Cinzel,serif">🗺️ Bản Đồ Chiến Tranh Đa Vũ Trụ</h3>'
      + '<div style="font-size:11px;color:#475569">' + universes.length + ' vũ trụ · ' + activeWars.length + ' chiến tranh · ' + activeInv.length + ' xâm lược · ' + occupied.length + ' bị chiếm</div></div>'
      + '<div style="margin-bottom:12px">' + (universes.length===0 ? '<div style="padding:40px;text-align:center;color:#475569">Chưa có vũ trụ. Hãy tạo vũ trụ trong tab Multiverse!</div>' : svgMap + legend) + '</div>'
      + '<div><div style="font-size:12px;color:#dc2626;font-weight:600;margin-bottom:10px">🏴 LÃNH THỔ CHIẾM ĐÓNG (' + occupied.length + ')</div>' + terrList + '</div>'
      + '</div>';
  };

  // ─── TICK: Tăng kháng cự, giảm tài nguyên, phản loạn ────────────────────
  function tick() {
    var d = window.mv39ConqData;
    d.tick++;
    if (d.tick % TICK_INTERVAL !== 0) return;

    d.territories.filter(function(t){ return t.status==="occupied"; }).forEach(function(t) {
      // Tăng kháng cự chậm chậm
      t.resistance = Math.min(100, (t.resistance||0) + 0.5 + Math.random()*1);

      // Thu cống
      t.resourcesExtracted = (t.resourcesExtracted||0) + Math.floor(Math.random()*(t.tributeRate||5));

      // Phản loạn khi kháng cự > 90
      if (t.resistance >= 95 && Math.random() < 0.15) {
        t.status = "liberated";
        d.totalRebellions++;
        _notify("⚡ " + t.conqueredName + " nổi dậy chống lại " + t.conquerorName + "!", "⚡");
      }
    });

    if (d.tick % 40 === 0) save();
  }

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); tick(); };
    console.log("[ConquestSystem V39] 🏴 Chiếm Đóng · " + window.mv39GetOccupied().length + " lãnh thổ đang bị chiếm.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 5000); });
  } else {
    setTimeout(init, 5000);
  }
})();
