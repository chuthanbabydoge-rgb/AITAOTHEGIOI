// ═══════════════════════════════════════════════════════════════
// AGE REGISTRY V43 — Creator God World Simulator
// Hub UI · 5 Panel Renders cho Hệ Thống Kỷ Nguyên
// Passive — không save, không tick
// ═══════════════════════════════════════════════════════════════
(function() {
"use strict";

var _activeTab = "current";

// ── Utils ─────────────────────────────────────────────────────
function _setPanel(panelId, html) {
  var el = document.getElementById(panelId);
  if (el) el.innerHTML = html;
}

function _wrap(content) {
  return '<div style="padding:20px;font-family:\'Noto Serif SC\',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">' + content + '</div>';
}

function _card(content, border, bg) {
  return '<div style="background:' + (bg||"#0f172a") + ';border:1px solid ' + (border||"#1e293b") + ';border-radius:10px;padding:14px;margin-bottom:10px">' + content + '</div>';
}

function _bar(pct, color) {
  var w = Math.max(0, Math.min(100, pct||0));
  return '<div style="background:#1e293b;border-radius:4px;height:8px;overflow:hidden">'
    + '<div style="width:' + w + '%;height:100%;background:' + (color||"#8b5cf6") + ';border-radius:4px;transition:width .4s"></div></div>';
}

function _tabBtn(id, label, active, onclick) {
  var isCur = (active === id);
  return '<button onclick="' + onclick + '" style="padding:8px 14px;background:' + (isCur?"#1e293b":"transparent") + ';border:1px solid ' + (isCur?"#8b5cf6":"#1e293b") + ';border-radius:6px;color:' + (isCur?"#a78bfa":"#64748b") + ';cursor:pointer;font-size:12px;font-family:\'Noto Serif SC\',serif">' + label + '</button>';
}

function _tabBar(active) {
  var tabs = [
    { id:"current",    label:"🌀 Kỷ Nguyên",     fn:"waeRenderCurrent()" },
    { id:"history",    label:"📜 Lịch Sử",        fn:"waeRenderHistory()" },
    { id:"transition", label:"⚡ Chuyển Đổi",      fn:"waeRenderTransition()" },
    { id:"events",     label:"🗓️ Sự Kiện",         fn:"waeRenderEvents()" },
    { id:"analytics",  label:"📊 Phân Tích",       fn:"waeRenderAnalytics()" }
  ];
  var html = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px">';
  tabs.forEach(function(t) {
    html += _tabBtn(t.id, t.label, active, t.fn);
  });
  html += '</div>';
  return html;
}

// ── Render: Current Age ───────────────────────────────────────
window.waeRenderCurrent = function() {
  _activeTab = "current";
  var panelId = "panel-age-current-v43";
  var curAge  = window.waeGetCurrentAge ? window.waeGetCurrentAge() : { name:"Hỗn Mang", emoji:"🌀", color:"#94a3b8", desc:"Khởi nguyên." };
  var stats   = window.aanGetStats      ? window.aanGetStats()      : {};
  var forecast= window.aanGetForecast   ? window.aanGetForecast()   : {};
  var scores  = window.apeGetAllScores  ? window.apeGetAllScores()  : {};
  var allAges = window.waeGetAllAges    ? window.waeGetAllAges()    : [];
  var stab    = stats.stability || 0;

  var html = _wrap(
    _tabBar("current")
    + '<div style="background:' + (curAge.bgColor||"rgba(139,92,246,0.08)") + ';border:2px solid ' + (curAge.color||"#8b5cf6") + '44;border-radius:14px;padding:24px;margin-bottom:20px;text-align:center">'
    + '<div style="font-size:56px;margin-bottom:8px">' + (curAge.emoji||"🌀") + '</div>'
    + '<div style="font-size:26px;font-weight:700;color:' + (curAge.color||"#8b5cf6") + ';font-family:Cinzel,serif;margin-bottom:6px">' + (curAge.name||"Không rõ") + '</div>'
    + '<div style="font-size:13px;color:#94a3b8;max-width:500px;margin:0 auto">' + (curAge.desc||"") + '</div>'
    + '</div>'

    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:20px">'
    + _statBox("⏱️ Thời Gian", (stats.currentDuration||0) + " năm", "#8b5cf6")
    + _statBox("🔄 Chuyển Đổi", (stats.totalTransitions||0), "#06b6d4")
    + _statBox("🛡️ Ổn Định", stab + "%", stab>70?"#10b981":stab>40?"#fbbf24":"#ef4444")
    + _statBox("⚡ Sự Kiện", (stats.totalFiredEvents||0), "#f97316")
    + '</div>'

    + _card(
        '<div style="font-size:13px;color:#fbbf24;font-weight:600;margin-bottom:8px">🔮 Dự Báo Kỷ Nguyên Tiếp Theo</div>'
        + (forecast.nextAge ? (function(){
            var nx = window.waeGetAgeData ? window.waeGetAgeData(forecast.nextAge) : null;
            var nm = nx ? (nx.emoji + " " + nx.name) : forecast.nextAge;
            var co = nx ? nx.color : "#94a3b8";
            return '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
              + '<span style="color:' + co + ';font-size:15px;font-weight:600">' + nm + '</span>'
              + '<span style="color:#64748b;font-size:12px">' + (forecast.confidence||0) + '% sẵn sàng</span>'
              + '</div>'
              + _bar(forecast.confidence, co);
          })() : '<div style="color:#475569;font-size:13px">Chưa xác định được kỷ nguyên tiếp theo.</div>'),
        "#fbbf2444"
      )

    + '<div style="font-size:13px;color:#64748b;margin-bottom:10px;font-weight:600">⚡ Ảnh Hưởng Kỷ Nguyên</div>'
    + (function() {
        var eff = curAge.effects || {};
        var html2 = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px">';
        Object.keys(eff).forEach(function(k) {
          var v = eff[k];
          var pos = v > 0;
          html2 += '<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px">'
            + '<div style="font-size:11px;color:#475569;margin-bottom:4px">' + k + '</div>'
            + '<div style="font-size:16px;font-weight:700;color:' + (pos?"#10b981":"#ef4444") + '">'
            + (pos?"+":"") + (typeof v === "number" ? (v > 1 ? "×"+v : (v*100).toFixed(0)+"%" ) : v)
            + '</div></div>';
        });
        html2 += '</div>';
        return html2;
      })()

    + '<div style="margin-top:20px">'
    + '<div style="font-size:13px;color:#64748b;margin-bottom:10px;font-weight:600">🗺️ Tổng Quan 12 Kỷ Nguyên</div>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:6px">'
    + allAges.map(function(age) {
        var isCur = age.id === (curAge.id||"CHAOS");
        var sc    = scores[age.id] || 0;
        return '<div onclick="waeForceAge&&waeForceAge(\''+age.id+'\');waeRenderCurrent()" style="background:' + (isCur?"rgba(139,92,246,0.15)":"#0f172a") + ';border:1px solid ' + (isCur?age.color+"88":"#1e293b") + ';border-radius:8px;padding:8px;cursor:pointer;text-align:center;transition:all .2s">'
          + '<div style="font-size:20px">' + age.emoji + '</div>'
          + '<div style="font-size:10px;color:' + (isCur?age.color:"#94a3b8") + ';margin-top:2px;font-weight:' + (isCur?"700":"400") + '">' + age.name.replace("Thời Đại ","") + '</div>'
          + '<div style="font-size:9px;color:#475569;margin-top:2px">' + sc + '%</div>'
          + _bar(sc, age.color)
          + '</div>';
      }).join("")
    + '</div></div>'
  );
  _setPanel(panelId, html);
};

// ── Render: History ───────────────────────────────────────────
window.waeRenderHistory = function() {
  _activeTab = "history";
  var panelId = "panel-age-history-v43";
  var history = window.waeGetHistory ? window.waeGetHistory() : [];

  var html = _wrap(
    _tabBar("history")
    + '<h3 style="margin:0 0 16px;font-size:18px;color:#8b5cf6;font-family:Cinzel,serif">📜 Lịch Sử Chuyển Đổi Kỷ Nguyên</h3>'
    + (history.length === 0
        ? '<div style="text-align:center;color:#475569;padding:40px">Chưa có chuyển đổi kỷ nguyên nào.</div>'
        : history.slice().reverse().map(function(ev) {
            var fromAge = window.waeGetAgeData ? window.waeGetAgeData(ev.from) : null;
            var toAge   = window.waeGetAgeData ? window.waeGetAgeData(ev.to)   : null;
            var toColor = toAge ? toAge.color : "#8b5cf6";
            return _card(
              '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">'
              + '<div style="font-size:22px">' + (toAge ? toAge.emoji : "🌀") + '</div>'
              + '<div style="flex:1">'
              + '<div style="font-size:14px;font-weight:600;color:' + toColor + '">' + (ev.label || ev.to) + '</div>'
              + '<div style="font-size:11px;color:#64748b;margin-top:3px">Năm ' + ev.year + (ev.manual ? ' · ✋ Thủ Công' : ' · 🤖 Tự Động') + '</div>'
              + '</div></div>',
              toColor + "44"
            );
          }).join("")
      )
  );
  _setPanel(panelId, html);
};

// ── Render: Transition ────────────────────────────────────────
window.waeRenderTransition = function() {
  _activeTab = "transition";
  var panelId = "panel-age-transition-v43";
  var allAges = window.waeGetAllAges    ? window.waeGetAllAges()    : [];
  var curId   = window.waeGetCurrentAge ? window.waeGetCurrentAge().id : "CHAOS";
  var curAge  = window.waeGetCurrentAge ? window.waeGetCurrentAge() : {};

  var html = _wrap(
    _tabBar("transition")
    + '<h3 style="margin:0 0 6px;font-size:18px;color:#06b6d4;font-family:Cinzel,serif">⚡ Điều Kiện Chuyển Đổi</h3>'
    + '<div style="font-size:12px;color:#475569;margin-bottom:16px">Kỷ nguyên hiện tại: ' + (curAge.emoji||"🌀") + ' <strong style="color:' + (curAge.color||"#8b5cf6") + '">' + (curAge.name||"Không rõ") + '</strong></div>'

    + '<div style="margin-bottom:20px">'
    + '<div style="font-size:13px;color:#fbbf24;margin-bottom:10px;font-weight:600">⚡ Kỷ Nguyên Tiếp Theo Có Thể</div>'
    + (curAge.nextAges||[]).map(function(nextId) {
        var nextAge = window.waeGetAgeData ? window.waeGetAgeData(nextId) : null;
        if (!nextAge) return "";
        var conditions = window.apeGetConditionDetail ? window.apeGetConditionDetail(nextId) : [];
        var overallPct = window.apeGetProgress ? window.apeGetProgress(nextId) : 0;
        return '<div style="background:#0f172a;border:1px solid ' + nextAge.color + '44;border-radius:10px;padding:14px;margin-bottom:10px">'
          + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">'
          + '<div style="font-size:16px;font-weight:600;color:' + nextAge.color + '">' + nextAge.emoji + ' ' + nextAge.name + '</div>'
          + '<div style="font-size:14px;color:' + (overallPct>=80?"#10b981":overallPct>=50?"#fbbf24":"#ef4444") + ';font-weight:700">' + overallPct + '%</div>'
          + '</div>'
          + _bar(overallPct, nextAge.color)
          + '<div style="margin-top:10px">'
          + (conditions.length === 0
              ? '<div style="font-size:11px;color:#475569">Không có điều kiện cụ thể.</div>'
              : conditions.map(function(c) {
                  return '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">'
                    + '<span style="font-size:11px;color:#94a3b8">' + _condLabel(c.key) + '</span>'
                    + '<span style="font-size:11px;color:' + (c.met?"#10b981":"#64748b") + '">' + c.current + ' / ' + c.required + ' ' + (c.met?"✅":"❌") + '</span>'
                    + '</div>'
                    + _bar(c.pct, c.met?"#10b981":"#8b5cf6");
                }).join("")
            )
          + '</div>'
          + '<div style="margin-top:10px;font-size:11px;color:#475569">' + (nextAge.transitionHint||"") + '</div>'
          + '<button onclick="waeForceAge&&waeForceAge(\''+nextId+'\');waeRenderCurrent()" style="margin-top:10px;padding:6px 14px;background:#1e293b;border:1px solid ' + nextAge.color + '66;border-radius:6px;color:' + nextAge.color + ';cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif">✋ Chuyển Ngay</button>'
          + '</div>';
      }).join("")
    + '</div>'

    + '<div style="border-top:1px solid #1e293b;padding-top:16px">'
    + '<div style="font-size:13px;color:#64748b;margin-bottom:10px;font-weight:600">📊 Điểm Sẵn Sàng Tất Cả Kỷ Nguyên</div>'
    + allAges.map(function(age) {
        var sc = window.apeGetProgress ? window.apeGetProgress(age.id) : 0;
        var isCur = age.id === curId;
        return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">'
          + '<span style="width:24px;text-align:center">' + age.emoji + '</span>'
          + '<span style="width:140px;font-size:11px;color:' + (isCur?age.color:"#94a3b8") + '">' + age.name.replace("Thời Đại ","") + (isCur?" ←":"") + '</span>'
          + '<div style="flex:1">' + _bar(sc, age.color) + '</div>'
          + '<span style="width:36px;text-align:right;font-size:11px;color:#64748b">' + sc + '%</span>'
          + '</div>';
      }).join("")
    + '</div>'
  );
  _setPanel(panelId, html);
};

// ── Render: Events ────────────────────────────────────────────
window.waeRenderEvents = function() {
  _activeTab = "events";
  var panelId = "panel-age-events-v43";
  var events  = window.aeeGetRecentEvents ? window.aeeGetRecentEvents(30) : [];
  var curAge  = window.waeGetCurrentAge ? window.waeGetCurrentAge() : {};

  var html = _wrap(
    _tabBar("events")
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">'
    + '<h3 style="margin:0;font-size:18px;color:#f97316;font-family:Cinzel,serif">🗓️ Sự Kiện Kỷ Nguyên</h3>'
    + '<button onclick="aeeFireCurrentAgeEvent&&aeeFireCurrentAgeEvent();waeRenderEvents()" style="padding:8px 16px;background:#1e293b;border:1px solid #f9741644;border-radius:8px;color:#f97316;cursor:pointer;font-size:12px;font-family:\'Noto Serif SC\',serif">⚡ Kích Hoạt Sự Kiện</button>'
    + '</div>'
    + (events.length === 0
        ? '<div style="text-align:center;color:#475569;padding:40px">Chưa có sự kiện nào. Nhấn "Kích Hoạt Sự Kiện" để bắt đầu.</div>'
        : events.map(function(ev) {
            var ageData = window.waeGetAgeData ? window.waeGetAgeData(ev.age) : null;
            var co = ev.color || (ageData ? ageData.color : "#8b5cf6");
            return _card(
              '<div style="display:flex;gap:10px;align-items:flex-start">'
              + '<div style="font-size:24px;flex-shrink:0">' + (ageData ? ageData.emoji : "⚡") + '</div>'
              + '<div style="flex:1">'
              + '<div style="font-size:14px;font-weight:600;color:' + co + '">' + ev.title + '</div>'
              + '<div style="font-size:12px;color:#94a3b8;margin-top:4px">' + ev.desc + '</div>'
              + '<div style="font-size:10px;color:#475569;margin-top:6px">'
              + (ageData ? ageData.name : ev.age) + ' · Năm ' + ev.year
              + '</div></div></div>',
              co + "44"
            );
          }).join("")
      )
  );
  _setPanel(panelId, html);
};

// ── Render: Analytics ─────────────────────────────────────────
window.waeRenderAnalytics = function() {
  _activeTab = "analytics";
  var panelId = "panel-age-analytics-v43";
  var stats   = window.aanGetStats    ? window.aanGetStats()    : {};
  var forecast= window.aanGetForecast ? window.aanGetForecast() : {};
  var snaps   = window.aanGetSnapshots? window.aanGetSnapshots(): [];
  var allAges = window.waeGetAllAges  ? window.waeGetAllAges()  : [];

  var stab = stats.stability || 0;
  var stabColor = stab > 70 ? "#10b981" : stab > 40 ? "#fbbf24" : "#ef4444";
  var stabLabel = stab > 70 ? "Ổn Định" : stab > 40 ? "Bất Ổn" : "Khủng Hoảng";

  var html = _wrap(
    _tabBar("analytics")
    + '<h3 style="margin:0 0 16px;font-size:18px;color:#06b6d4;font-family:Cinzel,serif">📊 Phân Tích Kỷ Nguyên</h3>'

    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:20px">'
    + _statBox("🛡️ Ổn Định", stab + "% " + stabLabel, stabColor)
    + _statBox("⏱️ Thời Gian HT", (stats.currentDuration||0) + " năm", "#8b5cf6")
    + _statBox("🔄 Lịch Sử", (stats.totalTransitions||0) + " lần", "#06b6d4")
    + _statBox("⚡ Tổng Sự Kiện", (stats.totalFiredEvents||0), "#f97316")
    + '</div>'

    + _card(
        '<div style="font-size:13px;color:#fbbf24;font-weight:600;margin-bottom:10px">🔮 Dự Báo Kỷ Nguyên Tiếp Theo</div>'
        + (forecast.nextAge ? (function(){
            var nx = window.waeGetAgeData ? window.waeGetAgeData(forecast.nextAge) : null;
            return (nx ? '<div style="font-size:16px;font-weight:600;color:' + nx.color + ';margin-bottom:8px">' + nx.emoji + ' ' + nx.name + '</div>' : "")
              + '<div style="font-size:12px;color:#64748b;margin-bottom:6px">Độ tin cậy: ' + forecast.confidence + '%</div>'
              + _bar(forecast.confidence, nx ? nx.color : "#8b5cf6");
          })() : '<div style="color:#475569;font-size:13px">Chưa dự báo được.</div>'),
        "#fbbf2444"
      )

    + _card(
        '<div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:10px">⏱️ Thời Gian Từng Kỷ Nguyên</div>'
        + allAges.map(function(age) {
            var dur = (stats.durationByAge||{})[age.id] || 0;
            if (dur === 0) return "";
            var maxDur = Math.max.apply(null, allAges.map(function(a){ return (stats.durationByAge||{})[a.id]||0; })) || 1;
            return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'
              + '<span style="font-size:14px">' + age.emoji + '</span>'
              + '<span style="font-size:11px;color:#94a3b8;width:120px">' + age.name.replace("Thời Đại ","") + '</span>'
              + '<div style="flex:1">' + _bar(Math.round((dur/maxDur)*100), age.color) + '</div>'
              + '<span style="font-size:10px;color:#475569;width:40px;text-align:right">' + dur + 'n</span>'
              + '</div>';
          }).join("") || '<div style="font-size:12px;color:#475569">Chưa có dữ liệu.</div>',
        "#1e293b"
      )

    + (snaps.length > 0 ? _card(
        '<div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:10px">🧪 Snapshot Gần Nhất</div>'
        + '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11px">'
        + '<tr style="color:#475569"><th style="padding:4px 8px;text-align:left">Năm</th><th style="padding:4px 8px;text-align:left">Kỷ Nguyên</th><th style="padding:4px 8px;text-align:right">Ổn Định</th><th style="padding:4px 8px;text-align:right">Dân Số</th></tr>'
        + snaps.slice().reverse().map(function(s) {
            var age = window.waeGetAgeData ? window.waeGetAgeData(s.age) : null;
            return '<tr style="border-top:1px solid #1e293b">'
              + '<td style="padding:4px 8px;color:#64748b">' + s.year + '</td>'
              + '<td style="padding:4px 8px;color:' + (age?age.color:"#94a3b8") + '">' + (age?age.emoji+" "+age.name:s.age) + '</td>'
              + '<td style="padding:4px 8px;text-align:right;color:' + (s.stability>70?"#10b981":s.stability>40?"#fbbf24":"#ef4444") + '">' + s.stability + '%</td>'
              + '<td style="padding:4px 8px;text-align:right;color:#64748b">' + (s.pop||0).toLocaleString() + '</td>'
              + '</tr>';
          }).join("")
        + '</table></div>',
        "#1e293b"
      ) : "")
  );
  _setPanel(panelId, html);
};

// ── Hub Widget (injected into mvHubRenderPanel) ───────────────
window.waeHubRenderPanel = function() {
  var curAge  = window.waeGetCurrentAge ? window.waeGetCurrentAge() : { name:"Hỗn Mang", emoji:"🌀", color:"#94a3b8" };
  var stats   = window.aanGetStats      ? window.aanGetStats()      : {};
  var hist    = window.waeGetHistory    ? window.waeGetHistory()     : [];
  var stab    = stats.stability || 0;
  var dur     = stats.currentDuration   || 0;
  var evTotal = stats.totalFiredEvents  || 0;
  return '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:14px">'
    + '<div style="background:#0f172a;border:1px solid ' + (curAge.color||"#8b5cf6") + '44;border-radius:8px;padding:10px;text-align:center">'
    + '<div style="font-size:24px">' + (curAge.emoji||"🌀") + '</div>'
    + '<div style="font-size:10px;color:' + (curAge.color||"#8b5cf6") + ';margin-top:2px">' + (curAge.name||"Không rõ") + '</div>'
    + '</div>'
    + '<div style="background:#0f172a;border:1px solid #8b5cf644;border-radius:8px;padding:10px;text-align:center">'
    + '<div style="font-size:18px;font-weight:700;color:#8b5cf6">' + dur + '</div><div style="font-size:9px;color:#64748b">Năm Tồn Tại</div></div>'
    + '<div style="background:#0f172a;border:1px solid #06b6d444;border-radius:8px;padding:10px;text-align:center">'
    + '<div style="font-size:18px;font-weight:700;color:#06b6d4">' + hist.length + '</div><div style="font-size:9px;color:#64748b">Chuyển Đổi</div></div>'
    + '<div style="background:#0f172a;border:1px solid ' + (stab>70?"#10b98144":stab>40?"#fbbf2444":"#ef444444") + ';border-radius:8px;padding:10px;text-align:center">'
    + '<div style="font-size:18px;font-weight:700;color:' + (stab>70?"#10b981":stab>40?"#fbbf24":"#ef4444") + '">' + stab + '%</div>'
    + '<div style="font-size:9px;color:#64748b">Ổn Định</div></div>'
    + '</div>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px">'
    + '<button onclick="showPanel(\'panel-age-current-v43\');waeRenderCurrent&&waeRenderCurrent()" style="padding:12px;background:#0f172a;border:1px solid #8b5cf688;border-radius:10px;color:#a78bfa;cursor:pointer;font-size:12px;font-family:\'Noto Serif SC\',serif;text-align:left">🌀 <strong>Kỷ Nguyên</strong><div style="font-size:10px;color:#475569;margin-top:3px">Hiện tại · Ảnh hưởng · Bản đồ</div></button>'
    + '<button onclick="showPanel(\'panel-age-history-v43\');waeRenderHistory&&waeRenderHistory()" style="padding:12px;background:#0f172a;border:1px solid #06b6d488;border-radius:10px;color:#06b6d4;cursor:pointer;font-size:12px;font-family:\'Noto Serif SC\',serif;text-align:left">📜 <strong>Lịch Sử</strong><div style="font-size:10px;color:#475569;margin-top:3px">Biên niên · Chuyển đổi</div></button>'
    + '<button onclick="showPanel(\'panel-age-transition-v43\');waeRenderTransition&&waeRenderTransition()" style="padding:12px;background:#0f172a;border:1px solid #fbbf2488;border-radius:10px;color:#fbbf24;cursor:pointer;font-size:12px;font-family:\'Noto Serif SC\',serif;text-align:left">⚡ <strong>Chuyển Đổi</strong><div style="font-size:10px;color:#475569;margin-top:3px">Điều kiện · Tiến trình</div></button>'
    + '<button onclick="showPanel(\'panel-age-events-v43\');waeRenderEvents&&waeRenderEvents()" style="padding:12px;background:#0f172a;border:1px solid #f9741688;border-radius:10px;color:#f97316;cursor:pointer;font-size:12px;font-family:\'Noto Serif SC\',serif;text-align:left">🗓️ <strong>Sự Kiện</strong><div style="font-size:10px;color:#475569;margin-top:3px">Sự kiện · Lịch sử</div></button>'
    + '<button onclick="showPanel(\'panel-age-analytics-v43\');waeRenderAnalytics&&waeRenderAnalytics()" style="padding:12px;background:#0f172a;border:1px solid #34d39988;border-radius:10px;color:#34d399;cursor:pointer;font-size:12px;font-family:\'Noto Serif SC\',serif;text-align:left">📊 <strong>Phân Tích</strong><div style="font-size:10px;color:#475569;margin-top:3px">Thống kê · Dự báo</div></button>'
    + '</div>';
};

// ── Helper: stat box ─────────────────────────────────────────
function _statBox(label, value, color) {
  return '<div style="background:#0f172a;border:1px solid ' + (color||"#8b5cf6") + '44;border-radius:8px;padding:12px;text-align:center">'
    + '<div style="font-size:20px;font-weight:700;color:' + (color||"#8b5cf6") + '">' + value + '</div>'
    + '<div style="font-size:10px;color:#64748b;margin-top:3px">' + label + '</div></div>';
}

// ── Helper: condition label ───────────────────────────────────
function _condLabel(k) {
  var map = { population:"Dân Số", nations:"Quốc Gia", empires:"Đế Quốc", universes:"Vũ Trụ", portals:"Cổng Portal", gods:"Thần Linh", civs:"Nền Văn Minh", wars:"Chiến Tranh" };
  return map[k] || k;
}

// ── Init ─────────────────────────────────────────────────────
function init() {
  console.log("[AgeRegistry V43] 🗂️ Age Hub UI khởi động — 5 panels: Kỷ Nguyên · Lịch Sử · Chuyển Đổi · Sự Kiện · Phân Tích.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 3300); });
} else {
  setTimeout(init, 3300);
}
})();
