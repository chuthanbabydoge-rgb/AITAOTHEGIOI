// ============================================================
// SAVE MANAGER V1
// CREATOR GOD V6 — PHASE NEXT
// Export/Import TOÀN BỘ save data thành 1 file JSON
// Mang save từ trình duyệt này sang trình duyệt khác dễ dàng
// ============================================================

const SAVE_MANAGER_VERSION = 1;

// Tất cả localStorage keys của game (tự động scan + hardcode đầy đủ)
const SAVE_ALL_KEYS = [
  // Core
  "cgv6_world", "cgv6_npcs", "cgv6_sects", "cgv6_countries",
  "cgv6_bosses", "cgv6_regions", "cgv6_realms", "cgv6_timeline",
  "cgv6_logs", "cgv6_year", "cgv6_heaven", "cgv6_hof",
  "cgv6_idctr", "cgv6_warLogs", "cgv6_activeWars",
  "cgv6_worldEvents", "cgv6_activeWorldEvent", "cgv6_worldHistory",
  "cgv6_dynasties", "cgv6_popStats", "cgv6_territories",
  // Emergent Civilization
  "cgv6_ec_unlocks", "cgv6_ec_world_state",
  // Economy
  "cgv6_economyHistory", "cgv6_econAudit", "cgv6_econMarketEvent",
  "cgv6_engCities", "cgv6_engCrises", "cgv6_engGuilds",
  "cgv6_engHistory", "cgv6_engStats", "cgv6_engTradeRoutes",
  // War Engine
  "cgv6_warEngine",
  // Religion Engine
  "cgv6_religions", "cgv6_holyWars", "cgv6_relIdCtr",
  // Age Engine
  "cgv6_ageState",
  // Hero & Legend
  "cgv6_worldLegends",
  // World Memory
  "cgv6_worldMemoryEngine",
  // NPC Reputation
  "cgv6_revengeQueue", "cgv6_deadArchive",
  // Mythology
  // Dynasty Engine
  "cgv6_dynastyEngine",
  // Living World Engine
  "cgv6_lwe_clans", "cgv6_lwe_nations", "cgv6_lwe_events", "cgv6_lwe_counters",
  // Catastrophe
  "cgv6_catastropheHistory", "cgv6_activeDisasters",
  // Creator God
  "cgv6_creatorGodHistory", "cgv6_creatorGodUnlocked",
  // Player / Quest
  "cgv6_player", "cgv6_playerQuests", "cgv6_quests", "cgv6_questLog",
  "cgv6_questIdCtr", "cgv6_emergentQuests",
  // Story
  "cgv6_worldStory", "cgv6_worldChronicle", "cgv6_storyChapters",
  "cgv6_storyBiographies", "cgv6_storyCountryHistory", "cgv6_storySectHistory",
  "cgv6_aiMemory", "cgv6_chronicleCounter", "cgv6_chainIdCounter",
  "cgv6_worldEventChains", "cgv6_consequenceBuffer", "cgv6_timelineSnaps",
  // Map / Territory
  "cgv6_mapState", "cgv6_fogGrid",
  // Population
  "cgv6_popGroups", "cgv6_popLimitState",
  // Misc
  "cgv6_thiendinh", "cgv6_eqIdCtr", "cgv6_lodConfig",
  "cgv6_currentWorldId", "cgv6_worlds",
  // Technology Engine
  "cgv6_technologyEngine",
  // V23 — Empire & Kingdom Engine
  "cgv6_kingdoms",
  "cgv6_empires",
  "cgv6_succession",
  "cgv6_noble_houses",
  "cgv6_bloodlines",
  "cgv6_rankings",
  "cgv6_historical_timeline",
];

// ============================================================
// EXPORT — đọc toàn bộ localStorage, pack thành JSON, tải xuống
// ============================================================
function saveManager_export() {
  const snapshot = {
    _version:   SAVE_MANAGER_VERSION,
    _exportedAt: new Date().toISOString(),
    _worldName: (window.world && world.name) ? world.name : "Unknown",
    _year:      window.year || 0,
    data: {}
  };

  // Đọc tất cả keys đã biết
  SAVE_ALL_KEYS.forEach(key => {
    const val = localStorage.getItem(key);
    if (val !== null) snapshot.data[key] = val; // giữ nguyên raw string
  });

  // Scan thêm bất kỳ key cgv6_ nào chưa có trong danh sách
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("cgv6_") && !snapshot.data[k]) {
      snapshot.data[k] = localStorage.getItem(k);
    }
  }

  const keyCount = Object.keys(snapshot.data).length;
  const json = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url  = URL.createObjectURL(blob);

  const a = document.createElement("a");
  const worldName = snapshot._worldName.replace(/[^a-zA-Z0-9_\-\u00C0-\u024F\u1E00-\u1EFF]/g, "_");
  a.download = `cgv6_save_${worldName}_year${snapshot._year}.json`;
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);

  if (typeof toast === "function") toast(`💾 Đã xuất save! (${keyCount} keys)`);
  if (typeof addLog === "function") addLog(`💾 Save Manager: Xuất ${keyCount} keys thành công.`, "important");
}

