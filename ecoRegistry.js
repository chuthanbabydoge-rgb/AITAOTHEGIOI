(function() {
  "use strict";

  // ═══ HELPER ═══
  function _style(css) { return ' style="' + css + '"'; }
  function _btn(onclick, color, text) {
    return '<button onclick="' + onclick + '"' + _style('background:'+color+';color:#fff;border:none;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px;margin:2px') + '>' + text + '</button>';
  }
  function _panel(id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }
  function _showPanel(id) {
    if (typeof showPanel === "function") showPanel(id);
  }

  // ═══ SUB-NAV ═══
  function _subNav(active) {
    var tabs = [
      { id:"eco-overview-v45",   icon:"🌿", label:"Tổng Quan"  },
      { id:"eco-climate-v45",    icon:"🌤️", label:"Khí Hậu"    },
      { id:"eco-seasons-v45",    icon:"🌸", label:"Mùa"        },
      { id:"eco-creatures-v45",  icon:"🦎", label:"Sinh Vật"   },
      { id:"eco-resources-v45",  icon:"⛏️", label:"Tài Nguyên" },
      { id:"eco-disasters-v45",  icon:"🌪️", label:"Thiên Tai"  },
    ];
    var html = '<div' + _style('display:flex;flex-wrap:wrap;gap:4px;margin-bottom:14px') + '>';
    tabs.forEach(function(t) {
      var active_style = (t.id === active)
        ? 'background:#166534;border:1px solid #22c55e;color:#4ade80;'
        : 'background:#0f172a;border:1px solid #1e293b;color:#64748b;';
      html += '<button onclick="if(typeof ecoRenderPanel===\'function\')ecoRenderPanel(\'' + t.id + '\')"'
        + _style(active_style + 'padding:5px 10px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600')
        + '>' + t.icon + ' ' + t.label + '</button>';
    });
    return html + '</div>';
  }

  // ═══ PANEL: OVERVIEW ═══
  function _renderOverview() {
    var climData  = window.ecoClimateData  || {};
    var resData   = window.ecoResourceData || {};
    var crtData   = window.ecoCreatureData || {};
    var disData   = window.ecoDisasterData || {};
    var climate   = (typeof window.ecoGetCurrentClimate  === "function") ? window.ecoGetCurrentClimate()  : { name:"Ôn Đới", icon:"🌿", color:"#22c55e" };
    var season    = (typeof window.ecoGetCurrentSeason   === "function") ? window.ecoGetCurrentSeason()   : { name:"Xuân", icon:"🌸" };
    var effects   = (typeof window.ecoGetEffects         === "function") ? window.ecoGetEffects()         : {};
    var cStats    = (typeof window.ecoGetCreatureStats   === "function") ? window.ecoGetCreatureStats()   : { alive:0, extinct:0, endangered:0 };
    var dStats    = (typeof window.ecoGetDisasterStats   === "function") ? window.ecoGetDisasterStats()   : { total:0, active:0 };
    var rStats    = (typeof window.ecoGetResourceStats   === "function") ? window.ecoGetResourceStats()   : { thriving:0, depleted:0 };

    var html = '<div' + _style('padding:16px') + '>';
    html += _subNav("eco-overview-v45");

    // Status cards
    html += '<div' + _style('display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px') + '>';
    var cards = [
      { icon: climate.icon, label:"Khí Hậu",   val: climate.name,           color: climate.color||"#22c55e" },
      { icon: season.icon,  label:"Mùa",        val: season.name,            color:"#f59e0b" },
      { icon:"🦎",          label:"Sinh Vật",   val: cStats.alive + " loài", color:"#34d399" },
      { icon:"⛏️",          label:"Tài Nguyên", val: rStats.thriving + "/5", color:"#94a3b8" },
      { icon:"🌪️",          label:"Thiên Tai",  val: dStats.total + " vụ",   color:"#ef4444" },
      { icon:"💀",          label:"Tuyệt Chủng",val: cStats.extinct + " loài",color:"#6b7280" },
    ];
    cards.forEach(function(c) {
      html += '<div' + _style('background:#1e293b;border:1px solid ' + c.color + '33;border-radius:8px;padding:10px;text-align:center') + '>'
        + '<div' + _style('font-size:22px') + '>' + c.icon + '</div>'
        + '<div' + _style('font-size:10px;color:#64748b;margin:2px 0') + '>' + c.label + '</div>'
        + '<div' + _style('font-size:13px;color:' + c.color + ';font-weight:700') + '>' + c.val + '</div>'
        + '</div>';
    });
    html += '</div>';

    // Active effects
    html += '<div' + _style('background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-bottom:12px') + '>'
      + '<div' + _style('color:#94a3b8;font-size:12px;font-weight:700;margin-bottom:8px') + '>⚡ Hiệu Ứng Hiện Tại</div>'
      + '<div' + _style('display:grid;grid-template-columns:repeat(2,1fr);gap:6px') + '>';
    var effList = [
      { k:"popBonus",  label:"Dân Số",     icon:"👥" },
      { k:"agriBonus", label:"Nông Nghiệp",icon:"🌾" },
      { k:"econBonus", label:"Kinh Tế",    icon:"💰" },
      { k:"warBonus",  label:"Chiến Tranh",icon:"⚔️" },
    ];
    effList.forEach(function(e) {
      var val = effects[e.k] || 1.0;
      var col = val >= 1.1 ? "#22c55e" : val <= 0.9 ? "#ef4444" : "#94a3b8";
      var sign = val >= 1.0 ? "+" : "";
      html += '<div' + _style('background:#1e293b;border-radius:6px;padding:6px 10px;display:flex;justify-content:space-between') + '>'
        + '<span' + _style('color:#64748b;font-size:11px') + '>' + e.icon + ' ' + e.label + '</span>'
        + '<span' + _style('color:' + col + ';font-weight:700;font-size:12px') + '>' + sign + ((val-1)*100).toFixed(0) + '%</span>'
        + '</div>';
    });
    html += '</div></div>';

    // Active disasters
    var active = (typeof window.ecoGetActiveDisasters === "function") ? window.ecoGetActiveDisasters() : [];
    if (active.length > 0) {
      html += '<div' + _style('background:#1e293b;border:1px solid #ef444444;border-radius:8px;padding:12px') + '>'
        + '<div' + _style('color:#ef4444;font-size:12px;font-weight:700;margin-bottom:6px') + '>🚨 Thiên Tai Đang Xảy Ra</div>';
      active.slice(0,3).forEach(function(d) {
        html += '<div' + _style('background:#0f172a;border-radius:6px;padding:6px 10px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center') + '>'
          + '<span>' + d.icon + ' ' + d.name + ' [' + d.severity + ']</span>'
          + '<span' + _style('color:#f59e0b;font-size:11px') + '>' + d.ticksLeft + ' ticks</span>'
          + '</div>';
      });
      html += '</div>';
    }

    html += '</div>';
    _panel("panel-eco-overview-v45", html);
  }

  // ═══ PANEL: CLIMATE ═══
  function _renderClimate() {
    var current  = (typeof window.ecoGetCurrentClimate === "function") ? window.ecoGetCurrentClimate() : { id:"temperate", name:"Ôn Đới", icon:"🌿", color:"#22c55e" };
    var climates = (typeof window.ecoGetClimates === "function") ? window.ecoGetClimates() : [];
    var history  = (window.ecoClimateData && window.ecoClimateData.history) || [];

    var html = '<div' + _style('padding:16px') + '>';
    html += _subNav("eco-climate-v45");

    html += '<div' + _style('background:linear-gradient(135deg,'+current.color+'22,#0f172a);border:1px solid '+current.color+'66;border-radius:10px;padding:14px;margin-bottom:14px;text-align:center') + '>'
      + '<div' + _style('font-size:36px;margin-bottom:6px') + '>' + current.icon + '</div>'
      + '<div' + _style('font-size:18px;color:'+current.color+';font-weight:700;font-family:Cinzel,serif') + '>' + current.name + '</div>'
      + '<div' + _style('font-size:11px;color:#64748b;margin-top:4px') + '>Khí hậu hiện tại của thế giới</div>'
      + '</div>';

    html += '<div' + _style('color:#94a3b8;font-size:12px;font-weight:700;margin-bottom:8px') + '>Thay Đổi Khí Hậu</div>';
    html += '<div' + _style('display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:14px') + '>';
    climates.slice(0,8).forEach(function(c) {
      var isActive = c.id === current.id;
      var border = isActive ? '2px solid '+c.color : '1px solid #1e293b';
      html += '<div' + _style('background:#1e293b;border:'+border+';border-radius:8px;padding:8px;cursor:pointer;text-align:center')
        + ' onclick="if(typeof ecoSetClimate===\'function\')ecoSetClimate(\''+c.id+'\');if(typeof ecoRenderPanel===\'function\')ecoRenderPanel(\'eco-climate-v45\')">'
        + '<div' + _style('font-size:20px') + '>' + c.icon + '</div>'
        + '<div' + _style('font-size:11px;color:'+c.color+';font-weight:600;margin-top:2px') + '>' + c.name + '</div>'
        + '<div' + _style('font-size:9px;color:#475569;margin-top:1px') + '>' + (c.resources||[]).join(' · ') + '</div>'
        + '</div>';
    });
    html += '</div>';

    if (history.length > 0) {
      html += '<div' + _style('color:#94a3b8;font-size:12px;font-weight:700;margin-bottom:6px') + '>📜 Lịch Sử Khí Hậu</div>';
      html += '<div' + _style('max-height:120px;overflow-y:auto') + '>';
      history.slice(-5).reverse().forEach(function(h) {
        html += '<div' + _style('background:#0f172a;border-radius:6px;padding:5px 8px;margin-bottom:3px;font-size:11px;color:#64748b;display:flex;justify-content:space-between') + '>'
          + '<span>Năm ' + h.year + ': ' + (h.from||'?') + ' → ' + h.to + '</span>'
          + '</div>';
      });
      html += '</div>';
    }

    html += '</div>';
    _panel("panel-eco-climate-v45", html);
  }

  // ═══ PANEL: SEASONS ═══
  function _renderSeasons() {
    var seasons   = (typeof window.ecoGetSeasons === "function") ? window.ecoGetSeasons() : [];
    var current   = (typeof window.ecoGetCurrentSeason === "function") ? window.ecoGetCurrentSeason() : { id:"spring", name:"Xuân", icon:"🌸" };
    var effects   = (typeof window.ecoGetEffects === "function") ? window.ecoGetEffects() : {};
    var seasonTick = (window.ecoClimateData && window.ecoClimateData.seasonTick) || 0;

    var html = '<div' + _style('padding:16px') + '>';
    html += _subNav("eco-seasons-v45");

    // Season wheel
    html += '<div' + _style('display:flex;gap:8px;margin-bottom:16px') + '>';
    seasons.forEach(function(s) {
      var active = s.id === current.id;
      var bg = active ? 'linear-gradient(135deg,#166534,#052e16)' : '#1e293b';
      var border = active ? '2px solid #22c55e' : '1px solid #1e293b';
      html += '<div' + _style('flex:1;background:'+bg+';border:'+border+';border-radius:10px;padding:10px;text-align:center') + '>'
        + '<div' + _style('font-size:24px') + '>' + s.icon + '</div>'
        + '<div' + _style('font-size:12px;color:'+(active?'#4ade80':'#64748b')+';font-weight:700') + '>' + s.name + '</div>'
        + (active ? '<div' + _style('font-size:9px;color:#22c55e;margin-top:3px') + '>Đang diễn ra</div>' : '')
        + '</div>';
    });
    html += '</div>';

    // Season progress
    html += '<div' + _style('background:#0f172a;border-radius:8px;padding:10px;margin-bottom:14px') + '>'
      + '<div' + _style('display:flex;justify-content:space-between;margin-bottom:4px') + '>'
      + '<span' + _style('color:#94a3b8;font-size:11px') + '>Tiến độ mùa ' + current.name + '</span>'
      + '<span' + _style('color:#22c55e;font-size:11px') + '>' + seasonTick + '/25 ticks</span>'
      + '</div>'
      + '<div' + _style('background:#1e293b;border-radius:4px;height:8px') + '>'
      + '<div' + _style('background:#22c55e;border-radius:4px;height:8px;width:'+Math.min(100,(seasonTick/25)*100).toFixed(0)+'%') + '></div>'
      + '</div></div>';

    // Effect table
    html += '<div' + _style('color:#94a3b8;font-size:12px;font-weight:700;margin-bottom:8px') + '>📊 Ảnh Hưởng Mùa Vụ</div>';
    html += '<div' + _style('background:#0f172a;border-radius:8px;overflow:hidden') + '>';
    var headers = ["Mùa","👥 Dân Số","🌾 Nông Nghiệp","💰 Kinh Tế","⚔️ Chiến Tranh"];
    html += '<div' + _style('display:grid;grid-template-columns:80px repeat(4,1fr);background:#1e293b;padding:6px') + '>';
    headers.forEach(function(h) { html += '<div' + _style('font-size:10px;color:#64748b;text-align:center') + '>' + h + '</div>'; });
    html += '</div>';
    seasons.forEach(function(s) {
      var isActive = s.id === current.id;
      var bg = isActive ? '#0f2010' : 'transparent';
      html += '<div' + _style('display:grid;grid-template-columns:80px repeat(4,1fr);padding:6px;background:'+bg+';border-top:1px solid #1e293b') + '>';
      html += '<div' + _style('font-size:12px;color:#94a3b8') + '>' + s.icon + ' ' + s.name + '</div>';
      [s.popBonus, s.agriBonus, s.econBonus, s.warBonus].forEach(function(v) {
        var col = v >= 1.1 ? "#22c55e" : v <= 0.89 ? "#ef4444" : "#94a3b8";
        html += '<div' + _style('font-size:11px;color:'+col+';text-align:center;font-weight:700') + '>' + (v >= 1 ? '+' : '') + ((v-1)*100).toFixed(0) + '%</div>';
      });
      html += '</div>';
    });
    html += '</div>';
    html += '</div>';
    _panel("panel-eco-seasons-v45", html);
  }

  // ═══ PANEL: CREATURES ═══
  function _renderCreatures() {
    var creatures = (typeof window.ecoGetAliveCreatures === "function") ? window.ecoGetAliveCreatures() : [];
    var extinctions = (window.ecoCreatureData && window.ecoCreatureData.extinctions) || [];
    var foodChain = (typeof window.ecoGetFoodChain === "function") ? window.ecoGetFoodChain() : [];
    var stats = (typeof window.ecoGetCreatureStats === "function") ? window.ecoGetCreatureStats() : { alive:0, extinct:0, endangered:0, totalPop:0 };

    var html = '<div' + _style('padding:16px') + '>';
    html += _subNav("eco-creatures-v45");

    // Summary
    html += '<div' + _style('display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px') + '>';
    [
      { label:"Sống Sót", val: stats.alive,      color:"#22c55e" },
      { label:"Tuyệt Chủng",val:stats.extinct,   color:"#ef4444" },
      { label:"Nguy Cấp",  val: stats.endangered, color:"#f59e0b" },
      { label:"Tổng Số",   val: stats.totalPop,  color:"#94a3b8" },
    ].forEach(function(s) {
      html += '<div' + _style('background:#1e293b;border-radius:8px;padding:8px;text-align:center') + '>'
        + '<div' + _style('font-size:16px;color:'+s.color+';font-weight:700') + '>' + s.val + '</div>'
        + '<div' + _style('font-size:10px;color:#64748b') + '>' + s.label + '</div>'
        + '</div>';
    });
    html += '</div>';

    // Creature grid
    html += '<div' + _style('color:#94a3b8;font-size:12px;font-weight:700;margin-bottom:8px') + '>🦎 Danh Sách Sinh Vật</div>';
    html += '<div' + _style('display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:14px;max-height:240px;overflow-y:auto') + '>';
    creatures.slice(0,12).forEach(function(c) {
      var riskColor = c.extinctionRisk > 0.3 ? "#ef4444" : c.extinctionRisk > 0.1 ? "#f59e0b" : "#22c55e";
      var popPct = Math.min(100, (c.population / (c.maxPop || 500)) * 100);
      html += '<div' + _style('background:#1e293b;border-radius:8px;padding:8px') + '>'
        + '<div' + _style('display:flex;align-items:center;gap:6px;margin-bottom:4px') + '>'
        + '<span' + _style('font-size:16px') + '>' + c.icon + '</span>'
        + '<span' + _style('font-size:11px;color:#94a3b8;font-weight:600') + '>' + c.name + '</span>'
        + '</div>'
        + '<div' + _style('background:#0f172a;border-radius:3px;height:5px;margin-bottom:3px') + '>'
        + '<div' + _style('background:'+riskColor+';height:5px;border-radius:3px;width:'+popPct.toFixed(0)+'%') + '></div>'
        + '</div>'
        + '<div' + _style('font-size:10px;color:#64748b') + '>' + c.population + ' cá thể'
        + (c.extinctionRisk > 0.1 ? ' <span style="color:'+riskColor+'">⚠️</span>' : '') + '</div>'
        + '</div>';
    });
    html += '</div>';

    // Food chain
    if (foodChain.length > 0) {
      html += '<div' + _style('color:#94a3b8;font-size:12px;font-weight:700;margin-bottom:6px') + '>🔗 Chuỗi Thức Ăn</div>';
      html += '<div' + _style('background:#0f172a;border-radius:8px;padding:10px') + '>';
      foodChain.slice(0,6).forEach(function(link) {
        html += '<div' + _style('font-size:11px;color:#64748b;padding:3px 0;border-bottom:1px solid #1e293b') + '>'
          + link.predIcon + ' ' + link.predName + ' → 🍖 → ' + link.preyIcon + ' ' + link.preyName
          + '</div>';
      });
      html += '</div>';
    }

    html += '</div>';
    _panel("panel-eco-creatures-v45", html);
  }

  // ═══ PANEL: RESOURCES ═══
  function _renderResources() {
    var types   = (typeof window.ecoGetResourceTypes === "function") ? window.ecoGetResourceTypes() : [];
    var res     = (typeof window.ecoGetResources     === "function") ? window.ecoGetResources()     : {};
    var climate = (typeof window.ecoGetCurrentClimate === "function") ? window.ecoGetCurrentClimate() : { name:"Ôn Đới" };
    var routes  = (window.ecoResourceData && window.ecoResourceData.tradeRoutes) || [];

    var html = '<div' + _style('padding:16px') + '>';
    html += _subNav("eco-resources-v45");

    html += '<div' + _style('font-size:11px;color:#64748b;margin-bottom:12px') + '>Khí hậu ' + climate.icon + ' ' + climate.name + ' ảnh hưởng đến tốc độ tái sinh tài nguyên</div>';

    // Resource bars
    types.forEach(function(rt) {
      var r = res[rt.id];
      if (!r) return;
      var pct = Math.min(100, (r.current / r.max) * 100);
      var barColor = r.depleted ? "#ef4444" : pct < 20 ? "#f59e0b" : rt.color;
      html += '<div' + _style('background:#1e293b;border-radius:8px;padding:10px;margin-bottom:8px') + '>'
        + '<div' + _style('display:flex;justify-content:space-between;align-items:center;margin-bottom:6px') + '>'
        + '<div' + _style('display:flex;align-items:center;gap:6px') + '>'
        + '<span' + _style('font-size:16px') + '>' + rt.icon + '</span>'
        + '<span' + _style('font-size:12px;color:#94a3b8;font-weight:600') + '>' + rt.name + '</span>'
        + (r.depleted ? '<span' + _style('font-size:10px;color:#ef4444') + '>CẠNG KIỆT</span>' : '')
        + '</div>'
        + '<div' + _style('font-size:11px;color:'+barColor) + '>' + Math.floor(r.current) + ' / ' + r.max + '</div>'
        + '</div>'
        + '<div' + _style('background:#0f172a;border-radius:4px;height:8px') + '>'
        + '<div' + _style('background:'+barColor+';border-radius:4px;height:8px;width:'+pct.toFixed(0)+'%;transition:width 0.3s') + '></div>'
        + '</div>'
        + '<div' + _style('font-size:10px;color:#475569;margin-top:4px') + '>Tái sinh: +' + r.regen.toFixed(2) + '/tick · Đã khai thác: ' + Math.floor(r.extracted) + '</div>'
        + '<div' + _style('margin-top:6px') + '>'
        + _btn("if(typeof ecoExtractResource==='function'){ecoExtractResource('"+rt.id+"',10);if(typeof ecoRenderPanel==='function')ecoRenderPanel('eco-resources-v45')}", "#475569", "Khai Thác 10")
        + _btn("if(typeof ecoExtractResource==='function'){ecoExtractResource('"+rt.id+"',50);if(typeof ecoRenderPanel==='function')ecoRenderPanel('eco-resources-v45')}", "#374151", "Khai Thác 50")
        + '</div>'
        + '</div>';
    });

    // Trade routes
    if (routes.length > 0) {
      html += '<div' + _style('color:#94a3b8;font-size:12px;font-weight:700;margin:12px 0 6px') + '>🚢 Tuyến Thương Mại</div>';
      routes.slice(0,4).forEach(function(r) {
        html += '<div' + _style('background:#0f172a;border-radius:6px;padding:6px 10px;margin-bottom:4px;font-size:11px;color:#64748b;display:flex;justify-content:space-between') + '>'
          + '<span>' + r.resourceId + ' → ' + r.target + '</span>'
          + '<span>' + r.amount + '/ticks</span>'
          + '</div>';
      });
    }

    html += '</div>';
    _panel("panel-eco-resources-v45", html);
  }

  // ═══ PANEL: DISASTERS ═══
  function _renderDisasters() {
    var types   = (typeof window.ecoGetDisasterTypes   === "function") ? window.ecoGetDisasterTypes()   : [];
    var active  = (typeof window.ecoGetActiveDisasters === "function") ? window.ecoGetActiveDisasters() : [];
    var history = (typeof window.ecoGetDisasterHistory === "function") ? window.ecoGetDisasterHistory() : [];
    var stats   = (typeof window.ecoGetDisasterStats   === "function") ? window.ecoGetDisasterStats()   : { total:0, active:0 };

    var html = '<div' + _style('padding:16px') + '>';
    html += _subNav("eco-disasters-v45");

    // Stats
    html += '<div' + _style('display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px') + '>';
    [
      { label:"Đang Xảy Ra", val: active.length, color:"#ef4444" },
      { label:"Tổng Số",     val: stats.total,   color:"#f59e0b" },
      { label:"Loại Thiên Tai",val:"5 loại",     color:"#94a3b8" },
    ].forEach(function(s) {
      html += '<div' + _style('background:#1e293b;border-radius:8px;padding:8px;text-align:center') + '>'
        + '<div' + _style('font-size:18px;color:'+s.color+';font-weight:700') + '>' + s.val + '</div>'
        + '<div' + _style('font-size:10px;color:#64748b') + '>' + s.label + '</div>'
        + '</div>';
    });
    html += '</div>';

    // Active disasters
    if (active.length > 0) {
      html += '<div' + _style('color:#ef4444;font-size:12px;font-weight:700;margin-bottom:6px') + '>🚨 Đang Diễn Ra</div>';
      active.forEach(function(d) {
        html += '<div' + _style('background:#1e293b;border:1px solid #ef444444;border-radius:8px;padding:10px;margin-bottom:6px') + '>'
          + '<div' + _style('display:flex;justify-content:space-between;align-items:center') + '>'
          + '<span' + _style('color:#ef4444;font-weight:700') + '>' + d.icon + ' ' + d.name + '</span>'
          + '<span' + _style('background:#ef444422;color:#ef4444;padding:2px 8px;border-radius:4px;font-size:11px') + '>' + d.severity + '</span>'
          + '</div>'
          + '<div' + _style('font-size:10px;color:#64748b;margin-top:4px') + '>Còn lại: ' + d.ticksLeft + ' ticks · Năm ' + d.year + '</div>'
          + '</div>';
      });
    }

    // Trigger panel
    html += '<div' + _style('color:#94a3b8;font-size:12px;font-weight:700;margin-bottom:8px') + '>⚡ Kích Hoạt Thủ Công</div>';
    html += '<div' + _style('display:grid;grid-template-columns:repeat(1,1fr);gap:6px;margin-bottom:14px') + '>';
    types.forEach(function(dt) {
      html += '<div' + _style('background:#1e293b;border-radius:8px;padding:8px;display:flex;justify-content:space-between;align-items:center') + '>'
        + '<div>'
        + '<span' + _style('font-size:14px') + '>' + dt.icon + '</span>'
        + '<span' + _style('font-size:12px;color:#94a3b8;margin-left:6px') + '>' + dt.name + '</span>'
        + '<div' + _style('font-size:10px;color:#475569;margin-top:2px') + '>' + dt.desc + '</div>'
        + '</div>'
        + '<div>'
        + _btn("if(typeof ecoTriggerDisaster==='function'){ecoTriggerDisaster('"+dt.id+"',1);if(typeof ecoRenderPanel==='function')ecoRenderPanel('eco-disasters-v45')}", dt.color||"#f59e0b", "Kích Hoạt")
        + '</div>'
        + '</div>';
    });
    html += '</div>';

    // History
    if (history.length > 0) {
      html += '<div' + _style('color:#94a3b8;font-size:12px;font-weight:700;margin-bottom:6px') + '>📜 Lịch Sử</div>';
      html += '<div' + _style('max-height:150px;overflow-y:auto') + '>';
      history.slice(0,10).forEach(function(h) {
        html += '<div' + _style('font-size:11px;color:#64748b;padding:4px 6px;border-bottom:1px solid #1e293b;display:flex;justify-content:space-between') + '>'
          + '<span>' + h.icon + ' ' + h.name + ' [' + h.severity + ']</span>'
          + '<span>Năm ' + h.year + '</span>'
          + '</div>';
      });
      html += '</div>';
    }

    html += '</div>';
    _panel("panel-eco-disasters-v45", html);
  }

  // ═══ PUBLIC API ═══
  window.ecoRenderPanel = function(panelId) {
    _showPanel(panelId || "eco-overview-v45");
    switch(panelId) {
      case "eco-climate-v45":   _renderClimate();   break;
      case "eco-seasons-v45":   _renderSeasons();   break;
      case "eco-creatures-v45": _renderCreatures(); break;
      case "eco-resources-v45": _renderResources(); break;
      case "eco-disasters-v45": _renderDisasters(); break;
      default:                  _renderOverview();  break;
    }
  };

  // ═══ HUB WIDGET (for mvHubRenderPanel) ═══
  window.ecoHubRenderPanel = function() {
    var climate  = (typeof window.ecoGetCurrentClimate  === "function") ? window.ecoGetCurrentClimate()  : { name:"Ôn Đới", icon:"🌿", color:"#22c55e" };
    var season   = (typeof window.ecoGetCurrentSeason   === "function") ? window.ecoGetCurrentSeason()   : { name:"Xuân", icon:"🌸" };
    var cStats   = (typeof window.ecoGetCreatureStats   === "function") ? window.ecoGetCreatureStats()   : { alive:0, extinct:0 };
    var rStats   = (typeof window.ecoGetResourceStats   === "function") ? window.ecoGetResourceStats()   : { thriving:0 };
    var dStats   = (typeof window.ecoGetDisasterStats   === "function") ? window.ecoGetDisasterStats()   : { total:0, active:0 };
    var effects  = (typeof window.ecoGetEffects         === "function") ? window.ecoGetEffects()         : {};

    var tabs = [
      { id:"eco-overview-v45",   label:"🌿 Tổng Quan"   },
      { id:"eco-climate-v45",    label:"🌤️ Khí Hậu"     },
      { id:"eco-seasons-v45",    label:"🌸 Mùa"         },
      { id:"eco-creatures-v45",  label:"🦎 Sinh Vật"    },
      { id:"eco-resources-v45",  label:"⛏️ Tài Nguyên"  },
      { id:"eco-disasters-v45",  label:"🌪️ Thiên Tai"   },
    ];
    var btnRow = '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px">';
    tabs.forEach(function(t) {
      btnRow += '<button onclick="if(typeof ecoRenderPanel===\'function\')ecoRenderPanel(\'' + t.id + '\')" style="background:#0f172a;border:1px solid #166534;color:#4ade80;padding:3px 8px;border-radius:5px;cursor:pointer;font-size:10px">' + t.label + '</button>';
    });
    btnRow += '</div>';

    return '<div style="background:#0f172a;border:1px solid #166534;border-radius:8px;padding:12px;margin-top:8px">'
      + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:8px">'
      + '<div style="text-align:center"><div style="font-size:20px">' + climate.icon + '</div><div style="font-size:10px;color:' + (climate.color||"#22c55e") + '">' + climate.name + '</div></div>'
      + '<div style="text-align:center"><div style="font-size:20px">' + season.icon + '</div><div style="font-size:10px;color:#f59e0b">Mùa ' + season.name + '</div></div>'
      + '<div style="text-align:center"><div style="font-size:20px">🦎</div><div style="font-size:10px;color:#34d399">' + cStats.alive + ' sinh vật</div></div>'
      + '<div style="text-align:center"><div style="font-size:20px">⛏️</div><div style="font-size:10px;color:#94a3b8">' + rStats.thriving + '/5 dồi dào</div></div>'
      + '<div style="text-align:center"><div style="font-size:20px">🌪️</div><div style="font-size:10px;color:#ef4444">' + (dStats.active||0) + ' thiên tai</div></div>'
      + '<div style="text-align:center"><div style="font-size:20px">🌾</div><div style="font-size:10px;color:#22c55e">Nông nghiệp ' + (effects.agriBonus >= 1 ? '+' : '') + (effects.agriBonus ? ((effects.agriBonus-1)*100).toFixed(0) : '0') + '%</div></div>'
      + '</div>'
      + btnRow
      + '</div>';
  };

  function init() {
    console.log("[EcoRegistry V45] 🌿 Hệ Sinh Thái UI sẵn sàng — 6 panels.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 4300); });
  } else {
    setTimeout(init, 4300);
  }
})();
