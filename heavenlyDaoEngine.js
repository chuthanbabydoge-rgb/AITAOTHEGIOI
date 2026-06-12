'use strict';
/* ============================================================
   HEAVENLY DAO TRIBUNAL ENGINE V1 — Creator God V6
   Thiên Đạo Phán Xét — Giám Sát · Trừng Phạt · Ban Ân

   Monitors every faction's karma each tick.
   Creator God (player) issues rulings from the Heavenly Court.
   AI auto-punishes extreme evil; auto-blesses extreme virtue.
   ============================================================ */

// ─── CONSTANTS ────────────────────────────────────────────────

const HD_SIN_TYPES = {
  massacre:       { icon:'🩸', name:'Sát Nghiệp',     desc:'Gây chết chóc hàng loạt trong chiến tranh',            weight: 8  },
  sect_destroy:   { icon:'💀', name:'Diệt Tông',      desc:'Tiêu diệt tông môn của kẻ khác',                      weight: 12 },
  country_annex:  { icon:'☠️', name:'Diệt Quốc',      desc:'Thôn tính và xóa sổ một quốc gia',                    weight: 15 },
  war_mongering:  { icon:'⚔️', name:'Hiếu Chiến',     desc:'Liên tục khơi dậy chiến tranh không cần thiết',       weight: 5  },
  hoarding:       { icon:'💰', name:'Tham Tàn',        desc:'Tích trữ tài nguyên trong khi dân chúng đói khổ',     weight: 4  },
  corruption:     { icon:'🐍', name:'Mục Nát',         desc:'Quan lại tham nhũng, dân tình lầm than',              weight: 3  },
  heresy:         { icon:'🔥', name:'Tà Đạo',          desc:'Sử dụng tà thuật cấm cố, xâm phạm thiên đạo',        weight: 10 },
  npc_killed:     { icon:'👻', name:'Sát Nhân',        desc:'Giết hại tu sĩ vô tội không lý do',                  weight: 6  },
};

const HD_VIRTUE_TYPES = {
  peace_keeping:  { icon:'🕊️', name:'Hòa Bình',       desc:'Duy trì hòa bình lâu dài, không gây chiến',           weight: 6  },
  culture_bloom:  { icon:'🌸', name:'Văn Hóa Thịnh',  desc:'Phát triển văn hóa và nghệ thuật vượt trội',          weight: 5  },
  pop_growth:     { icon:'👶', name:'Dưỡng Dân',       desc:'Dân số phát triển, đời sống no đủ',                   weight: 4  },
  tech_advance:   { icon:'⚙️', name:'Khai Trí',        desc:'Phát triển khoa học kỹ thuật mang lại lợi ích',       weight: 5  },
  sect_protect:   { icon:'🏯', name:'Hộ Pháp',         desc:'Bảo vệ các tông môn yếu đuối',                        weight: 7  },
  world_heal:     { icon:'💊', name:'Tế Thế',          desc:'Giúp đỡ quốc gia hoặc dân chúng bị nạn',             weight: 8  },
  wonder_build:   { icon:'🏛️', name:'Kiến Thiết',      desc:'Xây dựng kỳ quan mang lợi ích cho thiên hạ',          weight: 6  },
};

const HD_VERDICTS = [
  { id:'warning',      icon:'⚠️',  name:'Thiên Đạo Cảnh Cáo',    minSin:15,  effect:'sin_reduce',      severity:1 },
  { id:'minor_bolt',   icon:'⚡',  name:'Tiểu Thiên Lôi',         minSin:30,  effect:'army_damage',     severity:2 },
  { id:'major_bolt',   icon:'🌩️', name:'Đại Thiên Lôi',          minSin:60,  effect:'heavy_damage',    severity:3 },
  { id:'divine_wrath', icon:'☄️',  name:'Thiên Đạo Trừng Phạt',  minSin:90,  effect:'near_destroy',    severity:4 },
  { id:'annihilate',   icon:'💥',  name:'Thiên Đạo Hủy Diệt',    minSin:120, effect:'full_destroy',    severity:5 },
];

const HD_GRACES = [
  { id:'minor_grace',  icon:'✨',  name:'Tiểu Ân Điển',    minVirtue:20, effect:'economy_boost',   power:1 },
  { id:'major_grace',  icon:'🌟',  name:'Đại Ân Điển',     minVirtue:50, effect:'all_boost',       power:2 },
  { id:'divine_favor', icon:'🔱',  name:'Thiên Đạo Sủng Ái',minVirtue:80, effect:'legendary_buff', power:3 },
  { id:'consecrate',   icon:'🌺',  name:'Phong Thần Chi Lễ',minVirtue:100,effect:'divine_champion',power:4 },
];

const HD_AUTO_SIN_THRESHOLD    = 60;
const HD_AUTO_VIRTUE_THRESHOLD = 70;

// ─── STATE ────────────────────────────────────────────────────

