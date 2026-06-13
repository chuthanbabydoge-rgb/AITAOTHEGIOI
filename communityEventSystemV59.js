(function() {
"use strict";
// ============================================================
// COMMUNITY EVENT SYSTEM V59 — Sự Kiện Cộng Đồng
// Seasonal · Creator-triggered · AI-generated · Server-wide
// EXPAND ONLY · KHÔNG GHI ĐÈ file cũ
// ============================================================
const SAVE_KEY   = "cgv6_community_event_v59";
const INIT_DELAY = 11000;

const SEASONAL_EVENTS = [
  { id:"spring_renewal",   icon:"🌸", label:"Lễ Hội Mùa Xuân",  season:"spring", desc:"Thiên nhiên hồi sinh — vạn vật đâm chồi nảy lộc", bonus:{ economy:10, population:5 } },
  { id:"summer_war",       icon:"☀️", label:"Chiến Dịch Hè",    season:"summer", desc:"Mùa chinh phạt — các quân đội ra quân tổng lực", bonus:{ military:15, stability:-5 } },
  { id:"autumn_harvest",   icon:"🍂", label:"Lễ Thu Hoạch",     season:"autumn", desc:"Mùa bội thu — kho lương đầy ắp, lòng người no đủ", bonus:{ economy:15, culture:5 } },
  { id:"winter_solstice",  icon:"❄️", label:"Lễ Đông Chí",      season:"winter", desc:"Đêm dài nhất năm — hội tụ tâm linh và tiên tri", bonus:{ divine:20, economy:-5 } },
];

const AI_EVENT_TEMPLATES = [
  { id:"ai_rebellion",      icon:"🤖", label:"Phong Trào Nổi Dậy AI",    cat:"politics",  desc:"Hệ thống AI trong thế giới tự nhận thức và đòi quyền lợi" },
  { id:"ai_discovery",      icon:"🔬", label:"AI Khám Phá Vĩ Đại",       cat:"discovery", desc:"Trí tuệ AI tiên đoán và thực hiện khám phá khoa học chưa từng có" },
  { id:"ai_war",            icon:"⚔️", label:"AI Khai Chiến",            cat:"war",        desc:"Hai phe AI đối lập bắt đầu cuộc chiến tranh thuật toán" },
  { id:"ai_alliance",       icon:"🤝", label:"Liên Minh AI Toàn Cầu",    cat:"diplomacy", desc:"Tất cả AI thế giới liên kết thành siêu mạng lưới thống nhất" },
  { id:"ai_oracle",         icon:"🔮", label:"Tiên Tri AI",               cat:"prophecy",  desc:"AI tính toán được tương lai và công bố lời tiên tri" },
];

const CREATOR_EVENT_TYPES = [
  { id:"creator_festival",  icon:"🎉", label:"Lễ Hội Creator",   cost:50,  desc:"Creator tổ chức lễ hội toàn cầu — văn hóa và hạnh phúc tăng vọt" },
  { id:"creator_war",       icon:"⚔️", label:"Creator Khai Chiến",cost:80,  desc:"Creator khơi mào cuộc chiến tranh lớn — thế giới chao đảo" },
  { id:"creator_golden",    icon:"✨", label:"Creator Ban Thịnh", cost:120, desc:"Creator ban phước — kinh tế và văn minh bước vào thời hoàng kim" },
  { id:"creator_purge",     icon:"☄️", label:"Creator Thanh Trừng",cost:150, desc:"Creator thanh lọc thế giới — những kẻ yếu bị xóa sổ" },
  { id:"creator_summon",    icon:"👹", label:"Creator Triệu Hồi", cost:100, desc:"Creator triệu hồi thực thể mạnh mẽ — boss tier Divine xuất hiện" },
];

window.communityEventV59Data = {
  activeEvents:    [],
  completedEvents: [],
  creatorEvents:   [],
  aiEvents:        [],
  seasonalLog:     [],
  currentSeason:   "spring",
  tick:            0,
  totalCreatorEvents: 0,
  totalAIEvents:   0,
  initialized:     false
};

function _save() {
  try {
    var d = window.communityEventV59Data;
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      activeEvents: d.activeEvents, completedEvents: d.completedEvents.slice(0,80),
      creatorEvents: d.creatorEvents.slice(0,50), aiEvents: d.aiEvents.slice(0,50),
      seasonalLog: d.seasonalLog.slice(0,30), currentSeason: d.currentSeason,
      tick: d.tick, totalCreatorEvents: d.totalCreatorEvents, totalAIEvents: d.totalAIEvents
    }));
  } catch(e) {}
}
function _load() {
  try {
    var r = localStorage.getItem(SAVE_KEY);
    if (r) { var p = JSON.parse(r); if (p) Object.assign(window.communityEventV59Data, p); }
  } catch(e) {}
}

function _now() { return typeof window.year !== "undefined" ? window.year : 1; }

var SEASONS = ["spring","summer","autumn","winter"];
function _getSeason() {
  var yr = _now();
  return SEASONS[Math.floor(yr/25) % 4];
}

