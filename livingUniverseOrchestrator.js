(function() {
  "use strict";
  const SAVE_KEY = "cgv6_universe_orchestrator_v60";

  window.luOrchestratorV60Data = {
    domains: {},
    integrationLinks: [],
    integrationScore: 0,
    lastOrchestration: 0,
    tickCount: 0,
    alerts: [],
    version: "V60"
  };

  const DOMAINS = [
    { id: "politics",      label: "Chính Trị",    icon: "🏛️" },
    { id: "economy",       label: "Kinh Tế",       icon: "💹" },
    { id: "religion",      label: "Tôn Giáo",      icon: "⛩️" },
    { id: "civilization",  label: "Văn Minh",      icon: "🏛" },
    { id: "heroes",        label: "Anh Hùng",      icon: "⚔️" },
    { id: "disasters",     label: "Thiên Tai",     icon: "🌋" },
    { id: "trade",         label: "Thương Mại",    icon: "🛤️" },
    { id: "guilds",        label: "Bang Hội",      icon: "🏛️" },
    { id: "empires",       label: "Đế Quốc",       icon: "👑" },
    { id: "players",       label: "Người Chơi",    icon: "👤" },
    { id: "events",        label: "Sự Kiện",       icon: "📅" },
    { id: "multiverse",    label: "Đa Vũ Trụ",    icon: "🌌" }
  ];

  const LINKS = [
    ["politics","economy"],["economy","trade"],["trade","guilds"],
    ["guilds","empires"],["empires","heroes"],["heroes","civilization"],
    ["civilization","religion"],["religion","politics"],
    ["disasters","economy"],["disasters","heroes"],
    ["events","politics"],["events","economy"],["events","multiverse"],
    ["players","heroes"],["players","civilization"],["players","events"]
  ];

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.luOrchestratorV60Data)); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) {
        const p = JSON.parse(d);
        window.luOrchestratorV60Data = Object.assign(window.luOrchestratorV60Data, p);
      }
    } catch(e) {}
  }

  function getDomainScore(id) {
    switch(id) {
      case "politics": {
        const kds = window.kingdomData ? (Array.isArray(window.kingdomData.kingdoms) ? window.kingdomData.kingdoms : Object.values(window.kingdomData.kingdoms || {})) : [];
        const emps = window.empireData ? (Array.isArray(window.empireData.empires) ? window.empireData.empires : Object.values(window.empireData.empires || {})) : [];
        const total = kds.length + emps.length;
        return Math.min(100, total * 4 + (window.warsActive ? window.warsActive.length * 2 : 0));
      }
      case "economy": {
        const countries = window.countries || [];
        if (!countries.length) return 20;
        const avg = countries.reduce((s,c) => s + (c.economy || 50), 0) / countries.length;
        return Math.round(avg);
      }
      case "religion": {
        const countries = window.countries || [];
        const withRel = countries.filter(c => c.religion || c.faith).length;
        return Math.min(100, withRel * 5 + 20);
      }
      case "civilization": {
        const hasCiv = typeof window.playerCivCoreV58Data !== "undefined";
        const hasEmergent = typeof window.emergentCivData !== "undefined";
        return (hasCiv ? 50 : 20) + (hasEmergent ? 30 : 0);
      }
      case "heroes": {
        const npcs = window.npcs || [];
        const heroes = npcs.filter(n => n.isHero || (n.fame && n.fame > 500));
        return Math.min(100, heroes.length * 8 + 10);
      }
      case "disasters": {
        const d = window.disasterData || {};
        const active = Array.isArray(d.activeDisasters) ? d.activeDisasters.length : 0;
        const p = window.plagueData || {};
        const plagues = Array.isArray(p.activePlagues) ? p.activePlagues.length : 0;
        return Math.min(100, (active + plagues) * 15 + 10);
      }
      case "trade": {
        const t = window.tradeNetV54Data || {};
        const routes = Array.isArray(t.routes) ? t.routes.length : 0;
        return Math.min(100, routes * 6 + 15);
      }
      case "guilds": {
        const g = window.guildCoreV53Data || {};
        const hasGuild = g.playerGuild ? 50 : 10;
        return Math.min(100, hasGuild + (g.npcGuilds ? g.npcGuilds.length * 5 : 0));
      }
      case "empires": {
        const e = window.playerEmpireV53Data || {};
        return e.founded ? 60 + (e.territories || 0) * 5 : 15;
      }
      case "players": {
        const p = window.playerCoreV50Data || {};
        return Math.min(100, (p.totalXP || 0) / 100 + (p.worldImpact ? Object.values(p.worldImpact).reduce((s,v)=>s+v,0)/10 : 0) + 10);
      }
      case "events": {
        const s = window.eventSchedulerV59Data || {};
        const total = (s.totalFired || 0) + (window.worldBossV59Data ? (window.worldBossV59Data.totalDefeated || 0) * 5 : 0);
        return Math.min(100, total * 3 + 10);
      }
      case "multiverse": {
        const mv = window.mvEventV59Data || {};
        const gates = window.gateSystemV56Data || {};
        return Math.min(100, (mv.totalFired || 0) * 8 + (gates.totalGates || 0) * 6 + 10);
      }
      default: return 30;
    }
  }

  function computeLinkScore(a, b) {
    const sa = getDomainScore(a);
    const sb = getDomainScore(b);
    const base = (sa + sb) / 2;
    return Math.round(Math.min(100, base * 0.8));
  }

  function orchestrate() {
    const data = window.luOrchestratorV60Data;
    data.domains = {};
    DOMAINS.forEach(d => {
      data.domains[d.id] = {
        label: d.label,
        icon: d.icon,
        score: getDomainScore(d.id),
        active: getDomainScore(d.id) > 15
      };
    });
    data.integrationLinks = LINKS.map(([a,b]) => ({
      from: a, to: b,
      score: computeLinkScore(a,b),
      label: (window.luOrchestratorV60Data.domains[a] || {}).icon + "↔" + (window.luOrchestratorV60Data.domains[b] || {}).icon
    }));
    const avgScore = data.integrationLinks.reduce((s,l) => s + l.score, 0) / data.integrationLinks.length;
    data.integrationScore = Math.round(avgScore);
    data.lastOrchestration = window.year || 0;
    data.tickCount++;

    // alerts
    data.alerts = [];
    DOMAINS.forEach(d => {
      if (data.domains[d.id].score < 20) {
        data.alerts.push({ type: "warning", msg: `${d.icon} ${d.label} chưa được kích hoạt (${data.domains[d.id].score}/100)` });
      }
    });
    const weakLinks = data.integrationLinks.filter(l => l.score < 25);
    weakLinks.forEach(l => {
      data.alerts.push({ type: "bottleneck", msg: `🔗 Kết nối ${l.from}↔${l.to} yếu (${l.score}/100)` });
    });
  }

  window.luo60GetState = function() { return window.luOrchestratorV60Data; };
  window.luo60GetDomainScore = function(id) { return getDomainScore(id); };
  window.luo60GetIntegrationScore = function() { return window.luOrchestratorV60Data.integrationScore; };
  window.luo60GetDomains = function() { return DOMAINS; };
  window.luo60GetStats = function() {
    const data = window.luOrchestratorV60Data;
    const active = Object.values(data.domains).filter(d => d.active).length;
    return {
      totalDomains: DOMAINS.length,
      activeDomains: active,
      integrationScore: data.integrationScore,
      alerts: data.alerts.length,
      integrationLinks: data.integrationLinks.length,
      year: window.year || 0
    };
  };

  function tick() {
    window.luOrchestratorV60Data.tickCount++;
    if (window.luOrchestratorV60Data.tickCount % 100 === 0) {
      orchestrate();
      save();
    }
  }

  function init() {
    load();
    orchestrate();
    const _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); tick(); };
    console.log("[LivingUniverseOrchestrator V60] 🌍 Universe Orchestrator khởi động — 12 domain · " + LINKS.length + " kết nối · Integration Score: " + window.luOrchestratorV60Data.integrationScore);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 11500); });
  } else {
    setTimeout(init, 11500);
  }
})();
