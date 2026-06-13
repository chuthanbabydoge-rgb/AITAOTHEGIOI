(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // TIMELINE ENGINE V36 — Hệ Thống Dòng Thời Gian Thay Thế
  // ═══════════════════════════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_timeline_engine_v36";

  const TIMELINE_TYPES = [
    { id:"canonical",   name:"📜 Chính Thống",    color:"#fbbf24", desc:"Dòng thời gian gốc — thực tại hiện tại",         stability:90 },
    { id:"dark",        name:"🌑 Đen Tối",         color:"#6366f1", desc:"Thực tại tăm tối — ma tộc thống trị",            stability:45 },
    { id:"golden",      name:"✨ Vàng Son",         color:"#f59e0b", desc:"Kỷ nguyên hoàng kim — hòa bình thịnh vượng",     stability:80 },
    { id:"divine",      name:"🌟 Thần Thánh",       color:"#e0f2fe", desc:"Thần linh ngự trị — thiên đường trần thế",       stability:75 },
    { id:"apocalypse",  name:"☠️ Tận Thế",          color:"#ef4444", desc:"Văn minh sụp đổ — trận chiến cuối cùng",        stability:20 },
    { id:"demon",       name:"👹 Quỷ Vực",          color:"#7c3aed", desc:"Ma Vương thống trị — thế giới địa ngục hóa",    stability:35 },
    { id:"lost",        name:"👻 Bị Mất",           color:"#475569", desc:"Dòng thời gian bị cắt đứt khỏi thực tại chính", stability:10 }
  ];

  function defaultData() {
    return {
      timelines:     [],
      activeId:      null,
      tick:          0,
      totalCreated:  0,
      totalCollapsed:0,
      totalBranches: 0,
      log:           []
    };
  }

  window.tlData = window.tlData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.tlData)); } catch(e) {} }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { const p = JSON.parse(raw); if (p && p.timelines) window.tlData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  let _idCtr = 1;
  function newId() { return "tl_" + Date.now() + "_" + (_idCtr++); }

  // ─── PUBLIC: Tạo dòng thời gian ───────────────────────────────────────────
  window.tlCreateTimeline = function(typeId, name, originEvent, parentId) {
    const ttype = TIMELINE_TYPES.find(t => t.id === typeId) || TIMELINE_TYPES[0];
    const tlId  = newId();

    // Lấy dân số & năm từ world hiện tại
    const worldPop = (window.world && window.world.population) ? window.world.population : 1000000;
    const curYear  = window.year || 0;

    const tl = {
      id:             tlId,
      name:           name || (ttype.name + " " + (window.tlData.totalCreated + 1)),
      type:           ttype.id,
      typeName:       ttype.name,
      typeColor:      ttype.color,
      desc:           ttype.desc,
      originEvent:    originEvent || "Tự nhiên hình thành",
      divergencePoint:curYear,
      parentId:       parentId || null,
      children:       [],
      age:            0,
      stability:      ttype.stability + Math.floor(Math.random() * 20) - 10,
      population:     Math.floor(worldPop * (0.5 + Math.random())),
      power:          Math.floor(Math.random() * 1000) + 100,
      kingdoms:       Math.floor(Math.random() * 15) + 3,
      gods:           Math.floor(Math.random() * 8) + 1,
      dominantForce:  _getDominantForce(typeId),
      status:         "active",
      events:         [],
      travelers:      0,
      conquests:      0,
      mergedFrom:     [],
      universeId:     (window.mvData && window.mvData.activeUId) ? window.mvData.activeUId : null,
      createdAt:      curYear
    };

    window.tlData.timelines.push(tl);
    window.tlData.totalCreated++;
    if (!window.tlData.activeId) window.tlData.activeId = tlId;

    // Liên kết parent
    if (parentId) {
      const parent = window.tlData.timelines.find(t => t.id === parentId);
      if (parent && parent.children) parent.children.push(tlId);
      window.tlData.totalBranches++;
    }

    tlLog(`🌀 Dòng thời gian "${tl.name}" (${ttype.name}) hình thành — Điểm phân nhánh: Năm ${curYear}`);
    _notifyHistory(`Dòng thời gian mới: "${tl.name}" (${ttype.name})`, "timeline_created");
    save();
    return tl;
  };

  // ─── PUBLIC: Hủy dòng thời gian ──────────────────────────────────────────
  window.tlDestroyTimeline = function(tlId) {
    const tl = window.tlData.timelines.find(t => t.id === tlId);
    if (!tl || tl.status !== "active") return;
    tl.status = "collapsed";
    window.tlData.totalCollapsed++;
    tlLog(`💥 Dòng thời gian "${tl.name}" đã sụp đổ vào hư vô!`);
    _notifyHistory(`Dòng thời gian "${tl.name}" bị hủy diệt`, "timeline_collapsed");
    if (window.tlData.activeId === tlId) {
      const alive = window.tlData.timelines.find(t => t.status === "active");
      window.tlData.activeId = alive ? alive.id : null;
    }
    save();
  };

  // ─── PUBLIC: Lưu trữ dòng thời gian ──────────────────────────────────────
  window.tlArchiveTimeline = function(tlId) {
    const tl = window.tlData.timelines.find(t => t.id === tlId);
    if (!tl) return;
    tl.status = "archived";
    tlLog(`📦 Dòng thời gian "${tl.name}" được lưu trữ.`);
    save();
  };

  // ─── PUBLIC: Lấy dữ liệu ─────────────────────────────────────────────────
  window.tlGetTimelines     = function() { return window.tlData.timelines; };
  window.tlGetActiveTimelines = function() { return window.tlData.timelines.filter(t => t.status === "active"); };
  window.tlGetById          = function(id) { return window.tlData.timelines.find(t => t.id === id) || null; };
  window.tlGetTypes         = function() { return TIMELINE_TYPES; };
  window.tlGetActive        = function() { return window.tlData.timelines.find(t => t.id === window.tlData.activeId) || null; };

  // ─── Lực lượng thống trị theo loại ───────────────────────────────────────
  function _getDominantForce(typeId) {
    const forces = {
      canonical:  "Liên Minh Vương Giả",
      dark:       "Đại Ma Hoàng",
      golden:     "Hội Đồng Thịnh Vượng",
      divine:     "Thiên Đình Thiêng Liêng",
      apocalypse: "Người Sống Sót Cuối Cùng",
      demon:      "Ma Vương Vô Song",
      lost:       "Thực Thể Vô Danh"
    };
    return forces[typeId] || "Thế Lực Bí Ẩn";
  }

  // ─── Log ─────────────────────────────────────────────────────────────────
  function tlLog(msg) {
    window.tlData.log.unshift({ msg, year: window.year || 0 });
    if (window.tlData.log.length > 200) window.tlData.log.length = 200;
    if (typeof window.addLog === "function") window.addLog("[TIMELINE] " + msg);
  }
  window.tlLog = tlLog;

  function _notifyHistory(desc, type) {
    if (typeof window.htAddEvent === "function") window.htAddEvent({ year: window.year||0, desc, type, source:"timeline_v36" });
    if (typeof window.wmAddMemory === "function") window.wmAddMemory({ year: window.year||0, desc, type });
  }

  // ─── RENDER Panel ─────────────────────────────────────────────────────────
  window.tlRenderPanel = function() {
    const el = document.getElementById("panel-timeline-v36");
    if (!el) return;
    const timelines = window.tlData.timelines;
    const active    = timelines.filter(t => t.status === "active");
    const types     = TIMELINE_TYPES;

    el.innerHTML = `
<div style="padding:16px;font-family:'Noto Serif SC',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
    <div>
      <h2 style="margin:0;font-size:20px;color:#fbbf24;font-family:Cinzel,serif">🌀 Dòng Thời Gian V36</h2>
      <div style="font-size:11px;color:#64748b;margin-top:2px">${active.length} dòng thời gian hoạt động · ${window.tlData.totalCreated} tổng đã tạo · ${window.tlData.totalBranches} nhánh</div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button onclick="tlRenderCreateModal()" style="padding:6px 14px;background:linear-gradient(135deg,#fbbf24,#f59e0b);border:none;border-radius:6px;color:#000;cursor:pointer;font-size:12px;font-weight:600">+ Tạo Dòng Thời Gian</button>
      <button onclick="tlBranchFromWorld&&tlBranchFromWorld();tlRenderPanel()" style="padding:6px 14px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:12px">⚡ Phân Nhánh Tự Động</button>
      <button onclick="tlRenderPanel()" style="padding:6px 12px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:12px">↺</button>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-bottom:18px">
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;text-align:center">
      <div style="font-size:22px;font-weight:700;color:#fbbf24">${active.length}</div><div style="font-size:10px;color:#64748b">Đang Hoạt Động</div>
    </div>
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;text-align:center">
      <div style="font-size:22px;font-weight:700;color:#8b5cf6">${window.tlData.totalBranches}</div><div style="font-size:10px;color:#64748b">Nhánh Phân Kỳ</div>
    </div>
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;text-align:center">
      <div style="font-size:22px;font-weight:700;color:#ef4444">${window.tlData.totalCollapsed}</div><div style="font-size:10px;color:#64748b">Đã Sụp Đổ</div>
    </div>
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;text-align:center">
      <div style="font-size:22px;font-weight:700;color:#06b6d4">${timelines.filter(t=>t.status==="archived").length}</div><div style="font-size:10px;color:#64748b">Lưu Trữ</div>
    </div>
  </div>

  <div style="margin-bottom:12px;font-size:12px;color:#64748b">📋 LOẠI DÒNG THỜI GIAN</div>
  <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px">
    ${types.map(t => {
      const cnt = active.filter(tl=>tl.type===t.id).length;
      return `<div style="padding:5px 10px;background:#0f172a;border:1px solid ${cnt>0?t.color+"66":"#1e293b"};border-radius:6px;font-size:11px;color:${t.color}">${t.name} <span style="color:#64748b">${cnt}</span></div>`;
    }).join("")}
  </div>

  <div style="margin-bottom:12px;font-size:13px;color:#94a3b8;font-weight:600">📋 DANH SÁCH DÒNG THỜI GIAN</div>
  ${timelines.length === 0 ?
  `<div style="text-align:center;padding:40px;color:#475569;background:#0f172a;border-radius:8px">
    <div style="font-size:40px;margin-bottom:8px">🌀</div>
    <div>Chưa có dòng thời gian. Nhấn "+ Tạo" để bắt đầu!</div>
  </div>` :
  `<div style="display:grid;gap:8px">
    ${timelines.map(tl => `
    <div style="background:#0f172a;border:1px solid ${tl.status==="active"?tl.typeColor+"44":"#1e293b"};border-radius:10px;padding:12px">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px">
        <div style="display:flex;align-items:center;gap:8px;min-width:0">
          <span style="width:9px;height:9px;border-radius:50%;background:${tl.typeColor};flex-shrink:0;box-shadow:0 0 5px ${tl.typeColor}"></span>
          <span style="font-weight:600;color:${tl.status==="active"?tl.typeColor:"#64748b"};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${tl.name}</span>
          <span style="font-size:10px;color:#64748b;flex-shrink:0">${tl.typeName}</span>
          ${tl.parentId ? `<span style="font-size:9px;color:#475569;background:#0a0a1a;padding:1px 5px;border-radius:3px">nhánh</span>` : `<span style="font-size:9px;color:#fbbf2488;background:#0a0a1a;padding:1px 5px;border-radius:3px">gốc</span>`}
        </div>
        <div style="display:flex;gap:5px;flex-shrink:0">
          ${tl.status==="active" ? `
          <button onclick="event.stopPropagation();tlArchiveTimeline('${tl.id}');tlRenderPanel()" style="padding:3px 8px;background:#1e293b;border:1px solid #334155;border-radius:4px;color:#64748b;cursor:pointer;font-size:10px">📦</button>
          <button onclick="event.stopPropagation();if(confirm('Hủy diệt dòng thời gian này?')){tlDestroyTimeline('${tl.id}');tlRenderPanel()}" style="padding:3px 8px;background:#1e293b;border:1px solid #ef4444;border-radius:4px;color:#f87171;cursor:pointer;font-size:10px">💥</button>
          ` : `<span style="font-size:10px;color:#475569;padding:3px 8px;background:#0a0a1a;border-radius:4px">${tl.status==="archived"?"📦 Lưu trữ":"☠️ Sụp đổ"}</span>`}
        </div>
      </div>
      <div style="margin-top:8px;display:grid;grid-template-columns:repeat(4,1fr);gap:4px;font-size:11px;color:#64748b">
        <div>👥 ${(tl.population/1000).toFixed(0)}K</div>
        <div>🏰 ${tl.kingdoms} vương quốc</div>
        <div>✨ ${tl.gods} thần</div>
        <div style="color:${tl.stability>60?"#34d399":tl.stability>30?"#fbbf24":"#ef4444"}">⚡ ${tl.stability.toFixed(0)}%</div>
      </div>
      <div style="margin-top:4px;font-size:10px;color:#475569">📌 ${tl.originEvent} · Năm ${tl.divergencePoint}</div>
      <div style="margin-top:5px;height:3px;background:#1e293b;border-radius:2px;overflow:hidden">
        <div style="height:100%;width:${tl.stability}%;background:${tl.stability>60?"#34d399":tl.stability>30?"#fbbf24":"#ef4444"}"></div>
      </div>
    </div>`).join("")}
  </div>`}

  ${window.tlData.log.length > 0 ? `
  <div style="margin-top:18px">
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:6px">📜 NHẬT KÝ</div>
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;max-height:120px;overflow-y:auto">
      ${window.tlData.log.slice(0,20).map(l=>`<div style="font-size:11px;color:#64748b;padding:3px 0;border-bottom:1px solid #0a0a1a">Năm ${l.year}: ${l.msg}</div>`).join("")}
    </div>
  </div>` : ""}
