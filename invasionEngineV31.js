/* ============================================================
   INVASION ENGINE V31 — Hệ Thống Xâm Lược Thế Giới
   invasionEngineV31.js
   Load AFTER: worldBossEngineV31.js, app.js
   EXPAND ONLY — NEVER DELETE — NEVER REPLACE
   ============================================================ */
(function () {
  "use strict";

  const SAVE_KEY = "cgv6_invasion_v31";

  const INVASION_TYPES = {
    demon: {
      name:"Ma Quỷ Xâm Lược",   icon:"😈", color:"#f87171",
      strength:3, waveCnt:3,
      desc:"Đại quân ma quỷ từ địa ngục tràn vào thế giới phàm trần.",
      bosses:["Ma Quân Tiên Phong","Ma Vương Phân Thân","Thiên Ma Giáng Thế"],
      effects:["Linh Khí Ô Nhiễm","Tu Luyện Tốc Độ -20%","Tinh Thần Hoảng Loạn"],
    },
    undead: {
      name:"Xác Sống Trỗi Dậy",  icon:"💀", color:"#94a3b8",
      strength:2, waveCnt:5,
      desc:"Vô số xác chết sống lại, tràn ngập thiên hạ.",
      bosses:["Lich Vương Tái Sinh","Tử Thần Đại Tướng","Vong Linh Cổ Đế"],
      effects:["Dịch Bệnh Lan Tràn","Dân Số -15%","Nông Nghiệp Suy Sụp"],
    },
    divine: {
      name:"Thần Thánh Trừng Phạt",icon:"⚡",color:"#facc15",
      strength:8, waveCnt:1,
      desc:"Các vị thần phẫn nộ giáng trừng phạt xuống thế giới.",
      bosses:["Thiên Lôi Phán Quan","Thiên Sứ Diệt Thế","Thần Quyền Phán Xét"],
      effects:["Thiên Tai Liên Tục","Vận Mệnh Suy Giảm","Tôn Giáo Hỗn Loạn"],
    },
    void: {
      name:"Hư Không Nuốt Trọn",  icon:"🌑", color:"#a78bfa",
      strength:10, waveCnt:2,
      desc:"Hư không mở ra, quái vật từ cõi ngoài tràn vào.",
      bosses:["Hư Không Chi Chúa","Ngoại Thần Giáng Lâm","Vô Danh Cổ Ma"],
      effects:["Không Gian Vỡ Vụn","Vùng Đất Biến Mất","Tu Pháp Mất Tác Dụng"],
    },
    titan: {
      name:"Titan Thức Tỉnh",     icon:"🗿", color:"#fb923c",
      strength:15, waveCnt:1,
      desc:"Titan cổ đại từ thời sơ khai thức dậy, mỗi bước phá nát sơn hà.",
      bosses:["Titan Đại Địa","Titan Biển Lửa","Khai Thiên Titan"],
      effects:["Lục Địa Rung Chuyển","Núi Lửa Phun Trào","Thần Lực Suy Yếu"],
    },
  };

  let _data = {
    invasions:      [],
    history:        [],
    activeInvasion: null,
    totalInvasions: 0,
    totalDefended:  0,
    totalFallen:    0,
    tick:           0,
  };
  let _idCtr = 1;

  function _save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(_data)); } catch(e) {} }
  function _load() {
    try {
      const s = localStorage.getItem(SAVE_KEY);
      if (s) { const p = JSON.parse(s); Object.assign(_data, p); }
    } catch(e) {}
  }

  // ── Trigger Invasion ──
  function iev31TriggerInvasion(typeKey) {
    const invType = INVASION_TYPES[typeKey];
    if (!invType) return null;
    if (_data.activeInvasion) {
      if (typeof toast === "function") toast("⚠️ Đang có xâm lược! Hãy phòng thủ trước.");
      return null;
    }

    const boss = invType.bosses[Math.floor(Math.random()*invType.bosses.length)];
    const inv  = {
      id:        `inv_${_idCtr++}_${Date.now().toString(36).slice(-4)}`,
      type:      typeKey,
      name:      invType.name,
      icon:      invType.icon,
      color:     invType.color,
      boss,
      strength:  invType.strength,
      waveCnt:   invType.waveCnt,
      wavesDone: 0,
      effects:   invType.effects,
      desc:      invType.desc,
      startYear: window.year || 0,
      endYear:   null,
      status:    "active",
      damage:    { npcKilled: 0, countriesAffected: 0, sectsFallen: 0 },
      defenders: [],
      log:       [],
    };

    _data.invasions.unshift(inv);
    _data.activeInvasion = inv.id;
    _data.totalInvasions++;

    // Spawn a World Boss for the invasion
    if (typeof wbv31SpawnBoss === "function") {
      const tierMap = { demon:"epic", undead:"rare", divine:"mythic", void:"legendary", titan:"divine" };
      wbv31SpawnBoss(tierMap[typeKey] || "epic");
    }

    inv.log.push(`Năm ${window.year||0}: ${invType.icon} ${invType.name} bắt đầu! Boss: ${boss}`);
    if (typeof addLog === "function") addLog(`${invType.icon} ⚠️ XÂM LƯỢC! ${invType.name} — ${boss} đang tấn công!`, "important");
    if (typeof addTimeline === "function") addTimeline(`${invType.icon} ${invType.name} bắt đầu`, "death", invType.icon);
    if (typeof toast === "function") toast(`${invType.icon} CẢNH BÁO! ${invType.name}!`);

    _applyInvasionEffects(inv);
    _save();
    return inv;
  }

  function _applyInvasionEffects(inv) {
    const npcs = (window.npcs || []).filter(n => n.status === "alive");
    const casCount = Math.floor(npcs.length * 0.02 * inv.strength);
    for (let i = 0; i < Math.min(casCount, npcs.length); i++) {
      const npc = npcs[Math.floor(Math.random()*npcs.length)];
      if (npc && typeof killNPC === "function" && npc.status === "alive") {
        killNPC(npc, `hy sinh trong ${inv.name}`);
        inv.damage.npcKilled++;
      }
    }
    const countries = window.countries || [];
    const affected  = Math.floor(countries.length * 0.15 * inv.strength / 10);
    inv.damage.countriesAffected = affected;
    if (typeof addLog === "function") addLog(`${inv.icon} ${inv.name} gây ra ${inv.damage.npcKilled} thương vong, ${affected} quốc gia bị ảnh hưởng.`, "normal");
  }

  // ── Defend Invasion ──
  function iev31Defend(invId, defenderName, power) {
    const inv = _data.invasions.find(i => i.id === invId);
    if (!inv || inv.status !== "active") return false;

    inv.defenders.push({ name: defenderName, power });
    inv.log.push(`${defenderName} gia nhập phòng thủ với lực chiến ${power.toLocaleString()}.`);

    // Check if defense is enough
    const totalPower   = inv.defenders.reduce((s,d) => s + d.power, 0);
    const needed       = inv.strength * 50000;

    if (totalPower >= needed) {
      _resolveInvasion(inv, true, defenderName);
      return "success";
    }
    return "fighting";
  }

  function _resolveInvasion(inv, success, hero) {
    inv.status  = "resolved";
    inv.endYear = window.year || 0;
    _data.activeInvasion = null;

    if (success) {
      _data.totalDefended++;
      inv.log.push(`🏆 Năm ${window.year||0}: ${hero || "Thế giới"} đẩy lùi ${inv.name}!`);
      if (typeof addLog === "function") addLog(`🏆 ${inv.icon} ${inv.name} bị đẩy lùi! Anh hùng: ${hero || "Không rõ"}`, "important");
      if (typeof toast === "function") toast(`🏆 Đã đẩy lùi ${inv.name}!`);
    } else {
      _data.totalFallen++;
      inv.log.push(`💀 Năm ${window.year||0}: ${inv.name} gây thảm họa toàn thế giới!`);
      if (typeof addLog === "function") addLog(`💀 ${inv.icon} ${inv.name} gây thảm họa! Thế giới chịu tổn thất nặng nề.`, "important");
    }

    _data.history.unshift({
      type: inv.type, name: inv.name, icon: inv.icon,
      boss: inv.boss, result: success ? "defended" : "fallen",
      npcKilled: inv.damage.npcKilled, year: inv.endYear,
    });
    if (_data.history.length > 100) _data.history.pop();
    _save();
  }

  // ── Auto defense tick ──
  function _tick() {
    if (!window.world) return;
    _data.tick++;

    // Auto-defense attempt by strong NPCs
    if (_data.activeInvasion) {
      const inv   = _data.invasions.find(i => i.id === _data.activeInvasion);
      if (inv && inv.status === "active") {
        const npcs  = (window.npcs||[]).filter(n=>n.status==="alive"&&(n.realm||0)>=5);
        if (npcs.length && Math.random() < 0.25) {
          const hero  = npcs.sort((a,b)=>(b.realm||0)-(a.realm||0))[0];
          const power = (hero.realm||0)*200 + (hero.attack||0);
          iev31Defend(inv.id, hero.name, power);
        }
        inv.wavesDone++;
        if (inv.wavesDone >= inv.waveCnt * 10) {
          _resolveInvasion(inv, false, null);
        }
      }
    }

    // Random invasion every ~200 ticks
    if (_data.tick % 200 === 0 && !_data.activeInvasion) {
      const types = Object.keys(INVASION_TYPES);
      iev31TriggerInvasion(types[Math.floor(Math.random()*types.length)]);
    }
    _save();
  }

  // ── Render Panel ──
  function iev31RenderPanel() {
    const el = document.getElementById("panel-invasion-v31");
    if (!el) return;
    const activeInv = _data.invasions.find(i => i.id === _data.activeInvasion);
    const hist      = _data.history.slice(0, 30);

    el.innerHTML = `
    <div style="padding:12px;max-width:900px;margin:0 auto">
      <div style="font-family:var(--font-title);font-size:18px;color:var(--gold);margin-bottom:12px">🌋 Invasion Engine V31 — Xâm Lược Thế Giới</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">
        <div style="background:rgba(250,204,21,0.08);border:1px solid rgba(250,204,21,0.2);border-radius:8px;padding:10px;text-align:center">
          <div style="color:var(--gold);font-size:20px;font-weight:700">${_data.totalInvasions}</div>
          <div style="color:var(--white-dim);font-size:10px">Tổng Xâm Lược</div>
        </div>
        <div style="background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.2);border-radius:8px;padding:10px;text-align:center">
          <div style="color:#4ade80;font-size:20px;font-weight:700">${_data.totalDefended}</div>
          <div style="color:var(--white-dim);font-size:10px">Đẩy Lùi Được</div>
        </div>
        <div style="background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.2);border-radius:8px;padding:10px;text-align:center">
          <div style="color:#f87171;font-size:20px;font-weight:700">${_data.totalFallen}</div>
          <div style="color:var(--white-dim);font-size:10px">Thất Thủ</div>
        </div>
      </div>

      ${activeInv ? `
        <div style="background:rgba(248,113,113,0.12);border:2px solid #f87171;border-radius:10px;padding:14px;margin-bottom:14px;animation:pulse 2s infinite">
          <div style="color:#f87171;font-size:16px;font-weight:700;margin-bottom:6px">⚠️ XÂM LƯỢC ĐANG DIỄN RA!</div>
          <div style="font-size:14px;color:var(--white-main);margin-bottom:4px">${activeInv.icon} ${activeInv.name}</div>
          <div style="font-size:11px;color:var(--white-dim);margin-bottom:4px">Boss: ${activeInv.boss} · Sức mạnh: ${activeInv.strength}/15</div>
          <div style="font-size:10px;color:#f87171;margin-bottom:8px">Hiệu ứng: ${activeInv.effects.join(" · ")}</div>
          <div style="font-size:10px;color:var(--white-dim);margin-bottom:8px">
            Thương vong: ${activeInv.damage.npcKilled} · Quốc gia bị ảnh hưởng: ${activeInv.damage.countriesAffected}
          </div>
          <div style="max-height:80px;overflow-y:auto;font-size:10px;color:var(--white-dim)">
            ${activeInv.log.map(l=>`<div>${l}</div>`).join("")}
          </div>
        </div>
      ` : `<div style="background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.2);border-radius:8px;padding:10px;margin-bottom:12px;color:#4ade80;font-size:12px;text-align:center">✅ Thế giới đang bình yên. Không có xâm lược nào.</div>`}

      <div style="color:var(--gold);font-size:12px;letter-spacing:1px;margin-bottom:8px">⚡ KÍCH HOẠT XÂM LƯỢC (Test)</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
        ${Object.entries(INVASION_TYPES).map(([k,t])=>`
          <button onclick="iev31TriggerInvasion('${k}')" style="background:rgba(248,113,113,0.12);border:1px solid rgba(248,113,113,0.3);color:#f87171;border-radius:6px;padding:6px 12px;cursor:pointer;font-size:11px">
            ${t.icon} ${t.name}
          </button>
        `).join("")}
      </div>

      <div style="color:var(--gold);font-size:12px;letter-spacing:1px;margin-bottom:8px">📜 LỊCH SỬ XÂM LƯỢC</div>
      <div style="max-height:260px;overflow-y:auto">
        ${hist.length === 0 ? `<div style="color:var(--white-dim);font-size:12px;padding:10px">Chưa có lịch sử xâm lược.</div>` : ""}
        ${hist.map(h=>`
          <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 10px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:11px">
            <div>
              <span style="color:var(--gold)">${h.icon} ${h.name}</span>
              <span style="color:var(--white-dim);margin-left:6px">Boss: ${h.boss}</span>
            </div>
            <div>
              <span style="color:${h.result==='defended'?'#4ade80':'#f87171'}">${h.result==='defended'?'✅ Đẩy Lùi':'💀 Thất Thủ'}</span>
              <span style="color:var(--white-dim);margin-left:6px">Năm ${h.year}</span>
            </div>
          </div>
        `).join("")}
      </div>
    </div>`;
  }

  window.iev31TriggerInvasion = iev31TriggerInvasion;
  window.iev31Defend          = iev31Defend;
  window.iev31RenderPanel     = iev31RenderPanel;
  window.iev31Data            = _data;

  function _init() {
    _load();
    const _orig = window.gameTick;
    window.gameTick = function() {
      if (typeof _orig === "function") _orig();
      _tick();
    };
    console.log("[InvasionEngineV31] 🌋 Invasion Engine V31 — 5 loại xâm lược · Auto-defend · Titan Awakening sẵn sàng.");
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(_init, 3800));
  } else {
    setTimeout(_init, 3800);
  }
})();
