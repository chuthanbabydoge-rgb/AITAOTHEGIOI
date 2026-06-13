(function() {
"use strict";
// ============================================================
// EVENT ARCHIVE SYSTEM V59 — Lưu Trữ Sự Kiện Lịch Sử
// Toàn bộ event · Người chiến thắng · Tác động lịch sử
// EXPAND ONLY · KHÔNG GHI ĐÈ file cũ
// ============================================================
const SAVE_KEY   = "cgv6_event_archive_v59";
const INIT_DELAY = 11300;

window.eventArchiveV59Data = {
  archive:         [],
  bossKillRecords: [],
  categoryStats:   {},
  biggestEvents:   [],
  totalArchived:   0,
  initialized:     false
};

function _save() {
  try {
    var d = window.eventArchiveV59Data;
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      archive: d.archive.slice(0,300), bossKillRecords: d.bossKillRecords.slice(0,50),
      categoryStats: d.categoryStats, biggestEvents: d.biggestEvents.slice(0,20),
      totalArchived: d.totalArchived
    }));
  } catch(e) {}
}
function _load() {
  try {
    var r = localStorage.getItem(SAVE_KEY);
    if (r) { var p = JSON.parse(r); if (p) Object.assign(window.eventArchiveV59Data, p); }
  } catch(e) {}
}

function _now() { return typeof window.year !== "undefined" ? window.year : 1; }

function _archive(ev, meta) {
  var d = window.eventArchiveV59Data;
  var entry = {
    id:       ev.id || ("arch_"+Date.now()),
    defId:    ev.defId || ev.id || "unknown",
    icon:     ev.icon || "📋",
    label:    ev.label || ev.name || "Sự Kiện",
    category: ev.category || ev.cat || "general",
    source:   ev.source || "system",
    year:     ev.year || _now(),
    endedYear:ev.endedAt || _now(),
    duration: (ev.endedAt||_now()) - (ev.startedAt||ev.year||_now()),
    status:   ev.status || "completed",
    winner:   meta && meta.winner ? meta.winner : null,
    impact:   meta && meta.impact ? meta.impact : null,
    notes:    meta && meta.notes  ? meta.notes  : null
  };
  d.archive.unshift(entry);
  if (d.archive.length > 300) d.archive.length = 300;
  d.totalArchived++;
  var cat = entry.category;
  if (!d.categoryStats[cat]) d.categoryStats[cat] = { count:0, lastYear:0 };
  d.categoryStats[cat].count++;
  d.categoryStats[cat].lastYear = entry.year;
  if (d.biggestEvents.length < 20 || (entry.duration||0) > (d.biggestEvents[d.biggestEvents.length-1]||{}).duration) {
    d.biggestEvents.push(entry);
    d.biggestEvents.sort(function(a,b){ return (b.duration||0)-(a.duration||0); });
    if (d.biggestEvents.length > 20) d.biggestEvents.length = 20;
  }
  _save();
}

function _archiveBossKill(boss) {
  var d = window.eventArchiveV59Data;
  var record = {
    bossUid:     boss.uid,
    bossName:    boss.name,
    bossTier:    boss.tier,
    icon:        boss.icon,
    year:        boss.defeatedYear || _now(),
    spawnedYear: boss.spawnedYear,
    participants:boss.participantCount || 0,
    aiAllies:    boss.aiAllies || [],
    reward:      boss.reward
  };
  d.bossKillRecords.unshift(record);
  if (d.bossKillRecords.length > 50) d.bossKillRecords.length = 50;
  _archive({ id:"boss_kill_"+boss.uid, icon:boss.icon, label:boss.name+" bị tiêu diệt", category:"boss",
    year:boss.spawnedYear, endedAt:boss.defeatedYear||_now(), startedAt:boss.spawnedYear,
    source:"boss_system", status:"completed" },
    { winner:"Người Chơi + AI Alliance", impact:"Boss "+boss.tier+" bị hạ — thế giới an bình" });
}

window.eas59GetArchive      = function(cat) {
  var d = window.eventArchiveV59Data;
  if (cat) return d.archive.filter(function(e){ return e.category===cat; });
  return d.archive;
};
window.eas59GetBossKills    = function() { return window.eventArchiveV59Data.bossKillRecords; };
window.eas59GetStats        = function() {
  var d = window.eventArchiveV59Data;
  return { total:d.totalArchived, categories:d.categoryStats, biggest:d.biggestEvents.slice(0,5) };
};
window.eas59GetBiggest      = function() { return window.eventArchiveV59Data.biggestEvents; };
window.eas59ManualArchive   = function(ev, meta) { _archive(ev, meta); };
window.eas59GetJarvisReport = function() {
  var d = window.eventArchiveV59Data;
  var total = d.totalArchived;
  var cats = Object.keys(d.categoryStats).map(function(k){
    return { cat:k, count:d.categoryStats[k].count };
  }).sort(function(a,b){ return b.count-a.count; });
  var top3 = cats.slice(0,3);
  return {
    totalEvents: total,
    topCategories: top3,
    bosses: d.bossKillRecords.length,
    biggestEvent: d.biggestEvents[0] || null,
    summary: "Đã lưu trữ " + total + " sự kiện. Phổ biến nhất: " + (top3[0]?top3[0].cat:"N/A") + "."
  };
};

window.mvevt59OnFire = function(ev) {
  setTimeout(function() { _archive(ev); }, 100);
};

function _patchOnEventEnd() {
  var _origEnd = window.ges59OnEventEnd;
  window.ges59OnEventEnd = function(ev) {
    if (_origEnd) _origEnd(ev);
    _archive(ev);
  };
  var _origBoss = window.wb59GetDefeated;
}

function init() {
  _load();
  window.eventArchiveV59Data.initialized = true;
  _patchOnEventEnd();
  var _orig = window.gameTick;
  window.gameTick = function() {
    if (_orig) _orig();
    var defeated = typeof window.worldBossV59Data !== "undefined" ? window.worldBossV59Data.defeatedBosses : [];
    if (defeated && defeated.length > 0) {
      var last = defeated[0];
      if (last && last.defeatedYear && last.defeatedYear > 0) {
        var alreadyArchived = window.eventArchiveV59Data.bossKillRecords.some(function(r){ return r.bossUid===last.uid; });
        if (!alreadyArchived) _archiveBossKill(last);
      }
    }
  };
  console.log("[EventArchiveSystemV59] 📚 Lưu Trữ V59 — Toàn bộ events · Boss kills · Thống kê danh mục sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
