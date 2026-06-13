(function() {
  "use strict";

  // ========== RENDER FUNCTIONS ==========

  function renderWorldMemoryTab() {
    const stats = typeof window.mem64GetStats === "function" ? window.mem64GetStats() : {};
    const archive = typeof window.wma64GetStats === "function" ? window.wma64GetStats() : {};
    const timeline = typeof window.wma64GetTimeline === "function" ? window.wma64GetTimeline(15) : [];
    const year = window.year || 0;

    let html = `<div style="padding:16px;font-family:'Cinzel',serif;color:#e2e8f0">
      <h3 style="color:#67e8f9;margin:0 0 12px">🌍 Ký Ức Thế Giới</h3>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">
        <div style="background:#1e293b;border-radius:8px;padding:10px;text-align:center;border:1px solid #334155">
          <div style="font-size:22px;color:#facc15">${stats.total||0}</div>
          <div style="font-size:11px;color:#94a3b8">Tổng Ký Ức</div>
        </div>
        <div style="background:#1e293b;border-radius:8px;padding:10px;text-align:center;border:1px solid #334155">
          <div style="font-size:22px;color:#c084fc">${archive.eras||0}</div>
          <div style="font-size:11px;color:#94a3b8">Kỷ Nguyên</div>
        </div>
        <div style="background:#1e293b;border-radius:8px;padding:10px;text-align:center;border:1px solid #334155">
          <div style="font-size:22px;color:#fde68a">${stats.legends||0}</div>
          <div style="font-size:11px;color:#94a3b8">Truyền Thuyết</div>
        </div>
      </div>`;

    // Category breakdown
    if (stats.byCategory) {
      const cats = window.memoryV64Categories || {};
      html += `<div style="margin-bottom:14px">
        <div style="font-size:12px;color:#64748b;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">Phân Loại Ký Ức</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">`;
      Object.entries(stats.byCategory).forEach(([cat, count]) => {
        if (count === 0) return;
        const meta = cats[cat] || { icon: "📌", color: "#94a3b8", label: cat };
        html += `<span style="background:#0f172a;border:1px solid #334155;padding:3px 8px;border-radius:12px;font-size:11px;color:${meta.color}">${meta.icon} ${meta.label}: ${count}</span>`;
      });
      html += `</div></div>`;
    }

    // Timeline
    html += `<div style="font-size:12px;color:#64748b;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">Dòng Thời Gian</div>
      <div style="max-height:260px;overflow-y:auto">`;
    if (timeline.length === 0) {
      html += `<div style="color:#475569;font-size:13px;text-align:center;padding:20px">Chưa có sự kiện nào được ghi nhận.</div>`;
    } else {
      timeline.forEach(m => {
        const imp = m.importance || 3;
        const color = imp >= 5 ? "#facc15" : imp >= 4 ? "#f87171" : "#94a3b8";
        html += `<div style="border-left:3px solid ${color};padding:6px 10px;margin-bottom:6px;background:#0f172a;border-radius:0 6px 6px 0">
          <div style="font-size:11px;color:#64748b">Năm ${m.year||0}</div>
          <div style="font-size:13px;color:#e2e8f0;font-weight:bold">${m.title}</div>
          <div style="font-size:11px;color:#94a3b8;margin-top:2px">${(m.content||'').substring(0,100)}${(m.content||'').length>100?'...':''}</div>
        </div>`;
      });
    }
    html += `</div></div>`;

    // Jarvis Chronicle button
    html += `<div style="margin-top:12px">
      <button onclick="
        const chr = typeof window.wma64GetJarvisChronicle==='function' ? window.wma64GetJarvisChronicle() : 'Chưa có dữ liệu';
        const el = document.getElementById('mem64-jarvis-output');
        if(el){el.style.display=el.style.display==='none'?'block':'none';el.textContent=chr;}
      " style="background:#1e3a5f;border:1px solid #3b82f6;color:#93c5fd;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:12px">
        🤖 Jarvis Biên Niên Sử
      </button>
      <pre id="mem64-jarvis-output" style="display:none;background:#0f172a;color:#94a3b8;padding:10px;border-radius:6px;font-size:11px;margin-top:8px;white-space:pre-wrap;max-height:200px;overflow-y:auto"></pre>
    </div>`;

    return html;
  }

  function renderCivMemoryTab() {
    const civs = typeof window.civMem64GetAllCivs === "function" ? window.civMem64GetAllCivs() : [];
    const year = window.year || 0;

    let html = `<div style="padding:16px;font-family:'Cinzel',serif;color:#e2e8f0">
      <h3 style="color:#60a5fa;margin:0 0 12px">🏛️ Ký Ức Văn Minh</h3>
      <div style="font-size:13px;color:#64748b;margin-bottom:12px">${civs.length} nền văn minh được ghi chép</div>`;

    if (civs.length === 0) {
      html += `<div style="color:#475569;text-align:center;padding:40px">Chưa có văn minh nào được ghi nhớ.</div>`;
    } else {
      html += `<div style="max-height:400px;overflow-y:auto">`;
      civs.slice(0, 15).forEach(civId => {
        const h = typeof window.civMem64GetHistory === "function" ? window.civMem64GetHistory(civId) : null;
        if (!h) return;
        html += `<div style="background:#1e293b;border-radius:8px;padding:10px;margin-bottom:8px;border:1px solid #334155">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <div style="font-size:14px;color:#60a5fa;font-weight:bold">${civId}</div>
            <div style="font-size:11px;color:#475569">${h.warCount} chiến · ${h.heroCount} anh hùng</div>
          </div>
          ${h.founder ? `<div style="font-size:12px;color:#94a3b8">👑 Khai quốc: <span style="color:#fde68a">${h.founder}</span> (Năm ${h.foundYear})</div>` : ''}
          ${h.memorableMoments.length > 0 ? `<div style="margin-top:6px">` + h.memorableMoments.slice(0,2).map(m =>
            `<div style="font-size:11px;color:#64748b;margin-top:3px">• ${m.title} (Năm ${m.year})</div>`
          ).join('') + `</div>` : ''}
          <button onclick="
            const n = typeof window.civMem64GetNarrative==='function'?window.civMem64GetNarrative('${civId}'):'';
            const el=document.getElementById('civ64-detail-${civId.replace(/[^a-zA-Z0-9]/g,'_')}');
            if(el){el.style.display=el.style.display==='none'?'block':'none';el.textContent=n;}
          " style="background:transparent;border:1px solid #334155;color:#64748b;padding:3px 8px;border-radius:4px;cursor:pointer;font-size:10px;margin-top:6px">Chi Tiết</button>
          <pre id="civ64-detail-${civId.replace(/[^a-zA-Z0-9]/g,'_')}" style="display:none;background:#0f172a;color:#94a3b8;padding:8px;border-radius:4px;font-size:11px;margin-top:6px;white-space:pre-wrap"></pre>
        </div>`;
      });
      html += `</div>`;
    }
    html += `</div>`;
    return html;
  }

  function renderNpcMemoryTab() {
    const topNpcs = typeof window.npcMem64GetTopNPCs === "function" ? window.npcMem64GetTopNPCs(15) : [];
    const allNpcs = window.npcs || [];

    let html = `<div style="padding:16px;font-family:'Cinzel',serif;color:#e2e8f0">
      <h3 style="color:#4ade80;margin:0 0 12px">👤 Ký Ức Sinh Linh</h3>
      <div style="font-size:13px;color:#64748b;margin-bottom:12px">${topNpcs.length} sinh linh có ký ức được ghi chép</div>`;

    if (topNpcs.length === 0) {
      html += `<div style="color:#475569;text-align:center;padding:40px">Sinh linh chưa tích lũy ký ức.</div>`;
    } else {
      html += `<div style="max-height:420px;overflow-y:auto">`;
      topNpcs.forEach(({id, total}) => {
        const npc = allNpcs.find(n => (n.id||n.name) === id);
        const name = npc ? npc.name : id;
        const realm = npc ? (npc.realm || npc.level || "?") : "?";
        const mems = typeof window.npcMem64GetMemories === "function" ? window.npcMem64GetMemories(id) : [];
        const top3 = mems.sort((a,b)=>(b.importance||0)-(a.importance||0)).slice(0,3);

        html += `<div style="background:#1e293b;border-radius:8px;padding:10px;margin-bottom:8px;border:1px solid #334155">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <span style="color:#4ade80;font-size:13px;font-weight:bold">${name}</span>
              <span style="color:#475569;font-size:11px;margin-left:8px">${realm}</span>
            </div>
            <div style="font-size:11px;color:#64748b">${total} ký ức</div>
          </div>
          ${top3.map(m => `<div style="font-size:11px;color:#64748b;margin-top:4px;padding-left:8px;border-left:2px solid #334155">• ${m.title} (Năm ${m.year||0})</div>`).join('')}
        </div>`;
      });
      html += `</div>`;
    }
    html += `</div>`;
    return html;
  }

  function renderLegendsTab() {
    const legends = typeof window.decay64GetLegends === "function" ? window.decay64GetLegends(20) : [];
    const distorted = typeof window.decay64GetDistorted === "function" ? window.decay64GetDistorted(10) : [];
    const stats = typeof window.decay64GetStats === "function" ? window.decay64GetStats() : {};
    const dynLegends = typeof window.dynMem64GetFamilyLegends === "function" ? window.dynMem64GetFamilyLegends(5) : [];

    let html = `<div style="padding:16px;font-family:'Cinzel',serif;color:#e2e8f0">
      <h3 style="color:#fde68a;margin:0 0 12px">📖 Kho Truyền Thuyết</h3>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">
        <div style="background:#1e293b;border-radius:8px;padding:10px;text-align:center">
          <div style="font-size:20px;color:#fde68a">${legends.length}</div>
          <div style="font-size:11px;color:#94a3b8">Truyền Thuyết</div>
        </div>
        <div style="background:#1e293b;border-radius:8px;padding:10px;text-align:center">
          <div style="font-size:20px;color:#f87171">${distorted.length}</div>
          <div style="font-size:11px;color:#94a3b8">Ký Ức Bóp Méo</div>
        </div>
        <div style="background:#1e293b;border-radius:8px;padding:10px;text-align:center">
          <div style="font-size:20px;color:#c084fc">${dynLegends.length}</div>
          <div style="font-size:11px;color:#94a3b8">Huyền Thoại Gia Tộc</div>
        </div>
      </div>`;

    if (legends.length === 0 && dynLegends.length === 0) {
      html += `<div style="color:#475569;text-align:center;padding:30px;font-style:italic">
        "Thế giới còn trẻ. Các truyền thuyết cần thời gian để hình thành.<br>Sau 100+ năm, ký ức sẽ biến thành huyền thoại..."
      </div>`;
    } else {
      html += `<div style="max-height:360px;overflow-y:auto">`;

      if (legends.length > 0) {
        html += `<div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">✨ Ký Ức Thành Truyền Thuyết</div>`;
        legends.forEach(leg => {
          html += `<div style="background:linear-gradient(135deg,#1a1a2e,#1e293b);border:1px solid #fde68a33;border-radius:8px;padding:10px;margin-bottom:8px">
            <div style="color:#fde68a;font-size:13px;font-weight:bold">📖 ${leg.title}</div>
            <div style="font-size:11px;color:#64748b;margin-top:2px">Nguyên bản: ${leg.originalTitle} · Năm ${leg.year}</div>
            <div style="font-size:12px;color:#94a3b8;margin-top:6px">${(leg.content||'').substring(0,150)}...</div>
          </div>`;
        });
      }

      if (dynLegends.length > 0) {
        html += `<div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin:10px 0 8px">⚰️ Huyền Thoại Gia Tộc</div>`;
        dynLegends.forEach(leg => {
          html += `<div style="background:#1e293b;border:1px solid #c084fc33;border-radius:8px;padding:10px;margin-bottom:8px">
            <div style="color:#c084fc;font-size:13px;font-weight:bold">${leg.title}</div>
            <div style="font-size:12px;color:#94a3b8;margin-top:4px">${(leg.content||'').substring(0,120)}...</div>
          </div>`;
        });
      }

      html += `</div>`;
    }

    // Decay info
    html += `<div style="margin-top:12px;background:#0f172a;border-radius:6px;padding:8px;font-size:11px;color:#475569">
      ⏳ Tốc độ phai nhạt: ${((stats.decayRate||0.1)*100).toFixed(1)}%/100 năm · Ngưỡng truyền thuyết: ${stats.legendThreshold||80}%
    </div></div>`;
    return html;
  }

  function renderCreatorLegacyTab() {
    const stats = typeof window.creatorMem64GetStats === "function" ? window.creatorMem64GetStats() : {};
    const legacy = typeof window.creatorMem64GetLegacy === "function" ? window.creatorMem64GetLegacy() : [];
    const worldPerspective = typeof window.creatorMem64GetWorldPerspective === "function" ? window.creatorMem64GetWorldPerspective() : "";
    const d = window.creatorMemoryV64Data || {};

    let html = `<div style="padding:16px;font-family:'Cinzel',serif;color:#e2e8f0">
      <h3 style="color:#c084fc;margin:0 0 12px">👁️ Di Sản Tạo Hóa</h3>`;

    // Creator quote
    if (worldPerspective) {
      html += `<div style="background:linear-gradient(135deg,#1a0533,#1e293b);border:1px solid #c084fc55;border-radius:8px;padding:12px;margin-bottom:14px;font-style:italic;color:#ddd6fe;font-size:13px;text-align:center">
        ${worldPerspective}
      </div>`;
    }

    // Stats
    html += `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:14px">
      <div style="background:#1e293b;border-radius:8px;padding:10px;text-align:center">
        <div style="font-size:22px;color:#c084fc">${stats.totalInterventions||0}</div>
        <div style="font-size:11px;color:#94a3b8">Lần Can Thiệp</div>
      </div>
      <div style="background:#1e293b;border-radius:8px;padding:10px;text-align:center">
        <div style="font-size:22px;color:#facc15">${stats.miracles||0}</div>
        <div style="font-size:11px;color:#94a3b8">Phép Màu</div>
      </div>
      <div style="background:#1e293b;border-radius:8px;padding:10px;text-align:center">
        <div style="font-size:22px;color:#f87171">${stats.disasters||0}</div>
        <div style="font-size:11px;color:#94a3b8">Thiên Tai Gây Ra</div>
      </div>
      <div style="background:#1e293b;border-radius:8px;padding:10px;text-align:center">
        <div style="font-size:22px;color:#60a5fa">${stats.decrees||0}</div>
        <div style="font-size:11px;color:#94a3b8">Sắc Lệnh</div>
      </div>
    </div>`;

    if (stats.firstIntervention && stats.firstIntervention !== "Chưa có") {
      html += `<div style="font-size:12px;color:#64748b;margin-bottom:10px">🌱 ${stats.firstIntervention}</div>`;
    }

    // Legacy events
    html += `<div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Dấu Ấn Của Ngài</div>
      <div style="max-height:260px;overflow-y:auto">`;

    if (legacy.length === 0) {
      html += `<div style="color:#475569;text-align:center;padding:20px;font-style:italic">
        "Tạo Hóa chưa hiện thân. Hãy sử dụng Phép Màu, Sắc Lệnh, hoặc Sự Kiện Toàn Cầu để để lại dấu ấn..."
      </div>`;
    } else {
      legacy.forEach(leg => {
        const imp = leg.importance || 3;
        const color = imp >= 5 ? "#c084fc" : imp >= 4 ? "#a78bfa" : "#7c3aed";
        html += `<div style="border-left:3px solid ${color};padding:6px 10px;margin-bottom:6px;background:#0f172a;border-radius:0 6px 6px 0">
          <div style="font-size:11px;color:#64748b">Năm ${leg.year||0}</div>
          <div style="font-size:13px;color:#ddd6fe;font-weight:bold">${leg.title}</div>
          <div style="font-size:11px;color:#94a3b8;margin-top:2px">${leg.content||''}</div>
        </div>`;
      });
    }

    html += `</div>`;

    // Quick action buttons to trigger memory recording
    html += `<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
      <button onclick="
        const n=prompt('Tên phép màu muốn ghi nhớ:');
        if(n && typeof window.creatorMem64RecordMiracle==='function'){
          window.creatorMem64RecordMiracle(n,'Thế Giới','Phép màu thần thánh');
          if(typeof mem64_refreshUI==='function')mem64_refreshUI();
        }
      " style="background:#3b0764;border:1px solid #7c3aed;color:#ddd6fe;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:11px">✨ Ghi Phép Màu</button>
      <button onclick="
        const n=prompt('Mô tả can thiệp:');
        if(n && typeof window.creatorMem64RecordIntervention==='function'){
          window.creatorMem64RecordIntervention('decree',n,'Thế Giới','Thần ý',4);
          if(typeof mem64_refreshUI==='function')mem64_refreshUI();
        }
      " style="background:#1e3a5f;border:1px solid #3b82f6;color:#93c5fd;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:11px">📜 Ghi Sắc Lệnh</button>
    </div></div>`;
    return html;
  }

  // ========== MAIN REGISTRY PATCH ==========

  window.mem64_currentTab = "world-memory";

  window.mem64_showTab = function(tabId) {
    window.mem64_currentTab = tabId;
    const content = document.getElementById("mem64-tab-content");
    if (!content) return;

    const tabRenderers = {
      "world-memory":    renderWorldMemoryTab,
      "civ-memory":      renderCivMemoryTab,
      "npc-memory":      renderNpcMemoryTab,
      "legends":         renderLegendsTab,
      "creator-legacy":  renderCreatorLegacyTab
    };

    // Update active tab style
    ["world-memory","civ-memory","npc-memory","legends","creator-legacy"].forEach(id => {
      const btn = document.getElementById("mem64-tab-" + id);
      if (btn) {
        btn.style.borderBottom = id === tabId ? "2px solid #67e8f9" : "2px solid transparent";
        btn.style.color = id === tabId ? "#67e8f9" : "#64748b";
      }
    });

    const renderer = tabRenderers[tabId];
    content.innerHTML = renderer ? renderer() : "<div style='padding:16px;color:#64748b'>Tab không tìm thấy.</div>";
  };

  window.mem64_refreshUI = function() {
    window.mem64_showTab(window.mem64_currentTab || "world-memory");
  };

  function buildMemorySection() {
    return `<div id="mem64-section-wrapper" style="margin-top:20px;border-top:1px solid #1e293b;padding-top:16px">
      <div style="font-family:'Cinzel',serif;font-size:16px;color:#67e8f9;margin-bottom:10px;display:flex;align-items:center;gap:8px">
        🧠 V64 — Memory System
        <span style="font-size:11px;color:#475569;font-family:monospace">Thế Giới Nhớ</span>
      </div>
      <div style="display:flex;gap:0;margin-bottom:12px;border-bottom:1px solid #1e293b;overflow-x:auto">
        ${[
          {id:"world-memory",  icon:"🌍", label:"Thế Giới"},
          {id:"civ-memory",    icon:"🏛️", label:"Văn Minh"},
          {id:"npc-memory",    icon:"👤", label:"Sinh Linh"},
          {id:"legends",       icon:"📖", label:"Truyền Thuyết"},
          {id:"creator-legacy",icon:"👁️", label:"Tạo Hóa"}
        ].map(t => `<button id="mem64-tab-${t.id}" onclick="window.mem64_showTab('${t.id}')"
          style="background:transparent;border:none;border-bottom:2px solid transparent;padding:8px 12px;cursor:pointer;font-family:'Cinzel',serif;font-size:12px;color:#64748b;white-space:nowrap;transition:all 0.2s">
          ${t.icon} ${t.label}
        </button>`).join('')}
      </div>
      <div id="mem64-tab-content" style="min-height:200px"></div>
    </div>`;
  }

  function patchCreatorHub() {
    const _origHub = window.hubRenderPanel;
    window.hubRenderPanel = function(panelId) {
      if (_origHub) _origHub(panelId);
      if (panelId !== "creator-hub-v32") return;

      setTimeout(function() {
        const panel = document.getElementById("panel-creator-hub-v32");
        if (!panel) return;
        if (document.getElementById("mem64-section-wrapper")) return;

        const wrapper = document.createElement("div");
        wrapper.innerHTML = buildMemorySection();
        panel.appendChild(wrapper.firstElementChild);

        // Activate default tab
        setTimeout(function() {
          window.mem64_showTab("world-memory");
        }, 100);
      }, 50);
    };
  }

  function init() {
    patchCreatorHub();
    console.log("[MemoryRegistryV64] ✅ UI Memory System tích hợp vào Creator Hub — 5 tabs sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 13300); });
  } else {
    setTimeout(init, 13300);
  }
})();
