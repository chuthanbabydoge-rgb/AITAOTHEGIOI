(function() {
  "use strict";
  const SAVE_KEY = "cgv6_legend_v47";

  // ============================================================
  // LEGEND ENGINE V47 — Sử Thi · Truyền Thuyết · Huyền Thoại Dân Gian
  // ============================================================

  const EPIC_TEMPLATES = [
    { type: "battle_epic", icon: "⚔️", template: "{hero} đã một mình chiến đấu với {count} kẻ địch trong trận {battle}, lưu danh muôn đời." },
    { type: "founder_epic", icon: "🏛️", template: "{hero} từ một thư sinh tay không, gây dựng nên đế quốc {nation} hùng mạnh nhất thiên hạ." },
    { type: "sacrifice_epic", icon: "✨", template: "{hero} hy sinh bản thân để cứu {nation}, linh hồn hóa thành ngôi sao sáng trên bầu trời." },
    { type: "villain_epic", icon: "💀", template: "{hero} - Ma Vương thống trị — đã gieo rắc kinh hoàng khắp thiên hạ trong {years} năm trước khi bị diệt." },
    { type: "ascension_epic", icon: "🌟", template: "{hero} đã vượt qua 99 cửa ải của thiên đạo, cuối cùng phi thăng thành cõi thần." },
    { type: "prophet_epic", icon: "🔮", template: "{hero} — Nhà Tiên Tri vĩ đại — đã tiên đoán chính xác {count} đại sự của thiên hạ." },
    { type: "conqueror_epic", icon: "🌌", template: "{hero} chinh phục {count} vũ trụ song song, trở thành Bá Chủ Đa Vũ Trụ vô địch." },
    { type: "saint_epic", icon: "☀️", template: "{hero} — Thánh Nhân — dành cả đời độ hóa chúng sinh, được thần linh phong thánh sau khi qua đời." },
  ];

  const FOLKLORE_TEMPLATES = [
    { type: "local_tale", icon: "📖", template: "Người ta kể rằng {hero} đã từng một đêm chém 1000 yêu quái để bảo vệ làng {location}." },
    { type: "love_legend", icon: "💕", template: "Tình yêu của {hero} và người thương đã lay động đến tận Thiên Đình, được lưu truyền mãi mãi." },
    { type: "wisdom_tale", icon: "📚", template: "Câu nói của {hero}: '{quote}' đã trở thành kim chỉ nam cho bao thế hệ tu sĩ sau." },
    { type: "curse_legend", icon: "🌑", template: "{hero} đã gieo lời nguyền lên dòng họ {family} — hậu duệ mang nghiệp nặng ngàn năm." },
    { type: "miracle_tale", icon: "✨", template: "Tương truyền {hero} đã hồi sinh sau 3 ngày chết, thân mình tỏa hào quang ngũ sắc." },
    { type: "treasure_legend", icon: "💎", template: "Kho báu của {hero} được chôn giấu bí mật — kẻ tìm được sẽ kế thừa toàn bộ sức mạnh." },
  ];

  const PROPHECY_TEMPLATES = [
    "Khi {hero} tái sinh, thiên hạ sẽ bước vào kỷ nguyên mới.",
    "Dòng dõi {hero} sẽ sinh ra người thống nhất tam giới trong {years} năm tới.",
    "Vũ khí của {hero} đang chờ đợi vị anh hùng xứng đáng kế thừa.",
    "Bóng ma {hero} sẽ hiện về khi thiên hạ lâm nguy cực độ.",
    "Kẻ mang ấn của {hero} sẽ trở thành thiên tử đời sau.",
  ];

  const WISDOM_QUOTES = [
    "Sức mạnh không phải của thân xác mà của ý chí.",
    "Kẻ sợ cái chết chưa hiểu ý nghĩa của sự sống.",
    "Đường tu tiên là đường cô độc — chỉ kẻ mạnh mới đi đến cuối.",
    "Thiên đạo vô tình, nhưng lòng người vẫn có tình.",
    "Một kiếm chém thiên hạ, một lòng độ thương sinh.",
    "Mạnh không phải để chinh phục — mà để bảo vệ.",
  ];

  function defaultData() {
    return {
      epics: [],           // Sử thi vĩ đại
      folklore: [],        // Truyền thuyết dân gian
      prophecies: [],      // Lời tiên tri
      chronicles: [],      // Biên niên sử anh hùng
      totalGenerated: 0,
      lastTick: 0,
    };
  }

  window.legendV47Data = window.legendV47Data || defaultData();

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.legendV47Data)); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.legendV47Data = Object.assign(defaultData(), JSON.parse(d));
    } catch(e) { window.legendV47Data = defaultData(); }
  }

  // ============================================================
  // GENERATE EPIC from hero
  // ============================================================
  function generateEpic(hero, type) {
    const d = window.legendV47Data;
    const template = EPIC_TEMPLATES.find(t => t.type === type) ||
      EPIC_TEMPLATES[Math.floor(Math.random() * EPIC_TEMPLATES.length)];

    const nation = (window.countries || []).find(c => c.founderId === hero.id);
    const universeCount = (window.mvData && window.mvData.universes) ? window.mvData.universes.length : 1;
    const years = (window.year || 1) - (hero.birthYear || 1);

    let text = template.template
      .replace("{hero}", hero.name)
      .replace("{nation}", nation ? nation.name : "đế quốc hùng mạnh")
      .replace("{count}", Math.floor(Math.random() * 900 + 100))
      .replace("{battle}", "Đại Chiến Thiên Địa")
      .replace("{years}", Math.max(1, years))
      .replace("{location}", hero.country || hero.region || "vùng đất thiêng")
      .replace("{family}", hero.family || "vô danh")
      .replace("{quote}", WISDOM_QUOTES[Math.floor(Math.random() * WISDOM_QUOTES.length)]);

    const epic = {
      id: "epic_" + Date.now() + "_" + Math.random().toString(36).slice(2),
      heroId: hero.id,
      heroName: hero.name,
      type: template.type,
      icon: template.icon,
      title: `${template.icon} Sử Thi: ${hero.name}`,
      content: text,
      year: window.year || 1,
      legendScore: hero.legendScore || 0,
    };
    d.epics.unshift(epic);
    if (d.epics.length > 200) d.epics.pop();
    d.totalGenerated++;

    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: window.year || 1, type: "legend", title: epic.title, color: "#f59e0b" });
    }
    if (typeof window.wmeAddMemory === "function") {
      window.wmeAddMemory({ year: window.year || 1, category: "Huyền Thoại", title: epic.title, content: text });
    }
    if (typeof window.waeAddAlert === "function") {
      window.waeAddAlert({ type: "legend", msg: `📖 Sử thi mới: ${epic.title}` });
    }
    save();
    return epic;
  }

  // ============================================================
  // GENERATE FOLKLORE
  // ============================================================
  function generateFolklore(hero) {
    const d = window.legendV47Data;
    const template = FOLKLORE_TEMPLATES[Math.floor(Math.random() * FOLKLORE_TEMPLATES.length)];
    let text = template.template
      .replace("{hero}", hero.name)
      .replace("{location}", hero.country || hero.region || "vùng đất xa xôi")
      .replace("{family}", hero.family || "vô danh")
      .replace("{quote}", WISDOM_QUOTES[Math.floor(Math.random() * WISDOM_QUOTES.length)]);

    const folklore = {
      id: "folk_" + Date.now() + "_" + Math.random().toString(36).slice(2),
      heroId: hero.id,
      heroName: hero.name,
      type: template.type,
      icon: template.icon,
      title: `${template.icon} Truyền Thuyết: ${hero.name}`,
      content: text,
      year: window.year || 1,
      region: hero.country || hero.region || "Không Rõ",
    };
    d.folklore.unshift(folklore);
    if (d.folklore.length > 300) d.folklore.pop();
    d.totalGenerated++;
    save();
    return folklore;
  }

  // ============================================================
  // GENERATE PROPHECY
  // ============================================================
  function generateProphecy(hero) {
    const d = window.legendV47Data;
    const tmpl = PROPHECY_TEMPLATES[Math.floor(Math.random() * PROPHECY_TEMPLATES.length)];
    const futureYear = (window.year || 1) + Math.floor(Math.random() * 500 + 100);
    const text = tmpl
      .replace("{hero}", hero.name)
      .replace("{years}", Math.floor(Math.random() * 200 + 50));

    const prophecy = {
      id: "proph_" + Date.now(),
      heroId: hero.id,
      heroName: hero.name,
      icon: "🔮",
      title: `🔮 Lời Tiên Tri: ${hero.name}`,
      content: text,
      year: window.year || 1,
      fulfillYear: futureYear,
      fulfilled: false,
    };
    d.prophecies.unshift(prophecy);
    if (d.prophecies.length > 100) d.prophecies.pop();
    d.totalGenerated++;

    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: window.year || 1, type: "prophecy", title: prophecy.title, color: "#8b5cf6" });
    }
    save();
    return prophecy;
  }

  // ============================================================
  // GENERATE CHRONICLE entry
  // ============================================================
  function addChronicle(heroName, event, year) {
    const d = window.legendV47Data;
    d.chronicles.unshift({
      id: "chron_" + Date.now(),
      heroName,
      event,
      year: year || window.year || 1,
      icon: "📜",
    });
    if (d.chronicles.length > 500) d.chronicles.pop();
    save();
  }

  // ============================================================
  // AUTO GENERATION — từ heroLegendData
  // ============================================================
  function autoGenerate() {
    if (!window.heroLegendData) return;
    const hd = window.heroLegendData;
    const allHeroes = Object.values(hd.heroes || {});
    if (!allHeroes.length) return;

    // Chỉ generate cho hero điểm cao
    const eligible = allHeroes.filter(h => (h.legendScore || 0) >= 500);
    if (!eligible.length) return;

    const hero = eligible[Math.floor(Math.random() * eligible.length)];
    const roll = Math.random();

    if (roll < 0.3) {
      // 30%: generate epic
      const score = hero.legendScore || 0;
      let type;
      if (score >= 5000) type = "conqueror_epic";
      else if (score >= 2000) type = "ascension_epic";
      else if (score >= 1000) type = "founder_epic";
      else type = "battle_epic";
      generateEpic(hero, type);
    } else if (roll < 0.6) {
      // 30%: generate folklore
      generateFolklore(hero);
    } else if (roll < 0.75) {
      // 15%: generate prophecy
      generateProphecy(hero);
    }
  }

  // ============================================================
  // CHECK PROPHECY FULFILLMENT
  // ============================================================
  function checkProphecies() {
    const d = window.legendV47Data;
    const year = window.year || 1;
    d.prophecies.forEach(p => {
      if (!p.fulfilled && year >= p.fulfillYear) {
        p.fulfilled = true;
        p.fulfillContent = `Lời tiên tri về ${p.heroName} đã ứng nghiệm vào năm ${year}.`;
        if (typeof window.htAddEvent === "function") {
          window.htAddEvent({ year, type: "prophecy_fulfilled", title: `🔮 Tiên Tri Ứng Nghiệm: ${p.heroName}`, color: "#a78bfa" });
        }
        if (typeof window.waeAddAlert === "function") {
          window.waeAddAlert({ type: "legend", msg: `🔮 Lời tiên tri về ${p.heroName} đã ứng nghiệm!` });
        }
      }
    });
  }

  // ============================================================
  // GAME TICK
  // ============================================================
  window.legendV47Tick = function() {
    const d = window.legendV47Data;
    d.lastTick = (d.lastTick || 0) + 1;
    if (d.lastTick % 40 === 0) autoGenerate();
    if (d.lastTick % 100 === 0) checkProphecies();
  };

  // ============================================================
  // PUBLIC API
  // ============================================================
  window.legV47GetEpics = function() { return window.legendV47Data.epics; };
  window.legV47GetFolklore = function() { return window.legendV47Data.folklore; };
  window.legV47GetProphecies = function() { return window.legendV47Data.prophecies; };
  window.legV47GetChronicles = function() { return window.legendV47Data.chronicles; };
  window.legV47GenerateEpic = generateEpic;
  window.legV47GenerateFolklore = generateFolklore;
  window.legV47GenerateProphecy = generateProphecy;
  window.legV47AddChronicle = addChronicle;
  window.legV47GetStats = function() {
    const d = window.legendV47Data;
    return {
      epics: d.epics.length,
      folklore: d.folklore.length,
      prophecies: d.prophecies.length,
      fulfilled: d.prophecies.filter(p => p.fulfilled).length,
      chronicles: d.chronicles.length,
      total: d.totalGenerated,
    };
  };

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); try { window.legendV47Tick(); } catch(e) {} };
    console.log("[LegendEngineV47] 📖 Sử Thi & Huyền Thoại V47 khởi động —", window.legendV47Data.epics.length, "sử thi ·", window.legendV47Data.folklore.length, "truyền thuyết ·", window.legendV47Data.prophecies.length, "lời tiên tri.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 4400); });
  } else {
    setTimeout(init, 4400);
  }
})();
