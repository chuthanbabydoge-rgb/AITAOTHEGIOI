// ============================================================
// AUDIT LOGGER V86
// Creator God V6 — Security Pass
// Tamper-Evident Audit Log · Query/Filter · Export · Integrity
// Init: 23300ms | Save: cgv6_audit_logger_v86
// ONLY EXTENDS — không xóa, không thay thế bất kỳ engine nào
// ============================================================

(function() {
  'use strict';

  const SAVE_KEY = 'cgv6_audit_logger_v86';
  const VERSION  = 'V86';
  const MAX_LOGS = 2000;

  // ── Log Categories ─────────────────────────────────────────
  const AL86_CATEGORIES = {
    WORLD:     { id: 'WORLD',     label: 'Thế Giới',    icon: '🌍', color: '#4a9eff' },
    NPC:       { id: 'NPC',       label: 'NPC',         icon: '👤', color: '#a855f7' },
    ECONOMY:   { id: 'ECONOMY',   label: 'Kinh Tế',     icon: '💹', color: '#10b981' },
    MILITARY:  { id: 'MILITARY',  label: 'Quân Sự',     icon: '⚔️', color: '#ef4444' },
    DIPLOMACY: { id: 'DIPLOMACY', label: 'Ngoại Giao',  icon: '🤝', color: '#f59e0b' },
    RELIGION:  { id: 'RELIGION',  label: 'Tôn Giáo',    icon: '⛪', color: '#8b5cf6' },
    SECURITY:  { id: 'SECURITY',  label: 'Bảo Mật',     icon: '🔒', color: '#f43f5e' },
    ACCESS:    { id: 'ACCESS',    label: 'Truy Cập',    icon: '🚪', color: '#06b6d4' },
    ADMIN:     { id: 'ADMIN',     label: 'Quản Trị',    icon: '⚙️', color: '#64748b' },
    AI:        { id: 'AI',        label: 'AI',          icon: '🤖', color: '#84cc16' },
    SHARD:     { id: 'SHARD',     label: 'Shard',       icon: '🌐', color: '#fb923c' },
    SYSTEM:    { id: 'SYSTEM',    label: 'Hệ Thống',    icon: '💻', color: '#94a3b8' },
  };

  // ── Severity Levels ────────────────────────────────────────
  const AL86_SEVERITY = {
    DEBUG:    { id: 'DEBUG',    level: 0, color: '#64748b', label: 'Debug' },
    INFO:     { id: 'INFO',     level: 1, color: '#4a9eff', label: 'Thông Tin' },
    WARN:     { id: 'WARN',     level: 2, color: '#f59e0b', label: 'Cảnh Báo' },
    CRITICAL: { id: 'CRITICAL', level: 3, color: '#f43f5e', label: 'Nghiêm Trọng' },
  };

  // ── State ──────────────────────────────────────────────────
  let _data = {
    version:     VERSION,
    initialized: false,
    logs:        [],           // AuditLogEntry[]
    checksums:   {},           // logId → checksum (tamper detection)
    buckets:     {},           // category → count
    hourlyVolume: [],          // [{ hour, count }] last 24 hours
    alerts:      [],           // critical alerts
    exportHistory: [],         // past exports metadata
    stats: {
      totalLogs:        0,
      byCategory:       {},
      bySeverity:       {},
      totalCritical:    0,
      totalWarns:       0,
      tamperAttempts:   0,
      logsDropped:      0,
      lastLogAt:        0,
    },
  };

  // ── Utility ────────────────────────────────────────────────
  function _uid() {
    return 'log_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  function _now() { return Date.now(); }

  function _gameYear() {
    return (window.world && window.world.year) || (window.year) || 0;
  }

  function _save() {
    if (window.perfSave) {
      window.perfSave(SAVE_KEY, _data);
    } else {
      try {
        // Only save the last 500 logs to avoid localStorage overflow
        const saveData = Object.assign({}, _data, { logs: _data.logs.slice(0, 500) });
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

  // ── Checksum (lightweight tamper detection) ─────────────────
  // Không dùng crypto thực sự — dùng simple hash để phát hiện
  // thay đổi thô (không phải bảo mật mức cryptographic)
  function _checksum(entry) {
    const str = entry.id + '|' + entry.ts + '|' + entry.category + '|' +
                entry.action + '|' + (entry.actorId || '') + '|' + (entry.detail || '');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return (hash >>> 0).toString(16);
  }

  function _verifyChecksum(entry) {
    const expected = _data.checksums[entry.id];
    if (!expected) return true; // no checksum stored → skip
    return _checksum(entry) === expected;
  }

  // ── Core Log Function ──────────────────────────────────────
  function al86Log(opts) {
    opts = opts || {};
    const category = opts.category  || 'SYSTEM';
    const severity = opts.severity  || 'INFO';
    const action   = opts.action    || 'UNKNOWN';
    const actorId  = opts.actorId   || (window.sl86Data && window.sl86Data.currentPrincipalId) || 'system';

    const entry = {
      id:         _uid(),
      ts:         _now(),
      gameYear:   _gameYear(),
      category,
      severity,
      action,
      actorId,
      resourceId: opts.resourceId || null,
      resourceType: opts.resourceType || null,
      detail:     opts.detail      || '',
      metadata:   opts.metadata    || null,
      worldId:    opts.worldId     || (window.world && window.world.id) || null,
      sessionId:  window.sl86Data  && window.sl86Data.currentSessionId || null,
      seq:        _data.stats.totalLogs + 1,
    };

    // Store checksum
    _data.checksums[entry.id] = _checksum(entry);

    // Prepend to logs (newest first)
    _data.logs.unshift(entry);

    // Rotate if over limit
    if (_data.logs.length > MAX_LOGS) {
      const dropped = _data.logs.splice(MAX_LOGS);
      _data.stats.logsDropped += dropped.length;
    }

    // Update stats
    _data.stats.totalLogs++;
    _data.stats.lastLogAt = entry.ts;
    _data.stats.byCategory[category]  = (_data.stats.byCategory[category]  || 0) + 1;
    _data.stats.bySeverity[severity]  = (_data.stats.bySeverity[severity]  || 0) + 1;
    _data.buckets[category]           = (_data.buckets[category]           || 0) + 1;

    if (severity === 'CRITICAL') {
      _data.stats.totalCritical++;
      _addAlert(entry);
    }
    if (severity === 'WARN') {
      _data.stats.totalWarns++;
    }

    // Record session action
    if (window.sl86RecordAction) window.sl86RecordAction();

    return entry;
  }

  function _addAlert(entry) {
    _data.alerts.unshift({
      logId:    entry.id,
      ts:       entry.ts,
      category: entry.category,
      action:   entry.action,
      detail:   entry.detail,
      actorId:  entry.actorId,
      resolved: false,
    });
    if (_data.alerts.length > 100) _data.alerts.length = 100;
  }

  // ── Convenience Loggers ────────────────────────────────────
  function al86LogWorldEvent(action, detail, actorId) {
    return al86Log({ category: 'WORLD', action, detail, actorId, severity: 'INFO' });
  }

  function al86LogNPCEvent(action, npcId, detail, actorId) {
    return al86Log({ category: 'NPC', action, resourceId: npcId, detail, actorId, severity: 'INFO' });
  }

  function al86LogEconomyEvent(action, detail, actorId) {
    return al86Log({ category: 'ECONOMY', action, detail, actorId, severity: 'INFO' });
  }

  function al86LogSecurityEvent(action, detail, severity, actorId) {
    return al86Log({ category: 'SECURITY', action, detail, actorId, severity: severity || 'WARN' });
  }

  function al86LogAccessEvent(principalId, action, allowed, resource, worldId) {
    return al86Log({
      category:  'ACCESS',
      action:    allowed ? 'ACCESS_GRANTED' : 'ACCESS_DENIED',
      actorId:   principalId,
      resourceId: resource,
      worldId,
      detail:    action + ' on ' + resource + ' → ' + (allowed ? '✅ GRANTED' : '❌ DENIED'),
      severity:  allowed ? 'INFO' : 'WARN',
    });
  }

  function al86LogAICall(engine, taskType, model, costEstimate, actorId) {
    return al86Log({
      category:  'AI',
      action:    'AI_CALL',
      actorId:   actorId || 'system',
      detail:    engine + ' · ' + taskType + ' · ' + model + ' · est. $' + (costEstimate || 0).toFixed(6),
      severity:  'DEBUG',
      metadata:  { engine, taskType, model, costEstimate },
    });
  }

  function al86LogShardEvent(action, shardId, detail) {
    return al86Log({ category: 'SHARD', action, resourceId: shardId, detail, severity: 'INFO' });
  }

  // ── Query & Filter ─────────────────────────────────────────
  function al86Query(opts) {
    opts = opts || {};
    let results = _data.logs;

    // Filters
    if (opts.category)    results = results.filter(function(l) { return l.category  === opts.category;  });
    if (opts.severity)    results = results.filter(function(l) { return l.severity  === opts.severity;  });
    if (opts.action)      results = results.filter(function(l) { return l.action    === opts.action;    });
    if (opts.actorId)     results = results.filter(function(l) { return l.actorId   === opts.actorId;   });
    if (opts.worldId)     results = results.filter(function(l) { return l.worldId   === opts.worldId;   });
    if (opts.resourceId)  results = results.filter(function(l) { return l.resourceId === opts.resourceId; });
    if (opts.fromTs)      results = results.filter(function(l) { return l.ts >= opts.fromTs; });
    if (opts.toTs)        results = results.filter(function(l) { return l.ts <= opts.toTs;   });
    if (opts.fromYear)    results = results.filter(function(l) { return l.gameYear >= opts.fromYear; });
    if (opts.toYear)      results = results.filter(function(l) { return l.gameYear <= opts.toYear;   });
    if (opts.search)      results = results.filter(function(l) {
      return l.detail.toLowerCase().includes(opts.search.toLowerCase()) ||
             l.action.toLowerCase().includes(opts.search.toLowerCase());
    });

    // Minimum severity level filter
    if (opts.minSeverity) {
      const minLevel = AL86_SEVERITY[opts.minSeverity] ? AL86_SEVERITY[opts.minSeverity].level : 0;
      results = results.filter(function(l) {
        return (AL86_SEVERITY[l.severity] || AL86_SEVERITY.INFO).level >= minLevel;
      });
    }

    // Pagination
    const total  = results.length;
    const limit  = opts.limit || 50;
    const offset = opts.offset || 0;
    results = results.slice(offset, offset + limit);

    return { total, offset, limit, results };
  }

  function al86GetRecent(n, minSeverity) {
    return al86Query({ limit: n || 50, minSeverity }).results;
  }

  function al86GetByCategory(category, limit) {
    return al86Query({ category, limit: limit || 30 }).results;
  }

  function al86GetCritical(limit) {
    return al86Query({ severity: 'CRITICAL', limit: limit || 20 }).results;
  }

  function al86GetAlerts(onlyUnresolved) {
    if (onlyUnresolved) {
      return _data.alerts.filter(function(a) { return !a.resolved; });
    }
    return _data.alerts.slice(0, 50);
  }

  function al86ResolveAlert(index) {
    if (_data.alerts[index]) {
      _data.alerts[index].resolved = true;
      _save();
      return true;
    }
    return false;
  }

  // ── Integrity Verification ─────────────────────────────────
  function al86VerifyIntegrity(sampleSize) {
    sampleSize = sampleSize || 100;
    const sample = _data.logs.slice(0, sampleSize);
    let passed = 0, failed = 0;
    const tampered = [];

    sample.forEach(function(entry) {
      if (_verifyChecksum(entry)) {
        passed++;
      } else {
        failed++;
        tampered.push(entry.id);
        _data.stats.tamperAttempts++;
        al86Log({
          category: 'SECURITY',
          action:   'INTEGRITY_VIOLATION',
          detail:   'Log entry tampered: ' + entry.id,
          severity: 'CRITICAL',
        });
      }
    });

    return {
      checked:  sample.length,
      passed,
      failed,
      tampered,
      integrityScore: sample.length > 0 ? Math.round((passed / sample.length) * 100) : 100,
    };
  }

  // ── Export ─────────────────────────────────────────────────
  function al86Export(opts) {
    opts = opts || {};
    const results = al86Query(opts).results;
    const format  = opts.format || 'json';

    let output;
    if (format === 'csv') {
      const headers = ['seq', 'ts', 'gameYear', 'category', 'severity', 'action', 'actorId', 'resourceId', 'detail'];
      const rows    = results.map(function(l) {
        return headers.map(function(h) {
          const v = l[h] === null || l[h] === undefined ? '' : String(l[h]);
          return '"' + v.replace(/"/g, '""') + '"';
        }).join(',');
      });
      output = headers.join(',') + '\n' + rows.join('\n');
    } else {
      output = JSON.stringify({
        exported:  _now(),
        filter:    opts,
        count:     results.length,
        integrity: al86VerifyIntegrity(Math.min(results.length, 50)),
        logs:      results,
      }, null, 2);
    }

    _data.exportHistory.unshift({
      ts:     _now(),
      count:  results.length,
      format,
      filter: opts,
    });
    if (_data.exportHistory.length > 20) _data.exportHistory.length = 20;
    _save();

    return { output, count: results.length, format };
  }

  // ── Hourly Volume Tracking ─────────────────────────────────
  function _updateHourlyVolume() {
    const hourKey = Math.floor(_now() / 3600000);
    const last    = _data.hourlyVolume[0];
    if (last && last.hour === hourKey) {
      last.count++;
    } else {
      _data.hourlyVolume.unshift({ hour: hourKey, count: 1, ts: _now() });
      if (_data.hourlyVolume.length > 24) _data.hourlyVolume.length = 24;
    }
  }

  // ── Stats & Dashboard ──────────────────────────────────────
  function al86GetStats() {
    return {
      totalLogs:      _data.stats.totalLogs,
      logsInMemory:   _data.logs.length,
      logsDropped:    _data.stats.logsDropped,
      byCategory:     _data.stats.byCategory,
      bySeverity:     _data.stats.bySeverity,
      totalCritical:  _data.stats.totalCritical,
      totalWarns:     _data.stats.totalWarns,
      tamperAttempts: _data.stats.tamperAttempts,
      activeAlerts:   _data.alerts.filter(function(a) { return !a.resolved; }).length,
      lastLogAt:      _data.stats.lastLogAt,
      hourlyVolume:   _data.hourlyVolume.slice(0, 6),
    };
  }

  function al86GetDashboard() {
    const stats    = al86GetStats();
    const recent   = al86GetRecent(10, 'INFO');
    const critical = al86GetCritical(5);

    // Top actors
    const actorCounts = {};
    _data.logs.slice(0, 200).forEach(function(l) {
      actorCounts[l.actorId] = (actorCounts[l.actorId] || 0) + 1;
    });
    const topActors = Object.entries(actorCounts)
      .sort(function(a, b) { return b[1] - a[1]; })
      .slice(0, 5)
      .map(function(e) { return { actorId: e[0], count: e[1] }; });

    // Top categories
    const topCategories = Object.entries(_data.stats.byCategory)
      .sort(function(a, b) { return b[1] - a[1]; })
      .slice(0, 6)
      .map(function(e) { return { category: e[0], count: e[1], icon: (AL86_CATEGORIES[e[0]] || {}).icon || '📋' }; });

    return {
      stats,
      recent,
      critical,
      topActors,
      topCategories,
      integrity: al86VerifyIntegrity(50),
      alerts:    al86GetAlerts(true).slice(0, 5),
    };
  }

  function al86GetReport() {
    return {
      version:       VERSION,
      timestamp:     _now(),
      stats:         al86GetStats(),
      dashboard:     al86GetDashboard(),
      exportHistory: _data.exportHistory.slice(0, 5),
    };
  }

  // ── Hook into existing systems ─────────────────────────────
  function _patchExistingSystems() {
    // Patch htAddEvent to also log to audit
    if (typeof window.htAddEvent === 'function') {
      const _orig = window.htAddEvent;
      window.htAddEvent = function(eventData) {
        const result = _orig.apply(this, arguments);
        const detail = typeof eventData === 'string' ? eventData
          : (eventData && eventData.title ? eventData.title : JSON.stringify(eventData));
        // Only log if not already an audit log (avoid recursion)
        if (typeof detail === 'string' && !detail.startsWith('[AuditLogger')) {
          al86Log({ category: 'WORLD', action: 'HISTORY_EVENT', detail: detail.substring(0, 200), severity: 'DEBUG' });
        }
        return result;
      };
    }
  }

  // ── gameTick Hook ──────────────────────────────────────────
  let _tickCounter = 0;
  function _onGameTick() {
    _tickCounter++;

    // Every 100 ticks: update hourly volume
    if (_tickCounter % 100 === 0) {
      _updateHourlyVolume();
    }

    // Every 500 ticks: auto-save
    if (_tickCounter % 500 === 0) {
      _save();
    }

    // Every 3000 ticks: integrity check of recent 100 logs
    if (_tickCounter % 3000 === 0) {
      const check = al86VerifyIntegrity(100);
      if (check.failed > 0) {
        al86Log({
          category: 'SECURITY',
          action:   'INTEGRITY_CHECK_FAILED',
          detail:   check.failed + ' log entries failed integrity check',
          severity: 'CRITICAL',
        });
      }
    }
  }

  // ── Init ───────────────────────────────────────────────────
  function _init() {
    _load();

    // Patch existing systems after a brief delay to ensure they're loaded
    setTimeout(_patchExistingSystems, 500);

    // gameTick hook
    if (window.gameTick !== undefined) {
      const _orig = window.gameTick;
      window.gameTick = function() {
        if (_orig) _orig.apply(this, arguments);
        _onGameTick();
      };
    }

    // Log system startup
    al86Log({
      category: 'SYSTEM',
      action:   'AUDIT_LOGGER_STARTED',
      detail:   'AuditLogger V86 khởi động — ' + _data.stats.totalLogs + ' logs từ phiên trước.',
      severity: 'INFO',
    });

    _data.initialized = true;
    _save();
    console.log('[AuditLogger V86] 📋 Audit Logger khởi động — ' + MAX_LOGS + ' log capacity · Tamper-Evident · Query/Filter/Export · ' + Object.keys(AL86_CATEGORIES).length + ' categories sẵn sàng.');
  }

  // ── Public API ─────────────────────────────────────────────
  window.AL86_CATEGORIES = AL86_CATEGORIES;
  window.AL86_SEVERITY   = AL86_SEVERITY;
  window.al86Data        = _data;

  window.al86Log              = al86Log;
  window.al86LogWorldEvent    = al86LogWorldEvent;
  window.al86LogNPCEvent      = al86LogNPCEvent;
  window.al86LogEconomyEvent  = al86LogEconomyEvent;
  window.al86LogSecurityEvent = al86LogSecurityEvent;
  window.al86LogAccessEvent   = al86LogAccessEvent;
  window.al86LogAICall        = al86LogAICall;
  window.al86LogShardEvent    = al86LogShardEvent;

  window.al86Query          = al86Query;
  window.al86GetRecent      = al86GetRecent;
  window.al86GetByCategory  = al86GetByCategory;
  window.al86GetCritical    = al86GetCritical;
  window.al86GetAlerts      = al86GetAlerts;
  window.al86ResolveAlert   = al86ResolveAlert;

  window.al86VerifyIntegrity = al86VerifyIntegrity;
  window.al86Export          = al86Export;

  window.al86GetStats      = al86GetStats;
  window.al86GetDashboard  = al86GetDashboard;
  window.al86GetReport     = al86GetReport;

  setTimeout(_init, 23300);

})();
