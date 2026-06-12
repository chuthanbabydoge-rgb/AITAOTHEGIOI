(function() {
"use strict";
// ============================================================
// PLAYER INVENTORY V28 — Creator God V6
// Kho Đồ: Vàng · Tài Nguyên · Cổ Vật · Di Vật · Thần Khí · Danh Hiệu
// ============================================================
const SAVE_KEY = "cgv6_inventory_v28";
const INIT_DELAY = 4400;

const ITEM_TYPES = {
  gold:       { name:"Vàng",            icon:"💰", color:"#fbbf24", stackable:true  },
  resource:   { name:"Tài Nguyên",      icon:"📦", color:"#4ade80", stackable:true  },
  artifact:   { name:"Cổ Vật",          icon:"🔮", color:"#c084fc", stackable:false },
  relic:      { name:"Di Vật",          icon:"⚗️", color:"#60a5fa", stackable:false },
  divine_item:{ name:"Thần Khí",        icon:"✨", color:"#fde68a", stackable:false },
  title:      { name:"Danh Hiệu",       icon:"📜", color:"#fb923c", stackable:false },
  herb:       { name:"Linh Thảo",       icon:"🌿", color:"#86efac", stackable:true  },
  pill:       { name:"Đan Dược",        icon:"💊", color:"#f0abfc", stackable:true  },
  weapon:     { name:"Vũ Khí",          icon:"⚔️", color:"#f87171", stackable:false },
  armor:      { name:"Giáp Trụ",        icon:"🛡️", color:"#38bdf8", stackable:false },
};

const ITEM_POOL = [
  // Resources
  {id:"iron",      type:"resource",   name:"Sắt Quặng",        icon:"⛏️", value:5,    rarity:"common",    desc:"Nguyên liệu rèn kiếm cơ bản."},
  {id:"silk",      type:"resource",   name:"Lụa Thượng Hạng",  icon:"🪡", value:20,   rarity:"uncommon",  desc:"Lụa quý từ vùng Nam Phương."},
  {id:"crystal",   type:"resource",   name:"Linh Thạch",       icon:"💎", value:50,   rarity:"rare",      desc:"Đá linh khí, dùng tu luyện."},
  // Herbs
  {id:"ginseng",   type:"herb",       name:"Nhân Sâm Ngàn Năm",icon:"🌿", value:100,  rarity:"rare",      desc:"Linh thảo tăng tuổi thọ 500 năm."},
  {id:"spirit_grass",type:"herb",     name:"Linh Thảo Tiên",   icon:"🍃", value:200,  rarity:"epic",      desc:"Chỉ mọc ở vùng đất thiêng liêng."},
  // Pills
  {id:"qi_pill",   type:"pill",       name:"Tụ Khí Đan",       icon:"💊", value:80,   rarity:"uncommon",  desc:"Gia tốc tu luyện x2 trong 10 năm."},
  {id:"immortal_pill",type:"pill",    name:"Tiên Đan Cấp Cao",  icon:"💊", value:500,  rarity:"legendary", desc:"Giúp đột phá cảnh giới."},
  // Weapons
  {id:"iron_sword",type:"weapon",     name:"Thiết Kiếm",       icon:"⚔️", value:200,  rarity:"common",    desc:"Kiếm sắt thông thường."},
  {id:"spirit_sword",type:"weapon",   name:"Linh Kiếm Cổ Đại", icon:"🗡️", value:2000, rarity:"epic",      desc:"Kiếm chứa linh khí, chém cả hồn."},
  {id:"divine_sword",type:"divine_item",name:"Thiên Kiếm Thần Thánh",icon:"✨",value:10000,rarity:"legendary",desc:"Thần khí tuyệt thế, chém cả thần linh."},
  // Armors
  {id:"iron_armor",type:"armor",      name:"Thiết Giáp",       icon:"🛡️", value:300,  rarity:"common",    desc:"Giáp sắt thông thường."},
  {id:"divine_armor",type:"divine_item",name:"Thần Giáp Bất Hoại",icon:"⚡",value:8000, rarity:"legendary",desc:"Giáp bất hoại, bảo vệ thần thể."},
  // Artifacts
  {id:"jade_seal", type:"artifact",   name:"Ngọc Tỷ Hoàng Đế", icon:"🔮", value:5000, rarity:"epic",      desc:"Ấn tín của thiên tử, quyền uy vô biên."},
  {id:"ancient_scroll",type:"artifact",name:"Cổ Thư Bí Ẩn",   icon:"📜", value:3000, rarity:"rare",      desc:"Cổ thư chứa bí pháp cấm."},
  // Relics
  {id:"saint_bone",type:"relic",      name:"Thánh Cốt Thần Tiên",icon:"🦴",value:4000, rarity:"epic",      desc:"Xương của tiên nhân, linh khí ăm ắp."},
  // Titles
  {id:"brave_title",type:"title",     name:"Chiến Thần",        icon:"📜", value:500,  rarity:"rare",      desc:"Danh hiệu ban cho chiến sĩ anh dũng."},
  {id:"king_title", type:"title",     name:"Thiên Hạ Đệ Nhất", icon:"📜", value:5000, rarity:"legendary", desc:"Đệ nhất thiên hạ vô song."},
];

const RARITY_COLORS = {common:"#94a3b8",uncommon:"#4ade80",rare:"#60a5fa",epic:"#c084fc",legendary:"#fbbf24"};

function _rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function _pick(a){return a[Math.floor(Math.random()*a.length)];}

window.invData = {
  items: [],          // {id, type, name, icon, value, rarity, desc, qty, equippedSlot}
  gold: 100,
  equipped: {},       // slot: itemId
  totalValue: 0,
  acquired: 0,
  log: [],
  tickCount: 0,
  initialized: false,
};

function invSave(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(window.invData));}catch(e){}}
function invLoad(){try{const d=localStorage.getItem(SAVE_KEY);if(d) Object.assign(window.invData,JSON.parse(d));}catch(e){}}
function invLog(msg){window.invData.log.unshift({year:window.year||0,msg});if(window.invData.log.length>100)window.invData.log.pop();}

