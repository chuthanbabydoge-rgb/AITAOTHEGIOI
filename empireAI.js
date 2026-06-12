// ============================================================
// EMPIRE AI V23
// CREATOR GOD — V23 EMPIRE & KINGDOM ENGINE
// AI tự động quản lý đế quốc mỗi chu kỳ
// Tương thích 100% save cũ — KHÔNG xóa dữ liệu
// ============================================================

const EAI_VERSION = 23;

// ── Đánh giá trạng thái đế quốc ──
function eaiEvaluate(e) {
  if (!e || e.isCollapsed) return null;
  return {
    borderSecurity: Math.min(100, e.totalArmy / 500),
    economy:        Math.min(100, e.totalWealth / 50000),
    stability:      e.stability || 50,
    loyalty:        Math.min(100, 100 - e.rebellionRisk),
    influence:      Math.min(100, e.influence / 20),
    size:           e.memberKingdoms.length * 10,
  };
}

// ── Ra quyết định ──
function eaiDecide(emp) {
  const score = eaiEvaluate(emp);
  if (!score) return null;

  const decisions = [];

  if (score.stability < 40) {
    decisions.push({ action:"crush_rebellion", priority: 95 + Math.random() * 5 });
  }
  if (score.borderSecurity < 30) {
    decisions.push({ action:"build_military",  priority: 85 + Math.random() * 10 });
  }
  if (score.economy < 30) {
    decisions.push({ action:"invest_economy",  priority: 80 + Math.random() * 10 });
  }
  if (score.loyalty < 50 && emp.rebellionRisk > 50) {
    decisions.push({ action:"create_vassals",  priority: 75 + Math.random() * 15 });
  }
  if (score.stability > 70 && score.economy > 60 && emp.memberKingdoms.length < 8) {
    decisions.push({ action:"expand_empire",   priority: 65 + Math.random() * 20 });
  }
  if (score.economy > 70 && emp.wonders && emp.wonders.length < 3) {
    decisions.push({ action:"build_wonder",    priority: 60 + Math.random() * 20 });
  }
  if (score.influence < 50) {
    decisions.push({ action:"invest_technology",priority: 55 + Math.random() * 20 });
  }

  decisions.push({ action:"consolidate", priority: 20 + Math.random() * 20 });

  decisions.sort((a, b) => b.priority - a.priority);
  return decisions[0];
}

