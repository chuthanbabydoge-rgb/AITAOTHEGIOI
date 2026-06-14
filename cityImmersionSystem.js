(function () {
  "use strict";
  const SAVE_KEY = "cgv6_city_immersion_v70";

  window.cityImmersionV70Data = {
    version: "V70",
    initialized: false,
    activeCity: null,
    districts: [],
    buildings: [],
    trafficFlow: [],
    events: [],
    animFrame: 0,
    socialGroups: [],
    economicIndex: 0,
    unrestLevel: 0,
    visitHistory: [],
  };

  const D = window.cityImmersionV70Data;

  const BUILDING_TYPES = [
    { id: "temple", name: "Đền Thờ",    icon: "⛪", effect: "faith",    color: "#c084fc" },
    { id: "market", name: "Chợ",        icon: "🏪", effect: "economy",  color: "#f59e0b" },
    { id: "barracks",name: "Doanh Trại",icon: "⚔️", effect: "military", color: "#ef4444" },
    { id: "guild",  name: "Hội Quán",   icon: "🏛️", effect: "guild",    color: "#38bdf8" },
    { id: "academy",name: "Học Viện",   icon: "📚", effect: "knowledge",color: "#4ade80" },
    { id: "inn",    name: "Quán Trọ",   icon: "🏨", effect: "rest",     color: "#fb923c" },
    { id: "palace", name: "Cung Điện",  icon: "🏰", effect: "power",    color: "#fcd34d" },
    { id: "farm",   name: "Nông Trang", icon: "🌾", effect: "food",     color: "#86efac" },
    { id: "forge",  name: "Lò Rèn",    icon: "🔨", effect: "craft",    color: "#94a3b8" },
    { id: "port",   name: "Cảng",      icon: "⚓", effect: "trade",    color: "#67e8f9" },
  ];

  const SOCIAL_EVENTS = [
    "Phiên chợ sáng sớm — người dân trao đổi hàng hóa",
    "Đoàn người hành hương đến đền thờ",
    "Tốp lính tuần tra qua khu dân cư",
    "Học sinh tập hợp tại học viện",
    "Thương nhân từ xa đến đàm phán",
    "Lễ hội mùa màng — âm nhạc và tiệc tùng",
    "Đám cưới hoàng gia — cả thành phố tụ hội",
    "Tin tức chiến tranh lan tràn chợ búa",
    "Tu sĩ thuyết giảng tại quảng trường",
    "Nhóm phiêu lưu trả lại nhiệm vụ cho hội quán",
  ];

  function save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      activeCity: D.activeCity ? { name: D.activeCity.name, id: D.activeCity.id } : null,
      visitHistory: D.visitHistory.slice(-20),
    }));
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.visitHistory) D.visitHistory = p.visitHistory;
      }
    } catch (e) {}
  }

  function hashN(str, n) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0x7fffffff;
    return Math.abs(h % n);
  }

  function buildCityData(countryObj) {
    if (!countryObj) return null;
    const name = countryObj.name || "City";
    const pop = countryObj.population || Math.floor(5000 + Math.random() * 50000);
    const econ = countryObj.economy || Math.floor(Math.random() * 100);
    const stability = countryObj.stability || Math.floor(40 + Math.random() * 60);

    const distNames = ["Trung Tâm", "Thương Cảng", "Khu Học Giả", "Khu Quân Sự", "Khu Tôn Giáo", "Ngoại Ô"];
    const districts = distNames.map(function (d, i) {
      return {
        name: d,
        population: Math.floor(pop / 6 * (0.7 + Math.random() * 0.6)),
        prosperity: Math.floor(30 + Math.random() * 70),
        unrest: Math.floor(Math.random() * 40),
        buildings: BUILDING_TYPES.slice(i, i + 2).map(function (b) { return Object.assign({}, b, { level: 1 + hashN(name + d + b.id, 4) }); }),
      };
    });

    const totalBuildings = [];
    BUILDING_TYPES.forEach(function (bt) {
      const count = 1 + hashN(name + bt.id, 5);
      for (let i = 0; i < count; i++) {
        totalBuildings.push(Object.assign({}, bt, { level: 1 + hashN(name + bt.id + i, 4), x: Math.random(), y: Math.random() }));
      }
    });

    const npcsInCity = (window.npcs || []).filter(function (n) { return n.status === "alive" && (n.country === name || n.countryId === countryObj.id); });
    const socialGroups = [
      { name: "Thương Nhân", count: Math.floor(npcsInCity.length * 0.25), icon: "💰", mood: "Tích cực" },
      { name: "Binh Lính", count: Math.floor(npcsInCity.length * 0.15), icon: "⚔️", mood: stability > 60 ? "Trung thành" : "Bất mãn" },
      { name: "Nông Dân", count: Math.floor(npcsInCity.length * 0.4), icon: "🌾", mood: econ > 50 ? "Đủ sống" : "Khó khăn" },
      { name: "Học Giả", count: Math.floor(npcsInCity.length * 0.05), icon: "📚", mood: "Nghiên cứu" },
      { name: "Tu Sĩ", count: Math.floor(npcsInCity.length * 0.08), icon: "⛪", mood: "Thành kính" },
      { name: "Quý Tộc", count: Math.floor(npcsInCity.length * 0.02), icon: "👑", mood: "Quyền lực" },
    ];

    const warStatus = (window.warsActive || []).some(function (w) { return w.attacker === name || w.defender === name; });
    const events = [];
    if (warStatus) events.push({ type: "war", msg: "⚔️ Thành phố đang trong tình trạng chiến tranh — binh lính tập kết", urgent: true });
    if (stability < 30) events.push({ type: "unrest", msg: "✊ Dân chúng biểu tình tại quảng trường trung tâm", urgent: true });
    if (econ > 80) events.push({ type: "prosperity", msg: "🌟 Thời kỳ thịnh vượng — thương nhân tràn ngập các con phố", urgent: false });
    events.push({ type: "daily", msg: SOCIAL_EVENTS[hashN(name + (window.year || 1), SOCIAL_EVENTS.length)], urgent: false });

    return {
      name,
      population: pop,
      economy: econ,
      stability,
      districts,
      buildings: totalBuildings,
      socialGroups,
      events,
      npcsPresent: npcsInCity.length,
      npcs: npcsInCity.slice(0, 8),
      warStatus,
    };
  }

  function visitCity(countryNameOrObj) {
    let country = null;
    if (typeof countryNameOrObj === "string") {
      country = (window.countries || []).find(function (c) { return c.name === countryNameOrObj; });
    } else if (countryNameOrObj) {
      country = countryNameOrObj;
    }
    if (!country) country = (window.countries || [])[0];
    if (!country) return null;

    D.activeCity = buildCityData(country);
    D.visitHistory.push({ name: country.name, year: window.year || 0, t: Date.now() });
    if (D.visitHistory.length > 30) D.visitHistory = D.visitHistory.slice(-30);
    save();
    return D.activeCity;
  }

  function renderCityCanvas(canvasEl) {
    if (!canvasEl || !D.activeCity) return;
    const ctx = canvasEl.getContext("2d");
    const W = canvasEl.width = canvasEl.offsetWidth || 600;
    const H = canvasEl.height = canvasEl.offsetHeight || 250;
    const city = D.activeCity;
    D.animFrame++;

    ctx.fillStyle = "#0a0a18";
    ctx.fillRect(0, 0, W, H);

    const gridSize = 28;
    ctx.strokeStyle = "rgba(192,132,252,0.07)";
    ctx.lineWidth = 1;
    for (let gx = 0; gx < W; gx += gridSize) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
    for (let gy = 0; gy < H; gy += gridSize) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

    const bldW = Math.floor(W / BUILDING_TYPES.length);
    city.buildings.slice(0, BUILDING_TYPES.length).forEach(function (b, i) {
      const bx = i * bldW + bldW / 2;
      const bH = 30 + b.level * 15;
      const by = H - 30;
      const pulse = 1 + 0.05 * Math.sin(D.animFrame * 0.05 + i);

      ctx.shadowBlur = 12;
      ctx.shadowColor = b.color;
      ctx.fillStyle = b.color + "44";
      ctx.fillRect(bx - bldW / 3, by - bH, bldW * 0.6, bH);
      ctx.fillStyle = b.color + "88";
      ctx.fillRect(bx - bldW / 4, by - bH, bldW * 0.4, bH * 0.3);
      ctx.shadowBlur = 0;

      ctx.font = Math.round(11 * pulse) + "px serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(b.icon, bx, by - bH - 4);
    });

    for (let i = 0; i < 12; i++) {
      const t = (D.animFrame * 0.012 + i / 12) % 1;
      const tx = t * W;
      const ty = H - 25 + Math.sin(D.animFrame * 0.04 + i * 2) * 5;
      ctx.fillStyle = "rgba(255,200,100,0.6)";
      ctx.beginPath();
      ctx.arc(tx, ty, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, W, 36);
    ctx.fillStyle = "#fcd34d";
    ctx.font = "bold 13px serif";
    ctx.textAlign = "left";
    ctx.fillText("🏙️ " + city.name + " — Dân số: " + city.population.toLocaleString() + " | Kinh tế: " + city.economy + " | Ổn định: " + city.stability + "%", 10, 22);
  }

  function getCityReport(cityData) {
    const c = cityData || D.activeCity;
    if (!c) return "Chưa chọn thành phố.";
    const lines = [
      "🏙️ " + c.name + " — Năm " + (window.year || 1),
      "👥 Dân số: " + c.population.toLocaleString(),
      "💰 Kinh tế: " + c.economy + "/100",
      "🛡️ Ổn định: " + c.stability + "%",
      "👤 NPC trong thành: " + c.npcsPresent,
      c.warStatus ? "⚔️ ĐANG CHIẾN TRANH" : "☮️ Hòa bình",
    ];
    return lines.join(" · ");
  }

  window.cityImmersionV70Data = D;
  window.cis70VisitCity = visitCity;
  window.cis70GetActiveCity = function () { return D.activeCity; };
  window.cis70RenderCanvas = renderCityCanvas;
  window.cis70GetReport = getCityReport;
  window.cis70GetVisitHistory = function () { return D.visitHistory.slice(); };
  window.cis70BuildingTypes = BUILDING_TYPES;

  function init() {
    load();
    D.initialized = true;
    const firstCountry = (window.countries || [])[0];
    if (firstCountry) visitCity(firstCountry);
    console.log("[cityImmersionSystem V70] 🏙️ City Immersion System khởi động — Living city view.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 16400); });
  } else {
    setTimeout(init, 16400);
  }
})();
