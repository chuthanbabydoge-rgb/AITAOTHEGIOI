/* ============================
   CREATOR GOD V6 — WORLD HUB
   worldHub.js — LỚP 1 & LỚP 2
   
   LỚP 1: Trung Tâm Thế Giới (/)
   LỚP 2: Trình Tạo Thế Giới (/create)
   LỚP 3: World Runtime — app.js (đã có)
   
   Load SAU multiWorldSystem.js và aiWorldGenerator.js
   ============================ */

"use strict";

// ============================
// HUB STATE
// ============================
let _hubVisible = false;
let _createVisible = false;
let _hubCurrentTab = "my-worlds"; // "my-worlds" | "create" | "templates"
let _hubSearchQuery = "";
let _selectedTemplate = "cultivation";
let _aiPrompt = "";
let _aiPreviewData = null;
let _aiPreviewLoading = false;

// ============================
// CSS
// ============================
function injectWorldHubCSS() {
  if (document.getElementById("worldHubCSS")) return;
  const style = document.createElement("style");
  style.id = "worldHubCSS";
  style.textContent = `
/* ==================================
   WORLD HUB — FULL SCREEN OVERLAY
   ================================== */

#worldHubOverlay {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at 20% 30%, rgba(250,204,21,0.04) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 70%, rgba(96,165,250,0.04) 0%, transparent 60%),
              #080a0f;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: opacity 0.3s;
}
#worldHubOverlay.hidden { display: none !important; }

/* --- Top Bar --- */
.hub-topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 28px;
  border-bottom: 1px solid rgba(250,204,21,0.12);
  background: rgba(8,10,15,0.95);
  backdrop-filter: blur(12px);
  flex-shrink: 0;
  z-index: 10;
}
.hub-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.hub-logo-symbol {
  font-size: 26px;
  filter: drop-shadow(0 0 10px rgba(250,204,21,0.7));
  animation: pulse-glow 3s ease-in-out infinite;
}
.hub-logo-text {
  font-family: 'Cinzel Decorative', serif;
  font-size: 13px;
  letter-spacing: 3px;
  color: var(--gold);
  line-height: 1.2;
}
.hub-logo-sub {
  font-size: 10px;
  color: var(--white-dim);
  letter-spacing: 1.5px;
}

.hub-tabs {
  display: flex;
  gap: 6px;
  margin-left: 24px;
}
.hub-tab {
  padding: 7px 18px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 20px;
  color: var(--white-dim);
  font-family: var(--font-cjk), serif;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.hub-tab:hover { border-color: var(--border-hover); color: var(--white-main); }
.hub-tab.active {
  background: rgba(250,204,21,0.1);
  border-color: rgba(250,204,21,0.4);
  color: var(--gold);
}

.hub-spacer { flex: 1; }

.hub-world-count {
  font-size: 11px;
  color: var(--white-dim);
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
}

.hub-enter-btn {
  padding: 7px 16px;
  background: linear-gradient(135deg, rgba(250,204,21,0.15), rgba(250,204,21,0.05));
  border: 1px solid rgba(250,204,21,0.5);
  border-radius: 8px;
  color: var(--gold);
  font-family: var(--font-cjk), serif;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.hub-enter-btn:hover { background: rgba(250,204,21,0.2); }

/* --- Body --- */
.hub-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 28px;
}

/* --- My Worlds Tab --- */
.hub-section-title {
  font-family: var(--font-title), serif;
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--gold-dim);
  text-transform: uppercase;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.hub-section-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.hub-search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.hub-search-input {
  flex: 1;
  padding: 9px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--white-main);
  font-family: var(--font-cjk), serif;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}
.hub-search-input:focus { border-color: rgba(250,204,21,0.4); }
.hub-search-input::placeholder { color: var(--white-dim); }

/* World Grid */
.hub-world-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 40px;
}

.hub-world-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s;
  position: relative;
}
.hub-world-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(250,204,21,0.08);
}

.hub-card-banner {
  height: 80px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hub-card-genre-icon {
  font-size: 44px;
  opacity: 0.25;
  filter: blur(1px);
}
.hub-card-active-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(74,222,128,0.15);
  border: 1px solid rgba(74,222,128,0.4);
  color: #4ade80;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 8px;
  letter-spacing: 1px;
}

.hub-card-body {
  padding: 14px 16px 16px;
}
.hub-card-name {
  font-family: var(--font-title), serif;
  font-size: 15px;
  color: var(--white-main);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hub-card-genre {
  font-size: 11px;
  color: var(--gold-dim);
  letter-spacing: 1px;
  margin-bottom: 10px;
}
.hub-card-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-bottom: 12px;
}
.hub-card-stat {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--white-dim);
}
.hub-card-stat-icon { font-size: 12px; }

.hub-card-actions {
  display: flex;
  gap: 6px;
}
.hub-btn-enter {
  flex: 1;
  padding: 7px;
  background: linear-gradient(135deg, rgba(250,204,21,0.15), rgba(250,204,21,0.05));
  border: 1px solid rgba(250,204,21,0.4);
  border-radius: 7px;
  color: var(--gold);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.hub-btn-enter:hover { background: rgba(250,204,21,0.2); }
.hub-btn-copy {
  padding: 7px 10px;
  background: var(--bg-hover);
  border: 1px solid var(--border);
  border-radius: 7px;
  color: var(--white-dim);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.hub-btn-copy:hover { border-color: var(--border-hover); color: var(--white-main); }
.hub-btn-delete {
  padding: 7px 10px;
  background: rgba(248,113,113,0.05);
  border: 1px solid rgba(248,113,113,0.2);
  border-radius: 7px;
  color: #f87171;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.hub-btn-delete:hover { background: rgba(248,113,113,0.12); }

/* Empty State */
.hub-empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--white-dim);
}
.hub-empty-icon { font-size: 56px; margin-bottom: 14px; opacity: 0.3; }
.hub-empty-title {
  font-family: var(--font-title), serif;
  font-size: 16px;
  color: var(--white-main);
  margin-bottom: 8px;
}
.hub-empty-desc { font-size: 13px; line-height: 1.7; }

/* ============================
   CREATE WORLD TAB
   ============================ */
.hub-create-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  max-width: 1100px;
}
@media (max-width: 800px) {
  .hub-create-layout { grid-template-columns: 1fr; }
}

.hub-create-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 22px;
}
.hub-create-card-title {
  font-family: var(--font-title), serif;
  font-size: 12px;
  letter-spacing: 2.5px;
  color: var(--gold-dim);
  text-transform: uppercase;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Manual Create */
.hub-form-group { margin-bottom: 14px; }
.hub-form-label {
  font-size: 11px;
  color: var(--white-dim);
  letter-spacing: 1px;
  margin-bottom: 6px;
  display: block;
}
.hub-form-input, .hub-form-select {
  width: 100%;
  padding: 9px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--white-main);
  font-family: var(--font-cjk), serif;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.hub-form-input:focus, .hub-form-select:focus { border-color: rgba(250,204,21,0.4); }
.hub-form-select option { background: #13171f; }

/* AI Generator */
.hub-ai-prompt {
  width: 100%;
  padding: 10px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--white-main);
  font-family: var(--font-cjk), serif;
  font-size: 13px;
  outline: none;
  resize: none;
  min-height: 72px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}
.hub-ai-prompt:focus { border-color: rgba(192,132,252,0.5); }

.hub-ai-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 10px 0;
}
.hub-ai-example-chip {
  padding: 4px 10px;
  background: rgba(192,132,252,0.06);
  border: 1px solid rgba(192,132,252,0.2);
  border-radius: 12px;
  color: #c084fc;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}
.hub-ai-example-chip:hover { background: rgba(192,132,252,0.14); }

.hub-ai-preview {
  background: var(--bg-secondary);
  border: 1px solid rgba(192,132,252,0.25);
  border-radius: 10px;
  padding: 14px;
  margin-top: 12px;
  font-size: 12px;
  line-height: 1.8;
  color: var(--white-dim);
  min-height: 80px;
  max-height: 220px;
  overflow-y: auto;
}
.hub-ai-preview-title {
  font-family: var(--font-title), serif;
  font-size: 14px;
  color: #c084fc;
  margin-bottom: 8px;
}
.hub-ai-preview-row {
  display: flex;
  gap: 6px;
  margin-bottom: 4px;
}
.hub-ai-preview-key {
  color: var(--gold-dim);
  min-width: 90px;
  font-size: 11px;
  letter-spacing: 0.5px;
}
.hub-ai-preview-val { color: var(--white-main); font-size: 12px; }
.hub-ai-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #c084fc;
  font-size: 12px;
  padding: 20px;
}
.hub-ai-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(192,132,252,0.2);
  border-top-color: #c084fc;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Templates Grid */
.hub-templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}
.hub-tmpl-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}
.hub-tmpl-card:hover { border-color: var(--border-hover); transform: translateY(-1px); }
.hub-tmpl-card.selected {
  background: rgba(250,204,21,0.06);
  border-color: rgba(250,204,21,0.4);
}
.hub-tmpl-icon { font-size: 32px; margin-bottom: 8px; }
.hub-tmpl-name {
  font-family: var(--font-title), serif;
  font-size: 12px;
  color: var(--white-main);
  margin-bottom: 4px;
}
.hub-tmpl-desc { font-size: 10px; color: var(--white-dim); line-height: 1.5; }

/* Buttons */
.hub-btn-primary {
  padding: 10px 22px;
  background: linear-gradient(135deg, rgba(250,204,21,0.18), rgba(250,204,21,0.06));
  border: 1px solid rgba(250,204,21,0.5);
  border-radius: 8px;
  color: var(--gold);
  font-family: var(--font-title), serif;
  font-size: 13px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  margin-top: 6px;
}
.hub-btn-primary:hover { background: rgba(250,204,21,0.22); }
.hub-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.hub-btn-secondary {
  padding: 8px 16px;
  background: var(--bg-hover);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--white-dim);
  font-family: var(--font-cjk), serif;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.hub-btn-secondary:hover { border-color: var(--border-hover); color: var(--white-main); }

.hub-btn-ai {
  padding: 9px 16px;
  background: rgba(192,132,252,0.08);
  border: 1px solid rgba(192,132,252,0.3);
  border-radius: 8px;
  color: #c084fc;
  font-family: var(--font-cjk), serif;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  margin-top: 8px;
}
.hub-btn-ai:hover { background: rgba(192,132,252,0.14); }
.hub-btn-ai:disabled { opacity: 0.4; cursor: not-allowed; }
.hub-btn-ai-create {
  padding: 10px 22px;
  background: linear-gradient(135deg, rgba(192,132,252,0.15), rgba(192,132,252,0.05));
  border: 1px solid rgba(192,132,252,0.5);
  border-radius: 8px;
  color: #c084fc;
  font-family: var(--font-title), serif;
  font-size: 13px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  margin-top: 8px;
}
.hub-btn-ai-create:hover { background: rgba(192,132,252,0.2); }
.hub-btn-ai-create:disabled { opacity: 0.4; cursor: not-allowed; }

/* Genre banner colors */
.hub-banner-cultivation { background: linear-gradient(135deg, #0f1a2e, #1a0a2e); }
.hub-banner-fantasy     { background: linear-gradient(135deg, #0a1a0f, #1a1005); }
.hub-banner-zombie      { background: linear-gradient(135deg, #1a0a0a, #0f1a0f); }
.hub-banner-mythology   { background: linear-gradient(135deg, #1a150a, #0a0f1a); }
.hub-banner-scifi       { background: linear-gradient(135deg, #0a0f1a, #0a1a1a); }
.hub-banner-default     { background: linear-gradient(135deg, #0f1018, #13171f); }

/* Stats row at top */
.hub-stats-row {
  display: flex;
  gap: 14px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.hub-stat-chip {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 12px;
}
.hub-stat-chip-icon { font-size: 14px; }
.hub-stat-chip-val {
  font-family: var(--font-title), serif;
  font-size: 14px;
  color: var(--gold);
}
.hub-stat-chip-label { font-size: 10px; color: var(--white-dim); letter-spacing: 0.5px; }

/* Import/Export row */
.hub-action-row {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

/* AIGEN result tags */
.hub-ai-tag {
  display: inline-block;
  padding: 2px 7px;
  background: rgba(192,132,252,0.1);
  border: 1px solid rgba(192,132,252,0.25);
  border-radius: 8px;
  color: #c084fc;
  font-size: 10px;
  margin: 2px;
}
`;
  document.head.appendChild(style);
}

