(function() {
"use strict";
// ============================================================
// PLAYER REPUTATION ENGINE V28 — Creator God V6
// Mở rộng npcReputationEngine.js — KHÔNG ghi đè NRE_REP_TIERS
// Danh Tiếng Người Chơi: Chiến Thắng · Thương Mại · Tôn Giáo · Hùng Ca
// ============================================================
const SAVE_KEY = "cgv6_player_rep_v28";
const INIT_DELAY = 5000;

const REP_SOURCES = [
  { id:"war_victory",  name:"Chiến Thắng Chiến Tranh", icon:"⚔️", rep:200,  fame:150, desc:"Hạ gục kẻ thù trên chiến trường" },
  { id:"trade_deal",   name:"Giao Dịch Thành Công",    icon:"💰", rep:50,   fame:30,  desc:"Ký kết giao dịch lớn" },
  { id:"religion",     name:"Ảnh Hưởng Tôn Giáo",     icon:"⛪", rep:100,  fame:80,  desc:"Ủng hộ hoặc thành lập tôn giáo" },
  { id:"heroic_deed",  name:"Chiến Công Anh Hùng",     icon:"🦸", rep:500,  fame:400, desc:"Hoàn thành sứ mệnh cứu thế" },
  { id:"territory",    name:"Mở Rộng Lãnh Thổ",        icon:"🗺️", rep:100,  fame:70,  desc:"Chiếm lĩnh và xây dựng lãnh thổ mới" },
  { id:"alliance",     name:"Thành Lập Liên Minh",     icon:"🤝", rep:150,  fame:100, desc:"Thiết lập liên minh chiến lược" },
  { id:"dungeon",      name:"Chinh Phục Dungeon",       icon:"🏰", rep:80,   fame:60,  desc:"Vượt qua dungeon nguy hiểm" },
  { id:"disaster_help",name:"Cứu Trợ Thiên Tai",       icon:"🌊", rep:200,  fame:180, desc:"Giúp đỡ nạn nhân thiên tai" },
];

const REP_TIERS = [
  { min:10000, name:"Thiên Hạ Vô Song",      icon:"🌌", color:"#fde68a", title:"Truyền Thuyết Sống"   },
  { min:5000,  name:"Anh Hùng Thiên Hạ",     icon:"👑", color:"#fbbf24", title:"Thiên Hạ Đệ Nhất"     },
  { min:2000,  name:"Danh Trấn Bốn Phương",  icon:"⭐", color:"#f0abfc", title:"Nhân Vật Lịch Sử"     },
  { min:800,   name:"Được Kính Trọng",        icon:"🌟", color:"#4ade80", title:"Đại Hiệp Sĩ"           },
  { min:300,   name:"Có Tiếng Tăm",           icon:"💼", color:"#60a5fa", title:"Nhân Vật Nổi Tiếng"   },
  { min:100,   name:"Biết Đến",               icon:"👤", color:"#94a3b8", title:"Người Thường"          },
  { min:0,     name:"Vô Danh",                icon:"❓", color:"#475569", title:"Kẻ Vô Danh"            },
];

function _rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}

window.playerRepData = {
  reputation: 0,
  fame: 0,
  fameBySource: {},  // { sourceId: total }
  titles: [],        // earned titles
  heroicDeeds: [],
  infamy: 0,
  log: [],
  tickCount: 0,
  initialized: false,
};

function prSave(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(window.playerRepData));}catch(e){}}
function prLoad(){try{const d=localStorage.getItem(SAVE_KEY);if(d) Object.assign(window.playerRepData,JSON.parse(d));}catch(e){}}
function prLog(msg,type){window.playerRepData.log.unshift({year:window.year||0,msg,type:type||"info"});if(window.playerRepData.log.length>150)window.playerRepData.log.pop();}

function prGetTier(rep){return REP_TIERS.find(t=>rep>=t.min)||REP_TIERS[REP_TIERS.length-1];}

// ─── PUBLIC API ───────────────────────────────────────────────
window.prAddReputation = function(sourceId, multiplier){
  multiplier=multiplier||1;
  const src=REP_SOURCES.find(s=>s.id===sourceId);
  if(!src) return;
  const repGain=Math.floor(src.rep*multiplier);
  const fameGain=Math.floor(src.fame*multiplier);
  window.playerRepData.reputation+=repGain;
  window.playerRepData.fame+=fameGain;
  if(!window.playerRepData.fameBySource[sourceId]) window.playerRepData.fameBySource[sourceId]=0;
  window.playerRepData.fameBySource[sourceId]+=fameGain;
  // Sync to playerV28
  if(typeof window.playerAddFame==="function") window.playerAddFame(fameGain);
  // Check new tier
  const tier=prGetTier(window.playerRepData.reputation);
  if(!window.playerRepData.titles.includes(tier.title)){
    window.playerRepData.titles.push(tier.title);
    prLog(`📜 Đạt danh hiệu mới: "${tier.title}"!`,"title");
    if(typeof window.htAddEvent==="function") window.htAddEvent({year:window.year||0,type:"reputation",title:`Danh Hiệu: ${tier.title}`,color:"#fbbf24"});
  }
  prLog(`${src.icon} ${src.name}: +${repGain} danh tiếng`,"gain");
};

