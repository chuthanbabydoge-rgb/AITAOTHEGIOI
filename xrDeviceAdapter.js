(function () {
  "use strict";

  const VERSION = "V89";
  const SAVE_KEY = "cgv6_xr_device_adapter_v89";

  window.xrDeviceAdapterData = {
    version: VERSION,
    detectedDevice: "unknown",
    deviceCaps: {},
    sessionType: null,
    features: {
      handTracking: false,
      eyeTracking: false,
      passthrough: false,
      spatialAudio: false,
      haptics: false,
      roomScale: false,
      foveatedRendering: false,
    },
    sessions: [],
    lastDetected: null,
    adapterLog: [],
  };

  const D = window.xrDeviceAdapterData;

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(D)); } catch(e) {}
  }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        Object.assign(D, parsed);
      }
    } catch(e) {}
  }

  function log(msg) {
    const entry = { t: window.year || 0, msg, ts: Date.now() };
    D.adapterLog.unshift(entry);
    if (D.adapterLog.length > 50) D.adapterLog.pop();
    console.log("[XRDeviceAdapter V89]", msg);
  }

  // ─── Device Detection ───────────────────────────────────────
  async function detectDevice() {
    const ua = navigator.userAgent || "";
    const deviceHints = {
      isQuest: /OculusBrowser|Quest/.test(ua) || (navigator.xr && ua.includes("Android") && ua.includes("Mobile VR")),
      isVisionPro: /VisionOS|Vision Pro|visionOS/.test(ua) || window.__isVisionPro === true,
      isSteamVR: /SteamVR/.test(ua),
      isPicoXR: /Pico/.test(ua),
      isHoloLens: /HoloLens/.test(ua),
      isDesktopXR: !ua.includes("Quest") && !ua.includes("VisionOS"),
    };

    let device = "desktop_webxr";
    if (deviceHints.isQuest) device = "meta_quest";
    else if (deviceHints.isVisionPro) device = "apple_vision_pro";
    else if (deviceHints.isSteamVR) device = "steamvr";
    else if (deviceHints.isPicoXR) device = "pico_xr";
    else if (deviceHints.isHoloLens) device = "hololens";

    D.detectedDevice = device;
    D.lastDetected = Date.now();

    await detectXRCapabilities(device);
    log("Thiết bị phát hiện: " + device);
    save();
    return device;
  }

  async function detectXRCapabilities(device) {
    const caps = {
      webxrSupported: false,
      immersiveVR: false,
      immersiveAR: false,
      inlineSession: false,
      handTracking: false,
      eyeTracking: false,
      hitTest: false,
      anchors: false,
      depthSensing: false,
      lightEstimation: false,
      layersSupported: false,
      foveatedRendering: false,
    };

    if (navigator.xr) {
      caps.webxrSupported = true;
      try { caps.immersiveVR = await navigator.xr.isSessionSupported("immersive-vr"); } catch(e) {}
      try { caps.immersiveAR = await navigator.xr.isSessionSupported("immersive-ar"); } catch(e) {}
      try { caps.inlineSession = await navigator.xr.isSessionSupported("inline"); } catch(e) {}
    }

    // Device-specific capability overrides
    if (device === "meta_quest") {
      caps.handTracking = true;
      caps.foveatedRendering = true;
      caps.passthrough = true;
    } else if (device === "apple_vision_pro") {
      caps.eyeTracking = true;
      caps.spatialAudio = true;
      caps.handTracking = true;
      caps.lightEstimation = true;
      caps.depthSensing = true;
    } else if (device === "hololens") {
      caps.immersiveAR = true;
      caps.spatialAudio = true;
      caps.hitTest = true;
      caps.anchors = true;
    }

    D.deviceCaps = caps;
    D.features.handTracking = caps.handTracking;
    D.features.eyeTracking = caps.eyeTracking;
    D.features.foveatedRendering = caps.foveatedRendering;
    D.features.spatialAudio = device === "apple_vision_pro";
    D.features.passthrough = caps.passthrough || false;
    D.features.haptics = device === "meta_quest" || device === "steamvr";
    D.features.roomScale = caps.immersiveVR;
  }

  // ─── Session Manager ────────────────────────────────────────
  async function requestOptimalSession(preferredMode) {
    if (!navigator.xr) {
      log("WebXR không hỗ trợ trên thiết bị này");
      return null;
    }

    const device = D.detectedDevice;
    let mode = preferredMode || "immersive-vr";
    let requiredFeatures = ["local-floor"];
    let optionalFeatures = ["bounded-floor", "hand-tracking", "layers"];

    if (device === "apple_vision_pro") {
      mode = "immersive-ar";
      requiredFeatures = ["local-floor", "hand-tracking"];
      optionalFeatures = ["depth-sensing", "light-estimation", "camera-access"];
    } else if (device === "meta_quest") {
      mode = "immersive-vr";
      requiredFeatures = ["local-floor"];
      optionalFeatures = ["hand-tracking", "layers", "oculus-touch-v3", "bounded-floor"];
    } else if (device === "hololens") {
      mode = "immersive-ar";
      requiredFeatures = ["local-floor", "hit-test", "anchors"];
    }

    try {
      const sessionInit = { requiredFeatures, optionalFeatures };
      const session = await navigator.xr.requestSession(mode, sessionInit);
      D.sessionType = mode;
      D.sessions.push({ mode, device, ts: Date.now() });
      if (D.sessions.length > 20) D.sessions.shift();
      log("Phiên XR bắt đầu: " + mode + " / " + device);

      // Route to device bridge
      if (device === "meta_quest" && window.questBridgeOnSessionStart) {
        window.questBridgeOnSessionStart(session);
      } else if (device === "apple_vision_pro" && window.visionProBridgeOnSessionStart) {
        window.visionProBridgeOnSessionStart(session);
      }

      save();
      return session;
    } catch (err) {
      log("Lỗi phiên XR: " + err.message);
      return null;
    }
  }

  // ─── Render Quality Adapter ─────────────────────────────────
  function getOptimalRenderQuality() {
    const device = D.detectedDevice;
    if (device === "meta_quest") {
      return { pixelRatio: 1.2, antialias: false, foveatedRendering: true, dynamicResolution: true, targetFPS: 72 };
    } else if (device === "apple_vision_pro") {
      return { pixelRatio: 1.5, antialias: true, foveatedRendering: true, dynamicResolution: false, targetFPS: 90 };
    } else if (device === "steamvr") {
      return { pixelRatio: 1.4, antialias: true, foveatedRendering: false, dynamicResolution: true, targetFPS: 90 };
    }
    return { pixelRatio: 1.0, antialias: true, foveatedRendering: false, dynamicResolution: false, targetFPS: 60 };
  }

  // ─── Input Adapter ──────────────────────────────────────────
  function getInputProfile() {
    const device = D.detectedDevice;
    const profiles = {
      meta_quest: {
        primaryInput: "oculus-touch",
        secondaryInput: "hand-tracking",
        gestures: ["pinch", "grab", "point", "thumbsUp"],
        hapticChannels: 2,
        triggerAxis: 0,
        gripAxis: 1,
      },
      apple_vision_pro: {
        primaryInput: "hand-tracking",
        secondaryInput: "eye-tracking",
        gestures: ["pinch", "tap", "scroll", "zoom"],
        hapticChannels: 0,
        triggerAxis: -1,
        gripAxis: -1,
      },
      desktop_webxr: {
        primaryInput: "mouse",
        secondaryInput: "keyboard",
        gestures: ["click", "drag"],
        hapticChannels: 0,
        triggerAxis: -1,
        gripAxis: -1,
      },
    };
    return profiles[device] || profiles.desktop_webxr;
  }

  // ─── Public API ─────────────────────────────────────────────
  window.xrda89DetectDevice = detectDevice;
  window.xrda89RequestSession = requestOptimalSession;
  window.xrda89GetCaps = () => D.deviceCaps;
  window.xrda89GetDevice = () => D.detectedDevice;
  window.xrda89GetFeatures = () => D.features;
  window.xrda89GetRenderQuality = getOptimalRenderQuality;
  window.xrda89GetInputProfile = getInputProfile;
  window.xrda89GetLog = () => D.adapterLog;
  window.xrda89GetStats = () => ({
    device: D.detectedDevice,
    sessionType: D.sessionType,
    totalSessions: D.sessions.length,
    caps: D.deviceCaps,
    features: D.features,
    lastDetected: D.lastDetected,
  });

  window.xrda89RenderPanel = function () {
    const d = D;
    const qual = getOptimalRenderQuality();
    const input = getInputProfile();
    return `
      <div style="padding:12px;font-size:12px;color:#e2e8f0;font-family:monospace">
        <div style="color:#c084fc;font-weight:700;font-size:14px;margin-bottom:10px">📡 XR Device Adapter V89</div>
        <div style="background:rgba(192,132,252,0.08);border:1px solid rgba(192,132,252,0.2);border-radius:8px;padding:10px;margin-bottom:8px">
          <div style="color:#c084fc;font-weight:700;margin-bottom:6px">🎮 Thiết Bị Phát Hiện</div>
          <div style="display:flex;justify-content:space-between;padding:3px 0"><span style="color:#64748b">Device</span><span style="color:#f0abfc;font-weight:700">${d.detectedDevice.replace(/_/g," ").toUpperCase()}</span></div>
          <div style="display:flex;justify-content:space-between;padding:3px 0"><span style="color:#64748b">Session</span><span>${d.sessionType || "Chưa kết nối"}</span></div>
          <div style="display:flex;justify-content:space-between;padding:3px 0"><span style="color:#64748b">Tổng phiên</span><span>${d.sessions.length}</span></div>
        </div>
        <div style="background:rgba(52,211,153,0.06);border:1px solid rgba(52,211,153,0.15);border-radius:8px;padding:10px;margin-bottom:8px">
          <div style="color:#34d399;font-weight:700;margin-bottom:6px">⚡ Tính Năng</div>
          ${Object.entries(d.features).map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#64748b">${k}</span><span style="color:${v?"#34d399":"#ef4444"}">${v?"✓":"✗"}</span></div>`).join("")}
        </div>
        <div style="background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.15);border-radius:8px;padding:10px;margin-bottom:8px">
          <div style="color:#fbbf24;font-weight:700;margin-bottom:6px">🎨 Render Tối Ưu</div>
          ${Object.entries(qual).map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#64748b">${k}</span><span>${v.toString()}</span></div>`).join("")}
        </div>
        <div style="background:rgba(96,165,250,0.06);border:1px solid rgba(96,165,250,0.15);border-radius:8px;padding:10px">
          <div style="color:#60a5fa;font-weight:700;margin-bottom:6px">🕹️ Input Profile</div>
          <div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#64748b">Primary</span><span>${input.primaryInput}</span></div>
          <div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#64748b">Gestures</span><span>${input.gestures.join(", ")}</span></div>
          <div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#64748b">Haptic CH</span><span>${input.hapticChannels}</span></div>
        </div>
        <button onclick="window.xrda89DetectDevice()" style="margin-top:10px;padding:6px 14px;background:rgba(192,132,252,0.2);border:1px solid rgba(192,132,252,0.4);color:#c084fc;border-radius:6px;cursor:pointer;font-size:11px">🔍 Detect Device</button>
        <button onclick="window.xrda89RequestSession()" style="margin-top:10px;margin-left:6px;padding:6px 14px;background:rgba(52,211,153,0.15);border:1px solid rgba(52,211,153,0.4);color:#34d399;border-radius:6px;cursor:pointer;font-size:11px">▶ Enter XR</button>
      </div>
    `;
  };

  function init() {
    load();
    detectDevice().catch(() => {});
    console.log("[XRDeviceAdapter V89] 📡 Khởi động — Meta Quest · Vision Pro · WebXR Adapter sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 23700); });
  } else {
    setTimeout(init, 23700);
  }
})();
