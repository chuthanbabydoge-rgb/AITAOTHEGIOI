(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // TIMELINE WAR ENGINE V36 — Chiến Tranh Giữa Các Dòng Thời Gian
  // Xâm lược · Chinh phục · Xóa bỏ dòng thời gian
  // ═══════════════════════════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_timeline_war_v36";

  const TL_WAR_TYPES = [
    { id:"invasion",   name:"⚔️ Xâm Lược Thời Gian",   color:"#ef4444", dmgA:-10, dmgD:-20, desc:"Quân đội xâm nhập dòng thời gian khác",    dur:30 },
    { id:"conquest",   name:"🏆 Chinh Phục Thời Gian",  color:"#f97316", dmgA:-5,  dmgD:-30, desc:"Chiếm đoạt toàn bộ tài nguyên dòng thời gian",dur:50 },
    { id:"erasure",    name:"💀 Xóa Bỏ Thời Gian",      color:"#7c3aed", dmgA:-15, dmgD:-50, desc:"Xóa sổ dòng thời gian khỏi sự tồn tại",     dur:20 },
    { id:"corruption", name:"🌑 Ô Nhiễm Thời Gian",     color:"#6366f1", dmgA:-5,  dmgD:-15, desc:"Làm ô nhiễm fabric thời gian của đối thủ",   dur:40 }
  ];

  function defaultData() {
    return { wars: [], history: [], tick: 0, totalWars: 0, totalVictors: {} };
  }

  window.twData = window.twData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.twData)); } catch(e) {} }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { const p = JSON.parse(raw); if (p && p.wars) window.twData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  let _idCtr = 1;
  function newId() { return "tww_" + Date.now() + "_" + (_idCtr++); }

  // ─── Khai chiến ───────────────────────────────────────────────────────────
  window.twDeclareWar = function(attackTlId, defendTlId, warTypeId) {
    const wtype = TL_WAR_TYPES.find(t => t.id === warTypeId) || TL_WAR_TYPES[0];
    const atk   = window.tlGetById && window.tlGetById(attackTlId);
    const def   = window.tlGetById && window.tlGetById(defendTlId);
    if (!atk || !def || atk.id === def.id) return null;
    if (atk.status !== "active" || def.status !== "active") return null;

    const existing = window.twData.wars.find(w =>
      w.status === "ongoing" &&
      ((w.attackerId === attackTlId && w.defenderId === defendTlId) ||
       (w.attackerId === defendTlId && w.defenderId === attackTlId)));
    if (existing) return existing;

    const war = {
      id:         newId(),
      type:       wtype.id,
      typeName:   wtype.name,
      typeColor:  wtype.color,
      attackerId: attackTlId, attackerName: atk.name,
      defenderId: defendTlId, defenderName: def.name,
      status:     "ongoing",
      startYear:  window.year || 0,
      endYear:    (window.year||0) + wtype.dur,
      duration:   wtype.dur,
      atkPower:   atk.power || 100,
      defPower:   def.power || 100,
      winner:     null,
      desc:       wtype.desc
    };

    window.twData.wars.push(war);
    window.twData.totalWars++;

    if (typeof window.tlLog === "function") window.tlLog(`⚔️ ${wtype.name}: "${atk.name}" tấn công "${def.name}"!`);
    if (typeof window.htAddEvent === "function") window.htAddEvent({ year: window.year||0, desc:`${wtype.name}: "${atk.name}" vs "${def.name}"`, type:"timeline_war_declared", source:"timeline_war" });
    save(); return war;
  };

  function resolveWar(war) {
    const atk  = window.tlGetById && window.tlGetById(war.attackerId);
    const def  = window.tlGetById && window.tlGetById(war.defenderId);
    const wtype= TL_WAR_TYPES.find(t => t.id === war.type) || TL_WAR_TYPES[0];

    const atkRoll = (war.atkPower || 100) * (0.4 + Math.random() * 0.8);
    const defRoll = (war.defPower || 100) * (0.4 + Math.random() * 0.8);
    const atkWon  = atkRoll > defRoll;

    war.status     = "ended";
    war.winner     = atkWon ? war.attackerId : war.defenderId;
    war.winnerName = atkWon ? war.attackerName : war.defenderName;

    window.twData.totalVictors[war.winner] = (window.twData.totalVictors[war.winner] || 0) + 1;

    if (atk && atk.status === "active") atk.stability = Math.max(1, atk.stability + (wtype.dmgA || -10));
    if (def && def.status === "active") {
      def.stability = Math.max(1, def.stability + (wtype.dmgD || -20));
      if (war.type === "erasure" && def.stability < 10) window.tlDestroyTimeline && window.tlDestroyTimeline(def.id);
    }

    const winner = window.tlGetById && window.tlGetById(war.winner);
    if (winner && winner.status === "active") {
      winner.power = Math.floor((winner.power || 100) * 1.15);
      winner.kingdoms = Math.min(80, (winner.kingdoms || 0) + 3);
    }

    window.twData.history.unshift({ ...war });
    if (window.twData.history.length > 50) window.twData.history.length = 50;

    if (typeof window.tlLog === "function") window.tlLog(`🏆 ${wtype.name} kết thúc: "${war.winnerName}" chiến thắng!`);
    if (typeof window.htAddEvent === "function") window.htAddEvent({ year: window.year||0, desc:`"${war.winnerName}" thắng ${wtype.name} với "${atkWon?war.defenderName:war.attackerName}"`, type:"timeline_war_ended", source:"timeline_war" });
    try { localStorage.setItem("cgv6_timeline_engine_v36", JSON.stringify(window.tlData)); } catch(e) {}
    save();
  }

  window.twAutoWar = function() {
    const active = window.tlGetActiveTimelines ? window.tlGetActiveTimelines() : [];
    if (active.length < 2) return;
    const shuffled = active.slice().sort(() => Math.random() - 0.5);
    const wtype = TL_WAR_TYPES[Math.floor(Math.random() * TL_WAR_TYPES.length)];
    window.twDeclareWar(shuffled[0].id, shuffled[1].id, wtype.id);
  };

  window.twGetActiveWars = function() { return window.twData.wars.filter(w => w.status === "ongoing"); };
  window.twGetHistory    = function() { return window.twData.history; };
  window.twGetWarTypes   = function() { return TL_WAR_TYPES; };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  window.twRenderPanel = function() {
    const el = document.getElementById("panel-timeline-wars-v36");
    if (!el) return;
    const activeWars = window.twGetActiveWars();
    const history    = window.twGetHistory().slice(0, 15);
    const types      = TL_WAR_TYPES;
    const timelines  = window.tlGetActiveTimelines ? window.tlGetActiveTimelines() : [];

    el.innerHTML = `
<div style="padding:16px;font-family:'Noto Serif SC',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
    <div>
      <h2 style="margin:0;font-size:20px;color:#ef4444;font-family:Cinzel,serif">⚔️ Chiến Tranh Dòng Thời Gian V36</h2>
      <div style="font-size:11px;color:#64748b;margin-top:2px">${activeWars.length} cuộc chiến đang diễn ra · ${window.twData.totalWars} tổng</div>
    </div>
    <div style="display:flex;gap:8px">
      <button onclick="twAutoWar();twRenderPanel()" style="padding:6px 14px;background:linear-gradient(135deg,#ef4444,#dc2626);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:12px">⚔️ Khai Chiến Ngẫu Nhiên</button>
      <button onclick="twRenderDeclareModal()" style="padding:6px 14px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:12px">+ Khai Chiến</button>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-bottom:18px">
    ${types.map(t=>`<div style="background:#0f172a;border:1px solid ${activeWars.some(w=>w.type===t.id)?t.color+"44":"#1e293b"};border-radius:8px;padding:8px;text-align:center"><div style="font-size:16px;font-weight:700;color:${t.color}">${activeWars.filter(w=>w.type===t.id).length}</div><div style="font-size:10px;color:#64748b">${t.name}</div></div>`).join("")}
  </div>

  ${activeWars.length > 0 ? `
  <div style="margin-bottom:18px">
    <div style="font-size:13px;color:#ef4444;font-weight:600;margin-bottom:8px">🔥 ĐANG DIỄN RA (${activeWars.length})</div>
    <div style="display:grid;gap:10px">
      ${activeWars.map(w=>`
      <div style="background:#0f172a;border:1px solid #ef444444;border-radius:10px;padding:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:8px">
          <span style="font-size:12px;font-weight:700;color:${w.typeColor}">${w.typeName}</span>
          <span style="font-size:10px;color:#64748b">Năm ${w.startYear} — Kết thúc ~${w.endYear}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center">
          <div style="background:#1e293b;border-radius:6px;padding:8px;text-align:center">
            <div style="font-size:10px;color:#94a3b8">TẤN CÔNG</div>
            <div style="font-size:12px;font-weight:700;color:#ef4444">${w.attackerName}</div>
          </div>
          <div style="font-size:18px;text-align:center">⚔️</div>
          <div style="background:#1e293b;border-radius:6px;padding:8px;text-align:center">
            <div style="font-size:10px;color:#94a3b8">PHÒNG THỦ</div>
            <div style="font-size:12px;font-weight:700;color:#8b5cf6">${w.defenderName}</div>
          </div>
        </div>
        <div style="margin-top:8px;height:3px;background:#1e293b;border-radius:2px;overflow:hidden">
          <div style="height:100%;background:linear-gradient(to right,#ef4444,#8b5cf6);width:${Math.min(100,Math.max(0,((window.year||0)-w.startYear)/w.duration*100))}%"></div>
        </div>
      </div>`).join("")}
    </div>
  </div>` : `<div style="text-align:center;padding:30px;color:#475569;background:#0f172a;border-radius:8px;margin-bottom:18px"><div style="font-size:40px">⚔️</div><div style="margin-top:8px">Không có chiến tranh đang diễn ra</div></div>`}

  ${history.length > 0 ? `
  <div>
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:8px">📜 LỊCH SỬ CHIẾN TRANH</div>
    <div style="display:grid;gap:5px">
      ${history.map(w=>`
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:6px;padding:10px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px">
        <div><span style="font-size:11px;color:${w.typeColor}">${w.typeName}</span><div style="font-size:12px;color:#e2e8f0;margin-top:2px">${w.attackerName} vs ${w.defenderName}</div></div>
        <div style="text-align:right"><div style="font-size:11px;color:#fbbf24;font-weight:600">🏆 ${w.winnerName||"?"}</div><div style="font-size:10px;color:#64748b">Năm ${w.startYear}–${w.endYear}</div></div>
      </div>`).join("")}
    </div>
  </div>` : ""}
</div>`;
  };

  window.twRenderDeclareModal = function() {
    const timelines = window.tlGetActiveTimelines ? window.tlGetActiveTimelines() : [];
    if (timelines.length < 2) { alert("Cần ít nhất 2 dòng thời gian!"); return; }
    const types = TL_WAR_TYPES;
    const modal = document.createElement("div");
    modal.id = "tw-modal";
    modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:#000000cc;z-index:9999;display:flex;align-items:center;justify-content:center";
    modal.innerHTML = `
<div style="background:#0f172a;border:1px solid #ef4444;border-radius:12px;padding:24px;width:400px;max-width:90vw;font-family:'Noto Serif SC',serif">
  <h3 style="margin:0 0 14px;color:#ef4444;font-family:Cinzel,serif">⚔️ Khai Chiến</h3>
  <div style="margin-bottom:10px"><label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Loại chiến tranh</label><select id="tw-type-sel" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:12px">${types.map(t=>`<option value="${t.id}">${t.name} — ${t.desc}</option>`).join("")}</select></div>
  <div style="margin-bottom:10px"><label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Tấn công</label><select id="tw-atk-sel" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:12px">${timelines.map(t=>`<option value="${t.id}">${t.name}</option>`).join("")}</select></div>
  <div style="margin-bottom:16px"><label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Phòng thủ</label><select id="tw-def-sel" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:12px">${timelines.map(t=>`<option value="${t.id}">${t.name}</option>`).join("")}</select></div>
  <div style="display:flex;gap:10px">
    <button onclick="const t=document.getElementById('tw-type-sel').value;const a=document.getElementById('tw-atk-sel').value;const d=document.getElementById('tw-def-sel').value;if(a===d){alert('Hai dòng thời gian phải khác nhau!')}else{twDeclareWar(a,d,t);document.getElementById('tw-modal').remove();twRenderPanel()}" style="flex:1;padding:10px;background:linear-gradient(135deg,#ef4444,#dc2626);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:13px">⚔️ Khai Chiến!</button>
    <button onclick="document.getElementById('tw-modal').remove()" style="padding:10px 16px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:13px">Hủy</button>
  </div>
</div>`;
    document.body.appendChild(modal);
  };

  // ─── gameTick ─────────────────────────────────────────────────────────────
  const _prevTick = window.gameTick;
  window.gameTick = function() {
    if (typeof _prevTick === "function") _prevTick();
    window.twData.tick++;
    const cur = window.year || 0;
    window.twData.wars.filter(w => w.status === "ongoing" && cur >= w.endYear).forEach(resolveWar);
    if (window.twData.tick % 200 === 0 && Math.random() < 0.15) window.twAutoWar();
    if (window.twData.tick % 30 === 0) save();
  };

  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() { load(); console.log("[TimelineWarEngine V36] ⚔️ Chiến tranh dòng thời gian sẵn sàng."); }, 3400);
  });
})();
