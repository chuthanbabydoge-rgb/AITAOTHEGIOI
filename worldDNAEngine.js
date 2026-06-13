(function() {
  "use strict";
  // ============================================================
  // WORLD DNA ENGINE V62
  // Tạo World ID · World Seed · World DNA duy nhất cho mỗi thế giới
  // EXPAND ONLY · init: 12200ms · save: cgv6_world_dna_v62
  // ============================================================

  const SAVE_KEY = "cgv6_world_dna_v62";

  window.worldDNAData = {
    worldId: null,
    seed: null,
    dna: null,
    dnaReadable: null,
    config: null,
    createdAt: null,
    creatorId: null,
    creatorTitle: null,
    history: []
  };

  // ─── PERSIST ───────────────────────────────────────────────────────────────
  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.worldDNAData)); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.worldDNAData = JSON.parse(d);
    } catch(e) {}
  }

  // ─── SEEDED RNG ─────────────────────────────────────────────────────────────
  // Simple mulberry32 seeded RNG for deterministic DNA generation
  window.wdna62Rng = function(seed) {
    let s = seed >>> 0;
    return function() {
      s += 0x6D2B79F5;
      let t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  };

  // ─── ENCODE HELPERS ─────────────────────────────────────────────────────────
  const GENRE_CODE = {
    cultivation: "CU", fantasy: "FA", scifi: "SF",
    mythology: "MY", zombie: "AP", cyberpunk: "CB", custom: "XX"
  };
  const SCALE_CODE   = { tiny: "T", small: "S", medium: "M", large: "L", massive: "V" };
  const CHAOS_CODE   = { peaceful: "P", balanced: "B", chaotic: "C", extreme: "E" };

  const CREATOR_TITLES = [
    "World Founder", "Supreme Creator", "First God",
    "Architect of Worlds", "The Primordial", "Genesis God", "World Weaver"
  ];

  // ─── GENERATE DNA ───────────────────────────────────────────────────────────
  window.wdna62GenerateDNA = function(config) {
    // config: { worldName, genre, templateKey, scale, chaos, raceCount, countryCount, religionCount, cityCount }
    const ts      = Date.now();
    const seed    = (ts ^ (Math.random() * 0xFFFFFFFF | 0)) >>> 0;
    const rng     = window.wdna62Rng(seed);

    // Generate hex suffix from seed
    const hexChars = "0123456789ABCDEF";
    let hexSuffix = "";
    for (let i = 0; i < 8; i++) hexSuffix += hexChars[Math.floor(rng() * 16)];

    const gc = GENRE_CODE[config.genre]   || GENRE_CODE[config.templateKey] || "XX";
    const sc = SCALE_CODE[config.scale]   || "M";
    const cc = CHAOS_CODE[config.chaos]   || "B";
    const rc = String(config.raceCount    || 4).padStart(2, "0");
    const nc = String(config.countryCount || 4).padStart(2, "0");

    const dna         = `CGV6-${gc}-${sc}${cc}-R${rc}N${nc}-${hexSuffix}`;
    const worldId     = `WLD-${hexSuffix.slice(0,4)}-${Date.now().toString(36).toUpperCase()}`;
    const creatorId   = `CR-${hexSuffix.slice(4,8)}-${Math.floor(rng()*9999).toString().padStart(4,"0")}`;
    const creatorIdx  = Math.floor(rng() * CREATOR_TITLES.length);
    const creatorTitle = CREATOR_TITLES[creatorIdx];

    window.worldDNAData = {
      worldId,
      seed,
      dna,
      dnaReadable: dna,
      config: Object.assign({}, config),
      createdAt: new Date().toISOString(),
      creatorId,
      creatorTitle,
      history: (window.worldDNAData.history || [])
    };

    // Push to history (keep last 10)
    window.worldDNAData.history.push({
      worldId, dna, worldName: config.worldName,
      createdAt: window.worldDNAData.createdAt
    });
    if (window.worldDNAData.history.length > 10) window.worldDNAData.history.shift();

    save();
    console.log("[WorldDNAEngine V62] 🧬 DNA Generated:", dna, "| World:", worldId);
    return { worldId, seed, dna, creatorId, creatorTitle };
  };

  window.wdna62GetDNA        = function() { return window.worldDNAData; };
  window.wdna62GetSeed       = function() { return window.worldDNAData.seed; };
  window.wdna62GetWorldId    = function() { return window.worldDNAData.worldId; };
  window.wdna62GetCreator    = function() { return { id: window.worldDNAData.creatorId, title: window.worldDNAData.creatorTitle }; };
  window.wdna62GetHistory    = function() { return window.worldDNAData.history || []; };

  // ─── RENDER PANEL (for wizard use) ─────────────────────────────────────────
  window.wdna62RenderPanel = function() {
    const d = window.worldDNAData;
    if (!d.dna) {
      return `<div style="padding:24px;text-align:center;color:#64748b;">
        <div style="font-size:48px;margin-bottom:12px;">🧬</div>
        <div style="font-size:14px;color:#94a3b8;">Chưa có World DNA.</div>
        <div style="font-size:12px;color:#475569;margin-top:8px;">Tạo thế giới để sinh ra World DNA duy nhất.</div>
      </div>`;
    }

    const rng   = window.wdna62Rng(d.seed || 42);
    const bars  = Array.from({length: 8}, () => Math.floor(rng() * 100));
    const labels = ["Độ Mạnh Mana","Tốc Độ Tiến Hóa","Mật Độ Sự Kiện",
                    "Độ Màu Mỡ","Tần Suất Anh Hùng","Xung Đột Tiềm Năng",
                    "Liên Kết ĐVT","Độ Phức Tạp"];
    const colors = ["#f1c40f","#3498db","#e74c3c","#2ecc71","#9b59b6","#e67e22","#1abc9c","#e91e63"];

    let barsHtml = labels.map((lbl,i) => `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
        <div style="width:120px;font-size:11px;color:#94a3b8;">${lbl}</div>
        <div style="flex:1;background:#1e293b;border-radius:4px;height:10px;overflow:hidden;">
          <div style="width:${bars[i]}%;height:100%;background:${colors[i]};border-radius:4px;"></div>
        </div>
        <div style="width:30px;font-size:11px;color:${colors[i]};text-align:right;">${bars[i]}</div>
      </div>`).join("");

    const history = (d.history||[]).slice().reverse().slice(0,5);
    const histHtml = history.length > 0
      ? history.map(h => `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #1e293b;font-size:11px;">
          <span style="color:#94a3b8;">${h.worldName||'Không tên'}</span>
          <span style="color:#64748b;font-size:10px;">${h.dna||''}</span>
        </div>`).join("")
      : '<div style="color:#475569;font-size:11px;">Chưa có lịch sử.</div>';

    return `<div style="padding:14px;font-family:'Noto Serif SC',serif;">
      <div style="background:linear-gradient(135deg,#0d1b2a,#0a1628);border:2px solid #f1c40f44;border-radius:12px;padding:16px;margin-bottom:12px;text-align:center;">
        <div style="font-size:12px;color:#64748b;margin-bottom:4px;letter-spacing:2px;">WORLD DNA</div>
        <div style="font-size:22px;font-weight:bold;color:#f1c40f;letter-spacing:3px;font-family:'Courier New',monospace;">${d.dna}</div>
        <div style="margin-top:8px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <span style="font-size:10px;color:#64748b;">ID: <span style="color:#3498db;">${d.worldId||'-'}</span></span>
          <span style="font-size:10px;color:#64748b;">Seed: <span style="color:#9b59b6;">${d.seed||'-'}</span></span>
          <span style="font-size:10px;color:#64748b;">Creator: <span style="color:#2ecc71;">${d.creatorTitle||'-'}</span></span>
        </div>
      </div>

      <div style="background:#0d1b2a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-bottom:12px;">
        <div style="font-size:12px;color:#f1c40f;font-weight:bold;margin-bottom:8px;">🧬 GENOME MAP</div>
        ${barsHtml}
      </div>

      <div style="background:#0d1b2a;border:1px solid #1e293b;border-radius:8px;padding:12px;">
        <div style="font-size:12px;color:#94a3b8;font-weight:bold;margin-bottom:8px;">📜 LỊCH SỬ TẠO THẾ GIỚI (${d.history?.length||0})</div>
        ${histHtml}
      </div>
    </div>`;
  };

  // ─── INIT ───────────────────────────────────────────────────────────────────
  function init() {
    load();
    console.log("[WorldDNAEngine V62] 🧬 World DNA Engine — Khởi động thành công. Seed system ready.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 12200); });
  } else {
    setTimeout(init, 12200);
  }

})();
