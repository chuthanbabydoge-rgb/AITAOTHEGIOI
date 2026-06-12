(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════
  // PORTAL ENGINE V30 — Cổng Dịch Chuyển Giữa Các Cõi
  // ═══════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_portal_v30";

  const PORTAL_TYPES = [
    { id:'stable',  name:'🌀 Cổng Ổn Định',    color:'#34d399', stability:90, energy:100,  desc:'Cổng được tạo bởi thần linh cổ đại, bền vững qua thiên niên kỷ.' },
    { id:'ancient', name:'🏛 Cổng Cổ Đại',     color:'#f97316', stability:70, energy:300,  desc:'Cổng từ thời hồng hoang, ổn định nhưng đầy bí ẩn.' },
    { id:'rift',    name:'⚡ Khe Nứt Thần Thánh',color:'#facc15', stability:40, energy:800,  desc:'Vết nứt trong không gian do thần chiến gây ra.' },
    { id:'void',    name:'🌑 Cổng Hư Không',    color:'#6366f1', stability:20, energy:3000, desc:'Cổng dẫn vào vùng hư không, chỉ thần linh cấp cao đi qua được.' }
  ];

  const REALM_IDS = ['mortal','cultivation','immortal','divine','heaven','void','creation'];

  let _idCtr = 1;
  function newId() { return 'prt_' + (_idCtr++); }

  function defaultData() {
    return { portals: [], travelers: [], log: [], tick: 0 };
  }

  window.portalV30Data = window.portalV30Data || defaultData();

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.portalV30Data)); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.portalV30Data = Object.assign(defaultData(), JSON.parse(d));
    } catch(e) {}
  }

  function getType(id) { return PORTAL_TYPES.find(t => t.id === id); }
  function getRealmName(id) {
    const realms = (window.realmV30Data||{}).realms || [];
    const r = realms.find(x=>x.id===id);
    return r ? r.name : id;
  }

  // Mở cổng
  window.portalV30Open = function(fromRealm, toRealm, typeId, creator) {
    const t = getType(typeId);
    if (!t) return null;
    const portal = {
      id: newId(),
      type: typeId,
      from: fromRealm, to: toRealm,
      stability: t.stability - Math.floor(Math.random()*20),
      energyCost: t.energy,
      creator: creator || 'Thần Bí Ẩn',
      opened: window.year || 1,
      traffic: 0,
      active: true
    };
    window.portalV30Data.portals.push(portal);
    window.portalV30Data.log.unshift(
      `[Năm ${portal.opened}] ${t.icon||'🌀'} Cổng mở: ${getRealmName(fromRealm)} ↔ ${getRealmName(toRealm)} bởi ${creator}`
    );
    if (typeof window.htAddEvent === 'function') {
      window.htAddEvent({ year: portal.opened, type:'divine', title:`${t.name} mở: ${getRealmName(fromRealm)} ↔ ${getRealmName(toRealm)}`, color: t.color });
    }
    save();
    return portal;
  };

  // Đóng cổng
  window.portalV30Close = function(portalId) {
    const p = window.portalV30Data.portals.find(x=>x.id===portalId);
    if (!p) return;
    p.active = false;
    window.portalV30Data.log.unshift(`[Năm ${window.year||1}] ❌ Cổng ${getRealmName(p.from)} ↔ ${getRealmName(p.to)} bị đóng`);
    window.portalV30Data.portals = window.portalV30Data.portals.filter(x=>x.id!==portalId);
    save();
  };

  // Du hành qua cổng
  window.portalV30Travel = function(portalId, travelerName) {
    const p = window.portalV30Data.portals.find(x=>x.id===portalId);
    if (!p || !p.active) return false;
    // Nguy hiểm nếu ổn định thấp
    const danger = Math.random() * 100 > p.stability;
    p.traffic++;
    p.stability = Math.max(5, p.stability - 1);
    if (danger) {
      window.portalV30Data.log.unshift(`[Năm ${window.year||1}] ⚠️ ${travelerName} gặp nguy hiểm khi qua cổng!`);
      return false;
    }
    window.portalV30Data.travelers.push({ name: travelerName, portal: portalId, from: p.from, to: p.to, year: window.year||1 });
    if (window.portalV30Data.travelers.length > 100) window.portalV30Data.travelers.shift();
    window.portalV30Data.log.unshift(`[Năm ${window.year||1}] ✈️ ${travelerName} đi từ ${getRealmName(p.from)} → ${getRealmName(p.to)}`);
    save();
    return true;
  };

  // Tick
  window.portalV30Tick = function() {
    const data = window.portalV30Data;
    data.tick = (data.tick||0) + 1;

    // Ổn định cổng giảm dần
    data.portals.forEach(p => {
      p.stability = Math.max(5, p.stability - Math.random() * 0.5);
      // Cổng sụp đổ nếu ổn định < 10
      if (p.stability < 10 && Math.random() < 0.05) {
        window.portalV30Data.log.unshift(`[Năm ${window.year||1}] 💥 Cổng ${getRealmName(p.from)} ↔ ${getRealmName(p.to)} sụp đổ!`);
        p.active = false;
      }
    });
    data.portals = data.portals.filter(p => p.active);

    // Tự động mở cổng khi có thần linh mạnh
    if (data.tick % 40 === 0 && Math.random() < 0.25) {
      const beings = (window.divineData||{}).beings || [];
      const powerful = beings.filter(b => b.power > 1000);
      if (powerful.length > 0 && data.portals.length < 10) {
        const god = powerful[Math.floor(Math.random()*powerful.length)];
        const fromIdx = Math.floor(Math.random() * 5);
        const toIdx = Math.min(6, fromIdx + 1 + Math.floor(Math.random()*2));
        const types = ['stable','ancient','rift','void'];
        const tId = types[Math.floor(Math.random()*types.length)];
        window.portalV30Open(REALM_IDS[fromIdx], REALM_IDS[toIdx], tId, god.name);
      }
    }

    // NPC ngẫu nhiên du hành
    if (data.tick % 15 === 0 && data.portals.length > 0) {
      const npcs = window.npcs || [];
      const n = npcs[Math.floor(Math.random()*npcs.length)];
      const p = data.portals[Math.floor(Math.random()*data.portals.length)];
      if (n && p) window.portalV30Travel(p.id, n.name);
    }

    if (data.tick % 60 === 0) save();
  };

  // Render panel
  window.portalV30RenderPanel = function() {
    const el = document.getElementById('panel-portal-v30');
    if (!el) return;
    const data = window.portalV30Data;
    let h = `<div style="padding:16px;background:#0f172a;min-height:100%;color:#e2e8f0;font-family:monospace">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h2 style="color:#6366f1;margin:0">🌀 Cổng Dịch Chuyển</h2>
        <span style="color:#94a3b8;font-size:0.85em">Đang mở: ${data.portals.length} cổng</span>
      </div>`;

    // Loại cổng
    h += `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px">`;
    PORTAL_TYPES.forEach(t => {
      h += `<div style="background:#1e293b;border:1px solid ${t.color}44;border-radius:8px;padding:10px;text-align:center">
        <div style="font-size:1.3em">🌀</div>
        <div style="font-size:0.78em;font-weight:bold;color:${t.color};margin:4px 0">${t.name}</div>
        <div style="font-size:0.7em;color:#64748b">Ổn định: ${t.stability}%</div>
        <div style="font-size:0.7em;color:#94a3b8">Năng lượng: ${t.energy}</div>
        <button onclick="window.portalV30Open('mortal','cultivation','${t.id}','Người Chơi');window.portalV30RenderPanel()"
          style="background:${t.color}22;border:1px solid ${t.color}66;color:${t.color};padding:3px 8px;border-radius:5px;cursor:pointer;font-size:0.74em;margin-top:6px">Mở Cổng</button>
      </div>`;
    });
    h += `</div>`;

    // Cổng đang mở
    h += `<h3 style="color:#6366f1;margin:0 0 10px">✨ Cổng Đang Mở</h3>`;
    if (data.portals.length === 0) {
      h += `<div style="background:#1e293b;border-radius:8px;padding:20px;text-align:center;color:#64748b">— Không có cổng nào đang mở —</div>`;
    } else {
      data.portals.forEach(p => {
        const t = getType(p.type);
        const stColor = p.stability >= 70 ? '#34d399' : p.stability >= 40 ? '#fbbf24' : '#ef4444';
        h += `<div style="background:#1e293b;border:1px solid ${t?.color||'#334155'}44;border-radius:8px;padding:12px;margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-weight:bold;color:${t?.color||'#6366f1'}">${t?.name||p.type}</span>
            <button onclick="window.portalV30Close('${p.id}');window.portalV30RenderPanel()" style="background:#ef444422;border:1px solid #ef444466;color:#ef4444;padding:3px 8px;border-radius:5px;cursor:pointer;font-size:0.76em">Đóng Cổng</button>
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin:8px 0;font-size:0.85em">
            <span style="background:#1e293b;border:1px solid ${t?.color||'#334155'}44;padding:4px 10px;border-radius:20px;color:${t?.color||'#fff'}">${getRealmName(p.from)}</span>
            <span style="color:#6366f1">↔️</span>
            <span style="background:#1e293b;border:1px solid ${t?.color||'#334155'}44;padding:4px 10px;border-radius:20px;color:${t?.color||'#fff'}">${getRealmName(p.to)}</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:0.82em">
            <div>🛡 Ổn định: <b style="color:${stColor}">${Math.round(p.stability)}%</b></div>
            <div>🚶 Lưu lượng: <b style="color:#60a5fa">${p.traffic}</b></div>
            <div>👤 Tạo bởi: <b style="color:#f0abfc">${p.creator}</b></div>
          </div>
          <div style="background:#0f172a;border-radius:4px;height:5px;margin-top:8px">
            <div style="background:${stColor};height:5px;border-radius:4px;width:${p.stability}%;transition:width 0.3s"></div>
          </div>
        </div>`;
      });
    }

    // Du khách gần đây
    h += `<h3 style="color:#60a5fa;margin:16px 0 8px">🚶 Du Khách Gần Đây</h3>
      <div style="background:#1e293b;border-radius:6px;padding:10px;max-height:120px;overflow-y:auto;font-size:0.82em">`;
    if (data.travelers.length === 0) {
      h += `<span style="color:#64748b">— Chưa có ai du hành —</span>`;
    } else {
      [...data.travelers].reverse().slice(0,12).forEach(t => {
        h += `<div style="color:#94a3b8;margin-bottom:2px">✈️ ${t.name}: ${getRealmName(t.from)} → ${getRealmName(t.to)} (Năm ${t.year})</div>`;
      });
    }

    // Log
    h += `</div>
      <div style="background:#1e293b;border-radius:6px;padding:10px;margin-top:10px;max-height:120px;overflow-y:auto;font-size:0.8em">`;
    data.log.slice(0,15).forEach(l => h += `<div style="color:#94a3b8;margin-bottom:3px">${l}</div>`);
    h += `</div></div>`;
    el.innerHTML = h;
  };

  function init() {
    load();
    // Mở vài cổng ban đầu sau khi realms sẵn sàng
    setTimeout(function() {
      if (window.portalV30Data.portals.length === 0) {
        window.portalV30Open('mortal','cultivation','stable','Thần Cổ Đại');
        window.portalV30Open('cultivation','immortal','ancient','Tiên Tổ');
        window.portalV30Open('immortal','divine','rift','Chiến Thần Athos');
      }
    }, 500);
    const _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      window.portalV30Tick();
    };
    console.log("[PortalEngineV30] 🌀 Cổng Dịch Chuyển khởi động — 4 loại · Du hành · AI tự động ✓");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 4000); });
  } else {
    setTimeout(init, 4000);
  }
})();
