(function() {
"use strict";
// ============================================================
// COLONY ENGINE V27 — Creator God V6
// Thuộc Địa: Thành Lập · Khai Thác · Nổi Loạn · Độc Lập · Đế Chế Hải Ngoại
// ============================================================
const SAVE_KEY = "cgv6_colony_v27";
const INIT_DELAY = 4800;

const COLONY_TYPES = [
  { id:"trade_post",   name:"Thương Điếm",       icon:"🏪", income:30,  pop:500,   stability:80, militaryNeeded:5  },
  { id:"settlement",   name:"Khu Định Cư",        icon:"🏘️", income:20,  pop:2000,  stability:70, militaryNeeded:10 },
  { id:"plantation",   name:"Đồn Điền",           icon:"🌿", income:60,  pop:3000,  stability:60, militaryNeeded:15 },
  { id:"fortress",     name:"Pháo Đài Hải Ngoại", icon:"🏰", income:10,  pop:1000,  stability:90, militaryNeeded:30 },
  { id:"mining",       name:"Khu Khai Mỏ",        icon:"⛏️", income:80,  pop:1500,  stability:55, militaryNeeded:20 },
  { id:"naval_base",   name:"Căn Cứ Hải Quân",   icon:"⚓", income:5,   pop:800,   stability:85, militaryNeeded:50 },
];
const COLONY_RESOURCES = ["Vàng","Gia Vị","Lụa","Gỗ Quý","Đá Quý","Ngà Voi","Cao Su","Khoáng Sản","Dầu","Thảo Dược"];
const REVOLT_CAUSES = ["Thuế Nặng","Đối Xử Tàn Nhẫn","Cúm Dịch","Nạn Đói","Lãnh Đạo Tồi","Tôn Giáo","Dân Tộc","Phân Biệt Đối Xử"];

function _rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function _pick(a){return a[Math.floor(Math.random()*a.length)];}

window.colonyData = {
  colonies: [],   // all colonies
  empires: {},    // { factionId: { colonies[], totalIncome, prestige } }
  revolts: [],    // active revolts
  independence: [],// freed colonies
  log: [],
  tickCount: 0,
  totalColonies: 0,
  initialized: false,
};

function coSave(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(window.colonyData));}catch(e){}}
function coLoad(){try{const d=localStorage.getItem(SAVE_KEY);if(d)Object.assign(window.colonyData,JSON.parse(d));}catch(e){}}
function coLog(msg,type){window.colonyData.log.unshift({year:window.year||0,msg,type:type||"info"});if(window.colonyData.log.length>200)window.colonyData.log.pop();if(typeof window.htAddEvent==="function")window.htAddEvent({year:window.year||0,type:"colony",title:msg,color:"#4ade80"});}

// ─── GET FACTIONS ─────────────────────────────────────────────
function coGetFactions(){
  const f=[];
  if(typeof window.empireData!=="undefined"&&window.empireData.empires) Object.values(window.empireData.empires).forEach(e=>f.push({id:e.id||e.name,name:e.name,type:"empire"}));
  if(typeof window.kingdomData!=="undefined"&&window.kingdomData.kingdoms) Object.values(window.kingdomData.kingdoms).slice(0,4).forEach(k=>f.push({id:k.id||k.name,name:k.name,type:"kingdom"}));
  if(!f.length&&typeof window.countries!=="undefined") window.countries.slice(0,6).forEach(c=>f.push({id:c.name,name:c.name,type:"country"}));
  return f;
}

