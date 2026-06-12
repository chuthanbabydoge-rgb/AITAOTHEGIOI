(function() {
"use strict";
// ============================================================
// PLAYER TERRITORY SYSTEM V28 — Creator God V6
// Mở rộng progressionSystem.js — KHÔNG ghi đè progressionState
// Sở Hữu: Làng → Thị Trấn → Thành Phố → Lãnh Thổ → VQ → ĐC
// ============================================================
const SAVE_KEY = "cgv6_territory_v28";
const INIT_DELAY = 4600;

const TERRITORY_TIERS = [
  { id:"village",   level:1, name:"Làng",       icon:"🏡", baseIncome:10, pop:500,    reqRank:1, upgradeReq:3,  upgradeCost:200  },
  { id:"town",      level:2, name:"Thị Trấn",   icon:"🏘️", baseIncome:30, pop:2000,   reqRank:2, upgradeReq:2,  upgradeCost:800  },
  { id:"city",      level:3, name:"Thành Phố",  icon:"🏙️", baseIncome:80, pop:10000,  reqRank:3, upgradeReq:2,  upgradeCost:3000 },
  { id:"territory", level:4, name:"Lãnh Thổ",   icon:"🗺️", baseIncome:200,pop:50000,  reqRank:4, upgradeReq:2,  upgradeCost:10000},
  { id:"kingdom",   level:5, name:"Vương Quốc", icon:"♟️", baseIncome:600,pop:200000, reqRank:5, upgradeReq:1,  upgradeCost:50000},
  { id:"empire",    level:6, name:"Đế Chế",     icon:"👑", baseIncome:2000,pop:1000000,reqRank:6,upgradeReq:0,  upgradeCost:0    },
];

const TERRITORY_EVENTS = [
  "Mùa màng bội thu — thu nhập +20%",
  "Nổi loạn nhỏ — ổn định -10%",
  "Thương nhân ghé thăm — vàng +100",
  "Dịch bệnh bùng phát — dân số -5%",
  "Công trình hoàn thành — thu nhập +15%",
  "Ngoại xâm — quân sự cần thiết",
  "Lễ hội lớn — danh tiếng +50",
];

function _rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function _pick(a){return a[Math.floor(Math.random()*a.length)];}

window.playerTerritoryData = {
  territories: [],    // list of owned territories
  totalIncome: 0,
  totalPop: 0,
  highestTier: "village",
  playerKingdom: null,
  playerEmpire: null,
  wars: [],           // player war records
  log: [],
  tickCount: 0,
  initialized: false,
};

function ptSave(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(window.playerTerritoryData));}catch(e){}}
function ptLoad(){try{const d=localStorage.getItem(SAVE_KEY);if(d) Object.assign(window.playerTerritoryData,JSON.parse(d));}catch(e){}}
function ptLog(msg,type){window.playerTerritoryData.log.unshift({year:window.year||0,msg,type:type||"info"});if(window.playerTerritoryData.log.length>150)window.playerTerritoryData.log.pop();if(typeof window.htAddEvent==="function")window.htAddEvent({year:window.year||0,type:"territory",title:msg,color:"#4ade80"});}

// ─── CREATE TERRITORY ─────────────────────────────────────────
window.ptAcquireTerritory = function(tierId, customName){
  const tier=TERRITORY_TIERS.find(t=>t.id===tierId)||TERRITORY_TIERS[0];
  const pRank=(window.playerV28Data&&window.playerV28Data.rankLevel)||1;
  if(pRank<tier.reqRank){ return `Cần đạt cấp bậc ${tier.reqRank} để sở hữu ${tier.name}.`; }
  const regionNames=["Đông Vực","Tây Nguyên","Nam Hải","Bắc Cực","Trung Châu","Linh Sơn Cốc","Hỏa Diệm Sơn","Bạch Tuyết Nguyên"];
  const t={
    id:"ter_"+Date.now(),tierId,tier:tier.id,name:customName||(tier.name+" "+_pick(regionNames)),
    icon:tier.icon,income:tier.baseIncome+_rand(-5,15),pop:tier.pop+_rand(-100,500),
    stability:80,military:_rand(5,30),age:0,upgrades:0,status:"active",foundYear:window.year||0,
  };
  window.playerTerritoryData.territories.push(t);
  ptCalcTotals();
  ptLog(`${tier.icon} Chiếm lĩnh ${tier.name}: ${t.name}`,"acquire");
  if(typeof window.playerAddXP==="function") window.playerAddXP(tier.level*50,"territory");
  if(typeof window.playerAddFame==="function") window.playerAddFame(tier.level*100);
  // Special events
  if(tierId==="kingdom"){window.playerTerritoryData.playerKingdom=t.name; ptLog(`♟️ ${window.playerV28Data?.name||'Người Chơi'} thành lập Vương Quốc: ${t.name}!`,"kingdom"); if(typeof window.wmeAddMemory==="function")window.wmeAddMemory({year:window.year||0,category:"player",title:"Thành Lập Vương Quốc",content:`${t.name} được thành lập.`});}
  if(tierId==="empire"){window.playerTerritoryData.playerEmpire=t.name; ptLog(`👑 ${window.playerV28Data?.name||'Người Chơi'} thành lập Đế Chế: ${t.name}!`,"empire"); if(typeof window.wmeAddMemory==="function")window.wmeAddMemory({year:window.year||0,category:"player",title:"Thành Lập Đế Chế",content:`${t.name} — đế chế hùng mạnh ra đời!`});}
  return "Thành công!";
};

