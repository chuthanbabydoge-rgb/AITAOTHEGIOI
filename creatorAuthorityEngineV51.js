(function() {
"use strict";
// ============================================================
// CREATOR AUTHORITY ENGINE V51 — Creator God Online
// Thiên Ý: Divine Decrees · Blessings · Curses · Divine Will
// EXPAND ONLY · KHÔNG GHI ĐÈ file cũ
// ============================================================
const SAVE_KEY = "cgv6_creator_authority_v51";
const INIT_DELAY = 6200;

window.creatorAuthorityV51Data = {
  decrees: [],
  blessings: [],
  curses: [],
  divineEnergy: 1000,
  maxEnergy: 1000,
  energyRegen: 5,
  totalActions: 0,
  initialized: false
};

const DECREE_TYPES = [
  { id:"peace",      icon:"☮️",  label:"Sắc Lệnh Hòa Bình",    cost:80,  desc:"Chấm dứt mọi chiến tranh trong 20 năm",  energyCost:80  },
  { id:"war",        icon:"⚔️",  label:"Sắc Lệnh Chinh Phạt",  cost:100, desc:"Buộc 2 thế lực khai chiến",              energyCost:100 },
  { id:"prosperity", icon:"🌟",  label:"Sắc Lệnh Thịnh Vượng", cost:60,  desc:"Tăng kinh tế toàn bộ 30% trong 15 năm",  energyCost:60  },
  { id:"isolation",  icon:"🏔️", label:"Sắc Lệnh Cô Lập",      cost:70,  desc:"Ngăn cản giao lưu 1 thế lực 10 năm",    energyCost:70  },
  { id:"alliance",   icon:"🤝",  label:"Sắc Lệnh Liên Minh",   cost:90,  desc:"Bắt buộc 2 thế lực kết minh",           energyCost:90  },
  { id:"golden_age", icon:"✨",  label:"Sắc Lệnh Kỷ Vàng",     cost:150, desc:"Mở ra thời đại hoàng kim 50 năm",        energyCost:150 },
  { id:"tribulation",icon:"🌑",  label:"Sắc Lệnh Đại Kiếp",    cost:200, desc:"Giáng xuống thử thách toàn thế giới",    energyCost:200 },
  { id:"evolution",  icon:"🧬",  label:"Sắc Lệnh Tiến Hóa",    cost:120, desc:"Đẩy nhanh tiến hóa chủng tộc x3",       energyCost:120 }
];

const BLESSING_TYPES = [
  { id:"strength",    icon:"💪", label:"Ban Sức Mạnh",   cost:30, desc:"Tăng 50% sức chiến đấu thực thể",     duration:20  },
  { id:"wisdom",      icon:"🧠", label:"Ban Trí Tuệ",    cost:25, desc:"Tăng 40% phát triển khoa học/công nghệ", duration:30 },
  { id:"fertility",   icon:"🌱", label:"Ban Phồn Thực",  cost:20, desc:"Tăng gấp đôi tốc độ tăng dân số",     duration:25  },
  { id:"wealth",      icon:"💰", label:"Ban Phú Quý",    cost:35, desc:"Tăng 60% tài nguyên kinh tế",          duration:15  },
  { id:"protection",  icon:"🛡️", label:"Ban Bảo Vệ",    cost:40, desc:"Miễn nhiễm thiên tai trong 10 năm",    duration:10  },
  { id:"longevity",   icon:"⏳", label:"Ban Trường Thọ", cost:50, desc:"NPC sống lâu gấp đôi bình thường",     duration:50  }
];

const CURSE_TYPES = [
  { id:"famine",    icon:"☠️", label:"Trừng Phạt Đói Kém",    cost:40,  desc:"Giảm 70% nông nghiệp trong 15 năm",  duration:15 },
  { id:"plague",    icon:"💀", label:"Trừng Phạt Dịch Bệnh",  cost:60,  desc:"Gieo rắc bệnh dịch tàn khốc",        duration:10 },
  { id:"strife",    icon:"⚡", label:"Trừng Phạt Nội Loạn",   cost:50,  desc:"Gây nội chiến liên miên",             duration:20 },
  { id:"darkness",  icon:"🌑", label:"Trừng Phạt Tối Tăm",    cost:80,  desc:"Sụt giảm văn minh -50%",             duration:30 },
  { id:"downfall",  icon:"💥", label:"Trừng Phạt Diệt Vong",  cost:150, desc:"Khiến thực thể sụp đổ",              duration:5  }
];

function save() {
  try {
    const d = window.creatorAuthorityV51Data;
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      decrees:     d.decrees.slice(0,50),
      blessings:   d.blessings.slice(0,50),
      curses:      d.curses.slice(0,30),
      divineEnergy:d.divineEnergy,
      totalActions:d.totalActions
    }));
  } catch(e) {}
}
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      const d = window.creatorAuthorityV51Data;
      d.decrees      = p.decrees      || [];
      d.blessings    = p.blessings    || [];
      d.curses       = p.curses       || [];
      d.divineEnergy = p.divineEnergy != null ? p.divineEnergy : 1000;
      d.totalActions = p.totalActions || 0;
    }
  } catch(e) {}
}

