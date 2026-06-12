/* ============================
   PLAYER AVATAR SYSTEM — V6
   playerSystem.js
   Không chỉnh sửa hệ thống cũ.
   ============================ */

// ============================
// PLAYER STATE
// ============================

let player = null; // null = chưa tạo nhân vật

// ============================
// PLAYER CREATION
// ============================

/**
 * Mở modal tạo nhân vật.
 * Yêu cầu thế giới đã được tạo (world !== null).
 */
function openPlayerCreationModal() {
  if (!world) {
    alert("⚠️ Hãy tạo thế giới trước khi tạo nhân vật!");
    return;
  }

  const roots = ROOTS.map((r, i) => ({
    name: r,
    power: ROOT_POWER[i],
    rarity: i >= 10 ? "legendary" : i >= 8 ? "epic" : i >= 5 ? "rare" : "common",
    desc: _rootDesc(r, ROOT_POWER[i]),
  }));

  const countryOptions = countries
    .map(c => `<option value="${c.name}">${c.name} — ${c.territory}</option>`)
    .join("");

  const familyOptions = getTemplateFamilies()
    .map(f => `<option value="${f}">${f}</option>`)
    .join("");

  const rootCards = roots.map((r, i) => `
    <div class="player-root-card rarity-${r.rarity}" data-idx="${i}" onclick="playerSelectRoot(${i})" id="prc-${i}">
      <div class="prc-name">${r.name}</div>
      <div class="prc-power">${"⭐".repeat(Math.min(r.power, 8))} (×${r.power})</div>
      <div class="prc-rarity">${_rarityLabel(r.rarity)}</div>
      <div class="prc-desc">${r.desc}</div>
    </div>`).join("");

  const html = `
  <div class="player-creation-modal">
    <h2 class="card-title" style="font-size:1.4em;margin-bottom:16px">⚔️ Tạo Nhân Vật</h2>

    <!-- Tên & Giới tính -->
    <div class="player-form-row">
      <div class="player-form-group">
        <label class="player-label">Tên nhân vật</label>
        <input id="pc-name" class="dao-input" placeholder="Nhập tên..." maxlength="20"
          style="width:100%">
      </div>
      <div class="player-form-group" style="flex:0 0 140px">
        <label class="player-label">Giới tính</label>
        <select id="pc-gender" class="dao-select" style="width:100%" onchange="playerGenderChange()">
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
        </select>
      </div>
      <div class="player-form-group" style="flex:0 0 100px">
        <label class="player-label">Tuổi</label>
        <input id="pc-age" class="dao-input" type="number" min="14" max="30" value="18"
          style="width:100%">
      </div>
    </div>

    <!-- Gia tộc & Quốc gia -->
    <div class="player-form-row" style="margin-top:14px">
      <div class="player-form-group">
        <label class="player-label">🏰 Gia Tộc</label>
        <select id="pc-family" class="dao-select" style="width:100%">
          ${familyOptions}
        </select>
      </div>
      <div class="player-form-group">
        <label class="player-label">🌏 Quốc Gia</label>
        <select id="pc-country" class="dao-select" style="width:100%">
          ${countryOptions}
        </select>
      </div>
    </div>

    <!-- Linh Căn -->
    <div style="margin-top:18px">
      <label class="player-label">🌟 Chọn Linh Căn</label>
      <div id="player-root-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;margin-top:8px">
        ${rootCards}
      </div>
      <input type="hidden" id="pc-root-idx" value="0">
    </div>

    <!-- Tính cách (optional) -->
    <div class="player-form-row" style="margin-top:14px">
      <div class="player-form-group">
        <label class="player-label">💬 Tính Cách</label>
        <select id="pc-personality" class="dao-select" style="width:100%">
          ${getTemplatePersonalities().map(p => `<option value="${p}">${p}</option>`).join("")}
        </select>
      </div>
      <div class="player-form-group">
        <label class="player-label">🎯 Mục Tiêu</label>
        <select id="pc-goal" class="dao-select" style="width:100%">
          ${getTemplateGoals().map(g => `<option value="${g}">${g}</option>`).join("")}
        </select>
      </div>
    </div>

    <!-- Tóm tắt stats preview -->
    <div id="pc-stats-preview" class="player-stats-preview" style="margin-top:16px"></div>

    <!-- Buttons -->
    <div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end">
      <button class="btn-secondary" onclick="closeModalBtn()">Hủy</button>
      <button class="btn-primary" onclick="confirmCreatePlayer()">✨ Nhập Thế</button>
    </div>
  </div>`;

  openModal(html);

  // Pre-select first root & update preview
  playerSelectRoot(0);
}

