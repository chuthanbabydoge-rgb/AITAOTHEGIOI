(function() {
  "use strict";
  const SAVE_KEY = "cgv6_event_digest_v55";

  window.eventDigestData = {
    offlineDigest: null,
    onlineDigest: [],
    shown: false,
    totalDigests: 0,
    version: "V55"
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.eventDigestData)); } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) Object.assign(window.eventDigestData, JSON.parse(d));
    } catch(e) {}
  }

  function getYear() { return (typeof window.year === "number") ? window.year : 0; }

  function buildOfflineDigest() {
    var offlineYears = (typeof window.puv55GetOfflineYears === "function") ? window.puv55GetOfflineYears() : 0;
    if (offlineYears <= 0) return null;

    var offlineEvents = (typeof window.owp55GetOfflineEvents === "function") ? window.owp55GetOfflineEvents() : [];
    var warOutcomes = (typeof window.owp55GetWarOutcomes === "function") ? window.owp55GetWarOutcomes() : [];
    var econ = (typeof window.owp55GetEconomicShifts === "function") ? window.owp55GetEconomicShifts() : [];
    var heroes = (typeof window.owp55GetHeroEvents === "function") ? window.owp55GetHeroEvents() : [];
    var disasters = (typeof window.owp55GetDisasterEvents === "function") ? window.owp55GetDisasterEvents() : [];
    var kingdoms = (typeof window.owp55GetKingdomChanges === "function") ? window.owp55GetKingdomChanges() : [];

    var sections = [];
    if (warOutcomes.length > 0) {
      sections.push({ icon: "⚔️", title: "Chiến Tranh (" + warOutcomes.length + " trận)", items: warOutcomes.map(function(w) { return w.outcome + " [Tác động: " + w.impact + "]"; }) });
    }
    if (kingdoms.length > 0) {
      sections.push({ icon: "👑", title: "Thay Đổi Vương Quốc (" + kingdoms.length + ")", items: kingdoms.map(function(k) { return k.event; }) });
    }
    if (heroes.length > 0) {
      sections.push({ icon: "⭐", title: "Anh Hùng (" + heroes.length + ")", items: heroes.map(function(h) { return h.event; }) });
    }
    if (disasters.length > 0) {
      sections.push({ icon: "🌋", title: "Thảm Họa (" + disasters.length + ")", items: disasters.map(function(d) { return d.event; }) });
    }
    if (econ.length > 0) {
      sections.push({ icon: "💹", title: "Kinh Tế (" + econ.length + ")", items: econ.map(function(e) { return e.event; }) });
    }

    return {
      type: "offline",
      year: getYear(),
      offlineYears: offlineYears,
      totalEvents: offlineEvents.length,
      sections: sections,
      summary: "Trong " + offlineYears + " năm vắng mặt, " + offlineEvents.length + " sự kiện đã xảy ra.",
      ts: Date.now()
    };
  }

  window.eds55ShowDigest = function() {
    var digest = window.eventDigestData.offlineDigest;
    if (!digest || digest.sections.length === 0) return;
    var el = document.getElementById("eds55-modal");
    if (!el) {
      el = document.createElement("div");
      el.id = "eds55-modal";
      el.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;";
      el.innerHTML = '<div style="background:#1a1a2e;border:2px solid #9b59b6;border-radius:12px;padding:24px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;color:#fff;font-family:serif;">' +
        '<div style="text-align:center;margin-bottom:16px;">' +
        '<div style="font-size:2em;">🌙</div>' +
        '<h2 style="color:#9b59b6;margin:8px 0;">BÁO CÁO LỊCH SỬ</h2>' +
        '<p style="color:#aaa;font-size:0.9em;">Trong khi bạn vắng mặt...</p>' +
        '<p style="color:#e0e0e0;">' + digest.summary + '</p></div>' +
        digest.sections.map(function(s) {
          return '<div style="margin:12px 0;padding:10px;background:#0d0d1a;border-radius:8px;border-left:3px solid #9b59b6;">' +
            '<div style="font-weight:bold;color:#c39bd3;margin-bottom:6px;">' + s.icon + ' ' + s.title + '</div>' +
            s.items.slice(0, 5).map(function(item) { return '<div style="color:#ddd;padding:2px 0;font-size:0.85em;">• ' + item + '</div>'; }).join('') +
            '</div>';
        }).join('') +
        '<div style="text-align:center;margin-top:16px;">' +
        '<button onclick="document.getElementById(\'eds55-modal\').remove();" style="background:#9b59b6;color:#fff;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-size:1em;">📜 Tiếp Tục Hành Trình</button></div></div>';
      document.body.appendChild(el);
    }
    window.eventDigestData.shown = true;
    save();
  };

  window.eds55AddOnlineEvent = function(icon, title, detail) {
    var entry = { year: getYear(), icon: icon, title: title, detail: detail || "", ts: Date.now() };
    window.eventDigestData.onlineDigest.unshift(entry);
    if (window.eventDigestData.onlineDigest.length > 100) window.eventDigestData.onlineDigest.length = 100;
  };

  window.eds55GetOfflineDigest = function() { return window.eventDigestData.offlineDigest; };
  window.eds55GetOnlineEvents = function(limit) { return window.eventDigestData.onlineDigest.slice(0, limit || 30); };
  window.eds55GetStats = function() {
    var d = window.eventDigestData;
    return { hasOfflineDigest: !!d.offlineDigest, offlineYears: d.offlineDigest ? d.offlineDigest.offlineYears : 0, onlineEvents: d.onlineDigest.length, shown: d.shown, totalDigests: d.totalDigests };
  };

  function init() {
    load();

    var digest = buildOfflineDigest();
    if (digest) {
      window.eventDigestData.offlineDigest = digest;
      window.eventDigestData.shown = false;
      window.eventDigestData.totalDigests++;
      save();

      setTimeout(function() {
        if (!window.eventDigestData.shown) {
          window.eds55ShowDigest();
        }
      }, 3000);
    }

    save();
    console.log("[EventDigestSystem V55] 📋 Hệ Thống Digest khởi động — Offline digest: " + (digest ? digest.offlineYears + " năm · " + digest.totalEvents + " sự kiện" : "Không có") + " · sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 8700); });
  } else {
    setTimeout(init, 8700);
  }
})();
