(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // PORTAL NETWORK V35 — Mạng Lưới Cổng Liên Vũ Trụ
  // Extends portalEngineV30.js — KHÔNG xóa, KHÔNG ghi đè hệ thống cũ
  // ═══════════════════════════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_portal_network_v35";

  const PORTAL_TYPES_V35 = [
    { id:"local",    name:"🔵 Cổng Địa Phương",  color:"#3b82f6", energyCost:100,   stability:95, range:"local",    desc:"Kết nối hai điểm trong cùng vũ trụ" },
    { id:"realm",    name:"🟣 Cổng Cõi Giới",    color:"#8b5cf6", energyCost:500,   stability:80, range:"realm",    desc:"Du hành giữa các cõi tu luyện" },
    { id:"world",    name:"🟡 Cổng Thế Giới",    color:"#fbbf24", energyCost:2000,  stability:65, range:"world",    desc:"Liên thông hai thế giới khác nhau" },
    { id:"universe", name:"🔴 Cổng Liên Vũ Trụ", color:"#ef4444", energyCost:10000, stability:40, range:"universe", desc:"Xuyên qua ranh giới vũ trụ" },
    { id:"creator",  name:"⚪ Cổng Tạo Hóa",     color:"#ffffff", energyCost:0,     stability:100,range:"creator",  desc:"Cổng của Đấng Tạo Hóa — vô hạn" }
  ];

  function defaultData() {
    return {
      portals:   [],
      routes:    [],
      traffic:   [],
      tick:      0,
      totalOpened: 0,
      totalClosed: 0
    };
  }

  window.pnData = window.pnData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.pnData)); } catch(e) {} }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { const p = JSON.parse(raw); if (p && p.portals) window.pnData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  let _idCtr = 1;
  function newId() { return "pn_" + Date.now() + "_" + (_idCtr++); }

  // ─── Mở cổng giữa 2 vũ trụ ────────────────────────────────────────────────
  window.pnOpenPortal = function(fromUid, toUid, typeId) {
    const ptype = PORTAL_TYPES_V35.find(t => t.id === typeId) || PORTAL_TYPES_V35[2];
    const fromU = window.mvGetUniverseById && window.mvGetUniverseById(fromUid);
    const toU   = window.mvGetUniverseById && window.mvGetUniverseById(toUid);
    if (!fromU || !toU) return null;

    const portal = {
      id:         newId(),
      type:       ptype.id,
      typeName:   ptype.name,
      typeColor:  ptype.color,
      fromUid:    fromUid,
      fromName:   fromU.name,
      toUid:      toUid,
      toName:     toU.name,
      stability:  ptype.stability,
      energyCost: ptype.energyCost,
      status:     "open",
      openedAt:   window.year || 0,
      travelers:  0,
      desc:       ptype.desc
    };

    window.pnData.portals.push(portal);
    window.pnData.totalOpened++;

    // Cập nhật vũ trụ
    if (fromU.portals) fromU.portals.push(portal.id);
    if (toU.portals) toU.portals.push(portal.id);

    pnLog(`🌀 Cổng ${ptype.name} mở giữa "${fromU.name}" ↔ "${toU.name}"`);
    if (typeof window.htAddEvent === "function") window.htAddEvent({ year: window.year||0, desc: `Cổng ${ptype.name} kết nối "${fromU.name}" và "${toU.name}"`, type:"portal_opened", source:"portal_network" });
    save();
    return portal;
  };

  // ─── Đóng cổng ─────────────────────────────────────────────────────────────
  window.pnClosePortal = function(pid) {
    const p = window.pnData.portals.find(p => p.id === pid);
    if (!p) return;
    p.status = "closed";
    p.closedAt = window.year || 0;
    window.pnData.totalClosed++;
    pnLog(`❌ Cổng ${p.typeName} giữa "${p.fromName}" ↔ "${p.toName}" đã đóng`);
    save();
  };

  // ─── Auto-tạo cổng giữa các vũ trụ ──────────────────────────────────────
  window.pnAutoConnect = function() {
    if (!window.mvData || !window.mvData.universes) return;
    const active = window.mvData.universes.filter(u => u.status === "active");
    if (active.length < 2) return;
    const shuffled = active.slice().sort(() => Math.random()-0.5);
    for (let i = 0; i < Math.min(2, shuffled.length-1); i++) {
      const existing = window.pnData.portals.find(p =>
        p.status === "open" &&
        ((p.fromUid === shuffled[i].id && p.toUid === shuffled[i+1].id) ||
         (p.toUid === shuffled[i].id && p.fromUid === shuffled[i+1].id)));
      if (!existing) {
        window.pnOpenPortal(shuffled[i].id, shuffled[i+1].id, "world");
      }
    }
  };

  function pnLog(msg) {
    window.pnData.traffic.unshift({ msg, year: window.year||0 });
    if (window.pnData.traffic.length > 100) window.pnData.traffic.length = 100;
    if (typeof window.addLog === "function") window.addLog("[PORTAL] " + msg);
  }
  window.pnLog = pnLog;
  window.pnGetPortals    = function() { return window.pnData.portals; };
  window.pnGetOpenPortals= function() { return window.pnData.portals.filter(p => p.status === "open"); };
  window.pnGetPortalTypes= function() { return PORTAL_TYPES_V35; };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  window.pnRenderPanel = function() {
    const el = document.getElementById("panel-portals-v35");
    if (!el) return;
    const portals = window.pnData.portals;
    const open    = portals.filter(p => p.status === "open");
    const types   = PORTAL_TYPES_V35;

    el.innerHTML = `
<div style="padding:16px;font-family:'Noto Serif SC',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
    <div>
      <h2 style="margin:0;font-size:20px;color:#06b6d4;font-family:Cinzel,serif">🌀 Mạng Lưới Cổng V35</h2>
      <div style="font-size:11px;color:#64748b;margin-top:2px">${open.length} cổng mở · ${window.pnData.totalOpened} tổng đã mở · ${window.pnData.totalClosed} đã đóng</div>
    </div>
    <div style="display:flex;gap:8px">
      <button onclick="pnAutoConnect();pnRenderPanel()" style="padding:6px 14px;background:linear-gradient(135deg,#06b6d4,#0891b2);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:12px">⚡ Tự Kết Nối</button>
      <button onclick="pnRenderCreatePortal()" style="padding:6px 14px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:12px">+ Mở Cổng</button>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:20px">
    ${types.map(t => {
      const cnt = open.filter(p=>p.type===t.id).length;
      return `<div style="background:#0f172a;border:1px solid ${cnt>0?t.color+"44":"#1e293b"};border-radius:8px;padding:10px;text-align:center">
        <div style="font-size:18px;font-weight:700;color:${t.color}">${cnt}</div>
        <div style="font-size:10px;color:#64748b">${t.name}</div>
      </div>`;
    }).join("")}
  </div>

  <div style="margin-bottom:12px;font-size:13px;color:#94a3b8;font-weight:600">🔗 CỔNG ĐANG MỞ</div>
  ${open.length === 0 ? `<div style="text-align:center;padding:30px;color:#475569"><div style="font-size:40px;margin-bottom:8px">🌀</div><div>Chưa có cổng nào. Nhấn "Tự Kết Nối" để tạo!</div></div>` :
  `<div style="display:grid;gap:8px">
    ${open.map(p => `
    <div style="background:#0f172a;border:1px solid ${p.typeColor}44;border-radius:8px;padding:12px">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px">
        <div>
          <span style="font-size:12px;font-weight:600;color:${p.typeColor}">${p.typeName}</span>
          <div style="font-size:13px;color:#e2e8f0;margin-top:4px">
            <span style="color:#8b5cf6">${p.fromName}</span>
            <span style="color:#475569;margin:0 8px">↔</span>
            <span style="color:#06b6d4">${p.toName}</span>
          </div>
          <div style="font-size:11px;color:#475569;margin-top:2px">Mở năm ${p.openedAt} · ${p.travelers} lượt đi qua · Ổn định ${p.stability}%</div>
        </div>
        <button onclick="pnClosePortal('${p.id}');pnRenderPanel()" style="padding:4px 10px;background:#1e293b;border:1px solid #ef4444;border-radius:5px;color:#f87171;cursor:pointer;font-size:11px">Đóng</button>
      </div>
      <div style="margin-top:8px;height:3px;background:#1e293b;border-radius:2px;overflow:hidden">
        <div style="height:100%;width:${p.stability}%;background:${p.stability>70?"#34d399":p.stability>40?"#fbbf24":"#ef4444"}"></div>
      </div>
    </div>`).join("")}
  </div>`}

  ${portals.filter(p=>p.status==="closed").length > 0 ? `
  <div style="margin-top:20px">
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:8px">📜 CỔNG ĐÃ ĐÓNG</div>
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;max-height:120px;overflow-y:auto">
      ${portals.filter(p=>p.status==="closed").slice(0,15).map(p=>`
      <div style="font-size:11px;color:#475569;padding:3px 0;border-bottom:1px solid #0a0a1a">${p.typeName} · ${p.fromName} ↔ ${p.toName} · Đóng năm ${p.closedAt||"?"}</div>`).join("")}
    </div>
  </div>` : ""}

  ${window.pnData.traffic.length > 0 ? `
  <div style="margin-top:20px">
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:8px">📡 NHẬT KÝ CỔNG</div>
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;max-height:120px;overflow-y:auto">
      ${window.pnData.traffic.slice(0,20).map(t=>`<div style="font-size:11px;color:#64748b;padding:3px 0;border-bottom:1px solid #0a0a1a">Năm ${t.year}: ${t.msg}</div>`).join("")}
    </div>
  </div>` : ""}
</div>`;
  };

  window.pnRenderCreatePortal = function() {
    const universes = (window.mvData && window.mvData.universes) ? window.mvData.universes.filter(u => u.status === "active") : [];
    if (universes.length < 2) { alert("Cần ít nhất 2 vũ trụ đang hoạt động!"); return; }
    const types = PORTAL_TYPES_V35;
    const modal = document.createElement("div");
    modal.id = "pn-create-modal";
    modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:#000000cc;z-index:9999;display:flex;align-items:center;justify-content:center";
    modal.innerHTML = `
<div style="background:#0f172a;border:1px solid #06b6d4;border-radius:12px;padding:24px;width:420px;max-width:90vw;font-family:'Noto Serif SC',serif">
  <h3 style="margin:0 0 16px;color:#06b6d4;font-family:Cinzel,serif">🌀 Mở Cổng Mới</h3>
  <div style="margin-bottom:10px">
    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Loại cổng</label>
    <select id="pn-type-sel" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px">
      ${types.map(t=>`<option value="${t.id}">${t.name} (${t.desc})</option>`).join("")}
    </select>
  </div>
  <div style="margin-bottom:10px">
    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Vũ trụ nguồn</label>
    <select id="pn-from-sel" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px">
      ${universes.map(u=>`<option value="${u.id}">${u.name} (${u.typeName})</option>`).join("")}
    </select>
  </div>
  <div style="margin-bottom:16px">
    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Vũ trụ đích</label>
    <select id="pn-to-sel" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px">
      ${universes.map(u=>`<option value="${u.id}">${u.name} (${u.typeName})</option>`).join("")}
    </select>
  </div>
  <div style="display:flex;gap:10px">
    <button onclick="const t=document.getElementById('pn-type-sel').value;const f=document.getElementById('pn-from-sel').value;const d=document.getElementById('pn-to-sel').value;if(f===d){alert('Cổng phải nối 2 vũ trụ khác nhau!')}else{pnOpenPortal(f,d,t);document.getElementById('pn-create-modal').remove();pnRenderPanel()}" style="flex:1;padding:10px;background:linear-gradient(135deg,#06b6d4,#0891b2);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:13px">🌀 Mở Cổng</button>
    <button onclick="document.getElementById('pn-create-modal').remove()" style="padding:10px 16px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:13px">Hủy</button>
  </div>
</div>`;
    document.body.appendChild(modal);
  };

  // ─── gameTick ─────────────────────────────────────────────────────────────
  const _prevTick = window.gameTick;
  window.gameTick = function() {
    if (typeof _prevTick === "function") _prevTick();
    window.pnData.tick++;
    if (window.pnData.tick % 20 === 0) {
      window.pnData.portals.filter(p => p.status === "open").forEach(function(p) {
        p.stability -= (Math.random() * 0.5);
        if (p.stability <= 0) { window.pnClosePortal(p.id); }
        if (p.type === "creator") p.stability = 100;
      });
    }
    if (window.pnData.tick % 80 === 0) window.pnAutoConnect();
    if (window.pnData.tick % 30 === 0) save();
  };

  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
      load();
      console.log("[PortalNetwork V35] 🌀 Mạng lưới cổng khởi động —", window.pnGetOpenPortals().length, "cổng mở.");
    }, 2500);
  });

})();
