(function() {
  "use strict";

  const TECH_NAMES = [
    "Luyện Kim", "Nông Nghiệp", "Chữ Viết", "Thiên Văn", "Hàng Hải",
    "Kiến Trúc", "Y Học", "Triết Học", "Toán Học", "Vật Lý",
    "Hóa Học", "Cơ Học", "Điện Học", "Máy Móc", "Trí Tuệ Nhân Tạo"
  ];

  const KNOWLEDGE_NAMES = [
    "Pháp Thuật Cổ Đại", "Bí Ẩn Vũ Trụ", "Nghệ Thuật Thiêng Liêng",
    "Triết Lý Thần Linh", "Ngôn Ngữ Nguyên Thủy", "Khoa Học Huyền Bí"
  ];

  function getCivs() {
    if (window.cecV95Data && Array.isArray(window.cecV95Data.civs)) return window.cecV95Data.civs;
    return [];
  }

  function saveCivs() {
    try { localStorage.setItem("cgv6_civ_core_v95", JSON.stringify(window.cecV95Data)); } catch(e) {}
  }

  window.cpv123CreateCiv = function(name, speciesId) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    if (!window.cecV95Data) return;
    var species = null;
    if (speciesId && window.spv93Data) {
      species = (window.spv93Data.species || []).find(function(s) { return s.id === speciesId; });
    }
    if (!species && window.spv93Data && (window.spv93Data.species || []).length) {
      species = window.spv93Data.species[0];
    }
    name = name || ("✨ Đế Quốc Thần Tạo " + (window.year || 1));
    var civ = {
      id: "civ_creator_" + Date.now(),
      name: name,
      speciesId: species ? species.id : "unknown",
      speciesName: species ? species.name : "Thần Tộc",
      stageId: "city_state",
      stageOrder: 2,
      stageLabel: "Thành Bang",
      stageIcon: "🏛️",
      color: "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6,"0"),
      population: 50000,
      territory: 5,
      knowledge: 500,
      techPoints: 300,
      techStage: 2,
      cities: [{ name: name + " Kinh Đô", isCapital: true, pop: 20000, yr: window.year || 1 }],
      growthHistory: [{ year: window.year || 1, pop: 50000 }],
      createdByCreator: true,
      createdYear: window.year || 1,
      leader: "Hoàng Đế " + name.split(" ")[0]
    };
    window.cecV95Data.civs.push(civ);
    window.cecV95Data.totalCivsEverFounded = (window.cecV95Data.totalCivsEverFounded || 0) + 1;
    saveCivs();
    window.cpv123LogAction("civilization", "🏛️ Tạo Văn Minh: " + name, "Dân số 50,000 · Lãnh thổ 5 · Thành Bang");
    return civ;
  };

  window.cpv123GrantTech = function(civId, techName, amount) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    amount = amount || 500;
    techName = techName || TECH_NAMES[Math.floor(Math.random() * TECH_NAMES.length)];
    var civs = getCivs();
    var civ = civId ? civs.find(function(c) { return c.id === civId; }) : civs[0];
    if (!civ) return alert("Không tìm thấy văn minh!");
    var old = civ.techPoints;
    var snap = window.cpv123MakeSnapshot ? window.cpv123MakeSnapshot(function() { civ.techPoints = old; saveCivs(); }) : null;
    civ.techPoints = (civ.techPoints || 0) + amount;
    civ.techStage = Math.min(8, Math.floor(civ.techPoints / 400));
    civ.grantedTechs = civ.grantedTechs || [];
    civ.grantedTechs.push({ name: techName, year: window.year || 1 });
    saveCivs();
    window.cpv123LogAction("civilization", "⚙️ Ban Công Nghệ: " + techName + " → " + civ.name, "+" + amount + " tech points", snap);
  };

  window.cpv123GrantKnowledge = function(civId, knowledgeName, amount) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    amount = amount || 300;
    knowledgeName = knowledgeName || KNOWLEDGE_NAMES[Math.floor(Math.random() * KNOWLEDGE_NAMES.length)];
    var civs = getCivs();
    var civ = civId ? civs.find(function(c) { return c.id === civId; }) : civs[0];
    if (!civ) return;
    var old = civ.knowledge;
    var snap = window.cpv123MakeSnapshot ? window.cpv123MakeSnapshot(function() { civ.knowledge = old; saveCivs(); }) : null;
    civ.knowledge = (civ.knowledge || 0) + amount;
    civ.grantedKnowledge = civ.grantedKnowledge || [];
    civ.grantedKnowledge.push({ name: knowledgeName, year: window.year || 1 });
    saveCivs();
    window.cpv123LogAction("civilization", "📜 Ban Tri Thức: " + knowledgeName + " → " + civ.name, "+" + amount + " knowledge", snap);
  };

  window.cpv123BoostCivPop = function(civId, amount) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    amount = amount || 100000;
    var civs = getCivs();
    var civ = civId ? civs.find(function(c) { return c.id === civId; }) : civs[0];
    if (!civ) return;
    var old = civ.population;
    var snap = window.cpv123MakeSnapshot ? window.cpv123MakeSnapshot(function() { civ.population = old; saveCivs(); }) : null;
    civ.population = (civ.population || 0) + amount;
    civ.growthHistory.push({ year: window.year || 1, pop: civ.population });
    saveCivs();
    window.cpv123LogAction("civilization", "👥 Tăng Dân Số: " + civ.name, "+" + amount.toLocaleString() + " → " + civ.population.toLocaleString(), snap);
  };

  window.cpv123ChangeLeader = function(civId, newLeader) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    var civs = getCivs();
    var civ = civId ? civs.find(function(c) { return c.id === civId; }) : civs[0];
    if (!civ) return;
    var old = civ.leader;
    newLeader = newLeader || ("Thần Sứ " + ["Aria", "Zephyr", "Lyra", "Orion", "Nova"][Math.floor(Math.random()*5)]);
    var snap = window.cpv123MakeSnapshot ? window.cpv123MakeSnapshot(function() { civ.leader = old; saveCivs(); }) : null;
    civ.leader = newLeader;
    civ.leaderHistory = civ.leaderHistory || [];
    civ.leaderHistory.push({ name: old || "Vô Danh", endYear: window.year || 1 });
    saveCivs();
    window.cpv123LogAction("civilization", "👑 Thay Đổi Lãnh Đạo: " + civ.name, (old || "Vô Danh") + " → " + newLeader, snap);
  };

  window.cpv123TechNames = TECH_NAMES;
  window.cpv123KnowledgeNames = KNOWLEDGE_NAMES;
  window.cpv123GetCivs = getCivs;

  function init() {
    console.log("[CreatorCivPowers V123] 🏛️ Civilization Powers khởi động — Tạo VMinh · Ban Công Nghệ · Tri Thức · Dân Số · Lãnh Đạo sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 29600); });
  } else {
    setTimeout(init, 29600);
  }
})();
