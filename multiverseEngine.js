(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTIVERSE ENGINE V35 — Đa Vũ Trụ Core
  // ═══════════════════════════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_multiverse_v35";
  const VERSION  = "V35";

  const UNIVERSE_TYPES = [
    { id:"fantasy",     name:"🏰 Vũ Trụ Kỳ Ảo",     color:"#8b5cf6", desc:"Phép thuật cổ đại, rồng, tiên tộc thống trị",         baseStability:75 },
    { id:"cultivation", name:"⚡ Vũ Trụ Tu Tiên",    color:"#06b6d4", desc:"Tu luyện linh khí, đột phá cảnh giới, thần tiên",     baseStability:80 },
    { id:"divine",      name:"✨ Vũ Trụ Thần Thánh",  color:"#fbbf24", desc:"Thần linh tối thượng trị vì, thiên đình hùng mạnh",   baseStability:85 },
    { id:"demon",       name:"👹 Vũ Trụ Ma Giới",     color:"#ef4444", desc:"Ma tộc thống trị, năng lượng tăm tối bao trùm",       baseStability:40 },
    { id:"technology",  name:"⚙️ Vũ Trụ Công Nghệ",  color:"#3b82f6", desc:"Công nghệ cao, robot, vũ khí năng lượng tối cao",     baseStability:70 },
    { id:"cyberpunk",   name:"🌆 Vũ Trụ Cyberpunk",   color:"#ec4899", desc:"Thành phố khổng lồ, hack mạng lưới, tội ác ngầm",    baseStability:55 },
    { id:"mythology",   name:"🌊 Vũ Trụ Thần Thoại",  color:"#10b981", desc:"Thần thoại cổ đại hồi sinh, Olympus, Asgard tái thế",baseStability:65 },
    { id:"apocalypse",  name:"☠️ Vũ Trụ Tận Thế",     color:"#6b7280", desc:"Văn minh sụp đổ, người sống sót chiến đấu sinh tồn", baseStability:20 },
    { id:"ocean",       name:"🌊 Vũ Trụ Đại Dương",   color:"#0ea5e9", desc:"Đại dương vô tận, tộc người biển, quái thú thủy tộc",baseStability:60 },
    { id:"beast",       name:"🐉 Vũ Trụ Thú Hoang",   color:"#84cc16", desc:"Linh thú tiến hóa, rừng già huyền bí, đấu trận sinh tồn",baseStability:50 }
  ];

  function defaultData() {
    return {
      universes:  [],
      activeUId:  null,
      tick:       0,
      log:        [],
      totalCreated: 0,
      totalCollapsed: 0
    };
  }

  window.mvData = window.mvData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.mvData)); } catch(e) {} }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { const p = JSON.parse(raw); if (p && p.universes) window.mvData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  let _idCtr = 1;
  function newId() { return "univ_" + (Date.now()) + "_" + (_idCtr++); }

  // ─── PUBLIC: Tạo vũ trụ mới ───────────────────────────────────────────────
  window.mvCreateUniverse = function(typeId, customName) {
    const type = UNIVERSE_TYPES.find(t => t.id === typeId) || UNIVERSE_TYPES[Math.floor(Math.random()*UNIVERSE_TYPES.length)];
    const uid = newId();
    const names = {
      fantasy:["Aetheria","Valdris","Eryndor","Mythara"],
      cultivation:["Tiên Giới","Thái Cực Vũ Trụ","Linh Khí Hà","Huyền Thiên"],
      divine:["Thiên Đình Giới","Thần Vực","Linh Thánh Thiên","Olympus Mới"],
      demon:["Ma Vực","Hắc Ám Giới","Địa Ngục Trận","Huyết Tà Thiên"],
      technology:["TechVerse Alpha","Nexus Prime","Synthia-7","MechWorld"],
      cyberpunk:["NeonCity Prime","CyberVoid","HackNet Universe","GridWorld"],
      mythology:["Pantheon Realm","Asgard Reborn","Olympus Nova","Dragon Myth"],
      apocalypse:["Last World","Wasteland Sigma","Ruin Verse","Ash Realm"],
      ocean:["Thủy Thiên Giới","Deep Blue Verse","Ocean Prime","Atlantis Nova"],
      beast:["Thú Vương Giới","Beast Prime","Wild Verse","Primal World"]
    };
    const namePool = names[type.id] || ["Unknown Verse"];
    const name = customName || namePool[Math.floor(Math.random()*namePool.length)] + " " + (window.mvData.totalCreated+1);

    const univ = {
      id: uid,
      name: name,
      type: type.id,
      typeName: type.name,
      typeColor: type.color,
      desc: type.desc,
      age: 0,
      population: Math.floor(Math.random()*900000)+100000,
      stability: type.baseStability + Math.floor(Math.random()*20)-10,
      power: Math.floor(Math.random()*500)+100,
      realmCount: Math.floor(Math.random()*8)+3,
      kingdoms: Math.floor(Math.random()*20)+5,
      gods: Math.floor(Math.random()*10)+1,
      portals: [],
      status: "active",
      dominantForce: "",
      resources: {
        lingqi:  Math.floor(Math.random()*10000)+1000,
        divine:  Math.floor(Math.random()*5000)+500,
        chaos:   Math.floor(Math.random()*3000)+100,
        tech:    Math.floor(Math.random()*8000)+500
      },
      createdAt: (window.year || 0),
      events: []
    };

    // xác định lực lượng thống trị
    const forces = { fantasy:"Hiệp Sĩ Ma Pháp", cultivation:"Tu Tiên Tông", divine:"Thiên Đình", demon:"Ma Vương", technology:"Liên Minh Công Nghệ", cyberpunk:"Tập Đoàn Hacker", mythology:"Hội Đồng Thần", apocalypse:"Người Sống Sót", ocean:"Thủy Tộc Hoàng Đế", beast:"Thú Vương" };
    univ.dominantForce = forces[type.id] || "Thế Lực Bí Ẩn";

    window.mvData.universes.push(univ);
    window.mvData.totalCreated++;
    if (!window.mvData.activeUId) window.mvData.activeUId = uid;

    mvLog(`🌌 Vũ trụ mới "${name}" (${type.name}) được tạo!`);
    _notifyHistory(`Vũ trụ "${name}" hình thành`, "universe_created");
    save();
    return univ;
  };

  // ─── PUBLIC: Xóa vũ trụ ───────────────────────────────────────────────────
  window.mvDestroyUniverse = function(uid) {
    const idx = window.mvData.universes.findIndex(u => u.id === uid);
    if (idx < 0) return;
    const univ = window.mvData.universes[idx];
    univ.status = "collapsed";
    window.mvData.totalCollapsed++;
    mvLog(`💥 Vũ trụ "${univ.name}" đã sụp đổ!`);
    _notifyHistory(`Vũ trụ "${univ.name}" sụp đổ`, "universe_collapsed");
    if (window.mvData.activeUId === uid) {
      const alive = window.mvData.universes.find(u => u.status === "active");
      window.mvData.activeUId = alive ? alive.id : null;
    }
    save();
  };

  // ─── PUBLIC: Nhân bản vũ trụ ──────────────────────────────────────────────
  window.mvCloneUniverse = function(uid) {
    const src = window.mvData.universes.find(u => u.id === uid);
    if (!src) return null;
    return window.mvCreateUniverse(src.type, src.name + " (Bản Sao)");
  };

  // ─── PUBLIC: Hợp nhất vũ trụ ─────────────────────────────────────────────
  window.mvMergeUniverses = function(uid1, uid2) {
    const u1 = window.mvData.universes.find(u => u.id === uid1);
    const u2 = window.mvData.universes.find(u => u.id === uid2);
    if (!u1 || !u2) return null;
    const merged = window.mvCreateUniverse(u1.type, u1.name + " & " + u2.name + " (Hợp Nhất)");
    merged.population = u1.population + u2.population;
    merged.power = u1.power + u2.power;
    merged.kingdoms = u1.kingdoms + u2.kingdoms;
    merged.gods = u1.gods + u2.gods;
    u1.status = "merged"; u2.status = "merged";
    mvLog(`🔗 Hai vũ trụ "${u1.name}" và "${u2.name}" hợp nhất thành "${merged.name}"!`);
    _notifyHistory(`Hai vũ trụ hợp nhất`, "universe_merged");
    save(); return merged;
  };

  // ─── PUBLIC: Tách vũ trụ ─────────────────────────────────────────────────
  window.mvSplitUniverse = function(uid) {
    const src = window.mvData.universes.find(u => u.id === uid);
    if (!src) return [];
    const t1 = window.mvCreateUniverse(src.type, src.name + " Alpha");
    const t2 = window.mvCreateUniverse("chaos" in src ? "demon" : "fantasy", src.name + " Beta");
    t1.population = Math.floor(src.population/2); t2.population = src.population - t1.population;
    src.status = "split";
    mvLog(`⚡ Vũ trụ "${src.name}" tách thành 2 vũ trụ mới!`);
    _notifyHistory(`Vũ trụ "${src.name}" tách đôi`, "universe_split");
    save(); return [t1, t2];
  };

  // ─── PUBLIC: Lấy danh sách universe types ─────────────────────────────────
  window.mvGetUniverseTypes = function() { return UNIVERSE_TYPES; };
  window.mvGetUniverses    = function() { return window.mvData.universes; };
  window.mvGetActiveUniverse = function() {
    return window.mvData.universes.find(u => u.id === window.mvData.activeUId) || null;
  };
  window.mvGetUniverseById = function(uid) {
    return window.mvData.universes.find(u => u.id === uid) || null;
  };

  // ─── Ghi log ──────────────────────────────────────────────────────────────
  function mvLog(msg) {
    window.mvData.log.unshift({ msg, year: window.year||0, ts: Date.now() });
    if (window.mvData.log.length > 200) window.mvData.log.length = 200;
    if (typeof window.addLog === "function") window.addLog("[MULTIVERSE] " + msg);
  }
  window.mvLog = mvLog;

  function _notifyHistory(desc, type) {
    if (typeof window.htAddEvent === "function") window.htAddEvent({ year: window.year||0, desc, type, source:"multiverse" });
    if (typeof window.wmAddMemory === "function") window.wmAddMemory({ year: window.year||0, desc, type });
  }

  // ─── gameTick ─────────────────────────────────────────────────────────────
  const _prevTick = window.gameTick;
  window.gameTick = function() {
    if (typeof _prevTick === "function") _prevTick();
    mvTick();
  };

  function mvTick() {
    window.mvData.tick++;
    const universes = window.mvData.universes.filter(u => u.status === "active");
    if (!universes.length) return;

    universes.forEach(function(u) {
      u.age++;
      // tăng trưởng dân số
      if (u.stability > 60) u.population = Math.floor(u.population * 1.001);
      else if (u.stability < 30) u.population = Math.floor(u.population * 0.999);
      // biến động ổn định
      const delta = (Math.random() - 0.48) * 2;
      u.stability = Math.max(1, Math.min(100, u.stability + delta));
      // biến động tài nguyên
      u.resources.lingqi  += Math.floor(Math.random()*50);
      u.resources.divine  += Math.floor(Math.random()*20);
      u.resources.chaos   += Math.floor(Math.random()*15);
      u.resources.tech    += Math.floor(Math.random()*30);
      // sụp đổ tự nhiên
      if (u.stability < 5 && Math.random() < 0.02) {
        window.mvDestroyUniverse(u.id);
      }
    });

    // Tự động tạo vũ trụ mới nếu ít
    if (universes.length < 2 && window.mvData.tick % 100 === 0) {
      const types = UNIVERSE_TYPES;
      window.mvCreateUniverse(types[Math.floor(Math.random()*types.length)].id);
    }

    if (window.mvData.tick % 30 === 0) save();
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  window.mvRenderPanel = function() {
    const el = document.getElementById("panel-multiverse-v35");
    if (!el) return;
    const universes = window.mvData.universes;
    const active = universes.filter(u => u.status === "active");
    const types = UNIVERSE_TYPES;

    el.innerHTML = `
<div style="padding:16px;font-family:'Noto Serif SC',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
    <div>
      <h2 style="margin:0;font-size:20px;color:#8b5cf6;font-family:Cinzel,serif">🌌 Multiverse Engine V35</h2>
      <div style="font-size:11px;color:#64748b;margin-top:2px">Đa Vũ Trụ — ${active.length} vũ trụ đang hoạt động · Tick ${window.mvData.tick}</div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button onclick="mvRenderCreateModal()" style="padding:6px 14px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:12px">+ Tạo Vũ Trụ</button>
      <button onclick="mvRenderPanel()" style="padding:6px 12px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:12px">↺ Refresh</button>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:20px">
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:22px;font-weight:700;color:#8b5cf6">${active.length}</div>
      <div style="font-size:11px;color:#64748b">Đang Hoạt Động</div>
    </div>
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:22px;font-weight:700;color:#06b6d4">${window.mvData.totalCreated}</div>
      <div style="font-size:11px;color:#64748b">Tổng Đã Tạo</div>
    </div>
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:22px;font-weight:700;color:#ef4444">${window.mvData.totalCollapsed}</div>
      <div style="font-size:11px;color:#64748b">Đã Sụp Đổ</div>
    </div>
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:22px;font-weight:700;color:#fbbf24">${universes.reduce((s,u)=>s+(u.status==="active"?u.population:0),0).toLocaleString()}</div>
      <div style="font-size:11px;color:#64748b">Tổng Dân Số</div>
    </div>
  </div>

  <div style="margin-bottom:12px;font-size:13px;color:#94a3b8;font-weight:600">📋 DANH SÁCH VŨ TRỤ</div>
  <div style="display:grid;gap:10px">
    ${universes.length === 0 ? `<div style="text-align:center;padding:40px;color:#475569">
      <div style="font-size:40px;margin-bottom:8px">🌌</div>
      <div>Chưa có vũ trụ nào. Nhấn "+ Tạo Vũ Trụ" để bắt đầu!</div>
    </div>` : universes.map(u => `
    <div style="background:#0f172a;border:1px solid ${u.status==="active"?u.typeColor+"44":"#1e293b"};border-radius:10px;padding:14px;cursor:pointer;transition:all 0.2s" onclick="mvSelectUniverse('${u.id}');mvRenderPanel()">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:10px;height:10px;border-radius:50%;background:${u.typeColor};box-shadow:0 0 6px ${u.typeColor}"></div>
          <span style="font-weight:600;color:${u.status==="active"?u.typeColor:"#64748b"}">${u.name}</span>
          <span style="font-size:10px;background:${u.status==="active"?"#1e293b":"#0f172a"};color:#94a3b8;padding:2px 6px;border-radius:4px">${u.typeName}</span>
        </div>
        <div style="display:flex;gap:6px">
          ${u.status==="active"?`
          <button onclick="event.stopPropagation();mvCloneUniverse('${u.id}');mvRenderPanel()" style="padding:3px 8px;background:#1e293b;border:1px solid #334155;border-radius:4px;color:#94a3b8;cursor:pointer;font-size:11px">📋 Clone</button>
          <button onclick="event.stopPropagation();if(confirm('Hủy diệt vũ trụ này?'))mvDestroyUniverse('${u.id}');mvRenderPanel()" style="padding:3px 8px;background:#1e293b;border:1px solid #ef4444;border-radius:4px;color:#f87171;cursor:pointer;font-size:11px">💥 Hủy</button>
          `:`<span style="font-size:11px;color:#64748b;padding:3px 8px;background:#0f172a;border-radius:4px">${u.status==="merged"?"🔗 Hợp Nhất":u.status==="split"?"⚡ Đã Tách":"☠️ Sụp Đổ"}</span>`}
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;font-size:11px">
        <div style="color:#64748b">👥 ${(u.population/1000).toFixed(0)}K</div>
        <div style="color:#64748b">🏰 ${u.kingdoms} vương quốc</div>
        <div style="color:#64748b">✨ ${u.gods} thần</div>
        <div style="color:${u.stability>60?"#34d399":u.stability>30?"#fbbf24":"#ef4444"}">⚡ ${u.stability.toFixed(0)}% ổn định</div>
      </div>
      <div style="margin-top:6px">
        <div style="height:4px;background:#1e293b;border-radius:2px;overflow:hidden">
          <div style="height:100%;width:${u.stability}%;background:${u.stability>60?"#34d399":u.stability>30?"#fbbf24":"#ef4444"};transition:width 0.3s"></div>
        </div>
      </div>
    </div>`).join("")}
  </div>

  ${window.mvData.log.length>0?`
  <div style="margin-top:20px">
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:8px">📜 NHẬT KÝ ĐA VŨ TRỤ</div>
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;max-height:150px;overflow-y:auto;font-size:11px;color:#64748b">
      ${window.mvData.log.slice(0,30).map(l=>`<div style="padding:3px 0;border-bottom:1px solid #1e293b">Năm ${l.year}: ${l.msg}</div>`).join("")}
    </div>
  </div>`:""}
</div>`;
  };

  window.mvSelectUniverse = function(uid) {
    window.mvData.activeUId = uid; save();
  };

  window.mvRenderCreateModal = function() {
    const types = UNIVERSE_TYPES;
    const overlay = document.createElement("div");
    overlay.id = "mv-create-modal";
    overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:#000000cc;z-index:9999;display:flex;align-items:center;justify-content:center";
    overlay.innerHTML = `
<div style="background:#0f172a;border:1px solid #8b5cf6;border-radius:12px;padding:24px;width:480px;max-width:90vw;max-height:80vh;overflow-y:auto;font-family:'Noto Serif SC',serif">
  <h3 style="margin:0 0 16px;color:#8b5cf6;font-family:Cinzel,serif">🌌 Tạo Vũ Trụ Mới</h3>
  <div style="margin-bottom:12px">
    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Tên vũ trụ (để trống = tự động)</label>
    <input id="mv-new-name" type="text" placeholder="Tên vũ trụ..." style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px;box-sizing:border-box">
  </div>
  <div style="margin-bottom:16px">
    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:8px">Loại vũ trụ</label>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">
      ${types.map(t=>`
      <div class="mv-type-option" data-id="${t.id}" onclick="document.querySelectorAll('.mv-type-option').forEach(x=>x.style.borderColor='#334155');this.style.borderColor='${t.color}';document.getElementById('mv-selected-type').value='${t.id}'" style="padding:8px;background:#1e293b;border:2px solid #334155;border-radius:6px;cursor:pointer">
        <div style="font-size:13px;color:${t.color};font-weight:600">${t.name}</div>
        <div style="font-size:10px;color:#64748b;margin-top:2px">${t.desc.substring(0,40)}...</div>
      </div>`).join("")}
    </div>
    <input type="hidden" id="mv-selected-type" value="cultivation">
  </div>
  <div style="display:flex;gap:10px">
    <button onclick="const n=document.getElementById('mv-new-name').value;const t=document.getElementById('mv-selected-type').value;window.mvCreateUniverse(t,n||null);document.getElementById('mv-create-modal').remove();window.mvRenderPanel()" style="flex:1;padding:10px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:13px">✨ Tạo Vũ Trụ</button>
    <button onclick="document.getElementById('mv-create-modal').remove()" style="padding:10px 16px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:13px">Hủy</button>
  </div>
</div>`;
    document.body.appendChild(overlay);
  };

  // ─── INIT ─────────────────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
      load();
      if (window.mvData.universes.length === 0) {
        window.mvCreateUniverse("cultivation");
        window.mvCreateUniverse("divine");
        window.mvCreateUniverse("demon");
      }
      console.log("[MultiverseEngine V35] 🌌 Đa Vũ Trụ khởi động —", window.mvData.universes.filter(u=>u.status==="active").length, "vũ trụ hoạt động.");
    }, 2200);
  });

})();
