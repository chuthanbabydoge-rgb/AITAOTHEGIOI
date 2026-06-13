(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // TIMELINE TRAVEL ENGINE V36 — Du Hành Dòng Thời Gian
  // Player · God · Creator có thể di chuyển giữa các dòng thời gian
  // ═══════════════════════════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_timeline_travel_v36";

  const TRAVELER_TYPES = [
    { id:"player",  name:"👤 Người Chơi", risk:30, travelTime:20 },
    { id:"god",     name:"✨ Thần Linh",  risk:10, travelTime:10 },
    { id:"creator", name:"👁 Tạo Hóa",   risk:0,  travelTime:1  }
  ];

  function defaultData() {
    return { journeys: [], active: [], history: [], tick: 0, total: 0 };
  }

  window.ttvData = window.ttvData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.ttvData)); } catch(e) {} }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { const p = JSON.parse(raw); if (p && p.journeys) window.ttvData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  let _idCtr = 1;
  function newId() { return "ttv_" + Date.now() + "_" + (_idCtr++); }

  // ─── Bắt đầu du hành ──────────────────────────────────────────────────────
  window.ttvStartJourney = function(travelerType, travelerName, fromTlId, toTlId) {
    const ttype = TRAVELER_TYPES.find(t => t.id === travelerType) || TRAVELER_TYPES[0];
    const fromTl = window.tlGetById && window.tlGetById(fromTlId);
    const toTl   = window.tlGetById && window.tlGetById(toTlId);
    if (!fromTl || !toTl) return null;
    if (fromTlId === toTlId) return null;

    const j = {
      id:          newId(),
      type:        ttype.id,
      typeName:    ttype.name,
      name:        travelerName || ttype.name + " Vô Danh",
      fromTlId, fromName: fromTl.name,
      toTlId,   toName:   toTl.name,
      status:      "traveling",
      startYear:   window.year || 0,
      arrivalYear: (window.year||0) + ttype.travelTime,
      risk:        ttype.risk + (100 - toTl.stability) * 0.1,
      outcome:     null
    };

    window.ttvData.journeys.push(j);
    window.ttvData.active.push(j);
    window.ttvData.total++;

    fromTl.travelers = (fromTl.travelers || 0) + 1;

    if (typeof window.tlLog === "function") window.tlLog(`${ttype.name === "👁 Tạo Hóa" ? "👁" : ttype.id==="god"?"✨":"👤"} ${j.name} du hành: "${fromTl.name}" → "${toTl.name}"`);
    if (typeof window.htAddEvent === "function") window.htAddEvent({ year: window.year||0, desc:`${ttype.name} "${j.name}" du hành sang "${toTl.name}"`, type:"timeline_travel", source:"timeline_travel" });
    save(); return j;
  };

  // ─── Auto travel ──────────────────────────────────────────────────────────
  window.ttvAutoTravel = function() {
    const active = window.tlGetActiveTimelines ? window.tlGetActiveTimelines() : [];
    if (active.length < 2) return;
    const from = active[Math.floor(Math.random()*active.length)];
    let to = active[Math.floor(Math.random()*active.length)];
    let attempts = 0;
    while (to.id === from.id && attempts < 5) { to = active[Math.floor(Math.random()*active.length)]; attempts++; }
    if (to.id === from.id) return;

    const names = ["Đạo Giả Vô Danh","Hành Khách Thời Gian","Lãng Du Giả","Du Khách Lịch Sử","Thám Tử Kỳ Tích"];
    const name = names[Math.floor(Math.random()*names.length)];
    const types = TRAVELER_TYPES;
    const ttype = types[Math.floor(Math.random()*types.length)];
    window.ttvStartJourney(ttype.id, name, from.id, to.id);
  };

  function processTravels() {
    const cur = window.year || 0;
    const still = [];
    window.ttvData.active.forEach(function(j) {
      if (cur >= j.arrivalYear) {
        if (Math.random() * 100 < j.risk) {
          j.status = "lost";
          j.outcome = "☠️ Mất tích trong kẽ hở thời gian";
          if (typeof window.tlLog === "function") window.tlLog(`💀 ${j.name} mất tích khi du hành "${j.fromName}" → "${j.toName}"!`);
        } else {
          j.status = "arrived";
          j.outcome = `✅ Đến "${j.toName}" thành công`;
          if (typeof window.tlLog === "function") window.tlLog(`✅ ${j.name} đến "${j.toName}" an toàn!`);
          if (typeof window.htAddEvent === "function") window.htAddEvent({ year: cur, desc:`${j.typeName} "${j.name}" đến "${j.toName}"`, type:"timeline_arrived", source:"timeline_travel" });
        }
        window.ttvData.history.unshift(j);
        if (window.ttvData.history.length > 100) window.ttvData.history.length = 100;
      } else {
        still.push(j);
      }
    });
    window.ttvData.active = still;
  }

  window.ttvGetActive  = function() { return window.ttvData.active; };
  window.ttvGetHistory = function() { return window.ttvData.history; };
  window.ttvGetTypes   = function() { return TRAVELER_TYPES; };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  window.ttvRenderPanel = function() {
    const el = document.getElementById("panel-timeline-travel-v36");
    if (!el) return;
    const active   = window.ttvData.active;
    const history  = window.ttvData.history.slice(0, 25);
    const timelines= window.tlGetActiveTimelines ? window.tlGetActiveTimelines() : [];
    const types    = TRAVELER_TYPES;

    el.innerHTML = `
<div style="padding:16px;font-family:'Noto Serif SC',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
    <div>
      <h2 style="margin:0;font-size:20px;color:#10b981;font-family:Cinzel,serif">✈️ Du Hành Dòng Thời Gian V36</h2>
      <div style="font-size:11px;color:#64748b;margin-top:2px">${active.length} đang du hành · ${window.ttvData.total} tổng chuyến</div>
    </div>
    <div style="display:flex;gap:8px">
      <button onclick="ttvAutoTravel();ttvRenderPanel()" style="padding:6px 14px;background:linear-gradient(135deg,#10b981,#059669);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:12px">🎲 Tự Động</button>
      <button onclick="ttvRenderSendModal()" style="padding:6px 14px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:12px">+ Cử Phái Đoàn</button>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:18px">
    ${types.map(t=>`<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;text-align:center">
      <div style="font-size:20px">${t.name.split(" ")[0]}</div>
      <div style="font-size:15px;font-weight:700;color:#e2e8f0">${active.filter(j=>j.type===t.id).length}</div>
      <div style="font-size:10px;color:#64748b">${t.name}</div>
    </div>`).join("")}
  </div>

  ${active.length > 0 ? `
  <div style="margin-bottom:18px">
    <div style="font-size:13px;color:#10b981;font-weight:600;margin-bottom:8px">🚀 ĐANG DU HÀNH</div>
    <div style="display:grid;gap:8px">
      ${active.map(j=>`
      <div style="background:#0f172a;border:1px solid #10b98144;border-radius:8px;padding:12px">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px">
          <div>
            <div style="font-size:13px;font-weight:600;color:#10b981">${j.typeName.split(" ")[0]} ${j.name}</div>
            <div style="font-size:11px;color:#64748b;margin-top:3px">${j.fromName} → ${j.toName}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:11px;color:#fbbf24">Đến năm ${j.arrivalYear}</div>
            <div style="font-size:10px;color:${j.risk>30?"#ef4444":"#34d399"}">Rủi ro: ${j.risk.toFixed(0)}%</div>
          </div>
        </div>
        <div style="margin-top:8px;height:3px;background:#1e293b;border-radius:2px;overflow:hidden">
          <div style="height:100%;background:#10b981;width:${Math.min(100,Math.max(0,((window.year||0)-j.startYear)/Math.max(1,j.arrivalYear-j.startYear)*100))}%"></div>
        </div>
      </div>`).join("")}
    </div>
  </div>` : `<div style="text-align:center;padding:30px;color:#475569;background:#0f172a;border-radius:8px;margin-bottom:18px"><div style="font-size:40px">✈️</div><div style="margin-top:8px">Chưa có chuyến du hành nào</div></div>`}

  ${history.length > 0 ? `
  <div>
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:8px">📋 LỊCH SỬ DU HÀNH</div>
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;max-height:180px;overflow-y:auto">
      ${history.map(j=>`<div style="font-size:11px;color:${j.status==="arrived"?"#34d399":"#ef4444"};padding:4px 0;border-bottom:1px solid #0a0a1a">Năm ${j.arrivalYear}: ${j.name} — ${j.outcome}</div>`).join("")}
    </div>
  </div>` : ""}
</div>`;
  };

  window.ttvRenderSendModal = function() {
    const timelines = window.tlGetActiveTimelines ? window.tlGetActiveTimelines() : [];
    if (timelines.length < 2) { alert("Cần ít nhất 2 dòng thời gian hoạt động!"); return; }
    const types = TRAVELER_TYPES;
    const modal = document.createElement("div");
    modal.id = "ttv-send-modal";
    modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:#000000cc;z-index:9999;display:flex;align-items:center;justify-content:center";
    modal.innerHTML = `
<div style="background:#0f172a;border:1px solid #10b981;border-radius:12px;padding:24px;width:400px;max-width:90vw;font-family:'Noto Serif SC',serif">
  <h3 style="margin:0 0 16px;color:#10b981;font-family:Cinzel,serif">✈️ Cử Phái Đoàn Du Hành</h3>
  <div style="margin-bottom:10px"><label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Loại</label><select id="ttv-type-sel" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px">${types.map(t=>`<option value="${t.id}">${t.name} (rủi ro ${t.risk}%)</option>`).join("")}</select></div>
  <div style="margin-bottom:10px"><label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Tên</label><input id="ttv-name-inp" type="text" placeholder="Tên phái đoàn..." style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px;box-sizing:border-box"></div>
  <div style="margin-bottom:10px"><label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Từ dòng thời gian</label><select id="ttv-from-sel" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px">${timelines.map(t=>`<option value="${t.id}">${t.name}</option>`).join("")}</select></div>
  <div style="margin-bottom:16px"><label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Đến dòng thời gian</label><select id="ttv-to-sel" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px">${timelines.map(t=>`<option value="${t.id}">${t.name}</option>`).join("")}</select></div>
  <div style="display:flex;gap:10px">
    <button onclick="const t=document.getElementById('ttv-type-sel').value;const n=document.getElementById('ttv-name-inp').value;const f=document.getElementById('ttv-from-sel').value;const d=document.getElementById('ttv-to-sel').value;if(f===d){alert('Hai dòng thời gian phải khác nhau!')}else{ttvStartJourney(t,n||null,f,d);document.getElementById('ttv-send-modal').remove();ttvRenderPanel()}" style="flex:1;padding:10px;background:linear-gradient(135deg,#10b981,#059669);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:13px">✈️ Khởi Hành</button>
    <button onclick="document.getElementById('ttv-send-modal').remove()" style="padding:10px 16px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:13px">Hủy</button>
  </div>
</div>`;
    document.body.appendChild(modal);
  };

  // ─── gameTick ─────────────────────────────────────────────────────────────
  const _prevTick = window.gameTick;
  window.gameTick = function() {
    if (typeof _prevTick === "function") _prevTick();
    window.ttvData.tick++;
    if (window.ttvData.active.length > 0) processTravels();
    if (window.ttvData.tick % 150 === 0 && Math.random() < 0.2) window.ttvAutoTravel();
    if (window.ttvData.tick % 30 === 0) save();
  };

  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() { load(); console.log("[TimelineTravelEngine V36] ✈️ Du hành dòng thời gian sẵn sàng."); }, 3250);
  });
})();
