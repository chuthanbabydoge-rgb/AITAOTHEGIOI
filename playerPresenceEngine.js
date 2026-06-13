(function() {
  "use strict";

  // Render panel người chơi trực tuyến
  window.mpPresenceRenderPanel = function() {
    const panel = document.getElementById("panel-players-online");
    if (!panel) return;

    const online = typeof window.mpGetOnlinePlayers === 'function' ? window.mpGetOnlinePlayers() : [];
    const others = typeof window.mpGetOtherPlayers === 'function' ? window.mpGetOtherPlayers() : [];
    const mySid = window.mpData && window.mpData.sessionId;
    const yr = window.year || 0;
    const myName = typeof window.mpGetCurrentPlayerName === 'function' ? window.mpGetCurrentPlayerName() : "Bạn";

    function timeAgo(ts) {
      if (!ts) return "?";
      const diff = Math.floor((Date.now() - ts) / 1000);
      if (diff < 5) return "🟢 Vừa xong";
      if (diff < 30) return "🟢 " + diff + "s trước";
      if (diff < 120) return "🟡 " + diff + "s trước";
      return "🔴 " + Math.floor(diff/60) + "p trước";
    }

    const allAccounts = (window.mpAccountData && window.mpAccountData.accounts) || [];
    const worldSummary = typeof window.mpGetWorldSummary === 'function' ? window.mpGetWorldSummary() : null;

    let html = `<div style="padding:16px;font-family:'Noto Serif SC',serif;color:#e2e8f0">
      <h2 style="color:#60a5fa;margin:0 0 4px">👥 Người Chơi Trực Tuyến</h2>
      <p style="color:#94a3b8;margin:0 0 16px;font-size:13px">Năm ${yr} · ${online.length} người chơi online</p>

      <!-- Bản thân -->
      <div style="background:#0f172a;border:1px solid #1e293b;border-left:3px solid #22c55e;border-radius:8px;padding:12px;margin-bottom:16px">
        <div style="font-size:12px;color:#22c55e;font-weight:bold;margin-bottom:6px">👤 BẠN</div>
        <div style="font-size:13px;color:#e2e8f0;font-weight:bold">${myName}</div>
        <div style="font-size:11px;color:#64748b">Session: ${mySid ? mySid.substring(0,12) : "?"}</div>
        <div style="font-size:11px;color:#22c55e;margin-top:4px">🟢 Đang Online</div>
      </div>

      <!-- Các tab khác -->
      ${others.length > 0 ? `
        <div style="margin-bottom:16px">
          <div style="font-size:12px;color:#94a3b8;font-weight:bold;margin-bottom:8px">🌐 CÁC NGƯỜI CHƠI KHÁC (${others.length})</div>
          ${others.map(p => {
            const accInfo = allAccounts.find(a => a.id === p.accountId);
            const color = accInfo ? accInfo.avatarColor : '#6366f1';
            return `<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px 12px;margin-bottom:8px;display:flex;align-items:center;gap:10px">
              <div style="width:36px;height:36px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:16px;color:white;flex-shrink:0">${(p.name||"?")[0].toUpperCase()}</div>
              <div style="flex:1;min-width:0">
                <div style="font-size:13px;font-weight:bold;color:#e2e8f0">${p.name||"Ẩn Danh"}</div>
                <div style="font-size:11px;color:#64748b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.kingdom ? "🏯 " + p.kingdom : "Không có VQ"} · ${p.realm||"Phàm Nhân"}</div>
                <div style="font-size:11px;color:#475569">${p.world ? "🌍 " + p.world : "Không có TG"}</div>
              </div>
              <div style="text-align:right;flex-shrink:0">
                <div style="font-size:11px;color:#64748b">${timeAgo(p.lastSeen)}</div>
                <button onclick="mpSendFriendRequest('${p.id}')" style="margin-top:4px;padding:2px 8px;background:#1e293b;border:1px solid #3b82f6;border-radius:3px;color:#60a5fa;cursor:pointer;font-size:11px">+ Bạn bè</button>
              </div>
            </div>`;
          }).join("")}
        </div>
      ` : `
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:20px;text-align:center;margin-bottom:16px">
          <div style="font-size:32px;margin-bottom:8px">👋</div>
          <div style="color:#475569;font-size:13px">Bạn đang chơi một mình!</div>
          <div style="color:#334155;font-size:12px;margin-top:4px">Mở một tab trình duyệt mới → tải lại game → người chơi khác sẽ xuất hiện ở đây.</div>
        </div>
      `}

      <!-- Tất cả tài khoản trong máy -->
      ${allAccounts.length > 0 ? `
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px">
          <div style="font-size:12px;color:#94a3b8;font-weight:bold;margin-bottom:8px">📋 TÀI KHOẢN TRONG MÁY (${allAccounts.length})</div>
          ${allAccounts.map(a => `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #0f172a">
            <div style="width:24px;height:24px;border-radius:50%;background:${a.avatarColor||'#6366f1'};display:flex;align-items:center;justify-content:center;font-size:12px;color:white">${(a.username||"?")[0].toUpperCase()}</div>
            <span style="font-size:12px;color:#94a3b8;flex:1">${a.username}</span>
            <span style="font-size:11px;color:#64748b">Cấp ${a.level||1}</span>
          </div>`).join("")}
        </div>
      ` : ""}

      <button onclick="mpPresenceRenderPanel()" style="margin-top:12px;padding:6px 14px;background:#1e293b;border:1px solid #334155;border-radius:4px;color:#94a3b8;cursor:pointer;font-size:12px">🔄 Làm Mới</button>
    </div>`;
    panel.innerHTML = html;
  };

  // Kết bạn (stub — lưu vào friends list)
  window.mpSendFriendRequest = function(targetSessionId) {
    const acc = window.mpAccountData && window.mpAccountData.currentUser;
    if (!acc) { alert("Cần đăng nhập để kết bạn!"); return; }
    const target = (window.mpSessionData && window.mpSessionData.sessions[targetSessionId]);
    if (!target) { alert("Người chơi này không còn online."); return; }
    if (!acc.friends) acc.friends = [];
    const targetName = target.name || "Ẩn Danh";
    if (!acc.friends.includes(targetName)) {
      acc.friends.push(targetName);
      if (typeof window.mpAccountUpdate === 'function') window.mpAccountUpdate({ friends: acc.friends });
    }
    if (typeof window.efAddFeedItem === 'function') {
      window.efAddFeedItem("multiplayer", "🤝", `${acc.username} kết bạn với ${targetName}`, "Mối quan hệ mới được thiết lập.", "normal");
    }
    alert("Đã gửi yêu cầu kết bạn đến " + targetName + "!");
  };

  // Render panel bạn bè
  window.mpFriendsRenderPanel = function() {
    const panel = document.getElementById("panel-mp-friends");
    if (!panel) return;
    const acc = window.mpAccountData && window.mpAccountData.currentUser;
    const friends = (acc && acc.friends) || [];

    panel.innerHTML = `<div style="padding:16px;font-family:'Noto Serif SC',serif;color:#e2e8f0">
      <h2 style="color:#f59e0b;margin:0 0 16px">🤝 Danh Sách Bạn Bè</h2>
      ${!acc ? `<div style="color:#64748b;text-align:center;padding:20px">Cần đăng nhập để xem bạn bè.</div>` :
        friends.length === 0 ? `<div style="text-align:center;padding:20px;color:#475569">
          <div style="font-size:32px;margin-bottom:8px">🤝</div>
          <p>Chưa có bạn bè nào.<br>Đến tab Người Chơi để kết bạn!</p>
          <button onclick="showPanel('players-online');mpPresenceRenderPanel()" style="padding:6px 14px;background:#1e293b;border:1px solid #f59e0b;border-radius:4px;color:#f59e0b;cursor:pointer;font-size:12px">Xem Người Chơi Online</button>
        </div>` :
        `<div>${friends.map(name => `<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px 14px;margin-bottom:8px;display:flex;align-items:center;gap:10px">
          <div style="width:32px;height:32px;border-radius:50%;background:#f59e0b;display:flex;align-items:center;justify-content:center;font-size:14px;color:white">${name[0].toUpperCase()}</div>
          <span style="font-size:13px;color:#e2e8f0">${name}</span>
          <button onclick="mpRemoveFriend('${name}')" style="margin-left:auto;padding:2px 8px;background:#1e293b;border:1px solid #ef4444;border-radius:3px;color:#f87171;cursor:pointer;font-size:11px">Xóa</button>
        </div>`).join("")}</div>`
      }
    </div>`;
  };

  window.mpRemoveFriend = function(name) {
    const acc = window.mpAccountData && window.mpAccountData.currentUser;
    if (!acc) return;
    acc.friends = (acc.friends || []).filter(f => f !== name);
    if (typeof window.mpAccountUpdate === 'function') window.mpAccountUpdate({ friends: acc.friends });
    window.mpFriendsRenderPanel();
  };

  console.log("[PlayerPresenceEngine V34] 🌐 Hiển Thị Người Chơi khởi động — Online list · Friend system sẵn sàng.");
})();
