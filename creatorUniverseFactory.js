(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATOR UNIVERSE FACTORY V40 — Xưởng Tạo Vũ Trụ
  // Tạo Vũ Trụ · Chọn Loại · Chọn Quy Luật · Chọn Tốc Độ Thời Gian
  // ═══════════════════════════════════════════════════════════════════════════

  const SAVE_KEY = "cgv6_creator_universe_v40";

  const UNIVERSE_TYPES = [
    { id:"cultivation", name:"Tu Tiên",      icon:"🌀", color:"#a78bfa", desc:"Thế giới tu luyện, linh khí dồi dào"      },
    { id:"mechanical",  name:"Cơ Khí",       icon:"⚙️", color:"#94a3b8", desc:"Thế giới công nghệ và máy móc"            },
    { id:"divine",      name:"Thần Thánh",   icon:"✨", color:"#fbbf24", desc:"Thế giới thần linh ngự trị"               },
    { id:"dark",        name:"Tối Tăm",      icon:"🌑", color:"#1e293b", desc:"Thế giới đêm tối và hư vô"               },
    { id:"balance",     name:"Cân Bằng",     icon:"⚖️", color:"#22c55e", desc:"Thế giới âm dương cân bằng hoàn hảo"     },
    { id:"chaos",       name:"Hỗn Loạn",     icon:"🌪️", color:"#ef4444", desc:"Thế giới không có quy luật cố định"      },
    { id:"void",        name:"Hư Không",     icon:"🕳️", color:"#475569", desc:"Thế giới trống rỗng chờ được lấp đầy"   },
    { id:"custom",      name:"Tùy Chỉnh",    icon:"🔭", color:"#60a5fa", desc:"Vũ trụ theo ý Sáng Thế Chủ thiết kế"    },
  ];

  const UNIVERSE_LAWS = [
    { id:"high_lingqi",   name:"Linh Khí Cao",      effect:"+50% tốc độ tu luyện",   color:"#a78bfa" },
    { id:"fast_time",     name:"Thời Gian Nhanh",    effect:"Thế giới tiến nhanh 5x", color:"#fbbf24" },
    { id:"slow_time",     name:"Thời Gian Chậm",    effect:"Thế giới tiến chậm 0.2x",color:"#3b82f6" },
    { id:"no_death",      name:"Bất Tử",             effect:"Sinh vật không chết già", color:"#22c55e" },
    { id:"chaos_law",     name:"Vô Quy Luật",        effect:"Kết quả ngẫu nhiên hoàn toàn",color:"#ef4444"},
    { id:"order_law",     name:"Trật Tự Hoàn Hảo",  effect:"Ổn định +40%",           color:"#60a5fa" },
    { id:"gravity_heavy", name:"Trọng Lực Nặng",     effect:"Sinh vật mạnh hơn +30%", color:"#f97316" },
    { id:"divine_dom",    name:"Thần Lực Thống Trị", effect:"Thần linh ×3 quyền lực", color:"#fbbf24" },
    { id:"dark_qi",       name:"Tà Khí Tràn Ngập",  effect:"Ma vật và ác quỷ tăng sinh",color:"#f87171"},
  ];

  const TIME_SPEEDS = [
    { id:"frozen",  name:"Băng Đông",   mult:0,   desc:"Thời gian đứng yên" },
    { id:"slow",    name:"Chậm",        mult:0.1, desc:"1 ngày = 10 ngày ngoài" },
    { id:"normal",  name:"Bình Thường", mult:1,   desc:"Đồng bộ với thế giới chính" },
    { id:"fast",    name:"Nhanh",       mult:5,   desc:"1 ngày = 0.2 ngày ngoài" },
    { id:"rapid",   name:"Tốc Chiến",   mult:100, desc:"Tiến hóa cực nhanh" },
    { id:"eternal", name:"Vĩnh Cửu",   mult:-1,  desc:"Không có khái niệm thời gian" },
  ];

  function defaultData() { return { universes: [], totalCreated: 0 }; }
  window.cufData = window.cufData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.cufData)); } catch(e) {} }
  function load() {
    try {
      var r = localStorage.getItem(SAVE_KEY);
      if (r) { var p = JSON.parse(r); if (p && p.universes) window.cufData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  var _ctr = 1;
  function newId() { return "univ_v40_" + Date.now() + "_" + (_ctr++); }

  function _notify(msg) {
    if (typeof window.htAddEvent   === "function") window.htAddEvent({ year:window.year||0, type:"universe", title:"[Vũ Trụ] " + msg, color:"#8b5cf6" });
    if (typeof window.waeAddAlert  === "function") window.waeAddAlert({ type:"creator_universe", icon:"🌌", title:msg, year:window.year||0 });
    if (typeof window.wmeAddMemory === "function") window.wmeAddMemory({ year:window.year||0, category:"universe", title:"Vũ Trụ Mới Xuất Hiện", content:msg });
  }

  window.cufCreateUniverse = function(opts) {
    var utype = UNIVERSE_TYPES.find(function(t){ return t.id===(opts.type||"cultivation"); }) || UNIVERSE_TYPES[0];
    var speed = TIME_SPEEDS.find(function(s){ return s.id===(opts.timeSpeed||"normal"); }) || TIME_SPEEDS[2];

    var lawCount = opts.laws ? 0 : 2 + Math.floor(Math.random()*3);
    var shuffledL = UNIVERSE_LAWS.slice().sort(function(){ return Math.random()-0.5; });
    var laws = opts.laws || shuffledL.slice(0, lawCount).map(function(l){ return l.id; });

    var univNames = ["Thiên Ngoại Thiên","Hỗn Nguyên Cảnh","Vĩnh Hằng Cõi","Thái Sơ Giới","Khai Thiên Cảnh","Vô Cực Vũ","Huyền Thiên Cảnh"];

    var universe = {
      id: newId(),
      name: opts.name || univNames[Math.floor(Math.random()*univNames.length)],
      type: utype.id, typeName: utype.name, typeIcon: utype.icon, typeColor: utype.color,
      laws: laws,
      timeSpeed: speed.id, timeSpeedName: speed.name, timeSpeedMult: speed.mult,
      power: opts.power || 100 + Math.floor(Math.random()*900),
      stability: opts.stability || 50 + Math.floor(Math.random()*40),
      population: opts.population || Math.floor(Math.random()*1000000),
      kingdoms: opts.kingdoms || Math.floor(Math.random()*20),
      gods: opts.gods || Math.floor(Math.random()*10),
      resources: opts.resources || { lingqi:1000, minerals:500, energy:800 },
      status: "active", desc: utype.desc,
      createdYear: window.year||0,
    };

    window.cufData.universes.push(universe);
    window.cufData.totalCreated++;

    // Tích hợp vào mvData nếu có
    if (typeof window.mvCreateUniverse === "function") {
      try {
        window.mvCreateUniverse({
          name: universe.name, type: universe.type,
          power: universe.power, stability: universe.stability,
          population: universe.population, kingdoms: universe.kingdoms,
          gods: universe.gods, resources: universe.resources,
        });
      } catch(e) {}
    }

    _notify("🌌 Vũ trụ '" + universe.name + "' (" + utype.name + ") được khai thiên!");
    save();
    return universe;
  };

  window.cufRandomUniverse = function() {
    var t = UNIVERSE_TYPES[Math.floor(Math.random()*UNIVERSE_TYPES.length)];
    var s = TIME_SPEEDS[Math.floor(Math.random()*TIME_SPEEDS.length)];
    return window.cufCreateUniverse({ type:t.id, timeSpeed:s.id });
  };

  window.cufRenderPanel = function() {
    var el = document.getElementById("panel-creator-universe-v40");
    if (!el) return;
    var d = window.cufData;

    var typeButtons = UNIVERSE_TYPES.slice(0,6).map(function(t) {
      return '<button onclick="cufCreateUniverse({type:\'' + t.id + '\'});cufRenderPanel()" '
        + 'style="flex:1;padding:10px 4px;background:#0f172a;border:1px solid ' + t.color + '44;border-radius:8px;color:' + t.color + ';cursor:pointer;font-size:10px;font-family:\'Noto Serif SC\',serif;text-align:center">'
        + '<div style="font-size:16px">' + t.icon + '</div>'
        + '<div style="font-weight:600;font-size:10px">' + t.name + '</div>'
        + '</button>';
    }).join("");

    var speedButtons = TIME_SPEEDS.map(function(s) {
      return '<button onclick="cufCreateUniverse({timeSpeed:\'' + s.id + '\'});cufRenderPanel()" '
        + 'style="flex:1;padding:6px 3px;background:#0f172a;border:1px solid #1e293b;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:9px;font-family:\'Noto Serif SC\',serif;text-align:center">'
        + s.name + '</button>';
    }).join("");

    var univCards = d.universes.length===0
      ? '<div style="text-align:center;padding:30px;color:#475569">Chưa tạo vũ trụ nào.</div>'
      : d.universes.slice().reverse().slice(0,10).map(function(u) {
          var activeLaws = UNIVERSE_LAWS.filter(function(l){ return u.laws.includes(l.id); });
          return '<div style="background:#0f172a;border:1px solid ' + u.typeColor + '44;border-radius:10px;padding:14px;margin-bottom:8px">'
            + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">'
            + '<span style="font-size:26px">' + u.typeIcon + '</span>'
            + '<div style="flex:1">'
            + '<div style="font-size:13px;font-weight:700;color:' + u.typeColor + '">' + u.name + '</div>'
            + '<div style="font-size:10px;color:#475569">' + u.typeName + ' · ⏱ ' + u.timeSpeedName + ' · Năm ' + u.createdYear + '</div>'
            + '</div>'
            + '<div style="font-size:14px;font-weight:700;color:' + u.typeColor + '">' + u.power + ' 💪</div>'
            + '</div>'
            + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px">'
            + '<div style="background:#1e293b;border-radius:5px;padding:6px;text-align:center"><div style="font-size:11px;color:#e2e8f0">' + u.stability + '</div><div style="font-size:8px;color:#64748b">Ổn Định</div></div>'
            + '<div style="background:#1e293b;border-radius:5px;padding:6px;text-align:center"><div style="font-size:11px;color:#e2e8f0">' + (u.kingdoms||0) + '</div><div style="font-size:8px;color:#64748b">Vương Quốc</div></div>'
            + '<div style="background:#1e293b;border-radius:5px;padding:6px;text-align:center"><div style="font-size:11px;color:#e2e8f0">' + (u.gods||0) + '</div><div style="font-size:8px;color:#64748b">Thần</div></div>'
            + '<div style="background:#1e293b;border-radius:5px;padding:6px;text-align:center"><div style="font-size:11px;color:#e2e8f0">' + (u.population||0).toLocaleString().slice(0,6) + '</div><div style="font-size:8px;color:#64748b">Dân Số</div></div>'
            + '</div>'
            + (activeLaws.length>0 ? '<div style="display:flex;flex-wrap:wrap;gap:3px">' + activeLaws.map(function(l){ return '<span style="font-size:9px;padding:2px 6px;background:' + l.color + '22;border-radius:4px;color:' + l.color + '">' + l.name + '</span>'; }).join("") + '</div>' : '')
            + '</div>';
        }).join("");

    el.innerHTML = '<div style="padding:16px;font-family:\'Noto Serif SC\',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">'
      + '<div style="margin-bottom:14px"><h3 style="margin:0 0 3px;font-size:17px;color:#8b5cf6;font-family:Cinzel,serif">🌌 Xưởng Tạo Vũ Trụ</h3>'
      + '<div style="font-size:11px;color:#475569">8 loại · 9 quy luật · 6 tốc độ · ' + d.universes.length + ' đã tạo</div></div>'
      + '<div style="font-size:10px;color:#64748b;margin-bottom:5px">🌌 Loại Vũ Trụ:</div>'
      + '<div style="display:flex;gap:4px;margin-bottom:8px">' + typeButtons + '</div>'
      + '<div style="font-size:10px;color:#64748b;margin-bottom:5px">⏱ Tốc Độ Thời Gian:</div>'
      + '<div style="display:flex;gap:3px;margin-bottom:14px">' + speedButtons + '</div>'
      + '<button onclick="cufRandomUniverse();cufRenderPanel()" style="width:100%;padding:8px;background:linear-gradient(135deg,#1e1b4b,#312e81);border:none;border-radius:7px;color:#a78bfa;cursor:pointer;font-size:12px;margin-bottom:14px;font-family:\'Noto Serif SC\',serif">🎲 Khai Thiên Ngẫu Nhiên</button>'
      + '<div style="font-size:12px;color:#64748b;font-weight:600;margin-bottom:8px">🌌 VŨ TRỤ ĐÃ TẠO (' + d.universes.length + ')</div>'
      + univCards + '</div>';
  };

  function init() {
    load();
    console.log("[CreatorUniverseFactory V40] 🌌 8 loại vũ trụ · 9 quy luật · " + window.cufData.universes.length + " đã tạo.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 5200); });
  } else {
    setTimeout(init, 5200);
  }
})();
