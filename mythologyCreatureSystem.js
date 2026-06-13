(function() {
  "use strict";
  const SAVE_KEY = "cgv6_myth_creatures_v42";

  // ═══════════════════════════════════════════════════════════
  // MYTHOLOGY CREATURE SYSTEM V42 — Sinh Vật Huyền Thoại
  // ═══════════════════════════════════════════════════════════

  const DEFAULT_CREATURES = [
    // Rồng
    { id:"c_rong_viet",    pantheon:"vietnam",  name:"Rồng Việt",         type:"Rồng",    icon:"🐉", power:95, desc:"Biểu tượng cao quý của dân tộc Việt, con cháu Lạc Long Quân. Rồng hiền lành, mang mưa và thịnh vượng", origin:"Sông Hồng, Biển Đông", threat:"bảo vệ" },
    { id:"c_dragon_greek",  pantheon:"greek",   name:"Ladon",             type:"Rồng",    icon:"🐉", power:88, desc:"Rồng trăm đầu canh giữ táo vàng trong Vườn Hesperides, con của Typhon và Echidna", origin:"Vườn Hesperides", threat:"nguy hiểm" },
    { id:"c_nidhogg",       pantheon:"norse",   name:"Níðhöggr",          type:"Rồng",    icon:"🐍", power:92, desc:"Rồng khổng lồ gặm rễ Yggdrasil, chờ Ragnarök để giải phóng", origin:"Niflheim", threat:"hủy diệt" },
    { id:"c_apep",          pantheon:"egypt",   name:"Apep",              type:"Rồng",    icon:"🐍", power:96, desc:"Rồng hỗn mang tối thượng, kẻ thù của Ra, cố nuốt mặt trời mỗi đêm", origin:"Duat — Cõi Âm", threat:"hủy diệt" },
    { id:"c_long_trung_hoa",pantheon:"chinese", name:"Long — Tứ Hải Long Vương",type:"Rồng",icon:"🐲",power:97,desc:"Bốn Long Vương cai quản bốn đại dương, ban mưa và bão tố theo lệnh Thiên Đình",origin:"Tứ Hải",threat:"uy nghiêm" },
    { id:"c_yamata",        pantheon:"japanese",name:"Yamata no Orochi",  type:"Rồng",    icon:"🐉", power:90, desc:"Rồng 8 đầu 8 đuôi bị Susanoo diệt trừ, từ thân mình xuất hiện kiếm Kusanagi", origin:"Izumo", threat:"nguy hiểm" },
    // Phượng Hoàng
    { id:"c_phuong_hoang",  pantheon:"chinese", name:"Phượng Hoàng",      type:"Phượng",  icon:"🦅", power:90, desc:"Vua của các loài chim, xuất hiện khi có minh quân, tượng trưng cho hòa bình và thịnh vượng", origin:"Nam Phương Thiên Đình", threat:"bảo vệ" },
    { id:"c_phoenix_greek", pantheon:"greek",   name:"Phoenix",           type:"Phượng",  icon:"🔥", power:88, desc:"Chim lửa bất tử, sau 500 năm tự thiêu để tái sinh từ tro tàn", origin:"Ả Rập — Etopia", threat:"lành tính" },
    { id:"c_simurgh",       pantheon:"hindu",   name:"Garuda",            type:"Phượng",  icon:"🦅", power:92, desc:"Chim thần khổng lồ, ngồi của Vishnu, kẻ thù của Naga — rắn thần", origin:"Thiên Đình Ấn", threat:"bảo vệ" },
    // Kỳ Lân
    { id:"c_kylin_viet",    pantheon:"vietnam", name:"Kỳ Lân",            type:"Kỳ Lân",  icon:"🦄", power:85, desc:"Linh vật bốn chân, xuất hiện báo hiệu minh quân hay thánh nhân ra đời", origin:"Khắp Nơi", threat:"lành tính" },
    { id:"c_unicorn_celtic",pantheon:"celtic",  name:"Unicorn",           type:"Kỳ Lân",  icon:"🦄", power:82, desc:"Kỳ lân trắng thuần khiết, biểu tượng Scotland, chỉ để người trong sạch cưỡi", origin:"Rừng Cổ Đại", threat:"lành tính" },
    // Kraken
    { id:"c_kraken",        pantheon:"norse",   name:"Kraken",            type:"Quái Vật Biển",icon:"🦑",power:93,desc:"Bạch tuộc khổng lồ có thể nhấn chìm cả hạm đội, ngủ dưới đáy biển Na Uy",origin:"Biển Bắc",threat:"hủy diệt" },
    { id:"c_charybdis",     pantheon:"greek",   name:"Charybdis",         type:"Quái Vật Biển",icon:"🌀",power:88,desc:"Xoáy nước quái vật nuốt chửng tàu bè ba lần mỗi ngày ở eo biển Sicily",origin:"Eo Biển Messina",threat:"nguy hiểm" },
    // Griffin
    { id:"c_griffin",       pantheon:"greek",   name:"Griffin",           type:"Griffin", icon:"🦅", power:85, desc:"Đầu đại bàng mình sư tử, canh giữ kho báu, biểu tượng sức mạnh và uy quyền", origin:"Scythia — Ba Tư", threat:"uy nghiêm" },
    // Yêu Thú
    { id:"c_fenrir",        pantheon:"norse",   name:"Fenrir",            type:"Sói Thần",icon:"🐺", power:97, desc:"Sói khổng lồ con của Loki, bị xích bằng dây Gleipnir, sẽ giải phóng khi Ragnarök", origin:"Asgard", threat:"hủy diệt" },
    { id:"c_cerberus",      pantheon:"greek",   name:"Cerberus",          type:"Chó Địa Ngục",icon:"🐕",power:90,desc:"Chó ba đầu canh cửa Hades, không cho linh hồn trốn thoát",origin:"Cửa Hades",threat:"canh gác" },
    { id:"c_naga_indian",   pantheon:"hindu",   name:"Naga",              type:"Rắn Thần",icon:"🐍", power:88, desc:"Rắn thần nửa người nửa rắn, cai quản sông ngòi và mưa, vừa thiện vừa ác", origin:"Patala — Âm Giới",threat:"trung lập" },
    { id:"c_tanuki",        pantheon:"japanese",name:"Tanuki",            type:"Yêu Thú", icon:"🦝", power:70, desc:"Gấu trúc thần kỳ biến hóa, mang may mắn và trêu chọc con người", origin:"Rừng Nhật Bản",threat:"lành tính" },
    // Sinh vật Việt Nam
    { id:"c_than_nong",     pantheon:"vietnam", name:"Trâu Vàng",         type:"Linh Thú",icon:"🐂", power:78, desc:"Linh trâu của Khổng Lồ, tiếng kêu làm cả nước rung chuyển, bảo hộ nông dân", origin:"Núi Tản Viên",threat:"bảo vệ" },
    { id:"c_than_kim_quy",  pantheon:"vietnam", name:"Kim Quy",           type:"Thần Quy",icon:"🐢", power:88, desc:"Rùa Thần của Vua An Dương Vương, cho vuốt rùa làm lẫy nỏ thần Liên Châu", origin:"Hồ Tây",threat:"bảo vệ" },
  ];

  window.mythologyCreatureData = window.mythologyCreatureData || {
    creatures: [],
    filter: "all",
    lastId: 0
  };

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.mythologyCreatureData)); } catch(e) {} }

  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.mythologyCreatureData = JSON.parse(d);
      if (!window.mythologyCreatureData.creatures || window.mythologyCreatureData.creatures.length === 0) {
        window.mythologyCreatureData.creatures = DEFAULT_CREATURES.slice();
        window.mythologyCreatureData.lastId = DEFAULT_CREATURES.length;
      }
    } catch(e) { window.mythologyCreatureData.creatures = DEFAULT_CREATURES.slice(); }
  }

  window.mcsGetAll = function() { return window.mythologyCreatureData.creatures || []; };

  window.mcsAddCreature = function(obj) {
    window.mythologyCreatureData.lastId = (window.mythologyCreatureData.lastId || 0) + 1;
    const c = Object.assign({ id: "custom_creature_" + window.mythologyCreatureData.lastId, pantheon: "custom", power: 70, threat: "trung lập" }, obj);
    window.mythologyCreatureData.creatures.push(c);
    if (typeof window.mdbUpdateStats === 'function') window.mdbUpdateStats({ totalCreatures: window.mythologyCreatureData.creatures.length });
    save();
    if (typeof window.htAddEvent === 'function') window.htAddEvent({ year: window.year || 1, type: "monster", title: "🐉 Sinh Vật Mới: " + c.name, color: "#10b981" });
    window.mcsRenderPanel();
  };

  window.mcsDeleteCreature = function(id) {
    window.mythologyCreatureData.creatures = window.mythologyCreatureData.creatures.filter(function(c) { return c.id !== id; });
    if (typeof window.mdbUpdateStats === 'function') window.mdbUpdateStats({ totalCreatures: window.mythologyCreatureData.creatures.length });
    save();
    window.mcsRenderPanel();
  };

  const THREAT_COLORS = { "bảo vệ": "#10b981", "lành tính": "#3b82f6", "trung lập": "#64748b", "uy nghiêm": "#f59e0b", "canh gác": "#8b5cf6", "nguy hiểm": "#f97316", "hủy diệt": "#ef4444" };

  window.mcsRenderPanel = function() {
    const panel = document.getElementById("panel-myth-creatures-v42");
    if (!panel) return;
    const data = window.mythologyCreatureData;
    const filter = data.filter || "all";
    const pantheons = typeof window.mdbGetPantheons === 'function' ? window.mdbGetPantheons() : [];
    let creatures = data.creatures || [];
    if (filter !== "all") creatures = creatures.filter(function(c) { return c.pantheon === filter; });

    const filterBtns = ['<button onclick="window.mythologyCreatureData.filter=\'all\';window.mcsRenderPanel()" ' +
      'style="padding:3px 8px;background:' + (filter==='all'?'#10b98122':'transparent') + ';border:1px solid ' + (filter==='all'?'#10b981':'#1e293b') + ';color:' + (filter==='all'?'#10b981':'#64748b') + ';border-radius:4px;cursor:pointer;font-size:10px">Tất Cả</button>']
      .concat(pantheons.map(function(p) {
        const a = filter === p.id;
        return '<button onclick="window.mythologyCreatureData.filter=\'' + p.id + '\';window.mcsRenderPanel()" style="padding:3px 8px;background:' + (a?p.color+'22':'transparent') + ';border:1px solid ' + (a?p.color:'#1e293b') + ';color:' + (a?p.color:'#64748b') + ';border-radius:4px;cursor:pointer;font-size:10px">' + p.icon + ' ' + p.name.split(' ').pop() + '</button>';
      })).join(" ");

    const cards = creatures.map(function(c) {
      const tc = THREAT_COLORS[c.threat] || "#64748b";
      const pInfo = pantheons.find(function(p) { return p.id === c.pantheon; }) || {};
      const isDefault = DEFAULT_CREATURES.some(function(d) { return d.id === c.id; });
      return '<div style="background:#0f172a;border:1px solid ' + tc + '33;border-left:3px solid ' + tc + ';border-radius:8px;padding:10px">' +
        '<div style="display:flex;justify-content:space-between;align-items:start">' +
          '<div style="display:flex;gap:8px;align-items:center">' +
            '<span style="font-size:20px">' + (c.icon||'🐉') + '</span>' +
            '<div>' +
              '<div style="font-weight:bold;color:#e2e8f0;font-size:12px">' + c.name + '</div>' +
              '<div style="font-size:10px;color:#64748b">' + c.type + '</div>' +
              '<div style="font-size:9px;color:' + (pInfo.color||'#64748b') + '">' + (pInfo.icon||'') + ' ' + (pInfo.name||c.pantheon) + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="text-align:right">' +
            '<span style="background:' + tc + '22;color:' + tc + ';border-radius:4px;padding:2px 5px;font-size:9px">' + c.threat + '</span>' +
            (!isDefault ? '<br><button onclick="window.mcsDeleteCreature(\'' + c.id + '\')" style="margin-top:4px;background:transparent;border:none;color:#ef4444;cursor:pointer;font-size:10px">🗑</button>' : '') +
          '</div>' +
        '</div>' +
        '<div style="margin-top:5px;font-size:10px;color:#94a3b8">' + c.desc + '</div>' +
        '<div style="margin-top:4px;font-size:10px">' +
          '<span style="color:#f97316">⚡ Sức Mạnh: <b>' + c.power + '</b></span>' +
          (c.origin ? ' · <span style="color:#60a5fa">📍 ' + c.origin + '</span>' : '') +
        '</div>' +
      '</div>';
    }).join("");

    const addForm =
      '<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-top:12px">' +
        '<div style="font-size:11px;color:#10b981;font-weight:bold;margin-bottom:8px">🐉 Thêm Sinh Vật Mới</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">' +
          '<input id="mc-name" placeholder="Tên sinh vật..." style="background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px 8px;color:#e2e8f0;font-size:11px">' +
          '<input id="mc-type" placeholder="Loại (Rồng, Phượng...)" style="background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px 8px;color:#e2e8f0;font-size:11px">' +
          '<input id="mc-icon" placeholder="Icon..." style="background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px 8px;color:#e2e8f0;font-size:11px">' +
          '<input id="mc-origin" placeholder="Nguồn gốc..." style="background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px 8px;color:#e2e8f0;font-size:11px">' +
        '</div>' +
        '<input id="mc-desc" placeholder="Mô tả..." style="width:100%;box-sizing:border-box;background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px 8px;color:#e2e8f0;font-size:11px;margin-bottom:6px">' +
        '<div style="display:flex;gap:6px">' +
          '<select id="mc-pantheon" style="flex:1;background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px;color:#e2e8f0;font-size:11px">' +
            pantheons.map(function(p){ return '<option value="'+p.id+'">'+p.icon+' '+p.name+'</option>'; }).join("") +
          '</select>' +
          '<select id="mc-threat" style="flex:1;background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px;color:#e2e8f0;font-size:11px">' +
            ['bảo vệ','lành tính','trung lập','uy nghiêm','nguy hiểm','hủy diệt'].map(function(t){ return '<option>'+t+'</option>'; }).join("") +
          '</select>' +
          '<button onclick="(function(){var n=document.getElementById(\'mc-name\').value;if(!n)return;window.mcsAddCreature({name:n,type:document.getElementById(\'mc-type\').value||\'Sinh Vật\',icon:document.getElementById(\'mc-icon\').value||\'🐉\',origin:document.getElementById(\'mc-origin\').value,desc:document.getElementById(\'mc-desc\').value,pantheon:document.getElementById(\'mc-pantheon\').value,threat:document.getElementById(\'mc-threat\').value,power:75})})()" ' +
            'style="background:#10b981;border:none;color:#000;border-radius:4px;padding:5px 12px;cursor:pointer;font-size:11px;font-weight:bold">+ Tạo</button>' +
        '</div>' +
      '</div>';

    panel.innerHTML =
      '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">' +
        '<div style="font-size:13px;font-weight:bold;color:#10b981;margin-bottom:8px">🐉 Sinh Vật Huyền Thoại — ' + creatures.length + ' loài</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">' + filterBtns + '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' + (cards || '<div style="color:#334155;text-align:center;padding:20px;grid-column:1/-1">Không có sinh vật nào</div>') + '</div>' +
        addForm +
      '</div>';
  };

  function init() {
    load();
    if (typeof window.mdbUpdateStats === 'function') window.mdbUpdateStats({ totalCreatures: window.mythologyCreatureData.creatures.length });
    console.log("[MythCreatureSystem V42] 🐉 Sinh Vật Huyền Thoại — " + window.mythologyCreatureData.creatures.length + " loài khởi tạo.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 2200); });
  } else {
    setTimeout(init, 2200);
  }
})();
