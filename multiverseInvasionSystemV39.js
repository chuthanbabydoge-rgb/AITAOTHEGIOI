(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTIVERSE INVASION SYSTEM V39 — Xâm Lược Liên Vũ Trụ
  // Mở Cổng Xâm Lược · Chiếm Lãnh Thổ · Đồng Hóa Văn Minh · Hấp Thụ Tài Nguyên
  // ═══════════════════════════════════════════════════════════════════════════

  const SAVE_KEY      = "cgv6_mv_invasion_v39";
  const TICK_INTERVAL = 6;

  // ─── GIAI ĐOẠN XÂM LƯỢC ──────────────────────────────────────────────────
  const PHASES = [
    { id:"portal",    name:"🌀 Mở Cổng",        color:"#8b5cf6", phaseTicks:15, desc:"Mở cổng xâm lược chiều không gian" },
    { id:"landing",   name:"🚀 Đổ Bộ",           color:"#f97316", phaseTicks:20, desc:"Lực lượng tiên phong đổ bộ vào vũ trụ địch" },
    { id:"conquest",  name:"⚔️ Chinh Phạt",       color:"#ef4444", phaseTicks:30, desc:"Giao tranh ác liệt, chiếm đóng từng vùng" },
    { id:"occupation",name:"🏴 Chiếm Đóng",       color:"#dc2626", phaseTicks:40, desc:"Chiếm toàn bộ và hấp thụ tài nguyên" },
    { id:"assimilation",name:"🌟 Đồng Hóa",       color:"#10b981", phaseTicks:25, desc:"Đồng hóa văn minh bại trận" },
  ];

  // ─── KẾT QUẢ XÂM LƯỢC ────────────────────────────────────────────────────
  const OUTCOMES = [
    { id:"great_victory", name:"🏆 Đại Thắng",      color:"#fbbf24", threshold:0.8 },
    { id:"victory",       name:"✅ Chiến Thắng",     color:"#22c55e", threshold:0.55 },
    { id:"stalemate",     name:"🤝 Bế Tắc",          color:"#64748b", threshold:0.45 },
    { id:"repelled",      name:"🛡️ Bị Đẩy Lui",     color:"#3b82f6", threshold:0.2  },
    { id:"crushed",       name:"💀 Bị Tiêu Diệt",    color:"#ef4444", threshold:0.0  },
  ];

  function defaultData() {
    return {
      invasions: [], history: [], tick: 0,
      totalInvasions: 0, totalSucceeded: 0, totalRepelled: 0,
    };
  }

  window.mv39InvData = window.mv39InvData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.mv39InvData)); } catch(e) {} }
  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (raw) { var p = JSON.parse(raw); if (p && p.invasions) window.mv39InvData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  var _ctr = 1;
  function newId() { return "mv39i_" + Date.now() + "_" + (_ctr++); }

  function _notify(msg, icon) {
    if (typeof window.htAddEvent   === "function") window.htAddEvent({ year:window.year||0, type:"mv_invasion", title:msg, color:"#f97316" });
    if (typeof window.waeAddAlert  === "function") window.waeAddAlert({ type:"mv_invasion", icon:icon||"🚀", title:msg, year:window.year||0 });
    if (typeof window.addLog       === "function") window.addLog("[MV-INVASION-V39] " + msg);
  }

  // ─── BẮT ĐẦU XÂM LƯỢC ────────────────────────────────────────────────────
  window.mv39StartInvasion = function(attackerUid, attackerName, targetUid, targetName, attackerType) {
    var existing = window.mv39InvData.invasions.find(function(inv) {
      return inv.status === "active" && inv.attackerUid === attackerUid && inv.targetUid === targetUid;
    });
    if (existing) return existing;

    var attPower = _getUniversePower(attackerUid, attackerType||"universe");
    var defPower = _getUniversePower(targetUid, "universe");

    var inv = {
      id: newId(),
      attackerUid: attackerUid, attackerName: attackerName, attackerType: attackerType||"universe",
      targetUid:   targetUid,   targetName:   targetName,
      attPower: attPower, defPower: defPower,
      status: "active", phase: 0, phaseProgress: 0,
      resourcesAbsorbed: 0, territoriesConquered: 0,
      startYear: window.year||0, endYear: null,
      outcome: null, log: [],
    };

    window.mv39InvData.invasions.push(inv);
    window.mv39InvData.totalInvasions++;

    _notify("🌀 " + attackerName + " mở cổng xâm lược " + targetName + "!", "🌀");
    save();
    return inv;
  };

  function _getUniversePower(uid, type) {
    var base = 100 + Math.floor(Math.random()*300);
    try {
      if (type === "universe" && window.mvGetUniverseById) {
        var u = window.mvGetUniverseById(uid); if (u) return (u.power||100);
      }
    } catch(e){}
    return base;
  }

  // ─── TIẾN ĐỘ XÂM LƯỢC ────────────────────────────────────────────────────
  function _advanceInvasion(inv) {
    var phase = PHASES[inv.phase];
    if (!phase) { _finalizeInvasion(inv); return; }

    inv.phaseProgress = (inv.phaseProgress||0) + 1;

    // Random event trong phase
    if (Math.random() < 0.15) {
      var events = [
        "Lực lượng tăng cường đến từ cổng dự phòng",
        "Phòng thủ địch bị vỡ tuyến phía nam",
        "Linh khí địa phương bị hấp thụ",
        "Quân phòng thủ phản công mạnh mẽ",
        "Cổng xâm lược bị tấn công từ phía sau",
      ];
      inv.log.push("Năm " + (window.year||0) + ": " + events[Math.floor(Math.random()*events.length)]);
      if (inv.log.length > 10) inv.log.shift();
    }

    // Hấp thụ tài nguyên trong phase conquest/occupation
    if (inv.phase >= 2 && Math.random() < 0.3) {
      var absorbed = Math.floor(Math.random() * 500 + 100);
      inv.resourcesAbsorbed += absorbed;
      // Trừ tài nguyên vũ trụ bị xâm lược
      if (window.mvGetUniverseById) {
        var target = window.mvGetUniverseById(inv.targetUid);
        if (target && target.resources) {
          var keys = Object.keys(target.resources);
          var k = keys[Math.floor(Math.random()*keys.length)];
          target.resources[k] = Math.max(0, (target.resources[k]||0) - absorbed);
        }
      }
    }

    if (inv.phase === 2) inv.territoriesConquered += Math.floor(Math.random()*2);

    if (inv.phaseProgress >= phase.phaseTicks) {
      inv.phase++;
      inv.phaseProgress = 0;
      var nextPhase = PHASES[inv.phase];
      if (nextPhase) {
        _notify(phase.name + " → " + nextPhase.name + ": " + inv.attackerName + " tại " + inv.targetName, "⚔️");
      }
    }

    if (inv.phase >= PHASES.length) _finalizeInvasion(inv);
  }

  // ─── KẾT THÚC XÂM LƯỢC ───────────────────────────────────────────────────
  function _finalizeInvasion(inv) {
    var powerRatio = inv.attPower / Math.max(1, inv.defPower);
    // Alliance bonus
    if (window.mvaData && window.mvaData.alliances) {
      var allies = window.mvaData.alliances.filter(function(a){
        return a.status==="active" && a.members.includes(inv.attackerUid);
      }).length;
      powerRatio *= (1 + allies * 0.15);
    }

    var outcome = OUTCOMES[OUTCOMES.length-1];
    for (var i = 0; i < OUTCOMES.length; i++) {
      if (powerRatio >= OUTCOMES[i].threshold) { outcome = OUTCOMES[i]; break; }
    }

    inv.status  = "ended";
    inv.outcome = outcome.id;
    inv.outcomeName = outcome.name;
    inv.outcomeColor = outcome.color;
    inv.endYear = window.year || 0;

    var succeeded = (outcome.id === "great_victory" || outcome.id === "victory");
    if (succeeded) {
      window.mv39InvData.totalSucceeded++;
      // Trigger conquest recording
      if (typeof window.mv39RecordConquest === "function") {
        window.mv39RecordConquest({
          conquerId: inv.id, conqueredUid: inv.targetUid, conqueredName: inv.targetName,
          conquerorUid: inv.attackerUid, conquerorName: inv.attackerName,
          year: inv.endYear, resourcesAbsorbed: inv.resourcesAbsorbed,
          territories: inv.territoriesConquered, warType: "invasion",
        });
      }
      _notify("🏆 " + inv.attackerName + " xâm lược " + inv.targetName + " thành công! (" + outcome.name + ")", "🏆");
    } else {
      window.mv39InvData.totalRepelled++;
      _notify("🛡️ " + inv.targetName + " đẩy lui xâm lược từ " + inv.attackerName + "! (" + outcome.name + ")", "🛡️");
    }

    window.mv39InvData.history.unshift(Object.assign({}, inv));
    if (window.mv39InvData.history.length > 50) window.mv39InvData.history.length = 50;
    save();
  }

  // ─── AUTO INVASION ────────────────────────────────────────────────────────
  window.mv39AutoInvasion = function() {
    if (!window.mvData || !window.mvData.universes) return;
    var active = window.mvData.universes.filter(function(u){ return u.status==="active"; });
    if (active.length < 2) return;
    var sh  = active.slice().sort(function(){ return Math.random()-0.5; });
    var att = sh[0]; var def = sh[1];
    window.mv39StartInvasion(att.id, att.name, def.id, def.name, "universe");
  };

  // ─── PUBLIC ───────────────────────────────────────────────────────────────
  window.mv39GetActiveInvasions = function() {
    return window.mv39InvData.invasions.filter(function(inv){ return inv.status==="active"; });
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  window.mv39RenderInvasionPanel = function() {
    var el = document.getElementById("panel-mv-invasion-v39");
    if (!el) return;
    var d      = window.mv39InvData;
    var active = window.mv39GetActiveInvasions();
    var hist   = d.history.slice(0,15);

    var invCards = active.length===0
      ? '<div style="text-align:center;padding:30px;color:#475569">Không có cuộc xâm lược đang diễn ra.</div>'
      : active.map(function(inv) {
          var phase    = PHASES[inv.phase] || PHASES[PHASES.length-1];
          var phasePct = Math.min(100, ((inv.phaseProgress||0)/Math.max(1,phase.phaseTicks)*100)).toFixed(0);
          var totalPhases = PHASES.length;
          var overallPct  = Math.min(100, ((inv.phase/totalPhases)*100 + parseInt(phasePct)/totalPhases)).toFixed(0);

          var phaseBars = PHASES.map(function(ph, idx) {
            var done = idx < inv.phase;
            var cur  = idx === inv.phase;
            return '<div style="flex:1;height:6px;border-radius:3px;background:' + (done?ph.color:(cur?ph.color+'88':'#1e293b')) + ';margin:0 1px"></div>';
          }).join("");

          return '<div style="background:#0f172a;border:1px solid #f9741644;border-radius:10px;padding:14px;margin-bottom:10px">'
            + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
            + '<div><div style="font-size:12px;font-weight:700;color:#f97316">' + inv.attackerName + ' → ' + inv.targetName + '</div>'
            + '<div style="font-size:10px;color:#475569">Bắt đầu năm ' + inv.startYear + '</div></div>'
            + '<span style="font-size:10px;padding:3px 8px;border-radius:6px;background:' + phase.color + '22;color:' + phase.color + '">' + phase.name + '</span>'
            + '</div>'
            + '<div style="display:flex;margin-bottom:6px">' + phaseBars + '</div>'
            + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">'
            + '<div style="background:#1e293b;border-radius:6px;padding:8px;text-align:center"><div style="font-size:14px;color:#fbbf24">' + inv.resourcesAbsorbed + '</div><div style="font-size:9px;color:#64748b">Tài Nguyên</div></div>'
            + '<div style="background:#1e293b;border-radius:6px;padding:8px;text-align:center"><div style="font-size:14px;color:#ef4444">' + inv.territoriesConquered + '</div><div style="font-size:9px;color:#64748b">Vùng Chiếm</div></div>'
            + '<div style="background:#1e293b;border-radius:6px;padding:8px;text-align:center"><div style="font-size:14px;color:#60a5fa">' + overallPct + '%</div><div style="font-size:9px;color:#64748b">Tiến Độ</div></div>'
            + '</div>'
            + (inv.log.length>0 ? '<div style="font-size:9px;color:#64748b;font-style:italic">' + inv.log[inv.log.length-1] + '</div>' : '')
            + '</div>';
        }).join("");

    var histHtml = hist.map(function(inv){
      return '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:7px;background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.04);margin-bottom:5px">'
        + '<span style="font-size:10px;color:#475569;width:55px">Năm ' + inv.startYear + '</span>'
        + '<span style="flex:1;font-size:11px;color:#e2e8f0">' + inv.attackerName + ' → ' + inv.targetName + '</span>'
        + '<span style="font-size:10px;padding:2px 8px;border-radius:5px;background:' + (inv.outcomeColor||'#64748b') + '22;color:' + (inv.outcomeColor||'#64748b') + '">' + (inv.outcomeName||"?") + '</span>'
        + '</div>';
    }).join("");

    el.innerHTML = '<div style="padding:20px;font-family:\'Noto Serif SC\',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">'
      + '<div style="margin-bottom:16px"><h3 style="margin:0 0 3px;font-size:18px;color:#f97316;font-family:Cinzel,serif">🚀 Xâm Lược Liên Vũ Trụ V39</h3></div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin-bottom:16px">'
      + '<div style="background:#0f172a;border:1px solid #f9741644;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:700;color:#f97316">' + active.length + '</div><div style="font-size:9px;color:#64748b">Đang Xâm Lược</div></div>'
      + '<div style="background:#0f172a;border:1px solid #22c55e44;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:700;color:#22c55e">' + d.totalSucceeded + '</div><div style="font-size:9px;color:#64748b">Thành Công</div></div>'
      + '<div style="background:#0f172a;border:1px solid #3b82f644;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:700;color:#3b82f6">' + d.totalRepelled + '</div><div style="font-size:9px;color:#64748b">Bị Đẩy Lui</div></div>'
      + '</div>'
      + '<button onclick="mv39AutoInvasion();mv39RenderInvasionPanel()" style="width:100%;padding:8px;background:linear-gradient(135deg,#f97316,#ea580c);border:none;border-radius:7px;color:#fff;cursor:pointer;font-size:12px;margin-bottom:16px;font-family:\'Noto Serif SC\',serif">🌀 Phát Động Xâm Lược Ngẫu Nhiên</button>'
      + '<div style="margin-bottom:16px"><div style="font-size:12px;color:#f97316;font-weight:600;margin-bottom:8px">⚡ ĐANG DIỄN RA</div>' + invCards + '</div>'
      + '<div><div style="font-size:12px;color:#94a3b8;font-weight:600;margin-bottom:8px">📜 LỊCH SỬ XÂM LƯỢC</div>'
      + (hist.length===0 ? '<div style="color:#475569;padding:20px;text-align:center">Chưa có lịch sử.</div>' : histHtml)
      + '</div></div>';
  };

  // ─── TICK ─────────────────────────────────────────────────────────────────
  function tick() {
    var d = window.mv39InvData;
    d.tick++;
    if (d.tick % TICK_INTERVAL !== 0) return;

    d.invasions.filter(function(inv){ return inv.status==="active"; }).forEach(_advanceInvasion);

    // Auto invasion mỗi ~200 ticks
    if (d.tick % 200 === 0 && Math.random() < 0.5) window.mv39AutoInvasion();

    if (d.tick % 50 === 0) save();
  }

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); tick(); };
    console.log("[MultiverseInvasionSystem V39] 🚀 Xâm Lược Đa Vũ Trụ · 5 giai đoạn · " + window.mv39GetActiveInvasions().length + " đang xâm lược.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 4500); });
  } else {
    setTimeout(init, 4500);
  }
})();
