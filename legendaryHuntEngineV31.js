/* ============================================================
   LEGENDARY HUNT ENGINE V31 — Hệ Thống Săn Boss Huyền Thoại
   legendaryHuntEngineV31.js
   Load AFTER: worldBossEngineV31.js
   EXPAND ONLY — NEVER DELETE — NEVER REPLACE
   ============================================================ */
(function () {
  "use strict";

  const SAVE_KEY = "cgv6_hunt_v31";

  let _data = {
    records: {
      firstKills:    [],  // { bossName, killerName, year, tier }
      fastestKills:  [],  // { bossName, killerName, year, ticksToKill, tier }
      mostDamage:    [],  // { killerName, totalDamage, bossesKilled }
      guildContrib:  [],  // { guildName, totalKills, totalDamage }
    },
    hunters:    {},   // hunterName → { kills, damage, firstKills, dungeons }
    dungeons:   [],   // cleared dungeon records
    hunts:      [],   // all hunt events
    totalKills: 0,
    tick:       0,
  };

  function _save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(_data)); } catch(e) {} }
  function _load() {
    try {
      const s = localStorage.getItem(SAVE_KEY);
      if (s) { const p = JSON.parse(s); Object.assign(_data, p); }
    } catch(e) {}
  }

  // ── Record a Boss Kill ──
  function lhv31RecordKill(boss, killerName) {
    if (!boss || !killerName) return;
    _data.totalKills++;

    // Update hunter stats
    if (!_data.hunters[killerName]) {
      _data.hunters[killerName] = { kills:0, damage:0, firstKills:[], dungeons:0 };
    }
    _data.hunters[killerName].kills++;

    // First Kill record
    const alreadyFirst = _data.records.firstKills.find(r => r.bossName === boss.name);
    if (!alreadyFirst) {
      const rec = { bossName: boss.name, bossIcon: boss.icon||"👹", tier: boss.tier, killerName, year: window.year||0 };
      _data.records.firstKills.unshift(rec);
      _data.hunters[killerName].firstKills.push(boss.name);
      if (typeof addLog === "function") addLog(`🎖️ FIRST KILL! ${killerName} lần đầu tiêu diệt ${boss.icon||""} ${boss.name} [${boss.tier}]!`, "important");
    }

    // Fastest Kill — track by ticks alive
    const ticksAlive = boss.ticksAlive || 999;
    const fastIdx    = _data.records.fastestKills.findIndex(r => r.bossName === boss.name);
    if (fastIdx === -1 || _data.records.fastestKills[fastIdx].ticksToKill > ticksAlive) {
      const rec = { bossName: boss.name, bossIcon: boss.icon||"👹", tier: boss.tier, killerName, year: window.year||0, ticksToKill: ticksAlive };
      if (fastIdx === -1) _data.records.fastestKills.unshift(rec);
      else _data.records.fastestKills[fastIdx] = rec;
    }

    // Most Damage leaderboard
    const dmgRec = _data.records.mostDamage.find(r => r.killerName === killerName);
    if (dmgRec) { dmgRec.bossesKilled++; dmgRec.totalDamage += boss.damageDealt||0; }
    else _data.records.mostDamage.push({ killerName, bossesKilled:1, totalDamage: boss.damageDealt||0 });
    _data.records.mostDamage.sort((a,b) => b.bossesKilled - a.bossesKilled);
    if (_data.records.mostDamage.length > 50) _data.records.mostDamage.pop();

    // Hunt log
    _data.hunts.unshift({ bossName: boss.name, bossIcon: boss.icon||"👹", tier: boss.tier, killerName, year: window.year||0 });
    if (_data.hunts.length > 200) _data.hunts.pop();

    _save();
  }

  // ── Record Dungeon Clear ──
  function lhv31RecordDungeon(dungeon, clearerName) {
    if (!dungeon || !clearerName) return;
    _data.dungeons.unshift({ name: dungeon.name, icon: dungeon.icon||"🏛", type: dungeon.type||"?", clearerName, year: window.year||0 });
    if (_data.dungeons.length > 100) _data.dungeons.pop();
    if (_data.hunters[clearerName]) _data.hunters[clearerName].dungeons++;
    else _data.hunters[clearerName] = { kills:0, damage:0, firstKills:[], dungeons:1 };
    _save();
  }

  // ── Render Panel ──
  function lhv31RenderPanel() {
    const el = document.getElementById("panel-hunt-v31");
    if (!el) return;

    const topHunters = Object.entries(_data.hunters)
      .sort((a,b) => b[1].kills - a[1].kills)
      .slice(0, 20);
    const recentHunts= _data.hunts.slice(0, 30);
    const firstKills = _data.records.firstKills.slice(0, 20);
    const fastest    = _data.records.fastestKills.slice(0, 10);

    el.innerHTML = `
    <div style="padding:12px;max-width:900px;margin:0 auto">
      <div style="font-family:var(--font-title);font-size:18px;color:var(--gold);margin-bottom:12px">🏆 Legendary Hunt V31 — Bảng Xếp Hạng Săn Boss</div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
        <div style="background:rgba(250,204,21,0.08);border:1px solid rgba(250,204,21,0.2);border-radius:8px;padding:10px;text-align:center">
          <div style="color:var(--gold);font-size:20px;font-weight:700">${_data.totalKills}</div>
          <div style="color:var(--white-dim);font-size:10px">Tổng Boss Đã Hạ</div>
        </div>
        <div style="background:rgba(250,204,21,0.08);border:1px solid rgba(250,204,21,0.2);border-radius:8px;padding:10px;text-align:center">
          <div style="color:var(--gold);font-size:20px;font-weight:700">${_data.records.firstKills.length}</div>
          <div style="color:var(--white-dim);font-size:10px">First Kill Records</div>
        </div>
        <div style="background:rgba(250,204,21,0.08);border:1px solid rgba(250,204,21,0.2);border-radius:8px;padding:10px;text-align:center">
          <div style="color:var(--gold);font-size:20px;font-weight:700">${_data.dungeons.length}</div>
          <div style="color:var(--white-dim);font-size:10px">Dungeon Đã Khám Phá</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
        <div>
          <div style="color:var(--gold);font-size:12px;letter-spacing:1px;margin-bottom:6px">🥇 BẢNG XẾP HẠNG SĂN BOSS</div>
          <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.08);border-radius:8px;overflow:hidden">
            ${topHunters.length === 0 ? `<div style="color:var(--white-dim);font-size:12px;padding:10px">Chưa có dữ liệu.</div>` : ""}
            ${topHunters.map(([name, h], i)=>`
              <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:11px">
                <div>
                  <span style="color:${i===0?'#facc15':i===1?'#94a3b8':i===2?'#fb923c':'var(--white-dim)'};font-weight:700">${i===0?'👑':i===1?'🥈':i===2?'🥉':`${i+1}.`}</span>
                  <span style="color:var(--white-main);margin-left:4px">${name}</span>
                </div>
                <div style="color:var(--gold)">${h.kills} kills · ${h.dungeons} dungeons</div>
              </div>
            `).join("")}
          </div>
        </div>
        <div>
          <div style="color:var(--gold);font-size:12px;letter-spacing:1px;margin-bottom:6px">🎖️ FIRST KILL RECORDS</div>
          <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.08);border-radius:8px;max-height:200px;overflow-y:auto">
            ${firstKills.length === 0 ? `<div style="color:var(--white-dim);font-size:12px;padding:10px">Chưa có first kill nào.</div>` : ""}
            ${firstKills.map(r=>`
              <div style="padding:5px 10px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:10px">
                <span style="color:var(--gold)">${r.bossIcon} ${r.bossName}</span>
                <span style="color:var(--white-dim);margin-left:4px">[${r.tier}]</span>
                <div style="color:#4ade80">First: ${r.killerName} · Năm ${r.year}</div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>

      <div style="color:var(--gold);font-size:12px;letter-spacing:1px;margin-bottom:6px">⚡ FASTEST KILLS</div>
      <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.08);border-radius:8px;margin-bottom:14px">
        ${fastest.length === 0 ? `<div style="color:var(--white-dim);font-size:12px;padding:10px">Chưa có dữ liệu.</div>` : ""}
        ${fastest.map(r=>`
          <div style="display:flex;justify-content:space-between;font-size:10px;padding:5px 10px;border-bottom:1px solid rgba(255,255,255,0.05)">
            <span style="color:var(--white-main)">${r.bossIcon} ${r.bossName} [${r.tier}]</span>
            <span style="color:#60a5fa">${r.killerName} · ${r.ticksToKill} ticks · Năm ${r.year}</span>
          </div>
        `).join("")}
      </div>

      <div style="color:var(--gold);font-size:12px;letter-spacing:1px;margin-bottom:6px">📜 SĂNG BOSS GẦN ĐÂY</div>
      <div style="max-height:200px;overflow-y:auto;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.08);border-radius:8px">
        ${recentHunts.length === 0 ? `<div style="color:var(--white-dim);font-size:12px;padding:10px">Chưa có hunt nào.</div>` : ""}
        ${recentHunts.map(h=>`
          <div style="display:flex;justify-content:space-between;font-size:10px;padding:5px 10px;border-bottom:1px solid rgba(255,255,255,0.05)">
            <span style="color:var(--white-main)">${h.bossIcon} ${h.bossName} [${h.tier}]</span>
            <span style="color:#4ade80">${h.killerName} · Năm ${h.year}</span>
          </div>
        `).join("")}
      </div>
    </div>`;
  }

  window.lhv31RecordKill    = lhv31RecordKill;
  window.lhv31RecordDungeon = lhv31RecordDungeon;
  window.lhv31RenderPanel   = lhv31RenderPanel;
  window.lhv31Data          = _data;

  function _init() {
    _load();
    console.log("[LegendaryHuntV31] 🏆 Legendary Hunt Engine V31 — First Kill · Fastest · Rankings sẵn sàng.");
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(_init, 4200));
  } else {
    setTimeout(_init, 4200);
  }
})();
