(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATOR BRAIN V41 — Core World Analysis Engine
  // Phân tích thế giới · Cung cấp dữ liệu cho các hệ thống V41 khác
  // PASSIVE ENGINE — không có tab riêng, không gameTick, không save key riêng
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── HELPERS ──────────────────────────────────────────────────────────────
  function safeArr(arr) { return Array.isArray(arr) ? arr : (arr ? Object.values(arr) : []); }
  function now() { return (typeof window.year !== "undefined") ? window.year : 0; }

  // ─── WORLD ANALYSIS CORE ──────────────────────────────────────────────────
  window.cbrnAnalyzeWorld = function() {
    var result = {
      year: now(), ts: Date.now(),
      population: _analyzePopulation(),
      warfare: _analyzeWarfare(),
      economy: _analyzeEconomy(),
      religion: _analyzeReligion(),
      technology: _analyzeTechnology(),
      divine: _analyzeDivine(),
      multiverse: _analyzeMultiverse(),
      races: _analyzeRaces(),
      bosses: _analyzeBosses(),
      v40creations: _analyzeV40Creations(),
    };
    result.overallScore = _computeOverallScore(result);
    result.topThreats   = _findTopThreats(result);
    result.topOpps      = _findOpportunities(result);
    return result;
  };

  function _analyzePopulation() {
    var npcsArr     = typeof npcs !== "undefined" ? safeArr(npcs) : [];
    var alive       = npcsArr.filter(function(n){ return n.status === "alive"; }).length;
    var kingdoms    = safeArr(window.kingdomData && window.kingdomData.kingdoms).length;
    var empires     = safeArr(window.empireData  && window.empireData.empires ).length;
    var countries   = typeof window.countries !== "undefined" ? safeArr(window.countries).length : 0;
    var score = Math.min(100, ((alive/Math.max(1,kingdoms*50))*40 + (kingdoms>3?30:kingdoms*10) + (empires>1?30:empires*15)));
    return { alive:alive, kingdoms:kingdoms, empires:empires, countries:countries, score:Math.floor(score), status: score<30?"Thưa Dân":score<60?"Bình Thường":"Đông Đúc" };
  }

  function _analyzeWarfare() {
    var wars      = safeArr(window.warsActive).length;
    var mv39wars  = (window.mv39WarData && window.mv39WarData.wars) ? safeArr(window.mv39WarData.wars).filter(function(w){ return w.status==="ongoing"; }).length : 0;
    var total     = wars + mv39wars;
    var score = Math.min(100, total * 15);
    return { activeWars:total, worldWars:wars, multiverseWars:mv39wars, score:score, status: score>70?"Đại Chiến":score>40?"Xung Đột":score>15?"Căng Thẳng":"Hòa Bình" };
  }

  function _analyzeEconomy() {
    var kingdoms  = safeArr(window.kingdomData && window.kingdomData.kingdoms);
    var avgWealth = kingdoms.length > 0 ? kingdoms.reduce(function(s,k){ return s+(k.wealth||k.resources||50); }, 0)/kingdoms.length : 50;
    var crises    = (window.econCrisisData && window.econCrisisData.activeEvents) ? safeArr(window.econCrisisData.activeEvents).length : 0;
    var score = Math.max(0, Math.min(100, avgWealth*0.8 - crises*20));
    return { avgWealth:Math.floor(avgWealth), activeCrises:crises, score:Math.floor(score), status: score<30?"Khủng Hoảng":score<60?"Bất Ổn":score<85?"Ổn Định":"Phồn Thịnh" };
  }

  function _analyzeReligion() {
    var sects     = (window.sectV29Data && window.sectV29Data.sects) ? safeArr(window.sectV29Data.sects).length : 0;
    var deities   = (window.divineBeingData && window.divineBeingData.beings) ? safeArr(window.divineBeingData.beings).filter(function(d){ return d.active!==false; }).length : 0;
    deities      += (window.divineAdminData && window.divineAdminData.createdDeities) ? safeArr(window.divineAdminData.createdDeities).filter(function(d){ return d.active!==false; }).length : 0;
    deities      += (window.cgfData && window.cgfData.gods) ? safeArr(window.cgfData.gods).length : 0;
    var score = Math.min(100, sects*15 + deities*10);
    return { sects:sects, deities:deities, score:Math.floor(score), status: score<20?"Vô Thần":score<50?"Tín Ngưỡng Thấp":score<80?"Sùng Đạo":"Thần Quyền" };
  }

  function _analyzeTechnology() {
    var techData  = window.techData || window.technologyData;
    var techLevel = (techData && techData.currentLevel) ? techData.currentLevel : 30;
    var civScore  = (window.civEvData && window.civEvData.universeScore) ? window.civEvData.universeScore : techLevel;
    var score = Math.min(100, civScore || techLevel);
    return { techLevel:techLevel, civScore:civScore, score:Math.floor(score), status: score<25?"Nguyên Thủy":score<50?"Trung Cổ":score<75?"Cận Đại":"Siêu Tiến Bộ" };
  }

  function _analyzeDivine() {
    var wars   = (window.divineWarData && window.divineWarData.wars) ? safeArr(window.divineWarData.wars).filter(function(w){ return w.status==="active"; }).length : 0;
    var realms = (window.realmV30Data  && window.realmV30Data.realms ) ? safeArr(window.realmV30Data.realms ).length : 0;
    var score = Math.min(100, realms*20 + wars*15);
    return { divineWars:wars, realms:realms, score:Math.floor(score), status: score<20?"Thần Vắng Mặt":score<50?"Thần Hiện Diện":score<80?"Thần Tham Chiến":"Thiên Chiến" };
  }

  function _analyzeMultiverse() {
    var univs  = (window.mvData && window.mvData.universes) ? safeArr(window.mvData.universes).length : 0;
    univs     += (window.cufData && window.cufData.universes) ? safeArr(window.cufData.universes).length : 0;
    var inv    = (window.mv39InvData && window.mv39InvData.invasions) ? safeArr(window.mv39InvData.invasions).filter(function(i){ return i.status==="active"; }).length : 0;
    var score = Math.min(100, univs*12 + inv*20);
    return { universes:univs, activeInvasions:inv, score:Math.floor(score), status: score<20?"Đơn Vũ Trụ":score<50?"Đa Vũ Trụ Non Trẻ":score<80?"Đa Vũ Trụ Phát Triển":"Vũ Trụ Siêu Việt" };
  }

  function _analyzeRaces() {
    var created = (window.crfData && window.crfData.races) ? safeArr(window.crfData.races).length : 0;
    var native  = typeof npcs !== "undefined" ? [...new Set(safeArr(npcs).map(function(n){ return n.race||n.class; }).filter(Boolean))].length : 0;
    return { created:created, nativeTypes:native, total:created+native, score:Math.min(100, (created+native)*10) };
  }

  function _analyzeBosses() {
    var v31 = (window.worldBossData && window.worldBossData.bosses) ? safeArr(window.worldBossData.bosses).filter(function(b){ return b.alive!==false; }).length : 0;
    var v40 = (window.cbfData && window.cbfData.bosses) ? safeArr(window.cbfData.bosses).filter(function(b){ return b.status==="active"; }).length : 0;
    return { v31bosses:v31, v40bosses:v40, total:v31+v40, score:Math.min(100, (v31+v40)*20) };
  }

  function _analyzeV40Creations() {
    return {
      races:     (window.crfData  && window.crfData.races)      ? safeArr(window.crfData.races).length     : 0,
      items:     (window.cifData  && window.cifData.items)      ? safeArr(window.cifData.items).length      : 0,
      bosses:    (window.cbfData  && window.cbfData.bosses)     ? safeArr(window.cbfData.bosses).length     : 0,
      gods:      (window.cgfData  && window.cgfData.gods)       ? safeArr(window.cgfData.gods).length       : 0,
      nations:   (window.cnfData  && window.cnfData.nations)    ? safeArr(window.cnfData.nations).length    : 0,
      empires:   (window.cnfData  && window.cnfData.empires)    ? safeArr(window.cnfData.empires).length    : 0,
      universes: (window.cufData  && window.cufData.universes)  ? safeArr(window.cufData.universes).length  : 0,
    };
  }

  function _computeOverallScore(r) {
    return Math.floor((r.population.score + (100-r.warfare.score) + r.economy.score + r.religion.score + r.technology.score + r.divine.score + r.multiverse.score) / 7);
  }

  function _findTopThreats(r) {
    var threats = [];
    if (r.warfare.score > 70)    threats.push({ severity:"🔴", msg:"Chiến tranh lan rộng — " + r.warfare.activeWars + " cuộc chiến đang diễn ra" });
    if (r.economy.activeCrises>1) threats.push({ severity:"🟠", msg:"Khủng hoảng kinh tế nghiêm trọng — " + r.economy.activeCrises + " sự kiện" });
    if (r.population.kingdoms<2)  threats.push({ severity:"🟠", msg:"Thế giới quá trống vắng — ít hơn 2 vương quốc" });
    if (r.divine.divineWars>2)    threats.push({ severity:"🔴", msg:"Thần chiến bùng nổ — " + r.divine.divineWars + " cuộc chiến thần thánh" });
    if (r.multiverse.activeInvasions>0) threats.push({ severity:"🔴", msg:"Xâm lược đa vũ trụ — " + r.multiverse.activeInvasions + " cuộc xâm lược" });
    if (r.bosses.total>5)         threats.push({ severity:"🟠", msg:r.bosses.total + " boss đang hoạt động — thế giới nguy hiểm" });
    if (threats.length === 0)     threats.push({ severity:"🟢", msg:"Thế giới tương đối ổn định" });
    return threats;
  }

  function _findOpportunities(r) {
    var opps = [];
    if (r.population.kingdoms < 3)  opps.push({ category:"nation",     icon:"🏛️", msg:"Tạo thêm quốc gia để tăng dân số và đa dạng" });
    if (r.religion.deities < 3)     opps.push({ category:"god",        icon:"✨", msg:"Thế giới thiếu thần linh — tạo thêm để cân bằng" });
    if (r.races.created < 2)        opps.push({ category:"race",       icon:"👥", msg:"Ít chủng tộc — tạo thêm để phong phú hóa thế giới" });
    if (r.bosses.total < 1)         opps.push({ category:"boss",       icon:"👹", msg:"Không có boss — thêm thách thức cho các anh hùng" });
    if (r.multiverse.universes < 2) opps.push({ category:"universe",   icon:"🌌", msg:"Mở rộng đa vũ trụ — tạo thêm vũ trụ mới" });
    if (r.economy.score < 40)       opps.push({ category:"economy",    icon:"💰", msg:"Kích thích kinh tế — tạo quốc gia thương mại" });
    if (r.technology.score < 30)    opps.push({ category:"technology", icon:"⚙️", msg:"Nâng cấp công nghệ — tạo quốc gia học thuật" });
    if (opps.length === 0)          opps.push({ category:"lore",       icon:"📜", msg:"Thế giới ổn định — hãy bổ sung lore và sử thi" });
    return opps;
  }

  console.log("[CreatorBrain V41] 🧠 Não Sáng Thế Chủ khởi động — Phân tích 10 chiều thế giới sẵn sàng.");
})();