let hdState = {
  registry:           {},   // name → { sin, virtue, sinLog[], virtueLog[], status, consecrated, cursed, lastWar }
  activeTribulations: [],   // { id, target, verdict, ticksLeft, effects }
  activeGraces:       [],   // { id, target, grace, ticksLeft, effects }
  verdictHistory:     [],   // all issued verdicts (log)
  tickCount:          0,
  lastAutoTick:       0,
  autoInterval:       8,
  autoEnabled:        true,
  courtLog:           [],   // Heavenly Court log
  initialized:        false,
};

// ─── SAVE / LOAD ──────────────────────────────────────────────

(function hdPatchSave() {
  function tryPatch() {
    if (typeof window.save === 'function' && !window._hdSavePatched) {
      window._hdSavePatched = true;
      const _os = window.save;
      window.save = function() {
        _os.apply(this, arguments);
        try { localStorage.setItem('cgv6_hdState', JSON.stringify({
          registry:       hdState.registry,
          verdictHistory: hdState.verdictHistory.slice(0, 300),
          courtLog:       hdState.courtLog.slice(0, 300),
          tickCount:      hdState.tickCount,
        })); } catch(e) {}
      };
    }
    if (typeof window.load === 'function' && !window._hdLoadPatched) {
      window._hdLoadPatched = true;
      const _ol = window.load;
      window.load = function() {
        _ol.apply(this, arguments);
        try {
          const raw = localStorage.getItem('cgv6_hdState');
          if (raw) { const d = JSON.parse(raw); Object.assign(hdState, d); }
        } catch(e) {}
      };
    }
  }
  tryPatch();
  document.addEventListener('DOMContentLoaded', () => setTimeout(tryPatch, 1000));
})();

// ─── REGISTRY HELPERS ─────────────────────────────────────────

function hdGetEntry(name) {
  if (!hdState.registry[name]) {
    hdState.registry[name] = { sin:0, virtue:0, sinLog:[], virtueLog:[], status:'neutral', consecrated:false, cursed:false, lastWar:0 };
  }
  return hdState.registry[name];
}

function hdAddSin(name, type, amount, reason) {
  const e = hdGetEntry(name);
  const def = HD_SIN_TYPES[type] || { icon:'❓', name:type };
  const actual = Math.round(amount * (def.weight || 1));
  e.sin = Math.max(0, e.sin + actual);
  e.sinLog.unshift({ tick: hdState.tickCount, type, icon:def.icon, name:def.name, amount:actual, reason: reason||'' });
  if (e.sinLog.length > 50) e.sinLog.pop();
  _hdUpdateStatus(name, e);
}

function hdAddVirtue(name, type, amount, reason) {
  const e = hdGetEntry(name);
  const def = HD_VIRTUE_TYPES[type] || { icon:'✨', name:type };
  const actual = Math.round(amount * (def.weight || 1));
  e.virtue = Math.max(0, e.virtue + actual);
  e.virtueLog.unshift({ tick: hdState.tickCount, type, icon:def.icon, name:def.name, amount:actual, reason: reason||'' });
  if (e.virtueLog.length > 50) e.virtueLog.pop();
  _hdUpdateStatus(name, e);
}

function _hdUpdateStatus(name, e) {
  const netKarma = e.virtue - e.sin;
  if (e.consecrated)    e.status = 'divine';
  else if (e.cursed)    e.status = 'cursed';
  else if (netKarma > 60)  e.status = 'saint';
  else if (netKarma > 20)  e.status = 'virtuous';
  else if (netKarma > -20) e.status = 'neutral';
  else if (netKarma > -50) e.status = 'sinful';
  else                     e.status = 'evil';
}

const STATUS_META = {
  divine:   { icon:'🌺', label:'Thần Thánh',  color:'#fbbf24' },
  saint:    { icon:'🌟', label:'Thánh Nhân',  color:'#818cf8' },
  virtuous: { icon:'✨', label:'Đức Hạnh',   color:'#4ade80' },
  neutral:  { icon:'⚖️', label:'Trung Lập',   color:'#94a3b8' },
  sinful:   { icon:'🔥', label:'Tội Nghiệp', color:'#fb923c' },
  evil:     { icon:'☠️', label:'Đại Ác',     color:'#f87171' },
  cursed:   { icon:'💀', label:'Bị Nguyền',  color:'#c084fc' },
};

// ─── TRIBUNAL ACTIONS ─────────────────────────────────────────

