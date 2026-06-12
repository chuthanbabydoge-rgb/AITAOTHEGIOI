/* ============================================================
   AGE ENGINE V1  —  CREATOR GOD V6 / PHASE NEXT
   Event-driven Era System
   ============================================================
   Six eras: Ancient → Golden → Imperial → Chaotic → Dark → Revival
   Each era modifies five world parameters:
     • cultivationSpeed  (realmMult)
     • warFrequency      (warMult)
     • birthRate         (birthMult)
     • bossSpawnRate     (bossMult)
     • resources         (resourceMult)
   Transitions are triggered by world events, NOT by fixed year.
   All era state is saved/loaded with the rest of the game.
   ============================================================ */

// ============================================================
// ERA DEFINITIONS
// ============================================================

const AGE_DEFS = {
  ancient: {
    id:           "ancient",
    name:         "⛰️ Thượng Cổ Kỷ",
    nameEn:       "Ancient Era",
    color:        "#a78bfa",
    icon:         "⛰️",
    desc:         "Thiên địa mới khai, linh khí nguyên sơ, vạn vật sinh trưởng tự nhiên. Anh hùng chưa xuất thế.",
    // Multipliers
    cultivationSpeed: 1.4,   // realmMult
    warFrequency:     0.5,   // warMult
    birthRate:        1.6,   // birthMult
    bossSpawnRate:    0.6,   // bossMult
    resources:        1.5,   // resourceMult
    // Transition triggers — how many of these must be hit to advance
    triggers: {
      nextEra: "golden",
      conditions: [
        { id: "pop50",       desc: "Dân số đạt 50 tu sĩ",         check: () => npcs.filter(n=>n.status==="alive").length >= 50 },
        { id: "sect3",       desc: "3 tông môn thành lập",         check: () => sects.length >= 3 },
        { id: "realm3",      desc: "Ai đó đạt Kim Đan",            check: () => npcs.some(n=>n.realm >= 2 && n.status==="alive") },
      ],
      required: 2,
    },
  },

  golden: {
    id:           "golden",
    name:         "🌟 Hoàng Kim Kỷ",
    nameEn:       "Golden Era",
    color:        "#facc15",
    icon:         "🌟",
    desc:         "Văn minh thịnh vượng, anh hùng xuất thế, võ đạo hưng thịnh. Thời kỳ hoàng kim của thiên địa.",
    cultivationSpeed: 1.6,
    warFrequency:     0.8,
    birthRate:        1.3,
    bossSpawnRate:    1.0,
    resources:        1.3,
    triggers: {
      nextEra: "imperial",
      conditions: [
        { id: "pop100",      desc: "Dân số đạt 100 tu sĩ",         check: () => npcs.filter(n=>n.status==="alive").length >= 100 },
        { id: "country2",   desc: "2 quốc gia xuất hiện",          check: () => countries.length >= 2 },
        { id: "realm5",     desc: "Ai đó đạt Hóa Thần",            check: () => npcs.some(n=>n.realm >= 4 && n.status==="alive") },
        { id: "war5",       desc: "5 cuộc chiến tranh xảy ra",     check: () => (ageState.warCount||0) >= 5 },
      ],
      required: 2,
    },
  },

  imperial: {
    id:           "imperial",
    name:         "👑 Đế Vương Kỷ",
    nameEn:       "Imperial Era",
    color:        "#fb923c",
    icon:         "👑",
    desc:         "Đế vương phân tranh, các thế lực lớn mạnh vô song. Chiến tranh trở thành bình thường.",
    cultivationSpeed: 1.2,
    warFrequency:     1.8,
    birthRate:        1.0,
    bossSpawnRate:    1.4,
    resources:        1.0,
    triggers: {
      nextEra: "chaotic",
      conditions: [
        { id: "bigWar",     desc: "Chiến tranh tổng lực (10+ cuộc)", check: () => (ageState.warCount||0) >= 10 },
        { id: "bossKill3",  desc: "3 boss bị tiêu diệt",            check: () => (ageState.bossKills||0) >= 3 },
        { id: "realm7",     desc: "Ai đó đạt Hợp Thể",              check: () => npcs.some(n=>n.realm >= 6 && n.status==="alive") },
        { id: "pop50d",     desc: "Dân số giảm xuống dưới 50",      check: () => npcs.filter(n=>n.status==="alive").length < 50 },
      ],
      required: 2,
    },
  },

  chaotic: {
    id:           "chaotic",
    name:         "🌀 Hỗn Loạn Kỷ",
    nameEn:       "Chaotic Era",
    color:        "#f43f5e",
    icon:         "🌀",
    desc:         "Thiên địa mất kiểm soát, chiến tranh nổ ra khắp nơi. Ma đầu và boss tràn lan.",
    cultivationSpeed: 0.7,
    warFrequency:     2.5,
    birthRate:        0.7,
    bossSpawnRate:    2.2,
    resources:        0.6,
    triggers: {
      nextEra: "dark",
      conditions: [
        { id: "pop30",      desc: "Dân số chỉ còn 30 tu sĩ",       check: () => npcs.filter(n=>n.status==="alive").length <= 30 },
        { id: "sectFall",   desc: "Tông môn giảm xuống còn 1",     check: () => sects.length <= 1 },
        { id: "war20",      desc: "20 cuộc chiến tổng cộng",       check: () => (ageState.warCount||0) >= 20 },
      ],
      required: 1,
    },
  },

  dark: {
    id:           "dark",
    name:         "🌑 Hắc Ám Kỷ",
    nameEn:       "Dark Era",
    color:        "#64748b",
    icon:         "🌑",
    desc:         "Ánh sáng tắt lịm. Linh khí kiệt quệ, dân số điêu tàn. Thiên đạo trở nên im lặng.",
    cultivationSpeed: 0.4,
    warFrequency:     1.2,
    birthRate:        0.5,
    bossSpawnRate:    0.8,
    resources:        0.4,
    triggers: {
      nextEra: "revival",
      conditions: [
        { id: "survive50",  desc: "Vượt qua 50 năm hắc ám",        check: () => (ageState.yearsInEra||0) >= 50 },
        { id: "hero",       desc: "Anh hùng đạt Đại Thừa trong hắc ám", check: () => npcs.some(n=>n.realm >= 7 && n.status==="alive") },
        { id: "newSect",    desc: "Tông môn mới thành lập",         check: () => sects.length >= 2 },
      ],
      required: 2,
    },
  },

  revival: {
    id:           "revival",
    name:         "🌸 Phục Hưng Kỷ",
    nameEn:       "Revival Era",
    color:        "#34d399",
    icon:         "🌸",
    desc:         "Thiên địa hồi sinh, linh khí trào dâng trở lại. Văn minh mới nảy mầm từ đống tro tàn.",
    cultivationSpeed: 1.8,
    warFrequency:     0.6,
    birthRate:        2.0,
    bossSpawnRate:    0.7,
    resources:        1.8,
    triggers: {
      nextEra: "ancient",  // cycle back — new cycle begins
      conditions: [
        { id: "pop80",      desc: "Dân số phục hồi 80 tu sĩ",      check: () => npcs.filter(n=>n.status==="alive").length >= 80 },
        { id: "sect4",      desc: "4 tông môn tái lập",             check: () => sects.length >= 4 },
        { id: "year200",    desc: "200 năm phục hưng đã trôi qua",  check: () => (ageState.yearsInEra||0) >= 200 },
      ],
      required: 2,
    },
  },
};

