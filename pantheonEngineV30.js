(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════
  // PANTHEON ENGINE V30 — Thần Điện: Hệ Thần & Thánh Đô
  // ═══════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_pantheon_v30";

  const STARTER_PANTHEONS = [
    {
      name:'Thiên Đình Thần Điện',   capital:'Thiên Cung Đỉnh Cao',
      alignment:'lawful',            color:'#facc15',
      desc:'Hệ thần cai quản thiên giới, trật tự và luật lệ trên hết.',
      domains:['war','knowledge','time'], founded:0
    },
    {
      name:'Vực Thẳm Hỗn Loạn',     capital:'Cung Hỗn Mang',
      alignment:'chaotic',           color:'#ec4899',
      desc:'Thần linh đại diện cho hỗn loạn và phá hủy.',
      domains:['chaos','death','fire'], founded:0
    },
    {
      name:'Thiên Nhiên Hội Đồng',   capital:'Rừng Nguyên Sinh Bất Tử',
      alignment:'neutral',           color:'#34d399',
      desc:'Thần linh thiên nhiên, bảo vệ sự sống và vũ trụ.',
      domains:['life','nature','water'], founded:0
    }
  ];

  let _idCtr = 1;
  function newId() { return 'pan_' + (_idCtr++); }

  function defaultData() {
    return { pantheons: [], log: [], tick: 0, initialized: false };
  }

  window.pantheonV30Data = window.pantheonV30Data || defaultData();

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.pantheonV30Data)); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.pantheonV30Data = Object.assign(defaultData(), JSON.parse(d));
    } catch(e) {}
  }

  function initPantheons() {
    if (window.pantheonV30Data.initialized) return;
    STARTER_PANTHEONS.forEach(p => {
      const beings = (window.divineData||{}).beings || [];
      const matchGods = beings.filter(b => p.domains.includes(b.domain)).map(b => b.id);
      window.pantheonV30Data.pantheons.push({
        id: newId(),
        name: p.name, capital: p.capital, alignment: p.alignment,
        color: p.color, desc: p.desc, domains: p.domains,
        gods: matchGods, founded: p.founded,
        influence: matchGods.length * 100,
        territory: ['Trung Tâm Thế Giới'],
        wars: 0, treaties: 0
      });
    });
    window.pantheonV30Data.initialized = true;
  }

  // Tạo thần điện mới
  window.panV30Create = function(name, capital, domains, alignment) {
    const pan = {
      id: newId(), name, capital,
      alignment: alignment || 'neutral',
      color: ['#facc15','#34d399','#60a5fa','#f97316','#ec4899','#a78bfa'][Math.floor(Math.random()*6)],
      desc: `Thần Điện ${name} — cai quản các lĩnh vực ${domains.join(', ')}`,
      domains: domains || [],
      gods: [],
      founded: window.year || 1,
      influence: 0, territory: [], wars: 0, treaties: 0
    };
    window.pantheonV30Data.pantheons.push(pan);
    window.pantheonV30Data.log.unshift(`[Năm ${pan.founded}] 🏛 Thần Điện "${name}" thành lập tại ${capital}`);
    if (typeof window.htAddEvent === 'function') {
      window.htAddEvent({ year: pan.founded, type:'divine', title:`🏛 Thần Điện "${name}" ra đời`, color: pan.color });
    }
    save();
    return pan;
  };

  // Thêm thần vào thần điện
  window.panV30AddGod = function(pantheonId, divineId) {
    const pan = window.pantheonV30Data.pantheons.find(p => p.id === pantheonId);
    if (!pan || pan.gods.includes(divineId)) return;
    pan.gods.push(divineId);
    const being = ((window.divineData||{}).beings||[]).find(b=>b.id===divineId);
    pan.influence += (being?.influence||0) * 10;
    window.pantheonV30Data.log.unshift(`[Năm ${window.year||1}] ➕ ${being?.name||divineId} gia nhập Thần Điện ${pan.name}`);
    save();
  };

  // Thần điện chiến tranh
  window.panV30War = function(attackId, defendId) {
    const a = window.pantheonV30Data.pantheons.find(p => p.id === attackId);
    const b = window.pantheonV30Data.pantheons.find(p => p.id === defendId);
    if (!a || !b) return;
    a.wars++; b.wars++;
    window.pantheonV30Data.log.unshift(`[Năm ${window.year||1}] ⚔️ ${a.name} tuyên chiến với ${b.name}!`);
    if (typeof window.dwV30DeclareWar === 'function') {
      window.dwV30DeclareWar(a.name, b.name, 'myth_war', 'Tranh chấp giữa hai Thần Điện');
    }
    save();
  };

  // Tick
  window.panV30Tick = function() {
    const data = window.pantheonV30Data;
    data.tick = (data.tick||0) + 1;

    const beings = (window.divineData||{}).beings || [];
    data.pantheons.forEach(pan => {
      // Cập nhật gods list từ divineData
      const domainGods = beings.filter(b => pan.domains.includes(b.domain)).map(b=>b.id);
      domainGods.forEach(gId => { if (!pan.gods.includes(gId)) pan.gods.push(gId); });
      // Ảnh hưởng
      pan.influence = pan.gods.reduce((s, gId) => {
        const g = beings.find(b=>b.id===gId);
        return s + (g ? Math.floor(g.followers/100) : 0);
      }, 0);
    });

    // Ngẫu nhiên thần điện mới
    if (data.tick % 100 === 0 && Math.random() < 0.1 && data.pantheons.length < 8) {
      const names = ['Cổ Thần Hội','Hắc Ám Thần Điện','Quang Minh Thánh Đường','Hải Dương Thần Tộc'];
      const n = names[Math.floor(Math.random()*names.length)];
      if (!data.pantheons.find(p=>p.name===n)) {
        window.panV30Create(n, 'Thánh Đô Mới', ['space','chaos']);
      }
    }

    if (data.tick % 60 === 0) save();
  };

  // Render panel
  window.panV30RenderPanel = function() {
    const el = document.getElementById('panel-pantheon-v30');
    if (!el) return;
    const data = window.pantheonV30Data;
    const beings = (window.divineData||{}).beings || [];
    const alignLabels = { lawful:'⚖️ Trật Tự', neutral:'🌿 Trung Lập', chaotic:'🌪 Hỗn Loạn' };
    let h = `<div style="padding:16px;background:#0f172a;min-height:100%;color:#e2e8f0;font-family:monospace">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h2 style="color:#facc15;margin:0">🏛 Thần Điện</h2>
        <button onclick="window.panV30Create('Tân Thần Điện','Cung Điện Mới',['war','fire'],'chaotic');window.panV30RenderPanel()"
          style="background:#1e293b;border:1px solid #facc1566;color:#facc15;padding:6px 12px;border-radius:6px;cursor:pointer">+ Lập Thần Điện</button>
      </div>`;

    if (data.pantheons.length === 0) {
      h += `<div style="color:#64748b;text-align:center;padding:40px">— Chưa có thần điện nào —</div>`;
    } else {
      data.pantheons.forEach(pan => {
        const panGods = pan.gods.map(gId => beings.find(b=>b.id===gId)).filter(Boolean);
        const totalPower = panGods.reduce((s,g)=>s+g.power,0);
        h += `<div style="background:#1e293b;border:2px solid ${pan.color}44;border-radius:10px;padding:16px;margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <div style="font-size:1.15em;font-weight:bold;color:${pan.color}">🏛 ${pan.name}</div>
              <div style="color:#94a3b8;font-size:0.82em;margin:3px 0">${pan.desc}</div>
            </div>
            <span style="background:${pan.color}22;color:${pan.color};padding:3px 10px;border-radius:12px;font-size:0.8em">${alignLabels[pan.alignment]||pan.alignment}</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;font-size:0.83em;margin-top:10px">
            <div>🏙 Thánh Đô: <b style="color:#fff">${pan.capital}</b></div>
            <div>🔱 Thần: <b style="color:${pan.color}">${pan.gods.length}</b></div>
            <div>🌐 Ảnh hưởng: <b style="color:#60a5fa">${pan.influence.toLocaleString()}</b></div>
            <div>⚡ Tổng sức mạnh: <b style="color:#facc15">${totalPower.toLocaleString()}</b></div>
            <div>🌍 Lĩnh vực: <b style="color:#34d399">${pan.domains.join(', ')}</b></div>
            <div>⚔️ Chiến tranh: <b style="color:#ef4444">${pan.wars}</b></div>
          </div>
          <div style="margin-top:10px;font-size:0.82em">
            <span style="color:#94a3b8">Thành viên: </span>
            ${panGods.map(g=>`<span style="background:#0f172a;color:${pan.color};padding:2px 7px;border-radius:10px;margin-right:4px">${g.name}</span>`).join('')||'<span style="color:#64748b">— không có —</span>'}
          </div>
        </div>`;
      });
    }

    // Mâu thuẫn
    const pairs = [];
    data.pantheons.forEach((a,i) => {
      data.pantheons.slice(i+1).forEach(b => {
        const overlap = a.domains.filter(d => b.domains.includes(d)).length;
        if (overlap === 0) pairs.push({ a, b, tension: 'Cao' });
      });
    });
    if (pairs.length > 0) {
      h += `<h3 style="color:#ef4444;margin:20px 0 8px">⚠️ Căng Thẳng Giữa Thần Điện</h3>`;
      pairs.slice(0,5).forEach(p => {
        h += `<div style="background:#1e293b;border-radius:6px;padding:10px;margin-bottom:6px;font-size:0.85em;display:flex;justify-content:space-between;align-items:center">
          <span style="color:${p.a.color}">${p.a.name}</span>
          <span style="color:#ef4444">⚡ Mâu thuẫn Cao</span>
          <span style="color:${p.b.color}">${p.b.name}</span>
          <button onclick="window.panV30War('${p.a.id}','${p.b.id}');window.panV30RenderPanel()" style="background:#ef444422;border:1px solid #ef444466;color:#ef4444;padding:3px 8px;border-radius:5px;cursor:pointer;font-size:0.78em">Khai Chiến</button>
        </div>`;
      });
    }

    // Log
    h += `<div style="background:#1e293b;border-radius:6px;padding:10px;margin-top:10px;max-height:130px;overflow-y:auto;font-size:0.8em">`;
    data.log.slice(0,15).forEach(l => h += `<div style="color:#94a3b8;margin-bottom:3px">${l}</div>`);
    h += `</div></div>`;
    el.innerHTML = h;
  };

  function init() {
    load();
    setTimeout(initPantheons, 200);
    const _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      window.panV30Tick();
    };
    console.log("[PantheonEngineV30] 🏛 Thần Điện khởi động — 3 thần hệ khởi đầu · Thánh đô · Mâu thuẫn ✓");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 3800); });
  } else {
    setTimeout(init, 3800);
  }
})();
