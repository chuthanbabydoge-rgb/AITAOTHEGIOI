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
