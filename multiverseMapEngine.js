(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTIVERSE MAP ENGINE V35 — Bản Đồ Đa Vũ Trụ
  // ═══════════════════════════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_multiverse_map_v35";

  function defaultData() {
    return { positions: {}, tick: 0 };
  }

  window.mmData = window.mmData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.mmData)); } catch(e) {} }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { const p = JSON.parse(raw); if (p) window.mmData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  function getOrCreatePos(uid) {
    if (!window.mmData.positions[uid]) {
      window.mmData.positions[uid] = {
        x: Math.random() * 700 + 50,
        y: Math.random() * 400 + 50,
        vx: (Math.random()-0.5)*0.5,
        vy: (Math.random()-0.5)*0.5
      };
    }
    return window.mmData.positions[uid];
  }

  window.mmRenderPanel = function() {
    const el = document.getElementById("panel-multiverse-map");
    if (!el) return;
    const universes = (window.mvData && window.mvData.universes) ? window.mvData.universes.filter(u => u.status === "active") : [];
    const portals   = window.pnGetOpenPortals ? window.pnGetOpenPortals() : [];
    const travelers = window.utGetActive ? window.utGetActive() : [];

    universes.forEach(u => getOrCreatePos(u.id));

    const W = 800, H = 500;

    const svgUniverse = universes.map(u => {
      const pos = window.mmData.positions[u.id];
      if (!pos) return "";
      const r = Math.max(18, Math.min(45, Math.sqrt(u.population / 5000)));
      const glow = u.stability > 60 ? u.typeColor : u.stability > 30 ? "#fbbf24" : "#ef4444";
      return `
<g class="mv-node" onclick="mvSelectUniverse('${u.id}');mmShowDetail('${u.id}')" style="cursor:pointer">
  <circle cx="${pos.x}" cy="${pos.y}" r="${r+6}" fill="${glow}22"/>
  <circle cx="${pos.x}" cy="${pos.y}" r="${r}" fill="${u.typeColor}44" stroke="${u.typeColor}" stroke-width="1.5"/>
  <circle cx="${pos.x}" cy="${pos.y}" r="${r*0.6}" fill="${u.typeColor}88"/>
  <text x="${pos.x}" y="${pos.y+4}" text-anchor="middle" font-size="11" fill="${u.typeColor}" font-family="Noto Serif SC,serif" font-weight="600">${u.name.substring(0,8)}</text>
  <text x="${pos.x}" y="${pos.y+r+14}" text-anchor="middle" font-size="9" fill="#94a3b8" font-family="Noto Serif SC,serif">${u.stability.toFixed(0)}%</text>
</g>`;
    }).join("");

    const svgPortals = portals.map(p => {
      const posF = window.mmData.positions[p.fromUid];
      const posT = window.mmData.positions[p.toUid];
      if (!posF || !posT) return "";
      const mx = (posF.x + posT.x) / 2;
      const my = (posF.y + posT.y) / 2;
      return `
<line x1="${posF.x}" y1="${posF.y}" x2="${posT.x}" y2="${posT.y}" stroke="${p.typeColor}" stroke-width="1.5" stroke-dasharray="6,3" opacity="0.7"/>
<circle cx="${mx}" cy="${my}" r="4" fill="${p.typeColor}" opacity="0.9"/>`;
    }).join("");

    const svgTravelers = travelers.map((j, i) => {
      const posF = window.mmData.positions[j.fromUid];
      const posT = window.mmData.positions[j.toUid];
      if (!posF || !posT) return "";
      const prog = Math.min(1, Math.max(0, ((window.year||0) - j.startYear) / j.travelTime));
      const tx = posF.x + (posT.x - posF.x) * prog;
      const ty = posF.y + (posT.y - posF.y) * prog;
      return `<circle cx="${tx}" cy="${ty}" r="5" fill="#10b981" stroke="#fff" stroke-width="1"/>`;
    }).join("");

    el.innerHTML = `
<div style="padding:16px;font-family:'Noto Serif SC',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
    <div>
      <h2 style="margin:0;font-size:20px;color:#8b5cf6;font-family:Cinzel,serif">🗺 Bản Đồ Đa Vũ Trụ V35</h2>
      <div style="font-size:11px;color:#64748b;margin-top:2px">${universes.length} vũ trụ · ${portals.length} cổng · ${travelers.length} đang du hành</div>
    </div>
    <button onclick="mmRenderPanel()" style="padding:6px 12px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:12px">↺ Refresh</button>
  </div>

  <div style="background:#060615;border:1px solid #1e293b;border-radius:12px;overflow:hidden;margin-bottom:16px">
    ${universes.length === 0 ?
      `<div style="height:300px;display:flex;align-items:center;justify-content:center;color:#475569;flex-direction:column;gap:8px"><div style="font-size:40px">🌌</div><div>Chưa có vũ trụ nào để hiển thị</div></div>` :
      `<svg width="100%" viewBox="0 0 ${W} ${H}" style="display:block;max-height:420px">
        <defs>
          <radialGradient id="bgGrad"><stop offset="0%" stop-color="#0a0520"/><stop offset="100%" stop-color="#060615"/></radialGradient>
        </defs>
        <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>
        ${Array.from({length:80},()=>`<circle cx="${Math.random()*W}" cy="${Math.random()*H}" r="${Math.random()*1.5}" fill="white" opacity="${Math.random()*0.5+0.1}"/>`).join("")}
        ${svgPortals}
        ${svgUniverse}
        ${svgTravelers}
      </svg>`}
  </div>

  <div id="mm-detail" style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;min-height:60px">
    <div style="font-size:12px;color:#475569">Nhấn vào một vũ trụ để xem chi tiết</div>
  </div>

  <div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:10px">
    <div style="font-size:11px;color:#64748b;display:flex;align-items:center;gap:4px"><span style="display:inline-block;width:20px;height:2px;background:#ef4444;border-top:2px dashed #ef4444"></span>Cổng đang mở</div>
    <div style="font-size:11px;color:#64748b;display:flex;align-items:center;gap:4px"><span style="background:#10b981;border-radius:50%;width:8px;height:8px;display:inline-block"></span>Đang du hành</div>
    <div style="font-size:11px;color:#64748b;display:flex;align-items:center;gap:4px"><span style="background:#34d399;border-radius:50%;width:8px;height:8px;display:inline-block"></span>Ổn định cao</div>
    <div style="font-size:11px;color:#64748b;display:flex;align-items:center;gap:4px"><span style="background:#ef4444;border-radius:50%;width:8px;height:8px;display:inline-block"></span>Nguy hiểm</div>
  </div>
</div>`;
  };

  window.mmShowDetail = function(uid) {
    const el = document.getElementById("mm-detail");
    if (!el) return;
    const u = window.mvGetUniverseById && window.mvGetUniverseById(uid);
    if (!u) return;
    const portals = (window.pnGetOpenPortals ? window.pnGetOpenPortals() : []).filter(p => p.fromUid===uid||p.toUid===uid);
    const travelers = (window.utGetActive ? window.utGetActive() : []).filter(j => j.fromUid===uid||j.toUid===uid);
    el.innerHTML = `
<div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:10px">
  <div>
    <div style="font-size:14px;font-weight:700;color:${u.typeColor}">${u.name} <span style="font-size:11px;font-weight:400;color:#64748b">${u.typeName}</span></div>
    <div style="font-size:11px;color:#64748b;margin-top:4px">${u.desc}</div>
    <div style="font-size:11px;color:#94a3b8;margin-top:6px">
      👥 ${(u.population/1000).toFixed(0)}K dân · 🏰 ${u.kingdoms} vương quốc · ✨ ${u.gods} thần · ⚡ ${u.stability.toFixed(0)}% ổn định
    </div>
    <div style="font-size:11px;color:#64748b;margin-top:3px">🌀 ${portals.length} cổng kết nối · ✈️ ${travelers.length} đang du hành</div>
  </div>
  <div style="display:flex;gap:6px;flex-wrap:wrap">
    <button onclick="umBoostStability('${uid}',20);mmRenderPanel()" style="padding:4px 10px;background:#0f172a;border:1px solid #34d399;border-radius:5px;color:#34d399;cursor:pointer;font-size:11px">+Ổn Định</button>
    <button onclick="pnRenderCreatePortal&&pnRenderCreatePortal()" style="padding:4px 10px;background:#0f172a;border:1px solid #06b6d4;border-radius:5px;color:#06b6d4;cursor:pointer;font-size:11px">+ Cổng</button>
  </div>
</div>`;
  };

  // ─── gameTick ─────────────────────────────────────────────────────────────
  const _prevTick = window.gameTick;
  window.gameTick = function() {
    if (typeof _prevTick === "function") _prevTick();
    window.mmData.tick++;
    if (window.mmData.tick % 5 === 0) {
      Object.values(window.mmData.positions).forEach(function(pos) {
        pos.x += pos.vx; pos.y += pos.vy;
        if (pos.x < 30 || pos.x > 770) pos.vx *= -1;
        if (pos.y < 30 || pos.y > 470) pos.vy *= -1;
        pos.x = Math.max(30, Math.min(770, pos.x));
        pos.y = Math.max(30, Math.min(470, pos.y));
      });
    }
    if (window.mmData.tick % 60 === 0) save();
  };

  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
      load();
      console.log("[MultiverseMapEngine V35] 🗺 Bản đồ đa vũ trụ sẵn sàng.");
    }, 2700);
  });

})();
