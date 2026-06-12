// ============================================================
// NOBLE HOUSE ENGINE V23
// CREATOR GOD — V23 EMPIRE & KINGDOM ENGINE
// Hệ thống Gia Tộc Quý Tộc — Noble Houses, Liên Minh, Phản Loạn
// Tương thích 100% save cũ — KHÔNG xóa dữ liệu
// ============================================================

const NH_SAVE_KEY = "cgv6_noble_houses";
const NH_VERSION  = 23;

const NH_DEFAULT_HOUSES = [
  { nameKey:"Dragon", icon:"🐉", color:"#f87171", motto:"Lửa Thiêu Vạn Giới" },
  { nameKey:"Phoenix", icon:"🦅", color:"#fb923c", motto:"Tái Sinh Từ Tro Tàn" },
  { nameKey:"Tiger",   icon:"🐯", color:"#facc15", motto:"Mãnh Hổ Hạ Sơn" },
  { nameKey:"Azure",   icon:"🌊", color:"#60a5fa", motto:"Nước Chảy Muôn Nơi" },
  { nameKey:"Wolf",    icon:"🐺", color:"#94a3b8", motto:"Đơn Độc Xuyên Gió Bắc" },
  { nameKey:"Crimson", icon:"🌹", color:"#c084fc", motto:"Máu Đỏ Vạn Đời" },
];

const NH_ACTIONS = [
  { id:"support",  label:"Ủng hộ Vua",    weight:30, emoji:"🤝" },
  { id:"rebel",    label:"Phản Loạn",      weight:10, emoji:"🔥" },
  { id:"ally",     label:"Liên Minh",      weight:25, emoji:"🤝" },
  { id:"war",      label:"Chiến Tranh",    weight:10, emoji:"⚔️" },
  { id:"trade",    label:"Thương Mại",     weight:25, emoji:"💰" },
];

const NH_HERO_FIRST  = ["Long","Hắc","Thiên","Phượng","Lôi","Kim","Ngọc","Huyền","Tử","Minh"];
const NH_HERO_LAST   = ["Phàm","Vũ","Kiếm","Long","Thiên","Hào","Phong","Đế","Vương","Tôn"];

// ── INIT ──
function nhInit() {
  if (!window.nobleHouseData) {
    const saved = localStorage.getItem(NH_SAVE_KEY);
    window.nobleHouseData = saved ? JSON.parse(saved) : {
      houses:    {},
      history:   [],
      idCounter: 0,
      version:   NH_VERSION,
    };
  }
  if (!window.nobleHouseData.houses)    window.nobleHouseData.houses    = {};
  if (!window.nobleHouseData.history)   window.nobleHouseData.history   = [];
  if (!window.nobleHouseData.idCounter) window.nobleHouseData.idCounter = 0;

  // Sinh các nhà mặc định nếu chưa có
  if (Object.keys(window.nobleHouseData.houses).length === 0) {
    NH_DEFAULT_HOUSES.forEach(h => nhCreateHouse(h));
  }
}

function nhSave() {
  try { localStorage.setItem(NH_SAVE_KEY, JSON.stringify(window.nobleHouseData)); } catch(e) {}
}

// ── Tạo noble house ──
function nhCreateHouse(opts) {
  if (!window.nobleHouseData) nhInit();
  const hId   = "nh" + (++window.nobleHouseData.idCounter);
  const name  = `House ${opts.nameKey || "Unknown"}`;
  const house = {
    houseId:     hId,
    houseName:   name,
    nameKey:     opts.nameKey || hId,
    icon:        opts.icon || "🏛️",
    color:       opts.color || "#94a3b8",
    motto:       opts.motto || "Vinh Quang Muôn Đời",
    land:        Math.floor(Math.random() * 50 + 10),
    wealth:      Math.floor(Math.random() * 80000 + 20000),
    military:    Math.floor(Math.random() * 10000 + 2000),
    influence:   Math.floor(Math.random() * 80 + 20),
    reputation:  Math.floor(Math.random() * 60 + 40),
    loyalty:     Math.floor(Math.random() * 60 + 40),
    currentAction:null,
    lastAction:   null,
    allies:       [],
    enemies:      [],
    heroes:       [],
    kingdomId:    null,
    empireId:     null,
    isExtinct:    false,
    yearFounded:  (window.year || 0) - Math.floor(Math.random() * 200),
    history:      [],
    rebellionCooldown: 0,
  };

  // Sinh 1-3 anh hùng
  const heroCount = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < heroCount; i++) {
    house.heroes.push(nhGenerateHero(house));
  }

  window.nobleHouseData.houses[hId] = house;
  return house;
}

