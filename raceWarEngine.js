(function() {
  "use strict";
  const SAVE_KEY = "cgv6_race_war_v44";

  var CONFLICT_TYPES = [
    { id:"border_skirmish", name:"Xung Đột Biên Giới",   icon:"⚔️",  duration:5,  severity:1 },
    { id:"tribal_war",      name:"Chiến Tranh Bộ Lạc",   icon:"🗡️",  duration:10, severity:2 },
    { id:"genocide",        name:"Diệt Chủng",            icon:"💀",  duration:20, severity:4 },
    { id:"holy_war",        name:"Thánh Chiến",           icon:"⛪",  duration:15, severity:3 },
    { id:"dominance_war",   name:"Chiến Tranh Thống Trị", icon:"👑",  duration:25, severity:4 },
    { id:"assimilation",    name:"Đồng Hóa Cưỡng Ép",    icon:"🔄",  duration:30, severity:2 }
  ];

  function defaultData() {
    return {
      conflicts: [],
      dominanceMap: {},
      extinctionRisk: {},
      totalConflicts: 0,
      tick: 0
    };
  }
  window.rwData = window.rwData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.rwData)); } catch(e) {} }
  function load() {
    try {
      var r = localStorage.getItem(SAVE_KEY);
      if (r) { var p = JSON.parse(r); if (p && p.conflicts) window.rwData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  // ─── Util ────────────────────────────────────────────────────────────────
  function notify(msg, icon) {
    if (typeof window.waeAddAlert === "function")
      window.waeAddAlert({ type:"race_war", icon:icon||"⚔️", title:msg, year:window.year||0 });
    if (typeof window.htAddEvent === "function")
      window.htAddEvent({ year:window.year||0, type:"race_war", title:"[Xung Đột] " + msg, color:"#ef4444" });
  }

  // ─── API ─────────────────────────────────────────────────────────────────
  window.rweGetConflicts = function() { return window.rwData.conflicts; };
  window.rweGetActive = function() {
    return window.rwData.conflicts.filter(function(c){ return c.active; });
  };
  window.rweGetDominance = function() {
    var d = window.rwData.dominanceMap;
    return Object.keys(d).map(function(k){ return { raceId:k, score:d[k]||0 }; })
      .sort(function(a,b){ return b.score - a.score; });
  };

  window.rweStartConflict = function(raceAId, raceBId, typeId) {
    var raceA = typeof window.recGetRace === "function" ? window.recGetRace(raceAId) : { id:raceAId, name:raceAId, icon:"❓" };
    var raceB = typeof window.recGetRace === "function" ? window.recGetRace(raceBId) : { id:raceBId, name:raceBId, icon:"❓" };
    if (!raceA || !raceB) return null;
    if (raceA.extinct || raceB.extinct) return null;

    var ct = CONFLICT_TYPES.find(function(t){ return t.id === typeId; }) || CONFLICT_TYPES[0];
    var conflict = {
      id: "rwc_" + Date.now(),
      raceA: raceAId, raceB: raceBId,
      type: ct.id, typeName: ct.name, icon: ct.icon,
      startYear: window.year||0,
      duration: ct.duration + Math.floor(Math.random()*5),
      severity: ct.severity,
      ticksElapsed: 0,
      active: true,
      outcome: null
    };
    window.rwData.conflicts.push(conflict);
    if (window.rwData.conflicts.length > 50) window.rwData.conflicts.shift();
    window.rwData.totalConflicts++;

    var msg = raceA.icon+" "+raceA.name+" vs "+raceB.icon+" "+raceB.name+": "+ct.icon+" "+ct.name;
    notify(msg, ct.icon);
    if (typeof window.wmeAddMemory === "function")
      window.wmeAddMemory({ year:window.year||0, category:"race_war", title:msg,
        content:"Xung đột chủng tộc bùng nổ. Mức độ: "+ct.severity+"/4." });
    save();
    return conflict;
  };

  window.rweCheckExtinction = function(raceId) {
    return (window.rwData.extinctionRisk[raceId]||0) >= 80;
  };

  // ─── Tick ────────────────────────────────────────────────────────────────
  window.rweTick = function() {
    window.rwData.tick = (window.rwData.tick||0) + 1;
    var t = window.rwData.tick;
    var races = typeof window.recGetAll === "function" ? window.recGetAll() : [];

    // Xử lý xung đột active mỗi 5 tick
    if (t % 5 === 0) {
      window.rwData.conflicts.forEach(function(c) {
        if (!c.active) return;
        c.ticksElapsed++;
        var raceA = typeof window.recGetRace === "function" ? window.recGetRace(c.raceA) : null;
        var raceB = typeof window.recGetRace === "function" ? window.recGetRace(c.raceB) : null;

        // Tổn thất dân số theo severity
        if (raceA) raceA.population = Math.max(10, Math.floor(raceA.population * (1 - c.severity * 0.002)));
        if (raceB) raceB.population = Math.max(10, Math.floor(raceB.population * (1 - c.severity * 0.002)));

        if (c.ticksElapsed >= c.duration) {
          c.active = false;
          // Quyết định kết quả dựa trên power
          var powerA = (raceA ? raceA.baseStats.power : 50) + Math.floor(Math.random()*30);
          var powerB = (raceB ? raceB.baseStats.power : 50) + Math.floor(Math.random()*30);
          c.outcome = powerA > powerB ? c.raceA : c.raceB;

          // Cập nhật dominance
          window.rwData.dominanceMap[c.outcome] = (window.rwData.dominanceMap[c.outcome]||0) + c.severity * 5;
          var loser = c.outcome === c.raceA ? c.raceB : c.raceA;
          window.rwData.dominanceMap[loser] = Math.max(0, (window.rwData.dominanceMap[loser]||0) - c.severity * 3);
          window.rwData.extinctionRisk[loser] = Math.min(100, (window.rwData.extinctionRisk[loser]||0) + c.severity * 10);

          var winner = typeof window.recGetRace === "function" ? window.recGetRace(c.outcome) : null;
          if (winner) notify(winner.icon+" "+winner.name+" chiến thắng "+c.icon+" "+c.typeName, "🏆");
        }
      });
    }

    // Tự động tạo xung đột ngẫu nhiên mỗi 30 tick
    if (t % 30 === 0 && races.length >= 2) {
      if (Math.random() < 0.25) {
        var alive = races.filter(function(r){ return !r.extinct; });
        if (alive.length >= 2) {
          var idx1 = Math.floor(Math.random() * alive.length);
          var idx2;
          do { idx2 = Math.floor(Math.random() * alive.length); } while(idx2 === idx1);
          var activeCount = window.rweGetActive().length;
          if (activeCount < 3) {
            var types = CONFLICT_TYPES.filter(function(c){ return c.severity <= 2; });
            var ct = types[Math.floor(Math.random()*types.length)];
            window.rweStartConflict(alive[idx1].id, alive[idx2].id, ct.id);
          }
        }
      }
      save();
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  window.rweRenderPanel = function() {
    var el = document.getElementById("panel-race-conflicts-v44");
    if (!el) return;
    var active = window.rweGetActive();
    var all = window.rwData.conflicts;
    var dom = window.rweGetDominance();

    var html = '<div style="padding:20px;max-width:900px;margin:0 auto">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">';
    html += '<h2 style="margin:0;font-family:Cinzel,serif;color:#ef4444;font-size:18px">⚔️ Xung Đột Chủng Tộc V44</h2>';
    html += '<div style="font-size:11px;color:#64748b">Tổng: '+all.length+' · Đang diễn ra: <span style="color:#ef4444">'+active.length+'</span></div>';
    html += '</div>';

    // Stats
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px">';
    html += '<div style="background:#0f172a;border:1px solid #ef444444;border-radius:8px;padding:12px;text-align:center"><div style="font-size:22px;font-weight:700;color:#ef4444">'+active.length+'</div><div style="font-size:10px;color:#64748b">Đang Xung Đột</div></div>';
    html += '<div style="background:#0f172a;border:1px solid #fbbf2444;border-radius:8px;padding:12px;text-align:center"><div style="font-size:22px;font-weight:700;color:#fbbf24">'+window.rwData.totalConflicts+'</div><div style="font-size:10px;color:#64748b">Tổng Xung Đột</div></div>';
    var dominantRace = dom[0];
    var dr = dominantRace && typeof window.recGetRace==="function" ? window.recGetRace(dominantRace.raceId) : null;
    html += '<div style="background:#0f172a;border:1px solid #a78bfa44;border-radius:8px;padding:12px;text-align:center"><div style="font-size:16px;font-weight:700;color:#a78bfa">'+(dr?dr.icon+' '+dr.name:"—")+'</div><div style="font-size:10px;color:#64748b">Thống Trị</div></div>';
    html += '</div>';

    // Xung đột đang diễn ra
    if (active.length > 0) {
      html += '<h3 style="color:#ef4444;font-size:14px;font-family:Cinzel,serif;margin-bottom:10px">🔥 Đang Diễn Ra</h3>';
      active.forEach(function(c) {
        var rA = typeof window.recGetRace==="function" ? window.recGetRace(c.raceA) : null;
        var rB = typeof window.recGetRace==="function" ? window.recGetRace(c.raceB) : null;
        var progress = Math.min(100, Math.floor(c.ticksElapsed/c.duration*100));
        html += '<div style="background:#0f172a;border:1px solid #ef444444;border-radius:8px;padding:12px;margin-bottom:8px">';
        html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">';
        html += '<span style="font-size:16px">'+(rA?rA.icon:"❓")+'</span>';
        html += '<span style="font-size:13px;color:#e2e8f0">'+(rA?rA.name:c.raceA)+'</span>';
        html += '<span style="font-size:18px;color:#ef4444">'+c.icon+'</span>';
        html += '<span style="font-size:13px;color:#e2e8f0">'+(rB?rB.name:c.raceB)+'</span>';
        html += '<span style="font-size:16px">'+(rB?rB.icon:"❓")+'</span>';
        html += '<span style="margin-left:auto;font-size:11px;color:#64748b">'+c.typeName+'</span>';
        html += '</div>';
        html += '<div style="font-size:10px;color:#64748b;margin-bottom:4px">Tiến độ: '+progress+'%</div>';
        html += '<div style="height:6px;background:#1e293b;border-radius:3px"><div style="width:'+progress+'%;height:100%;background:#ef4444;border-radius:3px"></div></div>';
        html += '</div>';
      });
    }

    // Bảng xếp hạng thống trị
    if (dom.length > 0) {
      html += '<h3 style="color:#fbbf24;font-size:14px;font-family:Cinzel,serif;margin:16px 0 10px">👑 Thống Trị Chủng Tộc</h3>';
      html += '<div style="background:#0f172a;border:1px solid #fbbf2444;border-radius:8px;overflow:hidden">';
      dom.slice(0,6).forEach(function(d, i) {
        var race = typeof window.recGetRace==="function" ? window.recGetRace(d.raceId) : null;
        var risk = window.rwData.extinctionRisk[d.raceId]||0;
        html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #1e293b">';
        html += '<span style="font-size:14px;color:#64748b;width:20px">'+(i+1)+'.</span>';
        html += '<span style="font-size:16px">'+(race?race.icon:"❓")+'</span>';
        html += '<span style="font-size:12px;color:#e2e8f0;flex:1">'+(race?race.name:d.raceId)+'</span>';
        html += '<span style="font-size:12px;color:#fbbf24">'+d.score+' pt</span>';
        if (risk >= 50) html += '<span style="font-size:10px;color:#ef4444;margin-left:8px">⚠️ Nguy hiểm '+risk+'%</span>';
        html += '</div>';
      });
      html += '</div>';
    }

    // Lịch sử xung đột
    var finished = all.filter(function(c){ return !c.active && c.outcome; });
    if (finished.length > 0) {
      html += '<h3 style="color:#94a3b8;font-size:14px;font-family:Cinzel,serif;margin:16px 0 10px">📜 Lịch Sử</h3>';
      html += '<div style="background:#0f172a;border-radius:8px;padding:10px;max-height:200px;overflow-y:auto">';
      finished.slice(-10).reverse().forEach(function(c) {
        var rA = typeof window.recGetRace==="function" ? window.recGetRace(c.raceA) : null;
        var rB = typeof window.recGetRace==="function" ? window.recGetRace(c.raceB) : null;
        var winner = typeof window.recGetRace==="function" ? window.recGetRace(c.outcome) : null;
        html += '<div style="font-size:11px;color:#64748b;padding:3px 0;border-bottom:1px solid #1e293b">';
        html += 'Năm '+c.startYear+': '+(rA?rA.icon+rA.name:c.raceA)+' '+c.icon+' '+(rB?rB.icon+rB.name:c.raceB);
        html += ' → 🏆 '+(winner?winner.icon+winner.name:c.outcome);
        html += '</div>';
      });
      html += '</div>';
    }

    // Nút khai chiến thủ công
    html += '<div style="margin-top:16px">';
    html += '<h3 style="color:#ef4444;font-size:13px;font-family:Cinzel,serif;margin-bottom:8px">⚔️ Khai Chiến Thủ Công</h3>';
    var races = typeof window.recGetAll==="function" ? window.recGetAll().filter(function(r){return !r.extinct;}) : [];
    if (races.length >= 2) {
      html += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
      CONFLICT_TYPES.forEach(function(ct) {
        html += '<button onclick="(function(){';
        html += 'var r=window.recGetAll&&window.recGetAll().filter(function(x){return !x.extinct;});';
        html += 'if(r&&r.length>=2){var i1=Math.floor(Math.random()*r.length),i2;do{i2=Math.floor(Math.random()*r.length);}while(i2===i1);';
        html += 'window.rweStartConflict(r[i1].id,r[i2].id,\''+ct.id+'\');window.rweRenderPanel();}';
        html += '})()" style="padding:6px 12px;background:#0f172a;border:1px solid #ef444466;border-radius:6px;color:#ef4444;cursor:pointer;font-size:11px">'+ct.icon+' '+ct.name+'</button>';
      });
      html += '</div>';
    }
    html += '</div></div>';
    el.innerHTML = html;
  };

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); window.rweTick(); };
    console.log("[RaceWarEngine V44] ⚔️ Hệ Thống Xung Đột Chủng Tộc · " + CONFLICT_TYPES.length + " loại xung đột.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 3600); });
  } else {
    setTimeout(init, 3600);
  }
})();
