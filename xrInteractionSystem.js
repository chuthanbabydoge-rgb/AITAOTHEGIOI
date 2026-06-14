(function () {
  "use strict";

  window.xrInteractionV69Data = {
    version: "V69",
    initialized: false,
    gestureState: {
      pinch: { active: false, distance: 0, entity: null },
      grab: { active: false, entity: null, offset: { x: 0, y: 0, z: 0 } },
      rotate: { active: false, angle: 0, lastAngle: 0 },
      scale: { active: false, factor: 1.0, min: 0.1, max: 5.0 },
      point: { active: false, target: null, ray: null },
    },
    worldTable: {
      rotation: 0,
      scale: 1.0,
      offsetX: 0,
      offsetZ: 0,
      selectedEntity: null,
      hoveredEntity: null,
    },
    godHand: {
      active: false,
      leftHand: null,
      rightHand: null,
      dominantHand: "right",
      pinchThreshold: 0.03,
      grabThreshold: 0.06,
    },
    touchGestures: {
      touches: [],
      lastPinchDist: 0,
      lastRotateAngle: 0,
      twoFingerActive: false,
    },
    actionLog: [],
    entitySelectCallbacks: [],
    gestureCallbacks: {},
  };

  const D = window.xrInteractionV69Data;

  function addLog(msg, entity) {
    D.actionLog.push({ t: Date.now(), msg, entity: entity ? entity.name || entity.id : null });
    if (D.actionLog.length > 40) D.actionLog = D.actionLog.slice(-40);
  }

  function notifyGesture(type, data) {
    const cbs = D.gestureCallbacks[type] || [];
    cbs.forEach(fn => { try { fn(data); } catch (e) {} });
  }

  function onEntitySelect(entity, source) {
    D.worldTable.selectedEntity = entity;
    addLog("Selected: " + (entity ? entity.name || entity.id : "none"), entity);
    D.entitySelectCallbacks.forEach(fn => { try { fn(entity, source); } catch (e) {} });
    if (typeof sge67OnEntitySelect === "function" && entity) {
      sge67OnEntitySelect({ name: entity.name, type: entity.type });
    }
  }

  function setupTouchGestures(canvas) {
    if (!canvas) return;

    canvas.addEventListener("touchstart", function (e) {
      D.touchGestures.touches = Array.from(e.touches);
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        D.touchGestures.lastPinchDist = Math.sqrt(dx * dx + dy * dy);
        D.touchGestures.lastRotateAngle = Math.atan2(dy, dx);
        D.touchGestures.twoFingerActive = true;
      }
    }, { passive: true });

    canvas.addEventListener("touchmove", function (e) {
      if (e.touches.length === 2 && D.touchGestures.twoFingerActive) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        const pinchDelta = dist - D.touchGestures.lastPinchDist;
        const scaleFactor = dist / Math.max(D.touchGestures.lastPinchDist, 1);
        D.touchGestures.lastPinchDist = dist;

        if (Math.abs(pinchDelta) > 2) {
          const newScale = Math.max(D.gestureState.scale.min,
            Math.min(D.gestureState.scale.max, D.worldTable.scale * scaleFactor));
          D.worldTable.scale = newScale;
          D.gestureState.scale.active = true;
          D.gestureState.scale.factor = scaleFactor;
          notifyGesture("scale", { factor: scaleFactor, currentScale: newScale });
          addLog("Pinch scale: " + newScale.toFixed(2));
        }

        const rotateDelta = angle - D.touchGestures.lastRotateAngle;
        D.touchGestures.lastRotateAngle = angle;
        if (Math.abs(rotateDelta) > 0.01) {
          D.worldTable.rotation += rotateDelta;
          D.gestureState.rotate.active = true;
          D.gestureState.rotate.angle = D.worldTable.rotation;
          notifyGesture("rotate", { delta: rotateDelta, total: D.worldTable.rotation });
        }
      }
    }, { passive: true });

    canvas.addEventListener("touchend", function (e) {
      if (e.touches.length < 2) {
        D.touchGestures.twoFingerActive = false;
        D.gestureState.scale.active = false;
        D.gestureState.rotate.active = false;
      }
      D.touchGestures.touches = Array.from(e.touches);
    }, { passive: true });
  }

  function setupMouseGestures(canvas) {
    if (!canvas) return;
    let mouseDown = false;
    let lastX = 0;
    let lastY = 0;
    let ctrlHeld = false;

    window.addEventListener("keydown", function (e) { if (e.key === "Control") ctrlHeld = true; });
    window.addEventListener("keyup", function (e) { if (e.key === "Control") ctrlHeld = false; });

    canvas.addEventListener("mousedown", function (e) {
      mouseDown = true;
      lastX = e.clientX;
      lastY = e.clientY;
      D.gestureState.grab.active = ctrlHeld;
    });

    window.addEventListener("mouseup", function () {
      mouseDown = false;
      D.gestureState.grab.active = false;
    });

    window.addEventListener("mousemove", function (e) {
      if (!mouseDown) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      if (ctrlHeld) {
        D.worldTable.offsetX += dx * 0.002;
        D.worldTable.offsetZ += dy * 0.002;
        notifyGesture("grab", { dx, dy });
      } else {
        D.worldTable.rotation += dx * 0.01;
        notifyGesture("rotate", { delta: dx * 0.01, total: D.worldTable.rotation });
      }
    });

    canvas.addEventListener("wheel", function (e) {
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(D.gestureState.scale.min,
        Math.min(D.gestureState.scale.max, D.worldTable.scale * delta));
      D.worldTable.scale = newScale;
      notifyGesture("scale", { factor: delta, currentScale: newScale });
      e.preventDefault();
    }, { passive: false });
  }

  function setupXRHandTracking(session) {
    if (!session || !window.XRHand) return;
    addLog("XR hand tracking setup initiated");

    session.addEventListener("inputsourceschange", function (e) {
      e.added.forEach(function (source) {
        if (source.hand) {
          if (source.handedness === "left") D.godHand.leftHand = source;
          else if (source.handedness === "right") D.godHand.rightHand = source;
          addLog("Hand source added: " + source.handedness);
        }
      });
      e.removed.forEach(function (source) {
        if (source.handedness === "left") D.godHand.leftHand = null;
        else if (source.handedness === "right") D.godHand.rightHand = null;
      });
    });
  }

  function processHandFrame(frame, refSpace) {
    if (!frame || !refSpace) return;
    const dominant = D.godHand.dominantHand === "right" ? D.godHand.rightHand : D.godHand.leftHand;
    if (!dominant || !dominant.hand) return;

    const hand = dominant.hand;
    const thumbTip = hand.get("thumb-tip");
    const indexTip = hand.get("index-finger-tip");
    const middleTip = hand.get("middle-finger-tip");

    if (!thumbTip || !indexTip) return;

    const thumbPose = frame.getJointPose(thumbTip, refSpace);
    const indexPose = frame.getJointPose(indexTip, refSpace);

    if (!thumbPose || !indexPose) return;

    const tp = thumbPose.transform.position;
    const ip = indexPose.transform.position;
    const dist = Math.sqrt(
      Math.pow(tp.x - ip.x, 2) +
      Math.pow(tp.y - ip.y, 2) +
      Math.pow(tp.z - ip.z, 2)
    );

    const pinching = dist < D.godHand.pinchThreshold;
    if (pinching !== D.gestureState.pinch.active) {
      D.gestureState.pinch.active = pinching;
      D.gestureState.pinch.distance = dist;
      notifyGesture("pinch", { active: pinching, distance: dist, position: { x: ip.x, y: ip.y, z: ip.z } });
      if (pinching) addLog("God Hand: Pinch gesture detected");
    }

    if (middleTip) {
      const middlePose = frame.getJointPose(middleTip, refSpace);
      if (middlePose) {
        const mp = middlePose.transform.position;
        const grabDist = Math.sqrt(
          Math.pow(tp.x - mp.x, 2) +
          Math.pow(tp.y - mp.y, 2) +
          Math.pow(tp.z - mp.z, 2)
        );
        const grabbing = grabDist < D.godHand.grabThreshold;
        if (grabbing !== D.gestureState.grab.active) {
          D.gestureState.grab.active = grabbing;
          notifyGesture("grab", { active: grabbing });
          if (grabbing) addLog("God Hand: Grab gesture detected");
        }
      }
    }
  }

  function detectPointGesture(controllers, scene, camera) {
    if (!controllers || !controllers.length || !scene || !camera) return;
    D.gestureState.point.active = true;
    notifyGesture("point", { active: true });
  }

  function resetWorldTable() {
    D.worldTable.rotation = 0;
    D.worldTable.scale = 1.0;
    D.worldTable.offsetX = 0;
    D.worldTable.offsetZ = 0;
    D.worldTable.selectedEntity = null;
    notifyGesture("reset", {});
    addLog("World Table reset");
  }

  function attachToCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return false;
    setupTouchGestures(canvas);
    setupMouseGestures(canvas);
    addLog("Interaction attached to canvas: " + canvasId);
    return true;
  }

  window.xr69InteractionData = D;
  window.xr69OnEntitySelect = onEntitySelect;
  window.xr69AttachToCanvas = attachToCanvas;
  window.xr69SetupHandTracking = setupXRHandTracking;
  window.xr69ProcessHandFrame = processHandFrame;
  window.xr69ResetWorldTable = resetWorldTable;
  window.xr69OnGesture = function (type, cb) {
    if (!D.gestureCallbacks[type]) D.gestureCallbacks[type] = [];
    D.gestureCallbacks[type].push(cb);
  };
  window.xr69OnEntitySelected = function (cb) { D.entitySelectCallbacks.push(cb); };
  window.xr69GetGestureState = function () { return D.gestureState; };
  window.xr69GetWorldTableState = function () { return D.worldTable; };
  window.xr69GetActionLog = function () { return D.actionLog.slice(); };
  window.xr69GetGodHandState = function () { return D.godHand; };

  function init() {
    D.initialized = true;
    addLog("xrInteractionSystem V69 initialized");
    console.log("[xrInteractionSystem V69] 🤚 God Hand & Spatial Interaction System sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 15700); });
  } else {
    setTimeout(init, 15700);
  }
})();
