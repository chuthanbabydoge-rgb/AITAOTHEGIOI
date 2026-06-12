/* ============================
   CREATOR GOD V6 — CHỢ THẾ GIỚI (WORLD MARKETPLACE)
   worldMarketplace.js
   Load AFTER multiWorldSystem.js
   ============================ */

// ============================
// MARKETPLACE STATE
// ============================

const MARKETPLACE_KEY    = "cgv6_marketplace";   // localStorage key for all listed worlds
const MARKETPLACE_FAVS   = "cgv6_mkt_favs";      // user's favorited world IDs
const MARKETPLACE_RATINGS= "cgv6_mkt_ratings";   // user's ratings { worldId: 1-5 }

let _mktWorlds   = [];   // All worlds in the marketplace (local store)
let _mktFavs     = new Set();
let _mktRatings  = {};   // worldId -> number (1-5)

let _mktFilter   = "all";       // "all" | "cultivation" | "fantasy" | "zombie" | "mythology" | "scifi"
let _mktSort     = "newest";    // "newest" | "oldest" | "rating" | "npcs" | "year"
let _mktSearch   = "";

// ============================
// PERSISTENCE
// ============================

function mktLoad() {
  try {
    const raw = localStorage.getItem(MARKETPLACE_KEY);
    _mktWorlds  = raw ? JSON.parse(raw) : [];
    const favs  = localStorage.getItem(MARKETPLACE_FAVS);
    _mktFavs    = new Set(favs ? JSON.parse(favs) : []);
    const rats  = localStorage.getItem(MARKETPLACE_RATINGS);
    _mktRatings = rats ? JSON.parse(rats) : {};
  } catch(e) {
    console.warn("mktLoad failed:", e);
    _mktWorlds = []; _mktFavs = new Set(); _mktRatings = {};
  }
}

function mktSave() {
  try {
    localStorage.setItem(MARKETPLACE_KEY,  JSON.stringify(_mktWorlds));
    localStorage.setItem(MARKETPLACE_FAVS, JSON.stringify([..._mktFavs]));
    localStorage.setItem(MARKETPLACE_RATINGS, JSON.stringify(_mktRatings));
  } catch(e) { console.warn("mktSave failed:", e); }
}

// ============================
// WORLD PACKAGE BUILDER
// ============================

/**
 * Build a full exportable World Package from a snapshot.
 * Contains: world meta, npcs, sects/factions, countries, worldHistory, worldStories, worldMap
 */
function buildWorldPackage(snap) {
  const avgRating = _mktGetAvgRating(snap.mktId || snap.id);
  return {
    // Marketplace metadata
    mktId:         snap.mktId || ("mkt_" + Date.now() + "_" + Math.random().toString(36).slice(2,6)),
    mktVersion:    "cgv6_marketplace_v1",
    listedAt:      snap.listedAt || Date.now(),
    author:        snap.author   || "Thiên Đạo Ẩn Danh",
    description:   snap.description || "",
    tags:          snap.tags         || [],
    downloadCount: snap.downloadCount || 0,
    ratings:       snap.ratings       || [],
    avgRating:     avgRating,

    // World core
    world: {
      name:        snap.name,
      genre:       snap.genre       || "",
      templateKey: snap.template    || "cultivation",
      createdYear: snap.createdYear || 1,
      currentEra:  snap.currentEra  || "",
    },

    // Packed data
    npcs:         (snap.npcs         || []).slice(0, 500),
    sects:        snap.sects         || [],
    countries:    snap.countries     || [],
    worldHistory: (snap.worldHistory || []).slice(0, 500),
    dynasties:    snap.dynasties     || {},
    hallOfFame:   snap.hallOfFame    || [],

    // Story & map if available
    worldStories: snap.worldStories  || [],
    worldMap:     snap.worldMap      || null,

    // Summary stats (pre-computed for display)
    stats: {
      year:       snap.year         || 1,
      npcCount:   (snap.npcs || []).length,
      aliveCount: (snap.npcs || []).filter(n => n.status === "alive").length,
      sectCount:  (snap.sects || []).length,
      nationCount:(snap.countries || []).length,
      histEvents: (snap.worldHistory || []).length,
    }
  };
}

// ============================
// LIST / DELIST WORLD
// ============================

