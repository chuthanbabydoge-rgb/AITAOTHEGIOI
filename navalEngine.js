(function() {
"use strict";
// ============================================================
// NAVAL ENGINE V27 — Creator God V6
// Mở rộng navalOceanEngine.js (V1) — KHÔNG ghi đè
// Hải Quân Chiến Đấu: Loại Tàu · Hải Chiến · Đô Đốc · Sức Mạnh
// Tích hợp: Kingdom · Empire · Continent V26
// ============================================================
const SAVE_KEY = "cgv6_naval_v27";
const INIT_DELAY = 4000;

// ─── SHIP TYPES ───────────────────────────────────────────────
const SHIP_TYPES = {
  junk:      { id:"junk",     name:"Thuyền Buôn",    icon:"⛵",  atk:5,  def:3,  hp:30, speed:3, cost:50,  cargo:100, crew:20,  role:"trade"   },
  galley:    { id:"galley",   name:"Thuyền Chiến",   icon:"🚣",  atk:15, def:8,  hp:50, speed:4, cost:120, cargo:20,  crew:60,  role:"combat"  },
  warjunk:   { id:"warjunk",  name:"Chiến Thuyền",   icon:"🚢",  atk:25, def:15, hp:80, speed:3, cost:200, cargo:40,  crew:100, role:"combat"  },
  frigate:   { id:"frigate",  name:"Tàu Khu Trục",   icon:"⚓",  atk:40, def:25, hp:120,speed:5, cost:350, cargo:30,  crew:150, role:"combat"  },
  flagship:  { id:"flagship", name:"Kỳ Hạm",         icon:"🏴",  atk:70, def:50, hp:200,speed:2, cost:800, cargo:50,  crew:300, role:"flagship"},
  submarine: { id:"submarine",name:"Tiềm Long Thuyền",icon:"🌀", atk:60, def:10, hp:90, speed:6, cost:600, cargo:10,  crew:80,  role:"stealth" },
  fireboat:  { id:"fireboat", name:"Hỏa Thuyền",     icon:"🔥",  atk:80, def:5,  hp:40, speed:7, cost:250, cargo:0,   crew:30,  role:"fire"    },
};

const ADMIRAL_TRAITS = ["Dũng Mãnh","Thần Toán","Biển Khơi","Phong Ba","Long Vương","Hải Thần Hóa","Vô Song"];
const BATTLE_TACTICS = ["Bao Vây","Đột Kích Bên Sườn","Hàng Dài","Chữ V","Phân Tán","Hỏa Công","Tiềm Nhập"];

// ─── STATE ────────────────────────────────────────────────────
window.navalV27Data = {
  navies: {},       // { factionId: { ships, admirals, power, homePort } }
  battles: [],      // active sea battles
  battleHistory: [],
  admirals: [],     // all admirals
  log: [],
  tickCount: 0,
  initialized: false,
};

function nvSave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.navalV27Data)); } catch(e){} }
function nvLoad() { try { const d=localStorage.getItem(SAVE_KEY); if(d) Object.assign(window.navalV27Data, JSON.parse(d)); } catch(e){} }
function _rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function _pick(a){return a[Math.floor(Math.random()*a.length)];}
function nvLog(msg,type){ window.navalV27Data.log.unshift({year:window.year||0,msg,type:type||"info"}); if(window.navalV27Data.log.length>200) window.navalV27Data.log.pop(); if(typeof window.htAddEvent==="function") window.htAddEvent({year:window.year||0,type:"naval",title:msg,color:"#38bdf8"}); }

// ─── GET FACTIONS ─────────────────────────────────────────────
function nvGetFactions(){
  const factions=[];
  if(typeof window.kingdomData!=="undefined"&&window.kingdomData.kingdoms) Object.values(window.kingdomData.kingdoms).forEach(k=>factions.push({id:k.id||k.name,name:k.name,type:"kingdom"}));
  if(typeof window.empireData!=="undefined"&&window.empireData.empires) Object.values(window.empireData.empires).forEach(e=>factions.push({id:e.id||e.name,name:e.name,type:"empire"}));
  if(!factions.length&&typeof window.countries!=="undefined") window.countries.slice(0,8).forEach(c=>factions.push({id:c.name,name:c.name,type:"country"}));
  return factions;
}

