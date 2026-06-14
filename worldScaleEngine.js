(function () {
  "use strict";
  const SAVE_KEY = "cgv6_world_scale_v70";

  window.worldScaleV70Data = {
    version: "V70",
    initialized: false,
    canvasId: "wse70-canvas",
    frame: 0,
    renderScale: 1.0,
    viewportX: 0,
    viewportY: 0,
    nodes: [],
    activeLevel: 2,
    levelData: {},
    animating: false,
    selectedNode: null,
    hoverNode: null,
    lastRenderScale: null,
  };

  const D = window.worldScaleV70Data;

  const LEVEL_COLORS = {
    0: { bg: "#00000f", primary: "#c084fc", secondary: "#7c3aed", glow: "rgba(192,132,252,0.4)" },
    1: { bg: "#000814", primary: "#38bdf8", secondary: "#0284c7", glow: "rgba(56,189,248,0.4)" },
    2: { bg: "#001020", primary: "#00f5ff", secondary: "#0891b2", glow: "rgba(0,245,255,0.4)" },
    3: { bg: "#001808", primary: "#4ade80", secondary: "#16a34a", glow: "rgba(74,222,128,0.4)" },
    4: { bg: "#100808", primary: "#f59e0b", secondary: "#b45309", glow: "rgba(245,158,11,0.4)" },
    5: { bg: "#0a0810", primary: "#c084fc", secondary: "#7c3aed", glow: "rgba(192,132,252,0.4)" },
    6: { bg: "#0c0c0c", primary: "#94a3b8", secondary: "#475569", glow: "rgba(148,163,184,0.3)" },
    7: { bg: "#0a0a0a", primary: "#fcd34d", secondary: "#d97706", glow: "rgba(252,211,77,0.3)" },
    8: { bg: "#080808", primary: "#fb7185", secondary: "#e11d48", glow: "rgba(251,113,133,0.4)" },
  };

  function buildLevelNodes(level) {
    const nodes = [];
    const countries = window.countries || [];
    const npcs = (window.npcs || []).filter(function (n) { return n.status === "alive"; });
    const kings = window.kingdomData ? (Array.isArray(window.kingdomData.kingdoms) ? window.kingdomData.kingdoms : Object.values(window.kingdomData.kingdoms || {})) : [];
    const emps = window.empireData ? (Array.isArray(window.empireData.empires) ? window.empireData.empires : Object.values(window.empireData.empires || {})) : [];
    const wars = window.warsActive || [];

    function hashPos(name, i, total, spread) {
      let h = 0;
      for (let k = 0; k < name.length; k++) h = (h * 31 + name.charCodeAt(k)) & 0xffffffff;
      const angle = ((h & 0xffff) / 0xffff) * Math.PI * 2;
      const r = spread * (0.3 + (((h >> 16) & 0xffff) / 0xffff) * 0.6);
      return { x: 0.5 + Math.cos(angle) * r, y: 0.5 + Math.sin(angle) * r * 0.6 };
    }

    if (level === 0) {
      const worlds = (window.multiverseData && window.multiverseData.worlds) ? window.multiverseData.worlds.slice(0, 12) : [];
      if (!worlds.length) {
        for (let i = 0; i < 8; i++) {
          nodes.push({ type: "world", name: "Universe " + (i + 1), id: "u" + i, pos: hashPos("u" + i, i, 8, 0.4), size: 10 + Math.random() * 6, color: "#c084fc" });
        }
      } else {
        worlds.forEach(function (w, i) { nodes.push({ type: "world", name: w.name || "World " + i, id: w.id, pos: hashPos(w.name || "w" + i, i, worlds.length, 0.4), size: 12, color: "#c084fc" }); });
      }
    } else if (level === 1) {
      for (let i = 0; i < 9; i++) {
        nodes.push({ type: "galaxy", name: ["Ngân Hà Chính", "Thiên Hà Bóng", "Thiên Hà Lửa", "Thiên Hà Băng", "Thiên Hà Hư", "Thiên Hà Thần", "Thiên Hà Ma", "Thiên Hà Rồng", "Thiên Hà Vô Cực"][i], id: "g" + i, pos: hashPos("g" + i, i, 9, 0.38), size: 14, color: "#38bdf8" });
      }
    } else if (level === 2) {
      const rMap = {};
      countries.slice(0, 30).forEach(function (c) {
        const r = c.region || "Central";
        if (!rMap[r]) { const pos = hashPos(r, 0, 1, 0.35); rMap[r] = { type: "region", name: r, id: r, pos, size: 8, color: "#00f5ff", children: [] }; }
        rMap[r].children.push(c);
      });
      Object.values(rMap).forEach(function (r) { nodes.push(r); });
      wars.slice(0, 5).forEach(function (w) {
        const a = rMap[w.attacker] || rMap[Object.keys(rMap)[0]];
        const b = rMap[w.defender] || rMap[Object.keys(rMap)[1]];
        if (a && b) nodes.push({ type: "war_arc", from: a.pos, to: b.pos, id: w.id || ("war" + Math.random()), color: "#ef4444" });
      });
    } else if (level === 3) {
      const regions = {};
      countries.forEach(function (c) { const r = c.region || "Central"; regions[r] = (regions[r] || 0) + 1; });
      Object.entries(regions).forEach(function (kv, i) {
        const pos = hashPos(kv[0], i, Object.keys(regions).length, 0.4);
        nodes.push({ type: "region", name: kv[0], id: kv[0], pos, size: 10 + Math.min(kv[1], 10), color: "#4ade80", subCount: kv[1] });
      });
    } else if (level === 4) {
      kings.slice(0, 8).forEach(function (k, i) {
        const pos = hashPos(k.name || "k" + i, i, kings.length || 1, 0.35);
        nodes.push({ type: "kingdom", name: k.name || "Kingdom " + i, id: k.id || "k" + i, pos, size: 9, color: "#a855f7" });
      });
      emps.slice(0, 6).forEach(function (e, i) {
        const pos = hashPos(e.name || "e" + i, i, emps.length || 1, 0.28);
        nodes.push({ type: "empire", name: e.name || "Empire " + i, id: e.id || "e" + i, pos, size: 13, color: "#f59e0b" });
      });
    } else if (level === 5) {
      const focusName = window.immersionEngineV70Data && window.immersionEngineV70Data.focus.entityName;
      const subset = focusName ? countries.filter(function (c) { return c.region === focusName || c.name === focusName; }).slice(0, 12) : countries.slice(0, 12);
      subset.forEach(function (c, i) {
        const pos = hashPos(c.name, i, subset.length, 0.4);
        const pop = c.population || 1000;
        nodes.push({ type: "city", name: c.name, id: c.id || c.name, pos, size: 7 + Math.min(Math.log10(pop), 5), color: "#c084fc", population: pop, economy: c.economy || 0 });
      });
      npcs.slice(0, 20).forEach(function (n, i) {
        const base = nodes[i % Math.max(nodes.length, 1)] || { pos: { x: 0.5, y: 0.5 } };
        nodes.push({ type: "npc_dot", name: n.name, id: n.id, pos: { x: base.pos.x + (Math.random() - 0.5) * 0.08, y: base.pos.y + (Math.random() - 0.5) * 0.08 }, size: 3, color: "#4ade80" });
      });
    } else if (level === 6) {
      const dists = ["Trung Tâm", "Thương Mại", "Dân Cư", "Tôn Giáo", "Quân Sự", "Cảng Biển", "Học Viện", "Chợ Phiên"];
      dists.forEach(function (d, i) {
        const angle = (i / dists.length) * Math.PI * 2;
        nodes.push({ type: "district", name: d, id: "dist" + i, pos: { x: 0.5 + Math.cos(angle) * 0.3, y: 0.5 + Math.sin(angle) * 0.22 }, size: 10, color: "#94a3b8" });
      });
    } else if (level === 7) {
      const buildings = ["🏰 Tòa Thị Chính", "⛪ Đền Thờ", "🏪 Chợ Lớn", "🏨 Quán Trọ", "⚔️ Doanh Trại", "📚 Thư Viện", "🔨 Lò Rèn", "🌾 Nông Trang"];
      buildings.forEach(function (b, i) {
        const angle = (i / buildings.length) * Math.PI * 2;
        nodes.push({ type: "building", name: b, id: "bld" + i, pos: { x: 0.5 + Math.cos(angle) * 0.32, y: 0.5 + Math.sin(angle) * 0.24 }, size: 12, color: "#fcd34d" });
      });
    } else if (level === 8) {
      const focusId = window.immersionEngineV70Data && window.immersionEngineV70Data.focus.entityId;
      const focusNpc = focusId ? (window.npcs || []).find(function (n) { return n.id === focusId; }) : (window.npcs || []).find(function (n) { return n.status === "alive"; });
      if (focusNpc) {
        nodes.push({ type: "npc_focus", name: focusNpc.name, id: focusNpc.id, pos: { x: 0.5, y: 0.4 }, size: 22, color: "#fb7185", data: focusNpc });
        const family = (window.npcFamilyV65Data && window.npcFamilyV65Data.families) ? Object.values(window.npcFamilyV65Data.families).find(function (f) { return f.members && f.members.includes(focusNpc.id); }) : null;
        if (family && family.members) {
          family.members.slice(0, 5).forEach(function (mid, i) {
            const mn = (window.npcs || []).find(function (n) { return n.id === mid; });
            if (mn && mn.id !== focusNpc.id) {
              const angle = (i / 5) * Math.PI * 2;
              nodes.push({ type: "family_member", name: mn.name, id: mn.id, pos: { x: 0.5 + Math.cos(angle) * 0.28, y: 0.6 + Math.sin(angle) * 0.18 }, size: 10, color: "#f97316" });
            }
          });
        }
        const memories = (window.npcMemoryV64Data && window.npcMemoryV64Data.npcMemories) ? (window.npcMemoryV64Data.npcMemories[focusNpc.id] || []).slice(0, 4) : [];
        memories.forEach(function (m, i) {
          nodes.push({ type: "memory", name: m.title || "Ký ức " + (i + 1), id: "mem" + i, pos: { x: 0.15 + i * 0.22, y: 0.82 }, size: 7, color: "#c084fc", data: m });
        });
      }
    }

    return nodes;
  }

  function renderLevel(canvasEl, level) {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext("2d");
    const W = canvasEl.width = canvasEl.offsetWidth || 600;
    const H = canvasEl.height = canvasEl.offsetHeight || 300;
    const colors = LEVEL_COLORS[level] || LEVEL_COLORS[2];

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 120; i++) {
      const sx = ((i * 1973 + level * 137) % 997) / 997 * W;
      const sy = ((i * 3847 + level * 251) % 887) / 887 * H;
      const br = 0.3 + 0.7 * Math.sin(D.frame * 0.02 + i);
      ctx.fillStyle = "rgba(255,255,255," + (br * 0.15) + ")";
      ctx.beginPath();
      ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    const nodes = buildLevelNodes(level);
    D.nodes = nodes;

    nodes.forEach(function (node) {
      if (node.type === "war_arc") {
        const fx = node.from.x * W, fy = node.from.y * H;
        const tx = node.to.x * W, ty = node.to.y * H;
        const mx = (fx + tx) / 2, my = (fy + ty) / 2 - 40;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.quadraticCurveTo(mx, my, tx, ty);
        ctx.strokeStyle = "rgba(239,68,68,0.6)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        const prog = (D.frame * 0.02) % 1;
        const px = fx + (tx - fx) * prog + (mx - (fx + tx) / 2) * Math.sin(Math.PI * prog);
        const py = fy + (ty - fy) * prog + (my - (fy + ty) / 2) * Math.sin(Math.PI * prog);
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      const x = node.pos.x * W, y = node.pos.y * H;
      const r = node.size;
      const pulse = 1 + 0.12 * Math.sin(D.frame * 0.03 + (node.id ? node.id.charCodeAt(0) : 0));
      const pr = r * pulse;

      const grad = ctx.createRadialGradient(x, y, 0, x, y, pr * 1.5);
      grad.addColorStop(0, node.color + "cc");
      grad.addColorStop(0.5, node.color + "66");
      grad.addColorStop(1, node.color + "00");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, pr * 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, pr, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = node.color;
      ctx.fill();
      ctx.shadowBlur = 0;

      if (D.selectedNode && D.selectedNode.id === node.id) {
        ctx.beginPath();
        ctx.arc(x, y, pr + 4, 0, Math.PI * 2);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (r >= 6) {
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = "bold " + Math.max(9, r * 0.8) + "px serif";
        ctx.textAlign = "center";
        ctx.fillText(node.name.substring(0, 12), x, y + pr + 13);
      }
    });

    const scaleDef = window.imm70GetAllScales ? window.imm70GetAllScales()[level] : { icon: "🌍", name: "" };
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "bold 13px serif";
    ctx.textAlign = "left";
    ctx.fillText(scaleDef.icon + " " + scaleDef.name + " — Năm " + (window.year || 1), 12, H - 10);

    D.frame++;
  }

  function setupCanvas(canvasEl) {
    if (!canvasEl) return;
    canvasEl.addEventListener("click", function (e) {
      const rect = canvasEl.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      let closest = null, bestDist = 0.05;
      D.nodes.forEach(function (node) {
        if (node.type === "war_arc") return;
        const dx = node.pos.x - mx, dy = node.pos.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < bestDist) { bestDist = dist; closest = node; }
      });
      if (closest) {
        D.selectedNode = closest;
        if (typeof imm70SetFocus === "function") imm70SetFocus({ entityType: closest.type, entityId: closest.id, entityName: closest.name });
        if (typeof wse70OnNodeSelect === "function") wse70OnNodeSelect(closest);
        if (typeof imm70RefreshUI === "function") imm70RefreshUI();
      }
    });

    canvasEl.addEventListener("wheel", function (e) {
      if (e.deltaY < 0) { if (typeof imm70ZoomIn === "function") imm70ZoomIn(); }
      else { if (typeof imm70ZoomOut === "function") imm70ZoomOut(); }
      e.preventDefault();
      setTimeout(function () { if (typeof imm70RefreshUI === "function") imm70RefreshUI(); }, 400);
    }, { passive: false });
  }

  function startRenderLoop(canvasId) {
    D.canvasId = canvasId || D.canvasId;
    function loop() {
      const el = document.getElementById(D.canvasId);
      if (el && el.offsetParent !== null) {
        const level = window.immersionEngineV70Data ? window.immersionEngineV70Data.currentScale : 2;
        renderLevel(el, level);
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  window.worldScaleV70Data = D;
  window.wse70RenderLevel = renderLevel;
  window.wse70StartLoop = startRenderLoop;
  window.wse70SetupCanvas = setupCanvas;
  window.wse70GetNodes = function () { return D.nodes.slice(); };
  window.wse70GetLevelColors = function (l) { return LEVEL_COLORS[l !== undefined ? l : 2]; };

  function init() {
    D.initialized = true;
    console.log("[worldScaleEngine V70] 🗺️ World Scale Engine khởi động — 9 cấp độ visualization.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 16200); });
  } else {
    setTimeout(init, 16200);
  }
})();