/** List the current active world on the marketplace */
function mktListCurrentWorld(meta = {}) {
  if (!world) { toast("⚠️ Chưa có thế giới nào đang hoạt động!"); return; }

  // Save first
  if (currentWorldId && typeof saveWorlds === "function") saveWorlds();

  const snap = (typeof worlds !== "undefined" && worlds.find(w => w.id === currentWorldId)) || {};
  const pkg  = buildWorldPackage({
    ...snap,
    author:      meta.author      || "Thiên Đạo Ẩn Danh",
    description: meta.description || "",
    tags:        meta.tags        || [],
    listedAt:    Date.now(),
  });

  // Check if already listed (by origin world id)
  const existing = _mktWorlds.findIndex(w => w._originId === currentWorldId);
  pkg._originId  = currentWorldId;

  if (existing >= 0) {
    _mktWorlds[existing] = pkg;
    toast("🔄 Đã cập nhật thế giới trên Chợ!");
  } else {
    _mktWorlds.unshift(pkg);
    toast(`🏪 Đã đăng "${world.name}" lên Chợ Thế Giới!`);
  }

  mktSave();
  renderMarketplace();
}

function mktDelistWorld(mktId) {
  const idx = _mktWorlds.findIndex(w => w.mktId === mktId);
  if (idx < 0) return;
  if (!confirm("Xóa thế giới khỏi Chợ?")) return;
  _mktWorlds.splice(idx, 1);
  mktSave();
  renderMarketplace();
  toast("🗑 Đã gỡ khỏi Chợ Thế Giới.");
}

// ============================
// DOWNLOAD / CLONE WORLD
// ============================

/** Clone a marketplace world into the local worlds list */
function mktCloneWorld(mktId) {
  const pkg = _mktWorlds.find(w => w.mktId === mktId);
  if (!pkg) { toast("⚠️ Không tìm thấy thế giới!"); return; }

  const newId = (typeof newWorldId === "function") ? newWorldId() : ("w_" + Date.now());
  const snap  = {
    id:            newId,
    name:          pkg.world.name + " (Bản Chép)",
    template:      pkg.world.templateKey,
    genre:         pkg.world.genre,
    createdYear:   pkg.world.createdYear,
    currentEra:    pkg.world.currentEra,
    npcs:          JSON.parse(JSON.stringify(pkg.npcs    || [])),
    sects:         JSON.parse(JSON.stringify(pkg.sects   || [])),
    countries:     JSON.parse(JSON.stringify(pkg.countries || [])),
    worldHistory:  JSON.parse(JSON.stringify(pkg.worldHistory || [])),
    dynasties:     JSON.parse(JSON.stringify(pkg.dynasties    || {})),
    hallOfFame:    JSON.parse(JSON.stringify(pkg.hallOfFame   || [])),
    worldStories:  JSON.parse(JSON.stringify(pkg.worldStories || [])),
    worldMap:      pkg.worldMap ? JSON.parse(JSON.stringify(pkg.worldMap)) : null,
    bosses:        [],
    regions:       (typeof REGIONS_DATA !== "undefined") ? JSON.parse(JSON.stringify(REGIONS_DATA)) : [],
    secretRealms:  [],
    logs:          [],
    eventTimeline: [],
    worldEvents:   [],
    activeWorldEvent: null,
    sectWarLogs:   [],
    activeWars:    [],
    year:          pkg.stats.year || 1,
    heavenPoints:  1000,
    _npcIdCounter: (pkg.npcs || []).length + 1,
    savedAt:       Date.now(),
  };

  if (typeof worlds !== "undefined") {
    worlds.push(snap);
    if (typeof saveWorlds === "function") saveWorlds();
    if (typeof renderWorldManagerList === "function") renderWorldManagerList();
  }

  // Increment download counter
  const pkgRef = _mktWorlds.find(w => w.mktId === mktId);
  if (pkgRef) { pkgRef.downloadCount = (pkgRef.downloadCount || 0) + 1; mktSave(); }

  toast(`📋 Đã sao chép "${pkg.world.name}" vào danh sách thế giới!`);
}

