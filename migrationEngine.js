'use strict';
/* ============================================================
   MIGRATION ENGINE V1 — Creator God V6
   Di Dân Hệ Thống — Tu Sĩ · Lưu Dân · Thương Nhân · Học Giả
   Di Dân Dựa Trên Hoàn Cảnh: Chiến Tranh · Linh Khí · Kinh Tế · Văn Hóa
   ============================================================ */

// ─── MIGRATION TYPE DEFINITIONS ───────────────────────────────

const MIGRATION_TYPES = {
  refugee:   { id:'refugee',   icon:'🏃', name:'Lưu Dân',       color:'#f87171', desc:'Chạy trốn chiến tranh và bất ổn.',         popScale: 0.08, trigger:'war'       },
  pilgrim:   { id:'pilgrim',   icon:'🧘', name:'Hành Hương',    color:'#c084fc', desc:'Tìm đến vùng đất linh khí dồi dào.',       popScale: 0.04, trigger:'cultivation'},
  merchant:  { id:'merchant',  icon:'💼', name:'Thương Nhân',   color:'#facc15', desc:'Đi theo tuyến thương mại và kinh tế.',     popScale: 0.03, trigger:'economy'   },
  scholar:   { id:'scholar',   icon:'🎓', name:'Học Giả',       color:'#38bdf8', desc:'Đến với trung tâm văn hóa phát triển.',    popScale: 0.02, trigger:'culture'   },
  warrior:   { id:'warrior',   icon:'⚔️', name:'Chiến Binh',   color:'#fb923c', desc:'Tìm vinh quang nơi chiến trường.',         popScale: 0.03, trigger:'war_glory' },
  noble:     { id:'noble',     icon:'👑', name:'Quý Tộc',       color:'#4ade80', desc:'Đi theo chính trị và ổn định.',            popScale: 0.01, trigger:'stability' },
};

// ─── MIGRATION EVENT POOL ─────────────────────────────────────

const MIGRATION_EVENTS = [
  { id:'great_exodus',      icon:'🌊', name:'Đại Di Dân',         type:'refugee',  desc:'Chiến tranh liên miên khiến hàng chục vạn người bỏ đất tổ ra đi.',    magnitude: 'massive',  minTrigger: 'war' },
  { id:'scholar_pilgrimage',icon:'📚', name:'Học Giả Hành Hương', type:'scholar',  desc:'Học cung mới hoàn thành thu hút học giả từ khắp nơi đổ về.',           magnitude: 'large',    minTrigger: 'wonder_culture' },
  { id:'merchant_caravan',  icon:'🛤️', name:'Thương Đoàn Lớn',  type:'merchant', desc:'Tuyến thương mại mới mở ra luồng thương nhân khổng lồ.',                magnitude: 'medium',   minTrigger: 'trade_route' },
  { id:'spirit_seekers',    icon:'⛰️', name:'Linh Khí Hành Hương',type:'pilgrim', desc:'Linh mạch nổi danh khắp thiên hạ thu hút tu sĩ đến luyện công.',       magnitude: 'large',    minTrigger: 'spirit_event' },
  { id:'war_veterans',      icon:'🗡️', name:'Cựu Chiến Binh',   type:'warrior',  desc:'Chiến tranh kết thúc, chiến binh lang thang tìm chiến trường mới.',      magnitude: 'medium',   minTrigger: 'war_end' },
  { id:'famine_migration',  icon:'🌵', name:'Đói Kém Di Cư',      type:'refugee',  desc:'Linh khí cạn kiệt khiến người dân bỏ xứ sở hoang hóa mà đi.',          magnitude: 'large',    minTrigger: 'low_resources' },
  { id:'cultural_pull',     icon:'🎭', name:'Văn Hóa Thu Hút',    type:'scholar',  desc:'Nền văn hóa rực rỡ lan xa, thu hút người tài từ các đại lục khác.',     magnitude: 'medium',   minTrigger: 'high_culture' },
  { id:'noble_diaspora',    icon:'🏯', name:'Quý Tộc Lưu Vong',  type:'noble',    desc:'Biến cố chính trị khiến cả gia tộc quý tộc phải rời bỏ cố quốc.',      magnitude: 'small',    minTrigger: 'political_crisis' },
  { id:'golden_migration',  icon:'☄️', name:'Hoàng Kim Di Dân',   type:'merchant', desc:'Của cải trời cho tại một đại lục khiến người từ khắp nơi kéo đến.',    magnitude: 'massive',  minTrigger: 'prosperity' },
  { id:'dark_exodus',       icon:'☠️', name:'Hắc Ám Di Dân',      type:'warrior',  desc:'Tà phái nổi dậy, những kẻ không tà đạo bỏ chạy sang đất lành.',        magnitude: 'large',    minTrigger: 'dark_event' },
];

// ─── STATE ────────────────────────────────────────────────────

let meState = {
  waves:       [],     // active migration waves: { id, typeId, from, to, year, size, remaining, progress }
  history:     [],     // completed waves
  log:         [],     // event log
  stats:       {},     // { continentId: { in: N, out: N, net: N, byType: {} } }
  totalMigrants:  0,
  tickCount:   0,
  initialized: false,
};

// ─── HELPERS ──────────────────────────────────────────────────

function _meRandId() { return 'mw_' + Date.now() + '_' + Math.floor(Math.random() * 9999); }

function _meLog(msg, fromId, toId) {
  const entry = { tick: meState.tickCount, year: window.year || 0, msg, from: fromId, to: toId };
  meState.log.unshift(entry);
  if (meState.log.length > 400) meState.log.pop();
  if (typeof addLog === 'function') addLog(`[Di Dân] ${msg}`);
}

function _meGetContinent(id) {
  if (typeof ceState !== 'undefined' && ceState.continents) return ceState.continents.find(c => c.id === id);
  return null;
}

