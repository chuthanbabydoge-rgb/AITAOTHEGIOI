/* ============================================================
   BOSS EVOLUTION ENGINE V31 — Tiến Hóa Boss
   bossEvolutionEngineV31.js
   Load AFTER: worldBossEngineV31.js
   EXPAND ONLY — NEVER DELETE — NEVER REPLACE
   ============================================================ */
(function () {
  "use strict";

  const SAVE_KEY = "cgv6_bossevo_v31";

  const THREAT_LEVELS = [
    { key:"regional",    label:"Mối Đe Dọa Vùng",     icon:"🟡", color:"#facc15", ticksNeeded:30,  hpMult:1.3,  desc:"Ảnh hưởng một vùng nhỏ." },
    { key:"continental", label:"Mối Đe Dọa Lục Địa",  icon:"🟠", color:"#fb923c", ticksNeeded:80,  hpMult:2.0,  desc:"Ảnh hưởng toàn lục địa." },
    { key:"world",       label:"Mối Đe Dọa Thế Giới",  icon:"🔴", color:"#f87171", ticksNeeded:160, hpMult:3.5,  desc:"Đe dọa toàn bộ thế giới." },
    { key:"realm",       label:"Mối Đe Dọa Vũ Trụ",    icon:"🌌", color:"#e879f9", ticksNeeded:300, hpMult:10.0, desc:"Vượt qua ranh giới thế giới, đe dọa vũ trụ." },
  ];

  let _data = {
    evolutionLog: [],
    evolved:      [],
    totalEvolved: 0,
    tick:         0,
  };

  function _save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(_data)); } catch(e) {} }
  function _load() {
    try {
      const s = localStorage.getItem(SAVE_KEY);
      if (s) { const p = JSON.parse(s); Object.assign(_data, p); }
    } catch(e) {}
  }

  // ── Evolve a boss to next threat level ──
  function bevV31EvolveBoss(bossId) {
    const bossData = window.wbv31Data;
    if (!bossData) return false;
    const boss = bossData.bosses.find(b => b.id === bossId && b.status === "active");
    if (!boss) return false;

    const currentIdx = THREAT_LEVELS.findIndex(t => t.key === boss.threat);
    if (currentIdx >= THREAT_LEVELS.length - 1) return false; // Already at max

    const nextThreat = THREAT_LEVELS[currentIdx + 1];
    const prevThreat = THREAT_LEVELS[currentIdx];
    boss.threat   = nextThreat.key;
    boss.maxHp    = Math.floor(boss.maxHp * nextThreat.hpMult);
    boss.hp       = Math.floor(boss.hp * nextThreat.hpMult);

    _data.totalEvolved++;
    const entry = {
      bossId, bossName: boss.name, bossIcon: boss.icon,
      from: prevThreat.key, to: nextThreat.key,
      toLabel: nextThreat.label, toIcon: nextThreat.icon,
      year: window.year || 0,
    };
    _data.evolutionLog.unshift(entry);
    if (_data.evolutionLog.length > 100) _data.evolutionLog.pop();
    _data.evolved.unshift(entry);

    if (typeof addLog === "function") addLog(`${nextThreat.icon} Boss ${boss.name} tiến hóa thành ${nextThreat.label}! HP tăng ${nextThreat.hpMult}x!`, "important");
    if (typeof addTimeline === "function") addTimeline(`${nextThreat.icon} ${boss.name} → ${nextThreat.label}`, "death", nextThreat.icon);
    if (typeof toast === "function") toast(`${nextThreat.icon} ${boss.name} tiến hóa — ${nextThreat.label}!`);

    _save();
    return true;
  }

  // ── Called when boss is killed ──
  function bevV31OnBossKilled(bossId) {
    // Nothing needed — boss removed from active list by worldBossEngine
  }

  // ── Tick — check bosses for evolution ──
  function _tick() {
    if (!window.world) return;
    _data.tick++;
    const bossData = window.wbv31Data;
    if (!bossData) return;

    bossData.bosses.filter(b => b.status === "active").forEach(boss => {
      const currentIdx = THREAT_LEVELS.findIndex(t => t.key === boss.threat);
      if (currentIdx < 0 || currentIdx >= THREAT_LEVELS.length - 1) return;
      const needed = THREAT_LEVELS[currentIdx].ticksNeeded;
      if ((boss.ticksAlive || 0) >= needed && Math.random() < 0.02) {
        bevV31EvolveBoss(boss.id);
      }
    });

    if (_data.tick % 10 === 0) _save();
  }

  // ── Render Panel (embedded in worldboss panel) ──
  function bevV31RenderEvolutionLog(container) {
    if (!container) return;
    const log = _data.evolutionLog.slice(0, 20);
    container.innerHTML = `
      <div style="color:var(--gold);font-size:12px;letter-spacing:1px;margin-bottom:8px">🧬 LOG TIẾN HÓA BOSS (${log.length})</div>
      <div style="max-height:200px;overflow-y:auto">
        ${log.length === 0 ? `<div style="color:var(--white-dim);font-size:12px;padding:10px">Chưa có boss nào tiến hóa.</div>` : ""}
        ${log.map(e=>`
          <div style="display:flex;justify-content:space-between;font-size:11px;padding:5px 8px;border-bottom:1px solid rgba(255,255,255,0.05)">
            <span style="color:var(--white-main)">${e.bossIcon} ${e.bossName}</span>
            <span style="color:#fb923c">${e.toIcon} ${e.toLabel} · Năm ${e.year}</span>
          </div>
        `).join("")}
      </div>`;
  }

  window.bevV31EvolveBoss       = bevV31EvolveBoss;
  window.bevV31OnBossKilled     = bevV31OnBossKilled;
  window.bevV31RenderEvolutionLog = bevV31RenderEvolutionLog;
  window.bevV31Data             = _data;
  window.THREAT_LEVELS_V31      = THREAT_LEVELS;

  function _init() {
    _load();
    const _orig = window.gameTick;
    window.gameTick = function() {
      if (typeof _orig === "function") _orig();
      _tick();
    };
    console.log("[BossEvolutionV31] 🧬 Boss Evolution Engine V31 — Regional→Realm · Tự tiến hóa theo thời gian sẵn sàng.");
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(_init, 4000));
  } else {
    setTimeout(_init, 4000);
  }
})();
