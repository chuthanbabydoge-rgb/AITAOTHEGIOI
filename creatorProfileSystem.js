(function() {
  "use strict";
  const SAVE_KEY = "cgv6_creator_profile_v57";

  const CREATOR_RANKS = [
    { rank: 0, name: "Người Tập Sự",    icon: "⚫", minCP: 0,      perks: [] },
    { rank: 1, name: "Người Sáng Tạo",  icon: "🟤", minCP: 500,    perks: ["unlock_content_sharing"] },
    { rank: 2, name: "Nhà Thiết Kế",    icon: "🔵", minCP: 2000,   perks: ["unlock_templates", "bonus_income_10"] },
    { rank: 3, name: "Kiến Trúc Sư",    icon: "🟣", minCP: 8000,   perks: ["unlock_world_forge", "bonus_income_25"] },
    { rank: 4, name: "Đại Sáng Thế Chủ",icon: "🟡", minCP: 25000,  perks: ["unlock_multiverse_share", "bonus_income_50"] },
    { rank: 5, name: "Hóa Thân Tạo Hóa",icon: "⭐", minCP: 100000, perks: ["all_unlocked", "bonus_income_100"] }
  ];

  const CREATOR_TITLES = [
    "Bàn Tay Vàng", "Thợ Rèn Thế Giới", "Họa Sĩ Thần Thánh",
    "Kiến Trúc Sư Vũ Trụ", "Nghệ Nhân Huyền Thoại",
    "Chúa Tể Sáng Tạo", "Đấng Tạo Hóa Tối Cao"
  ];

  window.creatorProfileData = {
    id: "creator_" + Math.random().toString(36).substr(2, 8),
    displayName: "Đấng Tạo Hóa",
    title: "Người Tập Sự",
    rank: 0, rankName: "Người Tập Sự", rankIcon: "⚫",
    bio: "",
    joinedYear: 0,
    specialization: [],
    unlockedPerks: [],
    contentShowcase: [],
    followers: 0,
    following: 0,
    totalCreations: 0,
    totalUsages: 0,
    version: "V57"
  };

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.creatorProfileData)); } catch(e) {} }
  function load() {
    try { var d = localStorage.getItem(SAVE_KEY); if (d) Object.assign(window.creatorProfileData, JSON.parse(d)); } catch(e) {}
  }

  function updateRank() {
    var cp = (typeof window.creatorEconData !== "undefined") ? window.creatorEconData.totalCPEarned : 0;
    var rank = CREATOR_RANKS[0];
    for (var i = CREATOR_RANKS.length - 1; i >= 0; i--) {
      if (cp >= CREATOR_RANKS[i].minCP) { rank = CREATOR_RANKS[i]; break; }
    }
    if (rank.rank !== window.creatorProfileData.rank) {
      window.creatorProfileData.rank = rank.rank;
      window.creatorProfileData.rankName = rank.name;
      window.creatorProfileData.rankIcon = rank.icon;
      window.creatorProfileData.unlockedPerks = rank.perks;
      if (typeof window.waeAddAlert === "function") window.waeAddAlert("⭐ Creator Rank mới: " + rank.icon + " " + rank.name);
      save();
    }
  }

  window.cps57SetName = function(name) { window.creatorProfileData.displayName = name || "Đấng Tạo Hóa"; save(); };
  window.cps57SetBio = function(bio) { window.creatorProfileData.bio = bio || ""; save(); };
  window.cps57SetTitle = function(idx) {
    var t = CREATOR_TITLES[Math.min(idx || 0, CREATOR_TITLES.length - 1)];
    window.creatorProfileData.title = t;
    save();
  };
  window.cps57SetSpecialization = function(specs) {
    window.creatorProfileData.specialization = Array.isArray(specs) ? specs.slice(0, 3) : [];
    save();
  };
  window.cps57AddToShowcase = function(contentId, contentName, contentType, icon) {
    window.creatorProfileData.contentShowcase.unshift({ id: contentId, name: contentName, type: contentType, icon: icon, year: (typeof window.year === "number" ? window.year : 0) });
    if (window.creatorProfileData.contentShowcase.length > 10) window.creatorProfileData.contentShowcase.length = 10;
    save();
  };

  window.cps57GetProfile = function() { return window.creatorProfileData; };
  window.cps57GetRanks = function() { return CREATOR_RANKS; };
  window.cps57GetTitles = function() { return CREATOR_TITLES; };
  window.cps57SyncWithEcon = function() {
    if (typeof window.creatorEconData !== "undefined") {
      var total = Object.values(window.creatorEconData.contentCreated).reduce(function(s, v) { return s + v; }, 0);
      window.creatorProfileData.totalCreations = total;
      window.creatorProfileData.totalUsages = window.creatorEconData.contentUsageTotal;
    }
    updateRank();
    save();
  };
  window.cps57GetRankProgress = function() {
    var cp = (typeof window.creatorEconData !== "undefined") ? window.creatorEconData.totalCPEarned : 0;
    var cur = CREATOR_RANKS[window.creatorProfileData.rank];
    var next = CREATOR_RANKS[Math.min(window.creatorProfileData.rank + 1, CREATOR_RANKS.length - 1)];
    if (cur.rank === next.rank) return 100;
    return Math.min(100, Math.round((cp - cur.minCP) / (next.minCP - cur.minCP) * 100));
  };

  function init() {
    load();
    if (!window.creatorProfileData.joinedYear) {
      window.creatorProfileData.joinedYear = (typeof window.year === "number") ? window.year : 0;
    }
    setInterval(function() { if (typeof window.cps57SyncWithEcon === "function") window.cps57SyncWithEcon(); }, 10000);
    save();
    console.log("[CreatorProfileSystem V57] 👤 Hồ Sơ Sáng Tạo — 6 cấp bậc · " + window.creatorProfileData.rankIcon + " " + window.creatorProfileData.rankName + " · " + window.creatorProfileData.totalCreations + " nội dung sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 9600); });
  } else { setTimeout(init, 9600); }
})();
