(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATOR AI V41 — Trợ Lý AI Sáng Thế Chủ
  // Phân tích thế giới · Đề xuất · Học từ lịch sử · gameTick
  // ═══════════════════════════════════════════════════════════════════════════

  const SAVE_KEY = "cgv6_creator_ai_v41";

  function defaultData() {
    return {
      analyses: [],          // Lịch sử phân tích (max 50)
      lastAnalysis: null,    // Phân tích gần nhất
      suggestions: [],       // Đề xuất đã được duyệt (max 100)
      autoSuggestEnabled: true,
      tickCount: 0,
      initialized: false
    };
  }

  window.caiData = window.caiData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ analyses: window.caiData.analyses.slice(0,30), suggestions: window.caiData.suggestions.slice(0,80), lastAnalysis: window.caiData.lastAnalysis, autoSuggestEnabled: window.caiData.autoSuggestEnabled })); } catch(e) {} }
  function load() {
    try {
      var r = localStorage.getItem(SAVE_KEY);
      if (r) { var p = JSON.parse(r); if(p) { window.caiData.analyses = p.analyses||[]; window.caiData.suggestions = p.suggestions||[]; window.caiData.lastAnalysis = p.lastAnalysis||null; window.caiData.autoSuggestEnabled = p.autoSuggestEnabled!==false; } }
    } catch(e) {}
  }

  function _now() { return typeof window.year !== "undefined" ? window.year : 0; }

  function _notify(msg) {
    if (typeof window.waeAddAlert  === "function") window.waeAddAlert({ type:"ai_creator", icon:"🤖", title:msg, year:_now() });
    if (typeof window.htAddEvent   === "function") window.htAddEvent({ year:_now(), type:"creator", title:"[AI] " + msg, color:"#60a5fa" });
  }

  // ─── PHÂN TÍCH CHÍNH ──────────────────────────────────────────────────────
  window.caiRunAnalysis = function() {
    if (typeof window.cbrnAnalyzeWorld !== "function") return null;
    var analysis = window.cbrnAnalyzeWorld();
    analysis.id = "analysis_" + Date.now();
    window.caiData.lastAnalysis = analysis;
    window.caiData.analyses.unshift(analysis);
    if (window.caiData.analyses.length > 50) window.caiData.analyses.pop();
    _notify("🧠 AI đã phân tích thế giới — Điểm tổng: " + analysis.overallScore + "/100");
    save();
    return analysis;
  };

  // ─── ĐỒNG Ý / THỰC HIỆN ĐỀ XUẤT ─────────────────────────────────────────
  window.caiApplySuggestion = function(category, detail) {
    var record = { year:_now(), category:category, detail:detail, ts:Date.now() };
    window.caiData.suggestions.unshift(record);
    if (window.caiData.suggestions.length > 100) window.caiData.suggestions.pop();

    // Thực sự tạo ra entity khi người chơi accept
    try {
      if (category==="nation"    && typeof window.cnfCreateNation   ==="function") window.cnfCreateNation({});
      if (category==="empire"    && typeof window.cnfCreateEmpire   ==="function") window.cnfCreateEmpire({});
      if (category==="god"       && typeof window.cgfRandomGod      ==="function") window.cgfRandomGod();
      if (category==="race"      && typeof window.crfRandomRace     ==="function") window.crfRandomRace();
      if (category==="boss"      && typeof window.cbfRandomBoss     ==="function") window.cbfRandomBoss();
      if (category==="universe"  && typeof window.cufRandomUniverse ==="function") window.cufRandomUniverse();
    } catch(e) {}

    _notify("✅ AI đề xuất '" + category + "' đã được thực hiện!");
    save();
  };

  // ─── GAMETTICK (mỗi 20 ticks) ─────────────────────────────────────────────
  window.caiTick = function() {
    window.caiData.tickCount = (window.caiData.tickCount||0)+1;
    if (window.caiData.tickCount % 20 === 0) {
      window.caiRunAnalysis();
    }
  };

  // ─── RENDER PANEL ─────────────────────────────────────────────────────────
  window.caiRenderPanel = function() {
    var el = document.getElementById("panel-creator-ai-v41");
    if (!el) return;
    var d = window.caiData;
    var la = d.lastAnalysis;

    if (!la) {
      el.innerHTML = '<div style="padding:20px;font-family:\'Noto Serif SC\',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0;text-align:center">'
        + '<div style="font-size:40px;margin:30px 0 10px">🤖</div>'
        + '<div style="font-size:14px;color:#94a3b8;margin-bottom:20px">AI chưa phân tích thế giới</div>'
        + '<button onclick="caiRunAnalysis();caiRenderPanel()" style="padding:12px 24px;background:linear-gradient(135deg,#1d4ed8,#2563eb);border:none;border-radius:10px;color:white;cursor:pointer;font-size:13px;font-family:\'Noto Serif SC\',serif">🧠 Phân Tích Ngay</button>'
        + '</div>';
      return;
    }

    var score = la.overallScore;
    var scoreColor = score>=70?"#22c55e":score>=40?"#fbbf24":"#ef4444";

    var dims = [
      { key:"population",  label:"Dân Số",     icon:"👥" },
      { key:"warfare",     label:"Chiến Tranh", icon:"⚔️", invert:true },
      { key:"economy",     label:"Kinh Tế",     icon:"💰" },
      { key:"religion",    label:"Tôn Giáo",    icon:"🛕" },
      { key:"technology",  label:"Công Nghệ",   icon:"⚙️" },
      { key:"divine",      label:"Thần Thánh",  icon:"✨" },
      { key:"multiverse",  label:"Đa Vũ Trụ",  icon:"🌌" },
    ];

    var dimCards = dims.map(function(dim) {
      var d2 = la[dim.key];
      var s = dim.invert ? (100-d2.score) : d2.score;
      var c = s>=70?"#22c55e":s>=40?"#fbbf24":"#ef4444";
      return '<div style="background:#0f172a;border:1px solid ' + c + '22;border-radius:8px;padding:10px;text-align:center">'
        + '<div style="font-size:16px">' + dim.icon + '</div>'
        + '<div style="font-size:11px;color:#64748b;margin:2px 0">' + dim.label + '</div>'
        + '<div style="font-size:14px;font-weight:700;color:' + c + '">' + s + '</div>'
        + '<div style="font-size:9px;color:#475569">' + (d2.status||"") + '</div>'
        + '</div>';
    }).join("");

    var threatHtml = la.topThreats.map(function(t) {
      return '<div style="background:#0f172a;border-radius:7px;padding:9px 12px;margin-bottom:5px;display:flex;align-items:center;gap:8px">'
        + '<span style="font-size:14px">' + t.severity + '</span>'
        + '<span style="font-size:11px;color:#94a3b8">' + t.msg + '</span>'
        + '</div>';
    }).join("");

    var oppHtml = la.topOpps.map(function(o) {
      return '<div style="background:#0f172a;border-radius:7px;padding:9px 12px;margin-bottom:5px;display:flex;align-items:center;justify-content:space-between">'
        + '<div style="display:flex;align-items:center;gap:8px"><span>' + o.icon + '</span><span style="font-size:11px;color:#94a3b8">' + o.msg + '</span></div>'
        + '<button onclick="caiApplySuggestion(\'' + o.category + '\',\'' + o.msg.slice(0,30) + '\');caiRenderPanel()" style="padding:4px 10px;background:#1d4ed822;border:1px solid #3b82f6;border-radius:5px;color:#60a5fa;cursor:pointer;font-size:9px;white-space:nowrap">✅ Thực Hiện</button>'
        + '</div>';
    }).join("");

    var histCount = d.analyses.length;
    var acceptCount = d.suggestions.length;

    el.innerHTML = '<div style="padding:16px;font-family:\'Noto Serif SC\',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">'
      + '<div><h3 style="margin:0 0 3px;font-size:17px;color:#60a5fa;font-family:Cinzel,serif">🤖 AI Cố Vấn</h3>'
      + '<div style="font-size:11px;color:#475569">' + histCount + ' lần phân tích · ' + acceptCount + ' đề xuất đã thực hiện</div></div>'
      + '<button onclick="caiRunAnalysis();caiRenderPanel()" style="padding:8px 14px;background:linear-gradient(135deg,#1d4ed8,#2563eb);border:none;border-radius:8px;color:white;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif">🔄 Phân Tích Lại</button>'
      + '</div>'
      + '<div style="background:linear-gradient(135deg,#0f172a,#1e293b);border:2px solid ' + scoreColor + '44;border-radius:12px;padding:16px;text-align:center;margin-bottom:16px">'
      + '<div style="font-size:11px;color:#64748b">ĐIỂM SỨC KHỎE THẾ GIỚI</div>'
      + '<div style="font-size:48px;font-weight:700;color:' + scoreColor + ';line-height:1.1">' + score + '</div>'
      + '<div style="font-size:11px;color:#64748b">/ 100 · Năm ' + (la.year||0) + '</div>'
      + '</div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(80px,1fr));gap:6px;margin-bottom:16px">' + dimCards + '</div>'
      + '<div style="margin-bottom:14px"><div style="font-size:11px;color:#ef4444;font-weight:600;margin-bottom:6px">⚠️ NGUY CƠ</div>' + threatHtml + '</div>'
      + '<div><div style="font-size:11px;color:#22c55e;font-weight:600;margin-bottom:6px">💡 ĐỀ XUẤT</div>' + oppHtml + '</div>'
      + '</div>';
  };

  // ─── INIT ─────────────────────────────────────────────────────────────────
  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() { if(_orig) _orig(); window.caiTick(); };
    setTimeout(function(){ window.caiRunAnalysis(); }, 2000);
    window.caiData.initialized = true;
    console.log("[CreatorAI V41] 🤖 Trợ Lý AI Sáng Thế Chủ khởi động — Tự động phân tích mỗi 20 tick.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 4700); });
  } else {
    setTimeout(init, 4700);
  }
})();