// ── Sinh anh hùng ──
function nhGenerateHero(house) {
  return {
    name:     _nhRandItem(NH_HERO_FIRST) + " " + _nhRandItem(NH_HERO_LAST),
    age:      Math.floor(Math.random() * 40 + 20),
    power:    Math.floor(Math.random() * 100),
    loyalty:  Math.floor(Math.random() * 100),
    isDead:   false,
  };
}

// ── TICK ──
function nhTick() {
  if (!window.nobleHouseData) return;
  const year = window.year || 0;

  Object.values(window.nobleHouseData.houses).forEach(house => {
    if (house.isExtinct) return;

    // Tự nhiên tăng trưởng
    house.wealth    += Math.floor(house.land * 50 * (house.reputation / 100));
    house.influence += Math.floor(house.reputation / 20);

    if (house.rebellionCooldown > 0) house.rebellionCooldown--;

    // Quyết định hành động
    nhDecideAction(house, year);

    // Tuyệt chủng nếu military = 0 và wealth < 0
    if (house.military <= 0 && house.wealth < 0) {
      house.isExtinct = true;
      const msg = `💀 Gia tộc ${house.houseName} tuyệt diệt!`;
      if (typeof addLog === "function") addLog(msg, "death");
      if (typeof htAddEvent === "function") htAddEvent({ year, type: "house_extinct", text: msg });
    }
  });

  // Mỗi 25 năm sinh gia tộc mới
  const activeCount = Object.values(window.nobleHouseData.houses).filter(h => !h.isExtinct).length;
  if (year > 0 && year % 25 === 0 && activeCount < 10) {
    const icons  = ["⚔️","🌟","🔥","💎","🌙","☀️","🐲","🦁"];
    const colors = ["#f87171","#60a5fa","#4ade80","#c084fc","#facc15","#fb923c"];
    const names  = ["Iron","Shadow","Storm","Jade","Golden","Silver","Dark","Bright","Ancient","Mystic"];
    nhCreateHouse({
      nameKey: _nhRandItem(names),
      icon:    _nhRandItem(icons),
      color:   _nhRandItem(colors),
      motto:   "Huy Hoàng Vạn Đại",
    });
    const msg = `🏛️ Gia tộc quý tộc mới xuất hiện trong thế giới!`;
    if (typeof addLog === "function") addLog(msg, "info");
    if (typeof htAddEvent === "function") htAddEvent({ year, type: "house_founded", text: msg });
  }

  nhSave();
}

