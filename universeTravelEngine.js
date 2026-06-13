(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIVERSE TRAVEL ENGINE V35 — Du Hành Liên Vũ Trụ
  // ═══════════════════════════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_universe_travel_v35";

  const TRAVELER_TYPES = [
    { id:"player",   name:"👤 Người Chơi",  icon:"👤", power:100 },
    { id:"guild",    name:"⚔️ Hội Đồng",   icon:"⚔️", power:300 },
    { id:"sect",     name:"🏯 Tông Môn",    icon:"🏯", power:500 },
    { id:"kingdom",  name:"🏰 Vương Quốc",  icon:"🏰", power:1000},
    { id:"god",      name:"✨ Thần Linh",    icon:"✨", power:5000}
  ];

  function defaultData() {
    return {
      journeys:    [],
      active:      [],
      arrived:     [],
      tick:        0,
      totalJourneys: 0
    };
  }

  window.utData = window.utData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.utData)); } catch(e) {} }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { const p = JSON.parse(raw); if (p && p.journeys) window.utData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  let _idCtr = 1;
  function newId() { return "jrn_" + Date.now() + "_" + (_idCtr++); }

  // ─── Bắt đầu hành trình ───────────────────────────────────────────────────
  window.utStartJourney = function(travelerType, travelerName, fromUid, toUid, portalId) {
    const ttype = TRAVELER_TYPES.find(t => t.id === travelerType) || TRAVELER_TYPES[0];
    const fromU = window.mvGetUniverseById && window.mvGetUniverseById(fromUid);
    const toU   = window.mvGetUniverseById && window.mvGetUniverseById(toUid);
    if (!fromU || !toU) return null;

    const portal = portalId ? (window.pnData && window.pnData.portals.find(p => p.id === portalId && p.status === "open")) : null;
    const travelTime = portal ? Math.max(5, Math.floor(100 - portal.stability)) : 50;
    const danger     = portal ? (100 - portal.stability) / 100 : 0.3;

    const journey = {
      id:           newId(),
      type:         ttype.id,
      typeName:     ttype.name,
      icon:         ttype.icon,
      name:         travelerName || (ttype.name + " Vô Danh"),
      fromUid,
      fromName:     fromU.name,
      toUid,
      toName:       toU.name,
      portalId:     portalId || null,
      status:       "traveling",
      startYear:    window.year || 0,
      arrivalYear:  (window.year || 0) + travelTime,
      travelTime,
      danger:       Math.round(danger * 100),
      outcome:      null
    };

    window.utData.journeys.push(journey);
    window.utData.active.push(journey);
    window.utData.totalJourneys++;

    if (portal) portal.travelers++;

    utLog(`${ttype.icon} ${journey.name} bắt đầu du hành từ "${fromU.name}" → "${toU.name}"`);
    if (typeof window.htAddEvent === "function") window.htAddEvent({ year: window.year||0, desc:`${ttype.name} "${journey.name}" bắt đầu hành trình xuyên vũ trụ`, type:"universe_travel", source:"travel_engine" });
    save(); return journey;
  };

  // ─── Tự động du hành NPC ──────────────────────────────────────────────────
  window.utAutoTravel = function() {
    if (!window.mvData || !window.mvData.universes) return;
    const portals = window.pnGetOpenPortals && window.pnGetOpenPortals();
    if (!portals || portals.length === 0) return;

    const portal = portals[Math.floor(Math.random() * portals.length)];
    const ttype  = TRAVELER_TYPES[Math.floor(Math.random() * TRAVELER_TYPES.length)];

    const names = {
      player:  ["Vô Danh Hiệp Khách","Lãng Du Thần","Hành Giả Không Gian","Đa Vũ Trụ Thám Hiểm"],
      guild:   ["Hội Thám Hiểm Vũ Trụ","Liên Minh Không Gian","Đội Xuyên Thiên"],
      sect:    ["Linh Không Tông","Hư Không Môn","Du Hành Tông"],
      kingdom: ["Vương Quốc Khai Phá","Đế Quốc Mở Rộng","Vương Triều Thiên Di"],
      god:     ["Thần Du Lãng","Thiên Địa Thần Quan","Vũ Trụ Hành Giả"]
    };
    const namePool = names[ttype.id] || ["Hành Khách"];
    const name = namePool[Math.floor(Math.random() * namePool.length)];

    window.utStartJourney(ttype.id, name, portal.fromUid, portal.toUid, portal.id);
  };

  // ─── Xử lý hành trình tick ────────────────────────────────────────────────
  function processTravels() {
    const currentYear = window.year || 0;
    const stillTraveling = [];

    window.utData.active.forEach(function(j) {
      if (currentYear >= j.arrivalYear) {
        const dangerRoll = Math.random() * 100;
        if (dangerRoll < j.danger) {
          j.status  = "lost";
          j.outcome = "☠️ Mất tích trong không gian vũ trụ";
          utLog(`💀 ${j.icon} ${j.name} mất tích khi xuyên qua cổng "${j.fromName}" → "${j.toName}"!`);
        } else {
          j.status  = "arrived";
          j.outcome = `✅ Đến ${j.toName} an toàn`;
          utLog(`✅ ${j.icon} ${j.name} đến "${j.toName}" thành công!`);
          if (typeof window.htAddEvent === "function") window.htAddEvent({ year: currentYear, desc: `${j.typeName} "${j.name}" đến "${j.toName}" từ "${j.fromName}"`, type:"universe_arrived", source:"travel_engine" });
        }
        window.utData.arrived.unshift(j);
        if (window.utData.arrived.length > 100) window.utData.arrived.length = 100;
      } else {
        stillTraveling.push(j);
      }
    });

    window.utData.active = stillTraveling;
  }

  function utLog(msg) {
    if (typeof window.addLog === "function") window.addLog("[TRAVEL] " + msg);
    if (typeof window.mvLog === "function") window.mvLog(msg);
  }

  window.utGetActive  = function() { return window.utData.active; };
  window.utGetArrived = function() { return window.utData.arrived; };
  window.utGetTypes   = function() { return TRAVELER_TYPES; };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  window.utRenderPanel = function() {
    const el = document.getElementById("panel-universe-travel");
    if (!el) return;
    const active   = window.utData.active;
    const arrived  = window.utData.arrived.slice(0, 30);
    const types    = TRAVELER_TYPES;
    const universes = (window.mvData && window.mvData.universes) ? window.mvData.universes.filter(u=>u.status==="active") : [];
    const portals   = window.pnGetOpenPortals ? window.pnGetOpenPortals() : [];

    el.innerHTML = `
<div style="padding:16px;font-family:'Noto Serif SC',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
    <div>
      <h2 style="margin:0;font-size:20px;color:#10b981;font-family:Cinzel,serif">✈️ Du Hành Liên Vũ Trụ V35</h2>
      <div style="font-size:11px;color:#64748b;margin-top:2px">${active.length} đang du hành · ${window.utData.totalJourneys} tổng chuyến · ${portals.length} cổng khả dụng</div>
    </div>
    <div style="display:flex;gap:8px">
      <button onclick="utAutoTravel();utRenderPanel()" style="padding:6px 14px;background:linear-gradient(135deg,#10b981,#059669);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:12px">🎲 Du Hành Ngẫu Nhiên</button>
      <button onclick="utRenderSendModal()" style="padding:6px 14px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:12px">+ Cử Phái Đoàn</button>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:20px">
    ${types.map(t => {
      const cnt = active.filter(j=>j.type===t.id).length;
      return `<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;text-align:center">
        <div style="font-size:20px">${t.icon}</div>
        <div style="font-size:16px;font-weight:700;color:#e2e8f0">${cnt}</div>
        <div style="font-size:10px;color:#64748b">${t.name}</div>
      </div>`;
    }).join("")}
  </div>

  ${active.length > 0 ? `
  <div style="margin-bottom:20px">
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:8px">🚀 ĐANG DU HÀNH (${active.length})</div>
    <div style="display:grid;gap:8px">
      ${active.map(j=>`
      <div style="background:#0f172a;border:1px solid #10b98144;border-radius:8px;padding:12px">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px">
          <div>
            <span style="font-size:13px;font-weight:600;color:#10b981">${j.icon} ${j.name}</span>
            <div style="font-size:11px;color:#64748b;margin-top:3px">${j.fromName} → ${j.toName}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:11px;color:#fbbf24">Đến năm ${j.arrivalYear}</div>
            <div style="font-size:10px;color:${j.danger>50?"#ef4444":j.danger>25?"#fbbf24":"#34d399"}">Nguy hiểm: ${j.danger}%</div>
          </div>
        </div>
        <div style="margin-top:8px;height:3px;background:#1e293b;border-radius:2px;overflow:hidden">
          <div style="height:100%;background:#10b981;width:${Math.min(100,Math.max(0,((window.year||0)-j.startYear)/j.travelTime*100))}%;transition:width 0.3s"></div>
        </div>
      </div>`).join("")}
    </div>
  </div>` : `<div style="text-align:center;padding:30px;color:#475569;background:#0f172a;border-radius:8px;margin-bottom:20px"><div style="font-size:40px;margin-bottom:8px">✈️</div><div>Chưa có chuyến du hành nào đang diễn ra</div></div>`}

  ${arrived.length > 0 ? `
  <div>
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:8px">📋 LỊCH SỬ DU HÀNH</div>
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;max-height:200px;overflow-y:auto">
      ${arrived.map(j=>`
      <div style="font-size:11px;color:${j.status==="arrived"?"#34d399":"#ef4444"};padding:4px 0;border-bottom:1px solid #1e293b">
        Năm ${j.arrivalYear}: ${j.icon} ${j.name} — ${j.outcome}
      </div>`).join("")}
    </div>
  </div>` : ""}
</div>`;
  };

  window.utRenderSendModal = function() {
    const universes = (window.mvData && window.mvData.universes) ? window.mvData.universes.filter(u=>u.status==="active") : [];
    const portals   = window.pnGetOpenPortals ? window.pnGetOpenPortals() : [];
    const types     = TRAVELER_TYPES;
    if (universes.length < 2) { alert("Cần ít nhất 2 vũ trụ hoạt động!"); return; }
    if (portals.length === 0) { alert("Cần ít nhất 1 cổng mở! Hãy mở cổng trước."); return; }

    const modal = document.createElement("div");
    modal.id = "ut-send-modal";
    modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:#000000cc;z-index:9999;display:flex;align-items:center;justify-content:center";
    modal.innerHTML = `
<div style="background:#0f172a;border:1px solid #10b981;border-radius:12px;padding:24px;width:420px;max-width:90vw;font-family:'Noto Serif SC',serif">
  <h3 style="margin:0 0 16px;color:#10b981;font-family:Cinzel,serif">✈️ Cử Phái Đoàn Du Hành</h3>
  <div style="margin-bottom:10px">
    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Loại phái đoàn</label>
    <select id="ut-type-sel" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px">
      ${types.map(t=>`<option value="${t.id}">${t.icon} ${t.name}</option>`).join("")}
    </select>
  </div>
  <div style="margin-bottom:10px">
    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Tên phái đoàn</label>
    <input id="ut-name-inp" type="text" placeholder="Tên phái đoàn..." style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px;box-sizing:border-box">
  </div>
  <div style="margin-bottom:16px">
    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Chọn cổng</label>
    <select id="ut-portal-sel" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px">
      ${portals.map(p=>`<option value="${p.id}|${p.fromUid}|${p.toUid}">${p.typeName}: ${p.fromName} → ${p.toName}</option>`).join("")}
    </select>
  </div>
  <div style="display:flex;gap:10px">
    <button onclick="const type=document.getElementById('ut-type-sel').value;const name=document.getElementById('ut-name-inp').value;const parts=document.getElementById('ut-portal-sel').value.split('|');utStartJourney(type,name||null,parts[1],parts[2],parts[0]);document.getElementById('ut-send-modal').remove();utRenderPanel()" style="flex:1;padding:10px;background:linear-gradient(135deg,#10b981,#059669);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:13px">✈️ Khởi Hành</button>
    <button onclick="document.getElementById('ut-send-modal').remove()" style="padding:10px 16px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:13px">Hủy</button>
  </div>
</div>`;
    document.body.appendChild(modal);
  };

  // ─── gameTick ─────────────────────────────────────────────────────────────
  const _prevTick = window.gameTick;
  window.gameTick = function() {
    if (typeof _prevTick === "function") _prevTick();
    window.utData.tick++;
    if (window.utData.active.length > 0) processTravels();
    if (window.utData.tick % 120 === 0 && Math.random() < 0.3) window.utAutoTravel();
    if (window.utData.tick % 30 === 0) save();
  };

  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
      load();
      console.log("[UniverseTravelEngine V35] ✈️ Du hành liên vũ trụ sẵn sàng.");
    }, 2600);
  });

})();