// ============================
// DOM INJECTION
// ============================
function injectWorldHubDOM() {
  if (document.getElementById("worldHubOverlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "worldHubOverlay";
  overlay.className = "hidden";
  overlay.innerHTML = `
    <!-- TOP BAR -->
    <div class="hub-topbar">
      <div class="hub-logo" onclick="closeWorldHub()">
        <div class="hub-logo-symbol">☯</div>
        <div>
          <div class="hub-logo-text">THẦN SÁNG TẠO</div>
          <div class="hub-logo-sub">CREATOR GOD V6</div>
        </div>
      </div>
      <div class="hub-tabs">
        <button class="hub-tab active" id="hubTab-my-worlds" onclick="hubSwitchTab('my-worlds')">🌐 Thế Giới Của Tôi</button>
        <button class="hub-tab" id="hubTab-create" onclick="hubSwitchTab('create')">✨ Tạo Thế Giới</button>
        <button class="hub-tab" id="hubTab-templates" onclick="hubSwitchTab('templates')">📚 Thế Giới Mẫu</button>
      </div>
      <div class="hub-spacer"></div>
      <div class="hub-world-count" id="hubWorldCount">0 thế giới</div>
      <button class="hub-enter-btn" onclick="hubEnterLastWorld()">⚡ Vào Thế Giới Hiện Tại</button>
    </div>

    <!-- BODY -->
    <div class="hub-body" id="hubBody">
      <!-- Tab content injected here -->
    </div>
  `;
  document.body.appendChild(overlay);
}

// ============================
// OPEN / CLOSE
// ============================
function openWorldHub() {
  // Always reload from localStorage so list is fresh
  try {
    const raw = localStorage.getItem("cgv6_worlds");
    if (raw && typeof worlds !== "undefined") {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Merge: keep in-memory worlds too
        parsed.forEach(function(w) {
          if (!worlds.find(function(x){ return x.id === w.id; })) {
            worlds.push(w);
          }
        });
      }
    }
  } catch(e) {}

  injectWorldHubCSS();
  injectWorldHubDOM();
  const overlay = document.getElementById("worldHubOverlay");
  if (overlay) overlay.classList.remove("hidden");
  _hubVisible = true;
  _hubCurrentTab = "my-worlds";
  hubSwitchTab("my-worlds");
  hubUpdateWorldCount();
}

function closeWorldHub() {
  const el = document.getElementById("worldHubOverlay");
  if (el) el.classList.add("hidden");
  _hubVisible = false;
  // Reveal the main game layout
  const app = document.getElementById("appLayout");
  if (app) app.style.visibility = "visible";
}

// ============================
// TABS
// ============================
function hubSwitchTab(tab) {
  _hubCurrentTab = tab;
  document.querySelectorAll(".hub-tab").forEach(t => t.classList.remove("active"));
  const btn = document.getElementById(`hubTab-${tab}`);
  if (btn) btn.classList.add("active");
  const body = document.getElementById("hubBody");
  if (!body) return;
  if (tab === "my-worlds") body.innerHTML = hubRenderMyWorlds();
  if (tab === "create")    body.innerHTML = hubRenderCreate();
  if (tab === "templates") body.innerHTML = hubRenderTemplates();
}

function hubUpdateWorldCount() {
  const el = document.getElementById("hubWorldCount");
  if (!el) return;
  const count = (typeof worlds !== "undefined") ? worlds.length : 0;
  el.textContent = `${count} thế giới`;
}

// ============================
// TAB: MY WORLDS
// ============================
function hubRenderMyWorlds() {
  const allWorlds = (typeof worlds !== "undefined") ? worlds : [];
  const activeId = (typeof currentWorldId !== "undefined") ? currentWorldId : null;

  const filtered = _hubSearchQuery
    ? allWorlds.filter(w =>
        (w.name||"").toLowerCase().includes(_hubSearchQuery.toLowerCase()) ||
        (w.template||"").toLowerCase().includes(_hubSearchQuery.toLowerCase())
      )
    : allWorlds;

  const GENRE_ICONS = {
    cultivation: "☯", fantasy: "🧙", zombie: "🧟",
    mythology: "⚡", scifi: "🚀", default: "🌍"
  };

  // Stats row
  const totalNPCs = allWorlds.reduce((s, w) => s + (w.npcs ? w.npcs.length : 0), 0);
  const activeWorld = allWorlds.find(w => w.id === activeId);
  const activeYear = activeWorld ? (activeWorld.year || 1) : 0;

  // Debug: force reload if worlds still empty
  if (allWorlds.length === 0) {
    try {
      const raw = localStorage.getItem("cgv6_worlds");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (typeof worlds !== "undefined") {
            worlds.length = 0;
            parsed.forEach(function(w){ worlds.push(w); });
          }
        }
      }
    } catch(e) {}
  }
  const allWorlds2 = (typeof worlds !== "undefined") ? worlds : [];

  let statsHtml = `
    <div class="hub-stats-row">
      <div class="hub-stat-chip">
        <span class="hub-stat-chip-icon">🌐</span>
        <span class="hub-stat-chip-val">${allWorlds2.length}</span>
        <span class="hub-stat-chip-label">Thế Giới</span>
      </div>
      <div class="hub-stat-chip">
        <span class="hub-stat-chip-icon">👥</span>
        <span class="hub-stat-chip-val">${totalNPCs}</span>
        <span class="hub-stat-chip-label">Tu Sĩ Tổng</span>
      </div>
      ${activeWorld ? `<div class="hub-stat-chip">
        <span class="hub-stat-chip-icon">📅</span>
        <span class="hub-stat-chip-val">Năm ${activeYear}</span>
        <span class="hub-stat-chip-label">Năm Hiện Tại</span>
      </div>` : ""}
    </div>
  `;

  let actionRow = `
    <div class="hub-action-row">
      <button class="hub-btn-secondary" onclick="hubSwitchTab('create')">✨ Tạo Thế Giới Mới</button>
      <button class="hub-btn-secondary" onclick="document.getElementById('hubImportInput').click()">📥 Nhập</button>
      <button class="hub-btn-secondary" onclick="hubExportAll()">📤 Xuất Tất Cả</button>
      <input id="hubImportInput" type="file" accept=".json" style="display:none" onchange="hubImportWorld(this.files[0]);this.value=''">
    </div>
  `;

  let searchBar = `
    <div class="hub-search-bar">
      <input class="hub-search-input" placeholder="🔍 Tìm kiếm thế giới..." 
        value="${_hubSearchQuery}"
        oninput="_hubSearchQuery=this.value;document.getElementById('hubWorldGrid').innerHTML=hubRenderWorldCards()">
    </div>
  `;

  let sectionTitle = `<div class="hub-section-title">Danh Sách Thế Giới</div>`;

  // Use fresh allWorlds2 for cards
  const filtered2 = _hubSearchQuery
    ? allWorlds2.filter(function(w){
        return (w.name||"").toLowerCase().includes(_hubSearchQuery.toLowerCase()) ||
               (w.template||"").toLowerCase().includes(_hubSearchQuery.toLowerCase());
      })
    : allWorlds2;
  const activeId2 = (typeof currentWorldId !== "undefined") ? currentWorldId : null;
  const GENRE_ICONS2 = { cultivation:"☯", fantasy:"🧙", zombie:"🧟", mythology:"⚡", scifi:"🚀", default:"🌍" };

  let cardsHtml = `<div id="hubWorldGrid">${hubRenderWorldCards(filtered2, activeId2, GENRE_ICONS2)}</div>`;

  return statsHtml + actionRow + searchBar + sectionTitle + cardsHtml;
}

