(function() {
"use strict";
// ============================================================
// WORLD BOSS SYSTEM V59 — Boss Đa Vũ Trụ & Đe Dọa Toàn Cầu
// Extends worldBossEngineV31 · Multi-country threats · Multiverse threats
// AI Alliance · Coordination · Tiêu diệt · Phần thưởng
// EXPAND ONLY · KHÔNG GHI ĐÈ worldBossEngineV31.js
// ============================================================
const SAVE_KEY   = "cgv6_world_boss_v59";
const INIT_DELAY = 11100;

const MEGA_BOSS_TEMPLATES = [
  {
    id:"apocalypse_dragon",    icon:"🐉", name:"Tận Thế Long Tổ",
    title:"Kẻ Hủy Diệt Thế Giới", tier:"multiverse",
    hp:500000000, power:50, regions:["all"],
    threat:"global", abilities:["Rồng Lửa Thiên Địa","Quy Ẩn Hư Không","Tái Sinh Vô Tận","Long Áp Đa Vũ Trụ"],
    minYear:200, cooldown:300,
    reward:{ cp:5000, fame:10000, title:"Thần Long Sát Thủ" }
  },
  {
    id:"void_overlord",        icon:"🌑", name:"Chúa Tể Hư Vô",
    title:"Thống Trị Mọi Chiều Không Gian", tier:"multiverse",
    hp:300000000, power:40, regions:["all"],
    threat:"multiverse", abilities:["Nuốt Thực Thể","Hư Vô Hóa","Chiều Không Gian Sụp Đổ","Tâm Trí Xóa Sổ"],
    minYear:150, cooldown:250,
    reward:{ cp:4000, fame:8000, title:"Vô Địch Hư Không" }
  },
  {
    id:"chaos_titan",          icon:"🌪️", name:"Titan Hỗn Độn",
    title:"Sinh Ra Từ Đầu Vũ Trụ", tier:"legendary",
    hp:150000000, power:30, regions:5,
    threat:"regional", abilities:["Hỗn Độn Phóng Thích","Vạn Vật Tan Rã","Titan Bước Chân","Nguyên Thủy Nổi Giận"],
    minYear:100, cooldown:180,
    reward:{ cp:3000, fame:6000, title:"Titan Hạ" }
  },
  {
    id:"death_emperor",        icon:"💀", name:"Tử Thần Đế",
    title:"Vua Của Cõi Chết", tier:"divine",
    hp:80000000, power:20, regions:3,
    threat:"regional", abilities:["Linh Hồn Thu Hoạch","Chết Tức Thì","Quân Đoàn Xác Sống","Tử Khí Bao Phủ"],
    minYear:80, cooldown:120,
    reward:{ cp:2000, fame:4000, title:"Tử Thần Sát" }
  },
  {
    id:"plague_mother",        icon:"☣️", name:"Dịch Mẫu Vĩnh Cửu",
    title:"Mẹ Của Mọi Bệnh Dịch", tier:"epic",
    hp:40000000, power:15, regions:2,
    threat:"regional", abilities:["Đại Ôn Dịch","Biến Thể Virus","Lây Lan Thần Tốc","Kháng Thuốc Vô Hạn"],
    minYear:50, cooldown:90,
    reward:{ cp:1500, fame:3000, title:"Dịch Bình" }
  },
];

window.worldBossV59Data = {
  activeBosses:   [],
  defeatedBosses: [],
  allianceGroups: [],
  totalSpawned:   0,
  totalDefeated:  0,
  tick:           0,
  initialized:    false
};

function _save() {
  try {
    var d = window.worldBossV59Data;
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      activeBosses: d.activeBosses, defeatedBosses: d.defeatedBosses.slice(0,50),
      allianceGroups: d.allianceGroups, totalSpawned: d.totalSpawned,
      totalDefeated: d.totalDefeated, tick: d.tick
    }));
  } catch(e) {}
}
function _load() {
  try {
    var r = localStorage.getItem(SAVE_KEY);
    if (r) { var p = JSON.parse(r); if (p) Object.assign(window.worldBossV59Data, p); }
  } catch(e) {}
}

function _now() { return typeof window.year !== "undefined" ? window.year : 1; }
var _idCtr = 1;