// ─── PUBLIC API ───────────────────────────────────────────────
window.invAddItem = function(itemId, qty){
  qty=qty||1;
  const template=ITEM_POOL.find(i=>i.id===itemId);
  if(!template) return false;
  const existing=window.invData.items.find(i=>i.id===itemId);
  if(existing&&ITEM_TYPES[template.type]?.stackable){ existing.qty+=qty; }
  else{ window.invData.items.push({...template,qty,instId:"inv_"+Date.now()}); }
  window.invData.acquired+=qty;
  window.invData.totalValue=window.invData.items.reduce((s,i)=>s+i.value*i.qty,0);
  invLog(`📦 Nhận được: ${template.icon} ${template.name} x${qty}`);
  if(typeof window.playerAddXP==="function") window.playerAddXP(Math.floor(template.value*0.1),"loot");
  return true;
};
window.invAddGold = function(amount){
  window.invData.gold=Math.max(0,window.invData.gold+amount);
  if(typeof window.playerAddWealth==="function") window.playerAddWealth(amount);
};
window.invGetEquipped = function(){return window.invData.equipped;};

// ─── RANDOM LOOT ─────────────────────────────────────────────
function invTryRandomLoot(){
  if(Math.random()>0.03) return;
  const playerLvl=(window.playerV28Data&&window.playerV28Data.rankLevel)||1;
  const rarityWeight=playerLvl>7?[0,0,0.1,0.4,0.5]:playerLvl>4?[0.2,0.3,0.3,0.2,0]:playerLvl>2?[0.4,0.3,0.2,0.1,0]:[0.7,0.2,0.1,0,0];
  const roll=Math.random();
  let rarityIdx=roll<rarityWeight[0]?0:roll<rarityWeight[0]+rarityWeight[1]?1:roll<rarityWeight[0]+rarityWeight[1]+rarityWeight[2]?2:roll<rarityWeight[0]+rarityWeight[1]+rarityWeight[2]+rarityWeight[3]?3:4;
  const rarities=["common","uncommon","rare","epic","legendary"];
  const pool=ITEM_POOL.filter(i=>i.rarity===rarities[rarityIdx]);
  if(pool.length) window.invAddItem(_pick(pool).id, _rand(1,3));
}

function invTick(){
  window.invData.tickCount++;
  if(!window.invData.initialized) return;
  // Sync gold from playerV28
  if(typeof window.playerV28Data!=="undefined"&&window.playerV28Data.id&&window.invData.tickCount%10===0){
    window.invData.gold=window.playerV28Data.wealth;
  }
  invTryRandomLoot();
  if(window.invData.tickCount%30===0) invSave();
}

