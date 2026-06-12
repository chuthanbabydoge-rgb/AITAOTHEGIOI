(function() {
"use strict";
// ============================================================
// PIRATE ENGINE V27 — Creator God V6
// Hải Tặc: Băng Đảng · Tập Kích · Truy Đuổi · Kho Báu · Tiền Thưởng
// ============================================================
const SAVE_KEY = "cgv6_pirate_v27";
const INIT_DELAY = 4500;

const PIRATE_FACTION_NAMES = ["Hắc Kỳ Hội","Hải Long Bang","Tử Thần Biển","Cờ Đỏ Liên Minh","Độc Xà Hải Tặc","Ma Thuyền Đoàn","Sóng Đen Hội","Phong Ba Cướp","Thiên Hải Tặc","Cổ Đại Hải Vương"];
const PIRATE_HAVENS = ["Cảng Ma","Đảo Sọ Người","Ẩn Cảng Hắc Long","Vịnh Cướp","Đá Ngầm Tử Thần","Đảo Bí Ẩn","Hang Hải Tặc"];
const RAID_TYPES = [
  { id:"merchant_raid", name:"Cướp Thương Thuyền", icon:"💰", gold:_r(50,200), rep:-5, difficulty:2 },
  { id:"port_raid",     name:"Tấn Công Cảng Biển", icon:"⚔️", gold:_r(100,400),rep:-15,difficulty:4 },
  { id:"navy_ambush",   name:"Phục Kích Hải Quân",  icon:"🏴", gold:_r(30,100), rep:10,  difficulty:5 },
  { id:"treasure_hunt", name:"Tìm Kho Báu",          icon:"🗺️", gold:_r(200,800),rep:20,  difficulty:3 },
  { id:"slave_raid",    name:"Bắt Cóc Ven Biển",    icon:"⛓️", gold:_r(80,300), rep:-20, difficulty:3 },
];
function _r(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function _rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function _pick(a){return a[Math.floor(Math.random()*a.length)];}

window.pirateData = {
  factions: [],
  raids: [],
  raidHistory: [],
  treasures: [],    // found treasures
  bounties: {},     // { factionId: amount }
  totalPlunder: 0,
  log: [],
  tickCount: 0,
  initialized: false,
};

function piSave(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(window.pirateData));}catch(e){}}
function piLoad(){try{const d=localStorage.getItem(SAVE_KEY);if(d)Object.assign(window.pirateData,JSON.parse(d));}catch(e){}}
function piLog(msg,type){window.pirateData.log.unshift({year:window.year||0,msg,type:type||"info"});if(window.pirateData.log.length>200)window.pirateData.log.pop();if(typeof window.htAddEvent==="function")window.htAddEvent({year:window.year||0,type:"pirate",title:msg,color:"#f87171"});}

// ─── INIT FACTIONS ────────────────────────────────────────────
function piInitFactions(){
  if(window.pirateData.factions.length>=5) return;
  const count=_rand(3,6);
  for(let i=window.pirateData.factions.length;i<count;i++){
    const f={id:"pirate_"+i,name:_pick(PIRATE_FACTION_NAMES),icon:"🏴",haven:_pick(PIRATE_HAVENS),ships:_rand(3,12),gold:_rand(100,500),power:_rand(30,100),infamy:_rand(20,80),leader:`Thuyền Trưởng ${["Hắc","Bạch","Đỏ","Vàng","Ngân"][i%5]} Long`,status:"active",kills:0,plunder:0};
    window.pirateData.factions.push(f);
    window.pirateData.bounties[f.id]=_rand(50,300);
  }
}

// ─── RAID SYSTEM ──────────────────────────────────────────────
function piTryRaid(){
  if(Math.random()>0.06) return;
  const activeFactions=window.pirateData.factions.filter(f=>f.status==="active");
  if(!activeFactions.length) return;
  const faction=_pick(activeFactions);
  const raidType=_pick(RAID_TYPES);
  const success=Math.random()>(raidType.difficulty/10);
  const plunder=success?raidType.gold:_rand(0,20);
  const loss=success?0:_rand(0,Math.floor(faction.ships*0.2));
  faction.gold+=plunder; faction.plunder+=plunder;
  if(loss) faction.ships=Math.max(1,faction.ships-loss);
  window.pirateData.totalPlunder+=plunder;
  window.pirateData.bounties[faction.id]=(window.pirateData.bounties[faction.id]||0)+Math.floor(plunder*0.3);
  const raid={id:"raid_"+Date.now(),factionId:faction.id,factionName:faction.name,type:raidType.id,typeName:raidType.name,typeIcon:raidType.icon,plunder,success,year:window.year||0};
  window.pirateData.raidHistory.unshift(raid);
  if(window.pirateData.raidHistory.length>60) window.pirateData.raidHistory.pop();
  if(success) piLog(`${raidType.icon} ${faction.name}: ${raidType.name} thành công! Cướp được ${plunder} vàng`,"raid");
  else piLog(`💨 ${faction.name}: ${raidType.name} thất bại! Mất ${loss} tàu`,"fail");
}

// ─── TREASURE ─────────────────────────────────────────────────
function piTryTreasure(){
  if(Math.random()>0.008) return;
  const treasures=["Kho Báu Đảo Ma","Cổ Vật Hải Thần","Châu Báu Thuyền Đắm","Thánh Kiếm Đại Dương","Linh Thạch Biển Sâu","Bản Đồ Cổ Đại","Bình Tiên Hải Vương"];
  const t={id:"t_"+Date.now(),name:_pick(treasures),value:_rand(200,2000),found:window.year||0,finder:_pick(window.pirateData.factions.map(f=>f.name)||["Hải Tặc Ẩn Danh"])};
  window.pirateData.treasures.unshift(t);
  if(window.pirateData.treasures.length>20) window.pirateData.treasures.pop();
  piLog(`💎 KHO BÁU PHÁT HIỆN: ${t.name} — Giá trị ${t.value} vàng! Tìm thấy bởi ${t.finder}`,"treasure");
}

// ─── PIRATE GROWTH / DECLINE ──────────────────────────────────
function piTickFactions(){
  window.pirateData.factions.forEach(f=>{
    if(f.status!=="active") return;
    // Growth
    if(f.gold>300&&Math.random()<0.05){f.ships+=_rand(1,2); f.gold-=100; f.power=Math.min(200,f.power+10);}
    // Infamy grows with raids
    f.infamy=Math.min(100,f.infamy+0.1);
    // Navy hunts pirates
    if(typeof window.navalV27Data!=="undefined"){
      const navies=Object.values(window.navalV27Data.navies||{});
      if(navies.length&&Math.random()<0.015){
        const loss=_rand(1,2); f.ships=Math.max(0,f.ships-loss);
        if(f.ships===0){f.status="destroyed"; piLog(`💀 ${f.name} bị tiêu diệt bởi hải quân!`,"destroyed");}
        else piLog(`⚓ Hải quân tập kích ${f.name} — mất ${loss} tàu`,"hunt");
      }
    }
  });
  // Respawn if too few
  if(window.pirateData.factions.filter(f=>f.status==="active").length<2) piInitFactions();
}

function piTick(){
  window.pirateData.tickCount++;
  if(!window.pirateData.initialized) return;
  if(window.pirateData.tickCount%25===0) piInitFactions();
  piTryRaid();
  piTryTreasure();
  if(window.pirateData.tickCount%4===0) piTickFactions();
  if(window.pirateData.tickCount%30===0) piSave();
}

window.piRenderPanel=function(){
  const el=document.getElementById("panel-pirates"); if(!el) return;
  const d=window.pirateData;
  const active=d.factions.filter(f=>f.status==="active");
  const topRaider=d.factions.sort((a,b)=>b.plunder-a.plunder)[0];
  let html=`<div style="padding:16px;font-family:'Noto Serif SC',serif;color:#e2e8f0">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px">
    <div style="font-size:1.3em;color:#f87171;font-weight:bold">🏴 Hải Tặc V27</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.82em">🏴 ${active.length} băng đảng</span>
      <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.82em">💰 ${d.totalPlunder.toLocaleString()} tổng cướp</span>
      <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.82em">💎 ${d.treasures.length} kho báu</span>
    </div>
  </div>
  <!-- FACTION CARDS -->
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;margin-bottom:14px">
  ${active.map(f=>`<div style="background:#1a0a0a;border:1px solid #7f1d1d;border-radius:10px;padding:12px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div><div style="color:#fca5a5;font-weight:bold">${f.icon} ${f.name}</div><div style="color:#64748b;font-size:0.8em">👑 ${f.leader}</div></div>
      <div style="text-align:right;font-size:0.8em"><div style="color:#f87171">🚢 ${f.ships} tàu</div><div style="color:#facc15">💰 ${f.gold} vàng</div></div>
    </div>
    <div style="margin:8px 0;font-size:0.82em;color:#94a3b8">⚓ Căn cứ: ${f.haven}</div>
    <div style="display:flex;gap:8px;font-size:0.8em;margin-bottom:6px">
      <span>⚔️ Sức mạnh: <b style="color:#f87171">${f.power}</b></span>
      <span>😈 Ác danh: <b style="color:#fbbf24">${Math.round(f.infamy)}</b></span>
    </div>
    <div style="background:#0f172a;border-radius:4px;height:6px;margin-bottom:4px"><div style="background:#f87171;height:6px;border-radius:4px;width:${Math.min(100,f.infamy)}%"></div></div>
    <div style="font-size:0.78em;color:#64748b">Tổng cướp: ${f.plunder.toLocaleString()} vàng · Tiền thưởng: ${d.bounties[f.id]||0}💰</div>
  </div>`).join("")}
  </div>
  <!-- RAID TYPES -->
  <div style="margin-bottom:14px"><div style="color:#fbbf24;font-weight:bold;margin-bottom:8px">⚔️ Loại Tập Kích</div><div style="display:flex;flex-wrap:wrap;gap:6px">${RAID_TYPES.map(r=>`<div style="background:#1e293b;padding:5px 10px;border-radius:8px;font-size:0.8em">${r.icon} ${r.name}<br><span style="color:#facc15">💰${_rand(50,200)}</span> <span style="color:#f87171">⚠️Lv.${r.difficulty}</span></div>`).join("")}</div></div>
  <!-- TREASURES -->
  ${d.treasures.length?`<div style="margin-bottom:14px"><div style="color:#fbbf24;font-weight:bold;margin-bottom:8px">💎 Kho Báu Đã Tìm Thấy</div><div style="display:flex;flex-wrap:wrap;gap:6px">${d.treasures.slice(0,6).map(t=>`<div style="background:#1a1000;border:1px solid #854d0e;padding:8px 10px;border-radius:8px;font-size:0.82em"><div style="color:#fbbf24">💎 ${t.name}</div><div style="color:#94a3b8">${t.value} vàng · ${t.found}年</div></div>`).join("")}</div></div>`:''}
  <!-- BOUNTIES -->
  <div style="margin-bottom:14px"><div style="color:#fb923c;font-weight:bold;margin-bottom:8px">📋 Tiền Thưởng Truy Nã</div><div style="display:flex;flex-wrap:wrap;gap:6px">${active.map(f=>`<div style="background:#1e293b;padding:5px 10px;border-radius:8px;font-size:0.82em"><span style="color:#fca5a5">${f.name}</span><br><span style="color:#facc15">💰 ${d.bounties[f.id]||0}</span></div>`).join("")}</div></div>
  <!-- RECENT RAIDS -->
  <div style="margin-bottom:14px"><div style="color:#94a3b8;font-weight:bold;margin-bottom:6px">📜 Tập Kích Gần Đây</div><div style="max-height:160px;overflow-y:auto;font-size:0.82em">${d.raidHistory.slice(0,15).map(r=>`<div style="border-bottom:1px solid #1e293b;padding:4px 0;display:flex;justify-content:space-between;gap:6px;flex-wrap:wrap"><span>${r.typeIcon} <span style="color:${r.success?'#4ade80':'#f87171'}">${r.typeName}</span> — ${r.factionName}</span><span style="color:${r.success?'#fbbf24':'#64748b'}">${r.success?`+${r.plunder}💰`:'thất bại'} · ${r.year}</span></div>`).join("")||'<div style="color:#475569">Chưa có.</div>'}</div></div>
  <!-- LOG -->
  <div><div style="color:#64748b;font-weight:bold;margin-bottom:6px;font-size:0.9em">📋 Nhật Ký</div><div style="max-height:150px;overflow-y:auto;background:#0f172a;border-radius:8px;padding:8px;font-size:0.8em">${d.log.slice(0,20).map(e=>`<div style="border-bottom:1px solid #1e293b;padding:3px 0;color:${e.type==='treasure'?'#fbbf24':e.type==='raid'?'#4ade80':'#94a3b8'}">[${e.year}] ${e.msg}</div>`).join("")||'<div style="color:#475569">Chưa có sự kiện.</div>'}</div></div>
  </div>`;
  el.innerHTML=html;
};

function piInit(){
  piLoad(); piInitFactions();
  window.pirateData.initialized=true;
  const _o=window.gameTick; window.gameTick=function(){if(_o)_o(); try{piTick();}catch(e){}};
  console.log("[PirateEngineV27] 🏴 Hải Tặc V27 khởi động — Băng Đảng · Tập Kích · Kho Báu · Tiền Thưởng ✓");
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(piInit,INIT_DELAY));
else setTimeout(piInit,INIT_DELAY);
})();
