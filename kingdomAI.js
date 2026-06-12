// ============================================================
// KINGDOM AI V23
// CREATOR GOD — V23 EMPIRE & KINGDOM ENGINE
// AI tự động quản lý vương quốc mỗi chu kỳ
// Tương thích 100% save cũ — KHÔNG xóa dữ liệu
// ============================================================

const KAI_VERSION = 23;

// ── Đánh giá trạng thái kingdom ──
function kaiEvaluate(k) {
  if (!k || k.isCollapsed) return null;
  const score = {
    economy:    Math.min(100, k.treasury / 1000),
    population: Math.min(100, k.population / 1000),
    military:   Math.min(100, k.militaryPower / 1000),
    religion:   Math.min(100, 50),
    technology: Math.min(100, k.technologyLevel * 20),
    territory:  Math.min(100, k.territoryCount * 10),
    stability:  k.stability || 50,
  };
  score.overall = Object.values(score).reduce((s, v) => s + v, 0) / Object.keys(score).length;
  return score;
}

// ── Ra quyết định ──
function kaiDecide(k) {
  const score = kaiEvaluate(k);
  if (!score) return null;

  const decisions = [];

  // Ưu tiên theo điểm số yếu nhất
  if (score.economy < 30 && k.treasury < 20000) {
    decisions.push({ action:"trade",    priority: 90 + Math.random() * 10 });
  }
  if (score.stability < 40) {
    decisions.push({ action:"pacify",   priority: 85 + Math.random() * 10 });
  }
  if (score.military < 30 && k.militaryPower < 5000) {
    decisions.push({ action:"recruit",  priority: 80 + Math.random() * 10 });
  }
  if (score.technology < 50 && k.treasury > 30000) {
    decisions.push({ action:"research", priority: 60 + Math.random() * 20 });
  }
  if (score.territory < 40 && k.militaryPower > 10000) {
    decisions.push({ action:"expand",   priority: 55 + Math.random() * 20 });
  }
  if (score.overall > 70) {
    decisions.push({ action:"ally",     priority: 50 + Math.random() * 20 });
  }
  if (score.military > 70 && score.economy > 60 && k.ruler && k.ruler.ambition > 70) {
    decisions.push({ action:"conquer",  priority: 70 + Math.random() * 20 });
  }

  // Luôn có quyết định mặc định
  decisions.push({ action:"consolidate", priority: 20 + Math.random() * 20 });

  // Chọn quyết định ưu tiên cao nhất
  decisions.sort((a, b) => b.priority - a.priority);
  return decisions[0];
}

