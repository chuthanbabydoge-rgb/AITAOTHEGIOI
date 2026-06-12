/* ============================================================
   CATASTROPHE SYSTEM — v1.0
   Cơ Cấu Thảm Họa — Đấng Sáng Tạo V6 Giai Đoạn Tiếp Theo
   Tích hợp vào creatorGodEngine

   Thảm họa:
   🌋 Núi Lửa     — Diệt thành phố, thiêu sects, sát thương army
   🌊 Đại Hồng Thủy— Xóa khu vực, dân số giảm thê thảm
   ☄  Sao Băng Rơi — Thiệt hại random toàn thế giới
   🌪  Bão Trời    — Kinh tế sụp đổ, NPCs thất tán
   🔥 Hỏa Ma       — Thiêu hủy sects & tinh hoa tu sĩ

   KHÔNG KHÔI PHỤC LƯU TRỮ — Lịch sử không thể thay đổi
   ============================================================ */

'use strict';

// ============================================================
// STATE
// ============================================================

window.catastropheHistory = window.catastropheHistory || [];   // Toàn bộ lịch sử thảm họa
window.activeDisasters    = window.activeDisasters    || [];   // Đang diễn ra (phục hồi)

// ============================================================
// CONSTANTS
// ============================================================

const DISASTER_TYPES = {
  volcano: {
    id:       'volcano',
    icon:     '🌋',
    name:     'Núi Lửa Phun Trào',
    color:    '#ef4444',
    glow:     'rgba(239,68,68,0.6)',
    desc:     'Dung nham thiêu rụi vạn vật — thành thị sụp đổ, tông môn tan tành.',
    duration: 50,   // năm phục hồi
    effects: {
      countryPop:   0.55,  // dân số còn 55%
      countryArmy:  0.40,
      countryEcon:  0.50,
      sectPrestige: 0.45,
      npcDeathRate: 0.30,  // 30% NPC trong vùng chết
    },
    anim: 'shake'
  },
  flood: {
    id:       'flood',
    icon:     '🌊',
    name:     'Đại Hồng Thủy',
    color:    '#3b82f6',
    glow:     'rgba(59,130,246,0.6)',
    desc:     'Nước trời đổ xuống — lãnh thổ chìm sâu, sinh linh phiêu tán.',
    duration: 40,
    effects: {
      countryPop:   0.50,
      countryArmy:  0.60,
      countryEcon:  0.45,
      sectPrestige: 0.70,
      npcDeathRate: 0.20,
    },
    anim: 'wave'
  },
  meteor: {
    id:       'meteor',
    icon:     '☄',
    name:     'Sao Băng Rơi',
    color:    '#f59e0b',
    glow:     'rgba(245,158,11,0.6)',
    desc:     'Thiên thạch từ hư không rơi xuống — trời đất chấn động, họa khắp thiên hạ.',
    duration: 30,
    effects: {
      countryPop:   0.70,   // thiệt hại vừa nhưng global
      countryArmy:  0.65,
      countryEcon:  0.60,
      sectPrestige: 0.60,
      npcDeathRate: 0.15,
      isGlobal:     true,   // ảnh hưởng toàn cầu
    },
    anim: 'flash'
  },
  storm: {
    id:       'storm',
    icon:     '🌪',
    name:     'Bão Trời',
    color:    '#8b5cf6',
    glow:     'rgba(139,92,246,0.6)',
    desc:     'Cuồng phong xé toạc đất trời — kinh tế kiệt quệ, lòng dân tan rã.',
    duration: 25,
    effects: {
      countryPop:   0.80,
      countryArmy:  0.55,
      countryEcon:  0.30,   // kinh tế bị đánh nặng nhất
      sectPrestige: 0.65,
      npcDeathRate: 0.10,
    },
    anim: 'spin'
  },
  hellfire: {
    id:       'hellfire',
    icon:     '🔥',
    name:     'Hỏa Ma Giáng Thế',
    color:    '#f97316',
    glow:     'rgba(249,115,22,0.6)',
    desc:     'Hỏa Ma từ Địa Ngục thăng lên — thiêu diệt tông môn, sát hại tinh anh.',
    duration: 60,
    effects: {
      countryPop:   0.75,
      countryArmy:  0.50,
      countryEcon:  0.65,
      sectPrestige: 0.20,   // sects bị đánh nặng nhất
      npcDeathRate: 0.40,   // NPC tinh anh chết nhiều
      targetsSects: true,
    },
    anim: 'burn'
  }
};

