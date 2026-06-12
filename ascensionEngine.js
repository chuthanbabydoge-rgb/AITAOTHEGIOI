(function() {
"use strict";
// ============================================================
// ASCENSION ENGINE V28 — Creator God V6
// 10 Cấp Bậc Thăng Thiên · Khả Năng Mở Khóa · Sứ Mệnh Thần Thánh
// ============================================================
const SAVE_KEY = "cgv6_ascension_v28";
const INIT_DELAY = 4200;

// ─── ASCENSION RANKS ─────────────────────────────────────────
const ASC_RANKS = [
  {
    level:1, id:"mortal", name:"Người Phàm", icon:"🚶", color:"#94a3b8",
    requirements:{rankLevel:1, fame:0, wealth:0},
    abilities:["Quan sát thế giới","Tương tác cơ bản"],
    desc:"Khởi đầu hành trình từ một người bình thường."
  },
  {
    level:2, id:"cultivator", name:"Tu Sĩ", icon:"🧘", color:"#4ade80",
    requirements:{rankLevel:2, fame:50, wealth:200},
    abilities:["Tu luyện linh khí","Học võ công cơ bản","Gia nhập môn phái"],
    desc:"Bước vào con đường tu tiên, cảm nhận linh khí thiên địa."
  },
  {
    level:3, id:"citylord", name:"Thành Chủ", icon:"🏯", color:"#60a5fa",
    requirements:{rankLevel:3, fame:200, wealth:1000},
    abilities:["Cai quản một thành","Thu thuế","Tuyển binh","Xây dựng công trình"],
    desc:"Nắm quyền quản lý một thành trì quan trọng."
  },
  {
    level:4, id:"lord", name:"Lãnh Chúa", icon:"🏰", color:"#818cf8",
    requirements:{rankLevel:4, fame:500, wealth:3000},
    abilities:["Sở hữu lãnh thổ","Điều binh khiển tướng","Ngoại giao cơ bản","Ban thưởng chư hầu"],
    desc:"Cai quản một vùng lãnh thổ rộng lớn."
  },
  {
    level:5, id:"king", name:"Vua", icon:"♟️", color:"#fbbf24",
    requirements:{rankLevel:5, fame:1500, wealth:10000},
    abilities:["Thành lập vương quốc","Tuyên chiến","Ký hiệp ước","Phong tước vị","Ra sắc lệnh"],
    desc:"Thiên tử của một vương quốc, danh chấn thiên hạ."
  },
  {
    level:6, id:"emperor", name:"Hoàng Đế", icon:"👑", color:"#f59e0b",
    requirements:{rankLevel:6, fame:5000, wealth:50000},
    abilities:["Thống lĩnh đế chế","Phong thần","Thiên triều triệu kiến","Thiên thư sắc phong","Mệnh trời thừa nhận"],
    desc:"Thiên tử tối cao, thống lĩnh muôn nước."
  },
  {
    level:7, id:"immortal", name:"Bất Tử", icon:"✨", color:"#a78bfa",
    requirements:{rankLevel:7, fame:15000, wealth:100000},
    abilities:["Bất tử bất diệt","Vượt qua sinh tử","Thiên nhãn thông","Linh lực điều khiển","Can thiệp số mệnh NPC"],
    desc:"Thoát khỏi vòng sinh tử, trường tồn cùng thiên địa."
  },
  {
    level:8, id:"minor_god", name:"Tiểu Thần", icon:"⭐", color:"#38bdf8",
    requirements:{rankLevel:8, fame:50000, wealth:500000},
    abilities:["Thần lực cơ bản","Cai quản một vùng thiêng","Ban phúc/giáng họa nhỏ","Tiên tri sự kiện","Triệu hoán linh thú"],
    desc:"Bước vào cảnh giới thần linh, quyền năng vô lượng."
  },
  {
    level:9, id:"major_god", name:"Đại Thần", icon:"🌟", color:"#f0abfc",
    requirements:{rankLevel:9, fame:200000, wealth:2000000},
    abilities:["Thiên Đạo Phán Quyết","Cải biến thiên thời địa lợi","Can thiệp đại sự thiên hạ","Thần lực cao cấp","Kiểm soát nguyên tố"],
    desc:"Thần linh cấp cao, quyền năng lay trời chuyển đất."
  },
  {
    level:10, id:"creator", name:"Thần Sáng Tạo", icon:"🌌", color:"#fde68a",
    requirements:{rankLevel:10, fame:1000000, wealth:0},
    abilities:["Tạo ra thế giới mới","Quyết định vận mệnh vũ trụ","Vô lượng thần lực","Thời gian không giới hạn","Toàn tri toàn năng"],
    desc:"Đỉnh tuyệt của mọi sự tồn tại. Ngang hàng với chính vũ trụ."
  },
];

const DIVINE_MISSIONS = [
  { id:"world_order",   name:"Thiết Lập Trật Tự Thế Giới", icon:"⚖️", reqLevel:8, reward:{fame:5000,xp:500},  desc:"Ban ra 3 thiên lệnh trọng đại" },
  { id:"great_war",     name:"Thánh Chiến Thần Thánh",       icon:"⚔️", reqLevel:7, reward:{fame:3000,xp:300},  desc:"Dẫn dắt 2 cuộc chiến lớn" },
  { id:"divine_dynasty",name:"Thiết Lập Triều Đại Thần Thánh",icon:"👑",reqLevel:6, reward:{fame:8000,xp:800},  desc:"Thành lập đế chế thống nhất" },
  { id:"cosmos_create", name:"Khởi Nguồn Vũ Trụ Mới",       icon:"🌌", reqLevel:10,reward:{fame:99999,xp:9999},desc:"Đạt cảnh giới Thần Sáng Tạo" },
  { id:"peace_world",   name:"Hòa Bình Thiên Hạ",            icon:"🕊️", reqLevel:5, reward:{fame:2000,xp:200},  desc:"Chấm dứt mọi chiến tranh trong 50 năm" },
];

// ─── STATE ────────────────────────────────────────────────────
window.ascV28Data = {
  currentLevel: 1,
  unlockedAbilities: [],
  availableMissions: [],
  completedMissions: [],
  divinePoints: 0,
  blessingsGiven: 0,
  cursesGiven: 0,
  log: [],
  tickCount: 0,
  initialized: false,
};

// Add checkUnlock method
window.ascV28Data.checkUnlock = function(rankLevel){
  const rank=ASC_RANKS.find(r=>r.level===rankLevel);
  if(!rank) return;
  rank.abilities.forEach(ab=>{ if(!window.ascV28Data.unlockedAbilities.includes(ab)) window.ascV28Data.unlockedAbilities.push(ab); });
  if(rankLevel>window.ascV28Data.currentLevel) window.ascV28Data.currentLevel=rankLevel;
  ascLog(`🔓 Mở khóa năng lực: ${rank.abilities.join(", ")} (${rank.name})`,"unlock");
};

function ascSave(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(window.ascV28Data));}catch(e){}}
function ascLoad(){try{const d=localStorage.getItem(SAVE_KEY);if(d) Object.assign(window.ascV28Data,JSON.parse(d));}catch(e){}}
function ascLog(msg,type){window.ascV28Data.log.unshift({year:window.year||0,msg,type:type||"info"});if(window.ascV28Data.log.length>100)window.ascV28Data.log.pop();}

