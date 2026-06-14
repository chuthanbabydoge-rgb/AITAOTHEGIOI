(function() {
  "use strict";

  // ════════════════════════════════════════
  // SPATIAL UI REGISTRY V67
  // 4 tabs trong creator-hub-v32:
  //   - Spatial View (3D world)
  //   - Hologram Timeline (draggable)
  //   - Universe Table (sa bàn sống)
  //   - Spatial God Mode (click-to-act)
  // + Jarvis Spatial Mode
  // ════════════════════════════════════════

  let _activeTab = "spatial-view";
  let _canvasLoops = {};
  let _jarvisExpanded = false;

  // ════ CANVAS SIZES ════
  function getCanvasSize(el) {
    const w = el ? el.offsetWidth - 4 : 700;
    const h = 400;
    return { w: Math.max(400, w), h };
  }

  // ════ TAB: SPATIAL VIEW ════
  function buildSpatialViewTab() {
    return `<div style="padding:10px;font-family:'Courier New',monospace;color:#e2e8f0">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <h3 style="color:#00f5ff;margin:0;font-size:14px">🌍 Spatial World View</h3>
        <div style="display:flex;gap:5px">
          <button onclick="window.spatialV67Data&&(window.spatialV67Data.autoRotate=!window.spatialV67Data.autoRotate)"
            style="background:#1e293b;border:1px solid #00f5ff33;color:#00f5ff;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:10px;font-family:'Courier New',monospace">⟳ Auto</button>
          <button onclick="window.spatialV67Data&&(window.spatialV67Data.zoom=1,window.spatialV67Data.panX=0,window.spatialV67Data.panY=0)"
            style="background:#1e293b;border:1px solid #334155;color:#64748b;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:10px;font-family:'Courier New',monospace">Reset</button>
          <button onclick="window.swe67BuildWorldNodes&&window.swe67BuildWorldNodes()"
            style="background:#1e293b;border:1px solid #334155;color:#64748b;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:10px;font-family:'Courier New',monospace">↺ Rebuild</button>
        </div>
      </div>

      <div style="font-size:10px;color:#475569;margin-bottom:6px">DRAG → Rotate · SCROLL → Zoom · DOUBLE-CLICK → Toggle auto-rotate · Click node to select</div>

      <!-- Filter buttons -->
      <div style="display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap">
        ${[["all","#00f5ff","All"],["country","#00f5ff","🏳 Countries"],["kingdom","#a855f7","⚔ Kingdoms"],["empire","#f59e0b","🏛 Empires"]]
          .map(([val,col,lbl]) => `<button onclick="window.spatialV67Data&&(window.spatialV67Data._filter='${val}')"
            style="background:#1e293b;border:1px solid ${col}33;color:${col};padding:3px 7px;border-radius:3px;cursor:pointer;font-size:10px;font-family:'Courier New',monospace">${lbl}</button>`).join('')}
      </div>

      <canvas id="sve67-canvas" style="width:100%;height:400px;border:1px solid #00f5ff22;border-radius:6px;display:block;cursor:grab"></canvas>

      <!-- Entity info -->
      <div id="swe67-entity-panel" style="margin-top:8px;background:#0f172a;border:1px solid #1e293b;border-radius:6px;padding:8px;min-height:50px">
        <div style="font-size:10px;color:#475569;margin-bottom:4px">SELECTED ENTITY</div>
        <div style="color:#64748b;font-size:11px;font-style:italic">Click node trên bản đồ để chọn...</div>
      </div>

      <!-- Stats bar -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-top:8px">
        <div style="background:#1e293b;border-radius:4px;padding:6px;text-align:center">
          <div style="font-size:16px;color:#00f5ff">${(window.countries||[]).length}</div>
          <div style="font-size:9px;color:#475569">COUNTRIES</div>
        </div>
        <div style="background:#1e293b;border-radius:4px;padding:6px;text-align:center">
          <div style="font-size:16px;color:#f59e0b">${_getEmpireCount()}</div>
          <div style="font-size:9px;color:#475569">EMPIRES</div>
        </div>
        <div style="background:#1e293b;border-radius:4px;padding:6px;text-align:center">
          <div style="font-size:16px;color:#ef4444">${(window.warsActive||[]).length}</div>
          <div style="font-size:9px;color:#475569">WARS</div>
        </div>
        <div style="background:#1e293b;border-radius:4px;padding:6px;text-align:center">
          <div style="font-size:16px;color:#4ade80">${(window.npcs||[]).filter(n=>n.status==='alive').length}</div>
          <div style="font-size:9px;color:#475569">NPCS</div>
        </div>
      </div>
    </div>`;
  }

  // ════ TAB: HOLOGRAM TIMELINE ════
  function buildHologramTimelineTab() {
    const year = window.year || 0;
    return `<div style="padding:10px;font-family:'Courier New',monospace;color:#e2e8f0">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <h3 style="color:#00f5ff;margin:0;font-size:14px">⏳ Hologram Timeline</h3>
        <div style="display:flex;gap:5px">
          <button onclick="window.htl67GoToYear&&window.htl67GoToYear(window.year||0)"
            style="background:#1e293b;border:1px solid #4ade80;color:#4ade80;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:10px;font-family:'Courier New',monospace">▶ NOW</button>
          <button onclick="window.htl67GoToYear&&window.htl67GoToYear(0)"
            style="background:#1e293b;border:1px solid #334155;color:#64748b;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:10px;font-family:'Courier New',monospace">◄ Origin</button>
          <button onclick="window.htl67BuildData&&window.htl67BuildData()"
            style="background:#1e293b;border:1px solid #334155;color:#64748b;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:10px;font-family:'Courier New',monospace">↺ Reload</button>
        </div>
      </div>

      <div style="font-size:10px;color:#475569;margin-bottom:6px">DRAG → Scroll · SCROLL WHEEL → Zoom in/out · DOUBLE-CLICK → Jump to current year</div>

      <!-- Zoom presets -->
      <div style="display:flex;gap:4px;margin-bottom:8px">
        ${[[50,"50y"],[200,"200y"],[500,"500y"],[1000,"1000y"],[5000,"5000y"]]
          .map(([r,lbl]) => `<button onclick="window.hologramTimelineV67Data&&(window.hologramTimelineV67Data.yearRange=${r},window.hologramTimelineV67Data.scrollX=0)"
            style="background:#1e293b;border:1px solid #00f5ff22;color:#00f5ff;padding:3px 7px;border-radius:3px;cursor:pointer;font-size:10px;font-family:'Courier New',monospace">${lbl}</button>`).join('')}
      </div>

      <canvas id="htl67-canvas" style="width:100%;height:400px;border:1px solid #00f5ff22;border-radius:6px;display:block;cursor:ew-resize"></canvas>

      <!-- Timeline info -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:8px">
        <div style="background:#1e293b;border-radius:4px;padding:6px;text-align:center">
          <div style="font-size:16px;color:#00f5ff" id="htl67-event-count">-</div>
          <div style="font-size:9px;color:#475569">EVENTS</div>
        </div>
        <div style="background:#1e293b;border-radius:4px;padding:6px;text-align:center">
          <div style="font-size:16px;color:#c084fc" id="htl67-proph-count">-</div>
          <div style="font-size:9px;color:#475569">PROPHECIES</div>
        </div>
        <div style="background:#1e293b;border-radius:4px;padding:6px;text-align:center">
          <div style="font-size:16px;color:#fbbf24">${year}</div>
          <div style="font-size:9px;color:#475569">CURRENT YEAR</div>
        </div>
      </div>
    </div>`;
  }

  // ════ TAB: UNIVERSE TABLE ════
  function buildUniverseTableTab() {
    return `<div style="padding:10px;font-family:'Courier New',monospace;color:#e2e8f0">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <h3 style="color:#a855f7;margin:0;font-size:14px">🌌 Universe Table — Sa Bàn Sống</h3>
        <div style="display:flex;gap:5px">
          <button onclick="window.universeVisV67Data&&(window.universeVisV67Data.panX=0,window.universeVisV67Data.panY=0,window.universeVisV67Data.zoom=1)"
            style="background:#1e293b;border:1px solid #a855f7;color:#a855f7;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:10px;font-family:'Courier New',monospace">⬛ Reset</button>
          <button onclick="window.uv67BuildUniverse&&window.uv67BuildUniverse(700,400)"
            style="background:#1e293b;border:1px solid #334155;color:#64748b;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:10px;font-family:'Courier New',monospace">↺ Rebuild</button>
        </div>
      </div>

      <div style="font-size:10px;color:#475569;margin-bottom:6px">DRAG → Pan · SCROLL → Zoom · DOUBLE-CLICK → Select world</div>

      <canvas id="uv67-canvas" style="width:100%;height:400px;border:1px solid #a855f733;border-radius:6px;display:block;cursor:move"></canvas>

      <!-- Selected world info -->
      <div id="uv67-world-info" style="margin-top:8px;background:#0f172a;border:1px solid #1e293b;border-radius:6px;padding:8px;min-height:40px">
        <div style="color:#64748b;font-size:11px;font-style:italic">Double-click một hành tinh để xem thông tin...</div>
      </div>

      <!-- Multiverse stats -->
      <div style="margin-top:8px;background:#0f172a;border:1px solid #1e293b;border-radius:6px;padding:8px">
        <div style="font-size:10px;color:#475569;margin-bottom:4px">MULTIVERSE STATUS</div>
        <div style="font-size:11px;color:#94a3b8">
          🌍 Thế Giới Chính: <span style="color:#00f5ff">Year ${window.year||0}</span> · 
          ${(window.npcs||[]).length} sinh linh · 
          ${(window.countries||[]).length} quốc gia
        </div>
        <div style="font-size:11px;color:#a855f7;margin-top:3px">
          ⚡ Thần Năng: <span>${typeof window.div66GetEnergy === "function" ? Math.floor(window.div66GetEnergy()) : "N/A"}</span> · 
          God Score: <span style="color:#fbbf24">${typeof window.creatorLeg66GetGodScore === "function" ? window.creatorLeg66GetGodScore() : 0}</span>
        </div>
      </div>
    </div>`;
  }

  // ════ TAB: SPATIAL GOD MODE ════
  function buildSpatialGodModeTab() {
    const modes = typeof window.sgm67GetModes === "function" ? window.sgm67GetModes() : [];
    const artTmpls = typeof window.div66ArtGetTemplates === "function" ? window.div66ArtGetTemplates() : [];
    const npcs = (window.npcs||[]).filter(n=>n.status==="alive").slice(0,30);
    const countries = window.countries||[];
    const godModes = modes.length > 0 ? modes : [
      {id:"bless",icon:"✨",label:"Ban Phước",color:"#4ade80"},
      {id:"smite",icon:"⚡",label:"Thiên Lôi",color:"#fbbf24"},
      {id:"hero",icon:"⚔️",label:"Anh Hùng",color:"#f59e0b"},
      {id:"disaster",icon:"🌋",label:"Thiên Tai",color:"#ef4444"}
    ];

    return `<div style="padding:10px;font-family:'Courier New',monospace;color:#e2e8f0">
      <h3 style="color:#fbbf24;margin:0 0 10px;font-size:14px">⚡ Spatial God Mode</h3>

      <!-- INSTRUCTION -->
      <div style="background:#0f172a;border:1px solid #fbbf2433;border-radius:6px;padding:8px;margin-bottom:10px;font-size:11px;color:#94a3b8">
        👁️ Chọn Chế Độ → Chọn Mục Tiêu → Nhấn <span style="color:#fbbf24">THỰC THI</span><br>
        <span style="color:#475569">Hoặc click trực tiếp trên bản đồ (Spatial View tab) để chọn entity.</span>
      </div>

      <!-- MODE SELECTOR -->
      <div style="font-size:10px;color:#475569;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">⚡ Chọn Quyền Năng</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:10px">
        ${godModes.map(m => `<button id="sgm67-btn-${m.id}" onclick="window.sgm67SetMode&&window.sgm67SetMode('${m.id}')"
          style="background:#1e293b;border:1px solid ${m.color}33;color:#64748b;padding:7px;border-radius:5px;cursor:pointer;font-size:11px;text-align:left;font-family:'Courier New',monospace;transition:all 0.2s">
          ${m.icon} ${m.label}
        </button>`).join('')}
      </div>

      <!-- TARGET SELECTOR -->
      <div style="font-size:10px;color:#475569;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">🎯 Chọn Mục Tiêu</div>
      <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
        <select id="sgm67-target-type" onchange="sgm67_updateTargets()"
          style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:4px;padding:5px;font-size:11px;font-family:'Courier New',monospace">
          <option value="npc">Sinh Linh</option>
          <option value="nation">Quốc Gia</option>
          <option value="world">Toàn Thế Giới</option>
        </select>
        <select id="sgm67-target-name"
          style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:4px;padding:5px;font-size:11px;flex:1;font-family:'Courier New',monospace">
          ${npcs.map(n=>`<option value="${n.name}">${n.name}</option>`).join('')}
        </select>
      </div>

      <!-- MESSAGE INPUT (visible only for message mode) -->
      <textarea id="sgm67-message-input" placeholder="Lời thần linh (cho chế độ Thần Ngôn)..." rows="2"
        style="background:#1e293b;border:1px solid #334155;color:#e2e8f0;padding:6px;border-radius:4px;font-size:11px;width:100%;box-sizing:border-box;resize:none;font-family:'Courier New',monospace;margin-bottom:6px"></textarea>

      <!-- ARTIFACT SELECT (for artifact mode) -->
      <select id="sgm67-artifact-select"
        style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:4px;padding:5px;font-size:11px;width:100%;margin-bottom:8px;font-family:'Courier New',monospace">
        ${artTmpls.map(a=>`<option value="${a.id}">${a.icon} ${a.label}</option>`).join('')}
      </select>

      <!-- ENTITY FROM MAP -->
      <div id="sge67-entity-info" style="background:#0f172a;border:1px solid #334155;border-radius:6px;padding:8px;margin-bottom:8px;min-height:40px">
        <div style="color:#475569;font-size:11px;font-style:italic">Entity từ bản đồ sẽ xuất hiện ở đây khi bạn click...</div>
      </div>

      <!-- EXECUTE -->
      <button onclick="sgm67_execute()"
        style="background:linear-gradient(135deg,#7c3aed,#4c1d95);border:1px solid #c084fc;color:white;padding:10px;border-radius:6px;cursor:pointer;font-size:13px;width:100%;font-family:'Courier New',monospace;font-weight:bold;letter-spacing:1px;margin-bottom:10px">
        ⚡ THỰC THI QUYỀN NĂNG ⚡
      </button>

      <!-- RESULT -->
      <div id="sgm67-execute-result" style="font-size:12px;min-height:24px;color:#4ade80;background:#0f172a;border-radius:4px;padding:0"></div>

      <!-- ACTION LOG -->
      <div style="font-size:10px;color:#475569;text-transform:uppercase;letter-spacing:1px;margin:10px 0 5px">📜 Hành Động Gần Đây</div>
      <div id="sgm67-action-log" style="max-height:150px;overflow-y:auto;background:#0f172a;border-radius:4px;padding:4px"></div>
    </div>`;
  }

  // ════ JARVIS SPATIAL PANEL ════
  function buildJarvisSpatial() {
    const year = window.year || 0;
    const rank = typeof window.creatorLeg66GetGodRank === "function" ? window.creatorLeg66GetGodRank() : { icon:"👁️", title:"Thần Linh" };
    const recentLog = typeof window.creatorLeg66GetJarvisLog === "function" ? window.creatorLeg66GetJarvisLog(3) : [];
    const prophs = typeof window.proph66GetActive === "function" ? window.proph66GetActive().length : 0;
    const wars = (window.warsActive||[]).length;

    return `<div style="background:linear-gradient(135deg,#0f172a,#1e1b4b);border:1px solid #4c1d95;border-radius:8px;padding:12px;margin-top:12px;font-family:'Courier New',monospace">
      <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer" onclick="su67_toggleJarvis()">
        <div style="color:#c084fc;font-size:12px;font-weight:bold">🤖 JARVIS SPATIAL MODE</div>
        <span style="color:#7c3aed;font-size:10px" id="jarvis-toggle-icon">${_jarvisExpanded ? "▲ Thu gọn" : "▼ Mở rộng"}</span>
      </div>
      ${_jarvisExpanded ? `
      <div style="margin-top:10px">
        <div style="color:#7c3aed;font-size:10px;margin-bottom:6px">HOLOGRAM ASSISTANT · ${rank.icon} ${rank.title}</div>
        <div style="background:#0f172a;border-radius:6px;padding:8px;font-size:11px;color:#94a3b8;line-height:1.6;margin-bottom:8px">
          ${_generateJarvisComment(year, wars, prophs, recentLog)}
        </div>
        <div style="font-size:10px;color:#475569;margin-bottom:5px">📊 STATUS READ</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:8px">
          <div style="background:#0f172a;border-radius:4px;padding:6px;font-size:10px">
            <span style="color:#ef4444">⚔️ ${wars}</span> <span style="color:#475569">WARS</span>
          </div>
          <div style="background:#0f172a;border-radius:4px;padding:6px;font-size:10px">
            <span style="color:#c084fc">🔮 ${prophs}</span> <span style="color:#475569">PROPHECIES</span>
          </div>
          <div style="background:#0f172a;border-radius:4px;padding:6px;font-size:10px">
            <span style="color:#4ade80">👤 ${(window.npcs||[]).filter(n=>n.status==="alive").length}</span> <span style="color:#475569">NPCS</span>
          </div>
          <div style="background:#0f172a;border-radius:4px;padding:6px;font-size:10px">
            <span style="color:#fbbf24">⚡ ${typeof window.div66GetEnergy === "function" ? Math.floor(window.div66GetEnergy()) : "?"}</span> <span style="color:#475569">ENERGY</span>
          </div>
        </div>
        <button onclick="su67_refreshJarvis()"
          style="background:#1e293b;border:1px solid #7c3aed;color:#c084fc;padding:5px 10px;border-radius:4px;cursor:pointer;font-size:10px;width:100%;font-family:'Courier New',monospace">
          🔄 Cập Nhật Phân Tích
        </button>
      </div>` : ''}
    </div>`;
  }

  function _generateJarvisComment(year, wars, prophs, recentLog) {
    const lines = [];
    lines.push(`► Năm ${year}. Thế giới đang vận hành.`);
    if (wars > 0) lines.push(`► ${wars} cuộc chiến đang bùng nổ. Thế giới không an bình.`);
    else lines.push(`► Không có chiến tranh nào. Thế giới đang trong thời bình.`);
    if (prophs > 0) lines.push(`► ${prophs} lời tiên tri đang chờ ứng nghiệm. Ngài có muốn kiểm tra?`);
    if (typeof window.creatorLeg66GetGodScore === "function") {
      const score = window.creatorLeg66GetGodScore();
      lines.push(`► Thần Uy: ${score} điểm. ${score > 500 ? "Thế giới kính sợ Ngài." : score > 100 ? "Thế giới bắt đầu nhận ra sự hiện diện của Ngài." : "Thế giới chưa biết đến sức mạnh của Ngài."}`);
    }
    if (recentLog.length > 0) lines.push(`► Hành động gần nhất: "${recentLog[0].comment.substring(0,60)}..."`);
    lines.push(`► Dữ liệu không gian: ${(window.npcs||[]).filter(n=>n._divineBlessed).length} sinh linh được ban phước.`);
    return lines.join('<br>');
  }

  // ════ GLOBAL HANDLERS ════
  window.sgm67_updateTargets = window.sgm67_updateTargets || function() {};
  window.sgm67_updateTargets = function() {
    const type = (document.getElementById("sgm67-target-type")||{}).value;
    const sel = document.getElementById("sgm67-target-name");
    if (!sel) return;
    if (type === "npc") {
      sel.innerHTML = (window.npcs||[]).filter(n=>n.status==="alive").slice(0,30).map(n=>`<option value="${n.name}">${n.name}</option>`).join('');
    } else if (type === "nation") {
      sel.innerHTML = (window.countries||[]).map(c=>`<option value="${c.name}">${c.name}</option>`).join('');
    } else {
      sel.innerHTML = `<option value="Thế Giới">🌍 Toàn Thế Giới</option>`;
    }
  };

  window.sgm67_execute = function() {
    const targetType = (document.getElementById("sgm67-target-type")||{}).value || "npc";
    const targetName = (document.getElementById("sgm67-target-name")||{}).value || "Thế Giới";
    // Build fake entity from dropdown
    const entity = {
      name: targetName,
      type: targetType === "npc" ? "npc" : "country",
      color: "#00f5ff"
    };
    const result = typeof window.sgm67Execute === "function"
      ? window.sgm67Execute(entity)
      : { ok: false, msg: "Spatial God Mode chưa sẵn sàng." };
    const el = document.getElementById("sgm67-execute-result");
    if (el) { el.style.padding="8px"; el.innerHTML = result.msg; el.style.color = result.ok ? "#4ade80" : "#f87171"; }
  };

  window.su67_toggleJarvis = function() {
    _jarvisExpanded = !_jarvisExpanded;
    const container = document.getElementById("su67-jarvis-container");
    if (container) container.innerHTML = buildJarvisSpatial();
  };

  window.su67_refreshJarvis = function() {
    if (typeof window.htl67BuildData === "function") window.htl67BuildData();
    const container = document.getElementById("su67-jarvis-container");
    if (container) container.innerHTML = buildJarvisSpatial();
  };

  function _getEmpireCount() {
    if (!window.empireData) return 0;
    const es = Array.isArray(window.empireData.empires) ? window.empireData.empires : Object.values(window.empireData.empires || {});
    return es.length;
  }

  // ════ TAB CONTROLLER ════
  window.su67_currentTab = "spatial-view";
  window.su67_showTab = function(tabId) {
    window.su67_currentTab = tabId;
    _activeTab = tabId;

    // Stop previous loops
    if (window.spatialV67Data && window.spatialV67Data._stopLoop) window.spatialV67Data._stopLoop();
    if (window.hologramMapV67Data && window.hologramMapV67Data._stop) window.hologramMapV67Data._stop();
    if (window.universeVisV67Data && window.universeVisV67Data._stop) window.universeVisV67Data._stop();
    if (window.hologramTimelineV67Data && window.hologramTimelineV67Data._stop) window.hologramTimelineV67Data._stop();

    const content = document.getElementById("su67-tab-content");
    if (!content) return;

    const tabs = ["spatial-view","hologram-timeline","universe-table","spatial-god-mode"];
    tabs.forEach(id => {
      const btn = document.getElementById("su67-tab-" + id);
      if (btn) {
        const active = id === tabId;
        btn.style.borderBottom = active ? "2px solid #00f5ff" : "2px solid transparent";
        btn.style.color = active ? "#00f5ff" : "#64748b";
      }
    });

    const tabBuilders = {
      "spatial-view": buildSpatialViewTab,
      "hologram-timeline": buildHologramTimelineTab,
      "universe-table": buildUniverseTableTab,
      "spatial-god-mode": buildSpatialGodModeTab
    };
    content.innerHTML = (tabBuilders[tabId] || buildSpatialViewTab)();
    document.getElementById("su67-jarvis-container").innerHTML = buildJarvisSpatial();

    // Start canvas loop
    setTimeout(() => {
      if (tabId === "spatial-view") {
        const c = document.getElementById("sve67-canvas");
        if (c) { const s = getCanvasSize(c); c.width = s.w; c.height = s.h; window.swe67StartLoop("sve67-canvas"); }
      } else if (tabId === "hologram-timeline") {
        const c = document.getElementById("htl67-canvas");
        if (c) { const s = getCanvasSize(c); c.width = s.w; c.height = s.h; window.htl67StartLoop("htl67-canvas"); }
        setTimeout(() => {
          const d = window.hologramTimelineV67Data;
          const ec = document.getElementById("htl67-event-count");
          if (ec) ec.textContent = d ? d.events.length : 0;
          const pc = document.getElementById("htl67-proph-count");
          if (pc) pc.textContent = d ? d.prophecies.length : 0;
        }, 500);
      } else if (tabId === "universe-table") {
        const c = document.getElementById("uv67-canvas");
        if (c) {
          const s = getCanvasSize(c);
          c.width = s.w; c.height = s.h;
          window.uv67BuildUniverse(s.w, s.h);
          window.uv67StartLoop("uv67-canvas");
        }
      } else if (tabId === "spatial-god-mode") {
        // No canvas loop for god mode — it's interactive UI
        if (typeof window.sgm67SetMode === "function") window.sgm67SetMode("bless");
      }
    }, 60);
  };

  // ════ INJECT INTO CREATOR HUB V32 ════
  function buildSpatialSection() {
    return `<div id="su67-section-wrapper" style="margin-top:16px;border-top:2px solid #0e4d6e;padding-top:14px">
      <div style="font-family:'Courier New',monospace;font-size:14px;color:#00f5ff;margin-bottom:10px;display:flex;align-items:center;gap:8px">
        🌍 V67 — Spatial UI
        <span style="font-size:10px;color:#475569;font-family:monospace">Thế Giới Trong Không Gian 3D</span>
      </div>
      <div style="display:flex;gap:0;margin-bottom:12px;border-bottom:1px solid #1e293b;overflow-x:auto">
        ${[
          {id:"spatial-view",       icon:"🌍", label:"Spatial View"},
          {id:"hologram-timeline",  icon:"⏳", label:"Timeline"},
          {id:"universe-table",     icon:"🌌", label:"Universe Table"},
          {id:"spatial-god-mode",   icon:"⚡", label:"God Mode"}
        ].map(t => `<button id="su67-tab-${t.id}" onclick="window.su67_showTab('${t.id}')"
          style="background:transparent;border:none;border-bottom:2px solid transparent;padding:7px 11px;cursor:pointer;font-family:'Courier New',monospace;font-size:11px;color:#64748b;white-space:nowrap">
          ${t.icon} ${t.label}
        </button>`).join('')}
      </div>
      <div id="su67-tab-content" style="min-height:200px"></div>
      <div id="su67-jarvis-container"></div>
    </div>`;
  }

  function patchCreatorHub() {
    const _origHub = window.hubRenderPanel;
    window.hubRenderPanel = function(panelId) {
      if (_origHub) _origHub(panelId);
      if (panelId !== "creator-hub-v32") return;
      setTimeout(function() {
        const panel = document.getElementById("panel-creator-hub-v32");
        if (!panel) return;
        if (document.getElementById("su67-section-wrapper")) return;
        const div = document.createElement("div");
        div.innerHTML = buildSpatialSection();
        panel.appendChild(div.firstElementChild);
        setTimeout(function() { window.su67_showTab("spatial-view"); }, 150);
      }, 120);
    };
  }

  function init() {
    patchCreatorHub();
    console.log("[SpatialUIRegistryV67] 🌍 Spatial UI Registry khởi động — 4 tabs (Spatial View / Timeline / Universe Table / God Mode) trong creator-hub-v32.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 15100); });
  } else {
    setTimeout(init, 15100);
  }
})();
