(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATOR GOD FACTORY V40 — Xưởng Tạo Thần
  // Tạo Thần · Gán Quyền Năng · Gán Lĩnh Vực · Gán Tín Đồ
  // NOTE: Độc lập với divineAdministration.js (V32) — data store riêng cgfData
  // ═══════════════════════════════════════════════════════════════════════════

  const SAVE_KEY = "cgv6_creator_god_v40";

  const GOD_TIERS = [
    { id:"demigod",  name:"Bán Thần",    icon:"🌟", color:"#94a3b8", divinity:30, maxDomains:1 },
    { id:"lesser",   name:"Tiểu Thần",   icon:"⭐", color:"#60a5fa", divinity:50, maxDomains:2 },
    { id:"greater",  name:"Đại Thần",    icon:"✨", color:"#fbbf24", divinity:80, maxDomains:3 },
    { id:"supreme",  name:"Chí Tôn Thần",icon:"👑", color:"#a78bfa", divinity:95, maxDomains:5 },
    { id:"primordial",name:"Thái Cổ Thần",icon:"🌌",color:"#e2e8f0", divinity:100,maxDomains:8 },
  ];

  const ALL_DOMAINS = [
    "Chiến Tranh","Hòa Bình","Tự Nhiên","Cái Chết","Sự Sống","Lửa","Nước","Đất","Gió",
    "Số Phận","Tình Yêu","Trí Tuệ","Hỗn Mang","Trật Tự","Thời Gian","Không Gian",
    "Hư Vô","Sáng Tạo","Hủy Diệt","Cân Bằng","Tu Luyện","Thần Thông","Luật Nhân Quả",
  ];

  const GOD_POWERS = [
    "Toàn Tri","Toàn Năng","Bất Tử","Phán Quyết","Triệu Hồi","Tiên Tri",
    "Kiểm Soát Thời Gian","Tạo Vũ Trụ","Hủy Diệt","Tái Sinh","Hóa Thần",
    "Ấn Trừ Tà","Sấm Sét Trừng Phạt","Lửa Thiên Đình","Thiên Mệnh Ban Phát",
  ];

  const GOD_NAMES = [
    "Thái Thượng","Ngọc Hoàng","Hỏa Thần","Thủy Thần","Thổ Địa","Phong Thần","Lôi Thần",
    "Tử Thần","Hải Thần","Sơn Thần","Chiến Thần","Ái Thần","Vận Mệnh Thần","Bóng Đêm Chi Thần",
  ];

  function defaultData() { return { gods: [], totalCreated: 0 }; }
  window.cgfData = window.cgfData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.cgfData)); } catch(e) {} }
  function load() {
    try {
      var r = localStorage.getItem(SAVE_KEY);
      if (r) { var p = JSON.parse(r); if (p && p.gods) window.cgfData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  var _ctr = 1;
  function newId() { return "god_v40_" + Date.now() + "_" + (_ctr++); }

  function _notify(msg) {
    if (typeof window.htAddEvent   === "function") window.htAddEvent({ year:window.year||0, type:"divine", title:"[Thần] " + msg, color:"#fbbf24" });
    if (typeof window.waeAddAlert  === "function") window.waeAddAlert({ type:"creator_god", icon:"✨", title:msg, year:window.year||0 });
    if (typeof window.wmeAddMemory === "function") window.wmeAddMemory({ year:window.year||0, category:"divine", title:"Thần Linh Mới Xuất Hiện", content:msg });
  }

  window.cgfCreateGod = function(opts) {
    var tier = GOD_TIERS.find(function(t){ return t.id===(opts.tier||"lesser"); }) || GOD_TIERS[1];

    var domainCount = opts.domains ? 0 : Math.min(tier.maxDomains, 1 + Math.floor(Math.random()*(tier.maxDomains)));
    var shuffledD   = ALL_DOMAINS.slice().sort(function(){ return Math.random()-0.5; });
    var domains     = opts.domains || shuffledD.slice(0, domainCount);

    var powerCount  = Math.floor(tier.maxDomains * 0.7) + 1;
    var shuffledP   = GOD_POWERS.slice().sort(function(){ return Math.random()-0.5; });
    var powers      = opts.powers || shuffledP.slice(0, Math.min(powerCount, shuffledP.length));

    var god = {
      id: newId(), tier: tier.id, tierName: tier.name, tierIcon: tier.icon, tierColor: tier.color,
      name: opts.name || GOD_NAMES[Math.floor(Math.random()*GOD_NAMES.length)],
      divinity: Math.floor(tier.divinity * (0.85 + Math.random()*0.3)),
      domains: domains, powers: powers,
      believers: opts.believers || Math.floor(Math.random()*100000),
      temple: opts.temple || null,
      alignment: opts.alignment || (Math.random()>0.5 ? "Thiện" : Math.random()>0.5 ? "Ác" : "Trung Lập"),
      desc: opts.desc || tier.name + " với " + domains.slice(0,2).join(", ") + " lĩnh vực.",
      createdYear: window.year||0, status: "active",
      mythology: opts.mythology || null,
    };

    window.cgfData.gods.push(god);
    window.cgfData.totalCreated++;

    // Thêm vào divineAdminData nếu có
    if (window.divineAdminData && Array.isArray(window.divineAdminData.createdDeities)) {
      window.divineAdminData.createdDeities.push({
        id: god.id, name: god.name, active: true,
        domain: domains[0] || "Chưa Xác Định",
        power: god.divinity, tier: god.tier,
        believers: god.believers, createdYear: god.createdYear,
      });
    }

    _notify("✨ " + tier.name + " '" + god.name + "' giáng thế! Lĩnh vực: " + domains.slice(0,2).join(", "));
    save();
    return god;
  };

  window.cgfRandomGod = function() {
    var tier = GOD_TIERS[Math.floor(Math.random()*GOD_TIERS.length)];
    return window.cgfCreateGod({ tier: tier.id });
  };

  window.cgfRenderPanel = function() {
    var el = document.getElementById("panel-creator-god-v40");
    if (!el) return;
    var gods = window.cgfData.gods;

    var tierButtons = GOD_TIERS.map(function(t) {
      var cnt = gods.filter(function(g){ return g.tier===t.id; }).length;
      return '<button onclick="cgfCreateGod({tier:\'' + t.id + '\'});cgfRenderPanel()" '
        + 'style="flex:1;padding:10px 6px;background:#0f172a;border:1px solid ' + t.color + '44;border-radius:8px;color:' + t.color + ';cursor:pointer;font-size:10px;font-family:\'Noto Serif SC\',serif;text-align:center">'
        + '<div style="font-size:16px">' + t.icon + '</div>'
        + '<div style="font-weight:600">' + t.name + '</div>'
        + '<div style="font-size:9px;color:#475569">' + cnt + ' vị</div>'
        + '</button>';
    }).join("");

    var godCards = gods.length===0
      ? '<div style="text-align:center;padding:30px;color:#475569">Chưa tạo thần linh nào.</div>'
      : gods.slice().reverse().slice(0,15).map(function(g) {
          return '<div style="background:#0f172a;border:1px solid ' + g.tierColor + '44;border-radius:10px;padding:14px;margin-bottom:8px">'
            + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">'
            + '<span style="font-size:28px">' + g.tierIcon + '</span>'
            + '<div style="flex:1">'
            + '<div style="font-size:13px;font-weight:700;color:' + g.tierColor + '">' + g.name + '</div>'
            + '<div style="font-size:10px;color:#475569">' + g.tierName + ' · ' + g.alignment + ' · ' + g.believers.toLocaleString() + ' tín đồ</div>'
            + '</div>'
            + '<div style="text-align:right"><div style="font-size:14px;font-weight:700;color:' + g.tierColor + '">' + g.divinity + '</div><div style="font-size:9px;color:#475569">Thần Lực</div></div>'
            + '</div>'
            + '<div style="margin-bottom:6px"><div style="font-size:10px;color:#64748b;margin-bottom:3px">🏛️ Lĩnh Vực</div>'
            + '<div style="display:flex;flex-wrap:wrap;gap:3px">'
            + g.domains.map(function(d){ return '<span style="font-size:9px;padding:2px 6px;background:#1e293b;border-radius:4px;color:#fbbf24">' + d + '</span>'; }).join("")
            + '</div></div>'
            + '<div><div style="font-size:10px;color:#64748b;margin-bottom:3px">⚡ Quyền Năng</div>'
            + '<div style="display:flex;flex-wrap:wrap;gap:3px">'
            + g.powers.map(function(p){ return '<span style="font-size:9px;padding:2px 6px;background:#1e293b;border-radius:4px;color:#a78bfa">' + p + '</span>'; }).join("")
            + '</div></div>'
            + '</div>';
        }).join("");

    el.innerHTML = '<div style="padding:16px;font-family:\'Noto Serif SC\',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">'
      + '<div style="margin-bottom:14px"><h3 style="margin:0 0 3px;font-size:17px;color:#fbbf24;font-family:Cinzel,serif">✨ Xưởng Tạo Thần</h3>'
      + '<div style="font-size:11px;color:#475569">5 cấp thần · 23 lĩnh vực · ' + gods.length + ' đã tạo</div></div>'
      + '<div style="display:flex;gap:6px;margin-bottom:14px">' + tierButtons + '</div>'
      + '<button onclick="cgfRandomGod();cgfRenderPanel()" style="width:100%;padding:8px;background:linear-gradient(135deg,#78350f,#92400e);border:none;border-radius:7px;color:#fbbf24;cursor:pointer;font-size:12px;margin-bottom:14px;font-family:\'Noto Serif SC\',serif">🎲 Tạo Thần Ngẫu Nhiên</button>'
      + '<div style="font-size:12px;color:#64748b;font-weight:600;margin-bottom:8px">✨ THẦN LINH ĐÃ TẠO</div>'
      + godCards + '</div>';
  };

  function init() {
    load();
    console.log("[CreatorGodFactory V40] ✨ 5 tier thần · 23 lĩnh vực · " + window.cgfData.gods.length + " đã tạo.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 4800); });
  } else {
    setTimeout(init, 4800);
  }
})();
