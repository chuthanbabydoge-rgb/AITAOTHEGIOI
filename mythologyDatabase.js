(function() {
  "use strict";
  const SAVE_KEY = "cgv6_myth_db_v42";

  // ═══════════════════════════════════════════════════════════
  // MYTHOLOGY DATABASE V42 — Creator God V6
  // Core database cho 10 hệ thần thoại toàn cầu
  // ═══════════════════════════════════════════════════════════

  const DEFAULT_PANTHEONS = [
    {
      id: "vietnam",   name: "Thần Thoại Việt Nam",  icon: "🇻🇳",
      color: "#dc2626", origin: "Đông Nam Á",
      desc: "Thần thoại dân gian Việt Nam — Tứ Bất Tử, Hùng Vương, Tiên Rồng",
      themes: ["Nước","Rồng","Tiên","Đất","Mẹ"],
      era: "Thượng Cổ – Phong Kiến"
    },
    {
      id: "greek",     name: "Thần Thoại Hy Lạp",   icon: "🏛️",
      color: "#2563eb", origin: "Địa Trung Hải",
      desc: "Olympus — 12 vị thần tối cao cai trị vũ trụ và con người",
      themes: ["Olympus","Anh Hùng","Chiến Tranh","Tình Yêu","Số Phận"],
      era: "Cổ Đại Hy Lạp"
    },
    {
      id: "norse",     name: "Thần Thoại Bắc Âu",   icon: "⚡",
      color: "#7c3aed", origin: "Bắc Âu",
      desc: "Asgard — Odin, Thor, Loki và cuộc chiến Ragnarök",
      themes: ["Asgard","Chiến Binh","Ragnarök","Rune","Số Phận"],
      era: "Viking – Trung Cổ"
    },
    {
      id: "egypt",     name: "Thần Thoại Ai Cập",   icon: "🏺",
      color: "#d97706", origin: "Bắc Phi",
      desc: "Thần Mặt Trời Ra, Osiris, Isis — vương quốc của cái chết và sự sống",
      themes: ["Mặt Trời","Cái Chết","Tái Sinh","Pharaoh","Ma Thuật"],
      era: "Ai Cập Cổ Đại"
    },
    {
      id: "chinese",   name: "Thần Thoại Trung Hoa", icon: "🐲",
      color: "#dc2626", origin: "Đông Á",
      desc: "Thiên Đình, Ngọc Hoàng, Tứ Hải Long Vương — trật tự thiên địa",
      themes: ["Thiên Đình","Rồng","Bất Tử","Đan Dược","Thiên Mệnh"],
      era: "Thần Thoại Cổ Đại Trung Hoa"
    },
    {
      id: "japanese",  name: "Thần Thoại Nhật Bản",  icon: "⛩️",
      color: "#db2777", origin: "Đông Á",
      desc: "Amaterasu, Susanoo — thần đạo Shinto và tám triệu vị thần",
      themes: ["Tự Nhiên","Samurai","Yêu Quái","Linh Hồn","Thần Đạo"],
      era: "Thần Đạo Cổ Đại"
    },
    {
      id: "hindu",     name: "Thần Thoại Ấn Độ",    icon: "🕉️",
      color: "#f59e0b", origin: "Nam Á",
      desc: "Brahma, Vishnu, Shiva — Trimurti và vòng luân hồi vũ trụ",
      themes: ["Trimurti","Luân Hồi","Dharma","Yoga","Vũ Trụ"],
      era: "Vệ Đà – Sử Thi"
    },
    {
      id: "maya",      name: "Thần Thoại Maya",     icon: "🌽",
      color: "#16a34a", origin: "Trung Mỹ",
      desc: "Kukulkan, Hunahpu — thần ngô, lịch Maya và sự sáng thế",
      themes: ["Ngô","Lịch","Bóng Tối","Mặt Trời","Hy Sinh"],
      era: "Nền Văn Minh Maya"
    },
    {
      id: "celtic",    name: "Thần Thoại Celtic",   icon: "🍀",
      color: "#059669", origin: "Tây Âu",
      desc: "Dagda, Morrigan — thần Druids, Otherworld và chu kỳ tự nhiên",
      themes: ["Thiên Nhiên","Druids","Chiến Tranh","Ma Thuật","Sự Sống"],
      era: "Celtic Cổ Đại"
    },
    {
      id: "custom",    name: "Thần Thoại Tùy Chỉnh", icon: "✨",
      color: "#8b5cf6", origin: "Sáng Tạo",
      desc: "Hệ thần thoại do Creator God tự xây dựng cho thế giới của mình",
      themes: ["Tùy Chỉnh"],
      era: "Hiện Đại"
    }
  ];

  window.mythologyDatabaseData = window.mythologyDatabaseData || {
    pantheons: DEFAULT_PANTHEONS,
    stats: { totalGods: 0, totalCreatures: 0, totalArtifacts: 0, totalLore: 0 },
    lastUpdated: Date.now()
  };

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(window.mythologyDatabaseData));
    } catch(e) { console.warn("[MythDB] save error", e); }
  }

  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) {
        const parsed = JSON.parse(d);
        // Merge: giữ DEFAULT_PANTHEONS nếu pantheons bị thiếu
        if (!parsed.pantheons || parsed.pantheons.length < DEFAULT_PANTHEONS.length) {
          parsed.pantheons = DEFAULT_PANTHEONS;
        }
        window.mythologyDatabaseData = parsed;
      }
    } catch(e) { console.warn("[MythDB] load error", e); }
  }

  // ─── Public API ────────────────────────────────────────────
  window.mdbGetPantheons = function() {
    return window.mythologyDatabaseData.pantheons || DEFAULT_PANTHEONS;
  };

  window.mdbGetPantheon = function(id) {
    return (window.mythologyDatabaseData.pantheons || []).find(function(p) { return p.id === id; });
  };

  window.mdbUpdateStats = function(stats) {
    window.mythologyDatabaseData.stats = Object.assign(window.mythologyDatabaseData.stats || {}, stats);
    window.mythologyDatabaseData.lastUpdated = Date.now();
    save();
  };

  window.mdbRenderPanel = function() {
    const panel = document.getElementById("panel-myth-database-v42");
    if (!panel) return;
    const data = window.mythologyDatabaseData;
    const pantheons = data.pantheons || DEFAULT_PANTHEONS;
    const stats = data.stats || {};

    const statBar = [
      { label: "Thần Linh", val: stats.totalGods || 0, icon: "✨", color: "#f59e0b" },
      { label: "Sinh Vật",  val: stats.totalCreatures || 0, icon: "🐉", color: "#10b981" },
      { label: "Thánh Vật", val: stats.totalArtifacts || 0, icon: "⚔️", color: "#3b82f6" },
      { label: "Lore",      val: stats.totalLore || 0,      icon: "📜", color: "#8b5cf6" }
    ].map(function(s) {
      return '<div style="text-align:center;background:#0f172a;border-radius:8px;padding:10px 14px">' +
        '<div style="font-size:18px">' + s.icon + '</div>' +
        '<div style="font-size:20px;font-weight:bold;color:' + s.color + '">' + s.val + '</div>' +
        '<div style="font-size:10px;color:#64748b">' + s.label + '</div></div>';
    }).join("");

    const pantheonCards = pantheons.map(function(p) {
      return '<div style="background:#0f172a;border:1px solid ' + p.color + '33;border-left:3px solid ' + p.color + ';' +
        'border-radius:8px;padding:12px;cursor:pointer;transition:all 0.2s" ' +
        'onclick="if(typeof mgsFilterByPantheon===\'function\')mgsFilterByPantheon(\'' + p.id + '\')">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
          '<span style="font-size:20px">' + p.icon + '</span>' +
          '<div>' +
            '<div style="font-weight:bold;color:' + p.color + ';font-size:12px">' + p.name + '</div>' +
            '<div style="font-size:10px;color:#64748b">' + p.origin + ' · ' + p.era + '</div>' +
          '</div>' +
        '</div>' +
        '<div style="font-size:11px;color:#94a3b8;margin-bottom:6px">' + p.desc + '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:4px">' +
          p.themes.map(function(t) {
            return '<span style="background:' + p.color + '22;color:' + p.color + ';border-radius:4px;padding:2px 6px;font-size:9px">' + t + '</span>';
          }).join("") +
        '</div>' +
      '</div>';
    }).join("");

    panel.innerHTML =
      '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">' +
        '<div style="font-size:13px;font-weight:bold;color:#f59e0b;margin-bottom:10px">🗄️ Cơ Sở Dữ Liệu Thần Thoại Toàn Cầu</div>' +
        '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px">' + statBar + '</div>' +
        '<div style="font-size:11px;color:#64748b;margin-bottom:8px">10 HỆ THẦN THOẠI</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' + pantheonCards + '</div>' +
      '</div>';
  };

  function init() {
    load();
    save();
    console.log("[MythologyDatabase V42] 🗄️ Cơ Sở Dữ Liệu Thần Thoại — 10 hệ thần thoại sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 2000); });
  } else {
    setTimeout(init, 2000);
  }
})();
