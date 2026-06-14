(function() {
  "use strict";
  const SAVE_KEY = "cgv6_universe_hub_registry_v73";

  var state = {
    activeTab: "worlds",
    worldFilter: "all",
    searchQuery: "",
    rankBy: "civScore",
    activePortal: null,
    visitingWorld: null,
    selectedWorldId: null,
    mapInitialized: false
  };

  var TABS = [
    { id: "worlds",    icon: "🌍", label: "Worlds" },
    { id: "creators",  icon: "👤", label: "Creators" },
    { id: "map",       icon: "🗺️", label: "Universe Map" },
    { id: "portals",   icon: "🌀", label: "Portals" },
    { id: "events",    icon: "🎯", label: "Events" },
    { id: "rankings",  icon: "🏆", label: "Rankings" }
  ];

  function num(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(0) + "K";
    return String(n);
  }

  function civTier(score) {
    if (score >= 15000) return { label: "Mythic", color: "#ef4444" };
    if (score >= 10000) return { label: "Legendary", color: "#f59e0b" };
    if (score >= 7000) return { label: "Master", color: "#8b5cf6" };
    if (score >= 4000) return { label: "Elite", color: "#3b82f6" };
    return { label: "Active", color: "#10b981" };
  }

  function tabBar() {
    return '<div style="display:flex;gap:4px;padding:10px 12px 0;background:#0a0a1a;border-bottom:1px solid #1e1e3a;flex-wrap:wrap">' +
      TABS.map(function(t) {
        var active = state.activeTab === t.id;
        return '<button onclick="uhubV73SwitchTab(\'' + t.id + '\')" style="padding:6px 12px;border-radius:6px 6px 0 0;border:1px solid ' + (active ? "#8b5cf6" : "#1e1e3a") + ';background:' + (active ? "#1a0a3a" : "transparent") + ';color:' + (active ? "#a78bfa" : "#9ca3af") + ';cursor:pointer;font-size:12px;font-weight:' + (active ? "600" : "normal") + ';white-space:nowrap">' + t.icon + ' ' + t.label + '</button>';
      }).join("") + '</div>';
  }

  function renderWorldCard(w) {
    var d = window.uhub73GetData ? window.uhub73GetData() : {};
    var portals = d.portals || [];
    var visited = d.visited || [];
    var following = d.following || [];
    var hasPortal = portals.some(function(p) { return p.worldId === w.id; });
    var isVisited = visited.includes(w.id);
    var isFollowing = following.includes(w.id);
    var tier = civTier(w.civScore);
    return '<div style="background:#0f0f1e;border:1px solid ' + (w.featured ? "#f59e0b44" : "#1e1e3a") + ';border-radius:10px;padding:14px;margin-bottom:10px">' +
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px">' +
        '<div>' +
          '<div style="font-weight:700;color:#e5e7eb;font-size:14px">' + (w.featured ? "⭐ " : "") + w.name + '</div>' +
          '<div style="color:#9ca3af;font-size:11px;margin-top:2px">by ' + w.creator + ' · ' + w.age + ' năm · ' + num(w.population) + ' dân</div>' +
        '</div>' +
        '<span style="padding:3px 8px;border-radius:12px;font-size:10px;font-weight:700;background:' + tier.color + '22;color:' + tier.color + '">' + tier.label + '</span>' +
      '</div>' +
      '<div style="color:#d1d5db;font-size:11px;margin-bottom:10px;line-height:1.5">' + w.description + '</div>' +
      '<div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap">' +
        w.tags.map(function(tag) { return '<span style="padding:2px 8px;border-radius:10px;background:#1e1e3a;color:#a78bfa;font-size:10px">' + tag + '</span>'; }).join("") +
      '</div>' +
      '<div style="display:flex;gap:6px;justify-content:space-between;align-items:center">' +
        '<div style="display:flex;gap:12px">' +
          '<span style="font-size:10px;color:#9ca3af">⚔️ ' + w.wars + ' chiến tranh</span>' +
          '<span style="font-size:10px;color:#9ca3af">🔬 ' + w.discoveries + ' khám phá</span>' +
          '<span style="font-size:10px;color:#9ca3af">🏆 ' + w.civScore.toLocaleString() + ' CivScore</span>' +
        '</div>' +
        '<div style="display:flex;gap:6px">' +
          (isVisited ? '<span style="padding:4px 8px;border-radius:6px;background:#10b98122;color:#10b981;font-size:10px">✅ Đã thăm</span>' : '') +
          (!hasPortal ? '<button onclick="uhubV73OpenPortal(\'' + w.id + '\')" style="padding:4px 10px;border-radius:6px;border:1px solid #8b5cf6;background:#8b5cf622;color:#a78bfa;cursor:pointer;font-size:11px">🌀 Mở Portal</button>' : '<button onclick="uhubV73VisitWorld(\'' + w.id + '\')" style="padding:4px 10px;border-radius:6px;border:1px solid #10b981;background:#10b98122;color:#10b981;cursor:pointer;font-size:11px">🚀 Thăm</button>') +
          '<button onclick="uhubV73ToggleFollow(\'' + w.id + '\')" style="padding:4px 8px;border-radius:6px;border:1px solid ' + (isFollowing ? "#f59e0b" : "#374151") + ';background:' + (isFollowing ? "#f59e0b22" : "transparent") + ';color:' + (isFollowing ? "#f59e0b" : "#9ca3af") + ';cursor:pointer;font-size:11px">' + (isFollowing ? "★ Theo dõi" : "☆ Theo dõi") + '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function renderWorlds() {
    var worlds = window.uhub73GetWorlds ? window.uhub73GetWorlds() : [];
    var filter = state.worldFilter;
    var query  = state.searchQuery.toLowerCase();
    if (filter === "featured") worlds = worlds.filter(function(w) { return w.featured; });
    if (filter === "popular")  worlds = worlds.slice().sort(function(a, b) { return b.population - a.population; });
    if (filter === "new")      worlds = worlds.slice().sort(function(a, b) { return a.age - b.age; });
    if (query) worlds = worlds.filter(function(w) { return w.name.toLowerCase().includes(query) || w.creator.toLowerCase().includes(query) || w.tags.some(function(t) { return t.toLowerCase().includes(query); }); });
    return '<div style="padding:14px">' +
      '<div style="display:flex;gap:8px;margin-bottom:12px;align-items:center;flex-wrap:wrap">' +
        '<input id="uhub73-search" type="text" placeholder="🔍 Tìm thế giới..." value="' + state.searchQuery + '" oninput="uhubV73Search(this.value)" style="flex:1;min-width:140px;padding:7px 10px;border-radius:8px;border:1px solid #1e1e3a;background:#0a0a1a;color:#e5e7eb;font-size:12px">' +
        ['all','featured','popular','new'].map(function(f) {
          var labels = { all:'Tất Cả', featured:'Nổi Bật', popular:'Phổ Biến', new:'Mới' };
          return '<button onclick="uhubV73FilterWorlds(\'' + f + '\')" style="padding:6px 10px;border-radius:6px;border:1px solid ' + (filter === f ? "#8b5cf6" : "#1e1e3a") + ';background:' + (filter === f ? "#8b5cf622" : "transparent") + ';color:' + (filter === f ? "#a78bfa" : "#9ca3af") + ';cursor:pointer;font-size:11px">' + labels[f] + '</button>';
        }).join("") +
      '</div>' +
      '<div style="color:#9ca3af;font-size:11px;margin-bottom:10px">🌍 ' + worlds.length + ' thế giới · Click "Mở Portal" để kết nối</div>' +
      worlds.map(renderWorldCard).join("") +
    '</div>';
  }

  function renderCreators() {
    var creators = window.uhub73GetCreators ? window.uhub73GetCreators() : [];
    var profile = window.uhub73GetProfile ? window.uhub73GetProfile() : {};
    var repColors = { Mythic: "#ef4444", Legendary: "#f59e0b", Master: "#8b5cf6", Elite: "#3b82f6", Active: "#10b981" };
    return '<div style="padding:14px">' +
      '<div style="background:#0f0f1e;border:1px solid #ef444444;border-radius:10px;padding:14px;margin-bottom:14px">' +
        '<div style="font-weight:700;color:#ef4444;font-size:13px;margin-bottom:8px">👤 Hồ Sơ Của Bạn</div>' +
        '<div style="display:flex;align-items:center;gap:12px">' +
          '<div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#ef4444,#f59e0b);display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff">⭐</div>' +
          '<div>' +
            '<div style="font-weight:700;color:#e5e7eb;font-size:14px">' + (profile.creatorName || "Creator") + '</div>' +
            '<div style="color:#f59e0b;font-size:11px">' + (profile.title || "Đấng Sáng Thế") + '</div>' +
            '<div style="color:#9ca3af;font-size:11px">' + (profile.worldAge || 0) + ' năm · ' + num(profile.totalPopulation || 0) + ' dân · ' + (profile.civScore || profile.civilizationScore || 0).toLocaleString() + ' CivScore</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div style="font-weight:600;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Creators Khác</div>' +
      creators.map(function(c) {
        var repColor = repColors[c.reputation] || "#9ca3af";
        return '<div style="background:#0f0f1e;border:1px solid #1e1e3a;border-radius:10px;padding:12px;margin-bottom:8px;display:flex;align-items:center;gap:12px">' +
          '<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#1e1e3a,#2a1a5a);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">' + c.badge + '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="display:flex;align-items:center;gap:6px">' +
              '<span style="font-weight:700;color:#e5e7eb;font-size:13px">' + c.name + '</span>' +
              '<span style="width:7px;height:7px;border-radius:50%;background:' + (c.online ? "#10b981" : "#374151") + ';flex-shrink:0"></span>' +
            '</div>' +
            '<div style="color:#a78bfa;font-size:11px">' + c.title + '</div>' +
            '<div style="color:#9ca3af;font-size:10px">' + c.worlds + ' thế giới · ' + num(c.totalPop) + ' dân tổng · ' + c.civScore.toLocaleString() + ' CivScore</div>' +
          '</div>' +
          '<span style="padding:3px 8px;border-radius:10px;background:' + repColor + '22;color:' + repColor + ';font-size:10px;font-weight:700;white-space:nowrap">' + c.reputation + '</span>' +
        '</div>';
      }).join("") +
    '</div>';
  }

  function renderMap() {
    return '<div style="padding:14px">' +
      '<div style="font-size:12px;color:#9ca3af;margin-bottom:10px">🗺️ Bản đồ vũ trụ — Click vào hành tinh để xem thông tin</div>' +
      '<div style="position:relative;width:100%;height:300px;border-radius:10px;overflow:hidden;border:1px solid #1e1e3a">' +
        '<canvas id="uhub73-map-canvas" style="width:100%;height:100%;display:block"></canvas>' +
      '</div>' +
      '<div id="uhub73-map-info" style="margin-top:10px;padding:10px;background:#0f0f1e;border-radius:8px;border:1px solid #1e1e3a;font-size:11px;color:#9ca3af;min-height:40px">Click vào hành tinh để xem thông tin thế giới...</div>' +
      '<div style="margin-top:10px;display:flex;gap:12px;flex-wrap:wrap">' +
        '<span style="font-size:10px;color:#f59e0b">⭐ Nổi bật</span>' +
        '<span style="font-size:10px;color:#8b5cf6">🌀 Có Portal</span>' +
        '<span style="font-size:10px;color:#10b981">✅ Đã thăm</span>' +
        '<span style="font-size:10px;color:#3b82f6">🌍 Bình thường</span>' +
        '<span style="font-size:10px;color:#ef4444">⭐ Thế giới của bạn</span>' +
      '</div>' +
    '</div>';
  }

  function renderPortals() {
    var d = window.uhub73GetData ? window.uhub73GetData() : {};
    var portals = d.portals || [];
    var worlds = window.uhub73GetWorlds ? window.uhub73GetWorlds() : [];
    var stats = d.stats || {};
    return '<div style="padding:14px">' +
      '<div style="display:flex;gap:10px;margin-bottom:14px">' +
        [{ icon: "🌀", label: "Portals đã mở", val: stats.totalPortalsOpened || 0 },
         { icon: "🚀", label: "Lượt thăm",     val: stats.totalVisits || 0 },
         { icon: "🌍", label: "Thế giới khám phá", val: stats.totalWorldsDiscovered || 0 }].map(function(s) {
          return '<div style="flex:1;background:#0f0f1e;border:1px solid #1e1e3a;border-radius:8px;padding:10px;text-align:center">' +
            '<div style="font-size:18px">' + s.icon + '</div>' +
            '<div style="font-weight:700;color:#a78bfa;font-size:16px">' + s.val + '</div>' +
            '<div style="color:#9ca3af;font-size:10px">' + s.label + '</div>' +
          '</div>';
        }).join("") +
      '</div>' +
      (portals.length === 0
        ? '<div style="text-align:center;padding:30px;color:#9ca3af;font-size:13px">🌀 Chưa mở portal nào<br><span style="font-size:11px">Vào tab Worlds và click "Mở Portal" để kết nối</span></div>'
        : '<div><div style="font-weight:600;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Portals Đang Mở (' + portals.length + ')</div>' +
            portals.map(function(portal) {
              var world = worlds.find(function(w) { return w.id === portal.worldId; }) || {};
              return '<div style="background:#0f0f1e;border:1px solid #8b5cf644;border-radius:10px;padding:12px;margin-bottom:8px">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
                  '<div>' +
                    '<div style="font-weight:700;color:#a78bfa;font-size:13px">🌀 ' + portal.worldName + '</div>' +
                    '<div style="color:#9ca3af;font-size:10px">Mở năm ' + portal.openedYear + ' · ' + portal.visits + ' lượt thăm</div>' +
                  '</div>' +
                  '<span style="padding:3px 8px;border-radius:10px;background:#10b98122;color:#10b981;font-size:10px">' + portal.status + '</span>' +
                '</div>' +
                '<div style="display:flex;gap:6px">' +
                  '<button onclick="uhubV73VisitWorld(\'' + portal.worldId + '\')" style="padding:5px 12px;border-radius:6px;border:1px solid #10b981;background:#10b98122;color:#10b981;cursor:pointer;font-size:11px">🚀 Thăm ngay</button>' +
                  (world.tags ? world.tags.slice(0, 2).map(function(tag) { return '<span style="padding:3px 8px;border-radius:10px;background:#1e1e3a;color:#9ca3af;font-size:10px">' + tag + '</span>'; }).join("") : '') +
                '</div>' +
              '</div>';
            }).join("") + '</div>') +
      '<div style="margin-top:14px;background:#1a0a2a;border:1px solid #8b5cf644;border-radius:10px;padding:12px">' +
        '<div style="font-weight:700;color:#a78bfa;font-size:12px;margin-bottom:6px">🥽 XR Portal Mode</div>' +
        '<div style="color:#9ca3af;font-size:11px;line-height:1.5">Với Meta Quest hoặc Apple Vision Pro: bước qua portal như cửa thực tế · Quan sát thế giới khác bằng góc nhìn 360° · Tương tác với NPC trong thế giới khác</div>' +
        '<div style="margin-top:8px;padding:6px 10px;background:#0a0a1a;border-radius:6px;font-size:10px;color:#6b7280">XR Readiness Score: ████████░░ 82% — Compatible với V72 XR World Engine</div>' +
      '</div>' +
    '</div>';
  }

  function renderEvents() {
    var events = window.uhub73GetEvents ? window.uhub73GetEvents() : [];
    var stats = (window.uhub73GetData ? window.uhub73GetData() : {}).stats || {};
    var typeColors = { cross_world: "#ef4444", platform: "#f59e0b", community: "#10b981" };
    var typeLabels = { cross_world: "Liên Thế Giới", platform: "Toàn Nền Tảng", community: "Cộng Đồng" };
    return '<div style="padding:14px">' +
      '<div style="background:#0f0f1e;border:1px solid #f59e0b44;border-radius:10px;padding:12px;margin-bottom:14px;display:flex;align-items:center;gap:12px">' +
        '<div style="font-size:24px">🎯</div>' +
        '<div>' +
          '<div style="font-weight:700;color:#f59e0b">Sự Kiện Đang Diễn Ra</div>' +
          '<div style="color:#9ca3af;font-size:11px">Đã tham gia ' + (stats.totalEventsJoined || 0) + ' sự kiện · Tham gia để nhận phần thưởng và badge đặc biệt</div>' +
        '</div>' +
      '</div>' +
      events.map(function(ev) {
        var tc = typeColors[ev.type] || "#9ca3af";
        var tl = typeLabels[ev.type] || ev.type;
        var isActive = ev.status === "active";
        return '<div style="background:#0f0f1e;border:1px solid ' + tc + '33;border-radius:10px;padding:14px;margin-bottom:10px">' +
          '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px">' +
            '<div style="font-weight:700;color:#e5e7eb;font-size:14px">' + ev.name + '</div>' +
            '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">' +
              '<span style="padding:2px 8px;border-radius:10px;background:' + tc + '22;color:' + tc + ';font-size:10px">' + tl + '</span>' +
              '<span style="padding:2px 8px;border-radius:10px;background:' + (isActive ? "#10b98122" : "#37415122") + ';color:' + (isActive ? "#10b981" : "#9ca3af") + ';font-size:10px">' + (isActive ? "🟢 Đang diễn ra" : "🕐 Sắp diễn ra") + '</span>' +
            '</div>' +
          '</div>' +
          '<div style="color:#d1d5db;font-size:11px;margin-bottom:8px;line-height:1.5">' + ev.desc + '</div>' +
          '<div style="background:#0a0a1a;border-radius:6px;padding:8px;margin-bottom:10px;font-size:11px">' +
            '<span style="color:#f59e0b">🎁 Phần thưởng: </span><span style="color:#e5e7eb">' + ev.reward + '</span>' +
          '</div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between">' +
            '<span style="font-size:10px;color:#9ca3af">⏰ Kết thúc trong ' + ev.endsIn + '</span>' +
            (isActive ? '<button onclick="uhubV73JoinEvent(\'' + ev.id + '\')" style="padding:6px 14px;border-radius:6px;border:1px solid ' + tc + ';background:' + tc + '22;color:' + tc + ';cursor:pointer;font-size:11px;font-weight:700">Tham Gia →</button>' : '<button disabled style="padding:6px 14px;border-radius:6px;border:1px solid #374151;background:transparent;color:#6b7280;cursor:default;font-size:11px">Chưa mở</button>') +
          '</div>' +
        '</div>';
      }).join("") +
    '</div>';
  }

  function renderRankings() {
    var rankings = window.uhub73GetRankings ? window.uhub73GetRankings() : [];
    var rankFields = [
      { id: "civScore",   label: "Civilization Score" },
      { id: "worlds",     label: "Số Thế Giới" },
      { id: "totalPop",   label: "Dân Số" }
    ];
    var rb = state.rankBy;
    var sorted = rankings.slice().sort(function(a, b) { return (b[rb] || 0) - (a[rb] || 0); });
    return '<div style="padding:14px">' +
      '<div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap">' +
        rankFields.map(function(rf) {
          return '<button onclick="uhubV73RankBy(\'' + rf.id + '\')" style="padding:5px 10px;border-radius:6px;border:1px solid ' + (rb === rf.id ? "#f59e0b" : "#1e1e3a") + ';background:' + (rb === rf.id ? "#f59e0b22" : "transparent") + ';color:' + (rb === rf.id ? "#f59e0b" : "#9ca3af") + ';cursor:pointer;font-size:11px">' + rf.label + '</button>';
        }).join("") +
      '</div>' +
      '<div style="background:#0f0f1e;border:1px solid #1e1e3a;border-radius:10px;overflow:hidden">' +
        '<div style="display:grid;grid-template-columns:32px 1fr auto auto;gap:8px;padding:8px 12px;border-bottom:1px solid #1e1e3a;font-size:10px;color:#6b7280;font-weight:600;text-transform:uppercase">' +
          '<span>#</span><span>Creator</span><span>Worlds</span><span>Score</span>' +
        '</div>' +
        sorted.map(function(c, i) {
          var rankColor = i === 0 ? "#f59e0b" : i === 1 ? "#9ca3af" : i === 2 ? "#f97316" : "#374151";
          var rankIcon  = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "#" + (i + 1);
          var tier = civTier(c.civScore || 0);
          return '<div style="display:grid;grid-template-columns:32px 1fr auto auto;gap:8px;padding:10px 12px;border-bottom:1px solid #0a0a1a;align-items:center;background:' + (c.isPlayer ? "#ef44440a" : "transparent") + '">' +
            '<span style="font-size:13px;font-weight:700;color:' + rankColor + ';text-align:center">' + rankIcon + '</span>' +
            '<div>' +
              '<div style="font-weight:' + (c.isPlayer ? "700" : "500") + ';color:' + (c.isPlayer ? "#ef4444" : "#e5e7eb") + ';font-size:12px">' + (c.badge || "🌍") + ' ' + c.name + '</div>' +
              '<div style="color:#9ca3af;font-size:10px">' + (c.title || "") + '</div>' +
            '</div>' +
            '<span style="font-size:11px;color:#9ca3af;text-align:right">' + (c.worlds || 0) + '</span>' +
            '<div style="text-align:right">' +
              '<div style="font-weight:700;color:' + tier.color + ';font-size:12px">' + (c.civScore || 0).toLocaleString() + '</div>' +
              '<div style="font-size:9px;color:' + tier.color + '">' + tier.label + '</div>' +
            '</div>' +
          '</div>';
        }).join("") +
      '</div>' +
    '</div>';
  }

  function renderContent() {
    if (state.activeTab === "worlds")    return renderWorlds();
    if (state.activeTab === "creators")  return renderCreators();
    if (state.activeTab === "map")       return renderMap();
    if (state.activeTab === "portals")   return renderPortals();
    if (state.activeTab === "events")    return renderEvents();
    if (state.activeTab === "rankings")  return renderRankings();
    return "";
  }

  function renderHeader() {
    var profile = window.uhub73GetProfile ? window.uhub73GetProfile() : {};
    var stats = window.uhub73GetStats ? window.uhub73GetStats() : {};
    var worlds = window.uhub73GetWorlds ? window.uhub73GetWorlds() : [];
    return '<div style="padding:12px 16px;background:linear-gradient(135deg,#050510,#0a0a2a);border-bottom:1px solid #1e1e3a;display:flex;align-items:center;justify-content:space-between">' +
      '<div>' +
        '<div style="font-weight:700;color:#a78bfa;font-size:16px">🌌 Universe Hub</div>' +
        '<div style="color:#9ca3af;font-size:11px">' + worlds.length + ' thế giới · Kết nối đa vũ trụ</div>' +
      '</div>' +
      '<div style="display:flex;gap:10px">' +
        '<div style="text-align:center">' +
          '<div style="font-weight:700;color:#f59e0b;font-size:13px">' + (stats.totalPortalsOpened || 0) + '</div>' +
          '<div style="color:#9ca3af;font-size:9px">Portals</div>' +
        '</div>' +
        '<div style="text-align:center">' +
          '<div style="font-weight:700;color:#10b981;font-size:13px">' + (stats.totalVisits || 0) + '</div>' +
          '<div style="color:#9ca3af;font-size:9px">Lượt thăm</div>' +
        '</div>' +
        '<div style="text-align:center">' +
          '<div style="font-weight:700;color:#ef4444;font-size:13px">' + (stats.totalEventsJoined || 0) + '</div>' +
          '<div style="color:#9ca3af;font-size:9px">Sự kiện</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function render() {
    var panel = document.getElementById("panel-universe-hub-v73");
    if (!panel) return;
    panel.style.overflow = "hidden";
    panel.style.height = "100%";
    panel.style.display = "flex";
    panel.style.flexDirection = "column";

    var html = renderHeader() + tabBar() +
      '<div id="uhub73-content" style="flex:1;overflow-y:auto;background:#070712">' +
        renderContent() +
      '</div>';
    panel.innerHTML = html;

    if (state.activeTab === "map") {
      setTimeout(function() {
        if (typeof window.umap73Init === "function") {
          var ok = window.umap73Init("uhub73-map-canvas");
          if (ok) {
            window.umap73OnSelect = function(node) {
              var info = document.getElementById("uhub73-map-info");
              if (!info) return;
              var worlds = window.uhub73GetWorlds ? window.uhub73GetWorlds() : [];
              var world = worlds.find(function(w) { return w.id === node.id; });
              if (world) {
                info.innerHTML = '<strong style="color:#a78bfa">' + world.name + '</strong> <span style="color:#9ca3af">by ' + world.creator + '</span><br>' +
                  '<span style="font-size:10px;color:#d1d5db">' + world.description + '</span><br>' +
                  '<span style="color:#10b981;font-size:10px">👥 ' + num(world.population) + ' · ⚔️ ' + world.wars + ' chiến · 🏆 ' + world.civScore.toLocaleString() + ' CivScore</span>';
              } else if (node.isPlayer) {
                info.innerHTML = '<strong style="color:#ef4444">' + node.name + '</strong> — Thế giới của bạn<br>' +
                  '<span style="font-size:10px;color:#d1d5db">CivScore: ' + node.civScore + '</span>';
              }
            };
          }
        }
      }, 100);
    } else {
      if (typeof window.umap73Stop === "function") window.umap73Stop();
    }
  }

  window.uhub73Render = render;

  window.uhubV73SwitchTab = function(tabId) {
    state.activeTab = tabId;
    var content = document.getElementById("uhub73-content");
    if (content) {
      if (state.activeTab !== "map" && typeof window.umap73Stop === "function") window.umap73Stop();
      content.innerHTML = renderContent();
      if (tabId === "map") {
        setTimeout(function() {
          if (typeof window.umap73Init === "function") window.umap73Init("uhub73-map-canvas");
        }, 100);
      }
    }
  };

  window.uhubV73FilterWorlds = function(filter) {
    state.worldFilter = filter;
    var content = document.getElementById("uhub73-content");
    if (content) content.innerHTML = renderContent();
  };

  window.uhubV73Search = function(query) {
    state.searchQuery = query;
    var content = document.getElementById("uhub73-content");
    if (content) content.innerHTML = renderContent();
  };

  window.uhubV73RankBy = function(field) {
    state.rankBy = field;
    var content = document.getElementById("uhub73-content");
    if (content) content.innerHTML = renderContent();
  };

  window.uhubV73OpenPortal = function(worldId) {
    if (typeof window.uhub73OpenPortal !== "function") return;
    var portal = window.uhub73OpenPortal(worldId);
    if (portal) {
      var worlds = window.uhub73GetWorlds ? window.uhub73GetWorlds() : [];
      var world = worlds.find(function(w) { return w.id === worldId; }) || {};
      var content = document.getElementById("uhub73-content");
      if (content) {
        var banner = document.createElement("div");
        banner.style.cssText = "position:fixed;top:20px;right:20px;z-index:9999;background:linear-gradient(135deg,#1a0a3a,#0a0a2a);border:1px solid #8b5cf6;border-radius:10px;padding:14px 18px;color:#a78bfa;font-size:13px;font-weight:700;box-shadow:0 4px 20px #8b5cf644";
        banner.innerHTML = "🌀 Portal mở đến<br><span style='color:#e5e7eb'>" + world.name + "</span>";
        document.body.appendChild(banner);
        setTimeout(function() { banner.remove(); }, 3000);
        content.innerHTML = renderContent();
      }
    }
  };

  window.uhubV73VisitWorld = function(worldId) {
    if (typeof window.uhub73VisitWorld !== "function") return;
    var world = window.uhub73VisitWorld(worldId);
    if (world) {
      var overlay = document.createElement("div");
      overlay.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background:#050510;display:flex;align-items:center;justify-content:center;flex-direction:column";
      overlay.innerHTML = '<div style="font-size:40px;margin-bottom:16px">🚀</div>' +
        '<div style="color:#a78bfa;font-size:20px;font-weight:700;margin-bottom:8px">Đang thăm</div>' +
        '<div style="color:#e5e7eb;font-size:16px;margin-bottom:6px">' + world.name + '</div>' +
        '<div style="color:#9ca3af;font-size:12px;margin-bottom:24px">by ' + world.creator + '</div>' +
        '<div style="color:#6b7280;font-size:12px;margin-bottom:16px">' + world.description + '</div>' +
        '<div style="display:flex;gap:16px;font-size:12px;color:#9ca3af;margin-bottom:24px">' +
          '<span>👥 ' + num(world.population) + '</span>' +
          '<span>⚔️ ' + world.wars + ' chiến</span>' +
          '<span>🏆 ' + world.civScore.toLocaleString() + '</span>' +
        '</div>' +
        '<button onclick="this.closest(\'div\').remove();if(typeof uhub73Render===\'function\')uhub73Render()" style="padding:10px 24px;border-radius:8px;border:1px solid #8b5cf6;background:#8b5cf622;color:#a78bfa;cursor:pointer;font-size:13px">← Quay về Universe Hub</button>';
      document.body.appendChild(overlay);
    }
  };

  window.uhubV73ToggleFollow = function(worldId) {
    if (typeof window.uhub73GetData !== "function") return;
    var d = window.uhub73GetData();
    if (d.following.includes(worldId)) {
      if (typeof window.uhub73UnfollowWorld === "function") window.uhub73UnfollowWorld(worldId);
    } else {
      if (typeof window.uhub73FollowWorld === "function") window.uhub73FollowWorld(worldId);
    }
    var content = document.getElementById("uhub73-content");
    if (content) content.innerHTML = renderContent();
  };

  window.uhubV73JoinEvent = function(eventId) {
    if (typeof window.uhub73JoinEvent !== "function") return;
    var ev = window.uhub73JoinEvent(eventId);
    if (ev) {
      var banner = document.createElement("div");
      banner.style.cssText = "position:fixed;top:20px;right:20px;z-index:9999;background:linear-gradient(135deg,#1a1a0a,#0a0a2a);border:1px solid #f59e0b;border-radius:10px;padding:14px 18px;color:#f59e0b;font-size:13px;font-weight:700;box-shadow:0 4px 20px #f59e0b44";
      banner.innerHTML = "🎯 Đã tham gia!<br><span style='color:#e5e7eb;font-size:11px'>" + ev.reward + "</span>";
      document.body.appendChild(banner);
      setTimeout(function() { banner.remove(); }, 4000);
      var content = document.getElementById("uhub73-content");
      if (content) content.innerHTML = renderContent();
    }
  };

  function injectSidebarButton() {
    var nav = document.querySelector(".sidebar-nav");
    if (!nav) return;
    if (document.getElementById("btn-universe-hub-v73")) return;
    var btn = document.createElement("button");
    btn.className = "nav-btn";
    btn.id = "btn-universe-hub-v73";
    btn.setAttribute("data-panel", "universe-hub-v73");
    btn.style.cssText = "background:linear-gradient(135deg,#1a0a3a,#0a1a3a);border-color:#8b5cf6;color:#a78bfa;font-weight:700";
    btn.innerHTML = '<span class="nav-icon">🌌</span><span>Universe Hub</span>';
    btn.onclick = function() {
      if (typeof window.showPanel === "function") window.showPanel("universe-hub-v73");
      if (typeof window.uhub73Render === "function") window.uhub73Render();
    };
    nav.appendChild(btn);
  }

  function injectPanel() {
    if (document.getElementById("panel-universe-hub-v73")) return;
    var mainContent = document.querySelector(".main-content") || document.querySelector("main") || document.body;
    var panels = document.querySelectorAll(".panel");
    var lastPanel = panels[panels.length - 1];
    var div = document.createElement("div");
    div.id = "panel-universe-hub-v73";
    div.className = "panel";
    div.style.cssText = "padding:0;overflow:hidden;height:100%;display:none";
    if (lastPanel && lastPanel.parentNode) {
      lastPanel.parentNode.insertBefore(div, lastPanel.nextSibling);
    } else {
      mainContent.appendChild(div);
    }
  }

  function init() {
    injectPanel();
    injectSidebarButton();
    console.log("[Universe Hub Registry V73] 🌌 Universe Hub khởi động thành công — tab sidebar mới đầu tiên từ V38");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 18000); });
  } else {
    setTimeout(init, 18000);
  }
})();