function hubRenderWorldCards(filtered, activeId, GENRE_ICONS) {
  if (!filtered) {
    const allWorlds = (typeof worlds !== "undefined") ? worlds : [];
    activeId = (typeof currentWorldId !== "undefined") ? currentWorldId : null;
    GENRE_ICONS = { cultivation:"☯", fantasy:"🧙", zombie:"🧟", mythology:"⚡", scifi:"🚀", default:"🌍" };
    filtered = _hubSearchQuery
      ? allWorlds.filter(w =>
          (w.name||"").toLowerCase().includes(_hubSearchQuery.toLowerCase()) ||
          (w.template||"").toLowerCase().includes(_hubSearchQuery.toLowerCase())
        )
      : allWorlds;
  }

  if (filtered.length === 0) {
    return `<div class="hub-empty">
      <div class="hub-empty-icon">🌌</div>
      <div class="hub-empty-title">Hư Không Chưa Có Gì</div>
      <div class="hub-empty-desc">
        ${_hubSearchQuery
          ? `Không tìm thấy thế giới nào phù hợp với "<strong>${_hubSearchQuery}</strong>"`
          : `Chưa có thế giới nào.<br>Hãy <strong>Tạo Thế Giới</strong> để bắt đầu hành trình.`
        }
      </div>
    </div>`;
  }

  return `<div class="hub-world-grid">${filtered.map(w => {
    const tmpl = w.template || "default";
    const icon = GENRE_ICONS[tmpl] || GENRE_ICONS.default;
    const isActive = w.id === activeId;
    const aliveNPCs = w.npcs ? w.npcs.filter(n => n.status === "alive").length : 0;
    const savedDate = w.savedAt ? new Date(w.savedAt).toLocaleDateString("vi-VN") : "—";
    return `<div class="hub-world-card" onclick="hubEnterWorld('${w.id}')">
      <div class="hub-card-banner hub-banner-${tmpl}">
        <div class="hub-card-genre-icon">${icon}</div>
        ${isActive ? `<div class="hub-card-active-badge">● Đang Hoạt Động</div>` : ""}
      </div>
      <div class="hub-card-body">
        <div class="hub-card-name">${w.name || "Vô Danh"}</div>
        <div class="hub-card-genre">${_getGenreLabel(tmpl)}</div>
        <div class="hub-card-stats">
          <div class="hub-card-stat"><span class="hub-card-stat-icon">👥</span>${aliveNPCs} tu sĩ</div>
          <div class="hub-card-stat"><span class="hub-card-stat-icon">📅</span>Năm ${w.year || 1}</div>
          <div class="hub-card-stat"><span class="hub-card-stat-icon">🏯</span>${(w.sects||[]).length} tông</div>
          <div class="hub-card-stat"><span class="hub-card-stat-icon">💾</span>${savedDate}</div>
        </div>
        <div class="hub-card-actions" onclick="event.stopPropagation()">
          <button class="hub-btn-enter" onclick="hubEnterWorld('${w.id}')">⚡ Vào</button>
          <button class="hub-btn-copy" onclick="hubCopyWorld('${w.id}')" title="Sao chép">📋</button>
          <button class="hub-btn-delete" onclick="hubDeleteWorld('${w.id}')" title="Xóa">🗑</button>
        </div>
      </div>
    </div>`;
  }).join("")}</div>`;
}

