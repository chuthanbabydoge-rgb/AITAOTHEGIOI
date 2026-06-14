(function() {
  "use strict";

  var currentTab = "prophecy";
  var oracleType = "world_fate";
  var customQuestion = "";

  /* ── Tab Switcher ─────────────────────────────── */
  window.pr77ShowTab = function(tab) {
    currentTab = tab;
    ["prophecy","fateweb","destiny","oracle"].forEach(function(t) {
      var el = document.getElementById("pr77-tab-" + t);
      var btn = document.getElementById("pr77-btn-" + t);
      if (el) el.style.display = (t === tab) ? "block" : "none";
      if (btn) btn.classList.toggle("active-tab", t === tab);
    });
    if (tab === "fateweb") renderFateWebCanvas();
    if (tab === "destiny") renderDestinyTab();
  };

  /* ── Render Main Section ──────────────────────── */
  function renderV77Section() {
    var panel = document.getElementById("panel-creator-hub-v32");
    if (!panel) return;
    if (document.getElementById("pr77-section-wrapper")) {
      refreshCurrentTab();
      return;
    }

    var wrapper = document.createElement("div");
    wrapper.id = "pr77-section-wrapper";
    wrapper.style.cssText = "margin-top:18px; border-top:2px solid #8e44ad; padding-top:12px;";
    wrapper.innerHTML = [
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">',
      '  <span style="font-size:1.3em;">📜</span>',
      '  <span style="color:#9b59b6;font-weight:bold;font-size:1.05em;letter-spacing:1px;">V77 — TIÊN TRI CỔ ĐẠI & VẬN MỆNH</span>',
      '</div>',
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">',
      '  <button id="pr77-btn-prophecy" onclick="pr77ShowTab(\'prophecy\')" class="active-tab" style="padding:5px 12px;border:1px solid #9b59b6;border-radius:4px;cursor:pointer;background:#1a1a2e;color:#9b59b6;font-size:0.85em;">📜 Tiên Tri</button>',
      '  <button id="pr77-btn-fateweb"  onclick="pr77ShowTab(\'fateweb\')"  style="padding:5px 12px;border:1px solid #555;border-radius:4px;cursor:pointer;background:#1a1a2e;color:#aaa;font-size:0.85em;">🕸️ Vận Mệnh</button>',
      '  <button id="pr77-btn-destiny"  onclick="pr77ShowTab(\'destiny\')"  style="padding:5px 12px;border:1px solid #555;border-radius:4px;cursor:pointer;background:#1a1a2e;color:#aaa;font-size:0.85em;">⭐ Định Mệnh</button>',
      '  <button id="pr77-btn-oracle"   onclick="pr77ShowTab(\'oracle\')"   style="padding:5px 12px;border:1px solid #555;border-radius:4px;cursor:pointer;background:#1a1a2e;color:#aaa;font-size:0.85em;">🔮 Thần Sấm</button>',
      '</div>',
      '<div id="pr77-tab-prophecy">' + buildProphecyHTML() + '</div>',
      '<div id="pr77-tab-fateweb"   style="display:none;">' + buildFateWebHTML() + '</div>',
      '<div id="pr77-tab-destiny"   style="display:none;">' + buildDestinyHTML() + '</div>',
      '<div id="pr77-tab-oracle"    style="display:none;">' + buildOracleHTML() + '</div>'
    ].join("");

    panel.appendChild(wrapper);

    var style = document.createElement("style");
    style.textContent = [
      "#pr77-section-wrapper .active-tab{background:#9b59b6!important;color:#fff!important;border-color:#9b59b6!important;}",
      "#pr77-section-wrapper button:hover{opacity:0.85;}",
      ".pr77-prophecy-card{background:#1a0a2e;border:1px solid #6c3483;border-radius:6px;padding:10px;margin-bottom:8px;}",
      ".pr77-prophecy-card.fulfilled{opacity:0.55;border-style:dashed;}",
      ".pr77-thread-item{background:#0d0d1a;border:1px solid #444;border-radius:5px;padding:8px;margin-bottom:6px;display:flex;gap:8px;align-items:center;}",
      ".pr77-score-bar{height:8px;border-radius:4px;margin-top:3px;}",
      ".pr77-oracle-entry{background:#1a1a0a;border:1px solid #8e44ad;border-radius:6px;padding:10px;margin-bottom:8px;font-style:italic;}"
    ].join("");
    document.head.appendChild(style);
  }

  /* ── Tab: Tiên Tri ──────────────────────────────── */
  function buildProphecyHTML() {
    var prophecies = typeof window.ap77GetAll === "function" ? window.ap77GetAll() : [];
    var stats = typeof window.ap77GetStats === "function" ? window.ap77GetStats() : {};
    var html = [
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">',
      '  <button onclick="(function(){if(typeof window.ap77GenerateProphecy===\'function\'){window.ap77GenerateProphecy();if(typeof window.pr77ShowTab===\'function\')window.pr77ShowTab(\'prophecy\')}})()" style="padding:5px 14px;background:#6c3483;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.85em;">✨ Tạo Tiên Tri Mới</button>',
      '  <span style="color:#888;font-size:0.82em;padding:6px;">Tổng: ' + (stats.total || 0) + ' · Đang hoạt động: ' + (stats.active || 0) + ' · Đã ứng nghiệm: ' + (stats.fulfilled || 0) + '</span>',
      '</div>'
    ];
    if (prophecies.length === 0) {
      html.push('<div style="color:#888;text-align:center;padding:20px;">Chưa có tiên tri nào. Bấm "Tạo Tiên Tri Mới" để bắt đầu.</div>');
    } else {
      var sorted = prophecies.slice().sort(function(a, b) { return b.urgency - a.urgency; });
      sorted.forEach(function(p) {
        var urgBar = Math.round(p.urgency * 10);
        html.push(
          '<div class="pr77-prophecy-card' + (p.fulfilled ? " fulfilled" : "") + '">',
          '  <div style="display:flex;justify-content:space-between;align-items:center;">',
          '    <span style="color:' + p.color + ';font-weight:bold;font-size:0.9em;">' + p.icon + ' ' + p.label + (p.fulfilled ? ' <span style="color:#2ecc71;font-size:0.8em;">✅ Đã Ứng Nghiệm</span>' : '') + '</span>',
          '    <span style="color:#666;font-size:0.75em;">Năm ' + p.birthYear + (p.fulfilled ? ' → ' + p.actualFulfillYear : ' · Ứng nghiệm: ~' + p.fulfillYear) + '</span>',
          '  </div>',
          '  <div style="color:#ddd;margin:6px 0;font-style:italic;line-height:1.5;">"' + p.text + '"</div>',
          '  <div style="display:flex;align-items:center;gap:6px;">',
          '    <span style="color:#888;font-size:0.78em;">Chủ thể: <span style="color:#bbb;">' + p.subject + '</span></span>',
          '    <span style="color:#888;font-size:0.78em;margin-left:8px;">Mức độ: ' + p.urgency + '/10</span>',
          '    <div style="flex:1;height:4px;background:#222;border-radius:2px;margin-left:6px;"><div style="width:' + urgBar + '%;height:100%;background:' + p.color + ';border-radius:2px;"></div></div>',
          !p.fulfilled ? ('    <button onclick="(function(){if(typeof window.ap77FulfillProphecy===\'function\'){window.ap77FulfillProphecy(\'' + p.id + '\',\'Tay người can thiệp\');if(typeof window.pr77ShowTab===\'function\')window.pr77ShowTab(\'prophecy\')}})()" style="font-size:0.72em;padding:2px 7px;background:#27ae60;color:#fff;border:none;border-radius:3px;cursor:pointer;">✅ Ứng Nghiệm</button>') : '',
          '  </div>',
          '</div>'
        );
      });
    }
    return html.join("");
  }

  /* ── Tab: Vận Mệnh Web ────────────────────────── */
  function buildFateWebHTML() {
    return [
      '<div style="margin-bottom:8px;display:flex;gap:8px;align-items:center;">',
      '  <span style="color:#bbb;font-size:0.85em;">Mạng lưới vận mệnh kết nối các thực thể</span>',
      '  <button onclick="(function(){if(typeof window.ft77AddThread===\'function\'&&window.countries&&window.countries.length>=2){var i=Math.floor(Math.random()*window.countries.length),j=Math.floor(Math.random()*window.countries.length);if(i!==j)window.ft77AddThread(\'c_\'+window.countries[i].name,window.countries[i].name,\'country\',\'c_\'+window.countries[j].name,window.countries[j].name,\'country\',[\'destiny\',\'rival\',\'bound\',\'doom\'][Math.floor(Math.random()*4)],\'Thần Sấm kết nối\')}if(typeof window.pr77ShowTab===\'function\')window.pr77ShowTab(\'fateweb\')})()" style="font-size:0.78em;padding:3px 9px;background:#2980b9;color:#fff;border:none;border-radius:4px;cursor:pointer;">➕ Thêm Sợi Duyên</button>',
      '</div>',
      '<canvas id="pr77-fate-canvas" width="640" height="280" style="background:#0a0a1a;border-radius:6px;border:1px solid #333;width:100%;max-width:640px;display:block;"></canvas>',
      '<div id="pr77-thread-list" style="margin-top:10px;">' + buildThreadListHTML() + '</div>'
    ].join("");
  }

  function buildThreadListHTML() {
    var threads = typeof window.ft77GetActiveThreads === "function" ? window.ft77GetActiveThreads() : [];
    if (threads.length === 0) return '<div style="color:#888;text-align:center;padding:12px;">Chưa có sợi duyên. Hãy thêm để xây dựng mạng lưới vận mệnh.</div>';
    return threads.slice(-10).reverse().map(function(t) {
      return [
        '<div class="pr77-thread-item">',
        '  <span style="font-size:1.2em;">' + t.icon + '</span>',
        '  <div style="flex:1;">',
        '    <div style="color:' + t.color + ';font-size:0.85em;font-weight:bold;">' + t.label + '</div>',
        '    <div style="color:#ccc;font-size:0.82em;">' + t.entityA.name + ' ↔ ' + t.entityB.name + '</div>',
        '    <div style="color:#888;font-size:0.75em;">' + t.reason + '</div>',
        '  </div>',
        '  <span style="color:#666;font-size:0.75em;">Năm ' + t.birthYear + '</span>',
        '</div>'
      ].join("");
    }).join("");
  }

  function renderFateWebCanvas() {
    var canvas = document.getElementById("pr77-fate-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, w, h);

    var web = typeof window.ft77GetWeb === "function" ? window.ft77GetWeb() : { nodes: [], threads: [] };
    var nodes = web.nodes.slice(0, 15);
    var threads = web.threads.slice(0, 20);

    var positions = {};
    nodes.forEach(function(n, i) {
      var angle = (i / nodes.length) * Math.PI * 2;
      var r = Math.min(w, h) * 0.35;
      positions[n.id] = { x: w/2 + Math.cos(angle) * r, y: h/2 + Math.sin(angle) * r };
    });

    threads.forEach(function(t) {
      var pa = positions[t.entityA.id], pb = positions[t.entityB.id];
      if (!pa || !pb) return;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.strokeStyle = t.color + "66";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    nodes.forEach(function(n) {
      var pos = positions[n.id];
      if (!pos) return;
      ctx.beginPath();
      var r = 5 + Math.min(n.threadCount * 2, 12);
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.fillStyle = n.type === "country" ? "#3498db" : n.type === "npc" ? "#e67e22" : "#9b59b6";
      ctx.fill();
      ctx.fillStyle = "#eee";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(n.name.substring(0, 8), pos.x, pos.y + r + 12);
    });

    if (nodes.length === 0) {
      ctx.fillStyle = "#555";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Chưa có sợi duyên — bấm [Thêm Sợi Duyên] để bắt đầu", w/2, h/2);
    }

    var listEl = document.getElementById("pr77-thread-list");
    if (listEl) listEl.innerHTML = buildThreadListHTML();
  }

  /* ── Tab: Định Mệnh ──────────────────────────── */
  function buildDestinyHTML() {
    var ps = typeof window.ds77GetPlayerScore === "function" ? window.ds77GetPlayerScore() : null;
    var countries = typeof window.ds77GetCountryScores === "function" ? window.ds77GetCountryScores() : [];
    var npcs = typeof window.ds77GetNPCScores === "function" ? window.ds77GetNPCScores() : [];
    var dims = typeof window.DS77_DIMENSIONS !== "undefined" ? window.DS77_DIMENSIONS : [];
    var html = [];

    if (ps) {
      html.push(
        '<div style="background:#1a0d2e;border:1px solid #9b59b6;border-radius:6px;padding:12px;margin-bottom:10px;">',
        '  <div style="color:#f1c40f;font-weight:bold;font-size:1em;margin-bottom:8px;">✨ ĐẤNG TẠO HÓA — ' + ps.overall + '/100 <span style="color:' + ps.tierColor + ';">(' + ps.tier + ')</span></div>',
        '  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">'
      );
      dims.forEach(function(d) {
        var val = ps.dimensions[d.id] || 0;
        html.push(
          '<div>',
          '  <div style="color:#aaa;font-size:0.78em;">' + d.icon + ' ' + d.label + ': ' + val + '</div>',
          '  <div style="height:5px;background:#222;border-radius:3px;"><div style="width:' + val + '%;height:100%;background:' + d.color + ';border-radius:3px;"></div></div>',
          '</div>'
        );
      });
      html.push('  </div>');
      var report = typeof window.ds77GetJarvisReport === "function" ? window.ds77GetJarvisReport() : "";
      if (report) {
        html.push('<div style="margin-top:8px;background:#0d0d1a;padding:8px;border-radius:4px;color:#ccc;font-size:0.8em;white-space:pre-line;">' + report + '</div>');
      }
      html.push('</div>');
    }

    if (countries.length > 0) {
      html.push('<div style="color:#3498db;font-size:0.88em;font-weight:bold;margin:8px 0 5px;">🏛️ Quốc Gia — Điểm Định Mệnh</div>');
      countries.slice(0, 5).forEach(function(c) {
        html.push(
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">',
          '  <span style="color:#bbb;font-size:0.82em;width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + c.name + '</span>',
          '  <div style="flex:1;height:7px;background:#222;border-radius:4px;"><div style="width:' + c.overall + '%;height:100%;background:' + c.tierColor + ';border-radius:4px;"></div></div>',
          '  <span style="color:' + c.tierColor + ';font-size:0.8em;width:45px;text-align:right;">' + c.overall + '</span>',
          '  <span style="color:#888;font-size:0.75em;">' + c.tier + '</span>',
          '</div>'
        );
      });
    }

    if (npcs.length > 0) {
      html.push('<div style="color:#e67e22;font-size:0.88em;font-weight:bold;margin:8px 0 5px;">👤 Sinh Linh — Điểm Định Mệnh</div>');
      npcs.slice(0, 5).forEach(function(n) {
        html.push(
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">',
          '  <span style="color:#bbb;font-size:0.82em;width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + n.name + '</span>',
          '  <div style="flex:1;height:7px;background:#222;border-radius:4px;"><div style="width:' + n.overall + '%;height:100%;background:' + n.tierColor + ';border-radius:4px;"></div></div>',
          '  <span style="color:' + n.tierColor + ';font-size:0.8em;width:45px;text-align:right;">' + n.overall + '</span>',
          '  <span style="color:#888;font-size:0.75em;">' + n.tier + '</span>',
          '</div>'
        );
      });
    }

    if (!ps && countries.length === 0) {
      html.push('<div style="color:#888;text-align:center;padding:20px;">Đang tính toán định mệnh... Hãy tạo thế giới trước.</div>');
    }

    return html.join("");
  }

  function renderDestinyTab() {
    var el = document.getElementById("pr77-tab-destiny");
    if (el) el.innerHTML = buildDestinyHTML();
  }

  /* ── Tab: Thần Sấm Oracle ──────────────────────── */
  function buildOracleHTML() {
    var types = typeof window.DO77_ORACLE_TYPES !== "undefined" ? window.DO77_ORACLE_TYPES : [];
    var history = typeof window.do77GetHistory === "function" ? window.do77GetHistory() : [];
    var html = [
      '<div style="margin-bottom:10px;">',
      '  <div style="color:#bbb;font-size:0.83em;margin-bottom:6px;">Chọn loại câu hỏi:</div>',
      '  <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px;">'
    ];
    types.forEach(function(t) {
      html.push('<button onclick="window._pr77OracleType=\'' + t.id + '\';document.querySelectorAll(\'.pr77-oracle-type-btn\').forEach(function(b){b.style.background=\'#1a1a2e\';b.style.color=\'#888\'});this.style.background=\'#8e44ad\';this.style.color=\'#fff\';" class="pr77-oracle-type-btn" style="padding:4px 9px;border:1px solid #555;border-radius:4px;cursor:pointer;background:' + (t.id === 'world_fate' ? '#8e44ad' : '#1a1a2e') + ';color:' + (t.id === 'world_fate' ? '#fff' : '#888') + ';font-size:0.78em;">' + t.icon + ' ' + t.label + '</button>');
    });
    html.push(
      '  </div>',
      '  <textarea id="pr77-oracle-custom" placeholder="Câu hỏi tùy chỉnh (nếu chọn Câu Hỏi Tự Do)..." style="width:100%;height:55px;background:#111;color:#ccc;border:1px solid #444;border-radius:4px;padding:6px;font-size:0.83em;resize:none;box-sizing:border-box;"></textarea>',
      '  <button id="pr77-oracle-btn" onclick="pr77ConsultOracle()" style="margin-top:6px;padding:7px 18px;background:#8e44ad;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.88em;">🔮 Hỏi Thần Sấm</button>',
      '  <div id="pr77-oracle-result" style="margin-top:8px;"></div>',
      '</div>',
      '<div id="pr77-oracle-history">'
    );
    if (history.length === 0) {
      html.push('<div style="color:#888;text-align:center;padding:12px;">Chưa có lần tham vấn nào.</div>');
    } else {
      history.slice(0, 5).forEach(function(h) {
        html.push(
          '<div class="pr77-oracle-entry">',
          '  <div style="color:#9b59b6;font-size:0.78em;margin-bottom:4px;">' + h.typeIcon + ' ' + h.typeLabel + ' · Năm ' + h.year + '</div>',
          '  <div style="color:#888;font-size:0.78em;margin-bottom:5px;">Hỏi: ' + h.question.substring(0, 80) + '...</div>',
          '  <div style="color:#e8d5ff;font-size:0.88em;line-height:1.55;">' + h.answer + '</div>',
          '</div>'
        );
      });
    }
    html.push('</div>');
    return html.join("");
  }

  window.pr77ConsultOracle = async function() {
    var btn = document.getElementById("pr77-oracle-btn");
    var resultEl = document.getElementById("pr77-oracle-result");
    var customEl = document.getElementById("pr77-oracle-custom");
    var otype = window._pr77OracleType || "world_fate";
    var question = customEl ? customEl.value.trim() : "";

    if (btn) { btn.disabled = true; btn.textContent = "⏳ Thần Sấm đang trả lời..."; }
    if (resultEl) resultEl.innerHTML = '<div style="color:#9b59b6;font-style:italic;">Màn đêm hé lộ...</div>';

    if (typeof window.do77Consult !== "function") {
      if (resultEl) resultEl.innerHTML = '<div style="color:#e74c3c;">Thần Sấm chưa sẵn sàng.</div>';
      if (btn) { btn.disabled = false; btn.textContent = "🔮 Hỏi Thần Sấm"; }
      return;
    }

    var entry = await window.do77Consult(otype, question || undefined);
    if (resultEl) {
      resultEl.innerHTML = [
        '<div class="pr77-oracle-entry" style="margin-top:0;">',
        '  <div style="color:#9b59b6;font-size:0.8em;margin-bottom:4px;">' + entry.typeIcon + ' ' + entry.typeLabel + '</div>',
        '  <div style="color:#e8d5ff;font-size:0.9em;line-height:1.6;">' + entry.answer + '</div>',
        '</div>'
      ].join("");
    }
    if (btn) { btn.disabled = false; btn.textContent = "🔮 Hỏi Thần Sấm"; }
    var histEl = document.getElementById("pr77-oracle-history");
    if (histEl) {
      var h = typeof window.do77GetHistory === "function" ? window.do77GetHistory() : [];
      if (h.length > 0) {
        histEl.innerHTML = h.slice(0, 5).map(function(e) {
          return [
            '<div class="pr77-oracle-entry">',
            '  <div style="color:#9b59b6;font-size:0.78em;margin-bottom:4px;">' + e.typeIcon + ' ' + e.typeLabel + ' · Năm ' + e.year + '</div>',
            '  <div style="color:#888;font-size:0.78em;margin-bottom:5px;">Hỏi: ' + e.question.substring(0, 80) + '...</div>',
            '  <div style="color:#e8d5ff;font-size:0.88em;line-height:1.55;">' + e.answer + '</div>',
            '</div>'
          ].join("");
        }).join("");
      }
    }
  };

  function refreshCurrentTab() {
    if (currentTab === "prophecy") {
      var el = document.getElementById("pr77-tab-prophecy");
      if (el) el.innerHTML = buildProphecyHTML();
    } else if (currentTab === "fateweb") {
      renderFateWebCanvas();
    } else if (currentTab === "destiny") {
      renderDestinyTab();
    }
  }

  function init() {
    var _orig = window.hubRenderPanel;
    window.hubRenderPanel = function(panelId) {
      if (_orig) _orig(panelId);
      if (panelId === "creator-hub-v32") {
        setTimeout(renderV77Section, 150);
      }
    };
    console.log("[ProphecyRegistryV77] 📜 Registry V77 khởi động — 4 tabs (Tiên Tri/Vận Mệnh/Định Mệnh/Thần Sấm) · inject creator-hub-v32 sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 19700); });
  } else {
    setTimeout(init, 19700);
  }
})();