/** Called when gender changes — suggest a name */
function playerGenderChange() {
  // Only suggest if name is currently empty
  const nameEl = document.getElementById("pc-name");
  if (nameEl && !nameEl.value.trim()) {
    const gender = document.getElementById("pc-gender").value;
    const names = gender === "Nam" ? getTemplateNames("male") : getTemplateNames("female");
    nameEl.placeholder = rand(names);
  }
}

function _rootDesc(name, power) {
  const map = {
    "Kim": "Công kích sắc bén, phù hợp kiếm tu.",
    "Mộc": "Hồi phục nhanh, bền bỉ lâu dài.",
    "Thủy": "Linh hoạt, tốc độ cao.",
    "Hỏa": "Sát thương bùng nổ, hung hãn.",
    "Thổ": "Phòng thủ vững chắc, HP cao.",
    "Băng": "Khống chế đối thủ hiệu quả.",
    "Lôi": "Tốc độ đột phá vượt trội.",
    "Phong": "Tốc độ & né tránh siêu cao.",
    "Ánh Sáng": "Thiên phú trời ban, toàn năng.",
    "Hắc Ám": "Bí ẩn, hiệu ứng đặc biệt mạnh.",
    "Thiên Linh Căn": "Thiên phú tối thượng. Đột phá dễ dàng.",
    "Hỗn Độn Căn": "Huyền thoại! Vô song trong thiên hạ.",
  };
  return map[name] || `Linh căn cấp ${power}.`;
}

function _rarityLabel(r) {
  return { common:"Phổ Thông", uncommon:"Thượng Phẩm", rare:"Hiếm", epic:"Sử Thi", legendary:"Huyền Thoại" }[r] || r;
}

/** Highlight selected root card & update stat preview */
function playerSelectRoot(idx) {
  document.querySelectorAll(".player-root-card").forEach(el => el.classList.remove("selected"));
  const card = document.getElementById(`prc-${idx}`);
  if (card) card.classList.add("selected");
  const hidden = document.getElementById("pc-root-idx");
  if (hidden) hidden.value = idx;
  _updatePCStatsPreview(idx);
}

function _updatePCStatsPreview(rootIdx) {
  const rp = ROOT_POWER[Math.min(rootIdx, ROOT_POWER.length - 1)];
  const hp = 100 + rp * 20 + 100; // player bonus
  const mp = 50 + rp * 10;
  const atk = 10 + rp * 3 + 10;
  const def = 5 + rp * 2 + 5;
  const lifespan = 120 + rp * 10 + 50;
  const preview = document.getElementById("pc-stats-preview");
  if (!preview) return;
  preview.innerHTML = `
    <div style="font-size:11px;color:var(--white-dim);margin-bottom:6px">📊 Chỉ số khởi đầu (ước tính)</div>
    <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:12px">
      <span>❤️ HP: <b style="color:#4ade80">${hp}</b></span>
      <span>💙 MP: <b style="color:#60a5fa">${mp}</b></span>
      <span>⚔️ ATK: <b style="color:#f87171">${atk}</b></span>
      <span>🛡️ DEF: <b style="color:#94a3b8">${def}</b></span>
      <span>⏳ Thọ: <b style="color:#facc15">${lifespan}</b></span>
    </div>`;
}

