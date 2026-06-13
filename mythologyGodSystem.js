(function() {
  "use strict";
  const SAVE_KEY = "cgv6_myth_gods_v42";

  // ═══════════════════════════════════════════════════════════
  // MYTHOLOGY GOD SYSTEM V42 — Quản lý Thần Linh
  // ═══════════════════════════════════════════════════════════

  const DEFAULT_GODS = [
    // Việt Nam
    { id:"vn_lac_long_quan", pantheon:"vietnam", name:"Lạc Long Quân", title:"Cha Rồng", domain:"Biển, Rồng, Dân Tộc", power:95, followers:9000000, icon:"🐉", desc:"Thủy Tổ của dân tộc Việt, kết duyên cùng Âu Cơ sinh trăm con", tier:"supreme" },
    { id:"vn_au_co",         pantheon:"vietnam", name:"Âu Cơ",         title:"Mẹ Tiên",  domain:"Tiên, Núi, Dân Tộc",  power:93, followers:9000000, icon:"🧚", desc:"Mẹ của Hùng Vương, tổ mẫu của dân tộc Việt", tier:"supreme" },
    { id:"vn_hung_vuong",    pantheon:"vietnam", name:"Hùng Vương",    title:"Quốc Tổ",  domain:"Đất Nước, Vua",        power:88, followers:8000000, icon:"👑", desc:"18 đời vua Hùng lập nên nước Văn Lang", tier:"great" },
    { id:"vn_thanh_giong",   pantheon:"vietnam", name:"Thánh Gióng",   title:"Phù Đổng Thiên Vương", domain:"Chiến Tranh, Bảo Vệ", power:90, followers:5000000, icon:"⚔️", desc:"Tráng sĩ ba tuổi lớn lên đánh giặc Ân rồi bay về trời", tier:"great" },
    // Hy Lạp
    { id:"gr_zeus",    pantheon:"greek", name:"Zeus",    title:"Chúa Tể Olympus", domain:"Sấm Sét, Bầu Trời, Luật Pháp", power:100, followers:5000000, icon:"⚡", desc:"Vua của các vị thần, cai trị Olympus và thế giới", tier:"supreme" },
    { id:"gr_athena",  pantheon:"greek", name:"Athena",  title:"Nữ Thần Trí Tuệ", domain:"Chiến Tranh, Trí Tuệ, Thủ Công", power:95, followers:3000000, icon:"🦉", desc:"Nữ thần trí tuệ và chiến lược, con gái của Zeus", tier:"great" },
    { id:"gr_ares",    pantheon:"greek", name:"Ares",    title:"Thần Chiến Tranh", domain:"Chiến Tranh, Bạo Lực",           power:90, followers:2000000, icon:"⚔️", desc:"Thần chiến tranh hung hãn, con trai Zeus và Hera", tier:"great" },
    { id:"gr_poseidon",pantheon:"greek", name:"Poseidon",title:"Chúa Biển",        domain:"Biển, Động Đất, Ngựa",           power:95, followers:2500000, icon:"🔱", desc:"Thần biển cả, cai quản đại dương và các sinh vật biển", tier:"great" },
    // Bắc Âu
    { id:"no_odin",  pantheon:"norse", name:"Odin",  title:"Cha Của Tất Cả", domain:"Chiến Tranh, Chết, Trí Tuệ, Thơ Ca", power:100, followers:2000000, icon:"🪄", desc:"Vua Asgard, thần tối cao của người Norse, hy sinh mắt để có trí tuệ", tier:"supreme" },
    { id:"no_thor",  pantheon:"norse", name:"Thor",  title:"Thần Sấm Sét",   domain:"Sấm, Sức Mạnh, Bảo Vệ",               power:95, followers:3000000, icon:"🔨", desc:"Con trai Odin, wielder of Mjolnir — búa thần bảo vệ Asgard", tier:"great" },
    { id:"no_loki",  pantheon:"norse", name:"Loki",  title:"Thần Trá Hình",  domain:"Lừa Dối, Biến Hình, Hỗn Loạn",        power:88, followers:1000000, icon:"🎭", desc:"Thần lừa lọc, con nuôi Odin, gây ra Ragnarök", tier:"great" },
    { id:"no_freya", pantheon:"norse", name:"Freya", title:"Nữ Thần Tình Yêu",domain:"Tình Yêu, Chiến Tranh, Ma Thuật",    power:90, followers:2000000, icon:"💛", desc:"Nữ thần đẹp nhất Asgard, chủ nhân Valhalla", tier:"great" },
    // Ai Cập
    { id:"eg_ra",     pantheon:"egypt", name:"Ra",     title:"Thần Mặt Trời",  domain:"Mặt Trời, Tạo Hóa, Vua Chúa", power:100, followers:4000000, icon:"☀️", desc:"Thần mặt trời tối cao, đi thuyền qua bầu trời mỗi ngày", tier:"supreme" },
    { id:"eg_osiris", pantheon:"egypt", name:"Osiris", title:"Thần Cái Chết",  domain:"Chết, Tái Sinh, Nông Nghiệp",   power:95, followers:3500000, icon:"🌾", desc:"Vua cõi âm, thần nông nghiệp, biểu tượng sự tái sinh", tier:"supreme" },
    { id:"eg_isis",   pantheon:"egypt", name:"Isis",   title:"Nữ Thần Ma Thuật",domain:"Ma Thuật, Chữa Lành, Bảo Vệ",  power:95, followers:3000000, icon:"🪶", desc:"Nữ thần quyền năng nhất Ai Cập, vợ Osiris", tier:"great" },
    { id:"eg_anubis", pantheon:"egypt", name:"Anubis", title:"Thần Dẫn Đường", domain:"Phán Xét, Chết, Ướp Xác",       power:88, followers:2000000, icon:"🐺", desc:"Thần đầu chó sói dẫn linh hồn đến cõi âm", tier:"great" },
    // Trung Hoa
    { id:"cn_jade_emperor",  pantheon:"chinese", name:"Ngọc Hoàng Thượng Đế", title:"Chúa Tể Thiên Đình", domain:"Trời, Quyền Năng, Công Lý", power:100, followers:20000000, icon:"👑", desc:"Vua của Thiên Đình, cai trị tất cả thần linh và nhân gian", tier:"supreme" },
    { id:"cn_guan_yu",       pantheon:"chinese", name:"Quan Công",             title:"Thần Chiến Tranh",    domain:"Chiến Tranh, Trung Thành, Công Bằng", power:92, followers:15000000, icon:"🗡️", desc:"Anh hùng Tam Quốc được thần hóa, bảo hộ người lương thiện", tier:"great" },
    { id:"cn_guanyin",       pantheon:"chinese", name:"Quan Âm Bồ Tát",        title:"Bồ Tát Từ Bi",        domain:"Từ Bi, Cứu Độ, Trẻ Em",              power:98, followers:30000000, icon:"🙏", desc:"Bồ tát từ bi, lắng nghe tiếng khóc của chúng sinh", tier:"supreme" },
    // Nhật Bản
    { id:"jp_amaterasu", pantheon:"japanese", name:"Amaterasu",  title:"Nữ Thần Mặt Trời", domain:"Mặt Trời, Hoàng Gia, Ánh Sáng", power:100, followers:10000000, icon:"☀️", desc:"Nữ thần mặt trời, tổ mẫu hoàng gia Nhật Bản", tier:"supreme" },
    { id:"jp_susanoo",   pantheon:"japanese", name:"Susanoo",    title:"Thần Bão Tố",       domain:"Bão, Biển, Chiến Tranh",         power:93, followers:5000000,  icon:"🌊", desc:"Em trai Amaterasu, thần bão và biển, diệt rồng 8 đầu Yamata no Orochi", tier:"great" },
    { id:"jp_inari",     pantheon:"japanese", name:"Inari",      title:"Thần Cáo",          domain:"Gạo, Nông Nghiệp, Thương Mại",   power:85, followers:8000000,  icon:"🦊", desc:"Thần nông nghiệp và thịnh vượng, sứ giả là cáo trắng", tier:"great" },
    // Ấn Độ
    { id:"hi_brahma",  pantheon:"hindu", name:"Brahma",  title:"Đấng Tạo Hóa",   domain:"Tạo Hóa, Tri Thức, Vũ Trụ",      power:100, followers:50000000, icon:"🌸", desc:"Thần tạo hóa trong Trimurti, tạo ra vũ trụ và sinh linh", tier:"supreme" },
    { id:"hi_vishnu",  pantheon:"hindu", name:"Vishnu",  title:"Đấng Bảo Tồn",   domain:"Bảo Tồn, Tình Yêu, Sự Thật",      power:100, followers:60000000, icon:"💙", desc:"Thần bảo tồn, có 10 hóa thân (Avatar) giáng thế cứu độ", tier:"supreme" },
    { id:"hi_shiva",   pantheon:"hindu", name:"Shiva",   title:"Đấng Hủy Diệt",  domain:"Hủy Diệt, Tái Tạo, Yoga, Múa",   power:100, followers:55000000, icon:"🕉️", desc:"Thần hủy diệt để tái sinh, thiền định trên Himalaya", tier:"supreme" },
    // Maya
    { id:"ma_kukulkan",  pantheon:"maya", name:"Kukulkan", title:"Rồng Lông Vũ",   domain:"Gió, Tạo Hóa, Tri Thức",    power:100, followers:3000000, icon:"🐍", desc:"Rồng có lông vũ, mang tri thức cho con người, tương ứng Quetzalcoatl", tier:"supreme" },
    { id:"ma_hunahpu",   pantheon:"maya", name:"Hunahpu",  title:"Anh Hùng Bóng Tối",domain:"Mặt Trời, Cái Chết, Trò Chơi",power:88, followers:1500000, icon:"🌞", desc:"Anh hùng Maya chiến thắng thần chết trong Xibalba", tier:"great" },
    // Celtic
    { id:"ce_dagda",   pantheon:"celtic", name:"Dagda",   title:"Cha Tốt Lành",   domain:"Nông Nghiệp, Sức Mạnh, Mùa Màng", power:95, followers:1500000, icon:"🌿", desc:"Cha của các thần Celtic, mang dùi cui và vạc thức ăn không cạn", tier:"supreme" },
    { id:"ce_morrigan",pantheon:"celtic", name:"Morrigan", title:"Thần Chiến Tranh",domain:"Chiến Tranh, Chết, Số Phận",       power:92, followers:1000000, icon:"🦅", desc:"Ba nữ thần chiến tranh — báo điềm chết chóc và chiến thắng", tier:"great" }
  ];

  window.mythologyGodData = window.mythologyGodData || {
    gods: [],
    filter: "all",
    lastId: 0
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.mythologyGodData)); } catch(e) {}
  }

  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.mythologyGodData = JSON.parse(d);
      if (!window.mythologyGodData.gods || window.mythologyGodData.gods.length === 0) {
        window.mythologyGodData.gods = DEFAULT_GODS.slice();
        window.mythologyGodData.lastId = DEFAULT_GODS.length;
      }
    } catch(e) { window.mythologyGodData.gods = DEFAULT_GODS.slice(); }
  }

  // ─── Public API ────────────────────────────────────────────
  window.mgsGetAll = function() { return window.mythologyGodData.gods || []; };

  window.mgsFilterByPantheon = function(pid) {
    window.mythologyGodData.filter = pid;
    window.mgsRenderPanel();
    if (typeof window.sysHubSwitch === 'function') window.sysHubSwitch('creator-hub-v32', 'myth-gods-v42');
  };

  window.mgsAddGod = function(godObj) {
    window.mythologyGodData.lastId = (window.mythologyGodData.lastId || 0) + 1;
    const god = Object.assign({ id: "custom_god_" + window.mythologyGodData.lastId, pantheon: "custom", tier: "great", power: 80, followers: 100000 }, godObj);
    window.mythologyGodData.gods.push(god);
    _updateStats();
    save();
    if (typeof window.htAddEvent === 'function') window.htAddEvent({ year: window.year || 1, type: "divine", title: "✨ Thần Mới: " + god.name, color: "#f59e0b" });
    window.mgsRenderPanel();
  };

  window.mgsDeleteGod = function(id) {
    window.mythologyGodData.gods = window.mythologyGodData.gods.filter(function(g) { return g.id !== id; });
    _updateStats();
    save();
    window.mgsRenderPanel();
  };

  function _updateStats() {
    if (typeof window.mdbUpdateStats === 'function') {
      window.mdbUpdateStats({ totalGods: window.mythologyGodData.gods.length });
    }
  }

  const TIER_COLORS = { supreme: "#f59e0b", great: "#3b82f6", lesser: "#10b981", hero: "#8b5cf6" };
  const TIER_LABELS = { supreme: "Tối Cao", great: "Vĩ Đại", lesser: "Thứ Thần", hero: "Anh Hùng" };

  window.mgsRenderPanel = function() {
    const panel = document.getElementById("panel-myth-gods-v42");
    if (!panel) return;
    const data = window.mythologyGodData;
    const filter = data.filter || "all";
    const pantheons = typeof window.mdbGetPantheons === 'function' ? window.mdbGetPantheons() : [];
    let gods = data.gods || [];
    if (filter !== "all") gods = gods.filter(function(g) { return g.pantheon === filter; });

    const filterBtns = ['<button onclick="window.mythologyGodData.filter=\'all\';window.mgsRenderPanel()" ' +
      'style="padding:3px 8px;background:' + (filter==='all'?'#f59e0b22':'transparent') + ';border:1px solid ' + (filter==='all'?'#f59e0b':'#1e293b') + ';' +
      'color:' + (filter==='all'?'#f59e0b':'#64748b') + ';border-radius:4px;cursor:pointer;font-size:10px">Tất Cả</button>']
      .concat(pantheons.map(function(p) {
        const active = filter === p.id;
        return '<button onclick="window.mythologyGodData.filter=\'' + p.id + '\';window.mgsRenderPanel()" ' +
          'style="padding:3px 8px;background:' + (active ? p.color+'22' : 'transparent') + ';border:1px solid ' + (active ? p.color : '#1e293b') + ';' +
          'color:' + (active ? p.color : '#64748b') + ';border-radius:4px;cursor:pointer;font-size:10px">' + p.icon + ' ' + p.name.split(' ').pop() + '</button>';
      })).join(" ");

    const godCards = gods.map(function(g) {
      const tc = TIER_COLORS[g.tier] || "#64748b";
      const tl = TIER_LABELS[g.tier] || g.tier;
      const pInfo = pantheons.find(function(p) { return p.id === g.pantheon; }) || {};
      const isDefault = DEFAULT_GODS.some(function(d) { return d.id === g.id; });
      return '<div style="background:#0f172a;border:1px solid ' + tc + '33;border-left:3px solid ' + tc + ';border-radius:8px;padding:10px">' +
        '<div style="display:flex;justify-content:space-between;align-items:start">' +
          '<div style="display:flex;gap:8px;align-items:center">' +
            '<span style="font-size:22px">' + (g.icon || '✨') + '</span>' +
            '<div>' +
              '<div style="font-weight:bold;color:#e2e8f0;font-size:12px">' + g.name + '</div>' +
              '<div style="font-size:10px;color:#64748b">' + g.title + '</div>' +
              '<div style="font-size:9px;color:' + (pInfo.color||'#64748b') + '">' + (pInfo.icon||'') + ' ' + (pInfo.name||g.pantheon) + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="text-align:right">' +
            '<span style="background:' + tc + '22;color:' + tc + ';border-radius:4px;padding:2px 6px;font-size:9px">' + tl + '</span>' +
            (!isDefault ? '<br><button onclick="window.mgsDeleteGod(\'' + g.id + '\')" style="margin-top:4px;background:transparent;border:none;color:#ef4444;cursor:pointer;font-size:10px">🗑</button>' : '') +
          '</div>' +
        '</div>' +
        '<div style="margin-top:6px;font-size:10px;color:#94a3b8">' + g.desc + '</div>' +
        '<div style="display:flex;gap:10px;margin-top:6px;font-size:10px">' +
          '<span style="color:#f59e0b">⚡ Sức Mạnh: <b>' + g.power + '</b></span>' +
          '<span style="color:#10b981">🙏 Tín Đồ: <b>' + (g.followers >= 1000000 ? (g.followers/1000000).toFixed(1)+'M' : (g.followers/1000).toFixed(0)+'K') + '</b></span>' +
        '</div>' +
        '<div style="margin-top:4px;font-size:10px;color:#60a5fa">🌟 Lĩnh Vực: ' + g.domain + '</div>' +
      '</div>';
    }).join("");

    // Form thêm thần mới
    const addForm =
      '<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-top:12px">' +
        '<div style="font-size:11px;color:#f59e0b;font-weight:bold;margin-bottom:8px">✨ Thêm Thần Mới</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">' +
          '<input id="mg-name" placeholder="Tên thần..." style="background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px 8px;color:#e2e8f0;font-size:11px">' +
          '<input id="mg-title" placeholder="Danh hiệu..." style="background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px 8px;color:#e2e8f0;font-size:11px">' +
          '<input id="mg-domain" placeholder="Lĩnh vực cai quản..." style="background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px 8px;color:#e2e8f0;font-size:11px">' +
          '<input id="mg-icon" placeholder="Icon (emoji)..." style="background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px 8px;color:#e2e8f0;font-size:11px">' +
        '</div>' +
        '<input id="mg-desc" placeholder="Mô tả thần..." style="width:100%;box-sizing:border-box;background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px 8px;color:#e2e8f0;font-size:11px;margin-bottom:6px">' +
        '<div style="display:flex;gap:6px">' +
          '<select id="mg-pantheon" style="flex:1;background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px;color:#e2e8f0;font-size:11px">' +
            pantheons.map(function(p){ return '<option value="'+p.id+'">'+p.icon+' '+p.name+'</option>'; }).join("") +
          '</select>' +
          '<select id="mg-tier" style="flex:1;background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px;color:#e2e8f0;font-size:11px">' +
            '<option value="supreme">Tối Cao</option><option value="great" selected>Vĩ Đại</option><option value="lesser">Thứ Thần</option><option value="hero">Anh Hùng</option>' +
          '</select>' +
          '<button onclick="(function(){var n=document.getElementById(\'mg-name\').value;if(!n)return;window.mgsAddGod({name:n,title:document.getElementById(\'mg-title\').value,domain:document.getElementById(\'mg-domain\').value,icon:document.getElementById(\'mg-icon\').value||\'✨\',desc:document.getElementById(\'mg-desc\').value,pantheon:document.getElementById(\'mg-pantheon\').value,tier:document.getElementById(\'mg-tier\').value,power:80,followers:500000})})()" ' +
            'style="background:#f59e0b;border:none;color:#000;border-radius:4px;padding:5px 12px;cursor:pointer;font-size:11px;font-weight:bold">+ Tạo</button>' +
        '</div>' +
      '</div>';

    panel.innerHTML =
      '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">' +
        '<div style="font-size:13px;font-weight:bold;color:#f59e0b;margin-bottom:8px">✨ Thần Linh — ' + gods.length + ' vị thần</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">' + filterBtns + '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' + (godCards || '<div style="color:#334155;text-align:center;padding:20px;grid-column:1/-1">Không có thần linh nào phù hợp</div>') + '</div>' +
        addForm +
      '</div>';
  };

  function init() {
    load();
    _updateStats();
    console.log("[MythGodSystem V42] ✨ Thần Linh — " + window.mythologyGodData.gods.length + " vị thần khởi tạo.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 2100); });
  } else {
    setTimeout(init, 2100);
  }
})();
