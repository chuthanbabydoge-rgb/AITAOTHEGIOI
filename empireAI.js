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

// ============================================================
// EMPIRE AI V23 — EXPANSION PACK
// Vassal Tribute AI, Conquest War AI, Province Management
// EXPAND ONLY — không xóa dữ liệu cũ
// ============================================================

// ── Quyết định mở rộng AI đế quốc ──
function eaiExtendedDecide(emp) {
  if (!emp || emp.isCollapsed) return null;
  const score = eaiEvaluate(emp);
  if (!score) return null;
  const decisions = [];

  // Thu cống từ chư hầu
  if ((emp.vassalKingdoms || []).length > 0) {
    decisions.push({ action:"collect_tribute",   priority: 90 + Math.random() * 5 });
  }
  // Chiến tranh chinh phục khi ổn định cao
  if (score.stability > 65 && score.economy > 55 && emp.memberKingdoms.length < 9) {
    decisions.push({ action:"conquest_war",      priority: 78 + Math.random() * 12 });
  }
  // Quản lý tỉnh nội bộ
  if (score.loyalty < 60) {
    decisions.push({ action:"manage_provinces",  priority: 82 + Math.random() * 8 });
  }
  // Thăng hạng chư hầu thành thành viên chính thức
  if ((emp.vassalKingdoms || []).length > 3 && score.stability > 70) {
    decisions.push({ action:"integrate_vassal",  priority: 65 + Math.random() * 15 });
  }
  // Bổ nhiệm hoàng thái tử
  if (!emp.heirDesignated && score.stability > 60) {
    decisions.push({ action:"designate_heir",    priority: 55 + Math.random() * 10 });
  }
  // Cải cách luật pháp
  if (score.stability < 50 && (emp.totalWealth || 0) > 60000) {
    decisions.push({ action:"legal_reform",      priority: 72 + Math.random() * 8 });
  }

  return decisions.length > 0
    ? decisions.sort((a,b) => b.priority - a.priority)[0]
    : null;
}