function _getGenreLabel(tmpl) {
  const LABELS = {
    cultivation: "☯ Tu Tiên", fantasy: "🧙 Huyền Huyễn",
    zombie: "🧟 Zombie", mythology: "⚡ Thần Thoại", scifi: "🚀 Sci-Fi"
  };
  return LABELS[tmpl] || "🌍 Tổng Hợp";
}

// ============================
// TAB: CREATE WORLD
// ============================
function hubRenderCreate() {
  return `<div class="hub-create-layout">

    <!-- LEFT: Manual + Template Select -->
    <div>
      <div class="hub-create-card" style="margin-bottom:20px">
        <div class="hub-create-card-title">🛠 Tạo Thủ Công</div>
        <div class="hub-form-group">
          <label class="hub-form-label">TÊN THẾ GIỚI</label>
          <input class="hub-form-input" id="hubManualName" placeholder="Nhập tên thế giới..." maxlength="50">
        </div>
        <div class="hub-form-group">
          <label class="hub-form-label">THỂ LOẠI</label>
          <select class="hub-form-select" id="hubManualTemplate" onchange="_selectedTemplate=this.value">
            <option value="cultivation">☯ Tu Tiên</option>
            <option value="fantasy">🧙 Huyền Huyễn</option>
            <option value="zombie">🧟 Zombie</option>
            <option value="mythology">⚡ Thần Thoại</option>
            <option value="scifi">🚀 Sci-Fi</option>
          </select>
        </div>
        <div class="hub-form-group">
          <label class="hub-form-label">MÃ HẠT GIỐNG (tùy chọn)</label>
          <input class="hub-form-input" id="hubManualSeed" placeholder="Để trống = ngẫu nhiên" type="number">
        </div>
        <div class="hub-form-group">
          <label class="hub-form-label">🌱 DÂN SỐ BAN ĐẦU</label>
          <select class="hub-form-select" id="hubInitialPop">
            <option value="0">✨ Hư Không — Thế giới trống (0 NPC)</option>
            <option value="10">🌱 Khai Nguyên — 10 tu sĩ tiên phong</option>
            <option value="20">🌿 Thảo Nguyên — 20 tu sĩ</option>
            <option value="50" selected>🌳 Thịnh Vượng — 50 tu sĩ (Mặc định)</option>
            <option value="100">🌟 Đại Thế — 100 tu sĩ</option>
          </select>
          <div style="font-size:11px;color:#64748b;margin-top:4px">💡 Thiên Đình cứu trợ dân số là <b>tùy chọn thủ công</b>. Thế giới có thể tự nhiên tuyệt chủng.</div>
        </div>
        <button class="hub-btn-primary" onclick="hubCreateManual()">⚡ Khai Sinh Thế Giới</button>
      </div>

      <!-- Template Selector mini -->
      <div class="hub-create-card">
        <div class="hub-create-card-title">📚 Chọn Thể Loại</div>
        <div class="hub-templates-grid" id="hubTmplSelector">
          ${_renderTmplSelector()}
        </div>
      </div>
    </div>

    <!-- RIGHT: AI Generator -->
    <div>
      <div class="hub-create-card">
        <div class="hub-create-card-title">🤖 Trình Tạo Thế Giới AI</div>
        <div class="hub-form-group">
          <label class="hub-form-label">MÔ TẢ THẾ GIỚI CỦA BẠN</label>
          <textarea class="hub-ai-prompt" id="hubAiPrompt"
            placeholder="Ví dụ: Thế giới tu luyện hắc ám nơi cái ác thống trị, kẻ mạnh là thiên địa…"
            onchange="_aiPrompt=this.value"></textarea>
        </div>

        <div class="hub-ai-examples">
          ${[
            "Thế giới Tu luyện Hắc ám",
            "Trái đất Ngày tận thế Zombie",
            "Vương quốc Rồng Fantasy",
            "Đế chế Cyberpunk Sci-Fi",
            "Thần Thoại Hy Lạp Cổ Đại",
            "Tu Tiên Hải Đảo Bí Ẩn"
          ].map(ex => `<span class="hub-ai-example-chip" onclick="hubSetAiPrompt('${ex}')">${ex}</span>`).join("")}
        </div>

        <button class="hub-btn-ai" id="hubAiPreviewBtn" onclick="hubAiPreview()">
          🔮 Tạo Bản Xem Trước
        </button>

        <div id="hubAiPreviewBox" class="hub-ai-preview" style="display:none"></div>

        <button class="hub-btn-ai-create" id="hubAiCreateBtn" onclick="hubAiCreate()" style="display:none">
          ✨ Tạo Thế Giới Từ AI
        </button>
      </div>
    </div>

  </div>`;
}