</div>`;
  };

  window.tlRenderCreateModal = function() {
    const types = TIMELINE_TYPES;
    const modal = document.createElement("div");
    modal.id = "tl-create-modal";
    modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:#000000cc;z-index:9999;display:flex;align-items:center;justify-content:center";
    modal.innerHTML = `
<div style="background:#0f172a;border:1px solid #fbbf24;border-radius:12px;padding:24px;width:480px;max-width:90vw;max-height:80vh;overflow-y:auto;font-family:'Noto Serif SC',serif">
  <h3 style="margin:0 0 16px;color:#fbbf24;font-family:Cinzel,serif">🌀 Tạo Dòng Thời Gian Mới</h3>
  <div style="margin-bottom:10px">
    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Tên dòng thời gian</label>
    <input id="tl-name-inp" type="text" placeholder="Để trống = tự động đặt tên..." style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px;box-sizing:border-box">
  </div>
  <div style="margin-bottom:10px">
    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Sự kiện khởi nguồn</label>
    <input id="tl-origin-inp" type="text" placeholder="Điều gì tạo ra dòng thời gian này?" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px;box-sizing:border-box">
  </div>
  <div style="margin-bottom:16px">
    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:8px">Loại dòng thời gian</label>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px">
      ${types.map(t=>`
      <div onclick="document.querySelectorAll('.tl-type-opt').forEach(x=>x.style.borderColor='#334155');this.style.borderColor='${t.color}';document.getElementById('tl-type-hidden').value='${t.id}'" class="tl-type-opt" style="padding:8px;background:#1e293b;border:2px solid #334155;border-radius:6px;cursor:pointer">
        <div style="font-size:12px;color:${t.color};font-weight:600">${t.name}</div>
        <div style="font-size:10px;color:#64748b;margin-top:2px">${t.desc.substring(0,40)}...</div>
      </div>`).join("")}
    </div>
    <input type="hidden" id="tl-type-hidden" value="canonical">
  </div>
  <div style="display:flex;gap:10px">
    <button onclick="const n=document.getElementById('tl-name-inp').value;const o=document.getElementById('tl-origin-inp').value||'Điểm phân kỳ lịch sử';const t=document.getElementById('tl-type-hidden').value;tlCreateTimeline(t,n||null,o,null);document.getElementById('tl-create-modal').remove();tlRenderPanel()" style="flex:1;padding:10px;background:linear-gradient(135deg,#fbbf24,#f59e0b);border:none;border-radius:6px;color:#000;font-weight:600;cursor:pointer;font-size:13px">🌀 Tạo</button>
    <button onclick="document.getElementById('tl-create-modal').remove()" style="padding:10px 16px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:13px">Hủy</button>
  </div>
