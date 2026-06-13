(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // CIVILIZATION EVOLUTION ENGINE V38
  // Tiến Hóa Nền Văn Minh AI — 6 Trụ Cột · Tích Hợp Đa Hệ Thống
  // Kingdom · Empire · Sect · Divine · Multiverse · Timeline · Jarvis
  // ═══════════════════════════════════════════════════════════════════════════

  const SAVE_KEY      = "cgv6_civ_evolution_v38";
  const TICK_INTERVAL = 5;

  // ─── 6 PILLAR DEFINITIONS ────────────────────────────────────────────────
  const PILLARS = [
    { id:"science",    name:"Khoa Học",   icon:"🔬", color:"#60a5fa", trait:"scholarly",  desc:"Nghiên cứu, phát minh, trí tuệ tập thể" },
    { id:"culture",    name:"Văn Hóa",    icon:"🎨", color:"#c084fc", trait:"wanderer",   desc:"Nghệ thuật, truyền thống, bản sắc dân tộc" },
    { id:"military",   name:"Quân Sự",    icon:"⚔️", color:"#f87171", trait:"military",   desc:"Sức mạnh chiến đấu, chiến lược, kỷ luật" },
    { id:"religion",   name:"Tôn Giáo",   icon:"🛕", color:"#fbbf24", trait:"religious",  desc:"Thần đạo, tín ngưỡng, kết nối thần linh" },
    { id:"technology", name:"Công Nghệ",  icon:"⚙️", color:"#34d399", trait:"commercial", desc:"Công cụ, kỹ thuật, sản xuất, hạ tầng" },
    { id:"magic",      name:"Phép Thuật", icon:"🌀", color:"#a78bfa", trait:"hermit",     desc:"Linh khí, tu luyện, bí thuật, thần thông" },
  ];

  // ─── TIER THRESHOLDS ─────────────────────────────────────────────────────
  const TIERS = [
    { min:0,    name:"Nguyên Thủy", icon:"🪨", color:"#78716c" },
    { min:100,  name:"Thức Tỉnh",  icon:"✨", color:"#a16207" },
    { min:250,  name:"Phát Triển", icon:"🌱", color:"#16a34a" },
    { min:450,  name:"Phồn Thịnh", icon:"🌿", color:"#0284c7" },
    { min:600,  name:"Tiên Tiến",  icon:"⭐", color:"#7c3aed" },
    { min:750,  name:"Xuất Chúng", icon:"💫", color:"#db2777" },
    { min:900,  name:"Thiên Đỉnh", icon:"🌟", color:"#d97706" },
    { min:1000, name:"Vĩnh Cửu",   icon:"♾️", color:"#06b6d4" },
  ];

  // ─── CIV AGES (dựa trên trung bình 6 pillars) ────────────────────────────
  const CIV_AGES = [
    { min:0,    name:"Hồng Hoang",  icon:"🌑", color:"#78716c" },
    { min:80,   name:"Thượng Cổ",   icon:"🏛️", color:"#a16207" },
    { min:200,  name:"Trung Cổ",    icon:"⚔️", color:"#7f8c8d" },
    { min:350,  name:"Phục Hưng",   icon:"🎨", color:"#16a34a" },
    { min:500,  name:"Khai Sáng",   icon:"💡", color:"#0284c7" },
    { min:650,  name:"Tiến Hóa",    icon:"🚀", color:"#7c3aed" },
    { min:800,  name:"Thần Thánh",  icon:"✨", color:"#d97706" },
    { min:950,  name:"Siêu Việt",   icon:"♾️", color:"#06b6d4" },
  ];

  // ─── TYPE METADATA ────────────────────────────────────────────────────────
  const TYPE_META = {
    country:  { label:"Quốc Gia",   icon:"🏴", color:"#64748b" },
    kingdom:  { label:"Vương Quốc", icon:"🏰", color:"#f59e0b" },
    empire:   { label:"Đế Chế",     icon:"👑", color:"#ef4444" },
    sect:     { label:"Tông Môn",   icon:"🏯", color:"#a78bfa" },
    divine:   { label:"Thần Linh",  icon:"✨", color:"#fbbf24" },
    universe: { label:"Vũ Trụ",     icon:"🌌", color:"#8b5cf6" },
  };

  // ─── UNIVERSE TYPE → TRAITS ───────────────────────────────────────────────
  const UNIV_TRAITS = {
    fantasy:["wanderer","hermit"], cultivation:["scholarly","hermit"],
    divine:["religious","imperial"], demon:["military","heretical"],
    technology:["commercial","scholarly"], cyberpunk:["commercial","heretical"],
    mythology:["religious","wanderer"], apocalypse:["military","hermit"],
    ocean:["commercial","wanderer"], beast:["military","hermit"],
  };

  // ─── DATA ─────────────────────────────────────────────────────────────────
  function defaultData() {
    return {
      civilizations: {},
      globalStats: { totalEvolutions:0, totalBreakthroughs:0, highestCiv:null, highestCivAvg:0 },
      history: [],
      tick: 0,
    };
  }

  window.civEvoData = window.civEvoData || defaultData();

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.civEvoData)); } catch(e) {}
  }

  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        var p = JSON.parse(raw);
        if (p && p.civilizations) window.civEvoData = Object.assign(defaultData(), p);
      }
    } catch(e) {}
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────
  function getTier(val) {
    var t = TIERS[0];
    for (var i = 1; i < TIERS.length; i++) {
      if (val >= TIERS[i].min) t = TIERS[i]; else break;
    }
    return t;
  }

  function getCivAge(civ) {
    var avg = PILLARS.reduce(function(s,p){ return s+(civ[p.id]||0); }, 0) / PILLARS.length;
    var a = CIV_AGES[0];
    for (var i = 1; i < CIV_AGES.length; i++) {
      if (avg >= CIV_AGES[i].min) a = CIV_AGES[i]; else break;
    }
    return a;
  }

  function addHistory(entry) {
    window.civEvoData.history.unshift(entry);
    if (window.civEvoData.history.length > 200) window.civEvoData.history.length = 200;
  }

  function totalAvg(civ) {
    return Math.floor(PILLARS.reduce(function(s,p){ return s+(civ[p.id]||0); }, 0) / PILLARS.length);
  }

  // ─── BUILD ENTRY ──────────────────────────────────────────────────────────
  function _buildEntry(id, name, type, icon, traits) {
    var entry = {
      id:id, name:name, type:type, icon:icon,
      science:Math.floor(Math.random()*25), culture:Math.floor(Math.random()*25),
      military:Math.floor(Math.random()*25), religion:Math.floor(Math.random()*25),
      technology:Math.floor(Math.random()*25), magic:Math.floor(Math.random()*25),
      breakthroughs:[], lastTick:0, createdAt:(window.year||0),
    };
    if (Array.isArray(traits)) {
      if (traits.includes("military"))   { entry.military   += 30; }
      if (traits.includes("scholarly"))  { entry.science    += 30; }
      if (traits.includes("commercial")) { entry.technology += 25; }
      if (traits.includes("religious"))  { entry.religion   += 30; }
      if (traits.includes("imperial"))   { entry.military   += 15; entry.technology += 10; }
      if (traits.includes("hermit"))     { entry.magic      += 30; }
      if (traits.includes("wanderer"))   { entry.culture    += 30; }
      if (traits.includes("heretical"))  { entry.magic      += 20; entry.religion   -= 10; }
    }
    // Clamp minimums
    PILLARS.forEach(function(p){ entry[p.id] = Math.max(0, entry[p.id]); });
    return entry;
  }

  // ─── SAFE ARRAY HELPER (per V33 pattern — kingdoms/empires có thể là Object) ─
  function toArr(obj) {
    if (!obj) return [];
    return Array.isArray(obj) ? obj : Object.values(obj);
  }

  // ─── SYNC SOURCES ─────────────────────────────────────────────────────────
  function _syncSources() {
    var d = window.civEvoData;
    var changed = false;

    // 1. livingCivilizationAI (countries + kingdoms synced internally)
    if (window.lcaiData && window.lcaiData.civilizations) {
      Object.values(window.lcaiData.civilizations).forEach(function(civ) {
        if (!d.civilizations[civ.id]) {
          d.civilizations[civ.id] = _buildEntry(civ.id, civ.name || "Vô Danh", civ.sourceType || "country", civ.icon || "🏛️", civ.traits || []);
          changed = true;
        } else {
          d.civilizations[civ.id].name = civ.name || d.civilizations[civ.id].name;
        }
      });
    }

    // 2. kingdoms (Object or Array safety)
    if (window.kingdomData) {
      toArr(window.kingdomData.kingdoms).filter(function(k){ return !k.isCollapsed; }).forEach(function(k) {
        var eid = "cev38_k_" + k.kingdomId;
        if (!d.civilizations[eid]) {
          d.civilizations[eid] = _buildEntry(eid, k.kingdomName || "Vương Quốc", "kingdom", "🏰", []);
          changed = true;
        }
      });
    }

    // 3. empires (Object or Array safety)
    if (window.empireData) {
      toArr(window.empireData.empires).filter(function(e){ return !e.isCollapsed; }).forEach(function(e) {
        var eid = "cev38_e_" + e.empireId;
        if (!d.civilizations[eid]) {
          var entry = _buildEntry(eid, e.empireName || "Đế Chế", "empire", "👑", ["imperial","military"]);
          entry.military   += 20;
          entry.technology += 15;
          d.civilizations[eid] = entry;
          changed = true;
        }
      });
    }

    // 4. Sects V29
    if (window.sectV29Data && window.sectV29Data.sects) {
      toArr(window.sectV29Data.sects).forEach(function(s) {
        var eid = "cev38_s_" + (s.id || s.sectId || Math.random());
        if (!d.civilizations[eid]) {
          var entry = _buildEntry(eid, s.name || "Tông Môn", "sect", "🏯", ["scholarly","hermit"]);
          entry.magic   += 25;
          entry.science += 15;
          d.civilizations[eid] = entry;
          changed = true;
        }
      });
    }

    // 5. Divine Beings V30
    if (window.divV30Data && window.divV30Data.beings) {
      toArr(window.divV30Data.beings).forEach(function(b) {
        var eid = "cev38_d_" + (b.id || b.beingId || Math.random());
        if (!d.civilizations[eid]) {
          var entry = _buildEntry(eid, b.name || "Thần Linh", "divine", "✨", ["religious","hermit"]);
          entry.religion += 60;
          entry.magic    += 50;
          d.civilizations[eid] = entry;
          changed = true;
        }
      });
    }

    // 6. Multiverse Universes V35
    if (window.mvData && window.mvData.universes) {
      window.mvData.universes.filter(function(u){ return u.status === "active"; }).forEach(function(u) {
        var eid = "cev38_u_" + u.id;
        if (!d.civilizations[eid]) {
          var entry = _buildEntry(eid, u.name || "Vũ Trụ", "universe", "🌌", UNIV_TRAITS[u.type] || []);
          entry.science += 20; entry.magic += 20;
          d.civilizations[eid] = entry;
          changed = true;
        } else {
          d.civilizations[eid].name = u.name || d.civilizations[eid].name;
        }
      });
    }

    // 7. countries fallback
    if (window.countries) {
      (window.countries || []).filter(function(c){ return !c.collapsed; }).forEach(function(c) {
        var eid = "cev38_c_" + c.id;
        if (!d.civilizations[eid]) {
          d.civilizations[eid] = _buildEntry(eid, c.name || "Quốc Gia", "country", "🏴", []);
          changed = true;
        }
      });
    }

    if (changed) save();
  }

  // ─── PER-CIV TICK ─────────────────────────────────────────────────────────
  function _tickCiv(civ) {
    var d    = window.civEvoData;
    var year = window.year || 0;

    PILLARS.forEach(function(pillar) {
      if ((civ[pillar.id] || 0) >= 1000) return;

      var rate = 0.1 + Math.random() * 0.3;

      // Trait boost from lcaiData
      if (window.lcaiData && window.lcaiData.civilizations) {
        var lcaiCiv = Object.values(window.lcaiData.civilizations).find(function(lc){
          return lc.name === civ.name || ("cev38_" + lc.sourceType + "_" + lc.sourceId) === civ.id;
        });
        if (lcaiCiv) {
          if (lcaiCiv.traits && lcaiCiv.traits.includes(pillar.trait)) rate += 0.3;
          var eras = ["primitive","ancient","classical","medieval","renaissance","enlightened","transcendent"];
          var eraIdx = eras.indexOf(lcaiCiv.era);
          if (eraIdx > 0) rate += eraIdx * 0.06;
        }
      }

      // Type-specific bonuses
      if (civ.type === "sect" || civ.type === "divine") {
        if (pillar.id === "magic" || pillar.id === "religion") rate += 0.35;
      }
      if (civ.type === "empire") {
        if (pillar.id === "military" || pillar.id === "technology") rate += 0.25;
      }
      if (civ.type === "universe") { rate += 0.5; }

      // Integration: technologyEngine boost for technology pillar
      if (pillar.id === "technology" && window.techData && window.techData.globalTechLevel) {
        rate += window.techData.globalTechLevel * 0.02;
      }

      // Random event (1.2% chance — breakthrough jump)
      if (Math.random() < 0.012) { rate += 8 + Math.random() * 20; }

      var oldVal  = civ[pillar.id] || 0;
      var oldTier = getTier(oldVal);

      civ[pillar.id] = Math.min(1000, oldVal + rate);
      d.globalStats.totalEvolutions++;

      // Tier breakthrough
      var newTier = getTier(civ[pillar.id]);
      if (newTier.min > oldTier.min) {
        var evt = {
          year:year, civName:civ.name, civIcon:civ.icon,
          pillar:pillar.name, pillarIcon:pillar.icon,
          tier:newTier.name, tierIcon:newTier.icon, color:pillar.color,
        };
        civ.breakthroughs.unshift(evt);
        if (civ.breakthroughs.length > 20) civ.breakthroughs.length = 20;
        d.globalStats.totalBreakthroughs++;

        addHistory({
          year:year, type:"breakthrough",
          text: (civ.icon||"🏛️") + " " + civ.name + " đạt " + newTier.icon + " " + newTier.name
                + " về " + pillar.icon + " " + pillar.name,
          color: pillar.color,
        });

        // Historical Timeline integration
        if (typeof window.htAddEvent === "function") {
          window.htAddEvent({ year:year, type:"civ_evolution", color:pillar.color,
            title: civ.name + " — " + pillar.name + " đạt " + newTier.name });
        }
        // World Memory integration
        if (typeof window.wmeAddMemory === "function") {
          window.wmeAddMemory({ year:year, category:"civilization", title:civ.name + " Breakthrough",
            content: civ.name + " tiến hóa " + pillar.name + " lên cấp " + newTier.name });
        }
        // Jarvis / World Alert integration
        if (typeof window.waeAddAlert === "function") {
          window.waeAddAlert({ type:"civ_breakthrough", icon:pillar.icon,
            title: civ.name + ": " + pillar.name + " → " + newTier.name,
            desc: "Đột phá văn minh!", year:year });
        }
      }
    });

    civ.lastTick = d.tick;
  }

  // ─── MAIN TICK ────────────────────────────────────────────────────────────
  window.civEvoTick = function() {
    var d = window.civEvoData;
    d.tick++;
    if (d.tick % TICK_INTERVAL !== 0) return;

    _syncSources();

    var civArr = Object.values(d.civilizations);
    civArr.forEach(function(civ) { _tickCiv(civ); });

    // Update highest civ
    if (civArr.length > 0) {
      var best = civArr.reduce(function(a,b){ return totalAvg(a) >= totalAvg(b) ? a : b; });
      d.globalStats.highestCiv    = best.name;
      d.globalStats.highestCivAvg = totalAvg(best);
    }

    // Periodic save every 25 tick cycles
    if (d.tick % 25 === 0) save();
  };

  // ─── RENDER HELPERS ───────────────────────────────────────────────────────
  function _pillarBars(civ) {
    return PILLARS.map(function(pil) {
      var val = Math.min(1000, civ[pil.id] || 0);
      var pct = (val / 10).toFixed(1);
      return '<div style="display:flex;align-items:center;gap:5px;margin-bottom:2px">'
        + '<span style="width:14px;font-size:10px">' + pil.icon + '</span>'
        + '<div style="flex:1;background:#1e293b;border-radius:3px;height:4px">'
        + '<div style="width:' + pct + '%;background:' + pil.color + ';height:4px;border-radius:3px;transition:width 0.3s"></div>'
        + '</div>'
        + '<span style="width:28px;font-size:8px;color:#64748b;text-align:right">' + Math.floor(val) + '</span>'
        + '</div>';
    }).join("");
  }

  function _sectionHeader(color, title, subtitle) {
    return '<div style="margin-bottom:20px">'
      + '<h3 style="margin:0 0 3px;font-size:18px;color:' + color + ';font-family:Cinzel,serif">' + title + '</h3>'
      + (subtitle ? '<div style="font-size:11px;color:#475569">' + subtitle + '</div>' : "")
      + '</div>';
  }

  // ─── RENDER: OVERVIEW (Nền Văn Minh) ─────────────────────────────────────
  window.civEvoRenderOverview = function() {
    var el = document.getElementById("panel-civ-overview-v38");
    if (!el) return;
    var d   = window.civEvoData;
    var all = Object.values(d.civilizations);

    var cards = all.slice(0, 30).map(function(civ) {
      var age = getCivAge(civ);
      var avg = totalAvg(civ);
      var tm  = TYPE_META[civ.type] || TYPE_META.country;
      return '<div style="background:#0f172a;border:1px solid ' + tm.color + '33;border-radius:10px;padding:12px">'
        + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
        + '<span style="font-size:18px">' + (civ.icon||"🏛️") + '</span>'
        + '<div style="flex:1;min-width:0">'
        + '<div style="font-size:12px;color:#e2e8f0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + civ.name + '</div>'
        + '<div style="display:flex;gap:4px;margin-top:2px">'
        + '<span style="font-size:9px;padding:1px 5px;border-radius:5px;background:' + tm.color + '22;color:' + tm.color + '">' + tm.label + '</span>'
        + '<span style="font-size:9px;color:' + age.color + '">' + age.icon + ' ' + age.name + '</span>'
        + '</div>'
        + '</div>'
        + '<div style="text-align:right;flex-shrink:0">'
        + '<div style="font-size:16px;font-weight:700;color:#e2e8f0">' + avg + '</div>'
        + '<div style="font-size:8px;color:#64748b">TB</div>'
        + '</div>'
        + '</div>'
        + _pillarBars(civ)
        + '</div>';
    }).join("");

    el.innerHTML = '<div style="padding:20px;font-family:\'Noto Serif SC\',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">'
      + _sectionHeader("#34d399", "🌟 Nền Văn Minh — V38", "Tổng quan phát triển văn minh toàn hệ thống")
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:20px">'
      + '<div style="background:#0f172a;border:1px solid #34d39944;border-radius:8px;padding:12px;text-align:center"><div style="font-size:22px;font-weight:700;color:#34d399">' + all.length + '</div><div style="font-size:10px;color:#64748b">Nền Văn Minh</div></div>'
      + '<div style="background:#0f172a;border:1px solid #8b5cf644;border-radius:8px;padding:12px;text-align:center"><div style="font-size:22px;font-weight:700;color:#8b5cf6">' + d.globalStats.totalBreakthroughs + '</div><div style="font-size:10px;color:#64748b">Đột Phá</div></div>'
      + '<div style="background:#0f172a;border:1px solid #fbbf2444;border-radius:8px;padding:12px;text-align:center"><div style="font-size:16px;font-weight:700;color:#fbbf24;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (d.globalStats.highestCiv || "—") + '</div><div style="font-size:10px;color:#64748b">Văn Minh Đỉnh</div></div>'
      + '<div style="background:#0f172a;border:1px solid #60a5fa44;border-radius:8px;padding:12px;text-align:center"><div style="font-size:22px;font-weight:700;color:#60a5fa">' + d.globalStats.highestCivAvg + '</div><div style="font-size:10px;color:#64748b">Điểm TB Đỉnh</div></div>'
      + '</div>'
      + (all.length === 0
        ? '<div style="text-align:center;padding:60px;color:#475569"><div style="font-size:48px">🌱</div><div>Chưa có nền văn minh. Hãy tạo thế giới!</div></div>'
        : '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px">' + cards + '</div>')
      + '</div>';
  };

  // ─── RENDER: EVOLUTION (Tiến Hóa — lịch sử) ─────────────────────────────
  window.civEvoRenderEvolution = function() {
    var el = document.getElementById("panel-civ-evolution-v38");
    if (!el) return;
    var hist = window.civEvoData.history.slice(0, 100);

    var rows = hist.map(function(e) {
      return '<div style="display:flex;align-items:flex-start;gap:10px;padding:8px 10px;border-radius:7px;background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.05)">'
        + '<div style="font-size:9px;color:#475569;flex-shrink:0;padding-top:2px;width:55px">Năm ' + (e.year||0) + '</div>'
        + '<div style="flex:1;font-size:11px;color:#e2e8f0;line-height:1.5">' + (e.text||"") + '</div>'
        + '</div>';
    }).join("");

    el.innerHTML = '<div style="padding:20px;font-family:\'Noto Serif SC\',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">'
      + _sectionHeader("#a78bfa", "📈 Tiến Hóa — Biên Niên Sử", "Lịch sử các đột phá văn minh theo thời gian")
      + (hist.length === 0
        ? '<div style="text-align:center;padding:60px;color:#475569"><div style="font-size:48px">⏳</div><div>Chưa có sự kiện tiến hóa. Chờ thêm vài tick...</div></div>'
        : '<div style="display:flex;flex-direction:column;gap:5px">' + rows + '</div>')
      + '</div>';
  };

  // ─── RENDER: PILLAR DETAIL (dùng chung cho Công Nghệ, Văn Hóa, Tôn Giáo) ─
  function _renderPillarDetail(panelId, pillarId) {
    var el = document.getElementById(panelId);
    if (!el) return;
    var pil   = PILLARS.find(function(p){ return p.id === pillarId; });
    if (!pil) return;
    var d     = window.civEvoData;
    var all   = Object.values(d.civilizations);
    var civs  = all.slice().sort(function(a,b){ return (b[pillarId]||0)-(a[pillarId]||0); });

    // Tier distribution
    var tierDist = TIERS.map(function(tier) {
      var cnt = civs.filter(function(c){ return getTier(c[pillarId]||0).min === tier.min; }).length;
      return { tier:tier, cnt:cnt };
    });

    var rows = civs.slice(0, 50).map(function(civ, idx) {
      var val  = Math.min(1000, civ[pillarId]||0);
      var tier = getTier(val);
      var pct  = (val / 10).toFixed(1);
      return '<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.05)">'
        + '<div style="font-size:11px;color:#475569;width:22px;text-align:center">' + (idx+1) + '</div>'
        + '<span style="font-size:16px">' + (civ.icon||"🏛️") + '</span>'
        + '<div style="flex:1;min-width:0">'
        + '<div style="font-size:11px;color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + civ.name + '</div>'
        + '<div style="margin-top:4px;background:#1e293b;border-radius:4px;height:5px">'
        + '<div style="width:' + pct + '%;background:' + pil.color + ';height:5px;border-radius:4px"></div>'
        + '</div>'
        + '</div>'
        + '<div style="text-align:right;flex-shrink:0;min-width:70px">'
        + '<div style="font-size:14px;font-weight:700;color:' + pil.color + '">' + Math.floor(val) + '</div>'
        + '<div style="font-size:9px;color:' + tier.color + '">' + tier.icon + ' ' + tier.name + '</div>'
        + '</div>'
        + '</div>';
    }).join("");

    el.innerHTML = '<div style="padding:20px;font-family:\'Noto Serif SC\',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">'
      + _sectionHeader(pil.color, pil.icon + " " + pil.name, pil.desc)
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin-bottom:20px">'
      + tierDist.map(function(td){
          return '<div style="background:#0f172a;border:1px solid ' + td.tier.color + '33;border-radius:8px;padding:10px;text-align:center">'
            + '<div style="font-size:18px;font-weight:700;color:' + td.tier.color + '">' + td.cnt + '</div>'
            + '<div style="font-size:9px;color:#64748b">' + td.tier.icon + ' ' + td.tier.name + '</div>'
            + '</div>';
        }).join("")
      + '</div>'
      + (civs.length === 0
          ? '<div style="text-align:center;padding:60px;color:#475569"><div style="font-size:48px">' + pil.icon + '</div><div>Chưa có dữ liệu.</div></div>'
          : '<div style="display:flex;flex-direction:column;gap:5px">' + rows + '</div>')
      + '</div>';
  }

  window.civEvoRenderTechnology = function() { _renderPillarDetail("panel-civ-tech-v38",     "technology"); };
  window.civEvoRenderCulture    = function() { _renderPillarDetail("panel-civ-culture-v38",   "culture"); };
  window.civEvoRenderReligion   = function() { _renderPillarDetail("panel-civ-religion-v38",  "religion"); };
  window.civEvoRenderScience    = function() { _renderPillarDetail("panel-civ-science-v38",   "science"); };
  window.civEvoRenderMilitary   = function() { _renderPillarDetail("panel-civ-military-v38",  "military"); };
  window.civEvoRenderMagic      = function() { _renderPillarDetail("panel-civ-magic-v38",     "magic"); };

  // ─── RENDER: STATS (Thống Kê) ─────────────────────────────────────────────
  window.civEvoRenderStats = function() {
    var el = document.getElementById("panel-civ-stats-v38");
    if (!el) return;
    var d    = window.civEvoData;
    var all  = Object.values(d.civilizations);

    var pillarStats = PILLARS.map(function(pil) {
      var vals = all.map(function(c){ return c[pil.id]||0; });
      var avg  = vals.length ? Math.floor(vals.reduce(function(a,b){return a+b;},0)/vals.length) : 0;
      var max  = vals.length ? Math.floor(Math.max.apply(null,vals)) : 0;
      var best = all.find(function(c){ return Math.floor(c[pil.id]||0)===max; });
      return { pil:pil, avg:avg, max:max, best:best };
    });

    var typeCount = {};
    all.forEach(function(c){ typeCount[c.type]=(typeCount[c.type]||0)+1; });

    el.innerHTML = '<div style="padding:20px;font-family:\'Noto Serif SC\',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">'
      + _sectionHeader("#fbbf24", "📊 Thống Kê Văn Minh Toàn Cầu", "Tổng hợp 6 trụ cột · Phân loại · Xếp hạng")
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:24px">'
      + pillarStats.map(function(s){
          return '<div style="background:#0f172a;border:1px solid ' + s.pil.color + '33;border-radius:10px;padding:12px">'
            + '<div style="font-size:12px;color:' + s.pil.color + ';margin-bottom:8px">' + s.pil.icon + ' ' + s.pil.name + '</div>'
            + '<div style="display:flex;justify-content:space-between;margin-bottom:4px">'
            + '<span style="font-size:10px;color:#64748b">TB Toàn Cầu</span>'
            + '<span style="font-size:13px;color:#e2e8f0;font-weight:600">' + s.avg + '</span>'
            + '</div>'
            + '<div style="display:flex;justify-content:space-between;margin-bottom:6px">'
            + '<span style="font-size:10px;color:#64748b">Cao Nhất</span>'
            + '<span style="font-size:13px;color:' + s.pil.color + ';font-weight:700">' + s.max + '</span>'
            + '</div>'
            + '<div style="font-size:9px;color:#94a3b8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'
            + (s.best ? (s.best.icon||"🏛️") + " " + s.best.name : "—")
            + '</div>'
            + '</div>';
        }).join("")
      + '</div>'
      + '<h4 style="margin:0 0 10px;font-size:14px;color:#94a3b8;font-family:Cinzel,serif">Phân Loại</h4>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-bottom:24px">'
      + Object.entries(typeCount).map(function(e){
          var tm = TYPE_META[e[0]] || { label:e[0], icon:"🏛️", color:"#64748b" };
          return '<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;display:flex;justify-content:space-between;align-items:center">'
            + '<span style="font-size:11px;color:#94a3b8">' + tm.icon + ' ' + tm.label + '</span>'
            + '<span style="font-size:18px;font-weight:700;color:#e2e8f0">' + e[1] + '</span>'
            + '</div>';
        }).join("")
      + '</div>'
      + '<h4 style="margin:0 0 10px;font-size:14px;color:#94a3b8;font-family:Cinzel,serif">Top 10 Văn Minh</h4>'
      + '<div style="display:flex;flex-direction:column;gap:5px">'
      + all.slice().sort(function(a,b){return totalAvg(b)-totalAvg(a);}).slice(0,10).map(function(c,i){
          var age = getCivAge(c);
          var avg = totalAvg(c);
          return '<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.05)">'
            + '<span style="font-size:12px;color:#475569;width:18px">' + (i+1) + '</span>'
            + '<span style="font-size:16px">' + (c.icon||"🏛️") + '</span>'
            + '<div style="flex:1">'
            + '<div style="font-size:12px;color:#e2e8f0">' + c.name + '</div>'
            + '<div style="font-size:9px;color:' + age.color + '">' + age.icon + ' ' + age.name + '</div>'
            + '</div>'
            + '<div style="font-size:16px;font-weight:700;color:#fbbf24">' + avg + '</div>'
            + '</div>';
        }).join("")
      + '</div>'
      + '</div>';
  };

  // ─── INIT ─────────────────────────────────────────────────────────────────
  function init() {
    load();
    _syncSources();

    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      if (typeof window.civEvoTick === "function") window.civEvoTick();
    };

    var civCount = Object.keys(window.civEvoData.civilizations).length;
    console.log("[CivEvolutionEngine V38] 🌟 Tiến Hóa Nền Văn Minh — 6 Trụ Cột · " + civCount + " văn minh đã đồng bộ.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 3500); });
  } else {
    setTimeout(init, 3500);
  }

})();
