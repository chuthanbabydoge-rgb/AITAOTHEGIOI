(function() {
  "use strict";
  const PANEL_ID = "panel-CREATOR-POWERS-V123";
  const BTN_ID   = "btn-CREATOR-POWERS-V123";

  // ─── Dynamic tab inject ───────────────────────────────────────────────────
  function injectTab() {
    if (document.getElementById(BTN_ID)) return;

    // NAV BUTTON
    var btn = document.createElement("button");
    btn.className = "nav-btn";
    btn.id = BTN_ID;
    btn.setAttribute("data-panel", "CREATOR-POWERS-V123");
    btn.style.cssText = "background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border:none;border-radius:8px;padding:8px 12px;cursor:pointer;font-size:13px;font-weight:600;white-space:nowrap;";
    btn.textContent = "⚡ Creator Powers";
    btn.onclick = function() {
      if (typeof window.showPanel === "function") window.showPanel("CREATOR-POWERS-V123");
      window.cpv123RegistryRender();
    };

    var nav = document.querySelector(".sidebar-nav, #sidebar-nav, nav.nav-panel, .nav-buttons, #nav-buttons");
    if (!nav) {
      var allBtns = document.querySelectorAll(".nav-btn");
      if (allBtns.length) nav = allBtns[allBtns.length - 1].parentNode;
    }
    if (nav) nav.appendChild(btn);

    // PANEL DIV
    var panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.className = "panel";
    panel.style.display = "none";
    var main = document.querySelector("#main-content, .main-content, .panels-container, main");
    if (!main) main = document.body;
    main.appendChild(panel);

    // Hook showPanel for rendering
    var _origShow = window.showPanel;
    window.showPanel = function(panelId) {
      if (_origShow) _origShow(panelId);
      if (panelId === "CREATOR-POWERS-V123") window.cpv123RegistryRender();
    };
  }

  // ─── Jarvis Divine Observer ───────────────────────────────────────────────
  function jarvisAnalysis() {
    var hist = window.cpv123Data ? window.cpv123Data.history : [];
    var types = window.cpv123Data ? window.cpv123Data.totalTypes : {};
    var total = window.cpv123Data ? window.cpv123Data.totalInterventions : 0;
    if (!total) return "<p style='color:#64748b'>Chưa có can thiệp nào. Hãy bật Creator Mode và bắt đầu tạo thế giới!</p>";

    var dominant = Object.entries(types).sort(function(a,b) { return b[1]-a[1]; })[0];
    var domLabel = { geography:"địa hình", life:"sự sống", civilization:"văn minh", divine:"sự kiện thần thánh", time:"thời gian", experiment:"thí nghiệm" };
    var recent = hist.slice(0, 3).map(function(h) {
      return '<div style="background:#1e293b;border-radius:6px;padding:6px 10px;margin-bottom:4px;font-size:12px">' +
        '<span style="color:#f59e0b">Năm ' + h.year + '</span> — ' + h.title + '</div>';
    }).join("");

    return '<div style="background:#0f172a;border-radius:10px;padding:14px;margin-bottom:12px">' +
      '<div style="color:#a855f7;font-weight:700;margin-bottom:8px">🤖 Jarvis Phân Tích</div>' +
      '<div style="color:#e2e8f0;margin-bottom:6px">Bạn đã can thiệp <strong style="color:#f59e0b">' + total + ' lần</strong>.' +
        (dominant ? ' Tập trung nhiều nhất vào <strong style="color:#60a5fa">' + domLabel[dominant[0]] + '</strong> (' + dominant[1] + ' lần).' : '') + '</div>' +
      '<div style="color:#94a3b8;font-size:12px;margin-bottom:8px">Can thiệp gần nhất:</div>' +
      recent + '</div>';
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  window.cpv123RegistryRender = function(activeTab) {
    var panel = document.getElementById(PANEL_ID);
    if (!panel || panel.style.display === "none") return;
    activeTab = activeTab || window._cpv123Tab || "geography";
    window._cpv123Tab = activeTab;

    var enabled = window.cpv123IsEnabled ? window.cpv123IsEnabled() : false;
    var modeBtn = enabled
      ? '<button onclick="cpv123Disable();cpv123RegistryRender()" style="background:#ef4444;color:#fff;border:none;border-radius:8px;padding:10px 20px;cursor:pointer;font-weight:700;font-size:14px">🔴 TẮT Creator Mode</button>'
      : '<button onclick="cpv123Enable();cpv123RegistryRender()" style="background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border:none;border-radius:8px;padding:10px 20px;cursor:pointer;font-weight:700;font-size:14px">⚡ BẬT Creator Mode</button>';

    var tabs = [
      { id: "geography", icon: "🌍", label: "Geography" },
      { id: "life",      icon: "🧬", label: "Life" },
      { id: "civilization", icon: "🏛️", label: "Civilization" },
      { id: "time",      icon: "⏰", label: "Time" },
      { id: "events",    icon: "⚡", label: "Events" },
      { id: "experiment",icon: "🔬", label: "Experiment" },
      { id: "history",   icon: "📜", label: "History" }
    ];

    var tabHtml = tabs.map(function(t) {
      var active = t.id === activeTab;
      return '<button onclick="cpv123RegistryRender(\'' + t.id + '\')" style="padding:6px 14px;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;background:' +
        (active ? "#7c3aed" : "#1e293b") + ';color:' + (active ? "#fff" : "#94a3b8") + '">' + t.icon + ' ' + t.label + '</button>';
    }).join(" ");

    var content = "";
    if (activeTab === "geography") content = renderGeography(enabled);
    else if (activeTab === "life") content = renderLife(enabled);
    else if (activeTab === "civilization") content = renderCivilization(enabled);
    else if (activeTab === "time") content = renderTime(enabled);
    else if (activeTab === "events") content = renderEvents(enabled);
    else if (activeTab === "experiment") content = renderExperiment(enabled);
    else if (activeTab === "history") content = renderHistory();

    panel.innerHTML =
      '<div style="padding:20px;font-family:\'Segoe UI\',sans-serif;color:#e2e8f0;max-height:calc(100vh - 80px);overflow-y:auto">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
          '<div>' +
            '<div style="font-size:22px;font-weight:800;color:#a855f7">⚡ Creator Powers V123</div>' +
            '<div style="color:#64748b;font-size:12px">Quyền Năng Thần Tạo Hóa — Tác động lên Thế Giới</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:10px">' +
            '<span style="padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;background:' +
              (enabled ? "#064e3b" : "#1e293b") + ';color:' + (enabled ? "#34d399" : "#64748b") + '">' +
              (enabled ? "● ACTIVE" : "○ INACTIVE") + '</span>' +
            modeBtn +
          '</div>' +
        '</div>' +
        jarvisAnalysis() +
        '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px">' + tabHtml + '</div>' +
        '<div>' + content + '</div>' +
      '</div>';
  };

  function renderGeography(enabled) {
    var grid = window.cpv123GetGrid ? window.cpv123GetGrid() : null;
    var hasMap = !!grid;
    var hint = !hasMap ? '<div style="color:#f59e0b;margin-bottom:10px">⚠️ Cần có World Map — mở tab Bản Đồ Thế Giới trước.</div>' : "";

    function btn(label, fn, color) {
      color = color || "#374151";
      return '<button onclick="' + fn + '" style="background:' + color + ';color:#fff;border:none;border-radius:8px;padding:10px 14px;cursor:pointer;font-size:13px;margin:4px;flex:1;min-width:130px">' + label + '</button>';
    }

    return hint +
      '<div style="color:#60a5fa;font-weight:700;margin-bottom:10px">🌍 Chỉnh Sửa Địa Hình</div>' +
      '<p style="color:#94a3b8;font-size:12px;margin-bottom:12px">Mỗi nút tạo địa hình tại vị trí ngẫu nhiên (trung tâm bản đồ mặc định).</p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:4px">' +
        btn("🏔️ Tạo Dãy Núi", "cpv123CreateMountain()", "#374151") +
        btn("🌊 Tạo Dòng Sông", "cpv123CreateRiver()", "#1e3a5f") +
        btn("🌊 Tạo Vùng Biển", "cpv123CreateSea(3,3,5)", "#1e3a5f") +
        btn("🏝️ Tạo Hòn Đảo", "cpv123CreateIsland()", "#065f46") +
        btn("🌲 Tạo Rừng", "cpv123CreateForest()", "#064e3b") +
        btn("🏜️ Tạo Sa Mạc", "cpv123CreateDesert()", "#78350f") +
      '</div>' +
      '<div style="margin-top:12px;color:#94a3b8;font-size:12px">💡 Tip: Bản đồ cập nhật ngay khi tạo địa hình. Mở tab Bản Đồ Thế Giới để xem.</div>' +
      '<div style="margin-top:10px">' +
        '<button onclick="cpv123Undo()" style="background:#4b1d1d;color:#fca5a5;border:none;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:12px">↩️ Hoàn Tác Địa Hình</button>' +
      '</div>';
  }

  function renderLife(enabled) {
    var species = window.cpv123GetSpecies ? window.cpv123GetSpecies() : [];
    var presets = window.cpv123SpeciesPresets || [];

    var spOptions = species.map(function(s) {
      return '<option value="' + s.id + '">' + (s.icon || "🧬") + " " + s.name + " (" + (s.population || 0).toLocaleString() + " dân)" + '</option>';
    }).join("");

    var presetBtns = presets.map(function(p) {
      return '<button onclick="cpv123CreateSpecies(\'' + p.name + '\',\'' + p.type + '\')" style="background:#1e293b;color:#e2e8f0;border:1px solid #374151;border-radius:8px;padding:8px 12px;cursor:pointer;font-size:12px;flex:1;min-width:120px">' + p.icon + " " + p.name + "</button>";
    }).join("");

    return '<div style="color:#34d399;font-weight:700;margin-bottom:10px">🧬 Quyền Năng Sự Sống</div>' +
      '<div style="margin-bottom:14px">' +
        '<div style="font-size:13px;font-weight:600;margin-bottom:6px">Tạo Loài Mới (nhấn 1 trong 5 mẫu):</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:6px">' + presetBtns + '</div>' +
      '</div>' +
      '<div style="background:#1e293b;border-radius:8px;padding:12px;margin-bottom:12px">' +
        '<div style="font-size:13px;font-weight:600;margin-bottom:8px">Chỉnh Sửa Loài Đang Chọn:</div>' +
        '<select id="cpv123-sp-select" style="width:100%;background:#0f172a;color:#e2e8f0;border:1px solid #374151;border-radius:6px;padding:6px;margin-bottom:8px">' +
          spOptions +
        '</select>' +
        '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
          '<button onclick="cpv123BoostBirth(document.getElementById(\'cpv123-sp-select\').value,2)" style="background:#065f46;color:#fff;border:none;border-radius:6px;padding:8px 12px;cursor:pointer;font-size:12px">🍼 Tăng Sinh Sản 2x</button>' +
          '<button onclick="cpv123ReduceDeath(document.getElementById(\'cpv123-sp-select\').value,0.5)" style="background:#1e3a5f;color:#fff;border:none;border-radius:6px;padding:8px 12px;cursor:pointer;font-size:12px">💊 Giảm Tử Vong 50%</button>' +
          '<button onclick="cpv123BoostPopulation(document.getElementById(\'cpv123-sp-select\').value,10000)" style="background:#4c1d95;color:#fff;border:none;border-radius:6px;padding:8px 12px;cursor:pointer;font-size:12px">📈 +10,000 Dân</button>' +
          '<button onclick="cpv123ExtendLifespan(document.getElementById(\'cpv123-sp-select\').value,50)" style="background:#1c1917;color:#fff;border:1px solid #92400e;border-radius:6px;padding:8px 12px;cursor:pointer;font-size:12px">⏳ +50 Năm Tuổi Thọ</button>' +
        '</div>' +
      '</div>' +
      '<div style="color:#64748b;font-size:11px">Tổng loài: ' + species.length + ' · Dân số tổng: ' + species.reduce(function(a,s){ return a+(s.population||0);},0).toLocaleString() + '</div>';
  }

  function renderCivilization(enabled) {
    var civs = window.cpv123GetCivs ? window.cpv123GetCivs() : [];
    var techNames = window.cpv123TechNames || [];
    var knowledgeNames = window.cpv123KnowledgeNames || [];

    var civOptions = civs.map(function(c) {
      return '<option value="' + c.id + '">' + (c.stageIcon||"🏛") + " " + c.name + " (" + (c.population||0).toLocaleString() + " dân)" + '</option>';
    }).join("");

    var techOptions = techNames.slice(0,8).map(function(t) {
      return '<option value="' + t + '">' + t + '</option>';
    }).join("");

    return '<div style="color:#a855f7;font-weight:700;margin-bottom:10px">🏛️ Quyền Năng Văn Minh</div>' +
      '<div style="margin-bottom:14px">' +
        '<button onclick="cpv123CreateCiv()" style="background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border:none;border-radius:8px;padding:10px 18px;cursor:pointer;font-weight:700">✨ Tạo Văn Minh Mới</button>' +
        '<span style="margin-left:10px;color:#64748b;font-size:12px">Tự động dùng loài đầu tiên · 50,000 dân</span>' +
      '</div>' +
      '<div style="background:#1e293b;border-radius:8px;padding:12px">' +
        '<div style="font-size:13px;font-weight:600;margin-bottom:8px">Chọn Văn Minh:</div>' +
        '<select id="cpv123-civ-select" style="width:100%;background:#0f172a;color:#e2e8f0;border:1px solid #374151;border-radius:6px;padding:6px;margin-bottom:8px">' +
          (civOptions || '<option>Chưa có văn minh — Hãy tạo thế giới!</option>') +
        '</select>' +
        '<div style="margin-bottom:8px">' +
          '<select id="cpv123-tech-select" style="background:#0f172a;color:#e2e8f0;border:1px solid #374151;border-radius:6px;padding:6px;width:100%;margin-bottom:6px">' + techOptions + '</select>' +
          '<button onclick="cpv123GrantTech(document.getElementById(\'cpv123-civ-select\').value,document.getElementById(\'cpv123-tech-select\').value,500)" style="background:#1e3a5f;color:#fff;border:none;border-radius:6px;padding:8px 12px;cursor:pointer;font-size:12px">⚙️ Ban Công Nghệ +500 TP</button>' +
        '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
          '<button onclick="cpv123GrantKnowledge(document.getElementById(\'cpv123-civ-select\').value)" style="background:#064e3b;color:#fff;border:none;border-radius:6px;padding:8px 12px;cursor:pointer;font-size:12px">📜 Ban Tri Thức</button>' +
          '<button onclick="cpv123BoostCivPop(document.getElementById(\'cpv123-civ-select\').value,100000)" style="background:#4c1d95;color:#fff;border:none;border-radius:6px;padding:8px 12px;cursor:pointer;font-size:12px">👥 +100,000 Dân</button>' +
          '<button onclick="cpv123ChangeLeader(document.getElementById(\'cpv123-civ-select\').value)" style="background:#78350f;color:#fff;border:none;border-radius:6px;padding:8px 12px;cursor:pointer;font-size:12px">👑 Đổi Lãnh Đạo</button>' +
        '</div>' +
      '</div>' +
      '<div style="margin-top:8px;color:#64748b;font-size:11px">Tổng văn minh: ' + civs.length + '</div>';
  }

  function renderTime(enabled) {
    var ts = window.cpv123TimeState || {};
    var mode = ts.currentMode || "normal";
    var modeColors = { normal:"#34d399", paused:"#f87171", slow:"#fbbf24", fast:"#60a5fa" };
    var modeLabels = { normal:"⚙️ Bình Thường", paused:"⏸ Dừng", slow:"🐢 Chậm", fast:"⚡ Nhanh" };
    return '<div style="color:#60a5fa;font-weight:700;margin-bottom:10px">⏰ Quyền Năng Thời Gian</div>' +
      '<div style="background:#0f172a;border-radius:8px;padding:12px;margin-bottom:12px">' +
        '<div style="color:#94a3b8;font-size:12px;margin-bottom:6px">Chế độ hiện tại:</div>' +
        '<div style="font-size:16px;font-weight:700;color:' + (modeColors[mode]||"#e2e8f0") + '">' + (modeLabels[mode]||mode) + '</div>' +
        '<div style="color:#64748b;font-size:12px">Năm ' + (window.year||1) + ' · Thế giới đang ' + (mode==="paused"?"đóng băng":"chạy") + '</div>' +
      '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">' +
        '<button onclick="cpv123PauseTime();cpv123RegistryRender(\'time\')" style="background:#4b1d1d;color:#fca5a5;border:none;border-radius:8px;padding:10px 16px;cursor:pointer;font-weight:600">⏸ Pause/Resume</button>' +
        '<button onclick="cpv123SlowTime(3);cpv123RegistryRender(\'time\')" style="background:#422006;color:#fde68a;border:none;border-radius:8px;padding:10px 16px;cursor:pointer;font-weight:600">🐢 Chậm 3x</button>' +
        '<button onclick="cpv123FastForward(10);cpv123RegistryRender(\'time\')" style="background:#1e3a5f;color:#93c5fd;border:none;border-radius:8px;padding:10px 16px;cursor:pointer;font-weight:600">⚡ Nhanh 10x</button>' +
        '<button onclick="cpv123NormalTime();cpv123RegistryRender(\'time\')" style="background:#1e293b;color:#94a3b8;border:1px solid #374151;border-radius:8px;padding:10px 16px;cursor:pointer;font-weight:600">🕐 Bình Thường</button>' +
      '</div>' +
      '<div style="background:#1e293b;border-radius:8px;padding:12px">' +
        '<div style="font-size:13px;font-weight:600;margin-bottom:8px">⏭ Bỏ Qua N Năm:</div>' +
        '<div style="display:flex;gap:6px;align-items:center">' +
          '<input type="number" id="cpv123-skip-years" value="100" min="1" max="10000" style="background:#0f172a;color:#e2e8f0;border:1px solid #374151;border-radius:6px;padding:6px;width:100px">' +
          '<button onclick="cpv123SkipYears(parseInt(document.getElementById(\'cpv123-skip-years\').value)||100)" style="background:#7c3aed;color:#fff;border:none;border-radius:6px;padding:8px 14px;cursor:pointer">Bỏ Qua</button>' +
        '</div>' +
      '</div>';
  }

  function renderEvents(enabled) {
    var events = window.cpv123DivineEvents || [];
    var cards = events.map(function(e) {
      var fnMap = {
        blessing:"cpv123TriggerBlessing()",
        miracle:"cpv123TriggerMiracle()",
        golden_age:"cpv123TriggerGoldenAge()",
        catastrophe:"cpv123TriggerCatastrophe()",
        plague:"cpv123TriggerPlague()",
        meteor:"cpv123TriggerMeteor()",
        great_flood:"cpv123TriggerGreatFlood()"
      };
      return '<div style="background:#1e293b;border-left:4px solid ' + e.color + ';border-radius:8px;padding:12px;margin-bottom:8px">' +
        '<div style="display:flex;align-items:center;justify-content:space-between">' +
          '<div>' +
            '<div style="font-weight:700;font-size:14px">' + e.icon + ' ' + e.name + '</div>' +
            '<div style="color:#94a3b8;font-size:12px;margin-top:3px">' + e.desc + '</div>' +
          '</div>' +
          '<button onclick="' + fnMap[e.id] + '" style="background:' + e.color + ';color:#fff;border:none;border-radius:8px;padding:8px 14px;cursor:pointer;font-weight:700;font-size:13px;white-space:nowrap;margin-left:10px">Kích Hoạt</button>' +
        '</div></div>';
    }).join("");

    return '<div style="color:#f59e0b;font-weight:700;margin-bottom:10px">⚡ Sự Kiện Thần Thánh</div>' + cards;
  }

  function renderExperiment(enabled) {
    var timelines = window.cpv123ExpData ? window.cpv123ExpData.timelines : [];
    var comp = window.cpv123ExpData ? window.cpv123ExpData.activeComparison : null;

    var tlCards = timelines.length
      ? timelines.map(function(tl, i) {
          return '<div style="background:#1e293b;border-radius:8px;padding:10px;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between">' +
            '<div>' +
              '<div style="font-weight:600">' + tl.name + '</div>' +
              '<div style="color:#64748b;font-size:11px">Năm ' + tl.year + ' · ' + tl.summary + '</div>' +
            '</div>' +
            '<div style="display:flex;gap:6px">' +
              '<button onclick="(function(){var r=cpv123CompareWithCurrent(\'' + tl.id + '\');cpv123RegistryRender(\'experiment\')})()" style="background:#1e3a5f;color:#93c5fd;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font-size:11px">So Sánh</button>' +
              '<button onclick="cpv123DeleteTimeline(\'' + tl.id + '\')" style="background:#4b1d1d;color:#fca5a5;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font-size:11px">Xóa</button>' +
            '</div>' +
          '</div>';
        }).join("")
      : '<p style="color:#64748b;font-size:12px">Chưa có timeline nào. Nhấn nút bên dưới để fork trạng thái hiện tại!</p>';

    var compHtml = comp ? '<div style="margin-top:12px"><div style="font-weight:600;color:#a855f7;margin-bottom:6px">📊 Kết Quả So Sánh</div>' + window.cpv123RenderComparison(comp) + '</div>' : "";

    return '<div style="color:#a855f7;font-weight:700;margin-bottom:10px">🔬 World Experiment Mode</div>' +
      '<div style="margin-bottom:12px">' +
        '<button onclick="cpv123ForkTimeline();cpv123RegistryRender(\'experiment\')" style="background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border:none;border-radius:8px;padding:10px 18px;cursor:pointer;font-weight:700">🔬 Fork Trạng Thái Hiện Tại</button>' +
        '<span style="margin-left:10px;color:#64748b;font-size:12px">Lưu snapshot · Tối đa 5 timelines</span>' +
      '</div>' +
      '<div>' + tlCards + '</div>' + compHtml;
  }

  function renderHistory() {
    var hist = window.cpv123Data ? window.cpv123Data.history : [];
    var types = window.cpv123Data ? window.cpv123Data.totalTypes : {};
    var total = window.cpv123Data ? window.cpv123Data.totalInterventions : 0;

    var typeColors = { geography:"#34d399", life:"#60a5fa", civilization:"#a855f7", divine:"#f59e0b", time:"#38bdf8", experiment:"#c084fc", undo:"#f87171" };
    var statsHtml = Object.entries(types).map(function(kv) {
      return '<div style="background:#1e293b;border-radius:6px;padding:8px 12px;text-align:center;flex:1;min-width:80px">' +
        '<div style="font-weight:700;color:' + (typeColors[kv[0]]||"#e2e8f0") + '">' + (kv[1]||0) + '</div>' +
        '<div style="font-size:10px;color:#64748b;text-transform:capitalize">' + kv[0] + '</div>' +
      '</div>';
    }).join("");

    var rows = hist.slice(0, 50).map(function(h) {
      return '<tr style="border-bottom:1px solid #1e293b">' +
        '<td style="padding:6px 8px;color:#f59e0b;white-space:nowrap">Năm ' + h.year + '</td>' +
        '<td style="padding:6px 8px"><span style="background:' + (typeColors[h.type]||"#374151") + '22;color:' + (typeColors[h.type]||"#e2e8f0") + ';border-radius:4px;padding:2px 6px;font-size:11px">' + h.type + '</span></td>' +
        '<td style="padding:6px 8px;color:#e2e8f0">' + h.title + '</td>' +
        '<td style="padding:6px 8px;color:#94a3b8;font-size:11px">' + (h.detail||"") + '</td>' +
      '</tr>';
    }).join("");

    return '<div style="color:#e2e8f0;font-weight:700;margin-bottom:10px">📜 Lịch Sử Can Thiệp Creator</div>' +
      '<div style="margin-bottom:12px">' +
        '<div style="font-size:20px;font-weight:800;color:#f59e0b">' + total + ' Can Thiệp</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">' + statsHtml + '</div>' +
      '</div>' +
      (rows ? '<div style="overflow-x:auto"><table style="width:100%;font-size:12px;border-collapse:collapse">' +
        '<thead><tr style="background:#1e293b">' +
          '<th style="padding:6px 8px;text-align:left;color:#94a3b8">Năm</th>' +
          '<th style="padding:6px 8px;text-align:left;color:#94a3b8">Loại</th>' +
          '<th style="padding:6px 8px;text-align:left;color:#94a3b8">Hành Động</th>' +
          '<th style="padding:6px 8px;text-align:left;color:#94a3b8">Chi Tiết</th>' +
        '</tr></thead><tbody>' + rows + '</tbody></table></div>' :
        '<p style="color:#64748b">Chưa có lịch sử nào.</p>') +
      '<div style="margin-top:10px">' +
        '<button onclick="cpv123Undo();cpv123RegistryRender(\'history\')" style="background:#4b1d1d;color:#fca5a5;border:none;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:12px">↩️ Hoàn Tác Hành Động Cuối</button>' +
      '</div>';
  }

  // ─── Expose for PUOS patch ────────────────────────────────────────────────
  function patchPUOS() {
    var _orig = window.puosRenderMyUniverse;
    window.puosRenderMyUniverse = function() {
      if (_orig) _orig.apply(this, arguments);
      var target = document.getElementById("puos-my-universe-content");
      if (!target) return;
      var existing = document.getElementById("cpv123-puos-widget");
      if (!existing) {
        var widget = document.createElement("div");
        widget.id = "cpv123-puos-widget";
        widget.style.cssText = "margin-top:16px;background:#1a0533;border:1px solid #7c3aed;border-radius:10px;padding:12px;cursor:pointer";
        widget.onclick = function() {
          if (typeof window.showPanel === "function") window.showPanel("CREATOR-POWERS-V123");
          window.cpv123RegistryRender();
        };
        var enabled = window.cpv123IsEnabled ? window.cpv123IsEnabled() : false;
        var total = window.cpv123Data ? window.cpv123Data.totalInterventions : 0;
        widget.innerHTML = '<div style="font-weight:700;color:#a855f7;margin-bottom:4px">⚡ Creator Powers ' + (enabled?"<span style=\'color:#34d399\'>● ACTIVE</span>":"<span style=\'color:#64748b\'>○ INACTIVE</span>") + '</div>' +
          '<div style="color:#94a3b8;font-size:12px">' + total + ' can thiệp · Click để mở Creator Powers</div>';
        target.appendChild(widget);
      }
    };
  }

  function init() {
    injectTab();
    patchPUOS();
    console.log("[CreatorPowersRegistry V123] 📋 Creator Powers Registry khởi động — Tab injected · PUOS patched · 7 nhóm quyền năng sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 30000); });
  } else {
    setTimeout(init, 30000);
  }
})();
