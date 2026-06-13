(function() {
"use strict";
// ============================================================
// GLOBAL EVENT CONTROL V51 — Creator God Online
// Sự Kiện Toàn Cầu: Festival · World Boss · Divine Invasion · Golden Age · Dark Age
// EXPAND ONLY · KHÔNG GHI ĐÈ file cũ
// ============================================================
const SAVE_KEY = "cgv6_global_event_v51";
const INIT_DELAY = 6500;

window.globalEventV51Data = {
  activeEvents: [],
  history:      [],
  totalTriggered: 0,
  initialized:  false
};

const EVENT_TYPES = [
  {
    id:"festival", icon:"🎉", label:"Lễ Hội Toàn Cầu", color:"#fbbf24",
    cost:50, cooldown:20, duration:10,
    desc:"Khắp nơi rộn ràng tiếng trống lễ hội — hạnh phúc và văn hóa thăng hoa",
    effects:[
      "Văn hóa +100% trong suốt lễ hội",
      "Hạnh phúc dân cư +80%",
      "Thương mại +50%",
      "Chiến tranh -70% (không ai muốn đánh nhau khi lễ hội)"
    ]
  },
  {
    id:"world_boss", icon:"👹", label:"World Boss Xuất Hiện", color:"#ef4444",
    cost:80, cooldown:40, duration:20,
    desc:"Một quái vật vĩ đại kinh thiên động địa xuất hiện — thế giới chung tay chống lại",
    effects:[
      "Triệu hồi Boss cấp LEGENDARY vào thế giới",
      "Tất cả quốc gia buộc hợp tác tiêu diệt",
      "Anh hùng xuất hiện để đối mặt Boss",
      "Phần thưởng vĩ đại nếu Boss bị tiêu diệt"
    ]
  },
  {
    id:"divine_invasion", icon:"🌌", label:"Thần Linh Xâm Nhập", color:"#7c3aed",
    cost:120, cooldown:60, duration:30,
    desc:"Các thần linh từ cõi trên giáng xuống thế gian — thế giới chao đảo",
    effects:[
      "Các thần linh V30 xuất hiện trực tiếp trên bản đồ",
      "Phép thuật +200% toàn bộ tu sĩ",
      "Thánh chiến tự động khai mào",
      "Thánh vật và thánh địa mới xuất hiện"
    ]
  },
  {
    id:"golden_age", icon:"✨", label:"Thời Đại Hoàng Kim", color:"#f59e0b",
    cost:200, cooldown:100, duration:50,
    desc:"Kỷ nguyên rực rỡ nhất trong lịch sử — văn minh vươn tới đỉnh cao",
    effects:[
      "Mọi hệ số phát triển x3 trong 50 năm",
      "Chiến tranh -80% (thịnh vượng giảm ham muốn chiến tranh)",
      "Anh hùng và thiên tài sinh ra gấp 5 lần bình thường",
      "Các công trình kỳ vĩ được xây dựng tự động"
    ]
  },
  {
    id:"dark_age", icon:"🌑", label:"Thời Đại Đen Tối", color:"#475569",
    cost:150, cooldown:80, duration:40,
    desc:"Bóng tối bao phủ — văn minh suy thoái nhưng anh hùng nổi lên từ khổ nạn",
    effects:[
      "Kinh tế -60%, văn hóa -50%",
      "Chiến tranh +200% (hỗn loạn khắp nơi)",
      "Anh hùng xuất thân từ khổ nạn mạnh gấp đôi bình thường",
      "Sau dark age: golden age tự động theo sau"
    ]
  },
  {
    id:"celestial_tournament", icon:"⚔️", label:"Thiên Hạ Đại Hội", color:"#60a5fa",
    cost:100, cooldown:50, duration:15,
    desc:"Hội thi đấu vĩ đại nhất thiên hạ — anh hùng khắp nơi quy tụ",
    effects:[
      "Anh hùng từ mọi quốc gia và tông môn tham chiến",
      "Người thắng được phong Thiên Hạ Đệ Nhất",
      "Danh tiếng tông môn thắng x10",
      "Tạo ra kỷ lục lịch sử vĩnh cửu"
    ]
  },
  {
    id:"heaven_gate", icon:"🌀", label:"Thiên Môn Khai Mở", color:"#a78bfa",
    cost:180, cooldown:90, duration:20,
    desc:"Cánh cửa dẫn đến cõi thần thánh mở ra — những kẻ xuất sắc nhất có thể thăng tiên",
    effects:[
      "Cơ hội thăng tiên x10 cho tu sĩ cấp cao",
      "Tu luyện +500% trên toàn thế giới",
      "Nhiều thần mới xuất hiện từ những kẻ thăng thiên",
      "Portal đa vũ trụ V35 tự động mở"
    ]
  }
];

function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      activeEvents:   window.globalEventV51Data.activeEvents,
      history:        window.globalEventV51Data.history.slice(0,60),
      totalTriggered: window.globalEventV51Data.totalTriggered
    }));
  } catch(e) {}
}
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      window.globalEventV51Data.activeEvents   = p.activeEvents   || [];
      window.globalEventV51Data.history        = p.history        || [];
      window.globalEventV51Data.totalTriggered = p.totalTriggered || 0;
    }
  } catch(e) {}
}

