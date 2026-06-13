(function() {
"use strict";
// ============================================================
// EVENT REGISTRY V59 — Hub UI Global Events
// Patches: multiverse-hub-v35 · player-hub-v28 · creator-hub-v32
// Tabs: Event Toàn Cầu · Đa Vũ Trụ · World Boss · Lịch Sử · Phần Thưởng · BXH
// EXPAND ONLY · KHÔNG GHI ĐÈ file cũ · Passive (no tick/save)
// ============================================================
const INIT_DELAY = 11400;

// ─── Helpers ───────────────────────────────────────────────
function _now() { return typeof window.year !== "undefined" ? window.year : 1; }
function _esc(s) { return String(s).replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function _rarityBadge(r) {
  var cols = { common:"#9ca3af",uncommon:"#22c55e",rare:"#3b82f6",epic:"#a78bfa",legendary:"#f59e0b",multiverse:"#e879f9",divine:"#facc15" };
  return "<span style='background:"+(cols[r]||"#6b7280")+";color:#000;font-size:10px;padding:1px 5px;border-radius:8px;font-weight:700;'>"+_esc(r)+"</span>";
}

// ─── PANEL: Event Toàn Cầu ─────────────────────────────────
function _renderGlobalEvents(container) {
  var active  = typeof window.ges59GetActive  === "function" ? window.ges59GetActive()  : [];
  var defs    = typeof window.ges59GetEventDefs==="function" ? window.ges59GetEventDefs(): [];
  var stats   = typeof window.ges59GetStats   === "function" ? window.ges59GetStats()   : {};
  var html = "<div style='padding:12px'>";
  html += "<h3 style='color:#f59e0b;margin:0 0 8px'>📅 Sự Kiện Toàn Cầu V59</h3>";
  html += "<div style='display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap'>";
  html += "<div style='background:#1f2937;padding:8px 14px;border-radius:8px;text-align:center'><div style='font-size:20px;color:#f59e0b'>"+_esc(stats.active||0)+"</div><div style='font-size:11px;color:#9ca3af'>Đang Diễn Ra</div></div>";
  html += "<div style='background:#1f2937;padding:8px 14px;border-radius:8px;text-align:center'><div style='font-size:20px;color:#10b981'>"+_esc(stats.totalFired||0)+"</div><div style='font-size:11px;color:#9ca3af'>Đã Xảy Ra</div></div>";
  html += "</div>";
  if (active.length > 0) {
    html += "<div style='margin-bottom:10px'><b style='color:#fbbf24'>⚡ Đang Diễn Ra:</b></div>";
    active.forEach(function(ev) {
      html += "<div style='background:#1f2937;border:1px solid #374151;border-radius:8px;padding:10px;margin-bottom:8px'>";
      html += "<div style='display:flex;align-items:center;gap:8px'><span style='font-size:22px'>"+_esc(ev.icon)+"</span>";
      html += "<div><b style='color:#fff'>"+_esc(ev.label)+"</b><div style='font-size:11px;color:#9ca3af'>Năm "+_esc(ev.year)+" · Nguồn: "+_esc(ev.source)+"</div></div></div>";
      html += "</div>";
    });
  } else {
    html += "<div style='color:#6b7280;text-align:center;padding:20px'>Không có sự kiện đang diễn ra</div>";
  }
  html += "<div style='margin-top:12px'><b style='color:#9ca3af;font-size:12px'>🎛️ Kích Hoạt Thủ Công:</b></div>";
  html += "<div style='display:flex;flex-wrap:wrap;gap:6px;margin-top:6px'>";
  defs.slice(0,6).forEach(function(def) {
    html += "<button onclick='if(typeof ges59ManualFire===\"function\")ges59ManualFire(\""+def.id+"\",\"manual\")' style='background:#374151;color:#fff;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:11px'>"+_esc(def.icon)+" "+_esc(def.label)+"</button>";
  });
  html += "</div></div>";
  container.innerHTML = html;
}

// ─── PANEL: Event Đa Vũ Trụ ──────────────────────────────
function _renderMVEvents(container) {
  var active = typeof window.mves59GetActive    === "function" ? window.mves59GetActive()    : [];
  var types  = typeof window.mves59GetTypes     === "function" ? window.mves59GetTypes()     : [];
  var stats  = typeof window.mves59GetStats     === "function" ? window.mves59GetStats()     : {};
  var html = "<div style='padding:12px'>";
  html += "<h3 style='color:#7c3aed;margin:0 0 8px'>🌌 Sự Kiện Đa Vũ Trụ V59</h3>";
  html += "<div style='display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap'>";
  html += "<div style='background:#1f2937;padding:8px 14px;border-radius:8px;text-align:center'><div style='font-size:20px;color:#7c3aed'>"+_esc(stats.active||0)+"</div><div style='font-size:11px;color:#9ca3af'>Đang Diễn Ra</div></div>";
  html += "<div style='background:#1f2937;padding:8px 14px;border-radius:8px;text-align:center'><div style='font-size:20px;color:#a78bfa'>"+_esc(stats.totalFired||0)+"</div><div style='font-size:11px;color:#9ca3af'>Tổng Đã Xảy Ra</div></div>";
  html += "</div>";
  if (active.length > 0) {
    html += "<div style='margin-bottom:8px'><b style='color:#a78bfa'>⚡ Đang Diễn Ra:</b></div>";
    active.forEach(function(ev) {
      html += "<div style='background:#1f2937;border:1px solid #4c1d95;border-radius:8px;padding:10px;margin-bottom:8px'>";
      html += "<div style='display:flex;align-items:center;gap:8px'><span style='font-size:22px'>"+_esc(ev.icon)+"</span>";
      html += "<div><b style='color:#fff'>"+_esc(ev.label)+"</b>&nbsp;"+_rarityBadge(ev.rarity)+"<div style='font-size:11px;color:#9ca3af;margin-top:3px'>"+_esc(ev.desc)+"</div></div></div>";
      if (ev.effects && ev.effects.length) {
        html += "<ul style='margin:6px 0 0 20px;padding:0;font-size:11px;color:#d1d5db'>";
        ev.effects.forEach(function(ef){ html += "<li>"+_esc(ef)+"</li>"; });
        html += "</ul>";
      }
      html += "</div>";
    });
  } else {
    html += "<div style='color:#6b7280;text-align:center;padding:20px'>Không có sự kiện đa vũ trụ đang diễn ra</div>";
  }
  html += "<div style='margin-top:12px'><b style='color:#9ca3af;font-size:12px'>🌌 Tất Cả Loại Sự Kiện:</b></div>";
  html += "<div style='margin-top:6px;display:flex;flex-wrap:wrap;gap:6px'>";
  types.forEach(function(def) {
    html += "<button onclick='if(typeof mves59ManualFire===\"function\")mves59ManualFire(\""+def.id+"\")' style='background:#4c1d95;color:#fff;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:11px'>"+_esc(def.icon)+" "+_esc(def.label)+" "+_rarityBadge(def.rarity)+"</button>";
  });
  html += "</div></div>";
  container.innerHTML = html;
}

// ─── PANEL: World Boss ────────────────────────────────────
function _renderWorldBoss(container) {
  var active   = typeof window.wb59GetActive    === "function" ? window.wb59GetActive()    : [];
  var defeated = typeof window.wb59GetDefeated  === "function" ? window.wb59GetDefeated()  : [];
  var templates= typeof window.wb59GetTemplates === "function" ? window.wb59GetTemplates() : [];
  var stats    = typeof window.wb59GetStats     === "function" ? window.wb59GetStats()     : {};
  var alliances= typeof window.wb59GetAlliances === "function" ? window.wb59GetAlliances() : [];
  var html = "<div style='padding:12px'>";
  html += "<h3 style='color:#ef4444;margin:0 0 8px'>👹 World Boss V59</h3>";
  html += "<div style='display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap'>";
  html += "<div style='background:#1f2937;padding:8px 14px;border-radius:8px;text-align:center'><div style='font-size:20px;color:#ef4444'>"+_esc(stats.active||0)+"</div><div style='font-size:11px;color:#9ca3af'>Đang Hoạt Động</div></div>";
  html += "<div style='background:#1f2937;padding:8px 14px;border-radius:8px;text-align:center'><div style='font-size:20px;color:#f59e0b'>"+_esc(stats.totalSpawned||0)+"</div><div style='font-size:11px;color:#9ca3af'>Đã Xuất Hiện</div></div>";
  html += "<div style='background:#1f2937;padding:8px 14px;border-radius:8px;text-align:center'><div style='font-size:20px;color:#10b981'>"+_esc(stats.totalDefeated||0)+"</div><div style='font-size:11px;color:#9ca3af'>Đã Tiêu Diệt</div></div>";
  html += "</div>";
  if (active.length > 0) {
    html += "<div style='margin-bottom:8px'><b style='color:#ef4444'>⚠️ Boss Đang Hoạt Động:</b></div>";
    active.forEach(function(boss) {
      var hpPct = Math.round((boss.hp/boss.maxHp)*100);
      var hpColor = hpPct > 60 ? "#ef4444" : hpPct > 30 ? "#f59e0b" : "#22c55e";
      html += "<div style='background:#1f2937;border:1px solid #7f1d1d;border-radius:8px;padding:10px;margin-bottom:8px'>";
      html += "<div style='display:flex;align-items:center;gap:8px'><span style='font-size:28px'>"+_esc(boss.icon)+"</span>";
      html += "<div><b style='color:#fff;font-size:14px'>"+_esc(boss.name)+"</b>&nbsp;"+_rarityBadge(boss.tier)+"<div style='font-size:11px;color:#9ca3af'>"+_esc(boss.title)+"</div></div></div>";
      html += "<div style='margin:6px 0 2px;font-size:11px;color:#9ca3af'>HP: "+_esc(Math.round(boss.hp/1000000))+"M / "+_esc(Math.round(boss.maxHp/1000000))+"M</div>";
      html += "<div style='background:#374151;border-radius:4px;height:8px'><div style='background:"+hpColor+";width:"+hpPct+"%;height:100%;border-radius:4px'></div></div>";
      html += "<div style='margin-top:6px;font-size:11px;color:#fbbf24'>🤝 AI Đồng Minh: "+_esc((boss.aiAllies||[]).slice(0,3).join(", "))+"</div>";
      html += "<button onclick='if(typeof wb59AttackBoss===\"function\")wb59AttackBoss(\""+_esc(boss.uid)+"\",50000000)' style='margin-top:6px;background:#ef4444;color:#fff;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:12px'>⚔️ Tấn Công (-50M HP)</button>";
      html += "</div>";
    });
  } else {
    html += "<div style='color:#6b7280;text-align:center;padding:16px'>Không có Boss đang hoạt động</div>";
  }
  html += "<div style='margin-top:10px'><b style='color:#9ca3af;font-size:12px'>🔱 Triệu Hồi Boss:</b></div>";
  html += "<div style='display:flex;flex-wrap:wrap;gap:6px;margin-top:6px'>";
  templates.forEach(function(t) {
    html += "<button onclick='if(typeof wb59SpawnBoss===\"function\")wb59SpawnBoss(\""+t.id+"\")' style='background:#7f1d1d;color:#fff;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:11px'>"+_esc(t.icon)+" "+_esc(t.name)+"</button>";
  });
  html += "</div>";
  if (defeated.length > 0) {
    html += "<div style='margin-top:10px'><b style='color:#10b981;font-size:12px'>✅ Boss Đã Hạ ("+defeated.length+"):</b></div>";
    html += "<div style='margin-top:6px'>";
    defeated.slice(0,3).forEach(function(b) {
      html += "<div style='background:#064e3b;border-radius:6px;padding:6px 10px;margin-bottom:4px;font-size:11px'>"+_esc(b.icon)+" <b>"+_esc(b.name)+"</b> "+_rarityBadge(b.tier)+" — Năm "+_esc(b.defeatedYear)+"</div>";
    });
    html += "</div>";
  }
  html += "</div>";
  container.innerHTML = html;
}

// ─── PANEL: Lịch Sử Event ────────────────────────────────
function _renderEventHistory(container) {
  var archive = typeof window.eas59GetArchive    === "function" ? window.eas59GetArchive()    : [];
  var stats   = typeof window.eas59GetStats      === "function" ? window.eas59GetStats()      : {};
  var boss    = typeof window.eas59GetBossKills  === "function" ? window.eas59GetBossKills()  : [];
  var html = "<div style='padding:12px'>";
  html += "<h3 style='color:#06b6d4;margin:0 0 8px'>📚 Lịch Sử Sự Kiện V59</h3>";
  html += "<div style='margin-bottom:10px;font-size:12px;color:#9ca3af'>Tổng: <b style='color:#fff'>"+_esc(stats.total||0)+"</b> sự kiện đã lưu trữ &nbsp;·&nbsp; Boss tiêu diệt: <b style='color:#10b981'>"+_esc(boss.length)+"</b></div>";
  if (archive.length > 0) {
    archive.slice(0,20).forEach(function(ev) {
      var srcCol = { auto:"#6b7280", manual:"#3b82f6", creator:"#f59e0b", seasonal:"#10b981", ai:"#06b6d4" }[ev.source]||"#6b7280";
      html += "<div style='background:#1f2937;border-left:3px solid "+srcCol+";border-radius:6px;padding:8px 10px;margin-bottom:6px;font-size:12px'>";
      html += "<div style='display:flex;justify-content:space-between;align-items:center'>";
      html += "<span>"+_esc(ev.icon)+" <b style='color:#fff'>"+_esc(ev.label)+"</b></span>";
      html += "<span style='color:#6b7280;font-size:11px'>Năm "+_esc(ev.year)+"</span></div>";
      if (ev.winner) html += "<div style='margin-top:3px;font-size:11px;color:#10b981'>🏆 "+_esc(ev.winner)+"</div>";
      if (ev.impact) html += "<div style='margin-top:2px;font-size:11px;color:#9ca3af'>📊 "+_esc(ev.impact)+"</div>";
      html += "</div>";
    });
  } else {
    html += "<div style='color:#6b7280;text-align:center;padding:20px'>Chưa có sự kiện nào trong lịch sử</div>";
  }
  html += "</div>";
  container.innerHTML = html;
}

// ─── PANEL: Phần Thưởng ──────────────────────────────────
function _renderRewards(container) {
  var pstats  = typeof window.ere59GetPlayerStats === "function" ? window.ere59GetPlayerStats() : {};
  var titles  = typeof window.ere59GetTitles      === "function" ? window.ere59GetTitles()      : [];
  var pool    = typeof window.ere59GetTitlesPool  === "function" ? window.ere59GetTitlesPool()  : [];
  var history = typeof window.ere59GetHistory     === "function" ? window.ere59GetHistory()     : [];
  var html = "<div style='padding:12px'>";
  html += "<h3 style='color:#fbbf24;margin:0 0 8px'>🏆 Phần Thưởng V59</h3>";
  html += "<div style='display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap'>";
  html += "<div style='background:#1f2937;padding:8px 14px;border-radius:8px;text-align:center'><div style='font-size:20px;color:#fbbf24'>"+_esc(pstats.cp||0)+"</div><div style='font-size:11px;color:#9ca3af'>Creator Points</div></div>";
  html += "<div style='background:#1f2937;padding:8px 14px;border-radius:8px;text-align:center'><div style='font-size:20px;color:#a78bfa'>"+_esc(pstats.fame||0)+"</div><div style='font-size:11px;color:#9ca3af'>Fame</div></div>";
  html += "<div style='background:#1f2937;padding:8px 14px;border-radius:8px;text-align:center'><div style='font-size:20px;color:#10b981'>"+_esc(pstats.titles||0)+"</div><div style='font-size:11px;color:#9ca3af'>Danh Hiệu</div></div>";
  html += "</div>";
  if (titles.length > 0) {
    html += "<div style='margin-bottom:6px'><b style='color:#fbbf24'>🎖️ Danh Hiệu Đã Nhận:</b></div>";
    titles.forEach(function(t) {
      var rc = typeof window.ere59GetRarityColor === "function" ? window.ere59GetRarityColor(t.rarity) : "#6b7280";
      html += "<div style='background:#1f2937;border:1px solid "+rc+";border-radius:6px;padding:6px 10px;margin-bottom:4px;display:flex;align-items:center;gap:6px'>";
      html += "<span style='font-size:18px'>"+_esc(t.icon)+"</span>";
      html += "<div><b style='color:"+rc+"'>"+_esc(t.name)+"</b> "+_rarityBadge(t.rarity)+"<div style='font-size:10px;color:#9ca3af'>"+_esc(t.condition)+"</div></div></div>";
    });
  }
  html += "<div style='margin-top:10px'><b style='color:#9ca3af;font-size:12px'>📋 Danh Hiệu Có Thể Nhận ("+pool.length+"):</b></div>";
  html += "<div style='margin-top:6px'>";
  pool.slice(0,6).forEach(function(t) {
    var earned = titles.some(function(e){ return e.id===t.id; });
    var rc = typeof window.ere59GetRarityColor === "function" ? window.ere59GetRarityColor(t.rarity) : "#6b7280";
    html += "<div style='background:"+(earned?"#064e3b":"#111827")+";border-radius:6px;padding:5px 10px;margin-bottom:3px;font-size:11px;display:flex;gap:6px;align-items:center'>";
    html += "<span>"+_esc(t.icon)+"</span><span style='color:"+rc+"'>"+_esc(t.name)+"</span>&nbsp;"+_rarityBadge(t.rarity)+"&nbsp;";
    if (earned) html += "<span style='color:#10b981'>✅</span>";
    html += "</div>";
  });
  html += "</div>";
  if (history.length > 0) {
    html += "<div style='margin-top:10px'><b style='color:#9ca3af;font-size:12px'>📜 Lịch Sử Thưởng Gần Đây:</b></div>";
    history.slice(0,5).forEach(function(h) {
      html += "<div style='font-size:11px;color:#9ca3af;margin-top:3px'>Năm "+_esc(h.year)+" · +"+_esc(h.cp)+" CP · +"+_esc(h.fame)+" Fame"+(h.title?" · 🎖️ "+_esc(h.title):"")+"</div>";
    });
  }
  html += "</div>";
  container.innerHTML = html;
}

// ─── PANEL: Bảng Xếp Hạng ────────────────────────────────
function _renderRankings(container) {
  var rankings  = typeof window.ere59GetRankings === "function" ? window.ere59GetRankings() : [];
  var archStats = typeof window.eas59GetStats    === "function" ? window.eas59GetStats()    : {};
  var jarvis    = typeof window.eas59GetJarvisReport === "function" ? window.eas59GetJarvisReport() : null;
  var html = "<div style='padding:12px'>";
  html += "<h3 style='color:#f59e0b;margin:0 0 8px'>📊 BXH & Jarvis V59</h3>";
  if (jarvis) {
    html += "<div style='background:#1f2937;border:1px solid #374151;border-radius:8px;padding:10px;margin-bottom:12px;font-size:12px'>";
    html += "<b style='color:#fbbf24'>🤖 Jarvis Event Report:</b><br><span style='color:#d1d5db'>"+_esc(jarvis.summary)+"</span>";
    html += "<div style='margin-top:6px;color:#9ca3af'>Tổng sự kiện: <b style='color:#fff'>"+_esc(jarvis.totalEvents)+"</b> · Boss hạ: <b style='color:#10b981'>"+_esc(jarvis.bosses)+"</b></div>";
    if (jarvis.topCategories && jarvis.topCategories.length) {
      html += "<div style='margin-top:4px;color:#9ca3af'>Top: ";
      html += jarvis.topCategories.map(function(c){ return "<b style='color:#fff'>"+_esc(c.cat)+"</b> ("+_esc(c.count)+")"; }).join(" · ");
      html += "</div>";
    }
    html += "</div>";
  }
  if (rankings.length > 0) {
    html += "<div style='margin-bottom:8px'><b style='color:#f59e0b'>🏆 Bảng Xếp Hạng Sự Kiện:</b></div>";
    rankings.slice(0,10).forEach(function(r, idx) {
      var medal = ["🥇","🥈","🥉"][idx] || (idx+1+". ");
      html += "<div style='background:#1f2937;border-radius:6px;padding:7px 10px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;font-size:12px'>";
      html += "<span>"+medal+" <b style='color:#fff'>"+_esc(r.entity)+"</b></span>";
      html += "<span style='color:#fbbf24;font-weight:700'>"+_esc(r.score)+" pts</span></div>";
    });
  } else {
    html += "<div style='color:#6b7280;text-align:center;padding:20px'>Chưa có dữ liệu xếp hạng</div>";
  }
  html += "</div>";
  container.innerHTML = html;
}

// ─── PANEL: Community Events ──────────────────────────────
function _renderCommunity(container) {
  var season   = typeof window.cev59GetCurrentSeason  === "function" ? window.cev59GetCurrentSeason()  : "?";
  var active   = typeof window.cev59GetActive         === "function" ? window.cev59GetActive()         : [];
  var aiEvs    = typeof window.cev59GetAIEvents        === "function" ? window.cev59GetAIEvents()       : [];
  var crTypes  = typeof window.cev59GetCreatorTypes   === "function" ? window.cev59GetCreatorTypes()   : [];
  var sDefs    = typeof window.cev59GetSeasonalDefs   === "function" ? window.cev59GetSeasonalDefs()   : [];
  var stats    = typeof window.cev59GetStats          === "function" ? window.cev59GetStats()          : {};
  var seasonIcons = { spring:"🌸", summer:"☀️", autumn:"🍂", winter:"❄️" };
  var html = "<div style='padding:12px'>";
  html += "<h3 style='color:#10b981;margin:0 0 8px'>🎊 Sự Kiện Cộng Đồng V59</h3>";
  html += "<div style='background:#1f2937;border-radius:8px;padding:10px;margin-bottom:12px;font-size:13px'>";
  html += "<b style='color:#10b981'>Mùa Hiện Tại:</b> "+(seasonIcons[season]||"🌍")+" <b style='color:#fff'>"+_esc(season.toUpperCase())+"</b>";
  html += "<span style='margin-left:12px;color:#9ca3af'>Creator Events: <b style='color:#fff'>"+_esc(stats.totalCreator||0)+"</b></span>";
  html += "<span style='margin-left:12px;color:#9ca3af'>AI Events: <b style='color:#fff'>"+_esc(stats.totalAI||0)+"</b></span>";
  html += "</div>";
  html += "<div style='margin-bottom:8px'><b style='color:#10b981;font-size:12px'>🌸 Sự Kiện Mùa:</b></div>";
  html += "<div style='display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px'>";
  sDefs.forEach(function(s) {
    var active2 = active.some(function(e){ return e.defId===s.id; });
    html += "<div style='background:"+(active2?"#064e3b":"#1f2937")+";border:1px solid "+(active2?"#10b981":"#374151")+";border-radius:6px;padding:6px 10px;font-size:11px'>";
    html += s.icon+" <b style='color:#fff'>"+_esc(s.label)+"</b>"+(active2?" ✅":"")+"</div>";
  });
  html += "</div>";
  html += "<div style='margin-bottom:8px'><b style='color:#f59e0b;font-size:12px'>👁️ Creator Events:</b></div>";
  html += "<div style='display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px'>";
  crTypes.forEach(function(t) {
    html += "<button onclick='if(typeof cev59TriggerCreatorEvent===\"function\")cev59TriggerCreatorEvent(\""+t.id+"\")' style='background:#78350f;color:#fff;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:11px'>"+_esc(t.icon)+" "+_esc(t.label)+" ("+_esc(t.cost)+" CP)</button>";
  });
  html += "</div>";
  if (aiEvs.length > 0) {
    html += "<div style='margin-bottom:6px'><b style='color:#06b6d4;font-size:12px'>🤖 AI Events Gần Đây:</b></div>";
    aiEvs.slice(0,5).forEach(function(ev) {
      html += "<div style='font-size:11px;color:#9ca3af;padding:3px 0'>"+_esc(ev.icon)+" "+_esc(ev.label)+" — Năm "+_esc(ev.year)+"</div>";
    });
  }
  html += "</div>";
  container.innerHTML = html;
}

// ─── MAIN RENDER FUNCTION ─────────────────────────────────
function _renderTab(tabId, container) {
  switch(tabId) {
    case "v59-global":    _renderGlobalEvents(container); break;
    case "v59-multiverse":_renderMVEvents(container);     break;
    case "v59-boss":      _renderWorldBoss(container);    break;
    case "v59-history":   _renderEventHistory(container); break;
    case "v59-rewards":   _renderRewards(container);      break;
    case "v59-rankings":  _renderRankings(container);     break;
    case "v59-community": _renderCommunity(container);    break;
    default: container.innerHTML = "<div style='padding:20px;color:#6b7280'>Chọn một tab</div>";
  }
}

window.evReg59ShowTab = function(tabId) {
  document.querySelectorAll("[data-v59tab]").forEach(function(btn) {
    btn.style.borderBottom = btn.dataset.v59tab===tabId ? "2px solid #f59e0b" : "2px solid transparent";
    btn.style.color = btn.dataset.v59tab===tabId ? "#f59e0b" : "#9ca3af";
  });
  var c = document.getElementById("panel-ev59-content");
  if (c) _renderTab(tabId, c);
};

// ─── Hub Widget: Đa Vũ Trụ ────────────────────────────────
function _injectMVHub() {
  var mvHub = document.getElementById("panel-multiverse-hub-v35");
  if (!mvHub) return;
  if (document.getElementById("ev59-mvhub-section")) return;
  var sec = document.createElement("div");
  sec.id = "ev59-mvhub-section";
  sec.style.cssText = "margin-top:16px;border-top:1px solid #374151;padding-top:12px";
  sec.innerHTML = [
    "<div style='font-size:13px;font-weight:700;color:#f59e0b;margin-bottom:8px'>🌍 V59 — Global Events Online</div>",
    "<div id='panel-ev59-tabs' style='display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px'>",
    ["v59-global:📅 Toàn Cầu","v59-multiverse:🌌 Đa Vũ Trụ","v59-boss:👹 World Boss","v59-history:📚 Lịch Sử","v59-rewards:🏆 Phần Thưởng","v59-rankings:📊 BXH","v59-community:🎊 Cộng Đồng"].map(function(s){
      var parts = s.split(":");
      return "<button data-v59tab='"+parts[0]+"' onclick='window.evReg59ShowTab(\""+parts[0]+"\")' style='background:#1f2937;color:#9ca3af;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:11px;border-bottom:2px solid transparent'>"+parts[1]+"</button>";
    }).join(""),
    "</div>",
    "<div id='panel-ev59-content' style='background:#111827;border-radius:8px;min-height:60px'></div>"
  ].join("");
  mvHub.appendChild(sec);
  window.evReg59ShowTab("v59-global");
}

// ─── Hub Widget: Player Hub ────────────────────────────────
function _injectPlayerHub() {
  var phub = document.getElementById("panel-player-hub-v28");
  if (!phub) return;
  if (document.getElementById("ev59-phub-widget")) return;
  var w = document.createElement("div");
  w.id = "ev59-phub-widget";
  w.style.cssText = "margin-top:12px;border-top:1px solid #374151;padding-top:10px";
  w.innerHTML = [
    "<div style='font-size:12px;font-weight:700;color:#fbbf24;margin-bottom:6px'>🏆 V59 — Phần Thưởng & BXH</div>",
    "<div style='display:flex;gap:6px;flex-wrap:wrap'>",
    "<button onclick='window.evReg59ShowTab(\"v59-rewards\");var m=document.getElementById(\"panel-multiverse-hub-v35\");if(m)m.style.display=\"\"' style='background:#1f2937;color:#fbbf24;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:11px'>🏆 Phần Thưởng</button>",
    "<button onclick='window.evReg59ShowTab(\"v59-rankings\");var m=document.getElementById(\"panel-multiverse-hub-v35\");if(m)m.style.display=\"\"' style='background:#1f2937;color:#f59e0b;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:11px'>📊 BXH</button>",
    "</div>",
    "<div id='ev59-phub-mini'></div>"
  ].join("");
  phub.appendChild(w);
}

// ─── Hub Widget: Creator Hub ──────────────────────────────
function _injectCreatorHub() {
  var chub = document.getElementById("panel-creator-hub-v32");
  if (!chub) return;
  if (document.getElementById("ev59-chub-widget")) return;
  var w = document.createElement("div");
  w.id = "ev59-chub-widget";
  w.style.cssText = "margin-top:12px;border-top:1px solid #374151;padding-top:10px";
  w.innerHTML = [
    "<div style='font-size:12px;font-weight:700;color:#a78bfa;margin-bottom:6px'>🤖 V59 — Jarvis Event Mode</div>",
    "<button onclick='if(typeof eas59GetJarvisReport===\"function\"){var r=eas59GetJarvisReport();document.getElementById(\"ev59-jarvis-out\").innerHTML=\"<div style=\\\"font-size:12px;color:#d1d5db;padding:8px;background:#1f2937;border-radius:6px\\\">\"+(r.summary||\"Chưa có dữ liệu\")+\"</div>\"}' style='background:#4c1d95;color:#fff;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:11px'>🤖 Phân Tích Jarvis</button>",
    "<button onclick='if(typeof ges59GetActive===\"function\"){var a=ges59GetActive();document.getElementById(\"ev59-jarvis-out\").innerHTML=\"<div style=\\\"font-size:12px;color:#d1d5db;padding:8px;background:#1f2937;border-radius:6px\\\">Đang diễn ra: \"+a.length+\" sự kiện</div>\"}' style='margin-left:6px;background:#374151;color:#fff;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:11px'>📊 Thống Kê</button>",
    "<div id='ev59-jarvis-out' style='margin-top:6px'></div>"
  ].join("");
  chub.appendChild(w);
}

// ─── mvHubRenderPanel patch (chuẩn V59) ──────────────────
window.evReg59HubRenderPanel = function() {
  setTimeout(function(){
    _injectMVHub();
    _injectPlayerHub();
    _injectCreatorHub();
  }, 300);
};

var _origMvHub = window.mvHubRenderPanel;
window.mvHubRenderPanel = function() {
  if (_origMvHub) _origMvHub.apply(this, arguments);
  window.evReg59HubRenderPanel();
};

var _origHubRender = window.hubRenderPanel;
window.hubRenderPanel = function(panelId) {
  if (_origHubRender) _origHubRender.apply(this, arguments);
  if (panelId === "player-hub-v28" || panelId === "creator-hub-v32") {
    setTimeout(function(){
      _injectPlayerHub();
      _injectCreatorHub();
    }, 300);
  }
};

function init() {
  setTimeout(function(){
    _injectMVHub();
    _injectPlayerHub();
    _injectCreatorHub();
  }, 800);
  console.log("[EventRegistryV59] 🌐 Event Registry V59 — 7 tabs · mvHub · playerHub · creatorHub widget sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
