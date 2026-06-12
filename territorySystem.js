/* ============================
   TERRITORY SYSTEM — territorySystem.js
   Creator God V6.0
   Không phụ thuộc vào hệ thống nào khác.
   ============================ */

// ============================
// TERRITORY DATA POOLS
// ============================

const TERRITORY_NAME_PREFIXES = [
  "Thiên","Địa","Long","Phượng","Huyền","Linh","Cổ","Thần","Vân","Kiếm",
  "Hỏa","Băng","Lôi","Phong","Hắc","Bạch","Hồng","Ngọc","Kim","Mộc"
];
const TERRITORY_NAME_SUFFIXES = [
  "Sơn","Lĩnh","Cốc","Nguyên","Hải","Đài","Động","Phong","Trì","Lâm",
  "Khê","Uyên","Thành","Viên","Bình","Tuyền","Cung","Đảo","Thôn","Dã"
];

const TERRITORY_REGIONS = [
  "🗻 Đông Vực","🌋 Tây Hoang","🌊 Nam Hải","❄️ Bắc Nguyên","🌀 Trung Châu"
];

const TERRITORY_DANGER_LABELS = [
  "","★ An Toàn","★★ Bình Thường","★★★ Nguy Hiểm","★★★★ Cực Nguy","★★★★★ Tử Địa"
];

const TERRITORY_DANGER_COLORS = [
  "","#4ade80","#facc15","#fb923c","#f87171","#c084fc"
];

// ============================
// GENERATION
// ============================

function generateTerritoryName(usedNames) {
  let name, attempts = 0;
  do {
    const pre = TERRITORY_NAME_PREFIXES[Math.floor(Math.random() * TERRITORY_NAME_PREFIXES.length)];
    const suf = TERRITORY_NAME_SUFFIXES[Math.floor(Math.random() * TERRITORY_NAME_SUFFIXES.length)];
    name = pre + " " + suf;
    attempts++;
  } while (usedNames.has(name) && attempts < 100);
  usedNames.add(name);
  return name;
}

function generateTerritories(count = 20) {
  const territories = [];
  const usedNames = new Set();
  let idCounter = 1;

  for (let i = 0; i < count; i++) {
    const dangerLevel = Math.floor(Math.random() * 5) + 1; // 1–5
    const region = TERRITORY_REGIONS[Math.floor(Math.random() * TERRITORY_REGIONS.length)];

    // Resources scale inversely with danger (more danger = more resources)
    const resMult = 0.5 + dangerLevel * 0.4;
    const territory = {
      id: "t" + (idCounter++),
      name: generateTerritoryName(usedNames),
      region,
      population:      Math.floor((Math.random() * 50000 + 5000) / dangerLevel),
      spiritualEnergy: Math.floor((Math.random() * 800 + 200) * resMult),
      minerals:        Math.floor((Math.random() * 600 + 100) * resMult),
      herbs:           Math.floor((Math.random() * 500 + 100) * resMult),
      dangerLevel,
      bossPresent:     dangerLevel >= 4 && Math.random() < 0.45,
    };
    territories.push(territory);
  }

  return territories;
}

// ============================
// RENDER
// ============================

