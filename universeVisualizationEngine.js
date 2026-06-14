(function() {
  "use strict";

  // ════════════════════════════════════════
  // UNIVERSE VISUALIZATION ENGINE V67
  // Universe Table — Sa Bàn Sống
  // Shows multiverse, parallel worlds, cosmos
  // ════════════════════════════════════════

  window.universeVisV67Data = {
    version: 67,
    frame: 0,
    stars: [],         // Background stars
    worlds: [],        // Multiverse worlds
    particles: [],     // Energy particles
    nebulaSeeds: [],   // Nebula clusters
    zoom: 1,
    panX: 0, panY: 0,
    dragging: false, lastMouse: {x:0,y:0},
    selectedWorld: null,
    cameraAngle: 0
  };

  // ════ BUILD UNIVERSE DATA ════
  window.uv67BuildUniverse = function(w, h) {
    const d = window.universeVisV67Data;
    d.stars = [];
    d.worlds = [];
    d.nebulaSeeds = [];
    d.particles = [];

    // Stars (background)
    for (let i = 0; i < 200; i++) {
      d.stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5,
        brightness: 0.3 + Math.random() * 0.7,
        twinkle: Math.random() * Math.PI * 2
      });
    }

    // Nebula clusters
    for (let i = 0; i < 5; i++) {
      d.nebulaSeeds.push({
        x: 80 + Math.random() * (w - 160),
        y: 80 + Math.random() * (h - 160),
        rx: 40 + Math.random() * 80,
        ry: 30 + Math.random() * 60,
        color: ["#4c1d95","#0c4a6e","#1e3a5f","#3b0764","#164e63"][i % 5]
      });
    }

    // Main world (current simulation)
    d.worlds.push({
      id: "main", label: "Thế Giới Hiện Tại",
      x: w / 2, y: h / 2, r: 28,
      color: "#00f5ff", glowColor: "#00f5ff",
      type: "main", ring: true,
      data: { year: window.year || 0, npcs: (window.npcs || []).length, countries: (window.countries || []).length }
    });

    // Parallel worlds from multiverse
    if (window.multiverseData && window.multiverseData.worlds) {
      const mws = Array.isArray(window.multiverseData.worlds)
        ? window.multiverseData.worlds : Object.values(window.multiverseData.worlds || {});
      mws.slice(0, 12).forEach((mw, i) => {
        const angle = (i / Math.max(1, mws.length)) * Math.PI * 2;
        const dist = 100 + Math.random() * 60;
        d.worlds.push({
          id: "mw_" + i, label: mw.name || ("World " + (i + 1)),
          x: w/2 + Math.cos(angle) * dist,
          y: h/2 + Math.sin(angle) * dist,
          r: 12 + Math.random() * 8,
          color: "#a855f7", glowColor: "#c084fc",
          type: "parallel",
          data: mw
        });
      });
    } else {
      // Generate placeholder parallel worlds
      const worldNames = ["Thế Giới Bóng Tối","Kỷ Nguyên Lửa","Đại Dương Vô Tận","Hư Không","Cõi Thiêng","Bình Nguyên Bất Tử","Vũ Trụ Gương","Xứ Sở Nguyên Thủy"];
      worldNames.slice(0, 8).forEach((name, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const dist = 110 + (i % 3) * 25;
        d.worlds.push({
          id: "gen_" + i, label: name,
          x: w/2 + Math.cos(angle) * dist,
          y: h/2 + Math.sin(angle) * dist,
          r: 10 + (i % 4) * 3,
          color: ["#a855f7","#f59e0b","#60a5fa","#34d399","#f472b6","#818cf8","#06b6d4","#84cc16"][i],
          glowColor: ["#c084fc","#fbbf24","#93c5fd","#6ee7b7","#fb7185","#a5b4fc","#22d3ee","#bef264"][i],
          type: "parallel",
          data: { name }
        });
      });
    }

    // God artifacts orbiting main world
    if (window.divineArtifactV66Data && window.divineArtifactV66Data.artifacts) {
      window.divineArtifactV66Data.artifacts.slice(0, 5).forEach((art, i) => {
        const angle = (i / 5) * Math.PI * 2;
        d.particles.push({
          type: "artifact", label: art.icon + " " + art.name,
          x: w/2 + Math.cos(angle) * 50,
          y: h/2 + Math.sin(angle) * 50,
          orbitAngle: angle, orbitRadius: 50, orbitSpeed: 0.003,
          color: "#fbbf24", r: 4
        });
      });
    }

    // Energy particles
    for (let i = 0; i < 50; i++) {
      d.particles.push({
        type: "energy",
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        color: ["#00f5ff","#a855f7","#f59e0b","#4ade80"][Math.floor(Math.random()*4)],
        r: 0.5 + Math.random() * 1.5,
        life: Math.random()
      });
    }
  };

  // ════ RENDER UNIVERSE TABLE ════
  window.uv67Render = function(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    const d = window.universeVisV67Data;
    d.frame++;
    const year = window.year || 0;

    if (d.worlds.length === 0) window.uv67BuildUniverse(w, h);

    // Deep space background
    ctx.fillStyle = "#000008";
    ctx.fillRect(0, 0, w, h);

    // Nebula
    d.nebulaSeeds.forEach(n => {
      ctx.save();
      const ng = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, Math.max(n.rx, n.ry));
      ng.addColorStop(0, n.color + "55");
      ng.addColorStop(1, n.color + "00");
      ctx.fillStyle = ng;
      ctx.scale(1, n.ry / n.rx);
      ctx.beginPath();
      ctx.arc(n.x, n.y * (n.rx / n.ry), n.rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Stars
    d.stars.forEach(s => {
      const twinkle = 0.5 + 0.5 * Math.sin(d.frame * 0.03 + s.twinkle);
      ctx.fillStyle = `rgba(200,220,255,${s.brightness * twinkle})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * twinkle, 0, Math.PI * 2);
      ctx.fill();
    });

    // Pan/zoom
    ctx.save();
    ctx.translate(d.panX, d.panY);
    ctx.scale(d.zoom, d.zoom);

    // Ley lines (connecting worlds)
    d.worlds.forEach((world, i) => {
      if (i === 0) return;
      const main = d.worlds[0];
      ctx.save();
      ctx.strokeStyle = world.color + "20";
      ctx.lineWidth = 0.5;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.moveTo(main.x, main.y);
      ctx.lineTo(world.x, world.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    });

    // Energy particles update + draw
    d.particles.forEach(p => {
      if (p.type === "energy") {
        p.x += p.vx; p.y += p.vy;
        p.life += 0.005;
        if (p.life > 1) p.life = 0;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        const alpha = Math.sin(p.life * Math.PI);
        ctx.fillStyle = p.color + Math.floor(alpha * 180).toString(16).padStart(2, "0");
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
      } else if (p.type === "artifact") {
        // Orbit around main world
        p.orbitAngle += p.orbitSpeed;
        const main = d.worlds[0];
        p.x = main.x + Math.cos(p.orbitAngle) * p.orbitRadius;
        p.y = main.y + Math.sin(p.orbitAngle) * p.orbitRadius;
        ctx.save();
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 8;
        ctx.fillStyle = "#fbbf24dd";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 1, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#fbbf24";
        ctx.font = "8px monospace";
        ctx.textAlign = "center";
        ctx.fillText(p.label.charAt(0), p.x, p.y + 3);
        ctx.restore();
      }
    });

    // Worlds
    d.worlds.forEach(world => {
      const pulse = Math.sin(d.frame * 0.04) * (world.type === "main" ? 4 : 2);
      const r = world.r + pulse;
      const sel = d.selectedWorld && d.selectedWorld.id === world.id;

      ctx.save();
      ctx.shadowColor = world.glowColor || world.color;
      ctx.shadowBlur = sel ? 40 : 20;

      // Outer ring for main
      if (world.ring || sel) {
        ctx.strokeStyle = world.color + "44";
        ctx.lineWidth = sel ? 2 : 1;
        ctx.beginPath();
        ctx.arc(world.x, world.y, r + 12, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Planet body
      const pg = ctx.createRadialGradient(world.x - r * 0.3, world.y - r * 0.3, 0, world.x, world.y, r);
      pg.addColorStop(0, world.color + "ff");
      pg.addColorStop(0.6, world.color + "aa");
      pg.addColorStop(1, world.color + "33");
      ctx.beginPath();
      ctx.arc(world.x, world.y, r, 0, Math.PI * 2);
      ctx.fillStyle = pg;
      ctx.fill();

      // Label
      ctx.shadowBlur = 6;
      ctx.fillStyle = world.color;
      ctx.font = `${world.type === "main" ? 11 : 9}px 'Courier New', monospace`;
      ctx.textAlign = "center";
      ctx.fillText(world.label.substring(0, 16), world.x, world.y + r + 14);
      if (world.type === "main" && world.data) {
        ctx.font = "8px monospace";
        ctx.fillStyle = world.color + "88";
        ctx.fillText(`NPC:${world.data.npcs} · YEAR:${world.data.year}`, world.x, world.y + r + 24);
      }

      ctx.restore();
    });

    ctx.restore(); // end pan/zoom

    // HUD
    ctx.save();
    ctx.fillStyle = "rgba(168,85,247,0.8)";
    ctx.font = "12px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.shadowColor = "#a855f7";
    ctx.shadowBlur = 8;
    ctx.fillText(`UNIVERSE TABLE · SA BÀN SỐNG · YEAR ${year}`, 10, 18);
    ctx.fillStyle = "rgba(168,85,247,0.4)";
    ctx.font = "10px 'Courier New', monospace";
    ctx.fillText(`${d.worlds.length} WORLDS · SCROLL ZOOM · DRAG PAN · DBL-CLICK SELECT`, 10, 33);
    ctx.restore();
  };

  // ════ MOUSE ════
  window.uv67AttachMouse = function(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const d = window.universeVisV67Data;
    canvas.addEventListener("mousedown", e => { d.dragging = true; d.lastMouse = {x:e.offsetX, y:e.offsetY}; });
    canvas.addEventListener("mousemove", e => {
      if (d.dragging) {
        d.panX += e.offsetX - d.lastMouse.x;
        d.panY += e.offsetY - d.lastMouse.y;
        d.lastMouse = {x:e.offsetX, y:e.offsetY};
      }
    });
    canvas.addEventListener("mouseup", () => { d.dragging = false; });
    canvas.addEventListener("wheel", e => {
      e.preventDefault();
      d.zoom = Math.max(0.3, Math.min(4, d.zoom - e.deltaY * 0.001));
    }, {passive: false});
    canvas.addEventListener("dblclick", e => {
      const wx = (e.offsetX - d.panX) / d.zoom;
      const wy = (e.offsetY - d.panY) / d.zoom;
      let best = null, bd = 40;
      d.worlds.forEach(w => {
        const dist = Math.sqrt((w.x - wx)**2 + (w.y - wy)**2);
        if (dist < bd) { best = w; bd = dist; }
      });
      d.selectedWorld = best;
    });
  };

  window.uv67StartLoop = function(canvasId) {
    let running = true;
    window.uv67AttachMouse(canvasId);
    function loop() {
      if (!document.getElementById(canvasId)) { running = false; return; }
      window.uv67Render(canvasId);
      if (running) requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    window.universeVisV67Data._stop = function() { running = false; };
  };

  function init() {
    console.log("[UniverseVisualizationEngineV67] 🌌 Universe Table khởi động — Sa Bàn Sống sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 14800); });
  } else {
    setTimeout(init, 14800);
  }
})();