function now() { return (typeof year !== 'undefined') ? year : 0; }
function logEvent(msg, type){ if (typeof addLog==='function') addLog(msg, type||'important'); }
function htAdd(title, color){
  if (typeof window.htAddEvent==='function')
    window.htAddEvent({ year:now(), type:'global_event', title:'[Sự Kiện TG] '+title, color:color||'#f59e0b' });
}
function wmeAdd(title, content){
  if (typeof window.wmeAddMemory==='function')
    window.wmeAddMemory({ year:now(), category:'global_event', title, content });
}

const _lastTrigger = {};

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

window.cgv51GetGlobalEventTypes  = function(){ return EVENT_TYPES; };
window.cgv51GetActiveGlobalEvents= function(){ return window.globalEventV51Data.activeEvents; };
window.cgv51GetEventHistory      = function(){ return window.globalEventV51Data.history; };
window.cgv51GetGlobalEventStats  = function(){
  return {
    active:  window.globalEventV51Data.activeEvents.length,
    total:   window.globalEventV51Data.totalTriggered,
    history: window.globalEventV51Data.history.length
  };
};

window.cgv51TriggerGlobalEvent = function(typeId) {
  const type = EVENT_TYPES.find(t=>t.id===typeId);
  if (!type) return { ok:false, msg:'Loại sự kiện không hợp lệ' };

  // Cooldown check
  const lastYear = _lastTrigger[typeId] || 0;
  if (now() - lastYear < type.cooldown) {
    const remaining = type.cooldown - (now() - lastYear);
    return { ok:false, msg:'Cooldown còn '+remaining+' năm' };
  }

  // Energy check
  if (typeof window.creatorAuthorityV51Data !== 'undefined') {
    if (window.creatorAuthorityV51Data.divineEnergy < type.cost) {
      return { ok:false, msg:'Không đủ Thiên Năng (cần '+type.cost+')' };
    }
    window.creatorAuthorityV51Data.divineEnergy = Math.max(0,
      window.creatorAuthorityV51Data.divineEnergy - type.cost);
  }

  _lastTrigger[typeId] = now();

  const event = {
    id: 'gev_'+Date.now(),
    typeId, icon: type.icon, label: type.label, color: type.color,
    year: now(),
    endsYear: now() + type.duration,
    desc: type.desc,
    effects: type.effects,
    active: true
  };

  window.globalEventV51Data.activeEvents.push(event);
  window.globalEventV51Data.history.unshift(event);
  if (window.globalEventV51Data.history.length > 60) window.globalEventV51Data.history.pop();
  window.globalEventV51Data.totalTriggered++;

  // Side effects
  _applyEventSideEffects(typeId);

  logEvent(type.icon+' SỰ KIỆN TOÀN CẦU: '+type.label, 'important');
  htAdd(type.label, type.color);
  wmeAdd('Sự Kiện: '+type.label, type.effects.join(' · '));
  save();
  return { ok:true, msg:type.icon+' '+type.label+' đã bắt đầu!', event };
};

window.cgv51EndGlobalEvent = function(eventId) {
  const idx = window.globalEventV51Data.activeEvents.findIndex(function(e){ return e.id===eventId; });
  if (idx >= 0) {
    window.globalEventV51Data.activeEvents.splice(idx, 1);
    save();
    return { ok:true };
  }
  return { ok:false, msg:'Không tìm thấy sự kiện' };
};

function _applyEventSideEffects(typeId) {
  try {
    if (typeId === 'world_boss') {
      if (typeof window.wbv31SpawnBoss === 'function') window.wbv31SpawnBoss('cosmic');
    }
    if (typeId === 'divine_invasion') {
      logEvent('🌌 Thần Linh từ Cõi Trên đang giáng thế!', 'important');
    }
    if (typeId === 'golden_age') {
      if (typeof window.av25TriggerAge === 'function') window.av25TriggerAge('golden');
    }
    if (typeId === 'dark_age') {
      if (typeof window.av25TriggerAge === 'function') window.av25TriggerAge('dark');
    }
    if (typeId === 'heaven_gate') {
      logEvent('🌀 Thiên Môn Đã Khai Mở — Cơ Hội Thăng Tiên x10!', 'important');
    }
  } catch(e) {}
}

// ─── GAME TICK ────────────────────────────────────────────────────────────────
let _tick = 0;
function myTick() {
  _tick++;
  if (_tick % 40 === 0) {
    const yr = now();
    const before = window.globalEventV51Data.activeEvents.length;
    window.globalEventV51Data.activeEvents = window.globalEventV51Data.activeEvents.filter(function(e){
      return e.active && yr < e.endsYear;
    });
    if (window.globalEventV51Data.activeEvents.length !== before) save();
  }
}

function init() {
  load();
  const _orig = window.gameTick;
  window.gameTick = function() { if (_orig) _orig(); myTick(); };
  window.globalEventV51Data.initialized = true;
  console.log("[GlobalEventControlV51] ⚡ Sự Kiện Toàn Cầu V51 khởi động — 7 loại sự kiện · Festival · World Boss · Divine Invasion sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