function hdIssueVerdict(targetName, verdictId, forced) {
  const e = hdGetEntry(targetName);
  const vdef = HD_VERDICTS.find(v => v.id === verdictId);
  if (!vdef) return { ok:false, msg:'Phán quyết không hợp lệ' };
  if (!forced && e.sin < vdef.minSin) return { ok:false, msg:`Cần tối thiểu ${vdef.minSin} tội nghiệp (đang có ${Math.round(e.sin)})` };

  // Apply effects
  const cArr = (typeof countries !== 'undefined' && Array.isArray(countries)) ? countries : [];
  const target = cArr.find(c => c.name === targetName);
  let effectDesc = '';

  if (target) {
    if (vdef.effect === 'sin_reduce') {
      e.sin = Math.max(0, e.sin - 20);
      effectDesc = 'Giảm 20 tội nghiệp, cảnh cáo chính thức';
    } else if (vdef.effect === 'army_damage') {
      target.army = Math.max(0, Math.floor((target.army||0) * 0.6));
      target.military = Math.max(0, Math.floor((target.military||0) * 0.6));
      effectDesc = `Quân đội ${targetName} giảm 40%`;
    } else if (vdef.effect === 'heavy_damage') {
      target.army = Math.max(0, Math.floor((target.army||0) * 0.4));
      target.population = Math.max(100, Math.floor((target.population||0) * 0.75));
      target.economy = Math.max(100, Math.floor((target.economy||0) * 0.7));
      effectDesc = `Quân đội −60%, Dân số −25%, Kinh tế −30%`;
    } else if (vdef.effect === 'near_destroy') {
      target.army = Math.max(0, Math.floor((target.army||0) * 0.1));
      target.population = Math.max(100, Math.floor((target.population||0) * 0.5));
      target.economy = Math.max(100, Math.floor((target.economy||0) * 0.4));
      target.techLevel = Math.max(0, (target.techLevel||1) - 2);
      e.cursed = true;
      effectDesc = `${targetName} gần như bị xóa sổ — Bị Nguyền vĩnh viễn`;
    } else if (vdef.effect === 'full_destroy') {
      target.army = 0;
      target.population = Math.max(50, Math.floor((target.population||0) * 0.2));
      target.economy = 100;
      e.cursed = true; e.sin = 0;
      effectDesc = `${targetName} bị hủy diệt hoàn toàn bởi Thiên Đạo`;
    }
    e.sin = Math.max(0, e.sin * 0.5);
  } else {
    effectDesc = 'Áp dụng lên thế lực không xác định';
  }

  // Active tribulation effect
  hdState.activeTribulations.push({ id:`trib_${Date.now()}`, target:targetName, verdict:verdictId, icon:vdef.icon, name:vdef.name, ticksLeft: 10 + vdef.severity * 5 });

  const entry = { tick:hdState.tickCount, target:targetName, type:'verdict', verdictId, verdictName:vdef.name, icon:vdef.icon, effectDesc };
  hdState.verdictHistory.unshift(entry);
  hdState.courtLog.unshift({ tick:hdState.tickCount, msg:`${vdef.icon} PHÁN QUYẾT: ${vdef.name} giáng xuống ${targetName} — ${effectDesc}`, type:'verdict' });
  if (typeof addLog === 'function') addLog(`[Thiên Đạo Phán Xét] ${vdef.icon} ${vdef.name} giáng xuống ${targetName}! ${effectDesc}`);
  _hdUpdateStatus(targetName, hdGetEntry(targetName));
  return { ok:true, effectDesc };
}

function hdGrantGrace(targetName, graceId, forced) {
  const e = hdGetEntry(targetName);
  const gdef = HD_GRACES.find(g => g.id === graceId);
  if (!gdef) return { ok:false, msg:'Ân điển không hợp lệ' };
  if (!forced && e.virtue < gdef.minVirtue) return { ok:false, msg:`Cần tối thiểu ${gdef.minVirtue} công đức (đang có ${Math.round(e.virtue)})` };

  const cArr = (typeof countries !== 'undefined' && Array.isArray(countries)) ? countries : [];
  const target = cArr.find(c => c.name === targetName);
  let effectDesc = '';

  if (target) {
    if (gdef.effect === 'economy_boost') {
      target.economy = Math.floor((target.economy||1000) * 1.3);
      effectDesc = `Kinh tế ${targetName} +30%`;
    } else if (gdef.effect === 'all_boost') {
      target.economy = Math.floor((target.economy||1000) * 1.4);
      target.population = Math.floor((target.population||0) * 1.15);
      if (target.techLevel !== undefined) target.techLevel = (target.techLevel||1) + 2;
      effectDesc = `Kinh tế +40%, Dân số +15%, Công nghệ +2`;
    } else if (gdef.effect === 'legendary_buff') {
      target.economy = Math.floor((target.economy||1000) * 1.6);
      target.population = Math.floor((target.population||0) * 1.25);
      if (target.techLevel !== undefined) target.techLevel = (target.techLevel||1) + 4;
      target.army = Math.floor((target.army||0) * 1.3);
      effectDesc = `Toàn diện nâng cao — Kinh tế +60%, Dân số +25%, Quân đội +30%, Kỹ thuật +4`;
    } else if (gdef.effect === 'divine_champion') {
      e.consecrated = true;
      target.economy = Math.floor((target.economy||1000) * 2.0);
      target.population = Math.floor((target.population||0) * 1.5);
      target.army = Math.floor((target.army||0) * 1.5);
      effectDesc = `${targetName} được Phong Thần — Thần Thánh Hóa vĩnh viễn, mọi chỉ số ×2`;
    }
    e.virtue = Math.max(0, e.virtue * 0.6);
  } else {
    effectDesc = 'Ân điển ban xuống nhưng thế lực không tìm thấy';
  }

  hdState.activeGraces.push({ id:`grace_${Date.now()}`, target:targetName, grace:graceId, icon:gdef.icon, name:gdef.name, ticksLeft:15 + gdef.power * 5 });

  const entry = { tick:hdState.tickCount, target:targetName, type:'grace', graceId, graceName:gdef.name, icon:gdef.icon, effectDesc };
  hdState.verdictHistory.unshift(entry);
  hdState.courtLog.unshift({ tick:hdState.tickCount, msg:`${gdef.icon} ÂN ĐIỂN: ${gdef.name} ban xuống ${targetName} — ${effectDesc}`, type:'grace' });
  if (typeof addLog === 'function') addLog(`[Thiên Đạo Phán Xét] ${gdef.icon} ${gdef.name} ban xuống ${targetName}! ${effectDesc}`);
  _hdUpdateStatus(targetName, hdGetEntry(targetName));
  return { ok:true, effectDesc };
}

