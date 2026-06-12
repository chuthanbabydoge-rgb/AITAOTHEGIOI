(function() {
"use strict";
// ============================================================
// FLEET ENGINE V27 — Creator God V6
// Quản Lý Hạm Đội: Tập Hợp · Nhiệm Vụ · Nâng Cấp · Tinh Thần
// ============================================================
const SAVE_KEY = "cgv6_fleet_v27";
const INIT_DELAY = 4200;

const FLEET_MISSIONS = [
  { id:"patrol",    name:"Tuần Tra",          icon:"👁️", duration:5,  reward:{gold:20, rep:5},   risk:0.05 },
  { id:"escort",    name:"Hộ Tống Thương Thuyền",icon:"🛡️",duration:8,  reward:{gold:50, rep:10},  risk:0.10 },
  { id:"raid",      name:"Tập Kích Duyên Hải", icon:"⚔️", duration:6,  reward:{gold:80, rep:-5},  risk:0.25 },
  { id:"explore",   name:"Thám Hiểm Đại Dương",icon:"🗺️", duration:15, reward:{gold:150,rep:20},  risk:0.30 },
  { id:"blockade",  name:"Phong Tỏa Cảng",     icon:"⚓", duration:10, reward:{gold:60, rep:-10}, risk:0.20 },
  { id:"transport", name:"Vận Tải Quân Sự",    icon:"🚚", duration:7,  reward:{gold:40, rep:8},   risk:0.15 },
  { id:"hunt",      name:"Truy Kích Hải Tặc",  icon:"🏴", duration:12, reward:{gold:100,rep:25},  risk:0.20 },
];
const FLEET_UPGRADES = [
  { id:"iron_hull",  name:"Thân Tàu Sắt",    cost:200, effect:"def+20%" },
  { id:"fire_cannon",name:"Đại Pháo Hỏa",    cost:300, effect:"atk+30%" },
  { id:"speed_sails",name:"Buồm Tốc Chiến",  cost:150, effect:"speed+25%" },
  { id:"spy_glass",  name:"Ống Nhòm Thần",   cost:100, effect:"scouting+50%" },
  { id:"iron_ram",   name:"Mũi Tàu Thép",    cost:250, effect:"ramming+40%" },
];

window.fleetData = {
  fleets: {},    // { factionId: [ {id,name,ships[],mission,morale,upgrades[],status} ] }
  missions: [],  // active missions
  log: [],
  tickCount: 0,
  initialized: false,
};

function feSave(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(window.fleetData));}catch(e){}}
function feLoad(){try{const d=localStorage.getItem(SAVE_KEY);if(d)Object.assign(window.fleetData,JSON.parse(d));}catch(e){}}
function _rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function _pick(a){return a[Math.floor(Math.random()*a.length)];}
function feLog(msg){window.fleetData.log.unshift({year:window.year||0,msg});if(window.fleetData.log.length>150)window.fleetData.log.pop();}

function feGetFactions(){
  const f=[];
  if(typeof window.navalV27Data!=="undefined") Object.keys(window.navalV27Data.navies||{}).forEach(id=>f.push(id));
  else if(typeof window.countries!=="undefined") window.countries.slice(0,6).forEach(c=>f.push(c.name));
  return f;
}

function feCreateFleet(factionId,idx){
  const mission=_pick(FLEET_MISSIONS);
  const upg=Math.random()<0.3?[_pick(FLEET_UPGRADES).id]:[];
  return {id:`fleet_${factionId}_${idx}`,name:`Đệ ${idx+1} Hạm Đội ${factionId.split(" ")[0]}`,factionId,ships:_rand(2,8),morale:_rand(60,100),mission:null,missionProgress:0,upgrades:upg,status:"idle",victories:0,experience:0};
}