/** Confirm — build player object and inject into simulation */
function confirmCreatePlayer() {
  const nameRaw  = document.getElementById("pc-name").value.trim();
  const gender   = document.getElementById("pc-gender").value;
  const age      = parseInt(document.getElementById("pc-age").value) || 18;
  const family   = document.getElementById("pc-family").value;
  const country  = document.getElementById("pc-country").value;
  const rootIdx  = parseInt(document.getElementById("pc-root-idx").value) || 0;
  const personality = document.getElementById("pc-personality").value;
  const goal     = document.getElementById("pc-goal").value;

  // Nếu tên trống → lấy ngẫu nhiên
  const names = gender === "Nam" ? getTemplateNames("male") : getTemplateNames("female");
  const name = nameRaw || rand(names);

  // Kiểm tra trùng tên trong npcs
  const duplicate = npcs.find(n => n.name.toLowerCase() === name.toLowerCase() && n.status === "alive");
  if (duplicate) {
    alert(`⚠️ Tên "${name}" đã tồn tại trong thế giới. Hãy chọn tên khác!`);
    return;
  }

  const root    = ROOTS[Math.min(rootIdx, ROOTS.length - 1)];
  const rootPwr = ROOT_POWER[Math.min(rootIdx, ROOT_POWER.length - 1)];

  // Xác định region từ country
  const countryObj = countries.find(c => c.name === country);
  const region = countryObj ? countryObj.territory : rand(REGIONS);

  // Tìm tông môn tại region (nếu có)
  const sect = sects.find(s => s.territory === region) || null;

  const id = nextId();

  player = {
    id,
    isPlayer: true,    // Đánh dấu đây là nhân vật người chơi
    name,
    gender,
    age,
    family,
    country,
    city: rand(getTemplateCities()),
    region,
    sectId: sect ? sect.id : null,
    root,
    rootPower: rootPwr,
    realm: 0,
    realmProgress: 0,
    hp:      100 + rootPwr * 20 + 100,
    maxHp:   100 + rootPwr * 20 + 100,
    mp:      50 + rootPwr * 10 + 50,
    maxMp:   50 + rootPwr * 10 + 50,
    attack:  10 + rootPwr * 3 + 10,
    defense: 5  + rootPwr * 2 + 5,
    speed:   15 + rootPwr * 2,
    luck:    50 + rootPwr * 3,
    wealth:  500,
    reputation: 0,
    lifespan: 120 + rootPwr * 10 + 50,
    married: false,
    spouseId: null,
    childrenIds: [],
    parentIds: [],
    masterId: null,
    discipleIds: [],
    inventory: generateStartingInventory(rootPwr + 1), // Người chơi có xuất phát điểm tốt hơn
    equipment: { weapon: null, armor: null, artifact: null },
    artifacts: [], // Bảo vật hệ thống v7
    skills: rootPwr >= 3 ? [rand(SKILLS_POOL)] : [],
    techniques: [],
    titles: [],
    personality,
    goal,
    status: "alive",
    biography: [],
    birthYear: year,
    killCount: 0,
    achievementCount: 0,
    karma: 0,
    fate: rootPwr >= 5 ? "Thiên Mệnh" : (rootPwr >= 2 ? "Bình Thường" : "Bạc Mệnh"),
    isTianJiao: rootPwr >= 5,
    inSecretRealm: false,
    resources: { lingshi: 50, lingyao: 10, xuantie: 5, jingshi: rootPwr >= 3 ? 2 : 0 },
    // Player-specific stats
    pvpWins: 0,
    pvpLosses: 0,
    questsCompleted: 0,
    manualActions: [],   // log các hành động thủ công
  };

  player.biography.push({ year, event: `${name} nhập thế tại ${player.city}, ${country}. Linh căn: ${root}.` });

  // Trang bị tốt nhất trong túi đồ
  autoEquipBestGear(player);

  // Tham gia tông môn
  if (sect) {
    sect.members.push(id);
    sect.disciples.push(id);
    player.biography.push({ year, event: `Gia nhập ${sect.name}.` });
  }

  // Thêm vào danh sách NPC để tham gia simulation
  npcs.push(player);

  // Đăng ký dynasty
  if (typeof registerDynastyMember === "function") registerDynastyMember(player);

  addLog(`🎮 [NGƯỜI CHƠI] ${name} [${root}] nhập thế tại ${country}!`, "important");

  // Lưu trạng thái
  savePlayerState();
  save();
  closeModalBtn();

  // Chuyển sang panel Player
  showPanel("player");
  renderAll();
}

// ============================
// PLAYER TICK (gọi trong simulateWorld)
// ============================

/**
 * Gọi hàm này trong simulateWorld() — nhưng KHÔNG sửa app.js.
 * Thay vào đó, chúng ta dùng MutationObserver + patch nhẹ ở cuối file.
 */
