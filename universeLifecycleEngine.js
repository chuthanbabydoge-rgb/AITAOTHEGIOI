(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIVERSE LIFECYCLE ENGINE V37 — Vòng Đời Vũ Trụ
  // BigBang → Lạm Phát → Hình Thành Sao → Kỷ Nguyên Vàng
  //         → Suy Thoái → Hấp Hối → Nhiệt Chết
  // ═══════════════════════════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_universe_lifecycle_v37";

  const PHASES = [
    { id:"bigbang",       name:"💥 Big Bang",           color:"#fbbf24", minAge:0,   maxAge:20,  stabRange:[10,40],  popMult:0.1,  desc:"Vũ trụ mới hình thành — năng lượng hỗn loạn" },
    { id:"inflation",     name:"🌌 Lạm Phát Vũ Trụ",   color:"#8b5cf6", minAge:20,  maxAge:60,  stabRange:[30,60],  popMult:0.4,  desc:"Mở rộng nhanh — tài nguyên tràn ngập" },
    { id:"star_formation",name:"⭐ Hình Thành Sao",     color:"#06b6d4", minAge:60,  maxAge:150, stabRange:[50,80],  popMult:0.7,  desc:"Vương quốc hình thành — ổn định dần" },
    { id:"golden_age",    name:"🌟 Kỷ Nguyên Vàng",     color:"#34d399", minAge:150, maxAge:300, stabRange:[70,100], popMult:1.0,  desc:"Đỉnh cao văn minh — thịnh vượng tối đa" },
    { id:"stagnation",    name:"📉 Suy Thoái",          color:"#f97316", minAge:300, maxAge:500, stabRange:[40,70],  popMult:0.9,  desc:"Tài nguyên cạn kiệt — xung đột gia tăng" },
    { id:"dying",         name:"🌑 Hấp Hối",            color:"#ef4444", minAge:500, maxAge:700, stabRange:[10,40],  popMult:0.5,  desc:"Vũ trụ đang tàn lụi — hỗn loạn cực độ" },
    { id:"heat_death",    name:"❄️ Nhiệt Chết Vũ Trụ",  color:"#475569", minAge:700, maxAge:999, stabRange:[0,10],   popMult:0.0,  desc:"Vũ trụ kết thúc — entropy tối đa" }
  ];

  function defaultData() {
    return { transitions: [], heatDeaths: 0, tick: 0 };
  }

  window.ulcData = window.ulcData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.ulcData)); } catch(e) {} }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { const p = JSON.parse(raw); if (p) window.ulcData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  function getPhase(age) {
    for (let i = PHASES.length - 1; i >= 0; i--) {
      if (age >= PHASES[i].minAge) return PHASES[i];
    }
    return PHASES[0];
  }

  // ─── Tick lifecycle cho tất cả vũ trụ ────────────────────────────────────
  function tickLifecycles() {
    if (!window.mvData || !window.mvData.universes) return;
    const active = window.mvData.universes.filter(u => u.status === "active");

    active.forEach(function(univ) {
      // Khởi tạo lifecycle nếu chưa có
      if (!univ.lifecyclePhase) {
        univ.lifecyclePhase = "bigbang";
        univ.lifecycleAge   = 0;
        univ.heatDeathRisk  = 0;
      }

      // Tăng lifecycle age (chậm hơn game year)
      univ.lifecycleAge = (univ.lifecycleAge || 0) + 0.05;

      const phase    = getPhase(univ.lifecycleAge);
      const oldPhase = univ.lifecyclePhase;

      // Cập nhật phase
      if (phase.id !== oldPhase) {
        univ.lifecyclePhase = phase.id;
        const msg = `${phase.name}: "${univ.name}" — ${phase.desc}`;
        if (typeof window.mvLog === "function") window.mvLog(`🌀 ${msg}`);
        if (typeof window.htAddEvent === "function") window.htAddEvent({ year: window.year||0, desc: msg, type:"lifecycle_transition", source:"lifecycle_v37" });

        // Tạo timeline event khi phase thay đổi
        if (typeof window.tlBranchFromTrigger === "function" && Math.random() < 0.3) {
          const triggerMap = { inflation:"empire_victory", star_formation:"civilization_peak", stagnation:"kingdom_collapse", dying:"boss_survived" };
          const trig = triggerMap[phase.id];
          if (trig) window.tlBranchFromTrigger(trig, null, `${phase.name} — "${univ.name}"`);
        }

        window.ulcData.transitions.unshift({ univId: univ.id, name: univ.name, from: oldPhase, to: phase.id, phaseName: phase.name, year: window.year||0 });
        if (window.ulcData.transitions.length > 100) window.ulcData.transitions.length = 100;
      }

      // Áp dụng phase modifiers
      const [minS, maxS] = phase.stabRange;
      const targetStab   = (minS + maxS) / 2;
      univ.stability     = univ.stability * 0.995 + targetStab * 0.005;
      univ.stability     = Math.max(1, Math.min(100, univ.stability));

      // Heat death risk
      if (phase.id === "dying") {
        univ.heatDeathRisk = (univ.heatDeathRisk || 0) + 0.01;
      } else if (phase.id === "heat_death") {
        univ.heatDeathRisk = (univ.heatDeathRisk || 0) + 0.05;
        if (univ.heatDeathRisk > 100 || Math.random() < 0.002) {
          _triggerHeatDeath(univ);
        }
      }
    });

    try { localStorage.setItem("cgv6_multiverse_v35", JSON.stringify(window.mvData)); } catch(e) {}
  }

  function _triggerHeatDeath(univ) {
    if (typeof window.mvDestroyUniverse === "function") window.mvDestroyUniverse(univ.id);
    window.ulcData.heatDeaths++;
    const msg = `❄️ NHIỆT CHẾT VŨ TRỤ: "${univ.name}" — vũ trụ kết thúc vĩnh viễn!`;
    if (typeof window.mvLog === "function") window.mvLog(msg);
    if (typeof window.htAddEvent === "function") window.htAddEvent({ year: window.year||0, desc: msg, type:"heat_death", source:"lifecycle_v37" });
    save();
  }

  window.ulcGetPhases      = function() { return PHASES; };
  window.ulcGetPhaseOf     = function(univ) { return getPhase(univ.lifecycleAge || 0); };
  window.ulcGetTransitions = function() { return window.ulcData.transitions; };
  window.ulcGetHeatDeaths  = function() { return window.ulcData.heatDeaths; };

  // ─── PUBLIC: Đẩy nhanh lifecycle ─────────────────────────────────────────
  window.ulcAccelerate = function(univId, tickCount) {
    const univ = window.mvData && window.mvData.universes.find(u => u.id === univId);
    if (!univ) return;
    univ.lifecycleAge = (univ.lifecycleAge || 0) + (tickCount || 50);
    if (typeof window.mvLog === "function") window.mvLog(`⏩ Đẩy nhanh vòng đời "${univ.name}" +${tickCount||50} tuổi`);
    try { localStorage.setItem("cgv6_multiverse_v35", JSON.stringify(window.mvData)); } catch(e) {}
  };

  window.ulcRestore = function(univId) {
    const univ = window.mvData && window.mvData.universes.find(u => u.id === univId);
    if (!univ) return;
    univ.lifecycleAge   = 150;
    univ.lifecyclePhase = "golden_age";
    univ.heatDeathRisk  = 0;
    univ.stability      = 80;
    if (typeof window.mvLog === "function") window.mvLog(`♻️ Khôi phục "${univ.name}" về Kỷ Nguyên Vàng`);
    try { localStorage.setItem("cgv6_multiverse_v35", JSON.stringify(window.mvData)); } catch(e) {}
  };

  // ─── RENDER (dùng trong Observatory) ─────────────────────────────────────
  window.ulcRenderSection = function(containerId) {
    const el = document.getElementById(containerId || "ulc-section");
    if (!el) return;
    const universes = window.mvData ? window.mvData.universes.filter(u => u.status === "active") : [];
    const phases    = PHASES;

    el.innerHTML = `
<div style="padding:12px;font-family:'Noto Serif SC',serif;background:#0a0a1a;color:#e2e8f0">
  <div style="font-size:13px;color:#fbbf24;font-weight:600;margin-bottom:10px">🌀 Vòng Đời Vũ Trụ · Nhiệt Chết: ${window.ulcData.heatDeaths}</div>

  <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
    ${phases.map(ph => {
      const cnt = universes.filter(u => u.lifecyclePhase === ph.id).length;
      return `<div style="padding:5px 10px;background:#0f172a;border:1px solid ${cnt>0?ph.color+"66":"#1e293b"};border-radius:6px;font-size:11px;color:${ph.color}">${ph.name} <span style="color:#64748b">${cnt}</span></div>`;
    }).join("")}
  </div>

  ${universes.length > 0 ? `<div style="display:grid;gap:7px;max-height:280px;overflow-y:auto">
    ${universes.map(u => {
      const ph = getPhase(u.lifecycleAge || 0);
      const progress = Math.min(100, ((u.lifecycleAge||0) / 700) * 100);
      return `
      <div style="background:#0f172a;border:1px solid ${ph.color}33;border-radius:8px;padding:10px">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:4px;margin-bottom:6px">
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:12px;font-weight:600;color:${u.typeColor||"#94a3b8"}">${u.name}</span>
            <span style="font-size:11px;color:${ph.color}">${ph.name}</span>
          </div>
          <div style="display:flex;gap:5px">
            <button onclick="ulcAccelerate('${u.id}',50);ulcRenderSection('ulc-section')" style="padding:3px 7px;background:#0a0a1a;border:1px solid ${ph.color}55;border-radius:4px;color:${ph.color};cursor:pointer;font-size:10px">⏩+50</button>
            <button onclick="ulcRestore('${u.id}');ulcRenderSection('ulc-section')" style="padding:3px 7px;background:#0a0a1a;border:1px solid #34d39955;border-radius:4px;color:#34d399;cursor:pointer;font-size:10px">♻️</button>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:#64748b;margin-bottom:4px">
          <span>Tuổi: ${(u.lifecycleAge||0).toFixed(1)}</span>
          <span style="color:${(u.heatDeathRisk||0)>50?"#ef4444":"#64748b"}">Nguy cơ nhiệt chết: ${(u.heatDeathRisk||0).toFixed(0)}%</span>
        </div>
        <div style="height:4px;background:#1e293b;border-radius:2px;overflow:hidden">
          <div style="height:100%;background:linear-gradient(to right,${ph.color},${PHASES[Math.min(PHASES.length-1, PHASES.findIndex(p=>p.id===ph.id)+1)]?.color||ph.color});width:${progress}%"></div>
        </div>
      </div>`;
    }).join("")}
  </div>` : `<div style="color:#475569;text-align:center;padding:20px">Chưa có vũ trụ</div>`}
</div>`;
  };

  // ─── gameTick ─────────────────────────────────────────────────────────────
  const _prevTick = window.gameTick;
  window.gameTick = function() {
    if (typeof _prevTick === "function") _prevTick();
    window.ulcData.tick++;
    if (window.ulcData.tick % 10 === 0) tickLifecycles();
    if (window.ulcData.tick % 60 === 0) save();
  };

  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
      load();
      console.log("[UniverseLifecycleEngine V37] 🌀 Vòng đời vũ trụ sẵn sàng. Nhiệt chết:", window.ulcData.heatDeaths);
    }, 3600);
  });
})();
