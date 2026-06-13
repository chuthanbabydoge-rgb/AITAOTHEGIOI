/* ============================================================
   DIVINE ADMINISTRATION V32
   Kiểm Soát Thần Thánh — Tạo/Xóa Thần · Lãnh Địa · Thần Điện · Thần Chiến
   EXPAND ONLY · Hook vào divineBeingEngine.js + divineWarEngine.js
   ============================================================ */
(function() {
  "use strict";
  const SAVE_KEY = "cgv6_divine_admin_v32";

  window.divineAdminData = {
    createdDeities: [],
    divineWars: [],
    pantheons: [],
    actions: [],
    initialized: false
  };

  /* ── SAVE / LOAD ── */
  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        createdDeities: window.divineAdminData.createdDeities.slice(0, 50),
        divineWars: window.divineAdminData.divineWars.slice(0, 30),
        pantheons: window.divineAdminData.pantheons.slice(0, 20),
        actions: window.divineAdminData.actions.slice(0, 80)
      }));
    } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) {
        const p = JSON.parse(d);
        window.divineAdminData.createdDeities = p.createdDeities || [];
        window.divineAdminData.divineWars = p.divineWars || [];
        window.divineAdminData.pantheons = p.pantheons || [];
        window.divineAdminData.actions = p.actions || [];
      }
    } catch(e) {}
  }

  /* ── HELPERS ── */
  function now() { return (typeof year !== 'undefined') ? year : 0; }
  function toast(msg) { if (typeof window.toast === 'function') window.toast(msg); else console.log(msg); }
  function log(msg) { if (typeof addLog === 'function') addLog(msg, 'important'); }
  function recordAction(action, detail) {
    window.divineAdminData.actions.unshift({ year: now(), action, detail, ts: Date.now() });
    if (window.divineAdminData.actions.length > 80) window.divineAdminData.actions.pop();
    if (typeof window.htAddEvent === 'function') window.htAddEvent({ year: now(), type: 'divine', title: '[Thần] ' + action, color: '#c084fc' });
    save();
  }
  function getDeities() {
    const all = [];
    if (typeof window.divineBeingData !== 'undefined' && window.divineBeingData.beings) all.push(...window.divineBeingData.beings);
    all.push(...window.divineAdminData.createdDeities.filter(d => d.active !== false));
    return all;
  }

  /* ════════════════════════════════════════════════
     KIỂM SOÁT THẦN
  ════════════════════════════════════════════════ */

  window.daCreateDeity = function(name, domain, tier) {
    if (!name) { toast('⚠️ Cần nhập tên Thần!'); return; }
    domain = domain || 'Đất';
    tier = tier || 'immortal';
    const tierPower = { spirit: 1000, immortal: 5000, deity: 20000, greater: 80000, primordial: 300000 };
    const id = 'deity_' + Date.now();
    const deity = {
      id, name, domain, tier,
      power: tierPower[tier] || 20000,
      worshippers: Math.floor(Math.random() * 10000) + 1000,
      realm: name + '神殿',
      temples: Math.floor(Math.random() * 5) + 1,
      created: now(),
      active: true,
      creatorMade: true,
      divineWars: 0,
      blessings: 0
    };
    window.divineAdminData.createdDeities.push(deity);
    if (typeof window.divineBeingData !== 'undefined' && window.divineBeingData.beings) {
      window.divineBeingData.beings.push({ ...deity });
    }
    if (typeof window.wmeAddMemory === 'function') window.wmeAddMemory({ year: now(), category: 'divine', title: 'Thần Mới Giáng Thế: ' + name, content: name + ' — Thần ' + domain + ' [' + tier + '] xuất hiện trong thế giới.' });
    save();
    log('👼 Tạo Hóa tạo ra Thần: ' + name + ' — Lãnh Vực: ' + domain, 'important');
    recordAction('Tạo Thần: ' + name, 'Lãnh vực ' + domain + ' [' + tier + ']');
    toast('👼 Thần ' + name + ' đã giáng thế!');
    if (typeof window.divineAdminRenderPanel === 'function') window.divineAdminRenderPanel();
  };

  window.daRemoveDeity = function(deityId) {
    const deity = getDeities().find(d => d.id == deityId || d.name == deityId);
    if (!deity) { toast('⚠️ Không tìm thấy Thần!'); return; }
    if (!confirm('Loại bỏ Thần: ' + deity.name + '?')) return;
    deity.active = false;
    deity.removed = now();
    deity.removedBy = 'Tạo Hóa';
    const idx = window.divineAdminData.createdDeities.findIndex(d => d.id == deityId || d.name == deityId);
    if (idx >= 0) window.divineAdminData.createdDeities[idx].active = false;
    if (typeof window.divineBeingData !== 'undefined' && window.divineBeingData.beings) {
      const bidx = window.divineBeingData.beings.findIndex(d => d.id == deityId || d.name == deityId);
      if (bidx >= 0) window.divineBeingData.beings[bidx].active = false;
    }
    save();
    log('💀 Tạo Hóa loại bỏ Thần: ' + deity.name, 'important');
    recordAction('Loại bỏ Thần: ' + deity.name, 'Vị thần biến mất khỏi thế giới');
    toast('💀 Thần ' + deity.name + ' đã bị loại bỏ!');
    if (typeof window.divineAdminRenderPanel === 'function') window.divineAdminRenderPanel();
  };

  window.daAssignDomain = function(deityId, newDomain) {
    if (!newDomain) { toast('⚠️ Cần nhập lãnh địa!'); return; }
    const deity = window.divineAdminData.createdDeities.find(d => d.id == deityId || d.name == deityId);
    if (!deity) { toast('⚠️ Không tìm thấy Thần trong danh sách Tạo Hóa!'); return; }
    const oldDomain = deity.domain;
    deity.domain = newDomain;
    deity.power = Math.floor(deity.power * 1.3);
    save();
    log('🏛 Tạo Hóa phân định Lãnh Địa mới cho ' + deity.name + ': ' + oldDomain + ' → ' + newDomain, 'important');
    recordAction('Đổi lãnh địa: ' + deity.name, oldDomain + ' → ' + newDomain);
    toast('🏛 Lãnh Địa: ' + oldDomain + ' → ' + newDomain);
    if (typeof window.divineAdminRenderPanel === 'function') window.divineAdminRenderPanel();
  };

  window.daCreatePantheon = function(name, memberIds) {
    if (!name) { toast('⚠️ Cần nhập tên Thần Điện!'); return; }
    const pantheon = {
      id: 'pan_' + Date.now(),
      name,
      members: (memberIds || []).slice(0, 12),
      founded: now(),
      power: 0,
      active: true,
      creatorMade: true
    };
    window.divineAdminData.pantheons.push(pantheon);
    if (typeof window.pantheonData !== 'undefined' && window.pantheonData.pantheons) {
      window.pantheonData.pantheons.push({ ...pantheon });
    }
    save();
    log('⛪ Tạo Hóa tạo Thần Điện: ' + name, 'important');
    recordAction('Tạo Thần Điện: ' + name, pantheon.members.length + ' thành viên');
    toast('⛪ Thần Điện ' + name + ' được thành lập!');
    if (typeof window.divineAdminRenderPanel === 'function') window.divineAdminRenderPanel();
  };

  window.daStartDivineWar = function(deity1, deity2, reason) {
    if (!deity1 || !deity2) { toast('⚠️ Cần 2 vị thần!'); return; }
    reason = reason || 'Tranh giành lãnh địa';
    const war = {
      id: 'dw_' + Date.now(),
      attacker: deity1,
      defender: deity2,
      reason,
      startYear: now(),
      active: true,
      waves: 0,
      creatorTriggered: true
    };
    window.divineAdminData.divineWars.push(war);
    if (typeof window.divineWarData !== 'undefined') {
      if (!window.divineWarData.wars) window.divineWarData.wars = [];
      window.divineWarData.wars.push({ ...war });
    }
    if (typeof window.wmeAddMemory === 'function') window.wmeAddMemory({ year: now(), category: 'divine_war', title: 'Thần Chiến: ' + deity1 + ' vs ' + deity2, content: reason + ' — Hai vị thần khai chiến!' });
    save();
    log('⚔️ Tạo Hóa khởi đầu Thần Chiến: ' + deity1 + ' VS ' + deity2, 'important');
    recordAction('Thần Chiến: ' + deity1 + ' vs ' + deity2, reason);
    toast('⚔️ Thần Chiến bùng nổ: ' + deity1 + ' vs ' + deity2 + '!');
    if (typeof window.divineAdminRenderPanel === 'function') window.divineAdminRenderPanel();
  };

  window.daGrantDivineBlessing = function(targetType, targetName, blessingDomain) {
    blessingDomain = blessingDomain || 'Thiên Đạo';
    const effects = {
      country: function() {
        if (typeof countries !== 'undefined') {
          const c = countries.find(c => c.name === targetName);
          if (c) { c.stability = Math.min(100, (c.stability||50) + 25); c.population = Math.floor((c.population||1000) * 1.15); return true; }
        }
        return false;
      },
      npc: function() {
        if (typeof npcs !== 'undefined') {
          const n = npcs.find(n => n.name === targetName && n.status === 'alive');
          if (n) { n.luck = Math.min(100, (n.luck||50) + 30); n.karma = Math.min(100, (n.karma||0) + 20); n.realmProgress = (n.realmProgress||0) + 3000; return true; }
        }
        return false;
      }
    };
    const fn = effects[targetType];
    const success = fn ? fn() : false;
    if (success) {
      log('✨ Thần Ân ' + blessingDomain + ' giáng xuống ' + targetName, 'important');
      recordAction('Thần Ân: ' + targetName, 'Lĩnh vực: ' + blessingDomain);
      toast('✨ Thần Ân giáng xuống: ' + targetName);
    } else {
      toast('⚠️ Không tìm thấy: ' + targetName);
    }
    if (typeof window.divineAdminRenderPanel === 'function') window.divineAdminRenderPanel();
  };

  /* ════════════════════════════════════════════════
     RENDER PANEL
  ════════════════════════════════════════════════ */

  window.divineAdminRenderPanel = function() {
    const panel = document.getElementById('panel-divine-admin');
    if (!panel) return;
    const deities = getDeities().filter(d => d.active !== false);
    const pantheons = window.divineAdminData.pantheons.filter(p => p.active !== false);
    const divineWars = window.divineAdminData.divineWars.filter(w => w.active !== false);
    const domains = ['Trời','Đất','Nước','Lửa','Gió','Sấm','Băng','Thời Gian','Không Gian','Chiến Tranh','Hòa Bình','Cái Chết','Sự Sống','Trí Tuệ','Tình Yêu','Vận Mệnh','Hỗn Độn','Tạo Hóa'];
    const tiers = ['spirit','immortal','deity','greater','primordial'];
    const tierNames = { spirit: '靈', immortal: '仙', deity: '神', greater: '大神', primordial: '太古神' };

    panel.innerHTML = `
<div style="padding:16px;max-width:900px;margin:0 auto">
  <div style="text-align:center;margin-bottom:16px">
    <div style="font-family:var(--font-heading);font-size:18px;color:#c084fc;text-shadow:0 0 20px rgba(192,132,252,0.4)">👼 KIỂM SOÁT THẦN THÁNH V32</div>
    <div style="font-size:12px;color:var(--white-dim);margin-top:4px">${deities.length} Thần · ${pantheons.length} Thần Điện · ${divineWars.length} Thần Chiến</div>
  </div>

  <!-- TẠO THẦN MỚI -->
  <div style="background:var(--bg-card);border:1px solid rgba(192,132,252,0.2);border-radius:10px;padding:14px;margin-bottom:12px">
    <div style="font-size:13px;color:#c084fc;margin-bottom:12px;font-weight:700">✨ TẠO THẦN MỚI</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end">
      <input id="da-deity-name" placeholder="Tên Thần" style="padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid rgba(192,132,252,0.3);border-radius:6px;color:var(--white-main);font-size:12px;width:140px">
      <select id="da-deity-domain" style="padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid rgba(192,132,252,0.3);border-radius:6px;color:var(--white-main);font-size:12px">
        ${domains.map(d => `<option value="${d}">${d}</option>`).join('')}
      </select>
      <select id="da-deity-tier" style="padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid rgba(192,132,252,0.3);border-radius:6px;color:var(--white-main);font-size:12px">
        ${tiers.map(t => `<option value="${t}">${tierNames[t]} (${t})</option>`).join('')}
      </select>
      <button onclick="daCreateDeity(document.getElementById('da-deity-name').value,document.getElementById('da-deity-domain').value,document.getElementById('da-deity-tier').value)" style="padding:7px 16px;background:linear-gradient(135deg,rgba(192,132,252,0.15),rgba(109,40,217,0.2));border:1px solid rgba(192,132,252,0.4);border-radius:6px;color:#c084fc;cursor:pointer;font-size:12px;font-weight:700">✨ Tạo Thần</button>
    </div>
  </div>

  <!-- DANH SÁCH THẦN -->
  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:12px">
    <div style="font-size:13px;color:#c084fc;margin-bottom:10px;font-weight:700">⛩ THẦN ĐANG HOẠT ĐỘNG (${deities.length})</div>
    <div style="max-height:240px;overflow-y:auto;display:flex;flex-direction:column;gap:5px">
      ${deities.length === 0 ? '<div style="color:var(--white-dim);font-size:12px">Chưa có Thần nào trong thế giới</div>' :
        deities.slice(0, 20).map(d => `
          <div style="background:rgba(192,132,252,0.04);border:1px solid rgba(192,132,252,0.15);border-radius:8px;padding:9px 12px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-size:13px;color:#c084fc">${d.name} <span style="font-size:10px;color:var(--white-dim)">[${tierNames[d.tier]||d.tier||'Thần'}]</span></div>
              <div style="font-size:11px;color:var(--white-dim)">Lãnh Vực: ${d.domain||'?'} · Quyền Năng: ${(d.power||0).toLocaleString()} · Tín Đồ: ${(d.worshippers||0).toLocaleString()}</div>
            </div>
            <div style="display:flex;gap:5px">
              <button onclick="daRemoveDeity('${d.id||d.name}')" style="padding:4px 8px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:5px;color:var(--red);cursor:pointer;font-size:10px">❌ Loại Bỏ</button>
            </div>
          </div>`).join('')}
    </div>
  </div>

  <!-- TẠO THẦN ĐIỆN -->
  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:12px">
    <div style="font-size:13px;color:#facc15;margin-bottom:10px;font-weight:700">⛪ TẠO THẦN ĐIỆN</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end">
      <input id="da-pan-name" placeholder="Tên Thần Điện" style="padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid var(--border);border-radius:6px;color:var(--white-main);font-size:12px;width:180px">
      <button onclick="daCreatePantheon(document.getElementById('da-pan-name').value,[])" style="padding:7px 14px;background:rgba(250,204,21,0.1);border:1px solid rgba(250,204,21,0.3);border-radius:6px;color:var(--gold);cursor:pointer;font-size:12px">⛪ Thành Lập</button>
    </div>
    ${pantheons.length > 0 ? `<div style="margin-top:10px;display:flex;flex-direction:column;gap:4px">${pantheons.slice(0,5).map(p=>`<div style="font-size:11px;color:var(--white-dim);padding:4px 8px;background:rgba(255,255,255,0.02);border-radius:4px">⛪ ${p.name} — Năm ${p.founded}</div>`).join('')}</div>` : ''}
  </div>

  <!-- THẦN CHIẾN -->
  <div style="background:var(--bg-card);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:14px;margin-bottom:12px">
    <div style="font-size:13px;color:var(--red);margin-bottom:10px;font-weight:700">⚔️ KHỞI ĐẦU THẦN CHIẾN</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end">
      <select id="da-war-a" style="padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid var(--border);border-radius:6px;color:var(--white-main);font-size:12px;flex:1;min-width:120px">
        <option value="">-- Thần Tấn Công --</option>
        ${deities.slice(0,15).map(d=>`<option value="${d.name}">${d.name} (${d.domain||'?'})</option>`).join('')}
      </select>
      <select id="da-war-d" style="padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid var(--border);border-radius:6px;color:var(--white-main);font-size:12px;flex:1;min-width:120px">
        <option value="">-- Thần Phòng Thủ --</option>
        ${deities.slice(0,15).map(d=>`<option value="${d.name}">${d.name} (${d.domain||'?'})</option>`).join('')}
      </select>
      <button onclick="daStartDivineWar(document.getElementById('da-war-a').value,document.getElementById('da-war-d').value,'Tranh giành Lãnh Địa')" style="padding:7px 14px;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.35);border-radius:6px;color:var(--red);cursor:pointer;font-size:12px">⚔️ Khai Chiến</button>
    </div>
    ${divineWars.length > 0 ? `<div style="margin-top:10px;display:flex;flex-direction:column;gap:4px">${divineWars.slice(0,5).map(w=>`<div style="font-size:11px;color:#fca5a5;padding:4px 8px;background:rgba(239,68,68,0.04);border-radius:4px">⚔️ ${w.attacker} vs ${w.defender} — ${w.reason}</div>`).join('')}</div>` : ''}
  </div>

  <!-- LOG HÀNH ĐỘNG -->
  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px">
    <div style="font-size:12px;color:var(--white-dim);margin-bottom:8px;font-weight:700">📋 LỊCH SỬ THẦN THÁNH</div>
    <div style="max-height:120px;overflow-y:auto;display:flex;flex-direction:column;gap:3px">
      ${window.divineAdminData.actions.slice(0,10).map(a=>`
        <div style="font-size:11px;color:var(--white-dim);padding:3px 6px;background:rgba(255,255,255,0.02);border-radius:4px">
          <span style="color:var(--gold-dim)">Năm ${a.year}</span> · <span style="color:#c084fc">${a.action}</span> · ${a.detail}
        </div>`).join('') || '<div style="font-size:11px;color:var(--white-dim)">Chưa có hành động nào</div>'}
    </div>
  </div>
</div>`;
  };

  /* ── INIT ── */
  function init() {
    load();
    window.divineAdminData.initialized = true;
    console.log('[DivineAdministration V32] Khởi động thành công — Thần Thánh chờ lệnh Tạo Hóa.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 2200); });
  } else {
    setTimeout(init, 2200);
  }
})();