</div>`;
    document.body.appendChild(modal);
  };

  // ─── gameTick ─────────────────────────────────────────────────────────────
  const _prevTick = window.gameTick;
  window.gameTick = function() {
    if (typeof _prevTick === "function") _prevTick();
    window.tlData.tick++;
    const active = window.tlData.timelines.filter(t => t.status === "active");
    active.forEach(function(tl) {
      tl.age++;
      tl.stability += (Math.random() - 0.49) * 1.5;
      tl.stability  = Math.max(1, Math.min(100, tl.stability));
      if (tl.stability > 60) tl.population = Math.floor(tl.population * 1.0005);
      if (tl.stability < 5 && Math.random() < 0.015) window.tlDestroyTimeline(tl.id);
    });
    if (active.length < 1 && window.tlData.tick % 200 === 0) {
      window.tlCreateTimeline("canonical", null, "Tự phục hồi", null);
    }
    if (window.tlData.tick % 30 === 0) save();
  };

  // ─── INIT ─────────────────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
      load();
      if (window.tlData.timelines.length === 0) {
        window.tlCreateTimeline("canonical", "Dòng Thời Gian Chính", "Sự kiện khởi nguyên của thế giới", null);
        window.tlCreateTimeline("golden", "Kỷ Nguyên Vàng Son Alpha", "Các vương quốc thịnh vượng đồng thuận", null);
        window.tlCreateTimeline("dark", "Dòng Tối Nguyên Thủy", "Ma Vương trỗi dậy lần đầu", null);
      }
      console.log("[TimelineEngine V36] 🌀 Dòng thời gian khởi động —", window.tlGetActiveTimelines().length, "dòng thời gian hoạt động.");
    }, 3000);
  });

})();