function _meGetAllContinents() {
  if (typeof ceState !== 'undefined' && ceState.continents) return ceState.continents;
  return [];
}

// ─── PULL FACTOR CALCULATION ──────────────────────────────────
// Higher = more attractive destination

function _mePullFactor(contId) {
  const c = _meGetContinent(contId);
  if (!c) return 0;
  let score = 0;
  // Stability: base attraction
  score += (c.stability || 50) * 0.5;
  // Resources
  const totalRes = Object.values(c.resources || {}).reduce((a,v) => a + v, 0);
  score += Math.min(totalRes * 0.02, 40);
  // Cultivation bonus
  score += ((c.bonuses?.cultivationMult || 1) - 1) * 30;
  // Economy bonus
  score += ((c.bonuses?.econMult || 1) - 1) * 25;
  // Culture bonus
  score += ((c.bonuses?.cultureMult || 1) - 1) * 20;
  // Wonder built
  if (c.wonder?.built) score += 25;
  // Active war (repels peaceful migrants, attracts warriors)
  const atWar = typeof ceState !== 'undefined' && (ceState.wars || []).find(w =>
    w.phase === 'ongoing' && (w.attacker === contId || w.defender === contId));
  if (atWar) score -= 30;
  // Alliance bonus (allied continents are safer)
  const allies = typeof ceState !== 'undefined' ? (ceState.diplo || []).filter(d =>
    d.typeId === 'alliance' && (d.a === contId || d.b === contId)).length : 0;
  score += allies * 10;
  return Math.max(0, score);
}

// ─── PUSH FACTOR CALCULATION ──────────────────────────────────
// Higher = more people want to leave

function _mePushFactor(contId) {
  const c = _meGetContinent(contId);
  if (!c) return 0;
  let score = 0;
  // Instability
  score += Math.max(0, 60 - (c.stability || 50)) * 0.8;
  // At war (big push)
  const atWar = typeof ceState !== 'undefined' && (ceState.wars || []).find(w =>
    w.phase === 'ongoing' && (w.attacker === contId || w.defender === contId));
  if (atWar) score += 40;
  // Low resources
  const totalRes = Object.values(c.resources || {}).reduce((a,v) => a + v, 0);
  if (totalRes < 200) score += 30;
  // Negative economic bonus
  score += Math.max(0, (1 - (c.bonuses?.econMult || 1)) * 25);
  return Math.max(0, score);
}

// ─── CALCULATE MIGRATION SIZE ─────────────────────────────────

function _meMigrationSize(fromId, toId, typeId) {
  const cArr = (typeof countries !== 'undefined' && Array.isArray(countries)) ? countries : [];
  const from = _meGetContinent(fromId);
  if (!from) return 0;
  const totalPop = (from.countryIds || []).reduce((s,cid) => {
    const c = cArr.find(x => (x.name||x.id) === cid);
    return s + (c?.population || 0);
  }, 0);
  if (totalPop < 10) return 0;
  const mtype  = MIGRATION_TYPES[typeId];
  const push   = _mePushFactor(fromId);
  const pull   = _mePullFactor(toId);
  const base   = totalPop * (mtype?.popScale || 0.03);
  const factor = Math.min(3, (push + pull) / 80);
  return Math.max(10, Math.floor(base * factor));
}

// ─── CREATE WAVE ──────────────────────────────────────────────

function meCreateWave(typeId, fromId, toId, sizeOverride, eventName) {
  const mtype = MIGRATION_TYPES[typeId];
  if (!mtype) return null;
  const from = _meGetContinent(fromId);
  const to   = _meGetContinent(toId);
  if (!from || !to || fromId === toId) return null;

  const size = sizeOverride || _meMigrationSize(fromId, toId, typeId);
  if (size < 5) return null;

  const wave = {
    id:        _meRandId(),
    typeId,
    from:      fromId,
    to:        toId,
    year:      window.year || 0,
    tick:      meState.tickCount,
    size,
    remaining: size,
    progress:  0,
    duration:  8 + Math.floor(Math.random() * 12), // ticks to complete
    ticksLeft: 8 + Math.floor(Math.random() * 12),
    eventName: eventName || null,
    completed: false,
  };
  meState.waves.push(wave);
  const label = eventName ? `📣 ${eventName}: ` : '';
  _meLog(`${mtype.icon} ${label}${from.icon}${from.name} → ${to.icon}${to.name}: ${size.toLocaleString()} ${mtype.name} bắt đầu di cư`, fromId, toId);
  return wave;
}

// ─── APPLY WAVE EFFECTS ───────────────────────────────────────