function playerTick() {
  if (!player || player.status !== "alive") return;

  // Đồng bộ object player với npcs array
  // (player đã được push vào npcs, nên các hệ thống combat/cultivate tự xử lý)
  // Ở đây chỉ cần đọc lại ref từ npcs
  const liveRef = npcs.find(n => n.id === player.id);
  if (!liveRef) {
    // Player đã chết
    if (player.status !== "dead") {
      player.status = "dead";
      addLog(`🎮 [NGƯỜI CHƠI] ${player.name} đã tử vong! Game Over.`, "death");
    }
    savePlayerState();
    renderPlayerPanel();
    return;
  }

  // Đồng bộ player ref
  player = liveRef;

  // Ghi nhật ký sự kiện đặc biệt cho player
  if (liveRef.realm > (player._lastLoggedRealm || -1)) {
    player._lastLoggedRealm = liveRef.realm;
    addLog(`🎮🌟 ${liveRef.name} đột phá ${REALMS[liveRef.realm].name}!`, "important");
  }

  savePlayerState();
  renderPlayerPanel();
}

// ============================
// MANUAL ACTIONS
// ============================

/** Hành động: Chủ động tu luyện (tăng EXP nhiều hơn) */
function playerActionCultivate() {
  if (!_checkPlayerAlive()) return;
  const gain = Math.floor((1 + player.rootPower * 0.8 + player.luck * 0.02) * 30);
  player.realmProgress += gain;
  // Kiểm tra đột phá
  const r = REALMS[player.realm];
  if (player.realmProgress >= r.exp && player.realm < REALMS.length - 1) {
    if (chance(r.breakthrough + 0.1)) { // Người chơi có bonus 10%
      player.realm++;
      player.realmProgress = 0;
      applyRealmBonus(player);
      player.biography.push({ year, event: `Chủ động tu luyện, đột phá ${REALMS[player.realm].name}.` });
      addLog(`🎮✨ ${player.name} đột phá ${REALMS[player.realm].name}!`, "breakthrough");
    }
  }
  player.manualActions.push({ year, action: `Tu luyện (+${gain} tiến độ)` });
  _trimManualActions();
  save(); renderPlayerPanel();
  _playerNotify(`Bạn tu luyện và tích lũy ${gain} tiến độ linh khí.`);
}

/** Hành động: Thách đấu ngẫu nhiên NPC cùng tầm */
function playerActionChallenge() {
  if (!_checkPlayerAlive()) return;
  const candidates = npcs.filter(n =>
    n.id !== player.id &&
    n.status === "alive" &&
    !n.isPlayer &&
    Math.abs(n.realm - player.realm) <= 1
  );
  if (!candidates.length) {
    _playerNotify("Không tìm được đối thủ phù hợp lúc này."); return;
  }
  const target = rand(candidates);
  const origHp = target.hp;
  combat(player, target);

  if (target.status === "dead") {
    player.pvpWins++;
    player.biography.push({ year, event: `Thách đấu và đánh bại ${target.name} [${REALMS[target.realm < REALMS.length ? target.realm : REALMS.length-1].name}].` });
    player.manualActions.push({ year, action: `Thắng trận vs ${target.name}` });
    _playerNotify(`⚔️ Bạn đã hạ ${target.name}!`);
  } else {
    player.pvpLosses++;
    player.manualActions.push({ year, action: `Thua trận vs ${target.name}` });
    _playerNotify(`⚔️ Giao chiến với ${target.name} — ${target.name} còn ${target.hp}/${target.maxHp} HP.`);
  }
  _trimManualActions();
  save(); renderPlayerPanel();
}

/** Hành động: Thu thập tài nguyên */
function playerActionGather() {
  if (!_checkPlayerAlive()) return;
  const regionObj = regions.find(r => r.name === player.region);
  if (!regionObj) { _playerNotify("Không tìm thấy vùng đất."); return; }

  let gathered = [];
  Object.keys(regionObj.resources).forEach(key => {
    if (regionObj.resources[key] <= 0) return;
    const amt = randInt(2, 5 + player.rootPower * 2);
    const take = Math.min(amt, regionObj.resources[key]);
    regionObj.resources[key] -= take;
    if (!player.resources) player.resources = { lingshi:0, lingyao:0, xuantie:0, jingshi:0 };
    player.resources[key] = (player.resources[key] || 0) + take;
    if (take > 0) gathered.push(`${RESOURCES[key].icon}${RESOURCES[key].name} ×${take}`);
  });

  if (gathered.length) {
    const msg = `Thu thập: ${gathered.join(", ")}`;
    player.manualActions.push({ year, action: msg });
    _playerNotify(`🌿 ${msg}`);
  } else {
    _playerNotify("Vùng này đã cạn tài nguyên. Thử sang vùng khác.");
  }
  _trimManualActions();
  save(); renderPlayerPanel();
}

