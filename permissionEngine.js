// ============================================================
// PERMISSION ENGINE V86
// Creator God V6 — Security Pass
// Creator Permissions · Fine-Grained ACL · Permission Inheritance
// Init: 23200ms | Save: cgv6_permission_engine_v86
// ONLY EXTENDS — không xóa, không thay thế bất kỳ engine nào
// ============================================================

(function() {
  'use strict';

  const SAVE_KEY = 'cgv6_permission_engine_v86';
  const VERSION  = 'V86';

  // ── Permission Definitions ─────────────────────────────────
  // Mỗi permission: { id, category, action, resource, minRole, label }
  const PE86_PERMISSIONS = {
    // ── WORLD ─────────────────────────────────────────────
    WORLD_READ:          { id: 'WORLD_READ',          category: 'WORLD',     action: 'READ',         resource: 'WORLD',     minRole: 'GUEST',   label: 'Xem thông tin thế giới' },
    WORLD_MODIFY:        { id: 'WORLD_MODIFY',        category: 'WORLD',     action: 'MODIFY_WORLD', resource: 'WORLD',     minRole: 'CREATOR', label: 'Chỉnh sửa thuộc tính thế giới' },
    WORLD_DELETE:        { id: 'WORLD_DELETE',        category: 'WORLD',     action: 'DELETE_WORLD', resource: 'WORLD',     minRole: 'GOD',     label: 'Xóa thế giới' },
    WORLD_EXPORT:        { id: 'WORLD_EXPORT',        category: 'WORLD',     action: 'READ',         resource: 'WORLD',     minRole: 'CREATOR', label: 'Xuất bản đồ/blueprint thế giới' },
    WORLD_INVITE:        { id: 'WORLD_INVITE',        category: 'WORLD',     action: 'MANAGE_USERS', resource: 'WORLD',     minRole: 'CREATOR', label: 'Mời cộng tác viên vào thế giới' },
    WORLD_TRANSFER:      { id: 'WORLD_TRANSFER',      category: 'WORLD',     action: 'DELETE_WORLD', resource: 'WORLD',     minRole: 'GOD',     label: 'Chuyển nhượng quyền sở hữu' },

    // ── NPC ────────────────────────────────────────────────
    NPC_READ:            { id: 'NPC_READ',            category: 'NPC',       action: 'READ',         resource: 'NPC',       minRole: 'GUEST',   label: 'Xem thông tin NPC' },
    NPC_CREATE:          { id: 'NPC_CREATE',          category: 'NPC',       action: 'CREATE_NPC',   resource: 'NPC',       minRole: 'ELDER',   label: 'Tạo NPC mới' },
    NPC_MODIFY:          { id: 'NPC_MODIFY',          category: 'NPC',       action: 'MODIFY_NPC',   resource: 'NPC',       minRole: 'ELDER',   label: 'Chỉnh sửa NPC' },
    NPC_DELETE:          { id: 'NPC_DELETE',          category: 'NPC',       action: 'MODIFY_WORLD', resource: 'NPC',       minRole: 'CREATOR', label: 'Xóa NPC' },
    NPC_DIVINE_CONTROL:  { id: 'NPC_DIVINE_CONTROL',  category: 'NPC',       action: 'MODIFY_WORLD', resource: 'NPC',       minRole: 'MASTER',  label: 'Thần can thiệp vào NPC' },

    // ── COUNTRY / CIV ──────────────────────────────────────
    COUNTRY_READ:        { id: 'COUNTRY_READ',        category: 'COUNTRY',   action: 'READ',         resource: 'COUNTRY',   minRole: 'GUEST',   label: 'Xem quốc gia' },
    COUNTRY_CREATE:      { id: 'COUNTRY_CREATE',      category: 'COUNTRY',   action: 'MODIFY_WORLD', resource: 'COUNTRY',   minRole: 'MASTER',  label: 'Tạo quốc gia mới' },
    COUNTRY_MODIFY:      { id: 'COUNTRY_MODIFY',      category: 'COUNTRY',   action: 'MODIFY_WORLD', resource: 'COUNTRY',   minRole: 'MASTER',  label: 'Chỉnh sửa quốc gia' },
    COUNTRY_DELETE:      { id: 'COUNTRY_DELETE',      category: 'COUNTRY',   action: 'MODIFY_WORLD', resource: 'COUNTRY',   minRole: 'CREATOR', label: 'Xóa quốc gia' },

    // ── ECONOMY ────────────────────────────────────────────
    ECONOMY_READ:        { id: 'ECONOMY_READ',        category: 'ECONOMY',   action: 'READ',         resource: 'ECONOMY',   minRole: 'GUEST',   label: 'Xem kinh tế thế giới' },
    ECONOMY_MANAGE:      { id: 'ECONOMY_MANAGE',      category: 'ECONOMY',   action: 'MANAGE_ECONOMY', resource: 'ECONOMY', minRole: 'MASTER',  label: 'Quản lý kinh tế' },
    ECONOMY_CRISIS:      { id: 'ECONOMY_CRISIS',      category: 'ECONOMY',   action: 'MANAGE_ECONOMY', resource: 'ECONOMY', minRole: 'CREATOR', label: 'Gây khủng hoảng kinh tế' },

    // ── RELIGION & CULTURE ─────────────────────────────────
    RELIGION_READ:       { id: 'RELIGION_READ',       category: 'RELIGION',  action: 'READ',         resource: 'WORLD',     minRole: 'GUEST',   label: 'Xem tôn giáo' },
    RELIGION_FOUND:      { id: 'RELIGION_FOUND',      category: 'RELIGION',  action: 'CREATE_EVENT', resource: 'WORLD',     minRole: 'ELDER',   label: 'Lập tôn giáo mới' },
    RELIGION_CRUSADE:    { id: 'RELIGION_CRUSADE',    category: 'RELIGION',  action: 'MANAGE_MILITARY', resource: 'WORLD',   minRole: 'MASTER',  label: 'Phát động thánh chiến' },

    // ── MILITARY & WAR ─────────────────────────────────────
    MILITARY_READ:       { id: 'MILITARY_READ',       category: 'MILITARY',  action: 'READ',         resource: 'MILITARY',  minRole: 'GUEST',   label: 'Xem thông tin quân sự' },
    MILITARY_COMMAND:    { id: 'MILITARY_COMMAND',    category: 'MILITARY',  action: 'MANAGE_MILITARY', resource: 'MILITARY', minRole: 'MASTER', label: 'Chỉ huy quân đội' },
    WAR_DECLARE:         { id: 'WAR_DECLARE',         category: 'MILITARY',  action: 'MANAGE_MILITARY', resource: 'MILITARY', minRole: 'MASTER', label: 'Tuyên chiến' },
    WAR_END:             { id: 'WAR_END',             category: 'MILITARY',  action: 'MANAGE_MILITARY', resource: 'MILITARY', minRole: 'CREATOR', label: 'Kết thúc chiến tranh' },

    // ── DIPLOMACY ──────────────────────────────────────────
    DIPLOMACY_READ:      { id: 'DIPLOMACY_READ',      category: 'DIPLOMACY', action: 'READ',         resource: 'DIPLOMACY', minRole: 'GUEST',   label: 'Xem ngoại giao' },
    DIPLOMACY_ACT:       { id: 'DIPLOMACY_ACT',       category: 'DIPLOMACY', action: 'INTERACT',     resource: 'DIPLOMACY', minRole: 'MEMBER',  label: 'Thực hiện hành động ngoại giao' },
    DIPLOMACY_TREATY:    { id: 'DIPLOMACY_TREATY',    category: 'DIPLOMACY', action: 'MANAGE_ECONOMY', resource: 'DIPLOMACY', minRole: 'MASTER', label: 'Ký kết hiệp ước' },

    // ── EVENTS & DISASTERS ─────────────────────────────────
    EVENT_READ:          { id: 'EVENT_READ',          category: 'EVENT',     action: 'READ',         resource: 'WORLD',     minRole: 'GUEST',   label: 'Xem sự kiện' },
    EVENT_TRIGGER:       { id: 'EVENT_TRIGGER',       category: 'EVENT',     action: 'CREATE_EVENT', resource: 'WORLD',     minRole: 'ELDER',   label: 'Kích hoạt sự kiện' },
    DISASTER_TRIGGER:    { id: 'DISASTER_TRIGGER',    category: 'EVENT',     action: 'MODIFY_WORLD', resource: 'WORLD',     minRole: 'CREATOR', label: 'Gây thiên tai' },
    PLAGUE_TRIGGER:      { id: 'PLAGUE_TRIGGER',      category: 'EVENT',     action: 'MODIFY_WORLD', resource: 'WORLD',     minRole: 'CREATOR', label: 'Gây đại dịch' },

    // ── AI FEATURES ────────────────────────────────────────
    AI_CALL:             { id: 'AI_CALL',             category: 'AI',        action: 'INTERACT',     resource: 'SYSTEM',    minRole: 'MEMBER',  label: 'Gọi AI (Claude)' },
    AI_GENESIS:          { id: 'AI_GENESIS',          category: 'AI',        action: 'MODIFY_WORLD', resource: 'WORLD',     minRole: 'CREATOR', label: 'Tạo thế giới bằng AI' },
    AI_ORACLE:           { id: 'AI_ORACLE',           category: 'AI',        action: 'INTERACT',     resource: 'SYSTEM',    minRole: 'ELDER',   label: 'Hỏi Thần Sấm AI' },

    // ── SHARD / CLOUD ──────────────────────────────────────
    SHARD_READ:          { id: 'SHARD_READ',          category: 'SHARD',     action: 'READ',         resource: 'SHARD',     minRole: 'MEMBER',  label: 'Xem thông tin shard' },
    SHARD_PROVISION:     { id: 'SHARD_PROVISION',     category: 'SHARD',     action: 'MODIFY_WORLD', resource: 'SHARD',     minRole: 'CREATOR', label: 'Tạo world shard' },
    SHARD_MIGRATE:       { id: 'SHARD_MIGRATE',       category: 'SHARD',     action: 'SYSTEM_ADMIN', resource: 'SHARD',     minRole: 'GOD',     label: 'Di chuyển shard giữa regions' },
    CLUSTER_MANAGE:      { id: 'CLUSTER_MANAGE',      category: 'CLUSTER',   action: 'SYSTEM_ADMIN', resource: 'CLUSTER',   minRole: 'GOD',     label: 'Quản lý Universe Cluster' },

    // ── SYSTEM ADMIN ───────────────────────────────────────
    SYSTEM_READ:         { id: 'SYSTEM_READ',         category: 'SYSTEM',    action: 'READ',         resource: 'SYSTEM',    minRole: 'ELDER',   label: 'Xem system status' },
    SYSTEM_ADMIN:        { id: 'SYSTEM_ADMIN',        category: 'SYSTEM',    action: 'SYSTEM_ADMIN', resource: 'SYSTEM',    minRole: 'GOD',     label: 'Quyền admin hệ thống' },
    SECURITY_MANAGE:     { id: 'SECURITY_MANAGE',     category: 'SYSTEM',    action: 'MANAGE_USERS', resource: 'SYSTEM',    minRole: 'GOD',     label: 'Quản lý bảo mật' },
  };

  // ── Role → Permission Mapping ──────────────────────────────
  // Mỗi role kế thừa tất cả permission của role thấp hơn
  const PE86_ROLE_PERMISSIONS = {
    GUEST:   ['WORLD_READ', 'NPC_READ', 'COUNTRY_READ', 'ECONOMY_READ', 'RELIGION_READ',
              'MILITARY_READ', 'DIPLOMACY_READ', 'EVENT_READ'],

    MEMBER:  ['DIPLOMACY_ACT', 'AI_CALL', 'SHARD_READ'],

    ELDER:   ['NPC_CREATE', 'NPC_MODIFY', 'EVENT_TRIGGER', 'RELIGION_FOUND',
              'SYSTEM_READ', 'AI_ORACLE'],

    MASTER:  ['COUNTRY_CREATE', 'COUNTRY_MODIFY', 'ECONOMY_MANAGE', 'MILITARY_COMMAND',
              'WAR_DECLARE', 'DIPLOMACY_TREATY', 'NPC_DIVINE_CONTROL', 'RELIGION_CRUSADE'],

    CREATOR: ['WORLD_MODIFY', 'WORLD_EXPORT', 'WORLD_INVITE', 'NPC_DELETE',
              'COUNTRY_DELETE', 'ECONOMY_CRISIS', 'WAR_END', 'DISASTER_TRIGGER',
              'PLAGUE_TRIGGER', 'AI_GENESIS', 'SHARD_PROVISION'],

    GOD:     ['WORLD_DELETE', 'WORLD_TRANSFER', 'SHARD_MIGRATE', 'CLUSTER_MANAGE',
              'SYSTEM_ADMIN', 'SECURITY_MANAGE'],
  };

  // ── State ──────────────────────────────────────────────────
  let _data = {
    version: VERSION,
    initialized: false,
    // Custom permission grants/denies per principal per world
    // key: principalId + ':' + worldId (null for global)
    customGrants:  {},  // key → Set of permissionIds (granted above role level)
    customDenies:  {},  // key → Set of permissionIds (explicitly denied)
    // Temporary permissions with expiry
    tempGrants:    [],  // [{ principalId, worldId, permissionId, grantedAt, expiresAt, grantedBy }]
    stats: {
      checksPerformed: 0,
      checksGranted:   0,
      checksDenied:    0,
      customGrants:    0,
      customDenies:    0,
    },
  };

  // ── Utility ────────────────────────────────────────────────
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

  function _makeKey(principalId, worldId) {
    return principalId + ':' + (worldId || 'global');
  }

  // ── Permission Resolution ──────────────────────────────────
  // Tính toàn bộ permissions của một principal (kế thừa + custom)
  function pe86GetEffectivePermissions(principalId, worldId) {
    // 1. Get role
    const role = window.sl86GetEffectiveRole
      ? window.sl86GetEffectiveRole(principalId, worldId)
      : 'GUEST';

    // 2. Accumulate role permissions with inheritance
    const roleOrder = ['GUEST', 'MEMBER', 'ELDER', 'MASTER', 'CREATOR', 'GOD'];
    const roleLevel = roleOrder.indexOf(role);
    const inherited = new Set();
    roleOrder.slice(0, roleLevel + 1).forEach(function(r) {
      (PE86_ROLE_PERMISSIONS[r] || []).forEach(function(p) { inherited.add(p); });
    });

    // 3. Apply custom grants
    const key = _makeKey(principalId, worldId);
    const globalKey = _makeKey(principalId, null);
    const granted = _data.customGrants[key] || [];
    const globalGranted = _data.customGrants[globalKey] || [];
    granted.forEach(function(p) { inherited.add(p); });
    globalGranted.forEach(function(p) { inherited.add(p); });

    // 4. Apply temporary grants (not expired)
    const now = _now();
    _data.tempGrants.forEach(function(tg) {
      if (tg.principalId === principalId &&
          (tg.worldId === worldId || !tg.worldId) &&
          (tg.expiresAt === -1 || tg.expiresAt > now)) {
        inherited.add(tg.permissionId);
      }
    });

    // 5. Apply custom denies (override everything)
    const denied = _data.customDenies[key] || [];
    const globalDenied = _data.customDenies[globalKey] || [];
    denied.forEach(function(p)        { inherited.delete(p); });
    globalDenied.forEach(function(p)  { inherited.delete(p); });

    return Array.from(inherited);
  }

  // ── Core Check ─────────────────────────────────────────────
  function pe86Check(principalId, action, resource, worldId) {
    _data.stats.checksPerformed++;

    // Find matching permission definitions
    const matchingPerms = Object.values(PE86_PERMISSIONS).filter(function(p) {
      return p.action === action && (p.resource === resource || resource === 'ANY');
    });

    if (!matchingPerms.length) {
      // No permission definition found → deny unknown actions
      _data.stats.checksDenied++;
      return { allowed: false, reason: 'Unknown action/resource: ' + action + '/' + resource };
    }

    const effectivePerms = pe86GetEffectivePermissions(principalId, worldId);
    const effectiveSet   = new Set(effectivePerms);

    // Check if any matching permission is held
    const held = matchingPerms.find(function(p) { return effectiveSet.has(p.id); });
    if (held) {
      _data.stats.checksGranted++;
      return { allowed: true, permission: held.id, label: held.label };
    }

    // Find the highest required role for informative error
    const highestRequired = matchingPerms.reduce(function(acc, p) {
      const roles = ['GUEST','MEMBER','ELDER','MASTER','CREATOR','GOD'];
      return roles.indexOf(p.minRole) > roles.indexOf(acc) ? p.minRole : acc;
    }, 'GUEST');

    _data.stats.checksDenied++;
    return {
      allowed:  false,
      reason:   'Missing permission for ' + action + ' on ' + resource,
      required: highestRequired,
      held:     window.sl86GetEffectiveRole ? window.sl86GetEffectiveRole(principalId, worldId) : 'GUEST',
    };
  }

  function pe86HasPermission(principalId, permissionId, worldId) {
    const perms = pe86GetEffectivePermissions(principalId, worldId);
    return perms.includes(permissionId);
  }

  // ── Custom Grant / Deny ────────────────────────────────────
  function pe86GrantPermission(principalId, permissionId, worldId, opts) {
    if (!PE86_PERMISSIONS[permissionId]) {
      console.warn('[PE86] Unknown permission:', permissionId);
      return false;
    }

    // Only GOD or CREATOR of the world can grant extra permissions
    if (window.sl86CheckAccess) {
      const check = window.sl86CheckAccess('MANAGE_USERS', 'SYSTEM', null, null, worldId);
      if (!check.allowed) {
        console.warn('[PE86] Unauthorized: cannot grant permission');
        return false;
      }
    }

    opts = opts || {};

    if (opts.temporary && opts.durationMs) {
      // Temporary grant
      _data.tempGrants.push({
        principalId,
        worldId:      worldId || null,
        permissionId,
        grantedAt:    _now(),
        expiresAt:    opts.durationMs === -1 ? -1 : _now() + opts.durationMs,
        grantedBy:    window.sl86Data && window.sl86Data.currentPrincipalId || 'system',
        reason:       opts.reason || '',
      });
      _data.stats.customGrants++;
    } else {
      // Permanent custom grant
      const key = _makeKey(principalId, worldId);
      if (!_data.customGrants[key]) _data.customGrants[key] = [];
      if (!_data.customGrants[key].includes(permissionId)) {
        _data.customGrants[key].push(permissionId);
        _data.stats.customGrants++;
      }
    }

    // Log to audit
    if (window.al86Log) {
      window.al86Log({
        category:   'SECURITY',
        action:     'PERMISSION_GRANT',
        actorId:    window.sl86Data && window.sl86Data.currentPrincipalId || 'system',
        resourceId: principalId,
        detail:     permissionId + (worldId ? ' on ' + worldId : ' globally'),
        severity:   'WARN',
      });
    }

    _save();
    return true;
  }

  function pe86DenyPermission(principalId, permissionId, worldId) {
    if (!PE86_PERMISSIONS[permissionId]) return false;

    const key = _makeKey(principalId, worldId);
    if (!_data.customDenies[key]) _data.customDenies[key] = [];
    if (!_data.customDenies[key].includes(permissionId)) {
      _data.customDenies[key].push(permissionId);
      _data.stats.customDenies++;
    }

    if (window.al86Log) {
      window.al86Log({
        category:   'SECURITY',
        action:     'PERMISSION_DENY',
        actorId:    window.sl86Data && window.sl86Data.currentPrincipalId || 'system',
        resourceId: principalId,
        detail:     permissionId + (worldId ? ' on ' + worldId : ' globally'),
        severity:   'WARN',
      });
    }

    _save();
    return true;
  }

  function pe86RevokeCustom(principalId, permissionId, worldId) {
    const key = _makeKey(principalId, worldId);
    if (_data.customGrants[key]) {
      _data.customGrants[key] = _data.customGrants[key].filter(function(p) { return p !== permissionId; });
    }
    if (_data.customDenies[key]) {
      _data.customDenies[key] = _data.customDenies[key].filter(function(p) { return p !== permissionId; });
    }
    // Revoke temp grants
    _data.tempGrants = _data.tempGrants.filter(function(tg) {
      return !(tg.principalId === principalId && tg.permissionId === permissionId &&
               (tg.worldId === worldId || (!tg.worldId && !worldId)));
    });
    _save();
    return true;
  }

  // ── Creator Permission Profiles ─────────────────────────────
  // Tạo sẵn bộ permissions phù hợp cho từng usecase
  function pe86ApplyCreatorProfile(principalId, profile, worldId) {
    const profiles = {
      OBSERVER:    [],  // chỉ READ — không cần grant gì thêm
      LORE_WRITER: ['NPC_CREATE', 'NPC_MODIFY', 'EVENT_TRIGGER', 'RELIGION_FOUND'],
      WORLD_MANAGER: ['NPC_CREATE', 'NPC_MODIFY', 'COUNTRY_CREATE', 'COUNTRY_MODIFY',
                      'EVENT_TRIGGER', 'ECONOMY_MANAGE', 'MILITARY_COMMAND', 'WAR_DECLARE'],
      CO_CREATOR:  ['WORLD_MODIFY', 'NPC_CREATE', 'NPC_MODIFY', 'NPC_DELETE',
                    'COUNTRY_CREATE', 'COUNTRY_MODIFY', 'EVENT_TRIGGER',
                    'ECONOMY_MANAGE', 'DISASTER_TRIGGER', 'AI_GENESIS'],
    };

    const perms = profiles[profile];
    if (!perms) {
      console.warn('[PE86] Unknown profile:', profile);
      return false;
    }

    perms.forEach(function(permId) {
      pe86GrantPermission(principalId, permId, worldId, { reason: 'Profile: ' + profile });
    });

    if (window.al86Log) {
      window.al86Log({
        category:   'SECURITY',
        action:     'CREATOR_PROFILE_APPLIED',
        actorId:    window.sl86Data && window.sl86Data.currentPrincipalId || 'system',
        resourceId: principalId,
        detail:     'Profile ' + profile + ' applied' + (worldId ? ' on ' + worldId : ''),
        severity:   'INFO',
      });
    }

    return true;
  }

  // ── Utility Queries ────────────────────────────────────────
  function pe86GetPermissionsByCategory(category) {
    return Object.values(PE86_PERMISSIONS).filter(function(p) { return p.category === category; });
  }

  function pe86GetPermissionsByRole(role) {
    const roles = ['GUEST', 'MEMBER', 'ELDER', 'MASTER', 'CREATOR', 'GOD'];
    const level  = roles.indexOf(role);
    if (level === -1) return [];
    const all = new Set();
    roles.slice(0, level + 1).forEach(function(r) {
      (PE86_ROLE_PERMISSIONS[r] || []).forEach(function(p) { all.add(p); });
    });
    return Array.from(all).map(function(id) { return PE86_PERMISSIONS[id]; }).filter(Boolean);
  }

  function pe86GetAllPermissions() {
    return Object.values(PE86_PERMISSIONS);
  }

  function pe86GetStats() {
    // Clean expired temp grants
    const now = _now();
    const expired = _data.tempGrants.filter(function(tg) {
      return tg.expiresAt !== -1 && tg.expiresAt <= now;
    }).length;

    return {
      checksPerformed:  _data.stats.checksPerformed,
      checksGranted:    _data.stats.checksGranted,
      checksDenied:     _data.stats.checksDenied,
      grantRate:        _data.stats.checksPerformed > 0
        ? Math.round((_data.stats.checksGranted / _data.stats.checksPerformed) * 100) + '%'
        : 'N/A',
      customGrants:     _data.stats.customGrants,
      customDenies:     _data.stats.customDenies,
      activeTempGrants: _data.tempGrants.filter(function(tg) {
        return tg.expiresAt === -1 || tg.expiresAt > now;
      }).length,
      expiredTempGrants: expired,
      totalPermissions:  Object.keys(PE86_PERMISSIONS).length,
    };
  }

  // ── Cleanup expired temp grants ─────────────────────────────
  function _cleanExpiredGrants() {
    const now = _now();
    const before = _data.tempGrants.length;
    _data.tempGrants = _data.tempGrants.filter(function(tg) {
      return tg.expiresAt === -1 || tg.expiresAt > now;
    });
    if (_data.tempGrants.length < before) _save();
  }

  // ── gameTick Hook ──────────────────────────────────────────
  let _tickCounter = 0;
  function _onGameTick() {
    _tickCounter++;
    if (_tickCounter % 600 === 0) {
      _cleanExpiredGrants();
    }
    if (_tickCounter % 1000 === 0) {
      _save();
    }
  }

  // ── Init ───────────────────────────────────────────────────
  function _init() {
    _load();
    _cleanExpiredGrants();

    if (window.gameTick !== undefined) {
      const _orig = window.gameTick;
      window.gameTick = function() {
        if (_orig) _orig.apply(this, arguments);
        _onGameTick();
      };
    }

    _data.initialized = true;
    _save();
    console.log('[PermissionEngine V86] 🛡️ Permission Engine khởi động — ' + Object.keys(PE86_PERMISSIONS).length + ' permissions · 6 roles · Creator Profiles · Fine-Grained ACL sẵn sàng.');
  }

  // ── Public API ─────────────────────────────────────────────
  window.PE86_PERMISSIONS       = PE86_PERMISSIONS;
  window.PE86_ROLE_PERMISSIONS  = PE86_ROLE_PERMISSIONS;
  window.pe86Data               = _data;

  window.pe86Check                    = pe86Check;
  window.pe86HasPermission            = pe86HasPermission;
  window.pe86GetEffectivePermissions  = pe86GetEffectivePermissions;

  window.pe86GrantPermission   = pe86GrantPermission;
  window.pe86DenyPermission    = pe86DenyPermission;
  window.pe86RevokeCustom      = pe86RevokeCustom;

  window.pe86ApplyCreatorProfile      = pe86ApplyCreatorProfile;
  window.pe86GetPermissionsByCategory = pe86GetPermissionsByCategory;
  window.pe86GetPermissionsByRole     = pe86GetPermissionsByRole;
  window.pe86GetAllPermissions        = pe86GetAllPermissions;
  window.pe86GetStats                 = pe86GetStats;

  setTimeout(_init, 23200);

})();
