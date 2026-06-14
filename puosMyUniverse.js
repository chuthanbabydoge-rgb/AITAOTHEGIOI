(function() {
  "use strict";

  var _animId = null;
  var _nebT   = 0;

  // ─────────────────────────────────────────────
  // DATA
  // ─────────────────────────────────────────────
  function getStory() {
    var world = window.world    || {};
    var npcs  = window.npcs     || [];
    var ctrs  = window.countries|| [];
    var yr    = window.year     || 1;
    var wars  = window.warsActive || [];

    var name = world.name || (ctrs.length > 0 && ctrs[0] && ctrs[0].name) || null;
    var pop  = npcs.length;
    var civs = ctrs.filter(function(c){ return c && c.population > 0; }).length;
    var totalPop = ctrs.reduce(function(s,c){ return s + (c && c.population ? c.population : 0); }, 0);

    var stage = 'void';
    if      (pop === 0 && civs === 0)      stage = 'void';
    else if (pop < 10  && civs < 2)        stage = 'dawn';
    else if (pop < 100 && civs < 5)        stage = 'rise';
    else if (wars.length > 3)              stage = 'conflict';
    else if (civs >= 5  && pop >= 100)     stage = 'flourish';
    else                                   stage = 'growing';

    var stageIdx = { void:0, dawn:1, rise:2, conflict:3, growing:4, flourish:5 };

    var labels = {
      void:     '✦ Hư Không · Chờ Khai Sinh',
      dawn:     '🌅 Bình Minh · Những Sinh Linh Đầu Tiên',
      rise:     '🌱 Thức Tỉnh · Văn Minh Đang Hình Thành',
      conflict: '⚔️ Loạn Thế · Các Thế Lực Đối Đầu',
      growing:  '🔮 Tiến Hóa · Thế Giới Đang Mở Rộng',
      flourish: '🌟 Thịnh Vượng · Vũ Trụ Phồn Thịnh'
    };
    var narrs = {
      void:     ['Một vũ trụ đang chờ được khai sinh.', 'Hãy tạo thế giới để bắt đầu hành trình.'],
      dawn:     ['Những sinh linh đầu tiên bước vào thế giới.', 'Mọi thứ đang bắt đầu.'],
      rise:     ['Văn minh đang nảy mầm từ những vùng đất hoang.', 'Lịch sử đang được viết.'],
      conflict: ['Các thế lực đối đầu nhau quyết liệt.', 'Vận mệnh thế giới chưa ngã ngũ.'],
      growing:  ['Thế giới đang lớn dần theo từng năm.', 'Mỗi tick là một kỷ nguyên mới.'],
      flourish: ['Vũ trụ đạt đỉnh cao thịnh vượng.', 'Văn minh trải khắp mọi miền.']
    };
    var stageColor = {
      void:'#475569', dawn:'#f59e0b', rise:'#10b981',
      conflict:'#ef4444', growing:'#7c3aed', flourish:'#facc15'
    };

    var maturityScore = 0;
    try {
      var ms = localStorage.getItem('cgv6_universe_maturity_v60');
      if (ms) { var md = JSON.parse(ms); maturityScore = md.score || 0; }
    } catch(e) {}

    return {
      name: name, year: yr, pop: pop, civs: civs,
      wars: wars.length, stage: stage, stageIdx: stageIdx[stage],
      label: labels[stage], narr: narrs[stage],
      stageColor: stageColor[stage], totalPop: totalPop,
      maturity: maturityScore
    };
  }

  function getTimelineEvents() {
    var events = [];
    var keys = [
      'cgv6_historical_timeline','cgv6_world_events_v25',
      'cgv6_world_event_v25','cgv6_world_chronicle',
      'cgv6_world_story','cgv6_world_narrative_v60'
    ];
    for (var k = 0; k < keys.length; k++) {
      try {
        var d = localStorage.getItem(keys[k]);
        if (d) {
          var p = JSON.parse(d);
          var arr = p.events || p.history || p.chronicle || p.entries || [];
          if (arr.length > 0) { events = arr; break; }
        }
      } catch(e) {}
    }
    return events;
  }

  // ─────────────────────────────────────────────
  // STYLES
  // ─────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('puos-luv-style')) return;
    var s = document.createElement('style');
    s.id = 'puos-luv-style';
    s.textContent = [
      '@keyframes puos-twinkle{0%,100%{opacity:.05;transform:scale(1)}50%{opacity:.7;transform:scale(1.8)}}',
      '@keyframes puos-badge-pulse{0%,100%{box-shadow:0 0 0 0 #7c3aed44}60%{box-shadow:0 0 0 8px #7c3aed00}}',
      '@keyframes puos-drift{0%{transform:translateY(0) translateX(0);opacity:.0}20%{opacity:.18}80%{opacity:.12}100%{transform:translateY(-80px) translateX(20px);opacity:0}}',
      '@keyframes puos-energy-pulse{0%,100%{opacity:.08}50%{opacity:.22}}',
      '@keyframes puos-stage-glow{0%,100%{filter:brightness(1)}50%{filter:brightness(1.5)}}',
      '@keyframes puos-float-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}',
      '.puos-star{position:absolute;border-radius:50%;background:#e2e8f0;pointer-events:none;animation:puos-twinkle var(--d) ease-in-out infinite;animation-delay:var(--dl)}',
      '.puos-mote{position:absolute;border-radius:50%;pointer-events:none;animation:puos-drift var(--d) ease-in forwards;animation-delay:var(--dl)}',
      '.puos-badge-live{animation:puos-badge-pulse 2.8s ease-in-out infinite}',
      '.puos-arc-bg{fill:none;stroke:#0d1829;stroke-width:5}',
      '.puos-arc-val{fill:none;stroke-width:5;stroke-linecap:round}',
      '.puos-fade{animation:puos-float-in .45s ease both}',
      '.puos-stage-node{cursor:default;transition:all .2s}',
      '.puos-tl-dot{flex-shrink:0;border-radius:50%}',
      '.puos-section-label{font-size:9px;color:#2d3748;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:14px}'
    ].join('');
    document.head.appendChild(s);
  }

  // ─────────────────────────────────────────────
  // GALAXY CANVAS  — 260×260, rich depth
  // ─────────────────────────────────────────────
  function startGalaxy(s) {
    if (_animId) { cancelAnimationFrame(_animId); _animId = null; }
    var canvas = document.getElementById('puos-galaxy');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var W = 260, H = 260, cx = 130, cy = 130, t = 0;

    var pop  = s.pop,  civs = s.civs, wars = s.wars;
    var npc  = Math.min(pop,  20);
    var civ  = Math.min(civs, 10);
    var CIVC = ['#7c3aed','#3b82f6','#10b981','#f59e0b','#ef4444',
                '#8b5cf6','#06b6d4','#ec4899','#a3e635','#fb923c'];
    var ORBITS = [50, 75, 100];

    // Stage arc config
    var STAGES = ['void','dawn','rise','conflict','growing','flourish'];
    var STAGEC  = ['#475569','#f59e0b','#10b981','#ef4444','#7c3aed','#facc15'];
    var sidx    = s.stageIdx;

    // Deterministic starfield
    var stars = [], seed = 7919;
    for (var si = 0; si < 60; si++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      var sx = (seed >>> 0) % W;
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      var sy = (seed >>> 0) % H;
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      var sbr = 0.05 + (seed % 100) * 0.004;
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      var sr  = 0.4  + (seed % 10) * 0.08;
      stars.push({ x:sx, y:sy, b:sbr, ph:si*0.41, r:sr });
    }

    // Nebula cloud positions (static, animated brightness)
    var nebulas = [
      { x:cx-42, y:cy-28, r:44, c:'#7c3aed', ph:0    },
      { x:cx+38, y:cy+30, r:36, c:'#3b82f6', ph:1.5  },
      { x:cx-20, y:cy+44, r:32, c:'#10b981', ph:3.0  },
      { x:cx+30, y:cy-40, r:28, c:'#8b5cf6', ph:0.8  }
    ];

    function draw() {
      t += 0.005;
      ctx.clearRect(0, 0, W, H);

      // — Nebula clouds —
      nebulas.forEach(function(nb) {
        var a = 0.03 + 0.025 * Math.sin(t * 0.6 + nb.ph);
        var g = ctx.createRadialGradient(nb.x, nb.y, 0, nb.x, nb.y, nb.r);
        g.addColorStop(0,   nb.c + Math.round(a * 255).toString(16).padStart(2,'0'));
        g.addColorStop(0.5, nb.c + '08');
        g.addColorStop(1,   'transparent');
        ctx.beginPath();
        ctx.ellipse(nb.x, nb.y, nb.r * 1.4, nb.r, t * 0.04 + nb.ph * 0.3, 0, 6.283);
        ctx.fillStyle = g;
        ctx.fill();
      });

      // — Stars —
      stars.forEach(function(st) {
        var a = st.b * (0.4 + 0.6 * Math.sin(t * 0.7 + st.ph));
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, 6.283);
        ctx.fillStyle = 'rgba(226,232,240,' + a.toFixed(3) + ')';
        ctx.fill();
      });

      // — Orbit rings —
      ORBITS.forEach(function(orb, ri) {
        var oa = 0.05 + 0.025 * Math.sin(t * 0.35 + ri * 1.2);
        ctx.beginPath();
        ctx.arc(cx, cy, orb, 0, 6.283);
        ctx.strokeStyle = 'rgba(124,58,237,' + oa.toFixed(3) + ')';
        ctx.lineWidth   = 0.8;
        ctx.setLineDash([4, 10]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // — NPC particles on orbits —
      for (var ni = 0; ni < npc; ni++) {
        var orb  = ORBITS[ni % 3];
        var spd  = 0.35 + (ni % 3) * 0.12;
        var ang  = (ni / Math.max(npc,1)) * 6.283 + t * spd;
        var px   = cx + Math.cos(ang) * orb;
        var py   = cy + Math.sin(ang) * orb;
        var pa   = 0.25 + 0.55 * Math.sin(t * 1.6 + ni * 0.75);
        // Trail
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang - 0.2) * orb, cy + Math.sin(ang - 0.2) * orb, 1, 0, 6.283);
        ctx.fillStyle = 'rgba(167,139,250,0.08)';
        ctx.fill();
        // Dot
        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, 6.283);
        ctx.fillStyle = 'rgba(167,139,250,' + pa.toFixed(2) + ')';
        ctx.fill();
      }

      // — Civilization world-nodes on outer orbit r=110 —
      for (var ci2 = 0; ci2 < civ; ci2++) {
        var wAng = (ci2 / Math.max(civ,1)) * 6.283 - 1.5708 + t * 0.06;
        var wx   = cx + Math.cos(wAng) * 110;
        var wy   = cy + Math.sin(wAng) * 110;
        var wc   = CIVC[ci2 % 10];
        var wa   = 0.6 + 0.35 * Math.sin(t * 1.1 + ci2 * 1.2);
        // Glow halo
        var grd2 = ctx.createRadialGradient(wx, wy, 0, wx, wy, 8);
        grd2.addColorStop(0, wc + 'aa');
        grd2.addColorStop(1, wc + '00');
        ctx.beginPath(); ctx.arc(wx, wy, 8, 0, 6.283);
        ctx.fillStyle = grd2; ctx.fill();
        // Core dot
        ctx.beginPath(); ctx.arc(wx, wy, 3, 0, 6.283);
        ctx.fillStyle = wc + Math.round(wa * 255).toString(16).padStart(2,'0');
        ctx.fill();

        // Energy tendrils to center when at war
        if (wars > 0 && ci2 < wars) {
          ctx.beginPath();
          ctx.moveTo(wx, wy);
          var cp1x = cx + (wx-cx)*0.33 + Math.sin(t*2+ci2)*15;
          var cp1y = cy + (wy-cy)*0.33 + Math.cos(t*2+ci2)*15;
          ctx.quadraticCurveTo(cp1x, cp1y, cx, cy);
          ctx.strokeStyle = '#ef4444' + Math.round((0.04 + 0.06*Math.sin(t*3+ci2))*255).toString(16).padStart(2,'0');
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }

      // — Stage progress ring (outermost r=124) —
      var segA = 6.283 / 6;
      for (var sg = 0; sg < 6; sg++) {
        var sStart = sg * segA - 1.5708;
        var sEnd   = sStart + segA * 0.82;
        var active = sg <= sidx;
        var bright = sg === sidx;
        ctx.beginPath();
        ctx.arc(cx, cy, 124, sStart, sEnd);
        var sa = bright
          ? (0.65 + 0.3 * Math.sin(t * 2.2))
          : active ? 0.25 : 0.07;
        ctx.strokeStyle = STAGEC[sg] + Math.round(sa*255).toString(16).padStart(2,'0');
        ctx.lineWidth   = bright ? 3 : 1.5;
        ctx.stroke();
        // Stage tick dot
        if (active) {
          var tdx = cx + Math.cos(sg * segA + segA * 0.41 - 1.5708) * 124;
          var tdy = cy + Math.sin(sg * segA + segA * 0.41 - 1.5708) * 124;
          ctx.beginPath(); ctx.arc(tdx, tdy, bright ? 4 : 2.5, 0, 6.283);
          ctx.fillStyle = STAGEC[sg];
          ctx.fill();
        }
      }

      // — Central glow —
      var pulse = 18 + 7 * Math.sin(t * 1.4);
      var grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulse + 14);
      grd.addColorStop(0,   'rgba(230,210,255,0.98)');
      grd.addColorStop(0.25,'rgba(124,58,237,0.65)');
      grd.addColorStop(0.6, 'rgba(124,58,237,0.12)');
      grd.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(cx, cy, pulse + 14, 0, 6.283);
      ctx.fillStyle = grd; ctx.fill();

      // Hard core
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, 6.283);
      ctx.fillStyle = '#ffffff'; ctx.fill();

      _animId = requestAnimationFrame(draw);
    }
    draw();
  }

  // ─────────────────────────────────────────────
  // AMBIENT MOTES  — pure CSS drifting particles
  // ─────────────────────────────────────────────
  var MOTE_DATA = [
    ['12%','8%','--d:8s;--dl:0s','#7c3aed'],   ['28%','15%','--d:11s;--dl:2s','#3b82f6'],
    ['45%','5%','--d:9s;--dl:4s','#7c3aed'],   ['63%','20%','--d:12s;--dl:1s','#10b981'],
    ['80%','12%','--d:7s;--dl:3s','#8b5cf6'],  ['15%','60%','--d:10s;--dl:5s','#3b82f6'],
    ['35%','75%','--d:13s;--dl:2s','#7c3aed'], ['55%','55%','--d:8s;--dl:6s','#f59e0b'],
    ['75%','68%','--d:9s;--dl:1s','#7c3aed'],  ['90%','42%','--d:11s;--dl:4s','#10b981']
  ];
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
    ['87%','57%','--d:3.2s;--dl:1.1s'],['94%','74%','--d:4.6s;--dl:.5s'],
    ['4%','88%','--d:3.8s;--dl:.9s'],  ['19%','91%','--d:5.3s;--dl:.2s'],
    ['42%','86%','--d:2.9s;--dl:1.5s'],['72%','93%','--d:4.0s;--dl:.6s']
  ];

  // ─────────────────────────────────────────────
  // SECTION: HERO
  // ─────────────────────────────────────────────
  function heroSection(s) {
    var title = s.name || 'Hư Không';
    var sub   = s.pop === 0 && s.civs === 0
      ? 'Năm ' + s.year.toLocaleString() + ' · Chưa có sinh linh · Chưa có văn minh'
      : 'Năm ' + s.year.toLocaleString() + ' · ' + s.pop.toLocaleString() + ' sinh linh · ' + s.civs + ' văn minh';

    var stars = STAR_DATA.map(function(d) {
      var sz = Math.random() > 0.68 ? 2 : 1;
      return '<div class="puos-star" style="top:'+d[0]+';left:'+d[1]+';width:'+sz+'px;height:'+sz+'px;'+d[2]+'"></div>';
    }).join('');

    var motes = MOTE_DATA.map(function(d) {
      return '<div class="puos-mote" style="bottom:'+d[0]+';left:'+d[1]+';width:3px;height:3px;background:'+d[3]+';opacity:0;'+d[2]+'"></div>';
    }).join('');

    var html = '<div style="position:relative;overflow:hidden;border-bottom:1px solid #0a1422">';
    html += '<div style="position:absolute;inset:0;background:'
      + 'radial-gradient(ellipse at 12% 55%,#7c3aed12 0%,transparent 55%),'
      + 'radial-gradient(ellipse at 88% 15%,#3b82f60c 0%,transparent 50%),'
      + 'radial-gradient(ellipse at 50% 100%,#10b98108 0%,transparent 45%)'
      + ';pointer-events:none"></div>';
    html += stars + motes;

    html += '<div style="position:relative;display:flex;align-items:center;gap:48px;padding:50px 52px 46px">';

    // — Galaxy visual —
    html += '<div style="flex-shrink:0;position:relative">';
    html += '<canvas id="puos-galaxy" width="260" height="260" '
      + 'style="border-radius:50%;background:radial-gradient(circle at 50% 50%,#080f1e 0%,#040810 100%);display:block;'
      + 'box-shadow:0 0 60px #7c3aed22,0 0 120px #7c3aed0c,inset 0 0 30px #7c3aed0a"></canvas>';
    // Outer glow ring
    html += '<div style="position:absolute;inset:-2px;border-radius:50%;border:1px solid #7c3aed1a;pointer-events:none"></div>';
    html += '<div style="position:absolute;inset:-6px;border-radius:50%;border:1px solid #7c3aed0a;pointer-events:none"></div>';
    html += '</div>';

    // — Text —
    html += '<div style="flex:1;min-width:0">';
    html += '<div style="font-size:10px;color:#7c3aed;letter-spacing:3px;margin-bottom:18px;opacity:.6">VŨ TRỤ CỦA TÔI</div>';
    html += '<h1 style="font-size:42px;font-weight:300;color:#e2e8f0;margin:0 0 12px;letter-spacing:-.5px;line-height:1.05">' + title + '</h1>';
    html += '<div style="font-size:12px;color:#334155;margin-bottom:24px;letter-spacing:.5px">' + sub + '</div>';
    html += '<div style="margin-bottom:28px">';
    html += '<div style="font-size:15px;color:#94a3b8;line-height:1.8;font-style:italic">' + s.narr[0] + '</div>';
    html += '<div style="font-size:12px;color:#334155;line-height:1.6;margin-top:6px">' + s.narr[1] + '</div>';
    html += '</div>';
    // Stage badge
    html += '<div class="puos-badge-live" style="display:inline-flex;align-items:center;gap:9px;'
      + 'padding:8px 16px;border-radius:99px;background:' + s.stageColor + '14;border:1px solid ' + s.stageColor + '33">';
    html += '<span style="width:7px;height:7px;border-radius:50%;background:' + s.stageColor + ';box-shadow:0 0 8px ' + s.stageColor + '"></span>';
    html += '<span style="font-size:11px;color:' + s.stageColor + ';letter-spacing:.4px">' + s.label + '</span>';
    html += '</div>';
    html += '</div>';
    html += '</div></div>';
    return html;
  }

  // ─────────────────────────────────────────────
  // SECTION: WORLD LIFECYCLE BAR  (Stellaris-style era strip)
  // ─────────────────────────────────────────────
  function worldLifecycleBar(s) {
    var STAGES = [
      { id:'void',    icon:'✦', label:'Hư Không',   c:'#475569' },
      { id:'dawn',    icon:'🌅', label:'Bình Minh',  c:'#f59e0b' },
      { id:'rise',    icon:'🌱', label:'Thức Tỉnh',  c:'#10b981' },
      { id:'conflict',icon:'⚔️', label:'Loạn Thế',   c:'#ef4444' },
      { id:'growing', icon:'🔮', label:'Tiến Hóa',   c:'#7c3aed' },
      { id:'flourish',icon:'🌟', label:'Thịnh Vượng',c:'#facc15' }
    ];
    var sidx = s.stageIdx;

    var html = '<div style="padding:24px 52px 22px;border-bottom:1px solid #0a1422;background:#04080f">';
    html += '<div class="puos-section-label">VÒNG ĐỜI VŨ TRỤ</div>';
    html += '<div style="display:flex;align-items:stretch;gap:0;border-radius:10px;overflow:hidden;border:1px solid #0d1829">';

    STAGES.forEach(function(st, i) {
      var active  = i <= sidx;
      var current = i === sidx;
      var bg = current ? st.c + '22'
             : active  ? st.c + '0c'
             : '#060d18';
      var bd = current ? '1px solid ' + st.c + '55'
             : active  ? '1px solid ' + st.c + '1a'
             : '1px solid transparent';
      html += '<div style="flex:1;padding:12px 8px 10px;text-align:center;background:' + bg + ';border-right:' + bd + ';position:relative;transition:all .3s">';
      if (current) {
        html += '<div style="position:absolute;inset:0;background:' + st.c + '08;animation:puos-energy-pulse 2.5s ease-in-out infinite"></div>';
      }
      html += '<div style="font-size:14px;position:relative;opacity:' + (active ? '1' : '.2') + '">' + st.icon + '</div>';
      html += '<div style="font-size:8px;color:' + (active ? st.c : '#1e293b') + ';letter-spacing:1px;margin-top:5px;position:relative">' + st.label.toUpperCase() + '</div>';
      if (current) {
        html += '<div style="position:absolute;bottom:0;left:20%;right:20%;height:2px;background:' + st.c + ';border-radius:2px 2px 0 0;box-shadow:0 0 8px ' + st.c + '"></div>';
      }
      html += '</div>';
    });

    html += '</div></div>';
    return html;
  }

  // ─────────────────────────────────────────────
  // SECTION: EVOLUTION METERS
  // ─────────────────────────────────────────────
  function evolutionMeters(s) {
    var C = 2 * Math.PI * 34;

    function arc(pct, color, icon, val, label) {
      pct = Math.max(0, Math.min(1, pct));
      var off = (C * (1 - pct)).toFixed(1);
      return '<div style="display:flex;flex-direction:column;align-items:center;gap:10px">'
        + '<div style="position:relative;width:84px;height:84px">'
        +   '<svg width="84" height="84" viewBox="0 0 84 84">'
        +     '<circle cx="42" cy="42" r="34" class="puos-arc-bg"/>'
        +     '<circle cx="42" cy="42" r="34" class="puos-arc-val" stroke="' + color + '" '
        +       'stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + off + '" '
        +       'transform="rotate(-90 42 42)" style="filter:drop-shadow(0 0 4px ' + color + '88)"/>'
        +   '</svg>'
        +   '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px">'
        +     '<span style="font-size:14px;line-height:1">' + icon + '</span>'
        +     '<span style="font-size:11px;color:' + color + ';font-weight:500;line-height:1.3">' + val + '</span>'
        +   '</div>'
        + '</div>'
        + '<div style="font-size:9px;color:#2d3748;letter-spacing:1.8px;text-align:center">' + label + '</div>'
        + '</div>';
    }

    var popPct   = Math.min(1, Math.log(s.pop + 1) / Math.log(501));
    var civPct   = Math.min(1, s.civs / 8);
    var matPct   = Math.min(1, s.maturity / 100);
    var peacePct = Math.max(0, 1 - s.wars / 6);
    var popVal   = s.pop > 9999 ? (s.pop/1000).toFixed(0)+'k' : s.pop > 999 ? (s.pop/1000).toFixed(1)+'k' : s.pop;
    var peaceVal = s.wars === 0 ? '☮' : s.wars + '⚔';
    var matVal   = s.maturity > 0 ? s.maturity + '' : '—';

    var divider = '<div style="width:1px;height:52px;background:linear-gradient(transparent,#0d1829,transparent);align-self:center"></div>';

    return '<div style="padding:30px 52px;border-bottom:1px solid #0a1422;display:flex;align-items:center;justify-content:center;gap:44px">'
      + arc(popPct,   '#a78bfa', '👥', popVal,   'SINH LINH')
      + divider
      + arc(civPct,   '#10b981', '🏛', s.civs,   'VĂN MINH')
      + divider
      + arc(peacePct, '#38bdf8', '☮', peaceVal, 'HÒA BÌNH')
      + divider
      + arc(matPct,   '#f59e0b', '⭕', matVal,   'TRƯỞNG THÀNH')
      + '</div>';
  }

  // ─────────────────────────────────────────────
  // SECTION: QUICK ACTIONS
  // ─────────────────────────────────────────────
  function quickActions() {
    var acts = [
      { i:'✨', l:'Tạo Thế Giới', s:'Khai sinh vũ trụ mới',  f:"puosGo('worlds')",       c:'#7c3aed' },
      { i:'🤖', l:'Hỏi Jarvis',   s:'Trợ lý AI của bạn',     f:"puosGo('jarvis')",       c:'#3b82f6' },
      { i:'🌌', l:'Universe Hub', s:'Khám phá đa vũ trụ',    f:"puosGo('universe-hub')", c:'#8b5cf6' }
    ];
    var html = '<div style="padding:28px 52px 24px;border-bottom:1px solid #0a1422">';
    html += '<div class="puos-section-label">HÀNH ĐỘNG</div>';
    html += '<div style="display:flex;gap:12px">';
    acts.forEach(function(a) {
      html += '<button onclick="' + a.f + '" '
        + 'style="flex:1;display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding:18px;'
        + 'border-radius:12px;background:' + a.c + '0b;border:1px solid ' + a.c + '22;cursor:pointer;'
        + 'text-align:left;transition:background .18s,border-color .18s;font-family:\'Noto Serif SC\',serif" '
        + 'onmouseover="this.style.background=\'' + a.c + '1c\';this.style.borderColor=\'' + a.c + '44\'" '
        + 'onmouseout="this.style.background=\'' + a.c + '0b\';this.style.borderColor=\'' + a.c + '22\'">'
        + '<span style="font-size:22px">' + a.i + '</span>'
        + '<span style="font-size:13px;color:#cbd5e1;font-weight:400">' + a.l + '</span>'
        + '<span style="font-size:11px;color:#2d3748">' + a.s + '</span>'
        + '</button>';
    });
    html += '</div></div>';
    return html;
  }

  // ─────────────────────────────────────────────
  // SECTION: LIVING TIMELINE
  // ─────────────────────────────────────────────
  function livingTimeline() {
    return '<div style="padding:28px 52px 60px">'
      + '<div class="puos-section-label">BIÊN NIÊN SỬ · SỐNG</div>'
      + '<div id="puos-timeline"><div style="color:#1e293b;font-size:12px;padding:8px 0">Đang tải...</div></div>'
      + '</div>';
  }

  // Event type classifier
  function classifyEvent(ev) {
    var t = (ev.type || ev.category || '').toLowerCase();
    var txt = (ev.title || ev.content || '').toLowerCase();
    if (t.includes('war') || t.includes('battle') || t.includes('conflict') || txt.includes('chiến')) return { icon:'⚔️', color:'#ef4444' };
    if (t.includes('civ') || t.includes('found') || txt.includes('văn minh') || txt.includes('thành lập')) return { icon:'🏛', color:'#10b981' };
    if (t.includes('god') || t.includes('divine') || t.includes('miracle') || txt.includes('thần')) return { icon:'✦', color:'#a78bfa' };
    if (t.includes('hero') || t.includes('legend') || txt.includes('anh hùng')) return { icon:'🌟', color:'#f59e0b' };
    if (t.includes('disaster') || t.includes('catastrophe') || txt.includes('thảm họa')) return { icon:'💥', color:'#f97316' };
    return { icon:'◈', color:'#7c3aed' };
  }

  function renderTimeline() {
    setTimeout(function() {
      var el = document.getElementById('puos-timeline');
      if (!el) return;

      var events = getTimelineEvents();

      if (events.length === 0) {
        el.innerHTML = '<div style="padding:32px 0;text-align:center">'
          + '<div style="display:flex;align-items:center;gap:16px;margin-bottom:22px">'
          + '<div style="flex:1;height:1px;background:linear-gradient(to right,transparent,#0d182966)"></div>'
          + '<div style="font-size:24px;opacity:.12">⭕</div>'
          + '<div style="flex:1;height:1px;background:linear-gradient(to left,transparent,#0d182966)"></div>'
          + '</div>'
          + '<div style="font-size:13px;color:#1e2d3d;font-style:italic;line-height:1.8">'
          + 'Chưa có ký ức nào.<br>'
          + '<span style="font-size:11px;color:#162030">Vũ trụ đang chờ câu chuyện đầu tiên.</span>'
          + '</div>'
          + '</div>';
        return;
      }

      // Milestone strip — evenly spaced snapshots
      var picks = [];
      var step  = Math.max(1, Math.floor(events.length / 6));
      for (var i = 0; i < events.length && picks.length < 6; i += step) picks.push(events[i]);
      var last = events[events.length - 1];
      if (picks[picks.length - 1] !== last) picks.push(last);

      var hml = '<div style="position:relative;padding:8px 4px 24px;overflow-x:auto">';
      hml += '<div style="position:absolute;left:6%;right:6%;top:22px;height:1px;'
        + 'background:linear-gradient(to right,transparent,#1e293b 10%,#1e293b 90%,transparent)"></div>';
      hml += '<div style="display:flex;justify-content:space-between;gap:4px;min-width:0">';

      picks.forEach(function(ev, idx) {
        var cls = classifyEvent(ev);
        var yr  = ev.year || '?';
        var yrF = yr > 9999 ? (yr/1000).toFixed(0)+'k' : yr > 999 ? (yr/1000).toFixed(1)+'k' : yr;
        var ttl = (ev.title || ev.content || '').substring(0, 22);
        var now = idx === picks.length - 1;

        hml += '<div style="display:flex;flex-direction:column;align-items:center;gap:5px;flex:1;min-width:0">';
        hml += '<div style="width:' + (now?'13px':'10px') + ';height:' + (now?'13px':'10px') + ';border-radius:50%;'
          + 'background:' + cls.color + ';box-shadow:0 0 ' + (now?'14px ':'7px ') + cls.color + '88;flex-shrink:0;'
          + (now ? 'border:2px solid ' + cls.color + '66;animation:puos-energy-pulse 2s ease-in-out infinite;' : '') + '"></div>';
        hml += '<div style="font-size:9px;color:#2d3748;white-space:nowrap">Năm ' + yrF + '</div>';
        hml += '<div style="font-size:8px;color:#1e293b;text-align:center;max-width:70px;'
          + 'line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + ttl + '</div>';
        hml += '</div>';
      });

      hml += '</div></div>';

      // Recent events — vertical thread
      var recent = events.slice(-5).reverse();
      hml += '<div style="margin-top:8px;border-top:1px solid #0a1422;padding-top:22px">';
      hml += '<div style="font-size:9px;color:#1e2d3d;letter-spacing:2px;margin-bottom:14px">SỰ KIỆN GẦN ĐÂY</div>';

      recent.forEach(function(ev, idx) {
        var cls  = classifyEvent(ev);
        var yr   = ev.year || '?';
        var yrF  = yr > 9999 ? (yr/1000).toFixed(0)+'k' : yr > 999 ? (yr/1000).toFixed(1)+'k' : yr;
        var ttl  = ev.title || ev.content || '';
        var last = idx === recent.length - 1;

        hml += '<div style="display:flex;gap:16px;padding:12px 0;' + (last ? '' : 'border-bottom:1px solid #080e1a') + '">';
        hml += '<div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;padding-top:2px">';
        hml += '<div class="puos-tl-dot" style="width:8px;height:8px;background:' + cls.color
          + ';box-shadow:0 0 6px ' + cls.color + '66"></div>';
        if (!last) hml += '<div style="width:1px;flex:1;min-height:16px;background:linear-gradient(' + cls.color + '22,transparent);margin-top:6px"></div>';
        hml += '</div>';
        hml += '<div style="flex:1;min-width:0">';
        hml += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">';
        hml += '<span style="font-size:12px;line-height:1">' + cls.icon + '</span>';
        hml += '<span style="font-size:9px;color:#2d3748;letter-spacing:.5px">Năm ' + yrF + '</span>';
        hml += '</div>';
        hml += '<div style="font-size:12px;color:#94a3b8;line-height:1.55">' + ttl + '</div>';
        hml += '</div>';
        hml += '</div>';
      });

      hml += '</div>';
      el.innerHTML = hml;
    }, 280);
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
      + worldLifecycleBar(story)
      + evolutionMeters(story)
      + quickActions()
      + livingTimeline()
      + '</div>';

    setTimeout(function() { startGalaxy(story); }, 50);
    renderTimeline();
  };

  console.log('[PUOS My Universe V90] 🪐 My Universe panel sẵn sàng.');
})();
