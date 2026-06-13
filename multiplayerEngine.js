(function() {
  "use strict";
  const SAVE_KEY = "cgv6_mp_core_v34";

  window.mpData = {
    enabled: true,
    channel: null,
    sessionId: null,
    activeSubTab: "overview",
    version: "V34"
  };

  // ─── BROADCAST CHANNEL ───────────────────────────────────────────────────
  function setupBroadcast() {
    try {
      window.mpData.channel = new BroadcastChannel("cgv6_multiplayer_v34");
      window.mpData.channel.onmessage = function(evt) { handleBroadcast(evt.data); };
    } catch(e) {
      window.mpData.channel = null;
    }
  }

  function handleBroadcast(msg) {
    if (!msg || !msg.type) return;
    switch(msg.type) {
      case "chat":    if (typeof window.mpReceiveChat    === 'function') window.mpReceiveChat(msg);    break;
      case "presence":if (typeof window.mpReceivePresence=== 'function') window.mpReceivePresence(msg);break;
      case "world_sync":if(typeof window.mpReceiveWorldSync==='function')window.mpReceiveWorldSync(msg);break;
      case "market":  if (typeof window.mpReceiveMarket  === 'function') window.mpReceiveMarket(msg);  break;
      case "event":   if (typeof window.mpReceiveEvent   === 'function') window.mpReceiveEvent(msg);   break;
    }
  }

  window.mpBroadcast = function(type, data) {
    if (!window.mpData.channel) return;
    try {
      window.mpData.channel.postMessage({
        type, data,
        sessionId: window.mpData.sessionId,
        playerName: window.mpGetCurrentPlayerName(),
        timestamp: Date.now()
      });
    } catch(e) {}
  };

  window.mpGetCurrentPlayerName = function() {
    const acc = window.mpAccountData && window.mpAccountData.currentUser;
    if (acc) return acc.username;
    const player = window.player || window.playerData || {};
    return player.name || "Khách " + (window.mpData.sessionId || "?").substring(0, 4);
  };

  function getOrCreateSessionId() {
    let sid = sessionStorage.getItem("cgv6_session_v34");
    if (!sid) {
      sid = "s" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      sessionStorage.setItem("cgv6_session_v34", sid);
    }
    return sid;
  }

  // ─── SUB-TAB DEFINITIONS ─────────────────────────────────────────────────
  const SUBTABS = [
    { id:"overview",  icon:"🏠", label:"Tổng Quan" },
    { id:"account",   icon:"👤", label:"Tài Khoản" },
    { id:"players",   icon:"👥", label:"Người Chơi" },
    { id:"chat",      icon:"💬", label:"Chat" },
    { id:"friends",   icon:"🤝", label:"Bạn Bè" },
    { id:"market",    icon:"🏪", label:"Chợ" },
    { id:"events",    icon:"🏆", label:"Sự Kiện" },
    { id:"gov",       icon:"🏛", label:"Chính Phủ" }
  ];

  // ─── MAIN RENDER ─────────────────────────────────────────────────────────
  window.mpRenderPanel = function() {
    const panel = document.getElementById("panel-multiplayer");
    if (!panel) return;
    const active = window.mpData.activeSubTab || "overview";
    const channelAvail = !!window.mpData.channel;

    const tabBar = SUBTABS.map(t => {
      const isActive = t.id === active;
      return `<button onclick="mpSwitchSubTab('${t.id}')" style="padding:5px 10px;background:${isActive?'rgba(34,197,94,0.15)':'transparent'};border:none;border-bottom:2px solid ${isActive?'#22c55e':'transparent'};color:${isActive?'#22c55e':'#64748b'};cursor:pointer;font-size:11px;white-space:nowrap;transition:all 0.2s;font-family:'Noto Serif SC',serif">${t.icon} ${t.label}</button>`;
    }).join("");

    const content = _renderSubTab(active);

    panel.innerHTML = `<div style="display:flex;flex-direction:column;height:100%;font-family:'Noto Serif SC',serif;color:#e2e8f0">

      <!-- Header cố định -->
      <div style="background:#0a0f1a;padding:10px 14px 0;border-bottom:1px solid #1e293b;flex-shrink:0">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:15px;font-weight:bold;color:#22c55e">🌐 Đa Người Chơi V34</span>
          <div style="display:flex;align-items:center;gap:4px;margin-left:auto">
            <div style="width:7px;height:7px;border-radius:50%;background:${channelAvail?'#22c55e':'#ef4444'}"></div>
            <span style="font-size:10px;color:${channelAvail?'#22c55e':'#ef4444'}">${channelAvail?'Đã kết nối':'Single-tab'}</span>
          </div>
        </div>
        <!-- Tab bar -->
        <div style="display:flex;gap:0;overflow-x:auto;scrollbar-width:none">${tabBar}</div>
      </div>

      <!-- Nội dung tab -->
      <div id="mp-sub-content" style="flex:1;overflow-y:auto;overflow-x:hidden">
        ${content}
      </div>
    </div>`;
  };

  // Chuyển sub-tab
  window.mpSwitchSubTab = function(tabId) {
    window.mpData.activeSubTab = tabId;
    // Nếu là chat thì cần render lại toàn bộ (do input ở dưới)
    if (tabId === 'chat') {
      window.mpRenderPanel();
      return;
    }
    const area = document.getElementById("mp-sub-content");
    if (area) {
      area.innerHTML = _renderSubTab(tabId);
    } else {
      window.mpRenderPanel();
    }
    // Cập nhật active state của tab buttons
    const panel = document.getElementById("panel-multiplayer");
    if (panel) {
      panel.querySelectorAll('[onclick^="mpSwitchSubTab"]').forEach(btn => {
        const isActive = btn.getAttribute('onclick').includes("'" + tabId + "'");
        btn.style.color = isActive ? '#22c55e' : '#64748b';
        btn.style.background = isActive ? 'rgba(34,197,94,0.15)' : 'transparent';
        btn.style.borderBottom = isActive ? '2px solid #22c55e' : '2px solid transparent';
      });
    }
  };

  // ─── NỘI DUNG TỪNG SUB-TAB ───────────────────────────────────────────────
  function _renderSubTab(tabId) {
    switch(tabId) {
      case "overview":  return _tabOverview();
      case "account":   return _tabAccount();
      case "players":   return _tabPlayers();
      case "chat":      return _tabChat();
      case "friends":   return _tabFriends();
      case "market":    return _tabMarket();
      case "events":    return _tabEvents();
      case "gov":       return _tabGov();
      default:          return _tabOverview();
    }
  }

  // ── TỔNG QUAN ──────────────────────────────────────────────────────────
  function _tabOverview() {
    const online = typeof window.mpGetOnlinePlayers === 'function' ? window.mpGetOnlinePlayers() : [];
    const others = online.filter(p => p.id !== window.mpData.sessionId);
    const acc = window.mpAccountData && window.mpAccountData.currentUser;
    const yr = window.year || 0;
    const channelAvail = !!window.mpData.channel;

    return `<div style="padding:14px">

      <!-- Tài khoản quick status -->
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-bottom:12px;display:flex;align-items:center;gap:10px">
        ${acc ? `
          <div style="width:36px;height:36px;border-radius:50%;background:${acc.avatarColor||'#6366f1'};display:flex;align-items:center;justify-content:center;font-size:16px;color:white;flex-shrink:0">${(acc.username||"?")[0].toUpperCase()}</div>
          <div>
            <div style="font-size:13px;font-weight:bold">${acc.username}</div>
            <div style="font-size:11px;color:#64748b">${acc.role||"Người Chơi"} · Cấp ${acc.level||1}</div>
          </div>
          <button onclick="mpAccountLogout();mpRenderPanel()" style="margin-left:auto;padding:3px 8px;background:#1e293b;border:1px solid #475569;border-radius:4px;color:#94a3b8;cursor:pointer;font-size:11px">Đăng Xuất</button>
        ` : `
          <div style="width:36px;height:36px;border-radius:50%;background:#1e293b;display:flex;align-items:center;justify-content:center;font-size:18px">👤</div>
          <div style="flex:1">
            <div style="font-size:12px;color:#94a3b8">Chưa đăng nhập</div>
          </div>
          <button onclick="mpSwitchSubTab('account')" style="padding:5px 12px;background:linear-gradient(135deg,#22c55e,#16a34a);border:none;border-radius:5px;color:white;cursor:pointer;font-size:12px">Đăng Nhập</button>
        `}
      </div>

      <!-- Stats nhanh -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:7px;padding:10px;text-align:center;cursor:pointer" onclick="mpSwitchSubTab('players')">
          <div style="font-size:22px;font-weight:bold;color:#60a5fa">${online.length}</div>
          <div style="font-size:11px;color:#475569">Người Online</div>
        </div>
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:7px;padding:10px;text-align:center;cursor:pointer" onclick="mpSwitchSubTab('events')">
          <div style="font-size:22px;font-weight:bold;color:#fbbf24">${_countActiveEvents()}</div>
          <div style="font-size:11px;color:#475569">Sự Kiện Đang Diễn</div>
        </div>
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:7px;padding:10px;text-align:center;cursor:pointer" onclick="mpSwitchSubTab('market')">
          <div style="font-size:22px;font-weight:bold;color:#34d399">${_countMarketListings()}</div>
          <div style="font-size:11px;color:#475569">Mặt Hàng Đang Bán</div>
        </div>
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:7px;padding:10px;text-align:center;cursor:pointer" onclick="mpSwitchSubTab('chat')">
          <div style="font-size:22px;font-weight:bold;color:#a78bfa">${_countRecentChats()}</div>
          <div style="font-size:11px;color:#475569">Tin Nhắn Mới</div>
        </div>
      </div>

      <!-- Người chơi online list (quick) -->
      ${others.length > 0 ? `
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;margin-bottom:12px">
          <div style="font-size:11px;color:#64748b;font-weight:bold;margin-bottom:8px">👥 ĐANG ONLINE</div>
          ${others.slice(0,4).map(p => `<div style="display:flex;align-items:center;gap:8px;padding:4px 0">
            <div style="width:8px;height:8px;border-radius:50%;background:#22c55e;flex-shrink:0"></div>
            <span style="font-size:12px;color:#e2e8f0;flex:1">${p.name||"Ẩn Danh"}</span>
            <span style="font-size:11px;color:#475569">${p.kingdom||""}</span>
          </div>`).join("")}
          ${others.length > 4 ? `<div style="font-size:11px;color:#334155;text-align:center;margin-top:4px">+${others.length-4} người khác</div>` : ""}
        </div>
      ` : `
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:14px;text-align:center;margin-bottom:12px;color:#334155;font-size:12px">
          Mở thêm tab trình duyệt để thêm người chơi
        </div>
      `}

      <!-- Tin nhắn gần nhất -->
      ${_lastChatPreview()}

      <p style="color:#1e293b;font-size:10px;text-align:center;margin-top:10px">Session: ${(window.mpData.sessionId||"?").substring(0,12)} · Năm ${yr}</p>
    </div>`;
  }

  function _countActiveEvents() {
    const d = window.mpEventData;
    return (d && d.activeEvents) ? d.activeEvents.filter(e=>e.status==="active").length : 0;
  }
  function _countMarketListings() {
    const d = window.mpMarketData;
    return (d && d.listings) ? d.listings.filter(l=>l.status==="active").length : 0;
  }
  function _countRecentChats() {
    const d = window.mpChatData;
    if (!d || !d.messages) return 0;
    const cutoff = Date.now() - 300000; // 5 phút
    return d.messages.filter(m => m.ts > cutoff).length;
  }
  function _lastChatPreview() {
    const d = window.mpChatData;
    if (!d || !d.messages || !d.messages.length) return "";
    const msg = d.messages[0];
    return `<div style="background:#0f172a;border:1px solid #1e293b;border-left:3px solid #a78bfa;border-radius:8px;padding:8px 12px;cursor:pointer" onclick="mpSwitchSubTab('chat')">
      <div style="font-size:10px;color:#475569;margin-bottom:3px">💬 TIN NHẮN MỚI NHẤT</div>
      <div style="font-size:12px;color:#94a3b8"><b style="color:#a78bfa">${msg.sender||"?"}</b>: ${(msg.text||"").substring(0,60)}${(msg.text||"").length>60?"...":""}</div>
    </div>`;
  }

  // ── TÀI KHOẢN ──────────────────────────────────────────────────────────
  function _tabAccount() {
    const acc = window.mpAccountData && window.mpAccountData.currentUser;
    const allAccounts = (window.mpAccountData && window.mpAccountData.accounts) || [];
    const colors = ["#6366f1","#22c55e","#f59e0b","#ef4444","#a855f7","#60a5fa","#f97316","#14b8a6"];

    if (acc) {
      return `<div style="padding:14px">
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:14px;margin-bottom:12px;display:flex;align-items:center;gap:12px">
          <div style="width:50px;height:50px;border-radius:50%;background:${acc.avatarColor||'#6366f1'};display:flex;align-items:center;justify-content:center;font-size:22px;color:white;box-shadow:0 0 16px ${acc.avatarColor||'#6366f1'}44">${(acc.username||"?")[0].toUpperCase()}</div>
          <div>
            <div style="font-size:15px;font-weight:bold">${acc.username}</div>
            <div style="font-size:11px;color:#64748b">${acc.role||"Người Chơi"} · Cấp ${acc.level||1} · ⭐${acc.score||0}</div>
          </div>
          <button onclick="mpAccountLogout();mpRenderPanel()" style="margin-left:auto;padding:5px 10px;background:#1e293b;border:1px solid #475569;border-radius:5px;color:#94a3b8;cursor:pointer;font-size:11px">Đăng Xuất</button>
        </div>
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-bottom:12px">
          <div style="font-size:11px;color:#94a3b8;margin-bottom:8px">🎨 MÀU AVATAR</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${colors.map(c => `<div onclick="mpAccountUpdate({avatarColor:'${c}'});mpSwitchSubTab('account')" style="width:28px;height:28px;border-radius:50%;background:${c};cursor:pointer;border:2px solid ${c===acc.avatarColor?'white':'transparent'}"></div>`).join("")}
          </div>
        </div>
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px">
          <div style="font-size:11px;color:#94a3b8;margin-bottom:8px">📋 TÀI KHOẢN TRONG MÁY (${allAccounts.length})</div>
          ${allAccounts.map(a => `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #0f172a">
            <div style="width:22px;height:22px;border-radius:50%;background:${a.avatarColor||'#6366f1'};display:flex;align-items:center;justify-content:center;font-size:11px;color:white">${(a.username||"?")[0].toUpperCase()}</div>
            <span style="font-size:12px;color:${a.id===acc.id?'#22c55e':'#94a3b8'};flex:1">${a.username}${a.id===acc.id?' ✓':''}</span>
            ${a.id!==acc.id?`<button onclick="mpSwitchAccount('${a.id}');mpRenderPanel()" style="padding:2px 7px;background:#1e293b;border:1px solid #334155;border-radius:3px;color:#64748b;cursor:pointer;font-size:11px">Chuyển</button>`:""}
          </div>`).join("")}
        </div>
      </div>`;
    }

    return `<div style="padding:14px;max-width:360px;margin:0 auto">
      <div id="mp-acc-tabs" style="display:flex;gap:8px;margin-bottom:14px">
        <button onclick="mpShowLoginTab('login')" id="mp-tab-login" style="flex:1;padding:7px;background:#22c55e;border:none;border-radius:6px;color:white;cursor:pointer;font-size:12px">Đăng Nhập</button>
        <button onclick="mpShowLoginTab('register')" id="mp-tab-reg" style="flex:1;padding:7px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:12px">Đăng Ký</button>
      </div>
      <div id="mp-login-form">
        <input id="mp-login-user" type="text" placeholder="Tên đăng nhập" style="width:100%;padding:8px 12px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:12px;box-sizing:border-box;margin-bottom:8px">
        <input id="mp-login-pass" type="password" placeholder="Mật khẩu" style="width:100%;padding:8px 12px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:12px;box-sizing:border-box;margin-bottom:10px" onkeydown="if(event.key==='Enter')mpDoLogin()">
        <button onclick="mpDoLogin()" style="width:100%;padding:9px;background:linear-gradient(135deg,#22c55e,#16a34a);border:none;border-radius:6px;color:white;cursor:pointer;font-size:13px">Đăng Nhập</button>
        <div id="mp-login-msg" style="font-size:11px;color:#f87171;text-align:center;margin-top:8px"></div>
      </div>
      <div id="mp-register-form" style="display:none">
        <input id="mp-reg-user" type="text" placeholder="Tên người chơi (3+ ký tự)" style="width:100%;padding:8px 12px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:12px;box-sizing:border-box;margin-bottom:8px">
        <input id="mp-reg-pass" type="password" placeholder="Mật khẩu (4+ ký tự)" style="width:100%;padding:8px 12px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:12px;box-sizing:border-box;margin-bottom:10px">
        <button onclick="mpDoRegister()" style="width:100%;padding:9px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;border-radius:6px;color:white;cursor:pointer;font-size:13px">Tạo Tài Khoản</button>
        <div id="mp-reg-msg" style="font-size:11px;color:#f87171;text-align:center;margin-top:8px"></div>
      </div>
    </div>`;
  }

  // ── NGƯỜI CHƠI ─────────────────────────────────────────────────────────
  function _tabPlayers() {
    const online = typeof window.mpGetOnlinePlayers === 'function' ? window.mpGetOnlinePlayers() : [];
    const mySid = window.mpData.sessionId;
    const allAccounts = (window.mpAccountData && window.mpAccountData.accounts) || [];
    function tAgo(ts) {
      const d = Math.floor((Date.now()-ts)/1000);
      if(d<5)return "🟢 vừa xong";if(d<30)return "🟢 "+d+"s";if(d<120)return "🟡 "+d+"s";return "🔴 "+Math.floor(d/60)+"p";
    }
    return `<div style="padding:14px">
      <div style="font-size:12px;color:#60a5fa;font-weight:bold;margin-bottom:10px">👥 NGƯỜI CHƠI ONLINE (${online.length})</div>
      ${online.length===0?`<div style="text-align:center;padding:20px;color:#334155;font-size:12px">Mở thêm tab trình duyệt → người chơi sẽ xuất hiện ở đây</div>`:
      online.map(p => {
        const accInfo = allAccounts.find(a=>a.id===p.accountId);
        const color = accInfo ? accInfo.avatarColor : '#6366f1';
        const isMe = p.id===mySid;
        return `<div style="background:#0f172a;border:1px solid ${isMe?'#22c55e44':'#1e293b'};border-radius:8px;padding:10px 12px;margin-bottom:8px;display:flex;align-items:center;gap:10px">
          <div style="width:34px;height:34px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:14px;color:white;flex-shrink:0">${(p.name||"?")[0].toUpperCase()}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:bold;color:${isMe?'#22c55e':'#e2e8f0'}">${p.name||"Ẩn Danh"}${isMe?" (bạn)":""}</div>
            <div style="font-size:11px;color:#475569">${p.kingdom?"🏯 "+p.kingdom:"Không có VQ"} · ${p.realm||"Phàm Nhân"}</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:10px;color:#475569">${tAgo(p.lastSeen)}</div>
            ${!isMe?`<button onclick="mpSendFriendRequest('${p.id}')" style="margin-top:3px;padding:2px 7px;background:#1e293b;border:1px solid #3b82f6;border-radius:3px;color:#60a5fa;cursor:pointer;font-size:10px">+ Bạn</button>`:""}
          </div>
        </div>`;
      }).join("")}
      <button onclick="mpSendHeartbeat&&mpSendHeartbeat();mpSwitchSubTab('players')" style="margin-top:8px;padding:6px 14px;background:#1e293b;border:1px solid #334155;border-radius:5px;color:#64748b;cursor:pointer;font-size:11px">🔄 Làm Mới</button>
    </div>`;
  }

  // ── CHAT ──────────────────────────────────────────────────────────────
  function _tabChat() {
    const CHANNEL_LABELS = {global:"🌐 Toàn Cầu",kingdom:"🏯 Vương Quốc",empire:"👑 Đế Chế",guild:"🏛 Bang Hội",sect:"⛩ Tông Môn",divine:"⚡ Thần Giới"};
    const CHANNEL_COLORS = {global:"#60a5fa",kingdom:"#a78bfa",empire:"#fbbf24",guild:"#34d399",sect:"#f97316",divine:"#818cf8"};
    const activeCh = (window.mpChatData && window.mpChatData.activeChannel) || "global";
    const color = CHANNEL_COLORS[activeCh] || "#60a5fa";
    const msgs = typeof window.mpGetMessages === 'function' ? window.mpGetMessages(activeCh, 60) : [];
    const mySid = window.mpData.sessionId;

    const chBtns = Object.keys(CHANNEL_LABELS).map(ch => {
      const isCh = ch===activeCh;
      return `<button onclick="mpChatSwitchCh('${ch}')" style="padding:3px 8px;background:${isCh?CHANNEL_COLORS[ch]:'#1e293b'};border:1px solid ${isCh?CHANNEL_COLORS[ch]:'#334155'};border-radius:10px;color:${isCh?'white':'#64748b'};cursor:pointer;font-size:10px;white-space:nowrap">${CHANNEL_LABELS[ch]}</button>`;
    }).join("");

    const msgHtml = msgs.length===0
      ? `<div style="text-align:center;padding:20px;color:#334155;font-size:12px">Chưa có tin nhắn</div>`
      : msgs.slice().reverse().map(m => {
          const isMe = m.sessionId===mySid;
          if (m.isSystem) return `<div style="text-align:center;margin:4px 0"><span style="background:#1e1b4b;border:1px solid #312e81;border-radius:10px;padding:2px 8px;font-size:10px;color:#818cf8">${m.text}</span></div>`;
          return `<div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:8px;${isMe?'flex-direction:row-reverse':''}">
            <div style="width:26px;height:26px;border-radius:50%;background:${m.avatarColor||'#6366f1'};display:flex;align-items:center;justify-content:center;font-size:11px;color:white;flex-shrink:0">${(m.sender||"?")[0].toUpperCase()}</div>
            <div style="max-width:72%">
              <div style="font-size:10px;color:#475569;margin-bottom:2px;${isMe?'text-align:right':''}">${m.sender} · Năm ${m.year||0}</div>
              <div style="background:${isMe?'#1e3a5f':'#1e293b'};border-radius:${isMe?'10px 3px 10px 10px':'3px 10px 10px 10px'};padding:7px 10px;font-size:12px;color:#e2e8f0;word-break:break-word">${m.text||""}</div>
            </div>
          </div>`;
        }).join("");

    // Chat cần flex-column và fill height
    return `<div style="display:flex;flex-direction:column;height:calc(100vh - 140px);min-height:300px">
      <!-- Kênh selector -->
      <div style="padding:8px 12px;background:#0a0f1a;border-bottom:1px solid #1e293b;display:flex;gap:5px;flex-wrap:wrap;flex-shrink:0">${chBtns}</div>
      <!-- Messages -->
      <div id="mp-chat-msgs" style="flex:1;overflow-y:auto;padding:10px 12px;background:#050a12">${msgHtml}</div>
      <!-- Input -->
      <div style="padding:8px 12px;background:#0f172a;border-top:1px solid #1e293b;display:flex;gap:6px;flex-shrink:0">
        <input id="mp-chat-input" type="text" placeholder="Nhập tin nhắn... (Enter)" maxlength="200"
          style="flex:1;padding:7px 10px;background:#1e293b;border:1px solid #334155;border-radius:16px;color:#e2e8f0;font-size:12px"
          onkeydown="if(event.key==='Enter')mpInlineSendChat()">
        <button onclick="mpInlineSendChat()" style="padding:7px 14px;background:${color};border:none;border-radius:16px;color:white;cursor:pointer;font-size:12px">Gửi</button>
      </div>
    </div>`;
  }

  // ── BẠN BÈ ────────────────────────────────────────────────────────────
  function _tabFriends() {
    const acc = window.mpAccountData && window.mpAccountData.currentUser;
    const friends = (acc && acc.friends) || [];
    return `<div style="padding:14px">
      <div style="font-size:12px;color:#f59e0b;font-weight:bold;margin-bottom:10px">🤝 DANH SÁCH BẠN BÈ</div>
      ${!acc?`<div style="text-align:center;padding:20px;color:#475569;font-size:12px">Cần đăng nhập để xem bạn bè.<br><button onclick="mpSwitchSubTab('account')" style="margin-top:8px;padding:5px 12px;background:#1e293b;border:1px solid #f59e0b;border-radius:4px;color:#f59e0b;cursor:pointer;font-size:11px">Đến Tài Khoản</button></div>`:
        friends.length===0?`<div style="text-align:center;padding:20px;color:#334155;font-size:12px">Chưa có bạn bè.<br>Đến <button onclick="mpSwitchSubTab('players')" style="background:none;border:none;color:#60a5fa;cursor:pointer;font-size:12px;text-decoration:underline">Người Chơi</button> để kết bạn!</div>`:
        friends.map(name=>`<div style="background:#0f172a;border:1px solid #1e293b;border-radius:7px;padding:9px 12px;margin-bottom:7px;display:flex;align-items:center;gap:8px">
          <div style="width:28px;height:28px;border-radius:50%;background:#f59e0b;display:flex;align-items:center;justify-content:center;font-size:12px;color:white">${name[0].toUpperCase()}</div>
          <span style="font-size:12px;color:#e2e8f0;flex:1">${name}</span>
          <button onclick="mpRemoveFriend('${name}');mpSwitchSubTab('friends')" style="padding:2px 8px;background:#1e293b;border:1px solid #ef4444;border-radius:3px;color:#f87171;cursor:pointer;font-size:10px">Xóa</button>
        </div>`).join("")
      }
    </div>`;
  }

  // ── CHỢ ───────────────────────────────────────────────────────────────
  function _tabMarket() {
    const d = window.mpMarketData;
    const active = (d && d.listings) ? d.listings.filter(l=>l.status==="active") : [];
    const txns = (d && d.transactions) ? d.transactions.slice(0,5) : [];
    const mySid = window.mpData.sessionId;
    const ITEM_TYPES = [
      {type:"linh_dan",name:"Linh Đan",icon:"💊"},{type:"linh_thach",name:"Linh Thạch",icon:"💎"},
      {type:"bi_thuat",name:"Bí Thuật",icon:"📜"},{type:"vu_khi",name:"Vũ Khí",icon:"⚔️"},
      {type:"phong_than",name:"Phong Thần Quả",icon:"🍑"},{type:"vo_vi",name:"Vô Vi Thảo",icon:"🌿"},
      {type:"tho_dia",name:"Thổ Địa",icon:"🏔️"},{type:"nhan_vat",name:"Đệ Tử",icon:"🧙"}
    ];
    return `<div style="padding:14px">
      <!-- Đăng bán -->
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-bottom:12px">
        <div style="font-size:11px;color:#34d399;font-weight:bold;margin-bottom:8px">➕ ĐĂNG BÁN</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
          <select id="mp-mkt-type" style="padding:6px;background:#1e293b;border:1px solid #334155;border-radius:5px;color:#e2e8f0;font-size:11px">
            ${ITEM_TYPES.map(t=>`<option value="${t.type}">${t.icon} ${t.name}</option>`).join("")}
          </select>
          <input id="mp-mkt-name" type="text" placeholder="Tên vật phẩm" style="padding:6px;background:#1e293b;border:1px solid #334155;border-radius:5px;color:#e2e8f0;font-size:11px">
          <input id="mp-mkt-price" type="number" placeholder="Giá 💎" min="1" style="padding:6px;background:#1e293b;border:1px solid #334155;border-radius:5px;color:#e2e8f0;font-size:11px">
          <input id="mp-mkt-qty" type="number" placeholder="SL" min="1" value="1" style="padding:6px;background:#1e293b;border:1px solid #334155;border-radius:5px;color:#e2e8f0;font-size:11px">
        </div>
        <button onclick="mpInlineListItem()" style="padding:6px 14px;background:linear-gradient(135deg,#34d399,#059669);border:none;border-radius:5px;color:white;cursor:pointer;font-size:11px">Đăng Bán</button>
        <span id="mp-mkt-msg" style="font-size:10px;color:#f87171;margin-left:8px"></span>
      </div>
      <!-- Danh sách -->
      <div style="font-size:11px;color:#94a3b8;font-weight:bold;margin-bottom:8px">📦 ĐANG BÁN (${active.length})</div>
      ${active.length===0?`<div style="text-align:center;padding:16px;color:#334155;font-size:12px">Chợ trống</div>`:
      active.slice(0,15).map(l=>`<div style="background:#0f172a;border:1px solid #1e293b;border-radius:7px;padding:9px 12px;margin-bottom:7px;display:flex;align-items:center;gap:8px">
        <span style="font-size:20px">${l.icon||"📦"}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:bold;color:#e2e8f0">${l.itemName||"?"}</div>
          <div style="font-size:10px;color:#475569">${l.sellerName} · SL:${l.quantity}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:12px;color:#fbbf24">${l.price}💎</div>
          ${l.sessionId!==mySid?`<button onclick="mpInlineBuy('${l.id}')" style="margin-top:2px;padding:2px 7px;background:linear-gradient(135deg,#34d399,#059669);border:none;border-radius:3px;color:white;cursor:pointer;font-size:10px">Mua</button>`:`<span style="font-size:10px;color:#334155">Của bạn</span>`}
        </div>
      </div>`).join("")}
      ${txns.length?`<div style="margin-top:10px">
        <div style="font-size:11px;color:#475569;font-weight:bold;margin-bottom:6px">📋 GIAO DỊCH GẦN ĐÂY</div>
        ${txns.map(t=>`<div style="font-size:11px;color:#475569;padding:3px 0;border-bottom:1px solid #0f172a">${t.icon||"📦"} <b style="color:#94a3b8">${t.buyerName}</b> mua ${t.itemName} — <span style="color:#fbbf24">${t.price}💎</span></div>`).join("")}
      </div>`:""}
    </div>`;
  }

  // ── SỰ KIỆN ───────────────────────────────────────────────────────────
  function _tabEvents() {
    const d = window.mpEventData;
    const active = (d && d.events) ? d.events.filter(e=>e.status==="active") : [];
    const ended = (d && d.events) ? d.events.filter(e=>e.status==="ended").slice(0,4) : [];
    const myP = (d && d.participations) || {};
    const yr = window.year || 0;
    const EVENT_TYPES = [
      {type:"boss_hunt",name:"Săn Boss",icon:"👹"},{type:"kingdom_war",name:"Chiến Tranh VQ",icon:"⚔️"},
      {type:"sect_tournament",name:"Giải Đấu TM",icon:"🏯"},{type:"world_championship",name:"Vô Địch TG",icon:"🏆"},
      {type:"divine_trial",name:"Thử Thách Thần",icon:"⚡"},{type:"merchant_fest",name:"Hội Chợ",icon:"💰"}
    ];
    return `<div style="padding:14px">
      <!-- Tạo sự kiện -->
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-bottom:12px">
        <div style="font-size:11px;color:#fbbf24;font-weight:bold;margin-bottom:8px">⚡ KHỞI ĐỘNG SỰ KIỆN</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${EVENT_TYPES.map(e=>`<button onclick="mpStartEvent('${e.type}');mpSwitchSubTab('events')" style="padding:4px 9px;background:#1e293b;border:1px solid #fbbf2444;border-radius:5px;color:#fbbf24;cursor:pointer;font-size:11px">${e.icon} ${e.name}</button>`).join("")}
        </div>
      </div>
      <!-- Active -->
      <div style="font-size:11px;color:#22c55e;font-weight:bold;margin-bottom:8px">🔥 ĐANG DIỄN RA (${active.length})</div>
      ${active.length===0?`<div style="text-align:center;padding:14px;color:#334155;font-size:12px;margin-bottom:12px">Chưa có sự kiện. Hãy khởi động một sự kiện!</div>`:
      active.map(e=>{
        const joined = myP[e.id];
        const remaining = e.endYear-yr;
        return `<div style="background:#0f172a;border:1px solid ${joined?'#22c55e44':'#1e293b'};border-radius:8px;padding:12px;margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="font-size:13px;font-weight:bold">${e.icon} ${e.name}</span>
            <span style="font-size:10px;color:#475569">Còn ${remaining}n</span>
          </div>
          <div style="font-size:11px;color:#64748b;margin-bottom:4px">${e.desc}</div>
          <div style="font-size:11px;color:#fbbf24;margin-bottom:6px">🎁 ${e.reward}</div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:10px;color:#475569">👥 ${e.participants.length} người</span>
            ${joined?`<span style="font-size:11px;color:#22c55e">✅ Đã Tham Gia</span>`:
            `<button onclick="mpDoJoinEvent('${e.id}');mpSwitchSubTab('events')" style="padding:4px 12px;background:linear-gradient(135deg,#fbbf24,#d97706);border:none;border-radius:5px;color:#0f172a;cursor:pointer;font-size:11px;font-weight:bold">Tham Gia</button>`}
          </div>
        </div>`;
      }).join("")}
      ${ended.length?`<div style="font-size:11px;color:#334155;font-weight:bold;margin-bottom:6px">📋 ĐÃ KẾT THÚC</div>
      ${ended.map(e=>`<div style="background:#0a0f1a;border:1px solid #0f172a;border-radius:5px;padding:7px 10px;margin-bottom:5px;display:flex;justify-content:space-between">
        <span style="font-size:11px;color:#334155">${e.icon} ${e.name}</span>
        <span style="font-size:10px;color:#1e293b">Năm ${e.startYear}~${e.endYear}</span>
      </div>`).join("")}`:""}
    </div>`;
  }

  // ── CHÍNH PHỦ ─────────────────────────────────────────────────────────
  function _tabGov() {
    return `<div style="padding:14px">
      <div style="font-size:12px;color:#ef4444;font-weight:bold;margin-bottom:10px">🏛 CHÍNH PHỦ NGƯỜI CHƠI</div>
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:14px;margin-bottom:10px;text-align:center">
        <div style="font-size:28px;margin-bottom:8px">🏛</div>
        <p style="color:#64748b;font-size:12px;margin:0 0 10px">Hệ thống bỏ phiếu và bầu cử lãnh đạo sẽ được mở rộng trong V35.</p>
      </div>
      <div style="display:flex;gap:8px">
        <button onclick="window.mpSystemMsg&&mpSystemMsg('kingdom','🗳️ Cuộc bỏ phiếu mới được khởi xướng!');mpSwitchSubTab('chat')" style="flex:1;padding:8px;background:#1e293b;border:1px solid #ef444444;border-radius:6px;color:#f87171;cursor:pointer;font-size:11px">📢 Bỏ Phiếu Công Khai</button>
        <button onclick="window.mpSystemMsg&&mpSystemMsg('kingdom','👑 Đề xuất bổ nhiệm lãnh đạo mới!');mpSwitchSubTab('chat')" style="flex:1;padding:8px;background:#1e293b;border:1px solid #fbbf2444;border-radius:6px;color:#fbbf24;cursor:pointer;font-size:11px">👑 Đề Cử Lãnh Đạo</button>
      </div>
    </div>`;
  }

  // ─── INLINE ACTIONS (không cần riêng-biệt render function) ───────────
  window.mpInlineSendChat = function() {
    const input = document.getElementById("mp-chat-input");
    if (!input || !input.value.trim()) return;
    const ch = (window.mpChatData && window.mpChatData.activeChannel) || "global";
    if (typeof window.mpSendChat === 'function') window.mpSendChat(ch, input.value.trim());
    input.value = "";
    // Refresh messages area only
    const msgsDiv = document.getElementById("mp-chat-msgs");
    if (msgsDiv && typeof window.mpGetMessages === 'function') {
      const msgs = window.mpGetMessages(ch, 60);
      const mySid = window.mpData.sessionId;
      msgsDiv.innerHTML = msgs.length===0
        ? `<div style="text-align:center;padding:20px;color:#334155;font-size:12px">Chưa có tin nhắn</div>`
        : msgs.slice().reverse().map(m => {
            const isMe = m.sessionId===mySid;
            if (m.isSystem) return `<div style="text-align:center;margin:4px 0"><span style="background:#1e1b4b;border-radius:10px;padding:2px 8px;font-size:10px;color:#818cf8">${m.text}</span></div>`;
            return `<div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:8px;${isMe?'flex-direction:row-reverse':''}">
              <div style="width:26px;height:26px;border-radius:50%;background:${m.avatarColor||'#6366f1'};display:flex;align-items:center;justify-content:center;font-size:11px;color:white;flex-shrink:0">${(m.sender||"?")[0].toUpperCase()}</div>
              <div style="max-width:72%">
                <div style="font-size:10px;color:#475569;margin-bottom:2px;${isMe?'text-align:right':''}">${m.sender} · Năm ${m.year||0}</div>
                <div style="background:${isMe?'#1e3a5f':'#1e293b'};border-radius:${isMe?'10px 3px 10px 10px':'3px 10px 10px 10px'};padding:7px 10px;font-size:12px;color:#e2e8f0;word-break:break-word">${m.text||""}</div>
              </div>
            </div>`;
          }).join("");
      msgsDiv.scrollTop = msgsDiv.scrollHeight;
    }
  };

  window.mpChatSwitchCh = function(ch) {
    if (window.mpChatData) window.mpChatData.activeChannel = ch;
    try { localStorage.setItem("cgv6_mp_chat_v34", JSON.stringify(window.mpChatData)); } catch(e) {}
    mpSwitchSubTab("chat");
  };

  window.mpInlineListItem = function() {
    const type = (document.getElementById("mp-mkt-type")||{}).value||"linh_thach";
    const name = (document.getElementById("mp-mkt-name")||{}).value||"";
    const price = (document.getElementById("mp-mkt-price")||{}).value||100;
    const qty = (document.getElementById("mp-mkt-qty")||{}).value||1;
    if (typeof window.mpListItem === 'function') {
      const r = window.mpListItem(type, name, price, qty, "");
      const msg = document.getElementById("mp-mkt-msg");
      if (r) { if(msg) msg.textContent="✅ Đã đăng!"; mpSwitchSubTab("market"); }
    }
  };

  window.mpInlineBuy = function(id) {
    if (typeof window.mpBuyItem === 'function') {
      const r = window.mpBuyItem(id);
      if (r.ok) mpSwitchSubTab("market");
      else alert(r.msg);
    }
  };

  // ─── TICK ─────────────────────────────────────────────────────────────
  let _mpTickCount = 0;
  function mpTick() {
    _mpTickCount++;
    if (_mpTickCount % 5 === 0 && typeof window.mpSendHeartbeat === 'function') {
      window.mpSendHeartbeat();
    }
  }

  window.addEventListener('beforeunload', function() {
    if (typeof window.mpRemovePresence === 'function') window.mpRemovePresence();
    if (window.mpData.channel) window.mpData.channel.close();
  });

  function init() {
    window.mpData.sessionId = getOrCreateSessionId();
    setupBroadcast();
    const _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); mpTick(); };
    console.log("[MultiplayerEngine V34] 🌐 Đa Người Chơi khởi động — Sub-tab nội bộ · BroadcastChannel · SessionID: " + window.mpData.sessionId.substring(0,8));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 2400); });
  } else {
    setTimeout(init, 2400);
  }
})();
