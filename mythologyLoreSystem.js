(function() {
  "use strict";
  const SAVE_KEY = "cgv6_myth_lore_v42";

  // ═══════════════════════════════════════════════════════════
  // MYTHOLOGY LORE SYSTEM V42 — Truyền Thuyết & Sử Thi
  // ═══════════════════════════════════════════════════════════

  const DEFAULT_LORE = [
    // Việt Nam
    { id:"l_banh_chung",    pantheon:"vietnam",  title:"Bánh Chưng Bánh Dày",      type:"Truyền Thuyết", icon:"🍀",
      content:"Hoàng tử Lang Liêu được tiên chỉ dạy làm bánh vuông tượng đất, bánh tròn tượng trời — dâng vua Hùng và được nối ngôi, khai sinh tục làm bánh Tết người Việt.",
      moral:"Hiếu thảo và sáng tạo là đức hạnh cao quý nhất", era:"Thời Vua Hùng" },
    { id:"l_son_tinh_thuy_tinh", pantheon:"vietnam", title:"Sơn Tinh Thủy Tinh", type:"Sử Thi", icon:"🌊",
      content:"Hai vị thần tranh nhau lấy Mỵ Nương — Sơn Tinh thần núi Tản Viên thắng. Thủy Tinh tức giận dâng nước lũ mỗi năm để trả thù, tạo ra quy luật lũ lụt mùa thu.",
      moral:"Tình yêu và sự ghen tuông tạo nên các hiện tượng tự nhiên", era:"Thượng Cổ" },
    { id:"l_chu_dong_tu",   pantheon:"vietnam",  title:"Chử Đồng Tử",              type:"Huyền Thoại", icon:"💕",
      content:"Chàng trai nghèo Chử Đồng Tử gặp công chúa Tiên Dung — sau thành tiên, trở thành biểu tượng tình yêu vượt giai cấp và một trong Tứ Bất Tử.",
      moral:"Tình yêu chân thành vượt mọi ranh giới xã hội", era:"Văn Lang" },
    // Hy Lạp
    { id:"l_iliad",         pantheon:"greek",   title:"Iliad — Chiến Tranh Thành Troia", type:"Sử Thi", icon:"⚔️",
      content:"Mười năm chiến tranh giữa Hy Lạp và Troia vì nàng Helen. Achilles, Odysseus, Hector — những anh hùng lẫy lừng chiến đấu dưới mắt các thần trên Olympus.",
      moral:"Vinh quang và số phận — không ai trốn thoát được định mệnh", era:"Thời Hùng" },
    { id:"l_prometheus",    pantheon:"greek",   title:"Prometheus Đánh Cắp Lửa",   type:"Huyền Thoại", icon:"🔥",
      content:"Titan Prometheus thương yêu loài người, đánh cắp lửa từ các thần để trao cho con người. Zeus trừng phạt bằng cách xích ông vào núi đá, cho đại bàng mổ gan mỗi ngày.",
      moral:"Hy sinh vì nhân loại đi kèm hậu quả từ quyền năng tối cao", era:"Thời Titan" },
    { id:"l_odyssey",       pantheon:"greek",   title:"Odyssey — Hành Trình Về Nhà", type:"Sử Thi", icon:"🌊",
      content:"Odysseus mất 10 năm trở về Ithaca sau Chiến Tranh Troia — đối mặt Cyclops, Sirens, Scylla, Charybdis và thần Poseidon. Cuối cùng đoàn tụ với vợ Penelope.",
      moral:"Sự kiên trì và trí tuệ chiến thắng mọi gian nan", era:"Hậu Chiến Troia" },
    // Bắc Âu
    { id:"l_ragnarok",      pantheon:"norse",   title:"Ragnarök — Hoàng Hôn Của Thần", type:"Sử Thi", icon:"💀",
      content:"Cuộc chiến cuối cùng giữa các thần Asgard và quái vật — Odin bị Fenrir nuốt, Thor diệt Jormungandr rồi chết vì nọc độc. Thế giới cũ chìm xuống biển, thế giới mới nổi lên.",
      moral:"Kể cả thần cũng không thoát khỏi chu kỳ sinh diệt — từ tàn phá sinh tái tạo", era:"Tận Thế" },
    { id:"l_odin_runic",    pantheon:"norse",   title:"Odin Tìm Rune",              type:"Huyền Thoại", icon:"🪄",
      content:"Odin tự treo mình 9 ngày 9 đêm trên cây Yggdrasil, tự đâm giáo vào mình — hy sinh để tìm ra bí mật của Rune. Qua đau khổ đạt được tri thức tối thượng.",
      moral:"Tri thức đòi hỏi sự hy sinh tuyệt đối", era:"Sơ Khai" },
    // Ai Cập
    { id:"l_osiris_murder",  pantheon:"egypt",  title:"Cái Chết và Hồi Sinh của Osiris", type:"Huyền Thoại", icon:"🌾",
      content:"Set giết Osiris, xé xác thành 14 mảnh và rải khắp Ai Cập. Isis thu thập từng mảnh, hồi sinh Osiris để hoài thai Horus. Osiris trở thành thần cai quản cõi âm.",
      moral:"Tình yêu và sự trung thành có thể chiến thắng cả cái chết", era:"Thần Kỳ" },
    // Trung Hoa
    { id:"l_monkey_king",   pantheon:"chinese", title:"Tôn Ngộ Không Đại Náo Thiên Cung", type:"Sử Thi", icon:"🐒",
      content:"Tôn Ngộ Không tự xưng Tề Thiên Đại Thánh, đại náo Long Cung lấy Như Ý Bổng, rồi đại náo Thiên Đình. Cuối cùng bị Phật Tổ Như Lai phục dưới Ngũ Hành Sơn 500 năm.",
      moral:"Tự do và quyền năng cần đi kèm trí tuệ và từ bi", era:"Tây Du Ký" },
    { id:"l_nv_wa",         pantheon:"chinese", title:"Nữ Oa Vá Trời",              type:"Huyền Thoại", icon:"🌈",
      content:"Nữ Oa nung đá ngũ sắc vá trời khi trụ trời bị Cộng Công phá vỡ — cứu thế giới khỏi diệt vong. Bà cũng dùng đất nặn ra con người và dạy họ cách sinh sôi.",
      moral:"Tình yêu thương sinh linh thúc đẩy những hành động vĩ đại nhất", era:"Hồng Hoang" },
    // Nhật Bản
    { id:"l_amaterasu_cave", pantheon:"japanese",title:"Amaterasu Ẩn Trong Hang",  type:"Huyền Thoại", icon:"☀️",
      content:"Amaterasu tức giận ẩn trong hang đá, cả thế giới chìm vào bóng tối. Tám trăm vị thần dùng âm nhạc và tiếng cười dụ bà ra ngoài — ánh sáng trở lại thế giới.",
      moral:"Ánh sáng và hy vọng luôn chiến thắng bóng tối thông qua cộng đồng đoàn kết", era:"Thần Kỳ Nhật" },
    // Ấn Độ
    { id:"l_mahabharata",   pantheon:"hindu",   title:"Mahabharata — Đại Chiến Kurukshetra", type:"Sử Thi", icon:"🏹",
      content:"Cuộc chiến giữa Pandava và Kaurava — trận chiến lớn nhất lịch sử thần thoại Ấn Độ. Krishna giải thích Bhagavad Gita cho Arjuna trước trận chiến: đạo lý chiến binh và luân hồi.",
      moral:"Dharma (đạo lý) phải được bảo vệ dù phải chiến đấu với người thân", era:"Sử Thi Vệ Đà" },
    // Maya
    { id:"l_popol_vuh",     pantheon:"maya",    title:"Popol Vuh — Sách Sáng Thế", type:"Biên Niên Sử", icon:"🌽",
      content:"Các thần tạo con người từ bùn, gỗ, rồi cuối cùng từ bột ngô. Anh hùng Hunahpu và Xbalanque chiến thắng thần chết ở Xibalba, trở thành mặt trời và mặt trăng.",
      moral:"Con người được tạo ra để phụng thờ thần linh và hòa hợp với tự nhiên", era:"Maya Cổ Đại" },
    // Celtic
    { id:"l_tuatha",        pantheon:"celtic",  title:"Tuatha Dé Danann — Thần Nhân Celtic", type:"Huyền Thoại", icon:"🍀",
      content:"Người Celtic tin các thần Tuatha Dé Danann từng cai trị Ireland trước khi bị Milesians đánh bại. Họ rút lui vào các đồi đất (sidhe) và trở thành Tiên — The Fair Folk.",
      moral:"Thần linh không biến mất — họ ẩn mình trong thế giới tự nhiên quanh ta", era:"Celtic Thượng Cổ" }
  ];

  window.mythologyLoreData = window.mythologyLoreData || { lore: [], filter: "all", lastId: 0 };

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.mythologyLoreData)); } catch(e) {} }

  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.mythologyLoreData = JSON.parse(d);
      if (!window.mythologyLoreData.lore || window.mythologyLoreData.lore.length === 0) {
        window.mythologyLoreData.lore = DEFAULT_LORE.slice();
        window.mythologyLoreData.lastId = DEFAULT_LORE.length;
      }
    } catch(e) { window.mythologyLoreData.lore = DEFAULT_LORE.slice(); }
  }

  window.mlsGetAll = function() { return window.mythologyLoreData.lore || []; };

  window.mlsAddLore = function(obj) {
    window.mythologyLoreData.lastId = (window.mythologyLoreData.lastId || 0) + 1;
    const l = Object.assign({ id: "custom_lore_" + window.mythologyLoreData.lastId, pantheon: "custom", type: "Huyền Thoại", icon: "📜", era: "Hiện Đại" }, obj);
    window.mythologyLoreData.lore.push(l);
    if (typeof window.mdbUpdateStats === 'function') window.mdbUpdateStats({ totalLore: window.mythologyLoreData.lore.length });
    save();
    if (typeof window.htAddEvent === 'function') window.htAddEvent({ year: window.year || 1, type: "story", title: "📜 Lore Mới: " + l.title, color: "#8b5cf6" });
    if (typeof window.wmeAddMemory === 'function') window.wmeAddMemory({ year: window.year || 1, category: "mythology", title: l.title, content: l.content });
    window.mlsRenderPanel();
  };

  window.mlsDeleteLore = function(id) {
    window.mythologyLoreData.lore = window.mythologyLoreData.lore.filter(function(l) { return l.id !== id; });
    if (typeof window.mdbUpdateStats === 'function') window.mdbUpdateStats({ totalLore: window.mythologyLoreData.lore.length });
    save();
    window.mlsRenderPanel();
  };

  const TYPE_COLORS = { "Truyền Thuyết": "#f59e0b", "Sử Thi": "#ef4444", "Huyền Thoại": "#8b5cf6", "Biên Niên Sử": "#3b82f6", "Tiên Tri": "#10b981" };

  window.mlsRenderPanel = function() {
    const panel = document.getElementById("panel-myth-lore-v42");
    if (!panel) return;
    const data = window.mythologyLoreData;
    const filter = data.filter || "all";
    const pantheons = typeof window.mdbGetPantheons === 'function' ? window.mdbGetPantheons() : [];
    let lore = data.lore || [];
    if (filter !== "all") lore = lore.filter(function(l) { return l.pantheon === filter; });

    const filterBtns = ['<button onclick="window.mythologyLoreData.filter=\'all\';window.mlsRenderPanel()" style="padding:3px 8px;background:' + (filter==='all'?'#8b5cf622':'transparent') + ';border:1px solid ' + (filter==='all'?'#8b5cf6':'#1e293b') + ';color:' + (filter==='all'?'#8b5cf6':'#64748b') + ';border-radius:4px;cursor:pointer;font-size:10px">Tất Cả</button>']
      .concat(pantheons.map(function(p) {
        const a = filter === p.id;
        return '<button onclick="window.mythologyLoreData.filter=\'' + p.id + '\';window.mlsRenderPanel()" style="padding:3px 8px;background:' + (a?p.color+'22':'transparent') + ';border:1px solid ' + (a?p.color:'#1e293b') + ';color:' + (a?p.color:'#64748b') + ';border-radius:4px;cursor:pointer;font-size:10px">' + p.icon + ' ' + p.name.split(' ').pop() + '</button>';
      })).join(" ");

    const cards = lore.map(function(l) {
      const tc = TYPE_COLORS[l.type] || "#64748b";
      const pInfo = pantheons.find(function(p) { return p.id === l.pantheon; }) || {};
      const isDefault = DEFAULT_LORE.some(function(d) { return d.id === l.id; });
      return '<div style="background:#0f172a;border:1px solid ' + tc + '33;border-left:3px solid ' + tc + ';border-radius:8px;padding:12px">' +
        '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px">' +
          '<div>' +
            '<div style="display:flex;align-items:center;gap:6px">' +
              '<span style="font-size:18px">' + (l.icon||'📜') + '</span>' +
              '<div style="font-weight:bold;color:#e2e8f0;font-size:12px">' + l.title + '</div>' +
            '</div>' +
            '<div style="display:flex;gap:6px;margin-top:4px">' +
              '<span style="background:' + tc + '22;color:' + tc + ';border-radius:4px;padding:1px 6px;font-size:9px">' + l.type + '</span>' +
              (l.era ? '<span style="color:#64748b;font-size:9px">⏳ ' + l.era + '</span>' : '') +
              '<span style="color:' + (pInfo.color||'#64748b') + ';font-size:9px">' + (pInfo.icon||'') + ' ' + (pInfo.name||l.pantheon) + '</span>' +
            '</div>' +
          '</div>' +
          (!isDefault ? '<button onclick="window.mlsDeleteLore(\'' + l.id + '\')" style="background:transparent;border:none;color:#ef4444;cursor:pointer;font-size:11px">🗑</button>' : '') +
        '</div>' +
        '<div style="font-size:11px;color:#94a3b8;line-height:1.5;margin-bottom:6px">' + l.content + '</div>' +
        (l.moral ? '<div style="font-size:10px;color:#a78bfa;font-style:italic;border-top:1px solid #1e293b;padding-top:5px">💭 ' + l.moral + '</div>' : '') +
      '</div>';
    }).join("");

    const addForm =
      '<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-top:12px">' +
        '<div style="font-size:11px;color:#8b5cf6;font-weight:bold;margin-bottom:8px">📜 Thêm Truyền Thuyết Mới</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">' +
          '<input id="ml-title" placeholder="Tiêu đề..." style="background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px 8px;color:#e2e8f0;font-size:11px">' +
          '<input id="ml-icon" placeholder="Icon..." style="background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px 8px;color:#e2e8f0;font-size:11px">' +
          '<input id="ml-era" placeholder="Thời đại..." style="background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px 8px;color:#e2e8f0;font-size:11px">' +
          '<select id="ml-type" style="background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px;color:#e2e8f0;font-size:11px">' +
            ['Truyền Thuyết','Sử Thi','Huyền Thoại','Biên Niên Sử','Tiên Tri'].map(function(t){ return '<option>'+t+'</option>'; }).join("") +
          '</select>' +
        '</div>' +
        '<textarea id="ml-content" placeholder="Nội dung câu chuyện..." rows="3" style="width:100%;box-sizing:border-box;background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px 8px;color:#e2e8f0;font-size:11px;resize:vertical;margin-bottom:4px"></textarea>' +
        '<input id="ml-moral" placeholder="Bài học / Ý nghĩa..." style="width:100%;box-sizing:border-box;background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px 8px;color:#e2e8f0;font-size:11px;margin-bottom:6px">' +
        '<div style="display:flex;gap:6px">' +
          '<select id="ml-pantheon" style="flex:1;background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px;color:#e2e8f0;font-size:11px">' +
            pantheons.map(function(p){ return '<option value="'+p.id+'">'+p.icon+' '+p.name+'</option>'; }).join("") +
          '</select>' +
          '<button onclick="(function(){var t=document.getElementById(\'ml-title\').value;if(!t)return;window.mlsAddLore({title:t,icon:document.getElementById(\'ml-icon\').value||\'📜\',type:document.getElementById(\'ml-type\').value,era:document.getElementById(\'ml-era\').value,content:document.getElementById(\'ml-content\').value,moral:document.getElementById(\'ml-moral\').value,pantheon:document.getElementById(\'ml-pantheon\').value})})()" ' +
            'style="background:#8b5cf6;border:none;color:#fff;border-radius:4px;padding:5px 12px;cursor:pointer;font-size:11px;font-weight:bold">+ Tạo</button>' +
        '</div>' +
      '</div>';

    panel.innerHTML =
      '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">' +
        '<div style="font-size:13px;font-weight:bold;color:#8b5cf6;margin-bottom:8px">📜 Truyền Thuyết & Sử Thi — ' + lore.length + ' câu chuyện</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">' + filterBtns + '</div>' +
        '<div style="display:flex;flex-direction:column;gap:8px">' + (cards || '<div style="color:#334155;text-align:center;padding:20px">Không có truyền thuyết nào</div>') + '</div>' +
        addForm +
      '</div>';
  };

  function init() {
    load();
    if (typeof window.mdbUpdateStats === 'function') window.mdbUpdateStats({ totalLore: window.mythologyLoreData.lore.length });
    console.log("[MythLoreSystem V42] 📜 Truyền Thuyết — " + window.mythologyLoreData.lore.length + " câu chuyện khởi tạo.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 2400); });
  } else {
    setTimeout(init, 2400);
  }
})();
