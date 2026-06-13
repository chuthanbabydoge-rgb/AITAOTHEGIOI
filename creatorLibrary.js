(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATOR LIBRARY V40 — Thư Viện Sáng Tạo
  // Tổng Hợp Tất Cả Sáng Tạo · Rankings · Lịch Sử · Jarvis Đề Xuất
  // ═══════════════════════════════════════════════════════════════════════════

  const JARVIS_SUGGESTIONS = [
    { category:"race",     icon:"👥", templates:[
      "Tạo chủng tộc Tiên với trí tuệ cao và tuổi thọ vô hạn",
      "Tạo chủng tộc Rồng Cổ Đại với sức mạnh tối thượng",
      "Tạo chủng tộc Người Tiến Hóa với tiềm năng đột biến cao",
    ]},
    { category:"item",     icon:"💎", templates:[
      "Rèn Thần Khí Huyền Thoại từ vật liệu siêu cấp",
      "Tạo Di Vật Cổ Đại chứa ký ức của vũ trụ",
      "Chế tác Giáp Thần Bất Khả Xâm Phạm",
    ]},
    { category:"boss",     icon:"👹", templates:[
      "Triệu hồi World Boss để thử thách các vương quốc",
      "Tạo Multiverse Boss để đe dọa toàn bộ vũ trụ",
      "Triệu hồi Creator Boss không thể bị đánh bại",
    ]},
    { category:"god",      icon:"✨", templates:[
      "Tạo Thần Chiến Tranh để cân bằng xung đột",
      "Tạo Thần Hỗn Loạn để phá vỡ trật tự cũ",
      "Tạo Thái Cổ Thần với toàn bộ quyền năng tối thượng",
    ]},
    { category:"nation",   icon:"🏛️", templates:[
      "Tạo Đế Quốc Thần Thánh với văn hóa tôn giáo",
      "Tạo Quốc Gia Học Thuật tiên tiến về công nghệ",
      "Tạo Liên Bang Thương Mại kiểm soát kinh tế",
    ]},
    { category:"universe", icon:"🌌", templates:[
      "Khai thiên Vũ Trụ Tu Tiên mới với linh khí cao",
      "Tạo Vũ Trụ Hỗn Loạn không có quy luật",
      "Khai sinh Vũ Trụ Thần Thánh cho thần linh ngự trị",
    ]},
  ];

  function _getStats() {
    var races     = (window.crfData     && window.crfData.races)        ? window.crfData.races.length        : 0;
    var items     = (window.cifData     && window.cifData.items)        ? window.cifData.items.length        : 0;
    var bosses    = (window.cbfData     && window.cbfData.bosses)       ? window.cbfData.bosses.length       : 0;
    var gods      = (window.cgfData     && window.cgfData.gods)         ? window.cgfData.gods.length         : 0;
    var nations   = (window.cnfData     && window.cnfData.nations)      ? window.cnfData.nations.length      : 0;
    var empires   = (window.cnfData     && window.cnfData.empires)      ? window.cnfData.empires.length      : 0;
    var universes = (window.cufData     && window.cufData.universes)    ? window.cufData.universes.length    : 0;
    var total = races + items + bosses + gods + nations + empires + universes;
    return { races:races, items:items, bosses:bosses, gods:gods, nations:nations, empires:empires, universes:universes, total:total };
  }

  function _buildTimeline() {
    var timeline = [];
    if (window.crfData && window.crfData.races)
      window.crfData.races.forEach(function(r){ timeline.push({ year:r.createdYear, icon:"👥", type:"Chủng Tộc", name:r.name, color:"#94a3b8" }); });
    if (window.cifData && window.cifData.items)
      window.cifData.items.forEach(function(i){ timeline.push({ year:i.createdYear, icon:i.typeIcon, type:"Vật Phẩm", name:i.name, color:i.tierColor||"#fbbf24" }); });
    if (window.cbfData && window.cbfData.bosses)
      window.cbfData.bosses.forEach(function(b){ timeline.push({ year:b.createdYear, icon:b.tierIcon, type:"Boss", name:b.name, color:b.tierColor||"#f97316" }); });
    if (window.cgfData && window.cgfData.gods)
      window.cgfData.gods.forEach(function(g){ timeline.push({ year:g.createdYear, icon:g.tierIcon, type:"Thần Linh", name:g.name, color:g.tierColor||"#fbbf24" }); });
    if (window.cnfData) {
      (window.cnfData.nations||[]).forEach(function(n){ timeline.push({ year:n.createdYear, icon:"🏛️", type:"Quốc Gia", name:n.name, color:n.cultureColor||"#22c55e" }); });
      (window.cnfData.empires||[]).forEach(function(e){ timeline.push({ year:e.createdYear, icon:"👑", type:"Đế Quốc", name:e.name, color:e.cultureColor||"#a78bfa" }); });
    }
    if (window.cufData && window.cufData.universes)
      window.cufData.universes.forEach(function(u){ timeline.push({ year:u.createdYear, icon:u.typeIcon, type:"Vũ Trụ", name:u.name, color:u.typeColor||"#8b5cf6" }); });
    return timeline.sort(function(a,b){ return (b.year||0)-(a.year||0); }).slice(0,30);
  }

  window.clibRenderPanel = function() {
    var el = document.getElementById("panel-creator-library-v40");
    if (!el) return;
    var stats    = _getStats();
    var timeline = _buildTimeline();

    var statCards = [
      { val:stats.races,     label:"Chủng Tộc", icon:"👥", color:"#94a3b8", fn:"crfRenderPanel" },
      { val:stats.items,     label:"Vật Phẩm",  icon:"💎", color:"#fbbf24", fn:"cifRenderPanel" },
      { val:stats.bosses,    label:"Boss",       icon:"👹", color:"#f97316", fn:"cbfRenderPanel" },
      { val:stats.gods,      label:"Thần Linh",  icon:"✨", color:"#fbbf24", fn:"cgfRenderPanel" },
      { val:stats.nations,   label:"Quốc Gia",   icon:"🏛️", color:"#22c55e", fn:"cnfRenderPanel" },
      { val:stats.empires,   label:"Đế Quốc",    icon:"👑", color:"#a78bfa", fn:"cnfRenderPanel" },
      { val:stats.universes, label:"Vũ Trụ",     icon:"🌌", color:"#8b5cf6", fn:"cufRenderPanel" },
    ].map(function(s) {
      return '<div onclick="if(typeof ' + s.fn + '===\'function\')' + s.fn + '()" style="background:#0f172a;border:1px solid ' + s.color + '33;border-radius:8px;padding:12px;text-align:center;cursor:pointer;transition:border-color 0.2s" onmouseover="this.style.borderColor=\'' + s.color + '\'" onmouseout="this.style.borderColor=\'' + s.color + '33\'">'
        + '<div style="font-size:24px;margin-bottom:4px">' + s.icon + '</div>'
        + '<div style="font-size:20px;font-weight:700;color:' + s.color + '">' + s.val + '</div>'
        + '<div style="font-size:10px;color:#64748b">' + s.label + '</div>'
        + '</div>';
    }).join("");

    var totalCard = '<div style="background:linear-gradient(135deg,#0f172a,#1e293b);border:1px solid #475569;border-radius:10px;padding:16px;text-align:center;margin-bottom:20px">'
      + '<div style="font-size:11px;color:#64748b;margin-bottom:4px">TỔNG SỐ SÁNG TẠO</div>'
      + '<div style="font-size:36px;font-weight:700;color:#e2e8f0">' + stats.total + '</div>'
      + '<div style="font-size:11px;color:#475569">bởi Sáng Thế Chủ</div>'
      + '</div>';

    var jarvisHtml = JARVIS_SUGGESTIONS.map(function(cat) {
      var tpl = cat.templates[Math.floor(Math.random()*cat.templates.length)];
      return '<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;margin-bottom:6px;display:flex;align-items:center;gap:10px">'
        + '<span style="font-size:18px;flex-shrink:0">' + cat.icon + '</span>'
        + '<div style="flex:1;font-size:11px;color:#94a3b8">' + tpl + '</div>'
        + '</div>';
    }).join("");

    var timelineHtml = timeline.length===0
      ? '<div style="text-align:center;padding:20px;color:#475569">Chưa có sáng tạo nào được ghi lại.</div>'
      : timeline.map(function(t) {
          return '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:7px;background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.04);margin-bottom:4px">'
            + '<span style="font-size:14px;flex-shrink:0">' + t.icon + '</span>'
            + '<span style="font-size:9px;color:#475569;flex-shrink:0;width:50px">Năm ' + (t.year||0) + '</span>'
            + '<span style="font-size:9px;padding:2px 6px;border-radius:5px;background:' + t.color + '22;color:' + t.color + ';flex-shrink:0">' + t.type + '</span>'
            + '<span style="flex:1;font-size:11px;color:#e2e8f0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + t.name + '</span>'
            + '</div>';
        }).join("");

    el.innerHTML = '<div style="padding:16px;font-family:\'Noto Serif SC\',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">'
      + '<div style="margin-bottom:16px"><h3 style="margin:0 0 3px;font-size:17px;color:#e2e8f0;font-family:Cinzel,serif">📚 Thư Viện Sáng Tạo</h3>'
      + '<div style="font-size:11px;color:#475569">Tổng hợp mọi sáng tạo của Sáng Thế Chủ</div></div>'
      + totalCard
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:8px;margin-bottom:20px">' + statCards + '</div>'
      + '<div style="margin-bottom:20px">'
      + '<div style="font-size:12px;color:#e2e8f0;font-weight:600;margin-bottom:8px;display:flex;align-items:center;gap:6px">🤖 JARVIS ĐỀ XUẤT <button onclick="clibRenderPanel()" style="font-size:10px;padding:2px 8px;background:#1e293b;border:1px solid #334155;border-radius:5px;color:#64748b;cursor:pointer">🔄 Làm Mới</button></div>'
      + jarvisHtml
      + '</div>'
      + '<div>'
      + '<div style="font-size:12px;color:#94a3b8;font-weight:600;margin-bottom:8px">📜 LỊCH SỬ SÁNG TẠO (' + timeline.length + ')</div>'
      + timelineHtml
      + '</div>'
      + '</div>';
  };

  function init() {
    console.log("[CreatorLibrary V40] 📚 Thư Viện Sáng Tạo · Tổng hợp 7 factory · Jarvis đề xuất sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 6200); });
  } else {
    setTimeout(init, 6200);
  }
})();
