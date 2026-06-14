(function () {
  "use strict";
  const SAVE_KEY = "cgv6_dynasty_viz_v70";

  window.dynastyVizV70Data = {
    version: "V70",
    initialized: false,
    activeDynasty: null,
    dynastyTree: null,
    treeNodes: [],
    treeEdges: [],
    selectedMember: null,
    viewMode: "tree",
    dynastyHistory: [],
    scrollX: 0,
    scrollY: 0,
    nodeSpacingX: 100,
    nodeSpacingY: 70,
    animFrame: 0,
  };

  const D = window.dynastyVizV70Data;

  const DYNASTY_EVENTS = ["🏆 Lên ngôi", "⚔️ Tham chiến", "💍 Kết hôn", "👶 Có con", "📜 Ra sắc lệnh", "🌋 Gặp thiên tai", "✨ Được thần ban", "💀 Qua đời", "🏰 Xây công trình", "📚 Học vấn cao"];

  function save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      activeDynasty: D.activeDynasty ? D.activeDynasty.surname : null,
      dynastyHistory: D.dynastyHistory.slice(-15),
    }));
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.dynastyHistory) D.dynastyHistory = p.dynastyHistory;
      }
    } catch (e) {}
  }

  function buildDynastyFromNpcs(surname) {
    const allNpcs = window.npcs || [];
    const members = allNpcs.filter(function (n) {
      return n.surname === surname || (n.name && n.name.split(" ")[0] === surname);
    });

    if (!members.length) return null;

    const root = members.find(function (n) { return !n.parentId && !n.parents; }) || members[0];
    const founded = root.birthYear || (root.age ? (window.year || 1) - root.age : 1);
    const alive = members.filter(function (n) { return n.status === "alive"; }).length;
    const dead = members.filter(function (n) { return n.status !== "alive"; }).length;

    const memories = window.dynastyMemoryV64Data && window.dynastyMemoryV64Data.dynasties
      ? (window.dynastyMemoryV64Data.dynasties[surname] || null)
      : null;

    const events = [];
    members.forEach(function (m, i) {
      if (i < 5) events.push({ year: m.birthYear || founded + i * 20, text: DYNASTY_EVENTS[i % DYNASTY_EVENTS.length] + " — " + m.name, memberId: m.id });
    });
    if (window.year) events.push({ year: window.year, text: "🕐 Hiện tại: " + alive + " thành viên còn sống", current: true });

    return {
      surname,
      founder: root,
      members,
      founded,
      alive,
      dead,
      total: members.length,
      memories,
      events: events.sort(function (a, b) { return a.year - b.year; }),
      maxGeneration: 0,
    };
  }

  function buildTreeLayout(dynasty) {
    if (!dynasty) return;
    const nodes = [];
    const edges = [];
    const placed = {};

    function placeNode(npc, gen, col) {
      if (!npc || placed[npc.id]) return;
      placed[npc.id] = true;
      nodes.push({
        id: npc.id,
        name: npc.name,
        gen,
        col,
        x: col * D.nodeSpacingX,
        y: gen * D.nodeSpacingY,
        status: npc.status,
        age: npc.age,
        data: npc,
      });
      if (gen > dynasty.maxGeneration) dynasty.maxGeneration = gen;

      const children = dynasty.members.filter(function (m) { return m.parentId === npc.id || (m.parents && m.parents.includes(npc.id)); });
      children.forEach(function (child, ci) {
        edges.push({ from: npc.id, to: child.id });
        placeNode(child, gen + 1, col + ci * 2 - Math.floor(children.length / 2));
      });
    }

    const roots = dynasty.members.filter(function (m) { return !m.parentId && (!m.parents || !m.parents.length); });
    roots.forEach(function (r, i) { placeNode(r, 0, i * 3); });

    const unplaced = dynasty.members.filter(function (m) { return !placed[m.id]; });
    unplaced.forEach(function (m, i) { placeNode(m, 1, roots.length * 3 + i * 2); });

    D.treeNodes = nodes;
    D.treeEdges = edges;
  }

  function renderDynastyTree(canvasEl) {
    if (!canvasEl || !D.dynastyTree) return;
    const ctx = canvasEl.getContext("2d");
    const W = canvasEl.width = canvasEl.offsetWidth || 600;
    const H = canvasEl.height = canvasEl.offsetHeight || 300;
    D.animFrame++;

    ctx.fillStyle = "#060610";
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(192,132,252,0.06)";
    ctx.lineWidth = 1;
    for (let gx = 0; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx + D.scrollX % 40, 0); ctx.lineTo(gx + D.scrollX % 40, H); ctx.stroke(); }
    for (let gy = 0; gy < H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy + D.scrollY % 40); ctx.lineTo(W, gy + D.scrollY % 40); ctx.stroke(); }

    const offX = W / 2 + D.scrollX;
    const offY = 40 + D.scrollY;

    D.treeEdges.forEach(function (edge) {
      const fromNode = D.treeNodes.find(function (n) { return n.id === edge.from; });
      const toNode = D.treeNodes.find(function (n) { return n.id === edge.to; });
      if (!fromNode || !toNode) return;
      const fx = fromNode.x + offX, fy = fromNode.y + offY;
      const tx = toNode.x + offX, ty = toNode.y + offY;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.bezierCurveTo(fx, fy + 25, tx, ty - 25, tx, ty);
      ctx.strokeStyle = "rgba(192,132,252,0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    D.treeNodes.forEach(function (node) {
      const nx = node.x + offX, ny = node.y + offY;
      if (nx < -20 || nx > W + 20 || ny < -20 || ny > H + 20) return;

      const isAlive = node.status === "alive";
      const isSelected = D.selectedMember && D.selectedMember.id === node.id;
      const pulse = isAlive ? 1 + 0.08 * Math.sin(D.animFrame * 0.04 + node.x) : 1;
      const r = 14 * pulse;

      ctx.beginPath();
      ctx.arc(nx, ny, r + 4, 0, Math.PI * 2);
      ctx.fillStyle = isAlive ? "rgba(74,222,128,0.12)" : "rgba(100,116,139,0.08)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(nx, ny, r, 0, Math.PI * 2);
      ctx.fillStyle = isAlive ? "#4ade80" : "#64748b";
      ctx.shadowBlur = isAlive ? 10 : 4;
      ctx.shadowColor = isAlive ? "#4ade80" : "#475569";
      ctx.fill();
      ctx.shadowBlur = 0;

      if (isSelected) {
        ctx.beginPath();
        ctx.arc(nx, ny, r + 5, 0, Math.PI * 2);
        ctx.strokeStyle = "#fcd34d";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "9px serif";
      ctx.textAlign = "center";
      ctx.fillText(node.name.substring(0, 8), nx, ny + r + 11);
      if (node.age) ctx.fillText(node.age + "t", nx, ny + r + 20);
    });

    const dy = D.dynastyTree;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, W, 32);
    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 12px serif";
    ctx.textAlign = "left";
    ctx.fillText("👑 Gia Tộc " + dy.surname + " | " + dy.total + " thành viên | " + dy.alive + " còn sống | " + dy.maxGeneration + " thế hệ", 10, 20);
  }

  function visitDynasty(surname) {
    if (!surname) {
      const npcs = window.npcs || [];
      const surnames = {};
      npcs.forEach(function (n) {
        const s = n.surname || (n.name && n.name.split(" ")[0]);
        if (s) surnames[s] = (surnames[s] || 0) + 1;
      });
      const top = Object.entries(surnames).sort(function (a, b) { return b[1] - a[1]; })[0];
      surname = top ? top[0] : "Unknown";
    }

    const dynasty = buildDynastyFromNpcs(surname);
    if (!dynasty) return null;
    D.activeDynasty = dynasty;
    D.dynastyTree = dynasty;
    buildTreeLayout(dynasty);
    D.dynastyHistory.push({ surname, year: window.year || 0 });
    save();
    return dynasty;
  }

  function selectMember(npcId) {
    const node = D.treeNodes.find(function (n) { return n.id === npcId; });
    if (node) {
      D.selectedMember = node.data;
      if (typeof nos70ObserveNpc === "function") nos70ObserveNpc(node.data);
    }
    return D.selectedMember;
  }

  function getDynastyTimeline() {
    if (!D.dynastyTree) return [];
    return D.dynastyTree.events || [];
  }

  function getDynastyStats() {
    const d = D.dynastyTree;
    if (!d) return null;
    return {
      name: d.surname,
      founded: d.founded,
      alive: d.alive,
      dead: d.dead,
      total: d.total,
      maxGeneration: d.maxGeneration,
      yearsActive: (window.year || 1) - d.founded,
    };
  }

  window.dynastyVizV70Data = D;
  window.dv70VisitDynasty = visitDynasty;
  window.dv70RenderTree = renderDynastyTree;
  window.dv70SelectMember = selectMember;
  window.dv70GetTimeline = getDynastyTimeline;
  window.dv70GetStats = getDynastyStats;
  window.dv70GetTree = function () { return D.dynastyTree; };
  window.dv70GetNodes = function () { return D.treeNodes.slice(); };
  window.dv70Scroll = function (dx, dy) { D.scrollX += dx; D.scrollY += dy; };

  function init() {
    load();
    D.initialized = true;
    setTimeout(function () {
      visitDynasty(null);
    }, 1000);
    console.log("[dynastyVisualizationSystem V70] 👑 Dynasty Visualization System khởi động — Gia phả · Thế hệ · Ký ức.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 16600); });
  } else {
    setTimeout(init, 16600);
  }
})();