function renderTerritories() {
  const container = document.getElementById("territoriesGrid");
  if (!container) return;

  // Reference to global territories (set on world object)
  // Auto-fix: generate territories if world exists but territories is empty
  if (typeof world !== "undefined" && world && typeof generateTerritories === "function") {
    if (!world.territories || !world.territories.length) {
      world.territories = generateTerritories(20);
      if (typeof save === "function") save();
    }
  }

  const territories = (typeof world !== "undefined" && world && world.territories)
    ? world.territories
    : [];

  if (!territories.length) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--white-dim);padding:40px;">
      🌍 Chưa có lãnh địa nào. Hãy khai sinh thế giới mới để sinh thành lãnh địa.
    </div>`;
    updateTerritoryStats([]);
    return;
  }

  // Filter
  const filterRegion  = document.getElementById("territoryFilterRegion")?.value || "all";
  const filterDanger  = document.getElementById("territoryFilterDanger")?.value || "all";
  const filterBoss    = document.getElementById("territoryFilterBoss")?.value   || "all";
  const sortBy        = document.getElementById("territorySortBy")?.value       || "id";

  let filtered = territories.slice();
  if (filterRegion !== "all") filtered = filtered.filter(t => t.region === filterRegion);
  if (filterDanger !== "all") filtered = filtered.filter(t => t.dangerLevel === parseInt(filterDanger));
  if (filterBoss   === "yes") filtered = filtered.filter(t => t.bossPresent);
  if (filterBoss   === "no")  filtered = filtered.filter(t => !t.bossPresent);

  // Sort
  const sortMap = {
    id:              (a, b) => a.id.localeCompare(b.id),
    name:            (a, b) => a.name.localeCompare(b.name),
    population:      (a, b) => b.population      - a.population,
    spiritualEnergy: (a, b) => b.spiritualEnergy - a.spiritualEnergy,
    minerals:        (a, b) => b.minerals        - a.minerals,
    herbs:           (a, b) => b.herbs           - a.herbs,
    dangerLevel:     (a, b) => b.dangerLevel     - a.dangerLevel,
  };
  if (sortMap[sortBy]) filtered.sort(sortMap[sortBy]);

  container.innerHTML = filtered.map(t => renderTerritoryCard(t)).join("");
  updateTerritoryStats(territories);
}

function renderTerritoryCard(t) {
  const dangerColor = TERRITORY_DANGER_COLORS[t.dangerLevel] || "#94a3b8";
  const dangerLabel = TERRITORY_DANGER_LABELS[t.dangerLevel] || "";
  const bossTag = t.bossPresent
    ? `<span style="background:#7c3aed;color:#fff;font-size:10px;padding:2px 7px;border-radius:10px;margin-left:6px;">🐉 Boss</span>`
    : "";

  return `
  <div class="card territory-card" style="border-left: 3px solid ${dangerColor}; position:relative;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
      <span style="font-weight:700;font-size:14px;color:var(--gold);">${t.name}</span>
      ${bossTag}
    </div>
    <div style="font-size:12px;color:var(--white-dim);margin-bottom:10px;">${t.region}</div>
    <div class="territory-stats-grid">
      <div class="territory-stat">
        <span class="territory-stat-icon">👥</span>
        <span class="territory-stat-label">Dân Số</span>
        <span class="territory-stat-val">${t.population.toLocaleString()}</span>
      </div>
      <div class="territory-stat">
        <span class="territory-stat-icon">✨</span>
        <span class="territory-stat-label">Linh Khí</span>
        <span class="territory-stat-val" style="color:#c084fc;">${t.spiritualEnergy}</span>
      </div>
      <div class="territory-stat">
        <span class="territory-stat-icon">⚙️</span>
        <span class="territory-stat-label">Khoáng Sản</span>
        <span class="territory-stat-val" style="color:#94a3b8;">${t.minerals}</span>
      </div>
      <div class="territory-stat">
        <span class="territory-stat-icon">🌿</span>
        <span class="territory-stat-label">Thảo Dược</span>
        <span class="territory-stat-val" style="color:#4ade80;">${t.herbs}</span>
      </div>
    </div>
    <div style="margin-top:10px;font-size:11px;font-weight:600;color:${dangerColor};">
      ⚠️ Nguy Hiểm: ${dangerLabel}
    </div>
  </div>`;
}

function updateTerritoryStats(territories) {
  const el = document.getElementById("territoryPanelStats");
  if (!el) return;
  if (!territories.length) { el.textContent = ""; return; }
  const totalPop = territories.reduce((s, t) => s + t.population, 0);
  const bossCount = territories.filter(t => t.bossPresent).length;
  el.textContent = `📊 ${territories.length} lãnh địa · 👥 ${totalPop.toLocaleString()} dân · 🐉 ${bossCount} Boss`;
}

// Populate region filter dropdown dynamically
function populateTerritoryRegionFilter() {
  const sel = document.getElementById("territoryFilterRegion");
  if (!sel) return;
  // Keep "all" option, remove old dynamic options
  while (sel.options.length > 1) sel.remove(1);
  TERRITORY_REGIONS.forEach(r => {
    const opt = document.createElement("option");
    opt.value = r;
    opt.textContent = r;
    sel.appendChild(opt);
  });
}

// ============================
// PANEL INIT (called once on load)
// ============================
function initTerritoryPanel() {
  populateTerritoryRegionFilter();
  renderTerritories();
}
