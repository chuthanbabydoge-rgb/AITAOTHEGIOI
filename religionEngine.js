// ============================================================
// RELIGION ENGINE V1 — Creator God V6 Phase Next
// ============================================================
// NPCs can found religions, establish holy cities, convert
// followers, wage holy wars, and shape world history.
// ============================================================

'use strict';

// ── CONSTANTS ────────────────────────────────────────────────

const FAITH_TYPES = {
  creator:  { id: 'creator',  name: 'Thiên Đạo Giáo',   icon: '✝️',  color: '#facc15', desc: 'Tôn thờ Đấng Tạo Hóa toàn năng',        bonuses: { breakthrough: 0.05, reputation: 20 } },
  spirits:  { id: 'spirits',  name: 'Cổ Linh Giáo',     icon: '🌿',  color: '#4ade80', desc: 'Thờ phụng các Cổ Thần từ thuở khai thiên', bonuses: { hp: 200, defense: 20 } },
  heavenly: { id: 'heavenly', name: 'Thiên Đạo Tông',   icon: '☯️',  color: '#60a5fa', desc: 'Tu theo Thiên Đạo, hòa hợp vũ trụ',         bonuses: { exp: 0.1, harmony: true } },
  demonic:  { id: 'demonic',  name: 'Ma Thần Giáo',     icon: '👿',  color: '#c084fc', desc: 'Tôn thờ Ma Thần bóng tối hủy diệt',          bonuses: { attack: 50, karma: -30 } },
};

const RELIGION_RANKS = ['Sơ Lập', 'Nhỏ', 'Trung Bình', 'Lớn', 'Hùng Mạnh', 'Thiên Hạ Đệ Nhất'];

const HOLY_WAR_OUTCOMES = [
  { weight: 3, result: 'victory' },
  { weight: 2, result: 'stalemate' },
  { weight: 1, result: 'defeat'  },
];

// ── STATE ────────────────────────────────────────────────────

window.religions    = window.religions    || [];
window.holyWars     = window.holyWars     || [];
let _relIdCounter   = 1;

// ── HELPERS ──────────────────────────────────────────────────

function relRand(arr)        { return arr[Math.floor(Math.random() * arr.length)]; }
function relChance(p)        { return Math.random() < p; }
function relRandInt(a, b)    { return a + Math.floor(Math.random() * (b - a + 1)); }
function relWeightedRand(arr){ const t = arr.reduce((s,o) => s + o.weight, 0); let r = Math.random() * t; for (const o of arr) { r -= o.weight; if (r <= 0) return o.result; } return arr[arr.length-1].result; }

// ── RELIGION FORMATION ───────────────────────────────────────

function religionEngine_canFound(npc) {
  if (!npc || npc.status !== 'alive') return false;
  if (npc.realm < 3) return false; // Need Nguyên Anh+
  if (npc.reputation < 500) return false;
  if (npc.religionId) return false; // already leads one
  return true;
}

function religionEngine_foundReligion(npc, faithType) {
  if (!religionEngine_canFound(npc)) return null;

  const faith = FAITH_TYPES[faithType] || relRand(Object.values(FAITH_TYPES));
  const id = _relIdCounter++;

  // Pick a holy city from existing countries/regions
  const locationCandidates = (window.countries || []).filter(c => c.name);
  const holyCity = locationCandidates.length
    ? relRand(locationCandidates).name
    : (npc.country || npc.city || 'Thánh Địa Vô Danh');

  const religion = {
    id,
    name:        `${npc.name} Giáo`,  // named after founder
    faithType:   faith.id,
    icon:        faith.icon,
    color:       faith.color,
    desc:        faith.desc,
    founderId:   npc.id,
    founderName: npc.name,
    foundYear:   window.year || 1,
    holyCity,
    followers:   [npc.id],
    followerCount: 1,
    rank:        0,
    prestige:    npc.reputation,
    active:      true,
    holyWars:    [],
    conversions: 0,
    history:     [],
  };

  religions.push(religion);
  npc.religionId      = id;
  npc.religionRole    = 'founder';
  npc.biography && npc.biography.push({ year: window.year, event: `Khai sáng ${religion.name} tại ${holyCity}.` });

  // Log + world history
  const msg = `✝️ ${npc.name} [${REALMS[npc.realm]?.name}] khai sáng ${religion.name} (${faith.name}) tại Thánh Địa ${holyCity}!`;
  if (typeof addLog === 'function')          addLog(msg, 'important');
  if (typeof addTimeline === 'function')     addTimeline(`✝️ ${religion.name} khai sáng`, 'important', '✝️');
  if (typeof addWorldHistory === 'function') addWorldHistory('religion', msg, { religionId: id, npcName: npc.name, faithType: faith.id });
  if (typeof toast === 'function')           toast(`✝️ Tôn Giáo mới ra đời: ${religion.name}!`);

  religionEngine_save();
  return religion;
}