// ─── DIVINE ACTIONS ───────────────────────────────────────────
window.ascBless = function(targetName){
  const d=window.ascV28Data;
  if(d.currentLevel<7){return "Cần đạt cấp Bất Tử để ban phúc.";}
  d.blessingsGiven++; d.divinePoints+=10;
  ascLog(`🌟 Thần ân ban xuống ${targetName||"thiên hạ"}!`,"bless");
  if(typeof window.playerAddFame==="function") window.playerAddFame(200);
  if(typeof window.htAddEvent==="function") window.htAddEvent({year:window.year||0,type:"divine",title:`Thần Ân: ${targetName||"Thiên Hạ"}`,color:"#fde68a"});
  return "Đã ban phúc thành công!";
};
window.ascCurse = function(targetName){
  const d=window.ascV28Data;
  if(d.currentLevel<7){return "Cần đạt cấp Bất Tử để giáng họa.";}
  d.cursesGiven++; d.divinePoints+=15;
  ascLog(`💀 Thiên phạt giáng xuống ${targetName||"kẻ phạm thiên"}!`,"curse");
  if(typeof window.htAddEvent==="function") window.htAddEvent({year:window.year||0,type:"divine",title:`Thiên Phạt: ${targetName||""}`,color:"#f87171"});
  return "Đã giáng thiên phạt!";
};