/** Hành động: Di chuyển đến vùng khác */
function playerActionMove() {
  if (!_checkPlayerAlive()) return;
  const otherRegions = REGIONS.filter(r => r !== player.region);
  if (!otherRegions.length) return;

  const html = `
    <div style="padding:8px">
      <h3 class="card-title" style="margin-bottom:12px">🗺️ Chọn Vùng Đất</h3>
      ${otherRegions.map(r => `
        <div class="player-action-choice" onclick="playerConfirmMove('${r}')">
          <b>${r}</b>
        </div>`).join("")}
      <button class="btn-secondary" style="margin-top:12px;width:100%" onclick="closeModalBtn()">Hủy</button>
    </div>`;
  openModal(html);
}

function playerConfirmMove(regionName) {
  if (!player) return;
  const old = player.region;
  player.region = regionName;
  // Update country accordingly
  const cObj = countries.find(c => c.territory === regionName);
  if (cObj) player.country = cObj.name;

  player.biography.push({ year, event: `Di chuyển từ ${old} đến ${regionName}.` });
  player.manualActions.push({ year, action: `Di chuyển → ${regionName}` });
  _trimManualActions();
  closeModalBtn();
  save(); renderPlayerPanel();
  _playerNotify(`🗺️ Bạn đã di chuyển đến ${regionName}.`);
}

/** Hành động: Xem chi tiết / Mở NPC modal của player */
function playerViewDetail() {
  if (!player) return;
  if (typeof openNPCModal === "function") openNPCModal(player.id);
}

/** Hành động: Gia nhập tông môn */
function playerActionJoinSect() {
  if (!_checkPlayerAlive()) return;
  const available = sects.filter(s =>
    s.members.length > 0 &&
    (s.territory === player.region || true) // Có thể gia nhập bất cứ tông nào
  );
  if (!available.length) { _playerNotify("Không có tông môn nào khả dụng."); return; }

  const html = `
    <div style="padding:8px">
      <h3 class="card-title" style="margin-bottom:12px">🏯 Chọn Tông Môn</h3>
      ${available.map(s => `
        <div class="player-action-choice" onclick="playerConfirmJoinSect('${s.id}')">
          <b>${s.name}</b>
          <span style="color:var(--white-dim);font-size:12px">
            ${s.territory} — ${s.members.length} thành viên — uy danh ${s.prestige}
          </span>
        </div>`).join("")}
      <button class="btn-secondary" style="margin-top:12px;width:100%" onclick="closeModalBtn()">Hủy</button>
    </div>`;
  openModal(html);
}

function playerConfirmJoinSect(sectId) {
  if (!player) return;
  // Rời tông cũ
  if (player.sectId) {
    const old = sects.find(s => s.id === player.sectId);
    if (old) {
      old.members  = old.members.filter(id => id !== player.id);
      old.disciples = old.disciples.filter(id => id !== player.id);
    }
  }
  const sect = sects.find(s => s.id === sectId);
  if (!sect) { closeModalBtn(); return; }
  sect.members.push(player.id);
  sect.disciples.push(player.id);
  player.sectId = sectId;
  player.biography.push({ year, event: `Gia nhập ${sect.name}.` });
  player.manualActions.push({ year, action: `Gia nhập ${sect.name}` });
  _trimManualActions();
  closeModalBtn();
  save(); renderAll();
  _playerNotify(`🏯 Bạn đã gia nhập ${sect.name}!`);
}

// ============================
// PLAYER PANEL RENDER
// ============================

