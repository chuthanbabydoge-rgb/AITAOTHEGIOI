(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════
  // DIVINE WAR ENGINE V30 — Chiến Tranh Thần Thánh
  // ═══════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_divinewar_v30";

  const WAR_TYPES = [
    { id:'god_duel',   name:'⚔️ Thần Đấu Thần',        icon:'⚔️', duration:5,  color:'#ef4444', desc:'Hai thần tộc đấu trực tiếp, cả thiên giới rung chuyển.' },
    { id:'myth_war',   name:'🌋 Chiến Tranh Thần Thoại', icon:'🌋', duration:20, color:'#f97316', desc:'Cuộc chiến quy mô lớn giữa các thần hệ đối lập.' },
    { id:'realm_war',  name:'🌌 Chiến Tranh Vương Quốc', icon:'🌌', duration:15, color:'#a78bfa', desc:'Thần linh hậu thuẫn các vương quốc tranh hùng.' },
    { id:'crusade',    name:'✝️ Thánh Chiến',           icon:'✝️', duration:30, color:'#facc15', desc:'Tín đồ thánh chiến vì ý chí thần linh.' }
  ];

  const OUTCOMES = [
    { id:'attacker_wins',  label:'Công thắng',    icon:'⚔️' },
    { id:'defender_wins',  label:'Thủ thắng',     icon:'🛡' },
    { id:'stalemate',      label:'Hòa Hoãn',      icon:'🤝' },
    { id:'divine_truce',   label:'Thần Đình Chiến',icon:'☮️' },
    { id:'realm_collapse', label:'Cõi Sụp Đổ',    icon:'💥' }
  ];

  let _idCtr = 1;
  function newId() { return 'dw_' + (_idCtr++); }

  function defaultData() {
    return { wars: [], history: [], log: [], tick: 0 };
  }

  window.divineWarData = window.divineWarData || defaultData();

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.divineWarData)); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.divineWarData = Object.assign(defaultData(), JSON.parse(d));
    } catch(e) {}
  }

  function getType(id) { return WAR_TYPES.find(t => t.id === id); }

  // Tuyên chiến thần thánh
  window.dwV30DeclareWar = function(attackerName, defenderName, warTypeId, reason) {
    const t = getType(warTypeId);
    if (!t) return null;
    const war = {
      id: newId(),
      type: warTypeId,
      attacker: attackerName,
      defender: defenderName,
      reason: reason || 'Tranh giành lĩnh vực',
      startYear: window.year || 1,
      endYear: null,
      duration: t.duration,
      intensity: 50 + Math.floor(Math.random() * 50),
      casualties: { attacker: 0, defender: 0, mortal: 0 },
      phase: 'opening',
      outcome: null
    };
    window.divineWarData.wars.push(war);
    window.divineWarData.log.unshift(`[Năm ${war.startYear}] ${t.icon} THẦN CHIẾN: ${attackerName} vs ${defenderName} — ${reason}`);
    if (typeof window.htAddEvent === 'function') {
      window.htAddEvent({ year: war.startYear, type:'war', title:`${t.icon} Thần Chiến: ${attackerName} vs ${defenderName}`, color: t.color });
    }
    if (typeof window.wmeAddMemory === 'function') {
      window.wmeAddMemory({ year: war.startYear, category:'divine_war', title:`Thần Chiến: ${t.name}`, content:`${attackerName} tuyên chiến với ${defenderName}: ${reason}` });
    }
    save();
    return war;
  };

  // Kết thúc chiến tranh
  function resolveWar(war) {
    const outcomes = OUTCOMES;
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    war.outcome = outcome.id;
    war.endYear = window.year || 1;
    war.phase = 'ended';
    war.casualties.attacker = Math.floor(war.intensity * 100);
    war.casualties.defender = Math.floor(war.intensity * 80);
    war.casualties.mortal   = Math.floor(war.intensity * 5000);
    const t = getType(war.type);
    window.divineWarData.log.unshift(
      `[Năm ${war.endYear}] ${outcome.icon} Kết Thúc Thần Chiến: ${war.attacker} vs ${war.defender} — ${outcome.label}`
    );
    window.divineWarData.history.push({ ...war });
    window.divineWarData.wars = window.divineWarData.wars.filter(w => w.id !== war.id);

    if (typeof window.htAddEvent === 'function') {
      window.htAddEvent({ year: war.endYear, type:'war', title:`${outcome.icon} Thần Chiến Kết Thúc: ${outcome.label} (${war.attacker} vs ${war.defender})`, color:'#94a3b8' });
    }
    // Realm collapse: giảm ổn định cõi giới
    if (outcome.id === 'realm_collapse' && window.realmV30Data) {
      const divine = window.realmV30Data.realms.find(r => r.id === 'divine');
      if (divine) divine.stability = Math.max(0, divine.stability - 30);
    }
  }

  // AI tự động khai chiến
  function autoWar() {
    const beings = (window.divineData || {}).beings || [];
    if (beings.length < 2) return;
    const a = beings[Math.floor(Math.random() * beings.length)];
    const b = beings.filter(x => x.id !== a.id && x.domain !== a.domain);
    if (b.length === 0) return;
    const def = b[Math.floor(Math.random() * b.length)];
    const reasons = [
      'Tranh giành lĩnh vực thống trị', 'Xúc phạm thánh địa', 'Cướp đoạt tín đồ',
      'Hủy đền thờ đối thủ', 'Tranh quyền cai trị cõi thần', 'Oán thù từ kỷ nguyên trước'
    ];
    const typePool = WAR_TYPES.map(t => t.id);
    const tId = typePool[Math.floor(Math.random() * typePool.length)];
    window.dwV30DeclareWar(a.name, def.name, tId, reasons[Math.floor(Math.random()*reasons.length)]);
  }

  // Tick
  window.dwV30Tick = function() {
    const data = window.divineWarData;
    data.tick = (data.tick||0) + 1;
    const y = window.year || 1;

    // Tiến triển chiến tranh
    data.wars.forEach(war => {
      war.intensity = Math.min(100, war.intensity + Math.floor(Math.random()*10 - 3));
      if (war.phase === 'opening') war.phase = 'battle';
      else if (war.phase === 'battle' && Math.random() < 0.15) war.phase = 'climax';
      else if (war.phase === 'climax' && Math.random() < 0.3) war.phase = 'ending';

      // Giải quyết nếu đủ thời gian
      const t = getType(war.type);
      const elapsed = y - war.startYear;
      if (elapsed >= (t?.duration||10) || war.phase === 'ending') {
        resolveWar(war);
      }
    });

    // Ngẫu nhiên chiến tranh mới
    if (data.tick % 80 === 0 && Math.random() < 0.2 && data.wars.length < 3) {
      autoWar();
    }

    if (data.tick % 50 === 0) save();
  };

  // Render panel
  window.dwV30RenderPanel = function() {
    const el = document.getElementById('panel-divinewar-v30');
    if (!el) return;
    const data = window.divineWarData;
    let h = `<div style="padding:16px;background:#0f172a;min-height:100%;color:#e2e8f0;font-family:monospace">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h2 style="color:#ef4444;margin:0">⚔️ Chiến Tranh Thần Thánh</h2>
        <span style="color:#94a3b8;font-size:0.85em">Đang diễn ra: ${data.wars.length} · Lịch sử: ${data.history.length}</span>
      </div>`;

    // Loại chiến tranh
    h += `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px">`;
    WAR_TYPES.forEach(t => {
      h += `<div style="background:#1e293b;border:1px solid ${t.color}44;border-radius:8px;padding:10px;text-align:center">
        <div style="font-size:1.4em">${t.icon}</div>
        <div style="font-size:0.8em;font-weight:bold;color:${t.color};margin:4px 0">${t.name}</div>
        <div style="font-size:0.72em;color:#64748b">${t.duration} năm · ${data.history.filter(w=>w.type===t.id).length} lần</div>
        <button onclick="window.dwV30DeclareWar('Thần Chiến','Tà Thần','${t.id}','Thần Chiến Bùng Nổ');window.dwV30RenderPanel()"
          style="background:${t.color}22;border:1px solid ${t.color}66;color:${t.color};padding:3px 8px;border-radius:5px;cursor:pointer;font-size:0.75em;margin-top:6px">Khai Chiến</button>
      </div>`;
    });
    h += `</div>`;

    // Đang diễn ra
    h += `<h3 style="color:#ef4444;margin:0 0 10px">🔥 Đang Diễn Ra (${data.wars.length})</h3>`;
    if (data.wars.length === 0) {
      h += `<div style="background:#1e293b;border-radius:8px;padding:20px;text-align:center;color:#64748b">— Không có chiến tranh nào —</div>`;
    } else {
      data.wars.forEach(w => {
        const t = getType(w.type);
        const elapsed = (window.year||1) - w.startYear;
        const phases = { opening:'🟡 Khai Màn', battle:'🔴 Giao Chiến', climax:'💥 Đỉnh Điểm', ending:'🌅 Kết Thúc' };
        h += `<div style="background:#1e293b;border:1px solid ${t?.color||'#ef4444'}44;border-radius:8px;padding:14px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between">
            <span style="font-weight:bold;color:${t?.color||'#ef4444'}">${t?.icon} ${w.attacker} ⚔️ ${w.defender}</span>
            <span style="color:#94a3b8;font-size:0.83em">${phases[w.phase]||w.phase}</span>
          </div>
          <div style="color:#64748b;font-size:0.82em;margin:4px 0">${w.reason}</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;font-size:0.83em;margin-top:8px">
            <div>📅 Năm ${w.startYear} (+${elapsed})</div>
            <div>⚡ Cường độ: <b style="color:#ef4444">${w.intensity}%</b></div>
            <div>🌋 Loại: ${t?.name||w.type}</div>
          </div>
          <div style="background:#0f172a;border-radius:4px;height:6px;margin-top:10px">
            <div style="background:${t?.color||'#ef4444'};height:6px;border-radius:4px;width:${Math.min(100,Math.floor(elapsed/(t?.duration||10)*100))}%;transition:width 0.3s"></div>
          </div>
        </div>`;
      });
    }

    // Lịch sử
    h += `<h3 style="color:#60a5fa;margin:20px 0 8px">📜 Lịch Sử Thần Chiến (${data.history.length})</h3>
      <div style="max-height:200px;overflow-y:auto">`;
    if (data.history.length === 0) {
      h += `<div style="background:#1e293b;border-radius:8px;padding:16px;text-align:center;color:#64748b">— Chưa có thần chiến nào kết thúc —</div>`;
    } else {
      [...data.history].reverse().slice(0,10).forEach(w => {
        const t = getType(w.type);
        const o = OUTCOMES.find(x=>x.id===w.outcome);
        h += `<div style="background:#1e293b;border-radius:6px;padding:10px;margin-bottom:6px;font-size:0.83em">
          <div style="display:flex;justify-content:space-between">
            <span style="color:${t?.color||'#fff'}">${t?.icon} ${w.attacker} vs ${w.defender}</span>
            <span style="color:#94a3b8">Năm ${w.startYear}→${w.endYear}</span>
          </div>
          <div style="margin-top:4px">Kết quả: <b style="color:${t?.color||'#facc15'}">${o?.icon} ${o?.label||w.outcome}</b> · Thương vong: ${(w.casualties?.mortal||0).toLocaleString()} thường dân</div>
        </div>`;
      });
    }

    h += `</div>
      <div style="background:#1e293b;border-radius:6px;padding:10px;margin-top:10px;max-height:120px;overflow-y:auto;font-size:0.8em">`;
    data.log.slice(0,15).forEach(l => h += `<div style="color:#94a3b8;margin-bottom:3px">${l}</div>`);
    h += `</div></div>`;
    el.innerHTML = h;
  };

  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      window.dwV30Tick();
    };
    console.log("[DivineWarEngine V30] ⚔️ Chiến Tranh Thần Thánh khởi động — 4 loại · AI tự động · Cõi sụp đổ ✓");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 3600); });
  } else {
    setTimeout(init, 3600);
  }
})();
