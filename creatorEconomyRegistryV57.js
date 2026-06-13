(function() {
  "use strict";

  var _activeV57SubTab = "hub";

  function fmtNum(n) { return (n || 0).toLocaleString(); }
  function pct(v) { return Math.max(0, Math.min(100, Math.round(v))); }

  function _card(label, value, border) {
    return '<div style="background:#0d0d1a;border-radius:8px;padding:10px;text-align:center;border:1px solid ' + (border || "#9b59b6") + ';">' +
      '<div style="color:#888;font-size:0.75em;">' + label + '</div>' +
      '<div style="color:#e0e0e0;font-weight:bold;font-size:0.95em;margin-top:3px;">' + value + '</div></div>';
  }

  // ─── SUB-TAB RENDERS ────────────────────────────────────────────────────────

  function renderHub() {
    var profile = (typeof window.cps57GetProfile === "function") ? window.cps57GetProfile() : {};
    var econStats = (typeof window.ce57GetStats === "function") ? window.ce57GetStats() : {};
    var repStats = (typeof window.crs57GetStats === "function") ? window.crs57GetStats() : {};
    var rewardStats = (typeof window.cre57GetStats === "function") ? window.cre57GetStats() : {};
    var jarvis = (typeof window.cre57GetJarvisSuggestion === "function") ? window.cre57GetJarvisSuggestion() : { icon: "💡", msg: "Đang phân tích..." };
    var progress = (typeof window.cps57GetRankProgress === "function") ? window.cps57GetRankProgress() : 0;

    var types = (typeof window.ce57GetContentTypes === "function") ? window.ce57GetContentTypes() : [];
    var createBtns = types.map(function(ct) {
      return '<button onclick="(function(){var nm=prompt(\'Tên \'+\'' + ct.name + '\':\');if(nm&&nm.trim()){window.creg57Register(\'' + ct.id + '\',nm,{});alert(\'✅ +\'+nm+\' · +' + ct.cp + ' CP\');window.v57ShowSubTab(\'hub\');}})()" ' +
        'style="padding:5px 9px;background:#1a0d2e;color:#ccc;border:1px solid #9b59b6;border-radius:4px;cursor:pointer;font-size:0.75em;">' +
        ct.icon + ' ' + ct.name + '</button>';
    }).join('');

    return '<div style="padding:14px;font-family:serif;color:#e0e0e0;">' +
      '<div style="background:#1a0d2e;border-radius:10px;padding:14px;text-align:center;margin-bottom:12px;border:2px solid #9b59b6;">' +
        '<div style="font-size:2em;">' + (profile.rankIcon || "⚫") + '</div>' +
        '<div style="font-size:1.1em;font-weight:bold;color:#9b59b6;">' + (profile.displayName || "Đấng Tạo Hóa") + '</div>' +
        '<div style="color:#aaa;font-size:0.8em;margin:3px 0;">' + (profile.rankName || "Người Tập Sự") + ' · "' + (profile.title || "") + '"</div>' +
        '<div style="margin:8px 0;">' +
          '<div style="color:#888;font-size:0.72em;margin-bottom:3px;">Tiến trình cấp bậc · ' + progress + '%</div>' +
          '<div style="height:5px;background:#1a1a2e;border-radius:3px;"><div style="height:100%;width:' + progress + '%;background:linear-gradient(90deg,#9b59b6,#e67e22);border-radius:3px;"></div></div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px;">' +
          _card("💰 CP", fmtNum(econStats.cp), "#f39c12") +
          _card("📦 Nội Dung", fmtNum(econStats.totalContent), "#3498db") +
          _card("🌟 Danh Tiếng", fmtNum(repStats.totalRep), "#9b59b6") +
          _card("🏆 Cột Mốc", (rewardStats.unlockedCount || 0) + "/" + (rewardStats.totalMilestones || 0), "#2ecc71") +
        '</div>' +
      '</div>' +
      '<div style="background:#0d1a00;border-radius:8px;padding:10px;margin-bottom:10px;border-left:3px solid #f39c12;">' +
        '<div style="color:#f39c12;font-weight:bold;font-size:0.85em;margin-bottom:4px;">🤖 Jarvis Creator Mode</div>' +
        '<div style="color:#e0e0e0;font-size:0.85em;">' + jarvis.icon + ' ' + jarvis.msg + '</div>' +
      '</div>' +
      '<div style="background:#0d0d1a;border-radius:8px;padding:10px;margin-bottom:10px;">' +
        '<div style="color:#9b59b6;font-weight:bold;font-size:0.82em;margin-bottom:7px;">⚡ Tạo Nội Dung Nhanh</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:5px;">' + createBtns + '</div>' +
      '</div>' +
      (profile.bio ? '<div style="background:#0d0d1a;border-radius:8px;padding:8px;color:#aaa;font-size:0.82em;font-style:italic;">"' + profile.bio + '"</div>' : '') +
      '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">' +
        '<button onclick="var n=prompt(\'Tên hiển thị:\');if(n)window.cps57SetName(n);" style="padding:5px 10px;background:#1a0d2e;color:#9b59b6;border:1px solid #9b59b6;border-radius:4px;cursor:pointer;font-size:0.78em;">✏️ Đổi Tên</button>' +
        '<button onclick="var b=prompt(\'Bio:\');if(b!==null)window.cps57SetBio(b);" style="padding:5px 10px;background:#1a0d2e;color:#9b59b6;border:1px solid #9b59b6;border-radius:4px;cursor:pointer;font-size:0.78em;">📝 Bio</button>' +
      '</div>' +
    '</div>';
  }

  function renderContent() {
    var regStats = (typeof window.creg57GetStats === "function") ? window.creg57GetStats() : {};
    var contents = (typeof window.creg57GetByType === "function") ? window.creg57GetByType(null, 15) : [];
    var icons = {race:"👥",religion:"⛪",hero:"🦸",city:"🏙️",item:"⚔️",event:"⚡",world:"🌍",template:"🗂️",god:"✨",quest:"📜",guild:"🏛️",story:"📖"};

    return '<div style="padding:14px;font-family:serif;color:#e0e0e0;">' +
      '<h3 style="color:#3498db;margin:0 0 10px 0;font-size:1em;">📚 Registry Nội Dung</h3>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px;">' +
        _card("📝 Tổng", (regStats.total || 0), "#3498db") +
        _card("🌐 Chia Sẻ", (regStats.sharedCount || 0), "#2ecc71") +
        _card("📥 Import", (regStats.totalImports || 0), "#f39c12") +
        _card("📤 Export", (regStats.totalExports || 0), "#e74c3c") +
      '</div>' +
      '<div style="background:#0d0d1a;border-radius:8px;padding:10px;margin-bottom:10px;">' +
        '<div style="color:#3498db;font-weight:bold;font-size:0.82em;margin-bottom:6px;">Theo Loại</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:5px;">' +
        Object.entries(regStats.byType || {}).map(function(kv) {
          return '<span style="background:#1a1a2e;padding:3px 7px;border-radius:3px;font-size:0.75em;">' + (icons[kv[0]] || "📄") + ' ' + kv[0] + ': ' + kv[1] + '</span>';
        }).join('') + '</div>' +
      '</div>' +
      '<div style="background:#0d0d1a;border-radius:8px;padding:10px;margin-bottom:10px;max-height:220px;overflow-y:auto;">' +
        '<div style="color:#3498db;font-weight:bold;font-size:0.82em;margin-bottom:6px;">📋 Nội Dung Gần Đây</div>' +
        (contents.length === 0 ? '<div style="color:#888;font-size:0.82em;">Chưa có · Dùng nút Tạo Nội Dung ở tab Hub</div>' :
        contents.map(function(c) {
          return '<div style="padding:6px;background:#0a0a1a;border-radius:5px;margin-bottom:5px;display:flex;justify-content:space-between;align-items:center;">' +
            '<span style="font-size:0.82em;">' + (icons[c.type] || "📄") + ' ' + c.name + ' <span style="color:#888;">[' + c.type + ']</span></span>' +
            '<div style="display:flex;gap:3px;">' +
              '<button onclick="window.creg57MarkPublic(\'' + c.id + '\');window.v57ShowSubTab(\'content\');" style="padding:1px 5px;background:#2ecc71;color:#000;border:none;border-radius:2px;cursor:pointer;font-size:0.7em;" title="Chia Sẻ">🌐</button>' +
              '<button onclick="var d=window.creg57Export(\'' + c.id + '\');if(d)prompt(\'JSON:\',d);" style="padding:1px 5px;background:#3498db;color:#fff;border:none;border-radius:2px;cursor:pointer;font-size:0.7em;" title="Export">📤</button>' +
              '<button onclick="window.creg57Rate(\'' + c.id + '\',\'' + c.name + '\',5);window.v57ShowSubTab(\'content\');" style="padding:1px 5px;background:#f39c12;color:#000;border:none;border-radius:2px;cursor:pointer;font-size:0.7em;" title="5★">⭐</button>' +
            '</div></div>';
        }).join('')) +
      '</div>' +
      '<div style="background:#0d0d1a;border-radius:8px;padding:10px;">' +
        '<div style="color:#3498db;font-weight:bold;font-size:0.82em;margin-bottom:6px;">📥 Import JSON</div>' +
        '<textarea id="v57-import-json" placeholder="Dán JSON export vào đây..." style="width:100%;height:70px;background:#0a0a1a;border:1px solid #3498db;color:#e0e0e0;border-radius:5px;padding:6px;font-size:0.78em;box-sizing:border-box;"></textarea>' +
        '<button onclick="var j=document.getElementById(\'v57-import-json\').value;if(j){var r=window.creg57Import(j);alert(r.msg);window.v57ShowSubTab(\'content\');}" ' +
        'style="margin-top:5px;background:#3498db;color:#fff;border:none;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:0.78em;">📥 Import</button>' +
      '</div>' +
    '</div>';
  }

  function renderTemplate() {
    var presets = (typeof window.uts57GetPresets === "function") ? window.uts57GetPresets() : [];
    var saved = (typeof window.uts57GetTemplates === "function") ? window.uts57GetTemplates() : [];
    var jarvisSuggestions = (typeof window.uts57GetJarvisSuggestion === "function") ? window.uts57GetJarvisSuggestion() : [];
    var stats = (typeof window.uts57GetStats === "function") ? window.uts57GetStats() : {};

    return '<div style="padding:14px;font-family:serif;color:#e0e0e0;">' +
      '<h3 style="color:#2ecc71;margin:0 0 10px 0;font-size:1em;">🗂️ Universe Template</h3>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px;">' +
        _card("💾 Đã Lưu", (stats.savedCount || 0), "#2ecc71") +
        _card("📚 Presets", (stats.presetCount || 0), "#3498db") +
        _card("🔗 Share Codes", (stats.sharedCodes || 0), "#9b59b6") +
      '</div>' +
      (jarvisSuggestions.length > 0 ? '<div style="background:#0d1a00;border-radius:8px;padding:8px;margin-bottom:10px;border-left:3px solid #f39c12;">' +
        jarvisSuggestions.slice(0, 2).map(function(s) { return '<div style="color:#e0e0e0;font-size:0.8em;margin-bottom:3px;">' + s + '</div>'; }).join('') + '</div>' : '') +
      '<div style="background:#0d0d1a;border-radius:8px;padding:10px;margin-bottom:10px;">' +
        '<div style="color:#2ecc71;font-weight:bold;font-size:0.82em;margin-bottom:6px;">💾 Lưu Snapshot Hiện Tại</div>' +
        '<input id="v57-tpl-name" placeholder="Tên template..." style="width:100%;padding:6px;background:#0a0a1a;border:1px solid #2ecc71;color:#fff;border-radius:5px;font-size:0.8em;box-sizing:border-box;margin-bottom:5px;">' +
        '<input id="v57-tpl-desc" placeholder="Mô tả..." style="width:100%;padding:6px;background:#0a0a1a;border:1px solid #2ecc71;color:#fff;border-radius:5px;font-size:0.8em;box-sizing:border-box;margin-bottom:5px;">' +
        '<button onclick="var n=document.getElementById(\'v57-tpl-name\').value||\'Template Mới\';var d=document.getElementById(\'v57-tpl-desc\').value;var t=window.uts57SaveTemplate(n,d);if(t){alert(\'✅ Đã lưu: \'+t.name);window.v57ShowSubTab(\'template\');}" ' +
        'style="background:#2ecc71;color:#000;border:none;padding:6px 14px;border-radius:4px;cursor:pointer;font-size:0.8em;font-weight:bold;">💾 Lưu</button>' +
      '</div>' +
      '<div style="color:#2ecc71;font-weight:bold;font-size:0.82em;margin-bottom:6px;">📚 Presets</div>' +
      '<div style="max-height:180px;overflow-y:auto;">' +
      presets.map(function(p) {
        return '<div style="background:#0d0d1a;border-radius:7px;padding:9px;margin-bottom:7px;">' +
          '<div style="font-weight:bold;font-size:0.85em;">' + p.name + '</div>' +
          '<div style="color:#aaa;font-size:0.78em;margin:3px 0;">' + p.desc + '</div>' +
          '<div style="display:flex;gap:5px;margin-top:5px;">' +
            '<button onclick="var t=window.uts57CloneTemplate(\'' + p.id + '\');if(t)alert(\'✅ Clone: \'+t.name);" style="background:#3498db;color:#fff;border:none;padding:3px 7px;border-radius:3px;cursor:pointer;font-size:0.72em;">📋 Clone</button>' +
            '<button onclick="var c=window.uts57GenerateShareCode(\'' + p.id + '\');if(c)alert(\'🔗 Code: \'+c);" style="background:#9b59b6;color:#fff;border:none;padding:3px 7px;border-radius:3px;cursor:pointer;font-size:0.72em;">🔗 Share</button>' +
          '</div></div>';
      }).join('') + '</div>' +
      (saved.length > 0 ? '<div style="color:#2ecc71;font-weight:bold;font-size:0.82em;margin:8px 0 5px 0;">💾 Templates Của Bạn (' + saved.length + ')</div>' +
      '<div style="max-height:150px;overflow-y:auto;">' +
      saved.slice(0, 5).map(function(t) {
        return '<div style="background:#0d0d1a;border-radius:6px;padding:8px;margin-bottom:5px;">' +
          '<div style="font-weight:bold;font-size:0.82em;">' + t.name + '</div>' +
          '<div style="color:#aaa;font-size:0.75em;">' + (t.desc || "") + ' · Năm ' + (t.createdYear || 0) + '</div>' +
          '<button onclick="var c=window.uts57GenerateShareCode(\'' + t.id + '\');if(c)alert(\'🔗 Code: \'+c);" style="margin-top:3px;background:#9b59b6;color:#fff;border:none;padding:2px 7px;border-radius:3px;cursor:pointer;font-size:0.72em;">🔗 Share</button>' +
          '</div>';
      }).join('') + '</div>' : '') +
    '</div>';
  }

  function renderShare() {
    var sharedContents = (typeof window.contentRegV57Data !== "undefined") ? (window.contentRegV57Data.sharedContents || []) : [];
    var sharedCodes = (typeof window.universeTemplateData !== "undefined") ? (window.universeTemplateData.sharedCodes || []) : [];
    var repStats = (typeof window.crs57GetStats === "function") ? window.crs57GetStats() : {};

    return '<div style="padding:14px;font-family:serif;color:#e0e0e0;">' +
      '<h3 style="color:#e67e22;margin:0 0 10px 0;font-size:1em;">🌐 Chia Sẻ Cộng Đồng</h3>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px;">' +
        _card("📤 Nội Dung Công Khai", sharedContents.length, "#e67e22") +
        _card("🔗 Share Codes", sharedCodes.length, "#9b59b6") +
      '</div>' +
      '<div style="background:#0d0d1a;border-radius:8px;padding:10px;margin-bottom:10px;max-height:160px;overflow-y:auto;">' +
        '<div style="color:#e67e22;font-weight:bold;font-size:0.82em;margin-bottom:6px;">📤 Nội Dung Đã Công Khai</div>' +
        (sharedContents.length === 0 ? '<div style="color:#888;font-size:0.8em;">Chưa có · Mở tab Nội Dung → click 🌐</div>' :
        sharedContents.map(function(c) {
          return '<div style="padding:5px;background:#0a0a1a;border-radius:4px;margin-bottom:3px;font-size:0.8em;">🌐 ' + c.name + ' [' + c.type + '] · Năm ' + (c.year || 0) + '</div>';
        }).join('')) +
      '</div>' +
      '<div style="background:#0d0d1a;border-radius:8px;padding:10px;margin-bottom:10px;max-height:120px;overflow-y:auto;">' +
        '<div style="color:#9b59b6;font-weight:bold;font-size:0.82em;margin-bottom:6px;">🔗 Share Codes Templates</div>' +
        (sharedCodes.length === 0 ? '<div style="color:#888;font-size:0.8em;">Chưa có · Mở tab Template → click Share</div>' :
        sharedCodes.slice(0, 8).map(function(c) {
          return '<div style="padding:5px;background:#0a0a1a;border-radius:4px;margin-bottom:3px;display:flex;justify-content:space-between;font-size:0.78em;">' +
            '<span>🔗 ' + c.templateName + '</span><span style="color:#9b59b6;font-family:monospace;">' + c.code + '</span></div>';
        }).join('')) +
      '</div>' +
      '<div style="background:#0d1a0d;border-radius:8px;padding:10px;">' +
        '<div style="color:#2ecc71;font-weight:bold;font-size:0.82em;margin-bottom:7px;">🌟 Danh Tiếng Creator</div>' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
          '<span style="font-size:1.8em;">' + (repStats.tierIcon || "⚫") + '</span>' +
          '<div><div style="font-weight:bold;color:' + (repStats.tierColor || "#fff") + ';font-size:0.9em;">' + (repStats.tierName || "Vô Danh") + '</div>' +
          '<div style="color:#aaa;font-size:0.75em;">' + fmtNum(repStats.totalRep) + ' điểm · Tiếp theo: ' + fmtNum(repStats.nextTierAt) + '</div></div>' +
        '</div>' +
        '<div style="height:5px;background:#1a1a2e;border-radius:3px;">' +
          '<div style="height:100%;width:' + pct((repStats.totalRep || 0) / Math.max(repStats.nextTierAt || 100, 1) * 100) + '%;background:' + (repStats.tierColor || "#888") + ';border-radius:3px;"></div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function renderReward() {
    var milestones = (typeof window.cre57GetMilestones === "function") ? window.cre57GetMilestones() : [];
    var rewardStats = (typeof window.cre57GetStats === "function") ? window.cre57GetStats() : {};
    var jarvisLogs = (rewardStats.jarvisLogs || []);

    return '<div style="padding:14px;font-family:serif;color:#e0e0e0;">' +
      '<h3 style="color:#f39c12;margin:0 0 10px 0;font-size:1em;">🏆 Phần Thưởng & Cột Mốc</h3>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px;">' +
        _card("🏆 Đạt", (rewardStats.unlockedCount || 0) + "/" + (rewardStats.totalMilestones || 0), "#f39c12") +
        _card("💰 CP Rewards", fmtNum(rewardStats.totalCPFromRewards), "#2ecc71") +
        _card("🤖 Jarvis Log", (jarvisLogs.length || 0), "#9b59b6") +
      '</div>' +
      '<div style="max-height:260px;overflow-y:auto;">' +
      milestones.map(function(m) {
        var locked = !m.unlocked;
        return '<div style="display:flex;align-items:center;gap:7px;padding:7px;background:#0a0a1a;border-radius:5px;margin-bottom:4px;opacity:' + (locked ? 0.5 : 1) + ';">' +
          '<span style="font-size:1.1em;">' + m.name.split(" ")[0] + '</span>' +
          '<div style="flex:1;"><div style="font-size:0.8em;">' + m.name.replace(/^[^\s]+\s/, "") + '</div>' +
          '<div style="color:#aaa;font-size:0.72em;">' + m.desc + '</div></div>' +
          '<span style="color:' + (locked ? "#888" : "#f39c12") + ';font-size:0.78em;white-space:nowrap;">' + (locked ? "🔒 +" + m.cp : "✅") + '</span>' +
        '</div>';
      }).join('') + '</div>' +
      (jarvisLogs.length > 0 ? '<div style="background:#0d1a00;border-radius:8px;padding:8px;margin-top:8px;max-height:100px;overflow-y:auto;">' +
        '<div style="color:#f39c12;font-weight:bold;font-size:0.8em;margin-bottom:5px;">🤖 Jarvis Creator Log</div>' +
        jarvisLogs.map(function(j) { return '<div style="color:#ccc;font-size:0.78em;padding:2px 0;">' + j.icon + ' ' + j.msg + '</div>'; }).join('') + '</div>' : '') +
    '</div>';
  }

  function renderStats() {
    var econStats = (typeof window.ce57GetStats === "function") ? window.ce57GetStats() : {};
    var regStats = (typeof window.creg57GetStats === "function") ? window.creg57GetStats() : {};
    var repStats = (typeof window.crs57GetStats === "function") ? window.crs57GetStats() : {};
    var tplStats = (typeof window.uts57GetStats === "function") ? window.uts57GetStats() : {};
    var profile = (typeof window.cps57GetProfile === "function") ? window.cps57GetProfile() : {};
    var creationLog = (typeof window.ce57GetCreationLog === "function") ? window.ce57GetCreationLog(8) : [];
    var types = (typeof window.ce57GetContentTypes === "function") ? window.ce57GetContentTypes() : [];
    var icons = {race:"👥",religion:"⛪",hero:"🦸",city:"🏙️",item:"⚔️",event:"⚡",world:"🌍",template:"🗂️",god:"✨",quest:"📜",guild:"🏛️",story:"📖"};

    return '<div style="padding:14px;font-family:serif;color:#e0e0e0;">' +
      '<h3 style="color:#3498db;margin:0 0 10px 0;font-size:1em;">📊 Thống Kê Creator Economy</h3>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px;">' +
        _card("💰 CP", fmtNum(econStats.cp)) +
        _card("📈 Tổng CP Kiếm", fmtNum(econStats.totalCPEarned)) +
        _card("⚡ Passive Income", (econStats.passiveIncome || 0)) +
        _card("📦 Nội Dung", fmtNum(econStats.totalContent)) +
        _card("🌟 Danh Tiếng", fmtNum(repStats.totalRep)) +
        _card("🗂️ Templates", (tplStats.savedCount || 0)) +
      '</div>' +
      '<div style="background:#0d0d1a;border-radius:8px;padding:10px;margin-bottom:10px;max-height:140px;overflow-y:auto;">' +
        '<div style="color:#3498db;font-weight:bold;font-size:0.8em;margin-bottom:6px;">📊 Phân Bổ Theo Loại</div>' +
        Object.entries(econStats.breakdown || {}).filter(function(kv) { return kv[1] > 0; }).map(function(kv) {
          var ct = types.find(function(c) { return c.id === kv[0]; });
          var income = ct ? kv[1] * ct.baseIncome : 0;
          return '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:0.78em;border-bottom:1px solid #1a1a2e;">' +
            '<span>' + (icons[kv[0]] || "📄") + ' ' + kv[0] + ' × ' + kv[1] + '</span>' +
            '<span style="color:#f39c12;">' + income + ' passive/tick</span></div>';
        }).join('') || '<div style="color:#888;font-size:0.8em;">Chưa tạo nội dung nào</div>' +
      '</div>' +
      '<div style="background:#0d0d1a;border-radius:8px;padding:10px;margin-bottom:10px;max-height:120px;overflow-y:auto;">' +
        '<div style="color:#3498db;font-weight:bold;font-size:0.8em;margin-bottom:5px;">📋 Lịch Sử Tạo</div>' +
        (creationLog.length === 0 ? '<div style="color:#888;font-size:0.78em;">Chưa có</div>' :
        creationLog.map(function(l) {
          return '<div style="font-size:0.78em;padding:3px 0;border-bottom:1px solid #1a1a2e;">' +
            l.icon + ' ' + l.name + ' <span style="color:#f39c12;">+' + l.cp + ' CP</span> <span style="color:#888;">· Năm ' + (l.year || 0) + '</span></div>';
        }).join('')) +
      '</div>' +
      '<div style="background:#1a0d2e;border-radius:8px;padding:8px;">' +
        '<div style="color:#9b59b6;font-size:0.75em;font-family:monospace;">ID: ' + (profile.id || "N/A") + '</div>' +
        '<div style="color:#aaa;font-size:0.72em;margin-top:3px;">' + (profile.rankName || "") + ' · Gia nhập năm ' + (profile.joinedYear || 0) + '</div>' +
      '</div>' +
    '</div>';
  }

  // ─── SUB-TAB SWITCHER ────────────────────────────────────────────────────────
  var V57_SUB_TABS = [
    { id: "hub",      label: "👁 Hub" },
    { id: "content",  label: "📦 Nội Dung" },
    { id: "template", label: "🗂️ Template" },
    { id: "share",    label: "🌐 Chia Sẻ" },
    { id: "reward",   label: "🏆 Phần Thưởng" },
    { id: "stats",    label: "📊 Thống Kê" }
  ];

  function renderV57SubTabs() {
    var tabBar = V57_SUB_TABS.map(function(t) {
      var active = t.id === _activeV57SubTab;
      return '<button onclick="window.v57ShowSubTab(\'' + t.id + '\')" ' +
        'style="padding:5px 9px;background:' + (active ? "#9b59b622" : "transparent") + ';border:none;border-bottom:2px solid ' + (active ? "#9b59b6" : "transparent") + ';color:' + (active ? "#9b59b6" : "#64748b") + ';cursor:pointer;font-size:0.78em;white-space:nowrap;font-family:serif;">' +
        t.label + '</button>';
    }).join('');

    var contentMap = {
      hub: renderHub,
      content: renderContent,
      template: renderTemplate,
      share: renderShare,
      reward: renderReward,
      stats: renderStats
    };
    var renderFn = contentMap[_activeV57SubTab] || renderHub;

    return '<div style="background:#080010;border-top:2px solid #9b59b6;">' +
      '<div style="background:#08000e;padding:4px 10px 0;display:flex;align-items:center;gap:6px;border-bottom:1px solid #9b59b6;">' +
        '<span style="color:#9b59b6;font-size:0.75em;font-weight:bold;white-space:nowrap;">💰 V57</span>' +
        '<div style="display:flex;gap:0;overflow-x:auto;scrollbar-width:none;">' + tabBar + '</div>' +
      '</div>' +
      '<div id="v57-subtab-content" style="overflow-y:auto;max-height:calc(100vh - 220px);">' + renderFn() + '</div>' +
    '</div>';
  }

  window.v57ShowSubTab = function(tabId) {
    _activeV57SubTab = tabId;
    var area = document.getElementById('creator-hub-v32-content');
    if (!area) return;
    area.innerHTML = renderV57SubTabs();
  };

  // ─── INJECT V57 TAB INTO HUB TAB BAR ─────────────────────────────────────────

  function injectV57Tab() {
    var panel = document.getElementById('panel-creator-hub-v32');
    if (!panel) return;

    // same selector as V51 uses — the tab bar div
    var topBar = panel.querySelector('div > div:nth-child(1) > div:nth-child(2)');
    if (!topBar) return;

    // Don't add twice
    if (topBar.querySelector('[data-v57-main]')) return;

    var btn = document.createElement('button');
    btn.setAttribute('data-v57-main', '1');
    btn.innerHTML = '💰 Creator Economy';
    btn.style.cssText = 'padding:5px 8px;background:transparent;border:none;border-bottom:2px solid transparent;color:#9b59b6;cursor:pointer;font-size:11px;white-space:nowrap;transition:all 0.2s;font-family:\'Noto Serif SC\',serif;font-weight:bold;';
    btn.onclick = function() {
      // Visually deactivate all other tabs
      if (topBar) {
        topBar.querySelectorAll('button').forEach(function(b) {
          b.style.borderBottomColor = 'transparent';
          b.style.color = '#64748b';
        });
      }
      btn.style.borderBottomColor = '#9b59b6';
      btn.style.color = '#9b59b6';
      // Render V57 into content area
      var area = document.getElementById('creator-hub-v32-content');
      if (area) area.innerHTML = renderV57SubTabs();
    };
    topBar.appendChild(btn);
  }

  // ─── PATCH HUBRENDERANEL ───────────────────────────────────────────────────

  function patchHubRender() {
    var _orig = window.hubRenderPanel;
    window.hubRenderPanel = function(hubId) {
      if (_orig) _orig(hubId);
      if (hubId === 'creator-hub-v32') {
        setTimeout(injectV57Tab, 80);
      }
    };
  }

  function init() {
    patchHubRender();
    console.log("[CreatorEconomyRegistryV57] 💰 V57 Creator Economy — Tab '💰 Creator Economy' sẽ xuất hiện trong Creator Hub · 6 sub-tabs sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 10100); });
  } else { setTimeout(init, 10100); }
})();
