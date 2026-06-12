(function() {
"use strict";
// ============================================================
// OCEAN TRADE ENGINE V27 — Creator God V6
// Thương Mại Đường Biển: Tuyến Đường · Hàng Hoá · Thương Chiến · Độc Quyền
// ============================================================
const SAVE_KEY = "cgv6_oceantrade_v27";
const INIT_DELAY = 5000;

const TRADE_ROUTES = [
  { id:"spice_route",   name:"Con Đường Gia Vị",     icon:"🌶️",  from:"Đông Đảo",  to:"Tây Phương",  goods:"Gia Vị",   value:200, risk:0.15, distance:8 },
  { id:"silk_route",    name:"Hải Lộ Tơ Lụa",        icon:"🪡",  from:"Trung Nguyên",to:"Tây Vực",   goods:"Lụa",      value:180, risk:0.10, distance:7 },
  { id:"gold_route",    name:"Đường Vàng Ròng",       icon:"🥇",  from:"Nam Châu",  to:"Bắc Phương",  goods:"Vàng",     value:300, risk:0.20, distance:10 },
  { id:"ivory_route",   name:"Con Đường Ngà Voi",     icon:"🐘",  from:"Châu Phi",  to:"Châu Á",      goods:"Ngà Voi",  value:150, risk:0.12, distance:9 },
  { id:"tea_route",     name:"Hải Lộ Trà",            icon:"🍵",  from:"Viễn Đông", to:"Châu Âu",     goods:"Trà",      value:120, risk:0.08, distance:6 },
  { id:"slave_route",   name:"Con Đường Nô Lệ",       icon:"⛓️",  from:"Tây Phi",   to:"Tân Thế Giới",goods:"Nô Lệ",   value:250, risk:0.25, distance:12 },
  { id:"porcelain",     name:"Đường Đồ Sứ",           icon:"🏺",  from:"Phương Đông",to:"Trời Tây",   goods:"Đồ Sứ",   value:160, risk:0.09, distance:7 },
  { id:"grain_route",   name:"Tuyến Vận Lương",       icon:"🌾",  from:"Đồng Bằng", to:"Đảo Đói",     goods:"Lương Thực",value:80, risk:0.05, distance:4 },
];
const TRADE_EVENTS = [
  { id:"pirate_attack",  name:"Hải Tặc Tập Kích",   icon:"🏴", incomeEffect:-0.30, probability:0.12 },
  { id:"storm",          name:"Bão Lớn",             icon:"🌪️", incomeEffect:-0.20, probability:0.08 },
  { id:"monopoly",       name:"Độc Quyền Thương Mại",icon:"💼", incomeEffect:0.50,  probability:0.05 },
  { id:"trade_war",      name:"Thương Chiến",        icon:"⚔️", incomeEffect:-0.40, probability:0.06 },
  { id:"new_goods",      name:"Hàng Hoá Mới",        icon:"📦", incomeEffect:0.35,  probability:0.07 },
  { id:"port_blockade",  name:"Phong Tỏa Cảng",      icon:"⚓", incomeEffect:-0.50, probability:0.04 },
  { id:"golden_age",     name:"Hoàng Kim Thương Mại",icon:"✨", incomeEffect:0.80,  probability:0.03 },
];
const PORT_CITIES = ["Hải Khẩu","Cảng Long Vương","Bến Vàng","Hải Đô","Thương Cảng Tây","Đông Cảng","Thiên Cảng","Nam Hải Khẩu","Ngọc Cảng","Phong Hải"];

function _rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function _pick(a){return a[Math.floor(Math.random()*a.length)];}

window.oceanTradeData = {
  routes: [],           // active trade routes with controllers
  events: [],           // recent trade events
  ports: [],            // major port cities
  monopolies: {},       // { routeId: factionId }
  totalVolume: 0,
  factionIncome: {},    // { factionId: gold }
  log: [],
  tickCount: 0,
  initialized: false,
};

function otSave(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(window.oceanTradeData));}catch(e){}}
function otLoad(){try{const d=localStorage.getItem(SAVE_KEY);if(d)Object.assign(window.oceanTradeData,JSON.parse(d));}catch(e){}}
function otLog(msg,type){window.oceanTradeData.log.unshift({year:window.year||0,msg,type:type||"info"});if(window.oceanTradeData.log.length>200)window.oceanTradeData.log.pop();if(typeof window.htAddEvent==="function")window.htAddEvent({year:window.year||0,type:"trade",title:msg,color:"#fbbf24"});}

