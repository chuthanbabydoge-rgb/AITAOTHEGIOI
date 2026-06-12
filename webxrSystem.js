/* ============================================================
   WEBXR SYSTEM — webxrSystem.js
   Creator God — Spatial Computing Mode
   
   ✅ Quest 3 (WebXR Device API + WebGL2)
   ✅ Vision Pro (Immersive Web / WebXR + polyfill-ready)
   ✅ Desktop fallback (OrbitControls emulation via pointer)
   
   Architecture:
   - Hoàn toàn độc lập, không sửa bất kỳ file hiện có nào.
   - Đọc trực tiếp: window.world, window.npcs, window.sects,
     window.regions, window.REALMS, window.heavenPoints
   - Three.js r128 (đã được load bởi worldViewer3D.js)
   - XRSession: immersive-vr với fallback inline/flat
   ============================================================ */

(function () {
  'use strict';

  // ─── Constants ────────────────────────────────────────────
  const XR_VERSION = '1.0.0';
  const SCALE      = 0.05;          // world-units → XR metres
  const FLOOR_Y    = 0;
  const SKY_COLOR  = 0x05050f;

  const REALM_COLORS = [
    0x94a3b8, // 0 Luyện Khí — grey
    0x86efac, // 1 Trúc Cơ — green
    0xfde68a, // 2 Kim Đan — amber
    0x7dd3fc, // 3 Nguyên Anh — sky
    0xc4b5fd, // 4 Hóa Thần — violet
    0xf9a8d4, // 5 Luyện Hư — pink
    0xfca5a5, // 6 Hợp Thể — red
    0xfdba74, // 7 Đại Thừa — orange
    0xfef08a, // 8+ Chân Tiên — gold
  ];

  const REGION_PALETTE = {
    '🗻 Đông Vực' : 0x4ade80,
    '🌋 Tây Hoang' : 0xf97316,
    '🌊 Nam Hải'  : 0x38bdf8,
    '❄️ Bắc Nguyên': 0xa5f3fc,
    '🌀 Trung Châu': 0xc084fc,
  };

  // ─── Module state ─────────────────────────────────────────
  const xrState = {
    session    : null,
    renderer   : null,
    scene      : null,
    camera     : null,
    refSpace   : null,
    animId     : null,
    overlay    : null,
    clock      : null,
    objects    : [],          // { mesh, data, label }
    raycaster  : null,
    controller0: null,
    controller1: null,
    hovered    : null,
    infoEl     : null,
    mode       : 'flat',      // 'flat' | 'immersive-vr' | 'immersive-ar'
    // pointer for desktop fallback
    pointer    : { x: 0, y: 0, dragging: false, lastX: 0, lastY: 0 },
    camTheta   : 0, camPhi: Math.PI / 4, camRadius: 8,
    initialized: false,
  };

  // ─── CSS injection ────────────────────────────────────────
  function injectCSS() {
    if (document.getElementById('xr-system-css')) return;
    const s = document.createElement('style');
    s.id = 'xr-system-css';
    s.textContent = `
      /* XR Entry Button */
      #xr-enter-btn {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 9px 18px;
        background: linear-gradient(135deg,rgba(192,132,252,0.18),rgba(56,189,248,0.10));
        border: 1px solid rgba(192,132,252,0.5);
        border-radius: 8px; color: #c084fc;
        font-family: var(--font-cjk,serif); font-size: 13px;
        font-weight: 700; letter-spacing: 0.5px; cursor: pointer;
        transition: all 0.2s; white-space: nowrap; position: relative;
        overflow: hidden;
      }
      #xr-enter-btn::before {
        content:''; position:absolute; inset:0;
        background: radial-gradient(ellipse at 50% 0%,rgba(192,132,252,0.15),transparent 70%);
        pointer-events:none;
      }
      #xr-enter-btn:hover {
        border-color: rgba(192,132,252,0.9);
        box-shadow: 0 0 24px rgba(192,132,252,0.35), 0 0 48px rgba(192,132,252,0.12);
        color: #e9d5ff;
      }
      #xr-enter-btn .xr-pulse {
        width:8px; height:8px; border-radius:50%;
        background:#c084fc;
        box-shadow: 0 0 8px #c084fc;
        animation: xrPulse 2s ease-in-out infinite;
        flex-shrink:0;
      }
      @keyframes xrPulse {
        0%,100%{opacity:1;transform:scale(1)}
        50%{opacity:0.4;transform:scale(0.7)}
      }

      /* XR Overlay (full screen) */
      #xr-overlay {
        display: none; position: fixed;
        inset: 0; z-index: 100000;
        background: #030308;
        flex-direction: column;
        font-family: var(--font-cjk,serif);
        overflow: hidden;
      }
      #xr-overlay.xr-active { display: flex; }

      /* XR Toolbar */
      #xr-toolbar {
        display: flex; align-items: center; gap: 10px;
        padding: 10px 16px; flex-shrink: 0;
        background: rgba(5,5,20,0.95);
        border-bottom: 1px solid rgba(192,132,252,0.2);
        flex-wrap: wrap;
        /* stay on top even inside overlay */
        position: relative; z-index: 10;
      }
      #xr-toolbar .xr-title {
        font-size: 14px; font-weight: 700; color: #c084fc;
        text-shadow: 0 0 14px rgba(192,132,252,0.5);
        letter-spacing: 1.5px; flex-shrink:0;
      }
      #xr-toolbar .xr-badge {
        font-size: 10px; padding: 2px 8px; border-radius: 20px;
        border: 1px solid; letter-spacing: 0.5px; flex-shrink:0;
      }
      .xr-badge-vr { border-color:rgba(192,132,252,0.4); color:#c084fc; background:rgba(192,132,252,0.08); }
      .xr-badge-ar { border-color:rgba(56,189,248,0.4); color:#38bdf8; background:rgba(56,189,248,0.08); }
      .xr-badge-flat { border-color:rgba(250,204,21,0.4); color:#facc15; background:rgba(250,204,21,0.08); }
      #xr-toolbar .xr-stat { font-size: 11px; color: #64748b; flex-shrink:0; }
      .xr-view-btn {
        padding: 5px 12px; border-radius: 6px; font-size: 11px; cursor:pointer;
        border: 1px solid rgba(255,255,255,0.12); color: #94a3b8;
        background: rgba(255,255,255,0.04); transition: all 0.2s; white-space:nowrap;
      }
      .xr-view-btn:hover { border-color:rgba(192,132,252,0.5); color:#c084fc; }
      .xr-view-btn.active { border-color:rgba(192,132,252,0.7); color:#c084fc; background:rgba(192,132,252,0.12); }
      #xr-close-btn {
        margin-left: auto; padding: 5px 14px; border-radius: 6px; cursor:pointer;
        border: 1px solid rgba(248,113,113,0.35); color: #f87171;
        background: rgba(248,113,113,0.08); font-size: 12px;
        transition: all 0.2s; white-space:nowrap;
      }
      #xr-close-btn:hover { background:rgba(248,113,113,0.18); box-shadow:0 0 12px rgba(248,113,113,0.2); }

      /* Canvas */
      #xr-canvas { flex:1; min-height:0; display:block; width:100%; }

      /* Info panel overlay */
      #xr-info-panel {
        position:absolute; bottom:20px; right:20px;
        width:260px; max-height:60%;
        background: rgba(5,5,20,0.93);
        border: 1px solid rgba(192,132,252,0.3);
        border-radius: 14px; padding: 14px;
        display: none; z-index: 20;
        backdrop-filter: blur(12px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(192,132,252,0.08);
        overflow-y: auto; color: #e2e8f0; font-size:12px;
        transition: opacity 0.2s;
      }
      #xr-info-panel.visible { display: block; }
      .xr-info-title { font-size:14px; color:#c084fc; font-weight:700; margin-bottom:10px;
        text-shadow:0 0 12px rgba(192,132,252,0.4); letter-spacing:0.5px; }
      .xr-info-row { display:flex; justify-content:space-between; padding:4px 0;
        border-bottom:1px solid rgba(255,255,255,0.05); }
      .xr-info-label { color:#64748b; }
      .xr-info-val   { color:#e2e8f0; font-weight:600; }

      /* Legend */
      #xr-legend {
        position:absolute; bottom:20px; left:20px; z-index:20;
        background: rgba(5,5,20,0.88); border:1px solid rgba(255,255,255,0.08);
        border-radius:10px; padding:10px 14px; font-size:10px; color:#64748b;
        backdrop-filter:blur(8px); min-width:140px;
      }
      #xr-legend .xr-leg-title { color:#94a3b8; font-size:11px; margin-bottom:6px; letter-spacing:1px; }
      .xr-leg-row { display:flex; align-items:center; gap:8px; margin-bottom:4px; }
      .xr-leg-dot { width:10px;height:10px;border-radius:50%;flex-shrink:0; }

      /* VR start screen */
      #xr-vr-prompt {
        position:absolute; inset:0; z-index:30;
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        background:rgba(3,3,8,0.97); gap:16px;
        backdrop-filter:blur(4px);
      }
      #xr-vr-prompt.hidden { display:none; }
      .xr-prompt-icon { font-size:56px; animation: xrFloat 3s ease-in-out infinite; }
      @keyframes xrFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      .xr-prompt-title { font-size:22px; color:#c084fc; font-weight:700; letter-spacing:2px;
        text-shadow:0 0 24px rgba(192,132,252,0.6); }
      .xr-prompt-sub   { font-size:13px; color:#64748b; letter-spacing:0.5px; }
      .xr-prompt-badges { display:flex; gap:10px; }
      .xr-start-vr-btn {
        padding:12px 32px; border-radius:10px; font-size:14px; cursor:pointer; font-weight:700;
        border:1px solid rgba(192,132,252,0.6); color:#c084fc;
        background:rgba(192,132,252,0.12); letter-spacing:1px;
        transition:all 0.2s; font-family:var(--font-cjk,serif);
      }
      .xr-start-vr-btn:hover {
        background:rgba(192,132,252,0.22);
        box-shadow:0 0 28px rgba(192,132,252,0.4), 0 0 60px rgba(192,132,252,0.15);
      }
      .xr-start-vr-btn.unavailable { opacity:0.4; cursor:not-allowed; }
      .xr-hint { font-size:11px; color:#334155; letter-spacing:0.5px; text-align:center; }

      /* Controls hint bar */
      #xr-controls-hint {
        position:absolute; top:60px; left:50%; transform:translateX(-50%);
        z-index:20; display:flex; gap:16px; pointer-events:none;
        font-size:10px; color:#334155; letter-spacing:0.5px;
        white-space:nowrap;
      }
    `;
    document.head.appendChild(s);
  }

  // ─── Build Overlay DOM ────────────────────────────────────
  function buildOverlay() {
    if (document.getElementById('xr-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'xr-overlay';
    overlay.innerHTML = `
      <div id="xr-toolbar">
        <span class="xr-title">🔮 SPATIAL WORLD VIEWER</span>
        <span class="xr-badge xr-badge-flat" id="xr-mode-badge">FLAT</span>
        <span class="xr-stat" id="xr-stat-terr"></span>
        <span class="xr-stat" id="xr-stat-npc"></span>
        <button class="xr-view-btn active" id="xr-view-world"   onclick="XRSystem.setView('world')">🌍 Thế Giới</button>
        <button class="xr-view-btn"        id="xr-view-terr"    onclick="XRSystem.setView('territory')">🏔 Lãnh Địa</button>
        <button class="xr-view-btn"        id="xr-view-npc"     onclick="XRSystem.setView('npc')">👤 Tu Sĩ</button>
        <button class="xr-close-btn" id="xr-close-btn" onclick="XRSystem.exit()">✕ Thoát XR</button>
      </div>
      <canvas id="xr-canvas"></canvas>
      <div id="xr-controls-hint">
        <span>🖱️ Kéo: Xoay</span>
        <span>Scroll: Zoom</span>
        <span>Click: Chi tiết</span>
      </div>
      <div id="xr-info-panel"></div>
      <div id="xr-legend"></div>
      <div id="xr-vr-prompt">
        <div class="xr-prompt-icon">🥽</div>
        <div class="xr-prompt-title">SPATIAL WORLD VIEWER</div>
        <div class="xr-prompt-sub">Creator God — XR Edition</div>
        <div class="xr-prompt-badges">
          <span class="xr-badge xr-badge-vr">Meta Quest 3</span>
          <span class="xr-badge xr-badge-ar">Vision Pro</span>
        </div>
        <button class="xr-start-vr-btn" id="xr-launch-vr"
          onclick="XRSystem.launchVR()">🔮 Enter Immersive VR</button>
        <div class="xr-hint">Hoặc xem chế độ Flat 3D ngay bên dưới</div>
        <button class="xr-view-btn" style="margin-top:4px"
          onclick="XRSystem.enterFlat()">Tiếp tục Flat Mode →</button>
      </div>
    `;
    document.body.appendChild(overlay);
    xrState.overlay  = overlay;
    xrState.infoEl   = document.getElementById('xr-info-panel');
  }

  // ─── Three.js scene helpers ───────────────────────────────
  function ensureThree() {
    return typeof THREE !== 'undefined';
  }

  function buildScene() {
    const THREE = window.THREE;
    const canvas = document.getElementById('xr-canvas');

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth || window.innerWidth,
                     canvas.clientHeight || window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping    = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    // Enable XR
    renderer.xr.enabled = true;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(SKY_COLOR);
    scene.fog = new THREE.FogExp2(SKY_COLOR, 0.018);

    // Camera
    const w = canvas.clientWidth  || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(65, w / h, 0.01, 500);
    camera.position.set(0, 4, 8);
    camera.lookAt(0, 0, 0);

    // Ambient + directional light
    const ambient = new THREE.AmbientLight(0x2a1f4a, 1.2);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffeedd, 1.4);
    sun.position.set(10, 20, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);

    // Purple rim light
    const rim = new THREE.DirectionalLight(0xc084fc, 0.6);
    rim.position.set(-10, 5, -10);
    scene.add(rim);

    // Particle starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1200;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPos[i] = (Math.random() - 0.5) * 200;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.6 });
    scene.add(new THREE.Points(starGeo, starMat));

    // Floor grid
    const grid = new THREE.GridHelper(40, 40, 0x1a1240, 0x0d0a1e);
    grid.position.y = -0.02;
    scene.add(grid);

    // XR controllers (Quest 3 hand tracking / controllers)
    const ctrl0 = renderer.xr.getController(0);
    const ctrl1 = renderer.xr.getController(1);
    scene.add(ctrl0); scene.add(ctrl1);

    // Controller ray visualizer
    [ctrl0, ctrl1].forEach(ctrl => {
      const rayGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -2)
      ]);
      const rayMat = new THREE.LineBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.4 });
      ctrl.add(new THREE.Line(rayGeo, rayMat));
    });

    xrState.renderer   = renderer;
    xrState.scene      = scene;
    xrState.camera     = camera;
    xrState.controller0 = ctrl0;
    xrState.controller1 = ctrl1;
    xrState.raycaster  = new THREE.Raycaster();
    xrState.clock      = new THREE.Clock();

    // Pointer events (desktop flat mode)
    setupPointerControls(canvas, camera);

    // Resize
    window.addEventListener('resize', onXRResize);

    return { renderer, scene, camera };
  }

  function onXRResize() {
    if (!xrState.renderer || !xrState.camera) return;
    const canvas = document.getElementById('xr-canvas');
    if (!canvas) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    xrState.camera.aspect = w / h;
    xrState.camera.updateProjectionMatrix();
    xrState.renderer.setSize(w, h);
  }

  // ─── Pointer orbit (desktop fallback) ────────────────────
  function setupPointerControls(canvas, camera) {
    const p = xrState.pointer;

    canvas.addEventListener('mousedown', e => {
      p.dragging = true; p.lastX = e.clientX; p.lastY = e.clientY;
    });
    window.addEventListener('mouseup', () => { p.dragging = false; });
    window.addEventListener('mousemove', e => {
      if (!p.dragging) return;
      const dx = e.clientX - p.lastX;
      const dy = e.clientY - p.lastY;
      p.lastX = e.clientX; p.lastY = e.clientY;
      xrState.camTheta -= dx * 0.005;
      xrState.camPhi    = Math.max(0.15, Math.min(Math.PI / 2.1, xrState.camPhi + dy * 0.005));
      updateCameraOrbit(camera);
    });
    canvas.addEventListener('wheel', e => {
      xrState.camRadius = Math.max(2, Math.min(30, xrState.camRadius + e.deltaY * 0.02));
      updateCameraOrbit(camera);
      e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('click', e => {
      if (!xrState.scene) return;
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      const ny = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      pickObject(new THREE.Vector2(nx, ny));
    });
    // Touch support (Vision Pro / mobile)
    let touchStart = null;
    canvas.addEventListener('touchstart', e => {
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY,
                     r: xrState.camRadius };
      p.dragging = true; p.lastX = touchStart.x; p.lastY = touchStart.y;
    }, { passive: true });
    canvas.addEventListener('touchmove', e => {
      if (!p.dragging) return;
      const dx = e.touches[0].clientX - p.lastX;
      const dy = e.touches[0].clientY - p.lastY;
      p.lastX = e.touches[0].clientX; p.lastY = e.touches[0].clientY;
      xrState.camTheta -= dx * 0.006;
      xrState.camPhi    = Math.max(0.15, Math.min(Math.PI / 2.1, xrState.camPhi + dy * 0.006));
      updateCameraOrbit(camera);
      e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('touchend', () => { p.dragging = false; }, { passive: true });
  }

  function updateCameraOrbit(camera) {
    const r = xrState.camRadius;
    const t = xrState.camTheta;
    const p = xrState.camPhi;
    camera.position.set(
      r * Math.sin(t) * Math.cos(p),
      r * Math.sin(p),
      r * Math.cos(t) * Math.cos(p)
    );
    camera.lookAt(0, 0, 0);
  }

  // ─── Object picking ───────────────────────────────────────
  function pickObject(ndc) {
    const ray = xrState.raycaster;
    const cam = xrState.camera;
    const meshes = xrState.objects.map(o => o.mesh).filter(Boolean);
    ray.setFromCamera(ndc, cam);
    const hits = ray.intersectObjects(meshes, true);
    if (!hits.length) { hideInfo(); return; }
    const hitMesh = hits[0].object;
    const obj = xrState.objects.find(o => o.mesh === hitMesh || (hitMesh.parent && o.mesh === hitMesh.parent));
    if (obj) showInfo(obj.data, obj.type);
  }

  // ─── Info panel ───────────────────────────────────────────
  function showInfo(data, type) {
    const el = xrState.infoEl;
    if (!el) return;
    let html = '';
    if (type === 'territory') {
      html = `
        <div class="xr-info-title">🏔 ${data.name}</div>
        <div class="xr-info-row"><span class="xr-info-label">Vùng</span><span class="xr-info-val">${data.region||'—'}</span></div>
        <div class="xr-info-row"><span class="xr-info-label">Dân số</span><span class="xr-info-val">${(data.population||0).toLocaleString()}</span></div>
        <div class="xr-info-row"><span class="xr-info-label">Nguy hiểm</span><span class="xr-info-val">${data.dangerLevel||1}/5</span></div>
        <div class="xr-info-row"><span class="xr-info-label">Linh Khí</span><span class="xr-info-val">${data.spiritualEnergy||0}</span></div>
        <div class="xr-info-row"><span class="xr-info-label">Khoáng sản</span><span class="xr-info-val">${data.minerals||0}</span></div>
        <div class="xr-info-row"><span class="xr-info-label">Boss</span><span class="xr-info-val">${data.bossPresent?'🐉 Có':'—'}</span></div>`;
    } else if (type === 'npc') {
      const REALMS_arr = window.REALMS || [];
      const realmName  = REALMS_arr[data.realm] ? REALMS_arr[data.realm].name : `Cảnh ${data.realm}`;
      const sects_arr  = window.sects || [];
      const sect       = sects_arr.find(s => s.id === data.sectId);
      html = `
        <div class="xr-info-title">${data.isTianJiao ? '⭐' : '👤'} ${data.name}</div>
        <div class="xr-info-row"><span class="xr-info-label">Cảnh giới</span><span class="xr-info-val">${realmName}</span></div>
        <div class="xr-info-row"><span class="xr-info-label">Linh căn</span><span class="xr-info-val">${data.root||'—'}</span></div>
        <div class="xr-info-row"><span class="xr-info-label">Tông môn</span><span class="xr-info-val">${sect?sect.name:'Độc Tu'}</span></div>
        <div class="xr-info-row"><span class="xr-info-label">Vùng</span><span class="xr-info-val">${data.region||'—'}</span></div>
        <div class="xr-info-row"><span class="xr-info-label">Công kích</span><span class="xr-info-val">⚔️ ${data.attack||0}</span></div>
        <div class="xr-info-row"><span class="xr-info-label">Phòng thủ</span><span class="xr-info-val">🛡 ${data.defense||0}</span></div>
        <div class="xr-info-row"><span class="xr-info-label">Tuổi</span><span class="xr-info-val">${data.age||0}</span></div>`;
    } else if (type === 'region') {
      const count = (window.npcs||[]).filter(n => n.region === data.name && n.status === 'alive').length;
      html = `
        <div class="xr-info-title">🌐 ${data.name}</div>
        <div class="xr-info-row"><span class="xr-info-label">Tu sĩ</span><span class="xr-info-val">${count}</span></div>
        <div class="xr-info-row"><span class="xr-info-label">Nguy hiểm</span><span class="xr-info-val">${data.danger||0}/10</span></div>`;
    }
    el.innerHTML = html;
    el.classList.add('visible');
  }
  function hideInfo() {
    xrState.infoEl && xrState.infoEl.classList.remove('visible');
  }

  // ─── Legend ───────────────────────────────────────────────
  function updateLegend(type) {
    const el = document.getElementById('xr-legend');
    if (!el) return;
    if (type === 'npc') {
      const REALMS_arr = window.REALMS || [];
      el.innerHTML = `<div class="xr-leg-title">CẢNH GIỚI</div>` +
        REALMS_arr.slice(0, 9).map((r, i) => {
          const c = '#' + (REALM_COLORS[i] || 0x888888).toString(16).padStart(6,'0');
          return `<div class="xr-leg-row"><span class="xr-leg-dot" style="background:${c};box-shadow:0 0 5px ${c}"></span>${r.name}</div>`;
        }).join('');
    } else {
      el.innerHTML = `<div class="xr-leg-title">VÙNG</div>` +
        Object.entries(REGION_PALETTE).map(([name, col]) => {
          const c = '#' + col.toString(16).padStart(6,'0');
          return `<div class="xr-leg-row"><span class="xr-leg-dot" style="background:${c};box-shadow:0 0 5px ${c}"></span>${name}</div>`;
        }).join('');
    }
  }

  // ─── View builders ────────────────────────────────────────
  function clearObjects() {
    const THREE = window.THREE;
    xrState.objects.forEach(o => {
      if (o.mesh && xrState.scene) {
        xrState.scene.remove(o.mesh);
        o.mesh.geometry && o.mesh.geometry.dispose();
      }
    });
    xrState.objects = [];
    hideInfo();
  }

  /* VIEW: World overview — shows regions as large glowing spheres
     with territory pillars and NPC particle clouds around them */
  function buildWorldView() {
    const THREE = window.THREE;
    clearObjects();
    updateLegend('world');

    const territories = (window.world && window.world.territories) ? window.world.territories : [];
    const npcs_arr    = (window.npcs || []).filter(n => n.status === 'alive');
    const regions_arr = window.regions || [];

    // Region anchor spheres
    const regionPositions = {};
    const regionNames = [...new Set(territories.map(t => t.region))];
    const rCount = regionNames.length || 1;

    regionNames.forEach((rName, i) => {
      const angle = (i / rCount) * Math.PI * 2;
      const r = 5;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      regionPositions[rName] = { x, z };

      const baseColor = REGION_PALETTE[rName] || 0x888888;
      const geo  = new THREE.SphereGeometry(0.6, 24, 16);
      const mat  = new THREE.MeshStandardMaterial({
        color: baseColor, emissive: baseColor, emissiveIntensity: 0.3,
        metalness: 0.3, roughness: 0.4, transparent: true, opacity: 0.85,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, 1, z);
      mesh.castShadow = true;

      // Glow ring
      const ringGeo = new THREE.TorusGeometry(0.75, 0.04, 8, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: baseColor, transparent: true, opacity: 0.5 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      mesh.add(ring);

      // Label sprite
      addTextSprite(rName.replace(/^[^\s]+\s/, ''), x, 2, z, baseColor);

      xrState.scene.add(mesh);
      const regData = regions_arr.find(r => r.name === rName) || { name: rName, danger: 0 };
      xrState.objects.push({ mesh, data: regData, type: 'region' });
    });

    // Territory pillars
    territories.forEach((t, i) => {
      const base  = regionPositions[t.region] || { x: 0, z: 0 };
      const angle = (i / Math.max(territories.length, 1)) * Math.PI * 2;
      const spread = 2.5;
      const x = base.x + Math.cos(angle) * spread * Math.random();
      const z = base.z + Math.sin(angle) * spread * Math.random();
      const h = 0.2 + (t.dangerLevel || 1) * 0.18;

      const geo = new THREE.CylinderGeometry(0.12, 0.18, h, 6);
      const col = REGION_PALETTE[t.region] || 0x888888;
      const mat = new THREE.MeshStandardMaterial({
        color: col, emissive: col, emissiveIntensity: 0.15,
        metalness: 0.5, roughness: 0.5,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, h / 2, z);
      mesh.castShadow = true;
      xrState.scene.add(mesh);
      xrState.objects.push({ mesh, data: t, type: 'territory' });
    });

    // NPC particle cloud
    if (npcs_arr.length > 0) {
      const sample = npcs_arr.slice(0, 300);
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(sample.length * 3);
      const col = new Float32Array(sample.length * 3);
      sample.forEach((n, i) => {
        const base = regionPositions[n.region] || { x: 0, z: 0 };
        pos[i*3]   = base.x + (Math.random()-0.5)*3;
        pos[i*3+1] = 0.5 + Math.random() * 0.8;
        pos[i*3+2] = base.z + (Math.random()-0.5)*3;
        const rc = new THREE.Color(REALM_COLORS[n.realm] || 0x888888);
        col[i*3] = rc.r; col[i*3+1] = rc.g; col[i*3+2] = rc.b;
      });
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
      const mat = new THREE.PointsMaterial({ size: 0.08, vertexColors: true,
        transparent: true, opacity: 0.85 });
      const pts = new THREE.Points(geo, mat);
      xrState.scene.add(pts);
    }

    updateStats(territories.length, npcs_arr.length);
    xrState.camRadius = 12; xrState.camTheta = 0.4; xrState.camPhi = 0.5;
    updateCameraOrbit(xrState.camera);
  }

  /* VIEW: Territory detail — hex grid of territory pillars */
  function buildTerritoryView() {
    const THREE = window.THREE;
    clearObjects();
    updateLegend('territory');

    const territories = (window.world && window.world.territories) ? window.world.territories : [];
    const cols = Math.ceil(Math.sqrt(territories.length));

    territories.forEach((t, i) => {
      const col  = i % cols;
      const row  = Math.floor(i / cols);
      const x    = (col - cols/2) * 1.4 + (row%2)*0.7;
      const z    = (row - cols/2) * 1.2;
      const h    = 0.3 + (t.dangerLevel || 1) * 0.3;
      const baseColor = REGION_PALETTE[t.region] || 0x8b5cf6;

      // Hex base (cylinder with 6 sides)
      const hexGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.06, 6);
      const hexMat = new THREE.MeshStandardMaterial({
        color: baseColor, emissive: baseColor, emissiveIntensity: 0.08,
        metalness: 0.4, roughness: 0.6,
      });
      const hexMesh = new THREE.Mesh(hexGeo, hexMat);
      hexMesh.position.set(x, 0.03, z);
      xrState.scene.add(hexMesh);

      // Pillar
      const pilGeo = new THREE.CylinderGeometry(0.18, 0.22, h, 8);
      const popNorm = Math.min(t.population / 60000, 1);
      const pilColor = new THREE.Color().setHSL(0.75 - popNorm*0.5, 0.8, 0.55);
      const pilMat = new THREE.MeshStandardMaterial({
        color: pilColor, emissive: pilColor, emissiveIntensity: 0.2 + (t.dangerLevel||1)*0.05,
        metalness: 0.3, roughness: 0.4,
      });
      const pilMesh = new THREE.Mesh(pilGeo, pilMat);
      pilMesh.position.set(x, h/2 + 0.06, z);
      pilMesh.castShadow = true;
      xrState.scene.add(pilMesh);

      // Boss indicator
      if (t.bossPresent) {
        const bossGeo = new THREE.OctahedronGeometry(0.18);
        const bossMat = new THREE.MeshStandardMaterial({
          color: 0xf87171, emissive: 0xf87171, emissiveIntensity: 0.6,
        });
        const bossMesh = new THREE.Mesh(bossGeo, bossMat);
        bossMesh.position.set(x, h + 0.4, z);
        bossMesh.rotation.y = Math.random() * Math.PI;
        xrState.scene.add(bossMesh);
      }

      xrState.objects.push({ mesh: pilMesh, data: t, type: 'territory' });
    });

    updateStats(territories.length, 0);
    xrState.camRadius = 14; xrState.camTheta = 0.3; xrState.camPhi = 0.7;
    updateCameraOrbit(xrState.camera);
  }

  /* VIEW: NPC spatial — tu sĩ xếp thành nhóm theo vùng, cao theo cảnh giới */
  function buildNPCView() {
    const THREE = window.THREE;
    clearObjects();
    updateLegend('npc');

    const alive = (window.npcs || []).filter(n => n.status === 'alive');
    // Group by region
    const byRegion = {};
    alive.forEach(n => {
      const r = n.region || 'Unknown';
      if (!byRegion[r]) byRegion[r] = [];
      byRegion[r].push(n);
    });

    const regions = Object.keys(byRegion);
    const rCount  = regions.length || 1;

    regions.forEach((rName, ri) => {
      const angle  = (ri / rCount) * Math.PI * 2;
      const radius = 5;
      const cx     = Math.cos(angle) * radius;
      const cz     = Math.sin(angle) * radius;
      const group  = byRegion[rName];
      const GRP_R  = Math.min(2.5, 0.4 + group.length * 0.04);

      // Region label
      const baseColor = REGION_PALETTE[rName] || 0x888888;
      addTextSprite(rName.replace(/^[^\s]+\s/,''), cx, 0.3, cz, baseColor);

      // Sort by realm desc for nice layering
      group.sort((a,b) => b.realm - a.realm);
      const shown = group.slice(0, 120); // cap per region

      shown.forEach((npc, ni) => {
        const localAngle = (ni / Math.max(shown.length,1)) * Math.PI * 2;
        const localR     = 0.3 + (ni / Math.max(shown.length,1)) * GRP_R;
        const x = cx + Math.cos(localAngle) * localR;
        const z = cz + Math.sin(localAngle) * localR;
        const y = 0.12 + npc.realm * 0.12;

        const size = 0.08 + npc.realm * 0.025 + (npc.isTianJiao ? 0.06 : 0);
        let geo;
        if (npc.isTianJiao) {
          geo = new THREE.OctahedronGeometry(size);
        } else if (npc.realm >= 6) {
          geo = new THREE.TetrahedronGeometry(size);
        } else {
          geo = new THREE.SphereGeometry(size, 8, 6);
        }

        const col = REALM_COLORS[npc.realm] || 0x888888;
        const mat = new THREE.MeshStandardMaterial({
          color: col, emissive: col,
          emissiveIntensity: 0.15 + npc.realm * 0.04 + (npc.isTianJiao ? 0.25 : 0),
          metalness: 0.2, roughness: 0.6,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        xrState.scene.add(mesh);
        xrState.objects.push({ mesh, data: npc, type: 'npc' });
      });
    });

    updateStats(0, alive.length);
    xrState.camRadius = 14; xrState.camTheta = 0.5; xrState.camPhi = 0.55;
    updateCameraOrbit(xrState.camera);
  }

  // ─── Text sprite helper ───────────────────────────────────
  function addTextSprite(text, x, y, z, color) {
    const THREE = window.THREE;
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,256,64);
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#' + (color||0xffffff).toString(16).padStart(6,'0');
    ctx.textAlign = 'center';
    ctx.fillText(text, 128, 42);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(2, 0.5, 1);
    sprite.position.set(x, y, z);
    xrState.scene.add(sprite);
  }

  function updateStats(terrCount, npcCount) {
    const ts = document.getElementById('xr-stat-terr');
    const ns = document.getElementById('xr-stat-npc');
    if (ts) ts.textContent = terrCount ? `🏔 ${terrCount} lãnh địa` : '';
    if (ns) ns.textContent = npcCount  ? `👤 ${npcCount} tu sĩ`     : '';
  }

  // ─── Animation loop ───────────────────────────────────────
  function startLoop() {
    const THREE = window.THREE;
    const renderer = xrState.renderer;
    const scene    = xrState.scene;
    const camera   = xrState.camera;
    const clock    = xrState.clock;

    function animate(time, frame) {
      // Animate boss indicators & objects
      const t = clock.getElapsedTime();
      xrState.objects.forEach((o, i) => {
        if (!o.mesh) return;
        if (o.type === 'territory' && o.data.bossPresent) {
          // pulsing done via children
        }
        if (o.type === 'npc' && o.data.isTianJiao) {
          o.mesh.rotation.y = t * 1.2 + i;
        }
        if (o.type === 'region') {
          o.mesh.rotation.y = t * 0.3 + i;
          // pulse emissive
          if (o.mesh.material) {
            o.mesh.material.emissiveIntensity = 0.2 + Math.sin(t * 1.5 + i) * 0.12;
          }
        }
      });

      renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(animate);
  }

  // ─── XR Session launch ────────────────────────────────────
  async function checkXRSupport() {
    if (!navigator.xr) return { vr: false, ar: false };
    const vr = await navigator.xr.isSessionSupported('immersive-vr').catch(() => false);
    const ar = await navigator.xr.isSessionSupported('immersive-ar').catch(() => false);
    return { vr, ar };
  }

  async function launchVR() {
    if (!navigator.xr) {
      toast && toast('⚠️ Thiết bị không hỗ trợ WebXR. Đang dùng Flat Mode.');
      enterFlat();
      return;
    }
    try {
      const session = await navigator.xr.requestSession('immersive-vr', {
        requiredFeatures: ['local-floor'],
        optionalFeatures: ['bounded-floor', 'hand-tracking', 'layers'],
      });
      xrState.session = session;
      xrState.mode = 'immersive-vr';
      xrState.renderer.xr.setSession(session);
      updateModeBadge('VR');
      hidePrompt();
      session.addEventListener('end', () => {
        xrState.mode = 'flat';
        updateModeBadge('FLAT');
        xrState.session = null;
      });
      if (window.toast) toast('🥽 Đã vào Immersive VR! Dùng tay/controller để tương tác.');
    } catch (err) {
      console.warn('[XR] VR session failed:', err);
      if (window.toast) toast('⚠️ Không thể khởi động VR. Dùng Flat Mode.');
      enterFlat();
    }
  }

  function enterFlat() {
    hidePrompt();
    xrState.mode = 'flat';
    updateModeBadge('FLAT');
  }

  function hidePrompt() {
    const p = document.getElementById('xr-vr-prompt');
    if (p) p.classList.add('hidden');
  }

  function updateModeBadge(mode) {
    const el = document.getElementById('xr-mode-badge');
    if (!el) return;
    el.textContent = mode;
    el.className = 'xr-badge ' + (
      mode === 'VR' ? 'xr-badge-vr' :
      mode === 'AR' ? 'xr-badge-ar' : 'xr-badge-flat'
    );
  }

  // ─── View switching ───────────────────────────────────────
  let _currentView = 'world';

  function setView(name) {
    _currentView = name;
    ['world','terr','npc'].forEach(v => {
      const btn = document.getElementById('xr-view-' + v);
      if (btn) btn.classList.toggle('active', v === name ||
        (name === 'territory' && v === 'terr'));
    });
    if (!xrState.initialized) return;
    if (name === 'world')     buildWorldView();
    if (name === 'territory') buildTerritoryView();
    if (name === 'npc')       buildNPCView();
  }

  // ─── Enter / Exit ─────────────────────────────────────────
  async function enter() {
    if (!ensureThree()) {
      alert('Three.js chưa load. Vui lòng mở tab 3D World Viewer trước, sau đó thử lại.');
      return;
    }

    injectCSS();
    buildOverlay();

    const overlay = document.getElementById('xr-overlay');
    overlay.classList.add('xr-active');
    document.body.style.overflow = 'hidden';

    // Check XR support and update button
    const support = await checkXRSupport();
    const vrBtn = document.getElementById('xr-launch-vr');
    if (vrBtn) {
      if (!support.vr) {
        vrBtn.textContent = '🥽 VR Not Available on This Device';
        vrBtn.classList.add('unavailable');
        vrBtn.onclick = () => enterFlat();
      }
    }

    // Build three.js scene if not yet
    if (!xrState.initialized) {
      buildScene();
      buildWorldView();
      startLoop();
      xrState.initialized = true;

      // Resize once after DOM paints
      setTimeout(onXRResize, 100);
    }
  }

  function exit() {
    // End XR session if active
    if (xrState.session) {
      xrState.session.end().catch(() => {});
      xrState.session = null;
    }
    const overlay = document.getElementById('xr-overlay');
    if (overlay) overlay.classList.remove('xr-active');
    document.body.style.overflow = '';

    // Restore VR prompt for next open
    const p = document.getElementById('xr-vr-prompt');
    if (p) p.classList.remove('hidden');
  }

  function refresh() {
    if (!xrState.initialized) return;
    setView(_currentView);
  }

  // ─── Public API ───────────────────────────────────────────
  window.XRSystem = { enter, exit, launchVR, enterFlat, setView, refresh };

  // ─── Auto-inject Enter XR button ─────────────────────────
  // Called after DOM ready. Finds the 3D World Viewer nav button and inserts
  // the XR button right after it, without touching existing markup.
  function injectEnterButton() {
    if (document.getElementById('xr-enter-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'xr-enter-btn';
    btn.onclick = () => window.XRSystem.enter();
    btn.innerHTML = `<span class="xr-pulse"></span>Enter XR`;
    btn.title = 'Mở Spatial World Viewer — Quest 3 / Vision Pro / Flat 3D';

    // Insert into 3D viewer toolbar if it exists
    const toolbar = document.querySelector('#panel-world3d > div:first-child');
    if (toolbar) {
      toolbar.appendChild(btn);
      return;
    }
    // Fallback: after the nav worldmap button
    const nav3d = document.querySelector('[data-panel="world3d"]');
    if (nav3d && nav3d.parentNode) {
      nav3d.parentNode.insertBefore(btn, nav3d.nextSibling);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectEnterButton);
  } else {
    // Small delay to let other systems finish initializing
    setTimeout(injectEnterButton, 800);
  }

  console.log(`[XRSystem v${XR_VERSION}] Loaded. Call XRSystem.enter() to open.`);

})();
