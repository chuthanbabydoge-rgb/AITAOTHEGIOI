(function() {
  "use strict";
  const SAVE_KEY = "cgv6_npc_life_v65";

  // ════ DATA ════
  window.npcLifeV65Data = {
    version: 65,
    profiles: {},    // key=npcId → {career, emotions, birthYear, dreams, fears, lifeEvents, goals, dailyLife}
    careerRecords: [],
    deathRecords: [],
    birthRecords: [],
    lastScan: 0
  };

  // ════ CONSTANTS ════
  const CAREERS = [
    { id:"farmer",    label:"Nông Dân",   icon:"🌾", stat:"endurance", incomeBase:10 },
    { id:"merchant",  label:"Thương Nhân",icon:"💰", stat:"charisma",  incomeBase:30 },
    { id:"warrior",   label:"Chiến Binh", icon:"⚔️", stat:"power",     incomeBase:20 },
    { id:"scholar",   label:"Học Giả",    icon:"📚", stat:"intelligence",incomeBase:15 },
    { id:"priest",    label:"Tư Tế",      icon:"⛪", stat:"spirit",    incomeBase:12 },
    { id:"noble",     label:"Quý Tộc",    icon:"👑", stat:"politics",  incomeBase:50 },
    { id:"cultivator",label:"Tu Sĩ",      icon:"🌀", stat:"realm",     incomeBase:25 },
    { id:"artisan",   label:"Thợ Thủ Công",icon:"🔨",stat:"skill",     incomeBase:18 }
  ];
  window.npcLife65Careers = CAREERS;

  const EMOTIONS = ["happy","angry","fearful","hopeful","desperate","proud","sad","content"];
  const DREAMS = [
    "Trở thành anh hùng thiên hạ",
    "Gây dựng gia tộc lớn mạnh",
    "Tìm được người bạn đời chung thủy",
    "Đạt cảnh giới tu luyện tối cao",
    "Tích lũy tài sản kếch xù",
    "Trả thù kẻ hại gia đình",
    "Khám phá thế giới rộng lớn",
    "Để lại tên tuổi trong sử sách",
    "Bảo vệ quê hương khỏi giặc ngoại xâm",
    "Tìm ra bí mật của vũ trụ"
  ];
  const FEARS = [
    "Chết trước khi hoàn thành mục tiêu",
    "Mất đi người thân yêu",
    "Bị phản bội bởi bạn bè",
    "Trở nên nghèo khổ",
    "Cô đơn đến cuối đời",
    "Không để lại con cháu",
    "Bị kẻ thù giết hại",
    "Gia tộc suy vong"
  ];

  // ════ INIT PROFILE ════
  function ensureProfile(npc) {
    const id = npc.id || npc.name;
    if (!window.npcLifeV65Data.profiles[id]) {
      const year = window.year || 0;
      // Career selection based on NPC traits
      let career = pickCareer(npc);
      const rng = seededRand(id + "v65");
      window.npcLifeV65Data.profiles[id] = {
        npcId: id,
        birthYear: npc.birthYear || Math.max(0, year - (npc.age || 20)),
        career,
        emotions: { primary: "content", secondary: "hopeful", intensity: 50 },
        dream: DREAMS[Math.floor(rng() * DREAMS.length)],
        fear: FEARS[Math.floor(rng() * FEARS.length)],
        goals: [],
        lifeEvents: [],
        dailyLife: { lastActivity: "rest", mood: 70, wealth: 10 },
        happiness: 60,
        anger: 20,
        hope: 70,
        despair: 10
      };
      // Record birth
      window.npcLifeV65Data.birthRecords.push({ id, name: npc.name, year: year, career });
      if (typeof window.npcMem64AddMemory === "function") {
        window.npcMem64AddMemory(id, "personal", `Ra Đời Với Ước Mơ`, `${npc.name} mang trong mình ước mơ: "${window.npcLifeV65Data.profiles[id].dream}"`, 3);
      }
    }
    return window.npcLifeV65Data.profiles[id];
  }

  function pickCareer(npc) {
    const realm = (npc.realm || "").toLowerCase();
    const goal = (npc.goal || "").toLowerCase();
    const ambition = npc.soul ? (npc.soul.ambition || "") : "";
    if (realm.includes("đế") || realm.includes("hoàng")) return "noble";
    if (ambition === "conqueror" || goal.includes("chiến")) return "warrior";
    if (ambition === "scholar" || goal.includes("học")) return "scholar";
    if (goal.includes("giàu") || goal.includes("buôn")) return "merchant";
    if (goal.includes("tu") || realm.includes("tông")) return "cultivator";
    if (npc.sect) return "cultivator";
    const basics = ["farmer","merchant","warrior","scholar","priest","artisan"];
    return basics[Math.floor(seededRand(npc.name + "career")() * basics.length)];
  }

  function seededRand(seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
    return function() { h = (Math.imul(h, 0x9e3779b9) + 0x6c62272e) | 0; return ((h >>> 0) / 0xffffffff); };
  }

  // ════ PUBLIC API ════
  window.npcLife65GetProfile = function(npcId) {
    return window.npcLifeV65Data.profiles[npcId] || null;
  };

  window.npcLife65GetCareerInfo = function(careerId) {
    return CAREERS.find(c => c.id === careerId) || null;
  };

  window.npcLife65RecordLifeEvent = function(npcId, title, content, importance) {
    const prof = window.npcLifeV65Data.profiles[npcId];
    if (!prof) return;
    const yr = window.year || 0;
    prof.lifeEvents.push({ year: yr, title, content, importance: importance || 3 });
    if (typeof window.npcMem64AddMemory === "function") {
      window.npcMem64AddMemory(npcId, "personal", title, content, importance || 3);
    }
  };

  window.npcLife65SetEmotion = function(npcId, primary, intensity) {
    const prof = window.npcLifeV65Data.profiles[npcId];
    if (!prof) return;
    prof.emotions.secondary = prof.emotions.primary;
    prof.emotions.primary = primary;
    prof.emotions.intensity = Math.min(100, Math.max(0, intensity || 50));
  };

  window.npcLife65AddGoal = function(npcId, goalTitle, description, deadline) {
    const prof = window.npcLifeV65Data.profiles[npcId];
    if (!prof) return;
    prof.goals.push({ title: goalTitle, description, deadline: deadline || null, progress: 0, active: true });
  };

  window.npcLife65GetTopProfiles = function(limit) {
    const profs = Object.values(window.npcLifeV65Data.profiles);
    return profs.sort((a,b) => b.lifeEvents.length - a.lifeEvents.length).slice(0, limit || 15);
  };

  window.npcLife65GetBiography = function(npcId) {
    const prof = window.npcLifeV65Data.profiles[npcId];
    const npcs = window.npcs || [];
    const npc = npcs.find(n => (n.id || n.name) === npcId);
    if (!prof || !npc) return null;
    const career = CAREERS.find(c => c.id === prof.career) || { label: "Không rõ", icon: "❓" };
    return {
      npc,
      career,
      dream: prof.dream,
      fear: prof.fear,
      birthYear: prof.birthYear,
      age: npc.age || 0,
      emotions: prof.emotions,
      happiness: prof.happiness,
      lifeEvents: prof.lifeEvents.sort((a,b) => b.year - a.year).slice(0, 15),
      goals: prof.goals.filter(g => g.active).slice(0, 5)
    };
  };

  window.npcLife65GetDeaths = function(limit) {
    return window.npcLifeV65Data.deathRecords.slice(-(limit || 10)).reverse();
  };

  window.npcLife65GetStats = function() {
    const d = window.npcLifeV65Data;
    const profs = Object.values(d.profiles);
    const careerCounts = {};
    CAREERS.forEach(c => careerCounts[c.id] = 0);
    profs.forEach(p => { if (p.career) careerCounts[p.career] = (careerCounts[p.career]||0) + 1; });
    return {
      totalProfiles: profs.length,
      births: d.birthRecords.length,
      deaths: d.deathRecords.length,
      careerCounts,
      avgHappiness: profs.length ? Math.round(profs.reduce((s,p) => s + (p.happiness||60), 0) / profs.length) : 0
    };
  };

  // ════ TICK: Simulate life ════
  function simulateLife() {
    const year = window.year || 0;
    const npcs = window.npcs || [];

    npcs.forEach(npc => {
      const id = npc.id || npc.name;
      if (!id) return;
      const prof = ensureProfile(npc);

      // Aging effects on happiness/hope
      if (npc.age && npc.lifespan) {
        const lifeRatio = npc.age / npc.lifespan;
        if (lifeRatio > 0.8 && !prof._oldAgeRecorded) {
          prof._oldAgeRecorded = true;
          prof.hope = Math.max(10, prof.hope - 20);
          window.npcLife65RecordLifeEvent(id, "Tuổi Già Đến", `${npc.name} nhận ra mình đã bước vào tuổi xế chiều. ${prof.dream ? 'Ước mơ "' + prof.dream + '" vẫn còn dang dở.' : ''}`, 3);
        }
      }

      // Marriage milestone
      if (npc.spouse && !prof._marriageRecorded) {
        prof._marriageRecorded = true;
        prof.happiness = Math.min(100, (prof.happiness||60) + 20);
        window.npcLife65SetEmotion(id, "happy", 80);
        window.npcLife65RecordLifeEvent(id, `Kết Hôn`, `${npc.name} kết đôi với ${npc.spouse}. Hạnh phúc tràn đầy.`, 4);
        if (typeof window.npcRel65RecordRelationship === "function") {
          window.npcRel65RecordRelationship(id, npc.spouse, "lover", 100);
        }
      }

      // Death recording
      if (npc.status === "dead" && !prof._deathRecorded) {
        prof._deathRecorded = true;
        window.npcLifeV65Data.deathRecords.push({
          id, name: npc.name, year,
          birthYear: prof.birthYear,
          career: prof.career,
          dream: prof.dream,
          dreamFulfilled: prof.lifeEvents.length > 5
        });
        window.npcLife65RecordLifeEvent(id, "Qua Đời", `${npc.name} rời khỏi thế giới ở tuổi ${npc.age||'?'}. ${prof.dream ? 'Ước mơ: "' + prof.dream + '"' : ''}.`, 5);
        if (typeof window.mem64Record === "function") {
          window.mem64Record("hero", `${npc.name} Từ Trần`, `${npc.name} (${CAREERS.find(c=>c.id===prof.career)||{label:'?'}}) qua đời năm ${year}.`, 3, ["npc_death"]);
        }
      }

      // Random daily life activity
      if (Math.random() < 0.02) {
        const activities = ["tu luyện", "giao thương", "đọc sách", "tập luyện võ nghệ", "thăm bằng hữu", "cầu nguyện"];
        prof.dailyLife.lastActivity = activities[Math.floor(Math.random() * activities.length)];
      }
    });
  }

  function save() {
    try {
      const d = window.npcLifeV65Data;
      const slim = {
        version: d.version,
        lastScan: d.lastScan,
        careerRecords: d.careerRecords.slice(-50),
        deathRecords: d.deathRecords.slice(-100),
        birthRecords: d.birthRecords.slice(-100),
        profiles: {}
      };
      Object.entries(d.profiles).forEach(([id, p]) => {
        slim.profiles[id] = { ...p, lifeEvents: (p.lifeEvents||[]).slice(-20), goals: (p.goals||[]).slice(-10) };
      });
      localStorage.setItem(SAVE_KEY, JSON.stringify(slim));
    } catch(e) { console.warn("[NpcLifeV65] save error:", e); }
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) window.npcLifeV65Data = { ...window.npcLifeV65Data, ...JSON.parse(raw) };
    } catch(e) {}
  }

  window.npcLifeV65Tick = function() {
    const year = window.year || 0;
    const d = window.npcLifeV65Data;
    if (year - d.lastScan < 5) return;
    d.lastScan = year;
    simulateLife();
    if (year % 50 === 0) save();
  };

  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      window.npcLifeV65Tick();
    };
    console.log("[NpcLifeEngineV65] ✅ Hệ thống cuộc đời NPC khởi động — Sinh linh bắt đầu thực sự sống.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 13400); });
  } else {
    setTimeout(init, 13400);
  }
})();