function _renderTmplSelector() {
  const templates = [
    { key: "cultivation", icon: "☯", name: "Tu Tiên",     desc: "Luyện khí thành tiên" },
    { key: "fantasy",     icon: "🧙", name: "Huyền Huyễn", desc: "Phép thuật & rồng" },
    { key: "zombie",      icon: "🧟", name: "Zombie",       desc: "Sinh tồn hậu tận thế" },
    { key: "mythology",   icon: "⚡", name: "Thần Thoại",   desc: "Thiên thần & ác quỷ" },
    { key: "scifi",       icon: "🚀", name: "Sci-Fi",       desc: "Chiến tranh thiên hà" },
  ];
  return templates.map(t => `
    <div class="hub-tmpl-card ${_selectedTemplate === t.key ? 'selected' : ''}"
         onclick="hubSelectTmpl('${t.key}')">
      <div class="hub-tmpl-icon">${t.icon}</div>
      <div class="hub-tmpl-name">${t.name}</div>
      <div class="hub-tmpl-desc">${t.desc}</div>
    </div>
  `).join("");
}

function hubSelectTmpl(key) {
  _selectedTemplate = key;
  const sel = document.getElementById("hubManualTemplate");
  if (sel) sel.value = key;
  document.querySelectorAll(".hub-tmpl-card").forEach(c => {
    c.classList.toggle("selected", c.getAttribute("onclick")?.includes(`'${key}'`));
  });
}