// ─── TICK ─────────────────────────────────────────────────────

function hdTick() {
  hdState.tickCount++;
  const cArr = (typeof countries !== 'undefined' && Array.isArray(countries)) ? countries : [];
  const nArr = (typeof npcs      !== 'undefined' && Array.isArray(npcs))      ? npcs      : [];
  const sArr = (typeof sects     !== 'undefined' && Array.isArray(sects))     ? sects     : [];

  // ── Passive sin/virtue accumulation ──
  cArr.forEach(c => {
    if (!c.name) return;
    const e = hdGetEntry(c.name);
    const pop  = c.population || 0;
    const army = c.army || c.military || 0;
    const econ = c.economy || 0;
    const cult = c.culture || c.culturalPoints || 0;

    // Sin: war-mongering (high army:pop ratio)
    if (pop > 0 && army / pop > 0.5)        hdAddSin(c.name, 'war_mongering', 0.3, 'Quân đội chiếm đa số dân số');
    // Sin: hoarding (very high economy but small pop)
    if (econ > 50000 && pop < 500)           hdAddSin(c.name, 'hoarding', 0.5, 'Tài nguyên tích trữ quá mức');
    // Virtue: cultural bloom
    if (cult > 50)                           hdAddVirtue(c.name, 'culture_bloom', 0.4, `Văn hóa ${c.name} thịnh vượng`);
    // Virtue: tech advance
    if ((c.techLevel||0) > 3)               hdAddVirtue(c.name, 'tech_advance', 0.3, `Công nghệ ${c.name} phát triển`);
    // Virtue: pop growth
    if (pop > 10000)                         hdAddVirtue(c.name, 'pop_growth', 0.2, `Dân số ${c.name} phồn thịnh`);

    // Passive decay (karma naturally fades over time)
    e.sin    = Math.max(0, e.sin    * 0.99);
    e.virtue = Math.max(0, e.virtue * 0.99);
  });

  // Tick active tribulations
  hdState.activeTribulations = hdState.activeTribulations.filter(t => { t.ticksLeft--; return t.ticksLeft > 0; });
  hdState.activeGraces       = hdState.activeGraces.filter(g => { g.ticksLeft--; return g.ticksLeft > 0; });

  // ── Auto-judge ──
  if (hdState.autoEnabled && (hdState.tickCount - hdState.lastAutoTick) >= hdState.autoInterval) {
    hdState.lastAutoTick = hdState.tickCount;
    _hdAutoJudge(cArr);
  }
}

function _hdAutoJudge(cArr) {
  Object.entries(hdState.registry).forEach(([name, e]) => {
    // Ensure not already being punished
    const alreadyPunished = hdState.activeTribulations.find(t => t.target === name && t.ticksLeft > 5);
    if (!alreadyPunished && e.sin >= HD_AUTO_SIN_THRESHOLD) {
      // Find appropriate verdict
      const vdef = [...HD_VERDICTS].reverse().find(v => e.sin >= v.minSin && v.severity <= 3);
      if (vdef) {
        hdState.courtLog.unshift({ tick:hdState.tickCount, msg:`⚖️ Thiên Đạo tự động trừng phạt ${name} (tội nghiệp ${Math.round(e.sin)}) — ${vdef.name}`, type:'auto' });
        hdIssueVerdict(name, vdef.id, true);
      }
    }
    // Auto-grace for extreme virtue
    const alreadyBlessed = hdState.activeGraces.find(g => g.target === name && g.ticksLeft > 5);
    if (!alreadyBlessed && e.virtue >= HD_AUTO_VIRTUE_THRESHOLD && !e.consecrated) {
      const gdef = HD_GRACES.find(g => e.virtue >= g.minVirtue && g.power <= 2);
      if (gdef) {
        hdState.courtLog.unshift({ tick:hdState.tickCount, msg:`✨ Thiên Đạo tự động ban ân ${name} (công đức ${Math.round(e.virtue)}) — ${gdef.name}`, type:'auto' });
        hdGrantGrace(name, gdef.id, true);
      }
    }
  });
}

// ─── RENDER ───────────────────────────────────────────────────

let _hdTab = 'court';
function hdSwitchTab(t) { _hdTab = t; hdRenderPanel(); }