window.prAddHeroicDeed = function(desc){
  const deed={year:window.year||0,desc,rep:window.playerRepData.reputation};
  window.playerRepData.heroicDeeds.unshift(deed);
  if(window.playerRepData.heroicDeeds.length>30) window.playerRepData.heroicDeeds.pop();
  window.prAddReputation("heroic_deed",1+Math.random());
  prLog(`🦸 Chiến Công Lịch Sử: ${desc}`,"heroic");
  if(typeof window.wmeAddMemory==="function") window.wmeAddMemory({year:window.year||0,category:"player",title:"Chiến Công Anh Hùng",content:desc});
};

// ─── AUTO REPUTATION FROM EVENTS ─────────────────────────────
function prTickAutoRep(){
  const d=window.playerRepData;
  // From wars
  if(typeof window.warsActive!=="undefined"&&window.warsActive&&window.warsActive.length>0&&Math.random()<0.05) window.prAddReputation("war_victory",0.3);
  // From territories
  if(typeof window.playerTerritoryData!=="undefined"&&window.playerTerritoryData.territories.length>0&&Math.random()<0.03) window.prAddReputation("territory",0.2);
  // From disasters (helping)
  if(typeof window.disasterData!=="undefined"&&window.disasterData.active&&window.disasterData.active.length>0&&Math.random()<0.04) window.prAddReputation("disaster_help",0.5);
}

function prTick(){
  window.playerRepData.tickCount++;
  if(!window.playerRepData.initialized) return;
  if(window.playerRepData.tickCount%20===0) prTickAutoRep();
  if(window.playerRepData.tickCount%30===0) prSave();
}

