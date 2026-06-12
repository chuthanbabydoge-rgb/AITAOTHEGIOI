(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════
  // SECT ENGINE V29 — Hệ Thống Môn Phái & Giáo Phái Mở Rộng
  // Mở rộng window.sects (app.js) — KHÔNG ghi đè
  // Save key: cgv6_sect_v29
  // ═══════════════════════════════════════════════════════

  var SAVE_KEY = "cgv6_sect_v29";

  // ─── Loại Giáo Phái ───
  var SECT_TYPES = {
    "chinhDao":    { name: "Chính Đạo",       icon: "☀️",  color: "#fde68a", bonus: "prestige+30%",   desc: "Tu luyện đạo đức, danh tiếng cao" },
    "maDao":       { name: "Ma Đạo",           icon: "💀",  color: "#f87171", bonus: "power+40%",      desc: "Sức mạnh hủy diệt, kẻ thù khiếp sợ" },
    "trungDao":    { name: "Trung Đạo",        icon: "⚖️",  color: "#a78bfa", bonus: "balance+25%",    desc: "Cân bằng âm dương, linh hoạt" },
    "thuongHoi":   { name: "Hội Thương Nhân",  icon: "💰",  color: "#4ade80", bonus: "gold+50%",       desc: "Làm giàu, thương mại khắp thế giới" },
    "satThu":      { name: "Hội Sát Thủ",      icon: "🗡️",  color: "#94a3b8", bonus: "espionage+40%",  desc: "Ám sát, gián điệp, bóng tối" },
    "phapSu":      { name: "Hội Pháp Sư",      icon: "🔮",  color: "#818cf8", bonus: "technique+60%",  desc: "Bí thuật, pháp thuật cổ xưa" },
    "giaoHoi":     { name: "Giáo Hội Thánh",   icon: "✨",  color: "#f0abfc", bonus: "faith+35%",      desc: "Thánh chiến, đức tin thiêng liêng" },
    "thuanHoa":    { name: "Thuần Hóa Thú",    icon: "🐉",  color: "#34d399", bonus: "beast+45%",      desc: "Linh vật, huyền thú bảo vệ" }
  };

  // ─── Cấp Bậc Thành Viên ───
  var SECT_RANKS = [
    { level: 0, name: "Đệ Tử Ngoại Môn",  icon: "👤", color: "#94a3b8", minRealm: 0 },
    { level: 1, name: "Đệ Tử Nội Môn",    icon: "🔵", color: "#60a5fa", minRealm: 1 },
    { level: 2, name: "Đệ Tử Tinh Anh",   icon: "🟢", color: "#4ade80", minRealm: 2 },
    { level: 3, name: "Đệ Tử Cốt Lõi",    icon: "🟡", color: "#fbbf24", minRealm: 3 },
    { level: 4, name: "Trưởng Lão",        icon: "🔶", color: "#f97316", minRealm: 4 },
    { level: 5, name: "Đại Trưởng Lão",   icon: "🔴", color: "#ef4444", minRealm: 5 },
    { level: 6, name: "Phó Tông Chủ",     icon: "💜", color: "#a855f7", minRealm: 6 },
    { level: 7, name: "Tông Chủ",         icon: "👑", color: "#fde68a", minRealm: 7 }
  ];

  // ─── Kỹ Thuật (Techniques) ───
  var TECHNIQUE_TEMPLATES = [
    { id:"t001", name:"Thiên Long Quyền",    type:"combat",    realm:2, rarity:"common",    effect:"Tăng công +15%" },
    { id:"t002", name:"Huyền Âm Chưởng",     type:"combat",    realm:3, rarity:"uncommon",  effect:"Tăng công +25%, xuyên phá phòng thủ" },
    { id:"t003", name:"Cửu Dương Thần Công", type:"cultivation",realm:4, rarity:"rare",      effect:"Tăng tốc tu luyện +50%" },
    { id:"t004", name:"Vạn Kiếm Quy Tông",   type:"combat",    realm:5, rarity:"epic",      effect:"Kiếm khí +80%, có thể cắt đứt pháp bảo" },
    { id:"t005", name:"Hóa Long Quyết",      type:"transform", realm:6, rarity:"legendary", effect:"Hóa thân rồng trong 3 giờ" },
    { id:"t006", name:"Địa Mạch Kinh",       type:"territory", realm:2, rarity:"common",    effect:"Khai phá tài nguyên lãnh thổ +30%" },
    { id:"t007", name:"Quỷ Hỏa Chú",        type:"curse",     realm:3, rarity:"uncommon",  effect:"Nguyền rủa kẻ thù, giảm sức mạnh -20%" },
    { id:"t008", name:"Bách Thảo Kinh",      type:"healing",   realm:1, rarity:"common",    effect:"Hồi phục thương thế nhanh hơn 2x" },
    { id:"t009", name:"Thiên Nhãn Thuật",    type:"divination",realm:4, rarity:"rare",      effect:"Nhìn thấu bí ẩn, tình báo +60%" },
    { id:"t010", name:"Phong Lôi Song Kiếm", type:"combat",    realm:5, rarity:"epic",      effect:"Đôi kiếm phong lôi, diện rộng +100%" },
    { id:"t011", name:"Trường Sinh Quyết",   type:"longevity", realm:7, rarity:"legendary", effect:"Tăng tuổi thọ +500 năm" },
    { id:"t012", name:"Thương Hải Biến Kinh",type:"economy",   realm:2, rarity:"common",    effect:"Thu nhập thương mại +40%" },
    { id:"t013", name:"Vạn Thú Lệnh",        type:"beast",     realm:3, rarity:"uncommon",  effect:"Thuần phục linh vật cấp thấp" },
    { id:"t014", name:"Tử Ảnh Bộ",           type:"stealth",   realm:4, rarity:"rare",      effect:"Ẩn thân hoàn hảo, ám sát +70%" },
    { id:"t015", name:"Thiên Đế Kiếm Điển",  type:"combat",    realm:8, rarity:"legendary", effect:"Kiếm khí trời đất, sức mạnh tối thượng" }
  ];

  // ─── Loại Lãnh Thổ ───
  var TERRITORY_TYPES = [
    { id:"mountain", name:"Linh Sơn",      icon:"⛰️",  bonus:"cultivation+20%" },
    { id:"city",     name:"Thành Phố",     icon:"🏙️",  bonus:"gold+30%" },
    { id:"resource", name:"Vùng Tài Nguyên",icon:"💎",  bonus:"resources+40%" },
    { id:"realm",    name:"Bí Cảnh",       icon:"🌀",  bonus:"technique+50%" },
    { id:"temple",   name:"Đền Thờ",       icon:"🛕",  bonus:"faith+35%" }
  ];

  // ─── State ───
  window.seV29Data = {
    initialized: false,
    sectExtended: {},   // sectId → extended data
    techniques: [],     // world techniques list
    log: [],
    stats: { totalWars: 0, techniquesDiscovered: 0, sectsFounded: 0 }
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.seV29Data)); } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) {
        var parsed = JSON.parse(d);
        Object.assign(window.seV29Data, parsed);
      }
    } catch(e) {}
  }

  function _log(msg, type) {
    window.seV29Data.log.unshift({ year: window.year || 0, msg: msg, type: type || "info" });
    if (window.seV29Data.log.length > 200) window.seV29Data.log.pop();
  }

  function _rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
  function _chance(p)   { return Math.random() < p; }
  function _pick(arr)   { return arr[Math.floor(Math.random() * arr.length)]; }

  // ─── Lấy sects từ app.js ───
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

  // ─── Enrich sect với V29 data ───
  function _enrichSect(s) {
    if (!s || !s.id) return;
    if (!window.seV29Data.sectExtended[s.id]) {
      var typeKeys = Object.keys(SECT_TYPES);
      window.seV29Data.sectExtended[s.id] = {
        type:        _pick(typeKeys),
        territories: [],
        resources: { linhThach: _rand(50, 200), vang: s.treasury || 100, coVat: _rand(0, 5), kyThuat: 0, thuVien: _rand(0, 3), diVat: 0 },
        techniques:  [],
        memberRanks: {},
        founded:     window.year || 0,
        reputation:  s.prestige || 100,
        influence:   _rand(10, 50),
        alliances:   [],
        rivals:      []
      };
      // Assign random territories
      var numTerr = Math.min((s.level || 1), 3);
      for (var i = 0; i < numTerr; i++) {
        var terrType = _pick(TERRITORY_TYPES);
        window.seV29Data.sectExtended[s.id].territories.push({
          type: terrType.id, name: terrType.name + " " + (i + 1), icon: terrType.icon, bonus: terrType.bonus
        });
      }
      // Give starting techniques based on level
      var techCount = Math.min((s.level || 1), 3);
      var availTechs = TECHNIQUE_TEMPLATES.filter(t => t.realm <= (s.level || 1) * 2);
      for (var j = 0; j < techCount && j < availTechs.length; j++) {
        window.seV29Data.sectExtended[s.id].techniques.push(availTechs[j].id);
      }
    }
    // Assign rank to each member
    var ext = window.seV29Data.sectExtended[s.id];
    var allNPCs = _getNPCs();
    (s.members || []).forEach(function(npcId) {
      if (!ext.memberRanks[npcId]) {
        var npc = allNPCs.find(function(n) { return n.id === npcId; });
        var realm = npc ? (npc.realm || 0) : 0;
        var rank = SECT_RANKS.filter(function(r) { return r.minRealm <= realm; });
        ext.memberRanks[npcId] = rank.length ? rank[rank.length - 1].level : 0;
      }
    });
    // Leader gets Tông Chủ rank
    if (s.leader) ext.memberRanks[s.leader] = 7;
    if (s.elders && s.elders.length) {
      s.elders.forEach(function(id, i) {
        ext.memberRanks[id] = Math.max(ext.memberRanks[id] || 0, i === 0 ? 6 : 4);
      });
    }
    return ext;
  }

  // ─── Tick ───
  window.seV29Tick = function() {
    var allSects = _getSects();
    if (!allSects.length) return;

    allSects.forEach(function(s) {
      _enrichSect(s);
      var ext = window.seV29Data.sectExtended[s.id];
      if (!ext) return;

      // Resource income mỗi tick
      var typeBonus = SECT_TYPES[ext.type] || {};
      var memberCount = (s.members || []).length;
      var level = s.level || 1;

      ext.resources.linhThach += _rand(1, 3) * level + Math.floor(memberCount * 0.5);
      ext.resources.vang      += _rand(2, 8) * level;
      ext.influence            = Math.min(1000, ext.influence + _rand(0, 2));
      ext.reputation           = s.prestige || ext.reputation;

      // Territory bonus
      ext.territories.forEach(function(t) {
        if (t.type === "resource") ext.resources.linhThach += _rand(2, 5);
        if (t.type === "city")     ext.resources.vang      += _rand(5, 15);
        if (t.type === "realm")    ext.resources.kyThuat   += _rand(0, 1);
        if (t.type === "temple")   ext.influence           += _rand(1, 3);
      });

      // Random technique discovery
      if (_chance(0.02) && level >= 2) {
        var available = TECHNIQUE_TEMPLATES.filter(function(t) {
          return t.realm <= level * 2 && ext.techniques.indexOf(t.id) === -1;
        });
        if (available.length) {
          var newTech = _pick(available);
          ext.techniques.push(newTech.id);
          ext.resources.thuVien++;
          _log("📖 " + s.name + " khai mở bí thuật mới: " + newTech.name + "!", "tech");
          window.seV29Data.stats.techniquesDiscovered++;
          if (typeof window.htAddEvent === "function") {
            window.htAddEvent({ year: window.year || 0, type: "sect", title: s.name + " khai mở " + newTech.name, color: "#a78bfa" });
          }
        }
      }

      // Cultivation bonus cho thành viên
      if (_chance(0.05) && typeof window.culAddXP === "function") {
        var bonus = level * 5 + memberCount;
        window.culAddXP(bonus);
      }
    });
  };

  // ─── Public API ───
  window.seV29GetType = function(sectId) {
    var ext = window.seV29Data.sectExtended[sectId];
    if (!ext) return null;
    return SECT_TYPES[ext.type];
  };

  window.seV29GetRank = function(sectId, npcId) {
    var ext = window.seV29Data.sectExtended[sectId];
    if (!ext) return SECT_RANKS[0];
    var rankLevel = ext.memberRanks[npcId] || 0;
    return SECT_RANKS[rankLevel] || SECT_RANKS[0];
  };

  window.seV29AddTerritory = function(sectId, terrTypeId) {
    var ext = window.seV29Data.sectExtended[sectId];
    var terrType = TERRITORY_TYPES.find(function(t) { return t.id === terrTypeId; });
    if (!ext || !terrType) return;
    ext.territories.push({ type: terrTypeId, name: terrType.name, icon: terrType.icon, bonus: terrType.bonus });
    save();
  };

  // ─── Render Panel: Môn Phái ───
  window.seV29RenderPanel = function() {
    var el = document.getElementById("panel-sect-v29");
    if (!el) return;
    var allSects = _getSects();
    if (!allSects.length) {
      el.innerHTML = '<div style="padding:30px;text-align:center;color:#94a3b8;">Chưa có môn phái nào. Hãy tạo thế giới và đợi NPC lập tông môn.</div>';
      return;
    }

    var html = '<div style="padding:14px;max-width:900px;margin:0 auto;">';
    html += '<h2 style="color:#fde68a;text-align:center;font-size:20px;margin-bottom:16px;">🏯 HỆ THỐNG MÔN PHÁI V29</h2>';

    // Stats bar
    html += '<div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;">';
    html += _statBox("🏯", "Tổng Môn Phái", allSects.length, "#fde68a");
    html += _statBox("📖", "Bí Thuật Khai Phá", window.seV29Data.stats.techniquesDiscovered, "#a78bfa");
    var totalMembers = allSects.reduce(function(s, x) { return s + (x.members || []).length; }, 0);
    html += _statBox("👥", "Tổng Đệ Tử", totalMembers, "#60a5fa");
    html += '</div>';

    // Sect list
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;">';
    allSects.forEach(function(s) {
      _enrichSect(s);
      var ext = window.seV29Data.sectExtended[s.id];
      if (!ext) return;
      var sType = SECT_TYPES[ext.type] || { name: "Chính Đạo", icon: "☀️", color: "#fde68a" };
      var allNPCs = _getNPCs();
      var leader = allNPCs.find(function(n) { return n.id === s.leader; });
      var memberCount = (s.members || []).length;
      var techCount = ext.techniques.length;
      var terrCount = ext.territories.length;

      html += '<div style="background:rgba(0,0,0,0.35);border:1px solid ' + sType.color + '44;border-radius:10px;padding:14px;">';
      html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">';
      html += '<span style="font-size:20px;">' + sType.icon + '</span>';
      html += '<div><div style="color:' + sType.color + ';font-weight:700;font-size:14px;">' + _esc(s.name) + '</div>';
      html += '<div style="color:#64748b;font-size:11px;">' + sType.name + ' · Cấp ' + (s.level || 1) + '</div></div>';
      html += '</div>';

      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;margin-bottom:10px;">';
      html += _infoRow("👑", "Tông Chủ", leader ? leader.name : "—");
      html += _infoRow("👥", "Đệ Tử", memberCount);
      html += _infoRow("⭐", "Uy Danh", Math.floor(s.prestige || 0));
      html += _infoRow("🌐", "Ảnh Hưởng", Math.floor(ext.influence));
      html += _infoRow("📍", "Lãnh Thổ", terrCount + " vùng");
      html += _infoRow("📖", "Bí Thuật", techCount + " kỹ");
      html += '</div>';

      // Resources
      html += '<div style="font-size:11px;color:#94a3b8;border-top:1px solid rgba(255,255,255,0.08);padding-top:8px;">';
      html += '💎 Linh Thạch: <span style="color:#a5f3fc;">' + Math.floor(ext.resources.linhThach) + '</span>  ';
      html += '💰 Vàng: <span style="color:#fde68a;">' + Math.floor(ext.resources.vang) + '</span>  ';
      html += '📜 Thư Viện: <span style="color:#a78bfa;">' + ext.resources.thuVien + '</span>';
      html += '</div>';

      // Territories
      if (terrCount) {
        html += '<div style="margin-top:8px;font-size:11px;">';
        ext.territories.forEach(function(t) {
          html += '<span style="background:rgba(255,255,255,0.07);padding:2px 7px;border-radius:10px;margin:2px 2px 0 0;display:inline-block;">' + t.icon + ' ' + t.name + '</span>';
        });
        html += '</div>';
      }

      html += '</div>';
    });
    html += '</div>';

    // Log
    if (window.seV29Data.log.length) {
      html += '<div style="margin-top:20px;">';
      html += '<h3 style="color:#a78bfa;font-size:14px;margin-bottom:8px;">📋 Sự Kiện Môn Phái</h3>';
      html += '<div style="max-height:180px;overflow-y:auto;">';
      window.seV29Data.log.slice(0, 30).forEach(function(entry) {
        html += '<div style="font-size:12px;color:#cbd5e1;padding:3px 8px;border-left:2px solid #a78bfa44;margin-bottom:3px;">';
        html += '<span style="color:#64748b;font-size:10px;">Năm ' + entry.year + '</span> ' + _esc(entry.msg);
        html += '</div>';
      });
      html += '</div></div>';
    }

    html += '</div>';
    el.innerHTML = html;
  };

  // ─── Render Panel: Kỹ Thuật ───
  window.seV29RenderTechPanel = function() {
    var el = document.getElementById("panel-techniques-v29");
    if (!el) return;
    var allSects = _getSects();

    var html = '<div style="padding:14px;max-width:900px;margin:0 auto;">';
    html += '<h2 style="color:#a78bfa;text-align:center;font-size:20px;margin-bottom:16px;">📖 KHO BÍ THUẬT THẾ GIỚI</h2>';

    var rarityColors = { common:"#94a3b8", uncommon:"#4ade80", rare:"#60a5fa", epic:"#a855f7", legendary:"#fbbf24" };
    var rarityNames  = { common:"Phổ Thông", uncommon:"Hiếm", rare:"Quý Hiếm", epic:"Sử Thi", legendary:"Huyền Thoại" };

    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;">';
    TECHNIQUE_TEMPLATES.forEach(function(t) {
      var color = rarityColors[t.rarity] || "#94a3b8";
      // Find which sects have this technique
      var sectNames = [];
      allSects.forEach(function(s) {
        var ext = window.seV29Data.sectExtended[s.id];
        if (ext && ext.techniques.indexOf(t.id) !== -1) sectNames.push(s.name);
      });

      html += '<div style="background:rgba(0,0,0,0.3);border:1px solid ' + color + '44;border-radius:8px;padding:12px;">';
      html += '<div style="color:' + color + ';font-weight:700;font-size:13px;margin-bottom:6px;">' + _esc(t.name) + '</div>';
      html += '<div style="font-size:11px;color:#64748b;margin-bottom:6px;">';
      html += '<span style="background:' + color + '22;padding:1px 6px;border-radius:8px;color:' + color + ';">' + (rarityNames[t.rarity] || t.rarity) + '</span>  ';
      html += 'Yêu cầu Cảnh ' + t.realm + ' · ' + _typeLabel(t.type);
      html += '</div>';
      html += '<div style="font-size:12px;color:#cbd5e1;margin-bottom:6px;">⚡ ' + _esc(t.effect) + '</div>';
      if (sectNames.length) {
        html += '<div style="font-size:11px;color:#94a3b8;">🏯 ' + sectNames.join(", ") + '</div>';
      } else {
        html += '<div style="font-size:11px;color:#475569;">Chưa có tông môn nào khai phá</div>';
      }
      html += '</div>';
    });
    html += '</div></div>';
    el.innerHTML = html;
  };

  // ─── Render Panel: Đệ Tử ───
  window.seV29RenderDiscPanel = function() {
    var el = document.getElementById("panel-disciples-v29");
    if (!el) return;
    var allSects = _getSects();
    var allNPCs  = _getNPCs();

    var html = '<div style="padding:14px;max-width:900px;margin:0 auto;">';
    html += '<h2 style="color:#60a5fa;text-align:center;font-size:20px;margin-bottom:16px;">🎓 BẢNG ĐỆ TỬ CÁC MÔN PHÁI</h2>';

    allSects.slice(0, 8).forEach(function(s) {
      _enrichSect(s);
      var ext = window.seV29Data.sectExtended[s.id];
      if (!ext) return;
      var sType = SECT_TYPES[ext.type] || { name: "Chính Đạo", icon: "☀️", color: "#fde68a" };
      var liveMembers = (s.members || []).map(function(id) {
        return allNPCs.find(function(n) { return n.id === id; });
      }).filter(Boolean).sort(function(a, b) { return (b.realm || 0) - (a.realm || 0); });

      if (!liveMembers.length) return;

      html += '<div style="margin-bottom:18px;">';
      html += '<div style="color:' + sType.color + ';font-weight:700;font-size:14px;margin-bottom:8px;">' + sType.icon + ' ' + _esc(s.name) + ' (' + liveMembers.length + ' đệ tử)</div>';
      html += '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:12px;">';
      html += '<tr style="background:rgba(255,255,255,0.05);color:#94a3b8;"><th style="padding:6px 10px;text-align:left;">Tên</th><th style="padding:6px 10px;">Cảnh Giới</th><th style="padding:6px 10px;">Cấp Bậc</th><th style="padding:6px 10px;">Tuổi</th><th style="padding:6px 10px;">Uy Danh</th></tr>';

      liveMembers.slice(0, 10).forEach(function(npc, i) {
        var rankLevel = ext.memberRanks[npc.id] || 0;
        var rank = SECT_RANKS[rankLevel] || SECT_RANKS[0];
        var realmName = (window.REALMS && window.REALMS[npc.realm]) ? window.REALMS[npc.realm].name : ("Cảnh " + (npc.realm || 0));
        var bg = i % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)";
        html += '<tr style="background:' + bg + ';">';
        html += '<td style="padding:5px 10px;color:#e2e8f0;">' + (npc.id === s.leader ? "👑 " : "") + _esc(npc.name || "?") + '</td>';
        html += '<td style="padding:5px 10px;text-align:center;color:#a78bfa;">' + realmName + '</td>';
        html += '<td style="padding:5px 10px;text-align:center;color:' + rank.color + ';">' + rank.icon + ' ' + rank.name + '</td>';
        html += '<td style="padding:5px 10px;text-align:center;color:#64748b;">' + (npc.age || "?") + '</td>';
        html += '<td style="padding:5px 10px;text-align:center;color:#fde68a;">' + Math.floor(npc.reputation || 0) + '</td>';
        html += '</tr>';
      });
      if (liveMembers.length > 10) {
        html += '<tr><td colspan="5" style="padding:5px 10px;color:#475569;text-align:center;">... và ' + (liveMembers.length - 10) + ' đệ tử khác</td></tr>';
      }
      html += '</table></div></div>';
    });

    if (!allSects.length) html += '<div style="text-align:center;color:#64748b;padding:40px;">Chưa có môn phái nào.</div>';
    html += '</div>';
    el.innerHTML = html;
  };

  // ─── Helpers ───
  function _statBox(icon, label, value, color) {
    return '<div style="background:rgba(0,0,0,0.3);border:1px solid ' + color + '44;border-radius:8px;padding:10px 16px;flex:1;min-width:130px;">'
         + '<div style="font-size:18px;">' + icon + '</div>'
         + '<div style="color:' + color + ';font-size:18px;font-weight:700;">' + value + '</div>'
         + '<div style="color:#64748b;font-size:11px;">' + label + '</div>'
         + '</div>';
  }

  function _infoRow(icon, label, value) {
    return '<div style="color:#94a3b8;">' + icon + ' ' + label + ': <span style="color:#e2e8f0;">' + value + '</span></div>';
  }

  function _typeLabel(type) {
    var labels = { combat:"⚔️ Công Kích", cultivation:"🌀 Tu Luyện", transform:"✨ Biến Hóa",
                   territory:"🗺️ Lãnh Thổ", curse:"💀 Nguyền Rủa", healing:"💚 Trị Thương",
                   divination:"👁️ Tiên Tri", longevity:"⏳ Trường Sinh", economy:"💰 Kinh Tế",
                   beast:"🐉 Thú Thuật", stealth:"🌑 Ẩn Thân" };
    return labels[type] || type;
  }

  function _esc(s) {
    return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

  // ─── Init ───
  function init() {
    load();
    // Hook vào gameTick
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      if (Math.random() < 0.3) window.seV29Tick(); // chạy 30% tick để tiết kiệm CPU
    };
    // Enrich existing sects ngay khi load
    setTimeout(function() {
      var allSects = _getSects();
      allSects.forEach(function(s) { _enrichSect(s); });
      save();
      console.log("[SectEngineV29] 🏯 Hệ Thống Môn Phái V29 khởi động — " + Object.keys(SECT_TYPES).length + " loại giáo phái · " + TECHNIQUE_TEMPLATES.length + " bí thuật · 8 cấp bậc.");
    }, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 2600); });
  } else {
    setTimeout(init, 2600);
  }
})();
