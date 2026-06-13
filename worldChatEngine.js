(function() {
  "use strict";
  const SAVE_KEY = "cgv6_mp_chat_v34";
  const MAX_MESSAGES = 200;
  const CHANNELS = ["global", "kingdom", "empire", "guild", "sect", "divine"];
  const CHANNEL_LABELS = { global:"🌐 Toàn Cầu", kingdom:"🏯 Vương Quốc", empire:"👑 Đế Chế", guild:"🏛 Bang Hội", sect:"⛩ Tông Môn", divine:"⚡ Thần Giới" };
  const CHANNEL_COLORS = { global:"#60a5fa", kingdom:"#a78bfa", empire:"#fbbf24", guild:"#34d399", sect:"#f97316", divine:"#818cf8" };

  window.mpChatData = {
    messages: [],
    activeChannel: "global",
    version: "V34"
  };

  function save() {
    try {
      const toSave = Object.assign({}, window.mpChatData);
      toSave.messages = toSave.messages.slice(0, MAX_MESSAGES);
      localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
    } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) {
        const parsed = JSON.parse(d);
        window.mpChatData.messages = parsed.messages || [];
        window.mpChatData.activeChannel = parsed.activeChannel || "global";
      }
    } catch(e) {}
  }

  // Gửi tin nhắn
  window.mpSendChat = function(channel, text) {
    if (!text || !text.trim()) return;
    const acc = window.mpAccountData && window.mpAccountData.currentUser;
    const playerName = typeof window.mpGetCurrentPlayerName === 'function' ? window.mpGetCurrentPlayerName() : "Ẩn Danh";
    const avatarColor = acc ? acc.avatarColor : "#6366f1";
    const msg = {
      id: Date.now() + Math.random(),
      channel: channel || "global",
      sender: playerName,
      avatarColor: avatarColor,
      text: text.trim().substring(0, 200),
      year: window.year || 0,
      ts: Date.now(),
      sessionId: window.mpData && window.mpData.sessionId
    };
    load();
    window.mpChatData.messages.unshift(msg);
    if (window.mpChatData.messages.length > MAX_MESSAGES) {
      window.mpChatData.messages = window.mpChatData.messages.slice(0, MAX_MESSAGES);
    }
    save();
    // Broadcast đến các tab khác
    if (typeof window.mpBroadcast === 'function') {
      window.mpBroadcast("chat", msg);
    }
    // Re-render nếu panel đang mở
    const panel = document.getElementById("panel-world-chat");
    if (panel && panel.style.display !== "none") {
      _refreshMessages();
    }
    return msg;
  };

  // Nhận tin nhắn từ tab khác
  window.mpReceiveChat = function(broadcastMsg) {
    if (!broadcastMsg || !broadcastMsg.data) return;
    load();
    const msg = broadcastMsg.data;
    // Kiểm tra không trùng
    if (!window.mpChatData.messages.find(m => m.id === msg.id)) {
      window.mpChatData.messages.unshift(msg);
      if (window.mpChatData.messages.length > MAX_MESSAGES) {
        window.mpChatData.messages = window.mpChatData.messages.slice(0, MAX_MESSAGES);
      }
      save();
      // Cập nhật UI nếu đang xem chat
      const panel = document.getElementById("panel-world-chat");
      if (panel && panel.style.display !== "none") _refreshMessages();
    }
  };

  // Lấy tin nhắn theo channel
  window.mpGetMessages = function(channel, limit) {
    load();
    const msgs = channel ? window.mpChatData.messages.filter(m => m.channel === channel) : window.mpChatData.messages;
    return msgs.slice(0, limit || 50);
  };

  // Thêm tin nhắn hệ thống (sự kiện thế giới → chat)
  window.mpSystemMsg = function(channel, text) {
    const msg = {
      id: Date.now() + Math.random(),
      channel: channel || "global",
      sender: "🤖 Thủ Hộ Thần",
      avatarColor: "#6366f1",
      text: text,
      year: window.year || 0,
      ts: Date.now(),
      isSystem: true,
      sessionId: "system"
    };
    load();
    window.mpChatData.messages.unshift(msg);
    save();
  };

  function _refreshMessages() {
    const container = document.getElementById("chat-messages-container");
    if (!container) return;
    container.innerHTML = _renderMessages(window.mpChatData.activeChannel);
    container.scrollTop = container.scrollHeight;
  }

  function _renderMessages(channel) {
    load();
    const msgs = window.mpGetMessages(channel, 60);
    if (!msgs.length) return `<div style="text-align:center;padding:30px;color:#475569;font-size:13px">Chưa có tin nhắn nào trong kênh này.</div>`;

    const mySid = window.mpData && window.mpData.sessionId;
    return msgs.slice().reverse().map(m => {
      const isMe = m.sessionId === mySid;
      const isSystem = m.isSystem;
      if (isSystem) {
        return `<div style="text-align:center;margin:6px 0">
          <span style="background:#1e1b4b;border:1px solid #312e81;border-radius:10px;padding:3px 10px;font-size:11px;color:#818cf8">${m.text}</span>
        </div>`;
      }
      return `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:10px;${isMe?'flex-direction:row-reverse':''}">
        <div style="width:30px;height:30px;border-radius:50%;background:${m.avatarColor||'#6366f1'};display:flex;align-items:center;justify-content:center;font-size:13px;color:white;flex-shrink:0">${(m.sender||"?")[0].toUpperCase()}</div>
        <div style="max-width:70%">
          <div style="font-size:11px;color:#475569;margin-bottom:2px;${isMe?'text-align:right':''}">${m.sender||"?"} · Năm ${m.year||0}</div>
          <div style="background:${isMe?'#1e3a5f':'#1e293b'};border-radius:${isMe?'12px 4px 12px 12px':'4px 12px 12px 12px'};padding:8px 12px;font-size:13px;color:#e2e8f0;word-break:break-word">${m.text||""}</div>
        </div>
      </div>`;
    }).join("");
  }

  // Render panel chat chính
  window.chatRenderPanel = function() {
    const panel = document.getElementById("panel-world-chat");
    if (!panel) return;
    const activeChannel = window.mpChatData.activeChannel || "global";
    const color = CHANNEL_COLORS[activeChannel] || "#60a5fa";

    let html = `<div style="height:100%;display:flex;flex-direction:column;font-family:'Noto Serif SC',serif;color:#e2e8f0">

      <!-- Header -->
      <div style="background:#0f172a;padding:12px 16px;border-bottom:1px solid #1e293b">
        <div style="font-size:16px;font-weight:bold;color:${color};margin-bottom:8px">💬 ${CHANNEL_LABELS[activeChannel]||activeChannel}</div>
        <!-- Channel selector -->
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${CHANNELS.map(ch => `<button onclick="chatSwitchChannel('${ch}')" style="padding:3px 8px;background:${ch===activeChannel?CHANNEL_COLORS[ch]:'#1e293b'};border:1px solid ${ch===activeChannel?CHANNEL_COLORS[ch]:'#334155'};border-radius:10px;color:${ch===activeChannel?'white':'#64748b'};cursor:pointer;font-size:11px;white-space:nowrap">${CHANNEL_LABELS[ch]||ch}</button>`).join("")}
        </div>
      </div>

      <!-- Messages -->
      <div id="chat-messages-container" style="flex:1;overflow-y:auto;padding:12px 16px;background:#0a0f1e">
        ${_renderMessages(activeChannel)}
      </div>

      <!-- Input -->
      <div style="background:#0f172a;padding:10px 16px;border-top:1px solid #1e293b;display:flex;gap:8px">
        <input id="chat-input" type="text" placeholder="Nhập tin nhắn... (Enter để gửi)"
          style="flex:1;padding:8px 12px;background:#1e293b;border:1px solid #334155;border-radius:20px;color:#e2e8f0;font-size:13px;font-family:'Noto Serif SC',serif"
          onkeydown="if(event.key==='Enter'){chatSendMessage();}" maxlength="200">
        <button onclick="chatSendMessage()"
          style="padding:8px 16px;background:linear-gradient(135deg,${color},${color}cc);border:none;border-radius:20px;color:white;cursor:pointer;font-size:13px;white-space:nowrap">
          Gửi ✉
        </button>
      </div>

      <!-- Scroll bottom -->
      <script>document.getElementById('chat-messages-container').scrollTop=document.getElementById('chat-messages-container').scrollHeight;<\/script>
    </div>`;
    panel.innerHTML = html;
  };

  window.chatSwitchChannel = function(ch) {
    window.mpChatData.activeChannel = ch;
    save();
    window.chatRenderPanel();
  };

  window.chatSendMessage = function() {
    const input = document.getElementById("chat-input");
    if (!input || !input.value.trim()) return;
    window.mpSendChat(window.mpChatData.activeChannel, input.value.trim());
    input.value = "";
    _refreshMessages();
    // Scroll to bottom
    const container = document.getElementById("chat-messages-container");
    if (container) container.scrollTop = container.scrollHeight;
  };

  // Auto-refresh chat từ localStorage mỗi 5s (fallback nếu không có BroadcastChannel)
  setInterval(function() {
    const panel = document.getElementById("panel-world-chat");
    if (!panel || panel.style.display === "none") return;
    _refreshMessages();
  }, 5000);

  // Hook world events → system messages
  let _chatTickCount = 0;
  function chatTick() {
    _chatTickCount++;
    if (_chatTickCount % 50 === 0 && window.world && window.world.name) {
      const wars = (window.warsActive || []).length;
      if (wars > 0 && _chatTickCount % 200 === 0) {
        window.mpSystemMsg("global", `⚔️ Thế giới đang có ${wars} cuộc chiến tranh diễn ra — Năm ${window.year||0}`);
      }
    }
  }

  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); chatTick(); };
    console.log("[WorldChatEngine V34] 💬 Chat Thế Giới khởi động — 6 kênh · BroadcastChannel · Auto-refresh 5s.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 2600); });
  } else {
    setTimeout(init, 2600);
  }
})();
