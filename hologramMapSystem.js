(function() {
  "use strict";

  // ════════════════════════════════════════
  // HOLOGRAM MAP SYSTEM V67
  // Top-down holographic civilization map
  // Shows: Countries · Empires · Wars · Religions · NPC positions
  // ════════════════════════════════════════

  window.hologramMapV67Data = {
    version: 67,
    frame: 0,
    panX: 0, panY: 0,
    zoom: 1,
    dragging: false, lastMouse: {x:0,y:0},
    filter: "all",      // all/countries/empires/wars/religions/npcs
    mapNodes: [],
    mapArcs: [],
    particlePool: [],
    lastBuilt: 0
  };

  // ════ SEEDED POSITION ════
  function strHash(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h) + s.charCodeAt(i);
    return Math.abs(h);
  }

  function hashPos(name, w, h, margin) {
    const hv = strHash(name);
    return {
      x: margin + (hv % (w - margin * 2)),
      y: margin + ((hv * 7919) % (h - margin * 2))
    };
  }

  // ════ BUILD MAP DATA ════
  window.holo67BuildMap = function(w, h) {
    const d = window.hologramMapV67Data;
    const year = window.year || 0;
    d.mapNodes = [];
    d.mapArcs = [];

    // Countries — teal
    (window.countries || []).forEach(c => {
      const pos = hashPos(c.name, w, h, 60);
      d.mapNodes.push({
        id: c.name, type: "country", name: c.name,
        x: pos.x, y: pos.y,
        color: "#00f5ff", size: 8 + Math.min(20, Math.sqrt(c.population || 1000) / 10),
        data: { stability: c.stability || 50, economy: c.economy || 50, pop: c.population || 0 }
      });
    });

    // Kingdoms — purple
    if (window.kingdomData && window.kingdomData.kingdoms) {
      const ks = Array.isArray(window.kingdomData.kingdoms)
        ? window.kingdomData.kingdoms : Object.values(window.kingdomData.kingdoms || {});
      ks.slice(0, 25).forEach(k => {
        const pos = hashPos((k.name || k.id) + "k", w, h, 60);
        d.mapNodes.push({
          id: "k_" + (k.id || k.name), type: "kingdom", name: k.name || "Kingdom",
          x: pos.x, y: pos.y, color: "#a855f7", size: 9,
          data: { power: k.power || 100 }
        });
      });
    }

    // Empires — gold
    if (window.empireData && window.empireData.empires) {
      const es = Array.isArray(window.empireData.empires)
        ? window.empireData.empires : Object.values(window.empireData.empires || {});
      es.slice(0, 15).forEach(e => {
        const pos = hashPos((e.name || e.id) + "e", w, h, 80);
        d.mapNodes.push({
          id: "e_" + (e.id || e.name), type: "empire", name: e.name || "Empire",
          x: pos.x, y: pos.y, color: "#f59e0b", size: 14,
          data: { power: e.power || 500 }
        });
      });
    }

    // NPC dots — green (top 30 alive)
    const npcs = (window.npcs || []).filter(n => n.status === "alive").slice(0, 30);
    npcs.forEach(n => {
      const pos = hashPos(n.name + "npc", w, h, 50);
      const blessed = n._divineBlessed || n._divineIncarnation;
      d.mapNodes.push({
        id: "npc_" + n.name, type: "npc", name: n.name,
        x: pos.x, y: pos.y, color: blessed ? "#fbbf24" : "#4ade80", size: blessed ? 7 : 4,
        data: { power: n.power || 0, country: n.country }
      });
    });

    // Religion nodes — pink
    if (window.religionData && window.religionData.religions) {
      const rels = Array.isArray(window.religionData.religions)
        ? window.religionData.religions : Object.values(window.religionData.religions || {});
      rels.slice(0, 10).forEach(r => {
        const pos = hashPos((r.name || r.id) + "rel", w, h, 80);
        d.mapNodes.push({
          id: "rel_" + (r.id || r.name), type: "religion", name: r.name || "Religion",
          x: pos.x, y: pos.y, color: "#f472b6", size: 8,
          data: { followers: r.followers || 0 }
        });
      });
    }

    // Wars — red arcs
    if (window.warsActive && Array.isArray(window.warsActive)) {
      window.warsActive.slice(0, 15).forEach(w => {
        const a = d.mapNodes.find(n => n.name === w.attacker && n.type === "country");
        const b = d.mapNodes.find(n => n.name === w.defender && n.type === "country");
        if (a && b) d.mapArcs.push({ from: a, to: b, type: "war", color: "#ef4444" });
      });
    }

    // Alliance arcs — blue
    if (window.allianceData && window.allianceData.alliances) {
      const als = Array.isArray(window.allianceData.alliances)
        ? window.allianceData.alliances : Object.values(window.allianceData.alliances || {});
      als.slice(0, 8).forEach(a => {
        const ms = a.members || [];
        if (ms.length >= 2) {
          const n1 = d.mapNodes.find(n => n.name === ms[0]);
          const n2 = d.mapNodes.find(n => n.name === ms[1]);
          if (n1 && n2) d.mapArcs.push({ from: n1, to: n2, type: "alliance", color: "#60a5fa" });
        }
      });
    }

    // Treaty arcs — green dashed
    if (window.treatyData && window.treatyData.treaties) {
      const ts = Array.isArray(window.treatyData.treaties)
        ? window.treatyData.treaties : Object.values(window.treatyData.treaties || {});
      ts.slice(0, 6).forEach(t => {
        const n1 = d.mapNodes.find(n => n.name === t.party1);
        const n2 = d.mapNodes.find(n => n.name === t.party2);
        if (n1 && n2) d.mapArcs.push({ from: n1, to: n2, type: "treaty", color: "#34d399" });
      });
    }

    d.lastBuilt = year;
  };

  // ════ RENDER HOLOGRAM MAP ════
  window.holo67Render = function(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const d = window.hologramMapV67Data;
    d.frame++;
    const year = window.year || 0;

    // Rebuild if needed
    if (d.mapNodes.length === 0 || year - d.lastBuilt > 100) {
      window.holo67BuildMap(w, h);
    }

    // Background
    ctx.fillStyle = "rgba(0,5,20,0.98)";
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.save();
    ctx.strokeStyle = "rgba(0,245,255,0.05)";
    ctx.lineWidth = 0.5;
    const gs = 35;
    for (let gx = 0; gx < w; gx += gs) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }
    for (let gy = 0; gy < h; gy += gs) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }
    ctx.restore();

    // Scanline
    const sl = (d.frame * 1.5) % h;
    const slg = ctx.createLinearGradient(0, sl - 30, 0, sl + 30);
    slg.addColorStop(0, "rgba(0,245,255,0)");
    slg.addColorStop(0.5, "rgba(0,245,255,0.06)");
    slg.addColorStop(1, "rgba(0,245,255,0)");
    ctx.fillStyle = slg;
    ctx.fillRect(0, sl - 30, w, 60);

    // Pan/zoom transform
    ctx.save();
    ctx.translate(d.panX, d.panY);
    ctx.scale(d.zoom, d.zoom);

    // Filter
    const filter = d.filter;
    const nodeFilter = (n) => filter === "all" || n.type === filter || (filter === "wars" && n.type === "country") || (filter === "npcs" && n.type === "npc");

    // Draw arcs
    d.mapArcs.forEach(arc => {
      if (filter !== "all" && filter !== "wars" && filter !== "treaties" && filter !== "alliances") return;
      const ax = arc.from.x, ay = arc.from.y;
      const bx = arc.to.x, by = arc.to.y;
      const mx = (ax + bx) / 2;
      const my = (ay + by) / 2 - 30;

      ctx.save();
      ctx.strokeStyle = arc.color + "80";
      ctx.lineWidth = arc.type === "war" ? 1.5 : 1;
      ctx.shadowColor = arc.color;
      ctx.shadowBlur = 6;
      if (arc.type === "treaty") { ctx.setLineDash([4, 4]); }

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo(mx, my, bx, by);
      ctx.stroke();
      ctx.setLineDash([]);

      // War: animated dot
      if (arc.type === "war") {
        const t = ((d.frame * 0.015) % 1);
        const dotX = (1-t)*(1-t)*ax + 2*(1-t)*t*mx + t*t*bx;
        const dotY = (1-t)*(1-t)*ay + 2*(1-t)*t*my + t*t*by;
        ctx.beginPath(); ctx.arc(dotX, dotY, 3, 0, Math.PI*2);
        ctx.fillStyle = arc.color; ctx.fill();
      }
      ctx.restore();
    });

    // Draw nodes
    d.mapNodes.filter(nodeFilter).forEach(node => {
      const pulse = Math.sin(d.frame * 0.05 + strHash(node.name) * 0.01) * 2;
      const r = node.size + pulse;

      ctx.save();
      ctx.shadowColor = node.color;
      ctx.shadowBlur = 15;

      // Core
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      const cg = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r);
      cg.addColorStop(0, node.color + "ff");
      cg.addColorStop(1, node.color + "22");
      ctx.fillStyle = cg;
      ctx.fill();

      // Ring
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 4, 0, Math.PI * 2);
      ctx.strokeStyle = node.color + "33";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      ctx.fillStyle = node.color + "cc";
      ctx.font = `${node.type === "npc" ? 9 : 10}px 'Courier New', monospace`;
      ctx.textAlign = "center";
      ctx.shadowBlur = 4;
      ctx.fillText(node.name.substring(0, 14), node.x, node.y - r - 4);

      ctx.restore();
    });

    ctx.restore(); // end pan/zoom

    // HUD
    ctx.save();
    ctx.fillStyle = "rgba(0,245,255,0.7)";
    ctx.font = "12px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.shadowColor = "#00f5ff";
    ctx.shadowBlur = 8;
    const wars = d.mapArcs.filter(a => a.type === "war").length;
    const npcsCount = d.mapNodes.filter(n => n.type === "npc").length;
    ctx.fillText(`HOLOGRAM MAP · YEAR ${year}`, 10, 18);
    ctx.fillStyle = "rgba(0,245,255,0.4)";
    ctx.font = "10px 'Courier New', monospace";
    ctx.fillText(`⚔ ${wars} WARS · 👤 ${npcsCount} NPCs · ${d.mapNodes.length} NODES`, 10, 33);
    ctx.restore();
  };

  // ════ MOUSE HANDLERS ════
  window.holo67AttachMouse = function(canvasId, onNodeClick) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const d = window.hologramMapV67Data;

    canvas.addEventListener("mousedown", e => {
      d.dragging = true;
      d.lastMouse = { x: e.offsetX, y: e.offsetY };
    });
    canvas.addEventListener("mousemove", e => {
      if (d.dragging) {
        d.panX += (e.offsetX - d.lastMouse.x);
        d.panY += (e.offsetY - d.lastMouse.y);
        d.lastMouse = { x: e.offsetX, y: e.offsetY };
      }
    });
    canvas.addEventListener("mouseup", e => {
      d.dragging = false;
      _holoClick(e.offsetX, e.offsetY, canvas, onNodeClick);
    });
    canvas.addEventListener("wheel", e => {
      e.preventDefault();
      d.zoom = Math.max(0.3, Math.min(5, d.zoom - e.deltaY * 0.001));
    }, { passive: false });
  };

  function strHash(s) { let h=5381; for(let i=0;i<s.length;i++) h=((h<<5)+h)+s.charCodeAt(i); return Math.abs(h); }

  function _holoClick(mx, my, canvas, onNodeClick) {
    const d = window.hologramMapV67Data;
    const wx = (mx - d.panX) / d.zoom;
    const wy = (my - d.panY) / d.zoom;
    let best = null, bestDist = 30 / d.zoom;
    d.mapNodes.forEach(n => {
      const dist = Math.sqrt((n.x - wx)**2 + (n.y - wy)**2);
      if (dist < bestDist) { best = n; bestDist = dist; }
    });
    if (best && typeof onNodeClick === "function") onNodeClick(best);
  }

  window.holo67SetFilter = function(f) { window.hologramMapV67Data.filter = f; };
  window.holo67ResetView = function() {
    const d = window.hologramMapV67Data;
    d.panX = 0; d.panY = 0; d.zoom = 1;
  };

  // ════ ANIMATION LOOP ════
  window.holo67StartLoop = function(canvasId, onNodeClick) {
    let running = true;
    window.holo67AttachMouse(canvasId, onNodeClick);
    function loop() {
      if (!document.getElementById(canvasId)) { running = false; return; }
      window.holo67Render(canvasId);
      if (running) requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    window.hologramMapV67Data._stop = function() { running = false; };
  };

  function init() {
    console.log("[HologramMapSystemV67] 🗺️ Hologram Map khởi động — civilizations visible as holographic nodes.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 14700); });
  } else {
    setTimeout(init, 14700);
  }
})();
