(function() {
"use strict";
// ============================================================
// EVENT IMPACT SYSTEM V59 — Tác Động Sự Kiện Thực Tế
// Connects scheduled events → Political · Economic · War · Religion · Civilization
// EXPAND ONLY · KHÔNG GHI ĐÈ file cũ
// ============================================================
const SAVE_KEY   = "cgv6_event_impact_v59";
const INIT_DELAY = 10800;

const IMPACT_MAP = {
  world_war: {
    desc: "Đại Chiến Toàn Cầu bùng phát — toàn bộ thế giới rung chuyển",
    applyFn: function() {
      var affected = [];
      if (window.countries && Array.isArray(window.countries)) {
        window.countries.forEach(function(c) {
          if (c && Math.random() < 0.6) {
            if (typeof c.stability === "number") c.stability = Math.max(0, c.stability - 20);
            if (typeof c.economy === "number") c.economy = Math.max(0, c.economy - 15);
            affected.push(c.name || "?");
          }
        });
      }
      if (window.criV49Trigger && typeof window.criV49Trigger === "function") {
        var arr = window.countries || [];
        if (arr.length > 0) {
          var tgt = arr[Math.floor(Math.random()*arr.length)];
          if (tgt) window.criV49Trigger("CIVIL_WAR", tgt.name || "Quốc Gia", 1, "Đại Chiến kéo theo");
        }
      }
      return { type:"world_war", affected: affected.length };
    }
  },
  great_plague: {
    desc: "Đại Dịch tràn lan — dân số và kinh tế suy giảm nặng",
    applyFn: function() {
      var affected = 0;
      if (window.countries && Array.isArray(window.countries)) {
        window.countries.forEach(function(c) {
          if (c && Math.random() < 0.7) {
            if (typeof c.population === "number") c.population = Math.max(100, Math.floor(c.population * 0.88));
            if (typeof c.economy === "number") c.economy = Math.max(0, c.economy - 20);
            affected++;
          }
        });
      }
      if (window.plagueData && window.plagueData.activePlagues) {
        var newPlague = { name:"Đại Ôn Dịch V59", severity:3, year: typeof window.year!=="undefined"?window.year:0, spread:0.8 };
        window.plagueData.activePlagues.push(newPlague);
      }
      return { type:"great_plague", affected: affected };
    }
  },
  golden_era: {
    desc: "Kỷ Nguyên Vàng — văn minh và kinh tế thăng hoa rực rỡ",
    applyFn: function() {
      var affected = 0;
      if (window.countries && Array.isArray(window.countries)) {
        window.countries.forEach(function(c) {
          if (c) {
            if (typeof c.economy === "number") c.economy = Math.min(100, c.economy + 15);
            if (typeof c.stability === "number") c.stability = Math.min(100, c.stability + 10);
            if (typeof c.culture === "number") c.culture = Math.min(100, c.culture + 20);
            affected++;
          }
        });
      }
      return { type:"golden_era", affected: affected };
    }
  },
  dark_era: {
    desc: "Kỷ Nguyên Bóng Tối — bất ổn và sụp đổ lan rộng",
    applyFn: function() {
      var affected = 0;
      if (window.countries && Array.isArray(window.countries)) {
        window.countries.forEach(function(c) {
          if (c && Math.random() < 0.5) {
            if (typeof c.stability === "number") c.stability = Math.max(0, c.stability - 25);
            if (typeof c.economy === "number") c.economy = Math.max(0, c.economy - 20);
            affected++;
          }
        });
      }
      return { type:"dark_era", affected: affected };
    }
  },
  great_disaster: {
    desc: "Thiên Tai Toàn Cầu — môi trường và dân số chịu tổn thất",
    applyFn: function() {
      var affected = 0;
      if (window.countries && Array.isArray(window.countries)) {
        window.countries.forEach(function(c) {
          if (c && Math.random() < 0.5) {
            if (typeof c.population === "number") c.population = Math.max(100, Math.floor(c.population * 0.92));
            affected++;
          }
        });
      }
      if (window.gdV48TriggerGlobal && typeof window.gdV48TriggerGlobal === "function") {
        var types = ["EARTHQUAKE","VOLCANO","FLOOD","DROUGHT"];
        window.gdV48TriggerGlobal(types[Math.floor(Math.random()*types.length)]);
      }
      return { type:"great_disaster", affected: affected };
    }
  },
  great_discovery: {
    desc: "Khám Phá Vĩ Đại — tri thức và công nghệ nhảy vọt",
    applyFn: function() {
      if (window.countries && Array.isArray(window.countries)) {
        window.countries.forEach(function(c) {
          if (c && Math.random() < 0.4) {
            if (typeof c.technology === "number") c.technology = Math.min(100, c.technology + 15);
          }
        });
      }
      return { type:"great_discovery" };
    }
  },
  divine_awakening: {
    desc: "Thần Thánh Thức Tỉnh — năng lượng thần thánh lan tràn",
    applyFn: function() {
      if (window.countries && Array.isArray(window.countries)) {
        window.countries.forEach(function(c) {
          if (c) {
            if (typeof c.divineInfluence === "number") c.divineInfluence = Math.min(100, c.divineInfluence + 20);
          }
        });
      }
      return { type:"divine_awakening" };
    }
  },
  multiverse_rift: {
    desc: "Vết Nứt Đa Vũ Trụ — thực thể từ vũ trụ khác xâm nhập",
    applyFn: function() {
      if (window.mvdV48Trigger && typeof window.mvdV48Trigger === "function") {
        window.mvdV48Trigger("RIFT", "primary", 3);
      }
      return { type:"multiverse_rift" };
    }
  }
};

window.eventImpactV59Data = {
  impactLog: [],
  totalImpacts: 0,
  initialized: false
};

function _save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      impactLog: window.eventImpactV59Data.impactLog.slice(0, 100),
      totalImpacts: window.eventImpactV59Data.totalImpacts
    }));
  } catch(e) {}
}
function _load() {
  try {
    var r = localStorage.getItem(SAVE_KEY);
    if (r) { var p = JSON.parse(r); if (p) Object.assign(window.eventImpactV59Data, p); }
  } catch(e) {}
}

function _applyImpact(ev) {
  var imp = IMPACT_MAP[ev.defId];
  if (!imp) return;
  var result = imp.applyFn();
  var log = {
    year: ev.year || (typeof window.year!=="undefined" ? window.year : 0),
    eventId: ev.id,
    defId: ev.defId,
    label: ev.label,
    desc: imp.desc,
    result: result
  };
  window.eventImpactV59Data.impactLog.unshift(log);
  if (window.eventImpactV59Data.impactLog.length > 100) window.eventImpactV59Data.impactLog.length = 100;
  window.eventImpactV59Data.totalImpacts++;
  _save();
}

window.eis59GetLog    = function() { return window.eventImpactV59Data.impactLog; };
window.eis59GetStats  = function() { return { totalImpacts: window.eventImpactV59Data.totalImpacts, logSize: window.eventImpactV59Data.impactLog.length }; };
window.eis59GetMap    = function() { return Object.keys(IMPACT_MAP).map(function(k){ return { id:k, desc:IMPACT_MAP[k].desc }; }); };

function init() {
  _load();
  window.eventImpactV59Data.initialized = true;
  window.ges59OnEventFire = function(ev) { _applyImpact(ev); };
  console.log("[EventImpactSystemV59] ⚡ Tác Động Sự Kiện V59 — " + Object.keys(IMPACT_MAP).length + " loại tác động · Kết nối Politics/Economy/War/Religion sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