// ============================================================
// HELPERS
// ============================================================

function _catNow()   { return (typeof year !== 'undefined') ? year : 0; }
function _catNpcs()  { return (typeof npcs !== 'undefined') ? npcs : []; }
function _catLog(t)  { if (typeof addLog === 'function') addLog(t, 'death'); }
function _catToast(t){ if (typeof toast === 'function') toast(t); }
function _catWH(type, desc, extra) {
  if (typeof addWorldHistory === 'function') addWorldHistory(type, desc, extra || {});
}
function _catTimeline(t) {
  if (typeof addTimeline === 'function') addTimeline(t, 'death', '☠️');
}
function _catSave() {
  try {
    localStorage.setItem('cgv6_catastropheHistory', JSON.stringify((window.catastropheHistory||[]).slice(0,200)));
    localStorage.setItem('cgv6_activeDisasters',    JSON.stringify((window.activeDisasters||[]).slice(0,50)));
  } catch(e) {}
  if (typeof save === 'function') save();
}

function _rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function _chance(p)      { return Math.random() < p; }

function _getRegionName(territory) {
  // Trả về tên đơn giản từ territory string như "🗻 Đông Vực"
  return territory || 'Thiên Địa';
}

// ============================================================
// CORE: APPLY DISASTER TO REGION
// ============================================================

function _applyDisasterToRegion(def, regionName) {
  const yr    = _catNow();
  const fx    = def.effects;
  const log   = [];

  // --- COUNTRIES ---
  const affectedCountries = (typeof countries !== 'undefined' ? countries : [])
    .filter(c => !c.collapsed && (def.effects.isGlobal || c.territory === regionName));

  affectedCountries.forEach(c => {
    const popBefore = c.population || 0;
    c.population = Math.max(10000, Math.floor((c.population || 0) * fx.countryPop));
    c.army       = Math.max(0,     Math.floor((c.army       || 0) * fx.countryArmy));
    c.economy    = Math.max(0,     Math.floor((c.economy    || 0) * fx.countryEcon));
    c.wealth     = Math.max(0,     Math.floor((c.wealth     || 0) * fx.countryEcon));
    const popLost = popBefore - c.population;
    log.push(`👑 ${c.name}: -${popLost.toLocaleString()} dân, army -${Math.round((1-fx.countryArmy)*100)}%, kinh tế -${Math.round((1-fx.countryEcon)*100)}%`);
    if (c.civHistory) c.civHistory.push({ year: yr, event: `${def.icon} ${def.name} tàn phá — dân số mất ${Math.round((1-fx.countryPop)*100)}%` });
  });

  // --- SECTS ---
  const affectedSects = (typeof sects !== 'undefined' ? sects : [])
    .filter(s => !s.collapsed && (def.effects.isGlobal || s.territory === regionName));

  affectedSects.forEach(s => {
    const prestigeBefore = s.prestige || 0;
    s.prestige = Math.max(0,   Math.floor((s.prestige  || 0) * fx.sectPrestige));
    s.treasury = Math.max(0,   Math.floor((s.treasury  || 0) * fx.countryEcon));
    const prestigeLost = prestigeBefore - s.prestige;
    log.push(`🏛 ${s.name}: uy danh -${prestigeLost}, kho báu -${Math.round((1-fx.countryEcon)*100)}%`);

    // Sects đặc biệt dễ sụp đổ với Hỏa Ma
    if (def.effects.targetsSects && s.prestige < 50 && _chance(0.4)) {
      s.collapsed = true;
      log.push(`💀 ${s.name} sụp đổ hoàn toàn do ${def.icon} ${def.name}!`);
      _catLog(`💀 Tông môn ${s.name} sụp đổ — ${def.name} diệt tận gốc rễ!`);
      _catWH('sect_destroyed', `${s.name} bị ${def.name} hủy diệt`, { sectName: s.name });
    }
  });

  // --- NPCS ---
  const allNpcs  = _catNpcs().filter(n => n.status === 'alive');
  const inRegion = def.effects.isGlobal
    ? allNpcs
    : allNpcs.filter(n => n.region === regionName || n.country === regionName ||
        (affectedCountries.some(c => c.name === n.country)));

  let npcDead = 0;
  inRegion.forEach(n => {
    // Hỏa Ma nhắm vào NPC realm cao hơn
    const deathMult = (def.effects.targetsSects && (n.realm || 0) > 3) ? 1.5 : 1;
    if (_chance(fx.npcDeathRate * deathMult)) {
      if (typeof killNPC === 'function') {
        killNPC(n, `${def.icon} ${def.name}`, null, false);
      } else {
        n.status = 'dead';
        n.deathYear = yr;
        n.deathCause = def.name;
      }
      n.biography && n.biography.push({ year: yr, event: `Tử vong trong ${def.name}.` });
      npcDead++;
    } else {
      // Bị thương nặng
      n.hp = Math.max(1, Math.floor((n.maxHp || 100) * _rand(5, 30) / 100));
      n.biography && n.biography.push({ year: yr, event: `Sống sót qua ${def.name} nhưng trọng thương.` });
    }
  });
  if (npcDead > 0) log.push(`☠️ ${npcDead} tu sĩ tử vong trong thảm họa`);

  // --- TERRITORIES / REGIONS ---
  const regionObj = (typeof world !== 'undefined' && world && world.territories)
    ? world.territories.find(t => t.name === regionName)
    : null;
  if (regionObj && regionObj.population) {
    regionObj.population = Math.max(100, Math.floor(regionObj.population * fx.countryPop));
    if (regionObj.resources) {
      Object.keys(regionObj.resources).forEach(k => {
        regionObj.resources[k] = Math.max(0, Math.floor((regionObj.resources[k]||0) * 0.6));
      });
    }
  }

  return { log, npcDead, affectedCountries, affectedSects };
}

