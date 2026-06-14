(function () {
  "use strict";

  const SECTION_ID = "imm70-section-wrapper";
  const TABS = [
    { id: "immview",  label: "🌌 Immersion View" },
    { id: "worldzoom",label: "🔍 World Zoom"      },
    { id: "npcobs",   label: "👤 NPC Observer"    },
    { id: "dynasty",  label: "👑 Dynasty View"    },
    { id: "replay",   label: "📽️ Historical Replay"},
  ];
  let activeTab = "immview";
  let replayRunning = false;
  let replayInterval = null;
  let canvasLoops = {};

  /* ── helpers ── */
  function esc(s) { return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  function q(id) { return document.getElementById(id); }

  function showTab(tabId) {
    activeTab = tabId;
    TABS.forEach(function (t) {
      const btn = q("imm70-tab-" + t.id);
      const pane = q("imm70-pane-" + t.id);
      if (btn) btn.style.cssText = btn.style.cssText.replace(/border-bottom:[^;]+;/, "") + (t.id === tabId ? "border-bottom:2px solid #00f5ff;" : "border-bottom:2px solid transparent;");
      if (pane) pane.style.display = t.id === tabId ? "block" : "none";
    });
    renderActiveTab();
  }

  /* ══════════════════════════════════════════
     TAB 1 — IMMERSION VIEW
  ══════════════════════════════════════════ */
  function renderImmersionView() {
    const pane = q("imm70-pane-immview");
    if (!pane) return;
    const eng = window.immersionEngineV70Data;
    const scales = window.imm70GetAllScales ? window.imm70GetAllScales() : [];
    const cur = eng ? eng.currentScale : 2;
    const narration = window.imm70GetJarvisNarration ? window.imm70GetJarvisNarration(cur) : "";
    const ctx = window.imm70GetContextData ? window.imm70GetContextData() : {};
    const stats = window.imm70GetStats ? window.imm70GetStats() : {};

    let scaleBar = scales.map(function (s) {
      const active = s.id === cur;
      return '<button onclick="if(window.imm70ZoomTo)imm70ZoomTo(' + s.id + ');setTimeout(function(){imm70RefreshUI&&imm70RefreshUI()},400)" style="padding:4px 7px;margin:2px;border:none;cursor:pointer;border-radius:4px;font-size:11px;background:' + (active ? "#00f5ff22" : "transparent") + ";color:" + (active ? "#00f5ff" : "#94a3b8") + ';border:1px solid ' + (active ? "#00f5ff55" : "transparent") + '">' + s.icon + " " + s.name + "</button>";
    }).join("");

    let ctxInfo = "";
    if (ctx.worldName) ctxInfo += "<span style='color:#4ade80'>🌍 " + esc(ctx.worldName) + " · Năm " + esc(ctx.yearCurrent) + " · " + esc(ctx.countryCount) + " quốc gia · " + esc(ctx.npcAlive) + " sinh linh</span>";
    if (ctx.city && ctx.city.name) ctxInfo += " <span style='color:#c084fc'>🏙️ " + esc(ctx.city.name) + " — " + esc(ctx.npcsInCity) + " NPC</span>";
    if (ctx.npc && ctx.npc.name) ctxInfo += " <span style='color:#fb7185'>👤 " + esc(ctx.npc.name) + "</span>";

    pane.innerHTML = [
      '<div style="margin-bottom:10px">',
      '<div style="font-size:11px;color:#94a3b8;margin-bottom:6px">SCALE NAVIGATOR</div>',
      '<div style="display:flex;flex-wrap:wrap;gap:2px">' + scaleBar + "</div>",
      "</div>",
      '<div style="background:#00f5ff11;border:1px solid #00f5ff33;border-radius:8px;padding:10px;margin-bottom:10px">',
      '<div style="font-size:13px;font-weight:bold;color:#00f5ff;margin-bottom:4px">' + (scales[cur] ? scales[cur].icon + " " + scales[cur].name : "") + "</div>",
      '<div style="font-size:11px;color:#94a3b8;margin-bottom:6px">' + esc(scales[cur] ? scales[cur].desc : "") + "</div>",
      ctxInfo ? '<div style="font-size:11px;margin-bottom:4px">' + ctxInfo + "</div>" : "",
      "</div>",
      '<div style="background:#c084fc11;border:1px solid #c084fc33;border-radius:6px;padding:8px;margin-bottom:10px">',
      '<div style="font-size:10px;color:#c084fc;margin-bottom:4px">🤖 JARVIS IMMERSION</div>',
      '<div style="font-size:11px;color:#e2e8f0;font-style:italic">"' + esc(narration) + '"</div>',
      "</div>",
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px">',
      '<div style="background:#0a0a1a;border-radius:6px;padding:8px;text-align:center"><div style="font-size:18px">🔍</div><div style="font-size:11px;color:#94a3b8">Tổng Zoom</div><div style="color:#00f5ff;font-weight:bold">' + esc(stats.totalZooms || 0) + "</div></div>",
      '<div style="background:#0a0a1a;border-radius:6px;padding:8px;text-align:center"><div style="font-size:18px">👤</div><div style="font-size:11px;color:#94a3b8">NPC Quan Sát</div><div style="color:#4ade80;font-weight:bold">' + esc(stats.npcsObserved || 0) + "</div></div>",
      '<div style="background:#0a0a1a;border-radius:6px;padding:8px;text-align:center"><div style="font-size:18px">📽️</div><div style="font-size:11px;color:#94a3b8">Replay</div><div style="color:#f59e0b;font-weight:bold">' + esc(stats.replaysWatched || 0) + "</div></div>",
      "</div>",
      '<div style="display:flex;gap:6px;flex-wrap:wrap">',
      '<button onclick="if(window.imm70ZoomIn)imm70ZoomIn();setTimeout(function(){imm70RefreshUI&&imm70RefreshUI()},400)" style="padding:5px 12px;background:#00f5ff22;border:1px solid #00f5ff55;color:#00f5ff;border-radius:4px;cursor:pointer;font-size:11px">🔍 Zoom In</button>',
      '<button onclick="if(window.imm70ZoomOut)imm70ZoomOut();setTimeout(function(){imm70RefreshUI&&imm70RefreshUI()},400)" style="padding:5px 12px;background:#38bdf822;border:1px solid #38bdf855;color:#38bdf8;border-radius:4px;cursor:pointer;font-size:11px">🔭 Zoom Out</button>',
      '<button onclick="if(window.imm70ZoomBack)imm70ZoomBack();setTimeout(function(){imm70RefreshUI&&imm70RefreshUI()},400)" style="padding:5px 12px;background:#f59e0b22;border:1px solid #f59e0b55;color:#f59e0b;border-radius:4px;cursor:pointer;font-size:11px">↩ Quay Lại</button>',
      '<button onclick="if(window.cis70VisitCity){var c=(window.countries||[])[0];if(c)cis70VisitCity(c);}" style="padding:5px 12px;background:#c084fc22;border:1px solid #c084fc55;color:#c084fc;border-radius:4px;cursor:pointer;font-size:11px">🏙️ Thăm Thành Phố</button>',
      "</div>",
    ].join("");
  }

  /* ══════════════════════════════════════════
     TAB 2 — WORLD ZOOM (canvas)
  ══════════════════════════════════════════ */
  function renderWorldZoom() {
    const pane = q("imm70-pane-worldzoom");
    if (!pane) return;
    const scales = window.imm70GetAllScales ? window.imm70GetAllScales() : [];
    const cur = window.immersionEngineV70Data ? window.immersionEngineV70Data.currentScale : 2;

    let levelBtns = scales.map(function (s) {
      return '<button onclick="if(window.dzm70JumpToLevel)dzm70JumpToLevel(' + s.id + ');setTimeout(function(){imm70RefreshUI&&imm70RefreshUI()},500)" style="padding:3px 7px;margin:2px;border:none;cursor:pointer;border-radius:3px;font-size:10px;background:' + (s.id === cur ? "#00f5ff22" : "transparent") + ";color:" + (s.id === cur ? "#00f5ff" : "#64748b") + ';border:1px solid ' + (s.id === cur ? "#00f5ff44" : "#1e293b") + '">' + s.icon + " " + s.name + "</button>";
    }).join("");

    const zoom = window.dzm70GetZoom ? window.dzm70GetZoom().toFixed(2) : "1.00";

    pane.innerHTML = [
      '<div style="margin-bottom:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">',
      '<div style="font-size:11px;color:#94a3b8">JUMP TO:</div>',
      levelBtns,
      '<span style="margin-left:auto;font-size:10px;color:#00f5ff">Zoom: ' + zoom + "×</span>",
      "</div>",
      '<canvas id="wse70-canvas" style="width:100%;height:320px;border-radius:8px;border:1px solid #1e293b;cursor:crosshair;display:block"></canvas>',
      '<div style="margin-top:8px;font-size:10px;color:#475569">🖱️ Scroll để zoom · Click để chọn · Kéo để pan</div>',
    ].join("");

    const canvas = q("wse70-canvas");
    if (canvas) {
      if (window.wse70SetupCanvas) window.wse70SetupCanvas(canvas);
      if (!canvasLoops["wse70"]) {
        canvasLoops["wse70"] = true;
        if (window.wse70StartLoop) window.wse70StartLoop("wse70-canvas");
        if (window.dzm70SetupWheelZoom) window.dzm70SetupWheelZoom(canvas);
        if (window.dzm70SetupPinchZoom) window.dzm70SetupPinchZoom(canvas);
      }
    }
  }

  /* ══════════════════════════════════════════
     TAB 3 — NPC OBSERVER
  ══════════════════════════════════════════ */
  function renderNpcObserver() {
    const pane = q("imm70-pane-npcobs");
    if (!pane) return;
    const npc = window.nos70GetCurrentNpc ? window.nos70GetCurrentNpc() : null;
    const profile = npc && window.nos70GetProfile ? window.nos70GetProfile(npc) : null;
    const lifeline = window.nos70GetLifeline ? window.nos70GetLifeline() : [];
    const summary = window.nos70GetSummary ? window.nos70GetSummary() : "";

    const aliveNpcs = (window.npcs || []).filter(function (n) { return n.status === "alive"; }).slice(0, 16);
    const npcOptions = aliveNpcs.map(function (n) {
      return '<option value="' + esc(n.id) + '"' + (npc && n.id === npc.id ? " selected" : "") + ">" + esc(n.name) + (n.age ? " (" + n.age + "t)" : "") + (n.country ? " — " + esc(n.country) : "") + "</option>";
    }).join("");

    const lifelineHtml = lifeline.length ? lifeline.map(function (ev) {
      const imp = ev.important ? "color:#fcd34d" : "color:#94a3b8";
      return '<div style="padding:4px 0;border-bottom:1px solid #1e293b;font-size:11px"><span style="color:#38bdf8;min-width:50px;display:inline-block">Năm ' + esc(ev.year) + "</span> <span style='" + imp + "'>" + esc(ev.event) + "</span></div>";
    }).join("") : '<div style="color:#475569;font-size:11px">Chưa có dữ liệu cuộc đời.</div>';

    const relHtml = profile && profile.relationships.length ? profile.relationships.map(function (r) {
      const col = r.score > 50 ? "#4ade80" : r.score < -50 ? "#ef4444" : "#94a3b8";
      return '<span style="background:#0a0a1a;border:1px solid #1e293b;border-radius:4px;padding:2px 6px;margin:2px;font-size:10px;color:' + col + '">' + esc(r.name) + " " + esc(r.type) + " (" + r.score + ")</span>";
    }).join("") : "";

    const memHtml = profile && profile.memories.length ? profile.memories.slice(0, 4).map(function (m) {
      return '<div style="background:#0a0a1a;border-radius:4px;padding:6px;margin:3px 0;font-size:10px;color:#94a3b8">' + esc(m.title || m.content || "Ký ức") + (m.year ? ' <span style="color:#38bdf8">- Năm ' + esc(m.year) + "</span>" : "") + "</div>";
    }).join("") : "";

    pane.innerHTML = [
      '<div style="display:flex;gap:8px;margin-bottom:10px;align-items:center">',
      '<select id="imm70-npc-select" style="flex:1;background:#0a0a1a;border:1px solid #1e293b;color:#e2e8f0;padding:5px;border-radius:4px;font-size:11px">' + npcOptions + "</select>",
      '<button onclick="var s=document.getElementById(\'imm70-npc-select\');if(s&&window.nos70ObserveNpc)nos70ObserveNpc(s.value);if(window.imm70RefreshUI)imm70RefreshUI()" style="padding:5px 10px;background:#fb7185;border:none;color:#000;border-radius:4px;cursor:pointer;font-weight:bold;font-size:11px">👁️ Quan Sát</button>',
      "</div>",
      npc ? [
        '<div style="background:#fb718511;border:1px solid #fb718533;border-radius:8px;padding:10px;margin-bottom:8px">',
        '<div style="font-weight:bold;color:#fb7185;font-size:13px">👤 ' + esc(npc.name) + '</div>',
        '<div style="font-size:10px;color:#94a3b8;margin-top:2px">' + esc(summary) + "</div>",
        profile ? '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:8px">' +
          Object.entries(profile.stats).map(function (kv) {
            return '<div style="background:#0a0a1a;border-radius:4px;padding:4px;text-align:center;font-size:10px"><div style="color:#94a3b8">' + kv[0] + "</div><div style='color:#4ade80;font-weight:bold'>" + esc(kv[1]) + "</div></div>";
          }).join("") + "</div>" : "",
        relHtml ? '<div style="margin-top:8px"><div style="font-size:10px;color:#64748b;margin-bottom:4px">QUAN HỆ:</div>' + relHtml + "</div>" : "",
        memHtml ? '<div style="margin-top:8px"><div style="font-size:10px;color:#64748b;margin-bottom:4px">KÝ ỨC:</div>' + memHtml + "</div>" : "",
        "</div>",
        '<div style="margin-bottom:8px"><div style="font-size:11px;font-weight:bold;color:#38bdf8;margin-bottom:6px">📖 CUỘC ĐỜI</div>',
        '<div style="max-height:200px;overflow-y:auto;border:1px solid #1e293b;border-radius:6px;padding:6px">' + lifelineHtml + "</div></div>",
      ].join("") : '<div style="color:#475569;font-size:12px;padding:20px;text-align:center">Chọn NPC để bắt đầu quan sát.</div>',
      '<button onclick="var a=(window.npcs||[]).filter(function(n){return n.status===\'alive\'});var r=a[Math.floor(Math.random()*a.length)];if(r&&window.nos70ObserveNpc)nos70ObserveNpc(r);if(window.imm70RefreshUI)imm70RefreshUI()" style="width:100%;padding:6px;background:#fb718522;border:1px solid #fb718544;color:#fb7185;border-radius:4px;cursor:pointer;font-size:11px">🎲 Ngẫu Nhiên NPC</button>',
    ].join("");
  }

  /* ══════════════════════════════════════════
     TAB 4 — DYNASTY VIEW
  ══════════════════════════════════════════ */
  function renderDynastyView() {
    const pane = q("imm70-pane-dynasty");
    if (!pane) return;
    const stats = window.dv70GetStats ? window.dv70GetStats() : null;
    const timeline = window.dv70GetTimeline ? window.dv70GetTimeline() : [];

    const tlHtml = timeline.length ? timeline.map(function (ev) {
      return '<div style="padding:4px 0;border-bottom:1px solid #1e293b;font-size:11px"><span style="color:#c084fc;min-width:55px;display:inline-block">Năm ' + esc(ev.year) + '</span><span style="color:' + (ev.current ? "#fcd34d" : "#e2e8f0") + '">' + esc(ev.text) + "</span></div>";
    }).join("") : "";

    const allNpcSurnames = {};
    (window.npcs || []).forEach(function (n) {
      const s = n.surname || (n.name && n.name.split(" ")[0]);
      if (s && s.length > 1) allNpcSurnames[s] = (allNpcSurnames[s] || 0) + 1;
    });
    const topSurnames = Object.entries(allNpcSurnames).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 8);
    const surnameButtons = topSurnames.map(function (kv) {
      return '<button onclick="if(window.dv70VisitDynasty)dv70VisitDynasty(\'' + esc(kv[0]) + '\');if(window.imm70RefreshUI)imm70RefreshUI()" style="padding:4px 8px;background:#c084fc22;border:1px solid #c084fc44;color:#c084fc;border-radius:4px;cursor:pointer;font-size:10px;margin:2px">👑 ' + esc(kv[0]) + " (" + kv[1] + ")</button>";
    }).join("");

    pane.innerHTML = [
      '<div style="margin-bottom:10px">',
      '<div style="font-size:11px;color:#94a3b8;margin-bottom:6px">GIA TỘC NỔI BẬT:</div>',
      '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">' + (surnameButtons || '<span style="color:#475569;font-size:11px">Chưa có dữ liệu dòng họ.</span>') + "</div>",
      "</div>",
      stats ? [
        '<div style="background:#c084fc11;border:1px solid #c084fc33;border-radius:8px;padding:10px;margin-bottom:8px">',
        '<div style="font-weight:bold;color:#c084fc;margin-bottom:8px">👑 Gia Tộc: ' + esc(stats.name) + "</div>",
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">',
        '<div style="background:#0a0a1a;border-radius:4px;padding:6px;text-align:center"><div style="font-size:10px;color:#94a3b8">Tổng thành viên</div><div style="color:#c084fc;font-weight:bold;font-size:16px">' + stats.total + "</div></div>",
        '<div style="background:#0a0a1a;border-radius:4px;padding:6px;text-align:center"><div style="font-size:10px;color:#94a3b8">Còn sống</div><div style="color:#4ade80;font-weight:bold;font-size:16px">' + stats.alive + "</div></div>",
        '<div style="background:#0a0a1a;border-radius:4px;padding:6px;text-align:center"><div style="font-size:10px;color:#94a3b8">Thế hệ</div><div style="color:#f59e0b;font-weight:bold;font-size:16px">' + stats.maxGeneration + "</div></div>",
        "</div>",
        '<div style="margin-top:6px;font-size:10px;color:#64748b">Thành lập: Năm ' + esc(stats.founded) + " · Hoạt động: " + esc(stats.yearsActive) + " năm</div>",
        "</div>",
      ].join("") : '<div style="color:#475569;font-size:11px;padding:10px;text-align:center">Nhấn vào gia tộc để xem chi tiết.</div>',
      '<canvas id="dv70-tree-canvas" style="width:100%;height:260px;border-radius:8px;border:1px solid #1e293b;display:block;margin-bottom:8px"></canvas>',
      timeline.length ? '<div><div style="font-size:11px;color:#c084fc;margin-bottom:6px">📜 LỊCH SỬ GIA TỘC</div><div style="max-height:150px;overflow-y:auto;border:1px solid #1e293b;border-radius:6px;padding:6px">' + tlHtml + "</div></div>" : "",
    ].join("");

    const canvas = q("dv70-tree-canvas");
    if (canvas) {
      if (!canvasLoops["dv70"]) {
        canvasLoops["dv70"] = true;
        (function loop() {
          const el = document.getElementById("dv70-tree-canvas");
          if (el && el.offsetParent !== null && window.dv70RenderTree) dv70RenderTree(el);
          requestAnimationFrame(loop);
        })();
        canvas.addEventListener("click", function (e) {
          const rect = canvas.getBoundingClientRect();
          const nodes = window.dv70GetNodes ? window.dv70GetNodes() : [];
          const dy = window.dynastyVizV70Data;
          const offX = canvas.offsetWidth / 2 + (dy ? dy.scrollX : 0);
          const offY = 40 + (dy ? dy.scrollY : 0);
          const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
          const cy = (e.clientY - rect.top) * (canvas.height / rect.height);
          nodes.forEach(function (n) {
            const nx = n.x + offX, ny = n.y + offY;
            if (Math.sqrt(Math.pow(cx - nx, 2) + Math.pow(cy - ny, 2)) < 20) {
              if (window.dv70SelectMember) dv70SelectMember(n.id);
              if (window.imm70RefreshUI) imm70RefreshUI();
            }
          });
        });
      }
    }
  }

  /* ══════════════════════════════════════════
     TAB 5 — HISTORICAL REPLAY
  ══════════════════════════════════════════ */
  function renderHistoricalReplay() {
    const pane = q("imm70-pane-replay");
    if (!pane) return;
    const walkData = window.worldWalkthroughV70Data;
    const sceneHistory = window.wwt70GetSceneHistory ? window.wwt70GetSceneHistory() : [];
    const activeScene = window.wwt70GetScene ? window.wwt70GetScene() : null;
    const jarvisQueue = window.wwt70GetJarvisQueue ? window.wwt70GetJarvisQueue() : [];
    const curYear = window.year || 1;
    const replayEvents = walkData ? walkData.replayEvents : [];

    const sceneHistHtml = sceneHistory.slice(-8).reverse().map(function (sh) {
      return '<div style="padding:3px 0;font-size:10px;color:#94a3b8;border-bottom:1px solid #1e293b">Năm ' + esc(sh.year) + " — " + esc(sh.scene) + ' <span style="color:#64748b">(' + esc(sh.city || "?") + ")</span></div>";
    }).join("");

    const replayHtml = replayEvents.slice(-6).map(function (ev) {
      return '<div style="padding:3px 0;font-size:10px;border-bottom:1px solid #1e293b"><span style="color:#f59e0b">Năm ' + esc(ev.year) + "</span> <span style='color:" + (ev.color || "#e2e8f0") + "'>" + esc(ev.title || ev.type) + "</span></div>";
    }).join("");

    pane.innerHTML = [
      '<canvas id="wwt70-canvas" style="width:100%;height:200px;border-radius:8px;border:1px solid #1e293b;display:block;margin-bottom:10px"></canvas>',

      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">',
      '<button onclick="if(window.wwt70Enter)wwt70Enter();if(window.imm70RefreshUI)imm70RefreshUI()" style="padding:5px 10px;background:#4ade8022;border:1px solid #4ade8055;color:#4ade80;border-radius:4px;cursor:pointer;font-size:11px">🚶 Bắt Đầu Walkthrough</button>',
      '<button onclick="if(window.wwt70Move)wwt70Move(\'forward\');if(window.imm70RefreshUI)imm70RefreshUI()" style="padding:5px 10px;background:#38bdf822;border:1px solid #38bdf855;color:#38bdf8;border-radius:4px;cursor:pointer;font-size:11px">▶ Di Chuyển</button>',
      '<button onclick="if(window.wwt70Exit)wwt70Exit();if(window.imm70RefreshUI)imm70RefreshUI()" style="padding:5px 10px;background:#ef444422;border:1px solid #ef444455;color:#ef4444;border-radius:4px;cursor:pointer;font-size:11px">⏹ Dừng</button>',
      "</div>",

      '<div style="margin-bottom:10px">',
      '<div style="font-size:11px;color:#f59e0b;font-weight:bold;margin-bottom:6px">📽️ LỊCH SỬ REPLAY</div>',
      '<div style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap">',
      '<button onclick="var y=parseInt(document.getElementById(\'imm70-replay-from\').value)||1;if(window.wwt70StartReplay)wwt70StartReplay(y,' + curYear + ');if(window.imm70RefreshUI)imm70RefreshUI()" style="padding:4px 10px;background:#f59e0b22;border:1px solid #f59e0b55;color:#f59e0b;border-radius:4px;cursor:pointer;font-size:11px">▶ Bắt Đầu Replay</button>',
      '<span style="color:#94a3b8;font-size:11px;line-height:28px">Từ Năm:</span>',
      '<input id="imm70-replay-from" type="number" value="1" min="1" max="' + curYear + '" style="width:70px;background:#0a0a1a;border:1px solid #1e293b;color:#e2e8f0;padding:4px;border-radius:4px;font-size:11px">',
      '<button id="imm70-replay-auto" onclick="imm70ToggleAutoReplay()" style="padding:4px 10px;background:#8b5cf622;border:1px solid #8b5cf655;color:#8b5cf6;border-radius:4px;cursor:pointer;font-size:11px">' + (replayRunning ? "⏸ Dừng Auto" : "▶▶ Auto Replay") + "</button>",
      "</div>",
      replayEvents.length ? '<div style="font-size:10px;color:#64748b;margin-bottom:4px">' + replayEvents.length + " sự kiện · Hiện tại: sự kiện " + (walkData ? walkData.replayIndex : 0) + "</div>" : "",
      replayHtml ? '<div style="max-height:120px;overflow-y:auto;border:1px solid #1e293b;border-radius:6px;padding:6px">' + replayHtml + "</div>" : "",
      "</div>",

      jarvisQueue.length ? [
        '<div style="background:#c084fc11;border:1px solid #c084fc33;border-radius:6px;padding:8px;margin-bottom:8px">',
        '<div style="font-size:10px;color:#c084fc;margin-bottom:3px">🤖 JARVIS TOUR GUIDE</div>',
        '<div style="font-size:11px;color:#e2e8f0;font-style:italic">' + esc(jarvisQueue.slice(-1)[0] || "") + "</div>",
        "</div>",
      ].join("") : "",

      sceneHistory.length ? [
        '<div>',
        '<div style="font-size:11px;color:#38bdf8;margin-bottom:4px">🗺️ LỊCH SỬ VÙNG ĐÃ QUA</div>',
        '<div style="max-height:100px;overflow-y:auto;border:1px solid #1e293b;border-radius:6px;padding:6px">' + (sceneHistHtml || "") + "</div>",
        "</div>",
      ].join("") : "",
    ].join("");

    const wCanvas = q("wwt70-canvas");
    if (wCanvas) {
      if (!canvasLoops["wwt70"]) {
        canvasLoops["wwt70"] = true;
        (function loop() {
          const el = document.getElementById("wwt70-canvas");
          if (el && el.offsetParent !== null && window.wwt70RenderCanvas) wwt70RenderCanvas(el);
          requestAnimationFrame(loop);
        })();
      }
    }
  }

  /* ── auto replay toggle ── */
  window.imm70ToggleAutoReplay = function () {
    if (replayRunning) {
      replayRunning = false;
      if (replayInterval) { clearInterval(replayInterval); replayInterval = null; }
    } else {
      if (!window.worldWalkthroughV70Data || !window.worldWalkthroughV70Data.replayEvents.length) {
        if (window.wwt70StartReplay) window.wwt70StartReplay(1, window.year || 1);
      }
      replayRunning = true;
      replayInterval = setInterval(function () {
        const ev = window.wwt70StepReplay ? window.wwt70StepReplay() : null;
        if (!ev) { replayRunning = false; clearInterval(replayInterval); }
        if (window.imm70RefreshUI) window.imm70RefreshUI();
      }, 800);
    }
    if (window.imm70RefreshUI) window.imm70RefreshUI();
  };

  /* ── render active tab ── */
  function renderActiveTab() {
    if (activeTab === "immview")   renderImmersionView();
    if (activeTab === "worldzoom") renderWorldZoom();
    if (activeTab === "npcobs")    renderNpcObserver();
    if (activeTab === "dynasty")   renderDynastyView();
    if (activeTab === "replay")    renderHistoricalReplay();
  }

  /* ── global refresh ── */
  window.imm70RefreshUI = function () { renderActiveTab(); };
  window.imm70ShowTab = showTab;

  /* ═══════════════════════════════════════
     BUILD SECTION & PATCH hubRenderPanel
  ═══════════════════════════════════════ */
  function buildSection() {
    const hub = document.getElementById("panel-creator-hub-v32");
    if (!hub) return;
    if (document.getElementById(SECTION_ID)) return;

    const wrapper = document.createElement("div");
    wrapper.id = SECTION_ID;
    wrapper.style.cssText = "margin-top:20px;border-top:1px solid #1e293b;padding-top:16px";

    const tabBar = TABS.map(function (t) {
      return '<button id="imm70-tab-' + t.id + '" onclick="imm70ShowTab(\'' + t.id + '\')" style="padding:5px 10px;border:none;border-bottom:2px solid transparent;background:transparent;color:#94a3b8;cursor:pointer;font-size:11px;white-space:nowrap">' + t.label + "</button>";
    }).join("");

    const panes = TABS.map(function (t) {
      return '<div id="imm70-pane-' + t.id + '" style="display:none;padding:10px 0"></div>';
    }).join("");

    wrapper.innerHTML = [
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">',
      '<span style="font-size:18px">🌍</span>',
      '<span style="font-weight:bold;font-size:14px;color:#00f5ff">World Immersion Pass V70</span>',
      '<span style="font-size:10px;color:#475569;background:#0a0a1a;border:1px solid #1e293b;padding:2px 6px;border-radius:10px">Universe→NPC</span>',
      "</div>",
      '<div style="display:flex;overflow-x:auto;border-bottom:1px solid #1e293b;margin-bottom:4px;gap:2px">' + tabBar + "</div>",
      panes,
    ].join("");

    hub.appendChild(wrapper);

    showTab("immview");
  }

  /* patch hubRenderPanel */
  var _origHub = window.hubRenderPanel;
  window.hubRenderPanel = function (panelId) {
    if (_origHub) _origHub(panelId);
    if (panelId === "creator-hub-v32") {
      setTimeout(function () {
        buildSection();
        renderActiveTab();
      }, 80);
    }
  };

  function init() {
    console.log("[immersionRegistry V70] 🌍 Immersion Registry khởi động — 5 tabs · Universe→NPC.");
    setTimeout(buildSection, 300);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 16800); });
  } else {
    setTimeout(init, 16800);
  }
})();
