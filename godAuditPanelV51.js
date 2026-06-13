(function() {
"use strict";
// ============================================================
// GOD AUDIT PANEL V51 — Creator God Online
// Audit Mode: Active Systems · Dormant · Performance · Save Status
// EXPAND ONLY · KHÔNG GHI ĐÈ file cũ · Passive (no gameTick)
// ============================================================
const INIT_DELAY = 6600;

const KNOWN_SYSTEMS = [
  // Core
  { id:"app",                label:"Core App",             file:"app.js",                 checkFn:"gameTick" },
  { id:"saveManager",        label:"Save Manager",         file:"saveManager.js",          checkFn:"smSave" },
  { id:"living-world",       label:"Living World Engine",  file:"living-world-engine.js",  checkFn:"lweGetNPCs" },
  // Economy
  { id:"economy",            label:"Economy V1",           file:"economyEngine.js",        checkFn:"eRenderPanel" },
  { id:"economyV2",          label:"Economy V2",           file:"economyEngineV2.js",      checkFn:"ev2RenderPanel" },
  { id:"marketplace",        label:"World Marketplace",    file:"worldMarketplace.js",     checkFn:"wmRenderPanel" },
  // War
  { id:"warEngine",          label:"War Engine",           file:"warEngine.js",            checkFn:"warsActive" },
  { id:"territory",          label:"Territory War",        file:"territoryWarSystem.js",   checkFn:"twRenderPanel" },
  // Diplomacy V24
  { id:"alliance",           label:"Alliance V24",         file:"allianceEngine.js",       checkFn:"aeAreAllied" },
  { id:"treaty",             label:"Treaty V24",           file:"treatyEngine.js",         checkFn:"teHasTreaty" },
  { id:"sanction",           label:"Sanction V24",         file:"sanctionEngine.js",       checkFn:"sanctionData" },
  { id:"worldcouncil",       label:"World Council V24",    file:"worldCouncilEngine.js",   checkFn:"worldCouncilData" },
  // Kingdom/Empire V23
  { id:"kingdom",            label:"Kingdom Engine",       file:"kingdomEngine.js",        checkFn:"kingdomData" },
  { id:"empire",             label:"Empire Engine",        file:"empireEngine.js",         checkFn:"empireData" },
  { id:"dynasty",            label:"Dynasty Engine",       file:"dynastyEngine.js",        checkFn:"dynastyEngineData" },
  { id:"bloodline",          label:"Bloodline Engine",     file:"bloodlineEngine.js",      checkFn:"bloodlineData" },
  // World Simulation
  { id:"worldEvent",         label:"World Events V1",      file:"worldEventEngine.js",     checkFn:"weData" },
  { id:"worldEventV25",      label:"World Events V25",     file:"worldEventEngineV25.js",  checkFn:"worldEventV25Data" },
  { id:"technology",         label:"Technology Engine",    file:"technologyEngine.js",     checkFn:"techData" },
  { id:"religion",           label:"Political Religion",   file:"politicalReligionEngine.js", checkFn:"religionData" },
  { id:"culture",            label:"Culture Heritage",     file:"cultureHeritageEngine.js",checkFn:"cultureData" },
  { id:"mythology",          label:"Mythology Engine",     file:"mythologyEngine.js",      checkFn:"mythologyData" },
  // Events V25
  { id:"disaster",           label:"Disaster Engine V25",  file:"disasterEngine.js",       checkFn:"disasterData" },
  { id:"plague",             label:"Plague Engine V25",    file:"plagueEngine.js",         checkFn:"plagueData" },
  { id:"econCrisis",         label:"Economic Crisis V25",  file:"economicCrisisEngine.js", checkFn:"econCrisisData" },
  // Continent V26
  { id:"continent",          label:"Continent Engine V26", file:"continentEngineV26.js",   checkFn:"cev26Data" },
  // Ocean V27
  { id:"naval",              label:"Naval Ocean",          file:"navalOceanEngine.js",     checkFn:"navalData" },
  // Sect V29
  { id:"sect",               label:"Sect Engine V29",      file:"sectEngineV29.js",        checkFn:"sectV29Data" },
  // Divine V30
  { id:"divine",             label:"Divine Being Engine",  file:"divineBeingEngine.js",    checkFn:"divineBeingData" },
  { id:"pantheon",           label:"Pantheon V30",         file:"pantheonEngineV30.js",    checkFn:"pantheonData" },
  // Combat V31
  { id:"worldBoss",          label:"World Boss V31",       file:"worldBossEngineV31.js",   checkFn:"wbv31Data" },
  { id:"dungeon",            label:"Dungeon V31",          file:"dungeonEngineV31.js",     checkFn:"dev31Data" },
  // Creator V32
  { id:"creatorControl",     label:"Creator Control V32",  file:"creatorGodControl.js",    checkFn:"creatorControlData" },
  { id:"creatorAnalytics",   label:"Creator Analytics",    file:"creatorAnalytics.js",     checkFn:"creatorAnalyticsRenderPanel" },
  // Thủ Hộ Thần V33
  { id:"thuhothan",          label:"Thủ Hộ Thần V33",     file:"thuhothanCore.js",        checkFn:"thtRenderPanel" },
  // Multiverse V35
  { id:"multiverse",         label:"Multiverse Engine",    file:"multiverseEngine.js",     checkFn:"multiverseData" },
  // Timeline V36
  { id:"timeline",           label:"Timeline Engine",      file:"timelineEngine.js",       checkFn:"timelineData" },
  // Creator AI V41
  { id:"creatorBrain",       label:"Creator Brain V41",    file:"creatorBrain.js",         checkFn:"cbrnAnalyzeWorld" },
  { id:"creatorAI",          label:"Creator AI V41",       file:"creatorAI.js",            checkFn:"caiData" },
  // Mythology V42
  { id:"mythDatabase",       label:"Myth Database V42",    file:"mythologyDatabase.js",    checkFn:"mdbRenderPanel" },
  // World Age V43
  { id:"worldAge",           label:"World Age V43",        file:"worldAgeEngine.js",       checkFn:"waeData" },
  // Race Evolution V44
  { id:"raceEvolution",      label:"Race Evolution V44",   file:"raceEvolutionCore.js",    checkFn:"recGetAll" },
  // Ecosystem V45
  { id:"ecoClimate",         label:"Eco Climate V45",      file:"ecoClimateEngine.js",     checkFn:"ecoGetCurrentClimate" },
  { id:"ecoCreature",        label:"Eco Creatures V45",    file:"ecoCreatureEngine.js",    checkFn:"ecoGetAliveCreatures" },
  // Hero V47
  { id:"legendV47",          label:"Legend Engine V47",    file:"legendEngineV47.js",      checkFn:"legV47GetEpics" },
  { id:"fameV47",            label:"Fame System V47",      file:"fameSystemV47.js",        checkFn:"fv47GetProfiles" },
  // Disaster V48
  { id:"globalDisasterV48",  label:"Global Disaster V48",  file:"globalDisasterCoreV48.js",checkFn:"gdV48GetStats" },
  { id:"anomalyV48",         label:"Anomaly Engine V48",   file:"anomalyEngineV48.js",     checkFn:"anomV48GetActive" },
  // Politics V49
  { id:"govV49",             label:"Government V49",       file:"governmentSystemV49.js",  checkFn:"govV49Data" },
  { id:"factionV49",         label:"Faction V49",          file:"politicalFactionV49.js",  checkFn:"factionV49Data" },
  { id:"crisisV49",          label:"Crisis V49",           file:"politicalCrisisV49.js",   checkFn:"crisisV49Data" },
  // Player V50
  { id:"playerCoreV50",      label:"Player Core V50",      file:"playerCoreV50.js",        checkFn:"playerCoreV50Data" },
  { id:"professionV50",      label:"Profession V50",       file:"professionSystemV50.js",  checkFn:"professionV50Data" },
  { id:"achievementV50",     label:"Achievement V50",      file:"playerAchievementV50.js", checkFn:"achV50Data" },
  // V51
  { id:"authorityV51",       label:"Creator Authority V51",file:"creatorAuthorityEngineV51.js", checkFn:"creatorAuthorityV51Data" },
  { id:"miracleV51",         label:"Miracle System V51",   file:"miracleSystemV51.js",     checkFn:"miracleV51Data" },
  { id:"prophecyV51",        label:"Prophecy System V51",  file:"prophecySystemV51.js",    checkFn:"prophecyV51Data" },
  { id:"globalEventV51",     label:"Global Event V51",     file:"globalEventControlV51.js",checkFn:"globalEventV51Data" }
];

function checkActive(sys) {
  try {
    return typeof window[sys.checkFn] !== 'undefined';
  } catch(e) { return false; }
}

function getSaveKeys() {
  const keys = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('cgv6_')) {
        let size = 0;
        try { size = (localStorage.getItem(k)||'').length; } catch(e){}
        keys.push({ key:k, size, sizeKB:(size/1024).toFixed(1) });
      }
    }
    keys.sort(function(a,b){ return b.size - a.size; });
  } catch(e) {}
  return keys;
}