function hdRenderPanel() {
  const el = document.getElementById('panel-heavenly-dao');
  if (!el) return;

  const cArr = (typeof countries !== 'undefined' && Array.isArray(countries)) ? countries : [];
  const sorted = cArr.filter(c => c.name).map(c => {
    const e = hdGetEntry(c.name);
    return { ...c, ...e, netKarma: e.virtue - e.sin };
  }).sort((a,b) => b.sin - a.sin);

  const tabs = [
    { id:'court',   label:'⚖️ Phán Đường' },
    { id:'sin',     label:`🔥 Tội Nghiệp (${Object.keys(hdState.registry).length})` },
    { id:'virtue',  label:'🌟 Công Đức' },
    { id:'active',  label:`⚡ Đang Thi Hành (${hdState.activeTribulations.length + hdState.activeGraces.length})` },
    { id:'history', label:`📜 Thiên Sử (${hdState.verdictHistory.length})` },
  ];

  el.innerHTML = `
    <div style="padding:12px 16px;background:linear-gradient(135deg,#0a0510,#1a0a2e,#0a0510);min-height:100%;font-family:'Segoe UI',sans-serif;color:#e2e8f0;">
      <h2 style="margin:0 0 4px;font-size:20px;color:#fbbf24;text-shadow:0 0 16px #f59e0b;">⚖️ Thiên Đạo Phán Xét</h2>
      <p style="margin:0 0 12px;font-size:12px;color:#92400e;font-style:italic;">Heavenly Dao Tribunal V1 — Giám Sát · Phán Xét · Ban Ân · Trừng Phạt</p>

      <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;align-items:center;">
        ${tabs.map(t=>`<button onclick="hdSwitchTab('${t.id}')" style="padding:6px 12px;border-radius:8px;border:none;cursor:pointer;font-size:12px;font-weight:600;background:${_hdTab===t.id?'#78350f':'#1c1003'};color:${_hdTab===t.id?'#fde68a':'#92400e'};border:1px solid ${_hdTab===t.id?'#d97706':'#374151'};">${t.label}</button>`).join('')}
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#92400e;margin-left:auto;cursor:pointer;">
          <input type="checkbox" ${hdState.autoEnabled?'checked':''} onchange="hdState.autoEnabled=this.checked">
          AI tự động phán xét
        </label>
      </div>

      ${_hdTab==='court'   ? _hdRenderCourt(sorted)   : ''}
      ${_hdTab==='sin'     ? _hdRenderSin(sorted)     : ''}
      ${_hdTab==='virtue'  ? _hdRenderVirtue(sorted)  : ''}
      ${_hdTab==='active'  ? _hdRenderActive()        : ''}
      ${_hdTab==='history' ? _hdRenderHistory()       : ''}
    </div>`;
}