function otGetFactions(){
  const f=[];
  if(typeof window.empireData!=="undefined"&&window.empireData.empires) Object.values(window.empireData.empires).forEach(e=>f.push({id:e.id||e.name,name:e.name}));
  if(typeof window.kingdomData!=="undefined"&&window.kingdomData.kingdoms) Object.values(window.kingdomData.kingdoms).slice(0,5).forEach(k=>f.push({id:k.id||k.name,name:k.name}));
  if(!f.length&&typeof window.countries!=="undefined") window.countries.slice(0,6).forEach(c=>f.push({id:c.name,name:c.name}));
  return f;
}

function otInitRoutes(){
  if(window.oceanTradeData.routes.length>=TRADE_ROUTES.length) return;
  const factions=otGetFactions();
  TRADE_ROUTES.forEach(rt=>{
    if(window.oceanTradeData.routes.find(r=>r.id===rt.id)) return;
    const controller=factions.length?_pick(factions):null;
    window.oceanTradeData.routes.push({
      ...rt,
      controlledBy:controller?controller.id:null,
      controllerName:controller?controller.name:"Tự Do",
      active:true,
      income:rt.value,
      volume:_rand(50,200),
      ships:_rand(3,12),
      disrupted:false,
      disruptedFor:0,
    });
  });
  // Init ports
  if(!window.oceanTradeData.ports.length){
    const count=_rand(5,8);
    for(let i=0;i<count;i++){
      const f=factions.length?_pick(factions):null;
      window.oceanTradeData.ports.push({id:"port_"+i,name:_pick(PORT_CITIES),owner:f?f.id:"Tự Do",ownerName:f?f.name:"Tự Do",wealth:_rand(100,500),traffic:_rand(20,100),taxRate:_rand(5,20)});
    }
  }
}

function otTickRoutes(){
  const factions=otGetFactions();
  window.oceanTradeData.routes.forEach(route=>{
    if(!route.active) return;
    // Disrupted recovery
    if(route.disrupted){route.disruptedFor++;if(route.disruptedFor>5){route.disrupted=false;route.disruptedFor=0;route.income=route.value;}}
    // Pirate impact
    if(typeof window.pirateData!=="undefined"&&window.pirateData.factions.length){
      const raidCount=window.pirateData.raidHistory.filter(r=>r.success&&r.year===window.year).length;
      if(raidCount>3&&Math.random()<0.1){route.income=Math.max(20,route.income*0.85);}
    }
    // Income fluctuation
    route.income=Math.max(10,route.income+_rand(-15,20));
    route.volume=Math.max(10,route.volume+_rand(-10,15));
    // Controller income
    if(route.controlledBy&&!route.disrupted){
      if(!window.oceanTradeData.factionIncome[route.controlledBy]) window.oceanTradeData.factionIncome[route.controlledBy]=0;
      window.oceanTradeData.factionIncome[route.controlledBy]+=Math.floor(route.income*0.3);
    }
    window.oceanTradeData.totalVolume+=route.volume;
    // Monopoly chance
    if(Math.random()<0.005&&factions.length){
      const f=_pick(factions);
      window.oceanTradeData.monopolies[route.id]=f.id;
      otLog(`💼 ${f.name} thiết lập ĐỘC QUYỀN trên ${route.name}!`,"monopoly");
    }
    // Control change
    if(Math.random()<0.02&&factions.length){
      const newCtrl=_pick(factions);
      if(newCtrl.id!==route.controlledBy){
        otLog(`⚔️ ${newCtrl.name} chiếm quyền kiểm soát ${route.name} từ ${route.controllerName}`,"control");
        route.controlledBy=newCtrl.id; route.controllerName=newCtrl.name;
      }
    }
  });
}

