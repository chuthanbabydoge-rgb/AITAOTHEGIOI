/* ============================================================
   DUNGEON ENGINE V31 — Hầm Ngục Mở Rộng
   dungeonEngineV31.js
   Load AFTER: dungeonSystem.js, lootEngineV31.js
   EXPAND ONLY — NEVER DELETE — NEVER REPLACE
   ============================================================ */
(function () {
  "use strict";

  const SAVE_KEY = "cgv6_dungeon_v31";

  // ── 6 Dungeon Types V31 ──
  const DUNGEON_TYPES_V31 = {
    ancient_ruins: {
      name:"Phế Tích Thượng Cổ", icon:"🏛", color:"#94a3b8",
      floors:[5,8,12], bossPool:["Thái Cổ Cơ Binh","Vong Linh Thần Vương","Cổ Thần Dư Hồn"],
      enemies:["Cơ Binh Phá","Vong Linh Cổ Vệ","Thạch Nhân Thủ Vệ"],
      traps:["Cổ Trận Hủy Linh","Thời Gian Phong Ấn","Không Gian Nứt Vỡ"],
      rewards:"legendary", desc:"Phế tích từ buổi thượng cổ, cổ binh vẫn còn tuần tra.",
    },
    demon_cave: {
      name:"Quỷ Động Ma Quật", icon:"🔥", color:"#f87171",
      floors:[4,7,10], bossPool:["Ma Vương Phân Thân","Quỷ Tướng Địa Ngục","Thiên Ma Tử Trận"],
      enemies:["Tiểu Ma Binh","Quỷ Hỏa Tinh","Ma Khí Tinh"],
      traps:["Ma Khí Phong Ấn","Địa Ngục Lửa","Quỷ Nguyền Rủa"],
      rewards:"epic", desc:"Hang động đầy ma khí, quỷ binh bảo vệ kho báu.",
    },
    spirit_forest: {
      name:"Linh Thú Thần Lâm", icon:"🌲", color:"#4ade80",
      floors:[3,6,9], bossPool:["Cổ Thụ Thần Linh","Vương Giả Linh Thú","Yêu Hồ Đại Nhân"],
      enemies:["Linh Thú Nhỏ","Tinh Linh Xanh","Yêu Hồ Bạc"],
      traps:["Mê Hồn Linh Khí","Yêu Thuật Mê Lạc","Thiên La Địa Võng"],
      rewards:"rare", desc:"Rừng linh thiêng có linh thú cổ đại trú ngụ.",
    },
    divine_temple: {
      name:"Thần Điện Thiêng Liêng", icon:"⛩️", color:"#facc15",
      floors:[6,9,15], bossPool:["Sa Ngã Thiên Sứ","Thần Vệ Binh Phản","Cổ Thần Phân Thân"],
      enemies:["Thần Binh Kiêu Ngạo","Vệ Linh Kinh Hành","Tinh Khí Thần"],
      traps:["Thần Thánh Thẩm Phán","Phán Xét Thiêng Liêng","Linh Hồn Tịnh Hóa"],
      rewards:"legendary", desc:"Đền thờ thần thánh, bị ô uế bởi kẻ tà ác.",
    },
    heavenly_palace: {
      name:"Thiên Cung Ngọc Điện", icon:"☁️", color:"#e879f9",
      floors:[8,12,20], bossPool:["Thiên Đế Phân Thân","Ngọc Hoàng Dư Uy","Thần Thánh Cổ Vệ"],
      enemies:["Thiên Binh Thần Tướng","Ngọc Nữ Hộ Vệ","Kim Giáp Thần"],
      traps:["Thiên Lôi Phong Ấn","Tiên Khí Xuyên Thấu","Vạn Pháp Quy Tông"],
      rewards:"divine", desc:"Thiên cung của Thiên Đế, chỉ kẻ mạnh nhất mới vào được.",
    },
    void_labyrinth: {
      name:"Hư Không Mê Trận", icon:"🌑", color:"#a78bfa",
      floors:[10,15,25], bossPool:["Hư Không Chi Chúa","Vô Danh Ma Thần","Không Gian Dị Giới"],
      enemies:["Hư Không Quái","Không Gian Hồn","Vô Hình Ma"],
      traps:["Không Gian Gấp Đôi","Thực Tại Vỡ Vụn","Thời Không Đảo Ngược"],
      rewards:"divine", desc:"Mê trận hư không, mỗi bước là một cõi khác.",
    },
  };

  // ── State ──
  let _data = {
    dungeons:   [],
    cleared:    [],
    exploring:  [],
    totalGen:   0,
    totalClear: 0,
    tick:       0,
  };
  let _idCtr = 1;

  // ── Persistence ──
  function _save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(_data)); } catch(e) {}
  }
  function _load() {
    try {
      const s = localStorage.getItem(SAVE_KEY);
      if (s) { const p = JSON.parse(s); Object.assign(_data, p); }
    } catch(e) {}
  }

  // ── Generate V31 Dungeon ──
  function dev31GenerateDungeon(typeKey) {
    if (!window.world) return null;
    const types = Object.keys(DUNGEON_TYPES_V31);
    const key   = typeKey || types[Math.floor(Math.random() * types.length)];
    const tmpl  = DUNGEON_TYPES_V31[key];
    if (!tmpl) return null;

    const floorOpts = tmpl.floors;
    const floors    = floorOpts[Math.floor(Math.random() * floorOpts.length)];
    const boss      = tmpl.bossPool[Math.floor(Math.random() * tmpl.bossPool.length)];

    // Generate floor layout
    const layout = [];
    for (let f = 1; f <= floors; f++) {
      layout.push({
        floor:   f,
        enemies: Array.from({length: 2 + Math.floor(Math.random()*3)}, () =>
          tmpl.enemies[Math.floor(Math.random()*tmpl.enemies.length)]),
        trap:    Math.random() < 0.4 ? tmpl.traps[Math.floor(Math.random()*tmpl.traps.length)] : null,
        reward:  Math.random() < 0.3,
        isBoss:  f === floors,
      });
    }

    const dg = {
      id:           `dgv31_${_idCtr++}_${Date.now().toString(36).slice(-4)}`,
      type:         key,
      name:         tmpl.name,
      icon:         tmpl.icon,
      color:        tmpl.color,
      floors,
      layout,
      boss,
      bossDefeated: false,
      desc:         tmpl.desc,
      rewards:      tmpl.rewards,
      discoveredYear: window.year || 0,
      status:       "active",
      explorers:    [],
      clearLog:     [],
      totalAttempts:0,
      totalClears:  0,
      firstClearBy: null,
    };

    _data.dungeons.unshift(dg);
    if (_data.dungeons.length > 60) _data.dungeons.pop();
    _data.totalGen++;

    if (typeof addLog === "function") addLog(`🏛 ${tmpl.icon} ${tmpl.name} mở ra! ${floors} tầng · Boss: ${boss}`, "important");
    if (typeof addTimeline === "function") addTimeline(`${tmpl.icon} ${tmpl.name} xuất hiện`, "important", tmpl.icon);
    if (typeof addWorldHistory === "function") addWorldHistory("boss", `Dungeon V31 ${tmpl.name} khai mở, boss ${boss} trấn giữ.`, {});

    _save();
    return dg;
  }

  // ── Clear V31 Dungeon ──
  function dev31ClearDungeon(dungeonId, clearerName) {
    const dg = _data.dungeons.find(d => d.id === dungeonId);
    if (!dg || dg.status === "cleared") return null;

    dg.bossDefeated = true;
    dg.status       = "cleared";
    dg.clearedYear  = window.year || 0;
    dg.totalClears++;
    if (!dg.firstClearBy) dg.firstClearBy = clearerName;
    dg.clearLog.push(`Năm ${window.year||0}: ${clearerName} thám hiểm xong.`);

    _data.cleared.unshift({ name: dg.name, icon: dg.icon, boss: dg.boss, clearerName, year: window.year || 0 });
    if (_data.cleared.length > 100) _data.cleared.pop();
    _data.totalClear++;

    const loot = typeof wbv31GenerateLoot === "function" ? wbv31GenerateLoot(dg.rewards, "epic") : [];
    dg.explorers.push({ name: clearerName, result: "clear", year: window.year||0 });

    if (typeof addLog === "function") addLog(`🏆 ${clearerName} thám hiểm ${dg.icon} ${dg.name} · Hạ boss ${dg.boss}! Nhận: ${loot.slice(0,2).map(l=>l.display||l.name).join(", ")}`, "important");
    if (typeof addTimeline === "function") addTimeline(`🏆 ${clearerName} hạ boss ${dg.boss}`, "important", "🏆");
    if (typeof lhv31RecordDungeon === "function") lhv31RecordDungeon(dg, clearerName);

    _save();
    return loot;
  }

  // ── Auto NPC exploration ──
  function _autoExplore() {
    const active = _data.dungeons.filter(d => d.status === "active");
    if (!active.length) return;
    const npcs = (window.npcs || []).filter(n => n.status === "alive" && n.realm >= 2);
    if (!npcs.length) return;

    active.forEach(dg => {
      if (Math.random() > 0.08) return;
      const npc = npcs[Math.floor(Math.random() * npcs.length)];
      dg.totalAttempts++;
      const power  = (npc.realm||0)*150 + (npc.attack||0) + (npc.defense||0);
      const needed = dg.floors * 200;
      if (power > needed * 0.6 && Math.random() < 0.5) {
        dev31ClearDungeon(dg.id, npc.name);
      }
    });
  }

  // ── Tick ──
  function _tick() {
    if (!window.world) return;
    _data.tick++;
    _autoExplore();
    // Spawn dungeon every ~100 ticks
    if (_data.tick % 100 === 0) {
      dev31GenerateDungeon();
    }
    _save();
  }

  // ── Render Panel ──
  function dev31RenderPanel() {
    const el = document.getElementById("panel-dungeon-v31");
    if (!el) return;
    const active  = _data.dungeons.filter(d => d.status === "active");
    const cleared = _data.cleared.slice(0, 20);

    el.innerHTML = `
    <div style="padding:12px;max-width:900px;margin:0 auto">
      <div style="font-family:var(--font-title);font-size:18px;color:var(--gold);margin-bottom:12px">🏛 Dungeon Engine V31 — Hầm Ngục Mở Rộng</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">
        <div style="background:rgba(250,204,21,0.08);border:1px solid rgba(250,204,21,0.2);border-radius:8px;padding:10px;text-align:center">
          <div style="color:var(--gold);font-size:20px;font-weight:700">${_data.totalGen}</div>
          <div style="color:var(--white-dim);font-size:10px">Tổng Sinh Ra</div>
        </div>
        <div style="background:rgba(250,204,21,0.08);border:1px solid rgba(250,204,21,0.2);border-radius:8px;padding:10px;text-align:center">
          <div style="color:#4ade80;font-size:20px;font-weight:700">${_data.totalClear}</div>
          <div style="color:var(--white-dim);font-size:10px">Đã Hoàn Thành</div>
        </div>
        <div style="background:rgba(250,204,21,0.08);border:1px solid rgba(250,204,21,0.2);border-radius:8px;padding:10px;text-align:center">
          <div style="color:#f87171;font-size:20px;font-weight:700">${active.length}</div>
          <div style="color:var(--white-dim);font-size:10px">Đang Mở</div>
        </div>
      </div>

      <div style="margin-bottom:8px">
        <button onclick="dev31GenerateDungeon()" style="background:rgba(250,204,21,0.12);border:1px solid rgba(250,204,21,0.3);color:var(--gold);border-radius:6px;padding:6px 14px;cursor:pointer;font-size:12px;margin-right:6px">⚡ Sinh Dungeon Mới</button>
      </div>

      <div style="color:var(--gold);font-size:12px;letter-spacing:1px;margin-bottom:8px">🏛 DUNGEON ĐANG MỞ (${active.length})</div>
      ${active.length === 0 ? `<div style="color:var(--white-dim);font-size:12px;padding:20px;text-align:center">Không có dungeon nào đang mở.</div>` : ""}
      ${active.map(dg => `
        <div style="background:rgba(0,0,0,0.4);border:1px solid ${dg.color||'#444'}55;border-radius:10px;padding:12px;margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <div style="color:${dg.color};font-size:15px;font-weight:700">${dg.icon} ${dg.name}</div>
            <span style="background:${dg.color}22;color:${dg.color};border:1px solid ${dg.color}55;border-radius:4px;padding:2px 8px;font-size:10px">${dg.type.replace("_"," ").toUpperCase()}</span>
          </div>
          <div style="font-size:10px;color:var(--white-dim);margin-bottom:4px">${dg.desc}</div>
          <div style="font-size:10px;color:#a78bfa;margin-bottom:4px">Boss: ${dg.boss} · ${dg.floors} tầng · Năm ${dg.discoveredYear}</div>
          <div style="font-size:10px;color:var(--white-dim)">Thử thách: ${dg.totalAttempts} · Hoàn thành: ${dg.totalClears}</div>
          <div style="margin-top:8px">
            ${dg.layout.slice(0,5).map(f=>`
              <span style="display:inline-block;background:rgba(255,255,255,0.06);border-radius:4px;padding:2px 6px;font-size:9px;color:var(--white-dim);margin:2px">
                ${f.isBoss ? '👑' : '⚔️'} Tầng ${f.floor}${f.trap?' · ⚠️':''}</span>
            `).join("")}
            ${dg.floors > 5 ? `<span style="font-size:10px;color:var(--white-dim)">... +${dg.floors-5} tầng</span>` : ""}
          </div>
        </div>
      `).join("")}

      <div style="color:var(--gold);font-size:12px;letter-spacing:1px;margin:12px 0 8px">🏆 DUNGEON ĐÃ HOÀN THÀNH (${cleared.length})</div>
      <div style="max-height:220px;overflow-y:auto">
        ${cleared.map(c=>`
          <div style="display:flex;justify-content:space-between;font-size:11px;padding:5px 8px;border-bottom:1px solid rgba(255,255,255,0.05)">
            <span style="color:var(--white-main)">${c.icon} ${c.name}</span>
            <span style="color:#4ade80">🏆 ${c.clearerName} · Năm ${c.year}</span>
          </div>
        `).join("")}
      </div>
    </div>`;
  }

  window.dev31GenerateDungeon = dev31GenerateDungeon;
  window.dev31ClearDungeon    = dev31ClearDungeon;
  window.dev31RenderPanel     = dev31RenderPanel;
  window.dev31Data            = _data;

  function _init() {
    _load();
    const _orig = window.gameTick;
    window.gameTick = function() {
      if (typeof _orig === "function") _orig();
      _tick();
    };
    console.log("[DungeonEngineV31] 🏛 Dungeon Engine V31 — 6 loại · Tự sinh · Floor layout sẵn sàng.");
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(_init, 3400));
  } else {
    setTimeout(_init, 3400);
  }
})();