// ── CONVERSION ───────────────────────────────────────────────

function religionEngine_tryConvert(religion, npc) {
  if (!religion || !npc || npc.status !== 'alive') return false;
  if (npc.religionId === religion.id) return false;

  const rivalRel = npc.religionId ? religions.find(r => r.id === npc.religionId) : null;

  // Base chance: higher prestige = easier conversion; opposing faith harder
  let chance = 0.12 + (religion.prestige / 50000);
  if (rivalRel) chance *= 0.5; // Harder to flip the devout
  if (npc.karma < 0 && religion.faithType === 'demonic') chance += 0.15;
  if (npc.karma > 50 && religion.faithType === 'creator') chance += 0.1;
  chance = Math.min(chance, 0.6);

  if (!relChance(chance)) return false;

  // Remove from old religion
  if (rivalRel) {
    rivalRel.followers  = rivalRel.followers.filter(id => id !== npc.id);
    rivalRel.followerCount = Math.max(0, rivalRel.followerCount - 1);
    rivalRel.prestige  -= 10;
  }

  npc.religionId   = religion.id;
  npc.religionRole = 'follower';
  religion.followers.push(npc.id);
  religion.followerCount++;
  religion.conversions++;
  religion.prestige += 5;

  // Apply faith bonuses
  const bonuses = FAITH_TYPES[religion.faithType]?.bonuses || {};
  if (bonuses.reputation && npc.reputation !== undefined) npc.reputation += bonuses.reputation;
  if (bonuses.karma      && npc.karma      !== undefined) npc.karma      += bonuses.karma;
  if (bonuses.hp         && npc.hp         !== undefined) npc.hp         += bonuses.hp;

  return true;
}

// ── HOLY CITY ────────────────────────────────────────────────

function religionEngine_setHolyCity(religion, cityName) {
  const old = religion.holyCity;
  religion.holyCity  = cityName;
  religion.prestige += 100;
  religion.history.push({ year: window.year, event: `Thánh Địa chuyển sang ${cityName}.` });

  const msg = `⛪ ${religion.name} thiết lập Thánh Địa mới tại ${cityName} (trước đây: ${old}).`;
  if (typeof addLog          === 'function') addLog(msg, 'important');
  if (typeof addWorldHistory === 'function') addWorldHistory('religion', msg, { religionId: religion.id });
}

// ── HOLY WAR ─────────────────────────────────────────────────

function religionEngine_canDeclareHolyWar(rel1, rel2) {
  if (!rel1 || !rel2 || rel1.id === rel2.id) return false;
  if (!rel1.active || !rel2.active) return false;
  if (rel1.faithType === rel2.faithType) return false; // same faith, no war
  // Check no ongoing war between these two
  if (holyWars.some(w => w.active && ((w.attackerId === rel1.id && w.defenderId === rel2.id) || (w.attackerId === rel2.id && w.defenderId === rel1.id)))) return false;
  return true;
}

function religionEngine_declareHolyWar(attacker, defender) {
  if (!religionEngine_canDeclareHolyWar(attacker, defender)) return null;

  const war = {
    id:         `hw_${Date.now()}`,
    attackerId: attacker.id,
    attackerName: attacker.name,
    defenderId: defender.id,
    defenderName: defender.name,
    startYear:  window.year || 1,
    endYear:    null,
    active:     true,
    result:     null,
  };

  holyWars.push(war);
  attacker.holyWars.push(war.id);
  defender.holyWars.push(war.id);

  const msg = `⚔️✝️ THÁNH CHIẾN: ${attacker.name} tuyên chiến thánh với ${defender.name}! Lửa thánh bùng cháy khắp thiên hạ!`;
  if (typeof addLog          === 'function') addLog(msg, 'death');
  if (typeof addTimeline     === 'function') addTimeline(`⚔️ Thánh Chiến: ${attacker.name} vs ${defender.name}`, 'death', '⚔️');
  if (typeof addWorldHistory === 'function') addWorldHistory('religion', msg, { religionId: attacker.id, targetId: defender.id });
  if (typeof toast           === 'function') toast(`⚔️ Thánh Chiến bùng nổ!`);

  religionEngine_save();
  return war;
}