// ============================================================
// IMPORT — đọc file JSON, ghi vào localStorage, reload trang
// ============================================================
function saveManager_import() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";

  input.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(ev) {
      try {
        const snapshot = JSON.parse(ev.target.result);

        // Validate
        if (!snapshot.data || typeof snapshot.data !== "object") {
          alert("❌ File save không hợp lệ — thiếu trường 'data'.");
          return;
        }

        const keys = Object.keys(snapshot.data);
        if (!keys.some(k => k.startsWith("cgv6_"))) {
          alert("❌ File này không phải save của Creator God V6.");
          return;
        }

        // Xác nhận trước khi overwrite
        const worldName = snapshot._worldName || "?";
        const yr = snapshot._year || "?";
        const keyCount = keys.length;
        const confirmed = confirm(
          `⚠️ NHẬP SAVE\n\nThế giới: ${worldName}\nNăm: ${yr}\nSố keys: ${keyCount}\n\nSave hiện tại sẽ bị GHI ĐÈ hoàn toàn.\n\nTiếp tục?`
        );
        if (!confirmed) return;

        // Ghi vào localStorage
        let written = 0;
        keys.forEach(k => {
          try {
            localStorage.setItem(k, snapshot.data[k]);
            written++;
          } catch(err) {
            console.warn(`[SaveManager] Không thể ghi key ${k}:`, err);
          }
        });

        alert(`✅ Đã nhập ${written}/${keyCount} keys.\nTrang sẽ tải lại ngay bây giờ.`);
        location.reload();

      } catch(err) {
        alert("❌ Lỗi đọc file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  input.click();
}

// ============================================================
// RENDER SAVE MANAGER PANEL
// ============================================================
function renderSaveManagerPanel() {
  const panel = document.getElementById("panel-save-manager");
  if (!panel) return;

  // Đếm keys hiện có
  let savedKeys = 0;
  let totalSize = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("cgv6_")) {
      savedKeys++;
      totalSize += (localStorage.getItem(k) || "").length;
    }
  }
  const sizeKB = (totalSize / 1024).toFixed(1);

  const worldName = (window.world && world.name) ? world.name : "—";
  const yr = window.year || 0;
  const lastSaveTime = localStorage.getItem("cgv6_year") ? `Năm ${localStorage.getItem("cgv6_year")}` : "Chưa save";

  panel.innerHTML = `
<div style="padding:20px;max-width:600px;margin:0 auto">

  <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
    <div style="width:52px;height:52px;border-radius:14px;background:rgba(250,204,21,0.1);border:2px solid rgba(250,204,21,0.3);display:flex;align-items:center;justify-content:center;font-size:26px">💾</div>
    <div>
      <div style="font-size:20px;font-weight:700;color:var(--gold)">Save Manager</div>
      <div style="font-size:12px;color:var(--white-dim)">Export / Import save — mang thế giới sang trình duyệt khác</div>
    </div>
  </div>

  <!-- TRẠNG THÁI SAVE HIỆN TẠI -->
  <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:16px">
    <div style="font-size:11px;font-weight:600;color:var(--white-dim);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px">💿 Save Hiện Tại (localStorage)</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
      <div style="text-align:center">
        <div style="font-size:20px;font-weight:700;color:var(--gold)">${worldName}</div>
        <div style="font-size:10px;color:var(--white-dim)">Tên Thế Giới</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:20px;font-weight:700;color:#a78bfa">${savedKeys}</div>
        <div style="font-size:10px;color:var(--white-dim)">Keys Lưu Trữ</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:20px;font-weight:700;color:#34d399">${sizeKB} KB</div>
        <div style="font-size:10px;color:var(--white-dim)">Dung Lượng</div>
      </div>
    </div>
  </div>

  <!-- EXPORT -->
  <div style="background:rgba(52,211,153,0.05);border:1px solid rgba(52,211,153,0.2);border-radius:10px;padding:16px;margin-bottom:12px">
    <div style="font-size:13px;font-weight:700;color:#34d399;margin-bottom:6px">📤 Xuất Save</div>
    <div style="font-size:11px;color:var(--white-dim);margin-bottom:12px">
      Tải xuống toàn bộ dữ liệu thế giới thành 1 file <code style="background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:3px">.json</code>.
      Mang file này sang máy tính khác, trình duyệt khác, profile khác — rồi import là xong.
    </div>
    <button onclick="saveManager_export()"
      style="background:rgba(52,211,153,0.15);border:1px solid rgba(52,211,153,0.4);color:#34d399;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;width:100%">
      💾 Xuất Save → File JSON
    </button>
  </div>

  <!-- IMPORT -->
  <div style="background:rgba(251,146,60,0.05);border:1px solid rgba(251,146,60,0.2);border-radius:10px;padding:16px;margin-bottom:12px">
    <div style="font-size:13px;font-weight:700;color:#fb923c;margin-bottom:6px">📥 Nhập Save</div>
    <div style="font-size:11px;color:var(--white-dim);margin-bottom:12px">
      Chọn file <code style="background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:3px">.json</code> đã xuất trước đó.
      Dữ liệu hiện tại sẽ bị <strong style="color:#fb923c">ghi đè hoàn toàn</strong> — trang sẽ tự tải lại sau khi import.
    </div>
    <button onclick="saveManager_import()"
      style="background:rgba(251,146,60,0.15);border:1px solid rgba(251,146,60,0.4);color:#fb923c;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;width:100%">
      📂 Nhập Save ← Chọn File JSON
    </button>
  </div>

  <!-- HƯỚNG DẪN -->
  <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:10px;padding:14px">
    <div style="font-size:11px;font-weight:600;color:var(--white-dim);margin-bottom:8px">📋 Cách Chuyển Save Sang Trình Duyệt Khác</div>
    ${[
      ["1", "Ở trình duyệt cũ → bấm <strong>Xuất Save</strong> → tải xuống file .json"],
      ["2", "Mở game ở trình duyệt mới (Chrome, Firefox, Edge, Safari, v.v...)"],
      ["3", "Bấm <strong>Nhập Save</strong> → chọn file .json vừa tải"],
      ["4", "Trang tự reload → save được khôi phục hoàn toàn ✅"],
    ].map(([n, txt]) => `
      <div style="display:flex;gap:10px;align-items:flex-start;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
        <div style="width:20px;height:20px;border-radius:50%;background:rgba(250,204,21,0.15);border:1px solid rgba(250,204,21,0.3);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--gold);flex-shrink:0;margin-top:1px">${n}</div>
        <div style="font-size:11px;color:var(--white-dim);line-height:1.5">${txt}</div>
      </div>`).join("")}
    <div style="margin-top:8px;font-size:10px;color:rgba(255,255,255,0.3)">
      ⚠️ localStorage bị tách biệt theo trình duyệt/profile — đây là giới hạn của browser, không phải bug game.
    </div>
  </div>

</div>`;
}

