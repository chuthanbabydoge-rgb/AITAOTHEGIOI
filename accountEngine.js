(function() {
  "use strict";
  const SAVE_KEY = "cgv6_mp_accounts_v34";
  const SESSION_KEY = "cgv6_current_account_v34";

  window.mpAccountData = {
    accounts: [],
    currentUser: null,
    version: "V34"
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ accounts: window.mpAccountData.accounts })); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) {
        const parsed = JSON.parse(d);
        window.mpAccountData.accounts = parsed.accounts || [];
      }
    } catch(e) {}
  }
  function loadSession() {
    try {
      const sid = sessionStorage.getItem(SESSION_KEY);
      if (sid) {
        const acc = window.mpAccountData.accounts.find(a => a.id === sid);
        if (acc) window.mpAccountData.currentUser = acc;
      }
    } catch(e) {}
  }

  // Hash đơn giản cho mật khẩu (client-side only, không dùng cho production)
  function simpleHash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) { h = ((h << 5) + h) + str.charCodeAt(i); h = h & h; }
    return Math.abs(h).toString(36);
  }

  // Đăng ký
  window.mpAccountRegister = function(username, password, avatarColor) {
    load();
    if (!username || username.length < 3) return { ok: false, msg: "Tên phải ít nhất 3 ký tự." };
    if (!password || password.length < 4) return { ok: false, msg: "Mật khẩu phải ít nhất 4 ký tự." };
    if (window.mpAccountData.accounts.find(a => a.username.toLowerCase() === username.toLowerCase())) {
      return { ok: false, msg: "Tên đã tồn tại. Chọn tên khác." };
    }
    const colors = ["#6366f1","#22c55e","#f59e0b","#ef4444","#a855f7","#60a5fa","#f97316","#14b8a6"];
    const acc = {
      id: "acc_" + Date.now().toString(36),
      username: username.trim(),
      passwordHash: simpleHash(password),
      avatarColor: avatarColor || colors[Math.floor(Math.random() * colors.length)],
      level: 1,
      score: 0,
      role: "Người Chơi",
      friends: [],
      createdAt: Date.now(),
      lastLogin: Date.now()
    };
    window.mpAccountData.accounts.push(acc);
    window.mpAccountData.currentUser = acc;
    sessionStorage.setItem(SESSION_KEY, acc.id);
    save();
    if (typeof window.thtAddMemory === 'function') {
      window.thtAddMemory("creator", `Người Chơi Mới: ${acc.username}`, `${acc.username} đã tạo tài khoản.`, window.year||0);
    }
    return { ok: true, account: acc };
  };

  // Đăng nhập
  window.mpAccountLogin = function(username, password) {
    load();
    const acc = window.mpAccountData.accounts.find(a => a.username.toLowerCase() === username.toLowerCase());
    if (!acc) return { ok: false, msg: "Tài khoản không tồn tại." };
    if (acc.passwordHash !== simpleHash(password)) return { ok: false, msg: "Sai mật khẩu." };
    acc.lastLogin = Date.now();
    window.mpAccountData.currentUser = acc;
    sessionStorage.setItem(SESSION_KEY, acc.id);
    save();
    return { ok: true, account: acc };
  };

  // Đăng xuất
  window.mpAccountLogout = function() {
    window.mpAccountData.currentUser = null;
    sessionStorage.removeItem(SESSION_KEY);
    if (typeof window.mpSendHeartbeat === 'function') window.mpSendHeartbeat();
  };

  // Cập nhật profile
  window.mpAccountUpdate = function(fields) {
    if (!window.mpAccountData.currentUser) return { ok: false, msg: "Chưa đăng nhập." };
    load();
    const acc = window.mpAccountData.accounts.find(a => a.id === window.mpAccountData.currentUser.id);
    if (!acc) return { ok: false, msg: "Tài khoản không tìm thấy." };
    Object.assign(acc, fields);
    window.mpAccountData.currentUser = acc;
    save();
    return { ok: true };
  };

  // Lấy danh sách tài khoản (chỉ public info)
  window.mpGetPublicAccounts = function() {
    return window.mpAccountData.accounts.map(a => ({
      id: a.id, username: a.username, avatarColor: a.avatarColor,
      level: a.level, score: a.score, role: a.role
    }));
  };

  // ─── RENDER PANEL TÀI KHOẢN ───────────────────────────────────────────────
  window.mpAccountRenderPanel = function() {
    const panel = document.getElementById("panel-mp-account");
    if (!panel) return;
    const acc = window.mpAccountData.currentUser;

    if (acc) {
      _renderProfileView(panel, acc);
    } else {
      _renderLoginView(panel);
    }
  };

  function _renderLoginView(panel) {
    panel.innerHTML = `<div style="padding:20px;font-family:'Noto Serif SC',serif;color:#e2e8f0;max-width:400px;margin:0 auto">
      <h2 style="color:#22c55e;margin:0 0 20px">👤 Tài Khoản Người Chơi</h2>

      <div id="mp-account-tabs" style="display:flex;gap:8px;margin-bottom:16px">
        <button onclick="mpShowLoginTab('login')" id="tab-login" style="flex:1;padding:8px;background:#22c55e;border:none;border-radius:6px;color:white;cursor:pointer;font-size:13px">Đăng Nhập</button>
        <button onclick="mpShowLoginTab('register')" id="tab-register" style="flex:1;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:13px">Đăng Ký</button>
      </div>

      <div id="mp-login-form">
        <div style="margin-bottom:12px">
          <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Tên đăng nhập</label>
          <input id="mp-login-user" type="text" placeholder="Nhập tên..." style="width:100%;padding:8px 12px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px;box-sizing:border-box">
        </div>
        <div style="margin-bottom:16px">
          <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Mật khẩu</label>
          <input id="mp-login-pass" type="password" placeholder="Nhập mật khẩu..." style="width:100%;padding:8px 12px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px;box-sizing:border-box" onkeydown="if(event.key==='Enter')mpDoLogin()">
        </div>
        <button onclick="mpDoLogin()" style="width:100%;padding:10px;background:linear-gradient(135deg,#22c55e,#16a34a);border:none;border-radius:6px;color:white;cursor:pointer;font-size:14px;font-weight:bold">Đăng Nhập</button>
        <div id="mp-login-msg" style="margin-top:10px;font-size:12px;color:#f87171;text-align:center"></div>
      </div>

      <div id="mp-register-form" style="display:none">
        <div style="margin-bottom:12px">
          <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Tên người chơi (3+ ký tự)</label>
          <input id="mp-reg-user" type="text" placeholder="Tên của bạn..." style="width:100%;padding:8px 12px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px;box-sizing:border-box">
        </div>
        <div style="margin-bottom:12px">
          <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Mật khẩu (4+ ký tự)</label>
          <input id="mp-reg-pass" type="password" placeholder="Mật khẩu..." style="width:100%;padding:8px 12px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px;box-sizing:border-box">
        </div>
        <button onclick="mpDoRegister()" style="width:100%;padding:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;border-radius:6px;color:white;cursor:pointer;font-size:14px;font-weight:bold">Tạo Tài Khoản</button>
        <div id="mp-reg-msg" style="margin-top:10px;font-size:12px;color:#f87171;text-align:center"></div>
      </div>

      <p style="color:#334155;font-size:11px;margin-top:20px;text-align:center">Dữ liệu lưu trong trình duyệt · Không cần kết nối internet</p>
    </div>`;
  }

  function _renderProfileView(panel, acc) {
    const colors = ["#6366f1","#22c55e","#f59e0b","#ef4444","#a855f7","#60a5fa","#f97316","#14b8a6"];
    const allAccounts = window.mpAccountData.accounts;
    panel.innerHTML = `<div style="padding:20px;font-family:'Noto Serif SC',serif;color:#e2e8f0">
      <h2 style="color:#22c55e;margin:0 0 16px">👤 Hồ Sơ Người Chơi</h2>

      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:16px;margin-bottom:16px;display:flex;align-items:center;gap:16px">
        <div style="width:60px;height:60px;border-radius:50%;background:${acc.avatarColor||'#6366f1'};display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:bold;color:white;box-shadow:0 0 20px ${acc.avatarColor||'#6366f1'}55">${(acc.username||"?")[0].toUpperCase()}</div>
        <div>
          <div style="font-size:18px;font-weight:bold;color:#e2e8f0">${acc.username}</div>
          <div style="font-size:12px;color:#64748b">${acc.role||"Người Chơi"} · Cấp ${acc.level||1}</div>
          <div style="font-size:12px;color:#fbbf24">⭐ ${acc.score||0} điểm</div>
        </div>
        <button onclick="mpAccountLogout();mpAccountRenderPanel()" style="margin-left:auto;padding:6px 14px;background:#1e293b;border:1px solid #475569;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:12px">Đăng Xuất</button>
      </div>

      <!-- Đổi màu avatar -->
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-bottom:16px">
        <div style="font-size:12px;color:#94a3b8;margin-bottom:8px">🎨 Màu Avatar</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${colors.map(c => `<div onclick="mpAccountUpdate({avatarColor:'${c}'});mpAccountRenderPanel()" style="width:28px;height:28px;border-radius:50%;background:${c};cursor:pointer;border:2px solid ${c===acc.avatarColor?'white':'transparent'};transition:transform 0.2s" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'"></div>`).join("")}
        </div>
      </div>

      <!-- Tất cả tài khoản trong máy -->
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px">
        <div style="font-size:12px;color:#94a3b8;margin-bottom:8px">📋 Tài Khoản Trong Máy (${allAccounts.length})</div>
        ${allAccounts.map(a => `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #0f172a">
          <div style="width:24px;height:24px;border-radius:50%;background:${a.avatarColor||'#6366f1'};display:flex;align-items:center;justify-content:center;font-size:12px;color:white">${(a.username||"?")[0].toUpperCase()}</div>
          <span style="font-size:12px;color:${a.id===acc.id?'#22c55e':'#94a3b8'}">${a.username}${a.id===acc.id?' (bạn)':''}</span>
          ${a.id !== acc.id ? `<button onclick="mpSwitchAccount('${a.id}')" style="margin-left:auto;padding:2px 8px;background:#1e293b;border:1px solid #334155;border-radius:3px;color:#64748b;cursor:pointer;font-size:11px">Chuyển</button>` : ""}
        </div>`).join("")}
      </div>
    </div>`;
  }

  // Global functions cho HTML onclick
  window.mpShowLoginTab = function(tab) {
    document.getElementById("mp-login-form").style.display = tab === "login" ? "" : "none";
    document.getElementById("mp-register-form").style.display = tab === "register" ? "" : "none";
    document.getElementById("tab-login").style.background = tab === "login" ? "#22c55e" : "#1e293b";
    document.getElementById("tab-login").style.color = tab === "login" ? "white" : "#94a3b8";
    document.getElementById("tab-register").style.background = tab === "register" ? "#6366f1" : "#1e293b";
    document.getElementById("tab-register").style.color = tab === "register" ? "white" : "#94a3b8";
  };
  window.mpDoLogin = function() {
    const user = (document.getElementById("mp-login-user") || {}).value || "";
    const pass = (document.getElementById("mp-login-pass") || {}).value || "";
    const result = window.mpAccountLogin(user, pass);
    const msg = document.getElementById("mp-login-msg");
    if (result.ok) { window.mpAccountRenderPanel(); if (typeof window.mpRenderPanel === 'function') window.mpRenderPanel(); }
    else if (msg) { msg.textContent = result.msg; }
  };
  window.mpDoRegister = function() {
    const user = (document.getElementById("mp-reg-user") || {}).value || "";
    const pass = (document.getElementById("mp-reg-pass") || {}).value || "";
    const result = window.mpAccountRegister(user, pass);
    const msg = document.getElementById("mp-reg-msg");
    if (result.ok) { window.mpAccountRenderPanel(); if (typeof window.mpRenderPanel === 'function') window.mpRenderPanel(); }
    else if (msg) { msg.textContent = result.msg; }
  };
  window.mpSwitchAccount = function(accId) {
    load();
    const acc = window.mpAccountData.accounts.find(a => a.id === accId);
    if (acc) {
      window.mpAccountData.currentUser = acc;
      sessionStorage.setItem(SESSION_KEY, acc.id);
      window.mpAccountRenderPanel();
    }
  };

  function init() {
    load();
    loadSession();
    console.log("[AccountEngine V34] 👤 Hệ Thống Tài Khoản khởi động —", window.mpAccountData.accounts.length, "tài khoản ·", window.mpAccountData.currentUser ? "Đã đăng nhập: " + window.mpAccountData.currentUser.username : "Chưa đăng nhập.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 2500); });
  } else {
    setTimeout(init, 2500);
  }
})();
