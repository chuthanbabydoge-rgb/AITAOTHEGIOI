(function() {
"use strict";
// ============================================================
// MIRACLE SYSTEM V51 — Creator God Online
// Thần Tích: 8 loại phép màu can thiệp trực tiếp thế giới
// EXPAND ONLY · KHÔNG GHI ĐÈ file cũ
// ============================================================
const SAVE_KEY = "cgv6_miracle_v51";
const INIT_DELAY = 6300;

window.miracleV51Data = {
  miracles: [],
  activeEffects: [],
  history: [],
  totalCast: 0,
  initialized: false
};

const MIRACLE_TYPES = [
  {
    id:"resurrect_city", icon:"🏙️", label:"Hồi Sinh Thành Phố",
    cost:120, cooldown:50,
    desc:"Khôi phục hoàn toàn 1 thành phố/quốc gia bị tàn phá",
    effect:"Tăng dân số +200, kinh tế +100, ổn định +80",
    color:"#22c55e"
  },
  {
    id:"cure_plague", icon:"💊", label:"Chữa Đại Dịch",
    cost:80, cooldown:30,
    desc:"Xóa sạch mọi bệnh dịch đang hoành hành",
    effect:"Loại bỏ toàn bộ plague đang active",
    color:"#a78bfa"
  },
  {
    id:"resource_rain", icon:"🌧️", label:"Mưa Tài Nguyên",
    cost:60, cooldown:20,
    desc:"Tài nguyên từ trời rơi xuống tràn ngập",
    effect:"Tất cả tài nguyên +50% trong 10 năm",
    color:"#fbbf24"
  },
  {
    id:"holy_land", icon:"⛩️", label:"Khai Mở Thánh Địa",
    cost:150, cooldown:100,
    desc:"Tạo ra một vùng đất thiêng liêng thu hút tu sĩ và tín đồ",
    effect:"Tạo Thánh Địa mới · Tu luyện +100% trong vùng",
    color:"#f59e0b"
  },
  {
    id:"divine_shield", icon:"🛡️", label:"Thiên Khiên Bảo Hộ",
    cost:100, cooldown:40,
    desc:"Che chắn 1 thực thể khỏi mọi thiên tai và chiến tranh",
    effect:"Miễn nhiễm mọi thiên tai + giảm 80% thiệt hại chiến tranh 15 năm",
    color:"#60a5fa"
  },
  {
    id:"golden_harvest", icon:"🌾", label:"Thu Hoạch Vàng",
    cost:50, cooldown:15,
    desc:"Mùa màng bội thu kỳ diệu khắp thế giới",
    effect:"Nông nghiệp +300% trong 5 năm · dân số tăng nhanh",
    color:"#84cc16"
  },
  {
    id:"purify_corruption", icon:"🌟", label:"Tịnh Hóa Ô Nhiễm",
    cost:90, cooldown:35,
    desc:"Xóa sạch tham nhũng, băng hoại, tà khí khỏi một vùng",
    effect:"Loại bỏ corruption · Tăng stability +60 · Khởi động cải cách",
    color:"#e2e8f0"
  },
  {
    id:"mass_enlightenment", icon:"☀️", label:"Đại Giác Ngộ",
    cost:200, cooldown:150,
    desc:"Toàn thể nhân loại bước vào trạng thái giác ngộ tập thể",
    effect:"Công nghệ +500% · Văn hóa +500% · Xung đột -90% trong 20 năm",
    color:"#fde68a"
  }
];

const _lastCast = {};

function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      history:      window.miracleV51Data.history.slice(0,80),
      activeEffects:window.miracleV51Data.activeEffects,
      totalCast:    window.miracleV51Data.totalCast
    }));
  } catch(e) {}
}
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      window.miracleV51Data.history       = p.history       || [];
      window.miracleV51Data.activeEffects = p.activeEffects || [];
      window.miracleV51Data.totalCast     = p.totalCast     || 0;
    }
  } catch(e) {}
}

