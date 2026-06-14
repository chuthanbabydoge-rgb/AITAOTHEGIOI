(function() {
  "use strict";
  const SAVE_KEY = "cgv6_prophecy_v66";

  window.prophecyV66Data = {
    version: 66,
    prophecies: [],
    fulfilled: [],
    watching: [],   // Điều kiện đang theo dõi để ứng nghiệm
    totalCreated: 0,
    lastCheck: 0
  };

  // ════ V66 PROPHECY TYPES (richer than V51) ════
  const PROPHECY_TYPES_V66 = [
    {
      id:"war",         icon:"⚔️",  label:"Tiên Tri Chiến Tranh",  color:"#ef4444",
      templates:[
        "Máu sẽ nhuộm đỏ đất đai {subject} — một cuộc chiến không thể tránh khỏi đang đến gần.",
        "Ba vương quốc sẽ sụp đổ trước khi {subject} đứng trên đống tro tàn.",
        "Kẻ chinh phục vĩ đại nhất lịch sử sẽ xuất hiện từ {subject}.",
        "Một cuộc chiến ngàn năm kết thúc khi {subject} đặt kiếm xuống."
      ]
    },
    {
      id:"hero",        icon:"⚡",  label:"Tiên Tri Anh Hùng",     color:"#fbbf24",
      templates:[
        "{subject} sẽ sinh ra một anh hùng có thể thay đổi vận mệnh thế giới.",
        "Từ trong đau khổ của {subject}, một ngôi sao sáng sẽ vươn lên.",
        "Người được chọn xuất hiện từ {subject} — họ không biết số phận vĩ đại của mình.",
        "Khi bóng tối nhấn chìm thế giới, {subject} sẽ thắp lên ánh sáng cuối cùng."
      ]
    },
    {
      id:"apocalypse",  icon:"🌑",  label:"Tiên Tri Tận Thế",      color:"#7c3aed",
      templates:[
        "Bảy dấu hiệu sẽ xuất hiện — {subject} là dấu hiệu đầu tiên. Tận thế đang đến.",
        "Khi {subject} biến mất, ánh sáng cuối cùng cũng tắt — màn đêm vĩnh cửu.",
        "Chỉ {subject} mới có thể ngăn chặn sự sụp đổ của vũ trụ.",
        "Ngày phán xét đến khi {subject} phá vỡ lời thề ngàn năm."
      ]
    },
    {
      id:"era",         icon:"🌅",  label:"Tiên Tri Kỷ Nguyên",    color:"#60a5fa",
      templates:[
        "Một kỷ nguyên hoàng kim sẽ đến khi {subject} đạt đỉnh vinh quang.",
        "Bóng tối bao phủ khi {subject} ngã xuống — rồi ánh sáng mới bình minh.",
        "Từ tro tàn của {subject}, một nền văn minh mới vươn lên ngàn lần rực rỡ hơn.",
        "Kỷ nguyên hỗn loạn kết thúc khi {subject} đứng trên đỉnh thế giới."
      ]
    },
    {
      id:"destiny",     icon:"🔮",  label:"Tiên Tri Số Phận",      color:"#c084fc",
      templates:[
        "Số phận của {subject} đã được khắc vào thiên thư từ thuở khai thiên.",
        "{subject} sẽ phải đối mặt với một lựa chọn — quyết định tương lai của toàn thế giới.",
        "Một bí ẩn đời đời sẽ được giải đáp khi {subject} tìm thấy sự thật.",
        "Dù cố chạy trốn, {subject} không thể thoát khỏi định mệnh đã được vạch sẵn."
      ]
    }
  ];
  window.proph66GetTypes = function() { return PROPHECY_TYPES_V66; };

  // ════ CREATE PROPHECY ════
  window.proph66Create = function(typeId, subjectName, customText) {
    const year = window.year || 0;
    const pType = PROPHECY_TYPES_V66.find(t => t.id === typeId);
    if (!pType) return { ok: false, msg: "Loại tiên tri không hợp lệ." };

    // Resolve subject
    let subject = subjectName;
    if (!subject) {
      const npcs = window.npcs || [];
      const countries = window.countries || [];
      const possible = [
        ...npcs.filter(n => n.status === "alive").map(n => n.name),
        ...countries.map(c => c.name)
      ];
      subject = possible[Math.floor(Math.random() * possible.length)] || "Thế Giới";
    }

    // Generate text
    let propText = customText;
    if (!propText && pType.templates.length > 0) {
      const tmpl = pType.templates[Math.floor(Math.random() * pType.templates.length)];
      propText = tmpl.replace(/{subject}/g, subject);
    }

    const entry = {
      id: Date.now(),
      typeId, typeName: pType.label, icon: pType.icon, color: pType.color,
      subject, text: propText,
      year, fulfilled: false, fulfilledYear: null,
      watchCondition: `${typeId}:${subject}`,
      importance: 4
    };

    window.prophecyV66Data.prophecies.push(entry);
    window.prophecyV66Data.totalCreated++;

    // Add fulfillment watch
    window.prophecyV66Data.watching.push({
      prophecyId: entry.id, typeId, subject,
      triggerAfter: year + 50 + Math.floor(Math.random() * 200)
    });

    // Also trigger V51 if available
    if (typeof window.cgv51CreateProphecy === "function") {
      window.cgv51CreateProphecy(typeId, subject, propText);
    }

    // Divine voice propagate
    if (typeof window.divVoice66Prophesy === "function") {
      window.divVoice66Prophesy(subject, propText, typeId);
    }

    // Record in all systems
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year, type: "divine", title: `${pType.icon} Thiên Khải: ${subject}`, color: pType.color });
    }
    if (typeof window.wmeAddMemory === "function") {
      window.wmeAddMemory({ year, category: "divine", title: `${pType.icon} ${pType.label}`, content: propText });
    }
    if (typeof window.creatorLeg66Record === "function") {
      window.creatorLeg66Record("prophecy", `${pType.label} — ${subject}`, subject, propText, 4);
    }

    save();
    return { ok: true, msg: `🔮 Thiên Khải được ban bố! "${propText.substring(0,60)}..."`, entry };
  };

  // ════ AUTO-FULFILL PROPHECIES ════
  function checkFulfillment() {
    const year = window.year || 0;
    const d = window.prophecyV66Data;

    d.watching.forEach(watch => {
      if (watch._fulfilled) return;
      if (year < watch.triggerAfter) return;

      const prophecy = d.prophecies.find(p => p.id === watch.prophecyId);
      if (!prophecy || prophecy.fulfilled) return;

      // Check natural fulfillment conditions
      let fulfilled = false;
      let fulfillmentDesc = "";

      if (watch.typeId === "war" && window.warsActive && window.warsActive.length > 0) {
        const relevantWar = window.warsActive.find(w => w.attacker === watch.subject || w.defender === watch.subject);
        if (relevantWar) { fulfilled = true; fulfillmentDesc = `Chiến tranh bùng nổ với ${watch.subject}.`; }
      }

      if (watch.typeId === "hero") {
        const npcs = window.npcs || [];
        const hero = npcs.find(n => n.country === watch.subject && n.status === "alive" && (n.level||0) > 8);
        if (hero) { fulfilled = true; fulfillmentDesc = `${hero.name} trở thành anh hùng từ ${watch.subject}.`; }
      }

      if (watch.typeId === "era") {
        if (year > watch.triggerAfter + 100) { fulfilled = true; fulfillmentDesc = `Kỷ nguyên mới bắt đầu tại ${watch.subject}.`; }
      }

      // Time-based auto fulfill (all)
      if (!fulfilled && year > watch.triggerAfter + 300) {
        fulfilled = true;
        fulfillmentDesc = `Tiên tri ứng nghiệm sau ${year - prophecy.year} năm.`;
      }

      if (fulfilled) {
        watch._fulfilled = true;
        prophecy.fulfilled = true;
        prophecy.fulfilledYear = year;
        d.fulfilled.push({ ...prophecy, fulfillmentDesc });

        if (typeof window.htAddEvent === "function") {
          window.htAddEvent({ year, type: "divine", title: `✅ Ứng Nghiệm: ${prophecy.text.substring(0,40)}...`, color: prophecy.color });
        }
        if (typeof window.mem64Record === "function") {
          window.mem64Record("divine", `✅ Tiên Tri Ứng Nghiệm`, `${prophecy.text} — ${fulfillmentDesc}`, 5, ["prophecy_fulfilled"]);
        }

        // NPCs remember fulfillment
        (window.npcs||[]).filter(n=>n.status==="alive").slice(0,10).forEach(npc => {
          if (typeof window.npcMem64AddMemory === "function") {
            window.npcMem64AddMemory(npc.id||npc.name, "social", "Tiên Tri Ứng Nghiệm", `Lời tiên tri của Đấng Sáng Thế về "${watch.subject}" đã ứng nghiệm! ${fulfillmentDesc}`, 5);
          }
        });
      }
    });
  }

  window.proph66GetActive = function() { return window.prophecyV66Data.prophecies.filter(p => !p.fulfilled); };
  window.proph66GetFulfilled = function() { return window.prophecyV66Data.fulfilled.slice(-20).reverse(); };
  window.proph66GetAll = function(limit) { return window.prophecyV66Data.prophecies.slice(-(limit||30)).reverse(); };
  window.proph66GetStats = function() {
    const d = window.prophecyV66Data;
    const v51Active = typeof window.cgv51GetActiveProphecies === "function" ? window.cgv51GetActiveProphecies().length : 0;
    return {
      v66Total: d.totalCreated,
      v66Active: d.prophecies.filter(p => !p.fulfilled).length,
      v66Fulfilled: d.fulfilled.length,
      v51Active, combinedTotal: d.totalCreated + v51Active
    };
  };

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ ...window.prophecyV66Data, prophecies: window.prophecyV66Data.prophecies.slice(-50), fulfilled: window.prophecyV66Data.fulfilled.slice(-30) }));
    } catch(e) {}
  }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) window.prophecyV66Data = { ...window.prophecyV66Data, ...JSON.parse(raw) };
    } catch(e) {}
  }

  function tick() {
    const year = window.year || 0;
    const d = window.prophecyV66Data;
    if (year - d.lastCheck < 30) return;
    d.lastCheck = year;
    checkFulfillment();
    if (year % 100 === 0) save();
  }

  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); tick(); };
    console.log("[ProphecyEngineV66] 🔮 Tiên Tri V66 khởi động — 5 loại thiên khải + auto-fulfill tracking.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 14300); });
  } else {
    setTimeout(init, 14300);
  }
})();
