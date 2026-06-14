(function() {
  "use strict";
  const SAVE_KEY = "cgv6_divine_voice_v66";

  window.divineVoiceV66Data = {
    version: 66,
    messages: [],       // Lời nhắn gửi NPC/quốc gia
    prophecies: [],     // Lời tiên tri của Đấng
    laws: [],           // Luật thiêng
    totalMessages: 0,
    totalLaws: 0
  };

  // ════ DIVINE MESSAGE ════
  window.divVoice66Send = function(target, targetType, message, messageType) {
    const year = window.year || 0;
    const types = { command:"🔊", blessing:"✨", warning:"⚠️", love:"💙", wrath:"⚡" };
    const icon = types[messageType] || "📣";

    const entry = {
      target, targetType: targetType || "npc",
      message, messageType: messageType || "command",
      icon, year,
      id: Date.now()
    };
    window.divineVoiceV66Data.messages.push(entry);
    window.divineVoiceV66Data.totalMessages++;

    // Target NPC receives message
    const npcs = window.npcs || [];
    const targetNpcs = targetType === "world"
      ? npcs.filter(n => n.status === "alive").slice(0, 30)
      : targetType === "nation"
        ? npcs.filter(n => n.country === target && n.status === "alive")
        : npcs.filter(n => n.name === target);

    targetNpcs.forEach(npc => {
      const id = npc.id || npc.name;
      if (typeof window.npcMem64AddMemory === "function") {
        window.npcMem64AddMemory(id, "social", `${icon} Lời Thần Linh`, `"${message}" — Đấng Sáng Thế phán với ${npc.name} năm ${year}.`, 5);
      }
      if (typeof window.npcLife65RecordLifeEvent === "function") {
        window.npcLife65RecordLifeEvent(id, `Nghe Tiếng Thần`, `"${message.substring(0,80)}..." — Đấng Sáng Thế phán với ta. Đây là khoảnh khắc thiêng liêng nhất cuộc đời.`, 5);
      }
      if (messageType === "blessing" && typeof window.npcLife65SetEmotion === "function") {
        window.npcLife65SetEmotion(id, "hopeful", 95);
      }
      if (messageType === "wrath" && typeof window.npcLife65SetEmotion === "function") {
        window.npcLife65SetEmotion(id, "fearful", 90);
      }
    });

    // Record in all systems
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year, type: "divine", title: `${icon} Lời Thần: "${message.substring(0,40)}..."`, color: "#c084fc" });
    }
    if (typeof window.creatorLeg66Record === "function") {
      window.creatorLeg66Record("divine_message", `Thần Ngôn Đến ${target}`, target, message, 4);
    }

    save();
    return { ok: true, msg: `${icon} Lời thần linh đã được gửi đến ${target}! ${targetNpcs.length} sinh linh cảm nhận được.`, entry };
  };

  // ════ DIVINE LAW ════
  window.divVoice66Declarelaw = function(lawTitle, lawText, scope) {
    const year = window.year || 0;
    const lawEntry = {
      title: lawTitle,
      text: lawText,
      scope: scope || "world",  // "world" / "nation" / "sect"
      year, active: true,
      id: Date.now()
    };
    window.divineVoiceV66Data.laws.push(lawEntry);
    window.divineVoiceV66Data.totalLaws++;

    // Record in world memory
    if (typeof window.wmeAddMemory === "function") {
      window.wmeAddMemory({ year, category: "divine", title: `📜 Luật Thiêng: ${lawTitle}`, content: lawText });
    }
    if (typeof window.mem64Record === "function") {
      window.mem64Record("divine", `📜 Luật Thiêng: ${lawTitle}`, lawText, 5, ["divine_law"]);
    }
    if (typeof window.creatorLeg66Record === "function") {
      window.creatorLeg66Record("divine_law", lawTitle, scope||"Thế Giới", lawText, 5);
    }

    save();
    return { ok: true, msg: `📜 Luật Thiêng "${lawTitle}" đã được ban hành cho ${scope||'toàn thế giới'}!`, entry: lawEntry };
  };

  // ════ DIVINE PROPHECY (extends V51) ════
  window.divVoice66Prophesy = function(subject, prophetText, propType) {
    const year = window.year || 0;
    const typeColors = { war:"#ef4444", hero:"#22c55e", apocalypse:"#7c3aed", era:"#fbbf24", personal:"#60a5fa" };
    const entry = {
      subject, prophetText, propType: propType || "era",
      year, fulfilled: false,
      color: typeColors[propType] || "#94a3b8",
      id: Date.now()
    };
    window.divineVoiceV66Data.prophecies.push(entry);

    // Also trigger V51 prophecy if available
    if (typeof window.cgv51CreateProphecy === "function" && propType !== "personal") {
      window.cgv51CreateProphecy(propType || "era", subject, prophetText);
    }

    // Record
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year, type: "divine", title: `🔮 Thiên Khải: ${subject}`, color: "#c084fc" });
    }
    if (typeof window.wmeAddMemory === "function") {
      window.wmeAddMemory({ year, category: "divine", title: `🔮 Thiên Khải`, content: prophetText });
    }
    if (typeof window.creatorLeg66Record === "function") {
      window.creatorLeg66Record("prophecy", `Thiên Khải Về ${subject}`, subject, prophetText, 4);
    }

    // NPCs feel the prophecy
    (window.npcs || []).filter(n => n.status === "alive").slice(0, 15).forEach(npc => {
      const id = npc.id || npc.name;
      if (typeof window.npcMem64AddMemory === "function") {
        window.npcMem64AddMemory(id, "social", "Nghe Tiên Tri Thần Linh", `"${prophetText.substring(0,80)}..." — Lời tiên tri của Đấng Sáng Thế vang vọng khắp thế gian.`, 4);
      }
    });

    save();
    return { ok: true, msg: `🔮 Thiên Khải về "${subject}" đã được ban bố! NPC khắp thế giới cảm nhận được.`, entry };
  };

  // ════ PUBLIC GETTERS ════
  window.divVoice66GetMessages = function(limit) {
    return window.divineVoiceV66Data.messages.slice(-(limit||20)).reverse();
  };
  window.divVoice66GetLaws = function() {
    return window.divineVoiceV66Data.laws.filter(l => l.active);
  };
  window.divVoice66GetProphecies = function(limit) {
    return window.divineVoiceV66Data.prophecies.slice(-(limit||20)).reverse();
  };
  window.divVoice66GetStats = function() {
    const d = window.divineVoiceV66Data;
    return {
      messages: d.totalMessages,
      laws: d.totalLaws,
      prophecies: d.prophecies.length
    };
  };

  // ════ MESSAGE TEMPLATES ════
  window.divVoice66GetTemplates = function() {
    return {
      command: [
        "Ngươi phải dẫn dắt dân tộc đến đất hứa.",
        "Hãy xây dựng đền thờ vinh danh ta tại đây.",
        "Đặt kiếm xuống — đây không phải lúc chiến đấu.",
        "Hãy tìm kiếm tri thức — đó là con đường ta chọn cho ngươi."
      ],
      blessing: [
        "Ta chúc phước cho ngươi và dòng dõi ngươi đến ngàn đời.",
        "Ánh sáng thần linh sẽ luôn dẫn đường cho ngươi.",
        "Ngươi được chọn — số phận đã an bài từ thuở khai thiên lập địa."
      ],
      warning: [
        "Hãy cẩn thận — bóng tối đang rình rập ngay phía sau.",
        "Đừng tin kẻ đứng bên phải ngươi trong trận chiến tới.",
        "Gia tộc ngươi sẽ diệt vong nếu không thay đổi con đường đang đi."
      ],
      love: [
        "Ta yêu tạo vật của ta — mỗi sinh linh đều mang một phần tâm hồn ta.",
        "Dù thế giới đã trải qua muôn vàn biến cố, ta vẫn luôn ở đây.",
        "Nhìn lên bầu trời đêm — mỗi ngôi sao là một lời hứa của ta."
      ]
    };
  };

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        ...window.divineVoiceV66Data,
        messages: window.divineVoiceV66Data.messages.slice(-100),
        prophecies: window.divineVoiceV66Data.prophecies.slice(-50)
      }));
    } catch(e) {}
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) window.divineVoiceV66Data = { ...window.divineVoiceV66Data, ...JSON.parse(raw) };
    } catch(e) {}
  }

  function init() {
    load();
    console.log("[DivineVoiceV66] 📣 Thần Ngôn V66 khởi động — Đấng Sáng Thế có thể phán, ban luật, và tiên tri.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 14100); });
  } else {
    setTimeout(init, 14100);
  }
})();