function feTickMissions(){
  window.fleetData.missions.filter(m=>m.status==="active").forEach(m=>{
    m.progress+=_rand(5,15);
    if(m.progress>=100){
      m.status="done";
      const fleet=Object.values(window.fleetData.fleets).flat().find(f=>f.id===m.fleetId);
      if(fleet){
        fleet.status="idle"; fleet.mission=null; fleet.missionProgress=0;
        fleet.experience+=_rand(5,20); fleet.victories++;
        if(Math.random()<m.risk){
          const lost=_rand(1,Math.max(1,Math.floor(fleet.ships*0.3)));
          fleet.ships=Math.max(1,fleet.ships-lost);
          feLog(`💥 Hạm đội ${fleet.name} mất ${lost} tàu trong nhiệm vụ ${m.missionName}.`);
        } else {
          feLog(`✅ Hạm đội ${fleet.name} hoàn thành "${m.missionName}" — Thưởng: ${m.rewardGold} vàng`);
        }
      }
    } else {
      const fleet=Object.values(window.fleetData.fleets).flat().find(f=>f.id===m.fleetId);
      if(fleet){fleet.missionProgress=m.progress;}
    }
  });
  window.fleetData.missions=window.fleetData.missions.filter(m=>m.status==="active");
  // Auto-assign idle fleets
  Object.values(window.fleetData.fleets).flat().forEach(fleet=>{
    if(fleet.status==="idle"&&Math.random()<0.25){
      const mission=_pick(FLEET_MISSIONS);
      fleet.status="on_mission"; fleet.mission=mission.id; fleet.missionProgress=0;
      window.fleetData.missions.push({id:"fm_"+Date.now()+Math.random(),fleetId:fleet.id,missionId:mission.id,missionName:mission.name,risk:mission.risk,rewardGold:mission.reward.gold,progress:0,status:"active"});
    }
  });
}

function feTick(){
  const d=window.fleetData;
  d.tickCount++;
  if(!d.initialized) return;
  if(d.tickCount%20===0){
    const factions=feGetFactions();
    factions.forEach(fid=>{
      if(!d.fleets[fid]){
        const cnt=_rand(1,3);
        d.fleets[fid]=[];
        for(let i=0;i<cnt;i++) d.fleets[fid].push(feCreateFleet(fid,i));
      }
    });
  }
  feTickMissions();
  if(d.tickCount%30===0) feSave();
}

window.feRenderFleets=function(containerId){
  const el=document.getElementById(containerId||"panel-naval-v27"); if(!el) return;
  const d=window.fleetData;
  const allFleets=Object.values(d.fleets).flat();
  const active=allFleets.filter(f=>f.status==="on_mission").length;
  let html=`<div style="margin-top:16px;border-top:1px solid #334155;padding-top:14px">
  <div style="color:#4ade80;font-weight:bold;margin-bottom:8px">⚓ Hạm Đội V27 — ${allFleets.length} hạm đội · ${active} đang làm nhiệm vụ</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px">
  ${allFleets.slice(0,12).map(f=>{
    const mdef=FLEET_MISSIONS.find(m=>m.id===f.mission);
    return `<div style="background:#0f172a;border:1px solid ${f.status==="on_mission"?'#4ade80':'#334155'};border-radius:8px;padding:10px">
      <div style="color:#e2e8f0;font-weight:bold;font-size:0.9em">${f.name}</div>
      <div style="font-size:0.8em;color:#94a3b8;margin:3px 0">🚢 ${f.ships} tàu · ❤️ Tinh thần ${f.morale}% · ⭐ ${f.experience} EXP</div>
      ${f.upgrades.length?`<div style="font-size:0.77em;color:#c084fc">🔧 ${f.upgrades.join(", ")}</div>`:''}
      ${f.status==="on_mission"?`<div style="margin-top:5px"><div style="font-size:0.8em;color:#4ade80">${mdef?.icon||'⚓'} ${mdef?.name||f.mission}</div><div style="background:#1e293b;border-radius:3px;height:5px;margin-top:3px"><div style="background:#4ade80;height:5px;border-radius:3px;width:${f.missionProgress}%"></div></div></div>`:`<div style="font-size:0.8em;color:#64748b;margin-top:4px">💤 Đang nghỉ ngơi</div>`}
    </div>`;
  }).join("")}
  </div>
  <!-- MISSIONS TABLE -->
  <div style="margin-top:12px"><div style="color:#38bdf8;font-weight:bold;margin-bottom:6px;font-size:0.9em">📋 Nhiệm Vụ Hạm Đội</div>
  <div style="display:flex;flex-wrap:wrap;gap:6px">
  ${FLEET_MISSIONS.map(m=>`<div style="background:#1e293b;padding:5px 10px;border-radius:8px;font-size:0.8em">${m.icon} ${m.name}<br><span style="color:#64748b">⏳${m.duration} tick · 💰${m.reward.gold} · ⚠️${(m.risk*100).toFixed(0)}%</span></div>`).join("")}
  </div></div>
  </div>`;
  if(el.innerHTML) el.innerHTML+=html; else el.innerHTML=html;
};

function feInit(){
  feLoad();
  window.fleetData.initialized=true;
  const _o=window.gameTick; window.gameTick=function(){if(_o)_o(); try{feTick();}catch(e){}};
  console.log("[FleetEngineV27] ⚓ Hạm Đội V27 khởi động — Nhiệm Vụ · Nâng Cấp · Tinh Thần ✓");
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(feInit,INIT_DELAY));
else setTimeout(feInit,INIT_DELAY);
})();
