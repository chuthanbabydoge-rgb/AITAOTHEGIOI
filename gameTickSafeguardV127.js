(function() {
  "use strict";

  var SAVE_KEY = "cgv6_gts_v127";

  window.gtsV127Data = {
    errors: [],
    totalCaught: 0,
    lastError: null,
    lastErrorTime: 0
  };

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        totalCaught: window.gtsV127Data.totalCaught,
        lastError: window.gtsV127Data.lastError,
        lastErrorTime: window.gtsV127Data.lastErrorTime
      }));
    } catch(e) {}
  }

  function describeError(e) {
    if (e === null) return "null";
    if (e === undefined) return "undefined";
    if (typeof e === "string") return e;
    if (typeof e === "number") return String(e);
    if (typeof e === "boolean") return String(e);
    if (e instanceof Error) return e.name + ": " + e.message + (e.stack ? "\n" + e.stack.split("\n").slice(0,3).join("\n") : "");
    try {
      var j = JSON.stringify(e);
      return j && j !== "{}" ? j : ("[object " + (e.constructor ? e.constructor.name : "Object") + "]");
    } catch(ex) {
      return "[non-serializable: " + typeof e + "]";
    }
  }

  function init() {
    var _fullChain = window.gameTick;

    window.gameTick = function() {
      try {
        if (_fullChain) _fullChain();
      } catch(e) {
        var d = window.gtsV127Data;
        d.totalCaught++;
        var desc = describeError(e);

        var now = Date.now();
        var isSameRecent = (d.lastError === desc && (now - d.lastErrorTime) < 5000);

        if (!isSameRecent) {
          console.warn("[GameTickSafeguard V127] ⚠️ Engine lỗi bị bắt (#" + d.totalCaught + "):", e);
          console.warn("[GameTickSafeguard V127] Mô tả lỗi:", desc);
          d.lastError = desc;
          d.lastErrorTime = now;

          d.errors.push({ time: now, year: (typeof year !== "undefined" ? year : 0), desc: desc });
          if (d.errors.length > 20) d.errors.shift();
          save();
        }
      }
    };

    window.gtsV127GetErrors = function() { return window.gtsV127Data.errors; };
    window.gtsV127Report = function() {
      var d = window.gtsV127Data;
      console.log("[GameTickSafeguard V127] Báo cáo lỗi:");
      console.log("  Tổng lỗi đã bắt:", d.totalCaught);
      console.log("  Lỗi gần nhất:", d.lastError || "(chưa có)");
      if (d.errors.length) {
        console.log("  Lịch sử (20 gần nhất):");
        d.errors.forEach(function(er, i) {
          console.log("    [" + i + "] Năm " + er.year + " | " + er.desc);
        });
      }
    };

    console.log("[GameTickSafeguard V127] 🛡️ Safeguard khởi động — Toàn bộ gameTick chain được bảo vệ. Gọi gtsV127Report() để xem lỗi.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 35000); });
  } else {
    setTimeout(init, 35000);
  }
})();
