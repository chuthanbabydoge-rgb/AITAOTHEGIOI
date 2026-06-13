(function() {
  "use strict";
  const SAVE_KEY = "cgv6_creator_reward_v57";

  const CREATOR_MILESTONES = [
    { id: "first_content",   name: "🌱 Nội Dung Đầu Tiên",  cp: 100,   desc: "Tạo nội dung đầu tiên",         check: function() { return window.creatorEconData && window.creatorEconData.totalCPEarned >= 50; } },
    { id: "ten_contents",    name: "📦 Kho Nội Dung",        cp: 500,   desc: "Tạo 10 nội dung",               check: function() { var s = window.ce57GetStats && window.ce57GetStats(); return s && s.totalContent >= 10; } },
    { id: "first_template",  name: "🗂️ Template Đầu Tiên",  cp: 300,   desc: "Lưu template vũ trụ đầu tiên",  check: function() { return window.universeTemplateData && window.universeTemplateData.savedTemplates.length >= 1; } },
    { id: "share_content",   name: "🌐 Chia Sẻ Cộng Đồng",  cp: 400,   desc: "Chia sẻ nội dung lần đầu",      check: function() { return window.contentRegV57Data && window.contentRegV57Data.sharedContents.length >= 1; } },
    { id: "rep_500",         name: "⭐ Uy Tín Nổi Bật",      cp: 600,   desc: "Đạt 500 điểm danh tiếng",       check: function() { return window.creatorRepData && window.creatorRepData.totalReputation >= 500; } },
    { id: "fifty_contents",  name: "🏛️ Kho Lưu Trữ",        cp: 2000,  desc: "Tạo 50 nội dung",               check: function() { var s = window.ce57GetStats && window.ce57GetStats(); return s && s.totalContent >= 50; } },
    { id: "world_god",       name: "🌍 Thần Tạo Thế",        cp: 5000,  desc: "Tạo thế giới hoàn chỉnh",       check: function() { return window.creatorEconData && (window.creatorEconData.contentCreated["world"] || 0) >= 1; } },
    { id: "five_templates",  name: "📚 Thư Viện Template",   cp: 1500,  desc: "Lưu 5 template",                check: function() { return window.universeTemplateData && window.universeTemplateData.savedTemplates.length >= 5; } },
    { id: "rep_5000",        name: "🏆 Bậc Thầy Danh Tiếng", cp: 3000,  desc: "Đạt 5000 điểm danh tiếng",      check: function() { return window.creatorRepData && window.creatorRepData.totalReputation >= 5000; } },
    { id: "cp_10000",        name: "💰 Tỷ Phú CP",           cp: 5000,  desc: "Tích lũy 10,000 CP",            check: function() { return window.creatorEconData && window.creatorEconData.totalCPEarned >= 10000; } },
    { id: "all_types",       name: "🎨 Nghệ Nhân Toàn Năng", cp: 8000,  desc: "Tạo mỗi loại nội dung ít nhất 1", check: function() {
      if (!window.creatorEconData || !window.creatorEconData.contentCreated) return false;
      var types = ["race","religion","hero","city","item","event","world"];
      return types.every(function(t) { return (window.creatorEconData.contentCreated[t] || 0) >= 1; });
    }},
    { id: "legendary_creator",name:"🌌 Huyền Thoại Sáng Tạo",cp:20000, desc: "Đạt rank Kiến Trúc Sư",         check: function() { return window.creatorProfileData && window.creatorProfileData.rank >= 3; } }
  ];

  const JARVIS_SUGGESTIONS = [
    { trigger: "low_content",   icon: "💡", msg: "Tạo thêm Chủng Tộc để đa dạng hóa thế giới · Mỗi chủng tộc mang lại 50 CP" },
    { trigger: "no_religion",   icon: "⛪", msg: "Thế giới chưa có tôn giáo · Tôn giáo tạo ra ảnh hưởng sâu rộng và 80 CP" },
    { trigger: "no_hero",       icon: "🦸", msg: "Thiếu anh hùng truyền thuyết · Anh hùng tạo ra 60 CP và nâng danh tiếng" },
    { trigger: "no_template",   icon: "🗂️", msg: "Lưu template thế giới hiện tại · Có thể dùng lại hoặc chia sẻ sau" },
    { trigger: "high_rep",      icon: "🌟", msg: "Danh tiếng cao! Chia sẻ nội dung của bạn để tăng thu nhập thụ động" },
    { trigger: "many_conflicts",icon: "⚖️", msg: "Phát hiện xung đột dữ liệu · Kiểm tra balance giữa các thế lực" },
    { trigger: "idle",          icon: "⚡", msg: "Tạo Sự Kiện đặc biệt để kích thích thế giới · Sự kiện mang lại 70 CP" }
  ];

  window.creatorRewardData = {
    unlockedMilestones: [],
    totalCPFromRewards: 0,
    jarvisLog: [],
    lastJarvisSuggestion: "",
    streakDays: 0,
    version: "V57"
  };

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.creatorRewardData)); } catch(e) {} }
  function load() {
    try { var d = localStorage.getItem(SAVE_KEY); if (d) Object.assign(window.creatorRewardData, JSON.parse(d)); } catch(e) {}
  }

  function getYear() { return (typeof window.year === "number") ? window.year : 0; }

  window.cre57CheckMilestones = function() {
    var newUnlocked = [];
    CREATOR_MILESTONES.forEach(function(m) {
      if (window.creatorRewardData.unlockedMilestones.includes(m.id)) return;
      try {
        if (m.check()) {
          window.creatorRewardData.unlockedMilestones.push(m.id);
          window.creatorRewardData.totalCPFromRewards += m.cp;
          if (typeof window.creatorEconData !== "undefined") window.creatorEconData.creatorPoints += m.cp;
          if (typeof window.crs57AddReputation === "function") window.crs57AddReputation(50, "Đạt Cột Mốc: " + m.name);
          newUnlocked.push(m);
          if (typeof window.waeAddAlert === "function") window.waeAddAlert("🏆 " + m.name + " · +" + m.cp + " CP");
          if (typeof window.hrs55RecordEvent === "function") {
            window.hrs55RecordEvent({ category: "milestone", icon: "🏆", title: m.name, detail: m.desc, importance: 3 });
          }
        }
      } catch(e) {}
    });
    if (newUnlocked.length > 0) save();
    return newUnlocked;
  };

  window.cre57GetJarvisSuggestion = function() {
    var suggestions = [];
    if (typeof window.ce57GetStats === "function") {
      var stats = window.ce57GetStats();
      if (stats.totalContent < 5) suggestions.push(JARVIS_SUGGESTIONS[0]);
      if ((stats.breakdown["religion"] || 0) === 0) suggestions.push(JARVIS_SUGGESTIONS[1]);
      if ((stats.breakdown["hero"] || 0) === 0) suggestions.push(JARVIS_SUGGESTIONS[2]);
    }
    if (typeof window.universeTemplateData !== "undefined" && window.universeTemplateData.savedTemplates.length === 0) {
      suggestions.push(JARVIS_SUGGESTIONS[3]);
    }
    if (typeof window.creatorRepData !== "undefined" && window.creatorRepData.totalReputation >= 500) {
      suggestions.push(JARVIS_SUGGESTIONS[4]);
    }
    if (typeof window.warsActive !== "undefined" && window.warsActive.length > 5) {
      suggestions.push(JARVIS_SUGGESTIONS[5]);
    }
    if (suggestions.length === 0) suggestions.push(JARVIS_SUGGESTIONS[6]);
    var picked = suggestions[Math.floor(Math.random() * suggestions.length)];
    window.creatorRewardData.lastJarvisSuggestion = picked.msg;
    window.creatorRewardData.jarvisLog.unshift({ year: getYear(), icon: picked.icon, msg: picked.msg });
    if (window.creatorRewardData.jarvisLog.length > 20) window.creatorRewardData.jarvisLog.length = 20;
    save();
    return picked;
  };

  window.cre57GetMilestones = function() {
    return CREATOR_MILESTONES.map(function(m) {
      return Object.assign({}, m, {
        unlocked: window.creatorRewardData.unlockedMilestones.includes(m.id),
        check: undefined
      });
    });
  };

  window.cre57GetStats = function() {
    return {
      unlockedCount: window.creatorRewardData.unlockedMilestones.length,
      totalMilestones: CREATOR_MILESTONES.length,
      totalCPFromRewards: window.creatorRewardData.totalCPFromRewards,
      jarvisLogs: window.creatorRewardData.jarvisLog.slice(0, 5),
      lastSuggestion: window.creatorRewardData.lastJarvisSuggestion
    };
  };

  function rewardTick() {
    if (typeof window.cre57CheckMilestones === "function") window.cre57CheckMilestones();
  }

  window.creatorRewardV57Tick = function() {
    if (!window.creatorRewardData._tick) window.creatorRewardData._tick = 0;
    window.creatorRewardData._tick++;
    if (window.creatorRewardData._tick % 200 === 0) rewardTick();
  };

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); window.creatorRewardV57Tick(); };
    setTimeout(function() { window.cre57CheckMilestones(); }, 5000);
    save();
    console.log("[CreatorRewardEngineV57] 🏆 Phần Thưởng Creator V57 — " + CREATOR_MILESTONES.length + " cột mốc · " + window.creatorRewardData.unlockedMilestones.length + " đã đạt · Jarvis Creator Mode · +" + window.creatorRewardData.totalCPFromRewards + " CP từ rewards sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 10000); });
  } else { setTimeout(init, 10000); }
})();
