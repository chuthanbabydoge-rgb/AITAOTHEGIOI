(function() {
  "use strict";
  const SAVE_KEY = "cgv6_global_disaster_v48";

  // ============================================================
  // GLOBAL DISASTER CORE V48 — Mở Rộng disasterEngine V25
  // Chain Reaction · Global Scale · AI Response · 2 Loại Mới
  // KHÔNG thay thế disasterEngine.js — CHỈ MỞ RỘNG
  // ============================================================

  // ── 2 DISASTER TYPES MỚI (không có trong V25) ──
  const NEW_DISASTER_TYPES = {
    METEORITE: {
      id: "METEORITE", name: "Thiên Thạch Rơi", emoji: "☄️",
      color: "#f97316",
      severity: ["Thiên Thạch Nhỏ", "Thiên Thạch Lớn", "Thiên Thạch Khổng Lồ", "Sao Chổi Tận Thế"],
      effects: {
        population:  [-8, -30, -60, -90],
        economy:     [-15, -40, -70, -95],
        stability:   [-20, -50, -80, -100],
        climate:     [-5, -20, -50, -100],
      },
      desc: "Thiên thể từ ngoài vũ trụ lao xuống, tạo hố va chạm khổng lồ, bụi che khuất mặt trời.",
      chainTriggers: ["DROUGHT", "EARTHQUAKE"],
    },
    ICE_AGE: {
      id: "ICE_AGE", name: "Kỷ Băng Hà", emoji: "🧊",
      color: "#0ea5e9",
      severity: ["Lạnh Giá", "Tiểu Băng Hà", "Băng Hà Lớn", "Băng Hà Tận Thế"],
      effects: {
        population:   [-3, -12, -30, -60],
        economy:      [-8, -25, -50, -85],
        agriculture:  [-20, -50, -80, -100],
        stability:    [-5, -15, -35, -70],
      },
      desc: "Nhiệt độ giảm sâu, sông hồ đóng băng, mùa vụ thất bát, dân số suy giảm chậm chạp nhưng không ngừng.",
      chainTriggers: ["DROUGHT", "RECESSION"],
    },
  };

  // ── CHAIN REACTION MAP ── V25 types → V48 triggers
  const CHAIN_REACTIONS = [
    { trigger: "EARTHQUAKE",  probability: 0.45, follow: "TSUNAMI",   delay: 1, desc: "Động đất kéo theo sóng thần ập vào bờ biển." },
    { trigger: "EARTHQUAKE",  probability: 0.30, follow: "VOLCANO",   delay: 2, desc: "Vỏ trái đất nứt vỡ, dẫn đến núi lửa phun trào." },
    { trigger: "VOLCANO",     probability: 0.55, follow: "DROUGHT",   delay: 5, desc: "Tro núi lửa che phủ bầu trời, mùa màng cháy khô." },
    { trigger: "VOLCANO",     probability: 0.35, follow: "FLOOD",     delay: 3, desc: "Tuyết phủ tan chảy từ nhiệt núi lửa gây lũ lụt." },
    { trigger: "FLOOD",       probability: 0.40, follow: "PLAGUE",    delay: 2, desc: "Nước lũ mang theo mầm bệnh, đại dịch bùng phát." },
    { trigger: "DROUGHT",     probability: 0.35, follow: "RECESSION", delay: 3, desc: "Mất mùa kéo dài gây sụp đổ kinh tế nông nghiệp." },
    { trigger: "METEORITE",   probability: 0.70, follow: "EARTHQUAKE",delay: 0, desc: "Thiên thạch va chạm gây rung chấn địa cầu dữ dội." },
    { trigger: "METEORITE",   probability: 0.50, follow: "ICE_AGE",   delay: 10,desc: "Bụi thiên thạch che khuất mặt trời, nhiệt độ lao dốc." },
    { trigger: "ICE_AGE",     probability: 0.30, follow: "RECESSION", delay: 5, desc: "Băng hà phá hủy mùa vụ, khủng hoảng kinh tế tiếp diễn." },
  ];

  // ── AI RESPONSE TYPES ──
  const AI_RESPONSES = [
    { id: "mass_migration",   icon: "🚶", name: "Di Cư Hàng Loạt",     desc: "Dân chúng rời bỏ vùng thảm họa, di cư đến vùng an toàn." },
    { id: "emergency_alliance",icon:"🤝", name: "Liên Minh Cứu Trợ",    desc: "Các quốc gia lân cận lập liên minh khẩn cấp hỗ trợ nhau." },
    { id: "defense_construct", icon: "🏗️",name: "Xây Công Trình",       desc: "Xây đê điều, tường thành, hầm trú ẩn chống thảm họa." },
    { id: "emergency_state",   icon: "⚠️", name: "Tình Trạng Khẩn Cấp", desc: "Quốc gia tuyên bố tình trạng khẩn cấp, huy động toàn lực." },
    { id: "plague_containment",icon: "🏥", name: "Chống Dịch",           desc: "Cách ly vùng dịch, hy sinh một phần để cứu phần còn lại." },
    { id: "divine_prayer",     icon: "🙏", name: "Cầu Thần Phù Hộ",      desc: "Dân chúng tập hợp cầu nguyện, huy động sức mạnh tâm linh." },
  ];

  function defaultData() {
    return {
      globalEvents: [],          // Thiên tai toàn cầu
      chainQueue: [],            // Chain reactions đang chờ kích hoạt
      aiResponses: [],           // AI phản ứng của các quốc gia
      disasterWarnings: [],      // Cảnh báo sắp xảy ra
      statistics: {
        totalGlobalEvents: 0,
        totalChainReactions: 0,
        totalAIResponses: 0,
        worstDisaster: null,
        mostAffectedRegion: null,
        totalDeaths: 0,
        totalEconomicLoss: 0,
      },
      lastTick: 0,
    };
  }

  window.globalDisasterV48Data = window.globalDisasterV48Data || defaultData();

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.globalDisasterV48Data)); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.globalDisasterV48Data = Object.assign(defaultData(), JSON.parse(d));
    } catch(e) { window.globalDisasterV48Data = defaultData(); }
  }

  // ── TRIGGER NEW DISASTER TYPE ──
  function triggerNewDisaster(typeId, regionName, severityIdx) {
    const d = window.globalDisasterV48Data;
    const type = NEW_DISASTER_TYPES[typeId];
    if (!type) return null;

    const countries = window.countries || [];
    const region = regionName || (countries.length ? countries[Math.floor(Math.random() * countries.length)].name : "Không Xác Định");
    const sevIdx = severityIdx !== undefined ? severityIdx : Math.floor(Math.random() * 4);
    const year = window.year || 1;

    const event = {
      id: "gd48_" + Date.now(),
      type: typeId,
      name: type.name,
      emoji: type.emoji,
      color: type.color,
      severity: type.severity[sevIdx],
      severityIdx: sevIdx,
      region,
      year,
      desc: type.desc,
      active: true,
      duration: Math.max(3, (sevIdx + 1) * 8),
      effects: {},
    };

    // Apply effects
    const affected = countries.filter(c => !regionName || c.name === regionName || Math.random() < 0.3 * (sevIdx + 1) / 4);
    affected.forEach(c => {
      Object.entries(type.effects).forEach(([key, vals]) => {
        const delta = vals[sevIdx] || 0;
        if (key === "population" && c.population) {
          const loss = Math.abs(Math.floor(c.population * Math.abs(delta) / 100));
          c.population = Math.max(10, c.population - loss);
          d.statistics.totalDeaths += loss;
          event.effects.population = (event.effects.population || 0) - loss;
        }
        if (key === "economy" && c.gdp) {
          const loss = Math.abs(Math.floor(c.gdp * Math.abs(delta) / 100));
          c.gdp = Math.max(0, c.gdp - loss);
          d.statistics.totalEconomicLoss += loss;
        }
        if (key === "stability" && c.stability !== undefined) {
          c.stability = Math.max(0, Math.min(100, (c.stability || 50) + delta));
        }
      });
    });

    d.globalEvents.unshift(event);
    if (d.globalEvents.length > 200) d.globalEvents.pop();
    d.statistics.totalGlobalEvents++;

    // Track worst disaster
    if (!d.statistics.worstDisaster || sevIdx > d.statistics.worstDisaster.severityIdx) {
      d.statistics.worstDisaster = { name: type.name, region, year, severityIdx: sevIdx };
    }

    // Notifications
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year, type: "disaster", title: `${type.emoji} ${type.name} — ${type.severity[sevIdx]} tại ${region}`, color: type.color });
    }
    if (typeof window.wmeAddMemory === "function") {
      window.wmeAddMemory({ year, category: "Thảm Họa", title: `${type.emoji} ${type.name}`, content: `${type.desc} Vùng bị ảnh hưởng: ${region}. Mức độ: ${type.severity[sevIdx]}.` });
    }
    if (typeof window.waeAddAlert === "function") {
      window.waeAddAlert({ type: "disaster", msg: `${type.emoji} ${type.name} (${type.severity[sevIdx]}) tại ${region}!` });
    }
    if (typeof window.addLog === "function") {
      window.addLog(`${type.emoji} ${type.name} (${type.severity[sevIdx]}) tại ${region}!`, "danger");
    }

    // Queue chain reactions
    queueChainReactions(typeId, region, year);

    // Generate AI response
    generateAIResponse(region, typeId, sevIdx);

    save();
    return event;
  }

  // ── CHAIN REACTION SYSTEM ──
  function queueChainReactions(triggerTypeId, region, year) {
    const d = window.globalDisasterV48Data;
    CHAIN_REACTIONS.filter(r => r.trigger === triggerTypeId).forEach(r => {
      if (Math.random() < r.probability) {
        d.chainQueue.push({
          id: "chain_" + Date.now() + "_" + Math.random().toString(36).slice(2),
          triggerType: triggerTypeId,
          followType: r.follow,
          region,
          triggerYear: year,
          fireYear: (window.year || 1) + r.delay,
          desc: r.desc,
          fired: false,
        });
        d.statistics.totalChainReactions++;

        if (typeof window.addLog === "function") {
          window.addLog(`⚡ Chuỗi phản ứng: ${r.desc}`, "warning");
        }
      }
    });
    save();
  }

  function processChainQueue() {
    const d = window.globalDisasterV48Data;
    const year = window.year || 1;
    d.chainQueue.forEach(chain => {
      if (!chain.fired && year >= chain.fireYear) {
        chain.fired = true;
        // Fire the follow disaster — either new type or V25 type
        if (NEW_DISASTER_TYPES[chain.followType]) {
          triggerNewDisaster(chain.followType, chain.region);
        } else if (typeof window.deTriggerDisaster === "function") {
          window.deTriggerDisaster(chain.followType, chain.region);
        } else if (chain.followType === "PLAGUE" && typeof window.plTriggerPlague === "function") {
          const plagues = ["BLACK_DEATH", "SOUL_PLAGUE", "MANA_DECAY"];
          window.plTriggerPlague(plagues[Math.floor(Math.random() * plagues.length)], chain.region);
        } else if (chain.followType === "RECESSION" && typeof window.ecTriggerEvent === "function") {
          window.ecTriggerEvent("RECESSION", null, chain.region);
        }

        if (typeof window.htAddEvent === "function") {
          window.htAddEvent({ year, type: "chain_disaster", title: `⚡ Chuỗi Thảm Họa: ${chain.desc}`, color: "#f97316" });
        }
      }
    });
    // Clean up fired chains
    d.chainQueue = d.chainQueue.filter(c => !c.fired || (window.year || 1) - c.fireYear < 5);
    save();
  }

  // ── GENERATE AI RESPONSE ──
  function generateAIResponse(region, disasterType, severityIdx) {
    const d = window.globalDisasterV48Data;
    const response = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
    const year = window.year || 1;

    const countries = window.countries || [];
    const respondingCountry = countries.find(c => c.name !== region) ||
      (countries.length ? countries[Math.floor(Math.random() * countries.length)] : null);

    const aiEvent = {
      id: "air_" + Date.now(),
      responseType: response.id,
      icon: response.icon,
      name: response.name,
      desc: `${response.desc} (Phản ứng với thảm họa tại ${region})`,
      respondedBy: respondingCountry ? respondingCountry.name : "Liên Minh Thiên Hạ",
      disasterRegion: region,
      year,
    };

    d.aiResponses.unshift(aiEvent);
    if (d.aiResponses.length > 100) d.aiResponses.pop();
    d.statistics.totalAIResponses++;

    if (typeof window.waeAddAlert === "function") {
      window.waeAddAlert({ type: "ai_response", msg: `${response.icon} ${aiEvent.respondedBy}: ${response.name} (${region})` });
    }
    save();
  }

  // ── AUTO DISASTER TRIGGER ──
  function autoTrigger() {
    const year = window.year || 1;
    const d = window.globalDisasterV48Data;

    // Thiên thạch: ~1 per 150 years
    if (Math.random() < 0.007) {
      const countries = window.countries || [];
      const region = countries.length ? countries[Math.floor(Math.random() * countries.length)].name : "Vùng Hoang";
      triggerNewDisaster("METEORITE", region, Math.floor(Math.random() * 4));
    }

    // Băng hà: ~1 per 200 years, triggered by multiple droughts or low mana
    if (Math.random() < 0.005) {
      const countries = window.countries || [];
      const region = countries.length ? countries[Math.floor(Math.random() * countries.length)].name : "Vùng Cực";
      triggerNewDisaster("ICE_AGE", region, Math.floor(Math.random() * 4));
    }

    // Chain queue processing
    processChainQueue();

    // Warning system: predict upcoming disasters
    if (Math.random() < 0.03) {
      generateWarning();
    }
  }

  // ── WARNING SYSTEM ──
  function generateWarning() {
    const d = window.globalDisasterV48Data;
    const warnings = [
      { icon: "⚠️", msg: "Seismic readings show increased underground activity — earthquake imminent." },
      { icon: "🌡️", msg: "Global temperatures dropping rapidly — ice age conditions forming." },
      { icon: "☄️", msg: "A large celestial body has been detected on a collision course." },
      { icon: "🌋", msg: "Volcanic gases detected at multiple sites — eruption warning issued." },
      { icon: "🌊", msg: "Unusual ocean patterns detected — tsunami risk elevated." },
      { icon: "🌑", msg: "Mana concentrations fluctuating wildly — catastrophe may follow." },
    ];
    const w = warnings[Math.floor(Math.random() * warnings.length)];
    const year = window.year || 1;

    d.disasterWarnings.unshift({ id: "warn_" + Date.now(), icon: w.icon, msg: w.msg, year, resolved: false });
    if (d.disasterWarnings.length > 50) d.disasterWarnings.pop();

    if (typeof window.addLog === "function") {
      window.addLog(`${w.icon} Cảnh Báo Thảm Họa: ${w.msg}`, "warning");
    }
    save();
  }

  // ── GLOBAL SCALE EVENT (affects ALL countries) ──
  window.gdV48TriggerGlobal = function(typeId, severity) {
    const countries = window.countries || [];
    if (typeId === "METEORITE" || typeId === "ICE_AGE") {
      return triggerNewDisaster(typeId, "Toàn Cầu", severity || 3);
    }
    // Trigger V25 disaster globally
    if (typeof window.deTriggerDisaster === "function") {
      countries.forEach(c => {
        if (Math.random() < 0.7) window.deTriggerDisaster(typeId, c.name, severity);
      });
    }
  };

  // ── PUBLIC API ──
  window.gdV48TriggerNewDisaster = triggerNewDisaster;
  window.gdV48GetGlobalEvents = function() { return window.globalDisasterV48Data.globalEvents; };
  window.gdV48GetChainQueue = function() { return window.globalDisasterV48Data.chainQueue; };
  window.gdV48GetAIResponses = function() { return window.globalDisasterV48Data.aiResponses; };
  window.gdV48GetWarnings = function() { return window.globalDisasterV48Data.disasterWarnings; };
  window.gdV48GetStats = function() { return window.globalDisasterV48Data.statistics; };
  window.gdV48GetNewTypes = function() { return NEW_DISASTER_TYPES; };

  // ── GAME TICK ──
  window.gdV48Tick = function() {
    const d = window.globalDisasterV48Data;
    d.lastTick = (d.lastTick || 0) + 1;
    if (d.lastTick % 35 === 0) autoTrigger();
  };

  // ── INIT ──
  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); try { window.gdV48Tick(); } catch(e) {} };
    console.log("[GlobalDisasterCoreV48] ☄️ Chuỗi Thảm Họa Toàn Cầu V48 — chain reactions · Thiên Thạch · Băng Hà · AI phản ứng sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 5000); });
  } else {
    setTimeout(init, 5000);
  }
})();
