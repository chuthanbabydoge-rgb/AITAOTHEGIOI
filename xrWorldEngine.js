(function() {
  "use strict";
  const SAVE_KEY = "cgv6_xr_world_v72";

  window.xrWorldV72Data = {
    worldTable: {
      active: false,
      scale: 1.0,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
      tilt: 15
    },
    currentView: "planet",
    focusEntity: null,
    focusEntityType: null,
    deviceMode: "desktop",
    xrSessionActive: false,
    godScaleMode: "god",
    initialized: false,
    sessionLog: [],
    stats: {
      totalSessions: 0,
      totalViewChanges: 0,
      totalEntityFocused: 0,
      totalRotations: 0
    }
  };

  window.XRW72_VIEW_LEVELS = [
    { id: "universe",  name: "Vũ Trụ",     icon: "🌌", desc: "Toàn bộ đa vũ trụ — hàng ngàn thế giới song song",  scale: 0.01,  camDist: 20 },
    { id: "galaxy",    name: "Thiên Hà",    icon: "⭐", desc: "Một thiên hà — hàng triệu ngôi sao & hành tinh",    scale: 0.05,  camDist: 15 },
    { id: "planet",    name: "Hành Tinh",   icon: "🌍", desc: "Thế giới hiện tại — toàn bộ lục địa & đại dương",   scale: 0.15,  camDist: 10 },
    { id: "continent", name: "Lục Địa",     icon: "🗺️", desc: "Một lục địa — các vùng đất & vương quốc",           scale: 0.35,  camDist: 7  },
    { id: "kingdom",   name: "Vương Quốc",  icon: "🏰", desc: "Một vương quốc hoặc đế chế hùng mạnh",             scale: 0.6,   camDist: 5  },
    { id: "city",      name: "Thành Phố",   icon: "🏙️", desc: "Một thành phố sống động — dân số, kinh tế, công trình", scale: 1.0, camDist: 3 },
    { id: "street",    name: "Đường Phố",   icon: "🏘️", desc: "Đường phố, cửa hàng, nhà dân, chợ búa",            scale: 1.8,   camDist: 1.5 },
    { id: "npc",       name: "NPC",         icon: "👤", desc: "Một cá nhân — cuộc đời, ký ức, gia đình, định mệnh", scale: 3.0,  camDist: 0.5 }
  ];

  window.XRW72_DEVICE_PROFILES = {
    quest:      { name: "Meta Quest",        icon: "🥽", tier: "VR",   score: 92, features: ["Hand Tracking","God Hand","World Table","Passthrough","6DOF"] },
    visionpro:  { name: "Apple Vision Pro",  icon: "🍎", tier: "MR",   score: 95, features: ["Hand Tracking","Eye Tracking","World Table","Spatial Audio","visionOS"] },
    ar_glasses: { name: "AR Glasses",        icon: "👓", tier: "AR",   score: 70, features: ["Plane Detection","AR Overlay","Touch Fallback"] },
    desktop:    { name: "Desktop Browser",   icon: "🖥️", tier: "Flat", score: 40, features: ["Mouse Orbit","Scroll Zoom","Keyboard Shortcuts","Canvas 2D"] },
    mobile:     { name: "Mobile Browser",    icon: "📱", tier: "Flat", score: 55, features: ["Pinch Zoom","Touch Pan","Gyroscope"] }
  };

  function detectDevice() {
    const ua = (navigator.userAgent || "").toLowerCase();
    if (/quest/i.test(ua)) return "quest";
    if (/visionos|vision pro/i.test(ua)) return "visionpro";
    if (typeof navigator !== "undefined" && navigator.xr && /android/i.test(ua)) return "ar_glasses";
    if (/mobile|android|iphone|ipad/i.test(ua)) return "mobile";
    return "desktop";
  }

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.xrWorldV72Data)); } catch(e) {}
  }

  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) {
        const p = JSON.parse(d);
        window.xrWorldV72Data = Object.assign(window.xrWorldV72Data, p);
      }
    } catch(e) {}
  }

  function xrwLog(msg) {
    const entry = { year: window.year || 0, msg, ts: Date.now() };
    window.xrWorldV72Data.sessionLog.unshift(entry);
    if (window.xrWorldV72Data.sessionLog.length > 40) window.xrWorldV72Data.sessionLog.pop();
  }
  window.xrw72Log = xrwLog;

  window.xrw72ActivateWorldTable = function() {
    window.xrWorldV72Data.worldTable.active = true;
    window.xrWorldV72Data.stats.totalSessions++;
    xrwLog("🌍 World Table Mode kích hoạt — Thế giới hiện ra trước mắt");
    save();
    return true;
  };

  window.xrw72DeactivateWorldTable = function() {
    window.xrWorldV72Data.worldTable.active = false;
    xrwLog("❌ World Table Mode đã tắt");
    save();
  };

  window.xrw72SetScale = function(val) {
    const v = Math.max(0.01, Math.min(5.0, parseFloat(val) || 1.0));
    window.xrWorldV72Data.worldTable.scale = v;
    save();
    return v;
  };

  window.xrw72ScaleUp = function() {
    return window.xrw72SetScale(window.xrWorldV72Data.worldTable.scale * 1.3);
  };

  window.xrw72ScaleDown = function() {
    return window.xrw72SetScale(window.xrWorldV72Data.worldTable.scale * 0.77);
  };

  window.xrw72Rotate = function(deg) {
    window.xrWorldV72Data.worldTable.rotation = (window.xrWorldV72Data.worldTable.rotation + deg + 360) % 360;
    window.xrWorldV72Data.stats.totalRotations++;
    save();
  };

  window.xrw72SetView = function(viewId) {
    const level = window.XRW72_VIEW_LEVELS.find(l => l.id === viewId);
    if (!level) return false;
    window.xrWorldV72Data.currentView = viewId;
    window.xrWorldV72Data.worldTable.scale = level.scale;
    window.xrWorldV72Data.stats.totalViewChanges++;
    xrwLog(level.icon + " Chuyển sang " + level.name + " — " + level.desc);
    if (typeof window.imm70ZoomTo === "function") {
      const immMap = { universe:0, galaxy:1, planet:2, continent:3, kingdom:4, city:5, street:6, npc:8 };
      const idx = immMap[viewId];
      if (idx !== undefined) try { window.imm70ZoomTo(idx); } catch(e) {}
    }
    save();
    return true;
  };

  window.xrw72SetViewDown = function() {
    const levels = window.XRW72_VIEW_LEVELS;
    const cur = levels.findIndex(l => l.id === window.xrWorldV72Data.currentView);
    if (cur < levels.length - 1) window.xrw72SetView(levels[cur + 1].id);
  };

  window.xrw72SetViewUp = function() {
    const levels = window.XRW72_VIEW_LEVELS;
    const cur = levels.findIndex(l => l.id === window.xrWorldV72Data.currentView);
    if (cur > 0) window.xrw72SetView(levels[cur - 1].id);
  };

  window.xrw72FocusEntity = function(entity, type) {
    window.xrWorldV72Data.focusEntity = entity;
    window.xrWorldV72Data.focusEntityType = type || "country";
    window.xrWorldV72Data.stats.totalEntityFocused++;
    xrwLog("🎯 Đang focus: " + (entity.name || entity) + " [" + (type || "country") + "]");
    save();
  };

  window.xrw72SetGodScale = function(mode) {
    window.xrWorldV72Data.godScaleMode = mode;
    if (mode === "god") {
      xrwLog("⚡ Thần Khổng Lồ — Nhìn xuống thế giới như cầm quả cầu trong tay");
      window.xrw72SetView("planet");
    } else {
      xrwLog("🧑 Tỷ Lệ Người — Bước vào thành phố, đi giữa dân chúng");
      window.xrw72SetView("street");
    }
    save();
  };

  window.xrw72GetCurrentView = function() {
    return window.XRW72_VIEW_LEVELS.find(l => l.id === window.xrWorldV72Data.currentView) || window.XRW72_VIEW_LEVELS[2];
  };

  window.xrw72GetDeviceProfile = function() {
    return window.XRW72_DEVICE_PROFILES[window.xrWorldV72Data.deviceMode] || window.XRW72_DEVICE_PROFILES.desktop;
  };

  window.xrw72GetData = function() { return window.xrWorldV72Data; };
  window.xrw72GetViewLevels = function() { return window.XRW72_VIEW_LEVELS; };
  window.xrw72GetStats = function() { return window.xrWorldV72Data.stats; };
  window.xrw72GetLog = function() { return window.xrWorldV72Data.sessionLog; };
  window.xrw72Save = save;

  function init() {
    load();
    window.xrWorldV72Data.deviceMode = detectDevice();
    window.xrWorldV72Data.initialized = true;
    console.log("[XR World Engine V72] 🌍 Khởi động — XR World Pass sẵn sàng | Device: " + window.xrWorldV72Data.deviceMode);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 17400); });
  } else {
    setTimeout(init, 17400);
  }
})();