// ─── TICK ─────────────────────────────────────────────────────
function ascTick(){
  const d=window.ascV28Data;
  d.tickCount++;
  if(!d.initialized) return;
  // Sync level from playerV28
  if(typeof window.playerV28Data!=="undefined"){
    const pLvl=window.playerV28Data.rankLevel||1;
    if(pLvl>d.currentLevel){
      d.checkUnlock(pLvl);
      d.currentLevel=pLvl;
    }
  }
  // Initialize abilities for current level
  if(d.unlockedAbilities.length===0){
    const rank=ASC_RANKS.find(r=>r.level<=d.currentLevel);
    if(rank) ASC_RANKS.filter(r=>r.level<=d.currentLevel).forEach(r=>r.abilities.forEach(ab=>{ if(!d.unlockedAbilities.includes(ab)) d.unlockedAbilities.push(ab); }));
  }
  // Passive divine points
  if(d.tickCount%20===0&&d.currentLevel>=7) d.divinePoints+=Math.floor(d.currentLevel-6);
  if(d.tickCount%30===0) ascSave();
}

// ─── RENDER ───────────────────────────────────────────────────
window.ascRenderPanel=function(){
  const el=document.getElementById("panel-ascension-v28"); if(!el) return;
  const d=window.ascV28Data;
  const curRank=ASC_RANKS.find(r=>r.level===d.currentLevel)||ASC_RANKS[0];
  const nextRank=ASC_RANKS.find(r=>r.level===d.currentLevel+1);
  const pData=window.playerV28Data||{};

  let html=`<div style="padding:16px;font-family:'Noto Serif SC',serif;color:#e2e8f0">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px">
    <div style="font-size:1.3em;color:#fde68a;font-weight:bold">⭐ Hệ Thống Thăng Cấp V28</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.82em">🔓 ${d.unlockedAbilities.length} năng lực</span>
      <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.82em">✨ ${d.divinePoints} điểm thần</span>
    </div>
  </div>
  <!-- CURRENT RANK CARD -->
  <div style="background:linear-gradient(135deg,${curRank.color}22,#0f172a);border:2px solid ${curRank.color};border-radius:12px;padding:14px;margin-bottom:14px">
    <div style="font-size:2em;margin-bottom:6px">${curRank.icon}</div>
    <div style="font-size:1.3em;color:${curRank.color};font-weight:bold">${curRank.name} (Cấp ${curRank.level}/10)</div>
    <div style="color:#94a3b8;font-size:0.85em;margin:4px 0">${curRank.desc}</div>
    <div style="margin-top:8px"><div style="color:#64748b;font-size:0.8em;margin-bottom:4px">🔓 Năng lực đã mở khóa:</div><div style="display:flex;flex-wrap:wrap;gap:4px">${curRank.abilities.map(a=>`<span style="background:#1e293b;padding:3px 8px;border-radius:6px;font-size:0.8em;color:#4ade80">✓ ${a}</span>`).join("")}</div></div>
  </div>
  <!-- ALL RANKS -->
  <div style="margin-bottom:14px"><div style="color:#94a3b8;font-weight:bold;margin-bottom:8px">📊 Toàn Bộ Bậc Thang</div>
  <div style="display:flex;flex-direction:column;gap:6px">
  ${ASC_RANKS.map(r=>`<div style="background:${d.currentLevel>=r.level?r.color+'11':'#0f172a'};border:1px solid ${d.currentLevel>=r.level?r.color:'#334155'};border-radius:8px;padding:10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
    <div style="display:flex;align-items:center;gap:8px">
      <span style="font-size:1.3em">${r.icon}</span>
      <div><div style="color:${d.currentLevel>=r.level?r.color:'#475569'};font-weight:bold">${r.level}. ${r.name}</div><div style="font-size:0.78em;color:#64748b">${r.desc}</div></div>
    </div>
    <div style="text-align:right;font-size:0.78em">
      ${d.currentLevel>=r.level?`<span style="color:#4ade80">✓ Đã đạt</span>`:`<span style="color:#64748b">Cần: Danh tiếng ${r.requirements.fame.toLocaleString()}</span>`}
    </div>
  </div>`).join("")}
  </div></div>
  <!-- DIVINE MISSIONS -->
  <div style="margin-bottom:14px"><div style="color:#fbbf24;font-weight:bold;margin-bottom:8px">🌌 Sứ Mệnh Thần Thánh</div>
  <div style="display:flex;flex-direction:column;gap:6px">
  ${DIVINE_MISSIONS.map(m=>{
    const avail=d.currentLevel>=m.reqLevel;
    const done=d.completedMissions.includes(m.id);
    return `<div style="background:#0f172a;border:1px solid ${done?'#4ade80':avail?'#fbbf24':'#334155'};border-radius:8px;padding:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
        <div>${m.icon} <b style="color:${done?'#4ade80':avail?'#fbbf24':'#64748b'}">${m.name}</b></div>
        <span style="font-size:0.8em;color:#64748b">Yêu cầu cấp ${m.reqLevel} · +${m.reward.fame} danh tiếng</span>
      </div>
      <div style="font-size:0.82em;color:#94a3b8;margin-top:4px">${m.desc}</div>
      ${done?`<span style="color:#4ade80;font-size:0.8em">✓ Hoàn thành</span>`:avail?`<button onclick="if(typeof window.ascCompleteMission==='function')window.ascCompleteMission('${m.id}')" style="margin-top:6px;background:#fbbf24;color:#000;border:none;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:0.82em">Nhận Nhiệm Vụ</button>`:''}
    </div>`;
  }).join("")}
  </div></div>
  <!-- DIVINE ACTIONS -->
  ${d.currentLevel>=7?`<div style="margin-bottom:14px"><div style="color:#a78bfa;font-weight:bold;margin-bottom:8px">✨ Thần Quyền Năng</div><div style="display:flex;gap:8px;flex-wrap:wrap">
    <button onclick="alert(typeof window.ascBless==='function'?window.ascBless('thiên hạ'):'')" style="background:#fde68a22;border:1px solid #fde68a;color:#fde68a;padding:8px 16px;border-radius:8px;cursor:pointer">🌟 Ban Phúc (+200 danh tiếng)</button>
    <button onclick="alert(typeof window.ascCurse==='function'?window.ascCurse('kẻ phạm thiên'):'')" style="background:#f8717122;border:1px solid #f87171;color:#f87171;padding:8px 16px;border-radius:8px;cursor:pointer">💀 Giáng Thiên Phạt</button>
  </div></div>`:''}
  <!-- LOG -->
  <div><div style="color:#64748b;font-weight:bold;margin-bottom:6px;font-size:0.9em">📋 Nhật Ký Thăng Thiên</div><div style="max-height:150px;overflow-y:auto;background:#0f172a;border-radius:8px;padding:8px;font-size:0.8em">${d.log.slice(0,15).map(e=>`<div style="border-bottom:1px solid #1e293b;padding:3px 0;color:${e.type==='unlock'?'#fbbf24':e.type==='bless'?'#4ade80':e.type==='curse'?'#f87171':'#94a3b8'}">[${e.year}] ${e.msg}</div>`).join("")||'<div style="color:#475569">Chưa có sự kiện.</div>'}</div></div>
  </div>`;
  el.innerHTML=html;
};

// Complete mission button
window.ascCompleteMission=function(missionId){
  const mission=DIVINE_MISSIONS.find(m=>m.id===missionId);
  if(!mission) return;
  if(window.ascV28Data.completedMissions.includes(missionId)) return;
  window.ascV28Data.completedMissions.push(missionId);
  window.ascV28Data.divinePoints+=mission.reward.xp;
  if(typeof window.playerAddFame==="function") window.playerAddFame(mission.reward.fame);
  if(typeof window.playerAddXP==="function") window.playerAddXP(mission.reward.xp,"divine_mission");
  ascLog(`✅ Hoàn thành Sứ Mệnh Thần Thánh: ${mission.name}!`,"mission");
  ascSave();
  window.ascRenderPanel();
};

function ascInit(){
  ascLoad();
  window.ascV28Data.initialized=true;
  const _o=window.gameTick; window.gameTick=function(){if(_o)_o(); try{ascTick();}catch(e){}};
  console.log("[AscensionEngineV28] ⭐ Thăng Thiên V28 khởi động — 10 cấp bậc · Sứ Mệnh Thần Thánh · Thần Quyền ✓");
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(ascInit,INIT_DELAY));
else setTimeout(ascInit,INIT_DELAY);
})();
