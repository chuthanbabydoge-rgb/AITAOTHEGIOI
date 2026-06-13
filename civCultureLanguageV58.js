(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // CIV CULTURE & LANGUAGE V58
  // Phong Tục · Lễ Hội · Triết Học · Nghệ Thuật · Ngôn Ngữ Riêng
  // KHÔNG trùng: cultureHeritageEngine.js (world NPC culture, soft power)
  //              livingCivilizationAI.js (AI civ traits) — đây là PLAYER-FACING
  // ═══════════════════════════════════════════════════════════════════════════

  const SAVE_KEY = "cgv6_civ_culture_lang_v58";
  const INIT_DELAY = 10300;

  const CUSTOM_PRESETS = [
    { id:"honor",      name:"Danh Dự",      icon:"⚔️", desc:"Coi danh dự hơn tính mạng, không bao giờ phản bội." },
    { id:"knowledge",  name:"Tri Thức",     icon:"📚", desc:"Học tập là con đường cao quý nhất." },
    { id:"harmony",    name:"Hài Hòa",      icon:"☯", desc:"Cân bằng âm dương, sống thuận theo tự nhiên." },
    { id:"strength",   name:"Sức Mạnh",     icon:"💪", desc:"Kẻ mạnh trị vì kẻ yếu, sức mạnh là chân lý." },
    { id:"wealth",     name:"Phú Quý",      icon:"💰", desc:"Của cải là thước đo thành công và quyền lực." },
    { id:"faith",      name:"Đức Tin",      icon:"🛕", desc:"Thần linh là tối cao, phụng sự là ý nghĩa sống." },
    { id:"freedom",    name:"Tự Do",        icon:"🕊️", desc:"Mỗi cá nhân có quyền tự quyết hoàn toàn." },
    { id:"conquest",   name:"Chinh Phạt",   icon:"🗡️", desc:"Mở rộng lãnh thổ là sứ mệnh thiêng liêng." }
  ];

  const FESTIVAL_EFFECTS = {
    spring: { bonus: "population", value: 5, desc: "Lễ Xuân — Dân số tăng trưởng" },
    harvest: { bonus: "economy", value: 8, desc: "Lễ Thu Hoạch — Kinh tế phồn thịnh" },
    war:     { bonus: "military", value: 10, desc: "Lễ Chiến Binh — Quân lực tăng cường" },
    moon:    { bonus: "culture", value: 7, desc: "Lễ Trung Thu — Văn hóa lan tỏa" },
    fire:    { bonus: "power", value: 12, desc: "Lễ Lửa Thiêng — Quyền năng bùng phát" },
    ancestor:{ bonus: "stability", value: 6, desc: "Lễ Tổ Tiên — Ổn định cộng đồng" }
  };

  window.civCultureData = {
    customs: [],
    festivals: [],
    philosophy: "",
    artStyle: "",
    socialValues: [],
    langName: "",
    langAlphabet: "",
    langGreetings: [],
    langTitles: {
      ruler: "Đế Vương",
      general: "Thống Soái",
      scholar: "Học Sĩ",
      merchant: "Thương Gia",
      farmer: "Nông Phu",
      priest: "Thần Quan"
    },
    langTerms: {},
    totalEvents: 0
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.civCultureData)); } catch(e) {}
  }
  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.civCultureData = Object.assign(window.civCultureData, JSON.parse(d));
    } catch(e) {}
  }

  // ─── PUBLIC API ────────────────────────────────────────────────

  window.cc58AddCustom = function(name, desc, valueId) {
    if (!name || !name.trim()) return { ok: false, msg: "Tên phong tục không được để trống." };
    var val = CUSTOM_PRESETS.find(function(v){ return v.id === valueId; });
    var entry = {
      id: "custom_" + Date.now(),
      name: name.trim(),
      desc: desc || "",
      value: val ? val.name : "Tự Định Nghĩa",
      valueIcon: val ? val.icon : "📌",
      year: window.year || 1
    };
    window.civCultureData.customs.push(entry);
    if (typeof window.ch58UpdateInfluence === "function") window.ch58UpdateInfluence("cultural", 3);
    save();
    return { ok: true, msg: "✅ Đã thêm phong tục: " + name };
  };

  window.cc58AddFestival = function(name, season, bonusType) {
    if (!name || !name.trim()) return { ok: false, msg: "Tên lễ hội không được để trống." };
    var eff = FESTIVAL_EFFECTS[season] || FESTIVAL_EFFECTS.spring;
    var entry = {
      id: "fest_" + Date.now(),
      name: name.trim(),
      season: season || "spring",
      effect: eff,
      year: window.year || 1
    };
    window.civCultureData.festivals.push(entry);
    save();
    return { ok: true, msg: "✅ Đã thêm lễ hội: " + name + " (" + eff.desc + ")" };
  };

  window.cc58SetPhilosophy = function(text) {
    window.civCultureData.philosophy = text || "";
    save();
    return { ok: true, msg: "✅ Triết học văn minh đã được ghi lại." };
  };

  window.cc58SetArtStyle = function(style) {
    window.civCultureData.artStyle = style || "";
    if (typeof window.ch58UpdateInfluence === "function") window.ch58UpdateInfluence("cultural", 2);
    save();
    return { ok: true, msg: "✅ Phong cách nghệ thuật: " + style };
  };

  window.cc58AddSocialValue = function(valueId) {
    var val = CUSTOM_PRESETS.find(function(v){ return v.id === valueId; });
    if (!val) return { ok: false, msg: "Giá trị không hợp lệ." };
    if (window.civCultureData.socialValues.indexOf(val.id) !== -1) return { ok: false, msg: "Giá trị này đã có." };
    if (window.civCultureData.socialValues.length >= 5) return { ok: false, msg: "Tối đa 5 giá trị xã hội." };
    window.civCultureData.socialValues.push(val.id);
    save();
    return { ok: true, msg: "✅ Thêm giá trị xã hội: " + val.icon + " " + val.name };
  };

  window.cc58SetLanguage = function(name, alphabet) {
    window.civCultureData.langName = name || "";
    window.civCultureData.langAlphabet = alphabet || "";
    save();
    return { ok: true, msg: "✅ Ngôn ngữ " + name + " đã được khai sinh." };
  };

  window.cc58SetTitle = function(role, title) {
    if (!window.civCultureData.langTitles) window.civCultureData.langTitles = {};
    window.civCultureData.langTitles[role] = title || "";
    save();
    return { ok: true, msg: "✅ Danh xưng [" + role + "]: " + title };
  };

  window.cc58AddGreeting = function(phrase) {
    if (!phrase || !phrase.trim()) return { ok: false, msg: "Câu chào không được rỗng." };
    window.civCultureData.langGreetings.push(phrase.trim());
    save();
    return { ok: true, msg: "✅ Thêm câu chào: " + phrase };
  };

  window.cc58AddTerm = function(term, meaning) {
    if (!term || !meaning) return { ok: false, msg: "Thuật ngữ và ý nghĩa không được rỗng." };
    window.civCultureData.langTerms[term.trim()] = meaning.trim();
    save();
    return { ok: true, msg: "✅ Từ điển: " + term + " = " + meaning };
  };

  window.cc58GetPresets = function() { return CUSTOM_PRESETS; };
  window.cc58GetFestivalSeasons = function() { return Object.keys(FESTIVAL_EFFECTS).map(function(k){ return { id: k, desc: FESTIVAL_EFFECTS[k].desc }; }); };

  window.cc58GetStats = function() {
    return {
      customCount: window.civCultureData.customs.length,
      festivalCount: window.civCultureData.festivals.length,
      hasPhilosophy: !!window.civCultureData.philosophy,
      hasArtStyle: !!window.civCultureData.artStyle,
      socialValueCount: window.civCultureData.socialValues.length,
      hasLanguage: !!window.civCultureData.langName,
      titleCount: Object.keys(window.civCultureData.langTitles || {}).length,
      termCount: Object.keys(window.civCultureData.langTerms || {}).length,
      greetingCount: (window.civCultureData.langGreetings || []).length
    };
  };

  // ─── INIT ────────────────────────────────────────────────────
  function init() {
    load();
    console.log("[CivCultureLanguageV58] 🎨 Văn Hóa & Ngôn Ngữ V58 — " + CUSTOM_PRESETS.length + " giá trị xã hội · Lễ Hội · Triết Học · Ngôn Ngữ riêng sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, INIT_DELAY); });
  } else {
    setTimeout(init, INIT_DELAY);
  }
})();