// ============================================================
// MAIN: CAST DISASTER
// ============================================================

window.cgCastDisaster = function(disasterId, regionName) {
  const def = DISASTER_TYPES[disasterId];
  if (!def) { _catToast('⚠️ Loại thảm họa không hợp lệ.'); return; }

  const yr         = _catNow();
  const isGlobal   = !!def.effects.isGlobal;
  const targetDesc = isGlobal ? 'Toàn Thế Giới' : (regionName || 'Thiên Địa');

  // Kiểm tra cần region (trừ global)
  if (!isGlobal && !regionName) {
    _catToast('⚠️ Vui lòng chọn khu vực!');
    return;
  }

  // Áp dụng thiệt hại
  const result = _applyDisasterToRegion(def, regionName);

  // Tạo record thảm họa
  const rec = {
    id:          `disaster_${Date.now()}`,
    year:        yr,
    type:        disasterId,
    icon:        def.icon,
    name:        def.name,
    region:      targetDesc,
    npcDead:     result.npcDead,
    countries:   result.affectedCountries.map(c => c.name),
    sects:       result.affectedSects.map(s => s.name),
    log:         result.log,
    recovering:  true,
    recoveryEnd: yr + def.duration,
    duration:    def.duration,
  };

  window.catastropheHistory.unshift(rec);
  if (window.catastropheHistory.length > 200) window.catastropheHistory.pop();

  // Thêm vào active disasters (đang phục hồi)
  window.activeDisasters = (window.activeDisasters || []).filter(d => d.id !== rec.id);
  window.activeDisasters.unshift(rec);

  // Ghi lịch sử thế giới
  const mainDesc = `${def.icon} ${def.name} giáng xuống ${targetDesc} — ${result.npcDead} tu sĩ tử vong`;
  _catLog(`${def.icon} THẢM HỌA THIÊN ĐỊA: ${def.name} tại ${targetDesc}!`);
  _catWH('catastrophe', mainDesc, { type: disasterId, region: targetDesc, npcDead: result.npcDead });
  _catTimeline(`${def.icon} ${def.name} tàn phá ${targetDesc} — ${result.npcDead} tu sĩ tử vong`);
  _catToast(`${def.icon} ${def.name} giáng xuống ${targetDesc}!`);

  // Update map overlay
  _catUpdateMapMarker(rec);

  if (typeof renderAll === 'function') renderAll();
  _catSave();
  window.renderCatastrophePanel();
};

