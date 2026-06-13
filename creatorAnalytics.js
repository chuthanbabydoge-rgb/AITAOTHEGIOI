/* ============================================================
   CREATOR ANALYTICS V32
   Phân Tích Thế Giới — Dân Số · Kinh Tế · Quân Sự · Tôn Giáo
   Công Nghệ · Ổn Định · Chiến Tranh · Thần Thánh · Boss
   EXPAND ONLY · Read-only access to all global data
   ============================================================ */
(function() {
  "use strict";
  const SAVE_KEY = "cgv6_creator_analytics_v32";

  window.creatorAnalyticsData = {
    snapshots: [],
    lastAnalysis: null,
    initialized: false
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ snapshots: window.creatorAnalyticsData.snapshots.slice(0,10), lastAnalysis: window.creatorAnalyticsData.lastAnalysis })); } catch(e) {}
  }
  function load() {
    try { const d = localStorage.getItem(SAVE_KEY); if (d) { const p = JSON.parse(d); window.creatorAnalyticsData.snapshots = p.snapshots||[]; window.creatorAnalyticsData.lastAnalysis = p.lastAnalysis||null; } } catch(e) {}
  }

  /* ── DATA COLLECTORS ── */
  function collectAnalysis() {
    const now_ = (typeof year !== 'undefined') ? year : 0;
    const npcsArr = (typeof npcs !== 'undefined') ? npcs : [];
    const countriesArr = (typeof countries !== 'undefined') ? countries : [];
    const alive = npcsArr.filter(n => n.status === 'alive');

    // Population
    let totalPop = 0;
    countriesArr.forEach(c => { totalPop += (c.population||0); });
    alive.forEach(n => { totalPop += 1; });

    // Economy
    let totalGold = 0, totalTrade = 0;
    countriesArr.forEach(c => { totalGold += (c.gold||c.wealth||0); totalTrade += (c.tradeIncome||0); });
    let econScore = Math.min(100, Math.floor(totalGold / (countriesArr.length||1) / 100));

    // Military
    let totalMilitary = 0;
    countriesArr.forEach(c => { totalMilitary += (c.military||c.army||0); });
    const activeWars = (typeof window.warsActive !== 'undefined') ? window.warsActive.length : 0;

    // Religion
    let totalFaith = 0;
    if (typeof window.religionData !== 'undefined' && window.religionData) totalFaith = Object.keys(window.religionData).length;
    if (typeof window.mythologyData !== 'undefined' && window.mythologyData.deities) totalFaith += window.mythologyData.deities.length;

    // Technology
    let techLevel = 0;
    if (typeof window.techData !== 'undefined' && window.techData.level) techLevel = window.techData.level;
    else if (typeof window.technologyData !== 'undefined' && window.technologyData.globalTechLevel) techLevel = window.technologyData.globalTechLevel;

    // Stability
    let stabSum = 0, stabCount = 0;
    countriesArr.forEach(c => { if (c.stability !== undefined) { stabSum += c.stability; stabCount++; } });
    const avgStability = stabCount > 0 ? Math.floor(stabSum / stabCount) : 50;

    // Divine
    let activeDivines = 0;
    if (typeof window.divineBeingData !== 'undefined' && window.divineBeingData.beings) activeDivines = window.divineBeingData.beings.filter(d=>d.active!==false).length;
    activeDivines += (window.divineAdminData?.createdDeities||[]).filter(d=>d.active!==false).length;

    // Bosses
    let activeBosses = 0;
    if (typeof window.worldBossData !== 'undefined' && window.worldBossData.activeBosses) activeBosses = window.worldBossData.activeBosses.filter(b=>b.active!==false).length;

    // Realm distribution
    const realmDist = {};
    alive.forEach(n => {
      const r = n.realm||0;
      realmDist[r] = (realmDist[r]||0) + 1;
    });

    // Top sects
    const sects_ = (typeof sects !== 'undefined') ? sects : [];
    const topSects = [...sects_].sort((a,b)=>(b.members||b.memberCount||0)-(a.members||a.memberCount||0)).slice(0,5);

    // Top countries
    const topCountries = [...countriesArr].sort((a,b)=>(b.population||0)-(a.population||0)).slice(0,5);

    // Top NPCs
    const topNPCs = [...alive].sort((a,b)=>(b.realm||0)-(a.realm||0)||(b.realmProgress||0)-(a.realmProgress||0)).slice(0,5);

    // Realm names
    const realmNames = ['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần','Luyện Hư','Hợp Thể','Đại Thừa','Độ Kiếp','Bất Diệt'];

    const analysis = {
      year: now_,
      ts: Date.now(),
      population: totalPop,
      npcAlive: alive.length,
      npcTotal: npcsArr.length,
      countriesCount: countriesArr.length,
      totalGold,
      totalTrade,
      econScore,
      totalMilitary,
      activeWars,
      totalFaith,
      techLevel,
      avgStability,
      activeDivines,
      activeBosses,
      realmDist,
      topSects,
      topCountries,
      topNPCs,
      realmNames
    };

    window.creatorAnalyticsData.lastAnalysis = analysis;
    save();
    return analysis;
  }

  /* ── RENDER ── */
  window.creatorAnalyticsRenderPanel = function() {
    const panel = document.getElementById('panel-creator-analytics');
    if (!panel) return;

    const A = collectAnalysis();
    const realmNames = A.realmNames;

    function bar(pct, color) {
      return `<div style="height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;margin-top:3px"><div style="height:100%;width:${Math.min(100,pct)}%;background:${color};border-radius:3px;transition:width 0.5s"></div></div>`;
    }

    function statCard(icon, label, value, sub, color, pct) {
      return `<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:12px">
        <div style="font-size:11px;color:var(--white-dim);margin-bottom:4px">${icon} ${label}</div>
        <div style="font-size:20px;font-weight:700;color:${color||'var(--white-main)'}">${value}</div>
        ${sub ? `<div style="font-size:11px;color:var(--white-dim);margin-top:2px">${sub}</div>` : ''}
        ${pct !== undefined ? bar(pct, color||'var(--gold)') : ''}
      </div>`;
    }

    const stabColor = A.avgStability >= 70 ? 'var(--jade)' : A.avgStability >= 40 ? 'var(--gold)' : 'var(--red)';
    const econColor = A.econScore >= 70 ? 'var(--jade)' : A.econScore >= 40 ? 'var(--gold)' : 'var(--red)';

    panel.innerHTML = `
<div style="padding:16px;max-width:1000px;margin:0 auto">
  <div style="text-align:center;margin-bottom:16px">
    <div style="font-family:var(--font-heading);font-size:18px;color:var(--blue);text-shadow:0 0 20px rgba(96,165,250,0.4)">📊 PHÂN TÍCH THẾ GIỚI V32</div>
    <div style="font-size:12px;color:var(--white-dim);margin-top:4px">Năm ${A.year} · Cập nhật lúc ${new Date(A.ts).toLocaleTimeString('vi')}</div>
  </div>

  <!-- TỔNG QUAN -->
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin-bottom:16px">
    ${statCard('👥','DÂN SỐ TỔNG', A.population > 1000000 ? (A.population/1000000).toFixed(1)+'M' : A.population > 1000 ? (A.population/1000).toFixed(1)+'K' : A.population, A.countriesCount + ' quốc gia', 'var(--jade)')}
    ${statCard('🧘','TU SĨ SỐNG', A.npcAlive.toLocaleString(), A.npcTotal + ' tổng cộng', '#60a5fa')}
    ${statCard('⚔️','QUÂN ĐỘI', A.totalMilitary > 1000 ? (A.totalMilitary/1000).toFixed(1)+'K' : A.totalMilitary, A.activeWars + ' chiến tranh đang diễn ra', '#f87171')}
    ${statCard('💰','KINH TẾ', econColor === 'var(--jade)' ? 'Thịnh Vượng' : econColor === 'var(--gold)' ? 'Ổn Định' : 'Suy Thoái', (A.totalGold/1000).toFixed(0)+'K Vàng tổng', econColor, A.econScore)}
    ${statCard('🏛','ỔN ĐỊNH', A.avgStability + '%', A.avgStability >= 70 ? 'Thái Bình' : A.avgStability >= 40 ? 'Bất Ổn' : 'Hỗn Loạn', stabColor, A.avgStability)}
    ${statCard('🔬','CÔNG NGHỆ', 'Cấp ' + (A.techLevel||0), 'Toàn cầu', '#67e8f9')}
    ${statCard('🙏','TÔN GIÁO', A.totalFaith + ' hệ', 'Tín ngưỡng đang lưu hành', '#c084fc')}
    ${statCard('👼','THẦN THÁNH', A.activeDivines + ' vị thần', A.activeBosses + ' Boss đang hoạt động', '#c084fc')}
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
    <!-- PHÂN BỔ CẢNH GIỚI -->
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px">
      <div style="font-size:13px;color:var(--gold);margin-bottom:10px;font-weight:700">🧘 PHÂN BỔ CẢNH GIỚI TU SĨ</div>
      <div style="display:flex;flex-direction:column;gap:5px">
        ${Object.entries(A.realmDist).sort((a,b)=>parseInt(b[0])-parseInt(a[0])).slice(0,10).map(([realm,count]) => {
          const pct = A.npcAlive > 0 ? Math.round(count/A.npcAlive*100) : 0;
          const colors = ['#94a3b8','#4ade80','#facc15','#fb923c','#f472b6','#c084fc','#67e8f9','#ff9e40','#ffffff','#ffd700'];
          const rn = realmNames[parseInt(realm)] || ('Cảnh Giới ' + realm);
          return `<div style="display:flex;align-items:center;gap:8px">
            <div style="width:80px;font-size:11px;color:${colors[parseInt(realm)]||'#fff'};flex-shrink:0">${rn}</div>
            <div style="flex:1;height:14px;background:rgba(255,255,255,0.04);border-radius:3px;overflow:hidden">
              <div style="height:100%;width:${pct}%;background:${colors[parseInt(realm)]||'#fff'};opacity:0.7;transition:width 0.5s"></div>
            </div>
            <div style="width:50px;font-size:11px;color:var(--white-dim);text-align:right">${count} (${pct}%)</div>
          </div>`;
        }).join('') || '<div style="font-size:12px;color:var(--white-dim)">Chưa có dữ liệu</div>'}
      </div>
    </div>

    <!-- TOP QUỐC GIA -->
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px">
      <div style="font-size:13px;color:var(--blue);margin-bottom:10px;font-weight:700">🌍 TOP QUỐC GIA</div>
      <div style="display:flex;flex-direction:column;gap:5px">
        ${A.topCountries.length === 0 ? '<div style="font-size:12px;color:var(--white-dim)">Chưa có dữ liệu</div>' :
          A.topCountries.map((c,i) => `
            <div style="display:flex;justify-content:space-between;padding:6px 8px;background:rgba(255,255,255,0.02);border-radius:6px">
              <div style="font-size:12px;color:var(--white-main)"><span style="color:var(--gold)">${['🥇','🥈','🥉','④','⑤'][i]}</span> ${c.name||'?'}</div>
              <div style="font-size:11px;color:var(--white-dim)">${(c.population||0).toLocaleString()} dân</div>
            </div>`).join('')}
      </div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
    <!-- TOP TU SĨ -->
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px">
      <div style="font-size:13px;color:var(--purple);margin-bottom:10px;font-weight:700">⭐ TOP TU SĨ MẠNH NHẤT</div>
      <div style="display:flex;flex-direction:column;gap:5px">
        ${A.topNPCs.length === 0 ? '<div style="font-size:12px;color:var(--white-dim)">Chưa có dữ liệu</div>' :
          A.topNPCs.map((n,i) => {
            const colors_ = ['#94a3b8','#4ade80','#facc15','#fb923c','#f472b6','#c084fc','#67e8f9','#ff9e40','#ffffff','#ffd700'];
            const rn_ = realmNames[n.realm||0] || 'Luyện Khí';
            return `<div style="display:flex;justify-content:space-between;padding:6px 8px;background:rgba(255,255,255,0.02);border-radius:6px">
              <div style="font-size:12px;color:var(--white-main)"><span style="color:var(--gold)">${['🥇','🥈','🥉','④','⑤'][i]}</span> ${n.name||'?'}</div>
              <div style="font-size:11px;color:${colors_[n.realm||0]};">${rn_}</div>
            </div>`;
          }).join('')}
      </div>
    </div>

    <!-- TOP TÔNG MÔN -->
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px">
      <div style="font-size:13px;color:var(--orange);margin-bottom:10px;font-weight:700">🏯 TOP TÔNG MÔN</div>
      <div style="display:flex;flex-direction:column;gap:5px">
        ${A.topSects.length === 0 ? '<div style="font-size:12px;color:var(--white-dim)">Chưa có dữ liệu</div>' :
          A.topSects.map((s,i) => `
            <div style="display:flex;justify-content:space-between;padding:6px 8px;background:rgba(255,255,255,0.02);border-radius:6px">
              <div style="font-size:12px;color:var(--white-main)"><span style="color:var(--gold)">${['🥇','🥈','🥉','④','⑤'][i]}</span> ${s.name||'?'}</div>
              <div style="font-size:11px;color:var(--white-dim)">${(s.members||s.memberCount||0)} thành viên</div>
            </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- CHIẾN TRANH & SỰ KIỆN -->
  <div style="background:var(--bg-card);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:14px;margin-bottom:12px">
    <div style="font-size:13px;color:var(--red);margin-bottom:10px;font-weight:700">⚔️ TÌNH HÌNH CHIẾN TRANH & SỰ KIỆN</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">
      <div style="padding:10px;background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15);border-radius:8px;text-align:center">
        <div style="font-size:24px;color:var(--red);font-weight:700">${A.activeWars}</div>
        <div style="font-size:11px;color:var(--white-dim)">Chiến Tranh Đang Diễn Ra</div>
      </div>
      <div style="padding:10px;background:rgba(248,113,113,0.06);border:1px solid rgba(248,113,113,0.15);border-radius:8px;text-align:center">
        <div style="font-size:24px;color:#f87171;font-weight:700">${A.activeBosses}</div>
        <div style="font-size:11px;color:var(--white-dim)">World Boss Hoạt Động</div>
      </div>
      <div style="padding:10px;background:rgba(192,132,252,0.06);border:1px solid rgba(192,132,252,0.15);border-radius:8px;text-align:center">
        <div style="font-size:24px;color:#c084fc;font-weight:700">${A.activeDivines}</div>
        <div style="font-size:11px;color:var(--white-dim)">Thần Thánh Hoạt Động</div>
      </div>
      <div style="padding:10px;background:rgba(250,204,21,0.06);border:1px solid rgba(250,204,21,0.15);border-radius:8px;text-align:center">
        <div style="font-size:24px;color:var(--gold);font-weight:700">${A.avgStability}%</div>
        <div style="font-size:11px;color:var(--white-dim)">Chỉ Số Ổn Định Trung Bình</div>
      </div>
    </div>
  </div>

  <div style="text-align:center">
    <button onclick="creatorAnalyticsRenderPanel()" style="padding:8px 20px;background:rgba(96,165,250,0.1);border:1px solid rgba(96,165,250,0.3);border-radius:7px;color:#60a5fa;cursor:pointer;font-size:12px">🔄 Cập Nhật Phân Tích</button>
  </div>
</div>`;
  };

  /* ── INIT ── */
  function init() {
    load();
    window.creatorAnalyticsData.initialized = true;
    console.log('[CreatorAnalytics V32] Khởi động thành công — Phân Tích Thế Giới sẵn sàng.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 2400); });
  } else {
    setTimeout(init, 2400);
  }
})();
