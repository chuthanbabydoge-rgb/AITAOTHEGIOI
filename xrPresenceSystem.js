(function() {
  "use strict";
  const SAVE_KEY = "cgv6_xr_presence_v72";

  window.xrPresenceV72Data = {
    worldPosition: { country: null, city: null, district: null, street: null },
    enterWorldMode: false,
    currentScale: "god",
    scaleHistory: [],
    npcReactions: [],
    npcConversations: [],
    nearbyNpcs: [],
    godScaleVisual: {
      heightMeters: 1000,
      viewAngle: 60,
      auraColor: "#8b5cf6",
      footprint: "mountain"
    },
    humanScaleVisual: {
      heightMeters: 1.75,
      viewAngle: 90,
      auraColor: "#fbbf24",
      footprint: "human"
    },
    presenceEvents: [],
    totalNpcEncounters: 0
  };

  var NPC_REACTION_TEMPLATES = {
    worship:  { icon: "🙏", label: "Cầu Nguyện",  lines: [
      "Lạy Đấng Toàn Năng! Người đã giáng thế!",
      "Ôi Thần Linh, xin hãy ban phước cho chúng con!",
      "Con đã chờ Người cả đời này — Người thực sự tồn tại!"
    ]},
    fear:     { icon: "😱", label: "Khiếp Sợ",    lines: [
      "Chạy đi! Chạy đi! Thần linh đang đến!",
      "Ôi trời đất — cái bóng đó... khổng lồ như núi!",
      "Tôi không thể nhìn thẳng vào ánh sáng đó!"
    ]},
    greet:    { icon: "👋", label: "Chào Đón",     lines: [
      "Chào mừng Người đến với thành phố của chúng tôi, Đấng Sáng Thế!",
      "Hôm nay là ngày lịch sử — Thần đã bước vào thế giới của chúng tôi!",
      "Người đến rồi! Tôi sẽ gọi hết mọi người ra để chứng kiến!"
    ]},
    skeptic:  { icon: "🤔", label: "Hoài Nghi",    lines: [
      "Hmm... có thể đây chỉ là ảo giác quang học?",
      "Tôi cần quan sát thêm trước khi kết luận...",
      "Hiện tượng lạ — nhưng không nhất thiết là thần linh."
    ]},
    converse: { icon: "💬", label: "Trò Chuyện",   lines: [
      "Người có thể kể cho tôi nghe về thế giới bên ngoài này không?",
      "Tôi có một câu hỏi mà không ai trong thành phố trả lời được...",
      "Xin Người hãy ở lại — chúng tôi có rất nhiều điều muốn hỏi!"
    ]},
    pray:     { icon: "✨", label: "Cầu Khẩn",     lines: [
      "Lạy Đấng Sáng Thế, con cầu xin Người chữa lành cho con trai con...",
      "Nếu Người thực sự là Thần, xin hãy kết thúc cuộc chiến này!",
      "Con dâng lên Người tất cả những gì con có — xin Người lắng nghe."
    ]}
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.xrPresenceV72Data)); } catch(e) {}
  }

  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) {
        const p = JSON.parse(d);
        window.xrPresenceV72Data = Object.assign(window.xrPresenceV72Data, p);
      }
    } catch(e) {}
  }

  function getCountries() {
    let arr = window.countries;
    if (!Array.isArray(arr)) {
      if (arr && typeof arr === "object") arr = Object.values(arr);
      else arr = [];
    }
    return arr;
  }

  function getNpcs() {
    let arr = window.npcs;
    if (!Array.isArray(arr)) {
      if (arr && typeof arr === "object") arr = Object.values(arr);
      else arr = [];
    }
    return arr.filter(function(n) { return n && n.name; });
  }

  function presLog(msg) {
    const entry = { year: window.year || 0, msg };
    window.xrPresenceV72Data.presenceEvents.unshift(entry);
    if (window.xrPresenceV72Data.presenceEvents.length > 50) window.xrPresenceV72Data.presenceEvents.pop();
    if (typeof window.xrw72Log === "function") window.xrw72Log(msg);
  }

  function pickReactionType(npc) {
    const career = (npc.career || npc.profession || "").toLowerCase();
    const power = npc.power || 50;
    const faith = npc.faith || npc.piety || 0;
    if (career.includes("priest") || career.includes("monk") || career.includes("tư tế")) {
      return faith > 50 ? "worship" : "pray";
    }
    if (career.includes("warrior") || career.includes("soldier") || career.includes("chiến binh")) {
      return power > 70 ? "skeptic" : "fear";
    }
    if (career.includes("scholar") || career.includes("học giả")) {
      return "skeptic";
    }
    const r = Math.random();
    if (r < 0.25) return "worship";
    if (r < 0.45) return "fear";
    if (r < 0.60) return "greet";
    if (r < 0.72) return "pray";
    if (r < 0.85) return "converse";
    return "skeptic";
  }

  window.xrp72EnterWorld = function(countryName) {
    const countries = getCountries();
    const country = countries.find(function(c) { return c.name === countryName; }) || countries[0];
    if (!country) return { success: false, msg: "Không tìm thấy quốc gia" };

    window.xrPresenceV72Data.enterWorldMode = true;
    window.xrPresenceV72Data.worldPosition.country = country.name;
    window.xrPresenceV72Data.worldPosition.city = country.capital || country.name + " Capital";

    const npcs = getNpcs();
    const nearby = npcs.slice(0, 6);
    window.xrPresenceV72Data.nearbyNpcs = nearby.map(function(n) {
      const rtype = pickReactionType(n);
      const tpl = NPC_REACTION_TEMPLATES[rtype];
      const line = tpl.lines[Math.floor(Math.random() * tpl.lines.length)];
      return { name: n.name, career: n.career || "Dân Thường", reaction: rtype, icon: tpl.icon, label: tpl.label, quote: line };
    });

    window.xrPresenceV72Data.totalNpcEncounters += nearby.length;
    presLog("🌍 Bước vào thế giới tại " + country.name + " — " + nearby.length + " NPC nhận ra sự hiện diện");

    if (typeof window.dps71EnterPresence === "function") {
      try { window.dps71EnterPresence(country.name, null); } catch(e) {}
    }
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: window.year || 0, type: "divine", title: "Creator bước vào thế giới tại " + country.name, color: "#8b5cf6" });
    }

    save();
    return { success: true, country: country.name, city: window.xrPresenceV72Data.worldPosition.city, nearbyNpcs: window.xrPresenceV72Data.nearbyNpcs };
  };

  window.xrp72ExitWorld = function() {
    window.xrPresenceV72Data.enterWorldMode = false;
    window.xrPresenceV72Data.nearbyNpcs = [];
    presLog("🚪 Creator rời khỏi thế giới — trở về cõi thần linh");
    if (typeof window.dps71ExitPresence === "function") {
      try { window.dps71ExitPresence(); } catch(e) {}
    }
    save();
  };

  window.xrp72SetGodScale = function(mode) {
    window.xrPresenceV72Data.currentScale = mode;
    window.xrPresenceV72Data.scaleHistory.push({ year: window.year || 0, mode });
    if (window.xrPresenceV72Data.scaleHistory.length > 20) window.xrPresenceV72Data.scaleHistory.shift();
    if (mode === "god") {
      presLog("⚡ Thần Khổng Lồ — Bóng thần che khuất cả thành phố, dân chúng ngã xuống đất sợ hãi");
    } else {
      presLog("🧑 Thu nhỏ về tỷ lệ người — Thần đi giữa dân chúng như một người thường");
    }
    if (typeof window.xrw72SetGodScale === "function") window.xrw72SetGodScale(mode);
    save();
  };

  window.xrp72TriggerNpcReaction = function(npcName, reactionType) {
    const tpl = NPC_REACTION_TEMPLATES[reactionType];
    if (!tpl) return null;
    const line = tpl.lines[Math.floor(Math.random() * tpl.lines.length)];
    const entry = {
      year: window.year || 0,
      npc: npcName,
      reaction: reactionType,
      icon: tpl.icon,
      label: tpl.label,
      quote: line
    };
    window.xrPresenceV72Data.npcReactions.unshift(entry);
    if (window.xrPresenceV72Data.npcReactions.length > 30) window.xrPresenceV72Data.npcReactions.pop();
    presLog(tpl.icon + " " + npcName + ": \"" + line + "\"");
    save();
    return entry;
  };

  window.xrp72StartConversation = function(npcName) {
    const npcs = getNpcs();
    const npc = npcs.find(function(n) { return n.name === npcName; });
    if (!npc) return null;
    const topics = [
      "Lịch sử của thành phố này",
      "Cuộc chiến đang diễn ra",
      "Những thần linh mà dân chúng thờ phụng",
      "Ước mơ của " + npc.name,
      "Điều kỳ lạ nhất " + npc.name + " từng thấy",
      "Tương lai của vương quốc này",
      "Sự thật về đấng tạo hóa"
    ];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const conv = {
      year: window.year || 0,
      npc: npcName,
      career: npc.career || "Dân Thường",
      topic,
      response: npc.name + " nhìn lên bầu trời rồi nói: \"Về " + topic.toLowerCase() + "... có rất nhiều điều tôi muốn kể với Người.\""
    };
    window.xrPresenceV72Data.npcConversations.unshift(conv);
    if (window.xrPresenceV72Data.npcConversations.length > 20) window.xrPresenceV72Data.npcConversations.pop();
    presLog("💬 " + npcName + " bắt đầu trò chuyện về: " + topic);
    save();
    return conv;
  };

  window.xrp72GetNearbyNpcs = function() { return window.xrPresenceV72Data.nearbyNpcs; };
  window.xrp72GetReactions = function() { return window.xrPresenceV72Data.npcReactions; };
  window.xrp72GetConversations = function() { return window.xrPresenceV72Data.npcConversations; };
  window.xrp72GetData = function() { return window.xrPresenceV72Data; };
  window.xrp72GetPresenceLog = function() { return window.xrPresenceV72Data.presenceEvents; };
  window.NPC_REACTION_TEMPLATES_V72 = NPC_REACTION_TEMPLATES;

  function init() {
    load();
    console.log("[XR Presence System V72] ✨ Khởi động — NPC sẵn sàng phản ứng với Creator");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 17500); });
  } else {
    setTimeout(init, 17500);
  }
})();
