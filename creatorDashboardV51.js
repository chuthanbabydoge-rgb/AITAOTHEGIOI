(function() {
"use strict";
// ============================================================
// CREATOR DASHBOARD V51 — Creator God Online
// Patches creator-hub-v32: thêm 6 tabs mới
// God Mode · Thiên Ý · Thần Tích · Thiên Khải · Sự Kiện TG · Audit
// EXPAND ONLY · KHÔNG GHI ĐÈ bất kỳ file cũ
// ============================================================
const INIT_DELAY = 6700;

const V51_TABS = [
  { id:"god-mode-v51",     icon:"👁️",  label:"God Mode",    fn:"v51RenderGodMode"     },
  { id:"divine-will-v51",  icon:"📜",  label:"Thiên Ý",     fn:"v51RenderDivineWill"  },
  { id:"miracles-v51",     icon:"✨",  label:"Thần Tích",   fn:"v51RenderMiracles"    },
  { id:"prophecies-v51",   icon:"🔮",  label:"Thiên Khải",  fn:"v51RenderProphecies"  },
  { id:"world-events-v51", icon:"⚡",  label:"Sự Kiện TG",  fn:"v51RenderWorldEvents" },
  { id:"god-audit-v51",    icon:"📊",  label:"Audit",       fn:"v51RenderAudit"       }
];

// ─── STYLE HELPER ────────────────────────────────────────────────────────────
function card(content, bg) {
  return '<div style="background:'+(bg||'#0f172a')+';border:1px solid #1e293b;border-radius:8px;padding:12px;margin-bottom:8px">'+content+'</div>';
}
function badge(text, color) {
  return '<span style="background:'+(color||'#1e293b')+'33;color:'+(color||'#94a3b8')+';border:1px solid '+(color||'#94a3b8')+'44;border-radius:4px;padding:2px 7px;font-size:10px;font-weight:bold">'+text+'</span>';
}
function btn(label, onclick, color) {
  return '<button onclick="'+onclick+'" style="background:'+(color||'#1e40af')+'22;border:1px solid '+(color||'#1e40af')+'66;color:'+(color||'#60a5fa')+';border-radius:6px;padding:6px 12px;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif;margin:3px;transition:all 0.2s" onmouseover="this.style.opacity=\'0.8\'" onmouseout="this.style.opacity=\'1\'">'+label+'</button>';
}
function section(title, icon, content, color) {
  return '<div style="margin-bottom:12px"><div style="font-size:12px;font-weight:bold;color:'+(color||'#94a3b8')+';margin-bottom:6px;border-bottom:1px solid #1e293b;padding-bottom:4px">'+icon+' '+title+'</div>'+content+'</div>';
}
function statBox(label, value, color) {
  return '<div style="text-align:center;background:#0f172a;border:1px solid #1e293b;border-radius:6px;padding:10px 8px;flex:1;min-width:70px">'+
    '<div style="font-size:18px;font-weight:bold;color:'+(color||'#e2e8f0')+'">'+value+'</div>'+
    '<div style="font-size:9px;color:#475569;margin-top:2px">'+label+'</div>'+
  '</div>';
}
function row(items) {
  return '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">'+items.join('')+'</div>';
}

// ─── RENDER: GOD MODE DASHBOARD ──────────────────────────────────────────────
window.v51RenderGodMode = function() {
  const el = document.getElementById("panel-god-mode-v51");
  if (!el) return;

  // Stats
  const pop    = typeof window.npcs !== 'undefined' ? window.npcs.filter(function(n){ return n.status==='alive'; }).length : 0;
  const kCount = typeof window.kingdomData !== 'undefined' ? (Array.isArray(window.kingdomData.kingdoms) ? window.kingdomData.kingdoms : Object.values(window.kingdomData.kingdoms||{})).length : 0;
  const eCount = typeof window.empireData !== 'undefined' ? (Array.isArray(window.empireData.empires) ? window.empireData.empires : Object.values(window.empireData.empires||{})).length : 0;
  const dCount = typeof window.divineBeingData !== 'undefined' ? (window.divineBeingData.beings||[]).length : 0;
  const wCount = typeof window.warsActive !== 'undefined' ? (window.warsActive||[]).length : 0;
  const uCount = typeof window.multiverseData !== 'undefined' ? (window.multiverseData.universes||[]).length : 0;
  const yr     = typeof year !== 'undefined' ? year : 0;

  const energy = typeof window.cgv51GetEnergy === 'function' ? window.cgv51GetEnergy() : 1000;
  const maxE   = typeof window.cgv51GetMaxEnergy === 'function' ? window.cgv51GetMaxEnergy() : 1000;
  const energyPct = Math.round((energy/maxE)*100);
  const energyColor = energyPct > 60 ? '#22c55e' : energyPct > 30 ? '#fbbf24' : '#ef4444';

  // Active events & effects
  const activeEvents  = typeof window.cgv51GetActiveGlobalEvents === 'function' ? window.cgv51GetActiveGlobalEvents() : [];
  const activeMiracles= typeof window.cgv51GetActiveEffects === 'function' ? window.cgv51GetActiveEffects() : [];
  const activeProphecies = typeof window.cgv51GetActiveProphecies === 'function' ? window.cgv51GetActiveProphecies() : [];

  // Jarvis
  const jarvis = typeof window.cgv51GetJarvisReport === 'function' ? window.cgv51GetJarvisReport() : { warnings:[], suggestions:[], topIssue:'Loading...' };

  let html = '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0;overflow-y:auto">';

  // Header
  html += '<div style="text-align:center;padding:8px 0 12px;border-bottom:1px solid #1e293b;margin-bottom:12px">';
  html += '<div style="font-size:20px;font-weight:bold;color:#facc15">👁️ CREATOR GOD V51</div>';
  html += '<div style="font-size:11px;color:#64748b;margin-top:2px">Năm '+yr+' · God Mode Active</div>';
  html += '</div>';

  // Thiên Năng bar
  html += card(
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'+
      '<span style="font-size:11px;color:#94a3b8">⚡ Thiên Năng</span>'+
      '<span style="font-size:12px;font-weight:bold;color:'+energyColor+'">'+energy.toFixed(0)+' / '+maxE+'</span>'+
    '</div>'+
    '<div style="background:#0f172a;border-radius:4px;height:8px;overflow:hidden">'+
      '<div style="width:'+energyPct+'%;height:100%;background:'+energyColor+';transition:width 0.3s;border-radius:4px"></div>'+
    '</div>'
  );

  // World stats
  html += section('Tổng Quan Thế Giới', '🌍',
    row([
      statBox('Sinh Linh', pop, '#22c55e'),
      statBox('Vương Quốc', kCount, '#60a5fa'),
      statBox('Đế Chế', eCount, '#f59e0b'),
      statBox('Thần Linh', dCount, '#a78bfa'),
      statBox('Chiến Tranh', wCount, '#ef4444'),
      statBox('Vũ Trụ', uCount, '#38bdf8')
    ]), '#94a3b8');

  // Active God Effects
  const allActive = activeEvents.concat(activeMiracles);
  if (allActive.length > 0) {
    html += section('Hiệu Ứng Đang Hoạt Động', '✨',
      allActive.slice(0,6).map(function(e){
        return card('<span style="color:'+(e.color||'#fbbf24')+'">'+e.icon+' '+e.label+'</span>'+
          ' <span style="color:#475569;font-size:10px">→ '+(e.target||'Toàn TG')+'</span>'+
          (e.expiresYear ? ' <span style="color:#334155;font-size:10px">(đến năm '+e.expiresYear+')</span>' : ''), '#0a0f1a');
      }).join(''), '#22c55e');
  }

  // Active Prophecies
  if (activeProphecies.length > 0) {
    html += section('Lời Tiên Tri Đang Chờ', '🔮',
      activeProphecies.slice(0,3).map(function(p){
        return card('<div style="color:'+(p.color||'#a78bfa')+';font-size:11px">'+p.icon+' '+p.label+' — <em>'+p.subject+'</em></div>'+
          '<div style="color:#64748b;font-size:10px;margin-top:3px">"'+p.text.substring(0,80)+'..."</div>'+
          '<div style="color:#334155;font-size:9px;margin-top:2px">Ứng nghiệm khoảng năm '+p.fulfillsInYear+'</div>', '#0a0f1a');
      }).join(''), '#7c3aed');
  }

  // Jarvis analysis
  html += section('🤖 Jarvis God Mode', 'Phân Tích',
    card(
      '<div style="font-size:11px;color:#fbbf24;margin-bottom:6px">'+jarvis.topIssue+'</div>'+
      (jarvis.warnings.length > 1 ? jarvis.warnings.slice(1).map(function(w){ return '<div style="font-size:10px;color:#ef4444;margin:2px 0">'+w+'</div>'; }).join('') : '')+
      (jarvis.suggestions.length > 0 ? '<div style="margin-top:6px">'+jarvis.suggestions.map(function(s){ return '<div style="font-size:10px;color:#22c55e;margin:2px 0">'+s+'</div>'; }).join('')+'</div>' : ''), '#0a0f1a'),
  '#64748b');

  // Quick Actions
  html += section('Hành Động Nhanh', '⚡',
    btn('🌾 Mưa Tài Nguyên','v51QuickMiracle("resource_rain")','#84cc16')+
    btn('⚔️ Thiên Hạ Đại Hội','v51QuickEvent("celestial_tournament")','#ef4444')+
    btn('🎉 Lễ Hội','v51QuickEvent("festival")','#fbbf24')+
    btn('✨ Kỷ Vàng','v51QuickEvent("golden_age")','#f59e0b')+
    btn('🔮 Tạo Tiên Tri','v51QuickProphecy()','#7c3aed')+
    btn('🔄 Làm Mới','v51RenderGodMode()','#475569'),
  '#60a5fa');

  html += '</div>';
  el.innerHTML = html;
};

// ─── RENDER: DIVINE WILL ─────────────────────────────────────────────────────
window.v51RenderDivineWill = function() {
  const el = document.getElementById("panel-divine-will-v51");
  if (!el) return;
  const decreeTypes   = typeof window.cgv51GetDecreeTypes  === 'function' ? window.cgv51GetDecreeTypes()  : [];
  const blessingTypes = typeof window.cgv51GetBlessingTypes=== 'function' ? window.cgv51GetBlessingTypes(): [];
  const curseTypes    = typeof window.cgv51GetCurseTypes   === 'function' ? window.cgv51GetCurseTypes()   : [];
  const stats         = typeof window.cgv51GetStats        === 'function' ? window.cgv51GetStats()        : {};
  const energy        = typeof window.cgv51GetEnergy       === 'function' ? window.cgv51GetEnergy()       : 0;

  let html = '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">';

  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">';
  html += '<span style="font-size:13px;font-weight:bold;color:#facc15">📜 Thiên Ý — Divine Will</span>';
  html += '<span style="font-size:11px;color:#64748b">⚡ Thiên Năng: '+energy.toFixed(0)+'</span>';
  html += '</div>';

  // Decrees
  html += section('Sắc Lệnh Thiên Ý', '👑',
    decreeTypes.map(function(t){
      return card(
        '<div style="display:flex;justify-content:space-between;align-items:center">'+
          '<div><span style="font-size:14px">'+t.icon+'</span> <span style="font-size:11px;font-weight:bold;color:#facc15">'+t.label+'</span></div>'+
          '<span style="font-size:10px;color:#fbbf24">⚡ '+t.energyCost+'</span>'+
        '</div>'+
        '<div style="font-size:10px;color:#64748b;margin:3px 0 6px">'+t.desc+'</div>'+
        btn('Ban Sắc Lệnh','cgv51IssueDecree("'+t.id+'",null)&&v51RenderDivineWill()','#facc15'),
      energy < t.energyCost ? '#1a0a0a' : '#0a0f1a');
    }).join(''), '#facc15');

  // Blessings
  html += section('Ban Phước', '💚',
    blessingTypes.map(function(t){
      return card(
        '<div style="display:flex;justify-content:space-between;align-items:center">'+
          '<div><span style="font-size:14px">'+t.icon+'</span> <span style="font-size:11px;font-weight:bold;color:#22c55e">'+t.label+'</span></div>'+
          '<span style="font-size:10px;color:#fbbf24">⚡ '+t.cost+'</span>'+
        '</div>'+
        '<div style="font-size:10px;color:#64748b;margin:3px 0 6px">'+t.desc+'</div>'+
        btn('Ban Phước','cgv51BlessEntity("'+t.id+'",null)&&v51RenderDivineWill()','#22c55e'),
      '#0a0f1a');
    }).join(''), '#22c55e');

  // Curses
  html += section('Trừng Phạt', '🔴',
    curseTypes.map(function(t){
      return card(
        '<div style="display:flex;justify-content:space-between;align-items:center">'+
          '<div><span style="font-size:14px">'+t.icon+'</span> <span style="font-size:11px;font-weight:bold;color:#ef4444">'+t.label+'</span></div>'+
          '<span style="font-size:10px;color:#fbbf24">⚡ '+t.cost+'</span>'+
        '</div>'+
        '<div style="font-size:10px;color:#64748b;margin:3px 0 6px">'+t.desc+'</div>'+
        btn('Trừng Phạt','cgv51CurseEntity("'+t.id+'",null)&&v51RenderDivineWill()','#ef4444'),
      '#0a0f1a');
    }).join(''), '#ef4444');

  // History
  const decrees  = typeof window.cgv51GetDecrees   === 'function' ? window.cgv51GetDecrees()   : [];
  const blessings= typeof window.cgv51GetBlessings === 'function' ? window.cgv51GetBlessings()  : [];
  const curses   = typeof window.cgv51GetCurses    === 'function' ? window.cgv51GetCurses()     : [];
  const recent   = decrees.concat(blessings, curses).sort(function(a,b){ return b.year - a.year; }).slice(0,8);
  if (recent.length > 0) {
    html += section('Lịch Sử Gần Nhất', '📜',
      recent.map(function(e){
        return '<div style="font-size:10px;color:#64748b;padding:3px 0;border-bottom:1px solid #1e293b">'+
          e.icon+' <span style="color:#94a3b8">'+e.label+'</span> → <span style="color:#475569">'+e.target+'</span>'+
          (e.active ? badge('Active','#22c55e') : badge('Ended','#475569'))+'</div>';
      }).join(''), '#94a3b8');
  }

  html += '</div>';
  el.innerHTML = html;
};

// ─── RENDER: MIRACLES ────────────────────────────────────────────────────────
window.v51RenderMiracles = function() {
  const el = document.getElementById("panel-miracles-v51");
  if (!el) return;
  const types   = typeof window.cgv51GetMiracleTypes   === 'function' ? window.cgv51GetMiracleTypes()   : [];
  const effects = typeof window.cgv51GetActiveEffects  === 'function' ? window.cgv51GetActiveEffects()  : [];
  const history = typeof window.cgv51GetMiracleHistory === 'function' ? window.cgv51GetMiracleHistory() : [];
  const mStats  = typeof window.cgv51GetMiracleStats   === 'function' ? window.cgv51GetMiracleStats()   : {};
  const energy  = typeof window.cgv51GetEnergy         === 'function' ? window.cgv51GetEnergy()         : 0;

  let html = '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">';
  html += '<div style="display:flex;justify-content:space-between;margin-bottom:12px">';
  html += '<span style="font-size:13px;font-weight:bold;color:#f59e0b">✨ Thần Tích — Miracles</span>';
  html += '<span style="font-size:10px;color:#64748b">Tổng: '+mStats.totalCast+' · Active: '+(mStats.activeEffects||0)+' · ⚡ '+energy.toFixed(0)+'</span>';
  html += '</div>';

  if (effects.length > 0) {
    html += section('Hiệu Ứng Đang Hoạt Động', '⚡',
      effects.map(function(e){
        return card(e.icon+' <span style="color:'+e.color+';font-size:11px">'+e.label+'</span> → <span style="color:#64748b;font-size:10px">'+e.target+'</span> <span style="color:#334155;font-size:10px">(đến năm '+e.expiresYear+')</span>', '#0a1a0a');
      }).join(''), '#22c55e');
  }

  html += section('Thư Viện Phép Màu', '📚',
    types.map(function(t){
      return card(
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">'+
          '<div style="flex:1">'+
            '<div><span style="font-size:13px">'+t.icon+'</span> <span style="font-size:11px;font-weight:bold;color:'+t.color+'">'+t.label+'</span></div>'+
            '<div style="font-size:10px;color:#64748b;margin:3px 0">'+t.desc+'</div>'+
            '<div style="font-size:9px;color:#334155;font-style:italic">'+t.effect+'</div>'+
          '</div>'+
          '<div style="text-align:right;flex-shrink:0">'+
            '<div style="font-size:10px;color:#fbbf24;margin-bottom:4px">⚡ '+t.cost+'</div>'+
            btn('Thi Triển','v51QuickMiracle("'+t.id+'")',t.color)+
          '</div>'+
        '</div>', '#0a0f1a');
    }).join(''), '#f59e0b');

  if (history.length > 0) {
    html += section('Lịch Sử Thần Tích', '📜',
      history.slice(0,10).map(function(m){
        return '<div style="display:flex;justify-content:space-between;font-size:10px;padding:3px 0;border-bottom:1px solid #1e293b;color:#64748b">'+
          '<span>'+m.icon+' <span style="color:#94a3b8">'+m.label+'</span> → '+m.target+'</span>'+
          '<span style="color:#334155">Năm '+m.year+'</span>'+
        '</div>';
      }).join(''), '#94a3b8');
  }
  html += '</div>';
  el.innerHTML = html;
};

// ─── RENDER: PROPHECIES ──────────────────────────────────────────────────────
window.v51RenderProphecies = function() {
  const el = document.getElementById("panel-prophecies-v51");
  if (!el) return;
  const types     = typeof window.cgv51GetProphecyTypes       === 'function' ? window.cgv51GetProphecyTypes()       : [];
  const active    = typeof window.cgv51GetActiveProphecies    === 'function' ? window.cgv51GetActiveProphecies()    : [];
  const fulfilled = typeof window.cgv51GetFulfilledProphecies === 'function' ? window.cgv51GetFulfilledProphecies() : [];
  const pStats    = typeof window.cgv51GetProphecyStats       === 'function' ? window.cgv51GetProphecyStats()       : {};

  let html = '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">';
  html += '<div style="display:flex;justify-content:space-between;margin-bottom:12px">';
  html += '<span style="font-size:13px;font-weight:bold;color:#7c3aed">🔮 Thiên Khải — Prophecies</span>';
  html += '<span style="font-size:10px;color:#64748b">Active: '+pStats.active+' · Ứng: '+pStats.fulfilled+' · Thất: '+pStats.failed+'</span>';
  html += '</div>';

  // Create buttons
  html += section('Tạo Lời Tiên Tri', '✍️',
    types.map(function(t){
      return btn(t.icon+' '+t.label,'cgv51CreateProphecy("'+t.id+'",null,null);v51RenderProphecies()',t.color);
    }).join('')+
    '<br><div style="margin-top:6px">'+btn('🔮 Tự Động (Ngẫu Nhiên)','cgv51AutoGenerateProphecy();v51RenderProphecies()','#7c3aed')+'</div>',
  '#7c3aed');

  // Active prophecies
  if (active.length > 0) {
    html += section('Lời Tiên Tri Đang Chờ Ứng Nghiệm', '⏳',
      active.map(function(p){
        return card(
          '<div style="color:'+p.color+';font-size:11px;font-weight:bold;margin-bottom:4px">'+p.icon+' '+p.label+' — '+p.subject+'</div>'+
          '<div style="color:#e2e8f0;font-size:11px;font-style:italic;line-height:1.5">"'+p.text+'"</div>'+
          '<div style="display:flex;justify-content:space-between;margin-top:6px">'+
            '<span style="font-size:9px;color:#334155">Năm ban: '+p.year+' · Ứng nghiệm: ~'+p.fulfillsInYear+'</span>'+
            btn('✅ Ứng Nghiệm','cgv51FulfillProphecy("'+p.id+'");v51RenderProphecies()','#22c55e')+
          '</div>',
        '#0f0a1a');
      }).join(''), '#7c3aed');
  } else {
    html += card('<div style="text-align:center;color:#334155;font-size:11px;padding:8px">Chưa có lời tiên tri nào đang hoạt động</div>');
  }

  // Fulfilled
  if (fulfilled.length > 0) {
    html += section('Đã Ứng Nghiệm ('+fulfilled.length+')', '✅',
      fulfilled.slice(0,5).map(function(p){
        return '<div style="padding:4px 0;border-bottom:1px solid #1e293b;font-size:10px;color:#64748b">'+
          p.icon+' <span style="color:#94a3b8">'+p.subject+'</span> — "'+p.text.substring(0,60)+'..." '+
          badge('Năm '+p.year,'#22c55e')+'</div>';
      }).join(''), '#22c55e');
  }
  html += '</div>';
  el.innerHTML = html;
};

// ─── RENDER: WORLD EVENTS ────────────────────────────────────────────────────
window.v51RenderWorldEvents = function() {
  const el = document.getElementById("panel-world-events-v51");
  if (!el) return;
  const types   = typeof window.cgv51GetGlobalEventTypes   === 'function' ? window.cgv51GetGlobalEventTypes()   : [];
  const active  = typeof window.cgv51GetActiveGlobalEvents === 'function' ? window.cgv51GetActiveGlobalEvents() : [];
  const history = typeof window.cgv51GetEventHistory       === 'function' ? window.cgv51GetEventHistory()       : [];
  const evStats = typeof window.cgv51GetGlobalEventStats   === 'function' ? window.cgv51GetGlobalEventStats()   : {};
  const energy  = typeof window.cgv51GetEnergy             === 'function' ? window.cgv51GetEnergy()             : 0;

  let html = '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">';
  html += '<div style="display:flex;justify-content:space-between;margin-bottom:12px">';
  html += '<span style="font-size:13px;font-weight:bold;color:#f59e0b">⚡ Sự Kiện Toàn Cầu</span>';
  html += '<span style="font-size:10px;color:#64748b">Active: '+evStats.active+' · Tổng: '+evStats.total+' · ⚡ '+energy.toFixed(0)+'</span>';
  html += '</div>';

  if (active.length > 0) {
    html += section('Đang Diễn Ra', '🔴',
      active.map(function(e){
        return card('<div style="display:flex;justify-content:space-between;align-items:center">'+
          '<div><span style="font-size:14px">'+e.icon+'</span> <span style="color:'+e.color+';font-size:11px;font-weight:bold">'+e.label+'</span></div>'+
          '<span style="font-size:9px;color:#334155">kết thúc năm '+e.endsYear+'</span>'+
        '</div>'+
        '<div style="font-size:9px;color:#64748b;margin-top:3px">'+e.effects.slice(0,2).join(' · ')+'</div>', '#0a1a0a');
      }).join(''), '#22c55e');
  }

  html += section('Kích Hoạt Sự Kiện', '⚡',
    types.map(function(t){
      return card(
        '<div style="display:flex;justify-content:space-between;align-items:flex-start">'+
          '<div style="flex:1">'+
            '<div><span style="font-size:14px">'+t.icon+'</span> <span style="font-size:11px;font-weight:bold;color:'+t.color+'">'+t.label+'</span></div>'+
            '<div style="font-size:10px;color:#64748b;margin:3px 0">'+t.desc+'</div>'+
            '<div style="font-size:9px;color:#334155">'+t.effects.slice(0,2).join(' · ')+'</div>'+
          '</div>'+
          '<div style="text-align:right;flex-shrink:0;margin-left:8px">'+
            '<div style="font-size:10px;color:#fbbf24;margin-bottom:4px">⚡ '+t.cost+'</div>'+
            btn('Kích Hoạt','v51QuickEvent("'+t.id+'")',t.color)+
          '</div>'+
        '</div>', '#0a0f1a');
    }).join(''), '#f59e0b');

  if (history.length > 0) {
    html += section('Lịch Sử Sự Kiện', '📜',
      history.slice(0,8).map(function(e){
        return '<div style="display:flex;justify-content:space-between;font-size:10px;padding:3px 0;border-bottom:1px solid #1e293b">'+
          '<span>'+e.icon+' <span style="color:'+e.color+'">'+e.label+'</span></span>'+
          '<span style="color:#334155">Năm '+e.year+'</span>'+
        '</div>';
      }).join(''), '#94a3b8');
  }
  html += '</div>';
  el.innerHTML = html;
};

// ─── RENDER: AUDIT ───────────────────────────────────────────────────────────
window.v51RenderAudit = function() {
  const el = document.getElementById("panel-god-audit-v51");
  if (!el) return;
  const systems = typeof window.cgv51GetAuditSystems === 'function' ? window.cgv51GetAuditSystems() : [];
  const stats   = typeof window.cgv51GetAuditStats   === 'function' ? window.cgv51GetAuditStats()   : {};
  const saves   = typeof window.cgv51GetSaveReport   === 'function' ? window.cgv51GetSaveReport()   : [];
  const jarvis  = typeof window.cgv51GetJarvisReport === 'function' ? window.cgv51GetJarvisReport() : {};

  const active  = systems.filter(function(s){ return s.active; });
  const dormant = systems.filter(function(s){ return !s.active; });

  let html = '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">';
  html += '<div style="font-size:13px;font-weight:bold;color:#94a3b8;margin-bottom:12px">📊 Audit Mode — God Analytics</div>';

  // Summary
  html += row([
    statBox('Hệ Thống Active', active.length, '#22c55e'),
    statBox('Dormant', dormant.length, '#ef4444'),
    statBox('Save Keys', stats.saveKeyCount, '#60a5fa'),
    statBox('Save Size', stats.totalSaveKB+'KB', '#fbbf24'),
    statBox('Sức Khỏe', stats.activePercent+'%', '#a78bfa')
  ]);

  // Warnings & Suggestions from Jarvis
  if (jarvis.warnings && jarvis.warnings.length > 0) {
    html += section('Cảnh Báo', '⚠️',
      card(jarvis.warnings.map(function(w){ return '<div style="font-size:10px;color:#ef4444;margin:2px 0">'+w+'</div>'; }).join(''), '#1a0a0a'),
    '#ef4444');
  }
  if (jarvis.suggestions && jarvis.suggestions.length > 0) {
    html += section('Đề Xuất', '💡',
      card(jarvis.suggestions.map(function(s){ return '<div style="font-size:10px;color:#22c55e;margin:2px 0">'+s+'</div>'; }).join(''), '#0a1a0a'),
    '#22c55e');
  }

  // Active systems
  html += section('Hệ Thống Đang Chạy ('+active.length+')', '✅',
    '<div style="display:flex;flex-wrap:wrap;gap:4px">'+
    active.map(function(s){
      return '<span style="background:#22c55e22;color:#22c55e;border:1px solid #22c55e44;border-radius:4px;padding:2px 6px;font-size:9px">✅ '+s.label+'</span>';
    }).join('')+'</div>', '#22c55e');

  // Dormant systems
  if (dormant.length > 0) {
    html += section('Hệ Thống Chưa Khởi Động ('+dormant.length+')', '⚪',
      '<div style="display:flex;flex-wrap:wrap;gap:4px">'+
      dormant.map(function(s){
        return '<span style="background:#47556922;color:#475569;border:1px solid #47556944;border-radius:4px;padding:2px 6px;font-size:9px">⚪ '+s.label+'</span>';
      }).join('')+'</div>', '#475569');
  }

  // Save report
  html += section('Top Save Keys (by size)', '💾',
    saves.slice(0,12).map(function(k){
      const pct = Math.min(100, Math.round((k.size / (saves[0]?saves[0].size:1))*100));
      return '<div style="margin:3px 0">'+
        '<div style="display:flex;justify-content:space-between;font-size:9px;color:#64748b;margin-bottom:2px">'+
          '<span>'+k.key.replace('cgv6_','')+'</span><span>'+k.sizeKB+' KB</span>'+
        '</div>'+
        '<div style="background:#0f172a;border-radius:2px;height:4px">'+
          '<div style="width:'+pct+'%;height:100%;background:#3b82f6;border-radius:2px"></div>'+
        '</div>'+
      '</div>';
    }).join(''), '#60a5fa');

  html += '</div>';
  el.innerHTML = html;
};

// ─── QUICK ACTION HELPERS (global) ───────────────────────────────────────────
window.v51QuickMiracle = function(typeId) {
  if (typeof window.cgv51CastMiracle === 'function') {
    const result = window.cgv51CastMiracle(typeId, null);
    if (typeof window.toast === 'function') window.toast(result.msg);
  }
  setTimeout(function(){ window.v51RenderGodMode && window.v51RenderGodMode(); }, 300);
};
window.v51QuickEvent = function(typeId) {
  if (typeof window.cgv51TriggerGlobalEvent === 'function') {
    const result = window.cgv51TriggerGlobalEvent(typeId);
    if (typeof window.toast === 'function') window.toast(result.msg||result.ok);
  }
  setTimeout(function(){ window.v51RenderGodMode && window.v51RenderGodMode(); }, 300);
};
window.v51QuickProphecy = function() {
  if (typeof window.cgv51AutoGenerateProphecy === 'function') {
    const result = window.cgv51AutoGenerateProphecy();
    if (typeof window.toast === 'function') window.toast(result.msg);
  }
  setTimeout(function(){ window.v51RenderGodMode && window.v51RenderGodMode(); }, 300);
};

// ─── PATCH HUB (inject 6 tabs into creator-hub-v32) ─────────────────────────
function patchCreatorHub() {
  const _origHubRender = window.hubRenderPanel;
  if (typeof _origHubRender !== 'function') return;

  window.hubRenderPanel = function(hubId) {
    _origHubRender(hubId);
    if (hubId !== 'creator-hub-v32') return;

    const panel = document.getElementById('panel-creator-hub-v32');
    if (!panel) return;

    // Find tab bar
    const topBar = panel.querySelector('div > div:nth-child(1) > div:nth-child(2)');
    if (!topBar) return;

    // Check if V51 tabs already added
    if (topBar.querySelector('[data-v51tab]')) return;

    V51_TABS.forEach(function(t) {
      const btn2 = document.createElement('button');
      btn2.setAttribute('data-v51tab', t.id);
      btn2.innerHTML = t.icon + ' ' + t.label;
      btn2.style.cssText = 'padding:5px 8px;background:transparent;border:none;border-bottom:2px solid transparent;color:#64748b;cursor:pointer;font-size:11px;white-space:nowrap;transition:all 0.2s;font-family:\'Noto Serif SC\',serif';
      btn2.onclick = function() {
        // Deactivate all
        topBar.querySelectorAll('button').forEach(function(b) {
          b.style.borderBottomColor = 'transparent';
          b.style.color = '#64748b';
        });
        btn2.style.borderBottomColor = '#facc15';
        btn2.style.color = '#facc15';
        // Render content
        const area = document.getElementById('creator-hub-v32-content');
        if (!area) return;
        // Render sub-panel
        if (typeof window[t.fn] === 'function') window[t.fn]();
        const subPanel = document.getElementById('panel-'+t.id);
        if (subPanel && subPanel.innerHTML.trim().length > 10) {
          area.innerHTML = subPanel.innerHTML;
        }
      };
      topBar.appendChild(btn2);
    });
  };
}

function init() {
  patchCreatorHub();
  console.log("[CreatorDashboardV51] 👁️ Creator God Online V51 — 6 tabs mới trong Creator Hub · God Mode · Thiên Ý · Thần Tích · Thiên Khải · Sự Kiện TG · Audit sẵn sàng.");
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
