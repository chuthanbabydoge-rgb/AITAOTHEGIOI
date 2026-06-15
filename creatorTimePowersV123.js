(function() {
  "use strict";

  var _origSpeed = null;
  var _skipInterval = null;
  var _timeState = { paused: false, slowed: false, fastForwarding: false, currentMode: "normal" };

  function getSimSpeed() {
    var sel = document.getElementById("simSpeed");
    if (sel) return parseInt(sel.value) || 2000;
    return 2000;
  }

  function applySpeed(ms) {
    var sel = document.getElementById("simSpeed");
    if (sel) {
      sel.value = ms;
      if (typeof window.changeSimSpeed === "function") {
        try { window.changeSimSpeed(); } catch(e) {}
      }
    }
  }

  function pauseBtn() {
    var btn = document.querySelector("button.pause-btn, button[onclick*='pause'], button[onclick*='Pause'], #pauseBtn");
    if (!btn) {
      var buttons = document.querySelectorAll("button");
      for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].textContent.includes("Tạm Dừng") || buttons[i].textContent.includes("⏸")) {
          btn = buttons[i]; break;
        }
      }
    }
    return btn;
  }

  function resumeBtn() {
    var buttons = document.querySelectorAll("button");
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].textContent.includes("Tiếp Tục") || buttons[i].textContent.includes("▶")) {
        return buttons[i];
      }
    }
    return null;
  }

  window.cpv123PauseTime = function() {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    if (_timeState.paused) { window.cpv123ResumeTime(); return; }
    _origSpeed = getSimSpeed();
    var btn = pauseBtn();
    if (btn && !_timeState.paused) { btn.click(); }
    _timeState.paused = true;
    _timeState.currentMode = "paused";
    window.cpv123LogAction("time", "⏸ Tạm Dừng Thời Gian", "Thế giới đóng băng · Tốc độ gốc: " + _origSpeed + "ms");
    if (typeof window.cpv123RegistryRender === "function") window.cpv123RegistryRender();
  };

  window.cpv123ResumeTime = function() {
    if (!_timeState.paused) return;
    var btn = resumeBtn() || pauseBtn();
    if (btn) btn.click();
    if (_origSpeed) applySpeed(_origSpeed);
    _timeState.paused = false;
    _timeState.currentMode = "normal";
    _origSpeed = null;
    window.cpv123LogAction("time", "▶ Tiếp Tục Thời Gian", "Thế giới chạy lại bình thường");
    if (typeof window.cpv123RegistryRender === "function") window.cpv123RegistryRender();
  };

  window.cpv123SlowTime = function(factor) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    factor = factor || 5;
    var current = getSimSpeed();
    var slow = Math.min(10000, current * factor);
    if (!_origSpeed) _origSpeed = current;
    applySpeed(slow);
    _timeState.slowed = true;
    _timeState.currentMode = "slow";
    window.cpv123LogAction("time", "🐢 Làm Chậm Thời Gian " + factor + "x", current + "ms → " + slow + "ms/tick");
    if (typeof window.cpv123RegistryRender === "function") window.cpv123RegistryRender();
  };

  window.cpv123FastForward = function(factor) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    factor = factor || 10;
    var current = getSimSpeed();
    var fast = Math.max(100, Math.floor(current / factor));
    if (!_origSpeed) _origSpeed = current;
    applySpeed(fast);
    _timeState.fastForwarding = true;
    _timeState.currentMode = "fast";
    window.cpv123LogAction("time", "⚡ Tua Nhanh Thời Gian " + factor + "x", current + "ms → " + fast + "ms/tick");
    if (typeof window.cpv123RegistryRender === "function") window.cpv123RegistryRender();
  };

  window.cpv123NormalTime = function() {
    if (_origSpeed) {
      applySpeed(_origSpeed);
      _origSpeed = null;
    }
    _timeState = { paused: false, slowed: false, fastForwarding: false, currentMode: "normal" };
    if (_skipInterval) { clearInterval(_skipInterval); _skipInterval = null; }
    window.cpv123LogAction("time", "🕐 Khôi Phục Tốc Độ Bình Thường", "");
    if (typeof window.cpv123RegistryRender === "function") window.cpv123RegistryRender();
  };

  window.cpv123SkipYears = function(years) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    years = years || 100;
    var startYear = window.year || 1;
    var targetYear = startYear + years;
    window.cpv123FastForward(50);
    var ticks = 0;
    var maxTicks = years * 3;
    _skipInterval = setInterval(function() {
      ticks++;
      if ((window.year || 1) >= targetYear || ticks > maxTicks) {
        clearInterval(_skipInterval);
        _skipInterval = null;
        window.cpv123NormalTime();
        window.cpv123LogAction("time", "⏭ Bỏ Qua " + years + " Năm", "Từ năm " + startYear + " → " + (window.year || 1));
        if (typeof window.jarvisToast === "function") window.jarvisToast("⏭ Đã bỏ qua " + years + " năm!", 3000);
      }
    }, 500);
  };

  window.cpv123JumpToEvent = function(eventId) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    var history = typeof window.tr122GetSnapshots === "function" ? window.tr122GetSnapshots() : [];
    var target = history.find(function(s) { return s.id === eventId; });
    if (!target) {
      var htEvents = (window.htData && window.htData.events) ? window.htData.events : [];
      target = htEvents.find(function(e) { return e.id === eventId || e.year === parseInt(eventId); });
    }
    if (!target) {
      if (typeof window.jarvisToast === "function") window.jarvisToast("⚠️ Không tìm thấy sự kiện: " + eventId, 2000);
      return;
    }
    var targetYear = target.year || target.yr;
    window.cpv123LogAction("time", "🎯 Nhảy Tới Sự Kiện năm " + targetYear, "Target: " + (target.title || eventId));
    if (typeof window.jarvisToast === "function") window.jarvisToast("🎯 Đang tua tới năm " + targetYear + "...", 3000);
    if ((window.year || 1) < targetYear) {
      window.cpv123SkipYears(targetYear - (window.year || 1));
    }
  };

  window.cpv123TimeState = _timeState;

  function init() {
    console.log("[CreatorTimePowers V123] ⏰ Time Powers khởi động — Pause · Slow · FastForward · Skip · Jump sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 29800); });
  } else {
    setTimeout(init, 29800);
  }
})();
