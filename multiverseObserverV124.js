(function() {
  "use strict";

  window.mvObserverV124 = {
    currentObserving: null,
    visitLog: [],
    exportedPackages: []
  };

  window.mvo124ObserveUniverse = function(universeId) {
    var u = window.mvr124GetById ? window.mvr124GetById(universeId) : null;
    if (!u) return null;
    window.mvObserverV124.currentObserving = universeId;
    var logEntry = { universeId: universeId, universeName: u.universeName, visitedAt: window.year || 1, readOnly: true };
    window.mvObserverV124.visitLog.unshift(logEntry);
    if (window.mvObserverV124.visitLog.length > 50) window.mvObserverV124.visitLog.pop();
    return u;
  };

  window.mvo124StopObserving = function() {
    window.mvObserverV124.currentObserving = null;
  };

  window.mvo124GetCurrentObserved = function() {
    var id = window.mvObserverV124.currentObserving;
    if (!id) return null;
    return window.mvr124GetById ? window.mvr124GetById(id) : null;
  };

  window.mvo124ExportUniverse = function(universeId) {
    var u = window.mvr124GetById ? window.mvr124GetById(universeId) : null;
    if (!u) return null;
    var timeline = [];
    if (universeId === "u_player" && window.htData && window.htData.events) {
      timeline = window.htData.events.slice(0, 100);
    }
    var history = [];
    if (universeId === "u_player" && window.wmeData && window.wmeData.memories) {
      history = window.wmeData.memories.slice(0, 50);
    }
    var civData = [];
    if (universeId === "u_player") {
      var countries = window.countries;
      if (!Array.isArray(countries)) countries = (countries && typeof countries === "object") ? Object.values(countries) : [];
      civData = countries.map(function(c) {
        return { name: c.name, population: c.population || 0, stability: c.stability || 50, culture: c.culture || "Unknown" };
      });
    } else {
      civData = [{ name: u.universeName + " (Demo Data)", population: u.population, civilizations: u.civilizationCount }];
    }
    var worldState = {
      name: u.universeName,
      genre: u.genre,
      age: u.age,
      population: u.population,
      civilizationCount: u.civilizationCount,
      seed: u.worldSeed,
      maturity: u.maturityTier
    };
    var pkg = {
      packageId: "CGV6-PKG-" + Date.now(),
      universeId: u.universeId,
      universeName: u.universeName,
      creatorName: u.creatorName,
      exportedAt: window.year || 1,
      timeline: timeline,
      history: history,
      civData: civData,
      worldState: worldState,
      version: "V124"
    };
    window.mvObserverV124.exportedPackages.unshift(pkg);
    if (window.mvObserverV124.exportedPackages.length > 10) window.mvObserverV124.exportedPackages.pop();
    return pkg;
  };

  window.mvo124ImportPackage = function(pkg) {
    if (!pkg || !pkg.universeId || !pkg.universeName) return null;
    var newId = "u_import_" + Date.now();
    var imported = {
      universeId: newId,
      universeName: pkg.universeName + " (Import)",
      creatorId: "c_player",
      creatorName: pkg.creatorName || "Imported",
      age: pkg.worldState ? pkg.worldState.age : 0,
      population: pkg.worldState ? pkg.worldState.population : 0,
      civilizationCount: pkg.worldState ? pkg.worldState.civilizationCount : 0,
      worldSeed: pkg.worldState ? pkg.worldState.seed : "CGV6-IMP-0000",
      genre: pkg.worldState ? pkg.worldState.genre : "custom",
      maturityTier: pkg.worldState ? pkg.worldState.maturity : "Phôi Thai",
      isPublic: false,
      isImported: true,
      importedFrom: pkg.packageId,
      tags: ["imported"],
      description: "Universe nhập từ package " + pkg.packageId
    };
    if (window.mvRegistryV124Data) {
      window.mvRegistryV124Data.universes.push(imported);
    }
    return imported;
  };

  window.mvo124GetVisitLog = function() { return window.mvObserverV124.visitLog; };
  window.mvo124GetPackages  = function() { return window.mvObserverV124.exportedPackages; };

  function renderObservation(u) {
    var genreColors = { cultivation:"#f59e0b", fantasy:"#60a5fa", scifi:"#34d399", mythology:"#a855f7", zombie:"#ef4444", custom:"#94a3b8" };
    var gc = genreColors[u.genre] || "#94a3b8";
    return '<div style="background:#0f172a;border:1px solid ' + gc + '44;border-radius:12px;padding:16px;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
        '<div><div style="font-size:16px;font-weight:800;color:' + gc + '">' + u.universeName + '</div>' +
          '<div style="color:#64748b;font-size:11px">Đang quan sát — Chỉ Đọc 🔒</div></div>' +
        '<button onclick="window.mvo124StopObserving();window.mvp124HubRender(\'directory\')" style="background:#374151;color:#9ca3af;border:none;border-radius:6px;padding:6px 12px;cursor:pointer;font-size:12px">✕ Dừng Quan Sát</button>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">' +
        statCard("🌍 Thế Giới", u.universeName.split("—")[0].trim(), gc) +
        statCard("👥 Dân Số", (u.population || 0).toLocaleString(), "#e2e8f0") +
        statCard("🏛️ Văn Minh", u.civilizationCount + " civ", "#a855f7") +
        statCard("⏰ Tuổi", u.age + " năm", "#60a5fa") +
        statCard("🌱 Trưởng Thành", u.maturityTier, "#34d399") +
        statCard("🎭 Thể Loại", u.genre, gc) +
      '</div>' +
      '<div style="background:#1e293b;border-radius:8px;padding:10px;margin-bottom:10px">' +
        '<div style="color:#94a3b8;font-size:12px;line-height:1.6">' + (u.description || "Không có mô tả.") + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        (u.tags || []).map(function(t) { return '<span style="background:' + gc + '22;color:' + gc + ';border-radius:12px;padding:2px 10px;font-size:11px">' + t + '</span>'; }).join("") +
      '</div>' +
      '<div style="margin-top:12px;padding:10px;background:#0a0c10;border-radius:8px;color:#64748b;font-size:11px">⚠️ Chế độ Quan Sát: Bạn không thể can thiệp vào universe này. Chỉ xem.</div>' +
    '</div>';
  }

  function statCard(label, value, color) {
    return '<div style="background:#1e293b;border-radius:8px;padding:8px;text-align:center">' +
      '<div style="color:#64748b;font-size:10px">' + label + '</div>' +
      '<div style="color:' + (color || "#e2e8f0") + ';font-weight:700;font-size:13px;margin-top:2px">' + value + '</div>' +
    '</div>';
  }

  window.mvo124RenderObservation = renderObservation;

  setTimeout(function() {
    console.log("[MultiverseObserver V124] 👁️ Cross-Universe Observation · Export/Import Universe Package sẵn sàng.");
  }, 30300);
})();
