// ============================================================
// ANALYTICS ENGINE V88
// Creator God V6 — Analytics Pass
// World Growth · NPC Activity · XR Usage · Creator Activity
// Init: 23600ms | Save: cgv6_analytics_engine_v88
// ONLY EXTENDS — không xóa, không thay thế bất kỳ engine nào
// ============================================================

(function() {
  'use strict';

  const SAVE_KEY      = 'cgv6_analytics_engine_v88';
  const VERSION       = 'V88';
  const MAX_DATAPOINTS = 500;   // max time series points
  const SAMPLE_TICKS   = 50;    // sample every N ticks

  // ── Metric Definitions ─────────────────────────────────────
  const AE88_METRICS = {
    // World Growth
    WORLD_YEAR:          { id: 'WORLD_YEAR',         category: 'WORLD',   label: 'Năm Hiện Tại' },
    COUNTRY_COUNT:       { id: 'COUNTRY_COUNT',      category: 'WORLD',   label: 'Số Quốc Gia' },
    WAR_COUNT:           { id: 'WAR_COUNT',           category: 'WORLD',   label: 'Chiến Tranh Đang Diễn Ra' },
    ALLIANCE_COUNT:      { id: 'ALLIANCE_COUNT',      category: 'WORLD',   label: 'Liên Minh Tồn Tại' },
    KINGDOM_COUNT:       { id: 'KINGDOM_COUNT',       category: 'WORLD',   label: 'Vương Quốc' },
    EMPIRE_COUNT:        { id: 'EMPIRE_COUNT',        category: 'WORLD',   label: 'Đế Chế' },
    DISASTER_TOTAL:      { id: 'DISASTER_TOTAL',      category: 'WORLD',   label: 'Tổng Thiên Tai' },
    AGE_ID:              { id: 'AGE_ID',              category: 'WORLD',   label: 'Thời Đại Hiện Tại' },

    // NPC Activity
    NPC_COUNT:           { id: 'NPC_COUNT',           category: 'NPC',     label: 'Tổng NPC' },
    NPC_AVG_AGE:         { id: 'NPC_AVG_AGE',         category: 'NPC',     label: 'Tuổi Trung Bình NPC' },
    NPC_MAX_LEVEL:       { id: 'NPC_MAX_LEVEL',       category: 'NPC',     label: 'Level Cao Nhất NPC' },
    NPC_ALIVE:           { id: 'NPC_ALIVE',           category: 'NPC',     label: 'NPC Còn Sống' },
    NPC_RELATIONSHIPS:   { id: 'NPC_RELATIONSHIPS',   category: 'NPC',     label: 'Số Quan Hệ NPC' },
    NPC_FAMILY_SIZE:     { id: 'NPC_FAMILY_SIZE',     category: 'NPC',     label: 'Tổng Thành Viên Gia Đình' },

    // XR Usage
    XR_SESSION_COUNT:    { id: 'XR_SESSION_COUNT',    category: 'XR',      label: 'Số Phiên XR' },
    XR_ACTIVE:           { id: 'XR_ACTIVE',           category: 'XR',      label: 'XR Đang Hoạt Động' },
    XR_COMMANDS_TOTAL:   { id: 'XR_COMMANDS_TOTAL',   category: 'XR',      label: 'Tổng Lệnh Thần XR' },
    XR_SCALE_LEVEL:      { id: 'XR_SCALE_LEVEL',      category: 'XR',      label: 'Scale Level Hiện Tại' },
    SPATIAL_VIEW_OPENS:  { id: 'SPATIAL_VIEW_OPENS',  category: 'XR',      label: 'Lần Mở Spatial View' },

    // Creator Activity
    WORLDS_CREATED:      { id: 'WORLDS_CREATED',      category: 'CREATOR', label: 'Thế Giới Đã Tạo' },
    AI_CALLS_TOTAL:      { id: 'AI_CALLS_TOTAL',      category: 'CREATOR', label: 'Tổng Gọi AI' },
    AI_COST_USD:         { id: 'AI_COST_USD',         category: 'CREATOR', label: 'Chi Phí AI (USD)' },
    DIVINE_ACTS_TOTAL:   { id: 'DIVINE_ACTS_TOTAL',   category: 'CREATOR', label: 'Hành Động Thần' },
    SNAPSHOTS_TOTAL:     { id: 'SNAPSHOTS_TOTAL',     category: 'CREATOR', label: 'Số Snapshot' },
    AUDIT_LOG_COUNT:     { id: 'AUDIT_LOG_COUNT',     category: 'CREATOR', label: 'Dòng Audit Log' },
    PERF_FPS_ESTIMATE:   { id: 'PERF_FPS_ESTIMATE',   category: 'CREATOR', label: 'Tốc Độ Tick Ước Tính (ms)' },
  };

  // ── State ──────────────────────────────────────────────────
  let _data = {
    version:     VERSION,
    initialized: false,

    // Time series: metricId → [{ tick, gameYear, value }]
    timeSeries: {},

    // Cumulative / event counts
    events: {
      npcBirths:         0,
      npcDeaths:         0,
      npcLevelUps:       0,
      npcRelationships:  0,
      wars_declared:     0,
      wars_ended:        0,
      disasters:         0,
      plagues:           0,
      xrSessionsOpened:  0,
      divineInterventions: 0,
      aiCallsMade:       0,
      worldsCreated:     0,
      blueprintsCreated: 0,
      snapshotsCreated:  0,
      restoresDone:      0,
    },

    // Session tracking
    session: {
      startTs:      0,
      ticksElapsed: 0,
      panelsOpened: {},   // panelId → count
      tabsOpened:   {},   // tabId → count
    },

    // Funnel: World Creation Steps
    worldCreationFunnel: {
      started:       0,
      dnaCreated:    0,
      storyCreated:  0,
      cinematicShown: 0,
      completed:     0,
    },

    // Retention buckets
    retention: {
      lastSeenGameYear: 0,
      sessionsTotal:    1,
      longestSession:   0,
    },

    stats: {
      totalSamples:   0,
      lastSampleAt:   0,
      lastSampleTick: 0,
    },
  };

  // ── Utility ────────────────────────────────────────────────
  function _now()      { return Date.now(); }
  function _gameYear() { return typeof window.year !== 'undefined' ? window.year : ((window.world && window.world.year) || 0); }

  function _save() {
    if (window.perfSave) {
      window.perfSave(SAVE_KEY, _data);
    } else {
      try {
        // Save a slimmed version to avoid overflow
        const slim = Object.assign({}, _data);
        slim.timeSeries = {};
        Object.keys(_data.timeSeries).forEach(function(k) {
          slim.timeSeries[k] = _data.timeSeries[k].slice(-20); // keep last 20 per metric
        });
        localStorage.setItem(SAVE_KEY, JSON.stringify(slim));
      } catch(e) {}
    }
  }

  function _load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === VERSION) {
          _data.events    = Object.assign(_data.events,    parsed.events    || {});
          _data.session   = Object.assign(_data.session,   parsed.session   || {});
          _data.retention = Object.assign(_data.retention, parsed.retention || {});
          _data.worldCreationFunnel = Object.assign(_data.worldCreationFunnel, parsed.worldCreationFunnel || {});
          _data.timeSeries = parsed.timeSeries || {};
          _data.stats      = Object.assign(_data.stats, parsed.stats || {});
        }
      }
    } catch(e) {}
  }

  function _pushTimeSeries(metricId, tick, gameYear, value) {
    if (!_data.timeSeries[metricId]) _data.timeSeries[metricId] = [];
    _data.timeSeries[metricId].push({ tick, gameYear, value, ts: _now() });
    if (_data.timeSeries[metricId].length > MAX_DATAPOINTS) {
      _data.timeSeries[metricId].shift();
    }
  }

  // ── Data Collectors ────────────────────────────────────────
  function _collectWorldGrowth(tick) {
    const gameYear = _gameYear();

    // Country count
    const countries = Array.isArray(window.countries) ? window.countries
      : (typeof window.countries === 'object' && window.countries ? Object.values(window.countries) : []);
    _pushTimeSeries('COUNTRY_COUNT', tick, gameYear, countries.length);
    _pushTimeSeries('WORLD_YEAR', tick, gameYear, gameYear);

    // Wars
    const wars = Array.isArray(window.warsActive) ? window.warsActive.length : 0;
    _pushTimeSeries('WAR_COUNT', tick, gameYear, wars);

    // Alliances
    const alliances = window.allianceData && Array.isArray(window.allianceData.alliances)
      ? window.allianceData.alliances.length : 0;
    _pushTimeSeries('ALLIANCE_COUNT', tick, gameYear, alliances);

    // Kingdoms
    const kingdoms = window.kingdomData
      ? (Array.isArray(window.kingdomData.kingdoms) ? window.kingdomData.kingdoms : Object.values(window.kingdomData.kingdoms || {})).length
      : 0;
    _pushTimeSeries('KINGDOM_COUNT', tick, gameYear, kingdoms);

    // Empires
    const empires = window.empireData
      ? (Array.isArray(window.empireData.empires) ? window.empireData.empires : Object.values(window.empireData.empires || {})).length
      : 0;
    _pushTimeSeries('EMPIRE_COUNT', tick, gameYear, empires);

    // Age
    const ageId = window.ageV25Data && window.ageV25Data.currentAge ? window.ageV25Data.currentAge.id || 0 : 0;
    _pushTimeSeries('AGE_ID', tick, gameYear, typeof ageId === 'string' ? ageId.length : ageId);
  }

  function _collectNPCActivity(tick) {
    const gameYear = _gameYear();

    const npcsArr = Array.isArray(window.npcs) ? window.npcs
      : (typeof window.npcs === 'object' && window.npcs ? Object.values(window.npcs) : []);
    _pushTimeSeries('NPC_COUNT', tick, gameYear, npcsArr.length);

    if (npcsArr.length > 0) {
      // Sample up to 100 NPCs for stats
      const sample = npcsArr.slice(0, 100);
      const ages    = sample.map(function(n) { return n.age || n.born ? (gameYear - (n.born || 0)) : 0; }).filter(Boolean);
      const levels  = sample.map(function(n) { return n.level || 0; });
      const alive   = sample.filter(function(n) { return !n.dead && !n.died; }).length;

      if (ages.length > 0) {
        const avgAge = Math.round(ages.reduce(function(a, b) { return a + b; }, 0) / ages.length);
        _pushTimeSeries('NPC_AVG_AGE', tick, gameYear, avgAge);
      }
      const maxLevel = Math.max.apply(null, levels);
      _pushTimeSeries('NPC_MAX_LEVEL', tick, gameYear, maxLevel);
      _pushTimeSeries('NPC_ALIVE', tick, gameYear, alive);

      // Relationships (from V65 if available)
      if (window.npcRelationshipV65Data) {
        const relCount = Object.keys(window.npcRelationshipV65Data.relationships || {}).length;
        _pushTimeSeries('NPC_RELATIONSHIPS', tick, gameYear, relCount);
      }
    }
  }

  function _collectXRUsage(tick) {
    const gameYear = _gameYear();

    // XR world V72
    if (window.xrWorldV72Data) {
      _pushTimeSeries('XR_SESSION_COUNT', tick, gameYear, window.xrWorldV72Data.sessionCount || 0);
      _pushTimeSeries('XR_ACTIVE', tick, gameYear, window.xrWorldV72Data.isActive ? 1 : 0);
      _pushTimeSeries('XR_COMMANDS_TOTAL', tick, gameYear, (window.xrWorldV72Data.godCommands || []).length);
    }

    // Spatial V67
    if (window.spatialWorldEngineV67Data) {
      const level = window.spatialWorldEngineV67Data.currentScaleLevel || 0;
      _pushTimeSeries('XR_SCALE_LEVEL', tick, gameYear, level);
    }
  }

  function _collectCreatorActivity(tick) {
    const gameYear = _gameYear();

    // Worlds created (V62 wizard completions)
    if (window.worldDNAEngineV62Data) {
      _pushTimeSeries('WORLDS_CREATED', tick, gameYear, window.worldDNAEngineV62Data.totalCreated || _data.events.worldsCreated);
    }

    // AI calls (V84 cost manager)
    if (window.aiCostData) {
      _pushTimeSeries('AI_CALLS_TOTAL', tick, gameYear, window.aiCostData.stats && window.aiCostData.stats.totalCalls || 0);
      _pushTimeSeries('AI_COST_USD', tick, gameYear, window.aiCostData.totalCost || 0);
    }

    // Divine interventions (V66)
    if (window.divineInterventionV66Data) {
      _pushTimeSeries('DIVINE_ACTS_TOTAL', tick, gameYear, window.divineInterventionV66Data.totalActs || 0);
    }

    // Snapshots (V87)
    if (window.be87Data) {
      _pushTimeSeries('SNAPSHOTS_TOTAL', tick, gameYear, window.be87Data.stats && window.be87Data.stats.totalSnapshots || 0);
    }

    // Audit log size (V86)
    if (window.al86Data) {
      _pushTimeSeries('AUDIT_LOG_COUNT', tick, gameYear, window.al86Data.logs ? window.al86Data.logs.length : 0);
    }

    // Performance (V82)
    if (window.perfMon82GetReport) {
      try {
        const pr = window.perfMon82GetReport();
        if (pr && pr.avgTickMs) {
          _pushTimeSeries('PERF_FPS_ESTIMATE', tick, gameYear, Math.round(pr.avgTickMs * 10) / 10);
        }
      } catch(e) {}
    }
  }

  // ── Event Tracking ─────────────────────────────────────────
  function ae88TrackEvent(category, eventName, value, metadata) {
    if (_data.events.hasOwnProperty(eventName)) {
      _data.events[eventName] += (value || 1);
    } else {
      _data.events[eventName] = value || 1;
    }

    if (window.al86Log) {
      window.al86Log({
        category:  'SYSTEM',
        action:    'ANALYTICS_EVENT',
        detail:    category + '.' + eventName + ' = ' + (value || 1),
        severity:  'DEBUG',
        metadata,
      });
    }
  }

  function ae88TrackPanelOpen(panelId) {
    _data.session.panelsOpened[panelId] = (_data.session.panelsOpened[panelId] || 0) + 1;
  }

  function ae88TrackTabOpen(tabId) {
    _data.session.tabsOpened[tabId] = (_data.session.tabsOpened[tabId] || 0) + 1;
  }

  function ae88TrackWorldCreationStep(step) {
    if (_data.worldCreationFunnel.hasOwnProperty(step)) {
      _data.worldCreationFunnel[step]++;
    }
  }

  // ── Queries & Reports ──────────────────────────────────────
  function ae88GetTimeSeries(metricId, lastN) {
    const series = _data.timeSeries[metricId] || [];
    if (lastN) return series.slice(-lastN);
    return series;
  }

  function ae88GetLatestValue(metricId) {
    const series = _data.timeSeries[metricId];
    if (!series || series.length === 0) return null;
    return series[series.length - 1].value;
  }

  function ae88GetTrend(metricId, windowSize) {
    windowSize = windowSize || 10;
    const series = _data.timeSeries[metricId] || [];
    if (series.length < 2) return { trend: 'UNKNOWN', change: 0, pct: '0%' };

    const recent = series.slice(-windowSize);
    const first  = recent[0].value;
    const last   = recent[recent.length - 1].value;
    const change = last - first;
    const pct    = first !== 0 ? Math.round((change / first) * 100) : 0;

    return {
      trend:  change > 0 ? 'UP' : change < 0 ? 'DOWN' : 'STABLE',
      change,
      pct:    (pct > 0 ? '+' : '') + pct + '%',
      first,
      last,
    };
  }

  function ae88GetCurrentSnapshot() {
    const snapshot = {};
    Object.keys(AE88_METRICS).forEach(function(id) {
      snapshot[id] = {
        label:  AE88_METRICS[id].label,
        value:  ae88GetLatestValue(id),
        trend:  ae88GetTrend(id, 5),
      };
    });
    return snapshot;
  }

  function ae88GetCategoryMetrics(category) {
    const metrics = Object.values(AE88_METRICS).filter(function(m) { return m.category === category; });
    return metrics.map(function(m) {
      return Object.assign({}, m, {
        latestValue: ae88GetLatestValue(m.id),
        trend:       ae88GetTrend(m.id, 10),
        dataPoints:  (_data.timeSeries[m.id] || []).length,
      });
    });
  }

  function ae88GetDashboard() {
    return {
      ts:          _now(),
      gameYear:    _gameYear(),
      worldGrowth: ae88GetCategoryMetrics('WORLD'),
      npcActivity: ae88GetCategoryMetrics('NPC'),
      xrUsage:     ae88GetCategoryMetrics('XR'),
      creatorActivity: ae88GetCategoryMetrics('CREATOR'),
      events:      Object.assign({}, _data.events),
      session: {
        durationMs:    _now() - _data.session.startTs,
        ticksElapsed:  _data.session.ticksElapsed,
        topPanels:     Object.entries(_data.session.panelsOpened)
          .sort(function(a, b) { return b[1] - a[1]; }).slice(0, 5),
        topTabs:       Object.entries(_data.session.tabsOpened)
          .sort(function(a, b) { return b[1] - a[1]; }).slice(0, 5),
      },
      worldCreationFunnel: _data.worldCreationFunnel,
      retention: _data.retention,
    };
  }

  function ae88GetStats() {
    return Object.assign({}, _data.stats, {
      metricsTracked:   Object.keys(_data.timeSeries).length,
      totalDataPoints:  Object.values(_data.timeSeries).reduce(function(acc, s) { return acc + s.length; }, 0),
      sessionsTotal:    _data.retention.sessionsTotal,
    });
  }

  function ae88GetReport() {
    return {
      version:   VERSION,
      timestamp: _now(),
      gameYear:  _gameYear(),
      stats:     ae88GetStats(),
      dashboard: ae88GetDashboard(),
    };
  }

  // ── gameTick Hook ──────────────────────────────────────────
  let _tickCounter = 0;
  function _onGameTick() {
    _tickCounter++;
    _data.session.ticksElapsed++;

    // Collect metrics every SAMPLE_TICKS
    if (_tickCounter % SAMPLE_TICKS === 0) {
      _collectWorldGrowth(_tickCounter);
      _collectNPCActivity(_tickCounter);
      _collectXRUsage(_tickCounter);
      _collectCreatorActivity(_tickCounter);
      _data.stats.totalSamples++;
      _data.stats.lastSampleAt   = _now();
      _data.stats.lastSampleTick = _tickCounter;
    }

    // Track war events (simple polling)
    if (_tickCounter % 100 === 0 && window.warsActive) {
      const warCount = Array.isArray(window.warsActive) ? window.warsActive.length : 0;
      const prev = ae88GetLatestValue('WAR_COUNT');
      if (prev !== null && warCount > prev) {
        _data.events.wars_declared += (warCount - prev);
      } else if (prev !== null && warCount < prev) {
        _data.events.wars_ended += (prev - warCount);
      }
    }

    // Save every 500 ticks
    if (_tickCounter % 500 === 0) {
      _data.retention.lastSeenGameYear = _gameYear();
      _data.retention.longestSession   = Math.max(
        _data.retention.longestSession,
        _now() - _data.session.startTs
      );
      _save();
    }
  }

  // ── Hook into Panel Opens ──────────────────────────────────
  function _patchPanelTracking() {
    if (typeof window.showPanel === 'function') {
      const _orig = window.showPanel;
      window.showPanel = function(panelId) {
        ae88TrackPanelOpen(panelId);
        return _orig.apply(this, arguments);
      };
    }
  }

  // ── Init ───────────────────────────────────────────────────
  function _init() {
    _load();
    _data.session.startTs = _now();
    _data.retention.sessionsTotal++;

    setTimeout(_patchPanelTracking, 1000);

    if (window.gameTick !== undefined) {
      const _orig = window.gameTick;
      window.gameTick = function() {
        if (_orig) _orig.apply(this, arguments);
        _onGameTick();
      };
    }

    _data.initialized = true;
    _save();
    console.log('[AnalyticsEngine V88] 📊 Analytics Engine khởi động — ' + Object.keys(AE88_METRICS).length + ' metrics · 4 categories (World/NPC/XR/Creator) · Time Series · Dashboard sẵn sàng.');
  }

  // ── Public API ─────────────────────────────────────────────
  window.AE88_METRICS        = AE88_METRICS;
  window.ae88Data            = _data;

  window.ae88TrackEvent             = ae88TrackEvent;
  window.ae88TrackPanelOpen         = ae88TrackPanelOpen;
  window.ae88TrackTabOpen           = ae88TrackTabOpen;
  window.ae88TrackWorldCreationStep = ae88TrackWorldCreationStep;

  window.ae88GetTimeSeries    = ae88GetTimeSeries;
  window.ae88GetLatestValue   = ae88GetLatestValue;
  window.ae88GetTrend         = ae88GetTrend;
  window.ae88GetCurrentSnapshot = ae88GetCurrentSnapshot;
  window.ae88GetCategoryMetrics = ae88GetCategoryMetrics;
  window.ae88GetDashboard     = ae88GetDashboard;
  window.ae88GetStats         = ae88GetStats;
  window.ae88GetReport        = ae88GetReport;

  setTimeout(_init, 23600);

})();