function _spawnBoss(template, source) {
  var d = window.worldBossV59Data;
  var countries = (window.countries && Array.isArray(window.countries)) ? window.countries : [];
  var threatenedCountries = [];
  if (template.regions === "all") {
    threatenedCountries = countries.map(function(c){ return c.name||"?"; });
  } else {
    var cnt = typeof template.regions === "number" ? template.regions : 3;
    var shuffled = countries.slice().sort(function(){ return 0.5-Math.random(); });
    threatenedCountries = shuffled.slice(0, cnt).map(function(c){ return c.name||"?"; });
  }
  var boss = {
    uid:      "wb59_" + (++_idCtr),
    defId:    template.id,
    icon:     template.icon,
    name:     template.name,
    title:    template.title,
    tier:     template.tier,
    maxHp:    template.hp,
    hp:       template.hp,
    power:    template.power,
    threat:   template.threat,
    abilities:template.abilities,
    reward:   template.reward,
    threatenedCountries: threatenedCountries,
    spawnedYear: _now(),
    source:   source || "auto",
    status:   "active",
    damageDealt: 0,
    aiAllies:    [],
    participantCount: 0
  };
  d.activeBosses.push(boss);
  d.totalSpawned++;
  _formAIAlliance(boss);
  if (typeof window.htAddEvent === "function") {
    window.htAddEvent({ year:_now(), type:"boss", title: boss.icon+" "+boss.name+" xuất hiện — Tier: "+boss.tier, color:"#ef4444" });
  }
  if (typeof window.wmeAddMemory === "function") {
    window.wmeAddMemory({ year:_now(), category:"world_boss", title:"Boss "+boss.name, content: boss.name+" ("+boss.tier+") xuất hiện đe dọa "+threatenedCountries.slice(0,3).join(", ") });
  }
  return boss;
}

function _formAIAlliance(boss) {
  var d = window.worldBossV59Data;
  var countries = (window.countries && Array.isArray(window.countries)) ? window.countries : [];
  var allies = countries.slice().sort(function(){ return 0.5-Math.random(); }).slice(0,5).map(function(c){ return c.name||"?"; });
  var group = { bossUid: boss.uid, bossName: boss.name, members: allies, formedYear: _now() };
  d.allianceGroups.push(group);
  boss.aiAllies = allies;
}

function _processBossHP(boss) {
  var allies = boss.aiAllies.length || 1;
  var dmg = (allies * 500000) + Math.floor(Math.random() * 1000000);
  boss.hp -= dmg;
  boss.damageDealt += dmg;
  boss.participantCount++;
  if (boss.hp <= 0) {
    boss.hp = 0;
    boss.status = "defeated";
    boss.defeatedYear = _now();
    return true;
  }
  return false;
}

function _defeatBoss(boss) {
  var d = window.worldBossV59Data;
  d.totalDefeated++;
  d.defeatedBosses.unshift({ ...boss });
  if (d.defeatedBosses.length > 50) d.defeatedBosses.length = 50;
  if (typeof window.ere59GrantReward === "function") {
    window.ere59GrantReward("boss_kill", boss.defId, boss.reward);
  }
  if (typeof window.htAddEvent === "function") {
    window.htAddEvent({ year:_now(), type:"victory", title: boss.icon+" "+boss.name+" bị tiêu diệt!", color:"#10b981" });
  }
}

function _tick() {
  var d = window.worldBossV59Data;
  d.tick++;
  d.activeBosses = d.activeBosses.filter(function(boss) {
    if (boss.status === "active") {
      if (d.tick % 10 === 0) {
        var defeated = _processBossHP(boss);
        if (defeated) { _defeatBoss(boss); return false; }
      }
    }
    return boss.status === "active";
  });
  if (d.tick % 200 === 0) {
    var now = _now();
    MEGA_BOSS_TEMPLATES.forEach(function(tpl) {
      if (now >= tpl.minYear && Math.random() < 0.015) {
        var alreadyActive = d.activeBosses.some(function(b){ return b.defId===tpl.id; });
        if (!alreadyActive) _spawnBoss(tpl, "auto");
      }
    });
    _save();
  }
}

window.wb59GetActive      = function() { return window.worldBossV59Data.activeBosses; };
window.wb59GetDefeated    = function() { return window.worldBossV59Data.defeatedBosses; };
window.wb59GetAlliances   = function() { return window.worldBossV59Data.allianceGroups; };
window.wb59GetTemplates   = function() { return MEGA_BOSS_TEMPLATES; };
window.wb59GetStats       = function() {
  var d = window.worldBossV59Data;
  return { totalSpawned: d.totalSpawned, totalDefeated: d.totalDefeated, active: d.activeBosses.length };
};
window.wb59SpawnBoss      = function(templateId) {
  var tpl = MEGA_BOSS_TEMPLATES.find(function(t){ return t.id===templateId; });
  if (!tpl) return { ok:false, msg:"Không tìm thấy boss: "+templateId };
  return { ok:true, boss: _spawnBoss(tpl, "manual") };
};
window.wb59AttackBoss     = function(bossUid, damage) {
  var d = window.worldBossV59Data;
  var boss = d.activeBosses.find(function(b){ return b.uid===bossUid; });
  if (!boss) return { ok:false, msg:"Không tìm thấy boss" };
  boss.hp = Math.max(0, boss.hp - (damage||1000000));
  boss.damageDealt += (damage||1000000);
  if (boss.hp <= 0) { boss.status="defeated"; _defeatBoss(boss); }
  _save();
  return { ok:true, remaining: boss.hp };
};

function init() {
  _load();
  window.worldBossV59Data.initialized = true;
  var _orig = window.gameTick;
  window.gameTick = function() { if (_orig) _orig(); _tick(); };
  console.log("[WorldBossSystemV59] 👹 World Boss V59 — 5 mega-boss · Đa vũ trụ đe dọa · AI Alliance · Liên kết V31 sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
