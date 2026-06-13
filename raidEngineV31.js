/* ============================================================
   RAID ENGINE V31 — Hệ Thống Đột Kích
   raidEngineV31.js
   Load AFTER: worldBossEngineV31.js, lootEngineV31.js
   EXPAND ONLY — NEVER DELETE — NEVER REPLACE
   ============================================================ */
(function () {
  "use strict";

  const SAVE_KEY = "cgv6_raid_v31";

  const RAID_TYPES = {
    solo:    { name:"Solo Raid",    icon:"🗡️",  minMembers:1,  maxMembers:1,  powerMult:1,   lootMult:1,   desc:"Một mình đột kích, rủi ro cao nhưng toàn bộ loot thuộc về bạn." },
    party:   { name:"Party Raid",   icon:"⚔️",  minMembers:2,  maxMembers:5,  powerMult:2.5, lootMult:1.5, desc:"Nhóm nhỏ đột kích, cân bằng giữa an toàn và loot." },
    guild:   { name:"Guild Raid",   icon:"🏛",  minMembers:10, maxMembers:50, powerMult:8,   lootMult:3,   desc:"Bang hội đột kích, sức mạnh tổng hợp rất lớn." },
    sect:    { name:"Sect Raid",    icon:"🏯",  minMembers:20, maxMembers:100,powerMult:15,  lootMult:4,   desc:"Tông môn xuất quân, uy lực vang dội." },
    kingdom: { name:"Kingdom Raid", icon:"👑",  minMembers:100,maxMembers:500,powerMult:30,  lootMult:6,   desc:"Vương quốc điều quân, boss rất khó thoát." },
    empire:  { name:"Empire Raid",  icon:"🌍",  minMembers:500,maxMembers:9999,powerMult:60, lootMult:10,  desc:"Đế chế xuất chinh, gần như vô địch." },
  };

  let _data = {
    raids:        [],
    history:      [],
    totalRaids:   0,
    totalSuccess: 0,
    totalFail:    0,
    tick:         0,
  };
  let _idCtr = 1;

  function _save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(_data)); } catch(e) {} }
  function _load() {
    try {
      const s = localStorage.getItem(SAVE_KEY);
      if (s) { const p = JSON.parse(s); Object.assign(_data, p); }
    } catch(e) {}
  }

  // ── Create Raid ──
  function rev31CreateRaid(raidTypeKey, targetBossId, organizer) {
    const raidType = RAID_TYPES[raidTypeKey];
    if (!raidType) return null;

    // Gather members based on type
    const npcs     = (window.npcs || []).filter(n => n.status === "alive");
    const members  = [];

    if (raidTypeKey === "solo") {
      if (organizer) members.push(organizer);
      else if (npcs.length) members.push(npcs[Math.floor(Math.random()*npcs.length)]);
    } else if (raidTypeKey === "party") {
      const pool = npcs.filter(n => n.realm >= 2).slice(0, raidType.maxMembers);
      members.push(...pool.slice(0, raidType.minMembers + Math.floor(Math.random()*3)));
    } else if (raidTypeKey === "guild") {
      // Try to get from guildV29 data
      const gData = window.guildV29Data;
      if (gData && gData.guilds && gData.guilds.length) {
        const guild = gData.guilds[Math.floor(Math.random()*gData.guilds.length)];
        const mem = npcs.filter(n => guild.members && guild.members.includes(n.id)).slice(0, raidType.maxMembers);
        members.push(...(mem.length >= raidType.minMembers ? mem : npcs.slice(0, raidType.minMembers)));
      } else {
        members.push(...npcs.slice(0, Math.min(raidType.maxMembers, npcs.length)));
      }
    } else if (raidTypeKey === "sect") {
      const sects = window.sects || [];
      if (sects.length) {
        const sect = sects[Math.floor(Math.random()*sects.length)];
        const mem  = npcs.filter(n => n.sectId === sect.id).slice(0, raidType.maxMembers);
        members.push(...(mem.length >= raidType.minMembers ? mem : npcs.slice(0, raidType.minMembers)));
      } else {
        members.push(...npcs.slice(0, Math.min(raidType.maxMembers, npcs.length)));
      }
    } else {
      // kingdom / empire: use any NPCs up to max
      members.push(...npcs.slice(0, Math.min(raidType.maxMembers, npcs.length)));
    }

    if (members.length < raidType.minMembers) {
      if (typeof toast === "function") toast(`⚠️ Không đủ thành viên cho ${raidType.name}!`);
      return null;
    }

    // Find target boss
    const bossData = window.wbv31Data;
    const boss     = bossData && targetBossId
      ? bossData.bosses.find(b => b.id === targetBossId)
      : (bossData ? bossData.bosses[0] : null);

    const raid = {
      id:          `raid_${_idCtr++}_${Date.now().toString(36).slice(-4)}`,
      type:        raidTypeKey,
      typeName:    raidType.name,
      icon:        raidType.icon,
      boss:        boss ? { id: boss.id, name: boss.name, tier: boss.tier, icon: boss.icon } : null,
      members:     members.map(m => ({ id: m.id, name: m.name, realm: m.realm||0 })),
      memberCount: members.length,
      status:      "in_progress",
      startYear:   window.year || 0,
      endYear:     null,
      result:      null,
      loot:        [],
      casualties:  [],
    };

    // Simulate immediately
    _simulateRaid(raid, members, boss, raidType);

    _data.raids.unshift(raid);
    if (_data.raids.length > 100) _data.raids.pop();
    _data.totalRaids++;
    _save();
    return raid;
  }

  function _simulateRaid(raid, members, boss, raidType) {
    // Calculate combined power
    const memberPower = members.reduce((s, m) => s + (m.realm||0)*120 + (m.attack||0) + (m.defense||0), 0);
    const raidPower   = memberPower * raidType.powerMult;
    const bossPower   = boss
      ? ({ creator:500000, divine:200000, mythic:80000, legendary:30000, epic:10000, rare:3000 }[boss.tier] || 5000)
      : 5000;
    const winChance   = Math.min(0.95, Math.max(0.05, raidPower / (raidPower + bossPower)));

    raid.endYear = window.year || 0;
    raid.status  = "completed";

    if (Math.random() < winChance) {
      // Success
      raid.result  = "success";
      _data.totalSuccess++;
      const loot  = typeof lev31GenerateRaidLoot === "function"
        ? lev31GenerateRaidLoot(raid.type, "normal") : [];
      raid.loot   = loot.map(l => l.display || l.name);
      // Casualty: small % of members
      const casCount = Math.floor(members.length * Math.random() * 0.1);
      raid.casualties = members.slice(0, casCount).map(m => m.name);

      if (boss) {
        // Apply damage to boss
        if (typeof wbv31AttackBoss === "function") {
          const dmg = Math.floor(raidPower * (0.3 + Math.random() * 0.5));
          const killResult = wbv31AttackBoss(boss.id, raid.members[0]?.name || "Raid", dmg);
          raid.bossKilled = killResult === "killed";
        }
      }

      if (typeof addLog === "function") addLog(`${raidType.icon} ${raidType.name} thành công! ${raid.memberCount} thành viên · Nhận: ${raid.loot.slice(0,2).join(", ")}`, "important");
      if (typeof toast === "function") toast(`${raidType.icon} ${raidType.name} THÀNH CÔNG!`);
    } else {
      // Fail
      raid.result  = "fail";
      _data.totalFail++;
      const casCount = Math.floor(members.length * (0.1 + Math.random() * 0.3));
      raid.casualties = members.slice(0, casCount).map(m => m.name);
      // Kill casualties
      raid.casualties.forEach(name => {
        const npc = (window.npcs||[]).find(n=>n.name===name && n.status==="alive");
        if (npc && typeof killNPC === "function") killNPC(npc, `hy sinh trong ${raidType.name}`);
      });
      if (typeof addLog === "function") addLog(`${raidType.icon} ${raidType.name} thất bại! ${raid.casualties.length} thành viên hy sinh.`, "normal");
    }

    _data.history.unshift({
      type:     raid.type, typeName: raid.typeName, icon: raidType.icon,
      boss:     boss?.name || "Không rõ", result: raid.result,
      members:  raid.memberCount, loot: raid.loot.slice(0,2),
      year:     window.year || 0,
    });
    if (_data.history.length > 200) _data.history.pop();
  }

  // ── Auto Raid Tick ──
  function _tick() {
    if (!window.world) return;
    _data.tick++;
    if (_data.tick % 60 === 0) {
      // Auto trigger a random raid
      const types = Object.keys(RAID_TYPES);
      const t = types[Math.floor(Math.random() * types.length)];
      rev31CreateRaid(t, null, null);
    }
    _save();
  }

  // ── Render Panel ──
  function rev31RenderPanel() {
    const el = document.getElementById("panel-raid-v31");
    if (!el) return;
    const hist = _data.history.slice(0, 40);
    const bosses = (window.wbv31Data?.bosses || []).filter(b=>b.status==="active");

    el.innerHTML = `
    <div style="padding:12px;max-width:900px;margin:0 auto">
      <div style="font-family:var(--font-title);font-size:18px;color:var(--gold);margin-bottom:12px">⚔️ Raid Engine V31 — Đột Kích Boss</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">
        <div style="background:rgba(250,204,21,0.08);border:1px solid rgba(250,204,21,0.2);border-radius:8px;padding:10px;text-align:center">
          <div style="color:var(--gold);font-size:20px;font-weight:700">${_data.totalRaids}</div>
          <div style="color:var(--white-dim);font-size:10px">Tổng Raid</div>
        </div>
        <div style="background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.2);border-radius:8px;padding:10px;text-align:center">
          <div style="color:#4ade80;font-size:20px;font-weight:700">${_data.totalSuccess}</div>
          <div style="color:var(--white-dim);font-size:10px">Thành Công</div>
        </div>
        <div style="background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.2);border-radius:8px;padding:10px;text-align:center">
          <div style="color:#f87171;font-size:20px;font-weight:700">${_data.totalFail}</div>
          <div style="color:var(--white-dim);font-size:10px">Thất Bại</div>
        </div>
      </div>

      <div style="color:var(--gold);font-size:12px;letter-spacing:1px;margin-bottom:8px">⚡ BẮT ĐẦU RAID</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
        ${Object.entries(RAID_TYPES).map(([k,t])=>`
          <button onclick="rev31CreateRaid('${k}',null,null)" style="background:rgba(250,204,21,0.1);border:1px solid rgba(250,204,21,0.25);color:var(--gold);border-radius:6px;padding:6px 12px;cursor:pointer;font-size:11px">
            ${t.icon} ${t.name}
          </button>
        `).join("")}
      </div>

      <div style="color:var(--gold);font-size:12px;letter-spacing:1px;margin-bottom:8px">📜 LỊCH SỬ RAID</div>
      <div style="max-height:360px;overflow-y:auto">
        ${hist.length === 0 ? `<div style="color:var(--white-dim);font-size:12px;padding:10px">Chưa có raid nào.</div>` : ""}
        ${hist.map(r=>`
          <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 10px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:11px">
            <div>
              <span style="color:var(--gold)">${r.icon} ${r.typeName}</span>
              <span style="color:var(--white-dim);margin-left:6px">vs ${r.boss}</span>
              <span style="color:var(--white-dim);margin-left:6px">(${r.members} người)</span>
            </div>
            <div>
              <span style="color:${r.result==='success'?'#4ade80':'#f87171'};font-weight:700">${r.result==='success'?'✅ THÀNH CÔNG':'❌ THẤT BẠI'}</span>
              <span style="color:var(--white-dim);margin-left:6px">Năm ${r.year}</span>
            </div>
          </div>
        `).join("")}
      </div>
    </div>`;
  }

  window.rev31CreateRaid  = rev31CreateRaid;
  window.rev31RenderPanel = rev31RenderPanel;
  window.rev31Data        = _data;

  function _init() {
    _load();
    const _orig = window.gameTick;
    window.gameTick = function() {
      if (typeof _orig === "function") _orig();
      _tick();
    };
    console.log("[RaidEngineV31] ⚔️ Raid Engine V31 — 6 loại raid · Auto-raid · Tích hợp Boss sẵn sàng.");
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(_init, 3600));
  } else {
    setTimeout(_init, 3600);
  }
})();
