// ============================================================
// DISASTER RECOVERY SYSTEM V87
// Creator God V6 — Backup & Recovery Pass
// Health Check · Recovery Plans · Emergency Restore · Corruption Detection
// Init: 23500ms | Save: cgv6_disaster_recovery_v87
// ONLY EXTENDS — không xóa, không thay thế bất kỳ engine nào
// ============================================================

(function() {
  'use strict';

  const SAVE_KEY = 'cgv6_disaster_recovery_v87';
  const VERSION  = 'V87';

  // ── Recovery Scenarios ─────────────────────────────────────
  const DRS87_SCENARIOS = {
    WORLD_CORRUPTION:    { id: 'WORLD_CORRUPTION',    severity: 'CRITICAL', label: 'Dữ Liệu Thế Giới Hỏng' },
    NPC_ARRAY_INVALID:   { id: 'NPC_ARRAY_INVALID',   severity: 'HIGH',     label: 'Mảng NPC Không Hợp Lệ' },
    YEAR_REGRESSION:     { id: 'YEAR_REGRESSION',     severity: 'HIGH',     label: 'Năm Bị Lùi Về Trước' },
    ENGINE_CRASH:        { id: 'ENGINE_CRASH',        severity: 'CRITICAL', label: 'Engine Bị Crash' },
    LOCALSTORAGE_FULL:   { id: 'LOCALSTORAGE_FULL',   severity: 'HIGH',     label: 'localStorage Đầy' },
    SAVE_CORRUPTION:     { id: 'SAVE_CORRUPTION',     severity: 'CRITICAL', label: 'Dữ Liệu Save Hỏng' },
    MISSING_WORLD:       { id: 'MISSING_WORLD',       severity: 'HIGH',     label: 'Mất Dữ Liệu Thế Giới' },
    TICK_FREEZE:         { id: 'TICK_FREEZE',         severity: 'MEDIUM',   label: 'Game Tick Đóng Băng' },
    COUNTRY_COUNT_DROP:  { id: 'COUNTRY_COUNT_DROP',  severity: 'MEDIUM',   label: 'Số Quốc Gia Giảm Đột Ngột' },
    NPC_COUNT_DROP:      { id: 'NPC_COUNT_DROP',      severity: 'MEDIUM',   label: 'Số NPC Giảm Đột Ngột' },
  };

  // ── Recovery Actions ───────────────────────────────────────
  const DRS87_ACTIONS = {
    RESTORE_LAST:       'RESTORE_LAST',          // Restore snapshot mới nhất
    RESTORE_MILESTONE:  'RESTORE_MILESTONE',     // Restore milestone snapshot
    CLEAR_CORRUPT_DATA: 'CLEAR_CORRUPT_DATA',    // Xóa dữ liệu hỏng, reinit
    FREE_LOCALSTORAGE:  'FREE_LOCALSTORAGE',     // Giải phóng localStorage
    REINIT_ENGINE:      'REINIT_ENGINE',         // Reinit engine bị lỗi
    ALERT_ONLY:         'ALERT_ONLY',            // Chỉ cảnh báo
  };

  // ── State ──────────────────────────────────────────────────
  let _data = {
    version:       VERSION,
    initialized:   false,
    recoveryPlans: {},      // worldId → RecoveryPlan
    healthHistory: [],      // HealthCheckResult[] (last 50)
    incidents:     [],      // RecoveryIncident[] (last 100)
    lastFullCheck: 0,
    worldBaseline: null,    // snapshot of healthy state for comparison
    stats: {
      totalChecks:         0,
      issuesDetected:      0,
      issuesResolved:      0,
      emergencyRestores:   0,
      testRunsDone:        0,
      lastCheckAt:         0,
    },
  };

  // ── Utility ────────────────────────────────────────────────
  function _uid() {
    return 'inc_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
  }

  function _now()      { return Date.now(); }
  function _gameYear() { return (window.world && window.world.year) || (window.year) || 0; }

  function _save() {
    if (window.perfSave) {
      window.perfSave(SAVE_KEY, _data);
    } else {
      try {
        const saveData = Object.assign({}, _data, {
          healthHistory: _data.healthHistory.slice(0, 20),
          incidents:     _data.incidents.slice(0, 30),
        });
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      } catch(e) {}
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

  // ── Health Check Engine ────────────────────────────────────
  function drs87CheckWorldHealth(detailed) {
    _data.stats.totalChecks++;
    _data.stats.lastCheckAt = _now();

    const issues   = [];
    const warnings = [];
    const metrics  = {};

    // 1. World object
    if (!window.world || typeof window.world !== 'object') {
      issues.push({ scenario: 'MISSING_WORLD', detail: 'window.world không tồn tại hoặc không phải object' });
    } else {
      metrics.worldName = window.world.name || '?';
      metrics.worldYear = _gameYear();
      if (typeof metrics.worldYear !== 'number' || isNaN(metrics.worldYear)) {
        issues.push({ scenario: 'WORLD_CORRUPTION', detail: 'world.year không phải số hợp lệ' });
      }
    }

    // 2. Year regression (so với baseline)
    if (_data.worldBaseline && typeof _data.worldBaseline.year === 'number') {
      if (_gameYear() < _data.worldBaseline.year - 10) {
        warnings.push({ scenario: 'YEAR_REGRESSION', detail: 'Năm hiện tại (' + _gameYear() + ') thấp hơn baseline (' + _data.worldBaseline.year + ')' });
      }
    }

    // 3. NPCs
    if (window.npcs !== undefined) {
      const npcsArr = Array.isArray(window.npcs) ? window.npcs : (typeof window.npcs === 'object' ? Object.values(window.npcs) : null);
      if (!npcsArr) {
        issues.push({ scenario: 'NPC_ARRAY_INVALID', detail: 'window.npcs không phải Array hoặc Object' });
      } else {
        metrics.npcCount = npcsArr.length;
        if (_data.worldBaseline && _data.worldBaseline.npcCount > 0) {
          const drop = _data.worldBaseline.npcCount - npcsArr.length;
          if (drop > _data.worldBaseline.npcCount * 0.5) {
            warnings.push({ scenario: 'NPC_COUNT_DROP', detail: 'NPC giảm ' + drop + ' (từ ' + _data.worldBaseline.npcCount + ' → ' + npcsArr.length + ')' });
          }
        }
      }
    }

    // 4. Countries
    if (window.countries !== undefined) {
      const countriesArr = Array.isArray(window.countries) ? window.countries : (typeof window.countries === 'object' ? Object.values(window.countries) : null);
      metrics.countryCount = countriesArr ? countriesArr.length : 0;
      if (_data.worldBaseline && _data.worldBaseline.countryCount > 0) {
        const drop = _data.worldBaseline.countryCount - metrics.countryCount;
        if (drop > _data.worldBaseline.countryCount * 0.7) {
          warnings.push({ scenario: 'COUNTRY_COUNT_DROP', detail: 'Quốc gia giảm từ ' + _data.worldBaseline.countryCount + ' → ' + metrics.countryCount });
        }
      }
    }

    // 5. gameTick
    if (typeof window.gameTick !== 'function') {
      issues.push({ scenario: 'ENGINE_CRASH', detail: 'window.gameTick không phải function — vòng lặp game có thể đã crash' });
    }

    // 6. localStorage usage
    try {
      let totalSize = 0;
      for (let k in localStorage) {
        if (localStorage.hasOwnProperty(k)) {
          totalSize += (localStorage[k] || '').length * 2;
        }
      }
      metrics.localStorageSizeKB = Math.round(totalSize / 1024);
      const limitKB = 5 * 1024; // 5MB typical limit
      if (totalSize > limitKB * 1024 * 0.85) {
        warnings.push({ scenario: 'LOCALSTORAGE_FULL', detail: 'localStorage ' + metrics.localStorageSizeKB + 'KB / ~5120KB (' + Math.round(totalSize / (limitKB * 1024) * 100) + '%)' });
      }
    } catch(e) {}

    // 7. Critical save keys integrity (spot check)
    if (detailed) {
      const criticalKeys = ['cgv6_world_v1', 'cgv6_countries', 'cgv6_npc'];
      criticalKeys.forEach(function(key) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) JSON.parse(raw); // parse test
        } catch(e) {
          issues.push({ scenario: 'SAVE_CORRUPTION', detail: 'Save key "' + key + '" không parse được: ' + e.message });
        }
      });
    }

    const status = issues.length > 0 ? 'CRITICAL' : warnings.length > 0 ? 'WARNING' : 'HEALTHY';
    const result = {
      id:         _uid(),
      ts:         _now(),
      gameYear:   _gameYear(),
      status,
      issues,
      warnings,
      metrics,
      issueCount:  issues.length,
      warnCount:   warnings.length,
    };

    _data.healthHistory.unshift(result);
    if (_data.healthHistory.length > 50) _data.healthHistory.length = 50;

    if (issues.length > 0 || warnings.length > 0) {
      _data.stats.issuesDetected += issues.length + warnings.length;

      if (window.al86Log) {
        window.al86Log({
          category: 'SYSTEM',
          action:   'HEALTH_CHECK_' + status,
          detail:   issues.length + ' vấn đề nghiêm trọng · ' + warnings.length + ' cảnh báo',
          severity: status === 'CRITICAL' ? 'CRITICAL' : 'WARN',
        });
      }
    }

    return result;
  }

  // ── Recovery Plans ────────────────────────────────────────
  function drs87CreateRecoveryPlan(worldId, opts) {
    opts    = opts || {};
    worldId = worldId || (window.world && window.world.id) || 'default';

    _data.recoveryPlans[worldId] = {
      worldId,
      createdAt:        _now(),
      primaryAction:    opts.primaryAction   || DRS87_ACTIONS.RESTORE_LAST,
      fallbackAction:   opts.fallbackAction  || DRS87_ACTIONS.RESTORE_MILESTONE,
      autoRecover:      opts.autoRecover     !== false,
      notifyOnIssue:    opts.notifyOnIssue   !== false,
      maxRetries:       opts.maxRetries      || 3,
      retryCount:       0,
      lastActivatedAt:  null,
    };

    _save();
    return _data.recoveryPlans[worldId];
  }

  function drs87GetRecoveryPlan(worldId) {
    return _data.recoveryPlans[worldId] || null;
  }

  // ── Emergency Restore ──────────────────────────────────────
  function drs87EmergencyRestore(worldId, opts) {
    opts    = opts || {};
    worldId = worldId || (window.world && window.world.id) || 'default';

    if (!window.be87ListSnapshots) {
      return { success: false, error: 'BackupEngine V87 chưa sẵn sàng' };
    }

    _data.stats.emergencyRestores++;

    // Find best snapshot to restore
    const allSnaps = window.be87ListSnapshots();
    if (allSnaps.length === 0) {
      return { success: false, error: 'Không có snapshot nào để restore' };
    }

    // Priority: last MILESTONE > last MANUAL > last AUTO
    const findByType = function(type) {
      return allSnaps.find(function(s) { return s.type === type; });
    };

    const target = opts.snapshotId
      ? allSnaps.find(function(s) { return s.id === opts.snapshotId; })
      : (findByType('MILESTONE') || findByType('MANUAL') || allSnaps[0]);

    if (!target) {
      return { success: false, error: 'Không tìm thấy snapshot phù hợp' };
    }

    // Log the emergency
    const incident = {
      id:          _uid(),
      ts:          _now(),
      gameYear:    _gameYear(),
      type:        'EMERGENCY_RESTORE',
      snapshotId:  target.id,
      snapshotLabel: target.label,
      worldId,
      result:      null,
    };

    console.log('[DisasterRecovery V87] 🆘 EMERGENCY RESTORE → Snapshot:', target.label, '(Năm', target.gameYear + ')');

    const result = window.be87RestoreSnapshot(target.id, Object.assign({ noAutoBackup: opts.noAutoBackup }, opts));
    incident.result = result.success ? 'SUCCESS' : 'FAILED:' + result.error;

    _data.incidents.unshift(incident);
    if (_data.incidents.length > 100) _data.incidents.length = 100;

    if (result.success) {
      _data.stats.issuesResolved++;
      if (window.al86Log) {
        window.al86Log({
          category: 'SYSTEM',
          action:   'EMERGENCY_RESTORE_SUCCESS',
          detail:   'Restored to: ' + target.label + ' (Năm ' + target.gameYear + ')',
          severity: 'CRITICAL',
        });
      }
    }

    _save();
    return Object.assign(result, { restoredSnapshot: target });
  }

  // ── Set World Baseline ─────────────────────────────────────
  function drs87SetBaseline() {
    const npcsArr = Array.isArray(window.npcs) ? window.npcs
      : (typeof window.npcs === 'object' && window.npcs ? Object.values(window.npcs) : []);
    const countriesArr = Array.isArray(window.countries) ? window.countries
      : (typeof window.countries === 'object' && window.countries ? Object.values(window.countries) : []);

    _data.worldBaseline = {
      ts:           _now(),
      year:         _gameYear(),
      npcCount:     npcsArr.length,
      countryCount: countriesArr.length,
      worldName:    window.world && window.world.name || '?',
    };
    _save();
    return _data.worldBaseline;
  }

  // ── Recovery Test ──────────────────────────────────────────
  function drs87RunRecoveryTest() {
    _data.stats.testRunsDone++;
    const report = {
      ts:       _now(),
      gameYear: _gameYear(),
      tests:    [],
    };

    // Test 1: Can create snapshot?
    let t1 = { name: 'Tạo Snapshot', pass: false, detail: '' };
    try {
      if (window.be87CreateSnapshot) {
        const snap = window.be87CreateSnapshot('Recovery Test Snapshot', 'MANUAL');
        t1.pass   = !!snap;
        t1.detail = snap ? 'OK — ' + snap.id.substring(0, 16) : 'Failed: no snapshot returned';
        // Cleanup test snapshot
        if (snap) setTimeout(function() { window.be87DeleteSnapshot && window.be87DeleteSnapshot(snap.id); }, 100);
      } else {
        t1.detail = 'BackupEngine V87 chưa có';
      }
    } catch(e) { t1.detail = 'Error: ' + e.message; }
    report.tests.push(t1);

    // Test 2: Snapshot list accessible?
    let t2 = { name: 'Danh Sách Snapshot', pass: false, detail: '' };
    try {
      if (window.be87ListSnapshots) {
        const list = window.be87ListSnapshots();
        t2.pass   = Array.isArray(list);
        t2.detail = t2.pass ? list.length + ' snapshots sẵn sàng' : 'Not an array';
      } else { t2.detail = 'BackupEngine V87 chưa có'; }
    } catch(e) { t2.detail = 'Error: ' + e.message; }
    report.tests.push(t2);

    // Test 3: Health check runs?
    let t3 = { name: 'Health Check', pass: false, detail: '' };
    try {
      const hc = drs87CheckWorldHealth(false);
      t3.pass   = !!hc && !!hc.status;
      t3.detail = hc ? hc.status + ' — ' + hc.issueCount + ' issues · ' + hc.warnCount + ' warns' : 'No result';
    } catch(e) { t3.detail = 'Error: ' + e.message; }
    report.tests.push(t3);

    // Test 4: localStorage writable?
    let t4 = { name: 'localStorage Ghi Được', pass: false, detail: '' };
    try {
      const testKey = 'drs87_write_test';
      localStorage.setItem(testKey, '1');
      t4.pass   = localStorage.getItem(testKey) === '1';
      t4.detail = t4.pass ? 'OK' : 'Read mismatch';
      localStorage.removeItem(testKey);
    } catch(e) { t4.detail = 'Error: ' + e.message; }
    report.tests.push(t4);

    // Test 5: Audit logger available?
    let t5 = { name: 'Audit Logger V86', pass: typeof window.al86Log === 'function', detail: '' };
    t5.detail = t5.pass ? 'al86Log() sẵn sàng' : 'MISSING — security audit unavailable';
    report.tests.push(t5);

    // Test 6: Security layer available?
    let t6 = { name: 'Security Layer V86', pass: typeof window.sl86CheckAccess === 'function', detail: '' };
    t6.detail = t6.pass ? 'sl86CheckAccess() sẵn sàng' : 'MISSING — access control unavailable';
    report.tests.push(t6);

    const passed = report.tests.filter(function(t) { return t.pass; }).length;
    report.passed = passed;
    report.total  = report.tests.length;
    report.score  = Math.round((passed / report.tests.length) * 100) + '%';
    report.status = passed === report.tests.length ? 'ALL_PASS' : passed > report.tests.length * 0.7 ? 'MOSTLY_PASS' : 'FAIL';

    _data.incidents.unshift({
      id:      _uid(),
      ts:      _now(),
      type:    'RECOVERY_TEST',
      result:  report.status,
      detail:  passed + '/' + report.tests.length + ' tests passed',
    });

    if (window.al86Log) {
      window.al86Log({
        category: 'SYSTEM',
        action:   'RECOVERY_TEST_' + report.status,
        detail:   passed + '/' + report.tests.length + ' tests passed',
        severity: report.status === 'FAIL' ? 'CRITICAL' : 'INFO',
      });
    }

    _save();
    return report;
  }

  // ── Auto Recovery Logic ────────────────────────────────────
  function _autoRecoverIfNeeded(healthResult) {
    if (healthResult.status !== 'CRITICAL') return;

    const worldId = window.world && window.world.id || 'default';
    const plan    = _data.recoveryPlans[worldId];

    if (!plan || !plan.autoRecover) return;
    if (plan.retryCount >= plan.maxRetries) return;

    plan.retryCount++;
    plan.lastActivatedAt = _now();

    console.warn('[DisasterRecovery V87] 🔧 Auto Recovery triggered — attempt', plan.retryCount);
    drs87EmergencyRestore(worldId);
  }

  // ── Stats & Report ─────────────────────────────────────────
  function drs87GetStats() {
    const lastCheck = _data.healthHistory[0] || null;
    return Object.assign({}, _data.stats, {
      lastHealthStatus:  lastCheck ? lastCheck.status : 'N/A',
      lastCheckGameYear: lastCheck ? lastCheck.gameYear : 0,
      activePlans:       Object.keys(_data.recoveryPlans).length,
      recentIncidents:   _data.incidents.slice(0, 5),
    });
  }

  function drs87GetReport() {
    return {
      version:        VERSION,
      timestamp:      _now(),
      stats:          drs87GetStats(),
      currentHealth:  drs87CheckWorldHealth(false),
      recoveryPlans:  Object.values(_data.recoveryPlans),
      recentIncidents: _data.incidents.slice(0, 10),
      healthHistory:  _data.healthHistory.slice(0, 10),
    };
  }

  function drs87GetHealthHistory(n) {
    return _data.healthHistory.slice(0, n || 10);
  }

  // ── gameTick Hook ──────────────────────────────────────────
  let _tickCounter = 0;
  function _onGameTick() {
    _tickCounter++;

    // Health check every 200 ticks
    if (_tickCounter % 200 === 0) {
      const result = drs87CheckWorldHealth(false);
      if (result.status === 'CRITICAL') {
        _autoRecoverIfNeeded(result);
      }
    }

    // Full detailed check every 1000 ticks
    if (_tickCounter % 1000 === 0) {
      drs87CheckWorldHealth(true);
    }

    // Update baseline every 300 ticks when healthy
    if (_tickCounter % 300 === 0) {
      const lastCheck = _data.healthHistory[0];
      if (lastCheck && lastCheck.status === 'HEALTHY') {
        drs87SetBaseline();
      }
    }

    if (_tickCounter % 2000 === 0) _save();
  }

  // ── Init ───────────────────────────────────────────────────
  function _init() {
    _load();

    if (window.gameTick !== undefined) {
      const _orig = window.gameTick;
      window.gameTick = function() {
        if (_orig) _orig.apply(this, arguments);
        _onGameTick();
      };
    }

    // Set initial baseline
    setTimeout(function() {
      drs87SetBaseline();
      // Create default recovery plan for current world
      const worldId = window.world && window.world.id || 'default';
      drs87CreateRecoveryPlan(worldId, { autoRecover: true });
      // Run initial test
      const testResult = drs87RunRecoveryTest();
      console.log('[DisasterRecovery V87] Kiểm tra khởi động:', testResult.score, '(' + testResult.passed + '/' + testResult.total + ' tests)');
    }, 1500);

    _data.initialized = true;
    _save();
    console.log('[DisasterRecovery V87] 🛡️ Disaster Recovery khởi động — Health Check · Auto Recovery · Recovery Plans · Test Suite sẵn sàng.');
  }

  // ── Public API ─────────────────────────────────────────────
  window.DRS87_SCENARIOS   = DRS87_SCENARIOS;
  window.DRS87_ACTIONS     = DRS87_ACTIONS;
  window.drs87Data         = _data;

  window.drs87CheckWorldHealth    = drs87CheckWorldHealth;
  window.drs87CreateRecoveryPlan  = drs87CreateRecoveryPlan;
  window.drs87GetRecoveryPlan     = drs87GetRecoveryPlan;
  window.drs87EmergencyRestore    = drs87EmergencyRestore;
  window.drs87SetBaseline         = drs87SetBaseline;
  window.drs87RunRecoveryTest     = drs87RunRecoveryTest;

  window.drs87GetStats         = drs87GetStats;
  window.drs87GetReport        = drs87GetReport;
  window.drs87GetHealthHistory = drs87GetHealthHistory;

  setTimeout(_init, 23500);

})();