function religionEngine_resolveHolyWar(war) {
  if (!war || !war.active) return;

  const attacker = religions.find(r => r.id === war.attackerId);
  const defender = religions.find(r => r.id === war.defenderId);
  if (!attacker || !defender) { war.active = false; return; }

  // Power calc: followers + prestige
  const aPow = attacker.followerCount * 10 + attacker.prestige;
  const dPow = defender.followerCount * 10 + defender.prestige;
  const total = aPow + dPow || 1;
  const roll  = Math.random();
  let result;
  if (roll < aPow / total * 0.8)          result = 'victory';
  else if (roll < (aPow + dPow) / total * 0.6) result = 'stalemate';
  else                                    result = 'defeat';

  war.active  = false;
  war.result  = result;
  war.endYear = window.year;

  let msg;
  if (result === 'victory') {
    // Transfer some followers
    const convert = Math.floor(defender.followerCount * 0.2);
    defender.followerCount = Math.max(0, defender.followerCount - convert);
    attacker.followerCount += convert;
    attacker.prestige += 300;
    defender.prestige  = Math.max(0, defender.prestige - 150);
    // Attacker claims defender's holy city
    if (defender.holyCity) { attacker.holyCity = `${attacker.holyCity} & ${defender.holyCity}`; }
    msg = `✝️ THÁNH CHIẾN KẾT THÚC: ${attacker.name} ĐẠI THẮNG ${defender.name}! ${convert} tín đồ cải đạo, thánh địa mở rộng!`;
  } else if (result === 'stalemate') {
    attacker.prestige += 50;
    defender.prestige += 50;
    msg = `✝️ THÁNH CHIẾN: ${attacker.name} vs ${defender.name} — Đôi bên bất phân thắng bại. Ngừng chiến.`;
  } else {
    // Defeat
    const convert = Math.floor(attacker.followerCount * 0.15);
    attacker.followerCount = Math.max(0, attacker.followerCount - convert);
    defender.followerCount += convert;
    attacker.prestige  = Math.max(0, attacker.prestige - 200);
    defender.prestige += 200;
    msg = `✝️ THÁNH CHIẾN: ${attacker.name} thảm bại trước ${defender.name}! ${convert} tín đồ rời bỏ. Uy tín sụp đổ.`;
  }

  attacker.history.push({ year: window.year, event: `Thánh chiến với ${defender.name}: ${result}.` });
  defender.history.push({ year: window.year, event: `Bị thánh chiến bởi ${attacker.name}: ${result}.` });

  if (typeof addLog          === 'function') addLog(msg, 'death');
  if (typeof addTimeline     === 'function') addTimeline(`✝️ Thánh Chiến kết thúc: ${result}`, 'death', '✝️');
  if (typeof addWorldHistory === 'function') addWorldHistory('religion', msg, { religionId: attacker.id, result });
  if (typeof toast           === 'function') toast(`✝️ Thánh Chiến kết thúc!`);
}

// ── RANK CALCULATION ─────────────────────────────────────────

function religionEngine_updateRanks() {
  for (const rel of religions) {
    if (!rel.active) continue;
    const fc = rel.followerCount;
    if      (fc >= 200) rel.rank = 5;
    else if (fc >= 100) rel.rank = 4;
    else if (fc >= 50)  rel.rank = 3;
    else if (fc >= 20)  rel.rank = 2;
    else if (fc >= 5)   rel.rank = 1;
    else                rel.rank = 0;
  }
}

// ── TICK (called each simulation year) ───────────────────────

