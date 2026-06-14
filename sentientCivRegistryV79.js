(function() {
  "use strict";

  var currentTab = "civ-identity";
  var selectedCiv = null;

  /* ── Tab Switcher ────────────────────────────────── */
  window.scr79ShowTab = function(tab) {
    currentTab = tab;
    ["civ-identity","culture","philosophy","academia","collective-memory"].forEach(function(t) {
      var el = document.getElementById("scr79-tab-" + t);
      var btn = document.getElementById("scr79-btn-" + t);
      if (el) el.style.display = (t === tab) ? "block" : "none";
      if (btn) btn.classList.toggle("scr79-active", t === tab);
    });
    if (tab === "civ-identity")      renderCivIdentity();
    if (tab === "culture")           renderCulture();
    if (tab === "philosophy")        renderPhilosophy();
    if (tab === "academia")          renderAcademia();
    if (tab === "collective-memory") renderCollectiveMemory();
  };

  window.scr79SelectCiv = function(name) {
    selectedCiv = name;
    scr79ShowTab("collective-memory");
  };

  /* ── Inject Section ──────────────────────────────── */
  function renderSection() {
    var panel = document.getElementById("panel-creator-hub-v32");
    if (!panel) return;
    if (document.getElementById("scr79-section-wrapper")) {
      if (currentTab === "civ-identity") renderCivIdentity();
      return;
    }

    var wrapper = document.createElement("div");
    wrapper.id = "scr79-section-wrapper";
    wrapper.style.cssText = "margin-top:18px;border-top:2px solid #8e44ad;padding-top:12px;";
    wrapper.innerHTML = [
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">',
      '  <span style="font-size:1.3em;">🏛️</span>',
      '  <span style="color:#8e44ad;font-weight:bold;font-size:1.05em;letter-spacing:1px;">V79 — SENTIENT CIVILIZATION PASS</span>',
      '  <span style="color:#888;font-size:0.78em;">Nền Văn Minh Có Linh Hồn</span>',
      '</div>',
      '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px;">',
      '  <button id="scr79-btn-civ-identity"      onclick="scr79ShowTab(\'civ-identity\')"      class="scr79-active" style="padding:5px 10px;border:1px solid #8e44ad;border-radius:4px;cursor:pointer;background:#1a1a2e;color:#8e44ad;font-size:0.82em;">🏛️ Căn Tính</button>',
      '  <button id="scr79-btn-culture"            onclick="scr79ShowTab(\'culture\')"            style="padding:5px 10px;border:1px solid #555;border-radius:4px;cursor:pointer;background:#1a1a2e;color:#aaa;font-size:0.82em;">🎨 Văn Hóa</button>',
      '  <button id="scr79-btn-philosophy"         onclick="scr79ShowTab(\'philosophy\')"         style="padding:5px 10px;border:1px solid #555;border-radius:4px;cursor:pointer;background:#1a1a2e;color:#aaa;font-size:0.82em;">💭 Triết Học</button>',
      '  <button id="scr79-btn-academia"           onclick="scr79ShowTab(\'academia\')"           style="padding:5px 10px;border:1px solid #555;border-radius:4px;cursor:pointer;background:#1a1a2e;color:#aaa;font-size:0.82em;">🎓 Học Viện</button>',
      '  <button id="scr79-btn-collective-memory"  onclick="scr79ShowTab(\'collective-memory\')"  style="padding:5px 10px;border:1px solid #555;border-radius:4px;cursor:pointer;background:#1a1a2e;color:#aaa;font-size:0.82em;">📜 Ký Ức</button>',
      '</div>',
      '<div id="scr79-tab-civ-identity">' + buildCivIdentityHTML() + '</div>',
      '<div id="scr79-tab-culture"           style="display:none;"></div>',
      '<div id="scr79-tab-philosophy"        style="display:none;"></div>',
      '<div id="scr79-tab-academia"          style="display:none;"></div>',
      '<div id="scr79-tab-collective-memory" style="display:none;"></div>'
    ].join("");
    panel.appendChild(wrapper);

    var style = document.createElement("style");
    style.textContent = [
      "#scr79-section-wrapper .scr79-active{background:#8e44ad!important;color:#fff!important;border-color:#8e44ad!important;}",
      ".scr79-civ-card{background:#0d0a1a;border:1px solid #8e44ad;border-radius:6px;padding:10px;margin-bottom:8px;cursor:pointer;transition:border-color 0.2s;}",
      ".scr79-civ-card:hover{border-color:#9b59b6;}",
      ".scr79-tag{display:inline-block;padding:2px 7px;border-radius:10px;font-size:0.72em;margin:2px;border:1px solid #444;}",
      ".scr79-mem-card{background:#0a0d1a;border-left:3px solid #3498db;padding:8px;margin-bottom:6px;border-radius:0 4px 4px 0;}",
      ".scr79-school-card{background:#1a0d0a;border:1px solid #e67e22;border-radius:5px;padding:8px;margin-bottom:6px;}",
      ".scr79-debate-card{background:#0a1a0d;border:1px solid #2ecc71;border-radius:5px;padding:8px;margin-bottom:6px;}",
      ".scr79-work-card{background:#1a1a0a;border:1px solid #f1c40f;border-radius:5px;padding:7px;margin-bottom:5px;}"
    ].join("");
    document.head.appendChild(style);
  }

  /* ── Tab 1: Căn Tính Văn Minh ──────────────────── */
  function buildCivIdentityHTML() {
    var profiles = typeof window.cce79GetAll === "function" ? window.cce79GetAll() : [];
    var stats = typeof window.cce79GetStats === "function" ? window.cce79GetStats() : {};
    var html = [
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">',
      '  <button onclick="(function(){if(!window.countries||!window.countries.length)return;window.countries.slice(0,20).forEach(function(c){if(c&&c.name&&typeof window.cce79GetOrCreate===\'function\')window.cce79GetOrCreate(c)});scr79ShowTab(\'civ-identity\')})()" style="padding:5px 12px;background:#8e44ad;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;">🏛️ Seed Văn Minh</button>',
      '  <span style="color:#888;font-size:0.8em;">Tổng: ' + (stats.total || 0) + ' văn minh · TB đoàn kết: ' + (stats.avgCohesion || 0) + '%</span>',
      '</div>'
    ];

    if (profiles.length === 0) {
      html.push('<div style="color:#888;text-align:center;padding:20px;">Chưa có dữ liệu văn minh. Bấm "Seed Văn Minh" hoặc chờ game tick.</div>');
    } else {
      profiles.forEach(function(p) {
        var tensionColor = p.ideologicalTension > 60 ? "#e74c3c" : p.ideologicalTension > 30 ? "#f1c40f" : "#2ecc71";
        html.push(
          '<div class="scr79-civ-card" onclick="scr79SelectCiv(\'' + p.name.replace(/'/g, "\\'") + '\')">',
          '  <div style="display:flex;justify-content:space-between;align-items:center;">',
          '    <span style="color:#9b59b6;font-weight:bold;font-size:0.92em;">' + p.archetype.icon + ' ' + p.name + '</span>',
          '    <span style="font-size:0.75em;color:#888;">Tuổi: ' + Math.max(0, (window.year || 1) - p.foundedYear) + ' năm</span>',
          '  </div>',
          '  <div style="display:flex;flex-wrap:wrap;gap:3px;margin:5px 0;">',
          '    <span class="scr79-tag" style="border-color:#8e44ad;color:#bb8fce;">' + p.archetype.label + '</span>',
          '    <span class="scr79-tag" style="border-color:#f39c12;color:#f1c40f;">' + p.goal.icon + ' ' + p.goal.label + '</span>',
          '    <span class="scr79-tag" style="border-color:#3498db;color:#85c1e9;">' + p.coreValues[0] + '</span>',
          '    <span class="scr79-tag" style="border-color:#555;color:#aaa;">' + (p.coreValues[1] || '') + '</span>',
          '    <span class="scr79-tag" style="border-color:#555;color:#ccc;">' + p.uniqueTraits.join(' · ') + '</span>',
          '  </div>',
          '  <div style="display:flex;gap:10px;font-size:0.78em;">',
          '    <span style="color:#ccc;">Đoàn Kết: <b style="color:' + (p.cohesion > 60 ? "#2ecc71" : p.cohesion > 30 ? "#f1c40f" : "#e74c3c") + ';">' + p.cohesion + '</b>/100</span>',
          '    <span style="color:#ccc;">Uy Tín: <b style="color:#f1c40f;">' + p.prestige + '</b></span>',
          '    <span style="color:#ccc;">Xung Đột Tư Tưởng: <b style="color:' + tensionColor + ';">' + p.ideologicalTension + '</b>/100</span>',
          '  </div>',
          '</div>'
        );
      });
    }

    if (stats.byGoal && Object.keys(stats.byGoal).length > 0) {
      html.push('<div style="color:#888;font-size:0.8em;margin-top:8px;border-top:1px solid #333;padding-top:8px;">Phân bố mục tiêu: ');
      Object.keys(stats.byGoal).forEach(function(k) {
        html.push('<span class="scr79-tag" style="border-color:#555;color:#bbb;">' + k + ': ' + stats.byGoal[k] + '</span>');
      });
      html.push('</div>');
    }
    return html.join("");
  }

  function renderCivIdentity() { var el = document.getElementById("scr79-tab-civ-identity"); if (el) el.innerHTML = buildCivIdentityHTML(); }

  /* ── Tab 2: Văn Hóa ──────────────────────────────── */
  function renderCulture() {
    var el = document.getElementById("scr79-tab-culture");
    if (!el) return;
    var stats = typeof window.cevo79GetStats === "function" ? window.cevo79GetStats() : {};
    var artStats = typeof window.cult79GetStats === "function" ? window.cult79GetStats() : {};
    var works = typeof window.cult79GetGlobalWorks === "function" ? window.cult79GetGlobalWorks(8) : [];
    var landmarks = typeof window.cult79GetLandmarks === "function" ? window.cult79GetLandmarks() : [];
    var hybridizations = typeof window.culturalEvoV79Data !== "undefined" ? window.culturalEvoV79Data.hybridizations.slice(-5).reverse() : [];
    var propagations = typeof window.culturalEvoV79Data !== "undefined" ? window.culturalEvoV79Data.propagations.slice(-6).reverse() : [];

    var html = [
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">',
      '  <button onclick="(function(){if(!window.countries||!window.countries.length)return;var c=window.countries[Math.floor(Math.random()*Math.min(window.countries.length,15))];if(c&&c.name){var styles=typeof window.CULT79_STYLES!==\'undefined\'?window.CULT79_STYLES:[];if(styles.length)window.cult79GenerateWork(c.name,styles[Math.floor(Math.random()*styles.length)].id);scr79ShowTab(\'culture\')}})()" style="padding:5px 10px;background:#e67e22;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;">🎨 Tạo Tác Phẩm</button>',
      '  <button onclick="(function(){if(!window.countries||!window.countries.length)return;var c=window.countries[Math.floor(Math.random()*Math.min(window.countries.length,15))];if(c&&c.name){var lms=typeof window.CULT79_LANDMARKS!==\'undefined\'?window.CULT79_LANDMARKS:[];if(lms.length)window.cult79BuildLandmark(c.name,lms[Math.floor(Math.random()*lms.length)].id);scr79ShowTab(\'culture\')}})()" style="padding:5px 10px;background:#3498db;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;">🏛️ Xây Công Trình</button>',
      '  <span style="color:#888;font-size:0.8em;">Tác phẩm: ' + artStats.totalWorks + ' · Công trình: ' + artStats.landmarks + ' · Lai tạo: ' + stats.hybridizations + '</span>',
      '</div>'
    ];

    if (hybridizations.length > 0) {
      html.push('<div style="color:#e67e22;font-size:0.85em;font-weight:bold;margin-bottom:6px;">🔀 Văn Hóa Lai Gần Đây</div>');
      hybridizations.forEach(function(h) {
        html.push('<div style="background:#1a0d0a;border:1px solid #e67e22;border-radius:5px;padding:7px;margin-bottom:5px;font-size:0.82em;color:#f0b27a;">',
          h.icon + ' <b>' + h.result + '</b> — ' + h.civA + ' + ' + h.civB + ' <span style="color:#888;float:right;">Năm ' + h.year + '</span>',
          '</div>');
      });
    }

    if (works.length > 0) {
      html.push('<div style="color:#f1c40f;font-size:0.85em;font-weight:bold;margin:8px 0 6px;">🎨 Tác Phẩm Nổi Bật</div>');
      works.forEach(function(w) {
        html.push('<div class="scr79-work-card"><span style="color:#f1c40f;font-size:0.85em;">' + w.styleIcon + ' <b>' + w.title + '</b></span> <span style="color:#888;font-size:0.75em;float:right;">' + w.country + ' · Năm ' + w.year + '</span><div style="color:#999;font-size:0.75em;">' + w.styleLabel + ' — Danh tiếng: ' + w.fame + '</div></div>');
      });
    }

    if (landmarks.length > 0) {
      html.push('<div style="color:#3498db;font-size:0.85em;font-weight:bold;margin:8px 0 6px;">🏛️ Công Trình Vĩ Đại</div>');
      landmarks.slice(0, 6).forEach(function(l) {
        html.push('<div style="background:#0a1020;border:1px solid #3498db;border-radius:5px;padding:7px;margin-bottom:5px;font-size:0.82em;">',
          l.icon + ' <span style="color:#85c1e9;font-weight:bold;">' + l.name + '</span> <span style="color:#888;font-size:0.75em;float:right;">Năm ' + l.builtYear + '</span>',
          '</div>');
      });
    }

    if (propagations.length > 0) {
      html.push('<div style="color:#2ecc71;font-size:0.85em;font-weight:bold;margin:8px 0 6px;">📡 Lan Truyền Tri Thức Gần Đây</div>');
      propagations.forEach(function(p) {
        html.push('<div style="color:#aaa;font-size:0.78em;padding:3px 0;">' + p.channelIcon + ' <b>' + p.from + '</b> → ' + p.to + ' (' + p.channel + ') — Năm ' + p.year + '</div>');
      });
    }

    if (works.length === 0 && landmarks.length === 0) {
      html.push('<div style="color:#888;text-align:center;padding:20px;">Chưa có tác phẩm hay công trình. Bấm "Tạo Tác Phẩm" hoặc chờ auto-generate.</div>');
    }
    el.innerHTML = html.join("");
  }

  /* ── Tab 3: Triết Học ────────────────────────────── */
  function renderPhilosophy() {
    var el = document.getElementById("scr79-tab-philosophy");
    if (!el) return;
    var stats = typeof window.phil79GetStats === "function" ? window.phil79GetStats() : {};
    var debates = typeof window.phil79GetDebates === "function" ? window.phil79GetDebates() : [];
    var conflicts = typeof window.phil79GetConflicts === "function" ? window.phil79GetConflicts() : [];
    var reforms = typeof window.phil79GetReforms === "function" ? window.phil79GetReforms() : [];
    var schools = typeof window.PHIL79_SCHOOLS !== "undefined" ? window.PHIL79_SCHOOLS : [];

    var html = [
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">',
      '  <button onclick="(function(){if(!window.countries||!window.countries.length)return;var c=window.countries[Math.floor(Math.random()*Math.min(window.countries.length,10))];if(c&&c.name){window.phil79AssignSchool(c.name);scr79ShowTab(\'philosophy\')}})()" style="padding:5px 10px;background:#9b59b6;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;">💭 Assign Triết Học</button>',
      '  <button onclick="(function(){if(!window.countries||window.countries.length<2)return;var a=window.countries[Math.floor(Math.random()*5)];var b=window.countries[Math.floor(Math.random()*5)];if(a&&b&&a.name&&b.name&&a.name!==b.name){window.phil79SpawnDebate(a.name,b.name);scr79ShowTab(\'philosophy\')}})()" style="padding:5px 10px;background:#c0392b;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;">💥 Tranh Luận</button>',
      '  <button onclick="(function(){if(!window.countries||!window.countries.length)return;var c=window.countries[Math.floor(Math.random()*Math.min(window.countries.length,10))];if(c&&c.name){window.phil79TriggerReligiousReform(c.name);scr79ShowTab(\'philosophy\')}})()" style="padding:5px 10px;background:#e67e22;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;">✨ Cải Cách Tôn Giáo</button>',
      '  <span style="color:#888;font-size:0.78em;">Trường phái: ' + stats.civSchools + ' · Tranh luận: ' + stats.debates + ' · Xung đột: ' + stats.conflicts + '</span>',
      '</div>'
    ];

    html.push('<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">');
    schools.forEach(function(s) {
      html.push('<span class="scr79-tag" style="border-color:#555;color:#ccc;">' + s.icon + ' ' + s.label + '</span>');
    });
    html.push('</div>');

    if (conflicts.length > 0) {
      html.push('<div style="color:#e74c3c;font-size:0.85em;font-weight:bold;margin-bottom:6px;">💥 Xung Đột Tư Tưởng Gần Đây</div>');
      conflicts.slice(0, 4).forEach(function(c) {
        html.push('<div class="scr79-debate-card" style="border-color:#e74c3c;background:#1a0a0a;">',
          '<span style="color:#e74c3c;font-size:0.82em;">' + c.iconA + ' ' + c.schA + ' (' + c.civA + ') <b>vs</b> ' + c.iconB + ' ' + c.schB + ' (' + c.civB + ')</span>',
          '<span style="color:#888;font-size:0.75em;float:right;">Năm ' + c.year + '</span>',
          '<div style="color:#e67e22;font-size:0.75em;margin-top:3px;">' + c.outcome + '</div>',
          '</div>');
      });
    }

    if (debates.length > 0) {
      html.push('<div style="color:#2ecc71;font-size:0.85em;font-weight:bold;margin:8px 0 6px;">🤝 Tổng Hợp Tri Thức</div>');
      debates.filter(function(d) { return !d.isConflict; }).slice(0, 3).forEach(function(d) {
        html.push('<div class="scr79-debate-card">',
          '<span style="color:#2ecc71;font-size:0.82em;">' + d.iconA + ' ' + d.schA + ' + ' + d.iconB + ' ' + d.schB + '</span>',
          '<span style="color:#888;font-size:0.75em;float:right;">Năm ' + d.year + '</span>',
          '</div>');
      });
    }

    if (reforms.length > 0) {
      html.push('<div style="color:#9b59b6;font-size:0.85em;font-weight:bold;margin:8px 0 6px;">✨ Cải Cách Tôn Giáo</div>');
      reforms.slice(0, 4).forEach(function(r) {
        html.push('<div style="background:#1a0a1a;border:1px solid #9b59b6;border-radius:5px;padding:7px;margin-bottom:5px;font-size:0.82em;">',
          '<span style="color:#bb8fce;font-weight:bold;">' + r.label + '</span> tại <span style="color:#e8daef;">' + r.country + '</span>',
          '<span style="color:#888;font-size:0.75em;float:right;">Năm ' + r.year + '</span>',
          '<div style="color:#999;font-size:0.75em;margin-top:2px;">' + r.desc + '</div>',
          '</div>');
      });
    }

    if (debates.length === 0 && reforms.length === 0) {
      html.push('<div style="color:#888;text-align:center;padding:16px;">Chưa có hoạt động triết học. Hãy assign trường phái và tạo tranh luận.</div>');
    }
    el.innerHTML = html.join("");
  }

  /* ── Tab 4: Học Viện ─────────────────────────────── */
  function renderAcademia() {
    var el = document.getElementById("scr79-tab-academia");
    if (!el) return;
    var stats = typeof window.acad79GetStats === "function" ? window.acad79GetStats() : {};
    var academies = typeof window.acad79GetAcademies === "function" ? window.acad79GetAcademies() : [];
    var scholars = typeof window.acad79GetScholars === "function" ? window.acad79GetScholars() : [];
    var types = typeof window.ACAD79_TYPES !== "undefined" ? window.ACAD79_TYPES : [];

    var html = [
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">',
      '  <button onclick="(function(){if(!window.countries||!window.countries.length)return;var c=window.countries[Math.floor(Math.random()*Math.min(window.countries.length,15))];if(!c||!c.name)return;var ts=typeof window.ACAD79_TYPES!==\'undefined\'?window.ACAD79_TYPES:[];if(ts.length){window.acad79FoundAcademy(c.name,ts[Math.floor(Math.random()*ts.length)].id);scr79ShowTab(\'academia\')}}})()" style="padding:5px 10px;background:#3498db;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;">🎓 Thành Lập Học Viện</button>',
      '  <button onclick="(function(){if(!window.countries||!window.countries.length)return;var c=window.countries[Math.floor(Math.random()*Math.min(window.countries.length,15))];if(!c||!c.name)return;var ts=typeof window.ACAD79_TYPES!==\'undefined\'?window.ACAD79_TYPES:[];if(ts.length)window.acad79SpawnScholar(c.name,ts[Math.floor(Math.random()*ts.length)].id);scr79ShowTab(\'academia\')})()" style="padding:5px 10px;background:#27ae60;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;">👨‍🏫 Triệu Học Giả</button>',
      '  <span style="color:#888;font-size:0.8em;">Học viện: ' + stats.academies + ' · Học giả: ' + stats.scholars + ' · Tổng tri thức: ' + stats.totalKnowledge + '</span>',
      '</div>'
    ];

    html.push('<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">');
    types.forEach(function(t) { html.push('<span class="scr79-tag" style="border-color:#555;color:#ccc;">' + t.icon + ' ' + t.label + '</span>'); });
    html.push('</div>');

    if (academies.length > 0) {
      html.push('<div style="color:#3498db;font-size:0.85em;font-weight:bold;margin-bottom:6px;">🏫 Học Viện Đang Hoạt Động</div>');
      academies.slice(-6).reverse().forEach(function(a) {
        html.push('<div class="scr79-school-card" style="border-color:#3498db;background:#0a1020;">',
          '<div style="color:#85c1e9;font-weight:bold;font-size:0.88em;">' + a.name + '</div>',
          '<div style="color:#ccc;font-size:0.78em;margin-top:3px;">' + a.country + ' · Năm ' + a.foundedYear + ' · Sinh viên tốt nghiệp: ' + a.graduates + '</div>',
          '<div style="color:#888;font-size:0.75em;">Đầu ra: ' + a.output + ' · Tri thức: ' + a.knowledgeOutput + '</div>',
          '</div>');
      });
    }

    if (scholars.length > 0) {
      html.push('<div style="color:#27ae60;font-size:0.85em;font-weight:bold;margin:8px 0 6px;">👨‍🏫 Học Giả Nổi Danh</div>');
      scholars.slice(-6).reverse().forEach(function(s) {
        html.push('<div style="background:#0a1a0d;border:1px solid #27ae60;border-radius:5px;padding:7px;margin-bottom:5px;">',
          '<span style="color:#2ecc71;font-weight:bold;font-size:0.85em;">' + s.specialtyIcon + ' ' + s.name + '</span>',
          '<span style="color:#888;font-size:0.75em;float:right;">' + s.country + '</span>',
          '<div style="color:#aaa;font-size:0.78em;margin-top:2px;">' + s.specialty + ' · Khám phá: ' + s.discoveries.length + ' · Ảnh hưởng: ' + s.influenceScore + '</div>',
          '</div>');
      });
    }

    if (academies.length === 0 && scholars.length === 0) {
      html.push('<div style="color:#888;text-align:center;padding:20px;">Chưa có học viện hay học giả. Bấm nút bên trên hoặc chờ auto-spawn.</div>');
    }
    el.innerHTML = html.join("");
  }

  /* ── Tab 5: Ký Ức Tập Thể ────────────────────────── */
  function renderCollectiveMemory() {
    var el = document.getElementById("scr79-tab-collective-memory");
    if (!el) return;
    var allCivs = typeof window.cmem79GetAll === "function" ? window.cmem79GetAll() : [];
    var stats = typeof window.cmem79GetStats === "function" ? window.cmem79GetStats() : {};
    var categories = typeof window.CMEM79_CATEGORIES !== "undefined" ? window.CMEM79_CATEGORIES : [];

    var html = [
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">',
      '  <button onclick="(function(){if(!window.countries||!window.countries.length)return;var c=window.countries[Math.floor(Math.random()*Math.min(window.countries.length,15))];if(!c||!c.name)return;var cats=[\'war\',\'hero\',\'discovery\',\'golden_age\',\'alliance\'];window.cmem79Record(c.name,cats[Math.floor(Math.random()*cats.length)],\'Sự kiện lịch sử năm \'+(window.year||1),\'\',2);scr79ShowTab(\'collective-memory\')})()" style="padding:5px 12px;background:#2980b9;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;">📜 Ghi Ký Ức</button>',
      '  <span style="color:#888;font-size:0.8em;">Tổng: ' + (stats.totalCountries || 0) + ' quốc gia · ' + (stats.totalMemories || 0) + ' ký ức</span>',
      '</div>'
    ];

    if (selectedCiv) {
      var mems = typeof window.cmem79GetMemories === "function" ? window.cmem79GetMemories(selectedCiv) : [];
      var summary = typeof window.cmem79GetNarrativeSummary === "function" ? window.cmem79GetNarrativeSummary(selectedCiv) : "";
      html.push(
        '<div style="background:#0a1020;border:2px solid #3498db;border-radius:8px;padding:12px;margin-bottom:10px;">',
        '  <div style="color:#3498db;font-weight:bold;font-size:0.95em;margin-bottom:8px;">📜 ' + selectedCiv + ' — Biên Niên Ký Ức</div>',
        '  <pre style="color:#ccc;font-size:0.82em;white-space:pre-wrap;line-height:1.7;margin:0;background:none;border:none;padding:0;">' + summary + '</pre>',
        '</div>'
      );
      if (mems.length > 0) {
        html.push('<div style="color:#888;font-size:0.8em;margin-bottom:6px;">Tất cả ký ức (' + mems.length + '):</div>');
        mems.slice(0, 10).forEach(function(m) {
          html.push('<div class="scr79-mem-card" style="border-color:' + m.color + ';">',
            '<div style="display:flex;justify-content:space-between;"><span style="color:' + m.color + ';font-size:0.82em;">' + m.categoryIcon + ' ' + m.title + '</span><span style="color:#666;font-size:0.73em;">Năm ' + m.year + '</span></div>',
            (m.detail ? '<div style="color:#888;font-size:0.75em;margin-top:2px;">' + m.detail + '</div>' : ''),
            '</div>');
        });
      }
      html.push('<div style="margin-top:8px;"><button onclick="selectedCiv=null;scr79ShowTab(\'collective-memory\')" style="padding:3px 10px;background:#333;color:#aaa;border:1px solid #555;border-radius:4px;cursor:pointer;font-size:0.78em;">← Quay lại</button></div>');
    } else {
      html.push('<div style="color:#888;font-size:0.8em;margin-bottom:8px;">Nhấn vào một quốc gia ở tab Căn Tính để xem ký ức chi tiết.</div>');
      html.push('<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">');
      categories.forEach(function(c) {
        html.push('<span class="scr79-tag" style="border-color:' + c.color + ';color:' + c.color + ';">' + c.icon + ' ' + c.label + '</span>');
      });
      html.push('</div>');

      if (allCivs.length === 0) {
        html.push('<div style="color:#888;text-align:center;padding:16px;">Chưa có ký ức tập thể. Bấm "Ghi Ký Ức" hoặc chờ auto-scan.</div>');
      } else {
        html.push('<div style="color:#3498db;font-size:0.85em;font-weight:bold;margin-bottom:6px;">Quốc Gia Có Ký Ức Phong Phú</div>');
        allCivs.sort(function(a, b) { return b.count - a.count; }).slice(0, 8).forEach(function(c) {
          html.push(
            '<div style="background:#0a1020;border:1px solid #2c3e50;border-radius:5px;padding:8px;margin-bottom:5px;cursor:pointer;" onclick="scr79SelectCiv(\'' + c.name.replace(/'/g, "\\'") + '\')">',
            '  <div style="display:flex;justify-content:space-between;align-items:center;">',
            '    <span style="color:#85c1e9;font-weight:bold;font-size:0.85em;">📜 ' + c.name + '</span>',
            '    <span style="color:#888;font-size:0.75em;">' + c.count + ' ký ức</span>',
            '  </div>',
            (c.latest ? '<div style="color:#aaa;font-size:0.75em;margin-top:3px;">' + c.latest.categoryIcon + ' ' + c.latest.title + '</div>' : ''),
            '</div>'
          );
        });
      }
    }
    el.innerHTML = html.join("");
  }

  /* ── Init ────────────────────────────────────────── */
  function init() {
    var _orig = window.hubRenderPanel;
    window.hubRenderPanel = function(panelId) {
      if (_orig) _orig(panelId);
      if (panelId === "creator-hub-v32") {
        setTimeout(renderSection, 300);
      }
    };
    console.log("[SentientCivRegistryV79] 🏛️ Sentient Civilization Registry khởi động — 5 tabs (Căn Tính/Văn Hóa/Triết Học/Học Viện/Ký Ức) · inject creator-hub-v32 sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 21000); });
  } else {
    setTimeout(init, 21000);
  }
})();
