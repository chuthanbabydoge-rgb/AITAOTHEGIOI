(function() {
  "use strict";

  // V117 — UWS Event Aggregator
  // Đọc wars/disasters/plagues/crises/events từ SSOT, KHÔNG lưu, KHÔNG ghi đè

  window.uwsGetEventSnapshot = function() {

    // ── Wars ──
    var warSnap = { active: 0, list: [] };
    try {
      var wars = Array.isArray(window.warsActive) ? window.warsActive : [];
      warSnap = {
        active: wars.length,
        list: wars.slice(0, 8).map(function(w) {
          return { id: w.id||"", attacker: w.attacker||w.attackerName||"", defender: w.defender||w.defenderName||"", year: w.year||0, type: w.type||"" };
        })
      };
    } catch(e) {}

    // ── Disasters (V25) ──
    var disSnap = { active: 0, list: [] };
    try {
      var dd = window.disasterData || {};
      var dis = Array.isArray(dd.active) ? dd.active : (dd.disasters ? dd.disasters : []);
      disSnap = {
        active: dis.length,
        list: dis.slice(0, 5).map(function(d) {
          return { id: d.id||"", type: d.type||"", severity: d.severity||d.level||1, target: d.target||d.region||"", year: d.year||0 };
        })
      };
    } catch(e) {}

    // ── Plagues (V25) ──
    var plagueSnap = { active: 0, list: [] };
    try {
      var pd = window.plagueData || {};
      var plagues = Array.isArray(pd.active) ? pd.active : (pd.plagues ? pd.plagues : []);
      plagueSnap = {
        active: plagues.length,
        list: plagues.slice(0, 5).map(function(p) {
          return { id: p.id||"", name: p.name||"", severity: p.severity||1, spread: p.spread||0 };
        })
      };
    } catch(e) {}

    // ── Economic Crises (V25) ──
    var crisisSnap = { active: 0, list: [] };
    try {
      var ec = window.econCrisisData || {};
      var crises = Array.isArray(ec.active) ? ec.active : (ec.crises ? ec.crises : []);
      crisisSnap = {
        active: crises.length,
        list: crises.slice(0, 5).map(function(c) {
          return { id: c.id||"", type: c.type||"", impact: c.impact||0, year: c.year||0 };
        })
      };
    } catch(e) {}

    // ── World Events V25 ──
    var worldEvtSnap = { recent: [] };
    try {
      var we = window.worldEventV25Data || {};
      var evts = Array.isArray(we.events) ? we.events : (we.recent ? we.recent : []);
      worldEvtSnap = {
        recent: evts.slice(0, 8).map(function(e) {
          return { id: e.id||"", type: e.type||"", title: e.title||"", year: e.year||0 };
        })
      };
    } catch(e) {}

    // ── Alliances (V24) ──
    var allySnap = { total: 0, list: [] };
    try {
      var ad = window.allianceData || {};
      var allies = Array.isArray(ad.alliances) ? ad.alliances : (ad.list ? ad.list : Object.values(ad).filter(function(x) { return x && x.id; }));
      allySnap = {
        total: allies.length,
        list: allies.slice(0, 6).map(function(a) {
          return { id: a.id||"", name: a.name||"", members: (a.members||[]).length, type: a.type||"" };
        })
      };
    } catch(e) {}

    // ── Treaties (V24) ──
    var treatySnap = { total: 0 };
    try {
      var td = window.treatyData || {};
      var treaties = Array.isArray(td.treaties) ? td.treaties : (td.list ? td.list : []);
      treatySnap = { total: treaties.length };
    } catch(e) {}

    // ── Sanctions (V24) ──
    var sanctionSnap = { total: 0 };
    try {
      var sd = window.sanctionData || {};
      var sanctions = Array.isArray(sd.sanctions) ? sd.sanctions : (sd.list ? sd.list : []);
      sanctionSnap = { total: sanctions.length };
    } catch(e) {}

    // ── World Council (V24) ──
    var councilSnap = { active: false, members: 0 };
    try {
      var wcd = window.worldCouncilData || {};
      councilSnap = {
        active: !!(wcd.active || wcd.founded),
        members: (wcd.members || []).length,
        resolutions: (wcd.resolutions || []).length,
      };
    } catch(e) {}

    // ── Autonomous Events (V92) ──
    var autoEvtSnap = { recent: [] };
    try {
      var ae = window.aeeData || window.autonomousEventData || {};
      var aevts = Array.isArray(ae.history) ? ae.history : (ae.events ? ae.events : []);
      autoEvtSnap = {
        recent: aevts.slice(-5).map(function(e) {
          return { type: e.type||"", title: e.title||"", year: e.year||0 };
        })
      };
    } catch(e) {}

    return {
      wars:       warSnap,
      disasters:  disSnap,
      plagues:    plagueSnap,
      crises:     crisisSnap,
      worldEvents:worldEvtSnap,
      alliances:  allySnap,
      treaties:   treatySnap,
      sanctions:  sanctionSnap,
      council:    councilSnap,
      autoEvents: autoEvtSnap,
    };
  };

  function init() {
    console.log("[UWS EventAgg V117] ✅ Event Aggregator sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 26300); });
  } else {
    setTimeout(init, 26300);
  }
})();
