(function() {
  "use strict";
  const SAVE_KEY = "cgv6_creator_reputation_v57";

  const CREATOR_REP_TIERS = [
    { min: 0,     name: "Vô Danh",           icon: "⚫", color: "#475569" },
    { min: 100,   name: "Người Mới Nổi",     icon: "🟤", color: "#92400e" },
    { min: 500,   name: "Sáng Tạo Viên",     icon: "🔵", color: "#3b82f6" },
    { min: 2000,  name: "Nghệ Nhân Lành Nghề",icon:"🟢", color: "#22c55e" },
    { min: 8000,  name: "Bậc Thầy Sáng Tạo", icon: "🟣", color: "#a855f7" },
    { min: 25000, name: "Huyền Thoại Sáng Tạo",icon:"🟡",color: "#eab308" },
    { min: 100000,name: "Không Tử Tạo Hóa",  icon: "⭐", color: "#fde68a" }
  ];

  const REP_SOURCES = [
    { id: "content_created",  name: "Tạo Nội Dung",     perUse: 10 },
    { id: "content_rated",    name: "Nhận Đánh Giá",     perUse: 5  },
    { id: "template_shared",  name: "Chia Sẻ Template",  perUse: 30 },
    { id: "content_imported", name: "Nội Dung Được Dùng",perUse: 20 },
    { id: "milestone_reached",name: "Đạt Cột Mốc",       perUse: 100}
  ];

  window.creatorRepData = {
    totalReputation: 0,
    tierName: "Vô Danh",
    tierIcon: "⚫",
    tierColor: "#475569",
    tierRank: 0,
    repHistory: [],
    contentRatings: {},
    monthlyRep: 0,
    topContent: [],
    version: "V57"
  };

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.creatorRepData)); } catch(e) {} }
  function load() {
    try { var d = localStorage.getItem(SAVE_KEY); if (d) Object.assign(window.creatorRepData, JSON.parse(d)); } catch(e) {}
  }

  function getYear() { return (typeof window.year === "number") ? window.year : 0; }

  function updateTier() {
    var rep = window.creatorRepData.totalReputation;
    var tier = CREATOR_REP_TIERS[0];
    for (var i = CREATOR_REP_TIERS.length - 1; i >= 0; i--) {
      if (rep >= CREATOR_REP_TIERS[i].min) { tier = CREATOR_REP_TIERS[i]; break; }
    }
    var changed = tier.name !== window.creatorRepData.tierName;
    window.creatorRepData.tierName = tier.name;
    window.creatorRepData.tierIcon = tier.icon;
    window.creatorRepData.tierColor = tier.color;
    window.creatorRepData.tierRank = CREATOR_REP_TIERS.indexOf(tier);
    if (changed && typeof window.waeAddAlert === "function") {
      window.waeAddAlert("🌟 Creator Reputation: " + tier.icon + " " + tier.name);
    }
  }

  window.crs57AddReputation = function(amount, source) {
    window.creatorRepData.totalReputation += Math.max(0, amount);
    window.creatorRepData.monthlyRep += Math.max(0, amount);
    window.creatorRepData.repHistory.unshift({ year: getYear(), amount: amount, source: source || "Hành Động" });
    if (window.creatorRepData.repHistory.length > 100) window.creatorRepData.repHistory.length = 100;
    updateTier();
    save();
  };

  window.crs57RateContent = function(contentId, contentName, rating) {
    rating = Math.min(5, Math.max(1, rating));
    window.creatorRepData.contentRatings[contentId] = rating;
    var repGain = rating * 5;
    window.crs57AddReputation(repGain, "Đánh Giá: " + contentName);
    var existing = window.creatorRepData.topContent.find(function(c) { return c.id === contentId; });
    if (!existing) {
      window.creatorRepData.topContent.push({ id: contentId, name: contentName, rating: rating, count: 1 });
    } else {
      existing.count++;
      existing.rating = ((existing.rating * (existing.count - 1)) + rating) / existing.count;
    }
    window.creatorRepData.topContent.sort(function(a, b) { return b.rating - a.rating; });
    if (window.creatorRepData.topContent.length > 20) window.creatorRepData.topContent.length = 20;
    save();
  };

  window.crs57GetStats = function() {
    return {
      totalRep: window.creatorRepData.totalReputation,
      tierName: window.creatorRepData.tierName,
      tierIcon: window.creatorRepData.tierIcon,
      tierColor: window.creatorRepData.tierColor,
      tierRank: window.creatorRepData.tierRank,
      monthlyRep: window.creatorRepData.monthlyRep,
      topContent: window.creatorRepData.topContent.slice(0, 5),
      repHistory: window.creatorRepData.repHistory.slice(0, 10),
      nextTierAt: (function() {
        var next = CREATOR_REP_TIERS[Math.min(window.creatorRepData.tierRank + 1, CREATOR_REP_TIERS.length - 1)];
        return next.min;
      })()
    };
  };
  window.crs57GetTiers = function() { return CREATOR_REP_TIERS; };

  function init() {
    load();
    updateTier();
    save();
    console.log("[CreatorReputationSystemV57] 🌟 Danh Tiếng Creator V57 — 7 cấp · " + window.creatorRepData.tierIcon + " " + window.creatorRepData.tierName + " · " + window.creatorRepData.totalReputation + " điểm · Khác V28 playerReputation sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 9900); });
  } else { setTimeout(init, 9900); }
})();
