(function() {
  "use strict";
  const SAVE_KEY = "cgv6_cx_passport_v56";

  const PASSPORT_RANKS = [
    { rank: 0, name: "Vô Danh",       icon: "⚫", desc: "Không có thân phận" },
    { rank: 1, name: "Lữ Hành Giả",   icon: "🟤", desc: "Du lịch cơ bản" },
    { rank: 2, name: "Thương Nhân",   icon: "🔵", desc: "Được phép kinh doanh" },
    { rank: 3, name: "Đặc Phái Viên", icon: "🟢", desc: "Đại diện ngoại giao" },
    { rank: 4, name: "Thiên Sứ",      icon: "🟣", desc: "Đại sứ cấp cao" },
    { rank: 5, name: "Sứ Thần Tạo Hóa",icon:"⭐", desc: "Quyền lực tối cao" }
  ];

  const VISA_TYPES = [
    { id: "tourist",    name: "🎒 Visa Du Lịch",      cost: 100,  duration: 50,  access: ["explore", "trade"] },
    { id: "merchant",   name: "💹 Visa Thương Nhân",  cost: 500,  duration: 100, access: ["explore", "trade", "colony_outpost"] },
    { id: "diplomat",   name: "📜 Visa Ngoại Giao",   cost: 2000, duration: 200, access: ["explore", "trade", "colony", "treaty"] },
    { id: "conqueror",  name: "⚔️ Visa Chinh Phục",   cost: 10000,duration: 300, access: ["explore", "trade", "colony", "war", "gate"] },
    { id: "god",        name: "✨ Visa Tạo Hóa",      cost: 0,    duration: 9999,access: ["all"] }
  ];

  window.passportV56Data = {
    rank: 1,
    rankName: "Lữ Hành Giả",
    rankIcon: "🟤",
    totalTravels: 0,
    visitedUniverses: [],
    unlockedRoutes: [],
    visas: [],
    activeVisa: null,
    travelLog: [],
    multiverseReputation: 0,
    version: "V56"
  };

  window.g56PassportData = window.passportV56Data;

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.passportV56Data)); } catch(e) {} }
  function load() {
    try { var d = localStorage.getItem(SAVE_KEY); if (d) { Object.assign(window.passportV56Data, JSON.parse(d)); window.g56PassportData = window.passportV56Data; } } catch(e) {}
  }

  function getYear() { return (typeof window.year === "number") ? window.year : 0; }

  window.pass56GetVisa = function(visaTypeId) {
    var vtype = VISA_TYPES.find(function(v) { return v.id === visaTypeId; });
    if (!vtype) return { ok: false, msg: "Loại visa không hợp lệ" };

    var visa = {
      id: "visa_" + Date.now(),
      type: vtype.id, typeName: vtype.name,
      cost: vtype.cost, access: vtype.access,
      issuedYear: getYear(),
      expiresYear: getYear() + vtype.duration,
      isActive: true
    };
    window.passportV56Data.visas.unshift(visa);
    window.passportV56Data.activeVisa = visa;
    if (window.passportV56Data.visas.length > 20) window.passportV56Data.visas.length = 20;
    save();
    return { ok: true, visa: visa, msg: vtype.name + " đã được cấp! Hết hạn năm " + visa.expiresYear };
  };

  window.pass56Travel = function(toUniverseId, toUniverseName) {
    var yr = getYear();
    var visa = window.passportV56Data.activeVisa;
    if (!visa || yr >= visa.expiresYear) {
      window.passportV56Data.activeVisa = null;
      return { ok: false, msg: "Visa hết hạn hoặc không có visa! Cần xin visa trước khi du hành." };
    }

    var logEntry = {
      id: "log_" + Date.now(),
      year: yr, toUid: toUniverseId, toName: toUniverseName || "Vũ Trụ Mới",
      visaType: visa.typeName, result: "success"
    };
    window.passportV56Data.travelLog.unshift(logEntry);
    window.passportV56Data.totalTravels++;
    window.passportV56Data.multiverseReputation++;

    if (!window.passportV56Data.visitedUniverses.includes(toUniverseId)) {
      window.passportV56Data.visitedUniverses.push(toUniverseId);
    }

    updateRank();
    if (window.passportV56Data.travelLog.length > 50) window.passportV56Data.travelLog.length = 50;
    if (typeof window.hrs55RecordEvent === "function") {
      window.hrs55RecordEvent({ category: "travel", icon: "🚀", title: "Du Hành đến " + (toUniverseName || toUniverseId), importance: 1 });
    }
    save();
    return { ok: true, log: logEntry, msg: "🚀 Đã du hành đến " + (toUniverseName || "Vũ Trụ Mới") + "!" };
  };

  function updateRank() {
    var rep = window.passportV56Data.multiverseReputation;
    var treaties = typeof window.dip56GetTreaties === "function" ? window.dip56GetTreaties().length : 0;
    var cols = typeof window.col56GetStats === "function" ? window.col56GetStats().totalColonies : 0;
    var total = rep + treaties * 10 + cols * 20 + window.passportV56Data.totalTravels;
    var rank = total >= 500 ? 5 : total >= 200 ? 4 : total >= 80 ? 3 : total >= 30 ? 2 : total >= 5 ? 1 : 0;
    if (rank !== window.passportV56Data.rank) {
      var r = PASSPORT_RANKS[rank];
      window.passportV56Data.rank = r.rank;
      window.passportV56Data.rankName = r.name;
      window.passportV56Data.rankIcon = r.icon;
      if (typeof window.waeAddAlert === "function") window.waeAddAlert("🌌 Chứng Minh Thư Nâng Cấp: " + r.icon + " " + r.name);
    }
  }

  window.pass56GetProfile = function() {
    return {
      rank: window.passportV56Data.rank,
      rankName: window.passportV56Data.rankName,
      rankIcon: window.passportV56Data.rankIcon,
      totalTravels: window.passportV56Data.totalTravels,
      visitedUniverses: window.passportV56Data.visitedUniverses.length,
      unlockedRoutes: window.passportV56Data.unlockedRoutes.length,
      activeVisa: window.passportV56Data.activeVisa,
      reputation: window.passportV56Data.multiverseReputation
    };
  };
  window.pass56GetTravelLog = function(limit) { return window.passportV56Data.travelLog.slice(0, limit || 20); };
  window.pass56GetStats = function() { return window.pass56GetProfile(); };

  function init() {
    load();
    save();
    console.log("[UniversePassportV56] 🛂 Chứng Minh Thư Vũ Trụ V56 — 5 cấp bậc · 5 loại visa · " + window.passportV56Data.totalTravels + " chuyến đã đi · Danh tiếng: " + window.passportV56Data.multiverseReputation + " sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 9300); });
  } else { setTimeout(init, 9300); }
})();
