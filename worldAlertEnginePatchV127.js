(function() {
  "use strict";

  function patchNumberIncludes() {
    if (typeof Number.prototype.includes === "undefined") {
      Object.defineProperty(Number.prototype, "includes", {
        value: function() { return false; },
        configurable: true,
        writable: true,
        enumerable: false
      });
      console.log("[WorldAlertPatch V127] 🔧 Number.prototype.includes = false — worldAlertEngine:168 TypeError đã vá.");
    }
  }

  function sanitizeNpcRealms() {
    var npcs = window.npcs;
    if (!npcs) return;
    var arr = Array.isArray(npcs) ? npcs : Object.values(npcs);
    arr.forEach(function(n) {
      if (n && n.realm !== undefined && typeof n.realm !== "string") {
        n.realm = (n.realm === null || n.realm === undefined) ? "" : String(n.realm);
      }
    });
  }

  patchNumberIncludes();

  setInterval(sanitizeNpcRealms, 300);

  window.wapV127Fix = patchNumberIncludes;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      setTimeout(function() {
        sanitizeNpcRealms();
        patchNumberIncludes();
        console.log("[WorldAlertPatch V127] ✅ Full patch hoạt động — Number.prototype.includes + realm sanitizer sẵn sàng.");
      }, 100);
    });
  } else {
    setTimeout(function() {
      sanitizeNpcRealms();
      console.log("[WorldAlertPatch V127] ✅ Full patch (late-init) hoạt động.");
    }, 100);
  }
})();
