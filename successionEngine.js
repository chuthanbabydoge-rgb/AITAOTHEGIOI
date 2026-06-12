// ============================================================
// SUCCESSION ENGINE V23
// CREATOR GOD — V23 EMPIRE & KINGDOM ENGINE
// Hệ thống Kế Vị — Truyền Ngôi, Tranh Quyền, Nội Chiến
// Tương thích 100% save cũ — KHÔNG xóa dữ liệu
// ============================================================

const SE_SAVE_KEY = "cgv6_succession";
const SE_VERSION  = 23;

const SE_HEIR_FIRST  = ["Long","Thiên","Hắc","Bạch","Kim","Ngọc","Minh","Huyền","Thanh","Tử","Phượng","Lôi"];
const SE_HEIR_LAST   = ["Vũ","Hoàng","Kiếm","Đế","Tôn","Vương","Quân","Bá","Thiên","Long"];

const SE_WAR_OUTCOMES = [
  { label:"Truyền Ngôi Hòa Bình",    weight: 40, effect: "peaceful",    emoji:"✅" },
  { label:"Tranh Giành Ngai Vàng",   weight: 25, effect: "contest",     emoji:"⚔️" },
  { label:"Nội Chiến Vương Quốc",    weight: 15, effect: "civil_war",   emoji:"🔥" },
  { label:"Chia Cắt Quốc Gia",       weight: 12, effect: "split",       emoji:"💔" },
  { label:"Sụp Đổ Vương Triều",      weight: 8,  effect: "collapse",    emoji:"💀" },
];

// ── INIT ──
function seInit() {
  if (!window.successionData) {
    const saved = localStorage.getItem(SE_SAVE_KEY);
    window.successionData = saved ? JSON.parse(saved) : {
      wars: [],
      history: [],
      idCounter: 0,
      version: SE_VERSION
    };
  }
  if (!window.successionData.wars)      window.successionData.wars      = [];
  if (!window.successionData.history)   window.successionData.history   = [];
  if (!window.successionData.idCounter) window.successionData.idCounter = 0;
}

function seSave() {
  try { localStorage.setItem(SE_SAVE_KEY, JSON.stringify(window.successionData)); } catch(e) {}
}

// ── Sinh người thừa kế ──
function seGenerateHeir(kingdom) {
  const firstName = _seRandItem(SE_HEIR_FIRST);
  const lastName  = kingdom ? (kingdom.dynasty || "").split(" ")[0] || _seRandItem(SE_HEIR_LAST) : _seRandItem(SE_HEIR_LAST);
  return {
    name:             firstName + " " + lastName,
    age:              Math.floor(Math.random() * 25 + 15),
    gender:           Math.random() > 0.3 ? "Nam" : "Nữ",
    talent:           Math.floor(Math.random() * 100),
    reputation:       Math.floor(Math.random() * 80),
    ambition:         Math.floor(Math.random() * 100),
    bloodlineStrength:Math.floor(Math.random() * 100),
    legitimacy:       Math.floor(Math.random() * 100),
    supporterCount:   Math.floor(Math.random() * 50),
  };
}

// ── Kích hoạt sự kiện kế vị ──
function seTriggersuccession(kingdom) {
  if (!window.successionData) seInit();
  const year    = window.year || 0;
  const outcome = _seWeightedRandom(SE_WAR_OUTCOMES);
  const heir    = seGenerateHeir(kingdom);
  const warId   = "sw" + (++window.successionData.idCounter);

  const event = {
    warId,
    kingdomId:   kingdom ? kingdom.kingdomId : "unknown",
    kingdomName: kingdom ? kingdom.kingdomName : "Vương Quốc Ẩn",
    year,
    outcome:     outcome.effect,
    outcomeLabel:outcome.label,
    emoji:       outcome.emoji,
    heir,
    resolved:    false,
    resolvedYear:null,
  };

  window.successionData.wars.push(event);
  _seApplyOutcome(event, kingdom);
  seSave();
  return event;
}