// ============================
// TAB: TEMPLATES
// ============================
function hubRenderTemplates() {
  const TEMPLATES = [
    {
      key: "cultivation", icon: "☯", name: "Tu Tiên Truyền Thống",
      genre: "Tu Tiên", difficulty: "⭐⭐⭐",
      desc: "Thế giới tu tiên cổ điển với 9 cảnh giới, tông môn tranh bá, linh thú và boss mạnh mẽ.",
      features: ["9 cảnh giới tu luyện", "5 tông môn lớn", "4 vùng lãnh thổ", "Hệ thống gia tộc"]
    },
    {
      key: "fantasy", icon: "🧙", name: "Vương Quốc Huyền Huyễn",
      genre: "Fantasy", difficulty: "⭐⭐",
      desc: "Phép thuật và kiếm sĩ, rồng lửa và elf, những vương quốc cổ đại tranh giành ngôi báu.",
      features: ["5 cấp độ ma pháp", "Rồng boss", "Vương quốc phân tranh", "Quý tộc gia tộc"]
    },
    {
      key: "zombie", icon: "🧟", name: "Hậu Tận Thế Zombie",
      genre: "Zombie / Sinh Tồn", difficulty: "⭐⭐⭐⭐",
      desc: "Dịch bệnh bùng phát, người sống sót tìm cách sinh tồn trong thế giới đổ nát.",
      features: ["Hệ thống sinh tồn", "Đột biến gene", "Căn cứ phe phái", "Boss zombie tiến hóa"]
    },
    {
      key: "mythology", icon: "⚡", name: "Thần Thoại Cổ Đại",
      genre: "Thần Thoại", difficulty: "⭐⭐⭐",
      desc: "Thiên thần và ác quỷ tranh đoạt vận mệnh nhân gian, các vị thần can thiệp trực tiếp.",
      features: ["Hệ thống thần quyền", "Thiên mệnh & lời tiên tri", "Chiến tranh thiên giới", "Phàm nhân thành thần"]
    },
    {
      key: "scifi", icon: "🚀", name: "Đế Chế Vũ Trụ",
      genre: "Khoa Học Viễn Tưởng", difficulty: "⭐⭐⭐⭐",
      desc: "Các nền văn minh tiên tiến chinh phục thiên hà, công nghệ AI và vũ khí năng lượng.",
      features: ["Công nghệ 5 thế hệ", "Các hành tinh thuộc địa", "AI chiến đấu", "Vũ khí năng lượng"]
    },
  ];

  return `
    <div class="hub-section-title">Thế Giới Mẫu — Chọn Để Khai Sinh Ngay</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:18px">
      ${TEMPLATES.map(t => `
        <div class="hub-create-card" style="cursor:pointer;transition:all 0.25s"
             onmouseover="this.style.borderColor='rgba(250,204,21,0.35)'"
             onmouseout="this.style.borderColor=''"
             onclick="hubCreateFromTemplate('${t.key}','${t.name}')">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
            <div style="font-size:36px">${t.icon}</div>
            <div>
              <div style="font-family:var(--font-title),serif;font-size:14px;color:var(--white-main)">${t.name}</div>
              <div style="font-size:11px;color:var(--gold-dim);margin-top:2px">${t.genre}</div>
            </div>
            <div style="margin-left:auto;font-size:11px;color:var(--white-dim)">${t.difficulty}</div>
          </div>
          <div style="font-size:12px;color:var(--white-dim);line-height:1.7;margin-bottom:12px">${t.desc}</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px">
            ${t.features.map(f => `<span class="hub-ai-tag">${f}</span>`).join("")}
          </div>
          <button class="hub-btn-primary" onclick="event.stopPropagation();hubCreateFromTemplate('${t.key}','${t.name}')">
            ⚡ Khai Sinh Thế Giới Này
          </button>
        </div>
      `).join("")}
    </div>
  `;
}

// ============================
// ACTIONS — WORLD MANAGEMENT
// ============================

function hubEnterWorld(worldId) {
  // Use existing switchWorld if available
  if (typeof switchWorld === "function") {
    switchWorld(worldId);
    closeWorldHub();
    return;
  }
  // Fallback: manual restore
  if (typeof saveWorlds === "function") saveWorlds();
  if (typeof worlds !== "undefined") {
    const snap = worlds.find(w => w.id === worldId);
    if (snap) {
      if (typeof restoreWorldSnapshot === "function") restoreWorldSnapshot(snap);
      if (typeof currentWorldId !== "undefined") currentWorldId = worldId;
      if (typeof renderAll === "function") renderAll();
    }
  }
  closeWorldHub();
}

function hubEnterLastWorld() {
  if (typeof currentWorldId !== "undefined" && currentWorldId) {
    closeWorldHub();
    return;
  }
  if (typeof worlds !== "undefined" && worlds.length) {
    hubEnterWorld(worlds[0].id);
  } else {
    hubSwitchTab("create");
  }
}

function hubCreateManual() {
  const nameEl    = document.getElementById("hubManualName");
  const tmplEl    = document.getElementById("hubManualTemplate");
  const popEl     = document.getElementById("hubInitialPop");
  const name      = nameEl ? nameEl.value.trim() : "";
  const tmpl      = tmplEl ? tmplEl.value : _selectedTemplate;
  const initPop   = popEl  ? parseInt(popEl.value) || 0 : 0;

  if (!name) {
    alert("Vui lòng nhập tên thế giới!");
    if (nameEl) nameEl.focus();
    return;
  }

  _doCreateWorld(name, tmpl, initPop);
  // Re-open hub after delay to allow world creation + save to finish
  setTimeout(function() { openWorldHub(); }, 500);
}

function hubCreateFromTemplate(tmplKey, tmplName) {
  const worldName = tmplName + " " + (typeof worlds !== "undefined" ? worlds.length + 1 : 1);
  _doCreateWorld(worldName, tmplKey, 0);  // Template creates empty world by default
  setTimeout(function() { openWorldHub(); }, 500);
}

function _doCreateWorld(name, tmplKey, initPop) {
  initPop = (typeof initPop === "number" && initPop >= 0) ? initPop : 0;
  // Reuse createNewWorldFromManager() from multiWorldSystem — it already works correctly.
  // We just inject the name/template/initPop into its expected input fields and call it.

  if (typeof createNewWorldFromManager === "function") {
    // Ensure the mwNewName/mwNewTemplate inputs exist (inject them if not)
    let mwName = document.getElementById("mwNewName");
    let mwTmpl = document.getElementById("mwNewTemplate");
    let mwPop  = document.getElementById("mwInitialPop");

    if (!mwName) {
      mwName = document.createElement("input");
      mwName.id = "mwNewName";
      mwName.style.display = "none";
      document.body.appendChild(mwName);
    }
    if (!mwTmpl) {
      mwTmpl = document.createElement("select");
      mwTmpl.id = "mwNewTemplate";
      mwTmpl.style.display = "none";
      ["cultivation","fantasy","zombie","mythology","scifi"].forEach(function(k) {
        var o = document.createElement("option");
        o.value = k; o.textContent = k;
        mwTmpl.appendChild(o);
      });
      document.body.appendChild(mwTmpl);
    }
    if (!mwPop) {
      mwPop = document.createElement("input");
      mwPop.id = "mwInitialPop";
      mwPop.type = "number";
      mwPop.style.display = "none";
      document.body.appendChild(mwPop);
    }

    mwName.value = name;
    mwTmpl.value = tmplKey;
    mwPop.value  = initPop;
    createNewWorldFromManager();
    return;
  }

  // Fallback: use patched createWorld()
  const GENRE_MAP = { cultivation: "Tu Tiên", fantasy: "Huyền Huyễn", zombie: "Zombie", mythology: "Thần Thoại", scifi: "Sci-Fi" };
  if (typeof createWorld !== "function") return;
  const nameEl = document.getElementById("worldName");
  const genreEl = document.getElementById("genre");
  const tmplEl  = document.getElementById("worldTemplateKey");
  if (nameEl)  nameEl.value  = name;
  if (tmplEl)  tmplEl.value  = tmplKey;
  if (genreEl) genreEl.value = GENRE_MAP[tmplKey] || "Tổng Hợp";
  createWorld();
  if (typeof world !== "undefined" && world) {
    world.name = name; world.templateKey = tmplKey;
    world.genre = GENRE_MAP[tmplKey] || "Tổng Hợp";
  }
  if (typeof saveWorlds === "function") saveWorlds();
  // Spawn initial population
  if (initPop > 0 && typeof generateNPCs === "function") {
    const cntEl = document.getElementById("npcCount");
    if (cntEl) cntEl.value = initPop;
    generateNPCs();
  }
}

