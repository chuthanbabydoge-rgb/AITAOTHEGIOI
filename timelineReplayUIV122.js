(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════
  // TIMELINE REPLAY UI V122 — Panel Renderer (5 tabs)
  // ═══════════════════════════════════════════════════════════════════

  var _activeTab = "timeline";

  function tab(id, label, active) {
    return '<button onclick="tr122UISetTab(\'' + id + '\')" style="padding:6px 14px;border-radius:6px;border:none;cursor:pointer;font-size:12px;font-weight:700;background:' +
      (active ? '#8b5cf6' : 'rgba(255,255,255,0.07)') + ';color:' + (active ? '#fff' : '#94a3b8') + '">' + label + '</button>';
  }

  function statCard(icon, label, val, color) {
    return '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px;text-align:center">' +
      '<div style="font-size:20px">' + icon + '</div>' +
      '<div style="font-size:16px;font-weight:800;color:' + (color||'#fbbf24') + ';margin:2px 0">' + val + '</div>' +
      '<div style="font-size:9px;color:#64748b;text-transform:uppercase">' + label + '</div>' +
    '</div>';
  }

  // ── TAB 1: TIMELINE (overview list of snapshots) ─────────────────
  function renderTimeline(d) {
    var snaps = d.snapshots;
    if (!snaps.length) {
      return '<div style="text-align:center;padding:40px;color:#475569">⏳ Chưa có snapshot lịch sử.<br>Để thế giới phát triển thêm vài năm.</div>';
    }
    var html = '<div style="display:flex;flex-direction:column;gap:0">';
    var shown = snaps.slice().reverse().slice(0, 80);
    shown.forEach(function(s, i) {
      var idx = snaps.length - 1 - i;
      var typeColor = {
        kingdom_founded:"#22c55e", kingdom_collapsed:"#ef4444", empire_founded:"#f59e0b",
        empire_collapsed:"#ef4444", war_start:"#dc2626", war_end:"#10b981",
        discovery:"#06b6d4", periodic:"#475569", init:"#8b5cf6",
        species_emerge:"#a3e635", civ_found:"#34d399", disaster:"#f97316",
        bloodline_hero:"#fbbf24"
      }[s.reasonType] || "#64748b";
      var typeEmoji = {
        kingdom_founded:"🏰", kingdom_collapsed:"💀", empire_founded:"👑",
        empire_collapsed:"💀", war_start:"⚔️", war_end:"🕊️",
        discovery:"🔬", periodic:"📅", init:"🌌",
        species_emerge:"🦎", civ_found:"🏛️", disaster:"🌋",
        bloodline_hero:"🌟", ideology:"📖", continent:"🗺️"
      }[s.reasonType] || "📜";

      html += '<div onclick="tr122Goto(' + idx + ')" style="display:flex;align-items:center;gap:10px;padding:8px 10px;cursor:pointer;border-left:3px solid ' + typeColor + ';background:rgba(255,255,255,0.03);margin-bottom:2px;border-radius:0 6px 6px 0;transition:background 0.15s" onmouseover="this.style.background=\'rgba(139,92,246,0.15)\'" onmouseout="this.style.background=\'rgba(255,255,255,0.03)\'">' +
        '<span style="font-size:16px">' + typeEmoji + '</span>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:12px;font-weight:700;color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (s.reason||"Sự kiện") + '</div>' +
          '<div style="font-size:10px;color:#64748b">Năm ' + s.year + (s.civStates && s.civStates.length ? ' · ' + s.civStates.length + ' văn minh' : '') + (s.population ? ' · ' + (s.population/1000).toFixed(0) + 'K dân' : '') + '</div>' +
        '</div>' +
        '<span style="font-size:10px;color:' + typeColor + ';white-space:nowrap">Xem »</span>' +
      '</div>';
    });
    html += '</div>';
    return html;
  }

  // ── TAB 2: REPLAY CONTROLS ────────────────────────────────────────
  function renderReplay(d) {
    var snaps = d.snapshots;
    if (!snaps.length) {
      return '<div style="text-align:center;padding:40px;color:#475569">⏳ Chưa có dữ liệu để replay.</div>';
    }
    var cur   = snaps[d.playhead] || snaps[0];
    var pct   = snaps.length > 1 ? Math.round((d.playhead / (snaps.length - 1)) * 100) : 0;

    // Map visualization
    var mapHtml = '<div style="position:relative;width:100%;height:180px;background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);margin-bottom:12px">';
    if (cur.civStates && cur.civStates.length) {
      cur.civStates.forEach(function(c, idx) {
        var total = cur.civStates.length;
        var angle = (idx / total) * Math.PI * 2;
        var r = 30 + (idx % 3) * 10;
        var xPct = 50 + r * Math.cos(angle);
        var yPct = 50 + r * Math.sin(angle) * 0.6;
        var stageRadius = { tribe:10, town:14, city:18, kingdom:22, empire:28 }[c.stageId] || 12;
        var col = c.color || "#8b5cf6";
        mapHtml += '<div style="position:absolute;border-radius:50%;background:' + col + ';opacity:0.6;width:' + stageRadius + 'px;height:' + stageRadius + 'px;left:calc(' + xPct + '% - ' + (stageRadius/2) + 'px);top:calc(' + yPct + '% - ' + (stageRadius/2) + 'px);transform:translate(0,0)" title="' + c.name + '"></div>';
        if (c.capital) {
          mapHtml += '<div style="position:absolute;left:calc(' + xPct + '%);top:calc(' + yPct + '% - ' + (stageRadius+4) + 'px);font-size:9px;color:#e2e8f0;white-space:nowrap;transform:translateX(-50%)">' + c.name.substring(0,12) + '</div>';
        }
      });
    }
    // Wars overlay
    if (cur.wars && cur.wars.length) {
      mapHtml += '<div style="position:absolute;top:6px;right:6px;background:rgba(239,68,68,0.8);border-radius:4px;padding:2px 6px;font-size:10px;color:#fff">⚔️ ' + cur.wars.length + ' chiến tranh</div>';
    }
    mapHtml += '<div style="position:absolute;bottom:6px;left:6px;font-size:10px;color:#64748b">📅 Năm ' + cur.year + '</div></div>';

    // Snapshot info card
    var infoHtml = '<div style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);border-radius:8px;padding:10px;margin-bottom:12px">' +
      '<div style="font-size:14px;font-weight:800;color:#c4b5fd;margin-bottom:4px">📽️ ' + (cur.reason||"Sự kiện lịch sử") + '</div>' +
      '<div style="font-size:11px;color:#94a3b8">Năm ' + cur.year + ' · ' + (cur.civStates||[]).length + ' văn minh · ' + (cur.population||0).toLocaleString() + ' dân · ' + (cur.wars||[]).length + ' xung đột</div>' +
    '</div>';

    // Scrubber
    var scrubHtml = '<div style="margin-bottom:12px">' +
      '<div style="display:flex;justify-content:space-between;font-size:10px;color:#64748b;margin-bottom:4px">' +
        '<span>Năm ' + (snaps[0]||{}).year + '</span>' +
        '<span>' + d.playhead + ' / ' + (snaps.length-1) + ' snapshots</span>' +
        '<span>Năm ' + (snaps[snaps.length-1]||{}).year + '</span>' +
      '</div>' +
      '<input type="range" min="0" max="' + (snaps.length-1) + '" value="' + d.playhead + '" oninput="tr122Goto(parseInt(this.value))" style="width:100%;accent-color:#8b5cf6">' +
    '</div>';

    // Controls
    var ctrlHtml = '<div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">' +
      '<button onclick="tr122Goto(0)" style="padding:8px 14px;border-radius:8px;border:none;background:rgba(255,255,255,0.07);color:#94a3b8;cursor:pointer;font-size:14px">⏮</button>' +
      '<button onclick="tr122Goto(Math.max(0,window.trV122Data.playhead-1))" style="padding:8px 14px;border-radius:8px;border:none;background:rgba(255,255,255,0.07);color:#94a3b8;cursor:pointer;font-size:14px">◀</button>' +
      (d.playing
        ? '<button onclick="tr122Pause()" style="padding:8px 20px;border-radius:8px;border:none;background:#8b5cf6;color:#fff;cursor:pointer;font-size:14px;font-weight:700">⏸</button>'
        : '<button onclick="tr122Play()" style="padding:8px 20px;border-radius:8px;border:none;background:#8b5cf6;color:#fff;cursor:pointer;font-size:14px;font-weight:700">▶</button>'
      ) +
      '<button onclick="tr122Goto(Math.min(window.trV122Data.snapshots.length-1,window.trV122Data.playhead+1))" style="padding:8px 14px;border-radius:8px;border:none;background:rgba(255,255,255,0.07);color:#94a3b8;cursor:pointer;font-size:14px">▶</button>' +
      '<button onclick="tr122Goto(window.trV122Data.snapshots.length-1)" style="padding:8px 14px;border-radius:8px;border:none;background:rgba(255,255,255,0.07);color:#94a3b8;cursor:pointer;font-size:14px">⏭</button>' +
    '</div>';

    var speedHtml = '<div style="display:flex;align-items:center;gap:8px;justify-content:center;margin-bottom:14px">' +
      '<span style="font-size:11px;color:#64748b">Tốc độ:</span>' +
      [1,2,5,10].map(function(s){
        return '<button onclick="tr122SetSpeed(' + s + ')" style="padding:4px 10px;border-radius:6px;border:none;cursor:pointer;font-size:11px;font-weight:700;background:' + (d.speed===s?'#8b5cf6':'rgba(255,255,255,0.07)') + ';color:' + (d.speed===s?'#fff':'#94a3b8') + '">' + s + 'x</button>';
      }).join('') +
    '</div>';

    // Progress
    var progHtml = '<div style="background:rgba(255,255,255,0.05);border-radius:8px;overflow:hidden;height:6px;margin-bottom:8px">' +
      '<div style="height:100%;background:linear-gradient(90deg,#8b5cf6,#a78bfa);width:' + pct + '%;transition:width 0.3s"></div></div>' +
      '<div style="font-size:10px;color:#475569;text-align:center">' + pct + '% lịch sử đã khám phá</div>';

    return mapHtml + infoHtml + scrubHtml + ctrlHtml + speedHtml + progHtml;
  }

  // ── TAB 3: HISTORICAL EVENTS ──────────────────────────────────────
  function renderEvents(d) {
    var htEvs = (window.htData && window.htData.events) ? window.htData.events : [];
    var snaps  = d.snapshots;
    var importantEvs = htEvs.filter(function(e){ return e.importance === "high" || e.importance === "medium"; });
    importantEvs = importantEvs.slice().reverse().slice(0, 60);

    var typeGroups = {
      "⚔️ Chiến Tranh & Xung Đột": ["war_start","war_end","succession_civil_war","succession_collapse","house_war","house_rebel","mv_conquest"],
      "👑 Đế Quốc & Vương Quốc": ["empire_founded","empire_collapsed","kingdom_founded","kingdom_collapsed","kingdom_upgrade"],
      "🌟 Danh Nhân": ["bloodline_hero","ruler_death"],
      "🏛️ Khám Phá & Văn Minh": ["wonder_built","discovery","ai_event","ideology","civ_found","species_emerge"],
      "🌋 Thiên Tai & Đại Dịch": ["disaster","plague","ecoDisaster"]
    };

    var filterType = (window._tr122FilterEvType || "all");
    var html = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">' +
      '<button onclick="window._tr122FilterEvType=\'all\';tr122RenderPanel()" style="padding:4px 10px;border-radius:6px;border:none;cursor:pointer;font-size:11px;background:' + (filterType==='all'?'#8b5cf6':'rgba(255,255,255,0.07)') + ';color:' + (filterType==='all'?'#fff':'#94a3b8') + '">Tất cả</button>' +
      Object.keys(typeGroups).map(function(g){
        return '<button onclick="window._tr122FilterEvType=\'' + g + '\';tr122RenderPanel()" style="padding:4px 10px;border-radius:6px;border:none;cursor:pointer;font-size:10px;background:' + (filterType===g?'#8b5cf6':'rgba(255,255,255,0.07)') + ';color:' + (filterType===g?'#fff':'#94a3b8') + '">' + g.split(' ')[0] + ' ' + g.split(' ')[1] + '</button>';
      }).join('') +
    '</div>';

    var shown = importantEvs;
    if (filterType !== "all") {
      var allowed = typeGroups[filterType] || [];
      shown = shown.filter(function(e){ return allowed.includes(e.type); });
    }

    if (!shown.length) {
      return html + '<div style="text-align:center;padding:30px;color:#475569">📜 Chưa có sự kiện lịch sử trọng đại nào.<br>Hãy để thế giới phát triển.</div>';
    }

    html += '<div style="display:flex;flex-direction:column;gap:4px">';
    shown.forEach(function(ev) {
      var imp = ev.importance === "high" ? "#ef4444" : "#f59e0b";
      var dot = ev.importance === "high" ? "🔴" : "🟡";
      html += '<div style="display:flex;gap:8px;align-items:flex-start;padding:7px 10px;background:rgba(255,255,255,0.03);border-radius:7px;border-left:3px solid ' + imp + '">' +
        '<span style="font-size:14px">' + (ev.emoji||dot) + '</span>' +
        '<div style="flex:1">' +
          '<div style="font-size:11px;font-weight:700;color:#e2e8f0">' + (ev.text||ev.title||"Sự kiện") + '</div>' +
          '<div style="font-size:10px;color:#64748b">Năm ' + ev.year + '</div>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';

    // Snapshot stats
    html += '<div style="margin-top:10px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' +
      statCard("📸","Snapshots",snaps.length,"#8b5cf6") +
      statCard("⚔️","Chiến Tranh",d.totalWars,"#ef4444") +
      statCard("🔬","Khám Phá",d.totalDiscoveries,"#06b6d4") +
    '</div>';
    return html;
  }

  // ── TAB 4: HISTORICAL FIGURES ─────────────────────────────────────
  function renderFigures(d) {
    // Also pull from npcs if available
    var figs = d.figures.slice().reverse().slice(0, 50);

    // Try to augment with NPC data
    try {
      var npcList = (window.npcs && Array.isArray(window.npcs)) ? window.npcs : [];
      var notable = npcList.filter(function(n){
        return n && (n.realm >= 6 || n.isKing || n.isEmperor || n.isFounder || n.role === "hero" || n.role === "prophet");
      }).slice(0, 20);
      notable.forEach(function(n) {
        if (!figs.some(function(f){ return f.name === n.name; })) {
          var roleMap = { hero:"🦸 Anh Hùng", prophet:"🔮 Tiên Tri", king:"👑 Vương", emperor:"⚡ Hoàng Đế", scholar:"📚 Học Giả" };
          figs.push({
            name: n.name || "Vô Danh",
            role: n.role || (n.isEmperor ? "emperor" : n.isKing ? "king" : "notable"),
            civName: n.country || n.sect || "Thế Giới",
            emoji: n.isEmperor ? "⚡" : n.isKing ? "👑" : n.role === "hero" ? "🦸" : n.role === "prophet" ? "🔮" : "⭐",
            note: "Năm sinh: " + (n.birthYear || "?") + " · Cảnh giới: " + (n.realm || 1),
            year: n.birthYear || 0
          });
        }
      });
    } catch(e) {}

    if (!figs.length) {
      return '<div style="text-align:center;padding:40px;color:#475569">⭐ Chưa có nhân vật lịch sử nào được ghi nhận.<br>Các anh hùng và vua chúa sẽ xuất hiện khi thế giới phát triển.</div>';
    }

    var roleColor = { hero:"#f59e0b", prophet:"#a78bfa", king:"#22c55e", emperor:"#ef4444", founder:"#06b6d4", ruler:"#fbbf24", notable:"#64748b", scholar:"#34d399" };
    var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
    figs.slice(0, 40).forEach(function(f) {
      var col = roleColor[f.role] || "#94a3b8";
      html += '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:9px;padding:9px">' +
        '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">' +
          '<span style="font-size:18px">' + (f.emoji||"⭐") + '</span>' +
          '<div>' +
            '<div style="font-size:12px;font-weight:700;color:#e2e8f0">' + (f.name||"?").substring(0,18) + '</div>' +
            '<div style="font-size:10px;color:' + col + '">' + (f.role||"notable") + '</div>' +
          '</div>' +
        '</div>' +
        '<div style="font-size:10px;color:#475569">' + (f.civName||"") + (f.year ? ' · Năm '+f.year : '') + '</div>' +
        (f.note ? '<div style="font-size:10px;color:#64748b;margin-top:2px">' + f.note.substring(0,40) + '</div>' : '') +
      '</div>';
    });
    html += '</div>';
    html += '<div style="margin-top:8px;font-size:10px;color:#475569;text-align:center">' + figs.length + ' nhân vật lịch sử được ghi nhận</div>';
    return html;
  }

  // ── TAB 5: DOCUMENTARY MODE ───────────────────────────────────────
  function renderDocumentary(d) {
    var snaps = d.snapshots;
    var html = '';

    // Jarvis Historian
    html += '<div style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);border-radius:10px;padding:12px;margin-bottom:14px">' +
      '<div style="font-size:13px;font-weight:800;color:#c4b5fd;margin-bottom:8px">🤖 Jarvis Sử Gia</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">' +
        ['Nền văn minh đầu tiên?','Chiến tranh lớn nhất?','Đế chế tồn tại lâu nhất?','Thành phố cổ nhất?','Dân số đỉnh cao?'].map(function(q){
          return '<button onclick="tr122UIJarvisAsk(\'' + q + '\')" style="padding:4px 10px;border-radius:6px;border:none;background:rgba(139,92,246,0.3);color:#c4b5fd;cursor:pointer;font-size:11px">' + q + '</button>';
        }).join('') +
      '</div>' +
      '<div id="tr122-jarvis-answer" style="font-size:12px;color:#94a3b8;min-height:20px;padding:6px;background:rgba(0,0,0,0.2);border-radius:6px">💬 Bấm câu hỏi trên để Jarvis trả lời...</div>' +
    '</div>';

    // Documentary stream
    if (!snaps.length) {
      return html + '<div style="text-align:center;padding:30px;color:#475569">📽️ Chưa có lịch sử để chiếu...</div>';
    }

    html += '<div style="font-size:12px;font-weight:700;color:#8b5cf6;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">📖 Biên Niên Sử Thế Giới</div>';
    html += '<div style="display:flex;flex-direction:column;gap:10px">';

    // Show up to 10 key snapshots in documentary style
    var keySnaps = snaps.filter(function(s){ return s.reasonType !== "periodic"; }).slice(-10);
    if (!keySnaps.length) keySnaps = snaps.slice(-8);

    keySnaps.forEach(function(snap) {
      html += '<div style="background:rgba(255,255,255,0.03);border-left:3px solid #8b5cf6;border-radius:0 8px 8px 0;padding:10px 12px">' +
        '<div style="font-size:16px;font-weight:900;color:#fbbf24;margin-bottom:4px">Năm ' + snap.year + '</div>' +
        '<div style="font-size:12px;color:#e2e8f0;margin-bottom:6px">' + (snap.reason||"Sự kiện") + '</div>';

      if (snap.population > 0) {
        html += '<div style="font-size:11px;color:#94a3b8">👥 Dân số thế giới: <b>' + snap.population.toLocaleString() + '</b></div>';
      }
      if (snap.civStates && snap.civStates.length) {
        snap.civStates.slice(0,3).forEach(function(c){
          var stageEmoji = { tribe:"🔥", town:"🏠", city:"🏙️", kingdom:"🏰", empire:"👑" }[c.stageId] || "🌍";
          html += '<div style="font-size:11px;color:#94a3b8">' + stageEmoji + ' <b>' + c.name + '</b>' + (c.capital ? ' — Thủ đô: ' + c.capital : '') + '</div>';
        });
      }
      if (snap.wars && snap.wars.length) {
        html += '<div style="font-size:11px;color:#ef4444;margin-top:4px">⚔️ ' + snap.wars.length + ' cuộc xung đột đang diễn ra</div>';
      }
      html += '</div>';
    });
    html += '</div>';
    return html;
  }

  // ── MAIN RENDER ───────────────────────────────────────────────────
  window.tr122RenderPanel = function() {
    var panel = document.getElementById("panel-TIMELINE-REPLAY");
    if (!panel) return;
    var d  = window.trV122Data || { snapshots:[], figures:[], playhead:0, playing:false, speed:1, totalWars:0, totalDiscoveries:0 };
    var at = _activeTab;

    var html = '<div style="padding:14px;height:100%;overflow-y:auto;box-sizing:border-box;color:#e2e8f0">';

    // Header
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
      '<div style="font-size:16px;font-weight:900;color:#c4b5fd">📽️ Timeline Replay V122</div>' +
      '<div style="font-size:11px;color:#475569">' + d.snapshots.length + ' snapshots · Năm ' + ((d.snapshots[d.snapshots.length-1]||{}).year||0) + '</div>' +
    '</div>';

    // Stat bar
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px">' +
      statCard("📸","Snapshots", d.snapshots.length, "#8b5cf6") +
      statCard("⚔️","Chiến Tranh", d.totalWars, "#ef4444") +
      statCard("🔬","Khám Phá", d.totalDiscoveries, "#06b6d4") +
      statCard("⭐","Nhân Vật", d.figures.length, "#fbbf24") +
    '</div>';

    // Tabs
    html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">' +
      tab("timeline","📜 Timeline",  at==="timeline") +
      tab("replay",  "▶ Replay",    at==="replay") +
      tab("events",  "📋 Sự Kiện",  at==="events") +
      tab("figures", "⭐ Nhân Vật", at==="figures") +
      tab("documentary","📖 Documentary", at==="documentary") +
    '</div>';

    // Tab content
    html += '<div style="min-height:300px">';
    if      (at === "timeline")     html += renderTimeline(d);
    else if (at === "replay")       html += renderReplay(d);
    else if (at === "events")       html += renderEvents(d);
    else if (at === "figures")      html += renderFigures(d);
    else if (at === "documentary")  html += renderDocumentary(d);
    html += '</div>';

    html += '</div>';
    panel.innerHTML = html;
  };

  // ── PUBLIC: set tab ───────────────────────────────────────────────
  window.tr122UISetTab = function(id) {
    _activeTab = id;
    window.tr122RenderPanel();
  };

  // ── PUBLIC: jarvis answer inline ──────────────────────────────────
  window.tr122UIJarvisAsk = function(q) {
    var el = document.getElementById("tr122-jarvis-answer");
    if (!el) return;
    el.innerHTML = "⏳ Đang tra cứu lịch sử...";
    setTimeout(function() {
      var ans = (typeof window.tr122JarvisAnswer === "function") ? window.tr122JarvisAnswer(q) : "Chưa sẵn sàng.";
      el.innerHTML = ans;
    }, 400);
  };

  console.log("[TimelineReplayUI V122] 🖼️ UI renderer sẵn sàng — 5 tabs.");
})();
