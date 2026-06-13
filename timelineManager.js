(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // TIMELINE MANAGER V36 — Quản Lý & Thao Túng Dòng Thời Gian
  // Creator God có thể can thiệp vào dòng thời gian
  // ═══════════════════════════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_timeline_manager_v36";

  function defaultData() {
    return { interventions: [], snapshots: [], tick: 0 };
  }

  window.tmData = window.tmData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.tmData)); } catch(e) {} }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { const p = JSON.parse(raw); if (p) window.tmData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  // ─── Creator God Actions ──────────────────────────────────────────────────
  window.tmStabilize = function(tlId, amount) {
    const tl = window.tlGetById && window.tlGetById(tlId);
    if (!tl || tl.status !== "active") return;
    const amt = amount || 25;
    tl.stability = Math.min(100, tl.stability + amt);
    _log(tlId, `Tạo Hóa ổn định +${amt}%`, "stabilize");
    if (typeof window.tlLog === "function") window.tlLog(`✨ Tạo Hóa can thiệp: "${tl.name}" được ổn định!`);
    _persist();
  };

  window.tmPurge = function(tlId) {
    const tl = window.tlGetById && window.tlGetById(tlId);
    if (!tl || tl.status !== "active") return;
    tl.stability = Math.max(1, tl.stability - 30);
    tl.population = Math.floor(tl.population * 0.9);
    _log(tlId, "Tạo Hóa thanh tẩy — -30% ổn định", "purge");
    if (typeof window.tlLog === "function") window.tlLog(`🔥 Tạo Hóa thanh tẩy dòng thời gian "${tl.name}"!`);
    _persist();
  };

  window.tmAlterHistory = function(tlId, desc) {
    const tl = window.tlGetById && window.tlGetById(tlId);
    if (!tl || tl.status !== "active") return;
    tl.events = tl.events || [];
    tl.events.push({ type:"altered", desc: desc || "Lịch sử bị thay đổi bởi Tạo Hóa", year: window.year||0 });
    if (tl.events.length > 20) tl.events.shift();
    _log(tlId, `Lịch sử thay đổi: ${desc || "Biến cố bí ẩn"}`, "alter");
    if (typeof window.tlLog === "function") window.tlLog(`✏️ Tạo Hóa thay đổi lịch sử "${tl.name}": ${desc||"Biến cố bí ẩn"}`);
    if (typeof window.htAddEvent === "function") window.htAddEvent({ year: window.year||0, desc: `[Timeline] Lịch sử "${tl.name}" bị thay đổi`, type:"timeline_altered", source:"timeline_manager" });
    _persist();
  };

  window.tmAddGods = function(tlId, count) {
    const tl = window.tlGetById && window.tlGetById(tlId);
    if (!tl) return;
    tl.gods = (tl.gods || 0) + (count || 1);
    _log(tlId, `+${count||1} thần linh hạ thế`, "add_gods");
    _persist();
  };

  window.tmAddKingdoms = function(tlId, count) {
    const tl = window.tlGetById && window.tlGetById(tlId);
    if (!tl) return;
    tl.kingdoms = (tl.kingdoms || 0) + (count || 2);
    _log(tlId, `+${count||2} vương quốc xuất hiện`, "add_kingdoms");
    _persist();
  };

  window.tmTakeSnapshot = function(tlId) {
    const tl = window.tlGetById && window.tlGetById(tlId);
    if (!tl) return;
    window.tmData.snapshots.unshift({ tlId, name: tl.name, year: window.year||0, data: JSON.parse(JSON.stringify(tl)) });
    if (window.tmData.snapshots.length > 50) window.tmData.snapshots.length = 50;
    if (typeof window.tlLog === "function") window.tlLog(`📸 Snapshot dòng thời gian "${tl.name}" lưu lại.`);
    save();
  };

  window.tmSetDominantForce = function(tlId, force) {
    const tl = window.tlGetById && window.tlGetById(tlId);
    if (!tl) return;
    tl.dominantForce = force;
    _log(tlId, `Thế lực thống trị → ${force}`, "set_force");
    _persist();
  };

  function _log(tlId, desc, type) {
    const tl = window.tlGetById && window.tlGetById(tlId);
    window.tmData.interventions.unshift({ tlId, name: tl ? tl.name : tlId, desc, type, year: window.year||0 });
    if (window.tmData.interventions.length > 100) window.tmData.interventions.length = 100;
    save();
  }

  function _persist() {
    try { localStorage.setItem("cgv6_timeline_engine_v36", JSON.stringify(window.tlData)); } catch(e) {}
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  window.tmRenderPanel = function() {
    const el = document.getElementById("panel-timeline-v36");
    if (!el) return;

    const active = window.tlGetActiveTimelines ? window.tlGetActiveTimelines() : [];
    const interventions = window.tmData.interventions.slice(0, 20);
    const snapshots     = window.tmData.snapshots.slice(0, 10);

    const EVENTS = [
      { id:"golden_age", label:"🌟 Thời Kỳ Vàng", stability:+20, pop:1.05 },
      { id:"plague",     label:"🦠 Đại Dịch",     stability:-15, pop:0.95 },
      { id:"divine_war", label:"⚔️ Thần Chiến",  stability:-20, pop:0.92 },
      { id:"rebirth",    label:"♻️ Hồi Sinh",     stability:+30, pop:1.1  },
      { id:"collapse",   label:"💥 Sụp Đổ Đế Chế",stability:-25, pop:0.88}
    ];

    el.innerHTML = `
<div style="padding:16px;font-family:'Noto Serif SC',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">
  <h2 style="margin:0 0 16px;font-size:20px;color:#fbbf24;font-family:Cinzel,serif">🎛️ Quản Lý Dòng Thời Gian V36</h2>

  ${active.length === 0 ? `<div style="text-align:center;padding:30px;color:#475569">Chưa có dòng thời gian. Tạo dòng thời gian trước!</div>` :
  `<div style="display:grid;gap:12px">
    ${active.map(tl => `
    <div style="background:#0f172a;border:1px solid ${tl.typeColor}44;border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-bottom:10px">
        <span style="font-weight:600;color:${tl.typeColor}">${tl.name} <span style="font-size:11px;font-weight:400;color:#64748b">${tl.typeName}</span></span>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button onclick="tmStabilize('${tl.id}',20);tmRenderPanel()" style="padding:4px 9px;background:#0f172a;border:1px solid #34d399;border-radius:5px;color:#34d399;cursor:pointer;font-size:11px">+Ổn Định</button>
          <button onclick="tmPurge('${tl.id}');tmRenderPanel()" style="padding:4px 9px;background:#0f172a;border:1px solid #f97316;border-radius:5px;color:#f97316;cursor:pointer;font-size:11px">🔥 Thanh Tẩy</button>
          <button onclick="tmAddGods('${tl.id}',2);tmRenderPanel()" style="padding:4px 9px;background:#0f172a;border:1px solid #fbbf24;border-radius:5px;color:#fbbf24;cursor:pointer;font-size:11px">+Thần</button>
          <button onclick="tmAddKingdoms('${tl.id}',3);tmRenderPanel()" style="padding:4px 9px;background:#0f172a;border:1px solid #8b5cf6;border-radius:5px;color:#8b5cf6;cursor:pointer;font-size:11px">+Vương Quốc</button>
          <button onclick="tmTakeSnapshot('${tl.id}')" style="padding:4px 9px;background:#0f172a;border:1px solid #06b6d4;border-radius:5px;color:#06b6d4;cursor:pointer;font-size:11px">📸</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:6px;font-size:12px;margin-bottom:10px">
        <div style="background:#0a0a1a;padding:6px;border-radius:5px"><div style="color:#64748b;font-size:10px">DÂN SỐ</div><div style="color:#e2e8f0">${(tl.population/1000).toFixed(0)}K</div></div>
        <div style="background:#0a0a1a;padding:6px;border-radius:5px"><div style="color:#64748b;font-size:10px">ỔN ĐỊNH</div><div style="color:${tl.stability>60?"#34d399":tl.stability>30?"#fbbf24":"#ef4444"}">${tl.stability.toFixed(0)}%</div></div>
        <div style="background:#0a0a1a;padding:6px;border-radius:5px"><div style="color:#64748b;font-size:10px">THẦN LINH</div><div style="color:#fbbf24">${tl.gods}</div></div>
        <div style="background:#0a0a1a;padding:6px;border-radius:5px"><div style="color:#64748b;font-size:10px">VƯƠNG QUỐC</div><div style="color:#8b5cf6">${tl.kingdoms}</div></div>
      </div>
      <div style="font-size:11px;color:#64748b;margin-bottom:8px">👑 ${tl.dominantForce}</div>
      <div style="display:flex;flex-wrap:wrap;gap:5px">
        ${EVENTS.map(ev=>`<button onclick="tmAlterHistory('${tl.id}','${ev.label}');tmRenderPanel()" style="padding:3px 9px;background:#0a0a1a;border:1px solid #334155;border-radius:4px;color:#94a3b8;cursor:pointer;font-size:10px">${ev.label}</button>`).join("")}
        <button onclick="const f=prompt('Tên thế lực thống trị mới:');if(f)tmSetDominantForce('${tl.id}',f);tmRenderPanel()" style="padding:3px 9px;background:#0a0a1a;border:1px solid #8b5cf6;border-radius:4px;color:#a78bfa;cursor:pointer;font-size:10px">👑 Đổi Thế Lực</button>
      </div>
    </div>`).join("")}
  </div>`}

  ${interventions.length > 0 ? `
  <div style="margin-top:18px">
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:6px">📋 CAN THIỆP GẦN ĐÂY</div>
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;max-height:120px;overflow-y:auto">
      ${interventions.map(i=>`<div style="font-size:11px;color:#64748b;padding:3px 0;border-bottom:1px solid #0a0a1a">Năm ${i.year} · [${i.name}] ${i.desc}</div>`).join("")}
    </div>
  </div>` : ""}

  ${snapshots.length > 0 ? `
  <div style="margin-top:14px">
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:6px">📸 SNAPSHOTS</div>
    <div style="display:grid;gap:5px">
      ${snapshots.map(s=>`<div style="background:#0f172a;border:1px solid #1e293b;border-radius:6px;padding:8px;font-size:12px"><span style="color:#fbbf24">${s.name}</span> <span style="color:#64748b">· Năm ${s.year}</span></div>`).join("")}
    </div>
  </div>` : ""}
</div>`;
  };

  // ─── gameTick ─────────────────────────────────────────────────────────────
  const _prevTick = window.gameTick;
  window.gameTick = function() {
    if (typeof _prevTick === "function") _prevTick();
    window.tmData.tick++;
    if (window.tmData.tick % 60 === 0) save();
  };

  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() { load(); console.log("[TimelineManager V36] 🎛️ Quản lý dòng thời gian sẵn sàng."); }, 3100);
  });
})();