function nhDecideAction(house, year) {
  // Weighted random action
  const roll = Math.random() * 100;

  if (roll < 15 && house.loyalty < 40 && house.rebellionCooldown <= 0) {
    // Phản loạn
    house.currentAction = "rebel";
    house.military = Math.floor(house.military * 0.8);
    house.loyalty  = Math.max(0, house.loyalty - 20);
    house.rebellionCooldown = 10;
    const msg = `🔥 ${house.houseName} ${house.icon} nổi dậy phản loạn!`;
    if (typeof addLog === "function") addLog(msg, "death");
    if (typeof htAddEvent === "function") htAddEvent({ year, type: "house_rebel", text: msg });
    house.history.push({ year, event: msg });

  } else if (roll < 35) {
    // Thương mại
    house.currentAction = "trade";
    house.wealth += Math.floor(Math.random() * 10000 + 5000);
    house.influence += 5;

  } else if (roll < 50) {
    // Ủng hộ vua
    house.currentAction = "support";
    house.loyalty = Math.min(100, house.loyalty + 5);
    house.reputation = Math.min(100, house.reputation + 3);

  } else if (roll < 65) {
    // Liên minh
    house.currentAction = "ally";
    const houses = Object.values(window.nobleHouseData.houses).filter(h => !h.isExtinct && h.houseId !== house.houseId);
    if (houses.length > 0) {
      const target = _nhRandItem(houses);
      if (!house.allies.includes(target.houseId)) {
        house.allies.push(target.houseId);
        target.allies.push(house.houseId);
      }
    }

  } else if (roll < 75 && house.military > 5000) {
    // Chiến tranh
    house.currentAction = "war";
    const enemies = Object.values(window.nobleHouseData.houses).filter(h =>
      !h.isExtinct && h.houseId !== house.houseId && !house.allies.includes(h.houseId)
    );
    if (enemies.length > 0) {
      const target = _nhRandItem(enemies);
      if (!house.enemies.includes(target.houseId)) {
        house.enemies.push(target.houseId);
        target.enemies.push(house.houseId);
      }
      const won = house.military > target.military;
      if (won) {
        house.wealth   += Math.floor(target.wealth * 0.2);
        target.wealth  -= Math.floor(target.wealth * 0.2);
        target.military = Math.floor(target.military * 0.7);
        house.reputation = Math.min(100, house.reputation + 10);
      } else {
        house.military = Math.floor(house.military * 0.8);
      }
      const msg = `⚔️ ${house.houseName} giao chiến với ${target.houseName}! ${won ? house.houseName + " giành chiến thắng!" : "Trận chiến bất phân thắng bại!"}`;
      if (typeof htAddEvent === "function") htAddEvent({ year, type: "house_war", text: msg });
    }

  } else {
    // Củng cố lực lượng
    house.currentAction = "consolidate";
    house.military = Math.floor(house.military * 1.05);
  }
}

// ── Thống kê ──
function nhGetActiveHouses() {
  if (!window.nobleHouseData) return [];
  return Object.values(window.nobleHouseData.houses).filter(h => !h.isExtinct);
}

// ── RENDER PANEL ──
function nhRenderPanel() {
  const panel = document.getElementById("panel-noble-houses");
  if (!panel) return;
  if (!window.nobleHouseData) nhInit();

  const houses = nhGetActiveHouses();

  panel.innerHTML = `
    <div class="panel-toolbar">
      <button class="btn-primary" onclick="nhCreateHouse({nameKey:'New House '+Date.now().toString().slice(-4),icon:'⚔️',color:'#facc15',motto:'Huy Hoàng Vĩnh Cửu'});nhRenderPanel()">🏛️ Thêm Gia Tộc</button>
      <button class="btn-secondary" onclick="nhRenderPanel()">🔄 Làm Mới</button>
      <span style="margin-left:auto;font-size:12px;color:var(--white-dim)">${houses.length} gia tộc đang hoạt động</span>
    </div>

    <div class="panel-grid">
      ${houses.length === 0 ? `
        <div class="card span-full" style="text-align:center;padding:40px;color:var(--white-dim)">
          <div style="font-size:48px;margin-bottom:12px">🏛️</div>
          <div>Chưa có gia tộc quý tộc nào.</div>
        </div>
      ` : houses.map(h => nhRenderHouseCard(h)).join("")}
    </div>
  `;
}

