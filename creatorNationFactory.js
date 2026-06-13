(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATOR NATION FACTORY V40 — Xưởng Tạo Quốc Gia & Đế Quốc
  // Quốc Gia · Đế Quốc · Chọn Văn Hóa · Chọn Công Nghệ
  // ═══════════════════════════════════════════════════════════════════════════

  const SAVE_KEY = "cgv6_creator_nation_v40";

  const CULTURES = [
    { id:"martial",    name:"Võ Học",     icon:"⚔️", color:"#ef4444", desc:"Tôn thờ chiến đấu và sức mạnh",       milBonus:40, ecoBonus:10 },
    { id:"scholarly",  name:"Học Thuật",  icon:"📚", color:"#3b82f6", desc:"Trọng trí tuệ và nghiên cứu",          milBonus:5,  ecoBonus:30 },
    { id:"mercantile", name:"Thương Mại", icon:"💰", color:"#22c55e", desc:"Chuyên buôn bán và trao đổi",           milBonus:10, ecoBonus:50 },
    { id:"religious",  name:"Tôn Giáo",   icon:"🛕", color:"#fbbf24", desc:"Tôn thờ thần linh và nghi lễ",         milBonus:20, ecoBonus:20 },
    { id:"magical",    name:"Phép Thuật", icon:"🌀", color:"#a78bfa", desc:"Thuần thục linh thuật và bí kỹ",        milBonus:25, ecoBonus:25 },
    { id:"wandering",  name:"Du Mục",     icon:"🏕️", color:"#f97316", desc:"Không có lãnh thổ cố định, di cư",     milBonus:35, ecoBonus:15 },
  ];

  const TECH_LEVELS = [
    { id:"primitive",    name:"Nguyên Thủy",  icon:"🪨", color:"#78716c", pop:1000,  eco:10 },
    { id:"ancient",      name:"Thượng Cổ",    icon:"🏛️", color:"#92400e", pop:5000,  eco:25 },
    { id:"medieval",     name:"Trung Cổ",     icon:"🏰", color:"#475569", pop:20000, eco:50 },
    { id:"renaissance",  name:"Phục Hưng",    icon:"🎨", color:"#0369a1", pop:50000, eco:75 },
    { id:"industrial",   name:"Công Nghiệp",  icon:"⚙️", color:"#374151", pop:200000,eco:100},
    { id:"arcane",       name:"Huyền Thuật",  icon:"🔮", color:"#7c3aed", pop:80000, eco:120},
    { id:"divine",       name:"Thần Thánh",   icon:"✨", color:"#fbbf24", pop:500000,eco:200},
  ];

  function defaultData() {
    return { nations: [], empires: [], totalNations: 0, totalEmpires: 0 };
  }

  window.cnfData = window.cnfData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.cnfData)); } catch(e) {} }
  function load() {
    try {
      var r = localStorage.getItem(SAVE_KEY);
      if (r) { var p = JSON.parse(r); if (p) window.cnfData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  var _ctr = 1;
  function newId(prefix) { return (prefix||"nat") + "_v40_" + Date.now() + "_" + (_ctr++); }

  function _notify(msg, icon) {
    if (typeof window.htAddEvent  === "function") window.htAddEvent({ year:window.year||0, type:"creator", title:"[Quốc Gia] " + msg, color:"#22c55e" });
    if (typeof window.waeAddAlert === "function") window.waeAddAlert({ type:"creator_nation", icon:icon||"🏛️", title:msg, year:window.year||0 });
  }

  // ─── TẠO QUỐC GIA ─────────────────────────────────────────────────────────
  window.cnfCreateNation = function(opts) {
    var culture  = CULTURES.find(function(c){ return c.id===(opts.culture||"martial"); }) || CULTURES[0];
    var tech     = TECH_LEVELS.find(function(t){ return t.id===(opts.tech||"medieval"); }) || TECH_LEVELS[2];
    var adjNames = ["Thiên","Địa","Huyền","Hoàng","Linh","Phong","Lôi","Hỏa","Thủy","Mộc"];
    var sufNames = ["Quốc","Vương Quốc","Thành Bang","Lãnh Địa","Tiểu Quốc"];

    var nation = {
      id: newId("nat"), type: "nation",
      name: opts.name || adjNames[Math.floor(Math.random()*adjNames.length)] + " " + sufNames[Math.floor(Math.random()*sufNames.length)],
      culture: culture.id, cultureName: culture.name, cultureIcon: culture.icon, cultureColor: culture.color,
      tech: tech.id, techName: tech.name, techIcon: tech.icon,
      population: opts.population || tech.pop + Math.floor(Math.random()*tech.pop),
      military: Math.floor(50 + culture.milBonus + Math.random()*30),
      economy: Math.floor(50 + culture.ecoBonus + Math.random()*30),
      stability: opts.stability || 60 + Math.floor(Math.random()*30),
      ruler: opts.ruler || null, religion: opts.religion || null,
      desc: opts.desc || culture.desc,
      createdYear: window.year||0, status: "active",
      specialties: opts.specialties || [],
    };

    window.cnfData.nations.push(nation);
    window.cnfData.totalNations++;
    _notify("🏛️ Quốc gia '" + nation.name + "' (" + culture.name + ") được thành lập!", "🏛️");
    save();
    return nation;
  };

  // ─── TẠO ĐẾ QUỐC ──────────────────────────────────────────────────────────
  window.cnfCreateEmpire = function(opts) {
    var culture  = CULTURES.find(function(c){ return c.id===(opts.culture||"martial"); }) || CULTURES[0];
    var tech     = TECH_LEVELS.find(function(t){ return t.id===(opts.tech||"arcane"); }) || TECH_LEVELS[5];
    var empNames = ["Thiên","Huyền","Sáng Thế","Hỗn Nguyên","Vĩnh Hằng","Bất Diệt","Cổ Đại"];
    var empSuf   = ["Đế Quốc","Đại Đế Quốc","Liên Bang","Thiên Đình","Thần Quốc"];

    var empire = {
      id: newId("emp"), type: "empire",
      name: opts.name || empNames[Math.floor(Math.random()*empNames.length)] + " " + empSuf[Math.floor(Math.random()*empSuf.length)],
      culture: culture.id, cultureName: culture.name, cultureIcon: culture.icon, cultureColor: culture.color,
      tech: tech.id, techName: tech.name, techIcon: tech.icon,
      population: opts.population || tech.pop * 5 + Math.floor(Math.random()*tech.pop*2),
      military: Math.floor(70 + culture.milBonus + Math.random()*25),
      economy: Math.floor(70 + culture.ecoBonus + Math.random()*25),
      territories: opts.territories || 5 + Math.floor(Math.random()*10),
      emperor: opts.emperor || null, religion: opts.religion || null,
      desc: opts.desc || "Đế quốc hùng mạnh theo văn hóa " + culture.name,
      createdYear: window.year||0, status: "active",
    };

    window.cnfData.empires.push(empire);
    window.cnfData.totalEmpires++;
    _notify("👑 Đế quốc '" + empire.name + "' trỗi dậy!", "👑");
    save();
    return empire;
  };

  window.cnfRandomNation = function() {
    var c = CULTURES[Math.floor(Math.random()*CULTURES.length)];
    var t = TECH_LEVELS[Math.floor(Math.random()*TECH_LEVELS.length)];
    return window.cnfCreateNation({ culture:c.id, tech:t.id });
  };

  window.cnfRenderPanel = function() {
    var el = document.getElementById("panel-creator-nation-v40");
    if (!el) return;
    var d = window.cnfData;

    var cultureButtons = CULTURES.map(function(c) {
      return '<button onclick="cnfCreateNation({culture:\'' + c.id + '\'});cnfRenderPanel()" '
        + 'style="flex:1;padding:8px 4px;background:#0f172a;border:1px solid ' + c.color + '44;border-radius:7px;color:' + c.color + ';cursor:pointer;font-size:10px;font-family:\'Noto Serif SC\',serif;text-align:center">'
        + c.icon + '<br><strong>' + c.name + '</strong></button>';
    }).join("");

    var techButtons = TECH_LEVELS.slice(0,5).map(function(t) {
      return '<button onclick="cnfCreateNation({tech:\'' + t.id + '\'});cnfRenderPanel()" '
        + 'style="flex:1;padding:6px 2px;background:#0f172a;border:1px solid ' + t.color + '44;border-radius:6px;color:' + t.color + ';cursor:pointer;font-size:9px;font-family:\'Noto Serif SC\',serif;text-align:center">'
        + t.icon + ' ' + t.name + '</button>';
    }).join("");

    var allEntities = d.nations.concat(d.empires).slice().reverse().slice(0,20);
    var entityCards = allEntities.length===0
      ? '<div style="text-align:center;padding:30px;color:#475569">Chưa tạo quốc gia nào.</div>'
      : allEntities.map(function(e) {
          var isEmpire = e.type==="empire";
          return '<div style="background:#0f172a;border:1px solid ' + e.cultureColor + '33;border-radius:10px;padding:12px;margin-bottom:7px">'
            + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
            + '<span style="font-size:20px">' + (isEmpire?"👑":"🏛️") + '</span>'
            + '<div style="flex:1"><div style="font-size:13px;font-weight:700;color:' + e.cultureColor + '">' + e.name + '</div>'
            + '<div style="font-size:10px;color:#475569">' + (isEmpire?"Đế Quốc":"Quốc Gia") + ' · ' + e.cultureIcon + ' ' + e.cultureName + ' · ' + e.techIcon + ' ' + e.techName + '</div>'
            + '</div>'
            + '<div style="text-align:right;font-size:10px;color:#64748b">👥 ' + (e.population||0).toLocaleString() + '</div>'
            + '</div>'
            + '<div style="display:grid;grid-template-columns:1fr 1fr' + (isEmpire?" 1fr":"") + ';gap:6px">'
            + '<div style="background:#1e293b;border-radius:6px;padding:6px;text-align:center"><div style="font-size:12px;color:#ef4444">' + (e.military||0) + '</div><div style="font-size:9px;color:#64748b">Quân Sự</div></div>'
            + '<div style="background:#1e293b;border-radius:6px;padding:6px;text-align:center"><div style="font-size:12px;color:#22c55e">' + (e.economy||0) + '</div><div style="font-size:9px;color:#64748b">Kinh Tế</div></div>'
            + (isEmpire ? '<div style="background:#1e293b;border-radius:6px;padding:6px;text-align:center"><div style="font-size:12px;color:#fbbf24">' + (e.territories||0) + '</div><div style="font-size:9px;color:#64748b">Lãnh Thổ</div></div>' : '')
            + '</div>'
            + '</div>';
        }).join("");

    el.innerHTML = '<div style="padding:16px;font-family:\'Noto Serif SC\',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">'
      + '<div style="margin-bottom:14px"><h3 style="margin:0 0 3px;font-size:17px;color:#22c55e;font-family:Cinzel,serif">🏛️ Xưởng Tạo Quốc Gia</h3>'
      + '<div style="font-size:11px;color:#475569">' + d.totalNations + ' quốc gia · ' + d.totalEmpires + ' đế quốc · 6 văn hóa · 7 cấp độ kỹ thuật</div></div>'
      + '<div style="font-size:10px;color:#64748b;margin-bottom:5px">🎭 Văn Hóa:</div>'
      + '<div style="display:flex;gap:4px;margin-bottom:8px">' + cultureButtons + '</div>'
      + '<div style="font-size:10px;color:#64748b;margin-bottom:5px">⚙️ Trình Độ:</div>'
      + '<div style="display:flex;gap:4px;margin-bottom:10px">' + techButtons + '</div>'
      + '<div style="display:flex;gap:8px;margin-bottom:14px">'
      + '<button onclick="cnfRandomNation();cnfRenderPanel()" style="flex:1;padding:8px;background:linear-gradient(135deg,#14532d,#166534);border:none;border-radius:7px;color:#4ade80;cursor:pointer;font-size:12px;font-family:\'Noto Serif SC\',serif">🎲 Quốc Gia Ngẫu Nhiên</button>'
      + '<button onclick="cnfCreateEmpire({});cnfRenderPanel()" style="flex:1;padding:8px;background:linear-gradient(135deg,#3b0764,#581c87);border:none;border-radius:7px;color:#c084fc;cursor:pointer;font-size:12px;font-family:\'Noto Serif SC\',serif">👑 Tạo Đế Quốc</button>'
      + '</div>'
      + '<div style="font-size:12px;color:#64748b;font-weight:600;margin-bottom:8px">📋 QUỐC GIA & ĐẾ QUỐC ĐÃ TẠO</div>'
      + entityCards + '</div>';
  };

  function init() {
    load();
    console.log("[CreatorNationFactory V40] 🏛️ 6 văn hóa · 7 tech · " + window.cnfData.totalNations + " quốc gia, " + window.cnfData.totalEmpires + " đế quốc đã tạo.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 5000); });
  } else {
    setTimeout(init, 5000);
  }
})();
