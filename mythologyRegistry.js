(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════
  // MYTHOLOGY REGISTRY V42 — Hub UI Tổng Hợp
  // Tích hợp tất cả mythology systems + AI suggestions
  // Passive: không có save key, không hook gameTick
  // ═══════════════════════════════════════════════════════════

  // ─── TỔNG QUAN HỆ THẦN THOẠI ──────────────────────────────
  window.mregRenderPanel = function() {
    const panel = document.getElementById("panel-myth-overview-v42");
    if (!panel) return;

    const pantheons = typeof window.mdbGetPantheons === 'function' ? window.mdbGetPantheons() : [];
    const gods      = typeof window.mgsGetAll === 'function' ? window.mgsGetAll() : [];
    const creatures = typeof window.mcsGetAll === 'function' ? window.mcsGetAll() : [];
    const artifacts = typeof window.masGetAll === 'function' ? window.masGetAll() : [];
    const lore      = typeof window.mlsGetAll === 'function' ? window.mlsGetAll() : [];

    // Stats tổng hợp
    const statCards = [
      { icon: "🗺️", label: "Hệ Thần Thoại", val: pantheons.length, color: "#f59e0b" },
      { icon: "✨", label: "Thần Linh",       val: gods.length,      color: "#f59e0b" },
      { icon: "🐉", label: "Sinh Vật",        val: creatures.length, color: "#10b981" },
      { icon: "⚔️", label: "Thánh Vật",       val: artifacts.length, color: "#3b82f6" },
      { icon: "📜", label: "Lore",             val: lore.length,      color: "#8b5cf6" }
    ].map(function(s) {
      return '<div style="text-align:center;background:#0f172a;border-radius:8px;padding:12px;cursor:pointer">' +
        '<div style="font-size:22px">' + s.icon + '</div>' +
        '<div style="font-size:22px;font-weight:bold;color:' + s.color + '">' + s.val + '</div>' +
        '<div style="font-size:10px;color:#64748b">' + s.label + '</div></div>';
    }).join("");

    // Pantheon overview mini cards
    const pantheonMinis = pantheons.map(function(p) {
      const pgods      = gods.filter(function(g)      { return g.pantheon === p.id; }).length;
      const pcreatures = creatures.filter(function(c)  { return c.pantheon === p.id; }).length;
      const partifacts = artifacts.filter(function(a)  { return a.pantheon === p.id; }).length;
      const plore      = lore.filter(function(l)       { return l.pantheon === p.id; }).length;
      return '<div style="background:#0f172a;border:1px solid ' + p.color + '33;border-radius:8px;padding:10px">' +
        '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">' +
          '<span style="font-size:18px">' + p.icon + '</span>' +
          '<div>' +
            '<div style="font-size:11px;font-weight:bold;color:' + p.color + '">' + p.name + '</div>' +
            '<div style="font-size:9px;color:#64748b">' + p.origin + '</div>' +
          '</div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:3px;text-align:center">' +
          '<div style="font-size:10px"><div style="color:#f59e0b;font-weight:bold">' + pgods + '</div><div style="color:#64748b;font-size:8px">Thần</div></div>' +
          '<div style="font-size:10px"><div style="color:#10b981;font-weight:bold">' + pcreatures + '</div><div style="color:#64748b;font-size:8px">SV</div></div>' +
          '<div style="font-size:10px"><div style="color:#3b82f6;font-weight:bold">' + partifacts + '</div><div style="color:#64748b;font-size:8px">TV</div></div>' +
          '<div style="font-size:10px"><div style="color:#8b5cf6;font-weight:bold">' + plore + '</div><div style="color:#64748b;font-size:8px">Lore</div></div>' +
        '</div>' +
      '</div>';
    }).join("");

    // Quick nav buttons
    const quickNav =
      '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:12px">' +
        [
          { icon:"✨", label:"Thần Linh",  tab:"myth-gods-v42",      color:"#f59e0b" },
          { icon:"🐉", label:"Sinh Vật",   tab:"myth-creatures-v42", color:"#10b981" },
          { icon:"⚔️", label:"Thánh Vật",  tab:"myth-artifacts-v42", color:"#3b82f6" },
          { icon:"📜", label:"Lore",        tab:"myth-lore-v42",      color:"#8b5cf6" },
          { icon:"🗄️", label:"Database",   tab:"myth-database-v42",  color:"#64748b" }
        ].map(function(n) {
          return '<button onclick="if(typeof sysHubSwitch===\'function\')sysHubSwitch(\'creator-hub-v32\',\'' + n.tab + '\')" ' +
            'style="background:' + n.color + '22;border:1px solid ' + n.color + '44;border-radius:6px;padding:8px;cursor:pointer;text-align:center">' +
            '<div style="font-size:18px">' + n.icon + '</div>' +
            '<div style="font-size:9px;color:' + n.color + ';margin-top:2px">' + n.label + '</div></button>';
        }).join("") +
      '</div>';

    // AI Suggest button
    const aiSection =
      '<div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:12px;margin-top:12px">' +
        '<div style="font-size:11px;color:#f59e0b;font-weight:bold;margin-bottom:8px">🤖 AI Mythology Assistant</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">' +
          '<button onclick="window.mregAISuggestGod()" style="background:#f59e0b22;border:1px solid #f59e0b44;border-radius:6px;padding:8px;cursor:pointer;color:#f59e0b;font-size:10px">✨ Đề xuất Thần mới</button>' +
          '<button onclick="window.mregAISuggestCreature()" style="background:#10b98122;border:1px solid #10b98144;border-radius:6px;padding:8px;cursor:pointer;color:#10b981;font-size:10px">🐉 Đề xuất Sinh Vật</button>' +
          '<button onclick="window.mregAISuggestArtifact()" style="background:#3b82f622;border:1px solid #3b82f644;border-radius:6px;padding:8px;cursor:pointer;color:#3b82f6;font-size:10px">⚔️ Đề xuất Thánh Vật</button>' +
          '<button onclick="window.mregAISuggestLore()" style="background:#8b5cf622;border:1px solid #8b5cf644;border-radius:6px;padding:8px;cursor:pointer;color:#8b5cf6;font-size:10px">📜 Sinh Lore mới</button>' +
        '</div>' +
        '<div id="mreg-ai-output" style="margin-top:8px;min-height:20px;font-size:10px;color:#94a3b8"></div>' +
      '</div>';

    panel.innerHTML =
      '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">' +
        '<div style="font-size:14px;font-weight:bold;color:#f59e0b;margin-bottom:10px">📖 Thư Viện Thần Thoại Toàn Cầu V42</div>' +
        quickNav +
        '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:14px">' + statCards + '</div>' +
        '<div style="font-size:11px;color:#64748b;margin-bottom:8px">10 HỆ THẦN THOẠI — TỔNG QUAN</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' + pantheonMinis + '</div>' +
        aiSection +
      '</div>';
  };

  // ─── AI SUGGESTION FUNCTIONS ───────────────────────────────
  const _MYTH_AI_SUGGESTIONS = {
    gods: [
      { name:"Thần Gió Đông", pantheon:"vietnam", domain:"Gió, Mùa Xuân", power:82, icon:"🌬️", title:"Đông Phong Chi Thần", desc:"Vị thần mang làn gió ấm mùa xuân, báo hiệu mùa màng bội thu cho nông dân Việt", tier:"great", followers:1000000 },
      { name:"Hecate", pantheon:"greek", domain:"Ma Thuật, Trăng, Ngã Ba Đường", power:90, icon:"🌙", title:"Nữ Thần Phù Thủy", desc:"Thần ma thuật đêm tối, canh giữ ngã ba đường và dẫn đường kẻ chết về Hades", tier:"great", followers:800000 },
      { name:"Heimdall", pantheon:"norse", domain:"Canh Gác, Ánh Sáng, Phòng Thủ", power:88, icon:"🌅", title:"Người Canh Asgard", desc:"Thần canh giữ cầu Bifrost vào Asgard, có thể nhìn và nghe mọi thứ trong vũ trụ", tier:"great", followers:500000 },
      { name:"Bastet", pantheon:"egypt", domain:"Mèo, Bảo Vệ, Âm Nhạc", power:85, icon:"🐱", title:"Nữ Thần Mèo", desc:"Thần đầu mèo bảo vệ gia đình và pharaoh, mang lại niềm vui và bảo hộ", tier:"great", followers:2000000 },
      { id:"cn_ne_zha", name:"Né Tra (哪吒)", pantheon:"chinese", domain:"Chiến Tranh, Trẻ Em, Bảo Vệ", power:89, icon:"🔥", title:"Anh Hùng Nhỏ", desc:"Thần đồng bất tử tái sinh từ sen trắng, tay cầm Càn Khôn Khuyên và Hỏa Tiêm Thương", tier:"great", followers:5000000 }
    ],
    creatures: [
      { name:"Cửu Vĩ Hồ", pantheon:"chinese", type:"Yêu Hồ", icon:"🦊", power:88, desc:"Cáo chín đuôi đã tu luyện nghìn năm, có thể biến thành người đẹp lừa dối các quan chức và thần linh", origin:"Rừng Linh Sơn", threat:"nguy hiểm" },
      { name:"Baku", pantheon:"japanese", type:"Ăn Ác Mộng", icon:"🐘", power:75, desc:"Sinh vật đầu voi mình gấu ăn ác mộng của con người khi được cầu khấn sau khi thức giấc", origin:"Nhật Bản", threat:"lành tính" },
      { name:"Jörmungandr", pantheon:"norse", type:"Rắn Thần", icon:"🐍", power:98, desc:"Rắn thế giới con của Loki dài đủ quấn quanh Midgard — khi Ragnarök, sẽ đấu Thor đến chết", origin:"Đại Dương Midgard", threat:"hủy diệt" }
    ],
    artifacts: [
      { name:"Anka Feather", pantheon:"egypt", type:"Bảo Vật", icon:"🪶", power:90, owner:"Thần Thoth", desc:"Lông vũ thần Thoth dùng để cân linh hồn người chết — lông nhẹ hơn tim là người tốt", effect:"Phán xét linh hồn công bằng tuyệt đối" },
      { name:"Trống Đồng Thần", pantheon:"vietnam", type:"Nhạc Khí Thần", icon:"🥁", power:85, owner:"Lạc Hầu", desc:"Trống đồng Đông Sơn khi đánh lên triệu tập mưa, truyền lệnh thần linh và kết nối âm dương", effect:"Triệu mưa, kết nối thần linh" }
    ],
    lore: [
      { title:"Tản Viên Sơn Thánh", pantheon:"vietnam", type:"Truyền Thuyết", icon:"⛰️", era:"Văn Lang", content:"Thần Núi Tản Viên — một trong Tứ Bất Tử Việt Nam. Nhặt được cây gậy thần từ ông cụ, chữa lành mọi vật, cưới Mỵ Nương và chiến thắng Thủy Tinh muôn đời.", moral:"Lòng tốt và sự kiên trì chiến thắng kẻ mạnh hơn" },
      { title:"Sự Ra Đời của Athena", pantheon:"greek", type:"Huyền Thoại", icon:"🦉", era:"Olympus", content:"Zeus nuốt vợ Metis khi mang thai, đến ngày Athena ra đời thì đau đầu khủng khiếp. Hephaestus bổ đầu Zeus bằng búa — Athena nhảy ra đầy đủ giáp trụ và trí tuệ.", moral:"Trí tuệ sinh ra từ sự kết hợp của quyền năng và trí khôn" }
    ]
  };

  window.mregAISuggestGod = function() {
    const out = document.getElementById("mreg-ai-output");
    if (!out) return;
    const suggestions = _MYTH_AI_SUGGESTIONS.gods;
    const s = suggestions[Math.floor(Math.random() * suggestions.length)];
    out.innerHTML =
      '<div style="background:#f59e0b11;border:1px solid #f59e0b33;border-radius:6px;padding:8px">' +
        '<div style="color:#f59e0b;font-weight:bold;font-size:11px;margin-bottom:4px">✨ AI Đề Xuất Thần: ' + s.name + '</div>' +
        '<div style="color:#94a3b8;font-size:10px;margin-bottom:6px">' + s.desc + '</div>' +
        '<button onclick="window.mgsAddGod(' + JSON.stringify(s) + ');document.getElementById(\'mreg-ai-output\').innerHTML=\'<div style=color:#10b981>✅ Đã thêm ' + s.name + ' vào Pantheon!</div>\'" ' +
          'style="background:#f59e0b;border:none;color:#000;border-radius:4px;padding:4px 10px;cursor:pointer;font-size:10px">+ Thêm Vào Thư Viện</button>' +
      '</div>';
  };

  window.mregAISuggestCreature = function() {
    const out = document.getElementById("mreg-ai-output");
    if (!out) return;
    const suggestions = _MYTH_AI_SUGGESTIONS.creatures;
    const s = suggestions[Math.floor(Math.random() * suggestions.length)];
    out.innerHTML =
      '<div style="background:#10b98111;border:1px solid #10b98133;border-radius:6px;padding:8px">' +
        '<div style="color:#10b981;font-weight:bold;font-size:11px;margin-bottom:4px">🐉 AI Đề Xuất Sinh Vật: ' + s.name + '</div>' +
        '<div style="color:#94a3b8;font-size:10px;margin-bottom:6px">' + s.desc + '</div>' +
        '<button onclick="window.mcsAddCreature(' + JSON.stringify(s) + ');document.getElementById(\'mreg-ai-output\').innerHTML=\'<div style=color:#10b981>✅ Đã thêm ' + s.name + '!</div>\'" ' +
          'style="background:#10b981;border:none;color:#000;border-radius:4px;padding:4px 10px;cursor:pointer;font-size:10px">+ Thêm Vào Thư Viện</button>' +
      '</div>';
  };

  window.mregAISuggestArtifact = function() {
    const out = document.getElementById("mreg-ai-output");
    if (!out) return;
    const suggestions = _MYTH_AI_SUGGESTIONS.artifacts;
    const s = suggestions[Math.floor(Math.random() * suggestions.length)];
    out.innerHTML =
      '<div style="background:#3b82f611;border:1px solid #3b82f633;border-radius:6px;padding:8px">' +
        '<div style="color:#3b82f6;font-weight:bold;font-size:11px;margin-bottom:4px">⚔️ AI Đề Xuất Thánh Vật: ' + s.name + '</div>' +
        '<div style="color:#94a3b8;font-size:10px;margin-bottom:6px">' + s.desc + '</div>' +
        '<button onclick="window.masAddArtifact(' + JSON.stringify(s) + ');document.getElementById(\'mreg-ai-output\').innerHTML=\'<div style=color:#10b981>✅ Đã thêm ' + s.name + '!</div>\'" ' +
          'style="background:#3b82f6;border:none;color:#fff;border-radius:4px;padding:4px 10px;cursor:pointer;font-size:10px">+ Thêm Vào Thư Viện</button>' +
      '</div>';
  };

  window.mregAISuggestLore = function() {
    const out = document.getElementById("mreg-ai-output");
    if (!out) return;
    const suggestions = _MYTH_AI_SUGGESTIONS.lore;
    const s = suggestions[Math.floor(Math.random() * suggestions.length)];
    out.innerHTML =
      '<div style="background:#8b5cf611;border:1px solid #8b5cf633;border-radius:6px;padding:8px">' +
        '<div style="color:#8b5cf6;font-weight:bold;font-size:11px;margin-bottom:4px">📜 AI Sinh Lore: ' + s.title + '</div>' +
        '<div style="color:#94a3b8;font-size:10px;margin-bottom:6px">' + (s.content || '').substring(0,120) + '...</div>' +
        '<button onclick="window.mlsAddLore(' + JSON.stringify(s) + ');document.getElementById(\'mreg-ai-output\').innerHTML=\'<div style=color:#10b981>✅ Đã thêm Lore!</div>\'" ' +
          'style="background:#8b5cf6;border:none;color:#fff;border-radius:4px;padding:4px 10px;cursor:pointer;font-size:10px">+ Thêm Vào Thư Viện</button>' +
      '</div>';
  };

  function init() {
    console.log("[MythologyRegistry V42] 📖 Thư Viện Thần Thoại Toàn Cầu — Hub UI sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 2500); });
  } else {
    setTimeout(init, 2500);
  }
})();