// ─── FOUND COLONY ─────────────────────────────────────────────
function coFoundColony(factionId,factionName){
  const type=_pick(COLONY_TYPES);
  const resources=[_pick(COLONY_RESOURCES),_pick(COLONY_RESOURCES)].filter((v,i,a)=>a.indexOf(v)===i);
  const regionNames=["Tân Thế Giới","Cực Nam Châu","Đông Đảo Quần","Quần Đảo Bí Ẩn","Bờ Vàng","Vùng Nhiệt Đới","Lục Địa Ngầm","Đảo Huyền Thoại"];
  const colony={
    id:"col_"+Date.now()+_rand(0,999),
    name:`${type.name} ${_pick(regionNames).split(" ")[0]} (${factionName.split(" ")[0]})`,
    type:type.id,typeInfo:type,owner:factionId,ownerName:factionName,
    region:_pick(regionNames),icon:type.icon,
    pop:type.pop+_rand(-200,500),income:type.income+_rand(-10,20),
    stability:type.stability,military:type.militaryNeeded,
    resources,age:0,revolts:0,status:"active",foundYear:window.year||0,
  };
  window.colonyData.colonies.push(colony);
  window.colonyData.totalColonies++;
  if(!window.colonyData.empires[factionId]) window.colonyData.empires[factionId]={colonies:[],totalIncome:0,prestige:0};
  window.colonyData.empires[factionId].colonies.push(colony.id);
  coLog(`${type.icon} ${factionName} thành lập thuộc địa: ${colony.name} tại ${colony.region}`,"found");
  return colony;
}

// ─── COLONY TICK ──────────────────────────────────────────────
function coTickColonies(){
  window.colonyData.colonies.filter(c=>c.status==="active").forEach(c=>{
    c.age++;
    c.pop=Math.floor(c.pop*(1+_rand(-2,5)/100));
    c.income=Math.max(5,c.income+_rand(-5,8));
    // Stability drifts
    if(c.age%5===0) c.stability=Math.max(0,Math.min(100,c.stability+_rand(-5,3)));
    // Update empire income
    if(window.colonyData.empires[c.owner]) window.colonyData.empires[c.owner].totalIncome=(window.colonyData.colonies.filter(x=>x.owner===c.owner&&x.status==="active").reduce((s,x)=>s+x.income,0));
    // Revolt check
    if(c.stability<30&&Math.random()<0.1){
      const revolt={id:"rv_"+Date.now(),colonyId:c.id,colonyName:c.name,owner:c.ownerName,cause:_pick(REVOLT_CAUSES),strength:_rand(20,80),progress:0,status:"active",year:window.year||0};
      window.colonyData.revolts.push(revolt);
      c.revolts++;
      coLog(`🔥 NỔI LOẠN tại ${c.name}! Nguyên nhân: ${revolt.cause}`,"revolt");
    }
  });
}

function coTickRevolts(){
  window.colonyData.revolts.filter(r=>r.status==="active").forEach(r=>{
    const col=window.colonyData.colonies.find(c=>c.id===r.colonyId);
    if(!col){r.status="ended";return;}
    r.progress+=_rand(5,15);
    if(r.progress>=100){
      r.status="ended";
      if(r.strength>50){
        col.status="independent"; col.stability=60;
        window.colonyData.independence.push({name:col.name,formerOwner:col.ownerName,year:window.year||0,region:col.region});
        if(window.colonyData.empires[col.owner]){
          const idx=window.colonyData.empires[col.owner].colonies.indexOf(col.id);
          if(idx>=0) window.colonyData.empires[col.owner].colonies.splice(idx,1);
          window.colonyData.empires[col.owner].prestige=Math.max(0,(window.colonyData.empires[col.owner].prestige||50)-15);
        }
        coLog(`🗽 ${col.name} TUYÊN BỐ ĐỘC LẬP khỏi ${col.ownerName}!`,"independence");
      } else {
        col.stability=Math.min(100,col.stability+20);
        coLog(`🛡️ Nổi loạn tại ${col.name} bị dập tắt.`,"suppressed");
      }
    }
  });
  window.colonyData.revolts=window.colonyData.revolts.filter(r=>r.status==="active");
}

