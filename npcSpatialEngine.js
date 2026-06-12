/* ============================================================
   NPC SPATIAL ENGINE — npcSpatialEngine.js
   Creator God V6 — NPC 3D presence on World Viewer map
   - Mỗi NPC có position, modelType, animationState
   - NPC hiển thị trên bản đồ 3D (tích hợp worldViewer3D)
   - NPC tự di chuyển giữa các territory
   KHÔNG phá worldViewer3D.js
   ============================================================ */

(function() {
  'use strict';

  // ============================================================
  // SPATIAL STATE
  // ============================================================
  const NSE = {
    spatialMap: {},        // npcId -> spatialData
    npcMeshes:  {},        // npcId -> THREE.Group
    territoryPositions: [],// [{id,name,x,y,z}]
    tickInterval:  null,
    moveInterval:  null,
    initialized:   false,
    lastTickTime:  0,
    MAX_VISIBLE_NPCS: 60,
    MOVE_INTERVAL_MS: 5000, // NPC decision tick (ms)
    TICK_MS:          50,   // animation frame (ms)
    MOVE_SPEED:       1.4,  // world-units per second
  };

  // ============================================================
  // MODEL TYPES
  // realm 0-1→mortal, 2-3→adept, 4-5→elder, 6-7→immortal, 8+→god
  // ============================================================
  const MODEL_COLORS = {
    mortal:   { body: 0x94a3b8, glow: 0x334155, scale: 0.18 },
    adept:    { body: 0x4ade80, glow: 0x166534, scale: 0.20 },
    elder:    { body: 0x60a5fa, glow: 0x1e40af, scale: 0.22 },
    immortal: { body: 0xfacc15, glow: 0x854d0e, scale: 0.26 },
    god:      { body: 0xc084fc, glow: 0x581c87, scale: 0.30 },
  };

  const ANIM_STATES = {
    IDLE:      'idle',
    WALK:      'walk',
    CULTIVATE: 'cultivate',
    FIGHT:     'fight',
    FLY:       'fly',
  };

  // ============================================================
  // HELPERS
  // ============================================================
  function getModelType(npc) {
    const r = npc.realm || 0;
    if (r >= 8) return 'god';
    if (r >= 6) return 'immortal';
    if (r >= 4) return 'elder';
    if (r >= 2) return 'adept';
    return 'mortal';
  }

  function getIdleAnim(npc) {
    if (!npc || npc.status !== 'alive') return ANIM_STATES.IDLE;
    if ((npc.realm || 0) >= 5) return ANIM_STATES.FLY;
    const r = Math.random();
    if (r < 0.4) return ANIM_STATES.CULTIVATE;
    return ANIM_STATES.IDLE;
  }

  function randomOffset(radius) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * radius;
    return { x: Math.cos(a) * r, z: Math.sin(a) * r };
  }

  // ============================================================
  // SYNC TERRITORY POSITIONS FROM worldViewer3D meshes
  // ============================================================
  function syncTerritoryPositions() {
    NSE.territoryPositions = [];
    if (typeof wv3d === 'undefined' || !wv3d || !wv3d.meshes) return;
    wv3d.meshes.forEach(function(group) {
      const t = group.userData && group.userData.territory;
      if (t) {
        NSE.territoryPositions.push({
          id:   t.id,
          name: t.name,
          region: t.region,
          x:    group.position.x,
          y:    group.position.y,
          z:    group.position.z,
        });
      }
    });
  }

  function getTerritoryPos(territoryId) {
    return NSE.territoryPositions.find(function(p) { return p.id === territoryId; }) || null;
  }

  // Match NPC to a territory: prefer same region, fallback to random
  function getNPCStartTerritory(npc) {
    if (!NSE.territoryPositions.length) return null;
    // Find territories in same region
    const sameRegion = NSE.territoryPositions.filter(function(tp) {
      return tp.region === npc.region;
    });
    const pool = sameRegion.length ? sameRegion : NSE.territoryPositions;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ============================================================
  // INIT SPATIAL DATA FOR ALL NPCS
  // ============================================================
  function initSpatialData() {
    const liveNPCs = getLiveNPCs();

    liveNPCs.forEach(function(npc) {
      if (!NSE.spatialMap[npc.id]) {
        const tp  = getNPCStartTerritory(npc);
        const off = randomOffset(1.8);
        NSE.spatialMap[npc.id] = {
          position: {
            x: tp ? tp.x + off.x : (Math.random() - 0.5) * 20,
            y: 0,
            z: tp ? tp.z + off.z : (Math.random() - 0.5) * 20,
          },
          modelType:          getModelType(npc),
          animationState:     getIdleAnim(npc),
          currentTerritoryId: tp ? tp.id : null,
          // movement
          moveTarget:   null,  // {x, z, id} when moving
          moveStartX:   0,
          moveStartZ:   0,
          moveDuration: 0,     // seconds
          moveElapsed:  0,     // seconds
          // animation
          animPhase:    Math.random() * Math.PI * 2,
        };
      } else {
        // Sync modelType if realm changed
        NSE.spatialMap[npc.id].modelType = getModelType(npc);
      }
    });

    // Clean up dead NPCs
    Object.keys(NSE.spatialMap).forEach(function(id) {
      if (!liveNPCs.find(function(n) { return String(n.id) === String(id); })) {
        delete NSE.spatialMap[id];
      }
    });
  }

  function getLiveNPCs() {
    if (typeof npcs === 'undefined') return [];
    return npcs.filter(function(n) { return n.status === 'alive'; })
               .slice(0, NSE.MAX_VISIBLE_NPCS);
  }

  // ============================================================
  // BUILD THREE.JS MESH FOR ONE NPC
  // ============================================================
  function buildNPCMesh(npc, spatial) {
    if (typeof THREE === 'undefined') return null;

    const cfg   = MODEL_COLORS[spatial.modelType] || MODEL_COLORS.mortal;
    const s     = cfg.scale;
    const group = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color:             cfg.body,
      emissive:          cfg.glow,
      emissiveIntensity: 0.4,
      roughness:         0.5,
      metalness:         0.2,
    });

    // Body
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(s * 0.4, s * 0.4, s * 1.2, 8),
      bodyMat
    );
    body.castShadow = true;
    group.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(s * 0.35, 8, 6), bodyMat);
    head.position.y = s * 0.9;
    group.add(head);

    // Aura for immortal/god
    if (spatial.modelType === 'immortal' || spatial.modelType === 'god') {
      const aura = new THREE.Mesh(
        new THREE.SphereGeometry(s * 0.9, 8, 6),
        new THREE.MeshStandardMaterial({
          color: cfg.body, emissive: cfg.body, emissiveIntensity: 0.8,
          transparent: true, opacity: 0.18, depthWrite: false,
        })
      );
      aura.position.y = s * 0.3;
      group.add(aura);
    }

    // Point light for gods
    if (spatial.modelType === 'god') {
      const ptl = new THREE.PointLight(cfg.body, 0.8, 3.5);
      ptl.position.y = s;
      group.add(ptl);
    }

    group.position.set(spatial.position.x, 0.15, spatial.position.z);
    group.userData = {
      npcId:   npc.id,
      isNPC:   true,
      spatial: spatial,
      npcRef:  npc,
    };

    return group;
  }

  // ============================================================
  // ADD / REMOVE NPC MESHES FROM SCENE
  // ============================================================
  function addNPCsToScene() {
    if (typeof wv3d === 'undefined' || !wv3d.scene || !wv3d.initialized) return;

    const liveNPCs = getLiveNPCs();
    const liveIds  = new Set(liveNPCs.map(function(n) { return String(n.id); }));

    // Remove stale meshes
    Object.keys(NSE.npcMeshes).forEach(function(id) {
      if (!liveIds.has(id)) {
        wv3d.scene.remove(NSE.npcMeshes[id]);
        delete NSE.npcMeshes[id];
      }
    });

    // Add missing meshes
    liveNPCs.forEach(function(npc) {
      const id = String(npc.id);
      if (NSE.npcMeshes[id]) return;
      const spatial = NSE.spatialMap[id];
      if (!spatial) return;
      const mesh = buildNPCMesh(npc, spatial);
      if (mesh) {
        wv3d.scene.add(mesh);
        NSE.npcMeshes[id] = mesh;
      }
    });
  }

  // ============================================================
  // MOVEMENT DECISION — runs every MOVE_INTERVAL_MS
  // Each NPC has ~40% chance to start moving to another territory
  // ============================================================
  function tickMovement() {
    if (!NSE.territoryPositions.length) {
      // Territories not loaded yet — try to sync
      syncTerritoryPositions();
      if (!NSE.territoryPositions.length) return;
    }

    const liveNPCs = getLiveNPCs();

    liveNPCs.forEach(function(npc) {
      const id = String(npc.id);
      const sp = NSE.spatialMap[id];
      if (!sp || sp.moveTarget) return; // already moving

      if (Math.random() > 0.4) return; // 40% chance to move

      // Pick a different territory
      const others = NSE.territoryPositions.filter(function(tp) {
        return tp.id !== sp.currentTerritoryId;
      });
      if (!others.length) return;

      const dest = others[Math.floor(Math.random() * others.length)];
      const off  = randomOffset(1.5);
      const tx   = dest.x + off.x;
      const tz   = dest.z + off.z;

      // Compute travel time based on distance and speed
      const dx   = tx - sp.position.x;
      const dz   = tz - sp.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const dur  = Math.max(0.5, dist / NSE.MOVE_SPEED); // seconds

      sp.moveTarget   = { x: tx, z: tz, id: dest.id };
      sp.moveStartX   = sp.position.x;
      sp.moveStartZ   = sp.position.z;
      sp.moveDuration = dur;
      sp.moveElapsed  = 0;
      sp.animationState = (npc.realm || 0) >= 5 ? ANIM_STATES.FLY : ANIM_STATES.WALK;
    });
  }

  // ============================================================
  // ANIMATION TICK — smooth lerp + bobbing (runs every TICK_MS)
  // Uses real dt so motion is frame-rate independent
  // ============================================================
  function tickAnimation() {
    if (typeof wv3d === 'undefined' || !wv3d.initialized) return;

    const now = Date.now();
    const dt  = Math.min((now - (NSE.lastTickTime || now)) / 1000, 0.1); // seconds, capped at 100ms
    NSE.lastTickTime = now;

    const elapsed = wv3d.clock ? wv3d.clock.elapsedTime : (now / 1000);

    Object.keys(NSE.npcMeshes).forEach(function(id) {
      const mesh = NSE.npcMeshes[id];
      const sp   = NSE.spatialMap[id];
      if (!mesh || !sp) return;

      // ── Move toward target using linear interpolation over moveDuration ──
      if (sp.moveTarget) {
        sp.moveElapsed += dt;
        const t = Math.min(sp.moveElapsed / sp.moveDuration, 1.0);

        sp.position.x = sp.moveStartX + (sp.moveTarget.x - sp.moveStartX) * t;
        sp.position.z = sp.moveStartZ + (sp.moveTarget.z - sp.moveStartZ) * t;

        if (t >= 1.0) {
          // Arrived
          sp.position.x         = sp.moveTarget.x;
          sp.position.z         = sp.moveTarget.z;
          sp.currentTerritoryId = sp.moveTarget.id;
          sp.moveTarget         = null;
          sp.animationState     = getIdleAnim(
            getLiveNPCs().find(function(n) { return String(n.id) === id; }) || {}
          );
        }
      }

      // ── Push position to mesh ──
      mesh.position.x = sp.position.x;
      mesh.position.z = sp.position.z;

      // ── Bobbing / flying Y ──
      const phase = elapsed * 2.2 + (sp.animPhase || 0);
      if (sp.animationState === ANIM_STATES.FLY) {
        mesh.position.y = 0.8 + Math.sin(phase) * 0.25;
        mesh.rotation.y += dt * 0.8;
      } else if (sp.animationState === ANIM_STATES.CULTIVATE) {
        mesh.position.y = 0.12 + Math.sin(phase * 0.5) * 0.06;
        mesh.rotation.y += dt * 0.3;
      } else if (sp.animationState === ANIM_STATES.WALK) {
        mesh.position.y = 0.12 + Math.abs(Math.sin(phase * 3)) * 0.05;
        // Face direction of travel
        if (sp.moveTarget) {
          const dx = sp.moveTarget.x - sp.position.x;
          const dz = sp.moveTarget.z - sp.position.z;
          if (dx * dx + dz * dz > 0.0001) {
            mesh.rotation.y = Math.atan2(dx, dz);
          }
        }
      } else {
        mesh.position.y = 0.12 + Math.sin(phase * 0.8) * 0.03;
      }

      // ── Scale pulse for immortal/god ──
      if (sp.modelType === 'god' || sp.modelType === 'immortal') {
        const pulse = 1 + Math.sin(phase * 1.5) * 0.06;
        mesh.scale.set(pulse, pulse, pulse);
      }
    });
  }

  // ============================================================
  // NPC CLICK — shows info panel
  // ============================================================
  function hookNPCClick() {
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

      const npcMeshArr = [];
      Object.values(NSE.npcMeshes).forEach(function(g) {
        g.children.forEach(function(c) {
          if (c.isMesh) { c._npcGroup = g; npcMeshArr.push(c); }
        });
      });

      const hits = ray.intersectObjects(npcMeshArr);
      if (hits.length > 0) {
        const grp = hits[0].object._npcGroup;
        if (grp && grp.userData.npcRef) {
          showNPCSpatialInfo(grp.userData.npcRef, grp.userData.spatial);
          e.stopPropagation();
        }
      }
    }, true);
  }

  function showNPCSpatialInfo(npc, sp) {
    const panel = document.getElementById('wv3d-info');
    if (!panel) return;

    const realmName  = (typeof REALMS !== 'undefined' && REALMS[npc.realm || 0])
      ? REALMS[npc.realm || 0].name : ('Cảnh giới ' + (npc.realm || 0));
    const animLabel  = {
      idle:      '🧘 Nghỉ ngơi',
      walk:      '🚶 Di chuyển',
      cultivate: '✨ Tu luyện',
      fight:     '⚔️ Chiến đấu',
      fly:       '🌟 Phi hành',
    }[sp.animationState] || '—';
    const modelLabel = {
      mortal:   '⚪ Phàm Nhân',
      adept:    '🟢 Tu Sĩ',
      elder:    '🔵 Trưởng Lão',
      immortal: '🟡 Tiên Nhân',
      god:      '🟣 Thần Linh',
    }[sp.modelType] || sp.modelType;

    const tp    = NSE.territoryPositions.find(function(t) { return t.id === sp.currentTerritoryId; });
    const tName = tp ? tp.name : (npc.region || '—');
    const tRegion = tp ? tp.region : '';

    panel.innerHTML = [
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">',
        '<span style="font-weight:700;font-size:14px;color:#60a5fa;">👤 ' + npc.name + '</span>',
        '<button onclick="window.wv3dCloseInfo()" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:15px;">✕</button>',
      '</div>',
      '<div style="font-size:11px;color:#64748b;margin-bottom:10px;">' + (npc.gender || '') + ' · ' + (npc.family || '') + '</div>',
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;">',
        npcStat('⚡', 'Cảnh giới', realmName,            '#facc15'),
        npcStat('🎭', 'Model',     modelLabel,            '#94a3b8'),
        npcStat('🏃', 'Trạng thái', animLabel,           '#4ade80'),
        npcStat('📍', 'Lãnh địa',  tName,                '#f97316'),
        npcStat('🗺️', 'Vùng',      tRegion || npc.region || '—', '#a78bfa'),
        npcStat('❤️', 'HP',        (npc.hp || 0) + '/' + (npc.maxHp || 0), '#f87171'),
      '</div>',
      sp.moveTarget
        ? '<div style="font-size:11px;color:#60a5fa;background:rgba(96,165,250,0.1);border:1px solid rgba(96,165,250,0.3);border-radius:6px;padding:4px 8px;">🚀 Đang di chuyển sang lãnh địa khác...</div>'
        : '',
    ].join('');

    panel.style.display   = 'block';
    panel.style.opacity   = '0';
    panel.style.transform = 'translateY(8px)';
    requestAnimationFrame(function() {
      panel.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      panel.style.opacity    = '1';
      panel.style.transform  = 'translateY(0)';
    });
  }

  function npcStat(icon, label, val, color) {
    return [
      '<div style="background:rgba(255,255,255,0.04);border-radius:6px;padding:6px;text-align:center;">',
        '<div style="font-size:13px;">' + icon + '</div>',
        '<div style="font-size:10px;color:#475569;margin-top:1px;">' + label + '</div>',
        '<div style="font-size:11px;font-weight:700;color:' + color + ';margin-top:1px;">' + val + '</div>',
      '</div>',
    ].join('');
  }

  // ============================================================
  // NPC COUNT OVERLAY
  // ============================================================
  function updateNPCCountOverlay() {
    const el = document.getElementById('wv3d-npc-count');
    if (!el) return;

    // Remove meshes for NPCs that died since last tick
    if (typeof wv3d !== 'undefined' && wv3d.scene) {
      const liveIds = new Set(getLiveNPCs().map(function(n) { return String(n.id); }));
      Object.keys(NSE.npcMeshes).forEach(function(id) {
        if (!liveIds.has(id)) {
          wv3d.scene.remove(NSE.npcMeshes[id]);
          delete NSE.npcMeshes[id];
          delete NSE.spatialMap[id];
        }
      });
    }

    const total = (typeof npcs !== 'undefined') ? npcs.filter(function(n) { return n.status === 'alive'; }).length : 0;
    const shown = Object.keys(NSE.npcMeshes).length;
    // "60 NPC" nếu shown == total; "60/68 NPC" nếu bị cap MAX_VISIBLE_NPCS
    el.textContent = '👤 ' + shown + (total > shown ? '/' + total : '') + ' NPC';
  }

  // ============================================================
  // LEGEND OVERLAY
  // ============================================================
  function injectNPCLegend() {
    if (document.getElementById('wv3d-npc-legend')) return;
    const legend = document.createElement('div');
    legend.id = 'wv3d-npc-legend';
    legend.style.cssText = [
      'position:absolute;top:60px;left:12px;',
      'background:rgba(10,10,26,0.85);',
      'border:1px solid rgba(255,255,255,0.08);',
      'border-radius:10px;padding:10px 12px;',
      'font-size:11px;color:#94a3b8;',
      'z-index:5;backdrop-filter:blur(6px);',
      'min-width:130px;',
    ].join('');
    legend.innerHTML = [
      '<div style="font-weight:700;color:#e2e8f0;margin-bottom:6px;font-size:12px;">NPC Model</div>',
      '<div style="display:flex;flex-direction:column;gap:4px;">',
        legendRow('⚪', '#94a3b8', 'Phàm Nhân',  'Cảnh 0-1'),
        legendRow('🟢', '#4ade80', 'Tu Sĩ',      'Cảnh 2-3'),
        legendRow('🔵', '#60a5fa', 'Trưởng Lão', 'Cảnh 4-5'),
        legendRow('🟡', '#facc15', 'Tiên Nhân',  'Cảnh 6-7'),
        legendRow('🟣', '#c084fc', 'Thần Linh',  'Cảnh 8+'),
      '</div>',
    ].join('');
    const container = document.getElementById('wv3d-container');
    if (container) container.appendChild(legend);
  }

  function legendRow(icon, color, label, sub) {
    return '<div style="display:flex;align-items:center;gap:6px;">' +
      '<span>' + icon + '</span>' +
      '<span style="color:' + color + ';font-weight:600;">' + label + '</span>' +
      '<span style="color:#475569;font-size:10px;">(' + sub + ')</span>' +
      '</div>';
  }

  // ============================================================
  // MAIN INIT
  // ============================================================
  window.initNPCSpatialEngine = function(retryCount) {
    retryCount = retryCount || 0;
    if (NSE.initialized) return;

    // Wait for wv3d AND its meshes to be ready
    if (typeof wv3d === 'undefined' || !wv3d || !wv3d.initialized ||
        !wv3d.meshes || !wv3d.meshes.length) {
      if (retryCount < 30) {
        setTimeout(function() { window.initNPCSpatialEngine(retryCount + 1); }, 400);
      }
      return;
    }

    syncTerritoryPositions();

    if (!NSE.territoryPositions.length) {
      // Meshes exist but no territory userData yet — retry
      if (retryCount < 30) {
        setTimeout(function() { window.initNPCSpatialEngine(retryCount + 1); }, 400);
      }
      return;
    }

    initSpatialData();
    addNPCsToScene();
    hookNPCClick();
    injectNPCLegend();

    NSE.lastTickTime = Date.now();

    // Start movement decision timer
    if (NSE.moveInterval) clearInterval(NSE.moveInterval);
    NSE.moveInterval = setInterval(tickMovement, NSE.MOVE_INTERVAL_MS);

    // Start animation timer
    if (NSE.tickInterval) clearInterval(NSE.tickInterval);
    NSE.tickInterval = setInterval(function() {
      tickAnimation();
      updateNPCCountOverlay();
    }, NSE.TICK_MS);

    NSE.initialized = true;
    updateNPCCountOverlay();
    console.log('[NSE] NPC Spatial Engine initialized — ' +
      Object.keys(NSE.spatialMap).length + ' NPCs, ' +
      NSE.territoryPositions.length + ' territories');
  };

  // ============================================================
  // REFRESH — call when NPCs re-generated or world changes
  // ============================================================
  window.refreshNPCSpatialEngine = function() {
    if (!NSE.initialized) {
      window.initNPCSpatialEngine();
      return;
    }
    // Re-sync territories (mesh positions may have changed on world refresh)
    syncTerritoryPositions();
    initSpatialData();
    addNPCsToScene();
    updateNPCCountOverlay();
  };

  // ============================================================
  // FORCE SYNC — Sync NPC button
  // ============================================================
  window.forceSyncNPCSpatialEngine = function() {
    if (typeof wv3d === 'undefined' || !wv3d || !wv3d.scene || !wv3d.initialized) {
      if (typeof toast === 'function') toast('⚠️ 3D Viewer chưa sẵn sàng, thử lại sau...');
      setTimeout(window.forceSyncNPCSpatialEngine, 800);
      return;
    }
    // Full teardown + reinit
    if (NSE.moveInterval) { clearInterval(NSE.moveInterval); NSE.moveInterval = null; }
    if (NSE.tickInterval) { clearInterval(NSE.tickInterval); NSE.tickInterval = null; }
    Object.keys(NSE.npcMeshes).forEach(function(id) {
      wv3d.scene.remove(NSE.npcMeshes[id]);
    });
    NSE.npcMeshes  = {};
    NSE.spatialMap = {};
    NSE.initialized = false;
    window.initNPCSpatialEngine();
  };

  // ============================================================
  // DESTROY
  // ============================================================
  window.destroyNPCSpatialEngine = function() {
    if (NSE.moveInterval) { clearInterval(NSE.moveInterval); NSE.moveInterval = null; }
    if (NSE.tickInterval) { clearInterval(NSE.tickInterval); NSE.tickInterval = null; }
    if (typeof wv3d !== 'undefined' && wv3d.scene) {
      Object.values(NSE.npcMeshes).forEach(function(m) { wv3d.scene.remove(m); });
    }
    NSE.npcMeshes   = {};
    NSE.spatialMap  = {};
    NSE.initialized = false;
    const leg = document.getElementById('wv3d-npc-legend');
    if (leg) leg.remove();
  };

  // ============================================================
  // PUBLIC API
  // ============================================================
  window.npcSpatialEngine = NSE;

  // ============================================================
  // AUTO-HOOK: patch initWorldViewer3D → start NSE after it's ready
  // ============================================================
  const _origInitWV3D = window.initWorldViewer3D;
  window.initWorldViewer3D = function() {
    if (typeof _origInitWV3D === 'function') _origInitWV3D.apply(this, arguments);
    // Wait for Three.js CDN + mesh build; initNPCSpatialEngine will retry
    // itself until wv3d.meshes.length > 0
    setTimeout(function() { window.initNPCSpatialEngine(); }, 1000);
  };

  // Patch refreshWorldViewer3D
  const _origRefreshWV3D = window.refreshWorldViewer3D;
  window.refreshWorldViewer3D = function() {
    if (typeof _origRefreshWV3D === 'function') _origRefreshWV3D.apply(this, arguments);
    // Meshes are rebuilt; wait then refresh NSE
    setTimeout(function() { window.refreshNPCSpatialEngine(); }, 800);
  };

  // Hook generateNPCs so new NPCs appear in 3D view
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      if (typeof generateNPCs === 'function') {
        const _orig = generateNPCs;
        window.generateNPCs = function() {
          _orig.apply(this, arguments);
          setTimeout(window.refreshNPCSpatialEngine, 300);
        };
      }
    }, 1000);
  });

})();
