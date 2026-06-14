(function () {
  "use strict";
  const SAVE_KEY = "cgv6_xr_engine_v69";

  window.xrEngineV69Data = {
    version: "V69",
    initialized: false,
    deviceProfile: null,
    sessionType: "none",
    capabilities: {
      webxr: false,
      immersiveVR: false,
      immersiveAR: false,
      handTracking: false,
      planeDetection: false,
      meshDetection: false,
      depthSensing: false,
      eyeTracking: false,
    },
    worldTableMode: {
      active: false,
      scale: 0.01,
      tableHeight: 0.8,
      tableRadius: 0.3,
      rotationY: 0,
      godHandActive: false,
    },
    session: null,
    frameCount: 0,
    lastFPS: 0,
    performanceGrade: "unknown",
    log: [],
  };

  const D = window.xrEngineV69Data;

  function save() {
    const slim = {
      version: D.version,
      deviceProfile: D.deviceProfile,
      capabilities: D.capabilities,
      log: D.log.slice(-20),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(slim));
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.deviceProfile) D.deviceProfile = parsed.deviceProfile;
        if (parsed.log) D.log = parsed.log;
      }
    } catch (e) {}
  }

  function addLog(msg) {
    D.log.push({ t: Date.now(), msg });
    if (D.log.length > 50) D.log = D.log.slice(-50);
  }

  async function detectCapabilities() {
    const caps = D.capabilities;

    if ("xr" in navigator) {
      caps.webxr = true;
      try {
        caps.immersiveVR = await navigator.xr.isSessionSupported("immersive-vr");
      } catch (e) { caps.immersiveVR = false; }
      try {
        caps.immersiveAR = await navigator.xr.isSessionSupported("immersive-ar");
      } catch (e) { caps.immersiveAR = false; }
    } else {
      caps.webxr = false;
    }

    caps.handTracking = !!(window.XRHand);
    caps.planeDetection = !!(window.XRPlane);
    caps.meshDetection = !!(window.XRMesh);

    detectDeviceProfile();
    addLog("Capabilities detected: VR=" + caps.immersiveVR + " AR=" + caps.immersiveAR);
    return caps;
  }

  function detectDeviceProfile() {
    const ua = navigator.userAgent || "";
    let profile = {
      id: "desktop",
      name: "Desktop Browser",
      icon: "🖥️",
      tier: "flat",
      handTracking: false,
      eyeTracking: false,
      foveatedRendering: false,
      recommendedScale: 1.0,
      recommendedFPS: 60,
      notes: "Canvas 2D holographic mode. Full spatial visualization.",
    };

    if (/OculusBrowser|Quest/.test(ua)) {
      profile = {
        id: "meta_quest",
        name: "Meta Quest",
        icon: "🥽",
        tier: "vr",
        handTracking: true,
        eyeTracking: false,
        foveatedRendering: true,
        recommendedScale: 0.8,
        recommendedFPS: 72,
        notes: "WebXR immersive-vr. Hand tracking via XRHand API. World Table Mode via passthrough.",
      };
      if (/Quest 3/.test(ua)) {
        profile.name = "Meta Quest 3";
        profile.handTracking = true;
        profile.foveatedRendering = true;
        profile.recommendedFPS = 90;
        profile.notes = "Full color passthrough AR+VR. Mixed Reality World Table optimal.";
      }
    } else if (/visionOS|Apple Vision/.test(ua) || /Safari/.test(ua) && /Version/.test(ua) && "xr" in navigator) {
      profile = {
        id: "apple_vision_pro",
        name: "Apple Vision Pro",
        icon: "🍎",
        tier: "mr",
        handTracking: true,
        eyeTracking: true,
        foveatedRendering: true,
        recommendedScale: 1.0,
        recommendedFPS: 90,
        notes: "visionOS WebXR. Eye+hand tracking. World Table on real surface via plane detection.",
      };
    } else if (/Android/.test(ua) && "xr" in navigator) {
      profile = {
        id: "ar_glasses",
        name: "AR Glasses (Android)",
        icon: "👓",
        tier: "ar",
        handTracking: false,
        eyeTracking: false,
        foveatedRendering: false,
        recommendedScale: 0.5,
        recommendedFPS: 60,
        notes: "WebXR immersive-ar. Plane detection for World Table placement.",
      };
    } else if (/Mobile|Android|iPhone/.test(ua)) {
      profile = {
        id: "mobile",
        name: "Mobile Browser",
        icon: "📱",
        tier: "flat",
        handTracking: false,
        eyeTracking: false,
        foveatedRendering: false,
        recommendedScale: 0.7,
        recommendedFPS: 60,
        notes: "Touch-optimized flat mode. God Hand via touch gestures.",
      };
    }

    D.deviceProfile = profile;
    addLog("Device profile: " + profile.name);
    return profile;
  }

  async function requestSession(type) {
    if (!("xr" in navigator)) {
      addLog("WebXR not available — falling back to flat mode");
      D.sessionType = "flat";
      return null;
    }
    try {
      const features = ["local-floor"];
      const optFeatures = [];
      if (type === "immersive-ar") optFeatures.push("plane-detection", "mesh-detection");
      if (D.deviceProfile && D.deviceProfile.handTracking) optFeatures.push("hand-tracking");

      const session = await navigator.xr.requestSession(type, {
        requiredFeatures: features,
        optionalFeatures: optFeatures,
      });
      D.session = session;
      D.sessionType = type;
      addLog("XR session started: " + type);

      session.addEventListener("end", () => {
        D.session = null;
        D.sessionType = "none";
        D.worldTableMode.active = false;
        addLog("XR session ended");
        if (typeof xr69OnSessionEnd === "function") xr69OnSessionEnd();
      });

      return session;
    } catch (err) {
      addLog("Session request failed: " + err.message);
      return null;
    }
  }

  function endSession() {
    if (D.session) {
      D.session.end().catch(() => {});
    }
  }

  function activateWorldTableMode(config) {
    const wt = D.worldTableMode;
    wt.active = true;
    if (config) {
      if (config.scale !== undefined) wt.scale = config.scale;
      if (config.tableHeight !== undefined) wt.tableHeight = config.tableHeight;
      if (config.tableRadius !== undefined) wt.tableRadius = config.tableRadius;
    }
    addLog("World Table Mode activated — scale:" + wt.scale + " height:" + wt.tableHeight);
    if (typeof xr69OnWorldTableActivate === "function") xr69OnWorldTableActivate(wt);
  }

  function deactivateWorldTableMode() {
    D.worldTableMode.active = false;
    addLog("World Table Mode deactivated");
  }

  function getReadinessReport() {
    const caps = D.capabilities;
    const profile = D.deviceProfile || { id: "unknown", name: "Unknown", tier: "flat" };
    const score = (caps.webxr ? 20 : 0) +
                  (caps.immersiveVR ? 25 : 0) +
                  (caps.immersiveAR ? 25 : 0) +
                  (caps.handTracking ? 15 : 0) +
                  (caps.planeDetection ? 10 : 0) +
                  (caps.eyeTracking ? 5 : 0);
    return {
      score,
      grade: score >= 80 ? "XR-READY" : score >= 50 ? "PARTIAL" : score >= 20 ? "FLAT-MODE" : "NOT-SUPPORTED",
      device: profile,
      caps,
      worldTableReady: caps.webxr && (caps.immersiveVR || caps.immersiveAR),
      godHandReady: caps.handTracking,
      spatialDataReady: !!(window.spatialWorldEngineData || window.swe67Data),
    };
  }

  function measurePerformance() {
    const start = performance.now();
    let count = 0;
    const loop = () => {
      count++;
      if (count < 60) requestAnimationFrame(loop);
      else {
        const elapsed = performance.now() - start;
        D.lastFPS = Math.round(60000 / elapsed);
        D.performanceGrade = D.lastFPS >= 72 ? "EXCELLENT" : D.lastFPS >= 60 ? "GOOD" : D.lastFPS >= 30 ? "MEDIUM" : "LOW";
        addLog("FPS benchmark: " + D.lastFPS + " — " + D.performanceGrade);
      }
    };
    requestAnimationFrame(loop);
  }

  window.xr69GetCapabilities = function () { return D.capabilities; };
  window.xr69GetDeviceProfile = function () { return D.deviceProfile; };
  window.xr69GetReadinessReport = function () { return getReadinessReport(); };
  window.xr69RequestSession = requestSession;
  window.xr69EndSession = endSession;
  window.xr69ActivateWorldTable = activateWorldTableMode;
  window.xr69DeactivateWorldTable = deactivateWorldTableMode;
  window.xr69GetLog = function () { return D.log.slice(); };
  window.xr69GetData = function () { return D; };
  window.xr69MeasurePerformance = measurePerformance;

  function init() {
    load();
    detectCapabilities().then(() => {
      D.initialized = true;
      save();
      addLog("xrEngine V69 initialized — device: " + (D.deviceProfile ? D.deviceProfile.name : "unknown"));
      console.log("[xrEngine V69] 🥽 XR Foundation Engine khởi động — device:", D.deviceProfile ? D.deviceProfile.name : "unknown");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 15600); });
  } else {
    setTimeout(init, 15600);
  }
})();
