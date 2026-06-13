(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTIVERSE ALLIANCE SYSTEM V39 — Liên Minh Đa Vũ Trụ
  // Liên Minh · Hiệp Ước · Bảo Hộ · Liên Quân · Tự Động AI
  // ═══════════════════════════════════════════════════════════════════════════

  const SAVE_KEY      = "cgv6_mv_alliance_v39";
  const TICK_INTERVAL = 12;

  // ─── LOẠI LIÊN MINH ──────────────────────────────────────────────────────
  const ALLIANCE_TYPES = [
    { id:"mutual_defense",  name:"🛡️ Phòng Thủ Chung",  color:"#3b82f6", desc:"Cùng phòng thủ khi bị tấn công",         bonus:{ def:0.3, stab:10 } },
    { id:"military_pact",   name:"⚔️ Hiệp Ước Quân Sự",  color:"#ef4444", desc:"Liên quân tấn công & phòng thủ",          bonus:{ atk:0.25, def:0.2 } },
    { id:"trade_treaty",    name:"💰 Hiệp Ước Thương Mại",color:"#22c55e", desc:"Trao đổi tài nguyên & kinh tế",          bonus:{ res:100, pop:0.05 } },
    { id:"protectorate",    name:"🏛️ Bảo Hộ",            color:"#fbbf24", desc:"Cường quốc bảo hộ quốc gia nhỏ",        bonus:{ def:0.5, tribute:0.1 } },
    { id:"grand_coalition", name:"🌟 Đại Liên Minh",      color:"#a78bfa", desc:"Liên minh toàn diện nhiều thành viên",   bonus:{ atk:0.4, def:0.4, stab:20 } },
  ];

  function defaultData() {
    return {
      alliances: [], totalFormed: 0, totalDissolved: 0,
      tick: 0,
    };
  }

  window.mvaData = window.mvaData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.mvaData)); } catch(e) {} }
  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (raw) { var p = JSON.parse(raw); if (p && p.alliances) window.mvaData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  var _ctr = 1;
  function newId() { return "mva_" + Date.now() + "_" + (_ctr++); }

  function _notify(msg, icon) {
    if (typeof window.htAddEvent   === "function") window.htAddEvent({ year:window.year||0, type:"mv_alliance", title:msg, color:"#3b82f6" });
    if (typeof window.waeAddAlert  === "function") window.waeAddAlert({ type:"mv_alliance", icon:icon||"🤝", title:msg, year:window.year||0 });
    if (typeof window.addLog       === "function") window.addLog("[MV-ALLIANCE-V39] " + msg);
    if (typeof window.wmeAddMemory === "function") window.wmeAddMemory({ year:window.year||0, category:"diplomacy", title:"Liên Minh Đa Vũ Trụ", content:msg });
  }

  // ─── THÀNH LẬP LIÊN MINH ─────────────────────────────────────────────────
  window.mvaFormAlliance = function(uid1, name1, uid2, name2, typeId) {
    var atype = ALLIANCE_TYPES.find(function(t){ return t.id===typeId; }) || ALLIANCE_TYPES[0];

    var existing = window.mvaData.alliances.find(function(a) {
      return a.status==="active" && a.members.includes(uid1) && a.members.includes(uid2);
    });
    if (existing) return existing;

    var alliance = {
      id: newId(), type: atype.id, typeName: atype.name, typeColor: atype.color,
      name: name1 + " – " + name2 + " " + atype.name,
      members: [uid1, uid2], memberNames: [name1, name2],
      leader: uid1, leaderName: name1,
      status: "active", formed: window.year||0,
      dissolved: null, strength: 50 + Math.floor(Math.random()*50),
      bonus: atype.bonus, desc: atype.desc,
      events: [],
    };

    window.mvaData.alliances.push(alliance);
    window.mvaData.totalFormed++;

    _notify("🤝 " + atype.name + ": " + name1 + " & " + name2 + " kết minh!", "🤝");
    save();
    return alliance;
  };

  // ─── THÊM THÀNH VIÊN VÀO LIÊN MINH ───────────────────────────────────────
  window.mvaJoinAlliance = function(allianceId, uid, name) {
    var a = window.mvaData.alliances.find(function(x){ return x.id===allianceId; });
    if (!a || a.status !== "active") return false;
    if (a.members.includes(uid)) return false;
    a.members.push(uid);
    a.memberNames.push(name);
    a.strength = Math.min(100, a.strength + 10);
    _notify("➕ " + name + " gia nhập " + a.name, "➕");
    save(); return true;
  };

  // ─── GIẢI TÁN LIÊN MINH ───────────────────────────────────────────────────
  window.mvaDissolveAlliance = function(allianceId, reason) {
    var a = window.mvaData.alliances.find(function(x){ return x.id===allianceId; });
    if (!a || a.status !== "active") return false;
    a.status = "dissolved"; a.dissolved = window.year||0;
    window.mvaData.totalDissolved++;
    _notify("💔 " + a.name + " tan rã" + (reason ? ": " + reason : "!"), "💔");
    save(); return true;
  };

  // ─── AUTO AI LIÊN MINH ────────────────────────────────────────────────────
  window.mvaAutoAlliance = function() {
    var entities = [];
    if (window.mvData && window.mvData.universes) {
      window.mvData.universes.filter(function(u){ return u.status==="active"; }).slice(0,8).forEach(function(u){
        entities.push({ id:u.id, name:u.name });
      });
    }
    if (entities.length < 2) return;

    var sh   = entities.slice().sort(function(){ return Math.random()-0.5; });
    var e1   = sh[0]; var e2 = sh[1];
    var atype = ALLIANCE_TYPES[Math.floor(Math.random()*ALLIANCE_TYPES.length)];

    // Ưu tiên phòng thủ chung nếu có kẻ thù chung
    var activeWars = typeof window.mv39GetActiveWars === "function" ? window.mv39GetActiveWars() : [];
    var sharedEnemy = activeWars.find(function(w){
      return (w.defenderUid===e1.id || w.defenderUid===e2.id);
    });
    if (sharedEnemy) atype = ALLIANCE_TYPES[0];

    window.mvaFormAlliance(e1.id, e1.name, e2.id, e2.name, atype.id);
  };

  // ─── PUBLIC ───────────────────────────────────────────────────────────────
  window.mvaGetActive    = function() { return window.mvaData.alliances.filter(function(a){ return a.status==="active"; }); };
  window.mvaGetTypes     = function() { return ALLIANCE_TYPES; };
  window.mvaIsAllied     = function(uid1, uid2) {
    return window.mvaData.alliances.some(function(a){
      return a.status==="active" && a.members.includes(uid1) && a.members.includes(uid2);
    });
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  window.mvaRenderPanel = function() {
    var el = document.getElementById("panel-mv-alliance-v39");
    if (!el) return;
    var d       = window.mvaData;
    var active  = window.mvaGetActive();

    var typeCards = ALLIANCE_TYPES.map(function(at) {
      var cnt = active.filter(function(a){ return a.type===at.id; }).length;
      return '<div style="background:#0f172a;border:1px solid ' + (cnt>0?at.color+'44':'#1e293b') + ';border-radius:8px;padding:10px;text-align:center">'
        + '<div style="font-size:18px;font-weight:700;color:' + at.color + '">' + cnt + '</div>'
        + '<div style="font-size:9px;color:#64748b">' + at.name + '</div>'
        + '</div>';
    }).join("");

    var allianceCards = active.length===0
      ? '<div style="text-align:center;padding:30px;color:#475569">Chưa có liên minh. Hãy thành lập!</div>'
      : active.map(function(a) {
          return '<div style="background:#0f172a;border:1px solid ' + a.typeColor + '44;border-radius:10px;padding:14px;margin-bottom:8px">'
            + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">'
            + '<div><div style="font-size:12px;font-weight:700;color:' + a.typeColor + '">' + a.typeName + '</div>'
            + '<div style="font-size:11px;color:#e2e8f0">' + a.name + '</div></div>'
            + '<span style="font-size:11px;color:#64748b">Năm ' + a.formed + '</span>'
            + '</div>'
            + '<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px">'
            + a.memberNames.map(function(mn, mi) {
                var isLeader = a.members[mi] === a.leader;
                return '<span style="font-size:10px;padding:3px 8px;border-radius:5px;background:' + a.typeColor + '22;color:' + a.typeColor + '">' + (isLeader?"👑 ":"") + mn + '</span>';
              }).join("")
            + '</div>'
            + '<div style="display:flex;align-items:center;gap:6px">'
            + '<div style="flex:1;background:#1e293b;border-radius:4px;height:4px">'
            + '<div style="width:' + a.strength + '%;background:' + a.typeColor + ';height:4px;border-radius:4px"></div>'
            + '</div>'
            + '<span style="font-size:10px;color:#64748b">' + a.strength + ' sức mạnh</span>'
            + '<button onclick="mvaDissolveAlliance(\'' + a.id + '\');mvaRenderPanel()" style="padding:3px 8px;background:#1e293b;border:1px solid #ef444444;border-radius:5px;color:#ef4444;cursor:pointer;font-size:10px">Giải Tán</button>'
            + '</div>'
            + '</div>';
        }).join("");

    el.innerHTML = '<div style="padding:20px;font-family:\'Noto Serif SC\',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">'
      + '<div style="margin-bottom:16px"><h3 style="margin:0 0 3px;font-size:18px;color:#3b82f6;font-family:Cinzel,serif">🤝 Liên Minh Đa Vũ Trụ V39</h3>'
      + '<div style="font-size:11px;color:#475569">' + active.length + ' liên minh hoạt động · ' + d.totalFormed + ' đã thành lập · ' + d.totalDissolved + ' tan rã</div></div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin-bottom:16px">' + typeCards + '</div>'
      + '<div style="display:flex;gap:8px;margin-bottom:16px">'
      + '<button onclick="mvaAutoAlliance();mvaRenderPanel()" style="flex:1;padding:8px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);border:none;border-radius:7px;color:#fff;cursor:pointer;font-size:12px;font-family:\'Noto Serif SC\',serif">🤝 Thành Lập Liên Minh Ngẫu Nhiên</button>'
      + '</div>'
      + '<div>' + allianceCards + '</div>'
      + '</div>';
  };

  // ─── TICK ─────────────────────────────────────────────────────────────────
  function tick() {
    var d = window.mvaData;
    d.tick++;
    if (d.tick % TICK_INTERVAL !== 0) return;

    // Giảm sức mạnh liên minh theo thời gian
    d.alliances.filter(function(a){ return a.status==="active"; }).forEach(function(a) {
      a.strength = Math.max(10, (a.strength||50) - 0.2);
      // Tan rã khi sức mạnh quá thấp
      if (a.strength <= 10 && Math.random() < 0.05) {
        window.mvaDissolveAlliance(a.id, "Liên minh tan rã vì yếu dần");
      }
    });

    // Auto tạo liên minh mỗi ~200 ticks
    if (d.tick % 200 === 0 && Math.random() < 0.5) window.mvaAutoAlliance();

    if (d.tick % 50 === 0) save();
  }

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); tick(); };
    console.log("[MultiverseAllianceSystem V39] 🤝 5 loại liên minh · " + window.mvaGetActive().length + " đang hoạt động.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 5500); });
  } else {
    setTimeout(init, 5500);
  }
})();
