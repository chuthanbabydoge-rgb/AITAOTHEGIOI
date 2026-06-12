(function() {
"use strict";
// ============================================================
// CULTIVATION PLAYER ENGINE V28 — Creator God V6
// Tu Luyện Người Chơi: 6 Giai Đoạn · Đột Phá · Kỹ Năng · Tâm Cảnh
// ============================================================
const SAVE_KEY = "cgv6_cultivation_v28";
const INIT_DELAY = 4800;

const CULTIVATION_STAGES = [
  {
    id:"luyen_khi", level:1, name:"Luyện Khí", icon:"💨", color:"#94a3b8",
    sub:["Luyện Khí Sơ Cấp","Luyện Khí Trung Cấp","Luyện Khí Cao Cấp","Luyện Khí Tối Cấp","Luyện Khí Viên Mãn"],
    maxSub:5, baseXpPerSub:100,
    abilities:["Cảm thụ linh khí","Cơ bản võ công","Thể chất tăng x2"],
    desc:"Bước đầu tiên trên con đường tu tiên, cảm thụ và tích lũy linh khí."
  },
  {
    id:"thiet_lap",  level:2, name:"Thiết Lập Nền Tảng", icon:"🏛️", color:"#4ade80",
    sub:["Nền Tảng Thấp","Nền Tảng Trung","Nền Tảng Cao","Hoàng Kim Nền Tảng"],
    maxSub:4, baseXpPerSub:300,
    abilities:["Phi hành cơ bản","Linh lực bảo hộ","Tuổi thọ 300 năm","Tâm kinh sơ cấp"],
    desc:"Xây dựng nền tảng tu tiên vững chắc, tích lũy linh lực căn bản."
  },
  {
    id:"kim_dan",  level:3, name:"Kim Đan", icon:"⚪", color:"#fbbf24",
    sub:["Kim Đan Sơ","Kim Đan Trung","Kim Đan Đại","Kim Đan Đỉnh Phong"],
    maxSub:4, baseXpPerSub:1000,
    abilities:["Pháp thuật chân chính","Tuổi thọ 1000 năm","Thần thức sơ mở","Bay lên không trung"],
    desc:"Kết thành Kim Đan trong đan điền, bước vào cảnh giới thực sự của tu tiên."
  },
  {
    id:"nguyen_hon", level:4, name:"Nguyên Hồn", icon:"👻", color:"#a78bfa",
    sub:["Nguyên Hồn Sơ Hình","Nguyên Hồn Trung Kỳ","Nguyên Hồn Hậu Kỳ","Nguyên Hồn Đại Viên Mãn"],
    maxSub:4, baseXpPerSub:5000,
    abilities:["Thần hồn phân thân","Tuổi thọ vạn năm","Không gian Nội Thế Giới","Pháp thuật tối cao"],
    desc:"Đưa nguyên hồn ra khỏi thân xác, sức mạnh tăng vọt phi thường."
  },
  {
    id:"chuyen_hoa", level:5, name:"Chuyển Hóa Linh Hồn", icon:"🌀", color:"#38bdf8",
    sub:["Chuyển Hóa Sơ","Chuyển Hóa Trung","Chuyển Hóa Đại Thành"],
    maxSub:3, baseXpPerSub:20000,
    abilities:["Thần lực hóa hình","Trú thể thần tiên","Thiên nhãn thông","Tuổi thọ vô hạn sơ bộ"],
    desc:"Linh hồn chuyển hóa, thoát khỏi ràng buộc của thế giới vật chất."
  },
  {
    id:"thang_thien", level:6, name:"Thăng Thiên", icon:"✨", color:"#fde68a",
    sub:["Tán Tiên","Địa Tiên","Thiên Tiên","Chân Tiên","Đại La Tiên"],
    maxSub:5, baseXpPerSub:100000,
    abilities:["Thăng lên cõi thiên","Vĩnh hằng bất diệt","Toàn năng thiên tiên","Ngang hàng thiên đình"],
    desc:"Cảnh giới tối thượng. Vượt thoát cõi phàm, đặt chân lên đỉnh trời."
  },
];

const BREAKTHROUGH_ITEMS = [
  "Tiên Đan Đột Phá","Linh Thảo Ngàn Năm","Thiên Địa Linh Khí","Nhân Sâm Vạn Năm","Cổ Kinh Bí Pháp"
];

function _rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}

window.cultivationData = {
  stageId: "luyen_khi",
  stageLevel: 1,
  subStage: 0,       // 0-indexed within current stage
  cultivationXp: 0,
  xpToNextSub: 100,
  totalXp: 0,
  breakthroughs: 0,
  failedBreakthroughs: 0,
  abilities: [],
  pills: 0,          // pills available to use
  meditationBonus: 1.0,
  log: [],
  tickCount: 0,
  initialized: false,
};

function culSave(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(window.cultivationData));}catch(e){}}
function culLoad(){try{const d=localStorage.getItem(SAVE_KEY);if(d) Object.assign(window.cultivationData,JSON.parse(d));}catch(e){}}
function culLog(msg,type){window.cultivationData.log.unshift({year:window.year||0,msg,type:type||"info"});if(window.cultivationData.log.length>150)window.cultivationData.log.pop();if(typeof window.htAddEvent==="function")window.htAddEvent({year:window.year||0,type:"cultivation",title:msg,color:"#a78bfa"});}