// ============================================================
// INIT — thêm nút Save Manager vào sidebar (luôn visible)
// ============================================================
(function saveManagerInit() {
  // Inject nav button + panel vào DOM sau khi trang load xong
  function _injectSaveManager() {
    // 1. Nav button — thêm vào cuối sidebar-nav
    const nav = document.querySelector(".sidebar-nav");
    if (nav && !document.getElementById("btn-save-manager")) {
      const btn = document.createElement("button");
      btn.className = "nav-btn";
      btn.id = "btn-save-manager";
      btn.setAttribute("data-panel", "save-manager");
      btn.onclick = function() {
        if (typeof showPanel === "function") showPanel("save-manager");
        renderSaveManagerPanel();
      };
      btn.innerHTML = `<span>💾</span><span>Save</span>`;
      btn.style.borderTop = "1px solid var(--border)";
      btn.style.marginTop = "4px";
      btn.title = "Export / Import Save";
      nav.appendChild(btn);
    }

    // 2. Panel div — thêm vào content area
    const content = document.querySelector(".content");
    if (content && !document.getElementById("panel-save-manager")) {
      const panel = document.createElement("div");
      panel.id = "panel-save-manager";
      panel.className = "panel";
      content.appendChild(panel);
    }

    // 3. Hook showPanel để render khi switch
    const _origShowPanel = window.showPanel;
    if (typeof _origShowPanel === "function" && !window._saveManagerHooked) {
      window._saveManagerHooked = true;
      window.showPanel = function(name) {
        _origShowPanel(name);
        if (name === "save-manager") renderSaveManagerPanel();
      };
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", _injectSaveManager);
  } else {
    // DOM đã sẵn sàng, chờ thêm chút để các engine khác load xong
    setTimeout(_injectSaveManager, 600);
  }
})();

// Export global
window.saveManager_export = saveManager_export;
window.saveManager_import = saveManager_import;
window.renderSaveManagerPanel = renderSaveManagerPanel;

console.log("[SaveManager V1] Loaded ✅");
