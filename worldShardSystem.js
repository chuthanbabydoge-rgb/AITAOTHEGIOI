// ============================================================
// WORLD SHARD SYSTEM V85
// Creator God V6 — Cloud Scale Pass
// World Isolation · Multi Tenant · Shard Lifecycle
// Init: 22900ms | Save: cgv6_world_shard_v85
// ONLY EXTENDS — không xóa, không thay thế bất kỳ engine nào
// ============================================================

(function() {
  'use strict';

  const SAVE_KEY = 'cgv6_world_shard_v85';
  const VERSION  = 'V85';

  // ── Isolation Levels ──────────────────────────────────────
  const WSS85_ISOLATION = {
    SOFT:   { id: 'SOFT',   label: 'Soft Isolation',   tier: ['FREE'],           workerSeparated: false, sandboxed: false },
    MEDIUM: { id: 'MEDIUM', label: 'Medium Isolation',  tier: ['CREATOR'],        workerSeparated: true,  sandboxed: false },
    HARD:   { id: 'HARD',   label: 'Hard Isolation',    tier: ['MASTER'],         workerSeparated: true,  sandboxed: true  },
    DIVINE: { id: 'DIVINE', label: 'Divine Isolation',  tier: ['DIVINE'],         workerSeparated: true,  sandboxed: true  },
  };

  // ── Tenant Tiers ──────────────────────────────────────────
  const WSS85_TIERS = {
    FREE:    { maxWorlds: 1,   maxNPCs: 50,   aiPerDay: 10,  storageBytes: 10485760,  isolation: 'SOFT'   },
    CREATOR: { maxWorlds: 5,   maxNPCs: 200,  aiPerDay: 100, storageBytes: 52428800,  isolation: 'MEDIUM' },
    MASTER:  { maxWorlds: 20,  maxNPCs: 500,  aiPerDay: 500, storageBytes: 524288000, isolation: 'HARD'   },
    DIVINE:  { maxWorlds: 100, maxNPCs: 2000, aiPerDay: -1,  storageBytes: -1,        isolation: 'DIVINE' },
  };

  // ── Region Definitions ────────────────────────────────────
  const WSS85_REGIONS = {
    'REGION-AS': { label: 'Asia (Primary)',  latencyTarget: 50,  worldCapacity: 10000, status: 'ONLINE' },
    'REGION-EU': { label: 'Europe',          latencyTarget: 80,  worldCapacity: 8000,  status: 'ONLINE' },
    'REGION-AP': { label: 'Asia-Pacific',    latencyTarget: 60,  worldCapacity: 8000,  status: 'ONLINE' },
  };

  // ── Shard States ──────────────────────────────────────────
  const WSS85_SHARD_STATES = {
    PROVISIONING: 'PROVISIONING',
    ACTIVE:       'ACTIVE',
    SUSPENDED:    'SUSPENDED',
    MIGRATING:    'MIGRATING',
    TERMINATED:   'TERMINATED',
  };

  // ── Internal State ────────────────────────────────────────
  let _data = {
    version: VERSION,
    initialized: false,
    shards: {},          // shardId → ShardRecord
    tenants: {},         // tenantId → TenantRecord
    regions: {},         // regionId → RegionHealth
    crossShardQueue: [], // pending cross-shard events
    stats: {
      totalShards: 0,
      activeShards: 0,
      totalTenants: 0,
      crossShardEvents: 0,
      quotaViolations: 0,
      lastTick: 0,
    },
    log: [],
  };

  // ── Utility ───────────────────────────────────────────────
  function _uid() {
    return 'shard_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
  }

  function _tenantUid() {
    return 'tenant_' + Math.random().toString(36).substr(2, 9);
  }

  function _now() {
    return Date.now();
  }

  function _log(msg, level) {
    const entry = { ts: _now(), msg, level: level || 'INFO' };
    _data.log.unshift(entry);
    if (_data.log.length > 200) _data.log.length = 200;
    if (window.htAddEvent) {
      window.htAddEvent('[WorldShard V85] ' + msg);
    }
  }

  function _save() {
    if (window.perfSave) {
      window.perfSave(SAVE_KEY, _data);
    } else {
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(_data)); } catch(e) {}
    }
  }

  function _load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === VERSION) {
          _data = Object.assign(_data, parsed);
        }
      }
    } catch(e) {}
  }

  // ── Region Health ──────────────────────────────────────────
  function _initRegions() {
    Object.keys(WSS85_REGIONS).forEach(function(rId) {
      _data.regions[rId] = Object.assign({}, WSS85_REGIONS[rId], {
        regionId: rId,
        worldCount: 0,
        tenantCount: 0,
        shardCount: 0,
        cpuLoad: Math.random() * 0.3 + 0.1,
        memoryUsage: Math.random() * 0.3 + 0.2,
        networkLatency: WSS85_REGIONS[rId].latencyTarget + Math.floor(Math.random() * 20 - 10),
        replicationLag: 0,
        lastHealthCheck: _now(),
      });
    });
  }

  function _updateRegionStats() {
    Object.keys(_data.regions).forEach(function(rId) {
      const region = _data.regions[rId];
      // Drift simulation — realistic fluctuation
      region.cpuLoad        = Math.max(0.05, Math.min(0.95, region.cpuLoad + (Math.random() - 0.5) * 0.02));
      region.memoryUsage    = Math.max(0.10, Math.min(0.95, region.memoryUsage + (Math.random() - 0.5) * 0.01));
      region.networkLatency = Math.max(5,    Math.min(500,  region.networkLatency + Math.floor((Math.random() - 0.5) * 5)));
      region.lastHealthCheck = _now();
      // Derive status from load
      if (region.cpuLoad > 0.90 || region.memoryUsage > 0.90) {
        region.status = 'DEGRADED';
      } else if (region.cpuLoad > 0.98) {
        region.status = 'OFFLINE';
      } else {
        region.status = 'ONLINE';
      }
      // Count shards/worlds per region
      let sc = 0, wc = 0;
      Object.values(_data.shards).forEach(function(sh) {
        if (sh.region === rId && sh.state === WSS85_SHARD_STATES.ACTIVE) { sc++; wc++; }
      });
      region.shardCount = sc;
      region.worldCount = wc;
    });
  }

  // ── Tenant Management ─────────────────────────────────────
  function wss85CreateTenant(opts) {
    opts = opts || {};
    const tier      = opts.tier      || 'FREE';
    const region    = opts.region    || 'REGION-AS';
    const creatorId = opts.creatorId || (window.world && window.world.creatorId) || 'local_creator';

    if (!WSS85_TIERS[tier]) {
      console.warn('[WSS85] Unknown tier:', tier);
      return null;
    }

    const tenantId = _tenantUid();
    const tierCfg  = WSS85_TIERS[tier];

    _data.tenants[tenantId] = {
      tenantId,
      creatorId,
      tier,
      region,
      quota: {
        maxWorlds:      tierCfg.maxWorlds,
        maxNPCsPerWorld: tierCfg.maxNPCs,
        aiCallsPerDay:   tierCfg.aiPerDay,
        aiCallsUsedToday: 0,
        aiResetDate:     new Date().toDateString(),
        storageBytes:    tierCfg.storageBytes,
        storageUsed:     0,
      },
      worlds:    [],
      shards:    [],
      isolation: tierCfg.isolation,
      createdAt: _now(),
      lastActiveAt: _now(),
    };

    _data.stats.totalTenants++;
    _log('Tenant created: ' + tenantId + ' [' + tier + '] region=' + region);
    _save();
    return _data.tenants[tenantId];
  }

  function wss85GetTenant(tenantId) {
    return _data.tenants[tenantId] || null;
  }

  function wss85GetOrCreateDefaultTenant() {
    const keys = Object.keys(_data.tenants);
    if (keys.length > 0) return _data.tenants[keys[0]];
    return wss85CreateTenant({ tier: 'FREE', region: 'REGION-AS' });
  }

  function wss85UpgradeTenant(tenantId, newTier) {
    const tenant = _data.tenants[tenantId];
    if (!tenant) return false;
    if (!WSS85_TIERS[newTier]) return false;
    const tierCfg = WSS85_TIERS[newTier];
    tenant.tier = newTier;
    tenant.isolation = tierCfg.isolation;
    tenant.quota.maxWorlds = tierCfg.maxWorlds;
    tenant.quota.maxNPCsPerWorld = tierCfg.maxNPCs;
    tenant.quota.aiCallsPerDay   = tierCfg.aiPerDay;
    tenant.quota.storageBytes    = tierCfg.storageBytes;
    _log('Tenant upgraded: ' + tenantId + ' → ' + newTier);
    _save();
    return true;
  }

  // ── Quota Enforcement ─────────────────────────────────────
  function wss85CheckQuota(tenantId, resource, amount) {
    const tenant = _data.tenants[tenantId];
    if (!tenant) return { allowed: false, reason: 'Tenant not found' };
    const q = tenant.quota;
    amount = amount || 1;

    if (resource === 'world') {
      if (tenant.worlds.length >= q.maxWorlds) {
        _data.stats.quotaViolations++;
        return { allowed: false, reason: 'World quota exceeded (' + q.maxWorlds + ' max)' };
      }
    }
    if (resource === 'ai') {
      // Reset daily counter if date changed
      const today = new Date().toDateString();
      if (q.aiResetDate !== today) {
        q.aiCallsUsedToday = 0;
        q.aiResetDate = today;
      }
      if (q.aiCallsPerDay !== -1 && q.aiCallsUsedToday + amount > q.aiCallsPerDay) {
        _data.stats.quotaViolations++;
        return { allowed: false, reason: 'AI quota exceeded (' + q.aiCallsPerDay + '/day)' };
      }
      q.aiCallsUsedToday += amount;
    }
    if (resource === 'npc') {
      if (amount > q.maxNPCsPerWorld) {
        _data.stats.quotaViolations++;
        return { allowed: false, reason: 'NPC quota exceeded (' + q.maxNPCsPerWorld + ' max/world)' };
      }
    }
    return { allowed: true };
  }

  // ── Shard Lifecycle ───────────────────────────────────────
  function wss85ProvisionShard(opts) {
    opts = opts || {};
    const tenantId  = opts.tenantId  || null;
    const worldId   = opts.worldId   || (window.world && window.world.id) || 'world_local';
    const region    = opts.region    || 'REGION-AS';

    // Quota check
    if (tenantId) {
      const check = wss85CheckQuota(tenantId, 'world', 1);
      if (!check.allowed) {
        _log('Shard provision denied: ' + check.reason, 'WARN');
        return null;
      }
    }

    const shardId    = _uid();
    const tenant     = tenantId ? _data.tenants[tenantId] : null;
    const isolation  = tenant ? tenant.isolation : 'SOFT';

    const shard = {
      shardId,
      worldId,
      tenantId,
      region,
      isolation,
      state:       WSS85_SHARD_STATES.PROVISIONING,
      // Snapshot of world state at provision time (shallow)
      worldSnapshot: _captureWorldSnapshot(),
      npcCount:    (window.npcs || []).length,
      countryCount: (window.countries || []).length,
      saveNamespace: tenantId
        ? ('cgv6_t' + tenantId + '_w' + worldId + '_')
        : ('cgv6_local_w' + worldId + '_'),
      tickOffset:  0,
      aiCallsThisShard: 0,
      crossShardEvents: [],
      health: {
        score: 100,
        lastCheck: _now(),
        issues: [],
      },
      createdAt:   _now(),
      activatedAt: null,
      suspendedAt: null,
    };

    _data.shards[shardId] = shard;
    _data.stats.totalShards++;

    // Link to tenant
    if (tenant) {
      tenant.worlds.push(worldId);
      tenant.shards.push(shardId);
      tenant.lastActiveAt = _now();
    }

    // Transition to ACTIVE after brief provisioning
    setTimeout(function() {
      if (_data.shards[shardId]) {
        _data.shards[shardId].state = WSS85_SHARD_STATES.ACTIVE;
        _data.shards[shardId].activatedAt = _now();
        _data.stats.activeShards++;
        _log('Shard ACTIVE: ' + shardId + ' world=' + worldId + ' region=' + region + ' isolation=' + isolation);
        _save();
      }
    }, 500);

    _log('Shard provisioning: ' + shardId + ' world=' + worldId);
    _save();
    return shard;
  }

  function _captureWorldSnapshot() {
    if (!window.world) return {};
    return {
      id:         window.world.id,
      name:       window.world.name,
      year:       window.world.year,
      genre:      window.world.genre,
      npcCount:   (window.npcs || []).length,
      countryCount: (window.countries || []).length,
      capturedAt: _now(),
    };
  }

  function wss85SuspendShard(shardId) {
    const shard = _data.shards[shardId];
    if (!shard) return false;
    if (shard.state !== WSS85_SHARD_STATES.ACTIVE) return false;
    shard.state = WSS85_SHARD_STATES.SUSPENDED;
    shard.suspendedAt = _now();
    _data.stats.activeShards = Math.max(0, _data.stats.activeShards - 1);
    _log('Shard suspended: ' + shardId);
    _save();
    return true;
  }

  function wss85ResumeShard(shardId) {
    const shard = _data.shards[shardId];
    if (!shard) return false;
    if (shard.state !== WSS85_SHARD_STATES.SUSPENDED) return false;
    shard.state = WSS85_SHARD_STATES.ACTIVE;
    shard.suspendedAt = null;
    _data.stats.activeShards++;
    _log('Shard resumed: ' + shardId);
    _save();
    return true;
  }

  function wss85MigrateShard(shardId, targetRegion) {
    const shard = _data.shards[shardId];
    if (!shard) return false;
    if (!WSS85_REGIONS[targetRegion]) return false;
    const fromRegion = shard.region;
    shard.state = WSS85_SHARD_STATES.MIGRATING;
    _log('Shard migrating: ' + shardId + ' ' + fromRegion + ' → ' + targetRegion);
    setTimeout(function() {
      if (_data.shards[shardId]) {
        _data.shards[shardId].region = targetRegion;
        _data.shards[shardId].state  = WSS85_SHARD_STATES.ACTIVE;
        _log('Shard migration complete: ' + shardId + ' now in ' + targetRegion);
        _save();
      }
    }, 1000);
    return true;
  }

  function wss85TerminateShard(shardId) {
    const shard = _data.shards[shardId];
    if (!shard) return false;
    if (shard.state === WSS85_SHARD_STATES.ACTIVE) {
      _data.stats.activeShards = Math.max(0, _data.stats.activeShards - 1);
    }
    shard.state = WSS85_SHARD_STATES.TERMINATED;
    // Remove from tenant
    if (shard.tenantId && _data.tenants[shard.tenantId]) {
      const t = _data.tenants[shard.tenantId];
      t.shards = t.shards.filter(function(s) { return s !== shardId; });
      t.worlds  = t.worlds.filter(function(w) { return w !== shard.worldId; });
    }
    _log('Shard terminated: ' + shardId);
    _save();
    return true;
  }

  function wss85GetShard(shardId) {
    return _data.shards[shardId] || null;
  }

  function wss85GetActiveShards() {
    return Object.values(_data.shards).filter(function(s) {
      return s.state === WSS85_SHARD_STATES.ACTIVE;
    });
  }

  function wss85GetShardByWorld(worldId) {
    return Object.values(_data.shards).find(function(s) {
      return s.worldId === worldId && s.state === WSS85_SHARD_STATES.ACTIVE;
    }) || null;
  }

  // ── Cross-Shard Messaging ──────────────────────────────────
  function wss85SendCrossShardEvent(opts) {
    opts = opts || {};
    if (!opts.fromShard || !opts.toShard || !opts.eventType) return false;
    const fromShard = _data.shards[opts.fromShard];
    const toShard   = _data.shards[opts.toShard];
    if (!fromShard || !toShard) return false;
    if (fromShard.state !== WSS85_SHARD_STATES.ACTIVE) return false;
    if (toShard.state   !== WSS85_SHARD_STATES.ACTIVE) return false;

    // Tenant isolation check — cross-tenant requires explicit authorization
    if (fromShard.tenantId && toShard.tenantId &&
        fromShard.tenantId !== toShard.tenantId && !opts.authorized) {
      _log('Cross-shard event blocked (tenant isolation): ' + opts.fromShard + ' → ' + opts.toShard, 'WARN');
      return false;
    }

    const event = {
      id:         'cse_' + _now(),
      fromShard:  opts.fromShard,
      toShard:    opts.toShard,
      eventType:  opts.eventType,
      payload:    opts.payload || {},
      authorized: opts.authorized || false,
      queuedAt:   _now(),
      deliveredAt: null,
    };

    _data.crossShardQueue.push(event);
    _data.stats.crossShardEvents++;
    toShard.crossShardEvents.push(event.id);
    _log('Cross-shard event queued: ' + event.eventType + ' (' + opts.fromShard + ' → ' + opts.toShard + ')');
    _save();
    return true;
  }

  function _processCrossShardQueue() {
    const pending = _data.crossShardQueue.filter(function(e) { return !e.deliveredAt; });
    pending.forEach(function(event) {
      const toShard = _data.shards[event.toShard];
      if (toShard && toShard.state === WSS85_SHARD_STATES.ACTIVE) {
        event.deliveredAt = _now();
        // Hook into cross-world influence system if available
        if (event.eventType === 'CROSS_WORLD_INFLUENCE' && window.cwi80SendInfluence) {
          window.cwi80SendInfluence(event.payload);
        }
      }
    });
    // Trim delivered events older than 1 hour (simulated)
    if (_data.crossShardQueue.length > 500) {
      _data.crossShardQueue = _data.crossShardQueue.slice(-500);
    }
  }

  // ── Shard Health Check ────────────────────────────────────
  function _checkShardHealth(shard) {
    const issues = [];
    const world  = window.world;

    if (!world) {
      issues.push('No world loaded');
    }
    // Use V82 performance monitor if available
    if (window.perfMon82GetReport) {
      const perfReport = window.perfMon82GetReport();
      if (perfReport && perfReport.fps && perfReport.fps < 15) {
        issues.push('Low FPS: ' + perfReport.fps);
      }
    }
    // Use V84 AI cost manager if available
    if (window.aiCostGetReport) {
      const aiReport = window.aiCostGetReport();
      if (aiReport && aiReport.budgetUsedPct > 90) {
        issues.push('AI budget critical: ' + aiReport.budgetUsedPct + '%');
      }
    }
    // NPC count vs quota
    if (shard.tenantId && _data.tenants[shard.tenantId]) {
      const quota = _data.tenants[shard.tenantId].quota;
      const npcCount = (window.npcs || []).length;
      if (npcCount > quota.maxNPCsPerWorld * 0.9) {
        issues.push('NPC count near quota: ' + npcCount + '/' + quota.maxNPCsPerWorld);
      }
    }

    shard.health.issues  = issues;
    shard.health.score   = Math.max(0, 100 - issues.length * 20);
    shard.health.lastCheck = _now();
    shard.npcCount       = (window.npcs || []).length;
    shard.countryCount   = (window.countries || []).length;
  }

  // ── Stats & Report ────────────────────────────────────────
  function wss85GetStats() {
    return {
      totalShards:       _data.stats.totalShards,
      activeShards:      _data.stats.activeShards,
      totalTenants:      _data.stats.totalTenants,
      crossShardEvents:  _data.stats.crossShardEvents,
      quotaViolations:   _data.stats.quotaViolations,
      regionHealth:      Object.values(_data.regions),
      activeShardsDetail: wss85GetActiveShards().map(function(s) {
        return {
          shardId:   s.shardId,
          worldId:   s.worldId,
          region:    s.region,
          isolation: s.isolation,
          npcCount:  s.npcCount,
          health:    s.health.score,
        };
      }),
    };
  }

  function wss85GetRegionHealth(regionId) {
    return _data.regions[regionId] || null;
  }

  function wss85GetAllRegions() {
    return Object.values(_data.regions);
  }

  function wss85GetLog(n) {
    return _data.log.slice(0, n || 50);
  }

  function wss85GetReport() {
    const stats = wss85GetStats();
    const tenantList = Object.values(_data.tenants).map(function(t) {
      return {
        tenantId:    t.tenantId.substring(0, 12) + '...',
        tier:        t.tier,
        region:      t.region,
        worlds:      t.worlds.length,
        aiUsedToday: t.quota.aiCallsUsedToday,
        isolation:   t.isolation,
      };
    });
    return {
      version:   VERSION,
      timestamp: _now(),
      stats,
      tenants:   tenantList,
      regions:   stats.regionHealth,
      log:       wss85GetLog(20),
    };
  }

  // ── gameTick Hook ──────────────────────────────────────────
  let _tickCounter = 0;
  function _onGameTick() {
    _tickCounter++;
    _data.stats.lastTick = _tickCounter;

    // Every 100 ticks: update region health
    if (_tickCounter % 100 === 0) {
      _updateRegionStats();
    }

    // Every 50 ticks: check active shard health + process cross-shard queue
    if (_tickCounter % 50 === 0) {
      _processCrossShardQueue();
      wss85GetActiveShards().forEach(_checkShardHealth);
    }

    // Every 300 ticks: auto-save
    if (_tickCounter % 300 === 0) {
      _save();
    }
  }

  // ── Initialization ─────────────────────────────────────────
  function _init() {
    _load();
    _initRegions();

    // Auto-provision default local shard if world is loaded
    setTimeout(function() {
      if (window.world && Object.keys(_data.shards).length === 0) {
        const tenant = wss85GetOrCreateDefaultTenant();
        wss85ProvisionShard({
          tenantId: tenant.tenantId,
          worldId:  window.world.id || 'world_local',
          region:   'REGION-AS',
        });
      }
    }, 1000);

    // Hook into gameTick
    if (window.gameTick !== undefined) {
      const _origTick = window.gameTick;
      window.gameTick = function() {
        if (_origTick) _origTick.apply(this, arguments);
        _onGameTick();
      };
    }

    _data.initialized = true;
    _save();
    console.log('[WorldShardSystem V85] 🌐 World Isolation Engine khởi động — Shard Lifecycle · Multi Tenant · Multi Region sẵn sàng.');
  }

  // ── Public API ─────────────────────────────────────────────
  window.WSS85_ISOLATION    = WSS85_ISOLATION;
  window.WSS85_TIERS        = WSS85_TIERS;
  window.WSS85_REGIONS      = WSS85_REGIONS;
  window.wss85Data          = _data;

  window.wss85CreateTenant              = wss85CreateTenant;
  window.wss85GetTenant                 = wss85GetTenant;
  window.wss85GetOrCreateDefaultTenant  = wss85GetOrCreateDefaultTenant;
  window.wss85UpgradeTenant             = wss85UpgradeTenant;
  window.wss85CheckQuota                = wss85CheckQuota;

  window.wss85ProvisionShard    = wss85ProvisionShard;
  window.wss85SuspendShard      = wss85SuspendShard;
  window.wss85ResumeShard       = wss85ResumeShard;
  window.wss85MigrateShard      = wss85MigrateShard;
  window.wss85TerminateShard    = wss85TerminateShard;
  window.wss85GetShard          = wss85GetShard;
  window.wss85GetActiveShards   = wss85GetActiveShards;
  window.wss85GetShardByWorld   = wss85GetShardByWorld;

  window.wss85SendCrossShardEvent = wss85SendCrossShardEvent;

  window.wss85GetStats         = wss85GetStats;
  window.wss85GetRegionHealth  = wss85GetRegionHealth;
  window.wss85GetAllRegions    = wss85GetAllRegions;
  window.wss85GetLog           = wss85GetLog;
  window.wss85GetReport        = wss85GetReport;

  // Init at 22900ms
  setTimeout(_init, 22900);

})();