function renderPlayerPanel() {
  const panel = document.getElementById("panel-player");
  if (!panel) return;
  if (!panel.classList.contains("active")) return; // chỉ render khi đang xem

  if (!world) {
    panel.innerHTML = `<div class="card" style="text-align:center;padding:40px">
      <div style="font-size:2em;margin-bottom:12px">🌍</div>
      <div style="color:var(--white-dim)">Hãy tạo thế giới trước.</div>
    </div>`;
    return;
  }

  if (!player || player.status === "dead") {
    panel.innerHTML = `<div class="card" style="text-align:center;padding:40px">
      ${player && player.status === "dead" ? `
        <div style="font-size:2.5em;margin-bottom:12px">☠️</div>
        <div style="font-size:1.2em;color:#f87171;margin-bottom:8px">${player.name} đã tử vong</div>
        <div style="color:var(--white-dim);margin-bottom:16px">${player.deathReason || ""} (Năm ${player.deathYear || year})</div>
        <div style="color:var(--white-dim);margin-bottom:20px">Cảnh giới đạt được: ${REALMS[Math.min(player.realm, REALMS.length-1)].name}</div>
      ` : `
        <div style="font-size:2.5em;margin-bottom:12px">⚔️</div>
        <div style="font-size:1.1em;color:var(--white);margin-bottom:16px">Chưa có nhân vật</div>
      `}
      <button class="btn-primary" onclick="openPlayerCreationModal()">
        ${player && player.status === "dead" ? "🔄 Tái Sinh" : "✨ Tạo Nhân Vật"}
      </button>
    </div>`;
    return;
  }

  const p = player;
  const realm = REALMS[Math.min(p.realm, REALMS.length - 1)];
  const nextRealm = REALMS[Math.min(p.realm + 1, REALMS.length - 1)];
  const expPct = realm.exp === Infinity ? 100 : Math.floor((p.realmProgress / realm.exp) * 100);
  const hpPct  = Math.floor((p.hp / p.maxHp) * 100);
  const mpPct  = Math.floor((p.mp / p.maxMp) * 100);

  const sect = p.sectId ? sects.find(s => s.id === p.sectId) : null;

  const inventoryHtml = (p.inventory || []).slice(0, 8).map(item =>
    `<span class="inv-item rarity-${item.rarity}" title="${item.name}">${item.icon || "📦"} ${item.name}</span>`
  ).join("") || `<span style="color:var(--white-dim)">Trống</span>`;

  const equipHtml = Object.entries(p.equipment || {}).map(([slot, item]) =>
    item
      ? `<div class="player-equip-slot equipped"><span>${item.icon || "🔷"}</span><span class="equip-name">${item.name}</span></div>`
      : `<div class="player-equip-slot empty"><span>${slot === "weapon" ? "⚔️" : slot === "armor" ? "🛡️" : "💎"}</span><span style="color:var(--white-dim)">${slot === "weapon" ? "Vũ Khí" : slot === "armor" ? "Giáp" : "Linh Bảo"}</span></div>`
  ).join("");

  const resourcesHtml = Object.entries(p.resources || {}).map(([k, v]) =>
    `<span>${RESOURCES[k]?.icon || "💠"} ${v}</span>`
  ).join(" ");

  const actionsLog = (p.manualActions || []).slice(-5).reverse().map(a =>
    `<div class="player-action-log-item">Năm ${a.year}: ${a.action}</div>`
  ).join("") || `<div style="color:var(--white-dim);font-size:12px">Chưa có hành động.</div>`;

  const biographyHtml = (p.biography || []).slice(-6).reverse().map(b =>
    `<div class="player-bio-item"><span class="ch-year">Năm ${b.year}</span> ${b.event}</div>`
  ).join("");

  panel.innerHTML = `
  <div class="player-panel-grid">

    <!-- ========== CARD NHÂN VẬT ========== -->
    <div class="card player-main-card">
      <div class="player-header">
        <div class="player-avatar">${p.gender === "Nam" ? "🧙" : "🧝"}</div>
        <div class="player-header-info">
          <div class="player-name">${p.name}
            ${p.isTianJiao ? `<span class="player-badge tianJiao">☆ Thiên Kiêu</span>` : ""}
            ${p.titles.length ? `<span class="player-badge title">${p.titles[0]}</span>` : ""}
          </div>
          <div class="player-realm-label">${realm.name}</div>
          <div class="player-meta">${p.gender} · ${p.family} tộc · ${p.country} · ${p.region}</div>
          <div class="player-meta">${p.root} Linh Căn ×${p.rootPower} · ${p.personality} · ${p.goal}</div>
        </div>
      </div>

      <!-- HP/MP bars -->
      <div class="player-bars">
        <div class="player-bar-row">
          <span class="bar-label">❤️ HP</span>
          <div class="bar-track"><div class="bar-fill hp-fill" style="width:${hpPct}%"></div></div>
          <span class="bar-val">${p.hp}/${p.maxHp}</span>
        </div>
        <div class="player-bar-row">
          <span class="bar-label">💙 MP</span>
          <div class="bar-track"><div class="bar-fill mp-fill" style="width:${mpPct}%"></div></div>
          <span class="bar-val">${p.mp}/${p.maxMp}</span>
        </div>
        <div class="player-bar-row">
          <span class="bar-label">✨ EXP</span>
          <div class="bar-track"><div class="bar-fill exp-fill" style="width:${expPct}%"></div></div>
          <span class="bar-val">${realm.exp === Infinity ? "MAX" : `${p.realmProgress}/${realm.exp}`}</span>
        </div>
      </div>

      <!-- Stats grid -->
      <div class="player-stats-grid">
        <div class="pstat"><span class="pstat-icon">⚔️</span><span class="pstat-val">${p.attack}</span><span class="pstat-label">Công</span></div>
        <div class="pstat"><span class="pstat-icon">🛡️</span><span class="pstat-val">${p.defense}</span><span class="pstat-label">Thủ</span></div>
        <div class="pstat"><span class="pstat-icon">⚡</span><span class="pstat-val">${p.speed}</span><span class="pstat-label">Tốc</span></div>
        <div class="pstat"><span class="pstat-icon">🍀</span><span class="pstat-val">${p.luck}</span><span class="pstat-label">Vận</span></div>
        <div class="pstat"><span class="pstat-icon">💰</span><span class="pstat-val">${p.wealth}</span><span class="pstat-label">Phú</span></div>
        <div class="pstat"><span class="pstat-icon">⭐</span><span class="pstat-val">${p.reputation}</span><span class="pstat-label">Danh</span></div>
        <div class="pstat"><span class="pstat-icon">🎂</span><span class="pstat-val">${p.age}</span><span class="pstat-label">Tuổi</span></div>
        <div class="pstat"><span class="pstat-icon">⏳</span><span class="pstat-val">${p.lifespan}</span><span class="pstat-label">Thọ</span></div>
      </div>

      <!-- PvP & Resources -->
      <div class="player-secondary-stats">
        <span>⚔️ Thắng: <b style="color:#4ade80">${p.pvpWins}</b></span>
        <span>☠️ Thua: <b style="color:#f87171">${p.pvpLosses}</b></span>
        <span>☠️ Đã giết: <b style="color:#facc15">${p.killCount}</b></span>
        ${sect ? `<span>🏯 ${sect.name}</span>` : `<span style="color:var(--white-dim)">Vô môn phái</span>`}
      </div>
      <div class="player-resources">${resourcesHtml}</div>
    </div>

    <!-- ========== HÀNH ĐỘNG ========== -->
    <div class="card">
      <h3 class="card-title">🎮 Hành Động</h3>
      <div class="player-actions-grid">
        <button class="player-action-btn cultivate" onclick="playerActionCultivate()">
          ✨<span>Tu Luyện</span>
        </button>
        <button class="player-action-btn challenge" onclick="playerActionChallenge()">
          ⚔️<span>Thách Đấu</span>
        </button>
        <button class="player-action-btn gather" onclick="playerActionGather()">
          🌿<span>Thu Thập</span>
        </button>
        <button class="player-action-btn move" onclick="playerActionMove()">
          🗺️<span>Di Chuyển</span>
        </button>
        <button class="player-action-btn sect" onclick="playerActionJoinSect()">
          🏯<span>Tông Môn</span>
        </button>
        <button class="player-action-btn detail" onclick="playerViewDetail()">
          📋<span>Chi Tiết</span>
        </button>
      </div>

      <!-- Kỹ năng -->
      <div style="margin-top:14px">
        <div style="font-size:12px;color:var(--white-dim);margin-bottom:6px">📖 Kỹ Năng</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${p.skills.length
            ? p.skills.map(s => `<span class="skill-tag">${s}</span>`).join("")
            : `<span style="color:var(--white-dim);font-size:12px">Chưa có kỹ năng.</span>`}
        </div>
      </div>

      <!-- Nhật ký hành động -->
      <div style="margin-top:14px">
        <div style="font-size:12px;color:var(--white-dim);margin-bottom:6px">📝 Nhật Ký Gần Đây</div>
        <div class="player-action-log">${actionsLog}</div>
      </div>
    </div>

    <!-- ========== TRANG BỊ ========== -->
    <div class="card">
      <h3 class="card-title">⚔️ Trang Bị & Túi Đồ</h3>
      <div class="player-equip-grid">${equipHtml}</div>
      <div style="margin-top:12px">
        <div style="font-size:12px;color:var(--white-dim);margin-bottom:6px">🎒 Túi đồ (${(p.inventory||[]).length} vật phẩm)</div>
        <div class="player-inventory">${inventoryHtml}</div>
      </div>
    </div>

    <!-- ========== TIỂU SỬ ========== -->
    <div class="card">
      <h3 class="card-title">📜 Tiểu Sử</h3>
      <div class="player-biography">${biographyHtml}</div>
    </div>

  </div>

  <!-- Notification area -->
  <div id="playerNotifArea" class="player-notif-area"></div>
  `;
}