// ============================================================
// RECOVERY TICK (gọi mỗi year tick)
// ============================================================

window.catastropheTick = function() {
  const yr = _catNow();
  (window.activeDisasters || []).forEach(d => {
    if (!d.recovering) return;
    const progress = Math.min(1, (yr - d.year) / d.duration);
    d.recoveryProgress = progress;
    if (yr >= d.recoveryEnd) {
      d.recovering = false;
      _catLog(`🌱 ${d.icon} ${d.region} dần hồi phục sau ${d.name} (${d.duration} năm)`);
    }
  });
  // Xóa đã phục hồi hoàn toàn sau một thời gian
  window.activeDisasters = (window.activeDisasters || []).filter(d => d.recovering || (yr - d.recoveryEnd < 30));
};

// ============================================================
// MAP MARKER OVERLAY
// Vẽ marker thảm họa lên worldMapCanvas sau drawMap()
// ============================================================

window._catMapMarkers = window._catMapMarkers || [];

function _catUpdateMapMarker(rec) {
  // Xóa marker cũ cùng vùng
  window._catMapMarkers = (window._catMapMarkers||[]).filter(m => m.region !== rec.region || m.id === rec.id);
  window._catMapMarkers.unshift({
    id:     rec.id,
    region: rec.region,
    icon:   rec.icon,
    name:   rec.name,
    color:  DISASTER_TYPES[rec.type]?.color || '#fff',
    glow:   DISASTER_TYPES[rec.type]?.glow  || 'rgba(255,255,255,0.5)',
    year:   rec.year,
    ttl:    rec.recoveryEnd,
  });
}

// Patch worldMapSystem: vẽ sau khi drawMap hoàn thành
(function patchMapDraw() {
  function tryPatch() {
    if (typeof drawMap !== 'function') { setTimeout(tryPatch, 500); return; }
    if (window._catMapPatched) return;
    window._catMapPatched = true;
    const _orig = window.drawMap || drawMap;
    // Sử dụng global override
    const origFn = drawMap;
    window.drawMap = function() {
      origFn.apply(this, arguments);
      _catDrawDisasterOverlay();
    };
    // Cũng patch drawMap nếu là local (module pattern)
  }
  setTimeout(tryPatch, 1000);
  document.addEventListener('DOMContentLoaded', () => setTimeout(tryPatch, 1500));
})();

function _catDrawDisasterOverlay() {
  const canvas = document.getElementById('worldMapCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const yr = _catNow();

  const markers = (window._catMapMarkers || []).filter(m => yr <= m.ttl + 10);

  if (!markers.length) return;

  // Cần mapState để transform
  const zoom = (typeof mapState !== 'undefined') ? mapState.zoom  : 1;
  const panX = (typeof mapState !== 'undefined') ? mapState.panX  : 0;
  const panY = (typeof mapState !== 'undefined') ? mapState.panY  : 0;
  const REGIONS = (typeof FIXED_REGION_POS !== 'undefined') ? FIXED_REGION_POS : [];

  // Lấy vị trí region từ worldMap data
  const md = (typeof getMapData === 'function') ? getMapData() : null;

  markers.forEach((m, idx) => {
    // Tìm tọa độ vùng
    let px = 50, py = 50;
    if (md && md.regions) {
      const regionEntries = Object.values(md.regions);
      const found = regionEntries.find(r => r.name === m.region || m.region.includes(r.name));
      if (found) { px = found.x; py = found.y; }
      else if (m.region === 'Toàn Thế Giới') { px = 50; py = 50; }
    } else if (REGIONS[idx % REGIONS.length]) {
      px = REGIONS[idx % REGIONS.length].x;
      py = REGIONS[idx % REGIONS.length].y;
    }

    const sw = W / zoom;
    const sh = H / zoom;
    const cx = panX + (px / 100) * sw * zoom;
    const cy = panY + (py / 100) * sh * zoom;

    const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 500 + idx);
    const radius = (m.region === 'Toàn Thế Giới' ? 40 : 22) * zoom * pulse;

    // Vòng glow
    ctx.save();
    ctx.globalAlpha = 0.35 * pulse;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, m.glow);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Icon thảm họa
    ctx.globalAlpha = 0.9;
    ctx.font = `${Math.max(16, 22 * zoom)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = m.color;
    ctx.shadowBlur = 12;
    ctx.fillText(m.icon, cx, cy);

    // Label
    ctx.globalAlpha = 0.75;
    ctx.font = `bold ${Math.max(9, 11 * zoom)}px sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 4;
    ctx.fillText(m.name, cx, cy + 18 * zoom);
    ctx.restore();
  });
}

