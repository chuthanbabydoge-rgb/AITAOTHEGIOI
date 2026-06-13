(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTIVERSE WAR ENGINE V35 — Chiến Tranh Liên Vũ Trụ
  // ═══════════════════════════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_multiverse_war_v35";

  const WAR_TYPES = [
    { id:"universe_war",   name:"⚔️ Chiến Tranh Vũ Trụ",  color:"#ef4444", desc:"Hai vũ trụ khai chiến toàn diện",          dmg:20  },
    { id:"realm_war",      name:"🌋 Chiến Tranh Cõi Giới", color:"#f97316", desc:"Tranh giành cõi giới tu luyện",             dmg:12  },
    { id:"divine_invasion",name:"✨ Xâm Lược Thần Thánh",  color:"#fbbf24", desc:"Thần linh xâm chiếm vũ trụ khác",          dmg:30  },
    { id:"empire_expand",  name:"🏰 Đế Quốc Mở Rộng",     color:"#8b5cf6", desc:"Đế chế mở rộng sang vũ trụ lân cận",       dmg:8   }
  ];

  function defaultData() {
    return {
      wars:    [],
      history: [],
      tick:    0,
      totalWars: 0,
      totalVictors: {}
    };
  }

  window.mwData = window.mwData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.mwData)); } catch(e) {} }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { const p = JSON.parse(raw); if (p && p.wars) window.mwData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  let _idCtr = 1;
  function newId() { return "mwar_" + Date.now() + "_" + (_idCtr++); }

  // ─── Khai chiến ───────────────────────────────────────────────────────────
  window.mwDeclareWar = function(attackerUid, defenderUid, warTypeId) {
    const wtype    = WAR_TYPES.find(t => t.id === warTypeId) || WAR_TYPES[0];
    const attacker = window.mvGetUniverseById && window.mvGetUniverseById(attackerUid);
    const defender = window.mvGetUniverseById && window.mvGetUniverseById(defenderUid);
    if (!attacker || !defender || attacker.id === defender.id) return null;
    if (attacker.status !== "active" || defender.status !== "active") return null;

    const existing = window.mwData.wars.find(w =>
      w.status === "ongoing" &&
      ((w.attackerUid === attackerUid && w.defenderUid === defenderUid) ||
       (w.attackerUid === defenderUid && w.defenderUid === attackerUid)));
    if (existing) return existing;

    const duration = Math.floor(Math.random()*50)+20;
    const war = {
      id:           newId(),
      type:         wtype.id,
      typeName:     wtype.name,
      typeColor:    wtype.color,
      attackerUid,
      attackerName: attacker.name,
      defenderUid,
      defenderName: defender.name,
      status:       "ongoing",
      startYear:    window.year || 0,
      endYear:      (window.year||0) + duration,
      duration,
      attackerPower: attacker.power,
      defenderPower: defender.power,
      rounds:        [],
      winner:        null,
      desc:          wtype.desc
    };

    window.mwData.wars.push(war);
    window.mwData.totalWars++;

    mwLog(`⚔️ ${wtype.name}: "${attacker.name}" tấn công "${defender.name}"!`);
    if (typeof window.htAddEvent === "function") window.htAddEvent({ year: window.year||0, desc:`${wtype.name}: "${attacker.name}" → "${defender.name}"`, type:"universe_war_declared", source:"multiverse_war" });
    save(); return war;
  };

  // ─── Giải quyết chiến tranh ───────────────────────────────────────────────
  function resolveWar(war) {
    const attacker = window.mvGetUniverseById && window.mvGetUniverseById(war.attackerUid);
    const defender = window.mvGetUniverseById && window.mvGetUniverseById(war.defenderUid);
    const wtype    = WAR_TYPES.find(t => t.id === war.type) || WAR_TYPES[0];

    const atkRoll = (war.attackerPower || 100) * (0.5 + Math.random());
    const defRoll = (war.defenderPower || 100) * (0.5 + Math.random());

    const winnerUid   = atkRoll > defRoll ? war.attackerUid   : war.defenderUid;
    const winnerName  = atkRoll > defRoll ? war.attackerName  : war.defenderName;
    const loserUid    = atkRoll > defRoll ? war.defenderUid   : war.attackerUid;
    const loserName   = atkRoll > defRoll ? war.defenderName  : war.attackerName;

    war.status = "ended";
    war.winner = winnerUid;
    war.winnerName = winnerName;

    window.mwData.totalVictors[winnerUid] = (window.mwData.totalVictors[winnerUid] || 0) + 1;

    // Hậu quả
    const loser = window.mvGetUniverseById && window.mvGetUniverseById(loserUid);
    if (loser && loser.status === "active") {
      loser.stability = Math.max(1, loser.stability - wtype.dmg);
      loser.population = Math.floor(loser.population * (1 - wtype.dmg/200));
    }
    const winner = window.mvGetUniverseById && window.mvGetUniverseById(winnerUid);
    if (winner && winner.status === "active") {
      winner.power = Math.floor(winner.power * 1.1);
      winner.kingdoms = Math.min(100, winner.kingdoms + 2);
    }

    window.mwData.history.unshift({ ...war });
    if (window.mwData.history.length > 50) window.mwData.history.length = 50;

    mwLog(`🏆 ${war.typeName} kết thúc: "${winnerName}" chiến thắng trước "${loserName}"!`);
    if (typeof window.htAddEvent === "function") window.htAddEvent({ year: window.year||0, desc:`"${winnerName}" đánh bại "${loserName}" trong ${war.typeName}`, type:"universe_war_ended", source:"multiverse_war" });
    save();
  }

  // ─── Auto war ─────────────────────────────────────────────────────────────
  window.mwAutoWar = function() {
    if (!window.mvData || !window.mvData.universes) return;
    const active = window.mvData.universes.filter(u => u.status === "active");
    if (active.length < 2) return;
    const shuffled = active.slice().sort(() => Math.random()-0.5);
    const wtype    = WAR_TYPES[Math.floor(Math.random()*WAR_TYPES.length)];
    window.mwDeclareWar(shuffled[0].id, shuffled[1].id, wtype.id);
  };

  function mwLog(msg) {
    if (typeof window.addLog === "function") window.addLog("[MV-WAR] " + msg);
    if (typeof window.mvLog === "function") window.mvLog(msg);
  }

  window.mwGetActiveWars  = function() { return window.mwData.wars.filter(w => w.status === "ongoing"); };
  window.mwGetWarHistory  = function() { return window.mwData.history; };
  window.mwGetWarTypes    = function() { return WAR_TYPES; };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  window.mwRenderPanel = function() {
    const el = document.getElementById("panel-universe-wars");
    if (!el) return;
    const active   = window.mwGetActiveWars();
    const history  = window.mwGetWarHistory().slice(0, 20);
    const types    = WAR_TYPES;
    const universes= (window.mvData && window.mvData.universes) ? window.mvData.universes.filter(u=>u.status==="active") : [];

    el.innerHTML = `
<div style="padding:16px;font-family:'Noto Serif SC',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
    <div>
      <h2 style="margin:0;font-size:20px;color:#ef4444;font-family:Cinzel,serif">⚔️ Chiến Tranh Liên Vũ Trụ V35</h2>
      <div style="font-size:11px;color:#64748b;margin-top:2px">${active.length} cuộc chiến đang diễn ra · ${window.mwData.totalWars} tổng chiến tranh</div>
    </div>
    <div style="display:flex;gap:8px">
      <button onclick="mwAutoWar();mwRenderPanel()" style="padding:6px 14px;background:linear-gradient(135deg,#ef4444,#dc2626);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:12px">⚔️ Khai Chiến Ngẫu Nhiên</button>
      <button onclick="mwRenderDeclareModal()" style="padding:6px 14px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:12px">+ Khai Chiến</button>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:20px">
    ${types.map(t => {
      const cnt = active.filter(w=>w.type===t.id).length;
      return `<div style="background:#0f172a;border:1px solid ${cnt>0?t.color+"44":"#1e293b"};border-radius:8px;padding:10px;text-align:center">
        <div style="font-size:18px;font-weight:700;color:${t.color}">${cnt}</div>
        <div style="font-size:10px;color:#64748b">${t.name}</div>
      </div>`;
    }).join("")}
  </div>

  ${active.length > 0 ? `
  <div style="margin-bottom:20px">
    <div style="font-size:13px;color:#ef4444;font-weight:600;margin-bottom:8px">🔥 CHIẾN TRANH ĐANG DIỄN RA (${active.length})</div>
    <div style="display:grid;gap:10px">
      ${active.map(w=>`
      <div style="background:#0f172a;border:1px solid #ef444444;border-radius:10px;padding:14px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px">
          <span style="font-size:12px;font-weight:700;color:${w.typeColor}">${w.typeName}</span>
          <span style="font-size:11px;color:#64748b">Bắt đầu năm ${w.startYear} · Kết thúc ~${w.endYear}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:10px">
          <div style="background:#1e293b;border-radius:8px;padding:10px;text-align:center">
            <div style="font-size:11px;color:#94a3b8;margin-bottom:2px">TẤN CÔNG</div>
            <div style="font-size:13px;font-weight:700;color:#ef4444">${w.attackerName}</div>
            <div style="font-size:10px;color:#64748b">Sức mạnh: ${w.attackerPower}</div>
          </div>
          <div style="font-size:20px;text-align:center">⚔️</div>
          <div style="background:#1e293b;border-radius:8px;padding:10px;text-align:center">
            <div style="font-size:11px;color:#94a3b8;margin-bottom:2px">PHÒNG THỦ</div>
            <div style="font-size:13px;font-weight:700;color:#8b5cf6">${w.defenderName}</div>
            <div style="font-size:10px;color:#64748b">Sức mạnh: ${w.defenderPower}</div>
          </div>
        </div>
        <div style="margin-top:4px;height:4px;background:#1e293b;border-radius:2px;overflow:hidden">
          <div style="height:100%;background:linear-gradient(to right,#ef4444,#8b5cf6);width:${Math.min(100,((window.year||0)-w.startYear)/w.duration*100)}%"></div>
        </div>
      </div>`).join("")}
    </div>
  </div>` : `<div style="text-align:center;padding:30px;color:#475569;background:#0f172a;border-radius:8px;margin-bottom:20px"><div style="font-size:40px;margin-bottom:8px">⚔️</div><div>Không có chiến tranh đang diễn ra</div></div>`}

  ${history.length > 0 ? `
  <div>
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:8px">📜 LỊCH SỬ CHIẾN TRANH</div>
    <div style="display:grid;gap:6px">
      ${history.map(w=>`
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:6px;padding:10px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px">
        <div>
          <span style="font-size:11px;color:${w.typeColor}">${w.typeName}</span>
          <div style="font-size:12px;color:#e2e8f0;margin-top:2px">${w.attackerName} vs ${w.defenderName}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;color:#fbbf24;font-weight:600">🏆 ${w.winnerName||"?"}</div>
          <div style="font-size:10px;color:#64748b">Năm ${w.startYear}–${w.endYear}</div>
        </div>
      </div>`).join("")}
    </div>
  </div>` : ""}
</div>`;
  };

  window.mwRenderDeclareModal = function() {
    const universes = (window.mvData && window.mvData.universes) ? window.mvData.universes.filter(u=>u.status==="active") : [];
    const types = WAR_TYPES;
    if (universes.length < 2) { alert("Cần ít nhất 2 vũ trụ đang hoạt động!"); return; }
    const modal = document.createElement("div");
    modal.id = "mw-declare-modal";
    modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:#000000cc;z-index:9999;display:flex;align-items:center;justify-content:center";
    modal.innerHTML = `
<div style="background:#0f172a;border:1px solid #ef4444;border-radius:12px;padding:24px;width:420px;max-width:90vw;font-family:'Noto Serif SC',serif">
  <h3 style="margin:0 0 16px;color:#ef4444;font-family:Cinzel,serif">⚔️ Khai Chiến Liên Vũ Trụ</h3>
  <div style="margin-bottom:10px">
    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Loại chiến tranh</label>
    <select id="mw-type-sel" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px">
      ${types.map(t=>`<option value="${t.id}">${t.name} — ${t.desc}</option>`).join("")}
    </select>
  </div>
  <div style="margin-bottom:10px">
    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Vũ trụ tấn công</label>
    <select id="mw-atk-sel" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px">
      ${universes.map(u=>`<option value="${u.id}">${u.name} (Sức mạnh: ${u.power})</option>`).join("")}
    </select>
  </div>
  <div style="margin-bottom:16px">
    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Vũ trụ phòng thủ</label>
    <select id="mw-def-sel" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px">
      ${universes.map(u=>`<option value="${u.id}">${u.name} (Sức mạnh: ${u.power})</option>`).join("")}
    </select>
  </div>
  <div style="display:flex;gap:10px">
    <button onclick="const t=document.getElementById('mw-type-sel').value;const a=document.getElementById('mw-atk-sel').value;const d=document.getElementById('mw-def-sel').value;if(a===d){alert('Hai vũ trụ phải khác nhau!')}else{mwDeclareWar(a,d,t);document.getElementById('mw-declare-modal').remove();mwRenderPanel()}" style="flex:1;padding:10px;background:linear-gradient(135deg,#ef4444,#dc2626);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:13px">⚔️ Khai Chiến!</button>
    <button onclick="document.getElementById('mw-declare-modal').remove()" style="padding:10px 16px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:13px">Hủy</button>
  </div>
</div>`;
    document.body.appendChild(modal);
  };

  // ─── gameTick ─────────────────────────────────────────────────────────────
  const _prevTick = window.gameTick;
  window.gameTick = function() {
    if (typeof _prevTick === "function") _prevTick();
    window.mwData.tick++;
    const currentYear = window.year || 0;
    window.mwData.wars.filter(w => w.status === "ongoing" && currentYear >= w.endYear).forEach(resolveWar);
    if (window.mwData.tick % 150 === 0 && Math.random() < 0.25) window.mwAutoWar();
    if (window.mwData.tick % 30 === 0) save();
  };

  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
      load();
      console.log("[MultiverseWarEngine V35] ⚔️ Chiến tranh đa vũ trụ sẵn sàng.");
    }, 2800);
  });

})();
