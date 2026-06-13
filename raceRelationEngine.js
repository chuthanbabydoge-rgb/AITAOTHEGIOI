(function() {
  "use strict";
  const SAVE_KEY = "cgv6_race_relation_v44";

  var RELATION_TYPES = [
    { id:"hatred",     name:"Thù Hận",       icon:"💢", min:-100, max:-60, color:"#ef4444" },
    { id:"hostile",    name:"Thù Địch",       icon:"⚔️", min:-60,  max:-20, color:"#f97316" },
    { id:"wary",       name:"Dè Chừng",       icon:"👁️", min:-20,  max:0,   color:"#fbbf24" },
    { id:"neutral",    name:"Trung Lập",      icon:"⚖️", min:0,    max:20,  color:"#94a3b8" },
    { id:"friendly",   name:"Thân Thiện",     icon:"🤝", min:20,   max:60,  color:"#34d399" },
    { id:"allied",     name:"Đồng Minh",      icon:"🛡️", min:60,   max:80,  color:"#60a5fa" },
    { id:"brotherhood",name:"Huynh Đệ",       icon:"💙", min:80,   max:100, color:"#a78bfa" }
  ];

  var ALLIANCE_TYPES = [
    { id:"defense_pact",   name:"Hiệp Ước Phòng Thủ",   icon:"🛡️", benefit:"Cùng chống kẻ xâm lược" },
    { id:"trade_pact",     name:"Hiệp Ước Thương Mại",   icon:"💰", benefit:"+tech và +culture" },
    { id:"cultural_union", name:"Liên Minh Văn Hóa",     icon:"🎨", benefit:"+culture cho cả hai" },
    { id:"grand_coalition",name:"Đại Liên Minh Chủng Tộc",icon:"♾️",benefit:"Sức mạnh tổng hợp" }
  ];

  function defaultData() {
    return { relations: {}, alliances: [], assimilations: [], history: [], tick: 0 };
  }
  window.rreData = window.rreData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.rreData)); } catch(e) {} }
  function load() {
    try {
      var r = localStorage.getItem(SAVE_KEY);
      if (r) { var p = JSON.parse(r); if (p && p.relations) window.rreData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  function pairKey(a, b) { return [a,b].sort().join("::"); }

  function notify(msg, icon) {
    if (typeof window.waeAddAlert === "function")
      window.waeAddAlert({ type:"race_relation", icon:icon||"🤝", title:msg, year:window.year||0 });
    if (typeof window.htAddEvent === "function")
      window.htAddEvent({ year:window.year||0, type:"race", title:"[Quan Hệ] " + msg, color:"#60a5fa" });
  }

  // ─── Init quan hệ mặc định ───────────────────────────────────────────────
  var DEFAULT_RELATIONS = {
    "human::elf":    50, "human::demon": -40, "human::dragon": -20, "human::mech": 30,
    "human::spirit": 30, "human::beast": 20,  "human::aqua":   20,
    "elf::demon":   -60, "elf::dragon":   10, "elf::mech":    -20, "elf::spirit":  60,
    "elf::beast":   -10, "elf::aqua":     30,
    "demon::dragon": -10,"demon::mech":  -30, "demon::spirit": -70,"demon::beast":  20,
    "demon::aqua":  -20,
    "dragon::mech": -50, "dragon::spirit":-10,"dragon::beast": -30, "dragon::aqua": 10,
    "mech::spirit": -40, "mech::beast":  -20, "mech::aqua":    10,
    "spirit::beast": 20, "spirit::aqua":  40,
    "beast::aqua":   0
  };

  function initDefaultRelations() {
    Object.keys(DEFAULT_RELATIONS).forEach(function(k) {
      if (!(k in window.rreData.relations)) {
        window.rreData.relations[k] = DEFAULT_RELATIONS[k];
      }
    });
  }

  // ─── API ─────────────────────────────────────────────────────────────────
  window.rreGetRelation = function(a, b) {
    return window.rreData.relations[pairKey(a,b)] || 0;
  };
  window.rreGetRelationType = function(a, b) {
    var score = window.rreGetRelation(a, b);
    return RELATION_TYPES.find(function(t){ return score >= t.min && score < t.max; }) || RELATION_TYPES[3];
  };
  window.rreAreAllied = function(a, b) {
    return window.rreData.alliances.some(function(al){
      return (al.raceA === a && al.raceB === b) || (al.raceA === b && al.raceB === a);
    });
  };
  window.rreModifyRelation = function(a, b, delta) {
    var k = pairKey(a, b);
    window.rreData.relations[k] = Math.max(-100, Math.min(100, (window.rreData.relations[k]||0) + delta));
    save();
  };

  window.rreFormAlliance = function(raceAId, raceBId, typeId) {
    if (window.rreAreAllied(raceAId, raceBId)) return false;
    if (window.rreGetRelation(raceAId, raceBId) < 20) return false;
    var raceA = typeof window.recGetRace === "function" ? window.recGetRace(raceAId) : { id:raceAId, name:raceAId, icon:"❓" };
    var raceB = typeof window.recGetRace === "function" ? window.recGetRace(raceBId) : { id:raceBId, name:raceBId, icon:"❓" };
    var at = ALLIANCE_TYPES.find(function(t){ return t.id === typeId; }) || ALLIANCE_TYPES[0];

    var alliance = {
      id: "rra_" + Date.now(),
      raceA: raceAId, raceB: raceBId,
      type: at.id, typeName: at.name, icon: at.icon,
      formedYear: window.year||0, strength: 100, active: true
    };
    window.rreData.alliances.push(alliance);
    window.rreModifyRelation(raceAId, raceBId, 20);
    window.rreData.history.unshift({ year: window.year||0, type:"alliance",
      msg: raceA.icon+" "+raceA.name+" & "+raceB.icon+" "+raceB.name+": "+at.icon+" "+at.name });

    var msg = raceA.icon+" "+raceA.name+" và "+raceB.icon+" "+raceB.name+" ký "+at.icon+" "+at.name;
    notify(msg, at.icon);
    if (typeof window.wmeAddMemory === "function")
      window.wmeAddMemory({ year:window.year||0, category:"race_alliance", title:msg, content:at.benefit });
    save();
    return true;
  };

  window.rreStartAssimilation = function(targetId, dominantId) {
    var target = typeof window.recGetRace === "function" ? window.recGetRace(targetId) : null;
    var dominant = typeof window.recGetRace === "function" ? window.recGetRace(dominantId) : null;
    if (!target || !dominant) return false;
    if (window.rreGetRelation(targetId, dominantId) > -20) return false;

    var assimilation = {
      id: "ass_" + Date.now(), target: targetId, dominant: dominantId,
      startYear: window.year||0, progress: 0, complete: false
    };
    window.rreData.assimilations.push(assimilation);
    var msg = dominant.icon+" "+dominant.name+" đồng hóa "+target.icon+" "+target.name;
    notify(msg, "🔄");
    save();
    return true;
  };

  window.rreGetAllRelations = function(raceId) {
    var result = [];
    var races = typeof window.recGetAll === "function" ? window.recGetAll() : [];
    races.forEach(function(r) {
      if (r.id === raceId || r.extinct) return;
      result.push({ raceId: r.id, race: r, score: window.rreGetRelation(raceId, r.id),
        type: window.rreGetRelationType(raceId, r.id) });
    });
    return result.sort(function(a,b){ return b.score - a.score; });
  };

  // ─── Tick ────────────────────────────────────────────────────────────────
  window.rreTick = function() {
    window.rreData.tick = (window.rreData.tick||0) + 1;
    var t = window.rreData.tick;

    // Thay đổi quan hệ tự nhiên mỗi 20 tick
    if (t % 20 === 0) {
      // Suy yếu liên minh theo thời gian
      window.rreData.alliances.forEach(function(al) {
        if (!al.active) return;
        al.strength = Math.max(0, al.strength - 1);
        if (al.strength <= 0) {
          al.active = false;
          var rA = typeof window.recGetRace==="function" ? window.recGetRace(al.raceA) : null;
          var rB = typeof window.recGetRace==="function" ? window.recGetRace(al.raceB) : null;
          if (rA && rB) notify(rA.icon+" "+rA.name+" và "+rB.icon+" "+rB.name+" tan vỡ liên minh.", "💔");
        }
      });

      // Tiến trình đồng hóa
      window.rreData.assimilations.forEach(function(ass) {
        if (ass.complete) return;
        ass.progress = Math.min(100, ass.progress + Math.floor(Math.random()*3+1));
        if (ass.progress >= 100) {
          ass.complete = true;
          var dominant = typeof window.recGetRace==="function" ? window.recGetRace(ass.dominant) : null;
          var target = typeof window.recGetRace==="function" ? window.recGetRace(ass.target) : null;
          if (dominant && target) {
            // Đồng hóa: pop của target chuyển sang dominant
            dominant.population = (dominant.population||0) + Math.floor((target.population||0)*0.5);
            target.population = Math.floor((target.population||0)*0.3);
            if (target.population < 100) target.extinct = true;
            notify(dominant.icon+" "+dominant.name+" hoàn tất đồng hóa "+target.icon+" "+target.name+"!", "✅");
          }
        }
      });

      // Tự động cải thiện/suy giảm quan hệ dựa trên xung đột
      if (typeof window.rweGetActive === "function") {
        window.rweGetActive().forEach(function(c) {
          window.rreModifyRelation(c.raceA, c.raceB, -2);
        });
      }

      // Tự động cải thiện quan hệ đồng minh
      window.rreData.alliances.filter(function(al){ return al.active; }).forEach(function(al) {
        window.rreModifyRelation(al.raceA, al.raceB, 1);
      });

      // Tự động tạo liên minh ngẫu nhiên nếu quan hệ đủ tốt
      var races = typeof window.recGetAll === "function" ? window.recGetAll().filter(function(r){ return !r.extinct; }) : [];
      if (races.length >= 2 && Math.random() < 0.15) {
        for (var i = 0; i < races.length; i++) {
          for (var j = i+1; j < races.length; j++) {
            if (window.rreGetRelation(races[i].id, races[j].id) >= 60 && !window.rreAreAllied(races[i].id, races[j].id)) {
              var at = ALLIANCE_TYPES[Math.floor(Math.random()*2)];
              window.rreFormAlliance(races[i].id, races[j].id, at.id);
              break;
            }
          }
          break;
        }
      }
      save();
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  window.rreRenderPanel = function() {
    var el = document.getElementById("panel-race-relations-v44");
    if (!el) return;
    var races = typeof window.recGetAll === "function" ? window.recGetAll().filter(function(r){ return !r.extinct; }) : [];
    var alliances = window.rreData.alliances.filter(function(al){ return al.active; });

    var html = '<div style="padding:20px;max-width:900px;margin:0 auto">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">';
    html += '<h2 style="margin:0;font-family:Cinzel,serif;color:#60a5fa;font-size:18px">🤝 Quan Hệ Chủng Tộc V44</h2>';
    html += '<button onclick="rreRenderPanel()" style="padding:6px 14px;background:#1e293b;border:1px solid #60a5fa;border-radius:6px;color:#60a5fa;cursor:pointer;font-size:12px">🔄 Làm Mới</button>';
    html += '</div>';

    // Liên minh đang hoạt động
    html += '<h3 style="color:#34d399;font-size:14px;font-family:Cinzel,serif;margin-bottom:10px">🛡️ Liên Minh Đang Hoạt Động ('+alliances.length+')</h3>';
    if (alliances.length === 0) {
      html += '<div style="color:#475569;font-size:12px;margin-bottom:16px">Chưa có liên minh nào.</div>';
    } else {
      html += '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">';
      alliances.forEach(function(al) {
        var rA = typeof window.recGetRace==="function" ? window.recGetRace(al.raceA) : null;
        var rB = typeof window.recGetRace==="function" ? window.recGetRace(al.raceB) : null;
        html += '<div style="background:#0f172a;border:1px solid #34d39944;border-radius:8px;padding:10px;display:flex;align-items:center;gap:10px">';
        html += '<span style="font-size:18px">'+(rA?rA.icon:"❓")+'</span>';
        html += '<span style="font-size:12px;color:#e2e8f0">'+(rA?rA.name:al.raceA)+'</span>';
        html += '<span style="font-size:16px;color:#34d399">'+al.icon+'</span>';
        html += '<span style="font-size:12px;color:#e2e8f0">'+(rB?rB.name:al.raceB)+'</span>';
        html += '<span style="font-size:18px">'+(rB?rB.icon:"❓")+'</span>';
        html += '<span style="margin-left:auto;font-size:11px;color:#475569">'+al.typeName+'</span>';
        html += '<span style="font-size:10px;color:#64748b">Sức: <span style="color:#34d399">'+al.strength+'%</span></span>';
        html += '</div>';
      });
      html += '</div>';
    }

    // Ma trận quan hệ
    html += '<h3 style="color:#60a5fa;font-size:14px;font-family:Cinzel,serif;margin-bottom:10px">📊 Ma Trận Quan Hệ</h3>';
    if (races.length >= 2) {
      html += '<div style="overflow-x:auto;margin-bottom:16px">';
      html += '<table style="width:100%;border-collapse:collapse;font-size:11px">';
      html += '<tr><th style="padding:6px;background:#0f172a;color:#475569;font-weight:400;width:80px"></th>';
      races.forEach(function(r) {
        html += '<th style="padding:6px 4px;background:#0f172a;color:'+(r.color||"#94a3b8")+';font-weight:700;text-align:center;writing-mode:vertical-lr;min-width:40px">'+r.icon+'</th>';
      });
      html += '</tr>';
      races.forEach(function(rA) {
        html += '<tr>';
        html += '<td style="padding:6px;background:#0f172a;color:'+(rA.color||"#94a3b8")+';font-weight:700">'+rA.icon+' '+rA.name+'</td>';
        races.forEach(function(rB) {
          if (rA.id === rB.id) {
            html += '<td style="background:#1e293b;text-align:center;padding:5px">—</td>';
          } else {
            var score = window.rreGetRelation(rA.id, rB.id);
            var rt = window.rreGetRelationType(rA.id, rB.id);
            html += '<td style="background:#0f172a;text-align:center;padding:5px;color:'+rt.color+';cursor:pointer" title="'+rA.name+' vs '+rB.name+': '+rt.name+' ('+score+')">';
            html += '<div style="font-size:13px">'+rt.icon+'</div>';
            html += '<div style="font-size:10px">'+score+'</div>';
            html += '</td>';
          }
        });
        html += '</tr>';
      });
      html += '</table></div>';
    }

    // Chi tiết quan hệ từng chủng tộc
    html += '<h3 style="color:#a78bfa;font-size:14px;font-family:Cinzel,serif;margin-bottom:10px">🔍 Chi Tiết Quan Hệ</h3>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;margin-bottom:16px">';
    races.slice(0,4).forEach(function(race) {
      var rels = window.rreGetAllRelations(race.id);
      html += '<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px">';
      html += '<div style="font-size:13px;font-weight:700;color:'+(race.color||"#e2e8f0")+';margin-bottom:8px">'+race.icon+' '+race.name+'</div>';
      rels.forEach(function(rel) {
        html += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">';
        html += '<span style="font-size:14px">'+rel.race.icon+'</span>';
        html += '<span style="font-size:11px;color:#94a3b8;flex:1">'+rel.race.name+'</span>';
        html += '<span style="font-size:11px;color:'+rel.type.color+'">'+rel.type.icon+' '+rel.type.name+'</span>';
        html += '<span style="font-size:11px;color:#64748b;width:35px;text-align:right">'+rel.score+'</span>';
        html += '</div>';
      });
      html += '</div>';
    });
    html += '</div>';

    // Nút tạo liên minh thủ công
    html += '<h3 style="color:#34d399;font-size:13px;font-family:Cinzel,serif;margin-bottom:8px">✍️ Ký Kết Thủ Công</h3>';
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
    ALLIANCE_TYPES.forEach(function(at) {
      html += '<button onclick="(function(){';
      html += 'var r=window.recGetAll&&window.recGetAll().filter(function(x){return !x.extinct;});';
      html += 'if(r&&r.length>=2){';
      html += 'var pairs=r.map(function(a,i){return r.slice(i+1).map(function(b){return [a.id,b.id];});}).flat();';
      html += 'pairs.sort(function(a,b){return window.rreGetRelation(b[0],b[1])-window.rreGetRelation(a[0],a[1]);});';
      html += 'if(pairs[0])window.rreFormAlliance(pairs[0][0],pairs[0][1],\''+at.id+'\');}';
      html += 'window.rreRenderPanel();';
      html += '})()" style="padding:6px 12px;background:#0f172a;border:1px solid #34d39966;border-radius:6px;color:#34d399;cursor:pointer;font-size:11px">'+at.icon+' '+at.name+'</button>';
    });
    html += '</div>';

    // Lịch sử
    if (window.rreData.history.length > 0) {
      html += '<div style="margin-top:16px;background:#0f172a;border-radius:8px;padding:10px;max-height:120px;overflow-y:auto">';
      window.rreData.history.slice(0,10).forEach(function(h) {
        html += '<div style="font-size:11px;color:#64748b;padding:2px 0;border-bottom:1px solid #1e293b">Năm '+h.year+': '+h.msg+'</div>';
      });
      html += '</div>';
    }

    html += '</div>';
    el.innerHTML = html;
  };

  function init() {
    load();
    initDefaultRelations();
    var _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); window.rreTick(); };
    console.log("[RaceRelationEngine V44] 🤝 Hệ Thống Quan Hệ Chủng Tộc · " + Object.keys(window.rreData.relations).length + " cặp quan hệ.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 3700); });
  } else {
    setTimeout(init, 3700);
  }
})();
