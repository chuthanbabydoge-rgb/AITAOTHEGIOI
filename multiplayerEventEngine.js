(function() {
  "use strict";
  const SAVE_KEY = "cgv6_mp_events_v34";

  window.mpEventData = {
    events: [],
    activeEvents: [],
    participations: {},
    version: "V34"
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.mpEventData)); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.mpEventData = Object.assign(window.mpEventData, JSON.parse(d));
    } catch(e) {}
  }

  // Loại sự kiện đa người chơi
  const EVENT_TYPES = [
    { type:"boss_hunt", name:"Săn Boss Toàn Cầu", icon:"👹", desc:"Tất cả người chơi cùng tiêu diệt Boss huyền thoại", reward:"5000 linh thạch + Boss Loot" },
    { type:"kingdom_war", name:"Chiến Tranh Vương Quốc", icon:"⚔️", desc:"Các vương quốc cạnh tranh điểm chiến thắng trong 100 năm", reward:"Danh hiệu + Lãnh thổ" },
    { type:"sect_tournament", name:"Giải Đấu Tông Môn", icon:"🏯", desc:"Các tông môn thi đấu tranh chức vị đứng đầu", reward:"Bí Thuật Thần Cấp + Uy Danh" },
    { type:"world_championship", name:"Vương Quốc Vô Địch", icon:"🏆", desc:"Giải đấu toàn thế giới — ai mạnh nhất?", reward:"Danh Hiệu Thế Giới + Thần Lực" },
    { type:"divine_trial", name:"Thử Thách Thần Thánh", icon:"⚡", desc:"Vượt qua thử thách của các Thần — nhận phúc lành", reward:"Thần Điểm + Phúc Lành" },
    { type:"merchant_fest", name:"Hội Chợ Thương Nhân", icon:"💰", desc:"Giao dịch sôi nổi — bonus kinh tế 3 ngày", reward:"Giao dịch không thuế + Kinh tế Bonus" }
  ];

  // Tạo sự kiện mới
  window.mpCreateEvent = function(type, durationYears) {
    const template = EVENT_TYPES.find(e => e.type === type) || EVENT_TYPES[0];
    load();
    const evt = {
      id: "evt_" + Date.now().toString(36),
      type: type,
      name: template.name,
      icon: template.icon,
      desc: template.desc,
      reward: template.reward,
      startYear: window.year || 0,
      endYear: (window.year || 0) + (durationYears || 50),
      participants: [],
      scores: {},
      status: "active",
      createdBy: typeof window.mpGetCurrentPlayerName === 'function' ? window.mpGetCurrentPlayerName() : "Hệ Thống",
      ts: Date.now()
    };
    window.mpEventData.events.unshift(evt);
    window.mpEventData.activeEvents = window.mpEventData.events.filter(e => e.status === "active");
    save();
    if (typeof window.mpBroadcast === 'function') window.mpBroadcast("event", { action:"created", evt });
    if (typeof window.mpSystemMsg === 'function') window.mpSystemMsg("global", `${template.icon} SỰ KIỆN MỚI: "${template.name}" đã bắt đầu! Phần thưởng: ${template.reward}`);
    if (typeof window.waeAddAlert === 'function') window.waeAddAlert("high", `${template.icon} Sự Kiện: ${template.name}`, `Bắt đầu năm ${evt.startYear} · Kết thúc năm ${evt.endYear}. Tham gia để nhận: ${template.reward}`, "boss");
    return evt;
  };

  // Tham gia sự kiện
  window.mpJoinEvent = function(evtId) {
    load();
    const evt = window.mpEventData.events.find(e => e.id === evtId);
    if (!evt || evt.status !== "active") return { ok: false, msg: "Sự kiện không còn hoạt động." };
    const playerName = typeof window.mpGetCurrentPlayerName === 'function' ? window.mpGetCurrentPlayerName() : "Ẩn Danh";
    if (!evt.participants.includes(playerName)) {
      evt.participants.push(playerName);
      if (!evt.scores[playerName]) evt.scores[playerName] = 0;
    }
    window.mpEventData.participations[evtId] = true;
    save();
    if (typeof window.mpSystemMsg === 'function') window.mpSystemMsg("global", `✅ ${playerName} đã tham gia sự kiện "${evt.name}"`);
    return { ok: true, evt };
  };

  // Nhận event từ tab khác
  window.mpReceiveEvent = function(msg) {
    if (!msg || !msg.data) return;
    load();
    const { action, evt } = msg.data;
    if (action === "created" && evt) {
      if (!window.mpEventData.events.find(e => e.id === evt.id)) {
        window.mpEventData.events.unshift(evt);
        window.mpEventData.activeEvents = window.mpEventData.events.filter(e => e.status === "active");
        save();
      }
    }
  };

  // Auto-spawn events tự động từ game
  let _evtTick = 0;
  function eventTick() {
    _evtTick++;
    if (!window.world || !window.world.name) return;
    const yr = window.year || 0;
    const active = window.mpEventData.activeEvents;

    // Kiểm tra boss event khi boss xuất hiện
    if (_evtTick % 100 === 0) {
      const bosses = (window.wbv31Data && window.wbv31Data.activeBosses) || [];
      const mythicBoss = bosses.find(b => b.tier === "mythic" || b.tier === "divine");
      if (mythicBoss && !active.find(e => e.type === "boss_hunt" && e.startYear === yr)) {
        window.mpCreateEvent("boss_hunt", 20);
      }
    }

    // Tự động kết thúc events hết hạn
    if (_evtTick % 50 === 0) {
      let changed = false;
      window.mpEventData.events.forEach(e => {
        if (e.status === "active" && yr > e.endYear) {
          e.status = "ended";
          changed = true;
          if (typeof window.mpSystemMsg === 'function') window.mpSystemMsg("global", `🏁 Sự kiện "${e.name}" đã kết thúc! Năm ${yr}`);
        }
      });
      if (changed) {
        window.mpEventData.activeEvents = window.mpEventData.events.filter(e => e.status === "active");
        save();
      }
    }
  }

  // Render panel events
  window.mpEventsRenderPanel = function() {
    const panel = document.getElementById("panel-mp-events");
    if (!panel) return;
    load();
    const yr = window.year || 0;
    const active = (window.mpEventData.activeEvents || []).filter(e => e.status === "active");
    const ended = (window.mpEventData.events || []).filter(e => e.status === "ended").slice(0,5);
    const myParticipations = window.mpEventData.participations || {};

    let html = `<div style="padding:16px;font-family:'Noto Serif SC',serif;color:#e2e8f0">
      <h2 style="color:#fbbf24;margin:0 0 4px">🏆 Sự Kiện Đa Người Chơi</h2>
      <p style="color:#94a3b8;margin:0 0 16px;font-size:13px">Năm ${yr} · ${active.length} sự kiện đang diễn ra</p>

      <!-- Tạo sự kiện -->
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:14px;margin-bottom:16px">
        <div style="font-size:12px;color:#fbbf24;font-weight:bold;margin-bottom:10px">⚡ KHỞI ĐỘNG SỰ KIỆN</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${EVENT_TYPES.map(e => `<button onclick="mpStartEvent('${e.type}')" style="padding:6px 12px;background:#1e293b;border:1px solid #fbbf2444;border-radius:6px;color:#fbbf24;cursor:pointer;font-size:12px;white-space:nowrap">${e.icon} ${e.name.split(" ").slice(-2).join(" ")}</button>`).join("")}
        </div>
      </div>

      <!-- Sự kiện đang diễn ra -->
      ${active.length > 0 ? `<div style="margin-bottom:16px">
        <div style="font-size:12px;color:#22c55e;font-weight:bold;margin-bottom:8px">🔥 SỰ KIỆN ĐANG DIỄN RA (${active.length})</div>
        ${active.map(e => {
          const joined = myParticipations[e.id];
          const remaining = e.endYear - yr;
          return `<div style="background:#0f172a;border:1px solid ${joined?'#22c55e':'#1e293b'};border-radius:10px;padding:14px;margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
              <div style="font-size:16px;font-weight:bold;color:#e2e8f0">${e.icon} ${e.name}</div>
              <span style="font-size:11px;color:#475569">Còn ${remaining} năm</span>
            </div>
            <div style="font-size:12px;color:#94a3b8;margin-bottom:6px">${e.desc}</div>
            <div style="font-size:12px;color:#fbbf24;margin-bottom:8px">🎁 Phần thưởng: ${e.reward}</div>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="font-size:11px;color:#475569">👥 ${e.participants.length} người tham gia</span>
              ${joined ? `<span style="font-size:12px;color:#22c55e;font-weight:bold">✅ Đã Tham Gia</span>` :
                `<button onclick="mpDoJoinEvent('${e.id}')" style="padding:5px 14px;background:linear-gradient(135deg,#fbbf24,#d97706);border:none;border-radius:6px;color:#0f172a;cursor:pointer;font-size:12px;font-weight:bold">Tham Gia!</button>`}
            </div>
          </div>`;
        }).join("")}
      </div>` : `<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:20px;text-align:center;margin-bottom:16px;color:#475569">
        <div style="font-size:32px;margin-bottom:8px">🏆</div>
        <p>Chưa có sự kiện nào. Hãy tạo sự kiện đầu tiên!</p>
      </div>`}

      <!-- Sự kiện đã kết thúc -->
      ${ended.length > 0 ? `<div>
        <div style="font-size:12px;color:#475569;font-weight:bold;margin-bottom:8px">📋 SỰ KIỆN ĐÃ KẾT THÚC</div>
        ${ended.map(e => `<div style="background:#0f172a;border:1px solid #1e293b;border-radius:6px;padding:8px 12px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:12px;color:#475569">${e.icon} ${e.name}</span>
          <span style="font-size:11px;color:#334155">Năm ${e.startYear}~${e.endYear}</span>
        </div>`).join("")}
      </div>` : ""}
    </div>`;
    panel.innerHTML = html;
  };

  window.mpStartEvent = function(type) {
    window.mpCreateEvent(type, 50);
    window.mpEventsRenderPanel();
  };
  window.mpDoJoinEvent = function(id) {
    const result = window.mpJoinEvent(id);
    if (result.ok) window.mpEventsRenderPanel();
    else alert(result.msg);
  };

  function init() {
    load();
    window.mpEventData.activeEvents = (window.mpEventData.events || []).filter(e => e.status === "active");
    const _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); eventTick(); };
    console.log("[MultiplayerEventEngine V34] 🏆 Sự Kiện Đa Người Chơi khởi động — 6 loại sự kiện · Auto-spawn.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 2700); });
  } else {
    setTimeout(init, 2700);
  }
})();
