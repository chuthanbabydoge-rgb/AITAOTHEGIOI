(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATOR SUGGESTION ENGINE V41 — Đề Xuất Thông Minh
  // Phân tích → Đề xuất cụ thể → One-click tạo
  // ═══════════════════════════════════════════════════════════════════════════

  const SAVE_KEY = "cgv6_creator_sugg_v41";

  function defaultData() { return { suggestions: [], applied: [], dismissed: [], lastGenerated: 0 }; }
  window.cseData = window.cseData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ suggestions: window.cseData.suggestions.slice(0,30), applied: window.cseData.applied.slice(0,50), dismissed: window.cseData.dismissed.slice(0,30), lastGenerated: window.cseData.lastGenerated })); } catch(e) {} }
  function load() {
    try { var r = localStorage.getItem(SAVE_KEY); if(r) { var p=JSON.parse(r); if(p) window.cseData=Object.assign(defaultData(),p); } } catch(e) {}
  }

  var _SUGGESTION_TEMPLATES = [
    // Nation suggestions
    { cat:"nation", cond:function(a){ return a.population.kingdoms<3; }, priority:5,
      gen:function(){ return { cat:"nation", icon:"🏛️", color:"#22c55e", title:"Thành Lập Quốc Gia Mới", desc:"Thế giới có quá ít vương quốc. Tạo một quốc gia thương mại để kích thích kinh tế.", action:"cnfCreateNation", actionArgs:{culture:"mercantile"}, actionLabel:"Tạo Ngay" }; }},
    { cat:"empire", cond:function(a){ return a.population.empires<1 && a.population.kingdoms>3; }, priority:4,
      gen:function(){ return { cat:"empire", icon:"👑", color:"#a78bfa", title:"Lập Đế Quốc Hùng Cường", desc:"Đã đủ vương quốc. Hãy tạo đế quốc đầu tiên để thống nhất thế giới.", action:"cnfCreateEmpire", actionArgs:{}, actionLabel:"Thành Lập" }; }},
    // God suggestions
    { cat:"god", cond:function(a){ return a.religion.deities<2; }, priority:5,
      gen:function(){ return { cat:"god", icon:"✨", color:"#fbbf24", title:"Triệu Hồi Thần Linh", desc:"Thế giới thiếu thần. Tạo thần để bảo hộ dân chúng và dẫn dắt tu tiên.", action:"cgfRandomGod", actionArgs:{}, actionLabel:"Tạo Thần" }; }},
    { cat:"god", cond:function(a){ return a.warfare.score>60 && a.religion.deities<5; }, priority:4,
      gen:function(){ return { cat:"god", icon:"⚔️", color:"#ef4444", title:"Cần Thần Chiến Tranh", desc:"Xung đột leo thang. Tạo thần chiến tranh để quản lý và phán xét các cuộc chiến.", action:"cgfCreateGod", actionArgs:{tier:"greater",domains:["Chiến Tranh"]}, actionLabel:"Triệu Hồi" }; }},
    // Race suggestions
    { cat:"race", cond:function(a){ return a.races.created<1; }, priority:5,
      gen:function(){ return { cat:"race", icon:"👥", color:"#94a3b8", title:"Tạo Chủng Tộc Đầu Tiên", desc:"Chưa có chủng tộc nào được tạo. Hãy tạo chủng tộc cốt lõi cho thế giới này.", action:"crfRandomRace", actionArgs:{}, actionLabel:"Tạo Ngay" }; }},
    { cat:"race", cond:function(a){ return a.races.created===1; }, priority:3,
      gen:function(){ return { cat:"race", icon:"🧝", color:"#a78bfa", title:"Đa Dạng Hóa Chủng Tộc", desc:"Chỉ có một chủng tộc. Thêm Tiên hoặc Ma để tạo đa dạng và xung đột thú vị.", action:"crfCreateRace", actionArgs:{type:"fairy"}, actionLabel:"Tạo Tiên" }; }},
    // Boss suggestions
    { cat:"boss", cond:function(a){ return a.bosses.total<1; }, priority:4,
      gen:function(){ return { cat:"boss", icon:"👹", color:"#f97316", title:"Triệu Hồi Boss Đầu Tiên", desc:"Không có boss. Tạo một World Boss để tạo thách thức cho các anh hùng.", action:"cbfCreateBoss", actionArgs:{tier:"world"}, actionLabel:"Triệu Hồi" }; }},
    { cat:"boss", cond:function(a){ return a.multiverse.universes>3 && a.bosses.total<3; }, priority:3,
      gen:function(){ return { cat:"boss", icon:"🌌", color:"#a78bfa", title:"Cần Multiverse Boss", desc:"Đa vũ trụ đang phát triển. Tạo Multiverse Boss để đe dọa sự tồn tại.", action:"cbfCreateBoss", actionArgs:{tier:"multiverse"}, actionLabel:"Triệu Hồi" }; }},
    // Universe suggestions
    { cat:"universe", cond:function(a){ return a.multiverse.universes<2; }, priority:4,
      gen:function(){ return { cat:"universe", icon:"🌌", color:"#8b5cf6", title:"Khai Thiên Vũ Trụ Thứ Hai", desc:"Chỉ có một vũ trụ. Khai sinh vũ trụ thứ hai để bắt đầu đa vũ trụ.", action:"cufRandomUniverse", actionArgs:{}, actionLabel:"Khai Thiên" }; }},
    { cat:"universe", cond:function(a){ return a.multiverse.activeInvasions>1; }, priority:5,
      gen:function(){ return { cat:"universe", icon:"🛡️", color:"#fbbf24", title:"Tạo Vũ Trụ Phòng Thủ", desc:"Đa vũ trụ đang bị xâm lược. Tạo vũ trụ mới với quy luật phòng thủ mạnh.", action:"cufCreateUniverse", actionArgs:{type:"balance",laws:["order_law"]}, actionLabel:"Khai Thiên" }; }},
    // Lore suggestion
    { cat:"lore", cond:function(a){ return a.overallScore>70; }, priority:2,
      gen:function(){ return { cat:"lore", icon:"📜", color:"#60a5fa", title:"Viết Sử Thi Hoàng Kim", desc:"Thế giới đang phát triển mạnh. Ghi lại những thành tựu này bằng sử thi hùng tráng.", action:"lgGenerateLore", actionArgs:{type:"epic"}, actionLabel:"Tạo Sử Thi" }; }},
    { cat:"lore", cond:function(a){ return a.warfare.score>50; }, priority:2,
      gen:function(){ return { cat:"lore", icon:"⚔️", color:"#ef4444", title:"Ghi Chép Chiến Sử", desc:"Chiến tranh đang xảy ra. Hãy ghi lại những trận chiến hào hùng này.", action:"lgGenerateLore", actionArgs:{type:"war"}, actionLabel:"Ghi Chép" }; }},
  ];

  window.cseGenerateSuggestions = function() {
    if (typeof window.cbrnAnalyzeWorld !== "function") return [];
    var analysis = window.caiData && window.caiData.lastAnalysis ? window.caiData.lastAnalysis : window.cbrnAnalyzeWorld();
    var suggs = [];
    _SUGGESTION_TEMPLATES.forEach(function(tpl) {
      try { if (tpl.cond(analysis)) suggs.push(Object.assign({}, tpl.gen(), { priority:tpl.priority, id:"sugg_"+Date.now()+"_"+Math.random().toString(36).slice(2) })); }
      catch(e) {}
    });
    suggs.sort(function(a,b){ return (b.priority||0)-(a.priority||0); });
    var top = suggs.slice(0,8);
    window.cseData.suggestions = top;
    window.cseData.lastGenerated = Date.now();
    save();
    return top;
  };

  window.cseApply = function(sugg) {
    if (!sugg || !sugg.action) return;
    var fn = window[sugg.action];
    if (typeof fn === "function") {
      try { fn(sugg.actionArgs||{}); } catch(e) {}
    }
    window.cseData.applied.unshift({ cat:sugg.cat, title:sugg.title, year:typeof window.year!=="undefined"?window.year:0 });
    window.cseData.suggestions = window.cseData.suggestions.filter(function(s){ return s.id!==sugg.id; });
    if (typeof window.waeAddAlert==="function") window.waeAddAlert({ type:"suggestion", icon:sugg.icon, title:"✅ Đã thực hiện: " + sugg.title, year:typeof window.year!=="undefined"?window.year:0 });
    save();
  };

  window.cseDismiss = function(suggId) {
    var s = window.cseData.suggestions.find(function(x){ return x.id===suggId; });
    if (s) { window.cseData.dismissed.unshift(s); window.cseData.suggestions = window.cseData.suggestions.filter(function(x){ return x.id!==suggId; }); save(); }
  };

  window.cseRenderPanel = function() {
    var el = document.getElementById("panel-creator-sugg-v41");
    if (!el) return;
    var suggs = window.cseData.suggestions;
    if (suggs.length===0) suggs = window.cseGenerateSuggestions();

    var applied = window.cseData.applied;

    var suggCards = suggs.length===0
      ? '<div style="text-align:center;padding:30px;color:#475569">🎉 Không có đề xuất — thế giới đang hoàn hảo!</div>'
      : suggs.map(function(s) {
          var prioColor = s.priority>=5?"#ef4444":s.priority>=4?"#fbbf24":"#3b82f6";
          return '<div style="background:#0f172a;border:1px solid ' + s.color + '33;border-radius:10px;padding:14px;margin-bottom:8px">'
            + '<div style="display:flex;align-items:flex-start;gap:10px">'
            + '<span style="font-size:22px;flex-shrink:0">' + s.icon + '</span>'
            + '<div style="flex:1">'
            + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">'
            + '<span style="font-size:12px;font-weight:700;color:' + s.color + '">' + s.title + '</span>'
            + '<span style="font-size:9px;padding:1px 5px;border-radius:4px;background:' + prioColor + '22;color:' + prioColor + '">' + (s.priority>=5?"❗ Khẩn Cấp":s.priority>=4?"⚠️ Quan Trọng":"💡 Tốt Hơn") + '</span>'
            + '</div>'
            + '<div style="font-size:11px;color:#64748b;margin-bottom:10px">' + s.desc + '</div>'
            + '<div style="display:flex;gap:6px">'
            + '<button onclick="cseApply(' + JSON.stringify(s).replace(/"/g,"&quot;") + ');cseRenderPanel()" style="flex:1;padding:6px;background:' + s.color + '22;border:1px solid ' + s.color + ';border-radius:6px;color:' + s.color + ';cursor:pointer;font-size:10px;font-family:\'Noto Serif SC\',serif">✅ ' + (s.actionLabel||"Thực Hiện") + '</button>'
            + '<button onclick="cseDismiss(\'' + s.id + '\');cseRenderPanel()" style="padding:6px 10px;background:transparent;border:1px solid #334155;border-radius:6px;color:#475569;cursor:pointer;font-size:10px">❌</button>'
            + '</div>'
            + '</div></div></div>';
        }).join("");

    var appliedHtml = applied.slice(0,10).map(function(a){
      return '<div style="font-size:10px;color:#475569;padding:5px 0;border-bottom:1px solid #0f172a">✅ Năm ' + (a.year||0) + ' — ' + a.title + '</div>';
    }).join("") || '<div style="font-size:10px;color:#334155">Chưa có</div>';

    el.innerHTML = '<div style="padding:16px;font-family:\'Noto Serif SC\',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">'
      + '<div><h3 style="margin:0 0 3px;font-size:17px;color:#22c55e;font-family:Cinzel,serif">💡 Đề Xuất Thông Minh</h3>'
      + '<div style="font-size:11px;color:#475569">' + suggs.length + ' đề xuất · ' + applied.length + ' đã thực hiện</div></div>'
      + '<button onclick="cseGenerateSuggestions();cseRenderPanel()" style="padding:8px 14px;background:#14532d;border:none;border-radius:8px;color:#4ade80;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif">🔄 Tạo Mới</button>'
      + '</div>'
      + suggCards
      + '<div style="margin-top:14px;padding:12px;background:#0f172a;border-radius:8px">'
      + '<div style="font-size:10px;color:#475569;font-weight:600;margin-bottom:6px">📋 ĐÃ THỰC HIỆN GẦN ĐÂY</div>'
      + appliedHtml + '</div>'
      + '</div>';
  };

  function init() {
    load();
    setTimeout(function(){ window.cseGenerateSuggestions(); }, 3000);
    console.log("[CreatorSuggestionEngine V41] 💡 Engine đề xuất · 12 mẫu · tự động phân tích sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 4900); });
  } else {
    setTimeout(init, 4900);
  }
})();