function religionEngine_tick() {
  if (!window.religions) return;

  const aliveNPCs = (window.npcs || []).filter(n => n.status === 'alive');

  // 1. Powerful NPCs might found a new religion
  if (relChance(0.08)) {
    const candidates = aliveNPCs.filter(n => religionEngine_canFound(n));
    if (candidates.length > 0) {
      const founder   = relRand(candidates);
      const faithKey  = relRand(Object.keys(FAITH_TYPES));
      religionEngine_foundReligion(founder, faithKey);
    }
  }

  // 2. Conversion attempts
  for (const rel of religions.filter(r => r.active && r.followerCount > 0)) {
    const tries = Math.min(5, Math.ceil(rel.prestige / 500));
    const targets = aliveNPCs.filter(n => n.religionId !== rel.id);
    for (let i = 0; i < tries; i++) {
      if (targets.length === 0) break;
      const target = relRand(targets);
      religionEngine_tryConvert(rel, target);
    }
  }

  // 3. Possible holy war declaration
  const activeRels = religions.filter(r => r.active && r.followerCount >= 3);
  if (activeRels.length >= 2 && relChance(0.06)) {
    const attacker = relRand(activeRels);
    const options  = activeRels.filter(r => r.id !== attacker.id && r.faithType !== attacker.faithType);
    if (options.length > 0) {
      const defender = relRand(options);
      religionEngine_declareHolyWar(attacker, defender);
    }
  }

  // 4. Resolve ongoing holy wars (last ~3 years)
  for (const war of holyWars.filter(w => w.active)) {
    const age = (window.year || 1) - (war.startYear || 1);
    if (age >= relRandInt(2, 4)) {
      religionEngine_resolveHolyWar(war);
    }
  }

  // 5. Defunct religions (no followers)
  for (const rel of religions.filter(r => r.active && r.followerCount <= 0)) {
    rel.active = false;
    const msg = `✝️ ${rel.name} sụp đổ — không còn tín đồ.`;
    if (typeof addLog          === 'function') addLog(msg, 'death');
    if (typeof addWorldHistory === 'function') addWorldHistory('religion', msg, { religionId: rel.id });
  }

  // 6. Holy city establishment by growing religions
  for (const rel of religions.filter(r => r.active && r.followerCount >= 10)) {
    if (relChance(0.03)) {
      const countryCandidates = (window.countries || []).filter(c => c.name);
      if (countryCandidates.length > 0) {
        const newCity = relRand(countryCandidates).name;
        if (newCity !== rel.holyCity) {
          religionEngine_setHolyCity(rel, newCity);
        }
      }
    }
  }

  // 7. Update ranks
  religionEngine_updateRanks();

  // 8. Unlock religion sidebar tab
  if (religions.length > 0 && typeof ecGetUnlocks === 'function') {
    const u = ecGetUnlocks();
    if (!u.religion) {
      u.religion = true;
      try { localStorage.setItem('cgv6_ec_unlocks', JSON.stringify(u)); } catch {}
      const btn = document.querySelector('.nav-btn[data-panel="religion"]');
      if (btn) {
        btn.style.display = '';
        btn.classList.remove('ec-hidden');
        btn.classList.add('ec-unlocked-flash');
        setTimeout(() => btn.classList.remove('ec-unlocked-flash'), 1200);
      }
      if (typeof addLog  === 'function') addLog('🔓 KHÁM PHÁ: [✝️ Tôn Giáo] được mở khóa!', 'important');
      if (typeof toast   === 'function') toast('✝️ Tôn Giáo đã xuất hiện trong thiên địa!');
    }
  }

  religionEngine_save();
}

// ── PANEL RENDER ─────────────────────────────────────────────