window.ptUpgradeTerritory = function(territoryId){
  const t=window.playerTerritoryData.territories.find(x=>x.id===territoryId);
  if(!t) return "Không tìm thấy lãnh thổ.";
  const curTier=TERRITORY_TIERS.find(x=>x.id===t.tierId);
  const nextTier=TERRITORY_TIERS.find(x=>x.level===curTier.level+1);
  if(!nextTier) return "Đã đạt cấp tối đa.";
  const pWealth=(window.playerV28Data&&window.playerV28Data.wealth)||0;
  if(pWealth<nextTier.upgradeCost) return `Cần ${nextTier.upgradeCost} vàng để nâng cấp.`;
  if(typeof window.playerAddWealth==="function") window.playerAddWealth(-nextTier.upgradeCost);
  t.tierId=nextTier.id; t.tier=nextTier.id; t.income=nextTier.baseIncome+_rand(-5,20);
  t.pop=nextTier.pop; t.stability=75; t.upgrades++;
  t.name=nextTier.name+" "+t.name.split(" ").slice(-1)[0];
  ptCalcTotals();
  ptLog(`⬆️ Nâng cấp ${t.name} → ${nextTier.name}!`,"upgrade");
  if(typeof window.playerAddXP==="function") window.playerAddXP(100,"upgrade");
  return "Nâng cấp thành công!";
};

function ptCalcTotals(){
  const d=window.playerTerritoryData;
  d.totalIncome=d.territories.filter(t=>t.status==="active").reduce((s,t)=>s+t.income,0);
  d.totalPop=d.territories.filter(t=>t.status==="active").reduce((s,t)=>s+t.pop,0);
  const highest=d.territories.reduce((best,t)=>{const tier=TERRITORY_TIERS.find(x=>x.id===t.tierId);return (tier&&(!best||tier.level>(TERRITORY_TIERS.find(x=>x.id===best)?.level||0)))?t.tierId:best;},null);
  if(highest) d.highestTier=highest;
}

function ptTickTerritories(){
  const d=window.playerTerritoryData;
  d.territories.filter(t=>t.status==="active").forEach(t=>{
    t.age++;
    t.income=Math.max(1,t.income+_rand(-3,5));
    t.pop=Math.max(100,Math.floor(t.pop*(1+_rand(-1,3)/100)));
    t.stability=Math.max(0,Math.min(100,t.stability+_rand(-2,1)));
    if(Math.random()<0.02){ ptLog(`⚡ ${_pick(TERRITORY_EVENTS)} (${t.name})`,"event"); }
  });
  ptCalcTotals();
  // Distribute income
  if(d.totalIncome>0&&typeof window.invAddGold==="function") window.invAddGold(d.totalIncome);
}

function ptTick(){
  window.playerTerritoryData.tickCount++;
  if(!window.playerTerritoryData.initialized) return;
  // Auto give first village
  if(window.playerTerritoryData.territories.length===0&&typeof window.playerV28Data!=="undefined"&&window.playerV28Data.id){
    window.ptAcquireTerritory("village","Làng Khởi Đầu");
  }
  if(window.playerTerritoryData.tickCount%5===0) ptTickTerritories();
  if(window.playerTerritoryData.tickCount%30===0) ptSave();
}

