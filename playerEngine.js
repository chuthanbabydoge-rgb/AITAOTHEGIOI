(function() {
"use strict";
// ============================================================
// PLAYER ENGINE V28 — Creator God V6
// Mở rộng playerSystem.js — KHÔNG ghi đè biến `player` cũ
// Profile mở rộng: ID · Title · Level · Fame · Wealth · Influence
//                  Age · Faction · Kingdom · Empire · Stats
// ============================================================
const SAVE_KEY = "cgv6_player_v28";
const INIT_DELAY = 4000;

// ─── RANK TITLES (cấp bậc xã hội) ────────────────────────────
const P_RANKS = [
  { id:"mortal",    level:1,  name:"Người Phàm",   icon:"🚶", color:"#94a3b8", desc:"Chưa bước vào con đường tu tiên" },
  { id:"cultivator",level:2,  name:"Tu Sĩ",        icon:"🧘", color:"#4ade80", desc:"Bắt đầu tu luyện, cảm nhận linh khí" },
  { id:"citylord",  level:3,  name:"Thành Chủ",    icon:"🏯", color:"#60a5fa", desc:"Nắm giữ một thành trì" },
  { id:"lord",      level:4,  name:"Lãnh Chúa",    icon:"🏰", color:"#818cf8", desc:"Cai quản một vùng lãnh địa" },
  { id:"king",      level:5,  name:"Vua",           icon:"♟️", color:"#fbbf24", desc:"Thống trị một vương quốc" },
  { id:"emperor",   level:6,  name:"Hoàng Đế",     icon:"👑", color:"#f59e0b", desc:"Thiên tử, thống lĩnh thiên hạ" },
  { id:"immortal",  level:7,  name:"Bất Tử",        icon:"✨", color:"#a78bfa", desc:"Vượt qua sinh tử, trường tồn" },
  { id:"minor_god", level:8,  name:"Tiểu Thần",    icon:"⭐", color:"#38bdf8", desc:"Thần linh cấp thấp, cai quản một vùng" },
  { id:"major_god", level:9,  name:"Đại Thần",     icon:"🌟", color:"#f0abfc", desc:"Thần linh cấp cao, quyền năng vô lượng" },
  { id:"creator",   level:10, name:"Thần Sáng Tạo",icon:"🌌", color:"#fde68a", desc:"Đỉnh tuyệt, ngang hàng với vũ trụ" },
];

const P_FACTION_TYPES = ["Chính Phái","Tà Phái","Trung Lập","Thương Nhân","Học Giả","Quân Phiệt","Tôn Giáo","Ẩn Sĩ"];

// ─── STATE ────────────────────────────────────────────────────
window.playerV28Data = {
  id: null,           // player unique ID
  name: null,         // synced from playerSystem
  title: "Người Phàm",
  titleCustom: null,
  rank: "mortal",
  rankLevel: 1,
  age: 18,
  gender: null,
  faction: null,
  factionType: "Trung Lập",
  kingdom: null,
  empire: null,
  // Core stats
  fame: 0,            // danh tiếng
  wealth: 100,        // tài sản (vàng)
  influence: 0,       // ảnh hưởng
  power: 10,          // chiến lực
  // Derived
  xp: 0,
  xpToNext: 100,
  // History log
  milestones: [],
  warHistory: [],
  diplomacyHistory: [],
  log: [],
  tickCount: 0,
  initialized: false,
};

function pSave(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(window.playerV28Data));}catch(e){}}
function pLoad(){try{const d=localStorage.getItem(SAVE_KEY);if(d) Object.assign(window.playerV28Data,JSON.parse(d));}catch(e){}}
function _rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function pLog(msg,type){window.playerV28Data.log.unshift({year:window.year||0,msg,type:type||"info"});if(window.playerV28Data.log.length>150)window.playerV28Data.log.pop();if(typeof window.htAddEvent==="function")window.htAddEvent({year:window.year||0,type:"player",title:msg,color:"#fbbf24"});}

// ─── SYNC FROM playerSystem.js ────────────────────────────────
function pSyncFromPlayer(){
  const p=window.player||null;
  if(!p) return;
  if(!window.playerV28Data.id){
    window.playerV28Data.id="player_"+Date.now();
    window.playerV28Data.name=p.name||"Tu Sĩ Vô Danh";
    window.playerV28Data.gender=p.gender||"Nam";
    window.playerV28Data.age=p.age||18;
    window.playerV28Data.faction=p.country||null;
    window.playerV28Data.wealth=100+_rand(0,50);
    pLog(`🌟 ${window.playerV28Data.name} nhập thế! Bắt đầu hành trình từ cấp Người Phàm.`,"born");
    if(typeof window.wmeAddMemory==="function") window.wmeAddMemory({year:window.year||0,category:"player",title:"Người Chơi Nhập Thế",content:`${window.playerV28Data.name} bắt đầu cuộc hành trình trong thế giới này.`});
  }
  // Always sync name/age if changed
  if(p.name) window.playerV28Data.name=p.name;
  if(p.age)  window.playerV28Data.age=p.age;
}

