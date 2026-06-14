(function() {
  "use strict";

  // ════════════════════════════════════════
  // SPATIAL WORLD ENGINE V67
  // Canvas-based holographic world view
  // EXPAND ONLY · No old systems touched
  // ════════════════════════════════════════

  window.spatialV67Data = {
    version: 67,
    rotation: 0,
    tilt: 25,
    zoom: 1,
    panX: 0, panY: 0,
    dragging: false,
    lastMouse: { x: 0, y: 0 },
    selectedEntity: null,
    hoveredEntity: null,
    autoRotate: true,
    glitchEffect: false,
    scanlineOffset: 0,
    frame: 0,
    // Cached world nodes
    worldNodes: [],
    worldArcs: [],
    lastBuilt: 0
  };

  // ════ SEEDED HASH for consistent positions ════
  function strHash(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h) + s.charCodeAt(i);
    return Math.abs(h);
  }

  // ════ BUILD WORLD NODES FROM DATA ════
  window.swe67BuildWorldNodes = function() {
    const year = window.year || 0;
    const d = window.spatialV67Data;
    d.worldNodes = [];
    d.worldArcs = [];

    // Countries
    const countries = window.countries || [];
    countries.forEach((c, i) => {
      const h = strHash(c.name || String(i));
      const angle = (h % 360) * Math.PI / 180;
      const radius = 0.2 + (h % 100) / 200;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      d.worldNodes.push({
        id: c.name,
        type: "country",
        name: c.name,
        x, z,
        y: ((h % 40) - 20) / 200,
        population: c.population || 1000,
        stability: c.stability || 50,
        economy: c.economy || 50,
        color: "#00f5ff",
        radius: 6 + Math.min(20, Math.sqrt(c.population || 1000) / 10)
      });
    });

    // Kingdoms
    if (window.kingdomData && window.kingdomData.kingdoms) {
      const ks = Array.isArray(window.kingdomData.kingdoms)
        ? window.kingdomData.kingdoms : Object.values(window.kingdomData.kingdoms || {});
      ks.slice(0, 30).forEach((k, i) => {
        const h = strHash((k.name || k.id || String(i)) + "k");
        const angle = (h % 360) * Math.PI / 180;
        const radius = 0.15 + (h % 80) / 250;
        d.worldNodes.push({
          id: "k_" + (k.id || i), type: "kingdom", name: k.name || ("Kingdom " + i),
          x: radius * Math.cos(angle), z: radius * Math.sin(angle),
          y: ((h % 30) - 15) / 200,
          power: k.power || 100, color: "#a855f7", radius: 7
        });
      });
    }

    // Empires
    if (window.empireData && window.empireData.empires) {
      const es = Array.isArray(window.empireData.empires)
        ? window.empireData.empires : Object.values(window.empireData.empires || {});
      es.slice(0, 20).forEach((e, i) => {
        const h = strHash((e.name || e.id || String(i)) + "e");
        const angle = (h % 360) * Math.PI / 180;
        const radius = 0.3 + (h % 60) / 200;
        d.worldNodes.push({
          id: "e_" + (e.id || i), type: "empire", name: e.name || ("Empire " + i),
          x: radius * Math.cos(angle), z: radius * Math.sin(angle),
          y: ((h % 40) - 20) / 200,
          power: e.power || 500, color: "#f59e0b", radius: 12
        });
      });
    }

    // War arcs
    if (window.warsActive && Array.isArray(window.warsActive)) {
      window.warsActive.slice(0, 20).forEach(w => {
        const a = d.worldNodes.find(n => n.name === w.attacker);
        const b = d.worldNodes.find(n => n.name === w.defender);
        if (a && b) d.worldArcs.push({ from: a, to: b, type: "war", color: "#ef4444" });
      });
    }

    // Alliance arcs
    if (window.allianceData && window.allianceData.alliances) {
      const als = Array.isArray(window.allianceData.alliances)
        ? window.allianceData.alliances : Object.values(window.allianceData.alliances || {});
      als.slice(0, 10).forEach(a => {
        const members = a.members || [];
        if (members.length >= 2) {
          const n1 = d.worldNodes.find(n => n.name === members[0]);
          const n2 = d.worldNodes.find(n => n.name === members[1]);
          if (n1 && n2) d.worldArcs.push({ from: n1, to: n2, type: "alliance", color: "#4ade80" });
        }
      });
    }

    d.lastBuilt = year;
  };

  // ════ 3D PROJECTION ════
  window.swe67Project = function(x, y, z, cx, cy, canvasW, canvasH, zoom, rotY, tilt) {
    // Rotate around Y axis
    const cosY = Math.cos(rotY * Math.PI / 180);
    const sinY = Math.sin(rotY * Math.PI / 180);
    const rx = x * cosY + z * sinY;
    const rz = -x * sinY + z * cosY;

    // Tilt (rotate around X axis)
    const cosX = Math.cos(tilt * Math.PI / 180);
    const sinX = Math.sin(tilt * Math.PI / 180);
    const ry = y * cosX - rz * sinX;
    const rz2 = y * sinX + rz * cosX;

    // Perspective projection
    const fov = 1.5;
    const dist = 2;
    const scale = (fov / (dist + rz2)) * canvasW * zoom;

    return {
      sx: cx + rx * scale,
      sy: cy - ry * scale,
      scale,
      depth: rz2
    };
  };

  // ════ DRAW HOLOGRAM GRID ════
  window.swe67DrawGrid = function(ctx, w, h, frame) {
    ctx.save();
    // Holographic bg
    const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)/2);
    grad.addColorStop(0, "rgba(0,10,30,0.98)");
    grad.addColorStop(1, "rgba(0,0,15,1)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = "rgba(0,245,255,0.07)";
    ctx.lineWidth = 0.5;
    const gridSize = 40;
    for (let gx = 0; gx < w; gx += gridSize) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
    }
    for (let gy = 0; gy < h; gy += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
    }

    // Scanlines
    const scanY = (frame * 2) % h;
    const scanGrad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
    scanGrad.addColorStop(0, "rgba(0,245,255,0)");
    scanGrad.addColorStop(0.5, "rgba(0,245,255,0.04)");
    scanGrad.addColorStop(1, "rgba(0,245,255,0)");
    ctx.fillStyle = scanGrad;
    ctx.fillRect(0, scanY - 60, w, 120);

    // Horizon ellipse
    ctx.strokeStyle = "rgba(0,245,255,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(w/2, h/2, w*0.42, h*0.18, 0, 0, Math.PI*2);
    ctx.stroke();

    ctx.restore();
  };

  // ════ DRAW NODE ════
  window.swe67DrawNode = function(ctx, sx, sy, node, scale, selected, hovered) {
    const r = Math.max(3, node.radius * Math.min(1.5, scale * 1.5));
    ctx.save();

    // Glow
    ctx.shadowColor = node.color;
    ctx.shadowBlur = selected ? 30 : hovered ? 20 : 12;

    // Core circle
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    const cg = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
    cg.addColorStop(0, node.color + "ff");
    cg.addColorStop(0.6, node.color + "88");
    cg.addColorStop(1, node.color + "22");
    ctx.fillStyle = cg;
    ctx.fill();

    // Outer ring
    ctx.beginPath();
    ctx.arc(sx, sy, r + 3, 0, Math.PI * 2);
    ctx.strokeStyle = node.color + "55";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Ring pulse for selected
    if (selected) {
      ctx.beginPath();
      ctx.arc(sx, sy, r + 8, 0, Math.PI * 2);
      ctx.strokeStyle = node.color + "33";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Label
    if (scale > 0.5) {
      ctx.shadowBlur = 6;
      ctx.fillStyle = node.color;
      ctx.font = `${Math.max(9, 11 * Math.min(1, scale))}px 'Courier New', monospace`;
      ctx.textAlign = "center";
      ctx.fillText(node.name.substring(0, 16), sx, sy - r - 5);
    }

    ctx.restore();
  };

  // ════ DRAW ARC ════
  window.swe67DrawArc = function(ctx, p1, p2, type, color, frame) {
    if (!p1 || !p2) return;
    ctx.save();
    ctx.strokeStyle = color + "88";
    ctx.lineWidth = type === "war" ? 1.5 : 1;
    ctx.shadowColor = color;
    ctx.shadowBlur = 5;

    // Bezier arc
    const mx = (p1.sx + p2.sx) / 2;
    const my = (p1.sy + p2.sy) / 2 - 40;
    ctx.beginPath();
    ctx.moveTo(p1.sx, p1.sy);
    ctx.quadraticCurveTo(mx, my, p2.sx, p2.sy);
    ctx.stroke();

    if (type === "war") {
      // Animated dot along arc
      const t = ((frame * 0.02) % 1);
      const bx = (1-t)*(1-t)*p1.sx + 2*(1-t)*t*mx + t*t*p2.sx;
      const by = (1-t)*(1-t)*p1.sy + 2*(1-t)*t*my + t*t*p2.sy;
      ctx.beginPath();
      ctx.arc(bx, by, 3, 0, Math.PI*2);
      ctx.fillStyle = color;
      ctx.fill();
    }
    ctx.restore();
  };

  // ════ MAIN RENDER ════
  window.swe67Render = function(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const d = window.spatialV67Data;
    d.frame++;

    // Auto rotate
    if (d.autoRotate) d.rotation = (d.rotation + 0.15) % 360;

    // Rebuild nodes if needed
    const year = window.year || 0;
    if (d.worldNodes.length === 0 || year - d.lastBuilt > 50) {
      window.swe67BuildWorldNodes();
    }

    // Background + grid
    window.swe67DrawGrid(ctx, w, h, d.frame);

    // Center
    const cx = w / 2 + d.panX;
    const cy = h / 2 + d.panY;

    // Project all nodes
    const projected = d.worldNodes.map(node => {
      const p = window.swe67Project(node.x, node.y, node.z, cx, cy, w, h, d.zoom, d.rotation, d.tilt);
      return { node, ...p };
    });

    // Sort by depth (back-to-front)
    projected.sort((a, b) => b.depth - a.depth);

    // Draw arcs first
    d.worldArcs.forEach(arc => {
      const p1 = projected.find(p => p.node.id === arc.from.id);
      const p2 = projected.find(p => p.node.id === arc.to.id);
      window.swe67DrawArc(ctx, p1, p2, arc.type, arc.color, d.frame);
    });

    // Draw nodes
    projected.forEach(p => {
      const sel = d.selectedEntity && d.selectedEntity.id === p.node.id;
      const hov = d.hoveredEntity && d.hoveredEntity.id === p.node.id;
      window.swe67DrawNode(ctx, p.sx, p.sy, p.node, p.scale, sel, hov);
    });

    // World title
    ctx.save();
    ctx.fillStyle = "rgba(0,245,255,0.8)";
    ctx.font = "bold 14px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.shadowColor = "#00f5ff";
    ctx.shadowBlur = 10;
    ctx.fillText(`SPATIAL VIEW · YEAR ${year} · ${d.worldNodes.length} ENTITIES`, 12, 20);
    ctx.fillStyle = "rgba(0,245,255,0.4)";
    ctx.font = "11px 'Courier New', monospace";
    ctx.fillText(`ROT:${Math.round(d.rotation)}° ZOOM:${d.zoom.toFixed(1)}x  DRAG TO ROTATE · SCROLL ZOOM`, 12, h - 10);
    ctx.restore();

    // Selected info
    if (d.selectedEntity) {
      const e = d.selectedEntity;
      ctx.save();
      ctx.fillStyle = "rgba(0,10,30,0.9)";
      ctx.strokeStyle = e.color || "#00f5ff";
      ctx.lineWidth = 1;
      const bw = 180, bh = 70, bx = w - bw - 10, by = 10;
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeRect(bx, by, bw, bh);
      ctx.fillStyle = e.color || "#00f5ff";
      ctx.font = "bold 12px 'Courier New', monospace";
      ctx.textAlign = "left";
      ctx.fillText(e.name, bx + 8, by + 18);
      ctx.fillStyle = "rgba(0,245,255,0.6)";
      ctx.font = "10px 'Courier New', monospace";
      ctx.fillText("TYPE: " + (e.type || "?").toUpperCase(), bx + 8, by + 33);
      if (e.population) ctx.fillText("POP: " + e.population, bx + 8, by + 46);
      if (e.stability) ctx.fillText("STAB: " + e.stability + "%", bx + 8, by + 58);
      ctx.restore();
    }
  };

  // ════ MOUSE HANDLERS ════
  window.swe67AttachMouse = function(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const d = window.spatialV67Data;

    canvas.addEventListener("mousedown", function(e) {
      d.dragging = true;
      d.autoRotate = false;
      d.lastMouse = { x: e.offsetX, y: e.offsetY };
    });
    canvas.addEventListener("mousemove", function(e) {
      if (d.dragging) {
        const dx = e.offsetX - d.lastMouse.x;
        d.rotation = (d.rotation + dx * 0.5) % 360;
        d.panY += (e.offsetY - d.lastMouse.y) * 0.3;
        d.lastMouse = { x: e.offsetX, y: e.offsetY };
      }
      // Hover detect
      _detectHover(e.offsetX, e.offsetY, canvas);
    });
    canvas.addEventListener("mouseup", function(e) {
      if (!d.dragging) return;
      d.dragging = false;
      // Click select
      _detectClick(e.offsetX, e.offsetY, canvas);
    });
    canvas.addEventListener("wheel", function(e) {
      e.preventDefault();
      d.zoom = Math.max(0.3, Math.min(4, d.zoom - e.deltaY * 0.001));
    }, { passive: false });

    // Double-click: auto-rotate toggle
    canvas.addEventListener("dblclick", function() {
      d.autoRotate = !d.autoRotate;
    });
  };

  function _detectHover(mx, my, canvas) {
    const d = window.spatialV67Data;
    const w = canvas.width, h = canvas.height;
    const cx = w / 2 + d.panX, cy = h / 2 + d.panY;
    let best = null, bestDist = 30;
    d.worldNodes.forEach(node => {
      const p = window.swe67Project(node.x, node.y, node.z, cx, cy, w, h, d.zoom, d.rotation, d.tilt);
      const dist = Math.sqrt((p.sx - mx) ** 2 + (p.sy - my) ** 2);
      if (dist < bestDist) { best = node; bestDist = dist; }
    });
    d.hoveredEntity = best;
    canvas.style.cursor = best ? "pointer" : "default";
  }

  function _detectClick(mx, my, canvas) {
    const d = window.spatialV67Data;
    const w = canvas.width, h = canvas.height;
    const cx = w / 2 + d.panX, cy = h / 2 + d.panY;
    let best = null, bestDist = 40;
    d.worldNodes.forEach(node => {
      const p = window.swe67Project(node.x, node.y, node.z, cx, cy, w, h, d.zoom, d.rotation, d.tilt);
      const dist = Math.sqrt((p.sx - mx) ** 2 + (p.sy - my) ** 2);
      if (dist < bestDist) { best = node; bestDist = dist; }
    });
    d.selectedEntity = best;
    // Notify other systems
    if (best && typeof window.sge67OnEntitySelect === "function") {
      window.sge67OnEntitySelect(best);
    }
    // Update god mode UI
    if (best) {
      const el = document.getElementById("sge67-selected-display");
      if (el) el.innerHTML = `<span style="color:${best.color||'#00f5ff'}">${best.name}</span> [${(best.type||'?').toUpperCase()}]`;
    }
  }

  // ════ ANIMATION LOOP ════
  window.swe67StartLoop = function(canvasId) {
    let running = true;
    function loop() {
      if (!document.getElementById(canvasId)) { running = false; return; }
      window.swe67Render(canvasId);
      if (running) requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    // Store stop function
    window.spatialV67Data._stopLoop = function() { running = false; };
  };

  window.swe67StopLoop = function() {
    if (window.spatialV67Data._stopLoop) window.spatialV67Data._stopLoop();
  };

  function init() {
    window.swe67BuildWorldNodes();
    console.log("[SpatialWorldEngineV67] 🌍 Spatial Engine khởi động — Canvas holographic world ready.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 14600); });
  } else {
    setTimeout(init, 14600);
  }
})();
