(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════
  // TIMELINE REPLAY REGISTRY V122 — Dynamic Inject + gameTick + Unlock
  // ═══════════════════════════════════════════════════════════════════

  function injectUI() {
    // ── NAV BUTTON ────────────────────────────────────────────────
    if (!document.getElementById("btn-TIMELINE-REPLAY")) {
      var sidebar = document.querySelector(".sidebar-nav") || document.querySelector("#sidebar-nav") || document.querySelector("nav");
      if (!sidebar) {
        // fallback: find any nav containing existing buttons
        var anyBtn = document.getElementById("btn-kingdoms") || document.getElementById("btn-multiverse-hub-v35");
        if (anyBtn) sidebar = anyBtn.parentElement;
      }
      if (sidebar) {
        var btn = document.createElement("button");
        btn.id          = "btn-TIMELINE-REPLAY";
        btn.className   = "nav-btn";
        btn.style.cssText = "display:block";
        btn.setAttribute("data-panel", "TIMELINE-REPLAY");
        btn.innerHTML   = "📽️ Timeline Replay";
        btn.onclick = function() {
          if (typeof showPanel === "function") showPanel("TIMELINE-REPLAY");
          if (typeof window.tr122RenderPanel === "function") window.tr122RenderPanel();
        };
        sidebar.appendChild(btn);
      }
    }

    // ── PANEL DIV ─────────────────────────────────────────────────
    if (!document.getElementById("panel-TIMELINE-REPLAY")) {
      var container = document.querySelector("#panels") || document.querySelector(".panels") || document.querySelector("main") || document.body;
      var div = document.createElement("div");
      div.id        = "panel-TIMELINE-REPLAY";
      div.className = "panel";
      div.style.cssText = "display:none;height:100%;overflow-y:auto";
      container.appendChild(div);
    }

    // ── Unlock: add to v23Panels if function available ────────────
    try {
      var allPanels = ["kingdoms","empires","bloodlines","noble-houses","succession",
        "historical-timeline","rankings","diplomacy","espionage","political-religion",
        "culture-heritage","project-status","next-version","story","diplomacy-hub-v24",
        "alliance-v24","sanctions-v24","event-hub-v25","continent-hub-v26","ocean-hub-v27",
        "cultivation-hub-v29","divine-hub-v30","combat-hub-v31","player-hub-v28",
        "creator-hub-v32","guardian-hub-v33","multiplayer","performance","multiverse-hub-v35",
        "TIMELINE-REPLAY"];
      allPanels.forEach(function(p) {
        var btn2 = document.getElementById("btn-" + p);
        if (btn2) { btn2.classList.remove("ec-hidden"); btn2.style.display = ""; }
      });
    } catch(e) {}
  }

  // ── Patch showPanel to handle TIMELINE-REPLAY ─────────────────────
  function hookShowPanel() {
    var _origSP = window.showPanel;
    window.showPanel = function(panelId) {
      if (_origSP) _origSP.call(this, panelId);
      if (panelId === "TIMELINE-REPLAY") {
        // hide all panels, show ours
        document.querySelectorAll(".panel").forEach(function(el){ el.style.display = "none"; });
        var p = document.getElementById("panel-TIMELINE-REPLAY");
        if (p) p.style.display = "block";
        if (typeof window.tr122RenderPanel === "function") window.tr122RenderPanel();
      }
    };
  }

  // ── PUOS: patch puosRenderMyUniverse to add quick link ───────────
  function patchPUOS() {
    var _orig = window.puosRenderMyUniverse;
    window.puosRenderMyUniverse = function(container) {
      if (_orig) _orig.call(this, container);
      try {
        // Add Timeline Replay quick-access card to PUOS if container found
        var el = typeof container === "string" ? document.getElementById(container) : container;
        if (!el) el = document.getElementById("puos-main-content");
        if (el) {
          var existing = el.querySelector("#tr122-puos-card");
          if (!existing) {
            var card = document.createElement("div");
            card.id = "tr122-puos-card";
            card.style.cssText = "background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);border-radius:10px;padding:10px;margin-top:10px;cursor:pointer";
            card.innerHTML = '<div style="font-size:13px;font-weight:800;color:#c4b5fd">📽️ Timeline Replay</div>' +
              '<div style="font-size:11px;color:#94a3b8;margin-top:2px">' + (window.trV122Data ? window.trV122Data.snapshots.length : 0) + ' snapshots lịch sử · Bấm để xem</div>';
            card.onclick = function() {
              if (typeof showPanel === "function") showPanel("TIMELINE-REPLAY");
              if (typeof window.tr122RenderPanel === "function") window.tr122RenderPanel();
            };
            el.appendChild(card);
          }
        }
      } catch(e) {}
    };
  }

  // ── Seed initial snapshots from htData if available ───────────────
  function seedFromHistory() {
    var d     = window.trV122Data;
    var htEvs = (window.htData && window.htData.events) ? window.htData.events : [];
    if (!htEvs.length || d.snapshots.length > 5) return;

    // Group events by year ranges and pick key moments
    var TRIGGERS = new Set([
      "kingdom_founded","kingdom_collapsed","empire_founded","empire_collapsed",
      "wonder_built","succession_civil_war","bloodline_hero","house_war","ruler_death"
    ]);
    var keyEvs = htEvs.filter(function(e){ return TRIGGERS.has(e.type); });

    // Bucket into year groups of 50
    var buckets = {};
    keyEvs.forEach(function(ev) {
      var bucket = Math.floor(ev.year / 50) * 50;
      if (!buckets[bucket] || ev.importance === "high") buckets[bucket] = ev;
    });

    Object.keys(buckets).sort(function(a,b){ return a-b; }).forEach(function(b) {
      var ev = buckets[b];
      if (ev) {
        var prevYear = (typeof year !== "undefined") ? year : 0;
        // temporarily fake year for snapshot
        if (typeof year !== "undefined") { /* can't reassign global year */ }
        var snap = {
          id:         "snap_seed_" + b,
          year:       ev.year,
          civStates:  [],
          population: 0,
          wars:       [],
          figureSnap: [],
          reason:     (ev.text || ev.title || ev.type),
          reasonType: ev.type,
          ts:         Date.now()
        };
        // Only add if no snap nearby
        var exists = d.snapshots.some(function(s){ return Math.abs(s.year - snap.year) < 20; });
        if (!exists) {
          d.snapshots.push(snap);
          d.totalEvents++;
        }
      }
    });
    // Sort snapshots by year
    d.snapshots.sort(function(a,b){ return a.year - b.year; });
    console.log("[TR122 Registry] 🌱 Seeded " + d.snapshots.length + " snapshots từ lịch sử htData.");
  }

  // ── Seed historical figures from npcs ─────────────────────────────
  function seedFigures() {
    try {
      var d      = window.trV122Data;
      var npcList= (window.npcs && Array.isArray(window.npcs)) ? window.npcs : [];
      var notable = npcList.filter(function(n){
        return n && (n.realm >= 5 || n.isKing || n.isEmperor || n.isFounder || n.role === "hero" || n.role === "prophet");
      }).slice(0, 50);
      notable.forEach(function(n) {
        if (typeof window.tr122AddFigure === "function") {
          var emoji = n.isEmperor ? "⚡" : n.isKing ? "👑" : n.role === "hero" ? "🦸" : n.role === "prophet" ? "🔮" : "⭐";
          window.tr122AddFigure(
            n.name || "Vô Danh",
            n.role || (n.isEmperor ? "emperor" : n.isKing ? "king" : "notable"),
            n.country || n.sect || null,
            "Năm sinh: " + (n.birthYear||"?") + " · Cảnh giới: " + (n.realm||1),
            emoji
          );
        }
      });
    } catch(e) {}
  }

  // ── Init ─────────────────────────────────────────────────────────
  function init() {
    injectUI();
    hookShowPanel();
    patchPUOS();

    // Seed from historical data after engines are ready
    setTimeout(function() {
      seedFromHistory();
      seedFigures();
      // Force initial snapshot
      if (typeof window.tr122Capture === "function") {
        window.tr122Capture("Khởi Đầu Thế Giới", "init");
      }
      // Render if panel is active
      var p = document.getElementById("panel-TIMELINE-REPLAY");
      if (p && p.style.display !== "none") {
        if (typeof window.tr122RenderPanel === "function") window.tr122RenderPanel();
      }
    }, 3000);

    // Periodic re-seed every 60s (catches new events)
    setInterval(function() {
      seedFigures();
    }, 60000);

    console.log("[TimelineReplayRegistry V122] 📋 Registry khởi động — Tab injected · PUOS patched · Ready.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 29200); });
  } else {
    setTimeout(init, 29200);
  }
})();