function culGetCurrentStage(){return CULTIVATION_STAGES.find(s=>s.id===window.cultivationData.stageId)||CULTIVATION_STAGES[0];}

// ─── XP GAIN ─────────────────────────────────────────────────
window.culAddXP = function(amount){
  const d=window.cultivationData;
  d.cultivationXp+=Math.floor(amount*d.meditationBonus);
  d.totalXp+=amount;
  culCheckSubBreakthrough();
};

function culCheckSubBreakthrough(){
  const d=window.cultivationData;
  if(d.cultivationXp<d.xpToNextSub) return;
  const stage=culGetCurrentStage();
  if(d.subStage>=stage.maxSub-1){
    // Stage breakthrough!
    const nextStage=CULTIVATION_STAGES.find(s=>s.level===stage.level+1);
    if(!nextStage){culLog("✨ ĐẠT ĐỈNH THĂNG THIÊN — Thần Tiên Viên Mãn!","peak"); return;}
    const success=Math.random()<(0.7-stage.level*0.08); // harder at higher stages
    if(success){
      d.cultivationXp=0; d.subStage=0; d.stageId=nextStage.id; d.stageLevel=nextStage.level;
      d.xpToNextSub=nextStage.baseXpPerSub;
      d.breakthroughs++;
      nextStage.abilities.forEach(ab=>{ if(!d.abilities.includes(ab)) d.abilities.push(ab); });
      culLog(`🌟 ĐỘT PHÁ THÀNH CÔNG! ${stage.name} → ${nextStage.name}!`,"breakthrough");
      if(typeof window.playerAddXP==="function") window.playerAddXP(500,"cultivation_breakthrough");
      if(typeof window.playerAddFame==="function") window.playerAddFame(nextStage.level*300);
      if(typeof window.wmeAddMemory==="function") window.wmeAddMemory({year:window.year||0,category:"cultivation",title:`Đột Phá: ${nextStage.name}`,content:`${window.playerV28Data?.name||'Tu Sĩ'} đột phá lên ${nextStage.name}!`});
    } else {
      d.cultivationXp=Math.floor(d.xpToNextSub*0.7);
      d.failedBreakthroughs++;
      culLog(`💥 Đột phá ${nextStage.name} THẤT BẠI! Cần chuẩn bị kỹ hơn.`,"fail");
    }
  } else {
    d.cultivationXp-=d.xpToNextSub; d.subStage++;
    d.xpToNextSub=Math.floor(stage.baseXpPerSub*(1+d.subStage*0.5));
    const subName=stage.sub[d.subStage]||`Cảnh Thứ ${d.subStage+1}`;
    culLog(`⬆️ Đạt ${stage.name} — ${subName}!`,"sublevel");
    if(typeof window.playerAddXP==="function") window.playerAddXP(50,"cultivation");
  }
}

// ─── USE PILL ─────────────────────────────────────────────────
window.culUsePill = function(){
  const d=window.cultivationData;
  if(d.pills<=0) return "Không có đan dược!";
  d.pills--;
  const bonus=_rand(100,500);
  window.culAddXP(bonus);
  culLog(`💊 Dùng đan dược — Tu vi tăng ${bonus} điểm!`,"pill");
  return `Dùng thành công! +${bonus} tu vi.`;
};

// ─── PASSIVE CULTIVATION ──────────────────────────────────────
function culTick(){
  const d=window.cultivationData;
  d.tickCount++;
  if(!d.initialized) return;
  if(d.tickCount%5===0){
    // Check pills from inventory
    if(typeof window.invData!=="undefined"){
      const pillItem=window.invData.items.find(i=>i.type==="pill");
      if(pillItem&&pillItem.qty>0) d.pills=pillItem.qty;
    }
    // Passive XP
    const passiveRate=1+Math.floor(d.stageLevel*0.5)+(window.playerV28Data?Math.floor(window.playerV28Data.rankLevel*0.3):0);
    window.culAddXP(passiveRate);
  }
  if(d.tickCount%30===0) culSave();
}

window.culRenderPanel=function(){
  const el=document.getElementById("panel-ascension-v28"); if(!el){
    // Try to find the ascension panel to render into it
    return;
  }
  // If ascensionEngine already rendered, append cultivation section
};

