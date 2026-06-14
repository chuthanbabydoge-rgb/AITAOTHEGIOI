(function() {
  "use strict";

  var SAVE_KEY = "cgv6_jarvis_observer_v92";

  window.jovV92Data = {
    observations: [],
    totalObservations: 0,
    lastObsYear: 0
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.jovV92Data)); } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.jovV92Data = JSON.parse(d);
    } catch(e) {}
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function buildObservation(toYear, fromYear) {
    if (!window.world || !window.world.name) return null;

    var wn = window.world.name;
    var npcs = (window.npcs || []).length;
    var ctrs = (window.countries || []).length;
    var wars = (window.warsActive || []).length;
    var recentEvs = typeof window.aeeV92GetRecentEvents === 'function' ? window.aeeV92GetRecentEvents(3) : [];

    var parts = [];

    var openers = [
      'Trong năm ' + fromYear + ' vừa qua của [' + wn + '],',
      'Thiên Đạo ghi nhận — năm ' + fromYear + ' của [' + wn + ']:',
      'Biên niên sử ghi lại năm ' + fromYear + ' — [' + wn + ']:',
      'Quan sát thế giới [' + wn + '] năm ' + fromYear + ':'
    ];
    parts.push(pickRandom(openers));

    if (npcs === 0 && ctrs === 0) {
      parts.push('Thế giới vẫn đang trong trạng thái sơ khai, chưa có sinh linh hay văn minh.');
    } else {
      if (npcs > 0) {
        var lifeDesc = npcs < 10 ? 'Những sinh linh đầu tiên đang dần hình thành.' :
                       npcs < 50 ? 'Có ' + npcs + ' sinh linh đang tồn tại và phát triển.' :
                       'Dân số ' + npcs + ' sinh linh — thế giới đang sôi động.';
        parts.push(lifeDesc);
      }
      if (ctrs > 0) {
        var civDesc = ctrs === 1 ? 'Một nền văn minh đơn độc đang xây dựng tương lai.' :
                      ctrs < 5 ? ctrs + ' quốc gia đang hình thành các mối quan hệ phức tạp.' :
                      ctrs + ' thế lực đang tranh giành ảnh hưởng trên toàn cõi.';
        parts.push(civDesc);
      }
      if (wars > 0) {
        parts.push('⚔️ ' + wars + ' cuộc xung đột đang diễn ra — máu và lửa vẫn còn đó.');
      } else if (ctrs > 1) {
        parts.push('☮️ Hòa bình đang ngự trị — nhưng bình yên hiếm khi kéo dài mãi.');
      }
    }

    if (recentEvs.length > 0) {
      parts.push('Sự kiện nổi bật: ' + recentEvs[0].icon + ' ' + recentEvs[0].title + '.');
    }

    var closers = [
      'Năm ' + toYear + ' bắt đầu — hành trình của [' + wn + '] vẫn tiếp tục.',
      'Thế giới không ngừng tiến hóa trong năm ' + toYear + '.',
      'Thiên Đạo chứng kiến tất cả — [' + wn + '] sẽ tiếp tục viết lịch sử.',
      'Vũ trụ chưa bao giờ đứng yên — năm ' + toYear + ' sẽ mang đến điều bất ngờ.'
    ];
    parts.push(pickRandom(closers));

    return parts.join(' ');
  }

  window.jovV92GetLatest = function() {
    return window.jovV92Data.observations[0] || null;
  };

  window.jovV92GetAll = function() {
    return window.jovV92Data.observations;
  };

  function onYearChange(toYear, fromYear) {
    if (!window.world || !window.world.name) return;
    if (!fromYear || fromYear === 0) return;

    var text = buildObservation(toYear, fromYear);
    if (!text) return;

    var obs = {
      toYear: toYear,
      fromYear: fromYear,
      text: text,
      worldName: (window.world && window.world.name) || '',
      timestamp: Date.now()
    };

    window.jovV92Data.observations.unshift(obs);
    if (window.jovV92Data.observations.length > 100) window.jovV92Data.observations.pop();
    window.jovV92Data.totalObservations++;
    window.jovV92Data.lastObsYear = toYear;
    save();
  }

  window.jovV92RenderHTML = function() {
    var obs = window.jovV92Data.observations;
    if (!obs || !obs.length) {
      return '<div style="color:#475569;text-align:center;padding:24px;font-style:italic;font-size:13px;">Jarvis đang theo dõi thế giới... quan sát sẽ xuất hiện khi năm đầu tiên kết thúc.</div>';
    }
    var html = '';
    obs.slice(0, 15).forEach(function(o) {
      html += '<div style="padding:14px;margin-bottom:10px;background:rgba(59,130,246,0.04);border:1px solid rgba(59,130,246,0.1);border-radius:8px;">';
      html += '<div style="font-size:11px;color:#3b82f6;margin-bottom:6px;display:flex;align-items:center;gap:6px;">';
      html += '<span>🤖 JARVIS</span><span style="color:#1e3a5f;">·</span><span>Năm ' + o.fromYear + ' → ' + o.toYear + '</span>';
      html += '</div>';
      html += '<div style="font-size:13px;color:#94a3b8;line-height:1.6;">' + o.text + '</div>';
      html += '</div>';
    });
    return html;
  };

  function init() {
    load();
    if (typeof window.wacV92AddListener === 'function') {
      window.wacV92AddListener(onYearChange);
    }
    console.log("[JarvisObserver V92] 🤖 Jarvis Observer khởi động — tường thuật lịch sử tự động theo năm.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 24500); });
  } else {
    setTimeout(init, 24500);
  }
})();