function _seApplyOutcome(event, kingdom) {
  const year   = window.year || 0;
  const kName  = event.kingdomName;
  let msg = "";

  switch (event.outcome) {
    case "peaceful":
      msg = `✅ ${kName}: ${event.heir.name} kế thừa ngai vàng hòa bình.`;
      if (kingdom) {
        kingdom.ruler = {
          name:       event.heir.name,
          age:        event.heir.age,
          gender:     event.heir.gender,
          rulerType:  event.heir.talent > 70 ? "Minh Quân" : event.heir.talent > 40 ? "Bình Quân" : "Hôn Quân",
          crownedYear:year,
          ambition:   event.heir.ambition,
          legitimacy: event.heir.legitimacy,
        };
        kingdom.stability = Math.min(100, kingdom.stability + 5);
      }
      break;

    case "contest":
      msg = `⚔️ ${kName}: Tranh giành ngai vàng bùng nổ! ${event.heir.name} đối đầu với các đối thủ khác.`;
      if (kingdom) {
        kingdom.stability = Math.max(0, kingdom.stability - 20);
        kingdom.militaryPower = Math.floor(kingdom.militaryPower * 0.85);
        kingdom.treasury -= 10000;
        kingdom.collapseRisk = (kingdom.collapseRisk || 0) + 20;
      }
      break;

    case "civil_war":
      msg = `🔥 ${kName}: Nội chiến kế vị bùng phát! Đất nước chìm trong lửa binh.`;
      if (kingdom) {
        kingdom.stability = Math.max(0, kingdom.stability - 40);
        kingdom.militaryPower = Math.floor(kingdom.militaryPower * 0.65);
        kingdom.population    = Math.floor(kingdom.population * 0.9);
        kingdom.treasury     -= 30000;
        kingdom.collapseRisk  = (kingdom.collapseRisk || 0) + 40;
      }
      break;

    case "split":
      msg = `💔 ${kName}: Quốc gia bị chia cắt do tranh giành kế vị!`;
      if (kingdom) {
        kingdom.stability     = Math.max(0, kingdom.stability - 30);
        kingdom.territoryCount = Math.max(1, Math.floor(kingdom.territoryCount / 2));
        kingdom.population    = Math.floor(kingdom.population * 0.6);
        kingdom.militaryPower = Math.floor(kingdom.militaryPower * 0.5);
        kingdom.influence     = Math.floor(kingdom.influence * 0.5);
      }
      break;

    case "collapse":
      msg = `💀 ${kName}: Vương triều sụp đổ hoàn toàn sau cuộc chiến kế vị!`;
      if (kingdom) {
        kingdom.isCollapsed = true;
        kingdom.collapseRisk = 100;
      }
      break;
  }

  event.resolved    = true;
  event.resolvedYear = year;
  if (msg) {
    if (typeof addLog === "function") addLog(msg, event.outcome === "peaceful" ? "info" : "death");
    if (typeof htAddEvent === "function") htAddEvent({ year, type: "succession_" + event.outcome, text: msg });
  }
  window.successionData.history.push({ year, text: msg, outcome: event.outcome, emoji: event.emoji });
}

// ── TICK ──
function seTick() {
  if (!window.successionData || !window.kingdomData) return;
  const year = window.year || 0;

  // Kiểm tra ruler già chết (mỗi 5 năm)
  if (year % 5 !== 0) return;

  Object.values(window.kingdomData.kingdoms).forEach(k => {
    if (k.isCollapsed || !k.ruler) return;

    k.ruler.age = (k.ruler.age || 30) + 5;

    // Xác suất chết theo tuổi
    let deathChance = 0;
    if (k.ruler.age > 80)      deathChance = 0.5;
    else if (k.ruler.age > 65) deathChance = 0.25;
    else if (k.ruler.age > 50) deathChance = 0.10;
    else if (k.ruler.age > 40) deathChance = 0.03;

    if (Math.random() < deathChance) {
      const deathMsg = `☠️ ${k.ruler.name}, ${k.kingdomTitle} ${k.kingdomName}, băng hà! Thọ ${k.ruler.age} tuổi.`;
      if (typeof addLog === "function") addLog(deathMsg, "death");
      if (typeof htAddEvent === "function") htAddEvent({ year, type: "ruler_death", text: deathMsg, kingdomId: k.kingdomId });
      seTriggersuccession(k);
    }
  });
  seSave();
}