function _meApplyWaveEffects(wave) {
  const cArr = (typeof countries !== 'undefined' && Array.isArray(countries)) ? countries : [];
  const from = _meGetContinent(wave.from);
  const to   = _meGetContinent(wave.to);
  if (!from || !to) return;

  const mtype    = MIGRATION_TYPES[wave.typeId];
  const migrated = wave.size;

  // Destination gains: resources & stability
  const resGain = Math.floor(migrated * 0.3);
  to.resources.spiritStones = (to.resources.spiritStones||0) + resGain;
  to.stability = Math.min(100, (to.stability||50) + Math.floor(migrated * 0.001));

  // Source loses slightly
  from.stability = Math.max(5, (from.stability||50) - Math.floor(migrated * 0.0005));

  // Apply to individual countries
  const toPop   = Math.floor(migrated * 0.1);
  // Give population to first country in destination continent
  if (to.countryIds?.length) {
    const toCountry = cArr.find(x => (x.name||x.id) === to.countryIds[0]);
    if (toCountry) toCountry.population = (toCountry.population||0) + toPop;
  }
  // Take from source
  if (from.countryIds?.length) {
    const fromCountry = cArr.find(x => (x.name||x.id) === from.countryIds[0]);
    if (fromCountry) fromCountry.population = Math.max(0, (fromCountry.population||0) - toPop);
  }

  // Culture spread
  if (wave.typeId === 'scholar' || wave.typeId === 'noble') {
    to.cultureInfluence = (to.cultureInfluence||0) + migrated * 0.05;
  }

  // Track stats
  if (!meState.stats[wave.from]) meState.stats[wave.from] = { in:0, out:0, net:0, byType:{} };
  if (!meState.stats[wave.to])   meState.stats[wave.to]   = { in:0, out:0, net:0, byType:{} };
  meState.stats[wave.from].out += migrated;
  meState.stats[wave.from].net -= migrated;
  meState.stats[wave.to].in    += migrated;
  meState.stats[wave.to].net   += migrated;
  meState.stats[wave.from].byType[wave.typeId] = (meState.stats[wave.from].byType[wave.typeId]||0) + migrated;
  meState.stats[wave.to].byType[wave.typeId]   = (meState.stats[wave.to].byType[wave.typeId]||0)   + migrated;
  meState.totalMigrants += migrated;

  const mtype2 = MIGRATION_TYPES[wave.typeId];
  _meLog(`✅ ${mtype2?.icon} ${from.icon}${from.name} → ${to.icon}${to.name} hoàn tất: ${migrated.toLocaleString()} người định cư mới`, wave.from, wave.to);
}

// ─── AUTO MIGRATION LOGIC ─────────────────────────────────────

function _meAutoMigrate() {
  const conts = _meGetAllContinents();
  if (conts.length < 2) return;

  // Find high-push continents
  const sorted = [...conts].map(c => ({ c, push: _mePushFactor(c.id), pull: _mePullFactor(c.id) }))
    .sort((a,b) => b.push - a.push);

  // Top 2 push → top 2 pull
  const pushers = sorted.filter(x => x.push > 15).slice(0, 2);
  const pullers = sorted.filter(x => x.pull > 30).sort((a,b) => b.pull - a.pull).slice(0, 2);

  pushers.forEach(({ c: from }) => {
    pullers.forEach(({ c: to }) => {
      if (from.id === to.id) return;
      // Already have a wave from→to?
      if (meState.waves.find(w => !w.completed && w.from === from.id && w.to === to.id)) return;
      // Pick most appropriate type based on conditions
      const atWar = typeof ceState !== 'undefined' && (ceState.wars||[]).find(w =>
        w.phase==='ongoing' && (w.attacker===from.id||w.defender===from.id));
      const typeId = atWar ? 'refugee' : (to.bonuses?.cultivationMult||1) > 1.3 ? 'pilgrim' : (to.bonuses?.econMult||1) > 1.3 ? 'merchant' : 'pilgrim';
      meCreateWave(typeId, from.id, to.id);
    });
  });

  // Random small scholar/merchant waves between random pairs (low probability)
  if (Math.random() < 0.15 && conts.length >= 2) {
    const from = conts[Math.floor(Math.random() * conts.length)];
    const to   = conts[Math.floor(Math.random() * conts.length)];
    if (from.id !== to.id) {
      const typeId = Math.random() < 0.5 ? 'scholar' : 'merchant';
      meCreateWave(typeId, from.id, to.id, Math.floor(50 + Math.random() * 150));
    }
  }
}

function _meCheckSpecialEvents() {
  const conts = _meGetAllContinents();

  // Check if any continent just had a big event
  conts.forEach(c => {
    // War causes refugee wave
    const war = typeof ceState !== 'undefined' && (ceState.wars||[]).find(w =>
      w.phase==='ongoing' && (w.attacker===c.id||w.defender===c.id));
    if (war && Math.random() < 0.4) {
      const safest = [...conts].filter(x => x.id !== c.id)
        .sort((a,b) => _mePullFactor(b.id) - _mePullFactor(a.id))[0];
      if (safest && !meState.waves.find(w => !w.completed && w.from===c.id && w.typeId==='refugee')) {
        const size = Math.floor(100 + Math.random() * 500);
        meCreateWave('refugee', c.id, safest.id, size, 'Đại Di Dân Chiến Tranh');
      }
    }

    // Wonder built attracts scholars
    if (c.wonder?.built && (c.stability||50) > 60 && Math.random() < 0.2) {
      const typeId = (c.bonuses?.cultureMult||1) > 1.5 ? 'scholar' : 'pilgrim';
      const from = [...conts].filter(x=>x.id!==c.id)[Math.floor(Math.random()*(conts.length-1))];
      if (from && !meState.waves.find(w => !w.completed && w.to===c.id && w.typeId===typeId)) {
        meCreateWave(typeId, from.id, c.id, Math.floor(30+Math.random()*100), `${c.wonder.icon} Kỳ Quan Thu Hút`);
      }
    }

    // Low stability + no war = noble diaspora
    if ((c.stability||50) < 30 && !war && Math.random() < 0.3) {
      const dest = [...conts].filter(x=>x.id!==c.id).sort((a,b)=>(b.stability||50)-(a.stability||50))[0];
      if (dest) meCreateWave('noble', c.id, dest.id, Math.floor(20+Math.random()*80), 'Quý Tộc Lưu Vong');
    }
  });
}

// ─── MAIN TICK ────────────────────────────────────────────────

function meTick() {
  if (!meState.initialized) meState.initialized = true;
  meState.tickCount++;

  // Advance active waves
  meState.waves.filter(w => !w.completed).forEach(w => {
    w.ticksLeft--;
    w.progress = Math.round((1 - w.ticksLeft / w.duration) * 100);
    if (w.ticksLeft <= 0) {
      w.completed = true;
      _meApplyWaveEffects(w);
      meState.history.unshift(w);
      if (meState.history.length > 100) meState.history.pop();
    }
  });

  // Remove completed from active list
  meState.waves = meState.waves.filter(w => !w.completed);

  // Auto-generate new migrations every 15 ticks
  if (meState.tickCount % 15 === 0) {
    _meAutoMigrate();
  }

  // Check special events every 25 ticks
  if (meState.tickCount % 25 === 0) {
    _meCheckSpecialEvents();
  }
}

