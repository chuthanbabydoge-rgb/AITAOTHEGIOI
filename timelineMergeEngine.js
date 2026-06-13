(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // TIMELINE MERGE ENGINE V36 — Hợp Nhất · Tách · Lưu Trữ Dòng Thời Gian
  // ═══════════════════════════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_timeline_merge_v36";

  function defaultData() {
    return { merges: [], splits: [], archives: [], tick: 0, totalMerges: 0, totalSplits: 0 };
  }

  window.tmeData = window.tmeData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.tmeData)); } catch(e) {} }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { const p = JSON.parse(raw); if (p) window.tmeData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  // ─── Hợp nhất 2 dòng thời gian ────────────────────────────────────────────
  window.tmeMerge = function(tlId1, tlId2, newName) {
    const tl1 = window.tlGetById && window.tlGetById(tlId1);
    const tl2 = window.tlGetById && window.tlGetById(tlId2);
    if (!tl1 || !tl2 || tl1.id === tl2.id) return null;
    if (tl1.status !== "active" || tl2.status !== "active") return null;
    if (!window.tlCreateTimeline) return null;

    const mergedName = newName || (tl1.name.substring(0,15) + " ⊕ " + tl2.name.substring(0,15));
    const merged = window.tlCreateTimeline("canonical", mergedName, `Hợp nhất từ "${tl1.name}" và "${tl2.name}"`, null);
    if (!merged) return null;

    merged.population = tl1.population + tl2.population;
    merged.kingdoms   = tl1.kingdoms + tl2.kingdoms;
    merged.gods       = tl1.gods + tl2.gods;
    merged.stability  = Math.floor((tl1.stability + tl2.stability) / 2);
    merged.power      = tl1.power + tl2.power;
    merged.mergedFrom = [tlId1, tlId2];

    tl1.status = "merged"; tl2.status = "merged";

    window.tmeData.merges.unshift({ id1: tlId1, name1: tl1.name, id2: tlId2, name2: tl2.name, resultId: merged.id, resultName: merged.name, year: window.year||0 });
    if (window.tmeData.merges.length > 50) window.tmeData.merges.length = 50;
    window.tmeData.totalMerges++;

    if (typeof window.tlLog === "function") window.tlLog(`🔗 Hợp nhất: "${tl1.name}" + "${tl2.name}" → "${merged.name}"`);
    if (typeof window.htAddEvent === "function") window.htAddEvent({ year: window.year||0, desc:`Hợp nhất dòng thời gian: "${tl1.name}" + "${tl2.name}"`, type:"timeline_merged", source:"timeline_merge" });
    _persist(); save(); return merged;
  };

  // ─── Tách dòng thời gian ──────────────────────────────────────────────────
  window.tmeSplit = function(tlId) {
    const src = window.tlGetById && window.tlGetById(tlId);
    if (!src || src.status !== "active" || !window.tlCreateTimeline) return [];

    const types  = window.tlGetTypes ? window.tlGetTypes() : [];
    const typeA  = src.type;
    const typeB  = types[Math.floor(Math.random() * types.length)] ? types[Math.floor(Math.random() * types.length)].id : "dark";

    const splitA = window.tlCreateTimeline(typeA, src.name + " Alpha", `Tách từ "${src.name}"`, src.id);
    const splitB = window.tlCreateTimeline(typeB, src.name + " Beta",  `Tách từ "${src.name}"`, src.id);

    if (splitA) { splitA.population = Math.floor(src.population / 2); splitA.stability = src.stability; }
    if (splitB) { splitB.population = src.population - (splitA ? splitA.population : 0); splitB.stability = Math.max(1, src.stability - 10); }

    src.status = "split";

    window.tmeData.splits.unshift({ srcId: tlId, srcName: src.name, resultA: splitA ? splitA.id : null, resultB: splitB ? splitB.id : null, year: window.year||0 });
    if (window.tmeData.splits.length > 50) window.tmeData.splits.length = 50;
    window.tmeData.totalSplits++;

    if (typeof window.tlLog === "function") window.tlLog(`⚡ Tách: "${src.name}" → "${splitA?splitA.name:"?"}" + "${splitB?splitB.name:"?"}"`);
    if (typeof window.htAddEvent === "function") window.htAddEvent({ year: window.year||0, desc:`Tách dòng thời gian: "${src.name}" thành 2 nhánh`, type:"timeline_split", source:"timeline_merge" });
    _persist(); save(); return [splitA, splitB].filter(Boolean);
  };

  // ─── Lưu trữ ─────────────────────────────────────────────────────────────
  window.tmeArchive = function(tlId) {
    const tl = window.tlGetById && window.tlGetById(tlId);
    if (!tl) return;
    window.tlArchiveTimeline && window.tlArchiveTimeline(tlId);
    window.tmeData.archives.unshift({ tlId, name: tl.name, year: window.year||0, snap: JSON.parse(JSON.stringify(tl)) });
    if (window.tmeData.archives.length > 50) window.tmeData.archives.length = 50;
    if (typeof window.tlLog === "function") window.tlLog(`📦 Lưu trữ dòng thời gian "${tl.name}".`);
    save();
  };

  function _persist() {
    try { localStorage.setItem("cgv6_timeline_engine_v36", JSON.stringify(window.tlData)); } catch(e) {}
  }

  window.tmeGetMerges   = function() { return window.tmeData.merges; };
  window.tmeGetSplits   = function() { return window.tmeData.splits; };
  window.tmeGetArchives = function() { return window.tmeData.archives; };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  window.tmeRenderPanel = function() {
    const el = document.getElementById("panel-timeline-v36");
    if (!el) return;
    const active = window.tlGetActiveTimelines ? window.tlGetActiveTimelines() : [];
    const merges = window.tmeData.merges.slice(0, 10);
    const splits = window.tmeData.splits.slice(0, 10);
    const archives = window.tmeData.archives.slice(0, 10);

    el.innerHTML = `
<div style="padding:16px;font-family:'Noto Serif SC',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">
  <h2 style="margin:0 0 16px;font-size:20px;color:#8b5cf6;font-family:Cinzel,serif">🔗 Hợp Nhất & Tách Dòng Thời Gian V36</h2>

  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:18px">
    <div style="background:#0f172a;border:1px solid #8b5cf644;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:700;color:#8b5cf6">${window.tmeData.totalMerges}</div><div style="font-size:10px;color:#64748b">Lần Hợp Nhất</div></div>
    <div style="background:#0f172a;border:1px solid #fbbf2444;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:700;color:#fbbf24">${window.tmeData.totalSplits}</div><div style="font-size:10px;color:#64748b">Lần Tách</div></div>
    <div style="background:#0f172a;border:1px solid #06b6d444;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:700;color:#06b6d4">${window.tmeData.archives.length}</div><div style="font-size:10px;color:#64748b">Lưu Trữ</div></div>
  </div>

  ${active.length >= 2 ? `
  <div style="margin-bottom:18px">
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:8px">⚡ THAO TÁC NHANH</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px">
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
        <select id="tme-merge-sel1" style="padding:7px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:11px">
          ${active.map(t=>`<option value="${t.id}">${t.name.substring(0,20)}</option>`).join("")}
        </select>
        <span style="color:#8b5cf6;font-size:14px">⊕</span>
        <select id="tme-merge-sel2" style="padding:7px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:11px">
          ${active.map(t=>`<option value="${t.id}">${t.name.substring(0,20)}</option>`).join("")}
        </select>
        <button onclick="const a=document.getElementById('tme-merge-sel1').value;const b=document.getElementById('tme-merge-sel2').value;if(a===b){alert('Chọn 2 dòng khác nhau!')}else{tmeMerge(a,b,null);tmeRenderPanel()}" style="padding:7px 14px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:12px">🔗 Hợp Nhất</button>
      </div>
    </div>
    <div style="display:flex;gap:6px;align-items:center;margin-top:8px;flex-wrap:wrap">
      <select id="tme-split-sel" style="padding:7px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:11px">
        ${active.map(t=>`<option value="${t.id}">${t.name.substring(0,25)}</option>`).join("")}
      </select>
      <button onclick="const a=document.getElementById('tme-split-sel').value;tmeSplit(a);tmeRenderPanel()" style="padding:7px 14px;background:linear-gradient(135deg,#fbbf24,#f59e0b);border:none;border-radius:6px;color:#000;cursor:pointer;font-size:12px;font-weight:600">⚡ Tách</button>
      <select id="tme-arch-sel" style="padding:7px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:11px">
        ${active.map(t=>`<option value="${t.id}">${t.name.substring(0,25)}</option>`).join("")}
      </select>
      <button onclick="const a=document.getElementById('tme-arch-sel').value;tmeArchive(a);tmeRenderPanel()" style="padding:7px 12px;background:#1e293b;border:1px solid #06b6d4;border-radius:6px;color:#06b6d4;cursor:pointer;font-size:12px">📦 Lưu Trữ</button>
    </div>
  </div>` : `<div style="text-align:center;padding:20px;color:#475569;background:#0f172a;border-radius:8px;margin-bottom:18px">Cần ít nhất 2 dòng thời gian hoạt động</div>`}

  ${merges.length > 0 ? `<div style="margin-bottom:14px"><div style="font-size:12px;color:#94a3b8;font-weight:600;margin-bottom:6px">🔗 LỊCH SỬ HỢP NHẤT</div><div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;max-height:120px;overflow-y:auto">${merges.map(m=>`<div style="font-size:11px;color:#64748b;padding:3px 0;border-bottom:1px solid #0a0a1a">Năm ${m.year}: "${m.name1}" + "${m.name2}" → "${m.resultName}"</div>`).join("")}</div></div>` : ""}
  ${splits.length > 0 ? `<div style="margin-bottom:14px"><div style="font-size:12px;color:#94a3b8;font-weight:600;margin-bottom:6px">⚡ LỊCH SỬ TÁCH</div><div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;max-height:120px;overflow-y:auto">${splits.map(s=>`<div style="font-size:11px;color:#64748b;padding:3px 0;border-bottom:1px solid #0a0a1a">Năm ${s.year}: "${s.srcName}" → Alpha + Beta</div>`).join("")}</div></div>` : ""}
  ${archives.length > 0 ? `<div><div style="font-size:12px;color:#94a3b8;font-weight:600;margin-bottom:6px">📦 KHO LƯU TRỮ</div><div style="display:grid;gap:5px">${archives.map(a=>`<div style="background:#0f172a;border:1px solid #1e293b;border-radius:6px;padding:8px;font-size:12px"><span style="color:#06b6d4">${a.name}</span> <span style="color:#475569">· Lưu năm ${a.year}</span></div>`).join("")}</div></div>` : ""}
</div>`;
  };

  // ─── gameTick ─────────────────────────────────────────────────────────────
  const _prevTick = window.gameTick;
  window.gameTick = function() {
    if (typeof _prevTick === "function") _prevTick();
    window.tmeData.tick++;
    if (window.tmeData.tick % 60 === 0) save();
  };

  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() { load(); console.log("[TimelineMergeEngine V36] 🔗 Hợp nhất dòng thời gian sẵn sàng."); }, 3350);
  });
})();
