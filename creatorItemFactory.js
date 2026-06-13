(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATOR ITEM FACTORY V40 — Xưởng Tạo Vật Phẩm
  // Vũ Khí · Giáp · Thánh Vật · Thần Khí · Di Vật Cổ Đại
  // ═══════════════════════════════════════════════════════════════════════════

  const SAVE_KEY = "cgv6_creator_item_v40";

  const ITEM_TYPES = [
    { id:"weapon",  name:"Vũ Khí",         icon:"⚔️",  color:"#ef4444",  basePower:50 },
    { id:"armor",   name:"Giáp",           icon:"🛡️",  color:"#3b82f6",  basePower:40 },
    { id:"artifact",name:"Thánh Vật",      icon:"💎",  color:"#a78bfa",  basePower:70 },
    { id:"divine",  name:"Thần Khí",       icon:"✨",  color:"#fbbf24",  basePower:90 },
    { id:"relic",   name:"Di Vật Cổ Đại",  icon:"🏺",  color:"#f97316",  basePower:80 },
  ];

  const ITEM_TIERS = [
    { id:"common",       name:"Phàm",     color:"#94a3b8",  mult:1.0 },
    { id:"rare",         name:"Hiếm",     color:"#3b82f6",  mult:1.5 },
    { id:"epic",         name:"Sử Thi",   color:"#a78bfa",  mult:2.2 },
    { id:"legendary",    name:"Huyền Thoại",color:"#fbbf24",mult:3.5 },
    { id:"divine",       name:"Thần",     color:"#f97316",  mult:5.0 },
    { id:"creator_tier", name:"Sáng Thế", color:"#e2e8f0",  mult:10.0 },
  ];

  const ITEM_EFFECTS = [
    "Tăng sức mạnh người cầm", "Phá vỡ không gian", "Triệu hồi linh vật",
    "Đảo ngược thời gian cục bộ", "Tạo lá chắn bất khả xâm phạm", "Hấp thụ linh khí",
    "Kiểm soát nguyên tố", "Tăng tốc tiến hóa", "Đánh thức ký ức cổ đại",
    "Mở khóa bí cảnh huyền bí", "Lịch kiếp truyền ký", "Thiên mệnh chi vật",
  ];

  function defaultData() { return { items: [], totalCreated: 0 }; }
  window.cifData = window.cifData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.cifData)); } catch(e) {} }
  function load() {
    try {
      var r = localStorage.getItem(SAVE_KEY);
      if (r) { var p = JSON.parse(r); if (p && p.items) window.cifData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  var _ctr = 1;
  function newId() { return "item_v40_" + Date.now() + "_" + (_ctr++); }

  function _notify(msg) {
    if (typeof window.htAddEvent  === "function") window.htAddEvent({ year:window.year||0, type:"creator", title:"[Vật Phẩm] " + msg, color:"#fbbf24" });
    if (typeof window.waeAddAlert === "function") window.waeAddAlert({ type:"creator_item", icon:"💎", title:msg, year:window.year||0 });
  }

  window.cifCreateItem = function(opts) {
    var itype = ITEM_TYPES.find(function(t){ return t.id===(opts.type||"weapon"); }) || ITEM_TYPES[0];
    var itier = ITEM_TIERS.find(function(t){ return t.id===(opts.tier||"rare"); }) || ITEM_TIERS[1];

    var numEffects = Math.floor(itier.mult * 0.8) + 1;
    var shuffled = ITEM_EFFECTS.slice().sort(function(){ return Math.random()-0.5; });
    var effects = shuffled.slice(0, Math.min(numEffects, shuffled.length));

    var item = {
      id: newId(), type: itype.id, typeName: itype.name, typeIcon: itype.icon,
      tier: itier.id, tierName: itier.name, tierColor: itier.color,
      name: opts.name || itier.name + " " + itype.name + " #" + (window.cifData.totalCreated+1),
      desc: opts.desc || "Vật phẩm được Sáng Thế Chủ đích thân tạo ra.",
      power: Math.floor(itype.basePower * itier.mult * (0.8 + Math.random()*0.4)),
      effects: effects,
      owner: opts.owner || null,
      createdYear: window.year||0,
      lore: opts.lore || null,
    };

    window.cifData.items.push(item);
    window.cifData.totalCreated++;
    _notify(itier.name + " " + itype.name + ": '" + item.name + "' xuất hiện!");
    save();
    return item;
  };

  window.cifRandomItem = function() {
    var itype = ITEM_TYPES[Math.floor(Math.random()*ITEM_TYPES.length)];
    var itier = ITEM_TIERS[Math.floor(Math.random()*Math.min(5,ITEM_TIERS.length))];
    var names = ["Thần Kiếm","Cổ Khí","Phá Thiên","Vô Cực","Hỗn Nguyên","Thiên Địa","Long Hồn","Huyết Ma","Linh Mạch","Sáng Thế"];
    return window.cifCreateItem({ type: itype.id, tier: itier.id, name: names[Math.floor(Math.random()*names.length)] + " " + itype.name });
  };

  window.cifRenderPanel = function() {
    var el = document.getElementById("panel-creator-item-v40");
    if (!el) return;
    var items = window.cifData.items;

    var typeButtons = ITEM_TYPES.map(function(t) {
      return '<button onclick="cifCreateItem({type:\'' + t.id + '\'});cifRenderPanel()" '
        + 'style="flex:1;padding:10px;background:#0f172a;border:1px solid ' + t.color + '44;border-radius:8px;color:' + t.color + ';cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif">'
        + t.icon + '<br><strong>' + t.name + '</strong></button>';
    }).join("");

    var tierButtons = ITEM_TIERS.map(function(t) {
      return '<button onclick="cifCreateItem({tier:\'' + t.id + '\'});cifRenderPanel()" '
        + 'style="flex:1;padding:6px 3px;background:#0f172a;border:1px solid ' + t.color + '44;border-radius:6px;color:' + t.color + ';cursor:pointer;font-size:10px;font-family:\'Noto Serif SC\',serif">'
        + t.name + '</button>';
    }).join("");

    var itemCards = items.length===0
      ? '<div style="text-align:center;padding:30px;color:#475569">Chưa tạo vật phẩm nào.</div>'
      : items.slice().reverse().slice(0,20).map(function(it) {
          return '<div style="background:#0f172a;border:1px solid ' + it.tierColor + '44;border-radius:8px;padding:12px;margin-bottom:6px;display:flex;gap:10px;align-items:flex-start">'
            + '<span style="font-size:22px;flex-shrink:0">' + it.typeIcon + '</span>'
            + '<div style="flex:1">'
            + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">'
            + '<span style="font-size:12px;font-weight:700;color:' + it.tierColor + '">' + it.name + '</span>'
            + '<span style="font-size:9px;padding:2px 6px;border-radius:5px;background:' + it.tierColor + '22;color:' + it.tierColor + '">' + it.tierName + '</span>'
            + '</div>'
            + '<div style="font-size:10px;color:#64748b;margin-bottom:4px">' + it.desc.slice(0,50) + '</div>'
            + '<div style="display:flex;flex-wrap:wrap;gap:3px">'
            + it.effects.map(function(e){ return '<span style="font-size:9px;padding:1px 5px;background:#1e293b;border-radius:4px;color:#94a3b8">' + e.slice(0,18) + '</span>'; }).join("")
            + '</div>'
            + '</div>'
            + '<div style="text-align:right;flex-shrink:0"><div style="font-size:14px;font-weight:700;color:' + it.tierColor + '">' + it.power + '</div><div style="font-size:9px;color:#475569">Sức Mạnh</div></div>'
            + '</div>';
        }).join("");

    el.innerHTML = '<div style="padding:16px;font-family:\'Noto Serif SC\',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">'
      + '<div style="margin-bottom:14px"><h3 style="margin:0 0 3px;font-size:17px;color:#fbbf24;font-family:Cinzel,serif">💎 Xưởng Tạo Vật Phẩm</h3>'
      + '<div style="font-size:11px;color:#475569">5 loại vật phẩm · 6 cấp độ · ' + items.length + ' đã tạo</div></div>'
      + '<div style="display:flex;gap:6px;margin-bottom:10px">' + typeButtons + '</div>'
      + '<div style="display:flex;gap:4px;margin-bottom:14px">' + tierButtons + '</div>'
      + '<button onclick="cifRandomItem();cifRenderPanel()" style="width:100%;padding:8px;background:linear-gradient(135deg,#92400e,#78350f);border:none;border-radius:7px;color:#fbbf24;cursor:pointer;font-size:12px;margin-bottom:14px;font-family:\'Noto Serif SC\',serif">🎲 Tạo Vật Phẩm Ngẫu Nhiên</button>'
      + '<div style="font-size:12px;color:#64748b;font-weight:600;margin-bottom:8px">📋 VẬT PHẨM ĐÃ TẠO (' + items.length + ')</div>'
      + itemCards + '</div>';
  };

  function init() {
    load();
    console.log("[CreatorItemFactory V40] 💎 Xưởng Tạo Vật Phẩm · 5 loại · 6 tier · " + window.cifData.items.length + " đã tạo.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 4400); });
  } else {
    setTimeout(init, 4400);
  }
})();