// ─── RANK PROGRESSION ─────────────────────────────────────────
function pCheckRankUp(){
  const d=window.playerV28Data;
  if(d.xp<d.xpToNext) return;
  if(d.rankLevel>=10) return;
  d.xp-=d.xpToNext;
  d.rankLevel++;
  d.xpToNext=Math.floor(d.xpToNext*2.5);
  const newRank=P_RANKS.find(r=>r.level===d.rankLevel)||P_RANKS[0];
  d.rank=newRank.id; d.title=newRank.name;
  d.milestones.push({year:window.year||0,event:`Thăng cấp: ${newRank.name}`,icon:newRank.icon});
  pLog(`${newRank.icon} THĂNG CẤP! ${d.name} đạt cấp bậc: ${newRank.name}`,"rankup");
  if(typeof window.wmeAddMemory==="function") window.wmeAddMemory({year:window.year||0,category:"player",title:`Thăng Cấp: ${newRank.name}`,content:`${d.name} đã thăng lên cấp bậc ${newRank.name}.`});
  // Unlock ascension if available
  if(typeof window.ascV28Data!=="undefined") window.ascV28Data.checkUnlock(d.rankLevel);
}

// ─── XP GAIN SOURCES ──────────────────────────────────────────
window.playerAddXP = function(amount, source){
  const d=window.playerV28Data;
  if(!d.id) return;
  d.xp+=amount;
  d.fame+=Math.floor(amount*0.2);
  d.influence+=Math.floor(amount*0.1);
  pCheckRankUp();
};
window.playerAddWealth = function(amount){window.playerV28Data.wealth=Math.max(0,window.playerV28Data.wealth+amount);};
window.playerAddFame = function(amount){window.playerV28Data.fame=Math.max(0,window.playerV28Data.fame+amount);};

// ─── TICK ─────────────────────────────────────────────────────
function pTick(){
  const d=window.playerV28Data;
  d.tickCount++;
  // Sync player object
  if(d.tickCount%5===0) pSyncFromPlayer();
  if(!d.id) return;
  // Passive XP gain per tick based on wealth/influence
  if(d.tickCount%10===0){
    const passiveXP=1+Math.floor(d.influence/50)+Math.floor(d.wealth/200);
    d.xp+=passiveXP;
    d.age+=0.01;
    pCheckRankUp();
  }
  // Passive wealth from territories
  if(d.tickCount%15===0&&typeof window.playerTerritoryData!=="undefined"){
    const income=window.playerTerritoryData.totalIncome||0;
    if(income>0){d.wealth+=income; window.playerV28Data.log[0]&&null;} // silent
  }
  // War XP
  if(typeof window.warsActive!=="undefined"&&window.warsActive&&d.tickCount%20===0){
    if(window.warsActive.length>0) d.xp+=2;
  }
  if(d.tickCount%30===0) pSave();
}

// ─── GET RANK INFO ────────────────────────────────────────────
window.pGetRankInfo=function(){return P_RANKS.find(r=>r.id===window.playerV28Data.rank)||P_RANKS[0];};