function getTotalSaveSize() {
  let total = 0;
  try {
    for (let i=0; i<localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('cgv6_')) total += (localStorage.getItem(k)||'').length;
    }
  } catch(e){}
  return (total/1024).toFixed(1);
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

window.cgv51GetAuditSystems = function() {
  return KNOWN_SYSTEMS.map(function(sys) {
    return {
      id: sys.id,
      label: sys.label,
      file: sys.file,
      active: checkActive(sys),
      checkFn: sys.checkFn
    };
  });
};

window.cgv51GetAuditStats = function() {
  const systems = window.cgv51GetAuditSystems();
  const active   = systems.filter(function(s){ return s.active; }).length;
  const dormant  = systems.filter(function(s){ return !s.active; }).length;
  const saveKeys = getSaveKeys();
  return {
    totalSystems: systems.length,
    activeSystems: active,
    dormantSystems: dormant,
    activePercent: ((active/systems.length)*100).toFixed(0),
    totalSaveKB: getTotalSaveSize(),
    saveKeyCount: saveKeys.length,
    topSaveKeys: saveKeys.slice(0,10)
  };
};

window.cgv51GetSaveReport = function() {
  return getSaveKeys();
};

window.cgv51GetJarvisReport = function() {
  const systems = window.cgv51GetAuditSystems();
  const stats   = window.cgv51GetAuditStats();
  const dormant = systems.filter(function(s){ return !s.active; });
  const warnings = [];
  const suggestions = [];

  if (dormant.length > 5) {
    warnings.push('⚠️ '+dormant.length+' hệ thống đang ngủ yên — kiểm tra thứ tự load script');
  }
  if (parseFloat(stats.totalSaveKB) > 2000) {
    warnings.push('⚠️ Save data > 2MB — nên dọn dẹp định kỳ');
  }
  if (typeof window.disasterData !== 'undefined' && window.disasterData && window.disasterData.activeDisasters && window.disasterData.activeDisasters.length > 3) {
    warnings.push('🌋 '+window.disasterData.activeDisasters.length+' thiên tai đang xảy ra — xem xét dùng Divine Shield');
  }
  if (typeof window.warsActive !== 'undefined' && window.warsActive && window.warsActive.length > 5) {
    warnings.push('⚔️ '+window.warsActive.length+' cuộc chiến đang diễn ra — cân nhắc Sắc Lệnh Hòa Bình');
  }
  if (typeof window.creatorAuthorityV51Data !== 'undefined' && window.creatorAuthorityV51Data.divineEnergy < 200) {
    warnings.push('⚡ Thiên Năng thấp ('+window.creatorAuthorityV51Data.divineEnergy+') — chờ nạp hoặc tiết kiệm');
  }

  if (typeof window.cgv51GetActiveProphecies === 'function' && window.cgv51GetActiveProphecies().length === 0) {
    suggestions.push('🔮 Chưa có lời tiên tri — hãy ban xuống một Thiên Khải để định hướng thế giới');
  }
  if (typeof window.globalEventV51Data !== 'undefined' && window.globalEventV51Data.activeEvents.length === 0) {
    suggestions.push('⚡ Không có sự kiện toàn cầu — tạo Festival hoặc Golden Age để thúc đẩy văn minh');
  }
  if (typeof window.npcs !== 'undefined') {
    const alive = window.npcs.filter(function(n){ return n.status==='alive'; }).length;
    if (alive < 10) suggestions.push('👥 Dân số thấp ('+alive+' NPC) — dùng Golden Harvest để khuyến khích sinh sản');
  }

  return {
    warnings,
    suggestions,
    systemHealth: stats.activePercent + '%',
    saveSize: stats.totalSaveKB + ' KB',
    topIssue: warnings.length > 0 ? warnings[0] : '✅ Thế giới ổn định — không có vấn đề nghiêm trọng'
  };
};

function init() {
  console.log("[GodAuditPanelV51] 📊 Audit Panel V51 khởi động — "+KNOWN_SYSTEMS.length+" hệ thống được theo dõi · Save Inspector · Jarvis God Mode sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
