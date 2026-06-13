(function() {
  "use strict";

  function pct(v) { return Math.max(0, Math.min(100, Math.round(v))); }
  function fmtNum(n) { return (n || 0).toLocaleString(); }

  function _card(label, value, bg, border) {
    return '<div style="background:' + (bg || "#0d0d1a") + ';border-radius:8px;padding:10px;text-align:center;border:1px solid ' + (border || "#444") + ';">' +
      '<div style="color:#888;font-size:0.78em;">' + label + '</div>' +
      '<div style="color:#e0e0e0;font-weight:bold;font-size:1em;margin-top:4px;">' + value + '</div></div>';
  }

  function _section(title, items, color) {
    return '<div style="margin-bottom:12px;background:#0d0d1a;border-radius:8px;padding:12px;">' +
      '<div style="color:' + (color || "#9b59b6") + ';font-weight:bold;margin-bottom:8px;">' + title + '</div>' +
      (items.length === 0 ? '<div style="color:#888;font-size:0.85em;">Chưa có dữ liệu</div>' :
      items.map(function(i) { return '<div style="color:#ccc;font-size:0.85em;padding:2px 0;">• ' + i + '</div>'; }).join('')) + '</div>';
  }

  var _activeV57Tab = "hub";

  function showTab(tab) {
    _activeV57Tab = tab;
    var tabs = ["hub","content","template","share","reward","stats"];
    tabs.forEach(function(t) {
      var el = document.getElementById("v57-panel-" + t);
      if (el) el.style.display = (t === tab) ? "" : "none";
    });
    switch(tab) {
      case "hub":      renderHub(); break;
      case "content":  renderContent(); break;
      case "template": renderTemplate(); break;
      case "share":    renderShare(); break;
      case "reward":   renderReward(); break;
      case "stats":    renderStats(); break;
    }
  }

  function renderHub() {
    var el = document.getElementById("v57-panel-hub");
    if (!el) return;
    var profile = (typeof window.cps57GetProfile === "function") ? window.cps57GetProfile() : {};
    var econStats = (typeof window.ce57GetStats === "function") ? window.ce57GetStats() : {};
    var repStats = (typeof window.crs57GetStats === "function") ? window.crs57GetStats() : {};
    var rewardStats = (typeof window.cre57GetStats === "function") ? window.cre57GetStats() : {};
    var jarvis = (typeof window.cre57GetJarvisSuggestion === "function") ? window.cre57GetJarvisSuggestion() : { icon: "💡", msg: "..." };
    var progress = (typeof window.cps57GetRankProgress === "function") ? window.cps57GetRankProgress() : 0;

    el.innerHTML = '<div style="padding:16px;font-family:serif;color:#e0e0e0;">' +
      '<div style="background:#1a0d2e;border-radius:12px;padding:16px;text-align:center;margin-bottom:14px;border:2px solid #9b59b6;">' +
      '<div style="font-size:2.5em;">' + (profile.rankIcon || "⚫") + '</div>' +
      '<div style="font-size:1.2em;font-weight:bold;color:#9b59b6;">' + (profile.displayName || "Đấng Tạo Hóa") + '</div>' +
      '<div style="color:#aaa;font-size:0.85em;margin:4px 0;">' + (profile.rankName || "Người Tập Sự") + ' · "' + (profile.title || "Người Tập Sự") + '"</div>' +
      '<div style="margin:10px 0;">' +
      '<div style="color:#888;font-size:0.78em;margin-bottom:4px;">Tiến trình cấp bậc · ' + progress + '%</div>' +
      '<div style="height:6px;background:#1a1a2e;border-radius:3px;">' +
      '<div style="height:100%;width:' + progress + '%;background:linear-gradient(90deg,#9b59b6,#e67e22);border-radius:3px;"></div></div></div>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px;">' +
      _card("💰 CP", fmtNum(econStats.cp)) +
      _card("📦 Nội Dung", fmtNum(econStats.totalContent)) +
      _card("⚡ Danh Tiếng", fmtNum(repStats.totalRep)) +
      _card("🏆 Cột Mốc", (rewardStats.unlockedCount || 0) + "/" + (rewardStats.totalMilestones || 0)) +
      '</div></div>' +
      '<div style="background:#0d1a0d;border-radius:8px;padding:12px;margin-bottom:12px;border-left:3px solid #f39c12;">' +
      '<div style="color:#f39c12;font-weight:bold;margin-bottom:6px;">🤖 Jarvis Creator Mode</div>' +
      '<div style="color:#e0e0e0;font-size:0.9em;">' + jarvis.icon + ' ' + jarvis.msg + '</div></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">' +
      ['race','religion','hero','city','item','event','world','template'].map(function(type) {
        var types = {race:"👥 Chủng Tộc",religion:"⛪ Tôn Giáo",hero:"🦸 Anh Hùng",city:"🏙️ Thành Phố",item:"⚔️ Vật Phẩm",event:"⚡ Sự Kiện",world:"🌍 Thế Giới",template:"🗂️ Template"};
        return '<button onclick="var nm=prompt(\'Tên nội dung ' + (types[type]||type) + ':\');if(nm&&nm.trim()){var r=window.creg57Register(\'' + type + '\',nm,{},{});if(r){alert(\'✅ Đã ghi nhận: \'+nm+\' (+CP)\');}}" ' +
          'style="padding:6px 10px;background:#0d0d2e;color:#ccc;border:1px solid #9b59b6;border-radius:5px;cursor:pointer;font-size:0.78em;">' + (types[type]||type) + '</button>';
      }).join('') + '</div>' +
      (profile.bio ? '<div style="background:#0d0d1a;border-radius:8px;padding:10px;color:#aaa;font-size:0.85em;font-style:italic;">"' + profile.bio + '"</div>' : "") +
      '</div>';
  }

  function renderContent() {
    var el = document.getElementById("v57-panel-content");
    if (!el) return;
    var regStats = (typeof window.creg57GetStats === "function") ? window.creg57GetStats() : {};
    var contents = (typeof window.creg57GetByType === "function") ? window.creg57GetByType(null, 20) : [];
    var creationLog = (typeof window.ce57GetCreationLog === "function") ? window.ce57GetCreationLog(10) : [];

    el.innerHTML = '<div style="padding:16px;font-family:serif;color:#e0e0e0;">' +
      '<h3 style="color:#3498db;margin-bottom:12px;">📚 Registry Nội Dung</h3>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;">' +
      _card("📝 Tổng Nội Dung", (regStats.total || 0), "#0d0d1a", "#3498db") +
      _card("🌐 Đã Chia Sẻ", (regStats.sharedCount || 0), "#0d0d1a", "#2ecc71") +
      _card("📥 Import", (regStats.totalImports || 0), "#0d0d1a", "#f39c12") +
      _card("📤 Export", (regStats.totalExports || 0), "#0d0d1a", "#e74c3c") +
      '</div>' +
      '<div style="background:#0d0d1a;border-radius:8px;padding:12px;margin-bottom:12px;">' +
      '<div style="color:#3498db;font-weight:bold;margin-bottom:8px;">Theo Loại</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;">' +
      Object.entries(regStats.byType || {}).map(function(kv) {
        var icons = {race:"👥",religion:"⛪",hero:"🦸",city:"🏙️",item:"⚔️",event:"⚡",world:"🌍",template:"🗂️",god:"✨",quest:"📜",guild:"🏛️",story:"📖"};
        return '<span style="background:#1a1a2e;padding:4px 8px;border-radius:4px;font-size:0.8em;">' + (icons[kv[0]]||"📄") + ' ' + kv[0] + ': ' + kv[1] + '</span>';
      }).join('') + '</div></div>' +
      '<div style="background:#0d0d1a;border-radius:8px;padding:12px;margin-bottom:12px;">' +
      '<div style="color:#3498db;font-weight:bold;margin-bottom:8px;">📋 Nội Dung Gần Đây</div>' +
      (contents.length === 0 ? '<div style="color:#888;">Chưa có nội dung</div>' :
      contents.slice(0, 10).map(function(c) {
        var icons = {race:"👥",religion:"⛪",hero:"🦸",city:"🏙️",item:"⚔️",event:"⚡",world:"🌍",template:"🗂️",god:"✨",quest:"📜",guild:"🏛️",story:"📖"};
        return '<div style="padding:8px;background:#0a0a1a;border-radius:6px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">' +
          '<span>' + (icons[c.type]||"📄") + ' ' + c.name + ' <span style="color:#888;font-size:0.8em;">[' + c.type + ']</span></span>' +
          '<div style="display:flex;gap:4px;">' +
          '<button onclick="window.creg57MarkPublic(\'' + c.id + '\');window.creatorEconomyRegistryV57Render();" style="padding:2px 6px;background:#2ecc71;color:#000;border:none;border-radius:3px;cursor:pointer;font-size:0.72em;">🌐</button>' +
          '<button onclick="var d=window.creg57Export(\'' + c.id + '\');if(d){prompt(\'Copy JSON:\',d);}" style="padding:2px 6px;background:#3498db;color:#fff;border:none;border-radius:3px;cursor:pointer;font-size:0.72em;">📤</button>' +
          '<button onclick="window.creg57Rate(\'' + c.id + '\',\'' + c.name + '\',5);" style="padding:2px 6px;background:#f39c12;color:#000;border:none;border-radius:3px;cursor:pointer;font-size:0.72em;">⭐</button>' +
          '</div></div>';
      }).join('')) + '</div>' +
      '<div style="background:#0d0d1a;border-radius:8px;padding:12px;">' +
      '<div style="color:#3498db;font-weight:bold;margin-bottom:8px;">📥 Import JSON</div>' +
      '<textarea id="v57-import-json" placeholder="Dán JSON export vào đây..." style="width:100%;height:80px;background:#0a0a1a;border:1px solid #3498db;color:#e0e0e0;border-radius:6px;padding:8px;font-size:0.8em;box-sizing:border-box;"></textarea>' +
      '<button onclick="var j=document.getElementById(\'v57-import-json\').value;if(j){var r=window.creg57Import(j);alert(r.msg);window.creatorEconomyRegistryV57Render();}" ' +
      'style="margin-top:6px;background:#3498db;color:#fff;border:none;padding:6px 14px;border-radius:5px;cursor:pointer;">📥 Import</button>' +
      '</div></div>';
  }

  function renderTemplate() {
    var el = document.getElementById("v57-panel-template");
    if (!el) return;
    var presets = (typeof window.uts57GetPresets === "function") ? window.uts57GetPresets() : [];
    var saved = (typeof window.uts57GetTemplates === "function") ? window.uts57GetTemplates() : [];
    var jarvisSuggestions = (typeof window.uts57GetJarvisSuggestion === "function") ? window.uts57GetJarvisSuggestion() : [];
    var stats = (typeof window.uts57GetStats === "function") ? window.uts57GetStats() : {};

    el.innerHTML = '<div style="padding:16px;font-family:serif;color:#e0e0e0;">' +
      '<h3 style="color:#2ecc71;margin-bottom:12px;">🗂️ Universe Template</h3>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;">' +
      _card("🗂️ Template Đã Lưu", (stats.savedCount || 0), "#0d1a0d", "#2ecc71") +
      _card("📚 Preset Hệ Thống", (stats.presetCount || 0), "#0d0d1a", "#3498db") +
      _card("🔗 Share Codes", (stats.sharedCodes || 0), "#0d0d1a", "#9b59b6") +
      '</div>' +
      (jarvisSuggestions.length > 0 ? '<div style="background:#0d1a00;border-radius:8px;padding:10px;margin-bottom:12px;border-left:3px solid #f39c12;">' +
        jarvisSuggestions.map(function(s) { return '<div style="color:#e0e0e0;font-size:0.85em;margin-bottom:4px;">' + s + '</div>'; }).join('') + '</div>' : '') +
      '<div style="background:#0d0d1a;border-radius:8px;padding:12px;margin-bottom:12px;">' +
      '<div style="color:#2ecc71;font-weight:bold;margin-bottom:8px;">💾 Lưu Template Hiện Tại</div>' +
      '<input id="v57-tpl-name" placeholder="Tên template..." style="width:100%;padding:8px;background:#0a0a1a;border:1px solid #2ecc71;color:#fff;border-radius:6px;font-size:0.85em;box-sizing:border-box;margin-bottom:6px;">' +
      '<input id="v57-tpl-desc" placeholder="Mô tả..." style="width:100%;padding:8px;background:#0a0a1a;border:1px solid #2ecc71;color:#fff;border-radius:6px;font-size:0.85em;box-sizing:border-box;margin-bottom:6px;">' +
      '<button onclick="var n=document.getElementById(\'v57-tpl-name\').value||\'Template Mới\';var d=document.getElementById(\'v57-tpl-desc\').value;var t=window.uts57SaveTemplate(n,d);if(t){alert(\'✅ Đã lưu: \'+t.name);window.creatorEconomyRegistryV57Render();}" ' +
      'style="background:#2ecc71;color:#000;border:none;padding:8px 16px;border-radius:5px;cursor:pointer;font-weight:bold;">💾 Lưu Snapshot</button></div>' +
      '<div style="color:#2ecc71;font-weight:bold;margin-bottom:8px;">📚 Preset Templates</div>' +
      presets.map(function(p) {
        return '<div style="background:#0d0d1a;border-radius:8px;padding:12px;margin-bottom:8px;">' +
          '<div style="font-weight:bold;">' + p.name + '</div>' +
          '<div style="color:#aaa;font-size:0.85em;margin:4px 0;">' + p.desc + '</div>' +
          '<div style="display:flex;gap:6px;">' +
          '<button onclick="var t=window.uts57CloneTemplate(\'' + p.id + '\');if(t){alert(\'✅ Clone: \'+t.name);}" style="background:#3498db;color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:0.78em;">📋 Clone</button>' +
          '<button onclick="var c=window.uts57GenerateShareCode(\'' + p.id + '\');if(c){alert(\'🔗 Share Code: \'+c);}" style="background:#9b59b6;color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:0.78em;">🔗 Share</button>' +
          '</div></div>';
      }).join('') +
      (saved.length > 0 ? '<div style="color:#2ecc71;font-weight:bold;margin-top:12px;margin-bottom:8px;">💾 Templates Đã Lưu</div>' +
      saved.slice(0, 5).map(function(t) {
        return '<div style="background:#0d0d1a;border-radius:8px;padding:10px;margin-bottom:6px;">' +
          '<div style="font-weight:bold;">' + t.name + '</div>' +
          '<div style="color:#aaa;font-size:0.8em;">' + (t.desc || "") + ' · Năm ' + (t.createdYear || 0) + '</div>' +
          '<button onclick="var c=window.uts57GenerateShareCode(\'' + t.id + '\');if(c){alert(\'🔗 Share Code: \'+c);}" style="margin-top:4px;background:#9b59b6;color:#fff;border:none;padding:3px 8px;border-radius:4px;cursor:pointer;font-size:0.75em;">🔗 Share</button>' +
          '</div>';
      }).join('') : '') +
      '</div>';
  }

  function renderShare() {
    var el = document.getElementById("v57-panel-share");
    if (!el) return;
    var sharedContents = (typeof window.contentRegV57Data !== "undefined") ? (window.contentRegV57Data.sharedContents || []) : [];
    var sharedCodes = (typeof window.universeTemplateData !== "undefined") ? (window.universeTemplateData.sharedCodes || []) : [];
    var repStats = (typeof window.crs57GetStats === "function") ? window.crs57GetStats() : {};

    el.innerHTML = '<div style="padding:16px;font-family:serif;color:#e0e0e0;">' +
      '<h3 style="color:#e67e22;margin-bottom:12px;">🌐 Chia Sẻ Cộng Đồng</h3>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">' +
      _card("📤 Nội Dung Chia Sẻ", sharedContents.length, "#0d0d1a", "#e67e22") +
      _card("🔗 Template Share Codes", sharedCodes.length, "#0d0d1a", "#9b59b6") +
      '</div>' +
      '<div style="background:#0d0d1a;border-radius:8px;padding:12px;margin-bottom:12px;">' +
      '<div style="color:#e67e22;font-weight:bold;margin-bottom:8px;">📤 Nội Dung Đã Công Khai (' + sharedContents.length + ')</div>' +
      (sharedContents.length === 0 ? '<div style="color:#888;">Chưa có nội dung công khai · Mở tab Nội Dung → click 🌐 để chia sẻ</div>' :
      sharedContents.map(function(c) {
        return '<div style="padding:6px;background:#0a0a1a;border-radius:5px;margin-bottom:4px;font-size:0.85em;">' +
          '🌐 ' + c.name + ' [' + c.type + '] · Năm ' + (c.year || 0) + '</div>';
      }).join('')) + '</div>' +
      '<div style="background:#0d0d1a;border-radius:8px;padding:12px;margin-bottom:12px;">' +
      '<div style="color:#9b59b6;font-weight:bold;margin-bottom:8px;">🔗 Share Codes Templates</div>' +
      (sharedCodes.length === 0 ? '<div style="color:#888;">Chưa có share code · Mở tab Template → click Share</div>' :
      sharedCodes.slice(0, 10).map(function(c) {
        return '<div style="padding:6px;background:#0a0a1a;border-radius:5px;margin-bottom:4px;display:flex;justify-content:space-between;font-size:0.85em;">' +
          '<span>🔗 ' + c.templateName + '</span>' +
          '<span style="color:#9b59b6;font-family:monospace;">' + c.code + '</span>' +
          '</div>';
      }).join('')) + '</div>' +
      '<div style="background:#0d1a0d;border-radius:8px;padding:12px;">' +
      '<div style="color:#2ecc71;font-weight:bold;margin-bottom:8px;">🌟 Danh Tiếng Creator</div>' +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">' +
      '<span style="font-size:2em;">' + (repStats.tierIcon || "⚫") + '</span>' +
      '<div><div style="font-weight:bold;color:' + (repStats.tierColor || "#fff") + ';">' + (repStats.tierName || "Vô Danh") + '</div>' +
      '<div style="color:#aaa;font-size:0.85em;">' + fmtNum(repStats.totalRep) + ' điểm · Tiếp theo: ' + fmtNum(repStats.nextTierAt) + '</div></div></div>' +
      '<div style="height:6px;background:#1a1a2e;border-radius:3px;margin-bottom:8px;">' +
      '<div style="height:100%;width:' + pct((repStats.totalRep || 0) / Math.max(repStats.nextTierAt || 1, 1) * 100) + '%;background:' + (repStats.tierColor || "#888") + ';border-radius:3px;"></div></div>' +
      (repStats.topContent && repStats.topContent.length > 0 ? '<div style="color:#aaa;font-size:0.85em;margin-top:6px;"><strong>Top Nội Dung:</strong>' + repStats.topContent.map(function(c) { return ' · ' + c.name + ' (' + (c.rating||0).toFixed(1) + '★)'; }).join('') + '</div>' : '') +
      '</div></div>';
  }

  function renderReward() {
    var el = document.getElementById("v57-panel-reward");
    if (!el) return;
    var milestones = (typeof window.cre57GetMilestones === "function") ? window.cre57GetMilestones() : [];
    var rewardStats = (typeof window.cre57GetStats === "function") ? window.cre57GetStats() : {};
    var jarvisLogs = rewardStats.jarvisLogs || [];

    el.innerHTML = '<div style="padding:16px;font-family:serif;color:#e0e0e0;">' +
      '<h3 style="color:#f39c12;margin-bottom:12px;">🏆 Phần Thưởng & Cột Mốc</h3>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px;">' +
      _card("🏆 Đã Đạt", (rewardStats.unlockedCount || 0) + "/" + (rewardStats.totalMilestones || 0), "#0d0d1a", "#f39c12") +
      _card("💰 CP Từ Rewards", fmtNum(rewardStats.totalCPFromRewards), "#0d0d1a", "#2ecc71") +
      _card("🤖 Jarvis Gợi Ý", (jarvisLogs.length || 0), "#0d0d1a", "#9b59b6") +
      '</div>' +
      '<div style="background:#0d0d1a;border-radius:8px;padding:12px;margin-bottom:12px;">' +
      '<div style="color:#f39c12;font-weight:bold;margin-bottom:8px;">📋 Danh Sách Cột Mốc</div>' +
      milestones.map(function(m) {
        var locked = !m.unlocked;
        return '<div style="display:flex;align-items:center;gap:8px;padding:8px;background:#0a0a1a;border-radius:6px;margin-bottom:5px;opacity:' + (locked ? 0.5 : 1) + ';">' +
          '<span style="font-size:1.2em;">' + m.name.split(" ")[0] + '</span>' +
          '<div style="flex:1;"><div style="font-size:0.85em;">' + m.name.replace(/^[^\s]+\s/, "") + '</div>' +
          '<div style="color:#aaa;font-size:0.78em;">' + m.desc + '</div></div>' +
          '<span style="color:' + (locked ? "#888" : "#f39c12") + ';font-size:0.85em;white-space:nowrap;">' + (locked ? "🔒 +" + m.cp + " CP" : "✅ Đã Đạt") + '</span></div>';
      }).join('') + '</div>' +
      (jarvisLogs.length > 0 ? '<div style="background:#0d1a00;border-radius:8px;padding:12px;">' +
        '<div style="color:#f39c12;font-weight:bold;margin-bottom:8px;">🤖 Jarvis Creator Log</div>' +
        jarvisLogs.map(function(j) { return '<div style="color:#ccc;font-size:0.85em;padding:4px 0;">📅 Năm ' + (j.year||0) + ' · ' + j.icon + ' ' + j.msg + '</div>'; }).join('') +
        '</div>' : '') + '</div>';
  }

  function renderStats() {
    var el = document.getElementById("v57-panel-stats");
    if (!el) return;
    var econStats = (typeof window.ce57GetStats === "function") ? window.ce57GetStats() : {};
    var regStats = (typeof window.creg57GetStats === "function") ? window.creg57GetStats() : {};
    var repStats = (typeof window.crs57GetStats === "function") ? window.crs57GetStats() : {};
    var tplStats = (typeof window.uts57GetStats === "function") ? window.uts57GetStats() : {};
    var profile = (typeof window.cps57GetProfile === "function") ? window.cps57GetProfile() : {};
    var creationLog = (typeof window.ce57GetCreationLog === "function") ? window.ce57GetCreationLog(10) : [];

    el.innerHTML = '<div style="padding:16px;font-family:serif;color:#e0e0e0;">' +
      '<h3 style="color:#3498db;margin-bottom:12px;">📊 Thống Kê Creator Economy</h3>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;">' +
      _card("💰 CP Hiện Tại", fmtNum(econStats.cp)) +
      _card("📈 Tổng CP Kiếm", fmtNum(econStats.totalCPEarned)) +
      _card("⚡ Passive/tick", fmtNum(econStats.passiveIncome)) +
      _card("📦 Tổng Nội Dung", fmtNum(econStats.totalContent)) +
      _card("🌟 Danh Tiếng", fmtNum(repStats.totalRep)) +
      _card("🗂️ Template", (tplStats.savedCount || 0) + " lưu") +
      '</div>' +
      '<div style="background:#0d0d1a;border-radius:8px;padding:12px;margin-bottom:12px;">' +
      '<div style="color:#3498db;font-weight:bold;margin-bottom:8px;">📊 Phân Bổ CP Passive Income</div>' +
      (typeof econStats.breakdown === "object" ? Object.entries(econStats.breakdown || {}).filter(function(kv) { return kv[1] > 0; }).map(function(kv) {
        var icons = {race:"👥",religion:"⛪",hero:"🦸",city:"🏙️",item:"⚔️",event:"⚡",world:"🌍",template:"🗂️",god:"✨",quest:"📜",guild:"🏛️",story:"📖"};
        var types = (typeof window.ce57GetContentTypes === "function") ? window.ce57GetContentTypes() : [];
        var ct = types.find(function(c) { return c.id === kv[0]; });
        var income = ct ? kv[1] * ct.baseIncome : 0;
        return '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:0.85em;">' +
          '<span>' + (icons[kv[0]]||"📄") + ' ' + kv[0] + ' × ' + kv[1] + '</span>' +
          '<span style="color:#f39c12;">' + income + ' passive/tick</span></div>';
      }).join('') : '<div style="color:#888;">Chưa có dữ liệu</div>') + '</div>' +
      '<div style="background:#0d0d1a;border-radius:8px;padding:12px;margin-bottom:12px;">' +
      '<div style="color:#3498db;font-weight:bold;margin-bottom:8px;">📋 Lịch Sử Tạo Nội Dung</div>' +
      (creationLog.length === 0 ? '<div style="color:#888;">Chưa có lịch sử</div>' :
      creationLog.map(function(l) {
        return '<div style="padding:4px 0;font-size:0.85em;border-bottom:1px solid #1a1a2e;">' +
          l.icon + ' ' + l.name + ' <span style="color:#f39c12;">+' + l.cp + ' CP</span> <span style="color:#888;">· Năm ' + (l.year||0) + '</span></div>';
      }).join('')) + '</div>' +
      '<div style="background:#1a0d2e;border-radius:8px;padding:12px;">' +
      '<div style="color:#9b59b6;font-weight:bold;margin-bottom:8px;">🆔 Creator ID</div>' +
      '<div style="font-family:monospace;color:#9b59b6;font-size:0.9em;">' + (profile.id || "N/A") + '</div>' +
      '<div style="color:#aaa;font-size:0.8em;margin-top:4px;">Ngày gia nhập: Năm ' + (profile.joinedYear || 0) + ' · ' + (profile.rankName || "") + '</div>' +
      '</div></div>';
  }

  var V57_TABS = [
    { id: "hub",      label: "👁 Creator Hub" },
    { id: "content",  label: "📦 Nội Dung" },
    { id: "template", label: "🗂️ Template" },
    { id: "share",    label: "🌐 Chia Sẻ" },
    { id: "reward",   label: "🏆 Phần Thưởng" },
    { id: "stats",    label: "📊 Thống Kê" }
  ];

  function buildV57Section(container) {
    var section = document.createElement("div");
    section.id = "v57-creator-section";
    section.style.cssText = "margin-top:16px;border-top:2px solid #9b59b6;";

    var header = '<div style="background:#0d001a;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;">' +
      '<div style="color:#9b59b6;font-weight:bold;font-size:1.05em;">💰 V57 — Creator Economy</div></div>';

    var tabBar = '<div style="display:flex;flex-wrap:wrap;gap:5px;padding:10px 14px;background:#080010;border-bottom:1px solid #9b59b6;">' +
      V57_TABS.map(function(t) {
        return '<button onclick="window.v57ShowTab(\'' + t.id + '\')" id="v57-tab-btn-' + t.id + '" ' +
          'style="padding:6px 10px;background:#1a0d2e;color:#ccc;border:1px solid #9b59b6;border-radius:5px;cursor:pointer;font-size:0.8em;">' + t.label + '</button>';
      }).join('') + '</div>';

    var panels = '<div id="v57-panels-wrapper" style="min-height:200px;">' +
      V57_TABS.map(function(t) {
        return '<div id="v57-panel-' + t.id + '" style="display:none;"></div>';
      }).join('') + '</div>';

    section.innerHTML = header + tabBar + panels;
    container.appendChild(section);
  }

  window.v57ShowTab = function(tab) { showTab(tab); };
  window.creatorEconomyRegistryV57Render = function() {
    var container = document.getElementById("panel-creator-hub-v32");
    if (!container) return;
    var section = document.getElementById("v57-creator-section");
    if (!section) { buildV57Section(container); }
    showTab(_activeV57Tab);
  };

  function patchHubRender() {
    var _orig = window.hubRenderPanel;
    window.hubRenderPanel = function(hubId) {
      if (_orig) _orig(hubId);
      if (hubId === "creator-hub-v32") {
        setTimeout(function() { window.creatorEconomyRegistryV57Render(); }, 100);
      }
    };
  }

  function init() {
    patchHubRender();
    console.log("[CreatorEconomyRegistryV57] 💰 Economy Registry V57 — 6 tabs (Hub/Nội Dung/Template/Chia Sẻ/Phần Thưởng/Thống Kê) trong creator-hub-v32 sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 10100); });
  } else { setTimeout(init, 10100); }
})();
