(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════
  // TIMELINE REPLAY ENGINE V122 — Historical Snapshot & Replay Core
  // ═══════════════════════════════════════════════════════════════════
  const SAVE_KEY      = "cgv6_timeline_replay_v122";
  const MAX_SNAPSHOTS = 200;
  const MAX_FIGURES   = 300;

  // ── EVENT TYPES that trigger a snapshot ─────────────────────────
  const SNAPSHOT_TRIGGERS = new Set([
    "kingdom_founded","kingdom_collapsed","empire_founded","empire_collapsed",
    "wonder_built","succession_civil_war","succession_collapse","bloodline_hero",
    "war_start","war_end","colony","ideology","continent","discovery",
    "species_emerge","civ_found","civ_stage","disaster","plague",
    "house_rebel","house_war","house_extinct","ruler_death",
    "mv_conquest","ai_event","universe"
  ]);

  // ── DEFAULT DATA ─────────────────────────────────────────────────
  function defaultData() {
    return {
      snapshots:        [],   // [{id,year,civStates,population,wars,figures,reason,reasonType}]
      figures:          [],   // [{id,name,role,year,civName,note,emoji}]
      playhead:         0,    // index into snapshots currently shown in replay
      playing:          false,
      speed:            1,    // 1|2|5|10
      lastSnapshotYear: -9999,
      minYearGap:       10,   // minimum years between event-snapshots
      totalEvents:      0,
      totalWars:        0,
      totalDiscoveries: 0,
      version:          122
    };
  }

  window.trV122Data = window.trV122Data || defaultData();

  // ── SAVE / LOAD ──────────────────────────────────────────────────
  function save() {
    try {
      var slim = Object.assign({}, window.trV122Data);
      // trim snapshots to MAX
      if (slim.snapshots.length > MAX_SNAPSHOTS) {
        slim.snapshots = slim.snapshots.slice(-MAX_SNAPSHOTS);
      }
      if (slim.figures.length > MAX_FIGURES) {
        slim.figures = slim.figures.slice(-MAX_FIGURES);
      }
      localStorage.setItem(SAVE_KEY, JSON.stringify(slim));
    } catch(e) {}
  }

  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        var p = JSON.parse(raw);
        if (p && p.version === 122) {
          window.trV122Data = Object.assign(defaultData(), p);
        }
      }
    } catch(e) {}
  }

  // ── CAPTURE WORLD SNAPSHOT ───────────────────────────────────────
  function captureSnapshot(reason, reasonType) {
    var d    = window.trV122Data;
    var yr   = (typeof year !== "undefined") ? year : 0;

    // enforce min gap (except forced)
    if (reasonType !== "forced" && yr - d.lastSnapshotYear < d.minYearGap) return null;

    // --- Civ states ---
    var civStates = [];
    try {
      var civs = (window.cecV95Data && Array.isArray(window.cecV95Data.civs))
        ? window.cecV95Data.civs : [];
      civs.forEach(function(c) {
        civStates.push({
          id:       c.id,
          name:     c.name,
          stageId:  c.stageId,
          pop:      c.population || 0,
          territory:c.territory  || 0,
          tech:     c.techLevel  || 0,
          color:    c.color      || "#8b5cf6",
          capital:  (c.cities && c.cities[0]) ? c.cities[0].name : null
        });
      });
    } catch(e) {}

    // --- World population ---
    var worldPop = 0;
    try {
      if (window.world && window.world.population) worldPop = window.world.population;
      else if (window.WSM && window.WSM.get) worldPop = window.WSM.get("population") || 0;
      else if (window.npcs && Array.isArray(window.npcs)) worldPop = window.npcs.length * 1000;
    } catch(e) {}

    // --- Active wars ---
    var wars = [];
    try {
      var wa = window.warsActive || (window.warData && window.warData.wars) || [];
      wa.slice(0, 10).forEach(function(w) {
        wars.push({ attacker: w.attacker||w.a||"?", defender: w.defender||w.d||"?", year: w.startYear||yr });
      });
      d.totalWars = Math.max(d.totalWars, wa.length);
    } catch(e) {}

    // --- Recent notable figures (NPCs) ---
    var figureSnap = [];
    try {
      var npcList = (window.npcs && Array.isArray(window.npcs)) ? window.npcs : [];
      var notable = npcList.filter(function(n) {
        return n && (n.realm >= 5 || n.isKing || n.isEmperor || n.role === "hero" || n.role === "prophet" || n.isFounder);
      }).slice(0, 8);
      notable.forEach(function(n) {
        figureSnap.push({ name: n.name || "?", role: n.role || (n.isKing?"king":n.isEmperor?"emperor":"notable"), realm: n.realm || 1 });
      });
    } catch(e) {}

    var snap = {
      id:         "snap_" + Date.now(),
      year:       yr,
      civStates:  civStates,
      population: worldPop,
      wars:       wars,
      figureSnap: figureSnap,
      reason:     reason    || "Sự kiện",
      reasonType: reasonType|| "event",
      ts:         Date.now()
    };

    d.snapshots.push(snap);
    d.lastSnapshotYear = yr;
    d.totalEvents++;
    if (d.snapshots.length > MAX_SNAPSHOTS) {
      d.snapshots.shift();
    }

    if (d.totalEvents % 20 === 0) save();
    return snap;
  }
  window.tr122Capture = captureSnapshot;

  // ── REGISTER HISTORICAL FIGURE ───────────────────────────────────
  function addFigure(name, role, civName, note, emoji) {
    var d   = window.trV122Data;
    var yr  = (typeof year !== "undefined") ? year : 0;
    // avoid duplicate
    if (d.figures.some(function(f){ return f.name === name && f.year === yr; })) return;
    var fig = { id: "fig_"+Date.now(), name: name, role: role||"notable",
                civName: civName||"Thế Giới", note: note||"", emoji: emoji||"⭐", year: yr };
    d.figures.push(fig);
    if (d.figures.length > MAX_FIGURES) d.figures.shift();
  }
  window.tr122AddFigure = addFigure;

  // ── REPLAY STATE MACHINE ─────────────────────────────────────────
  var _replayTimer = null;

  function replayPlay() {
    var d = window.trV122Data;
    if (!d.snapshots.length) return;
    d.playing = true;
    clearInterval(_replayTimer);
    var interval = Math.max(300, 1500 / d.speed);
    _replayTimer = setInterval(function() {
      if (!window.trV122Data.playing) { clearInterval(_replayTimer); return; }
      if (window.trV122Data.playhead < window.trV122Data.snapshots.length - 1) {
        window.trV122Data.playhead++;
        if (typeof window.tr122RenderPanel === "function") window.tr122RenderPanel();
      } else {
        replayPause();
      }
    }, interval);
  }

  function replayPause() {
    window.trV122Data.playing = false;
    clearInterval(_replayTimer);
    if (typeof window.tr122RenderPanel === "function") window.tr122RenderPanel();
  }

  function replayGoto(idx) {
    var d = window.trV122Data;
    replayPause();
    d.playhead = Math.max(0, Math.min(idx, d.snapshots.length - 1));
    if (typeof window.tr122RenderPanel === "function") window.tr122RenderPanel();
  }

  function replaySetSpeed(s) {
    window.trV122Data.speed = s;
    if (window.trV122Data.playing) { replayPause(); replayPlay(); }
  }

  window.tr122Play      = replayPlay;
  window.tr122Pause     = replayPause;
  window.tr122Goto      = replayGoto;
  window.tr122SetSpeed  = replaySetSpeed;

  // ── HOOK: intercept htAddEvent to capture snapshots ─────────────
  function hookHistoricalTimeline() {
    var _origHt = window.htAddEvent;
    window.htAddEvent = function(opts) {
      var result = _origHt ? _origHt.call(this, opts) : opts;
      try {
        var type = (opts && opts.type) ? opts.type : "general";
        if (SNAPSHOT_TRIGGERS.has(type)) {
          var label = (opts && (opts.title || opts.text)) ? (opts.title || opts.text) : type;
          captureSnapshot(label, type);

          // detect wars
          if (type === "war_start" || type === "mv_conquest") {
            window.trV122Data.totalWars++;
          }
          // detect discoveries / tech
          if (type === "discovery" || type === "ai_event") {
            window.trV122Data.totalDiscoveries++;
          }
        }
        // detect historical figures from ruler events
        if (type === "bloodline_hero" || type === "succession_peaceful" || type === "ruler_death") {
          var txt = (opts && (opts.title || opts.text)) ? (opts.title || opts.text) : "";
          if (txt) {
            var role = type === "bloodline_hero" ? "hero" : type === "ruler_death" ? "ruler" : "founder";
            var emoji = type === "bloodline_hero" ? "🌟" : type === "ruler_death" ? "☠️" : "👑";
            addFigure(txt.substring(0,40), role, null, txt, emoji);
          }
        }
      } catch(e) {}
      return result;
    };
  }

  // ── gameTick hook: capture periodic "living world" snapshots ─────
  function hookGameTick() {
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      try {
        var d  = window.trV122Data;
        var yr = (typeof year !== "undefined") ? year : 0;
        // Every 50 in-game years, capture a snapshot if not already done recently
        if (yr > 0 && yr % 50 === 0 && yr !== d.lastSnapshotYear) {
          captureSnapshot("Chu Kỳ Lịch Sử Năm " + yr, "periodic");
        }
      } catch(e) {}
    };
  }

  // ── JARVIS HISTORIAN: answer questions ───────────────────────────
  function jarvisAnswer(question) {
    var d    = window.trV122Data;
    var snaps = d.snapshots;
    var q     = question.toLowerCase();

    if (!snaps.length) return "⏳ Lịch sử chưa đủ dữ liệu. Hãy để thế giới phát triển thêm.";

    // Founder / first civ
    if (q.includes("nền văn minh đầu tiên") || q.includes("thành lập đầu tiên") || q.includes("founder")) {
      var first = snaps.find(function(s){ return s.civStates && s.civStates.length > 0; });
      if (first) {
        var c = first.civStates[0];
        return "🏛️ Nền văn minh đầu tiên ghi nhận: <b>" + c.name + "</b> vào Năm " + first.year + ". Dân số ban đầu: " + (c.pop||"?") + ".";
      }
    }

    // Biggest war
    if (q.includes("chiến tranh") || q.includes("war") || q.includes("lớn nhất")) {
      var warSnap = null, maxWars = 0;
      snaps.forEach(function(s){ if (s.wars && s.wars.length > maxWars) { maxWars = s.wars.length; warSnap = s; } });
      if (warSnap) {
        var w = warSnap.wars[0];
        return "⚔️ Thời kỳ chiến tranh lớn nhất: Năm " + warSnap.year + " với " + maxWars + " cuộc xung đột đồng thời. Đáng chú ý: <b>" + (w.attacker||"?") + "</b> vs <b>" + (w.defender||"?") + "</b>.";
      }
    }

    // Longest empire
    if (q.includes("tồn tại lâu") || q.includes("đế chế") || q.includes("empire")) {
      var best = null, bestAge = 0;
      snaps.forEach(function(s){
        if (s.civStates) s.civStates.forEach(function(c){
          if ((c.stageId === "empire" || c.stageId === "kingdom") && c.territory > bestAge) {
            bestAge = c.territory; best = { name: c.name, year: s.year };
          }
        });
      });
      if (best) return "👑 Đế chế hùng mạnh nhất từng ghi nhận: <b>" + best.name + "</b> vào Năm " + best.year + ".";
    }

    // Oldest city
    if (q.includes("thành phố") || q.includes("city") || q.includes("thủ đô")) {
      var first2 = snaps.find(function(s){ return s.civStates && s.civStates.some(function(c){ return c.capital; }); });
      if (first2) {
        var cap = first2.civStates.find(function(c){ return c.capital; });
        return "🏙️ Thủ đô lâu đời nhất được ghi nhận: <b>" + (cap ? cap.capital : "?") + "</b> thuộc <b>" + (cap ? cap.name : "?") + "</b>, từ Năm " + first2.year + ".";
      }
    }

    // Population peak
    if (q.includes("dân số") || q.includes("population")) {
      var peakSnap = snaps.reduce(function(best, s){ return (s.population > best.population) ? s : best; }, snaps[0]);
      return "👥 Dân số đỉnh cao: <b>" + peakSnap.population.toLocaleString() + "</b> vào Năm " + peakSnap.year + ".";
    }

    // Default
    return "📜 Lịch sử thế giới có <b>" + snaps.length + "</b> mốc quan trọng từ Năm " + (snaps[0]||{}).year + " đến Năm " + (snaps[snaps.length-1]||{}).year + ". Tổng " + d.totalWars + " cuộc chiến và " + d.figures.length + " nhân vật lịch sử.";
  }
  window.tr122JarvisAnswer = jarvisAnswer;

  // ── GET SNAPSHOT AT PLAYHEAD ─────────────────────────────────────
  window.tr122GetCurrent = function() {
    var d = window.trV122Data;
    return d.snapshots[d.playhead] || null;
  };

  // ── DOCUMENTARY MODE TEXT ────────────────────────────────────────
  window.tr122Documentary = function(snap) {
    if (!snap) return "";
    var lines = [];
    lines.push("═══════════════════════════════");
    lines.push("📜 NĂM " + snap.year);
    lines.push("═══════════════════════════════");
    lines.push("<i>" + snap.reason + "</i>");
    lines.push("");
    if (snap.population > 0) {
      lines.push("👥 Dân số thế giới: " + snap.population.toLocaleString());
    }
    if (snap.civStates && snap.civStates.length) {
      lines.push("");
      lines.push("🏛️ Các Nền Văn Minh:");
      snap.civStates.slice(0, 6).forEach(function(c) {
        var stageEmoji = { tribe:"🔥", town:"🏠", city:"🏙️", kingdom:"🏰", empire:"👑" }[c.stageId] || "🌍";
        lines.push("  " + stageEmoji + " <b>" + c.name + "</b> — " + (c.capital ? "Thủ đô: " + c.capital + " · " : "") + "Dân: " + (c.pop||0).toLocaleString());
      });
    }
    if (snap.wars && snap.wars.length) {
      lines.push("");
      lines.push("⚔️ Xung Đột Đang Diễn Ra:");
      snap.wars.slice(0, 3).forEach(function(w) {
        lines.push("  ⚔️ " + (w.attacker||"?") + " &nbsp;vs&nbsp; " + (w.defender||"?"));
      });
    }
    if (snap.figureSnap && snap.figureSnap.length) {
      lines.push("");
      lines.push("⭐ Nhân Vật Nổi Bật:");
      snap.figureSnap.slice(0, 4).forEach(function(f) {
        lines.push("  👤 <b>" + f.name + "</b> — " + f.role);
      });
    }
    return lines.join("<br>");
  };

  // ── INIT ─────────────────────────────────────────────────────────
  function init() {
    load();
    hookHistoricalTimeline();
    hookGameTick();

    // Initial snapshot if world exists
    setTimeout(function() {
      var yr = (typeof year !== "undefined") ? year : 0;
      if (yr >= 0) {
        captureSnapshot("Trạng Thái Khởi Đầu", "init");
      }
    }, 2000);

    console.log("[TimelineReplayEngine V122] 📽️ Lịch Sử Replay khởi động — " +
      window.trV122Data.snapshots.length + " snapshots sẵn có.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 29000); });
  } else {
    setTimeout(init, 29000);
  }
})();
