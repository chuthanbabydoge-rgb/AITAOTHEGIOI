(function() {
  "use strict";
  var SAVE_KEY = "cgv6_ancient_prophecy_v77";

  var PROPHECY_TYPES = [
    { id: "doom",      label: "Diệt Vong",         icon: "💀", color: "#e74c3c", urgency: 10 },
    { id: "glory",     label: "Vinh Quang",         icon: "✨", color: "#f1c40f", urgency: 4  },
    { id: "war",       label: "Đại Chiến",          icon: "⚔️",  color: "#e67e22", urgency: 8  },
    { id: "hero",      label: "Anh Hùng Xuất Thế",  icon: "🦸", color: "#3498db", urgency: 5  },
    { id: "rebirth",   label: "Thần Thoại Tái Sinh", icon: "🌅", color: "#9b59b6", urgency: 6  },
    { id: "plague",    label: "Đại Dịch Thiên Sai",  icon: "🦠", color: "#1abc9c", urgency: 9  },
    { id: "age",       label: "Kỷ Nguyên Mới",       icon: "🌀", color: "#2ecc71", urgency: 7  },
    { id: "mystery",   label: "Bí Ẩn Vũ Trụ",        icon: "🔮", color: "#8e44ad", urgency: 3  }
  ];

  var PROPHECY_TEMPLATES = {
    doom: [
      "Khi {subject} đạt đỉnh vinh quang, bóng tối sẽ nuốt chửng tất cả.",
      "Một nghìn năm nữa, {subject} sẽ biến mất khỏi ký ức thế giới.",
      "Lửa từ thiên thượng sẽ thiêu rụi {subject} — không còn dấu vết.",
      "Ngày {subject} sụp đổ là ngày bầu trời trở thành tro bụi."
    ],
    glory: [
      "{subject} sẽ trỗi dậy từ đống tro tàn, chói lọi hơn ngàn mặt trời.",
      "Thời đại hoàng kim của {subject} sắp đến — muôn dân quy phục.",
      "Tên {subject} sẽ được khắc vào đá thiên hà muôn đời.",
      "Từ khói bụi chiến tranh, {subject} sẽ sinh ra như thần thánh."
    ],
    war: [
      "Máu sẽ chảy dài khi {subject} và kẻ thù đại chiến dưới bầu trời đỏ.",
      "Đại chiến đến — {subject} đứng giữa ngàn mũi kiếm nhọn.",
      "Không ai sống sót khi {subject} giáp trận với định mệnh.",
      "Chiến tranh sinh ra từ {subject} — cả vũ trụ run rẩy."
    ],
    hero: [
      "Một linh hồn vĩ đại sẽ sinh ra từ {subject}, thay đổi vận mệnh thế giới.",
      "Anh hùng của {subject} chưa ra đời — nhưng bầu trời đã biết tên người.",
      "Từ dòng máu {subject}, một vị thần sẽ bước ra ánh sáng.",
      "Chỉ người con của {subject} mới giải được lời nguyền cổ đại."
    ],
    rebirth: [
      "Những gì {subject} đã mất sẽ được tái sinh — đẹp hơn, mạnh hơn.",
      "Cái chết của {subject} là khởi đầu của một kỷ nguyên bất tử.",
      "Linh hồn cổ đại ngủ trong {subject} sẽ thức dậy khi trăng máu xuất hiện.",
      "{subject} sẽ chết và sống lại — ba lần, mỗi lần mạnh hơn."
    ],
    plague: [
      "Bệnh dịch sinh từ bóng tối sẽ thử thách {subject} đến tận cùng.",
      "Khi ngàn người của {subject} ngã xuống, một người sẽ tìm ra con đường.",
      "Dịch bệnh không phải là kết thúc — mà là lửa luyện vàng cho {subject}.",
      "Từ cơn đại dịch, {subject} sẽ nổi lên như vị thần y thuật."
    ],
    age: [
      "Kỷ nguyên mới bắt đầu — {subject} đứng ở ngưỡng cửa lịch sử.",
      "Khi ngôi sao xanh mọc ở phương đông, {subject} bước vào thời đại vàng.",
      "Thế giới già đi — {subject} là mầm non của kỷ nguyên mới.",
      "Chu kỳ ngàn năm kết thúc. {subject} là người đầu tiên của thời đại mới."
    ],
    mystery: [
      "Bí mật ngàn năm ẩn trong {subject} — ai tìm thấy sẽ hiểu tất cả.",
      "Ngay cả thần thánh cũng không giải thích được số phận của {subject}.",
      "{subject} mang trong mình câu trả lời cho câu hỏi vũ trụ chưa ai đặt ra.",
      "Phía sau {subject} là một sự thật mà thế giới chưa sẵn sàng đối mặt."
    ]
  };

  window.ancientProphecyV77Data = {
    prophecies: [],
    totalGenerated: 0,
    fulfillmentCount: 0,
    lastGenYear: 0,
    genCooldown: 0
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.ancientProphecyV77Data)); } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.ancientProphecyV77Data = JSON.parse(d);
    } catch(e) {}
  }

  function getSubject() {
    var subjects = [];
    if (window.countries && window.countries.length > 0) {
      var cn = window.countries[Math.floor(Math.random() * Math.min(window.countries.length, 10))];
      if (cn && cn.name) subjects.push(cn.name);
    }
    if (window.npcs && window.npcs.length > 0) {
      var npc = window.npcs[Math.floor(Math.random() * Math.min(window.npcs.length, 20))];
      if (npc && npc.name) subjects.push(npc.name);
    }
    var worldName = (window.world && window.world.name) ? window.world.name : null;
    if (worldName) subjects.push(worldName);
    if (subjects.length === 0) subjects.push("Vô Danh");
    return subjects[Math.floor(Math.random() * subjects.length)];
  }

  function buildProphecyText(type, subject) {
    var templates = PROPHECY_TEMPLATES[type] || PROPHECY_TEMPLATES.mystery;
    var tmpl = templates[Math.floor(Math.random() * templates.length)];
    return tmpl.replace(/\{subject\}/g, subject);
  }

  window.ap77GenerateProphecy = function(forceType) {
    var data = window.ancientProphecyV77Data;
    if (data.prophecies.length >= 25) {
      var oldest = data.prophecies.findIndex(function(p) { return p.fulfilled; });
      if (oldest !== -1) data.prophecies.splice(oldest, 1);
      else data.prophecies.shift();
    }
    var type = forceType || PROPHECY_TYPES[Math.floor(Math.random() * PROPHECY_TYPES.length)].id;
    var typeDef = PROPHECY_TYPES.find(function(t) { return t.id === type; }) || PROPHECY_TYPES[0];
    var subject = getSubject();
    var year = (window.year || 1);
    var fulfillIn = 50 + Math.floor(Math.random() * 200);
    var prophecy = {
      id: "proph_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      type: type,
      label: typeDef.label,
      icon: typeDef.icon,
      color: typeDef.color,
      urgency: typeDef.urgency,
      subject: subject,
      text: buildProphecyText(type, subject),
      birthYear: year,
      fulfillYear: year + fulfillIn,
      fulfilled: false,
      fulfillDesc: null
    };
    data.prophecies.push(prophecy);
    data.totalGenerated++;
    data.lastGenYear = year;
    data.genCooldown = 30 + Math.floor(Math.random() * 50);
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: year, type: "prophecy", title: typeDef.icon + " Tiên Tri: " + prophecy.text.substring(0, 60) + "...", color: typeDef.color });
    }
    if (typeof window.wmeAddMemory === "function") {
      window.wmeAddMemory({ year: year, category: "prophecy", title: "Tiên Tri Cổ Đại V77", content: prophecy.text });
    }
    save();
    return prophecy;
  };

  window.ap77FulfillProphecy = function(prophecyId, desc) {
    var data = window.ancientProphecyV77Data;
    var p = data.prophecies.find(function(x) { return x.id === prophecyId; });
    if (!p || p.fulfilled) return false;
    p.fulfilled = true;
    p.fulfillDesc = desc || ("Tiên tri về " + p.subject + " đã ứng nghiệm.");
    p.actualFulfillYear = window.year || p.fulfillYear;
    data.fulfillmentCount++;
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: p.actualFulfillYear, type: "prophecy_fulfill", title: "✅ Tiên Tri Ứng Nghiệm: " + p.text.substring(0, 50), color: p.color });
    }
    save();
    return true;
  };

  window.ap77GetAll = function() { return window.ancientProphecyV77Data.prophecies.slice(); };
  window.ap77GetActive = function() { return window.ancientProphecyV77Data.prophecies.filter(function(p) { return !p.fulfilled; }); };
  window.ap77GetFulfilled = function() { return window.ancientProphecyV77Data.prophecies.filter(function(p) { return p.fulfilled; }); };
  window.ap77GetUrgent = function() {
    return window.ancientProphecyV77Data.prophecies
      .filter(function(p) { return !p.fulfilled && p.urgency >= 7; })
      .sort(function(a, b) { return b.urgency - a.urgency; });
  };
  window.ap77GetStats = function() {
    var d = window.ancientProphecyV77Data;
    return {
      total: d.prophecies.length,
      active: d.prophecies.filter(function(p) { return !p.fulfilled; }).length,
      fulfilled: d.fulfillmentCount,
      totalGenerated: d.totalGenerated,
      urgent: window.ap77GetUrgent().length,
      byType: PROPHECY_TYPES.map(function(t) {
        return { type: t.id, label: t.label, icon: t.icon, count: d.prophecies.filter(function(p) { return p.type === t.id; }).length };
      })
    };
  };
  window.AP77_PROPHECY_TYPES = PROPHECY_TYPES;

  function ap77AutoCheck() {
    var data = window.ancientProphecyV77Data;
    var year = window.year || 1;
    if (data.genCooldown > 0) { data.genCooldown--; return; }
    if (data.prophecies.filter(function(p){return !p.fulfilled;}).length < 5) {
      window.ap77GenerateProphecy();
    }
    data.prophecies.forEach(function(p) {
      if (!p.fulfilled && year >= p.fulfillYear) {
        window.ap77FulfillProphecy(p.id, "Vận mệnh đã ứng nghiệm sau " + (year - p.birthYear) + " năm.");
      }
    });
  }

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      ap77AutoCheck();
    };
    if (window.ancientProphecyV77Data.prophecies.length === 0) {
      for (var i = 0; i < 3; i++) {
        var types = ["doom","glory","war","hero","rebirth","plague","age","mystery"];
        window.ap77GenerateProphecy(types[i]);
      }
    }
    console.log("[AncientProphecyV77] 📜 Tiên Tri Cổ Đại khởi động — " + window.ancientProphecyV77Data.prophecies.length + " tiên tri · 8 loại · Auto-generate sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 19300); });
  } else {
    setTimeout(init, 19300);
  }
})();
