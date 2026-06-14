(function() {
  "use strict";

  // ════════════════════════════════════════
  // NARRATIVE REGISTRY V68
  // Patch creator-hub-v32: thêm section Sử Ký
  // ════════════════════════════════════════

  // ════ REFRESH (re-render panel content) ════
  window.nr68Refresh = function() {
    const wrapper = document.getElementById("nr68-section-wrapper");
    if (!wrapper) return;
    const content = document.getElementById("nr68-book-content");
    if (content && typeof window.nb68RenderPanel === "function") {
      content.innerHTML = window.nb68RenderPanel();
    }
  };

  // ════ BUILD SECTION ════
  function buildNarrativeSection() {
    return `<div id="nr68-section-wrapper" style="margin-top:16px;border-top:2px solid #78350f;padding-top:14px">
      <div style="font-family:'Courier New',monospace;font-size:14px;color:#fbbf24;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:8px">
          📜 V68 — Sử Ký Thế Giới
          <span style="font-size:10px;color:#475569;font-family:monospace">AI-Generated Chronicles</span>
        </div>
        <button onclick="nr68_quickGenerate()"
          style="background:#78350f;border:1px solid #fbbf24;color:#fbbf24;padding:4px 10px;border-radius:5px;cursor:pointer;font-size:11px;font-family:'Courier New',monospace">
          ✍️ Viết Ngay
        </button>
      </div>

      <!-- Jarvis Narrator Banner -->
      <div id="nr68-jarvis-banner" style="background:linear-gradient(135deg,#1c1003,#292109);border:1px solid #fbbf2422;border-radius:6px;padding:8px;margin-bottom:10px;font-size:11px;color:#92400e;font-family:'Courier New',monospace">
        ${_buildJarvisBanner()}
      </div>

      <!-- Book content area -->
      <div id="nr68-book-content">
        ${typeof window.nb68RenderPanel === "function" ? window.nb68RenderPanel() : "<div style='color:#475569;padding:20px;text-align:center'>Đang tải...</div>"}
      </div>
    </div>`;
  }

  function _buildJarvisBanner() {
    const d = window.worldNarrativeV68Data;
    const chapters = d ? d.chapters : [];
    const year = window.year || 0;
    const godRank = typeof window.creatorLeg66GetGodRank === "function" ? window.creatorLeg66GetGodRank() : null;
    if (chapters.length === 0) {
      return `🤖 <span style="color:#fbbf24">JARVIS:</span> Chưa có chương sử ký nào. Nhấn <strong style="color:#fbbf24">✍️ Viết Ngay</strong> để Claude bắt đầu ghi chép lịch sử thế giới từ năm ${year}.`;
    }
    const latest = [...chapters].sort((a,b)=>(b.year||0)-(a.year||0))[0];
    const gapYears = year - (latest.year || 0);
    const godLine = godRank ? ` Thần Uy của Ngài đạt cấp <strong style="color:#fbbf24">${godRank.icon} ${godRank.title}</strong>.` : "";
    return `🤖 <span style="color:#fbbf24">JARVIS:</span> ${chapters.length} chương đã ghi chép. Chương gần nhất: <em>"${(latest.title||'?').substring(0,40)}"</em> (Năm ${latest.year}).${gapYears>100 ? ` Đã ${gapYears} năm chưa có chương mới!` : ""}${godLine}`;
  }

  // ════ PATCH HUB RENDER ════
  function patchCreatorHub() {
    const _origHub = window.hubRenderPanel;
    window.hubRenderPanel = function(panelId) {
      if (_origHub) _origHub(panelId);
      if (panelId !== "creator-hub-v32") return;
      setTimeout(function() {
        const panel = document.getElementById("panel-creator-hub-v32");
        if (!panel) return;
        if (document.getElementById("nr68-section-wrapper")) return;
        const div = document.createElement("div");
        div.innerHTML = buildNarrativeSection();
        panel.appendChild(div.firstElementChild);
      }, 200);
    };
  }

  // ════ QUICK GENERATE from header button ════
  window.nr68_quickGenerate = async function() {
    const btn = document.querySelector('[onclick="nr68_quickGenerate()"]');
    if (btn) { btn.disabled = true; btn.textContent = "⏳ Đang viết..."; }
    try {
      await window.ng68GenerateChapter(false);
      window.nr68Refresh();
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "✍️ Viết Ngay"; }
    }
  };

  // ════ GAMETIC TICK: refresh Jarvis banner ════
  window.nr68Tick = function() {
    // Refresh banner every 60 ticks
    if (!window.nr68Tick._cnt) window.nr68Tick._cnt = 0;
    window.nr68Tick._cnt++;
    if (window.nr68Tick._cnt % 60 !== 0) return;
    const banner = document.getElementById("nr68-jarvis-banner");
    if (banner) banner.innerHTML = _buildJarvisBanner();
  };

  function init() {
    patchCreatorHub();
    // Hook into gameTick for banner refresh
    const _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); window.nr68Tick(); };

    console.log("[NarrativeRegistryV68] 📜 Narrative Registry V68 khởi động — Sử Ký patch vào creator-hub-v32.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 15500); });
  } else {
    setTimeout(init, 15500);
  }
})();