// ============================================================
// SAVE / LOAD PATCH
// ============================================================

(function patchCatSaveLoad() {
  function tryPatch() {
    // Không patch window.save nữa — quá nặng khi save gọi mỗi tick
    // _catSave() sẽ được gọi bởi catastropheTick mỗi 10 năm thay thế

    const _origLoad = window.load;
    if (typeof _origLoad === 'function' && !window._catLoadPatched) {
      window._catLoadPatched = true;
      window.load = function() {
        _origLoad.apply(this, arguments);
        try {
          const h = localStorage.getItem('cgv6_catastropheHistory');
          window.catastropheHistory = h ? JSON.parse(h) : [];
          const a = localStorage.getItem('cgv6_activeDisasters');
          window.activeDisasters    = a ? JSON.parse(a) : [];
          window._catMapMarkers = [];
          (window.activeDisasters||[]).forEach(d => {
            if (d.recovering) _catUpdateMapMarker(d);
          });
        } catch(e) {}
      };
    }
  }
  tryPatch();
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(tryPatch, 600);
    try {
      const h = localStorage.getItem('cgv6_catastropheHistory');
      window.catastropheHistory = h ? JSON.parse(h) : [];
      const a = localStorage.getItem('cgv6_activeDisasters');
      window.activeDisasters    = a ? JSON.parse(a) : [];
    } catch(e) {}
  });
})();

// Patch vào simulateWorld — gọi catastropheTick mỗi năm, save mỗi 10 năm
(function patchTick() {
  function tryPatch() {
    if (window._catTickPatched) return;
    const _orig = window.simulateWorld;
    if (typeof _orig !== 'function') return;
    window._catTickPatched = true;
    window.simulateWorld = function() {
      _orig.apply(this, arguments);
      try { window.catastropheTick(); } catch(e) {}
      // Save catastrophe data mỗi 10 năm, không phải mỗi tick
      if ((window.year || 0) % 10 === 0) {
        try {
          localStorage.setItem('cgv6_catastropheHistory', JSON.stringify((window.catastropheHistory||[]).slice(0,200)));
          localStorage.setItem('cgv6_activeDisasters',    JSON.stringify((window.activeDisasters||[]).slice(0,50)));
        } catch(e) {}
      }
    };
  }
  // Thử nhiều lần vì simulateWorld có thể bị patch bởi file khác trước
  setTimeout(tryPatch, 2000);
  document.addEventListener('DOMContentLoaded', () => setTimeout(tryPatch, 2500));
})();

// ============================================================
// PANEL RENDERER
// ============================================================

