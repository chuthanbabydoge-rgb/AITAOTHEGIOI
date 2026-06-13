(function() {
  "use strict";
  const SAVE_KEY = "cgv6_race_ability_v44";

  // ─── 50+ Kỹ Năng Theo Kỷ Nguyên ─────────────────────────────────────────
  var ABILITY_POOL = [
    // Chaos (Hỗn Mang)
    { id:"primal_roar",    ageId:"chaos",      name:"Gầm Nguyên Thủy",    icon:"🗣️",  type:"combat",  rarity:"common",   desc:"Tiếng gầm khiến kẻ thù sợ hãi. +10% power trong chiến đấu.",     effect:{ power:10 } },
    { id:"survival",       ageId:"chaos",      name:"Bản Năng Sinh Tồn",  icon:"💪",  type:"passive", rarity:"common",   desc:"Tốc độ tăng dân số +5%.",                                          effect:{ populationGrowth:0.005 } },
    { id:"chaos_adapt",    ageId:"chaos",      name:"Thích Nghi Hỗn Mang",icon:"🌀",  type:"passive", rarity:"rare",     desc:"Chủng tộc thích nghi với mọi điều kiện cực đoan.",                 effect:{ resilience:15 } },

    // Myth (Thần Thoại)
    { id:"divine_touch",   ageId:"myth",       name:"Cảm Ứng Thần Thánh", icon:"✨",  type:"magic",   rarity:"common",   desc:"+15 magic. Chủng tộc nhận được ân điển thần linh.",              effect:{ magic:15 } },
    { id:"mythweave",      ageId:"myth",       name:"Dệt Huyền Thoại",    icon:"📖",  type:"culture", rarity:"rare",     desc:"+12 culture. Tạo ra sử thi bất hủ.",                              effect:{ culture:12 } },
    { id:"spirit_bond",    ageId:"myth",       name:"Kết Nối Linh Hồn",   icon:"🔮",  type:"magic",   rarity:"epic",     desc:"Liên kết với thần bảo hộ. +20 magic khi thần còn sống.",         effect:{ magic:20 } },

    // Hero (Anh Hùng)
    { id:"heroic_blood",   ageId:"hero",       name:"Huyết Mạch Anh Hùng",icon:"⚔️",  type:"combat",  rarity:"common",   desc:"+15 power. Sinh ra nhiều anh hùng hơn.",                         effect:{ power:15 } },
    { id:"saga_telling",   ageId:"hero",       name:"Kể Chuyện Anh Hùng", icon:"🎭",  type:"culture", rarity:"common",   desc:"+8 culture. Truyền cảm hứng cho thế hệ sau.",                     effect:{ culture:8 } },
    { id:"war_mastery",    ageId:"hero",       name:"Thông Thạo Chiến Trận",icon:"🛡️", type:"combat",  rarity:"rare",     desc:"+10 power. Giảm 20% thương vong trong chiến tranh.",             effect:{ power:10 } },
    { id:"quest_drive",    ageId:"hero",       name:"Khát Vọng Phiêu Lưu", icon:"🗺️",  type:"passive", rarity:"epic",     desc:"Mở rộng lãnh thổ nhanh hơn 25%.",                                effect:{ expansion:25 } },

    // Ancient (Cổ Đại)
    { id:"stonecraft",     ageId:"ancient",    name:"Nghệ Thuật Đá",       icon:"🏛️",  type:"tech",    rarity:"common",   desc:"+10 tech. Xây dựng kỳ quan.",                                    effect:{ tech:10 } },
    { id:"law_codex",      ageId:"ancient",    name:"Bộ Luật Thành Văn",   icon:"📜",  type:"culture", rarity:"rare",     desc:"+15 culture. Xã hội ổn định hơn.",                               effect:{ culture:15 } },
    { id:"trade_routes",   ageId:"ancient",    name:"Tuyến Thương Mại",    icon:"💰",  type:"economy", rarity:"common",   desc:"+10 tech. Kinh tế phát triển bền vững.",                         effect:{ tech:10 } },
    { id:"philosophy",     ageId:"ancient",    name:"Triết Học",           icon:"🦉",  type:"culture", rarity:"epic",     desc:"+20 culture. Nền tảng tư tưởng vĩnh cửu.",                       effect:{ culture:20 } },

    // Empire (Đế Quốc)
    { id:"iron_legion",    ageId:"empire",     name:"Đạo Binh Sắt Thép",   icon:"⚔️",  type:"combat",  rarity:"rare",     desc:"+15 power. Quân đội tinh nhuệ vô địch.",                        effect:{ power:15 } },
    { id:"road_network",   ageId:"empire",     name:"Mạng Lưới Đường Sá",  icon:"🛣️",  type:"tech",    rarity:"common",   desc:"+10 tech. Di chuyển nhanh hơn 30%.",                             effect:{ tech:10 } },
    { id:"cultural_hege",  ageId:"empire",     name:"Bá Quyền Văn Hóa",    icon:"👑",  type:"culture", rarity:"epic",     desc:"+15 culture. Đồng hóa dân tộc nhỏ hơn.",                        effect:{ culture:15 } },
    { id:"admin_genius",   ageId:"empire",     name:"Thiên Tài Hành Chính", icon:"📋",  type:"passive", rarity:"rare",     desc:"Duy trì đế quốc lớn mà không sụp đổ.",                          effect:{ stability:20 } },

    // Revival (Trung Hưng)
    { id:"renaissance",    ageId:"revival",    name:"Phục Hưng Nghệ Thuật", icon:"🎨",  type:"culture", rarity:"common",   desc:"+15 culture. Nghệ thuật bùng nổ.",                               effect:{ culture:15 } },
    { id:"reformation",    ageId:"revival",    name:"Cải Cách Tôn Giáo",   icon:"⛪",  type:"culture", rarity:"rare",     desc:"+10 culture. Cải tổ tín ngưỡng.",                                effect:{ culture:10 } },
    { id:"humanism",       ageId:"revival",    name:"Nhân Văn Luận",        icon:"🌸",  type:"culture", rarity:"epic",     desc:"+20 culture. Cách mạng tư tưởng vĩnh cửu.",                      effect:{ culture:20 } },
    { id:"exploration",    ageId:"revival",    name:"Khám Phá Thế Giới",    icon:"🔭",  type:"tech",    rarity:"rare",     desc:"+12 tech. Vẽ bản đồ thế giới.",                                  effect:{ tech:12 } },

    // Industrial (Công Nghiệp)
    { id:"steam_power",    ageId:"industrial", name:"Năng Lượng Hơi Nước",  icon:"⚙️",  type:"tech",    rarity:"common",   desc:"+15 tech. Cách mạng sản xuất.",                                  effect:{ tech:15 } },
    { id:"mass_prod",      ageId:"industrial", name:"Sản Xuất Hàng Loạt",   icon:"🏭",  type:"tech",    rarity:"rare",     desc:"+10 tech, tăng dân số nhanh hơn.",                               effect:{ tech:10, populationGrowth:0.005 } },
    { id:"rail_network",   ageId:"industrial", name:"Mạng Đường Sắt",       icon:"🚂",  type:"tech",    rarity:"rare",     desc:"+12 tech. Kết nối toàn lục địa.",                                effect:{ tech:12 } },
    { id:"industrialism",  ageId:"industrial", name:"Chủ Nghĩa Công Nghiệp",icon:"💡",  type:"passive", rarity:"epic",     desc:"+20 tech. Nền tảng tiến bộ kỹ thuật bền vững.",                  effect:{ tech:20 } },

    // Tech (Công Nghệ)
    { id:"computing",      ageId:"tech",       name:"Kỷ Nguyên Tính Toán",  icon:"💻",  type:"tech",    rarity:"common",   desc:"+15 tech. Máy tính hóa mọi thứ.",                                effect:{ tech:15 } },
    { id:"biotech",        ageId:"tech",       name:"Công Nghệ Sinh Học",   icon:"🧬",  type:"tech",    rarity:"rare",     desc:"+12 tech. Chỉnh sửa gen chủng tộc.",                            effect:{ tech:12 } },
    { id:"ai_assist",      ageId:"tech",       name:"Trí Tuệ Nhân Tạo",     icon:"🤖",  type:"tech",    rarity:"epic",     desc:"+20 tech. AI quản lý hệ thống xã hội.",                          effect:{ tech:20 } },
    { id:"nano_tech",      ageId:"tech",       name:"Công Nghệ Nano",        icon:"⚡",  type:"tech",    rarity:"legendary",desc:"+25 tech. Kiểm soát vật chất cấp nguyên tử.",                   effect:{ tech:25 } },

    // Space (Không Gian)
    { id:"stellar_nav",    ageId:"space",      name:"Hàng Hải Thiên Hà",    icon:"🚀",  type:"tech",    rarity:"rare",     desc:"+15 tech. Chinh phục các hành tinh mới.",                       effect:{ tech:15 } },
    { id:"zero_gravity",   ageId:"space",      name:"Thích Nghi Không Trọng",icon:"🌌", type:"passive", rarity:"rare",     desc:"Hoạt động hiệu quả trong không gian vũ trụ.",                    effect:{ expansion:20 } },
    { id:"cosmic_mining",  ageId:"space",      name:"Khai Thác Vũ Trụ",     icon:"⛏️",  type:"economy", rarity:"epic",     desc:"+15 tech. Tài nguyên vũ trụ không giới hạn.",                   effect:{ tech:15 } },

    // Cosmos (Liên Vũ Trụ)
    { id:"void_walk",      ageId:"cosmos",     name:"Bước Vào Hư Không",    icon:"🌀",  type:"magic",   rarity:"epic",     desc:"+15 magic. Dịch chuyển qua không gian.",                         effect:{ magic:15 } },
    { id:"cosmic_harmony", ageId:"cosmos",     name:"Hòa Hợp Vũ Trụ",       icon:"☯️",  type:"passive", rarity:"legendary",desc:"Dung hợp magic và tech. +10 cả hai.",                           effect:{ magic:10, tech:10 } },
    { id:"dimensional",    ageId:"cosmos",     name:"Nhận Thức Đa Chiều",    icon:"🔮",  type:"magic",   rarity:"rare",     desc:"+12 magic. Thấy được đa chiều không gian.",                     effect:{ magic:12 } },

    // Multiverse (Đa Vũ Trụ)
    { id:"mv_anchor",      ageId:"multiverse", name:"Điểm Neo Đa Vũ Trụ",   icon:"⚓",  type:"passive", rarity:"epic",     desc:"Chủng tộc tồn tại trong nhiều vũ trụ song song.",                effect:{ resilience:25 } },
    { id:"reality_bend",   ageId:"multiverse", name:"Uốn Cong Thực Tại",    icon:"🌈",  type:"magic",   rarity:"legendary",desc:"+20 magic. Thay đổi quy luật vật lý cục bộ.",                   effect:{ magic:20 } },
    { id:"parallel_mind",  ageId:"multiverse", name:"Tâm Trí Song Song",     icon:"🧠",  type:"passive", rarity:"epic",     desc:"Xử lý thông tin từ mọi bản thể song song.",                      effect:{ tech:15, magic:10 } },

    // Genesis (Sáng Thế)
    { id:"creator_spark",  ageId:"genesis",    name:"Tia Sáng Tạo Hóa",     icon:"⚡",  type:"magic",   rarity:"legendary",desc:"+30 magic. Hiểu được bí mật sáng tạo thế giới.",               effect:{ magic:30 } },
    { id:"eternal_legacy", ageId:"genesis",    name:"Di Sản Vĩnh Cửu",       icon:"♾️",  type:"culture", rarity:"legendary",desc:"+25 culture. Văn hóa trường tồn vượt thời gian.",               effect:{ culture:25 } },
    { id:"transcendence",  ageId:"genesis",    name:"Siêu Việt Tối Thượng",  icon:"🌟",  type:"passive", rarity:"legendary",desc:"+20 tất cả stats. Đạt đến đỉnh cao tiến hóa.",                  effect:{ power:20, magic:20, tech:20, culture:20 } },

    // Mutations (đặc biệt — có thể xuất hiện bất kỳ lúc nào)
    { id:"mutation_giant",  ageId:"any",       name:"Đột Biến Khổng Lồ",    icon:"🦕",  type:"combat",  rarity:"rare",     desc:"+20 power. Cơ thể phát triển vượt bậc.",                        effect:{ power:20 } },
    { id:"mutation_psychic",ageId:"any",       name:"Đột Biến Thần Giao",   icon:"👁️",  type:"magic",   rarity:"epic",     desc:"+18 magic. Khả năng đọc tâm trí.",                              effect:{ magic:18 } },
    { id:"mutation_swift",  ageId:"any",       name:"Đột Biến Tốc Độ",      icon:"💨",  type:"passive", rarity:"rare",     desc:"Di chuyển cực nhanh. Mọi hành động nhanh hơn 30%.",             effect:{ speed:30 } },
    { id:"mutation_regen",  ageId:"any",       name:"Đột Biến Tái Sinh",    icon:"💚",  type:"passive", rarity:"epic",     desc:"Tái sinh từ thương tích cực nặng.",                              effect:{ resilience:20 } }
  ];

  // ─── State ───────────────────────────────────────────────────────────────
  function defaultData() {
    return { unlockedAbilities: {}, mutationHistory: [], totalUnlocked: 0, tick: 0 };
  }
  window.raeData = window.raeData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.raeData)); } catch(e) {} }
  function load() {
    try {
      var r = localStorage.getItem(SAVE_KEY);
      if (r) { var p = JSON.parse(r); if (p) window.raeData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  // ─── API ─────────────────────────────────────────────────────────────────
  window.raeGetAbilityPool = function() { return ABILITY_POOL; };
  window.raeGetAbilitiesByAge = function(ageId) {
    return ABILITY_POOL.filter(function(a){ return a.ageId === ageId || a.ageId === "any"; });
  };
  window.raeGetRaceAbilities = function(raceId) {
    return window.raeData.unlockedAbilities[raceId] || [];
  };
  window.raeHasAbility = function(raceId, abilityId) {
    return (window.raeData.unlockedAbilities[raceId]||[]).includes(abilityId);
  };

  window.raeUnlockAbility = function(raceId, abilityId) {
    if (!window.raeData.unlockedAbilities[raceId]) window.raeData.unlockedAbilities[raceId] = [];
    if (window.raeData.unlockedAbilities[raceId].includes(abilityId)) return false;
    var ability = ABILITY_POOL.find(function(a){ return a.id === abilityId; });
    if (!ability) return false;

    window.raeData.unlockedAbilities[raceId].push(abilityId);
    window.raeData.totalUnlocked++;

    // Áp dụng effect lên race
    var race = typeof window.recGetRace === "function" ? window.recGetRace(raceId) : null;
    if (race) {
      Object.keys(ability.effect||{}).forEach(function(stat) {
        if (race.baseStats && stat in race.baseStats) {
          race.baseStats[stat] = Math.min(100, (race.baseStats[stat]||0) + ability.effect[stat]);
        }
        if (stat === "populationGrowth") {
          race.populationGrowth = (race.populationGrowth||1.01) + ability.effect[stat];
        }
      });
    }

    var msg = (race?race.icon:"❓") + " " + (race?race.name:raceId) + " mở khóa: " + ability.icon + " " + ability.name;
    if (typeof window.htAddEvent === "function")
      window.htAddEvent({ year:window.year||0, type:"race", title:"[Kỹ Năng] " + msg, color:"#a78bfa" });
    if (typeof window.waeAddAlert === "function")
      window.waeAddAlert({ type:"race_ability", icon:ability.icon, title:msg, year:window.year||0 });

    save();
    return true;
  };

  window.raeCheckMutation = function(raceId) {
    var mutations = ABILITY_POOL.filter(function(a){ return a.ageId === "any"; });
    if (Math.random() > 0.3) return;
    var mut = mutations[Math.floor(Math.random() * mutations.length)];
    if (mut && !window.raeHasAbility(raceId, mut.id)) {
      window.raeUnlockAbility(raceId, mut.id);
      window.raeData.mutationHistory.push({ raceId:raceId, abilityId:mut.id, year:window.year||0 });
      if (window.raeData.mutationHistory.length > 50) window.raeData.mutationHistory.length = 50;
      save();
    }
  };

  // Auto-unlock theo kỷ nguyên
  window.raeAutoUnlockForAge = function(ageId) {
    if (!window.recGetAll) return;
    var races = window.recGetAll();
    var ageAbilities = ABILITY_POOL.filter(function(a){ return a.ageId === ageId && a.rarity === "common"; });
    races.forEach(function(race) {
      if (race.extinct) return;
      var candidates = ageAbilities.filter(function(a){ return !window.raeHasAbility(race.id, a.id); });
      if (candidates.length > 0) {
        var pick = candidates[Math.floor(Math.random() * candidates.length)];
        window.raeUnlockAbility(race.id, pick.id);
      }
    });
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  window.raeRenderPanel = function() {
    var el = document.getElementById("panel-race-abilities-v44");
    if (!el) return;
    var races = typeof window.recGetAll === "function" ? window.recGetAll() : [];
    var rarityColors = { common:"#94a3b8", rare:"#60a5fa", epic:"#a78bfa", legendary:"#fbbf24" };

    var html = '<div style="padding:20px;max-width:900px;margin:0 auto">';
    html += '<h2 style="font-family:Cinzel,serif;color:#a78bfa;font-size:18px;margin-bottom:16px">⚡ Kỹ Năng Chủng Tộc V44</h2>';
    html += '<div style="font-size:11px;color:#64748b;margin-bottom:16px">Tổng đã mở khóa: <span style="color:#fbbf24">'+window.raeData.totalUnlocked+'</span> kỹ năng</div>';

    races.filter(function(r){ return !r.extinct; }).forEach(function(race) {
      var unlockedIds = window.raeGetRaceAbilities(race.id);
      var unlockedSet = new Set(unlockedIds);
      html += '<div style="background:#0f172a;border:1px solid '+(race.color||"#334155")+'44;border-radius:10px;padding:14px;margin-bottom:14px">';
      html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">';
      html += '<span style="font-size:22px">'+race.icon+'</span>';
      html += '<span style="font-size:14px;font-weight:700;color:'+(race.color||"#e2e8f0")+'">'+race.name+'</span>';
      html += '<span style="font-size:11px;color:#64748b;margin-left:auto">'+unlockedIds.length+' kỹ năng đã mở</span>';
      html += '</div>';

      // Hiển thị kỹ năng đã mở
      if (unlockedIds.length > 0) {
        html += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">';
        unlockedIds.forEach(function(aid) {
          var ab = ABILITY_POOL.find(function(a){ return a.id === aid; });
          if (!ab) return;
          html += '<div title="'+ab.desc+'" style="padding:4px 10px;background:#1e293b;border:1px solid '+(rarityColors[ab.rarity]||"#334155")+'44;border-radius:8px;font-size:11px;color:'+(rarityColors[ab.rarity]||"#94a3b8")+'">';
          html += ab.icon + ' ' + ab.name;
          html += '</div>';
        });
        html += '</div>';
      }

      // Kỹ năng có thể mở theo kỷ nguyên hiện tại
      var currentAgeId = (typeof window.waeGetCurrentAge === "function") ? (window.waeGetCurrentAge()||{}).id : null;
      if (currentAgeId) {
        var available = window.raeGetAbilitiesByAge(currentAgeId).filter(function(a){ return !unlockedSet.has(a.id); });
        if (available.length > 0) {
          html += '<div style="font-size:11px;color:#64748b;margin-bottom:6px">Có thể mở khóa kỷ nguyên này:</div>';
          html += '<div style="display:flex;flex-wrap:wrap;gap:6px">';
          available.slice(0,4).forEach(function(ab) {
            html += '<button onclick="raeUnlockAbility(\''+race.id+'\',\''+ab.id+'\');raeRenderPanel()" ';
            html += 'style="padding:5px 10px;background:#0f172a;border:1px solid '+(rarityColors[ab.rarity]||"#334155")+';border-radius:8px;cursor:pointer;font-size:11px;color:'+(rarityColors[ab.rarity]||"#94a3b8")+'" ';
            html += 'title="'+ab.desc+'">';
            html += ab.icon + ' ' + ab.name + ' [' + ab.rarity + ']';
            html += '</button>';
          });
          html += '</div>';
        }
      }
      html += '</div>';
    });

    // Đột biến lịch sử
    if (window.raeData.mutationHistory.length > 0) {
      html += '<div style="background:#0f172a;border:1px solid #a78bfa44;border-radius:8px;padding:12px;margin-top:10px">';
      html += '<div style="font-size:13px;color:#a78bfa;margin-bottom:8px">🧬 Lịch Sử Đột Biến</div>';
      window.raeData.mutationHistory.slice(0,8).forEach(function(m) {
        var ab = ABILITY_POOL.find(function(a){ return a.id === m.abilityId; });
        var race = typeof window.recGetRace === "function" ? window.recGetRace(m.raceId) : null;
        html += '<div style="font-size:11px;color:#64748b;padding:3px 0;border-bottom:1px solid #1e293b">';
        html += 'Năm '+m.year+': '+(race?race.icon+' '+race.name:m.raceId)+' → '+(ab?ab.icon+' '+ab.name:m.abilityId);
        html += '</div>';
      });
      html += '</div>';
    }
    html += '</div>';
    el.innerHTML = html;
  };

  // ─── Tick ────────────────────────────────────────────────────────────────
  window.raeTick = function() {
    window.raeData.tick = (window.raeData.tick||0) + 1;
    if (window.raeData.tick % 25 === 0) {
      // Auto-check kỷ nguyên để mở khóa kỹ năng
      var currentAgeId = (typeof window.waeGetCurrentAge === "function") ? (window.waeGetCurrentAge()||{}).id : null;
      if (currentAgeId && Math.random() < 0.2) {
        window.raeAutoUnlockForAge(currentAgeId);
      }
      save();
    }
  };

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); window.raeTick(); };
    console.log("[RaceAbilityEngine V44] ⚡ Hệ Thống Kỹ Năng Chủng Tộc · " + ABILITY_POOL.length + " kỹ năng · " + window.raeData.totalUnlocked + " đã mở.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 3500); });
  } else {
    setTimeout(init, 3500);
  }
})();