function otTryEvent(){
  if(Math.random()>0.04) return;
  const event=_pick(TRADE_EVENTS);
  if(Math.random()>event.probability*8) return;
  const route=_pick(window.oceanTradeData.routes.filter(r=>r.active));
  if(!route) return;
  const incomeChange=Math.floor(route.income*event.incomeEffect);
  route.income=Math.max(5,route.income+incomeChange);
  if(event.incomeEffect<-0.3) route.disrupted=true;
  const ev={id:"ote_"+Date.now(),routeId:route.id,routeName:route.name,eventId:event.id,eventName:event.name,eventIcon:event.icon,incomeChange,year:window.year||0};
  window.oceanTradeData.events.unshift(ev);
  if(window.oceanTradeData.events.length>50) window.oceanTradeData.events.pop();
  otLog(`${event.icon} ${event.name} trên ${route.name}: Thu nhập ${incomeChange>0?'+':''}${incomeChange}`,event.incomeEffect<0?"bad":"good");
}

function otTick(){
  window.oceanTradeData.tickCount++;
  if(!window.oceanTradeData.initialized) return;
  if(window.oceanTradeData.tickCount%15===0) otInitRoutes();
  if(window.oceanTradeData.tickCount%3===0) otTickRoutes();
  otTryEvent();
  if(window.oceanTradeData.tickCount%30===0) otSave();
}

