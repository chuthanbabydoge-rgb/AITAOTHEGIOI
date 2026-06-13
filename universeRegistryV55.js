(function() {
  "use strict";

  function getYear() { return (typeof window.year === "number") ? window.year : 0; }
  function fmtMs(ms) {
    if (!ms || ms < 1000) return "0 giây";
    if (ms < 60000) return Math.floor(ms/1000) + " giây";
    if (ms < 3600000) return Math.floor(ms/60000) + " phút";
    if (ms < 86400000) return Math.floor(ms/3600000) + " giờ " + Math.floor((ms%3600000)/60000) + " phút";
    return Math.floor(ms/86400000) + " ngày " + Math.floor((ms%86400000)/3600000) + " giờ";
  }

  window.urv55RenderPersistent = function() {
    var el = document.getElementById("panel-persistent-v55");
    if (!el) return;
    var stats = (typeof window.puv55GetStats === "function") ? window.puv55GetStats() : {};
    var health = (typeof window.uhs55GetOverall === "function") ? window.uhs55GetOverall() : { score: 0, status: "Chưa tính" };
    var histStats = (typeof window.hrs55GetStats === "function") ? window.hrs55GetStats() : {};
    el.innerHTML = '<div style="padding:16px;font-family:serif;color:#e0e0e0;">' +
      '<h2 style="color:#9b59b6;text-align:center;margin-bottom:16px;">🌌 Vũ Trụ Liên Tục V55</h2>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">' +
      _card("⏱️ Thời Gian Online", fmtMs(stats.totalRealTimeMs || 0), "#1a1a2e") +
      _card("🌅 Năm Mô Phỏng", (stats.totalGameYearsSimulated || 0) + " năm", "#1a1a2e") +
      _card("🌙 Offline Lần Cuối", fmtMs(stats.lastOfflineDurationMs || 0), "#1a1a2e") +
      _card("📅 Năm Offline", (stats.lastOfflineDurationYears || 0) + " năm", "#1a1a2e") +
      _card("🔭 Sức Khỏe VT", health.score + "/100", "#1a1a2e") +
      _card("📊 Trạng Thái", health.status || "Bình Thường", "#1a1a2e") +
      _card("⚔️ Tổng Tick", (stats.tickCount || 0).toLocaleString(), "#1a1a2e") +
      _card("📜 Sự Kiện Ghi", (histStats.totalRecorded || 0) + " mục", "#1a1a2e") +
      '</div>' +
      '<div style="background:#0d0d1a;border-radius:8px;padding:12px;border-left:3px solid #9b59b6;">' +
      '<div style="color:#9b59b6;font-weight:bold;margin-bottom:8px;">📡 Tick Log Gần Nhất</div>' +
      (typeof window.puv55GetTickLog === "function" ? window.puv55GetTickLog().slice(0,5).map(function(l) {
        return '<div style="color:#ccc;font-size:0.85em;padding:2px 0;">• [Năm ' + l.year + '] ' + l.msg + '</div>';
      }).join('') || '<div style="color:#888;">Chưa có log</div>' : '<div style="color:#888;">Chưa sẵn sàng</div>') +
      '</div></div>';
  };

  window.urv55RenderTimeline = function() {
    var el = document.getElementById("panel-timeline-v55");
    if (!el) return;
    var events = (typeof window.hrs55GetTimeline === "function") ? window.hrs55GetTimeline().slice(0, 30) : [];
    el.innerHTML = '<div style="padding:16px;font-family:serif;color:#e0e0e0;">' +
      '<h2 style="color:#3498db;text-align:center;margin-bottom:16px;">⏳ Dòng Thời Gian Thế Giới</h2>' +
      (events.length === 0 ? '<div style="text-align:center;color:#888;padding:40px;">Chưa có sự kiện nào được ghi lại</div>' :
      events.map(function(e) {
        var imp = e.importance || 1;
        var border = imp >= 5 ? "#f39c12" : imp >= 3 ? "#e74c3c" : "#9b59b6";
        return '<div style="display:flex;gap:12px;margin-bottom:10px;padding:10px;background:#0d0d1a;border-radius:8px;border-left:3px solid ' + border + ';">' +
          '<div style="font-size:1.4em;flex-shrink:0;">' + (e.icon || "📜") + '</div>' +
          '<div><div style="color:#aaa;font-size:0.8em;">Năm ' + e.year + '</div>' +
          '<div style="color:#e0e0e0;font-weight:bold;">' + e.title + '</div>' +
          (e.detail ? '<div style="color:#999;font-size:0.85em;">' + e.detail + '</div>' : '') + '</div></div>';
      }).join('')) + '</div>';
  };

  window.urv55RenderDigest = function() {
    var el = document.getElementById("panel-digest-v55");
    if (!el) return;
    var digest = (typeof window.eds55GetOfflineDigest === "function") ? window.eds55GetOfflineDigest() : null;
    var online = (typeof window.eds55GetOnlineEvents === "function") ? window.eds55GetOnlineEvents(20) : [];
    el.innerHTML = '<div style="padding:16px;font-family:serif;color:#e0e0e0;">' +
      '<h2 style="color:#e67e22;text-align:center;margin-bottom:16px;">📋 Nhật Ký Sự Kiện</h2>' +
      (digest ? '<div style="background:#1a0d00;border:1px solid #e67e22;border-radius:10px;padding:14px;margin-bottom:16px;">' +
        '<div style="color:#e67e22;font-weight:bold;font-size:1.1em;margin-bottom:8px;">🌙 Báo Cáo Offline — ' + digest.offlineYears + ' Năm</div>' +
        '<div style="color:#ddd;margin-bottom:10px;">' + digest.summary + '</div>' +
        digest.sections.map(function(s) {
          return '<div style="margin:8px 0;"><span style="color:#f39c12;font-weight:bold;">' + s.icon + ' ' + s.title + '</span>' +
            s.items.slice(0,3).map(function(i) { return '<div style="color:#ccc;font-size:0.85em;padding-left:16px;">• ' + i + '</div>'; }).join('') + '</div>';
        }).join('') +
        '<button onclick="window.eds55ShowDigest()" style="margin-top:8px;background:#e67e22;color:#fff;border:none;padding:6px 14px;border-radius:5px;cursor:pointer;">📜 Xem Chi Tiết</button>' +
        '</div>' : '<div style="background:#0d0d1a;border-radius:8px;padding:12px;color:#888;text-align:center;margin-bottom:16px;">Không có báo cáo offline</div>') +
      '<div style="color:#e67e22;font-weight:bold;margin-bottom:8px;">🔴 Sự Kiện Online Gần Đây</div>' +
      (online.length === 0 ? '<div style="color:#888;text-align:center;padding:20px;">Chưa có sự kiện</div>' :
      online.map(function(e) {
        return '<div style="padding:6px 10px;margin:4px 0;background:#0d0d1a;border-radius:6px;display:flex;gap:8px;">' +
          '<span>' + (e.icon || "📌") + '</span><span style="color:#ddd;font-size:0.9em;">[Năm ' + e.year + '] ' + e.title + '</span></div>';
      }).join('')) + '</div>';
  };

  window.urv55RenderHealth = function() {
    var el = document.getElementById("panel-health-v55");
    if (!el) return;
    var metrics = (typeof window.uhs55GetMetrics === "function") ? window.uhs55GetMetrics() : {};
    var overall = (typeof window.uhs55GetOverall === "function") ? window.uhs55GetOverall() : { score: 0, status: "..." };
    var alerts = (typeof window.uhs55GetAlerts === "function") ? window.uhs55GetAlerts() : [];
    el.innerHTML = '<div style="padding:16px;font-family:serif;color:#e0e0e0;">' +
      '<h2 style="color:#2ecc71;text-align:center;margin-bottom:4px;">🔭 Sức Khỏe Vũ Trụ</h2>' +
      '<div style="text-align:center;font-size:2.5em;margin:8px 0;">' + overall.score + '</div>' +
      '<div style="text-align:center;color:#aaa;margin-bottom:16px;">' + overall.status + '</div>' +
      Object.values(metrics).map(function(m) {
        var color = m.score >= 70 ? "#2ecc71" : m.score >= 40 ? "#f39c12" : "#e74c3c";
        var pct = m.score + "%";
        return '<div style="margin:8px 0;">' +
          '<div style="display:flex;justify-content:space-between;margin-bottom:3px;">' +
          '<span>' + m.icon + ' ' + m.label + '</span><span style="color:' + color + ';">' + m.score + '/100</span></div>' +
          '<div style="height:6px;background:#1a1a2e;border-radius:3px;overflow:hidden;">' +
          '<div style="height:100%;width:' + pct + ';background:' + color + ';border-radius:3px;transition:width 0.5s;"></div></div></div>';
      }).join('') +
      (alerts.length > 0 ? '<div style="margin-top:14px;padding:10px;background:#2d0a0a;border-radius:8px;border-left:3px solid #e74c3c;">' +
        '<div style="color:#e74c3c;font-weight:bold;margin-bottom:6px;">⚠️ Cảnh Báo</div>' +
        alerts.map(function(a) { return '<div style="color:#f5b7b1;font-size:0.9em;">• ' + a.icon + ' ' + a.msg + '</div>'; }).join('') +
        '</div>' : '') + '</div>';
  };

  window.urv55RenderReplay = function() {
    var el = document.getElementById("panel-replay-v55");
    if (!el) return;
    var wars = (typeof window.histReplayData !== "undefined") ? (window.histReplayData.wars || []) : [];
    var eras = (typeof window.histReplayData !== "undefined") ? (window.histReplayData.eraChanges || []) : [];
    var disasters = (typeof window.histReplayData !== "undefined") ? (window.histReplayData.disasters || []) : [];
    var heroes = (typeof window.histReplayData !== "undefined") ? (window.histReplayData.heroMoments || []) : [];
    el.innerHTML = '<div style="padding:16px;font-family:serif;color:#e0e0e0;">' +
      '<h2 style="color:#3498db;text-align:center;margin-bottom:16px;">🎬 Tái Hiện Lịch Sử</h2>' +
      _section("⚔️ Chiến Tranh", wars.slice(0,5).map(function(w) { return "Năm " + w.year + ": " + w.attacker + " vs " + w.defender + " → " + w.outcome; })) +
      _section("🌅 Chuyển Đổi Kỷ Nguyên", eras.slice(0,5).map(function(e) { return "Năm " + e.year + ": " + e.fromEra + " → " + e.toEra; })) +
      _section("🌋 Thảm Họa", disasters.slice(0,5).map(function(d) { return "Năm " + d.year + ": " + d.type + " tại " + d.region + " (Mức " + d.severity + ")"; })) +
      _section("⭐ Anh Hùng", heroes.slice(0,5).map(function(h) { return "Năm " + h.year + ": " + h.hero + " — " + h.achievement; })) +
      '</div>';
  };

  window.urv55RenderAnalytics = function() {
    var el = document.getElementById("panel-analytics-v55");
    if (!el) return;
    var jarvisHealth = (typeof window.uhs55GetJarvisReport === "function") ? window.uhs55GetJarvisReport() : "";
    var jarvisChron = (typeof window.hrs55GetJarvisChronicle === "function") ? window.hrs55GetJarvisChronicle() : "";
    var puStats = (typeof window.puv55GetStats === "function") ? window.puv55GetStats() : {};
    var digestStats = (typeof window.eds55GetStats === "function") ? window.eds55GetStats() : {};
    el.innerHTML = '<div style="padding:16px;font-family:serif;color:#e0e0e0;">' +
      '<h2 style="color:#9b59b6;text-align:center;margin-bottom:16px;">📊 Jarvis Chronicle Mode</h2>' +
      '<div style="background:#1a0d2e;border-radius:10px;padding:14px;margin-bottom:14px;border-left:3px solid #9b59b6;white-space:pre-line;font-size:0.9em;color:#e0e0e0;">' + (jarvisChron || "Đang tải...") + '</div>' +
      '<div style="background:#0d1a0d;border-radius:10px;padding:14px;margin-bottom:14px;border-left:3px solid #2ecc71;white-space:pre-line;font-size:0.9em;color:#e0e0e0;">' + (jarvisHealth || "Đang tải...") + '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">' +
      _card("🌙 Digest", (digestStats.hasOfflineDigest ? digestStats.offlineYears + " năm" : "Không có"), "#1a1a2e") +
      _card("🎮 Sessions", (puStats.tickCount || 0).toLocaleString() + " tick", "#1a1a2e") +
      _card("🌍 Online Events", (digestStats.onlineEvents || 0) + " sự kiện", "#1a1a2e") +
      '</div></div>';
  };

  function _card(label, value, bg) {
    return '<div style="background:' + bg + ';border-radius:8px;padding:12px;text-align:center;border:1px solid #333;">' +
      '<div style="color:#888;font-size:0.8em;">' + label + '</div>' +
      '<div style="color:#e0e0e0;font-weight:bold;font-size:1.1em;margin-top:4px;">' + value + '</div></div>';
  }

  function _section(title, items) {
    return '<div style="margin-bottom:14px;background:#0d0d1a;border-radius:8px;padding:12px;">' +
      '<div style="color:#9b59b6;font-weight:bold;margin-bottom:8px;">' + title + ' (' + items.length + ')</div>' +
      (items.length === 0 ? '<div style="color:#888;font-size:0.85em;">Chưa có dữ liệu</div>' :
      items.map(function(i) { return '<div style="color:#ccc;font-size:0.85em;padding:2px 0;">• ' + i + '</div>'; }).join('')) + '</div>';
  }

  window.universeV55HubRenderPanel = function() {
    var tabs = [
      { id: "persistent", label: "🌌 Vũ Trụ", fn: "urv55RenderPersistent" },
      { id: "timeline",   label: "⏳ Timeline", fn: "urv55RenderTimeline" },
      { id: "digest",     label: "📋 Digest",  fn: "urv55RenderDigest" },
      { id: "health",     label: "🔭 Sức Khỏe",fn: "urv55RenderHealth" },
      { id: "replay",     label: "🎬 Lịch Sử", fn: "urv55RenderReplay" },
      { id: "analytics",  label: "📊 Analytics",fn: "urv55RenderAnalytics" }
    ];

    var navHtml = '<div style="display:flex;flex-wrap:wrap;gap:6px;padding:10px;background:#0d0d1a;border-bottom:1px solid #9b59b6;">' +
      tabs.map(function(t) {
        return '<button onclick="window.' + t.fn + '();document.querySelectorAll(\'[data-v55tab]\').forEach(function(p){p.style.display=\'none\'});var pp=document.getElementById(\'panel-' + t.id + '-v55\');if(pp){pp.style.display=\'\';}" ' +
          'style="padding:6px 10px;background:#1a1a2e;color:#ccc;border:1px solid #9b59b6;border-radius:5px;cursor:pointer;font-size:0.82em;">' + t.label + '</button>';
      }).join('') + '</div>';

    tabs.forEach(function(t) {
      var p = document.getElementById("panel-" + t.id + "-v55");
      if (p) p.setAttribute("data-v55tab", "1");
    });

    return navHtml;
  };

  function patchMvHub() {
    var existing = window.mvHubRenderPanel;
    if (!existing) return;
    window.mvHubRenderPanel = function() {
      existing();
      var container = document.getElementById("panel-multiverse-hub-v35");
      if (!container) return;

      var v55Section = document.getElementById("v55-hub-section");
      if (!v55Section) {
        v55Section = document.createElement("div");
        v55Section.id = "v55-hub-section";
        v55Section.style.cssText = "margin-top:16px;border-top:2px solid #9b59b6;padding-top:12px;";
        v55Section.innerHTML = '<div style="color:#9b59b6;font-weight:bold;font-size:1.1em;padding:8px 12px;background:#0d0d1a;">🌌 V55 — Persistent Universe</div>' +
          window.universeV55HubRenderPanel();
        container.appendChild(v55Section);
      }

      var panels = ["persistent","timeline","digest","health","replay","analytics"];
      panels.forEach(function(id) {
        var p = document.getElementById("panel-" + id + "-v55");
        if (p && !container.contains(p)) container.appendChild(p);
      });

      if (typeof window.urv55RenderPersistent === "function") window.urv55RenderPersistent();
    };
  }

  function init() {
    patchMvHub();
    console.log("[UniverseRegistryV55] 🌌 UI Hub V55 khởi động — 6 tabs (Vũ Trụ/Timeline/Digest/Sức Khỏe/Lịch Sử/Analytics) trong multiverse-hub-v35 sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 8800); });
  } else {
    setTimeout(init, 8800);
  }
})();