// ─── SAVE / LOAD ──────────────────────────────────────────────

(function mePatchSaveLoad() {
  function tryPatch() {
    if (typeof window.save === 'function' && !window._meSavePatched) {
      window._meSavePatched = true;
      const _os = window.save;
      window.save = function() {
        _os.apply(this, arguments);
        try { localStorage.setItem('cgv6_meState', JSON.stringify({
          history:       meState.history.slice(0,60),
          log:           meState.log.slice(0,150),
          stats:         meState.stats,
          totalMigrants: meState.totalMigrants,
          tickCount:     meState.tickCount,
        })); } catch(e) {}
      };
    }
    if (typeof window.load === 'function' && !window._meLoadPatched) {
      window._meLoadPatched = true;
      const _ol = window.load;
      window.load = function() {
        _ol.apply(this, arguments);
        try {
          const raw = localStorage.getItem('cgv6_meState');
          if (raw) {
            const d = JSON.parse(raw);
            meState.history       = d.history       || [];
            meState.log           = d.log           || [];
            meState.stats         = d.stats         || {};
            meState.totalMigrants = d.totalMigrants || 0;
            meState.tickCount     = d.tickCount     || 0;
          }
        } catch(e) {}
      };
    }
  }
  tryPatch();
  document.addEventListener('DOMContentLoaded', () => setTimeout(tryPatch, 1500));
})();

// ─── RENDER ───────────────────────────────────────────────────

let _meTab = 'waves';
function meSwitchTab(t) { _meTab = t; meRenderPanel(); }

function meRenderPanel() {
  const el = document.getElementById('panel-migration');
  if (!el) return;

  const activeWaves = meState.waves.filter(w => !w.completed);
  const tabs = [
    { id:'waves',    label:`🌊 Làn Sóng Di Dân (${activeWaves.length})` },
    { id:'flow',     label:'🗺️ Luồng Di Dân' },
    { id:'history',  label:`📜 Lịch Sử (${meState.history.length})` },
    { id:'stats',    label:'📊 Thống Kê' },
    { id:'log',      label:'📋 Nhật Ký' },
  ];

  el.innerHTML = `<div style="min-height:100%;background:var(--bg-primary);">
    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,rgba(96,165,250,0.1),rgba(74,222,128,0.05));border-bottom:1px solid var(--border);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
      <div>
        <div style="font-family:var(--font-heading);font-size:22px;color:var(--blue);text-shadow:0 0 20px rgba(96,165,250,0.4);">🚶 Di Dân Hệ Thống V1</div>
        <div style="font-size:11px;color:var(--white-dim);margin-top:2px;">6 Loại Di Dân · Push/Pull Factors · Sóng Di Dân · Thần Can Thiệp</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:8px 14px;text-align:center;">
          <div style="font-size:10px;color:var(--white-dim);">Tổng Di Dân</div>
          <div style="font-size:18px;font-weight:700;color:var(--blue);">${meState.totalMigrants.toLocaleString()}</div>
        </div>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:8px 14px;text-align:center;">
          <div style="font-size:10px;color:var(--white-dim);">Đang Di Chuyển</div>
          <div style="font-size:18px;font-weight:700;color:var(--orange);">${activeWaves.length}</div>
        </div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        <button onclick="meGodForceMigrate()" style="padding:7px 12px;background:rgba(96,165,250,0.1);border:1px solid rgba(96,165,250,0.35);border-radius:7px;color:var(--blue);font-size:12px;cursor:pointer;font-family:var(--font-cjk),serif;">🌊 Đại Di Dân (200đ)</button>
        <button onclick="meGodAttract()" style="padding:7px 12px;background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.35);border-radius:7px;color:var(--jade);font-size:12px;cursor:pointer;font-family:var(--font-cjk),serif;">🧲 Thu Hút (150đ)</button>
        <button onclick="meGodBlock()" style="padding:7px 12px;background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.35);border-radius:7px;color:var(--red);font-size:12px;cursor:pointer;font-family:var(--font-cjk),serif;">🚫 Phong Tỏa (100đ)</button>
      </div>
    </div>

    <!-- TABS -->
    <div style="display:flex;gap:2px;padding:10px 16px 0;border-bottom:1px solid var(--border);overflow-x:auto;">
      ${tabs.map(t => {
        const active = _meTab === t.id;
        return `<button onclick="meSwitchTab('${t.id}')" style="padding:7px 13px;white-space:nowrap;border-radius:7px 7px 0 0;border:1px solid ${active?'var(--blue)':'transparent'};border-bottom:none;background:${active?'linear-gradient(135deg,rgba(96,165,250,0.12),rgba(96,165,250,0.04))':'transparent'};color:${active?'var(--blue)':'var(--white-dim)'};font-size:12px;cursor:pointer;font-family:var(--font-cjk),serif;margin-bottom:-1px;">${t.label}</button>`;
      }).join('')}
    </div>

    <div style="padding:16px;">
      ${_meTab==='waves'   ? _meRenderWaves()   : ''}
      ${_meTab==='flow'    ? _meRenderFlow()    : ''}
      ${_meTab==='history' ? _meRenderHistory() : ''}
      ${_meTab==='stats'   ? _meRenderStats()   : ''}
      ${_meTab==='log'     ? _meRenderLog()     : ''}
    </div>
  </div>`;
}

// ─── WAVES TAB ────────────────────────────────────────────────

