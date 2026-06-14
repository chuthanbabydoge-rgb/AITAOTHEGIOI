(function () {
  "use strict";

  const VERSION = "V89";
  const SAVE_KEY = "cgv6_vision_pro_bridge_v89";

  window.visionProBridgeData = {
    version: VERSION,
    connected: false,
    detected: false,
    eyeTrackingActive: false,
    handGestureActive: false,
    spatialAudioActive: false,
    sceneMeshingActive: false,
    worldUnderstandingActive: false,
    eyeState: {
      left: { gaze: null, pupilDilation: 0, openness: 1 },
      right: { gaze: null, pupilDilation: 0, openness: 1 },
      combined: { direction: null, origin: null, focused: false },
    },
    handState: {
      left: { pose: null, gesture: "open", pinch: false, confidence: 0 },
      right: { pose: null, gesture: "open", pinch: false, confidence: 0 },
    },
    windowState: {
      windows: [],
      mainWindowSize: [1920, 1080],
      renderScale: 1.5,
      ornamentActive: false,
    },
    spatialAnchors: [],
    lightEstimate: null,
    interactions: [],
    eventLog: [],
  };

  const VP = window.visionProBridgeData;

  function save() {
    try {
      const slim = Object.assign({}, VP, {
        eyeState: { combined: VP.eyeState.combined, left: {}, right: {} },
        spatialAnchors: VP.spatialAnchors.slice(-10),
      });
      localStorage.setItem(SAVE_KEY, JSON.stringify(slim));
    } catch(e) {}
  }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { const p = JSON.parse(raw); Object.assign(VP, p); }
    } catch(e) {}
  }

  function log(msg) {
    VP.eventLog.unshift({ t: window.year || 0, msg, ts: Date.now() });
    if (VP.eventLog.length > 60) VP.eventLog.pop();
    console.log("[VisionProBridge V89]", msg);
  }

  // ─── Detection ───────────────────────────────────────────────
  function detectVisionPro() {
    const ua = navigator.userAgent || "";
    const isVP = /VisionOS|Vision Pro|visionOS/.test(ua)
      || window.__isVisionPro === true
      || (navigator.platform && navigator.platform.includes("Vision"));

    VP.detected = isVP;
    if (isVP) {
      log("Apple Vision Pro phát hiện thành công");
      VP.windowState.renderScale = 1.5;
    } else {
      log("Không phải Vision Pro — chạy chế độ tương thích WebXR");
      VP.windowState.renderScale = 1.0;
    }
    return isVP;
  }

  // ─── Session Lifecycle ───────────────────────────────────────
  window.visionProBridgeOnSessionStart = async function (session) {
    VP.connected = true;
    log("Vision Pro XR session bắt đầu");

    // Eye tracking
    if (session.features && session.features.has("eye-tracking")) {
      VP.eyeTrackingActive = true;
      log("Eye tracking kích hoạt");
    }

    // Hand tracking
    if (session.inputSources) {
      session.addEventListener("inputsourceschange", onInputChange);
    }

    // Light estimation
    if (session.getLightProbe) {
      try {
        const probe = await session.getLightProbe({ reflectionFormat: "srgba8" });
        if (probe) {
          VP.spatialAudioActive = true;
          log("Light estimation probe kích hoạt");
        }
      } catch(e) {}
    }

    // World understanding / scene mesh
    if (session.initiateRoomCapture) {
      VP.worldUnderstandingActive = true;
      log("World understanding sẵn sàng");
    }

    session.addEventListener("end", () => {
      VP.connected = false;
      VP.eyeTrackingActive = false;
      VP.handGestureActive = false;
      log("Vision Pro session kết thúc");
      save();
    });

    save();
  };

  function onInputChange(evt) {
    for (const src of evt.session.inputSources) {
      if (src.profiles && (src.profiles.includes("hand") || src.hand)) {
        VP.handGestureActive = true;
        log("Vision Pro hand tracking: " + src.handedness);
      }
    }
  }

  // ─── Eye Tracking Frame Processing ──────────────────────────
  window.visionProProcessFrame = function (frame, refSpace) {
    if (!frame || !VP.connected) return;

    // Eye tracking via XRFrame
    if (VP.eyeTrackingActive && frame.getViewerPose) {
      try {
        const pose = frame.getViewerPose(refSpace);
        if (pose && pose.views) {
          for (const view of pose.views) {
            const side = view.eye || "none";
            if (side === "left" || side === "right") {
              VP.eyeState[side].gaze = {
                x: view.transform.position.x,
                y: view.transform.position.y,
                z: view.transform.position.z,
              };
            }
          }
        }
      } catch(e) {}
    }

    // Hand gesture processing
    if (frame.session && frame.session.inputSources) {
      for (const src of frame.session.inputSources) {
        const hand = src.handedness;
        if (!hand || (hand !== "left" && hand !== "right")) continue;
        if (!src.hand) continue;

        VP.handState[hand].confidence = 1.0;
        try {
          const thumbTip = src.hand.get("thumb-tip");
          const indexTip = src.hand.get("index-finger-tip");
          if (thumbTip && indexTip) {
            const tPose = frame.getJointPose(thumbTip, refSpace);
            const iPose = frame.getJointPose(indexTip, refSpace);
            if (tPose && iPose) {
              const dx = tPose.transform.position.x - iPose.transform.position.x;
              const dy = tPose.transform.position.y - iPose.transform.position.y;
              const dz = tPose.transform.position.z - iPose.transform.position.z;
              const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
              const wasPinch = VP.handState[hand].pinch;
              VP.handState[hand].pinch = dist < 0.025;
              VP.handState[hand].gesture = dist < 0.025 ? "pinch" : "open";
              if (VP.handState[hand].pinch && !wasPinch) {
                onVisionProGesture(hand, "pinch");
              }
            }
          }
        } catch(e) {}
      }
    }
  };

  function onVisionProGesture(hand, gesture) {
    VP.interactions.unshift({ hand, gesture, t: window.year || 0, ts: Date.now() });
    if (VP.interactions.length > 30) VP.interactions.pop();
    log("Vision Pro " + hand + " " + gesture + " → Thần Can Thiệp");
    if (window.cgv51CastMiracle && gesture === "pinch") {
      log("Vision Pro pinch → Thần Tích kích hoạt");
    }
  }

  // ─── Spatial Anchors ─────────────────────────────────────────
  async function createSpatialAnchor(position, label) {
    const anchor = {
      id: "vpa_" + Date.now(),
      position,
      label: label || "World Anchor",
      created: window.year || 0,
      ts: Date.now(),
    };
    VP.spatialAnchors.push(anchor);
    if (VP.spatialAnchors.length > 20) VP.spatialAnchors.shift();
    log("Spatial anchor tạo: " + label);
    save();
    return anchor;
  }

  // ─── Window Management (visionOS) ────────────────────────────
  function openVolume(worldId, position) {
    const win = {
      id: "vpw_" + Date.now(),
      type: "volume",
      worldId,
      position: position || [0, 0, -1],
      size: [0.5, 0.5, 0.5],
      open: true,
    };
    VP.windowState.windows.push(win);
    log("Volume window mở cho world: " + (worldId || "main"));
    save();
    return win;
  }

  function setOrnamentMode(enabled) {
    VP.windowState.ornamentActive = enabled;
    log("Ornament mode: " + (enabled ? "bật" : "tắt"));
    save();
  }

  // ─── Spatial Audio ───────────────────────────────────────────
  function playSpatialAudio(soundId, position) {
    if (!VP.spatialAudioActive && !VP.connected) return false;
    log("Spatial audio: " + soundId + " at [" + (position||[0,0,0]).join(",") + "]");
    if (window.AudioContext || window.webkitAudioContext) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const panner = ctx.createPanner();
        if (position) {
          panner.positionX.value = position[0] || 0;
          panner.positionY.value = position[1] || 0;
          panner.positionZ.value = position[2] || -1;
        }
        osc.connect(panner);
        panner.connect(ctx.destination);
        osc.frequency.value = 440;
        osc.start();
        setTimeout(() => { osc.stop(); ctx.close(); }, 200);
        return true;
      } catch(e) {}
    }
    return false;
  }

  // ─── Public API ──────────────────────────────────────────────
  window.vpb89IsConnected = () => VP.connected;
  window.vpb89IsDetected = () => VP.detected;
  window.vpb89GetEyeState = () => VP.eyeState;
  window.vpb89GetHandState = (h) => VP.handState[h] || VP.handState.right;
  window.vpb89IsEyeTracking = () => VP.eyeTrackingActive;
  window.vpb89CreateAnchor = createSpatialAnchor;
  window.vpb89GetAnchors = () => VP.spatialAnchors;
  window.vpb89OpenVolume = openVolume;
  window.vpb89SetOrnament = setOrnamentMode;
  window.vpb89PlaySpatialAudio = playSpatialAudio;
  window.vpb89GetLog = () => VP.eventLog;
  window.vpb89GetStats = () => ({
    connected: VP.connected,
    detected: VP.detected,
    eyeTracking: VP.eyeTrackingActive,
    handGesture: VP.handGestureActive,
    spatialAudio: VP.spatialAudioActive,
    worldUnderstanding: VP.worldUnderstandingActive,
    spatialAnchors: VP.spatialAnchors.length,
    windows: VP.windowState.windows.length,
    ornament: VP.windowState.ornamentActive,
    interactions: VP.interactions.length,
    renderScale: VP.windowState.renderScale,
  });

  window.vpb89RenderPanel = function () {
    const s = window.vpb89GetStats();
    const eyes = VP.eyeState;
    return `
      <div style="padding:12px;font-size:12px;color:#e2e8f0;font-family:monospace">
        <div style="color:#f9a8d4;font-weight:700;font-size:14px;margin-bottom:10px">🍎 Apple Vision Pro Bridge V89</div>
        <div style="background:rgba(249,168,212,0.08);border:1px solid rgba(249,168,212,0.2);border-radius:8px;padding:10px;margin-bottom:8px">
          <div style="color:#f9a8d4;font-weight:700;margin-bottom:6px">📊 Trạng Thái</div>
          <div style="display:flex;justify-content:space-between;padding:3px 0"><span style="color:#64748b">Thiết Bị</span><span style="color:${s.detected?"#f9a8d4":"#64748b"}">${s.detected?"Vision Pro Detected":"Compat Mode"}</span></div>
          <div style="display:flex;justify-content:space-between;padding:3px 0"><span style="color:#64748b">Kết Nối</span><span style="color:${s.connected?"#34d399":"#ef4444"}">${s.connected?"✓ Online":"✗ Offline"}</span></div>
          <div style="display:flex;justify-content:space-between;padding:3px 0"><span style="color:#64748b">Render Scale</span><span>${s.renderScale}x</span></div>
        </div>
        <div style="background:rgba(167,139,250,0.06);border:1px solid rgba(167,139,250,0.15);border-radius:8px;padding:10px;margin-bottom:8px">
          <div style="color:#a78bfa;font-weight:700;margin-bottom:6px">👁 Eye Tracking</div>
          <div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#64748b">Kích Hoạt</span><span style="color:${s.eyeTracking?"#34d399":"#64748b"}">${s.eyeTracking?"Bật":"Tắt"}</span></div>
          <div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#64748b">Focus</span><span>${eyes.combined.focused?"Đang nhìn":"—"}</span></div>
        </div>
        <div style="background:rgba(52,211,153,0.06);border:1px solid rgba(52,211,153,0.15);border-radius:8px;padding:10px;margin-bottom:8px">
          <div style="color:#34d399;font-weight:700;margin-bottom:6px">🤚 Hand Gestures</div>
          <div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#64748b">Hand Tracking</span><span style="color:${s.handGesture?"#34d399":"#64748b"}">${s.handGesture?"Bật":"Tắt"}</span></div>
          <div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#64748b">Left</span><span>${VP.handState.left.gesture}</span></div>
          <div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#64748b">Right</span><span>${VP.handState.right.gesture}</span></div>
        </div>
        <div style="background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.15);border-radius:8px;padding:10px;margin-bottom:8px">
          <div style="color:#fbbf24;font-weight:700;margin-bottom:6px">🌍 Spatial Features</div>
          <div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#64748b">Spatial Audio</span><span style="color:${s.spatialAudio?"#34d399":"#64748b"}">${s.spatialAudio?"Bật":"Tắt"}</span></div>
          <div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#64748b">World Understanding</span><span style="color:${s.worldUnderstanding?"#34d399":"#64748b"}">${s.worldUnderstanding?"Bật":"Tắt"}</span></div>
          <div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#64748b">Spatial Anchors</span><span>${s.spatialAnchors}</span></div>
          <div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#64748b">Volumes</span><span>${s.windows}</span></div>
          <div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#64748b">Ornament Mode</span><span style="color:${s.ornament?"#fbbf24":"#64748b"}">${s.ornament?"Bật":"Tắt"}</span></div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button onclick="window.vpb89OpenVolume(window.world&&window.world.name)" style="padding:5px 10px;background:rgba(249,168,212,0.12);border:1px solid rgba(249,168,212,0.3);color:#f9a8d4;border-radius:5px;cursor:pointer;font-size:10px">📦 Open Volume</button>
          <button onclick="window.vpb89SetOrnament(!${s.ornament})" style="padding:5px 10px;background:rgba(167,139,250,0.12);border:1px solid rgba(167,139,250,0.3);color:#a78bfa;border-radius:5px;cursor:pointer;font-size:10px">🔮 Toggle Ornament</button>
          <button onclick="window.vpb89PlaySpatialAudio('divine',[0,1,-2])" style="padding:5px 10px;background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);color:#fbbf24;border-radius:5px;cursor:pointer;font-size:10px">🔊 Test Audio</button>
          <button onclick="window.vpb89CreateAnchor({x:0,y:0,z:-1},'God Anchor')" style="padding:5px 10px;background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.3);color:#34d399;border-radius:5px;cursor:pointer;font-size:10px">⚓ Add Anchor</button>
        </div>
        <div style="margin-top:10px;max-height:70px;overflow-y:auto;font-size:10px;color:#475569">
          ${VP.eventLog.slice(0,5).map(e=>`<div>[${e.t}] ${e.msg}</div>`).join("")}
        </div>
      </div>
    `;
  };

  function init() {
    load();
    detectVisionPro();
    console.log("[VisionProBridge V89] 🍎 Apple Vision Pro Bridge khởi động — Eye Tracking · Hand Gestures · Spatial Audio · Volumes sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 23900); });
  } else {
    setTimeout(init, 23900);
  }
})();