// ── Áp dụng quyết định đế quốc ──
function eaiApplyDecision(emp, decision) {
  if (!decision || !emp || emp.isCollapsed) return;
  const year = window.year || 0;
  let msg = "";

  switch (decision.action) {
    case "crush_rebellion":
      if (emp.totalWealth > 50000) {
        emp.totalWealth    -= 50000;
        emp.rebellionRisk   = Math.max(0, emp.rebellionRisk - 30);
        emp.stability       = Math.min(100, emp.stability + 15);
        emp.totalArmy      -= Math.floor(emp.totalArmy * 0.05);
        msg = `⚔️ ${emp.empireName} dẹp tan phản loạn nội bộ! Ổn định được khôi phục.`;
        if (typeof addLog === "function") addLog(msg, "important");
        if (typeof htAddEvent === "function") htAddEvent({ year, type: "empire_event", text: msg });
        emp.history.push({ year, event: msg });
      }
      break;

    case "build_military":
      if (emp.totalWealth > 80000) {
        const recruited = Math.floor(Math.random() * 5000 + 2000);
        emp.totalWealth -= 80000;
        emp.totalArmy   += recruited;
        emp.stability    = Math.min(100, emp.stability + 5);
      }
      break;

    case "invest_economy":
      emp.totalWealth += Math.floor(emp.totalPopulation * 0.01 + emp.memberKingdoms.length * 5000);
      emp.influence   += 10;
      break;

    case "create_vassals":
      // Biến kingdoms yếu thành vassal thay vì thành viên trực tiếp
      if (window.kingdomData) {
        const nonMembers = Object.values(window.kingdomData.kingdoms).filter(k =>
          !k.isCollapsed && !k.empireId && k.militaryPower < emp.totalArmy * 0.1
        ).slice(0, 2);
        nonMembers.forEach(k => {
          emp.vassalKingdoms = emp.vassalKingdoms || [];
          emp.vassalKingdoms.push(k.kingdomId);
          k.empireId  = emp.empireId;
          k.stability = Math.max(0, k.stability - 10);
        });
        if (nonMembers.length > 0) {
          emp.rebellionRisk = Math.max(0, emp.rebellionRisk - 15);
          emp.influence    += 30;
          msg = `📜 ${emp.empireName} thiết lập ${nonMembers.length} vương quốc chư hầu mới!`;
          if (typeof addLog === "function") addLog(msg, "info");
          if (typeof htAddEvent === "function") htAddEvent({ year, type: "empire_event", text: msg });
        }
      }
      break;

    case "expand_empire":
      if (window.kingdomData && emp.totalWealth > 100000 && emp.totalArmy > 20000) {
        const candidates = Object.values(window.kingdomData.kingdoms).filter(k =>
          !k.isCollapsed && !k.empireId && k.militaryPower < emp.totalArmy * 0.3
        );
        if (candidates.length > 0) {
          const target = candidates[Math.floor(Math.random() * candidates.length)];
          emp.totalWealth    -= 100000;
          emp.totalArmy      -= 10000;
          emp.memberKingdoms.push(target.kingdomId);
          target.empireId    = emp.empireId;
          target.stability   = Math.max(0, target.stability - 20);
          emp.totalPopulation += target.population;
          emp.totalWealth    += target.treasury * 0.3;
          emp.influence      += 50;
          msg = `👑 ${emp.empireName} sáp nhập ${target.kingdomName} vào đế quốc!`;
          if (typeof addLog === "function") addLog(msg, "important");
          if (typeof htAddEvent === "function") htAddEvent({ year, type: "empire_event", text: msg, empireId: emp.empireId });
          emp.history.push({ year, event: msg });
          if (typeof keSave === "function") keSave();
        }
      }
      break;

    case "build_wonder":
      const EE_WONDERS_AI = [
        "Tháp Vạn Kiếm","Thần Long Cung","Thiên Đế Điện","Vĩnh Hằng Đài",
        "Hải Thiên Thần Miếu","Lôi Oa Đại Pháo Đài","Thái Cổ Thần Tượng"
      ];
      if (emp.totalWealth > 200000) {
        const available = EE_WONDERS_AI.filter(w => !emp.wonders.includes(w));
        if (available.length > 0) {
          const wonder = available[Math.floor(Math.random() * available.length)];
          emp.wonders.push(wonder);
          emp.totalWealth -= 200000;
          emp.influence   += 200;
          emp.stability    = Math.min(100, emp.stability + 10);
          msg = `🏛️ ${emp.empireName} hoàn thành kỳ quan: ${wonder}!`;
          if (typeof addLog === "function") addLog(msg, "important");
          if (typeof htAddEvent === "function") htAddEvent({ year, type: "wonder_built", text: msg, empireId: emp.empireId });
        }
      }
      break;

    case "invest_technology":
      emp.tradeBonus    = Math.min(0.5, (emp.tradeBonus || 0.15) + 0.02);
      emp.researchBonus = Math.min(0.5, (emp.researchBonus || 0.12) + 0.02);
      emp.influence    += 20;
      if (emp.totalWealth > 30000) emp.totalWealth -= 30000;
      break;

    case "consolidate":
    default:
      emp.stability     = Math.min(100, (emp.stability || 50) + 3);
      emp.rebellionRisk = Math.max(0, (emp.rebellionRisk || 0) - 3);
      emp.totalWealth  += Math.floor(emp.memberKingdoms.length * 2000);
      break;
  }
}

// ── TICK toàn bộ empires ──
function eaiTick() {
  if (!window.empireData) return;

  Object.values(window.empireData.empires).forEach(emp => {
    if (emp.isCollapsed) return;
    const decision = eaiDecide(emp);
    if (decision) {
      eaiApplyDecision(emp, decision);
      emp.lastAIDecision = decision.action;
    }
  });

  if (typeof eeSave === "function") eeSave();
}

// ── Auto tick mỗi 18 giây ──
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    setInterval(function() {
      if (window.world && window.empireData) eaiTick();
    }, 18000);
  }, 3500);
});