// ─── INIT NAVY ────────────────────────────────────────────────
function nvInitNavy(faction){
  const shipList=[];
  const types=Object.values(SHIP_TYPES);
  const count=_rand(3,10);
  for(let i=0;i<count;i++){
    const t=_pick(types);
    shipList.push({id:`ship_${faction.id}_${i}`,type:t.id,name:`${t.name} ${i+1}`,icon:t.icon,atk:t.atk+_rand(-3,5),def:t.def+_rand(-2,3),hp:t.hp,maxHp:t.hp,speed:t.speed,crew:t.crew,status:"active"});
  }
  const admiral={id:`adm_${faction.id}`,name:`Đô Đốc ${faction.name.split(" ")[0]}`,trait:_pick(ADMIRAL_TRAITS),level:_rand(1,5),victories:0,factionId:faction.id};
  window.navalV27Data.admirals.push(admiral);
  return {ships:shipList,admiral:admiral.id,power:shipList.reduce((s,sh)=>s+sh.atk+sh.def,0),homePort:faction.name,kills:0,losses:0};
}

// ─── NAVAL POWER ─────────────────────────────────────────────
function nvCalcPower(navy){
  if(!navy||!navy.ships) return 0;
  return navy.ships.filter(s=>s.status==="active").reduce((s,sh)=>s+sh.atk*0.6+sh.def*0.4,0);
}

// ─── SEA BATTLES ─────────────────────────────────────────────
function nvTryBattle(){
  if(Math.random()>0.02) return;
  const fids=Object.keys(window.navalV27Data.navies);
  if(fids.length<2) return;
  const aId=_pick(fids);
  const dId=_pick(fids.filter(x=>x!==aId));
  if(!aId||!dId) return;
  const already=window.navalV27Data.battles.some(b=>b.status==="active"&&(b.attacker===aId||b.defender===aId));
  if(already) return;
  const battle={id:"nvb_"+Date.now(),attacker:aId,defender:dId,zone:_pick(["Đông Hải","Nam Minh","Tây Dương","Bắc Băng"]),tactic:_pick(BATTLE_TACTICS),round:0,atkScore:0,defScore:0,startYear:window.year||0,status:"active"};
  window.navalV27Data.battles.push(battle);
  nvLog(`⚓ HẢI CHIẾN: ${aId} tấn công ${dId} tại ${battle.zone} — Chiến thuật: ${battle.tactic}`,"battle");
}

function nvTickBattles(){
  window.navalV27Data.battles.filter(b=>b.status==="active").forEach(b=>{
    const aN=window.navalV27Data.navies[b.attacker];
    const dN=window.navalV27Data.navies[b.defender];
    if(!aN||!dN){b.status="ended";return;}
    const aPow=nvCalcPower(aN)+_rand(-20,20);
    const dPow=nvCalcPower(dN)+_rand(-20,20);
    if(aPow>dPow){b.atkScore+=_rand(5,15); if(dN.ships.length) dN.ships[_rand(0,dN.ships.length-1)].hp=Math.max(0,dN.ships[0].hp-_rand(10,30));}
    else{b.defScore+=_rand(5,15); if(aN.ships.length) aN.ships[_rand(0,aN.ships.length-1)].hp=Math.max(0,aN.ships[0].hp-_rand(10,30));}
    b.round++;
    if(b.atkScore>=100||b.defScore>=100||b.round>=20){
      b.status="ended"; b.endYear=window.year||0;
      const winner=b.atkScore>=100?b.attacker:b.defender;
      const loser=b.atkScore>=100?b.defender:b.attacker;
      const wN=window.navalV27Data.navies[winner];
      const lN=window.navalV27Data.navies[loser];
      if(wN){wN.kills+=_rand(1,3); const adm=window.navalV27Data.admirals.find(a=>a.id===wN.admiral); if(adm) adm.victories++;}
      if(lN){lN.losses+=_rand(1,3); const s=lN.ships.findIndex(sh=>sh.hp<=0); if(s>=0) lN.ships.splice(s,1);}
      window.navalV27Data.battleHistory.unshift(b);
      if(window.navalV27Data.battleHistory.length>40) window.navalV27Data.battleHistory.pop();
      nvLog(`🏆 HẢI CHIẾN KẾT THÚC: ${winner} thắng ${loser} tại ${b.zone} (Vòng ${b.round})`,"battle_end");
    }
  });
  window.navalV27Data.battles=window.navalV27Data.battles.filter(b=>b.status==="active");
}

