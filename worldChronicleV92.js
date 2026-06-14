(function() {
  "use strict";

  var SAVE_KEY = "cgv6_world_chronicle_v92";

  window.wchV92Data = {
    yearEntries: [],
    totalEntries: 0
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.wchV92Data)); } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.wchV92Data = JSON.parse(d);
    } catch(e) {}
  }

  window.wchV92AddEvent = function(event) {
    var year = event.year || window.year || 1;
    var entry = null;
    for (var i = 0; i < window.wchV92Data.yearEntries.length; i++) {
      if (window.wchV92Data.yearEntries[i].year === year) { entry = window.wchV92Data.yearEntries[i]; break; }
    }
    if (!entry) {
      entry = { year: year, events: [], summary: '' };
      window.wchV92Data.yearEntries.unshift(entry);
      window.wchV92Data.yearEntries.sort(function(a, b) { return b.year - a.year; });
      if (window.wchV92Data.yearEntries.length > 150) window.wchV92Data.yearEntries.pop();
    }
    entry.events.push({
      type: event.type,
      title: event.title,
      desc: event.desc,
      icon: event.icon || '📜',
      color: event.color || '#94a3b8'
    });
    window.wchV92Data.totalEntries++;
    save();
  };

  window.wchV92GetByYear = function(year) {
    for (var i = 0; i < window.wchV92Data.yearEntries.length; i++) {
      if (window.wchV92Data.yearEntries[i].year === year) return window.wchV92Data.yearEntries[i];
    }
    return null;
  };

  window.wchV92GetRecent = function(n) {
    return window.wchV92Data.yearEntries.slice(0, n || 10);
  };

  window.wchV92RenderHTML = function() {
    var entries = window.wchV92Data.yearEntries;
    if (!entries || !entries.length) {
      return '<div style="color:#475569;text-align:center;padding:24px;font-style:italic;font-size:13px;">Biên niên sử trống — chờ thế giới phát triển qua từng năm...</div>';
    }
    var html = '';
    entries.slice(0, 40).forEach(function(entry) {
      html += '<div style="margin-bottom:18px;">';
      html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">';
      html += '<div style="width:3px;height:16px;background:#7c3aed;border-radius:2px;flex-shrink:0;"></div>';
      html += '<div style="font-size:12px;font-weight:700;color:#a78bfa;letter-spacing:2px;text-transform:uppercase;">Năm ' + entry.year + '</div>';
      html += '<div style="flex:1;height:1px;background:rgba(124,58,237,0.15);"></div>';
      html += '<div style="font-size:10px;color:#374151;">' + entry.events.length + ' sự kiện</div>';
      html += '</div>';
      entry.events.forEach(function(ev) {
        html += '<div style="display:flex;gap:10px;padding:7px 0 7px 11px;border-left:1px solid rgba(124,58,237,0.15);margin-left:1px;">';
        html += '<span style="font-size:16px;flex-shrink:0;margin-top:1px;">' + ev.icon + '</span>';
        html += '<div style="flex:1;min-width:0;">';
        html += '<div style="font-size:13px;font-weight:600;color:' + ev.color + ';margin-bottom:2px;">' + ev.title + '</div>';
        html += '<div style="font-size:12px;color:#64748b;line-height:1.45;">' + ev.desc + '</div>';
        html += '</div></div>';
      });
      html += '</div>';
    });
    return html;
  };

  function init() {
    load();
    console.log("[WorldChronicle V92] 📜 Biên Niên Sử khởi động — " + window.wchV92Data.totalEntries + " sự kiện đã ghi lại.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 24400); });
  } else {
    setTimeout(init, 24400);
  }
})();
