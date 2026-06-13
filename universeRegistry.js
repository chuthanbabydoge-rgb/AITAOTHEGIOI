(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIVERSE REGISTRY V35 — Danh Mục Vũ Trụ & Thống Kê
  // ═══════════════════════════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_universe_registry_v35";

  function defaultData() {
    return {
      registry: {},
      rankings: [],
      lastRank: 0
    };
  }

  window.urData = window.urData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.urData)); } catch(e) {} }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { const p = JSON.parse(raw); if (p && p.registry) window.urData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  // ─── Cập nhật registry từ mvData ──────────────────────────────────────────
  function syncRegistry() {
    if (!window.mvData || !window.mvData.universes) return;
    window.mvData.universes.forEach(function(u) {
      window.urData.registry[u.id] = {
        id: u.id,
        name: u.name,
        type: u.type,
        typeName: u.typeName,
        typeColor: u.typeColor,
        status: u.status,
        age: u.age,
        population: u.population,
        stability: u.stability,
        power: u.power,
        kingdoms: u.kingdoms,
        gods: u.gods,
        registeredAt: window.year || 0
      };
    });
    updateRankings();
    save();
  }

  function updateRankings() {
    const active = Object.values(window.urData.registry).filter(u => u.status === "active");
    window.urData.rankings = active.sort((a, b) => (b.power + b.population/10000) - (a.power + a.population/10000)).slice(0, 20).map((u, i) => ({ rank: i+1, ...u }));
    window.urData.lastRank = window.year || 0;
  }

  // ─── PUBLIC ───────────────────────────────────────────────────────────────
  window.urGetRankings   = function() { syncRegistry(); return window.urData.rankings; };
  window.urGetRegistry   = function() { syncRegistry(); return window.urData.registry; };
  window.urGetUnivInfo   = function(uid) { return window.urData.registry[uid] || null; };

  // ─── RENDER Rankings Panel ────────────────────────────────────────────────
  window.urRenderPanel = function() {
    const el = document.getElementById("panel-universe-rankings");
    if (!el) return;
    syncRegistry();
    const rankings = window.urData.rankings;

    el.innerHTML = `
<div style="padding:16px;font-family:'Noto Serif SC',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">
  <div style="margin-bottom:16px">
    <h2 style="margin:0;font-size:20px;color:#fbbf24;font-family:Cinzel,serif">📊 Bảng Xếp Hạng Vũ Trụ</h2>
    <div style="font-size:11px;color:#64748b;margin-top:2px">Xếp hạng dựa trên sức mạnh tổng hợp · Cập nhật năm ${window.urData.lastRank}</div>
  </div>

  ${rankings.length === 0 ? `<div style="text-align:center;padding:40px;color:#475569"><div style="font-size:40px;margin-bottom:8px">📊</div><div>Chưa có vũ trụ để xếp hạng</div></div>` :
  `<div style="display:grid;gap:8px">
    ${rankings.map(u => `
    <div style="background:#0f172a;border:1px solid ${u.rank<=3?"#fbbf2444":"#1e293b"};border-radius:8px;padding:12px;display:flex;align-items:center;gap:12px">
      <div style="width:36px;height:36px;border-radius:50%;background:${u.rank===1?"linear-gradient(135deg,#fbbf24,#f59e0b)":u.rank===2?"linear-gradient(135deg,#94a3b8,#64748b)":u.rank===3?"linear-gradient(135deg,#f97316,#ea580c)":"#1e293b"};display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:${u.rank<=3?"#fff":"#64748b"};flex-shrink:0">${u.rank}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;color:${u.typeColor};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${u.name}</div>
        <div style="font-size:11px;color:#64748b">${u.typeName} · 👥 ${(u.population/1000).toFixed(0)}K · 🏰 ${u.kingdoms} vương quốc · ✨ ${u.gods} thần</div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-size:16px;font-weight:700;color:${u.stability>60?"#34d399":u.stability>30?"#fbbf24":"#ef4444"}">${u.stability.toFixed(0)}%</div>
        <div style="font-size:10px;color:#64748b">ổn định</div>
      </div>
    </div>`).join("")}
  </div>`}

  <div style="margin-top:20px">
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:8px">📊 THỐNG KÊ TỔNG HỢP</div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px">
        <div style="font-size:11px;color:#64748b;margin-bottom:8px">PHÂN LOẠI VŨ TRỤ</div>
        ${Object.values(window.urData.registry).filter(u=>u.status==="active").reduce((acc,u)=>{acc[u.typeName]=(acc[u.typeName]||0)+1;return acc;},{}) && Object.entries(Object.values(window.urData.registry).filter(u=>u.status==="active").reduce((acc,u)=>{acc[u.typeName]=(acc[u.typeName]||0)+1;return acc;},{})).map(([k,v])=>`<div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0;border-bottom:1px solid #1e293b"><span style="color:#94a3b8">${k}</span><span style="color:#e2e8f0;font-weight:600">${v}</span></div>`).join("")}
      </div>
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px">
        <div style="font-size:11px;color:#64748b;margin-bottom:8px">TRẠNG THÁI</div>
        ${[["active","🟢 Hoạt Động","#34d399"],["collapsed","🔴 Sụp Đổ","#ef4444"],["merged","🔗 Hợp Nhất","#8b5cf6"],["split","⚡ Đã Tách","#fbbf24"]].map(([s,l,c])=>`<div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0;border-bottom:1px solid #1e293b"><span style="color:#94a3b8">${l}</span><span style="color:${c};font-weight:600">${Object.values(window.urData.registry).filter(u=>u.status===s).length}</span></div>`).join("")}
      </div>
    </div>
  </div>
</div>`;
  };

  // ─── gameTick ─────────────────────────────────────────────────────────────
  const _prevTick = window.gameTick;
  window.gameTick = function() {
    if (typeof _prevTick === "function") _prevTick();
    if ((window.year || 0) % 10 === 0) syncRegistry();
  };

  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
      load();
      console.log("[UniverseRegistry V35] 📋 Danh mục vũ trụ sẵn sàng.");
    }, 2300);
  });

})();
