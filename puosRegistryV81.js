(function() {
  "use strict";

  var currentTab = "overview";

  function switchTab(tab) {
    currentTab = tab;
    var tabs = ["overview", "kernel", "services", "health", "lifecycle", "jarvis"];
    for (var t of tabs) {
      var btn = document.getElementById("puos81-tab-" + t);
      var pane = document.getElementById("puos81-pane-" + t);
      if (btn) btn.style.borderBottom = (t === tab) ? "2px solid #facc15" : "2px solid transparent";
      if (btn) btn.style.color = (t === tab) ? "#facc15" : "rgba(232,232,240,0.6)";
      if (pane) pane.style.display = (t === tab) ? "block" : "none";
    }
    renderActivePane();
  }

  function renderActivePane() {
    if (currentTab === "overview") renderOverview();
    else if (currentTab === "kernel") renderKernel();
    else if (currentTab === "services") renderServices();
    else if (currentTab === "health") renderHealth();
    else if (currentTab === "lifecycle") renderLifecycle();
    else if (currentTab === "jarvis") renderJarvis();
  }

  function pct2color(pct) {
    if (pct >= 75) return "#4ade80";
    if (pct >= 40) return "#facc15";
    return "#f87171";
  }

  function statusColor(s) {
    if (s === "healthy") return "#4ade80";
    if (s === "warning") return "#facc15";
    return "#f87171";
  }

  function miniBar(pct, color) {
    return '<div style="background:rgba(255,255,255,0.08);border-radius:4px;height:6px;overflow:hidden;margin-top:4px"><div style="width:' + Math.min(100, pct) + '%;background:' + color + ';height:100%;border-radius:4px;transition:width .4s"></div></div>';
  }

  function renderOverview() {
    var el = document.getElementById("puos81-pane-overview");
    if (!el) return;
    var world = window.world || {};
    var npcs = window.npcs || [];
    var countries = window.countries || [];
    var year = window.year || 1;
    var healthScore = (typeof window.uhmon81GetHealthScore === "function") ? window.uhmon81GetHealthScore() : 0;
    var integScore = (typeof window.ukernel81GetIntegrationScore === "function") ? window.ukernel81GetIntegrationScore() : 0;
    var engineScan = (typeof window.puos81ScanEngines === "function") ? window.puos81ScanEngines() : { active: [], inactive: [] };
    var xrScore = 0;
    if (window.xrEngineV69Data) xrScore += 20;
    if (window.xrWorldV72Data) xrScore += 20;
    if (window.immersionEngineV70Data) xrScore += 20;
    if (window.avatarGodV71Data) xrScore += 20;
    if (window.spatialWorldV67Data) xrScore += 20;
    var mvScore = 0;
    if (window.universeHubV73Data) mvScore += 33;
    if (window.multiverseEvoV80Data && (window.multiverseEvoV80Data.worlds || []).length > 0) mvScore += 33;
    if (window.universeClusterV80Data && (window.universeClusterV80Data.clusters || []).length > 0) mvScore += 34;

    var worldDNA = (window.worldDnaV62Data && window.worldDnaV62Data.currentDNA) ? window.worldDnaV62Data.currentDNA.dnaCode || "?" : "Chưa tạo";

    var religions = 0;
    try {
      if (window.countries) religions = window.countries.filter(c => c && c.religion).reduce((acc, c) => {
        if (!acc.includes(c.religion)) acc.push(c.religion); return acc;
      }, []).length;
    } catch(e) {}

    var ageStage = (typeof window.ulc81GetStage === "function") ? window.ulc81GetStage() : { icon: "?", label: "?" };

    el.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px">' +
      card("🌍", world.name || "Chưa có thế giới", "Vũ Trụ", "#4ade80") +
      card("📅", "Năm " + year.toLocaleString(), "Thời Gian", "#60a5fa") +
      card("🌟", ageStage.icon + " " + ageStage.label, "Giai Đoạn", "#facc15") +
      card("👥", npcs.filter(n=>n&&!n.dead).length + " sinh linh", "Dân Số", "#f472b6") +
      card("🏳️", countries.length + " quốc gia", "Lãnh Thổ", "#fb923c") +
      card("🙏", religions + " tôn giáo", "Tín Ngưỡng", "#a78bfa") +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">' +
      gaugeCard("💚 Sức Khỏe Vũ Trụ", healthScore, pct2color(healthScore)) +
      gaugeCard("🔗 Tích Hợp Kernel", integScore, pct2color(integScore)) +
      gaugeCard("🥽 XR Readiness", xrScore, pct2color(xrScore)) +
      gaugeCard("🌌 Multiverse", mvScore, pct2color(mvScore)) +
      '</div>' +
      '<div style="background:rgba(250,204,21,0.06);border:1px solid rgba(250,204,21,0.15);border-radius:8px;padding:10px;font-size:11px;color:rgba(232,232,240,0.7)">' +
      '<span style="color:#facc15;font-weight:600">🧬 World DNA:</span> <span style="font-family:monospace;color:#4ade80">' + worldDNA + '</span>' +
      '&nbsp;&nbsp;<span style="color:#facc15;font-weight:600">⚙️ Engines:</span> <span style="color:#60a5fa">' + engineScan.active.length + '/' + (engineScan.active.length + engineScan.inactive.length) + ' active</span>' +
      '</div>';
  }

  function card(icon, value, label, color) {
    return '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px;text-align:center">' +
      '<div style="font-size:18px">' + icon + '</div>' +
      '<div style="color:' + color + ';font-weight:700;font-size:13px;margin:3px 0">' + value + '</div>' +
      '<div style="color:rgba(232,232,240,0.45);font-size:10px">' + label + '</div>' +
      '</div>';
  }

  function gaugeCard(label, pct, color) {
    return '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
      '<span style="font-size:11px;color:rgba(232,232,240,0.7)">' + label + '</span>' +
      '<span style="font-size:12px;font-weight:700;color:' + color + '">' + pct + '%</span>' +
      '</div>' + miniBar(pct, color) + '</div>';
  }

  function renderKernel() {
    var el = document.getElementById("puos81-pane-kernel");
    if (!el) return;
    var layers = (typeof window.ukernel81SyncAll === "function") ? window.ukernel81SyncAll() : {};
    var layerDefs = (typeof window.ukernel81GetLayers === "function") ? window.ukernel81GetLayers() : [];
    var score = (typeof window.ukernel81GetIntegrationScore === "function") ? window.ukernel81GetIntegrationScore() : 0;

    var html = '<div style="background:rgba(96,165,250,0.08);border:1px solid rgba(96,165,250,0.2);border-radius:8px;padding:8px 12px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">' +
      '<span style="color:#60a5fa;font-weight:600;font-size:12px">🔮 Universe Kernel — Integration Score</span>' +
      '<span style="color:' + pct2color(score) + ';font-weight:700;font-size:18px">' + score + '%</span></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';

    for (var def of layerDefs) {
      var layerData = layers[def.id] || {};
      var status = layerData.status || { active: false, data: {} };
      var color = status.active ? (def.color || "#4ade80") : "rgba(232,232,240,0.2)";
      var dataStr = "";
      if (status.active && status.data) {
        dataStr = Object.entries(status.data).slice(0, 3).map(([k, v]) => '<span style="color:rgba(232,232,240,0.5)">' + k + ':</span> <span style="color:' + color + '">' + v + '</span>').join(" · ");
      }
      html += '<div style="background:rgba(255,255,255,0.03);border:1px solid ' + (status.active ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)") + ';border-radius:8px;padding:10px">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">' +
        '<span style="font-size:11px;font-weight:600;color:' + color + '">' + def.label + '</span>' +
        '<span style="font-size:9px;color:' + (status.active ? "#4ade80" : "#f87171") + ';border:1px solid ' + (status.active ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)") + ';border-radius:3px;padding:1px 5px">' + (status.active ? "ONLINE" : "OFFLINE") + '</span>' +
        '</div>' +
        '<div style="font-size:9px;color:rgba(232,232,240,0.4);margin-bottom:4px">' + def.description + '</div>' +
        (dataStr ? '<div style="font-size:9px">' + dataStr + '</div>' : '') +
        '</div>';
    }
    html += '</div>';
    el.innerHTML = html;
  }

  function renderServices() {
    var el = document.getElementById("puos81-pane-services");
    if (!el) return;
    var svcs = (typeof window.usm81CheckHealth === "function") ? window.usm81CheckHealth() : {};
    var activeCount = Object.values(svcs).filter(s => s.active).length;
    var total = Object.keys(svcs).length;

    var html = '<div style="font-size:11px;color:rgba(232,232,240,0.5);margin-bottom:10px">Services hoạt động: <span style="color:' + pct2color(Math.round(activeCount/Math.max(total,1)*100)) + ';font-weight:700">' + activeCount + '/' + total + '</span></div>';

    for (var svc of Object.values(svcs)) {
      var color = svc.active ? "#4ade80" : "#f87171";
      var metricsHtml = "";
      if (svc.active && svc.metrics) {
        metricsHtml = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">' +
          Object.entries(svc.metrics).map(([k, v]) =>
            '<span style="background:rgba(255,255,255,0.05);border-radius:4px;padding:2px 6px;font-size:9px;color:rgba(232,232,240,0.6)">' + k + ': <b style="color:#facc15">' + v + '</b></span>'
          ).join("") + '</div>';
      }
      html += '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px;margin-bottom:8px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
        '<span style="font-weight:600;font-size:12px;color:' + color + '">' + svc.icon + ' ' + svc.label + '</span>' +
        '<span style="font-size:9px;color:' + color + ';border:1px solid ' + color + '33;border-radius:3px;padding:1px 6px">' + (svc.active ? "RUNNING" : "STOPPED") + '</span>' +
        '</div>' +
        '<div style="font-size:10px;color:rgba(232,232,240,0.45);margin-top:3px">' + svc.description + '</div>' +
        metricsHtml + '</div>';
    }
    el.innerHTML = html;
  }

  function renderHealth() {
    var el = document.getElementById("puos81-pane-health");
    if (!el) return;
    var metrics = (typeof window.uhmon81Check === "function") ? window.uhmon81Check() : {};
    var score = (typeof window.uhmon81GetHealthScore === "function") ? window.uhmon81GetHealthScore() : 0;

    var html = '<div style="text-align:center;margin-bottom:14px">' +
      '<div style="font-size:36px;font-weight:700;color:' + pct2color(score) + '">' + score + '%</div>' +
      '<div style="font-size:11px;color:rgba(232,232,240,0.5)">Điểm Sức Khỏe Vũ Trụ Tổng Thể</div></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';

    for (var m of Object.values(metrics)) {
      var sc = statusColor(m.status);
      html += '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">' +
        '<span style="font-size:11px;color:rgba(232,232,240,0.7)">' + m.icon + ' ' + m.label + '</span>' +
        '<span style="font-size:10px;font-weight:700;color:' + sc + '">' + m.value + ' ' + m.unit + '</span></div>' +
        miniBar(m.pct, sc) + '</div>';
    }
    html += '</div>';
    el.innerHTML = html;
  }

  function renderLifecycle() {
    var el = document.getElementById("puos81-pane-lifecycle");
    if (!el) return;
    var stage = (typeof window.ulc81GetStage === "function") ? window.ulc81GetStage() : { icon: "?", label: "?", desc: "" };
    var allStages = (typeof window.ulc81GetAllStages === "function") ? window.ulc81GetAllStages() : [];
    var milestones = (typeof window.ulc81GetMilestones === "function") ? window.ulc81GetMilestones() : [];
    var progress = (typeof window.ulc81GetProgress === "function") ? window.ulc81GetProgress() : { achieved: 0, total: 0, pct: 0 };

    var html = '<div style="background:rgba(250,204,21,0.07);border:1px solid rgba(250,204,21,0.2);border-radius:8px;padding:12px;margin-bottom:12px;text-align:center">' +
      '<div style="font-size:28px">' + stage.icon + '</div>' +
      '<div style="color:#facc15;font-weight:700;font-size:14px">' + stage.label + '</div>' +
      '<div style="color:rgba(232,232,240,0.5);font-size:11px;margin-top:4px">' + (stage.desc || "") + '</div>' +
      '</div>';

    html += '<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;font-size:10px;color:rgba(232,232,240,0.5);margin-bottom:4px"><span>🏆 Milestones</span><span>' + progress.achieved + '/' + progress.total + ' (' + progress.pct + '%)</span></div>' + miniBar(progress.pct, "#facc15") + '</div>';

    html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:12px">';
    for (var s of allStages) {
      var active = s.id === stage.id;
      html += '<div style="background:rgba(255,255,255,' + (active ? "0.08" : "0.02") + ');border:1px solid rgba(255,255,255,' + (active ? "0.2" : "0.06") + ');border-radius:6px;padding:6px;text-align:center">' +
        '<div style="font-size:14px">' + s.icon + '</div>' +
        '<div style="font-size:9px;color:' + (active ? "#facc15" : "rgba(232,232,240,0.4)") + ';font-weight:' + (active ? "700" : "400") + '">' + s.label + '</div>' +
        '<div style="font-size:8px;color:rgba(232,232,240,0.3)">Năm ' + s.minYear.toLocaleString() + '+</div>' +
        '</div>';
    }
    html += '</div>';

    if (milestones.length > 0) {
      html += '<div style="font-size:10px;color:rgba(232,232,240,0.5);margin-bottom:6px">Mốc đã đạt:</div>';
      html += '<div style="display:flex;flex-wrap:wrap;gap:5px">';
      for (var m of milestones.slice(-8)) {
        html += '<span style="background:rgba(250,204,21,0.1);border:1px solid rgba(250,204,21,0.25);border-radius:4px;padding:2px 7px;font-size:9px;color:#facc15">' + m.icon + ' ' + m.label + '</span>';
      }
      html += '</div>';
    }
    el.innerHTML = html;
  }

  function renderJarvis() {
    var el = document.getElementById("puos81-pane-jarvis");
    if (!el) return;
    var profile = (typeof window.puos81GetSystemProfile === "function") ? window.puos81GetSystemProfile() : {};
    var healthReport = (typeof window.uhmon81GetJarvisReport === "function") ? window.uhmon81GetJarvisReport() : "";
    var bootLog = (typeof window.puos81GetBootLog === "function") ? window.puos81GetBootLog() : [];
    var score = (typeof window.uhmon81GetHealthScore === "function") ? window.uhmon81GetHealthScore() : 0;
    var stage = (typeof window.ulc81GetStage === "function") ? window.ulc81GetStage() : { icon: "?", label: "?" };

    var analysis = "";
    if (score >= 80) analysis = "✅ Vũ trụ của bạn đang vận hành hoàn hảo. " + (profile.activeEngines || 0) + " engine đang hoạt động, thế giới phát triển bền vững.";
    else if (score >= 50) analysis = "⚠️ Một số hệ thống cần kích hoạt. Hãy tạo thêm quốc gia, NPC và mở rộng đa vũ trụ.";
    else analysis = "🔴 Vũ trụ chưa được khởi tạo đầy đủ. Hãy tạo thế giới mới để bắt đầu.";

    var predictions = [];
    if ((window.countries || []).length < 3) predictions.push("📌 Gợi ý: Tạo thêm quốc gia để tăng độ phong phú thế giới.");
    if (!window.universeHubV73Data) predictions.push("📌 Gợi ý: Mở Universe Hub để kết nối đa vũ trụ.");
    if (!window.aiGenesisV75Data) predictions.push("📌 Gợi ý: Dùng AI Genesis V75 để tạo thế giới bằng văn bản.");
    if (predictions.length === 0) predictions.push("✨ Không có gợi ý — vũ trụ đang phát triển tốt!");

    var html = '<div style="background:rgba(96,165,250,0.07);border:1px solid rgba(96,165,250,0.2);border-radius:8px;padding:12px;margin-bottom:12px">' +
      '<div style="color:#60a5fa;font-weight:700;font-size:12px;margin-bottom:8px">🤖 Jarvis — Universe Operating Assistant</div>' +
      '<div style="font-size:11px;color:rgba(232,232,240,0.8);line-height:1.6">' + analysis + '</div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">' +
      '<div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:8px;text-align:center"><div style="color:#facc15;font-weight:700;font-size:13px">' + (profile.activeEngines || 0) + '</div><div style="font-size:9px;color:rgba(232,232,240,0.4)">Engines Active</div></div>' +
      '<div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:8px;text-align:center"><div style="color:#4ade80;font-weight:700;font-size:13px">' + score + '%</div><div style="font-size:9px;color:rgba(232,232,240,0.4)">Health Score</div></div>' +
      '<div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:8px;text-align:center"><div style="color:#c084fc;font-weight:700;font-size:13px">' + stage.icon + ' ' + stage.label + '</div><div style="font-size:9px;color:rgba(232,232,240,0.4)">Life Stage</div></div>' +
      '</div>' +
      '<div style="margin-bottom:12px">' + predictions.map(p => '<div style="font-size:10px;color:rgba(232,232,240,0.6);padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04)">' + p + '</div>').join("") + '</div>';

    if (bootLog.length > 0) {
      html += '<div style="font-size:10px;color:rgba(232,232,240,0.4);margin-bottom:6px">Boot Log:</div>' +
        '<div style="background:rgba(0,0,0,0.3);border-radius:6px;padding:8px;max-height:100px;overflow-y:auto">' +
        bootLog.slice(-5).map(l => '<div style="font-size:9px;color:rgba(232,232,240,0.5);font-family:monospace">' + l.msg + '</div>').join("") +
        '</div>';
    }
    el.innerHTML = html;
  }

  function buildPUOS() {
    var container = document.getElementById("panel-creator-hub-v32");
    if (!container) { setTimeout(buildPUOS, 500); return; }

    var wrapper = document.createElement("div");
    wrapper.id = "puos81-section-wrapper";
    wrapper.style.cssText = "margin-top:16px;border-top:1px solid rgba(250,204,21,0.15);padding-top:14px";

    var tabs = [
      { id: "overview",   label: "🪐 Tổng Quan" },
      { id: "kernel",     label: "🔮 Kernel" },
      { id: "services",   label: "⚙️ Services" },
      { id: "health",     label: "💚 Sức Khỏe" },
      { id: "lifecycle",  label: "🌟 Vòng Đời" },
      { id: "jarvis",     label: "🤖 Jarvis OS" }
    ];

    var header = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
      '<div style="font-size:12px;font-weight:700;color:#facc15;letter-spacing:1px">🪐 PERSONAL UNIVERSE OS</div>' +
      '<div style="font-size:9px;color:rgba(232,232,240,0.35);font-family:monospace" id="puos81-universe-id">' +
      ((window.puosCoreV81Data && window.puosCoreV81Data.universeId) ? window.puosCoreV81Data.universeId : "PUOS-BOOT") +
      '</div></div>';

    var tabBar = '<div style="display:flex;gap:2px;margin-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.06);overflow-x:auto">' +
      tabs.map(t =>
        '<button id="puos81-tab-' + t.id + '" onclick="window.puos81SwitchTab(\'' + t.id + '\')" style="background:none;border:none;border-bottom:2px solid transparent;padding:6px 10px;font-size:10px;cursor:pointer;white-space:nowrap;color:rgba(232,232,240,0.6);transition:all .2s">' + t.label + '</button>'
      ).join("") + '</div>';

    var panes = tabs.map(t =>
      '<div id="puos81-pane-' + t.id + '" style="display:none;min-height:120px"></div>'
    ).join("");

    wrapper.innerHTML = header + tabBar + panes;
    container.appendChild(wrapper);

    window.puos81SwitchTab = switchTab;
    switchTab("overview");

    setInterval(function() {
      if (document.getElementById("puos81-pane-" + currentTab)) {
        renderActivePane();
      }
    }, 8000);
  }

  function patchHub() {
    var _orig = window.hubRenderPanel;
    window.hubRenderPanel = function(panelId) {
      if (_orig) _orig(panelId);
      if (panelId === "creator-hub-v32") {
        setTimeout(renderActivePane, 100);
      }
    };
  }

  function init() {
    patchHub();
    setTimeout(buildPUOS, 1000);
    console.log("[PUOS Registry V81] UI khởi động — PERSONAL UNIVERSE OS sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 22100); });
  } else {
    setTimeout(init, 22100);
  }
})();
