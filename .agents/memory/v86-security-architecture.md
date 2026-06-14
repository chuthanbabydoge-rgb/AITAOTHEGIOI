---
name: V86 Security Architecture
description: RBAC · World Ownership · Creator Permissions · Tamper-Evident Audit Log — 3 files · init 23100→23300ms
---

## Files
- `securityLayer.js` — init 23100ms · save `cgv6_security_layer_v86`
- `permissionEngine.js` — init 23200ms · save `cgv6_permission_engine_v86`
- `auditLogger.js` — init 23300ms · save `cgv6_audit_logger_v86`

## RBAC
6 roles in level order: GUEST(0) → MEMBER(1) → ELDER(2) → MASTER(3) → CREATOR(4) → GOD(5)
- `sl86GetEffectiveRole(principalId, worldId?)` — worldRoles override globalRole
- GOD always bypasses all checks
- Local game player auto-created as GOD at init

## World Ownership
- `sl86RegisterWorldOwnership(worldId, ownerId)` — auto-triggered on createWorld()
- Owner gets `worldRoles[worldId] = 'GOD'` automatically
- Collaborator role capped below owner's own level
- Transfer records: fromOwner, toOwner, authorizedBy, reason

## Permission Inheritance (cumulative)
GOD = CREATOR + WORLD_DELETE/TRANSFER, SHARD_MIGRATE, CLUSTER_MANAGE, SYSTEM_ADMIN
CREATOR = MASTER + WORLD_MODIFY/EXPORT/INVITE, NPC_DELETE, DISASTER_TRIGGER, AI_GENESIS, SHARD_PROVISION
MASTER = ELDER + COUNTRY_CREATE, ECONOMY_MANAGE, MILITARY_COMMAND, WAR_DECLARE, DIPLOMACY_TREATY
ELDER = MEMBER + NPC_CREATE/MODIFY, EVENT_TRIGGER, RELIGION_FOUND, SYSTEM_READ, AI_ORACLE
MEMBER = GUEST + DIPLOMACY_ACT, AI_CALL, SHARD_READ
GUEST = read-only (WORLD/NPC/COUNTRY/ECONOMY/RELIGION/MILITARY/DIPLOMACY/EVENT READ)

## 4 Creator Profiles (pe86ApplyCreatorProfile)
OBSERVER → no extra perms
LORE_WRITER → NPC_CREATE/MODIFY, EVENT_TRIGGER, RELIGION_FOUND
WORLD_MANAGER → + COUNTRY, ECONOMY, MILITARY, WAR
CO_CREATOR → + WORLD_MODIFY, NPC_DELETE, DISASTER_TRIGGER, AI_GENESIS

## Temporary Permissions
`pe86GrantPermission(principalId, permId, worldId, { temporary: true, durationMs: N })`
Cleanup: auto every 600 ticks

## Audit Logger
- `al86Log({ category, action, actorId, resourceId, detail, severity })`
- 12 categories: WORLD NPC ECONOMY MILITARY DIPLOMACY RELIGION SECURITY ACCESS ADMIN AI SHARD SYSTEM
- 4 severity: DEBUG INFO WARN CRITICAL
- Max 2000 in memory, 500 persisted to localStorage
- Tamper detection: checksum per entry, integrity check every 3000 ticks
- `al86Query({ category, severity, worldId, search, minSeverity, limit, offset })`
- `al86Export({ format: 'json'|'csv', ...filters })`
- Patches htAddEvent() → auto-logs WORLD.HISTORY_EVENT

## Cross-Engine Integration
securityLayer → calls pe86Check() for permission decisions
securityLayer → calls al86Log() for all security events
permissionEngine → reads sl86GetEffectiveRole()
permissionEngine → calls al86Log() on grant/deny

**Why:** World data was unprotected — any code could modify any world. RBAC + ownership ensures future multi-creator features have an access control foundation.
**How to apply:** V87+ must call sl86CheckAccess() before any write operation on world/NPC/economy data. V87 UI init từ 23400ms+
