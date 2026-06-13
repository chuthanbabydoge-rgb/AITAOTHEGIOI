(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIVERSE OBSERVATORY ENGINE V37 — Đài Quan Sát Vũ Trụ
  // So sánh · Phát hiện bất thường · Creator God tools · Tích hợp Jarvis
  // ═══════════════════════════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_universe_observatory_v37";

  function defaultData() {
    return { anomalies: [], reports: [], watched: [], tick: 0, totalAnomaly: 0 };
  }

  window.uobData = window.uobData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.uobData)); } catch(e) {} }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { const p = JSON.parse(raw); if (p) window.uobData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  // ─── Phát hiện bất thường ─────────────────────────────────────────────────
  function detectAnomalies() {
    if (!window.mvData || !window.mvData.universes) return;
    const active = window.mvData.universes.filter(u => u.status === "active");

    active.forEach(function(univ) {
      const issues = [];

      if ((univ.stability || 0) < 15) issues.push({ type:"critical_instability", msg:`⚠️ Ổn định NGUY HIỂM: ${univ.stability.toFixed(0)}%`, severity:"critical" });
      if ((univ.heatDeathRisk || 0) > 60) issues.push({ type:"heat_death_imminent", msg:`❄️ NHIỆT CHẾT ĐANG ĐẾN: ${(univ.heatDeathRisk||0).toFixed(0)}%`, severity:"critical" });
      if ((univ.population || 0) < 10000) issues.push({ type:"extinction_risk", msg:`💀 Nguy cơ tuyệt chủng: ${(univ.population/1000).toFixed(0)}K dân`, severity:"warning" });
      if (!univ.physicsLaw) issues.push({ type:"no_physics_law", msg:`⚖️ Chưa có quy luật vật lý`, severity:"info" });
      if ((univ.lifecycleAge || 0) > 600) issues.push({ type:"ancient_universe", msg:`🌑 Vũ trụ siêu cổ: tuổi ${(univ.lifecycleAge||0).toFixed(0)}`, severity:"warning" });

      issues.forEach(function(issue) {
        // Chỉ log nếu chưa có trong 5 tick gần nhất
        const recent = window.uobData.anomalies.slice(0, 20).find(a => a.univId === univ.id && a.type === issue.type);
        if (!recent) {
          window.uobData.anomalies.unshift({ univId: univ.id, name: univ.name, ...issue, year: window.year||0 });
          window.uobData.totalAnomaly++;
        }
      });
    });

    if (window.uobData.anomalies.length > 200) window.uobData.anomalies.length = 200;
  }

  function gatherObsStats() {
    const univs  = window.mvData ? window.mvData.universes : [];
    const active = univs.filter(u => u.status === "active");
    const laws   = window.ugGetPhysicsLaws ? window.ugGetPhysicsLaws() : [];
    const phases = window.ulcGetPhases ? window.ulcGetPhases() : [];

    const strongest   = active.reduce((b,u) => (u.power||0) > (b?b.power||0:0) ? u : b, null);
    const mostStable  = active.reduce((b,u) => (u.stability||0) > (b?b.stability||0:0) ? u : b, null);
    const oldest      = active.reduce((b,u) => (u.lifecycleAge||0) > (b?b.lifecycleAge||0:0) ? u : b, null);
    const mostPop     = active.reduce((b,u) => (u.population||0) > (b?b.population||0:0) ? u : b, null);
    const endangered  = active.filter(u => (u.stability||0) < 20 || (u.heatDeathRisk||0) > 50);
    const totalPop    = active.reduce((s,u) => s + (u.population||0), 0);
    const avgStab     = active.length > 0 ? active.reduce((s,u) => s + (u.stability||0), 0) / active.length : 0;

    const byPhase = phases.reduce((acc, ph) => {
      acc[ph.name] = active.filter(u => u.lifecyclePhase === ph.id).length;
      return acc;
    }, {});

    const byLaw = laws.reduce((acc, l) => {
      acc[l.name] = active.filter(u => u.physicsLaw === l.id).length;
      return acc;
    }, {});

    return { active: active.length, total: univs.length, strongest, mostStable, oldest, mostPop, endangered, totalPop, avgStab, byPhase, byLaw,
             heatDeaths: window.ulcData ? window.ulcData.heatDeaths : 0,
             totalGenerated: window.ugData ? window.ugData.totalGenerated : 0 };
  }

  window.uobGetAnomalies = function() { return window.uobData.anomalies; };
  window.uobGetStats     = gatherObsStats;

  // ─── RENDER Main Observatory ──────────────────────────────────────────────
  window.uobRenderPanel = function() {
    const el = document.getElementById("panel-universe-observatory-v37");
    if (!el) return;
    const stats      = gatherObsStats();
    const anomalies  = window.uobData.anomalies.filter(a => a.severity !== "info").slice(0, 20);
    const allUnivs   = window.mvData ? window.mvData.universes.filter(u => u.status === "active") : [];
    const phases     = window.ulcGetPhases ? window.ulcGetPhases() : [];
    const laws       = window.ugGetPhysicsLaws ? window.ugGetPhysicsLaws() : [];

    el.innerHTML = `
<div style="padding:16px;font-family:'Noto Serif SC',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
    <div>
      <h2 style="margin:0;font-size:20px;color:#fbbf24;font-family:Cinzel,serif">🔭 Đài Quan Sát V37</h2>
      <div style="font-size:11px;color:#64748b;margin-top:2px">${stats.active} vũ trụ hoạt động · ${stats.totalGenerated} đã sinh · ${stats.heatDeaths} nhiệt chết</div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button onclick="ugGenerateUniverse();uobRenderPanel()" style="padding:6px 14px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:12px">♾️ Sinh Vũ Trụ</button>
      <button onclick="uobRenderPanel()" style="padding:6px 12px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:12px">↺</button>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin-bottom:18px">
    <div style="background:#0f172a;border:1px solid #34d39444;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:700;color:#34d399">${stats.active}</div><div style="font-size:10px;color:#64748b">Đang Sống</div></div>
    <div style="background:#0f172a;border:1px solid #ef444444;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:700;color:#ef4444">${stats.endangered.length}</div><div style="font-size:10px;color:#64748b">Nguy Hiểm</div></div>
    <div style="background:#0f172a;border:1px solid #fbbf2444;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:700;color:#fbbf24">${window.uobData.totalAnomaly}</div><div style="font-size:10px;color:#64748b">Bất Thường</div></div>
    <div style="background:#0f172a;border:1px solid #475569;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:700;color:#94a3b8">${stats.heatDeaths}</div><div style="font-size:10px;color:#64748b">Nhiệt Chết</div></div>
    <div style="background:#0f172a;border:1px solid #06b6d444;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:700;color:#06b6d4">${(stats.avgStab).toFixed(0)}%</div><div style="font-size:10px;color:#64748b">Ổn Định TB</div></div>
    <div style="background:#0f172a;border:1px solid #8b5cf644;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:700;color:#8b5cf6">${(stats.totalPop/1000000).toFixed(1)}M</div><div style="font-size:10px;color:#64748b">Tổng Dân</div></div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:18px">
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:14px">
      <div style="font-size:12px;color:#94a3b8;font-weight:600;margin-bottom:10px">🏆 KỶ LỤC VŨ TRỤ</div>
      ${stats.strongest ? `<div style="margin-bottom:8px"><div style="font-size:10px;color:#64748b">💪 MẠNH NHẤT</div><div style="font-size:13px;font-weight:600;color:${stats.strongest.typeColor||"#94a3b8"}">${stats.strongest.name}</div><div style="font-size:11px;color:#64748b">Sức mạnh: ${stats.strongest.power}</div></div>` : ""}
      ${stats.mostStable ? `<div style="margin-bottom:8px"><div style="font-size:10px;color:#64748b">🧘 ỔN ĐỊNH NHẤT</div><div style="font-size:13px;font-weight:600;color:${stats.mostStable.typeColor||"#94a3b8"}">${stats.mostStable.name}</div><div style="font-size:11px;color:#34d399">${stats.mostStable.stability.toFixed(0)}%</div></div>` : ""}
      ${stats.oldest ? `<div style="margin-bottom:8px"><div style="font-size:10px;color:#64748b">🏛️ CỔ XƯA NHẤT</div><div style="font-size:13px;font-weight:600;color:${stats.oldest.typeColor||"#94a3b8"}">${stats.oldest.name}</div><div style="font-size:11px;color:#8b5cf6">Tuổi: ${(stats.oldest.lifecycleAge||0).toFixed(0)}</div></div>` : ""}
      ${stats.mostPop ? `<div><div style="font-size:10px;color:#64748b">👥 ĐÔNG DÂN NHẤT</div><div style="font-size:13px;font-weight:600;color:${stats.mostPop.typeColor||"#94a3b8"}">${stats.mostPop.name}</div><div style="font-size:11px;color:#06b6d4">${(stats.mostPop.population/1000000).toFixed(2)}M</div></div>` : ""}
      ${!stats.strongest && !stats.mostStable ? `<div style="color:#475569;font-size:12px">Chưa có vũ trụ</div>` : ""}
    </div>
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:14px">
      <div style="font-size:12px;color:#94a3b8;font-weight:600;margin-bottom:8px">🌀 THEO VÒNG ĐỜI</div>
      ${Object.entries(stats.byPhase).filter(([,v])=>v>0).map(([k,v])=>`<div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0;border-bottom:1px solid #0a0a1a"><span style="color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px">${k}</span><span style="color:#e2e8f0;font-weight:700">${v}</span></div>`).join("")}
      <div style="margin-top:8px;font-size:12px;color:#94a3b8;font-weight:600;margin-bottom:6px">⚖️ THEO QUY LUẬT</div>
      ${Object.entries(stats.byLaw).filter(([,v])=>v>0).map(([k,v])=>`<div style="display:flex;justify-content:space-between;font-size:11px;padding:2px 0;border-bottom:1px solid #0a0a1a"><span style="color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px">${k}</span><span style="color:#e2e8f0;font-weight:700">${v}</span></div>`).join("")}
    </div>
  </div>

  ${stats.endangered.length > 0 ? `
  <div style="margin-bottom:18px">
    <div style="font-size:13px;color:#ef4444;font-weight:600;margin-bottom:8px">🚨 VŨ TRỤ NGUY HIỂM (${stats.endangered.length})</div>
    <div style="display:grid;gap:6px">
      ${stats.endangered.map(u => `
      <div style="background:#0f172a;border:1px solid #ef444444;border-radius:8px;padding:10px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px">
        <div>
          <span style="font-size:12px;font-weight:600;color:${u.typeColor||"#94a3b8"}">${u.name}</span>
          <span style="font-size:10px;color:#64748b;margin-left:6px">${u.physicsLawName||"Không có quy luật"}</span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <span style="font-size:11px;color:#ef4444">⚡${u.stability.toFixed(0)}%</span>
          ${(u.heatDeathRisk||0)>0?`<span style="font-size:11px;color:#f97316">❄️${(u.heatDeathRisk||0).toFixed(0)}%</span>`:""}
          <button onclick="tmStabilize&&tmStabilize('');ulcRestore('${u.id}');uobRenderPanel()" style="padding:3px 8px;background:#0a0a1a;border:1px solid #34d399;border-radius:4px;color:#34d399;cursor:pointer;font-size:10px" title="Khôi phục vòng đời">♻️ Cứu</button>
          <button onclick="ugGenerateUniverse();uobRenderPanel()" style="padding:3px 8px;background:#0a0a1a;border:1px solid #8b5cf6;border-radius:4px;color:#8b5cf6;cursor:pointer;font-size:10px">♾️ Thay thế</button>
        </div>
      </div>`).join("")}
    </div>
  </div>` : ""}

  ${anomalies.length > 0 ? `
  <div style="margin-bottom:18px">
    <div style="font-size:13px;color:#fbbf24;font-weight:600;margin-bottom:8px">⚠️ BẤT THƯỜNG GẦN ĐÂY</div>
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;max-height:150px;overflow-y:auto">
      ${anomalies.map(a=>`<div style="font-size:11px;color:${a.severity==="critical"?"#ef4444":"#fbbf24"};padding:3px 0;border-bottom:1px solid #0a0a1a">Năm ${a.year} · [${a.name}] ${a.msg}</div>`).join("")}
    </div>
  </div>` : ""}

  <div id="ulc-section"></div>
</div>`;

    // Render lifecycle section bên trong observatory
    if (typeof window.ulcRenderSection === "function") {
      window.ulcRenderSection("ulc-section");
    }
  };

  // ─── gameTick ─────────────────────────────────────────────────────────────
  const _prevTick = window.gameTick;
  window.gameTick = function() {
    if (typeof _prevTick === "function") _prevTick();
    window.uobData.tick++;
    if (window.uobData.tick % 20 === 0) detectAnomalies();
    if (window.uobData.tick % 60 === 0) save();
  };

  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
      load();
      console.log("[UniverseObservatory V37] 🔭 Đài quan sát sẵn sàng. Bất thường:", window.uobData.totalAnomaly);
    }, 3650);
  });
})();
