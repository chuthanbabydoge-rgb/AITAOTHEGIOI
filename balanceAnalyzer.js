(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // BALANCE ANALYZER V41 — Phân Tích Cân Bằng Thế Giới
  // Phát hiện bất cân bằng · Cảnh báo · Đề xuất can thiệp
  // ═══════════════════════════════════════════════════════════════════════════

  const SAVE_KEY = "cgv6_balance_v41";
  function safeArr(a){ return Array.isArray(a)?a:(a?Object.values(a):[]); }

  function defaultData() { return { reports: [], lastReport: null, alerts: [] }; }
  window.cbaData = window.cbaData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ reports: window.cbaData.reports.slice(0,20), lastReport: window.cbaData.lastReport, alerts: window.cbaData.alerts.slice(0,30) })); } catch(e) {} }
  function load() { try { var r=localStorage.getItem(SAVE_KEY); if(r){var p=JSON.parse(r);if(p)window.cbaData=Object.assign(defaultData(),p);} } catch(e) {} }

  function _now() { return typeof window.year!=="undefined"?window.year:0; }

  window.cbaRunAnalysis = function() {
    var report = {
      id: "bal_" + Date.now(), year: _now(),
      kingdoms: _analyzeKingdoms(),
      empires: _analyzeEmpires(),
      bosses: _analyzeBosses(),
      universes: _analyzeUniverses(),
      gods: _analyzeGods(),
      overall: null,
    };
    report.overall = _computeOverall(report);
    window.cbaData.lastReport = report;
    window.cbaData.reports.unshift(report);
    if (window.cbaData.reports.length>20) window.cbaData.reports.pop();

    var critical = report.overall.criticalIssues;
    if (critical.length > 0) {
      if (typeof window.waeAddAlert==="function") window.waeAddAlert({ type:"balance", icon:"⚖️", title:"⚠️ " + critical.length + " vấn đề cân bằng cần can thiệp!", year:_now() });
    }
    save();
    return report;
  };

  function _analyzeKingdoms() {
    var kingdoms = safeArr(window.kingdomData && window.kingdomData.kingdoms);
    if (kingdoms.length === 0) return { count:0, issues:[], status:"Không Có Dữ Liệu", score:50 };
    var powers  = kingdoms.map(function(k){ return k.power||k.military||k.strength||50; });
    var max     = Math.max.apply(null, powers);
    var avg     = powers.reduce(function(s,p){return s+p;},0)/powers.length;
    var issues  = [];
    kingdoms.forEach(function(k,i){
      var p = powers[i];
      if (p > avg*2.5) issues.push({ severity:"🔴", entity:k.name||"Vương Quốc "+i, msg:"Quá mạnh so với trung bình (" + Math.floor(p) + " vs avg " + Math.floor(avg) + ")", fix:"Tạo đối thủ hoặc giảm sức mạnh" });
      if (p < avg*0.3) issues.push({ severity:"🟡", entity:k.name||"Vương Quốc "+i, msg:"Quá yếu, có nguy cơ bị diệt vong", fix:"Gia tăng tài nguyên hoặc kích hoạt liên minh" });
    });
    var score = Math.max(0, 100 - issues.length*25);
    return { count:kingdoms.length, maxPower:Math.floor(max), avgPower:Math.floor(avg), issues:issues, status:issues.length===0?"Cân Bằng":issues.length<3?"Hơi Lệch":"Mất Cân Bằng", score:score };
  }

  function _analyzeEmpires() {
    var empires = safeArr(window.empireData && window.empireData.empires);
    var v40emp  = safeArr(window.cnfData && window.cnfData.empires);
    var all     = empires.concat(v40emp);
    if (all.length === 0) return { count:0, issues:[], status:"Không Có", score:50 };
    var powers  = all.map(function(e){ return e.military||e.power||e.strength||60; });
    var max     = Math.max.apply(null, powers);
    var avg     = powers.reduce(function(s,p){return s+p;},0)/powers.length;
    var issues  = [];
    if (max > avg*3) issues.push({ severity:"🔴", entity:"Đế Quốc Mạnh Nhất", msg:"Bá quyền tuyệt đối — đe dọa ổn định thế giới", fix:"Tạo liên minh chống lại hoặc kích hoạt nội chiến" });
    if (all.length > 5) issues.push({ severity:"🟡", entity:"Hệ Thống Đế Quốc", msg:"Quá nhiều đế quốc — nguy cơ xung đột liên miên", fix:"Để các đế quốc yếu sụp đổ tự nhiên" });
    return { count:all.length, maxPower:Math.floor(max), avgPower:Math.floor(avg), issues:issues, status:issues.length===0?"Cân Bằng":"Có Vấn Đề", score:Math.max(0,100-issues.length*30) };
  }

  function _analyzeBosses() {
    var v31b = safeArr(window.worldBossData && window.worldBossData.bosses).filter(function(b){return b.alive!==false;});
    var v40b = safeArr(window.cbfData && window.cbfData.bosses).filter(function(b){return b.status==="active";});
    var all  = v31b.concat(v40b);
    var issues = [];
    var creatorBoss = v40b.filter(function(b){return b.tier==="creator";});
    if (creatorBoss.length > 1) issues.push({ severity:"🔴", entity:"Creator Boss", msg:creatorBoss.length + " Creator Boss đang hoạt động — không thể kiểm soát!", fix:"Tiêu diệt bớt hoặc phong ấn" });
    if (all.length > 8) issues.push({ severity:"🟠", entity:"Tất Cả Boss", msg:"Quá nhiều boss — " + all.length + " boss, thế giới hỗn loạn", fix:"Hạ bớt boss hoặc tạo thêm anh hùng" });
    if (all.length === 0) issues.push({ severity:"🟡", entity:"Boss", msg:"Không có boss — thế giới thiếu thách thức", fix:"Triệu hồi World Boss để tạo thử thách" });
    return { v31:v31b.length, v40:v40b.length, total:all.length, issues:issues, status:issues.length===0?"Bình Thường":"Cần Chú Ý", score:Math.max(0,100-issues.length*25) };
  }

  function _analyzeUniverses() {
    var mvU   = safeArr(window.mvData && window.mvData.universes);
    var v40U  = safeArr(window.cufData && window.cufData.universes);
    var all   = mvU.concat(v40U);
    var issues = [];
    all.forEach(function(u){
      if ((u.stability||100) < 20) issues.push({ severity:"🔴", entity:u.name||"Vũ Trụ", msg:"Vũ trụ gần sụp đổ! Ổn định: " + (u.stability||0) + "%", fix:"Can thiệp trực tiếp vào vũ trụ" });
      if ((u.power||100) > 5000) issues.push({ severity:"🟠", entity:u.name||"Vũ Trụ", msg:"Vũ trụ quá mạnh, đe dọa các vũ trụ khác", fix:"Tạo đối trọng hoặc kích hoạt boss multiverse" });
    });
    return { total:all.length, issues:issues, status:issues.length===0?"Cân Bằng":"Mất Ổn Định", score:Math.max(0,100-issues.length*20) };
  }

  function _analyzeGods() {
    var divinityTotal = 0, count = 0;
    if (window.divineBeingData && window.divineBeingData.beings) {
      safeArr(window.divineBeingData.beings).filter(function(d){return d.active!==false;}).forEach(function(d){divinityTotal+=d.power||50;count++;});
    }
    if (window.cgfData && window.cgfData.gods) {
      safeArr(window.cgfData.gods).forEach(function(g){divinityTotal+=g.divinity||50;count++;});
    }
    var issues = [];
    if (count > 10 && divinityTotal/count > 90) issues.push({ severity:"🟠", entity:"Thần Thánh", msg:"Quá nhiều thần mạnh — thần chiến không thể tránh khỏi", fix:"Tạo cân bằng bằng cách phong ấn bớt thần" });
    if (count === 0) issues.push({ severity:"🟡", entity:"Thần Thánh", msg:"Không có thần — thế giới vô chủ", fix:"Tạo ít nhất một thần bảo hộ" });
    return { count:count, avgDivinity:count>0?Math.floor(divinityTotal/count):0, issues:issues, status:issues.length===0?"Cân Bằng":"Cần Giám Sát", score:Math.max(0,100-issues.length*30) };
  }

  function _computeOverall(r) {
    var allIssues = r.kingdoms.issues.concat(r.empires.issues).concat(r.bosses.issues).concat(r.universes.issues).concat(r.gods.issues);
    var critical  = allIssues.filter(function(i){return i.severity==="🔴";});
    var warnings  = allIssues.filter(function(i){return i.severity==="🟠";});
    var avgScore  = Math.floor((r.kingdoms.score + r.empires.score + r.bosses.score + r.universes.score + r.gods.score)/5);
    return { allIssues:allIssues, criticalIssues:critical, warnings:warnings, score:avgScore, status:critical.length>0?"🔴 Khủng Hoảng":warnings.length>0?"🟠 Cần Chú Ý":"🟢 Cân Bằng" };
  }

  window.cbaRenderPanel = function() {
    var el = document.getElementById("panel-creator-balance-v41");
    if (!el) return;
    var report = window.cbaData.lastReport;
    if (!report) report = window.cbaRunAnalysis();

    var overall = report.overall;
    var scoreColor = overall.score>=70?"#22c55e":overall.score>=40?"#fbbf24":"#ef4444";

    function _sectionCard(title, icon, data) {
      var issuesHtml = data.issues.length===0
        ? '<div style="font-size:10px;color:#22c55e;padding:6px 0">✅ Không có vấn đề</div>'
        : data.issues.map(function(i){ return '<div style="padding:6px 0;border-bottom:1px solid #0f172a"><div style="font-size:10px;color:#94a3b8">' + i.severity + ' ' + (i.entity||"") + ': ' + i.msg + '</div><div style="font-size:9px;color:#475569;margin-top:2px">💊 ' + (i.fix||"") + '</div></div>'; }).join("");
      var c = data.score>=70?"#22c55e":data.score>=40?"#fbbf24":"#ef4444";
      return '<div style="background:#0f172a;border:1px solid ' + c + '22;border-radius:10px;padding:12px;margin-bottom:8px">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
        + '<div style="font-size:12px;font-weight:600;color:#e2e8f0">' + icon + ' ' + title + '</div>'
        + '<div style="display:flex;align-items:center;gap:8px">'
        + '<span style="font-size:10px;color:#475569">' + data.status + '</span>'
        + '<span style="font-size:14px;font-weight:700;color:' + c + '">' + data.score + '</span>'
        + '</div></div>'
        + issuesHtml + '</div>';
    }

    el.innerHTML = '<div style="padding:16px;font-family:\'Noto Serif SC\',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">'
      + '<div><h3 style="margin:0 0 3px;font-size:17px;color:#f97316;font-family:Cinzel,serif">⚖️ Phân Tích Cân Bằng</h3>'
      + '<div style="font-size:11px;color:#475569">' + report.overall.allIssues.length + ' vấn đề · ' + report.overall.criticalIssues.length + ' khẩn cấp</div></div>'
      + '<button onclick="cbaRunAnalysis();cbaRenderPanel()" style="padding:8px 14px;background:#7c2d12;border:none;border-radius:8px;color:#fb923c;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif">🔄 Kiểm Tra Lại</button>'
      + '</div>'
      + '<div style="background:linear-gradient(135deg,#0f172a,#1e293b);border:2px solid ' + scoreColor + '44;border-radius:12px;padding:14px;text-align:center;margin-bottom:14px">'
      + '<div style="font-size:11px;color:#64748b">ĐIỂM CÂN BẰNG TỔNG THỂ</div>'
      + '<div style="font-size:40px;font-weight:700;color:' + scoreColor + ';line-height:1.1">' + overall.score + '</div>'
      + '<div style="font-size:13px;color:#94a3b8">' + overall.status + '</div>'
      + '</div>'
      + _sectionCard("Vương Quốc",  "🏰", report.kingdoms)
      + _sectionCard("Đế Quốc",     "👑", report.empires)
      + _sectionCard("Boss",         "👹", report.bosses)
      + _sectionCard("Vũ Trụ",      "🌌", report.universes)
      + _sectionCard("Thần Thánh",  "✨", report.gods)
      + '</div>';
  };

  function init() {
    load();
    setTimeout(function(){ window.cbaRunAnalysis(); }, 4000);
    console.log("[BalanceAnalyzer V41] ⚖️ Phân tích cân bằng · 5 chiều · Tự động cảnh báo sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 5100); });
  } else {
    setTimeout(init, 5100);
  }
})();
