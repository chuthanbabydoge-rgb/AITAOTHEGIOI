(function() {
  "use strict";
  // ============================================================
  // WORLD CREATION WIZARD V62
  // 5-step wizard · Auto-generation · Jarvis guide · Preview
  // Inject vào creator-hub-v32 · 4 sub-tabs
  // EXPAND ONLY · init: 12400ms · save: cgv6_world_wizard_v62
  // ============================================================

  const SAVE_KEY   = "cgv6_world_wizard_v62";
  const WRAPPER_ID = "wcw62-section-wrapper";

  window.worldWizardData = {
    step: 1,
    creating: false,
    config: {
      worldName:     "",
      genre:         "cultivation",
      templateKey:   "cultivation",
      scale:         "medium",
      raceCount:     4,
      countryCount:  4,
      religionCount: 2,
      cityCount:     10,
      chaos:         "balanced"
    },
    lastCreated: null
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.worldWizardData)); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) {
        const parsed = JSON.parse(d);
        window.worldWizardData.lastCreated = parsed.lastCreated || null;
      }
    } catch(e) {}
  }

  // ─── WORLD TYPE DEFINITIONS ─────────────────────────────────────────────────
  const WORLD_TYPES = [
    { id:"cultivation", icon:"☯️", label:"Tu Tiên",    desc:"Linh khí, đột phá, tông môn tranh bá",    template:"cultivation", color:"#f1c40f" },
    { id:"fantasy",     icon:"🏰", label:"Fantasy",    desc:"Rồng, phép thuật, vương quốc kiếm sĩ",     template:"fantasy",     color:"#3498db" },
    { id:"scifi",       icon:"🚀", label:"Sci-Fi",     desc:"Vũ trụ, AI, thiên hà chiến tranh",          template:"scifi",       color:"#2ecc71" },
    { id:"mythology",   icon:"⚡", label:"Thần Thoại", desc:"Thần, titan, số phận và tiên tri",           template:"mythology",   color:"#9b59b6" },
    { id:"zombie",      icon:"☣️", label:"Apocalypse", desc:"Hậu tận thế, sinh tồn, chống zombie",       template:"zombie",      color:"#e74c3c" },
    { id:"scifi",       icon:"🌆", label:"Cyberpunk",  desc:"Mega-corp, hack, đường phố neon",            template:"scifi",       color:"#1abc9c" },
    { id:"cultivation", icon:"✨", label:"Custom",     desc:"Tự định nghĩa thể loại của bạn",            template:"cultivation", color:"#e67e22" }
  ];

  const SCALE_OPTIONS = [
    { id:"tiny",    icon:"🌱", label:"Tiny",    npc:10,  tc:5,  desc:"5 lãnh địa · 10 NPC · Thế giới đảo nhỏ"     },
    { id:"small",   icon:"🌿", label:"Small",   npc:15,  tc:10, desc:"10 lãnh địa · 15 NPC · Vương quốc nhỏ"      },
    { id:"medium",  icon:"🌍", label:"Medium",  npc:20,  tc:20, desc:"20 lãnh địa · 20 NPC · Lục địa chuẩn"       },
    { id:"large",   icon:"🌎", label:"Large",   npc:35,  tc:40, desc:"40 lãnh địa · 35 NPC · Thế giới rộng lớn"   },
    { id:"massive", icon:"🌌", label:"Massive", npc:60,  tc:80, desc:"80 lãnh địa · 60 NPC · Đa lục địa hùng vĩ"  }
  ];

  const CHAOS_OPTIONS = [
    { id:"peaceful", icon:"☮️", label:"Peaceful", desc:"Hòa bình · Ổn định cao · Ít xung đột",          color:"#2ecc71" },
    { id:"balanced", icon:"⚖️", label:"Balanced", desc:"Cân bằng · Xung đột vừa phải · Mặc định",       color:"#3498db" },
    { id:"chaotic",  icon:"🔥", label:"Chaotic",  desc:"Hỗn loạn · Nhiều chiến tranh · Thế giới sôi động",color:"#e67e22" },
    { id:"extreme",  icon:"💀", label:"Extreme",  desc:"Cực đoan · Đại chiến liên miên · Thách thức",    color:"#e74c3c" }
  ];

  // ─── STYLE HELPERS ──────────────────────────────────────────────────────────
  function selectedStyle(active, color) {
    return active
      ? "background:" + (color||"#1e40af") + "33;border:2px solid " + (color||"#3498db") + ";border-radius:8px;padding:10px;cursor:pointer;transition:all 0.2s;margin-bottom:6px;"
      : "background:#0d1b2a;border:2px solid #1e293b;border-radius:8px;padding:10px;cursor:pointer;transition:all 0.2s;margin-bottom:6px;";
  }

  // ─── JARVIS TIPS PER STEP ───────────────────────────────────────────────────
  const JARVIS_TIPS = [
    "Chọn thể loại phù hợp với sở thích của bạn. Tu Tiên phong phú về hệ thống cảnh giới; Fantasy có chiều sâu chính trị; Sci-Fi mang lại cảm giác vũ trụ.",
    "Quy mô ảnh hưởng đến độ phức tạp ban đầu. Người mới nên chọn Medium. Massive thích hợp khi bạn đã quen với simulation.",
    "Số lượng nhiều hơn = thế giới phức tạp hơn ngay từ đầu. Khuyến nghị: 3-4 chủng tộc, 4-6 quốc gia cho thế giới cân bằng.",
    "Peaceful phù hợp quan sát lâu dài. Extreme tạo drama liên tục nhưng khó kiểm soát. Balanced là lựa chọn tốt nhất cho người mới.",
    "Thế giới của bạn đã sẵn sàng! DNA duy nhất sẽ được tạo ra. Không có 2 thế giới nào giống nhau."
  ];

  // ─── RENDER STEP 1: WORLD TYPE ──────────────────────────────────────────────
  function renderStep1() {
    const cfg = window.worldWizardData.config;
    const cards = WORLD_TYPES.map(function(wt, i) {
      const active = (i === 6 ? cfg.genre === "custom" : cfg.genre === wt.id && cfg.templateKey === wt.template && !(i===5 && cfg.genre==="scifi" && cfg.label==="Cyberpunk"));
      const isActive = (cfg.templateKey === wt.template && cfg.genre === (i < 6 ? wt.id : "custom"));
      return `<div onclick="wcw62SelectType('${wt.template}','${i===6?'custom':wt.id}')"
        style="${selectedStyle(cfg.genre===wt.id && cfg.templateKey===wt.template && i < 6 || (i===6 && cfg.genre==='custom'), wt.color)}display:flex;gap:10px;align-items:center;">
        <div style="font-size:24px;min-width:32px;text-align:center;">${wt.icon}</div>
        <div>
          <div style="font-size:13px;font-weight:bold;color:${wt.color};">${wt.label}</div>
          <div style="font-size:11px;color:#94a3b8;">${wt.desc}</div>
        </div>
      </div>`;
    }).join("");

    return `<div style="padding:14px;">
      <div style="font-size:13px;font-weight:bold;color:#f1c40f;margin-bottom:10px;">🌍 Bước 1: Chọn Loại Thế Giới</div>
      <div style="margin-bottom:12px;">
        <label style="font-size:11px;color:#94a3b8;display:block;margin-bottom:4px;">Tên Thế Giới</label>
        <input id="wcw62-world-name" type="text" placeholder="Nhập tên thế giới của bạn..."
          value="${cfg.worldName||''}"
          oninput="window.worldWizardData.config.worldName=this.value"
          style="width:100%;background:#0d1b2a;border:1px solid #1e293b;border-radius:6px;padding:8px 10px;color:#e2e8f0;font-size:12px;font-family:'Noto Serif SC',serif;outline:none;"/>
      </div>
      ${cards}
    </div>`;
  }

  // ─── RENDER STEP 2: SCALE ───────────────────────────────────────────────────
  function renderStep2() {
    const cfg = window.worldWizardData.config;
    const cards = SCALE_OPTIONS.map(function(s) {
      return `<div onclick="wcw62SelectScale('${s.id}')"
        style="${selectedStyle(cfg.scale===s.id,'#3498db')}display:flex;gap:10px;align-items:center;">
        <div style="font-size:22px;min-width:32px;text-align:center;">${s.icon}</div>
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:bold;color:${cfg.scale===s.id?'#3498db':'#e2e8f0'};">${s.label}</div>
          <div style="font-size:11px;color:#94a3b8;">${s.desc}</div>
        </div>
      </div>`;
    }).join("");
    return `<div style="padding:14px;">
      <div style="font-size:13px;font-weight:bold;color:#f1c40f;margin-bottom:10px;">📐 Bước 2: Chọn Quy Mô Thế Giới</div>
      ${cards}
    </div>`;
  }

  // ─── RENDER STEP 3: QUANTITIES ──────────────────────────────────────────────
  function renderStep3() {
    const cfg = window.worldWizardData.config;
    function slider(id, label, val, min, max, icon) {
      return `<div style="margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <label style="font-size:12px;color:#94a3b8;">${icon} ${label}</label>
          <span id="wcw62-${id}-val" style="font-size:12px;color:#f1c40f;font-weight:bold;">${val}</span>
        </div>
        <input type="range" min="${min}" max="${max}" value="${val}"
          oninput="window.worldWizardData.config.${id}=parseInt(this.value);document.getElementById('wcw62-${id}-val').textContent=this.value"
          style="width:100%;accent-color:#f1c40f;cursor:pointer;"/>
        <div style="display:flex;justify-content:space-between;font-size:9px;color:#475569;margin-top:2px;">
          <span>${min}</span><span>${max}</span>
        </div>
      </div>`;
    }
    return `<div style="padding:14px;">
      <div style="font-size:13px;font-weight:bold;color:#f1c40f;margin-bottom:10px;">🔢 Bước 3: Cấu Hình Số Lượng</div>
      <div style="background:#0d1b2a;border:1px solid #1e293b;border-radius:8px;padding:12px;">
        ${slider("raceCount",    "Chủng Tộc",  cfg.raceCount,    1,  8,  "🧬")}
        ${slider("countryCount", "Quốc Gia",   cfg.countryCount, 2, 10,  "🏳️")}
        ${slider("religionCount","Tôn Giáo",   cfg.religionCount,1,  5,  "⛩️")}
        ${slider("cityCount",    "Thành Phố",  cfg.cityCount,    5, 20,  "🏙️")}
      </div>
    </div>`;
  }

  // ─── RENDER STEP 4: CHAOS ───────────────────────────────────────────────────
  function renderStep4() {
    const cfg = window.worldWizardData.config;
    const cards = CHAOS_OPTIONS.map(function(c) {
      return `<div onclick="wcw62SelectChaos('${c.id}')"
        style="${selectedStyle(cfg.chaos===c.id, c.color)}display:flex;gap:10px;align-items:center;">
        <div style="font-size:22px;min-width:32px;text-align:center;">${c.icon}</div>
        <div>
          <div style="font-size:13px;font-weight:bold;color:${cfg.chaos===c.id?c.color:'#e2e8f0'};">${c.label}</div>
          <div style="font-size:11px;color:#94a3b8;">${c.desc}</div>
        </div>
      </div>`;
    }).join("");
    return `<div style="padding:14px;">
      <div style="font-size:13px;font-weight:bold;color:#f1c40f;margin-bottom:10px;">⚡ Bước 4: Chọn Độ Hỗn Loạn</div>
      ${cards}
    </div>`;
  }

  // ─── RENDER STEP 5: PREVIEW & CREATE ────────────────────────────────────────
  function renderStep5() {
    const cfg  = window.worldWizardData.config;
    const wt   = WORLD_TYPES.find(function(w){ return w.template===cfg.templateKey; }) || WORLD_TYPES[0];
    const sc   = SCALE_OPTIONS.find(function(s){ return s.id===cfg.scale; }) || SCALE_OPTIONS[2];
    const ch   = CHAOS_OPTIONS.find(function(c){ return c.id===cfg.chaos; }) || CHAOS_OPTIONS[1];
    const name = cfg.worldName || "Vô Danh";

    // Jarvis prediction
    let difficulty = "Bình Thường";
    let diffColor  = "#3498db";
    if (cfg.chaos === "extreme") { difficulty = "Cực Khó 💀"; diffColor = "#e74c3c"; }
    else if (cfg.chaos === "chaotic" || cfg.scale === "massive") { difficulty = "Khó 🔥"; diffColor = "#e67e22"; }
    else if (cfg.chaos === "peaceful" && cfg.scale === "tiny") { difficulty = "Dễ 🌱"; diffColor = "#2ecc71"; }

    // Preview DNA preview (not final)
    const previewDna = "CGV6-" + (wt.template.slice(0,2).toUpperCase()) + "-" + sc.id.charAt(0).toUpperCase() + ch.id.charAt(0).toUpperCase() + "-R" + String(cfg.raceCount).padStart(2,"0") + "N" + String(cfg.countryCount).padStart(2,"0") + "-????????";

    return `<div style="padding:14px;">
      <div style="font-size:13px;font-weight:bold;color:#f1c40f;margin-bottom:10px;">✨ Bước 5: Xác Nhận & Tạo Thế Giới</div>

      <div style="background:linear-gradient(135deg,#0d1b2a,#0a1628);border:2px solid #f1c40f33;border-radius:12px;padding:14px;margin-bottom:10px;">
        <div style="font-size:18px;font-weight:bold;color:#f1c40f;margin-bottom:10px;text-align:center;">🌍 ${name}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div style="background:#0d1b2a;border-radius:6px;padding:8px;border:1px solid #1e293b;">
            <div style="font-size:9px;color:#64748b;">THỂ LOẠI</div>
            <div style="font-size:12px;color:${wt.color};">${wt.icon} ${wt.label}</div>
          </div>
          <div style="background:#0d1b2a;border-radius:6px;padding:8px;border:1px solid #1e293b;">
            <div style="font-size:9px;color:#64748b;">QUY MÔ</div>
            <div style="font-size:12px;color:#3498db;">${sc.icon} ${sc.label}</div>
          </div>
          <div style="background:#0d1b2a;border-radius:6px;padding:8px;border:1px solid #1e293b;">
            <div style="font-size:9px;color:#64748b;">CHỦNG TỘC / QUỐC GIA</div>
            <div style="font-size:12px;color:#2ecc71;">🧬 ${cfg.raceCount} / 🏳️ ${cfg.countryCount}</div>
          </div>
          <div style="background:#0d1b2a;border-radius:6px;padding:8px;border:1px solid #1e293b;">
            <div style="font-size:9px;color:#64748b;">HỖN LOẠN</div>
            <div style="font-size:12px;color:${ch.color};">${ch.icon} ${ch.label}</div>
          </div>
          <div style="background:#0d1b2a;border-radius:6px;padding:8px;border:1px solid #1e293b;">
            <div style="font-size:9px;color:#64748b;">DÂN SỐ BAN ĐẦU</div>
            <div style="font-size:12px;color:#e67e22;">👤 ${sc.npc} NPC · 🗺️ ${sc.tc} lãnh địa</div>
          </div>
          <div style="background:#0d1b2a;border-radius:6px;padding:8px;border:1px solid #1e293b;">
            <div style="font-size:9px;color:#64748b;">ĐỘ KHÓ DỰ ĐOÁN</div>
            <div style="font-size:12px;color:${diffColor};">${difficulty}</div>
          </div>
        </div>
      </div>

      <div style="background:#0d1b2a;border:1px solid #f1c40f22;border-radius:8px;padding:10px;margin-bottom:10px;">
        <div style="font-size:9px;color:#64748b;margin-bottom:3px;">WORLD DNA PREVIEW</div>
        <div style="font-size:12px;color:#f1c40f;font-family:'Courier New',monospace;letter-spacing:2px;">${previewDna}</div>
        <div style="font-size:10px;color:#475569;margin-top:3px;">DNA thực tế sẽ được sinh ra khi tạo thế giới</div>
      </div>

      <div style="background:#0d1b2a;border:1px solid #9b59b644;border-radius:8px;padding:10px;margin-bottom:12px;">
        <div style="font-size:10px;color:#9b59b6;margin-bottom:3px;">🤖 JARVIS NHẬN XÉT</div>
        <div style="font-size:11px;color:#94a3b8;line-height:1.5;">
          Thế giới ${name} sẽ có ${sc.npc} sinh linh đầu tiên trên ${sc.tc} lãnh địa.
          Với độ hỗn loạn ${ch.label}, ${cfg.chaos === 'extreme' ? 'xung đột sẽ bùng phát ngay từ những năm đầu.' : cfg.chaos === 'chaotic' ? 'thế giới sẽ sinh động và đầy biến cố.' : cfg.chaos === 'peaceful' ? 'thế giới sẽ phát triển ổn định và thịnh vượng.' : 'thế giới sẽ cân bằng giữa hòa bình và xung đột.'}
          Origin Story và World DNA duy nhất sẽ được tự động tạo ra.
        </div>
      </div>

      <button onclick="wcw62Create()"
        style="width:100%;padding:14px;background:linear-gradient(135deg,#1e40af,#7c3aed);border:none;border-radius:10px;color:white;font-size:15px;font-weight:bold;cursor:pointer;font-family:'Noto Serif SC',serif;letter-spacing:1px;transition:all 0.3s;"
        onmouseover="this.style.transform='scale(1.02)';this.style.boxShadow='0 0 20px #7c3aed66'"
        onmouseout="this.style.transform='scale(1)';this.style.boxShadow='none'">
        ✨ KHAI SINH THẾ GIỚI
      </button>
    </div>`;
  }

  // ─── RENDER WIZARD ───────────────────────────────────────────────────────────
  function renderWizard() {
    const step = window.worldWizardData.step;
    const tip  = JARVIS_TIPS[step - 1] || "";

    const steps = ["1","2","3","4","5"];
    const stepBar = steps.map(function(s,i) {
      const n = i + 1;
      const active = n === step;
      const done   = n < step;
      const color  = done ? "#2ecc71" : active ? "#f1c40f" : "#1e293b";
      const tcolor = done || active ? "#fff" : "#475569";
      return `<div style="display:flex;flex-direction:column;align-items:center;flex:1;">
        <div style="width:26px;height:26px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;color:${tcolor};">${done ? "✓" : s}</div>
        ${i < 4 ? '<div style="height:2px;width:100%;background:' + (done?'#2ecc71':'#1e293b') + ';margin-top:12px;"></div>' : ''}
      </div>`;
    }).join("");

    let content = "";
    if (step === 1) content = renderStep1();
    else if (step === 2) content = renderStep2();
    else if (step === 3) content = renderStep3();
    else if (step === 4) content = renderStep4();
    else content = renderStep5();

    const hasPrev = step > 1;
    const hasNext = step < 5;

    return `<div id="wcw62-wizard" style="background:#070d1a;border-top:2px solid #f1c40f33;font-family:'Noto Serif SC',serif;">
      <div style="padding:10px 14px;background:#0d1b2a;border-bottom:1px solid #1e293b;">
        <div style="font-size:12px;color:#f1c40f;font-weight:bold;margin-bottom:8px;">🌐 WORLD CREATION WIZARD</div>
        <div style="display:flex;align-items:center;gap:0;">${stepBar}</div>
      </div>

      <div style="min-height:320px;max-height:420px;overflow-y:auto;">${content}</div>

      <div style="background:#0d1b2a;border-top:1px solid #1e293b;padding:8px 14px;display:flex;flex-direction:column;gap:6px;">
        <div style="background:#0a1020;border-radius:6px;padding:8px;border-left:2px solid #9b59b6;">
          <span style="font-size:10px;color:#9b59b6;font-weight:bold;">🤖 Jarvis: </span>
          <span style="font-size:10px;color:#94a3b8;">${tip}</span>
        </div>
        <div style="display:flex;gap:8px;">
          ${hasPrev ? '<button onclick="wcw62SetStep(' + (step-1) + ')" style="flex:1;padding:8px;background:#1e293b;border:none;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:12px;font-family:\'Noto Serif SC\',serif;">← Quay Lại</button>' : '<div style="flex:1;"></div>'}
          ${hasNext ? '<button onclick="wcw62NextStep()" style="flex:2;padding:8px;background:#1e40af;border:none;border-radius:6px;color:white;cursor:pointer;font-size:12px;font-weight:bold;font-family:\'Noto Serif SC\',serif;">Tiếp Theo →</button>' : ''}
        </div>
      </div>
    </div>`;
  }

  // ─── RENDER PREVIEW TAB ──────────────────────────────────────────────────────
  function renderPreviewTab() {
    const lc = window.worldWizardData.lastCreated;
    if (!lc) {
      return `<div style="padding:24px;text-align:center;color:#64748b;">
        <div style="font-size:48px;margin-bottom:12px;">👁️</div>
        <div style="font-size:14px;color:#94a3b8;">Chưa có thế giới nào được tạo.</div>
        <div style="font-size:12px;color:#475569;margin-top:8px;">Dùng World Creation Wizard để tạo thế giới đầu tiên của bạn.</div>
      </div>`;
    }
    const yr   = typeof window.year !== "undefined" ? window.year : "—";
    const pop  = typeof window.npcs !== "undefined" ? window.npcs.filter(function(n){return n.status==="alive";}).length : 0;
    const wars = typeof window.warsActive !== "undefined" ? (window.warsActive||[]).length : 0;
    const dna  = (window.worldDNAData && window.worldDNAData.dna) || "—";
    const hero = (window.originStoryData && window.originStoryData.firstHero) ? window.originStoryData.firstHero.name + " — " + window.originStoryData.firstHero.title : "—";
    const myth = (window.originStoryData && window.originStoryData.mythology) ? window.originStoryData.mythology.title : "—";
    const creator = (window.worldDNAData && window.worldDNAData.creatorTitle) || "World Founder";

    return `<div style="padding:14px;font-family:'Noto Serif SC',serif;">
      <div style="background:linear-gradient(135deg,#0d1b2a,#0a1628);border:2px solid #2ecc7133;border-radius:12px;padding:16px;margin-bottom:12px;text-align:center;">
        <div style="font-size:32px;margin-bottom:6px;">🌍</div>
        <div style="font-size:18px;font-weight:bold;color:#f1c40f;">${lc.worldName || window.world?.name || "Vô Danh"}</div>
        <div style="font-size:11px;color:#64748b;margin-top:4px;">${lc.genre || ""} · Tạo: ${lc.createdAt ? new Date(lc.createdAt).toLocaleDateString("vi-VN") : "—"}</div>
        <div style="font-size:11px;color:#9b59b6;margin-top:4px;">Creator: ${creator}</div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
        <div style="background:#0d1b2a;border:1px solid #1e293b;border-radius:8px;padding:10px;text-align:center;">
          <div style="font-size:20px;color:#2ecc71;font-weight:bold;">${pop}</div>
          <div style="font-size:10px;color:#64748b;">Dân Số Sống</div>
        </div>
        <div style="background:#0d1b2a;border:1px solid #1e293b;border-radius:8px;padding:10px;text-align:center;">
          <div style="font-size:20px;color:#f1c40f;font-weight:bold;">${yr}</div>
          <div style="font-size:10px;color:#64748b;">Năm Hiện Tại</div>
        </div>
        <div style="background:#0d1b2a;border:1px solid #1e293b;border-radius:8px;padding:10px;text-align:center;">
          <div style="font-size:20px;color:#e74c3c;font-weight:bold;">${wars}</div>
          <div style="font-size:10px;color:#64748b;">Chiến Tranh</div>
        </div>
        <div style="background:#0d1b2a;border:1px solid #1e293b;border-radius:8px;padding:10px;text-align:center;">
          <div style="font-size:20px;color:#3498db;font-weight:bold;">${lc.scale || "—"}</div>
          <div style="font-size:10px;color:#64748b;">Quy Mô</div>
        </div>
      </div>

      <div style="background:#0d1b2a;border:1px solid #1e293b;border-radius:8px;padding:10px;margin-bottom:8px;">
        <div style="font-size:10px;color:#64748b;margin-bottom:4px;">WORLD DNA</div>
        <div style="font-size:12px;color:#f1c40f;font-family:'Courier New',monospace;">${dna}</div>
      </div>
      <div style="background:#0d1b2a;border:1px solid #1e293b;border-radius:8px;padding:10px;margin-bottom:8px;">
        <div style="font-size:10px;color:#64748b;margin-bottom:4px;">ANH HÙNG KHAI THIÊN</div>
        <div style="font-size:12px;color:#2ecc71;">⭐ ${hero}</div>
      </div>
      <div style="background:#0d1b2a;border:1px solid #1e293b;border-radius:8px;padding:10px;">
        <div style="font-size:10px;color:#64748b;margin-bottom:4px;">THẦN THOẠI</div>
        <div style="font-size:12px;color:#9b59b6;">📖 ${myth}</div>
      </div>
    </div>`;
  }

  // ─── RENDER FULL PANEL ───────────────────────────────────────────────────────
  const W62_TABS = [
    { id:"create",      label:"🌐 Tạo Thế Giới" },
    { id:"dna",         label:"🧬 World DNA"     },
    { id:"origin",      label:"📖 Origin Story"  },
    { id:"preview",     label:"👁️ Preview"       }
  ];

  window._wcw62ActiveTab = "create";

  function renderW62Panel() {
    const activeTab = window._wcw62ActiveTab;
    const tabBtns = W62_TABS.map(function(t) {
      const active = t.id === activeTab;
      return `<button onclick="wcw62ShowTab('${t.id}')"
        style="padding:6px 10px;border:none;background:${active?'#f1c40f':'#1a2a3a'};color:${active?'#000':'#aaa'};border-radius:5px;cursor:pointer;font-size:11px;white-space:nowrap;${active?'font-weight:bold;':''};font-family:'Noto Serif SC',serif;">
        ${t.label}
      </button>`;
    }).join("");

    let content = "";
    if      (activeTab === "create")  content = renderWizard();
    else if (activeTab === "dna")     content = typeof window.wdna62RenderPanel === "function" ? window.wdna62RenderPanel() : "<div style='padding:14px;color:#64748b;'>Đang tải DNA Engine...</div>";
    else if (activeTab === "origin")  content = typeof window.ose62RenderPanel  === "function" ? window.ose62RenderPanel()  : "<div style='padding:14px;color:#64748b;'>Đang tải Origin Story...</div>";
    else if (activeTab === "preview") content = renderPreviewTab();

    return `<div id="wcw62-hub" style="background:#070d1a;color:#eee;font-family:'Noto Serif SC',serif;">
      <div style="background:#0d1b2a;padding:8px 12px;border-bottom:2px solid #f1c40f33;display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
        <span style="color:#f1c40f;font-weight:bold;font-size:13px;margin-right:4px;">✨ V62</span>
        ${tabBtns}
      </div>
      <div id="wcw62-tab-content">${content}</div>
    </div>`;
  }

  // ─── PUBLIC API ──────────────────────────────────────────────────────────────
  window.wcw62ShowTab = function(tabId) {
    window._wcw62ActiveTab = tabId;
    const el = document.getElementById("wcw62-hub");
    if (el) {
      const contentEl = document.getElementById("wcw62-tab-content");
      if (contentEl) {
        let c = "";
        if      (tabId === "create")  c = renderWizard();
        else if (tabId === "dna")     c = typeof window.wdna62RenderPanel === "function" ? window.wdna62RenderPanel() : "";
        else if (tabId === "origin")  c = typeof window.ose62RenderPanel  === "function" ? window.ose62RenderPanel()  : "";
        else if (tabId === "preview") c = renderPreviewTab();
        contentEl.innerHTML = c;
        const tabContainer = el.querySelector("div:first-child");
        if (tabContainer) {
          tabContainer.querySelectorAll("button").forEach(function(b) {
            const isActive = b.textContent.trim().includes(W62_TABS.find(function(t){return t.id===tabId;})?.label?.trim()||"XXXX");
            b.style.background = isActive ? "#f1c40f" : "#1a2a3a";
            b.style.color = isActive ? "#000" : "#aaa";
            b.style.fontWeight = isActive ? "bold" : "normal";
          });
        }
      }
    }
  };

  window.wcw62SetStep = function(n) {
    window.worldWizardData.step = Math.max(1, Math.min(5, n));
    const el = document.getElementById("wcw62-tab-content");
    if (el) el.innerHTML = renderWizard();
  };

  window.wcw62NextStep = function() {
    const s = window.worldWizardData;
    if (s.step === 1 && !s.config.worldName.trim()) {
      if (typeof window.toast === "function") window.toast("⚠️ Hãy nhập tên thế giới trước!");
      const inp = document.getElementById("wcw62-world-name");
      if (inp) inp.focus();
      return;
    }
    s.step = Math.min(5, s.step + 1);
    const el = document.getElementById("wcw62-tab-content");
    if (el) el.innerHTML = renderWizard();
  };

  window.wcw62SelectType = function(templateKey, genre) {
    window.worldWizardData.config.templateKey = templateKey;
    window.worldWizardData.config.genre = genre;
    const el = document.getElementById("wcw62-tab-content");
    if (el) el.innerHTML = renderWizard();
  };

  window.wcw62SelectScale = function(scale) {
    window.worldWizardData.config.scale = scale;
    const el = document.getElementById("wcw62-tab-content");
    if (el) el.innerHTML = renderWizard();
  };

  window.wcw62SelectChaos = function(chaos) {
    window.worldWizardData.config.chaos = chaos;
    const el = document.getElementById("wcw62-tab-content");
    if (el) el.innerHTML = renderWizard();
  };

  // ─── MAIN CREATE FUNCTION ────────────────────────────────────────────────────
  window.wcw62Create = function() {
    const cfg = window.worldWizardData.config;
    if (!cfg.worldName.trim()) {
      if (typeof window.toast === "function") window.toast("⚠️ Cần có tên thế giới!");
      return;
    }
    if (window.worldWizardData.creating) return;
    window.worldWizardData.creating = true;

    // Show cinematic creating message
    const contentEl = document.getElementById("wcw62-tab-content");
    if (contentEl) {
      contentEl.innerHTML = `<div style="padding:40px;text-align:center;">
        <div style="font-size:48px;margin-bottom:16px;animation:pulse 1s infinite;">🌌</div>
        <div style="font-size:16px;color:#f1c40f;font-weight:bold;margin-bottom:8px;">Thế Giới Đang Khai Sinh...</div>
        <div id="wcw62-create-status" style="font-size:12px;color:#94a3b8;">Khởi tạo vũ trụ...</div>
        <div style="margin-top:16px;background:#0d1b2a;border-radius:8px;height:8px;overflow:hidden;">
          <div id="wcw62-progress" style="height:100%;background:linear-gradient(90deg,#f1c40f,#7c3aed);border-radius:8px;width:10%;transition:width 0.3s;"></div>
        </div>
      </div>`;
    }

    // Get scale params
    const sc = SCALE_OPTIONS.find(function(s){ return s.id===cfg.scale; }) || SCALE_OPTIONS[2];

    function setStatus(msg, pct) {
      const st = document.getElementById("wcw62-create-status");
      const pr = document.getElementById("wcw62-progress");
      if (st) st.textContent = msg;
      if (pr) pr.style.width = pct + "%";
    }

    // Step 1: Set DOM values for createWorld()
    setTimeout(function() {
      setStatus("Cấu hình thế giới...", 20);

      const nameEl = document.getElementById("worldName");
      if (nameEl) nameEl.value = cfg.worldName;

      const genreEl = document.getElementById("genre");
      if (genreEl) {
        for (let i = 0; i < genreEl.options.length; i++) {
          if (genreEl.options[i].value.toLowerCase().indexOf(cfg.genre) !== -1 ||
              genreEl.options[i].value.toLowerCase() === cfg.genre) {
            genreEl.selectedIndex = i; break;
          }
        }
        // If no match, keep as is
        genreEl.value = cfg.genre;
      }

      let tkEl = document.getElementById("worldTemplateKey");
      if (!tkEl) {
        tkEl = document.createElement("input");
        tkEl.id = "worldTemplateKey"; tkEl.type = "hidden";
        document.body.appendChild(tkEl);
      }
      tkEl.value = cfg.templateKey;

      let tcEl = document.getElementById("territoryCount");
      if (!tcEl) {
        tcEl = document.createElement("input");
        tcEl.id = "territoryCount"; tcEl.type = "hidden";
        document.body.appendChild(tcEl);
      }
      tcEl.value = sc.tc;

    }, 200);

    // Step 2: Create world
    setTimeout(function() {
      setStatus("Khai sinh thiên địa...", 40);
      try {
        if (typeof window.createWorld === "function") {
          window.createWorld();
        }
      } catch(e) {
        console.warn("[WorldCreationWizard V62] createWorld error:", e);
      }
    }, 600);

    // Step 3: Generate NPCs
    setTimeout(function() {
      setStatus("Tạo sinh linh đầu tiên (" + sc.npc + " NPC)...", 60);
      try {
        // Set NPC count
        let npcEl = document.getElementById("npcCount");
        if (!npcEl) {
          npcEl = document.createElement("input");
          npcEl.id = "npcCount"; npcEl.type = "hidden";
          document.body.appendChild(npcEl);
        }
        npcEl.value = sc.npc;
        if (typeof window.generateNPCs === "function") {
          window.generateNPCs(false);
          // Add a few geniuses (set count=1 each time)
          const geniusCount = Math.max(1, Math.floor(sc.npc * 0.1));
          npcEl.value = 1;
          for (let g = 0; g < geniusCount; g++) {
            window.generateNPCs(true);
          }
        }
      } catch(e) {
        console.warn("[WorldCreationWizard V62] generateNPCs error:", e);
      }
    }, 1000);

    // Step 4: Generate DNA
    setTimeout(function() {
      setStatus("Sinh tạo World DNA...", 75);
      try {
        if (typeof window.wdna62GenerateDNA === "function") {
          window.wdna62GenerateDNA(cfg);
        }
      } catch(e) {
        console.warn("[WorldCreationWizard V62] DNA error:", e);
      }
    }, 1400);

    // Step 5: Generate Origin Story
    setTimeout(function() {
      setStatus("Viết thần thoại khai thiên...", 88);
      try {
        if (typeof window.ose62GenerateOriginStory === "function") {
          window.ose62GenerateOriginStory(cfg);
        }
      } catch(e) {
        console.warn("[WorldCreationWizard V62] Origin story error:", e);
      }
    }, 1800);

    // Step 6: Apply chaos modifiers
    setTimeout(function() {
      setStatus("Áp dụng luật tắc thế giới...", 95);
      try {
        _applyChaosModifiers(cfg.chaos);
      } catch(e) {}
    }, 2100);

    // Step 7: Done — save and show result
    setTimeout(function() {
      setStatus("✅ Thế giới đã khai sinh!", 100);

      const dnaResult = window.worldDNAData || {};
      window.worldWizardData.lastCreated = {
        worldName: cfg.worldName,
        genre: cfg.genre,
        templateKey: cfg.templateKey,
        scale: cfg.scale,
        chaos: cfg.chaos,
        dna: dnaResult.dna,
        worldId: dnaResult.worldId,
        creatorTitle: dnaResult.creatorTitle,
        createdAt: new Date().toISOString()
      };

      window.worldWizardData.creating = false;
      window.worldWizardData.step = 1;
      save();

      if (typeof window.toast === "function") {
        window.toast("✨ Thế Giới " + cfg.worldName + " đã khai sinh! DNA: " + (dnaResult.dna||"—"));
      }

      if (typeof window.addLog === "function") {
        window.addLog("✨ [World Creation Wizard] Thế Giới " + cfg.worldName + " khai sinh! " + (dnaResult.dna||""), "important");
        window.addLog("👑 Creator Title: " + (dnaResult.creatorTitle||"World Founder"), "important");
      }

      // Switch to Preview tab to show result
      setTimeout(function() { window.wcw62ShowTab("preview"); }, 400);

    }, 2600);
  };

  // ─── APPLY CHAOS MODIFIERS ───────────────────────────────────────────────────
  function _applyChaosModifiers(chaos) {
    if (!window.world || !window.countries) return;
    const mod = { peaceful: 0.3, balanced: 0.5, chaotic: 0.7, extreme: 1.0 }[chaos] || 0.5;

    // Adjust country stability
    (window.countries || []).forEach(function(c) {
      if (chaos === "peaceful") {
        c.relations = c.relations || {};
        c.stability = Math.min(100, (c.stability||50) + 30);
      } else if (chaos === "extreme") {
        c.stability = Math.max(10, (c.stability||50) - 30);
        // Trigger some wars
        if (Math.random() < 0.4 && window.warsActive && typeof window.startWar === "function") {
          // Let existing war engine handle it naturally
        }
      }
    });

    // Set disaster frequency hint via world property
    window.world._chaosLevel = chaos;
    window.world._chaosModifier = mod;
  }

  // ─── HUB PATCH ───────────────────────────────────────────────────────────────
  function init() {
    load();
    const _orig = window.hubRenderPanel;
    window.hubRenderPanel = function(panelId) {
      if (_orig) _orig(panelId);
      if (panelId === "creator-hub-v32") {
        setTimeout(function() {
          const panelEl = document.getElementById("panel-creator-hub-v32");
          if (!panelEl) return;
          let wrapper = document.getElementById(WRAPPER_ID);
          if (!wrapper) {
            wrapper = document.createElement("div");
            wrapper.id = WRAPPER_ID;
            wrapper.style.cssText = "margin-top:8px;border-top:2px solid #f1c40f33;";
            panelEl.appendChild(wrapper);
          }
          wrapper.innerHTML = renderW62Panel();
        }, 100);
      }
    };
    console.log("[WorldCreationWizard V62] ✨ World Creation Wizard — 5 bước · 4 tabs (Tạo Thế Giới/World DNA/Origin Story/Preview) trong creator-hub-v32 · Khởi động thành công.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 12400); });
  } else {
    setTimeout(init, 12400);
  }

})();