// ─── AUTO-COLONIZE ────────────────────────────────────────────
function coTryColonize(){
  if(Math.random()>0.03) return;
  const factions=coGetFactions();
  if(!factions.length) return;
  const f=_pick(factions);
  const existing=window.colonyData.colonies.filter(c=>c.owner===f.id&&c.status==="active").length;
  if(existing>=6) return;
  coFoundColony(f.id||f.name,f.name);
}

function coTick(){
  window.colonyData.tickCount++;
  if(!window.colonyData.initialized) return;
  if(window.colonyData.tickCount%20===0) coTryColonize();
  if(window.colonyData.tickCount%5===0) coTickColonies();
  coTickRevolts();
  if(window.colonyData.tickCount%30===0) coSave();
}

window.coRenderPanel=function(){
  const el=document.getElementById("panel-colonies"); if(!el) return;
  const d=window.colonyData;
  const active=d.colonies.filter(c=>c.status==="active");
  const empireRank=Object.entries(d.empires).map(([id,e])=>({id,count:e.colonies.length,income:e.totalIncome,prestige:e.prestige||0})).sort((a,b)=>b.count-a.count);
  let html=`<div style="padding:16px;font-family:'Noto Serif SC',serif;color:#e2e8f0">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px">
    <div style="font-size:1.3em;color:#4ade80;font-weight:bold">🏝 Thuộc Địa V27</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.82em">🏝 ${active.length} thuộc địa</span>
      <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.82em">🔥 ${d.revolts.length} nổi loạn</span>
      <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.82em">🗽 ${d.independence.length} độc lập</span>
    </div>
  </div>
  <!-- COLONY TYPES -->
  <div style="margin-bottom:14px"><div style="color:#38bdf8;font-weight:bold;margin-bottom:8px">🏝 Loại Thuộc Địa</div><div style="display:flex;flex-wrap:wrap;gap:6px">${COLONY_TYPES.map(t=>`<div style="background:#1e293b;padding:6px 10px;border-radius:8px;font-size:0.8em">${t.icon} <b>${t.name}</b><br><span style="color:#4ade80">💰${t.income}/tick</span> <span style="color:#38bdf8">👥${t.pop.toLocaleString()}</span></div>`).join("")}</div></div>
  <!-- COLONIAL EMPIRE RANKINGS -->
  ${empireRank.length?`<div style="margin-bottom:14px"><div style="color:#fbbf24;font-weight:bold;margin-bottom:8px">🌍 Đế Chế Hải Ngoại</div><table style="width:100%;border-collapse:collapse;font-size:0.82em"><tr style="color:#94a3b8;border-bottom:1px solid #334155"><th style="text-align:left;padding:4px 8px">#</th><th style="text-align:left;padding:4px 8px">Thế Lực</th><th style="text-align:right;padding:4px 8px">Thuộc Địa</th><th style="text-align:right;padding:4px 8px">Thu Nhập</th><th style="text-align:right;padding:4px 8px">Uy Danh</th></tr>${empireRank.slice(0,8).map(({id,count,income,prestige},i)=>`<tr style="border-bottom:1px solid #1e293b"><td style="padding:4px 8px;color:${i===0?'#fbbf24':'#64748b'}">${i===0?'👑':i+1}</td><td style="padding:4px 8px">${id}</td><td style="padding:4px 8px;text-align:right;color:#4ade80">${count}</td><td style="padding:4px 8px;text-align:right;color:#fbbf24">${income}</td><td style="padding:4px 8px;text-align:right;color:#c084fc">${prestige}</td></tr>`).join("")}</table></div>`:''}
  <!-- COLONIES LIST -->
  <div style="margin-bottom:14px"><div style="color:#4ade80;font-weight:bold;margin-bottom:8px">🏝 Danh Sách Thuộc Địa</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px">${active.slice(0,12).map(c=>`<div style="background:#0a1a0a;border:1px solid ${c.stability<30?'#ef4444':'#166534'};border-radius:8px;padding:10px">
    <div style="display:flex;justify-content:space-between"><span style="color:#86efac;font-weight:bold;font-size:0.9em">${c.icon} ${c.name}</span><span style="font-size:0.8em;color:#64748b">${c.region}</span></div>
    <div style="font-size:0.8em;color:#94a3b8;margin:4px 0">👑 ${c.ownerName} · 📅 năm ${c.foundYear}</div>
    <div style="display:flex;gap:8px;font-size:0.8em;margin:4px 0"><span>👥${c.pop.toLocaleString()}</span><span>💰${c.income}/tick</span><span>⚔️${c.military}</span></div>
    <div style="font-size:0.78em;color:#c084fc;margin:2px 0">🌿 ${c.resources.join(", ")}</div>
    <div style="margin-top:4px"><div style="display:flex;justify-content:space-between;font-size:0.75em;color:#64748b;margin-bottom:2px"><span>Ổn định ${c.stability}%</span>${c.revolts?`<span style="color:#f87171">⚠️ ${c.revolts} lần nổi loạn</span>`:''}</div><div style="background:#1e293b;height:5px;border-radius:3px"><div style="background:${c.stability>60?'#4ade80':c.stability>30?'#facc15':'#ef4444'};height:5px;border-radius:3px;width:${c.stability}%"></div></div></div>
  </div>`).join("")}</div></div>
  <!-- REVOLTS -->
  ${d.revolts.length?`<div style="margin-bottom:14px"><div style="color:#f87171;font-weight:bold;margin-bottom:8px">🔥 Nổi Loạn Đang Diễn Ra</div>${d.revolts.map(r=>`<div style="background:#1a0a0a;border:1px solid #7f1d1d;border-radius:8px;padding:10px;margin-bottom:6px;font-size:0.85em"><div style="color:#fca5a5;font-weight:bold">${r.colonyName} (${r.owner})</div><div style="color:#94a3b8">Nguyên nhân: ${r.cause} · Sức mạnh: ${r.strength}</div><div style="background:#1e293b;height:5px;border-radius:3px;margin-top:6px"><div style="background:#ef4444;height:5px;border-radius:3px;width:${r.progress}%"></div></div></div>`).join("")}</div>`:''}
  <!-- INDEPENDENCE -->
  ${d.independence.length?`<div style="margin-bottom:14px"><div style="color:#fbbf24;font-weight:bold;margin-bottom:6px">🗽 Đã Độc Lập (${d.independence.length})</div><div style="display:flex;flex-wrap:wrap;gap:6px">${d.independence.slice(0,6).map(i=>`<div style="background:#1e293b;padding:6px 10px;border-radius:8px;font-size:0.8em"><span style="color:#fbbf24">${i.name}</span><br><span style="color:#64748b">Cựu chủ: ${i.formerOwner} · ${i.year}</span></div>`).join("")}</div></div>`:''}
  <!-- LOG -->
  <div><div style="color:#64748b;font-weight:bold;margin-bottom:6px;font-size:0.9em">📋 Nhật Ký</div><div style="max-height:160px;overflow-y:auto;background:#0f172a;border-radius:8px;padding:8px;font-size:0.8em">${d.log.slice(0,20).map(e=>`<div style="border-bottom:1px solid #1e293b;padding:3px 0;color:${e.type==='independence'?'#fbbf24':e.type==='revolt'?'#f87171':'#94a3b8'}">[${e.year}] ${e.msg}</div>`).join("")||'<div style="color:#475569">Chưa có sự kiện.</div>'}</div></div>
  </div>`;
  el.innerHTML=html;
};

function coInit(){
  coLoad();
  window.colonyData.initialized=true;
  const _o=window.gameTick; window.gameTick=function(){if(_o)_o(); try{coTick();}catch(e){}};
  console.log("[ColonyEngineV27] 🏝 Thuộc Địa V27 khởi động — Thành Lập · Khai Thác · Nổi Loạn · Độc Lập ✓");
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(coInit,INIT_DELAY));
else setTimeout(coInit,INIT_DELAY);
})();
