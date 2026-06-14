// ============================================================
// UNIVERSE CLUSTER MANAGER V85
// Creator God V6 — Cloud Scale Pass
// Extends: universeClusterEngine.js (V80)
// Multi Region Topology · Cloud-Aware Cluster Policies
// Init: 23000ms | Save: cgv6_universe_cluster_manager_v85
// ONLY EXTENDS — không xóa, không thay thế engine V80
// ============================================================

(function() {
  'use strict';

  const SAVE_KEY = 'cgv6_universe_cluster_manager_v85';
  const VERSION  = 'V85';

  // ── Cloud Topology Types ──────────────────────────────────
  const UCM85_TOPOLOGY = {
    SINGLE_REGION: {
      id: 'SINGLE_REGION',
      label: 'Single Region',
      description: 'Tất cả cluster trong một vùng — độ trễ thấp nhất',
      regions: 1,
      replicationFactor: 1,
    },
    MULTI_REGION_ACTIVE_PASSIVE: {
      id: 'MULTI_REGION_ACTIVE_PASSIVE',
      label: 'Multi Region Active-Passive',
      description: 'Primary region xử lý; Secondary regions là hot standby',
      regions: 2,
      replicationFactor: 2,
    },
    MULTI_REGION_ACTIVE_ACTIVE: {
      id: 'MULTI_REGION_ACTIVE_ACTIVE',
      label: 'Multi Region Active-Active',
      description: 'Tất cả regions đều nhận traffic — tối đa availability',
      regions: 3,
      replicationFactor: 3,
    },
    GEO_DISTRIBUTED: {
      id: 'GEO_DISTRIBUTED',
      label: 'Geo-Distributed',
      description: 'Cluster được phân phối theo địa lý — tối ưu latency toàn cầu',
      regions: 3,
      replicationFactor: 3,
    },
  };

  // ── Cluster Policies ──────────────────────────────────────
  const UCM85_POLICIES = {
    LATENCY_OPTIMIZED: {
      id: 'LATENCY_OPTIMIZED',
      label: 'Latency Optimized',
      description: 'Route mọi request đến region gần nhất',
      routingMode: 'geo_nearest',
      rebalanceThreshold: 0.8,
    },
    COST_OPTIMIZED: {
      id: 'COST_OPTIMIZED',
      label: 'Cost Optimized',
      description: 'Ưu tiên region có load thấp nhất để tiết kiệm chi phí',
      routingMode: 'least_loaded',
      rebalanceThreshold: 0.6,
    },
    HIGH_AVAILABILITY: {
      id: 'HIGH_AVAILABILITY',
      label: 'High Availability',
      description: 'Luôn duy trì ít nhất 2 region active',
      routingMode: 'round_robin',
      rebalanceThreshold: 0.7,
    },
    ISOLATION_FIRST: {
      id: 'ISOLATION_FIRST',
      label: 'Isolation First',
      description: 'Mỗi tenant/world được cô lập tối đa, không chia sẻ tài nguyên',
      routingMode: 'dedicated',
      rebalanceThreshold: 0.5,
    },
  };

  // ── Cloud Cluster Record (extends V80 uclu80 cluster) ─────
  // V80 đã có: 6 loại cụm, auto-form 300 năm, power tracking
  // V85 thêm: region assignment, tenant binding, cloud policy, replication

  let _data = {
    version: VERSION,
    initialized: false,
    cloudClusters: {},    // clusterId → CloudClusterRecord (extends V80)
    topology: 'SINGLE_REGION',
    policy:   'LATENCY_OPTIMIZED',
    regionAssignments: {}, // regionId → [clusterId]
    replicationMap: {},    // clusterId → [replicaRegionId]
    tenantClusters: {},    // tenantId → [clusterId]
    globalTopologyScore: 0,
    rebalanceHistory: [],
    alerts: [],
    stats: {
      totalCloudClusters: 0,
      rebalanceCount: 0,
      failoversExecuted: 0,
      crossRegionEvents: 0,
      lastTopologyUpdate: 0,
    },
    log: [],
  };

  // ── Utility ────────────────────────────────────────────────
  function _uid() {
    return 'ucm_' + Math.random().toString(36).substr(2, 9);
  }

  function _now() { return Date.now(); }

  function _log(msg, level) {
    const entry = { ts: _now(), msg, level: level || 'INFO' };
    _data.log.unshift(entry);
    if (_data.log.length > 200) _data.log.length = 200;
    if (window.htAddEvent) window.htAddEvent('[ClusterManager V85] ' + msg);
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

  // ── Read V80 clusters (extends, never replaces) ────────────
  function _getV80Clusters() {
    if (window.universeClusterV80Data && window.universeClusterV80Data.clusters) {
      return window.universeClusterV80Data.clusters;
    }
    return {};
  }

  function _syncFromV80() {
    const v80Clusters = _getV80Clusters();
    Object.keys(v80Clusters).forEach(function(cId) {
      if (!_data.cloudClusters[cId]) {
        // Promote V80 cluster to cloud-aware record
        _data.cloudClusters[cId] = {
          clusterId:      cId,
          v80Data:        v80Clusters[cId], // reference to V80 data
          region:         _assignRegionForCluster(v80Clusters[cId]),
          replicaRegions: [],
          tenantId:       null,
          policy:         _data.policy,
          topology:       _data.topology,
          cloudHealth:    100,
          trafficWeight:  1.0,
          isActive:       true,
          isPrimary:      true,
          promotedAt:     _now(),
        };
        _data.stats.totalCloudClusters++;
      }
    });
  }

  function _assignRegionForCluster(v80Cluster) {
    // Assign region based on cluster power (strongest → primary region)
    const regions = Object.keys(window.WSS85_REGIONS || {
      'REGION-AS': true,
      'REGION-EU': true,
      'REGION-AP': true,
    });
    if (!regions.length) return 'REGION-AS';
    // Distribute by cluster index for spread
    const keys  = Object.keys(_data.cloudClusters);
    const index  = keys.length % regions.length;
    return regions[index];
  }

  // ── Cloud Cluster Management ──────────────────────────────
  function ucm85RegisterCluster(opts) {
    opts = opts || {};
    const clusterId = opts.clusterId || _uid();
    const region    = opts.region || 'REGION-AS';
    const tenantId  = opts.tenantId || null;

    // Check if V80 cluster exists
    const v80Clusters = _getV80Clusters();
    const v80Data = v80Clusters[clusterId] || null;

    _data.cloudClusters[clusterId] = {
      clusterId,
      v80Data,
      region,
      replicaRegions: opts.replicaRegions || [],
      tenantId,
      policy:      opts.policy  || _data.policy,
      topology:    opts.topology || _data.topology,
      cloudHealth: 100,
      trafficWeight: opts.trafficWeight || 1.0,
      isActive:    true,
      isPrimary:   true,
      memberWorlds: opts.memberWorlds || [],
      registeredAt: _now(),
      promotedAt:  _now(),
    };

    // Region assignment
    if (!_data.regionAssignments[region]) _data.regionAssignments[region] = [];
    if (!_data.regionAssignments[region].includes(clusterId)) {
      _data.regionAssignments[region].push(clusterId);
    }

    // Tenant binding
    if (tenantId) {
      if (!_data.tenantClusters[tenantId]) _data.tenantClusters[tenantId] = [];
      _data.tenantClusters[tenantId].push(clusterId);
    }

    _data.stats.totalCloudClusters++;
    _log('Cloud cluster registered: ' + clusterId + ' region=' + region);
    _save();
    return _data.cloudClusters[clusterId];
  }

  function ucm85SetTopology(topologyId) {
    if (!UCM85_TOPOLOGY[topologyId]) {
      console.warn('[UCM85] Unknown topology:', topologyId);
      return false;
    }
    _data.topology = topologyId;
    _data.stats.lastTopologyUpdate = _now();
    _log('Topology set: ' + topologyId);

    // Apply topology — set up replication
    _applyTopology(topologyId);
    _save();
    return true;
  }

  function ucm85SetPolicy(policyId) {
    if (!UCM85_POLICIES[policyId]) {
      console.warn('[UCM85] Unknown policy:', policyId);
      return false;
    }
    _data.policy = policyId;
    _log('Policy set: ' + policyId);
    _save();
    return true;
  }

  function _applyTopology(topologyId) {
    const topo   = UCM85_TOPOLOGY[topologyId];
    const clusterIds = Object.keys(_data.cloudClusters);
    const allRegions = ['REGION-AS', 'REGION-EU', 'REGION-AP'];

    clusterIds.forEach(function(cId, idx) {
      const cluster = _data.cloudClusters[cId];
      cluster.topology = topologyId;

      if (topologyId === 'SINGLE_REGION') {
        cluster.replicaRegions = [];
      } else if (topologyId === 'MULTI_REGION_ACTIVE_PASSIVE') {
        const primary   = cluster.region;
        const secondary = allRegions.find(function(r) { return r !== primary; }) || allRegions[0];
        cluster.replicaRegions = [secondary];
      } else if (topologyId === 'MULTI_REGION_ACTIVE_ACTIVE' || topologyId === 'GEO_DISTRIBUTED') {
        cluster.replicaRegions = allRegions.filter(function(r) { return r !== cluster.region; });
      }

      // Update replication map
      _data.replicationMap[cId] = cluster.replicaRegions;
    });

    _data.stats.crossRegionEvents += clusterIds.length;
    _log('Topology applied: ' + topologyId + ' to ' + clusterIds.length + ' clusters');
  }

  // ── Rebalancing ────────────────────────────────────────────
  function ucm85RebalanceClusters() {
    const policy = UCM85_POLICIES[_data.policy];
    if (!policy) return false;

    const regions = window.wss85GetAllRegions ? window.wss85GetAllRegions() : [];
    let moved = 0;

    // Find overloaded regions
    regions.forEach(function(region) {
      if (region.cpuLoad > policy.rebalanceThreshold) {
        // Find clusters in this region to migrate
        const regionClusters = (_data.regionAssignments[region.regionId] || []).slice();
        const targetRegion   = _findLeastLoadedRegion(region.regionId, regions);
        if (targetRegion && regionClusters.length > 1) {
          const cId = regionClusters[0]; // migrate first cluster
          _migrateClusterRegion(cId, targetRegion.regionId);
          moved++;
        }
      }
    });

    if (moved > 0) {
      _data.stats.rebalanceCount++;
      _data.rebalanceHistory.unshift({
        ts: _now(),
        policy: _data.policy,
        clustersMoved: moved,
      });
      if (_data.rebalanceHistory.length > 50) _data.rebalanceHistory.length = 50;
      _log('Rebalance complete: moved ' + moved + ' clusters (policy=' + _data.policy + ')');
    }
    _save();
    return moved;
  }

  function _findLeastLoadedRegion(excludeRegionId, regions) {
    return regions
      .filter(function(r) { return r.regionId !== excludeRegionId && r.status === 'ONLINE'; })
      .sort(function(a, b) { return a.cpuLoad - b.cpuLoad; })[0] || null;
  }

  function _migrateClusterRegion(clusterId, targetRegion) {
    const cluster = _data.cloudClusters[clusterId];
    if (!cluster) return;
    const fromRegion = cluster.region;

    // Update region assignments
    if (_data.regionAssignments[fromRegion]) {
      _data.regionAssignments[fromRegion] = _data.regionAssignments[fromRegion]
        .filter(function(c) { return c !== clusterId; });
    }
    if (!_data.regionAssignments[targetRegion]) _data.regionAssignments[targetRegion] = [];
    _data.regionAssignments[targetRegion].push(clusterId);

    cluster.region = targetRegion;
    _log('Cluster migrated: ' + clusterId + ' ' + fromRegion + ' → ' + targetRegion);

    // Also trigger shard migration if WSS85 is available
    if (window.wss85GetShardByWorld && cluster.memberWorlds) {
      cluster.memberWorlds.forEach(function(worldId) {
        const shard = window.wss85GetShardByWorld(worldId);
        if (shard && window.wss85MigrateShard) {
          window.wss85MigrateShard(shard.shardId, targetRegion);
        }
      });
    }
  }

  // ── Failover ───────────────────────────────────────────────
  function ucm85TriggerFailover(clusterId, targetRegion) {
    const cluster = _data.cloudClusters[clusterId];
    if (!cluster) return false;
    if (!targetRegion && cluster.replicaRegions.length > 0) {
      targetRegion = cluster.replicaRegions[0];
    }
    if (!targetRegion) {
      _log('Failover failed: no target region for ' + clusterId, 'WARN');
      return false;
    }

    const fromRegion = cluster.region;
    cluster.region   = targetRegion;
    cluster.isPrimary = false; // mark as failover instance
    _data.stats.failoversExecuted++;

    _addAlert('FAILOVER', 'Cluster ' + clusterId + ' failed over: ' + fromRegion + ' → ' + targetRegion, 'HIGH');
    _log('Failover executed: ' + clusterId + ' → ' + targetRegion, 'WARN');
    _save();
    return true;
  }

  // ── Alerts ─────────────────────────────────────────────────
  function _addAlert(type, message, severity) {
    _data.alerts.unshift({ ts: _now(), type, message, severity: severity || 'LOW', resolved: false });
    if (_data.alerts.length > 100) _data.alerts.length = 100;
  }

  function ucm85ResolveAlert(index) {
    if (_data.alerts[index]) {
      _data.alerts[index].resolved = true;
      _save();
      return true;
    }
    return false;
  }

  function ucm85GetAlerts(onlyUnresolved) {
    if (onlyUnresolved) return _data.alerts.filter(function(a) { return !a.resolved; });
    return _data.alerts.slice(0, 50);
  }

  // ── Topology Score ─────────────────────────────────────────
  function _computeTopologyScore() {
    const clusters = Object.values(_data.cloudClusters);
    if (!clusters.length) return 0;

    let score = 100;

    // Penalize for single region clusters when topology demands multi-region
    if (_data.topology !== 'SINGLE_REGION') {
      const singleRegionClusters = clusters.filter(function(c) {
        return c.replicaRegions.length === 0;
      });
      score -= (singleRegionClusters.length / clusters.length) * 30;
    }

    // Penalize for unhealthy clusters
    const avgHealth = clusters.reduce(function(sum, c) { return sum + c.cloudHealth; }, 0) / clusters.length;
    score = score * (avgHealth / 100);

    // Bonus for region spread
    const regionsUsed = new Set(clusters.map(function(c) { return c.region; })).size;
    score += regionsUsed * 5;

    _data.globalTopologyScore = Math.round(Math.max(0, Math.min(100, score)));
    return _data.globalTopologyScore;
  }

  // ── Tenant Cluster View ────────────────────────────────────
  function ucm85GetTenantClusters(tenantId) {
    const ids = _data.tenantClusters[tenantId] || [];
    return ids.map(function(cId) { return _data.cloudClusters[cId]; }).filter(Boolean);
  }

  function ucm85GetClustersByRegion(regionId) {
    const ids = _data.regionAssignments[regionId] || [];
    return ids.map(function(cId) { return _data.cloudClusters[cId]; }).filter(Boolean);
  }

  function ucm85GetCluster(clusterId) {
    return _data.cloudClusters[clusterId] || null;
  }

  function ucm85GetAllClusters() {
    return Object.values(_data.cloudClusters);
  }

  // ── Stats & Report ────────────────────────────────────────
  function ucm85GetStats() {
    const clusters = Object.values(_data.cloudClusters);
    const regionBreakdown = {};
    clusters.forEach(function(c) {
      if (!regionBreakdown[c.region]) regionBreakdown[c.region] = 0;
      regionBreakdown[c.region]++;
    });
    return {
      version:             VERSION,
      topology:            _data.topology,
      policy:              _data.policy,
      totalCloudClusters:  _data.stats.totalCloudClusters,
      rebalanceCount:      _data.stats.rebalanceCount,
      failoversExecuted:   _data.stats.failoversExecuted,
      crossRegionEvents:   _data.stats.crossRegionEvents,
      topologyScore:       _computeTopologyScore(),
      regionBreakdown,
      activeAlerts:        _data.alerts.filter(function(a) { return !a.resolved; }).length,
    };
  }

  function ucm85GetReport() {
    return {
      version:   VERSION,
      timestamp: _now(),
      topology:  UCM85_TOPOLOGY[_data.topology],
      policy:    UCM85_POLICIES[_data.policy],
      stats:     ucm85GetStats(),
      clusters:  ucm85GetAllClusters().map(function(c) {
        return {
          clusterId:      c.clusterId,
          region:         c.region,
          replicaRegions: c.replicaRegions,
          policy:         c.policy,
          cloudHealth:    c.cloudHealth,
          isPrimary:      c.isPrimary,
          memberWorlds:   c.memberWorlds ? c.memberWorlds.length : 0,
          v80Type:        c.v80Data ? c.v80Data.type : 'cloud-only',
        };
      }),
      rebalanceHistory: _data.rebalanceHistory.slice(0, 10),
      alerts:           ucm85GetAlerts(true),
      log:              _data.log.slice(0, 20),
    };
  }

  function ucm85GetLog(n) {
    return _data.log.slice(0, n || 50);
  }

  // ── gameTick Hook ──────────────────────────────────────────
  let _tickCounter = 0;
  function _onGameTick() {
    _tickCounter++;

    // Every 300 years: sync from V80 cluster engine
    if (_tickCounter % 300 === 0) {
      _syncFromV80();
    }

    // Every 150 ticks: compute topology score + check for rebalance needs
    if (_tickCounter % 150 === 0) {
      _computeTopologyScore();

      // Auto-rebalance if LATENCY_OPTIMIZED or COST_OPTIMIZED
      const policy = _data.policy;
      if (policy === 'LATENCY_OPTIMIZED' || policy === 'COST_OPTIMIZED') {
        ucm85RebalanceClusters();
      }
    }

    // Every 500 ticks: check cluster health from region health
    if (_tickCounter % 500 === 0) {
      const regions = window.wss85GetAllRegions ? window.wss85GetAllRegions() : [];
      regions.forEach(function(region) {
        if (region.status === 'DEGRADED' || region.status === 'OFFLINE') {
          const clustersInRegion = _data.regionAssignments[region.regionId] || [];
          clustersInRegion.forEach(function(cId) {
            const cluster = _data.cloudClusters[cId];
            if (!cluster) return;
            cluster.cloudHealth = region.status === 'OFFLINE' ? 0 : 40;
            if (region.status === 'OFFLINE' && cluster.isPrimary && cluster.replicaRegions.length > 0) {
              ucm85TriggerFailover(cId, cluster.replicaRegions[0]);
            }
          });
        }
      });
    }

    // Every 1000 ticks: auto-save
    if (_tickCounter % 1000 === 0) {
      _save();
    }
  }

  // ── Initialization ─────────────────────────────────────────
  function _init() {
    _load();

    // Wait for V80 to be ready, then sync
    setTimeout(function() {
      _syncFromV80();

      // Initialize region assignments
      const allRegions = ['REGION-AS', 'REGION-EU', 'REGION-AP'];
      allRegions.forEach(function(r) {
        if (!_data.regionAssignments[r]) _data.regionAssignments[r] = [];
      });

      _applyTopology(_data.topology);
      _computeTopologyScore();
      _log('Cloud topology initialized: ' + _data.topology + ' · policy: ' + _data.policy + ' · score: ' + _data.globalTopologyScore);
      _save();
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
    console.log('[UniverseClusterManager V85] 🌌 Cloud Cluster Manager khởi động — Multi Region · Multi Tenant · World Isolation · Extends V80 ✓');
  }

  // ── Public API ─────────────────────────────────────────────
  window.UCM85_TOPOLOGY  = UCM85_TOPOLOGY;
  window.UCM85_POLICIES  = UCM85_POLICIES;
  window.ucm85Data       = _data;

  window.ucm85RegisterCluster   = ucm85RegisterCluster;
  window.ucm85SetTopology        = ucm85SetTopology;
  window.ucm85SetPolicy          = ucm85SetPolicy;
  window.ucm85RebalanceClusters  = ucm85RebalanceClusters;
  window.ucm85TriggerFailover    = ucm85TriggerFailover;

  window.ucm85GetCluster         = ucm85GetCluster;
  window.ucm85GetAllClusters     = ucm85GetAllClusters;
  window.ucm85GetClustersByRegion = ucm85GetClustersByRegion;
  window.ucm85GetTenantClusters  = ucm85GetTenantClusters;

  window.ucm85GetAlerts          = ucm85GetAlerts;
  window.ucm85ResolveAlert       = ucm85ResolveAlert;

  window.ucm85GetStats           = ucm85GetStats;
  window.ucm85GetReport          = ucm85GetReport;
  window.ucm85GetLog             = ucm85GetLog;

  // Init at 23000ms (sau worldShardSystem 22900ms)
  setTimeout(_init, 23000);

})();
