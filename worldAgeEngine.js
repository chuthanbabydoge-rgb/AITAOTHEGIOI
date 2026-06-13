// ═══════════════════════════════════════════════════════════════
// WORLD AGE ENGINE V43 — Creator God World Simulator
// 12 Kỷ Nguyên: Hỗn Mang → Sáng Thế
// Extension của ageEngineV25.js — KHÔNG xóa/thay thế file cũ
// Save: cgv6_world_age_v43
// ═══════════════════════════════════════════════════════════════
(function() {
"use strict";

const SAVE_KEY = "cgv6_world_age_v43";
const TICK_CHECK = 10;
var _tickCount = 0;

// ── 12 Kỷ Nguyên Định Nghĩa ──────────────────────────────────
const WORLD_AGES_V43 = {
  CHAOS: {
    id:"CHAOS", order:1,
    name:"Thời Đại Hỗn Mang", emoji:"🌀", color:"#94a3b8",
    bgColor:"rgba(148,163,184,0.08)",
    desc:"Khởi nguyên hỗn độn — thế giới vừa ra đời, chưa có trật tự, vạn vật đang định hình.",
    effects:{ growthMod:0.5, warChance:0.3, techMod:0.2, divineActivity:0.8 },
    conditions:{ population:0, nations:0, empires:0, wars:0, universes:0 },
    nextAges:["MYTHIC","HEROIC"],
    transitionHint:"Xuất hiện thần linh và các vị anh hùng đầu tiên",
    color2:"#64748b"
  },
  MYTHIC: {
    id:"MYTHIC", order:2,
    name:"Thời Đại Thần Thoại", emoji:"⚡", color:"#a78bfa",
    bgColor:"rgba(167,139,250,0.08)",
    desc:"Thời của thần linh — các vị thần trực tiếp can thiệp thế giới, anh hùng thần thánh xuất hiện.",
    effects:{ growthMod:0.8, warChance:0.5, techMod:0.3, divineActivity:2.0, heroChance:1.5 },
    conditions:{ population:100, nations:1, gods:3 },
    nextAges:["HEROIC","ANCIENT"],
    transitionHint:"Các vương quốc đầu tiên hình thành, anh hùng lên ngôi vua",
    color2:"#8b5cf6"
  },
  HEROIC: {
    id:"HEROIC", order:3,
    name:"Thời Đại Anh Hùng", emoji:"⚔️", color:"#f97316",
    bgColor:"rgba(249,115,22,0.08)",
    desc:"Kỷ nguyên anh hùng — những chiến binh huyền thoại viết nên sử thi bất diệt.",
    effects:{ growthMod:1.0, warChance:1.5, techMod:0.5, divineActivity:1.2, heroChance:2.0 },
    conditions:{ population:500, nations:3, wars:2 },
    nextAges:["ANCIENT","MYTHIC"],
    transitionHint:"Chiến tranh liên miên hình thành các vương triều đầu tiên",
    color2:"#ea580c"
  },
  ANCIENT: {
    id:"ANCIENT", order:4,
    name:"Thời Đại Cổ Đại", emoji:"🏛️", color:"#fbbf24",
    bgColor:"rgba(251,191,36,0.08)",
    desc:"Văn minh cổ đại nở rộ — thành bang, triết học, kiến trúc kỳ vĩ ra đời.",
    effects:{ growthMod:1.2, warChance:1.0, techMod:0.8, economyMod:1.0, cultureMod:1.5 },
    conditions:{ population:2000, nations:5, empires:0 },
    nextAges:["IMPERIAL","HEROIC"],
    transitionHint:"Một vương quốc thống nhất nhiều dân tộc dưới quyền",
    color2:"#d97706"
  },
  IMPERIAL: {
    id:"IMPERIAL", order:5,
    name:"Thời Đại Đế Quốc", emoji:"👑", color:"#ef4444",
    bgColor:"rgba(239,68,68,0.08)",
    desc:"Đế quốc hùng mạnh — các thế lực vĩ đại chinh phục và cai trị muôn dân.",
    effects:{ growthMod:1.3, warChance:1.8, techMod:1.0, economyMod:1.5, expansionMod:2.0 },
    conditions:{ population:10000, nations:8, empires:1 },
    nextAges:["RENAISSANCE","ANCIENT"],
    transitionHint:"Đế quốc sụp đổ, văn hóa và tri thức lan rộng",
    color2:"#dc2626"
  },
  RENAISSANCE: {
    id:"RENAISSANCE", order:6,
    name:"Thời Đại Trung Hưng", emoji:"🎨", color:"#34d399",
    bgColor:"rgba(52,211,153,0.08)",
    desc:"Phục hưng văn minh — nghệ thuật, khoa học, triết học bùng nổ sau thời kỳ đen tối.",
    effects:{ growthMod:1.4, warChance:0.8, techMod:1.5, cultureMod:2.0, economyMod:1.3 },
    conditions:{ population:20000, nations:10, empires:2 },
    nextAges:["INDUSTRIAL","IMPERIAL"],
    transitionHint:"Công nghệ mới mở ra kỷ nguyên sản xuất hàng loạt",
    color2:"#10b981"
  },
  INDUSTRIAL: {
    id:"INDUSTRIAL", order:7,
    name:"Thời Đại Công Nghiệp", emoji:"⚙️", color:"#60a5fa",
    bgColor:"rgba(96,165,250,0.08)",
    desc:"Cách mạng công nghiệp — máy móc thay lao động chân tay, đô thị hóa mạnh mẽ.",
    effects:{ growthMod:1.8, warChance:1.2, techMod:2.0, economyMod:2.0, pollutionMod:1.5 },
    conditions:{ population:50000, nations:12, empires:3 },
    nextAges:["DIGITAL","RENAISSANCE"],
    transitionHint:"Thông tin và máy tính thay thế dây chuyền sản xuất",
    color2:"#3b82f6"
  },
  DIGITAL: {
    id:"DIGITAL", order:8,
    name:"Thời Đại Công Nghệ", emoji:"💻", color:"#06b6d4",
    bgColor:"rgba(6,182,212,0.08)",
    desc:"Kỷ nguyên số — trí tuệ nhân tạo và mạng lưới thông tin kết nối toàn cầu.",
    effects:{ growthMod:2.0, warChance:0.7, techMod:3.0, economyMod:2.5, aiMod:2.0 },
    conditions:{ population:100000, nations:15, empires:3, civs:1 },
    nextAges:["SPACE","INDUSTRIAL"],
    transitionHint:"Con người vươn ra ngoài không gian tìm kiếm sự sống mới",
    color2:"#0891b2"
  },
  SPACE: {
    id:"SPACE", order:9,
    name:"Thời Đại Không Gian", emoji:"🚀", color:"#818cf8",
    bgColor:"rgba(129,140,248,0.08)",
    desc:"Chinh phục vũ trụ — các nền văn minh khai thác thiên hà và gặp gỡ sinh vật ngoài hành tinh.",
    effects:{ growthMod:2.5, warChance:1.0, techMod:4.0, expansionMod:3.0, multiverseMod:1.0 },
    conditions:{ population:200000, nations:15, universes:2 },
    nextAges:["INTERVERSE","DIGITAL"],
    transitionHint:"Cổng không gian kết nối nhiều vũ trụ song song",
    color2:"#6366f1"
  },
  INTERVERSE: {
    id:"INTERVERSE", order:10,
    name:"Thời Đại Liên Vũ Trụ", emoji:"🌌", color:"#c084fc",
    bgColor:"rgba(192,132,252,0.08)",
    desc:"Liên minh các vũ trụ — thương mại, chiến tranh và ngoại giao xuyên chiều không gian.",
    effects:{ growthMod:3.0, warChance:1.5, techMod:5.0, multiverseMod:2.0, divineActivity:1.5 },
    conditions:{ population:500000, universes:5, portals:3 },
    nextAges:["MULTIVERSE","SPACE"],
    transitionHint:"Bản đồ toàn vũ trụ được hoàn thiện, đa vũ trụ hội tụ",
    color2:"#a855f7"
  },
  MULTIVERSE: {
    id:"MULTIVERSE", order:11,
    name:"Thời Đại Đa Vũ Trụ", emoji:"♾️", color:"#f472b6",
    bgColor:"rgba(244,114,182,0.08)",
    desc:"Đa vũ trụ hợp nhất — ranh giới giữa các thực tại tan biến, vạn vật kết nối.",
    effects:{ growthMod:5.0, warChance:2.0, techMod:8.0, multiverseMod:5.0, divineActivity:3.0 },
    conditions:{ population:1000000, universes:10, portals:5 },
    nextAges:["GENESIS"],
    transitionHint:"Đấng Tạo Hóa chuẩn bị viết lại quy luật của thực tại",
    color2:"#ec4899"
  },
  GENESIS: {
    id:"GENESIS", order:12,
    name:"Thời Đại Sáng Thế", emoji:"🌟", color:"#fde68a",
    bgColor:"rgba(253,230,138,0.12)",
    desc:"Sáng thế mới — chu kỳ vũ trụ hoàn tất, một thực tại hoàn hảo hơn được khai sinh.",
    effects:{ growthMod:10.0, warChance:0.1, techMod:10.0, divineActivity:10.0, multiverseMod:10.0 },
    conditions:{ population:5000000, universes:20, portals:10 },
    nextAges:["CHAOS"],
    transitionHint:"Vòng tuần hoàn bắt đầu lại — kỷ nguyên mới của hỗn mang",
    color2:"#f59e0b"
  }
};

// ── State ────────────────────────────────────────────────────
window.worldAgeData = {
  currentAge: "CHAOS",
  startYear: 1,
  transitionHistory: [],
  manualOverride: false,
  lastCheck: 0
};

// ── Save/Load ─────────────────────────────────────────────────
function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.worldAgeData)); } catch(e){}
}
function load() {
  try {
    var d = localStorage.getItem(SAVE_KEY);
    if (d) {
      var parsed = JSON.parse(d);
      window.worldAgeData = Object.assign(window.worldAgeData, parsed);
    }
  } catch(e){}
}

