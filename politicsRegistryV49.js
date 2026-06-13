(function() {
  "use strict";
  // ============================================================
  // POLITICS REGISTRY V49 — Hub Widget & 6 Sub-Panels
  // Chính Trị · Chính Phủ · Phe Phái · Ngoại Giao · Gián Điệp · Khủng Hoảng
  // ============================================================

  // ── HUB WIDGET ──
  window.politicsV49HubRenderPanel = function() {
    const govStats = typeof window.govV49GetStats === "function" ? window.govV49GetStats() : {};
    const facStats = typeof window.facV49GetStats === "function" ? window.facV49GetStats() : {};
    const criStats = typeof window.criV49GetStats === "function" ? window.criV49GetStats() : {};
    const activeCrises = typeof window.criV49GetActive === "function" ? window.criV49GetActive().length : 0;
    const activeGovs = typeof window.govV49GetAll === "function" ? window.govV49GetAll().length : 0;

    return '<div style="background:linear-gradient(135deg,#0f172a,#1a1a2e);border:1px solid #fbbf2444;border-radius:12px;padding:16px;margin-bottom:16px">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'
      + '<div>'
      + '<h3 style="margin:0 0 3px;font-size:16px;color:#fbbf24;font-family:Cinzel,serif">🏛️ Chính Trị AI V49</h3>'
      + '<div style="font-size:11px;color:#475569">Chính Phủ · Phe Phái · Khủng Hoảng · Ngoại Giao · Gián Điệp</div>'
      + '</div>'
      + '<button onclick="showPanel(\'politics-v49\');if(typeof politicsV49RenderPanel===\'function\')politicsV49RenderPanel(\'overview\');" style="background:#fbbf2422;border:1px solid #fbbf2444;color:#fbbf24;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:11px">Mở Rộng →</button>'
      + '</div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:8px;margin-bottom:12px">'
      + '<div style="background:#0f172a;border:1px solid #fbbf2444;border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:700;color:#fbbf24">' + activeGovs + '</div><div style="font-size:10px;color:#64748b">🏛️ Chính Phủ</div></div>'
      + '<div style="background:#0f172a;border:1px solid #22c55e44;border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:700;color:#22c55e">' + (facStats.totalFactionEntities||0) + '</div><div style="font-size:10px;color:#64748b">⚖️ Phe Phái</div></div>'
      + '<div style="background:#0f172a;border:1px solid #dc262644;border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:700;color:#dc2626">' + activeCrises + '</div><div style="font-size:10px;color:#64748b">🔥 Khủng Hoảng</div></div>'
      + '<div style="background:#0f172a;border:1px solid #06b6d444;border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:700;color:#06b6d4">' + (govStats.transitions||0) + '</div><div style="font-size:10px;color:#64748b">🔄 Chuyển Đổi</div></div>'
      + '<div style="background:#0f172a;border:1px solid #a78bfa44;border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:700;color:#a78bfa">' + (criStats.totalCrises||0) + '</div><div style="font-size:10px;color:#64748b">💥 Tổng Khủng Hoảng</div></div>'
      + '</div>'
      + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
      + '<button onclick="showPanel(\'politics-v49\');if(typeof politicsV49RenderPanel===\'function\')politicsV49RenderPanel(\'overview\');" style="background:#fbbf2422;border:1px solid #fbbf2444;color:#fbbf24;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px">🏛️ Chính Trị</button>'
      + '<button onclick="showPanel(\'politics-v49\');if(typeof politicsV49RenderPanel===\'function\')politicsV49RenderPanel(\'government\');" style="background:#06b6d422;border:1px solid #06b6d444;color:#06b6d4;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px">🏛️ Chính Phủ</button>'
      + '<button onclick="showPanel(\'politics-v49\');if(typeof politicsV49RenderPanel===\'function\')politicsV49RenderPanel(\'factions\');" style="background:#22c55e22;border:1px solid #22c55e44;color:#22c55e;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px">⚖️ Phe Phái</button>'
      + '<button onclick="showPanel(\'politics-v49\');if(typeof politicsV49RenderPanel===\'function\')politicsV49RenderPanel(\'crisis\');" style="background:#dc262622;border:1px solid #dc262644;color:#dc2626;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px">🔥 Khủng Hoảng</button>'
      + '<button onclick="showPanel(\'politics-v49\');if(typeof politicsV49RenderPanel===\'function\')politicsV49RenderPanel(\'espionage\');" style="background:#a78bfa22;border:1px solid #a78bfa44;color:#a78bfa;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px">🕵️ Gián Điệp</button>'
      + '</div>'
      + '</div>';
  };

  // ── MAIN PANEL ──
  let _activeTab = "overview";

  window.politicsV49RenderPanel = function(tab) {
    if (tab) _activeTab = tab;
    const container = document.getElementById("panel-politics-v49");
    if (!container) return;

    const govStats = typeof window.govV49GetStats === "function" ? window.govV49GetStats() : {};
    const facStats = typeof window.facV49GetStats === "function" ? window.facV49GetStats() : {};
    const criStats = typeof window.criV49GetStats === "function" ? window.criV49GetStats() : {};
    const activeCrises = typeof window.criV49GetActive === "function" ? window.criV49GetActive() : [];
    const allGovs = typeof window.govV49GetAll === "function" ? window.govV49GetAll() : [];
    const allFactions = typeof window.facV49GetAll === "function" ? window.facV49GetAll() : [];
    const factionEvents = typeof window.facV49GetEvents === "function" ? window.facV49GetEvents() : [];
    const crisisHistory = typeof window.criV49GetHistory === "function" ? window.criV49GetHistory() : [];
    const govTypes = typeof window.govV49GetTypes === "function" ? window.govV49GetTypes() : {};
    const factionTypes = typeof window.facV49GetTypes === "function" ? window.facV49GetTypes() : {};
    const crisisTypes = typeof window.criV49GetTypes === "function" ? window.criV49GetTypes() : {};

    container.innerHTML = `
      <div style="max-width:1200px;margin:0 auto;padding:16px;font-family:sans-serif">
        <div style="background:linear-gradient(135deg,#0f172a,#1a1a2e);border:1px solid #fbbf2444;border-radius:12px;padding:20px;margin-bottom:16px">
          <h2 style="margin:0 0 6px;font-size:22px;color:#fbbf24;font-family:Cinzel,serif">🏛️ CHÍNH TRỊ AI V49</h2>
          <p style="margin:0;color:#64748b;font-size:12px">8 Chế Độ · Leaders AI · 5 Phe Phái · Khủng Hoảng · Gián Điệp · Ngoại Giao Nâng Cao</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:8px;margin-top:14px">
            ${[
              ["🏛️","Chính Phủ",allGovs.length,"#fbbf24"],
              ["⚖️","Phe Phái",allFactions.length,"#22c55e"],
              ["🔥","Khủng Hoảng Đang Xảy Ra",activeCrises.length,"#dc2626"],
              ["💥","Tổng Khủng Hoảng",criStats.totalCrises||0,"#f97316"],
              ["🔄","Chuyển Đổi Chính Phủ",govStats.transitions||0,"#06b6d4"],
              ["👑","Kế Vị",govStats.successorsCrowned||0,"#a78bfa"],
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
            ["overview","🏛️ Tổng Quan","#fbbf24"],
            ["government","🏛️ Chính Phủ","#06b6d4"],
            ["factions","⚖️ Phe Phái","#22c55e"],
            ["diplomacy","🤝 Ngoại Giao","#10b981"],
            ["espionage","🕵️ Gián Điệp","#a78bfa"],
            ["crisis","🔥 Khủng Hoảng","#dc2626"],
          ].map(([id,label,color])=>`
            <button onclick="politicsV49RenderPanel('${id}')"
              style="background:${_activeTab===id?color+"33":"#0f172a"};border:1px solid ${color}${_activeTab===id?"":"44"};color:${_activeTab===id?color:"#64748b"};padding:7px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:${_activeTab===id?"700":"400"}">
              ${label}
            </button>
          `).join("")}
        </div>

        <div>${renderTab(_activeTab, { govStats, facStats, criStats, activeCrises, allGovs, allFactions, factionEvents, crisisHistory, govTypes, factionTypes, crisisTypes })}</div>
      </div>
    `;
  };

  function renderTab(tab, data) {
    switch(tab) {
      case "overview":    return renderOverview(data);
      case "government":  return renderGovernment(data);
      case "factions":    return renderFactions(data);
      case "diplomacy":   return renderDiplomacy();
      case "espionage":   return renderEspionage();
      case "crisis":      return renderCrisis(data);
      default: return "";
    }
  }

  // ── 1. Tổng Quan ──
  function renderOverview({ allGovs, factionEvents, activeCrises, crisisHistory, govStats, criStats, facStats }) {
    const recentGovChanges = (typeof window.govV49Data !== "undefined" ? window.govV49Data.transitions : []).slice(0, 8);
    const recentEvents = [...factionEvents.slice(0, 5), ...crisisHistory.slice(0, 5)].sort((a, b) => (b.year || 0) - (a.year || 0)).slice(0, 10);

    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div>
          <h3 style="color:#fbbf24;font-size:14px;margin:0 0 10px">⚡ Sự Kiện Chính Trị Gần Nhất</h3>
          ${recentEvents.length ? recentEvents.map(e=>`
            <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;margin-bottom:6px">
              <div style="font-size:12px;color:#cbd5e1">${e.factionName ? `⚖️ ${e.entityName}: Phe ${e.factionName} thay đổi quyền lực` : `${e.icon||"📜"} ${e.name||e.event} — ${e.entityName}`}</div>
              <div style="font-size:10px;color:#475569;margin-top:2px">Năm ${e.year}</div>
            </div>
          `).join("") : `<div style="color:#475569;font-size:12px">Chưa có sự kiện chính trị.</div>`}

          ${activeCrises.length ? `
            <h3 style="color:#dc2626;font-size:14px;margin:16px 0 10px">🔥 Khủng Hoảng Đang Xảy Ra (${activeCrises.length})</h3>
            ${activeCrises.slice(0, 5).map(c=>`
              <div style="background:#0f172a;border:1px solid ${c.color}44;border-radius:8px;padding:10px;margin-bottom:6px">
                <div style="font-size:12px;font-weight:700;color:${c.color}">${c.icon} ${c.name} (${c.severity})</div>
                <div style="font-size:11px;color:#94a3b8;margin-top:2px">${c.entityName} · Năm ${c.year}</div>
              </div>
            `).join("")}
          ` : ""}
        </div>
        <div>
          <h3 style="color:#06b6d4;font-size:14px;margin:0 0 10px">🔄 Chuyển Đổi Chính Phủ Gần Nhất</h3>
          ${recentGovChanges.length ? recentGovChanges.map(t=>`
            <div style="background:#0f172a;border:1px solid #06b6d444;border-radius:8px;padding:10px;margin-bottom:6px">
              <div style="font-size:12px;font-weight:700;color:#06b6d4">${t.entityName}</div>
              <div style="font-size:11px;color:#94a3b8">→ ${t.from} ➜ ${t.to}</div>
              <div style="font-size:10px;color:#475569;margin-top:2px">Năm ${t.year} · ${t.reason}</div>
            </div>
          `).join("") : `<div style="color:#475569;font-size:12px">Chưa có chuyển đổi nào.</div>`}

          <h3 style="color:#fbbf24;font-size:14px;margin:16px 0 10px">📊 Thống Kê Nhanh</h3>
          ${[
            ["👑","Tổng Kế Vị",govStats.successorsCrowned||0,"#f59e0b"],
            ["💰","Lãnh Đạo Tham Nhũng",govStats.corruptLeaders||0,"#dc2626"],
            ["📜","Lãnh Đạo Cải Cách",govStats.reformistLeaders||0,"#22c55e"],
            ["⚔️","Đảo Chính",criStats.coups||0,"#dc2626"],
            ["🔥","Nội Chiến",criStats.civilWars||0,"#f97316"],
            ["✊","Biểu Tình",criStats.protests||0,"#f59e0b"],
            ["🤝","Liên Minh Phe Phái",facStats.coalitionsFormed||0,"#10b981"],
            ["📜","Luật Đã Ban Hành",facStats.legislationPassed||0,"#06b6d4"],
          ].map(([icon,label,val,color])=>`
            <div style="background:#0f172a;border:1px solid ${color}33;border-radius:6px;padding:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">
              <div style="font-size:11px;color:#94a3b8">${icon} ${label}</div>
              <div style="font-size:14px;font-weight:700;color:${color}">${val}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  // ── 2. Chính Phủ ──
  function renderGovernment({ allGovs, govTypes }) {
    if (!allGovs.length) return `<div style="background:#0f172a;border-radius:8px;padding:40px;text-align:center;color:#475569">Chưa có chính phủ nào. Hãy để thế giới phát triển...</div>`;

    return `
      <div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">
          ${allGovs.slice(0, 20).map(gov => {
            const gt = govTypes[gov.type] || {};
            const leader = gov.leader || {};
            const trait1 = leader.traits?.[0] || {};
            const trait2 = leader.traits?.[1] || {};
            return `
              <div style="background:#0f172a;border:1px solid ${gt.color||"#475569"}44;border-radius:10px;padding:14px">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
                  <div>
                    <div style="font-size:13px;font-weight:700;color:#f1f5f9">${gov.entityName}</div>
                    <div style="font-size:11px;color:${gt.color||"#94a3b8"}">${gt.icon||""} ${gt.name||gov.type}</div>
                  </div>
                  <div style="font-size:10px;color:#475569">Năm ${gov.founded}</div>
                </div>
                ${leader.name ? `
                  <div style="background:#1e293b;border-radius:6px;padding:10px;margin-bottom:8px">
                    <div style="font-size:12px;font-weight:700;color:#fbbf24;margin-bottom:4px">👑 ${leader.title} ${leader.name}</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
                      <div style="font-size:10px;color:#94a3b8">🔥 Tham Vọng: ${leader.ambition}%</div>
                      <div style="font-size:10px;color:#94a3b8">🤝 Ngoại Giao: ${leader.diplomacy}%</div>
                      <div style="font-size:10px;color:#94a3b8">⚔️ Hiếu Chiến: ${leader.militancy}%</div>
                      <div style="font-size:10px;color:#94a3b8">💰 Tham Nhũng: ${leader.corruption}%</div>
                      <div style="font-size:10px;color:#94a3b8">⭐ Uy Tín: ${leader.prestige}%</div>
                      <div style="font-size:10px;color:#94a3b8">🎂 Tuổi: ${leader.age}</div>
                    </div>
                    ${trait1.name ? `<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">
                      ${[trait1, trait2].filter(t => t && t.name).map(t=>`<span style="font-size:10px;background:#0f172a;color:${t.color||"#94a3b8"};padding:2px 8px;border-radius:4px;border:1px solid ${t.color||"#475569"}33">${t.icon} ${t.name}</span>`).join("")}
                    </div>` : ""}
                  </div>
                ` : ""}
                <div style="display:flex;justify-content:space-between;font-size:10px;color:#475569">
                  <span>Ổn định: ${gov.stability}%</span>
                  <span>Cải cách: ${gov.reformProgress||0}%</span>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  // ── 3. Phe Phái ──
  function renderFactions({ allFactions, factionEvents, factionTypes }) {
    if (!allFactions.length) return `<div style="background:#0f172a;border-radius:8px;padding:40px;text-align:center;color:#475569">Chưa có phe phái nào được khởi tạo.</div>`;

    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div>
          <h3 style="color:#22c55e;font-size:14px;margin:0 0 10px">⚖️ Phe Phái Theo Thực Thể</h3>
          ${allFactions.slice(0, 12).map(ef => {
            const dom = ef.factions[ef.dominant];
            const factionList = Object.values(ef.factions).sort((a, b) => b.power - a.power);
            return `
              <div style="background:#0f172a;border:1px solid #22c55e33;border-radius:10px;padding:12px;margin-bottom:8px">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                  <div style="font-size:13px;font-weight:700;color:#f1f5f9">${ef.entityName}</div>
                  ${dom ? `<span style="font-size:10px;background:${dom.color}22;color:${dom.color};padding:2px 8px;border-radius:4px">${dom.icon} ${dom.name}</span>` : ""}
                </div>
                ${factionList.map(f=>`
                  <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                    <span style="font-size:10px;color:${f.color};width:80px">${f.icon} ${f.name}</span>
                    <div style="flex:1;height:6px;background:#1e293b;border-radius:3px">
                      <div style="width:${f.power}%;height:100%;background:${f.color};border-radius:3px"></div>
                    </div>
                    <span style="font-size:10px;color:#94a3b8;width:30px">${f.power}%</span>
                  </div>
                `).join("")}
                ${ef.currentPolicy ? `<div style="font-size:10px;color:#475569;margin-top:6px">Chính sách: ${ef.currentPolicy}</div>` : ""}
              </div>
            `;
          }).join("")}
        </div>
        <div>
          <h3 style="color:#22c55e;font-size:14px;margin:0 0 10px">📋 Loại Phe Phái</h3>
          ${Object.values(factionTypes).map(f=>`
            <div style="background:#0f172a;border:1px solid ${f.color}33;border-radius:8px;padding:10px;margin-bottom:8px">
              <div style="font-size:13px;font-weight:700;color:${f.color};margin-bottom:4px">${f.icon} ${f.name}</div>
              <div style="font-size:11px;color:#94a3b8;margin-bottom:4px">${f.desc}</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                ${f.policies.slice(0, 3).map(p=>`<span style="font-size:10px;background:${f.color}22;color:${f.color};padding:1px 6px;border-radius:4px">${p}</span>`).join("")}
              </div>
            </div>
          `).join("")}

          <h3 style="color:#22c55e;font-size:14px;margin:16px 0 10px">⚡ Sự Kiện Phe Phái Gần Nhất</h3>
          ${factionEvents.slice(0, 8).map(e=>`
            <div style="background:#0f172a;border:1px solid #1e293b;border-radius:6px;padding:8px;margin-bottom:4px">
              <div style="font-size:11px;color:#f1f5f9">⚖️ ${e.entityName}: Phe ${e.factionName} nắm quyền</div>
              <div style="font-size:10px;color:#475569;margin-top:2px">Năm ${e.year}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  // ── 4. Ngoại Giao ──
  function renderDiplomacy() {
    const drData = window.drData || {};
    const relations = drData.relations || {};
    const treaties = drData.treaties || [];
    const log = drData.log || [];

    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div>
          <h3 style="color:#10b981;font-size:14px;margin:0 0 10px">📜 Hiệp Ước Đang Có (${treaties.length})</h3>
          ${treaties.slice(0, 15).map(t=>`
            <div style="background:#0f172a;border:1px solid #10b98144;border-radius:8px;padding:10px;margin-bottom:6px">
              <div style="font-size:12px;font-weight:700;color:#10b981;margin-bottom:3px">${t.type||t.treatyType||"Hiệp Ước"}</div>
              <div style="font-size:11px;color:#94a3b8">${t.partyA||"?"} ↔ ${t.partyB||"?"}</div>
              <div style="font-size:10px;color:#475569;margin-top:2px">Năm ${t.signedYear||t.year||"?"}</div>
            </div>
          `).join("") || `<div style="color:#475569;font-size:12px">Chưa có hiệp ước nào.</div>`}
        </div>
        <div>
          <h3 style="color:#10b981;font-size:14px;margin:0 0 10px">📋 Nhật Ký Ngoại Giao</h3>
          ${log.slice(0, 15).map(l=>`
            <div style="background:#0f172a;border:1px solid #1e293b;border-radius:6px;padding:8px;margin-bottom:4px">
              <div style="font-size:11px;color:#94a3b8">${l.msg||l.text||JSON.stringify(l)}</div>
              <div style="font-size:10px;color:#475569;margin-top:2px">Năm ${l.year||"?"}</div>
            </div>
          `).join("") || `<div style="color:#475569;font-size:12px">Chưa có ghi chú ngoại giao.</div>`}
        </div>
      </div>
    `;
  }

  // ── 5. Gián Điệp ──
  function renderEspionage() {
    // Read from existing espionageEngine.js (state exposed via closure — read from localStorage)
    let espData = {};
    try { const raw = localStorage.getItem("cgv6_espionage"); if (raw) espData = JSON.parse(raw); } catch(e) {}
    const spies = espData.spies || [];
    const ops = espData.operations || [];
    const log = espData.espionageLog || [];

    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div>
          <h3 style="color:#a78bfa;font-size:14px;margin:0 0 10px">🕵️ Điệp Viên Đang Hoạt Động (${spies.filter(s=>s.status==="active"||s.status==="deployed").length})</h3>
          ${spies.filter(s => s.status !== "burned" && s.status !== "caught").slice(0, 10).map(s=>`
            <div style="background:#0f172a;border:1px solid #a78bfa44;border-radius:8px;padding:10px;margin-bottom:6px">
              <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                <div style="font-size:12px;font-weight:700;color:#a78bfa">${s.name||"Điệp Viên"}</div>
                <span style="font-size:10px;background:#1e293b;color:#94a3b8;padding:1px 6px;border-radius:4px">${s.skillName||"Tập Sự"}</span>
              </div>
              <div style="font-size:11px;color:#94a3b8">${s.owner||"?"} → ${s.target||"Chưa triển khai"}</div>
              <div style="font-size:10px;color:#475569;margin-top:2px">Nhiệm vụ: ${s.mission||"Chờ lệnh"}</div>
            </div>
          `).join("") || `<div style="color:#475569;font-size:12px">Chưa có điệp viên nào.</div>`}
        </div>
        <div>
          <h3 style="color:#a78bfa;font-size:14px;margin:0 0 10px">📋 Nhật Ký Gián Điệp</h3>
          ${log.slice(0, 15).map(l=>`
            <div style="background:#0f172a;border:1px solid ${l.type==="success"?"#22c55e":l.type==="danger"?"#dc2626":"#1e293b"}44;border-radius:6px;padding:8px;margin-bottom:4px">
              <div style="font-size:11px;color:#94a3b8">${l.msg||""}</div>
              <div style="font-size:10px;color:#475569;margin-top:2px">Năm ${l.year||"?"}</div>
            </div>
          `).join("") || `<div style="color:#475569;font-size:12px">Chưa có hoạt động gián điệp.</div>`}
        </div>
      </div>
    `;
  }

  // ── 6. Khủng Hoảng ──
  function renderCrisis({ activeCrises, crisisHistory, crisisTypes }) {
    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div>
          <h3 style="color:#dc2626;font-size:14px;margin:0 0 10px">🔥 Khủng Hoảng Đang Xảy Ra (${activeCrises.length})</h3>
          ${activeCrises.length ? activeCrises.map(c=>`
            <div style="background:#0f172a;border:1px solid ${c.color}44;border-radius:10px;padding:14px;margin-bottom:8px">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                <div style="font-size:14px;font-weight:700;color:${c.color}">${c.icon} ${c.name}</div>
                <span style="font-size:10px;background:${c.color}22;color:${c.color};padding:2px 8px;border-radius:4px">${c.severity}</span>
              </div>
              <div style="font-size:11px;color:#94a3b8;margin-bottom:6px">${c.desc}</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px">
                <span style="font-size:10px;background:#1e293b;color:#94a3b8;padding:2px 8px;border-radius:4px">📍 ${c.entityName}</span>
                <span style="font-size:10px;background:#1e293b;color:#64748b;padding:2px 8px;border-radius:4px">Năm ${c.year}</span>
              </div>
              <div style="font-size:10px;color:#64748b">${c.reason}</div>
            </div>
          `).join("") : `<div style="color:#475569;font-size:12px;padding:20px;text-align:center">Hiện tại không có khủng hoảng nào — Thế giới tạm thời ổn định.</div>`}

          <h3 style="color:#f97316;font-size:14px;margin:16px 0 10px">📋 Loại Khủng Hoảng</h3>
          ${Object.values(crisisTypes).map(t=>`
            <div style="background:#0f172a;border:1px solid ${t.color}33;border-radius:8px;padding:10px;margin-bottom:6px">
              <div style="font-size:12px;font-weight:700;color:${t.color};margin-bottom:3px">${t.icon} ${t.name}</div>
              <div style="font-size:11px;color:#94a3b8">${t.desc}</div>
            </div>
          `).join("")}
        </div>
        <div>
          <h3 style="color:#64748b;font-size:14px;margin:0 0 10px">📜 Lịch Sử Khủng Hoảng (${crisisHistory.length})</h3>
          ${crisisHistory.slice(0, 20).map(c=>`
            <div style="background:#0f172a;border:1px solid ${c.active?"#dc262633":"#1e293b"};border-radius:8px;padding:10px;margin-bottom:6px">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div>
                  <div style="font-size:12px;font-weight:700;color:${c.color}">${c.icon} ${c.name}</div>
                  <div style="font-size:11px;color:#94a3b8;margin-top:2px">${c.entityName} · ${c.severity}</div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:10px;color:#475569">Năm ${c.year}</div>
                  ${c.resolution ? `<div style="font-size:10px;color:#22c55e;margin-top:2px">✅ ${c.resolution}</div>` : ""}
                </div>
              </div>
            </div>
          `).join("") || `<div style="color:#475569;font-size:12px">Chưa có lịch sử khủng hoảng.</div>`}
        </div>
      </div>
    `;
  }

  // ── INIT ──
  function init() {
    console.log("[PoliticsRegistryV49] 🏛️ Hub UI Chính Trị AI V49 — 6 panels · widget mvHub sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 5700); });
  } else {
    setTimeout(init, 5700);
  }
})();
