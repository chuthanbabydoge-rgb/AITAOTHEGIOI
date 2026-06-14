(function () {
  "use strict";
  const SAVE_KEY = "cgv6_manifestation_v71";

  const MANIFESTATION_TYPES = [
    { id: "appear",    name: "Giáng Thế",          icon: "🌟", cost: 100, desc: "Thần xuất hiện trước dân chúng — gây kinh ngạc, sợ hãi, và tôn kính" },
    { id: "save",      name: "Cứu Thế",             icon: "🛡️", cost: 150, desc: "Thần cứu một thành phố / quốc gia khỏi thảm họa" },
    { id: "prophecy",  name: "Ban Tiên Tri",         icon: "🔮", cost: 80,  desc: "Thần phán một lời tiên tri — để lại dấu ấn trong sử sách" },
    { id: "bless",     name: "Đại Phúc Lành",        icon: "✨", cost: 120, desc: "Thần ban phúc cho toàn thành phố — mùa màng bội thu, dịch bệnh tan biến" },
    { id: "destroy",   name: "Hủy Diệt",             icon: "💥", cost: 200, desc: "Thần trừng phạt kẻ tội lỗi, hủy diệt vùng đất ô nhiễm" },
    { id: "summon",    name: "Triệu Anh Hùng",       icon: "⚔️", cost: 180, desc: "Thần triệu một NPC bình thường thành anh hùng của thế giới" },
    { id: "speak",     name: "Thần Ngôn",             icon: "📣", cost: 60,  desc: "Thần nói chuyện trực tiếp với thế giới — lời nói sẽ được ghi vào kinh thư" },
    { id: "miracle",   name: "Phép Màu Hiển Linh",   icon: "🌈", cost: 130, desc: "Thần tạo ra phép màu không thể giải thích — mưa vàng, sông trở thành rượu" },
  ];

  window.manifestationV71Data = {
    version: "V71",
    initialized: false,
    manifestationLog: [],
    activeManifestations: [],
    totalManifestations: 0,
    legendsCreated: 0,
    lastManifestation: null,
    customProphecy: "",
    customDivineWord: "",
  };

  const D = window.manifestationV71Data;

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        manifestationLog: D.manifestationLog.slice(-30),
        totalManifestations: D.totalManifestations,
        legendsCreated: D.legendsCreated,
        lastManifestation: D.lastManifestation,
      }));
    } catch (e) {}
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) Object.assign(D, JSON.parse(raw));
    } catch (e) {}
  }

  window.mfst71GetTypes = function () { return MANIFESTATION_TYPES.slice(); };
  window.mfst71GetData = function () { return D; };
  window.mfst71GetLog = function () { return D.manifestationLog.slice(-20); };

  window.mfst71Perform = function (typeId, options) {
    const mType = MANIFESTATION_TYPES.find(function (m) { return m.id === typeId; });
    if (!mType) return { success: false, msg: "Loại hiện thân không hợp lệ" };

    if (!window.avg71SpendEnergy(mType.cost)) {
      return { success: false, msg: "Không đủ Thần Năng (" + mType.cost + " cần thiết)" };
    }

    const year = window.year || 1;
    const avatarData = window.avatarGodV71Data;
    const form = window.avg71GetForm ? window.avg71GetForm() : { name: "Đấng Sáng Thế", icon: "✨" };
    const godName = (avatarData && avatarData.godName) ? avatarData.godName : "Đấng Sáng Thế";
    const location = (options && options.location) ? options.location : _getActiveLocation();

    let result = "";
    let historyTitle = "";
    let importance = 9;

    if (typeId === "appear") {
      result = form.icon + " " + godName + " hiện thân tại " + location + ". Hàng nghìn người chứng kiến. Thế giới chấn động.";
      historyTitle = "🌟 Thần Giáng Thế tại " + location;
      if (typeof window.dps71EnterPresence === "function") window.dps71EnterPresence(location, form.id);
    } else if (typeId === "save") {
      const disasters = (window.disasterData && window.disasterData.activeDisasters) || [];
      const target = disasters[0] ? disasters[0].region : location;
      result = "🛡️ " + godName + " cứu " + target + " khỏi " + (disasters[0] ? disasters[0].type : "thảm họa") + ". Dân chúng nhớ ơn đến muôn đời.";
      historyTitle = "🛡️ Thần Cứu Thế — " + target;
      if (window.disasterData && disasters.length > 0) disasters.shift();
    } else if (typeId === "prophecy") {
      const prophecyText = (options && options.text) || D.customProphecy || generateProphecy(year);
      result = "🔮 " + godName + " phán: \"" + prophecyText + "\" — Lời này được khắc vào đá, truyền đời.";
      historyTitle = "🔮 Tiên Tri Của Thần";
      if (typeof window.proph66Create === "function") window.proph66Create("creator_v71", { text: prophecyText, year });
    } else if (typeId === "bless") {
      const countries = window.countries || [];
      const target = (options && options.target) ? options.target : (countries[0] ? countries[0].name : location);
      result = "✨ Đại phúc lành giáng xuống " + target + ". Mùa màng bội thu, bệnh tật tan biến trong 10 năm.";
      historyTitle = "✨ Đại Phúc Lành — " + target;
      const c = countries.find(function (co) { return co.name === target; });
      if (c) { if (c.stability !== undefined) c.stability = Math.min(100, (c.stability || 50) + 20); }
    } else if (typeId === "destroy") {
      const wars = window.warsActive || [];
      const target = (options && options.target) ? options.target : (wars[0] ? wars[0].attackerName : location);
      result = "💥 Thần Phán Quyết giáng xuống " + target + ". Lửa thiêng đốt cháy tội lỗi. Kẻ ác không còn nơi trốn chạy.";
      historyTitle = "💥 Thần Trừng Phạt — " + target;
      importance = 10;
    } else if (typeId === "summon") {
      const npcs = (window.npcs || []).filter(function (n) { return n.status === "alive"; });
      const chosen = npcs[Math.floor(Math.random() * Math.min(npcs.length, 20))];
      if (chosen) {
        result = "⚔️ " + godName + " triệu " + chosen.name + " đứng lên. Ánh sáng bao phủ. Một anh hùng mới đã ra đời.";
        historyTitle = "⚔️ Anh Hùng Được Triệu — " + chosen.name;
        if (typeof window.div66CreateArtifact === "function") window.div66CreateArtifact({ targetId: chosen.id });
      } else {
        result = "⚔️ " + godName + " triệu anh hùng — nhưng thế giới chưa có người xứng đáng.";
      }
    } else if (typeId === "speak") {
      const word = (options && options.text) || D.customDivineWord || generateDivineWord(year);
      result = "📣 Thần Ngôn vang lên: \"" + word + "\" — Mọi sinh linh đều nghe thấy trong lòng.";
      historyTitle = "📣 Thần Ngôn";
      if (typeof window.divVoice66Send === "function") window.divVoice66Send({ message: word });
    } else if (typeId === "miracle") {
      const miracles = ["Trời đổ mưa vàng", "Sông đổi màu thành trắng sữa", "Cây cối nở hoa trong 1 ngày", "Mặt trăng xuất hiện giữa ban ngày", "Tất cả chiến tranh ngừng lại trong 3 ngày", "Người chết sống lại trong 1 ngày"];
      const miracle = miracles[Math.floor(year * 7) % miracles.length];
      result = "🌈 Phép màu hiển linh: " + miracle + ". Không ai có thể giải thích. Đức tin bùng cháy khắp nơi.";
      historyTitle = "🌈 Phép Màu — " + miracle;
    }

    const entry = { year, typeId, icon: mType.icon, name: mType.name, location, result, historyTitle, ts: Date.now() };
    D.manifestationLog.push(entry);
    if (D.manifestationLog.length > 30) D.manifestationLog = D.manifestationLog.slice(-30);
    D.totalManifestations++;
    D.lastManifestation = entry;

    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year, type: "divine", title: historyTitle, color: "#c084fc" });
    }
    if (typeof window.mem64Record === "function") {
      window.mem64Record("divine", historyTitle, result, importance, ["manifestation", typeId, "avatar"]);
    }
    if (avatarData) {
      avatarData.stats.totalAppearances++;
      if (typeId === "bless") avatarData.stats.totalBlessings++;
      if (typeId === "destroy") avatarData.stats.totalZaps++;
      if (typeof window.avg71LogAppearance === "function") window.avg71LogAppearance(mType.icon + " " + mType.name + " — " + location);
    }

    save();
    return { success: true, result, entry };
  };

  function _getActiveLocation() {
    const d = window.divinePresenceV71Data;
    if (d && d.currentLocation) return d.currentLocation;
    const countries = window.countries || [];
    return countries.length > 0 ? countries[Math.floor(Math.random() * Math.min(countries.length, 5))].name : "Vùng Đất Trung Tâm";
  }

  function generateProphecy(year) {
    const prophecies = [
      "Trong 100 năm nữa, một đứa trẻ sinh ra với mắt vàng sẽ thống nhất thế giới.",
      "Biển lửa sẽ nuốt chửng kẻ phản bội. Hãy cúi đầu trước Đấng Vô Hình.",
      "Khi mặt trời đứng bóng vào ngày giữa thu, thời đại mới sẽ bắt đầu.",
      "Người nào tìm được viên đá xanh dưới núi cao nhất sẽ trường sinh.",
      "Đế quốc mạnh nhất hôm nay sẽ tan thành tro bụi trong 50 năm tới.",
    ];
    return prophecies[Math.floor(year * 3) % prophecies.length];
  }

  function generateDivineWord(year) {
    const words = [
      "Hãy sống với lòng biết ơn — từng ngày là một món quà.",
      "Kẻ mạnh phải bảo vệ kẻ yếu. Đó là ý chí của Ta.",
      "Chiến tranh là tội lỗi. Hòa bình là đường đến với Ta.",
      "Tất cả chúng ngươi đều là con của Ta. Hãy yêu thương nhau.",
      "Thế giới này là thử thách. Vượt qua nó — Ta sẽ đón nhận ngươi.",
    ];
    return words[Math.floor(year * 7) % words.length];
  }

  function init() {
    load();
    D.initialized = true;
    console.log("[creatorManifestationSystem V71] 🌟 Creator Manifestation System khởi động — 8 loại hiện thân · Legacy ghi chép.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 17100); });
  } else {
    setTimeout(init, 17100);
  }
})();