// ── API Functions ─────────────────────────────────────────────
window.waeGetCurrentAge = function() {
  var id = window.worldAgeData.currentAge || "CHAOS";
  return WORLD_AGES_V43[id] || WORLD_AGES_V43.CHAOS;
};

window.waeGetAgeData = function(id) {
  return WORLD_AGES_V43[id] || null;
};

window.waeGetAllAges = function() {
  return Object.values(WORLD_AGES_V43).sort(function(a,b){ return a.order - b.order; });
};

window.waeGetHistory = function() {
  return window.worldAgeData.transitionHistory || [];
};

window.waeForceAge = function(ageId) {
  if (!WORLD_AGES_V43[ageId]) return;
  var prev = window.worldAgeData.currentAge;
  var yr = window.year || 1;
  window.worldAgeData.transitionHistory.push({
    from: prev, to: ageId,
    year: yr, manual: true,
    label: (WORLD_AGES_V43[prev]||{name:prev}).name + " → " + WORLD_AGES_V43[ageId].name
  });
  if (window.worldAgeData.transitionHistory.length > 50) {
    window.worldAgeData.transitionHistory = window.worldAgeData.transitionHistory.slice(-50);
  }
  window.worldAgeData.currentAge = ageId;
  window.worldAgeData.startYear = yr;
  window.worldAgeData.manualOverride = true;
  save();
  _notifyTransition(prev, ageId, yr, true);
};

