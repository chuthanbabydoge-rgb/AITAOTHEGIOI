(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════
  // SECT WAR ENGINE V29 — Chiến Tranh Giữa Các Môn Phái
  // Mở rộng triggerSectWar() trong app.js — KHÔNG ghi đè
  // Save key: cgv6_sectwar_v29
  // ═══════════════════════════════════════════════════════

  var SAVE_KEY = "cgv6_sectwar_v29";

  var WAR_TYPES = {
    "territory":  { name: "Chiến Tranh Lãnh Thổ",   icon: "🗺️",  color: "#f97316", desc: "Tranh giành vùng đất & tài nguyên" },
    "resource":   { name: "Chiến Tranh Tài Nguyên",  icon: "💎",  color: "#4ade80", desc: "Cướp bóc Linh Thạch & Cổ Vật" },
    "holy":       { name: "Thánh Chiến",              icon: "✨",  color: "#f0abfc", desc: "Diệt trừ ma đạo, bảo vệ chính đạo" },
    "dominance":  { name: "Tranh Bá Thiên Hạ",        icon: "👑",  color: "#fde68a", desc: "Tranh ngôi đầu thiên hạ" }
  };

  var WAR_PHASES = ["Tuyên Chiến", "Giao Phong", "Quyết Chiến", "Kết Thúc"];

  window.swV29Data = {
    wars: [],       // active wars
    history: [],    // ended wars
    log: [],
    stats: { totalWars: 0, sectWins: {}, territoryConquests: 0 }
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.swV29Data)); } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) { var p = JSON.parse(d); Object.assign(window.swV29Data, p); }
    } catch(e) {}
  }

  function _log(msg, type) {
    window.swV29Data.log.unshift({ year: window.year || 0, msg: msg, type: type || "info" });
    if (window.swV29Data.log.length > 150) window.swV29Data.log.pop();
  }

  function _rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
  function _chance(p)   { return Math.random() < p; }
  function _pick(arr)   { return arr[Math.floor(Math.random() * arr.length)]; }

  function _getSects() {
    if (typeof sects !== "undefined") return sects;
    if (window.sects) return window.sects;
    return [];
  }

  function _getNPCs() {
    if (typeof npcs !== "undefined") return npcs;
    if (window.npcs) return window.npcs;
    return [];
  }

  function _calcPower(s) {
    if (!s) return 0;
    var allNPCs = _getNPCs();
    var memberPower = (s.members || []).reduce(function(sum, id) {
      var npc = allNPCs.find(function(n) { return n.id === id; });
      return sum + (npc ? (npc.realm || 0) * 10 + (npc.reputation || 0) * 0.1 : 0);
    }, 0);
    var extData = window.seV29Data && window.seV29Data.sectExtended ? window.seV29Data.sectExtended[s.id] : null;
    var techBonus = extData ? extData.techniques.length * 20 : 0;
    var terrBonus = extData ? extData.territories.length * 30 : 0;
    return memberPower + (s.prestige || 0) * 0.5 + (s.armyPower || 0) + techBonus + terrBonus;
  }

  function _findSect(id) {
    return _getSects().find(function(s) { return s.id === id; });
  }

  // ─── Khai chiến ───
  window.swV29DeclareWar = function(s1id, s2id, warType) {
    var sect1 = _findSect(s1id);
    var sect2 = _findSect(s2id);
    if (!sect1 || !sect2) return;
    // Kiểm tra đã đang chiến không
    var already = window.swV29Data.wars.some(function(w) {
      return (w.attacker === s1id && w.defender === s2id) || (w.attacker === s2id && w.defender === s1id);
    });
    if (already) return;

    var wType = WAR_TYPES[warType] || WAR_TYPES["territory"];
    var warId = "sw" + Date.now();
    var war = {
      id: warId,
      attacker: s1id,
      defender: s2id,
      type: warType || "territory",
      phase: 0,
      duration: 0,
      maxDuration: _rand(5, 15),
      attackerPower: _calcPower(sect1),
      defenderPower: _calcPower(sect2),
      startYear: window.year || 0,
      battles: [],
      winner: null
    };
    window.swV29Data.wars.push(war);
    window.swV29Data.stats.totalWars++;

    var msg = wType.icon + " " + sect1.name + " tuyên chiến " + sect2.name + " [" + wType.name + "]!";
    _log(msg, "war");
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: window.year || 0, type: "war", title: msg, color: wType.color });
    }
    if (typeof window.wmeAddMemory === "function") {
      window.wmeAddMemory({ year: window.year || 0, category: "sectWar", title: wType.name + ": " + sect1.name + " vs " + sect2.name, content: wType.desc });
    }
    if (typeof addLog === "function") addLog(msg, "death");
    save();
    return warId;
  };

  // ─── Xử lý chiến tranh mỗi tick ───
  function _processWars() {
    var toEnd = [];
    window.swV29Data.wars.forEach(function(war) {
      var sect1 = _findSect(war.attacker);
      var sect2 = _findSect(war.defender);
      if (!sect1 || !sect2) { toEnd.push(war.id); return; }

      war.duration++;
      war.phase = Math.min(3, Math.floor(war.duration / (war.maxDuration / 4)));

      // Simulate battle each phase
      var atkPow = _calcPower(sect1) * (0.8 + Math.random() * 0.4);
      var defPow = _calcPower(sect2) * (0.8 + Math.random() * 0.4);

      var battleResult = {
        year: window.year || 0,
        atkPow: Math.floor(atkPow),
        defPow: Math.floor(defPow),
        result: atkPow > defPow ? "atk" : "def"
      };
      war.battles.push(battleResult);
      if (war.battles.length > 20) war.battles.shift();

      // Casualties
      var casualties = _rand(1, 3);
      for (var i = 0; i < casualties; i++) {
        var pool = atkPow < defPow ? (sect1.members || []) : (sect2.members || []);
        if (pool.length > 2) {
          var deadId = _pick(pool);
          var deadNPC = _getNPCs().find(function(n) { return n.id === deadId; });
          if (deadNPC && deadNPC.status === "alive" && deadNPC.id !== sect1.leader && deadNPC.id !== sect2.leader) {
            if (typeof killNPC === "function") killNPC(deadNPC, "tử trận tông môn chiến");
          }
        }
      }

      // Kết thúc chiến tranh
      if (war.duration >= war.maxDuration) {
        // Tính winner dựa trên tổng trận thắng
        var atkWins = war.battles.filter(function(b) { return b.result === "atk"; }).length;
        var defWins = war.battles.length - atkWins;
        war.winner = atkWins >= defWins ? war.attacker : war.defender;
        war.loser  = war.winner === war.attacker ? war.defender : war.attacker;

        var winnerSect = _findSect(war.winner);
        var loserSect  = _findSect(war.loser);

        if (winnerSect && loserSect) {
          // Thưởng người thắng
          var wType = WAR_TYPES[war.type] || WAR_TYPES["territory"];
          winnerSect.prestige = (winnerSect.prestige || 0) + _rand(100, 300);

          var extWinner = window.seV29Data && window.seV29Data.sectExtended ? window.seV29Data.sectExtended[winnerSect.id] : null;
          var extLoser  = window.seV29Data && window.seV29Data.sectExtended ? window.seV29Data.sectExtended[loserSect.id]  : null;

          if (war.type === "territory" && extWinner && extLoser && extLoser.territories.length > 0) {
            // Cướp lãnh thổ
            var stolen = extLoser.territories.pop();
            if (stolen) {
              extWinner.territories.push(stolen);
              window.swV29Data.stats.territoryConquests++;
              _log("🗺️ " + winnerSect.name + " chiếm " + stolen.name + " từ " + loserSect.name + "!", "conquest");
            }
          }
          if (war.type === "resource" && extWinner && extLoser) {
            // Cướp Linh Thạch
            var stolen2 = Math.floor((extLoser.resources.linhThach || 0) * 0.3);
            extLoser.resources.linhThach  -= stolen2;
            extWinner.resources.linhThach  = (extWinner.resources.linhThach || 0) + stolen2;
            _log("💎 " + winnerSect.name + " cướp " + stolen2 + " Linh Thạch từ " + loserSect.name + "!", "loot");
          }

          // Stats
          window.swV29Data.stats.sectWins[winnerSect.id] = (window.swV29Data.stats.sectWins[winnerSect.id] || 0) + 1;
          loserSect.prestige = Math.max(10, (loserSect.prestige || 0) - _rand(50, 150));

          var endMsg = "⚔️ TÔNG MÔN CHIẾN KẾT THÚC: " + winnerSect.name + " đại thắng " + loserSect.name + "! [" + wType.name + "]";
          _log(endMsg, "victory");
          if (typeof window.htAddEvent === "function") window.htAddEvent({ year: window.year || 0, type: "war", title: endMsg, color: wType.color });
          if (typeof addLog === "function") addLog(endMsg, "important");
        }

        war.endYear = window.year || 0;
        window.swV29Data.history.unshift(war);
        if (window.swV29Data.history.length > 50) window.swV29Data.history.pop();
        toEnd.push(war.id);
      }
    });

    window.swV29Data.wars = window.swV29Data.wars.filter(function(w) { return toEnd.indexOf(w.id) === -1; });
  }

  // ─── AI: Tự động khai chiến ───
  function _aiDeclareWar() {
    var allSects = _getSects();
    var eligibles = allSects.filter(function(s) { return (s.members || []).length >= 3 && !(s.warCooldown && s.warCooldown > 0); });
    if (eligibles.length < 2) return;
    if (window.swV29Data.wars.length >= 5) return; // max concurrent wars
    if (!_chance(0.04)) return; // 4% mỗi tick

    var atk = _pick(eligibles);
    var others = eligibles.filter(function(s) { return s.id !== atk.id; });
    if (!others.length) return;
    var def = _pick(others);

    // Xác định loại chiến tranh
    var warTypes = Object.keys(WAR_TYPES);
    var extAtk = window.seV29Data && window.seV29Data.sectExtended ? window.seV29Data.sectExtended[atk.id] : null;
    var extDef = window.seV29Data && window.seV29Data.sectExtended ? window.seV29Data.sectExtended[def.id]  : null;

    var chosenType = _pick(warTypes);
    // Holy war chỉ khi 2 bên khác type đạo
    if (chosenType === "holy" && extAtk && extDef && extAtk.type === extDef.type) {
      chosenType = "territory";
    }

    window.swV29DeclareWar(atk.id, def.id, chosenType);
    if (atk.warCooldown !== undefined) atk.warCooldown = 8;
    if (def.warCooldown !== undefined) def.warCooldown = 8;
  }

  // ─── Tick ───
  window.swV29Tick = function() {
    _processWars();
    _aiDeclareWar();
    if (Math.random() < 0.1) save();
  };

  // ─── Render Panel ───
  window.swV29RenderPanel = function() {
    var el = document.getElementById("panel-sect-war-v29");
    if (!el) return;
    var allSects = _getSects();

    var html = '<div style="padding:14px;max-width:900px;margin:0 auto;">';
    html += '<h2 style="color:#f87171;text-align:center;font-size:20px;margin-bottom:16px;">⚔️ CHIẾN TRANH TÔNG MÔN V29</h2>';

    // Stats
    html += '<div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;">';
    html += _statBox("⚔️", "Tổng Chiến Tranh", window.swV29Data.stats.totalWars, "#f87171");
    html += _statBox("🗺️", "Lãnh Thổ Chiếm Được", window.swV29Data.stats.territoryConquests, "#f97316");
    html += _statBox("🔥", "Đang Giao Tranh", window.swV29Data.wars.length, "#fbbf24");
    html += '</div>';

    // War type buttons
    html += '<div style="margin-bottom:16px;">';
    html += '<div style="color:#94a3b8;font-size:12px;margin-bottom:8px;">Khai chiến thủ công:</div>';
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap;">';
    Object.keys(WAR_TYPES).forEach(function(k) {
      var wt = WAR_TYPES[k];
      html += '<button onclick="window._swV29ManualWar(\'' + k + '\')" style="background:' + wt.color + '22;border:1px solid ' + wt.color + '55;color:' + wt.color + ';padding:6px 12px;border-radius:8px;cursor:pointer;font-size:12px;">';
      html += wt.icon + ' ' + wt.name + '</button>';
    });
    html += '</div></div>';

    // Active wars
    if (window.swV29Data.wars.length) {
      html += '<h3 style="color:#f87171;font-size:14px;margin-bottom:10px;">🔥 Đang Giao Tranh (' + window.swV29Data.wars.length + ')</h3>';
      html += '<div style="display:grid;gap:10px;margin-bottom:18px;">';
      window.swV29Data.wars.forEach(function(war) {
        var s1 = allSects.find(function(s) { return s.id === war.attacker; });
        var s2 = allSects.find(function(s) { return s.id === war.defender; });
        if (!s1 || !s2) return;
        var wt = WAR_TYPES[war.type] || WAR_TYPES["territory"];
        var atkWins = war.battles.filter(function(b) { return b.result === "atk"; }).length;
        var phaseName = WAR_PHASES[war.phase] || "Giao Phong";
        var progress = Math.floor(war.duration / war.maxDuration * 100);

        html += '<div style="background:rgba(248,113,113,0.08);border:1px solid #f8717133;border-radius:10px;padding:12px;">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
        html += '<span style="color:' + wt.color + ';font-weight:700;">' + wt.icon + ' ' + wt.name + '</span>';
        html += '<span style="color:#64748b;font-size:11px;">Giai đoạn: ' + phaseName + '</span>';
        html += '</div>';
        html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">';
        html += '<div style="flex:1;text-align:right;color:#fde68a;font-size:13px;font-weight:600;">' + _esc(s1.name) + '</div>';
        html += '<div style="color:#f87171;font-size:16px;">⚔️</div>';
        html += '<div style="flex:1;color:#60a5fa;font-size:13px;font-weight:600;">' + _esc(s2.name) + '</div>';
        html += '</div>';
        // Power bars
        var total = Math.max(1, _calcPower(s1) + _calcPower(s2));
        var atkPct = Math.floor(_calcPower(s1) / total * 100);
        html += '<div style="display:flex;gap:4px;align-items:center;font-size:11px;color:#94a3b8;margin-bottom:6px;">';
        html += '<div style="flex:' + atkPct + ';height:6px;background:#fde68a;border-radius:3px;"></div>';
        html += '<div style="flex:' + (100 - atkPct) + ';height:6px;background:#60a5fa;border-radius:3px;"></div>';
        html += '</div>';
        // Progress
        html += '<div style="font-size:11px;color:#64748b;">Tiến độ: ' + progress + '% · Trận thắng: ' + atkWins + '/' + war.battles.length + ' (tấn công)</div>';
        html += '</div>';
      });
      html += '</div>';
    } else {
      html += '<div style="text-align:center;color:#64748b;padding:20px;background:rgba(0,0,0,0.2);border-radius:8px;margin-bottom:18px;">⚔️ Đang Thái Bình — Không có chiến tranh</div>';
    }

    // War type ranking (which sect won most)
    var sectWins = window.swV29Data.stats.sectWins;
    var winList = Object.keys(sectWins).map(function(id) {
      var s = allSects.find(function(x) { return x.id === id; });
      return { name: s ? s.name : id, wins: sectWins[id] };
    }).sort(function(a, b) { return b.wins - a.wins; }).slice(0, 5);

    if (winList.length) {
      html += '<h3 style="color:#fde68a;font-size:14px;margin-bottom:8px;">🏆 Bảng Chiến Tích Tông Môn</h3>';
      html += '<div style="background:rgba(0,0,0,0.2);border-radius:8px;overflow:hidden;">';
      winList.forEach(function(item, i) {
        html += '<div style="display:flex;justify-content:space-between;padding:8px 14px;background:' + (i%2===0?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.06)") + ';">';
        html += '<span style="color:#e2e8f0;">' + (i+1) + '. ' + _esc(item.name) + '</span>';
        html += '<span style="color:#fde68a;">' + item.wins + ' chiến thắng</span>';
        html += '</div>';
      });
      html += '</div>';
    }

    // History
    if (window.swV29Data.history.length) {
      html += '<h3 style="color:#94a3b8;font-size:14px;margin:16px 0 8px;">📜 Lịch Sử Chiến Tranh</h3>';
      html += '<div style="max-height:180px;overflow-y:auto;">';
      window.swV29Data.history.slice(0, 20).forEach(function(war) {
        var s1 = allSects.find(function(s) { return s.id === war.attacker; });
        var s2 = allSects.find(function(s) { return s.id === war.defender; });
        var wt = WAR_TYPES[war.type] || WAR_TYPES["territory"];
        var winnerName = war.winner === (s1 && s1.id) ? (s1 && s1.name) : (s2 && s2.name);
        html += '<div style="font-size:12px;padding:4px 8px;border-left:2px solid ' + wt.color + '66;margin-bottom:3px;color:#94a3b8;">';
        html += '<span style="color:#475569;font-size:10px;">Năm ' + war.startYear + '→' + (war.endYear || "?") + '</span> ';
        html += wt.icon + ' ' + _esc((s1 && s1.name) || "?") + ' vs ' + _esc((s2 && s2.name) || "?");
        html += ' → <span style="color:#fde68a;">🏆 ' + _esc(winnerName || "?") + '</span>';
        html += '</div>';
      });
      html += '</div>';
    }

    // Log
    if (window.swV29Data.log.length) {
      html += '<h3 style="color:#94a3b8;font-size:14px;margin:16px 0 8px;">📋 Nhật Ký</h3>';
      html += '<div style="max-height:150px;overflow-y:auto;">';
      window.swV29Data.log.slice(0, 25).forEach(function(entry) {
        html += '<div style="font-size:12px;color:#cbd5e1;padding:3px 8px;border-left:2px solid #f8717144;margin-bottom:3px;">';
        html += '<span style="color:#64748b;font-size:10px;">Năm ' + entry.year + '</span> ' + _esc(entry.msg);
        html += '</div>';
      });
      html += '</div>';
    }

    html += '</div>';
    el.innerHTML = html;
  };

  // Manual war trigger helper
  window._swV29ManualWar = function(warType) {
    var allSects = _getSects();
    var eligibles = allSects.filter(function(s) { return (s.members || []).length >= 2; });
    if (eligibles.length < 2) {
      if (typeof toast === "function") toast("⚠️ Cần ít nhất 2 tông môn có đệ tử!");
      return;
    }
    var atk = _pick(eligibles);
    var def = _pick(eligibles.filter(function(s) { return s.id !== atk.id; }));
    window.swV29DeclareWar(atk.id, def.id, warType);
    window.swV29RenderPanel();
  };

  function _statBox(icon, label, value, color) {
    return '<div style="background:rgba(0,0,0,0.3);border:1px solid ' + color + '44;border-radius:8px;padding:10px 16px;flex:1;min-width:120px;">'
         + '<div style="font-size:18px;">' + icon + '</div>'
         + '<div style="color:' + color + ';font-size:18px;font-weight:700;">' + value + '</div>'
         + '<div style="color:#64748b;font-size:11px;">' + label + '</div>'
         + '</div>';
  }

  function _esc(s) { return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  function _calcPower(s) {
    if (!s) return 0;
    var allNPCs = _getNPCs();
    var mp = (s.members || []).reduce(function(sum, id) {
      var n = allNPCs.find(function(x) { return x.id === id; });
      return sum + (n ? (n.realm || 0) * 10 : 0);
    }, 0);
    return mp + (s.prestige || 0) * 0.5 + (s.armyPower || 0);
  }

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      if (Math.random() < 0.25) window.swV29Tick();
    };
    console.log("[SectWarEngineV29] ⚔️ Chiến Tranh Tông Môn V29 khởi động — 4 loại chiến tranh · AI tự động khai chiến.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 2800); });
  } else {
    setTimeout(init, 2800);
  }
})();
