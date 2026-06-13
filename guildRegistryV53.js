(function() {
"use strict";
// ============================================================
// GUILD REGISTRY V53 — Guild & Empire Online
// Patches player-hub-v28 · 6 tabs: Bang Hội/Liên Minh/Đế Quốc/Lãnh Thổ/Chiến Tranh/BXH
// EXPAND ONLY · Không tạo sidebar tab mới
// ============================================================
const INIT_DELAY = 7700;

const V53_TABS = [
  { id:'guild-v53',     icon:'🏛️', label:'Bang Hội',    fn:'gr53RenderGuild'     },
  { id:'alliance-v53',  icon:'🤝', label:'Liên Minh',   fn:'gr53RenderAlliance'  },
  { id:'empire-v53',    icon:'👑', label:'Đế Quốc',     fn:'gr53RenderEmpire'    },
  { id:'territory-v53', icon:'🗺️', label:'Lãnh Thổ',    fn:'gr53RenderTerritory' },
  { id:'guildwar-v53',  icon:'⚔️', label:'Chiến Tranh', fn:'gr53RenderWar'       },
  { id:'ranking-v53',   icon:'🏆', label:'BXH',         fn:'gr53RenderRanking'   },
];

// ─── STYLE HELPERS ────────────────────────────────────────────
function card(c,bg) { return '<div style="background:'+(bg||'#0f172a')+';border:1px solid #1e293b;border-radius:8px;padding:10px;margin-bottom:6px">'+c+'</div>'; }
function badge(t,col) { return '<span style="background:'+(col||'#1e293b')+'33;color:'+(col||'#94a3b8')+';border:1px solid '+(col||'#94a3b8')+'44;border-radius:4px;padding:2px 6px;font-size:10px;font-weight:bold">'+t+'</span>'; }
function btn(l,oc,col) { return '<button onclick="'+oc+'" style="background:'+(col||'#1e40af')+'22;border:1px solid '+(col||'#1e40af')+'66;color:'+(col||'#60a5fa')+';border-radius:6px;padding:5px 10px;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif;margin:3px;transition:all 0.2s">'+l+'</button>'; }
function section(t,ic,c,col) { return '<div style="margin-bottom:10px"><div style="font-size:11px;font-weight:bold;color:'+(col||'#94a3b8')+';margin-bottom:5px;border-bottom:1px solid #1e293b;padding-bottom:3px">'+ic+' '+t+'</div>'+c+'</div>'; }
function fmt(n) { if(n>=1e6)return (n/1e6).toFixed(1)+'M'; if(n>=1000)return (n/1000).toFixed(1)+'K'; return String(Math.floor(n)); }

// ─── RENDER: BANG HỘI ─────────────────────────────────────────
window.gr53RenderGuild = function() {
  const el = document.getElementById('panel-guild-v53'); if(!el) return;
  const stats   = typeof window.g53GetStats     === 'function' ? window.g53GetStats()     : {};
  const members = typeof window.g53GetMembers   === 'function' ? window.g53GetMembers()   : [];
  const buildings = typeof window.g53GetBuildings === 'function' ? window.g53GetBuildings() : [];
  const quests  = typeof window.g53GetQuests    === 'function' ? window.g53GetQuests()    : [];
  const jarvis  = typeof window.g53GetJarvisReport === 'function' ? window.g53GetJarvisReport() : { tips:[] };
  const hq      = typeof window.g53GetHQ        === 'function' ? window.g53GetHQ()        : {};
  const treasury = typeof window.g53GetTreasury === 'function' ? window.g53GetTreasury()  : {};
  const aiGuilds = typeof window.g53GetAIGuilds === 'function' ? window.g53GetAIGuilds()  : [];

  let html = '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">';
  html += '<div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="font-size:13px;font-weight:bold;color:#60a5fa">🏛️ Bang Hội V53</span><span style="font-size:10px;color:#64748b">'+stats.memberCount+'/'+stats.maxMembers+' TV · Cấp '+stats.guildLevel+'</span></div>';

  // Jarvis tips
  if (jarvis.tips.length > 0) {
    html += card(jarvis.tips.map(function(t){ return '<div style="font-size:10px;color:#fbbf24;margin:2px 0">'+t+'</div>'; }).join(''),'#0a1000');
  }

  // Create guild or show info
  if (!stats.guildName || stats.guildName === '(Chưa có)') {
    html += section('Thành Lập Bang Hội', '✨',
      card('<div style="font-size:10px;color:#64748b;margin-bottom:8px">Chọn loại bang hội để thành lập:</div>'+
        btn('🏛️ Bang Hội','g53CreateGuild("Thiên Long Bang","bangHoi");gr53RenderGuild()','#60a5fa')+
        btn('⚔️ Lính Đánh Thuê','g53CreateGuild("Thiết Huyết Đoàn","linhDao");gr53RenderGuild()','#ef4444')+
        btn('💰 Thương Hội','g53CreateGuild("Vạn Bảo Hội","thuongMai");gr53RenderGuild()','#22c55e')+
        btn('🧭 Hội Thám Hiểm','g53CreateGuild("Phong Vân Hội","thamHiem");gr53RenderGuild()','#f59e0b')));
  } else {
    html += card('<div style="display:flex;justify-content:space-between;align-items:center">'+
      '<div><div style="font-size:14px;font-weight:bold;color:#60a5fa">'+stats.guildName+'</div>'+
      '<div style="font-size:9px;color:#475569">Cấp '+stats.guildLevel+' · Kho quỹ: 🪙'+fmt(treasury.gold||0)+'</div></div>'+
      '<div>'+badge(stats.memberCount+' TV','#3b82f6')+'</div></div>','#0a0f1a');

    // Thành viên
    html += section('Thành Viên ('+members.length+')', '👥',
      members.slice(0,6).map(function(m) {
        return '<div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;padding:3px 0;border-bottom:1px solid #1e293b">'+
          '<span>'+m.icon+' <span style="color:'+(m.rank==='guildMaster'?'#facc15':m.rank==='viceMaster'?'#f59e0b':'#94a3b8')+'">'+m.name+'</span></span>'+
          '<div>'+badge(m.rankName, m.rank==='guildMaster'?'#facc15':'#475569')+
            (m.isNpc&&m.rank!=='guildMaster'?btn('⬆️','g53PromoteMember("'+m.id+'","officer");gr53RenderGuild()','#3b82f6'):'')+'</div>'+
        '</div>';
      }).join('')+
      btn('👋 Chiêu Mộ NPC','g53RecruitNpc();gr53RenderGuild()','#22c55e'));

    // HQ buildings
    const builtIds = hq.buildings || [];
    html += section('Trụ Sở Bang (Cấp '+hq.level+')', '🏗️',
      buildings.filter(function(b){ return b.unlockLevel<=stats.guildLevel; }).slice(0,6).map(function(b) {
        const built = builtIds.includes(b.id);
        return card('<div style="display:flex;justify-content:space-between;align-items:center">'+
          '<div><span style="font-size:12px">'+b.icon+'</span> <span style="font-size:10px;color:'+(built?'#22c55e':'#60a5fa')+'">'+b.name+'</span>'+
          '<div style="font-size:9px;color:#475569">'+b.effect+'</div></div>'+
          '<div style="text-align:right">'+
            (built?badge('Đã Xây','#22c55e'):
              '<div style="font-size:9px;color:#fbbf24">💰 '+b.cost+'</div>'+
              btn('Xây','g53BuildHQ("'+b.id+'");gr53RenderGuild()','#22c55e'))+
          '</div></div>',
          built?'#0a1a0a':'#0f172a');
      }).join(''));

    // Quests
    const gData = typeof window.guildV53Data !== 'undefined' ? window.guildV53Data : {};
    const activeQIds = (gData.activeQuests||[]).map(function(q){ return q.questId; });
    html += section('Nhiệm Vụ Bang', '📜',
      quests.filter(function(q){ return q.minLevel <= stats.guildLevel; }).slice(0,5).map(function(q) {
        const active = activeQIds.includes(q.id);
        return btn((active?'⏳ ':'📜 ')+q.name+' (+'+q.reward.gold+'🪙)', active?'void(0)':'g53AssignQuest("'+q.id+'");gr53RenderGuild()', active?'#475569':'#7c3aed');
      }).join('')+
      btn('🔄','gr53RenderGuild()','#334155'));
  }

  // AI guilds
  html += section('Bang Hội Thế Giới (AI)', '🤖',
    aiGuilds.slice(0,4).map(function(g) {
      return '<div style="display:flex;justify-content:space-between;font-size:10px;padding:2px 0;border-bottom:1px solid #1e293b">'+
        '<span>'+g.icon+' <span style="color:#94a3b8">'+g.name+'</span> '+badge('Cấp '+g.level,'#475569')+'</span>'+
        '<span style="color:#f87171">⚔️ '+g.power+'</span></div>';
    }).join(''));

  html += '</div>';
  el.innerHTML = html;
};

// ─── RENDER: LIÊN MINH ────────────────────────────────────────
window.gr53RenderAlliance = function() {
  const el = document.getElementById('panel-alliance-v53'); if(!el) return;
  const alliances  = typeof window.ga53GetAlliances   === 'function' ? window.ga53GetAlliances()   : [];
  const pacts      = typeof window.ga53GetActivePacts === 'function' ? window.ga53GetActivePacts() : [];
  const pactTypes  = typeof window.ga53GetPactTypes   === 'function' ? window.ga53GetPactTypes()   : [];
  const jarvis     = typeof window.ga53GetJarvisReport === 'function' ? window.ga53GetJarvisReport() : { tips:[], bonuses:{} };
  const aiGuilds   = typeof window.g53GetAIGuilds     === 'function' ? window.g53GetAIGuilds()     : [];
  const stats      = typeof window.ga53GetStats       === 'function' ? window.ga53GetStats()       : {};

  let html = '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">';
  html += '<div style="font-size:13px;font-weight:bold;color:#a78bfa;margin-bottom:10px">🤝 Liên Minh Bang Hội V53</div>';

  if (jarvis.tips.length > 0) {
    html += card(jarvis.tips.map(function(t){ return '<div style="font-size:10px;color:#fbbf24;margin:2px 0">'+t+'</div>'; }).join(''),'#0a0015');
  }

  // Active bonuses
  const bonuses = jarvis.bonuses || {};
  if (bonuses.def||bonuses.atk||bonuses.income) {
    html += card('<div style="font-size:10px;display:flex;gap:8px">'+
      (bonuses.def?'<span style="color:#60a5fa">🛡️ +'+bonuses.def+'% DEF</span>':'')+
      (bonuses.atk?'<span style="color:#ef4444">⚔️ +'+bonuses.atk+'% ATK</span>':'')+
      (bonuses.income?'<span style="color:#22c55e">💰 +'+bonuses.income+'% Thu Nhập</span>':'')+
    '</div>','#0a0f0a');
  }

  // Create alliance
  html += section('Thành Lập Đại Bang Liên', '🌟',
    card(btn('🌟 Thành Lập Liên Minh Mới','var n=prompt("Tên liên minh:");if(n){ga53FormAlliance(n,[]);gr53RenderAlliance()}','#a78bfa')));

  // Active alliances
  if (alliances.length > 0) {
    html += section('Liên Minh Đang Hoạt Động ('+alliances.length+')', '🤝',
      alliances.map(function(a) {
        return card('<div style="font-size:10px"><span style="color:#a78bfa;font-weight:bold">'+a.name+'</span> · '+a.memberGuilds.length+' thành viên</div>');
      }).join(''));
  }

  // Sign pact with AI guild
  html += section('Ký Hiệp Ước Với AI Bang', '📜',
    aiGuilds.slice(0,3).map(function(g) {
      return card('<div style="display:flex;justify-content:space-between;align-items:center;font-size:10px">'+
        '<span>'+g.icon+' <span style="color:#94a3b8">'+g.name+'</span></span>'+
        '<div>'+
          btn('🛡️ Phòng Thủ','ga53SignPact("'+g.id+'","defense");gr53RenderAlliance()','#60a5fa')+
          btn('💰 Thương Mại','ga53SignPact("'+g.id+'","trade");gr53RenderAlliance()','#22c55e')+
          btn('⚔️ Quân Sự','ga53SignPact("'+g.id+'","military");gr53RenderAlliance()','#ef4444')+
        '</div></div>');
    }).join(''));

  // Active pacts
  if (pacts.length > 0) {
    html += section('Hiệp Ước Đang Có ('+pacts.length+')', '📋',
      pacts.map(function(p) {
        return '<div style="font-size:10px;padding:3px 0;border-bottom:1px solid #1e293b;display:flex;justify-content:space-between">'+
          '<span>'+p.typeIcon+' '+p.typeName+' với '+p.guildBId+'</span>'+
          btn('Hủy','ga53BreakPact("'+p.id+'");gr53RenderAlliance()','#ef4444')+
        '</div>';
      }).join(''));
  }
  html += '</div>';
  el.innerHTML = html;
};

// ─── RENDER: ĐẾ QUỐC ─────────────────────────────────────────
window.gr53RenderEmpire = function() {
  const el = document.getElementById('panel-empire-v53'); if(!el) return;
  const stats   = typeof window.emp53GetStats           === 'function' ? window.emp53GetStats()         : {};
  const roles   = typeof window.emp53GetOfficialRoles   === 'function' ? window.emp53GetOfficialRoles() : [];
  const units   = typeof window.emp53GetArmyUnits       === 'function' ? window.emp53GetArmyUnits()     : [];
  const officials = typeof window.emp53GetOfficials     === 'function' ? window.emp53GetOfficials()     : [];
  const army    = typeof window.emp53GetArmy            === 'function' ? window.emp53GetArmy()          : {};
  const jarvis  = typeof window.emp53GetJarvisReport    === 'function' ? window.emp53GetJarvisReport()  : { tips:[] };
  const interactions = typeof window.emp53GetInteractions === 'function' ? window.emp53GetInteractions() : [];
  const aiGuilds = typeof window.g53GetAIGuilds         === 'function' ? window.g53GetAIGuilds()        : [];

  let html = '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">';
  html += '<div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="font-size:13px;font-weight:bold;color:#facc15">👑 Đế Quốc</span><span style="font-size:10px;color:#64748b">⚔️ '+stats.totalPower+' · 🏛️ '+stats.officials+' QC · 🗺️ '+stats.territories+' ĐT</span></div>';

  if (jarvis.tips.length > 0) {
    html += card(jarvis.tips.map(function(t){ return '<div style="font-size:10px;color:#fbbf24;margin:2px 0">'+t+'</div>'; }).join(''),'#0a0a00');
  }

  // Empire name
  if (!stats.imperialName || stats.imperialName === '(Chưa thành lập)') {
    html += section('Thành Lập Đế Quốc', '👑',
      card(btn('👑 Tuyên Bố Thành Lập Đế Quốc','var n=prompt("Tên đế quốc:");if(n){emp53SetImperialName(n,"Hoàng Đế");gr53RenderEmpire()}','#facc15')+
        '<div style="font-size:9px;color:#475569;margin-top:4px">Cần sở hữu Vương Quốc/Đế Chế trong tab Lãnh Thổ</div>'));
  } else {
    html += card('<div style="font-size:14px;font-weight:bold;color:#facc15">'+stats.imperialName+'</div>'+
      '<div style="font-size:10px;color:#94a3b8">'+stats.imperialTitle+' · Thuế: +'+fmt(stats.taxRevenue)+'/tick · '+stats.allies+' đồng minh AI · '+stats.wars+' chiến tranh</div>','#0a0a00');
  }

  // Officials
  html += section('Quan Chức ('+officials.length+')', '📜',
    officials.slice(0,4).map(function(o) {
      return '<div style="display:flex;justify-content:space-between;font-size:10px;padding:2px 0;border-bottom:1px solid #1e293b">'+
        '<span>'+o.roleIcon+' <span style="color:#94a3b8">'+o.name+'</span> — '+badge(o.roleName,'#3b82f6')+'</span>'+
        btn('Bãi Miễn','emp53DismissOfficial("'+o.id+'");gr53RenderEmpire()','#ef4444')+
      '</div>';
    }).join('')+
    roles.slice(0,4).map(function(r) {
      return btn(r.icon+' '+r.name+' ('+r.salary+'B)','emp53AppointOfficial("'+r.id+'",null,null);gr53RenderEmpire()','#a78bfa');
    }).join(''));

  // Army
  html += section('Quân Đội (⚔️ '+stats.totalPower+')', '⚔️',
    units.slice(0,4).map(function(u) {
      const count = army[u.id]||0;
      return '<div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;padding:2px 0">'+
        '<span>'+u.icon+' '+u.name+' x<span style="color:#fbbf24">'+count+'</span></span>'+
        '<div>'+btn('+5','emp53RecruitArmy("'+u.id+'",5);gr53RenderEmpire()','#22c55e')+(count>0?btn('-1','emp53DisbandArmy("'+u.id+'",1);gr53RenderEmpire()','#ef4444'):'')+'</div>'+
      '</div>';
    }).join(''));

  // AI interaction
  html += section('Tương Tác Với AI (Nations/Guilds)', '🌐',
    aiGuilds.slice(0,2).map(function(g) {
      return card('<div style="font-size:10px;margin-bottom:4px">'+g.icon+' <span style="color:#94a3b8">'+g.name+'</span></div>'+
        interactions.map(function(i) {
          return btn(i.icon+' '+i.name,'emp53InteractAI("'+g.id+'","'+i.id+'");gr53RenderEmpire()', i.id==='war'?'#ef4444':i.id==='ally'?'#a78bfa':'#60a5fa');
        }).join(''));
    }).join(''));

  html += '</div>';
  el.innerHTML = html;
};

// ─── RENDER: LÃNH THỔ ─────────────────────────────────────────
window.gr53RenderTerritory = function() {
  const el = document.getElementById('panel-territory-v53'); if(!el) return;
  const terData = typeof window.playerTerritoryData !== 'undefined' ? window.playerTerritoryData : {};
  const territories = Array.isArray(terData.territories) ? terData.territories : [];

  let html = '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">';
  html += '<div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="font-size:13px;font-weight:bold;color:#22c55e">🗺️ Lãnh Thổ</span><span style="font-size:10px;color:#64748b">'+territories.length+' vùng · Dân: '+fmt(terData.totalPop||0)+'</span></div>';

  if (terData.playerKingdom) html += card('<span style="color:#fbbf24">♟️ Vương Quốc: '+terData.playerKingdom+'</span>');
  if (terData.playerEmpire)  html += card('<span style="color:#facc15">👑 Đế Chế: '+terData.playerEmpire+'</span>');

  if (territories.length === 0) {
    html += card('<div style="text-align:center;color:#334155;font-size:11px;padding:12px">Chưa có lãnh thổ — mua Lãnh Thổ trong tab Người Chơi V28</div>');
  } else {
    html += section('Lãnh Thổ Đang Sở Hữu', '🗺️',
      territories.filter(function(t){ return t.status==='active'; }).slice(0,8).map(function(t) {
        return card('<div style="display:flex;justify-content:space-between;font-size:10px">'+
          '<div>'+t.icon+' <span style="color:#22c55e">'+t.name+'</span><br>'+
          '<span style="color:#475569">Thu nhập: '+t.income+'/tick · Dân: '+fmt(t.pop)+'</span></div>'+
          '<div style="text-align:right">'+badge('Ổn định: '+t.stability+'%','#3b82f6')+
            btn('⬆️ Nâng Cấp','ptUpgradeTerritory("'+t.id+'");gr53RenderTerritory()','#22c55e')+
          '</div></div>');
      }).join(''));
  }

  // Acquire new territory
  html += section('Mở Rộng Lãnh Thổ', '➕',
    card(
      btn('🏡 Mua Làng (200B)','ptAcquireTerritory("village",null);gr53RenderTerritory()','#22c55e')+
      btn('🏘️ Mua Thị Trấn','ptAcquireTerritory("town",null);gr53RenderTerritory()','#3b82f6')+
      btn('🏙️ Thành Phố','ptAcquireTerritory("city",null);gr53RenderTerritory()','#7c3aed')+
      btn('♟️ Vương Quốc','ptAcquireTerritory("kingdom",null);gr53RenderTerritory()','#f59e0b')+
      btn('👑 Đế Chế','ptAcquireTerritory("empire",null);gr53RenderTerritory()','#facc15')+
      '<br><div style="font-size:9px;color:#475569;margin-top:4px">Các lãnh thổ cấp cao yêu cầu cấp bậc người chơi cao</div>'));

  html += '</div>';
  el.innerHTML = html;
};

// ─── RENDER: CHIẾN TRANH ─────────────────────────────────────
window.gr53RenderWar = function() {
  const el = document.getElementById('panel-guildwar-v53'); if(!el) return;
  const activeWars = typeof window.gw53GetActiveWars === 'function' ? window.gw53GetActiveWars() : [];
  const warHistory = typeof window.gw53GetWarHistory === 'function' ? window.gw53GetWarHistory() : [];
  const warTypes   = typeof window.gw53GetWarTypes   === 'function' ? window.gw53GetWarTypes()   : [];
  const aiGuilds   = typeof window.g53GetAIGuilds    === 'function' ? window.g53GetAIGuilds()    : [];
  const stats      = typeof window.gw53GetStats      === 'function' ? window.gw53GetStats()      : {};
  const jarvis     = typeof window.gw53GetJarvisReport === 'function' ? window.gw53GetJarvisReport() : { tips:[] };

  let html = '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">';
  html += '<div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="font-size:13px;font-weight:bold;color:#ef4444">⚔️ Chiến Tranh</span><span style="font-size:10px;color:#64748b">'+stats.wins+'W/'+stats.losses+'L · Lực: '+stats.playerPower+'</span></div>';

  if (jarvis.tips.length > 0) {
    html += card(jarvis.tips.map(function(t){ return '<div style="font-size:10px;color:#fbbf24;margin:2px 0">'+t+'</div>'; }).join(''),'#0a0000');
  }

  if (activeWars.length > 0) {
    html += section('⚔️ Đang Chiến Tranh ('+activeWars.length+')', '🔴',
      activeWars.map(function(w) {
        return card('<div style="display:flex;justify-content:space-between;align-items:flex-start">'+
          '<div>'+w.typeIcon+' <span style="color:#ef4444;font-weight:bold">'+w.attackerName+'</span> vs <span style="color:#60a5fa">'+w.defenderName+'</span><br>'+
          '<span style="font-size:9px;color:#475569">Kết thúc năm '+(w.endYear||'?')+' · Sức mạnh: '+w.attackPower+' vs '+w.defPower+'</span></div>'+
          '<div>'+btn('⬆️+15%','gw53BoostAttack("'+w.id+'");gr53RenderWar()','#f59e0b')+btn('🏳️ Đầu Hàng','if(confirm("Đầu hàng?")){gw53SurrenderWar("'+w.id+'");gr53RenderWar()}','#ef4444')+'</div></div>',
          '#0a0000');
      }).join(''), '#ef4444');
  } else {
    // Declare war
    html += section('Tuyên Chiến Với AI Bang', '⚔️',
      aiGuilds.slice(0,4).map(function(g) {
        return card('<div style="display:flex;justify-content:space-between;align-items:center">'+
          '<div><span style="font-size:12px">'+g.icon+'</span> <span style="font-size:10px;color:#94a3b8">'+g.name+'</span><br>'+
          '<span style="font-size:9px;color:#475569">Sức mạnh: '+g.power+'</span></div>'+
          '<div>'+
            btn('⚔️ Đánh Bang','gw53DeclareWar("'+g.id+'","guildVsGuild","'+g.name+'");gr53RenderWar()','#ef4444')+
            btn('🏴 Lãnh Thổ','gw53DeclareWar("'+g.id+'","territoryWar","'+g.name+'");gr53RenderWar()','#f59e0b')+
          '</div></div>');
      }).join(''), '#ef4444');
  }

  // History
  if (warHistory.length > 0) {
    html += section('Lịch Sử Chiến Tranh', '📜',
      warHistory.slice(0,6).map(function(w) {
        const won = w.winner === (typeof window.guildV53Data !== 'undefined' ? window.guildV53Data.playerGuildId : null);
        return '<div style="font-size:10px;padding:2px 0;border-bottom:1px solid #1e293b">'+w.typeIcon+' '+
          '<span style="color:'+(won?'#22c55e':'#ef4444')+'">'+(won?'🏆 THẮNG':'💀 THUA')+'</span> vs '+
          (won?w.defenderName:w.attackerName)+' · Năm '+(w.year||'?')+'</div>';
      }).join(''));
  }
  html += '</div>';
  el.innerHTML = html;
};

// ─── RENDER: BXH ──────────────────────────────────────────────
window.gr53RenderRanking = function() {
  const el = document.getElementById('panel-ranking-v53'); if(!el) return;
  const rankings   = typeof window.gw53GetRankings    === 'function' ? window.gw53GetRankings()    : [];
  const aiGuilds   = typeof window.g53GetAIGuilds     === 'function' ? window.g53GetAIGuilds()     : [];
  const guildStats = typeof window.g53GetStats        === 'function' ? window.g53GetStats()        : {};
  const alliStats  = typeof window.ga53GetStats       === 'function' ? window.ga53GetStats()       : {};
  const empStats   = typeof window.emp53GetStats      === 'function' ? window.emp53GetStats()      : {};
  const warStats   = typeof window.gw53GetStats       === 'function' ? window.gw53GetStats()       : {};

  let html = '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">';
  html += '<div style="font-size:13px;font-weight:bold;color:#fbbf24;margin-bottom:10px">🏆 Bảng Xếp Hạng V53</div>';

  // Player summary card
  html += card('<div style="font-size:11px">'+
    '<div style="color:#fbbf24;font-weight:bold;margin-bottom:4px">📊 Tổng Quan Của Bạn</div>'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
      '<span style="color:#60a5fa">🏛️ '+guildStats.guildName+'</span>'+
      '<span style="color:#a78bfa">🤝 '+alliStats.activePacts+' hiệp ước</span>'+
      '<span style="color:#facc15">👑 '+empStats.imperialName+'</span>'+
      '<span style="color:#ef4444">⚔️ '+warStats.wins+'W/'+warStats.losses+'L</span>'+
    '</div></div>','#0a0f1a');

  // War rankings
  if (rankings.length > 0) {
    html += section('BXH Chiến Tích ('+rankings.length+')', '⚔️',
      rankings.slice(0,8).map(function(r, i) {
        const medals = ['🥇','🥈','🥉'];
        return '<div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;padding:3px 0;border-bottom:1px solid #1e293b">'+
          '<span>'+(medals[i]||'#'+(i+1))+' <span style="color:#e2e8f0">'+r.name+'</span></span>'+
          '<div>'+badge(r.wins+'W/'+r.losses+'L', i===0?'#facc15':i<3?'#94a3b8':'#475569')+
            '<span style="color:#ef4444;font-size:9px;margin-left:4px">⚔️'+r.power+'</span></div>'+
        '</div>';
      }).join(''));
  }

  // AI guild power ranking
  const aiSorted = aiGuilds.sort(function(a,b){ return b.power-a.power; });
  html += section('BXH Bang Hội AI Thế Giới', '🤖',
    aiSorted.slice(0,6).map(function(g, i) {
      const medals = ['🥇','🥈','🥉'];
      return '<div style="display:flex;justify-content:space-between;font-size:10px;padding:2px 0;border-bottom:1px solid #1e293b">'+
        '<span>'+(medals[i]||'#'+(i+1))+' '+g.icon+' <span style="color:#94a3b8">'+g.name+'</span></span>'+
        '<span style="color:#ef4444">⚔️ '+g.power+'</span></div>';
    }).join(''));

  html += btn('🔄 Làm Mới','gr53RenderRanking()','#475569');
  html += '</div>';
  el.innerHTML = html;
};

// ─── PATCH PLAYER HUB V28 ─────────────────────────────────────
function patchPlayerHub() {
  const _origHub = window.hubRenderPanel;
  if (typeof _origHub !== 'function') return;

  window.hubRenderPanel = function(hubId) {
    _origHub(hubId);
    if (hubId !== 'player-hub-v28') return;

    const panel = document.getElementById('panel-player-hub-v28');
    if (!panel) return;
    const topBar = panel.querySelector('div > div:nth-child(1) > div:nth-child(2)');
    if (!topBar) return;
    if (topBar.querySelector('[data-v53tab]')) return;

    V53_TABS.forEach(function(t) {
      const b = document.createElement('button');
      b.setAttribute('data-v53tab', t.id);
      b.innerHTML = t.icon + ' ' + t.label;
      b.style.cssText = 'padding:5px 8px;background:transparent;border:none;border-bottom:2px solid transparent;color:#64748b;cursor:pointer;font-size:11px;white-space:nowrap;transition:all 0.2s;font-family:\'Noto Serif SC\',serif';
      b.onclick = function() {
        topBar.querySelectorAll('button').forEach(function(x){ x.style.borderBottomColor='transparent'; x.style.color='#64748b'; });
        b.style.borderBottomColor='#ef4444';
        b.style.color='#ef4444';
        const area = document.getElementById('player-hub-v28-content');
        if (!area) return;
        if (typeof window[t.fn] === 'function') window[t.fn]();
        const subPanel = document.getElementById('panel-'+t.id);
        if (subPanel && subPanel.innerHTML.trim().length > 10) area.innerHTML = subPanel.innerHTML;
      };
      topBar.appendChild(b);
    });
  };
}

// ─── HUB WIDGET ───────────────────────────────────────────────
window.guildV53HubRenderPanel = function() {
  const gs = typeof window.g53GetStats  === 'function' ? window.g53GetStats()  : {};
  const ws = typeof window.gw53GetStats === 'function' ? window.gw53GetStats() : {};
  const es = typeof window.emp53GetStats=== 'function' ? window.emp53GetStats(): {};
  let html = '<div style="background:#0a0f1a;border:1px solid #1e293b;border-radius:8px;padding:10px;margin-top:8px">';
  html += '<div style="font-size:11px;font-weight:bold;color:#ef4444;margin-bottom:6px">⚔️ Guild & Empire V53</div>';
  html += '<div style="display:flex;gap:4px;flex-wrap:wrap">'+
    '<span style="background:#60a5fa22;color:#60a5fa;border:1px solid #60a5fa44;border-radius:4px;padding:2px 6px;font-size:10px">🏛️ '+gs.guildName+'</span>'+
    '<span style="background:#ef444422;color:#ef4444;border:1px solid #ef444444;border-radius:4px;padding:2px 6px;font-size:10px">⚔️ '+ws.wins+'W/'+ws.losses+'L</span>'+
    '<span style="background:#facc1522;color:#facc15;border:1px solid #facc1544;border-radius:4px;padding:2px 6px;font-size:10px">👑 '+es.imperialName+'</span>'+
  '</div></div>';
  return html;
};

// ─── INIT ─────────────────────────────────────────────────────
function init() {
  patchPlayerHub();
  console.log('[GuildRegistryV53] ⚔️ Guild Registry V53 — 6 tabs (Bang Hội/Liên Minh/Đế Quốc/Lãnh Thổ/Chiến Tranh/BXH) trong player-hub-v28 · Hub widget sẵn sàng.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