window.ptRenderMyKingdom=function(){
  const el=document.getElementById("panel-my-kingdom"); if(!el) return;
  const d=window.playerTerritoryData;
  const kingdoms=d.territories.filter(t=>t.tierId==="kingdom"||t.tierId==="empire");
  const lower=d.territories.filter(t=>t.tierId!=="kingdom"&&t.tierId!=="empire");

  let html=`<div style="padding:16px;font-family:'Noto Serif SC',serif;color:#e2e8f0">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px">
    <div style="font-size:1.3em;color:#4ade80;font-weight:bold">🏰 Lãnh Thổ Của Tôi</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.82em">🗺️ ${d.territories.length} lãnh thổ</span>
      <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.82em">💰 ${d.totalIncome}/tick</span>
      <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.82em">👥 ${d.totalPop.toLocaleString()}</span>
    </div>
  </div>
  <!-- ACQUIRE BUTTONS -->
  <div style="margin-bottom:14px"><div style="color:#38bdf8;font-weight:bold;margin-bottom:8px">⬆️ Mở Rộng Lãnh Thổ</div>
  <div style="display:flex;flex-wrap:wrap;gap:6px">
    ${TERRITORY_TIERS.map(t=>`<button onclick="alert(typeof window.ptAcquireTerritory==='function'?window.ptAcquireTerritory('${t.id}'):'')" style="background:#1e293b;border:1px solid #334155;color:#e2e8f0;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:0.82em">${t.icon} ${t.name}<br><span style="color:#64748b">Cần cấp ${t.reqRank} · ${t.upgradeCost||0}💰</span></button>`).join("")}
  </div></div>
  <!-- TERRITORY LIST -->
  ${d.territories.length?`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px;margin-bottom:14px">
  ${d.territories.map(t=>{
    const tier=TERRITORY_TIERS.find(x=>x.id===t.tierId)||TERRITORY_TIERS[0];
    return `<div style="background:#0a1a0a;border:1px solid ${t.stability<30?'#ef4444':'#166534'};border-radius:8px;padding:10px">
      <div style="display:flex;justify-content:space-between"><span style="color:#86efac;font-weight:bold">${t.icon} ${t.name}</span><span style="color:#64748b;font-size:0.78em">${t.foundYear}年</span></div>
      <div style="font-size:0.8em;color:#94a3b8;margin:4px 0">${tier.name} · 👥${t.pop.toLocaleString()}</div>
      <div style="display:flex;gap:8px;font-size:0.8em">💰${t.income}/tick · ⚔️${t.military} · 🛡️${t.stability}%</div>
      <div style="background:#1e293b;height:5px;border-radius:3px;margin-top:6px"><div style="background:${t.stability>60?'#4ade80':t.stability>30?'#fbbf24':'#ef4444'};height:5px;border-radius:3px;width:${t.stability}%"></div></div>
      <button onclick="alert(typeof window.ptUpgradeTerritory==='function'?window.ptUpgradeTerritory('${t.id}'):'')" style="margin-top:6px;background:#334155;border:none;color:#e2e8f0;padding:3px 8px;border-radius:5px;cursor:pointer;font-size:0.78em">⬆️ Nâng Cấp</button>
    </div>`;
  }).join("")}</div>`:`<div style="text-align:center;color:#475569;padding:24px">Chưa có lãnh thổ. Hệ thống sẽ tự tạo làng đầu tiên khi có nhân vật.</div>`}
  <!-- LOG -->
  <div><div style="color:#64748b;font-weight:bold;margin-bottom:6px;font-size:0.9em">📋 Nhật Ký</div><div style="max-height:150px;overflow-y:auto;background:#0f172a;border-radius:8px;padding:8px;font-size:0.8em">${d.log.slice(0,15).map(e=>`<div style="border-bottom:1px solid #1e293b;padding:3px 0;color:${e.type==='kingdom'?'#fbbf24':e.type==='empire'?'#f59e0b':'#94a3b8'}">[${e.year}] ${e.msg}</div>`).join("")||'<div style="color:#475569">Chưa có sự kiện.</div>'}</div></div>
  </div>`;
  el.innerHTML=html;
};

