(function() {
  "use strict";

  window.livingUniverseRegistryV60State = {
    activeTab: "living-universe",
    initialized: false
  };

  const TABS = [
    { id: "living-universe", label: "🌍 Living Universe", icon: "🌍" },
    { id: "integration",     label: "🔗 Kết Nối",         icon: "🔗" },
    { id: "analytics",       label: "📊 Analytics",       icon: "📊" },
    { id: "world-story",     label: "📖 Câu Chuyện",      icon: "📖" },
    { id: "universe-health", label: "💚 Sức Khỏe",        icon: "💚" },
    { id: "omega-jarvis",    label: "🤖 Omega Jarvis",    icon: "🤖" }
  ];

  // ─── TAB: Living Universe ─────────────────────────────────────────────────
  function renderLivingUniverse() {
    const orch = window.luOrchestratorV60Data || {};
    const domains = orch.domains || {};
    const score = orch.integrationScore || 0;
    const alerts = orch.alerts || [];
    const maturity = window.universeMaturityV60Data || {};

    let domainRows = "";
    Object.values(domains).forEach(d => {
      const bar = Math.round((d.score / 100) * 16);
      const color = d.score >= 60 ? "#2ecc71" : d.score >= 30 ? "#f39c12" : "#e74c3c";
      domainRows += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
        <span style="width:110px;font-size:12px;color:#ccc;">${d.icon} ${d.label}</span>
        <div style="flex:1;background:#1a1a2e;border-radius:4px;height:12px;overflow:hidden;">
          <div style="width:${d.score}%;height:100%;background:${color};border-radius:4px;transition:width 0.3s;"></div>
        </div>
        <span style="width:36px;font-size:11px;color:${color};text-align:right;">${d.score}</span>
      </div>`;
    });

    let alertHtml = alerts.length > 0
      ? alerts.slice(0,4).map(a => `<div style="color:${a.type==='warning'?'#f39c12':'#e74c3c'};font-size:11px;margin:2px 0;">⚠️ ${a.msg}</div>`).join("")
      : '<div style="color:#2ecc71;font-size:12px;">✅ Không có cảnh báo.</div>';

    const tier = maturity.tierIcon || "🌱";
    const tierLabel = maturity.tierLabel || "Phôi Thai";
    const totalScore = maturity.overallScore || 0;

    return `<div style="padding:12px;">
      <div style="display:flex;gap:12px;margin-bottom:12px;">
        <div style="flex:1;background:#0d1b2a;border-radius:8px;padding:10px;text-align:center;border:1px solid #2c3e50;">
          <div style="font-size:28px;">${tier}</div>
          <div style="color:#f1c40f;font-weight:bold;">${tierLabel}</div>
          <div style="color:#aaa;font-size:12px;">Maturity Score</div>
          <div style="font-size:22px;color:#2ecc71;font-weight:bold;">${totalScore}<span style="font-size:12px;color:#aaa;">/100</span></div>
        </div>
        <div style="flex:1;background:#0d1b2a;border-radius:8px;padding:10px;text-align:center;border:1px solid #2c3e50;">
          <div style="font-size:28px;">🔗</div>
          <div style="color:#3498db;font-weight:bold;">Integration</div>
          <div style="color:#aaa;font-size:12px;">Điểm Kết Nối</div>
          <div style="font-size:22px;color:#3498db;font-weight:bold;">${score}<span style="font-size:12px;color:#aaa;">/100</span></div>
        </div>
        <div style="flex:1;background:#0d1b2a;border-radius:8px;padding:10px;text-align:center;border:1px solid #2c3e50;">
          <div style="font-size:28px;">⚠️</div>
          <div style="color:#e74c3c;font-weight:bold;">Cảnh Báo</div>
          <div style="color:#aaa;font-size:12px;">Điểm Nghẽn</div>
          <div style="font-size:22px;color:#e74c3c;font-weight:bold;">${alerts.length}</div>
        </div>
      </div>
      <div style="background:#0d1b2a;border-radius:8px;padding:10px;margin-bottom:10px;border:1px solid #2c3e50;">
        <div style="color:#f1c40f;font-weight:bold;margin-bottom:8px;">12 DOMAIN THẾ GIỚI</div>
        ${domainRows}
      </div>
      <div style="background:#0d1b2a;border-radius:8px;padding:10px;border:1px solid #2c3e50;">
        <div style="color:#e74c3c;font-weight:bold;margin-bottom:6px;">CỬA SỔ CẢNH BÁO</div>
        ${alertHtml}
      </div>
    </div>`;
  }

  // ─── TAB: Integration ─────────────────────────────────────────────────────
  function renderIntegration() {
    const orch = window.luOrchestratorV60Data || {};
    const links = orch.integrationLinks || [];
    const stats = window.luo60GetStats ? window.luo60GetStats() : {};
    const ceStats = window.cee60GetStats ? window.cee60GetStats() : {};
    const ceHistory = window.cee60GetHistory ? window.cee60GetHistory() : [];

    let linkRows = links.map(l => {
      const color = l.score >= 60 ? "#2ecc71" : l.score >= 35 ? "#f39c12" : "#e74c3c";
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 6px;border-radius:4px;margin-bottom:2px;background:#111827;">
        <span style="font-size:11px;color:#ccc;">${l.from} → ${l.to}</span>
        <span style="font-size:12px;font-weight:bold;color:${color};">${l.score}</span>
      </div>`;
    }).join("");

    let ceHtml = ceHistory.length > 0
      ? ceHistory.slice(0,5).map(c => `<div style="background:#111827;border-radius:4px;padding:6px;margin-bottom:4px;">
          <span style="color:#f39c12;">${c.icon}</span> <span style="color:#eee;font-size:12px;">${c.name}</span>
          <span style="color:#aaa;font-size:11px;float:right;">Năm ${c.year}</span>
        </div>`).join("")
      : '<div style="color:#aaa;font-size:12px;padding:6px;">Chưa có chuỗi nhân quả nào kích hoạt.</div>';

    return `<div style="padding:12px;">
      <div style="display:flex;gap:10px;margin-bottom:12px;">
        <div style="flex:1;background:#0d1b2a;border-radius:8px;padding:10px;text-align:center;border:1px solid #2c3e50;">
          <div style="font-size:24px;">⚙️</div>
          <div style="color:#2ecc71;font-size:18px;font-weight:bold;">${stats.activeDomains || 0}/${stats.totalDomains || 12}</div>
          <div style="color:#aaa;font-size:11px;">Domain Hoạt Động</div>
        </div>
        <div style="flex:1;background:#0d1b2a;border-radius:8px;padding:10px;text-align:center;border:1px solid #2c3e50;">
          <div style="font-size:24px;">🔗</div>
          <div style="color:#3498db;font-size:18px;font-weight:bold;">${stats.integrationLinks || 0}</div>
          <div style="color:#aaa;font-size:11px;">Liên Kết</div>
        </div>
        <div style="flex:1;background:#0d1b2a;border-radius:8px;padding:10px;text-align:center;border:1px solid #2c3e50;">
          <div style="font-size:24px;">⚡</div>
          <div style="color:#f39c12;font-size:18px;font-weight:bold;">${ceStats.totalTriggered || 0}</div>
          <div style="color:#aaa;font-size:11px;">Chuỗi Nhân Quả</div>
        </div>
      </div>
      <div style="background:#0d1b2a;border-radius:8px;padding:10px;margin-bottom:10px;border:1px solid #2c3e50;max-height:180px;overflow-y:auto;">
        <div style="color:#3498db;font-weight:bold;margin-bottom:6px;">LIÊN KẾT DOMAIN</div>
        ${linkRows}
      </div>
      <div style="background:#0d1b2a;border-radius:8px;padding:10px;border:1px solid #2c3e50;">
        <div style="color:#f39c12;font-weight:bold;margin-bottom:6px;">CHUỖI NHÂN QUẢ GẦN NHẤT</div>
        ${ceHtml}
      </div>
    </div>`;
  }

  // ─── TAB: Analytics ───────────────────────────────────────────────────────
  function renderAnalytics() {
    const dash = window.uae60GetDashboard ? window.uae60GetDashboard() : {};
    const metrics = dash.metrics || {};
    const trends = dash.trends || {};
    const insights = dash.insights || [];
    const defs = window.uae60GetMetricsDef ? window.uae60GetMetricsDef() : [];

    const trendIcon = t => t === "up" ? "📈" : t === "down" ? "📉" : "➡️";

    let metricRows = defs.map(m => {
      const val = metrics[m.id] !== undefined ? metrics[m.id] : 0;
      const tr = trends[m.id] || "stable";
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;background:#111827;border-radius:4px;margin-bottom:3px;">
        <span style="color:#ccc;font-size:12px;">${m.icon} ${m.label}</span>
        <span style="color:#f1c40f;font-weight:bold;font-size:13px;">${val} <span style="color:#aaa;font-size:10px;">${m.unit}</span></span>
        <span style="font-size:14px;">${trendIcon(tr)}</span>
      </div>`;
    }).join("");

    let insightHtml = insights.length > 0
      ? insights.slice(0,5).map(i => `<div style="font-size:11px;color:#ddd;padding:3px 0;border-bottom:1px solid #1a2a3a;">${i}</div>`).join("")
      : '<div style="color:#aaa;font-size:12px;">Chưa đủ dữ liệu.</div>';

    return `<div style="padding:12px;">
      <div style="background:#0d1b2a;border-radius:8px;padding:10px;margin-bottom:10px;border:1px solid #2c3e50;">
        <div style="color:#f1c40f;font-weight:bold;margin-bottom:8px;">6 CHỈ SỐ CHÍNH</div>
        ${metricRows}
      </div>
      <div style="background:#0d1b2a;border-radius:8px;padding:10px;border:1px solid #2c3e50;">
        <div style="color:#2ecc71;font-weight:bold;margin-bottom:6px;">NHẬN XÉT PHÂN TÍCH</div>
        ${insightHtml}
      </div>
      <div style="margin-top:8px;text-align:center;">
        <button onclick="window.uae60ForceSnapshot&&window.uae60ForceSnapshot();window.lur60ShowTab('analytics');"
          style="background:#3498db;color:white;border:none;border-radius:6px;padding:6px 16px;cursor:pointer;font-size:12px;">
          📊 Lấy Snapshot Ngay
        </button>
      </div>
    </div>`;
  }

  // ─── TAB: World Story ─────────────────────────────────────────────────────
  function renderWorldStory() {
    const all = window.wne60GetAll ? window.wne60GetAll() : [];
    const stats = window.wne60GetStats ? window.wne60GetStats() : {};

    let storyHtml = all.length > 0
      ? all.slice(0,10).map(e => {
          const typeColor = e.type === "legend" ? "#f1c40f" : e.type === "turning_point" ? "#e74c3c" : "#3498db";
          const typeLabel = e.type === "legend" ? "⚔️ Truyền Thuyết" : e.type === "turning_point" ? "🔥 Bước Ngoặt" : "📜 Biên Niên";
          return `<div style="background:#111827;border-radius:6px;padding:8px;margin-bottom:6px;border-left:3px solid ${typeColor};">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span style="color:${typeColor};font-size:11px;font-weight:bold;">${typeLabel}</span>
              <span style="color:#aaa;font-size:11px;">Năm ${e.year}</span>
            </div>
            <div style="color:#ddd;font-size:12px;line-height:1.4;">${e.text.substring(0,180)}${e.text.length > 180 ? '...' : ''}</div>
          </div>`;
        }).join("")
      : '<div style="color:#aaa;padding:12px;text-align:center;">Biên niên sử đang được viết... Hãy để thế giới vận hành thêm.</div>';

    return `<div style="padding:12px;">
      <div style="display:flex;gap:8px;margin-bottom:10px;">
        <div style="flex:1;background:#0d1b2a;border-radius:8px;padding:8px;text-align:center;border:1px solid #2c3e50;">
          <div style="color:#3498db;font-size:16px;font-weight:bold;">${stats.chronicles || 0}</div>
          <div style="color:#aaa;font-size:10px;">📜 Biên Niên</div>
        </div>
        <div style="flex:1;background:#0d1b2a;border-radius:8px;padding:8px;text-align:center;border:1px solid #2c3e50;">
          <div style="color:#f1c40f;font-size:16px;font-weight:bold;">${stats.legends || 0}</div>
          <div style="color:#aaa;font-size:10px;">⚔️ Truyền Thuyết</div>
        </div>
        <div style="flex:1;background:#0d1b2a;border-radius:8px;padding:8px;text-align:center;border:1px solid #2c3e50;">
          <div style="color:#e74c3c;font-size:16px;font-weight:bold;">${stats.turningPoints || 0}</div>
          <div style="color:#aaa;font-size:10px;">🔥 Bước Ngoặt</div>
        </div>
        <div style="flex:1;background:#0d1b2a;border-radius:8px;padding:8px;text-align:center;border:1px solid #2c3e50;">
          <div style="color:#2ecc71;font-size:16px;font-weight:bold;">${stats.totalGenerated || 0}</div>
          <div style="color:#aaa;font-size:10px;">📚 Tổng</div>
        </div>
      </div>
      <div style="max-height:320px;overflow-y:auto;">
        ${storyHtml}
      </div>
      <div style="margin-top:8px;text-align:center;">
        <button onclick="window.wne60GenerateChronicle&&window.wne60GenerateChronicle();window.lur60ShowTab('world-story');"
          style="background:#3498db;color:white;border:none;border-radius:6px;padding:6px 14px;cursor:pointer;font-size:12px;margin-right:6px;">
          📜 Viết Biên Niên
        </button>
        <button onclick="window.wne60GenerateEpochSummary&&window.wne60GenerateEpochSummary();window.lur60ShowTab('world-story');"
          style="background:#9b59b6;color:white;border:none;border-radius:6px;padding:6px 14px;cursor:pointer;font-size:12px;">
          🌍 Tóm Tắt Kỷ Nguyên
        </button>
      </div>
    </div>`;
  }

  // ─── TAB: Universe Health ─────────────────────────────────────────────────
  function renderUniverseHealth() {
    const dims = window.ums60GetDimensions ? window.ums60GetDimensions() : [];
    const tier = window.ums60GetTier ? window.ums60GetTier() : {};
    const score = window.ums60GetScore ? window.ums60GetScore() : 0;
    const report = window.ums60GetJarvisReport ? window.ums60GetJarvisReport() : {};
    const tiers = window.ums60GetTiers ? window.ums60GetTiers() : [];

    let dimRows = dims.map(d => {
      const bar = d.score;
      const color = d.score >= 60 ? "#2ecc71" : d.score >= 30 ? "#f39c12" : "#e74c3c";
      return `<div style="margin-bottom:6px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
          <span style="font-size:12px;color:#ccc;">${d.icon} ${d.label}</span>
          <span style="font-size:12px;color:${color};font-weight:bold;">${d.score}/100</span>
        </div>
        <div style="background:#1a1a2e;border-radius:4px;height:8px;">
          <div style="width:${bar}%;height:100%;background:${color};border-radius:4px;"></div>
        </div>
      </div>`;
    }).join("");

    let tiersHtml = tiers.map(t => {
      const active = score >= t.min && score < t.max;
      return `<div style="display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:4px;${active ? 'background:#1a3a1a;border:1px solid #2ecc71;' : ''}">
        <span style="font-size:16px;">${t.icon}</span>
        <span style="font-size:12px;color:${active ? '#2ecc71' : '#aaa'};">${t.label}</span>
        <span style="font-size:11px;color:#555;">(${t.min}–${t.max})</span>
        ${active ? '<span style="color:#2ecc71;font-size:10px;margin-left:auto;">◀ Hiện tại</span>' : ''}
      </div>`;
    }).join("");

    return `<div style="padding:12px;">
      <div style="text-align:center;background:#0d1b2a;border-radius:8px;padding:12px;margin-bottom:10px;border:1px solid #2c3e50;">
        <div style="font-size:40px;margin-bottom:4px;">${tier.icon || "🌱"}</div>
        <div style="color:#f1c40f;font-size:16px;font-weight:bold;">${tier.label || "Phôi Thai"}</div>
        <div style="font-size:28px;color:#2ecc71;font-weight:bold;">${score}<span style="font-size:14px;color:#aaa;">/100</span></div>
        <div style="color:#aaa;font-size:11px;margin-top:4px;">${tier.desc || ""}</div>
      </div>
      <div style="background:#0d1b2a;border-radius:8px;padding:10px;margin-bottom:10px;border:1px solid #2c3e50;">
        <div style="color:#f1c40f;font-weight:bold;margin-bottom:8px;">8 CHIỀU ĐO LƯỜNG</div>
        ${dimRows}
      </div>
      <div style="background:#0d1b2a;border-radius:8px;padding:10px;margin-bottom:10px;border:1px solid #2c3e50;">
        <div style="color:#3498db;font-weight:bold;margin-bottom:6px;">THANG ĐO TRƯỞNG THÀNH</div>
        ${tiersHtml}
      </div>
      <div style="background:#0d1b2a;border-radius:8px;padding:8px;border:1px solid #2c3e50;">
        <div style="color:#9b59b6;font-size:12px;">${report.strengths || ""}</div>
        <div style="color:#e74c3c;font-size:12px;margin-top:4px;">${report.weaknesses || ""}</div>
        <div style="color:#2ecc71;font-size:12px;margin-top:4px;">${report.advice || ""}</div>
      </div>
    </div>`;
  }

  // ─── TAB: Omega Jarvis ────────────────────────────────────────────────────
  function renderOmegaJarvis() {
    const orch = window.luOrchestratorV60Data || {};
    const analytics = window.uae60GetJarvisInsights ? window.uae60GetJarvisInsights() : "Analytics đang khởi tạo...";
    const maturity = window.ums60GetJarvisReport ? window.ums60GetJarvisReport() : {};
    const narrative = window.wne60GetJarvisStory ? window.wne60GetJarvisStory() : "Biên niên sử đang được viết...";
    const ceStats = window.cee60GetStats ? window.cee60GetStats() : {};
    const ceHistory = window.cee60GetHistory ? window.cee60GetHistory() : [];

    const countries = window.countries || [];
    const avgStab = countries.length ? Math.round(countries.reduce((s,c) => s+(c.stability||50),0)/countries.length) : 50;
    const avgEcon = countries.length ? Math.round(countries.reduce((s,c) => s+(c.economy||50),0)/countries.length) : 50;
    const wars = (window.warsActive || []).length;
    const npcs = window.npcs || [];
    const heroes = npcs.filter(n => n.isHero || (n.fame&&n.fame>300)).length;
    const integrationScore = orch.integrationScore || 0;
    const matScore = window.ums60GetScore ? window.ums60GetScore() : 0;

    const worldStatus = avgStab > 65 && avgEcon > 60 ? "🟢 Phồn Thịnh" : avgStab > 40 ? "🟡 Bình Thường" : "🔴 Nguy Hiểm";

    const ceChainText = ceHistory.length > 0
      ? `${ceHistory.length} chuỗi nhân quả đã kích hoạt. Gần nhất: ${ceHistory[0].icon} ${ceHistory[0].name} (năm ${ceHistory[0].year}).`
      : "Chưa có chuỗi nhân quả nào. Hãy để các điều kiện chín muồi.";

    const forecastText = integrationScore > 60
      ? "🔭 Dự báo: Thế giới sẽ tiếp tục phát triển bền vững với hệ sinh thái tích hợp cao."
      : integrationScore > 30
        ? "🔭 Dự báo: Một số hệ thống cần kết nối chặt chẽ hơn để phát huy tối đa tiềm năng."
        : "🔭 Dự báo: Nhiều hệ thống còn cô lập — cần tích hợp để thế giới sống động hơn.";

    return `<div style="padding:12px;">
      <div style="background:linear-gradient(135deg,#0d1b2a,#1a1a3e);border-radius:10px;padding:14px;margin-bottom:10px;border:1px solid #3498db;">
        <div style="font-size:18px;font-weight:bold;color:#3498db;margin-bottom:6px;">🤖 JARVIS OMEGA MODE — Living Universe Assistant</div>
        <div style="color:#aaa;font-size:11px;">Phân tích toàn thế giới · Phát hiện điểm nghẽn · Tóm tắt lịch sử · Dự báo tương lai</div>
      </div>
      <div style="background:#0d1b2a;border-radius:8px;padding:10px;margin-bottom:8px;border:1px solid #2c3e50;">
        <div style="color:#f1c40f;font-weight:bold;margin-bottom:6px;">🌍 TRẠNG THÁI THẾ GIỚI</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;">
          <div style="color:#ccc;">Trạng thái: <span style="color:#2ecc71;">${worldStatus}</span></div>
          <div style="color:#ccc;">Ổn định TB: <span style="color:#f39c12;">${avgStab}/100</span></div>
          <div style="color:#ccc;">Kinh tế TB: <span style="color:#3498db;">${avgEcon}/100</span></div>
          <div style="color:#ccc;">Chiến tranh: <span style="color:#e74c3c;">${wars}</span></div>
          <div style="color:#ccc;">Anh hùng: <span style="color:#9b59b6;">${heroes}</span></div>
          <div style="color:#ccc;">Năm hiện tại: <span style="color:#1abc9c;">${window.year || 0}</span></div>
        </div>
      </div>
      <div style="background:#0d1b2a;border-radius:8px;padding:10px;margin-bottom:8px;border:1px solid #2c3e50;">
        <div style="color:#9b59b6;font-weight:bold;margin-bottom:4px;">📊 PHÂN TÍCH TÍCH HỢP</div>
        <div style="font-size:12px;color:#ddd;line-height:1.5;">
          Integration Score: <b style="color:${integrationScore>60?'#2ecc71':integrationScore>30?'#f39c12':'#e74c3c'}">${integrationScore}/100</b><br>
          Maturity Score: <b style="color:#f1c40f">${matScore}/100</b> (${maturity.overall || ""})<br>
          ${analytics}
        </div>
      </div>
      <div style="background:#0d1b2a;border-radius:8px;padding:10px;margin-bottom:8px;border:1px solid #2c3e50;">
        <div style="color:#f39c12;font-weight:bold;margin-bottom:4px;">⚡ CHUỖI NHÂN QUẢ</div>
        <div style="font-size:12px;color:#ddd;line-height:1.5;">${ceChainText}</div>
      </div>
      <div style="background:#0d1b2a;border-radius:8px;padding:10px;margin-bottom:8px;border:1px solid #2c3e50;">
        <div style="color:#3498db;font-weight:bold;margin-bottom:4px;">📖 TÓM TẮT LỊCH SỬ</div>
        <div style="font-size:12px;color:#ddd;line-height:1.5;">${narrative}</div>
      </div>
      <div style="background:#0d1b2a;border-radius:8px;padding:10px;border:1px solid #2c3e50;">
        <div style="color:#1abc9c;font-weight:bold;margin-bottom:4px;">🔭 DỰ BÁO TƯƠNG LAI</div>
        <div style="font-size:12px;color:#ddd;line-height:1.5;">${forecastText}</div>
        <div style="font-size:11px;color:#aaa;margin-top:6px;">${maturity.advice || ""}</div>
      </div>
      <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;">
        <button onclick="window.luo60GetState&&window.lur60ShowTab('living-universe');"
          style="background:#2c3e50;color:white;border:none;border-radius:6px;padding:5px 10px;cursor:pointer;font-size:11px;">🌍 Xem Domain</button>
        <button onclick="window.ums60ForceEvaluate&&window.ums60ForceEvaluate();window.lur60ShowTab('universe-health');"
          style="background:#2c3e50;color:white;border:none;border-radius:6px;padding:5px 10px;cursor:pointer;font-size:11px;">💚 Đánh Giá Ngay</button>
        <button onclick="window.wne60GenerateEpochSummary&&window.wne60GenerateEpochSummary();window.lur60ShowTab('world-story');"
          style="background:#2c3e50;color:white;border:none;border-radius:6px;padding:5px 10px;cursor:pointer;font-size:11px;">📖 Tóm Tắt KN</button>
        <button onclick="window.uae60ForceSnapshot&&window.uae60ForceSnapshot();window.lur60ShowTab('analytics');"
          style="background:#2c3e50;color:white;border:none;border-radius:6px;padding:5px 10px;cursor:pointer;font-size:11px;">📊 Lấy Snapshot</button>
      </div>
    </div>`;
  }

  // ─── RENDER DISPATCH ──────────────────────────────────────────────────────
  function renderTabContent(tabId) {
    switch(tabId) {
      case "living-universe":  return renderLivingUniverse();
      case "integration":      return renderIntegration();
      case "analytics":        return renderAnalytics();
      case "world-story":      return renderWorldStory();
      case "universe-health":  return renderUniverseHealth();
      case "omega-jarvis":     return renderOmegaJarvis();
      default: return "<div style='padding:12px;color:#aaa;'>Tab không xác định.</div>";
    }
  }

  function renderV60Panel() {
    const activeTab = window.livingUniverseRegistryV60State.activeTab;
    const tabBtns = TABS.map(t => {
      const active = t.id === activeTab;
      return `<button onclick="window.lur60ShowTab('${t.id}');" style="padding:6px 10px;border:none;background:${active ? '#3498db' : '#1a2a3a'};color:${active ? 'white' : '#aaa'};border-radius:5px;cursor:pointer;font-size:11px;white-space:nowrap;${active ? 'font-weight:bold;' : ''}">${t.label}</button>`;
    }).join("");

    const content = renderTabContent(activeTab);
    return `<div id="v60-living-hub" style="background:#070d1a;min-height:100%;color:#eee;font-family:'Noto Serif SC',serif;">
      <div style="background:#0d1b2a;padding:8px 12px;border-bottom:2px solid #3498db;display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
        <span style="color:#3498db;font-weight:bold;font-size:13px;margin-right:4px;">🌍 V60</span>
        ${tabBtns}
      </div>
      <div id="v60-tab-content">${content}</div>
    </div>`;
  }

  window.lur60ShowTab = function(tabId) {
    window.livingUniverseRegistryV60State.activeTab = tabId;
    const el = document.getElementById("v60-living-hub");
    if (el) {
      const contentEl = document.getElementById("v60-tab-content");
      if (contentEl) {
        contentEl.innerHTML = renderTabContent(tabId);
        // Re-render tab buttons to update active state
        const tabContainer = el.querySelector('div:first-child');
        if (tabContainer) {
          const oldBtns = tabContainer.querySelectorAll('button');
          oldBtns.forEach(b => b.remove());
          TABS.forEach(t => {
            const active = t.id === tabId;
            const btn = document.createElement("button");
            btn.innerHTML = t.label;
            btn.style.cssText = `padding:6px 10px;border:none;background:${active ? '#3498db' : '#1a2a3a'};color:${active ? 'white' : '#aaa'};border-radius:5px;cursor:pointer;font-size:11px;white-space:nowrap;${active ? 'font-weight:bold;' : ''}`;
            btn.onclick = function() { window.lur60ShowTab(t.id); };
            tabContainer.appendChild(btn);
          });
        }
      }
    } else {
      const panelEl = document.getElementById("panel-creator-hub-v32");
      if (panelEl) {
        let wrapper = document.getElementById("v60-section-wrapper");
        if (wrapper) wrapper.innerHTML = renderV60Panel();
      }
    }
  };

  window.lur60HubRenderPanel = function() {
    return renderV60Panel();
  };

  // Patch hubRenderPanel for creator-hub-v32
  function init() {
    const _orig = window.hubRenderPanel;
    window.hubRenderPanel = function(panelId) {
      if (_orig) _orig(panelId);
      if (panelId === "creator-hub-v32") {
        setTimeout(function() {
          const panelEl = document.getElementById("panel-creator-hub-v32");
          if (!panelEl) return;
          let wrapper = document.getElementById("v60-section-wrapper");
          if (!wrapper) {
            wrapper = document.createElement("div");
            wrapper.id = "v60-section-wrapper";
            wrapper.style.cssText = "margin-top:8px;border-top:2px solid #3498db;";
            panelEl.appendChild(wrapper);
          }
          wrapper.innerHTML = renderV60Panel();
          window.livingUniverseRegistryV60State.initialized = true;
        }, 80);
      }
    };
    console.log("[LivingUniverseRegistryV60] 🌍 Living Universe Registry V60 — 6 tabs (Living Universe/Integration/Analytics/World Story/Universe Health/Omega Jarvis) trong creator-hub-v32 sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 12000); });
  } else {
    setTimeout(init, 12000);
  }
})();
