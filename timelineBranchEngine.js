(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // TIMELINE BRANCH ENGINE V36 — Tự Động Phân Nhánh Dòng Thời Gian
  // Tạo nhánh khi: vương quốc sụp đổ, đế chế thắng, thần thăng thiên,
  //                trùm sống sót, Tạo Hóa can thiệp
  // ═══════════════════════════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_timeline_branch_v36";

  const BRANCH_TRIGGERS = [
    { id:"kingdom_collapse",  name:"Vương Quốc Sụp Đổ",   type:"dark",       prob:0.25, icon:"🏚️" },
    { id:"empire_victory",    name:"Đế Chế Thắng Trận",    type:"golden",     prob:0.20, icon:"🏆" },
    { id:"god_ascension",     name:"Thần Thăng Thiên",      type:"divine",     prob:0.15, icon:"✨" },
    { id:"boss_survived",     name:"Trùm Thế Giới Sống",    type:"apocalypse", prob:0.20, icon:"👹" },
    { id:"creator_intervene", name:"Tạo Hóa Can Thiệp",     type:"canonical",  prob:0.10, icon:"👁" },
    { id:"great_war",         name:"Đại Chiến Kết Thúc",    type:"dark",       prob:0.20, icon:"⚔️" },
    { id:"divine_war",        name:"Thần Thánh Bất Hòa",    type:"demon",      prob:0.15, icon:"💥" },
    { id:"civilization_peak", name:"Đỉnh Cao Văn Minh",     type:"golden",     prob:0.10, icon:"🌅" }
  ];

  function defaultData() {
    return { branches: [], autoEnabled: true, tick: 0, totalBranched: 0 };
  }

  window.tbData = window.tbData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.tbData)); } catch(e) {} }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { const p = JSON.parse(raw); if (p) window.tbData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  // ─── Tạo nhánh từ trigger ─────────────────────────────────────────────────
  window.tlBranchFromTrigger = function(triggerId, parentId, customDesc) {
    const trigger = BRANCH_TRIGGERS.find(t => t.id === triggerId) || BRANCH_TRIGGERS[0];
    if (!window.tlCreateTimeline) return null;

    const names = {
      kingdom_collapse:  ["Thế Giới Không Có Vương Quốc Đó","Dòng Nơi Vương Triều Tiếp Tục","Lịch Sử Của Kẻ Thắng Cuộc"],
      empire_victory:    ["Đế Chế Thống Trị Vĩnh Cửu","Dòng Pax Imperialis","Thời Đại Đế Quốc Không Diệt"],
      god_ascension:     ["Thế Giới Không Có Vị Thần Đó","Dòng Thần Thánh Mới","Kỷ Nguyên Thần Linh Rút Lui"],
      boss_survived:     ["Ác Nhân Thống Trị","Dòng Tận Thế Không Xảy Ra","Thế Giới Của Kẻ Sống Sót"],
      creator_intervene: ["Dòng Can Thiệp Tạo Hóa","Thực Tại Được Thay Đổi","Kỷ Nguyên Thiên Ý"],
      great_war:         ["Dòng Hòa Bình Vĩnh Cửu","Thế Giới Không Có Chiến Tranh Đó","Lịch Sử Kẻ Bại"],
      divine_war:        ["Dòng Thần Thánh Hiệp Thông","Kỷ Nguyên Thần Chiến Không Dứt","Dòng Ma Quỷ Chiến Thắng"],
      civilization_peak: ["Dòng Thời Đại Vàng Mãi Mãi","Văn Minh Không Suy Tàn","Đỉnh Cao Không Đổ Vỡ"]
    };
    const pool = names[triggerId] || ["Dòng Thời Gian Thay Thế"];
    const name = pool[Math.floor(Math.random() * pool.length)] + " " + (window.tlData ? (window.tlData.totalCreated+1) : "");
    const originEvent = customDesc || (trigger.icon + " " + trigger.name);

    const newTl = window.tlCreateTimeline(trigger.type, name, originEvent, parentId || null);
    if (!newTl) return null;

    window.tbData.branches.unshift({
      tlId: newTl.id, name: newTl.name, trigger: trigger.name, triggerId,
      parentId: parentId || null, year: window.year || 0
    });
    if (window.tbData.branches.length > 100) window.tbData.branches.length = 100;
    window.tbData.totalBranched++;
    save();

    if (typeof window.tlLog === "function") window.tlLog(`${trigger.icon} Dòng thời gian phân nhánh: "${newTl.name}" do "${trigger.name}"!`);
    return newTl;
  };

  // ─── Phân nhánh từ trạng thái world hiện tại ─────────────────────────────
  window.tlBranchFromWorld = function() {
    if (!window.tlCreateTimeline) return null;
    const active = window.tlGetActiveTimelines ? window.tlGetActiveTimelines() : [];
    const parentId = active.length > 0 ? active[0].id : null;

    const events = [
      { trigger:"kingdom_collapse",  cond:() => window.countries && window.countries.some(c => c.population < 100) },
      { trigger:"god_ascension",     cond:() => window.world && (window.world.divineBeings || 0) > 0 },
      { trigger:"boss_survived",     cond:() => window.world && window.world.bossesAlive > 0 },
      { trigger:"civilization_peak", cond:() => window.world && window.world.year > 500 }
    ];

    const eligible = events.filter(e => e.cond());
    if (eligible.length > 0) {
      const chosen = eligible[Math.floor(Math.random() * eligible.length)];
      return window.tlBranchFromTrigger(chosen.trigger, parentId);
    }
    // fallback random
    const trig = BRANCH_TRIGGERS[Math.floor(Math.random() * BRANCH_TRIGGERS.length)];
    return window.tlBranchFromTrigger(trig.id, parentId);
  };

  // ─── Auto-branch khi nghe event từ hệ thống khác ─────────────────────────
  window.tbRegisterEvent = function(eventType, desc) {
    if (!window.tbData.autoEnabled) return;
    const triggerMap = {
      "kingdom_collapse":  "kingdom_collapse",
      "empire_victory":    "empire_victory",
      "god_ascend":        "god_ascension",
      "ascension":         "god_ascension",
      "boss_defeated":     "boss_survived",
      "war_ended":         "great_war",
      "divine_war":        "divine_war"
    };
    const triggerId = triggerMap[eventType];
    if (!triggerId) return;
    const trig = BRANCH_TRIGGERS.find(t => t.id === triggerId);
    if (trig && Math.random() < trig.prob) {
      const active = window.tlGetActiveTimelines ? window.tlGetActiveTimelines() : [];
      const parentId = active.length > 0 ? active[0].id : null;
      window.tlBranchFromTrigger(triggerId, parentId, desc);
    }
  };

  window.tbGetBranches = function() { return window.tbData.branches; };
  window.tbGetTriggers = function() { return BRANCH_TRIGGERS; };

  // ─── RENDER sub-section (integrated into hub) ─────────────────────────────
  window.tbRenderSection = function(containerId) {
    const el = document.getElementById(containerId || "tb-branch-section");
    if (!el) return;
    const triggers = BRANCH_TRIGGERS;
    const branches = window.tbData.branches.slice(0, 15);

    el.innerHTML = `
<div style="padding:12px;font-family:'Noto Serif SC',serif;background:#0a0a1a;color:#e2e8f0">
  <div style="font-size:13px;color:#fbbf24;font-weight:600;margin-bottom:10px">⚡ Phân Nhánh Dòng Thời Gian</div>
  <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">
    ${triggers.map(t=>`<button onclick="tlBranchFromTrigger('${t.id}',null,null);if(typeof tlRenderPanel==='function')tlRenderPanel()" style="padding:5px 10px;background:#0f172a;border:1px solid #334155;border-radius:5px;color:#94a3b8;cursor:pointer;font-size:11px">${t.icon} ${t.name}</button>`).join("")}
  </div>
  ${branches.length > 0 ? `
  <div style="font-size:12px;color:#64748b;margin-bottom:6px">📋 Nhánh gần đây (${window.tbData.totalBranched} tổng)</div>
  <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:8px;max-height:120px;overflow-y:auto">
    ${branches.map(b=>`<div style="font-size:11px;color:#64748b;padding:3px 0;border-bottom:1px solid #0a0a1a">Năm ${b.year}: "${b.name}" ← ${b.trigger}</div>`).join("")}
  </div>` : ""}
</div>`;
  };

  // ─── gameTick ─────────────────────────────────────────────────────────────
  const _prevTick = window.gameTick;
  window.gameTick = function() {
    if (typeof _prevTick === "function") _prevTick();
    window.tbData.tick++;
    // Tự động phân nhánh mỗi ~200 tick với xác suất thấp
    if (window.tbData.autoEnabled && window.tbData.tick % 200 === 0) {
      const trig = BRANCH_TRIGGERS[Math.floor(Math.random() * BRANCH_TRIGGERS.length)];
      if (Math.random() < 0.15) window.tlBranchFromTrigger(trig.id, null, null);
    }
    if (window.tbData.tick % 60 === 0) save();
  };

  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
      load();
      console.log("[TimelineBranchEngine V36] ⚡ Phân nhánh dòng thời gian sẵn sàng. Auto:", window.tbData.autoEnabled);
    }, 3200);
  });
})();
