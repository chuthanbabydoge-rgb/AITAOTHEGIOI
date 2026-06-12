(function() {
"use strict";
// ============================================================
// PLAYER QUEST SYSTEM V28 — Creator God V6
// Mở rộng questSystem.js — KHÔNG ghi đè QUEST_TYPES
// Nhiệm Vụ Người Chơi: Khám Phá · Chinh Phục · Thương Mại · Ngoại Giao · Thần Thánh
// ============================================================
const SAVE_KEY = "cgv6_player_quest_v28";
const INIT_DELAY = 5200;

const PLAYER_QUEST_TYPES = [
  {
    id:"exploration", name:"Khám Phá", icon:"🗺️", color:"#60a5fa",
    quests:[
      { id:"explore_continent", name:"Khám Phá Lục Địa Mới",     reward:{xp:200,fame:100,gold:500},  duration:20, difficulty:2 },
      { id:"find_treasure",     name:"Tìm Kho Báu Cổ Đại",        reward:{xp:300,fame:200,gold:1000}, duration:15, difficulty:3 },
      { id:"map_ocean",         name:"Lập Bản Đồ Đại Dương",      reward:{xp:400,fame:300,gold:800},  duration:25, difficulty:3 },
      { id:"discover_ruins",    name:"Khám Phá Phế Tích Thần Thánh",reward:{xp:500,fame:400,gold:1500},duration:30, difficulty:4 },
    ]
  },
  {
    id:"conquest", name:"Chinh Phục", icon:"⚔️", color:"#f87171",
    quests:[
      { id:"conquer_village",   name:"Chiếm Lãnh Làng Đầu Tiên",  reward:{xp:150,fame:100,gold:300},  duration:10, difficulty:2 },
      { id:"defeat_warlord",    name:"Hạ Bệ Quân Phiệt",          reward:{xp:400,fame:300,gold:800},  duration:20, difficulty:4 },
      { id:"unite_kingdoms",    name:"Thống Nhất 3 Vương Quốc",    reward:{xp:1000,fame:800,gold:5000},duration:50, difficulty:6 },
      { id:"world_conquest",    name:"Chinh Phục Thiên Hạ",        reward:{xp:5000,fame:3000,gold:20000},duration:100,difficulty:9 },
    ]
  },
  {
    id:"trade", name:"Thương Mại", icon:"💰", color:"#fbbf24",
    quests:[
      { id:"first_trade",       name:"Giao Dịch Đầu Tiên",        reward:{xp:50,fame:30,gold:200},    duration:5,  difficulty:1 },
      { id:"trade_route",       name:"Thiết Lập Tuyến Thương Mại", reward:{xp:200,fame:150,gold:1000}, duration:15, difficulty:3 },
      { id:"merchant_empire",   name:"Xây Dựng Đế Chế Thương Mại",reward:{xp:800,fame:600,gold:8000}, duration:40, difficulty:5 },
      { id:"monopoly",          name:"Độc Quyền Thương Mại Thiên Hạ",reward:{xp:2000,fame:1500,gold:20000},duration:80,difficulty:8 },
    ]
  },
  {
    id:"diplomacy", name:"Ngoại Giao", icon:"🤝", color:"#4ade80",
    quests:[
      { id:"first_alliance",    name:"Thành Lập Liên Minh Đầu Tiên",reward:{xp:100,fame:80,gold:300}, duration:8,  difficulty:2 },
      { id:"peace_treaty",      name:"Ký Hòa Ước Lịch Sử",         reward:{xp:300,fame:250,gold:500},  duration:12, difficulty:3 },
      { id:"world_council",     name:"Dẫn Dắt Hội Đồng Thế Giới",  reward:{xp:600,fame:500,gold:1000}, duration:30, difficulty:5 },
      { id:"world_peace",       name:"Thiết Lập Hòa Bình Vĩnh Cửu",reward:{xp:3000,fame:2500,gold:5000},duration:100,difficulty:8 },
    ]
  },
  {
    id:"divine", name:"Thần Thánh", icon:"✨", color:"#fde68a",
    quests:[
      { id:"first_prayer",      name:"Nhận Tiên Tri Đầu Tiên",     reward:{xp:200,fame:150,gold:0},    duration:10, difficulty:3 },
      { id:"divine_artifact",   name:"Thu Thập Thần Khí",           reward:{xp:500,fame:400,gold:1000}, duration:25, difficulty:5 },
      { id:"heavenly_test",     name:"Vượt Qua Thiên Kiếp",         reward:{xp:2000,fame:1500,gold:0},  duration:40, difficulty:7 },
      { id:"ascend_heaven",     name:"Thăng Thiên Cửu Trùng",       reward:{xp:9999,fame:9999,gold:0},  duration:200,difficulty:10},
    ]
  },
];

const DIFFICULTY_LABELS=["","⚪ Dễ","🟢 Bình","🔵 Khó","🟡 Nguy","🔴 Tử Thần","💀 Thần","💀 Thần","💀 Thần","⚫ Huyền","🌌 Tuyệt Đỉnh"];

function _rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}

window.pqData = {
  activeQuests: [],    // { questId, typeId, name, icon, progress, maxProgress, reward, startYear, status }
  completedQuests: [], // completed quest records
  failedQuests: [],
  totalXpEarned: 0,
  totalGoldEarned: 0,
  log: [],
  tickCount: 0,
  initialized: false,
};

function pqSave(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(window.pqData));}catch(e){}}
function pqLoad(){try{const d=localStorage.getItem(SAVE_KEY);if(d) Object.assign(window.pqData,JSON.parse(d));}catch(e){}}
function pqLog(msg,type){window.pqData.log.unshift({year:window.year||0,msg,type:type||"info"});if(window.pqData.log.length>150)window.pqData.log.pop();}

