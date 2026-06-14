(function() {
  "use strict";

  function getWorldStory() {
    var world = window.world || {};
    var npcs  = window.npcs  || [];
    var ctrs  = window.countries || [];
    var yr    = window.year  || 1;
    var wars  = window.warsActive || [];

    var name = world.name || (ctrs.length > 0 && ctrs[0].name) || null;
    var pop  = npcs.length;
    var civs = ctrs.filter(function(c){ return c && c.population > 0; }).length;

    var stage = 'void';
    if (pop === 0 && civs === 0)         stage = 'void';
    else if (pop < 10 && civs < 2)       stage = 'dawn';
    else if (pop < 100 && civs < 5)      stage = 'rise';
    else if (wars.length > 3)            stage = 'conflict';
    else if (civs >= 5 && pop >= 100)    stage = 'flourish';
    else                                 stage = 'growing';

    var stageLabel = {
      void:     '✦ Hư Không · Chờ Khai Sinh',
      dawn:     '🌅 Bình Minh · Những Sinh Linh Đầu Tiên',
      rise:     '🌱 Thức Tỉnh · Văn Minh Đang Hình Thành',
      conflict: '⚔️ Loạn Thế · Các Thế Lực Đối Đầu',
      flourish: '🌟 Thịnh Vượng · Vũ Trụ Phồn Thịnh',
      growing:  '🔮 Tiến Hóa · Thế Giới Đang Mở Rộng'
    }[stage];

    var narrative = {
      void:     'Một vũ trụ đang chờ được khai sinh.\nHãy tạo thế giới để bắt đầu hành trình.',
      dawn:     'Những sinh linh đầu tiên bước vào thế giới.\nMọi thứ đang bắt đầu.',
      rise:     'Văn minh đang nảy mầm từ những vùng đất hoang.\nLịch sử đang được viết.',
      conflict: 'Các thế lực đối đầu nhau quyết liệt.\nVận mệnh thế giới chưa ngã ngũ.',
      flourish: 'Vũ trụ đạt đỉnh cao thịnh vượng.\nVăn minh trải khắp mọi miền.',
      growing:  'Thế giới đang lớn dần theo từng năm.\nMỗi tick là một kỷ nguyên mới.'
    }[stage];

    return { name: name, year: yr, pop: pop, civs: civs, stage: stage, stageLabel: stageLabel, narrative: narrative };
  }

  function heroSection(story) {
    var worldTitle = story.name
      ? story.name
      : 'Hư Không';

    var subline = story.pop === 0 && story.civs === 0
      ? 'Năm ' + story.year.toLocaleString() + ' · Chưa có sinh linh · Chưa có văn minh'
      : 'Năm ' + story.year.toLocaleString() + ' · ' + story.pop.toLocaleString() + ' sinh linh · ' + story.civs + ' văn minh';

    var narrativeLines = story.narrative.split('\n');

    var html = '';
    html += '<div style="position:relative;padding:64px 48px 56px;overflow:hidden;border-bottom:1px solid #0d1829">';

    html += '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 20% 50%, #7c3aed0d 0%, transparent 65%), radial-gradient(ellipse at 80% 20%, #3b82f609 0%, transparent 60%);pointer-events:none"></div>';

    html += '<div style="position:relative">';

    html += '<div style="font-size:10px;color:#7c3aed;letter-spacing:3px;margin-bottom:20px;opacity:0.7">VŨ TRỤ CỦA TÔI</div>';

    html += '<h1 style="font-size:42px;font-weight:300;color:#e2e8f0;margin:0 0 14px;letter-spacing:-0.5px;line-height:1.1">' + worldTitle + '</h1>';

    html += '<div style="font-size:13px;color:#4a5568;margin-bottom:28px;letter-spacing:0.5px">' + subline + '</div>';

    html += '<div style="max-width:480px;margin-bottom:32px">';
    narrativeLines.forEach(function(line, i) {
      var color = i === 0 ? '#94a3b8' : '#4a5568';
      var size  = i === 0 ? '16px'    : '13px';
      var mt    = i === 0 ? '0'       : '8px';
      html += '<div style="font-size:' + size + ';color:' + color + ';line-height:1.7;margin-top:' + mt + ';font-style:' + (i===0?'italic':'normal') + '">' + line + '</div>';
    });
    html += '</div>';

    html += '<div style="display:inline-flex;align-items:center;gap:8px;padding:7px 14px;border-radius:99px;background:#7c3aed14;border:1px solid #7c3aed33">';
    html += '<span style="width:6px;height:6px;border-radius:50%;background:#7c3aed;flex-shrink:0;box-shadow:0 0 6px #7c3aed"></span>';
    html += '<span style="font-size:11px;color:#a78bfa;letter-spacing:0.5px">' + story.stageLabel + '</span>';
    html += '</div>';

    html += '</div>';
    html += '</div>';
    return html;
  }

  function quickActions() {
    var actions = [
      { icon: '✨', label: 'Tạo Thế Giới',  sub: 'Khai sinh vũ trụ mới',       fn: "puosGo('worlds')",        c: '#7c3aed' },
      { icon: '🤖', label: 'Hỏi Jarvis',     sub: 'Trợ lý AI của bạn',          fn: "puosGo('jarvis')",        c: '#3b82f6' },
      { icon: '🌌', label: 'Universe Hub',   sub: 'Khám phá đa vũ trụ',         fn: "puosGo('universe-hub')", c: '#8b5cf6' }
    ];

    var html = '<div style="padding:40px 48px 36px">';
    html += '<div style="font-size:10px;color:#334155;letter-spacing:2px;margin-bottom:20px">HÀNH ĐỘNG</div>';
    html += '<div style="display:flex;gap:14px">';

    actions.forEach(function(a) {
      html += '<button onclick="' + a.fn + '" '
        + 'style="flex:1;display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding:20px;'
        + 'border-radius:14px;background:' + a.c + '0a;border:1px solid ' + a.c + '22;cursor:pointer;'
        + 'text-align:left;transition:all 0.18s;font-family:\'Noto Serif SC\',serif" '
        + 'onmouseover="this.style.background=\'' + a.c + '18\';this.style.borderColor=\'' + a.c + '55\'" '
        + 'onmouseout="this.style.background=\'' + a.c + '0a\';this.style.borderColor=\'' + a.c + '22\'">';
      html += '<span style="font-size:22px">' + a.icon + '</span>';
      html += '<span style="font-size:13px;color:#cbd5e1;font-weight:400">' + a.label + '</span>';
      html += '<span style="font-size:11px;color:#334155">' + a.sub + '</span>';
      html += '</button>';
    });

    html += '</div>';
    html += '</div>';
    return html;
  }

  function storyFeed() {
    var html = '<div style="padding:0 48px 60px">';
    html += '<div style="font-size:10px;color:#334155;letter-spacing:2px;margin-bottom:20px">BIÊN NIÊN SỬ</div>';
    html += '<div id="puos-mu-feed">';
    html += '<div style="color:#1e293b;font-size:12px;padding:20px 0">Đang tải...</div>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function renderFeed() {
    setTimeout(function() {
      var el = document.getElementById('puos-mu-feed');
      if (!el) return;

      var events = [];
      try {
        var keys = ['cgv6_historical_timeline', 'cgv6_world_events_v25', 'cgv6_world_event_v25'];
        for (var i = 0; i < keys.length; i++) {
          var d = localStorage.getItem(keys[i]);
          if (d) {
            var p = JSON.parse(d);
            var arr = p.events || p.history || [];
            if (arr.length > 0) { events = arr; break; }
          }
        }
      } catch(e) {}

      if (events.length === 0) {
        el.innerHTML = '<div style="font-size:13px;color:#1e293b;padding:24px 0;font-style:italic">'
          + 'Chưa có ký ức nào. Vũ trụ đang chờ câu chuyện đầu tiên.</div>';
        return;
      }

      var recent = events.slice(-6).reverse();
      el.innerHTML = recent.map(function(ev, idx) {
        var col   = ev.color || '#7c3aed';
        var title = ev.title || ev.content || '';
        var yr    = ev.year  || '?';
        var isLast = idx === recent.length - 1;

        return '<div style="display:flex;gap:20px;padding:16px 0;'
          + (isLast ? '' : 'border-bottom:1px solid #0a1020') + '">'
          + '<div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;padding-top:4px">'
          +   '<div style="width:8px;height:8px;border-radius:50%;background:' + col + ';flex-shrink:0;box-shadow:0 0 5px ' + col + '66"></div>'
          +   (isLast ? '' : '<div style="width:1px;flex:1;background:linear-gradient(' + col + '33,transparent);margin-top:6px"></div>')
          + '</div>'
          + '<div style="flex:1;min-width:0">'
          +   '<div style="font-size:10px;color:#334155;margin-bottom:4px">Năm ' + yr.toLocaleString() + '</div>'
          +   '<div style="font-size:13px;color:#94a3b8;line-height:1.5">' + title + '</div>'
          + '</div>'
          + '</div>';
      }).join('');
    }, 300);
  }

  window.puosRenderMyUniverse = function(container) {
    var story = getWorldStory();

    var html = '<div class="puos-fade">';
    html += heroSection(story);
    html += quickActions();
    html += storyFeed();
    html += '</div>';

    container.innerHTML = html;
    renderFeed();
  };

  console.log('[PUOS My Universe V90] 🪐 My Universe panel sẵn sàng.');
})();
