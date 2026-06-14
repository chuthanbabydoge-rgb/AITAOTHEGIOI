(function () {
  "use strict";
  const SAVE_KEY = "cgv6_walkthrough_v70";

  window.worldWalkthroughV70Data = {
    version: "V70",
    initialized: false,
    active: false,
    position: { x: 0.5, y: 0.5, region: null, city: null },
    heading: 0,
    speed: 0.004,
    mode: "walk",
    nearbyNpcs: [],
    nearbyBuildings: [],
    currentScene: null,
    sceneHistory: [],
    jarvisMode: false,
    jarvisQueue: [],
    replayMode: false,
    replayYear: 1,
    replaySpeed: 1,
    replayEvents: [],
    replayIndex: 0,
    animFrame: 0,
    keysHeld: {},
  };

  const D = window.worldWalkthroughV70Data;

  const SCENE_TYPES = [
    { id: "market", name: "Chợ", icon: "🏪", desc: "Tiếng rao hàng và mùi gia vị lan tỏa. Người mua kẻ bán tấp nập." },
    { id: "battle", name: "Chiến Trường", icon: "⚔️", desc: "Tiếng kiếm chạm nhau. Khói lửa mù mịt trên cánh đồng." },
    { id: "temple", name: "Đền Thờ", icon: "⛪", desc: "Không khí thanh tịnh. Hương trầm tỏa lan trong ánh đèn nến." },
    { id: "festival", name: "Lễ Hội", icon: "🎊", desc: "Âm nhạc vang lên. Người người tụ hội, mặc trang phục sặc sỡ." },
    { id: "street", name: "Đường Phố", icon: "🛤️", desc: "Dân thường qua lại. Trẻ em chạy nhảy. Một ngày bình thường." },
    { id: "palace", name: "Cung Điện", icon: "🏰", desc: "Cổng lớn cao vút. Lính canh đứng nghiêm. Quyền lực ngập tràn." },
    { id: "disaster", name: "Vùng Thảm Họa", icon: "🌋", desc: "Tro bụi mù trời. Tiếng khóc vang xa. Đất trời rung chuyển." },
    { id: "academy", name: "Học Viện", icon: "📚", desc: "Tiếng đọc sách vang lên. Học trò cần mẫn bên ánh đèn dầu." },
  ];

  function save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      position: D.position,
      sceneHistory: D.sceneHistory.slice(-20),
    }));
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.position) D.position = Object.assign(D.position, p.position);
        if (p.sceneHistory) D.sceneHistory = p.sceneHistory;
      }
    } catch (e) {}
  }

  function generateScene(x, y) {
    const wars = window.warsActive || [];
    const disasters = (window.disasterData && window.disasterData.activeDisasters) ? window.disasterData.activeDisasters : [];
    const year = window.year || 1;
    const countries = window.countries || [];
    const nearestCountry = countries.reduce(function (best, c) {
      if (!c.x || !c.y) return best;
      const d = Math.sqrt(Math.pow((c.x || 0.5) - x, 2) + Math.pow((c.y || 0.5) - y, 2));
      return (!best || d < best.dist) ? { c, dist: d } : best;
    }, null);

    let sceneType = SCENE_TYPES[Math.floor((x * 7 + y * 11 + year) % SCENE_TYPES.length)];
    if (wars.length > 2) sceneType = SCENE_TYPES[1];
    if (disasters.length > 0) sceneType = SCENE_TYPES[6];

    const nearbyNpcs = (window.npcs || []).filter(function (n) {
      return n.status === "alive" && (!nearestCountry || n.country === nearestCountry.c.name);
    }).slice(0, 6);

    const scene = {
      type: sceneType,
      position: { x, y },
      country: nearestCountry ? nearestCountry.c.name : "Vùng Hoang Dã",
      year,
      npcs: nearbyNpcs,
      npcCount: nearbyNpcs.length,
      warzone: wars.length > 0,
      description: sceneType.desc,
      atmosphere: wars.length > 2 ? "Căng thẳng" : disasters.length > 0 ? "Hoảng loạn" : "Bình thường",
    };

    D.nearbyNpcs = nearbyNpcs;
    return scene;
  }

  function enterWalkthrough(cityName) {
    D.active = true;
    D.mode = "walk";
    D.jarvisMode = true;

    const city = cityName ? (window.countries || []).find(function (c) { return c.name === cityName; }) : (window.countries || [])[0];
    if (city) {
      D.position.city = city.name;
      D.position.region = city.region;
    }

    D.currentScene = generateScene(D.position.x, D.position.y);
    D.sceneHistory.push({ scene: D.currentScene.type.id, city: D.position.city, year: window.year || 0 });

    const jarvisMsg = getJarvisWalkthroughComment(D.currentScene);
    D.jarvisQueue.push(jarvisMsg);

    save();
    return D.currentScene;
  }

  function move(direction) {
    if (!D.active) return;
    const step = D.speed;
    if (direction === "forward") { D.position.x += Math.cos(D.heading) * step; D.position.y += Math.sin(D.heading) * step; }
    if (direction === "back") { D.position.x -= Math.cos(D.heading) * step; D.position.y -= Math.sin(D.heading) * step; }
    if (direction === "left") D.heading -= 0.08;
    if (direction === "right") D.heading += 0.08;
    D.position.x = Math.max(0, Math.min(1, D.position.x));
    D.position.y = Math.max(0, Math.min(1, D.position.y));

    const prevType = D.currentScene ? D.currentScene.type.id : null;
    D.currentScene = generateScene(D.position.x, D.position.y);
    if (D.currentScene.type.id !== prevType) {
      D.sceneHistory.push({ scene: D.currentScene.type.id, city: D.currentScene.country, year: window.year || 0 });
      if (D.jarvisMode) D.jarvisQueue.push(getJarvisWalkthroughComment(D.currentScene));
    }
  }

  function getJarvisWalkthroughComment(scene) {
    if (!scene) return "";
    const comments = {
      market: "Jarvis: Khu chợ " + scene.country + " đang sầm uất với " + scene.npcCount + " thương nhân. Kinh tế vùng này " + (scene.warzone ? "suy yếu do chiến tranh" : "đang phát triển") + ".",
      battle: "Jarvis: ⚔️ CẢNH BÁO — Vùng chiến sự. " + scene.npcCount + " chiến binh đang giao tranh tại " + scene.country + ". Nên quan sát từ xa.",
      temple: "Jarvis: Đền thờ " + scene.country + " — trung tâm đức tin của vùng. " + scene.npcCount + " tín đồ đang cầu nguyện.",
      festival: "Jarvis: 🎊 Lễ hội đang diễn ra! " + scene.npcCount + " người dân " + scene.country + " đang vui mừng.",
      street: "Jarvis: Đường phố " + scene.country + " — cuộc sống thường ngày. " + scene.npcCount + " NPC đang sinh hoạt.",
      palace: "Jarvis: Cung điện " + scene.country + " — trung tâm quyền lực. Hãy cẩn thận khi tiếp cận.",
      disaster: "Jarvis: 🌋 THẢM HỌA — " + scene.country + " đang chịu ảnh hưởng. " + scene.npcCount + " NPC đang cần giúp đỡ.",
      academy: "Jarvis: Học viện " + scene.country + " — " + scene.npcCount + " học giả đang nghiên cứu.",
    };
    return comments[scene.type.id] || "Jarvis: Đang quan sát " + scene.country + "...";
  }

  function startReplay(fromYear, toYear) {
    D.replayMode = true;
    D.replayYear = fromYear || 1;
    D.replayEvents = [];
    D.replayIndex = 0;

    const histEvents = [];
    if (window.htData && window.htData.events) histEvents.push(...window.htData.events.filter(function (e) { return e.year >= (fromYear || 1) && e.year <= (toYear || (window.year || 1)); }));
    if (window.histReplayData && window.histReplayData.events) histEvents.push(...window.histReplayData.events.filter(function (e) { return e.year >= (fromYear || 1) && e.year <= (toYear || (window.year || 1)); }));
    if (window.warsActive) window.warsActive.forEach(function (w) { if (w.startYear >= (fromYear || 1)) histEvents.push({ year: w.startYear, type: "war", title: "⚔️ Chiến tranh: " + w.attacker + " vs " + w.defender, color: "#ef4444" }); });
    if (window.disasterData && window.disasterData.history) window.disasterData.history.forEach(function (d) { if (d.year >= (fromYear || 1)) histEvents.push({ year: d.year, type: "disaster", title: "🌋 " + d.name, color: "#f97316" }); });

    D.replayEvents = histEvents.sort(function (a, b) { return a.year - b.year; });
    return D.replayEvents;
  }

  function stepReplay() {
    if (!D.replayMode || D.replayIndex >= D.replayEvents.length) {
      D.replayMode = false;
      return null;
    }
    const ev = D.replayEvents[D.replayIndex++];
    D.replayYear = ev.year;
    if (D.jarvisMode && ev.title) D.jarvisQueue.push("Jarvis [Năm " + ev.year + "]: " + ev.title);
    return ev;
  }

  function renderWalkthroughCanvas(canvasEl) {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext("2d");
    const W = canvasEl.width = canvasEl.offsetWidth || 600;
    const H = canvasEl.height = canvasEl.offsetHeight || 250;
    const scene = D.currentScene;
    D.animFrame++;

    const bgColors = { market: "#0a0810", battle: "#120000", temple: "#080a14", festival: "#0a0808", street: "#080808", palace: "#0a0a00", disaster: "#100400", academy: "#04080a" };
    ctx.fillStyle = (scene && bgColors[scene.type.id]) || "#080810";
    ctx.fillRect(0, 0, W, H);

    if (!D.active || !scene) {
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "14px serif";
      ctx.textAlign = "center";
      ctx.fillText("Nhấn [Bắt đầu Walkthrough] để bước vào thế giới", W / 2, H / 2);
      return;
    }

    for (let i = 0; i < 30; i++) {
      const px = ((i * 137 + D.animFrame) % W);
      const py = ((i * 251 + D.animFrame * 0.5) % H);
      ctx.fillStyle = "rgba(255,255,255," + (0.05 + 0.05 * Math.sin(D.animFrame * 0.05 + i)) + ")";
      ctx.beginPath(); ctx.arc(px, py, 1, 0, Math.PI * 2); ctx.fill();
    }

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, H - 80, W, 80);

    ctx.font = "bold 16px serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText(scene.type.icon + " " + scene.type.name + " — " + scene.country, 14, H - 58);

    ctx.font = "11px serif";
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.fillText(scene.description, 14, H - 40);
    ctx.fillText("👥 " + scene.npcCount + " NPC gần đây · 📍 (" + D.position.x.toFixed(2) + ", " + D.position.y.toFixed(2) + ") · Năm: " + (window.year || 1), 14, H - 20);

    if (D.jarvisMode && D.jarvisQueue.length) {
      const msg = D.jarvisQueue[D.jarvisQueue.length - 1];
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, W, 40);
      ctx.font = "11px serif";
      ctx.fillStyle = "#c084fc";
      ctx.textAlign = "left";
      ctx.fillText("🤖 " + msg.substring(0, 90), 10, 25);
    }

    scene.npcs.slice(0, 5).forEach(function (npc, i) {
      const nx = 60 + i * (W / 6);
      const ny = H / 2 + Math.sin(D.animFrame * 0.03 + i) * 8;
      ctx.font = "18px serif";
      ctx.textAlign = "center";
      ctx.fillText("👤", nx, ny);
      ctx.font = "9px serif";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText(npc.name.substring(0, 6), nx, ny + 14);
    });
  }

  function getJarvisReplay(eventData) {
    if (!eventData) return "";
    const comments = {
      war: "⚔️ Cuộc chiến này đã thay đổi bản đồ thế giới. " + (eventData.title || ""),
      disaster: "🌋 Thảm họa giáng xuống. Hàng ngàn sinh linh chịu ảnh hưởng. " + (eventData.title || ""),
      era: "🌅 Bình minh của kỷ nguyên mới. Thế giới thay đổi hoàn toàn.",
      default: "📜 " + (eventData.title || "Sự kiện lịch sử"),
    };
    return comments[eventData.type] || comments.default;
  }

  window.worldWalkthroughV70Data = D;
  window.wwt70Enter = enterWalkthrough;
  window.wwt70Move = move;
  window.wwt70StartReplay = startReplay;
  window.wwt70StepReplay = stepReplay;
  window.wwt70RenderCanvas = renderWalkthroughCanvas;
  window.wwt70GetScene = function () { return D.currentScene; };
  window.wwt70GetPosition = function () { return Object.assign({}, D.position); };
  window.wwt70GetJarvisQueue = function () { return D.jarvisQueue.slice(); };
  window.wwt70PopJarvis = function () { return D.jarvisQueue.shift(); };
  window.wwt70GetSceneHistory = function () { return D.sceneHistory.slice(); };
  window.wwt70GetJarvisReplay = getJarvisReplay;
  window.wwt70Exit = function () { D.active = false; D.replayMode = false; save(); };

  function init() {
    load();
    D.initialized = true;
    console.log("[worldWalkthroughSystem V70] 🚶 World Walkthrough System khởi động — Walk · Replay · Jarvis Tour Guide.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 16700); });
  } else {
    setTimeout(init, 16700);
  }
})();
