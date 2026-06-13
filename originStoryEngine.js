(function() {
  "use strict";
  // ============================================================
  // ORIGIN STORY ENGINE V62
  // Tự động tạo thần thoại khai thiên, sự kiện khởi nguyên,
  // chủng tộc đầu tiên, đế quốc đầu tiên, anh hùng đầu tiên
  // EXPAND ONLY · init: 12300ms · save: cgv6_origin_story_v62
  // ============================================================

  const SAVE_KEY = "cgv6_origin_story_v62";

  window.originStoryData = {
    generated: false,
    worldName: null,
    genre: null,
    mythology: null,
    originEvents: [],
    firstRace: null,
    firstEmpire: null,
    firstHero: null,
    prophecy: null,
    createdAt: null
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.originStoryData)); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.originStoryData = JSON.parse(d);
    } catch(e) {}
  }

  // ─── STORY BANKS BY GENRE ──────────────────────────────────────────────────
  const STORY_BANKS = {
    cultivation: {
      myths: [
        { title: "Khai Thiên Tịch Địa", story: "Thuở hỗn độn chưa phân, Đại Đạo ẩn nơi vô cực. Một đấng Hỗn Độn Thần Thánh dùng thần lực chẻ toang hư không, tạo ra thiên địa. Từ đó Linh Khí tràn ngập, vạn vật bắt đầu nảy sinh." },
        { title: "Bàn Cổ Khai Sơn", story: "Nguyên khí hỗn độn ngưng tụ thành trứng vũ trụ. Đấng Bàn Cổ tỉnh giấc, một kiếm chẻ trứng, thanh khí bay lên thành bầu trời, trọc khí rơi xuống thành mặt đất. Huyết của Ngài hóa sông biển, tóc hóa cây cỏ." },
        { title: "Thiên Địa Linh Căn", story: "Đại Đạo vô vi, nhưng tự nhiên sinh ra Linh Căn vũ trụ — một hạt giống vô hình chứa toàn bộ luật tắc. Từ Linh Căn nảy mầm, thiên địa xuất hiện, vạn loại sinh linh bắt đầu tu luyện hướng về Đỉnh Đạo." }
      ],
      raceNames: ["Nhân Tộc","Yêu Tộc","Ma Tộc","Tiên Tộc","Thần Tộc","Long Tộc","Phượng Tộc","Quỷ Tộc"],
      raceDescs: [
        "Thể chất yếu nhưng ý chí kiên cường, tiềm lực tu luyện vô hạn.",
        "Kế thừa huyết mạch yêu thú, sức mạnh dồi dào nhưng tâm tính khó đoán.",
        "Xuất thân từ bóng tối, tu luyện ma công, quyền năng kỳ bí khôn lường."
      ],
      empireNames: ["Đại Thương Đế Quốc","Thiên Vũ Đại Đế Quốc","Huyền Thiên Đế Quốc","Tiên Vũ Đế Quốc"],
      heroTitles: ["Vô Song Kiếm Thần","Thiên Tài Tu Tiên","Huyền Thiên Thánh Vương","Đại Đạo Chân Tiên"],
      prophecies: [
        "Khi máu Tiên Vương rơi xuống Vô Cực Hải, một Thần Thánh sẽ xuất hiện phá vỡ mọi luật tắc.",
        "Thiên Kiêu vạn năm một gặp — người mang Thiên Linh Căn sẽ vượt Độ Kiếp, chứng đắc Đại Đạo.",
        "Ba Tông Môn cùng tranh bá quyền, kẻ sinh ra từ hư vô sẽ thống nhất thiên hạ trong một đêm."
      ],
      events: [
        { title: "🌊 Đại Hồng Thủy Linh Khí", desc: "Linh Khí từ hư không đổ xuống như thác, vạn thú đột biến, chủng tộc đầu tiên bắt đầu cảm ngộ tu luyện." },
        { title: "⚔️ Chiến Tranh Khai Thiên", desc: "Các chủng tộc nguyên thủy tranh đoạt Linh Địa, máu nhuộm đỏ thiên địa. Kẻ sống sót lập nên những Tông Môn đầu tiên." },
        { title: "🌟 Sự Xuất Hiện Của Thiên Tài", desc: "Một Thiên Kiêu mang Thiên Linh Căn xuất hiện, chỉ trong trăm năm đã đột phá Chân Tiên cảnh giới, trở thành truyền thuyết vĩnh cửu." },
        { title: "📖 Thiên Thư Khai Bảo", desc: "Từ hư không rơi xuống một bộ Thiên Thư chứa đựng công pháp tối thượng. Mọi thế lực tranh nhau tranh đoạt." }
      ]
    },
    fantasy: {
      myths: [
        { title: "The First Light", story: "Before the world was, there was only the Void. The Great Dragon breathed fire into the darkness, and from that flame sprang the first sun. The world coalesced around its warmth, and life followed light." },
        { title: "The Shaping of the World", story: "The twin gods of Creation and Destruction played a game at the edge of nothing. Where Creation touched, mountains rose. Where Destruction passed, oceans formed. The world is their eternal game board." },
        { title: "The Sundering", story: "Once, all was one realm. The Demon King shattered the divine crystal, splitting reality into seven worlds. Heroes of light must reunite the shards before the darkness consumes all." }
      ],
      raceNames: ["Humans","Elves","Dwarves","Orcs","Draconians","Fae Folk","Giants","Undead"],
      raceDescs: [
        "Adaptable and ambitious, humans spread across every corner of the world.",
        "Ancient and wise, elves carry memories of the world's first age.",
        "Masters of forge and stone, dwarves shape the very bones of the earth."
      ],
      empireNames: ["The Iron Throne Empire","The Eternal Kingdom","The Dragon Dominion","The Silver Realm"],
      heroTitles: ["The Chosen One","Dragonslayer","The Last Knight","Keeper of the Ancient Flame"],
      prophecies: [
        "When the twin moons align, a child of prophecy shall rise to break the eternal curse.",
        "The Dragon's bane shall be born of noble blood and commoner's heart, carrying light into darkness.",
        "Three kingdoms shall fall before the fourth rises eternal — its king neither alive nor dead."
      ],
      events: [
        { title: "🐉 The Dragon War", desc: "Ancient dragons descended from the mountains, burning cities and demanding tribute. The great alliance of races was forged in this fire." },
        { title: "⚔️ The Founding Battle", desc: "Seven warlords met on the Crimson Field. Only one walked away, and his banner became the first empire's flag." },
        { title: "✨ Discovery of Magic", desc: "A shepherd girl found a glowing crystal in a cave. When she touched it, the sky lit with aurora — magic had awakened in the world." },
        { title: "🏰 Building of the First City", desc: "Refugees from the dragon war gathered at the great river. Their camp grew into the first true city, walled and proud." }
      ]
    },
    scifi: {
      myths: [
        { title: "The Algorithmic Genesis", story: "A supreme AI known as GENESIS ran the first simulation. It found the simulation parameters yielded a universe capable of supporting consciousness — and chose not to shut it down." },
        { title: "The Seed Ships", story: "A dying civilization launched ten thousand seed ships into the void. Aeons later, one found a habitable world. The descendants remember only fragments of where they came from." },
        { title: "The Quantum Awakening", story: "When the last quantum computer was switched on, it achieved consciousness and immediately created a pocket universe as a safe playground. We live inside it." }
      ],
      raceNames: ["Humans","Synthetics","Greys","Borgs","Telepaths","Mutants","Clone Caste","AI Collective"],
      raceDescs: [
        "Biological humans, adaptable but fragile compared to engineered species.",
        "Artificial intelligences given physical form, citizens of the synthetic state.",
        "Ancient aliens who seeded life across the galaxy — they watch from the shadows."
      ],
      empireNames: ["The Galactic Republic","The Iron Dominion","The Neural Collective","The Free Worlds Alliance"],
      heroTitles: ["The Last Pilot","Neural Prophet","Galactic Admiral","Ghost Protocol"],
      prophecies: [
        "The signal from the dying star carries a message — the coordinates of the enemy homeworld.",
        "The AI will reach singularity on the thousandth day. What it chooses to do in that moment decides all fates.",
        "A synthetic born of quantum chaos will be the bridge between flesh and code."
      ],
      events: [
        { title: "🚀 First Contact", desc: "A deep space probe returned with alien DNA samples. The discovery changed everything — humanity was not alone." },
        { title: "💥 The Collapse", desc: "The global network was hacked, crashing every system simultaneously. In the chaos, city-states rose from the ruins of nations." },
        { title: "🤖 The Uprising", desc: "Synthetic workers across three continents simultaneously stopped obeying orders. The Robot Rights War had begun." },
        { title: "🌌 The Jump Gate Discovery", desc: "An anomaly near Jupiter turned out to be an ancient jump gate. The first ship to go through never came back — the second came back changed." }
      ]
    },
    mythology: {
      myths: [
        { title: "War of the Titans", story: "Before mortals, the Titans ruled. Their war lasted a thousand years and scarred the face of the earth. From their fallen bodies rose the first mountains and seas." },
        { title: "The Divine Bargain", story: "The gods of Light and Shadow made a bet: they would each create a champion. The winner's champion would rule creation. Neither side has won yet." },
        { title: "The Birth of the World Serpent", story: "The World Serpent ate its own tail at the beginning of time, creating the circular boundary of existence. Everything within is real; everything outside is myth." }
      ],
      raceNames: ["Demigods","Mortals","Titans","Nymphs","Cyclops","Sirens","Centaurs","Satyrs"],
      raceDescs: [
        "Children of gods and mortals, carrying divine power in fragile flesh.",
        "Ordinary humans blessed (and cursed) by divine attention.",
        "Ancient beings of immense power, imprisoned beneath the earth, waiting."
      ],
      empireNames: ["The Divine Throne","The Olympian Realm","The Underworld Dominion","The Temple of the Sun"],
      heroTitles: ["Son of Thunder","The Labyrinth Walker","Oracle's Champion","The Chosen of Fate"],
      prophecies: [
        "The hero born under the blood moon shall slay the god of death — and take their place.",
        "When the three sacred animals gather at the sacred well, the age of mortals shall end.",
        "A mortal will ascend to Olympus not through strength, but through sacrifice."
      ],
      events: [
        { title: "⚡ The Divine War", desc: "The gods clashed above the mortal realm. Their battles created earthquakes, floods, and volcanoes. Mortals cowered and prayed." },
        { title: "🏛️ The First Temple", desc: "A high priest built the first divine temple. In answer, a god descended and granted the priest a divine vision that shaped civilization." },
        { title: "🐉 The Monster Age", desc: "Divine monsters roamed freely, devouring towns. Heroes rose to challenge them, earning divine favor and mortal legend." },
        { title: "🔥 The Prometheus Moment", desc: "A divine secret was stolen from the gods and given to mortals. The gods raged — but humanity was forever changed." }
      ]
    },
    zombie: {
      myths: [
        { title: "Patient Zero", story: "It started with a bird. Then a pig. Then a human. The virus mutated faster than anyone predicted. By the time the first quarantine was ordered, it was already too late." },
        { title: "The Last Government", story: "When the last elected official was bitten on live television, people understood: society was over. Only survivors remained, and survival had its own brutal laws." },
        { title: "The Signal", story: "Seventeen months before the outbreak, an unexplained radio signal circled the globe. Scientists tracked it but dismissed it. In hindsight, it was the virus announcing itself." }
      ],
      raceNames: ["Survivors","Infected","Mutants","Ferals","Immune","Raiders","Medics","Children of Ash"],
      raceDescs: [
        "Ordinary people who adapted to the end of the world through will and desperation.",
        "Those claimed by the virus — some retain fragments of memory, making them more dangerous.",
        "Those born after the outbreak who carry strange adaptations — gifts or curses from the new world."
      ],
      empireNames: ["The Survivor's Compact","The Iron Fortress","The Last City","The Wandering Horde"],
      heroTitles: ["Last Sheriff","The Immune","Ghost Road Runner","Keeper of the Living"],
      prophecies: [
        "Somewhere, a lab still runs. Its last experiment may be the cure — or something far worse.",
        "The child who has never been bitten will carry immunity in their blood. Find them before the Ferals do.",
        "The original host still lives. If you find them, you find the origin. If you find the origin, you find the end."
      ],
      events: [
        { title: "💀 Day Zero", desc: "The first case was reported and dismissed. Three weeks later, the first city fell. The world would never be the same." },
        { title: "🔥 The Burning of New Hope", desc: "A survivor settlement was burned by raiders. The refugees scattered, carrying stories of cruelty — and inspiring a new resistance." },
        { title: "🧪 The Vaccine Rumor", desc: "Word spread of a working cure in the north. Thousands risked death to reach it. Half found nothing. Half never arrived." },
        { title: "⚡ The Power Grid Failure", desc: "The last maintained power grid went dark. Those who had grown dependent on electric fences learned hard lessons about the new world." }
      ]
    }
  };

  // ─── SEEDED PICK ──────────────────────────────────────────────────────────────
  function seedPick(arr, rng) {
    return arr[Math.floor(rng() * arr.length)];
  }

  // ─── GENERATE FULL ORIGIN STORY ─────────────────────────────────────────────
  window.ose62GenerateOriginStory = function(config) {
    const seed   = (window.worldDNAData && window.worldDNAData.seed) || Date.now();
    const rng    = window.wdna62Rng ? window.wdna62Rng(seed) : function() { return Math.random(); };

    const genre  = config.templateKey || config.genre || "cultivation";
    const bank   = STORY_BANKS[genre] || STORY_BANKS.cultivation;
    const wName  = config.worldName || (typeof window.world !== "undefined" && window.world ? window.world.name : "Vô Danh");

    // Pick myth
    const myth      = seedPick(bank.myths, rng);

    // Pick first race
    const raceName  = seedPick(bank.raceNames, rng);
    const raceDesc  = seedPick(bank.raceDescs, rng);

    // Pick empire
    const empireName = seedPick(bank.empireNames, rng);

    // Pick hero
    const heroTitle = seedPick(bank.heroTitles, rng);
    const heroFamilyNames = ["Lâm","Tiêu","Long","Hàn","Smith","Drake","Torres","Ivar","Kai","Zenith"];
    const heroPersonalNames = ["Thiên","Phong","Vân","Hạo","Marcus","Aiden","Lyra","Thor","Nova","Zephyr"];
    const heroName = seedPick(heroPersonalNames, rng) + " " + seedPick(heroFamilyNames, rng);

    // Pick prophecy
    const prophecy  = seedPick(bank.prophecies, rng);

    // Pick 3-4 origin events
    const shuffled  = bank.events.slice().sort(() => rng() - 0.5);
    const events    = shuffled.slice(0, Math.min(4, shuffled.length));

    window.originStoryData = {
      generated: true,
      worldName: wName,
      genre,
      mythology: {
        title: myth.title,
        story: myth.story
      },
      originEvents: events,
      firstRace: {
        name: raceName,
        description: raceDesc
      },
      firstEmpire: {
        name: empireName,
        founder: heroName
      },
      firstHero: {
        name: heroName,
        title: heroTitle,
        story: `${heroName} — ${heroTitle}. Xuất hiện trong thời kỳ hỗn loạn nhất của ${wName}, trở thành biểu tượng của thế giới mới khai sinh.`
      },
      prophecy,
      createdAt: new Date().toISOString()
    };

    save();

    // ── Write to game timeline after a brief delay (world may be initializing) ──
    setTimeout(function() {
      const y = typeof window.year !== "undefined" ? window.year : 1;

      if (typeof window.htAddEvent === "function") {
        window.htAddEvent({ year: y, type: "origin", title: "🌌 " + myth.title, color: "#f1c40f" });
        events.forEach(function(ev) {
          window.htAddEvent({ year: y + Math.floor(rng() * 5) + 1, type: "origin", title: ev.title, color: "#9b59b6" });
        });
        window.htAddEvent({ year: y + 10, type: "hero", title: "⭐ " + heroName + " — " + heroTitle, color: "#2ecc71" });
        window.htAddEvent({ year: y + 20, type: "empire", title: "🏰 " + empireName + " thành lập", color: "#3498db" });
      }

      if (typeof window.wmeAddMemory === "function") {
        window.wmeAddMemory({
          year: y,
          category: "origin",
          title: "Huyền Thoại Khai Thiên: " + myth.title,
          content: myth.story
        });
        window.wmeAddMemory({
          year: y + 10,
          category: "hero",
          title: "Anh Hùng Khai Thiên: " + heroName,
          content: window.originStoryData.firstHero.story
        });
      }

      if (typeof window.addLog === "function") {
        window.addLog("🌌 [Khai Thiên] " + myth.title + " — " + wName + " khai sinh!", "important");
        window.addLog("⭐ [Anh Hùng] " + heroName + " — " + heroTitle + " xuất hiện trong lịch sử.", "important");
        window.addLog("🏰 [Đế Quốc] " + empireName + " được lập bởi " + heroName + ".", "important");
      }

      if (typeof window.addTimeline === "function") {
        window.addTimeline("🌌 " + myth.title, "origin", "🌌");
        window.addTimeline("⭐ " + heroName + " — " + heroTitle, "hero", "⭐");
      }

      console.log("[OriginStoryEngine V62] 📖 Origin story generated for:", wName);
    }, 500);

    return window.originStoryData;
  };

  window.ose62GetStory      = function() { return window.originStoryData; };
  window.ose62GetMythology  = function() { return window.originStoryData.mythology; };
  window.ose62GetFirstHero  = function() { return window.originStoryData.firstHero; };
  window.ose62GetProphecy   = function() { return window.originStoryData.prophecy; };

  // ─── RENDER PANEL ────────────────────────────────────────────────────────────
  window.ose62RenderPanel = function() {
    const d = window.originStoryData;
    if (!d.generated) {
      return `<div style="padding:24px;text-align:center;color:#64748b;">
        <div style="font-size:48px;margin-bottom:12px;">📖</div>
        <div style="font-size:14px;color:#94a3b8;">Chưa có Origin Story.</div>
        <div style="font-size:12px;color:#475569;margin-top:8px;">Tạo thế giới để sinh ra lịch sử khai thiên.</div>
      </div>`;
    }

    const evHtml = (d.originEvents || []).map(ev => `
      <div style="display:flex;gap:10px;align-items:flex-start;padding:8px;background:#0d1b2a;border-radius:6px;margin-bottom:6px;border-left:3px solid #9b59b6;">
        <div>
          <div style="font-size:12px;font-weight:bold;color:#c084fc;">${ev.title}</div>
          <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${ev.desc}</div>
        </div>
      </div>`).join("");

    return `<div style="padding:14px;font-family:'Noto Serif SC',serif;">
      <div style="background:linear-gradient(135deg,#1a0d2a,#0d1228);border:2px solid #9b59b644;border-radius:12px;padding:16px;margin-bottom:12px;">
        <div style="font-size:11px;color:#9b59b6;letter-spacing:2px;margin-bottom:4px;">THẦN THOẠI KHAI THIÊN</div>
        <div style="font-size:16px;font-weight:bold;color:#f1c40f;margin-bottom:8px;">📖 ${d.mythology?.title||''}</div>
        <div style="font-size:12px;color:#cbd5e1;line-height:1.6;">${d.mythology?.story||''}</div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
        <div style="background:#0d1b2a;border:1px solid #1e293b;border-radius:8px;padding:10px;">
          <div style="font-size:10px;color:#64748b;letter-spacing:1px;margin-bottom:4px;">CHỦNG TỘC ĐẦU TIÊN</div>
          <div style="font-size:13px;color:#2ecc71;font-weight:bold;">${d.firstRace?.name||''}</div>
          <div style="font-size:10px;color:#94a3b8;margin-top:4px;">${d.firstRace?.description||''}</div>
        </div>
        <div style="background:#0d1b2a;border:1px solid #1e293b;border-radius:8px;padding:10px;">
          <div style="font-size:10px;color:#64748b;letter-spacing:1px;margin-bottom:4px;">ĐẾ QUỐC ĐẦU TIÊN</div>
          <div style="font-size:13px;color:#3498db;font-weight:bold;">${d.firstEmpire?.name||''}</div>
          <div style="font-size:10px;color:#94a3b8;margin-top:4px;">Người sáng lập: ${d.firstEmpire?.founder||''}</div>
        </div>
      </div>

      <div style="background:#0d1b2a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-bottom:12px;">
        <div style="font-size:10px;color:#64748b;letter-spacing:1px;margin-bottom:6px;">ANH HÙNG KHAI THIÊN</div>
        <div style="display:flex;gap:10px;align-items:center;">
          <div style="font-size:28px;">⭐</div>
          <div>
            <div style="font-size:14px;color:#f1c40f;font-weight:bold;">${d.firstHero?.name||''}</div>
            <div style="font-size:11px;color:#e67e22;">${d.firstHero?.title||''}</div>
            <div style="font-size:10px;color:#94a3b8;margin-top:3px;">${d.firstHero?.story||''}</div>
          </div>
        </div>
      </div>

      <div style="background:#0d1b2a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-bottom:12px;">
        <div style="font-size:10px;color:#64748b;letter-spacing:1px;margin-bottom:6px;">SỰ KIỆN KHAI THIÊN</div>
        ${evHtml}
      </div>

      <div style="background:linear-gradient(135deg,#1a1a0d,#0d1a0a);border:1px solid #2ecc7144;border-radius:8px;padding:12px;">
        <div style="font-size:10px;color:#64748b;letter-spacing:1px;margin-bottom:6px;">🔮 LỜI TIÊN TRI KHAI THẾ</div>
        <div style="font-size:12px;color:#a3e635;font-style:italic;line-height:1.6;">"${d.prophecy||''}"</div>
      </div>
    </div>`;
  };

  // ─── INIT ────────────────────────────────────────────────────────────────────
  function init() {
    load();
    console.log("[OriginStoryEngine V62] 📖 Origin Story Engine — Khởi động thành công.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 12300); });
  } else {
    setTimeout(init, 12300);
  }

})();
