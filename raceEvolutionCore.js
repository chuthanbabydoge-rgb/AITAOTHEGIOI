(function() {
  "use strict";
  const SAVE_KEY = "cgv6_race_evo_core_v44";

  // ─── 8 Chủng Tộc Mặc Định ───────────────────────────────────────────────
  var DEFAULT_RACES = [
    {
      id:"human", name:"Nhân Tộc", icon:"👤", color:"#60a5fa",
      desc:"Linh hoạt, thích nghi cao. Xương sống của mọi nền văn minh.",
      baseStats:{ power:50, magic:50, tech:60, culture:70, population:80 },
      traits:["adaptable","mortal","ambitious"],
      patronDeity:"", evolutionStage:0, evolutionPoints:0,
      population:10000, populationGrowth:1.02,
      ageBonus:{ tech:8, culture:6 }, extinct:false, tier:1
    },
    {
      id:"elf", name:"Tiên Tộc", icon:"🧝", color:"#34d399",
      desc:"Trường sinh bất tử, thông thạo pháp thuật và nghệ thuật.",
      baseStats:{ power:60, magic:90, tech:40, culture:90, population:30 },
      traits:["immortal","magical","artistic"],
      patronDeity:"", evolutionStage:0, evolutionPoints:0,
      population:2000, populationGrowth:1.005,
      ageBonus:{ magic:12, culture:8 }, extinct:false, tier:2
    },
    {
      id:"demon", name:"Ma Tộc", icon:"🧟", color:"#ef4444",
      desc:"Quyền năng hắc ám, sức chiến đấu vượt trội nhưng tàn bạo.",
      baseStats:{ power:90, magic:70, tech:30, culture:20, population:40 },
      traits:["dark_power","aggressive","fearsome"],
      patronDeity:"", evolutionStage:0, evolutionPoints:0,
      population:3000, populationGrowth:1.015,
      ageBonus:{ power:10, magic:5 }, extinct:false, tier:2
    },
    {
      id:"dragon", name:"Long Tộc", icon:"🐉", color:"#f97316",
      desc:"Tối thượng về sức mạnh. Đơn độc nhưng quyết định cuộc chiến.",
      baseStats:{ power:100, magic:80, tech:20, culture:50, population:5 },
      traits:["supreme","solitary","ancient"],
      patronDeity:"", evolutionStage:0, evolutionPoints:0,
      population:200, populationGrowth:1.001,
      ageBonus:{ power:15 }, extinct:false, tier:3
    },
    {
      id:"mech", name:"Cơ Khí Tộc", icon:"🤖", color:"#94a3b8",
      desc:"Công nghệ đỉnh cao, không có ma lực nhưng vô địch về kỹ thuật.",
      baseStats:{ power:70, magic:0, tech:100, culture:40, population:20 },
      traits:["technological","no_magic","precise"],
      patronDeity:"", evolutionStage:0, evolutionPoints:0,
      population:1500, populationGrowth:1.01,
      ageBonus:{ tech:15 }, extinct:false, tier:2
    },
    {
      id:"spirit", name:"Linh Tộc", icon:"🧚", color:"#c084fc",
      desc:"Thần thánh tính cao, giao tiếp với thần linh, thể xác mong manh.",
      baseStats:{ power:20, magic:100, tech:10, culture:80, population:10 },
      traits:["divine_affinity","ethereal","fragile"],
      patronDeity:"", evolutionStage:0, evolutionPoints:0,
      population:500, populationGrowth:1.002,
      ageBonus:{ magic:15, culture:5 }, extinct:false, tier:3
    },
    {
      id:"beast", name:"Thú Tộc", icon:"🐺", color:"#fbbf24",
      desc:"Bản năng chiến đấu mạnh mẽ, bộ lạc đoàn kết, thiên nhiên hòa hợp.",
      baseStats:{ power:80, magic:20, tech:15, culture:30, population:60 },
      traits:["instinctive","tribal","nature_bond"],
      patronDeity:"", evolutionStage:0, evolutionPoints:0,
      population:5000, populationGrowth:1.018,
      ageBonus:{ power:8, culture:3 }, extinct:false, tier:1
    },
    {
      id:"aqua", name:"Hải Tộc", icon:"🌊", color:"#06b6d4",
      desc:"Chủ đại dương, thích nghi hoàn hảo với môi trường biển.",
      baseStats:{ power:55, magic:60, tech:50, culture:55, population:25 },
      traits:["ocean_mastery","adaptive","deep_dweller"],
      patronDeity:"", evolutionStage:0, evolutionPoints:0,
      population:2500, populationGrowth:1.008,
      ageBonus:{ magic:6, tech:6 }, extinct:false, tier:1
    }
  ];

  // ─── Lịch Sử Tiến Hóa Theo Kỷ Nguyên ───────────────────────────────────
  var AGE_EVOLUTION_MAP = {
    "chaos":    { bonus:{ power:5 },      label:"Sức mạnh nguyên thủy trỗi dậy" },
    "myth":     { bonus:{ magic:8 },      label:"Ma lực thần thoại bùng nổ" },
    "hero":     { bonus:{ power:6, culture:4 }, label:"Thời đại anh hùng, chủng tộc nổi bật" },
    "ancient":  { bonus:{ culture:10 },   label:"Nền văn minh cổ đại hình thành" },
    "empire":   { bonus:{ tech:6, culture:5 }, label:"Đế quốc chủng tộc hình thành" },
    "revival":  { bonus:{ culture:12 },   label:"Phục hưng văn hóa chủng tộc" },
    "industrial":{ bonus:{ tech:10 },     label:"Cách mạng công nghiệp chủng tộc" },
    "tech":     { bonus:{ tech:12 },      label:"Chủng tộc bước vào kỷ nguyên số" },
    "space":    { bonus:{ tech:8, power:4 }, label:"Chinh phục vũ trụ" },
    "cosmos":   { bonus:{ magic:8, tech:6 }, label:"Dung hợp ma lực và công nghệ" },
    "multiverse":{ bonus:{ power:5, magic:5, tech:5 }, label:"Chủng tộc bước vào đa vũ trụ" },
    "genesis":  { bonus:{ power:10, magic:10, tech:10, culture:10 }, label:"Kỷ Nguyên Sáng Thế — tất cả đỉnh cao" }
  };

  // ─── 5 Giai Đoạn Tiến Hóa ───────────────────────────────────────────────
  var EVOLUTION_STAGES = [
    { id:0, name:"Nguyên Thủy", icon:"🌱", desc:"Chủng tộc mới hình thành", threshold:0 },
    { id:1, name:"Văn Minh",   icon:"🏛️", desc:"Xây dựng xã hội và văn hóa",   threshold:100 },
    { id:2, name:"Tiến Hóa",   icon:"⚡", desc:"Phát triển kỹ năng đặc trưng",  threshold:300 },
    { id:3, name:"Thức Tỉnh",  icon:"🌟", desc:"Khai phá tiềm năng ẩn sâu",     threshold:600 },
    { id:4, name:"Siêu Việt",  icon:"♾️", desc:"Vượt qua giới hạn chủng loài",  threshold:1000 }
  ];

  // ─── State ───────────────────────────────────────────────────────────────
  function defaultData() {
    return {
      races: JSON.parse(JSON.stringify(DEFAULT_RACES)),
      history: [],
      lastAgeId: null,
      totalEvoEvents: 0,
      tick: 0
    };
  }

  window.recData = window.recData || defaultData();

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.recData)); } catch(e) {}
  }
  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        var p = JSON.parse(raw);
        if (p && p.races) window.recData = Object.assign(defaultData(), p);
      }
    } catch(e) {}
  }

  // ─── Util ────────────────────────────────────────────────────────────────
  function log(msg) {
    window.recData.history.unshift({ year: window.year||0, msg: msg });
    if (window.recData.history.length > 200) window.recData.history.length = 200;
  }
  function notify(msg, icon) {
    if (typeof window.waeAddAlert === "function")
      window.waeAddAlert({ type:"race_evolution", icon: icon||"🧬", title: msg, year: window.year||0 });
    if (typeof window.htAddEvent === "function")
      window.htAddEvent({ year: window.year||0, type:"race", title:"[Chủng Tộc] " + msg, color:"#34d399" });
  }

  // ─── API Công Khai ───────────────────────────────────────────────────────
  window.recGetAll = function() { return window.recData.races; };
  window.recGetRace = function(id) {
    return window.recData.races.find(function(r){ return r.id === id; }) || null;
  };
  window.recGetStage = function(points) {
    var stage = EVOLUTION_STAGES[0];
    for (var i = EVOLUTION_STAGES.length-1; i >= 0; i--) {
      if (points >= EVOLUTION_STAGES[i].threshold) { stage = EVOLUTION_STAGES[i]; break; }
    }
    return stage;
  };
  window.recGetAgeBonus = function(ageId) { return AGE_EVOLUTION_MAP[ageId] || null; };
  window.recGetEvolutionStages = function() { return EVOLUTION_STAGES; };

  window.recEvolveRace = function(raceId) {
    var race = window.recGetRace(raceId);
    if (!race || race.extinct) return false;
    race.evolutionPoints += 50;
    var newStage = window.recGetStage(race.evolutionPoints);
    if (newStage.id > race.evolutionStage) {
      race.evolutionStage = newStage.id;
      var msg = race.icon + " " + race.name + " đạt giai đoạn [" + newStage.name + "] " + newStage.icon;
      log(msg);
      notify(msg, race.icon);
      if (typeof window.wmeAddMemory === "function")
        window.wmeAddMemory({ year: window.year||0, category:"race", title: msg, content: newStage.desc });
      window.recData.totalEvoEvents++;
      // thông báo cho raeData nếu có
      if (typeof window.raeCheckMutation === "function") window.raeCheckMutation(raceId);
    }
    save();
    return true;
  };

  window.recGetStats = function() {
    var races = window.recData.races;
    var alive = races.filter(function(r){ return !r.extinct; }).length;
    var totalPop = races.reduce(function(s,r){ return s + (r.population||0); }, 0);
    var topRace = races.slice().sort(function(a,b){ return (b.evolutionPoints||0)-(a.evolutionPoints||0); })[0];
    return { total: races.length, alive: alive, extinct: races.length-alive, totalPop: totalPop, topRace: topRace };
  };

  // ─── Sync với crfData (Creator Race Factory V40) ─────────────────────────
  function syncWithCreatorRaces() {
    if (!window.crfData || !window.crfData.races) return;
    var existing = window.recData.races.map(function(r){ return r.id; });
    window.crfData.races.forEach(function(cr) {
      if (!existing.includes(cr.id||cr.name)) {
        window.recData.races.push({
          id: cr.id || ("custom_" + window.recData.races.length),
          name: cr.name, icon: cr.icon||"❓", color: "#94a3b8",
          desc: "Chủng tộc do Sáng Tạo Chủ tạo ra.",
          baseStats:{ power: cr.power||50, magic: cr.magic||50, tech: cr.tech||50, culture: cr.culture||50, population: 50 },
          traits:[], patronDeity:"", evolutionStage:0, evolutionPoints:0,
          population: 1000, populationGrowth: 1.01,
          ageBonus:{}, extinct:false, tier:1, isCustom:true
        });
      }
    });
  }

  // ─── Gán Thần Bảo Hộ Từ Mythology V42 ──────────────────────────────────
  function assignPatronDeities() {
    if (typeof window.mgsGetAll !== "function") return;
    var gods = window.mgsGetAll();
    if (!gods || gods.length === 0) return;
    window.recData.races.forEach(function(race) {
      if (race.patronDeity) return;
      var candidate = gods[Math.floor(Math.random() * gods.length)];
      if (candidate) race.patronDeity = candidate.name;
    });
  }

  // ─── Tick ────────────────────────────────────────────────────────────────
  window.recCoreTick = function() {
    window.recData.tick = (window.recData.tick||0) + 1;
    var t = window.recData.tick;

    // Tăng dân số mỗi 5 tick
    if (t % 5 === 0) {
      window.recData.races.forEach(function(race) {
        if (race.extinct) return;
        race.population = Math.floor((race.population||100) * (race.populationGrowth||1.01));
        race.evolutionPoints = (race.evolutionPoints||0) + Math.floor(Math.random()*3);
        if (race.population > 9999999) race.population = 9999999;
      });
    }

    // Kiểm tra chuyển kỷ nguyên mỗi 15 tick
    if (t % 15 === 0) {
      var currentAgeId = (typeof window.waeGetCurrentAge === "function")
        ? (window.waeGetCurrentAge()||{}).id : null;

      if (currentAgeId && currentAgeId !== window.recData.lastAgeId) {
        window.recData.lastAgeId = currentAgeId;
        var ageMap = AGE_EVOLUTION_MAP[currentAgeId];
        if (ageMap) {
          window.recData.races.forEach(function(race) {
            if (race.extinct) return;
            // Áp dụng bonus kỷ nguyên
            Object.keys(ageMap.bonus||{}).forEach(function(stat) {
              race.baseStats[stat] = Math.min(100, (race.baseStats[stat]||50) + (race.ageBonus[stat]||0) + ageMap.bonus[stat]);
            });
            race.evolutionPoints += 30;
          });
          var msg = "Kỷ Nguyên " + currentAgeId + ": " + ageMap.label;
          log(msg);
          notify(msg, "🌀");
        }
        syncWithCreatorRaces();
      }
    }

    // Kiểm tra nguy cơ tuyệt chủng mỗi 20 tick
    if (t % 20 === 0) {
      window.recData.races.forEach(function(race) {
        if (race.extinct) return;
        if ((race.population||0) < 50 && !race.extinct) {
          race.extinct = true;
          var msg = "⚠️ " + race.icon + " " + race.name + " đang trên bờ vực tuyệt chủng!";
          log(msg);
          notify(msg, "⚠️");
        }
      });
      save();
    }
  };

  // ─── Render Panels ──────────────────────────────────────────────────────
  window.recRenderOverview = function() {
    var el = document.getElementById("panel-race-overview-v44");
    if (!el) return;
    var races = window.recData.races;
    var stats = window.recGetStats();
    var html = '<div style="padding:20px;max-width:900px;margin:0 auto">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">';
    html += '<h2 style="margin:0;font-family:Cinzel,serif;color:#34d399;font-size:20px">🧬 Tổng Quan Chủng Tộc V44</h2>';
    html += '<button onclick="recRenderOverview()" style="padding:6px 14px;background:#1e293b;border:1px solid #34d399;border-radius:6px;color:#34d399;cursor:pointer;font-size:12px">🔄 Làm Mới</button>';
    html += '</div>';
    // Stats bar
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px">';
    html += '<div style="background:#0f172a;border:1px solid #34d39944;border-radius:8px;padding:12px;text-align:center"><div style="font-size:22px;font-weight:700;color:#34d399">'+stats.alive+'</div><div style="font-size:10px;color:#64748b">Chủng Tộc Sống</div></div>';
    html += '<div style="background:#0f172a;border:1px solid #ef444444;border-radius:8px;padding:12px;text-align:center"><div style="font-size:22px;font-weight:700;color:#ef4444">'+stats.extinct+'</div><div style="font-size:10px;color:#64748b">Tuyệt Chủng</div></div>';
    html += '<div style="background:#0f172a;border:1px solid #60a5fa44;border-radius:8px;padding:12px;text-align:center"><div style="font-size:16px;font-weight:700;color:#60a5fa">'+stats.totalPop.toLocaleString()+'</div><div style="font-size:10px;color:#64748b">Tổng Dân Số</div></div>';
    html += '<div style="background:#0f172a;border:1px solid #a78bfa44;border-radius:8px;padding:12px;text-align:center"><div style="font-size:14px;font-weight:700;color:#a78bfa">'+(stats.topRace ? stats.topRace.icon+' '+stats.topRace.name : "—")+'</div><div style="font-size:10px;color:#64748b">Tiến Hóa Nhất</div></div>';
    html += '</div>';
    // Race cards
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px">';
    races.forEach(function(race) {
      var stage = window.recGetStage(race.evolutionPoints||0);
      var pct = Math.min(100, Math.floor((race.evolutionPoints||0) / 10));
      html += '<div style="background:#0f172a;border:1px solid '+(race.color||"#334155")+'44;border-radius:10px;padding:14px;'+(race.extinct?"opacity:0.5":"")+'">';
      html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">';
      html += '<span style="font-size:28px">'+race.icon+'</span>';
      html += '<div><div style="font-size:14px;font-weight:700;color:'+(race.color||"#e2e8f0")+'">'+(race.extinct?"☠️ ":"")+race.name+'</div>';
      html += '<div style="font-size:11px;color:#64748b">'+stage.icon+' '+stage.name+' · Tier '+race.tier+'</div></div>';
      html += '</div>';
      html += '<div style="font-size:11px;color:#94a3b8;margin-bottom:8px">'+race.desc+'</div>';
      // Stats mini bars
      ['power','magic','tech','culture'].forEach(function(stat) {
        var val = race.baseStats[stat]||0;
        var colors = {power:'#ef4444',magic:'#a78bfa',tech:'#06b6d4',culture:'#fbbf24'};
        var labels = {power:'⚔️ Sức',magic:'✨ Ma',tech:'⚙️ Tech',culture:'🎨 Văn'};
        html += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">';
        html += '<span style="font-size:10px;color:#64748b;width:60px">'+labels[stat]+'</span>';
        html += '<div style="flex:1;height:5px;background:#1e293b;border-radius:3px"><div style="width:'+val+'%;height:100%;background:'+colors[stat]+';border-radius:3px"></div></div>';
        html += '<span style="font-size:10px;color:#94a3b8;width:28px;text-align:right">'+val+'</span></div>';
      });
      html += '<div style="margin-top:8px;font-size:10px;color:#64748b">Dân số: <span style="color:#94a3b8">'+(race.population||0).toLocaleString()+'</span>';
      if (race.patronDeity) html += ' · Thần: <span style="color:#c084fc">'+race.patronDeity+'</span>';
      html += '</div>';
      // EVO progress bar
      html += '<div style="margin-top:8px">';
      html += '<div style="display:flex;justify-content:space-between;font-size:10px;color:#64748b;margin-bottom:3px"><span>Điểm Tiến Hóa: '+(race.evolutionPoints||0)+'</span><span>Đến giai đoạn tiếp: '+Math.max(0,(EVOLUTION_STAGES[Math.min(4,stage.id+1)]||{}).threshold||1000 - (race.evolutionPoints||0))+'</span></div>';
      html += '<div style="height:6px;background:#1e293b;border-radius:3px"><div style="width:'+pct+'%;height:100%;background:'+race.color+';border-radius:3px;transition:width 0.3s"></div></div>';
      html += '</div>';
      if (!race.extinct) {
        html += '<div style="margin-top:10px;display:flex;gap:6px">';
        html += '<button onclick="recEvolveRace(\''+race.id+'\');recRenderOverview()" style="flex:1;padding:5px;background:#0f172a;border:1px solid #34d399;border-radius:5px;color:#34d399;cursor:pointer;font-size:11px">⚡ Tiến Hóa</button>';
        html += '<button onclick="showPanel(\'panel-race-evolution-v44\');recRenderEvolution(\''+race.id+'\')" style="flex:1;padding:5px;background:#0f172a;border:1px solid #a78bfa;border-radius:5px;color:#a78bfa;cursor:pointer;font-size:11px">📈 Chi Tiết</button>';
        html += '</div>';
      }
      html += '</div>';
    });
    html += '</div>';
    // History log
    if (window.recData.history.length > 0) {
      html += '<div style="margin-top:20px"><h3 style="color:#60a5fa;font-size:14px;font-family:Cinzel,serif">📜 Lịch Sử Tiến Hóa</h3>';
      html += '<div style="background:#0f172a;border-radius:8px;padding:12px;max-height:160px;overflow-y:auto">';
      window.recData.history.slice(0,15).forEach(function(h) {
        html += '<div style="font-size:11px;color:#94a3b8;padding:3px 0;border-bottom:1px solid #1e293b">Năm '+h.year+': '+h.msg+'</div>';
      });
      html += '</div></div>';
    }
    html += '</div>';
    el.innerHTML = html;
  };

  window.recRenderEvolution = function(selectedId) {
    var el = document.getElementById("panel-race-evolution-v44");
    if (!el) return;
    var races = window.recData.races;
    var sel = selectedId || (races[0]||{}).id;
    var race = window.recGetRace(sel);
    var html = '<div style="padding:20px;max-width:800px;margin:0 auto">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">';
    html += '<h2 style="margin:0;font-family:Cinzel,serif;color:#a78bfa;font-size:18px">📈 Chi Tiết Tiến Hóa</h2>';
    html += '<select onchange="recRenderEvolution(this.value)" style="padding:6px;background:#1e293b;border:1px solid #475569;border-radius:6px;color:#e2e8f0;font-size:12px">';
    races.forEach(function(r) {
      html += '<option value="'+r.id+'"'+(r.id===sel?' selected':'')+'>'+r.icon+' '+r.name+'</option>';
    });
    html += '</select></div>';

    if (!race) { el.innerHTML = html + '<p style="color:#64748b">Không tìm thấy chủng tộc.</p></div>'; return; }

    // Evolution stages
    html += '<div style="display:flex;gap:0;margin-bottom:24px;background:#0f172a;border-radius:10px;overflow:hidden;border:1px solid #1e293b">';
    EVOLUTION_STAGES.forEach(function(stage) {
      var active = race.evolutionStage >= stage.id;
      var current = race.evolutionStage === stage.id;
      html += '<div style="flex:1;padding:12px 6px;text-align:center;background:'+(current?'#1e293b':'transparent')+';border-right:1px solid #0f172a">';
      html += '<div style="font-size:18px">'+stage.icon+'</div>';
      html += '<div style="font-size:10px;color:'+(active?'#34d399':'#475569')+';font-weight:'+(current?'700':'400')+'">'+stage.name+'</div>';
      html += '<div style="font-size:9px;color:#475569">'+stage.threshold+' EP</div>';
      html += '</div>';
    });
    html += '</div>';

    // Stats grid
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">';
    html += '<div style="background:#0f172a;border:1px solid #'+race.color.slice(1)+'44;border-radius:8px;padding:14px">';
    html += '<div style="font-size:13px;font-weight:700;color:'+race.color+';margin-bottom:10px">'+race.icon+' '+race.name+'</div>';
    ['power','magic','tech','culture'].forEach(function(stat) {
      var val = race.baseStats[stat]||0;
      var colors = {power:'#ef4444',magic:'#a78bfa',tech:'#06b6d4',culture:'#fbbf24'};
      var labels = {power:'⚔️ Sức Mạnh',magic:'✨ Ma Lực',tech:'⚙️ Công Nghệ',culture:'🎨 Văn Hóa'};
      html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">';
      html += '<span style="font-size:11px;color:#64748b;width:80px">'+labels[stat]+'</span>';
      html += '<div style="flex:1;height:8px;background:#1e293b;border-radius:4px"><div style="width:'+val+'%;height:100%;background:'+colors[stat]+';border-radius:4px"></div></div>';
      html += '<span style="font-size:11px;color:#94a3b8;width:30px;text-align:right">'+val+'</span></div>';
    });
    html += '</div>';

    html += '<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:14px">';
    html += '<div style="font-size:12px;color:#94a3b8;margin-bottom:8px">📊 Thông Tin</div>';
    var curStage = window.recGetStage(race.evolutionPoints||0);
    html += '<div style="font-size:11px;color:#64748b;line-height:2">';
    html += 'Giai đoạn: <span style="color:#34d399">'+curStage.icon+' '+curStage.name+'</span><br>';
    html += 'Điểm tiến hóa: <span style="color:#fbbf24">'+(race.evolutionPoints||0)+' EP</span><br>';
    html += 'Dân số: <span style="color:#60a5fa">'+(race.population||0).toLocaleString()+'</span><br>';
    html += 'Tốc độ tăng: <span style="color:#34d399">×'+(race.populationGrowth||1).toFixed(3)+'/tick</span><br>';
    if (race.patronDeity) html += 'Thần bảo hộ: <span style="color:#c084fc">'+race.patronDeity+'</span><br>';
    html += 'Trạng thái: <span style="color:'+(race.extinct?'#ef4444':'#34d399')+'">'+( race.extinct?'☠️ Tuyệt Chủng':'✅ Đang Sống')+'</span>';
    html += '</div></div></div>';

    // Traits
    html += '<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:14px;margin-bottom:12px">';
    html += '<div style="font-size:13px;color:#a78bfa;margin-bottom:8px">🏷️ Đặc Tính Chủng Tộc</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:6px">';
    (race.traits||[]).forEach(function(t) {
      html += '<span style="padding:3px 10px;background:#1e293b;border:1px solid #334155;border-radius:12px;font-size:11px;color:#94a3b8">'+t+'</span>';
    });
    html += '</div></div>';

    // Age bonuses
    html += '<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:14px;margin-bottom:12px">';
    html += '<div style="font-size:13px;color:#fbbf24;margin-bottom:8px">🌀 Bonus Theo Kỷ Nguyên</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:6px">';
    Object.keys(race.ageBonus||{}).forEach(function(stat) {
      var colors = {power:'#ef4444',magic:'#a78bfa',tech:'#06b6d4',culture:'#fbbf24'};
      html += '<span style="padding:3px 10px;background:#1e293b;border:1px solid '+(colors[stat]||"#334155")+'44;border-radius:12px;font-size:11px;color:'+(colors[stat]||"#94a3b8")+'">'+ stat +': +'+race.ageBonus[stat]+'</span>';
    });
    if (!Object.keys(race.ageBonus||{}).length) html += '<span style="color:#475569;font-size:11px">Không có bonus đặc biệt</span>';
    html += '</div></div>';

    if (!race.extinct) {
      html += '<button onclick="recEvolveRace(\''+race.id+'\');recRenderEvolution(\''+race.id+'\')" style="width:100%;padding:10px;background:linear-gradient(135deg,#0f172a,#1e293b);border:1px solid #34d399;border-radius:8px;color:#34d399;cursor:pointer;font-size:13px;font-family:Cinzel,serif">⚡ Kích Hoạt Tiến Hóa Thủ Công</button>';
    }
    html += '</div>';
    el.innerHTML = html;
  };

  // ─── Hub Widget ──────────────────────────────────────────────────────────
  window.recHubWidget = function() {
    var stats = window.recGetStats();
    var races = window.recData.races.filter(function(r){ return !r.extinct; }).slice(0,4);
    var html = '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px">';
    html += '<div style="background:#0f172a;border:1px solid #34d39944;border-radius:8px;padding:8px 14px;text-align:center"><div style="font-size:18px;font-weight:700;color:#34d399">'+stats.alive+'</div><div style="font-size:9px;color:#64748b">Chủng Tộc</div></div>';
    html += '<div style="background:#0f172a;border:1px solid #60a5fa44;border-radius:8px;padding:8px 14px;text-align:center"><div style="font-size:14px;font-weight:700;color:#60a5fa">'+Math.floor(stats.totalPop/1000)+'K</div><div style="font-size:9px;color:#64748b">Dân Số</div></div>';
    html += '<div style="background:#0f172a;border:1px solid #ef444444;border-radius:8px;padding:8px 14px;text-align:center"><div style="font-size:18px;font-weight:700;color:#ef4444">'+stats.extinct+'</div><div style="font-size:9px;color:#64748b">Tuyệt Chủng</div></div>';
    html += '</div>';
    html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">';
    races.forEach(function(r) {
      html += '<span title="'+r.name+'" style="font-size:20px;cursor:pointer" onclick="showPanel(\'panel-race-overview-v44\');recRenderOverview()">'+r.icon+'</span>';
    });
    html += '</div>';
    return html;
  };

  // ─── Init ────────────────────────────────────────────────────────────────
  function init() {
    load();
    assignPatronDeities();
    syncWithCreatorRaces();

    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      window.recCoreTick();
    };

    console.log("[RaceEvolutionCore V44] 🧬 Hệ Thống Chủng Tộc Tiến Hóa · 8 chủng tộc · " + window.recData.races.length + " active.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 3400); });
  } else {
    setTimeout(init, 3400);
  }
})();