window.waeGetStartYear = function() {
  return window.worldAgeData.startYear || 1;
};

// ── World State Helpers ───────────────────────────────────────
function _getWorldStats() {
  var pop = (window.world && window.world.population) ? window.world.population : 0;
  var nations = window.countries ? window.countries.length : 0;
  var empires = 0;
  if (window.empireData) {
    var emp = window.empireData.empires;
    empires = Array.isArray(emp) ? emp.filter(function(e){ return e && e.status !== "fallen"; }).length
              : Object.values(emp||{}).filter(function(e){ return e && e.status !== "fallen"; }).length;
  }
  var wars = window.warsActive ? window.warsActive.length : 0;
  var universes = 0;
  if (window.mvData && window.mvData.universes) {
    universes = window.mvData.universes.filter(function(u){ return u.status === "active"; }).length;
  }
  var portals = window.pnGetOpenPortals ? window.pnGetOpenPortals().length : 0;
  var gods = window.npcs ? window.npcs.filter(function(n){ return n.type === "god" || n.role === "god"; }).length : 0;
  var civs = window.civEvoData ? Object.keys(window.civEvoData.civilizations||{}).length : 0;
  return { pop:pop, nations:nations, empires:empires, wars:wars, universes:universes, portals:portals, gods:gods, civs:civs };
}

