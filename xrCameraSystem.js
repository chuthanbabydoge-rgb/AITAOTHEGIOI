(function () {
  "use strict";

  window.xrCameraV69Data = {
    version: "V69",
    initialized: false,
    mode: "orbit",
    position: { x: 0, y: 4, z: 8 },
    target: { x: 0, y: 0, z: 0 },
    orbit: { theta: 0, phi: Math.PI / 4, radius: 8 },
    worldTable: {
      eye: { x: 0, y: 0.5, z: 0 },
      lookAt: { x: 0, y: -0.2, z: 0 },
      fov: 60,
    },
    flythrough: {
      active: false,
      waypoints: [],
      currentWp: 0,
      speed: 0.02,
      t: 0,
    },
    godView: {
      active: false,
      height: 10,
      tiltAngle: 70,
    },
    animation: {
      smoothing: 0.08,
      currentTheta: 0,
      currentPhi: Math.PI / 4,
      currentRadius: 8,
      autoRotate: false,
      autoRotateSpeed: 0.003,
    },
    presets: {
      topDown: { phi: Math.PI / 2 - 0.05, radius: 10, theta: 0 },
      isometric: { phi: Math.PI / 4, radius: 8, theta: Math.PI / 4 },
      godView: { phi: Math.PI / 3, radius: 12, theta: 0 },
      groundLevel: { phi: 0.2, radius: 6, theta: 0 },
      closeUp: { phi: Math.PI / 5, radius: 3, theta: 0 },
    },
    xrRig: null,
    log: [],
  };

  const D = window.xrCameraV69Data;

  function addLog(msg) {
    D.log.push({ t: Date.now(), msg });
    if (D.log.length > 30) D.log = D.log.slice(-30);
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function setupOrbitCamera(camera) {
    if (!camera) return;
    const anim = D.animation;
    anim.currentTheta = D.orbit.theta;
    anim.currentPhi = D.orbit.phi;
    anim.currentRadius = D.orbit.radius;
    applyOrbit(camera);
    addLog("Orbit camera setup complete");
  }

  function applyOrbit(camera) {
    if (!camera) return;
    const r = D.orbit.radius;
    const t = D.orbit.theta;
    const p = Math.max(0.05, Math.min(Math.PI / 2 - 0.05, D.orbit.phi));
    camera.position.x = r * Math.sin(t) * Math.cos(p);
    camera.position.y = r * Math.sin(p);
    camera.position.z = r * Math.cos(t) * Math.cos(p);
    camera.lookAt(D.target.x, D.target.y, D.target.z);
  }

  function applyOrbitSmooth(camera) {
    if (!camera) return;
    const anim = D.animation;
    const s = anim.smoothing;

    if (anim.autoRotate) {
      D.orbit.theta += anim.autoRotateSpeed;
    }

    anim.currentTheta = lerp(anim.currentTheta, D.orbit.theta, s * 2);
    anim.currentPhi = lerp(anim.currentPhi, D.orbit.phi, s * 2);
    anim.currentRadius = lerp(anim.currentRadius, D.orbit.radius, s);

    const r = anim.currentRadius;
    const t = anim.currentTheta;
    const p = Math.max(0.05, Math.min(Math.PI / 2 - 0.05, anim.currentPhi));

    camera.position.x = r * Math.sin(t) * Math.cos(p);
    camera.position.y = r * Math.sin(p);
    camera.position.z = r * Math.cos(t) * Math.cos(p);
    camera.lookAt(D.target.x, D.target.y, D.target.z);
  }

  function setPreset(name, camera) {
    const preset = D.presets[name];
    if (!preset) return false;
    if (preset.phi !== undefined) D.orbit.phi = preset.phi;
    if (preset.theta !== undefined) D.orbit.theta = preset.theta;
    if (preset.radius !== undefined) D.orbit.radius = preset.radius;
    if (camera) applyOrbit(camera);
    D.mode = name;
    addLog("Camera preset: " + name);
    return true;
  }

  function setupWorldTableCamera(camera) {
    if (!camera) return;
    D.mode = "worldTable";
    const wt = D.worldTable;
    camera.position.set(wt.eye.x, wt.eye.y, wt.eye.z);
    camera.lookAt(wt.lookAt.x, wt.lookAt.y, wt.lookAt.z);
    if (camera.fov !== undefined) {
      camera.fov = wt.fov;
      camera.updateProjectionMatrix && camera.updateProjectionMatrix();
    }
    addLog("World Table camera configured — eye at y=" + wt.eye.y);
  }

  function setupXRRig(scene, THREE) {
    if (!scene || !THREE) return null;
    const rig = new THREE.Group();
    rig.name = "XRCameraRig";
    scene.add(rig);
    D.xrRig = rig;

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(3, 32),
      new THREE.MeshBasicMaterial({ color: 0x0a0a1a, transparent: true, opacity: 0.5 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    rig.add(floor);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3, 0.02, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.3 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0;
    rig.add(ring);

    addLog("XR camera rig created");
    return rig;
  }

  function startFlythrough(waypoints, camera) {
    if (!waypoints || waypoints.length < 2) return false;
    D.flythrough.waypoints = waypoints;
    D.flythrough.currentWp = 0;
    D.flythrough.t = 0;
    D.flythrough.active = true;
    D.mode = "flythrough";
    addLog("Flythrough started — " + waypoints.length + " waypoints");
    return true;
  }

  function updateFlythrough(camera) {
    if (!D.flythrough.active || !camera) return;
    const wps = D.flythrough.waypoints;
    const i = D.flythrough.currentWp;
    if (i >= wps.length - 1) {
      D.flythrough.active = false;
      D.mode = "orbit";
      addLog("Flythrough complete");
      return;
    }
    const from = wps[i];
    const to = wps[i + 1];
    D.flythrough.t += D.flythrough.speed;
    if (D.flythrough.t >= 1) {
      D.flythrough.t = 0;
      D.flythrough.currentWp++;
    }
    const tt = D.flythrough.t;
    camera.position.x = lerp(from.x, to.x, tt);
    camera.position.y = lerp(from.y, to.y, tt);
    camera.position.z = lerp(from.z, to.z, tt);
    camera.lookAt(D.target.x, D.target.y, D.target.z);
  }

  function buildWorldFlythrough() {
    const countries = window.countries || [];
    const waypoints = [{ x: 0, y: 8, z: 0 }];
    const count = Math.min(countries.length, 6);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      waypoints.push({
        x: Math.cos(angle) * 5,
        y: 3 + Math.random() * 2,
        z: Math.sin(angle) * 5,
      });
    }
    waypoints.push({ x: 0, y: 8, z: 0 });
    return waypoints;
  }

  function enableGodView(camera) {
    D.godView.active = true;
    D.orbit.phi = (D.godView.tiltAngle * Math.PI) / 180;
    D.orbit.radius = D.godView.height;
    if (camera) applyOrbit(camera);
    addLog("God View enabled — height:" + D.godView.height);
  }

  function disableGodView(camera) {
    D.godView.active = false;
    setPreset("isometric", camera);
    addLog("God View disabled");
  }

  function handleResize(camera, renderer) {
    if (!camera || !renderer) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (camera.aspect !== undefined) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix && camera.updateProjectionMatrix();
    }
    renderer.setSize && renderer.setSize(w, h);
  }

  function getStatusHTML() {
    const anim = D.animation;
    return "<div style='font-size:11px;color:#64748b'>" +
      "<div>Mode: <span style='color:#c084fc'>" + D.mode + "</span></div>" +
      "<div>θ: " + D.orbit.theta.toFixed(2) + " φ: " + D.orbit.phi.toFixed(2) + " r: " + D.orbit.radius.toFixed(1) + "</div>" +
      "<div>Auto-rotate: <span style='color:" + (anim.autoRotate ? "#4ade80" : "#ef4444") + "'>" + (anim.autoRotate ? "ON" : "OFF") + "</span></div>" +
      "<div>God View: <span style='color:" + (D.godView.active ? "#f59e0b" : "#64748b") + "'>" + (D.godView.active ? "ACTIVE" : "OFF") + "</span></div>" +
    "</div>";
  }

  window.xrCameraV69Data = D;
  window.xr69SetupOrbitCamera = setupOrbitCamera;
  window.xr69ApplyOrbitSmooth = applyOrbitSmooth;
  window.xr69SetCameraPreset = setPreset;
  window.xr69SetupWorldTableCamera = setupWorldTableCamera;
  window.xr69SetupXRRig = setupXRRig;
  window.xr69StartFlythrough = startFlythrough;
  window.xr69UpdateFlythrough = updateFlythrough;
  window.xr69BuildWorldFlythrough = buildWorldFlythrough;
  window.xr69EnableGodView = enableGodView;
  window.xr69DisableGodView = disableGodView;
  window.xr69HandleResize = handleResize;
  window.xr69CameraStatusHTML = getStatusHTML;
  window.xr69SetOrbit = function (t, p, r) {
    if (t !== undefined) D.orbit.theta = t;
    if (p !== undefined) D.orbit.phi = p;
    if (r !== undefined) D.orbit.radius = r;
  };
  window.xr69ToggleAutoRotate = function () {
    D.animation.autoRotate = !D.animation.autoRotate;
    addLog("Auto-rotate: " + D.animation.autoRotate);
    return D.animation.autoRotate;
  };
  window.xr69GetCameraLog = function () { return D.log.slice(); };

  function init() {
    D.initialized = true;
    addLog("xrCameraSystem V69 initialized");
    console.log("[xrCameraSystem V69] 📷 XR Camera System sẵn sàng — Orbit/WorldTable/GodView/Flythrough.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 15900); });
  } else {
    setTimeout(init, 15900);
  }
})();
