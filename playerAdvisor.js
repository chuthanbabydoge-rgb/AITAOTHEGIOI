(function() {
  "use strict";

  // ─── CỐ VẤN NGƯỜI CHƠI ───────────────────────────────────────────────────

  window.paGetPlayerStatus = function() {
    const player = window.player || window.playerData || {};
    const playerV28 = window.playerEngineData || {};
    const cultivation = window.cultivationPlayerData || {};
    const inventory = window.playerInventoryData || {};
    const territory = window.playerTerritoryData || {};
    const reputation = window.playerReputationData || {};
    const quests = window.playerQuestData || {};
    const ascension = window.ascensionData || {};
    return { player, playerV28, cultivation, inventory, territory, reputation, quests, ascension };
  };

  window.paGetCultivationAdvice = function() {
    const advice = [];
    const cult = window.cultivationPlayerData || {};
    const stage = cult.stage || cult.currentStage || 0;
    const progress = cult.progress || cult.breakthroughProgress || 0;

    if (stage === 0 || !cult.stage) {
      advice.push({ priority:"high", icon:"🧘", text:"Hãy bắt đầu tu luyện! Vào tab Nhân Vật để khởi động hành trình." });
    } else if (progress > 80) {
      advice.push({ priority:"high", icon:"⭐", text:`Đột phá sắp đến! Tiến trình ${Math.round(progress)}% — chuẩn bị linh đan và môi trường tu luyện.` });
    } else if (progress > 50) {
      advice.push({ priority:"medium", icon:"📈", text:`Tu luyện đang tiến triển tốt — ${Math.round(progress)}%. Tiếp tục không ngừng.` });
    } else {
      advice.push({ priority:"low", icon:"🌿", text:`Kiên trì tu luyện, tiến trình ${Math.round(progress)}%. Tích lũy linh khí mỗi ngày.` });
    }

    const ascension = window.ascensionData || {};
    if (ascension.level > 0) {
      advice.push({ priority:"medium", icon:"✨", text:`Đã thăng thiên cấp ${ascension.level}. Tiếp tục hoàn thành Sứ Mệnh Thần Thánh.` });
    }
    return advice;
  };

  window.paGetDiplomacyAdvice = function() {
    const advice = [];
    const territory = window.playerTerritoryData || {};
    const wars = window.warsActive || [];
    const playerKingdom = territory.kingdomId;

    // Kiểm tra chiến tranh ảnh hưởng đến player
    const myWars = wars.filter(w => w.attacker === playerKingdom || w.defender === playerKingdom);
    if (myWars.length > 0) {
      advice.push({ priority:"high", icon:"⚔️", text:`Vương quốc của bạn đang trong ${myWars.length} cuộc chiến. Cân nhắc thương lượng hòa bình.` });
    }

    // Liên minh
    const alliances = (window.allianceData && window.allianceData.alliances) || [];
    const myAlliances = alliances.filter(a => a.members && a.members.includes(playerKingdom));
    if (myAlliances.length === 0 && playerKingdom) {
      advice.push({ priority:"medium", icon:"🤝", text:"Chưa có liên minh. Hãy tìm kiếm đồng minh để tăng sức mạnh ngoại giao." });
    } else if (myAlliances.length > 0) {
      advice.push({ priority:"low", icon:"🤝", text:`Đang có ${myAlliances.length} liên minh. Duy trì và củng cố quan hệ đồng minh.` });
    }

    return advice;
  };

  window.paGetTradeAdvice = function() {
    const advice = [];
    const inventory = window.playerInventoryData || {};
    const items = (inventory.items || []).length;

    if (items === 0) {
      advice.push({ priority:"medium", icon:"💰", text:"Kho đồ trống. Tham gia dungeon/raid để thu thập tài nguyên và linh đan." });
    } else if (items > 10) {
      advice.push({ priority:"low", icon:"🛒", text:`Kho đồ có ${items} vật phẩm. Xem xét bán/trao đổi hàng hóa dư thừa tại Chợ Thế Giới.` });
    }

    // Kiểm tra kinh tế thế giới
    const crises = (window.econCrisisData && window.econCrisisData.activeEvents) || [];
    if (crises.length > 0) {
      advice.push({ priority:"high", icon:"📉", text:`Khủng hoảng kinh tế đang xảy ra! Hạn chế giao dịch lớn, giữ linh thạch an toàn.` });
    }
    return advice;
  };

  window.paGetWarAdvice = function() {
    const advice = [];
    const reputation = window.playerReputationData || {};
    const repLevel = reputation.level || reputation.reputationLevel || 0;
    const repScore = reputation.score || reputation.totalScore || 0;

    const bosses = (window.wbv31Data && window.wbv31Data.activeBosses) || [];
    const weakBosses = bosses.filter(b => b.tier === "rare" || b.tier === "epic");
    if (weakBosses.length > 0) {
      advice.push({ priority:"medium", icon:"⚔️", text:`${weakBosses.length} Boss cấp thấp đang hoạt động. Đây là cơ hội tốt để tích lũy kinh nghiệm và loot.` });
    }

    const raids = (window.rev31Data && window.rev31Data.activeRaids) || [];
    if (raids.length > 0) {
      advice.push({ priority:"medium", icon:"🗡️", text:`${raids.length} cuộc raid đang diễn ra. Tham gia để nhận phần thưởng.` });
    }

    if (repScore < 100) {
      advice.push({ priority:"low", icon:"🌟", text:"Danh tiếng còn thấp. Hãy hoàn thành nhiệm vụ và chiến đấu chống Boss để nâng uy danh." });
    }
    return advice;
  };

  window.paGetAscensionAdvice = function() {
    const advice = [];
    const ascension = window.ascensionData || {};
    const missions = (ascension.missions || []).filter(m => m.status === "active");

    if (!ascension.level || ascension.level === 0) {
      advice.push({ priority:"low", icon:"🌅", text:"Bạn chưa thăng thiên. Đạt đến cảnh giới Tiên Nhân để bắt đầu con đường thần thánh." });
    } else {
      if (missions.length > 0) {
        advice.push({ priority:"medium", icon:"📜", text:`Có ${missions.length} Sứ Mệnh Thần Thánh đang chờ. Hoàn thành để nhận Thần Quyền.` });
      }
      advice.push({ priority:"low", icon:"⭐", text:`Cấp Thăng Thiên: ${ascension.level}. Tiếp tục thu thập Thần Lực để lên cấp tiếp theo.` });
    }
    return advice;
  };

  // Render panel cố vấn người chơi
  window.paRenderPanel = function() {
    const panel = document.getElementById("panel-advisor");
    if (!panel) return;
    const yr = window.year || 0;
    const status = window.paGetPlayerStatus();
    const cult = window.paGetCultivationAdvice();
    const diplo = window.paGetDiplomacyAdvice();
    const trade = window.paGetTradeAdvice();
    const war = window.paGetWarAdvice();
    const ascend = window.paGetAscensionAdvice();

    const player = status.player;
    const playerV28 = status.playerV28;
    const cultivation = status.cultivation;
    const territory = status.territory;
    const ascension = status.ascension;

    const fmt = window.thtFormatNum || (n => n);
    const prioColor = { high:"#ef4444", medium:"#f97316", low:"#22c55e" };

    function renderAdviceList(list) {
      if (!list.length) return `<div style="color:#475569;font-size:12px;padding:6px">Không có khuyến nghị đặc biệt.</div>`;
      return list.map(a => `<div style="display:flex;gap:8px;align-items:flex-start;padding:6px 0;border-bottom:1px solid #0f172a">
        <span style="font-size:16px">${a.icon||"•"}</span>
        <div>
          <div style="font-size:12px;color:#e2e8f0">${a.text}</div>
          <span style="font-size:11px;color:${prioColor[a.priority]||'#64748b'}">[Ưu tiên ${a.priority||"thấp"}]</span>
        </div>
      </div>`).join("");
    }

    let html = `<div style="padding:16px;font-family:'Noto Serif SC',serif;color:#e2e8f0">
      <h2 style="color:#818cf8;margin:0 0 4px">📊 Cố Vấn Người Chơi</h2>
      <p style="color:#94a3b8;margin:0 0 16px;font-size:13px">Năm ${yr} · Phân tích & Khuyến nghị cá nhân</p>

      <!-- Trạng thái người chơi -->
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:14px;margin-bottom:16px">
        <div style="font-size:12px;color:#94a3b8;font-weight:bold;margin-bottom:10px">👤 TRẠNG THÁI NGƯỜI CHƠI</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">
          <div><span style="color:#64748b">Tên:</span> <span style="color:#e2e8f0">${player.name||playerV28.name||"Chưa đặt tên"}</span></div>
          <div><span style="color:#64748b">Cảnh giới:</span> <span style="color:#a78bfa">${cultivation.stageName||cultivation.currentStageName||player.realm||"Phàm Nhân"}</span></div>
          <div><span style="color:#64748b">Cấp thăng thiên:</span> <span style="color:#fbbf24">${ascension.level||0}</span></div>
          <div><span style="color:#64748b">Lãnh thổ:</span> <span style="color:#34d399">${territory.level||territory.tierName||"Chưa có"}</span></div>
          <div><span style="color:#64748b">Uy danh:</span> <span style="color:#60a5fa">${status.reputation.level||status.reputation.reputationLevel||0}</span></div>
          <div><span style="color:#64748b">Nhiệm vụ:</span> <span style="color:#f59e0b">${(status.quests.active||[]).length||0} đang thực hiện</span></div>
        </div>
      </div>

      <!-- Khuyến nghị theo lĩnh vực -->
      ${_adviceSection("🧘 TU LUYỆN", cult, "#a78bfa")}
      ${_adviceSection("🌅 THĂNG THIÊN", ascend, "#fbbf24")}
      ${_adviceSection("⚔️ CHIẾN ĐẤU & BOSS", war, "#ef4444")}
      ${_adviceSection("🤝 NGOẠI GIAO", diplo, "#22c55e")}
      ${_adviceSection("💰 THƯƠNG MẠI", trade, "#60a5fa")}

      <p style="color:#334155;font-size:11px;margin-top:16px;text-align:center">Thủ Hộ Thần phân tích trạng thái thế giới · Cập nhật mỗi tick</p>
    </div>`;

    panel.innerHTML = html;

    function _adviceSection(title, list, color) {
      return `<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-bottom:12px">
        <div style="font-size:12px;color:${color};font-weight:bold;margin-bottom:8px">${title}</div>
        ${renderAdviceList(list)}
      </div>`;
    }
  };

  console.log("[PlayerAdvisor V33] 👤 Cố Vấn Người Chơi khởi động — Tu Luyện · Ngoại Giao · Thương Mại · Chiến Tranh · Thăng Thiên.");
})();