window.ptRenderMyEmpire=function(){
  const el=document.getElementById("panel-my-empire"); if(!el) return;
  const d=window.playerTerritoryData;
  const hasEmpire=d.playerEmpire||d.territories.some(t=>t.tierId==="empire");
  let html=`<div style="padding:16px;font-family:'Noto Serif SC',serif;color:#e2e8f0">
  <div style="font-size:1.3em;color:#f59e0b;font-weight:bold;margin-bottom:14px">👑 Đế Chế Của Tôi</div>
  ${hasEmpire?`<div style="background:linear-gradient(135deg,#1a0a00,#2d1f00);border:2px solid #f59e0b;border-radius:12px;padding:16px;margin-bottom:14px">
    <div style="font-size:2em">👑</div>
    <div style="font-size:1.3em;color:#fbbf24;font-weight:bold;margin-top:6px">${d.playerEmpire||"Đế Chế Vô Danh"}</div>
    <div style="color:#94a3b8;margin-top:4px">Đế chế hùng mạnh, thống trị thiên hạ!</div>
    <div style="display:flex;gap:12px;margin-top:10px;flex-wrap:wrap">
      <span>🗺️ ${d.territories.length} lãnh thổ</span>
      <span>👥 ${d.totalPop.toLocaleString()} dân</span>
      <span>💰 ${d.totalIncome}/tick</span>
    </div>
  </div>`:`<div style="background:#0f172a;border:2px dashed #334155;border-radius:12px;padding:24px;text-align:center;margin-bottom:14px">
    <div style="font-size:2em;margin-bottom:8px">👑</div>
    <div style="color:#64748b">Chưa có Đế Chế.</div>
    <div style="color:#475569;font-size:0.85em;margin-top:8px">Cần đạt cấp Hoàng Đế và sở hữu lãnh thổ "Đế Chế" để khai quốc.</div>
    <button onclick="alert(typeof window.ptAcquireTerritory==='function'?window.ptAcquireTerritory('empire','Đại Thiên Đế Quốc'):'')" style="margin-top:12px;background:#f59e0b;color:#000;border:none;padding:8px 20px;border-radius:8px;cursor:pointer;font-weight:bold">👑 Khai Lập Đế Chế</button>
  </div>`}
  <!-- EMPIRE STATS -->
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px">
    ${[
      {icon:"🗺️",name:"Tổng Lãnh Thổ",val:d.territories.length},
      {icon:"💰",name:"Thu Nhập/Tick",val:d.totalIncome},
      {icon:"👥",name:"Tổng Dân Số",val:d.totalPop.toLocaleString()},
      {icon:"♟️",name:"Vương Quốc",val:d.territories.filter(t=>t.tierId==="kingdom").length},
      {icon:"🏙️",name:"Thành Phố",val:d.territories.filter(t=>t.tierId==="city").length},
      {icon:"🏡",name:"Làng & Thị Trấn",val:d.territories.filter(t=>t.tierId==="village"||t.tierId==="town").length},
    ].map(s=>`<div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:10px;text-align:center"><div style="font-size:1.2em">${s.icon}</div><div style="color:#64748b;font-size:0.75em">${s.name}</div><div style="color:#fbbf24;font-weight:bold">${s.val}</div></div>`).join("")}
  </div>
  </div>`;
  el.innerHTML=html;
};

window.ptRenderPlayerWar=function(){
  const el=document.getElementById("panel-player-war"); if(!el) return;
  const d=window.playerTerritoryData;
  let html=`<div style="padding:16px;font-family:'Noto Serif SC',serif;color:#e2e8f0">
  <div style="font-size:1.3em;color:#f87171;font-weight:bold;margin-bottom:14px">⚔️ Chiến Tranh Người Chơi</div>
  <div style="background:#0f172a;border:1px solid #334155;border-radius:10px;padding:12px;margin-bottom:12px">
    <div style="color:#94a3b8;font-size:0.9em">Hệ thống chiến tranh người chơi sẽ hiển thị sau khi bạn sở hữu lãnh thổ và có thể tuyên chiến với các thế lực.</div>
  </div>
  <!-- WAR CAPABILITIES -->
  <div style="margin-bottom:12px"><div style="color:#f87171;font-weight:bold;margin-bottom:8px">⚔️ Năng Lực Chiến Tranh</div>
  <div style="display:flex;flex-wrap:wrap;gap:6px">
    ${["Tuyên chiến với Vương quốc","Ký hòa bình","Chiến lược phòng thủ","Đột kích bất ngờ","Bao vây thành","Chiến tranh tổng lực"].map(a=>`<div style="background:#1a0a0a;border:1px solid #7f1d1d;padding:6px 10px;border-radius:8px;font-size:0.82em">⚔️ ${a}</div>`).join("")}
  </div></div>
  <!-- ACTIVE WARS (from warsActive) -->
  ${typeof window.warsActive!=="undefined"&&window.warsActive&&window.warsActive.length?`<div><div style="color:#f87171;font-weight:bold;margin-bottom:6px">🔥 Chiến Tranh Đang Diễn Ra</div>${window.warsActive.slice(0,5).map(w=>`<div style="background:#1a0a0a;border:1px solid #7f1d1d;border-radius:8px;padding:10px;margin-bottom:6px;font-size:0.85em"><div style="color:#fca5a5">${w.attacker||'?'} vs ${w.defender||'?'}</div><div style="color:#64748b;margin-top:3px">Năm: ${w.startYear||0}</div></div>`).join("")}</div>`:'<div style="color:#475569;font-size:0.85em">Hiện tại không có chiến tranh đang diễn ra.</div>'}
  </div>`;
  el.innerHTML=html;
};

function ptInit(){
  ptLoad();
  window.playerTerritoryData.initialized=true;
  const _o=window.gameTick; window.gameTick=function(){if(_o)_o(); try{ptTick();}catch(e){}};
  console.log("[PlayerTerritoryV28] 🏰 Lãnh Thổ V28 khởi động — 6 cấp bậc · Nâng cấp · Đế chế ✓");
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(ptInit,INIT_DELAY));
else setTimeout(ptInit,INIT_DELAY);
})();
