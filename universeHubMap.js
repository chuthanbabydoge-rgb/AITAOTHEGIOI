(function() {
  "use strict";

  window.universeMapV73 = {
    canvas: null,
    ctx: null,
    animFrame: null,
    nodes: [],
    connections: [],
    camera: { x: 0, y: 0, zoom: 1 },
    selected: null,
    time: 0
  };

  var WORLD_COLORS = {
    featured: "#f59e0b",
    portal:   "#8b5cf6",
    visited:  "#10b981",
    default:  "#3b82f6",
    player:   "#ef4444"
  };

  function buildNodes(worlds, portals, visited, playerProfile) {
    var positions = [
      { x: 0.5, y: 0.5 },
      { x: 0.25, y: 0.3 },
      { x: 0.75, y: 0.25 },
      { x: 0.2, y: 0.7 },
      { x: 0.8, y: 0.7 },
      { x: 0.5, y: 0.15 },
      { x: 0.5, y: 0.85 },
      { x: 0.85, y: 0.5 },
      { x: 0.15, y: 0.5 }
    ];
    var nodes = worlds.map(function(w, i) {
      var pos = positions[i % positions.length];
      var hasPortal = portals && portals.some(function(p) { return p.worldId === w.id; });
      var isVisited = visited && visited.includes(w.id);
      var color = hasPortal ? WORLD_COLORS.portal : (w.featured ? WORLD_COLORS.featured : (isVisited ? WORLD_COLORS.visited : WORLD_COLORS.default));
      return { id: w.id, name: w.name, x: pos.x, y: pos.y, r: Math.max(8, Math.min(18, Math.log(w.population / 100000 + 1) * 4)), color, featured: w.featured, hasPortal, isVisited, civScore: w.civScore, population: w.population };
    });
    if (playerProfile && playerProfile.worldCount > 0) {
      nodes.push({ id: "player_world", name: playerProfile.creatorName + " (Bạn)", x: 0.5, y: 0.5, r: 14, color: WORLD_COLORS.player, isPlayer: true, civScore: playerProfile.civilizationScore });
    }
    return nodes;
  }

  function buildConnections(connections, nodes) {
    return (connections || []).map(function(c) {
      var from = nodes.find(function(n) { return n.id === c.from; });
      var to   = nodes.find(function(n) { return n.id === c.to; });
      if (!from || !to) return null;
      var typeColor = { portal: "#8b5cf6", alliance: "#3b82f6", trade: "#10b981" }[c.type] || "#6b7280";
      return { from, to, type: c.type, strength: c.strength, color: typeColor };
    }).filter(Boolean);
  }

  window.umap73Init = function(canvasId) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return false;
    window.universeMapV73.canvas = canvas;
    window.universeMapV73.ctx = canvas.getContext("2d");

    var d = typeof window.uhub73GetData === "function" ? window.uhub73GetData() : {};
    var worlds  = window.UHUB73_DEMO_WORLDS || [];
    var portals = d.portals || [];
    var visited = d.visited || [];
    var profile = d.playerProfile || {};

    window.universeMapV73.nodes = buildNodes(worlds, portals, visited, profile);
    var mapData = d.universeMap || { connections: [] };
    window.universeMapV73.connections = buildConnections(mapData.connections, window.universeMapV73.nodes);

    canvas.onclick = function(e) {
      var rect = canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var my = e.clientY - rect.top;
      var W = canvas.width, H = canvas.height;
      window.universeMapV73.nodes.forEach(function(node) {
        var nx = node.x * W, ny = node.y * H;
        var dist = Math.sqrt((mx - nx) * (mx - nx) + (my - ny) * (my - ny));
        if (dist < node.r + 6) {
          window.universeMapV73.selected = node;
          if (typeof window.umap73OnSelect === "function") window.umap73OnSelect(node);
        }
      });
    };

    umap73Render();
    return true;
  };

  function umap73Render() {
    var state = window.universeMapV73;
    var canvas = state.canvas;
    var ctx = state.ctx;
    if (!canvas || !ctx) return;

    var W = canvas.width = canvas.offsetWidth || 320;
    var H = canvas.height = canvas.offsetHeight || 280;
    state.time += 0.02;

    ctx.fillStyle = "#050510";
    ctx.fillRect(0, 0, W, H);

    for (var i = 0; i < 60; i++) {
      var sx = ((i * 137 + 23) % 100) / 100 * W;
      var sy = ((i * 97 + 11) % 100) / 100 * H;
      var br = 0.4 + 0.3 * Math.sin(state.time + i);
      ctx.fillStyle = "rgba(200,200,255," + br + ")";
      ctx.beginPath(); ctx.arc(sx, sy, 1, 0, Math.PI * 2); ctx.fill();
    }

    state.connections.forEach(function(conn) {
      var x1 = conn.from.x * W, y1 = conn.from.y * H;
      var x2 = conn.to.x * W,   y2 = conn.to.y * H;
      ctx.strokeStyle = conn.color + "66";
      ctx.lineWidth = Math.max(1, conn.strength / 5);
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = -state.time * 2;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.setLineDash([]);
    });

    state.nodes.forEach(function(node) {
      var nx = node.x * W, ny = node.y * H;
      var r = node.r;
      var isSelected = state.selected && state.selected.id === node.id;

      if (node.hasPortal || node.featured) {
        var glow = ctx.createRadialGradient(nx, ny, r * 0.5, nx, ny, r * 2.5);
        glow.addColorStop(0, node.color + "44");
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(nx, ny, r * 2.5, 0, Math.PI * 2); ctx.fill();
      }

      if (isSelected) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(nx, ny, r + 4, 0, Math.PI * 2); ctx.stroke();
      }

      var grad = ctx.createRadialGradient(nx - r * 0.3, ny - r * 0.3, r * 0.1, nx, ny, r);
      grad.addColorStop(0, node.color + "ff");
      grad.addColorStop(1, node.color + "88");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI * 2); ctx.fill();

      if (node.isPlayer) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(nx, ny, r + 2 + Math.sin(state.time * 2) * 2, 0, Math.PI * 2); ctx.stroke();
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var shortName = node.name.split("—")[0].split(" ")[0].substring(0, 8);
      ctx.fillText(shortName, nx, ny + r + 9);
    });

    state.animFrame = requestAnimationFrame(umap73Render);
  }

  window.umap73Stop = function() {
    if (window.universeMapV73.animFrame) {
      cancelAnimationFrame(window.universeMapV73.animFrame);
      window.universeMapV73.animFrame = null;
    }
  };

  window.umap73Refresh = function(canvasId) {
    umap73Stop();
    window.umap73Init(canvasId);
  };

  function init() {
    console.log("[Universe Hub Map V73] 🗺️ Canvas Map Engine sẵn sàng");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 17900); });
  } else {
    setTimeout(init, 17900);
  }
})();
