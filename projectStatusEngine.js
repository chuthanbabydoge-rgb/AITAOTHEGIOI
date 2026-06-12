// ═══════════════════════════════════════════════════════════════
// PROJECT STATUS ENGINE V24 — Creator God World Simulator
// Hồ Sơ Dự Án: Hiển thị PROJECT_STATUS · CHANGELOG · ARCHITECTURE · AI_MEMORY
// Tích hợp vào trong game — Tab 📋 Hồ Sơ Dự Án
// ═══════════════════════════════════════════════════════════════

(function() {
"use strict";

// ─── DATA (nhúng trực tiếp để không cần fetch) ────────────────
const PS_VERSION = "V24";
const PS_DATE = "2026-06-12";

const PS_FILES = [
  // [filename, size_approx, category]
  ["app.js","285KB","Core"],["worldTemplates.js","32KB","Core"],["saveManager.js","14KB","Core"],
  ["multiWorldSystem.js","32KB","Core"],["worldHub.js","47KB","Core"],
  ["living-world-engine.js","60KB","AI"],["autoPlayerAI.js","27KB","AI"],
  ["aiStoryEngine.js","72KB","AI"],["aiWorldGenerator.js","66KB","AI"],["livingCivilizationAI.js","61KB","AI"],
  ["economySystem.js","29KB","Economy"],["economyEngine.js","56KB","Economy"],
  ["economyEngineV2.js","41KB","Economy"],["economyAuditSystem.js","27KB","Economy"],["worldMarketplace.js","34KB","Economy"],
  ["warEngine.js","41KB","War"],["territorySystem.js","8KB","War"],["territoryWarSystem.js","28KB","War"],
  ["diplomaticEngine.js","34KB","Diplomacy"],["espionageEngine.js","39KB","Diplomacy"],
  ["allianceEngine.js","—","Diplomacy V24"],["treatyEngine.js","—","Diplomacy V24"],
  ["sanctionEngine.js","—","Diplomacy V24"],["worldCouncilEngine.js","—","Diplomacy V24"],
  ["diplomacyEngine.js","—","Diplomacy V24"],
  ["kingdomEngine.js","24KB","Empire"],["kingdomAI.js","15KB","Empire"],
  ["empireEngine.js","26KB","Empire"],["empireAI.js","16KB","Empire"],
  ["successionEngine.js","20KB","Empire"],["nobleHouseEngine.js","22KB","Empire"],
  ["dynastyEngine.js","37KB","Empire"],["dynastySystem.js","27KB","Empire"],
  ["bloodlineEngine.js","32KB","Empire"],["hereditaryBloodlineEngine.js","57KB","Empire"],
  ["worldEventEngine.js","49KB","World"],["continentEngine.js","94KB","World"],
  ["ageEngine.js","20KB","World"],["mythologyEngine.js","44KB","World"],
  ["technologyEngine.js","52KB","World"],["politicalReligionEngine.js","37KB","World"],
  ["cultureHeritageEngine.js","83KB","World"],["migrationEngine.js","47KB","World"],
  ["emergentCivilization.js","37KB","World"],["historicalTimeline.js","14KB","World"],
  ["worldMemoryEngine.js","33KB","World"],["worldStorySystem.js","33KB","World"],
  ["aiStoryEngine.js","72KB","World"],["heavenlyDaoEngine.js","37KB","World"],
  ["navalOceanEngine.js","61KB","World"],
  ["npcReputationEngine.js","40KB","NPC"],["npcSpatialEngine.js","25KB","NPC"],
  ["heroLegendEngine.js","44KB","NPC"],["rankingsEngine.js","34KB","NPC"],
  ["progressionSystem.js","37KB","NPC"],["playerSystem.js","32KB","NPC"],["creatorGodEngine.js","33KB","NPC"],
  ["artifactSystem.js","38KB","Items"],["artifactEvolutionEngine.js","72KB","Items"],
  ["legendaryArtifactEngine.js","44KB","Items"],["spiritBeastSystem.js","41KB","Items"],
  ["catastropheSystem.js","33KB","Misc"],["dungeonSystem.js","39KB","Misc"],
  ["questSystem.js","53KB","Misc"],["questEngine.js","40KB","Misc"],
  ["religionEngine.js","25KB","Misc"],["worldMapSystem.js","59KB","Misc"],
  ["worldViewer3D.js","24KB","Misc"],["cityVisualization.js","28KB","Misc"],
  ["thiendinhSystem.js","77KB","Misc"],["globalSearchSystem.js","15KB","Misc"],
  ["timeControlSystem.js","54KB","Misc"],["webxrSystem.js","41KB","Misc"],
  ["populationLimitSystem.js","28KB","Misc"],["lodPerformanceSystem.js","28KB","Misc"],
  ["projectStatusEngine.js","—","Meta"],
];

const PS_TABS_DATA = [
  { icon:"🌍",label:"Thế Giới",panel:"panel-world",engine:"app.js" },
  { icon:"👥",label:"Sinh Linh",panel:"panel-npcs",engine:"app.js" },
  { icon:"⚔️",label:"Tông Môn",panel:"panel-sects",engine:"app.js" },
  { icon:"🏳️",label:"Quốc Gia",panel:"panel-countries",engine:"app.js" },
  { icon:"🏰",label:"Kingdoms",panel:"panel-kingdoms",engine:"kingdomEngine.js" },
  { icon:"👑",label:"Empires",panel:"panel-empires",engine:"empireEngine.js" },
  { icon:"📊",label:"Dashboard",panel:"panel-dashboard",engine:"economyAuditSystem.js" },
  { icon:"🗺️",label:"Bản Đồ",panel:"panel-worldmap",engine:"worldMapSystem.js" },
  { icon:"💰",label:"Kinh Tế",panel:"panel-economy",engine:"economySystem.js" },
  { icon:"⚔️",label:"War Engine",panel:"panel-war-engine",engine:"warEngine.js" },
  { icon:"🌐",label:"Ngoại Giao V1",panel:"panel-diplomacy",engine:"diplomaticEngine.js" },
  { icon:"🕵️",label:"Gián Điệp",panel:"panel-espionage",engine:"espionageEngine.js" },
  { icon:"⚙️",label:"Công Nghệ",panel:"panel-technology",engine:"technologyEngine.js" },
  { icon:"🧬",label:"Bloodlines",panel:"panel-bloodlines",engine:"bloodlineEngine.js" },
  { icon:"🏆",label:"Rankings",panel:"panel-rankings",engine:"rankingsEngine.js" },
  { icon:"🌍",label:"Đại Lục",panel:"panel-continent",engine:"continentEngine.js" },
  { icon:"🌌",label:"Thiên Hạ Đại Sự",panel:"panel-world-event",engine:"worldEventEngine.js" },
  { icon:"📖",label:"Thần Thoại",panel:"panel-mythology",engine:"mythologyEngine.js" },
  { icon:"🧠",label:"Văn Minh AI",panel:"panel-living-civ",engine:"livingCivilizationAI.js" },
  { icon:"🌊",label:"Đại Dương",panel:"panel-naval-ocean",engine:"navalOceanEngine.js" },
  { icon:"🤝",label:"Ngoại Giao V24",panel:"panel-diplomacy-v24",engine:"diplomacyEngine.js" },
  { icon:"📜",label:"Hiệp Ước",panel:"panel-treaties-v24",engine:"treatyEngine.js" },
  { icon:"🏛",label:"Hội Đồng",panel:"panel-world-council",engine:"worldCouncilEngine.js" },
  { icon:"🌍",label:"Quan Hệ Quốc Tế",panel:"panel-intl-relations",engine:"diplomacyEngine.js" },
  { icon:"📋",label:"Hồ Sơ Dự Án",panel:"panel-project-status",engine:"projectStatusEngine.js" },
];

const PS_SAVE_KEYS = [
  { key:"cgv6_worlds",engine:"app.js",desc:"Danh sách worlds" },
  { key:"cgv6_world_*",engine:"app.js",desc:"State từng world (NPCs, Sects, Countries, year...)" },
  { key:"cgv6_player",engine:"playerSystem.js",desc:"Player data" },
  { key:"cgv6_warEngine",engine:"warEngine.js",desc:"Wars, alliances, stats" },
  { key:"cgv6_diplomacy",engine:"diplomaticEngine.js",desc:"Relations V1, ambassadors, treaties" },
  { key:"cgv6_alliance_v24",engine:"allianceEngine.js",desc:"Liên minh V24" },
  { key:"cgv6_treaty_v24",engine:"treatyEngine.js",desc:"Hiệp ước V24" },
  { key:"cgv6_sanction_v24",engine:"sanctionEngine.js",desc:"Trừng phạt & phụ thuộc V24" },
  { key:"cgv6_worldcouncil_v24",engine:"worldCouncilEngine.js",desc:"Hội Đồng Thế Giới V24" },
  { key:"cgv6_kingdoms",engine:"kingdomEngine.js",desc:"Kingdom data V23" },
  { key:"cgv6_empires",engine:"empireEngine.js",desc:"Empire data V23" },
  { key:"cgv6_espionage",engine:"espionageEngine.js",desc:"Spy networks" },
  { key:"cgv6_economy",engine:"economyEngine.js",desc:"Economy state" },
  { key:"cgv6_continent",engine:"continentEngine.js",desc:"Continent data" },
  { key:"cgv6_mythology",engine:"mythologyEngine.js",desc:"Myths" },
  { key:"cgv6_technology",engine:"technologyEngine.js",desc:"Tech tree" },
  { key:"cgv6_culture",engine:"cultureHeritageEngine.js",desc:"Culture data" },
  { key:"cgv6_religion_political",engine:"politicalReligionEngine.js",desc:"Religion state" },
  { key:"cgv6_herolegend",engine:"heroLegendEngine.js",desc:"Heroes, legends" },
  { key:"cgv6_worldmemory",engine:"worldMemoryEngine.js",desc:"World memories" },
  { key:"cgv6_reputation",engine:"npcReputationEngine.js",desc:"NPC reputations" },
  { key:"cgv6_artifacts",engine:"artifactSystem.js",desc:"Artifacts" },
  { key:"cgv6_spiritbeast",engine:"spiritBeastSystem.js",desc:"Spirit beasts" },
  { key:"cgv6_migration",engine:"migrationEngine.js",desc:"Migration data" },
];

const PS_ROADMAP = [
  { ver:"V25", name:"Espionage & Intelligence V2", priority:"HIGH", desc:"Spy networks, Tech theft, Double agents, V24 integration" },
  { ver:"V26", name:"Climate & Disaster V2", priority:"MEDIUM", desc:"Seasonal effects, Natural disasters, World Council resolutions" },
  { ver:"V27", name:"Genetics Engine", priority:"MEDIUM", desc:"DNA traits, Mutation, Evolution, Bloodline integration" },
  { ver:"V28", name:"Religion V2 — Schism & Crusades", priority:"MEDIUM", desc:"Heresy, Holy wars, Religious alliances" },
  { ver:"V29", name:"Trade Route Engine", priority:"LOW", desc:"Visual trade flows, Pirates, Maritime trade" },
  { ver:"V30", name:"Cultural Exchange Engine", priority:"LOW", desc:"Syncretism, Language spread, Cultural alliances" },
  { ver:"V31", name:"Multiverse Engine", priority:"LOW", desc:"Parallel worlds, Cross-world interactions" },
];

// ─── HELPERS ─────────────────────────────────────────────────
function _lsSize() {
  let total = 0;
  for (let k in localStorage) {
    if (!localStorage.hasOwnProperty(k)) continue;
    try { total += (localStorage[k].length * 2); } catch(e) {}
  }
  return (total / 1024).toFixed(1) + " KB";
}

function _lsKeySize(key) {
  try {
    const v = localStorage.getItem(key);
    if (!v) return "—";
    return ((v.length * 2) / 1024).toFixed(1) + " KB";
  } catch(e) { return "—"; }
}

function _countByCategory(cat) {
  return PS_FILES.filter(f => f[2] === cat).length;
}

function _getActiveAlliances() {
  try { return (window.allianceData?.alliances || []).filter(a => !a.dissolved).length; } catch(e) { return 0; }
}
function _getActiveTreaties() {
  try { return (window.treatyData?.treaties || []).filter(t => t.active).length; } catch(e) { return 0; }
}
function _getActiveSanctions() {
  try { return (window.sanctionData?.sanctions || []).filter(s => s.active).length; } catch(e) { return 0; }
}
function _getCouncilStatus() {
  try { return window.worldCouncilData?.founded ? `Năm ${window.worldCouncilData.founded}` : "Chưa thành lập"; } catch(e) { return "—"; }
}

// ─── ACTIVE TAB STATE ────────────────────────────────────────
let _activeSubTab = "status";

// ─── RENDER MAIN PANEL ───────────────────────────────────────
window.psRenderPanel = function() {
  const el = document.getElementById("panel-project-status");
  if (!el) return;

  const categories = [...new Set(PS_FILES.map(f => f[2]))];
  const catColors = {
    "Core":"#facc15","AI":"#c084fc","Economy":"#4ade80","War":"#f87171",
    "Diplomacy":"#60a5fa","Diplomacy V24":"#34d399","Empire":"#fb923c",
    "World":"#a78bfa","NPC":"#f472b6","Items":"#fbbf24","Misc":"#94a3b8","Meta":"#e2e8f0"
  };

  el.innerHTML = `
  <div style="padding:20px;max-width:1100px;margin:0 auto;">
    <!-- HEADER -->
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;">
      <span style="font-size:32px;">📋</span>
      <div style="flex:1;">
        <div style="font-family:var(--font-title);font-size:1.5em;color:var(--gold);">Hồ Sơ Dự Án</div>
        <div style="color:var(--white-dim);font-size:.82em;">Creator God V6 · ${PS_VERSION} · Build ${PS_DATE} · ${PS_FILES.length} files · localStorage: ${_lsSize()}</div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        ${[
          {id:"status",icon:"📊",label:"Tổng Quan"},
          {id:"files",icon:"📁",label:"Files"},
          {id:"tabs",icon:"🖥️",label:"UI Tabs"},
          {id:"saves",icon:"💾",label:"Save Data"},
          {id:"roadmap",icon:"🚀",label:"Roadmap"},
          {id:"changelog",icon:"📜",label:"Changelog"},
          {id:"rules",icon:"🛡️",label:"Quy Tắc"},
        ].map(t=>`<button onclick="window.psSwitchTab('${t.id}')" id="pstab-${t.id}" style="background:${_activeSubTab===t.id?"linear-gradient(135deg,rgba(250,204,21,.25),rgba(250,204,21,.1))":"rgba(255,255,255,.04)"};border:1px solid ${_activeSubTab===t.id?"rgba(250,204,21,.5)":"var(--border)"};color:${_activeSubTab===t.id?"var(--gold)":"var(--white-dim)"};padding:5px 12px;border-radius:8px;cursor:pointer;font-size:.78em;font-family:var(--font-cjk);">${t.icon} ${t.label}</button>`).join("")}
      </div>
    </div>

    <!-- SUB-TAB CONTENT -->
    <div id="ps-content">
      ${_renderSubTab(_activeSubTab, categories, catColors)}
    </div>
  </div>`;
};

window.psSwitchTab = function(tab) {
  _activeSubTab = tab;
  window.psRenderPanel();
};

function _renderSubTab(tab, categories, catColors) {
  switch(tab) {
    case "status":   return _renderStatus(categories, catColors);
    case "files":    return _renderFiles(categories, catColors);
    case "tabs":     return _renderTabs();
    case "saves":    return _renderSaves();
    case "roadmap":  return _renderRoadmap();
    case "changelog":return _renderChangelog();
    case "rules":    return _renderRules();
    default:         return _renderStatus(categories, catColors);
  }
}

// ─── SUB-TAB: TỔNG QUAN ──────────────────────────────────────
function _renderStatus(categories, catColors) {
  const yr = (typeof window.year !== "undefined") ? window.year : "—";
  const worldName = (typeof window.world !== "undefined" && window.world?.name) ? window.world.name : "Chưa có world";
  const npcCount = (window.npcs || []).length;
  const countryCount = (window.countries || []).length;
  const warsCount = (window.warsActive || []).filter(w=>w.status==="active").length;

  return `
  <!-- LIVE STATS -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;">
    ${[
      {icon:"🌍",label:"World",val:worldName,color:"#60a5fa"},
      {icon:"📅",label:"Năm hiện tại",val:yr,color:"#facc15"},
      {icon:"👥",label:"NPCs",val:npcCount,color:"#4ade80"},
      {icon:"🏳️",label:"Quốc gia",val:countryCount,color:"#fb923c"},
      {icon:"⚔️",label:"Chiến tranh",val:warsCount,color:"#f87171"},
      {icon:"🤝",label:"Liên Minh",val:_getActiveAlliances(),color:"#34d399"},
      {icon:"📜",label:"Hiệp Ước",val:_getActiveTreaties(),color:"#a78bfa"},
      {icon:"🏛",label:"Hội Đồng",val:_getCouncilStatus(),color:"#fbbf24"},
    ].map(s=>`<div style="background:var(--bg-card);border:1px solid ${s.color}33;border-radius:10px;padding:12px;text-align:center;">
      <div style="font-size:18px;">${s.icon}</div>
      <div style="font-size:.88em;font-weight:700;color:${s.color};margin:4px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.val}</div>
      <div style="font-size:.72em;color:var(--white-dim);">${s.label}</div>
    </div>`).join("")}
  </div>

  <!-- PHÂN LOẠI FILES -->
  <div style="font-family:var(--font-title);color:var(--gold);margin-bottom:10px;font-size:.9em;">📁 Phân Loại Files (${PS_FILES.length} files)</div>
  <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:20px;">
    ${categories.map(cat => {
      const count = _countByCategory(cat);
      const color = catColors[cat] || "#94a3b8";
      return `<div style="background:${color}11;border:1px solid ${color}44;border-radius:8px;padding:10px;text-align:center;">
        <div style="font-size:1.2em;font-weight:700;color:${color};">${count}</div>
        <div style="font-size:.72em;color:${color};margin-top:2px;">${cat}</div>
      </div>`;
    }).join("")}
  </div>

  <!-- PROJECT HEALTH -->
  <div style="font-family:var(--font-title);color:var(--gold);margin-bottom:10px;font-size:.9em;">❤️ Project Health</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px;">
      <div style="font-size:.82em;color:var(--gold-dim);margin-bottom:8px;">✅ Systems Completed</div>
      ${[
        {label:"Core Engine",pct:95},
        {label:"Economy",pct:90},
        {label:"War & Military",pct:85},
        {label:"Diplomacy V24",pct:100},
        {label:"Empire & Kingdom V23",pct:90},
        {label:"World Simulation",pct:85},
        {label:"Characters & NPCs",pct:80},
        {label:"Items & Artifacts",pct:85},
      ].map(s=>`<div style="margin-bottom:6px;">
        <div style="display:flex;justify-content:space-between;font-size:.78em;color:var(--white-dim);margin-bottom:2px;"><span>${s.label}</span><span style="color:var(--jade);">${s.pct}%</span></div>
        <div style="height:4px;background:var(--bg-secondary);border-radius:2px;">
          <div style="height:4px;background:linear-gradient(90deg,#4ade80,#22863a);border-radius:2px;width:${s.pct}%;"></div>
        </div>
      </div>`).join("")}
    </div>
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px;">
      <div style="font-size:.82em;color:var(--gold-dim);margin-bottom:8px;">📋 Meta Info</div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        ${[
          {k:"Project",v:"Creator God V6"},
          {k:"Version",v:PS_VERSION},
          {k:"Build Date",v:PS_DATE},
          {k:"Total JS Files",v:PS_FILES.length},
          {k:"Total UI Tabs",v:PS_TABS_DATA.length},
          {k:"Save Keys",v:PS_SAVE_KEYS.length},
          {k:"localStorage Used",v:_lsSize()},
          {k:"Architecture",v:"Vanilla JS · No framework"},
          {k:"Persistence",v:"localStorage only"},
          {k:"Multiplayer",v:"None (single-player)"},
        ].map(r=>`<div style="display:flex;justify-content:space-between;font-size:.8em;border-bottom:1px solid rgba(255,255,255,.04);padding-bottom:4px;">
          <span style="color:var(--white-dim);">${r.k}</span>
          <span style="color:var(--white-main);font-weight:600;">${r.v}</span>
        </div>`).join("")}
      </div>
    </div>
  </div>

  <!-- KNOWN BUGS -->
  <div style="font-family:var(--font-title);color:var(--gold);margin-bottom:8px;font-size:.9em;">🐛 Known Bugs</div>
  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:12px;">
    ${[
      {sev:"LOW",bug:"WebXR không hoạt động hoàn toàn",engine:"webxrSystem.js"},
      {sev:"LOW",bug:"favicon.ico 404",engine:"server"},
      {sev:"MEDIUM",bug:"Duplicate war alliances có thể hình thành",engine:"warEngine.js"},
    ].map(b=>{
      const c = b.sev==="HIGH"?"#f87171":b.sev==="MEDIUM"?"#fbbf24":"#94a3b8";
      return `<div style="display:flex;gap:10px;align-items:center;margin-bottom:6px;font-size:.82em;">
        <span style="background:${c}22;border:1px solid ${c};color:${c};padding:1px 8px;border-radius:10px;font-size:.8em;white-space:nowrap;">${b.sev}</span>
        <span style="color:var(--white-main);">${b.bug}</span>
        <span style="color:#475569;margin-left:auto;white-space:nowrap;">${b.engine}</span>
      </div>`;
    }).join("")}
  </div>`;
}

// ─── SUB-TAB: FILES ──────────────────────────────────────────
function _renderFiles(categories, catColors) {
  return `
  <div style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap;">
    <button onclick="window.psFilterFiles('all')" style="background:rgba(250,204,21,.15);border:1px solid var(--gold);color:var(--gold);padding:4px 14px;border-radius:20px;cursor:pointer;font-size:.8em;">Tất Cả (${PS_FILES.length})</button>
    ${categories.map(cat=>{
      const c = catColors[cat]||"#94a3b8";
      return `<button onclick="window.psFilterFiles('${cat}')" style="background:${c}15;border:1px solid ${c}66;color:${c};padding:4px 14px;border-radius:20px;cursor:pointer;font-size:.8em;">${cat} (${_countByCategory(cat)})</button>`;
    }).join("")}
  </div>
  <div id="ps-file-list" style="max-height:550px;overflow-y:auto;">
    <table style="width:100%;border-collapse:collapse;font-size:.82em;">
      <thead>
        <tr style="border-bottom:1px solid var(--border);">
          <th style="padding:8px;text-align:left;color:var(--gold-dim);">File</th>
          <th style="padding:8px;text-align:left;color:var(--gold-dim);">Category</th>
          <th style="padding:8px;text-align:right;color:var(--gold-dim);">Size</th>
          <th style="padding:8px;text-align:right;color:var(--gold-dim);">localStorage</th>
        </tr>
      </thead>
      <tbody>
        ${PS_FILES.map((f,i)=>{
          const cat = f[2]; const c = catColors[cat]||"#94a3b8";
          const guessKey = "cgv6_" + f[0].replace(/Engine.*?\.js$/i,"").replace(/System.*?\.js$/i,"").replace(/\.js$/,"").toLowerCase();
          const lsSize = _lsKeySize(guessKey);
          return `<tr class="ps-file-row" data-cat="${cat}" style="border-bottom:1px solid rgba(255,255,255,.03);${i%2===0?"":"background:rgba(255,255,255,.015)"}">
            <td style="padding:7px 8px;font-family:monospace;color:var(--white-main);">${f[0]}</td>
            <td style="padding:7px 8px;"><span style="background:${c}15;color:${c};padding:1px 8px;border-radius:10px;font-size:.78em;">${cat}</span></td>
            <td style="padding:7px 8px;text-align:right;color:var(--white-dim);">${f[1]}</td>
            <td style="padding:7px 8px;text-align:right;color:${lsSize!=="—"?"#4ade80":"#334155"};">${lsSize}</td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>
  </div>`;
}

window.psFilterFiles = function(cat) {
  const rows = document.querySelectorAll(".ps-file-row");
  rows.forEach(r => {
    r.style.display = (cat==="all" || r.dataset.cat===cat) ? "" : "none";
  });
};

// ─── SUB-TAB: UI TABS ────────────────────────────────────────
function _renderTabs() {
  return `
  <div style="max-height:580px;overflow-y:auto;">
    <table style="width:100%;border-collapse:collapse;font-size:.82em;">
      <thead><tr style="border-bottom:1px solid var(--border);">
        <th style="padding:8px;text-align:left;color:var(--gold-dim);">#</th>
        <th style="padding:8px;text-align:left;color:var(--gold-dim);">Tab</th>
        <th style="padding:8px;text-align:left;color:var(--gold-dim);">Panel ID</th>
        <th style="padding:8px;text-align:left;color:var(--gold-dim);">Engine</th>
        <th style="padding:8px;text-align:center;color:var(--gold-dim);">Trạng thái</th>
      </tr></thead>
      <tbody>
        ${PS_TABS_DATA.map((t,i)=>{
          const panelEl = document.getElementById(t.panel);
          const btnEl   = document.querySelector(`.nav-btn[data-panel="${t.panel.replace("panel-","")}"]`);
          const exists  = !!panelEl;
          const visible = btnEl ? (btnEl.style.display !== "none") : true;
          return `<tr style="border-bottom:1px solid rgba(255,255,255,.03);${i%2===0?"":"background:rgba(255,255,255,.015)"}">
            <td style="padding:7px 8px;color:#475569;">${i+1}</td>
            <td style="padding:7px 8px;color:var(--white-main);">${t.icon} ${t.label}</td>
            <td style="padding:7px 8px;font-family:monospace;color:#60a5fa;font-size:.78em;">${t.panel}</td>
            <td style="padding:7px 8px;font-family:monospace;color:#a78bfa;font-size:.78em;">${t.engine}</td>
            <td style="padding:7px 8px;text-align:center;">
              <span style="color:${exists?"#4ade80":"#f87171"};font-size:.8em;">${exists?"✅ OK":"❌ Missing"}</span>
              ${!visible && exists?`<span style="color:#fbbf24;font-size:.78em;"> (hidden)</span>`:""}
            </td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>
  </div>`;
}

// ─── SUB-TAB: SAVE DATA ──────────────────────────────────────
function _renderSaves() {
  const totalSize = _lsSize();
  return `
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
    <span style="color:var(--white-dim);font-size:.85em;">Tổng localStorage:</span>
    <span style="color:#4ade80;font-weight:700;">${totalSize}</span>
    <button onclick="window.psClearSaveConfirm()" style="margin-left:auto;background:rgba(248,113,113,.1);border:1px solid #f87171;color:#f87171;padding:5px 14px;border-radius:7px;cursor:pointer;font-size:.8em;">⚠️ Xóa Tất Cả Save</button>
  </div>
  <div style="max-height:520px;overflow-y:auto;">
    <table style="width:100%;border-collapse:collapse;font-size:.82em;">
      <thead><tr style="border-bottom:1px solid var(--border);">
        <th style="padding:8px;text-align:left;color:var(--gold-dim);">Key</th>
        <th style="padding:8px;text-align:left;color:var(--gold-dim);">Engine</th>
        <th style="padding:8px;text-align:left;color:var(--gold-dim);">Mô Tả</th>
        <th style="padding:8px;text-align:right;color:var(--gold-dim);">Size</th>
        <th style="padding:8px;text-align:center;color:var(--gold-dim);">Có Data</th>
      </tr></thead>
      <tbody>
        ${PS_SAVE_KEYS.map((s,i)=>{
          const sz = _lsKeySize(s.key);
          const hasData = localStorage.getItem(s.key) !== null;
          return `<tr style="border-bottom:1px solid rgba(255,255,255,.03);${i%2===0?"":"background:rgba(255,255,255,.015)"}">
            <td style="padding:7px 8px;font-family:monospace;color:#60a5fa;font-size:.78em;">${s.key}</td>
            <td style="padding:7px 8px;font-family:monospace;color:#a78bfa;font-size:.78em;">${s.engine}</td>
            <td style="padding:7px 8px;color:var(--white-dim);">${s.desc}</td>
            <td style="padding:7px 8px;text-align:right;color:${hasData?"#4ade80":"#334155"};">${sz}</td>
            <td style="padding:7px 8px;text-align:center;"><span style="color:${hasData?"#4ade80":"#475569"};">${hasData?"✅":"—"}</span></td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>
  </div>`;
}

window.psClearSaveConfirm = function() {
  if (!confirm("⚠️ XÓA TẤT CẢ SAVE DATA?\n\nHành động này không thể hoàn tác!\nTất cả world, lịch sử, và dữ liệu sẽ bị xóa.")) return;
  if (!confirm("Xác nhận lần 2: Thực sự muốn xóa tất cả?")) return;
  localStorage.clear();
  alert("✅ Đã xóa toàn bộ save data. Tải lại trang để bắt đầu mới.");
  location.reload();
};

// ─── SUB-TAB: ROADMAP ────────────────────────────────────────
function _renderRoadmap() {
  const prioColor = { HIGH:"#f87171", MEDIUM:"#fbbf24", LOW:"#94a3b8" };
  return `
  <div style="max-height:580px;overflow-y:auto;">
    <div style="font-family:var(--font-title);color:var(--gold);margin-bottom:14px;font-size:.9em;">🚀 Lộ Trình Phát Triển</div>
    ${PS_ROADMAP.map((r,i)=>{
      const c = prioColor[r.priority] || "#94a3b8";
      const isNext = i === 0;
      return `<div style="background:var(--bg-card);border:1px solid ${isNext?"rgba(250,204,21,.4)":"var(--border)"};border-left:3px solid ${c};border-radius:10px;padding:14px;margin-bottom:10px;${isNext?"box-shadow:0 0 20px rgba(250,204,21,.1);":""}">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
          ${isNext?`<span style="background:rgba(250,204,21,.2);border:1px solid var(--gold);color:var(--gold);padding:2px 10px;border-radius:12px;font-size:.78em;font-weight:700;">⭐ NEXT</span>`:""}
          <span style="font-family:var(--font-title);color:${c};font-size:.95em;">${r.ver} — ${r.name}</span>
          <span style="margin-left:auto;background:${c}22;border:1px solid ${c};color:${c};padding:2px 8px;border-radius:10px;font-size:.75em;">${r.priority}</span>
        </div>
        <div style="color:var(--white-dim);font-size:.83em;">${r.desc}</div>
      </div>`;
    }).join("")}
  </div>`;
}

// ─── SUB-TAB: CHANGELOG ──────────────────────────────────────
function _renderChangelog() {
  const entries = [
    {
      ver:"V24", date:"2026-06-12", color:"#4ade80",
      added:["allianceEngine.js","treatyEngine.js","sanctionEngine.js","worldCouncilEngine.js","diplomacyEngine.js","projectStatusEngine.js","PROJECT_STATUS.md","PROJECT_ARCHITECTURE.md","PROJECT_CHANGELOG.md","AI_MEMORY.md"],
      modified:["index.html"],
      ui:["🤝 Ngoại Giao V24","📜 Hiệp Ước","🏛 Hội Đồng","🌍 Quan Hệ Quốc Tế","📋 Hồ Sơ Dự Án"],
      saves:["cgv6_alliance_v24","cgv6_treaty_v24","cgv6_sanction_v24","cgv6_worldcouncil_v24"],
      notes:"100% backward compatible. diplomaticEngine.js V1 untouched."
    },
    {
      ver:"V23", date:"Pre-2026-06-12", color:"#60a5fa",
      added:["kingdomEngine.js","kingdomAI.js","empireEngine.js","empireAI.js","successionEngine.js","nobleHouseEngine.js","bloodlineEngine.js","hereditaryBloodlineEngine.js","livingCivilizationAI.js","navalOceanEngine.js","rankingsEngine.js","diplomaticEngine.js","espionageEngine.js","politicalReligionEngine.js","cultureHeritageEngine.js","historicalTimeline.js"],
      modified:["index.html"],
      ui:["Kingdoms","Empires","Bloodlines","Noble Houses","Succession Wars","Timeline","Rankings","Ngoại Giao","Gián Điệp","Tôn Giáo","Văn Hóa"],
      saves:["cgv6_kingdoms","cgv6_empires","cgv6_espionage"],
      notes:"100% backward compatible with pre-V23 saves."
    },
    {
      ver:"V1–V22", date:"Pre-2026", color:"#94a3b8",
      added:["app.js + 50 core engines"],
      modified:[],
      ui:["All original tabs"],
      saves:["cgv6_worlds","cgv6_world_*","cgv6_warEngine","cgv6_diplomacy"],
      notes:"Foundation versions — core simulation, economy, war, quests, artifacts."
    },
  ];

  return `
  <div style="max-height:580px;overflow-y:auto;">
    ${entries.map(e=>`
    <div style="background:var(--bg-card);border:1px solid ${e.color}33;border-left:3px solid ${e.color};border-radius:10px;padding:16px;margin-bottom:14px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
        <span style="font-family:var(--font-title);color:${e.color};font-size:1.1em;">[${e.ver}]</span>
        <span style="color:var(--white-dim);font-size:.85em;">${e.date}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:.8em;">
        <div>
          <div style="color:${e.color};margin-bottom:4px;font-weight:600;">📁 Files Added (${e.added.length})</div>
          ${e.added.slice(0,8).map(f=>`<div style="color:var(--white-dim);padding:1px 0;">+ ${f}</div>`).join("")}
          ${e.added.length>8?`<div style="color:#475569;">... và ${e.added.length-8} files khác</div>`:""}
        </div>
        <div>
          <div style="color:#fbbf24;margin-bottom:4px;font-weight:600;">🖥️ UI Changes (${e.ui.length})</div>
          ${e.ui.map(t=>`<div style="color:var(--white-dim);padding:1px 0;">+ Tab: ${t}</div>`).join("")}
          <div style="color:#60a5fa;margin-top:6px;font-weight:600;">💾 New Save Keys</div>
          ${e.saves.map(s=>`<div style="color:var(--white-dim);padding:1px 0;font-family:monospace;font-size:.9em;">${s}</div>`).join("")}
        </div>
      </div>
      <div style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,.05);font-size:.78em;color:#475569;">
        📌 Compatibility: ${e.notes}
      </div>
    </div>`).join("")}
  </div>`;
}

// ─── SUB-TAB: QUY TẮC ────────────────────────────────────────
function _renderRules() {
  return `
  <div style="max-height:580px;overflow-y:auto;">
    <div style="background:rgba(250,204,21,.06);border:2px solid rgba(250,204,21,.3);border-radius:14px;padding:20px;margin-bottom:16px;">
      <div style="font-family:var(--font-title);color:var(--gold);font-size:1.1em;margin-bottom:14px;">🛡️ PROJECT PROTECTION BLOCK</div>
      <div style="font-size:.85em;line-height:1.8;color:var(--white-main);">
        <div style="color:var(--gold-dim);margin-bottom:6px;">Luôn trả lời bằng <strong style="color:var(--gold);">TIẾNG VIỆT</strong>. Đọc toàn bộ project trước khi code.</div>

        <div style="color:#f87171;font-weight:700;margin:12px 0 6px;">TUYỆT ĐỐI KHÔNG:</div>
        ${["Xóa file cũ","Xóa dữ liệu cũ","Xóa save cũ","Xóa tab UI cũ","Xóa dashboard cũ","Xóa lịch sử thế giới","Đổi tên file cũ","Đổi tên class cũ","Đổi tên biến cũ","Thay thế hệ thống cũ","Ghi đè logic cũ","Viết lại app.js","Viết lại index.html"].map(r=>`<div style="color:#f87171;">❌ ${r}</div>`).join("")}

        <div style="color:#4ade80;font-weight:700;margin:12px 0 6px;">NẾU CẦN CHỈNH SỬA:</div>
        ${["Chỉ được mở rộng","Chỉ được thêm code","Chỉ được tích hợp"].map(r=>`<div style="color:#4ade80;">✅ ${r}</div>`).join("")}

        <div style="color:#fbbf24;font-weight:700;margin:12px 0 6px;">NẾU CHUẨN BỊ SỬA HƠN 20 DÒNG CODE CŨ:</div>
        <div style="color:#fbbf24;">⚠️ DỪNG → Tạo extension layer</div>

        <div style="margin:14px 0;padding:10px;background:rgba(250,204,21,.1);border-radius:8px;text-align:center;">
          <div style="font-family:var(--font-title);color:var(--gold);font-size:.95em;">PROJECT MODE</div>
          <div style="color:#4ade80;font-weight:700;font-size:1.05em;margin-top:4px;">EXPAND ONLY · NEVER DELETE · NEVER REPLACE · NEVER REBUILD</div>
        </div>

        <div style="color:var(--gold-dim);font-weight:700;margin:12px 0 6px;">TRƯỚC KHI CODE:</div>
        ${["Liệt kê hệ thống hiện có","Liệt kê file hiện có","Liệt kê tab UI hiện có","Lập kế hoạch tích hợp"].map((r,i)=>`<div style="color:var(--white-dim);">${i+1}. ${r}</div>`).join("")}

        <div style="color:var(--gold-dim);font-weight:700;margin:12px 0 6px;">SAU KHI HOÀN THÀNH, XUẤT:</div>
        ${["Hệ thống hiện có","Hệ thống mới","File mới","File chỉnh sửa","Kế hoạch tích hợp","Kiểm tra tương thích"].map((r,i)=>`<div style="color:var(--white-dim);">${i+1}. ${r}</div>`).join("")}
      </div>
    </div>

    <!-- QUICK REFERENCE -->
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px;">
      <div style="font-family:var(--font-title);color:var(--gold);margin-bottom:10px;font-size:.9em;">📌 Quick Reference — Global Objects</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:.78em;font-family:monospace;">
        ${[
          ["window.world","Current world state"],
          ["window.npcs","NPC array"],
          ["window.countries","Country array"],
          ["window.year","Current simulation year"],
          ["window.gameTick","Main tick function"],
          ["window.kingdomData","Kingdom V23 data"],
          ["window.empireData","Empire V23 data"],
          ["window.warsActive","Active wars array"],
          ["window.allianceData","Alliance V24 data"],
          ["window.treatyData","Treaty V24 data"],
          ["window.sanctionData","Sanction V24 data"],
          ["window.worldCouncilData","Council V24 data"],
          ["window.drGetRelation(a,b)","Get relation score"],
          ["window.aeAreAllied(a,b)","Check if allied"],
          ["window.teHasTreaty(a,b,t)","Check treaty"],
        ].map(([obj,desc])=>`<div style="padding:4px 6px;background:rgba(255,255,255,.03);border-radius:4px;">
          <span style="color:#60a5fa;">${obj}</span>
          <span style="color:#475569;display:block;font-size:.9em;">${desc}</span>
        </div>`).join("")}
      </div>
    </div>
  </div>`;
}

// ─── INIT ────────────────────────────────────────────────────
function psInit() {
  console.log("[ProjectStatusEngine V24] 📋 Hồ Sơ Dự Án — Status · Files · Tabs · Saves · Roadmap · Rules sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function() { setTimeout(psInit, 3000); });
} else {
  setTimeout(psInit, 3000);
}

})();
