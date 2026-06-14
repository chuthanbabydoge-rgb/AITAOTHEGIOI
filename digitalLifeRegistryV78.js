(function() {
  "use strict";

  var currentTab = "digital-life";
  var selectedNPC = null;

  /* ── Tab Switcher ─────────────────────────────── */
  window.dlr78ShowTab = function(tab) {
    currentTab = tab;
    ["digital-life","personalities","ideologies","consciousness","life-stories"].forEach(function(t) {
      var el = document.getElementById("dlr78-tab-" + t);
      var btn = document.getElementById("dlr78-btn-" + t);
      if (el) el.style.display = (t === tab) ? "block" : "none";
      if (btn) btn.classList.toggle("active-tab", t === tab);
    });
    if (tab === "digital-life") renderDigitalLife();
    if (tab === "personalities") renderPersonalities();
    if (tab === "ideologies") renderIdeologies();
    if (tab === "consciousness") renderConsciousness();
    if (tab === "life-stories") renderLifeStories();
  };

  window.dlr78SelectNPC = function(name) {
    selectedNPC = name;
    renderConsciousness();
    dlr78ShowTab("consciousness");
  };

  /* ── Inject Main Section ──────────────────────── */
  function renderSection() {
    var panel = document.getElementById("panel-creator-hub-v32");
    if (!panel) return;
    if (document.getElementById("dlr78-section-wrapper")) {
      if (currentTab === "digital-life") renderDigitalLife();
      return;
    }

    var wrapper = document.createElement("div");
    wrapper.id = "dlr78-section-wrapper";
    wrapper.style.cssText = "margin-top:18px;border-top:2px solid #27ae60;padding-top:12px;";
    wrapper.innerHTML = [
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">',
      '  <span style="font-size:1.3em;">🧬</span>',
      '  <span style="color:#27ae60;font-weight:bold;font-size:1.05em;letter-spacing:1px;">V78 — DIGITAL LIFE PASS</span>',
      '  <span style="color:#888;font-size:0.78em;">NPC có đời sống tinh thần</span>',
      '</div>',
      '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px;">',
      '  <button id="dlr78-btn-digital-life"  onclick="dlr78ShowTab(\'digital-life\')"  class="active-tab" style="padding:5px 10px;border:1px solid #27ae60;border-radius:4px;cursor:pointer;background:#1a1a2e;color:#27ae60;font-size:0.82em;">🧬 Digital Life</button>',
      '  <button id="dlr78-btn-personalities" onclick="dlr78ShowTab(\'personalities\')" style="padding:5px 10px;border:1px solid #555;border-radius:4px;cursor:pointer;background:#1a1a2e;color:#aaa;font-size:0.82em;">🧠 Tính Cách</button>',
      '  <button id="dlr78-btn-ideologies"    onclick="dlr78ShowTab(\'ideologies\')"    style="padding:5px 10px;border:1px solid #555;border-radius:4px;cursor:pointer;background:#1a1a2e;color:#aaa;font-size:0.82em;">💡 Tư Tưởng</button>',
      '  <button id="dlr78-btn-consciousness" onclick="dlr78ShowTab(\'consciousness\')" style="padding:5px 10px;border:1px solid #555;border-radius:4px;cursor:pointer;background:#1a1a2e;color:#aaa;font-size:0.82em;">🧘 Ý Thức</button>',
      '  <button id="dlr78-btn-life-stories"  onclick="dlr78ShowTab(\'life-stories\')"  style="padding:5px 10px;border:1px solid #555;border-radius:4px;cursor:pointer;background:#1a1a2e;color:#aaa;font-size:0.82em;">📖 Cuộc Đời</button>',
      '</div>',
      '<div id="dlr78-tab-digital-life">' + buildDigitalLifeHTML() + '</div>',
      '<div id="dlr78-tab-personalities"  style="display:none;"></div>',
      '<div id="dlr78-tab-ideologies"     style="display:none;"></div>',
      '<div id="dlr78-tab-consciousness"  style="display:none;"></div>',
      '<div id="dlr78-tab-life-stories"   style="display:none;"></div>'
    ].join("");

    panel.appendChild(wrapper);

    var style = document.createElement("style");
    style.textContent = [
      "#dlr78-section-wrapper .active-tab{background:#27ae60!important;color:#fff!important;border-color:#27ae60!important;}",
      ".dlr78-npc-card{background:#0d1a12;border:1px solid #27ae60;border-radius:6px;padding:10px;margin-bottom:8px;cursor:pointer;transition:border-color 0.2s;}",
      ".dlr78-npc-card:hover{border-color:#2ecc71;}",
      ".dlr78-dim-bar{height:6px;border-radius:3px;margin-top:3px;}",
      ".dlr78-tag{display:inline-block;padding:2px 7px;border-radius:10px;font-size:0.72em;margin:2px;border:1px solid #444;}",
      ".dlr78-school-card{background:#1a1a0a;border:1px solid #f39c12;border-radius:5px;padding:8px;margin-bottom:6px;}",
      ".dlr78-thought-bubble{background:#0a0d1a;border-left:3px solid #3498db;padding:8px;margin-bottom:6px;border-radius:0 4px 4px 0;font-style:italic;}"
    ].join("");
    document.head.appendChild(style);
  }

  /* ── Tab 1: Digital Life ────────────────────────── */
  function buildDigitalLifeHTML() {
    var profiles = typeof window.dl78GetAll === "function" ? window.dl78GetAll() : [];
    var stats = typeof window.dl78GetStats === "function" ? window.dl78GetStats() : {};
    var html = [
      '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px;">',
      '  <button onclick="(function(){if(typeof window.dl78GetOrCreate===\'function\'&&window.npcs&&window.npcs.length>0){var n=window.npcs[Math.floor(Math.random()*Math.min(window.npcs.length,30))];if(n&&n.name)window.dl78GetOrCreate(n)}if(typeof dlr78ShowTab===\'function\')dlr78ShowTab(\'digital-life\')})()" style="padding:5px 12px;background:#27ae60;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;">🧬 Seed NPC Mới</button>',
      '  <span style="color:#888;font-size:0.8em;">Tổng: ' + (stats.total || 0) + ' Digital Lifeforms · Tổng ảnh hưởng: ' + (stats.totalInfluence || 0) + '</span>',
      '</div>'
    ];

    if (profiles.length === 0) {
      html.push('<div style="color:#888;text-align:center;padding:20px;">Chưa có Digital Lifeform. Bấm "Seed NPC Mới" hoặc chờ game tick để tự động tạo.</div>');
    } else {
      var topInfluencers = typeof window.dl78GetTopInfluencers === "function" ? window.dl78GetTopInfluencers(8) : profiles.slice(0, 8);
      html.push('<div style="color:#2ecc71;font-size:0.85em;font-weight:bold;margin-bottom:8px;">🏆 Những Lifeform Có Ảnh Hưởng Nhất</div>');
      topInfluencers.forEach(function(p) {
        html.push(
          '<div class="dlr78-npc-card" onclick="dlr78SelectNPC(\'' + p.npcName.replace(/'/g, "\\'") + '\')">',
          '  <div style="display:flex;justify-content:space-between;align-items:center;">',
          '    <span style="color:#2ecc71;font-weight:bold;font-size:0.9em;">' + p.philosophyIcon + ' ' + p.npcName + '</span>',
          '    <span style="color:#f1c40f;font-size:0.8em;">✨ Ảnh hưởng: ' + p.influenceScore + '</span>',
          '  </div>',
          '  <div style="margin-top:5px;display:flex;flex-wrap:wrap;gap:3px;">',
          '    <span class="dlr78-tag" style="border-color:#27ae60;color:#2ecc71;">' + p.philosophyLabel + '</span>',
          '    <span class="dlr78-tag" style="border-color:#3498db;color:#85c1e9;">' + p.primaryGoal.icon + ' ' + p.primaryGoal.label + '</span>',
          '    <span class="dlr78-tag" style="border-color:#9b59b6;color:#bb8fce;">' + p.coreValues[0] + '</span>',
          '    <span class="dlr78-tag" style="border-color:#666;color:#aaa;">' + p.coreValues[1] + '</span>',
          '  </div>',
          '  <div style="color:#999;font-size:0.75em;margin-top:4px;font-style:italic;">"' + p.belief + '"</div>',
          '</div>'
        );
      });
    }

    if (stats.byPhilosophy && Object.keys(stats.byPhilosophy).length > 0) {
      html.push('<div style="color:#888;font-size:0.8em;margin-top:8px;border-top:1px solid #333;padding-top:8px;">Phân bố triết học: ');
      Object.keys(stats.byPhilosophy).forEach(function(k) {
        html.push('<span class="dlr78-tag" style="border-color:#555;color:#bbb;">' + k + ': ' + stats.byPhilosophy[k] + '</span>');
      });
      html.push('</div>');
    }

    return html.join("");
  }

  function renderDigitalLife() { var el = document.getElementById("dlr78-tab-digital-life"); if (el) el.innerHTML = buildDigitalLifeHTML(); }

  /* ── Tab 2: Tính Cách ───────────────────────────── */
  function renderPersonalities() {
    var el = document.getElementById("dlr78-tab-personalities");
    if (!el) return;
    var top = typeof window.pe78GetTopEvolved === "function" ? window.pe78GetTopEvolved(10) : [];
    var dims = typeof window.PE78_DIMENSIONS !== "undefined" ? window.PE78_DIMENSIONS : [];
    var triggers = typeof window.PE78_TRIGGERS !== "undefined" ? window.PE78_TRIGGERS : [];
    var stats = typeof window.pe78GetStats === "function" ? window.pe78GetStats() : {};
    var html = [
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">',
      '  <button onclick="(function(){if(typeof window.npcs===\'undefined\'||!window.npcs.length)return;var n=window.npcs[Math.floor(Math.random()*Math.min(window.npcs.length,30))];if(!n||!n.name)return;var ts=[\'war\',\'loss\',\'victory\',\'betrayal\',\'discovery\',\'teaching\',\'disaster\',\'love\',\'injustice\',\'spiritual\'];window.pe78ApplyTrigger(n.name,ts[Math.floor(Math.random()*ts.length)],0.8+Math.random()*0.4);dlr78ShowTab(\'personalities\')})()" style="padding:5px 12px;background:#e67e22;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;">⚡ Kích Hoạt Trigger</button>',
      '  <span style="color:#888;font-size:0.8em;">Tổng NPC tiến hóa: ' + (stats.total || 0) + ' · Tổng lần biến đổi: ' + (stats.totalEvolutions || 0) + '</span>',
      '</div>',
      '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">'
    ];
    triggers.forEach(function(t) {
      html.push('<span class="dlr78-tag" style="border-color:#555;color:#ccc;cursor:default;">' + t.icon + ' ' + t.label + '</span>');
    });
    html.push('</div>');

    if (top.length === 0) {
      html.push('<div style="color:#888;text-align:center;padding:16px;">Chưa có tiến hóa tính cách. Hãy kích hoạt trigger.</div>');
    } else {
      top.forEach(function(evo) {
        html.push(
          '<div style="background:#1a0d0a;border:1px solid #e67e22;border-radius:6px;padding:10px;margin-bottom:8px;">',
          '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">',
          '    <span style="color:#e67e22;font-weight:bold;font-size:0.9em;">' + evo.npcName + (evo.dominantTrait ? ' — <span style="color:#f39c12;">' + evo.dominantTrait + '</span>' : '') + '</span>',
          '    <span style="color:#888;font-size:0.75em;">Biến đổi: ' + evo.evolutionCount + ' lần</span>',
          '  </div>',
          '  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;">'
        );
        dims.forEach(function(d) {
          var val = evo.dimensions[d.id] || 0;
          var color = val > 70 ? "#2ecc71" : val > 40 ? "#f1c40f" : "#e74c3c";
          html.push(
            '<div>',
            '  <div style="color:#999;font-size:0.72em;">' + d.icon + ' ' + d.label + '</div>',
            '  <div style="height:5px;background:#222;border-radius:3px;"><div style="width:' + val + '%;height:100%;background:' + color + ';border-radius:3px;"></div></div>',
            '  <div style="color:' + color + ';font-size:0.7em;text-align:right;">' + val + '</div>',
            '</div>'
          );
        });
        html.push('  </div>');
        if (evo.history && evo.history.length > 0) {
          html.push('<div style="margin-top:5px;color:#888;font-size:0.75em;">Gần nhất: ' + evo.history[0].icon + ' ' + evo.history[0].trigger + ' (Năm ' + evo.history[0].year + ')</div>');
        }
        html.push('</div>');
      });
    }
    el.innerHTML = html.join("");
  }

  /* ── Tab 3: Tư Tưởng ───────────────────────────── */
  function renderIdeologies() {
    var el = document.getElementById("dlr78-tab-ideologies");
    if (!el) return;
    var stats = typeof window.ideo78GetStats === "function" ? window.ideo78GetStats() : {};
    var schools = typeof window.ideo78GetSchools === "function" ? window.ideo78GetSchools() : [];
    var movements = typeof window.ideo78GetMovements === "function" ? window.ideo78GetMovements() : [];
    var templates = typeof window.IDEO78_TEMPLATES !== "undefined" ? window.IDEO78_TEMPLATES : [];
    var html = [
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">',
      '  <button onclick="(function(){if(!window.npcs||!window.npcs.length)return;var n=window.npcs[Math.floor(Math.random()*Math.min(window.npcs.length,30))];if(n&&n.name){window.ideo78AssignToNPC(n.name);window.ideo78SpawnSchool(n.name);dlr78ShowTab(\'ideologies\')}})()" style="padding:5px 12px;background:#9b59b6;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;">💡 Spawn Học Phái</button>',
      '  <button onclick="(function(){if(!window.npcs||!window.npcs.length)return;var n=window.npcs[Math.floor(Math.random()*Math.min(window.npcs.length,30))];if(n&&n.name){var ts=[\'social\',\'political\',\'religious\',\'academic\'];window.ideo78SpawnMovement(n.name,ts[Math.floor(Math.random()*ts.length)]);dlr78ShowTab(\'ideologies\')}})()" style="padding:5px 12px;background:#e74c3c;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;">⚡ Spawn Phong Trào</button>',
      '  <span style="color:#888;font-size:0.8em;">Học phái: ' + (stats.schools || 0) + ' · Phong trào: ' + (stats.movements || 0) + '</span>',
      '</div>'
    ];

    html.push('<div style="color:#9b59b6;font-size:0.85em;font-weight:bold;margin-bottom:6px;">📚 Các Học Phái Hiện Có</div>');
    if (schools.length === 0) {
      html.push('<div style="color:#888;font-size:0.82em;padding:8px;">Chưa có học phái. Bấm "Spawn Học Phái".</div>');
    } else {
      schools.slice(-6).reverse().forEach(function(s) {
        html.push(
          '<div class="dlr78-school-card">',
          '  <div style="display:flex;justify-content:space-between;">',
          '    <span style="color:#f39c12;font-weight:bold;font-size:0.88em;">' + s.ideologyIcon + ' ' + s.name + '</span>',
          '    <span style="color:#888;font-size:0.75em;">Năm ' + s.foundedYear + '</span>',
          '  </div>',
          '  <div style="color:#ccc;font-size:0.8em;margin:3px 0;">Sáng lập: ' + s.founder + ' · ' + s.ideology + ' · ' + s.domain + '</div>',
          '  <div style="color:#888;font-size:0.75em;">' + s.doctrine + '</div>',
          '</div>'
        );
      });
    }

    html.push('<div style="color:#e74c3c;font-size:0.85em;font-weight:bold;margin:10px 0 6px;">⚡ Các Phong Trào</div>');
    if (movements.length === 0) {
      html.push('<div style="color:#888;font-size:0.82em;padding:8px;">Chưa có phong trào. Bấm "Spawn Phong Trào".</div>');
    } else {
      movements.slice(-5).reverse().forEach(function(m) {
        html.push(
          '<div style="background:#1a0a0a;border:1px solid #e74c3c;border-radius:5px;padding:8px;margin-bottom:6px;">',
          '  <span style="color:#e74c3c;font-weight:bold;font-size:0.85em;">' + m.ideologyIcon + ' ' + m.label + '</span>',
          '  <span style="color:#888;font-size:0.75em;float:right;">Năm ' + m.startYear + '</span>',
          '  <div style="color:#ccc;font-size:0.78em;margin-top:3px;">Lãnh đạo: ' + m.leader + ' · ' + m.ideology + ' · ' + m.followers + ' môn đồ</div>',
          '</div>'
        );
      });
    }

    html.push('<div style="margin-top:10px;border-top:1px solid #333;padding-top:8px;display:flex;flex-wrap:wrap;gap:3px;">');
    templates.forEach(function(t) {
      var count = stats.byIdeology ? (stats.byIdeology[t.label] || 0) : 0;
      html.push('<span class="dlr78-tag" style="border-color:#555;color:#bbb;">' + t.icon + ' ' + t.label + (count > 0 ? ': ' + count : '') + '</span>');
    });
    html.push('</div>');
    el.innerHTML = html.join("");
  }

  /* ── Tab 4: Ý Thức ──────────────────────────────── */
  function renderConsciousness() {
    var el = document.getElementById("dlr78-tab-consciousness");
    if (!el) return;
    var stats = typeof window.cs78GetStats === "function" ? window.cs78GetStats() : {};
    var innerStates = typeof window.CS78_INNER_STATES !== "undefined" ? window.CS78_INNER_STATES : [];
    var html = [
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">',
      '  <button onclick="(function(){if(!window.npcs||!window.npcs.length)return;var n=window.npcs[Math.floor(Math.random()*Math.min(window.npcs.length,30))];if(n&&n.name){window.cs78GetOrCreate(n.name);dlr78ShowTab(\'consciousness\')}})()" style="padding:5px 12px;background:#3498db;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;">🧘 Khởi Tạo Ý Thức</button>',
      '  <span style="color:#888;font-size:0.8em;">Tổng: ' + (stats.total || 0) + ' · Tự nhận thức TB: ' + (stats.avgAwareness || 0) + '/100</span>',
      '</div>'
    ];

    if (selectedNPC) {
      var state = typeof window.cs78GetState === "function" ? window.cs78GetState(selectedNPC) : null;
      if (state) {
        var voice = typeof window.cs78GenerateInnerVoice === "function" ? window.cs78GenerateInnerVoice(selectedNPC) : "";
        html.push(
          '<div style="background:#0a1020;border:2px solid #3498db;border-radius:8px;padding:12px;margin-bottom:10px;">',
          '  <div style="color:#3498db;font-weight:bold;font-size:0.95em;margin-bottom:8px;">🧘 ' + selectedNPC + ' — Nội Tâm</div>',
          '  <pre style="color:#ccc;font-size:0.82em;white-space:pre-wrap;line-height:1.7;margin:0;background:none;border:none;padding:0;">' + voice + '</pre>',
          '  <div style="margin-top:8px;">',
          '    <div style="color:#888;font-size:0.78em;margin-bottom:4px;">Mức độ tự nhận thức:</div>',
          '    <div style="height:8px;background:#222;border-radius:4px;"><div style="width:' + state.awarenessLevel + '%;height:100%;background:' + (state.awarenessLevel > 70 ? "#2ecc71" : state.awarenessLevel > 40 ? "#f1c40f" : "#e74c3c") + ';border-radius:4px;"></div></div>',
          '  </div>',
          '  <div style="margin-top:8px;">',
          '    <div style="color:#666;font-size:0.75em;margin-bottom:4px;">Nội thoại gần đây:</div>'
        );
        state.internalDialogue.slice(0, 4).forEach(function(d) {
          html.push('<div class="dlr78-thought-bubble" style="color:#aaa;font-size:0.8em;">"' + d.thought + '" <span style="color:#555;float:right;">Năm ' + d.year + '</span></div>');
        });
        html.push('  </div></div>');
      }
    }

    var allStates = typeof window.cs78GetAll === "function" ? window.cs78GetAll() : [];
    if (allStates.length > 0) {
      html.push('<div style="color:#3498db;font-size:0.85em;font-weight:bold;margin-bottom:6px;">Phân bố trạng thái nội tâm:</div>');
      html.push('<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">');
      if (stats.byInnerState) {
        Object.keys(stats.byInnerState).forEach(function(k) {
          html.push('<span class="dlr78-tag" style="border-color:#3498db;color:#85c1e9;">' + k + ': ' + stats.byInnerState[k] + '</span>');
        });
      }
      html.push('</div>');
      html.push('<div style="color:#555;font-size:0.78em;margin-bottom:6px;">Nhấn vào NPC ở tab Digital Life để xem nội tâm chi tiết.</div>');
    } else {
      html.push('<div style="color:#888;text-align:center;padding:16px;">Chưa có lớp ý thức. Bấm "Khởi Tạo Ý Thức" hoặc chọn NPC từ tab Digital Life.</div>');
    }

    el.innerHTML = html.join("");
  }

  /* ── Tab 5: Life Stories ────────────────────────── */
  function renderLifeStories() {
    var el = document.getElementById("dlr78-tab-life-stories");
    if (!el) return;
    var reflections = typeof window.sr78GetAllReflections === "function" ? window.sr78GetAllReflections() : [];
    var stats = typeof window.sr78GetStats === "function" ? window.sr78GetStats() : {};
    var html = [
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">',
      '  <button onclick="(function(){if(!window.npcs||!window.npcs.length)return;var n=window.npcs[Math.floor(Math.random()*Math.min(window.npcs.length,30))];if(!n||!n.name)return;var ts=[\'regret\',\'pride\',\'doubt\',\'resolve\',\'wonder\',\'sorrow\',\'wisdom\',\'ambition\'];window.sr78Reflect(n.name,ts[Math.floor(Math.random()*ts.length)]);dlr78ShowTab(\'life-stories\')})()" style="padding:5px 12px;background:#8e44ad;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;">🪞 Tạo Suy Ngẫm</button>',
      '  <button onclick="(function(){if(!window.npcs||!window.npcs.length)return;var n=window.npcs[Math.floor(Math.random()*Math.min(window.npcs.length,30))];if(n&&n.name){window.sr78ChangeThought(n.name,\'biến cố năm \'+(window.year||1));dlr78ShowTab(\'life-stories\')}})()" style="padding:5px 12px;background:#c0392b;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.82em;">💭 Đổi Tư Tưởng</button>',
      '  <span style="color:#888;font-size:0.8em;">Suy ngẫm: ' + (stats.totalReflections || 0) + ' · Thay đổi tư tưởng: ' + (stats.thoughtChanges || 0) + '</span>',
      '</div>'
    ];

    if (reflections.length === 0) {
      html.push('<div style="color:#888;text-align:center;padding:20px;">Chưa có suy ngẫm nào được ghi lại. Hãy tạo hoặc chờ auto-reflect.</div>');
    } else {
      reflections.forEach(function(r) {
        html.push(
          '<div style="background:#1a0a1a;border-left:3px solid #9b59b6;padding:10px;margin-bottom:8px;border-radius:0 6px 6px 0;">',
          '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">',
          '    <span style="color:#9b59b6;font-weight:bold;font-size:0.88em;">' + r.typeIcon + ' ' + r.npcName + ' — ' + r.typeLabel + '</span>',
          '    <span style="color:#666;font-size:0.75em;">Năm ' + r.year + '</span>',
          '  </div>',
          '  <div style="color:#ddd;font-style:italic;font-size:0.85em;line-height:1.5;">"' + r.selfAssessment + '"</div>',
          '  <div style="color:#777;font-size:0.75em;margin-top:4px;">' + r.context + '</div>',
          '</div>'
        );
      });
    }
    el.innerHTML = html.join("");
  }

  /* ── Init ──────────────────────────────────────── */
  function init() {
    var _orig = window.hubRenderPanel;
    window.hubRenderPanel = function(panelId) {
      if (_orig) _orig(panelId);
      if (panelId === "creator-hub-v32") {
        setTimeout(renderSection, 200);
      }
    };
    console.log("[DigitalLifeRegistryV78] 🧬 Digital Life Registry khởi động — 5 tabs (Digital Life/Tính Cách/Tư Tưởng/Ý Thức/Cuộc Đời) · inject creator-hub-v32 sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 20300); });
  } else {
    setTimeout(init, 20300);
  }
})();
