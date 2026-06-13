(function() {
  "use strict";
  // ============================================================
  // DISASTER REGISTRY V48 — Hub Widget & 6 Sub-Panels
  // ============================================================
  // Passive: không có gameTick, không có save key riêng
  // UI tích hợp trong 🌌 Đa Vũ Trụ V35 hub (mvHubRenderPanel)

  // ── HUB WIDGET ──
  window.disasterV48HubRenderPanel = function() {
    const gdStats = typeof window.gdV48GetStats === "function" ? window.gdV48GetStats() : {};
    const anomStats = typeof window.anomV48GetStats === "function" ? window.anomV48GetStats() : {};
    const mvStats = typeof window.mvdV48GetStats === "function" ? window.mvdV48GetStats() : {};
    const v25Disasters = (window.disasterData || {}).history || [];
    const v25Plagues = (window.plagueData || {}).history || [];

    const totalDisasters = (gdStats.totalGlobalEvents || 0) + v25Disasters.length;
    const totalPlagues = v25Plagues.length;
    const totalAnomalies = anomStats.totalAnomalies || 0;
    const totalMv = mvStats.totalMvDisasters || 0;
    const warnings = typeof window.gdV48GetWarnings === "function" ? window.gdV48GetWarnings().filter(w => !w.resolved).length : 0;

    return '<div style="background:linear-gradient(135deg,#1a0505,#0f172a);border:1px solid #dc262644;border-radius:12px;padding:16px;margin-bottom:16px">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'
      + '<div>'
      + '<h3 style="margin:0 0 3px;font-size:16px;color:#dc2626;font-family:Cinzel,serif">🌋 Thiên Tai & Thảm Họa Toàn Cầu V48</h3>'
      + '<div style="font-size:11px;color:#475569">Chain Reaction · Dị Tượng · Đa Vũ Trụ · Cảnh Báo</div>'
      + '</div>'
      + '<button onclick="showPanel(\'disaster-v48\');if(typeof disasterV48RenderPanel===\'function\')disasterV48RenderPanel(\'disasters\');" style="background:#dc262622;border:1px solid #dc262644;color:#dc2626;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:11px">Mở Rộng →</button>'
      + '</div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:8px;margin-bottom:12px">'
      + '<div style="background:#0f172a;border:1px solid #dc262644;border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:700;color:#dc2626">' + totalDisasters + '</div><div style="font-size:10px;color:#64748b">🌋 Thiên Tai</div></div>'
      + '<div style="background:#0f172a;border:1px solid #7c3aed44;border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:700;color:#7c3aed">' + totalPlagues + '</div><div style="font-size:10px;color:#64748b">💀 Đại Dịch</div></div>'
      + '<div style="background:#0f172a;border:1px solid #8b5cf644;border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:700;color:#8b5cf6">' + totalAnomalies + '</div><div style="font-size:10px;color:#64748b">🌀 Dị Tượng</div></div>'
      + '<div style="background:#0f172a;border:1px solid #f59e0b44;border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:700;color:#f59e0b">' + totalMv + '</div><div style="font-size:10px;color:#64748b">💥 Đa Vũ Trụ</div></div>'
      + '<div style="background:#0f172a;border:1px solid #ef444444;border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:700;color:#ef4444">' + warnings + '</div><div style="font-size:10px;color:#64748b">⚠️ Cảnh Báo</div></div>'
      + '</div>'
      + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
      + '<button onclick="showPanel(\'disaster-v48\');if(typeof disasterV48RenderPanel===\'function\')disasterV48RenderPanel(\'disasters\');" style="background:#dc262622;border:1px solid #dc262644;color:#dc2626;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px">🌋 Thiên Tai</button>'
      + '<button onclick="showPanel(\'disaster-v48\');if(typeof disasterV48RenderPanel===\'function\')disasterV48RenderPanel(\'plagues\');" style="background:#7c3aed22;border:1px solid #7c3aed44;color:#7c3aed;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px">💀 Đại Dịch</button>'
      + '<button onclick="showPanel(\'disaster-v48\');if(typeof disasterV48RenderPanel===\'function\')disasterV48RenderPanel(\'anomalies\');" style="background:#8b5cf622;border:1px solid #8b5cf644;color:#8b5cf6;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px">🌀 Dị Tượng</button>'
      + '<button onclick="showPanel(\'disaster-v48\');if(typeof disasterV48RenderPanel===\'function\')disasterV48RenderPanel(\'crisis\');" style="background:#f59e0b22;border:1px solid #f59e0b44;color:#f59e0b;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px">💹 Khủng Hoảng</button>'
      + '<button onclick="showPanel(\'disaster-v48\');if(typeof disasterV48RenderPanel===\'function\')disasterV48RenderPanel(\'warnings\');" style="background:#ef444422;border:1px solid #ef444444;color:#ef4444;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px">⚠️ Cảnh Báo</button>'
      + '<button onclick="showPanel(\'disaster-v48\');if(typeof disasterV48RenderPanel===\'function\')disasterV48RenderPanel(\'stats\');" style="background:#06b6d422;border:1px solid #06b6d444;color:#06b6d4;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px">📊 Thống Kê</button>'
      + '</div>'
      + '</div>';
  };

  // ── MAIN PANEL ──
  let _activeTab = "disasters";

  window.disasterV48RenderPanel = function(tab) {
    if (tab) _activeTab = tab;
    const container = document.getElementById("panel-disaster-v48");
    if (!container) return;

    const gdStats = typeof window.gdV48GetStats === "function" ? window.gdV48GetStats() : {};
    const anomStats = typeof window.anomV48GetStats === "function" ? window.anomV48GetStats() : {};
    const mvStats = typeof window.mvdV48GetStats === "function" ? window.mvdV48GetStats() : {};
    const v25History = (window.disasterData || {}).history || [];
    const v25Active = (window.disasterData || {}).activeDisasters || [];
    const plagueHistory = (window.plagueData || {}).history || [];
    const activePlagues = (window.plagueData || {}).activePlagues || [];
    const econEvents = (window.econCrisisData || {}).history || [];
    const activeEcon = (window.econCrisisData || {}).activeEvents || [];

    container.innerHTML = `
      <div style="max-width:1200px;margin:0 auto;padding:16px;font-family:sans-serif">
        <div style="background:linear-gradient(135deg,#1a0505,#0f172a);border:1px solid #dc262644;border-radius:12px;padding:20px;margin-bottom:16px">
          <h2 style="margin:0 0 6px;font-size:22px;color:#dc2626;font-family:Cinzel,serif">🌋 THIÊN TAI & THẢM HỌA TOÀN CẦU V48</h2>
          <p style="margin:0;color:#64748b;font-size:12px">Chain Reaction · Dị Tượng Thần Bí · Thảm Họa Đa Vũ Trụ · AI Phản Ứng · Cảnh Báo Thời Gian Thực</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:8px;margin-top:14px">
            ${[
              ["🌋","Thiên Tai",(gdStats.totalGlobalEvents||0)+v25History.length,"#dc2626"],
              ["💀","Đại Dịch",plagueHistory.length,"#7c3aed"],
              ["🌀","Dị Tượng",anomStats.totalAnomalies||0,"#8b5cf6"],
              ["💥","Đa Vũ Trụ",mvStats.totalMvDisasters||0,"#f59e0b"],
              ["⚡","Chain RX",gdStats.totalChainReactions||0,"#ef4444"],
              ["🤝","AI Phản Ứng",gdStats.totalAIResponses||0,"#10b981"],
            ].map(([icon,label,val,color])=>`
              <div style="background:#0f172a;border:1px solid ${color}44;border-radius:8px;padding:10px;text-align:center">
                <div style="font-size:20px;font-weight:700;color:${color}">${val}</div>
                <div style="font-size:10px;color:#64748b">${icon} ${label}</div>
              </div>
            `).join("")}
          </div>
        </div>

        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">
          ${[
            ["disasters","🌋 Thiên Tai","#dc2626"],
            ["plagues","💀 Đại Dịch","#7c3aed"],
            ["anomalies","🌀 Dị Tượng","#8b5cf6"],
            ["crisis","💹 Khủng Hoảng","#f59e0b"],
            ["warnings","⚠️ Cảnh Báo","#ef4444"],
            ["stats","📊 Thống Kê","#06b6d4"],
          ].map(([id,label,color])=>`
            <button onclick="disasterV48RenderPanel('${id}')"
              style="background:${_activeTab===id?color+"33":"#0f172a"};border:1px solid ${color}${_activeTab===id?"":"44"};color:${_activeTab===id?color:"#64748b"};padding:7px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:${_activeTab===id?"700":"400"}">
              ${label}
            </button>
          `).join("")}
        </div>

        <div id="disaster-v48-content">
          ${renderTab(_activeTab, { gdStats, anomStats, mvStats, v25Active, v25History, activePlagues, plagueHistory, econEvents, activeEcon })}
        </div>
      </div>
    `;
  };

  function renderTab(tab, data) {
    switch(tab) {
      case "disasters":  return renderDisasters(data);
      case "plagues":    return renderPlagues(data);
      case "anomalies":  return renderAnomalies();
      case "crisis":     return renderCrisis(data);
      case "warnings":   return renderWarnings();
      case "stats":      return renderStats(data);
      default: return "";
    }
  }

  // ── 1. Thiên Tai ──
  function renderDisasters({ gdStats, v25Active, v25History }) {
    const newEvents = typeof window.gdV48GetGlobalEvents === "function" ? window.gdV48GetGlobalEvents() : [];
    const chainQueue = typeof window.gdV48GetChainQueue === "function" ? window.gdV48GetChainQueue().filter(c => !c.fired).slice(0,5) : [];
    const aiResponses = typeof window.gdV48GetAIResponses === "function" ? window.gdV48GetAIResponses().slice(0,5) : [];
    const mvActive = typeof window.mvdV48GetActive === "function" ? window.mvdV48GetActive() : [];
    const mvHistory = typeof window.mvdV48GetHistory === "function" ? window.mvdV48GetHistory().slice(0,5) : [];

    const allEvents = [
      ...newEvents.slice(0,10).map(e => ({ ...e, source: "V48" })),
      ...v25Active.slice(0,5).map(e => ({ ...e, source: "V25", emoji: e.emoji || "🌋", color: "#f97316" })),
      ...v25History.slice(0,5).map(e => ({ ...e, source: "V25 (Lịch Sử)", emoji: e.emoji || "🌋", color: "#f97316" })),
    ].slice(0,15);

    function eventCard(e) {
      return `<div style="background:#0f172a;border:1px solid ${e.color||"#dc2626"}44;border-radius:10px;padding:14px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
          <div style="font-size:14px;font-weight:700;color:${e.color||"#dc2626"}">${e.emoji||"🌋"} ${e.name}</div>
          <div style="font-size:11px;color:#475569">Năm ${e.year}</div>
        </div>
        <div style="font-size:11px;color:#94a3b8;margin-bottom:6px">${e.desc || ""}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${e.severity ? `<span style="font-size:10px;background:#dc262622;color:#dc2626;padding:2px 8px;border-radius:4px">⚡ ${e.severity}</span>` : ""}
          ${e.region ? `<span style="font-size:10px;background:#1e293b;color:#94a3b8;padding:2px 8px;border-radius:4px">📍 ${e.region}</span>` : ""}
          <span style="font-size:10px;background:#1e293b;color:#64748b;padding:2px 8px;border-radius:4px">${e.source}</span>
        </div>
      </div>`;
    }

    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div>
          <h3 style="color:#dc2626;font-size:14px;margin:0 0 10px">🌋 Thiên Tai Đang Hoạt Động & Lịch Sử</h3>
          ${allEvents.length ? allEvents.map(eventCard).join("") : '<div style="color:#475569;font-size:12px">Chưa có thiên tai nào. Hãy để thế giới phát triển thêm...</div>'}
        </div>
        <div>
          ${chainQueue.length ? `<h3 style="color:#f97316;font-size:14px;margin:0 0 10px">⚡ Chain Reaction Đang Chờ</h3>
            ${chainQueue.map(c=>`<div style="background:#0f172a;border:1px solid #f9730644;border-radius:8px;padding:12px;margin-bottom:8px">
              <div style="font-size:12px;font-weight:700;color:#f97316;margin-bottom:4px">⚡ ${c.triggerType} → ${c.followType}</div>
              <div style="font-size:11px;color:#94a3b8">${c.desc}</div>
              <div style="font-size:10px;color:#475569;margin-top:4px">Kích hoạt năm ${c.fireYear}</div>
            </div>`).join("")}` : ""}

          ${aiResponses.length ? `<h3 style="color:#10b981;font-size:14px;margin:16px 0 10px">🤝 AI Phản Ứng Gần Nhất</h3>
            ${aiResponses.map(r=>`<div style="background:#0f172a;border:1px solid #10b98144;border-radius:8px;padding:10px;margin-bottom:8px">
              <div style="font-size:12px;font-weight:700;color:#10b981;margin-bottom:3px">${r.icon} ${r.name}</div>
              <div style="font-size:11px;color:#94a3b8">${r.desc}</div>
              <div style="font-size:10px;color:#475569;margin-top:3px">${r.respondedBy} · Năm ${r.year}</div>
            </div>`).join("")}` : ""}

          ${mvActive.length || mvHistory.length ? `<h3 style="color:#f59e0b;font-size:14px;margin:16px 0 10px">💥 Thảm Họa Đa Vũ Trụ</h3>
            ${[...mvActive, ...mvHistory].slice(0,5).map(e=>`<div style="background:#0f172a;border:1px solid #f59e0b44;border-radius:8px;padding:10px;margin-bottom:8px">
              <div style="font-size:12px;font-weight:700;color:#f59e0b;margin-bottom:3px">${e.icon} ${e.name} (${e.severity})</div>
              <div style="font-size:11px;color:#94a3b8">${e.desc}</div>
              <div style="font-size:10px;color:#475569;margin-top:3px">📌 ${e.universeName} · Năm ${e.year}</div>
            </div>`).join("")}` : ""}
        </div>
      </div>
    `;
  }

  // ── 2. Đại Dịch ──
  function renderPlagues({ activePlagues, plagueHistory }) {
    const allPlagues = [...activePlagues.map(p=>({...p, isActive:true})), ...plagueHistory.slice(0,20)];
    if (!allPlagues.length) return `<div style="background:#0f172a;border-radius:8px;padding:40px;text-align:center;color:#475569">Chưa có đại dịch nào bùng phát.</div>`;

    return `<div>
      ${allPlagues.slice(0,20).map(p=>`
        <div style="background:#0f172a;border:1px solid #7c3aed44;border-radius:10px;padding:14px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <div style="font-size:14px;font-weight:700;color:#7c3aed">${p.emoji||"💀"} ${p.name} ${p.isActive?'<span style="font-size:10px;background:#7c3aed22;color:#7c3aed;padding:2px 6px;border-radius:4px;margin-left:6px">ĐANG LÂY LAN</span>':''}</div>
            <div style="font-size:11px;color:#475569">Năm ${p.year||p.startYear}</div>
          </div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:6px">${p.desc||""}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${p.stage !== undefined ? `<span style="font-size:10px;background:#7c3aed22;color:#a78bfa;padding:2px 8px;border-radius:4px">Giai đoạn ${p.stage+1}/4</span>` : ""}
            ${p.originRegion ? `<span style="font-size:10px;background:#1e293b;color:#94a3b8;padding:2px 8px;border-radius:4px">📍 ${p.originRegion}</span>` : ""}
            ${p.spreadRegions ? `<span style="font-size:10px;background:#1e293b;color:#94a3b8;padding:2px 8px;border-radius:4px">🌍 ${p.spreadRegions.length} vùng</span>` : ""}
          </div>
        </div>
      `).join("")}
    </div>`;
  }

  // ── 3. Dị Tượng ──
  function renderAnomalies() {
    const active = typeof window.anomV48GetActive === "function" ? window.anomV48GetActive() : [];
    const history = typeof window.anomV48GetHistory === "function" ? window.anomV48GetHistory().slice(0,20) : [];
    const types = typeof window.anomV48GetTypes === "function" ? window.anomV48GetTypes() : [];

    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div>
          <h3 style="color:#8b5cf6;font-size:14px;margin:0 0 10px">🌀 Dị Tượng Đang Hoạt Động (${active.length})</h3>
          ${active.length ? active.map(an=>`
            <div style="background:#0f172a;border:1px solid ${an.color}44;border-radius:10px;padding:14px;margin-bottom:10px">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                <div style="font-size:14px;font-weight:700;color:${an.color}">${an.icon} ${an.name}</div>
                <span style="font-size:10px;background:#1e293b;color:#94a3b8;padding:2px 8px;border-radius:4px">Sức mạnh ${an.power}%</span>
              </div>
              <div style="font-size:11px;color:#94a3b8;margin-bottom:6px">${an.desc}</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                <span style="font-size:10px;background:#1e293b;color:#94a3b8;padding:2px 8px;border-radius:4px">📍 ${an.region}</span>
                <span style="font-size:10px;background:#1e293b;color:#64748b;padding:2px 8px;border-radius:4px">Kết thúc năm ${an.endYear}</span>
              </div>
            </div>
          `).join("") : `<div style="color:#475569;font-size:12px;padding:20px">Không có dị tượng đang hoạt động.</div>`}

          <h3 style="color:#64748b;font-size:14px;margin:16px 0 10px">📜 Lịch Sử Dị Tượng (${history.length})</h3>
          ${history.slice(0,10).map(an=>`
            <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;margin-bottom:6px">
              <div style="font-size:12px;color:#94a3b8">${an.icon} ${an.name} — ${an.region}</div>
              <div style="font-size:10px;color:#475569;margin-top:2px">Năm ${an.year} · Sức mạnh ${an.power}%</div>
            </div>
          `).join("")}
        </div>
        <div>
          <h3 style="color:#8b5cf6;font-size:14px;margin:0 0 10px">📋 Bảng Loại Dị Tượng</h3>
          ${types.map(t=>`
            <div style="background:#0f172a;border:1px solid ${t.color}33;border-radius:8px;padding:12px;margin-bottom:8px">
              <div style="font-size:13px;font-weight:700;color:${t.color};margin-bottom:4px">${t.icon} ${t.name}</div>
              <div style="font-size:11px;color:#94a3b8;margin-bottom:4px">${t.effects.desc}</div>
              <div style="font-size:10px;color:#475569">Xác suất: ${(t.rarity*1000).toFixed(1)}‰/tick · Kéo dài: ${t.effects.duration[0]}-${t.effects.duration[1]} năm</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  // ── 4. Khủng Hoảng Kinh Tế ──
  function renderCrisis({ econEvents, activeEcon }) {
    const all = [...activeEcon.map(e=>({...e, isActive:true})), ...econEvents.slice(0,20)];
    if (!all.length) return `<div style="background:#0f172a;border-radius:8px;padding:40px;text-align:center;color:#475569">Chưa có khủng hoảng kinh tế nào xảy ra.</div>`;

    return `<div>
      ${all.slice(0,20).map(e=>`
        <div style="background:#0f172a;border:1px solid #f59e0b44;border-radius:10px;padding:14px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <div style="font-size:14px;font-weight:700;color:#f59e0b">${e.emoji||"💹"} ${e.name} ${e.isActive?'<span style="font-size:10px;background:#f59e0b22;color:#f59e0b;padding:2px 6px;border-radius:4px;margin-left:6px">ĐANG XẢY RA</span>':''}</div>
            <div style="font-size:11px;color:#475569">Năm ${e.year||e.startYear}</div>
          </div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:6px">${e.desc||""}</div>
          ${e.phase !== undefined ? `<span style="font-size:10px;background:#f59e0b22;color:#fbbf24;padding:2px 8px;border-radius:4px">Giai đoạn ${e.phase+1}/4</span>` : ""}
        </div>
      `).join("")}
    </div>`;
  }

  // ── 5. Cảnh Báo ──
  function renderWarnings() {
    const warnings = typeof window.gdV48GetWarnings === "function" ? window.gdV48GetWarnings() : [];
    if (!warnings.length) return `<div style="background:#0f172a;border-radius:8px;padding:40px;text-align:center;color:#475569">Không có cảnh báo thiên tai nào đang hoạt động.</div>`;

    return `<div>
      ${warnings.slice(0,30).map(w=>`
        <div style="background:#0f172a;border:1px solid ${w.resolved?"#1e293b":"#ef444444"};border-radius:8px;padding:12px;margin-bottom:8px;opacity:${w.resolved?0.5:1}">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="font-size:13px;font-weight:${w.resolved?400:700};color:${w.resolved?"#475569":"#ef4444"}">${w.icon} ${w.msg}</div>
            <div style="font-size:10px;color:#475569;white-space:nowrap;margin-left:10px">Năm ${w.year} ${w.resolved?"✅":""}</div>
          </div>
        </div>
      `).join("")}
    </div>`;
  }

  // ── 6. Thống Kê ──
  function renderStats({ gdStats, anomStats, mvStats }) {
    const v25Data = window.disasterData || {};
    const plagueData = window.plagueData || {};
    const econData = window.econCrisisData || {};

    const rows = [
      ["🌋","Tổng Thiên Tai (V25)",(v25Data.disasterCount||0),"#f97316"],
      ["☄️","Thiên Tai Toàn Cầu V48",(gdStats.totalGlobalEvents||0),"#dc2626"],
      ["⚡","Chuỗi Phản Ứng",(gdStats.totalChainReactions||0),"#ef4444"],
      ["🤝","AI Phản Ứng",(gdStats.totalAIResponses||0),"#10b981"],
      ["💀","Tổng Đại Dịch V25",(plagueData.plagueCount||0),"#7c3aed"],
      ["💹","Tổng Khủng Hoảng Kinh Tế",(econData.eventCount||0),"#f59e0b"],
      ["🌀","Tổng Dị Tượng V48",(anomStats.totalAnomalies||0),"#8b5cf6"],
      ["☀️","Thần Linh Thức Tỉnh",(anomStats.divineAwakenings||0),"#fbbf24"],
      ["🌑","Ma Giới Mở Cửa",(anomStats.demonRealmsOpened||0),"#7c3aed"],
      ["🌀","Cổng Không Gian Mở",(anomStats.portalsOpened||0),"#8b5cf6"],
      ["💥","Thảm Họa Đa Vũ Trụ",(mvStats.totalMvDisasters||0),"#f59e0b"],
      ["🌌","Vũ Trụ Sụp Đổ",(mvStats.universesCollapsed||0),"#dc2626"],
      ["⏳","Dòng TG Nứt Vỡ",(mvStats.timelineFractures||0),"#06b6d4"],
      ["💥","Va Chạm Vũ Trụ",(mvStats.collisions||0),"#7c3aed"],
      ["🌪️","Bão Không-Thời Gian",(mvStats.storms||0),"#0ea5e9"],
      ["💀","Tổng Tử Vong (Thiên Tai)",(gdStats.totalDeaths||0).toLocaleString(),"#dc2626"],
    ];

    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${rows.map(([icon,label,val,color])=>`
          <div style="background:#0f172a;border:1px solid ${color}33;border-radius:8px;padding:12px;display:flex;justify-content:space-between;align-items:center">
            <div style="font-size:12px;color:#94a3b8">${icon} ${label}</div>
            <div style="font-size:16px;font-weight:700;color:${color}">${val}</div>
          </div>
        `).join("")}
      </div>
      ${gdStats.worstDisaster ? `<div style="background:#0f172a;border:1px solid #dc262644;border-radius:8px;padding:14px;margin-top:12px">
        <div style="font-size:13px;font-weight:700;color:#dc2626;margin-bottom:6px">💀 Thảm Họa Khủng Khiếp Nhất Lịch Sử</div>
        <div style="font-size:12px;color:#94a3b8">${gdStats.worstDisaster.name} — ${gdStats.worstDisaster.region} (Năm ${gdStats.worstDisaster.year})</div>
      </div>` : ""}
      ${mvStats.mostDestructive ? `<div style="background:#0f172a;border:1px solid #f59e0b44;border-radius:8px;padding:14px;margin-top:10px">
        <div style="font-size:13px;font-weight:700;color:#f59e0b;margin-bottom:6px">💥 Thảm Họa Đa Vũ Trụ Lớn Nhất</div>
        <div style="font-size:12px;color:#94a3b8">${mvStats.mostDestructive.name} — ${mvStats.mostDestructive.universeName} (Năm ${mvStats.mostDestructive.year})</div>
      </div>` : ""}
    `;
  }

  // ── INIT ──
  function init() {
    console.log("[DisasterRegistryV48] 🌋 Hub UI Thiên Tai & Thảm Họa V48 — 6 panels · widget mvHub sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 5300); });
  } else {
    setTimeout(init, 5300);
  }
})();
