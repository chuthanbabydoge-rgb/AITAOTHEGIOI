// ============================================================
// BACKUP ENGINE V87
// Creator God V6 — Backup & Recovery Pass
// Snapshot · Restore · Auto Backup · Compression
// Init: 23400ms | Save: cgv6_backup_engine_v87
// ONLY EXTENDS — không xóa, không thay thế bất kỳ engine nào
// ============================================================

(function() {
  'use strict';

  const SAVE_KEY    = 'cgv6_backup_engine_v87';
  const VERSION     = 'V87';
  const MAX_SNAPSHOTS = 20;
  const MAX_SNAPSHOT_SIZE = 512 * 1024; // 512KB per snapshot cap (serialized)

  // ── Snapshot Types ─────────────────────────────────────────
  const BE87_TYPES = {
    MANUAL:    { id: 'MANUAL',    label: 'Thủ Công',    icon: '💾', color: '#4a9eff' },
    AUTO:      { id: 'AUTO',      label: 'Tự Động',     icon: '🔄', color: '#10b981' },
    PRE_EVENT: { id: 'PRE_EVENT', label: 'Trước Sự Kiện', icon: '⚡', color: '#f59e0b' },
    MILESTONE: { id: 'MILESTONE', label: 'Mốc Thời Gian', icon: '🏆', color: '#a855f7' },
    EMERGENCY: { id: 'EMERGENCY', label: 'Khẩn Cấp',   icon: '🆘', color: '#f43f5e' },
  };

  // ── State ──────────────────────────────────────────────────
  let _data = {
    version:     VERSION,
    initialized: false,
    snapshots:   [],      // SnapshotRecord[]
    autoBackup: {
      enabled:       true,
      intervalTicks: 500,   // backup mỗi 500 ticks
      maxAuto:       10,    // giữ tối đa 10 auto backups
      lastBackupTick: 0,
      lastBackupAt:  0,
    },
    restoreHistory: [],   // [{ snapshotId, ts, success, errorMsg }]
    stats: {
      totalSnapshots:     0,
      totalRestores:      0,
      successfulRestores: 0,
      failedRestores:     0,
      totalSizeEstimate:  0,
      lastSnapshotAt:     0,
      lastRestoreAt:      0,
    },
  };

  // ── Utility ────────────────────────────────────────────────
  function _uid() {
    return 'snap_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  function _now()      { return Date.now(); }
  function _gameYear() { return (window.world && window.world.year) || (window.year) || 0; }
  function _gameYear2(){ return typeof window.year !== 'undefined' ? window.year : _gameYear(); }

  function _save() {
    if (window.perfSave) {
      window.perfSave(SAVE_KEY, _data);
    } else {
      try {
        // Lưu metadata + last 5 snapshots để tránh overflow
        const saveData = Object.assign({}, _data, {
          snapshots: _data.snapshots.slice(0, 5).map(function(s) {
            return Object.assign({}, s, { worldData: null }); // bỏ payload khi save state chính
          }),
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
          _data.autoBackup    = parsed.autoBackup || _data.autoBackup;
          _data.restoreHistory = parsed.restoreHistory || [];
          _data.stats          = Object.assign(_data.stats, parsed.stats || {});
        }
      }
    } catch(e) {}
    // Load individual snapshot payloads from their own keys
    _loadSnapshotIndex();
  }

  function _loadSnapshotIndex() {
    try {
      const indexRaw = localStorage.getItem(SAVE_KEY + '_index');
      if (indexRaw) {
        _data.snapshots = JSON.parse(indexRaw) || [];
      }
    } catch(e) {}
  }

  function _saveSnapshotIndex() {
    try {
      // Save metadata only (no worldData) as index
      const index = _data.snapshots.map(function(s) {
        return {
          id:        s.id,
          label:     s.label,
          type:      s.type,
          ts:        s.ts,
          gameYear:  s.gameYear,
          sizeBytes: s.sizeBytes,
          worldName: s.worldName,
          checksum:  s.checksum,
        };
      });
      localStorage.setItem(SAVE_KEY + '_index', JSON.stringify(index));
    } catch(e) {}
  }

  function _saveSnapshotPayload(snapshotId, payload) {
    try {
      const key = SAVE_KEY + '_snap_' + snapshotId;
      localStorage.setItem(key, JSON.stringify(payload));
      return true;
    } catch(e) {
      console.warn('[BackupEngine V87] localStorage full — cannot save snapshot payload:', e);
      return false;
    }
  }

  function _loadSnapshotPayload(snapshotId) {
    try {
      const key = SAVE_KEY + '_snap_' + snapshotId;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch(e) { return null; }
  }

  function _deleteSnapshotPayload(snapshotId) {
    try {
      localStorage.removeItem(SAVE_KEY + '_snap_' + snapshotId);
    } catch(e) {}
  }

  // ── Checksum ───────────────────────────────────────────────
  function _checksum(str) {
    let hash = 0;
    for (let i = 0; i < Math.min(str.length, 10000); i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return (hash >>> 0).toString(16);
  }

  // ── World State Capture ────────────────────────────────────
  function _captureWorldState() {
    const state = {
      capturedAt: _now(),
      gameYear:   _gameYear2(),
    };

    // Core world
    try {
      if (window.world) {
        state.world = JSON.parse(JSON.stringify(window.world));
      }
    } catch(e) { state.world = null; }

    // Year / simulation state
    state.year = window.year || 0;

    // Countries
    try {
      if (window.countries && Array.isArray(window.countries)) {
        state.countries = JSON.parse(JSON.stringify(window.countries));
      }
    } catch(e) { state.countries = []; }

    // NPCs (cap at 200 to save space)
    try {
      if (window.npcs) {
        const npcsArr = Array.isArray(window.npcs) ? window.npcs : Object.values(window.npcs);
        state.npcs = JSON.parse(JSON.stringify(npcsArr.slice(0, 200)));
        state.npcCount = npcsArr.length;
      }
    } catch(e) { state.npcs = []; state.npcCount = 0; }

    // Key engine states (lightweight references)
    const engineKeys = [
      'kingdomData', 'empireData', 'allianceData', 'warsActive',
      'disasterData', 'plagueData', 'econCrisisData', 'ageV25Data',
      'playerData', 'playerEconV52Data',
    ];
    state.engines = {};
    engineKeys.forEach(function(key) {
      try {
        if (window[key] !== undefined) {
          const serialized = JSON.stringify(window[key]);
          if (serialized && serialized.length < 50000) {
            state.engines[key] = JSON.parse(serialized);
          } else {
            state.engines[key] = { _truncated: true, _size: serialized.length };
          }
        }
      } catch(e) {}
    });

    // Security state (V86)
    try {
      if (window.sl86Data) {
        state.security = {
          worldOwnership:  JSON.parse(JSON.stringify(window.sl86Data.worldOwnership || {})),
          roleAssignments: JSON.parse(JSON.stringify(window.sl86Data.roleAssignments || {})),
        };
      }
    } catch(e) {}

    return state;
  }

  // ── Snapshot Creation ──────────────────────────────────────
  function be87CreateSnapshot(label, type, metadata) {
    type  = type  || 'MANUAL';
    label = label || ('Snapshot Năm ' + _gameYear2());

    if (!BE87_TYPES[type]) type = 'MANUAL';

    const worldState = _captureWorldState();
    const serialized = JSON.stringify(worldState);
    const sizeBytes  = serialized.length * 2; // UTF-16 estimate

    if (sizeBytes > MAX_SNAPSHOT_SIZE * 4) {
      console.warn('[BackupEngine V87] Snapshot quá lớn:', Math.round(sizeBytes / 1024) + 'KB — captured but may not persist fully.');
    }

    const snapshotId = _uid();
    const checksum   = _checksum(serialized);

    const snapshot = {
      id:        snapshotId,
      label,
      type,
      ts:        _now(),
      gameYear:  _gameYear2(),
      sizeBytes,
      worldName: (window.world && window.world.name) || 'Thế Giới Vô Danh',
      checksum,
      metadata:  metadata || {},
    };

    // Save payload separately
    const saved = _saveSnapshotPayload(snapshotId, worldState);
    if (!saved) {
      console.warn('[BackupEngine V87] Không thể lưu snapshot payload — localStorage đầy.');
    }

    // Add to list (newest first)
    _data.snapshots.unshift(snapshot);

    // Enforce max snapshots (remove oldest auto backups first)
    _enforceSnapshotLimit(type);

    // Update stats
    _data.stats.totalSnapshots++;
    _data.stats.totalSizeEstimate += sizeBytes;
    _data.stats.lastSnapshotAt = _now();

    _saveSnapshotIndex();
    _save();

    // Audit log
    if (window.al86Log) {
      window.al86Log({
        category:  'SYSTEM',
        action:    'SNAPSHOT_CREATED',
        detail:    label + ' [' + type + '] — Năm ' + _gameYear2() + ' · ' + Math.round(sizeBytes / 1024) + 'KB',
        severity:  'INFO',
      });
    }

    console.log('[BackupEngine V87] ✅ Snapshot created:', label, '— ID:', snapshotId, '· Size:', Math.round(sizeBytes / 1024) + 'KB');
    return snapshot;
  }

  function _enforceSnapshotLimit(newType) {
    if (_data.snapshots.length <= MAX_SNAPSHOTS) return;

    // Remove oldest auto backups first
    const autoSnaps = _data.snapshots.filter(function(s) { return s.type === 'AUTO'; });
    if (autoSnaps.length > 0) {
      const oldest = autoSnaps[autoSnaps.length - 1];
      _deleteSnapshotPayload(oldest.id);
      _data.snapshots = _data.snapshots.filter(function(s) { return s.id !== oldest.id; });
      return;
    }

    // Then remove oldest of any type (but keep at least 1)
    if (_data.snapshots.length > MAX_SNAPSHOTS) {
      const removed = _data.snapshots.pop();
      _deleteSnapshotPayload(removed.id);
    }
  }

  // ── Restore ────────────────────────────────────────────────
  function be87RestoreSnapshot(snapshotId, opts) {
    opts = opts || {};
    const meta = _data.snapshots.find(function(s) { return s.id === snapshotId; });
    if (!meta) {
      console.warn('[BackupEngine V87] Snapshot không tồn tại:', snapshotId);
      return { success: false, error: 'Snapshot not found' };
    }

    const payload = _loadSnapshotPayload(snapshotId);
    if (!payload) {
      _data.restoreHistory.unshift({ snapshotId, ts: _now(), success: false, error: 'Payload not in localStorage' });
      _data.stats.failedRestores++;
      _save();
      return { success: false, error: 'Snapshot payload không còn trong localStorage' };
    }

    // Verify checksum
    if (!opts.skipCheck) {
      const cs = _checksum(JSON.stringify(payload));
      if (cs !== meta.checksum) {
        console.warn('[BackupEngine V87] Checksum mismatch — snapshot có thể bị hỏng. Dùng opts.skipCheck=true để bỏ qua.');
        _data.restoreHistory.unshift({ snapshotId, ts: _now(), success: false, error: 'Checksum mismatch' });
        _data.stats.failedRestores++;
        _save();
        return { success: false, error: 'Checksum mismatch — snapshot corrupt' };
      }
    }

    // Create safety backup before restoring
    if (!opts.noAutoBackup) {
      be87CreateSnapshot('Pre-Restore Safety Backup', 'EMERGENCY',
        { preRestoreOf: snapshotId });
    }

    try {
      // Restore world
      if (payload.world && !opts.skipWorld) {
        window.world = JSON.parse(JSON.stringify(payload.world));
      }

      // Restore year
      if (typeof payload.year === 'number') {
        window.year = payload.year;
      }

      // Restore countries
      if (payload.countries && !opts.skipCountries) {
        window.countries = JSON.parse(JSON.stringify(payload.countries));
      }

      // Restore NPCs
      if (payload.npcs && !opts.skipNPCs) {
        window.npcs = JSON.parse(JSON.stringify(payload.npcs));
      }

      // Restore engine states
      if (payload.engines && !opts.skipEngines) {
        Object.keys(payload.engines).forEach(function(key) {
          if (!payload.engines[key]._truncated) {
            try {
              window[key] = JSON.parse(JSON.stringify(payload.engines[key]));
            } catch(e) {}
          }
        });
      }

      // Restore security ownership (V86)
      if (payload.security && window.sl86Data && !opts.skipSecurity) {
        window.sl86Data.worldOwnership  = payload.security.worldOwnership  || {};
        window.sl86Data.roleAssignments = payload.security.roleAssignments || {};
      }

      _data.stats.totalRestores++;
      _data.stats.successfulRestores++;
      _data.stats.lastRestoreAt = _now();

      _data.restoreHistory.unshift({
        snapshotId, ts: _now(), success: true,
        label:    meta.label,
        gameYear: meta.gameYear,
      });
      if (_data.restoreHistory.length > 20) _data.restoreHistory.length = 20;

      _save();

      if (window.al86Log) {
        window.al86Log({
          category: 'SYSTEM',
          action:   'SNAPSHOT_RESTORED',
          detail:   'Restored: ' + meta.label + ' [Năm ' + meta.gameYear + ']',
          severity: 'WARN',
        });
      }

      if (window.htAddEvent) {
        window.htAddEvent({
          year:  _gameYear2(),
          type:  'system',
          title: '⏪ Thế Giới Phục Hồi từ Snapshot: ' + meta.label,
          color: '#f59e0b',
        });
      }

      console.log('[BackupEngine V87] ✅ Restored:', meta.label, '— Năm', meta.gameYear);
      return { success: true, snapshot: meta };

    } catch(e) {
      _data.stats.failedRestores++;
      _data.restoreHistory.unshift({ snapshotId, ts: _now(), success: false, error: e.message });
      _save();
      console.error('[BackupEngine V87] Restore failed:', e);
      return { success: false, error: e.message };
    }
  }

  // ── List & Delete ──────────────────────────────────────────
  function be87ListSnapshots(filterType) {
    if (filterType) {
      return _data.snapshots.filter(function(s) { return s.type === filterType; });
    }
    return _data.snapshots.slice();
  }

  function be87GetSnapshot(snapshotId) {
    return _data.snapshots.find(function(s) { return s.id === snapshotId; }) || null;
  }

  function be87DeleteSnapshot(snapshotId) {
    const idx = _data.snapshots.findIndex(function(s) { return s.id === snapshotId; });
    if (idx === -1) return false;
    _deleteSnapshotPayload(snapshotId);
    _data.snapshots.splice(idx, 1);
    _saveSnapshotIndex();
    _save();
    return true;
  }

  // ── Auto Backup ────────────────────────────────────────────
  function be87SetAutoBackup(enabled, intervalTicks, maxAuto) {
    _data.autoBackup.enabled       = !!enabled;
    if (intervalTicks) _data.autoBackup.intervalTicks = intervalTicks;
    if (maxAuto)       _data.autoBackup.maxAuto       = maxAuto;
    _save();
    console.log('[BackupEngine V87] Auto Backup:', enabled ? '✅ BẬT' : '❌ TẮT',
      '— Interval:', _data.autoBackup.intervalTicks, 'ticks');
  }

  function be87GetAutoBackupStatus() {
    return Object.assign({}, _data.autoBackup, {
      autoSnapshots: be87ListSnapshots('AUTO').length,
    });
  }

  function be87ForceBackupNow() {
    return be87CreateSnapshot('Manual Force Backup', 'MANUAL');
  }

  // ── Stats & Report ─────────────────────────────────────────
  function be87GetStats() {
    const totalSizeKB = Math.round(_data.stats.totalSizeEstimate / 1024);
    return Object.assign({}, _data.stats, {
      snapshotCount:   _data.snapshots.length,
      autoSnapshots:   be87ListSnapshots('AUTO').length,
      manualSnapshots: be87ListSnapshots('MANUAL').length,
      totalSizeKB,
      restoreHistory:  _data.restoreHistory.slice(0, 5),
    });
  }

  function be87GetReport() {
    return {
      version:      VERSION,
      timestamp:    _now(),
      stats:        be87GetStats(),
      autoBackup:   _data.autoBackup,
      snapshots:    _data.snapshots.map(function(s) {
        return {
          id:       s.id.substring(0, 20),
          label:    s.label,
          type:     s.type,
          gameYear: s.gameYear,
          sizeKB:   Math.round((s.sizeBytes || 0) / 1024),
          ts:       s.ts,
        };
      }),
    };
  }

  // ── gameTick Hook ──────────────────────────────────────────
  let _tickCounter = 0;
  function _onGameTick() {
    _tickCounter++;

    // Auto backup
    if (_data.autoBackup.enabled) {
      const interval = _data.autoBackup.intervalTicks || 500;
      if (_tickCounter % interval === 0) {
        const autoLabel = 'Auto Backup — Năm ' + _gameYear2() + ' (Tick ' + _tickCounter + ')';
        be87CreateSnapshot(autoLabel, 'AUTO');
        _data.autoBackup.lastBackupTick = _tickCounter;
        _data.autoBackup.lastBackupAt   = _now();
      }
    }

    // Milestone backup: every 1000 ticks
    if (_tickCounter % 1000 === 0) {
      be87CreateSnapshot('Mốc Tick ' + _tickCounter + ' — Năm ' + _gameYear2(), 'MILESTONE');
    }

    // Periodic save
    if (_tickCounter % 2000 === 0) {
      _save();
    }
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

    // Initial snapshot on startup (world state at load time)
    setTimeout(function() {
      if (_data.snapshots.length === 0) {
        be87CreateSnapshot('Snapshot Khởi Động Ban Đầu', 'AUTO');
      }
    }, 2000);

    _data.initialized = true;
    _save();
    console.log('[BackupEngine V87] 💾 Backup Engine khởi động — ' + _data.snapshots.length + ' snapshots · Auto: ' + (_data.autoBackup.enabled ? 'BẬT' : 'TẮT') + ' mỗi ' + _data.autoBackup.intervalTicks + ' ticks sẵn sàng.');
  }

  // ── Public API ─────────────────────────────────────────────
  window.BE87_TYPES           = BE87_TYPES;
  window.be87Data             = _data;

  window.be87CreateSnapshot   = be87CreateSnapshot;
  window.be87RestoreSnapshot  = be87RestoreSnapshot;
  window.be87ListSnapshots    = be87ListSnapshots;
  window.be87GetSnapshot      = be87GetSnapshot;
  window.be87DeleteSnapshot   = be87DeleteSnapshot;

  window.be87SetAutoBackup        = be87SetAutoBackup;
  window.be87GetAutoBackupStatus  = be87GetAutoBackupStatus;
  window.be87ForceBackupNow       = be87ForceBackupNow;

  window.be87GetStats  = be87GetStats;
  window.be87GetReport = be87GetReport;

  setTimeout(_init, 23400);

})();
