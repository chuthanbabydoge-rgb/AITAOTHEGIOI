(function() {
  "use strict";

  // ─── CỐ VẤN THẦN SÁNG TẠO ───────────────────────────────────────────────

  window.caGetWorldStabilityReport = function() {
    const score = typeof window.waGetWorldStabilityScore === 'function' ? window.waGetWorldStabilityScore() : 50;
    let status, recommendation;
    if (score >= 80) {
      status = "✅ Thịnh Vượng";
      recommendation = "Thế giới đang phát triển tốt. Có thể mở rộng hệ thống thần thánh hoặc kích hoạt sự kiện đặc biệt.";
    } else if (score >= 60) {
      status = "🟡 Ổn Định";
      recommendation = "Thế giới tương đối ổn. Theo dõi các cuộc chiến tranh và kinh tế để can thiệp kịp thời.";
    } else if (score >= 40) {
      status = "🟠 Căng Thẳng";
      recommendation = "Thế giới đang căng thẳng. Hãy dùng Thiên Điểm để giải quyết xung đột hoặc ban phúc cho các vương quốc.";
    } else if (score >= 20) {
      status = "🔴 Nguy Hiểm";
      recommendation = "⚠ Thế giới đang trong tình trạng nguy hiểm! Cần can thiệp ngay — kết thúc chiến tranh, chữa lành thiên tai.";
    } else {
      status = "💀 HỖN LOẠN";
      recommendation = "🚨 KHẨN CẤP! Thế giới đang sụp đổ! Tạo Hóa cần hành động ngay lập tức!";
    }
    return { score, status, recommendation };
  };

  window.caGetDangerousEvents = function() {
    const events = [];
    const wars = window.warsActive || [];
    const longWars = wars.filter(w => (window.year||0) - (w.startYear||0) > 50);
    if (longWars.length > 0) {
      events.push({ level:"high", title:`${longWars.length} Cuộc Chiến Kéo Dài >50 Năm`, action:"Dùng Hội Đồng Thế Giới để yêu cầu hòa bình." });
    }
    const bosses = (window.wbv31Data && window.wbv31Data.activeBosses) || [];
    const dangerBosses = bosses.filter(b => b.tier === "divine" || b.tier === "creator" || b.tier === "mythic");
    if (dangerBosses.length > 0) {
      events.push({ level:"critical", title:`${dangerBosses.length} Boss Cấp Nguy Hiểm`, action:"Dùng Tạo Hóa Kiểm Soát → Boss → Tiêu Diệt Boss." });
    }
    const invasions = (window.iev31Data && window.iev31Data.activeInvasions) || [];
    if (invasions.length > 0) {
      events.push({ level:"critical", title:`${invasions.length} Làn Sóng Xâm Lược Đang Diễn Ra`, action:"Tăng cường phòng thủ hoặc dùng Thần Can Thiệp." });
    }
    const disasters = (window.disasterData && window.disasterData.activeDisasters) || [];
    const severeDisasters = disasters.filter(d => d.severity === "catastrophic" || d.severity === "severe");
    if (severeDisasters.length > 0) {
      events.push({ level:"high", title:`${severeDisasters.length} Thiên Tai Nghiêm Trọng`, action:"Dùng Ban Phúc Tạo Hóa để giảm thiểu tác hại." });
    }
    const plagues = (window.plagueData && window.plagueData.activePlagues) || [];
    if (plagues.length > 0) {
      events.push({ level:"high", title:`${plagues.length} Đại Dịch Bùng Phát`, action:"Gửi Thần Chữa Lành hoặc dùng Thánh Nước từ panel Thần." });
    }
    const divineWars = (window.divineWarData && window.divineWarData.activeWars) || [];
    if (divineWars.length > 0) {
      events.push({ level:"high", title:`${divineWars.length} Cuộc Chiến Thần Thánh`, action:"Dùng Kiểm Soát Thần → Kết Thúc Thần Chiến." });
    }
    const econCrises = (window.econCrisisData && window.econCrisisData.activeEvents) || [];
    if (econCrises.length > 0) {
      events.push({ level:"medium", title:`${econCrises.length} Khủng Hoảng Kinh Tế`, action:"Dùng Tạo Hóa Kiểm Soát → Kinh Tế để bơm vốn." });
    }
    return events;
  };

  window.caGetDivineConflicts = function() {
    const divineWars = (window.divineWarData && window.divineWarData.activeWars) || [];
    const deities = (window.divineBeingData && window.divineBeingData.deities) || [];
    const result = { wars: divineWars, deities: deities, totalConflicts: divineWars.length };
    return result;
  };

  window.caGetKingdomIssues = function() {
    const issues = [];
    const _kRaw2 = (window.kingdomData && window.kingdomData.kingdoms) || [];
    const kingdoms = Array.isArray(_kRaw2) ? _kRaw2 : Object.values(_kRaw2);
    const unstable = kingdoms.filter(k => !k.collapsed && k.stability < 30);
    if (unstable.length > 0) {
      issues.push({ type:"instability", kingdoms: unstable.slice(0,3).map(k=>k.name), desc:`${unstable.length} vương quốc bất ổn (ổn định <30)` });
    }
    const poor = kingdoms.filter(k => !k.collapsed && (k.wealth||k.treasury||0) < 10);
    if (poor.length > 0) {
      issues.push({ type:"poverty", kingdoms: poor.slice(0,3).map(k=>k.name), desc:`${poor.length} vương quốc kiệt quệ kinh tế` });
    }
    return issues;
  };

  window.caGetCreatorActions = function() {
    const suggested = [];
    const stability = typeof window.waGetWorldStabilityScore === 'function' ? window.waGetWorldStabilityScore() : 50;
    const wars = (window.warsActive || []).length;
    const bosses = (window.wbv31Data && window.wbv31Data.activeBosses) || [];
    const npcs = window.npcs || [];
    const living = npcs.filter(n=>n.alive||n.alive===undefined).length;

    if (wars > 5) {
      suggested.push({ priority:1, action:"Kết thúc chiến tranh", desc:"Quá nhiều cuộc chiến. Dùng Hội Đồng Thế Giới → Cầu Hòa.", panel:"world-council" });
    }
    if (bosses.length > 3) {
      suggested.push({ priority:2, action:"Tiêu diệt Boss nguy hiểm", desc:"Boss cấp cao đang đe dọa thế giới.", panel:"creator-control" });
    }
    if (living < 50 && (window.year||0) > 100) {
      suggested.push({ priority:3, action:"Tạo NPC mới", desc:"Dân số quá thấp. Dùng Creator Control để tạo thêm sinh linh.", panel:"creator-control" });
    }
    if (stability < 40) {
      suggested.push({ priority:4, action:"Ban Ân Điển Thế Giới", desc:"Thế giới bất ổn. Hãy ban Phúc Lành qua Thiên Đạo.", panel:"heavenly-dao" });
    }

    // Cơ hội
    const _kRaw3 = (window.kingdomData && window.kingdomData.kingdoms) || [];
    const kingdoms = Array.isArray(_kRaw3) ? _kRaw3 : Object.values(_kRaw3);
    if (kingdoms.filter(k=>!k.collapsed).length === 0 && (window.year||0) > 200) {
      suggested.push({ priority:5, action:"Tạo Vương Quốc Đầu Tiên", desc:"Chưa có vương quốc. Hãy kích hoạt qua Creator Control.", panel:"creator-control" });
    }
    return suggested.sort((a,b) => a.priority - b.priority);
  };

  // Render panel Cố Vấn Tạo Hóa
  window.caRenderCreatorPanel = function() {
    const container = document.getElementById("tht-creator-advisor");
    if (!container) return;

    const yr = window.year || 0;
    const stability = window.caGetWorldStabilityReport();
    const dangers = window.caGetDangerousEvents();
    const divineConflicts = window.caGetDivineConflicts();
    const kingdomIssues = window.caGetKingdomIssues();
    const actions = window.caGetCreatorActions();
    const sColor = stability.score > 66 ? "#22c55e" : stability.score > 33 ? "#eab308" : "#ef4444";

    const levelColor = { critical:"#ef4444", high:"#f97316", medium:"#eab308", low:"#22c55e" };

    let html = `<div style="font-family:'Noto Serif SC',serif;color:#e2e8f0">

      <!-- Ổn định -->
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:14px;margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:13px;font-weight:bold;color:#e2e8f0">⚖️ Ổn Định Thế Giới</span>
          <span style="font-size:20px;font-weight:bold;color:${sColor}">${stability.score}/100</span>
        </div>
        <div style="background:#1e293b;border-radius:4px;height:6px;margin-bottom:8px;overflow:hidden">
          <div style="width:${stability.score}%;height:100%;background:${sColor}"></div>
        </div>
        <div style="font-size:12px;color:${sColor};font-weight:bold;margin-bottom:4px">${stability.status}</div>
        <div style="font-size:12px;color:#94a3b8">${stability.recommendation}</div>
      </div>

      <!-- Sự kiện nguy hiểm -->
      ${dangers.length > 0 ? `<div style="background:#0f172a;border:1px solid #7f1d1d;border-radius:8px;padding:12px;margin-bottom:14px">
        <div style="font-size:12px;color:#ef4444;font-weight:bold;margin-bottom:10px">🚨 SỰ KIỆN NGUY HIỂM (${dangers.length})</div>
        ${dangers.map(d=>`<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #1e293b">
          <div style="font-size:12px;font-weight:bold;color:${levelColor[d.level]||'#94a3b8'}">${d.title}</div>
          <div style="font-size:11px;color:#94a3b8;margin-top:3px">💡 ${d.action}</div>
        </div>`).join("")}
      </div>` : `<div style="background:#0f172a;border:1px solid #14532d;border-radius:8px;padding:12px;margin-bottom:14px">
        <div style="color:#22c55e;font-size:13px">✅ Không có sự kiện nguy hiểm. Thế giới đang ổn định.</div>
      </div>`}

      <!-- Hành động đề xuất -->
      ${actions.length > 0 ? `<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-bottom:14px">
        <div style="font-size:12px;color:#60a5fa;font-weight:bold;margin-bottom:10px">💡 HÀNH ĐỘNG ĐỀ XUẤT</div>
        ${actions.slice(0,5).map(a=>`<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #0f172a">
          <span style="color:#fbbf24;font-size:11px;font-weight:bold;min-width:18px">#${a.priority}</span>
          <div>
            <div style="font-size:12px;font-weight:bold;color:#e2e8f0">${a.action}</div>
            <div style="font-size:11px;color:#64748b">${a.desc}</div>
            <button onclick="showPanel('${a.panel||'creator-control'}')" style="margin-top:4px;padding:2px 8px;background:#1e293b;border:1px solid #3b82f6;border-radius:3px;color:#60a5fa;cursor:pointer;font-size:11px">Mở Tab →</button>
          </div>
        </div>`).join("")}
      </div>` : ""}

      <!-- Xung đột thần thánh -->
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-bottom:14px">
        <div style="font-size:12px;color:#818cf8;font-weight:bold;margin-bottom:8px">⚡ CÕNG THẦN THÁNH</div>
        <div style="font-size:12px;color:#a5b4fc">Số Thần: ${divineConflicts.deities.length} · Thần Chiến: ${divineConflicts.totalConflicts}</div>
        ${divineConflicts.wars.slice(0,2).map(w=>`<div style="font-size:11px;color:#c4b5fd;padding:2px 0">⚔️ ${w.attacker||"?"} VS ${w.defender||"?"}</div>`).join("")}
      </div>

      <!-- Vấn đề vương quốc -->
      ${kingdomIssues.length > 0 ? `<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px">
        <div style="font-size:12px;color:#fbbf24;font-weight:bold;margin-bottom:8px">🏯 VẤN ĐỀ VƯƠNG QUỐC</div>
        ${kingdomIssues.map(i=>`<div style="font-size:12px;color:#fde68a;padding:3px 0">⚠ ${i.desc}: ${(i.kingdoms||[]).join(", ")}</div>`).join("")}
      </div>` : ""}
    </div>`;

    container.innerHTML = html;
  };

  console.log("[CreatorAdvisor V33] 👁️ Cố Vấn Tạo Hóa khởi động — Ổn Định · Nguy Hiểm · Thần Chiến · Vương Quốc · Kinh Tế.");
})();
