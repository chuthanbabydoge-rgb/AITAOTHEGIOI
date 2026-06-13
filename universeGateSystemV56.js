(function() {
  "use strict";
  const SAVE_KEY = "cgv6_cx_gate_v56";

  const GATE_TIERS = [
    { tier: 1, name: "Cổng Sơ Khai",    icon: "🔵", cost: 5000,   toll: 50,   slots: 2,  stability: 60, desc: "Cổng cơ bản, không ổn định" },
    { tier: 2, name: "Cổng Bạc",        icon: "⚪", cost: 20000,  toll: 200,  slots: 4,  stability: 75, desc: "Cổng cấp 2, ổn định hơn" },
    { tier: 3, name: "Cổng Vàng",       icon: "🟡", cost: 80000,  toll: 800,  slots: 8,  stability: 85, desc: "Cổng cao cấp, lưu lượng lớn" },
    { tier: 4, name: "Cổng Thần",       icon: "🟣", cost: 500000, toll: 5000, slots: 20, stability: 95, desc: "Cổng thần thánh, gần như vĩnh cửu" },
    { tier: 5, name: "Cổng Tạo Hóa",   icon: "⭐", cost: 0,      toll: 0,    slots: 999,stability: 100, desc: "Cổng của Đấng Tạo Hóa" }
  ];

  const GATE_EVENTS = [
    { id: "surge",    icon: "⚡", name: "Năng Lượng Bùng Phát",   effect: "stability+10 · income×2 (10 tick)" },
    { id: "collapse", icon: "💥", name: "Cổng Bất Ổn",           effect: "stability-20 · cần sửa chữa" },
    { id: "raid",     icon: "⚔️", name: "Cướp Cổng",             effect: "mất toll 5 tick" },
    { id: "discover", icon: "🔭", name: "Phát Hiện Tuyến Mới",   effect: "mở tuyến bí ẩn" },
    { id: "blessing", icon: "✨", name: "Phước Lành Tạo Hóa",    effect: "stability 100% · income×3 (20 tick)" }
  ];

  window.gateV56Data = {
    playerGates: [],
    aiGates: [],
    gateEvents: [],
    totalTollCollected: 0,
    totalTravelers: 0,
    tick: 0,
    version: "V56"
  };

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.gateV56Data)); } catch(e) {} }
  function load() {
    try { var d = localStorage.getItem(SAVE_KEY); if (d) Object.assign(window.gateV56Data, JSON.parse(d)); } catch(e) {}
  }

  function getUniverseList() {
    if (typeof window.mvData !== "undefined" && window.mvData && window.mvData.universes) {
      return Object.values(window.mvData.universes);
    }
    return [{ id: "default", name: "Vũ Trụ Chính" }];
  }

  window.g56BuildGate = function(fromUid, toUid, tier) {
    var tierData = GATE_TIERS[Math.min((tier || 1) - 1, GATE_TIERS.length - 1)];
    var currency = typeof window.playerEconCoreV52 !== "undefined" ? window.playerEconCoreV52.gold || 0 : 0;
    if (tier < 5 && currency < tierData.cost) return { ok: false, msg: "Không đủ vàng (cần " + tierData.cost + ")" };

    var unis = getUniverseList();
    var fromU = unis.find(function(u) { return u.id === fromUid; }) || { id: fromUid, name: "Vũ Trụ " + fromUid };
    var toU   = unis.find(function(u) { return u.id === toUid; }) || { id: toUid, name: "Vũ Trụ " + toUid };

    var gate = {
      id: "gate_" + Date.now(),
      tier: tierData.tier,
      tierName: tierData.name,
      tierIcon: tierData.icon,
      fromUid: fromUid, fromName: fromU.name,
      toUid: toUid, toName: toU.name,
      stability: tierData.stability,
      toll: tierData.toll,
      slots: tierData.slots,
      activeTravelers: 0,
      totalRevenue: 0,
      isOpen: true,
      builtAt: (typeof window.year === "number") ? window.year : 0,
      owner: "player",
      buffs: []
    };

    window.gateV56Data.playerGates.push(gate);
    if (typeof window.g56PassportData !== "undefined") {
      window.g56PassportData.unlockedRoutes = window.g56PassportData.unlockedRoutes || [];
      window.g56PassportData.unlockedRoutes.push(fromUid + "→" + toUid);
    }
    save();
    return { ok: true, gate: gate, msg: tierData.icon + " Xây dựng " + tierData.name + " thành công!" };
  };

  window.g56UpgradeGate = function(gateId) {
    var gate = window.gateV56Data.playerGates.find(function(g) { return g.id === gateId; });
    if (!gate) return { ok: false, msg: "Không tìm thấy cổng" };
    if (gate.tier >= 5) return { ok: false, msg: "Cổng đã đạt cấp tối đa" };
    var nextTier = GATE_TIERS[gate.tier];
    gate.tier = nextTier.tier;
    gate.tierName = nextTier.name;
    gate.tierIcon = nextTier.icon;
    gate.stability = nextTier.stability;
    gate.toll = nextTier.toll;
    gate.slots = nextTier.slots;
    save();
    return { ok: true, msg: nextTier.icon + " Nâng cấp lên " + nextTier.name + "!" };
  };

  window.g56CloseGate = function(gateId) {
    var gate = window.gateV56Data.playerGates.find(function(g) { return g.id === gateId; });
    if (!gate) return { ok: false, msg: "Không tìm thấy cổng" };
    gate.isOpen = false;
    save();
    return { ok: true, msg: "🔒 Cổng đã đóng." };
  };

  window.g56SetToll = function(gateId, toll) {
    var gate = window.gateV56Data.playerGates.find(function(g) { return g.id === gateId; });
    if (!gate) return;
    gate.toll = Math.max(0, toll);
    save();
  };

  window.g56GetPlayerGates = function() { return window.gateV56Data.playerGates; };
  window.g56GetStats = function() {
    return {
      totalGates: window.gateV56Data.playerGates.length,
      openGates: window.gateV56Data.playerGates.filter(function(g) { return g.isOpen; }).length,
      totalToll: window.gateV56Data.totalTollCollected,
      totalTravelers: window.gateV56Data.totalTravelers,
      avgStability: window.gateV56Data.playerGates.length > 0 ?
        Math.round(window.gateV56Data.playerGates.reduce(function(s, g) { return s + g.stability; }, 0) / window.gateV56Data.playerGates.length) : 0
    };
  };

  function tickGates() {
    var yr = (typeof window.year === "number") ? window.year : 0;
    window.gateV56Data.playerGates.forEach(function(gate) {
      if (!gate.isOpen) return;
      var travelers = Math.floor(Math.random() * Math.min(gate.slots, 5));
      var income = travelers * gate.toll;
      gate.totalRevenue += income;
      gate.activeTravelers = travelers;
      window.gateV56Data.totalTollCollected += income;
      window.gateV56Data.totalTravelers += travelers;

      gate.stability = Math.max(10, gate.stability - Math.random() * 0.5);

      if (Math.random() < 0.005) {
        var ev = GATE_EVENTS[Math.floor(Math.random() * GATE_EVENTS.length)];
        window.gateV56Data.gateEvents.unshift({ year: yr, gateId: gate.id, gateName: gate.tierName, event: ev.name, effect: ev.effect, icon: ev.icon });
        if (window.gateV56Data.gateEvents.length > 50) window.gateV56Data.gateEvents.length = 50;
        if (ev.id === "surge") gate.stability = Math.min(100, gate.stability + 10);
        if (ev.id === "collapse") gate.stability = Math.max(10, gate.stability - 20);
        if (typeof window.waeAddAlert === "function") window.waeAddAlert(ev.icon + " Cổng " + gate.tierName + ": " + ev.name);
      }
    });

    if (window.gateV56Data.tick % 100 === 0) save();
    window.gateV56Data.tick++;
  }

  window.gateSystemV56Tick = function() { tickGates(); };

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); window.gateSystemV56Tick(); };
    save();
    console.log("[UniverseGateSystemV56] 🌌 Hệ Thống Cổng Liên Vũ Trụ V56 — 5 cấp · Player-operated · Toll system sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 8900); });
  } else { setTimeout(init, 8900); }
})();