window.invRenderPanel=function(){
  const el=document.getElementById("panel-inventory-v28"); if(!el) return;
  const d=window.invData;
  const byType={};
  d.items.forEach(item=>{if(!byType[item.type])byType[item.type]=[];byType[item.type].push(item);});

  let html=`<div style="padding:16px;font-family:'Noto Serif SC',serif;color:#e2e8f0">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px">
    <div style="font-size:1.3em;color:#fbbf24;font-weight:bold">🎒 Kho Đồ V28</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <span style="background:#1a1000;border:1px solid #854d0e;padding:4px 10px;border-radius:8px;font-size:0.85em">💰 ${d.gold.toLocaleString()} vàng</span>
      <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.82em">📦 ${d.items.length} loại</span>
      <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.82em">💎 ${d.totalValue.toLocaleString()} giá trị</span>
    </div>
  </div>
  <!-- ITEM TYPES FILTER -->
  <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
    ${Object.entries(ITEM_TYPES).map(([k,t])=>`<div style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.8em">${t.icon} ${t.name} (${d.items.filter(i=>i.type===k).length})</div>`).join("")}
  </div>
  <!-- ITEMS BY CATEGORY -->
  ${Object.entries(byType).map(([type,items])=>{
    const typeInfo=ITEM_TYPES[type]||{name:type,icon:"📦",color:"#94a3b8"};
    return `<div style="margin-bottom:12px"><div style="color:${typeInfo.color};font-weight:bold;margin-bottom:6px">${typeInfo.icon} ${typeInfo.name} (${items.length})</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px">
      ${items.map(item=>`<div style="background:#0f172a;border:1px solid ${RARITY_COLORS[item.rarity]||'#334155'};border-radius:8px;padding:8px;cursor:pointer" title="${item.desc}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <span style="font-size:1.2em">${item.icon}</span>
          <span style="background:${RARITY_COLORS[item.rarity]}22;color:${RARITY_COLORS[item.rarity]};font-size:0.7em;padding:1px 5px;border-radius:4px">${item.rarity}</span>
        </div>
        <div style="color:#e2e8f0;font-size:0.85em;font-weight:bold;margin-top:4px">${item.name}${item.qty>1?` x${item.qty}`:''}</div>
        <div style="color:#64748b;font-size:0.75em;margin-top:2px">${item.desc}</div>
        <div style="color:#fbbf24;font-size:0.78em;margin-top:4px">💰 ${(item.value*item.qty).toLocaleString()}</div>
      </div>`).join("")}
    </div></div>`;
  }).join("")||`<div style="text-align:center;color:#475569;padding:24px">Kho đồ trống. Hãy phiêu lưu để tìm kiếm báu vật!</div>`}
  <!-- ITEM POOL PREVIEW -->
  <div style="margin-top:12px"><div style="color:#64748b;font-weight:bold;margin-bottom:6px">📋 Vật Phẩm Có Thể Tìm Thấy</div>
  <div style="display:flex;flex-wrap:wrap;gap:5px">${ITEM_POOL.map(i=>`<div style="background:#1e293b;padding:4px 8px;border-radius:6px;font-size:0.78em;border-left:2px solid ${RARITY_COLORS[i.rarity]}">${i.icon} ${i.name}</div>`).join("")}</div></div>
  <!-- LOG -->
  <div style="margin-top:12px"><div style="color:#64748b;font-weight:bold;margin-bottom:6px;font-size:0.9em">📋 Nhật Ký Kho Đồ</div><div style="max-height:120px;overflow-y:auto;background:#0f172a;border-radius:8px;padding:8px;font-size:0.8em">${d.log.slice(0,15).map(e=>`<div style="border-bottom:1px solid #1e293b;padding:3px 0;color:#94a3b8">[${e.year}] ${e.msg}</div>`).join("")||'<div style="color:#475569">Chưa có.</div>'}</div></div>
  </div>`;
  el.innerHTML=html;
};

function invInit(){
  invLoad();
  // Give starting items
  if(window.invData.acquired===0){
    window.invAddItem("iron",5); window.invAddItem("qi_pill",2); window.invAddItem("iron_sword",1);
  }
  window.invData.initialized=true;
  const _o=window.gameTick; window.gameTick=function(){if(_o)_o(); try{invTick();}catch(e){}};
  console.log("[PlayerInventoryV28] 🎒 Kho Đồ V28 khởi động — 16 vật phẩm · 10 loại · Trang bị · Tự động loot ✓");
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(invInit,INIT_DELAY));
else setTimeout(invInit,INIT_DELAY);
})();
