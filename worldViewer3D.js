/* ============================
   WORLD VIEWER 3D — worldViewer3D.js
   Creator God — Three.js 3D Territory Map
   Không phá bất kỳ tính năng nào hiện có.
   ============================ */

(function() {
  'use strict';

  // ============================
  // STATE
  // ============================
  let wv3d = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    raycaster: null,
    mouse: null,
    meshes: [],
    animFrameId: null,
    initialized: false,
    container: null,
    selectedMesh: null,
    hoveredMesh: null,
    clock: null,
    particles: null,
  };

  const REGION_COLORS = {
    "🗻 Đông Vực":    { base: 0x4ade80, emissive: 0x1a6632 },
    "🌋 Tây Hoang":   { base: 0xf97316, emissive: 0x7c2d0e },
    "🌊 Nam Hải":     { base: 0x38bdf8, emissive: 0x0c4a6e },
    "❄️ Bắc Nguyên":  { base: 0xa5f3fc, emissive: 0x155e75 },
    "🌀 Trung Châu":  { base: 0xc084fc, emissive: 0x581c87 },
  };

  const DANGER_HEIGHTS = [0, 0.4, 0.65, 0.9, 1.2, 1.6];
  const DANGER_COLORS  = [0x000000, 0x4ade80, 0xfacc15, 0xfb923c, 0xf87171, 0xc084fc];

  // ============================
  // INIT
  // ============================
  window.initWorldViewer3D = function() {
    const container = document.getElementById('wv3d-container');
    if (!container) return;

    // Clean up previous instance
    destroyWorldViewer3D();

    wv3d.container = container;

    // Load Three.js dynamically if not present
    if (typeof THREE === 'undefined') {
      loadThreeJS(function() {
        buildScene();
      });
    } else {
      buildScene();
    }
  };

  function loadThreeJS(callback) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = callback;
    script.onerror = function() {
      const c = document.getElementById('wv3d-container');
      if (c) c.innerHTML = '<div style="color:#f87171;text-align:center;padding:60px;font-size:14px;">⚠️ Không thể tải Three.js. Vui lòng kiểm tra kết nối mạng.</div>';
    };
    document.head.appendChild(script);
  }

  function buildScene() {
    const container = wv3d.container;
    if (!container) return;

    const W = container.clientWidth  || 800;
    const H = container.clientHeight || 600;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.018);
    wv3d.scene = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 500);
    camera.position.set(0, 18, 28);
    camera.lookAt(0, 0, 0);
    wv3d.camera = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    wv3d.renderer = renderer;

    // Clock
    wv3d.clock = new THREE.Clock();

    // Lighting
    setupLighting(scene);

    // Ground plane
    setupGround(scene);

    // Particle stars
    setupParticles(scene);

    // Territories
    buildTerritoryNodes(scene);

    // Controls (manual orbit)
    setupControls(renderer.domElement);

    // Raycaster
    wv3d.raycaster = new THREE.Raycaster();
    wv3d.mouse = new THREE.Vector2(-9999, -9999);

    // Events
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('click',     onMouseClick, false);
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: true });

    // Resize
    wv3d._resizeHandler = function() { onWindowResize(); };
    window.addEventListener('resize', wv3d._resizeHandler, false);

    wv3d.initialized = true;
    animate();
  }

  // ============================
  // LIGHTING
  // ============================
  function setupLighting(scene) {
    const ambient = new THREE.AmbientLight(0x1a1a3a, 1.2);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.4);
    dirLight.position.set(15, 25, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width  = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far  = 100;
    dirLight.shadow.camera.left   = -30;
    dirLight.shadow.camera.right  = 30;
    dirLight.shadow.camera.top    = 30;
    dirLight.shadow.camera.bottom = -30;
    scene.add(dirLight);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0x6633ff, 0.5);
    rimLight.position.set(-10, 8, -15);
    scene.add(rimLight);
  }

  // ============================
  // GROUND
  // ============================
  function setupGround(scene) {
    // Grid lines
    const gridHelper = new THREE.GridHelper(60, 30, 0x1a1a3a, 0x111128);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // Ground disc
    const groundGeo  = new THREE.CircleGeometry(32, 64);
    const groundMat  = new THREE.MeshStandardMaterial({
      color: 0x0d0d20,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  // ============================
  // PARTICLES
  // ============================
  function setupParticles(scene) {
    const count = 300;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = Math.random() * 40 + 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.6 });
    wv3d.particles = new THREE.Points(geo, mat);
    scene.add(wv3d.particles);
  }

  // ============================
  // TERRITORY NODES
  // ============================
  function buildTerritoryNodes(scene) {
    wv3d.meshes = [];

    const territories = getTerritories();
    if (!territories || !territories.length) {
      showEmptyState();
      return;
    }

    const count = territories.length;

    // Layout: arrange in a spiral/grid on the ground
    const positions = computeLayout(count);

    territories.forEach(function(t, i) {
      const pos = positions[i];
      const mesh = createTerritoryMesh(t, pos);
      scene.add(mesh);
      wv3d.meshes.push(mesh);

      // Connection lines to nearby territories (within radius 10)
      if (i > 0) {
        for (let j = 0; j < i; j++) {
          const p2 = positions[j];
          const dx = pos.x - p2.x;
          const dz = pos.z - p2.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < 10) {
            addConnectionLine(scene, pos, p2);
          }
        }
      }
    });

    // Update count label
    const lbl = document.getElementById('wv3d-count');
    if (lbl) lbl.textContent = count + ' lãnh địa';
  }

  function computeLayout(count) {
    // Phyllotaxis spiral layout
    const positions = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const r     = Math.sqrt(i / count) * 22;
      const theta = i * goldenAngle;
      positions.push({ x: r * Math.cos(theta), z: r * Math.sin(theta) });
    }
    return positions;
  }

  function createTerritoryMesh(t, pos) {
    const danger   = t.dangerLevel || 1;
    const height   = DANGER_HEIGHTS[danger] || 0.5;
    const regionCols = REGION_COLORS[t.region] || { base: 0x888888, emissive: 0x222222 };
    const topColor = DANGER_COLORS[danger] || 0x888888;

    // Column body
    const bodyGeo = new THREE.CylinderGeometry(0.55, 0.7, height, 8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color:     regionCols.base,
      emissive:  regionCols.emissive,
      emissiveIntensity: 0.3,
      roughness: 0.6,
      metalness: 0.25,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;

    // Top cap (danger indicator)
    const topGeo = new THREE.SphereGeometry(0.42, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const topMat = new THREE.MeshStandardMaterial({
      color:    topColor,
      emissive: topColor,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.5,
    });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = height / 2;

    // Boss glow ring
    let ring = null;
    if (t.bossPresent) {
      const ringGeo = new THREE.TorusGeometry(0.7, 0.06, 8, 24);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x7c3aed,
        emissive: 0x7c3aed,
        emissiveIntensity: 1.2,
        roughness: 0.2,
        metalness: 0.8,
      });
      ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = height / 2 + 0.25;
      ring.rotation.x = Math.PI / 2;
    }

    // Group
    const group = new THREE.Group();
    group.add(bodyMesh);
    group.add(topMesh);
    if (ring) group.add(ring);

    group.position.set(pos.x, height / 2, pos.z);
    group.userData = {
      territory: t,
      baseY:     height / 2,
      baseScale: 1,
      isSelected: false,
      bossRing: ring,
      bodyMesh: bodyMesh,
      topMesh: topMesh,
      animOffset: Math.random() * Math.PI * 2,
    };

    // Point light for glow
    const ptLight = new THREE.PointLight(regionCols.base, 0.6, 4);
    ptLight.position.y = height;
    group.add(ptLight);

    return group;
  }

  function addConnectionLine(scene, p1, p2) {
    const material = new THREE.LineBasicMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.4,
    });
    const points = [
      new THREE.Vector3(p1.x, 0.02, p1.z),
      new THREE.Vector3(p2.x, 0.02, p2.z),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    scene.add(line);
  }

  // ============================
  // MANUAL ORBIT CONTROLS
  // ============================
  function setupControls(canvas) {
    let isDragging  = false;
    let isRightDrag = false;
    let prevX = 0, prevY = 0;
    let spherical = { theta: 0.3, phi: 0.6, radius: 34 };
    let target = { x: 0, y: 0, z: 0 };

    function updateCamera() {
      wv3d.camera.position.set(
        target.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta),
        target.y + spherical.radius * Math.cos(spherical.phi),
        target.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta)
      );
      wv3d.camera.lookAt(target.x, target.y, target.z);
    }
    updateCamera();
    wv3d._updateCamera = updateCamera;
    wv3d._spherical = spherical;
    wv3d._target = target;

    canvas.addEventListener('mousedown', function(e) {
      isDragging  = true;
      isRightDrag = (e.button === 2);
      prevX = e.clientX;
      prevY = e.clientY;
    });

    window.addEventListener('mouseup', function() { isDragging = false; });

    canvas.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      if (isRightDrag) {
        // Pan
        const panSpeed = 0.03;
        const right = new THREE.Vector3();
        const up    = new THREE.Vector3(0, 1, 0);
        right.crossVectors(wv3d.camera.getWorldDirection(new THREE.Vector3()), up).normalize();
        target.x -= right.x * dx * panSpeed;
        target.z -= right.z * dx * panSpeed;
        target.y += dy * panSpeed;
      } else {
        // Orbit
        spherical.theta -= dx * 0.008;
        spherical.phi    = Math.max(0.15, Math.min(Math.PI * 0.48, spherical.phi + dy * 0.006));
      }
      updateCamera();
    });

    canvas.addEventListener('wheel', function(e) {
      e.preventDefault();
      spherical.radius = Math.max(5, Math.min(80, spherical.radius + e.deltaY * 0.05));
      updateCamera();
    }, { passive: false });

    canvas.addEventListener('contextmenu', function(e) { e.preventDefault(); });

    // Touch controls
    let lastTouchDist = 0;
    let lastTouchX = 0, lastTouchY = 0;

    canvas.addEventListener('touchmove', function(e) {
      e.preventDefault();
      if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - lastTouchX;
        const dy = e.touches[0].clientY - lastTouchY;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
        spherical.theta -= dx * 0.01;
        spherical.phi = Math.max(0.15, Math.min(Math.PI * 0.48, spherical.phi + dy * 0.008));
        updateCamera();
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (lastTouchDist > 0) {
          spherical.radius = Math.max(5, Math.min(80, spherical.radius - (dist - lastTouchDist) * 0.05));
          updateCamera();
        }
        lastTouchDist = dist;
      }
    }, { passive: false });

    canvas.addEventListener('touchstart', function(e) {
      if (e.touches.length === 1) {
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        lastTouchDist = 0;
      }
    }, { passive: true });

    canvas.addEventListener('touchend', function() { lastTouchDist = 0; });
  }

  // ============================
  // ANIMATE
  // ============================
  function animate() {
    wv3d.animFrameId = requestAnimationFrame(animate);
    const delta = wv3d.clock ? wv3d.clock.getDelta() : 0.016;
    const elapsed = wv3d.clock ? wv3d.clock.elapsedTime : 0;

    // Animate meshes
    wv3d.meshes.forEach(function(group) {
      const ud = group.userData;
      if (!ud) return;

      // Idle float
      const floatY = Math.sin(elapsed * 1.1 + ud.animOffset) * 0.08;
      group.position.y = ud.baseY + floatY;

      // Boss ring spin
      if (ud.bossRing) {
        ud.bossRing.rotation.z += delta * 1.5;
      }

      // Hover scale
      const targetScale = ud.isHovered ? 1.15 : (ud.isSelected ? 1.1 : 1.0);
      group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
    });

    // Particles drift
    if (wv3d.particles) {
      wv3d.particles.rotation.y += delta * 0.01;
    }

    // Raycaster hover
    if (wv3d.raycaster && wv3d.camera) {
      wv3d.raycaster.setFromCamera(wv3d.mouse, wv3d.camera);
      const allMeshChildren = [];
      wv3d.meshes.forEach(function(g) {
        g.children.forEach(function(c) {
          if (c.isMesh) { c._parent = g; allMeshChildren.push(c); }
        });
      });
      const intersects = wv3d.raycaster.intersectObjects(allMeshChildren);

      let newHovered = null;
      if (intersects.length > 0) {
        newHovered = intersects[0].object._parent || null;
      }

      if (newHovered !== wv3d.hoveredMesh) {
        if (wv3d.hoveredMesh) wv3d.hoveredMesh.userData.isHovered = false;
        wv3d.hoveredMesh = newHovered;
        if (newHovered) {
          newHovered.userData.isHovered = true;
          wv3d.renderer.domElement.style.cursor = 'pointer';
        } else {
          wv3d.renderer.domElement.style.cursor = 'default';
        }
      }
    }

    wv3d.renderer.render(wv3d.scene, wv3d.camera);
  }

  // ============================
  // EVENTS
  // ============================
  function onMouseMove(e) {
    const rect = wv3d.renderer.domElement.getBoundingClientRect();
    wv3d.mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    wv3d.mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
  }

  function onMouseClick(e) {
    if (!wv3d.raycaster) return;
    const rect = wv3d.renderer.domElement.getBoundingClientRect();
    const mx =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    const my = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    const clickMouse = new THREE.Vector2(mx, my);
    wv3d.raycaster.setFromCamera(clickMouse, wv3d.camera);

    const allMeshChildren = [];
    wv3d.meshes.forEach(function(g) {
      g.children.forEach(function(c) {
        if (c.isMesh) { c._parent = g; allMeshChildren.push(c); }
      });
    });
    const intersects = wv3d.raycaster.intersectObjects(allMeshChildren);

    if (intersects.length > 0) {
      const group = intersects[0].object._parent;
      if (group) selectTerritory(group);
    } else {
      deselectTerritory();
    }
  }

  function onTouchStart(e) {
    if (e.touches.length === 1) {
      // Simulate click after brief delay to distinguish from drag
      const touch = e.touches[0];
      setTimeout(function() {
        const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY };
        onMouseClick(fakeEvent);
      }, 120);
    }
  }

  function onWindowResize() {
    const container = wv3d.container;
    if (!container || !wv3d.camera || !wv3d.renderer) return;
    const W = container.clientWidth;
    const H = container.clientHeight;
    wv3d.camera.aspect = W / H;
    wv3d.camera.updateProjectionMatrix();
    wv3d.renderer.setSize(W, H);
  }

  // ============================
  // SELECT / DESELECT
  // ============================
  function selectTerritory(group) {
    // Deselect previous
    if (wv3d.selectedMesh && wv3d.selectedMesh !== group) {
      wv3d.selectedMesh.userData.isSelected = false;
    }
    wv3d.selectedMesh = group;
    group.userData.isSelected = true;

    const t = group.userData.territory;
    if (t) showInfoPanel(t);
  }

  function deselectTerritory() {
    if (wv3d.selectedMesh) {
      wv3d.selectedMesh.userData.isSelected = false;
      wv3d.selectedMesh = null;
    }
    hideInfoPanel();
  }

  // ============================
  // INFO PANEL
  // ============================
  function showInfoPanel(t) {
    const panel = document.getElementById('wv3d-info');
    if (!panel) return;

    const danger       = t.dangerLevel || 1;
    const dangerLabels = ['','★ An Toàn','★★ Bình Thường','★★★ Nguy Hiểm','★★★★ Cực Nguy','★★★★★ Tử Địa'];
    const dangerColors = ['','#4ade80','#facc15','#fb923c','#f87171','#c084fc'];
    const dColor       = dangerColors[danger] || '#94a3b8';
    const dLabel       = dangerLabels[danger] || '';

    // Try to find owner from sects/countries in global scope
    let ownerInfo = '—';
    try {
      if (typeof sects !== 'undefined' && sects) {
        const s = sects.find(function(s) { return s.territory === t.region; });
        if (s) ownerInfo = '🏯 ' + s.name;
      }
      if (ownerInfo === '—' && typeof countries !== 'undefined' && countries) {
        const c = countries.find(function(c) { return c.territory === t.region; });
        if (c) ownerInfo = '⚔️ ' + c.name;
      }
    } catch(e) {}

    panel.innerHTML = [
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">',
        '<span style="font-weight:700;font-size:15px;color:#facc15;">' + t.name + '</span>',
        '<button onclick="window.wv3dCloseInfo()" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:16px;padding:0 4px;">✕</button>',
      '</div>',
      '<div style="font-size:11px;color:#94a3b8;margin-bottom:10px;">' + t.region + '</div>',
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">',
        infoStat('👥', 'Dân Số',     t.population.toLocaleString(),          '#e2e8f0'),
        infoStat('✨', 'Linh Khí',   t.spiritualEnergy,                       '#c084fc'),
        infoStat('⚙️', 'Khoáng Sản', t.minerals,                              '#94a3b8'),
        infoStat('🌿', 'Thảo Dược',  t.herbs,                                  '#4ade80'),
      '</div>',
      '<div style="margin-bottom:8px;font-size:12px;">',
        '<span style="color:#94a3b8;">Chủ sở hữu: </span>',
        '<span style="color:#e2e8f0;">' + ownerInfo + '</span>',
      '</div>',
      '<div style="font-size:11px;font-weight:600;color:' + dColor + ';">⚠️ ' + dLabel + '</div>',
      t.bossPresent ? '<div style="margin-top:8px;font-size:11px;background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.4);border-radius:6px;padding:4px 8px;color:#c084fc;">🐉 Boss đang trú ngụ tại đây!</div>' : '',
    ].join('');

    panel.style.display = 'block';

    // Animate in
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(8px)';
    requestAnimationFrame(function() {
      panel.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      panel.style.opacity = '1';
      panel.style.transform = 'translateY(0)';
    });
  }

  function infoStat(icon, label, value, color) {
    return [
      '<div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:8px;text-align:center;">',
        '<div style="font-size:16px;">' + icon + '</div>',
        '<div style="font-size:10px;color:#64748b;margin-top:2px;">' + label + '</div>',
        '<div style="font-size:13px;font-weight:700;color:' + color + ';margin-top:2px;">' + value + '</div>',
      '</div>'
    ].join('');
  }

  function hideInfoPanel() {
    const panel = document.getElementById('wv3d-info');
    if (!panel) return;
    panel.style.display = 'none';
  }

  window.wv3dCloseInfo = function() {
    deselectTerritory();
  };

  // ============================
  // HELPERS
  // ============================
  function getTerritories() {
    if (typeof world !== 'undefined' && world && world.territories && world.territories.length) {
      return world.territories;
    }
    return [];
  }

  function showEmptyState() {
    const container = wv3d.container;
    if (!container) return;
    container.innerHTML = [
      '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#64748b;font-size:14px;gap:12px;">',
        '<div style="font-size:48px;">🌍</div>',
        '<div>Chưa có lãnh địa nào.</div>',
        '<div style="font-size:12px;">Hãy khai sinh thế giới mới trước.</div>',
      '</div>'
    ].join('');
  }

  // ============================
  // REFRESH (called when territories change)
  // ============================
  window.refreshWorldViewer3D = function() {
    if (!wv3d.initialized || !wv3d.scene) return;
    // Remove old territory meshes
    wv3d.meshes.forEach(function(m) { wv3d.scene.remove(m); });
    // Remove connection lines
    const toRemove = [];
    wv3d.scene.children.forEach(function(c) { if (c.isLine) toRemove.push(c); });
    toRemove.forEach(function(c) { wv3d.scene.remove(c); });

    wv3d.meshes = [];
    wv3d.selectedMesh = null;
    wv3d.hoveredMesh  = null;
    hideInfoPanel();
    buildTerritoryNodes(wv3d.scene);
  };

  // ============================
  // DESTROY
  // ============================
  function destroyWorldViewer3D() {
    if (wv3d.animFrameId) {
      cancelAnimationFrame(wv3d.animFrameId);
      wv3d.animFrameId = null;
    }
    if (wv3d._resizeHandler) {
      window.removeEventListener('resize', wv3d._resizeHandler);
      wv3d._resizeHandler = null;
    }
    if (wv3d.renderer) {
      wv3d.renderer.dispose();
      wv3d.renderer = null;
    }
    wv3d.scene = null;
    wv3d.camera = null;
    wv3d.meshes = [];
    wv3d.initialized = false;
  }

  window.destroyWorldViewer3D = destroyWorldViewer3D;

  // Expose wv3d state globally so npcSpatialEngine and other systems can access it
  window.wv3d = wv3d;

})();