// ============================================================
// AGE STATE
// ============================================================

let ageState = {
  currentEra:   "ancient",   // era id
  cycle:        1,           // which cycle we're on (increments when revival → ancient)
  yearsInEra:   0,           // years elapsed in current era
  startYear:    1,           // world year when era started
  conditionsMet: [],         // array of condition ids already triggered this era
  history:      [],          // [{cycle, eraId, eraName, startYear, endYear, yearsLasted, trigger}]
  // Counters reset each new era
  warCount:     0,
  bossKills:    0,
};

// ============================================================
// SAVE / LOAD
// ============================================================

function ageEngine_save() {
  try {
    localStorage.setItem("cgv6_ageState", JSON.stringify(ageState));
  } catch(e) { console.warn("AgeEngine save failed:", e); }
}

function ageEngine_load() {
  try {
    const saved = JSON.parse(localStorage.getItem("cgv6_ageState"));
    if (saved) Object.assign(ageState, saved);
    // Ensure history array exists (migration for old saves)
    if (!ageState.history) ageState.history = [];
    if (!ageState.conditionsMet) ageState.conditionsMet = [];
  } catch(e) { console.warn("AgeEngine load failed:", e); }
}

// ============================================================
// GETTERS — used by app.js systems
// ============================================================

function getAgeEra() {
  return AGE_DEFS[ageState.currentEra] || AGE_DEFS.ancient;
}

