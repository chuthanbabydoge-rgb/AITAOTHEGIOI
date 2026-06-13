(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTIVERSE WAR SYSTEM V39 — Chiến Tranh Đa Vũ Trụ Mở Rộng
  // 5 loại chiến tranh · Đế Quốc · Thần Giới · Tông Môn · Dòng Thời Gian · Vũ Trụ
  // ═══════════════════════════════════════════════════════════════════════════

  const SAVE_KEY      = "cgv6_mv_war_v39";
  const TICK_INTERVAL = 8;

  // ─── 5 LOẠI CHIẾN TRANH ──────────────────────────────────────────────────
  const WAR_TYPES_V39 = [
    { id:"universe_war_v39",  name:"🌌 Chiến Tranh Vũ Trụ",       color:"#ef4444", desc:"Hai vũ trụ khai chiến toàn diện",             baseDmg:25, duration:[40,80]  },
    { id:"divine_war_v39",    name:"✨ Chiến Tranh Thần Giới",      color:"#fbbf24", desc:"Thần giới xâm lược vũ trụ lân cận",           baseDmg:35, duration:[30,60]  },
    { id:"timeline_war_v39",  name:"⏳ Chiến Tranh Dòng Thời Gian", color:"#a78bfa", desc:"Xâm chiếm dòng lịch sử thay thế",            baseDmg:15, duration:[60,120] },
    { id:"empire_war_v39",    name:"👑 Chiến Tranh Đế Quốc",        color:"#8b5cf6", desc:"Đế chế mở rộng sang vũ trụ mới",             baseDmg:18, duration:[50,100] },
    { id:"sect_war_v39",      name:"🏯 Chiến Tranh Tông Môn",       color:"#10b981", desc:"Tông môn cạnh tranh địa bàn liên vũ trụ",    baseDmg:12, duration:[25,50]  },
  ];

  // ─── ENTITY TYPES ─────────────────────────────────────────────────────────
  const ENTITY_ICONS = { universe:"🌌", empire:"👑", divine:"✨", sect:"🏯", timeline:"⏳", unknown:"⚔️" };

  function defaultData() {
    return {
      wars: [], history: [], tick: 0,
      totalWars: 0, totalEnded: 0,
      victorBoard: {},      // uid → win count
    };
  }

  window.mv39WarData = window.mv39WarData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.mv39WarData)); } catch(e) {} }
  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (raw) { var p = JSON.parse(raw); if (p && p.wars) window.mv39WarData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  var _ctr = 1;
  function newId() { return "mv39w_" + Date.now() + "_" + (_ctr++); }

  function _notify(msg, type, icon) {
    if (typeof window.htAddEvent   === "function") window.htAddEvent({ year:window.year||0, type:type||"mv_war", title:msg, color:"#ef4444" });
    if (typeof window.wmeAddMemory === "function") window.wmeAddMemory({ year:window.year||0, category:"war", title:"Chiến Tranh Đa Vũ Trụ", content:msg });
    if (typeof window.waeAddAlert  === "function") window.waeAddAlert({ type:"mv_war", icon:icon||"⚔️", title:msg, desc:"Chiến Tranh Đa Vũ Trụ V39", year:window.year||0 });
    if (typeof window.addLog       === "function") window.addLog("[MV-WAR-V39] " + msg);
  }

  // ─── KHAI CHIẾN ───────────────────────────────────────────────────────────
  window.mv39DeclareWar = function(attId, attName, attType, defId, defName, defType, warTypeId) {
    var wt = WAR_TYPES_V39.find(function(t){ return t.id === warTypeId; }) || WAR_TYPES_V39[0];
    var dur = wt.duration[0] + Math.floor(Math.random()*(wt.duration[1]-wt.duration[0]));

    var existing = window.mv39WarData.wars.find(function(w) {
      return w.status === "ongoing" && (
        (w.attackerUid === attId && w.defenderUid === defId) ||
        (w.attackerUid === defId && w.defenderUid === attId)
      );
    });
    if (existing) return existing;

    var attPower = _getEntityPower(attId, attType);
    var defPower = _getEntityPower(defId, defType);

    var war = {
      id: newId(), type: wt.id, typeName: wt.name, typeColor: wt.color,
      attackerUid: attId, attackerName: attName, attackerType: attType,
      defenderUid: defId, defenderName: defName, defenderType: defType,
      attackerPower: attPower, defenderPower: defPower,
      status: "ongoing", startYear: window.year||0,
      endYear: (window.year||0) + dur, duration: dur,
      winner: null, winnerName: null,
      casualties: 0, rounds: 0, desc: wt.desc,
    };

    window.mv39WarData.wars.push(war);
    window.mv39WarData.totalWars++;

    var attIcon = ENTITY_ICONS[attType] || "⚔️";
    var defIcon = ENTITY_ICONS[defType] || "⚔️";
    _notify(wt.name + ": " + attIcon + " " + attName + " xâm lược " + defIcon + " " + defName + "!", "mv_war_declared", wt.typeColor);
    save();
    return war;
  };

  // ─── LẤY SỨC MẠNH THỰC THỂ ───────────────────────────────────────────────
  function _getEntityPower(uid, type) {
    var base = 100 + Math.floor(Math.random()*400);
    try {
      if (type === "universe" && window.mvGetUniverseById) {
        var u = window.mvGetUniverseById(uid); if (u) return u.power || base;
      }
      if (type === "empire" && window.empireData) {
        var eArr = Array.isArray(window.empireData.empires) ? window.empireData.empires : Object.values(window.empireData.empires||{});
        var e = eArr.find(function(x){ return x.empireId === uid || x.id === uid; });
        if (e) return (e.military || 50) + (e.economy || 50);
      }
      if (type === "divine" && window.divV30Data && window.divV30Data.beings) {
        var bArr = Array.isArray(window.divV30Data.beings) ? window.divV30Data.beings : Object.values(window.divV30Data.beings||{});
        var b = bArr.find(function(x){ return x.id === uid; });
        if (b) return (b.power || b.divinity || 200) * 2;
      }
    } catch(e) {}
    return base;
  }

  // ─── GIẢI QUYẾT CHIẾN TRANH ───────────────────────────────────────────────
  function _resolveWar(war) {
    var atkRoll = war.attackerPower * (0.4 + Math.random()*0.8);
    var defRoll = war.defenderPower * (0.4 + Math.random()*0.8);

    // bonus nếu có liên minh V39
    if (window.mvaData) {
      var attAllies = (window.mvaData.alliances||[]).filter(function(a){
        return a.status==="active" && a.members.includes(war.attackerUid);
      }).length;
      var defAllies = (window.mvaData.alliances||[]).filter(function(a){
        return a.status==="active" && a.members.includes(war.defenderUid);
      }).length;
      atkRoll *= (1 + attAllies * 0.1);
      defRoll *= (1 + defAllies * 0.1);
    }

    var attackerWins = atkRoll > defRoll;
    var winnerName  = attackerWins ? war.attackerName : war.defenderName;
    var winnerUid   = attackerWins ? war.attackerUid  : war.defenderUid;
    var loserName   = attackerWins ? war.defenderName : war.attackerName;
    var loserUid    = attackerWins ? war.defenderUid  : war.attackerUid;

    war.status = "ended"; war.winner = winnerUid; war.winnerName = winnerName;
    war.loserUid  = loserUid; war.loserName = loserName;
    window.mv39WarData.totalEnded++;
    window.mv39WarData.victorBoard[winnerUid] = (window.mv39WarData.victorBoard[winnerUid]||0)+1;

    // Hậu quả thực tế
    if (attackerWins) {
      // Xâm lược thành công → trigger conquest
      if (typeof window.mv39RecordConquest === "function") {
        window.mv39RecordConquest({
          conquerId: war.id, conqueredUid: loserUid, conqueredName: loserName,
          conquerorUid: winnerUid, conquerorName: winnerName, year: window.year||0,
          warType: war.type,
        });
      }
      // Trừ stability vũ trụ thua
      if (window.mvGetUniverseById) {
        var loserUniverse = window.mvGetUniverseById(loserUid);
        if (loserUniverse) {
          loserUniverse.stability = Math.max(1, (loserUniverse.stability||50) - 20);
          loserUniverse.power     = Math.max(10, (loserUniverse.power||100) - 50);
        }
        var winnerUniverse = window.mvGetUniverseById(winnerUid);
        if (winnerUniverse) { winnerUniverse.power = Math.floor((winnerUniverse.power||100) * 1.15); }
      }
    }

    window.mv39WarData.history.unshift(Object.assign({}, war));
    if (window.mv39WarData.history.length > 80) window.mv39WarData.history.length = 80;

    _notify("🏆 " + winnerName + " chiến thắng " + loserName + " trong " + war.typeName + "!", "mv_war_ended", war.typeColor);
    save();
  }

  // ─── AUTO WAR ─────────────────────────────────────────────────────────────
  window.mv39AutoWar = function() {
    var year = window.year || 0;
    var entities = _collectEntities();
    if (entities.length < 2) return;

    var wt  = WAR_TYPES_V39[Math.floor(Math.random()*WAR_TYPES_V39.length)];
    var sh  = entities.slice().sort(function(){ return Math.random()-0.5; });
    var att = sh[0]; var def = sh[1];

    // Ưu tiên loại chiến tranh phù hợp với loại thực thể
    if (att.type === "divine" || def.type === "divine")      wt = WAR_TYPES_V39[1];
    else if (att.type === "timeline" || def.type === "timeline") wt = WAR_TYPES_V39[2];
    else if (att.type === "empire"  || def.type === "empire")    wt = WAR_TYPES_V39[3];
    else if (att.type === "sect"    || def.type === "sect")      wt = WAR_TYPES_V39[4];

    window.mv39DeclareWar(att.id, att.name, att.type, def.id, def.name, def.type, wt.id);
  };

  function _collectEntities() {
    var result = [];
    // universes
    if (window.mvData && window.mvData.universes) {
      window.mvData.universes.filter(function(u){ return u.status==="active"; }).forEach(function(u){
        result.push({ id:u.id, name:u.name, type:"universe" });
      });
    }
    // empires
    if (window.empireData) {
      var eArr = Array.isArray(window.empireData.empires) ? window.empireData.empires : Object.values(window.empireData.empires||{});
      eArr.filter(function(e){ return !e.isCollapsed; }).slice(0,5).forEach(function(e){
        result.push({ id:e.empireId||e.id, name:e.empireName||e.name||"Đế Chế", type:"empire" });
      });
    }
    // divine beings
    if (window.divV30Data && window.divV30Data.beings) {
      var bArr = Array.isArray(window.divV30Data.beings) ? window.divV30Data.beings : Object.values(window.divV30Data.beings||{});
      bArr.slice(0,3).forEach(function(b){ result.push({ id:b.id, name:b.name||"Thần Linh", type:"divine" }); });
    }
    // timelines
    if (window.tlData && window.tlData.timelines) {
      window.tlData.timelines.filter(function(t){ return t.status==="active"; }).slice(0,3).forEach(function(t){
        result.push({ id:t.id, name:t.name||"Dòng Thời Gian", type:"timeline" });
      });
    }
    return result;
  }

  // ─── PUBLIC API ───────────────────────────────────────────────────────────
  window.mv39GetActiveWars  = function() { return window.mv39WarData.wars.filter(function(w){ return w.status==="ongoing"; }); };
  window.mv39GetWarHistory  = function() { return window.mv39WarData.history; };
  window.mv39GetWarTypes    = function() { return WAR_TYPES_V39; };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  window.mv39RenderPanel = function() {
    var el = document.getElementById("panel-mv-war-v39");
    if (!el) return;
    var d      = window.mv39WarData;
    var active = window.mv39GetActiveWars();
    var hist   = d.history.slice(0,20);

    var typeCards = WAR_TYPES_V39.map(function(wt){
      var cnt = active.filter(function(w){ return w.type===wt.id; }).length;
      return '<div style="background:#0f172a;border:1px solid ' + (cnt>0?wt.color+'44':'#1e293b') + ';border-radius:8px;padding:10px;text-align:center">'
        + '<div style="font-size:20px;font-weight:700;color:' + wt.color + '">' + cnt + '</div>'
        + '<div style="font-size:9px;color:#64748b">' + wt.name + '</div>'
        + '</div>';
    }).join("");

    var activeHtml = active.length===0
      ? '<div style="text-align:center;padding:30px;color:#475569">Không có chiến tranh đang diễn ra.</div>'
      : active.map(function(w){
          var prog = Math.min(100,(((window.year||0)-w.startYear)/Math.max(1,w.duration)*100)).toFixed(0);
          return '<div style="background:#0f172a;border:1px solid ' + w.typeColor + '44;border-radius:10px;padding:14px;margin-bottom:8px">'
            + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">'
            + '<span style="font-size:12px;font-weight:700;color:' + w.typeColor + '">' + w.typeName + '</span>'
            + '<span style="font-size:10px;color:#475569">Năm ' + w.startYear + ' → ' + w.endYear + '</span>'
            + '</div>'
            + '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:10px">'
            + '<div style="background:#1e293b;border-radius:7px;padding:9px;text-align:center">'
            + '<div style="font-size:9px;color:#94a3b8">⚔️ TẤN CÔNG</div>'
            + '<div style="font-size:12px;font-weight:700;color:#ef4444">' + w.attackerName + '</div>'
            + '<div style="font-size:9px;color:#64748b">' + (ENTITY_ICONS[w.attackerType]||"🏛️") + ' ' + (w.attackerType||"") + ' · ' + w.attackerPower + '</div>'
            + '</div>'
            + '<div style="font-size:18px">⚔️</div>'
            + '<div style="background:#1e293b;border-radius:7px;padding:9px;text-align:center">'
            + '<div style="font-size:9px;color:#94a3b8">🛡️ PHÒNG THỦ</div>'
            + '<div style="font-size:12px;font-weight:700;color:#8b5cf6">' + w.defenderName + '</div>'
            + '<div style="font-size:9px;color:#64748b">' + (ENTITY_ICONS[w.defenderType]||"🏛️") + ' ' + (w.defenderType||"") + ' · ' + w.defenderPower + '</div>'
            + '</div>'
            + '</div>'
            + '<div style="background:#1e293b;border-radius:4px;height:5px"><div style="width:' + prog + '%;background:' + w.typeColor + ';height:5px;border-radius:4px"></div></div>'
            + '</div>';
        }).join("");

    var histHtml = hist.length===0 ? '<div style="color:#475569;padding:20px;text-align:center">Chưa có lịch sử chiến tranh.</div>'
      : hist.map(function(w){
          return '<div style="display:flex;gap:10px;padding:8px 10px;border-radius:7px;background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.04);margin-bottom:5px">'
            + '<span style="font-size:10px;color:#475569;flex-shrink:0;width:50px">Năm ' + w.startYear + '</span>'
            + '<span style="flex:1;font-size:11px;color:#e2e8f0">' + w.typeName + ': <span style="color:#fbbf24">' + (w.winnerName||"?") + '</span> thắng</span>'
            + '</div>';
        }).join("");

    el.innerHTML = '<div style="padding:20px;font-family:\'Noto Serif SC\',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">'
      + '<div style="margin-bottom:16px"><h3 style="margin:0 0 3px;font-size:18px;color:#ef4444;font-family:Cinzel,serif">⚔️ Chiến Tranh Đa Vũ Trụ V39</h3>'
      + '<div style="font-size:11px;color:#475569">' + active.length + ' đang diễn ra · ' + d.totalWars + ' tổng · ' + d.totalEnded + ' đã kết thúc</div></div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:16px">' + typeCards + '</div>'
      + '<div style="display:flex;gap:8px;margin-bottom:16px">'
      + '<button onclick="mv39AutoWar();mv39RenderPanel()" style="flex:1;padding:8px;background:linear-gradient(135deg,#ef4444,#b91c1c);border:none;border-radius:7px;color:#fff;cursor:pointer;font-size:12px;font-family:\'Noto Serif SC\',serif">⚔️ Khai Chiến Ngẫu Nhiên</button>'
      + '</div>'
      + '<div style="margin-bottom:16px"><div style="font-size:12px;color:#ef4444;font-weight:600;margin-bottom:8px">🔥 ĐANG DIỄN RA (' + active.length + ')</div>' + activeHtml + '</div>'
      + '<div><div style="font-size:12px;color:#94a3b8;font-weight:600;margin-bottom:8px">📜 LỊCH SỬ</div>' + histHtml + '</div>'
      + '</div>';
  };

  // ─── TICK ─────────────────────────────────────────────────────────────────
  function tick() {
    var d = window.mv39WarData;
    d.tick++;

    if (d.tick % TICK_INTERVAL !== 0) return;

    var year = window.year || 0;
    d.wars.filter(function(w){ return w.status==="ongoing"; }).forEach(function(w) {
      w.rounds = (w.rounds||0) + 1;
      if (year >= w.endYear) _resolveWar(w);
    });

    // Auto-trigger war mỗi ~150 ticks
    if (d.tick % 150 === 0 && Math.random() < 0.6) window.mv39AutoWar();

    if (d.tick % 40 === 0) save();
  }

  // ─── INIT ─────────────────────────────────────────────────────────────────
  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); tick(); };
    console.log("[MultiverseWarSystem V39] ⚔️ 5 loại chiến tranh đa vũ trụ · " + window.mv39GetActiveWars().length + " đang diễn ra.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 4000); });
  } else {
    setTimeout(init, 4000);
  }
})();