// ── RENDER PANEL ──
function seRenderPanel() {
  const panel = document.getElementById("panel-succession");
  if (!panel) return;
  if (!window.successionData) seInit();

  const wars    = window.successionData.wars || [];
  const history = window.successionData.history || [];
  const activeWars = wars.filter(w => !w.resolved);

  panel.innerHTML = `
    <div class="panel-toolbar">
      <button class="btn-primary" onclick="seForceTrigger();seRenderPanel()">⚔️ Kích Hoạt Kế Vị</button>
      <button class="btn-secondary" onclick="seRenderPanel()">🔄 Làm Mới</button>
      <span style="margin-left:auto;font-size:12px;color:var(--white-dim)">${wars.length} sự kiện kế vị · ${activeWars.length} đang diễn ra</span>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="card">
        <div class="card-title">⚔️ Chiến Tranh Kế Vị Gần Đây</div>
        ${wars.length === 0 ? `<div style="color:var(--white-dim);font-size:12px;text-align:center;padding:20px">Chưa có sự kiện kế vị nào.</div>` : `
          <div style="display:flex;flex-direction:column;gap:8px;max-height:400px;overflow-y:auto">
            ${wars.slice(-15).reverse().map(w => `
              <div style="padding:10px 12px;background:rgba(255,255,255,0.03);border-radius:8px;border-left:3px solid ${_seOutcomeColor(w.outcome)}">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                  <span style="font-size:12px;font-weight:700;color:var(--white-main)">${w.emoji} ${w.kingdomName}</span>
                  <span style="font-size:10px;color:var(--white-dim)">Năm ${w.year}</span>
                </div>
                <div style="font-size:11px;color:var(--white-dim)">Người thừa kế: <span style="color:var(--white-main)">${w.heir.name}</span></div>
                <div style="font-size:10px;padding:2px 8px;border-radius:10px;display:inline-block;margin-top:4px;background:${_seOutcomeBg(w.outcome)};color:${_seOutcomeColor(w.outcome)}">${w.outcomeLabel}</div>
              </div>
            `).join("")}
          </div>
        `}
      </div>

      <div class="card">
        <div class="card-title">📜 Lịch Sử Kế Vị</div>
        ${history.length === 0 ? `<div style="color:var(--white-dim);font-size:12px;text-align:center;padding:20px">Chưa có lịch sử kế vị.</div>` : `
          <div style="display:flex;flex-direction:column;gap:6px;max-height:400px;overflow-y:auto">
            ${history.slice(-20).reverse().map(h => `
              <div style="display:flex;gap:8px;font-size:11px;padding:4px 8px;border-left:2px solid rgba(255,255,255,0.1)">
                <span style="color:var(--gold-dim);flex-shrink:0;font-size:10px">Năm ${h.year}</span>
                <span style="color:var(--white-dim)">${h.emoji} ${h.text}</span>
              </div>
            `).join("")}
          </div>
        `}
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card-title">📊 Thống Kê Kế Vị</div>
      <div style="display:flex;flex-wrap:wrap;gap:10px">
        ${SE_WAR_OUTCOMES.map(o => {
          const count = wars.filter(w => w.outcome === o.effect).length;
          return `
            <div style="padding:8px 16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;text-align:center;min-width:100px">
              <div style="font-size:16px;margin-bottom:4px">${o.emoji}</div>
              <div style="font-size:16px;font-weight:800;color:${_seOutcomeColor(o.effect)}">${count}</div>
              <div style="font-size:9px;color:var(--white-dim)">${o.label}</div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function seForceTrigger() {
  if (!window.kingdomData) return;
  const kingdoms = Object.values(window.kingdomData.kingdoms).filter(k => !k.isCollapsed);
  if (kingdoms.length === 0) { if (typeof toast === "function") toast("⚠️ Chưa có vương quốc nào!"); return; }
  const k = kingdoms[Math.floor(Math.random() * kingdoms.length)];
  seTriggersuccession(k);
  if (typeof keSave === "function") keSave();
}

function _seOutcomeColor(outcome) {
  return { peaceful:"#4ade80", contest:"#facc15", civil_war:"#f87171", split:"#c084fc", collapse:"#ef4444" }[outcome] || "#94a3b8";
}
function _seOutcomeBg(outcome) {
  return { peaceful:"rgba(74,222,128,0.1)", contest:"rgba(250,204,21,0.1)", civil_war:"rgba(248,113,113,0.1)", split:"rgba(192,132,252,0.1)", collapse:"rgba(239,68,68,0.1)" }[outcome] || "rgba(255,255,255,0.05)";
}
function _seRandItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function _seWeightedRandom(items) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) { r -= item.weight; if (r <= 0) return item; }
  return items[0];
}

