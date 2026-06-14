(function() {
  "use strict";
  const SAVE_KEY = "cgv6_creator_legacy_v66";

  window.creatorLegacyV66Data = {
    version: 66,
    godName: "Đấng Sáng Thế",
    divineTitle: "Nguyên Thủy Thiên Đế",
    legacyEntries: [],    // Mọi hành động thần linh
    jarvisLog: [],        // Jarvis Divine Mode notes
    eraMarkers: [],       // Các kỷ nguyên do thần tạo ra
    worshipStats: { totalPrayers: 0, temples: 0, believers: 0 },
    totalDivineActs: 0,
    godScore: 0           // Điểm uy quyền thần linh
  };

  const ACT_WEIGHTS = {
    intervention: 10,
    grand_miracle: 50,
    miracle_v51: 20,
    punishment: 15,
    divine_message: 8,
    divine_law: 25,
    prophecy: 20,
    artifact: 30
  };

  // ════ CORE: RECORD ALL DIVINE ACTS ════
  window.creatorLeg66Record = function(actType, title, target, description, importance) {
    const year = window.year || 0;
    const weight = ACT_WEIGHTS[actType] || 10;
    const entry = {
      actType, title, target, description,
      importance: importance || 3,
      year, weight,
      id: Date.now()
    };
    window.creatorLegacyV66Data.legacyEntries.push(entry);
    window.creatorLegacyV66Data.totalDivineActs++;
    window.creatorLegacyV66Data.godScore += weight;

    // Auto Jarvis commentary
    _jarvisComment(actType, title, target, year);

    return entry;
  };

  function _jarvisComment(actType, title, target, year) {
    const templates = {
      intervention: [
        `Năm ${year}: Ngài can thiệp vào thế giới. ${target} cảm nhận được bàn tay thần linh.`,
        `Thần lực tỏa ra — ${target} thay đổi dưới ý chí của Ngài.`
      ],
      grand_miracle: [
        `Năm ${year}: Đại Thần Tích "${title}" rung chuyển cả vũ trụ! Thế giới sẽ nhớ mãi giây phút này.`,
        `Đây là phép màu vĩ đại nhất kể từ khi thế giới được tạo ra.`
      ],
      punishment: [
        `Năm ${year}: Thần Nộ giáng xuống ${target}. Kẻ sai trái không thoát khỏi mắt thần linh.`,
        `Công lý thần linh được thực thi — ${target} nhận lấy hình phạt xứng đáng.`
      ],
      divine_message: [
        `Năm ${year}: Ngài phán với ${target}. Lời thần linh vang vọng khắp thế gian.`,
        `Tiếng phán quyết thiêng liêng truyền đến ${target} — họ sẽ không bao giờ quên.`
      ],
      divine_law: [
        `Năm ${year}: Luật Thiêng "${title}" được ban hành — thế giới có thêm một trật tự mới.`,
        `Ý chí của Ngài trở thành luật pháp — ai vi phạm sẽ chịu hậu quả thần linh.`
      ],
      prophecy: [
        `Năm ${year}: Thiên Khải về "${target}" được ban bố. Tương lai đã được định sẵn.`,
        `Lời tiên tri của Ngài — dù ngàn năm sau, vẫn sẽ ứng nghiệm.`
      ],
      artifact: [
        `Năm ${year}: Thần Khí "${title}" ra đời — một vật phẩm chứa đựng ý chí của Ngài.`,
        `Vật thiêng được tạo ra — ai cầm giữ sẽ mang theo phần sức mạnh của Ngài.`
      ]
    };
    const list = templates[actType] || [`Năm ${year}: Ngài thực hiện ${title}.`];
    const comment = list[Math.floor(Math.random() * list.length)];
    window.creatorLegacyV66Data.jarvisLog.push({ year, comment, actType, title });
  }

  // ════ GOD NAME ════
  window.creatorLeg66SetGodName = function(name, title) {
    window.creatorLegacyV66Data.godName = name || "Đấng Sáng Thế";
    if (title) window.creatorLegacyV66Data.divineTitle = title;
    save();
  };
  window.creatorLeg66GetGodName = function() {
    return window.creatorLegacyV66Data.godName;
  };

  // ════ GETTERS ════
  window.creatorLeg66GetAll = function(limit) {
    return window.creatorLegacyV66Data.legacyEntries.slice(-(limit||50)).reverse();
  };
  window.creatorLeg66GetByType = function(actType, limit) {
    return window.creatorLegacyV66Data.legacyEntries
      .filter(e => e.actType === actType).slice(-(limit||20)).reverse();
  };
  window.creatorLeg66GetJarvisLog = function(limit) {
    return window.creatorLegacyV66Data.jarvisLog.slice(-(limit||20)).reverse();
  };
  window.creatorLeg66GetGodScore = function() {
    return window.creatorLegacyV66Data.godScore;
  };
  window.creatorLeg66GetStats = function() {
    const d = window.creatorLegacyV66Data;
    const typeCount = {};
    d.legacyEntries.forEach(e => { typeCount[e.actType] = (typeCount[e.actType]||0) + 1; });
    return {
      godScore: d.godScore,
      totalActs: d.totalDivineActs,
      godName: d.godName,
      divineTitle: d.divineTitle,
      byType: typeCount,
      jarvisEntries: d.jarvisLog.length
    };
  };

  // ════ GOD SCORE → TITLE ════
  window.creatorLeg66GetGodRank = function() {
    const score = window.creatorLegacyV66Data.godScore;
    if (score < 100)   return { rank: 1, title: "Vị Thần Sơ Khai",       icon: "🌱" };
    if (score < 300)   return { rank: 2, title: "Thần Linh Trẻ",          icon: "✨" };
    if (score < 600)   return { rank: 3, title: "Vị Thần Được Tôn Kính",  icon: "⭐" };
    if (score < 1000)  return { rank: 4, title: "Thần Vương",             icon: "👑" };
    if (score < 2000)  return { rank: 5, title: "Thiên Đế",               icon: "🌟" };
    if (score < 5000)  return { rank: 6, title: "Nguyên Thủy Thần Linh",  icon: "🔮" };
    return { rank: 7, title: "Vô Thủy Nguyên Thần",                       icon: "💎" };
  };

  // ════ JARVIS DIVINE NARRATIVE ════
  window.creatorLeg66GenerateNarrative = function() {
    const d = window.creatorLegacyV66Data;
    const rank = window.creatorLeg66GetGodRank();
    const stats = window.creatorLeg66GetStats();
    const year = window.year || 0;
    const miracles = (stats.byType.grand_miracle || 0) + (stats.byType.miracle_v51 || 0);
    const punishments = stats.byType.punishment || 0;
    const interventions = stats.byType.intervention || 0;

    let narrative = `━━━ BIÊN NIÊN SỬ THẦN LINH ━━━\n\n`;
    narrative += `👁️ ${d.godName} — ${rank.icon} ${rank.title}\n`;
    narrative += `🌟 Thần Uy Điểm: ${d.godScore} | Tổng Hành Động: ${d.totalDivineActs}\n\n`;
    narrative += `📅 Năm Hiện Tại: ${year}\n\n`;

    if (d.totalDivineActs === 0) {
      narrative += `"Thế giới im lặng chờ đợi. Đấng Sáng Thế chưa một lần lên tiếng.\nNhưng ngay cả sự im lặng của thần linh cũng chứa đựng một ý nghĩa sâu xa."\n\n`;
    } else {
      narrative += `"Từ buổi khai thiên lập địa, ${d.godName} đã thực hiện ${d.totalDivineActs} hành động thần linh.\n`;
      if (miracles > 0) narrative += `${miracles} phép màu đã thay đổi vận mệnh thế giới.\n`;
      if (punishments > 0) narrative += `${punishments} lần thần phạt giáng xuống kẻ tội lỗi.\n`;
      if (interventions > 0) narrative += `${interventions} lần can thiệp trực tiếp vào thế giới.\n`;
      narrative += `\nMột ngàn năm sau, con cháu vẫn kể về những điều Ngài đã làm.\n'Đó là phép màu của Đấng Sáng Thế.' — câu nói này sẽ vang vọng đến tận cùng thời gian."\n\n`;
    }

    // Recent acts
    const recent = d.legacyEntries.slice(-5).reverse();
    if (recent.length > 0) {
      narrative += `━━━ HỒ SƠ GẦN ĐÂY ━━━\n`;
      recent.forEach(e => {
        narrative += `• Năm ${e.year} [${e.actType}]: ${e.title} → ${e.target}\n`;
      });
    }

    return narrative;
  };

  // ════ WORSHIP CALCULATION ════
  function calculateWorship() {
    const npcs = window.npcs || [];
    const blessed = npcs.filter(n => n._divineBlessed || n._divineArtifact).length;
    const cursed = npcs.filter(n => n._cursed).length;
    const total = npcs.filter(n => n.status === "alive").length;

    const d = window.creatorLegacyV66Data;
    d.worshipStats.believers = blessed + Math.floor(total * 0.3);
    d.worshipStats.temples = Math.floor(d.totalDivineActs / 5);
    d.worshipStats.totalPrayers = d.totalDivineActs * 12;
  }

  function tick() {
    const year = window.year || 0;
    if (year % 50 === 0) {
      calculateWorship();
      save();
    }
  }

  function save() {
    try {
      const d = window.creatorLegacyV66Data;
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        ...d,
        legacyEntries: d.legacyEntries.slice(-200),
        jarvisLog: d.jarvisLog.slice(-100)
      }));
    } catch(e) {}
  }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) window.creatorLegacyV66Data = { ...window.creatorLegacyV66Data, ...JSON.parse(raw) };
    } catch(e) {}
  }

  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); tick(); };
    console.log("[CreatorLegacyV66] 📖 Legacy System khởi động — Mọi hành động thần linh sẽ được ghi nhớ mãi mãi.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 14400); });
  } else {
    setTimeout(init, 14400);
  }
})();
