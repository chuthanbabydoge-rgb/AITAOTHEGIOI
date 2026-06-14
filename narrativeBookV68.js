(function() {
  "use strict";

  // ════════════════════════════════════════
  // NARRATIVE BOOK V68
  // UI: Hologram Book — danh sách + đọc chương
  // Canvas holographic book cover effect
  // ════════════════════════════════════════

  let _activeChapterId = null;

  // ════ RENDER BOOK PANEL ════
  window.nb68RenderPanel = function() {
    const d = window.worldNarrativeV68Data;
    if (!d) return "";
    const chapters = typeof window.wn68GetChapters === "function" ? window.wn68GetChapters() : [];
    return buildBookPanel(chapters);
  };

  function buildBookPanel(chapters) {
    const d = window.worldNarrativeV68Data;
    const settings = d ? d.settings : {};
    const year = window.year || 0;
    const styleOptions = (window.wn68Styles || []).map(s =>
      `<option value="${s.id}" ${settings.style === s.id ? "selected" : ""}>${s.label}</option>`
    ).join('');

    return `<div id="nb68-panel" style="font-family:'Courier New',monospace;color:#e2e8f0;padding:10px">

      <!-- HEADER -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div>
          <h3 style="margin:0;color:#fbbf24;font-size:14px">📜 Sử Ký Thế Giới</h3>
          <div style="font-size:10px;color:#475569">${chapters.length} chương · Năm ${year} · AI-generated</div>
        </div>
        <div style="font-size:20px;opacity:0.6">📖</div>
      </div>

      <!-- GENERATE CONTROLS -->
      <div style="background:#0f172a;border:1px solid #fbbf2433;border-radius:8px;padding:10px;margin-bottom:10px">
        <div style="font-size:10px;color:#fbbf24;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">⚡ Tạo Chương Mới</div>

        <div style="display:flex;gap:6px;margin-bottom:7px;flex-wrap:wrap">
          <!-- Style -->
          <select id="ng68-style-select" onchange="nb68_updateStyle(this.value)"
            style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:4px;padding:5px 8px;font-size:11px;font-family:'Courier New',monospace;flex:1">
            ${styleOptions}
          </select>
          <!-- Length -->
          <select id="ng68-length-select" onchange="nb68_updateLength(this.value)"
            style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:4px;padding:5px 8px;font-size:11px;font-family:'Courier New',monospace">
            <option value="short" ${settings.length==='short'?'selected':''}>Ngắn (~400 từ)</option>
            <option value="medium" ${settings.length==='medium'?'selected':''}>Vừa (~800 từ)</option>
            <option value="long" ${settings.length==='long'?'selected':''}>Dài (~1400 từ)</option>
          </select>
        </div>

        <!-- Custom focus -->
        <input id="ng68-focus-input" type="text" placeholder="Tập trung vào (tùy chọn): 'Anh hùng X', 'Cuộc chiến Y'..."
          style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:4px;padding:6px 8px;font-size:11px;width:100%;box-sizing:border-box;font-family:'Courier New',monospace;margin-bottom:7px">

        <!-- Generate button -->
        <button onclick="nb68_generate()"
          style="background:linear-gradient(135deg,#92400e,#78350f);border:1px solid #fbbf24;color:#fbbf24;padding:9px;border-radius:6px;cursor:pointer;font-size:12px;width:100%;font-family:'Courier New',monospace;font-weight:bold;letter-spacing:1px">
          ✍️ CLAUDE VIẾT SỬ KÝ ✍️
        </button>

        <!-- Progress -->
        <div id="ng68-progress" style="margin-top:6px;font-size:11px;min-height:18px;color:#94a3b8"></div>

        <!-- Auto-generate toggle -->
        <div style="display:flex;align-items:center;gap:8px;margin-top:8px">
          <label style="font-size:10px;color:#475569;cursor:pointer;display:flex;align-items:center;gap:5px">
            <input type="checkbox" id="ng68-auto-toggle" onchange="nb68_toggleAuto(this.checked)" ${settings.autoGenerate ? 'checked' : ''}
              style="accent-color:#fbbf24">
            Auto-generate mỗi
          </label>
          <input type="number" id="ng68-auto-interval" value="${settings.autoInterval || 500}" min="100" max="5000" step="100"
            onchange="nb68_updateInterval(this.value)"
            style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:3px;padding:3px 5px;font-size:11px;width:60px;font-family:'Courier New',monospace">
          <span style="font-size:10px;color:#475569">năm</span>
        </div>
      </div>

      <!-- CHAPTER LIST + READER in 2 columns -->
      <div style="display:grid;grid-template-columns:200px 1fr;gap:8px;min-height:360px">

        <!-- LEFT: Chapter list -->
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:6px;overflow:hidden">
          <div style="font-size:10px;color:#475569;text-transform:uppercase;padding:8px;border-bottom:1px solid #1e293b;letter-spacing:1px">
            📚 ${chapters.length} CHƯƠNG
          </div>
          <div style="overflow-y:auto;max-height:340px" id="nb68-chapter-list">
            ${chapters.length === 0
              ? `<div style="color:#334155;font-size:11px;padding:12px;text-align:center;font-style:italic">Chưa có chương nào.<br>Nhấn ✍️ để bắt đầu!</div>`
              : chapters.map(ch => _buildChapterListItem(ch)).join('')
            }
          </div>
        </div>

        <!-- RIGHT: Book reader -->
        <div id="nb68-reader" style="background:#0f172a;border:1px solid #1e293b;border-radius:6px;overflow:hidden">
          ${_buildReaderPlaceholder()}
        </div>
      </div>

      <!-- STATS -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:8px">
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:4px;padding:6px;text-align:center">
          <div style="font-size:18px;color:#fbbf24">${chapters.length}</div>
          <div style="font-size:9px;color:#475569">CHƯƠNG</div>
        </div>
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:4px;padding:6px;text-align:center">
          <div style="font-size:18px;color:#c084fc">${chapters.reduce((s,c)=>s+(c.wordCount||0),0)}</div>
          <div style="font-size:9px;color:#475569">TỪ</div>
        </div>
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:4px;padding:6px;text-align:center">
          <div style="font-size:18px;color:#60a5fa">${d ? d.totalGenerated : 0}</div>
          <div style="font-size:9px;color:#475569">TỔNG TẠO</div>
        </div>
      </div>
    </div>`;
  }

  function _buildChapterListItem(ch) {
    const active = _activeChapterId === ch.id;
    return `<div onclick="nb68_readChapter('${ch.id}')"
      style="padding:8px;border-bottom:1px solid #1e293b;cursor:pointer;background:${active ? '#1e293b' : 'transparent'};transition:background 0.15s">
      <div style="font-size:10px;color:#fbbf24;margin-bottom:2px">Năm ${ch.year || '?'}</div>
      <div style="font-size:11px;color:${active ? '#e2e8f0' : '#94a3b8'};line-height:1.3">${(ch.title || 'Chương').substring(0,40)}</div>
      <div style="font-size:9px;color:#334155;margin-top:2px">${ch.wordCount || 0} từ</div>
    </div>`;
  }

  function _buildReaderPlaceholder() {
    return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:360px;color:#334155;gap:8px">
      <div style="font-size:40px;opacity:0.4">📖</div>
      <div style="font-size:12px">Chọn một chương để đọc</div>
      <div style="font-size:10px;color:#1e3a5f">hoặc nhấn ✍️ để Claude viết chương mới</div>
    </div>`;
  }

  // ════ READ CHAPTER ════
  window.nb68ReadChapter = function(chapterId) {
    _activeChapterId = chapterId;
    const d = window.worldNarrativeV68Data;
    if (!d) return;
    const ch = d.chapters.find(c => c.id === chapterId);
    if (!ch) return;

    const reader = document.getElementById("nb68-reader");
    if (reader) reader.innerHTML = _buildReaderContent(ch);

    // Refresh chapter list to highlight active
    const list = document.getElementById("nb68-chapter-list");
    if (list) {
      const chapters = typeof window.wn68GetChapters === "function" ? window.wn68GetChapters() : [];
      list.innerHTML = chapters.map(c => _buildChapterListItem(c)).join('');
    }
  };
  window.nb68Render = window.nb68ReadChapter;

  function _buildReaderContent(ch) {
    const styleMap = { su_thi:"📜 Sử Thi", truyen_ky:"📖 Truyện Ký", bien_nien_su:"🗞️ Biên Niên Sử", su_thi_anh_hung:"⚔️ Sử Thi Anh Hùng" };
    const styleLabel = styleMap[ch.style] || "📜 Sử Thi";
    const tags = (ch.tags || []).map(t => `<span style="background:#1e293b;color:#64748b;padding:2px 6px;border-radius:10px;font-size:9px">${t}</span>`).join(' ');

    // Convert markdown to HTML (basic)
    const html = _mdToHtml(ch.content || "");

    return `<div style="padding:12px;height:100%;box-sizing:border-box;display:flex;flex-direction:column">
      <!-- Header -->
      <div style="border-bottom:1px solid #1e293b;padding-bottom:8px;margin-bottom:10px">
        <div style="font-size:10px;color:#fbbf24;margin-bottom:4px">
          📅 Năm ${ch.year || '?'} · ${ch.era || ''} · ${styleLabel} · ${ch.wordCount || 0} từ
        </div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">${tags}</div>
      </div>
      <!-- Content -->
      <div id="nb68-content-area" style="flex:1;overflow-y:auto;font-size:12px;line-height:1.8;color:#cbd5e1;font-family:'Georgia',serif">
        ${html}
      </div>
      <!-- Footer actions -->
      <div style="border-top:1px solid #1e293b;padding-top:8px;margin-top:8px;display:flex;gap:6px;justify-content:flex-end">
        <button onclick="nb68_copyChapter('${ch.id}')"
          style="background:#1e293b;border:1px solid #334155;color:#94a3b8;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:10px;font-family:'Courier New',monospace">
          📋 Copy
        </button>
        <button onclick="nb68_deleteChapter('${ch.id}')"
          style="background:#1e293b;border:1px solid #7f1d1d;color:#f87171;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:10px;font-family:'Courier New',monospace">
          🗑️ Xóa
        </button>
      </div>
    </div>`;
  }

  // Minimal markdown → HTML
  function _mdToHtml(md) {
    return md
      .replace(/^#{1}\s+(.+)$/gm, '<h2 style="color:#fbbf24;font-size:15px;margin:12px 0 6px;font-family:\'Courier New\',monospace">$1</h2>')
      .replace(/^#{2}\s+(.+)$/gm, '<h3 style="color:#f59e0b;font-size:13px;margin:10px 0 4px;font-family:\'Courier New\',monospace">$1</h3>')
      .replace(/^#{3}\s+(.+)$/gm, '<h4 style="color:#fbbf24;font-size:12px;margin:8px 0 3px;font-family:\'Courier New\',monospace">$1</h4>')
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e2e8f0">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em style="color:#94a3b8">$1</em>')
      .replace(/\n\n+/g, '</p><p style="margin:8px 0">')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p style="margin:0">').replace(/$/, '</p>');
  }

  // ════ GLOBAL ACTION HANDLERS ════
  window.nb68_generate = async function() {
    const focusEl = document.getElementById("ng68-focus-input");
    const focus = focusEl ? focusEl.value.trim() : "";
    if (typeof window.ng68GenerateChapter === "function") {
      await window.ng68GenerateChapter(false, focus || undefined);
      // Refresh full panel
      if (typeof window.nr68Refresh === "function") window.nr68Refresh();
    }
  };

  window.nb68_updateStyle = function(val) {
    if (window.worldNarrativeV68Data) { window.worldNarrativeV68Data.settings.style = val; window.wn68Save && window.wn68Save(); }
  };
  window.nb68_updateLength = function(val) {
    if (window.worldNarrativeV68Data) { window.worldNarrativeV68Data.settings.length = val; window.wn68Save && window.wn68Save(); }
  };
  window.nb68_toggleAuto = function(val) {
    if (window.worldNarrativeV68Data) { window.worldNarrativeV68Data.settings.autoGenerate = val; window.wn68Save && window.wn68Save(); }
  };
  window.nb68_updateInterval = function(val) {
    if (window.worldNarrativeV68Data) { window.worldNarrativeV68Data.settings.autoInterval = parseInt(val) || 500; window.wn68Save && window.wn68Save(); }
  };

  window.nb68_readChapter = function(id) { window.nb68ReadChapter(id); };

  window.nb68_copyChapter = function(id) {
    const ch = (window.worldNarrativeV68Data.chapters || []).find(c => c.id === id);
    if (!ch) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText("=== " + ch.title + " ===\nNăm " + ch.year + "\n\n" + ch.content)
        .then(() => alert("Đã copy chương vào clipboard!"));
    }
  };

  window.nb68_deleteChapter = function(id) {
    if (!confirm("Xóa chương này?")) return;
    if (typeof window.wn68DeleteChapter === "function") window.wn68DeleteChapter(id);
    if (_activeChapterId === id) _activeChapterId = null;
    if (typeof window.nr68Refresh === "function") window.nr68Refresh();
  };

  function init() {
    console.log("[NarrativeBookV68] 📖 Narrative Book UI khởi động.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 15400); });
  } else {
    setTimeout(init, 15400);
  }
})();
