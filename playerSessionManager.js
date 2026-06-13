(function() {
  "use strict";
  const SAVE_KEY = "cgv6_mp_sessions_v34";
  const HEARTBEAT_INTERVAL = 15000; // 15 giây
  const ONLINE_THRESHOLD = 45000;   // 45 giây = offline

  window.mpSessionData = {
    sessions: {},
    mySession: null,
    version: "V34"
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ sessions: window.mpSessionData.sessions })); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) {
        const parsed = JSON.parse(d);
        window.mpSessionData.sessions = parsed.sessions || {};
      }
    } catch(e) {}
  }

  // Tạo session cho tab này
  function createMySession() {
    const sid = window.mpData && window.mpData.sessionId ? window.mpData.sessionId : sessionStorage.getItem("cgv6_session_v34") || ("s" + Date.now().toString(36));
    const acc = window.mpAccountData && window.mpAccountData.currentUser;
    const player = window.player || {};
    const kingdom = _getMyKingdom();

    window.mpSessionData.mySession = sid;
    window.mpSessionData.sessions[sid] = {
      id: sid,
      name: acc ? acc.username : (player.name || "Khách " + sid.substring(0,4)),
      accountId: acc ? acc.id : null,
      kingdom: kingdom,
      realm: player.realm || "Phàm Nhân",
      world: (window.world && window.world.name) || null,
      lastSeen: Date.now(),
      joinedAt: window.mpSessionData.sessions[sid] ? window.mpSessionData.sessions[sid].joinedAt : Date.now()
    };
    save();
    return window.mpSessionData.sessions[sid];
  }

  function _getMyKingdom() {
    const territory = window.playerTerritoryData || {};
    if (territory.kingdomName) return territory.kingdomName;
    if (territory.kingdomId) {
      const kingdoms = _toArr(window.kingdomData && window.kingdomData.kingdoms);
      const k = kingdoms.find(k => k.id === territory.kingdomId);
      if (k) return k.name;
    }
    return null;
  }

  function _toArr(val) {
    if (!val) return [];
    return Array.isArray(val) ? val : Object.values(val);
  }

  // Heartbeat — cập nhật lastSeen
  window.mpSendHeartbeat = function() {
    load();
    const sid = window.mpSessionData.mySession;
    if (!sid) { createMySession(); return; }

    if (window.mpSessionData.sessions[sid]) {
      window.mpSessionData.sessions[sid].lastSeen = Date.now();
      window.mpSessionData.sessions[sid].world = (window.world && window.world.name) || null;
      window.mpSessionData.sessions[sid].kingdom = _getMyKingdom();
      const acc = window.mpAccountData && window.mpAccountData.currentUser;
      if (acc) window.mpSessionData.sessions[sid].name = acc.username;
    } else {
      createMySession();
    }
    save();

    // Broadcast presence
    if (typeof window.mpBroadcast === 'function') {
      window.mpBroadcast("presence", window.mpSessionData.sessions[sid]);
    }
  };

  // Xóa session khi đóng tab
  window.mpRemovePresence = function() {
    const sid = window.mpSessionData.mySession;
    if (sid) {
      load();
      delete window.mpSessionData.sessions[sid];
      save();
    }
  };

  // Nhận presence từ tab khác
  window.mpReceivePresence = function(msg) {
    if (!msg || !msg.data) return;
    load();
    const data = msg.data;
    if (data && data.id) {
      window.mpSessionData.sessions[data.id] = Object.assign(window.mpSessionData.sessions[data.id] || {}, data);
      save();
    }
  };

  // Lấy danh sách người chơi online
  window.mpGetOnlinePlayers = function() {
    load();
    const now = Date.now();
    const mySid = window.mpSessionData.mySession;
    return Object.values(window.mpSessionData.sessions || {})
      .filter(s => (now - (s.lastSeen || 0)) < ONLINE_THRESHOLD)
      .sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));
  };

  // Lấy chỉ người chơi khác (không phải mình)
  window.mpGetOtherPlayers = function() {
    const mySid = window.mpSessionData.mySession;
    return window.mpGetOnlinePlayers().filter(s => s.id !== mySid);
  };

  // Dọn session cũ (offline > 5 phút)
  function pruneOldSessions() {
    load();
    const now = Date.now();
    const PRUNE_THRESHOLD = 300000; // 5 phút
    Object.keys(window.mpSessionData.sessions).forEach(sid => {
      const s = window.mpSessionData.sessions[sid];
      if ((now - (s.lastSeen || 0)) > PRUNE_THRESHOLD) {
        delete window.mpSessionData.sessions[sid];
      }
    });
    save();
  }

  function init() {
    load();
    // Chờ mpData có sessionId
    setTimeout(function() {
      createMySession();
      // Heartbeat định kỳ
      setInterval(function() {
        window.mpSendHeartbeat();
        pruneOldSessions();
      }, HEARTBEAT_INTERVAL);
    }, 500);
    console.log("[PlayerSessionManager V34] 👥 Quản Lý Phiên Người Chơi khởi động — Heartbeat 15s · Online Threshold 45s.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 2450); });
  } else {
    setTimeout(init, 2450);
  }
})();
