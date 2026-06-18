(function() {
  "use strict";

  var _rescuedCount = 0;

  function revealAppLayout() {
    var app = document.getElementById("appLayout");
    if (!app) return false;
    var isPuosMode = document.body.classList.contains("puos-mode");
    if (app.style.visibility !== "visible" && !isPuosMode) {
      app.style.visibility = "visible";
      _rescuedCount++;
      console.log("[AppLayoutRescue V127] 🔧 appLayout visible (#" + _rescuedCount + ")");
      return true;
    }
    return false;
  }

  function watchdog() {
    revealAppLayout();
    setTimeout(watchdog, 1500);
  }

  function init() {
    revealAppLayout();
    setTimeout(watchdog, 1500);
    console.log("[AppLayoutRescue V127] 🛡️ Khởi động — appLayout luôn được giữ visible.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
