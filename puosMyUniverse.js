(function() {
  "use strict";

  var _animId = null;

  // ─────────────────────────────────────────────
  // DATA
  // ─────────────────────────────────────────────
  function getStory() {
    var world = window.world || {};
    var npcs  = window.npcs  || [];
    var ctrs  = window.countries || [];
    var yr    = window.year  || 1;
    var wars  = window.warsActive || [];

    var name = world.name || (ctrs.length > 0 && ctrs[0] && ctrs[0].name) || null;
    var pop  = npcs.length;
    var civs = ctrs.filter(function(c){ return c && c.population > 0; }).length;

    var stage = 'void';
    if (pop === 0 && civs === 0)      stage = 'void';
    else if (pop < 10 && civs < 2)    stage = 'dawn';
    else if (pop < 100 && civs < 5)   stage = 'rise';
    else if (wars.length > 3)         stage = 'conflict';
    else if (civs >= 5 && pop >= 100) stage = 'flourish';
    else                              stage = 'growing';

    var labels = {
      void:     '✦ Hư Không · Chờ Khai Sinh',
      dawn:     '🌅 Bình Minh · Những Sinh Linh Đầu Tiên',
      rise:     '🌱 Thức Tỉnh · Văn Minh Đang Hình Thành',
      conflict: '⚔️ Loạn Thế · Các Thế Lực Đối Đầu',
      flourish: '🌟 Thịnh Vượng · Vũ Trụ Phồn Thịnh',
      growing:  '🔮 Tiến Hóa · Thế Giới Đang Mở Rộng'
    };
    var narrs = {
      void:     ['Một vũ trụ đang chờ được khai sinh.', 'Hãy tạo thế giới để bắt đầu hành trình.'],
      dawn:     ['Những sinh linh đầu tiên bước vào thế giới.', 'Mọi thứ đang bắt đầu.'],
      rise:     ['Văn minh đang nảy mầm từ những vùng đất hoang.', 'Lịch sử đang được viết.'],
      conflict: ['Các thế lực đối đầu nhau quyết liệt.', 'Vận mệnh thế giới chưa ngã ngũ.'],
      flourish: ['Vũ trụ đạt đỉnh cao thịnh vượng.', 'Văn minh trải khắp mọi miền.'],
      growing:  ['Thế giới đang lớn dần theo từng năm.', 'Mỗi tick là một kỷ nguyên mới.']
    };

    return { name: name, year: yr, pop: pop, civs: civs,
             wars: wars.length, stage: stage,
             label: labels[stage], narr: narrs[stage] };
  }

  // ─────────────────────────────────────────────
  // STYLES (inject once)
  // ─────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('puos-luv-style')) return;
    var s = document.createElement('style');
    s.id = 'puos-luv-style';
    s.textContent =
      '@keyframes puos-twinkle{0%,100%{opacity:.06;transform:scale(1)}50%{opacity:.55;transform:scale(1.5)}}' +
      '@keyframes puos-badge-pulse{0%,100%{box-shadow:0 0 0 0 #7c3aed44}60%{box-shadow:0 0 0 7px #7c3aed00}}' +
      '.puos-star{position:absolute;border-radius:50%;background:#e2e8f0;pointer-events:none;' +
        'animation:puos-twinkle var(--d) ease-in-out infinite;animation-delay:var(--dl)}' +
      '.puos-badge-live{animation:puos-badge-pulse 2.8s ease-in-out infinite}' +
      '.puos-arc-bg{fill:none;stroke:#1e293b;stroke-width:5.5}' +
      '.puos-arc-val{fill:none;stroke-width:5.5;stroke-linecap:round}';
    document.head.appendChild(s);
  }

  // ─────────────────────────────────────────────
  // GALAXY CANVAS ANIMATION
  // ─────────────────────────────────────────────
  function startGalaxy(pop, civs) {
    if (_animId) { cancelAnimationFrame(_animId); _animId = null; }
    var canvas = document.getElementById('puos-galaxy');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var W = 200, H = 200, cx = 100, cy = 100, t = 0;

    var npc = Math.min(pop, 16);
    var civ = Math.min(civs, 8);
    var CIVC = ['#7c3aed','#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'];

    // Deterministic star field
    var stars = [];
    var seed = 7919;
    for (var si = 0; si < 44; si++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      var sx = (seed >>> 0) % W;
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      var sy = (seed >>> 0) % H;
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      var sb = 0.07 + (seed % 100) * 0.004;
      stars.push({ x: sx, y: sy, b: sb, ph: si * 0.41 });
    }

    function draw() {
      t += 0.006;
      ctx.clearRect(0, 0, W, H);

      // Stars
      for (var i = 0; i < stars.length; i++) {
        var st = stars[i];
        var a = st.b * (0.4 + 0.6 * Math.sin(t * 0.7 + st.ph));
        ctx.beginPath();
        ctx.arc(st.x, st.y, 0.75, 0, 6.283);
        ctx.fillStyle = 'rgba(226,232,240,' + a.toFixed(2) + ')';
        ctx.fill();
      }

      // Orbit rings
      var ORBITS = [46, 68, 90];
      for (var ri = 0; ri < 3; ri++) {
        var oa = 0.06 + 0.04 * Math.sin(t * 0.4 + ri * 1.2);
        ctx.beginPath();
        ctx.arc(cx, cy, ORBITS[ri], 0, 6.283);
        ctx.strokeStyle = 'rgba(124,58,237,' + oa.toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // NPC particles
      for (var ni = 0; ni < npc; ni++) {
        var orb = ORBITS[ni % 3];
        var spd = 0.38 + (ni % 3) * 0.14;
        var ang = (ni / Math.max(npc, 1)) * 6.283 + t * spd;
        var px = cx + Math.cos(ang) * orb;
        var py = cy + Math.sin(ang) * orb;
        var pa = 0.3 + 0.6 * Math.sin(t * 1.8 + ni * 0.8);
        // Trail
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang - 0.18) * orb, cy + Math.sin(ang - 0.18) * orb, 1, 0, 6.283);
        ctx.fillStyle = 'rgba(167,139,250,0.1)';
        ctx.fill();
        // Dot
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, 6.283);
        ctx.fillStyle = 'rgba(167,139,250,' + pa.toFixed(2) + ')';
        ctx.fill();
      }

      // Civ arcs (outer ring r=110)
      for (var ci2 = 0; ci2 < civ; ci2++) {
        var arcSpan = (6.283 / civ) * 0.65;
        var arcStart = (ci2 / civ) * 6.283 - 1.5708 + t * 0.09;
        ctx.beginPath();
        ctx.arc(cx, cy, 110, arcStart, arcStart + arcSpan);
        ctx.strokeStyle = CIVC[ci2 % 8] + '55';
        ctx.lineWidth = 3.5;
        ctx.stroke();
      }

      // Central glow
      var pulse = 16 + 5 * Math.sin(t * 1.3);
      var grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulse + 12);
      grd.addColorStop(0, 'rgba(210,195,255,0.95)');
      grd.addColorStop(0.3, 'rgba(124,58,237,0.55)');
      grd.addColorStop(0.7, 'rgba(124,58,237,0.10)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, pulse + 12, 0, 6.283);
      ctx.fillStyle = grd;
      ctx.fill();

      // Hard core
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, 6.283);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      _animId = requestAnimationFrame(draw);
    }
    draw();
  }

  // ─────────────────────────────────────────────
  // SECTION: HERO
  // ─────────────────────────────────────────────
  var STAR_DATA = [
    ['8%','5%','--d:3.1s;--dl:0s'],    ['17%','22%','--d:4.4s;--dl:.6s'],
    ['27%','4%','--d:2.7s;--dl:1.1s'], ['5%','41%','--d:5s;--dl:.3s'],
    ['34%','30%','--d:3.6s;--dl:.9s'], ['44%','13%','--d:4.1s;--dl:.5s'],
    ['51%','37%','--d:2.9s;--dl:1.3s'],['60%','7%','--d:5.4s;--dl:.2s'],
    ['69%','26%','--d:3.5s;--dl:.7s'], ['77%','14%','--d:4.7s;--dl:1.2s'],
    ['83%','39%','--d:3.3s;--dl:.4s'], ['89%','21%','--d:4.0s;--dl:.8s'],
    ['12%','54%','--d:2.8s;--dl:1.4s'],['23%','67%','--d:5.1s;--dl:0s'],
    ['39%','71%','--d:3.7s;--dl:.6s'], ['55%','59%','--d:4.2s;--dl:1.0s'],
    ['66%','77%','--d:2.6s;--dl:.3s'], ['75%','64%','--d:4.9s;--dl:.7s'],
    ['87%','57%','--d:3.2s;--dl:1.1s'],['94%','74%','--d:4.6s;--dl:.5s']
  ];

  function heroSection(s) {
    var title  = s.name || 'Hư Không';
    var sub    = s.pop === 0 && s.civs === 0
      ? 'Năm ' + s.year.toLocaleString() + ' · Chưa có sinh linh · Chưa có văn minh'
      : 'Năm ' + s.year.toLocaleString() + ' · ' + s.pop.toLocaleString() + ' sinh linh · ' + s.civs + ' văn minh';

    var stars = STAR_DATA.map(function(d) {
      var sz = Math.random() > 0.7 ? 2 : 1;
      return '<div class="puos-star" style="top:' + d[0] + ';left:' + d[1] + ';width:' + sz + 'px;height:' + sz + 'px;' + d[2] + '"></div>';
    }).join('');

    var html = '<div style="position:relative;overflow:hidden;border-bottom:1px solid #0d1829">';
    // Bg gradients
    html += '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 15% 50%,#7c3aed0e 0%,transparent 60%),radial-gradient(ellipse at 85% 20%,#3b82f60a 0%,transparent 55%);pointer-events:none"></div>';
    html += stars;

    // Row: canvas left + text right
    html += '<div style="position:relative;display:flex;align-items:center;gap:44px;padding:46px 48px 42px">';

    // Galaxy canvas
    html += '<div style="flex-shrink:0;position:relative">';
    html += '<canvas id="puos-galaxy" width="200" height="200" '
      + 'style="border-radius:50%;background:#070e19;display:block;'
      + 'box-shadow:0 0 50px #7c3aed1a,0 0 100px #7c3aed0a,inset 0 0 20px #7c3aed08"></canvas>';
    // Outer glow ring
    html += '<div style="position:absolute;inset:-3px;border-radius:50%;border:1px solid #7c3aed22;pointer-events:none"></div>';
    html += '</div>';

    // Text
    html += '<div style="flex:1;min-width:0">';
    html += '<div style="font-size:10px;color:#7c3aed;letter-spacing:3px;margin-bottom:16px;opacity:.65">VŨ TRỤ CỦA TÔI</div>';
    html += '<h1 style="font-size:38px;font-weight:300;color:#e2e8f0;margin:0 0 11px;letter-spacing:-.5px;line-height:1.1">' + title + '</h1>';
    html += '<div style="font-size:12px;color:#4a5568;margin-bottom:22px;letter-spacing:.4px">' + sub + '</div>';
    html += '<div style="margin-bottom:26px">';
    html += '<div style="font-size:15px;color:#94a3b8;line-height:1.75;font-style:italic">' + s.narr[0] + '</div>';
    html += '<div style="font-size:12px;color:#4a5568;line-height:1.6;margin-top:5px">' + s.narr[1] + '</div>';
    html += '</div>';
    // Stage badge
    html += '<div class="puos-badge-live" style="display:inline-flex;align-items:center;gap:8px;'
      + 'padding:7px 14px;border-radius:99px;background:#7c3aed14;border:1px solid #7c3aed33">';
    html += '<span style="width:6px;height:6px;border-radius:50%;background:#7c3aed;box-shadow:0 0 7px #7c3aed"></span>';
    html += '<span style="font-size:11px;color:#a78bfa;letter-spacing:.4px">' + s.label + '</span>';
    html += '</div>';
    html += '</div>';

    html += '</div></div>';
    return html;
  }

  // ─────────────────────────────────────────────
  // SECTION: EVOLUTION METERS
  // ─────────────────────────────────────────────
  function evolutionMeters(s) {
    var C = 2 * Math.PI * 36; // ~226.2 for r=36

    function arc(pct, color, icon, val, label) {
      pct = Math.max(0, Math.min(1, pct));
      var off = (C * (1 - pct)).toFixed(1);
      return '<div style="display:flex;flex-direction:column;align-items:center;gap:9px">'
        + '<div style="position:relative;width:88px;height:88px">'
        +   '<svg width="88" height="88" viewBox="0 0 88 88">'
        +     '<circle cx="44" cy="44" r="36" class="puos-arc-bg"/>'
        +     '<circle cx="44" cy="44" r="36" class="puos-arc-val" stroke="' + color + '" '
        +       'stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + off + '" '
        +       'transform="rotate(-90 44 44)"/>'
        +   '</svg>'
        +   '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px">'
        +     '<span style="font-size:15px;line-height:1">' + icon + '</span>'
        +     '<span style="font-size:11px;color:' + color + ';font-weight:500;line-height:1.3">' + val + '</span>'
        +   '</div>'
        + '</div>'
        + '<div style="font-size:9px;color:#334155;letter-spacing:1.5px;text-align:center">' + label + '</div>'
        + '</div>';
    }

    var popPct   = Math.min(1, Math.log(s.pop + 1) / Math.log(501));
    var civPct   = Math.min(1, s.civs / 8);
    var peacePct = Math.max(0, 1 - s.wars / 6);
    var popVal   = s.pop > 999 ? (s.pop / 1000).toFixed(1) + 'k' : s.pop;
    var peaceVal = s.wars === 0 ? '☮' : s.wars + '⚔';

    var divider = '<div style="width:1px;height:56px;background:linear-gradient(transparent,#1e293b55,transparent)"></div>';

    return '<div style="padding:28px 48px;border-bottom:1px solid #0a1020;display:flex;align-items:center;justify-content:center;gap:48px">'
      + arc(popPct,  '#a78bfa', '👥', popVal,   'SINH LINH')
      + divider
      + arc(civPct,  '#10b981', '🏛', s.civs,   'VĂN MINH')
      + divider
      + arc(peacePct,'#38bdf8', '☮', peaceVal, 'HÒA BÌNH')
      + '</div>';
  }

  // ─────────────────────────────────────────────
  // SECTION: QUICK ACTIONS
  // ─────────────────────────────────────────────
  function quickActions() {
    var acts = [
      { i:'✨', l:'Tạo Thế Giới', s:'Khai sinh vũ trụ mới',   f:"puosGo('worlds')",       c:'#7c3aed' },
      { i:'🤖', l:'Hỏi Jarvis',   s:'Trợ lý AI của bạn',      f:"puosGo('jarvis')",       c:'#3b82f6' },
      { i:'🌌', l:'Universe Hub', s:'Khám phá đa vũ trụ',     f:"puosGo('universe-hub')", c:'#8b5cf6' }
    ];
    var html = '<div style="padding:26px 48px 22px">';
    html += '<div style="font-size:10px;color:#334155;letter-spacing:2px;margin-bottom:14px">HÀNH ĐỘNG</div>';
    html += '<div style="display:flex;gap:12px">';
    acts.forEach(function(a) {
      html += '<button onclick="' + a.f + '" '
        + 'style="flex:1;display:flex;flex-direction:column;align-items:flex-start;gap:5px;padding:17px;'
        + 'border-radius:12px;background:' + a.c + '0a;border:1px solid ' + a.c + '22;cursor:pointer;'
        + 'text-align:left;transition:all .18s;font-family:\'Noto Serif SC\',serif" '
        + 'onmouseover="this.style.background=\'' + a.c + '18\';this.style.borderColor=\'' + a.c + '44\'" '
        + 'onmouseout="this.style.background=\'' + a.c + '0a\';this.style.borderColor=\'' + a.c + '22\'">'
        + '<span style="font-size:20px">' + a.i + '</span>'
        + '<span style="font-size:13px;color:#cbd5e1">' + a.l + '</span>'
        + '<span style="font-size:11px;color:#334155">' + a.s + '</span>'
        + '</button>';
    });
    html += '</div></div>';
    return html;
  }

  // ─────────────────────────────────────────────
  // SECTION: LIVING TIMELINE
  // ─────────────────────────────────────────────
  function livingTimeline() {
    return '<div style="padding:0 48px 56px">'
      + '<div style="font-size:10px;color:#334155;letter-spacing:2px;margin-bottom:18px">BIÊN NIÊN SỬ · SỐNG</div>'
      + '<div id="puos-timeline"><div style="color:#1e293b;font-size:12px;padding:12px 0">Đang tải...</div></div>'
      + '</div>';
  }

  function renderTimeline() {
    setTimeout(function() {
      var el = document.getElementById('puos-timeline');
      if (!el) return;

      var events = [];
      try {
        var keys = ['cgv6_historical_timeline','cgv6_world_events_v25','cgv6_world_event_v25'];
        for (var k = 0; k < keys.length; k++) {
          var d = localStorage.getItem(keys[k]);
          if (d) {
            var p = JSON.parse(d);
            var arr = p.events || p.history || [];
            if (arr.length > 0) { events = arr; break; }
          }
        }
      } catch(e) {}

      if (events.length === 0) {
        el.innerHTML = '<div style="padding:24px 0;text-align:center">'
          + '<div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">'
          + '<div style="flex:1;height:1px;background:linear-gradient(to right,transparent,#1e293b66)"></div>'
          + '<div style="font-size:28px;opacity:.15">⭕</div>'
          + '<div style="flex:1;height:1px;background:linear-gradient(to left,transparent,#1e293b66)"></div>'
          + '</div>'
          + '<div style="font-size:12px;color:#1e293b;font-style:italic">Chưa có ký ức nào. Vũ trụ đang chờ câu chuyện đầu tiên.</div>'
          + '</div>';
        return;
      }

      // Pick 5-6 milestone snapshots
      var picks = [];
      var step  = Math.max(1, Math.floor(events.length / 5));
      for (var i = 0; i < events.length && picks.length < 5; i += step) picks.push(events[i]);
      if (picks[picks.length - 1] !== events[events.length - 1]) picks.push(events[events.length - 1]);

      // Horizontal milestone strip
      var hml = '<div style="position:relative;padding:24px 0 10px;overflow-x:auto">';
      // Baseline
      hml += '<div style="position:absolute;left:5%;right:5%;top:35px;height:1px;background:linear-gradient(to right,transparent,#1e293b88 10%,#1e293b88 90%,transparent)"></div>';
      hml += '<div style="display:flex;justify-content:space-between;gap:4px">';

      picks.forEach(function(ev, idx) {
        var col   = ev.color || '#7c3aed';
        var yr    = ev.year  || '?';
        var yrFmt = yr > 999 ? (yr/1000).toFixed(1)+'k' : yr;
        var title = (ev.title || ev.content || '').substring(0, 24);
        var isNow = idx === picks.length - 1;

        hml += '<div style="display:flex;flex-direction:column;align-items:center;gap:5px;flex:1;min-width:0">';
        // Dot
        hml += '<div style="width:' + (isNow ? '12px' : '9px') + ';height:' + (isNow ? '12px' : '9px') + ';border-radius:50%;'
          + 'background:' + col + ';box-shadow:0 0 ' + (isNow ? '12px ' : '6px ') + col + '88;flex-shrink:0;'
          + (isNow ? 'border:2px solid ' + col + '55;' : '') + '"></div>';
        // Year
        hml += '<div style="font-size:9px;color:#334155;white-space:nowrap">Năm ' + yrFmt + '</div>';
        // Title
        hml += '<div style="font-size:9px;color:#4a5568;text-align:center;max-width:72px;'
          + 'line-height:1.35;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">'
          + title + '</div>';
        hml += '</div>';
      });

      hml += '</div></div>';

      // Recent 3 events vertical feed
      var recent = events.slice(-3).reverse();
      hml += '<div style="margin-top:20px;border-top:1px solid #0a1020;padding-top:18px">';
      recent.forEach(function(ev, idx) {
        var col   = ev.color || '#7c3aed';
        var yr    = ev.year  || '?';
        var title = ev.title || ev.content || '';
        var last  = idx === recent.length - 1;
        hml += '<div style="display:flex;gap:14px;padding:11px 0;' + (last ? '' : 'border-bottom:1px solid #0a1020') + '">';
        hml += '<div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;padding-top:3px">';
        hml += '<div style="width:7px;height:7px;border-radius:50%;background:' + col + ';box-shadow:0 0 5px ' + col + '66"></div>';
        if (!last) hml += '<div style="width:1px;flex:1;background:linear-gradient(' + col + '22,transparent);margin-top:5px"></div>';
        hml += '</div>';
        hml += '<div><div style="font-size:9px;color:#334155;margin-bottom:3px">Năm ' + (yr > 999 ? (yr/1000).toFixed(1)+'k' : yr) + '</div>'
          + '<div style="font-size:12px;color:#94a3b8;line-height:1.5">' + title + '</div></div>';
        hml += '</div>';
      });
      hml += '</div>';

      el.innerHTML = hml;
    }, 300);
  }

  // ─────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────
  window.puosRenderMyUniverse = function(container) {
    if (_animId) { cancelAnimationFrame(_animId); _animId = null; }
    injectStyles();

    var story = getStory();

    container.innerHTML = '<div class="puos-fade">'
      + heroSection(story)
      + evolutionMeters(story)
      + quickActions()
      + livingTimeline()
      + '</div>';

    setTimeout(function() { startGalaxy(story.pop, story.civs); }, 60);
    renderTimeline();
  };

  console.log('[PUOS My Universe V90] 🪐 My Universe panel sẵn sàng.');
})();
