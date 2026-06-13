(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // CIV HISTORY & INFLUENCE V58
  // Biên Niên Sử Văn Minh · Ảnh Hưởng 4 Chiều · Jarvis Dự Đoán
  // KHÔNG trùng: historicalTimeline.js (world events) · worldMemoryEngine.js (world memory)
  //              — đây là PLAYER CIV timeline riêng biệt
  // ═══════════════════════════════════════════════════════════════════════════

  const SAVE_KEY = "cgv6_civ_history_influence_v58";
  const INIT_DELAY = 10500;
  const TICK_INTERVAL = 20;

  const EVENT_TYPES = [
    { id:"founding",    name:"Khai Quốc",     icon:"🏛", color:"#facc15" },
    { id:"war",         name:"Chiến Tranh",   icon:"⚔️", color:"#ef4444" },
    { id:"golden_age",  name:"Kỷ Nguyên Vàng",icon:"✨", color:"#fbbf24" },
    { id:"crisis",      name:"Khủng Hoảng",   icon:"🔥", color:"#f97316" },
    { id:"expansion",   name:"Mở Rộng",       icon:"🗺️", color:"#22c55e" },
    { id:"cultural",    name:"Văn Hóa",       icon:"🎨", color:"#c084fc" },
    { id:"religion",    name:"Tôn Giáo",      icon:"⛩️", color:"#60a5fa" },
    { id:"collapse",    name:"Sụp Đổ Một Phần",icon:"💀", color:"#6b7280" },
    { id:"ai_interact", name:"Tương Tác AI",  icon:"🤖", color:"#34d399" },
    { id:"ideology",    name:"Tư Tưởng",      icon:"📋", color:"#a78bfa" },
    { id:"tech",        name:"Công Nghệ",     icon:"⚙️", color:"#38bdf8" }
  ];

  window.civHistoryData = {
    events: [],
    influence: {
      military: 0,
      economic: 0,
      cultural: 0,
      religious: 0
    },
    aiLearners: [],
    assimilatedCount: 0,
    peakInfluence: { military:0, economic:0, cultural:0, religious:0 },
    tickCount: 0
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.civHistoryData)); } catch(e) {}
  }
  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.civHistoryData = Object.assign(window.civHistoryData, JSON.parse(d));
      // Ensure influence obj exists
      if (!window.civHistoryData.influence) {
        window.civHistoryData.influence = { military:0, economic:0, cultural:0, religious:0 };
      }
      if (!window.civHistoryData.peakInfluence) {
        window.civHistoryData.peakInfluence = { military:0, economic:0, cultural:0, religious:0 };
      }
    } catch(e) {}
  }

  // ─── PUBLIC API ────────────────────────────────────────────────

  window.ch58RecordEvent = function(typeId, title, desc, impact) {
    var yr = window.year || 1;
    var evType = EVENT_TYPES.find(function(t){ return t.id === typeId; }) || EVENT_TYPES[0];
    var ev = {
      id: "ev_" + Date.now(),
      year: yr,
      type: typeId,
      typeName: evType.name,
      typeIcon: evType.icon,
      color: evType.color,
      title: title || "",
      desc: desc || "",
      impact: impact || 0
    };
    window.civHistoryData.events.push(ev);
    // Keep max 100 events
    if (window.civHistoryData.events.length > 100) {
      window.civHistoryData.events.shift();
    }
    save();
    return ev;
  };

  window.ch58UpdateInfluence = function(type, amount) {
    if (!window.civHistoryData.influence) window.civHistoryData.influence = { military:0,economic:0,cultural:0,religious:0 };
    var types = ["military","economic","cultural","religious"];
    if (types.indexOf(type) === -1) return;
    window.civHistoryData.influence[type] = Math.max(0, Math.min(100, (window.civHistoryData.influence[type] || 0) + amount));
    // Track peak
    if (!window.civHistoryData.peakInfluence) window.civHistoryData.peakInfluence = { military:0,economic:0,cultural:0,religious:0 };
    if (window.civHistoryData.influence[type] > (window.civHistoryData.peakInfluence[type] || 0)) {
      window.civHistoryData.peakInfluence[type] = window.civHistoryData.influence[type];
    }
    save();
  };

  window.ch58AddAILearner = function(entityName) {
    if (window.civHistoryData.aiLearners.indexOf(entityName) === -1) {
      window.civHistoryData.aiLearners.push(entityName);
      window.civHistoryData.assimilatedCount++;
      window.ch58UpdateInfluence("cultural", 5);
      window.ch58RecordEvent("ai_interact", "🤖 " + entityName + " học hỏi văn hóa", "AI văn minh " + entityName + " đã hấp thụ một phần văn hóa.", 10);
      save();
    }
  };

  window.ch58GetTimeline = function() {
    return (window.civHistoryData.events || []).slice().reverse();
  };

  window.ch58GetInfluenceReport = function() {
    var inf = window.civHistoryData.influence || {};
    var total = (inf.military||0) + (inf.economic||0) + (inf.cultural||0) + (inf.religious||0);
    var dominant = "cultural";
    var domVal = 0;
    ["military","economic","cultural","religious"].forEach(function(k) {
      if ((inf[k]||0) > domVal) { domVal = inf[k]||0; dominant = k; }
    });
    var domNames = { military:"Quân Sự", economic:"Kinh Tế", cultural:"Văn Hóa", religious:"Tôn Giáo" };
    return {
      military: inf.military || 0,
      economic: inf.economic || 0,
      cultural: inf.cultural || 0,
      religious: inf.religious || 0,
      total: total,
      dominant: dominant,
      dominantName: domNames[dominant],
      aiLearners: window.civHistoryData.aiLearners.length,
      assimilated: window.civHistoryData.assimilatedCount
    };
  };

  window.ch58GetEventTypes = function() { return EVENT_TYPES; };

  window.ch58GetJarvisAnalysis = function() {
    var inf = window.ch58GetInfluenceReport();
    var events = window.civHistoryData.events || [];
    var tips = [];
    var warnings = [];
    var predictions = [];

    if (inf.total < 20) tips.push("Ảnh hưởng tổng thể còn rất thấp — cần mở rộng giao thương và văn hóa.");
    if (inf.military > 70) warnings.push("Ảnh hưởng quân sự quá cao — có thể gây ra xung đột với các thế lực khác.");
    if (inf.cultural > 50) predictions.push("Văn hóa đủ mạnh để đồng hóa các cộng đồng nhỏ hơn trong vòng 100 năm.");
    if (events.filter(function(e){ return e.type === "war"; }).length > 3) warnings.push("Nhiều chiến tranh liên tiếp — ổn định nội bộ có nguy cơ suy giảm.");
    if (events.filter(function(e){ return e.type === "golden_age"; }).length > 0) predictions.push("Nền văn minh từng trải qua Kỷ Nguyên Vàng — tiềm năng phục hưng còn đó.");
    if (window.civHistoryData.aiLearners.length > 5) predictions.push("Văn hóa đang lan tỏa mạnh — " + window.civHistoryData.aiLearners.length + " thực thể AI đã học hỏi.");

    if (tips.length === 0 && warnings.length === 0) tips.push("Văn minh đang phát triển cân bằng. Tiếp tục duy trì ảnh hưởng.");

    return { tips: tips, warnings: warnings, predictions: predictions, influenceReport: inf };
  };

  // ─── TICK ────────────────────────────────────────────────────
  function tick() {
    if (!(window.playerCivData && window.playerCivData.founded)) return;
    window.civHistoryData.tickCount = (window.civHistoryData.tickCount || 0) + 1;
    if (window.civHistoryData.tickCount % TICK_INTERVAL !== 0) return;

    // Passive influence decay (very slow)
    var inf = window.civHistoryData.influence;
    if (inf) {
      ["military","economic","cultural","religious"].forEach(function(k) {
        if (inf[k] > 0) inf[k] = Math.max(0, inf[k] - 0.05);
      });
    }

    // Every 100 ticks, check for auto AI interaction
    if (window.civHistoryData.tickCount % 100 === 0) {
      var totalInf = (inf.military||0) + (inf.economic||0) + (inf.cultural||0) + (inf.religious||0);
      if (totalInf > 50 && window.countries && window.countries.length > 0) {
        var rndCountry = window.countries[Math.floor(Math.random() * window.countries.length)];
        if (rndCountry && rndCountry.name && Math.random() < 0.3) {
          window.ch58AddAILearner(rndCountry.name);
        }
      }
      save();
    }
  }

  // ─── INIT ────────────────────────────────────────────────────
  function init() {
    load();

    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      tick();
    };

    console.log("[CivHistoryInfluenceV58] 📜 Biên Niên Sử & Ảnh Hưởng V58 — " + EVENT_TYPES.length + " loại sự kiện · 4 chiều ảnh hưởng · Jarvis dự đoán sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, INIT_DELAY); });
  } else {
    setTimeout(init, INIT_DELAY);
  }
})();
