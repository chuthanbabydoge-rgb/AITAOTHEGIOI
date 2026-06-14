(function () {
  "use strict";
  const SAVE_KEY = "cgv6_divine_presence_v71";

  const REACTION_TYPES = [
    { id: "venerate", name: "Tôn Kính",  icon: "🙏", color: "#fcd34d", desc: "Cúi đầu, dâng lễ vật, cầu nguyện" },
    { id: "fear",     name: "Sợ Hãi",   icon: "😱", color: "#fb923c", desc: "Run rẩy, bỏ chạy, trốn tránh" },
    { id: "skeptic",  name: "Hoài Nghi", icon: "🤔", color: "#94a3b8", desc: "Quan sát, đặt câu hỏi, không tin" },
    { id: "worship",  name: "Sùng Bái",  icon: "⭐", color: "#c084fc", desc: "Quỳ lạy, xin làm đệ tử, cúng dường" },
    { id: "rebel",    name: "Chống Đối", icon: "⚔️", color: "#ef4444", desc: "Chỉ trích, kêu gọi chống thần, tấn công" },
  ];

  const RELIGION_EVOLUTIONS = [
    { id: "worship_god",   name: "Thờ Đấng Sáng Thế",     icon: "✨", desc: "NPC lập đền thờ Creator làm thần tối cao" },
    { id: "creator_supreme", name: "Thần Tối Cao",          icon: "👑", desc: "Creator được xem là đứng trên mọi thần linh" },
    { id: "destroyer",     name: "Thần Hủy Diệt",           icon: "🔥", desc: "Creator bị xem là kẻ hủy diệt, phải đối kháng" },
    { id: "new_doctrine",  name: "Giáo Lý Mới",             icon: "📜", desc: "NPC tự tạo giáo lý dựa trên những gì thấy" },
    { id: "prophet_born",  name: "Ngôn Sứ Xuất Hiện",       icon: "🌟", desc: "Một NPC nhận 'thiên khải', trở thành prophet" },
  ];

  window.divinePresenceV71Data = {
    version: "V71",
    initialized: false,
    isActive: false,
    currentLocation: null,
    reactionLog: [],
    npcReactions: {},
    religionEvents: [],
    activeFollowers: [],
    activeCults: [],
    totalReactions: 0,
    presenceRadius: 3,
    religiousImpact: 0,
    lastPresenceYear: 0,
  };

  const D = window.divinePresenceV71Data;

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        reactionLog: D.reactionLog.slice(-40),
        religionEvents: D.religionEvents.slice(-20),
        activeCults: D.activeCults.slice(-10),
        activeFollowers: D.activeFollowers.slice(-20),
        totalReactions: D.totalReactions,
        religiousImpact: D.religiousImpact,
        lastPresenceYear: D.lastPresenceYear,
      }));
    } catch (e) {}
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        Object.assign(D, p);
      }
    } catch (e) {}
  }

  function getNpcReactionType(npc, avatarForm) {
    if (!npc) return "fear";
    const career = (npc.career || npc.job || "");
    const faith = npc.faith || npc.religion || "";
    const power = npc.power || npc.strength || 50;
    const intel = npc.intelligence || 50;
    const rand = Math.abs((npc.id || npc.name || "").split("").reduce(function (a, c) { return a + c.charCodeAt(0); }, 0)) % 100;

    if (career === "priest" || career === "tư tế" || faith) {
      if (rand < 50) return "worship";
      if (rand < 80) return "venerate";
      return "skeptic";
    }
    if (career === "scholar" || career === "học giả") {
      if (rand < 60) return "skeptic";
      if (rand < 80) return "venerate";
      return "fear";
    }
    if (career === "warrior" || career === "chiến binh") {
      if (rand < 30) return "rebel";
      if (rand < 60) return "fear";
      return "venerate";
    }
    if (power > 70) return rand < 40 ? "rebel" : "venerate";
    if (power < 30) return rand < 60 ? "fear" : "worship";
    if (rand < 20) return "worship";
    if (rand < 50) return "venerate";
    if (rand < 70) return "fear";
    if (rand < 85) return "skeptic";
    return "rebel";
  }

  window.dps71GetReactionTypes = function () { return REACTION_TYPES.slice(); };
  window.dps71GetReligionEvolutions = function () { return RELIGION_EVOLUTIONS.slice(); };
  window.dps71GetData = function () { return D; };
  window.dps71GetReactionLog = function () { return D.reactionLog.slice(-30); };
  window.dps71GetFollowers = function () { return D.activeFollowers.slice(); };
  window.dps71GetCults = function () { return D.activeCults.slice(); };
  window.dps71GetReligionEvents = function () { return D.religionEvents.slice(); };

  window.dps71EnterPresence = function (locationName, avatarForm) {
    D.isActive = true;
    D.currentLocation = locationName || "Vùng Đất Trung Tâm";
    D.lastPresenceYear = window.year || 1;

    const npcs = (window.npcs || []).filter(function (n) { return n.status === "alive"; });
    const sample = npcs.slice(0, 12 + Math.min(8, Math.floor(npcs.length / 10)));
    const results = { venerate: 0, fear: 0, skeptic: 0, worship: 0, rebel: 0 };

    sample.forEach(function (npc) {
      const rt = getNpcReactionType(npc, avatarForm || "human");
      results[rt] = (results[rt] || 0) + 1;
      D.npcReactions[npc.id || npc.name] = rt;
      D.totalReactions++;

      if (rt === "worship") {
        const already = D.activeFollowers.find(function (f) { return f.id === (npc.id || npc.name); });
        if (!already) {
          D.activeFollowers.push({ id: npc.id || npc.name, name: npc.name, career: npc.career || "dân thường", year: window.year || 1 });
          if (window.avatarGodV71Data) window.avatarGodV71Data.totalFollowers = D.activeFollowers.length;
        }
      }
    });

    const year = window.year || 1;
    const logEntry = {
      year, location: D.currentLocation, form: avatarForm || "human",
      reactions: results, ts: Date.now(),
    };
    D.reactionLog.push(logEntry);
    if (D.reactionLog.length > 40) D.reactionLog = D.reactionLog.slice(-40);

    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year, type: "divine", title: "🌟 Thần Hiện Thân tại " + D.currentLocation, color: "#c084fc" });
    }
    if (typeof window.mem64Record === "function") {
      window.mem64Record("divine", "Thần Hiện Thân Tại " + D.currentLocation,
        "Đấng Sáng Thế xuất hiện với hình thức " + avatarForm + " tại " + D.currentLocation +
        ". Phản ứng: " + results.venerate + " tôn kính, " + results.fear + " sợ hãi, " + results.worship + " sùng bái, " + results.rebel + " chống đối.",
        9, ["divine", "avatar", "appearance"]);
    }

    if (window.avatarGodV71Data) {
      window.avatarGodV71Data.totalAppearances++;
      window.avatarGodV71Data.stats.totalAppearances++;
      window.avatarGodV71Data.stats.npcsFeared += results.fear;
      window.avatarGodV71Data.stats.npcsConverted += results.worship;
      if (typeof window.avg71LogAppearance === "function") {
        window.avg71LogAppearance("✨ Hiện thân tại " + D.currentLocation + " — " + results.worship + " sùng bái · " + results.fear + " sợ hãi · " + results.rebel + " chống đối");
      }
    }

    save();
    return { results, location: D.currentLocation, followerCount: D.activeFollowers.length };
  };

  window.dps71TriggerReligionEvolution = function (evolType, locationName) {
    const evol = RELIGION_EVOLUTIONS.find(function (e) { return e.id === evolType; }) || RELIGION_EVOLUTIONS[0];
    const year = window.year || 1;
    const cultName = generateCultName(evolType);
    const cultEntry = {
      id: cultName.replace(/\s/g, "_") + "_" + year,
      name: cultName,
      type: evolType,
      icon: evol.icon,
      founded: year,
      location: locationName || D.currentLocation || "Vùng Không Tên",
      followers: Math.floor(Math.random() * 20) + 5,
      doctrine: generateDoctrine(evolType),
    };
    D.activeCults.push(cultEntry);
    D.religionEvents.push({ year, event: evol.icon + " " + evol.name + " — " + cultEntry.name + " thành lập tại " + cultEntry.location });
    D.religiousImpact += 10;

    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year, type: "religion", title: evol.icon + " " + evol.name + ": " + cultEntry.name, color: "#c084fc" });
    }
    if (typeof window.mem64Record === "function") {
      window.mem64Record("divine", evol.name + ": " + cultEntry.name,
        cultEntry.doctrine + " (Thành lập năm " + year + " tại " + cultEntry.location + ")", 8, ["religion", "cult", evolType]);
    }
    if (window.avatarGodV71Data) {
      window.avatarGodV71Data.totalCults++;
      window.avatarGodV71Data.stats.religionsCreated++;
    }

    save();
    return cultEntry;
  };

  function generateCultName(evolType) {
    const prefixes = { worship_god: ["Hội Thờ", "Giáo Hội", "Tông Phái"], creator_supreme: ["Thiên Đình", "Vô Thượng Giáo", "Đại Đạo"], destroyer: ["Kháng Thần Hội", "Giáo Phái Tự Do", "Liên Minh Kháng Thiên"], new_doctrine: ["Tân Đạo", "Giáo Phái Mới", "Hội Khai Sáng"], prophet_born: ["Môn Phái Tiên Tri", "Đạo Thiên Khải", "Hội Ngôn Sứ"] };
    const forms = ["Ánh Sáng", "Thiên Địa", "Vĩnh Cửu", "Hỗn Độn", "Trường Sinh", "Thần Linh", "Huyền Bí"];
    const pr = prefixes[evolType] || prefixes.new_doctrine;
    return pr[Math.floor(Math.random() * pr.length)] + " " + forms[Math.floor(Math.random() * forms.length)];
  }

  function generateDoctrine(evolType) {
    const doctrines = {
      worship_god: "Đấng Sáng Thế là nguồn gốc của vạn vật. Mọi tín đồ phải dâng lễ mỗi 10 năm và không được chống lại ý chí thần linh.",
      creator_supreme: "Trên cả trời đất chỉ có một đấng tối cao — Người Sáng Thế. Mọi thần linh khác đều là bề tôi của Ngài.",
      destroyer: "Kẻ gọi là thần là mối nguy hiểm. Chúng ta phải đoàn kết chống lại sự can thiệp của hắn vào thế giới.",
      new_doctrine: "Chúng ta đã chứng kiến điều kỳ diệu. Từ nay, ta sẽ sống theo nguyên lý mà Đấng Hiện Thân đã chỉ dạy.",
      prophet_born: "Ta đã nhận thiên khải từ Đấng Vô Hình. Lời ta là lời của Thần — hãy nghe và tuân theo.",
    };
    return doctrines[evolType] || "Một giáo lý mới đang hình thành...";
  }

  window.dps71ExitPresence = function () {
    D.isActive = false;
    D.currentLocation = null;
    if (window.avatarGodV71Data) window.avatarGodV71Data.presenceState = "watching";
    save();
  };

  window.dps71GetSummary = function () {
    return {
      totalFollowers: D.activeFollowers.length,
      totalCults: D.activeCults.length,
      religiousImpact: D.religiousImpact,
      totalReactions: D.totalReactions,
      lastPresenceYear: D.lastPresenceYear,
    };
  };

  function init() {
    load();
    D.initialized = true;
    console.log("[divinePresenceSystem V71] ✨ Divine Presence System khởi động — 5 phản ứng NPC · 5 tiến hóa tôn giáo.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 17000); });
  } else {
    setTimeout(init, 17000);
  }
})();
