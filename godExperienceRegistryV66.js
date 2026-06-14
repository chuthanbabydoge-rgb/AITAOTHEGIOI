(function() {
  "use strict";

  // ════ TAB RENDERERS ════

  function renderGodModeTab() {
    const intStats  = typeof window.div66GetStats === "function"      ? window.div66GetStats()         : {};
    const legStats  = typeof window.creatorLeg66GetStats === "function" ? window.creatorLeg66GetStats() : {};
    const artStats  = typeof window.div66ArtGetStats === "function"   ? window.div66ArtGetStats()      : {};
    const mirStats  = typeof window.mir66GetStats === "function"      ? window.mir66GetStats()         : {};
    const rank      = typeof window.creatorLeg66GetGodRank === "function" ? window.creatorLeg66GetGodRank() : { rank:1, title:"Vị Thần Sơ Khai", icon:"🌱" };
    const punStats  = typeof window.div66GetPunishStats === "function" ? window.div66GetPunishStats()   : {};
    const energy    = intStats.energy || 0;
    const maxEnergy = intStats.maxEnergy || 1000;
    const energyPct = Math.round(energy / maxEnergy * 100);
    const godName   = typeof window.creatorLeg66GetGodName === "function" ? window.creatorLeg66GetGodName() : "Đấng Sáng Thế";

    let html = `<div style="padding:14px;font-family:'Cinzel',serif;color:#e2e8f0">
      <!-- GOD IDENTITY -->
      <div style="background:linear-gradient(135deg,#0f172a,#1e1b4b);border:1px solid #4c1d95;border-radius:12px;padding:16px;margin-bottom:14px;text-align:center">
        <div style="font-size:28px;margin-bottom:6px">${rank.icon}</div>
        <div style="font-size:18px;color:#c084fc;font-weight:bold">${godName}</div>
        <div style="font-size:12px;color:#7c3aed;margin-bottom:10px">${rank.title} (Cấp ${rank.rank})</div>
        <div style="background:#1e293b;border-radius:8px;padding:4px 8px;font-size:11px;color:#64748b;margin-bottom:8px">
          🌟 Thần Uy: ${legStats.godScore||0} điểm · ${legStats.totalActs||0} hành động thần linh
        </div>
        <!-- Energy Bar -->
        <div style="margin-top:8px">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-bottom:4px">
            <span>⚡ Thần Năng</span><span>${energy}/${maxEnergy}</span>
          </div>
          <div style="height:8px;background:#0f172a;border-radius:4px;border:1px solid #1e293b">
            <div style="height:100%;background:linear-gradient(90deg,#7c3aed,#c084fc);border-radius:4px;width:${energyPct}%;transition:width 0.3s"></div>
          </div>
          <div style="font-size:10px;color:#475569;margin-top:2px">+5 Thần Năng mỗi 10 năm · Tín đồ tăng thêm năng lượng</div>
        </div>
        <div style="margin-top:10px">
          <input id="ge66-god-name" placeholder="Đặt danh hiệu thần linh..." 
            style="background:#0f172a;border:1px solid #334155;color:#e2e8f0;padding:5px 10px;border-radius:4px;font-size:12px;width:55%;font-family:'Cinzel',serif">
          <button onclick="const v=document.getElementById('ge66-god-name').value;if(v&&typeof window.creatorLeg66SetGodName==='function'){window.creatorLeg66SetGodName(v);window.ge66_showTab('godmode');}"
            style="background:#7c3aed;border:none;color:white;padding:5px 10px;border-radius:4px;cursor:pointer;font-size:11px;margin-left:4px">Đặt Tên</button>
        </div>
      </div>

      <!-- STATS GRID -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
        <div style="background:#1e293b;border-radius:8px;padding:10px;text-align:center">
          <div style="font-size:20px;color:#facc15">${mirStats.totalMiracles||0}</div>
          <div style="font-size:10px;color:#64748b">Phép Màu</div>
        </div>
        <div style="background:#1e293b;border-radius:8px;padding:10px;text-align:center">
          <div style="font-size:20px;color:#f87171">${punStats.total||0}</div>
          <div style="font-size:10px;color:#64748b">Thần Phạt</div>
        </div>
        <div style="background:#1e293b;border-radius:8px;padding:10px;text-align:center">
          <div style="font-size:20px;color:#60a5fa">${artStats.total||0}</div>
          <div style="font-size:10px;color:#64748b">Thần Khí</div>
        </div>
        <div style="background:#1e293b;border-radius:8px;padding:10px;text-align:center">
          <div style="font-size:20px;color:#4ade80">${intStats.blessings||0}</div>
          <div style="font-size:10px;color:#64748b">Ban Phước</div>
        </div>
        <div style="background:#1e293b;border-radius:8px;padding:10px;text-align:center">
          <div style="font-size:20px;color:#c084fc">${intStats.worldEdits||0}</div>
          <div style="font-size:10px;color:#64748b">Chỉnh Thế Giới</div>
        </div>
        <div style="background:#1e293b;border-radius:8px;padding:10px;text-align:center">
          <div style="font-size:20px;color:#f472b6">${legStats.worshipers||0}</div>
          <div style="font-size:10px;color:#64748b">Tín Đồ</div>
        </div>
      </div>

      <!-- QUICK ACTIONS -->
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">⚡ Hành Động Nhanh</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
        <button onclick="window.ge66_showTab('powers')" style="background:#1e293b;border:1px solid #334155;color:#4ade80;padding:8px;border-radius:6px;cursor:pointer;font-size:11px;font-family:'Cinzel',serif">✨ Ban Phước / Trừng Phạt</button>
        <button onclick="window.ge66_showTab('miracles')" style="background:#1e293b;border:1px solid #334155;color:#fbbf24;padding:8px;border-radius:6px;cursor:pointer;font-size:11px;font-family:'Cinzel',serif">🌟 Tạo Phép Màu</button>
        <button onclick="window.ge66_showTab('prophecies')" style="background:#1e293b;border:1px solid #334155;color:#c084fc;padding:8px;border-radius:6px;cursor:pointer;font-size:11px;font-family:'Cinzel',serif">🔮 Ban Tiên Tri</button>
        <button onclick="window.ge66_showTab('legacy')" style="background:#1e293b;border:1px solid #334155;color:#60a5fa;padding:8px;border-radius:6px;cursor:pointer;font-size:11px;font-family:'Cinzel',serif">📖 Biên Niên Sử</button>
      </div>
    </div>`;
    return html;
  }

  function renderPowersTab() {
    const intTypes   = typeof window.div66GetInterventionTypes === "function" ? window.div66GetInterventionTypes() : [];
    const punTypes   = typeof window.div66PunishGetTypes === "function"       ? window.div66PunishGetTypes()       : [];
    const voiceTempl = typeof window.divVoice66GetTemplates === "function"    ? window.divVoice66GetTemplates()    : {};
    const artTempl   = typeof window.div66ArtGetTemplates === "function"      ? window.div66ArtGetTemplates()      : [];
    const npcs       = (window.npcs || []).filter(n => n.status === "alive").slice(0, 30);
    const countries  = window.countries || [];
    const energy     = typeof window.div66GetEnergy === "function" ? Math.floor(window.div66GetEnergy()) : 0;

    const npcOptions = npcs.map(n => `<option value="${n.name}">${n.name}</option>`).join('');
    const countryOptions = countries.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

    let html = `<div style="padding:14px;font-family:'Cinzel',serif;color:#e2e8f0">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <h3 style="color:#4ade80;margin:0">✨ Quyền Năng Thần Linh</h3>
        <span style="color:#fbbf24;font-size:12px">⚡ ${energy} Thần Năng</span>
      </div>

      <!-- TARGET SELECTOR -->
      <div style="background:#0f172a;border-radius:8px;padding:10px;margin-bottom:12px">
        <div style="font-size:11px;color:#64748b;margin-bottom:6px">🎯 Chọn Mục Tiêu</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <select id="ge66-target-type" onchange="ge66_updateTargetList()"
            style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:4px;padding:4px 8px;font-size:11px">
            <option value="npc">Sinh Linh</option>
            <option value="nation">Quốc Gia</option>
            <option value="world">Toàn Thế Giới</option>
          </select>
          <select id="ge66-target-name" style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:4px;padding:4px 8px;font-size:11px;min-width:120px">
            ${npcOptions}
          </select>
        </div>
      </div>

      <!-- DIVINE INTERVENTIONS -->
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">🌟 Can Thiệp Thần Linh</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:12px;max-height:220px;overflow-y:auto">`;

    intTypes.forEach(t => {
      const catColor = t.category === "blessing" ? "#4ade80" : t.category === "punishment" ? "#f87171" : t.category === "world" ? "#60a5fa" : "#c084fc";
      html += `<button onclick="ge66_doIntervention('${t.id}')" title="${t.id}"
        style="background:#1e293b;border:1px solid ${catColor}33;color:#e2e8f0;padding:7px;border-radius:6px;cursor:pointer;font-size:11px;text-align:left;font-family:'Cinzel',serif">
        <span style="color:${catColor}">${t.icon}</span> ${t.label}
        <span style="color:#475569;font-size:10px;float:right">-${t.cost}⚡</span>
      </button>`;
    });

    html += `</div>

      <!-- DIVINE PUNISHMENTS -->
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">⚡ Thần Phạt</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:12px;max-height:180px;overflow-y:auto">`;

    punTypes.forEach(p => {
      html += `<button onclick="ge66_doPunishment('${p.id}')" title="${p.desc}"
        style="background:#1e293b;border:1px solid #f8717133;color:#e2e8f0;padding:7px;border-radius:6px;cursor:pointer;font-size:11px;text-align:left;font-family:'Cinzel',serif">
        <span style="color:#f87171">${p.icon}</span> ${p.label}
        <span style="color:#475569;font-size:10px;float:right">-${p.cost}⚡</span>
      </button>`;
    });

    html += `</div>

      <!-- DIVINE VOICE -->
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">📣 Thần Ngôn</div>
      <div style="background:#0f172a;border-radius:8px;padding:10px;margin-bottom:12px">
        <select id="ge66-msg-type" style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:4px;padding:4px;font-size:11px;margin-bottom:6px;width:100%">
          <option value="command">🔊 Lệnh Thần</option>
          <option value="blessing">✨ Lời Chúc Phước</option>
          <option value="warning">⚠️ Cảnh Báo</option>
          <option value="wrath">⚡ Thần Nộ</option>
        </select>
        <textarea id="ge66-msg-text" placeholder="Nhập lời thần linh..." rows="2"
          style="background:#1e293b;border:1px solid #334155;color:#e2e8f0;padding:6px;border-radius:4px;font-size:12px;width:100%;box-sizing:border-box;resize:none;font-family:'Cinzel',serif"></textarea>
        <div style="display:flex;gap:5px;margin-top:6px">
          <button onclick="ge66_fillTemplate()" style="background:#334155;border:none;color:#94a3b8;padding:5px 8px;border-radius:4px;cursor:pointer;font-size:10px">Mẫu Câu</button>
          <button onclick="ge66_sendMessage()" style="background:#7c3aed;border:none;color:white;padding:5px 10px;border-radius:4px;cursor:pointer;font-size:11px;flex:1;font-family:'Cinzel',serif">Phán →</button>
        </div>
      </div>

      <!-- DIVINE ARTIFACTS -->
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">💎 Tạo Thần Khí</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;max-height:200px;overflow-y:auto">`;

    artTempl.forEach(t => {
      const tierColors = { legendary:"#fbbf24", epic:"#c084fc", rare:"#60a5fa" };
      const col = tierColors[t.tier] || "#94a3b8";
      const cost = t.tier === "legendary" ? 300 : t.tier === "epic" ? 150 : 80;
      html += `<button onclick="ge66_createArtifact('${t.id}')" title="${t.lore}"
        style="background:#1e293b;border:1px solid ${col}33;color:#e2e8f0;padding:7px;border-radius:6px;cursor:pointer;font-size:11px;text-align:left;font-family:'Cinzel',serif">
        <span>${t.icon}</span> <span style="color:${col}">${t.label}</span>
        <span style="color:#475569;font-size:10px;float:right">-${cost}⚡</span>
      </button>`;
    });

    html += `</div>

      <!-- RESULT DISPLAY -->
      <div id="ge66-result" style="margin-top:10px;min-height:30px;font-size:12px;color:#4ade80;background:#0f172a;border-radius:6px;padding:0"></div>
    </div>`;
    return html;
  }

  function renderMiraclesTab() {
    const grandTypes = typeof window.mir66GetGrandMiracleTypes === "function" ? window.mir66GetGrandMiracleTypes() : [];
    const v51Types   = typeof window.cgv51GetMiracleTypes === "function"      ? window.cgv51GetMiracleTypes()      : [];
    const history    = typeof window.mir66GetAllHistory === "function"         ? window.mir66GetAllHistory(20)      : [];
    const stats      = typeof window.mir66GetStats === "function"              ? window.mir66GetStats()             : {};
    const energy     = typeof window.div66GetEnergy === "function" ? Math.floor(window.div66GetEnergy()) : 0;

    let html = `<div style="padding:14px;font-family:'Cinzel',serif;color:#e2e8f0">
      <h3 style="color:#fbbf24;margin:0 0 12px">✨ Phép Màu</h3>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
        <div style="background:#1e293b;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:18px;color:#fbbf24">${stats.v66GrandMiracles||0}</div>
          <div style="font-size:10px;color:#64748b">Đại Thần Tích V66</div>
        </div>
        <div style="background:#1e293b;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:18px;color:#4ade80">${stats.v51Miracles||0}</div>
          <div style="font-size:10px;color:#64748b">Phép Màu V51</div>
        </div>
        <div style="background:#1e293b;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:18px;color:#c084fc">${stats.totalMiracles||0}</div>
          <div style="font-size:10px;color:#64748b">Tổng Cộng</div>
        </div>
      </div>

      <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">🌟 Đại Thần Tích (V66)</div>
      <div style="display:grid;grid-template-columns:1fr;gap:5px;max-height:200px;overflow-y:auto;margin-bottom:12px">`;

    grandTypes.forEach(m => {
      const cost = m.cost;
      html += `<button onclick="ge66_castGrandMiracle('${m.id}')"
        style="background:#1e293b;border:1px solid ${m.color}33;color:#e2e8f0;padding:9px;border-radius:6px;cursor:pointer;text-align:left;font-family:'Cinzel',serif">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span>${m.icon} <span style="color:${m.color};font-size:13px">${m.label}</span></span>
          <span style="color:#475569;font-size:11px">-${cost}⚡ · CD:${m.cooldown}y</span>
        </div>
        <div style="font-size:10px;color:#64748b;margin-top:3px;font-style:italic">"${m.lore.substring(0,70)}..."</div>
      </button>`;
    });

    html += `</div>

      <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">🌿 Phép Màu V51</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;max-height:150px;overflow-y:auto;margin-bottom:12px">`;

    v51Types.slice(0, 8).forEach(m => {
      html += `<button onclick="ge66_castV51Miracle('${m.id}')"
        style="background:#1e293b;border:1px solid ${m.color||'#334155'}33;color:#e2e8f0;padding:7px;border-radius:6px;cursor:pointer;font-size:11px;text-align:left;font-family:'Cinzel',serif">
        <span>${m.icon||'✨'}</span> ${m.label} <span style="color:#475569;font-size:10px">-${m.cost}⚡</span>
      </button>`;
    });

    html += `</div>

      <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">📜 Lịch Sử Phép Màu</div>
      <div style="max-height:150px;overflow-y:auto">`;
    history.forEach(h => {
      html += `<div style="font-size:11px;color:#475569;padding:3px 0;border-bottom:1px solid #1e293b">
        ${h.icon||'✨'} <span style="color:#94a3b8">${h.label||h.id}</span> · Năm ${h.year||0}${h.target ? ' → '+h.target : ''}
      </div>`;
    });
    html += `</div>
      <div id="ge66-miracle-result" style="margin-top:8px;font-size:12px;color:#4ade80;min-height:20px"></div>
    </div>`;
    return html;
  }

  function renderPropheciesTab() {
    const types66  = typeof window.proph66GetTypes === "function"    ? window.proph66GetTypes()        : [];
    const active   = typeof window.proph66GetActive === "function"   ? window.proph66GetActive()       : [];
    const fulfilled = typeof window.proph66GetFulfilled === "function" ? window.proph66GetFulfilled()  : [];
    const stats    = typeof window.proph66GetStats === "function"    ? window.proph66GetStats()        : {};
    const npcs     = (window.npcs || []).filter(n => n.status !== "dead").slice(0, 30);
    const countries = window.countries || [];

    const subjOptions = [
      ...npcs.map(n => `<option value="${n.name}">${n.name}</option>`),
      ...countries.map(c => `<option value="${c.name}">${c.name}</option>`)
    ].join('');

    let html = `<div style="padding:14px;font-family:'Cinzel',serif;color:#e2e8f0">
      <h3 style="color:#c084fc;margin:0 0 12px">🔮 Thiên Khải & Tiên Tri</h3>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">
        <div style="background:#1e293b;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:18px;color:#c084fc">${stats.v66Total||0}</div>
          <div style="font-size:10px;color:#64748b">Tổng Tiên Tri</div>
        </div>
        <div style="background:#1e293b;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:18px;color:#fbbf24">${stats.v66Active||0}</div>
          <div style="font-size:10px;color:#64748b">Đang Chờ</div>
        </div>
        <div style="background:#1e293b;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:18px;color:#4ade80">${stats.v66Fulfilled||0}</div>
          <div style="font-size:10px;color:#64748b">Ứng Nghiệm</div>
        </div>
      </div>

      <!-- CREATE -->
      <div style="background:#0f172a;border-radius:8px;padding:10px;margin-bottom:12px">
        <div style="font-size:11px;color:#64748b;margin-bottom:6px">✍️ Ban Thiên Khải Mới</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">
          <select id="ge66-proph-type" style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:4px;padding:4px 8px;font-size:11px">
            ${types66.map(t => `<option value="${t.id}">${t.icon} ${t.label}</option>`).join('')}
          </select>
          <select id="ge66-proph-subject" style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:4px;padding:4px 8px;font-size:11px;min-width:100px">
            ${subjOptions}
          </select>
        </div>
        <textarea id="ge66-proph-text" placeholder="Lời tiên tri (để trống = tự động tạo)..." rows="2"
          style="background:#1e293b;border:1px solid #334155;color:#e2e8f0;padding:6px;border-radius:4px;font-size:12px;width:100%;box-sizing:border-box;resize:none;font-family:'Cinzel',serif"></textarea>
        <button onclick="ge66_createProphecy()"
          style="background:#7c3aed;border:none;color:white;padding:6px 14px;border-radius:4px;cursor:pointer;font-size:11px;margin-top:6px;font-family:'Cinzel',serif;width:100%">
          🔮 Ban Thiên Khải
        </button>
      </div>

      <!-- ACTIVE -->
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">⏳ Chờ Ứng Nghiệm (${active.length})</div>
      <div style="max-height:180px;overflow-y:auto;margin-bottom:10px">`;

    active.slice(0, 10).forEach(p => {
      html += `<div style="background:#1e293b;border-radius:6px;padding:8px;margin-bottom:5px;border-left:3px solid ${p.color||'#c084fc'}">
        <div style="font-size:11px;color:#64748b">Năm ${p.year} · Về: ${p.subject}</div>
        <div style="font-size:12px;color:#e2e8f0;font-style:italic;margin-top:2px">"${p.text}"</div>
      </div>`;
    });
    if (active.length === 0) html += `<div style="color:#475569;font-style:italic;font-size:12px;text-align:center;padding:20px">Chưa có lời tiên tri nào đang chờ ứng nghiệm...</div>`;

    html += `</div>

      <!-- FULFILLED -->
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">✅ Đã Ứng Nghiệm (${fulfilled.length})</div>
      <div style="max-height:120px;overflow-y:auto">`;

    fulfilled.slice(0, 5).forEach(p => {
      html += `<div style="background:#0f172a;border-radius:6px;padding:6px;margin-bottom:4px;border-left:3px solid #4ade80">
        <div style="font-size:10px;color:#64748b">Ứng nghiệm năm ${p.fulfilledYear||'?'} · ${p.subject}</div>
        <div style="font-size:11px;color:#94a3b8;font-style:italic">"${p.text.substring(0,70)}..."</div>
      </div>`;
    });

    html += `</div>
      <div id="ge66-proph-result" style="margin-top:8px;font-size:12px;color:#c084fc;min-height:20px"></div>
    </div>`;
    return html;
  }

  function renderLegacyTab() {
    const narrative  = typeof window.creatorLeg66GenerateNarrative === "function" ? window.creatorLeg66GenerateNarrative() : "Chưa có dữ liệu.";
    const legEntries = typeof window.creatorLeg66GetAll === "function"            ? window.creatorLeg66GetAll(30)            : [];
    const jarvis     = typeof window.creatorLeg66GetJarvisLog === "function"      ? window.creatorLeg66GetJarvisLog(10)      : [];
    const artList    = typeof window.div66ArtGetAll === "function"                ? window.div66ArtGetAll()                  : [];
    const exiled     = typeof window.div66GetExiled === "function"                ? window.div66GetExiled()                  : [];
    const curses     = typeof window.div66GetActiveCurses === "function"          ? window.div66GetActiveCurses()            : [];
    const rank       = typeof window.creatorLeg66GetGodRank === "function"        ? window.creatorLeg66GetGodRank()          : { rank:1, icon:"🌱", title:"Sơ Khai" };

    let html = `<div style="padding:14px;font-family:'Cinzel',serif;color:#e2e8f0">
      <h3 style="color:#60a5fa;margin:0 0 12px">📖 Di Sản & Biên Niên Sử Thần Linh</h3>

      <!-- NARRATIVE -->
      <div style="background:#0f172a;border-radius:8px;padding:12px;margin-bottom:12px;border:1px solid #1e293b">
        <div style="font-size:11px;color:#64748b;margin-bottom:6px">👁️ Jarvis Divine Analysis</div>
        <pre style="color:#94a3b8;font-size:11px;white-space:pre-wrap;font-family:monospace;margin:0;max-height:120px;overflow-y:auto">${narrative}</pre>
      </div>

      <!-- JARVIS LOG -->
      ${jarvis.length > 0 ? `<div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">🤖 Ghi Chú Jarvis</div>
      <div style="max-height:130px;overflow-y:auto;margin-bottom:12px">
        ${jarvis.map(j => `<div style="background:#1e293b;border-radius:4px;padding:6px;margin-bottom:4px;font-size:11px;color:#94a3b8;font-style:italic">"${j.comment}"</div>`).join('')}
      </div>` : ''}

      <!-- ARTIFACTS -->
      ${artList.length > 0 ? `<div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">💎 Thần Khí (${artList.length})</div>
      <div style="max-height:120px;overflow-y:auto;margin-bottom:10px">
        ${artList.map(a => {
          const tierColors = { legendary:"#fbbf24", epic:"#c084fc", rare:"#60a5fa" };
          return `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #1e293b;font-size:11px">
            <span>${a.icon} <span style="color:${tierColors[a.tier]||'#94a3b8'}">${a.name}</span></span>
            <span style="color:#64748b">${a.holder ? '→ '+a.holder : 'Chưa trao'}</span>
          </div>`;
        }).join('')}
      </div>` : ''}

      <!-- CURSE/EXILE STATUS -->
      ${curses.length + exiled.length > 0 ? `<div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">⚡ Đang Bị Phạt</div>
      <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px">
        ${curses.map(c => `<span style="background:#1e293b;border:1px solid #f87171;color:#f87171;padding:2px 8px;border-radius:10px;font-size:10px">🔮 ${c.target} (nguyền)</span>`).join('')}
        ${exiled.map(e => `<span style="background:#1e293b;border:1px solid #94a3b8;color:#94a3b8;padding:2px 8px;border-radius:10px;font-size:10px">🚷 ${e.name} (lưu đày)</span>`).join('')}
      </div>` : ''}

      <!-- FULL HISTORY -->
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">📜 Toàn Bộ Hành Động Thần Linh</div>
      <div style="max-height:200px;overflow-y:auto">`;

    legEntries.forEach(e => {
      const actColors = { intervention:"#4ade80", grand_miracle:"#fbbf24", punishment:"#f87171", divine_message:"#c084fc", divine_law:"#60a5fa", prophecy:"#818cf8", artifact:"#fbbf24", miracle_v51:"#34d399" };
      const col = actColors[e.actType] || "#94a3b8";
      html += `<div style="border-left:2px solid ${col};padding:4px 8px;margin-bottom:4px;background:#0f172a;border-radius:0 4px 4px 0">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:#475569">
          <span style="color:${col};text-transform:uppercase">${e.actType}</span>
          <span>Năm ${e.year}</span>
        </div>
        <div style="font-size:12px;color:#e2e8f0">${e.title}</div>
        <div style="font-size:10px;color:#64748b">→ ${e.target}</div>
      </div>`;
    });
    if (legEntries.length === 0) {
      html += `<div style="color:#475569;text-align:center;padding:30px;font-style:italic">"Thế giới im lặng chờ đợi bàn tay thần linh..."</div>`;
    }
    html += `</div></div>`;
    return html;
  }

  // ════ GLOBAL ACTION HANDLERS ════
  window.ge66_updateTargetList = function() {
    const type = (document.getElementById("ge66-target-type")||{}).value;
    const sel = document.getElementById("ge66-target-name");
    if (!sel) return;
    if (type === "npc") {
      sel.innerHTML = (window.npcs||[]).filter(n=>n.status==="alive").slice(0,30).map(n=>`<option value="${n.name}">${n.name}</option>`).join('');
    } else if (type === "nation") {
      sel.innerHTML = (window.countries||[]).map(c=>`<option value="${c.name}">${c.name}</option>`).join('');
    } else {
      sel.innerHTML = `<option value="Thế Giới">🌍 Toàn Thế Giới</option>`;
    }
  };

  window.ge66_doIntervention = function(typeId) {
    const targetType = (document.getElementById("ge66-target-type")||{}).value || "npc";
    const targetName = (document.getElementById("ge66-target-name")||{}).value || "Thế Giới";
    const result = typeof window.div66Perform === "function" ? window.div66Perform(typeId, targetName, targetType) : { ok:false, msg:"Hệ thống chưa sẵn sàng." };
    const el = document.getElementById("ge66-result");
    if (el) { el.style.padding = "8px"; el.innerHTML = result.msg; el.style.color = result.ok ? "#4ade80" : "#f87171"; }
  };

  window.ge66_doPunishment = function(typeId) {
    const targetName = (document.getElementById("ge66-target-name")||{}).value || "?";
    const targetType = (document.getElementById("ge66-target-type")||{}).value || "npc";
    const result = typeof window.div66Punish === "function" ? window.div66Punish(typeId, targetName, targetType) : { ok:false, msg:"Hệ thống chưa sẵn sàng." };
    const el = document.getElementById("ge66-result");
    if (el) { el.style.padding = "8px"; el.innerHTML = result.msg; el.style.color = result.ok ? "#fbbf24" : "#f87171"; }
  };

  window.ge66_sendMessage = function() {
    const target = (document.getElementById("ge66-target-name")||{}).value || "Thế Giới";
    const targetType = (document.getElementById("ge66-target-type")||{}).value || "npc";
    const msg = (document.getElementById("ge66-msg-text")||{}).value;
    const msgType = (document.getElementById("ge66-msg-type")||{}).value || "command";
    if (!msg) { const el=document.getElementById("ge66-result"); if(el){el.style.padding="8px";el.innerHTML="⚠️ Nhập lời thần linh trước.";el.style.color="#f87171";} return; }
    const result = typeof window.divVoice66Send === "function" ? window.divVoice66Send(target, targetType, msg, msgType) : { ok:false, msg:"Hệ thống chưa sẵn sàng." };
    const el = document.getElementById("ge66-result");
    if (el) { el.style.padding="8px"; el.innerHTML=result.msg; el.style.color=result.ok?"#c084fc":"#f87171"; }
    if (result.ok) { const t=document.getElementById("ge66-msg-text"); if(t) t.value=""; }
  };

  window.ge66_fillTemplate = function() {
    const msgType = (document.getElementById("ge66-msg-type")||{}).value || "command";
    const tmpls = typeof window.divVoice66GetTemplates === "function" ? window.divVoice66GetTemplates() : {};
    const list = tmpls[msgType] || [];
    if (list.length > 0) {
      const el = document.getElementById("ge66-msg-text");
      if (el) el.value = list[Math.floor(Math.random() * list.length)];
    }
  };

  window.ge66_createArtifact = function(templateId) {
    const targetName = (document.getElementById("ge66-target-name")||{}).value || null;
    const result = typeof window.div66CreateArtifact === "function" ? window.div66CreateArtifact(templateId, null, targetName) : { ok:false, msg:"Hệ thống chưa sẵn sàng." };
    const el = document.getElementById("ge66-result");
    if (el) { el.style.padding="8px"; el.innerHTML=result.msg; el.style.color=result.ok?"#fbbf24":"#f87171"; }
  };

  window.ge66_castGrandMiracle = function(miracleId) {
    const targetName = (document.getElementById("ge66-target-name")||{}).value || null;
    const result = typeof window.mir66CastGrandMiracle === "function" ? window.mir66CastGrandMiracle(miracleId, targetName) : { ok:false, msg:"Chưa sẵn sàng." };
    const el = document.getElementById("ge66-miracle-result");
    if (el) { el.innerHTML=result.msg; el.style.color=result.ok?"#fbbf24":"#f87171"; }
  };

  window.ge66_castV51Miracle = function(typeId) {
    const targetName = (document.getElementById("ge66-target-name")||{}).value || null;
    const result = typeof window.mir66CastV51 === "function" ? window.mir66CastV51(typeId, targetName) : { ok:false, msg:"Chưa sẵn sàng." };
    const el = document.getElementById("ge66-miracle-result");
    if (el) { el.innerHTML=result ? result.msg||"✅ Thực thi." : "✅"; el.style.color="#4ade80"; }
  };

  window.ge66_createProphecy = function() {
    const typeId  = (document.getElementById("ge66-proph-type")||{}).value;
    const subject = (document.getElementById("ge66-proph-subject")||{}).value;
    const text    = (document.getElementById("ge66-proph-text")||{}).value || null;
    const result  = typeof window.proph66Create === "function" ? window.proph66Create(typeId, subject, text) : { ok:false, msg:"Chưa sẵn sàng." };
    const el = document.getElementById("ge66-proph-result");
    if (el) { el.innerHTML=result.msg; el.style.color=result.ok?"#c084fc":"#f87171"; }
    if (result.ok) { const t=document.getElementById("ge66-proph-text"); if(t) t.value=""; window.ge66_showTab("prophecies"); }
  };

  // ════ TAB CONTROLLER ════
  window.ge66_currentTab = "godmode";
  window.ge66_showTab = function(tabId) {
    window.ge66_currentTab = tabId;
    const content = document.getElementById("ge66-tab-content");
    if (!content) return;

    const tabs = ["godmode","powers","miracles","prophecies","legacy"];
    tabs.forEach(id => {
      const btn = document.getElementById("ge66-tab-" + id);
      if (btn) {
        btn.style.borderBottom = id === tabId ? "2px solid #c084fc" : "2px solid transparent";
        btn.style.color = id === tabId ? "#c084fc" : "#64748b";
      }
    });

    const renderers = {
      godmode: renderGodModeTab,
      powers: renderPowersTab,
      miracles: renderMiraclesTab,
      prophecies: renderPropheciesTab,
      legacy: renderLegacyTab
    };
    content.innerHTML = (renderers[tabId] || renderGodModeTab)();
  };

  // ════ INJECT INTO CREATOR HUB ════
  function buildGodSection() {
    return `<div id="ge66-section-wrapper" style="margin-top:20px;border-top:2px solid #4c1d95;padding-top:16px">
      <div style="font-family:'Cinzel',serif;font-size:15px;color:#c084fc;margin-bottom:10px;display:flex;align-items:center;gap:8px">
        👁️ V66 — God Experience
        <span style="font-size:11px;color:#475569;font-family:monospace">Biến User Thành Thần</span>
      </div>
      <div style="display:flex;gap:0;margin-bottom:12px;border-bottom:1px solid #1e293b;overflow-x:auto">
        ${[
          {id:"godmode",    icon:"👁️", label:"God Mode"},
          {id:"powers",     icon:"✨", label:"Quyền Năng"},
          {id:"miracles",   icon:"🌟", label:"Phép Màu"},
          {id:"prophecies", icon:"🔮", label:"Tiên Tri"},
          {id:"legacy",     icon:"📖", label:"Di Sản"}
        ].map(t => `<button id="ge66-tab-${t.id}" onclick="window.ge66_showTab('${t.id}')"
          style="background:transparent;border:none;border-bottom:2px solid transparent;padding:7px 10px;cursor:pointer;font-family:'Cinzel',serif;font-size:11px;color:#64748b;white-space:nowrap">
          ${t.icon} ${t.label}
        </button>`).join('')}
      </div>
      <div id="ge66-tab-content" style="min-height:200px"></div>
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
        if (document.getElementById("ge66-section-wrapper")) return;
        const div = document.createElement("div");
        div.innerHTML = buildGodSection();
        panel.appendChild(div.firstElementChild);
        setTimeout(function() { window.ge66_showTab("godmode"); }, 100);
      }, 100);
    };
  }

  function init() {
    patchCreatorHub();
    console.log("[GodExperienceRegistryV66] 👁️ Creator God Experience khởi động — 5 tabs (God Mode/Quyền Năng/Phép Màu/Tiên Tri/Di Sản) trong creator-hub-v32.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 14500); });
  } else {
    setTimeout(init, 14500);
  }
})();
