(function() {
  "use strict";

  // ============================================================
  // V120 – CIV AI REGISTRY (Phase 7: Report + UI)
  // Inject UI vào PUOS My Universe panel (theo V38 rule)
  // gameTick hook chính + auto-sync + save
  // ============================================================

  var SAVE_KEY = "cgv6_civ_ai_registry_v120";
  var INIT_MS  = 28400;

  // ── Render panel HTML ─────────────────────────────────────────
  function renderCivAIPanel() {
    var D    = window.civAIV120Data;
    if (!D) return '<div style="color:#6b7280;padding:20px;">CivAI V120 chưa sẵn sàng...</div>';

    var civs = Object.values(D.civs);

    // ── Stats tổng hợp ────────────────────────────────────────
    var totalTech = civs.reduce(function(s, c) {
      return s + Object.values(c.technology || {}).reduce(function(a, v) { return a + v; }, 0);
    }, 0);

    var totalAlliances = civs.reduce(function(s, c) {
      return s + Object.values(c.relations || {}).filter(function(r) { return r.relation === 'ally'; }).length;
    }, 0) / 2;

    var totalWars = civs.reduce(function(s, c) {
      return s + (c.stats.warsStarted || 0);
    }, 0);

    var html = '<div style="font-family:monospace;padding:10px;color:#e2e8f0;">';

    // Header
    html += '<div style="background:linear-gradient(135deg,#1e293b,#0f172a);border:1px solid #334155;border-radius:8px;padding:12px;margin-bottom:10px;">'
      + '<div style="font-size:16px;font-weight:bold;color:#f1f5f9;margin-bottom:8px;">🧠 Autonomous Civilization AI V120</div>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">'
      + statBox("🏛️ Civs đang hoạt động", civs.length)
      + statBox("🎯 Tổng quyết định AI", D.totalDecisions)
      + statBox("🤝 Liên minh hình thành", Math.floor(totalAlliances))
      + statBox("⚔️ Chiến tranh nổ ra", D.totalWars)
      + statBox("🔬 Công nghệ khám phá", D.totalTechDiscoveries)
      + statBox("📜 Sự kiện lịch sử", (D.history || []).length)
      + '</div>'
      + '</div>';

    if (civs.length === 0) {
      html += '<div style="color:#6b7280;font-style:italic;text-align:center;padding:20px;">'
        + '⏳ Chưa có văn minh. Tạo thế giới để AI khởi động...</div>';
      html += '</div>';
      return html;
    }

    // ── Tabs ─────────────────────────────────────────────────
    var tabId = 'civai120-tab';
    html += '<div style="display:flex;gap:4px;margin-bottom:8px;">'
      + tabBtn(tabId, 'civs',      '🏛️ Civs')
      + tabBtn(tabId, 'history',   '📜 Lịch Sử')
      + tabBtn(tabId, 'diplo',     '🌐 Ngoại Giao')
      + tabBtn(tabId, 'tech',      '🔬 Công Nghệ')
      + '</div>';

    // ── Tab content: Civs ──────────────────────────────────────
    html += '<div id="civai120-panel-civs" class="civai120-panel">';
    civs.slice(0, 12).forEach(function(ai) {
      var strat   = ai.currentStrategy || 'neutral';
      var stratIcons = { expand:'🗺️', research:'🔬', trade:'💰', alliance:'🤝', war:'⚔️', religion:'🙏', explore:'🧭', neutral:'😐' };
      var icon    = stratIcons[strat] || '😐';
      var allies  = Object.values(ai.relations || {}).filter(function(r) { return r.relation === 'ally'; }).length;
      var enemies = Object.values(ai.relations || {}).filter(function(r) { return r.relation === 'war' || r.relation === 'enemy'; }).length;

      html += '<div style="background:#1e293b;border:1px solid #334155;border-radius:6px;padding:8px;margin-bottom:6px;">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">'
        + '<span style="font-size:13px;font-weight:bold;color:#f1f5f9;">🏛️ ' + escH(ai.name) + '</span>'
        + '<span style="font-size:11px;color:#94a3b8;background:#0f172a;padding:2px 6px;border-radius:10px;">' + escH(ai.personality.archetype || '—') + '</span>'
        + '</div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;font-size:11px;color:#94a3b8;">'
        + '<span>' + icon + ' ' + strat + '</span>'
        + '<span>🤝 ' + allies + ' đồng minh</span>'
        + '<span>⚔️ ' + enemies + ' thù</span>'
        + '</div>'
        + '<div style="display:flex;gap:6px;margin-top:4px;">'
        + traitBar("Aggr", ai.personality.aggression, "#ef4444")
        + traitBar("Diplo", ai.personality.diplomacy, "#10b981")
        + traitBar("Curio", ai.personality.curiosity, "#3b82f6")
        + traitBar("Spirit", ai.personality.spirituality, "#a855f7")
        + '</div>'
        + '<div style="font-size:10px;color:#475569;margin-top:4px;">'
        + '📊 ' + (ai.stats.totalDecisions || 0) + ' quyết định · '
        + '🔬 ' + (ai.stats.technologiesDiscovered || 0) + ' công nghệ · '
        + 'Năm ' + (ai.stats.lastDecisionYear || '—')
        + '</div>'
        + '</div>';
    });
    if (civs.length > 12) html += '<div style="color:#6b7280;font-size:11px;text-align:center;">...và ' + (civs.length - 12) + ' văn minh khác</div>';
    html += '</div>';

    // ── Tab content: Lịch Sử ─────────────────────────────────
    html += '<div id="civai120-panel-history" class="civai120-panel" style="display:none;">';
    html += typeof window.civAIRenderHistory === 'function' ? window.civAIRenderHistory(25) : '<div style="color:#6b7280;">Lịch sử chưa sẵn sàng</div>';
    html += '</div>';

    // ── Tab content: Ngoại Giao ───────────────────────────────
    html += '<div id="civai120-panel-diplo" class="civai120-panel" style="display:none;">';
    html += renderDiploPanel(civs);
    html += '</div>';

    // ── Tab content: Công Nghệ ────────────────────────────────
    html += '<div id="civai120-panel-tech" class="civai120-panel" style="display:none;">';
    html += renderTechPanel(civs);
    html += '</div>';

    html += '</div>';
    return html;
  }

  // ── Diplomacy panel ───────────────────────────────────────────
  function renderDiploPanel(civs) {
    var pairs = [];
    for (var i = 0; i < civs.length; i++) {
      for (var j = i + 1; j < civs.length; j++) {
        var a = civs[i], b = civs[j];
        var relA = (a.relations || {})[b.id] || { relation: 'neutral', score: 0 };
        pairs.push({ a: a.name, b: b.name, rel: relA.relation, score: relA.score || 0 });
      }
    }
    if (pairs.length === 0) return '<div style="color:#6b7280;padding:10px;">Chưa đủ văn minh để ngoại giao.</div>';

    var relColors = { ally:'#10b981', friendly:'#84cc16', neutral:'#6b7280', enemy:'#f97316', war:'#ef4444' };
    var relIcons  = { ally:'🤝', friendly:'😊', neutral:'😐', enemy:'😠', war:'⚔️' };

    var html = '<div style="display:flex;flex-direction:column;gap:4px;">';
    pairs.slice(0, 20).forEach(function(p) {
      var col = relColors[p.rel] || '#6b7280';
      var ico = relIcons[p.rel]  || '😐';
      html += '<div style="background:#1e293b;border-left:3px solid ' + col + ';padding:6px 8px;border-radius:4px;display:flex;justify-content:space-between;align-items:center;">'
        + '<span style="font-size:12px;color:#e2e8f0;">' + escH(p.a) + ' ↔ ' + escH(p.b) + '</span>'
        + '<span style="font-size:11px;color:' + col + ';">' + ico + ' ' + p.rel + ' (' + (p.score > 0 ? '+' : '') + p.score + ')</span>'
        + '</div>';
    });
    html += '</div>';
    return html;
  }

  // ── Tech panel ────────────────────────────────────────────────
  function renderTechPanel(civs) {
    if (civs.length === 0) return '<div style="color:#6b7280;padding:10px;">Chưa có văn minh.</div>';

    var BRANCHES = ['military','science','culture','agriculture','maritime','construction','magic','trade'];
    var ICONS    = { military:'⚔️', science:'🔬', culture:'🎨', agriculture:'🌾', maritime:'⛵', construction:'🏛️', magic:'✨', trade:'💰' };

    var html = '<div style="overflow-x:auto;">';
    html += '<table style="width:100%;border-collapse:collapse;font-size:11px;">';
    html += '<tr style="color:#64748b;border-bottom:1px solid #334155;">'
      + '<th style="text-align:left;padding:4px;width:100px;">Văn Minh</th>';
    BRANCHES.forEach(function(b) { html += '<th style="padding:4px;text-align:center;">' + ICONS[b] + '</th>'; });
    html += '</tr>';

    civs.slice(0, 10).forEach(function(ai) {
      html += '<tr style="border-bottom:1px solid #1e293b;">'
        + '<td style="padding:4px;color:#94a3b8;max-width:100px;overflow:hidden;white-space:nowrap;">' + escH(ai.name.slice(0, 12)) + '</td>';
      BRANCHES.forEach(function(b) {
        var lv = (ai.technology || {})[b] || 0;
        var stars = '★'.repeat(lv) + '☆'.repeat(5 - lv);
        var col = lv >= 4 ? '#f59e0b' : lv >= 2 ? '#10b981' : '#475569';
        html += '<td style="text-align:center;padding:4px;color:' + col + ';font-size:9px;">' + stars + '</td>';
      });
      html += '</tr>';
    });
    html += '</table></div>';
    return html;
  }

  // ── UI Helpers ────────────────────────────────────────────────
  function statBox(label, value) {
    return '<div style="background:#0f172a;border:1px solid #1e293b;border-radius:4px;padding:6px;text-align:center;">'
      + '<div style="font-size:18px;font-weight:bold;color:#f1f5f9;">' + (value || 0) + '</div>'
      + '<div style="font-size:9px;color:#64748b;margin-top:2px;">' + label + '</div>'
      + '</div>';
  }

  function traitBar(label, value, color) {
    var pct = Math.max(0, Math.min(100, value || 0));
    return '<div style="flex:1;">'
      + '<div style="font-size:9px;color:#475569;margin-bottom:2px;">' + label + ' ' + pct + '</div>'
      + '<div style="height:4px;background:#1e293b;border-radius:2px;">'
      + '<div style="height:4px;width:' + pct + '%;background:' + color + ';border-radius:2px;"></div>'
      + '</div></div>';
  }

  function tabBtn(groupId, tabId, label) {
    return '<button onclick="civai120ShowTab(\'' + tabId + '\')" '
      + 'id="' + groupId + '-btn-' + tabId + '" '
      + 'style="padding:4px 10px;border:1px solid #334155;background:#1e293b;color:#94a3b8;border-radius:4px;cursor:pointer;font-size:11px;">'
      + label + '</button>';
  }

  window.civai120ShowTab = function(tabId) {
    document.querySelectorAll('.civai120-panel').forEach(function(p) { p.style.display = 'none'; });
    var target = document.getElementById('civai120-panel-' + tabId);
    if (target) target.style.display = 'block';
  };

  function escH(s) {
    return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── Inject vào PUOS My Universe panel ────────────────────────
  function injectIntoMyUniverse() {
    if (typeof window.puosRenderMyUniverse !== 'function') return false;
    var _orig = window.puosRenderMyUniverse;
    window.puosRenderMyUniverse = function() {
      var result = _orig.apply(this, arguments);
      try {
        setTimeout(function() {
          var container = document.getElementById('puos-panel-my-universe');
          if (!container) return;
          var existing = document.getElementById('civai120-wrapper');
          if (!existing) {
            var wrapper = document.createElement('div');
            wrapper.id  = 'civai120-wrapper';
            wrapper.style.cssText = 'margin-top:12px;';
            container.appendChild(wrapper);
          }
          var w = document.getElementById('civai120-wrapper');
          if (w) w.innerHTML = renderCivAIPanel();
        }, 100);
      } catch(e) {}
      return result;
    };
    return true;
  }

  // ── Main gameTick hook: sync civs + evaluate mỗi tick ────────
  function hookMainTick() {
    var _lastSyncYear = 0;
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig.apply(this, arguments);

      var yr = window.year || 1;

      // Sync civs mỗi 50 năm
      if (yr - _lastSyncYear >= 50) {
        _lastSyncYear = yr;
        try {
          var D = window.civAIV120Data;
          if (D) {
            if (typeof window.civAISyncFromV95 === 'function') window.civAISyncFromV95();
            if (typeof window.civAIEvaluateAll === 'function') window.civAIEvaluateAll(yr);
          }
        } catch(e) {}
      }
    };
  }

  // ── Periodic save (every 5 min real time) ─────────────────────
  function startAutoSave() {
    setInterval(function() {
      try {
        var D = window.civAIV120Data;
        if (D) {
          var toSave = {
            totalDecisions:      D.totalDecisions,
            totalAlliances:      D.totalAlliances,
            totalWars:           D.totalWars,
            totalTechDiscoveries: D.totalTechDiscoveries,
            historyCount:        (D.history || []).length,
          };
          localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
        }
      } catch(e) {}
    }, 300000);
  }

  // ── Public report API ─────────────────────────────────────────
  window.civAIReport = function() {
    var D    = window.civAIV120Data;
    if (!D)  return { error: "CivAI V120 chưa sẵn sàng" };
    var civs = Object.values(D.civs);

    return {
      activeCivs:       civs.length,
      totalDecisions:   D.totalDecisions,
      totalAlliances:   D.totalAlliances,
      totalWars:        D.totalWars,
      totalTechDisc:    D.totalTechDiscoveries,
      historyEvents:    (D.history || []).length,
      civDetails: civs.map(function(ai) {
        return {
          name:        ai.name,
          archetype:   ai.personality.archetype,
          strategy:    ai.currentStrategy,
          decisions:   ai.stats.totalDecisions,
          alliances:   ai.stats.alliancesFormed,
          wars:        ai.stats.warsStarted,
          techTotal:   Object.values(ai.technology || {}).reduce(function(s, v) { return s + v; }, 0),
          memories:    (ai.memories || []).length,
        };
      }),
    };
  };

  // ── Init ──────────────────────────────────────────────────────
  function init() {
    hookMainTick();
    startAutoSave();

    // Inject UI sau khi brain đã khởi động
    var _retry = 0;
    var _wait = setInterval(function() {
      _retry++;
      var done = injectIntoMyUniverse();
      if (done || _retry > 20) {
        clearInterval(_wait);
        if (done) {
          console.log("[CivAI Registry V120] 🏛️ UI injected vào PUOS My Universe.");
        }
      }
    }, 500);

    console.log("[CivAI Registry V120] 📋 V120 Autonomous Civilization AI — Brain · Decision · Memory · Diplomacy · TechTree · History · Registry · window.civAIReport() sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, INIT_MS); });
  } else {
    setTimeout(init, INIT_MS);
  }
})();