function nhRenderHouseCard(h) {
  const actionEmoji = NH_ACTIONS.find(a => a.id === h.currentAction)?.emoji || "💤";
  const actionLabel = NH_ACTIONS.find(a => a.id === h.currentAction)?.label || "Chờ đợi";
  return `
    <div class="card" style="border-left:3px solid ${h.color}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <div style="width:44px;height:44px;border-radius:10px;background:${h.color}18;border:1px solid ${h.color}44;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${h.icon}</div>
        <div style="flex:1">
          <div style="font-family:var(--font-title);font-size:14px;color:var(--white-main)">${h.houseName}</div>
          <div style="font-size:10px;color:var(--white-dim);font-style:italic">"${h.motto}"</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:10px;color:var(--white-dim)">Hành động</div>
          <div style="font-size:11px;color:${h.color}">${actionEmoji} ${actionLabel}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:10px">
        ${[
          ["🏔️","Đất đai",h.land+"vùng"],
          ["💰","Tài sản",(h.wealth/1000).toFixed(0)+"K"],
          ["⚔️","Quân sự",(h.military/1000).toFixed(1)+"K"],
          ["🌟","Ảnh hưởng",h.influence+""],
        ].map(([icon,label,val]) => `
          <div style="background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.06);border-radius:7px;padding:7px 4px;text-align:center">
            <div style="font-size:12px;margin-bottom:2px">${icon}</div>
            <div style="font-size:12px;font-weight:700;color:var(--white-main)">${val}</div>
            <div style="font-size:8px;color:var(--white-dim)">${label}</div>
          </div>
        `).join("")}
      </div>

      ${[
        ["Danh tiếng", h.reputation, "#4ade80"],
        ["Trung thành", h.loyalty, "#60a5fa"],
      ].map(([label,val,color]) => `
        <div style="display:grid;grid-template-columns:70px 1fr 30px;align-items:center;gap:6px;margin-bottom:4px">
          <span style="font-size:10px;color:var(--white-dim)">${label}</span>
          <div style="height:4px;background:rgba(255,255,255,0.05);border-radius:3px;overflow:hidden">
            <div style="height:100%;width:${val}%;background:${color};border-radius:3px"></div>
          </div>
          <span style="font-size:10px;color:var(--white-dim);text-align:right">${val}</span>
        </div>
      `).join("")}

      <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px">
        ${h.heroes.filter(hero => !hero.isDead).map(hero => `
          <span style="font-size:10px;padding:2px 8px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:var(--white-dim)">
            ⚔️ ${hero.name} (Lực: ${hero.power})
          </span>
        `).join("")}
      </div>

      ${h.allies.length > 0 ? `<div style="margin-top:6px;font-size:10px;color:#4ade80">🤝 Đồng minh: ${h.allies.length} gia tộc</div>` : ""}
      ${h.enemies.length > 0 ? `<div style="font-size:10px;color:#f87171">⚔️ Thù địch: ${h.enemies.length} gia tộc</div>` : ""}
    </div>
  `;
}

function _nhRandItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function nhShowNavBtn() {
  const btn = document.querySelector('.nav-btn[data-panel="noble-houses"]');
  if (btn) { btn.style.display = ""; btn.classList.remove("ec-hidden"); }
}

document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    nhInit();
    nhShowNavBtn();
    setInterval(function() {
      if (window.world) {
        nhTick();
        const active = document.querySelector('.nav-btn.active[data-panel="noble-houses"]');
        if (active) nhRenderPanel();
      }
    }, 9000);
  }, 2000);
});

// ============================================================
// NOBLE HOUSE ENGINE V23 — EXPANSION PACK
// House Rivalries, Treasury Upkeep, War Triggers, Alliances
// EXPAND ONLY — không xóa dữ liệu cũ
// ============================================================

// ── Đảm bảo trường mở rộng tồn tại ──
function nhEnsureExtended(h) {
  if (!h.rivals)       h.rivals       = [];
  if (!h.allies)       h.allies       = [];
  if (!h.warCount)     h.warCount     = 0;
  if (!h.upkeepCost)   h.upkeepCost   = Math.floor((h.wealth || 10000) * 0.02);
  if (!h.gloryPoints)  h.gloryPoints  = 0;
  if (!h.marriages)    h.marriages    = [];
  if (!h.claimCount)   h.claimCount   = 0;
}