// ── Áp dụng quyết định ──
function kaiApplyDecision(k, decision) {
  if (!decision || !k || k.isCollapsed) return;
  const year = window.year || 0;
  let msg = "";

  switch (decision.action) {
    case "trade":
      const tradeGain = Math.floor(k.population * 0.05 + Math.random() * 5000);
      k.treasury += tradeGain;
      k.influence += 5;
      break;

    case "pacify":
      const pacifyCost = Math.floor(k.treasury * 0.05);
      k.treasury   = Math.max(0, k.treasury - pacifyCost);
      k.stability   = Math.min(100, k.stability + 10);
      k.collapseRisk = Math.max(0, (k.collapseRisk || 0) - 10);
      break;

    case "recruit":
      if (k.treasury > 10000) {
        const recruitCost = 10000;
        k.treasury     -= recruitCost;
        k.armySize      = (k.armySize || 0) + 500;
        k.militaryPower += 5000;
      }
      break;

    case "research":
      if (k.treasury > 20000 && k.technologyLevel < 10) {
        k.treasury      -= 20000;
        k.technologyLevel = Math.min(10, k.technologyLevel + 1);
        msg = `🔬 ${k.kingdomName} nâng cấp công nghệ lên cấp ${k.technologyLevel}!`;
        if (typeof addLog === "function") addLog(msg, "info");
        if (typeof htAddEvent === "function") htAddEvent({ year, type: "general", text: msg });
      }
      break;

    case "expand":
      if (k.treasury > 15000 && k.militaryPower > 10000) {
        k.treasury      -= 15000;
        k.territoryCount += 1;
        k.militaryPower  -= 2000;
        k.population     += Math.floor(Math.random() * 5000 + 1000);
        msg = `🗺️ ${k.kingdomName} mở rộng lãnh thổ! Tổng: ${k.territoryCount} vùng.`;
        if (typeof addLog === "function") addLog(msg, "info");
        if (typeof htAddEvent === "function") htAddEvent({ year, type: "general", text: msg });
      }
      break;

    case "ally":
      if (window.kingdomData) {
        const others = Object.values(window.kingdomData.kingdoms).filter(other =>
          !other.isCollapsed &&
          other.kingdomId !== k.kingdomId &&
          !k.allies.includes(other.kingdomId)
        );
        if (others.length > 0) {
          const target = others[Math.floor(Math.random() * others.length)];
          k.allies.push(target.kingdomId);
          target.allies.push(k.kingdomId);
          k.influence += 10;
          msg = `🤝 ${k.kingdomName} ký hiệp ước liên minh với ${target.kingdomName}!`;
          if (typeof addLog === "function") addLog(msg, "info");
          if (typeof htAddEvent === "function") htAddEvent({ year, type: "general", text: msg });
        }
      }
      break;

    case "conquer":
      if (window.kingdomData && k.treasury > 30000) {
        const weaklings = Object.values(window.kingdomData.kingdoms).filter(other =>
          !other.isCollapsed &&
          other.kingdomId !== k.kingdomId &&
          !k.allies.includes(other.kingdomId) &&
          other.militaryPower < k.militaryPower * 0.4
        );
        if (weaklings.length > 0) {
          const target = weaklings[Math.floor(Math.random() * weaklings.length)];
          k.treasury  -= 30000;
          k.militaryPower -= 10000;
          // Chinh phục: target mất lãnh thổ, k thêm
          k.territoryCount += Math.floor(target.territoryCount / 2);
          k.population     += Math.floor(target.population * 0.3);
          k.influence      += 50;
          target.territoryCount = Math.max(1, Math.ceil(target.territoryCount / 2));
          target.population     = Math.floor(target.population * 0.7);
          target.stability      = Math.max(0, target.stability - 30);
          target.collapseRisk   = (target.collapseRisk || 0) + 30;
          msg = `⚔️ ${k.kingdomName} chinh phục và thôn tính một phần lãnh thổ ${target.kingdomName}!`;
          if (typeof addLog === "function") addLog(msg, "death");
          if (typeof htAddEvent === "function") htAddEvent({ year, type: "general", text: msg });
        }
      }
      break;

    case "consolidate":
    default:
      k.stability   = Math.min(100, (k.stability || 50) + 2);
      k.militaryPower = Math.floor(k.militaryPower * 1.02);
      break;
  }
}

// ── TICK toàn bộ kingdoms ──
function kaiTick() {
  if (!window.kingdomData) return;

  Object.values(window.kingdomData.kingdoms).forEach(k => {
    if (k.isCollapsed) return;
    const decision = kaiDecide(k);
    if (decision) {
      kaiApplyDecision(k, decision);
      k.lastAIDecision = decision.action;
    }
  });

  if (typeof keSave === "function") keSave();
}

// ── Tự động tick mỗi 15 giây ──
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    setInterval(function() {
      if (window.world && window.kingdomData) kaiTick();
    }, 15000);
  }, 3000);
});

// ============================================================
// KINGDOM AI V23 — EXPANSION PACK
// Religion Decisions, War Diplomacy, Economy V2 Sync
// EXPAND ONLY — không xóa dữ liệu cũ
// ============================================================

