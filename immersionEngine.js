(function () {
  "use strict";
  const SAVE_KEY = "cgv6_immersion_engine_v70";

  window.immersionEngineV70Data = {
    version: "V70",
    initialized: false,
    currentScale: 2,
    targetScale: 2,
    transitioning: false,
    transitionProgress: 0,
    focus: {
      entityType: null,
      entityId: null,
      entityName: null,
      region: null,
      position: { x: 0.5, y: 0.5 },
    },
    history: [],
    jarvisMode: false,
    jarvisLog: [],
    settings: {
      transitionSpeed: 0.06,
      autoNarrate: true,
      showOverlays: true,
      jarvisVoice: true,
    },
    stats: {
      totalZooms: 0,
      deepestScale: 8,
      npcsObserved: 0,
      dynastiesViewed: 0,
      replaysWatched: 0,
    },
  };

  const D = window.immersionEngineV70Data;

  const SCALE_DEFS = [
    { id: 0, name: "Vũ Trụ",    icon: "🌌", desc: "Toàn bộ đa vũ trụ — vô số thế giới song song",          zoomRange: [0.0001, 0.001] },
    { id: 1, name: "Thiên Hà",  icon: "⭐", desc: "Một thiên hà — hàng triệu ngôi sao & hành tinh",          zoomRange: [0.001, 0.01]  },
    { id: 2, name: "Hành Tinh", icon: "🌍", desc: "Thế giới hiện tại — toàn bộ lục địa & đại dương",         zoomRange: [0.01, 0.1]   },
    { id: 3, name: "Lục Địa",   icon: "🗺️", desc: "Một lục địa — các vùng đất & vương quốc",                zoomRange: [0.1, 0.3]    },
    { id: 4, name: "Vương Quốc",icon: "🏰", desc: "Một vương quốc hoặc đế chế — các thành phố & lãnh thổ",  zoomRange: [0.3, 0.5]    },
    { id: 5, name: "Thành Phố", icon: "🏙️", desc: "Một thành phố — dân cư, công trình, kinh tế",            zoomRange: [0.5, 0.7]    },
    { id: 6, name: "Khu Phố",   icon: "🏘️", desc: "Một khu phố — đường phố, cửa hàng, nhà dân",            zoomRange: [0.7, 0.85]   },
    { id: 7, name: "Công Trình",icon: "🏠", desc: "Một tòa nhà — phòng ốc, đồ vật, cư dân",                 zoomRange: [0.85, 0.95]  },
    { id: 8, name: "NPC",       icon: "👤", desc: "Một NPC cụ thể — cuộc đời, ký ức, gia đình, tương lai",   zoomRange: [0.95, 1.0]   },
  ];

  function save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      currentScale: D.currentScale,
      focus: D.focus,
      history: D.history.slice(-30),
      settings: D.settings,
      stats: D.stats,
    }));
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.currentScale !== undefined) D.currentScale = p.currentScale;
        if (p.focus) D.focus = Object.assign(D.focus, p.focus);
        if (p.history) D.history = p.history;
        if (p.settings) D.settings = Object.assign(D.settings, p.settings);
        if (p.stats) D.stats = Object.assign(D.stats, p.stats);
      }
    } catch (e) {}
  }

  function addJarvis(msg) {
    D.jarvisLog.push({ t: Date.now(), year: window.year || 0, msg });
    if (D.jarvisLog.length > 30) D.jarvisLog = D.jarvisLog.slice(-30);
  }

  function zoomTo(scaleId, entityInfo) {
    if (scaleId < 0 || scaleId > 8) return false;
    const from = D.currentScale;
    D.history.push({ scale: from, focus: Object.assign({}, D.focus), year: window.year || 0 });
    if (D.history.length > 50) D.history = D.history.slice(-50);

    D.targetScale = scaleId;
    D.transitioning = true;
    D.transitionProgress = 0;
    D.stats.totalZooms++;

    if (entityInfo) {
      D.focus.entityType = entityInfo.type || null;
      D.focus.entityId = entityInfo.id || null;
      D.focus.entityName = entityInfo.name || null;
      D.focus.region = entityInfo.region || null;
      if (entityInfo.position) D.focus.position = entityInfo.position;
    }

    const scaleDef = SCALE_DEFS[scaleId];
    addJarvis("Zoom tới " + scaleDef.name + (entityInfo ? " — " + (entityInfo.name || "") : ""));

    if (scaleId > D.stats.deepestScale) D.stats.deepestScale = scaleId;

    setTimeout(function () {
      D.currentScale = scaleId;
      D.transitioning = false;
      D.transitionProgress = 1;
      save();
      if (typeof imm70OnScaleChange === "function") imm70OnScaleChange(scaleId, D.focus);
    }, Math.abs(scaleId - from) * 200 + 300);

    return true;
  }

  function zoomIn() {
    if (D.currentScale >= 8) return false;
    return zoomTo(D.currentScale + 1);
  }

  function zoomOut() {
    if (D.currentScale <= 0) return false;
    return zoomTo(D.currentScale - 1);
  }

  function zoomBack() {
    if (!D.history.length) return false;
    const prev = D.history.pop();
    D.currentScale = prev.scale;
    D.focus = prev.focus;
    if (typeof imm70OnScaleChange === "function") imm70OnScaleChange(D.currentScale, D.focus);
    save();
    return true;
  }

  function getScaleDef(id) {
    return SCALE_DEFS[id !== undefined ? id : D.currentScale];
  }

  function getContextData() {
    const scale = D.currentScale;
    const focus = D.focus;
    const data = { scale, scaleDef: SCALE_DEFS[scale], focus, entities: [] };

    if (scale === 0) {
      const mv = window.multiverseData || {};
      data.entities = (mv.worlds || []).slice(0, 20).map(function (w) {
        return { type: "world", name: w.name || "World", id: w.id };
      });
    } else if (scale === 1 || scale === 2) {
      data.worldName = (window.world && window.world.name) || "Thế Giới";
      data.yearCurrent = window.year || 1;
      data.countryCount = (window.countries || []).length;
      data.npcAlive = (window.npcs || []).filter(function (n) { return n.status === "alive"; }).length;
    } else if (scale === 3) {
      const regions = {};
      (window.countries || []).forEach(function (c) {
        const r = c.region || "Unknown";
        regions[r] = (regions[r] || 0) + 1;
      });
      data.regions = Object.entries(regions).map(function (kv) { return { name: kv[0], count: kv[1] }; });
    } else if (scale === 4) {
      const kings = window.kingdomData ? (Array.isArray(window.kingdomData.kingdoms) ? window.kingdomData.kingdoms : Object.values(window.kingdomData.kingdoms || {})) : [];
      const emps = window.empireData ? (Array.isArray(window.empireData.empires) ? window.empireData.empires : Object.values(window.empireData.empires || {})) : [];
      data.kingdoms = kings.slice(0, 10);
      data.empires = emps.slice(0, 10);
    } else if (scale === 5) {
      const countries = window.countries || [];
      const focused = focus.entityName ? countries.find(function (c) { return c.name === focus.entityName; }) : countries[0];
      data.city = focused;
      data.npcsInCity = focused ? (window.npcs || []).filter(function (n) { return n.status === "alive" && (n.country === focused.name || n.countryId === focused.id); }).length : 0;
    } else if (scale === 6 || scale === 7) {
      data.district = focus.entityName || "Khu Trung Tâm";
    } else if (scale === 8) {
      const npcs = window.npcs || [];
      const npc = focus.entityId ? npcs.find(function (n) { return n.id === focus.entityId; }) : npcs.find(function (n) { return n.status === "alive"; });
      data.npc = npc;
    }

    return data;
  }

  function generateJarvisNarration(scaleId) {
    const scale = SCALE_DEFS[scaleId || D.currentScale];
    const year = window.year || 1;
    const world = (window.world && window.world.name) || "Thế Giới";
    const npcAlive = (window.npcs || []).filter(function (n) { return n.status === "alive"; }).length;
    const warsCount = (window.warsActive || []).length;
    const focus = D.focus;

    const narrations = {
      0: "Từ đây, " + world + " chỉ là một hạt bụi trong muôn ngàn vũ trụ song song. Năm " + year + " — lịch sử đang được viết.",
      1: "Thiên hà chứa đựng " + world + " đang xoay chuyển. Hàng triệu ngôi sao, mỗi ngôi sao là một câu chuyện chưa kể.",
      2: world + " — Năm " + year + ". " + npcAlive + " sinh linh đang sống. " + warsCount + " cuộc chiến đang diễn ra.",
      3: "Nhìn từ trên cao, các lục địa vẽ nên bản đồ của lịch sử. " + (window.countries || []).length + " quốc gia đang tranh giành quyền lực.",
      4: "Các vương quốc và đế chế — mỗi cái tên là một thế kỷ của máu và vinh quang.",
      5: focus.entityName ? focus.entityName + " — " + (window.year || 1) + " năm lịch sử trong một thành phố." : "Một thành phố đang thở, đang sống.",
      6: "Đường phố còn đó. Mỗi góc phố là một câu chuyện của người thường.",
      7: "Trong tòa nhà này, cuộc sống diễn ra như chưa hề có lịch sử đang ghi chép.",
      8: focus.entityName ? focus.entityName + " — một sinh linh trong " + npcAlive + " sinh linh. Nhưng cuộc đời này là duy nhất." : "Một sinh linh. Một cuộc đời. Hàng triệu lựa chọn.",
    };

    return narrations[scaleId || D.currentScale] || "Đang quan sát...";
  }

  window.immersionEngineV70Data = D;
  window.imm70ZoomTo = zoomTo;
  window.imm70ZoomIn = zoomIn;
  window.imm70ZoomOut = zoomOut;
  window.imm70ZoomBack = zoomBack;
  window.imm70GetScale = function () { return D.currentScale; };
  window.imm70GetScaleDef = getScaleDef;
  window.imm70GetAllScales = function () { return SCALE_DEFS.slice(); };
  window.imm70GetContextData = getContextData;
  window.imm70GetJarvisNarration = generateJarvisNarration;
  window.imm70GetJarvisLog = function () { return D.jarvisLog.slice(); };
  window.imm70GetHistory = function () { return D.history.slice(); };
  window.imm70GetFocus = function () { return Object.assign({}, D.focus); };
  window.imm70SetFocus = function (info) { Object.assign(D.focus, info); save(); };
  window.imm70GetStats = function () { return Object.assign({}, D.stats); };
  window.imm70Save = save;

  function init() {
    load();
    D.initialized = true;
    addJarvis("Immersion Engine V70 khởi động. Thế giới sẵn sàng được bước vào.");
    save();
    console.log("[immersionEngine V70] 🌍 World Immersion Engine khởi động — 9 cấp độ zoom · Universe→NPC.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 16100); });
  } else {
    setTimeout(init, 16100);
  }
})();
