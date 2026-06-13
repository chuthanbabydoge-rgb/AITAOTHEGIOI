(function() {
  "use strict";
  // ============================================================
  // WORLD CINEMATIC ENGINE V63
  // Màn hình intro động khi khai sinh thế giới
  // Canvas particles · Chữ hiện dần · DNA reveal · Creator title
  // EXPAND ONLY · init: 12500ms · save: cgv6_world_cinematic_v63
  // ============================================================

  const SAVE_KEY = "cgv6_world_cinematic_v63";

  window.worldCinematicV63Data = {
    enabled: true,
    totalShown: 0,
    lastShown: null
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.worldCinematicV63Data)); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.worldCinematicV63Data = Object.assign(window.worldCinematicV63Data, JSON.parse(d));
    } catch(e) {}
  }

  // ─── GENRE CREATION TEXTS ──────────────────────────────────────────────────
  const CREATION_TEXTS = {
    cultivation: [
      "Thuở hỗn độn chưa phân...",
      "Đại Đạo ẩn nơi vô cực...",
      "Một tia Linh Khí xuyên qua hư không...",
      "Thiên Địa khai sinh!"
    ],
    fantasy: [
      "In the beginning, there was void...",
      "Then the first light split the darkness...",
      "Mountains rose, oceans formed...",
      "A world was born!"
    ],
    scifi: [
      "System initializing...",
      "Quantum parameters locked...",
      "Simulation matrix stabilizing...",
      "Universe online!"
    ],
    mythology: [
      "Before time, before gods, there was chaos...",
      "The titans stirred in the primordial dark...",
      "Divine fire struck the formless void...",
      "The world took shape!"
    ],
    zombie: [
      "The last broadcast fades to static...",
      "Silence falls across the shattered cities...",
      "In the ruins, something stirs...",
      "A new world begins!"
    ],
    custom: [
      "Từ hư vô, một ý niệm nảy sinh...",
      "Ý niệm đó mang theo sức mạnh khai thiên...",
      "Vũ trụ rung chuyển theo ý chí của Ngài...",
      "Thế giới mới ra đời!"
    ]
  };

  const GENRE_COLORS = {
    cultivation: { primary: "#f1c40f", secondary: "#e67e22", glow: "#f1c40f" },
    fantasy:     { primary: "#3498db", secondary: "#9b59b6", glow: "#3498db" },
    scifi:       { primary: "#2ecc71", secondary: "#1abc9c", glow: "#00ff88" },
    mythology:   { primary: "#9b59b6", secondary: "#e74c3c", glow: "#c084fc" },
    zombie:      { primary: "#e74c3c", secondary: "#e67e22", glow: "#ff4444" },
    custom:      { primary: "#f1c40f", secondary: "#c084fc", glow: "#f1c40f" }
  };

  // ─── PARTICLE SYSTEM ─────────────────────────────────────────────────────────
  function createParticleSystem(canvas, colors) {
    const ctx    = canvas.getContext("2d");
    const W      = canvas.width;
    const H      = canvas.height;
    const particles = [];
    let   animId = null;
    let   running = true;

    function spawn(burst) {
      const count = burst ? 40 : 2;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = burst ? (Math.random() * 4 + 2) : (Math.random() * 1.5 + 0.5);
        const isGold = Math.random() > 0.4;
        particles.push({
          x: W / 2 + (burst ? (Math.random() - 0.5) * W * 0.5 : (Math.random() - 0.5) * W * 0.8),
          y: H / 2 + (burst ? (Math.random() - 0.5) * H * 0.4 : H * 0.3 + Math.random() * H * 0.2),
          vx: Math.cos(angle) * speed * (burst ? 1 : 0.3),
          vy: -(Math.abs(Math.sin(angle)) * speed + (burst ? 1 : 0.5)),
          size: burst ? (Math.random() * 4 + 1) : (Math.random() * 2.5 + 0.5),
          alpha: 1,
          decay: burst ? (Math.random() * 0.012 + 0.008) : (Math.random() * 0.006 + 0.003),
          color: isGold ? colors.primary : colors.secondary,
          type: burst ? (Math.random() > 0.5 ? "star" : "circle") : "circle"
        });
      }
    }

    function drawStar(ctx, x, y, r, color, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.translate(x, y);
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
        else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);

      // Passive spawn
      if (Math.random() < 0.7) spawn(false);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy *= 0.99;
        p.vx *= 0.995;
        p.alpha -= p.decay;
        if (p.alpha <= 0) { particles.splice(i, 1); continue; }

        if (p.type === "star") {
          drawStar(ctx, p.x, p.y, p.size, p.color, p.alpha);
        } else {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.shadowBlur  = 8;
          ctx.shadowColor = p.color;
          ctx.fillStyle   = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(tick);
    }

    return {
      start:   function() { tick(); },
      burst:   function() { spawn(true); },
      stop:    function() { running = false; if (animId) cancelAnimationFrame(animId); },
      resize:  function(w, h) { canvas.width = w; canvas.height = h; }
    };
  }

  // ─── INJECT CSS ──────────────────────────────────────────────────────────────
  function injectCSS() {
    if (document.getElementById("wce63-style")) return;
    const s = document.createElement("style");
    s.id = "wce63-style";
    s.textContent = `
      #wce63-overlay {
        position: fixed; inset: 0; z-index: 99999;
        background: #000;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        overflow: hidden;
        opacity: 0; transition: opacity 0.6s ease;
        font-family: 'Noto Serif SC', 'Cinzel', serif;
      }
      #wce63-overlay.visible { opacity: 1; }

      #wce63-canvas {
        position: absolute; inset: 0; pointer-events: none;
      }

      #wce63-content {
        position: relative; z-index: 2;
        text-align: center; max-width: 600px; padding: 20px;
        display: flex; flex-direction: column; align-items: center; gap: 16px;
      }

      .wce63-text-line {
        font-size: 18px; color: #94a3b8;
        opacity: 0; transform: translateY(20px);
        transition: opacity 0.8s ease, transform 0.8s ease;
        font-style: italic; letter-spacing: 1px;
      }
      .wce63-text-line.show { opacity: 1; transform: translateY(0); }
      .wce63-text-line.last { color: #f1c40f; font-size: 22px; font-weight: bold; font-style: normal; }

      #wce63-world-name {
        font-size: 40px; font-weight: 900; letter-spacing: 4px;
        opacity: 0; transform: scale(0.7);
        transition: opacity 1s ease, transform 1s cubic-bezier(0.34,1.56,0.64,1);
        text-shadow: 0 0 30px currentColor, 0 0 60px currentColor;
        font-family: 'Cinzel Decorative', 'Cinzel', serif;
      }
      #wce63-world-name.show { opacity: 1; transform: scale(1); }

      #wce63-dna {
        font-family: 'Courier New', monospace;
        font-size: 14px; letter-spacing: 3px;
        opacity: 0; transform: translateX(-30px);
        transition: opacity 0.8s ease, transform 0.8s ease;
        padding: 8px 16px; border-radius: 6px;
        border: 1px solid rgba(241,196,15,0.3);
        background: rgba(241,196,15,0.05);
      }
      #wce63-dna.show { opacity: 1; transform: translateX(0); }

      #wce63-creator {
        font-size: 13px; letter-spacing: 2px; text-transform: uppercase;
        opacity: 0; transition: opacity 1s ease;
      }
      #wce63-creator.show { opacity: 1; }

      #wce63-hero {
        font-size: 12px; color: #94a3b8;
        opacity: 0; transition: opacity 0.8s ease;
        font-style: italic;
      }
      #wce63-hero.show { opacity: 1; }

      #wce63-enter-btn {
        margin-top: 8px; padding: 12px 32px;
        background: transparent;
        border: 2px solid currentColor;
        border-radius: 8px; cursor: pointer;
        font-size: 15px; font-weight: bold;
        letter-spacing: 2px;
        opacity: 0; transform: translateY(10px);
        transition: opacity 0.6s ease, transform 0.6s ease, background 0.3s, box-shadow 0.3s;
        font-family: 'Noto Serif SC', serif;
      }
      #wce63-enter-btn.show { opacity: 1; transform: translateY(0); }
      #wce63-enter-btn:hover {
        background: rgba(255,255,255,0.1);
        box-shadow: 0 0 20px currentColor;
      }

      #wce63-skip {
        position: absolute; top: 16px; right: 20px;
        color: #475569; background: transparent; border: none;
        cursor: pointer; font-size: 11px; letter-spacing: 1px;
        z-index: 3; transition: color 0.2s;
        font-family: 'Noto Serif SC', serif;
      }
      #wce63-skip:hover { color: #94a3b8; }

      #wce63-progress {
        position: absolute; bottom: 0; left: 0;
        height: 2px; background: currentColor;
        width: 0%; transition: width 8s linear;
        opacity: 0.5;
      }
      #wce63-progress.run { width: 100%; }

      @keyframes wce63-pulse {
        0%,100% { text-shadow: 0 0 20px currentColor, 0 0 40px currentColor; }
        50%      { text-shadow: 0 0 40px currentColor, 0 0 80px currentColor, 0 0 120px currentColor; }
      }
      #wce63-world-name.show { animation: wce63-pulse 2s ease-in-out infinite; }
    `;
    document.head.appendChild(s);
  }

  // ─── BUILD OVERLAY DOM ───────────────────────────────────────────────────────
  function buildOverlay(config) {
    // Remove existing overlay if any
    const existing = document.getElementById("wce63-overlay");
    if (existing) existing.remove();

    const genre    = config.templateKey || config.genre || "cultivation";
    const colors   = GENRE_COLORS[genre] || GENRE_COLORS.cultivation;
    const texts    = CREATION_TEXTS[genre] || CREATION_TEXTS.cultivation;
    const worldName = config.worldName || (window.world && window.world.name) || "Thế Giới Mới";
    const dna      = (window.worldDNAData && window.worldDNAData.dna) || "CGV6-??-??-R??N??-????????";
    const creator  = (window.worldDNAData && window.worldDNAData.creatorTitle) || "World Founder";
    const hero     = (window.originStoryData && window.originStoryData.firstHero) ? "⭐ " + window.originStoryData.firstHero.name + " — " + window.originStoryData.firstHero.title : "";
    const myth     = (window.originStoryData && window.originStoryData.mythology) ? '"' + window.originStoryData.mythology.title + '"' : "";

    const overlay  = document.createElement("div");
    overlay.id     = "wce63-overlay";

    // Canvas for particles
    const canvas   = document.createElement("canvas");
    canvas.id      = "wce63-canvas";
    canvas.width   = window.innerWidth;
    canvas.height  = window.innerHeight;

    // Content wrapper
    const content  = document.createElement("div");
    content.id     = "wce63-content";

    // Text lines
    const textHtml = texts.map(function(t, i) {
      return '<div class="wce63-text-line' + (i === texts.length - 1 ? " last" : "") + '" id="wce63-line-' + i + '" style="color:' + (i === texts.length - 1 ? colors.primary : "#94a3b8") + '">' + t + '</div>';
    }).join("");

    content.innerHTML = `
      ${textHtml}
      <div id="wce63-world-name" style="color:${colors.primary};">${worldName}</div>
      <div id="wce63-dna" style="color:${colors.primary};">🧬 ${dna}</div>
      <div id="wce63-creator" style="color:${colors.secondary};">👑 ${creator}</div>
      ${hero ? '<div id="wce63-hero">⭐ ' + (window.originStoryData && window.originStoryData.firstHero ? window.originStoryData.firstHero.name + " — " + window.originStoryData.firstHero.title : "") + '</div>' : ''}
      ${myth ? '<div id="wce63-hero" style="color:#64748b;font-size:11px;font-style:italic;">📖 ' + myth + '</div>' : ''}
      <button id="wce63-enter-btn" style="color:${colors.primary};border-color:${colors.primary};">✨ Bước Vào Thế Giới</button>
    `;

    // Skip button
    const skip = document.createElement("button");
    skip.id = "wce63-skip";
    skip.textContent = "BỎ QUA ×";

    // Progress bar
    const progress = document.createElement("div");
    progress.id = "wce63-progress";
    progress.style.color = colors.primary;

    overlay.appendChild(canvas);
    overlay.appendChild(content);
    overlay.appendChild(skip);
    overlay.appendChild(progress);
    document.body.appendChild(overlay);

    return { overlay, canvas, colors, texts, worldName, dna, creator };
  }

  // ─── MAIN SHOW CINEMATIC ─────────────────────────────────────────────────────
  window.wce63ShowCinematic = function(config) {
    if (!window.worldCinematicV63Data.enabled) {
      // Cinematic disabled — just switch to preview
      if (typeof window.wcw62ShowTab === "function") window.wcw62ShowTab("preview");
      return;
    }

    injectCSS();
    config = config || {};

    const { overlay, canvas, colors, texts } = buildOverlay(config);
    const particles = createParticleSystem(canvas, colors);

    let dismissed = false;
    let autoTimer = null;

    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      particles.stop();
      overlay.style.opacity = "0";
      overlay.style.transition = "opacity 0.8s ease";
      clearTimeout(autoTimer);
      setTimeout(function() {
        overlay.remove();
        // Switch to preview tab after cinematic
        if (typeof window.wcw62ShowTab === "function") window.wcw62ShowTab("preview");
      }, 800);
    }

    // Skip & Enter buttons
    document.getElementById("wce63-skip").onclick = dismiss;
    const enterBtn = document.getElementById("wce63-enter-btn");
    if (enterBtn) enterBtn.onclick = dismiss;

    // Resize canvas on window resize
    window.addEventListener("resize", function onResize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    // Start particle animation
    particles.start();

    // ── ANIMATION TIMELINE ────────────────────────────────────────────────────
    // Phase 1: Fade in overlay
    setTimeout(function() {
      overlay.classList.add("visible");
    }, 50);

    // Phase 2: Show text lines one by one
    texts.forEach(function(_, i) {
      setTimeout(function() {
        const el = document.getElementById("wce63-line-" + i);
        if (el) el.classList.add("show");
      }, 600 + i * 900);
    });

    // Phase 3: Particle burst when last text appears
    const lastTextTime = 600 + (texts.length - 1) * 900;
    setTimeout(function() { particles.burst(); }, lastTextTime + 300);
    setTimeout(function() { particles.burst(); }, lastTextTime + 600);

    // Phase 4: World name appears
    setTimeout(function() {
      const el = document.getElementById("wce63-world-name");
      if (el) {
        el.classList.add("show");
        particles.burst();
      }
    }, lastTextTime + 1000);

    // Phase 5: DNA appears
    setTimeout(function() {
      const el = document.getElementById("wce63-dna");
      if (el) el.classList.add("show");
    }, lastTextTime + 1800);

    // Phase 6: Creator title
    setTimeout(function() {
      const el = document.getElementById("wce63-creator");
      if (el) el.classList.add("show");
    }, lastTextTime + 2400);

    // Phase 7: Hero/Myth lines
    setTimeout(function() {
      document.querySelectorAll("#wce63-hero").forEach(function(el) {
        el.classList.add("show");
      });
    }, lastTextTime + 2900);

    // Phase 8: Enter button
    const enterTime = lastTextTime + 3400;
    setTimeout(function() {
      if (enterBtn) enterBtn.classList.add("show");
      // Start progress bar (auto-dismiss timer)
      const bar = document.getElementById("wce63-progress");
      if (bar) {
        bar.style.color = colors.primary;
        setTimeout(function() { bar.classList.add("run"); }, 50);
      }
      // Auto-dismiss after 8 seconds from enter button appearing
      autoTimer = setTimeout(dismiss, 8000);
    }, enterTime);

    // Track stats
    window.worldCinematicV63Data.totalShown++;
    window.worldCinematicV63Data.lastShown = new Date().toISOString();
    save();

    console.log("[WorldCinematicV63] 🎬 Cinematic started for:", config.worldName || "unknown");
  };

  // ─── TOGGLE ─────────────────────────────────────────────────────────────────
  window.wce63Toggle = function() {
    window.worldCinematicV63Data.enabled = !window.worldCinematicV63Data.enabled;
    save();
    const state = window.worldCinematicV63Data.enabled ? "BẬT" : "TẮT";
    if (typeof window.toast === "function") window.toast("🎬 Cinematic Intro: " + state);
  };

  window.wce63IsEnabled = function() { return window.worldCinematicV63Data.enabled; };

  // ─── INIT ────────────────────────────────────────────────────────────────────
  function init() {
    load();
    injectCSS();
    console.log("[WorldCinematicV63] 🎬 World Cinematic Engine V63 — Canvas particles · Animated text · DNA reveal · Creator title · init: 12500ms · Khởi động thành công.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 12500); });
  } else {
    setTimeout(init, 12500);
  }

})();
