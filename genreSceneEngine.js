(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════
  // GENRE SCENE ENGINE — V126
  // Cảnh nền động theo thể loại thế giới (Canvas 2D + rAF)
  // Inject vào PUOS My Universe panel
  // Init: 30700ms
  // ═══════════════════════════════════════════════════════════════

  var _canvas = null, _ctx = null, _raf = null;
  var _t = 0;          // frame counter
  var _genre = "cultivation";
  var _particles = [];
  var _entities  = [];
  var _initialized = false;

  // ── Detect genre từ world ────────────────────────────────────────
  function getGenre() {
    var w = window.world;
    if (!w) return "cultivation";
    var g = (w.genre || w.templateKey || "cultivation").toLowerCase();
    if (g.includes("sci")   || g.includes("future") || g.includes("space"))   return "scifi";
    if (g.includes("moder") || g.includes("city")   || g.includes("urban"))   return "modern";
    if (g.includes("myth")  || g.includes("god")    || g.includes("heaven"))  return "mythology";
    if (g.includes("fanta") || g.includes("magic")  || g.includes("elf"))     return "fantasy";
    return "cultivation"; // default: tu tiên
  }

  // ─────────────────────────────────────────────────────────────────
  // THEME DEFINITIONS
  // ─────────────────────────────────────────────────────────────────
  var THEMES = {

    // ── TU TIÊN ──────────────────────────────────────────────────
    cultivation: {
      label: "⚔️ Tu Tiên · Tiên Giới",
      bg: function(ctx, W, H, t) {
        // Sky gradient — deep indigo → purple
        var g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#050820");
        g.addColorStop(0.4, "#0d1240");
        g.addColorStop(0.75, "#1a0a30");
        g.addColorStop(1, "#2d0a10");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        // Moon
        var mx = W * 0.78, my = H * 0.18;
        var mg = ctx.createRadialGradient(mx, my, 0, mx, my, 60);
        mg.addColorStop(0, "rgba(240,220,255,0.95)");
        mg.addColorStop(0.3, "rgba(200,170,255,0.6)");
        mg.addColorStop(1, "rgba(100,80,200,0)");
        ctx.fillStyle = mg;
        ctx.beginPath(); ctx.arc(mx, my, 60, 0, Math.PI*2); ctx.fill();
        // Moon core
        ctx.fillStyle = "rgba(250,240,255,0.9)";
        ctx.beginPath(); ctx.arc(mx, my, 22, 0, Math.PI*2); ctx.fill();
      },
      initParticles: function(W, H) {
        var p = [];
        // Spirit energy orbs
        for (var i = 0; i < 80; i++) {
          p.push({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*2+0.5,
            vx: (Math.random()-0.5)*0.3, vy: -Math.random()*0.6-0.2,
            color: Math.random()>0.5 ? "rgba(150,220,255," : "rgba(200,150,255,",
            alpha: Math.random()*0.7+0.3, life: Math.random()*200 });
        }
        // Cultivators (flying dots)
        for (var i = 0; i < 12; i++) {
          var ang = Math.random()*Math.PI*2;
          p.push({ isCultivator:true, x: Math.random()*W, y: H*0.2+Math.random()*H*0.4,
            r: Math.random()*3+2, ang: ang, speed: Math.random()*0.8+0.3,
            orbitR: Math.random()*80+40, cx: Math.random()*W, cy: H*0.3+Math.random()*H*0.2,
            color: Math.random()>0.5 ? "#c0f0ff" : "#f0c0ff" });
        }
        return p;
      },
      drawParticles: function(ctx, particles, W, H, t) {
        particles.forEach(function(p) {
          if (p.isCultivator) {
            p.ang += p.speed * 0.01;
            p.x = p.cx + Math.cos(p.ang) * p.orbitR;
            p.y = p.cy + Math.sin(p.ang) * p.orbitR * 0.35;
            // Trail
            var tg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*4);
            tg.addColorStop(0, p.color);
            tg.addColorStop(1, "transparent");
            ctx.fillStyle = tg;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r*4, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
          } else {
            p.x += p.vx; p.y += p.vy; p.life--;
            if (p.life <= 0 || p.y < -10) {
              p.x = Math.random()*W; p.y = H+5;
              p.life = Math.random()*200+100;
            }
            var a = Math.min(p.alpha, p.life/30);
            ctx.fillStyle = p.color + a + ")";
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
          }
        });
      },
      drawForeground: function(ctx, W, H, t) {
        // Floating mountains
        drawMountainLayer(ctx, W, H, t, 0.08, "#1a1040", 3, 0.12);
        drawMountainLayer(ctx, W, H, t, 0.16, "#120d35", 5, 0.06);
        drawMountainLayer(ctx, W, H, t, 0.25, "#0f0a28", 7, 0.03);
        // Mist / fog
        for (var i = 0; i < 5; i++) {
          var mx = (i/5)*W + Math.sin(t*0.003+i)*30;
          var mg = ctx.createRadialGradient(mx, H*0.55, 0, mx, H*0.55, W*0.3);
          mg.addColorStop(0, "rgba(150,180,255,0.08)");
          mg.addColorStop(1, "transparent");
          ctx.fillStyle = mg;
          ctx.fillRect(0, 0, W, H);
        }
        // Pagoda silhouette
        drawPagoda(ctx, W*0.15, H*0.62, 0.7, t);
        drawPagoda(ctx, W*0.55, H*0.58, 0.5, t);
        // Ground mist
        var gg = ctx.createLinearGradient(0, H*0.75, 0, H);
        gg.addColorStop(0, "transparent");
        gg.addColorStop(1, "rgba(80,60,140,0.5)");
        ctx.fillStyle = gg;
        ctx.fillRect(0, H*0.75, W, H*0.25);
      }
    },

    // ── FANTASY ──────────────────────────────────────────────────
    fantasy: {
      label: "🧙 Fantasy · Thần Ma",
      bg: function(ctx, W, H, t) {
        var g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#030810");
        g.addColorStop(0.5, "#0a1520");
        g.addColorStop(1, "#061208");
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        // Aurora
        for (var i = 0; i < 3; i++) {
          var ax = W*(0.2+i*0.3), aw = W*0.35;
          var ag = ctx.createRadialGradient(ax, -20, 0, ax, H*0.4, H*0.6);
          var cols = [["rgba(0,200,100,0.15)","rgba(0,100,200,0.08)"],
                      ["rgba(150,0,200,0.12)","rgba(0,150,200,0.06)"],
                      ["rgba(0,180,150,0.1)","rgba(100,0,200,0.05)"]];
          ag.addColorStop(0, cols[i][0]);
          ag.addColorStop(1, cols[i][1]);
          ctx.fillStyle = ag; ctx.fillRect(0, 0, W, H);
        }
        // Stars
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        for (var i = 0; i < 150; i++) {
          var sx = (Math.sin(i*127.3)*0.5+0.5)*W;
          var sy = (Math.sin(i*319.7)*0.5+0.5)*H*0.6;
          var ss = (Math.sin(i*73.1+t*0.02)*0.5+0.5)*1.5+0.3;
          ctx.beginPath(); ctx.arc(sx, sy, ss, 0, Math.PI*2); ctx.fill();
        }
      },
      initParticles: function(W, H) {
        var p = [];
        for (var i = 0; i < 60; i++) {
          p.push({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*2+0.5,
            vx: (Math.random()-0.5)*0.4, vy: (Math.random()-0.5)*0.3,
            color: ["rgba(100,255,150,","rgba(200,100,255,","rgba(100,200,255,"][Math.floor(Math.random()*3)],
            alpha: Math.random()*0.6+0.2, pulse: Math.random()*Math.PI*2 });
        }
        // Dragons
        for (var i = 0; i < 2; i++) {
          p.push({ isDragon:true, t: Math.random()*1000, speed: 0.4+Math.random()*0.3,
            scale: 0.8+Math.random()*0.4 });
        }
        return p;
      },
      drawParticles: function(ctx, particles, W, H, t) {
        particles.forEach(function(p) {
          if (p.isDragon) {
            p.t += p.speed;
            var prog = (p.t % 600) / 600;
            var dx = -W*0.1 + prog * W*1.2;
            var dy = H*0.2 + Math.sin(prog*Math.PI*3)*H*0.12;
            drawDragonSimple(ctx, dx, dy, p.scale, t);
          } else {
            p.pulse += 0.04;
            var a = p.alpha * (0.7 + Math.sin(p.pulse)*0.3);
            p.x += p.vx; p.y += p.vy;
            if (p.x<0||p.x>W) p.vx*=-1;
            if (p.y<0||p.y>H) p.vy*=-1;
            ctx.fillStyle = p.color + a + ")";
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r*(0.8+Math.sin(p.pulse)*0.4), 0, Math.PI*2); ctx.fill();
          }
        });
      },
      drawForeground: function(ctx, W, H, t) {
        // Forest silhouette
        drawForest(ctx, W, H, t);
        // Castle
        drawCastle(ctx, W*0.5, H*0.65, 1.0, t);
        // Ground
        var gg = ctx.createLinearGradient(0, H*0.8, 0, H);
        gg.addColorStop(0, "transparent");
        gg.addColorStop(1, "rgba(5,20,8,0.8)");
        ctx.fillStyle = gg; ctx.fillRect(0, H*0.8, W, H*0.2);
      }
    },

    // ── SCI-FI ───────────────────────────────────────────────────
    scifi: {
      label: "🚀 Sci-Fi · Vũ Trụ",
      bg: function(ctx, W, H, t) {
        ctx.fillStyle = "#000005"; ctx.fillRect(0, 0, W, H);
        // Nebula
        var ng = ctx.createRadialGradient(W*0.3, H*0.3, 0, W*0.3, H*0.3, W*0.5);
        ng.addColorStop(0, "rgba(20,0,80,0.4)");
        ng.addColorStop(0.5, "rgba(80,0,40,0.15)");
        ng.addColorStop(1, "transparent");
        ctx.fillStyle = ng; ctx.fillRect(0, 0, W, H);
        var ng2 = ctx.createRadialGradient(W*0.7, H*0.5, 0, W*0.7, H*0.5, W*0.4);
        ng2.addColorStop(0, "rgba(0,30,100,0.3)");
        ng2.addColorStop(1, "transparent");
        ctx.fillStyle = ng2; ctx.fillRect(0, 0, W, H);
        // Stars
        for (var i = 0; i < 200; i++) {
          var sx = (Math.sin(i*231.7)*0.5+0.5)*W;
          var sy = (Math.cos(i*157.3)*0.5+0.5)*H;
          var ss = Math.random() < 0.05 ? 2 : 0.8;
          var sa = 0.5 + Math.sin(i+t*0.01)*0.4;
          ctx.fillStyle = "rgba(255,255,255,"+sa+")";
          ctx.beginPath(); ctx.arc(sx, sy, ss, 0, Math.PI*2); ctx.fill();
        }
        // Planet
        var px = W*0.72, py = H*0.28, pr = Math.min(W,H)*0.12;
        var pg = ctx.createRadialGradient(px-pr*0.3, py-pr*0.3, 0, px, py, pr);
        pg.addColorStop(0, "#4060c0");
        pg.addColorStop(0.5, "#203080");
        pg.addColorStop(1, "#0a1030");
        ctx.fillStyle = pg;
        ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI*2); ctx.fill();
        // Planet ring
        ctx.strokeStyle = "rgba(100,180,255,0.3)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(px, py, pr*1.7, pr*0.3, -0.3, 0, Math.PI*2);
        ctx.stroke();
        // Planet atmosphere glow
        var ag = ctx.createRadialGradient(px, py, pr*0.9, px, py, pr*1.4);
        ag.addColorStop(0, "transparent");
        ag.addColorStop(0.5, "rgba(80,120,255,0.15)");
        ag.addColorStop(1, "transparent");
        ctx.fillStyle = ag;
        ctx.beginPath(); ctx.arc(px, py, pr*1.4, 0, Math.PI*2); ctx.fill();
      },
      initParticles: function(W, H) {
        var p = [];
        // Star streaks
        for (var i = 0; i < 20; i++) {
          p.push({ isStreak:true, x: Math.random()*W, y: Math.random()*H*0.7,
            vx: Math.random()*3+1, len: Math.random()*30+10, alpha: Math.random()*0.5+0.2 });
        }
        // Satellites
        for (var i = 0; i < 3; i++) {
          p.push({ isSat:true, ang: Math.random()*Math.PI*2, r: 60+i*40, speed: 0.008-i*0.002,
            cx: W*0.72, cy: H*0.28 });
        }
        return p;
      },
      drawParticles: function(ctx, particles, W, H, t) {
        particles.forEach(function(p) {
          if (p.isStreak) {
            p.x -= p.vx;
            if (p.x < -50) { p.x = W+50; p.y = Math.random()*H*0.7; }
            ctx.strokeStyle = "rgba(150,200,255,"+p.alpha+")";
            ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x+p.len, p.y); ctx.stroke();
          } else if (p.isSat) {
            p.ang += p.speed;
            var sx = p.cx + Math.cos(p.ang)*p.r;
            var sy = p.cy + Math.sin(p.ang)*p.r*0.35;
            ctx.fillStyle = "#80d0ff";
            ctx.fillRect(sx-2, sy-1, 4, 2);
            ctx.fillStyle = "rgba(100,200,255,0.4)";
            ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI*2); ctx.fill();
          }
        });
      },
      drawForeground: function(ctx, W, H, t) {
        // Neon city skyline
        drawNeonCity(ctx, W, H, t);
        // Ground glow
        var gg = ctx.createLinearGradient(0, H*0.75, 0, H);
        gg.addColorStop(0, "rgba(0,30,80,0.5)");
        gg.addColorStop(1, "rgba(0,10,40,0.9)");
        ctx.fillStyle = gg; ctx.fillRect(0, H*0.75, W, H*0.25);
      }
    },

    // ── MODERN ───────────────────────────────────────────────────
    modern: {
      label: "🏙️ Hiện Đại · Đô Thị",
      bg: function(ctx, W, H, t) {
        // Night sky
        var g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#050810");
        g.addColorStop(0.6, "#0f1520");
        g.addColorStop(1, "#101218");
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        // Moon
        ctx.fillStyle = "rgba(255,240,200,0.9)";
        ctx.beginPath(); ctx.arc(W*0.85, H*0.15, 18, 0, Math.PI*2); ctx.fill();
        var mg = ctx.createRadialGradient(W*0.85, H*0.15, 0, W*0.85, H*0.15, 50);
        mg.addColorStop(0, "rgba(255,240,200,0.2)");
        mg.addColorStop(1, "transparent");
        ctx.fillStyle = mg; ctx.fillRect(0, 0, W, H);
      },
      initParticles: function(W, H) {
        var p = [];
        // Cars on road
        for (var i = 0; i < 15; i++) {
          p.push({ isCar:true, x: Math.random()*W, lane: Math.floor(Math.random()*2),
            speed: Math.random()*1.5+0.8, color: Math.random()>0.5?"rgba(255,200,100,0.9)":"rgba(200,50,50,0.9)" });
        }
        // Window lights blinking
        for (var i = 0; i < 40; i++) {
          p.push({ isLight:true, x: Math.random()*W, y: H*0.3+Math.random()*H*0.35,
            on: Math.random()>0.3, timer: Math.random()*300, period: Math.random()*200+100 });
        }
        return p;
      },
      drawParticles: function(ctx, particles, W, H, t) {
        var roadY = H*0.82;
        particles.forEach(function(p) {
          if (p.isCar) {
            p.x += p.speed * (p.lane===0 ? 1 : -1);
            if (p.x > W+20) p.x = -20;
            if (p.x < -20) p.x = W+20;
            var cy = roadY + (p.lane===0 ? -8 : 8);
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x-8, cy-3, 16, 6);
            // Headlights glow
            var hg = ctx.createRadialGradient(p.lane===0?p.x+10:p.x-10, cy, 0, p.lane===0?p.x+10:p.x-10, cy, 30);
            hg.addColorStop(0, p.lane===0?"rgba(255,200,100,0.4)":"rgba(200,50,50,0.4)");
            hg.addColorStop(1, "transparent");
            ctx.fillStyle = hg; ctx.fillRect(p.lane===0?p.x:p.x-40, cy-20, 40, 40);
          } else if (p.isLight) {
            p.timer--;
            if (p.timer <= 0) { p.on = !p.on; p.timer = p.period; }
            if (p.on) {
              ctx.fillStyle = "rgba(255,220,150,0.7)";
              ctx.fillRect(p.x, p.y, 3, 2);
            }
          }
        });
      },
      drawForeground: function(ctx, W, H, t) {
        drawCityscape(ctx, W, H, t);
        // Road
        var rg = ctx.createLinearGradient(0, H*0.8, 0, H);
        rg.addColorStop(0, "#151820");
        rg.addColorStop(1, "#0d1015");
        ctx.fillStyle = rg; ctx.fillRect(0, H*0.8, W, H*0.2);
        // Road lines
        ctx.strokeStyle = "rgba(255,255,100,0.3)";
        ctx.setLineDash([20,20]);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, H*0.82); ctx.lineTo(W, H*0.82); ctx.stroke();
        ctx.setLineDash([]);
      }
    },

    // ── MYTHOLOGY ────────────────────────────────────────────────
    mythology: {
      label: "⚡ Thần Thoại · Thiên Giới",
      bg: function(ctx, W, H, t) {
        var g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#100a00");
        g.addColorStop(0.3, "#201000");
        g.addColorStop(0.7, "#0a1520");
        g.addColorStop(1, "#050a10");
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        // Divine light rays
        for (var i = 0; i < 8; i++) {
          var ra = (i/8)*Math.PI*2 + t*0.002;
          var rx = W*0.5 + Math.cos(ra)*W;
          var ry = -H*0.2 + Math.sin(ra)*H*0.5;
          var rg = ctx.createLinearGradient(W*0.5, -H*0.2, rx, ry);
          rg.addColorStop(0, "rgba(255,200,50,0.12)");
          rg.addColorStop(1, "transparent");
          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.moveTo(W*0.5 - 5, -H*0.2);
          ctx.lineTo(W*0.5 + 5, -H*0.2);
          ctx.lineTo(rx+30, ry);
          ctx.lineTo(rx-30, ry);
          ctx.fill();
        }
        // Sun/orb
        var sg = ctx.createRadialGradient(W*0.5, -H*0.05, 0, W*0.5, -H*0.05, 100);
        sg.addColorStop(0, "rgba(255,220,100,0.9)");
        sg.addColorStop(0.3, "rgba(255,150,50,0.5)");
        sg.addColorStop(1, "transparent");
        ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H*0.4);
      },
      initParticles: function(W, H) {
        var p = [];
        // Gold sparks
        for (var i = 0; i < 100; i++) {
          p.push({ x: Math.random()*W, y: Math.random()*H, vx:(Math.random()-0.5)*1.5, vy:-Math.random()*2-0.5,
            r: Math.random()*2+0.5, color: Math.random()>0.5?"rgba(255,200,50,":"rgba(255,100,0,",
            alpha: Math.random()*0.8+0.2, life: Math.random()*150 });
        }
        // Lightning
        for (var i = 0; i < 4; i++) {
          p.push({ isLightning:true, active:false, timer: Math.random()*200+100, duration:8,
            x: Math.random()*W, segments:[] });
        }
        return p;
      },
      drawParticles: function(ctx, particles, W, H, t) {
        particles.forEach(function(p) {
          if (p.isLightning) {
            p.timer--;
            if (p.timer <= 0 && !p.active) {
              p.active = true; p.duration = 8+Math.floor(Math.random()*6);
              p.x = Math.random()*W;
              p.segments = [];
              var sy = -10; var sx = p.x;
              while (sy < H*0.65) {
                sy += 20+Math.random()*20;
                sx += (Math.random()-0.5)*40;
                p.segments.push([sx, sy]);
              }
            }
            if (p.active) {
              p.duration--;
              ctx.strokeStyle = "rgba(200,200,255,0.9)";
              ctx.lineWidth = 1.5;
              ctx.shadowColor = "#8080ff";
              ctx.shadowBlur = 8;
              ctx.beginPath(); ctx.moveTo(p.x, -10);
              p.segments.forEach(function(s) { ctx.lineTo(s[0], s[1]); });
              ctx.stroke();
              ctx.shadowBlur = 0;
              if (p.duration <= 0) { p.active = false; p.timer = Math.random()*300+200; }
            }
          } else {
            p.x += p.vx; p.y += p.vy; p.life--;
            if (p.life <= 0 || p.y < -10) {
              p.x = Math.random()*W; p.y = H+5;
              p.life = Math.random()*150+50;
            }
            var a = p.alpha * Math.min(1, p.life/20);
            ctx.fillStyle = p.color + a + ")";
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
          }
        });
      },
      drawForeground: function(ctx, W, H, t) {
        // Temple silhouette
        drawTemple(ctx, W, H, t);
        // Pillars
        for (var i = 0; i < 6; i++) {
          var px = W*(0.05+i*0.18);
          ctx.fillStyle = "rgba(30,20,5,0.8)";
          ctx.fillRect(px-6, H*0.45, 12, H*0.55);
          var ph = ctx.createLinearGradient(px, H*0.45, px, H*0.45+20);
          ph.addColorStop(0, "rgba(200,150,50,0.4)");
          ph.addColorStop(1, "transparent");
          ctx.fillStyle = ph;
          ctx.fillRect(px-8, H*0.44, 16, 20);
        }
        // Ground mist gold
        var gg = ctx.createLinearGradient(0, H*0.78, 0, H);
        gg.addColorStop(0, "transparent");
        gg.addColorStop(1, "rgba(60,40,10,0.8)");
        ctx.fillStyle = gg; ctx.fillRect(0, H*0.78, W, H*0.22);
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // SHARED DRAWING HELPERS
  // ─────────────────────────────────────────────────────────────────
  function drawMountainLayer(ctx, W, H, t, yRatio, color, seed, speed) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, H);
    var steps = 20;
    for (var i = 0; i <= steps; i++) {
      var x = (i/steps)*W;
      var y = H*yRatio + Math.sin(i*0.8+seed+t*speed)*H*0.08 + Math.cos(i*1.3+seed)*H*0.05;
      if (i===0) ctx.lineTo(x, H*0.9); else ctx.lineTo(x, y + H*0.45);
    }
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  }

  function drawPagoda(ctx, x, y, scale, t) {
    ctx.fillStyle = "rgba(15,8,30,0.9)";
    for (var i = 0; i < 5; i++) {
      var w = (50-i*8)*scale, h = 14*scale, ty = y-i*16*scale;
      ctx.fillRect(x-w/2, ty, w, h);
      ctx.fillRect(x-w*0.65, ty-3, w*1.3, 5*scale); // eave
    }
    ctx.fillRect(x-3*scale, y-5*16*scale, 6*scale, 20*scale); // spire
  }

  function drawDragonSimple(ctx, x, y, scale, t) {
    ctx.save();
    ctx.translate(x, y);
    var body = [];
    for (var i = 0; i < 8; i++) {
      body.push({ bx: -i*15*scale, by: Math.sin(t*0.05+i*0.8)*10*scale });
    }
    ctx.strokeStyle = "rgba(50,200,100,0.7)";
    ctx.lineWidth = 4*scale;
    ctx.lineCap = "round";
    ctx.beginPath();
    body.forEach(function(b, i) { i===0?ctx.moveTo(b.bx,b.by):ctx.lineTo(b.bx,b.by); });
    ctx.stroke();
    // Head
    ctx.fillStyle = "rgba(80,220,120,0.8)";
    ctx.beginPath(); ctx.arc(body[0].bx, body[0].by, 7*scale, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }

  function drawForest(ctx, W, H, t) {
    var treeColor = "#040d06";
    for (var i = 0; i < 30; i++) {
      var tx = (i/30)*W + (i%3)*10;
      var th = 60+Math.sin(i*7.3)*40;
      ctx.fillStyle = treeColor;
      ctx.beginPath();
      ctx.moveTo(tx, H*0.78);
      ctx.lineTo(tx-20, H);
      ctx.lineTo(tx+20, H);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(tx, H*0.78-th*0.4);
      ctx.lineTo(tx-16, H*0.78);
      ctx.lineTo(tx+16, H*0.78);
      ctx.closePath(); ctx.fill();
    }
  }

  function drawCastle(ctx, x, y, scale, t) {
    ctx.fillStyle = "rgba(8,12,8,0.95)";
    // Main tower
    ctx.fillRect(x-25*scale, y-80*scale, 50*scale, 80*scale);
    // Side towers
    ctx.fillRect(x-55*scale, y-55*scale, 30*scale, 55*scale);
    ctx.fillRect(x+25*scale, y-55*scale, 30*scale, 55*scale);
    // Battlements
    for (var i = 0; i < 5; i++) { ctx.fillRect(x-25*scale+i*12*scale, y-87*scale, 8*scale, 10*scale); }
    for (var i = 0; i < 3; i++) { ctx.fillRect(x-55*scale+i*12*scale, y-62*scale, 8*scale, 8*scale); }
    for (var i = 0; i < 3; i++) { ctx.fillRect(x+25*scale+i*12*scale, y-62*scale, 8*scale, 8*scale); }
    // Window glow
    var wg = ctx.createRadialGradient(x, y-50*scale, 0, x, y-50*scale, 20);
    wg.addColorStop(0, "rgba(200,150,50,0.5)");
    wg.addColorStop(1, "transparent");
    ctx.fillStyle = wg; ctx.fillRect(x-20, y-70*scale, 40, 40);
    ctx.fillStyle = "rgba(255,180,80,0.8)";
    ctx.fillRect(x-5*scale, y-55*scale, 10*scale, 14*scale);
  }

  function drawNeonCity(ctx, W, H, t) {
    var buildings = [
      {x:0.02,w:0.06,h:0.38,c:"#001020"},{x:0.09,w:0.05,h:0.52,c:"#000818"},
      {x:0.15,w:0.04,h:0.30,c:"#001018"},{x:0.2,w:0.08,h:0.62,c:"#000d20"},
      {x:0.29,w:0.06,h:0.45,c:"#000c18"},{x:0.36,w:0.04,h:0.28,c:"#001015"},
      {x:0.41,w:0.1,h:0.72,c:"#000820"},{x:0.52,w:0.05,h:0.40,c:"#001018"},
      {x:0.58,w:0.07,h:0.55,c:"#000d1a"},{x:0.66,w:0.05,h:0.35,c:"#001020"},
      {x:0.72,w:0.08,h:0.60,c:"#000a18"},{x:0.81,w:0.04,h:0.30,c:"#001015"},
      {x:0.86,w:0.06,h:0.48,c:"#000c20"},{x:0.93,w:0.07,h:0.38,c:"#001018"},
    ];
    buildings.forEach(function(b, bi) {
      var bx = b.x*W, bw = b.w*W, by = H*(1-b.h), bh = b.h*H;
      ctx.fillStyle = b.c;
      ctx.fillRect(bx, by, bw, bh);
      // Neon edge glow
      var neonColors = ["#00d4ff","#ff00aa","#00ff88","#ff8800"];
      var nc = neonColors[bi%4];
      ctx.strokeStyle = nc.replace("#","rgba(").replace(/([0-9a-f]{2})/gi, function(m) { return parseInt(m,16)+","; }).slice(0,-1)+",0.4)";
      ctx.strokeStyle = nc + "66";
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, bw, bh);
      // Windows
      for (var wy = by+8; wy < by+bh-8; wy += 10) {
        for (var wx = bx+4; wx < bx+bw-4; wx += 8) {
          if (Math.sin(wx*1.7+wy*2.3+bi*31.7) > 0.3) {
            ctx.fillStyle = "rgba("+Math.floor(100+Math.random()*100)+","+Math.floor(150+Math.random()*100)+","+Math.floor(200+Math.random()*55)+",0.6)";
            ctx.fillRect(wx, wy, 4, 3);
          }
        }
      }
    });
  }

  function drawCityscape(ctx, W, H, t) {
    var buildings = [
      {x:0,w:0.1,h:0.35},{x:0.08,w:0.07,h:0.5},{x:0.16,w:0.06,h:0.28},
      {x:0.23,w:0.12,h:0.6},{x:0.35,w:0.06,h:0.38},{x:0.42,w:0.08,h:0.45},
      {x:0.51,w:0.14,h:0.65},{x:0.66,w:0.06,h:0.32},{x:0.73,w:0.09,h:0.55},
      {x:0.83,w:0.07,h:0.42},{x:0.91,w:0.09,h:0.38},
    ];
    buildings.forEach(function(b, bi) {
      ctx.fillStyle = "#0a0c14";
      var bx=b.x*W, bw=b.w*W, by=H*(1-b.h), bh=b.h*H;
      ctx.fillRect(bx, by, bw, bh);
      for (var wy=by+6; wy<by+bh-6; wy+=9) {
        for (var wx=bx+4; wx<bx+bw-4; wx+=7) {
          if (Math.sin(wx*1.7+wy*2.3+bi*17) > 0.2) {
            ctx.fillStyle = Math.random()>0.7?"rgba(255,220,150,0.7)":"rgba(200,220,255,0.5)";
            ctx.fillRect(wx, wy, 3, 3);
          }
        }
      }
    });
  }

  function drawTemple(ctx, W, H, t) {
    ctx.fillStyle = "rgba(20,14,4,0.95)";
    // Base
    ctx.fillRect(W*0.2, H*0.72, W*0.6, H*0.28);
    // Steps
    for (var i = 0; i < 4; i++) {
      ctx.fillRect(W*(0.2+i*0.04), H*(0.68-i*0.04), W*(0.6-i*0.08), H*0.04);
    }
    // Main tower
    ctx.fillRect(W*0.42, H*0.35, W*0.16, H*0.33);
    // Roof tiers
    for (var i = 0; i < 4; i++) {
      var rx = W*(0.3+i*0.06), rw = W*(0.4-i*0.12), ry = H*(0.52-i*0.05);
      ctx.beginPath();
      ctx.moveTo(rx, ry+H*0.03);
      ctx.lineTo(rx+rw*0.5, ry);
      ctx.lineTo(rx+rw, ry+H*0.03);
      ctx.fill();
    }
    // Golden glow top
    var tg = ctx.createRadialGradient(W*0.5, H*0.32, 0, W*0.5, H*0.32, 60);
    tg.addColorStop(0, "rgba(255,200,50,0.5)");
    tg.addColorStop(1, "transparent");
    ctx.fillStyle = tg; ctx.fillRect(W*0.3, H*0.2, W*0.4, H*0.2);
  }

  // ─────────────────────────────────────────────────────────────────
  // MAIN RENDER LOOP
  // ─────────────────────────────────────────────────────────────────
  function renderFrame() {
    if (!_canvas || !_ctx) return;
    var W = _canvas.width, H = _canvas.height;
    var theme = THEMES[_genre] || THEMES.cultivation;

    _ctx.clearRect(0, 0, W, H);
    theme.bg(_ctx, W, H, _t);
    theme.drawParticles(_ctx, _particles, W, H, _t);
    theme.drawForeground(_ctx, W, H, _t);

    // Overlay: thông tin thế giới
    drawWorldOverlay(_ctx, W, H, _t);

    _t++;
    _raf = requestAnimationFrame(renderFrame);
  }

  function drawWorldOverlay(ctx, W, H, t) {
    var w = window.world;
    if (!w || !w.name) return;
    var yr = typeof window.year !== "undefined" ? window.year : (w.createdYear || 1);
    var pop = 0;
    if (window.UWS) pop = window.UWS.get ? window.UWS.get("totalPopulation") || 0 : 0;
    if (!pop && window.npcs) pop = window.npcs.length;

    // Top-left info box
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    roundRect(ctx, 12, 12, 220, 68, 10);
    ctx.fill();

    ctx.fillStyle = "#facc15";
    ctx.font = "bold 14px Cinzel, serif";
    ctx.fillText(w.name, 22, 33);

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "11px Noto Serif, serif";
    ctx.fillText("📅 Năm " + fmtN(yr) + "  ·  " + (w.currentEra || "Hỗn Nguyên"), 22, 51);
    ctx.fillText("👤 " + fmtN(pop) + " sinh linh  ·  " + _genre, 22, 67);
    ctx.restore();

    // Theme label bottom-right
    var theme = THEMES[_genre];
    if (theme) {
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      roundRect(ctx, W-140, H-32, 128, 22, 6);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "11px Noto Serif, serif";
      ctx.fillText(theme.label, W-134, H-16);
      ctx.restore();
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y); ctx.arcTo(x+w, y, x+w, y+r, r);
    ctx.lineTo(x+w, y+h-r); ctx.arcTo(x+w, y+h, x+w-r, y+h, r);
    ctx.lineTo(x+r, y+h); ctx.arcTo(x, y+h, x, y+h-r, r);
    ctx.lineTo(x, y+r); ctx.arcTo(x, y, x+r, y, r);
    ctx.closePath();
  }

  function fmtN(n) { return (n||0).toLocaleString("vi-VN"); }

  // ─────────────────────────────────────────────────────────────────
  // MOUNT / UNMOUNT
  // ─────────────────────────────────────────────────────────────────
  function mountScene(container) {
    if (_raf) { cancelAnimationFrame(_raf); _raf = null; }
    _genre = getGenre();
    var theme = THEMES[_genre] || THEMES.cultivation;

    // Canvas
    _canvas = document.createElement("canvas");
    _canvas.style.cssText = "width:100%;height:320px;display:block;border-radius:12px 12px 0 0;";
    _canvas.width  = container.clientWidth  || 600;
    _canvas.height = 320;
    _ctx = _canvas.getContext("2d");

    // Wrapper
    var wrap = document.createElement("div");
    wrap.id = "gse-scene-wrap";
    wrap.style.cssText = "position:relative;margin-bottom:0;border-radius:12px;overflow:hidden;border:1px solid rgba(250,204,21,0.15);";
    wrap.appendChild(_canvas);

    container.insertBefore(wrap, container.firstChild);

    // Init particles
    _particles = theme.initParticles(_canvas.width, _canvas.height);
    _t = 0;
    renderFrame();

    // Resize observer
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function() {
        if (_canvas) {
          _canvas.width = container.clientWidth || 600;
          _particles = theme.initParticles(_canvas.width, _canvas.height);
        }
      });
      ro.observe(container);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // INJECT INTO PUOS — container là tham số của puosRenderMyUniverse
  // ─────────────────────────────────────────────────────────────────
  function injectIntoPUOS() {
    var _origRender = window.puosRenderMyUniverse;
    window.puosRenderMyUniverse = function(container) {
      if (_origRender) _origRender.apply(this, arguments);
      // container là #puos-main element được truyền vào từ puosShell
      var target = container || document.getElementById("puos-main");
      if (!target) return;
      setTimeout(function() {
        // Tránh mount trùng
        if (target.querySelector("#gse-scene-wrap")) {
          var newGenre = getGenre();
          if (newGenre !== _genre) {
            var old = target.querySelector("#gse-scene-wrap");
            if (old) old.remove();
            if (_raf) { cancelAnimationFrame(_raf); _raf = null; }
            mountScene(target);
          }
          return;
        }
        mountScene(target);
      }, 80);
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────
  window.gseRefreshScene = function() {
    var panel = document.getElementById("puos-panel-my-universe") ||
                document.querySelector("[id*='my-universe']");
    if (!panel) return;
    var old = panel.querySelector("#gse-scene-wrap");
    if (old) old.remove();
    if (_raf) { cancelAnimationFrame(_raf); _raf = null; }
    mountScene(panel);
  };
  window.gseGetGenre = getGenre;

  function init() {
    injectIntoPUOS();
    console.log("[GenreSceneEngine V126] 🎨 Cảnh nền động khởi động — 5 thể loại · Canvas 2D · rAF sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 30700); });
  } else {
    setTimeout(init, 30700);
  }

})();
