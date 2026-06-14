(function() {
  "use strict";

  var SAVE_KEY = "cgv6_autonomy_clock_v92";

  window.wacV92Data = {
    lastYear: 0,
    totalYearsElapsed: 0,
    startYear: 1,
    yearHistory: [],
    initialized: false
  };

  var _listeners = [];

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.wacV92Data)); } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.wacV92Data = JSON.parse(d);
    } catch(e) {}
  }

  window.wacV92AddListener = function(fn) {
    if (typeof fn === 'function') _listeners.push(fn);
  };

  window.wacV92GetCurrentYear = function() { return window.year || 1; };
  window.wacV92GetElapsed    = function() { return window.wacV92Data.totalYearsElapsed; };

  function broadcast(currentYear, prevYear) {
    _listeners.forEach(function(fn) {
      try { fn(currentYear, prevYear); } catch(e) {}
    });
  }

  var _lastChecked = 0;

  function tick() {
    if (!window.world || !window.world.name) return;
    var cy = window.year || 1;
    if (cy !== window.wacV92Data.lastYear) {
      var prev = window.wacV92Data.lastYear;
      window.wacV92Data.lastYear = cy;
      if (prev > 0) {
        window.wacV92Data.totalYearsElapsed++;
        window.wacV92Data.yearHistory.push({ year: cy, at: Date.now() });
        if (window.wacV92Data.yearHistory.length > 200) window.wacV92Data.yearHistory.shift();
        save();
        broadcast(cy, prev);
      } else {
        window.wacV92Data.startYear = cy;
        save();
      }
    }
  }

  function init() {
    load();
    window.wacV92Data.lastYear = window.year || 1;
    save();

    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      tick();
    };

    console.log("[WorldAutonomyClock V92] ⏰ Universe Clock khởi động — theo dõi năm tháng thế giới.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 24200); });
  } else {
    setTimeout(init, 24200);
  }
})();