function hubDeleteWorld(worldId) {
  if (!confirm("Bạn có chắc muốn xóa thế giới này?\nHành động này không thể hoàn tác!")) return;
  if (typeof worlds === "undefined") return;

  const idx = worlds.findIndex(w => w.id === worldId);
  if (idx === -1) return;
  worlds.splice(idx, 1);

  // If deleted current world, switch to another
  if ((typeof currentWorldId !== "undefined") && currentWorldId === worldId) {
    if (worlds.length) {
      if (typeof restoreWorldSnapshot === "function") restoreWorldSnapshot(worlds[0]);
      currentWorldId = worlds[0].id;
    } else {
      currentWorldId = null;
      if (typeof world !== "undefined") world = null;
    }
  }
  if (typeof saveWorlds === "function") saveWorlds();

  hubUpdateWorldCount();
  hubSwitchTab("my-worlds");
  if (typeof toast === "function") toast("🗑 Đã xóa thế giới.", 2000);
}

function hubCopyWorld(worldId) {
  if (typeof worlds === "undefined") return;
  const src = worlds.find(w => w.id === worldId);
  if (!src) return;

  const copy = JSON.parse(JSON.stringify(src));
  copy.id = "world_" + Date.now() + "_copy";
  copy.name = (src.name || "Vô Danh") + " (Bản Sao)";
  copy.savedAt = Date.now();
  worlds.push(copy);

  if (typeof saveWorlds === "function") saveWorlds();
  hubUpdateWorldCount();
  hubSwitchTab("my-worlds");
  if (typeof toast === "function") toast("📋 Đã sao chép thế giới!", 2000);
}

function hubExportAll() {
  if (typeof worlds === "undefined" || !worlds.length) {
    alert("Không có thế giới nào để xuất.");
    return;
  }
  const data = JSON.stringify({ version: 6, worlds, exportedAt: Date.now() }, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `creator_god_v6_worlds_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  if (typeof toast === "function") toast("📤 Đã xuất tất cả thế giới!", 2000);
}

function hubImportWorld(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.worlds && Array.isArray(data.worlds)) {
        data.worlds.forEach(w => {
          w.id = "world_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
          if (typeof worlds !== "undefined") worlds.push(w);
        });
        if (typeof saveWorlds === "function") saveWorlds();
        hubUpdateWorldCount();
        hubSwitchTab("my-worlds");
        if (typeof toast === "function") toast(`📥 Đã nhập ${data.worlds.length} thế giới!`, 2500);
      } else {
        alert("File không hợp lệ. Cần file JSON xuất từ Creator God V6.");
      }
    } catch {
      alert("Lỗi đọc file. Hãy kiểm tra định dạng JSON.");
    }
  };
  reader.readAsText(file);
}

// ============================
// AI WORLD GENERATOR
// ============================
function hubSetAiPrompt(prompt) {
  _aiPrompt = prompt;
  const el = document.getElementById("hubAiPrompt");
  if (el) el.value = prompt;
}

async function hubAiPreview() {
  const promptEl = document.getElementById("hubAiPrompt");
  const prompt = (promptEl ? promptEl.value.trim() : _aiPrompt.trim());

  if (!prompt) {
    alert("Vui lòng nhập mô tả thế giới!");
    return;
  }

  _aiPreviewLoading = true;
  const previewBox = document.getElementById("hubAiPreviewBox");
  const previewBtn = document.getElementById("hubAiPreviewBtn");
  const createBtn  = document.getElementById("hubAiCreateBtn");
  if (previewBox) {
    previewBox.style.display = "block";
    previewBox.innerHTML = `<div class="hub-ai-loading"><div class="hub-ai-spinner"></div>AI đang tạo thế giới...</div>`;
  }
  if (previewBtn) previewBtn.disabled = true;
  if (createBtn)  createBtn.style.display = "none";

  try {
    const sysPrompt = `Bạn là trình tạo thế giới AI cho game Creator God V6. Người dùng mô tả một thế giới. Hãy tạo metadata cho thế giới đó.
Trả lời CHÍNH XÁC theo định dạng JSON sau, KHÔNG có markdown, KHÔNG có text khác:
{
  "name": "Tên thế giới (sáng tạo, 3-6 chữ)",
  "genre": "Thể loại bằng tiếng Việt",
  "template": "cultivation|fantasy|zombie|mythology|scifi (chọn cái phù hợp nhất)",
  "era": "Tên kỷ nguyên khởi đầu",
  "lore": "Truyền thuyết ngắn về thế giới (2-3 câu)",
  "factions": ["Tên phe 1", "Tên phe 2", "Tên phe 3"],
  "regions": ["Vùng 1", "Vùng 2", "Vùng 3"],
  "bossBoss": "Tên trùm cuối chính",
  "secretRealm": "Cõi bí mật đặc trưng",
  "uniqueMechanic": "Cơ chế độc đáo của thế giới này"
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: sysPrompt,
        messages: [{ role: "user", content: `Tạo thế giới: ${prompt}` }]
      })
    });

    const data = await response.json();
    const text = data.content?.map(c => c.text || "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    _aiPreviewData = JSON.parse(clean);

    if (previewBox) {
      previewBox.innerHTML = `
        <div class="hub-ai-preview-title">${_aiPreviewData.name || "Thế Giới Mới"}</div>
        ${[
          ["Thể Loại",     _aiPreviewData.genre],
          ["Kỷ Nguyên",    _aiPreviewData.era],
          ["Trùm Cuối",    _aiPreviewData.bossBoss],
          ["Cõi Bí Mật",   _aiPreviewData.secretRealm],
          ["Cơ Chế",       _aiPreviewData.uniqueMechanic],
        ].map(([k, v]) => v ? `<div class="hub-ai-preview-row">
          <div class="hub-ai-preview-key">${k}</div>
          <div class="hub-ai-preview-val">${v}</div>
        </div>` : "").join("")}
        <div style="margin-top:10px">
          <div style="font-size:10px;color:var(--gold-dim);letter-spacing:1px;margin-bottom:6px">PHE PHÁI</div>
          ${(_aiPreviewData.factions || []).map(f => `<span class="hub-ai-tag">${f}</span>`).join("")}
        </div>
        <div style="margin-top:8px">
          <div style="font-size:10px;color:var(--gold-dim);letter-spacing:1px;margin-bottom:6px">VÙNG ĐẤT</div>
          ${(_aiPreviewData.regions || []).map(r => `<span class="hub-ai-tag">🗺 ${r}</span>`).join("")}
        </div>
        <div style="margin-top:10px;font-size:11px;color:var(--white-dim);font-style:italic;line-height:1.7">
          📜 ${_aiPreviewData.lore || ""}
        </div>
      `;
    }
    if (createBtn) createBtn.style.display = "block";

  } catch(err) {
    console.error("AI Preview error:", err);
    if (previewBox) {
      previewBox.innerHTML = `<div style="color:var(--red);font-size:12px">⚠️ Lỗi tạo bản xem trước: ${err.message}<br>Hãy thử lại hoặc dùng tạo thủ công.</div>`;
    }
  } finally {
    _aiPreviewLoading = false;
    if (previewBtn) previewBtn.disabled = false;
  }
}

