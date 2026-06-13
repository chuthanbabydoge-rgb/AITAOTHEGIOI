(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // TIMELINE ANALYTICS V36 — Phân Tích Tổng Hợp Đa Dòng Thời Gian
  // ═══════════════════════════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_timeline_analytics_v36";

  function defaultData() {
    return { snapshots: [], tick: 0, reports: [] };
  }

  window.taData = window.taData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.taData)); } catch(e) {} }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { const p = JSON.parse(raw); if (p) window.taData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  function gatherStats() {
    const timelines = window.tlGetTimelines ? window.tlGetTimelines() : [];
    const active    = timelines.filter(t => t.status === "active");
    const activeWars= window.twGetActiveWars ? window.twGetActiveWars() : [];
    const travelers = window.ttvGetActive ? window.ttvGetActive() : [];

    const strongest   = active.reduce((b,t)=>((t.power||0)>(b?b.power||0:0)?t:b), null);
    const mostStable  = active.reduce((b,t)=>((t.stability||0)>(b?b.stability||0:0)?t:b), null);
    const mostUnstable= active.reduce((b,t)=>((t.stability||100)<(b?b.stability||100:100)?t:b), null);
    const oldest      = active.reduce((b,t)=>((t.age||0)>(b?b.age||0:0)?t:b), null);
    const mostPop     = active.reduce((b,t)=>((t.population||0)>(b?b.population||0:0)?t:b), null);

    return {
      total: timelines.length,
      active: active.length,
      collapsed: timelines.filter(t=>t.status==="collapsed").length,
      archived:  timelines.filter(t=>t.status==="archived").length,
      merged:    timelines.filter(t=>t.status==="merged").length,
      split:     timelines.filter(t=>t.status==="split").length,
      totalPop:  active.reduce((s,t)=>s+(t.population||0),0),
      totalGods: active.reduce((s,t)=>s+(t.gods||0),0),
      totalKingdoms: active.reduce((s,t)=>s+(t.kingdoms||0),0),
      avgStability: active.length > 0 ? active.reduce((s,t)=>s+(t.stability||0),0)/active.length : 0,
      activeWars: activeWars.length,
      travelers:  travelers.length,
      threatened: active.filter(t=>(t.stability||0)<30).length,
      strongest, mostStable, mostUnstable, oldest, mostPop,
      byType: active.reduce((acc,t)=>{acc[t.typeName]=(acc[t.typeName]||0)+1;return acc;},{}),
      year: window.year||0
    };
  }

  window.taGetStats = gatherStats;

  window.taGenerateReport = function() {
    const stats = gatherStats();
    const report = { ...stats, generatedAt: window.year||0 };
    window.taData.reports.unshift(report);
    if (window.taData.reports.length > 20) window.taData.reports.length = 20;
    save();
    return report;
  };

  // ─── RENDER Bản Đồ Dòng Thời Gian (timeline map / tree) ──────────────────
  window.tMapRenderPanel = function() {
    const el = document.getElementById("panel-timeline-map-v36");
    if (!el) return;
    const timelines = window.tlGetTimelines ? window.tlGetTimelines() : [];
    const active    = timelines.filter(t => t.status === "active");

    // Build tree positions
    const positions = {};
    const roots     = timelines.filter(t => !t.parentId);
    const W = 780, H = 400;

    roots.forEach(function(r, i) {
      positions[r.id] = { x: 80 + i * 160, y: 60 };
      _placeChildren(r.id, timelines, positions, 0);
    });

    function _placeChildren(pid, all, pos, depth) {
      const children = all.filter(t => t.parentId === pid);
      const parentPos = pos[pid] || { x: W/2, y: 60 };
      children.forEach(function(child, i) {
        pos[child.id] = {
          x: parentPos.x + (i - (children.length-1)/2) * 120,
          y: parentPos.y + 90
        };
        _placeChildren(child.id, all, pos, depth + 1);
      });
    }

    // Build SVG links
    const links = timelines.filter(t => t.parentId && positions[t.id] && positions[t.parentId]).map(t => {
      const from = positions[t.parentId];
      const to   = positions[t.id];
      return `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${t.typeColor}88" stroke-width="1.5" stroke-dasharray="4,2"/>`;
    }).join("");

    // Build SVG nodes
    const nodes = timelines.map(t => {
      const pos = positions[t.id];
      if (!pos) return "";
      const r     = t.status === "active" ? 18 : 12;
      const color = t.status === "active" ? t.typeColor : "#334155";
      const glow  = t.status === "active" ? `<circle cx="${pos.x}" cy="${pos.y}" r="${r+5}" fill="${color}22"/>` : "";
      return `
<g onclick="window.tlData.activeId='${t.id}';taRenderPanel()" style="cursor:pointer">
  ${glow}
  <circle cx="${pos.x}" cy="${pos.y}" r="${r}" fill="${color}55" stroke="${color}" stroke-width="${t.status==="active"?1.5:0.8}"/>
  <text x="${pos.x}" y="${pos.y+4}" text-anchor="middle" font-size="8" fill="${color}" font-family="Noto Serif SC,serif" font-weight="600">${t.name.substring(0,6)}</text>
  <text x="${pos.x}" y="${pos.y+r+12}" text-anchor="middle" font-size="8" fill="#64748b">${t.stability?t.stability.toFixed(0)+"%" : "?"}</text>
</g>`;
    }).join("");

    el.innerHTML = `
<div style="padding:16px;font-family:'Noto Serif SC',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
    <h2 style="margin:0;font-size:20px;color:#8b5cf6;font-family:Cinzel,serif">🗺 Bản Đồ Dòng Thời Gian V36</h2>
    <button onclick="tMapRenderPanel()" style="padding:6px 12px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:12px">↺ Refresh</button>
  </div>

  <div style="background:#060615;border:1px solid #1e293b;border-radius:12px;overflow:hidden;margin-bottom:16px">
    ${timelines.length === 0 ?
    `<div style="height:250px;display:flex;align-items:center;justify-content:center;color:#475569;flex-direction:column;gap:8px"><div style="font-size:36px">🌀</div><div>Chưa có dòng thời gian</div></div>` :
    `<svg width="100%" viewBox="0 0 ${W} ${H}" style="display:block;max-height:380px">
      <rect width="${W}" height="${H}" fill="#060615"/>
      ${Array.from({length:60},()=>`<circle cx="${Math.random()*W}" cy="${Math.random()*H}" r="${Math.random()}" fill="white" opacity="${Math.random()*0.4+0.1}"/>`).join("")}
      ${links}
      ${nodes}
    </svg>`}
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:8px;font-size:11px;color:#64748b">
    <span style="display:inline-flex;align-items:center;gap:3px"><span style="width:8px;height:8px;border-radius:50%;background:#fbbf24;display:inline-block"></span>Chính Thống</span>
    <span style="display:inline-flex;align-items:center;gap:3px"><span style="width:8px;height:8px;border-radius:50%;background:#6366f1;display:inline-block"></span>Đen Tối</span>
    <span style="display:inline-flex;align-items:center;gap:3px"><span style="width:8px;height:8px;border-radius:50%;background:#f59e0b;display:inline-block"></span>Vàng Son</span>
    <span style="display:inline-flex;align-items:center;gap:3px"><span style="width:8px;height:8px;border-radius:50%;background:#ef4444;display:inline-block"></span>Tận Thế</span>
    <span style="display:inline-flex;align-items:center;gap:3px"><span style="width:8px;height:8px;border-radius:50%;background:#334155;display:inline-block"></span>Không Hoạt Động</span>
  </div>
</div>`;
  };

  // ─── RENDER Analytics ────────────────────────────────────────────────────
  window.taRenderPanel = function() {
    const el = document.getElementById("panel-timeline-analytics-v36");
    if (!el) { window.trRenderPanel && window.trRenderPanel(); return; }
    const stats = gatherStats();

    el.innerHTML = `
<div style="padding:16px;font-family:'Noto Serif SC',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
    <h2 style="margin:0;font-size:20px;color:#06b6d4;font-family:Cinzel,serif">📊 Phân Tích Tổng Hợp V36</h2>
    <button onclick="taGenerateReport();taRenderPanel()" style="padding:6px 14px;background:linear-gradient(135deg,#06b6d4,#0891b2);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:12px">📋 Tạo Báo Cáo</button>
  </div>

  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:18px">
    <div style="background:#0f172a;border:1px solid #34d39444;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:700;color:#34d399">${stats.active}</div><div style="font-size:10px;color:#64748b">Đang Hoạt Động</div></div>
    <div style="background:#0f172a;border:1px solid #ef444444;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:700;color:#ef4444">${stats.threatened}</div><div style="font-size:10px;color:#64748b">Bị Đe Dọa</div></div>
    <div style="background:#0f172a;border:1px solid #fbbf2444;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:700;color:#fbbf24">${stats.activeWars}</div><div style="font-size:10px;color:#64748b">Chiến Tranh</div></div>
    <div style="background:#0f172a;border:1px solid #10b98144;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:700;color:#10b981">${stats.travelers}</div><div style="font-size:10px;color:#64748b">Du Hành</div></div>
    <div style="background:#0f172a;border:1px solid #8b5cf644;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:700;color:#8b5cf6">${stats.totalGods}</div><div style="font-size:10px;color:#64748b">Tổng Thần</div></div>
    <div style="background:#0f172a;border:1px solid #06b6d444;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:700;color:#06b6d4">${(stats.avgStability).toFixed(0)}%</div><div style="font-size:10px;color:#64748b">Ổn Định TB</div></div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:18px">
    ${stats.strongest ? `<div style="background:#0f172a;border:1px solid #fbbf2444;border-radius:8px;padding:12px"><div style="font-size:10px;color:#64748b;margin-bottom:4px">💪 MẠNH NHẤT</div><div style="font-size:13px;font-weight:700;color:${stats.strongest.typeColor}">${stats.strongest.name}</div><div style="font-size:11px;color:#64748b">Sức mạnh: ${stats.strongest.power}</div></div>` : ""}
    ${stats.mostStable ? `<div style="background:#0f172a;border:1px solid #34d39444;border-radius:8px;padding:12px"><div style="font-size:10px;color:#64748b;margin-bottom:4px">🧘 ỔN ĐỊNH NHẤT</div><div style="font-size:13px;font-weight:700;color:${stats.mostStable.typeColor}">${stats.mostStable.name}</div><div style="font-size:11px;color:#34d399">${stats.mostStable.stability.toFixed(0)}%</div></div>` : ""}
    ${stats.mostUnstable && stats.mostUnstable !== stats.mostStable ? `<div style="background:#0f172a;border:1px solid #ef444444;border-radius:8px;padding:12px"><div style="font-size:10px;color:#ef4444;margin-bottom:4px">⚠️ BẤT ỔN NHẤT</div><div style="font-size:13px;font-weight:700;color:${stats.mostUnstable.typeColor}">${stats.mostUnstable.name}</div><div style="font-size:11px;color:#ef4444">${stats.mostUnstable.stability.toFixed(0)}%</div></div>` : ""}
    ${stats.oldest ? `<div style="background:#0f172a;border:1px solid #8b5cf644;border-radius:8px;padding:12px"><div style="font-size:10px;color:#64748b;margin-bottom:4px">🏛️ LÂU ĐỜI NHẤT</div><div style="font-size:13px;font-weight:700;color:${stats.oldest.typeColor}">${stats.oldest.name}</div><div style="font-size:11px;color:#8b5cf6">Tuổi: ${stats.oldest.age} tích</div></div>` : ""}
  </div>

  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:18px">
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px">
      <div style="font-size:11px;color:#64748b;margin-bottom:8px">THEO LOẠI</div>
      ${Object.entries(stats.byType).map(([k,v])=>`<div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0;border-bottom:1px solid #0a0a1a"><span style="color:#94a3b8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:130px">${k}</span><span style="color:#e2e8f0;font-weight:700">${v}</span></div>`).join("")}
    </div>
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px">
      <div style="font-size:11px;color:#64748b;margin-bottom:8px">TRẠNG THÁI</div>
      ${[["🟢 Hoạt Động",stats.active,"#34d399"],["☠️ Sụp Đổ",stats.collapsed,"#ef4444"],["📦 Lưu Trữ",stats.archived,"#8b5cf6"],["🔗 Hợp Nhất",stats.merged,"#06b6d4"],["⚡ Tách",stats.split,"#fbbf24"]].map(([l,v,c])=>`<div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0;border-bottom:1px solid #0a0a1a"><span style="color:#94a3b8">${l}</span><span style="color:${c};font-weight:700">${v}</span></div>`).join("")}
      <div style="margin-top:8px;font-size:11px;color:#64748b">Tổng cộng: <span style="color:#e2e8f0;font-weight:700">${stats.total}</span></div>
    </div>
  </div>

  ${stats.threatened > 0 ? `
  <div style="background:#0f172a;border:1px solid #ef444444;border-radius:8px;padding:12px;margin-bottom:14px">
    <div style="font-size:12px;color:#ef4444;font-weight:600;margin-bottom:8px">🚨 DÒNG THỜI GIAN NGUY HIỂM (ổn định < 30%)</div>
    ${(window.tlGetActiveTimelines?window.tlGetActiveTimelines():[]).filter(t=>(t.stability||0)<30).map(t=>`
    <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid #0a0a1a">
      <span style="font-size:12px;color:${t.typeColor}">${t.name}</span>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:11px;color:#ef4444">${t.stability.toFixed(0)}%</span>
        <button onclick="tmStabilize('${t.id}',20);taRenderPanel()" style="padding:3px 8px;background:#0a0a1a;border:1px solid #34d399;border-radius:4px;color:#34d399;cursor:pointer;font-size:10px">Cứu</button>
      </div>
    </div>`).join("")}
  </div>` : ""}

  ${window.taData.reports.length > 0 ? `
  <div>
    <div style="font-size:12px;color:#94a3b8;font-weight:600;margin-bottom:6px">📋 BÁO CÁO GẦN ĐÂY</div>
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;max-height:100px;overflow-y:auto">
      ${window.taData.reports.slice(0,5).map(r=>`<div style="font-size:11px;color:#64748b;padding:3px 0;border-bottom:1px solid #0a0a1a">Năm ${r.generatedAt}: ${r.active} hoạt động · ${r.threatened} bị đe dọa · ${r.activeWars} chiến tranh</div>`).join("")}
    </div>
  </div>` : ""}
</div>`;
  };

  // ─── gameTick ─────────────────────────────────────────────────────────────
  const _prevTick = window.gameTick;
  window.gameTick = function() {
    if (typeof _prevTick === "function") _prevTick();
    window.taData.tick++;
    if (window.taData.tick % 100 === 0) {
      window.taData.snapshots.unshift({ stats: gatherStats(), year: window.year||0 });
      if (window.taData.snapshots.length > 30) window.taData.snapshots.length = 30;
      save();
    }
  };

  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() { load(); console.log("[TimelineAnalytics V36] 📊 Phân tích dòng thời gian sẵn sàng."); }, 3450);
  });
})();
