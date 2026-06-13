(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // TIMELINE REGISTRY V36 — Danh Mục & Xếp Hạng Dòng Thời Gian
  // ═══════════════════════════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_timeline_registry_v36";

  function defaultData() {
    return { registry: {}, rankings: [], lastRank: 0, tick: 0 };
  }

  window.trData = window.trData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.trData)); } catch(e) {} }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { const p = JSON.parse(raw); if (p && p.registry) window.trData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  function syncRegistry() {
    if (!window.tlData || !window.tlData.timelines) return;
    window.tlData.timelines.forEach(function(tl) {
      window.trData.registry[tl.id] = {
        id: tl.id, name: tl.name, type: tl.type, typeName: tl.typeName,
        typeColor: tl.typeColor, status: tl.status, age: tl.age,
        population: tl.population, stability: tl.stability, power: tl.power,
        kingdoms: tl.kingdoms, gods: tl.gods, dominantForce: tl.dominantForce,
        parentId: tl.parentId, children: tl.children||[], travelers: tl.travelers||0
      };
    });
    updateRankings();
    window.trData.lastRank = window.year || 0;
    save();
  }

  function updateRankings() {
    const active = Object.values(window.trData.registry).filter(t => t.status === "active");
    window.trData.rankings = active
      .sort((a,b) => (b.stability + b.gods*10 + b.kingdoms*2) - (a.stability + a.gods*10 + a.kingdoms*2))
      .slice(0, 20).map((t,i) => ({ rank: i+1, ...t }));
  }

  window.trGetRankings = function() { syncRegistry(); return window.trData.rankings; };
  window.trGetRegistry = function() { syncRegistry(); return window.trData.registry; };
  window.trGetInfo     = function(id) { return window.trData.registry[id] || null; };

  // ─── RENDER Analytics + Rankings ──────────────────────────────────────────
  window.trRenderPanel = function() {
    const el = document.getElementById("panel-timeline-analytics-v36");
    if (!el) return;
    syncRegistry();
    const rankings = window.trData.rankings;
    const all = Object.values(window.trData.registry);
    const active = all.filter(t => t.status === "active");
    const strongest   = active.reduce((b,t) => t.power > (b ? b.power : 0) ? t : b, null);
    const mostStable  = active.reduce((b,t) => t.stability > (b ? b.stability : 0) ? t : b, null);
    const mostUnsable = active.reduce((b,t) => t.stability < (b ? b.stability : 100) ? t : b, null);
    const threatened  = active.filter(t => t.stability < 30);

    el.innerHTML = `
<div style="padding:16px;font-family:'Noto Serif SC',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">
  <h2 style="margin:0 0 16px;font-size:20px;color:#06b6d4;font-family:Cinzel,serif">📊 Phân Tích Dòng Thời Gian V36</h2>

  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:18px">
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px">
      <div style="font-size:11px;color:#64748b;margin-bottom:8px">TỔNG QUAN</div>
      ${[["🟢 Hoạt Động","active","#34d399"],["☠️ Sụp Đổ","collapsed","#ef4444"],["📦 Lưu Trữ","archived","#8b5cf6"]].map(([l,s,c])=>`<div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid #1e293b"><span style="color:#94a3b8">${l}</span><span style="color:${c};font-weight:700">${all.filter(t=>t.status===s).length}</span></div>`).join("")}
    </div>
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px">
      <div style="font-size:11px;color:#64748b;margin-bottom:8px">THEO LOẠI</div>
      ${Object.entries(active.reduce((acc,t)=>{acc[t.typeName]=(acc[t.typeName]||0)+1;return acc;},{})).map(([k,v])=>`<div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0;border-bottom:1px solid #1e293b"><span style="color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px">${k}</span><span style="color:#e2e8f0;font-weight:700">${v}</span></div>`).join("")}
    </div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:18px">
    ${strongest ? `<div style="background:#0f172a;border:1px solid #fbbf2444;border-radius:8px;padding:12px"><div style="font-size:10px;color:#64748b;margin-bottom:4px">💪 MẠNH NHẤT</div><div style="font-size:13px;font-weight:700;color:${strongest.typeColor}">${strongest.name}</div><div style="font-size:11px;color:#64748b">Sức mạnh: ${strongest.power}</div></div>` : ""}
    ${mostStable ? `<div style="background:#0f172a;border:1px solid #34d39944;border-radius:8px;padding:12px"><div style="font-size:10px;color:#64748b;margin-bottom:4px">🧘 ỔN ĐỊNH NHẤT</div><div style="font-size:13px;font-weight:700;color:${mostStable.typeColor}">${mostStable.name}</div><div style="font-size:11px;color:#34d399">Ổn định: ${mostStable.stability.toFixed(0)}%</div></div>` : ""}
    ${mostUnsable && mostUnsable !== mostStable ? `<div style="background:#0f172a;border:1px solid #ef444444;border-radius:8px;padding:12px"><div style="font-size:10px;color:#64748b;margin-bottom:4px">⚠️ BẤT ỔN NHẤT</div><div style="font-size:13px;font-weight:700;color:${mostUnsable.typeColor}">${mostUnsable.name}</div><div style="font-size:11px;color:#ef4444">Ổn định: ${mostUnsable.stability.toFixed(0)}%</div></div>` : ""}
    ${threatened.length > 0 ? `<div style="background:#0f172a;border:1px solid #ef444444;border-radius:8px;padding:12px"><div style="font-size:10px;color:#ef4444;margin-bottom:4px">🚨 NGUY HIỂM (${threatened.length})</div>${threatened.map(t=>`<div style="font-size:12px;color:#f87171">${t.name}: ${t.stability.toFixed(0)}%</div>`).join("")}</div>` : ""}
  </div>

  ${rankings.length > 0 ? `
  <div style="margin-bottom:12px;font-size:13px;color:#94a3b8;font-weight:600">🏆 BẢNG XẾP HẠNG</div>
  <div style="display:grid;gap:6px">
    ${rankings.slice(0,10).map(t=>`
    <div style="background:#0f172a;border:1px solid ${t.rank<=3?"#fbbf2444":"#1e293b"};border-radius:8px;padding:10px;display:flex;align-items:center;gap:10px">
      <div style="width:30px;height:30px;border-radius:50%;background:${t.rank===1?"linear-gradient(135deg,#fbbf24,#f59e0b)":t.rank===2?"linear-gradient(135deg,#94a3b8,#64748b)":t.rank===3?"linear-gradient(135deg,#f97316,#ea580c)":"#1e293b"};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:${t.rank<=3?"#000":"#64748b"};flex-shrink:0">${t.rank}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;color:${t.typeColor};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.name}</div>
        <div style="font-size:10px;color:#64748b">${t.typeName} · ⚡${t.stability.toFixed(0)}% · ✨${t.gods}thần · 🏰${t.kingdoms}VQ</div>
      </div>
    </div>`).join("")}
  </div>` : `<div style="text-align:center;padding:30px;color:#475569">Chưa có dữ liệu xếp hạng</div>`}
</div>`;
  };

  // ─── gameTick ─────────────────────────────────────────────────────────────
  const _prevTick = window.gameTick;
  window.gameTick = function() {
    if (typeof _prevTick === "function") _prevTick();
    window.trData.tick++;
    if (window.trData.tick % 15 === 0) syncRegistry();
  };

  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() { load(); console.log("[TimelineRegistry V36] 📋 Danh mục dòng thời gian sẵn sàng."); }, 3150);
  });
})();