async function hubAiCreate() {
  if (!_aiPreviewData) {
    await hubAiPreview();
    if (!_aiPreviewData) return;
  }

  const tmpl = _aiPreviewData.template || "cultivation";
  const name = _aiPreviewData.name || "Thế Giới Mới";

  _doCreateWorld(name, tmpl);

  // Inject AI lore into world after creation
  if (typeof world !== "undefined" && world && _aiPreviewData) {
    world.aiLore = _aiPreviewData.lore || "";
    world.aiEra  = _aiPreviewData.era || "";
    world.aiFactions = _aiPreviewData.factions || [];
    world.aiRegions  = _aiPreviewData.regions  || [];
    world.uniqueMechanic = _aiPreviewData.uniqueMechanic || "";

    // Add lore to timeline
    if (typeof addTimeline === "function" && _aiPreviewData.lore) {
      addTimeline(`📜 ${_aiPreviewData.lore}`, "legend", "📜");
    }
    if (typeof addLog === "function" && _aiPreviewData.uniqueMechanic) {
      addLog(`⚙️ Cơ chế đặc biệt: ${_aiPreviewData.uniqueMechanic}`, "event");
    }
    if (typeof save === "function") save();
    if (typeof saveWorlds === "function") saveWorlds();
  }

  _aiPreviewData = null;
  closeWorldHub();

  if (typeof toast === "function") toast(`✨ Thế giới "${name}" đã được tạo bởi AI!`, 3000);
}

// ============================
// INJECT BUTTON INTO SIDEBAR
// ============================
function injectHubButtonIntoSidebar() {
  if (document.getElementById("worldHubNavBtn")) return;

  const nav = document.querySelector(".sidebar-nav");
  if (!nav) return;

  const btn = document.createElement("button");
  btn.id = "worldHubNavBtn";
  btn.className = "nav-btn ec-hidden";
  btn.style.cssText = `display:none;background: linear-gradient(135deg, rgba(250,204,21,0.08), rgba(250,204,21,0.02));border-color: rgba(250,204,21,0.2);`;
  btn.innerHTML = `<span class="nav-icon">🏠</span><span>Trung Tâm Thế Giới</span>`;
  btn.onclick = openWorldHub;

  // Insert at VERY top
  nav.insertBefore(btn, nav.firstChild);

  // Also add keyboard shortcut hint
  const hint = document.createElement("div");
  hint.style.cssText = "display:none;font-size:9px;color:rgba(250,204,21,0.3);text-align:center;padding:2px 0 8px;letter-spacing:1px";
  hint.className = "ec-hidden";
  hint.textContent = "[ H ] Trung Tâm";
  nav.insertBefore(hint, btn.nextSibling);
}

// ============================
// KEYBOARD SHORTCUT
// ============================
function initHubKeyboard() {
  document.addEventListener("keydown", (e) => {
    // H to open hub (when no input focused)
    if (e.key === "h" || e.key === "H") {
      const active = document.activeElement;
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.tagName === "SELECT")) return;
      if (_hubVisible) closeWorldHub();
      else openWorldHub();
    }
    // Escape to close
    if (e.key === "Escape" && _hubVisible) closeWorldHub();
  });
}

// ============================
// INIT
// ============================
function initWorldHub() {
  injectWorldHubCSS();
  injectWorldHubDOM();
  injectHubButtonIntoSidebar();
  initHubKeyboard();
  // Sau khi inject button, gọi lại EC sidebar để ẩn/hiện đúng
  setTimeout(function() { if (typeof ecRenderDynamicSidebar === 'function') ecRenderDynamicSidebar(); }, 50);
  console.log("[WorldHub V6] Initialized — Lớp 1 & Lớp 2 sẵn sàng");
}

// Auto-init when DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWorldHub);
} else {
  // Already loaded — use setTimeout to ensure other scripts have run
  setTimeout(initWorldHub, 200);
}

// ============================
// AUTO-OPEN HUB ON PAGE LOAD
// Always open World Hub as the entry point
// ============================
function _autoOpenHubOnLoad() {
  // Wait longer to ensure multiWorldSystem.js has fully initialized
  setTimeout(function() {
    // Force reload worlds from localStorage before showing hub
    try {
      const raw = localStorage.getItem("cgv6_worlds");
      if (raw && typeof worlds !== "undefined") {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          worlds = parsed;
        }
      }
      const savedId = localStorage.getItem("cgv6_currentWorldId");
      if (savedId && typeof currentWorldId !== "undefined") {
        currentWorldId = savedId;
      }
    } catch(e) { console.warn("[WorldHub] Failed to preload worlds:", e); }

    openWorldHub();
  }, 600);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", _autoOpenHubOnLoad);
} else {
  _autoOpenHubOnLoad();
}