// ── Áp dụng quyết định mở rộng ──
function eaiApplyExtendedDecision(emp, decision) {
  if (!decision || !emp || emp.isCollapsed) return;
  const year = window.year || 0;
  let msg = "";

  switch (decision.action) {
    case "collect_tribute":
      if (typeof eeTributeVassals === "function") {
        eeTributeVassals(emp);
      } else {
        // Fallback thu cống thủ công
        const vassals = emp.vassalKingdoms || [];
        let total = 0;
        vassals.forEach(vid => {
          if (window.kingdomData && window.kingdomData.kingdoms[vid]) {
            const v = window.kingdomData.kingdoms[vid];
            const t = Math.floor((v.treasury || 0) * 0.07);
            v.treasury  = Math.max(0, (v.treasury || 0) - t);
            emp.totalWealth += t;
            total += t;
          }
        });
        if (total > 0) {
          msg = `💰 ${emp.empireName} thu ${total.toLocaleString()} vàng cống phẩm từ ${vassals.length} chư hầu.`;
          if (typeof addLog === "function") addLog(msg, "info");
        }
      }
      break;

    case "conquest_war":
      if (typeof eeConquestWar === "function") {
        eeConquestWar(emp);
      } else if (window.kingdomData && emp.totalWealth > 100000 && emp.totalArmy > 20000) {
        const candidates = Object.values(window.kingdomData.kingdoms).filter(k =>
          !k.isCollapsed && !k.empireId && k.militaryPower < emp.totalArmy * 0.3
        );
        if (candidates.length > 0) {
          const target = candidates[Math.floor(Math.random() * candidates.length)];
          emp.totalWealth -= 100000;
          emp.totalArmy   -= 12000;
          emp.memberKingdoms.push(target.kingdomId);
          target.empireId  = emp.empireId;
          target.stability = Math.max(0, (target.stability || 50) - 25);
          emp.influence   += 70;
          msg = `⚔️👑 ${emp.empireName} chinh phục ${target.kingdomName} qua chiến tranh AI!`;
          if (typeof addLog === "function") addLog(msg, "death");
          if (typeof htAddEvent === "function") htAddEvent({ year, type:"empire_conquest", text: msg, importance:"high" });
          if (typeof _we_setMutualRelation === "function") {
            try { _we_setMutualRelation(emp.empireId, target.kingdomId, "conquered"); } catch(e2) {}
          }
          if (typeof wmeRemember_war === "function") {
            try { wmeRemember_war(emp.empireId, target.kingdomId); } catch(e2) {}
          }
        }
      }
      break;

    case "manage_provinces":
      // Tăng loyalty bằng cách giảm thuế nội bộ
      emp.totalWealth  -= Math.floor(emp.totalWealth * 0.04);
      emp.rebellionRisk = Math.max(0, emp.rebellionRisk - 12);
      emp.stability     = Math.min(100, emp.stability + 8);
      msg = `📜 ${emp.empireName} tổ chức kiểm tra tỉnh thành → loyalty tăng`;
      if (typeof addLog === "function") addLog(msg, "info");
      break;

    case "integrate_vassal":
      if (window.kingdomData && (emp.vassalKingdoms || []).length > 0) {
        const vid = emp.vassalKingdoms[0];
        const vassal = window.kingdomData.kingdoms[vid];
        if (vassal && !vassal.isCollapsed) {
          emp.vassalKingdoms = emp.vassalKingdoms.filter(id => id !== vid);
          if (!emp.memberKingdoms.includes(vid)) emp.memberKingdoms.push(vid);
          vassal.stability = Math.min(100, (vassal.stability || 50) + 10);
          emp.influence   += 30;
          msg = `📋 ${emp.empireName} chính thức tích hợp ${vassal.kingdomName} từ chư hầu → thành viên!`;
          if (typeof addLog === "function") addLog(msg, "info");
          if (typeof htAddEvent === "function") htAddEvent({ year, type:"empire_event", text: msg });
        }
      }
      break;

    case "designate_heir":
      const HEIR_NAMES = ["Long Thiên Tử","Phượng Thái Tử","Minh Hoàng Tử","Hắc Đế Truyền Nhân","Thiên Long Kế"];
      emp.heirDesignated = HEIR_NAMES[Math.floor(Math.random() * HEIR_NAMES.length)];
      emp.stability      = Math.min(100, emp.stability + 5);
      msg = `👑 ${emp.empireName} chính thức bổ nhiệm ${emp.heirDesignated} làm Hoàng Thái Tử!`;
      if (typeof addLog === "function") addLog(msg, "info");
      if (typeof htAddEvent === "function") htAddEvent({ year, type:"empire_event", text: msg });
      break;

    case "legal_reform":
      if (emp.totalWealth > 60000) {
        emp.totalWealth  -= 60000;
        emp.stability     = Math.min(100, emp.stability + 12);
        emp.rebellionRisk = Math.max(0, emp.rebellionRisk - 20);
        emp.influence    += 30;
        msg = `⚖️ ${emp.empireName} ban hành CẢI CÁCH LUẬT PHÁP! Ổn định tăng mạnh.`;
        if (typeof addLog === "function") addLog(msg, "important");
        if (typeof htAddEvent === "function") htAddEvent({ year, type:"empire_event", text: msg, importance:"medium" });
        emp.history.push({ year, event: msg });
      }
      break;
  }
}

// ── Patch eaiTick để tích hợp quyết định mở rộng ──
const _eaiTick_original = typeof eaiTick === "function" ? eaiTick : null;
function eaiTick_v23() {
  if (_eaiTick_original) _eaiTick_original();
  if (!window.empireData) return;

  Object.values(window.empireData.empires).forEach(emp => {
    if (emp.isCollapsed) return;
    const decision = eaiExtendedDecide(emp);
    if (decision) {
      eaiApplyExtendedDecision(emp, decision);
      emp.lastExtendedDecision = decision.action;
    }
  });
  if (typeof eeSave === "function") eeSave();
}

// Chạy riêng mỗi 18s
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    setInterval(function() {
      if (window.world && window.empireData) eaiTick_v23();
    }, 18000);
  }, 6000);
});

window.eaiTick_v23               = eaiTick_v23;
window.eaiExtendedDecide         = eaiExtendedDecide;
window.eaiApplyExtendedDecision  = eaiApplyExtendedDecision;
