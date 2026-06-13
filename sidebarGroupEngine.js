(function() {
  "use strict";
  const SAVE_KEY = "cgv6_sidebar_groups_v1";

  // Định nghĩa nhóm — panels[] là data-panel của các button con
  const GROUPS = [
    {
      id: "grp-world", icon: "🌍", label: "Thế Giới", defaultOpen: true,
      panels: ["world","npcs","logs","worldmap","world3d"]
    },
    {
      id: "grp-civ", icon: "🏰", label: "Văn Minh", defaultOpen: false,
      panels: ["countries","empire","kingdoms","empires","living-civ","dynasty","dynasty-engine","bloodlines","noble-houses","succession","leaderboard","rankings"]
    },
    {
      id: "grp-war", icon: "⚔️", label: "Chiến Tranh", defaultOpen: false,
      panels: ["sectwars","territories","territory-war","war-engine","combat-hub-v31","boss"]
    },
    {
      id: "grp-diplo", icon: "🤝", label: "Ngoại Giao", defaultOpen: false,
      panels: ["diplomacy","diplomacy-hub-v24","alliance-v24","sanctions-v24","espionage","political-religion","culture-heritage","religion","migration"]
    },
    {
      id: "grp-cosmos", icon: "🌌", label: "Thiên Địa", defaultOpen: false,
      panels: ["continent","continent-hub-v26","naval-ocean","ocean-hub-v27","event-hub-v25","world-event","mythology","age","heavenly-dao","multiverse-hub-v35"]
    },
    {
      id: "grp-cult", icon: "🏯", label: "Tu Tiên", defaultOpen: true,
      panels: ["sects","spirit-beast","secret-realms","cultivation-hub-v29","divine-hub-v30"]
    },
    {
      id: "grp-history", icon: "📜", label: "Lịch Sử", defaultOpen: false,
      panels: ["world-history","world-chronicle","historical-timeline","world-memory","npc-reputation","hero-legend","story"]
    },
    {
      id: "grp-econ", icon: "💰", label: "Kinh Tế", defaultOpen: false,
      panels: ["economy","economy-engine","dungeon","technology"]
    },
    {
      id: "grp-player", icon: "👤", label: "Nhân Vật", defaultOpen: false,
      panels: ["player","player-hub-v28"]
    },
    {
      id: "grp-creator", icon: "👁", label: "Tạo Hóa", defaultOpen: false,
      panels: ["creator-hub-v32","guardian-hub-v33"]
    },
    {
      id: "grp-system", icon: "⚙️", label: "Hệ Thống", defaultOpen: false,
      panels: ["dashboard","multiplayer","performance","project-status","next-version"]
    }
  ];

  var collapseState = {};

  function saveState() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(collapseState)); } catch(e) {}
  }
  function loadState() {
    try { var d = localStorage.getItem(SAVE_KEY); if (d) collapseState = JSON.parse(d); } catch(e) {}
  }

  function isOpen(grpId, defaultOpen) {
    if (collapseState[grpId] !== undefined) return collapseState[grpId];
    return defaultOpen;
  }

  function addStyle() {
    if (document.getElementById("sgv1-style")) return;
    var style = document.createElement("style");
    style.id = "sgv1-style";
    style.textContent = [
      ".nav-group { border-bottom: 1px solid #1a2035; }",
      ".nav-group-header {",
      "  width:100%; display:flex; align-items:center; justify-content:space-between;",
      "  padding:6px 10px 5px; background:transparent; border:none;",
      "  color:#64748b; cursor:pointer; font-size:11.5px;",
      "  font-family:'Noto Serif SC',serif; letter-spacing:0.3px;",
      "  transition: color 0.15s, background 0.15s;",
      "}",
      ".nav-group-header:hover { color:#94a3b8; background:rgba(255,255,255,0.03); }",
      ".nav-group-header.has-active { color:#e2e8f0; }",
      ".nav-group-label { display:flex; align-items:center; gap:6px; }",
      ".nav-group-arrow { font-size:9px; opacity:0.6; transition:transform 0.2s; }",
      ".nav-group-arrow.open { transform:rotate(90deg); }",
      ".nav-group-content {",
      "  overflow:hidden; transition:max-height 0.25s ease;",
      "  padding-left:6px;",
      "}",
      ".nav-group-content .nav-btn {",
      "  font-size:12px; padding:5px 8px 5px 10px;",
      "  border-left:2px solid transparent;",
      "}",
      ".nav-group-content .nav-btn:hover { border-left-color:#334155; }",
      ".nav-group-content .nav-btn.active { border-left-color:#facc15; }",
      ".sgv1-toolbar {",
      "  display:flex; gap:4px; padding:4px 8px;",
      "  border-bottom:1px solid #1a2035;",
      "}",
      ".sgv1-tool-btn {",
      "  flex:1; padding:3px 0; background:transparent; border:1px solid #1e293b;",
      "  color:#64748b; cursor:pointer; font-size:10px; border-radius:3px;",
      "  transition:all 0.15s;",
      "}",
      ".sgv1-tool-btn:hover { background:#1e293b; color:#94a3b8; }"
    ].join("\n");
    document.head.appendChild(style);
  }

  function createGroupEl(grp) {
    var open = isOpen(grp.id, grp.defaultOpen);

    var container = document.createElement("div");
    container.id = grp.id;
    container.className = "nav-group";
    container.style.display = "none"; // hidden until buttons unlocked

    var header = document.createElement("button");
    header.className = "nav-group-header";
    header.setAttribute("data-grp", grp.id);
    header.innerHTML =
      '<span class="nav-group-label"><span>' + grp.icon + '</span><span>' + grp.label + '</span></span>' +
      '<span class="nav-group-arrow' + (open ? " open" : "") + '">▶</span>';

    var content = document.createElement("div");
    content.className = "nav-group-content";
    content.id = grp.id + "-content";
    content.style.maxHeight = open ? "2000px" : "0";

    header.addEventListener("click", function() {
      var nowOpen = content.style.maxHeight === "0px" || content.style.maxHeight === "0";
      content.style.maxHeight = nowOpen ? "2000px" : "0";
      var arrow = header.querySelector(".nav-group-arrow");
      if (arrow) {
        if (nowOpen) arrow.classList.add("open");
        else arrow.classList.remove("open");
      }
      collapseState[grp.id] = nowOpen;
      saveState();
    });

    container.appendChild(header);
    container.appendChild(content);
    return container;
  }

  function buildGroups() {
    var nav = document.querySelector(".sidebar-nav");
    if (!nav) return;

    loadState();
    addStyle();

    // Add toolbar (Mở Tất / Thu Tất)
    var toolbar = document.createElement("div");
    toolbar.className = "sgv1-toolbar";
    toolbar.innerHTML =
      '<button class="sgv1-tool-btn" onclick="window.sgeExpandAll()">▼ Mở Tất</button>' +
      '<button class="sgv1-tool-btn" onclick="window.sgeCollapseAll()">▶ Thu Tất</button>';
    nav.insertBefore(toolbar, nav.firstChild);

    // Build group containers
    var groupEls = {};
    GROUPS.forEach(function(grp) {
      var el = createGroupEl(grp);
      groupEls[grp.id] = el;
      nav.appendChild(el);
    });

    // Move buttons into groups — maintain original DOM order within each group
    var panelToGroup = {};
    GROUPS.forEach(function(grp) {
      grp.panels.forEach(function(p) { panelToGroup[p] = grp.id; });
    });

    // Collect all nav-btns that belong to a group
    var allBtns = nav.querySelectorAll(".nav-btn[data-panel]");
    allBtns.forEach(function(btn) {
      var panelId = btn.getAttribute("data-panel");
      var grpId = panelToGroup[panelId];
      if (!grpId) return; // ungrouped — leave in place
      var content = document.getElementById(grpId + "-content");
      if (content) content.appendChild(btn);
    });

    // Show groups that have any non-hidden button
    updateGroupVisibility();

    // Periodically update (for unlock events)
    setInterval(updateGroupVisibility, 1500);

    console.log("[SidebarGroupEngine V1] 📋 " + GROUPS.length + " nhóm sidebar — Thu/Mở tự động · Lưu trạng thái · Cập nhật mỗi 1.5s.");
  }

  function updateGroupVisibility() {
    GROUPS.forEach(function(grp) {
      var container = document.getElementById(grp.id);
      if (!container) return;
      var content = document.getElementById(grp.id + "-content");
      if (!content) return;

      var btns = content.querySelectorAll(".nav-btn");
      var anyVisible = false;
      var hasActive = false;
      btns.forEach(function(btn) {
        var d = btn.style.display;
        if (d !== "none") anyVisible = true;
        if (btn.classList.contains("active")) hasActive = true;
      });

      container.style.display = anyVisible ? "" : "none";

      // Highlight header if active panel is inside
      var header = container.querySelector(".nav-group-header");
      if (header) {
        if (hasActive) header.classList.add("has-active");
        else header.classList.remove("has-active");
        if (hasActive) {
          // Auto-expand group containing active tab
          var open = content.style.maxHeight !== "0" && content.style.maxHeight !== "0px";
          if (!open) {
            content.style.maxHeight = "2000px";
            var arrow = header.querySelector(".nav-group-arrow");
            if (arrow) arrow.classList.add("open");
            collapseState[grp.id] = true;
            saveState();
          }
        }
      }
    });
  }

  window.sgeExpandAll = function() {
    GROUPS.forEach(function(grp) {
      var content = document.getElementById(grp.id + "-content");
      var container = document.getElementById(grp.id);
      if (!content || !container || container.style.display === "none") return;
      content.style.maxHeight = "2000px";
      var arrow = container.querySelector(".nav-group-arrow");
      if (arrow) arrow.classList.add("open");
      collapseState[grp.id] = true;
    });
    saveState();
  };

  window.sgeCollapseAll = function() {
    GROUPS.forEach(function(grp) {
      var content = document.getElementById(grp.id + "-content");
      var container = document.getElementById(grp.id);
      if (!content || !container || container.style.display === "none") return;
      content.style.maxHeight = "0";
      var arrow = container.querySelector(".nav-group-arrow");
      if (arrow) arrow.classList.remove("open");
      collapseState[grp.id] = false;
    });
    saveState();
  };

  function init() {
    var nav = document.querySelector(".sidebar-nav");
    if (!nav) { setTimeout(init, 200); return; }
    buildGroups();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
