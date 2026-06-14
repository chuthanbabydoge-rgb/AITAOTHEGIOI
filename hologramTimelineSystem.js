(function() {
  "use strict";

  // ════════════════════════════════════════
  // HOLOGRAM TIMELINE SYSTEM V67
  // Draggable holographic timeline
  // Past: historical events · Future: prophecies
  // ════════════════════════════════════════

  window.hologramTimelineV67Data = {
    version: 67,
    frame: 0,
    scrollX: 0,         // pixels scrolled (timeline pan)
    dragging: false,
    lastMouse: { x: 0 },
    yearRange: 200,     // years visible on screen
    centerYear: null,   // null = current year
    events: [],
    prophecies: [],
    milestones: [],
    lastBuilt: 0
  };

  // ════ TIMELINE PIXEL MATH ════
  function yearToX(year, centerYear, scrollX, w, yearRange) {
    const pixelsPerYear = w / yearRange;
    return w / 2 + (year - centerYear) * pixelsPerYear + scrollX;
  }

  function xToYear(x, centerYear, scrollX, w, yearRange) {
    return centerYear + (x - w / 2 - scrollX) / (w / yearRange);
  }

  // ════ BUILD TIMELINE DATA ════
  window.htl67BuildData = function() {
    const d = window.hologramTimelineV67Data;
    const year = window.year || 0;
    if (d.centerYear === null) d.centerYear = year;
    d.events = [];
    d.prophecies = [];
    d.milestones = [];

    // From Historical Timeline (htData / historicalTimeline)
    const ht = window.historicalTimeline || window.htData || [];
    const htArray = Array.isArray(ht) ? ht : Object.values(ht || {});
    htArray.slice(-200).forEach(e => {
      d.events.push({
        year: e.year || 0,
        title: e.title || "Event",
        color: e.color || "#00f5ff",
        type: e.type || "event",
        importance: e.importance || 1
      });
    });

    // World Event V25
    if (window.worldEventV25Data && window.worldEventV25Data.events) {
      (Array.isArray(window.worldEventV25Data.events) ? window.worldEventV25Data.events : []).slice(-50).forEach(e => {
        d.events.push({ year: e.year || 0, title: e.title || "World Event", color: "#f59e0b", type: "world" });
      });
    }

    // Disasters
    if (window.disasterData && window.disasterData.history) {
      (window.disasterData.history || []).slice(-30).forEach(e => {
        d.events.push({ year: e.year || 0, title: "🌋 " + (e.name || "Disaster"), color: "#ef4444", type: "disaster" });
      });
    }

    // Wars
    if (window.warsActive && Array.isArray(window.warsActive)) {
      window.warsActive.forEach(w => {
        d.events.push({ year: w.startYear || year, title: "⚔️ " + (w.attacker || "?") + " vs " + (w.defender || "?"), color: "#ef4444", type: "war" });
      });
    }

    // Divine acts from V66
    if (window.creatorLegacyV66Data && window.creatorLegacyV66Data.legacyEntries) {
      window.creatorLegacyV66Data.legacyEntries.slice(-50).forEach(e => {
        d.events.push({ year: e.year || 0, title: e.title || "Divine Act", color: "#c084fc", type: "divine", importance: e.importance || 3 });
      });
    }

    // Prophecies from V51 + V66
    if (window.prophecyV51Data && window.prophecyV51Data.active) {
      window.prophecyV51Data.active.forEach(p => {
        const targetYear = p.year + (p.expectedFulfill || 150);
        d.prophecies.push({ year: targetYear, text: p.text || p.content || "Prophecy", color: "#818cf8", type: "prophecy" });
      });
    }
    if (window.prophecyV66Data && window.prophecyV66Data.watching) {
      window.prophecyV66Data.watching.forEach(w => {
        if (!w._fulfilled) {
          const p = (window.prophecyV66Data.prophecies || []).find(pp => pp.id === w.prophecyId);
          d.prophecies.push({
            year: w.triggerAfter || (year + 100),
            text: p ? p.text : "Tiên tri...",
            color: "#c084fc", type: "prophecy"
          });
        }
      });
    }

    // Milestones (age shifts)
    if (window.ageV25Data && window.ageV25Data.history) {
      (window.ageV25Data.history || []).forEach(a => {
        d.milestones.push({ year: a.year || 0, label: a.name || "Age", color: "#fbbf24" });
      });
    }

    d.lastBuilt = year;
  };

  // ════ RENDER HOLOGRAM TIMELINE ════
  window.htl67Render = function(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    const d = window.hologramTimelineV67Data;
    d.frame++;
    const year = window.year || 0;

    if (d.centerYear === null) d.centerYear = year;
    if (d.events.length === 0) window.htl67BuildData();

    // Background
    ctx.fillStyle = "rgba(0,5,18,0.98)";
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = "rgba(0,245,255,0.05)";
    ctx.lineWidth = 0.5;
    for (let gx = 0; gx < w; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
    }

    // Scanline
    const sl = (d.frame * 1.2) % h;
    const slg = ctx.createLinearGradient(0, sl - 20, 0, sl + 20);
    slg.addColorStop(0, "rgba(0,245,255,0)");
    slg.addColorStop(0.5, "rgba(0,245,255,0.05)");
    slg.addColorStop(1, "rgba(0,245,255,0)");
    ctx.fillStyle = slg;
    ctx.fillRect(0, sl - 20, w, 40);

    const midY = h / 2;
    const cYear = d.centerYear;
    const yRange = d.yearRange;

    // Timeline central axis
    ctx.save();
    ctx.strokeStyle = "rgba(0,245,255,0.4)";
    ctx.lineWidth = 1.5;
    ctx.shadowColor = "#00f5ff";
    ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(w, midY); ctx.stroke();
    ctx.restore();

    // FUTURE zone (right of now-line)
    const nowX = yearToX(year, cYear, d.scrollX, w, yRange);
    if (nowX < w) {
      const futureGrad = ctx.createLinearGradient(nowX, 0, Math.min(w, nowX + 200), 0);
      futureGrad.addColorStop(0, "rgba(192,132,252,0.06)");
      futureGrad.addColorStop(1, "rgba(192,132,252,0)");
      ctx.fillStyle = futureGrad;
      ctx.fillRect(nowX, 0, w - nowX, h);
    }

    // Decade marks
    const startYear = Math.floor(xToYear(0, cYear, d.scrollX, w, yRange) / 10) * 10;
    const endYear = Math.ceil(xToYear(w, cYear, d.scrollX, w, yRange) / 10) * 10;
    for (let y2 = startYear; y2 <= endYear; y2 += 10) {
      const x = yearToX(y2, cYear, d.scrollX, w, yRange);
      if (x < 0 || x > w) continue;
      const isCentury = y2 % 100 === 0;
      ctx.save();
      ctx.strokeStyle = isCentury ? "rgba(0,245,255,0.5)" : "rgba(0,245,255,0.15)";
      ctx.lineWidth = isCentury ? 1 : 0.5;
      ctx.beginPath(); ctx.moveTo(x, midY - (isCentury ? 20 : 10)); ctx.lineTo(x, midY + (isCentury ? 20 : 10)); ctx.stroke();
      if (isCentury || yRange <= 100) {
        ctx.fillStyle = isCentury ? "rgba(0,245,255,0.7)" : "rgba(0,245,255,0.35)";
        ctx.font = `${isCentury ? 10 : 8}px 'Courier New', monospace`;
        ctx.textAlign = "center";
        ctx.fillText(y2, x, midY + (isCentury ? 35 : 22));
      }
      ctx.restore();
    }

    // Milestones (age shifts)
    d.milestones.forEach(ms => {
      const x = yearToX(ms.year, cYear, d.scrollX, w, yRange);
      if (x < 0 || x > w) return;
      ctx.save();
      ctx.strokeStyle = ms.color + "88";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = ms.color + "aa";
      ctx.font = "9px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText(ms.label, x, 10);
      ctx.restore();
    });

    // Events (PAST — above timeline)
    const drawn = new Set();
    d.events.forEach(ev => {
      const x = yearToX(ev.year, cYear, d.scrollX, w, yRange);
      if (x < -5 || x > w + 5) return;
      const key = Math.round(x / 8) + ev.type;
      if (drawn.has(key)) return; drawn.add(key);

      const importance = ev.importance || 1;
      const lineH = 15 + importance * 8;

      ctx.save();
      ctx.strokeStyle = ev.color + "cc";
      ctx.lineWidth = 1;
      ctx.shadowColor = ev.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(x, midY);
      ctx.lineTo(x, midY - lineH);
      ctx.stroke();

      // Diamond
      ctx.fillStyle = ev.color;
      ctx.beginPath();
      ctx.moveTo(x, midY - lineH - 4);
      ctx.lineTo(x + 4, midY - lineH);
      ctx.lineTo(x, midY - lineH + 4);
      ctx.lineTo(x - 4, midY - lineH);
      ctx.closePath();
      ctx.fill();

      // Label (only if space)
      if (yRange <= 300 || importance >= 3) {
        ctx.fillStyle = ev.color + "cc";
        ctx.font = "8px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.shadowBlur = 3;
        ctx.fillText(ev.title.substring(0, 18), x, midY - lineH - 10);
      }

      ctx.restore();
    });

    // Prophecies (FUTURE — below timeline)
    d.prophecies.forEach(proph => {
      const x = yearToX(proph.year, cYear, d.scrollX, w, yRange);
      if (x < -5 || x > w + 5) return;

      ctx.save();
      ctx.strokeStyle = proph.color + "88";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.shadowColor = proph.color;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.moveTo(x, midY);
      ctx.lineTo(x, midY + 40);
      ctx.stroke();
      ctx.setLineDash([]);

      // Question mark diamond
      ctx.fillStyle = proph.color + "aa";
      ctx.beginPath();
      ctx.moveTo(x, midY + 42);
      ctx.lineTo(x + 5, midY + 47);
      ctx.lineTo(x, midY + 52);
      ctx.lineTo(x - 5, midY + 47);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = proph.color + "cc";
      ctx.font = "8px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText("🔮 " + proph.text.substring(0, 16), x, midY + 65);
      ctx.restore();
    });

    // NOW line
    if (nowX >= 0 && nowX <= w) {
      ctx.save();
      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#4ade80";
      ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.moveTo(nowX, 0); ctx.lineTo(nowX, h); ctx.stroke();

      // "NOW" label
      ctx.fillStyle = "#4ade80";
      ctx.font = "bold 11px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText("▼ NOW", nowX, 15);
      ctx.fillText("YEAR " + year, nowX, 28);
      ctx.restore();
    }

    // PAST / FUTURE labels
    ctx.save();
    ctx.fillStyle = "rgba(0,245,255,0.3)";
    ctx.font = "11px 'Courier New', monospace";
    if (nowX > 80) { ctx.textAlign = "left"; ctx.fillText("◄ PAST", 8, midY - 5); }
    if (nowX < w - 80) { ctx.textAlign = "right"; ctx.fillText("FUTURE ►", w - 8, midY - 5); }
    ctx.restore();

    // HUD
    ctx.save();
    ctx.fillStyle = "rgba(0,245,255,0.7)";
    ctx.font = "12px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.shadowColor = "#00f5ff";
    ctx.shadowBlur = 8;
    ctx.fillText(`HOLOGRAM TIMELINE · ${d.events.length} EVENTS · ${d.prophecies.length} PROPHECIES`, 10, h - 22);
    ctx.fillStyle = "rgba(0,245,255,0.4)";
    ctx.font = "10px 'Courier New', monospace";
    ctx.fillText(`DRAG TO SCROLL · SCROLL WHEEL = ZOOM · CENTER: YEAR ${Math.round(cYear)}`, 10, h - 8);
    ctx.restore();
  };

  // ════ ZOOM ════
  window.htl67Zoom = function(delta) {
    const d = window.hologramTimelineV67Data;
    d.yearRange = Math.max(20, Math.min(5000, d.yearRange + delta));
  };

  // ════ CENTER ON YEAR ════
  window.htl67GoToYear = function(yr) {
    const d = window.hologramTimelineV67Data;
    d.centerYear = yr;
    d.scrollX = 0;
  };

  // ════ MOUSE ════
  window.htl67AttachMouse = function(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const d = window.hologramTimelineV67Data;
    canvas.addEventListener("mousedown", e => { d.dragging = true; d.lastMouse = {x: e.offsetX}; });
    canvas.addEventListener("mousemove", e => {
      if (d.dragging) { d.scrollX += (e.offsetX - d.lastMouse.x); d.lastMouse = {x: e.offsetX}; }
    });
    canvas.addEventListener("mouseup", () => { d.dragging = false; });
    canvas.addEventListener("mouseleave", () => { d.dragging = false; });
    canvas.addEventListener("wheel", e => {
      e.preventDefault();
      window.htl67Zoom(e.deltaY > 0 ? 20 : -20);
    }, {passive: false});
    canvas.addEventListener("dblclick", () => {
      d.centerYear = window.year || 0;
      d.scrollX = 0;
    });
  };

  window.htl67StartLoop = function(canvasId) {
    let running = true;
    window.htl67AttachMouse(canvasId);
    window.htl67BuildData();
    function loop() {
      if (!document.getElementById(canvasId)) { running = false; return; }
      window.htl67Render(canvasId);
      if (running) requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    window.hologramTimelineV67Data._stop = function() { running = false; };
  };

  function init() {
    console.log("[HologramTimelineV67] ⏳ Hologram Timeline khởi động — lịch sử + tiên tri trên cùng một trục.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 14900); });
  } else {
    setTimeout(init, 14900);
  }
})();