// ── Quyết định tôn giáo ──
function kaiReligionDecide(k) {
  if (!k || k.isCollapsed) return null;
  const fervor = k.religiousFervor || 50;
  const holyRisk = k.holyWarRisk || 0;

  const decisions = [];

  // Truyền giáo nếu fervor cao
  if (fervor > 65 && (k.treasury || 0) > 25000) {
    decisions.push({ action:"spread_faith",  priority: 72 + Math.random() * 15 });
  }
  // Thánh chiến nếu risk cao
  if (holyRisk > 60 && (k.militaryPower || 0) > 15000) {
    decisions.push({ action:"holy_war",      priority: 85 + Math.random() * 10 });
  }
  // Đàn áp tôn giáo nếu ổn định thấp do bất đồng
  if (fervor < 30 && (k.stability || 50) < 40) {
    decisions.push({ action:"religious_tolerance", priority: 68 + Math.random() * 10 });
  }
  // Xây chùa / đền thờ nếu có tiền
  if (fervor < 60 && (k.treasury || 0) > 40000) {
    decisions.push({ action:"build_temple",  priority: 55 + Math.random() * 15 });
  }

  return decisions.length > 0
    ? decisions.sort((a,b) => b.priority - a.priority)[0]
    : null;
}

// ── Áp dụng quyết định tôn giáo ──
function kaiApplyReligionDecision(k, decision) {
  if (!decision || !k || k.isCollapsed) return;
  const year = window.year || 0;
  let msg = "";

  switch (decision.action) {
    case "spread_faith":
      k.treasury = Math.max(0, (k.treasury || 0) - 15000);
      k.missionaryCount = (k.missionaryCount || 0) + 1;
      k.religiousFervor = Math.min(100, (k.religiousFervor || 50) + 5);
      k.influence += 8;
      if (typeof keSpreadReligion === "function") keSpreadReligion(k);
      msg = `🙏 ${k.kingdomName} phái truyền giáo sĩ truyền bá ${k.religionName || k.religion}!`;
      if (typeof addLog === "function") addLog(msg, "info");
      if (typeof htAddEvent === "function") htAddEvent({ year, type:"faith_spread", text: msg });
      break;

    case "holy_war":
      // Thánh chiến được kích hoạt qua keUpdateHolyWarRisk
      k.holyWarRisk = Math.min(100, (k.holyWarRisk || 0) + 20);
      k.religiousFervor = Math.min(100, (k.religiousFervor || 50) + 8);
      msg = `⚔️🔥 ${k.kingdomName} chuẩn bị phát động THÁNH CHIẾN (fervor: ${k.religiousFervor})!`;
      if (typeof addLog === "function") addLog(msg, "important");
      break;

    case "religious_tolerance":
      k.treasury = Math.max(0, (k.treasury || 0) - 10000);
      k.stability = Math.min(100, (k.stability || 50) + 8);
      k.religiousFervor = Math.min(100, (k.religiousFervor || 50) + 10);
      msg = `☮️ ${k.kingdomName} ban chính sách khoan dung tôn giáo → ổn định +8`;
      if (typeof addLog === "function") addLog(msg, "info");
      break;

    case "build_temple":
      k.treasury = Math.max(0, (k.treasury || 0) - 20000);
      k.religiousFervor = Math.min(100, (k.religiousFervor || 50) + 12);
      k.stability = Math.min(100, (k.stability || 50) + 5);
      k.influence += 15;
      msg = `🏯 ${k.kingdomName} xây đền thờ vĩ đại! Fervor: ${k.religiousFervor}`;
      if (typeof addLog === "function") addLog(msg, "info");
      if (typeof htAddEvent === "function") htAddEvent({ year, type:"temple_built", text: msg });
      break;
  }
}

// ── Quyết định ngoại giao với warEngine ──
function kaiDiplomacyDecide(k) {
  if (!k || k.isCollapsed || !window.kingdomData) return null;

  // Tìm mục tiêu tấn công hợp lý
  const enemies = Object.values(window.kingdomData.kingdoms).filter(o =>
    !o.isCollapsed &&
    o.kingdomId !== k.kingdomId &&
    !k.allies.includes(o.kingdomId) &&
    o.militaryPower < k.militaryPower * 0.5 &&
    (o.stability || 50) < 35
  );

  if (enemies.length > 0 && (k.militaryPower || 0) > 20000 && (k.treasury || 0) > 40000) {
    return { action:"declare_war_diplomatic", target: enemies[0], priority: 78 };
  }

  // Đề xuất hòa bình với kẻ thù nếu yếu
  if (k.militaryPower < 5000 && k.allies.length < 2) {
    return { action:"seek_peace", priority: 70 };
  }

  return null;
}

