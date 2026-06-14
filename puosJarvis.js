(function() {
  "use strict";

  var CHAT_HISTORY = [];
  var IS_TYPING = false;

  var SHORTCUTS = [
    { label: '🌍 Phân tích thế giới', query: 'Phân tích trạng thái thế giới hiện tại của tôi' },
    { label: '📊 Sức khỏe vũ trụ',    query: 'Vũ trụ của tôi đang ở trạng thái sức khỏe như thế nào?' },
    { label: '⚔️ Tình hình chiến tranh', query: 'Tóm tắt tình hình chiến tranh và xung đột hiện tại' },
    { label: '🏛 Văn minh mạnh nhất', query: 'Văn minh nào đang mạnh nhất và tại sao?' },
    { label: '✨ Gợi ý hành động',     query: 'Tôi nên làm gì tiếp theo với tư cách là một vị thần?' },
    { label: '🤖 Tạo thế giới mới',    query: 'Hãy gợi ý ý tưởng cho một thế giới mới thú vị' }
  ];

  var NAV_COMMANDS = {
    'map': function() { puosOpenClassicPanel('worldmap'); },
    'bản đồ': function() { puosOpenClassicPanel('worldmap'); },
    'tạo thế giới': function() { puosGo('worlds'); },
    'worlds': function() { puosGo('worlds'); },
    'civilization': function() { puosGo('civilization'); },
    'văn minh': function() { puosGo('civilization'); },
    'universe hub': function() { puosGo('universe-hub'); },
    'settings': function() { puosGo('settings'); },
    'cài đặt': function() { puosGo('settings'); },
    'xr': function() { puosOpenClassicPanel('panel-creator-hub-v32'); },
    'backup': function() { if (typeof be87ForceBackupNow === 'function') { be87ForceBackupNow(); return 'Đã tạo backup!'; } },
    'classic': function() { puosClassicToggle(); }
  };

  window.puosRenderJarvis = function(container) {
    var html = '<div class="puos-fade" style="height:100%;display:flex;flex-direction:column">';

    html += '<div style="padding:24px 32px 0;flex-shrink:0">';
    html += '<div style="font-size:10px;color:#3b82f6;letter-spacing:3px;margin-bottom:6px">JARVIS AI</div>';
    html += '<h1 style="font-size:22px;color:#e2e8f0;margin:0 0 4px;font-weight:400">🤖 Jarvis</h1>';
    html += '<div style="font-size:12px;color:#4a5568;margin-bottom:20px">Trợ lý AI của vị thần — hỏi bất cứ điều gì về vũ trụ</div>';
    html += '</div>';

    html += '<div style="padding:0 32px;flex-shrink:0;margin-bottom:16px">';
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
    SHORTCUTS.forEach(function(s) {
      html += '<button onclick="puosJarvisAsk(' + JSON.stringify(s.query) + ')" ';
      html += 'style="padding:6px 12px;background:#3b82f614;border:1px solid #3b82f633;border-radius:20px;color:#3b82f6;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif;white-space:nowrap">' + s.label + '</button>';
    });
    html += '</div></div>';

    html += '<div id="puos-jarvis-chat" style="flex:1;overflow-y:auto;padding:0 32px;margin-bottom:16px">';
    if (CHAT_HISTORY.length === 0) {
      html += '<div style="text-align:center;padding:60px 20px;color:#1e293b">';
      html += '<div style="font-size:40px;margin-bottom:12px">🤖</div>';
      html += '<div style="font-size:14px;color:#334155">Xin chào! Tôi là Jarvis, trợ lý AI của vũ trụ.</div>';
      html += '<div style="font-size:12px;color:#1e293b;margin-top:6px">Hỏi tôi bất cứ điều gì về thế giới của bạn.</div>';
      html += '</div>';
    } else {
      CHAT_HISTORY.forEach(function(msg) {
        html += renderMessage(msg);
      });
    }
    html += '</div>';

    html += '<div style="padding:0 32px 24px;flex-shrink:0">';
    html += '<div style="display:flex;gap:10px;background:#0d1117;border:1px solid #1e293b;border-radius:12px;padding:12px">';
    html += '<textarea id="puos-jarvis-input" placeholder="Hỏi Jarvis về thế giới của bạn..." ';
    html += 'style="flex:1;background:transparent;border:none;color:#e2e8f0;font-size:13px;font-family:\'Noto Serif SC\',serif;resize:none;height:48px;outline:none" ';
    html += 'onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();puosJarvisSend()}">';
    html += '</textarea>';
    html += '<button onclick="puosJarvisSend()" id="puos-jarvis-send" style="width:40px;height:40px;background:#3b82f6;border:none;border-radius:8px;color:#fff;cursor:pointer;font-size:16px;flex-shrink:0;align-self:flex-end">↑</button>';
    html += '</div>';
    html += '<div style="font-size:10px;color:#1e293b;text-align:center;margin-top:6px">Enter để gửi · Shift+Enter xuống dòng · Nhập lệnh điều hướng như "map", "worlds", "xr"</div>';
    html += '</div>';

    html += '</div>';
    container.innerHTML = html;
    scrollToBottom();
  };

  function renderMessage(msg) {
    var isUser = msg.role === 'user';
    var html = '<div style="display:flex;gap:10px;margin-bottom:14px;' + (isUser ? 'justify-content:flex-end' : '') + '">';
    if (!isUser) {
      html += '<div style="width:28px;height:28px;border-radius:50%;background:#3b82f622;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0">🤖</div>';
    }
    html += '<div style="max-width:70%;padding:10px 14px;border-radius:10px;font-size:13px;line-height:1.6;' +
      (isUser ? 'background:#7c3aed22;border:1px solid #7c3aed33;color:#c4b5fd' : 'background:#0d1117;border:1px solid #1e293b;color:#cbd5e1') + '">';
    html += (msg.content || '').replace(/\n/g, '<br>');
    html += '</div>';
    if (isUser) {
      html += '<div style="width:28px;height:28px;border-radius:50%;background:#7c3aed22;display:flex;align-items:center;justify-content:circle;font-size:12px;flex-shrink:0;justify-content:center">⭕</div>';
    }
    html += '</div>';
    return html;
  }

  window.puosJarvisAsk = function(query) {
    var input = document.getElementById('puos-jarvis-input');
    if (input) input.value = query;
    puosJarvisSend();
  };

  window.puosJarvisSend = function() {
    if (IS_TYPING) return;
    var input = document.getElementById('puos-jarvis-input');
    if (!input) return;
    var query = input.value.trim();
    if (!query) return;
    input.value = '';

    for (var cmd in NAV_COMMANDS) {
      if (query.toLowerCase().indexOf(cmd) !== -1) {
        var result = NAV_COMMANDS[cmd]();
        if (result) {
          CHAT_HISTORY.push({ role: 'user', content: query });
          CHAT_HISTORY.push({ role: 'assistant', content: '✅ ' + result });
          var main = document.getElementById('puos-main');
          if (main) puosRenderJarvis(main);
        }
        return;
      }
    }

    CHAT_HISTORY.push({ role: 'user', content: query });
    var main = document.getElementById('puos-main');
    if (main) puosRenderJarvis(main);

    IS_TYPING = true;
    var sendBtn = document.getElementById('puos-jarvis-send');
    if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = '...'; }

    var context = buildWorldContext();
    var systemPrompt = 'Bạn là Jarvis — trợ lý AI của một vị thần sáng tạo trong game Creator God V6. ' +
      'Bạn biết mọi thứ về vũ trụ và thế giới của người dùng. ' +
      'Trả lời ngắn gọn, sâu sắc, và hữu ích bằng tiếng Việt. ' +
      'Trạng thái vũ trụ hiện tại: ' + context;

    if (typeof window.aiCall === 'function') {
      window.aiCall({ system: systemPrompt, prompt: query, maxTokens: 500 })
        .then(function(resp) {
          CHAT_HISTORY.push({ role: 'assistant', content: resp || 'Jarvis không thể trả lời lúc này.' });
          IS_TYPING = false;
          var m = document.getElementById('puos-main');
          if (m) puosRenderJarvis(m);
        })
        .catch(function(e) {
          CHAT_HISTORY.push({ role: 'assistant', content: '⚠️ ' + buildFallbackResponse(query) });
          IS_TYPING = false;
          var m = document.getElementById('puos-main');
          if (m) puosRenderJarvis(m);
        });
    } else {
      setTimeout(function() {
        CHAT_HISTORY.push({ role: 'assistant', content: buildFallbackResponse(query) });
        IS_TYPING = false;
        var m = document.getElementById('puos-main');
        if (m) puosRenderJarvis(m);
      }, 800);
    }
  };

  function buildWorldContext() {
    var yr = window.year || 1;
    var npcs = (window.npcs || []).length;
    var ctrs = (window.countries || []).length;
    var wars = (window.warsActive || []).length;
    return 'Năm ' + yr + ' · ' + ctrs + ' quốc gia · ' + npcs + ' NPC · ' + wars + ' chiến tranh đang diễn ra';
  }

  function buildFallbackResponse(query) {
    var q = query.toLowerCase();
    var yr = window.year || 1;
    var ctrs = window.countries || [];
    var npcs = window.npcs || [];
    var wars = window.warsActive || [];

    if (q.indexOf('chiến') !== -1 || q.indexOf('war') !== -1) {
      return wars.length === 0
        ? 'Vũ trụ đang trong giai đoạn hòa bình. ' + ctrs.length + ' thế lực đang phát triển mà không có xung đột lớn.'
        : 'Hiện tại có ' + wars.length + ' cuộc chiến đang diễn ra. Các thế lực đang trong giai đoạn biến động mạnh.';
    }
    if (q.indexOf('sức khỏe') !== -1 || q.indexOf('health') !== -1) {
      return 'Vũ trụ năm ' + yr + ' đang ở trạng thái ổn định với ' + ctrs.length + ' văn minh và ' + npcs.length + ' sinh linh.';
    }
    if (q.indexOf('gợi ý') !== -1 || q.indexOf('tiếp theo') !== -1) {
      return 'Với tư cách là vị thần, bạn có thể: (1) Can thiệp vào một cuộc chiến để định hướng lịch sử, (2) Tạo thiên tai để thử thách văn minh, (3) Phong thánh cho một NPC để tạo tôn giáo mới, (4) Mở XR để quan sát thế giới từ góc nhìn thực tế ảo.';
    }
    return 'Thế giới của bạn đang ở năm ' + yr + ' với ' + ctrs.length + ' văn minh và ' + npcs.length + ' sinh linh. API AI cần được kết nối để nhận phân tích chi tiết hơn.';
  }

  function scrollToBottom() {
    setTimeout(function() {
      var chat = document.getElementById('puos-jarvis-chat');
      if (chat) chat.scrollTop = chat.scrollHeight;
    }, 100);
  }

  console.log('[PUOS Jarvis V90] 🤖 Jarvis panel sẵn sàng — Claude AI bridge · Command routing.');
})();