// ─── START QUEST ──────────────────────────────────────────────
window.pqStartQuest = function(typeId, questId){
  const type=PLAYER_QUEST_TYPES.find(t=>t.id===typeId);
  if(!type) return "Không tìm thấy loại nhiệm vụ.";
  const questDef=type.quests.find(q=>q.id===questId);
  if(!questDef) return "Không tìm thấy nhiệm vụ.";
  // Check already active
  if(window.pqData.activeQuests.find(q=>q.questId===questId&&q.status==="active")) return "Nhiệm vụ này đang tiến hành!";
  // Check max active quests
  if(window.pqData.activeQuests.filter(q=>q.status==="active").length>=5) return "Đã đạt giới hạn 5 nhiệm vụ cùng lúc.";
  const quest={
    id:"pq_"+Date.now(),questId,typeId,name:questDef.name,icon:type.icon,
    progress:0,maxProgress:questDef.duration,reward:questDef.reward,
    difficulty:questDef.difficulty,startYear:window.year||0,status:"active",
  };
  window.pqData.activeQuests.push(quest);
  pqLog(`${type.icon} Bắt đầu nhiệm vụ: ${questDef.name}`,"start");
  return "Đã nhận nhiệm vụ!";
};

// ─── TICK QUESTS ──────────────────────────────────────────────
function pqTickQuests(){
  const d=window.pqData;
  d.activeQuests.filter(q=>q.status==="active").forEach(q=>{
    const pRank=(window.playerV28Data&&window.playerV28Data.rankLevel)||1;
    const progressRate=Math.max(1,Math.floor(pRank*2/q.difficulty));
    q.progress+=progressRate+_rand(0,3);
    if(q.progress>=q.maxProgress){
      q.status="completed"; q.endYear=window.year||0;
      d.completedQuests.unshift({...q, completedYear:window.year||0});
      if(d.completedQuests.length>50) d.completedQuests.pop();
      d.totalXpEarned+=q.reward.xp;
      d.totalGoldEarned+=q.reward.gold;
      if(typeof window.playerAddXP==="function") window.playerAddXP(q.reward.xp,"quest");
      if(typeof window.invAddGold==="function") window.invAddGold(q.reward.gold);
      if(typeof window.playerAddFame==="function") window.playerAddFame(q.reward.fame);
      if(typeof window.prAddReputation==="function") window.prAddReputation(q.typeId==="divine"?"heroic_deed":q.typeId==="conquest"?"war_victory":"trade_deal",0.5);
      pqLog(`✅ Hoàn thành: ${q.name}! +${q.reward.xp}XP +${q.reward.gold}💰`,"complete");
      if(typeof window.htAddEvent==="function") window.htAddEvent({year:window.year||0,type:"quest",title:`Hoàn thành: ${q.name}`,color:"#4ade80"});
    }
  });
  d.activeQuests=d.activeQuests.filter(q=>q.status==="active");
}

function pqTick(){
  window.pqData.tickCount++;
  if(!window.pqData.initialized) return;
  if(window.pqData.tickCount%3===0) pqTickQuests();
  if(window.pqData.tickCount%30===0) pqSave();
}