// ── Áp dụng quyết định ngoại giao ──
function kaiApplyDiplomacyDecision(k, decision) {
  if (!decision || !k || k.isCollapsed) return;
  const year = window.year || 0;

  switch (decision.action) {
    case "declare_war_diplomatic":
      if (!decision.target) break;
      const target = decision.target;
      k.treasury = Math.max(0, (k.treasury || 0) - 30000);
      k.militaryPower -= Math.floor(k.militaryPower * 0.1);
      target.stability = Math.max(0, (target.stability || 50) - 20);
      target.collapseRisk = (target.collapseRisk || 0) + 20;

      if (typeof _we_setMutualRelation === "function") {
        try { _we_setMutualRelation(k.kingdomId, target.kingdomId, "war"); } catch(e2) {}
      }
      if (typeof warEngine_declareWar === "function") {
        try { warEngine_declareWar(k.kingdomId, target.kingdomId); } catch(e2) {}
      }
      if (typeof wmeRemember_war === "function") {
        try { wmeRemember_war(k.kingdomId, target.kingdomId); } catch(e2) {}
      }
      const warMsg = `⚔️ ${k.kingdomName} TUYÊN CHIẾN với ${target.kingdomName}!`;
      if (typeof addLog === "function") addLog(warMsg, "death");
      if (typeof htAddEvent === "function") htAddEvent({ year, type:"kingdom_war", text: warMsg, importance:"high" });
      break;

    case "seek_peace":
      k.stability = Math.min(100, (k.stability || 50) + 5);
      k.influence += 5;
      break;
  }
}

// ── Sync economyV2 treasury ──
function kaiV2EconomySync(k) {
  if (!k || k.isCollapsed) return;
  if (!window.ev2Banks || !window.ev2Banks[k.kingdomId]) return;
  const bank = window.ev2Banks[k.kingdomId];
  // Lấy thu nhập hàng năm từ ngân hàng
  if (bank.annualIncome) {
    k.treasury += Math.floor(bank.annualIncome * 0.1);
    bank.annualIncome = Math.max(0, bank.annualIncome - Math.floor(bank.annualIncome * 0.1));
  }
}

// ── Patch kaiTick để thêm quyết định tôn giáo và ngoại giao ──
const _kaiTick_original = typeof kaiTick === "function" ? kaiTick : null;
function kaiTick_v23() {
  if (_kaiTick_original) _kaiTick_original();
  if (!window.kingdomData) return;

  Object.values(window.kingdomData.kingdoms).forEach(k => {
    if (k.isCollapsed) return;

    // Quyết định tôn giáo
    const relDecision = kaiReligionDecide(k);
    if (relDecision) {
      kaiApplyReligionDecision(k, relDecision);
      k.lastReligionDecision = relDecision.action;
    }

    // Quyết định ngoại giao / chiến tranh
    const dipDecision = kaiDiplomacyDecide(k);
    if (dipDecision) {
      kaiApplyDiplomacyDecision(k, dipDecision);
    }

    // Đồng bộ kinh tế
    kaiV2EconomySync(k);
  });
}

// Gắn vào interval riêng (15s)
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    setInterval(function() {
      if (window.world && window.kingdomData) kaiTick_v23();
    }, 15000);
  }, 5500);
});

window.kaiTick_v23              = kaiTick_v23;
window.kaiReligionDecide        = kaiReligionDecide;
window.kaiApplyReligionDecision = kaiApplyReligionDecision;
window.kaiDiplomacyDecide       = kaiDiplomacyDecide;