/** Drop-in replacement for legacy getCurrentEra() — returns compat object */
function getCurrentEra() {
  const era = getAgeEra();
  return {
    name:         era.name,
    buff:         era.desc,
    realmMult:    era.cultivationSpeed,
    resourceMult: era.resources,
    // Extended fields
    warMult:      era.warFrequency,
    birthMult:    era.birthRate,
    bossMult:     era.bossSpawnRate,
    color:        era.color,
    icon:         era.icon,
    id:           era.id,
  };
}

// ============================================================
// TRANSITION
// ============================================================

function transitionToEra(newEraId, triggerDesc) {
  const oldEra = getAgeEra();
  const newEra = AGE_DEFS[newEraId];
  if (!newEra) return;

  // Record history
  ageState.history.push({
    cycle:       ageState.cycle,
    eraId:       oldEra.id,
    eraName:     oldEra.name,
    startYear:   ageState.startYear,
    endYear:     year,
    yearsLasted: ageState.yearsInEra,
    trigger:     triggerDesc || "Unknown",
  });

  // Bump cycle when looping back to ancient
  if (newEraId === "ancient" && ageState.currentEra === "revival") {
    ageState.cycle++;
  }

  // Set new state
  ageState.currentEra    = newEraId;
  ageState.startYear     = year;
  ageState.yearsInEra    = 0;
  ageState.conditionsMet = [];
  ageState.warCount      = 0;
  ageState.bossKills     = 0;

  // Sync world.currentEra for legacy display
  if (world) world.currentEra = newEra.name;

  // Announce
  const cycleTag = ageState.cycle > 1 ? ` [Chu Kỳ ${ageState.cycle}]` : "";
  addLog(`🌐 Thiên Địa chuyển vào [${newEra.name}]${cycleTag} — ${newEra.desc}`, "important");
  addTimeline(`🌐 Kỷ Nguyên Mới: ${newEra.name}${cycleTag}`, "important", newEra.icon);
  addWorldHistory("era",
    `Thiên Địa bước vào ${newEra.name}${cycleTag}. Nguyên nhân: ${triggerDesc || "?"}`,
    { era: newEra.name, cycle: ageState.cycle, eraId: newEraId }
  );
  toast(`${newEra.icon} Kỷ Nguyên Mới: ${newEra.name}!`, 6000);
}

// ============================================================
// TICK — called every simulateWorld() tick
// ============================================================

function ageEngineTick() {
  if (!world) return;
  ageState.yearsInEra++;

  // Reveal Age tab on first tick
  if (!ageState._tabRevealed) {
    ageState._tabRevealed = true;
    const btn = document.querySelector('.nav-btn[data-panel="age"]');
    if (btn) {
      btn.style.display = '';
      btn.classList.remove('ec-hidden');
      btn.classList.add('ec-unlocked-flash');
      setTimeout(() => btn.classList.remove('ec-unlocked-flash'), 1200);
    }
  }

  const era     = getAgeEra();
  const triggers = era.triggers;
  if (!triggers) return;

  // Check conditions
  triggers.conditions.forEach(cond => {
    if (ageState.conditionsMet.includes(cond.id)) return; // already counted
    try {
      if (cond.check()) {
        ageState.conditionsMet.push(cond.id);
        addLog(`📜 Điều kiện kỷ nguyên: "${cond.desc}" đã thỏa mãn (${ageState.conditionsMet.length}/${triggers.required})`, "important");
      }
    } catch(e) {}
  });

  // Enough conditions met → transition
  if (ageState.conditionsMet.length >= triggers.required) {
    const metDescs = ageState.conditionsMet
      .map(id => (triggers.conditions.find(c => c.id === id) || {}).desc || id)
      .join("; ");
    transitionToEra(triggers.nextEra, metDescs);
  }
}

