(function() {
  "use strict";
  const SAVE_KEY = "cgv6_xr_god_v72";

  window.xrGodV72Data = {
    divineCommands: [],
    voiceCommandLog: [],
    historyReplays: [],
    currentReplay: null,
    replayStep: 0,
    replayPlaying: false,
    jarvisXR: {
      active: false,
      mode: "companion",
      lastMessage: "",
      messageQueue: [],
      totalMessages: 0
    },
    blessings: [],
    miracles: [],
    stats: {
      totalCommands: 0,
      totalBlessings: 0,
      totalMiracles: 0,
      totalReplays: 0,
      totalJarvisMessages: 0
    }
  };

  var DIVINE_COMMANDS = [
    { id: "bless_city",    icon: "✨", label: "Ban Phước Thành Phố",    cost: 80,  desc: "Tất cả dân cư được ban phước — mùa màng bội thu, bệnh tật tan biến" },
    { id: "miracle_rain",  icon: "🌧️", label: "Tạo Mưa Phép Màu",       cost: 60,  desc: "Mưa vàng từ trời cao — NPC gọi đó là thiên ân" },
    { id: "smite_evil",    icon: "⚡", label: "Trừng Phạt Kẻ Ác",       cost: 120, desc: "Sét thần giáng xuống — kẻ tội lỗi bị trừng phạt" },
    { id: "heal_plague",   icon: "💊", label: "Chữa Lành Đại Dịch",     cost: 150, desc: "Ánh sáng thần chữa lành mọi bệnh tật trong vùng" },
    { id: "summon_hero",   icon: "⚔️", label: "Triệu Hồi Anh Hùng",     cost: 180, desc: "Một NPC thường được chọn lọc — trở thành anh hùng thế giới" },
    { id: "open_era",      icon: "🌅", label: "Khai Mở Kỷ Nguyên",      cost: 200, desc: "Tuyên bố một kỷ nguyên mới bắt đầu từ khoảnh khắc này" },
    { id: "prophecy",      icon: "🔮", label: "Phán Lời Tiên Tri",       cost: 80,  desc: "Lời thần khắc vào đá, tồn tại 1000 năm" },
    { id: "divine_voice",  icon: "📣", label: "Thần Ngôn",               cost: 50,  desc: "Tiếng nói thần vang khắp thế giới — tất cả đều nghe" }
  ];

  var REPLAY_TYPES = [
    { id: "wars",    icon: "⚔️", label: "Chiến Tranh Lịch Sử",   color: "#ef4444", desc: "Replay các cuộc chiến đã xảy ra" },
    { id: "empires", icon: "👑", label: "Đế Quốc Đã Sụp Đổ",     color: "#f59e0b", desc: "Replay sự hình thành và sụp đổ các đế quốc" },
    { id: "heroes",  icon: "🦸", label: "Hành Trình Anh Hùng",    color: "#3b82f6", desc: "Replay cuộc đời các anh hùng nổi tiếng" },
    { id: "divine",  icon: "✨", label: "Can Thiệp Thần Linh",    color: "#8b5cf6", desc: "Replay các lần Creator xuất hiện trong lịch sử" },
    { id: "disasters", icon: "🌋", label: "Thảm Họa Lớn",         color: "#f97316", desc: "Replay các thiên tai đã định hình thế giới" }
  ];

  var JARVIS_XR_LINES = {
    companion: [
      "Tôi sẽ đồng hành cùng Người trong hành trình này, Đấng Sáng Thế.",
      "Để tôi dẫn đường — bên phải là khu thương mại, phía trước là đền thờ.",
      "NPC này có lịch sử thú vị — muốn tôi kể không?",
      "Tôi phát hiện một điểm nóng — có cuộc chiến sắp nổ ra ở phía đông.",
      "Chúng ta đã đi qua 3 vương quốc — thế giới này thực sự rộng lớn."
    ],
    explain: [
      "Thành phố này được xây năm " + (window.year ? window.year - 200 : 800) + " — dân số đang tăng trưởng 3% mỗi thế kỷ.",
      "Đây là trung tâm thương mại lớn nhất — kiểm soát 40% đường giao thương.",
      "Tôn giáo thống trị tại đây là thờ phụng Đấng Sáng Thế — tức là Người.",
      "NPC gần nhất có chỉ số sức mạnh cao bất thường — có thể là anh hùng tiềm năng.",
      "Khu vực này từng là chiến trường — đất vẫn còn ký ức về máu và lửa."
    ],
    guide: [
      "Để ban phước hiệu quả nhất, hãy chọn thành phố có dân số cao.",
      "Khuyến nghị: kích hoạt God Scale Shift → tiến vào từ Universe View → City View.",
      "Tip: Ra lệnh thần tại khu vực có thiên tai đang diễn ra sẽ tạo ấn tượng mạnh nhất.",
      "Hướng dẫn XR: Pinch để chọn thực thể, Grab để di chuyển, Rotate để xoay thế giới.",
      "Gợi ý: Khởi động Replay Mode để xem lại lịch sử trước khi can thiệp."
    ]
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.xrGodV72Data)); } catch(e) {}
  }

  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) {
        const p = JSON.parse(d);
        window.xrGodV72Data = Object.assign(window.xrGodV72Data, p);
      }
    } catch(e) {}
  }

  function godLog(msg) {
    if (typeof window.xrw72Log === "function") window.xrw72Log(msg);
  }

  function spendEnergy(amount) {
    if (typeof window.avg71SpendEnergy === "function") {
      return window.avg71SpendEnergy(amount);
    }
    return true;
  }

  window.xrg72GetCommands = function() { return DIVINE_COMMANDS; };
  window.xrg72GetReplayTypes = function() { return REPLAY_TYPES; };

  window.xrg72ExecuteCommand = function(cmdId, opts) {
    const cmd = DIVINE_COMMANDS.find(function(c) { return c.id === cmdId; });
    if (!cmd) return { success: false, msg: "Lệnh không tồn tại" };

    if (!spendEnergy(cmd.cost)) {
      return { success: false, msg: "Không đủ Thần Năng — cần " + cmd.cost + "⚡" };
    }

    const country = (opts && opts.country) ? opts.country : (window.xrPresenceV72Data && window.xrPresenceV72Data.worldPosition.country) || "Vùng Đất Chưa Đặt Tên";
    const year = window.year || 0;

    var result = "";
    switch(cmdId) {
      case "bless_city":
        result = "Ánh sáng vàng tràn khắp " + country + " — dân chúng ngã xuống cúi đầu. Mùa màng bội thu trong 50 năm tới.";
        window.xrGodV72Data.stats.totalBlessings++;
        window.xrGodV72Data.blessings.push({ year, country, type: cmd.label });
        break;
      case "miracle_rain":
        result = "Mưa vàng từ trời rơi xuống " + country + " — cả thành phố reo hò. Người dân gọi đây là Thiên Ân Năm " + year + ".";
        window.xrGodV72Data.stats.totalMiracles++;
        window.xrGodV72Data.miracles.push({ year, country, type: "Mưa Vàng" });
        break;
      case "smite_evil":
        result = "Sét thần xé không khí — kẻ tội lỗi tại " + country + " bị trừng phạt. Ổn định xã hội tăng mạnh.";
        if (window.countries) {
          const arr = Array.isArray(window.countries) ? window.countries : Object.values(window.countries);
          const c = arr.find(function(x) { return x.name === country; });
          if (c && c.stability !== undefined) c.stability = Math.min(100, (c.stability || 50) + 15);
        }
        break;
      case "heal_plague":
        result = "Ánh sáng xanh bao phủ " + country + " — mọi bệnh tật biến mất. Y học ghi chép: 'Phép màu thần linh năm " + year + "'.";
        if (window.plagueData && Array.isArray(window.plagueData.activePlagues)) {
          window.plagueData.activePlagues = window.plagueData.activePlagues.filter(function(p) { return p.region !== country; });
        }
        window.xrGodV72Data.stats.totalMiracles++;
        break;
      case "summon_hero":
        var npcs = window.npcs;
        if (!Array.isArray(npcs)) npcs = npcs ? Object.values(npcs) : [];
        var candidate = npcs.find(function(n) { return n && n.name && (n.career === "warrior" || n.career === "soldier"); }) || npcs[0];
        result = candidate
          ? candidate.name + " được Thần chọn lọc — ánh sáng bao bọc, sức mạnh tăng gấp bội. Một anh hùng mới ra đời!"
          : "Một linh hồn dũng cảm tại " + country + " được chọn — họ không biết rằng số phận vừa thay đổi.";
        break;
      case "open_era":
        result = "Kỷ Nguyên Thần Linh bắt đầu từ năm " + year + " — lịch sử thế giới sẽ ghi lại đây là khởi điểm của một thời đại mới.";
        if (typeof window.htAddEvent === "function") {
          window.htAddEvent({ year, type: "era", title: "Kỷ Nguyên Thần Linh — Creator Khai Mở", color: "#fbbf24" });
        }
        break;
      case "prophecy":
        var prophecyText = "\"Sẽ đến ngày ánh sáng và bóng tối hội tụ — kẻ mạnh sẽ sụp đổ, kẻ yếu sẽ đứng dậy. Đó là ý chí của Thần.\"";
        result = "Lời tiên tri khắc vào đá tại " + country + ": " + prophecyText;
        if (typeof window.proph66Create === "function") {
          try { window.proph66Create({ text: prophecyText, year, location: country }); } catch(e) {}
        }
        break;
      case "divine_voice":
        var message = (opts && opts.message) ? opts.message : "Ta đang quan sát tất cả. Sống thiện lành, đừng gây chiến vô nghĩa.";
        result = "Thần Ngôn vang khắp thế giới: \"" + message + "\" — tất cả NPC đứng im trong 1 phút.";
        if (typeof window.divVoice66Send === "function") {
          try { window.divVoice66Send({ message, year }); } catch(e) {}
        }
        break;
      default:
        result = cmd.desc + " tại " + country;
    }

    const entry = { year, cmdId, label: cmd.label, icon: cmd.icon, country, result, cost: cmd.cost };
    window.xrGodV72Data.divineCommands.unshift(entry);
    if (window.xrGodV72Data.divineCommands.length > 30) window.xrGodV72Data.divineCommands.pop();
    window.xrGodV72Data.stats.totalCommands++;

    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year, type: "divine", title: cmd.icon + " " + cmd.label + " tại " + country, color: "#8b5cf6" });
    }
    if (typeof window.wmeAddMemory === "function") {
      window.wmeAddMemory({ year, category: "divine_xr", title: cmd.label, content: result });
    }

    godLog(cmd.icon + " " + cmd.label + " — " + result.substring(0, 80) + "...");
    save();
    return { success: true, label: cmd.label, result, entry };
  };

  window.xrg72LoadReplay = function(typeId, opts) {
    const rtype = REPLAY_TYPES.find(function(r) { return r.id === typeId; });
    if (!rtype) return null;

    var events = [];
    var fromYear = (opts && opts.fromYear) ? opts.fromYear : Math.max(0, (window.year || 0) - 500);
    var toYear = (opts && opts.toYear) ? opts.toYear : (window.year || 0);

    if (typeId === "wars") {
      var wars = window.warsActive;
      if (!Array.isArray(wars)) wars = wars ? Object.values(wars) : [];
      wars.forEach(function(w, i) {
        events.push({ year: (w.startYear || fromYear + i * 50), icon: "⚔️", title: "Chiến Tranh: " + (w.name || w.attacker + " vs " + w.defender), desc: "Cuộc chiến bùng nổ — " + (w.casualties || "hàng ngàn") + " thương vong", color: "#ef4444" });
      });
      var htEvents = (window.htData && window.htData.events) ? window.htData.events : [];
      htEvents.filter(function(e) { return e.type === "war"; }).slice(0, 10).forEach(function(e) {
        if (e.year >= fromYear && e.year <= toYear) events.push({ year: e.year, icon: "⚔️", title: e.title || "Chiến Tranh", desc: e.desc || "", color: "#ef4444" });
      });
    } else if (typeId === "empires") {
      var empData = window.empireData;
      var empArr = empData ? (Array.isArray(empData.empires) ? empData.empires : (empData.empires ? Object.values(empData.empires) : [])) : [];
      empArr.slice(0, 8).forEach(function(e, i) {
        events.push({ year: (e.founded || fromYear + i * 60), icon: "👑", title: "Đế Quốc " + (e.name || "Vô Danh") + " Hình Thành", desc: "Dân số: " + (e.population || "?") + " — Quyền lực: " + (e.power || "?"), color: "#f59e0b" });
      });
    } else if (typeId === "heroes") {
      var npcs = window.npcs;
      if (!Array.isArray(npcs)) npcs = npcs ? Object.values(npcs) : [];
      npcs.filter(function(n) { return n && n.name && (n.power > 70 || n.isHero); }).slice(0, 8).forEach(function(n, i) {
        events.push({ year: (n.birthYear || fromYear + i * 30), icon: "🦸", title: "Anh Hùng " + n.name + " Xuất Hiện", desc: "Nghề nghiệp: " + (n.career || "Chiến Binh") + " — Sức mạnh: " + (n.power || 50), color: "#3b82f6" });
      });
    } else if (typeId === "divine") {
      var mfLog = typeof window.mfst71GetLog === "function" ? window.mfst71GetLog() : [];
      mfLog.slice(0, 10).forEach(function(m) {
        events.push({ year: m.year || 0, icon: "✨", title: m.type + " — " + (m.location || "Thế Giới"), desc: m.result || m.narrative || "", color: "#8b5cf6" });
      });
      var appLog = typeof window.das71GetAppearanceLog === "function" ? window.das71GetAppearanceLog() : [];
      appLog.slice(0, 5).forEach(function(a) {
        events.push({ year: a.year || 0, icon: "🌟", title: "Creator Xuất Hiện Tại " + (a.location || "Thế Giới"), desc: a.narrative || "", color: "#8b5cf6" });
      });
    } else if (typeId === "disasters") {
      var disData = window.disasterData;
      if (disData) {
        var history = disData.history || disData.events || [];
        if (!Array.isArray(history)) history = Object.values(history);
        history.slice(0, 10).forEach(function(d) {
          events.push({ year: d.year || fromYear, icon: "🌋", title: (d.type || "Thiên Tai") + " tại " + (d.region || "?"), desc: d.desc || d.impact || "", color: "#f97316" });
        });
      }
    }

    events.sort(function(a, b) { return (a.year || 0) - (b.year || 0); });
    if (events.length === 0) {
      events.push({ year: fromYear, icon: rtype.icon, title: "Không có sự kiện " + rtype.label + " trong giai đoạn này", desc: "Thế giới tương đối yên bình trong giai đoạn " + fromYear + " — " + toYear, color: rtype.color });
    }

    const replay = { id: Date.now(), typeId, label: rtype.label, icon: rtype.icon, color: rtype.color, events, fromYear, toYear, loadedAt: window.year || 0 };
    window.xrGodV72Data.currentReplay = replay;
    window.xrGodV72Data.replayStep = 0;
    window.xrGodV72Data.replayPlaying = false;
    window.xrGodV72Data.historyReplays.push({ typeId, label: rtype.label, year: window.year || 0, eventCount: events.length });
    if (window.xrGodV72Data.historyReplays.length > 20) window.xrGodV72Data.historyReplays.shift();
    window.xrGodV72Data.stats.totalReplays++;

    godLog(rtype.icon + " Replay " + rtype.label + " — " + events.length + " sự kiện tải xong");
    save();
    return replay;
  };

  window.xrg72StepReplay = function() {
    const r = window.xrGodV72Data.currentReplay;
    if (!r || !r.events) return null;
    const step = window.xrGodV72Data.replayStep;
    if (step >= r.events.length) { window.xrGodV72Data.replayPlaying = false; return null; }
    window.xrGodV72Data.replayStep++;
    godLog(r.events[step].icon + " [" + r.events[step].year + "] " + r.events[step].title);
    save();
    return r.events[step];
  };

  window.xrg72ResetReplay = function() {
    window.xrGodV72Data.replayStep = 0;
    window.xrGodV72Data.replayPlaying = false;
    save();
  };

  window.xrg72GetCurrentReplay = function() { return window.xrGodV72Data.currentReplay; };
  window.xrg72GetReplayStep = function() { return window.xrGodV72Data.replayStep; };

  window.xrg72JarvisActivate = function(mode) {
    window.xrGodV72Data.jarvisXR.active = true;
    window.xrGodV72Data.jarvisXR.mode = mode || "companion";
    var msg = xrg72JarvisSpeak(mode || "companion");
    godLog("🤖 Jarvis XR [" + (mode || "companion") + "]: " + msg);
    save();
    return msg;
  };

  window.xrg72JarvisDeactivate = function() {
    window.xrGodV72Data.jarvisXR.active = false;
    godLog("🤖 Jarvis XR tạm biệt — Người có thể gọi tôi bất cứ lúc nào");
    save();
  };

  function xrg72JarvisSpeak(mode) {
    var lines = JARVIS_XR_LINES[mode] || JARVIS_XR_LINES.companion;
    var line = lines[Math.floor(Math.random() * lines.length)];
    window.xrGodV72Data.jarvisXR.lastMessage = line;
    window.xrGodV72Data.jarvisXR.messageQueue.unshift({ year: window.year || 0, mode, msg: line });
    if (window.xrGodV72Data.jarvisXR.messageQueue.length > 20) window.xrGodV72Data.jarvisXR.messageQueue.pop();
    window.xrGodV72Data.jarvisXR.totalMessages++;
    window.xrGodV72Data.stats.totalJarvisMessages++;
    return line;
  }

  window.xrg72JarvisSpeak = function(mode) {
    var msg = xrg72JarvisSpeak(mode || window.xrGodV72Data.jarvisXR.mode);
    save();
    return msg;
  };

  window.xrg72JarvisContextComment = function() {
    var view = (window.xrWorldV72Data && window.xrWorldV72Data.currentView) || "planet";
    var scale = (window.xrWorldV72Data && window.xrWorldV72Data.godScaleMode) || "god";
    var inWorld = window.xrPresenceV72Data && window.xrPresenceV72Data.enterWorldMode;
    var comments = [];
    if (inWorld) {
      var pos = window.xrPresenceV72Data.worldPosition.country;
      comments.push("Chúng ta đang ở " + (pos || "một thành phố") + " — tôi cảm nhận được năng lượng xung quanh.");
      comments.push("Có " + (window.xrPresenceV72Data.nearbyNpcs.length) + " NPC đang phản ứng với sự hiện diện của Người.");
    } else if (scale === "god") {
      comments.push("Từ độ cao này, Người có thể thấy toàn bộ " + view + " — hùng vĩ thật.");
      comments.push("Sa bàn thế giới trải ra trước mắt — mọi quốc gia, mọi chiến tranh đều rõ ràng.");
    } else {
      comments.push("Ở tỷ lệ người, thế giới trở nên thực hơn — nghe thấy tiếng chợ búa, ngửi thấy mùi của thành phố.");
    }
    if (typeof window.avg71GetJarvisComment === "function") {
      try { comments.push(window.avg71GetJarvisComment()); } catch(e) {}
    }
    var msg = comments[Math.floor(Math.random() * comments.length)];
    window.xrGodV72Data.jarvisXR.lastMessage = msg;
    window.xrGodV72Data.jarvisXR.totalMessages++;
    return msg;
  };

  window.xrg72GetData = function() { return window.xrGodV72Data; };
  window.xrg72GetCommandLog = function() { return window.xrGodV72Data.divineCommands; };
  window.xrg72GetStats = function() { return window.xrGodV72Data.stats; };
  window.xrg72GetJarvisQueue = function() { return window.xrGodV72Data.jarvisXR.messageQueue; };

  function init() {
    load();
    console.log("[XR God Interaction V72] ⚡ Khởi động — Hệ thống lệnh thần & lịch sử replay sẵn sàng");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 17600); });
  } else {
    setTimeout(init, 17600);
  }
})();