window.pqRenderPanel=function(panelId){
  const el=document.getElementById(panelId||"panel-player-v28");if(!el) return;
  const d=window.pqData;
  const active=d.activeQuests.filter(q=>q.status==="active");

  let html=`<div style="border-top:1px solid #334155;margin-top:16px;padding-top:14px">
  <div style="color:#60a5fa;font-weight:bold;margin-bottom:10px">📜 Nhiệm Vụ Người Chơi V28</div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
    <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.82em">⚡ ${active.length}/5 đang làm</span>
    <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.82em">✅ ${d.completedQuests.length} hoàn thành</span>
    <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.82em">💰 ${d.totalGoldEarned.toLocaleString()} tổng vàng</span>
  </div>
  <!-- ACTIVE QUESTS -->
  ${active.length?`<div style="margin-bottom:12px"><div style="color:#4ade80;font-size:0.9em;font-weight:bold;margin-bottom:6px">⚡ Đang Tiến Hành</div>${active.map(q=>`<div style="background:#0a150a;border:1px solid #166534;border-radius:8px;padding:10px;margin-bottom:6px">
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px"><span style="color:#86efac;font-weight:bold">${q.icon} ${q.name}</span><span style="font-size:0.8em;color:#64748b">${DIFFICULTY_LABELS[q.difficulty]||''}</span></div>
    <div style="display:flex;gap:8px;font-size:0.8em;color:#94a3b8;margin:4px 0"><span>+${q.reward.xp}XP</span><span>+${q.reward.fame}Fame</span><span>+${q.reward.gold}💰</span></div>
    <div style="background:#1e293b;height:5px;border-radius:3px;margin-top:6px"><div style="background:#4ade80;height:5px;border-radius:3px;width:${Math.min(100,Math.round(q.progress/q.maxProgress*100))}%"></div></div>
    <div style="font-size:0.77em;color:#64748b;margin-top:2px">${Math.round(q.progress/q.maxProgress*100)}% · Bắt đầu năm ${q.startYear}</div>
  </div>`).join("")}</div>`:''}
  <!-- QUEST BOARD -->
  <div><div style="color:#94a3b8;font-size:0.9em;font-weight:bold;margin-bottom:8px">📋 Bảng Nhiệm Vụ</div>
  ${PLAYER_QUEST_TYPES.map(type=>`<div style="margin-bottom:10px"><div style="color:${type.color};font-weight:bold;margin-bottom:5px">${type.icon} ${type.name}</div>
  <div style="display:flex;flex-direction:column;gap:4px">
  ${type.quests.map(q=>{
    const isActive=active.find(a=>a.questId===q.id);
    const isDone=d.completedQuests.find(c=>c.questId===q.id);
    return `<div style="background:#0f172a;border:1px solid ${isDone?'#4ade80':isActive?type.color:'#334155'};border-radius:6px;padding:8px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
      <div><div style="color:${isDone?'#4ade80':isActive?type.color:'#e2e8f0'};font-size:0.85em">${q.name}</div><div style="font-size:0.77em;color:#64748b">${DIFFICULTY_LABELS[q.difficulty]} · +${q.reward.xp}XP +${q.reward.gold}💰</div></div>
      ${isDone?`<span style="color:#4ade80;font-size:0.8em">✓ Xong</span>`:isActive?`<span style="color:${type.color};font-size:0.8em">⚡ Đang làm</span>`:`<button onclick="var r=typeof window.pqStartQuest==='function'?window.pqStartQuest('${type.id}','${q.id}'):'';if(r)alert(r);if(typeof window.pqRenderPanel==='function')window.pqRenderPanel('${panelId||'panel-player-v28'}')" style="background:${type.color}22;border:1px solid ${type.color};color:${type.color};padding:3px 8px;border-radius:5px;cursor:pointer;font-size:0.8em">Nhận Việc</button>`}
    </div>`;
  }).join("")}
  </div></div>`).join("")}
  </div>
  <!-- COMPLETED -->
  ${d.completedQuests.length?`<div style="margin-top:10px"><div style="color:#64748b;font-size:0.85em;font-weight:bold;margin-bottom:5px">✅ Đã Hoàn Thành (${d.completedQuests.length})</div><div style="max-height:120px;overflow-y:auto;font-size:0.8em">${d.completedQuests.slice(0,10).map(q=>`<div style="border-bottom:1px solid #1e293b;padding:3px 0;color:#94a3b8">${q.icon} ${q.name} · ${q.endYear}</div>`).join("")}</div></div>`:''}
  </div>`;
  const existing=el.innerHTML||"";
  el.innerHTML=existing+html;
};

function pqInit(){
  pqLoad();
  window.pqData.initialized=true;
  const _o=window.gameTick; window.gameTick=function(){if(_o)_o(); try{pqTick();}catch(e){}};
  console.log("[PlayerQuestSystemV28] 📜 Nhiệm Vụ V28 khởi động — 5 loại · 20 nhiệm vụ · Tự động tiến hành ✓");
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(pqInit,INIT_DELAY));
else setTimeout(pqInit,INIT_DELAY);
})();
