(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATOR BOSS FACTORY V40 — Xưởng Tạo Boss
  // World Boss · Divine Boss · Multiverse Boss · Creator Boss
  // ═══════════════════════════════════════════════════════════════════════════

  const SAVE_KEY = "cgv6_creator_boss_v40";

  const BOSS_TIERS = [
    { id:"world",      name:"World Boss",      icon:"👹", color:"#f97316", power:500,  rewardMult:1.0, desc:"Boss địa phương, chỉ ảnh hưởng một thế giới"  },
    { id:"divine",     name:"Divine Boss",     icon:"☠️", color:"#fbbf24", power:2000, rewardMult:3.0, desc:"Boss thần thánh, xuyên qua nhiều cõi giới"    },
    { id:"multiverse", name:"Multiverse Boss", icon:"🌌", color:"#a78bfa", power:8000, rewardMult:8.0, desc:"Boss đa vũ trụ, đe dọa sự tồn tại của vũ trụ" },
    { id:"creator",    name:"Creator Boss",    icon:"👁", color:"#e2e8f0", power:99999,rewardMult:20.0,desc:"Được Sáng Thế Chủ tạo ra, sức mạnh vô cùng"   },
  ];

  const BOSS_ABILITIES = [
    "Hư Không Nuốt Trọn","Thiên Địa Phán Quyết","Vĩnh Cửu Chi Ý Chí","Phá Diệt Vũ Trụ",
    "Hồn Phách Cướp Đoạt","Thời Không Đảo Ngược","Nguyên Khí Hút Vào","Thần Lực Phán Tội",
    "Ma Khí Ô Nhiễm","Long Áp Thiên Hạ","Tứ Tượng Kiếm Trận","Hỗn Nguyên Tà Khí",
    "Bất Diệt Chi Thể","Vạn Pháp Quy Tông","Trời Đất Đồng Khóc",
  ];

  const BOSS_NAMES_PREFIX = ["Cổ Đại","Bất Diệt","Hỗn Nguyên","Hư Không","Hắc Ám","Vĩnh Hằng","Siêu Việt","Nguyên Thủy","Vô Danh","Thiên Địa"];
  const BOSS_NAMES_SUFFIX = ["Chi Vương","Ma Thần","Đại Đế","Chiến Thần","Phán Quan","Chi Chúa","Hủy Diệt Giả","Sáng Tạo Giả","Devourer","Annihilator"];

  function defaultData() { return { bosses: [], totalCreated: 0, totalSlain: 0 }; }
  window.cbfData = window.cbfData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.cbfData)); } catch(e) {} }
  function load() {
    try {
      var r = localStorage.getItem(SAVE_KEY);
      if (r) { var p = JSON.parse(r); if (p && p.bosses) window.cbfData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  var _ctr = 1;
  function newId() { return "boss_v40_" + Date.now() + "_" + (_ctr++); }

  function _notify(msg, icon) {
    if (typeof window.htAddEvent  === "function") window.htAddEvent({ year:window.year||0, type:"boss", title:"[Boss] " + msg, color:"#ef4444" });
    if (typeof window.waeAddAlert === "function") window.waeAddAlert({ type:"creator_boss", icon:icon||"👹", title:msg, year:window.year||0 });
    if (typeof window.wmeAddMemory=== "function") window.wmeAddMemory({ year:window.year||0, category:"boss", title:"Boss Mới Xuất Hiện", content:msg });
  }

  window.cbfCreateBoss = function(opts) {
    var tier = BOSS_TIERS.find(function(t){ return t.id===(opts.tier||"world"); }) || BOSS_TIERS[0];
    var abilityCount = 2 + Math.floor(BOSS_TIERS.indexOf(tier) * 1.5);
    var shuffled = BOSS_ABILITIES.slice().sort(function(){ return Math.random()-0.5; });
    var abilities = shuffled.slice(0, Math.min(abilityCount, shuffled.length));

    var boss = {
      id: newId(), tier: tier.id, tierName: tier.name, tierIcon: tier.icon, tierColor: tier.color,
      name: opts.name || BOSS_NAMES_PREFIX[Math.floor(Math.random()*BOSS_NAMES_PREFIX.length)] + " " + BOSS_NAMES_SUFFIX[Math.floor(Math.random()*BOSS_NAMES_SUFFIX.length)],
      power: Math.floor(tier.power * (0.8 + Math.random()*0.6)),
      hp: opts.hp || tier.power * 100,
      currentHp: null,
      abilities: abilities,
      desc: opts.desc || tier.desc,
      location: opts.location || "Hư Không Biên Giới",
      status: "active",
      createdYear: window.year||0,
      rewardMult: tier.rewardMult,
      lore: opts.lore || null,
      slainBy: null, slainYear: null,
    };
    boss.currentHp = boss.hp;

    window.cbfData.bosses.push(boss);
    window.cbfData.totalCreated++;

    // Thử spawn vào worldBossEngine nếu có
    if (tier.id === "world" && typeof window.wbv31SpawnCustomBoss === "function") {
      try { window.wbv31SpawnCustomBoss({ name: boss.name, power: boss.power, id: boss.id }); } catch(e) {}
    }

    _notify("⚠️ " + tier.name + ": '" + boss.name + "' xuất hiện tại " + boss.location + "!", tier.icon);
    save();
    return boss;
  };

  window.cbfRandomBoss = function() {
    var tier = BOSS_TIERS[Math.floor(Math.random()*BOSS_TIERS.length)];
    return window.cbfCreateBoss({ tier: tier.id });
  };

  window.cbfSlayBoss = function(bossId) {
    var boss = window.cbfData.bosses.find(function(b){ return b.id===bossId; });
    if (!boss || boss.status !== "active") return false;
    boss.status = "slain"; boss.slainYear = window.year||0;
    window.cbfData.totalSlain++;
    _notify("🏆 " + boss.tierName + " '" + boss.name + "' đã bị hạ!", "🏆");
    save(); return true;
  };

  window.cbfRenderPanel = function() {
    var el = document.getElementById("panel-creator-boss-v40");
    if (!el) return;
    var bosses = window.cbfData.bosses;
    var active = bosses.filter(function(b){ return b.status==="active"; });

    var tierButtons = BOSS_TIERS.map(function(t) {
      var cnt = bosses.filter(function(b){ return b.tier===t.id && b.status==="active"; }).length;
      return '<button onclick="cbfCreateBoss({tier:\'' + t.id + '\'});cbfRenderPanel()" '
        + 'style="flex:1;padding:10px 8px;background:#0f172a;border:1px solid ' + t.color + (cnt>0?'':'22') + ';border-radius:8px;color:' + t.color + ';cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif;text-align:center">'
        + '<div style="font-size:18px">' + t.icon + '</div>'
        + '<div style="font-size:10px;font-weight:600">' + t.name + '</div>'
        + '<div style="font-size:9px;color:#64748b">' + cnt + ' đang hoạt động</div>'
        + '</button>';
    }).join("");

    var bossCards = bosses.length===0
      ? '<div style="text-align:center;padding:30px;color:#475569">Chưa triệu hồi boss nào.</div>'
      : bosses.slice().reverse().slice(0,15).map(function(b) {
          var hpPct = b.hp > 0 ? Math.floor(b.currentHp/b.hp*100) : 0;
          return '<div style="background:#0f172a;border:1px solid ' + b.tierColor + (b.status==="active"?"44":"22") + ';border-radius:10px;padding:14px;margin-bottom:8px;opacity:' + (b.status==="active"?"1":"0.5") + '">'
            + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
            + '<div style="display:flex;align-items:center;gap:8px">'
            + '<span style="font-size:24px">' + b.tierIcon + '</span>'
            + '<div><div style="font-size:13px;font-weight:700;color:' + b.tierColor + '">' + b.name + '</div>'
            + '<div style="font-size:10px;color:#475569">' + b.tierName + ' · ' + b.location + '</div></div>'
            + '</div>'
            + '<div style="text-align:right">'
            + (b.status==="active" ? '<button onclick="cbfSlayBoss(\'' + b.id + '\');cbfRenderPanel()" style="padding:4px 10px;background:#ef444422;border:1px solid #ef4444;border-radius:5px;color:#ef4444;cursor:pointer;font-size:10px">Tiêu Diệt</button>' : '<span style="font-size:10px;color:#64748b">Đã hạ năm ' + (b.slainYear||"?") + '</span>')
            + '</div>'
            + '</div>'
            + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
            + '<div style="flex:1;background:#1e293b;border-radius:3px;height:5px"><div style="width:' + (b.status==="active"?hpPct:0) + '%;background:' + b.tierColor + ';height:5px;border-radius:3px"></div></div>'
            + '<span style="font-size:10px;color:#94a3b8">' + (b.status==="active"?b.power:"0") + ' sức mạnh</span>'
            + '</div>'
            + '<div style="display:flex;flex-wrap:wrap;gap:4px">'
            + b.abilities.map(function(a){ return '<span style="font-size:9px;padding:2px 6px;background:#1e293b;border-radius:4px;color:#94a3b8">' + a + '</span>'; }).join("")
            + '</div>'
            + '</div>';
        }).join("");

    el.innerHTML = '<div style="padding:16px;font-family:\'Noto Serif SC\',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">'
      + '<div style="margin-bottom:14px"><h3 style="margin:0 0 3px;font-size:17px;color:#f97316;font-family:Cinzel,serif">👹 Xưởng Tạo Boss</h3>'
      + '<div style="font-size:11px;color:#475569">' + active.length + ' đang hoạt động · ' + window.cbfData.totalSlain + ' đã bị hạ · ' + bosses.length + ' tổng</div></div>'
      + '<div style="display:flex;gap:6px;margin-bottom:14px">' + tierButtons + '</div>'
      + '<button onclick="cbfRandomBoss();cbfRenderPanel()" style="width:100%;padding:8px;background:linear-gradient(135deg,#7c2d12,#991b1b);border:none;border-radius:7px;color:#fbbf24;cursor:pointer;font-size:12px;margin-bottom:14px;font-family:\'Noto Serif SC\',serif">🎲 Triệu Hồi Boss Ngẫu Nhiên</button>'
      + '<div style="font-size:12px;color:#64748b;font-weight:600;margin-bottom:8px">👹 BOSS ĐÃ TRIỆU HỒI</div>'
      + bossCards + '</div>';
  };

  function init() {
    load();
    console.log("[CreatorBossFactory V40] 👹 4 tier Boss · " + window.cbfData.bosses.length + " đã triệu hồi.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 4600); });
  } else {
    setTimeout(init, 4600);
  }
})();
