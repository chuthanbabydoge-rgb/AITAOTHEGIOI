(function() {
  "use strict";

  var _heroAnimId = null;

  // ── SEEDED RNG (deterministic galaxy, no flicker on re-render) ──────
  function makeRand(seed) {
    var s = seed >>> 0;
    return function() {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  // ── DATA ─────────────────────────────────────────────────────────────
  function getStory() {
    var world = window.world     || {};
    var npcs  = window.npcs      || [];
    var ctrs  = window.countries || [];
    var yr    = window.year      || 1;
    var wars  = window.warsActive|| [];

    var name = world.name || (ctrs.length > 0 && ctrs[0] && ctrs[0].name) || null;
    var pop  = npcs.length;
    var civs = ctrs.filter(function(c){ return c && c.population > 0; }).length;

    var stage = 'void';
    if      (pop === 0 && civs === 0)  stage = 'void';
    else if (pop < 10  && civs < 2)    stage = 'dawn';
    else if (pop < 100 && civs < 5)    stage = 'rise';
    else if (wars.length > 3)          stage = 'conflict';
    else if (civs >= 5 && pop >= 100)  stage = 'flourish';
    else                               stage = 'growing';

    var stageIdx = { void:0, dawn:1, rise:2, conflict:3, growing:4, flourish:5 };

    var stageNames  = ['Khai Sinh','Hình Thành','Sự Sống','Văn Minh','Kỷ Nguyên','Vũ Cực'];
    var stageIcons  = ['✦','🌅','🌱','⚔️','🔮','🌟'];
    var stageColors = ['#64748b','#f59e0b','#10b981','#ef4444','#7c3aed','#facc15'];
    var stageDesc   = ['Hư không, chờ khai sinh','Sinh linh đầu tiên xuất hiện','Sự sống bắt đầu nảy mầm','Văn minh đối đầu nhau','Thế giới phồn thịnh','Đỉnh tột cùng của tiến hóa'];

    var labels = {
      void:'✦ Hư Không · Chờ Khai Sinh', dawn:'🌅 Bình Minh · Sinh Linh Đầu Tiên',
      rise:'🌱 Thức Tỉnh · Văn Minh Hình Thành', conflict:'⚔️ Loạn Thế · Các Thế Lực Đối Đầu',
      growing:'🔮 Tiến Hóa · Thế Giới Mở Rộng', flourish:'🌟 Thịnh Vượng · Vũ Trụ Phồn Thịnh'
    };
    var narrs = {
      void:'Một vũ trụ đang chờ được khai sinh.', dawn:'Những sinh linh đầu tiên bước vào thế giới.',
      rise:'Văn minh đang nảy mầm từ những vùng đất hoang.', conflict:'Các thế lực đối đầu nhau quyết liệt.',
      growing:'Thế giới đang lớn dần theo từng năm.', flourish:'Vũ trụ đạt đỉnh cao thịnh vượng.'
    };
    var narrs2 = {
      void:'Hãy tạo thế giới để bắt đầu hành trình.', dawn:'Mọi thứ đang bắt đầu.',
      rise:'Lịch sử đang được viết.', conflict:'Vận mệnh thế giới chưa ngã ngũ.',
      growing:'Mỗi tick là một kỷ nguyên mới.', flourish:'Văn minh trải khắp mọi miền.'
    };
    var complexity = { void:'Sơ khai', dawn:'Đơn giản', rise:'Trung bình', conflict:'Phức tạp', growing:'Cao', flourish:'Tối thượng' };
    var evoPotential = { void:'Vô hạn', dawn:'Rất cao', rise:'Cao', conflict:'Biến động', growing:'Đang tăng', flourish:'Cực kỳ cao' };
    var sColor = { void:'#64748b', dawn:'#f59e0b', rise:'#10b981', conflict:'#ef4444', growing:'#7c3aed', flourish:'#facc15' };

    var maturity = 0;
    try { var ms = localStorage.getItem('cgv6_universe_maturity_v60'); if(ms){var md=JSON.parse(ms);maturity=md.score||0;} } catch(e){}

    var health = 40;
    if (name)          health += 15;
    if (pop > 0)       health += 15;
    if (civs > 0)      health += 15;
    if (!wars.length)  health += 15;
    health = Math.min(100, health);

    var si = stageIdx[stage];
    return {
      name, year: yr, pop, civs, wars: wars.length, stage, stageIdx: si,
      label: labels[stage], narr: narrs[stage], narr2: narrs2[stage],
      stageName: stageNames[si], stageColor: sColor[stage],
      stageNames, stageIcons, stageColors, stageDesc,
      complexity: complexity[stage], evoPotential: evoPotential[stage],
      maturity, health
    };
  }

  function getExtra() {
    var evCount = 0, knowledge = 0;
    var keys = ['cgv6_historical_timeline','cgv6_world_events_v25','cgv6_world_event_v25'];
    for (var k = 0; k < keys.length; k++) {
      try {
        var d = localStorage.getItem(keys[k]);
        if (d) { var p = JSON.parse(d); var a = p.events||p.history||[]; if (a.length) { evCount = a.length; break; } }
      } catch(e) {}
    }
    try {
      var td = localStorage.getItem('cgv6_tech_engine');
      if (td) { var tp = JSON.parse(td); knowledge = Object.keys(tp.unlocked||tp.discovered||{}).length; }
    } catch(e) {}
    return { evCount, knowledge };
  }

  function getActivity() {
    var events = [];
    var keys = ['cgv6_historical_timeline','cgv6_world_events_v25','cgv6_world_event_v25'];
    for (var k = 0; k < keys.length; k++) {
      try {
        var d = localStorage.getItem(keys[k]);
        if (d) { var p = JSON.parse(d); var a = p.events||p.history||[]; if(a.length){events=a;break;} }
      } catch(e) {}
    }
    return events.slice(-4).reverse();
  }

  // ── STYLES ───────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('puos-mv-style')) return;
    var s = document.createElement('style');
    s.id = 'puos-mv-style';
    s.textContent = [
      '@keyframes mv-badge-pulse{0%,100%{box-shadow:0 0 0 0 currentColor}60%{box-shadow:0 0 0 8px transparent}}',
      '@keyframes mv-twinkle{0%,100%{opacity:.04}50%{opacity:.6}}',
      '@keyframes mv-stage-glow{0%,100%{opacity:.7}50%{opacity:1}}',
      '@keyframes mv-float-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}',
      '@keyframes mv-pulse-dot{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}',
      '.mv-fade{animation:mv-float-in .4s ease both}',
      '.mv-badge-pulse{animation:mv-badge-pulse 2.8s ease-in-out infinite}',
      '.mv-stat-card{background:#07111e;border:1px solid #0d1e30;border-radius:14px;flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;padding:22px 10px 18px;gap:10px;transition:border-color .2s}',
      '.mv-stat-card:hover{border-color:#1e3a5f}',
      '.mv-stat-icon{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:21px;flex-shrink:0}',
      '.mv-overview-row{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #0b1928}',
      '.mv-overview-row:last-child{border-bottom:none;padding-bottom:0}',
      '.mv-overview-lbl{font-size:11px;color:#2d4a6a;display:flex;align-items:center;gap:6px}',
      '.mv-overview-val{font-size:11px;color:#94a3b8;font-weight:500}',
      '.mv-tl-node{display:flex;flex-direction:column;align-items:center;gap:7px;flex:1;min-width:0;position:relative}',
      '.mv-tl-dot{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;transition:all .3s}',
      '.mv-act-item{display:flex;gap:14px;padding:13px 0}',
      '.mv-act-item+.mv-act-item{border-top:1px solid #080e18}',
      '.mv-quick-btn{width:100%;display:flex;align-items:center;gap:14px;padding:16px 18px;border-radius:12px;background:#07111e;border:1px solid #0d1e30;cursor:pointer;text-align:left;transition:all .18s;font-family:\'Noto Serif SC\',serif;margin-bottom:10px}',
      '.mv-quick-btn:hover{background:#0d1e30;border-color:#1e3a5f}',
      '.mv-quick-btn:last-child{margin-bottom:0}'
    ].join('\n');
    document.head.appendChild(s);
  }

  // ── HERO GALAXY CANVAS ───────────────────────────────────────────────
  function startHeroGalaxy() {
    if (_heroAnimId) { cancelAnimationFrame(_heroAnimId); _heroAnimId = null; }
    var canvas = document.getElementById('puos-hero-galaxy');
    if (!canvas || !canvas.getContext) return;

    var pw = (canvas.parentElement || {}).offsetWidth || 900;
    canvas.width  = pw;
    canvas.height = 300;

    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var cx = W * 0.37, cy = H * 0.51;
    var t = 0;
    var rand = makeRand(31337);

    // — Background stars —
    var bgStars = [];
    for (var i = 0; i < 220; i++) {
      bgStars.push({ x:rand()*W, y:rand()*H, r:0.3+rand()*1.1, b:0.06+rand()*0.38, ph:rand()*6.283 });
    }

    // — Bright foreground stars —
    var fgStars = [];
    for (var fi = 0; fi < 30; fi++) {
      fgStars.push({ x:rand()*W, y:rand()*H, r:1.1+rand()*2.4, b:0.55+rand()*0.45, ph:rand()*6.283 });
    }

    // — Spiral arm particles (2 arms, 280 particles each) —
    var armP = [];
    for (var arm = 0; arm < 2; arm++) {
      for (var j = 0; j < 280; j++) {
        var frac  = j / 280;
        var theta = frac * (Math.PI * 4.2) + arm * Math.PI;
        var r     = 7 + frac * (H * 0.43);
        var bx    = cx + r * Math.cos(theta);
        var by    = cy + r * Math.sin(theta) * 0.68;
        var sp    = (3 + frac * 26) * (0.3 + rand() * 0.8);
        var ang   = rand() * 6.283;
        armP.push({
          x: bx + Math.cos(ang) * sp,
          y: by + Math.sin(ang) * sp,
          r: 0.4 + rand() * 1.8,
          b: 0.15 + rand() * 0.72,
          ph: rand() * 6.283,
          h: 242 + arm * 38 + rand() * 55 - 27
        });
      }
    }

    function draw() {
      t += 0.0032;
      ctx.clearRect(0, 0, W, H);

      // Space background
      var bg = ctx.createLinearGradient(0, 0, W * 0.6, H);
      bg.addColorStop(0,   '#05091a');
      bg.addColorStop(0.5, '#040810');
      bg.addColorStop(1,   '#020507');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      // Nebula washes
      var nebs = [
        { x:cx+15, y:cy-12, r:H*0.58, rc:'90,35,190',  a:0.08+0.022*Math.sin(t*0.5)   },
        { x:cx-25, y:cy+18, r:H*0.44, rc:'28,78,195',  a:0.055+0.015*Math.sin(t*0.7+1) },
        { x:cx+65, y:cy+48, r:H*0.36, rc:'155,35,155', a:0.04+0.012*Math.sin(t*0.4+2)  }
      ];
      nebs.forEach(function(n) {
        var g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        g.addColorStop(0,   'rgba('+n.rc+','+n.a.toFixed(3)+')');
        g.addColorStop(0.5, 'rgba('+n.rc+','+(n.a*0.35).toFixed(3)+')');
        g.addColorStop(1,   'rgba('+n.rc+',0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      });

      // Background stars
      bgStars.forEach(function(st) {
        var a = st.b * (0.45 + 0.55 * Math.sin(t * 0.5 + st.ph));
        ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 6.283);
        ctx.fillStyle = 'rgba(205,215,255,' + a.toFixed(3) + ')';
        ctx.fill();
      });

      // Arm particles
      armP.forEach(function(p) {
        var a = p.b * (0.55 + 0.45 * Math.sin(t * 0.85 + p.ph));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = 'hsla('+p.h+',62%,73%,'+a.toFixed(2)+')';
        ctx.fill();
      });

      // Core glow — 3 layers
      var pulse = H * 0.17 + H * 0.05 * Math.sin(t * 1.25);
      [
        { sz: pulse * 2.5, a0: 'rgba(110,50,210,0.16)', a1: 'rgba(110,50,210,0)'   },
        { sz: pulse * 1.5, a0: 'rgba(170,110,255,0.32)', a1: 'rgba(100,45,195,0)'  },
        { sz: pulse,       a0: 'rgba(235,205,255,0.72)', a1: 'rgba(150,70,235,0.1)'}
      ].forEach(function(l) {
        var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, l.sz);
        g.addColorStop(0, l.a0); g.addColorStop(1, l.a1);
        ctx.beginPath(); ctx.arc(cx, cy, l.sz, 0, 6.283);
        ctx.fillStyle = g; ctx.fill();
      });

      // Hard white core
      ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, 6.283);
      ctx.fillStyle = '#fff'; ctx.fill();

      // Bright foreground stars + cross-flares
      fgStars.forEach(function(st) {
        var a = st.b * (0.65 + 0.35 * Math.sin(t * 0.58 + st.ph));
        ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 6.283);
        ctx.fillStyle = 'rgba(225,232,255,'+a.toFixed(2)+')';
        ctx.fill();
        if (st.r > 2.2) {
          var fl = a * 0.28;
          ctx.strokeStyle = 'rgba(225,232,255,'+fl.toFixed(2)+')';
          ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(st.x-7, st.y); ctx.lineTo(st.x+7, st.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(st.x, st.y-7); ctx.lineTo(st.x, st.y+7); ctx.stroke();
        }
      });

      // Right-side gradient fade for text readability
      var fade = ctx.createLinearGradient(W * 0.25, 0, W, 0);
      fade.addColorStop(0,    'rgba(5,9,26,0)');
      fade.addColorStop(0.52, 'rgba(5,9,26,0.72)');
      fade.addColorStop(1,    'rgba(5,9,26,0.96)');
      ctx.fillStyle = fade; ctx.fillRect(0, 0, W, H);

      _heroAnimId = requestAnimationFrame(draw);
    }
    draw();
  }

  // ── SECTION: HERO ─────────────────────────────────────────────────────
  function heroSection(s) {
    var title = s.name || 'Hư Không';
    var yrFmt = s.year.toLocaleString();
    var sc    = s.stageColor;

    // Overview card rows
    var health    = s.health;
    var healthCol = health >= 80 ? '#10b981' : health >= 50 ? '#f59e0b' : '#ef4444';
    var ovRows = [
      { icon:'📅', lbl:'Tuổi vũ trụ',       val:'Năm ' + yrFmt          },
      { icon:'🌀', lbl:'Giai đoạn',          val:s.stageName             },
      { icon:'⚗️', lbl:'Độ phức tạp',        val:'+ ' + s.complexity      },
      { icon:'🌱', lbl:'Tiềm năng tiến hóa', val:'+ ' + s.evoPotential   },
      { icon:'●',  lbl:'Trạng thái',         val:'Ổn định', col: healthCol }
    ];

    var ovHtml = '<div style="position:absolute;top:20px;right:28px;width:238px;'
      + 'background:rgba(5,10,22,0.82);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);'
      + 'border:1px solid #0d1e35;border-radius:14px;padding:17px 18px">';
    ovHtml += '<div style="font-size:9px;color:#7c3aed;letter-spacing:2.5px;margin-bottom:12px;opacity:.75">TỔNG QUAN VŨ TRỤ</div>';
    ovRows.forEach(function(r) {
      ovHtml += '<div class="mv-overview-row"><span class="mv-overview-lbl">'
        + '<span style="font-size:11px">' + r.icon + '</span>' + r.lbl
        + '</span><span class="mv-overview-val" style="color:' + (r.col || '#94a3b8') + '">' + r.val + '</span></div>';
    });
    ovHtml += '</div>';

    // Badge
    var badgeHtml = '<div class="mv-badge-pulse" style="display:inline-flex;align-items:center;gap:9px;'
      + 'padding:9px 18px;border-radius:99px;background:' + sc + '1a;border:1px solid ' + sc + '40;'
      + 'color:' + sc + '">'
      + '<span style="width:7px;height:7px;border-radius:50%;background:' + sc + ';box-shadow:0 0 7px ' + sc + ';animation:mv-pulse-dot 2.2s ease-in-out infinite"></span>'
      + '<span style="font-size:11px;letter-spacing:.4px">' + s.label + '</span>'
      + '</div>';

    return '<div style="position:relative;overflow:hidden;height:300px;border-bottom:1px solid #080f1c">'
      + '<canvas id="puos-hero-galaxy" style="position:absolute;inset:0;width:100%;height:100%"></canvas>'
      + ovHtml
      + '<div style="position:absolute;top:0;bottom:0;right:282px;left:38%;display:flex;flex-direction:column;justify-content:center;min-width:0">'
        + '<div style="font-size:10px;color:#7c3aed;letter-spacing:3px;margin-bottom:16px;opacity:.6">VŨ TRỤ CỦA TÔI</div>'
        + '<h1 style="font-size:44px;font-weight:200;color:#e2e8f0;margin:0 0 10px;letter-spacing:-.5px;line-height:1.02;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + title + '</h1>'
        + '<div style="font-size:12px;color:#2d4a6a;margin-bottom:20px;letter-spacing:.3px">Năm ' + yrFmt + ' · Kỷ nguyên ' + s.stageName + '</div>'
        + '<div style="font-size:15px;color:#7d8fa8;font-style:italic;line-height:1.75;margin-bottom:5px">' + s.narr + '</div>'
        + '<div style="font-size:12px;color:#1e3a5f;line-height:1.6;margin-bottom:24px">' + s.narr2 + '</div>'
        + badgeHtml
      + '</div>'
      + '</div>';
  }

  // ── SECTION: 6 STAT CARDS ────────────────────────────────────────────
  function statsRow(s, ex) {
    function fmt(n) { return n > 9999 ? (n/1000).toFixed(0)+'k' : n > 999 ? (n/1000).toFixed(1)+'k' : String(n); }

    var matPct = s.maturity > 0 ? s.maturity + '%' : '0%';
    var peaceVal = s.wars === 0 ? '∞' : String(s.wars);
    var peaceCol = s.wars === 0 ? '#10b981' : '#ef4444';

    var cards = [
      { icon:'👥', color:'#a78bfa', val: fmt(s.pop),    lbl:'SINH LINH',  sub: s.pop===0?'Chưa xuất hiện':'sinh linh hiện có' },
      { icon:'🏛',  color:'#10b981', val: String(s.civs), lbl:'VĂN MINH',  sub: s.civs===0?'Chưa hình thành':'nền văn minh' },
      { icon:'☮',  color:peaceCol,  val: peaceVal,       lbl:'HÒA BÌNH',  sub: s.wars===0?'Thuần khiết':s.wars+' chiến tranh' },
      { icon:'📚', color:'#3b82f6', val: String(ex.knowledge), lbl:'TRI THỨC', sub: ex.knowledge===0?'Chưa khai mở':'công nghệ' },
      { icon:'⚡', color:'#f59e0b', val: String(ex.evCount),   lbl:'SỰ KIỆN',  sub: ex.evCount===0?'Chưa xảy ra':'sự kiện lịch sử' },
      { icon:'🔮', color:'#7c3aed', val: matPct,          lbl:'TIẾN HÓA',  sub: s.maturity===0?'Chưa tiến hóa':'tiến hóa đạt được' }
    ];

    var html = '<div style="display:flex;gap:10px;padding:20px 28px;border-bottom:1px solid #080f1c;background:#040911">';
    cards.forEach(function(c) {
      html += '<div class="mv-stat-card">'
        + '<div class="mv-stat-icon" style="background:' + c.color + '18;border:1px solid ' + c.color + '30">'
          + '<span>' + c.icon + '</span>'
        + '</div>'
        + '<div style="font-size:26px;font-weight:300;color:#dde4f0;line-height:1;letter-spacing:-.5px">' + c.val + '</div>'
        + '<div style="font-size:9px;color:#1e3a5f;letter-spacing:2.2px;text-align:center;margin-top:2px">' + c.lbl + '</div>'
        + '<div style="font-size:10px;color:#0f2035;text-align:center;line-height:1.35">' + c.sub + '</div>'
        + '</div>';
    });
    html += '</div>';
    return html;
  }

  // ── SECTION: STAGE TIMELINE ──────────────────────────────────────────
  function stageTimeline(s) {
    var si = s.stageIdx;
    var NAMES  = s.stageNames;
    var ICONS  = s.stageIcons;
    var COLORS = s.stageColors;
    var DESCS  = s.stageDesc;

    var html = '<div style="padding:26px 28px 24px;border-bottom:1px solid #080f1c;background:#050b15">';
    html += '<div style="font-size:9px;color:#1e3a5f;letter-spacing:2.5px;margin-bottom:20px">ĐỒNG THỜI GIAN VŨ TRỤ</div>';
    html += '<div style="position:relative">';

    // Connector line
    html += '<div style="position:absolute;top:15px;left:2.5%;right:2.5%;height:1px;'
      + 'background:linear-gradient(to right,#7c3aed55 ' + Math.round((si/5)*100) + '%,#0d1e30 ' + Math.round((si/5)*100) + '%)">'
      + '</div>';

    html += '<div style="display:flex;justify-content:space-between;position:relative">';
    for (var i = 0; i < 6; i++) {
      var active  = i <= si;
      var current = i === si;
      var locked  = i > si;
      var col   = active ? COLORS[i] : '#1e293b';
      var dotBg = current ? col : active ? col + '33' : '#0a1426';
      var dotBd = current ? col : active ? col + '55' : '#0d1e30';
      var nameCol = current ? col : active ? '#4a5568' : '#1e293b';
      var subCol  = current ? '#334155' : '#0f1c2d';

      html += '<div class="mv-tl-node">';
      // Dot
      html += '<div class="mv-tl-dot" style="background:' + dotBg + ';border:2px solid ' + dotBd + ';'
        + 'box-shadow:' + (current ? '0 0 16px ' + col + '66' : 'none') + ';'
        + (current ? 'animation:mv-stage-glow 2.5s ease-in-out infinite;' : '') + '">'
        + '<span style="font-size:13px;opacity:' + (locked?'0.3':'1') + '">' + ICONS[i] + '</span>'
        + '</div>';
      // Name
      html += '<div style="font-size:10px;color:' + nameCol + ';font-weight:' + (current?'600':'400') + ';'
        + 'text-align:center;white-space:nowrap;letter-spacing:.3px">' + NAMES[i] + '</div>';
      // Status
      html += '<div style="font-size:9px;color:' + subCol + ';text-align:center;max-width:70px;line-height:1.35">'
        + (current ? DESCS[i] : locked ? 'Chưa mở khóa' : DESCS[i])
        + '</div>';
      if (current) {
        html += '<div style="font-size:8px;color:' + col + ';opacity:.7;text-align:center;white-space:nowrap">Năm '+s.year.toLocaleString()+'</div>';
      }
      html += '</div>';
    }
    html += '</div></div></div>';
    return html;
  }

  // ── SECTION: BOTTOM (ACTIVITY + ACTIONS) ─────────────────────────────
  function bottomSection(s, feed) {
    // — Activity feed —
    function evIcon(ev) {
      var t = (ev.type||ev.category||'').toLowerCase();
      var txt = (ev.title||ev.content||'').toLowerCase();
      if (t.includes('war')||t.includes('battle')||txt.includes('chiến')) return { i:'⚔️', c:'#ef4444' };
      if (t.includes('civ')||t.includes('found')||txt.includes('văn minh')) return { i:'🏛', c:'#10b981' };
      if (t.includes('god')||t.includes('divine')||txt.includes('thần')) return { i:'✦', c:'#a78bfa' };
      if (t.includes('hero')||txt.includes('anh hùng')||txt.includes('legend')) return { i:'🌟', c:'#f59e0b' };
      if (t.includes('disaster')||txt.includes('thảm')) return { i:'💥', c:'#f97316' };
      return { i:'◈', c:'#7c3aed' };
    }
    function timeAgo(yr) {
      if (!yr || !s.year) return '';
      var diff = s.year - yr;
      if (diff <= 0) return 'Vừa xong';
      if (diff < 10)  return diff + ' năm trước';
      if (diff < 100) return Math.round(diff/10)*10 + ' năm trước';
      return (diff > 999 ? (diff/1000).toFixed(1)+'k' : diff) + ' năm trước';
    }

    var feedHtml = '<div style="flex:62;min-width:0">';
    feedHtml += '<div style="font-size:9px;color:#1e3a5f;letter-spacing:2.5px;margin-bottom:16px">HOẠT ĐỘNG GẦN ĐÂY</div>';

    if (feed.length === 0) {
      feedHtml += '<div style="padding:28px 0;text-align:center">'
        + '<div style="font-size:24px;opacity:.08;margin-bottom:14px">⭕</div>'
        + '<div style="font-size:12px;color:#0f1e30;font-style:italic;line-height:1.8">Chưa có hoạt động nào.<br>'
        + '<span style="font-size:11px;color:#0a1520">Vũ trụ đang chờ câu chuyện đầu tiên.</span></div>'
        + '</div>';
    } else {
      feed.forEach(function(ev, idx) {
        var cls  = evIcon(ev);
        var yr   = ev.year || '?';
        var yrF  = yr > 9999 ? (yr/1000).toFixed(0)+'k' : yr > 999 ? (yr/1000).toFixed(1)+'k' : yr;
        var ttl  = (ev.title || ev.content || '').substring(0, 60);
        var desc = (ev.description || ev.detail || '').substring(0, 50);
        var ago  = timeAgo(yr);
        feedHtml += '<div class="mv-act-item">'
          + '<div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;padding-top:1px">'
            + '<div style="width:9px;height:9px;border-radius:50%;background:' + cls.c + ';box-shadow:0 0 6px ' + cls.c + '55;flex-shrink:0"></div>'
            + (idx < feed.length-1 ? '<div style="width:1px;flex:1;min-height:14px;background:linear-gradient('+cls.c+'22,transparent);margin-top:5px"></div>' : '')
          + '</div>'
          + '<div style="flex:1;min-width:0">'
            + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">'
              + '<span style="font-size:13px">' + cls.i + '</span>'
              + '<span style="font-size:10px;color:#334155">Năm ' + yrF + '</span>'
              + (ago ? '<span style="font-size:9px;color:#0f1e2d;margin-left:auto;white-space:nowrap">' + ago + '</span>' : '')
            + '</div>'
            + '<div style="font-size:12px;color:#8896a8;line-height:1.55">' + ttl + '</div>'
            + (desc ? '<div style="font-size:10px;color:#1e3a5f;margin-top:3px;line-height:1.4">' + desc + '</div>' : '')
          + '</div>'
          + '</div>';
      });
    }
    feedHtml += '</div>';

    // — Quick actions —
    var acts = [
      { i:'✨', l:'Tạo Thế Giới Mới', s:'Bắt đầu thế giới mới', f:"puosGo('worlds')",       c:'#7c3aed' },
      { i:'🤖', l:'Hỏi Jarvis',        s:'Trợ lý AI của bạn',    f:"puosGo('jarvis')",       c:'#3b82f6' },
      { i:'🌌', l:'Universe Hub',       s:'Khám phá đa vũ trụ',   f:"puosGo('universe-hub')", c:'#8b5cf6' }
    ];
    var actHtml = '<div style="flex:38;min-width:180px">';
    actHtml += '<div style="font-size:9px;color:#1e3a5f;letter-spacing:2.5px;margin-bottom:16px">THAO TÁC NHANH</div>';
    acts.forEach(function(a) {
      actHtml += '<button class="mv-quick-btn" onclick="' + a.f + '"'
        + ' onmouseover="this.style.background=\'#0d1e30\';this.style.borderColor=\'#1e3a5f\'"'
        + ' onmouseout="this.style.background=\'#07111e\';this.style.borderColor=\'#0d1e30\'">'
        + '<div style="width:38px;height:38px;border-radius:10px;background:' + a.c + '1a;border:1px solid ' + a.c + '33;'
          + 'display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">' + a.i + '</div>'
        + '<div><div style="font-size:13px;color:#c8d4e0;font-weight:400;margin-bottom:3px">' + a.l + '</div>'
          + '<div style="font-size:10px;color:#1e3a5f">' + a.s + '</div></div>'
        + '</button>';
    });
    actHtml += '</div>';

    return '<div style="display:flex;gap:24px;padding:26px 28px 60px;align-items:flex-start">'
      + feedHtml + actHtml
      + '</div>';
  }

  // ── MAIN RENDER ───────────────────────────────────────────────────────
  window.puosRenderMyUniverse = function(container) {
    if (_heroAnimId) { cancelAnimationFrame(_heroAnimId); _heroAnimId = null; }
    injectStyles();

    var story = getStory();
    var extra = getExtra();
    var feed  = getActivity();

    container.innerHTML = '<div class="mv-fade">'
      + heroSection(story)
      + statsRow(story, extra)
      + stageTimeline(story)
      + bottomSection(story, feed)
      + '</div>';

    // Start hero galaxy after DOM paint
    setTimeout(function() { startHeroGalaxy(); }, 30);
  };

  console.log('[PUOS My Universe V90] 🪐 My Universe panel sẵn sàng.');
})();