window.renderCatastrophePanel = function() {
  const container = document.getElementById('panel-catastrophe');
  if (!container) return;

  const yr         = _catNow();
  const territories = (typeof world !== 'undefined' && world && world.territories)
    ? world.territories
    : (typeof DEFAULT_REGIONS !== 'undefined' ? DEFAULT_REGIONS : []);

  // Region options
  const regionOpts = [
    '<option value="">— Chọn khu vực —</option>',
    ...territories.map(t => `<option value="${t.name}">${t.name}</option>`)
  ].join('');

  // Active disasters
  const activeHTML = (window.activeDisasters || []).length === 0
    ? '<div class="cat-empty">Thiên Địa bình yên — chưa có thảm họa nào đang diễn ra.</div>'
    : (window.activeDisasters || []).map(d => {
        const prog = Math.min(100, Math.round(((yr - d.year) / d.duration) * 100));
        const rem  = Math.max(0, d.recoveryEnd - yr);
        return `
          <div class="cat-active-row">
            <span class="cat-active-icon">${d.icon}</span>
            <div class="cat-active-info">
              <div class="cat-active-name">${d.name}</div>
              <div class="cat-active-region">${d.region} · Năm ${d.year} · ${rem > 0 ? `còn ${rem} năm phục hồi` : '✅ Đã phục hồi'}</div>
              <div class="cat-progress-bar">
                <div class="cat-progress-fill" style="width:${prog}%"></div>
              </div>
            </div>
            <span class="cat-active-pct">${prog}%</span>
          </div>
        `;
      }).join('');

  // History
  const histHTML = (window.catastropheHistory || []).slice(0, 40).map(d => `
    <div class="cat-hist-row">
      <span class="cat-hist-icon">${d.icon}</span>
      <span class="cat-hist-year">Năm ${d.year}</span>
      <span class="cat-hist-name">${d.name}</span>
      <span class="cat-hist-region">${d.region}</span>
      <span class="cat-hist-dead">☠️ ${d.npcDead}</span>
    </div>
  `).join('') || '<div class="cat-empty">Chưa có thảm họa nào trong lịch sử.</div>';

  // Disaster cards
  const disasterCards = Object.values(DISASTER_TYPES).map(def => `
    <div class="cat-disaster-card" style="--cat-color:${def.color};--cat-glow:${def.glow}">
      <div class="cat-d-header">
        <span class="cat-d-icon">${def.icon}</span>
        <div>
          <div class="cat-d-name">${def.name}</div>
          <div class="cat-d-dur">Phục hồi: ${def.duration} năm</div>
        </div>
      </div>
      <div class="cat-d-desc">${def.desc}</div>
      <div class="cat-d-stats">
        <span>Dân -${Math.round((1-def.effects.countryPop)*100)}%</span>
        <span>Quân -${Math.round((1-def.effects.countryArmy)*100)}%</span>
        <span>KT -${Math.round((1-def.effects.countryEcon)*100)}%</span>
        <span>Tông -${Math.round((1-def.effects.sectPrestige)*100)}%</span>
        <span>NPC ☠️${Math.round(def.effects.npcDeathRate*100)}%</span>
        ${def.effects.isGlobal ? '<span class="cat-global">🌐 GLOBAL</span>' : ''}
      </div>
      ${def.effects.isGlobal
        ? `<button class="cat-cast-btn" onclick="cgCastDisaster('${def.id}','')">
             ${def.icon} Giáng Thiên Họa
           </button>`
        : `<div class="cat-d-row">
             <select id="cat-region-${def.id}" class="cat-select">${regionOpts}</select>
             <button class="cat-cast-btn cat-cast-regional" onclick="cgCastDisaster('${def.id}',document.getElementById('cat-region-${def.id}').value)">
               ${def.icon} Giáng
             </button>
           </div>`
      }
    </div>
  `).join('');

  container.innerHTML = `
    <div class="cat-header">
      <div class="cat-title">🌋 CƠ CẤU THẢM HỌA</div>
      <div class="cat-subtitle">Đấng Sáng Tạo Định Hình Lịch Sử — Không Thể Khôi Phục</div>
    </div>

    <!-- DISASTER CARDS -->
    <div class="cat-cards-grid">
      ${disasterCards}
    </div>

    <!-- ACTIVE DISASTERS -->
    <div class="cat-section">
      <div class="cat-section-title">
        ⚡ THẢM HỌA ĐANG DIỄN RA
        <span class="cat-count">${(window.activeDisasters||[]).filter(d=>d.recovering).length} đang phục hồi</span>
      </div>
      <div class="cat-active-list">${activeHTML}</div>
    </div>

    <!-- HISTORY -->
    <div class="cat-section">
      <div class="cat-section-title">
        📖 LỊCH SỬ THIÊN ĐỊA ĐẠI NẠN
        <span class="cat-count">${(window.catastropheHistory||[]).length} sự kiện</span>
      </div>
      <div class="cat-hist-list">${histHTML}</div>
    </div>
  `;
};

// ============================================================
// CSS INJECTION
// ============================================================