// ── Chi phí duy trì gia tộc ──
function nhPayUpkeep(h) {
  if (!h || h.isExtinct) return;
  nhEnsureExtended(h);
  const upkeep = Math.floor((h.wealth || 10000) * 0.015 + h.members * 200);
  if (h.wealth >= upkeep) {
    h.wealth    -= upkeep;
    h.influence  = Math.min(100, (h.influence || 20) + 1);
  } else {
    // Không đủ tiền — mất ảnh hưởng
    h.wealth     = Math.max(0, h.wealth - upkeep);
    h.influence  = Math.max(0, (h.influence || 20) - 5);
    h.prestige   = Math.max(0, (h.prestige || 50) - 3);
    if ((h.influence || 0) <= 0 && (h.prestige || 0) <= 0) {
      h.isExtinct = true;
      const msg = `💀 Gia tộc ${h.houseName} sụp đổ vì kiệt quệ tài chính!`;
      if (typeof addLog === "function") addLog(msg, "death");
      if (typeof htAddEvent === "function") htAddEvent({ type:"house_extinct", text: msg });
    }
  }
}

// ── Cạnh tranh giữa các gia tộc ──
function nhRivalryTick(h, allHouses) {
  if (!h || h.isExtinct || !allHouses) return;
  nhEnsureExtended(h);

  // Kiếm kẻ thù tự nhiên nếu chưa có
  if (h.rivals.length < 2) {
    const others = allHouses.filter(o =>
      !o.isExtinct &&
      o.houseId !== h.houseId &&
      !h.rivals.includes(o.houseId) &&
      !h.allies.includes(o.houseId)
    );
    if (others.length > 0) {
      // Gia tộc cùng phe chính trị có cơ hội thù địch
      const rival = others.find(o => o.faction === h.faction && o.houseId !== h.houseId)
                 || others[Math.floor(Math.random() * others.length)];
      if (rival && Math.random() < 0.05) {
        h.rivals.push(rival.houseId);
        rival.rivals = rival.rivals || [];
        rival.rivals.push(h.houseId);
        const msg = `⚔️ Gia tộc ${h.houseName} và ${rival.houseName} trở thành kẻ thù!`;
        if (typeof addLog === "function") addLog(msg, "info");
        if (typeof htAddEvent === "function") htAddEvent({ type:"house_rivalry", text: msg });
        if (typeof _we_setMutualRelation === "function") {
          try { _we_setMutualRelation(h.houseId, rival.houseId, "hostile"); } catch(e2) {}
        }
      }
    }
  }

  // Liên minh gia tộc
  if (h.allies.length < 3 && Math.random() < 0.04) {
    const freeHouses = allHouses.filter(o =>
      !o.isExtinct &&
      o.houseId !== h.houseId &&
      !h.rivals.includes(o.houseId) &&
      !h.allies.includes(o.houseId) &&
      (o.prestige || 50) > 40
    );
    if (freeHouses.length > 0) {
      const ally = freeHouses[Math.floor(Math.random() * freeHouses.length)];
      h.allies.push(ally.houseId);
      ally.allies = ally.allies || [];
      ally.allies.push(h.houseId);
      h.prestige  = Math.min(100, (h.prestige || 50) + 5);
      ally.prestige = Math.min(100, (ally.prestige || 50) + 5);
      const msg = `🤝 Gia tộc ${h.houseName} kết liên minh với ${ally.houseName}!`;
      if (typeof addLog === "function") addLog(msg, "info");
      if (typeof htAddEvent === "function") htAddEvent({ type:"house_alliance", text: msg });
    }
  }
}