// ── Transition Check ──────────────────────────────────────────
function _checkTransition() {
  if (window.worldAgeData.manualOverride) return;
  var stats = _getWorldStats();
  var cur = window.worldAgeData.currentAge || "CHAOS";
  var curAge = WORLD_AGES_V43[cur];
  if (!curAge) return;

  var nextIds = curAge.nextAges || [];
  for (var i = 0; i < nextIds.length; i++) {
    var nextId = nextIds[i];
    var nextAge = WORLD_AGES_V43[nextId];
    if (!nextAge) continue;
    var cond = nextAge.conditions || {};
    var met = true;
    if (cond.population  && stats.pop       < cond.population)  met = false;
    if (cond.nations     && stats.nations    < cond.nations)     met = false;
    if (cond.empires     && stats.empires    < cond.empires)     met = false;
    if (cond.universes   && stats.universes  < cond.universes)   met = false;
    if (cond.portals     && stats.portals    < cond.portals)     met = false;
    if (cond.gods        && stats.gods       < cond.gods)        met = false;
    if (cond.civs        && stats.civs       < cond.civs)        met = false;
    if (met) {
      var yr = window.year || 1;
      var prev = window.worldAgeData.currentAge;
      window.worldAgeData.transitionHistory.push({
        from: prev, to: nextId,
        year: yr, manual: false,
        label: (WORLD_AGES_V43[prev]||{name:prev}).name + " → " + nextAge.name
      });
      if (window.worldAgeData.transitionHistory.length > 50) {
        window.worldAgeData.transitionHistory = window.worldAgeData.transitionHistory.slice(-50);
      }
      window.worldAgeData.currentAge = nextId;
      window.worldAgeData.startYear = yr;
      save();
      _notifyTransition(prev, nextId, yr, false);
      break;
    }
  }
}

function _notifyTransition(fromId, toId, yr, manual) {
  var fromAge = WORLD_AGES_V43[fromId] || {};
  var toAge   = WORLD_AGES_V43[toId]   || {};
  var title   = (toAge.emoji||"🌀") + " " + (toAge.name||toId) + " bắt đầu";
  var content = "Thế giới chuyển từ " + (fromAge.name||fromId) + " sang " + (toAge.name||toId) + " vào năm " + yr + (manual ? " (can thiệp thủ công)" : " (tự động)") + ".";
  if (typeof window.htAddEvent === "function") {
    window.htAddEvent({ year:yr, type:"age_transition", title:title, color:toAge.color||"#8b5cf6" });
  }
  if (typeof window.wmeAddMemory === "function") {
    window.wmeAddMemory({ year:yr, category:"kỷ nguyên", title:title, content:content });
  }
  if (typeof window.waeAddAlert === "function") {
    window.waeAddAlert({ type:"age_change", message:title, color:toAge.color||"#8b5cf6" });
  }
  console.log("[WorldAgeEngine V43] " + content);
}

// ── Tick ──────────────────────────────────────────────────────
window.waeV43Tick = function() {
  _tickCount++;
  if (_tickCount % TICK_CHECK === 0) {
    _checkTransition();
  }
};

// ── Init ──────────────────────────────────────────────────────
function init() {
  load();
  if (!window.worldAgeData.startYear) {
    window.worldAgeData.startYear = window.year || 1;
    save();
  }
  var _orig = window.gameTick;
  window.gameTick = function() { if (_orig) _orig(); window.waeV43Tick(); };
  console.log("[WorldAgeEngine V43] 🌀 Hệ Thống Kỷ Nguyên Thế Giới khởi động — 12 kỷ nguyên · Điều kiện chuyển đổi tự động sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 2900); });
} else {
  setTimeout(init, 2900);
}
})();
