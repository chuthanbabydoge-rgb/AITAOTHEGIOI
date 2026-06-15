(function() {
  "use strict";
  const SAVE_KEY = "cgv6_creator_powers_v123";
  const MAX_HISTORY = 500;
  const MAX_UNDO = 30;

  window.cpv123Data = {
    enabled: false,
    history: [],
    undoStack: [],
    totalInterventions: 0,
    totalTypes: {
      geography: 0, life: 0, civilization: 0,
      divine: 0, time: 0, experiment: 0
    },
    sessionStart: null
  };

  function save() {
    try {
      const d = {
        enabled: window.cpv123Data.enabled,
        history: window.cpv123Data.history.slice(-200),
        totalInterventions: window.cpv123Data.totalInterventions,
        totalTypes: window.cpv123Data.totalTypes
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(d));
    } catch(e) {}
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        Object.assign(window.cpv123Data, d);
        window.cpv123Data.undoStack = [];
      }
    } catch(e) {}
  }

  window.cpv123Enable = function() {
    window.cpv123Data.enabled = true;
    window.cpv123Data.sessionStart = window.year || 1;
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: window.year || 1, type: "divine", title: "⚡ Creator Mode kích hoạt — Thần Quyền đã được trao.", color: "#f59e0b" });
    }
    if (typeof window.jarvisToast === "function") window.jarvisToast("⚡ Creator Mode BẬT — Bạn là Thần Tạo Hóa!", 3000);
    save();
    if (typeof window.cpv123RegistryRender === "function") window.cpv123RegistryRender();
  };

  window.cpv123Disable = function() {
    window.cpv123Data.enabled = false;
    save();
    if (typeof window.cpv123RegistryRender === "function") window.cpv123RegistryRender();
  };

  window.cpv123Toggle = function() {
    if (window.cpv123Data.enabled) window.cpv123Disable();
    else window.cpv123Enable();
  };

  window.cpv123LogAction = function(type, title, detail, snapshot) {
    const yr = window.year || 1;
    const entry = {
      id: "act_" + Date.now(),
      year: yr,
      type: type,
      title: title,
      detail: detail || "",
      ts: Date.now()
    };
    window.cpv123Data.history.unshift(entry);
    if (window.cpv123Data.history.length > MAX_HISTORY) window.cpv123Data.history.pop();
    window.cpv123Data.totalInterventions++;
    if (window.cpv123Data.totalTypes[type] !== undefined) window.cpv123Data.totalTypes[type]++;

    if (snapshot) {
      window.cpv123Data.undoStack.push({ entry: entry, snapshot: snapshot });
      if (window.cpv123Data.undoStack.length > MAX_UNDO) window.cpv123Data.undoStack.shift();
    }

    if (typeof window.htAddEvent === "function") {
      const iconMap = { geography: "🌍", life: "🧬", civilization: "🏛️", divine: "⚡", time: "⏰", experiment: "🔬" };
      window.htAddEvent({ year: yr, type: "creator", title: (iconMap[type] || "✨") + " " + title, color: "#8b5cf6" });
    }
    if (typeof window.wmeAddMemory === "function") {
      window.wmeAddMemory({ year: yr, category: "Creator Power", title: title, content: detail });
    }
    if (typeof window.trV122CaptureNow === "function") window.trV122CaptureNow("creator_action", title);
    save();
  };

  window.cpv123Undo = function() {
    if (!window.cpv123Data.undoStack.length) {
      alert("Không có hành động nào để hoàn tác!");
      return;
    }
    const last = window.cpv123Data.undoStack.pop();
    if (last.snapshot && typeof last.snapshot.restore === "function") {
      last.snapshot.restore();
      window.cpv123LogAction("undo", "↩️ Hoàn tác: " + last.entry.title, "Khôi phục trạng thái năm " + last.entry.year);
    }
    if (typeof window.cpv123RegistryRender === "function") window.cpv123RegistryRender();
  };

  window.cpv123GetHistory = function() { return window.cpv123Data.history; };

  window.cpv123IsEnabled = function() { return window.cpv123Data.enabled; };

  window.cpv123MakeSnapshot = function(restoreFn) {
    return { restore: restoreFn, ts: Date.now() };
  };

  function init() {
    load();
    console.log("[CreatorPowersCore V123] ⚡ Creator Powers Core khởi động —", window.cpv123Data.totalInterventions, "can thiệp đã ghi nhận.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 29300); });
  } else {
    setTimeout(init, 29300);
  }
})();
