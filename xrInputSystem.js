(function () {
  "use strict";

  window.xrInputV69Data = {
    version: "V69",
    initialized: false,
    controllers: {
      left: null,
      right: null,
    },
    hands: {
      left: null,
      right: null,
    },
    pointer: {
      active: false,
      position: { x: 0, y: 0 },
      worldPosition: { x: 0, y: 0, z: 0 },
    },
    keyboard: {
      shiftHeld: false,
      ctrlHeld: false,
      altHeld: false,
    },
    inputMap: {
      "KeyR": "resetWorldTable",
      "KeyW": "worldTableMode",
      "KeyG": "godHandToggle",
      "KeyV": "enterVR",
      "KeyA": "enterAR",
      "KeyF": "flatMode",
      "Escape": "exitXR",
      "ArrowLeft": "rotateLeft",
      "ArrowRight": "rotateRight",
      "ArrowUp": "scaleUp",
      "ArrowDown": "scaleDown",
    },
    activeInputs: [],
    inputLog: [],
    eventBus: {},
  };

  const D = window.xrInputV69Data;

  function addLog(msg) {
    D.inputLog.push({ t: Date.now(), msg });
    if (D.inputLog.length > 30) D.inputLog = D.inputLog.slice(-30);
  }

  function emit(event, data) {
    const handlers = D.eventBus[event] || [];
    handlers.forEach(function (fn) { try { fn(data); } catch (e) {} });
  }

  function on(event, fn) {
    if (!D.eventBus[event]) D.eventBus[event] = [];
    D.eventBus[event].push(fn);
  }

  function setupKeyboard() {
    window.addEventListener("keydown", function (e) {
      D.keyboard.shiftHeld = e.shiftKey;
      D.keyboard.ctrlHeld = e.ctrlKey;
      D.keyboard.altHeld = e.altKey;

      const action = D.inputMap[e.code];
      if (!action) return;

      addLog("Key: " + e.code + " → " + action);
      D.activeInputs.push(action);

      switch (action) {
        case "resetWorldTable":
          if (typeof xr69ResetWorldTable === "function") xr69ResetWorldTable();
          emit("resetWorldTable", {});
          break;
        case "worldTableMode":
          if (typeof xr69ActivateWorldTable === "function") xr69ActivateWorldTable({});
          emit("worldTableMode", {});
          break;
        case "godHandToggle":
          if (window.xrInteractionV69Data) {
            window.xrInteractionV69Data.godHand.active = !window.xrInteractionV69Data.godHand.active;
          }
          emit("godHandToggle", {});
          break;
        case "enterVR":
          if (typeof xr69RequestSession === "function") xr69RequestSession("immersive-vr");
          emit("enterVR", {});
          break;
        case "enterAR":
          if (typeof xr69RequestSession === "function") xr69RequestSession("immersive-ar");
          emit("enterAR", {});
          break;
        case "flatMode":
          emit("flatMode", {});
          break;
        case "exitXR":
          if (typeof xr69EndSession === "function") xr69EndSession();
          emit("exitXR", {});
          break;
        case "rotateLeft":
          if (window.xrInteractionV69Data) {
            window.xrInteractionV69Data.worldTable.rotation -= 0.1;
            emit("rotate", { delta: -0.1, total: window.xrInteractionV69Data.worldTable.rotation });
          }
          break;
        case "rotateRight":
          if (window.xrInteractionV69Data) {
            window.xrInteractionV69Data.worldTable.rotation += 0.1;
            emit("rotate", { delta: 0.1, total: window.xrInteractionV69Data.worldTable.rotation });
          }
          break;
        case "scaleUp":
          if (window.xrInteractionV69Data) {
            const s = Math.min(5.0, window.xrInteractionV69Data.worldTable.scale * 1.1);
            window.xrInteractionV69Data.worldTable.scale = s;
            emit("scale", { factor: 1.1, currentScale: s });
          }
          break;
        case "scaleDown":
          if (window.xrInteractionV69Data) {
            const s = Math.max(0.1, window.xrInteractionV69Data.worldTable.scale * 0.9);
            window.xrInteractionV69Data.worldTable.scale = s;
            emit("scale", { factor: 0.9, currentScale: s });
          }
          break;
      }
    });

    window.addEventListener("keyup", function (e) {
      D.keyboard.shiftHeld = e.shiftKey;
      D.keyboard.ctrlHeld = e.ctrlKey;
      D.keyboard.altHeld = e.altKey;
      const action = D.inputMap[e.code];
      if (action) D.activeInputs = D.activeInputs.filter(function (a) { return a !== action; });
    });
  }

  function setupXRControllers(renderer) {
    if (!renderer || !renderer.xr) return;

    const ctrl0 = renderer.xr.getController(0);
    const ctrl1 = renderer.xr.getController(1);

    function onSelectStart(e) {
      const src = e.target.inputSource;
      const hand = src ? src.handedness : "unknown";
      addLog("XR select start: " + hand);
      emit("selectStart", { hand, source: src });
    }

    function onSelectEnd(e) {
      const src = e.target.inputSource;
      const hand = src ? src.handedness : "unknown";
      addLog("XR select end: " + hand);
      emit("selectEnd", { hand, source: src });
    }

    function onSqueezeStart(e) {
      const src = e.target.inputSource;
      addLog("XR squeeze (grab) start");
      emit("grabStart", { source: src });
    }

    function onSqueezeEnd(e) {
      addLog("XR squeeze (grab) end");
      emit("grabEnd", {});
    }

    [ctrl0, ctrl1].forEach(function (ctrl) {
      ctrl.addEventListener("selectstart", onSelectStart);
      ctrl.addEventListener("selectend", onSelectEnd);
      ctrl.addEventListener("squeezestart", onSqueezeStart);
      ctrl.addEventListener("squeezeend", onSqueezeEnd);
    });

    D.controllers.right = ctrl0;
    D.controllers.left = ctrl1;
    addLog("XR controllers registered");
  }

  function setupGazeInput(camera) {
    if (!camera) return;
    addLog("Gaze input setup (Vision Pro eye-tracking compatible)");
    emit("gazeReady", { camera });
  }

  function processXRFrame(frame, refSpace, session) {
    if (!frame || !session) return;

    for (const source of session.inputSources) {
      if (!source.gripSpace) continue;
      const pose = frame.getPose(source.gripSpace, refSpace);
      if (!pose) continue;

      const pos = pose.transform.position;
      const hand = source.handedness;

      if (hand === "right") {
        D.pointer.worldPosition = { x: pos.x, y: pos.y, z: pos.z };
      }

      if (source.gamepad) {
        const gp = source.gamepad;
        if (gp.buttons[0] && gp.buttons[0].pressed) {
          emit("triggerPress", { hand, gamepad: gp });
        }
        if (gp.axes && gp.axes.length >= 2) {
          const ax = gp.axes[2] || 0;
          const ay = gp.axes[3] || 0;
          if (Math.abs(ax) > 0.3 || Math.abs(ay) > 0.3) {
            emit("thumbstick", { hand, x: ax, y: ay });
            if (window.xrInteractionV69Data) {
              window.xrInteractionV69Data.worldTable.rotation += ax * 0.03;
            }
          }
        }
      }
    }

    if (typeof xr69ProcessHandFrame === "function") {
      xr69ProcessHandFrame(frame, refSpace);
    }
  }

  function getKeyboardShortcutsHTML() {
    return Object.entries(D.inputMap).map(function (kv) {
      const key = kv[0].replace("Key", "").replace("Arrow", "↑↓←→ ").replace("Escape", "Esc");
      return "<div style='display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.05)'>" +
        "<span style='color:#64748b;font-size:11px'>[" + key + "]</span>" +
        "<span style='color:#94a3b8;font-size:11px'>" + kv[1] + "</span></div>";
    }).join("");
  }

  window.xr69InputData = D;
  window.xr69InputOn = on;
  window.xr69InputEmit = emit;
  window.xr69SetupControllers = setupXRControllers;
  window.xr69SetupGaze = setupGazeInput;
  window.xr69ProcessXRFrame = processXRFrame;
  window.xr69GetInputLog = function () { return D.inputLog.slice(); };
  window.xr69GetKeyboardShortcutsHTML = getKeyboardShortcutsHTML;
  window.xr69MapKey = function (keyCode, action) {
    D.inputMap[keyCode] = action;
    addLog("Key mapped: " + keyCode + " → " + action);
  };

  function init() {
    D.initialized = true;
    setupKeyboard();
    addLog("xrInputSystem V69 initialized");
    console.log("[xrInputSystem V69] ⌨️ XR Input & Controller System sẵn sàng — Keyboard/Touch/Hand/Controller/Gaze.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 15800); });
  } else {
    setTimeout(init, 15800);
  }
})();
