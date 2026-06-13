(function() {
  "use strict";
  const SAVE_KEY = "cgv6_mp_anticheat_v34";

  window.mpAntiCheatData = {
    violations: [],
    flaggedSessions: {},
    actionLog: {},
    version: "V34"
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.mpAntiCheatData)); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.mpAntiCheatData = Object.assign(window.mpAntiCheatData, JSON.parse(d));
    } catch(e) {}
  }

  const LIMITS = {
    chat_per_minute: 20,
    market_list_per_hour: 30,
    buy_per_minute: 5,
    year_jump_max: 10000
  };

  // Ghi nhận hành động
  window.mpTrackAction = function(actionType) {
    const sid = window.mpData && window.mpData.sessionId;
    if (!sid) return true; // Cho phép nếu chưa có session
    if (!window.mpAntiCheatData.actionLog[sid]) window.mpAntiCheatData.actionLog[sid] = {};
    const log = window.mpAntiCheatData.actionLog[sid];
    const now = Date.now();
    const key = actionType;
    if (!log[key]) log[key] = [];
    log[key].push(now);
    // Chỉ giữ 1 giờ gần nhất
    log[key] = log[key].filter(t => (now - t) < 3600000);

    // Kiểm tra rate limit
    const limit = LIMITS[key] || 100;
    const recentCount_1min = log[key].filter(t => (now - t) < 60000).length;
    if (recentCount_1min > limit) {
      _reportViolation(sid, actionType, `Rate limit vượt quá: ${recentCount_1min}/${limit} per minute`);
      return false; // Từ chối hành động
    }
    return true; // Cho phép
  };

  // Kiểm tra thao túng thời gian
  window.mpValidateYearJump = function(fromYear, toYear) {
    const diff = Math.abs(toYear - fromYear);
    if (diff > LIMITS.year_jump_max) {
      const sid = window.mpData && window.mpData.sessionId;
      _reportViolation(sid, "time_manipulation", `Nhảy ${diff} năm một lần (max: ${LIMITS.year_jump_max})`);
      return false;
    }
    return true;
  };

  // Kiểm tra giá trị tài nguyên hợp lệ
  window.mpValidateResource = function(resourceType, value) {
    const MAX_VALUES = { linh_thach: 1e9, power: 1e8, population: 1e8 };
    const max = MAX_VALUES[resourceType] || 1e10;
    if (value > max) {
      const sid = window.mpData && window.mpData.sessionId;
      _reportViolation(sid, "resource_overflow", `${resourceType} = ${value} (max: ${max})`);
      return false;
    }
    return true;
  };

  function _reportViolation(sid, type, detail) {
    const violation = {
      sessionId: sid,
      type, detail,
      year: window.year || 0,
      ts: Date.now()
    };
    window.mpAntiCheatData.violations.unshift(violation);
    if (window.mpAntiCheatData.violations.length > 200) {
      window.mpAntiCheatData.violations = window.mpAntiCheatData.violations.slice(0, 200);
    }
    // Đếm vi phạm của session này
    if (!window.mpAntiCheatData.flaggedSessions[sid]) window.mpAntiCheatData.flaggedSessions[sid] = 0;
    window.mpAntiCheatData.flaggedSessions[sid]++;
    save();
    // Broadcast cảnh báo
    if (typeof window.mpBroadcast === 'function') {
      window.mpBroadcast("anticheat", { sessionId: sid, type, detail });
    }
  }

  window.mpReceiveAntiCheat = function(msg) {
    if (!msg || !msg.data) return;
    // Log vi phạm từ tab khác
    load();
    const { sessionId, type, detail } = msg.data;
    if (sessionId && type) {
      window.mpAntiCheatData.violations.unshift({
        sessionId, type, detail, fromTab: true, ts: Date.now()
      });
      save();
    }
  };

  // Kiểm tra session có bị flag không
  window.mpIsSessionFlagged = function(sid) {
    return (window.mpAntiCheatData.flaggedSessions[sid] || 0) >= 5;
  };

  // Render panel anti-cheat (dành cho admin/creator)
  window.mpAntiCheatRenderPanel = function() {
    load();
    const violations = window.mpAntiCheatData.violations.slice(0, 30);
    const flagged = Object.entries(window.mpAntiCheatData.flaggedSessions)
      .filter(([sid, count]) => count >= 3)
      .sort((a,b) => b[1] - a[1]);
    return `<div style="font-family:'Noto Serif SC',serif;color:#e2e8f0">
      <h3 style="color:#ef4444;margin:0 0 12px">🛡️ Kiểm Soát Gian Lận</h3>
      <div style="font-size:12px;color:#94a3b8;margin-bottom:10px">Vi phạm: ${violations.length} · Sessions bị flag: ${flagged.length}</div>
      ${flagged.length > 0 ? `<div style="margin-bottom:10px">
        <div style="font-size:12px;color:#f97316;font-weight:bold;margin-bottom:6px">⚠️ SESSIONS BỊ FLAG</div>
        ${flagged.slice(0,5).map(([sid, count]) => `<div style="font-size:11px;color:#fca5a5;padding:3px 0">${sid.substring(0,12)} — ${count} vi phạm</div>`).join("")}
      </div>` : ""}
      ${violations.slice(0,10).map(v => `<div style="font-size:11px;color:#475569;padding:2px 0;border-bottom:1px solid #0f172a">
        <span style="color:#f87171">[${v.type}]</span> ${v.detail||""} · ${v.sessionId ? v.sessionId.substring(0,8) : "?"} · Năm ${v.year||0}
      </div>`).join("")}
    </div>`;
  };

  // Thêm vào panel-creator-control hoặc hiển thị trong tab sự kiện
  function injectAntiCheatToCreator() {
    // Inject thông tin anti-cheat vào creator control panel nếu có
    const container = document.getElementById("tht-creator-advisor");
    // Không inject - để standalone
  }

  function init() {
    load();
    // Wrap chat để kiểm tra rate limit
    const _origSendChat = window.mpSendChat;
    if (_origSendChat) {
      window.mpSendChat = function(channel, text) {
        if (!window.mpTrackAction("chat_per_minute")) {
          console.warn("[AntiCheat] Chat rate limit exceeded!");
          return null;
        }
        return _origSendChat(channel, text);
      };
    }
    // Wrap market list
    const _origListItem = window.mpListItem;
    if (_origListItem) {
      window.mpListItem = function() {
        if (!window.mpTrackAction("market_list_per_hour")) {
          console.warn("[AntiCheat] Market list rate limit exceeded!");
          return null;
        }
        return _origListItem.apply(this, arguments);
      };
    }
    console.log("[AntiCheatEngine V34] 🛡️ Hệ Thống Chống Gian Lận khởi động — Rate limit · Time validation · Resource check.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 2800); });
  } else {
    setTimeout(init, 2800);
  }
})();
