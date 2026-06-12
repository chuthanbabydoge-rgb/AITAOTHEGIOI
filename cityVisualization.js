/* ============================================================
   CITY VISUALIZATION SYSTEM — cityVisualization.js
   Creator God V6 — 3D Buildings: Cities, Sects, Countries
   - Thành trì (cities) hiển thị trên lãnh địa tương ứng
   - Tông môn (sects) hiển thị theo territory của sect
   - Quốc gia (countries) hiển thị theo territory
   - Quy mô 3D phụ thuộc vào population / power / resources
   KHÔNG phá worldViewer3D.js hay npcSpatialEngine.js
   ============================================================ */

(function() {
  'use strict';

  // ============================================================
  // STATE
  // ============================================================
  const CVS = {
    buildingMeshes: {},   // key -> THREE.Group
    initialized: false,
    tickInterval: null,
    TICK_MS: 60,
  };

  // ============================================================
  // BUILDING PALETTE
  // ============================================================

  // City tiers by population
  const CITY_TIERS = [
    { min: 0,      label: 'Thôn',     color: 0x6b7280, emissive: 0x1f2937, roofColor: 0xd97706 },
    { min: 10000,  label: 'Trấn',     color: 0x78716c, emissive: 0x292524, roofColor: 0xca8a04 },
    { min: 50000,  label: 'Thành',    color: 0x94a3b8, emissive: 0x1e293b, roofColor: 0x2563eb },
    { min: 150000, label: 'Đại Thành',color: 0xbae6fd, emissive: 0x0369a1, roofColor: 0x1d4ed8 },
    { min: 300000, label: 'Kinh Thành',color: 0xe0f2fe, emissive: 0x0284c7, roofColor: 0xfbbf24 },
  ];

  // Sect tiers by prestige
  const SECT_TIERS = [
    { min: 0,    label: 'Tiểu Phái',  color: 0x4b5563, emissive: 0x111827, flagColor: 0x6b7280 },
    { min: 300,  label: 'Trung Phái', color: 0x166534, emissive: 0x052e16, flagColor: 0x4ade80 },
    { min: 600,  label: 'Đại Phái',   color: 0x1e40af, emissive: 0x172554, flagColor: 0x60a5fa },
    { min: 1000, label: 'Tông Môn',   color: 0x6d28d9, emissive: 0x2e1065, flagColor: 0xc084fc },
    { min: 2000, label: 'Thánh Địa',  color: 0x92400e, emissive: 0x451a03, flagColor: 0xfbbf24 },
  ];

  // Country tiers by wealth + army
  const COUNTRY_TIERS = [
    { min: 0,     label: 'Tiểu Quốc',  color: 0x78350f, emissive: 0x1c0701, flagColor: 0xf97316 },
    { min: 5000,  label: 'Trung Quốc', color: 0x7f1d1d, emissive: 0x3b0101, flagColor: 0xf87171 },
    { min: 10000, label: 'Đại Quốc',   color: 0x881337, emissive: 0x4c0519, flagColor: 0xfb7185 },
    { min: 20000, label: 'Đế Quốc',    color: 0x713f12, emissive: 0x431407, flagColor: 0xfbbf24 },
  ];

  function getTier(tiers, value) {
    let tier = tiers[0];
    for (let i = 0; i < tiers.length; i++) {
      if (value >= tiers[i].min) tier = tiers[i];
    }
    return tier;
  }

  // ============================================================
  // TERRITORY POSITION LOOKUP (from wv3d.meshes)
  // ============================================================
  function getTerritoryWorldPos(regionName) {
    if (typeof wv3d === 'undefined' || !wv3d.meshes) return null;
    // Match by territory.region name
    const matches = wv3d.meshes.filter(function(m) {
      return m.userData && m.userData.territory &&
             m.userData.territory.region === regionName;
    });
    if (!matches.length) return null;
    // Return a random one among matching territories
    const m = matches[Math.floor(Math.random() * matches.length)];
    return { x: m.position.x, y: m.position.y, z: m.position.z, mesh: m };
  }

  // Get a specific territory mesh by id
  function getTerritoryById(id) {
    if (typeof wv3d === 'undefined' || !wv3d.meshes) return null;
    return wv3d.meshes.find(function(m) {
      return m.userData && m.userData.territory && m.userData.territory.id === id;
    }) || null;
  }

  // Jitter offset so buildings don't stack on top of each other
  function jitter(spread) {
    return (Math.random() - 0.5) * 2 * spread;
  }

  // ============================================================
  // BUILD: CITY MESH
  // 🏯 Capital → multi-tower pagoda
  // 🏰 City    → single tower + wall
  // ============================================================
  function buildCityMesh(cityData) {
    if (typeof THREE === 'undefined') return null;
    const pop  = cityData.population || 10000;
    const tier = getTier(CITY_TIERS, pop);
    const isCapital = cityData.type === 'capital';

    // Scale based on population (log scale, range 0.3 – 1.2)
    const s = 0.3 + Math.log10(Math.max(1000, pop) / 1000) * 0.3;
    const group = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: tier.color, emissive: tier.emissive,
      emissiveIntensity: 0.35, roughness: 0.55, metalness: 0.3,
    });
    const roofMat = new THREE.MeshStandardMaterial({
      color: tier.roofColor, emissive: tier.roofColor,
      emissiveIntensity: 0.5, roughness: 0.3, metalness: 0.6,
    });

    // Base platform
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(s * 2.2, s * 0.15, s * 2.2),
      bodyMat
    );
    base.position.y = s * 0.075;
    group.add(base);

    // Wall ring
    const wallH = s * 0.4;
    for (let i = 0; i < 4; i++) {
      const wx = (i % 2 === 0) ? s * 1.0 : 0;
      const wz = (i % 2 === 1) ? s * 1.0 : 0;
      const ww = (i % 2 === 0) ? s * 0.12 : s * 2.2;
      const wd = (i % 2 === 1) ? s * 0.12 : s * 2.2;
      const wall = new THREE.Mesh(new THREE.BoxGeometry(ww, wallH, wd), bodyMat);
      wall.position.set(
        i === 0 ? s * 1.05 : i === 1 ? 0 : i === 2 ? -s * 1.05 : 0,
        wallH / 2 + s * 0.15,
        i === 1 ? s * 1.05 : i === 3 ? -s * 1.05 : 0
      );
      group.add(wall);
    }

    // Main tower
    const towerH = s * (isCapital ? 1.8 : 1.2);
    const tower  = new THREE.Mesh(
      new THREE.CylinderGeometry(s * 0.28, s * 0.35, towerH, 6),
      bodyMat
    );
    tower.position.y = s * 0.15 + towerH / 2;
    group.add(tower);

    // Pagoda roof tiers
    const roofLevels = isCapital ? 3 : 1;
    for (let ri = 0; ri < roofLevels; ri++) {
      const ry  = s * 0.15 + towerH * (0.4 + ri * 0.28);
      const rs  = s * (0.55 - ri * 0.1);
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(rs, s * 0.3, 6),
        roofMat
      );
      roof.position.y = ry;
      group.add(roof);
    }

    // Top spire
    const spire = new THREE.Mesh(
      new THREE.ConeGeometry(s * 0.06, s * 0.5, 6),
      roofMat
    );
    spire.position.y = s * 0.15 + towerH + s * 0.25;
    group.add(spire);

    // Capital: side towers
    if (isCapital) {
      const sideTPos = [
        { x: s * 0.7, z: s * 0.7 },
        { x: -s * 0.7, z: s * 0.7 },
        { x: s * 0.7, z: -s * 0.7 },
        { x: -s * 0.7, z: -s * 0.7 },
      ];
      sideTPos.forEach(function(p) {
        const sh = s * 0.75;
        const st = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.14, s * 0.18, sh, 5), bodyMat);
        st.position.set(p.x, s * 0.15 + sh / 2, p.z);
        group.add(st);
        const srf = new THREE.Mesh(new THREE.ConeGeometry(s * 0.22, s * 0.18, 5), roofMat);
        srf.position.set(p.x, s * 0.15 + sh + s * 0.09, p.z);
        group.add(srf);
      });

      // Glow light for capital
      const ptl = new THREE.PointLight(tier.roofColor, 0.7, 5);
      ptl.position.y = towerH;
      group.add(ptl);
    }

    group.userData = {
      type:     'city',
      data:     cityData,
      label:    tier.label,
      isCapital: isCapital,
      animPhase: Math.random() * Math.PI * 2,
      baseY:    0,
    };

    return group;
  }

  // ============================================================
  // BUILD: SECT MESH
  // 🏯 Sect hall with spirit pillar + flag banner
  // ============================================================
  function buildSectMesh(sect) {
    if (typeof THREE === 'undefined') return null;
    const prestige = sect.prestige || 100;
    const members  = (sect.members || []).length;
    const tier     = getTier(SECT_TIERS, prestige);
    const lvl      = sect.level || 1;

    const s = 0.25 + Math.log10(Math.max(100, prestige) / 100) * 0.25 + lvl * 0.05;
    const group = new THREE.Group();

    const hallMat = new THREE.MeshStandardMaterial({
      color: tier.color, emissive: tier.emissive,
      emissiveIntensity: 0.45, roughness: 0.4, metalness: 0.45,
    });
    const flagMat = new THREE.MeshStandardMaterial({
      color: tier.flagColor, emissive: tier.flagColor,
      emissiveIntensity: 0.9, roughness: 0.3, metalness: 0.6,
    });

    // Foundation
    const base = new THREE.Mesh(new THREE.BoxGeometry(s * 2, s * 0.1, s * 2), hallMat);
    base.position.y = s * 0.05;
    group.add(base);

    // Main hall (elongated box)
    const hall = new THREE.Mesh(new THREE.BoxGeometry(s * 1.4, s * 0.8, s * 0.9), hallMat);
    hall.position.y = s * 0.1 + s * 0.4;
    group.add(hall);

    // Curved roof (approximated with cylinder)
    const roof = new THREE.Mesh(
      new THREE.CylinderGeometry(s * 0.05, s * 1.0, s * 0.35, 6, 1, false, 0, Math.PI),
      hallMat
    );
    roof.rotation.z = Math.PI / 2;
    roof.position.set(0, s * 0.1 + s * 0.8 + s * 0.12, 0);
    group.add(roof);

    // Spirit pillar (tall glowing column)
    const pillarH = s * (1.5 + lvl * 0.4);
    const pillar  = new THREE.Mesh(
      new THREE.CylinderGeometry(s * 0.07, s * 0.09, pillarH, 6),
      flagMat
    );
    pillar.position.set(0, s * 0.1 + pillarH / 2, -s * 0.7);
    group.add(pillar);

    // Pillar orb on top
    const orb = new THREE.Mesh(new THREE.SphereGeometry(s * 0.14, 8, 6), flagMat);
    orb.position.set(0, s * 0.1 + pillarH + s * 0.14, -s * 0.7);
    group.add(orb);

    // Flag banner
    const flag = new THREE.Mesh(
      new THREE.PlaneGeometry(s * 0.4, s * 0.28),
      new THREE.MeshStandardMaterial({
        color: tier.flagColor, emissive: tier.flagColor,
        emissiveIntensity: 0.7, side: THREE.DoubleSide,
      })
    );
    flag.position.set(s * 0.22, s * 0.1 + pillarH + s * 0.02, -s * 0.7);
    flag.rotation.y = Math.PI / 2;
    group.add(flag);

    // Point light
    const ptl = new THREE.PointLight(tier.flagColor, 0.6, 4);
    ptl.position.set(0, s * 0.1 + pillarH, -s * 0.7);
    group.add(ptl);

    group.userData = {
      type:      'sect',
      data:      sect,
      label:     tier.label,
      animPhase: Math.random() * Math.PI * 2,
      baseY:     0,
    };

    return group;
  }

  // ============================================================
  // BUILD: COUNTRY MESH
  // 🏛️ Palace complex with battlements
  // ============================================================
  function buildCountryMesh(country) {
    if (typeof THREE === 'undefined') return null;
    const wealth = country.wealth || 1000;
    const army   = country.army   || 1000;
    const pop    = country.population || 100000;
    const power  = wealth + army * 0.5;
    const tier   = getTier(COUNTRY_TIERS, power);

    // Scale: log of wealth
    const s = 0.4 + Math.log10(Math.max(1000, wealth) / 1000) * 0.28;
    const group = new THREE.Group();

    const wallMat = new THREE.MeshStandardMaterial({
      color: tier.color, emissive: tier.emissive,
      emissiveIntensity: 0.35, roughness: 0.5, metalness: 0.5,
    });
    const flagMat = new THREE.MeshStandardMaterial({
      color: tier.flagColor, emissive: tier.flagColor,
      emissiveIntensity: 0.8, roughness: 0.2, metalness: 0.7,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24, emissive: 0x92400e,
      emissiveIntensity: 0.6, roughness: 0.2, metalness: 0.9,
    });

    // Grand base platform
    const base = new THREE.Mesh(new THREE.BoxGeometry(s * 3.0, s * 0.2, s * 3.0), wallMat);
    base.position.y = s * 0.1;
    group.add(base);

    // Outer walls (4 sides)
    const wallH  = s * 0.6;
    const wallW  = s * 3.0;
    const wallTh = s * 0.15;
    [[0, wallH/2+s*0.1, -s*1.425, wallW, wallH, wallTh],
     [0, wallH/2+s*0.1,  s*1.425, wallW, wallH, wallTh],
     [-s*1.425, wallH/2+s*0.1, 0, wallTh, wallH, wallW],
     [ s*1.425, wallH/2+s*0.1, 0, wallTh, wallH, wallW],
    ].forEach(function(d) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(d[3], d[4], d[5]), wallMat);
      w.position.set(d[0], d[1], d[2]);
      group.add(w);
    });

    // Corner towers
    [[-1,1],[1,1],[1,-1],[-1,-1]].forEach(function(c) {
      const th = s * 1.1;
      const ct = new THREE.Mesh(new THREE.CylinderGeometry(s*0.18, s*0.22, th, 7), wallMat);
      ct.position.set(c[0]*s*1.35, s*0.2 + th/2, c[1]*s*1.35);
      group.add(ct);
      const cf = new THREE.Mesh(new THREE.ConeGeometry(s*0.26, s*0.3, 7), flagMat);
      cf.position.set(c[0]*s*1.35, s*0.2 + th + s*0.15, c[1]*s*1.35);
      group.add(cf);
    });

    // Palace body
    const palH = s * 1.4;
    const palace = new THREE.Mesh(new THREE.BoxGeometry(s*1.6, palH, s*1.2), wallMat);
    palace.position.y = s * 0.2 + palH / 2;
    group.add(palace);

    // Palace roof (layered)
    [0, 1].forEach(function(i) {
      const rh  = s * 0.35;
      const rs  = s * (1.05 - i * 0.25);
      const ry  = s * 0.2 + palH * (0.5 + i * 0.38);
      const roof = new THREE.Mesh(new THREE.CylinderGeometry(rs*0.1, rs, rh, 8), goldMat);
      roof.position.y = ry;
      group.add(roof);
    });

    // Throne tower
    const ttH = s * 2.2;
    const tt  = new THREE.Mesh(new THREE.CylinderGeometry(s*0.22, s*0.28, ttH, 8), wallMat);
    tt.position.y = s * 0.2 + ttH / 2;
    group.add(tt);

    const ttRoof = new THREE.Mesh(new THREE.ConeGeometry(s*0.38, s*0.55, 8), goldMat);
    ttRoof.position.y = s * 0.2 + ttH + s * 0.27;
    group.add(ttRoof);

    // Flag on throne tower
    const flagPole = new THREE.Mesh(
      new THREE.CylinderGeometry(s*0.03, s*0.03, s*0.7, 5),
      goldMat
    );
    flagPole.position.y = s * 0.2 + ttH + s * 0.55 + s * 0.35;
    group.add(flagPole);

    const flagBanner = new THREE.Mesh(
      new THREE.PlaneGeometry(s*0.35, s*0.25),
      new THREE.MeshStandardMaterial({
        color: tier.flagColor, emissive: tier.flagColor,
        emissiveIntensity: 1.0, side: THREE.DoubleSide,
      })
    );
    flagBanner.position.set(s*0.19, s*0.2 + ttH + s*0.55 + s*0.58, 0);
    group.add(flagBanner);

    // Glow light
    const ptl = new THREE.PointLight(tier.flagColor, 0.8, 6);
    ptl.position.y = s * 0.2 + ttH;
    group.add(ptl);

    group.userData = {
      type:      'country',
      data:      country,
      label:     tier.label,
      animPhase: Math.random() * Math.PI * 2,
      baseY:     0,
    };

    return group;
  }

  // ============================================================
  // PLACE BUILDINGS ON THE 3D MAP
  // ============================================================
  function placeBuilding(key, mesh, territoryRegion, offsetX, offsetZ) {
    if (!mesh) return;
    const tp = getTerritoryWorldPos(territoryRegion);
    if (!tp) return;

    // Base Y = top of territory mesh
    const baseY = (tp.mesh.userData.baseY || 0) * 2 + 0.05;
    mesh.position.set(tp.x + offsetX, baseY, tp.z + offsetZ);
    mesh.userData.baseY = baseY;

    wv3d.scene.add(mesh);
    CVS.buildingMeshes[key] = mesh;
  }

  // ============================================================
  // SYNC ALL BUILDINGS
  // ============================================================
  function buildAll() {
    if (typeof wv3d === 'undefined' || !wv3d.scene || !wv3d.initialized) return;

    // Remove stale
    Object.keys(CVS.buildingMeshes).forEach(function(k) {
      wv3d.scene.remove(CVS.buildingMeshes[k]);
    });
    CVS.buildingMeshes = {};

    // ── SECTS ──
    const liveSects = (typeof sects !== 'undefined') ? sects : [];
    liveSects.forEach(function(sect, i) {
      if (!sect.territory) return;
      const mesh = buildSectMesh(sect);
      if (!mesh) return;
      // Offset so sects don't overlap with territory column
      const angle = (i / Math.max(1, liveSects.length)) * Math.PI * 2;
      const r     = 1.4 + (i % 3) * 0.5;
      placeBuilding('sect_' + sect.id, mesh, sect.territory,
        Math.cos(angle) * r, Math.sin(angle) * r);
    });

    // ── COUNTRIES ──
    const liveCountries = (typeof countries !== 'undefined') ? countries : [];
    liveCountries.forEach(function(country, i) {
      if (!country.territory) return;
      const mesh = buildCountryMesh(country);
      if (!mesh) return;
      const angle = (i / Math.max(1, liveCountries.length)) * Math.PI * 2 + Math.PI;
      const r     = 2.0;
      placeBuilding('country_' + country.id, mesh, country.territory,
        Math.cos(angle) * r, Math.sin(angle) * r);
    });

    // ── CITIES (from worldMapSystem buildMapData) ──
    // Build city data inline from countries (mirror of worldMapSystem logic)
    const CITY_SPREAD = [
      {dx:-0.5,dy:-0.5},{dx:0.5,dy:-0.5},{dx:0,dy:0.6},{dx:-0.6,dy:0.3},
    ];
    liveCountries.forEach(function(c, idx) {
      if (!c.territory) return;
      const numCities = 2 + (idx % 2);
      for (let ci = 0; ci < numCities; ci++) {
        const isCapital = (ci === 0);
        const spread    = CITY_SPREAD[ci % CITY_SPREAD.length];
        const cityData  = {
          id:         'city_' + c.id + '_' + ci,
          name:       isCapital ? c.name + ' Kinh Thành' : c.name + ' Thành ' + ci,
          type:       isCapital ? 'capital' : 'city',
          population: Math.floor((c.population || 50000) / numCities),
          countryId:  c.id,
          territory:  c.territory,
        };
        const mesh = buildCityMesh(cityData);
        if (!mesh) return;
        // Offset near country but slightly different angle
        const offX = spread.dx * 1.2 + (isCapital ? 0 : jitter(0.4));
        const offZ = spread.dy * 1.2 + (isCapital ? 0 : jitter(0.4));
        placeBuilding('city_' + cityData.id, mesh, c.territory, offX, offZ);
      }
    });

    console.log('[CVS] Buildings placed — sects:' + liveSects.length +
      ' countries:' + liveCountries.length +
      ' meshes:' + Object.keys(CVS.buildingMeshes).length);
  }

  // ============================================================
  // ANIMATION TICK — gentle floating + flag wave
  // ============================================================
  function tickAnimation() {
    if (typeof wv3d === 'undefined' || !wv3d.initialized) return;
    const elapsed = wv3d.clock ? wv3d.clock.elapsedTime : (Date.now() / 1000);

    Object.values(CVS.buildingMeshes).forEach(function(mesh) {
      const ud    = mesh.userData;
      const phase = elapsed * 1.1 + (ud.animPhase || 0);

      // Gentle vertical float
      mesh.position.y = (ud.baseY || 0) + Math.sin(phase * 0.7) * 0.04;

      // Slow rotation for sect spirit pillar orbs / country flags
      if (ud.type === 'sect') {
        mesh.rotation.y += 0.002;
      } else if (ud.type === 'country') {
        // Flag banner wave via scale
        mesh.children.forEach(function(c) {
          if (c.geometry && c.geometry.type === 'PlaneGeometry') {
            c.scale.x = 1 + Math.sin(elapsed * 3 + (ud.animPhase || 0)) * 0.12;
          }
        });
      }
    });
  }

  // ============================================================
  // CLICK HANDLER — show building info in wv3d-info panel
  // ============================================================
  function hookBuildingClick() {
    if (typeof wv3d === 'undefined') return;
    const canvas = wv3d.renderer && wv3d.renderer.domElement;
    if (!canvas) return;

    canvas.addEventListener('click', function(e) {
      if (typeof THREE === 'undefined' || !wv3d.camera) return;
      const rect = canvas.getBoundingClientRect();
      const mx   =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      const my   = -((e.clientY - rect.top)  / rect.height) * 2 + 1;

      const ray = new THREE.Raycaster();
      ray.setFromCamera(new THREE.Vector2(mx, my), wv3d.camera);

      const meshArr = [];
      Object.values(CVS.buildingMeshes).forEach(function(g) {
        g.children.forEach(function(c) {
          if (c.isMesh) { c._bldGroup = g; meshArr.push(c); }
        });
      });

      const hits = ray.intersectObjects(meshArr, false);
      if (hits.length > 0) {
        const grp = hits[0].object._bldGroup;
        if (grp) {
          showBuildingInfo(grp.userData);
          e.stopPropagation();
        }
      }
    }, true);
  }

  function showBuildingInfo(ud) {
    const panel = document.getElementById('wv3d-info');
    if (!panel) return;

    const d = ud.data || {};
    let html = '';

    if (ud.type === 'city') {
      html = [
        infoHeader(ud.isCapital ? '🏯' : '🏰', d.name, ud.label, '#60a5fa'),
        infoGrid([
          infoStat('👥', 'Dân số',  fmtNum(d.population), '#4ade80'),
          infoStat('🗺️', 'Lãnh địa', d.territory || '—',  '#f97316'),
        ]),
      ].join('');
    } else if (ud.type === 'sect') {
      html = [
        infoHeader('⛩️', d.name, ud.label, '#c084fc'),
        infoGrid([
          infoStat('✨', 'Uy Danh',  fmtNum(d.prestige),          '#facc15'),
          infoStat('📚', 'Cấp độ',   'Cấp ' + (d.level || 1),     '#4ade80'),
          infoStat('👥', 'Môn đồ',   (d.members||[]).length + ' người', '#60a5fa'),
          infoStat('💰', 'Ngân khố', fmtNum(d.treasury),          '#fb923c'),
          infoStat('🗺️', 'Vùng',     d.territory || '—',          '#f97316'),
        ]),
      ].join('');
    } else if (ud.type === 'country') {
      html = [
        infoHeader('🏛️', d.name, ud.label, '#fbbf24'),
        infoGrid([
          infoStat('👥', 'Dân số',    fmtNum(d.population),  '#4ade80'),
          infoStat('💰', 'Tài phú',   fmtNum(d.wealth),      '#facc15'),
          infoStat('⚔️', 'Quân đội',  fmtNum(d.army),        '#f87171'),
          infoStat('🏭', 'Kinh tế',   fmtNum(d.economy),     '#fb923c'),
          infoStat('🔬', 'KH-KT',     'Cấp ' + (d.technology||1), '#60a5fa'),
          infoStat('🗺️', 'Lãnh thổ',  d.territory || '—',    '#f97316'),
        ]),
      ].join('');
    }

    if (!html) return;
    panel.innerHTML = html;
    panel.style.display   = 'block';
    panel.style.opacity   = '0';
    panel.style.transform = 'translateY(8px)';
    requestAnimationFrame(function() {
      panel.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      panel.style.opacity    = '1';
      panel.style.transform  = 'translateY(0)';
    });
  }

  function infoHeader(icon, name, label, color) {
    return [
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">',
        '<div>',
          '<span style="font-size:18px;">' + icon + '</span>',
          '<span style="font-weight:700;font-size:13px;color:' + color + ';margin-left:6px;">' + name + '</span>',
        '</div>',
        '<div style="display:flex;align-items:center;gap:6px;">',
          '<span style="font-size:10px;background:rgba(255,255,255,0.07);border-radius:4px;padding:2px 6px;color:#94a3b8;">' + label + '</span>',
          '<button onclick="window.wv3dCloseInfo()" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:15px;">✕</button>',
        '</div>',
      '</div>',
    ].join('');
  }

  function infoGrid(stats) {
    return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;">' +
      stats.join('') + '</div>';
  }

  function infoStat(icon, label, val, color) {
    return [
      '<div style="background:rgba(255,255,255,0.04);border-radius:6px;padding:5px;text-align:center;">',
        '<div style="font-size:12px;">' + icon + '</div>',
        '<div style="font-size:9px;color:#475569;margin-top:1px;">' + label + '</div>',
        '<div style="font-size:11px;font-weight:700;color:' + color + ';margin-top:1px;">' + val + '</div>',
      '</div>',
    ].join('');
  }

  function fmtNum(n) {
    if (!n && n !== 0) return '—';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }

  // ============================================================
  // MAIN INIT
  // ============================================================
  window.initCityVisualization = function(retryCount) {
    retryCount = retryCount || 0;
    if (CVS.initialized) return;

    if (typeof wv3d === 'undefined' || !wv3d || !wv3d.initialized ||
        !wv3d.meshes || !wv3d.meshes.length) {
      if (retryCount < 30) {
        setTimeout(function() { window.initCityVisualization(retryCount + 1); }, 400);
      }
      return;
    }

    buildAll();
    hookBuildingClick();

    // Animation tick
    if (CVS.tickInterval) clearInterval(CVS.tickInterval);
    CVS.tickInterval = setInterval(tickAnimation, CVS.TICK_MS);

    CVS.initialized = true;
    console.log('[CVS] City Visualization initialized');
  };

  // ============================================================
  // REFRESH — call after world changes
  // ============================================================
  window.refreshCityVisualization = function() {
    if (!CVS.initialized) {
      window.initCityVisualization();
      return;
    }
    buildAll();
  };

  // ============================================================
  // DESTROY
  // ============================================================
  window.destroyCityVisualization = function() {
    if (CVS.tickInterval) { clearInterval(CVS.tickInterval); CVS.tickInterval = null; }
    if (typeof wv3d !== 'undefined' && wv3d.scene) {
      Object.values(CVS.buildingMeshes).forEach(function(m) { wv3d.scene.remove(m); });
    }
    CVS.buildingMeshes = {};
    CVS.initialized    = false;
  };

  // ============================================================
  // PUBLIC API
  // ============================================================
  window.cityVisualization = CVS;

  // ============================================================
  // AUTO-HOOKS
  // ============================================================
  const _origInitWV3D = window.initWorldViewer3D;
  window.initWorldViewer3D = function() {
    if (typeof _origInitWV3D === 'function') _origInitWV3D.apply(this, arguments);
    setTimeout(function() { window.initCityVisualization(); }, 1200);
  };

  const _origRefreshWV3D = window.refreshWorldViewer3D;
  window.refreshWorldViewer3D = function() {
    if (typeof _origRefreshWV3D === 'function') _origRefreshWV3D.apply(this, arguments);
    setTimeout(function() {
      CVS.initialized = false;
      window.initCityVisualization();
    }, 900);
  };

})();
