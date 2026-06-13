(function() {
"use strict";
// ============================================================
// PROPHECY SYSTEM V51 — Creator God Online
// Thiên Khải: 4 loại lời tiên tri · Theo dõi ứng nghiệm
// EXPAND ONLY · KHÔNG GHI ĐÈ file cũ
// ============================================================
const SAVE_KEY = "cgv6_prophecy_v51";
const INIT_DELAY = 6400;

window.prophecyV51Data = {
  active:    [],
  fulfilled: [],
  failed:    [],
  totalCreated: 0,
  initialized: false
};

const PROPHECY_TYPES = [
  {
    id:"era", icon:"🌅", label:"Tiên Tri Kỷ Nguyên", color:"#fbbf24",
    templates:[
      "Một kỷ nguyên vàng son sẽ bình minh khi {subject} đạt đỉnh cao vinh quang.",
      "Bóng tối sẽ bao phủ khi {subject} ngã xuống — và chỉ có ánh sáng mới cứu rỗi.",
      "Một thời đại hỗn loạn sẽ kết thúc khi {subject} đứng trên đỉnh núi.",
      "Từ tro tàn của {subject}, một nền văn minh mới sẽ vươn lên."
    ]
  },
  {
    id:"war", icon:"⚔️", label:"Tiên Tri Chiến Tranh", color:"#ef4444",
    templates:[
      "Máu và lửa sẽ nhuộm đỏ đất đai khi {subject} nổi dậy.",
      "Ba trận đại chiến sẽ định hình thế giới — {subject} đứng ở trung tâm.",
      "Chiến tranh ngàn năm sẽ chấm dứt khi {subject} đặt kiếm xuống.",
      "Từ trong lòng {subject}, một vị tướng vĩ đại nhất thế giới sẽ xuất hiện."
    ]
  },
  {
    id:"apocalypse", icon:"🌑", label:"Tiên Tri Tận Thế", color:"#7c3aed",
    templates:[
      "Ngày tận thế gần kề khi bảy dấu hiệu xuất hiện — {subject} là dấu hiệu thứ nhất.",
      "Vũ trụ sẽ sụp đổ khi {subject} phá vỡ lời thề ngàn năm.",
      "Chỉ có {subject} mới có thể ngăn màn đêm vĩnh cửu nuốt chửng tất cả.",
      "Khi {subject} biến mất, ánh sáng cuối cùng cũng tắt."
    ]
  },
  {
    id:"hero", icon:"🦸", label:"Tiên Tri Anh Hùng", color:"#22c55e",
    templates:[
      "Một anh hùng sẽ xuất hiện từ {subject} — kẻ duy nhất có thể đối mặt với đại kiếp.",
      "Dòng máu {subject} sẽ sinh ra đấng cứu thế trong thời kỳ đen tối nhất.",
      "Tên tuổi của {subject} sẽ được khắc vào lịch sử vĩnh cửu — bởi vinh quang hay thảm họa.",
      "Khi {subject} giơ tay lên trời, cả thế giới sẽ ngừng thở chờ đợi."
    ]
  }
];

function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      active:       window.prophecyV51Data.active.slice(0,30),
      fulfilled:    window.prophecyV51Data.fulfilled.slice(0,50),
      failed:       window.prophecyV51Data.failed.slice(0,20),
      totalCreated: window.prophecyV51Data.totalCreated
    }));
  } catch(e) {}
}
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      window.prophecyV51Data.active       = p.active       || [];
      window.prophecyV51Data.fulfilled    = p.fulfilled    || [];
      window.prophecyV51Data.failed       = p.failed       || [];
      window.prophecyV51Data.totalCreated = p.totalCreated || 0;
    }
  } catch(e) {}
}

function now() { return (typeof year !== 'undefined') ? year : 0; }
function pickRand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function logEvent(msg, type){ if (typeof addLog==='function') addLog(msg, type||'important'); }
function htAdd(title, color){
  if (typeof window.htAddEvent==='function')
    window.htAddEvent({ year:now(), type:'prophecy', title:'[Thiên Khải] '+title, color:color||'#7c3aed' });
}
function wmeAdd(title, content){
  if (typeof window.wmeAddMemory==='function')
    window.wmeAddMemory({ year:now(), category:'prophecy', title, content });
}

