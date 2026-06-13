(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIVERSE LAW ENGINE V37 — Quy Luật Vật Lý Đa Vũ Trụ
  // Mỗi vũ trụ có quy luật riêng ảnh hưởng đến gameplay
  // ═══════════════════════════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_universe_laws_v37";

  const LAW_EFFECTS = {
    lingqi:     { tickStabMod:+0.05,  tickPopMod:1.0005,  tickPowerMod:1.001,  specialEvent:"cultivation_breakthrough" },
    gravity:    { tickStabMod:-0.03,  tickPopMod:0.9999,  tickPowerMod:1.002,  specialEvent:"gravity_collapse"        },
    slow_time:  { tickStabMod:+0.08,  tickPopMod:0.9998,  tickPowerMod:0.999,  specialEvent:"time_rift"               },
    chaos:      { tickStabMod:-0.15,  tickPopMod:1.0008,  tickPowerMod:1.003,  specialEvent:"chaos_surge"             },
    neg_entropy:{ tickStabMod:+0.10,  tickPopMod:1.0003,  tickPowerMod:1.002,  specialEvent:"entropy_reversal"        },
    mechanical: { tickStabMod:+0.06,  tickPopMod:1.0002,  tickPowerMod:1.001,  specialEvent:"tech_revolution"         },
    divine_dom: { tickStabMod:+0.12,  tickPopMod:0.9997,  tickPowerMod:1.001,  specialEvent:"divine_blessing"         },
    dark_qi:    { tickStabMod:-0.10,  tickPopMod:1.0006,  tickPowerMod:1.004,  specialEvent:"dark_surge"              }
  };

  const SPECIAL_EVENTS = {
    cultivation_breakthrough: { name:"🌟 Đột Phá Tu Luyện",  stabMod:+5,  popMod:1.01  },
    gravity_collapse:         { name:"🌊 Trọng Lực Sụp Đổ",  stabMod:-8,  popMod:0.99  },
    time_rift:                { name:"🕰️ Khe Nứt Thời Gian",  stabMod:-3,  popMod:1.0   },
    chaos_surge:              { name:"🔥 Bùng Nổ Hỗn Loạn",  stabMod:-12, popMod:1.02  },
    entropy_reversal:         { name:"❄️ Đảo Ngược Entropy",  stabMod:+8,  popMod:1.005 },
    tech_revolution:          { name:"⚙️ Cách Mạng Công Nghệ",stabMod:+4,  popMod:1.008 },
    divine_blessing:          { name:"✨ Ân Điển Thần Linh",   stabMod:+10, popMod:1.003 },
    dark_surge:               { name:"👹 Cuồng Bạo Tà Khí",   stabMod:-6,  popMod:1.015 }
  };

  function defaultData() {
    return { interactions: [], appliedThisTick: 0, tick: 0 };
  }

  window.ulData = window.ulData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.ulData)); } catch(e) {} }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { const p = JSON.parse(raw); if (p) window.ulData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  // ─── Áp dụng quy luật vật lý lên vũ trụ ─────────────────────────────────
  function applyLaws() {
    if (!window.mvData || !window.mvData.universes) return;
    const active = window.mvData.universes.filter(u => u.status === "active" && u.physicsLaw);
    let changed = 0;

    active.forEach(function(univ) {
      const effects = LAW_EFFECTS[univ.physicsLaw];
      if (!effects) return;

      univ.stability = Math.max(1, Math.min(100, (univ.stability||70) + effects.tickStabMod));
      univ.population= Math.floor((univ.population||500000) * effects.tickPopMod);
      univ.power     = Math.floor((univ.power||100) * effects.tickPowerMod);
      changed++;

      // Sự kiện đặc biệt ngẫu nhiên (xác suất thấp)
      if (Math.random() < 0.003) {
        const evKey = effects.specialEvent;
        const ev    = SPECIAL_EVENTS[evKey];
        if (ev) {
          univ.stability  = Math.max(1, Math.min(100, univ.stability + (ev.stabMod||0)));
          univ.population = Math.floor(univ.population * (ev.popMod||1));
          const logMsg = `⚖️ [${univ.name}] ${ev.name} (${univ.physicsLawName||univ.physicsLaw})`;
          if (typeof window.mvLog === "function") window.mvLog(logMsg);
          if (typeof window.htAddEvent === "function") window.htAddEvent({ year: window.year||0, desc: logMsg, type:"law_event", source:"universe_laws_v37" });
          window.ulData.interactions.unshift({ univId: univ.id, name: univ.name, event: ev.name, law: univ.physicsLaw, year: window.year||0 });
          if (window.ulData.interactions.length > 100) window.ulData.interactions.length = 100;
        }
      }
    });

    window.ulData.appliedThisTick = changed;
    try { localStorage.setItem("cgv6_multiverse_v35", JSON.stringify(window.mvData)); } catch(e) {}
  }

  // ─── PUBLIC: Gán quy luật vào vũ trụ ─────────────────────────────────────
  window.ulAssignLaw = function(univId, lawId) {
    const univ = window.mvData && window.mvData.universes.find(u => u.id === univId);
    if (!univ) return;
    const laws = window.ugGetPhysicsLaws ? window.ugGetPhysicsLaws() : [];
    const law  = laws.find(l => l.id === lawId);
    if (!law) return;

    univ.physicsLaw      = law.id;
    univ.physicsLawName  = law.name;
    univ.physicsLawColor = law.color;
    univ.physicsLawDesc  = law.desc;
    // Áp dụng modifier ban đầu
    univ.stability = Math.max(1, Math.min(100, (univ.stability||70) + (law.stabMod||0)));

    window.ulData.interactions.unshift({ univId, name: univ.name, event:`Gán quy luật: ${law.name}`, law: law.id, year: window.year||0 });
    if (window.ulData.interactions.length > 100) window.ulData.interactions.length = 100;
    if (typeof window.mvLog === "function") window.mvLog(`⚖️ Gán ${law.name} → "${univ.name}"`);
    try { localStorage.setItem("cgv6_multiverse_v35", JSON.stringify(window.mvData)); } catch(e) {}
    save();
  };

  window.ulGetInteractions = function() { return window.ulData.interactions; };
  window.ulGetEffects       = function() { return LAW_EFFECTS; };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  window.ulRenderPanel = function() {
    const el = document.getElementById("panel-universe-laws-v37");
    if (!el) return;
    const laws     = window.ugGetPhysicsLaws ? window.ugGetPhysicsLaws() : [];
    const universes= window.mvData ? window.mvData.universes.filter(u => u.status === "active") : [];
    const withLaws = universes.filter(u => u.physicsLaw);
    const noLaws   = universes.filter(u => !u.physicsLaw);
    const interactions = window.ulData.interactions.slice(0, 20);

    el.innerHTML = `
<div style="padding:16px;font-family:'Noto Serif SC',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
    <div>
      <h2 style="margin:0;font-size:20px;color:#06b6d4;font-family:Cinzel,serif">⚖️ Quy Luật Vật Lý V37</h2>
      <div style="font-size:11px;color:#64748b;margin-top:2px">${withLaws.length}/${universes.length} vũ trụ có quy luật · ${laws.length} loại quy luật</div>
    </div>
    <button onclick="ulRenderPanel()" style="padding:6px 12px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:12px">↺</button>
  </div>

  <div style="margin-bottom:18px">
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:8px">📚 8 QUY LUẬT VẬT LÝ</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px">
      ${laws.map(l => {
        const fx = LAW_EFFECTS[l.id] || {};
        const univsWithThisLaw = universes.filter(u => u.physicsLaw === l.id);
        return `
        <div style="background:#0f172a;border:1px solid ${l.color}44;border-radius:10px;padding:12px">
          <div style="font-size:13px;font-weight:700;color:${l.color};margin-bottom:4px">${l.name}</div>
          <div style="font-size:11px;color:#64748b;margin-bottom:8px">${l.desc}</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;font-size:10px;margin-bottom:8px">
            <div style="background:#0a0a1a;padding:4px;border-radius:4px;text-align:center"><div style="color:#64748b">Ổn định</div><div style="color:${(fx.tickStabMod||0)>0?"#34d399":"#ef4444"}">${(fx.tickStabMod||0)>0?"+":""} ${((fx.tickStabMod||0)*100).toFixed(0)}/tick</div></div>
            <div style="background:#0a0a1a;padding:4px;border-radius:4px;text-align:center"><div style="color:#64748b">Dân số</div><div style="color:#e2e8f0">x${(fx.tickPopMod||1).toFixed(4)}</div></div>
            <div style="background:#0a0a1a;padding:4px;border-radius:4px;text-align:center"><div style="color:#64748b">VT dùng</div><div style="color:${l.color};font-weight:700">${univsWithThisLaw.length}</div></div>
          </div>
          ${noLaws.length > 0 ? `<div style="margin-top:4px">
            <select id="ul-assign-sel-${l.id}" style="width:100%;padding:5px;background:#1e293b;border:1px solid #334155;border-radius:5px;color:#94a3b8;font-size:10px;margin-bottom:4px">
              <option value="">Gán cho vũ trụ...</option>
              ${noLaws.map(u=>`<option value="${u.id}">${u.name.substring(0,22)}</option>`).join("")}
            </select>
            <button onclick="const s=document.getElementById('ul-assign-sel-${l.id}').value;if(s){ulAssignLaw(s,'${l.id}');ulRenderPanel()}" style="width:100%;padding:4px;background:#0a0a1a;border:1px solid ${l.color}55;border-radius:4px;color:${l.color};cursor:pointer;font-size:10px">⚖️ Gán</button>
          </div>` : ""}
        </div>`;
      }).join("")}
    </div>
  </div>

  ${withLaws.length > 0 ? `
  <div style="margin-bottom:18px">
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:8px">🌌 VŨ TRỤ CÓ QUY LUẬT</div>
    <div style="display:grid;gap:6px">
      ${withLaws.map(u => {
        const law = laws.find(l => l.id === u.physicsLaw);
        return `
        <div style="background:#0f172a;border:1px solid ${law ? law.color+"33" : "#1e293b"};border-radius:8px;padding:10px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px">
          <div>
            <span style="font-size:12px;font-weight:600;color:${u.typeColor||"#94a3b8"}">${u.name}</span>
            <span style="font-size:11px;color:${law ? law.color : "#64748b"};margin-left:8px">${law ? law.name : "?"}</span>
          </div>
          <div style="font-size:11px;color:#64748b">⚡${u.stability.toFixed(0)}% · 👥${(u.population/1000).toFixed(0)}K</div>
        </div>`;
      }).join("")}
    </div>
  </div>` : ""}

  ${interactions.length > 0 ? `
  <div>
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:6px">📜 SỰ KIỆN QUY LUẬT GẦN ĐÂY</div>
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;max-height:140px;overflow-y:auto">
      ${interactions.map(i=>`<div style="font-size:11px;color:#64748b;padding:3px 0;border-bottom:1px solid #0a0a1a">Năm ${i.year}: [${i.name}] ${i.event}</div>`).join("")}
    </div>
  </div>` : ""}
</div>`;
  };

  // ─── gameTick ─────────────────────────────────────────────────────────────
  const _prevTick = window.gameTick;
  window.gameTick = function() {
    if (typeof _prevTick === "function") _prevTick();
    window.ulData.tick++;
    if (window.ulData.tick % 5 === 0) applyLaws();
    if (window.ulData.tick % 60 === 0) save();
  };

  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
      load();
      console.log("[UniverseLawEngine V37] ⚖️ Quy luật vật lý sẵn sàng.");
    }, 3550);
  });
})();
