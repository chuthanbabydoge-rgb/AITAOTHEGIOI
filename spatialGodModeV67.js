(function() {
  "use strict";

  // ════════════════════════════════════════
  // SPATIAL GOD MODE V67
  // Click trực tiếp trên bản đồ để thực hiện
  // divine actions: ban phước / thiên lôi / anh hùng / thiên tai
  // Extends V66 God Experience (KHÔNG ghi đè)
  // ════════════════════════════════════════

  window.spatialGodModeV67Data = {
    version: 67,
    active: false,
    selectedMode: "bless",    // bless / smite / hero / disaster / message / artifact
    selectedEntity: null,
    effectQueue: [],           // Visual effects to play
    lastAction: null,
    actionLog: [],
    frame: 0
  };

  // ════ GOD MODES ════
  const GOD_MODES = [
    { id:"bless",    icon:"✨", label:"Ban Phước",     color:"#4ade80",  desc:"Click sinh linh/quốc gia để ban phước" },
    { id:"smite",    icon:"⚡", label:"Thiên Lôi",      color:"#fbbf24",  desc:"Click để giáng thiên lôi" },
    { id:"hero",     icon:"⚔️", label:"Thức Tỉnh Anh Hùng", color:"#f59e0b", desc:"Click NPC để thức tỉnh anh hùng" },
    { id:"disaster", icon:"🌋", label:"Thiên Tai",      color:"#ef4444",  desc:"Click quốc gia để tạo thiên tai" },
    { id:"message",  icon:"📣", label:"Thần Ngôn",      color:"#c084fc",  desc:"Click để gửi lời thần linh" },
    { id:"artifact", icon:"💎", label:"Trao Thần Khí",  color:"#fbbf24",  desc:"Click NPC để trao thần khí" },
    { id:"prophecy", icon:"🔮", label:"Ban Tiên Tri",   color:"#818cf8",  desc:"Click mục tiêu để tạo tiên tri" },
    { id:"peace",    icon:"☮️", label:"Thiên Hòa",      color:"#34d399",  desc:"Click vùng chiến tranh để chấm dứt" }
  ];
  window.sgm67GetModes = function() { return GOD_MODES; };

  // ════ ENTITY SELECTED (from spatial/hologram map) ════
  window.sge67OnEntitySelect = function(entity) {
    window.spatialGodModeV67Data.selectedEntity = entity;
    _updateEntityDisplay(entity);
  };

  function _updateEntityDisplay(entity) {
    const display = document.getElementById("sge67-entity-info");
    if (!display) return;
    const mode = window.spatialGodModeV67Data.selectedMode;
    const gm = GOD_MODES.find(m => m.id === mode);
    display.innerHTML = `
      <div style="color:${entity.color||'#00f5ff'};font-weight:bold;font-size:14px">${entity.name}</div>
      <div style="color:#64748b;font-size:11px">${(entity.type||'?').toUpperCase()}</div>
      ${entity.data && entity.data.population ? `<div style="color:#94a3b8;font-size:11px">POP: ${entity.data.population}</div>` : ''}
      ${entity.data && entity.data.stability ? `<div style="color:#94a3b8;font-size:11px">STAB: ${entity.data.stability}%</div>` : ''}
      ${gm ? `<div style="color:${gm.color};font-size:11px;margin-top:6px">${gm.icon} Chế độ: ${gm.label}</div>` : ''}
    `;
  }

  // ════ EXECUTE GOD ACTION ════
  window.sgm67Execute = function(entityOverride) {
    const d = window.spatialGodModeV67Data;
    const entity = entityOverride || d.selectedEntity;
    const mode = d.selectedMode;

    if (!entity) return { ok: false, msg: "Chưa chọn mục tiêu. Click một thực thể trên bản đồ." };

    const targetName = entity.name;
    const targetType = entity.type === "empire" ? "nation" : entity.type === "npc" ? "npc" : "nation";

    let result = { ok: false, msg: "Hành động không được nhận dạng." };

    if (mode === "bless") {
      result = typeof window.div66Perform === "function"
        ? window.div66Perform("bless_nation", targetName, targetType)
        : { ok: true, msg: `✨ Ban phước cho ${targetName} (V66 chưa sẵn sàng).` };
    }

    if (mode === "smite") {
      const fn = entity.type === "npc" ? "smite" : "divine_wrath";
      result = typeof window.div66Perform === "function"
        ? window.div66Perform(fn, targetName, targetType)
        : { ok: true, msg: `⚡ Thiên lôi giáng xuống ${targetName} (V66 chưa sẵn sàng).` };
    }

    if (mode === "hero") {
      result = typeof window.mir66CastGrandMiracle === "function"
        ? window.mir66CastGrandMiracle("hero_awakening", targetName)
        : { ok: true, msg: `⚔️ Thức tỉnh anh hùng ${targetName} (V66 chưa sẵn sàng).` };
    }

    if (mode === "disaster") {
      result = typeof window.div66Perform === "function"
        ? window.div66Perform("divine_wrath", targetName, "nation")
        : { ok: true, msg: `🌋 Thiên tai ập xuống ${targetName}.` };
    }

    if (mode === "message") {
      const msgEl = document.getElementById("sgm67-message-input");
      const msg = msgEl ? msgEl.value : "Ta là Đấng Sáng Thế, ngươi phải nghe lời ta.";
      result = typeof window.divVoice66Send === "function"
        ? window.divVoice66Send(targetName, targetType, msg, "command")
        : { ok: true, msg: `📣 Thông điệp gửi đến ${targetName}.` };
    }

    if (mode === "artifact") {
      const artTmpls = typeof window.div66ArtGetTemplates === "function" ? window.div66ArtGetTemplates() : [];
      const selArtEl = document.getElementById("sgm67-artifact-select");
      const artId = selArtEl ? selArtEl.value : (artTmpls[0] ? artTmpls[0].id : null);
      if (artId) {
        result = typeof window.div66CreateArtifact === "function"
          ? window.div66CreateArtifact(artId, null, targetName)
          : { ok: true, msg: `💎 Trao thần khí cho ${targetName}.` };
      } else {
        result = { ok: false, msg: "Chọn thần khí trước." };
      }
    }

    if (mode === "prophecy") {
      result = typeof window.proph66Create === "function"
        ? window.proph66Create("destiny", targetName, null)
        : { ok: true, msg: `🔮 Tiên tri về ${targetName}.` };
    }

    if (mode === "peace") {
      result = typeof window.div66Perform === "function"
        ? window.div66Perform("divine_peace", targetName, "world")
        : { ok: true, msg: "☮️ Chiến tranh chấm dứt." };
    }

    // Log action
    const gm = GOD_MODES.find(m => m.id === mode);
    const entry = {
      year: window.year || 0,
      mode: mode,
      icon: gm ? gm.icon : "✨",
      target: targetName,
      result: result.msg,
      ok: result.ok
    };
    d.actionLog.push(entry);
    d.lastAction = entry;

    // Queue visual effect
    _queueEffect(entity, gm ? gm.color : "#00f5ff", gm ? gm.icon : "✨");

    // Update log display
    _updateActionLog();

    return result;
  };

  // ════ VISUAL EFFECT QUEUE ════
  function _queueEffect(entity, color, icon) {
    const eff = { entity, color, icon, age: 0, maxAge: 60 };
    window.spatialGodModeV67Data.effectQueue.push(eff);
    if (window.spatialGodModeV67Data.effectQueue.length > 10) {
      window.spatialGodModeV67Data.effectQueue.shift();
    }
  }

  // ════ RENDER GOD EFFECTS ON TOP OF MAP ════
  window.sgm67DrawEffects = function(ctx, canvasW, canvasH) {
    const d = window.spatialGodModeV67Data;
    d.frame++;

    d.effectQueue = d.effectQueue.filter(eff => eff.age < eff.maxAge);
    d.effectQueue.forEach(eff => {
      eff.age++;
      const progress = eff.age / eff.maxAge;
      const alpha = 1 - progress;

      // Expanding ring at entity position (approximate from spatialV67Data)
      const sd = window.spatialV67Data;
      if (!sd) return;
      const cx = canvasW / 2 + (sd.panX || 0);
      const cy = canvasH / 2 + (sd.panY || 0);
      const ringR = progress * 80;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = eff.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = eff.color;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.stroke();

      // Icon at center
      ctx.font = "24px monospace";
      ctx.textAlign = "center";
      ctx.fillText(eff.icon, cx, cy - 20 - progress * 30);

      ctx.restore();
    });
  };

  function _updateActionLog() {
    const el = document.getElementById("sgm67-action-log");
    if (!el) return;
    const d = window.spatialGodModeV67Data;
    const recent = d.actionLog.slice(-8).reverse();
    el.innerHTML = recent.map(e => {
      const gm = GOD_MODES.find(m => m.id === e.mode);
      return `<div style="font-size:11px;padding:3px 0;border-bottom:1px solid #1e293b;color:${e.ok ? '#94a3b8' : '#f87171'}">
        ${e.icon} <span style="color:${gm ? gm.color : '#00f5ff'}">${e.target}</span> · Năm ${e.year}
        <div style="color:#475569;font-size:10px">${e.result.substring(0, 60)}</div>
      </div>`;
    }).join('');
  }

  window.sgm67SetMode = function(modeId) {
    window.spatialGodModeV67Data.selectedMode = modeId;
    const entity = window.spatialGodModeV67Data.selectedEntity;
    if (entity) _updateEntityDisplay(entity);

    // Update mode button styles
    GOD_MODES.forEach(m => {
      const btn = document.getElementById("sgm67-btn-" + m.id);
      if (!btn) return;
      btn.style.borderColor = m.id === modeId ? m.color : "#334155";
      btn.style.color = m.id === modeId ? m.color : "#64748b";
    });
  };

  window.sgm67GetModeInfo = function() {
    const d = window.spatialGodModeV67Data;
    return GOD_MODES.find(m => m.id === d.selectedMode) || GOD_MODES[0];
  };

  function init() {
    console.log("[SpatialGodModeV67] ⚡ Spatial God Mode khởi động — click bản đồ để thực thi quyền năng thần linh.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 15000); });
  } else {
    setTimeout(init, 15000);
  }
})();
