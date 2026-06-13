(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATOR RACE FACTORY V40 — Xưởng Tạo Chủng Tộc
  // Người · Tiên · Ma · Thần · Rồng · Thú · Tùy Chỉnh
  // ═══════════════════════════════════════════════════════════════════════════

  const SAVE_KEY = "cgv6_creator_race_v40";

  const RACE_PRESETS = [
    { id:"human",  name:"Người",      icon:"👤", color:"#94a3b8", lifespan:100,  strength:50, intelligence:70, reproRate:0.8, evolutionPotential:0.9, desc:"Chủng tộc cân bằng, tiến hóa nhanh" },
    { id:"fairy",  name:"Tiên",       icon:"🧝", color:"#a78bfa", lifespan:5000, strength:60, intelligence:90, reproRate:0.1, evolutionPotential:0.7, desc:"Sống lâu, thiên phú tu luyện cao" },
    { id:"demon",  name:"Ma",         icon:"👿", color:"#f87171", lifespan:3000, strength:90, intelligence:60, reproRate:0.3, evolutionPotential:0.6, desc:"Mạnh mẽ và hung hãn, sinh sản chậm" },
    { id:"god",    name:"Thần",       icon:"✨", color:"#fbbf24", lifespan:-1,   strength:95, intelligence:95, reproRate:0.05,evolutionPotential:0.5, desc:"Bất tử, gần như toàn năng" },
    { id:"dragon", name:"Rồng",       icon:"🐉", color:"#ef4444", lifespan:50000,strength:99, intelligence:80, reproRate:0.02,evolutionPotential:0.4, desc:"Bá chủ trời đất, sức mạnh vô song" },
    { id:"beast",  name:"Thú",        icon:"🐺", color:"#22c55e", lifespan:200,  strength:75, intelligence:30, reproRate:1.5, evolutionPotential:0.8, desc:"Năng lực sinh sản cao, bản năng mạnh" },
    { id:"custom", name:"Tùy Chỉnh",  icon:"⚗️", color:"#60a5fa", lifespan:1000, strength:65, intelligence:65, reproRate:0.5, evolutionPotential:1.0, desc:"Chủng tộc do Sáng Thế Chủ thiết kế" },
  ];

  function defaultData() {
    return { races: [], totalCreated: 0, tick: 0 };
  }

  window.crfData = window.crfData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.crfData)); } catch(e) {} }
  function load() {
    try {
      var r = localStorage.getItem(SAVE_KEY);
      if (r) { var p = JSON.parse(r); if (p && p.races) window.crfData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  var _ctr = 1;
  function newId() { return "race_" + Date.now() + "_" + (_ctr++); }

  function _notify(msg) {
    if (typeof window.htAddEvent   === "function") window.htAddEvent({ year:window.year||0, type:"creator", title:"[Chủng Tộc] " + msg, color:"#94a3b8" });
    if (typeof window.waeAddAlert  === "function") window.waeAddAlert({ type:"creator_race", icon:"👥", title:msg, year:window.year||0 });
  }

  // ─── TẠO CHỦNG TỘC ────────────────────────────────────────────────────────
  window.crfCreateRace = function(opts) {
    var preset = RACE_PRESETS.find(function(p){ return p.id === (opts.type||"custom"); }) || RACE_PRESETS[6];
    var race = {
      id: newId(), type: opts.type||"custom",
      name: opts.name || preset.name + " " + (window.crfData.totalCreated+1),
      icon: opts.icon || preset.icon, color: preset.color,
      lifespan: opts.lifespan !== undefined ? opts.lifespan : preset.lifespan,
      strength: Math.min(100, Math.max(1, opts.strength !== undefined ? opts.strength : preset.strength)),
      intelligence: Math.min(100, Math.max(1, opts.intelligence !== undefined ? opts.intelligence : preset.intelligence)),
      reproRate: opts.reproRate !== undefined ? opts.reproRate : preset.reproRate,
      evolutionPotential: opts.evolutionPotential !== undefined ? opts.evolutionPotential : preset.evolutionPotential,
      desc: opts.desc || preset.desc,
      createdYear: window.year||0,
      population: opts.population || 1000 + Math.floor(Math.random()*9000),
      homeland: opts.homeland || null,
      special: opts.special || [],
    };

    window.crfData.races.push(race);
    window.crfData.totalCreated++;
    _notify("Chủng tộc " + race.icon + " " + race.name + " được tạo ra!");
    save();
    return race;
  };

  // ─── TẠO NGẪU NHIÊN ───────────────────────────────────────────────────────
  window.crfRandomRace = function() {
    var preset = RACE_PRESETS[Math.floor(Math.random()*RACE_PRESETS.length)];
    var adj = ["Cổ Đại","Huyền Bí","Vinh Quang","Lạc Lõng","Tiến Hóa","Đột Biến","Linh Thiêng"];
    var name = adj[Math.floor(Math.random()*adj.length)] + " " + preset.name;
    return window.crfCreateRace({
      type: preset.id, name: name,
      strength: preset.strength + Math.floor(Math.random()*20-10),
      intelligence: preset.intelligence + Math.floor(Math.random()*20-10),
      evolutionPotential: Math.random()*0.4+0.6,
    });
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  window.crfRenderPanel = function() {
    var el = document.getElementById("panel-creator-race-v40");
    if (!el) return;
    var races = window.crfData.races;

    function _statBar(val, color) {
      return '<div style="background:#0f172a;border-radius:3px;height:5px;flex:1">'
        + '<div style="width:' + Math.min(100,val) + '%;height:5px;background:' + color + ';border-radius:3px"></div>'
        + '</div>';
    }

    var presetHtml = RACE_PRESETS.map(function(p) {
      return '<button onclick="crfCreateRace({type:\'' + p.id + '\',name:\'' + p.name + ' ' + (races.length+1) + '\'}); crfRenderPanel()" '
        + 'style="padding:10px 12px;background:#0f172a;border:1px solid ' + p.color + '44;border-radius:8px;color:' + p.color + ';cursor:pointer;font-size:12px;font-family:\'Noto Serif SC\',serif;text-align:left;display:flex;align-items:center;gap:6px">'
        + '<span style="font-size:16px">' + p.icon + '</span><div><div style="font-weight:600">' + p.name + '</div>'
        + '<div style="font-size:9px;color:#475569">' + p.desc.slice(0,30) + '</div></div>'
        + '</button>';
    }).join("");

    var raceCards = races.length===0
      ? '<div style="text-align:center;padding:30px;color:#475569">Chưa tạo chủng tộc nào. Hãy chọn một template bên trên!</div>'
      : races.slice().reverse().slice(0,20).map(function(r) {
          return '<div style="background:#0f172a;border:1px solid ' + r.color + '33;border-radius:10px;padding:14px;margin-bottom:8px">'
            + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">'
            + '<span style="font-size:24px">' + r.icon + '</span>'
            + '<div style="flex:1"><div style="font-size:13px;font-weight:700;color:' + r.color + '">' + r.name + '</div>'
            + '<div style="font-size:10px;color:#475569">Năm ' + r.createdYear + ' · ' + r.desc.slice(0,40) + '</div></div>'
            + '<div style="font-size:11px;color:#94a3b8">👥 ' + r.population.toLocaleString() + '</div>'
            + '</div>'
            + '<div style="display:grid;gap:4px">'
            + '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:10px;color:#64748b;width:70px">Sức Mạnh</span>' + _statBar(r.strength,"#ef4444") + '<span style="font-size:10px;color:#94a3b8">' + r.strength + '</span></div>'
            + '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:10px;color:#64748b;width:70px">Trí Tuệ</span>' + _statBar(r.intelligence,"#3b82f6") + '<span style="font-size:10px;color:#94a3b8">' + r.intelligence + '</span></div>'
            + '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:10px;color:#64748b;width:70px">Sinh Sản</span>' + _statBar(r.reproRate*100*0.6,"#22c55e") + '<span style="font-size:10px;color:#94a3b8">' + r.reproRate.toFixed(2) + 'x</span></div>'
            + '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:10px;color:#64748b;width:70px">Tiến Hóa</span>' + _statBar(r.evolutionPotential*100,"#a78bfa") + '<span style="font-size:10px;color:#94a3b8">' + (r.evolutionPotential*100).toFixed(0) + '%</span></div>'
            + '</div></div>';
        }).join("");

    el.innerHTML = '<div style="padding:16px;font-family:\'Noto Serif SC\',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">'
      + '<div style="margin-bottom:14px"><h3 style="margin:0 0 3px;font-size:17px;color:#94a3b8;font-family:Cinzel,serif">👥 Xưởng Tạo Chủng Tộc</h3>'
      + '<div style="font-size:11px;color:#475569">7 mẫu chủng tộc · ' + races.length + ' đã tạo</div></div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:6px;margin-bottom:14px">' + presetHtml + '</div>'
      + '<button onclick="crfRandomRace();crfRenderPanel()" style="width:100%;padding:8px;background:linear-gradient(135deg,#475569,#334155);border:none;border-radius:7px;color:#e2e8f0;cursor:pointer;font-size:12px;margin-bottom:14px;font-family:\'Noto Serif SC\',serif">🎲 Tạo Ngẫu Nhiên</button>'
      + '<div style="font-size:12px;color:#64748b;font-weight:600;margin-bottom:8px">📋 CHỦNG TỘC ĐÃ TẠO (' + races.length + ')</div>'
      + raceCards + '</div>';
  };

  function init() {
    load();
    console.log("[CreatorRaceFactory V40] 👥 Xưởng Tạo Chủng Tộc · 7 mẫu · " + window.crfData.races.length + " đã tạo.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 4200); });
  } else {
    setTimeout(init, 4200);
  }
})();
