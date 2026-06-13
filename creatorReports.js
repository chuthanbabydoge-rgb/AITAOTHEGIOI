(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATOR REPORTS V41 — Báo Cáo AI Tổng Hợp
  // Tình Trạng Thế Giới · Đề Xuất Phát Triển · Nguy Cơ · Báo Cáo Chiến Tranh
  // ═══════════════════════════════════════════════════════════════════════════

  const SAVE_KEY = "cgv6_creator_reports_v41";

  function defaultData() { return { reports: [], generated: 0 }; }
  window.crpData = window.crpData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ reports: window.crpData.reports.slice(0,20), generated: window.crpData.generated })); } catch(e) {} }
  function load() { try { var r=localStorage.getItem(SAVE_KEY); if(r){var p=JSON.parse(r);if(p)window.crpData=Object.assign(defaultData(),p);} } catch(e) {} }

  function _now() { return typeof window.year!=="undefined"?window.year:0; }
  function _safeArr(a){ return Array.isArray(a)?a:(a?Object.values(a):[]); }

  var REPORT_TYPES = [
    { id:"world_state",  name:"Tình Trạng Thế Giới",     icon:"🌍", color:"#60a5fa" },
    { id:"development",  name:"Đề Xuất Phát Triển",       icon:"🚀", color:"#22c55e" },
    { id:"collapse_risk",name:"Nguy Cơ Sụp Đổ",           icon:"💀", color:"#ef4444" },
    { id:"war_risk",     name:"Nguy Cơ Chiến Tranh",      icon:"⚔️", color:"#f97316" },
  ];

  function _buildWorldStateReport() {
    var analysis = typeof window.cbrnAnalyzeWorld==="function" ? window.cbrnAnalyzeWorld() : {};
    var v40 = { races:0, items:0, bosses:0, gods:0, nations:0, empires:0, universes:0 };
    if(window.crfData) v40.races=_safeArr(window.crfData.races).length;
    if(window.cifData) v40.items=_safeArr(window.cifData.items).length;
    if(window.cbfData) v40.bosses=_safeArr(window.cbfData.bosses).length;
    if(window.cgfData) v40.gods=_safeArr(window.cgfData.gods).length;
    if(window.cnfData) { v40.nations=_safeArr(window.cnfData.nations).length; v40.empires=_safeArr(window.cnfData.empires).length; }
    if(window.cufData) v40.universes=_safeArr(window.cufData.universes).length;

    var loreCount  = window.lgData ? _safeArr(window.lgData.lores).length : 0;
    var eventCount = window.egData ? _safeArr(window.egData.events).length : 0;

    return {
      sections: [
        { title:"📊 Thống Kê Cốt Lõi", items:[
          "Vương Quốc: " + ((analysis.population&&analysis.population.kingdoms)||0),
          "Đế Quốc: " + ((analysis.population&&analysis.population.empires)||0),
          "NPC Còn Sống: " + ((analysis.population&&analysis.population.alive)||0),
          "Thần Linh: " + ((analysis.religion&&analysis.religion.deities)||0),
          "Chiến Tranh Đang Diễn Ra: " + ((analysis.warfare&&analysis.warfare.activeWars)||0),
          "Vũ Trụ: " + ((analysis.multiverse&&analysis.multiverse.universes)||0),
        ]},
        { title:"🎨 Sáng Tạo V40", items:[
          "Chủng Tộc: " + v40.races, "Vật Phẩm: " + v40.items, "Boss: " + v40.bosses,
          "Thần Tạo: " + v40.gods, "Quốc Gia Tạo: " + v40.nations, "Đế Quốc Tạo: " + v40.empires, "Vũ Trụ Tạo: " + v40.universes,
        ]},
        { title:"📜 Lịch Sử & Sự Kiện V41", items:[
          "Lore Đã Viết: " + loreCount,
          "Sự Kiện Đã Tạo: " + eventCount,
          "Phân Tích AI: " + (window.caiData ? _safeArr(window.caiData.analyses).length : 0),
          "Đề Xuất Đã Thực Hiện: " + (window.cseData ? _safeArr(window.cseData.applied).length : 0),
        ]},
      ],
      score: (analysis.overallScore||50),
    };
  }

  function _buildDevelopmentReport() {
    var opps = [];
    if (typeof window.cbrnAnalyzeWorld==="function") { try { opps = window.cbrnAnalyzeWorld().topOpps||[]; } catch(e){} }
    return {
      sections: [
        { title:"💡 Cơ Hội Phát Triển", items: opps.map(function(o){return o.icon+" "+o.msg;}) },
        { title:"🔧 Công Cụ Sẵn Sàng", items:[
          "V40: Tạo chủng tộc, vật phẩm, boss, thần, quốc gia, vũ trụ",
          "V41: AI phân tích, đề xuất, lore, sự kiện, cân bằng",
          "V39: Chiến tranh đa vũ trụ, xâm lược, liên minh",
          "V38: Tiến hóa nền văn minh 6 trụ cột",
        ]},
        { title:"📈 Mục Tiêu Tiếp Theo", items:[
          "Tạo ít nhất 3 vương quốc đa dạng văn hóa",
          "Bổ sung thần linh cho tất cả các lĩnh vực lớn",
          "Thiết lập đa vũ trụ với 5+ vũ trụ",
          "Ghi lại lore cho mọi sự kiện lớn",
          "Duy trì điểm cân bằng trên 70",
        ]},
      ],
    };
  }

  function _buildCollapseRiskReport() {
    var threats = [];
    if (typeof window.cbrnAnalyzeWorld==="function") { try { threats = window.cbrnAnalyzeWorld().topThreats||[]; } catch(e){} }
    var balRpt = window.cbaData && window.cbaData.lastReport;
    var critical = balRpt ? (balRpt.overall&&balRpt.overall.criticalIssues||[]) : [];

    return {
      sections: [
        { title:"🔴 Nguy Cơ Khẩn Cấp", items: threats.filter(function(t){return t.severity==="🔴";}).map(function(t){return t.msg;}).concat(critical.map(function(i){return i.msg;})) || ["Không có nguy cơ khẩn cấp"] },
        { title:"🟠 Cảnh Báo", items: threats.filter(function(t){return t.severity==="🟠";}).map(function(t){return t.msg;}) || ["Không có cảnh báo"] },
        { title:"💊 Giải Pháp Đề Xuất", items:[
          "Nếu chiến tranh vượt kiểm soát → Tạo thần hòa bình can thiệp",
          "Nếu kinh tế sụp đổ → Tạo quốc gia thương mại mới",
          "Nếu boss quá mạnh → Tạo anh hùng truyền kỳ đối phó",
          "Nếu vũ trụ mất ổn định → Khai thiên vũ trụ cân bằng mới",
        ]},
      ],
    };
  }

  function _buildWarRiskReport() {
    var warfare = {};
    if (typeof window.cbrnAnalyzeWorld==="function") { try { warfare = window.cbrnAnalyzeWorld().warfare||{}; } catch(e){} }
    return {
      sections: [
        { title:"⚔️ Tình Hình Chiến Sự", items:[
          "Chiến tranh đang diễn ra: " + (warfare.activeWars||0),
          "Chiến tranh thế giới: " + (warfare.worldWars||0),
          "Chiến tranh đa vũ trụ: " + (warfare.multiverseWars||0),
          "Mức độ nguy hiểm: " + (warfare.status||"Bình Thường"),
        ]},
        { title:"🗺️ Khu Vực Nóng Bỏng", items:[
          warfare.score > 70 ? "🔴 KHỦNG HOẢNG: Chiến tranh toàn cầu đang xảy ra!" :
          warfare.score > 40 ? "🟠 CẢNH BÁO: Căng thẳng leo thang" :
          "🟢 Tương đối hòa bình",
        ]},
        { title:"🛡️ Biện Pháp Phòng Ngừa", items:[
          "Tạo thần hòa bình để điều phối xung đột",
          "Thiết lập liên minh đa vũ trụ phòng thủ",
          "Sử dụng V39 để kiểm soát chiến tranh đa vũ trụ",
          "Tạo vũ khí thần cấp để cân bằng sức mạnh",
        ]},
      ],
    };
  }

  window.crpGenerateReport = function(type) {
    var rtype = REPORT_TYPES.find(function(t){return t.id===type;}) || REPORT_TYPES[0];
    var data;
    if (type==="world_state")   data = _buildWorldStateReport();
    else if (type==="development")  data = _buildDevelopmentReport();
    else if (type==="collapse_risk") data = _buildCollapseRiskReport();
    else if (type==="war_risk") data = _buildWarRiskReport();
    else data = _buildWorldStateReport();

    var report = {
      id: "rpt_" + Date.now(), type: type, typeName: rtype.name,
      typeIcon: rtype.icon, typeColor: rtype.color,
      sections: data.sections, score: data.score,
      year: _now(), ts: Date.now(),
    };

    window.crpData.reports.unshift(report);
    window.crpData.generated++;
    if (window.crpData.reports.length>20) window.crpData.reports.pop();
    save();
    return report;
  };

  window.crpRenderPanel = function() {
    var el = document.getElementById("panel-creator-reports-v41");
    if (!el) return;
    var reports = window.crpData.reports;

    var typeButtons = REPORT_TYPES.map(function(t) {
      return '<button onclick="crpGenerateReport(\'' + t.id + '\');crpRenderPanel()" '
        + 'style="flex:1;padding:10px 6px;background:#0f172a;border:1px solid ' + t.color + '44;border-radius:8px;color:' + t.color + ';cursor:pointer;font-size:10px;font-family:\'Noto Serif SC\',serif;text-align:center">'
        + '<div style="font-size:16px">' + t.icon + '</div>'
        + '<div style="font-weight:600">' + t.name + '</div>'
        + '</button>';
    }).join("");

    var latestReport = reports[0];
    var reportHtml = !latestReport
      ? '<div style="text-align:center;padding:30px;color:#475569">Chưa có báo cáo. Chọn loại báo cáo bên trên!</div>'
      : '<div style="background:#0f172a;border:1px solid ' + latestReport.typeColor + '33;border-radius:10px;padding:14px;margin-bottom:8px">'
        + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">'
        + '<span style="font-size:22px">' + latestReport.typeIcon + '</span>'
        + '<div><div style="font-size:13px;font-weight:700;color:' + latestReport.typeColor + '">' + latestReport.typeName + '</div>'
        + '<div style="font-size:10px;color:#475569">Năm ' + latestReport.year + '</div></div>'
        + '</div>'
        + latestReport.sections.map(function(sec) {
            var items = (sec.items||[]).filter(Boolean);
            if (items.length===0) items = ["Không có dữ liệu"];
            return '<div style="margin-bottom:12px"><div style="font-size:11px;color:#64748b;font-weight:600;margin-bottom:6px">' + sec.title + '</div>'
              + items.map(function(i){ return '<div style="font-size:11px;color:#94a3b8;padding:5px 0;border-bottom:1px solid #0f172a">• ' + i + '</div>'; }).join("")
              + '</div>';
          }).join("")
        + '</div>';

    var historyHtml = reports.slice(1,6).map(function(r){
      return '<div style="font-size:10px;color:#475569;padding:5px 0;display:flex;align-items:center;gap:6px;border-bottom:1px solid #0f172a">'
        + '<span>' + r.typeIcon + '</span><span>' + r.typeName + ' · Năm ' + r.year + '</span>'
        + '</div>';
    }).join("") || "";

    el.innerHTML = '<div style="padding:16px;font-family:\'Noto Serif SC\',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">'
      + '<div style="margin-bottom:14px"><h3 style="margin:0 0 3px;font-size:17px;color:#60a5fa;font-family:Cinzel,serif">📊 Báo Cáo AI</h3>'
      + '<div style="font-size:11px;color:#475569">' + window.crpData.generated + ' báo cáo · 4 loại phân tích</div></div>'
      + '<div style="display:flex;gap:6px;margin-bottom:14px">' + typeButtons + '</div>'
      + reportHtml
      + (historyHtml ? '<div style="padding:10px;background:#0f172a;border-radius:8px;margin-top:10px"><div style="font-size:10px;color:#475569;font-weight:600;margin-bottom:6px">📋 LỊCH SỬ</div>' + historyHtml + '</div>' : '')
      + '</div>';
  };

  function init() {
    load();
    setTimeout(function(){ window.crpGenerateReport("world_state"); }, 5000);
    console.log("[CreatorReports V41] 📊 Báo cáo AI · 4 loại · " + window.crpData.generated + " đã tạo.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 5700); });
  } else {
    setTimeout(init, 5700);
  }
})();
