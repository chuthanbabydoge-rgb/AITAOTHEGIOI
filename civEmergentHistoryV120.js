(function() {
  "use strict";

  // ============================================================
  // V120 – CIV AI EMERGENT HISTORY (Phase 6)
  // Tạo lịch sử tự phát từ mọi quyết định AI
  // Feed vào htAddEvent · wmeAddMemory · civAIV120Data.history
  // ============================================================

  var INIT_MS     = 28200;
  var MAX_HISTORY = 1000;

  // ── Event type → UI color mapping ────────────────────────────
  var EVENT_COLORS = {
    expand:     "#22c55e",
    research:   "#3b82f6",
    discover:   "#6366f1",
    trade:      "#f59e0b",
    alliance:   "#10b981",
    war:        "#ef4444",
    religion:   "#a855f7",
    explore:    "#06b6d4",
    sanction:   "#f97316",
    treaty:     "#84cc16",
    defeat:     "#dc2626",
    victory:    "#16a34a",
    neutral:    "#6b7280",
    diplo:      "#0ea5e9",
  };

  // ── Dramatic phrases để làm phong phú text ───────────────────
  var DRAMATIC_PREFIXES = {
    expand:   ["Một kỷ nguyên mở rộng bắt đầu khi", "Theo đà lịch sử,", "Dưới ánh sáng văn minh,"],
    research: ["Bước ngoặt khoa học:", "Trí tuệ của loài người:", "Trong bóng tối tri thức,"],
    discover: ["Thế giới rung chuyển khi", "Trang sử mới được lật khi", "Ánh bình minh văn minh:"],
    trade:    ["Tơ lụa và gia vị:", "Tiếng vàng bạc vang khắp:", "Con đường thịnh vượng:"],
    alliance: ["Bàn tay hòa bình bắt nhịp:", "Liên minh huynh đệ ra đời:", "Trong vận mệnh chung,"],
    war:      ["Máu và lửa lan tràn khi", "Sấm sét chiến tranh:", "Vận mệnh đất trời lay chuyển:"],
    religion: ["Ánh sáng thiêng liêng tỏa rạng:", "Lời nguyện cầu vang xa:", "Thần thánh hiện thân khi"],
    explore:  ["Chân trời mới hé lộ:", "Bản đồ thế giới mở rộng khi", "Kẻ tiên phong dũng cảm:"],
  };

  function getDramatic(type) {
    var pool = DRAMATIC_PREFIXES[type] || ["Lịch sử ghi nhận:"];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ── Emit một sự kiện lịch sử ─────────────────────────────────
  window.civAIEmitHistory = function(yr, type, civName, text) {
    var D = window.civAIV120Data;
    if (!D) return;

    var color   = EVENT_COLORS[type] || EVENT_COLORS.neutral;
    var prefix  = getDramatic(type);
    var fullText = prefix + " " + text;

    var entry = {
      year:    yr,
      type:    type,
      civName: civName,
      text:    fullText,
      color:   color,
      ts:      Date.now(),
    };

    // Thêm vào civAIV120Data.history
    D.history = D.history || [];
    D.history.push(entry);
    if (D.history.length > MAX_HISTORY) {
      D.history = D.history.slice(-MAX_HISTORY);
    }

    // Feed vào Historical Timeline (htAddEvent)
    try {
      if (typeof window.htAddEvent === 'function') {
        window.htAddEvent({
          year:  yr,
          type:  "civai_" + type,
          title: "🏛️ [" + civName + "] " + truncate(text, 60),
          color: color,
        });
      }
    } catch(e) {}

    // Feed vào World Memory (wmeAddMemory)
    try {
      if (typeof window.wmeAddMemory === 'function') {
        window.wmeAddMemory({
          year:     yr,
          category: "Văn Minh AI",
          title:    "[" + civName + "] " + truncate(text, 50),
          content:  fullText,
        });
      }
    } catch(e) {}

    return entry;
  };

  function truncate(str, n) {
    return str && str.length > n ? str.slice(0, n) + "…" : str;
  }

  // ── Lấy lịch sử gần đây ──────────────────────────────────────
  window.civAIGetHistory = function(limit) {
    var D = window.civAIV120Data;
    if (!D || !D.history) return [];
    return D.history.slice(-(limit || 50)).reverse();
  };

  // ── Render history panel (dùng cho Registry UI) ──────────────
  window.civAIRenderHistory = function(limit) {
    var events = window.civAIGetHistory(limit || 20);
    if (events.length === 0) {
      return '<div style="color:#6b7280;font-style:italic;padding:12px;">Chưa có sự kiện lịch sử. Tạo thế giới và chờ văn minh phát triển...</div>';
    }

    var html = '<div style="display:flex;flex-direction:column;gap:6px;">';
    events.forEach(function(e) {
      html += '<div style="background:#1e293b;border-left:3px solid ' + e.color + ';padding:8px 10px;border-radius:4px;">'
        + '<div style="color:#94a3b8;font-size:10px;margin-bottom:2px;">📅 Năm ' + e.year + ' · ' + e.civName + '</div>'
        + '<div style="color:#e2e8f0;font-size:12px;line-height:1.4;">' + escH(e.text) + '</div>'
        + '</div>';
    });
    html += '</div>';
    return html;
  };

  function escH(s) {
    return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── Auto-seed history events dựa trên V95 civs ───────────────
  function seedInitialHistory() {
    var D = window.civAIV120Data;
    if (!D || D.history.length > 0) return;  // Đã có history

    var civs = Object.values(D.civs || {});
    if (civs.length === 0) return;

    var yr = window.year || 1;

    civs.forEach(function(ai, idx) {
      // Foundation event
      window.civAIEmitHistory(
        Math.max(1, yr - civs.length * 50 + idx * 40),
        "expand",
        ai.name,
        ai.name + " hình thành từ các bộ lạc nguyên thủy, bắt đầu hành trình văn minh."
      );
    });
  }

  // ── Hook vào gameTick để tạo passive history events ──────────
  function hookHistory() {
    var _lastHistoryYear = 0;
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig.apply(this, arguments);

      var yr = window.year || 1;
      if (yr - _lastHistoryYear < 100) return;
      _lastHistoryYear = yr;

      var D = window.civAIV120Data;
      if (!D) return;

      // Random milestone events cho civs
      var civs = Object.values(D.civs || {});
      if (civs.length === 0) return;

      // 30% chance mỗi thế kỷ có một passive history event
      if (Math.random() < 0.30) {
        var civ = civs[Math.floor(Math.random() * civs.length)];
        var passiveEvents = [
          { type: "religion", text: "một giáo phái mới nổi lên trong lòng " + civ.name },
          { type: "explore",  text: civ.name + " gửi thám hiểm đến vùng đất chưa được đặt chân" },
          { type: "trade",    text: "chợ " + civ.name + " thu hút thương nhân từ khắp nơi" },
          { type: "research", text: civ.name + " khai sáng một thế hệ học giả mới" },
          { type: "expand",   text: "dân số " + civ.name + " bùng nổ, làng xóm mọc lên khắp nơi" },
        ];
        var ev = passiveEvents[Math.floor(Math.random() * passiveEvents.length)];
        window.civAIEmitHistory(yr, ev.type, civ.name, ev.text);
      }
    };
  }

  // ── Init ──────────────────────────────────────────────────────
  function init() {
    hookHistory();

    // Seed initial history sau khi brain đã load
    setTimeout(function() {
      try { seedInitialHistory(); } catch(e) {}
    }, 3000);

    console.log("[CivAI History V120] 📜 Emergent History khởi động — Tạo lịch sử tự phát · htAddEvent · wmeAddMemory · Max " + MAX_HISTORY + " sự kiện.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, INIT_MS); });
  } else {
    setTimeout(init, INIT_MS);
  }
})();
