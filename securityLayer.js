// ============================================================
// SECURITY LAYER V86
// Creator God V6 — Security Pass
// RBAC · World Ownership · Access Control · Session Management
// Init: 23100ms | Save: cgv6_security_layer_v86
// ONLY EXTENDS — không xóa, không thay thế bất kỳ engine nào
// ============================================================

(function() {
  'use strict';

  const SAVE_KEY = 'cgv6_security_layer_v86';
  const VERSION  = 'V86';

  // ── RBAC Roles (thứ tự tăng dần về quyền hạn) ─────────────
  const SL86_ROLES = {
    GUEST:   { id: 'GUEST',   level: 0, label: 'Khách',          color: '#888888', description: 'Chỉ xem — không thể thay đổi bất kỳ thứ gì' },
    MEMBER:  { id: 'MEMBER',  level: 1, label: 'Thành Viên',     color: '#4a9eff', description: 'Tương tác cơ bản với thế giới' },
    ELDER:   { id: 'ELDER',   level: 2, label: 'Trưởng Lão',     color: '#a855f7', description: 'Quản lý NPC và sự kiện' },
    MASTER:  { id: 'MASTER',  level: 3, label: 'Tông Chủ',       color: '#f59e0b', description: 'Quản lý đầy đủ trong phạm vi được cấp' },
    CREATOR: { id: 'CREATOR', level: 4, label: 'Thánh Tạo Hóa',  color: '#10b981', description: 'Sở hữu và kiểm soát thế giới' },
    GOD:     { id: 'GOD',     level: 5, label: 'Thần',           color: '#f43f5e', description: 'Quyền năng tối thượng — không giới hạn' },
  };

  // ── Resource Types ─────────────────────────────────────────
  const SL86_RESOURCES = {
    WORLD:     'WORLD',
    NPC:       'NPC',
    COUNTRY:   'COUNTRY',
    ECONOMY:   'ECONOMY',
    RELIGION:  'RELIGION',
    MILITARY:  'MILITARY',
    DIPLOMACY: 'DIPLOMACY',
    TIMELINE:  'TIMELINE',
    SHARD:     'SHARD',
    TENANT:    'TENANT',
    CLUSTER:   'CLUSTER',
    SYSTEM:    'SYSTEM',
  };

  // ── Security Event Types ───────────────────────────────────
  const SL86_EVENTS = {
    ACCESS_GRANTED:   'ACCESS_GRANTED',
    ACCESS_DENIED:    'ACCESS_DENIED',
    WORLD_CREATED:    'WORLD_CREATED',
    WORLD_DELETED:    'WORLD_DELETED',
    WORLD_OWNERSHIP_TRANSFER: 'WORLD_OWNERSHIP_TRANSFER',
    ROLE_ASSIGNED:    'ROLE_ASSIGNED',
    ROLE_REVOKED:     'ROLE_REVOKED',
    PERMISSION_GRANT: 'PERMISSION_GRANT',
    PERMISSION_DENY:  'PERMISSION_DENY',
    SESSION_START:    'SESSION_START',
    SESSION_END:      'SESSION_END',
    SECURITY_BREACH:  'SECURITY_BREACH',
    QUOTA_VIOLATION:  'QUOTA_VIOLATION',
  };

  // ── State ──────────────────────────────────────────────────
  let _data = {
    version: VERSION,
    initialized: false,

    // World ownership registry
    worldOwnership: {},     // worldId → { ownerId, ownerRole, registeredAt, transferHistory }

    // Principal registry (user/creator identities)
    principals: {},         // principalId → PrincipalRecord

    // Role assignments: principalId → { globalRole, worldRoles: { worldId: role } }
    roleAssignments: {},

    // Security events
    securityEvents: [],

    // Active sessions
    sessions: {},           // sessionId → SessionRecord

    // Current principal (local simulation)
    currentPrincipalId: null,
    currentSessionId:   null,

    stats: {
      totalWorlds:         0,
      totalPrincipals:     0,
      accessGranted:       0,
      accessDenied:        0,
      securityBreaches:    0,
      ownershipTransfers:  0,
    },
  };

  // ── Utility ────────────────────────────────────────────────
  function _uid(prefix) {
    return (prefix || 'id') + '_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
  }

  function _now() { return Date.now(); }

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

  function _secEvent(type, principalId, resource, resourceId, detail, severity) {
    const ev = {
      id:          _uid('sev'),
      ts:          _now(),
      type,
      principalId: principalId || _data.currentPrincipalId || 'system',
      resource:    resource    || 'SYSTEM',
      resourceId:  resourceId  || null,
      detail:      detail      || '',
      severity:    severity    || 'INFO',   // INFO | WARN | CRITICAL
    };
    _data.securityEvents.unshift(ev);
    if (_data.securityEvents.length > 1000) _data.securityEvents.length = 1000;

    // Forward severe events to audit logger if available
    if (window.al86Log) {
      window.al86Log({
        category:   'SECURITY',
        action:     type,
        actorId:    ev.principalId,
        resourceId: ev.resourceId,
        detail:     ev.detail,
        severity:   ev.severity,
      });
    }

    // Forward critical events to history
    if (severity === 'CRITICAL' && window.htAddEvent) {
      window.htAddEvent('[Security V86] 🔒 ' + type + ': ' + detail);
    }
    return ev;
  }

  // ── Principal Management ───────────────────────────────────
  function sl86RegisterPrincipal(opts) {
    opts = opts || {};
    const principalId = opts.principalId || _uid('principal');
    const displayName = opts.displayName || 'Creator #' + (_data.stats.totalPrincipals + 1);
    const globalRole  = opts.globalRole  || 'MEMBER';

    if (!SL86_ROLES[globalRole]) {
      console.warn('[SL86] Invalid role:', globalRole);
      return null;
    }

    _data.principals[principalId] = {
      principalId,
      displayName,
      globalRole,
      createdAt:   _now(),
      lastActiveAt: _now(),
      metadata:    opts.metadata || {},
    };

    _data.roleAssignments[principalId] = {
      globalRole,
      worldRoles: {},   // worldId → role override
    };

    _data.stats.totalPrincipals++;
    _secEvent(SL86_EVENTS.ROLE_ASSIGNED, principalId, 'SYSTEM', null, 'Global role: ' + globalRole);
    _save();
    return _data.principals[principalId];
  }

  function sl86GetOrCreateLocalPrincipal() {
    // Use existing or derive from world data
    if (_data.currentPrincipalId && _data.principals[_data.currentPrincipalId]) {
      return _data.principals[_data.currentPrincipalId];
    }

    const creatorId = (window.world && window.world.creatorId) ||
                      (window.puosCoreV81Data && window.puosCoreV81Data.universeId) ||
                      'local_god';
    const existing = Object.values(_data.principals).find(function(p) { return p.principalId === creatorId; });
    if (existing) {
      _data.currentPrincipalId = existing.principalId;
      return existing;
    }

    const principal = sl86RegisterPrincipal({
      principalId: creatorId,
      displayName: 'Thần Sáng Thế Chủ',
      globalRole: 'GOD',
    });
    _data.currentPrincipalId = principal.principalId;
    return principal;
  }

  function sl86GetPrincipal(principalId) {
    return _data.principals[principalId] || null;
  }

  function sl86GetCurrentPrincipal() {
    if (!_data.currentPrincipalId) sl86GetOrCreateLocalPrincipal();
    return _data.principals[_data.currentPrincipalId] || null;
  }

  // ── Role Management ────────────────────────────────────────
  function sl86AssignRole(principalId, role, worldId) {
    if (!_data.principals[principalId]) {
      console.warn('[SL86] Principal not found:', principalId);
      return false;
    }
    if (!SL86_ROLES[role]) {
      console.warn('[SL86] Invalid role:', role);
      return false;
    }

    // Permission check — only GOD or CREATOR (world owner) can assign roles
    if (!_sl86CanManageRoles(worldId)) return false;

    if (!_data.roleAssignments[principalId]) {
      _data.roleAssignments[principalId] = { globalRole: 'MEMBER', worldRoles: {} };
    }

    if (worldId) {
      _data.roleAssignments[principalId].worldRoles[worldId] = role;
    } else {
      _data.roleAssignments[principalId].globalRole = role;
      _data.principals[principalId].globalRole = role;
    }

    _secEvent(SL86_EVENTS.ROLE_ASSIGNED, _data.currentPrincipalId, 'SYSTEM', principalId,
      'Assigned ' + role + (worldId ? ' on world ' + worldId : ' globally'));
    _save();
    return true;
  }

  function sl86RevokeRole(principalId, worldId) {
    if (!_data.roleAssignments[principalId]) return false;
    if (!_sl86CanManageRoles(worldId)) return false;

    if (worldId) {
      delete _data.roleAssignments[principalId].worldRoles[worldId];
    } else {
      _data.roleAssignments[principalId].globalRole = 'GUEST';
      _data.principals[principalId].globalRole = 'GUEST';
    }

    _secEvent(SL86_EVENTS.ROLE_REVOKED, _data.currentPrincipalId, 'SYSTEM', principalId,
      'Revoked role' + (worldId ? ' on world ' + worldId : ' globally'));
    _save();
    return true;
  }

  function _sl86CanManageRoles(worldId) {
    const current = sl86GetCurrentPrincipal();
    if (!current) return false;
    const role = sl86GetEffectiveRole(current.principalId, worldId);
    return SL86_ROLES[role] && SL86_ROLES[role].level >= SL86_ROLES.CREATOR.level;
  }

  function sl86GetEffectiveRole(principalId, worldId) {
    const assignment = _data.roleAssignments[principalId];
    if (!assignment) return 'GUEST';
    if (worldId && assignment.worldRoles && assignment.worldRoles[worldId]) {
      return assignment.worldRoles[worldId];
    }
    return assignment.globalRole || 'GUEST';
  }

  function sl86GetRoleLevel(principalId, worldId) {
    const role = sl86GetEffectiveRole(principalId, worldId);
    return SL86_ROLES[role] ? SL86_ROLES[role].level : 0;
  }

  // ── World Ownership ────────────────────────────────────────
  function sl86RegisterWorldOwnership(worldId, ownerId) {
    ownerId = ownerId || _data.currentPrincipalId;
    if (!ownerId) {
      console.warn('[SL86] No owner specified for world:', worldId);
      return false;
    }

    // Auto-register principal if not exists
    if (!_data.principals[ownerId]) {
      sl86RegisterPrincipal({ principalId: ownerId, displayName: 'Creator', globalRole: 'CREATOR' });
    }

    _data.worldOwnership[worldId] = {
      worldId,
      ownerId,
      ownerRole:        sl86GetEffectiveRole(ownerId),
      registeredAt:     _now(),
      transferHistory:  [],
      accessPolicy:    'PRIVATE',  // PRIVATE | SHARED | PUBLIC
      collaborators:   [],         // [{ principalId, role, grantedAt }]
    };

    // Ensure owner has CREATOR role on this world
    if (!_data.roleAssignments[ownerId]) {
      _data.roleAssignments[ownerId] = { globalRole: 'CREATOR', worldRoles: {} };
    }
    _data.roleAssignments[ownerId].worldRoles[worldId] = 'GOD';

    _data.stats.totalWorlds++;
    _secEvent(SL86_EVENTS.WORLD_CREATED, ownerId, SL86_RESOURCES.WORLD, worldId,
      'World ownership registered');
    _save();
    return true;
  }

  function sl86TransferWorldOwnership(worldId, newOwnerId, reason) {
    const ownership = _data.worldOwnership[worldId];
    if (!ownership) {
      console.warn('[SL86] World not registered:', worldId);
      return false;
    }

    // Only current owner or GOD can transfer
    const current = sl86GetCurrentPrincipal();
    if (!current) return false;
    const currentRole = sl86GetEffectiveRole(current.principalId, worldId);
    if (SL86_ROLES[currentRole].level < SL86_ROLES.GOD.level &&
        ownership.ownerId !== current.principalId) {
      _secEvent(SL86_EVENTS.ACCESS_DENIED, current.principalId, SL86_RESOURCES.WORLD, worldId,
        'Unauthorized ownership transfer attempt', 'WARN');
      _data.stats.accessDenied++;
      return false;
    }

    ownership.transferHistory.push({
      fromOwner:    ownership.ownerId,
      toOwner:      newOwnerId,
      transferredAt: _now(),
      reason:       reason || 'Manual transfer',
      authorizedBy: current.principalId,
    });

    const oldOwner = ownership.ownerId;
    ownership.ownerId = newOwnerId;
    ownership.ownerRole = sl86GetEffectiveRole(newOwnerId);

    // Update role assignments
    if (_data.roleAssignments[oldOwner] && _data.roleAssignments[oldOwner].worldRoles[worldId] === 'GOD') {
      _data.roleAssignments[oldOwner].worldRoles[worldId] = 'ELDER';
    }
    if (!_data.roleAssignments[newOwnerId]) {
      _data.roleAssignments[newOwnerId] = { globalRole: 'CREATOR', worldRoles: {} };
    }
    _data.roleAssignments[newOwnerId].worldRoles[worldId] = 'GOD';

    _data.stats.ownershipTransfers++;
    _secEvent(SL86_EVENTS.WORLD_OWNERSHIP_TRANSFER, current.principalId, SL86_RESOURCES.WORLD, worldId,
      'Transferred from ' + oldOwner + ' to ' + newOwnerId, 'WARN');
    _save();
    return true;
  }

  function sl86GetWorldOwnership(worldId) {
    return _data.worldOwnership[worldId] || null;
  }

  function sl86SetWorldAccessPolicy(worldId, policy) {
    const ownership = _data.worldOwnership[worldId];
    if (!ownership) return false;
    if (!_sl86IsWorldOwner(worldId)) return false;
    const valid = ['PRIVATE', 'SHARED', 'PUBLIC'];
    if (!valid.includes(policy)) return false;
    ownership.accessPolicy = policy;
    _save();
    return true;
  }

  function sl86AddCollaborator(worldId, principalId, role) {
    const ownership = _data.worldOwnership[worldId];
    if (!ownership) return false;
    if (!_sl86IsWorldOwner(worldId)) return false;

    // Prevent adding collaborator with higher role than owner's own role
    const ownerLevel = sl86GetRoleLevel(ownership.ownerId, worldId);
    if (SL86_ROLES[role] && SL86_ROLES[role].level >= ownerLevel) {
      role = Object.keys(SL86_ROLES).find(function(r) {
        return SL86_ROLES[r].level === ownerLevel - 1;
      }) || 'ELDER';
    }

    ownership.collaborators = ownership.collaborators.filter(function(c) {
      return c.principalId !== principalId;
    });
    ownership.collaborators.push({ principalId, role, grantedAt: _now() });

    // Apply role
    if (!_data.roleAssignments[principalId]) {
      _data.roleAssignments[principalId] = { globalRole: 'MEMBER', worldRoles: {} };
    }
    _data.roleAssignments[principalId].worldRoles[worldId] = role;

    _secEvent(SL86_EVENTS.ROLE_ASSIGNED, _data.currentPrincipalId, SL86_RESOURCES.WORLD, worldId,
      'Collaborator added: ' + principalId + ' as ' + role);
    _save();
    return true;
  }

  function _sl86IsWorldOwner(worldId) {
    const current = sl86GetCurrentPrincipal();
    if (!current) return false;
    const ownership = _data.worldOwnership[worldId];
    if (!ownership) return false;
    const currentRole = sl86GetEffectiveRole(current.principalId, worldId);
    return ownership.ownerId === current.principalId ||
           SL86_ROLES[currentRole].level >= SL86_ROLES.GOD.level;
  }

  // ── Access Control Check ───────────────────────────────────
  function sl86CheckAccess(action, resource, resourceId, principalId, worldId) {
    principalId = principalId || _data.currentPrincipalId;
    if (!principalId) {
      _data.stats.accessDenied++;
      return { allowed: false, reason: 'No principal authenticated' };
    }

    const roleStr = sl86GetEffectiveRole(principalId, worldId);
    const role    = SL86_ROLES[roleStr];
    if (!role) {
      _data.stats.accessDenied++;
      return { allowed: false, reason: 'Invalid role' };
    }

    // GOD always allowed
    if (role.level >= SL86_ROLES.GOD.level) {
      _data.stats.accessGranted++;
      return { allowed: true, role: roleStr };
    }

    // Check permissions via permission engine if available
    if (window.pe86Check) {
      const permResult = window.pe86Check(principalId, action, resource, worldId);
      if (!permResult.allowed) {
        _data.stats.accessDenied++;
        _secEvent(SL86_EVENTS.ACCESS_DENIED, principalId, resource, resourceId,
          action + ' denied: ' + permResult.reason, 'WARN');
        return permResult;
      }
    } else {
      // Fallback: role-level check
      const requiredLevel = _getRequiredLevel(action, resource);
      if (role.level < requiredLevel) {
        _data.stats.accessDenied++;
        _secEvent(SL86_EVENTS.ACCESS_DENIED, principalId, resource, resourceId,
          action + ' requires level ' + requiredLevel + ', has ' + role.level, 'WARN');
        return { allowed: false, reason: 'Insufficient role level', required: requiredLevel, actual: role.level };
      }
    }

    _data.stats.accessGranted++;
    _secEvent(SL86_EVENTS.ACCESS_GRANTED, principalId, resource, resourceId, action + ' granted');
    return { allowed: true, role: roleStr };
  }

  function _getRequiredLevel(action, resource) {
    // Default required levels per action type
    const actionLevels = {
      READ:           0,  // GUEST
      LIST:           0,  // GUEST
      INTERACT:       1,  // MEMBER
      CREATE_NPC:     2,  // ELDER
      MODIFY_NPC:     2,  // ELDER
      CREATE_EVENT:   2,  // ELDER
      MANAGE_ECONOMY: 3,  // MASTER
      MANAGE_MILITARY: 3, // MASTER
      MODIFY_WORLD:   4,  // CREATOR
      DELETE_WORLD:   5,  // GOD
      MANAGE_USERS:   5,  // GOD
      SYSTEM_ADMIN:   5,  // GOD
    };
    return actionLevels[action] !== undefined ? actionLevels[action] : 3;
  }

  // ── Session Management ─────────────────────────────────────
  function sl86StartSession(principalId) {
    const principal = _data.principals[principalId];
    if (!principal) return null;

    const sessionId = _uid('session');
    _data.sessions[sessionId] = {
      sessionId,
      principalId,
      startedAt:   _now(),
      lastActiveAt: _now(),
      active:      true,
      actions:     0,
    };

    _data.currentPrincipalId = principalId;
    _data.currentSessionId   = sessionId;
    principal.lastActiveAt   = _now();

    _secEvent(SL86_EVENTS.SESSION_START, principalId, 'SYSTEM', sessionId, 'Session started');
    _save();
    return _data.sessions[sessionId];
  }

  function sl86EndSession(sessionId) {
    sessionId = sessionId || _data.currentSessionId;
    const session = _data.sessions[sessionId];
    if (!session || !session.active) return false;
    session.active = false;
    session.endedAt = _now();
    _secEvent(SL86_EVENTS.SESSION_END, session.principalId, 'SYSTEM', sessionId, 'Session ended');
    _save();
    return true;
  }

  function sl86RecordAction(sessionId) {
    sessionId = sessionId || _data.currentSessionId;
    const session = _data.sessions[sessionId];
    if (session) {
      session.actions++;
      session.lastActiveAt = _now();
    }
  }

  // ── Stats & Report ────────────────────────────────────────
  function sl86GetStats() {
    return Object.assign({}, _data.stats, {
      totalPrincipals:    Object.keys(_data.principals).length,
      totalWorlds:        Object.keys(_data.worldOwnership).length,
      activeSessions:     Object.values(_data.sessions).filter(function(s) { return s.active; }).length,
      recentEvents:       _data.securityEvents.slice(0, 10),
    });
  }

  function sl86GetSecurityEvents(opts) {
    opts = opts || {};
    let events = _data.securityEvents;
    if (opts.severity) events = events.filter(function(e) { return e.severity === opts.severity; });
    if (opts.type)     events = events.filter(function(e) { return e.type === opts.type; });
    if (opts.worldId)  events = events.filter(function(e) { return e.resourceId === opts.worldId; });
    return events.slice(0, opts.limit || 50);
  }

  function sl86GetReport() {
    return {
      version:   VERSION,
      timestamp: _now(),
      stats:     sl86GetStats(),
      roles:     Object.keys(SL86_ROLES).map(function(r) { return SL86_ROLES[r]; }),
      worldOwnership: Object.values(_data.worldOwnership).map(function(w) {
        return {
          worldId:      w.worldId,
          ownerId:      w.ownerId,
          accessPolicy: w.accessPolicy,
          collaborators: w.collaborators.length,
          transfers:    w.transferHistory.length,
        };
      }),
      principals: Object.values(_data.principals).map(function(p) {
        return {
          principalId:  p.principalId.substring(0, 16) + '...',
          displayName:  p.displayName,
          globalRole:   p.globalRole,
        };
      }),
      recentEvents: _data.securityEvents.slice(0, 20),
    };
  }

  function sl86GetLog(n) {
    return _data.securityEvents.slice(0, n || 50);
  }

  // ── gameTick Hook ──────────────────────────────────────────
  let _tickCounter = 0;
  function _onGameTick() {
    _tickCounter++;

    // Every 500 ticks: auto-register current world ownership if not done
    if (_tickCounter % 500 === 0) {
      const worldId = window.world && window.world.id;
      if (worldId && !_data.worldOwnership[worldId]) {
        const principal = sl86GetOrCreateLocalPrincipal();
        if (principal) sl86RegisterWorldOwnership(worldId, principal.principalId);
      }
    }

    // Every 1000 ticks: auto-save
    if (_tickCounter % 1000 === 0) {
      _save();
    }
  }

  // ── Auto-init world on creation ────────────────────────────
  function _watchWorldCreation() {
    const origCreateWorld = window.createWorld;
    if (typeof origCreateWorld === 'function') {
      window.createWorld = function() {
        const result = origCreateWorld.apply(this, arguments);
        setTimeout(function() {
          const worldId = window.world && window.world.id;
          if (worldId) {
            const principal = sl86GetOrCreateLocalPrincipal();
            if (principal && !_data.worldOwnership[worldId]) {
              sl86RegisterWorldOwnership(worldId, principal.principalId);
            }
          }
        }, 500);
        return result;
      };
    }
  }

  // ── Init ───────────────────────────────────────────────────
  function _init() {
    _load();

    // Create default local principal (the Creator God player)
    const principal = sl86GetOrCreateLocalPrincipal();
    sl86StartSession(principal.principalId);

    // Register existing world if loaded
    const worldId = window.world && window.world.id;
    if (worldId && !_data.worldOwnership[worldId]) {
      sl86RegisterWorldOwnership(worldId, principal.principalId);
    }

    // Watch for future world creation
    setTimeout(_watchWorldCreation, 500);

    // gameTick hook
    if (window.gameTick !== undefined) {
      const _orig = window.gameTick;
      window.gameTick = function() {
        if (_orig) _orig.apply(this, arguments);
        _onGameTick();
      };
    }

    _data.initialized = true;
    _save();
    console.log('[SecurityLayer V86] 🔒 Lớp Bảo Mật khởi động — RBAC 6 vai trò · World Ownership · Access Control · Session Management sẵn sàng.');
  }

  // ── Public API ─────────────────────────────────────────────
  window.SL86_ROLES      = SL86_ROLES;
  window.SL86_RESOURCES  = SL86_RESOURCES;
  window.SL86_EVENTS     = SL86_EVENTS;
  window.sl86Data        = _data;

  window.sl86RegisterPrincipal          = sl86RegisterPrincipal;
  window.sl86GetPrincipal               = sl86GetPrincipal;
  window.sl86GetCurrentPrincipal        = sl86GetCurrentPrincipal;
  window.sl86GetOrCreateLocalPrincipal  = sl86GetOrCreateLocalPrincipal;

  window.sl86AssignRole         = sl86AssignRole;
  window.sl86RevokeRole         = sl86RevokeRole;
  window.sl86GetEffectiveRole   = sl86GetEffectiveRole;
  window.sl86GetRoleLevel       = sl86GetRoleLevel;

  window.sl86RegisterWorldOwnership = sl86RegisterWorldOwnership;
  window.sl86TransferWorldOwnership = sl86TransferWorldOwnership;
  window.sl86GetWorldOwnership      = sl86GetWorldOwnership;
  window.sl86SetWorldAccessPolicy   = sl86SetWorldAccessPolicy;
  window.sl86AddCollaborator        = sl86AddCollaborator;

  window.sl86CheckAccess  = sl86CheckAccess;
  window.sl86StartSession = sl86StartSession;
  window.sl86EndSession   = sl86EndSession;
  window.sl86RecordAction = sl86RecordAction;

  window.sl86GetStats           = sl86GetStats;
  window.sl86GetSecurityEvents  = sl86GetSecurityEvents;
  window.sl86GetReport          = sl86GetReport;
  window.sl86GetLog             = sl86GetLog;

  setTimeout(_init, 23100);

})();
