(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // TIMELINE EVENT ENGINE V36 — Sự Kiện Lịch Sử Thay Thế
  // Các "what if" scenarios — điều gì đã không xảy ra trong dòng này
  // ═══════════════════════════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_timeline_events_v36";

  const ALTERNATE_EVENTS = [
    { id:"empire_never",     name:"Đế Chế Chưa Tồn Tại",      icon:"🏚️", effect:"dark",      stability:-10, desc:"Một đế chế vĩ đại chưa bao giờ được lập" },
    { id:"ruler_diff",       name:"Người Cai Trị Khác",          icon:"👑", effect:"canonical", stability:+5,  desc:"Vị vua thay thế lên ngôi đổi hướng lịch sử" },
    { id:"god_no_ascend",    name:"Thần Chưa Thăng Thiên",       icon:"⛔", effect:"dark",      stability:-8,  desc:"Vị thần lực lượng vẫn còn hiện diện ở trần thế" },
    { id:"world_no_collapse",name:"Thế Giới Không Sụp Đổ",       icon:"🌍", effect:"golden",    stability:+15, desc:"Thảm họa đã không xảy ra, văn minh tiếp tục" },
    { id:"magic_forbidden",  name:"Phép Thuật Bị Cấm Đoán",      icon:"🚫", effect:"apocalypse",stability:-12, desc:"Linh khí bị đóng ấn, tu sĩ mất đi sức mạnh" },
    { id:"sect_alliance",    name:"Đại Liên Minh Tông Môn",      icon:"🤝", effect:"divine",    stability:+10, desc:"Tất cả tông môn hợp lực chưa từng có" },
    { id:"demon_peace",      name:"Ma Tộc Ký Hòa Ước",           icon:"📜", effect:"golden",    stability:+8,  desc:"Ma tộc và người đạt thỏa thuận hòa bình kỳ lạ" },
    { id:"technology_surge", name:"Bùng Nổ Công Nghệ Kỳ Diệu",  icon:"⚙️", effect:"canonical", stability:+7,  desc:"Khoa học kỹ thuật vượt bậc 500 năm lịch sử" },
    { id:"divine_war_cont",  name:"Thần Chiến Không Dứt",         icon:"⚔️", effect:"apocalypse",stability:-20, desc:"Cuộc chiến giữa các thần vẫn chưa kết thúc" },
    { id:"lost_age",         name:"Thời Đại Bị Lãng Quên",       icon:"👻", effect:"lost",      stability:-15, desc:"Toàn bộ một kỷ nguyên đã bị xóa khỏi ký ức" }
  ];

  function defaultData() {
    return { events: [], generated: [], tick: 0, total: 0 };
  }

  window.teeData = window.teeData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.teeData)); } catch(e) {} }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { const p = JSON.parse(raw); if (p && p.events) window.teeData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  let _idCtr = 1;
  function newId() { return "tev_" + Date.now() + "_" + (_idCtr++); }

  // ─── Tạo sự kiện thay thế ─────────────────────────────────────────────────
  window.teeGenerateEvent = function(tlId, eventId) {
    const tl  = window.tlGetById && window.tlGetById(tlId);
    const evDef = eventId ? ALTERNATE_EVENTS.find(e => e.id === eventId) : ALTERNATE_EVENTS[Math.floor(Math.random()*ALTERNATE_EVENTS.length)];
    if (!tl || !evDef || tl.status !== "active") return null;

    const ev = {
      id:     newId(),
      tlId,   tlName: tl.name,
      eventId: evDef.id,
      name:   evDef.name,
      icon:   evDef.icon,
      desc:   evDef.desc,
      effect: evDef.effect,
      year:   window.year || 0,
      stability: evDef.stability
    };

    tl.stability = Math.max(1, Math.min(100, tl.stability + (evDef.stability || 0)));
    tl.events = tl.events || [];
    tl.events.push({ type: evDef.id, desc: evDef.desc, year: window.year||0 });
    if (tl.events.length > 20) tl.events.shift();

    window.teeData.events.unshift(ev);
    if (window.teeData.events.length > 200) window.teeData.events.length = 200;
    window.teeData.total++;

    if (typeof window.tlLog === "function") window.tlLog(`${evDef.icon} [${tl.name}] ${evDef.name}: ${evDef.desc}`);
    if (typeof window.htAddEvent === "function") window.htAddEvent({ year: window.year||0, desc:`[${tl.name}] ${evDef.icon} ${evDef.name}`, type:"timeline_event", source:"timeline_events" });
    if (typeof window.tbRegisterEvent === "function") window.tbRegisterEvent(evDef.effect, evDef.name);

    try { localStorage.setItem("cgv6_timeline_engine_v36", JSON.stringify(window.tlData)); } catch(e) {}
    save(); return ev;
  };

  window.teeAutoGenerate = function() {
    const active = window.tlGetActiveTimelines ? window.tlGetActiveTimelines() : [];
    if (active.length === 0) return;
    const tl = active[Math.floor(Math.random()*active.length)];
    window.teeGenerateEvent(tl.id, null);
  };

  window.teeGetEvents    = function() { return window.teeData.events; };
  window.teeGetAltEvents = function() { return ALTERNATE_EVENTS; };

  // ─── RENDER integrated inside main timeline panel ────────────────────────
  window.teeRenderSection = function(containerId) {
    const el = document.getElementById(containerId || "tee-events-section");
    if (!el) return;
    const timelines = window.tlGetActiveTimelines ? window.tlGetActiveTimelines() : [];
    const events    = window.teeData.events.slice(0, 20);
    const altEvents = ALTERNATE_EVENTS;

    el.innerHTML = `
<div style="padding:12px;font-family:'Noto Serif SC',serif;background:#0a0a1a;color:#e2e8f0">
  <div style="font-size:13px;color:#fbbf24;font-weight:600;margin-bottom:10px">📜 Sự Kiện Lịch Sử Thay Thế</div>
  ${timelines.length > 0 ? `
  <div style="margin-bottom:10px">
    <select id="tee-tl-sel" style="padding:7px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:12px;width:200px;margin-right:8px">
      ${timelines.map(t=>`<option value="${t.id}">${t.name}</option>`).join("")}
    </select>
    <select id="tee-ev-sel" style="padding:7px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:12px;width:200px;margin-right:8px">
      <option value="">Ngẫu nhiên</option>
      ${altEvents.map(e=>`<option value="${e.id}">${e.icon} ${e.name}</option>`).join("")}
    </select>
    <button onclick="const tl=document.getElementById('tee-tl-sel').value;const ev=document.getElementById('tee-ev-sel').value||null;teeGenerateEvent(tl,ev);teeRenderSection('tee-events-section')" style="padding:7px 14px;background:linear-gradient(135deg,#fbbf24,#f59e0b);border:none;border-radius:6px;color:#000;cursor:pointer;font-size:12px;font-weight:600">⚡ Tạo Sự Kiện</button>
    <button onclick="teeAutoGenerate();teeRenderSection('tee-events-section')" style="padding:7px 12px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:12px;margin-left:6px">🎲 Ngẫu Nhiên</button>
  </div>` : `<div style="color:#475569;font-size:12px;margin-bottom:10px">Cần tạo dòng thời gian trước</div>`}
  ${events.length > 0 ? `
  <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;max-height:200px;overflow-y:auto">
    ${events.map(e=>`
    <div style="padding:6px 0;border-bottom:1px solid #0a0a1a">
      <div style="font-size:12px;color:#fbbf24">${e.icon} ${e.name} <span style="font-size:10px;color:#64748b">· ${e.tlName}</span></div>
      <div style="font-size:11px;color:#64748b;margin-top:2px">${e.desc} · Năm ${e.year}</div>
    </div>`).join("")}
  </div>` : `<div style="color:#475569;font-size:12px;padding:10px 0">Chưa có sự kiện nào.</div>`}
</div>`;
  };

  // ─── gameTick ─────────────────────────────────────────────────────────────
  const _prevTick = window.gameTick;
  window.gameTick = function() {
    if (typeof _prevTick === "function") _prevTick();
    window.teeData.tick++;
    if (window.teeData.tick % 180 === 0 && Math.random() < 0.3) window.teeAutoGenerate();
    if (window.teeData.tick % 60 === 0) save();
  };

  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() { load(); console.log("[TimelineEventEngine V36] 📜 Sự kiện lịch sử thay thế sẵn sàng."); }, 3300);
  });
})();