window.culRenderSection=function(containerId){
  const el=document.getElementById(containerId||"panel-ascension-v28");if(!el) return;
  const d=window.cultivationData;
  const stage=culGetCurrentStage();
  const subName=stage.sub[d.subStage]||`Cảnh Thứ ${d.subStage+1}`;
  const xpPct=Math.min(100,Math.round((d.cultivationXp/d.xpToNextSub)*100));

  let html=`<div style="border-top:1px solid #334155;margin-top:16px;padding-top:14px">
  <div style="color:#a78bfa;font-weight:bold;margin-bottom:10px">🧘 Tu Luyện — ${stage.name} · ${subName}</div>
  <!-- STAGE PROGRESS -->
  <div style="background:linear-gradient(135deg,${stage.color}11,#0f172a);border:1px solid ${stage.color};border-radius:10px;padding:12px;margin-bottom:12px">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
      <div><span style="font-size:1.4em">${stage.icon}</span> <span style="color:${stage.color};font-weight:bold;font-size:1.1em">${stage.name}</span> — <span style="color:#94a3b8">${subName}</span></div>
      <div style="font-size:0.82em;color:#64748b">Đột phá: ${d.breakthroughs} thành · ${d.failedBreakthroughs} thất bại</div>
    </div>
    <div style="margin-top:8px"><div style="display:flex;justify-content:space-between;font-size:0.8em;color:#64748b;margin-bottom:4px"><span>Tu Vi</span><span>${d.cultivationXp} / ${d.xpToNextSub}</span></div>
    <div style="background:#0f172a;height:8px;border-radius:6px"><div style="background:linear-gradient(90deg,${stage.color},#fff);height:8px;border-radius:6px;width:${xpPct}%"></div></div></div>
    <div style="margin-top:8px;font-size:0.8em;color:#64748b">${stage.desc}</div>
  </div>
  <!-- STAGE LADDER -->
  <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px">
    ${CULTIVATION_STAGES.map(s=>`<div style="background:${d.stageLevel>=s.level?s.color+'22':'#0f172a'};border:1px solid ${d.stageLevel>=s.level?s.color:'#334155'};border-radius:6px;padding:4px 8px;font-size:0.8em;${d.stageId===s.id?'outline:2px solid '+s.color+';':''}">${s.icon} <span style="color:${d.stageLevel>=s.level?s.color:'#475569'}">${s.name}</span></div>`).join("")}
  </div>
  <!-- ABILITIES -->
  ${d.abilities.length?`<div style="margin-bottom:10px"><div style="color:#4ade80;font-weight:bold;margin-bottom:5px">🔓 Năng Lực Đã Có</div><div style="display:flex;flex-wrap:wrap;gap:4px">${d.abilities.map(a=>`<span style="background:#1e293b;padding:3px 8px;border-radius:6px;font-size:0.8em;color:#4ade80">✓ ${a}</span>`).join("")}</div></div>`:''}
  <!-- ACTIONS -->
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    <button onclick="alert(typeof window.culUsePill==='function'?window.culUsePill():'')" style="background:#a78bfa22;border:1px solid #a78bfa;color:#a78bfa;padding:7px 14px;border-radius:8px;cursor:pointer;font-size:0.85em">💊 Dùng Đan Dược (${d.pills} còn lại)</button>
  </div>
  <!-- CULTIVATION LOG -->
  <div style="margin-top:10px"><div style="color:#64748b;font-size:0.85em;font-weight:bold;margin-bottom:5px">📋 Tu Vi Nhật Ký</div><div style="max-height:120px;overflow-y:auto;background:#0f172a;border-radius:8px;padding:8px;font-size:0.8em">${d.log.slice(0,10).map(e=>`<div style="border-bottom:1px solid #1e293b;padding:3px 0;color:${e.type==='breakthrough'?'#fbbf24':e.type==='fail'?'#f87171':e.type==='sublevel'?'#a78bfa':'#94a3b8'}">[${e.year}] ${e.msg}</div>`).join("")||'<div style="color:#475569">Chưa có sự kiện.</div>'}</div></div>
  </div>`;
  el.innerHTML=(el.innerHTML||"")+html;
};

function culInit(){
  culLoad();
  // Init first stage abilities
  if(window.cultivationData.abilities.length===0){
    CULTIVATION_STAGES[0].abilities.forEach(ab=>{if(!window.cultivationData.abilities.includes(ab)) window.cultivationData.abilities.push(ab);});
  }
  window.cultivationData.initialized=true;
  const _o=window.gameTick; window.gameTick=function(){if(_o)_o(); try{culTick();}catch(e){}};
  console.log("[CultivationPlayerV28] 🧘 Tu Luyện V28 khởi động — 6 giai đoạn · Đột Phá · 30 cảnh giới ✓");
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(culInit,INIT_DELAY));
else setTimeout(culInit,INIT_DELAY);
})();