/** Download marketplace world as JSON file */
function mktDownloadWorld(mktId) {
  const pkg = _mktWorlds.find(w => w.mktId === mktId);
  if (!pkg) { toast("⚠️ Không tìm thấy thế giới!"); return; }

  const json = JSON.stringify(pkg, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `mkt_world_${pkg.world.name.replace(/\s/g,"_")}_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);

  const pkgRef = _mktWorlds.find(w => w.mktId === mktId);
  if (pkgRef) { pkgRef.downloadCount = (pkgRef.downloadCount || 0) + 1; mktSave(); }

  toast(`📥 Đã tải xuống "${pkg.world.name}"!`);
}

/** Import a marketplace world package from JSON file */
function mktImportFromFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      // Could be a marketplace package or a raw world snapshot
      if (data.mktVersion === "cgv6_marketplace_v1") {
        // Assign new mktId to avoid collision
        data.mktId   = "mkt_" + Date.now() + "_" + Math.random().toString(36).slice(2,6);
        data.listedAt = Date.now();
        _mktWorlds.unshift(data);
        mktSave();
        renderMarketplace();
        toast(`📥 Đã nhập thế giới "${data.world?.name}" vào Chợ!`);
      } else if (data.id && data.name) {
        // Raw world snapshot — wrap it
        const pkg = buildWorldPackage({ ...data, description: "Nhập từ file" });
        pkg._originId  = data.id;
        _mktWorlds.unshift(pkg);
        mktSave();
        renderMarketplace();
        toast(`📥 Đã nhập thế giới "${data.name}" vào Chợ!`);
      } else {
        toast("⚠️ File không hợp lệ!");
      }
    } catch(err) {
      toast("⚠️ Lỗi đọc file: " + err.message);
    }
  };
  reader.readAsText(file);
}

// ============================
// FAVORITES
// ============================

function mktToggleFav(mktId) {
  if (_mktFavs.has(mktId)) {
    _mktFavs.delete(mktId);
    toast("💔 Đã bỏ yêu thích.");
  } else {
    _mktFavs.add(mktId);
    toast("❤️ Đã thêm vào yêu thích!");
  }
  mktSave();
  renderMarketplace();
}

// ============================
// RATINGS
// ============================

function mktRate(mktId, score) {
  // score: 1-5
  _mktRatings[mktId] = score;

  // Append to pkg.ratings array
  const pkg = _mktWorlds.find(w => w.mktId === mktId);
  if (pkg) {
    if (!pkg.ratings) pkg.ratings = [];
    // Replace user's previous rating or push new one
    const tag = "user_local";
    const idx = pkg.ratings.findIndex(r => r.user === tag);
    if (idx >= 0) pkg.ratings[idx].score = score;
    else          pkg.ratings.push({ user: tag, score });
    pkg.avgRating = _mktGetAvgRating(mktId);
    mktSave();
  }
  renderMarketplace();
  toast(`⭐ Đã đánh giá ${score}/5 sao!`);
}

function _mktGetAvgRating(mktId) {
  const pkg = _mktWorlds.find(w => w.mktId === mktId);
  if (!pkg || !pkg.ratings || !pkg.ratings.length) return 0;
  const sum = pkg.ratings.reduce((s, r) => s + (r.score || 0), 0);
  return Math.round((sum / pkg.ratings.length) * 10) / 10;
}

// ============================
// FILTERING & SORTING
// ============================

function _mktFiltered() {
  let list = [..._mktWorlds];

  // Search
  if (_mktSearch.trim()) {
    const q = _mktSearch.toLowerCase();
    list = list.filter(w =>
      (w.world?.name || "").toLowerCase().includes(q) ||
      (w.author || "").toLowerCase().includes(q) ||
      (w.description || "").toLowerCase().includes(q) ||
      (w.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }

  // Genre filter
  if (_mktFilter !== "all") {
    if (_mktFilter === "favs") {
      list = list.filter(w => _mktFavs.has(w.mktId));
    } else {
      list = list.filter(w => (w.world?.templateKey || w.world?.genre || "") === _mktFilter);
    }
  }

  // Sort
  switch (_mktSort) {
    case "newest":  list.sort((a,b) => (b.listedAt||0) - (a.listedAt||0)); break;
    case "oldest":  list.sort((a,b) => (a.listedAt||0) - (b.listedAt||0)); break;
    case "rating":  list.sort((a,b) => (b.avgRating||0) - (a.avgRating||0)); break;
    case "npcs":    list.sort((a,b) => (b.stats?.npcCount||0) - (a.stats?.npcCount||0)); break;
    case "year":    list.sort((a,b) => (b.stats?.year||0) - (a.stats?.year||0)); break;
    case "popular": list.sort((a,b) => (b.downloadCount||0) - (a.downloadCount||0)); break;
  }

  return list;
}

// ============================
// RENDER
// ============================

function renderMarketplace() {
  const container = document.getElementById("mktWorldGrid");
  if (!container) return;

  const list = _mktFiltered();

  // Update counters
  const totalEl = document.getElementById("mktTotal");
  if (totalEl) totalEl.textContent = _mktWorlds.length;
  const favEl = document.getElementById("mktFavCount");
  if (favEl) favEl.textContent = _mktFavs.size;

  if (!list.length) {
    container.innerHTML = `
      <div class="mkt-empty">
        <div style="font-size:48px;margin-bottom:12px">🏪</div>
        <div style="font-size:16px;font-weight:600;color:var(--white-main);margin-bottom:8px">Chợ Thế Giới Trống</div>
        <div style="font-size:13px;color:var(--white-dim);line-height:1.7">
          Hãy đăng thế giới của bạn lên Chợ<br>hoặc nhập thế giới từ file JSON.
        </div>
      </div>`;
    return;
  }

  container.innerHTML = list.map(pkg => _renderWorldCard(pkg)).join("");
}

function _starsHTML(mktId, avg) {
  const userRating = _mktRatings[mktId] || 0;
  const stars = [1,2,3,4,5].map(i => {
    const lit = i <= (userRating || Math.round(avg));
    return `<span class="mkt-star ${lit ? "mkt-star-lit" : ""}" onclick="mktRate('${mktId}', ${i})" title="${i} sao">★</span>`;
  }).join("");
  return `<div class="mkt-stars">${stars}<span class="mkt-avg">${avg > 0 ? avg.toFixed(1) : "—"}</span></div>`;
}

function _renderWorldCard(pkg) {
  const isFav = _mktFavs.has(pkg.mktId);
  const isOwn = pkg._originId === currentWorldId;
  const tmplMeta = (typeof TEMPLATE_META !== "undefined" && TEMPLATE_META[pkg.world?.templateKey]) ? TEMPLATE_META[pkg.world?.templateKey] : null;
  const icon  = tmplMeta ? tmplMeta.desc.split(" ")[0] : "🌍";
  const genre = tmplMeta ? tmplMeta.genre : (pkg.world?.templateKey || "—");
  const date  = pkg.listedAt ? new Date(pkg.listedAt).toLocaleDateString("vi-VN") : "—";
  const tags  = (pkg.tags || []).slice(0,4).map(t => `<span class="mkt-tag">${t}</span>`).join("");

  return `
  <div class="mkt-card ${isOwn ? "mkt-card-own" : ""}">
    <div class="mkt-card-header">
      <span class="mkt-world-icon">${icon}</span>
      <div class="mkt-card-title-wrap">
        <div class="mkt-card-name">${pkg.world?.name || "—"}${isOwn ? ' <span class="mkt-own-badge">CỦA TÔI</span>' : ""}</div>
        <div class="mkt-card-author">✍️ ${pkg.author || "Ẩn Danh"} · ${date}</div>
      </div>
      <button class="mkt-fav-btn ${isFav ? "mkt-fav-lit" : ""}" onclick="mktToggleFav('${pkg.mktId}')" title="${isFav ? "Bỏ yêu thích" : "Thêm yêu thích"}">
        ${isFav ? "❤️" : "🤍"}
      </button>
    </div>

    ${pkg.description ? `<div class="mkt-desc">${pkg.description}</div>` : ""}
    ${tags ? `<div class="mkt-tags">${tags}</div>` : ""}

    <div class="mkt-meta-grid">
      <div class="mkt-meta-chip">🌐 <span>${genre}</span></div>
      <div class="mkt-meta-chip">📅 <span>Năm ${pkg.stats?.year || 1}</span></div>
      <div class="mkt-meta-chip">👥 <span>${pkg.stats?.aliveCount || 0}/${pkg.stats?.npcCount || 0} tu sĩ</span></div>
      <div class="mkt-meta-chip">🏯 <span>${pkg.stats?.sectCount || 0} tông môn</span></div>
      <div class="mkt-meta-chip">⚔️ <span>${pkg.stats?.nationCount || 0} quốc gia</span></div>
      <div class="mkt-meta-chip">📖 <span>${pkg.stats?.histEvents || 0} sự kiện</span></div>
    </div>

    <div class="mkt-card-footer">
      ${_starsHTML(pkg.mktId, pkg.avgRating || 0)}
      <div class="mkt-dl-count">📥 ${pkg.downloadCount || 0}</div>
      <div class="mkt-actions">
        <button class="mkt-btn mkt-btn-clone" onclick="mktCloneWorld('${pkg.mktId}')" title="Sao chép vào danh sách thế giới">📋 Sao Chép</button>
        <button class="mkt-btn mkt-btn-dl" onclick="mktDownloadWorld('${pkg.mktId}')" title="Tải xuống file JSON">⬇️ Tải</button>
        ${isOwn ? `<button class="mkt-btn mkt-btn-danger" onclick="mktDelistWorld('${pkg.mktId}')" title="Gỡ khỏi Chợ">🗑</button>` : ""}
      </div>
    </div>
  </div>`;
}

// ============================
// OPEN / CLOSE MARKETPLACE
// ============================

function openMarketplace() {
  const overlay = document.getElementById("mktOverlay");
  if (!overlay) return;
  mktLoad();
  renderMarketplace();
  overlay.classList.remove("mkt-hidden");
}

function closeMarketplace() {
  const overlay = document.getElementById("mktOverlay");
  if (overlay) overlay.classList.add("mkt-hidden");
}

// ============================
// PUBLISH PANEL (modal inside marketplace)
// ============================

function openPublishPanel() {
  const panel = document.getElementById("mktPublishPanel");
  if (panel) {
    panel.classList.remove("mkt-hidden");
    const nameEl = document.getElementById("mktPubWorldName");
    if (nameEl) nameEl.textContent = world ? world.name : "—";
  }
}

function closePublishPanel() {
  const panel = document.getElementById("mktPublishPanel");
  if (panel) panel.classList.add("mkt-hidden");
}

function submitPublish() {
  const author = (document.getElementById("mktPubAuthor")?.value || "").trim() || "Thiên Đạo Ẩn Danh";
  const desc   = (document.getElementById("mktPubDesc")?.value   || "").trim();
  const tagRaw = (document.getElementById("mktPubTags")?.value   || "").trim();
  const tags   = tagRaw ? tagRaw.split(",").map(t => t.trim()).filter(Boolean).slice(0, 8) : [];

  mktListCurrentWorld({ author, description: desc, tags });
  closePublishPanel();
}

// ============================
// DOM INJECTION
// ============================

function injectMarketplaceButton() {
  if (document.getElementById("mktNavBtn")) return;
  const nav = document.querySelector(".sidebar-nav");
  if (!nav) return;
  const btn = document.createElement("button");
  btn.id        = "mktNavBtn";
  btn.className = "nav-btn ec-hidden";
  btn.style.display = "none";
  btn.setAttribute("data-panel", "marketplace");
  btn.innerHTML = `<span class="nav-icon">🏪</span><span>Chợ Thế Giới</span>`;
  btn.onclick   = openMarketplace;
  // Insert after worldManagerNavBtn or first position
  const mgrBtn = document.getElementById("worldManagerNavBtn");
  if (mgrBtn && mgrBtn.nextSibling) {
    nav.insertBefore(btn, mgrBtn.nextSibling);
  } else {
    nav.insertBefore(btn, nav.firstChild);
  }
}

function injectMarketplaceDOM() {
  if (document.getElementById("mktOverlay")) return;

  const overlay = document.createElement("div");
  overlay.id        = "mktOverlay";
  overlay.className = "mkt-overlay mkt-hidden";

  overlay.innerHTML = `
  <div class="mkt-panel">
    <!-- Header -->
    <div class="mkt-header">
      <div class="mkt-header-left">
        <span class="mkt-logo">🏪</span>
        <div>
          <div class="mkt-title">Chợ Thế Giới</div>
          <div class="mkt-subtitle">Chia sẻ · Khám phá · Sao chép</div>
        </div>
      </div>
      <div class="mkt-header-right">
        <div class="mkt-header-stats">
          <span>🌍 <strong id="mktTotal">0</strong> thế giới</span>
          <span>❤️ <strong id="mktFavCount">0</strong> yêu thích</span>
        </div>
        <button class="mkt-pub-btn" onclick="openPublishPanel()">📤 Đăng Thế Giới</button>
        <button class="mkt-close-btn" onclick="closeMarketplace()">✕</button>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="mkt-toolbar">
      <input id="mktSearchInput" class="mkt-search" placeholder="🔍 Tìm kiếm thế giới, tác giả, thẻ..."
        oninput="_mktSearch=this.value; renderMarketplace()">

      <select class="mkt-select" onchange="_mktFilter=this.value; renderMarketplace()">
        <option value="all">🌐 Tất cả</option>
        <option value="cultivation">☯️ Tu Tiên</option>
        <option value="fantasy">🧙 Fantasy</option>
        <option value="zombie">🧟 Zombie</option>
        <option value="mythology">⚡ Thần Thoại</option>
        <option value="scifi">🚀 Sci-Fi</option>
        <option value="favs">❤️ Yêu Thích</option>
      </select>

      <select class="mkt-select" onchange="_mktSort=this.value; renderMarketplace()">
        <option value="newest">🕒 Mới nhất</option>
        <option value="oldest">📆 Cũ nhất</option>
        <option value="rating">⭐ Đánh giá</option>
        <option value="popular">📥 Phổ biến</option>
        <option value="npcs">👥 Nhiều tu sĩ</option>
        <option value="year">📅 Năm cao</option>
      </select>

      <div class="mkt-toolbar-right">
        <label class="mkt-import-label" title="Nhập từ file JSON">
          📥 Nhập File
          <input type="file" accept=".json" style="display:none" onchange="mktImportFromFile(this.files[0]); this.value=''">
        </label>
      </div>
    </div>

    <!-- Grid -->
    <div id="mktWorldGrid" class="mkt-grid"></div>

    <!-- Footer -->
    <div class="mkt-footer">
      <span style="font-size:11px;color:var(--white-dim)">Lưu cục bộ · Chia sẻ qua file JSON</span>
      <button class="btn-secondary" style="font-size:11px;padding:4px 12px" onclick="mktExportAll()">📤 Xuất Toàn Bộ Chợ</button>
    </div>
  </div>

  <!-- Publish sub-panel -->
  <div id="mktPublishPanel" class="mkt-pub-panel mkt-hidden">
    <div class="mkt-pub-inner">
      <div class="mkt-pub-header">
        <div class="mkt-pub-title">📤 Đăng Thế Giới Lên Chợ</div>
        <button class="mkt-close-btn" onclick="closePublishPanel()">✕</button>
      </div>
      <div class="mkt-pub-body">
        <div class="mkt-pub-world-name" id="mktPubWorldName">—</div>
        <div class="mkt-pub-field">
          <label>Tên tác giả</label>
          <input id="mktPubAuthor" class="dao-input" placeholder="Thiên Đạo Ẩn Danh..." style="width:100%">
        </div>
        <div class="mkt-pub-field">
          <label>Mô tả thế giới</label>
          <textarea id="mktPubDesc" class="dao-input" rows="3" placeholder="Kể về thế giới của bạn..." style="width:100%;resize:vertical"></textarea>
        </div>
        <div class="mkt-pub-field">
          <label>Thẻ (phân cách bằng dấu phẩy)</label>
          <input id="mktPubTags" class="dao-input" placeholder="tu tiên, huyết chiến, hắc ám..." style="width:100%">
        </div>
        <div class="mkt-pub-footer">
          <button class="btn-secondary" onclick="closePublishPanel()">Hủy</button>
          <button class="btn-primary" onclick="submitPublish()">✅ Đăng Lên Chợ</button>
        </div>
      </div>
    </div>
  </div>
  `;

  // Click outside to close
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeMarketplace();
  });

  document.body.appendChild(overlay);
}

// ============================
// EXPORT ALL MARKETPLACE
// ============================

function mktExportAll() {
  const json = JSON.stringify({ mktVersion: "cgv6_marketplace_export", worlds: _mktWorlds }, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `marketplace_export_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast(`📤 Đã xuất ${_mktWorlds.length} thế giới từ Chợ!`);
}

// ============================
// CSS INJECTION
// ============================

function injectMarketplaceCSS() {
  if (document.getElementById("mktCSS")) return;
  const style = document.createElement("style");
  style.id = "mktCSS";
  style.textContent = `
/* ============================
   CHỢ THẾ GIỚI — CSS
   ============================ */

.mkt-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.82);
  backdrop-filter: blur(6px);
  z-index: 1100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px 12px;
  overflow-y: auto;
}
.mkt-hidden { display: none !important; }

.mkt-panel {
  background: var(--bg-secondary);
  border: 1px solid var(--border-hover);
  border-radius: 18px;
  width: 100%;
  max-width: 960px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(250,204,21,0.12);
  position: relative;
}

/* Header */
.mkt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 22px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  flex-wrap: wrap;
}
.mkt-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.mkt-logo { font-size: 28px; }
.mkt-title {
  font-family: var(--font-heading);
  font-size: 18px;
  color: var(--gold);
  letter-spacing: 2px;
  line-height: 1;
}
.mkt-subtitle {
  font-size: 10px;
  color: var(--white-dim);
  letter-spacing: 1px;
  margin-top: 3px;
}
.mkt-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.mkt-header-stats {
  display: flex;
  gap: 14px;
  font-size: 12px;
  color: var(--white-dim);
}
.mkt-header-stats strong { color: var(--gold); }
.mkt-pub-btn {
  background: linear-gradient(135deg, rgba(250,204,21,0.2), rgba(196,150,30,0.3));
  border: 1px solid rgba(250,204,21,0.5);
  color: var(--gold);
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.mkt-pub-btn:hover {
  background: linear-gradient(135deg, rgba(250,204,21,0.35), rgba(196,150,30,0.45));
  transform: translateY(-1px);
}
.mkt-close-btn {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--white-dim);
  cursor: pointer;
  padding: 5px 11px;
  font-size: 14px;
  transition: all 0.2s;
}
.mkt-close-btn:hover { border-color: var(--red); color: var(--red); }

/* Toolbar */
.mkt-toolbar {
  display: flex;
  gap: 8px;
  padding: 12px 18px;
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
  align-items: center;
  flex-shrink: 0;
  background: rgba(0,0,0,0.2);
}
.mkt-search {
  flex: 1;
  min-width: 160px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--white-main);
  padding: 7px 12px;
  font-size: 12px;
  outline: none;
  transition: border-color 0.2s;
}
.mkt-search:focus { border-color: var(--gold-dim); }
.mkt-select {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--white-main);
  padding: 7px 10px;
  font-size: 12px;
  outline: none;
  cursor: pointer;
}
.mkt-toolbar-right { margin-left: auto; }
.mkt-import-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 12px;
  color: var(--white-main);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.mkt-import-label:hover { border-color: var(--gold-dim); color: var(--gold); }

/* Grid */
.mkt-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
  padding: 16px 18px;
  overflow-y: auto;
  flex: 1;
  max-height: calc(85vh - 200px);
}
@media (max-width: 768px) {
  .mkt-grid { grid-template-columns: 1fr; max-height: none; }
}

/* World Card */
.mkt-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.2s;
  position: relative;
}
.mkt-card:hover {
  border-color: var(--border-hover);
  background: rgba(255,255,255,0.04);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}
.mkt-card-own {
  border-color: rgba(250,204,21,0.35) !important;
  background: linear-gradient(135deg, rgba(250,204,21,0.04), var(--bg-card)) !important;
}

.mkt-card-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.mkt-world-icon {
  font-size: 28px;
  flex-shrink: 0;
  width: 36px;
  text-align: center;
  margin-top: 2px;
}
.mkt-card-title-wrap { flex: 1; min-width: 0; }
.mkt-card-name {
  font-family: var(--font-title);
  font-size: 14px;
  font-weight: 700;
  color: var(--white-main);
  margin-bottom: 3px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.mkt-own-badge {
  font-size: 8px;
  background: rgba(250,204,21,0.15);
  border: 1px solid rgba(250,204,21,0.4);
  color: var(--gold);
  padding: 1px 6px;
  border-radius: 8px;
  letter-spacing: 0.5px;
  font-weight: 700;
}
.mkt-card-author { font-size: 10px; color: var(--white-dim); }

.mkt-fav-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
  transition: transform 0.2s;
  filter: grayscale(0.5);
}
.mkt-fav-btn:hover { transform: scale(1.25); filter: none; }
.mkt-fav-lit { filter: none !important; }

.mkt-desc {
  font-size: 11px;
  color: var(--white-dim);
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mkt-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.mkt-tag {
  padding: 2px 7px;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 9px;
  color: var(--white-dim);
  letter-spacing: 0.3px;
}

.mkt-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}
.mkt-meta-chip {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: var(--white-dim);
  padding: 3px 6px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  border-radius: 6px;
}
.mkt-meta-chip span { color: var(--white-main); font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.mkt-card-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1px solid var(--border);
}
.mkt-stars {
  display: flex;
  align-items: center;
  gap: 1px;
}
.mkt-star {
  font-size: 14px;
  color: var(--border);
  cursor: pointer;
  transition: color 0.15s, transform 0.1s;
}
.mkt-star:hover { transform: scale(1.3); color: var(--gold); }
.mkt-star-lit { color: var(--gold); }
.mkt-avg {
  font-size: 11px;
  color: var(--gold-dim);
  font-weight: 700;
  margin-left: 4px;
}
.mkt-dl-count {
  font-size: 10px;
  color: var(--white-dim);
  white-space: nowrap;
}
.mkt-actions {
  display: flex;
  gap: 5px;
  margin-left: auto;
  flex-wrap: wrap;
}
.mkt-btn {
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
  white-space: nowrap;
}
.mkt-btn-clone {
  background: rgba(74,222,128,0.08);
  border-color: rgba(74,222,128,0.3);
  color: var(--jade);
}
.mkt-btn-clone:hover { background: rgba(74,222,128,0.18); border-color: var(--jade); }
.mkt-btn-dl {
  background: rgba(96,165,250,0.08);
  border-color: rgba(96,165,250,0.3);
  color: #60a5fa;
}
.mkt-btn-dl:hover { background: rgba(96,165,250,0.18); }
.mkt-btn-danger {
  background: rgba(248,113,113,0.08);
  border-color: rgba(248,113,113,0.3);
  color: var(--red);
}
.mkt-btn-danger:hover { background: rgba(248,113,113,0.18); }

/* Empty state */
.mkt-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: var(--white-dim);
}

/* Footer */
.mkt-footer {
  padding: 10px 18px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

/* Publish sub-panel */
.mkt-pub-panel {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 10;
  border-radius: 18px;
}
.mkt-pub-inner {
  background: var(--bg-secondary);
  border: 1px solid var(--border-hover);
  border-radius: 14px;
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0,0,0,0.6);
}
.mkt-pub-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
}
.mkt-pub-title {
  font-family: var(--font-heading);
  font-size: 14px;
  color: var(--gold);
  letter-spacing: 1px;
}
.mkt-pub-body { padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; }
.mkt-pub-world-name {
  font-family: var(--font-title);
  font-size: 16px;
  font-weight: 700;
  color: var(--white-main);
  padding: 8px 12px;
  background: rgba(250,204,21,0.06);
  border: 1px solid rgba(250,204,21,0.2);
  border-radius: 8px;
  text-align: center;
}
.mkt-pub-field { display: flex; flex-direction: column; gap: 5px; }
.mkt-pub-field label { font-size: 11px; color: var(--gold-dim); letter-spacing: 0.5px; }
.mkt-pub-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid var(--border);
  margin-top: 4px;
}
  `;
  document.head.appendChild(style);
}

// ============================
// INIT
// ============================

function initWorldMarketplace() {
  mktLoad();
  injectMarketplaceButton();
  injectMarketplaceDOM();
  setTimeout(function() { if (typeof ecRenderDynamicSidebar === 'function') ecRenderDynamicSidebar(); }, 100);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    injectMarketplaceCSS();
    initWorldMarketplace();
  });
} else {
  injectMarketplaceCSS();
  initWorldMarketplace();
}
