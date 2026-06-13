(function() {
  "use strict";
  // ============================================================
  // HERO REGISTRY V47 — Hub Widget & 6 Sub-Panels
  // ============================================================
  // Passive: không có gameTick, không có save key riêng
  // UI tích hợp trong 🌌 Đa Vũ Trụ V35 hub (mvHubRenderPanel)

  // ============================================================
  // HUB WIDGET — được gọi bởi mvHubRenderPanel
  // ============================================================
  window.heroV47HubRenderPanel = function() {
    const legStats = typeof window.legV47GetStats === "function" ? window.legV47GetStats() : {};
    const famStats = typeof window.fv47GetStats === "function" ? window.fv47GetStats() : {};
    const heroes = typeof window.fv47GetHeroes === "function" ? window.fv47GetHeroes() : [];
    const villains = typeof window.fv47GetVillains === "function" ? window.fv47GetVillains() : [];

    return '<div style="background:linear-gradient(135deg,#1a0a0a,#0f172a);border:1px solid #f59e0b44;border-radius:12px;padding:16px;margin-bottom:16px">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'
      + '<div>'
      + '<h3 style="margin:0 0 3px;font-size:16px;color:#f59e0b;font-family:Cinzel,serif">⚔️ Anh Hùng & Huyền Thoại V47</h3>'
      + '<div style="font-size:11px;color:#475569">Anh Hùng · Phản Diện · Sử Thi · Danh Tiếng · Di Sản</div>'
      + '</div>'
      + '<button onclick="showPanel(\'hero-v47\');if(typeof heroV47RenderPanel===\'function\')heroV47RenderPanel(\'heroes\');" style="background:#f59e0b22;border:1px solid #f59e0b44;color:#f59e0b;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:11px">Mở Rộng →</button>'
      + '</div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;margin-bottom:12px">'
      + '<div style="background:#0f172a;border:1px solid #f59e0b44;border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:700;color:#f59e0b">' + heroes.length + '</div><div style="font-size:10px;color:#64748b">⚔️ Anh Hùng</div></div>'
      + '<div style="background:#0f172a;border:1px solid #dc262644;border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:700;color:#dc2626">' + villains.length + '</div><div style="font-size:10px;color:#64748b">👹 Phản Diện</div></div>'
      + '<div style="background:#0f172a;border:1px solid #fbbf2444;border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:700;color:#fbbf24">' + (legStats.epics || 0) + '</div><div style="font-size:10px;color:#64748b">📖 Sử Thi</div></div>'
      + '<div style="background:#0f172a;border:1px solid #10b98144;border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:700;color:#10b981">' + (famStats.legaciesCreated || 0) + '</div><div style="font-size:10px;color:#64748b">🏛️ Di Sản</div></div>'
      + '<div style="background:#0f172a;border:1px solid #8b5cf644;border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:700;color:#8b5cf6">' + (legStats.prophecies || 0) + '</div><div style="font-size:10px;color:#64748b">🔮 Tiên Tri</div></div>'
      + '</div>'
      + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
      + '<button onclick="showPanel(\'hero-v47\');if(typeof heroV47RenderPanel===\'function\')heroV47RenderPanel(\'heroes\');" style="background:#f59e0b22;border:1px solid #f59e0b44;color:#f59e0b;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px">⚔️ Anh Hùng</button>'
      + '<button onclick="showPanel(\'hero-v47\');if(typeof heroV47RenderPanel===\'function\')heroV47RenderPanel(\'epics\');" style="background:#fbbf2422;border:1px solid #fbbf2444;color:#fbbf24;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px">📖 Sử Thi</button>'
      + '<button onclick="showPanel(\'hero-v47\');if(typeof heroV47RenderPanel===\'function\')heroV47RenderPanel(\'folklore\');" style="background:#10b98122;border:1px solid #10b98144;color:#10b981;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px">📚 Truyền Thuyết</button>'
      + '<button onclick="showPanel(\'hero-v47\');if(typeof heroV47RenderPanel===\'function\')heroV47RenderPanel(\'fame\');" style="background:#06b6d422;border:1px solid #06b6d444;color:#06b6d4;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px">🌟 Danh Tiếng</button>'
      + '<button onclick="showPanel(\'hero-v47\');if(typeof heroV47RenderPanel===\'function\')heroV47RenderPanel(\'legacy\');" style="background:#10b98122;border:1px solid #10b98144;color:#10b981;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px">🏛️ Di Sản</button>'
      + '<button onclick="showPanel(\'hero-v47\');if(typeof heroV47RenderPanel===\'function\')heroV47RenderPanel(\'rankings\');" style="background:#8b5cf622;border:1px solid #8b5cf644;color:#8b5cf6;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px">🏆 BXH</button>'
      + '</div>'
      + '</div>';
  };

  // ============================================================
  // MAIN PANEL RENDER — panel-hero-v47
  // ============================================================
  let _activeTab = "heroes";

  window.heroV47RenderPanel = function(tab) {
    if (tab) _activeTab = tab;
    const container = document.getElementById("panel-hero-v47");
    if (!container) return;

    const legStats = typeof window.legV47GetStats === "function" ? window.legV47GetStats() : {};
    const famStats = typeof window.fv47GetStats === "function" ? window.fv47GetStats() : {};

    container.innerHTML = `
      <div style="max-width:1200px;margin:0 auto;padding:16px;font-family:sans-serif">
        <div style="background:linear-gradient(135deg,#1a0a0a,#0f172a);border:1px solid #f59e0b44;border-radius:12px;padding:20px;margin-bottom:16px">
          <h2 style="margin:0 0 6px;font-size:22px;color:#f59e0b;font-family:Cinzel,serif">⚔️ ANH HÙNG & HUYỀN THOẠI V47</h2>
          <p style="margin:0;color:#64748b;font-size:12px">Hệ Thống Danh Tiếng · Sử Thi · Di Sản · Phản Diện · Hành Trình Anh Hùng</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:8px;margin-top:14px">
            ${[
              ["⚔️","Anh Hùng",(typeof window.fv47GetHeroes==="function"?window.fv47GetHeroes().length:0),"#f59e0b"],
              ["👹","Phản Diện",(typeof window.fv47GetVillains==="function"?window.fv47GetVillains().length:0),"#dc2626"],
              ["📖","Sử Thi",(legStats.epics||0),"#fbbf24"],
              ["📚","Truyền Thuyết",(legStats.folklore||0),"#10b981"],
              ["🔮","Lời Tiên Tri",(legStats.prophecies||0),"#8b5cf6"],
              ["🏛️","Di Sản",(famStats.legaciesCreated||0),"#06b6d4"],
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
            ["heroes","⚔️ Anh Hùng","#f59e0b"],
            ["epics","📖 Sử Thi","#fbbf24"],
            ["folklore","📚 Truyền Thuyết","#10b981"],
            ["fame","🌟 Danh Tiếng","#06b6d4"],
            ["legacy","🏛️ Di Sản","#10b981"],
            ["rankings","🏆 BXH","#8b5cf6"],
          ].map(([id,label,color])=>`
            <button onclick="heroV47RenderPanel('${id}')"
              style="background:${_activeTab===id?color+"33":"#0f172a"};border:1px solid ${color}${_activeTab===id?"":"44"};color:${_activeTab===id?color:"#64748b"};padding:7px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:${_activeTab===id?"700":"400"}">
              ${label}
            </button>
          `).join("")}
        </div>

        <div id="hero-v47-content">
          ${renderTab(_activeTab)}
        </div>
      </div>
    `;
  };

  function renderTab(tab) {
    switch(tab) {
      case "heroes":   return renderHeroes();
      case "epics":    return renderEpics();
      case "folklore": return renderFolklore();
      case "fame":     return renderFame();
      case "legacy":   return renderLegacy();
      case "rankings": return renderRankings();
      default: return "";
    }
  }

  // ---- Anh Hùng & Phản Diện ----
  function renderHeroes() {
    const heroes = typeof window.fv47GetHeroes === "function" ? window.fv47GetHeroes() : [];
    const villains = typeof window.fv47GetVillains === "function" ? window.fv47GetVillains() : [];
    const journeys = typeof window.fv47GetJourneys === "function" ? window.fv47GetJourneys().slice(0,10) : [];
    const rivalries = typeof window.fv47GetRivalries === "function" ? window.fv47GetRivalries().slice(0,5) : [];
    const villainEvents = typeof window.fv47GetVillainEvents === "function" ? window.fv47GetVillainEvents().slice(0,5) : [];

    if (!heroes.length && !villains.length) {
      return `<div style="background:#0f172a;border-radius:8px;padding:40px;text-align:center;color:#475569">Thế giới chưa sinh ra anh hùng hay phản diện huyền thoại nào. Hãy để thời gian trôi qua...</div>`;
    }

    const cardStyle = (color) => `background:#0f172a;border:1px solid ${color}44;border-radius:10px;padding:14px;margin-bottom:10px`;
    const renderCard = (p, color) => `
      <div style="${cardStyle(color)}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div style="font-size:15px;font-weight:700;color:${color}">${p.archetypeIcon} ${p.heroName}</div>
            <div style="font-size:12px;color:${color}99;margin:2px 0">${p.archetypeName}</div>
            <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
              <span style="font-size:11px;background:#1e293b;padding:2px 8px;border-radius:4px;color:#94a3b8">🏘️ Địa phương: ${p.fameLocal}%</span>
              <span style="font-size:11px;background:#1e293b;padding:2px 8px;border-radius:4px;color:#94a3b8">🌍 Thế giới: ${p.fameWorld}%</span>
              <span style="font-size:11px;background:#1e293b;padding:2px 8px;border-radius:4px;color:#94a3b8">🌌 Đa vũ trụ: ${p.fameMultiverse}%</span>
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:24px">${p.archetypeIcon}</div>
            <div style="font-size:10px;color:#475569;margin-top:4px">Năm ${p.createdYear}</div>
          </div>
        </div>
        ${!p.isVillain ? `<div style="margin-top:8px"><div style="font-size:10px;color:#475569;margin-bottom:4px">Hành Trình:</div>
          <div style="display:flex;gap:2px">${[0,1,2,3,4,5,6].map(i=>`<div style="width:20px;height:6px;border-radius:3px;background:${i<(p.journeyStage||0)?'#f59e0b':'#1e293b'}"></div>`).join('')}</div>
        </div>` : ''}
      </div>`;

    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div>
          <h3 style="color:#f59e0b;font-size:14px;margin:0 0 10px">⚔️ Anh Hùng (${heroes.length})</h3>
          ${heroes.slice(0,10).map(p=>renderCard(p,"#f59e0b")).join("") || '<div style="color:#475569;font-size:12px">Chưa có anh hùng</div>'}
        </div>
        <div>
          <h3 style="color:#dc2626;font-size:14px;margin:0 0 10px">👹 Phản Diện (${villains.length})</h3>
          ${villains.slice(0,10).map(p=>renderCard(p,"#dc2626")).join("") || '<div style="color:#475569;font-size:12px">Chưa có phản diện</div>'}
          ${villainEvents.length ? `<h3 style="color:#b91c1c;font-size:13px;margin:16px 0 8px">💀 Sự Kiện Phản Diện</h3>
            ${villainEvents.map(v=>`<div style="background:#0f172a;border:1px solid #dc262644;border-radius:8px;padding:10px;margin-bottom:8px;font-size:12px;color:#fca5a5">${v.msg}<div style="font-size:10px;color:#475569;margin-top:4px">Năm ${v.year}</div></div>`).join("")}` : ""}
        </div>
      </div>
      ${rivalries.length ? `<div style="margin-top:16px">
        <h3 style="color:#f97316;font-size:14px;margin:0 0 10px">⚡ Kình Địch Thiên Định</h3>
        ${rivalries.map(r=>`<div style="background:#0f172a;border:1px solid #f9731644;border-radius:8px;padding:12px;margin-bottom:8px;font-size:12px;color:#fed7aa">${r.desc}<div style="font-size:10px;color:#475569;margin-top:4px">Năm ${r.year}</div></div>`).join("")}
      </div>` : ""}
      ${journeys.length ? `<div style="margin-top:16px">
        <h3 style="color:#10b981;font-size:14px;margin:0 0 10px">🌟 Hành Trình Gần Nhất</h3>
        ${journeys.map(j=>`<div style="background:#0f172a;border:1px solid #10b98144;border-radius:8px;padding:10px;margin-bottom:6px;font-size:12px;color:#86efac">${j.desc}<div style="font-size:10px;color:#475569;margin-top:4px">Năm ${j.year}</div></div>`).join("")}
      </div>` : ""}
    `;
  }

  // ---- Sử Thi ----
  function renderEpics() {
    const epics = typeof window.legV47GetEpics === "function" ? window.legV47GetEpics() : [];
    if (!epics.length) return `<div style="background:#0f172a;border-radius:8px;padding:40px;text-align:center;color:#475569">Chưa có sử thi nào được ghi chép. Hãy để anh hùng tạo nên chiến công...</div>`;
    return `<div>
      ${epics.slice(0,30).map(e=>`
        <div style="background:#0f172a;border:1px solid #fbbf2444;border-radius:10px;padding:14px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <div style="font-size:13px;font-weight:700;color:#fbbf24">${e.icon} ${e.title}</div>
            <div style="font-size:11px;color:#475569">Năm ${e.year}</div>
          </div>
          <div style="font-size:12px;color:#cbd5e1;line-height:1.6">${e.content}</div>
          <div style="font-size:10px;color:#475569;margin-top:6px">Legend Score: ${e.legendScore}</div>
        </div>
      `).join("")}
      <div style="color:#475569;font-size:11px;text-align:center;padding:8px">Hiển thị ${Math.min(30,epics.length)} / ${epics.length} sử thi</div>
    </div>`;
  }

  // ---- Truyền Thuyết & Lời Tiên Tri ----
  function renderFolklore() {
    const folklore = typeof window.legV47GetFolklore === "function" ? window.legV47GetFolklore() : [];
    const prophecies = typeof window.legV47GetProphecies === "function" ? window.legV47GetProphecies() : [];
    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div>
          <h3 style="color:#10b981;font-size:14px;margin:0 0 10px">📚 Truyền Thuyết Dân Gian (${folklore.length})</h3>
          ${folklore.length ? folklore.slice(0,20).map(f=>`
            <div style="background:#0f172a;border:1px solid #10b98144;border-radius:8px;padding:12px;margin-bottom:8px">
              <div style="font-size:12px;font-weight:700;color:#10b981;margin-bottom:6px">${f.icon} ${f.title}</div>
              <div style="font-size:11px;color:#94a3b8;line-height:1.5">${f.content}</div>
              <div style="font-size:10px;color:#475569;margin-top:4px">📍 ${f.region} · Năm ${f.year}</div>
            </div>
          `).join("") : `<div style="color:#475569;font-size:12px">Chưa có truyền thuyết</div>`}
        </div>
        <div>
          <h3 style="color:#8b5cf6;font-size:14px;margin:0 0 10px">🔮 Lời Tiên Tri (${prophecies.length})</h3>
          ${prophecies.length ? prophecies.slice(0,20).map(p=>`
            <div style="background:#0f172a;border:1px solid ${p.fulfilled?"#a78bfa":"#8b5cf6"}44;border-radius:8px;padding:12px;margin-bottom:8px">
              <div style="font-size:12px;font-weight:700;color:${p.fulfilled?"#a78bfa":"#8b5cf6"};margin-bottom:6px">${p.icon} ${p.title} ${p.fulfilled?"✅":""}</div>
              <div style="font-size:11px;color:#94a3b8;line-height:1.5">${p.content}</div>
              <div style="font-size:10px;color:#475569;margin-top:4px">
                ${p.fulfilled ? `✅ Ứng nghiệm năm ${p.fulfillYear}` : `⏳ Ứng nghiệm: Năm ${p.fulfillYear}`}
              </div>
            </div>
          `).join("") : `<div style="color:#475569;font-size:12px">Chưa có lời tiên tri</div>`}
        </div>
      </div>
    `;
  }

  // ---- Danh Tiếng ----
  function renderFame() {
    const topLocal = typeof window.fv47GetTopByFame === "function" ? window.fv47GetTopByFame("local", 10) : [];
    const topWorld = typeof window.fv47GetTopByFame === "function" ? window.fv47GetTopByFame("world", 10) : [];
    const topMultiverse = typeof window.fv47GetTopByFame === "function" ? window.fv47GetTopByFame("multiverse", 10) : [];

    function fameList(list, key, color) {
      if (!list.length) return `<div style="color:#475569;font-size:12px">Chưa có dữ liệu</div>`;
      return list.map((p,i)=>`
        <div style="display:flex;align-items:center;gap:10px;padding:8px;background:#0f172a;border-radius:6px;margin-bottom:6px">
          <div style="width:24px;height:24px;background:${color}22;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;color:${color};font-weight:700">${i+1}</div>
          <div style="flex:1">
            <div style="font-size:12px;color:#e2e8f0">${p.archetypeIcon} ${p.heroName}</div>
            <div style="font-size:10px;color:#475569">${p.archetypeName}</div>
          </div>
          <div style="font-size:13px;font-weight:700;color:${color}">${p[key]}%</div>
        </div>
      `).join("");
    }

    return `
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px">
        <div>
          <h3 style="color:#f59e0b;font-size:13px;margin:0 0 10px">🏘️ Danh Tiếng Địa Phương</h3>
          ${fameList(topLocal,"fameLocal","#f59e0b")}
        </div>
        <div>
          <h3 style="color:#06b6d4;font-size:13px;margin:0 0 10px">🌍 Danh Tiếng Thế Giới</h3>
          ${fameList(topWorld,"fameWorld","#06b6d4")}
        </div>
        <div>
          <h3 style="color:#8b5cf6;font-size:13px;margin:0 0 10px">🌌 Danh Tiếng Đa Vũ Trụ</h3>
          ${fameList(topMultiverse,"fameMultiverse","#8b5cf6")}
        </div>
      </div>
    `;
  }

  // ---- Di Sản ----
  function renderLegacy() {
    const legacies = typeof window.fv47GetLegacies === "function" ? window.fv47GetLegacies() : [];
    if (!legacies.length) return `<div style="background:#0f172a;border-radius:8px;padding:40px;text-align:center;color:#475569">Chưa có di sản nào được tạo ra. Anh hùng cần tử trận để để lại di sản...</div>`;
    const grouped = {};
    legacies.forEach(l => { grouped[l.type] = grouped[l.type] || []; grouped[l.type].push(l); });
    return `
      <div>
        ${Object.entries(grouped).map(([type, items])=>`
          <div style="margin-bottom:20px">
            <h3 style="color:#10b981;font-size:13px;margin:0 0 10px">${items[0].icon} ${items[0].typeName} (${items.length})</h3>
            ${items.slice(0,10).map(l=>`
              <div style="background:#0f172a;border:1px solid #10b98144;border-radius:8px;padding:12px;margin-bottom:8px">
                <div style="font-size:13px;font-weight:700;color:#10b981;margin-bottom:4px">${l.icon} ${l.name}</div>
                <div style="font-size:11px;color:#94a3b8">${l.desc}</div>
                <div style="display:flex;justify-content:space-between;margin-top:6px">
                  <div style="font-size:10px;color:#475569">Năm ${l.year}</div>
                  <div style="font-size:10px;background:#10b98122;color:#10b981;padding:1px 6px;border-radius:4px">Sức mạnh: ${l.strength}%</div>
                </div>
              </div>
            `).join("")}
          </div>
        `).join("")}
      </div>
    `;
  }

  // ---- Bảng Xếp Hạng ----
  function renderRankings() {
    const hd = window.heroLegendData || { heroes: {}, legends: [] };
    const allHeroes = Object.values(hd.heroes || {}).concat(hd.legends || []);
    const top = allHeroes.sort((a,b) => (b.legendScore||0)-(a.legendScore||0)).slice(0,20);
    const chronicles = typeof window.legV47GetChronicles === "function" ? window.legV47GetChronicles().slice(0,15) : [];

    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div>
          <h3 style="color:#fbbf24;font-size:14px;margin:0 0 10px">🏆 Bảng Xếp Hạng Huyền Thoại</h3>
          ${top.length ? top.map((h,i)=>{
            const prof = typeof window.fv47GetProfile==="function" ? window.fv47GetProfile(h.id) : null;
            const color = prof && prof.isVillain ? "#dc2626" : "#f59e0b";
            const icon = prof ? prof.archetypeIcon : "⚔️";
            return `<div style="display:flex;align-items:center;gap:10px;padding:10px;background:#0f172a;border:1px solid ${color}33;border-radius:8px;margin-bottom:6px">
              <div style="width:28px;height:28px;background:${color}22;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:${color}">${i+1}</div>
              <div style="flex:1">
                <div style="font-size:12px;font-weight:700;color:${color}">${icon} ${h.name}</div>
                <div style="font-size:10px;color:#475569">${prof ? prof.archetypeName : "Anh Hùng"}</div>
              </div>
              <div style="font-size:13px;font-weight:700;color:${color}">${(h.legendScore||0).toLocaleString()}</div>
            </div>`;
          }).join("") : `<div style="color:#475569;font-size:12px">Chưa có dữ liệu xếp hạng</div>`}
        </div>
        <div>
          <h3 style="color:#94a3b8;font-size:14px;margin:0 0 10px">📜 Biên Niên Sử Anh Hùng</h3>
          ${chronicles.length ? chronicles.map(c=>`
            <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;margin-bottom:6px">
              <div style="font-size:11px;color:#cbd5e1;line-height:1.5">${c.desc || c.event}</div>
              <div style="font-size:10px;color:#475569;margin-top:3px">📅 Năm ${c.year}</div>
            </div>
          `).join("") : `<div style="color:#475569;font-size:12px">Chưa có biên niên sử</div>`}
        </div>
      </div>
    `;
  }

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    console.log("[HeroRegistryV47] ⚔️ Hub UI Anh Hùng & Huyền Thoại V47 — 6 panels · widget mvHub sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 4600); });
  } else {
    setTimeout(init, 4600);
  }
})();
