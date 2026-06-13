(function() {
  "use strict";

  // ─── PHÂN TÍCH THẾ GIỚI ───────────────────────────────────────────────────

  // Helper: chuyển kingdoms/empires object → array an toàn
  function _toArr(val) {
    if (!val) return [];
    return Array.isArray(val) ? val : Object.values(val);
  }

  window.waGetStrongestKingdom = function() {
    const kingdoms = _toArr(window.kingdomData && window.kingdomData.kingdoms);
    if (!kingdoms.length) return null;
    const active = kingdoms.filter(k => !k.collapsed && !k.dissolved);
    if (!active.length) return null;
    return active.reduce((best, k) => {
      const score = (k.power||0) + (k.population||0)/1000 + (k.wealth||0)/100 + (k.militaryStrength||0);
      const bscore = (best.power||0) + (best.population||0)/1000 + (best.wealth||0)/100 + (best.militaryStrength||0);
      return score > bscore ? k : best;
    }, active[0]);
  };

  window.waGetStrongestEmpire = function() {
    const empires = _toArr(window.empireData && window.empireData.empires);
    if (!empires.length) return null;
    const active = empires.filter(e => !e.collapsed && !e.dissolved);
    if (!active.length) return null;
    return active.reduce((best, e) => {
      const score = (e.power||0) + (e.population||0)/1000 + (e.territories||[]).length * 50;
      const bscore = (best.power||0) + (best.population||0)/1000 + (best.territories||[]).length * 50;
      return score > bscore ? e : best;
    }, active[0]);
  };

  window.waGetRichestKingdom = function() {
    const kingdoms = _toArr(window.kingdomData && window.kingdomData.kingdoms);
    const active = kingdoms.filter(k => !k.collapsed);
    if (!active.length) return null;
    return active.reduce((best, k) => ((k.wealth||k.treasury||0) > (best.wealth||best.treasury||0) ? k : best), active[0]);
  };

  window.waGetActiveWars = function() {
    return (window.warsActive || []).slice(0, 10);
  };

  window.waGetEconomicIssues = function() {
    const issues = [];
    const econ = window.economyData || {};
    if (econ.inflation > 50) issues.push({ type:"lạm phát", severity:"high", detail:`Lạm phát ${econ.inflation}%` });
    if (econ.unemployment > 30) issues.push({ type:"thất nghiệp", severity:"medium", detail:`Thất nghiệp ${econ.unemployment}%` });
    const crises = (window.econCrisisData && window.econCrisisData.activeEvents) || [];
    crises.forEach(c => issues.push({ type:"khủng hoảng", severity:"high", detail: c.name||"Khủng hoảng kinh tế" }));
    return issues;
  };

  window.waGetWorldThreats = function() {
    const threats = [];
    const wars = window.warsActive || [];
    if (wars.length >= 3) threats.push({ level:"high", title:"Đa chiến tuyến", desc:`${wars.length} cuộc chiến đồng thời` });
    const bosses = (window.wbv31Data && window.wbv31Data.activeBosses) || [];
    const divBosses = bosses.filter(b => b.tier === "divine" || b.tier === "creator");
    if (divBosses.length) threats.push({ level:"critical", title:"Boss Thần Thánh Tồn Tại", desc:`${divBosses.length} Boss cấp Thần đang hoạt động` });
    const invasions = (window.iev31Data && window.iev31Data.activeInvasions) || [];
    if (invasions.length) threats.push({ level:"critical", title:"Xâm Lược Đang Diễn Ra", desc:`${invasions.length} làn sóng xâm lược` });
    const plagues = (window.plagueData && window.plagueData.activePlagues) || [];
    if (plagues.length) threats.push({ level:"high", title:"Đại Dịch Hoành Hành", desc:`${plagues.length} dịch bệnh đang lan` });
    const disasters = (window.disasterData && window.disasterData.activeDisasters) || [];
    if (disasters.length >= 2) threats.push({ level:"high", title:"Thiên Tai Liên Tiếp", desc:`${disasters.length} thiên tai cùng lúc` });
    return threats;
  };

  window.waGetPowerRising = function() {
    const rising = [];
    const kingdoms = (window.kingdomData && window.kingdomData.kingdoms) || [];
    kingdoms.filter(k => !k.collapsed && k.growthRate > 0.1).slice(0,3).forEach(k =>
      rising.push({ name: k.name, type:"kingdom", growth: k.growthRate||0 })
    );
    const empires = (window.empireData && window.empireData.empires) || [];
    empires.filter(e => !e.collapsed && e.expansionRate > 0.1).slice(0,2).forEach(e =>
      rising.push({ name: e.name, type:"empire", growth: e.expansionRate||0 })
    );
    // Mạnh nhất theo power rank
    const allNpcs = window.npcs || [];
    const topNpc = allNpcs.filter(n => n.alive || n.alive === undefined).sort((a,b) => (b.power||b.qi||0) - (a.power||a.qi||0)).slice(0,3);
    topNpc.forEach(n => rising.push({ name: n.name, type:"cultivator", realm: n.realm||"?" }));
    return rising;
  };

  window.waGetWorldStabilityScore = function() {
    let score = 100;
    const wars = (window.warsActive || []).length;
    score -= wars * 8;
    const disasters = ((window.disasterData && window.disasterData.activeDisasters) || []).length;
    score -= disasters * 5;
    const plagues = ((window.plagueData && window.plagueData.activePlagues) || []).length;
    score -= plagues * 10;
    const invasions = ((window.iev31Data && window.iev31Data.activeInvasions) || []).length;
    score -= invasions * 15;
    const crises = ((window.econCrisisData && window.econCrisisData.activeEvents) || []).length;
    score -= crises * 5;
    return Math.max(0, Math.min(100, score));
  };

  window.waGetDivineStatus = function() {
    const deities = (window.divineBeingData && window.divineBeingData.deities) || [];
    const divineWars = (window.divineWarData && window.divineWarData.activeWars) || [];
    const pantheons = (window.pantheonV30Data && window.pantheonV30Data.pantheons) || [];
    return { deities, divineWars, pantheons,
      totalDeities: deities.length, totalWars: divineWars.length, totalPantheons: pantheons.length };
  };

  // Render panel World Report (phân tích toàn diện)
  window.waRenderReportPanel = function() {
    const panel = document.getElementById("panel-world-report");
    if (!panel) return;

    const yr = window.year || 0;
    const world = window.world || {};
    const npcs = window.npcs || [];
    const countries = window.countries || [];
    const stability = window.waGetWorldStabilityScore();
    const sColor = stability > 66 ? "#22c55e" : stability > 33 ? "#eab308" : "#ef4444";

    const bestKingdom = window.waGetStrongestKingdom();
    const bestEmpire = window.waGetStrongestEmpire();
    const richestKingdom = window.waGetRichestKingdom();
    const wars = window.waGetActiveWars();
    const threats = window.waGetWorldThreats();
    const rising = window.waGetPowerRising();
    const divStatus = window.waGetDivineStatus();
    const econIssues = window.waGetEconomicIssues();

    const kingdoms = _toArr(window.kingdomData && window.kingdomData.kingdoms);
    const empires = _toArr(window.empireData && window.empireData.empires);
    const sects = window.sects || [];
    const bosses = (window.wbv31Data && window.wbv31Data.activeBosses) || [];
    const living = npcs.filter(n => n.alive || n.alive === undefined).length;

    const fmt = window.thtFormatNum || (n => n);

    let html = `<div style="padding:16px;font-family:'Noto Serif SC',serif;color:#e2e8f0">
      <h2 style="color:#34d399;margin:0 0 4px">📖 Báo Cáo Thế Giới</h2>
      <p style="color:#94a3b8;margin:0 0 16px;font-size:13px">${world.name||"Chưa có thế giới"} · Năm ${yr}</p>

      <!-- Tổng Quan -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;margin-bottom:20px">
        ${_statCard("👥 Sinh Linh", fmt(living), "#60a5fa")}
        ${_statCard("🏯 Vương Quốc", (kingdoms.filter(k=>!k.collapsed).length), "#a78bfa")}
        ${_statCard("👑 Đế Chế", (empires.filter(e=>!e.collapsed).length), "#fbbf24")}
        ${_statCard("🏳 Quốc Gia", countries.length, "#94a3b8")}
        ${_statCard("⚔️ Chiến Tranh", wars.length, "#f87171")}
        ${_statCard("👹 Boss", bosses.length, "#ef4444")}
        ${_statCard("⚡ Thần", divStatus.totalDeities, "#818cf8")}
        ${_statCard("🏯 Tông Môn", sects.length, "#34d399")}
      </div>

      <!-- Ổn Định -->
      <div style="background:#0f172a;border-radius:8px;padding:14px;margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-weight:bold;color:#e2e8f0">⚖️ Độ Ổn Định Thế Giới</span>
          <span style="font-size:18px;font-weight:bold;color:${sColor}">${stability}/100</span>
        </div>
        <div style="background:#1e293b;border-radius:4px;height:8px;overflow:hidden">
          <div style="width:${stability}%;height:100%;background:${sColor};transition:width 0.5s"></div>
        </div>
      </div>

      <!-- Vương quốc & Đế chế mạnh nhất -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px">
          <div style="font-size:12px;color:#94a3b8;margin-bottom:6px">🏯 VƯƠNG QUỐC MẠNH NHẤT</div>
          ${bestKingdom ? `<div style="font-weight:bold;color:#a78bfa">${bestKingdom.name||"?"}</div>
            <div style="font-size:11px;color:#64748b">Giai đoạn: ${bestKingdom.stage||"?"} · Sức mạnh: ${fmt(bestKingdom.power||0)}</div>` :
            `<div style="color:#475569">Chưa có</div>`}
        </div>
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px">
          <div style="font-size:12px;color:#94a3b8;margin-bottom:6px">👑 ĐẾ CHẾ MẠNH NHẤT</div>
          ${bestEmpire ? `<div style="font-weight:bold;color:#fbbf24">${bestEmpire.name||"?"}</div>
            <div style="font-size:11px;color:#64748b">Lãnh thổ: ${(bestEmpire.territories||[]).length} vùng · Sức mạnh: ${fmt(bestEmpire.power||0)}</div>` :
            `<div style="color:#475569">Chưa có</div>`}
        </div>
      </div>

      <!-- Giàu nhất -->
      ${richestKingdom ? `<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-bottom:16px">
        <div style="font-size:12px;color:#94a3b8;margin-bottom:6px">💰 VƯƠNG QUỐC GIÀU NHẤT</div>
        <div style="font-weight:bold;color:#fbbf24">${richestKingdom.name||"?"}</div>
        <div style="font-size:11px;color:#64748b">Kho bạc: ${fmt(richestKingdom.wealth||richestKingdom.treasury||0)} vàng</div>
      </div>` : ""}

      <!-- Mối đe dọa -->
      ${threats.length ? `<div style="background:#0f172a;border:1px solid #7f1d1d;border-radius:8px;padding:12px;margin-bottom:16px">
        <div style="font-size:12px;color:#ef4444;margin-bottom:8px;font-weight:bold">⚠️ MỐI ĐE DỌA HIỆN TẠI</div>
        ${threats.map(t => `<div style="margin-bottom:6px;display:flex;align-items:flex-start;gap:8px">
          <span style="color:${t.level==='critical'?'#ef4444':'#f97316'};font-size:12px">●</span>
          <div><div style="font-size:12px;color:#fca5a5;font-weight:bold">${t.title}</div>
          <div style="font-size:11px;color:#94a3b8">${t.desc}</div></div>
        </div>`).join("")}
      </div>` : `<div style="background:#0f172a;border:1px solid #14532d;border-radius:8px;padding:12px;margin-bottom:16px">
        <div style="color:#22c55e;font-size:13px">✅ Không có mối đe dọa nghiêm trọng. Thế giới đang ổn định.</div>
      </div>`}

      <!-- Chiến tranh -->
      ${wars.length ? `<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-bottom:16px">
        <div style="font-size:12px;color:#f87171;margin-bottom:8px;font-weight:bold">⚔️ CHIẾN TRANH ĐANG DIỄN RA (${wars.length})</div>
        ${wars.slice(0,5).map(w=>`<div style="font-size:12px;color:#fca5a5;padding:4px 0;border-bottom:1px solid #1e293b">
          ${w.attacker||"?"} <span style="color:#ef4444">VS</span> ${w.defender||"?"}
          <span style="color:#475569;float:right">Năm ${w.startYear||yr}</span>
        </div>`).join("")}
      </div>` : ""}

      <!-- Quyền năng trỗi dậy -->
      ${rising.length ? `<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-bottom:16px">
        <div style="font-size:12px;color:#34d399;margin-bottom:8px;font-weight:bold">📈 QUYỀN NĂNG TRỖI DẬY</div>
        ${rising.slice(0,5).map(r=>`<div style="font-size:12px;color:#6ee7b7;padding:3px 0">
          ${r.type==="cultivator"?"🧘":r.type==="empire"?"👑":"🏯"} ${r.name||"?"} 
          <span style="color:#475569">${r.realm||""}</span>
        </div>`).join("")}
      </div>` : ""}

      <!-- Kinh tế -->
      ${econIssues.length ? `<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-bottom:16px">
        <div style="font-size:12px;color:#fbbf24;margin-bottom:8px;font-weight:bold">💹 VẤN ĐỀ KINH TẾ</div>
        ${econIssues.map(i=>`<div style="font-size:12px;color:#fde68a;padding:3px 0">⚠ ${i.detail}</div>`).join("")}
      </div>` : ""}

      <!-- Thần Thánh -->
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px">
        <div style="font-size:12px;color:#818cf8;margin-bottom:8px;font-weight:bold">⚡ CÕI THẦN THÁNH</div>
        <div style="font-size:12px;color:#a5b4fc">Số Thần: ${divStatus.totalDeities} · Thần Điện: ${divStatus.totalPantheons} · Thần Chiến: ${divStatus.totalWars}</div>
        ${divStatus.deities.slice(0,3).map(d=>`<div style="font-size:12px;color:#c4b5fd;padding:2px 0">⚡ ${d.name||"?"} — ${d.domain||"?"}</div>`).join("")}
      </div>

    </div>`;

    panel.innerHTML = html;
  };

  function _statCard(label, value, color) {
    return `<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;text-align:center">
      <div style="font-size:18px;font-weight:bold;color:${color}">${value||0}</div>
      <div style="font-size:11px;color:#64748b;margin-top:2px">${label}</div>
    </div>`;
  }

  console.log("[WorldAdvisor V33] 🌍 Cố Vấn Thế Giới khởi động — Phân tích Vương Quốc · Đế Chế · Chiến Tranh · Thần Thánh.");
})();
