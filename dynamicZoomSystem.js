(function () {
  "use strict";
  const SAVE_KEY = "cgv6_dynamic_zoom_v70";

  window.dynamicZoomV70Data = {
    version: "V70",
    initialized: false,
    zoom: 1.0,
    targetZoom: 1.0,
    panX: 0,
    panY: 0,
    targetPanX: 0,
    targetPanY: 0,
    minZoom: 0.1,
    maxZoom: 20.0,
    smoothing: 0.1,
    scaleThresholds: [0.15, 0.3, 0.5, 1.0, 2.0, 4.0, 8.0, 14.0, 20.0],
    lastTriggeredLevel: 2,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    zoomHistory: [],
    continuousZoom: true,
    transitionOverlay: { active: false, opacity: 0, targetOpacity: 0 },
  };

  const D = window.dynamicZoomV70Data;

  function save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      zoom: D.zoom,
      panX: D.panX,
      panY: D.panY,
      lastTriggeredLevel: D.lastTriggeredLevel,
      zoomHistory: D.zoomHistory.slice(-10),
    }));
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.zoom) D.zoom = D.targetZoom = p.zoom;
        if (p.panX !== undefined) D.panX = D.targetPanX = p.panX;
        if (p.panY !== undefined) D.panY = D.targetPanY = p.panY;
        if (p.lastTriggeredLevel !== undefined) D.lastTriggeredLevel = p.lastTriggeredLevel;
        if (p.zoomHistory) D.zoomHistory = p.zoomHistory;
      }
    } catch (e) {}
  }

  function getScaleLevelFromZoom(z) {
    const t = D.scaleThresholds;
    if (z <= t[0]) return 0;
    if (z <= t[1]) return 1;
    if (z <= t[2]) return 2;
    if (z <= t[3]) return 3;
    if (z <= t[4]) return 4;
    if (z <= t[5]) return 5;
    if (z <= t[6]) return 6;
    if (z <= t[7]) return 7;
    return 8;
  }

  function setZoom(z, pivotX, pivotY) {
    const clamped = Math.max(D.minZoom, Math.min(D.maxZoom, z));
    const ratio = clamped / D.targetZoom;

    if (pivotX !== undefined && pivotY !== undefined) {
      D.targetPanX = pivotX - (pivotX - D.targetPanX) * ratio;
      D.targetPanY = pivotY - (pivotY - D.targetPanY) * ratio;
    }

    D.targetZoom = clamped;

    const newLevel = getScaleLevelFromZoom(clamped);
    if (newLevel !== D.lastTriggeredLevel) {
      D.lastTriggeredLevel = newLevel;
      D.transitionOverlay.active = true;
      D.transitionOverlay.targetOpacity = 0.6;
      setTimeout(function () {
        D.transitionOverlay.targetOpacity = 0;
        setTimeout(function () { D.transitionOverlay.active = false; }, 400);
      }, 250);

      if (typeof imm70ZoomTo === "function") imm70ZoomTo(newLevel);
      if (typeof dzm70OnLevelChange === "function") dzm70OnLevelChange(newLevel, clamped);
    }
  }

  function smoothStep() {
    const s = D.smoothing;
    D.zoom += (D.targetZoom - D.zoom) * s;
    D.panX += (D.targetPanX - D.panX) * s;
    D.panY += (D.targetPanY - D.panY) * s;
  }

  function setupWheelZoom(el) {
    if (!el) return;
    el.addEventListener("wheel", function (e) {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const delta = e.deltaY < 0 ? 1.18 : 0.85;
      setZoom(D.targetZoom * delta, mx, my);
    }, { passive: false });
  }

  function setupPinchZoom(el) {
    if (!el) return;
    let lastDist = 0;
    el.addEventListener("touchstart", function (e) {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastDist = Math.sqrt(dx * dx + dy * dy);
      }
    }, { passive: true });
    el.addEventListener("touchmove", function (e) {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const rect = el.getBoundingClientRect();
        setZoom(D.targetZoom * (dist / Math.max(lastDist, 1)), mx - rect.left, my - rect.top);
        lastDist = dist;
        e.preventDefault();
      }
    }, { passive: false });
  }

  function setupDrag(el) {
    if (!el) return;
    el.addEventListener("mousedown", function (e) {
      D.isDragging = true;
      D.dragStart.x = e.clientX - D.panX;
      D.dragStart.y = e.clientY - D.panY;
    });
    window.addEventListener("mouseup", function () { D.isDragging = false; });
    window.addEventListener("mousemove", function (e) {
      if (!D.isDragging) return;
      D.targetPanX = e.clientX - D.dragStart.x;
      D.targetPanY = e.clientY - D.dragStart.y;
    });
  }

  function applyTransform(el) {
    if (!el) return;
    el.style.transformOrigin = "0 0";
    el.style.transform = "translate(" + D.panX + "px," + D.panY + "px) scale(" + D.zoom + ")";
  }

  function renderOverlay(ctx, W, H) {
    if (!D.transitionOverlay.active) return;
    const speed = 0.15;
    D.transitionOverlay.opacity += (D.transitionOverlay.targetOpacity - D.transitionOverlay.opacity) * speed;
    if (D.transitionOverlay.opacity > 0.01) {
      const level = D.lastTriggeredLevel;
      const colors = window.wse70GetLevelColors ? window.wse70GetLevelColors(level) : { primary: "#00f5ff" };
      ctx.fillStyle = "rgba(0,0,0," + D.transitionOverlay.opacity + ")";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = colors.primary + Math.round(D.transitionOverlay.opacity * 180).toString(16).padStart(2, "0");
      ctx.font = "bold 18px serif";
      ctx.textAlign = "center";
      const scales = window.imm70GetAllScales ? window.imm70GetAllScales() : [];
      const sd = scales[level] || { icon: "", name: "" };
      ctx.fillText(sd.icon + " " + sd.name, W / 2, H / 2);
    }
  }

  function jumpToLevel(level) {
    const targets = [0.1, 0.2, 0.35, 0.7, 1.5, 3.0, 6.0, 11.0, 18.0];
    setZoom(targets[level] || 1.0);
    D.zoomHistory.push({ level, t: Date.now() });
    save();
  }

  function zoomToEntity(entity, level) {
    jumpToLevel(level !== undefined ? level : 5);
    if (entity && entity.position) {
      D.targetPanX = -entity.position.x * 500 + 200;
      D.targetPanY = -entity.position.y * 400 + 150;
    }
  }

  window.dynamicZoomV70Data = D;
  window.dzm70SetZoom = setZoom;
  window.dzm70SmoothStep = smoothStep;
  window.dzm70SetupWheelZoom = setupWheelZoom;
  window.dzm70SetupPinchZoom = setupPinchZoom;
  window.dzm70SetupDrag = setupDrag;
  window.dzm70ApplyTransform = applyTransform;
  window.dzm70RenderOverlay = renderOverlay;
  window.dzm70JumpToLevel = jumpToLevel;
  window.dzm70ZoomToEntity = zoomToEntity;
  window.dzm70GetLevel = function () { return D.lastTriggeredLevel; };
  window.dzm70GetZoom = function () { return D.zoom; };

  function init() {
    load();
    D.initialized = true;
    console.log("[dynamicZoomSystem V70] 🔍 Dynamic Zoom System khởi động — Seamless zoom · Universe↔NPC.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 16300); });
  } else {
    setTimeout(init, 16300);
  }
})();
