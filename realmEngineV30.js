(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════
  // REALM ENGINE V30 — 7 Cõi Giới + Thăng Thiên/Giáng Thiên
  // ═══════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_realm_v30";

  const REALMS_DEF = [
    { id:'mortal',      tier:1, name:'🌍 Giới Phàm Trần',  energyBase:10,  maxPop:100000, color:'#94a3b8', desc:'Cõi của phàm nhân, nơi khởi đầu mọi hành trình tu luyện.' },
    { id:'cultivation', tier:2, name:'🌿 Giới Tu Luyện',   energyBase:40,  maxPop:10000,  color:'#34d399', desc:'Cõi của các tu sĩ mạnh mẽ, linh khí dồi dào.' },
    { id:'immortal',    tier:3, name:'✨ Giới Bất Tử',     energyBase:120, maxPop:1000,   color:'#60a5fa', desc:'Cõi của bất tử, nơi thời gian không còn ý nghĩa.' },
    { id:'divine',      tier:4, name:'⚡ Giới Thần Thánh', energyBase:400, maxPop:500,    color:'#facc15', desc:'Cõi của thần linh, uy quyền bao phủ thiên hạ.' },
    { id:'heaven',      tier:5, name:'☁️ Giới Thiên Đường', energyBase:1200, maxPop:100,  color:'#f0abfc', desc:'Đỉnh cao của sự tồn tại, chỉ Thiên Thần mới đặt chân vào.' },
    { id:'void',        tier:6, name:'🌑 Giới Hư Không',   energyBase:4000, maxPop:20,   color:'#6366f1', desc:'Cõi nằm ngoài quy luật, nơi hư vô và tồn tại hòa làm một.' },
    { id:'creation',    tier:7, name:'🌌 Giới Sáng Tạo',   energyBase:99999, maxPop:3,   color:'#f97316', desc:'Cõi của Đấng Tạo Hóa. Không ai biết nơi này thực sự là gì.' }
  ];

  const ASCENSION_REQS = [
    null,
    { fromTier:1, toTier:2, minLevel:10,  minFame:500,   challenge:'Vượt Thiên Môn',     energyCost:100  },
    { fromTier:2, toTier:3, minLevel:30,  minFame:2000,  challenge:'Thử Thách Bất Tử',   energyCost:500  },
    { fromTier:3, toTier:4, minLevel:60,  minFame:8000,  challenge:'Phán Xét Thần Thánh', energyCost:2000 },
    { fromTier:4, toTier:5, minLevel:100, minFame:30000, challenge:'Cửa Thiên Đường',     energyCost:8000 },
    { fromTier:5, toTier:6, minLevel:150, minFame:99999, challenge:'Vực Hư Không',        energyCost:30000},
    { fromTier:6, toTier:7, minLevel:200, minFame:999999,challenge:'Ý Chí Sáng Tạo',      energyCost:99999}
  ];

  function defaultData() {
    return {
      realms: REALMS_DEF.map(r => ({
        ...r,
        population: r.id === 'mortal' ? 50000 : 0,
        energyLevel: r.energyBase,
        stability: 100,
        resources: { spirit: r.energyBase, gold: Math.floor(r.energyBase * 2), lifeForce: Math.floor(r.energyBase * 0.5) },
        ruler: r.id === 'mortal' ? 'Thiên Tử Phàm Trần' : '— Trống —',
        events: []
      })),
      ascensions: [],
      travelers: [],
      log: [],
      tick: 0
    };
  }

  window.realmV30Data = window.realmV30Data || defaultData();

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.realmV30Data)); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.realmV30Data = Object.assign(defaultData(), JSON.parse(d));
    } catch(e) {}
  }

  function getRealm(id) {
    return window.realmV30Data.realms.find(r => r.id === id);
  }

  // Thăng thiên NPC
  window.realmV30Ascend = function(npcName, fromId, toId) {
    const from = getRealm(fromId);
    const to   = getRealm(toId);
    if (!from || !to) return;
    from.population = Math.max(0, (from.population||0) - 1);
    to.population   = (to.population||0) + 1;
    from.energyLevel = Math.max(0, from.energyLevel - (to.tier - from.tier) * 50);
    to.stability = Math.min(100, (to.stability||100) - 3);
    const evt = { year: window.year || 1, npc: npcName, from: from.name, to: to.name };
    window.realmV30Data.ascensions.push(evt);
    window.realmV30Data.log.unshift(`[Năm ${evt.year}] ${npcName} thăng thiên từ ${from.name} → ${to.name}`);
    if (window.realmV30Data.log.length > 60) window.realmV30Data.log.length = 60;
    if (typeof window.htAddEvent === 'function') {
      window.htAddEvent({ year: evt.year, type:'divine', title:`✨ ${npcName} Thăng Thiên lên ${to.name}`, color:'#facc15' });
    }
    if (typeof window.wmeAddMemory === 'function') {
      window.wmeAddMemory({ year: evt.year, category:'realm', title:`Thăng Thiên: ${npcName}`, content:`${npcName} vượt qua ${ASCENSION_REQS[to.tier-1]?.challenge||'thử thách'} và thăng lên ${to.name}` });
    }
    save();
  };

  // Giáng thiên
  window.realmV30Descend = function(npcName, fromId, toId) {
    const from = getRealm(fromId);
    const to   = getRealm(toId);
    if (!from || !to) return;
    from.population = Math.max(0, (from.population||0) - 1);
    to.population   = (to.population||0) + 1;
    window.realmV30Data.log.unshift(`[Năm ${window.year||1}] ⬇️ ${npcName} giáng thiên từ ${from.name} → ${to.name}`);
    save();
  };

  // Tick logic
  window.realmV30Tick = function() {
    const data = window.realmV30Data;
    data.tick = (data.tick||0) + 1;
    const y = window.year || 1;

    // Cập nhật dân số từ countries
    if (data.tick % 10 === 0) {
      const total = (window.countries||[]).reduce((s,c)=>s+(c.population||0),0);
      const mortal = getRealm('mortal');
      if (mortal) mortal.population = total;
    }

    // Cập nhật năng lượng
    data.realms.forEach(r => {
      r.energyLevel = Math.max(r.energyBase * 0.5,
        Math.min(r.energyBase * 1.5, r.energyLevel + Math.random() * 4 - 1));
      r.stability = Math.max(50, Math.min(100, r.stability + Math.random() * 2 - 0.5));
    });

    // Ngẫu nhiên thăng thiên NPC mạnh
    if (data.tick % 30 === 0 && Math.random() < 0.2) {
      const npcs = window.npcs || [];
      const strong = npcs.filter(n => (n.level||0) >= 10 && !(n._realm) );
      if (strong.length > 0) {
        const npc = strong[Math.floor(Math.random() * strong.length)];
        const tier = npc.level >= 150 ? 5 : npc.level >= 100 ? 4 : npc.level >= 60 ? 3 : npc.level >= 30 ? 2 : 1;
        const realmIds = ['mortal','cultivation','immortal','divine','heaven'];
        const targetId = realmIds[Math.min(tier, realmIds.length-1)];
        const currentId = realmIds[Math.max(0, tier-1)];
        if (targetId !== currentId) {
          npc._realm = targetId;
          window.realmV30Ascend(npc.name, currentId, targetId);
        }
      }
    }

    if (data.tick % 50 === 0) save();
  };

  // Render panel chính
  window.realmV30RenderPanel = function() {
    const el = document.getElementById('panel-realm-v30');
    if (!el) return;
    const data = window.realmV30Data;
    let h = `<div style="padding:16px;background:#0f172a;min-height:100%;color:#e2e8f0;font-family:monospace">
      <h2 style="color:#facc15;margin:0 0 16px">🌌 Bảy Cõi Giới</h2>`;

    data.realms.forEach(r => {
      const pct = Math.round((r.energyLevel / (r.energyBase * 1.5)) * 100);
      h += `<div style="background:#1e293b;border:1px solid ${r.color}44;border-radius:8px;padding:14px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:1.1em;font-weight:bold;color:${r.color}">${r.name}</span>
          <span style="color:#94a3b8;font-size:0.85em">Tầng ${r.tier}</span>
        </div>
        <div style="color:#94a3b8;font-size:0.82em;margin:4px 0">${r.desc}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px;font-size:0.85em">
          <div>👥 Dân số: <b style="color:#fff">${(r.population||0).toLocaleString()}</b></div>
          <div>⚡ Năng lượng: <b style="color:${r.color}">${Math.round(r.energyLevel)}</b></div>
          <div>🛡 Ổn định: <b style="color:${r.stability>=80?'#34d399':r.stability>=50?'#fbbf24':'#f87171'}">${Math.round(r.stability)}%</b></div>
          <div>💎 Linh khí: <b style="color:#a78bfa">${Math.round(r.resources.spirit)}</b></div>
          <div>💰 Vàng: <b style="color:#fbbf24">${Math.round(r.resources.gold)}</b></div>
          <div>👑 Cai trị: <b style="color:#f0abfc">${r.ruler}</b></div>
        </div>
        <div style="background:#0f172a;border-radius:4px;height:6px;margin-top:10px">
          <div style="background:${r.color};height:6px;border-radius:4px;width:${Math.min(100,pct)}%;transition:width 0.3s"></div>
        </div>
      </div>`;
    });

    // Yêu cầu thăng thiên
    h += `<h3 style="color:#60a5fa;margin:20px 0 10px">📋 Yêu Cầu Thăng Thiên</h3>
      <table style="width:100%;border-collapse:collapse;font-size:0.83em">
        <tr style="color:#94a3b8;border-bottom:1px solid #334155">
          <th style="text-align:left;padding:6px">Hành Trình</th>
          <th>Cấp Tối Thiểu</th>
          <th>Danh Tiếng</th>
          <th>Thử Thách</th>
          <th>Linh Lực</th>
        </tr>`;
    ASCENSION_REQS.filter(Boolean).forEach(req => {
      const fn = data.realms.find(r => r.tier === req.fromTier);
      const tn = data.realms.find(r => r.tier === req.toTier);
      h += `<tr style="border-bottom:1px solid #1e293b">
        <td style="padding:5px;color:#e2e8f0">${fn?.name||''}→${tn?.name||''}</td>
        <td style="text-align:center;color:#34d399">Lv.${req.minLevel}</td>
        <td style="text-align:center;color:#fbbf24">${req.minFame.toLocaleString()}</td>
        <td style="text-align:center;color:#a78bfa">${req.challenge}</td>
        <td style="text-align:center;color:#60a5fa">${req.energyCost.toLocaleString()}</td>
      </tr>`;
    });
    h += `</table>`;

    // Log
    h += `<h3 style="color:#60a5fa;margin:20px 0 8px">📜 Lịch Sử Thăng Thiên Gần Đây</h3>
      <div style="background:#1e293b;border-radius:6px;padding:10px;max-height:150px;overflow-y:auto;font-size:0.82em">`;
    if (data.log.length === 0) {
      h += `<span style="color:#64748b">— Chưa có sự kiện nào —</span>`;
    } else {
      data.log.slice(0,20).forEach(l => h += `<div style="color:#94a3b8;margin-bottom:3px">${l}</div>`);
    }
    h += `</div></div>`;
    el.innerHTML = h;
  };

  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      window.realmV30Tick();
    };
    console.log("[RealmEngineV30] 🌌 Bảy Cõi Giới khởi động — Thăng Thiên · Giáng Thiên · Du Hành ✓");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 3200); });
  } else {
    setTimeout(init, 3200);
  }
})();