(function injectCatCSS() {
  if (document.getElementById('cat-styles')) return;
  const style = document.createElement('style');
  style.id = 'cat-styles';
  style.textContent = `
    /* ======= CATASTROPHE PANEL ======= */
    #panel-catastrophe {
      background: var(--bg-main, #0a0a0f);
      color: var(--white-main, #e2e8f0);
    }

    .cat-header {
      text-align: center;
      padding: 20px 0 16px;
      border-bottom: 1px solid rgba(239,68,68,0.25);
      margin-bottom: 20px;
    }
    .cat-title {
      font-size: 22px;
      font-weight: 800;
      color: #f87171;
      letter-spacing: 3px;
      text-shadow: 0 0 24px rgba(239,68,68,0.5);
      margin-bottom: 4px;
    }
    .cat-subtitle {
      font-size: 11px;
      color: var(--white-dim, #64748b);
      letter-spacing: 1px;
    }

    /* ---- DISASTER CARDS GRID ---- */
    .cat-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 14px;
      margin-bottom: 24px;
    }

    .cat-disaster-card {
      background: var(--bg-card, #1a1a2e);
      border: 1px solid color-mix(in srgb, var(--cat-color) 30%, transparent);
      border-radius: 12px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: border-color 0.2s, box-shadow 0.2s;
      position: relative;
      overflow: hidden;
    }
    .cat-disaster-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at top left, color-mix(in srgb, var(--cat-color) 8%, transparent) 0%, transparent 70%);
      pointer-events: none;
    }
    .cat-disaster-card:hover {
      border-color: color-mix(in srgb, var(--cat-color) 65%, transparent);
      box-shadow: 0 0 18px color-mix(in srgb, var(--cat-color) 18%, transparent);
    }

    .cat-d-header { display: flex; align-items: center; gap: 10px; }
    .cat-d-icon   { font-size: 26px; line-height: 1; }
    .cat-d-name   { font-size: 13px; font-weight: 700; color: var(--white-main, #e2e8f0); }
    .cat-d-dur    { font-size: 10px; color: var(--white-dim, #64748b); margin-top: 2px; }

    .cat-d-desc {
      font-size: 11.5px;
      color: var(--white-dim, #94a3b8);
      line-height: 1.55;
    }

    .cat-d-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    .cat-d-stats span {
      font-size: 10px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 4px;
      padding: 2px 6px;
      color: var(--white-dim, #94a3b8);
    }
    .cat-global {
      color: #60a5fa !important;
      border-color: rgba(96,165,250,0.3) !important;
      background: rgba(96,165,250,0.08) !important;
      font-weight: 700;
    }

    .cat-d-row {
      display: flex;
      gap: 6px;
    }

    .cat-select {
      flex: 1;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border, rgba(255,255,255,0.1));
      border-radius: 6px;
      color: var(--white-main, #e2e8f0);
      padding: 6px 8px;
      font-size: 11px;
      outline: none;
      cursor: pointer;
    }
    .cat-select:focus { border-color: var(--cat-color, #ef4444); }

    .cat-cast-btn {
      background: linear-gradient(135deg,
        color-mix(in srgb, var(--cat-color, #ef4444) 20%, transparent),
        color-mix(in srgb, var(--cat-color, #ef4444) 12%, transparent)
      );
      border: 1px solid color-mix(in srgb, var(--cat-color, #ef4444) 40%, transparent);
      color: color-mix(in srgb, var(--cat-color, #ef4444) 90%, white);
      border-radius: 7px;
      padding: 7px 14px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
      width: 100%;
    }
    .cat-cast-regional { width: auto; padding: 6px 12px; }
    .cat-cast-btn:hover {
      filter: brightness(1.2);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px color-mix(in srgb, var(--cat-color, #ef4444) 30%, transparent);
    }
    .cat-cast-btn:active { transform: translateY(0); }

    /* ---- SECTIONS ---- */
    .cat-section {
      background: var(--bg-card, #1a1a2e);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .cat-section-title {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1.2px;
      color: var(--white-main, #e2e8f0);
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .cat-count {
      font-size: 10px;
      color: var(--white-dim, #64748b);
      font-weight: 400;
    }
    .cat-empty {
      font-size: 12px;
      color: var(--white-dim, #64748b);
      text-align: center;
      padding: 16px 0;
    }

    /* ---- ACTIVE DISASTERS ---- */
    .cat-active-list { display: flex; flex-direction: column; gap: 8px; }
    .cat-active-row {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 8px;
      padding: 10px 12px;
    }
    .cat-active-icon { font-size: 22px; }
    .cat-active-info { flex: 1; }
    .cat-active-name   { font-size: 12px; font-weight: 700; color: var(--white-main, #e2e8f0); }
    .cat-active-region { font-size: 10px; color: var(--white-dim, #64748b); margin: 2px 0 5px; }
    .cat-active-pct    { font-size: 12px; font-weight: 700; color: #4ade80; min-width: 36px; text-align: right; }

    .cat-progress-bar {
      height: 4px;
      background: rgba(255,255,255,0.06);
      border-radius: 2px;
      overflow: hidden;
    }
    .cat-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #4ade80, #86efac);
      border-radius: 2px;
      transition: width 0.3s;
    }

    /* ---- HISTORY ---- */
    .cat-hist-list {
      display: flex;
      flex-direction: column;
      gap: 3px;
      max-height: 320px;
      overflow-y: auto;
    }
    .cat-hist-list::-webkit-scrollbar { width: 4px; }
    .cat-hist-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

    .cat-hist-row {
      display: grid;
      grid-template-columns: 24px 70px 1fr 1fr 50px;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 5px;
      background: rgba(255,255,255,0.02);
      font-size: 11px;
      align-items: center;
    }
    .cat-hist-row:hover { background: rgba(255,255,255,0.05); }
    .cat-hist-icon   { font-size: 14px; text-align: center; }
    .cat-hist-year   { color: #a16207; font-variant-numeric: tabular-nums; }
    .cat-hist-name   { color: #fca5a5; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .cat-hist-region { color: #c4b5fd; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .cat-hist-dead   { color: #f87171; text-align: right; }

    @media (max-width: 600px) {
      .cat-cards-grid { grid-template-columns: 1fr; }
      .cat-hist-row   { grid-template-columns: 24px 1fr 40px; }
      .cat-hist-name, .cat-hist-region { grid-column: 2; }
      .cat-hist-region { display: none; }
    }

    /* ---- NAV BTN ---- */
    #btn-catastrophe {
      background: linear-gradient(135deg, rgba(239,68,68,0.08), rgba(185,28,28,0.14));
      border-color: rgba(239,68,68,0.25) !important;
      color: #f87171 !important;
    }
    #btn-catastrophe:hover {
      background: linear-gradient(135deg, rgba(239,68,68,0.18), rgba(185,28,28,0.26));
      border-color: #ef4444 !important;
    }
    #btn-catastrophe.active {
      background: linear-gradient(135deg, rgba(239,68,68,0.24), rgba(185,28,28,0.32));
    }
  `;
  document.head.appendChild(style);
})();

