(function() {
  "use strict";
  const SAVE_KEY = "cgv6_event_feed_v33";
  const MAX_FEED = 300;

  window.eventFeedData = {
    items: [],
    lastYear: 0,
    version: "V33"
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.eventFeedData)); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) {
        const parsed = JSON.parse(d);
        window.eventFeedData = Object.assign(window.eventFeedData, parsed);
      }
    } catch(e) {}
  }

  // Thêm tin tức vào feed
  window.efAddFeedItem = function(source, icon, title, detail, importance) {
    const item = {
      id: Date.now() + Math.random(),
      source: source || "world",
      icon: icon || "📰",
      title: title || "",
      detail: detail || "",
      importance: importance || "normal", // breaking | high | normal | minor
      year: window.year || 0,
      ts: Date.now()
    };
    window.eventFeedData.items.unshift(item);
    if (window.eventFeedData.items.length > MAX_FEED) {
      window.eventFeedData.items = window.eventFeedData.items.slice(0, MAX_FEED);
    }
    save();
    return item;
  };

  window.efGetFeed = function(n, filterImportance) {
    let items = window.eventFeedData.items || [];
    if (filterImportance) items = items.filter(i => i.importance === filterImportance);
    return items.slice(0, n || 50);
  };

  window.efGetFeedBySource = function(source) {
    return (window.eventFeedData.items || []).filter(i => i.source === source).slice(0, 30);
  };

  // Thu thập sự kiện từ các engine mỗi tick
  let _lastProcessedYear = -1;

  function collectEvents() {
    if (!window.world || !window.world.name) return;
    const yr = window.year || 0;
    if (yr === _lastProcessedYear) return;
    _lastProcessedYear = yr;
    window.eventFeedData.lastYear = yr;

    // === Từ worldHistory (historicalTimeline.js) ===
    const history = window.worldHistory || [];
    const newEvents = history.filter(e => e.year === yr);
    newEvents.slice(0, 3).forEach(e => {
      if (!e._feedAdded) {
        e._feedAdded = true;
        const imp = (e.type === "war" || e.type === "divine") ? "high" : "normal";
        window.efAddFeedItem("history", e.icon || "📜", e.title || e.text || "", e.detail || "", imp);
      }
    });

    // === Từ warEngine ===
    const wars = window.warsActive || [];
    wars.forEach(w => {
      if (w.startYear === yr && !w._feedAdded) {
        w._feedAdded = true;
        window.efAddFeedItem("war", "⚔️", `${w.attacker||"?"} tuyên chiến ${w.defender||"?"}`,
          `Nguyên nhân: ${w.reason||"không rõ"}. Quân lực: ${Math.round(w.attackPower||0)} vs ${Math.round(w.defensePower||0)}.`, "breaking");
      }
    });

    // === Từ worldBossEngineV31 ===
    const bosses = (window.wbv31Data && window.wbv31Data.activeBosses) || [];
    bosses.forEach(b => {
      if (b.spawnYear === yr && !b._feedAdded) {
        b._feedAdded = true;
        const tierIcon = {rare:"🟢",epic:"🔵",legendary:"🟣",mythic:"🟤",divine:"🟡",creator:"🔴"}[b.tier] || "👹";
        window.efAddFeedItem("boss", tierIcon, `Boss ${b.name||"Ẩn Danh"} xuất hiện`,
          `Cấp bậc: ${b.tier||"?"} · HP: ${Math.round(b.hp||0)} · ${b.region||"?"}`, "high");
      }
    });

    // === Từ kingdomEngine ===
    const kingdoms = (window.kingdomData && window.kingdomData.kingdoms) || [];
    kingdoms.forEach(k => {
      if (k.foundYear === yr && !k._feedAdded) {
        k._feedAdded = true;
        window.efAddFeedItem("kingdom", "🏯", `Vương Quốc ${k.name||"?"} thành lập`,
          `Giai đoạn: ${k.stage||"?"} · Dân số: ${window.thtFormatNum ? window.thtFormatNum(k.population||0) : k.population||0}`, "high");
      }
    });

    // === Từ empireEngine ===
    const empires = (window.empireData && window.empireData.empires) || [];
    empires.forEach(e => {
      if (e.foundYear === yr && !e._feedAdded) {
        e._feedAdded = true;
        window.efAddFeedItem("empire", "👑", `Đế Chế ${e.name||"?"} ra đời`,
          `Lãnh thổ: ${(e.territories||[]).length} vùng · Thủ đô: ${e.capital||"?"}`, "breaking");
      }
    });

    // === Từ disasterEngine ===
    const disasters = (window.disasterData && window.disasterData.activeDisasters) || [];
    disasters.forEach(d => {
      if (d.year === yr && !d._feedAdded) {
        d._feedAdded = true;
        window.efAddFeedItem("disaster", "🌋", `Thiên tai: ${d.name||"?"}`,
          `Khu vực: ${d.region||"?"} · Cấp độ: ${d.severity||"?"}`, "high");
      }
    });

    // === Từ plagueEngine ===
    const plagues = (window.plagueData && window.plagueData.activePlagues) || [];
    plagues.forEach(p => {
      if (p.year === yr && !p._feedAdded) {
        p._feedAdded = true;
        window.efAddFeedItem("plague", "💀", `Đại dịch: ${p.name||"?"}`,
          `Nguồn gốc: ${p.origin||"?"} · Đã lây lan: ${(p.regions||[]).length} vùng`, "high");
      }
    });

    // === Từ divineBeingEngine ===
    const deities = (window.divineBeingData && window.divineBeingData.deities) || [];
    deities.forEach(d => {
      if (d.birthYear === yr && !d._feedAdded) {
        d._feedAdded = true;
        window.efAddFeedItem("divine", "⚡", `Thần ${d.name||"?"} thức tỉnh`,
          `Lĩnh vực: ${d.domain||"?"} · Cấp bậc: ${d.tier||"?"}`, "high");
      }
    });

    // === Từ dynastyEngine ===
    const dynasties = (window.dynastyData && window.dynastyData.dynasties) || [];
    dynasties.forEach(d => {
      if (d.foundYear === yr && !d._feedAdded) {
        d._feedAdded = true;
        window.efAddFeedItem("dynasty", "📜", `Triều đại ${d.name||"?"} khai lập`,
          `Người sáng lập: ${d.founder||"?"} · Quốc gia: ${d.country||"?"}`, "normal");
      }
    });

    save();
  }

  // Render panel tin tức
  window.efRenderPanel = function() {
    const panel = document.getElementById("panel-world-news");
    if (!panel) return;

    const items = window.eventFeedData.items || [];
    const impColors = { breaking:"#ef4444", high:"#f97316", normal:"#60a5fa", minor:"#64748b" };
    const impLabels = { breaking:"🔥 NÓNG", high:"⬆ QUAN TRỌNG", normal:"📰 Tin tức", minor:"📝 Nhỏ" };

    let html = `<div style="padding:16px;font-family:'Noto Serif SC',serif;color:#e2e8f0">
      <h2 style="color:#60a5fa;margin:0 0 4px">📢 Tin Tức Thế Giới</h2>
      <p style="color:#94a3b8;margin:0 0 16px;font-size:13px">Năm ${window.year||0} · ${items.length} tin · Cập nhật mỗi tick</p>`;

    // Bộ lọc
    html += `<div style="margin-bottom:12px;display:flex;gap:6px;flex-wrap:wrap">
      <button onclick="efFilterFeed(null)" style="padding:4px 10px;background:#1e293b;border:1px solid #60a5fa;border-radius:4px;color:#60a5fa;cursor:pointer;font-size:12px">Tất Cả</button>
      <button onclick="efFilterFeed('breaking')" style="padding:4px 10px;background:#1e293b;border:1px solid #ef4444;border-radius:4px;color:#ef4444;cursor:pointer;font-size:12px">🔥 Nóng</button>
      <button onclick="efFilterFeed('war')" style="padding:4px 10px;background:#1e293b;border:1px solid #f97316;border-radius:4px;color:#f97316;cursor:pointer;font-size:12px">⚔️ Chiến</button>
      <button onclick="efFilterFeed('divine')" style="padding:4px 10px;background:#1e293b;border:1px solid #a855f7;border-radius:4px;color:#a855f7;cursor:pointer;font-size:12px">⚡ Thần</button>
      <button onclick="efFilterFeed('boss')" style="padding:4px 10px;background:#1e293b;border:1px solid #ef4444;border-radius:4px;color:#ef4444;cursor:pointer;font-size:12px">👹 Boss</button>
    </div>`;

    html += `<div id="feed-container">`;
    if (items.length === 0) {
      html += `<div style="text-align:center;padding:40px;color:#475569">
        <div style="font-size:40px">📰</div>
        <p>Chưa có tin tức nào.<br>Tạo một thế giới để bắt đầu.</p>
      </div>`;
    } else {
      items.slice(0, 60).forEach(item => {
        const color = impColors[item.importance] || "#64748b";
        const label = impLabels[item.importance] || "";
        html += `<div style="background:#0f172a;border:1px solid #1e293b;border-left:3px solid ${color};border-radius:6px;padding:10px 14px;margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">
            <span style="font-size:13px;font-weight:bold;color:#f1f5f9">${item.icon||"📰"} ${item.title||""}</span>
            <span style="font-size:11px;color:#475569;white-space:nowrap">Năm ${item.year||0}</span>
          </div>
          <p style="margin:0;color:#94a3b8;font-size:12px">${item.detail||""}</p>
          <div style="margin-top:4px;display:flex;gap:8px">
            <span style="font-size:11px;color:${color}">${label}</span>
            <span style="font-size:11px;color:#334155">[${item.source||""}]</span>
          </div>
        </div>`;
      });
    }
    html += `</div></div>`;
    panel.innerHTML = html;
  };

  window.efFilterFeed = function(filterKey) {
    const container = document.querySelector("#feed-container");
    if (!container) return;
    let items = window.eventFeedData.items || [];
    const impColors = { breaking:"#ef4444", high:"#f97316", normal:"#60a5fa", minor:"#64748b" };
    const impLabels = { breaking:"🔥 NÓNG", high:"⬆ QUAN TRỌNG", normal:"📰 Tin tức", minor:"📝 Nhỏ" };

    if (filterKey === "breaking") items = items.filter(i => i.importance === "breaking");
    else if (filterKey === "war") items = items.filter(i => i.source === "war");
    else if (filterKey === "divine") items = items.filter(i => i.source === "divine");
    else if (filterKey === "boss") items = items.filter(i => i.source === "boss");

    if (items.length === 0) { container.innerHTML = `<p style="color:#475569;padding:20px">Không có tin tức phù hợp.</p>`; return; }
    let html = "";
    items.slice(0, 60).forEach(item => {
      const color = impColors[item.importance] || "#64748b";
      const label = impLabels[item.importance] || "";
      html += `<div style="background:#0f172a;border:1px solid #1e293b;border-left:3px solid ${color};border-radius:6px;padding:10px 14px;margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">
          <span style="font-size:13px;font-weight:bold;color:#f1f5f9">${item.icon||"📰"} ${item.title||""}</span>
          <span style="font-size:11px;color:#475569">Năm ${item.year||0}</span>
        </div>
        <p style="margin:0;color:#94a3b8;font-size:12px">${item.detail||""}</p>
        <span style="font-size:11px;color:${color}">${label}</span>
      </div>`;
    });
    container.innerHTML = html;
  };

  function efTick() {
    collectEvents();
  }

  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      efTick();
    };
    console.log("[EventFeedEngine V33] 📢 Bản Tin Sự Kiện khởi động — Thu thập tin tức từ tất cả engines.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 2000); });
  } else {
    setTimeout(init, 2000);
  }
})();
