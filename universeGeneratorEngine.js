(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIVERSE GENERATOR ENGINE V37 — Máy Sinh Vũ Trụ Vô Hạn
  // Seed-based procedural generation · Batch · Auto · Tích hợp V35+V36
  // ═══════════════════════════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_universe_generator_v37";

  // Các quy luật vật lý (8 loại)
  const PHYSICS_LAWS = [
    { id:"lingqi",     name:"⚡ Linh Khí Pháp Tắc",   color:"#06b6d4", stabMod:+10, popMod:1.5,  powerMod:1.3, desc:"Tu luyện cực thịnh — linh khí tràn ngập" },
    { id:"gravity",    name:"🌊 Trọng Lực Cực Đại",    color:"#3b82f6", stabMod:-5,  popMod:0.8,  powerMod:2.0, desc:"Trọng lực siêu dày đặc — chiến tranh khốc liệt" },
    { id:"slow_time",  name:"🕰️ Thời Gian Chậm",       color:"#8b5cf6", stabMod:+15, popMod:0.6,  powerMod:0.8, desc:"Thời gian chảy chậm — vũ trụ già rất lâu" },
    { id:"chaos",      name:"🔥 Năng Lượng Hỗn Loạn",  color:"#ef4444", stabMod:-30, popMod:1.2,  powerMod:3.0, desc:"Hỗn loạn cực độ — sức mạnh kinh hoàng" },
    { id:"neg_entropy",name:"❄️ Entropy Ngược",         color:"#06b6d4", stabMod:+5,  popMod:1.1,  powerMod:1.2, desc:"Vũ trụ mạnh hơn theo tuổi thọ" },
    { id:"mechanical", name:"⚙️ Vật Lý Cơ Học",        color:"#64748b", stabMod:+8,  popMod:1.0,  powerMod:1.5, desc:"Công nghệ thuần túy — ma pháp không tồn tại" },
    { id:"divine_dom", name:"🌟 Thần Thánh Ưu Thế",    color:"#fbbf24", stabMod:+20, popMod:0.9,  powerMod:1.4, desc:"Thần linh thống trị — ân điển đổ xuống" },
    { id:"dark_qi",    name:"👹 Tà Khí Thống Trị",      color:"#7c3aed", stabMod:-20, popMod:1.4,  powerMod:2.5, desc:"Tà năng bao trùm — sụp đổ ngẫu nhiên" }
  ];

  // Bảng tên seed ngẫu nhiên
  const SEED_PREFIXES = ["Alpha","Beta","Gamma","Delta","Sigma","Omega","Zeta","Theta","Lambda","Kappa"];
  const SEED_SUFFIXES = ["Prime","Nova","Ultima","Genesis","Apex","Zero","Infinity","Void","Core","Echo"];

  function defaultData() {
    return {
      generated:   [],
      queue:       [],
      autoEnabled: false,
      autoRate:    300,
      seedBase:    Math.floor(Math.random()*999999),
      totalGenerated: 0,
      tick: 0,
      presets: [
        { name:"🌌 Đại Vụ Nổ Loạt",     count:5, types:["cultivation","divine","fantasy","demon","mythology"],    law:"lingqi"     },
        { name:"⚙️ Thời Đại Máy Móc",    count:4, types:["technology","cyberpunk","mechanical","technology"],      law:"mechanical"  },
        { name:"👹 Hắc Ám Đa Giới",      count:6, types:["demon","apocalypse","demon","beast","demon","demon"],    law:"dark_qi"    },
        { name:"🌟 Thiên Đình Đa Tầng",  count:4, types:["divine","divine","mythology","cultivation"],             law:"divine_dom"  },
        { name:"🔥 Hỗn Loạn Vĩnh Cửu",  count:8, types:null,                                                      law:"chaos"      }
      ]
    };
  }

  window.ugData = window.ugData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.ugData)); } catch(e) {} }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { const p = JSON.parse(raw); if (p) window.ugData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  // ─── SEED: tạo số ngẫu nhiên từ seed ─────────────────────────────────────
  function seededRand(seed) {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
  }

  function generateSeed() {
    window.ugData.seedBase++;
    return window.ugData.seedBase;
  }

  // ─── PUBLIC: Sinh 1 vũ trụ từ seed ───────────────────────────────────────
  window.ugGenerateUniverse = function(seed, forceLawId, forceTypeId) {
    if (!window.mvCreateUniverse) return null;
    seed = seed || generateSeed();

    // Xác định loại vũ trụ V35
    const V35_TYPES = ["fantasy","cultivation","divine","demon","technology","cyberpunk","mythology","apocalypse","ocean","beast"];
    const typeId    = forceTypeId || V35_TYPES[Math.floor(seededRand(seed) * V35_TYPES.length)];

    // Xác định quy luật vật lý
    const lawId     = forceLawId || PHYSICS_LAWS[Math.floor(seededRand(seed*2) * PHYSICS_LAWS.length)].id;
    const law       = PHYSICS_LAWS.find(l => l.id === lawId) || PHYSICS_LAWS[0];

    // Tạo tên từ seed
    const prefix = SEED_PREFIXES[Math.floor(seededRand(seed*3) * SEED_PREFIXES.length)];
    const suffix = SEED_SUFFIXES[Math.floor(seededRand(seed*4) * SEED_SUFFIXES.length)];
    const genName = prefix + "-" + suffix + " #" + seed;

    // Tạo vũ trụ qua V35 API
    const univ = window.mvCreateUniverse(typeId, genName);
    if (!univ) return null;

    // Gắn physics law vào universe object
    univ.physicsLaw     = law.id;
    univ.physicsLawName = law.name;
    univ.physicsLawColor= law.color;
    univ.physicsLawDesc = law.desc;
    univ.seed           = seed;

    // Áp dụng modifiers từ physics law
    univ.stability = Math.max(1, Math.min(100, (univ.stability || 70) + law.stabMod));
    univ.power     = Math.floor((univ.power || 100) * law.powerMod);
    univ.population= Math.floor((univ.population || 500000) * law.popMod);

    // Khởi động lifecycle
    univ.lifecyclePhase = "bigbang";
    univ.lifecycleAge   = 0;
    univ.heatDeathRisk  = 0;

    // Tích hợp V36: tự tạo canonical timeline cho universe mới
    if (typeof window.tlCreateTimeline === "function") {
      const tl = window.tlCreateTimeline("canonical", genName + " — Dòng Chính", `Vũ trụ ${genName} hình thành từ Big Bang`, null);
      if (tl) univ.canonicalTimelineId = tl.id;
    }

    // Lưu record
    const record = {
      univId: univ.id, name: genName, seed, lawId, typeId,
      typeId: typeId, generatedAt: window.year||0
    };
    window.ugData.generated.unshift(record);
    if (window.ugData.generated.length > 200) window.ugData.generated.length = 200;
    window.ugData.totalGenerated++;

    // Persist V35 data
    try { localStorage.setItem("cgv6_multiverse_v35", JSON.stringify(window.mvData)); } catch(e) {}

    // Log
    if (typeof window.mvLog === "function") window.mvLog(`♾️ [Generator V37] Sinh vũ trụ "${genName}" (${law.name}) · Seed: ${seed}`);
    if (typeof window.htAddEvent === "function") window.htAddEvent({ year: window.year||0, desc:`♾️ Sinh vũ trụ "${genName}" — ${law.name}`, type:"universe_generated", source:"universe_generator_v37" });

    save();
    return univ;
  };

  // ─── PUBLIC: Sinh hàng loạt ──────────────────────────────────────────────
  window.ugBatchGenerate = function(count, lawId, typeIds) {
    const results = [];
    const n = Math.min(count || 5, 20);
    const types = (typeIds && typeIds.length > 0) ? typeIds : null;
    for (let i = 0; i < n; i++) {
      const seed    = generateSeed();
      const typeId  = types ? types[i % types.length] : null;
      const univ    = window.ugGenerateUniverse(seed, lawId || null, typeId);
      if (univ) results.push(univ);
    }
    if (typeof window.mvLog === "function") window.mvLog(`♾️ [Generator V37] Đã sinh ${results.length} vũ trụ hàng loạt!`);
    return results;
  };

  // ─── PUBLIC: Chạy preset ─────────────────────────────────────────────────
  window.ugRunPreset = function(presetIdx) {
    const p = window.ugData.presets[presetIdx];
    if (!p) return;
    window.ugBatchGenerate(p.count, p.law, p.types);
    if (typeof window.mvLog === "function") window.mvLog(`♾️ [Generator V37] Preset "${p.name}" — ${p.count} vũ trụ!`);
  };

  // ─── PUBLIC: Lấy quy luật vật lý ─────────────────────────────────────────
  window.ugGetPhysicsLaws = function() { return PHYSICS_LAWS; };
  window.ugGetGenerated   = function() { return window.ugData.generated; };
  window.ugGetLawById     = function(id) { return PHYSICS_LAWS.find(l => l.id === id) || null; };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  window.ugRenderPanel = function() {
    const el = document.getElementById("panel-universe-generator-v37");
    if (!el) return;
    const activeUnivs = window.mvData ? window.mvData.universes.filter(u => u.status === "active") : [];
    const generated   = window.ugData.generated.slice(0, 30);
    const presets     = window.ugData.presets;
    const laws        = PHYSICS_LAWS;

    el.innerHTML = `
<div style="padding:16px;font-family:'Noto Serif SC',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
    <div>
      <h2 style="margin:0;font-size:20px;color:#8b5cf6;font-family:Cinzel,serif">♾️ Máy Sinh Vũ Trụ V37</h2>
      <div style="font-size:11px;color:#64748b;margin-top:2px">Seed-based · Infinite Generation · ${window.ugData.totalGenerated} đã sinh</div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button onclick="ugGenerateUniverse();ugRenderPanel()" style="padding:6px 14px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:12px;font-weight:600">♾️ Sinh 1 Vũ Trụ</button>
      <button onclick="ugBatchGenerate(5);ugRenderPanel()" style="padding:6px 14px;background:linear-gradient(135deg,#fbbf24,#f59e0b);border:none;border-radius:6px;color:#000;cursor:pointer;font-size:12px;font-weight:600">⚡ Sinh x5</button>
      <button onclick="ugRenderPanel()" style="padding:6px 12px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:12px">↺</button>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:18px">
    <div style="background:#0f172a;border:1px solid #8b5cf644;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:700;color:#8b5cf6">${window.ugData.totalGenerated}</div><div style="font-size:10px;color:#64748b">Đã Sinh</div></div>
    <div style="background:#0f172a;border:1px solid #34d39444;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:700;color:#34d399">${activeUnivs.filter(u=>u.physicsLaw).length}</div><div style="font-size:10px;color:#64748b">Có Physics Law</div></div>
    <div style="background:#0f172a;border:1px solid #fbbf2444;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:700;color:#fbbf24">${window.ugData.seedBase}</div><div style="font-size:10px;color:#64748b">Seed Hiện Tại</div></div>
    <div style="background:#0f172a;border:1px solid #06b6d444;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:700;color:#06b6d4">${activeUnivs.filter(u=>u.canonicalTimelineId).length}</div><div style="font-size:10px;color:#64748b">Timeline Liên Kết</div></div>
  </div>

  <div style="margin-bottom:18px">
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:8px">🎛️ TÙY CHỈNH SINH VŨ TRỤ</div>
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:14px">
      <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end;flex-wrap:wrap">
        <div>
          <label style="font-size:11px;color:#64748b;display:block;margin-bottom:4px">Quy Luật Vật Lý</label>
          <select id="ug-law-sel" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:12px">
            <option value="">Ngẫu nhiên</option>
            ${laws.map(l=>`<option value="${l.id}">${l.name}</option>`).join("")}
          </select>
        </div>
        <div>
          <label style="font-size:11px;color:#64748b;display:block;margin-bottom:4px">Loại Vũ Trụ</label>
          <select id="ug-type-sel" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:12px">
            <option value="">Ngẫu nhiên</option>
            <option value="fantasy">🏰 Kỳ Ảo</option>
            <option value="cultivation">⚡ Tu Tiên</option>
            <option value="divine">✨ Thần Thánh</option>
            <option value="demon">👹 Ma Giới</option>
            <option value="technology">⚙️ Công Nghệ</option>
            <option value="cyberpunk">🌆 Cyberpunk</option>
            <option value="mythology">🌊 Thần Thoại</option>
            <option value="apocalypse">☠️ Tận Thế</option>
            <option value="ocean">🌊 Đại Dương</option>
            <option value="beast">🐉 Thú Hoang</option>
          </select>
        </div>
        <button onclick="const l=document.getElementById('ug-law-sel').value;const t=document.getElementById('ug-type-sel').value;ugGenerateUniverse(null,l||null,t||null);ugRenderPanel()" style="padding:8px 16px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:12px;white-space:nowrap">♾️ Tạo</button>
      </div>
      <div style="margin-top:10px">
        <label style="font-size:11px;color:#64748b;display:block;margin-bottom:4px">Sinh hàng loạt</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <input id="ug-count-inp" type="number" min="1" max="20" value="5" style="width:70px;padding:7px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:12px">
          <button onclick="const n=parseInt(document.getElementById('ug-count-inp').value)||5;const l=document.getElementById('ug-law-sel').value;ugBatchGenerate(n,l||null,null);ugRenderPanel()" style="padding:7px 14px;background:linear-gradient(135deg,#fbbf24,#f59e0b);border:none;border-radius:6px;color:#000;cursor:pointer;font-size:12px;font-weight:600">⚡ Sinh Hàng Loạt</button>
        </div>
      </div>
    </div>
  </div>

  <div style="margin-bottom:18px">
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:8px">🎯 PRESET NHANH</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px">
      ${presets.map((p,i)=>`<button onclick="ugRunPreset(${i});ugRenderPanel()" style="padding:10px;background:#0f172a;border:1px solid #334155;border-radius:8px;color:#94a3b8;cursor:pointer;font-size:12px;text-align:left"><div style="font-weight:600;color:#e2e8f0;margin-bottom:3px">${p.name}</div><div style="font-size:10px;color:#64748b">${p.count} vũ trụ</div></button>`).join("")}
    </div>
  </div>

  ${generated.length > 0 ? `
  <div>
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:8px">📋 VŨ TRỤ ĐÃ SINH GẦN ĐÂY (${window.ugData.totalGenerated} tổng)</div>
    <div style="display:grid;gap:6px;max-height:280px;overflow-y:auto">
      ${generated.map(r => {
        const univ = window.mvData ? window.mvData.universes.find(u => u.id === r.univId) : null;
        const law  = PHYSICS_LAWS.find(l => l.id === r.lawId);
        return `
        <div style="background:#0f172a;border:1px solid ${law ? law.color+"33" : "#1e293b"};border-radius:8px;padding:10px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:4px">
          <div>
            <span style="font-size:12px;font-weight:600;color:${law ? law.color : "#94a3b8"}">${r.name}</span>
            ${law ? `<span style="font-size:10px;color:#64748b;margin-left:6px">${law.name}</span>` : ""}
          </div>
          <div style="font-size:10px;color:#475569">
            ${univ ? `⚡${univ.stability.toFixed(0)}% · 👥${(univ.population/1000).toFixed(0)}K` : "☠️ sụp đổ"}
            · Seed ${r.seed}
          </div>
        </div>`;
      }).join("")}
    </div>
  </div>` : `<div style="text-align:center;padding:40px;color:#475569;background:#0f172a;border-radius:8px"><div style="font-size:40px">♾️</div><div style="margin-top:8px">Nhấn "Sinh Vũ Trụ" để bắt đầu!</div></div>`}
</div>`;
  };

  // ─── AUTO Generation (gameTick) ───────────────────────────────────────────
  const _prevTick = window.gameTick;
  window.gameTick = function() {
    if (typeof _prevTick === "function") _prevTick();
    window.ugData.tick++;
    if (window.ugData.autoEnabled && window.ugData.tick % (window.ugData.autoRate || 300) === 0) {
      window.ugGenerateUniverse();
    }
    if (window.ugData.tick % 60 === 0) save();
  };

  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
      load();
      console.log("[UniverseGenerator V37] ♾️ Máy sinh vũ trụ sẵn sàng. Seed:", window.ugData.seedBase, "· Đã sinh:", window.ugData.totalGenerated);
    }, 3500);
  });
})();