// ============================================================
// DOM INJECTION
// ============================================================

(function injectCatDOM() {
  function _inject() {
    // Nav button
    if (!document.getElementById('btn-catastrophe')) {
      const nav = document.querySelector('.sidebar-nav');
      if (nav) {
        // Chèn sau btn-creator-god nếu có, không thì append
        const cgBtn = document.getElementById('btn-creator-god');
        const btn   = document.createElement('button');
        btn.id        = 'btn-catastrophe';
        btn.className = 'nav-btn';
        btn.setAttribute('data-panel', 'catastrophe');
        btn.setAttribute('onclick', "showPanel('catastrophe');renderCatastrophePanel();");
        btn.innerHTML = '<span>🌋</span><span>Thảm Họa</span>';
        if (cgBtn && cgBtn.parentNode === nav) {
          nav.insertBefore(btn, cgBtn.nextSibling);
        } else {
          nav.appendChild(btn);
        }
      }
    }

    // Panel div
    if (!document.getElementById('panel-catastrophe')) {
      const panelsContainer = document.querySelector('.panels');
      if (panelsContainer) {
        const panel = document.createElement('div');
        panel.id        = 'panel-catastrophe';
        panel.className = 'panel';
        panelsContainer.appendChild(panel);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(_inject, 900));
  } else {
    setTimeout(_inject, 900);
  }
})();

console.log('[Catastrophe System v1.0] Loaded — Thiên Địa Đại Nạn sẵn sàng giáng thế.');
