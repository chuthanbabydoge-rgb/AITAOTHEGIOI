(function () {
  "use strict";

  const VERSION = "V89";
  const SAVE_KEY = "cgv6_quest_bridge_v89";

  window.questBridgeData = {
    version: VERSION,
    connected: false,
    model: "unknown",
    firmwareVersion: null,
    handTrackingActive: false,
    passthroughActive: false,
    controllerState: {
      left: { grip: 0, trigger: 0, thumbstick: [0, 0], buttons: {}, pose: null },
      right: { grip: 0, trigger: 0, thumbstick: [0, 0], buttons: {}, pose: null },
    },
    handState: {
      left: { joints: [], pinch: false, grab: false, point: false },
      right: { joints: [], pinch: false, grab: false, point: false },
    },
    passthroughMode: "disabled",
    performanceLevel: "balanced",
    foveationLevel: 4,
    refreshRate: 72,
    boundaryActive: false,
    interactions: [],
    eventLog: [],
  };

  const Q = window.questBridgeData;

  function save() {
    try {
      const slim = Object.assign({}, Q, { handState: { left:{joints:[],pinch:Q.handState.left.pinch,grab:Q.handState.left.grab}, right:{joints:[],pinch:Q.handState.right.pinch,grab:Q.handState.right.grab} } });
      localStorage.setItem(SAVE_KEY, JSON.stringify(slim));
    } catch(e) {}
  }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { const p = JSON.parse(raw); Object.assign(Q, p); }
    } catch(e) {}
  }

  function log(msg) {
    Q.eventLog.unshift({ t: window.year || 0, msg, ts: Date.now() });
    if (Q.eventLog.length > 60) Q.eventLog.pop();
    console.log("[QuestBridge V89]", msg);
  }

  // ─── Quest Device Detection ──────────────────────────────────
  function detectQuestModel() {
    const ua = navigator.userAgent || "";
    if (ua.includes("Quest 3")) return "Meta Quest 3";
    if (ua.includes("Quest 2")) return "Meta Quest 2";
    if (ua.includes("Quest Pro")) return "Meta Quest Pro";
    if (ua.includes("Quest")) return "Meta Quest (Unknown Gen)";
    return "Non-Quest WebXR Device";
  }

  // ─── Session Lifecycle ───────────────────────────────────────
  window.questBridgeOnSessionStart = async function (session) {
    Q.connected = true;
    Q.model = detectQuestModel();
    log("Quest session bắt đầu: " + Q.model);

    // Hand Tracking
    if (session.inputSources) {
      session.addEventListener("inputsourceschange", (evt) => {
        onInputSourcesChange(session, evt);
      });
    }

    // Passthrough setup
    if (session.enabledFeatures && session.enabledFeatures.includes("local-floor")) {
      await setupPassthrough(session);
    }

    // Refresh rate
    if (session.updateTargetFrameRate) {
      try {
        const rates = session.supportedFrameRates || [72, 90, 120];
        const bestRate = Math.max(...rates);
        await session.updateTargetFrameRate(bestRate);
        Q.refreshRate = bestRate;
        log("Refresh rate: " + bestRate + "Hz");
      } catch(e) {}
    }

    // Foveated rendering
    if (session.updateRenderState) {
      try {
        session.updateRenderState({ foveation: Q.foveationLevel / 10 });
      } catch(e) {}
    }

    session.addEventListener("end", () => {
      Q.connected = false;
      Q.handTrackingActive = false;
      Q.passthroughActive = false;
      log("Quest session kết thúc");
      save();
    });

    save();
  };

  function onInputSourcesChange(session, evt) {
    for (const src of session.inputSources) {
      if (src.profiles && src.profiles.includes("hand")) {
        Q.handTrackingActive = true;
        log("Hand tracking kích hoạt: " + src.handedness);
      }
    }
  }

  async function setupPassthrough(session) {
    if (Q.passthroughMode === "disabled") return;
    try {
      if (window.XRMediaBinding) {
        log("Passthrough layer hỗ trợ");
        Q.passthroughActive = true;
      }
    } catch(e) {
      log("Passthrough không khả dụng: " + e.message);
    }
  }

  // ─── Per-Frame Hand Tracking ─────────────────────────────────
  window.questBridgeProcessFrame = function (frame, refSpace) {
    if (!frame || !Q.connected) return;
    const session = frame.session;
    if (!session || !session.inputSources) return;

    for (const src of session.inputSources) {
      const hand = src.handedness;
      if (!hand || (hand !== "left" && hand !== "right")) continue;

      if (src.hand && frame.getJointPose) {
        const joints = [];
        for (const [name, joint] of src.hand.entries()) {
          try {
            const pose = frame.getJointPose(joint, refSpace);
            if (pose) joints.push({ name, position: pose.transform.position });
          } catch(e) {}
        }
        Q.handState[hand].joints = joints;

        // Gesture detection (simplified)
        if (joints.length > 10) {
          const thumb = joints.find(j => j.name === "thumb-tip");
          const index = joints.find(j => j.name === "index-finger-tip");
          if (thumb && index) {
            const dx = thumb.position.x - index.position.x;
            const dy = thumb.position.y - index.position.y;
            const dz = thumb.position.z - index.position.z;
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            const wasPinch = Q.handState[hand].pinch;
            Q.handState[hand].pinch = dist < 0.02;
            if (Q.handState[hand].pinch && !wasPinch) {
              onGesture(hand, "pinch");
            }
          }
        }
      }

      if (src.gamepad) {
        const gp = src.gamepad;
        Q.controllerState[hand].trigger = gp.axes[0] || 0;
        Q.controllerState[hand].grip = gp.axes[1] || 0;
        if (gp.axes.length >= 4) {
          Q.controllerState[hand].thumbstick = [gp.axes[2] || 0, gp.axes[3] || 0];
        }
        Q.controllerState[hand].buttons = {};
        gp.buttons.forEach((btn, i) => {
          Q.controllerState[hand].buttons["btn" + i] = btn.pressed;
        });
      }
    }
  };

  function onGesture(hand, gesture) {
    Q.interactions.unshift({ hand, gesture, t: window.year || 0, ts: Date.now() });
    if (Q.interactions.length > 30) Q.interactions.pop();
    if (window.xrGodInteraction && gesture === "pinch") {
      log("Quest " + hand + " pinch → Thần Năng kích hoạt");
    }
  }

  // ─── Passthrough Controls ────────────────────────────────────
  function setPassthroughMode(mode) {
    const modes = ["disabled", "overlay", "full"];
    if (!modes.includes(mode)) return;
    Q.passthroughMode = mode;
    log("Passthrough mode: " + mode);
    save();
  }

  function setPerformanceLevel(level) {
    const levels = ["battery", "balanced", "performance"];
    if (!levels.includes(level)) return;
    Q.performanceLevel = level;
    const fov = level === "performance" ? 8 : level === "balanced" ? 4 : 2;
    Q.foveationLevel = fov;
    log("Performance: " + level + " / Foveation: " + fov);
    save();
  }

  // ─── Haptic Feedback ─────────────────────────────────────────
  async function triggerHaptic(hand, intensity, duration) {
    try {
      const session = window.__xrCurrentSession;
      if (!session) return;
      for (const src of session.inputSources) {
        if (src.handedness === hand && src.gamepad && src.gamepad.hapticActuators) {
          for (const actuator of src.gamepad.hapticActuators) {
            await actuator.pulse(intensity || 0.5, duration || 100);
          }
        }
      }
    } catch(e) {}
  }

  // ─── Public API ──────────────────────────────────────────────
  window.qb89IsConnected = () => Q.connected;
  window.qb89GetModel = () => Q.model;
  window.qb89GetHandState = (hand) => Q.handState[hand] || Q.handState.right;
  window.qb89GetControllerState = (hand) => Q.controllerState[hand] || Q.controllerState.right;
  window.qb89IsHandTrackingActive = () => Q.handTrackingActive;
  window.qb89IsPassthroughActive = () => Q.passthroughActive;
  window.qb89SetPassthrough = setPassthroughMode;
  window.qb89SetPerformance = setPerformanceLevel;
  window.qb89TriggerHaptic = triggerHaptic;
  window.qb89GetInteractions = () => Q.interactions;
  window.qb89GetLog = () => Q.eventLog;
  window.qb89GetStats = () => ({
    connected: Q.connected,
    model: Q.model,
    handTracking: Q.handTrackingActive,
    passthrough: Q.passthroughActive,
    passthroughMode: Q.passthroughMode,
    performance: Q.performanceLevel,
    foveation: Q.foveationLevel,
    refreshRate: Q.refreshRate,
    totalInteractions: Q.interactions.length,
  });

  window.qb89RenderPanel = function () {
    const s = window.qb89GetStats();
    const lh = Q.handState.left;
    const rh = Q.handState.right;
    return `
      <div style="padding:12px;font-size:12px;color:#e2e8f0;font-family:monospace">
        <div style="color:#60a5fa;font-weight:700;font-size:14px;margin-bottom:10px">🥽 Meta Quest Bridge V89</div>
        <div style="background:rgba(96,165,250,0.08);border:1px solid rgba(96,165,250,0.2);border-radius:8px;padding:10px;margin-bottom:8px">
          <div style="color:#60a5fa;font-weight:700;margin-bottom:6px">📊 Trạng Thái Thiết Bị</div>
          <div style="display:flex;justify-content:space-between;padding:3px 0"><span style="color:#64748b">Model</span><span style="color:#93c5fd">${s.model}</span></div>
          <div style="display:flex;justify-content:space-between;padding:3px 0"><span style="color:#64748b">Kết Nối</span><span style="color:${s.connected?"#34d399":"#ef4444"}">${s.connected?"✓ Online":"✗ Offline"}</span></div>
          <div style="display:flex;justify-content:space-between;padding:3px 0"><span style="color:#64748b">Refresh Rate</span><span>${s.refreshRate}Hz</span></div>
          <div style="display:flex;justify-content:space-between;padding:3px 0"><span style="color:#64748b">Hand Tracking</span><span style="color:${s.handTracking?"#34d399":"#64748b"}">${s.handTracking?"Bật":"Tắt"}</span></div>
          <div style="display:flex;justify-content:space-between;padding:3px 0"><span style="color:#64748b">Passthrough</span><span>${s.passthroughMode}</span></div>
          <div style="display:flex;justify-content:space-between;padding:3px 0"><span style="color:#64748b">Foveation</span><span>Level ${s.foveation}/10</span></div>
          <div style="display:flex;justify-content:space-between;padding:3px 0"><span style="color:#64748b">Performance</span><span style="color:#fbbf24">${s.performance}</span></div>
        </div>
        <div style="background:rgba(52,211,153,0.06);border:1px solid rgba(52,211,153,0.15);border-radius:8px;padding:10px;margin-bottom:8px">
          <div style="color:#34d399;font-weight:700;margin-bottom:6px">🖐 Hand State</div>
          <div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#64748b">Left Pinch</span><span style="color:${lh.pinch?"#f0abfc":"#64748b"}">${lh.pinch?"PINCH":"—"}</span></div>
          <div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#64748b">Right Pinch</span><span style="color:${rh.pinch?"#f0abfc":"#64748b"}">${rh.pinch?"PINCH":"—"}</span></div>
          <div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#64748b">Tương Tác</span><span>${s.totalInteractions}</span></div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
          <button onclick="window.qb89SetPassthrough('overlay')" style="padding:5px 10px;background:rgba(96,165,250,0.15);border:1px solid rgba(96,165,250,0.3);color:#60a5fa;border-radius:5px;cursor:pointer;font-size:10px">Passthrough Overlay</button>
          <button onclick="window.qb89SetPerformance('performance')" style="padding:5px 10px;background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.3);color:#fbbf24;border-radius:5px;cursor:pointer;font-size:10px">⚡ Max Performance</button>
          <button onclick="window.qb89TriggerHaptic('right',0.8,150)" style="padding:5px 10px;background:rgba(192,132,252,0.12);border:1px solid rgba(192,132,252,0.3);color:#c084fc;border-radius:5px;cursor:pointer;font-size:10px">📳 Haptic Test</button>
        </div>
        <div style="margin-top:10px;max-height:80px;overflow-y:auto;font-size:10px;color:#475569">
          ${Q.eventLog.slice(0,5).map(e=>`<div>[${e.t}] ${e.msg}</div>`).join("")}
        </div>
      </div>
    `;
  };

  function init() {
    load();
    Q.model = detectQuestModel();
    console.log("[QuestBridge V89] 🥽 Meta Quest Bridge khởi động — Hand Tracking · Passthrough · Haptics · Foveation sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 23800); });
  } else {
    setTimeout(init, 23800);
  }
})();