// ── Gia tộc gây chiến ──
function nhHouseWarTrigger(h, allHouses) {
  if (!h || h.isExtinct) return;
  nhEnsureExtended(h);
  if ((h.prestige || 50) < 60 || (h.wealth || 10000) < 50000) return;
  if (h.rivals.length === 0) return;

  if (Math.random() < 0.02) {
    const rivalId  = h.rivals[Math.floor(Math.random() * h.rivals.length)];
    const rival    = allHouses.find(o => o.houseId === rivalId);
    if (!rival || rival.isExtinct) {
      // Xóa rival đã tuyệt
      h.rivals = h.rivals.filter(id => id !== rivalId);
      return;
    }

    // Chiến tranh gia tộc
    h.wealth      -= 30000;
    rival.wealth  = Math.max(0, (rival.wealth || 10000) - 20000);
    h.warCount    += 1;
    rival.warCount = (rival.warCount || 0) + 1;

    const winnerHouse = (h.prestige || 50) > (rival.prestige || 50) ? h : rival;
    const loserHouse  = winnerHouse === h ? rival : h;
    winnerHouse.prestige   = Math.min(100, (winnerHouse.prestige || 50) + 15);
    winnerHouse.gloryPoints = (winnerHouse.gloryPoints || 0) + 50;
    loserHouse.prestige    = Math.max(0, (loserHouse.prestige || 50) - 20);
    loserHouse.influence   = Math.max(0, (loserHouse.influence || 20) - 10);

    const msg = `⚔️🏛️ CHIẾN TRANH GIA TỘC: ${h.houseName} vs ${rival.houseName}! Thắng: ${winnerHouse.houseName}`;
    if (typeof addLog === "function") addLog(msg, "death");
    if (typeof htAddEvent === "function") htAddEvent({ type:"house_war", text: msg, importance:"high" });
    if (typeof warEngine_declareWar === "function") {
      try { warEngine_declareWar(h.houseId, rival.houseId); } catch(e2) {}
    }
    if (typeof wmeRemember_war === "function") {
      try { wmeRemember_war(winnerHouse.houseId, loserHouse.houseId); } catch(e2) {}
    }
  }
}

// ── Hôn nhân chính trị giữa gia tộc ──
function nhPoliticalMarriage(h, allHouses) {
  if (!h || h.isExtinct || h.marriages.length >= 3) return;
  if ((h.prestige || 50) < 50 || Math.random() > 0.03) return;

  const candidates = allHouses.filter(o =>
    !o.isExtinct &&
    o.houseId !== h.houseId &&
    !h.marriages.includes(o.houseId) &&
    !h.rivals.includes(o.houseId) &&
    (o.prestige || 50) > 40
  );
  if (candidates.length === 0) return;

  const partner = candidates[Math.floor(Math.random() * candidates.length)];
  h.marriages.push(partner.houseId);
  partner.marriages = partner.marriages || [];
  partner.marriages.push(h.houseId);

  // Lợi ích hôn nhân
  h.prestige      = Math.min(100, (h.prestige || 50) + 8);
  partner.prestige = Math.min(100, (partner.prestige || 50) + 8);
  h.wealth        += 10000;
  partner.wealth  = (partner.wealth || 10000) + 10000;

  const msg = `💍 Hôn nhân chính trị: ${h.houseName} ↔ ${partner.houseName}`;
  if (typeof addLog === "function") addLog(msg, "info");
  if (typeof htAddEvent === "function") htAddEvent({ type:"house_marriage", text: msg });
}

// ── Noble House tick mở rộng ──
function nhTick_v23() {
  if (!window.nobleHouseData) return;
  const allHouses = Object.values(window.nobleHouseData.houses);
  allHouses.forEach(h => {
    if (h.isExtinct) return;
    nhEnsureExtended(h);
    nhPayUpkeep(h);
    nhRivalryTick(h, allHouses);
    nhHouseWarTrigger(h, allHouses);
    nhPoliticalMarriage(h, allHouses);
    // Tự nhiên phục hồi prestige nhẹ
    if ((h.prestige || 50) < 100) h.prestige = Math.min(100, (h.prestige || 50) + 0.5);
  });
  if (typeof nhSave === "function") nhSave();
}

// ── Lấy xếp hạng gia tộc ──
function nhGetRankings() {
  if (!window.nobleHouseData) return [];
  return Object.values(window.nobleHouseData.houses)
    .filter(h => !h.isExtinct)
    .sort((a, b) => (b.prestige + b.wealth/10000 + b.gloryPoints) - (a.prestige + a.wealth/10000 + a.gloryPoints))
    .slice(0, 10);
}

// ── Tích hợp auto tick ──
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    setInterval(function() {
      if (window.world && window.nobleHouseData) nhTick_v23();
    }, 9000);
  }, 4500);
});

window.nhTick_v23       = nhTick_v23;
window.nhGetRankings    = nhGetRankings;
window.nhEnsureExtended = nhEnsureExtended;
window.nhPayUpkeep      = nhPayUpkeep;