function religionEngine_renderPanel() {
  const panel = document.getElementById('panel-religion');
  if (!panel) return;

  const activeRels  = religions.filter(r => r.active);
  const inactiveRels = religions.filter(r => !r.active);
  const activeWarsNow = holyWars.filter(w => w.active);

  // Follower map: npcId → religion
  const followerCounts = {};
  for (const rel of religions) followerCounts[rel.id] = rel.followerCount;

  panel.innerHTML = `
    <div class="panel-toolbar">
      <h2 style="margin:0;font-size:16px;color:var(--gold)">✝️ TÔN GIÁO THIÊN ĐỊA</h2>
      <div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap">
        <span class="rel-stat-pill">📿 ${activeRels.length} Giáo Phái</span>
        <span class="rel-stat-pill">⚔️ ${activeWarsNow.length} Thánh Chiến</span>
        <span class="rel-stat-pill">👤 ${religions.reduce((s,r) => s + r.followerCount, 0)} Tín Đồ</span>
      </div>
    </div>

    <!-- FAITH OVERVIEW -->
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-bottom:16px">
      ${Object.values(FAITH_TYPES).map(f => {
        const rels = religions.filter(r => r.faithType === f.id && r.active);
        const total = rels.reduce((s,r) => s + r.followerCount, 0);
        return `<div class="rel-faith-card" style="border-color:${f.color}40">
          <div class="rel-faith-icon">${f.icon}</div>
          <div style="font-size:13px;font-weight:700;color:${f.color}">${f.name}</div>
          <div style="font-size:11px;opacity:0.7;margin:2px 0">${f.desc}</div>
          <div style="font-size:12px;margin-top:4px">📿 ${rels.length} giáo phái · 👤 ${total} tín đồ</div>
        </div>`;
      }).join('')}
    </div>

    <!-- ACTIVE HOLY WARS -->
    ${activeWarsNow.length > 0 ? `
    <div class="rel-section">
      <div class="rel-section-title">⚔️ THÁNH CHIẾN ĐANG DIỄN RA</div>
      ${activeWarsNow.map(w => `
        <div class="rel-war-row">
          <span style="color:#f87171">⚔️ ${w.attackerName}</span>
          <span style="opacity:.5"> vs </span>
          <span style="color:#60a5fa">${w.defenderName}</span>
          <span style="margin-left:auto;font-size:11px;opacity:.6">Năm ${w.startYear}</span>
        </div>
      `).join('')}
    </div>` : ''}

    <!-- ACTIVE RELIGIONS -->
    <div class="rel-section">
      <div class="rel-section-title">✝️ GIÁO PHÁI ĐANG HOẠT ĐỘNG (${activeRels.length})</div>
      ${activeRels.length === 0
        ? `<div class="rel-empty">Chưa có giáo phái nào. Các NPC quyền năng sẽ khai sáng tôn giáo theo thời gian.</div>`
        : activeRels.sort((a,b) => b.followerCount - a.followerCount).map(rel => {
          const faith = FAITH_TYPES[rel.faithType] || FAITH_TYPES.creator;
          const rank  = RELIGION_RANKS[rel.rank] || 'Sơ Lập';
          const pct   = Math.min(100, (rel.followerCount / 50) * 100);
          return `
          <div class="rel-card" style="border-left-color:${rel.color}">
            <div class="rel-card-header">
              <span class="rel-icon">${rel.icon}</span>
              <div>
                <div style="font-weight:700;font-size:14px">${rel.name}</div>
                <div style="font-size:11px;opacity:.7">${faith.name} · ${rank} · Thánh Địa: ${rel.holyCity}</div>
              </div>
              <div style="margin-left:auto;text-align:right">
                <div style="font-size:13px;color:var(--gold)">👤 ${rel.followerCount}</div>
                <div style="font-size:11px;opacity:.6">⭐ ${Math.floor(rel.prestige)}</div>
              </div>
            </div>
            <div style="margin:6px 0 2px;font-size:11px;opacity:.6">
              Khai sáng bởi ${rel.founderName} · Năm ${rel.foundYear} · Cải đạo: ${rel.conversions}
            </div>
            <div class="rel-progress-bar">
              <div class="rel-progress-fill" style="width:${pct}%;background:${rel.color}"></div>
            </div>
            ${rel.history.length > 0 ? `
            <div class="rel-history">
              ${rel.history.slice(-3).map(h => `<div class="rel-hist-item">📜 [Năm ${h.year}] ${h.event}</div>`).join('')}
            </div>` : ''}
          </div>`;
        }).join('')}
    </div>

    <!-- DEFUNCT RELIGIONS -->
    ${inactiveRels.length > 0 ? `
    <div class="rel-section">
      <div class="rel-section-title">☠️ GIÁO PHÁI ĐÃ SỤP ĐỔ (${inactiveRels.length})</div>
      ${inactiveRels.map(rel => `
        <div class="rel-defunct-row">
          <span>${rel.icon} ${rel.name}</span>
          <span style="opacity:.5;font-size:11px">Sụp đổ năm ${rel.holyWars.length > 0 ? '(chiến tranh)' : ''}</span>
        </div>
      `).join('')}
    </div>` : ''}

    <!-- HOLY WAR HISTORY -->
    ${holyWars.filter(w => !w.active).length > 0 ? `
    <div class="rel-section">
      <div class="rel-section-title">📖 LỊCH SỬ THÁNH CHIẾN</div>
      ${holyWars.filter(w => !w.active).slice(-8).reverse().map(w => {
        const icon = w.result === 'victory' ? '🏆' : w.result === 'stalemate' ? '🤝' : '💔';
        return `<div class="rel-war-hist">${icon} Năm ${w.startYear}–${w.endYear}: ${w.attackerName} vs ${w.defenderName} → <b>${w.result === 'victory' ? 'Thắng' : w.result === 'stalemate' ? 'Hòa' : 'Thua'}</b></div>`;
      }).join('')}
    </div>` : ''}
  `;
}