function _hdRenderCourt(sorted) {
  const evil   = sorted.filter(c => c.sin > 30).slice(0, 3);
  const saints  = [...sorted].sort((a,b) => b.virtue - a.virtue).filter(c => c.virtue > 20).slice(0, 3);
  const cArr   = (typeof countries !== 'undefined' && Array.isArray(countries)) ? countries : [];

  return `
    <!-- Top 3 evil + top 3 saints -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
      <!-- Evil -->
      <div style="background:#1a0505;border:1px solid #7f1d1d;border-radius:12px;padding:14px;">
        <div style="font-size:13px;font-weight:700;color:#f87171;margin-bottom:10px;">☠️ Đại Tội Nhân (Top 3)</div>
        ${evil.length ? evil.map(c => {
          const sm = STATUS_META[c.status] || STATUS_META.neutral;
          return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #2d0707;">
            <div>
              <span style="font-size:13px;">${sm.icon}</span>
              <span style="font-size:12px;font-weight:600;color:${sm.color};margin-left:6px;">${c.name}</span>
            </div>
            <span style="font-size:12px;color:#f87171;font-weight:700;">${Math.round(c.sin)} tội</span>
          </div>`;
        }).join('') : '<div style="font-size:12px;color:#6b7280;padding:8px 0;">Chưa có tội nhân nào.</div>'}
      </div>
      <!-- Virtuous -->
      <div style="background:#020d02;border:1px solid #14532d;border-radius:12px;padding:14px;">
        <div style="font-size:13px;font-weight:700;color:#4ade80;margin-bottom:10px;">🌟 Thánh Nhân (Top 3)</div>
        ${saints.length ? saints.map(c => {
          const sm = STATUS_META[c.status] || STATUS_META.neutral;
          return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #052e16;">
            <div>
              <span style="font-size:13px;">${sm.icon}</span>
              <span style="font-size:12px;font-weight:600;color:${sm.color};margin-left:6px;">${c.name}</span>
            </div>
            <span style="font-size:12px;color:#4ade80;font-weight:700;">${Math.round(c.virtue)} đức</span>
          </div>`;
        }).join('') : '<div style="font-size:12px;color:#6b7280;padding:8px 0;">Chưa có thánh nhân nào.</div>'}
      </div>
    </div>

    <!-- Issue Verdict / Grant Grace controls -->
    <div style="background:#1c1003;border:1px solid #92400e;border-radius:12px;padding:14px;margin-bottom:12px;">
      <div style="font-size:13px;font-weight:700;color:#fbbf24;margin-bottom:12px;">🔱 Đấng Tạo Hóa Phán Quyết</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">

        <!-- Verdict (punishment) -->
        <div style="background:#1a0505;border:1px solid #7f1d1d;border-radius:8px;padding:12px;">
          <div style="font-size:12px;color:#f87171;font-weight:600;margin-bottom:8px;">⚡ Giáng Trừng Phạt</div>
          <select id="hd-verdict-target" style="width:100%;padding:5px 8px;border-radius:6px;background:#0f172a;color:#e2e8f0;border:1px solid #374151;font-size:12px;margin-bottom:6px;">
            <option value="">— Chọn thế lực —</option>
            ${cArr.filter(c=>c.name).map(c=>`<option value="${c.name}">${c.name} (tội: ${Math.round(hdGetEntry(c.name).sin)})</option>`).join('')}
          </select>
          <select id="hd-verdict-type" style="width:100%;padding:5px 8px;border-radius:6px;background:#0f172a;color:#e2e8f0;border:1px solid #374151;font-size:12px;margin-bottom:8px;">
            ${HD_VERDICTS.map(v=>`<option value="${v.id}">${v.icon} ${v.name} (≥${v.minSin} tội)</option>`).join('')}
          </select>
          <button onclick="hdActionVerdict()" style="width:100%;padding:7px;border-radius:6px;border:none;cursor:pointer;font-size:12px;font-weight:700;background:#dc2626;color:#fff;">⚡ BAN PHÁN QUYẾT</button>
          <div id="hd-verdict-msg" style="font-size:11px;margin-top:6px;min-height:14px;"></div>
        </div>

        <!-- Grace (reward) -->
        <div style="background:#020d02;border:1px solid #14532d;border-radius:8px;padding:12px;">
          <div style="font-size:12px;color:#4ade80;font-weight:600;margin-bottom:8px;">🌟 Ban Ân Điển</div>
          <select id="hd-grace-target" style="width:100%;padding:5px 8px;border-radius:6px;background:#0f172a;color:#e2e8f0;border:1px solid #374151;font-size:12px;margin-bottom:6px;">
            <option value="">— Chọn thế lực —</option>
            ${cArr.filter(c=>c.name).map(c=>`<option value="${c.name}">${c.name} (đức: ${Math.round(hdGetEntry(c.name).virtue)})</option>`).join('')}
          </select>
          <select id="hd-grace-type" style="width:100%;padding:5px 8px;border-radius:6px;background:#0f172a;color:#e2e8f0;border:1px solid #374151;font-size:12px;margin-bottom:8px;">
            ${HD_GRACES.map(g=>`<option value="${g.id}">${g.icon} ${g.name} (≥${g.minVirtue} đức)</option>`).join('')}
          </select>
          <button onclick="hdActionGrace()" style="width:100%;padding:7px;border-radius:6px;border:none;cursor:pointer;font-size:12px;font-weight:700;background:#16a34a;color:#fff;">🌟 BAN ÂN ĐIỂN</button>
          <div id="hd-grace-msg" style="font-size:11px;margin-top:6px;min-height:14px;"></div>
        </div>
      </div>
    </div>

    <!-- Court log -->
    <div style="font-size:13px;font-weight:700;color:#fbbf24;margin-bottom:8px;">📜 Nhật Ký Thiên Đình</div>
    <div style="max-height:220px;overflow-y:auto;">
      ${hdState.courtLog.slice(0,40).map(entry => {
        const color = entry.type==='verdict'?'#f87171':entry.type==='grace'?'#4ade80':'#fbbf24';
        return `<div style="padding:6px 10px;background:#0f0a00;border-left:3px solid ${color};border-radius:4px;margin-bottom:4px;font-size:11px;color:#e2e8f0;">${entry.msg} <span style="color:#4b5563;font-size:10px;margin-left:6px;">tắc ${entry.tick}</span></div>`;
      }).join('') || '<div style="font-size:12px;color:#6b7280;padding:12px;">Chưa có phán quyết nào.</div>'}
    </div>`;
}

function _hdRenderSin(sorted) {
  const sinful = sorted.filter(c => c.sin > 0);
  if (!sinful.length) return `<div style="text-align:center;padding:40px;color:#6b7280;"><div style="font-size:40px;margin-bottom:10px;">🕊️</div>Thiên hạ trong sạch — không ai có tội nghiệp.</div>`;

  return `<div style="max-height:560px;overflow-y:auto;">
    ${sinful.map(c => {
      const sm = STATUS_META[c.status] || STATUS_META.neutral;
      const sinPct = Math.min(100, Math.round(c.sin / 1.5));
      const e = hdGetEntry(c.name);
      return `
        <div style="background:#0d0205;border:1px solid #7f1d1d44;border-radius:12px;padding:14px;margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div>
              <span style="font-size:18px;">${sm.icon}</span>
              <span style="font-size:14px;font-weight:700;color:${sm.color};margin-left:8px;">${c.name}</span>
              <span style="font-size:10px;padding:2px 8px;border-radius:20px;background:#450a0a;color:${sm.color};margin-left:6px;">${sm.label}</span>
            </div>
            <div style="text-align:right;">
              <div style="font-size:16px;font-weight:700;color:#f87171;">${Math.round(c.sin)}</div>
              <div style="font-size:10px;color:#6b7280;">tội nghiệp</div>
            </div>
          </div>
          <div style="height:5px;background:#1f2937;border-radius:4px;overflow:hidden;margin-bottom:8px;">
            <div style="height:100%;width:${sinPct}%;background:linear-gradient(90deg,#dc2626,#f87171);border-radius:4px;"></div>
          </div>
          <!-- Recent sin log -->
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">
            ${(e.sinLog||[]).slice(0,5).map(s=>`<span style="font-size:10px;padding:2px 8px;border-radius:20px;background:#450a0a;color:#f87171;">${s.icon} ${s.name} +${s.amount}</span>`).join('')}
          </div>
          <!-- Quick actions -->
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${HD_VERDICTS.filter(v => c.sin >= v.minSin * 0.7).map(v=>`<button onclick="hdActionQuickVerdict('${c.name}','${v.id}')" style="padding:4px 8px;border-radius:6px;border:none;cursor:pointer;font-size:10px;font-weight:600;background:#450a0a;color:#f87171;">${v.icon} ${v.name}</button>`).join('')}
          </div>
        </div>`;
    }).join('')}
  </div>`;
}

function _hdRenderVirtue(sorted) {
  const virtuous = [...sorted].sort((a,b) => b.virtue - a.virtue).filter(c => c.virtue > 0);
  if (!virtuous.length) return `<div style="text-align:center;padding:40px;color:#6b7280;"><div style="font-size:40px;margin-bottom:10px;">⚖️</div>Chưa có ai tích lũy công đức.</div>`;
  return `<div style="max-height:560px;overflow-y:auto;">
    ${virtuous.map(c => {
      const sm = STATUS_META[c.status] || STATUS_META.neutral;
      const virPct = Math.min(100, Math.round(c.virtue / 1.5));
      const e = hdGetEntry(c.name);
      return `
        <div style="background:#020d03;border:1px solid #14532d44;border-radius:12px;padding:14px;margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div>
              <span style="font-size:18px;">${sm.icon}</span>
              <span style="font-size:14px;font-weight:700;color:${sm.color};margin-left:8px;">${c.name}</span>
              <span style="font-size:10px;padding:2px 8px;border-radius:20px;background:#052e16;color:${sm.color};margin-left:6px;">${sm.label}</span>
              ${e.consecrated?'<span style="font-size:10px;padding:2px 8px;border-radius:20px;background:#78350f;color:#fbbf24;margin-left:4px;">🌺 Thần Thánh</span>':''}
            </div>
            <div style="text-align:right;">
              <div style="font-size:16px;font-weight:700;color:#4ade80;">${Math.round(c.virtue)}</div>
              <div style="font-size:10px;color:#6b7280;">công đức</div>
            </div>
          </div>
          <div style="height:5px;background:#1f2937;border-radius:4px;overflow:hidden;margin-bottom:8px;">
            <div style="height:100%;width:${virPct}%;background:linear-gradient(90deg,#16a34a,#4ade80);border-radius:4px;"></div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">
            ${(e.virtueLog||[]).slice(0,5).map(v=>`<span style="font-size:10px;padding:2px 8px;border-radius:20px;background:#052e16;color:#4ade80;">${v.icon} ${v.name} +${v.amount}</span>`).join('')}
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${HD_GRACES.filter(g => c.virtue >= g.minVirtue * 0.7).map(g=>`<button onclick="hdActionQuickGrace('${c.name}','${g.id}')" style="padding:4px 8px;border-radius:6px;border:none;cursor:pointer;font-size:10px;font-weight:600;background:#052e16;color:#4ade80;">${g.icon} ${g.name}</button>`).join('')}
          </div>
        </div>`;
    }).join('')}
  </div>`;
}

function _hdRenderActive() {
  const noActive = !hdState.activeTribulations.length && !hdState.activeGraces.length;
  if (noActive) return `<div style="text-align:center;padding:40px;color:#6b7280;"><div style="font-size:40px;">⚖️</div>Không có phán quyết nào đang thi hành.</div>`;
  return `<div>
    ${hdState.activeTribulations.length ? `
      <div style="font-size:13px;font-weight:700;color:#f87171;margin-bottom:10px;">⚡ Đang Trừng Phạt (${hdState.activeTribulations.length})</div>
      ${hdState.activeTribulations.map(t=>`
        <div style="background:#1a0505;border:1px solid #7f1d1d;border-radius:10px;padding:12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
          <div><span style="font-size:18px;">${t.icon}</span> <span style="font-size:13px;color:#f87171;font-weight:600;">${t.name}</span> → <span style="color:#94a3b8;">${t.target}</span></div>
          <span style="font-size:11px;color:#6b7280;">Còn ${t.ticksLeft} tắc</span>
        </div>`).join('')}
    ` : ''}
    ${hdState.activeGraces.length ? `
      <div style="font-size:13px;font-weight:700;color:#4ade80;margin:10px 0;">🌟 Đang Nhận Ân Điển (${hdState.activeGraces.length})</div>
      ${hdState.activeGraces.map(g=>`
        <div style="background:#020d03;border:1px solid #14532d;border-radius:10px;padding:12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
          <div><span style="font-size:18px;">${g.icon}</span> <span style="font-size:13px;color:#4ade80;font-weight:600;">${g.name}</span> → <span style="color:#94a3b8;">${g.target}</span></div>
          <span style="font-size:11px;color:#6b7280;">Còn ${g.ticksLeft} tắc</span>
        </div>`).join('')}
    ` : ''}
  </div>`;
}

function _hdRenderHistory() {
  if (!hdState.verdictHistory.length) return `<div style="text-align:center;padding:40px;color:#6b7280;">Thiên Đình chưa ban phán quyết nào.</div>`;
  return `<div style="max-height:560px;overflow-y:auto;">
    ${hdState.verdictHistory.slice(0,60).map(h => {
      const isVerdict = h.type === 'verdict';
      const color = isVerdict ? '#f87171' : '#4ade80';
      const bg    = isVerdict ? '#1a0505' : '#020d03';
      const border= isVerdict ? '#7f1d1d' : '#14532d';
      return `<div style="background:${bg};border:1px solid ${border};border-radius:8px;padding:10px 12px;margin-bottom:6px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <div style="font-size:13px;font-weight:600;color:${color};">${h.icon} ${isVerdict?h.verdictName:h.graceName}</div>
          <div style="font-size:10px;color:#6b7280;">tắc ${h.tick}</div>
        </div>
        <div style="font-size:11px;color:#94a3b8;">Đối tượng: <b style="color:${color};">${h.target}</b></div>
        <div style="font-size:11px;color:#64748b;margin-top:2px;">${h.effectDesc}</div>
      </div>`;
    }).join('')}
  </div>`;
}

// ─── CALLBACKS ────────────────────────────────────────────────

window.hdSwitchTab = hdSwitchTab;

window.hdActionVerdict = function() {
  const target = document.getElementById('hd-verdict-target')?.value;
  const type   = document.getElementById('hd-verdict-type')?.value;
  const msg    = document.getElementById('hd-verdict-msg');
  if (!target) { if(msg){msg.style.color='#f87171';msg.textContent='⚠️ Chọn thế lực';} return; }
  const r = hdIssueVerdict(target, type, true);
  if (msg) { msg.style.color=r.ok?'#4ade80':'#f87171'; msg.textContent = r.ok ? `✅ ${r.effectDesc}` : `⚠️ ${r.msg}`; }
  setTimeout(hdRenderPanel, 300);
};

window.hdActionGrace = function() {
  const target = document.getElementById('hd-grace-target')?.value;
  const type   = document.getElementById('hd-grace-type')?.value;
  const msg    = document.getElementById('hd-grace-msg');
  if (!target) { if(msg){msg.style.color='#f87171';msg.textContent='⚠️ Chọn thế lực';} return; }
  const r = hdGrantGrace(target, type, true);
  if (msg) { msg.style.color=r.ok?'#4ade80':'#f87171'; msg.textContent = r.ok ? `✅ ${r.effectDesc}` : `⚠️ ${r.msg}`; }
  setTimeout(hdRenderPanel, 300);
};

window.hdActionQuickVerdict = function(name, verdictId) {
  const r = hdIssueVerdict(name, verdictId, true);
  if (typeof addLog === 'function' && !r.ok) addLog(`[Thiên Đạo] ⚠️ ${r.msg}`);
  setTimeout(hdRenderPanel, 200);
};

window.hdActionQuickGrace = function(name, graceId) {
  const r = hdGrantGrace(name, graceId, true);
  if (typeof addLog === 'function' && !r.ok) addLog(`[Thiên Đạo] ⚠️ ${r.msg}`);
  setTimeout(hdRenderPanel, 200);
};

window.hdAddSin     = hdAddSin;
window.hdAddVirtue  = hdAddVirtue;
window.hdTick       = hdTick;
window.hdRenderPanel= hdRenderPanel;
window.hdState      = hdState;
window.hdGetEntry   = hdGetEntry;

// ─── TICK HOOK ────────────────────────────────────────────────

(function hdHookTick() {
  const tryHook = () => {
    if (typeof window.advanceTime === 'function' && !window._hdTickHooked) {
      window._hdTickHooked = true;
      const _oa = window.advanceTime;
      window.advanceTime = function() {
        _oa.apply(this, arguments);
        try { hdTick(); } catch(e) {}
      };
    }
  };
  tryHook();
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(tryHook, 3000);
    setInterval(() => { try { hdTick(); } catch(e){} }, 4500);
  });
})();

console.log('[HeavenlyDaoEngine V1] ⚖️ Thiên Đạo Phán Xét khởi động — Karma · Phán Quyết · Ân Điển · AI Giám Sát sẵn sàng.');
