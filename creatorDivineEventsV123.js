(function() {
  "use strict";

  const DIVINE_EVENTS = [
    { id: "blessing", icon: "🌟", name: "Phúc Lành", desc: "Ban phước cho một văn minh — dân số tăng, phát triển nhanh.", color: "#fbbf24" },
    { id: "miracle", icon: "✨", name: "Phép Màu", desc: "Sự kiện thần kỳ xuất hiện — xây công trình vĩ đại.", color: "#c084fc" },
    { id: "golden_age", icon: "🌅", name: "Thời Đại Vàng", desc: "Kỷ nguyên thịnh vượng — tất cả văn minh phát triển.", color: "#f59e0b" },
    { id: "catastrophe", icon: "☄️", name: "Đại Thảm Họa", desc: "Thiên tai tận thế — phá hủy nặng nề.", color: "#ef4444" },
    { id: "plague", icon: "💀", name: "Đại Dịch", desc: "Dịch bệnh bùng phát — dân số giảm mạnh.", color: "#6b7280" },
    { id: "meteor", icon: "🌠", name: "Thiên Thạch", desc: "Thiên thạch lao xuống — hủy diệt khu vực.", color: "#f97316" },
    { id: "great_flood", icon: "🌊", name: "Đại Hồng Thủy", desc: "Lũ lụt toàn cầu — địa hình thay đổi.", color: "#3b82f6" }
  ];

  function triggerHtEvent(title, color) {
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: window.year || 1, type: "divine", title: title, color: color || "#8b5cf6" });
    }
    if (typeof window.wmeAddMemory === "function") {
      window.wmeAddMemory({ year: window.year || 1, category: "Thần Thánh Can Thiệp", title: title, content: "Creator God ban phước/trừng phạt thế giới." });
    }
  }

  window.cpv123TriggerBlessing = function(civId) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    var civs = window.cpv123GetCivs ? window.cpv123GetCivs() : [];
    var civ = civId ? civs.find(function(c) { return c.id === civId; }) : civs[Math.floor(Math.random() * civs.length)];
    if (civ) {
      civ.population = Math.round((civ.population || 1000) * 1.5);
      civ.techPoints = (civ.techPoints || 0) + 200;
      civ.knowledge = (civ.knowledge || 0) + 150;
      try { localStorage.setItem("cgv6_civ_core_v95", JSON.stringify(window.cecV95Data)); } catch(e) {}
    }
    var target = civ ? civ.name : "Thế Giới";
    triggerHtEvent("🌟 Phúc Lành Thần Thánh giáng xuống " + target, "#fbbf24");
    window.cpv123LogAction("divine", "🌟 Phúc Lành → " + target, "Dân số +50% · Tech +200 · Knowledge +150");
    if (typeof window.jarvisToast === "function") window.jarvisToast("🌟 Phúc Lành đã được ban cho " + target + "!", 3000);
  };

  window.cpv123TriggerMiracle = function() {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    var miracles = ["Cây Thiêng Liêng mọc lên giữa thành phố", "Suối Trường Sinh xuất hiện", "Ánh Sáng Thần Thánh chiếu rọi đất nước", "Thần Thú xuất hiện bảo vệ dân chúng"];
    var chosen = miracles[Math.floor(Math.random() * miracles.length)];
    triggerHtEvent("✨ Phép Màu: " + chosen, "#c084fc");
    if (window.cecV95Data && window.cecV95Data.civs.length) {
      var civ = window.cecV95Data.civs[Math.floor(Math.random() * window.cecV95Data.civs.length)];
      civ.knowledge = (civ.knowledge || 0) + 500;
      civ.miracle = chosen;
    }
    window.cpv123LogAction("divine", "✨ Phép Màu: " + chosen, "Tri thức văn minh ngẫu nhiên +500");
    if (typeof window.jarvisToast === "function") window.jarvisToast("✨ " + chosen, 4000);
  };

  window.cpv123TriggerGoldenAge = function() {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    var civs = window.cpv123GetCivs ? window.cpv123GetCivs() : [];
    civs.forEach(function(c) {
      c.population = Math.round((c.population || 1000) * 1.3);
      c.techPoints = (c.techPoints || 0) + 300;
      c.knowledge = (c.knowledge || 0) + 200;
      c.inGoldenAge = true;
    });
    if (window.spv93Data && Array.isArray(window.spv93Data.species)) {
      window.spv93Data.species.forEach(function(sp) {
        sp.population = Math.round(sp.population * 1.2);
        if (sp.population > sp.peakPop) sp.peakPop = sp.population;
      });
    }
    triggerHtEvent("🌅 THỜI ĐẠI VÀNG bắt đầu — Vạn vật thịnh vượng", "#f59e0b");
    window.cpv123LogAction("divine", "🌅 Thời Đại Vàng khai mở", "Tất cả văn minh: dân số +30% · Tech +300 · Knowledge +200 · Loài +20%");
    if (typeof window.jarvisToast === "function") window.jarvisToast("🌅 Thời Đại Vàng đã bắt đầu!", 5000);
  };

  window.cpv123TriggerCatastrophe = function(severity) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    severity = severity || 0.4;
    var civs = window.cpv123GetCivs ? window.cpv123GetCivs() : [];
    civs.forEach(function(c) {
      c.population = Math.max(100, Math.round((c.population || 1000) * (1 - severity)));
    });
    if (window.spv93Data && Array.isArray(window.spv93Data.species)) {
      window.spv93Data.species.forEach(function(sp) {
        sp.population = Math.max(10, Math.round(sp.population * (1 - severity * 0.7)));
      });
    }
    triggerHtEvent("☄️ ĐẠI THẢM HỌA — Thế giới rung chuyển, " + Math.round(severity*100) + "% dân số thiệt mạng", "#ef4444");
    window.cpv123LogAction("divine", "☄️ Đại Thảm Họa (Cấp " + Math.round(severity*10) + ")", "Dân số giảm " + Math.round(severity*100) + "%");
    if (typeof window.jarvisToast === "function") window.jarvisToast("☄️ Đại Thảm Họa đã xảy ra!", 4000);
  };

  window.cpv123TriggerPlague = function() {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    var civs = window.cpv123GetCivs ? window.cpv123GetCivs() : [];
    civs.forEach(function(c) {
      c.population = Math.max(100, Math.round((c.population || 1000) * 0.65));
      c.inPlague = true;
    });
    if (window.spv93Data && Array.isArray(window.spv93Data.species)) {
      window.spv93Data.species.forEach(function(sp) {
        sp.population = Math.max(10, Math.round(sp.population * 0.7));
      });
    }
    triggerHtEvent("💀 ĐẠI DỊCH bùng phát — 35% dân số thiệt mạng", "#6b7280");
    window.cpv123LogAction("divine", "💀 Đại Dịch bùng phát", "Dân số giảm 35% · Loài giảm 30%");
    if (typeof window.jarvisToast === "function") window.jarvisToast("💀 Đại Dịch đã bùng phát!", 4000);
  };

  window.cpv123TriggerMeteor = function(row, col) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    row = row === undefined ? Math.floor(Math.random() * 22) : row;
    col = col === undefined ? Math.floor(Math.random() * 22) : col;
    if (window.cpv123CreateDesert) window.cpv123CreateDesert(row, col, 2);
    var civs = window.cpv123GetCivs ? window.cpv123GetCivs() : [];
    if (civs.length) {
      var victim = civs[Math.floor(Math.random() * civs.length)];
      victim.population = Math.max(100, Math.round((victim.population || 1000) * 0.6));
    }
    triggerHtEvent("🌠 THIÊN THẠCH lao xuống ô (" + row + "," + col + ") — Hủy diệt khu vực", "#f97316");
    window.cpv123LogAction("divine", "🌠 Thiên Thạch tại (" + row + "," + col + ")", "Tạo hoang địa 2 ô · Dân số văn minh ngẫu nhiên -40%");
    if (typeof window.jarvisToast === "function") window.jarvisToast("🌠 Thiên Thạch đã lao xuống!", 4000);
  };

  window.cpv123TriggerGreatFlood = function() {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    var grid = window.cpv123GetGrid ? window.cpv123GetGrid() : null;
    if (grid) {
      var edges = [[0], [21]];
      for (var r = 0; r < 22; r++) {
        if (Math.random() < 0.4) grid[r][0] = 5;
        if (Math.random() < 0.4) grid[r][21] = 5;
      }
      for (var c = 0; c < 22; c++) {
        if (Math.random() < 0.4) grid[0][c] = 5;
        if (Math.random() < 0.4) grid[21][c] = 5;
      }
      if (typeof window.wmV121Refresh === "function") window.wmV121Refresh();
    }
    var civs = window.cpv123GetCivs ? window.cpv123GetCivs() : [];
    civs.forEach(function(c) {
      c.population = Math.max(100, Math.round((c.population || 1000) * 0.75));
    });
    triggerHtEvent("🌊 ĐẠI HỒNG THỦY — Nước dâng khắp thế giới, 25% dân số thiệt mạng", "#3b82f6");
    window.cpv123LogAction("divine", "🌊 Đại Hồng Thủy", "Rìa bản đồ ngập nước · Dân số giảm 25%");
    if (typeof window.jarvisToast === "function") window.jarvisToast("🌊 Đại Hồng Thủy đã xảy ra!", 4000);
  };

  window.cpv123DivineEvents = DIVINE_EVENTS;

  function init() {
    console.log("[CreatorDivineEvents V123] ⚡ Divine Events khởi động — 7 loại can thiệp thần thánh sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 29700); });
  } else {
    setTimeout(init, 29700);
  }
})();