function _triggerSeasonalEvent() {
  var d = window.communityEventV59Data;
  var season = _getSeason();
  if (d.currentSeason === season) return;
  d.currentSeason = season;
  var def = SEASONAL_EVENTS.find(function(s){ return s.season===season; });
  if (!def) return;
  var ev = {
    id: def.id+"_"+_now(), defId:def.id, icon:def.icon, label:def.label,
    cat:"seasonal", season:season, year:_now(), desc:def.desc, bonus:def.bonus,
    source:"seasonal", status:"active", startedAt:_now(), duration:25
  };
  d.activeEvents.push(ev);
  d.seasonalLog.unshift({ year:_now(), season:season, label:def.label });
  if (typeof window.htAddEvent === "function") {
    window.htAddEvent({ year:_now(), type:"festival", title:def.icon+" "+def.label, color:"#10b981" });
  }
  if (window.countries && Array.isArray(window.countries)) {
    window.countries.forEach(function(c) {
      if (!c) return;
      if (def.bonus.economy && typeof c.economy==="number") c.economy = Math.max(0, Math.min(100, c.economy+def.bonus.economy));
      if (def.bonus.stability && typeof c.stability==="number") c.stability = Math.max(0, Math.min(100, c.stability+def.bonus.stability));
    });
  }
}

function _triggerAIEvent() {
  var d = window.communityEventV59Data;
  var def = AI_EVENT_TEMPLATES[Math.floor(Math.random()*AI_EVENT_TEMPLATES.length)];
  var ev = {
    id: def.id+"_"+Date.now(), defId:def.id, icon:def.icon, label:def.label,
    cat:def.cat, year:_now(), desc:def.desc,
    source:"ai", status:"active", startedAt:_now(), duration:15+Math.floor(Math.random()*20)
  };
  d.activeEvents.push(ev);
  d.aiEvents.unshift(ev);
  if (d.aiEvents.length > 50) d.aiEvents.length = 50;
  d.totalAIEvents++;
  if (typeof window.htAddEvent === "function") {
    window.htAddEvent({ year:_now(), type:"ai_event", title:def.icon+" "+def.label, color:"#06b6d4" });
  }
}

window.cev59GetActive       = function() { return window.communityEventV59Data.activeEvents; };
window.cev59GetSeasonalLog  = function() { return window.communityEventV59Data.seasonalLog; };
window.cev59GetAIEvents     = function() { return window.communityEventV59Data.aiEvents; };
window.cev59GetCreatorEvents= function() { return window.communityEventV59Data.creatorEvents; };
window.cev59GetCurrentSeason= function() { return window.communityEventV59Data.currentSeason; };
window.cev59GetSeasonalDefs = function() { return SEASONAL_EVENTS; };
window.cev59GetCreatorTypes = function() { return CREATOR_EVENT_TYPES; };
window.cev59GetStats        = function() {
  var d = window.communityEventV59Data;
  return { active:d.activeEvents.length, totalCreator:d.totalCreatorEvents, totalAI:d.totalAIEvents, season:d.currentSeason };
};
window.cev59TriggerCreatorEvent = function(typeId) {
  var d = window.communityEventV59Data;
  var def = CREATOR_EVENT_TYPES.find(function(e){ return e.id===typeId; });
  if (!def) return { ok:false, msg:"Không tìm thấy loại: "+typeId };
  var ev = {
    id: def.id+"_"+Date.now(), defId:def.id, icon:def.icon, label:def.label,
    cost:def.cost, year:_now(), desc:def.desc,
    source:"creator", status:"active", startedAt:_now(), duration:20
  };
  d.activeEvents.push(ev);
  d.creatorEvents.unshift(ev);
  if (d.creatorEvents.length > 50) d.creatorEvents.length = 50;
  d.totalCreatorEvents++;
  if (typeof window.htAddEvent === "function") {
    window.htAddEvent({ year:_now(), type:"creator", title:def.icon+" "+def.label, color:"#f59e0b" });
  }
  _save();
  return { ok:true, event:ev };
};

function _tick() {
  var d = window.communityEventV59Data;
  d.tick++;
  var now = _now();
  d.activeEvents = d.activeEvents.filter(function(ev) {
    if (now - ev.startedAt >= ev.duration) {
      ev.status="completed"; ev.endedAt=now;
      d.completedEvents.unshift(ev);
      if (d.completedEvents.length > 150) d.completedEvents.length = 150;
      return false;
    }
    return true;
  });
  if (d.tick % 25 === 0) _triggerSeasonalEvent();
  if (d.tick % 80 === 0 && Math.random() < 0.35) _triggerAIEvent();
  if (d.tick % 100 === 0) _save();
}

function init() {
  _load();
  window.communityEventV59Data.initialized = true;
  var _orig = window.gameTick;
  window.gameTick = function() { if (_orig) _orig(); _tick(); };
  console.log("[CommunityEventSystemV59] 🎊 Sự Kiện Cộng Đồng V59 — 4 mùa · 5 loại AI events · 5 loại Creator events sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