// ============================
// PERSISTENCE
// ============================

function savePlayerState() {
  try {
    if (player) {
      localStorage.setItem("cgv6_player", JSON.stringify(player));
    } else {
      localStorage.removeItem("cgv6_player");
    }
  } catch(e) { console.warn("Player save failed:", e); }
}

function loadPlayerState() {
  try {
    const raw = localStorage.getItem("cgv6_player");
    if (!raw) return;
    player = JSON.parse(raw);
    if (player) {
      // Đảm bảo player đang trong danh sách npcs (sau khi load)
      const existing = npcs.find(n => n.id === player.id);
      if (!existing && player.status === "alive") {
        npcs.push(player);
      } else if (existing) {
        // Giữ ref đồng bộ
        player = existing;
      }
    }
  } catch(e) {
    console.warn("Player load failed:", e);
    player = null;
  }
}

// ============================
// HOOK VÀO SIM (không sửa app.js)
// ============================
// Patch simulateWorld để gọi playerTick sau mỗi năm
(function patchSimulateWorld() {
  // Đợi app.js load xong
  document.addEventListener("DOMContentLoaded", function() {
    // Wrap simulateWorld
    const _origSimulate = window.simulateWorld;
    if (typeof _origSimulate === "function") {
      window.simulateWorld = function() {
        _origSimulate.call(this);
        playerTick();
      };
    }

    // Wrap save để include player
    const _origSave = window.save;
    if (typeof _origSave === "function") {
      window.save = function() {
        _origSave.call(this);
        savePlayerState();
      };
    }

    // Wrap load để include player
    const _origLoad = window.load;
    if (typeof _origLoad === "function") {
      window.load = function() {
        _origLoad.call(this);
        loadPlayerState();
      };
    }

    // Wrap renderAll để render player panel
    const _origRenderAll = window.renderAll;
    if (typeof _origRenderAll === "function") {
      window.renderAll = function() {
        _origRenderAll.call(this);
        renderPlayerPanel();
      };
    }
  });
})();

// ============================
// HELPER UTILS
// ============================

function _checkPlayerAlive() {
  if (!player || player.status !== "alive") {
    _playerNotify("Nhân vật đã tử vong hoặc chưa được tạo.");
    return false;
  }
  if (!world) {
    _playerNotify("Chưa có thế giới.");
    return false;
  }
  return true;
}

function _trimManualActions() {
  if (player && player.manualActions && player.manualActions.length > 50) {
    player.manualActions = player.manualActions.slice(-50);
  }
}

let _playerNotifTimer = null;
function _playerNotify(msg) {
  // Cố gắng hiển thị trong panel nếu đang active, không thì dùng addLog
  const area = document.getElementById("playerNotifArea");
  if (area) {
    area.textContent = msg;
    area.style.opacity = "1";
    clearTimeout(_playerNotifTimer);
    _playerNotifTimer = setTimeout(() => { area.style.opacity = "0"; }, 3500);
  } else {
    addLog(`🎮 ${msg}`);
  }
}
