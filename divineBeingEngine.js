(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════
  // DIVINE BEING ENGINE V30 — Thần Linh + Lĩnh Vực + Thờ Phượng
  // ═══════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_divine_v30";

  const DIVINE_TYPES = [
    { id:'minor',      name:'Thần Nhỏ',     icon:'🌟', powerBase:100,  followerReq:100,    color:'#94a3b8' },
    { id:'major',      name:'Thần Lớn',     icon:'⚡', powerBase:500,  followerReq:1000,   color:'#60a5fa' },
    { id:'ancient',    name:'Thần Cổ Đại',  icon:'🔥', powerBase:2000, followerReq:5000,   color:'#f97316' },
    { id:'primordial', name:'Thần Nguyên Thủy', icon:'🌑', powerBase:10000, followerReq:20000, color:'#a78bfa' },
    { id:'creation',   name:'Thần Sáng Tạo', icon:'🌌', powerBase:99999, followerReq:100000, color:'#facc15' }
  ];

  const DOMAINS = [
    { id:'war',       name:'⚔️ Chiến Tranh', bonus:'Tăng sức mạnh quân đội +20%',  color:'#ef4444' },
    { id:'death',     name:'💀 Cái Chết',    bonus:'Kiểm soát linh hồn',           color:'#6366f1' },
    { id:'life',      name:'🌱 Sự Sống',     bonus:'Tăng dân số +15%',             color:'#34d399' },
    { id:'nature',    name:'🌿 Thiên Nhiên',  bonus:'Mùa màng bội thu +25%',        color:'#4ade80' },
    { id:'time',      name:'⏳ Thời Gian',   bonus:'Thấy trước tương lai',          color:'#f59e0b' },
    { id:'space',     name:'🌀 Không Gian',  bonus:'Mở cổng dịch chuyển',          color:'#818cf8' },
    { id:'fire',      name:'🔥 Lửa',         bonus:'Sức công phá +30%',            color:'#f97316' },
    { id:'water',     name:'💧 Nước',        bonus:'Chữa lành thương tích +20%',   color:'#38bdf8' },
    { id:'knowledge', name:'📚 Tri Thức',    bonus:'Nghiên cứu nhanh hơn +40%',    color:'#facc15' },
    { id:'chaos',     name:'🌪 Hỗn Loạn',    bonus:'Không thể đoán trước',          color:'#ec4899' }
  ];

  const STARTER_GODS = [
    { name:'Chiến Thần Athos',   type:'major',   domain:'war',       followers:5000 },
    { name:'Tử Thần Morrigan',   type:'major',   domain:'death',     followers:4000 },
    { name:'Sinh Thần Gaia',     type:'ancient', domain:'life',      followers:12000 },
    { name:'Hỏa Thần Ignis',     type:'minor',   domain:'fire',      followers:800   },
    { name:'Thần Tri Thức Athon',type:'major',   domain:'knowledge', followers:3500  }
  ];

  let _idCtr = 1;
  function newId() { return 'div_' + (_idCtr++); }

  function defaultData() {
    return {
      beings: [],
      temples: [],
      blessings: [],   // active blessings on countries
      punishments: [], // active punishments
      log: [],
      tick: 0,
      initialized: false
    };
  }

  window.divineData = window.divineData || defaultData();

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.divineData)); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.divineData = Object.assign(defaultData(), JSON.parse(d));
    } catch(e) {}
  }

  function getType(id) { return DIVINE_TYPES.find(t => t.id === id); }
  function getDomain(id) { return DOMAINS.find(d => d.id === id); }

  // Khởi tạo thần linh ban đầu
  function initBeings() {
    if (window.divineData.initialized) return;
    STARTER_GODS.forEach(g => {
      const t = getType(g.type);
      window.divineData.beings.push({
        id: newId(),
        name: g.name,
        type: g.type,
        domain: g.domain,
        power: t ? t.powerBase + Math.floor(Math.random() * t.powerBase * 0.5) : 100,
        followers: g.followers,
        influence: Math.floor(g.followers / 100),
        realm: g.type === 'ancient' ? 'divine' : 'heaven',
        temples: [],
        birthYear: 0
      });
    });
    window.divineData.initialized = true;
  }

  // Tạo thần linh mới
  window.divineV30Create = function(name, typeId, domainId) {
    const t = getType(typeId);
    if (!t) return null;
    const being = {
      id: newId(),
      name: name,
      type: typeId,
      domain: domainId,
      power: t.powerBase + Math.floor(Math.random() * t.powerBase * 0.5),
      followers: Math.floor(t.followerReq * (0.5 + Math.random())),
      influence: 0,
      realm: typeId === 'creation' ? 'creation' : typeId === 'primordial' ? 'void' : 'divine',
      temples: [],
      birthYear: window.year || 1
    };
    window.divineData.beings.push(being);
    const d = getDomain(domainId);
    window.divineData.log.unshift(`[Năm ${being.birthYear}] ${t.icon} ${name} (${t.name} - ${d?.name||domainId}) xuất hiện`);
    if (typeof window.htAddEvent === 'function') {
      window.htAddEvent({ year: being.birthYear, type:'divine', title:`${t.icon} ${name} - Thần ${t.name} Giáng Thế`, color: t.color });
    }
    save();
    return being;
  };

  // Tạo đền thờ
  window.divineV30BuildTemple = function(divineId, location) {
    const being = window.divineData.beings.find(b => b.id === divineId);
    if (!being) return;
    const temple = { id: newId(), divineId, location, worshippers: 200 + Math.floor(Math.random()*800), built: window.year||1 };
    window.divineData.temples.push(temple);
    being.temples.push(temple.id);
    being.followers += temple.worshippers;
    window.divineData.log.unshift(`[Năm ${temple.built}] 🏛 Đền thờ ${being.name} được xây tại ${location}`);
    save();
  };

  // Ban phước
  window.divineV30Bless = function(divineId, targetCountry) {
    const being = window.divineData.beings.find(b => b.id === divineId);
    if (!being || being.power < 200) return;
    const d = getDomain(being.domain);
    being.power -= 100;
    const blessing = { divineId, target: targetCountry, domain: being.domain, bonus: d?.bonus||'', since: window.year||1, duration: 10 };
    window.divineData.blessings.push(blessing);
    window.divineData.log.unshift(`[Năm ${blessing.since}] ✨ ${being.name} ban phước cho ${targetCountry}: ${d?.bonus}`);
    save();
  };

  // Trừng phạt
  window.divineV30Punish = function(divineId, targetCountry, reason) {
    const being = window.divineData.beings.find(b => b.id === divineId);
    if (!being || being.power < 300) return;
    being.power -= 200;
    const pun = { divineId, target: targetCountry, reason, since: window.year||1, duration: 8 };
    window.divineData.punishments.push(pun);
    window.divineData.log.unshift(`[Năm ${pun.since}] ⚡ ${being.name} trừng phạt ${targetCountry}: ${reason}`);
    save();
  };

  // Tick
  window.divineV30Tick = function() {
    const data = window.divineData;
    data.tick = (data.tick||0) + 1;
    const y = window.year || 1;

    // Tín đồ từ đền thờ → sức mạnh thần
    data.beings.forEach(b => {
      const templeBonus = b.temples.length * 20;
      b.followers = Math.floor(b.followers * 1.001 + templeBonus * 0.1);
      b.influence = Math.floor(b.followers / 100);
      const t = getType(b.type);
      b.power = Math.min((t?.powerBase||100) * 2, b.power + Math.floor(b.followers / 1000));
    });

    // Hết hạn phước/phạt
    if (data.tick % 10 === 0) {
      data.blessings = data.blessings.filter(b => (y - b.since) < b.duration);
      data.punishments = data.punishments.filter(p => (y - p.since) < p.duration);
    }

    // Ngẫu nhiên thần mới nổi lên
    if (data.tick % 60 === 0 && Math.random() < 0.15) {
      const domainIds = DOMAINS.map(d => d.id);
      const typePool = ['minor','minor','minor','major','major','ancient'];
      const dId = domainIds[Math.floor(Math.random()*domainIds.length)];
      const tId = typePool[Math.floor(Math.random()*typePool.length)];
      const names = ['Thần Lửa Pyrox','Thần Bóng Tối Umbra','Thần Đất Terron','Thần Biển Oceanos','Thần Gió Ventus','Thần Sấm Torvald'];
      const n = names[Math.floor(Math.random()*names.length)];
      if (!data.beings.find(b => b.name === n)) {
        window.divineV30Create(n, tId, dId);
      }
    }

    if (data.tick % 50 === 0) save();
  };

  // Render panel thần linh
  window.divineV30RenderPanel = function() {
    const el = document.getElementById('panel-divine-v30');
    if (!el) return;
    const data = window.divineData;
    let h = `<div style="padding:16px;background:#0f172a;min-height:100%;color:#e2e8f0;font-family:monospace">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h2 style="color:#facc15;margin:0">👼 Thần Linh</h2>
        <span style="color:#94a3b8;font-size:0.85em">Tổng: ${data.beings.length} thần · ${data.temples.length} đền</span>
      </div>`;

    if (data.beings.length === 0) {
      h += `<div style="color:#64748b;text-align:center;padding:40px">— Chưa có thần linh nào xuất hiện —</div>`;
    } else {
      data.beings.forEach(b => {
        const t = getType(b.type);
        const d = getDomain(b.domain);
        h += `<div style="background:#1e293b;border:1px solid ${t?.color||'#334155'}44;border-radius:8px;padding:12px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:1.05em;font-weight:bold;color:${t?.color||'#fff'}">${t?.icon||'✨'} ${b.name}</span>
            <span style="background:${t?.color||'#334155'}33;color:${t?.color||'#fff'};padding:2px 8px;border-radius:12px;font-size:0.8em">${t?.name||b.type}</span>
          </div>
          <div style="color:${d?.color||'#94a3b8'};font-size:0.85em;margin:4px 0">${d?.name||b.domain} — ${d?.bonus||''}</div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;font-size:0.82em;margin-top:8px">
            <div>⚡ Sức mạnh: <b style="color:#facc15">${b.power.toLocaleString()}</b></div>
            <div>👥 Tín đồ: <b style="color:#34d399">${b.followers.toLocaleString()}</b></div>
            <div>🌐 Ảnh hưởng: <b style="color:#60a5fa">${b.influence}</b></div>
            <div>🏛 Đền: <b style="color:#f0abfc">${b.temples.length}</b></div>
          </div>
          <div style="display:flex;gap:6px;margin-top:8px">
            <button onclick="window.divineV30Bless('${b.id}','Vùng Đất Thánh')" style="background:#16213e;border:1px solid #34d39966;color:#34d399;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:0.8em">✨ Ban Phước</button>
            <button onclick="window.divineV30Punish('${b.id}','Vùng Tà Ma','Bất kính')" style="background:#16213e;border:1px solid #ef444466;color:#ef4444;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:0.8em">⚡ Trừng Phạt</button>
            <button onclick="window.divineV30BuildTemple('${b.id}','Thánh Địa Trung Tâm')" style="background:#16213e;border:1px solid #fbbf2466;color:#fbbf24;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:0.8em">🏛 Xây Đền</button>
          </div>
        </div>`;
      });
    }

    // Log
    h += `<h3 style="color:#60a5fa;margin:20px 0 8px">📜 Nhật Ký Thần Thánh</h3>
      <div style="background:#1e293b;border-radius:6px;padding:10px;max-height:150px;overflow-y:auto;font-size:0.82em">`;
    if (data.log.length === 0) {
      h += `<span style="color:#64748b">— Chưa có sự kiện —</span>`;
    } else {
      data.log.slice(0,20).forEach(l => h += `<div style="color:#94a3b8;margin-bottom:3px">${l}</div>`);
    }
    h += `</div></div>`;
    el.innerHTML = h;
  };

  // Render panel lĩnh vực thần thánh
  window.divineV30RenderDomainPanel = function() {
    const el = document.getElementById('panel-domain-v30');
    if (!el) return;
    const data = window.divineData;
    let h = `<div style="padding:16px;background:#0f172a;min-height:100%;color:#e2e8f0;font-family:monospace">
      <h2 style="color:#facc15;margin:0 0 16px">⚡ Lĩnh Vực Thần Thánh</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">`;

    DOMAINS.forEach(domain => {
      const gods = data.beings.filter(b => b.domain === domain.id);
      const totalPower = gods.reduce((s,b) => s+b.power, 0);
      const totalFollowers = gods.reduce((s,b) => s+b.followers, 0);
      h += `<div style="background:#1e293b;border:1px solid ${domain.color}44;border-radius:8px;padding:14px">
        <div style="font-size:1.1em;font-weight:bold;color:${domain.color}">${domain.name}</div>
        <div style="color:#94a3b8;font-size:0.82em;margin:4px 0">${domain.bonus}</div>
        <div style="margin-top:8px;font-size:0.85em">
          <div>🔱 Thần: <b style="color:#fff">${gods.length}</b> — ${gods.map(g=>g.name).join(', ')||'— không có —'}</div>
          <div>⚡ Tổng sức mạnh: <b style="color:${domain.color}">${totalPower.toLocaleString()}</b></div>
          <div>👥 Tổng tín đồ: <b style="color:#34d399">${totalFollowers.toLocaleString()}</b></div>
        </div>
        <div style="background:#0f172a;border-radius:4px;height:5px;margin-top:8px">
          <div style="background:${domain.color};height:5px;border-radius:4px;width:${Math.min(100,gods.length*20)}%"></div>
        </div>
      </div>`;
    });

    h += `</div>

      <h3 style="color:#60a5fa;margin:20px 0 8px">✨ Phước Lành Đang Hoạt Động (${data.blessings.length})</h3>
      <div style="background:#1e293b;border-radius:6px;padding:10px">`;
    if (data.blessings.length === 0) {
      h += `<span style="color:#64748b">— Không có phước lành nào —</span>`;
    } else {
      data.blessings.forEach(b => {
        const being = data.beings.find(x=>x.id===b.divineId);
        h += `<div style="margin-bottom:5px;color:#34d399">✨ ${being?.name||'?'} → ${b.target}: ${b.bonus}</div>`;
      });
    }

    h += `</div>
      <h3 style="color:#ef4444;margin:16px 0 8px">⚡ Trừng Phạt Đang Hoạt Động (${data.punishments.length})</h3>
      <div style="background:#1e293b;border-radius:6px;padding:10px">`;
    if (data.punishments.length === 0) {
      h += `<span style="color:#64748b">— Không có trừng phạt nào —</span>`;
    } else {
      data.punishments.forEach(p => {
        const being = data.beings.find(x=>x.id===p.divineId);
        h += `<div style="margin-bottom:5px;color:#ef4444">⚡ ${being?.name||'?'} → ${p.target}: ${p.reason}</div>`;
      });
    }
    h += `</div></div>`;
    el.innerHTML = h;
  };

  // Render panel lịch sử thần thánh
  window.divineV30RenderHistoryPanel = function() {
    const el = document.getElementById('panel-divine-history-v30');
    if (!el) return;
    const data = window.divineData;
    let h = `<div style="padding:16px;background:#0f172a;min-height:100%;color:#e2e8f0;font-family:monospace">
      <h2 style="color:#facc15;margin:0 0 16px">📜 Lịch Sử Thần Thánh</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
        <div style="background:#1e293b;border-radius:8px;padding:12px">
          <div style="color:#94a3b8;font-size:0.85em">Tổng Thần Linh</div>
          <div style="font-size:2em;font-weight:bold;color:#facc15">${data.beings.length}</div>
        </div>
        <div style="background:#1e293b;border-radius:8px;padding:12px">
          <div style="color:#94a3b8;font-size:0.85em">Tổng Đền Thờ</div>
          <div style="font-size:2em;font-weight:bold;color:#f0abfc">${data.temples.length}</div>
        </div>
      </div>

      <h3 style="color:#60a5fa;margin:0 0 10px">📊 Bảng Xếp Hạng Thần Linh</h3>
      <table style="width:100%;border-collapse:collapse;font-size:0.83em">
        <tr style="color:#94a3b8;border-bottom:1px solid #334155">
          <th style="text-align:left;padding:6px">#</th>
          <th style="text-align:left">Thần</th>
          <th>Loại</th>
          <th>Lĩnh Vực</th>
          <th>Sức Mạnh</th>
          <th>Tín Đồ</th>
        </tr>`;

    const sorted = [...data.beings].sort((a,b) => b.power - a.power);
    sorted.forEach((b, i) => {
      const t = getType(b.type);
      const d = getDomain(b.domain);
      h += `<tr style="border-bottom:1px solid #1e293b">
        <td style="padding:5px;color:#64748b">${i+1}</td>
        <td style="color:${t?.color||'#fff'}">${t?.icon||''} ${b.name}</td>
        <td style="text-align:center;color:#94a3b8">${t?.name||b.type}</td>
        <td style="text-align:center;color:${d?.color||'#fff'}">${d?.name||b.domain}</td>
        <td style="text-align:center;color:#facc15">${b.power.toLocaleString()}</td>
        <td style="text-align:center;color:#34d399">${b.followers.toLocaleString()}</td>
      </tr>`;
    });

    h += `</table>
      <h3 style="color:#60a5fa;margin:20px 0 8px">📋 Toàn Bộ Nhật Ký</h3>
      <div style="background:#1e293b;border-radius:6px;padding:10px;max-height:250px;overflow-y:auto;font-size:0.82em">`;
    if (data.log.length === 0) {
      h += `<span style="color:#64748b">— Chưa có sự kiện nào —</span>`;
    } else {
      data.log.forEach(l => h += `<div style="color:#94a3b8;margin-bottom:3px">${l}</div>`);
    }
    h += `</div></div>`;
    el.innerHTML = h;
  };

  function init() {
    load();
    initBeings();
    const _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      window.divineV30Tick();
    };
    console.log("[DivineBeing V30] 👼 Thần Linh khởi động — 5 loại thần · 10 lĩnh vực · Thờ phượng · Phước/Phạt ✓");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 3400); });
  } else {
    setTimeout(init, 3400);
  }
})();