// ─── RENDER PANEL ─────────────────────────────────────────────
window.peRenderPanel=function(){
  const el=document.getElementById("panel-player-v28"); if(!el) return;
  const d=window.playerV28Data;
  const rankInfo=window.pGetRankInfo();
  const xpPct=Math.min(100,Math.round((d.xp/d.xpToNext)*100));

  if(!d.id){
    el.innerHTML=`<div style="padding:32px;text-align:center;color:#64748b;font-family:'Noto Serif SC',serif"><div style="font-size:3em;margin-bottom:12px">👤</div><div style="font-size:1.1em;color:#94a3b8">Chưa có nhân vật.</div><div style="margin-top:12px;color:#64748b;font-size:0.9em">Hãy tạo nhân vật từ menu chính để bắt đầu hành trình.</div></div>`;
    return;
  }

  let html=`<div style="padding:16px;font-family:'Noto Serif SC',serif;color:#e2e8f0">
  <!-- HEADER -->
  <div style="background:linear-gradient(135deg,#0f172a,#1e293b);border:1px solid ${rankInfo.color};border-radius:12px;padding:16px;margin-bottom:14px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">
      <div>
        <div style="font-size:2em">${rankInfo.icon}</div>
        <div style="font-size:1.4em;color:${rankInfo.color};font-weight:bold;margin-top:4px">${d.name}</div>
        <div style="color:#94a3b8;font-size:0.9em">${d.title}${d.titleCustom?' · '+d.titleCustom:''}</div>
        <div style="color:#64748b;font-size:0.82em;margin-top:2px">${d.faction||'Vô Phái'} · Tuổi ${Math.floor(d.age)}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:1.1em;color:${rankInfo.color};font-weight:bold">Cấp ${d.rankLevel}/10</div>
        <div style="color:#64748b;font-size:0.82em;margin-top:2px">${rankInfo.name}</div>
        <div style="color:#64748b;font-size:0.8em;margin-top:2px">${rankInfo.desc}</div>
      </div>
    </div>
    <!-- XP Bar -->
    <div style="margin-top:12px">
      <div style="display:flex;justify-content:space-between;font-size:0.8em;color:#64748b;margin-bottom:4px">
        <span>⭐ Kinh Nghiệm</span><span>${d.xp} / ${d.xpToNext} XP</span>
      </div>
      <div style="background:#0f172a;border-radius:6px;height:8px">
        <div style="background:linear-gradient(90deg,${rankInfo.color},#fff);height:8px;border-radius:6px;width:${xpPct}%;transition:width 0.5s"></div>
      </div>
    </div>
  </div>
  <!-- CORE STATS -->
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin-bottom:14px">
    ${[
      {icon:"💰",name:"Tài Sản",val:d.wealth.toLocaleString()+" vàng",color:"#fbbf24"},
      {icon:"🌟",name:"Danh Tiếng",val:d.fame.toLocaleString(),color:"#c084fc"},
      {icon:"🌐",name:"Ảnh Hưởng",val:d.influence.toLocaleString(),color:"#38bdf8"},
      {icon:"⚔️",name:"Chiến Lực",val:d.power.toLocaleString(),color:"#f87171"},
      {icon:"👥",name:"Phe Phái",val:d.factionType,color:"#4ade80"},
      {icon:"🏰",name:"Vương Quốc",val:d.kingdom||"Chưa có",color:"#a78bfa"},
    ].map(s=>`<div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:10px;text-align:center">
      <div style="font-size:1.3em">${s.icon}</div>
      <div style="color:#64748b;font-size:0.75em;margin:2px 0">${s.name}</div>
      <div style="color:${s.color};font-weight:bold;font-size:0.9em">${s.val}</div>
    </div>`).join("")}
  </div>
  <!-- RANK LADDER -->
  <div style="margin-bottom:14px">
    <div style="color:#fbbf24;font-weight:bold;margin-bottom:8px">⭐ Bậc Thang Quyền Năng</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px">
      ${P_RANKS.map(r=>`<div style="background:${d.rankLevel>=r.level?r.color+'22':'#0f172a'};border:1px solid ${d.rankLevel>=r.level?r.color:'#334155'};border-radius:6px;padding:4px 8px;font-size:0.8em;${d.rank===r.id?'outline:2px solid '+r.color+';':''}">${r.icon} <span style="color:${d.rankLevel>=r.level?r.color:'#475569'}">${r.name}</span></div>`).join("")}
    </div>
  </div>
  <!-- MILESTONES -->
  ${d.milestones.length?`<div style="margin-bottom:14px"><div style="color:#4ade80;font-weight:bold;margin-bottom:6px">🏆 Cột Mốc Quan Trọng</div><div style="max-height:120px;overflow-y:auto;font-size:0.82em">${d.milestones.slice(0,10).map(m=>`<div style="border-bottom:1px solid #1e293b;padding:3px 0;color:#94a3b8">${m.icon} [${m.year}] ${m.event}</div>`).join("")}</div></div>`:''}
  <!-- LOG -->
  <div><div style="color:#64748b;font-weight:bold;margin-bottom:6px;font-size:0.9em">📋 Nhật Ký Nhân Vật</div><div style="max-height:160px;overflow-y:auto;background:#0f172a;border-radius:8px;padding:8px;font-size:0.8em">${d.log.slice(0,20).map(e=>`<div style="border-bottom:1px solid #1e293b;padding:3px 0;color:${e.type==='rankup'?'#fbbf24':e.type==='born'?'#4ade80':'#94a3b8'}">[${e.year}] ${e.msg}</div>`).join("")||'<div style="color:#475569">Chưa có sự kiện.</div>'}</div></div>
  </div>`;
  el.innerHTML=html;
};

function peInit(){
  pLoad(); pSyncFromPlayer();
  window.playerV28Data.initialized=true;
  const _o=window.gameTick; window.gameTick=function(){if(_o)_o(); try{pTick();}catch(e){}};
  console.log("[PlayerEngineV28] 👤 Người Chơi V28 khởi động — Cấp bậc · Danh tiếng · Tài sản · Ảnh hưởng ✓");
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(peInit,INIT_DELAY));
else setTimeout(peInit,INIT_DELAY);
})();
