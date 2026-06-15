(function() {
  "use strict";
  const SAVE_KEY = "cgv6_mv_portals_v124";

  window.mvPortalsV124Data = {
    portals: [],
    multiverseEvents: [],
    eventLog: [],
    totalConnections: 0
  };

  var PORTAL_TYPES = [
    { id: "observation", label: "Quan Sát",    icon: "👁️", color: "#60a5fa", desc: "Chỉ xem — không can thiệp" },
    { id: "trade",       label: "Thương Mại",  icon: "🤝", color: "#34d399", desc: "Trao đổi hàng hóa tri thức" },
    { id: "diplomatic",  label: "Ngoại Giao",  icon: "🏛️", color: "#a855f7", desc: "Thiết lập quan hệ chính thức" },
    { id: "cultural",    label: "Văn Hóa",     icon: "🎭", color: "#f59e0b", desc: "Giao thoa văn hóa hai thế giới" }
  ];

  var MV_EVENTS = [
    { id: "first_contact",       icon: "🌟", name: "First Contact",         color: "#f59e0b", desc: "Hai thế giới tiếp xúc lần đầu — viết vào lịch sử cả hai",
      effect: function(a, b) { return "Thế giới " + a + " và " + b + " lần đầu tiên tiếp xúc. Một trang sử mới mở ra."; } },
    { id: "knowledge_exchange",  icon: "📜", name: "Knowledge Exchange",    color: "#60a5fa", desc: "Trao đổi tri thức khoa học/huyền học",
      effect: function(a, b) { return "Tri thức từ " + a + " truyền sang " + b + ". Cả hai cùng tiến bộ."; } },
    { id: "cultural_influence",  icon: "🎭", name: "Cultural Influence",    color: "#a855f7", desc: "Văn hóa một thế giới ảnh hưởng thế giới kia",
      effect: function(a, b) { return "Văn hóa " + a + " lan toả vào " + b + ". Phong tục mới hình thành."; } },
    { id: "technology_transfer", icon: "⚙️", name: "Technology Transfer",  color: "#34d399", desc: "Chuyển giao công nghệ tiên tiến",
      effect: function(a, b) { return "Công nghệ từ " + a + " được " + b + " tiếp nhận. Kỷ nguyên mới bắt đầu."; } }
  ];

  // Seed demo portals
  var DEMO_PORTALS = [
    { portalId:"pt_001", nameA:"Azureth",   nameB:"Draconia",  universeAId:"u_001", universeBId:"u_002", type:"diplomatic", status:"open",   stability:85, openedAt:120,  visits:34, lastEvent:"first_contact" },
    { portalId:"pt_002", nameA:"Mechatopia",nameB:"Abyssara",  universeAId:"u_004", universeBId:"u_005", type:"trade",      status:"open",   stability:62, openedAt:50,   visits:18, lastEvent:"technology_transfer" },
    { portalId:"pt_003", nameA:"Celestara", nameB:"Sylvaria",  universeAId:"u_006", universeBId:"u_003", type:"cultural",   status:"open",   stability:91, openedAt:200,  visits:56, lastEvent:"cultural_influence" },
    { portalId:"pt_004", nameA:"Sandoria",  nameB:"Aquarion",  universeAId:"u_007", universeBId:"u_008", type:"trade",      status:"closed", stability:40, openedAt:300,  visits:12, lastEvent:"knowledge_exchange" },
    { portalId:"pt_005", nameA:"Azureth",   nameB:"Celestara", universeAId:"u_001", universeBId:"u_006", type:"observation",status:"open",   stability:78, openedAt:90,   visits:27, lastEvent:"first_contact" }
  ];

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.mvPortalsV124Data)); } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.mvPortalsV124Data = JSON.parse(d);
    } catch(e) {}
  }

  window.mpe124OpenPortal = function(universeAId, universeBId, type) {
    var uA = window.mvr124GetById ? window.mvr124GetById(universeAId) : null;
    var uB = window.mvr124GetById ? window.mvr124GetById(universeBId) : null;
    if (!uA || !uB) return null;
    // Check duplicate
    var exists = window.mvPortalsV124Data.portals.find(function(p) {
      return (p.universeAId === universeAId && p.universeBId === universeBId) ||
             (p.universeAId === universeBId && p.universeBId === universeAId);
    });
    if (exists) { exists.status = "open"; save(); return exists; }

    var portal = {
      portalId: "pt_" + Date.now(),
      nameA: uA.universeName.split("—")[0].trim(),
      nameB: uB.universeName.split("—")[0].trim(),
      universeAId: universeAId,
      universeBId: universeBId,
      type: type || "observation",
      status: "open",
      stability: 80 + Math.floor(Math.random() * 20),
      openedAt: window.year || 1,
      visits: 0,
      lastEvent: null
    };
    window.mvPortalsV124Data.portals.push(portal);
    window.mvPortalsV124Data.totalConnections++;
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: window.year || 1, type: "portal", title: "Portal mở: " + portal.nameA + " ↔ " + portal.nameB, color: "#8b5cf6" });
    }
    // Auto first-contact event
    setTimeout(function() { window.mpe124TriggerEvent(portal.portalId, "first_contact"); }, 500);
    save();
    return portal;
  };

  window.mpe124OpenPlayerPortal = function(universeBId, type) {
    return window.mpe124OpenPortal("u_player", universeBId, type || "observation");
  };

  window.mpe124ClosePortal = function(portalId) {
    var p = window.mvPortalsV124Data.portals.find(function(p) { return p.portalId === portalId; });
    if (p) { p.status = "closed"; save(); }
  };

  window.mpe124TriggerEvent = function(portalId, eventId) {
    var p = window.mvPortalsV124Data.portals.find(function(px) { return px.portalId === portalId; });
    if (!p || p.status !== "open") return null;
    var evDef = MV_EVENTS.find(function(e) { return e.id === eventId; });
    if (!evDef) return null;
    p.lastEvent = eventId;
    p.visits++;
    var desc = evDef.effect(p.nameA, p.nameB);
    var logEntry = {
      year: window.year || 1,
      portalId: portalId,
      eventId: eventId,
      eventName: evDef.name,
      eventIcon: evDef.icon,
      nameA: p.nameA,
      nameB: p.nameB,
      description: desc,
      color: evDef.color
    };
    window.mvPortalsV124Data.eventLog.unshift(logEntry);
    if (window.mvPortalsV124Data.eventLog.length > 100) window.mvPortalsV124Data.eventLog.pop();
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: window.year || 1, type: "multiverseEvent", title: evDef.icon + " " + evDef.name + ": " + p.nameA + " & " + p.nameB, color: evDef.color });
    }
    if (typeof window.wmeAddMemory === "function") {
      window.wmeAddMemory({ year: window.year || 1, category: "multiverse", title: evDef.name, content: desc });
    }
    save();
    return logEntry;
  };

  window.mpe124GetPortals = function() { return window.mvPortalsV124Data.portals; };
  window.mpe124GetOpenPortals = function() { return window.mvPortalsV124Data.portals.filter(function(p) { return p.status === "open"; }); };
  window.mpe124GetEventLog = function() { return window.mvPortalsV124Data.eventLog; };
  window.mpe124GetTotalConnections = function() { return window.mvPortalsV124Data.portals.length; };
  window.MPE124_PORTAL_TYPES = PORTAL_TYPES;
  window.MPE124_MV_EVENTS = MV_EVENTS;

  function init() {
    load();
    if (!window.mvPortalsV124Data.portals.length) {
      window.mvPortalsV124Data.portals = DEMO_PORTALS.slice();
      window.mvPortalsV124Data.totalConnections = DEMO_PORTALS.length;
      save();
    }
    console.log("[MultiversePortalEngine V124] 🌀 Portal System khởi động — " + window.mvPortalsV124Data.portals.length + " portals · 4 loại sự kiện liên vũ trụ sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 30200); });
  } else {
    setTimeout(init, 30200);
  }
})();