window.otRenderPanel=function(){
  const el=document.getElementById("panel-ocean-v27"); if(!el) return;
  const d=window.oceanTradeData;
  const totalInc=d.routes.filter(r=>r.active).reduce((s,r)=>s+r.income,0);
  const richest=Object.entries(d.factionIncome).sort((a,b)=>b[1]-a[1]).slice(0,5);
  let html=`<div style="padding:16px;font-family:'Noto Serif SC',serif;color:#e2e8f0">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px">
    <div style="font-size:1.3em;color:#fbbf24;font-weight:bold">🌊 Thương Mại Đại Dương V27</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.82em">🗺️ ${d.routes.length} tuyến đường</span>
      <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.82em">💰 ${totalInc}/tick tổng</span>
      <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.82em">📊 ${d.totalVolume.toLocaleString()} khối lượng</span>
    </div>
  </div>
  <!-- TRADE ROUTES -->
  <div style="margin-bottom:14px"><div style="color:#fbbf24;font-weight:bold;margin-bottom:8px">🗺️ Tuyến Thương Mại</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:8px">
  ${d.routes.map(r=>`<div style="background:#1a1000;border:1px solid ${r.disrupted?'#ef4444':Object.values(d.monopolies).includes(r.controlledBy)?'#fbbf24':'#854d0e'};border-radius:8px;padding:10px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div><div style="color:#fde68a;font-weight:bold;font-size:0.9em">${r.icon} ${r.name}</div><div style="color:#64748b;font-size:0.78em">${r.from} → ${r.to}</div></div>
      ${r.disrupted?`<span style="color:#ef4444;font-size:0.8em">⚠️ Gián Đoạn</span>`:''}
    </div>
    <div style="font-size:0.82em;color:#94a3b8;margin:4px 0">📦 ${r.goods} · 🚢 ${r.ships} tàu</div>
    <div style="display:flex;justify-content:space-between;font-size:0.8em;margin:4px 0">
      <span>💰 ${r.income}/tick</span><span>📊 Vol: ${r.volume}</span>
    </div>
    <div style="font-size:0.78em;margin-top:4px;color:#64748b">⚓ Kiểm soát: <span style="color:${r.controlledBy?'#86efac':'#94a3b8'}">${r.controllerName}</span>${d.monopolies[r.id]?` <span style="color:#fbbf24">💼Độc Quyền</span>`:''}</div>
  </div>`).join("")}
  </div></div>
  <!-- PORT CITIES -->
  ${d.ports.length?`<div style="margin-bottom:14px"><div style="color:#38bdf8;font-weight:bold;margin-bottom:8px">⚓ Thương Cảng Lớn</div><div style="display:flex;flex-wrap:wrap;gap:6px">${d.ports.map(p=>`<div style="background:#1e293b;padding:8px 12px;border-radius:8px;font-size:0.82em"><div style="color:#e2e8f0;font-weight:bold">⚓ ${p.name}</div><div style="color:#64748b">${p.ownerName}</div><div style="display:flex;gap:8px;margin-top:3px"><span style="color:#fbbf24">💰${p.wealth}</span><span style="color:#4ade80">📈${p.traffic}</span><span style="color:#f87171">📊${p.taxRate}%</span></div></div>`).join("")}</div></div>`:''}
  <!-- FACTION INCOME RANKINGS -->
  ${richest.length?`<div style="margin-bottom:14px"><div style="color:#4ade80;font-weight:bold;margin-bottom:8px">💰 Thu Nhập Thương Mại Biển</div><div style="display:flex;flex-wrap:wrap;gap:6px">${richest.map(([id,income],i)=>`<div style="background:#1e293b;padding:8px 12px;border-radius:8px;font-size:0.82em"><div style="color:${i===0?'#fbbf24':'#e2e8f0'}">${i===0?'👑 ':''}<b>${id}</b></div><div style="color:#4ade80">💰 ${income.toLocaleString()} vàng</div></div>`).join("")}</div></div>`:''}
  <!-- TRADE EVENTS -->
  <div style="margin-bottom:14px"><div style="color:#c084fc;font-weight:bold;margin-bottom:6px">⚡ Sự Kiện Thương Mại</div><div style="display:flex;flex-wrap:wrap;gap:6px">${TRADE_EVENTS.map(e=>`<div style="background:#1e293b;padding:5px 10px;border-radius:8px;font-size:0.8em">${e.icon} ${e.name}<br><span style="color:${e.incomeEffect<0?'#f87171':'#4ade80'}">${e.incomeEffect>0?'+':''}${(e.incomeEffect*100).toFixed(0)}%</span></div>`).join("")}</div></div>
  <!-- RECENT EVENTS -->
  ${d.events.length?`<div style="margin-bottom:14px"><div style="color:#94a3b8;font-weight:bold;margin-bottom:6px">📋 Sự Kiện Gần Đây</div><div style="max-height:150px;overflow-y:auto;font-size:0.82em">${d.events.slice(0,12).map(e=>`<div style="border-bottom:1px solid #1e293b;padding:4px 0;display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px"><span>${e.eventIcon} ${e.eventName} — ${e.routeName}</span><span style="color:${e.incomeChange>=0?'#4ade80':'#f87171'}">${e.incomeChange>=0?'+':''}${e.incomeChange}💰 · ${e.year}</span></div>`).join("")}</div></div>`:''}
  <!-- LOG -->
  <div><div style="color:#64748b;font-weight:bold;margin-bottom:6px;font-size:0.9em">📋 Nhật Ký</div><div style="max-height:150px;overflow-y:auto;background:#0f172a;border-radius:8px;padding:8px;font-size:0.8em">${d.log.slice(0,18).map(e=>`<div style="border-bottom:1px solid #1e293b;padding:3px 0;color:${e.type==='monopoly'?'#fbbf24':e.type==='bad'?'#f87171':'#94a3b8'}">[${e.year}] ${e.msg}</div>`).join("")||'<div style="color:#475569">Chưa có sự kiện.</div>'}</div></div>
  </div>`;
  el.innerHTML=html;
};

function otInit(){
  otLoad();
  window.oceanTradeData.initialized=true;
  const _o=window.gameTick; window.gameTick=function(){if(_o)_o(); try{otTick();}catch(e){}};
  console.log("[OceanTradeEngineV27] 🌊 Thương Mại Đại Dương V27 khởi động — 8 Tuyến Đường · 7 Sự Kiện · Độc Quyền · Thương Cảng ✓");
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(otInit,INIT_DELAY));
else setTimeout(otInit,INIT_DELAY);
})();
