(function() {
  "use strict";
  const SAVE_KEY = "cgv6_world_narrative_v60";

  window.worldNarrativeV60Data = {
    chronicles: [],
    legends: [],
    turningPoints: [],
    epochSummaries: [],
    lastChronicleYear: 0,
    tickCount: 0,
    totalGenerated: 0,
    version: "V60"
  };

  const CHRONICLE_TEMPLATES = [
    "Năm {year}, thế giới chứng kiến {event}. Các quốc gia {action}. Lịch sử ghi lại đây là {era}.",
    "Vào năm {year} của kỷ nguyên này, {event} đã làm rung chuyển {target}. {consequence}.",
    "Biên niên sử năm {year}: {event}. {detail}. Đây là thời điểm {significance}.",
    "Kỷ lục năm {year} — {count} sự kiện lớn đã xảy ra. Nổi bật nhất: {event}. Hệ quả: {consequence}.",
    "Năm {year} được gọi là {era_name}. {event} là dấu ấn không thể xóa nhòa."
  ];

  const ERA_NAMES = ["Thời Kỳ Hỗn Độn","Kỷ Nguyên Vàng","Thời Đại Bóng Tối","Buổi Bình Minh Văn Minh","Thời Kỳ Chinh Phạt","Kỷ Nguyên Khai Sáng","Thời Đại Thần Thoại","Kỷ Nguyên Đại Phán Xét"];
  const ACTIONS = ["liên kết hòa bình","tiến hành chiến tranh","cải tổ nội bộ","mở rộng lãnh thổ","thương lượng hiệp ước","đối phó với thiên tai"];
  const CONSEQUENCES = ["dẫn đến thay đổi cán cân quyền lực","mở ra một kỷ nguyên mới","làm lung lay nền tảng văn minh","tạo nên anh hùng và kẻ phản diện","viết lại bản đồ thế giới"];

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function getWorldEvent() {
    const arch = window.eventArchiveV59Data;
    if (arch && Array.isArray(arch.archive) && arch.archive.length > 0) {
      const recent = arch.archive[0];
      return recent.title || recent.name || "một sự kiện lớn";
    }
    const evW = window.worldEventV25Data;
    if (evW && Array.isArray(evW.activeEvents) && evW.activeEvents.length > 0) {
      return evW.activeEvents[0].name || "biến động chính trị";
    }
    const countries = window.countries || [];
    if (countries.length > 0) {
      const c = countries[Math.floor(Math.random() * countries.length)];
      return `cuộc nổi dậy tại ${c.name || "vùng đất xa"}`;
    }
    return "những thay đổi sâu sắc trong thế giới";
  }

  function generateChronicle() {
    const yr = window.year || 0;
    const tmpl = pick(CHRONICLE_TEMPLATES);
    const kds = window.kingdomData ? (Array.isArray(window.kingdomData.kingdoms) ? window.kingdomData.kingdoms : Object.values(window.kingdomData.kingdoms || {})) : [];
    const emps = window.empireData ? (Array.isArray(window.empireData.empires) ? window.empireData.empires : Object.values(window.empireData.empires || {})) : [];
    const totalNations = kds.length + emps.length;
    const countries = window.countries || [];
    const target = countries.length > 0 ? (pick(countries).name || "toàn thế giới") : "toàn thế giới";
    const text = tmpl
      .replace("{year}", yr)
      .replace("{event}", getWorldEvent())
      .replace("{action}", pick(ACTIONS))
      .replace("{era}", pick(ERA_NAMES))
      .replace("{target}", target)
      .replace("{consequence}", pick(CONSEQUENCES))
      .replace("{detail}", `Có ${totalNations} thực thể chính trị tồn tại`)
      .replace("{significance}", "bước ngoặt lịch sử")
      .replace("{era_name}", pick(ERA_NAMES))
      .replace("{count}", (window.eventSchedulerV59Data || {}).totalFired || 0);

    const entry = { id: "chr_" + yr + "_" + Date.now(), type: "chronicle", year: yr, text, timestamp: Date.now() };
    window.worldNarrativeV60Data.chronicles.unshift(entry);
    if (window.worldNarrativeV60Data.chronicles.length > 30) window.worldNarrativeV60Data.chronicles.pop();
    window.worldNarrativeV60Data.lastChronicleYear = yr;
    window.worldNarrativeV60Data.totalGenerated++;
    return entry;
  }

  function generateLegend(bossKill) {
    const yr = window.year || 0;
    const bossName = bossKill ? (bossKill.name || "Quái Vật Vô Danh") : "kẻ thù tối thượng";
    const heroPool = (window.npcs || []).filter(n => n.isHero || (n.fame && n.fame > 300));
    const heroName = heroPool.length > 0 ? (pick(heroPool).name || "Vị Anh Hùng Vô Danh") : "Vị Anh Hùng Vô Danh";
    const text = `Truyền thuyết năm ${yr}: ${heroName} đã hạ bệ ${bossName} trong trận chiến kéo dài nhiều ngày đêm. Tiếng vang của chiến thắng này lan khắp đa vũ trụ, và tên tuổi ${heroName} được khắc vào biên niên sử muôn đời.`;
    const entry = { id: "leg_" + yr + "_" + Date.now(), type: "legend", year: yr, text, hero: heroName, boss: bossName, timestamp: Date.now() };
    window.worldNarrativeV60Data.legends.unshift(entry);
    if (window.worldNarrativeV60Data.legends.length > 20) window.worldNarrativeV60Data.legends.pop();
    window.worldNarrativeV60Data.totalGenerated++;
    return entry;
  }

  function generateTurningPoint(cause) {
    const yr = window.year || 0;
    const countries = window.countries || [];
    const avgStability = countries.length > 0 ? Math.round(countries.reduce((s,c) => s+(c.stability||50), 0) / countries.length) : 50;
    const avgEconomy = countries.length > 0 ? Math.round(countries.reduce((s,c) => s+(c.economy||50), 0) / countries.length) : 50;
    const text = `Bước ngoặt năm ${yr} — ${cause || "sự kiện lớn"}: Ổn định thế giới: ${avgStability}/100 · Kinh tế: ${avgEconomy}/100. Thế giới đang ${avgStability > 60 ? "dần ổn định" : "trong cơn hỗn loạn"}.`;
    const entry = { id: "tp_" + yr + "_" + Date.now(), type: "turning_point", year: yr, text, stability: avgStability, economy: avgEconomy, cause, timestamp: Date.now() };
    window.worldNarrativeV60Data.turningPoints.unshift(entry);
    if (window.worldNarrativeV60Data.turningPoints.length > 20) window.worldNarrativeV60Data.turningPoints.pop();
    window.worldNarrativeV60Data.totalGenerated++;
    return entry;
  }

  function generateEpochSummary() {
    const yr = window.year || 0;
    const countries = window.countries || [];
    const kds = window.kingdomData ? (Array.isArray(window.kingdomData.kingdoms) ? window.kingdomData.kingdoms : Object.values(window.kingdomData.kingdoms || {})) : [];
    const emps = window.empireData ? (Array.isArray(window.empireData.empires) ? window.empireData.empires : Object.values(window.empireData.empires || {})) : [];
    const wars = window.warsActive || [];
    const arch = window.eventArchiveV59Data || {};
    const bossKills = Array.isArray(arch.bossKillRecords) ? arch.bossKillRecords.length : 0;
    const totalEvents = (arch.archive && arch.archive.length) || 0;
    const text = `Tóm tắt Kỷ nguyên đến năm ${yr}: Có ${kds.length} vương quốc · ${emps.length} đế chế · ${countries.length} thực thể trên thế giới. ${totalEvents} sự kiện lớn đã xảy ra, trong đó ${bossKills} boss đã bị tiêu diệt. Chiến tranh đang diễn ra: ${wars.length}. Nhân loại ${totalEvents > 20 ? "đã trải qua nhiều thăng trầm" : "đang dần viết lên lịch sử của mình"}.`;
    const entry = { id: "ep_" + yr, type: "epoch_summary", year: yr, text, kingdoms: kds.length, empires: emps.length, totalEvents, bossKills, wars: wars.length, timestamp: Date.now() };
    window.worldNarrativeV60Data.epochSummaries.unshift(entry);
    if (window.worldNarrativeV60Data.epochSummaries.length > 10) window.worldNarrativeV60Data.epochSummaries.pop();
    window.worldNarrativeV60Data.totalGenerated++;
    return entry;
  }

  function save() {
    try {
      const saveData = {
        chronicles: window.worldNarrativeV60Data.chronicles.slice(-30),
        legends: window.worldNarrativeV60Data.legends.slice(-20),
        turningPoints: window.worldNarrativeV60Data.turningPoints.slice(-20),
        epochSummaries: window.worldNarrativeV60Data.epochSummaries.slice(-10),
        lastChronicleYear: window.worldNarrativeV60Data.lastChronicleYear,
        totalGenerated: window.worldNarrativeV60Data.totalGenerated,
        tickCount: window.worldNarrativeV60Data.tickCount
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    } catch(e) {}
  }

  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) {
        const p = JSON.parse(d);
        Object.assign(window.worldNarrativeV60Data, p);
      }
    } catch(e) {}
  }

  window.wne60GenerateChronicle = function() { return generateChronicle(); };
  window.wne60GenerateLegend = function(boss) { return generateLegend(boss); };
  window.wne60GenerateTurningPoint = function(cause) { return generateTurningPoint(cause); };
  window.wne60GenerateEpochSummary = function() { return generateEpochSummary(); };
  window.wne60GetNarratives = function() {
    return {
      chronicles: window.worldNarrativeV60Data.chronicles,
      legends: window.worldNarrativeV60Data.legends,
      turningPoints: window.worldNarrativeV60Data.turningPoints,
      epochSummaries: window.worldNarrativeV60Data.epochSummaries
    };
  };
  window.wne60GetAll = function() {
    const all = [
      ...window.worldNarrativeV60Data.chronicles,
      ...window.worldNarrativeV60Data.legends,
      ...window.worldNarrativeV60Data.turningPoints
    ];
    return all.sort((a,b) => b.year - a.year).slice(0, 40);
  };
  window.wne60GetStats = function() {
    return {
      chronicles: window.worldNarrativeV60Data.chronicles.length,
      legends: window.worldNarrativeV60Data.legends.length,
      turningPoints: window.worldNarrativeV60Data.turningPoints.length,
      epochSummaries: window.worldNarrativeV60Data.epochSummaries.length,
      totalGenerated: window.worldNarrativeV60Data.totalGenerated
    };
  };
  window.wne60GetJarvisStory = function() {
    const all = window.wne60GetAll();
    if (all.length === 0) return "Biên niên sử chưa có dữ liệu. Hãy để thế giới vận hành thêm.";
    const latest = all[0];
    const count = window.worldNarrativeV60Data.totalGenerated;
    return `📖 Jarvis Biên Niên Ký: ${count} câu chuyện đã được ghi lại. Gần nhất: "${latest.text.substring(0,120)}..." Thế giới đang ${all.length > 10 ? "giàu lịch sử" : "viết những trang đầu tiên"}.`;
  };

  function tick() {
    window.worldNarrativeV60Data.tickCount++;
    const yr = window.year || 0;
    if (window.worldNarrativeV60Data.tickCount % 200 === 0) {
      if (yr - window.worldNarrativeV60Data.lastChronicleYear >= 20) {
        generateChronicle();
        save();
      }
    }
    if (window.worldNarrativeV60Data.tickCount % 500 === 0) {
      generateEpochSummary();
      save();
    }
    // Check boss kills for legends
    const arch = window.eventArchiveV59Data;
    if (arch && Array.isArray(arch.bossKillRecords)) {
      const newKills = arch.bossKillRecords.filter(b => {
        const existingLeg = window.worldNarrativeV60Data.legends.find(l => l.boss === b.name && l.year === b.year);
        return !existingLeg && b.year && b.year > 0;
      });
      if (newKills.length > 0) {
        generateLegend(newKills[0]);
        save();
      }
    }
    // Check cause-effect history for turning points
    const ceHistory = window.causeEffectV60Data ? window.causeEffectV60Data.chainHistory : [];
    if (ceHistory.length > 0) {
      const latest = ceHistory[0];
      const existing = window.worldNarrativeV60Data.turningPoints.find(t => t.year === latest.year && t.cause === latest.name);
      if (!existing) {
        generateTurningPoint(latest.name);
        save();
      }
    }
  }

  function init() {
    load();
    if (window.worldNarrativeV60Data.chronicles.length === 0) {
      generateChronicle();
    }
    const _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); tick(); };
    console.log("[WorldNarrativeEngineV60] 📖 Biên Niên Ký V60 khởi động — " + window.worldNarrativeV60Data.totalGenerated + " câu chuyện · Auto-chronicle mỗi 20 năm · Legend từ boss kills sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 11700); });
  } else {
    setTimeout(init, 11700);
  }
})();