function now() { return (typeof year !== 'undefined') ? year : 0; }
function logEvent(msg, type) { if (typeof addLog === 'function') addLog(msg, type||'important'); }
function htAdd(title, color) {
  if (typeof window.htAddEvent === 'function')
    window.htAddEvent({ year:now(), type:'miracle', title:'[Thần Tích] '+title, color:color||'#f59e0b' });
}
function wmeAdd(title, content) {
  if (typeof window.wmeAddMemory === 'function')
    window.wmeAddMemory({ year:now(), category:'miracle', title, content });
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

window.cgv51GetMiracleTypes   = function(){ return MIRACLE_TYPES; };
window.cgv51GetMiracleHistory = function(){ return window.miracleV51Data.history; };
window.cgv51GetActiveEffects  = function(){ return window.miracleV51Data.activeEffects; };
window.cgv51GetMiracleStats   = function(){
  return {
    totalCast:     window.miracleV51Data.totalCast,
    activeEffects: window.miracleV51Data.activeEffects.length,
    historyCount:  window.miracleV51Data.history.length
  };
};

window.cgv51CastMiracle = function(typeId, targetName) {
  const type = MIRACLE_TYPES.find(t=>t.id===typeId);
  if (!type) return { ok:false, msg:'Loại thần tích không hợp lệ' };

  // Check energy
  if (typeof window.cgv51GetEnergy === 'function') {
    if (window.cgv51GetEnergy() < type.cost) {
      return { ok:false, msg:'Không đủ Thiên Năng (cần '+type.cost+')' };
    }
  }

  // Check cooldown
  const lastCastYear = _lastCast[typeId] || 0;
  if (now() - lastCastYear < type.cooldown) {
    const remaining = type.cooldown - (now() - lastCastYear);
    return { ok:false, msg:'Cooldown còn '+remaining+' năm' };
  }

  // Deduct energy
  if (typeof window.creatorAuthorityV51Data !== 'undefined') {
    window.creatorAuthorityV51Data.divineEnergy = Math.max(0,
      window.creatorAuthorityV51Data.divineEnergy - type.cost);
  }

  _lastCast[typeId] = now();

  const miracle = {
    id:       'mir_'+Date.now(),
    typeId,   icon:  type.icon, label: type.label,
    target:   targetName || 'Toàn Thế Giới',
    year:     now(),
    effect:   type.effect,
    desc:     type.desc,
    expiresYear: now() + (type.cooldown / 2),
    color:    type.color
  };

  window.miracleV51Data.history.unshift(miracle);
  if (window.miracleV51Data.history.length > 80) window.miracleV51Data.history.pop();

  // Track active effect
  window.miracleV51Data.activeEffects.push({
    id: miracle.id, label: type.label, icon: type.icon,
    target: miracle.target, expiresYear: miracle.expiresYear, color: type.color
  });

  window.miracleV51Data.totalCast++;

  // Apply special effects to game systems
  _applyMiracleEffect(typeId, targetName);

  logEvent(type.icon+' Thần Tích: '+type.label+' → '+miracle.target, 'important');
  htAdd(type.label+' ('+miracle.target+')', type.color);
  wmeAdd('Thần Tích: '+type.label, type.effect+' tại '+miracle.target);
  save();
  return { ok:true, msg:'✨ '+type.label+' đã được thi triển!', miracle };
};

function _applyMiracleEffect(typeId, target) {
  try {
    if (typeId === 'cure_plague') {
      if (typeof window.plagueData !== 'undefined' && window.plagueData.activePlagues) {
        window.plagueData.activePlagues = [];
      }
    }
    if (typeId === 'resource_rain') {
      if (typeof window.ecoExtractResource === 'function') {
        // Refill resources
        ['food','minerals','mana','crystals','wood'].forEach(function(r) {
          try { window.ecoExtractResource(r, -100); } catch(e) {}
        });
      }
    }
    if (typeId === 'mass_enlightenment') {
      if (typeof addLog === 'function') addLog('☀️ Đại Giác Ngộ bao phủ toàn thế giới — Văn minh vọt tiến!', 'important');
    }
  } catch(e) {}
}

// ─── GAME TICK ────────────────────────────────────────────────────────────────
let _tick = 0;
function myTick() {
  _tick++;
  if (_tick % 60 === 0) {
    const yr = now();
    window.miracleV51Data.activeEffects = window.miracleV51Data.activeEffects.filter(function(e){
      return yr <= e.expiresYear;
    });
    save();
  }
}

function init() {
  load();
  const _orig = window.gameTick;
  window.gameTick = function() { if (_orig) _orig(); myTick(); };
  window.miracleV51Data.initialized = true;
  console.log("[MiracleSystemV51] ✨ Thần Tích System khởi động — 8 loại phép màu · Cooldown · Effect tracking sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
