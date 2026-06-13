/* ============================================================
   WORLD BOSS ENGINE V31 — Thế Giới Boss Hệ Thống
   worldBossEngineV31.js
   Load AFTER: app.js, dungeonSystem.js, lootEngineV31.js
   EXPAND ONLY — NEVER DELETE — NEVER REPLACE
   ============================================================ */
(function () {
  "use strict";

  const SAVE_KEY = "cgv6_worldboss_v31";
  const VERSION  = "V31";

  // ── Boss Tier Definitions ──
  const BOSS_TIERS = {
    rare:    { label:"Rare",    icon:"🔵", color:"#60a5fa", power:1,   spawnChance:0.35, hpBase:50000,  xpMult:1,   lootTier:"rare" },
    epic:    { label:"Epic",    icon:"🟣", color:"#a78bfa", power:2,   spawnChance:0.25, hpBase:200000, xpMult:2,   lootTier:"epic" },
    legendary:{ label:"Legendary",icon:"🟠",color:"#fb923c", power:3,   spawnChance:0.18, hpBase:800000, xpMult:4,   lootTier:"legendary" },
    mythic:  { label:"Mythic",  icon:"🔴", color:"#f87171", power:5,   spawnChance:0.12, hpBase:3000000,xpMult:8,   lootTier:"legendary" },
    divine:  { label:"Divine",  icon:"⭐", color:"#facc15", power:10,  spawnChance:0.07, hpBase:10000000,xpMult:16, lootTier:"divine" },
    creator: { label:"Creator", icon:"🌌", color:"#e879f9", power:20,  spawnChance:0.03, hpBase:99999999,xpMult:50, lootTier:"divine" },
  };

  // ── Boss Templates ──
  const BOSS_TEMPLATES = [
    // Rare
    { name:"Huyết Ảnh Vương",    title:"Kẻ Đến Từ Bóng Tối",       tier:"rare",    abilities:["Huyết Kiếm Vũ","Bóng Tối Phân Thân"],  location:"Huyết Ảnh Cốc" },
    { name:"Linh Xà Đại Thánh",  title:"Vương Giả Của Linh Xà",    tier:"rare",    abilities:["Độc Xà Thổ Vụ","Linh Xà Trấn Áp"],    location:"Linh Xà Sơn Lâm" },
    { name:"Băng Hồn Quỷ Vương", title:"Chủ Nhân Cõi Băng Giá",   tier:"rare",    abilities:["Vạn Niên Hàn Băng","Băng Linh Trận"],   location:"Băng Nguyên Tuyết Điền" },
    // Epic
    { name:"Thiên Ma Đại Nhân",  title:"Ma Giới Tiên Phong",        tier:"epic",    abilities:["Vạn Ma Hỗn Loạn","Thiên Ma Giải Thể","Linh Hồn Xâm Thực"], location:"Thiên Ma Cổ Tháp" },
    { name:"Cổ Long Chi Tổ",     title:"Tổ Tiên Thần Long",         tier:"epic",    abilities:["Long Hỏa Thiên Diệt","Vảy Long Thánh Khải","Long Áp Thiên Địa"], location:"Cổ Long Thần Uyên" },
    { name:"Vương Giả Zombie",   title:"Chúa Tể Xác Sống",         tier:"epic",    abilities:["Đại Dịch Lan Tràn","Xác Sống Triệu Hồi","Biến Dị Cường Hóa"], location:"Khu Dân Cư Nhiễm Dịch" },
    // Legendary
    { name:"Thần Thú Hỗn Độn",  title:"Quái Vật Từ Thái Sơ",      tier:"legendary",abilities:["Hỗn Độn Nuốt Trời","Vô Hình Áp Chế","Thái Cổ Bá Thể","Tiêu Diệt Linh Căn"], location:"Thái Cổ Hỗn Độn Giới" },
    { name:"Thiên Đế Phân Thân", title:"Thiên Đế Tại Thế",         tier:"legendary",abilities:["Thiên Đế Phán Xét","Vạn Pháp Quy Tông","Thiên Địa Khóa"], location:"Thiên Đế Cổ Điện" },
    { name:"Vực Thẳm Ma Thần",  title:"Chúa Tể Vực Sâu",          tier:"legendary",abilities:["Vực Thẳm Mở Ra","Ma Thần Hiện Thân","Linh Hồn Tiêu Tán","Vạn Ma Phụng Chủ"], location:"Vực Thẳm Thái Cổ" },
    // Mythic
    { name:"Khai Thiên Cổ Thú",  title:"Quái Vật Khai Thiên",       tier:"mythic",  abilities:["Khai Thiên Một Chưởng","Vũ Trụ Vận Chuyển","Không Gian Nghiền Nát","Thời Gian Đảo Ngược","Nguyên Thủy Hủy Diệt"], location:"Khai Thiên Vực" },
    { name:"Hư Không Chân Ma",   title:"Thống Trị Hư Không",        tier:"mythic",  abilities:["Hư Không Nuốt Trọn","Vô Địa Vô Thiên","Ma Khí Hóa Thần","Thiên Địa Biến Dị"], location:"Hư Không Ma Giới" },
    // Divine
    { name:"Thiên Đạo Phán Quan",title:"Tiếng Nói Của Thiên Đạo",  tier:"divine",  abilities:["Thiên Đạo Trừng Phạt","Linh Hồn Thẩm Phán","Vạn Kiếp Không Siêu Thoát","Thiên Tâm Không Từ Bi","Đạo Tâm Phá Hủy"], location:"Thiên Đạo Thần Đình" },
    { name:"Nguyên Thủy Ma Tổ",  title:"Thủy Tổ Của Tất Cả Ma",    tier:"divine",  abilities:["Nguyên Thủy Ma Công","Vạn Ma Triều Bái","Thần Thánh Ô Uế","Ma Đạo Thống Thiên","Hư Vô Hóa Thần"], location:"Nguyên Thủy Ma Giới" },
    // Creator
    { name:"Phá Hủy Chi Thần",   title:"Đấng Phá Hủy Thế Giới",    tier:"creator", abilities:["Thế Giới Hủy Diệt","Vũ Trụ Tái Tạo","Luật Tắc Xóa Bỏ","Tồn Tại Phủ Nhận","Nhân Quả Đoạn Tuyệt","Hư Vô Hiện Thân"], location:"Vũ Trụ Rìa Ngoài" },
  ];

  // ── State ──
  let _data = {
    bosses:    [],   // active world bosses
    killed:    [],   // kill records
    evolving:  [],   // bosses in evolution
    spawnTick: 0,
    totalSpawned: 0,
    totalKilled:  0,
  };
  let _idCtr = 1;

  // ── Persistence ──
  function _save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(_data)); } catch(e) {}
  }
  function _load() {
    try {
      const s = localStorage.getItem(SAVE_KEY);
      if (s) { const p = JSON.parse(s); Object.assign(_data, p); }
    } catch(e) {}
  }

  // ── Spawn ──
  function _spawnBoss(tierKey) {
    const tier = BOSS_TIERS[tierKey];
    if (!tier) return null;
    const pool = BOSS_TEMPLATES.filter(t => t.tier === tierKey);
    if (!pool.length) return null;
    const tmpl = pool[Math.floor(Math.random() * pool.length)];
    const yr = (window.year || 0);
    const boss = {
      id:          `wb_${_idCtr++}_${Date.now().toString(36).slice(-4)}`,
      name:        tmpl.name,
      title:       tmpl.title,
      tier:        tierKey,
      tierLabel:   tier.label,
      icon:        tier.icon,
      color:       tier.color,
      level:       Math.floor(10 * tier.power + Math.random() * 20),
      realm:       Math.min(9, Math.floor(tier.power * 1.5)),
      hp:          tier.hpBase + Math.floor(Math.random() * tier.hpBase * 0.5),
      maxHp:       tier.hpBase + Math.floor(Math.random() * tier.hpBase * 0.5),
      abilities:   tmpl.abilities,
      location:    tmpl.location,
      lootTier:    tier.lootTier,
      spawnYear:   yr,
      threat:      "regional",
      ticksAlive:  0,
      damageDealt: 0,
      kills:       0,
      firstBlood:  null,
      status:      "active",
    };
    boss.maxHp = boss.hp;
    _data.bosses.unshift(boss);
    if (_data.bosses.length > 50) _data.bosses.pop();
    _data.totalSpawned++;
    _recordHistory("spawn", `${tier.icon} World Boss ${boss.name} [${tier.label}] xuất hiện tại ${boss.location}!`);
    if (typeof addLog === "function") addLog(`${tier.icon} World Boss ${boss.name} [${tier.label}] giáng lâm tại ${boss.location}!`, "important");
    if (typeof addTimeline === "function") addTimeline(`${tier.icon} ${boss.name} giáng thế`, "death", tier.icon);
    if (typeof toast === "function") toast(`${tier.icon} World Boss ${boss.name} xuất hiện!`);
    return boss;
  }

  // ── Attack Boss (NPC/Player) ──
  function wbv31AttackBoss(bossId, attackerName, damage) {
    const boss = _data.bosses.find(b => b.id === bossId && b.status === "active");
    if (!boss) return false;
    if (!boss.firstBlood) boss.firstBlood = attackerName;
    boss.hp -= damage;
    boss.damageDealt += damage;
    if (boss.hp <= 0) {
      wbv31KillBoss(bossId, attackerName);
      return "killed";
    }
    return "damaged";
  }

  // ── Kill Boss ──
  function wbv31KillBoss(bossId, killerName) {
    const boss = _data.bosses.find(b => b.id === bossId);
    if (!boss || boss.status === "dead") return;
    boss.status    = "dead";
    boss.killedBy  = killerName;
    boss.killedYear= window.year || 0;
    _data.killed.unshift({ ...boss, killedBy: killerName, killedYear: window.year || 0 });
    if (_data.killed.length > 200) _data.killed.pop();
    _data.totalKilled++;
    _data.bosses = _data.bosses.filter(b => b.id !== bossId);

    // Generate loot
    const loot = typeof wbv31GenerateLoot === "function"
      ? wbv31GenerateLoot(boss.lootTier, boss.tier)
      : [];

    _recordHistory("kill", `${boss.icon} ${killerName} đã tiêu diệt World Boss ${boss.name} [${boss.tierLabel}]!`);
    if (typeof addLog === "function") addLog(`🏆 ${killerName} hạ gục World Boss ${boss.name} [${boss.tierLabel}]! Nhận: ${loot.slice(0,2).map(l=>l.name).join(", ")}`, "important");
    if (typeof addTimeline === "function") addTimeline(`🏆 ${boss.name} bị tiêu diệt bởi ${killerName}`, "important", "🏆");
    if (typeof toast === "function") toast(`🏆 World Boss ${boss.name} đã bị tiêu diệt!`);

    // Hook: legendary hunt
    if (typeof lhv31RecordKill === "function") lhv31RecordKill(boss, killerName);
    // Hook: boss evolution — remove from evolution queue
    if (typeof bevV31OnBossKilled === "function") bevV31OnBossKilled(bossId);

    _save();
    return loot;
  }

  // ── Auto simulate boss attacks on world ──
  function _bossAttackWorld(boss) {
    boss.ticksAlive++;
    boss.kills = boss.kills || 0;
    const npcs = window.npcs || [];
    const alive = npcs.filter(n => n.status === "alive" && n.realm <= (boss.realm || 3));
    if (!alive.length) return;
    // Boss has small chance to kill weak NPCs
    const victim = alive[Math.floor(Math.random() * alive.length)];
    if (Math.random() < 0.15) {
      if (typeof killNPC === "function") killNPC(victim, `bị World Boss ${boss.name} sát hại`);
      boss.kills++;
      if (typeof addLog === "function") addLog(`💀 World Boss ${boss.name} sát hại ${victim.name}!`, "normal");
    }
  }

  // ── Try auto-kill by NPCs ──
  function _autoKillAttempt(boss) {
    const npcs = window.npcs || [];
    const heroes = npcs.filter(n => n.status === "alive" && n.realm >= (boss.realm || 0));
    if (!heroes.length) return;
    // Build combined power
    const tierPow = BOSS_TIERS[boss.tier]?.power || 1;
    const grp = heroes.slice(0, Math.min(10, heroes.length));
    const power = grp.reduce((s, n) => s + (n.realm || 0) * 100 + (n.attack || 0) + (n.defense || 0), 0);
    const needed = tierPow * 3000;
    if (power > needed && Math.random() < 0.12) {
      const killer = grp.sort((a,b) => (b.realm||0)-(a.realm||0))[0];
      wbv31KillBoss(boss.id, killer.name);
    }
  }

  // ── Tick ──
  function _tick() {
    if (!window.world) return;
    _data.spawnTick++;

    // Evolve bosses
    _data.bosses.forEach(b => {
      if (b.status !== "active") return;
      _bossAttackWorld(b);
      _autoKillAttempt(b);
    });

    // Spawn new boss every ~80 ticks
    if (_data.spawnTick % 80 === 0) {
      const roll = Math.random();
      let cum = 0;
      for (const [k, t] of Object.entries(BOSS_TIERS)) {
        cum += t.spawnChance;
        if (roll < cum) { _spawnBoss(k); break; }
      }
    }
    _save();
  }

  // ── History hook ──
  function _recordHistory(type, msg) {
    if (typeof addWorldHistory === "function") addWorldHistory("boss", msg, {});
    if (typeof wmAddMemory === "function") wmAddMemory("boss", msg);
  }

  // ── Render Panel ──
  function wbv31RenderPanel() {
    const el = document.getElementById("panel-worldboss-v31");
    if (!el) return;
    const active   = _data.bosses.filter(b => b.status === "active");
    const killed   = _data.killed.slice(0, 30);
    const tierOrder = ["creator","divine","mythic","legendary","epic","rare"];
    const sorted = active.slice().sort((a,b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier));

    el.innerHTML = `
    <div style="padding:12px;max-width:900px;margin:0 auto">
      <div style="font-family:var(--font-title);font-size:18px;color:var(--gold);margin-bottom:12px">
        👹 World Boss V31 — ${sorted.length} Boss Đang Hoạt Động
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">
        <div style="background:rgba(250,204,21,0.08);border:1px solid rgba(250,204,21,0.2);border-radius:8px;padding:10px;text-align:center">
          <div style="color:var(--gold);font-size:22px;font-weight:700">${_data.totalSpawned}</div>
          <div style="color:var(--white-dim);font-size:10px">Tổng Xuất Hiện</div>
        </div>
        <div style="background:rgba(250,204,21,0.08);border:1px solid rgba(250,204,21,0.2);border-radius:8px;padding:10px;text-align:center">
          <div style="color:#4ade80;font-size:22px;font-weight:700">${_data.totalKilled}</div>
          <div style="color:var(--white-dim);font-size:10px">Đã Tiêu Diệt</div>
        </div>
        <div style="background:rgba(250,204,21,0.08);border:1px solid rgba(250,204,21,0.2);border-radius:8px;padding:10px;text-align:center">
          <div style="color:#f87171;font-size:22px;font-weight:700">${sorted.length}</div>
          <div style="color:var(--white-dim);font-size:10px">Đang Hoạt Động</div>
        </div>
      </div>

      <div style="margin-bottom:8px;color:var(--gold);font-size:12px;letter-spacing:1px">⚡ BOSS ĐANG HOẠT ĐỘNG</div>
      ${sorted.length === 0 ? `<div style="color:var(--white-dim);font-size:12px;padding:20px;text-align:center">Không có World Boss nào. Boss sẽ xuất hiện theo thời gian simulation.</div>` : ""}
      ${sorted.map(boss => {
        const tier = BOSS_TIERS[boss.tier] || {};
        const hpPct = Math.max(0, Math.floor(boss.hp / boss.maxHp * 100));
        return `<div style="background:rgba(0,0,0,0.4);border:1px solid ${tier.color||'#444'};border-radius:10px;padding:12px;margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <div>
              <span style="color:${tier.color};font-size:16px;font-weight:700">${boss.icon} ${boss.name}</span>
              <span style="color:var(--white-dim);font-size:11px;margin-left:8px">${boss.title}</span>
            </div>
            <span style="background:${tier.color}22;color:${tier.color};border:1px solid ${tier.color}55;border-radius:4px;padding:2px 8px;font-size:10px;font-weight:700">${tier.label}</span>
          </div>
          <div style="font-size:10px;color:var(--white-dim);margin-bottom:6px">📍 ${boss.location} · Cấp ${boss.level} · Cõi ${boss.realm}</div>
          <div style="font-size:10px;color:#a78bfa;margin-bottom:6px">⚡ ${boss.abilities.join(" · ")}</div>
          <div style="margin-bottom:4px">
            <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--white-dim);margin-bottom:2px">
              <span>HP</span><span>${boss.hp.toLocaleString()} / ${boss.maxHp.toLocaleString()} (${hpPct}%)</span>
            </div>
            <div style="height:6px;background:#1e293b;border-radius:3px;overflow:hidden">
              <div style="height:100%;width:${hpPct}%;background:${hpPct > 50 ? '#4ade80' : hpPct > 25 ? '#facc15' : '#f87171'};transition:width 0.3s"></div>
            </div>
          </div>
          <div style="font-size:10px;color:var(--white-dim)">Xuất hiện năm ${boss.spawnYear} · Đã giết ${boss.kills||0} tu sĩ · Mối đe dọa: <span style="color:#f87171;text-transform:uppercase">${boss.threat}</span></div>
        </div>`;
      }).join("")}

      <div style="margin:12px 0 8px;color:var(--gold);font-size:12px;letter-spacing:1px">🏆 BOSS ĐÃ TIÊU DIỆT (${killed.length})</div>
      <div style="max-height:260px;overflow-y:auto">
        ${killed.length === 0 ? `<div style="color:var(--white-dim);font-size:12px;padding:10px">Chưa có Boss nào bị tiêu diệt.</div>` : ""}
        ${killed.map(b => {
          const tier = BOSS_TIERS[b.tier] || {};
          return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:11px">
            <div>
              <span style="color:${tier.color}">${b.icon} ${b.name}</span>
              <span style="color:var(--white-dim);margin-left:6px">[${tier.label}]</span>
            </div>
            <div style="color:#4ade80">🏆 ${b.killedBy || "?"} · Năm ${b.killedYear||0}</div>
          </div>`;
        }).join("")}
      </div>
    </div>`;
  }
  window.wbv31RenderPanel = wbv31RenderPanel;
  window.wbv31AttackBoss  = wbv31AttackBoss;
  window.wbv31KillBoss    = wbv31KillBoss;
  window.wbv31SpawnBoss   = _spawnBoss;
  window.wbv31Data        = _data;

  // ── Init ──
  function _init() {
    _load();
    // Hook gameTick
    const _orig = window.gameTick;
    window.gameTick = function() {
      if (typeof _orig === "function") _orig();
      _tick();
    };
    console.log("[WorldBossV31] 👹 World Boss Engine V31 — 6 tiers · Auto-spawn · Auto-kill sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(_init, 3200));
  } else {
    setTimeout(_init, 3200);
  }
})();