function seShowNavBtn() {
  const btn = document.querySelector('.nav-btn[data-panel="succession"]');
  if (btn) { btn.style.display = ""; btn.classList.remove("ec-hidden"); }
}

document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    seInit();
    seShowNavBtn();
    setInterval(function() {
      if (window.world) {
        seTick();
        const active = document.querySelector('.nav-btn.active[data-panel="succession"]');
        if (active) seRenderPanel();
      }
    }, 12000);
  }, 1800);
});

// ============================================================
// SUCCESSION ENGINE V23 — EXPANSION PACK
// WarEngine Integration, Bloodline Succession, Richer Events
// EXPAND ONLY — không xóa dữ liệu cũ
// ============================================================

// ── Tên danh hiệu kế thừa ──
const SE_SUCCESSION_TITLES = [
  "Thừa Kế Hợp Pháp","Kế Vị Chinh Chiến","Ngai Vàng Tranh Đoạt",
  "Thiên Mệnh Kế Vị","Long Mạch Truyền Thừa","Huyết Thống Chính Thống"
];

// ── Đánh giá sức mạnh ứng cử viên kế vị ──
function seEvalCandidate(heir, kingdom) {
  let score = 50;
  if (heir.ambition > 70)    score += 20;
  if (heir.intelligence > 70) score += 15;
  if (heir.charisma > 60)    score += 10;
  if ((kingdom.stability||50) > 70)  score += 10; // ngôi ổn định dễ kế thừa
  if ((kingdom.stability||50) < 30)  score -= 20; // khủng hoảng tăng rủi ro
  if ((kingdom.militaryPower||0) > 50000) score += 5; // quân mạnh hỗ trợ
  return Math.max(0, Math.min(100, score));
}

