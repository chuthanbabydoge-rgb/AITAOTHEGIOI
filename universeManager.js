(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIVERSE MANAGER V35 — Quản Lý & Điều Hành Vũ Trụ
  // ═══════════════════════════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_universe_manager_v35";

  function defaultData() {
    return {
      interventions: [],
      snapshots: [],
      tick: 0
    };
  }

  window.umData = window.umData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.umData)); } catch(e) {} }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { const p = JSON.parse(raw); if (p) window.umData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  // ─── Creator God Actions ──────────────────────────────────────────────────
  window.umBoostStability = function(uid, amount) {
    const u = window.mvGetUniverseById && window.mvGetUniverseById(uid);
    if (!u || u.status !== "active") return;
    u.stability = Math.min(100, u.stability + (amount || 20));
    _logIntervention(uid, `Tăng ổn định +${amount||20}%`, "boost");
    if (typeof window.mvLog === "function") window.mvLog(`✨ Thiên Ý can thiệp: "${u.name}" được ổn định thêm!`);
    if (typeof window.mvData !== "undefined") {
      try { localStorage.setItem("cgv6_multiverse_v35", JSON.stringify(window.mvData)); } catch(e) {}
    }
  };

  window.umAddPopulation = function(uid, amount) {
    const u = window.mvGetUniverseById && window.mvGetUniverseById(uid);
    if (!u || u.status !== "active") return;
    u.population += (amount || 100000);
    _logIntervention(uid, `Thêm dân số +${(amount||100000).toLocaleString()}`, "populate");
    if (typeof window.mvLog === "function") window.mvLog(`👥 Dân số "${u.name}" tăng vọt!`);
  };

  window.umAddResources = function(uid, resType, amount) {
    const u = window.mvGetUniverseById && window.mvGetUniverseById(uid);
    if (!u || u.status !== "active" || !u.resources) return;
    u.resources[resType] = (u.resources[resType] || 0) + (amount || 1000);
    _logIntervention(uid, `Thêm ${resType} +${amount||1000}`, "resource");
  };

  window.umTriggerEvent = function(uid, eventType) {
    const u = window.mvGetUniverseById && window.mvGetUniverseById(uid);
    if (!u) return;
    const events = {
      golden_age:  { msg:"🌟 Thời Kỳ Vàng bắt đầu!", stability:+20, pop:1.05 },
      divine_war:  { msg:"⚔️ Thần Chiến bùng nổ!",   stability:-15, pop:0.97 },
      rebirth:     { msg:"♻️ Vũ trụ hồi sinh!",        stability:+30, pop:1.1  },
      catastrophe: { msg:"🌋 Đại Thảm Họa xảy ra!",   stability:-25, pop:0.92 },
      ascension:   { msg:"✨ Thời Đại Thăng Thiên!",   stability:+10, pop:1.02 }
    };
    const ev = events[eventType];
    if (!ev || u.status !== "active") return;
    u.stability = Math.max(1, Math.min(100, u.stability + (ev.stability || 0)));
    u.population = Math.floor(u.population * (ev.pop || 1));
    u.events = u.events || [];
    u.events.push({ type: eventType, msg: ev.msg, year: window.year || 0 });
    if (u.events.length > 20) u.events.shift();
    _logIntervention(uid, ev.msg, "event");
    if (typeof window.mvLog === "function") window.mvLog(`[${u.name}] ${ev.msg}`);
    if (typeof window.htAddEvent === "function") window.htAddEvent({ year: window.year||0, desc: `[${u.name}] ${ev.msg}`, type: "multiverse_event", source: "universe_manager" });
  };

  window.umTakeSnapshot = function(uid) {
    const u = window.mvGetUniverseById && window.mvGetUniverseById(uid);
    if (!u) return;
    window.umData.snapshots.unshift({ uid, name: u.name, year: window.year||0, data: JSON.parse(JSON.stringify(u)) });
    if (window.umData.snapshots.length > 50) window.umData.snapshots.length = 50;
    save();
    if (typeof window.mvLog === "function") window.mvLog(`📸 Snapshot vũ trụ "${u.name}" lưu lại năm ${window.year||0}.`);
  };

  function _logIntervention(uid, desc, type) {
    const u = window.mvGetUniverseById && window.mvGetUniverseById(uid);
    window.umData.interventions.unshift({ uid, name: u ? u.name : uid, desc, type, year: window.year||0 });
    if (window.umData.interventions.length > 100) window.umData.interventions.length = 100;
    save();
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  window.umRenderPanel = function() {
    const el = document.getElementById("panel-universes");
    if (!el) return;
    const universes = (window.mvData && window.mvData.universes) ? window.mvData.universes.filter(u => u.status === "active") : [];
    const snapshots = window.umData.snapshots.slice(0, 10);
    const interventions = window.umData.interventions.slice(0, 20);

    el.innerHTML = `
<div style="padding:16px;font-family:'Noto Serif SC',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">
  <h2 style="margin:0 0 16px;font-size:20px;color:#06b6d4;font-family:Cinzel,serif">🌍 Quản Lý Vũ Trụ</h2>

  <div style="margin-bottom:16px">
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:8px">⚡ HÀNH ĐỘNG NHANH</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">
      <button onclick="mvRenderCreateModal&&mvRenderCreateModal()" style="padding:7px 14px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:12px">🌌 Tạo Vũ Trụ</button>
      <button onclick="if(window.mvData&&window.mvData.universes&&window.mvData.universes.length>=2){const u=window.mvData.universes.filter(x=>x.status==='active');if(u.length>=2){window.mvMergeUniverses(u[0].id,u[1].id);umRenderPanel();}}" style="padding:7px 14px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:12px">🔗 Hợp Nhất 2 Vũ Trụ</button>
      <button onclick="umRenderPanel()" style="padding:7px 12px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:12px">↺ Refresh</button>
    </div>
  </div>

  ${universes.length === 0 ? `<div style="text-align:center;padding:30px;color:#475569">Chưa có vũ trụ hoạt động</div>` :
  `<div style="margin-bottom:20px">
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:8px">🌍 VŨ TRỤ ĐANG HOẠT ĐỘNG</div>
    <div style="display:grid;gap:10px">
    ${universes.map(u => `
    <div style="background:#0f172a;border:1px solid ${u.typeColor}44;border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px">
        <span style="font-weight:600;color:${u.typeColor}">${u.name} <span style="font-size:11px;font-weight:400;color:#64748b">${u.typeName}</span></span>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button onclick="umBoostStability('${u.id}',20);umRenderPanel()" style="padding:4px 10px;background:#0f172a;border:1px solid #34d399;border-radius:5px;color:#34d399;cursor:pointer;font-size:11px">+Ổn Định</button>
          <button onclick="umAddPopulation('${u.id}',500000);umRenderPanel()" style="padding:4px 10px;background:#0f172a;border:1px solid #06b6d4;border-radius:5px;color:#06b6d4;cursor:pointer;font-size:11px">+Dân Số</button>
          <button onclick="umTriggerEvent('${u.id}','golden_age');umRenderPanel()" style="padding:4px 10px;background:#0f172a;border:1px solid #fbbf24;border-radius:5px;color:#fbbf24;cursor:pointer;font-size:11px">🌟 Thời Vàng</button>
          <button onclick="umTriggerEvent('${u.id}','divine_war');umRenderPanel()" style="padding:4px 10px;background:#0f172a;border:1px solid #ef4444;border-radius:5px;color:#ef4444;cursor:pointer;font-size:11px">⚔️ Thần Chiến</button>
          <button onclick="umTakeSnapshot('${u.id}')" style="padding:4px 10px;background:#0f172a;border:1px solid #8b5cf6;border-radius:5px;color:#8b5cf6;cursor:pointer;font-size:11px">📸 Snapshot</button>
          <button onclick="if(confirm('Tách vũ trụ này?')){mvSplitUniverse('${u.id}');umRenderPanel()}" style="padding:4px 10px;background:#0f172a;border:1px solid #f97316;border-radius:5px;color:#f97316;cursor:pointer;font-size:11px">⚡ Tách</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;font-size:12px">
        <div style="background:#0a0a1a;padding:8px;border-radius:6px"><div style="color:#64748b;font-size:10px">DÂN SỐ</div><div style="color:#e2e8f0;font-weight:600">${(u.population/1000).toFixed(0)}K</div></div>
        <div style="background:#0a0a1a;padding:8px;border-radius:6px"><div style="color:#64748b;font-size:10px">ỔN ĐỊNH</div><div style="color:${u.stability>60?"#34d399":u.stability>30?"#fbbf24":"#ef4444"};font-weight:600">${u.stability.toFixed(0)}%</div></div>
        <div style="background:#0a0a1a;padding:8px;border-radius:6px"><div style="color:#64748b;font-size:10px">LINH KHÍ</div><div style="color:#06b6d4;font-weight:600">${(u.resources&&u.resources.lingqi||0).toLocaleString()}</div></div>
        <div style="background:#0a0a1a;padding:8px;border-radius:6px"><div style="color:#64748b;font-size:10px">THẦN LỰC</div><div style="color:#fbbf24;font-weight:600">${(u.resources&&u.resources.divine||0).toLocaleString()}</div></div>
        <div style="background:#0a0a1a;padding:8px;border-radius:6px"><div style="color:#64748b;font-size:10px">TUỔI VŨ TRỤ</div><div style="color:#8b5cf6;font-weight:600">${u.age} năm</div></div>
        <div style="background:#0a0a1a;padding:8px;border-radius:6px"><div style="color:#64748b;font-size:10px">VƯƠNG QUỐC</div><div style="color:#e2e8f0;font-weight:600">${u.kingdoms}</div></div>
      </div>
      ${u.events && u.events.length > 0 ? `<div style="margin-top:8px;font-size:11px;color:#475569">Sự kiện gần nhất: ${u.events[u.events.length-1].msg}</div>` : ""}
    </div>`).join("")}
    </div>
  </div>`}

  ${interventions.length > 0 ? `
  <div style="margin-bottom:20px">
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:8px">📋 CAN THIỆP GẦN ĐÂY</div>
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;max-height:160px;overflow-y:auto">
      ${interventions.map(i=>`<div style="font-size:11px;color:#64748b;padding:4px 0;border-bottom:1px solid #1e293b">Năm ${i.year} · [${i.name}] ${i.desc}</div>`).join("")}
    </div>
  </div>` : ""}

  ${snapshots.length > 0 ? `
  <div>
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:8px">📸 SNAPSHOTS</div>
    <div style="display:grid;gap:6px">
      ${snapshots.map(s=>`<div style="background:#0f172a;border:1px solid #1e293b;border-radius:6px;padding:10px;font-size:12px"><span style="color:#8b5cf6">${s.name}</span> <span style="color:#64748b">· Năm ${s.year}</span></div>`).join("")}
    </div>
  </div>` : ""}
</div>`;
  };

  // ─── gameTick ─────────────────────────────────────────────────────────────
  const _prevTick = window.gameTick;
  window.gameTick = function() {
    if (typeof _prevTick === "function") _prevTick();
    window.umData.tick++;
    if (window.umData.tick % 50 === 0) save();
  };

  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
      load();
      console.log("[UniverseManager V35] 🌍 Quản lý vũ trụ sẵn sàng.");
    }, 2400);
  });

})();
