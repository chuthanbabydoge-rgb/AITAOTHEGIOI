(function() {
"use strict";
// ============================================================
// MULTIVERSE EVENT SYSTEM V59 — Sự Kiện Đa Vũ Trụ
// Universe Collision · Time Crisis · Interdimensional Conference · Void Storm
// EXPAND ONLY · KHÔNG GHI ĐÈ file cũ
// ============================================================
const SAVE_KEY   = "cgv6_mv_event_v59";
const INIT_DELAY = 10900;

const MV_EVENT_TYPES = [
  {
    id:"universe_collision",   icon:"💥", label:"Va Chạm Vũ Trụ",
    desc:"Hai vũ trụ va chạm nhau — ranh giới không gian sụp đổ · Lãnh thổ mới mở ra",
    rarity:"epic", minYear:80, cooldown:120,
    effects:["Mở cổng liên vũ trụ mới", "Tài nguyên vũ trụ hiếm xuất hiện", "Các thực thể đa vũ trụ di cư", "Một số lãnh thổ bị nuốt chửng"]
  },
  {
    id:"interdimensional_conference", icon:"🤝", label:"Hội Nghị Liên Vũ Trụ",
    desc:"Đại diện các vũ trụ tụ họp — ngoại giao đa chiều diễn ra",
    rarity:"rare", minYear:50, cooldown:80,
    effects:["Hiệp ước đa vũ trụ được ký kết", "Trao đổi công nghệ giữa vũ trụ", "Liên minh quân sự đa vũ trụ hình thành", "Thuế thương mại liên vũ trụ thay đổi"]
  },
  {
    id:"time_crisis",            icon:"⏳", label:"Khủng Hoảng Thời Gian",
    desc:"Dòng thời gian bị rối loạn — quá khứ và tương lai giao thoa",
    rarity:"legendary", minYear:100, cooldown:150,
    effects:["Các nhân vật lịch sử tái xuất", "Dự báo tương lai xuất hiện", "Một số sự kiện xảy ra ngược thứ tự", "Năng lực time-travel tạm thời mở khóa"]
  },
  {
    id:"void_storm",             icon:"🌪️", label:"Bão Hư Không",
    desc:"Hư không bùng phát — năng lượng hủy diệt lan tràn giữa các vũ trụ",
    rarity:"legendary", minYear:120, cooldown:180,
    effects:["Các vũ trụ yếu bị xói mòn", "Vũ khí hư không xuất hiện", "Các thực thể void xâm nhập", "Cổng dịch chuyển hỗn loạn"]
  },
  {
    id:"creator_tournament",     icon:"🏆", label:"Giải Đấu Tạo Hóa",
    desc:"Các Creator từ khắp đa vũ trụ tranh tài — trận chiến sáng tạo vĩ đại nhất",
    rarity:"epic", minYear:60, cooldown:100,
    effects:["Creator Points x3 trong 20 năm", "Kỹ năng tạo hóa tạm thời mở khóa", "Tài nguyên tạo hóa tăng vọt", "Danh hiệu đặc biệt cho Creator chiến thắng"]
  },
  {
    id:"multiverse_plague",      icon:"💀", label:"Đại Dịch Đa Vũ Trụ",
    desc:"Bệnh lạ từ vũ trụ chưa biết lan tràn xuyên cổng không gian",
    rarity:"rare", minYear:70, cooldown:90,
    effects:["Dân số đa vũ trụ giảm mạnh", "Thương mại liên vũ trụ đóng băng", "Nghiên cứu y tế tăng tốc", "Cổng liên vũ trụ bị kiểm dịch"]
  },
  {
    id:"dimensional_ascension",  icon:"🌅", label:"Thăng Thiên Chiều",
    desc:"Một vũ trụ đạt đỉnh tiến hóa và thăng lên tầng không gian cao hơn",
    rarity:"legendary", minYear:150, cooldown:200,
    effects:["Vũ trụ đó mở khóa công nghệ tier mới", "Cư dân được ban sức mạnh thần thánh", "Các vũ trụ lân cận hưởng lợi năng lượng", "Di sản thăng thiên được ghi lại vĩnh viễn"]
  }
];

window.mvEventV59Data = {
  activeEvents:    [],
  completedEvents: [],
  cooldowns:       {},
  totalFired:      0,
  tick:            0,
  initialized:     false
};

function _save() {
  try {
    var d = window.mvEventV59Data;
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      activeEvents: d.activeEvents, completedEvents: d.completedEvents.slice(0,80),
      cooldowns: d.cooldowns, totalFired: d.totalFired, tick: d.tick
    }));
  } catch(e) {}
}
function _load() {
  try {
    var r = localStorage.getItem(SAVE_KEY);
    if (r) { var p = JSON.parse(r); if (p) Object.assign(window.mvEventV59Data, p); }
  } catch(e) {}
}