// ── Kế vị mạnh mẽ hơn với hook bloodline ──
function seDoSuccession_v23(k) {
  if (!k || k.isCollapsed) return null;
  const year = window.year || 0;

  // Tạo người kế thừa mới
  const firstName = SE_HEIR_FIRST[Math.floor(Math.random() * SE_HEIR_FIRST.length)];
  const lastName  = SE_HEIR_LAST [Math.floor(Math.random() * SE_HEIR_LAST.length)];
  const heirName  = firstName + " " + lastName;

  const oldRuler = k.ruler ? { ...k.ruler } : null;

  // Thống kê heir
  const heir = {
    name:         heirName,
    age:          18 + Math.floor(Math.random() * 15),
    ambition:     20 + Math.floor(Math.random() * 80),
    intelligence: 20 + Math.floor(Math.random() * 80),
    charisma:     20 + Math.floor(Math.random() * 80),
    wisdom:       10 + Math.floor(Math.random() * 60),
    cruelty:      Math.floor(Math.random() * 70),
  };

  const candidateScore = seEvalCandidate(heir, k);
  const rand = Math.random() * 100;

  // Xác định kết quả dựa trên điểm kế vị
  let outcome;
  if (rand < candidateScore * 0.5) {
    outcome = { effect:"peaceful", label:"Truyền Ngôi Hòa Bình", emoji:"✅" };
  } else if (rand < 60) {
    outcome = { effect:"contest",  label:"Tranh Giành Ngai Vàng", emoji:"⚔️" };
  } else if (rand < 78) {
    outcome = { effect:"civil_war",label:"Nội Chiến Kế Vị",       emoji:"🔥" };
  } else if (rand < 88) {
    outcome = { effect:"split",    label:"Chia Cắt Vương Quốc",   emoji:"💔" };
  } else {
    outcome = { effect:"collapse", label:"Sụp Đổ Triều Đại",      emoji:"💀" };
  }

  // Ghi log người cũ qua đời
  if (oldRuler) {
    const deathMsg = `☠️ ${oldRuler.name || "Quốc Vương"} của ${k.kingdomName} băng hà sau ${Math.floor(Math.random() * 30 + 10)} năm trị vì.`;
    if (typeof addLog === "function") addLog(deathMsg, "info");
    if (typeof htAddEvent === "function") htAddEvent({ year, type:"ruler_death", text: deathMsg, kingdomId: k.kingdomId });
    // Lưu lịch sử kế vị
    if (!k.rulerHistory) k.rulerHistory = [];
    k.rulerHistory.push({ ...oldRuler, deathYear: year });
  }

  // Áp dụng kết quả
  switch (outcome.effect) {
    case "peaceful":
      k.ruler     = heir;
      k.stability = Math.min(100, (k.stability || 50) + 5);
      k.dynasty   = k.dynasty; // giữ nguyên triều đại
      break;

    case "contest":
      k.ruler         = heir;
      k.stability     = Math.max(0, (k.stability || 50) - 15);
      k.militaryPower = Math.floor(k.militaryPower * 0.92);
      k.treasury      = Math.floor(k.treasury * 0.9);
      break;

    case "civil_war":
      k.ruler         = heir;
      k.stability     = Math.max(0, (k.stability || 50) - 30);
      k.militaryPower = Math.floor(k.militaryPower * 0.7);
      k.treasury      = Math.floor(k.treasury * 0.7);
      k.population    = Math.floor(k.population * 0.92);
      k.collapseRisk  = (k.collapseRisk || 0) + 25;
      // Kích hoạt warEngine nội chiến
      if (typeof warEngine_declareWar === "function") {
        try { warEngine_declareWar(k.kingdomId + "_rebel", k.kingdomId); } catch(e2) {}
      }
      if (typeof wmeRemember_war === "function") {
        try { wmeRemember_war(k.kingdomId, k.kingdomId + "_rebel"); } catch(e2) {}
      }
      break;

    case "split":
      k.ruler          = heir;
      k.stability      = Math.max(0, (k.stability || 50) - 25);
      k.territoryCount = Math.max(1, Math.floor(k.territoryCount / 2));
      k.population     = Math.floor(k.population * 0.6);
      k.militaryPower  = Math.floor(k.militaryPower * 0.6);
      k.treasury       = Math.floor(k.treasury * 0.5);
      // Sinh quốc gia mới nếu có foundNation
      if (typeof foundNation === "function") {
        try { foundNation({ name: heirName, origin: k.kingdomId }); } catch(e2) {}
      }
      break;

    case "collapse":
      if (typeof keCollapseKingdom === "function") {
        keCollapseKingdom(k.kingdomId);
      } else {
        k.isCollapsed = true;
      }
      break;
  }

  const succMsg = `${outcome.emoji} ${outcome.label}: ${k.kingdomName} — ${heirName} lên ngôi (${outcome.effect})`;
  if (typeof addLog === "function") addLog(succMsg, outcome.effect === "collapse" ? "death" : "info");
  if (typeof htAddEvent === "function") {
    htAddEvent({
      year,
      type:       "succession_" + outcome.effect,
      text:       succMsg,
      kingdomId:  k.kingdomId,
      importance: ["civil_war","collapse","split"].includes(outcome.effect) ? "high" : "medium",
    });
  }

  // Cập nhật successionData
  if (!window.successionData) seInit();
  window.successionData.history.push({
    year,
    kingdomId:   k.kingdomId,
    kingdomName: k.kingdomName,
    from:        oldRuler ? oldRuler.name : "—",
    to:          heirName,
    outcome:     outcome.effect,
    label:       outcome.label,
  });
  if (typeof seSave === "function") seSave();

  return { heir, outcome };
}

// ── Auto succession: khi vua già / random death ──
function seAutoTick() {
  if (!window.kingdomData) return;
  Object.values(window.kingdomData.kingdoms).forEach(k => {
    if (k.isCollapsed) return;
    // Random chance mỗi tick để vua qua đời (0.5%)
    if (Math.random() < 0.005) {
      seDoSuccession_v23(k);
    }
    // Ruler già: tăng xác suất nếu tuổi > 60
    if (k.ruler && k.ruler.age && k.ruler.age > 60 && Math.random() < 0.01) {
      seDoSuccession_v23(k);
    }
    // Tăng tuổi ruler mỗi tick
    if (k.ruler && k.ruler.age !== undefined) {
      k.ruler.age += 0.05;
    }
  });
}

// ── Lấy lịch sử kế vị của một vương quốc ──
function seGetKingdomHistory(kingdomId) {
  if (!window.successionData) return [];
  return (window.successionData.history || []).filter(h => h.kingdomId === kingdomId);
}

// ── Tích hợp auto tick vào DOMContentLoaded ──
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    setInterval(function() {
      if (window.world && window.kingdomData) seAutoTick();
    }, 12000);
  }, 4000);
});

window.seDoSuccession_v23   = seDoSuccession_v23;
window.seAutoTick           = seAutoTick;
window.seGetKingdomHistory  = seGetKingdomHistory;
window.seEvalCandidate      = seEvalCandidate;
