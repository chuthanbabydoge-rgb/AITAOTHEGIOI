(function() {
"use strict";
// ============================================================
// GLOBAL EVENT SCHEDULER V59 — Lịch Sự Kiện Toàn Cầu
// Queue · Timing · Auto-trigger · Cooldowns · Priority
// EXPAND ONLY · KHÔNG GHI ĐÈ file cũ
// ============================================================
const SAVE_KEY   = "cgv6_event_scheduler_v59";
const INIT_DELAY = 10700;

const SCHEDULED_EVENTS = [
  { id:"world_war",         icon:"⚔️",  label:"Đại Chiến Toàn Cầu",        category:"war",       minYear:50,  cooldown:80,  autoChance:0.003, priority:5 },
  { id:"world_boss_appear", icon:"👹",  label:"World Boss Xuất Hiện",       category:"boss",      minYear:20,  cooldown:40,  autoChance:0.005, priority:4 },
  { id:"great_plague",      icon:"☠️",  label:"Đại Dịch Bùng Phát",        category:"disaster",  minYear:30,  cooldown:60,  autoChance:0.004, priority:4 },
  { id:"golden_era",        icon:"✨",  label:"Kỷ Nguyên Vàng",            category:"golden",    minYear:100, cooldown:150, autoChance:0.002, priority:3 },
  { id:"dark_era",          icon:"🌑",  label:"Kỷ Nguyên Bóng Tối",        category:"dark",      minYear:80,  cooldown:120, autoChance:0.002, priority:3 },
  { id:"great_disaster",    icon:"🌋",  label:"Thiên Tai Toàn Cầu",        category:"disaster",  minYear:10,  cooldown:50,  autoChance:0.006, priority:4 },
  { id:"great_discovery",   icon:"🔭",  label:"Khám Phá Vĩ Đại",          category:"discovery", minYear:50,  cooldown:70,  autoChance:0.003, priority:3 },
  { id:"divine_awakening",  icon:"☀️",  label:"Thần Thánh Thức Tỉnh",      category:"divine",    minYear:60,  cooldown:90,  autoChance:0.003, priority:4 },
  { id:"multiverse_rift",   icon:"🌌",  label:"Vết Nứt Đa Vũ Trụ",        category:"multiverse",minYear:120, cooldown:100, autoChance:0.002, priority:5 },
  { id:"era_festival",      icon:"🎊",  label:"Đại Lễ Hội Kỷ Nguyên",     category:"festival",  minYear:50,  cooldown:50,  autoChance:0.004, priority:2 },
];

window.eventSchedulerV59Data = {
  queue:       [],
  active:      [],
  completed:   [],
  cooldowns:   {},
  totalScheduled: 0,
  totalFired:  0,
  tick:        0,
  initialized: false
};

function _save() {
  try {
    var d = window.eventSchedulerV59Data;
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      queue: d.queue, active: d.active.slice(0,20),
      completed: d.completed.slice(0,100),
      cooldowns: d.cooldowns,
      totalScheduled: d.totalScheduled, totalFired: d.totalFired, tick: d.tick
    }));
  } catch(e) {}
}
function _load() {
  try {
    var r = localStorage.getItem(SAVE_KEY);
    if (r) {
      var p = JSON.parse(r);
      if (p) Object.assign(window.eventSchedulerV59Data, p);
    }
  } catch(e) {}
}

function _now() { return typeof window.year !== "undefined" ? window.year : 1; }

function _canFire(evDef) {
  var d = window.eventSchedulerV59Data;
  var cd = d.cooldowns[evDef.id] || 0;
  return (_now() >= evDef.minYear) && (_now() - cd >= evDef.cooldown);
}

function _fireEvent(evDef, source) {
  var d = window.eventSchedulerV59Data;
  var ev = {
    id:       evDef.id + "_" + Date.now(),
    defId:    evDef.id,
    icon:     evDef.icon,
    label:    evDef.label,
    category: evDef.category,
    priority: evDef.priority,
    year:     _now(),
    source:   source || "auto",
    status:   "active",
    startedAt: _now(),
    duration: 20 + Math.floor(Math.random() * 30)
  };
  d.active.push(ev);
  d.cooldowns[evDef.id] = _now();
  d.totalFired++;
  if (typeof window.htAddEvent === "function") {
    window.htAddEvent({ year: _now(), type: evDef.category, title: evDef.icon + " " + evDef.label, color: "#f59e0b" });
  }
  if (typeof window.wmeAddMemory === "function") {
    window.wmeAddMemory({ year: _now(), category: "global_event", title: evDef.label, content: "Sự kiện quy mô toàn cầu xảy ra — " + evDef.label });
  }
  if (typeof window.ges59OnEventFire === "function") window.ges59OnEventFire(ev);
  return ev;
}

function _tickActive() {
  var d = window.eventSchedulerV59Data;
  var now = _now();
  d.active = d.active.filter(function(ev) {
    if (now - ev.startedAt >= ev.duration) {
      ev.status = "completed";
      ev.endedAt = now;
      d.completed.unshift(ev);
      if (d.completed.length > 200) d.completed.length = 200;
      if (typeof window.ges59OnEventEnd === "function") window.ges59OnEventEnd(ev);
      return false;
    }
    return true;
  });
}

window.ges59GetActive       = function() { return window.eventSchedulerV59Data.active; };
window.ges59GetCompleted    = function() { return window.eventSchedulerV59Data.completed; };
window.ges59GetQueue        = function() { return window.eventSchedulerV59Data.queue; };
window.ges59GetEventDefs    = function() { return SCHEDULED_EVENTS; };
window.ges59GetStats        = function() {
  var d = window.eventSchedulerV59Data;
  return { totalScheduled: d.totalScheduled, totalFired: d.totalFired, active: d.active.length, completed: d.completed.length };
};
window.ges59ManualFire      = function(defId, source) {
  var def = SCHEDULED_EVENTS.find(function(e){ return e.id===defId; });
  if (!def) return { ok:false, msg:"Không tìm thấy event: "+defId };
  return { ok:true, event: _fireEvent(def, source||"manual") };
};
window.ges59IsActive        = function(defId) {
  return window.eventSchedulerV59Data.active.some(function(e){ return e.defId===defId; });
};

function _tick() {
  var d = window.eventSchedulerV59Data;
  d.tick++;
  _tickActive();
  if (d.tick % 30 !== 0) return;
  SCHEDULED_EVENTS.forEach(function(def) {
    if (Math.random() < def.autoChance && _canFire(def)) {
      _fireEvent(def, "auto");
    }
  });
  _save();
}

function init() {
  _load();
  window.eventSchedulerV59Data.initialized = true;
  var _orig = window.gameTick;
  window.gameTick = function() { if (_orig) _orig(); _tick(); };
  console.log("[GlobalEventSchedulerV59] 📅 Lịch Sự Kiện V59 — 10 loại sự kiện · Auto-trigger · Priority queue sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