function _meRenderWaves() {
  const active = meState.waves.filter(w => !w.completed);
  const conts  = _meGetAllContinents();

  return `<div>
    <!-- Manual wave creator -->
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:16px;">
      <div style="font-family:var(--font-title);font-size:13px;color:var(--blue);margin-bottom:12px;letter-spacing:1px;">✍️ TẠO SÓNG DI DÂN</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;margin-bottom:8px;">
        <div>
          <div style="font-size:11px;color:var(--white-dim);margin-bottom:3px;">Loại Di Dân</div>
          <select id="me-type" style="width:100%;padding:7px 10px;border-radius:7px;background:var(--bg-secondary);color:var(--white-main);border:1px solid var(--border);font-size:12px;cursor:pointer;">
            ${Object.entries(MIGRATION_TYPES).map(([k,v])=>`<option value="${k}">${v.icon} ${v.name}</option>`).join('')}
          </select>
        </div>
        <div>
          <div style="font-size:11px;color:var(--white-dim);margin-bottom:3px;">Từ Đại Lục</div>
          <select id="me-from" style="width:100%;padding:7px 10px;border-radius:7px;background:var(--bg-secondary);color:var(--white-main);border:1px solid var(--border);font-size:12px;cursor:pointer;">
            ${conts.map(c=>`<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
          </select>
        </div>
        <div>
          <div style="font-size:11px;color:var(--white-dim);margin-bottom:3px;">Đến Đại Lục</div>
          <select id="me-to" style="width:100%;padding:7px 10px;border-radius:7px;background:var(--bg-secondary);color:var(--white-main);border:1px solid var(--border);font-size:12px;cursor:pointer;">
            ${conts.map(c=>`<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
          </select>
        </div>
        <div>
          <div style="font-size:11px;color:var(--white-dim);margin-bottom:3px;">Quy Mô (0=tự động)</div>
          <input id="me-size" type="number" min="0" value="0" style="width:100%;padding:7px 10px;border-radius:7px;background:var(--bg-secondary);color:var(--white-main);border:1px solid var(--border);font-size:12px;box-sizing:border-box;">
        </div>
      </div>
      <button onclick="meActionCreate()" style="padding:9px 20px;border-radius:7px;border:1px solid rgba(96,165,250,0.45);background:rgba(96,165,250,0.12);color:var(--blue);font-size:12px;cursor:pointer;font-family:var(--font-cjk),serif;font-weight:700;">🌊 Phát Động Sóng Di Dân</button>
      <span id="me-create-msg" style="font-size:11px;margin-left:10px;"></span>
    </div>

    <!-- Active waves -->
    <div style="font-family:var(--font-title);font-size:13px;color:var(--blue);margin-bottom:10px;letter-spacing:1px;">🌊 ĐANG DI CHUYỂN (${active.length})</div>
    ${active.length ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px;">
      ${active.map(w => {
        const from = _meGetContinent(w.from);
        const to   = _meGetContinent(w.to);
        const mtype = MIGRATION_TYPES[w.typeId] || {};
        return `<div style="background:var(--bg-card);border:1px solid ${mtype.color||'var(--border)'}33;border-radius:10px;padding:13px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
            <div>
              <div style="font-size:16px;margin-bottom:3px;">${mtype.icon} <span style="font-family:var(--font-title);font-size:13px;color:${mtype.color};">${mtype.name}</span></div>
              <div style="font-size:12px;color:var(--white-main);">${from?.icon} ${from?.name} <span style="color:var(--white-dim);">→</span> ${to?.icon} ${to?.name}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:15px;font-weight:700;color:${mtype.color};">${w.size.toLocaleString()}</div>
              <div style="font-size:10px;color:var(--white-dim);">người</div>
            </div>
          </div>
          ${w.eventName ? `<div style="font-size:10px;color:var(--gold);margin-bottom:6px;padding:3px 8px;background:rgba(250,204,21,0.08);border-radius:4px;border:1px solid rgba(250,204,21,0.2);">📣 ${w.eventName}</div>` : ''}
          <div style="height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;margin-bottom:5px;">
            <div style="height:100%;width:${w.progress}%;background:linear-gradient(90deg,${mtype.color},${mtype.color}88);border-radius:3px;"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--white-dim);">
            <span>${w.progress}% hoàn thành</span>
            <span>Còn ${w.ticksLeft} tick</span>
          </div>
        </div>`;
      }).join('')}
    </div>` : `<div style="text-align:center;padding:40px;color:var(--white-dim);font-style:italic;">Không có làn sóng di dân nào đang diễn ra.</div>`}

    <!-- Type reference -->
    <div style="margin-top:16px;">
      <div style="font-family:var(--font-title);font-size:12px;color:var(--white-dim);margin-bottom:8px;letter-spacing:1px;">📋 CÁC LOẠI DI DÂN</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px;">
        ${Object.values(MIGRATION_TYPES).map(m => `<div style="background:var(--bg-card);border:1px solid ${m.color}22;border-radius:8px;padding:9px 11px;display:flex;gap:8px;align-items:center;">
          <span style="font-size:18px;">${m.icon}</span>
          <div>
            <div style="font-size:12px;font-weight:600;color:${m.color};">${m.name}</div>
            <div style="font-size:10px;color:var(--white-dim);">${m.desc}</div>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

// ─── FLOW TAB ─────────────────────────────────────────────────

function _meRenderFlow() {
  const conts = _meGetAllContinents();
  if (!conts.length) return `<div style="text-align:center;padding:50px;color:var(--white-dim);font-style:italic;">Chưa có dữ liệu đại lục.</div>`;

  // Build push/pull table
  const scores = conts.map(c => ({
    c,
    push: Math.round(_mePushFactor(c.id)),
    pull: Math.round(_mePullFactor(c.id)),
  }));

  return `<div>
    <div style="font-family:var(--font-title);font-size:13px;color:var(--blue);margin-bottom:14px;letter-spacing:1px;">⚡ CHỈ SỐ ĐẨY / KÉO HIỆN TẠI</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;margin-bottom:20px;">
      ${scores.map(({c, push, pull}) => {
        const netFlow = pull - push;
        const netColor = netFlow > 0 ? 'var(--jade)' : netFlow < 0 ? 'var(--red)' : 'var(--white-dim)';
        const maxBar = 100;
        return `<div style="background:var(--bg-card);border:1px solid ${c.color}33;border-radius:10px;padding:13px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
            <span style="font-size:22px;">${c.icon}</span>
            <div style="flex:1;">
              <div style="font-family:var(--font-title);font-size:12px;color:${c.color};">${c.name}</div>
              <div style="font-size:10px;color:var(--white-dim);">${c.cultureTrait||''}${c.wonder?.built?' · 🏛️ Kỳ Quan':''}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:14px;font-weight:700;color:${netColor};">${netFlow>0?'+':''}${netFlow}</div>
              <div style="font-size:10px;color:var(--white-dim);">Lực Kéo Net</div>
            </div>
          </div>
          <!-- Push bar -->
          <div style="margin-bottom:6px;">
            <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--red);margin-bottom:2px;"><span>🔴 Lực Đẩy (Push)</span><span>${push}</span></div>
            <div style="height:5px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;">
              <div style="height:100%;width:${Math.min(100,push)}%;background:linear-gradient(90deg,#f87171,rgba(248,113,113,0.4));border-radius:3px;"></div>
            </div>
          </div>
          <!-- Pull bar -->
          <div style="margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--jade);margin-bottom:2px;"><span>🟢 Lực Kéo (Pull)</span><span>${pull}</span></div>
            <div style="height:5px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;">
              <div style="height:100%;width:${Math.min(100,pull)}%;background:linear-gradient(90deg,#4ade80,rgba(74,222,128,0.4));border-radius:3px;"></div>
            </div>
          </div>
          <!-- Factors -->
          <div style="display:flex;flex-wrap:wrap;gap:3px;">
            ${(c.stability||50) < 40 ? `<span style="font-size:10px;padding:1px 6px;border-radius:999px;background:rgba(248,113,113,0.12);color:var(--red);">⚠️ Bất Ổn</span>` : ''}
            ${(() => { const atWar = typeof ceState !== 'undefined' && (ceState.wars||[]).find(w => w.phase==='ongoing'&&(w.attacker===c.id||w.defender===c.id)); return atWar ? `<span style="font-size:10px;padding:1px 6px;border-radius:999px;background:rgba(248,113,113,0.12);color:var(--red);">⚔️ Chiến Tranh</span>` : ''; })()}
            ${c.wonder?.built ? `<span style="font-size:10px;padding:1px 6px;border-radius:999px;background:rgba(250,204,21,0.1);color:var(--gold);">🏛️ Kỳ Quan</span>` : ''}
            ${(c.bonuses?.cultivationMult||1) > 1.3 ? `<span style="font-size:10px;padding:1px 6px;border-radius:999px;background:rgba(192,132,252,0.1);color:var(--purple);">🧘 Linh Khí</span>` : ''}
            ${(c.bonuses?.econMult||1) > 1.3 ? `<span style="font-size:10px;padding:1px 6px;border-radius:999px;background:rgba(250,204,21,0.1);color:var(--gold);">💰 Thịnh Vượng</span>` : ''}
          </div>
        </div>`;
      }).join('')}
    </div>

    <!-- Active flow arrows visualization -->
    <div style="font-family:var(--font-title);font-size:13px;color:var(--blue);margin-bottom:10px;letter-spacing:1px;">🌊 LUỒNG DI DÂN ĐANG DIỄN RA</div>
    ${meState.waves.filter(w=>!w.completed).length ? `<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px;overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        <thead>
          <tr style="border-bottom:1px solid var(--border);">
            <th style="text-align:left;color:var(--white-dim);padding:5px 10px;">Loại</th>
            <th style="text-align:left;color:var(--white-dim);padding:5px 10px;">Từ</th>
            <th style="text-align:center;color:var(--white-dim);padding:5px 10px;">→</th>
            <th style="text-align:left;color:var(--white-dim);padding:5px 10px;">Đến</th>
            <th style="text-align:right;color:var(--white-dim);padding:5px 10px;">Quy Mô</th>
            <th style="text-align:right;color:var(--white-dim);padding:5px 10px;">Tiến Độ</th>
          </tr>
        </thead>
        <tbody>
          ${meState.waves.filter(w=>!w.completed).map(w => {
            const from  = _meGetContinent(w.from);
            const to    = _meGetContinent(w.to);
            const mtype = MIGRATION_TYPES[w.typeId] || {};
            return `<tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
              <td style="padding:6px 10px;color:${mtype.color};">${mtype.icon} ${mtype.name}</td>
              <td style="padding:6px 10px;color:var(--white-main);">${from?.icon} ${from?.name}</td>
              <td style="padding:6px 10px;text-align:center;color:var(--white-dim);">→</td>
              <td style="padding:6px 10px;color:var(--white-main);">${to?.icon} ${to?.name}</td>
              <td style="padding:6px 10px;text-align:right;color:${mtype.color};font-weight:700;">${w.size.toLocaleString()}</td>
              <td style="padding:6px 10px;text-align:right;color:var(--white-dim);">${w.progress}%</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>` : `<div style="text-align:center;padding:30px;color:var(--white-dim);font-style:italic;">Không có luồng nào đang diễn ra.</div>`}
  </div>`;
}

// ─── HISTORY TAB ──────────────────────────────────────────────

function _meRenderHistory() {
  if (!meState.history.length)
    return `<div style="text-align:center;padding:50px;color:var(--white-dim);font-style:italic;">Chưa có làn sóng di dân nào hoàn thành.</div>`;

  return `<div>
    <div style="font-family:var(--font-title);font-size:13px;color:var(--blue);margin-bottom:12px;letter-spacing:1px;">📜 LỊCH SỬ DI DÂN (${meState.history.length})</div>
    <div style="display:flex;flex-direction:column;gap:6px;">
      ${meState.history.slice(0,40).map(w => {
        const from  = _meGetContinent(w.from);
        const to    = _meGetContinent(w.to);
        const mtype = MIGRATION_TYPES[w.typeId] || {};
        return `<div style="display:flex;gap:10px;background:var(--bg-card);border:1px solid ${mtype.color||'var(--border)'}22;border-radius:8px;padding:10px 13px;align-items:center;">
          <span style="font-size:18px;flex-shrink:0;">${mtype.icon}</span>
          <div style="flex:1;min-width:0;">
            <div style="font-size:11px;color:var(--white-main);">${from?.icon} ${from?.name} <span style="color:var(--white-dim);">→</span> ${to?.icon} ${to?.name}</div>
            ${w.eventName ? `<div style="font-size:10px;color:var(--gold);">📣 ${w.eventName}</div>` : ''}
            <div style="font-size:10px;color:var(--white-dim);">Năm ${w.year || w.tick}</div>
          </div>
          <div style="text-align:right;flex-shrink:0;">
            <div style="font-size:14px;font-weight:700;color:${mtype.color};">${w.size.toLocaleString()}</div>
            <div style="font-size:10px;color:var(--white-dim);">${mtype.name}</div>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

// ─── STATS TAB ────────────────────────────────────────────────

function _meRenderStats() {
  const conts = _meGetAllContinents();
  const sorted = [...conts].map(c => ({
    c,
    s: meState.stats[c.id] || { in:0, out:0, net:0, byType:{} },
  })).sort((a,b) => b.s.net - a.s.net);

  return `<div>
    <div style="font-family:var(--font-title);font-size:13px;color:var(--blue);margin-bottom:14px;letter-spacing:1px;">📊 THỐNG KÊ DI DÂN THEO ĐẠI LỤC</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px;">
      ${sorted.map(({c, s}) => {
        const netColor = s.net > 0 ? 'var(--jade)' : s.net < 0 ? 'var(--red)' : 'var(--white-dim)';
        return `<div style="background:var(--bg-card);border:1px solid ${c.color}33;border-radius:10px;padding:13px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <span style="font-size:22px;">${c.icon}</span>
            <div style="flex:1;font-family:var(--font-title);font-size:13px;color:${c.color};">${c.name}</div>
            <div style="text-align:right;">
              <div style="font-size:16px;font-weight:700;color:${netColor};">${s.net>0?'+':''}${s.net.toLocaleString()}</div>
              <div style="font-size:10px;color:var(--white-dim);">Cân Bằng</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;">
            <div style="background:var(--bg-secondary);border-radius:6px;padding:6px;text-align:center;">
              <div style="font-size:11px;color:var(--jade);">📥 Đến</div>
              <div style="font-size:13px;font-weight:700;color:var(--jade);">+${s.in.toLocaleString()}</div>
            </div>
            <div style="background:var(--bg-secondary);border-radius:6px;padding:6px;text-align:center;">
              <div style="font-size:11px;color:var(--red);">📤 Đi</div>
              <div style="font-size:13px;font-weight:700;color:var(--red);">-${s.out.toLocaleString()}</div>
            </div>
          </div>
          ${Object.keys(s.byType).length ? `<div style="display:flex;flex-wrap:wrap;gap:4px;">
            ${Object.entries(s.byType).map(([tid,cnt]) => {
              const mt = MIGRATION_TYPES[tid] || {};
              return `<span style="font-size:10px;padding:2px 7px;border-radius:999px;background:${mt.color||'#fff'}18;color:${mt.color||'var(--white-dim)'};border:1px solid ${mt.color||'var(--border)'}33;">${mt.icon} ${cnt.toLocaleString()}</span>`;
            }).join('')}
          </div>` : ''}
        </div>`;
      }).join('')}
    </div>

    <!-- Global total -->
    <div style="background:var(--bg-card);border:1px solid rgba(96,165,250,0.25);border-radius:10px;padding:14px;text-align:center;">
      <div style="font-size:12px;color:var(--white-dim);margin-bottom:4px;">Tổng Lịch Sử Di Dân</div>
      <div style="font-family:var(--font-heading);font-size:28px;color:var(--blue);">${meState.totalMigrants.toLocaleString()}</div>
      <div style="font-size:11px;color:var(--white-dim);margin-top:2px;">người đã di chuyển từ trước đến nay</div>
    </div>
  </div>`;
}

// ─── LOG TAB ──────────────────────────────────────────────────

function _meRenderLog() {
  if (!meState.log.length)
    return `<div style="text-align:center;padding:50px;color:var(--white-dim);font-style:italic;">Nhật ký di dân trống.</div>`;

  const searchVal = (document.getElementById('me-log-search')?.value || '').toLowerCase();
  const logs = searchVal ? meState.log.filter(e => e.msg.toLowerCase().includes(searchVal)) : meState.log;

  return `<div>
    <div style="display:flex;gap:8px;margin-bottom:12px;">
      <input id="me-log-search" type="text" placeholder="🔍 Tìm trong nhật ký..." oninput="meRenderPanel()"
        style="flex:1;background:var(--bg-card);border:1px solid var(--border);border-radius:7px;color:var(--white-main);font-family:var(--font-cjk),serif;font-size:12px;padding:7px 12px;outline:none;">
      <button onclick="document.getElementById('me-log-search').value='';meRenderPanel();" style="padding:7px 12px;border-radius:7px;border:1px solid var(--border);background:transparent;color:var(--white-dim);font-size:12px;cursor:pointer;">✕</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;">
      ${logs.slice(0,80).map(e => {
        const from = _meGetContinent(e.from);
        const to   = _meGetContinent(e.to);
        return `<div style="display:flex;gap:8px;padding:8px 12px;background:var(--bg-card);border-left:3px solid ${from?.color||'var(--blue)'};border-radius:6px;align-items:flex-start;">
          <span style="font-size:14px;flex-shrink:0;">${from?.icon||'🚶'}</span>
          <div style="flex:1;min-width:0;">
            <div style="font-size:10px;color:var(--white-dim);margin-bottom:2px;">Năm ${e.year||e.tick}</div>
            <div style="font-size:12px;color:var(--white-main);">${e.msg}</div>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

// ─── GOD ACTIONS ──────────────────────────────────────────────

window.meGodForceMigrate = function() {
  if ((window.heavenPoints||0) < 200) { alert('Cần 200 Thiên Đạo Điểm!'); return; }
  window.heavenPoints -= 200;
  const conts = _meGetAllContinents();
  if (conts.length < 2) { alert('Cần ít nhất 2 đại lục!'); return; }
  // Biggest push → biggest pull
  const sorted = [...conts].map(c=>({c,push:_mePushFactor(c.id),pull:_mePullFactor(c.id)}));
  const from   = sorted.sort((a,b)=>b.push-a.push)[0]?.c;
  const to     = sorted.sort((a,b)=>b.pull-a.pull).filter(x=>x.c.id!==from?.id)[0]?.c;
  if (from && to) {
    const size = Math.floor(500 + Math.random() * 1000);
    ['refugee','pilgrim','merchant'].forEach((tid,i) => {
      setTimeout(() => meCreateWave(tid, from.id, to.id, Math.floor(size/3), 'Thiên Đạo Đại Di Dân'), i*200);
    });
    if (typeof window.updateUI === 'function') window.updateUI();
    alert(`🌊 Đại Di Dân Thiên Đạo:\n${from.icon}${from.name} → ${to.icon}${to.name}\n${size.toLocaleString()} người bắt đầu di chuyển!`);
    meRenderPanel();
  }
};

window.meGodAttract = function() {
  if ((window.heavenPoints||0) < 150) { alert('Cần 150 Thiên Đạo Điểm!'); return; }
  const conts = _meGetAllContinents();
  if (!conts.length) return;
  const contId = prompt(`Nhập tên/ID đại lục muốn thu hút:\n${conts.map(c=>c.id+' = '+c.name).join('\n')}`);
  const target = conts.find(c=>c.id===contId||c.name.includes(contId||''));
  if (!target) { alert('Không tìm thấy đại lục!'); return; }
  window.heavenPoints -= 150;
  // Boost pull temporarily by raising stability
  target.stability = Math.min(100, (target.stability||50) + 20);
  // Trigger 3 attraction waves from random continents
  conts.filter(c=>c.id!==target.id).slice(0,3).forEach((from,i) => {
    setTimeout(() => meCreateWave('pilgrim', from.id, target.id, Math.floor(50+Math.random()*150), `🧲 Thiên Đạo Thu Hút: ${target.name}`), i*300);
  });
  if (typeof window.updateUI === 'function') window.updateUI();
  alert(`🧲 ${target.icon}${target.name} đang tỏa ra sức hút mạnh mẽ!\nNhiều đại lục sẽ gửi người đến.`);
  meRenderPanel();
};

window.meGodBlock = function() {
  if ((window.heavenPoints||0) < 100) { alert('Cần 100 Thiên Đạo Điểm!'); return; }
  const active = meState.waves.filter(w=>!w.completed);
  if (!active.length) { alert('Không có làn sóng di dân nào để phong tỏa!'); return; }
  window.heavenPoints -= 100;
  const blocked = active.length;
  // Cancel all active waves (instant block)
  meState.waves = meState.waves.filter(w=>w.completed);
  _meLog(`🚫 Thiên Đạo Phong Tỏa Di Dân — ${blocked} làn sóng bị chặn đứng!`, null, null);
  if (typeof window.updateUI === 'function') window.updateUI();
  alert(`🚫 Đã phong tỏa ${blocked} làn sóng di dân!`);
  meRenderPanel();
};

// ─── ACTION CALLBACKS ─────────────────────────────────────────

window.meSwitchTab = meSwitchTab;

window.meActionCreate = function() {
  const typeId = document.getElementById('me-type')?.value;
  const fromId = document.getElementById('me-from')?.value;
  const toId   = document.getElementById('me-to')?.value;
  const size   = parseInt(document.getElementById('me-size')?.value || '0');
  const msgEl  = document.getElementById('me-create-msg');
  const wave = meCreateWave(typeId, fromId, toId, size > 0 ? size : undefined);
  if (msgEl) {
    msgEl.style.color = wave ? 'var(--jade)' : 'var(--red)';
    msgEl.textContent = wave ? `✅ Đã tạo sóng ${wave.size.toLocaleString()} người!` : '⚠️ Không thể tạo sóng di dân (quy mô quá nhỏ hoặc lặp)';
  }
  setTimeout(meRenderPanel, 300);
};

window.meRenderPanel = meRenderPanel;
window.meTick        = meTick;
window.meState       = meState;

// ─── HOOK INTO MAIN TICK ──────────────────────────────────────

(function meHookTick() {
  const tryHook = () => {
    if (typeof window.simulateWorld === 'function' && !window._meSimHooked) {
      window._meSimHooked = true;
      const _orig = window.simulateWorld;
      window.simulateWorld = function() {
        _orig.apply(this, arguments);
        try { meTick(); } catch(e) {}
      };
      console.log('[MigrationEngine] simulateWorld patched ✓');
    }
  };
  tryHook();
  document.addEventListener('DOMContentLoaded', () => setTimeout(tryHook, 2500));
})();

console.log('[MigrationEngine V1] 🚶 Di Dân Hệ Thống khởi động — 6 Loại Di Dân · Push/Pull Factors · Sóng Di Dân · Thần Can Thiệp sẵn sàng.');