// ─── TICK ─────────────────────────────────────────────────────
function nvTick(){
  const d=window.navalV27Data;
  d.tickCount++;
  if(!d.initialized) return;
  if(d.tickCount%15===0){
    const factions=nvGetFactions();
    factions.forEach(f=>{ if(!d.navies[f.id||f.name]) d.navies[f.id||f.name]=nvInitNavy(f); });
  }
  if(d.tickCount%3===0) nvTryBattle();
  nvTickBattles();
  if(d.tickCount%30===0) nvSave();
}

// ─── RENDER ───────────────────────────────────────────────────
window.nvRenderPanel=function(){
  const el=document.getElementById("panel-naval-v27"); if(!el) return;
  const d=window.navalV27Data;
  const navyList=Object.entries(d.navies);
  const sorted=navyList.map(([id,n])=>({id,n,power:nvCalcPower(n)})).sort((a,b)=>b.power-a.power);
  let html=`<div style="padding:16px;font-family:'Noto Serif SC',serif;color:#e2e8f0">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px">
    <div style="font-size:1.3em;color:#38bdf8;font-weight:bold">🚢 Hải Quân V27</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.82em">⚓ ${navyList.length} hải quân</span>
      <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.82em">⚔️ ${d.battles.length} trận đang diễn</span>
      <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.82em">🎖️ ${d.admirals.length} đô đốc</span>
    </div>
  </div>
  <!-- SHIP TYPES -->
  <div style="margin-bottom:14px">
    <div style="color:#38bdf8;font-weight:bold;margin-bottom:8px">🚢 Loại Tàu Chiến</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      ${Object.values(SHIP_TYPES).map(t=>`<div style="background:#1e293b;padding:6px 10px;border-radius:8px;font-size:0.8em">
        ${t.icon} <b>${t.name}</b><br>
        <span style="color:#f87171">⚔️${t.atk}</span> <span style="color:#38bdf8">🛡️${t.def}</span> <span style="color:#4ade80">❤️${t.hp}</span> <span style="color:#facc15">💰${t.cost}</span>
      </div>`).join("")}
    </div>
  </div>
  <!-- RANKINGS -->
  <div style="margin-bottom:14px">
    <div style="color:#fbbf24;font-weight:bold;margin-bottom:8px">🏆 Xếp Hạng Hải Quân</div>
    <table style="width:100%;border-collapse:collapse;font-size:0.82em">
      <tr style="color:#94a3b8;border-bottom:1px solid #334155"><th style="text-align:left;padding:4px 8px">#</th><th style="text-align:left;padding:4px 8px">Thế Lực</th><th style="text-align:right;padding:4px 8px">Sức Mạnh</th><th style="text-align:right;padding:4px 8px">Tàu</th><th style="text-align:right;padding:4px 8px">Trận Thắng</th></tr>
      ${sorted.slice(0,10).map(({id,n,power},i)=>`<tr style="border-bottom:1px solid #1e293b"><td style="padding:4px 8px;color:${i===0?'#fbbf24':'#64748b'}">${i===0?'👑':i+1}</td><td style="padding:4px 8px">${id}</td><td style="padding:4px 8px;text-align:right;color:#38bdf8">${Math.round(power)}</td><td style="padding:4px 8px;text-align:right;color:#4ade80">${n.ships?.length||0}</td><td style="padding:4px 8px;text-align:right;color:#fbbf24">${n.kills||0}</td></tr>`).join("")}
    </table>
  </div>
  <!-- ACTIVE BATTLES -->
  ${d.battles.length?`<div style="margin-bottom:14px"><div style="color:#f87171;font-weight:bold;margin-bottom:8px">⚔️ Hải Chiến Đang Diễn Ra</div>${d.battles.map(b=>`<div style="background:#1a0a0a;border:1px solid #7f1d1d;border-radius:8px;padding:10px;margin-bottom:6px;font-size:0.85em"><div style="display:flex;justify-content:space-between"><span style="color:#fca5a5">⚓ ${b.attacker} <span style="color:#64748b">vs</span> ${b.defender}</span><span style="color:#64748b">${b.zone}</span></div><div style="color:#94a3b8;margin:4px 0">Chiến thuật: ${b.tactic} · Vòng ${b.round}</div><div style="display:flex;gap:12px"><span>🗡️ Tấn công: <b style="color:#fb923c">${b.atkScore}/100</b></span><span>🛡️ Phòng thủ: <b style="color:#38bdf8">${b.defScore}/100</b></span></div></div>`).join("")}</div>`:''}
  <!-- ADMIRALS -->
  <div style="margin-bottom:14px"><div style="color:#c084fc;font-weight:bold;margin-bottom:8px">🎖️ Đô Đốc</div><div style="display:flex;flex-wrap:wrap;gap:8px">${d.admirals.slice(0,8).map(a=>`<div style="background:#1e293b;padding:8px 10px;border-radius:8px;font-size:0.82em"><div style="color:#e2e8f0;font-weight:bold">${a.name}</div><div style="color:#c084fc">${a.trait}</div><div style="color:#64748b">Lv.${a.level} · ${a.victories} chiến thắng</div></div>`).join("")}</div></div>
  <!-- BATTLE HISTORY -->
  ${d.battleHistory.length?`<div><div style="color:#64748b;font-weight:bold;margin-bottom:6px">📜 Lịch Sử Hải Chiến</div><div style="max-height:150px;overflow-y:auto;font-size:0.8em">${d.battleHistory.slice(0,10).map(b=>`<div style="border-bottom:1px solid #1e293b;padding:3px 0;color:#64748b">🏆 ${b.atkScore>=100?b.attacker:b.defender} thắng · ${b.attacker} vs ${b.defender} · ${b.zone} · ${b.startYear}</div>`).join("")}</div></div>`:''}
  <!-- LOG -->
  <div style="margin-top:12px"><div style="color:#64748b;font-weight:bold;margin-bottom:6px;font-size:0.9em">📋 Nhật Ký</div><div style="max-height:160px;overflow-y:auto;background:#0f172a;border-radius:8px;padding:8px;font-size:0.8em">${d.log.slice(0,20).map(e=>`<div style="border-bottom:1px solid #1e293b;padding:3px 0;color:#94a3b8">[${e.year}] ${e.msg}</div>`).join("")||'<div style="color:#475569">Chưa có sự kiện.</div>'}</div></div>
  </div>`;
  el.innerHTML=html;
};

function nvInit(){
  nvLoad();
  const factions=nvGetFactions();
  factions.forEach(f=>{ if(!window.navalV27Data.navies[f.id||f.name]) window.navalV27Data.navies[f.id||f.name]=nvInitNavy(f); });
  window.navalV27Data.initialized=true;
  const _o=window.gameTick; window.gameTick=function(){if(_o)_o(); try{nvTick();}catch(e){}};
  console.log("[NavalEngineV27] 🚢 Hải Quân V27 khởi động — Chiến Thuyền · Đô Đốc · Hải Chiến · 7 loại tàu ✓");
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(nvInit,INIT_DELAY));
else setTimeout(nvInit,INIT_DELAY);
})();
