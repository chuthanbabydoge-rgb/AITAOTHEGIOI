(function() {
"use strict";
// ============================================================
// EVENT REWARD ENGINE V59 — Phần Thưởng Sự Kiện
// Danh Hiệu · Tài Nguyên · Vật Phẩm · Danh Vọng · Thành Tựu
// EXPAND ONLY · KHÔNG GHI ĐÈ file cũ
// ============================================================
const SAVE_KEY   = "cgv6_event_rewards_v59";
const INIT_DELAY = 11200;

const TITLES_POOL = [
  { id:"world_savior",       icon:"🌍", name:"Cứu Tinh Thế Giới",    rarity:"legendary", condition:"Tham gia tiêu diệt World Boss" },
  { id:"multiverse_hero",    icon:"🌌", name:"Anh Hùng Đa Vũ Trụ",  rarity:"legendary", condition:"Hoàn thành Event Đa Vũ Trụ" },
  { id:"event_champion",     icon:"🏆", name:"Quán Quân Sự Kiện",    rarity:"epic",      condition:"Xếp hạng #1 trong Event" },
  { id:"crisis_resolver",    icon:"⚡", name:"Giải Quyết Khủng Hoảng",rarity:"epic",     condition:"Ngăn chặn Kỷ Nguyên Bóng Tối" },
  { id:"boss_slayer",        icon:"⚔️", name:"Sát Boss",             rarity:"rare",      condition:"Tiêu diệt ít nhất 1 Boss" },
  { id:"golden_herald",      icon:"✨", name:"Sứ Giả Hoàng Kim",    rarity:"rare",      condition:"Tham gia Kỷ Nguyên Vàng" },
  { id:"event_veteran",      icon:"🎖️", name:"Lão Làng Sự Kiện",    rarity:"uncommon",  condition:"Tham gia 5 sự kiện" },
  { id:"seasonal_warrior",   icon:"🌸", name:"Chiến Binh Mùa",       rarity:"common",    condition:"Hoàn thành 4 sự kiện mùa" },
  { id:"dragon_slayer",      icon:"🐉", name:"Sát Thần Long Tổ",     rarity:"legendary", condition:"Tiêu diệt Tận Thế Long Tổ" },
  { id:"void_conqueror",     icon:"🌑", name:"Chinh Phục Hư Vô",     rarity:"legendary", condition:"Tiêu diệt Chúa Tể Hư Vô" },
];

const RARITY_COLORS = {
  common:"#9ca3af", uncommon:"#22c55e", rare:"#3b82f6", epic:"#a78bfa", legendary:"#f59e0b"
};

window.eventRewardV59Data = {
  earnedTitles:    [],
  rewardHistory:   [],
  playerCP:        0,
  playerFame:      0,
  eventScore:      0,
  rankings:        [],
  totalRewarded:   0,
  initialized:     false
};

function _save() {
  try {
    var d = window.eventRewardV59Data;
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      earnedTitles: d.earnedTitles, rewardHistory: d.rewardHistory.slice(0,100),
      playerCP: d.playerCP, playerFame: d.playerFame, eventScore: d.eventScore,
      rankings: d.rankings.slice(0,20), totalRewarded: d.totalRewarded
    }));
  } catch(e) {}
}
function _load() {
  try {
    var r = localStorage.getItem(SAVE_KEY);
    if (r) { var p = JSON.parse(r); if (p) Object.assign(window.eventRewardV59Data, p); }
  } catch(e) {}
}

function _now() { return typeof window.year !== "undefined" ? window.year : 1; }

function _grantTitle(titleId) {
  var d = window.eventRewardV59Data;
  if (d.earnedTitles.some(function(t){ return t.id===titleId; })) return false;
  var def = TITLES_POOL.find(function(t){ return t.id===titleId; });
  if (!def) return false;
  d.earnedTitles.push({ ...def, earnedYear: _now() });
  return true;
}

function _addRankingEntry(source, entity, score) {
  var d = window.eventRewardV59Data;
  var existing = d.rankings.find(function(r){ return r.entity===entity; });
  if (existing) { existing.score += score; }
  else { d.rankings.push({ entity:entity, score:score, source:source }); }
  d.rankings.sort(function(a,b){ return b.score-a.score; });
  if (d.rankings.length > 50) d.rankings.length = 50;
}

window.ere59GrantReward     = function(source, eventId, rewardDef) {
  var d = window.eventRewardV59Data;
  var cp    = rewardDef && rewardDef.cp    ? rewardDef.cp    : 100;
  var fame  = rewardDef && rewardDef.fame  ? rewardDef.fame  : 200;
  var title = rewardDef && rewardDef.title ? rewardDef.title : null;
  d.playerCP    += cp;
  d.playerFame  += fame;
  d.eventScore  += cp;
  if (typeof window.pec52AddCurrency === "function") window.pec52AddCurrency("tinh_thach", Math.floor(cp/10), "event_reward");
  if (typeof window.playerAddFame === "function") window.playerAddFame(Math.floor(fame/100));
  if (title) {
    var matchedTitle = TITLES_POOL.find(function(t){ return t.name===title || t.id===title; });
    if (matchedTitle) _grantTitle(matchedTitle.id);
  }
  var entry = { year:_now(), source:source, eventId:eventId, cp:cp, fame:fame, title:title||null };
  d.rewardHistory.unshift(entry);
  if (d.rewardHistory.length > 100) d.rewardHistory.length = 100;
  d.totalRewarded++;
  _addRankingEntry(source, "Người Chơi", cp);
  if (typeof window.htAddEvent === "function") {
    window.htAddEvent({ year:_now(), type:"reward", title:"🏆 Nhận thưởng: "+cp+" CP + "+fame+" Fame", color:"#fbbf24" });
  }
  _save();
  return { cp:cp, fame:fame, title:title };
};

window.ere59GetTitles       = function() { return window.eventRewardV59Data.earnedTitles; };
window.ere59GetTitlesPool   = function() { return TITLES_POOL; };
window.ere59GetHistory      = function() { return window.eventRewardV59Data.rewardHistory; };
window.ere59GetRankings     = function() { return window.eventRewardV59Data.rankings; };
window.ere59GetPlayerStats  = function() {
  var d = window.eventRewardV59Data;
  return { cp:d.playerCP, fame:d.playerFame, score:d.eventScore, titles:d.earnedTitles.length, totalRewarded:d.totalRewarded };
};
window.ere59GetRarityColor  = function(r) { return RARITY_COLORS[r] || "#9ca3af"; };
window.ere59ManualGrant     = function(titleId) {
  var ok = _grantTitle(titleId);
  if (ok) _save();
  return { ok:ok };
};

window.ges59OnEventEnd = function(ev) {
  var cp   = 100 + ev.priority * 50;
  var fame = 200 + ev.priority * 100;
  window.ere59GrantReward("event_complete", ev.defId, { cp:cp, fame:fame });
};

function init() {
  _load();
  window.eventRewardV59Data.initialized = true;
  console.log("[EventRewardEngineV59] 🏆 Phần Thưởng V59 — " + TITLES_POOL.length + " danh hiệu · CP · Fame · Rankings sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
