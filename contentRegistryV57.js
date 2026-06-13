(function() {
  "use strict";
  const SAVE_KEY = "cgv6_content_registry_v57";

  window.contentRegV57Data = {
    contents: [],
    totalVersions: 0,
    totalImports: 0,
    totalExports: 0,
    sharedContents: [],
    tick: 0,
    version: "V57"
  };

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.contentRegV57Data)); } catch(e) {} }
  function load() {
    try { var d = localStorage.getItem(SAVE_KEY); if (d) Object.assign(window.contentRegV57Data, JSON.parse(d)); } catch(e) {}
  }

  function getYear() { return (typeof window.year === "number") ? window.year : 0; }

  window.creg57Register = function(type, name, data, creatorId) {
    var existing = window.contentRegV57Data.contents.find(function(c) { return c.name === name && c.type === type; });
    if (existing) {
      existing.versions = existing.versions || [];
      existing.versions.push({ version: existing.versions.length + 1, data: data, year: getYear() });
      if (existing.versions.length > 10) existing.versions.shift();
      existing.updatedYear = getYear();
      existing.usageCount = existing.usageCount || 0;
      window.contentRegV57Data.totalVersions++;
      save();
      return existing;
    }

    var entry = {
      id: "cnt_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      type: type, name: name,
      creatorId: creatorId || "player",
      data: data || {},
      createdYear: getYear(), updatedYear: getYear(),
      usageCount: 0, rating: 0, ratingCount: 0,
      isPublic: false, isShared: false,
      tags: [],
      versions: [{ version: 1, data: data, year: getYear() }]
    };
    window.contentRegV57Data.contents.unshift(entry);
    if (window.contentRegV57Data.contents.length > 500) window.contentRegV57Data.contents.length = 500;

    if (typeof window.ce57RecordCreation === "function") window.ce57RecordCreation(type, name, creatorId);
    if (typeof window.hrs55RecordEvent === "function") {
      window.hrs55RecordEvent({ category: "content", icon: "📝", title: "Tạo Nội Dung: " + name, importance: 1 });
    }
    save();
    return entry;
  };

  window.creg57GetByType = function(type, limit) {
    var arr = type ? window.contentRegV57Data.contents.filter(function(c) { return c.type === type; }) : window.contentRegV57Data.contents;
    return arr.slice(0, limit || 50);
  };

  window.creg57Search = function(query) {
    var q = (query || "").toLowerCase();
    return window.contentRegV57Data.contents.filter(function(c) {
      return c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q);
    }).slice(0, 20);
  };

  window.creg57Rate = function(contentId, rating) {
    var c = window.contentRegV57Data.contents.find(function(c) { return c.id === contentId; });
    if (!c) return;
    c.ratingCount = (c.ratingCount || 0) + 1;
    c.rating = ((c.rating || 0) * (c.ratingCount - 1) + Math.min(5, Math.max(1, rating))) / c.ratingCount;
    if (typeof window.crs57AddReputation === "function") window.crs57AddReputation(rating * 2, "Đánh Giá");
    save();
  };

  window.creg57MarkPublic = function(contentId) {
    var c = window.contentRegV57Data.contents.find(function(c) { return c.id === contentId; });
    if (!c) return;
    c.isPublic = true;
    window.contentRegV57Data.sharedContents.unshift({ id: c.id, name: c.name, type: c.type, year: getYear() });
    if (window.contentRegV57Data.sharedContents.length > 50) window.contentRegV57Data.sharedContents.length = 50;
    save();
  };

  window.creg57Export = function(contentId) {
    var c = window.contentRegV57Data.contents.find(function(c) { return c.id === contentId; });
    if (!c) return null;
    window.contentRegV57Data.totalExports++;
    var exported = JSON.stringify({ _cgv6Export: true, version: "V57", content: c });
    save();
    return exported;
  };

  window.creg57Import = function(jsonStr) {
    try {
      var parsed = JSON.parse(jsonStr);
      if (!parsed._cgv6Export || !parsed.content) return { ok: false, msg: "Dữ liệu không hợp lệ" };
      var c = parsed.content;
      c.id = "imp_" + Date.now();
      c.creatorId = c.creatorId + "_imported";
      c.importedYear = getYear();
      window.contentRegV57Data.contents.unshift(c);
      window.contentRegV57Data.totalImports++;
      save();
      return { ok: true, content: c, msg: "Import thành công: " + c.name };
    } catch(e) { return { ok: false, msg: "Lỗi parse JSON" }; }
  };

  window.creg57AddTag = function(contentId, tag) {
    var c = window.contentRegV57Data.contents.find(function(c) { return c.id === contentId; });
    if (!c) return;
    c.tags = c.tags || [];
    if (!c.tags.includes(tag)) c.tags.push(tag);
    save();
  };

  window.creg57GetStats = function() {
    var types = {};
    window.contentRegV57Data.contents.forEach(function(c) {
      types[c.type] = (types[c.type] || 0) + 1;
    });
    return {
      total: window.contentRegV57Data.contents.length,
      byType: types,
      sharedCount: window.contentRegV57Data.sharedContents.length,
      totalVersions: window.contentRegV57Data.totalVersions,
      totalImports: window.contentRegV57Data.totalImports,
      totalExports: window.contentRegV57Data.totalExports,
      avgRating: window.contentRegV57Data.contents.length > 0 ?
        (window.contentRegV57Data.contents.reduce(function(s, c) { return s + (c.rating || 0); }, 0) / window.contentRegV57Data.contents.length).toFixed(1) : "N/A"
    };
  };

  function init() {
    load();
    save();
    console.log("[ContentRegistryV57] 📚 Registry Nội Dung V57 — " + window.contentRegV57Data.contents.length + " mục · " + window.contentRegV57Data.totalVersions + " phiên bản · Export/Import/Share sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 9700); });
  } else { setTimeout(init, 9700); }
})();
