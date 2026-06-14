(function () {
  "use strict";
  const SAVE_KEY = "cgv6_divine_appearance_v71";

  const APPEARANCE_EVENTS = [
    { id: "city_descent",  name: "Giáng Thế Thành Phố",    icon: "🏙️", desc: "Thần xuất hiện giữa lòng thành phố — gây náo loạn đường phố" },
    { id: "battlefield",   name: "Thần Trên Chiến Trường",  icon: "⚔️", desc: "Thần xuất hiện khi chiến tranh — chọn bên thắng" },
    { id: "temple_reveal", name: "Thần Hiện Linh",          icon: "⛪", desc: "Thần xuất hiện trong ngôi đền đang thờ — tín đồ phát điên vì ngây ngất" },
    { id: "plague_cure",   name: "Thần Chữa Bệnh",          icon: "💊", desc: "Thần xuất hiện để chấm dứt đại dịch" },
    { id: "prophecy_wall", name: "Chữ Thần Trên Vách Đá",   icon: "📜", desc: "Thần khắc lời tiên tri lên vách núi — ai cũng có thể đọc" },
    { id: "save_hero",     name: "Cứu Anh Hùng",            icon: "🌟", desc: "Thần xuất hiện cứu một anh hùng khỏi cái chết" },
    { id: "destroy_tyrant",name: "Trừng Phạt Bạo Chúa",    icon: "⚡", desc: "Thần xuất hiện hủy diệt kẻ bạo tàn" },
    { id: "new_age",       name: "Mở Kỷ Nguyên Mới",        icon: "🌅", desc: "Thần tuyên bố một kỷ nguyên mới bắt đầu" },
  ];

  const FOLLOWER_ROLES = [
    { id: "disciple",  name: "Môn Đồ",    icon: "🙏", desc: "Theo sát Creator, học hỏi và truyền bá ý chí" },
    { id: "prophet",   name: "Ngôn Sứ",   icon: "🌟", desc: "Nhận được thiên khải, phán lời tiên tri thay Thần" },
    { id: "priest",    name: "Tư Tế",     icon: "⛪", desc: "Dẫn dắt nghi lễ thờ phụng, quản lý đền thờ" },
    { id: "guardian",  name: "Thần Vệ",   icon: "⚔️", desc: "Chiến binh bảo vệ đền thờ và tín đồ" },
    { id: "historian", name: "Sử Gia Thần",icon: "📜", desc: "Ghi chép mọi phép màu và lần hiện thân của Thần" },
  ];

  window.divineAppearanceV71Data = {
    version: "V71",
    initialized: false,
    appearanceEvents: [],
    disciples: [],
    prophets: [],
    priests: [],
    guardians: [],
    historians: [],
    templeCount: 0,
    legendCount: 0,
    legendLog: [],
    followersByRole: { disciple: 0, prophet: 0, priest: 0, guardian: 0, historian: 0 },
  };

  const D = window.divineAppearanceV71Data;

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        appearanceEvents: D.appearanceEvents.slice(-25),
        templeCount: D.templeCount,
        legendCount: D.legendCount,
        legendLog: D.legendLog.slice(-20),
        followersByRole: D.followersByRole,
        disciples: D.disciples.slice(-10),
        prophets: D.prophets.slice(-5),
      }));
    } catch (e) {}
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) Object.assign(D, JSON.parse(raw));
    } catch (e) {}
  }

  window.das71GetAppearanceTypes = function () { return APPEARANCE_EVENTS.slice(); };
  window.das71GetFollowerRoles = function () { return FOLLOWER_ROLES.slice(); };
  window.das71GetData = function () { return D; };
  window.das71GetAppearanceLog = function () { return D.appearanceEvents.slice(-20); };
  window.das71GetLegendLog = function () { return D.legendLog.slice(-15); };
  window.das71GetFollowerStats = function () { return Object.assign({}, D.followersByRole); };

  window.das71TriggerAppearance = function (eventId, opts) {
    const evType = APPEARANCE_EVENTS.find(function (e) { return e.id === eventId; }) || APPEARANCE_EVENTS[0];
    const year = window.year || 1;
    const npcs = (window.npcs || []).filter(function (n) { return n.status === "alive"; });
    const countries = window.countries || [];
    const godName = (window.avatarGodV71Data && window.avatarGodV71Data.godName) ? window.avatarGodV71Data.godName : "Đấng Sáng Thế";
    const location = (opts && opts.location) || (countries.length > 0 ? countries[Math.floor(year % countries.length)].name : "Vùng Trung Tâm");

    let narrative = "";
    let impact = {};

    if (eventId === "city_descent") {
      narrative = "🏙️ " + godName + " xuất hiện giữa " + location + ". Đường phố đình trệ. Người dân chạy tán loạn — hoặc quỳ xuống tôn thờ.";
      impact = { fearNpcs: 30, worshipNpcs: 20 };
    } else if (eventId === "battlefield") {
      const wars = window.warsActive || [];
      const war = wars[0];
      if (war) {
        narrative = "⚔️ Giữa chiến trường " + (war.name || "đại chiến") + ", " + godName + " xuất hiện. Cả hai bên đều hạ vũ khí. Chiến tranh ngừng lại.";
        impact = { warPaused: true };
      } else {
        narrative = "⚔️ " + godName + " xuất hiện trên chiến trường trống — chuẩn bị cho trận chiến sắp tới.";
      }
    } else if (eventId === "temple_reveal") {
      D.templeCount++;
      narrative = "⛪ Trong ngôi đền linh thiêng, " + godName + " hiện thân. Toàn bộ tín đồ ngất xỉu vì ngây ngất. Một ngôi đền mới được xây dựng.";
      impact = { newTemple: location };
    } else if (eventId === "plague_cure") {
      const plague = window.plagueData && window.plagueData.activePlagues ? window.plagueData.activePlagues[0] : null;
      const targetPlague = plague ? plague.name : "đại dịch không tên";
      narrative = "💊 " + godName + " xuất hiện trong vùng dịch. Ánh sáng rót xuống. " + targetPlague + " tan biến trong đêm. Dân chúng gọi đây là phép màu thiêng liêng nhất.";
      if (plague) plague.active = false;
    } else if (eventId === "prophecy_wall") {
      const prophecy = "Kẻ nào đứng vững trước bóng tối sẽ là cột trụ của trời đất mới.";
      narrative = "📜 " + godName + " khắc lời lên vách núi cao nhất: \"" + prophecy + "\" — 500 năm nữa chữ vẫn còn đó.";
    } else if (eventId === "save_hero") {
      const warriors = npcs.filter(function (n) { return n.career === "warrior" || n.career === "chiến binh" || n.power > 60; });
      const hero = warriors[Math.floor(year % Math.max(1, warriors.length))];
      narrative = hero ? "🌟 " + godName + " cứu " + hero.name + " khỏi lưỡi kiếm của kẻ thù. Từ nay " + hero.name + " mang ơn Thần và trở thành Thần Vệ." : "🌟 " + godName + " cứu một chiến binh khỏi tử thần.";
      if (hero) addFollower(hero, "guardian");
    } else if (eventId === "destroy_tyrant") {
      const tyrants = countries.filter(function (c) { return (c.stability || 50) < 30 || (c.militarism || 0) > 70; });
      const tyrant = tyrants[0];
      narrative = "⚡ " + godName + " giáng sét xuống " + (tyrant ? tyrant.name : "vương triều bạo tàn") + ". Tên bạo chúa bị thiêu rụi. Kẻ ác không còn nơi trú ẩn.";
      if (tyrant) tyrant.stability = Math.min(100, (tyrant.stability || 50) + 15);
    } else if (eventId === "new_age") {
      narrative = "🌅 " + godName + " tuyên bố: 'Kỷ nguyên cũ đã chấm dứt. Kỷ nguyên Thần Linh bắt đầu hôm nay.' — Toàn thế giới rúng động.";
      if (typeof window.htAddEvent === "function") {
        window.htAddEvent({ year, type: "age", title: "🌅 Kỷ Nguyên Thần Linh — Tuyên Bố Của Đấng Sáng Thế", color: "#fcd34d" });
      }
    }

    const entry = { year, eventId, icon: evType.icon, name: evType.name, location, narrative, ts: Date.now() };
    D.appearanceEvents.push(entry);
    if (D.appearanceEvents.length > 25) D.appearanceEvents = D.appearanceEvents.slice(-25);

    createLegend(godName, evType, location, year, narrative);

    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year, type: "divine", title: evType.icon + " " + evType.name + " tại " + location, color: "#c084fc" });
    }
    if (typeof window.mem64Record === "function") {
      window.mem64Record("divine", evType.name + " — " + location, narrative, 9, ["appearance", eventId, "avatar"]);
    }

    save();
    return { success: true, narrative, entry };
  };

  function addFollower(npc, role) {
    if (!npc) return;
    const rd = { id: npc.id || npc.name, name: npc.name, role, year: window.year || 1 };
    D.followersByRole[role] = (D.followersByRole[role] || 0) + 1;
    if (role === "guardian") D.guardians.push(rd);
    else if (role === "prophet") D.prophets.push(rd);
    else if (role === "priest") D.priests.push(rd);
    else if (role === "historian") D.historians.push(rd);
    else D.disciples.push(rd);
    if (window.avatarGodV71Data) window.avatarGodV71Data.totalFollowers++;
    if (window.divinePresenceV71Data) window.divinePresenceV71Data.activeFollowers.push(rd);
  }

  window.das71AddFollower = addFollower;

  window.das71AssignRole = function (npcIdOrName, role) {
    const npc = (window.npcs || []).find(function (n) { return n.id === npcIdOrName || n.name === npcIdOrName; });
    if (!npc) return false;
    addFollower(npc, role);
    if (typeof window.mem64Record === "function") {
      window.mem64Record("divine", FOLLOWER_ROLES.find(function (r) { return r.id === role; }).name + ": " + npc.name,
        npc.name + " được phong là " + role + " của Đấng Sáng Thế. Năm " + (window.year || 1) + ".", 7, ["follower", role]);
    }
    save();
    return true;
  };

  function createLegend(godName, evType, location, year, narrative) {
    const legendTemplates = [
      "Ngàn năm qua đi, dân " + location + " vẫn kể về ngày " + godName + " giáng thế.",
      "Truyền thuyết nói rằng ai đứng tại đây vào ngày " + year + " đã thấy " + godName + " bằng xương bằng thịt.",
      "Các bậc tiền nhân truyền lại: Thần đã đến đây một lần — và thế giới không bao giờ như trước.",
    ];
    const legend = { year, location, title: "Truyền Thuyết " + evType.name + " tại " + location, text: legendTemplates[D.legendCount % legendTemplates.length], godName };
    D.legendLog.push(legend);
    D.legendCount++;
    if (D.legendLog.length > 20) D.legendLog = D.legendLog.slice(-20);
    if (window.avatarGodV71Data) window.avatarGodV71Data.stats.legendsCreated++;
  }

  window.das71GetAllFollowers = function () {
    return {
      disciples: D.disciples.slice(),
      prophets: D.prophets.slice(),
      priests: D.priests.slice(),
      guardians: D.guardians.slice(),
      historians: D.historians.slice(),
      total: Object.values(D.followersByRole).reduce(function (a, v) { return a + v; }, 0),
    };
  };

  function init() {
    load();
    D.initialized = true;
    console.log("[divineAppearanceSystem V71] 🌟 Divine Appearance System khởi động — 8 loại xuất hiện · Môn đồ · Truyền thuyết.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 17200); });
  } else {
    setTimeout(init, 17200);
  }
})();
