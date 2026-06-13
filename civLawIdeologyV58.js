(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // CIV LAW & IDEOLOGY V58
  // Luật Quốc Gia · Hình Phạt · Quyền Công Dân · Hệ Tư Tưởng 6 Loại
  // KHÔNG trùng: universeLawEngine.js (V37 — vật lý vũ trụ, không phải luật quốc gia)
  //              governmentSystemV49.js (V49 — AI entities, đây là PLAYER-FACING)
  // ═══════════════════════════════════════════════════════════════════════════

  const SAVE_KEY = "cgv6_civ_law_ideology_v58";
  const INIT_DELAY = 10400;

  const IDEOLOGIES = [
    {
      id: "monarchy",   name: "Quân Chủ",         icon: "👑",
      desc: "Một hoàng đế nắm trọn vương quyền, trật tự tuyệt đối.",
      effects: { stability: +15, military: +5, economy: 0, freedom: -10, science: -5 }
    },
    {
      id: "democracy",  name: "Dân Chủ",           icon: "🗳️",
      desc: "Dân chúng quyết định vận mệnh đất nước, tự do là nền tảng.",
      effects: { stability: +5, military: -5, economy: +10, freedom: +15, science: +5 }
    },
    {
      id: "theocracy",  name: "Thần Quyền",        icon: "⛩️",
      desc: "Thần linh là tối cao, tu sĩ nắm quyền cai trị.",
      effects: { stability: +10, military: 0, economy: -5, freedom: -10, science: -10, religion: +20 }
    },
    {
      id: "meritocracy",name: "Học Viện Trị",      icon: "🎓",
      desc: "Tri thức và tài năng là thước đo quyền lực.",
      effects: { stability: +5, military: -5, economy: +5, freedom: +5, science: +20 }
    },
    {
      id: "conquest",   name: "Chinh Phạt Chủ Nghĩa", icon: "🗡️",
      desc: "Mở rộng lãnh thổ không ngừng là sứ mệnh thiêng liêng.",
      effects: { stability: -5, military: +25, economy: 0, freedom: -5, science: 0, territory: +10 }
    },
    {
      id: "custom",     name: "Tự Định Nghĩa",     icon: "✏️",
      desc: "Người chơi tự thiết kế hệ tư tưởng độc đáo cho văn minh mình.",
      effects: {}
    }
  ];

  const LAW_CATEGORIES = [
    { id: "national",   name: "Luật Quốc Gia",  icon: "📜" },
    { id: "imperial",   name: "Luật Đế Quốc",   icon: "👑" },
    { id: "commerce",   name: "Luật Thương Mại", icon: "💹" },
    { id: "military",   name: "Luật Quân Sự",    icon: "⚔️" },
    { id: "civil",      name: "Dân Sự",          icon: "🤝" },
    { id: "criminal",   name: "Hình Sự",         icon: "⚖️" }
  ];

  const DEFAULT_RIGHTS = [
    { id: "r_life",    name: "Quyền Sống", desc: "Mọi công dân có quyền được sống." },
    { id: "r_speech",  name: "Tự Do Ngôn Luận", desc: "Được phép phát biểu quan điểm trong giới hạn luật pháp." },
    { id: "r_trade",   name: "Quyền Thương Mại", desc: "Mọi công dân có quyền buôn bán hợp pháp." },
    { id: "r_faith",   name: "Tự Do Tín Ngưỡng", desc: "Được thờ phụng thần linh theo ý muốn." }
  ];

  window.civLawData = {
    ideology: null,
    customIdeologyName: "",
    customIdeologyDesc: "",
    customEffects: {},
    laws: [],
    rights: DEFAULT_RIGHTS.map(function(r){ return r.id; }),
    punishments: {
      treason:   "Tử Hình",
      theft:     "Cắt Tay",
      murder:    "Chung Thân",
      desertion: "Lưu Đày"
    },
    lawCount: 0
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.civLawData)); } catch(e) {}
  }
  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.civLawData = Object.assign(window.civLawData, JSON.parse(d));
    } catch(e) {}
  }

  // ─── PUBLIC API ────────────────────────────────────────────────

  window.cl58SetIdeology = function(ideologyId, customName, customDesc) {
    var ideo = IDEOLOGIES.find(function(i){ return i.id === ideologyId; });
    if (!ideo) return { ok: false, msg: "Hệ tư tưởng không hợp lệ." };
    window.civLawData.ideology = ideologyId;
    if (ideologyId === "custom") {
      window.civLawData.customIdeologyName = customName || "Đường Lối Riêng";
      window.civLawData.customIdeologyDesc = customDesc || "";
    }
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: window.year || 1, type: "ideology", title: ideo.icon + " Tư Tưởng: " + ideo.name, color: "#c084fc" });
    }
    if (typeof window.ch58RecordEvent === "function") {
      window.ch58RecordEvent("ideology", "Áp Dụng " + ideo.name, ideo.desc, 30);
    }
    save();
    return { ok: true, msg: "✅ Hệ tư tưởng " + ideo.icon + " " + ideo.name + " đã được áp dụng." };
  };

  window.cl58EnactLaw = function(name, categoryId, desc, effectDesc) {
    if (!name || !name.trim()) return { ok: false, msg: "Tên luật không được để trống." };
    var cat = LAW_CATEGORIES.find(function(c){ return c.id === categoryId; }) || LAW_CATEGORIES[0];
    var law = {
      id: "law_" + Date.now(),
      name: name.trim(),
      category: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      desc: desc || "",
      effect: effectDesc || "",
      year: window.year || 1
    };
    window.civLawData.laws.push(law);
    window.civLawData.lawCount++;
    if (typeof window.ch58UpdateInfluence === "function") window.ch58UpdateInfluence("military", 1);
    save();
    return { ok: true, msg: "✅ Ban hành luật: " + cat.icon + " " + name };
  };

  window.cl58RepealLaw = function(lawId) {
    var idx = window.civLawData.laws.findIndex(function(l){ return l.id === lawId; });
    if (idx === -1) return { ok: false, msg: "Không tìm thấy luật." };
    var name = window.civLawData.laws[idx].name;
    window.civLawData.laws.splice(idx, 1);
    save();
    return { ok: true, msg: "✅ Bãi bỏ luật: " + name };
  };

  window.cl58AddRight = function(name, desc) {
    if (!name || !name.trim()) return { ok: false, msg: "Tên quyền không được để trống." };
    var rightId = "right_" + Date.now();
    DEFAULT_RIGHTS.push({ id: rightId, name: name.trim(), desc: desc || "" });
    window.civLawData.rights.push(rightId);
    save();
    return { ok: true, msg: "✅ Thêm quyền công dân: " + name };
  };

  window.cl58SetPunishment = function(crime, punishment) {
    window.civLawData.punishments[crime] = punishment;
    save();
    return { ok: true, msg: "✅ [" + crime + "] → " + punishment };
  };

  window.cl58GetIdeologies = function() { return IDEOLOGIES; };
  window.cl58GetCategories = function() { return LAW_CATEGORIES; };
  window.cl58GetDefaultRights = function() { return DEFAULT_RIGHTS; };

  window.cl58GetCurrentIdeology = function() {
    if (!window.civLawData.ideology) return null;
    if (window.civLawData.ideology === "custom") {
      return { id:"custom", name: window.civLawData.customIdeologyName || "Tùy Chỉnh", icon:"✏️",
               desc: window.civLawData.customIdeologyDesc, effects: window.civLawData.customEffects };
    }
    return IDEOLOGIES.find(function(i){ return i.id === window.civLawData.ideology; }) || null;
  };

  window.cl58GetEffects = function() {
    var ideo = window.cl58GetCurrentIdeology();
    return ideo ? (ideo.effects || {}) : {};
  };

  window.cl58GetStats = function() {
    return {
      hasIdeology: !!window.civLawData.ideology,
      ideologyName: window.civLawData.ideology ? (window.cl58GetCurrentIdeology() || {}).name : "Chưa chọn",
      lawCount: window.civLawData.laws.length,
      rightCount: window.civLawData.rights.length,
      punishmentCount: Object.keys(window.civLawData.punishments).length
    };
  };

  // ─── INIT ────────────────────────────────────────────────────
  function init() {
    load();
    console.log("[CivLawIdeologyV58] ⚖️ Luật & Tư Tưởng V58 — " + IDEOLOGIES.length + " hệ tư tưởng · " + LAW_CATEGORIES.length + " danh mục luật · Quyền công dân · Hình phạt sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, INIT_DELAY); });
  } else {
    setTimeout(init, INIT_DELAY);
  }
})();