// ============================================================
// WAR / BOSS EVENT HOOKS — increment counters for trigger checks
// ============================================================

function ageEngine_onWar() {
  ageState.warCount = (ageState.warCount || 0) + 1;
}

function ageEngine_onBossKill() {
  ageState.bossKills = (ageState.bossKills || 0) + 1;
}

// ============================================================
// MODIFIED SPAWN CHANCES — apply era multipliers
// ============================================================

function ageWarChance(base) {
  // base = 0.06 (autoSectWar), 0.03 (sectEvents), etc.
  return base * getAgeEra().warFrequency;
}

function ageBossSpawnChance(base) {
  return base * getAgeEra().bossSpawnRate;
}

function ageBirthMult() {
  return getAgeEra().birthRate;
}

// ============================================================
// RENDER — Age Panel UI
// ============================================================

function renderAgePanel() {
  const el = document.getElementById("panel-age");
  if (!el) return;

  const era    = getAgeEra();
  const compat = getCurrentEra();
  const trig   = era.triggers;

  // Progress toward next era
  const total = trig ? trig.conditions.length : 0;
  const met   = ageState.conditionsMet.length;
  const pct   = total > 0 ? Math.round(met / trig.required * 100) : 100;
  const pctCapped = Math.min(pct, 100);

  // Conditions rows
  const condRows = trig ? trig.conditions.map(c => {
    const done = ageState.conditionsMet.includes(c.id);
    let progress = "";
    try { if (!done) { c.check(); } } catch(e) {}
    return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
      <span style="font-size:16px">${done ? "✅" : "⬜"}</span>
      <span style="font-size:12px;color:${done?"var(--jade)":"var(--white-dim)"};flex:1">${c.desc}</span>
    </div>`;
  }).join("") : "";

  // Multiplier rows
  const mults = [
    { icon: "⚡", label: "Tu Luyện",   val: compat.realmMult,  color: "#c084fc" },
    { icon: "⚔️",  label: "Chiến Tranh", val: compat.warMult,   color: "#f87171" },
    { icon: "👶", label: "Sinh Sản",   val: compat.birthMult,  color: "#4ade80" },
    { icon: "🐉", label: "Boss",       val: compat.bossMult,   color: "#fb923c" },
    { icon: "💎", label: "Tài Nguyên", val: compat.resourceMult, color: "#facc15" },
  ];

  const multRows = mults.map(m => {
    const bar = Math.round(Math.min(m.val / 2.5 * 100, 100));
    const sign = m.val >= 1 ? "+" : "";
    return `<div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px">
        <span style="font-size:12px;color:var(--white-dim)">${m.icon} ${m.label}</span>
        <span style="font-size:12px;font-weight:700;color:${m.color}">${sign}${Math.round((m.val-1)*100)}%</span>
      </div>
      <div style="height:5px;background:rgba(255,255,255,0.08);border-radius:3px">
        <div style="height:100%;width:${bar}%;background:${m.color};border-radius:3px;transition:width 0.5s"></div>
      </div>
    </div>`;
  }).join("");

  // History table
  const histRows = [...ageState.history].reverse().slice(0, 12).map(h =>
    `<tr>
      <td style="color:var(--white-dim);font-size:11px">Chu ${h.cycle}</td>
      <td style="font-size:11px">${h.eraName}</td>
      <td style="color:var(--white-dim);font-size:11px">Năm ${h.startYear}–${h.endYear}</td>
      <td style="color:var(--jade);font-size:11px">${h.yearsLasted} năm</td>
    </tr>`
  ).join("") || `<tr><td colspan="4" style="color:var(--white-dim);text-align:center;padding:10px">Chưa có lịch sử kỷ nguyên</td></tr>`;

  el.innerHTML = `
  <div style="padding:16px">
    <!-- CURRENT ERA BANNER -->
    <div style="background:linear-gradient(135deg,${era.color}22,${era.color}11);
                border:1px solid ${era.color}55;border-radius:14px;padding:16px;margin-bottom:16px;text-align:center">
      <div style="font-size:36px;margin-bottom:6px">${era.icon}</div>
      <div style="font-family:var(--font-title);font-size:20px;color:${era.color};margin-bottom:4px">${era.name}</div>
      <div style="font-size:11px;color:var(--white-dim);margin-bottom:8px">${era.desc}</div>
      <div style="display:flex;justify-content:center;gap:16px;font-size:11px;color:var(--white-dim)">
        <span>📅 Bắt đầu năm ${ageState.startYear}</span>
        <span>⏱️ Đã ${ageState.yearsInEra} năm</span>
        <span>🔄 Chu kỳ ${ageState.cycle}</span>
      </div>
    </div>

    <!-- MULTIPLIERS -->
    <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:16px">
      <div style="font-family:var(--font-title);font-size:12px;color:var(--white-dim);margin-bottom:12px;letter-spacing:1px">
        📊 HIỆU ỨNG KỶ NGUYÊN
      </div>
      ${multRows}
    </div>

    <!-- NEXT ERA PROGRESS -->
    <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px">
        <div style="font-family:var(--font-title);font-size:12px;color:var(--white-dim);letter-spacing:1px">
          ⏭️ CHUYỂN KỶ NGUYÊN
        </div>
        <div style="font-size:11px;color:${era.color}">${met}/${trig ? trig.required : "?"} điều kiện</div>
      </div>
      <div style="height:8px;background:rgba(255,255,255,0.08);border-radius:4px;margin-bottom:10px">
        <div style="height:100%;width:${pctCapped}%;background:${era.color};border-radius:4px;transition:width 0.5s"></div>
      </div>
      ${trig ? `<div style="font-size:11px;color:var(--white-dim);margin-bottom:8px">
        Kỷ nguyên tiếp theo: <span style="color:${(AGE_DEFS[trig.nextEra]||{}).color||'#fff'}">${(AGE_DEFS[trig.nextEra]||{}).name||"?"}</span>
        — cần <strong>${trig.required}</strong> trong <strong>${trig.conditions.length}</strong> điều kiện
      </div>` : ""}
      ${condRows}
    </div>

    <!-- HISTORY TABLE -->
    <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:10px;padding:14px">
      <div style="font-family:var(--font-title);font-size:12px;color:var(--white-dim);margin-bottom:10px;letter-spacing:1px">
        📜 LỊCH SỬ KỶ NGUYÊN
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="border-bottom:1px solid var(--border)">
            <th style="text-align:left;font-size:10px;color:var(--white-dim);padding-bottom:6px">Chu Kỳ</th>
            <th style="text-align:left;font-size:10px;color:var(--white-dim);padding-bottom:6px">Kỷ Nguyên</th>
            <th style="text-align:left;font-size:10px;color:var(--white-dim);padding-bottom:6px">Thời Gian</th>
            <th style="text-align:left;font-size:10px;color:var(--white-dim);padding-bottom:6px">Tồn Tại</th>
          </tr>
        </thead>
        <tbody>${histRows}</tbody>
      </table>
    </div>
  </div>`;
}

// ============================================================
// INIT — called at world creation
// ============================================================

function ageEngineInit() {
  ageState.currentEra    = "ancient";
  ageState.cycle         = 1;
  ageState.yearsInEra    = 0;
  ageState.startYear     = year || 1;
  ageState.conditionsMet = [];
  ageState.history       = [];
  ageState.warCount      = 0;
  ageState.bossKills     = 0;
  if (world) world.currentEra = AGE_DEFS.ancient.name;
}

console.log("[AgeEngine V1] Loaded — 6 Eras, Event-Driven Transitions ✓");