// ── SAVE / LOAD ───────────────────────────────────────────────

function religionEngine_save() {
  try {
    localStorage.setItem('cgv6_religions', JSON.stringify(religions));
    localStorage.setItem('cgv6_holyWars',  JSON.stringify(holyWars));
    localStorage.setItem('cgv6_relIdCtr',  _relIdCounter);
  } catch(e) { console.warn('religionEngine save failed:', e); }
}

function religionEngine_load() {
  try {
    const r  = localStorage.getItem('cgv6_religions');
    const hw = localStorage.getItem('cgv6_holyWars');
    const ic = localStorage.getItem('cgv6_relIdCtr');
    if (r)  { window.religions = JSON.parse(r); }
    if (hw) { window.holyWars  = JSON.parse(hw); }
    if (ic) { _relIdCounter    = parseInt(ic) || 1; }
  } catch(e) { console.warn('religionEngine load failed:', e); }
}

// ── CSS INJECTION ─────────────────────────────────────────────

(function injectReligionCSS() {
  if (document.getElementById('religion-engine-css')) return;
  const style = document.createElement('style');
  style.id = 'religion-engine-css';
  style.textContent = `
    #panel-religion { padding: 16px; overflow-y: auto; }
    .rel-stat-pill {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 3px 10px;
      font-size: 12px;
      color: var(--gold);
    }
    .rel-faith-card {
      background: var(--bg-card);
      border: 1px solid;
      border-radius: 8px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    .rel-faith-icon { font-size: 22px; margin-bottom: 4px; }
    .rel-section { margin-bottom: 18px; }
    .rel-section-title {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1px;
      opacity: .6;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid var(--border);
    }
    .rel-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-left: 3px solid #facc15;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 8px;
    }
    .rel-card-header { display: flex; align-items: flex-start; gap: 10px; }
    .rel-icon { font-size: 24px; flex-shrink: 0; }
    .rel-progress-bar {
      height: 4px;
      background: var(--border);
      border-radius: 2px;
      margin: 6px 0;
      overflow: hidden;
    }
    .rel-progress-fill { height: 100%; border-radius: 2px; transition: width 0.5s; }
    .rel-history { margin-top: 4px; }
    .rel-hist-item { font-size: 11px; opacity: .65; padding: 1px 0; }
    .rel-war-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      padding: 6px 8px;
      background: var(--bg-card);
      border: 1px solid #f87171;
      border-radius: 6px;
      margin-bottom: 6px;
    }
    .rel-war-hist { font-size: 12px; padding: 4px 0; border-bottom: 1px solid var(--border); opacity: .8; }
    .rel-defunct-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      opacity: .5;
      padding: 3px 0;
    }
    .rel-empty { font-size: 13px; opacity: .5; text-align: center; padding: 20px; }
  `;
  document.head.appendChild(style);
})();

// ── EXPOSE GLOBALS ────────────────────────────────────────────

window.religions                    = window.religions;
window.holyWars                     = window.holyWars;
window.religionEngine_tick          = religionEngine_tick;
window.religionEngine_renderPanel   = religionEngine_renderPanel;
window.religionEngine_foundReligion = religionEngine_foundReligion;
window.religionEngine_tryConvert    = religionEngine_tryConvert;
window.religionEngine_declareHolyWar= religionEngine_declareHolyWar;
window.religionEngine_save          = religionEngine_save;
window.religionEngine_load          = religionEngine_load;

// Auto-load on script execution
religionEngine_load();
