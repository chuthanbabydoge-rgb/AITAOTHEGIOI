(function() {
  "use strict";
  const SAVE_KEY = "cgv6_cx_diplomacy_v56";

  const TREATY_TYPES = [
    { id: "nonAggression", name: "📜 Hiệp Ước Bất Xâm Phạm", cost: 1000,  rep: 10, duration: 200, effect: "Không tấn công nhau" },
    { id: "trade",         name: "💹 Hiệp Ước Thương Mại",   cost: 5000,  rep: 20, duration: 300, effect: "+30% thu nhập thương mại" },
    { id: "alliance",      name: "🤝 Liên Minh Chiến Lược",  cost: 20000, rep: 50, duration: 500, effect: "Hỗ trợ quân sự · Chia sẻ thông tin" },
    { id: "federation",    name: "⭐ Liên Bang Vũ Trụ",       cost: 100000,rep: 100,duration: 1000,effect: "Chính phủ chung · Nguồn lực hợp nhất" },
    { id: "vassalage",     name: "👑 Hiệp Ước Thần Phục",    cost: 0,     rep: -20,duration: 500, effect: "Đối tác trở thành chư hầu" }
  ];

  const UNIVERSE_FACTIONS = [
    { id: "fac_thien", name: "Thiên Đình Liên Minh",    icon: "⚡", power: 80, disposition: "friendly" },
    { id: "fac_mo",    name: "Ma Đạo Đế Quốc",         icon: "🔴", power: 75, disposition: "hostile" },
    { id: "fac_than",  name: "Hội Đồng Thần Linh",      icon: "✨", power: 90, disposition: "neutral" },
    { id: "fac_long",  name: "Long Tộc Liên Bang",      icon: "🐲", power: 85, disposition: "neutral" },
    { id: "fac_void",  name: "Vô Cực Hư Không",         icon: "⬛", power: 95, disposition: "hostile" },
    { id: "fac_dao",   name: "Đạo Môn Thánh Địa",       icon: "☯️", power: 70, disposition: "friendly" }
  ];

  window.diplomacyV56Data = {
    relations: {},
    treaties: [],
    proposedTreaties: [],
    diplomaticEvents: [],
    playerReputation: 0,
    version: "V56"
  };

  UNIVERSE_FACTIONS.forEach(function(f) {
    window.diplomacyV56Data.relations[f.id] = {
      factionId: f.id, name: f.name, icon: f.icon, power: f.power,
      disposition: f.disposition,
      score: f.disposition === "friendly" ? 30 : f.disposition === "hostile" ? -30 : 0,
      activeTreaty: null
    };
  });

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.diplomacyV56Data)); } catch(e) {} }
  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) {
        var parsed = JSON.parse(d);
        if (parsed.treaties) window.diplomacyV56Data.treaties = parsed.treaties;
        if (parsed.proposedTreaties) window.diplomacyV56Data.proposedTreaties = parsed.proposedTreaties;
        if (parsed.diplomaticEvents) window.diplomacyV56Data.diplomaticEvents = parsed.diplomaticEvents;
        if (parsed.playerReputation !== undefined) window.diplomacyV56Data.playerReputation = parsed.playerReputation;
        if (parsed.relations) Object.assign(window.diplomacyV56Data.relations, parsed.relations);
      }
    } catch(e) {}
  }

  function getYear() { return (typeof window.year === "number") ? window.year : 0; }

  window.dip56ProposeTreaty = function(factionId, treatyTypeId) {
    var rel = window.diplomacyV56Data.relations[factionId];
    var ttype = TREATY_TYPES.find(function(t) { return t.id === treatyTypeId; });
    if (!rel || !ttype) return { ok: false, msg: "Thế lực hoặc loại hiệp ước không hợp lệ" };

    var scoreNeeded = treatyTypeId === "federation" ? 80 : treatyTypeId === "alliance" ? 50 : treatyTypeId === "trade" ? 20 : 0;
    if (rel.score < scoreNeeded) return { ok: false, msg: "Quan hệ chưa đủ tốt (cần " + scoreNeeded + " · hiện " + rel.score + ")" };

    var successChance = Math.min(0.95, 0.3 + rel.score / 200 + window.diplomacyV56Data.playerReputation / 500);
    var success = Math.random() < successChance;

    if (success) {
      var treaty = {
        id: "treaty_" + Date.now(),
        factionId: factionId, factionName: rel.name, factionIcon: rel.icon,
        type: ttype.id, typeName: ttype.name,
        startYear: getYear(), endYear: getYear() + ttype.duration,
        effect: ttype.effect, isActive: true
      };
      window.diplomacyV56Data.treaties.push(treaty);
      rel.activeTreaty = treaty.id;
      rel.score = Math.min(100, rel.score + ttype.rep);
      window.diplomacyV56Data.playerReputation += ttype.rep;
      window.diplomacyV56Data.diplomaticEvents.unshift({ year: getYear(), icon: "🤝", msg: "Ký kết " + ttype.name + " với " + rel.name });
      if (typeof window.waeAddAlert === "function") window.waeAddAlert("🤝 Hiệp ước: " + ttype.name + " với " + rel.name);
      save();
      return { ok: true, treaty: treaty, msg: ttype.name + " với " + rel.name + " đã ký kết!" };
    } else {
      rel.score = Math.max(-100, rel.score - 5);
      window.diplomacyV56Data.diplomaticEvents.unshift({ year: getYear(), icon: "❌", msg: rel.name + " từ chối " + ttype.name });
      save();
      return { ok: false, msg: rel.name + " đã từ chối hiệp ước." };
    }
  };

  window.dip56ImproveRelation = function(factionId, amount) {
    var rel = window.diplomacyV56Data.relations[factionId];
    if (!rel) return;
    rel.score = Math.min(100, rel.score + (amount || 5));
    save();
  };

  window.dip56DeclareHostility = function(factionId) {
    var rel = window.diplomacyV56Data.relations[factionId];
    if (!rel) return { ok: false, msg: "Thế lực không tồn tại" };
    rel.score = Math.max(-100, rel.score - 30);
    rel.disposition = "hostile";
    if (rel.activeTreaty) {
      window.diplomacyV56Data.treaties = window.diplomacyV56Data.treaties.map(function(t) {
        if (t.id === rel.activeTreaty) { t.isActive = false; } return t;
      });
      rel.activeTreaty = null;
    }
    window.diplomacyV56Data.diplomaticEvents.unshift({ year: getYear(), icon: "⚔️", msg: "Tuyên chiến với " + rel.name });
    save();
    return { ok: true, msg: "⚔️ Đã tuyên bố thù địch với " + rel.name };
  };

  window.dip56GetRelations = function() { return Object.values(window.diplomacyV56Data.relations); };
  window.dip56GetTreaties = function() { return window.diplomacyV56Data.treaties.filter(function(t) { return t.isActive; }); };
  window.dip56GetStats = function() {
    var rels = Object.values(window.diplomacyV56Data.relations);
    return {
      friendly: rels.filter(function(r) { return r.score >= 30; }).length,
      neutral: rels.filter(function(r) { return r.score >= -29 && r.score < 30; }).length,
      hostile: rels.filter(function(r) { return r.score < -29; }).length,
      activeTreaties: window.diplomacyV56Data.treaties.filter(function(t) { return t.isActive; }).length,
      reputation: window.diplomacyV56Data.playerReputation
    };
  };
  window.dip56GetJarvisReport = function() {
    var s = window.dip56GetStats();
    return "🌐 **Ngoại Giao Đa Vũ Trụ V56**\n" +
      "🟢 Thân Thiện: " + s.friendly + " thế lực\n" +
      "🟡 Trung Lập: " + s.neutral + " thế lực\n" +
      "🔴 Thù Địch: " + s.hostile + " thế lực\n" +
      "📜 Hiệp Ước Đang Có: " + s.activeTreaties + "\n" +
      "⭐ Danh Tiếng: " + s.reputation + " điểm";
  };

  function tickDiplomacy() {
    var yr = getYear();
    Object.values(window.diplomacyV56Data.relations).forEach(function(rel) {
      if (rel.disposition === "hostile" && rel.score < -50 && Math.random() < 0.002) {
        window.diplomacyV56Data.diplomaticEvents.unshift({ year: yr, icon: "⚔️", msg: rel.name + " phát động tấn công!" });
        if (typeof window.waeAddAlert === "function") window.waeAddAlert("⚔️ " + rel.name + " tấn công thuộc địa của bạn!");
      }
      rel.score = Math.max(-100, Math.min(100, rel.score + (Math.random() * 0.2 - 0.1)));
    });
    window.diplomacyV56Data.treaties.forEach(function(t) {
      if (t.isActive && t.endYear && yr >= t.endYear) {
        t.isActive = false;
        var rel = window.diplomacyV56Data.relations[t.factionId];
        if (rel) rel.activeTreaty = null;
        window.diplomacyV56Data.diplomaticEvents.unshift({ year: yr, icon: "📋", msg: "Hiệp ước " + t.typeName + " với " + t.factionName + " đã hết hạn" });
      }
    });
    if (window.diplomacyV56Data.diplomaticEvents.length > 50) window.diplomacyV56Data.diplomaticEvents.length = 50;
  }

  window.multiverseDiplomacyV56Tick = function() {
    if (typeof window.diplomacyV56Data._tick === "undefined") window.diplomacyV56Data._tick = 0;
    window.diplomacyV56Data._tick++;
    if (window.diplomacyV56Data._tick % 40 === 0) {
      tickDiplomacy();
      save();
    }
  };

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); window.multiverseDiplomacyV56Tick(); };
    save();
    console.log("[MultiverseDiplomacyV56] 🌐 Ngoại Giao Đa Vũ Trụ V56 — 6 thế lực · 5 loại hiệp ước · Player-facing · Khác V39 NPC alliances sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 9200); });
  } else { setTimeout(init, 9200); }
})();
