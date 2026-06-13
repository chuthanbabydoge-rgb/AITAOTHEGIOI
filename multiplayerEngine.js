(function() {
  "use strict";
  const SAVE_KEY = "cgv6_mp_core_v34";

  window.mpData = {
    enabled: true,
    channel: null,
    sessionId: null,
    version: "V34"
  };

  // ─── BROADCAST CHANNEL (real-time cross-tab sync) ────────────────────────
  function setupBroadcast() {
    try {
      window.mpData.channel = new BroadcastChannel("cgv6_multiplayer_v34");
      window.mpData.channel.onmessage = function(evt) {
        handleBroadcast(evt.data);
      };
    } catch(e) {
      window.mpData.channel = null;
      console.warn("[MultiplayerEngine V34] BroadcastChannel không khả dụng — chế độ single-tab.");
    }
  }

  function handleBroadcast(msg) {
    if (!msg || !msg.type) return;
    switch(msg.type) {
      case "chat":
        if (typeof window.mpReceiveChat === 'function') window.mpReceiveChat(msg);
        break;
      case "presence":
        if (typeof window.mpReceivePresence === 'function') window.mpReceivePresence(msg);
        break;
      case "world_sync":
        if (typeof window.mpReceiveWorldSync === 'function') window.mpReceiveWorldSync(msg);
        break;
      case "market":
        if (typeof window.mpReceiveMarket === 'function') window.mpReceiveMarket(msg);
        break;
      case "event":
        if (typeof window.mpReceiveEvent === 'function') window.mpReceiveEvent(msg);
        break;
      case "anticheat":
        if (typeof window.mpReceiveAntiCheat === 'function') window.mpReceiveAntiCheat(msg);
        break;
    }
  }

  // Gửi tin nhắn đến tất cả tab khác
  window.mpBroadcast = function(type, data) {
    if (!window.mpData.channel) return;
    try {
      window.mpData.channel.postMessage({
        type: type,
        data: data,
        sessionId: window.mpData.sessionId,
        playerName: window.mpGetCurrentPlayerName(),
        timestamp: Date.now()
      });
    } catch(e) {}
  };

  // Lấy tên người chơi hiện tại
  window.mpGetCurrentPlayerName = function() {
    const acc = window.mpAccountData && window.mpAccountData.currentUser;
    if (acc) return acc.username;
    const player = window.player || window.playerData || {};
    return player.name || "Khách " + (window.mpData.sessionId || "?").substring(0, 4);
  };

  // Lấy session ID (unique per tab)
  function getOrCreateSessionId() {
    let sid = sessionStorage.getItem("cgv6_session_v34");
    if (!sid) {
      sid = "s" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      sessionStorage.setItem("cgv6_session_v34", sid);
    }
    return sid;
  }

  // ─── RENDER PANEL CHÍNH ───────────────────────────────────────────────────
  window.mpRenderPanel = function() {
    const panel = document.getElementById("panel-multiplayer");
    if (!panel) return;
    const yr = window.year || 0;
    const world = window.world || {};
    const onlinePlayers = typeof window.mpGetOnlinePlayers === 'function' ? window.mpGetOnlinePlayers() : [];
    const account = window.mpAccountData && window.mpAccountData.currentUser;
    const session = window.mpData.sessionId || "?";
    const channelAvail = !!window.mpData.channel;

    let html = `<div style="padding:16px;font-family:'Noto Serif SC',serif;color:#e2e8f0">
      <h2 style="color:#34d399;margin:0 0 4px">🌐 Thế Giới Đa Người Chơi V34</h2>
      <p style="color:#94a3b8;margin:0 0 16px;font-size:13px">${world.name||"Chưa có thế giới"} · Năm ${yr} · Session: ${session.substring(0,8)}</p>

      <!-- Trạng thái kết nối -->
      <div style="background:#0f172a;border:1px solid ${channelAvail?'#14532d':'#7f1d1d'};border-radius:8px;padding:12px;margin-bottom:16px;display:flex;align-items:center;gap:12px">
        <div style="width:10px;height:10px;border-radius:50%;background:${channelAvail?'#22c55e':'#ef4444'};box-shadow:0 0 8px ${channelAvail?'#22c55e':'#ef4444'}"></div>
        <div>
          <div style="font-size:13px;color:${channelAvail?'#22c55e':'#f87171'};font-weight:bold">${channelAvail ? "BroadcastChannel Đang Hoạt Động" : "Chế Độ Single-Tab"}</div>
          <div style="font-size:11px;color:#64748b">${channelAvail ? "Đồng bộ real-time với các tab khác trong cùng trình duyệt" : "Mở tab mới để thêm người chơi"}</div>
        </div>
      </div>

      <!-- Tài khoản -->
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:14px;margin-bottom:16px">
        <div style="font-size:12px;color:#94a3b8;font-weight:bold;margin-bottom:10px">👤 TÀI KHOẢN CỦA BẠN</div>
        ${account ? `
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:40px;height:40px;border-radius:50%;background:${account.avatarColor||'#6366f1'};display:flex;align-items:center;justify-content:center;font-size:18px">${(account.username||"?")[0].toUpperCase()}</div>
            <div>
              <div style="font-weight:bold;color:#e2e8f0">${account.username}</div>
              <div style="font-size:11px;color:#64748b">Cấp: ${account.level||1} · Điểm: ${account.score||0} · Vai trò: ${account.role||"Người Chơi"}</div>
            </div>
            <button onclick="mpAccountLogout();mpRenderPanel()" style="margin-left:auto;padding:4px 10px;background:#1e293b;border:1px solid #475569;border-radius:4px;color:#94a3b8;cursor:pointer;font-size:11px">Đăng Xuất</button>
          </div>` :
        `<div style="text-align:center;padding:12px">
          <p style="color:#64748b;font-size:12px;margin-bottom:10px">Đăng nhập để truy cập đầy đủ tính năng đa người chơi</p>
          <button onclick="showPanel('mp-account');mpAccountRenderPanel()" style="padding:8px 20px;background:linear-gradient(135deg,#22c55e,#16a34a);border:none;border-radius:6px;color:white;cursor:pointer;font-size:13px">👤 Đăng Nhập / Đăng Ký</button>
        </div>`}
      </div>

      <!-- Người chơi online -->
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:14px;margin-bottom:16px">
        <div style="font-size:12px;color:#60a5fa;font-weight:bold;margin-bottom:10px">👥 NGƯỜI CHƠI TRỰC TUYẾN (${onlinePlayers.length})</div>
        ${onlinePlayers.length === 0 ? `<div style="color:#475569;font-size:12px">Chỉ có bạn đang chơi. Mở thêm tab trình duyệt để thêm người chơi!</div>` :
          onlinePlayers.slice(0, 8).map(p => `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #0f172a">
            <div style="width:8px;height:8px;border-radius:50%;background:#22c55e"></div>
            <span style="font-size:12px;color:#e2e8f0;flex:1">${p.name||"Ẩn Danh"}</span>
            <span style="font-size:11px;color:#475569">${p.kingdom||"Không có VQ"}</span>
            <span style="font-size:11px;color:#334155">${_timeAgo(p.lastSeen)}</span>
          </div>`).join("")}
      </div>

      <!-- Navigation nhanh -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
        <button onclick="showPanel('mp-account');mpAccountRenderPanel()" style="${_navBtn('#22c55e')}">👤 Tài Khoản</button>
        <button onclick="showPanel('players-online');mpPresenceRenderPanel()" style="${_navBtn('#60a5fa')}">👥 Người Chơi</button>
        <button onclick="showPanel('world-chat');chatRenderPanel()" style="${_navBtn('#a78bfa')}">💬 Chat</button>
        <button onclick="showPanel('mp-friends')" style="${_navBtn('#f59e0b')}">🤝 Bạn Bè</button>
        <button onclick="showPanel('player-gov')" style="${_navBtn('#ef4444')}">🏛 Chính Phủ</button>
        <button onclick="showPanel('player-market');mpMarketRenderPanel()" style="${_navBtn('#34d399')}">🏪 Chợ</button>
        <button onclick="showPanel('mp-events');mpEventsRenderPanel()" style="${_navBtn('#fbbf24')}">🏆 Sự Kiện</button>
      </div>

      <p style="color:#334155;font-size:11px;margin-top:16px;text-align:center">V34 · BroadcastChannel API · localStorage · Không cần backend</p>
    </div>`;
    panel.innerHTML = html;
  };

  function _navBtn(color) {
    return `padding:8px;background:#0f172a;border:1px solid ${color}44;border-radius:6px;color:${color};cursor:pointer;font-size:12px;width:100%`;
  }

  function _timeAgo(ts) {
    if (!ts) return "?";
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 10) return "vừa xong";
    if (diff < 60) return diff + "s";
    if (diff < 3600) return Math.floor(diff/60) + "p";
    return Math.floor(diff/3600) + "h";
  }

  // ─── TICK ─────────────────────────────────────────────────────────────────
  let _mpTickCount = 0;
  function mpTick() {
    _mpTickCount++;
    // Cập nhật presence mỗi 5 tick
    if (_mpTickCount % 5 === 0 && typeof window.mpSendHeartbeat === 'function') {
      window.mpSendHeartbeat();
    }
  }

  // Đóng tab → xóa presence
  window.addEventListener('beforeunload', function() {
    if (typeof window.mpRemovePresence === 'function') window.mpRemovePresence();
    if (window.mpData.channel) window.mpData.channel.close();
  });

  function init() {
    window.mpData.sessionId = getOrCreateSessionId();
    setupBroadcast();
    const _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); mpTick(); };
    console.log("[MultiplayerEngine V34] 🌐 Đa Người Chơi khởi động — BroadcastChannel · SessionID: " + window.mpData.sessionId.substring(0,8));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 2400); });
  } else {
    setTimeout(init, 2400);
  }
})();
