(function() {
  "use strict";

  var SAVE_KEY = "cgv6_first_creation_v91";
  var fceData = { completed: false, worldName: "", worldType: "", description: "" };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(fceData)); } catch(e) {}
  }
  function load() {
    try { var d = localStorage.getItem(SAVE_KEY); if (d) fceData = JSON.parse(d); } catch(e) {}
  }

  // ── STEP STATE ───────────────────────────────────────────────────────
  var _step = 1;
  var _draft = { name: "", type: "fantasy", desc: "" };

  var WORLD_TYPES = [
    { key: "fantasy",     icon: "⚔️",  label: "Fantasy",    desc: "Phép thuật, rồng, anh hùng",       genre: "fantasy",    templateKey: "fantasy"     },
    { key: "scifi",       icon: "🚀",  label: "Sci-Fi",     desc: "Không gian, công nghệ, tương lai",   genre: "scifi",      templateKey: "scifi"       },
    { key: "modern",      icon: "🌆",  label: "Modern",     desc: "Thế giới hiện đại, bí ẩn ẩn náu",   genre: "custom",     templateKey: "cultivation" },
    { key: "mythology",   icon: "⚡",  label: "Mythology",  desc: "Thần thoại, sử thi, anh hùng cổ đại",genre: "mythology",  templateKey: "mythology"   },
    { key: "cultivation", icon: "☯️",  label: "Tu Tiên",    desc: "Tu luyện, cảnh giới, bất tử",       genre: "cultivation", templateKey: "cultivation" },
    { key: "custom",      icon: "✨",  label: "Custom",     desc: "Thế giới theo ý tưởng của bạn",     genre: "custom",     templateKey: "cultivation" }
  ];

  // ── STYLES ───────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('fce-style')) return;
    var s = document.createElement('style');
    s.id = 'fce-style';
    s.textContent = [
      '@keyframes fce-fade-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }',
      '@keyframes fce-pulse-ring { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.12);opacity:1} }',
      '@keyframes fce-shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }',
      '@keyframes fce-twinkle { 0%,100%{opacity:.05} 50%{opacity:.9} }',
      '@keyframes fce-step-in { from{opacity:0;transform:translateX(28px)} to{opacity:1;transform:translateX(0)} }',
      '@keyframes fce-genesis-burst { 0%{transform:scale(0);opacity:0} 20%{opacity:1} 100%{transform:scale(6);opacity:0} }',
      '@keyframes fce-text-rise { 0%{opacity:0;transform:translateY(18px) scale(0.94)} 100%{opacity:1;transform:translateY(0) scale(1)} }',
      '@keyframes fce-glow-pulse { 0%,100%{text-shadow:0 0 30px #a78bfa44} 50%{text-shadow:0 0 70px #a78bfa,0 0 120px #7c3aed66} }',
      '@keyframes fce-bar-fill { from{width:0} to{width:var(--w)} }',

      '#fce-overlay { position:fixed;inset:0;z-index:2147483647;background:#020408;display:flex;align-items:center;justify-content:center;font-family:"Noto Serif SC",serif; }',
      '#fce-bg-canvas { position:absolute;inset:0;width:100%;height:100%; }',

      '.fce-wrap { position:relative;z-index:2;width:100%;max-width:580px;padding:0 20px; }',
      '.fce-card { background:rgba(7,14,28,0.92);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);border:1px solid rgba(124,58,237,0.2);border-radius:20px;padding:44px 48px;animation:fce-fade-up .5s ease both; }',
      '.fce-brand { text-align:center;margin-bottom:36px; }',
      '.fce-brand-icon { font-size:36px;margin-bottom:10px;animation:fce-pulse-ring 3s ease-in-out infinite; }',
      '.fce-brand-title { font-size:11px;color:#7c3aed;letter-spacing:4px;text-transform:uppercase; }',
      '.fce-brand-sub { font-size:22px;color:#c4b5fd;margin-top:8px;font-weight:300;letter-spacing:.5px; }',

      '.fce-step-bar { display:flex;gap:6px;margin-bottom:32px; }',
      '.fce-step-dot { flex:1;height:3px;border-radius:99px;background:#0d1e35;transition:all .35s ease; }',
      '.fce-step-dot.active { background:linear-gradient(90deg,#7c3aed,#a78bfa); }',
      '.fce-step-dot.done { background:#4c1d95; }',

      '.fce-step { animation:fce-step-in .3s ease both; }',
      '.fce-label { font-size:10px;color:#4a5568;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px; }',
      '.fce-heading { font-size:24px;color:#e2e8f0;font-weight:300;margin-bottom:6px;line-height:1.3; }',
      '.fce-sub { font-size:13px;color:#334155;margin-bottom:28px;line-height:1.7; }',

      '.fce-input { width:100%;box-sizing:border-box;background:rgba(13,17,30,0.8);border:1px solid #1e293b;border-radius:12px;padding:16px 20px;font-size:20px;color:#e2e8f0;font-family:"Noto Serif SC",serif;outline:none;transition:border-color .2s,box-shadow .2s; }',
      '.fce-input:focus { border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.15); }',
      '.fce-input::placeholder { color:#1e293b;font-size:16px; }',

      '.fce-textarea { width:100%;box-sizing:border-box;background:rgba(13,17,30,0.8);border:1px solid #1e293b;border-radius:12px;padding:16px 20px;font-size:14px;color:#e2e8f0;font-family:"Noto Serif SC",serif;outline:none;transition:border-color .2s,box-shadow .2s;resize:vertical;min-height:100px; }',
      '.fce-textarea:focus { border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.15); }',
      '.fce-textarea::placeholder { color:#1e293b; }',

      '.fce-types { display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:4px; }',
      '.fce-type-btn { background:rgba(13,17,30,0.8);border:1px solid #0d1e35;border-radius:12px;padding:16px 10px;text-align:center;cursor:pointer;transition:all .18s;font-family:"Noto Serif SC",serif; }',
      '.fce-type-btn:hover { border-color:#7c3aed44;background:#0d1b2e; }',
      '.fce-type-btn.selected { border-color:#7c3aed;background:rgba(124,58,237,.1);box-shadow:0 0 0 1px #7c3aed22; }',
      '.fce-type-icon { font-size:22px;margin-bottom:7px; }',
      '.fce-type-name { font-size:12px;color:#94a3b8;font-weight:500;margin-bottom:3px; }',
      '.fce-type-desc { font-size:9px;color:#1e293b;line-height:1.4; }',

      '.fce-btn-row { display:flex;gap:10px;margin-top:32px; }',
      '.fce-btn-back { flex:0 0 auto;padding:14px 22px;border-radius:12px;border:1px solid #1e293b;background:transparent;color:#4a5568;cursor:pointer;font-size:13px;font-family:"Noto Serif SC",serif;transition:all .15s; }',
      '.fce-btn-back:hover { border-color:#334155;color:#64748b; }',
      '.fce-btn-next { flex:1;padding:16px;border-radius:12px;border:none;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#e2e8f0;font-size:15px;font-family:"Noto Serif SC",serif;cursor:pointer;transition:all .18s;letter-spacing:.3px; }',
      '.fce-btn-next:hover { background:linear-gradient(135deg,#8b5cf6,#6d28d9);transform:translateY(-1px);box-shadow:0 8px 24px rgba(124,58,237,.35); }',
      '.fce-btn-next:disabled { opacity:.4;cursor:not-allowed;transform:none;box-shadow:none; }',
      '.fce-btn-create { flex:1;padding:18px;border-radius:14px;border:none;background:linear-gradient(135deg,#facc15,#d97706);color:#0a0500;font-size:16px;font-family:"Noto Serif SC",serif;cursor:pointer;font-weight:700;transition:all .2s;letter-spacing:.5px; }',
      '.fce-btn-create:hover { transform:translateY(-2px);box-shadow:0 12px 32px rgba(250,204,21,.4); }',

      '#fce-genesis { position:fixed;inset:0;z-index:2147483648;background:#000;display:flex;align-items:center;justify-content:center;flex-direction:column; }',
      '#fce-genesis-canvas { position:absolute;inset:0;width:100%;height:100%; }',
      '.fce-genesis-text { position:relative;z-index:2;text-align:center;pointer-events:none; }',
      '.fce-genesis-name { font-size:52px;font-weight:200;color:#e2e8f0;letter-spacing:2px;opacity:0;animation:fce-text-rise .8s ease 1.2s both,fce-glow-pulse 3s ease 2s infinite; }',
      '.fce-genesis-label { font-size:11px;color:#7c3aed;letter-spacing:5px;text-transform:uppercase;opacity:0;animation:fce-text-rise .6s ease .8s both; }',
      '.fce-genesis-sub { font-size:14px;color:#4a5568;margin-top:14px;opacity:0;animation:fce-text-rise .6s ease 1.8s both; }',

      '#fce-jarvis-toast { position:fixed;bottom:36px;right:36px;z-index:2147483646;max-width:340px;background:rgba(7,17,35,0.96);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(59,130,246,.3);border-radius:16px;padding:20px 22px;animation:fce-fade-up .5s ease both;font-family:"Noto Serif SC",serif; }',
      '.fce-jarvis-header { display:flex;align-items:center;gap:10px;margin-bottom:10px; }',
      '.fce-jarvis-dot { width:8px;height:8px;border-radius:50%;background:#3b82f6;box-shadow:0 0 8px #3b82f6;animation:fce-pulse-ring 2s ease-in-out infinite; }',
      '.fce-jarvis-name { font-size:10px;color:#3b82f6;letter-spacing:2px;text-transform:uppercase; }',
      '.fce-jarvis-msg { font-size:13px;color:#94a3b8;line-height:1.75; }',
      '.fce-jarvis-close { position:absolute;top:12px;right:14px;background:transparent;border:none;color:#1e293b;cursor:pointer;font-size:16px;padding:2px 6px; }',
      '.fce-jarvis-close:hover { color:#4a5568; }'
    ].join('\n');
    document.head.appendChild(s);
  }

  // ── BACKGROUND STAR CANVAS ────────────────────────────────────────────
  function startBgCanvas(canvasId) {
    var canvas = document.getElementById(canvasId);
    if (!canvas || !canvas.getContext) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var stars = [];
    for (var i = 0; i < 160; i++) {
      stars.push({ x: Math.random()*W, y: Math.random()*H, r: 0.3+Math.random()*1.4, b: 0.05+Math.random()*0.5, ph: Math.random()*6.28 });
    }
    var t = 0;
    var raf;
    function draw() {
      t += 0.008;
      ctx.clearRect(0, 0, W, H);
      var bg = ctx.createRadialGradient(W*.5, H*.5, 0, W*.5, H*.5, Math.max(W,H)*.7);
      bg.addColorStop(0,   '#060c1e');
      bg.addColorStop(0.5, '#040912');
      bg.addColorStop(1,   '#020508');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      stars.forEach(function(st) {
        var a = st.b * (0.4 + 0.6 * Math.sin(t * 0.6 + st.ph));
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, 6.283);
        ctx.fillStyle = 'rgba(180,195,255,' + a.toFixed(2) + ')';
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return function() { cancelAnimationFrame(raf); };
  }

  // ── GENESIS CANVAS ANIMATION ─────────────────────────────────────────
  function runGenesisAnimation(worldName, onComplete) {
    var overlay = document.createElement('div');
    overlay.id = 'fce-genesis';
    overlay.innerHTML = '<canvas id="fce-genesis-canvas"></canvas>'
      + '<div class="fce-genesis-text">'
      + '<div class="fce-genesis-label">Vũ Trụ Khai Sinh</div>'
      + '<div class="fce-genesis-name">' + worldName + '</div>'
      + '<div class="fce-genesis-sub">Thiên Đạo đã chứng kiến sự ra đời của thế giới này.</div>'
      + '</div>';
    document.body.appendChild(overlay);

    var canvas = document.getElementById('fce-genesis-canvas');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var cx = W / 2, cy = H / 2;
    var t = 0;
    var maxT = 260;
    var raf;

    // Particles
    var particles = [];
    for (var i = 0; i < 320; i++) {
      var angle = Math.random() * 6.283;
      var speed = 0.4 + Math.random() * 3.8;
      var delay = Math.random() * 40;
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r:  0.5 + Math.random() * 2.5,
        h:  200 + Math.random() * 80,
        b:  0.4 + Math.random() * 0.6,
        delay: delay,
        life: 120 + Math.random() * 100
      });
    }

    // Rings
    var rings = [
      { r: 0, maxR: Math.max(W,H) * 0.5, speed: 2.8, alpha: 0.7, color: '124,58,237' },
      { r: 0, maxR: Math.max(W,H) * 0.6, speed: 2.0, alpha: 0.5, color: '167,139,250', delay: 18 },
      { r: 0, maxR: Math.max(W,H) * 0.7, speed: 1.4, alpha: 0.3, color: '250,204,21',  delay: 36 }
    ];

    function draw() {
      t++;
      ctx.clearRect(0, 0, W, H);

      // Space bg
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);

      // Expanding light burst at center
      var burstR = Math.min(t * 4, Math.max(W,H) * 0.55);
      var burstA = Math.max(0, 1 - burstR / (Math.max(W,H) * 0.55));
      if (t < 60) {
        var bGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, burstR);
        bGrad.addColorStop(0, 'rgba(200,170,255,' + (burstA * 0.9).toFixed(2) + ')');
        bGrad.addColorStop(0.3, 'rgba(124,58,237,' + (burstA * 0.5).toFixed(2) + ')');
        bGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, burstR, 0, 6.283);
        ctx.fill();
      }

      // Rings
      rings.forEach(function(ring) {
        var rt = t - (ring.delay || 0);
        if (rt <= 0) return;
        ring.r = Math.min(ring.r + ring.speed, ring.maxR);
        var ra = ring.alpha * Math.max(0, 1 - ring.r / ring.maxR);
        if (ra < 0.01) return;
        ctx.beginPath();
        ctx.arc(cx, cy, ring.r, 0, 6.283);
        ctx.strokeStyle = 'rgba(' + ring.color + ',' + ra.toFixed(3) + ')';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Nebula wash — builds up
      var nebulaA = Math.min(t / 80, 1) * 0.22;
      var nGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W,H) * 0.6);
      nGrad.addColorStop(0,   'rgba(80,20,160,' + (nebulaA).toFixed(3) + ')');
      nGrad.addColorStop(0.4, 'rgba(40,10,100,' + (nebulaA*0.4).toFixed(3) + ')');
      nGrad.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = nGrad;
      ctx.fillRect(0, 0, W, H);

      // Particles
      particles.forEach(function(p) {
        var pt = t - p.delay;
        if (pt <= 0) return;
        var progress = pt / p.life;
        if (progress > 1) return;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.995;
        p.vy *= 0.995;
        var a = p.b * Math.sin(progress * Math.PI);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = 'hsla(' + p.h + ',70%,72%,' + a.toFixed(2) + ')';
        ctx.fill();
      });

      // Core white orb — pulses
      var coreA = 0.7 + 0.3 * Math.sin(t * 0.18);
      var coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28 + 8 * Math.sin(t * 0.12));
      coreGrad.addColorStop(0,   'rgba(255,255,255,' + coreA.toFixed(2) + ')');
      coreGrad.addColorStop(0.4, 'rgba(200,160,255,0.5)');
      coreGrad.addColorStop(1,   'rgba(100,30,200,0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 32 + 8 * Math.sin(t * 0.12), 0, 6.283);
      ctx.fill();

      // Hard white center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, 6.283);
      ctx.fillStyle = '#fff';
      ctx.fill();

      if (t < maxT) {
        raf = requestAnimationFrame(draw);
      } else {
        // Fade out overlay
        overlay.style.transition = 'opacity .8s ease';
        overlay.style.opacity = '0';
        setTimeout(function() {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          if (typeof onComplete === 'function') onComplete();
        }, 850);
      }
    }
    draw();
  }

  // ── JARVIS TOAST ─────────────────────────────────────────────────────
  function showJarvisToast(worldName) {
    var existing = document.getElementById('fce-jarvis-toast');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

    var toast = document.createElement('div');
    toast.id = 'fce-jarvis-toast';
    toast.innerHTML = '<button class="fce-jarvis-close" onclick="this.parentNode.remove()">✕</button>'
      + '<div class="fce-jarvis-header">'
      + '<div class="fce-jarvis-dot"></div>'
      + '<div class="fce-jarvis-name">JARVIS · Trợ Lý AI</div>'
      + '</div>'
      + '<div class="fce-jarvis-msg">'
      + 'Chào mừng, Creator.<br>'
      + 'Thế giới <strong style="color:#a78bfa">' + worldName + '</strong> đã được khai sinh.<br><br>'
      + '<span style="font-size:11px;color:#1e3a5f">Tôi sẽ theo dõi sự tiến hóa và báo cáo cho bạn về mọi sự kiện quan trọng.</span>'
      + '</div>';
    document.body.appendChild(toast);

    setTimeout(function() {
      if (toast.parentNode) {
        toast.style.transition = 'opacity .6s ease';
        toast.style.opacity = '0';
        setTimeout(function() { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 650);
      }
    }, 8000);
  }

  // ── RENDER STEPS ─────────────────────────────────────────────────────
  function renderStepBar(container) {
    var bar = container.querySelector('.fce-step-bar');
    if (!bar) return;
    var dots = bar.querySelectorAll('.fce-step-dot');
    dots.forEach(function(d, i) {
      d.className = 'fce-step-dot' + (i+1 < _step ? ' done' : i+1 === _step ? ' active' : '');
    });
  }

  function renderStep(container) {
    var stepArea = container.querySelector('#fce-step-area');
    if (!stepArea) return;
    stepArea.innerHTML = '';
    stepArea.className = 'fce-step';

    if (_step === 1) {
      stepArea.innerHTML = '<div class="fce-label">Bước 1 / 4</div>'
        + '<div class="fce-heading">Đặt tên cho thế giới của bạn</div>'
        + '<div class="fce-sub">Một cái tên để vũ trụ nhận ra thế giới này từ muôn vàn chiều không gian khác.</div>'
        + '<input id="fce-name-input" class="fce-input" type="text" maxlength="40" placeholder="Tên thế giới của bạn..." value="' + _draft.name + '" />'
        + '<div class="fce-btn-row">'
        + '<button class="fce-btn-next" id="fce-next-1" onclick="fceNext(1)">Tiếp Theo →</button>'
        + '</div>';
      setTimeout(function() {
        var inp = document.getElementById('fce-name-input');
        if (inp) {
          inp.focus();
          inp.addEventListener('input', function() { _draft.name = this.value.trim(); });
          inp.addEventListener('keydown', function(e) { if (e.key === 'Enter') fceNext(1); });
        }
      }, 60);

    } else if (_step === 2) {
      var typesHtml = '<div class="fce-types">';
      WORLD_TYPES.forEach(function(wt) {
        var sel = _draft.type === wt.key ? ' selected' : '';
        typesHtml += '<div class="fce-type-btn' + sel + '" onclick="fceSelectType(\'' + wt.key + '\')">'
          + '<div class="fce-type-icon">' + wt.icon + '</div>'
          + '<div class="fce-type-name">' + wt.label + '</div>'
          + '<div class="fce-type-desc">' + wt.desc + '</div>'
          + '</div>';
      });
      typesHtml += '</div>';

      stepArea.innerHTML = '<div class="fce-label">Bước 2 / 4</div>'
        + '<div class="fce-heading">Loại thế giới</div>'
        + '<div class="fce-sub">Chọn bản chất cơ bản cho vũ trụ của bạn.</div>'
        + typesHtml
        + '<div class="fce-btn-row">'
        + '<button class="fce-btn-back" onclick="fceBack(2)">← Quay lại</button>'
        + '<button class="fce-btn-next" onclick="fceNext(2)">Tiếp Theo →</button>'
        + '</div>';

    } else if (_step === 3) {
      stepArea.innerHTML = '<div class="fce-label">Bước 3 / 4</div>'
        + '<div class="fce-heading">Mô tả thế giới</div>'
        + '<div class="fce-sub">Một vài câu để khai sáng bản chất của vũ trụ này. <span style="color:#1e293b">(Có thể bỏ qua)</span></div>'
        + '<textarea id="fce-desc-input" class="fce-textarea" placeholder="Ví dụ: Một thế giới nơi con người tu luyện để đạt đến bất tử...">' + _draft.desc + '</textarea>'
        + '<div class="fce-btn-row">'
        + '<button class="fce-btn-back" onclick="fceBack(3)">← Quay lại</button>'
        + '<button class="fce-btn-next" onclick="fceNext(3)">Tiếp Theo →</button>'
        + '</div>';
      setTimeout(function() {
        var ta = document.getElementById('fce-desc-input');
        if (ta) ta.addEventListener('input', function() { _draft.desc = this.value; });
      }, 60);

    } else if (_step === 4) {
      var chosenType = WORLD_TYPES.find(function(wt) { return wt.key === _draft.type; }) || WORLD_TYPES[0];
      stepArea.innerHTML = '<div class="fce-label">Bước 4 / 4 · Xác Nhận</div>'
        + '<div class="fce-heading">Khai Sinh Thế Giới</div>'
        + '<div class="fce-sub" style="margin-bottom:24px">Bạn sắp tạo ra một vũ trụ mới. Hành động này không thể đảo ngược.</div>'
        + '<div style="background:rgba(124,58,237,.06);border:1px solid rgba(124,58,237,.18);border-radius:14px;padding:22px;margin-bottom:4px">'
        + '<div style="display:flex;flex-direction:column;gap:12px">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;border-bottom:1px solid rgba(124,58,237,.1)">'
        + '<span style="font-size:10px;color:#4a5568;letter-spacing:1.5px">TÊN THẾ GIỚI</span>'
        + '<span style="font-size:17px;color:#c4b5fd;font-weight:300">' + _draft.name + '</span>'
        + '</div>'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<span style="font-size:10px;color:#4a5568;letter-spacing:1.5px">LOẠI</span>'
        + '<span style="font-size:13px;color:#94a3b8">' + chosenType.icon + ' ' + chosenType.label + '</span>'
        + '</div>'
        + (_draft.desc ? '<div style="padding-top:10px;border-top:1px solid rgba(124,58,237,.1)">'
          + '<div style="font-size:10px;color:#4a5568;letter-spacing:1.5px;margin-bottom:6px">MÔ TẢ</div>'
          + '<div style="font-size:12px;color:#4a5568;line-height:1.7">' + _draft.desc.substring(0, 80) + '</div>'
          + '</div>' : '')
        + '</div>'
        + '</div>'
        + '<div class="fce-btn-row">'
        + '<button class="fce-btn-back" onclick="fceBack(4)">← Quay lại</button>'
        + '<button class="fce-btn-create" onclick="fceCreate()">✨ Khai Sinh Thế Giới</button>'
        + '</div>';
    }
  }

  // ── GLOBAL CONTROLS ──────────────────────────────────────────────────
  window.fceNext = function(fromStep) {
    if (fromStep === 1) {
      var inp = document.getElementById('fce-name-input');
      if (inp) _draft.name = inp.value.trim();
      if (!_draft.name) {
        if (inp) { inp.style.borderColor = '#ef4444'; inp.focus(); }
        return;
      }
    }
    if (fromStep === 3) {
      var ta = document.getElementById('fce-desc-input');
      if (ta) _draft.desc = ta.value;
    }
    _step = fromStep + 1;
    var container = document.getElementById('fce-overlay');
    if (container) { renderStepBar(container); renderStep(container); }
  };

  window.fceBack = function(fromStep) {
    _step = fromStep - 1;
    var container = document.getElementById('fce-overlay');
    if (container) { renderStepBar(container); renderStep(container); }
  };

  window.fceSelectType = function(key) {
    _draft.type = key;
    var btns = document.querySelectorAll('.fce-type-btn');
    btns.forEach(function(b) { b.classList.remove('selected'); });
    var allTypes = document.querySelectorAll('.fce-type-btn');
    WORLD_TYPES.forEach(function(wt, i) {
      if (wt.key === key && allTypes[i]) allTypes[i].classList.add('selected');
    });
  };

  window.fceCreate = function() {
    var chosenType = WORLD_TYPES.find(function(wt) { return wt.key === _draft.type; }) || WORLD_TYPES[0];

    // Dismiss the wizard overlay
    var overlay = document.getElementById('fce-overlay');
    if (overlay) {
      overlay.style.transition = 'opacity .4s ease';
      overlay.style.opacity = '0';
      setTimeout(function() {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 420);
    }

    // Run Genesis animation
    setTimeout(function() {
      runGenesisAnimation(_draft.name, function() {
        // After animation: create the actual world
        _doCreateWorld(chosenType);

        // Save completion
        fceData.completed = true;
        fceData.worldName = _draft.name;
        fceData.worldType = _draft.type;
        fceData.description = _draft.desc;
        save();

        // Re-render PUOS My Universe (now has a world)
        var main = document.getElementById('puos-main');
        if (main && typeof puosRenderMyUniverse === 'function') {
          setTimeout(function() { puosRenderMyUniverse(main); }, 200);
        }

        // Jarvis greeting
        setTimeout(function() { showJarvisToast(_draft.name); }, 900);
      });
    }, 450);
  };

  function _doCreateWorld(chosenType) {
    // Populate classic DOM inputs (hidden in PUOS mode but still in DOM)
    var nameEl = document.getElementById('worldName');
    var genreEl = document.getElementById('genre');
    var tmplEl  = document.getElementById('worldTemplateKey');

    if (nameEl) nameEl.value = _draft.name;
    if (genreEl) genreEl.value = chosenType.genre;
    if (tmplEl)  tmplEl.value  = chosenType.templateKey;

    // Call app.js createWorld
    if (typeof window.createWorld === 'function') {
      try { window.createWorld(); } catch(e) { console.warn('[FCE] createWorld error:', e); }
      return;
    }

    // Fallback: set world directly if DOM inputs not available
    if (!window.world) {
      window.world = {
        name: _draft.name,
        genre: chosenType.genre,
        templateKey: chosenType.templateKey,
        createdYear: window.year || 1,
        currentEra: 'Khai Thiên Lập Địa',
        territories: []
      };
    }

    // Ensure simulation runs
    if (typeof window.simRunning !== 'undefined' && !window.simRunning) {
      if (typeof window.startSim === 'function') window.startSim();
    }

    // Log event
    if (typeof window.addLog === 'function') {
      window.addLog('🌍 Thiên Đạo khai sinh thế giới [' + _draft.name + '] — ' + chosenType.genre, 'important');
    }
    if (typeof window.htAddEvent === 'function') {
      window.htAddEvent({ year: window.year || 1, type: 'genesis', title: 'Khai Sinh Thế Giới: ' + _draft.name, color: '#a78bfa' });
    }
    if (typeof window.save === 'function') {
      try { window.save(); } catch(e) {}
    }
  }

  // ── MAIN: WELCOME SCREEN ─────────────────────────────────────────────
  function renderWelcomeExperience() {
    if (document.getElementById('fce-overlay')) return;
    injectStyles();

    var overlay = document.createElement('div');
    overlay.id = 'fce-overlay';

    var stepBarHtml = '<div class="fce-step-bar">';
    for (var i = 1; i <= 4; i++) {
      stepBarHtml += '<div class="fce-step-dot' + (i === 1 ? ' active' : '') + '"></div>';
    }
    stepBarHtml += '</div>';

    overlay.innerHTML = '<canvas id="fce-bg-canvas"></canvas>'
      + '<div class="fce-wrap">'
      + '<div class="fce-card">'
      + '<div class="fce-brand">'
      + '<div class="fce-brand-icon">⭕</div>'
      + '<div class="fce-brand-title">Creator God V6</div>'
      + '<div class="fce-brand-sub">Chào mừng, Đấng Tạo Hóa</div>'
      + '</div>'
      + stepBarHtml
      + '<div id="fce-step-area"></div>'
      + '</div>'
      + '</div>';

    document.body.appendChild(overlay);

    // Start background starfield
    setTimeout(function() { startBgCanvas('fce-bg-canvas'); }, 30);

    // Render step 1
    renderStep(overlay);
  }

  // ── HOOK INTO puosRenderMyUniverse ────────────────────────────────────
  function hookMyUniverse() {
    var _origRender = window.puosRenderMyUniverse;

    window.puosRenderMyUniverse = function(container) {
      // Has a world already? Render normally.
      if (window.world && window.world.name) {
        if (typeof _origRender === 'function') _origRender(container);
        return;
      }
      // No world yet — show welcome experience
      if (typeof _origRender === 'function') _origRender(container);
      // Slight delay so panel renders first, then overlay appears on top
      setTimeout(function() {
        renderWelcomeExperience();
      }, 120);
    };

    console.log('[FirstCreationExperience V91] ✨ Hook into puosRenderMyUniverse — 4-step wizard · Genesis Event · Jarvis greeting.');
  }

  // ── INIT ──────────────────────────────────────────────────────────────
  function init() {
    load();
    hookMyUniverse();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 24100); });
  } else {
    setTimeout(init, 24100);
  }
})();