function _now() { return typeof window.year !== "undefined" ? window.year : 1; }

function _canFire(def) {
  var d = window.mvEventV59Data;
  var cd = d.cooldowns[def.id] || 0;
  return (_now() >= def.minYear) && (_now() - cd >= def.cooldown);
}

function _fireEvent(def, source) {
  var d = window.mvEventV59Data;
  var ev = {
    id:        def.id + "_" + Date.now(),
    defId:     def.id,
    icon:      def.icon,
    label:     def.label,
    desc:      def.desc,
    rarity:    def.rarity,
    effects:   def.effects,
    year:      _now(),
    source:    source || "auto",
    status:    "active",
    startedAt: _now(),
    duration:  25 + Math.floor(Math.random() * 35)
  };
  d.activeEvents.push(ev);
  d.cooldowns[def.id] = _now();
  d.totalFired++;
  if (typeof window.htAddEvent === "function") {
    window.htAddEvent({ year: _now(), type: "multiverse", title: def.icon + " " + def.label, color: "#7c3aed" });
  }
  if (typeof window.wmeAddMemory === "function") {
    window.wmeAddMemory({ year: _now(), category: "multiverse_event", title: def.label, content: def.desc });
  }
  if (typeof window.mvevt59OnFire === "function") window.mvevt59OnFire(ev);
  return ev;
}

function _tick() {
  var d = window.mvEventV59Data;
  d.tick++;
  var now = _now();
  d.activeEvents = d.activeEvents.filter(function(ev) {
    if (now - ev.startedAt >= ev.duration) {
      ev.status = "completed"; ev.endedAt = now;
      d.completedEvents.unshift(ev);
      if (d.completedEvents.length > 150) d.completedEvents.length = 150;
      return false;
    }
    return true;
  });
  if (d.tick % 50 !== 0) return;
  var rarityChance = { common:0.008, rare:0.004, epic:0.002, legendary:0.001 };
  MV_EVENT_TYPES.forEach(function(def) {
    var chance = rarityChance[def.rarity] || 0.002;
    if (Math.random() < chance && _canFire(def)) _fireEvent(def, "auto");
  });
  _save();
}

window.mves59GetActive     = function() { return window.mvEventV59Data.activeEvents; };
window.mves59GetCompleted  = function() { return window.mvEventV59Data.completedEvents; };
window.mves59GetTypes      = function() { return MV_EVENT_TYPES; };
window.mves59GetStats      = function() {
  var d = window.mvEventV59Data;
  return { totalFired: d.totalFired, active: d.activeEvents.length, completed: d.completedEvents.length };
};
window.mves59ManualFire    = function(defId) {
  var def = MV_EVENT_TYPES.find(function(e){ return e.id===defId; });
  if (!def) return { ok:false, msg:"Không tìm thấy: "+defId };
  return { ok:true, event: _fireEvent(def, "manual") };
};

function init() {
  _load();
  window.mvEventV59Data.initialized = true;
  var _orig = window.gameTick;
  window.gameTick = function() { if (_orig) _orig(); _tick(); };
  console.log("[MultiverseEventSystemV59] 🌌 Sự Kiện Đa Vũ Trụ V59 — 7 loại · Va Chạm · Hội Nghị · Khủng Hoảng TG · Bão HK sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