function getEntityNames() {
  const names = [];
  try {
    if (typeof window.kingdomData!=='undefined' && window.kingdomData.kingdoms) {
      const ks = Array.isArray(window.kingdomData.kingdoms) ? window.kingdomData.kingdoms : Object.values(window.kingdomData.kingdoms||{});
      ks.slice(0,5).forEach(function(k){ if(k&&k.name) names.push(k.name); });
    }
    if (typeof window.empireData!=='undefined' && window.empireData.empires) {
      const es = Array.isArray(window.empireData.empires) ? window.empireData.empires : Object.values(window.empireData.empires||{});
      es.slice(0,3).forEach(function(e){ if(e&&e.name) names.push(e.name); });
    }
    if (typeof window.npcs!=='undefined') {
      window.npcs.filter(function(n){ return n.status==='alive' && (n.level||0)>5; }).slice(0,4).forEach(function(n){ names.push(n.name); });
    }
  } catch(e) {}
  return names.length > 0 ? names : ['Thế Giới','Nhân Loại','Thiên Hạ','Đất Trời','Vũ Trụ'];
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

window.cgv51GetProphecyTypes  = function(){ return PROPHECY_TYPES; };
window.cgv51GetActiveProphecies   = function(){ return window.prophecyV51Data.active; };
window.cgv51GetFulfilledProphecies = function(){ return window.prophecyV51Data.fulfilled; };
window.cgv51GetFailedProphecies   = function(){ return window.prophecyV51Data.failed; };
window.cgv51GetProphecyStats = function(){
  const d = window.prophecyV51Data;
  return {
    active: d.active.length, fulfilled: d.fulfilled.length,
    failed: d.failed.length, total: d.totalCreated
  };
};

window.cgv51CreateProphecy = function(typeId, subjectName, customText) {
  const type = PROPHECY_TYPES.find(t=>t.id===typeId);
  if (!type) return { ok:false, msg:'Loại tiên tri không hợp lệ' };

  const subject = subjectName || pickRand(getEntityNames());
  const template = customText || pickRand(type.templates);
  const text = template.replace(/\{subject\}/g, subject);
  const fulfillsInYear = now() + 50 + Math.floor(Math.random()*150);

  const prophecy = {
    id:    'pro_'+Date.now(),
    typeId, icon: type.icon, label: type.label, color: type.color,
    subject, text,
    year:  now(),
    fulfillsInYear,
    status: 'active',
    fulfilled: false
  };

  window.prophecyV51Data.active.unshift(prophecy);
  if (window.prophecyV51Data.active.length > 30) window.prophecyV51Data.active.pop();
  window.prophecyV51Data.totalCreated++;

  // Deduct energy
  if (typeof window.creatorAuthorityV51Data !== 'undefined') {
    window.creatorAuthorityV51Data.divineEnergy = Math.max(0,
      window.creatorAuthorityV51Data.divineEnergy - 40);
  }

  logEvent(type.icon+' Thiên Khải hiển lộ: "'+text.substring(0,60)+'..."', 'important');
  htAdd(type.label+': '+subject, type.color);
  wmeAdd('Lời Tiên Tri: '+type.label, text);
  save();
  return { ok:true, msg:'Lời tiên tri đã được ban xuống!', prophecy };
};

window.cgv51AutoGenerateProphecy = function() {
  const type = pickRand(PROPHECY_TYPES);
  return window.cgv51CreateProphecy(type.id, null, null);
};

window.cgv51FulfillProphecy = function(prophId) {
  const idx = window.prophecyV51Data.active.findIndex(function(p){ return p.id===prophId; });
  if (idx < 0) return { ok:false, msg:'Không tìm thấy lời tiên tri' };
  const p = window.prophecyV51Data.active.splice(idx, 1)[0];
  p.status = 'fulfilled';
  p.fulfilled = true;
  p.fulfilledYear = now();
  window.prophecyV51Data.fulfilled.unshift(p);
  if (window.prophecyV51Data.fulfilled.length > 50) window.prophecyV51Data.fulfilled.pop();
  logEvent(p.icon+' Lời tiên tri ứng nghiệm: '+p.text.substring(0,60), 'success');
  htAdd('Ứng Nghiệm: '+p.label+' ('+p.subject+')', p.color);
  save();
  return { ok:true, msg:'Lời tiên tri đã ứng nghiệm!' };
};

// ─── GAME TICK ────────────────────────────────────────────────────────────────
let _tick = 0;
function myTick() {
  _tick++;
  if (_tick % 100 === 0) {
    const yr = now();
    const d = window.prophecyV51Data;

    // Auto-generate a prophecy occasionally
    if (d.active.length < 3 && Math.random() < 0.3) {
      window.cgv51AutoGenerateProphecy();
    }

    // Check fulfillment
    const toFulfill = d.active.filter(function(p){ return yr >= p.fulfillsInYear; });
    toFulfill.forEach(function(p) {
      if (Math.random() < 0.5) {
        window.cgv51FulfillProphecy(p.id);
      } else {
        // Prophecy failed
        const idx = d.active.findIndex(function(x){ return x.id===p.id; });
        if (idx>=0) {
          const failed = d.active.splice(idx,1)[0];
          failed.status = 'failed';
          d.failed.unshift(failed);
          if (d.failed.length > 20) d.failed.pop();
        }
      }
    });
    if (toFulfill.length > 0) save();
  }
}

function init() {
  load();
  const _orig = window.gameTick;
  window.gameTick = function() { if (_orig) _orig(); myTick(); };
  window.prophecyV51Data.initialized = true;
  // Seed initial prophecy if none exist
  setTimeout(function(){
    if (window.prophecyV51Data.active.length === 0 && window.prophecyV51Data.totalCreated === 0) {
      window.cgv51AutoGenerateProphecy();
    }
  }, 3000);
  console.log("[ProphecySystemV51] 🔮 Thiên Khải System khởi động — 4 loại tiên tri · Tự động ứng nghiệm sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
