(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // EVENT GENERATOR V41 — Sinh Sự Kiện Thế Giới
  // Chiến Tranh · Thiên Tai · Thần Chiến · Xâm Lược · Khủng Hoảng
  // ═══════════════════════════════════════════════════════════════════════════

  const SAVE_KEY = "cgv6_event_gen_v41";

  const EVENT_TYPES = [
    { id:"war",       name:"Chiến Tranh",     icon:"⚔️", color:"#ef4444",
      templates:["Hai cường quốc nổ ra chiến tranh toàn diện.","Tộc người nổi dậy chống lại đế quốc.","Cuộc chiến tranh tôn giáo bùng nổ khi hai đức tin xung đột.","Liên minh tan vỡ — chiến tranh không thể tránh khỏi."] },
    { id:"disaster",  name:"Thiên Tai",        icon:"🌋", color:"#f97316",
      templates:["Núi lửa phun trào thiêu đốt cả đại lục phía đông.","Trận đại hồng thủy nhấn chìm bờ biển.","Cơn đại địa chấn làm thay đổi bản đồ thế giới.","Sao chổi rơi xuống tạo ra mùa đông dài ngàn năm."] },
    { id:"divine_war",name:"Thần Chiến",       icon:"✨", color:"#a78bfa",
      templates:["Hai vị thần đối địch bắt đầu giao chiến — trời đất rung chuyển.","Thần bị phản bội bởi tín đồ — cơn thịnh nộ bùng phát.","Thiên đình phân chia — thần chiến bắt đầu.","Ác thần đột phá phong ấn — thiên chiến không thể tránh."] },
    { id:"invasion",  name:"Xâm Lược ĐVT",    icon:"🌌", color:"#8b5cf6",
      templates:["Cổng vũ trụ mở ra — thực thể từ vũ trụ khác tràn vào.","Đội quân đa vũ trụ xuất hiện — tìm kiếm tài nguyên linh khí.","Một vũ trụ hấp hối phát tán năng lượng hủy diệt sang đây.","Chinh phạt đa vũ trụ bắt đầu từ phía không ngờ nhất."] },
    { id:"crisis",    name:"Khủng Hoảng KT",   icon:"💹", color:"#22c55e",
      templates:["Mạch linh khí cạn kiệt — kinh tế sụp đổ toàn cầu.","Con đường tơ lụa bị phong tỏa — thương mại tê liệt.","Đồng tiền linh thạch mất giá — lạm phát phi mã.","Hạn hán kéo dài — nông nghiệp thế giới thất bại."] },
  ];

  function defaultData() { return { events: [], totalGenerated: 0 }; }
  window.egData = window.egData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ events: window.egData.events.slice(0,50), totalGenerated: window.egData.totalGenerated })); } catch(e) {} }
  function load() { try { var r=localStorage.getItem(SAVE_KEY); if(r){var p=JSON.parse(r);if(p)window.egData=Object.assign(defaultData(),p);} } catch(e) {} }

  function _now() { return typeof window.year!=="undefined"?window.year:0; }
  var _ctr = 1;

  function _getWorldContext() {
    var kingdoms = [];
    if (window.kingdomData && window.kingdomData.kingdoms) {
      var arr = Array.isArray(window.kingdomData.kingdoms)?window.kingdomData.kingdoms:Object.values(window.kingdomData.kingdoms||{});
      kingdoms = arr.map(function(k){return k.name||"Vương Quốc";});
    }
    return { kingdoms:kingdoms };
  }

  window.egGenerateEvent = function(opts) {
    opts = opts || {};
    var etype = EVENT_TYPES.find(function(t){return t.id===(opts.type);}) || EVENT_TYPES[Math.floor(Math.random()*EVENT_TYPES.length)];
    var ctx   = _getWorldContext();
    var tpl   = etype.templates[Math.floor(Math.random()*etype.templates.length)];
    var desc  = tpl;
    if (ctx.kingdoms.length>0) desc = desc.replace("cường quốc", ctx.kingdoms[0]);

    var severity = opts.severity || (Math.random()>0.7?"major":Math.random()>0.5?"moderate":"minor");
    var impact   = { stability: severity==="major"?-25:severity==="moderate"?-10:-5, population: severity==="major"?-15:severity==="moderate"?-5:0 };

    var ev = {
      id: "ev_v41_" + Date.now() + "_" + (_ctr++),
      type: etype.id, typeName: etype.name, typeIcon: etype.icon, typeColor: etype.color,
      title: opts.title || (etype.name + " " + (["Hùng Tráng","Bi Tráng","Thiên Hạ Kinh Động","Đại Biến","Kinh Thiên Động Địa","Vô Tiền Khoáng Hậu"][Math.floor(Math.random()*6)])),
      desc: desc, severity: severity, impact: impact,
      year: _now(), ts: Date.now(), status: "active",
    };

    window.egData.events.unshift(ev);
    window.egData.totalGenerated++;
    if (window.egData.events.length>50) window.egData.events.pop();

    // Thực sự tác động lên thế giới
    _applyEventImpact(ev);

    if (typeof window.htAddEvent  ==="function") window.htAddEvent({ year:_now(), type:ev.type, title:"[Sự Kiện] " + ev.title, color:etype.color });
    if (typeof window.waeAddAlert ==="function") window.waeAddAlert({ type:"event", icon:etype.icon, title:"⚡ " + ev.title + ": " + desc.slice(0,40), year:_now() });
    if (typeof window.wmeAddMemory==="function") window.wmeAddMemory({ year:_now(), category:"event", title:ev.title, content:ev.desc });
    save();
    return ev;
  };

  function _applyEventImpact(ev) {
    try {
      if (ev.type==="war" && typeof window.mv39DeclareWar==="function") {
        if (Math.random()>0.5 && window.mvData && window.mvData.universes && window.mvData.universes.length>=2) {
          var univs = Array.isArray(window.mvData.universes)?window.mvData.universes:Object.values(window.mvData.universes||{});
          if (univs.length>=2) window.mv39DeclareWar(univs[0].id, univs[1].id, "universe");
        }
      }
      if (ev.type==="disaster" && typeof window.disasterData!=="undefined") {
        // Trigger disaster event notification only
        if (typeof window.deRenderPanel==="function") window.deRenderPanel();
      }
    } catch(e) {}
  }

  window.egRenderPanel = function() {
    var el = document.getElementById("panel-creator-event-v41");
    if (!el) return;
    var events = window.egData.events;

    var typeButtons = EVENT_TYPES.map(function(t) {
      var cnt = events.filter(function(e){return e.type===t.id;}).length;
      return '<button onclick="egGenerateEvent({type:\'' + t.id + '\'});egRenderPanel()" '
        + 'style="flex:1;padding:10px 4px;background:#0f172a;border:1px solid ' + t.color + '44;border-radius:8px;color:' + t.color + ';cursor:pointer;font-size:10px;font-family:\'Noto Serif SC\',serif;text-align:center">'
        + '<div style="font-size:16px">' + t.icon + '</div>'
        + '<div style="font-weight:600;font-size:10px">' + t.name + '</div>'
        + '<div style="font-size:9px;color:#475569">' + cnt + ' lần</div>'
        + '</button>';
    }).join("");

    var sevColor = { major:"#ef4444", moderate:"#fbbf24", minor:"#94a3b8" };
    var sevLabel = { major:"🔴 Nghiêm Trọng", moderate:"🟠 Trung Bình", minor:"🟡 Nhẹ" };

    var evCards = events.length===0
      ? '<div style="text-align:center;padding:30px;color:#475569">Chưa có sự kiện nào được tạo.</div>'
      : events.slice(0,15).map(function(e) {
          return '<div style="background:#0f172a;border-left:3px solid ' + e.typeColor + ';border-radius:0 8px 8px 0;padding:12px;margin-bottom:6px">'
            + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'
            + '<span style="font-size:16px">' + e.typeIcon + '</span>'
            + '<div style="flex:1"><div style="font-size:12px;font-weight:700;color:' + e.typeColor + '">' + e.title + '</div>'
            + '<div style="font-size:10px;color:#475569">Năm ' + e.year + ' · ' + (sevLabel[e.severity]||e.severity) + '</div>'
            + '</div></div>'
            + '<div style="font-size:11px;color:#94a3b8;line-height:1.5">' + e.desc + '</div>'
            + '<div style="font-size:9px;color:#475569;margin-top:6px">📉 Ổn định ' + (e.impact.stability||0) + ' · 👥 Dân số ' + (e.impact.population||0) + '</div>'
            + '</div>';
        }).join("");

    el.innerHTML = '<div style="padding:16px;font-family:\'Noto Serif SC\',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">'
      + '<div style="margin-bottom:14px"><h3 style="margin:0 0 3px;font-size:17px;color:#ef4444;font-family:Cinzel,serif">⚡ Event Generator</h3>'
      + '<div style="font-size:11px;color:#475569">5 loại sự kiện · ' + events.length + ' đã tạo · ' + window.egData.totalGenerated + ' tổng</div></div>'
      + '<div style="display:flex;gap:4px;margin-bottom:14px">' + typeButtons + '</div>'
      + '<button onclick="egGenerateEvent({});egRenderPanel()" style="width:100%;padding:8px;background:linear-gradient(135deg,#7f1d1d,#991b1b);border:none;border-radius:7px;color:#fca5a5;cursor:pointer;font-size:12px;margin-bottom:14px;font-family:\'Noto Serif SC\',serif">🎲 Tạo Sự Kiện Ngẫu Nhiên</button>'
      + '<div style="font-size:12px;color:#64748b;font-weight:600;margin-bottom:8px">📋 SỰ KIỆN ĐÃ TẠO (' + events.length + ')</div>'
      + evCards + '</div>';
  };

  function init() {
    load();
    console.log("[EventGenerator V41] ⚡ 5 loại sự kiện · " + window.egData.totalGenerated + " đã sinh.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 5500); });
  } else {
    setTimeout(init, 5500);
  }
})();
