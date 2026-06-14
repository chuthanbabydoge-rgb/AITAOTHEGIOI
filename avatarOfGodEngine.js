(function () {
  "use strict";
  const SAVE_KEY = "cgv6_avatar_god_v71";

  const AVATAR_FORMS = [
    { id: "human",   name: "Hình Người",          icon: "🧑", desc: "Thân người — gần gũi, có thể nhầm lẫn là người thường", aura: "#c084fc", power: 50 },
    { id: "angel",   name: "Thiên Sứ",             icon: "👼", desc: "Cánh vàng, ánh sáng thánh thiện — kẻ thù của bóng tối", aura: "#fcd34d", power: 75 },
    { id: "dragon",  name: "Rồng Thần",             icon: "🐉", desc: "Thân rồng khổng lồ — biểu tượng quyền năng tuyệt đối", aura: "#ef4444", power: 100 },
    { id: "light",   name: "Thực Thể Ánh Sáng",    icon: "✨", desc: "Thuần năng lượng — không hình thể, vô hạn", aura: "#f0f9ff", power: 90 },
    { id: "hologram",name: "Hologram",              icon: "🌀", desc: "Hình chiếu kỹ thuật số — vừa hiện đại vừa huyền bí", aura: "#00f5ff", power: 70 },
    { id: "custom",  name: "Tùy Chỉnh",             icon: "⚡", desc: "Hình dạng do người tạo ra chọn", aura: "#a855f7", power: 80 },
  ];

  const PRESENCE_STATES = {
    absent:   { id: "absent",   name: "Vắng Mặt",       icon: "👁️", desc: "Thần chưa hiện diện" },
    watching: { id: "watching", name: "Đang Quan Sát",   icon: "👀", desc: "Thần quan sát từ xa" },
    present:  { id: "present",  name: "Hiện Diện",       icon: "✨", desc: "Thần đang có mặt trong thế giới" },
    active:   { id: "active",   name: "Đang Can Thiệp",  icon: "⚡", desc: "Thần đang thực thi ý chí" },
  };

  window.avatarGodV71Data = {
    version: "V71",
    initialized: false,
    selectedForm: "human",
    customFormName: "",
    customFormIcon: "⚡",
    presenceState: "absent",
    presenceLocation: null,
    presenceRegion: null,
    divineEnergy: 1000,
    maxDivineEnergy: 1000,
    energyRegen: 5,
    totalAppearances: 0,
    totalFollowers: 0,
    totalCults: 0,
    godTitle: "Đấng Sáng Thế",
    godName: "",
    appearanceLog: [],
    activeEffects: [],
    settings: {
      auraVisible: true,
      npcReactionEnabled: true,
      legacyRecordEnabled: true,
      autoJarvis: true,
    },
    stats: {
      totalZaps: 0,
      totalBlessings: 0,
      totalAppearances: 0,
      npcsFeared: 0,
      npcsConverted: 0,
      religionsCreated: 0,
      legendsCreated: 0,
    },
  };

  const D = window.avatarGodV71Data;

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        selectedForm: D.selectedForm,
        customFormName: D.customFormName,
        customFormIcon: D.customFormIcon,
        presenceState: D.presenceState,
        divineEnergy: D.divineEnergy,
        godTitle: D.godTitle,
        godName: D.godName,
        appearanceLog: D.appearanceLog.slice(-30),
        totalFollowers: D.totalFollowers,
        totalCults: D.totalCults,
        totalAppearances: D.totalAppearances,
        stats: D.stats,
        settings: D.settings,
      }));
    } catch (e) {}
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        Object.assign(D, p);
      }
    } catch (e) {}
  }

  window.avg71GetForms = function () { return AVATAR_FORMS.slice(); };
  window.avg71GetForm = function (id) { return AVATAR_FORMS.find(function (f) { return f.id === (id || D.selectedForm); }) || AVATAR_FORMS[0]; };
  window.avg71GetPresenceStates = function () { return Object.values(PRESENCE_STATES); };
  window.avg71GetPresenceState = function () { return PRESENCE_STATES[D.presenceState] || PRESENCE_STATES.absent; };
  window.avg71GetData = function () { return D; };

  window.avg71SelectForm = function (formId) {
    const form = AVATAR_FORMS.find(function (f) { return f.id === formId; });
    if (!form) return false;
    D.selectedForm = formId;
    logAppearance("Chọn hình thức: " + form.icon + " " + form.name);
    save();
    return true;
  };

  window.avg71SetCustomForm = function (name, icon) {
    D.selectedForm = "custom";
    D.customFormName = name || "Thực Thể Vô Danh";
    D.customFormIcon = icon || "⚡";
    save();
  };

  window.avg71SetPresence = function (state, location) {
    D.presenceState = state;
    if (location) D.presenceLocation = location;
    save();
  };

  window.avg71SetGodName = function (name, title) {
    if (name) D.godName = name;
    if (title) D.godTitle = title;
    save();
  };

  window.avg71GetDisplayName = function () {
    const form = window.avg71GetForm();
    const name = D.godName || D.godTitle || "Đấng Sáng Thế";
    return form.icon + " " + name;
  };

  window.avg71SpendEnergy = function (amount) {
    if (D.divineEnergy < amount) return false;
    D.divineEnergy = Math.max(0, D.divineEnergy - amount);
    save();
    return true;
  };

  window.avg71RegenEnergy = function () {
    const believers = D.totalFollowers;
    const base = D.energyRegen;
    const bonus = Math.floor(believers / 5);
    D.divineEnergy = Math.min(D.maxDivineEnergy, D.divineEnergy + base + bonus);
  };

  function logAppearance(msg) {
    D.appearanceLog.push({ year: window.year || 0, msg, ts: Date.now() });
    if (D.appearanceLog.length > 50) D.appearanceLog = D.appearanceLog.slice(-50);
  }

  window.avg71LogAppearance = logAppearance;

  window.avg71GetJarvisComment = function () {
    const form = window.avg71GetForm();
    const state = window.avg71GetPresenceState();
    const year = window.year || 1;
    const followers = D.totalFollowers;
    const cults = D.totalCults;
    const comments = {
      absent: "Ngươi chưa hiện thân. Thế giới đang chờ đợi sự xuất hiện của " + (D.godName || "Đấng Sáng Thế") + ".",
      watching: "Ngươi đang quan sát trong im lặng. " + (window.npcs || []).filter(function (n) { return n.status === "alive"; }).length + " sinh linh sống trong vô minh.",
      present: form.icon + " " + (D.godName || "Đấng Sáng Thế") + " đang hiện diện tại " + (D.presenceLocation || "thế giới") + " — Năm " + year + ". " + followers + " môn đồ đang cầu nguyện.",
      active: "⚡ Năng lượng thần linh đang chạy qua thế giới. " + cults + " giáo phái đang truyền bá ý chí của ngươi.",
    };
    return comments[D.presenceState] || "Đấng Sáng Thế im lặng.";
  };

  window.avg71GetStats = function () { return Object.assign({}, D.stats); };

  function init() {
    load();
    D.initialized = true;
    const world = window.world;
    if (world && world.name && !D.godName) {
      D.godTitle = "Đấng Sáng Thế của " + world.name;
    }
    save();
    console.log("[avatarOfGodEngine V71] 👁️ Avatar of God Engine khởi động — 6 hình thức · Thần Hiện Diện · 1000 Thần Năng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 16900); });
  } else {
    setTimeout(init, 16900);
  }
})();
