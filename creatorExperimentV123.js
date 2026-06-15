(function() {
  "use strict";
  const SAVE_KEY = "cgv6_creator_experiment_v123";
  const MAX_TIMELINES = 5;

  window.cpv123ExpData = {
    timelines: [],
    activeComparison: null,
    nextId: 1
  };

  function save() {
    try {
      var d = { timelines: window.cpv123ExpData.timelines.map(function(t) {
        return { id: t.id, name: t.name, year: t.year, ts: t.ts, summary: t.summary };
      }), nextId: window.cpv123ExpData.nextId };
      localStorage.setItem(SAVE_KEY, JSON.stringify(d));
    } catch(e) {}
  }

  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (raw) { var d = JSON.parse(raw); Object.assign(window.cpv123ExpData, d); }
    } catch(e) {}
  }

  function snapshotWorld() {
    var civs = (window.cecV95Data && window.cecV95Data.civs) ? window.cecV95Data.civs.map(function(c) {
      return { id: c.id, name: c.name, population: c.population, techPoints: c.techPoints, knowledge: c.knowledge, stageId: c.stageId };
    }) : [];
    var species = (window.spv93Data && window.spv93Data.species) ? window.spv93Data.species.map(function(s) {
      return { id: s.id, name: s.name, population: s.population, birthRate: s.birthRate, deathRate: s.deathRate };
    }) : [];
    var totalPop = species.reduce(function(acc, s) { return acc + (s.population || 0); }, 0);
    var totalCivPop = civs.reduce(function(acc, c) { return acc + (c.population || 0); }, 0);
    var wars = window.warsActive ? (Array.isArray(window.warsActive) ? window.warsActive.length : Object.keys(window.warsActive).length) : 0;
    return {
      year: window.year || 1,
      civCount: civs.length,
      totalPop: totalPop + totalCivPop,
      wars: wars,
      civs: civs,
      species: species,
      interventions: window.cpv123Data ? window.cpv123Data.totalInterventions : 0
    };
  }

  window.cpv123ForkTimeline = function(name) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    if (window.cpv123ExpData.timelines.length >= MAX_TIMELINES) {
      alert("Tối đa " + MAX_TIMELINES + " dòng thời gian. Hãy xóa một cái trước.");
      return;
    }
    name = name || ("Timeline " + String.fromCharCode(65 + window.cpv123ExpData.timelines.length));
    var snap = snapshotWorld();
    var tl = {
      id: "tl_" + (window.cpv123ExpData.nextId++),
      name: name,
      year: snap.year,
      ts: Date.now(),
      snapshot: snap,
      summary: snap.civCount + " văn minh · " + snap.totalPop.toLocaleString() + " dân · " + snap.wars + " chiến tranh",
      history: window.cpv123Data ? window.cpv123Data.history.slice(0, 20) : []
    };
    window.cpv123ExpData.timelines.push(tl);
    save();
    window.cpv123LogAction("experiment", "🔬 Fork Timeline: " + name, "Năm " + snap.year + " · " + tl.summary);
    if (typeof window.jarvisToast === "function") window.jarvisToast("🔬 Đã lưu " + name + " — năm " + snap.year, 3000);
    if (typeof window.cpv123RegistryRender === "function") window.cpv123RegistryRender();
    return tl;
  };

  window.cpv123DeleteTimeline = function(tlId) {
    window.cpv123ExpData.timelines = window.cpv123ExpData.timelines.filter(function(t) { return t.id !== tlId; });
    save();
    if (typeof window.cpv123RegistryRender === "function") window.cpv123RegistryRender();
  };

  window.cpv123CompareTimelines = function(idA, idB) {
    var A = window.cpv123ExpData.timelines.find(function(t) { return t.id === idA; });
    var B = window.cpv123ExpData.timelines.find(function(t) { return t.id === idB; });
    if (!A || !B) return null;
    var snapCurrent = snapshotWorld();
    var result = {
      A: { name: A.name, snap: A.snapshot },
      B: { name: B.name || "Hiện Tại", snap: B ? B.snapshot : snapCurrent },
      diffs: {}
    };
    var snapA = A.snapshot;
    var snapB = B ? B.snapshot : snapCurrent;
    result.diffs.civCount = (snapB.civCount || 0) - (snapA.civCount || 0);
    result.diffs.totalPop = (snapB.totalPop || 0) - (snapA.totalPop || 0);
    result.diffs.wars = (snapB.wars || 0) - (snapA.wars || 0);
    result.diffs.years = (snapB.year || 0) - (snapA.year || 0);
    window.cpv123ExpData.activeComparison = result;
    return result;
  };

  window.cpv123CompareWithCurrent = function(tlId) {
    var tl = window.cpv123ExpData.timelines.find(function(t) { return t.id === tlId; });
    if (!tl) return null;
    var current = snapshotWorld();
    var result = {
      A: { name: tl.name, snap: tl.snapshot },
      B: { name: "Hiện Tại (Năm " + current.year + ")", snap: current },
      diffs: {
        civCount: current.civCount - (tl.snapshot.civCount || 0),
        totalPop: current.totalPop - (tl.snapshot.totalPop || 0),
        wars: current.wars - (tl.snapshot.wars || 0),
        years: current.year - tl.snapshot.year,
        interventions: current.interventions - (tl.snapshot.interventions || 0)
      }
    };
    window.cpv123ExpData.activeComparison = result;
    return result;
  };

  window.cpv123RenderComparison = function(result) {
    if (!result) return "<p>Chưa có so sánh nào.</p>";
    var diff = result.diffs;
    function fmt(v) { return (v > 0 ? "+" : "") + (v || 0).toLocaleString(); }
    function clr(v) { return v > 0 ? "#34d399" : v < 0 ? "#f87171" : "#9ca3af"; }
    return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px">' +
      '<div style="background:#1e293b;border-radius:8px;padding:12px">' +
        '<div style="color:#94a3b8;font-size:11px;margin-bottom:4px">📍 ' + result.A.name + ' (Năm ' + result.A.snap.year + ')</div>' +
        '<div>🏛️ ' + (result.A.snap.civCount || 0) + ' văn minh</div>' +
        '<div>👥 ' + (result.A.snap.totalPop || 0).toLocaleString() + ' dân</div>' +
        '<div>⚔️ ' + (result.A.snap.wars || 0) + ' chiến tranh</div>' +
      '</div>' +
      '<div style="background:#1e293b;border-radius:8px;padding:12px">' +
        '<div style="color:#94a3b8;font-size:11px;margin-bottom:4px">🔮 ' + result.B.name + ' (Năm ' + result.B.snap.year + ')</div>' +
        '<div>🏛️ ' + (result.B.snap.civCount || 0) + ' văn minh</div>' +
        '<div>👥 ' + (result.B.snap.totalPop || 0).toLocaleString() + ' dân</div>' +
        '<div>⚔️ ' + (result.B.snap.wars || 0) + ' chiến tranh</div>' +
      '</div></div>' +
      '<div style="background:#0f172a;border-radius:8px;padding:12px;margin-top:8px">' +
        '<div style="color:#f59e0b;font-weight:600;margin-bottom:8px">📊 Sự Thay Đổi</div>' +
        '<div>🏛️ Văn minh: <span style="color:' + clr(diff.civCount) + '">' + fmt(diff.civCount) + '</span></div>' +
        '<div>👥 Dân số: <span style="color:' + clr(diff.totalPop) + '">' + fmt(diff.totalPop) + '</span></div>' +
        '<div>⚔️ Chiến tranh: <span style="color:' + clr(diff.wars) + '">' + fmt(diff.wars) + '</span></div>' +
        '<div>📅 Năm trôi qua: <span style="color:#60a5fa">+' + (diff.years || 0) + ' năm</span></div>' +
        (diff.interventions !== undefined ? '<div>⚡ Can thiệp: <span style="color:#c084fc">+' + (diff.interventions || 0) + ' lần</span></div>' : '') +
      '</div>';
  };

  function init() {
    load();
    console.log("[CreatorExperiment V123] 🔬 World Experiment Mode khởi động —", window.cpv123ExpData.timelines.length, "timelines · Fork & Compare sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 29900); });
  } else {
    setTimeout(init, 29900);
  }
})();