function now() { return (typeof year !== 'undefined') ? year : 0; }
function randBetween(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function logEvent(msg, type) { if (typeof addLog === 'function') addLog(msg, type||'important'); }
function htAdd(title, color) {
  if (typeof window.htAddEvent === 'function')
    window.htAddEvent({ year: now(), type:'creator', title:'[Thiên Ý] '+title, color: color||'#facc15' });
}
function wmeAdd(title, content) {
  if (typeof window.wmeAddMemory === 'function')
    window.wmeAddMemory({ year: now(), category:'creator', title, content });
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

window.cgv51GetDecreeTypes    = function(){ return DECREE_TYPES; };
window.cgv51GetBlessingTypes  = function(){ return BLESSING_TYPES; };
window.cgv51GetCurseTypes     = function(){ return CURSE_TYPES; };
window.cgv51GetDecrees        = function(){ return window.creatorAuthorityV51Data.decrees; };
window.cgv51GetBlessings      = function(){ return window.creatorAuthorityV51Data.blessings; };
window.cgv51GetCurses         = function(){ return window.creatorAuthorityV51Data.curses; };
window.cgv51GetEnergy         = function(){ return window.creatorAuthorityV51Data.divineEnergy; };
window.cgv51GetMaxEnergy      = function(){ return window.creatorAuthorityV51Data.maxEnergy; };

window.cgv51IssueDecree = function(typeId, targetName) {
  const type = DECREE_TYPES.find(t=>t.id===typeId);
  if (!type) return { ok:false, msg:'Loại sắc lệnh không hợp lệ' };
  const d = window.creatorAuthorityV51Data;
  if (d.divineEnergy < type.energyCost) return { ok:false, msg:'Không đủ Thiên Năng (cần '+type.energyCost+')' };
  d.divineEnergy -= type.energyCost;
  const decree = {
    id: 'dec_' + Date.now(),
    typeId, icon: type.icon, label: type.label,
    target: targetName || 'Toàn Thế Giới',
    year: now(), desc: type.desc,
    expiresYear: now() + 30,
    active: true
  };
  d.decrees.unshift(decree);
  if (d.decrees.length > 50) d.decrees.pop();
  d.totalActions++;
  logEvent(type.icon+' Thiên Ý ban xuống: '+type.label+' → '+decree.target, 'important');
  htAdd(type.label+' ('+decree.target+')', '#facc15');
  wmeAdd('Sắc Lệnh: '+type.label, type.desc+' tại '+decree.target);
  save();
  return { ok:true, msg:'Sắc lệnh ban xuống thành công!', decree };
};

window.cgv51BlessEntity = function(typeId, targetName) {
  const type = BLESSING_TYPES.find(t=>t.id===typeId);
  if (!type) return { ok:false, msg:'Loại ban phước không hợp lệ' };
  const d = window.creatorAuthorityV51Data;
  if (d.divineEnergy < type.cost) return { ok:false, msg:'Không đủ Thiên Năng' };
  d.divineEnergy -= type.cost;
  const blessing = {
    id: 'bls_'+Date.now(),
    typeId, icon: type.icon, label: type.label,
    target: targetName || 'Chọn Ngẫu Nhiên',
    year: now(), desc: type.desc,
    expiresYear: now() + type.duration,
    active: true
  };
  d.blessings.unshift(blessing);
  if (d.blessings.length > 50) d.blessings.pop();
  d.totalActions++;
  logEvent(type.icon+' Ban phước: '+type.label+' → '+blessing.target, 'success');
  htAdd('Ban Phước: '+type.label+' ('+blessing.target+')', '#22c55e');
  save();
  return { ok:true, msg:'Ban phước thành công!', blessing };
};

window.cgv51CurseEntity = function(typeId, targetName) {
  const type = CURSE_TYPES.find(t=>t.id===typeId);
  if (!type) return { ok:false, msg:'Loại trừng phạt không hợp lệ' };
  const d = window.creatorAuthorityV51Data;
  if (d.divineEnergy < type.cost) return { ok:false, msg:'Không đủ Thiên Năng' };
  d.divineEnergy -= type.cost;
  const curse = {
    id: 'cur_'+Date.now(),
    typeId, icon: type.icon, label: type.label,
    target: targetName || 'Chọn Ngẫu Nhiên',
    year: now(), desc: type.desc,
    expiresYear: now() + type.duration,
    active: true
  };
  d.curses.unshift(curse);
  if (d.curses.length > 30) d.curses.pop();
  d.totalActions++;
  logEvent(type.icon+' Trừng phạt: '+type.label+' → '+curse.target, 'danger');
  htAdd('Trừng Phạt: '+type.label+' ('+curse.target+')', '#ef4444');
  save();
  return { ok:true, msg:'Trừng phạt ban xuống!', curse };
};

window.cgv51GetStats = function() {
  const d = window.creatorAuthorityV51Data;
  return {
    energy: d.divineEnergy,
    maxEnergy: d.maxEnergy,
    totalDecrees:  d.decrees.length,
    activeDecrees: d.decrees.filter(x=>x.active).length,
    totalBlessings:d.blessings.length,
    activeBlessings:d.blessings.filter(x=>x.active).length,
    totalCurses:   d.curses.length,
    activeCurses:  d.curses.filter(x=>x.active).length,
    totalActions:  d.totalActions
  };
};

// ─── GAME TICK ────────────────────────────────────────────────────────────────
let _tickCount = 0;
function myTick() {
  _tickCount++;
  const d = window.creatorAuthorityV51Data;
  // Regen divine energy
  if (d.divineEnergy < d.maxEnergy) {
    d.divineEnergy = Math.min(d.maxEnergy, d.divineEnergy + d.energyRegen);
  }
  // Expire decrees/blessings/curses
  if (_tickCount % 50 === 0) {
    const yr = now();
    d.decrees.forEach(x => { if (x.active && yr > x.expiresYear) x.active = false; });
    d.blessings.forEach(x => { if (x.active && yr > x.expiresYear) x.active = false; });
    d.curses.forEach(x => { if (x.active && yr > x.expiresYear) x.active = false; });
    save();
  }
}

function init() {
  load();
  const _orig = window.gameTick;
  window.gameTick = function() { if (_orig) _orig(); myTick(); };
  window.creatorAuthorityV51Data.initialized = true;
  console.log("[CreatorAuthorityV51] 👑 Thiên Ý Engine khởi động — Sắc lệnh · Ban phước · Trừng phạt · Thiên Năng sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