window.prRenderHistory=function(){
  const el=document.getElementById("panel-my-history"); if(!el) return;
  const d=window.playerRepData;
  const pData=window.playerV28Data||{};
  const tier=prGetTier(d.reputation);
  const culData=window.cultivationData||{};
  const culStage=culData.stageId?({luyen_khi:"Luyện Khí",thiet_lap:"Thiết Lập",kim_dan:"Kim Đan",nguyen_hon:"Nguyên Hồn",chuyen_hoa:"Chuyển Hóa",thang_thien:"Thăng Thiên"}[culData.stageId]||culData.stageId):"Chưa tu luyện";

  let html=`<div style="padding:16px;font-family:'Noto Serif SC',serif;color:#e2e8f0">
  <div style="font-size:1.3em;color:#c084fc;font-weight:bold;margin-bottom:14px">📜 Lịch Sử Của Tôi</div>
  <!-- REPUTATION CARD -->
  <div style="background:linear-gradient(135deg,${tier.color}22,#0f172a);border:2px solid ${tier.color};border-radius:12px;padding:14px;margin-bottom:14px">
    <div style="font-size:1.8em">${tier.icon}</div>
    <div style="font-size:1.1em;color:${tier.color};font-weight:bold;margin-top:4px">${tier.name}</div>
    <div style="color:#94a3b8;font-size:0.85em">Danh Hiệu: "${tier.title}"</div>
    <div style="display:flex;gap:12px;margin-top:8px;flex-wrap:wrap;font-size:0.85em">
      <span>⭐ Danh Tiếng: <b style="color:${tier.color}">${d.reputation.toLocaleString()}</b></span>
      <span>🌟 Tiếng Vang: <b style="color:#fbbf24">${d.fame.toLocaleString()}</b></span>
      <span>😈 Ác Danh: <b style="color:#f87171">${d.infamy}</b></span>
    </div>
  </div>
  <!-- REP TIERS -->
  <div style="margin-bottom:14px"><div style="color:#94a3b8;font-weight:bold;margin-bottom:6px">📊 Thang Danh Tiếng</div>
  <div style="display:flex;flex-direction:column;gap:4px">
    ${REP_TIERS.map(t=>`<div style="background:${d.reputation>=t.min?t.color+'11':'#0f172a'};border:1px solid ${d.reputation>=t.min?t.color:'#334155'};border-radius:6px;padding:6px 10px;display:flex;justify-content:space-between;font-size:0.82em">
      <span>${t.icon} <span style="color:${d.reputation>=t.min?t.color:'#475569'}">${t.name}</span></span>
      <span style="color:#64748b">≥${t.min.toLocaleString()} · "${t.title}"</span>
    </div>`).join("")}
  </div></div>
  <!-- REPUTATION SOURCES -->
  <div style="margin-bottom:14px"><div style="color:#fbbf24;font-weight:bold;margin-bottom:6px">💰 Nguồn Danh Tiếng</div>
  <div style="display:flex;flex-wrap:wrap;gap:6px">
    ${REP_SOURCES.map(s=>`<div style="background:#1e293b;padding:6px 10px;border-radius:8px;font-size:0.82em" title="${s.desc}">${s.icon} ${s.name}<br><span style="color:#4ade80">+${s.rep} rep</span> <span style="color:#fbbf24">+${s.fame} fame</span></div>`).join("")}
  </div></div>
  <!-- TITLES EARNED -->
  ${d.titles.length?`<div style="margin-bottom:14px"><div style="color:#c084fc;font-weight:bold;margin-bottom:6px">📜 Danh Hiệu Đã Đạt</div><div style="display:flex;flex-wrap:wrap;gap:6px">${d.titles.map(t=>`<div style="background:#1a0020;border:1px solid #7c3aed;padding:5px 10px;border-radius:8px;font-size:0.82em;color:#c084fc">📜 ${t}</div>`).join("")}</div></div>`:''}
  <!-- HEROIC DEEDS -->
  ${d.heroicDeeds.length?`<div style="margin-bottom:14px"><div style="color:#fbbf24;font-weight:bold;margin-bottom:6px">🦸 Chiến Công Anh Hùng</div><div style="max-height:120px;overflow-y:auto;font-size:0.82em">${d.heroicDeeds.slice(0,8).map(deed=>`<div style="border-bottom:1px solid #1e293b;padding:5px 0;color:#94a3b8"><span style="color:#fbbf24">[${deed.year}]</span> ${deed.desc}</div>`).join("")}</div></div>`:''}
  <!-- PLAYER TIMELINE -->
  <div style="margin-bottom:14px"><div style="color:#38bdf8;font-weight:bold;margin-bottom:6px">📅 Lịch Sử Nhân Vật</div>
  <div style="font-size:0.85em">
    ${pData.milestones&&pData.milestones.length?pData.milestones.map(m=>`<div style="border-bottom:1px solid #1e293b;padding:4px 0;display:flex;gap:8px;color:#94a3b8"><span style="color:#64748b">[${m.year}]</span> <span>${m.icon} ${m.event}</span></div>`).join(""):'<div style="color:#475569">Chưa có cột mốc.</div>'}
  </div></div>
  <!-- SOURCE BREAKDOWN -->
  ${Object.keys(d.fameBySource).length?`<div style="margin-bottom:14px"><div style="color:#64748b;font-weight:bold;margin-bottom:6px">📈 Chi Tiết Tiếng Vang</div><div style="display:flex;flex-wrap:wrap;gap:5px">${Object.entries(d.fameBySource).sort((a,b)=>b[1]-a[1]).map(([srcId,val])=>{const src=REP_SOURCES.find(s=>s.id===srcId)||{icon:"📋",name:srcId};return `<div style="background:#1e293b;padding:5px 10px;border-radius:8px;font-size:0.8em">${src.icon} ${src.name}<br><b style="color:#fbbf24">${val}</b></div>`;}).join("")}</div></div>`:''}
  <!-- LOG -->
  <div><div style="color:#64748b;font-weight:bold;margin-bottom:6px;font-size:0.9em">📋 Nhật Ký Danh Tiếng</div><div style="max-height:150px;overflow-y:auto;background:#0f172a;border-radius:8px;padding:8px;font-size:0.8em">${d.log.slice(0,18).map(e=>`<div style="border-bottom:1px solid #1e293b;padding:3px 0;color:${e.type==='title'?'#fbbf24':e.type==='heroic'?'#c084fc':'#94a3b8'}">[${e.year}] ${e.msg}</div>`).join("")||'<div style="color:#475569">Chưa có sự kiện.</div>'}</div></div>
  </div>`;
  el.innerHTML=html;
};

function prInit(){
  prLoad();
  window.playerRepData.initialized=true;
  const _o=window.gameTick; window.gameTick=function(){if(_o)_o(); try{prTick();}catch(e){}};
  console.log("[PlayerReputationV28] 🌟 Danh Tiếng V28 khởi động — 8 nguồn · 7 bậc · Chiến Công Anh Hùng ✓");
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(prInit,INIT_DELAY));
else setTimeout(prInit,INIT_DELAY);
})();
