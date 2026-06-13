(function() {
  "use strict";
  const SAVE_KEY = "cgv6_universe_maturity_v60";

  window.universeMaturityV60Data = {
    dimensions: {},
    overallScore: 0,
    tier: "Nascent",
    tierIcon: "🌱",
    history: [],
    tickCount: 0,
    lastEvalYear: 0,
    version: "V60"
  };

  const DIMENSIONS = [
    { id: "vitality",      label: "Sức Sống",         icon: "💚", weight: 1.2 },
    { id: "connectivity",  label: "Kết Nối",           icon: "🔗", weight: 1.5 },
    { id: "stability",     label: "Ổn Định",           icon: "⚖️", weight: 1.0 },
    { id: "richness",      label: "Phong Phú",         icon: "✨", weight: 1.0 },
    { id: "history",       label: "Chiều Sâu Lịch Sử", icon: "📜", weight: 0.8 },
    { id: "player_impact", label: "Ảnh Hưởng Người Chơi", icon: "👤", weight: 1.3 },
    { id: "civ_depth",     label: "Văn Minh",          icon: "🏛️", weight: 1.0 },
    { id: "event_density", label: "Mật Độ Sự Kiện",   icon: "📅", weight: 0.9 }
  ];

  const TIERS = [
    { min: 0,  max: 15,  name: "Nascent",     icon: "🌱", label: "Phôi Thai",       desc: "Thế giới vừa ra đời, còn trống vắng." },
    { min: 15, max: 30,  name: "Developing",  icon: "🌿", label: "Đang Phát Triển", desc: "Những nền móng đầu tiên đang hình thành." },
    { min: 30, max: 50,  name: "Maturing",    icon: "🌳", label: "Trưởng Thành",    desc: "Thế giới đang định hình rõ ràng." },
    { min: 50, max: 70,  name: "Thriving",    icon: "🌟", label: "Phồn Thịnh",      desc: "Vũ trụ sống động, đầy hoạt động." },
    { min: 70, max: 85,  name: "Legendary",   icon: "🔥", label: "Huyền Thoại",     desc: "Thế giới đã trở thành huyền thoại." },
    { min: 85, max: 101, name: "Divine",      icon: "✨", label: "Thần Thánh",      desc: "Vũ trụ đạt đến mức hoàn thiện thần thánh." }
  ];

  function scoreVitality() {
    const countries = window.countries || [];
    const npcs = window.npcs || [];
    const livingPop = countries.reduce((s,c) => s + (c.population || 0), 0);
    const aliveNPCs = npcs.filter(n => n.status === "alive").length;
    return Math.min(100, Math.round(Math.log10(Math.max(1, livingPop)) * 8 + aliveNPCs * 0.5));
  }

  function scoreConnectivity() {
    const orch = window.luOrchestratorV60Data;
    if (orch && orch.integrationScore > 0) return orch.integrationScore;
    const hasAlliance = window.allianceData ? 1 : 0;
    const hasTrade = window.tradeNetV54Data ? 1 : 0;
    const hasDiplomacy = window.treatyData ? 1 : 0;
    return Math.min(100, (hasAlliance + hasTrade + hasDiplomacy) * 15 + 25);
  }

  function scoreStability() {
    const countries = window.countries || [];
    if (!countries.length) return 20;
    const avg = countries.reduce((s,c) => s + (c.stability || 50), 0) / countries.length;
    const wars = (window.warsActive || []).length;
    return Math.min(100, Math.max(0, Math.round(avg - wars * 5)));
  }

  function scoreRichness() {
    const kds = window.kingdomData ? (Array.isArray(window.kingdomData.kingdoms) ? window.kingdomData.kingdoms : Object.values(window.kingdomData.kingdoms || {})) : [];
    const emps = window.empireData ? (Array.isArray(window.empireData.empires) ? window.empireData.empires : Object.values(window.empireData.empires || {})) : [];
    const sects = (window.sects || []).length;
    const religions = window.politicalReligionData ? (Array.isArray(window.politicalReligionData.beliefs) ? window.politicalReligionData.beliefs.length : 0) : 0;
    return Math.min(100, (kds.length + emps.length) * 3 + sects * 4 + religions * 5 + 10);
  }

  function scoreHistory() {
    const ht = window.historicalTimelineData || {};
    const events = Array.isArray(ht.events) ? ht.events.length : 0;
    const wm = window.worldMemoryData || {};
    const memories = Array.isArray(wm.memories) ? wm.memories.length : 0;
    const narratives = window.worldNarrativeV60Data ? window.worldNarrativeV60Data.totalGenerated : 0;
    return Math.min(100, Math.round((events * 0.5 + memories * 0.8 + narratives * 2)));
  }

  function scorePlayerImpact() {
    const p = window.playerCoreV50Data || {};
    const wi = p.worldImpact ? Object.values(p.worldImpact).reduce((s,v) => s+v, 0) : 0;
    const xp = p.totalXP || 0;
    const rep = window.creatorRepData ? (window.creatorRepData.totalReputation || 0) : 0;
    return Math.min(100, Math.round(wi / 5 + xp / 200 + rep / 10 + 10));
  }

  function scoreCivDepth() {
    const hasCiv = window.playerCivCoreV58Data && window.playerCivCoreV58Data.founded ? 40 : 0;
    const hasEmergent = typeof window.emergentCivData !== "undefined" ? 20 : 0;
    const hasLiving = typeof window.livingCivData !== "undefined" ? 20 : 0;
    const countries = window.countries || [];
    const cultured = countries.filter(c => (c.culture || 0) > 40).length;
    return Math.min(100, hasCiv + hasEmergent + hasLiving + cultured * 2 + 10);
  }

  function scoreEventDensity() {
    const arch = window.eventArchiveV59Data || {};
    const total = Array.isArray(arch.archive) ? arch.archive.length : 0;
    const mv = window.mvEventV59Data || {};
    const mvTotal = mv.totalFired || 0;
    const bosses = window.worldBossV59Data ? (window.worldBossV59Data.totalDefeated || 0) : 0;
    return Math.min(100, Math.round(total * 1.5 + mvTotal * 3 + bosses * 8 + 5));
  }

  const SCORE_FNS = {
    vitality: scoreVitality,
    connectivity: scoreConnectivity,
    stability: scoreStability,
    richness: scoreRichness,
    history: scoreHistory,
    player_impact: scorePlayerImpact,
    civ_depth: scoreCivDepth,
    event_density: scoreEventDensity
  };

  function evaluate() {
    const data = window.universeMaturityV60Data;
    let totalWeight = 0;
    let weightedSum = 0;
    DIMENSIONS.forEach(dim => {
      const score = Math.min(100, Math.max(0, (SCORE_FNS[dim.id] || function() { return 20; })()));
      data.dimensions[dim.id] = { label: dim.label, icon: dim.icon, score, weight: dim.weight };
      weightedSum += score * dim.weight;
      totalWeight += dim.weight;
    });
    data.overallScore = Math.round(weightedSum / totalWeight);
    const tier = TIERS.find(t => data.overallScore >= t.min && data.overallScore < t.max) || TIERS[0];
    data.tier = tier.name;
    data.tierIcon = tier.icon;
    data.tierLabel = tier.label;
    data.tierDesc = tier.desc;
    data.lastEvalYear = window.year || 0;
    data.history.push({ year: data.lastEvalYear, score: data.overallScore, tier: tier.name });
    if (data.history.length > 50) data.history.shift();
  }

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        overallScore: window.universeMaturityV60Data.overallScore,
        tier: window.universeMaturityV60Data.tier,
        history: window.universeMaturityV60Data.history.slice(-50),
        tickCount: window.universeMaturityV60Data.tickCount
      }));
    } catch(e) {}
  }

  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) {
        const p = JSON.parse(d);
        Object.assign(window.universeMaturityV60Data, p);
      }
    } catch(e) {}
  }

  window.ums60GetScore = function() { return window.universeMaturityV60Data.overallScore; };
  window.ums60GetDimensions = function() { return Object.entries(window.universeMaturityV60Data.dimensions).map(([id,v]) => ({ id, ...v })); };
  window.ums60GetTier = function() { return { tier: window.universeMaturityV60Data.tier, icon: window.universeMaturityV60Data.tierIcon, label: window.universeMaturityV60Data.tierLabel, desc: window.universeMaturityV60Data.tierDesc }; };
  window.ums60GetHistory = function() { return window.universeMaturityV60Data.history; };
  window.ums60GetTiers = function() { return TIERS; };
  window.ums60ForceEvaluate = function() { evaluate(); save(); };
  window.ums60GetJarvisReport = function() {
    const data = window.universeMaturityV60Data;
    const dims = window.ums60GetDimensions();
    const weak = dims.filter(d => d.score < 30).map(d => d.icon + " " + d.label + " (" + d.score + ")");
    const strong = dims.filter(d => d.score >= 70).map(d => d.icon + " " + d.label + " (" + d.score + ")");
    return {
      overall: `${data.tierIcon} Vũ trụ đạt cấp ${data.tierLabel} (${data.overallScore}/100).`,
      strengths: strong.length ? "Điểm mạnh: " + strong.join(", ") : "Chưa có điểm mạnh nổi bật.",
      weaknesses: weak.length ? "Điểm yếu: " + weak.join(", ") : "Không có điểm yếu nghiêm trọng.",
      advice: data.overallScore < 50 ? "Hãy kích hoạt thêm hệ thống để nâng cao độ sống." : "Vũ trụ đang phát triển tốt!"
    };
  };

  function tick() {
    window.universeMaturityV60Data.tickCount++;
    if (window.universeMaturityV60Data.tickCount % 100 === 0) {
      evaluate();
      save();
    }
  }

  function init() {
    load();
    evaluate();
    const _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); tick(); };
    console.log("[UniverseMaturitySystemV60] 💚 Độ Trưởng Thành Vũ Trụ V60 khởi động — 8 chiều · Hiện tại: " + window.universeMaturityV60Data.tierIcon + " " + (window.universeMaturityV60Data.tierLabel || "Phôi Thai") + " · Score: " + window.universeMaturityV60Data.overallScore + "/100");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 11800); });
  } else {
    setTimeout(init, 11800);
  }
})();
