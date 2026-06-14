(function() {
  "use strict";
  const SAVE_KEY = "cgv6_asset_registry_v74";

  var state = {
    activeTab: null,
    assetFilter: "all",
    bpFilter: "all",
    creatorName: ""
  };

  var ASSET_TABS = [
    { id: "assets74",     icon: "🏪", label: "Assets" },
    { id: "blueprints74", icon: "📐", label: "Blueprints" },
    { id: "races74",      icon: "🧬", label: "Races" },
    { id: "creatures74",  icon: "🐉", label: "Creatures" },
    { id: "lore74",       icon: "📜", label: "Lore" },
    { id: "imports74",    icon: "📥", label: "Imports" }
  ];

  var ASSET_TAB_IDS = ASSET_TABS.map(function(t) { return t.id; });

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch(e) {}
  }
  function load() {
    try { var d = localStorage.getItem(SAVE_KEY); if (d) { var p = JSON.parse(d); state.assetFilter = p.assetFilter || "all"; state.bpFilter = p.bpFilter || "all"; state.creatorName = p.creatorName || ""; } } catch(e) {}
  }

  // ─── Helpers ───────────────────────────────────────────────
  function num(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(0) + "K";
    return String(n || 0);
  }
  function stars(r) {
    var s = Math.round(r || 0);
    return "★".repeat(s) + "☆".repeat(5 - s);
  }
  function rarityColor(rarity) {
    var map = { mythic: "#ef4444", legendary: "#f59e0b", epic: "#8b5cf6", rare: "#3b82f6", uncommon: "#10b981", common: "#9ca3af" };
    return map[rarity] || "#9ca3af";
  }
  function typeColor(type) {
    var map = { race: "#8b5cf6", creature: "#ef4444", religion: "#f59e0b", technology: "#3b82f6", civilization: "#10b981", lore: "#ec4899" };
    return map[type] || "#9ca3af";
  }

  // ─── Asset Card ────────────────────────────────────────────
  function renderAssetCard(a, showImport) {
    var imported = window.creatorAssetV74Data
      ? window.creatorAssetV74Data.importedAssets.some(function(i) { return i.sourceId === a.id; })
      : false;
    return '<div style="background:#0f0f1e;border:1px solid ' + rarityColor(a.rarity) + '44;border-radius:10px;padding:12px;margin-bottom:10px">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
        '<div style="flex:1">' +
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
            '<span style="font-size:18px">' + (a.icon || "📦") + '</span>' +
            '<div>' +
              '<div style="font-weight:700;color:#e5e7eb;font-size:13px">' + a.name + '</div>' +
              '<div style="color:#9ca3af;font-size:11px">by ' + a.creator + ' · ' + a.worldOrigin + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="color:#d1d5db;font-size:11px;margin-bottom:6px;line-height:1.4">' + (a.desc || "").substring(0, 120) + (a.desc && a.desc.length > 120 ? "..." : "") + '</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">' +
            (a.tags || []).map(function(t) { return '<span style="background:#1e1e3a;color:#a78bfa;padding:2px 6px;border-radius:4px;font-size:10px">#' + t + '</span>'; }).join("") +
          '</div>' +
          '<div style="display:flex;gap:12px;font-size:11px;color:#9ca3af">' +
            '<span style="color:' + rarityColor(a.rarity) + '">◆ ' + (a.rarity || "common") + '</span>' +
            '<span>⭐ ' + (a.ratings ? a.ratings.toFixed(1) : "0.0") + '</span>' +
            '<span>📥 ' + num(a.imports || a.downloadCount || 0) + '</span>' +
            (a.stats ? '<span>⚡ ' + (a.stats.power || 0) + '</span><span>✨ ' + (a.stats.magic || 0) + '</span>' : '') +
          '</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:6px;margin-left:10px;flex-shrink:0">' +
          (showImport
            ? (imported
              ? '<button disabled style="padding:5px 10px;border-radius:6px;border:1px solid #374151;background:#111827;color:#6b7280;font-size:11px;cursor:default">✅ Đã import</button>'
              : '<button onclick="ca74RegistryImport(\'' + a.id + '\')" style="padding:5px 10px;border-radius:6px;border:1px solid #10b981;background:#022c22;color:#10b981;font-size:11px;cursor:pointer">📥 Import</button>')
            : '') +
          '<button onclick="ca74RegistryRate(\'' + a.id + '\')" style="padding:5px 10px;border-radius:6px;border:1px solid #374151;background:transparent;color:#f59e0b;font-size:11px;cursor:pointer">⭐ Đánh giá</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // ─── Blueprint Card ─────────────────────────────────────────
  function renderBPCard(bp, showImport) {
    var typeIcon = { world: "🌍", country: "🏰", race: "🧬" };
    var imported = window.worldBlueprintV74Data
      ? window.worldBlueprintV74Data.importedBlueprints.some(function(b) { return b.sourceId === bp.id; })
      : false;
    return '<div style="background:#0f0f1e;border:1px solid #8b5cf644;border-radius:10px;padding:12px;margin-bottom:10px">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
        '<div style="flex:1">' +
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
            '<span style="font-size:20px">' + (typeIcon[bp.type] || "📐") + '</span>' +
            '<div>' +
              '<div style="font-weight:700;color:#e5e7eb;font-size:13px">' + bp.name + '</div>' +
              '<div style="color:#9ca3af;font-size:11px">by ' + bp.creator + ' · v' + (bp.version || 1) + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="color:#d1d5db;font-size:11px;margin-bottom:6px;line-height:1.4">' + (bp.desc || "").substring(0, 100) + (bp.desc && bp.desc.length > 100 ? "..." : "") + '</div>' +
          '<div style="display:flex;gap:10px;font-size:11px;color:#9ca3af;margin-bottom:4px">' +
            '<span>📦 Code: <span style="color:#a78bfa;font-family:monospace">' + bp.code + '</span></span>' +
          '</div>' +
          '<div style="display:flex;gap:10px;font-size:11px;color:#9ca3af">' +
            '<span>👥 ' + num(bp.population) + '</span>' +
            '<span>🏆 CivScore ' + (bp.civScore || 0) + '</span>' +
            '<span>📅 ' + (bp.age || 0) + ' năm</span>' +
            '<span>📥 ' + (bp.imports || 0) + ' imports</span>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:6px;margin-left:10px;flex-shrink:0">' +
          (showImport
            ? (imported
              ? '<button disabled style="padding:5px 10px;border-radius:6px;border:1px solid #374151;background:#111827;color:#6b7280;font-size:11px;cursor:default">✅ Đã import</button>'
              : '<button onclick="ca74RegistryImportBP(\'' + bp.id + '\')" style="padding:5px 10px;border-radius:6px;border:1px solid #10b981;background:#022c22;color:#10b981;font-size:11px;cursor:pointer">📥 Import BP</button>')
            : '<button onclick="wbp74ShareBlueprint(\'' + bp.id + '\')" style="padding:5px 10px;border-radius:6px;border:1px solid #8b5cf6;background:#1a0a3a;color:#a78bfa;font-size:11px;cursor:pointer">🔗 Chia sẻ</button>') +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // ─── Tab Content Renderers ──────────────────────────────────
  function renderAssets() {
    var all = typeof window.ca74GetAllPublic === "function" ? window.ca74GetAllPublic() : [];
    var filtered = state.assetFilter === "all" ? all : all.filter(function(a) { return a.type === state.assetFilter; });
    var types = typeof window.ca74GetTypes === "function" ? window.ca74GetTypes() : [];
    return '<div style="padding:12px">' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">' +
        '<button onclick="ca74RegFilter(\'all\')" style="padding:4px 10px;border-radius:6px;border:1px solid ' + (state.assetFilter === "all" ? "#8b5cf6" : "#374151") + ';background:' + (state.assetFilter === "all" ? "#1a0a3a" : "transparent") + ';color:' + (state.assetFilter === "all" ? "#a78bfa" : "#9ca3af") + ';font-size:11px;cursor:pointer">🏪 Tất Cả</button>' +
        types.map(function(t) {
          var active = state.assetFilter === t.id;
          return '<button onclick="ca74RegFilter(\'' + t.id + '\')" style="padding:4px 10px;border-radius:6px;border:1px solid ' + (active ? "#8b5cf6" : "#374151") + ';background:' + (active ? "#1a0a3a" : "transparent") + ';color:' + (active ? "#a78bfa" : "#9ca3af") + ';font-size:11px;cursor:pointer">' + t.icon + ' ' + t.name + '</button>';
        }).join("") +
      '</div>' +
      '<div style="color:#6b7280;font-size:11px;margin-bottom:10px">📦 ' + filtered.length + ' assets · Thị Trường Creator Economy V74</div>' +
      filtered.map(function(a) { return renderAssetCard(a, true); }).join("") +
    '</div>';
  }

  function renderBlueprints() {
    var all = typeof window.wbp74GetAll === "function" ? window.wbp74GetAll() : [];
    var mine = typeof window.wbp74GetMine === "function" ? window.wbp74GetMine() : [];
    var hasWorld = window.world && window.world.name;
    var countries = Array.isArray(window.countries) ? window.countries : [];
    return '<div style="padding:12px">' +
      '<div style="background:#0f0f1e;border:1px solid #1e1e3a;border-radius:10px;padding:14px;margin-bottom:12px">' +
        '<div style="font-weight:700;color:#a78bfa;margin-bottom:10px">📤 Xuất Blueprint</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
          '<button onclick="ca74RegExportWorld()" style="padding:8px 14px;border-radius:8px;border:1px solid ' + (hasWorld ? "#8b5cf6" : "#374151") + ';background:' + (hasWorld ? "#1a0a3a" : "#111827") + ';color:' + (hasWorld ? "#a78bfa" : "#6b7280") + ';font-size:12px;cursor:' + (hasWorld ? "pointer" : "default") + '">' +
            (hasWorld ? "🌍 Xuất " + window.world.name : "🌍 Chưa có thế giới") +
          '</button>' +
          (hasWorld && countries.length > 0
            ? '<button onclick="ca74RegExportCountry(0)" style="padding:8px 14px;border-radius:8px;border:1px solid #374151;background:transparent;color:#9ca3af;font-size:12px;cursor:pointer">🏰 Xuất ' + (countries[0] ? countries[0].name : "Quốc Gia 1") + '</button>'
            : '') +
        '</div>' +
      '</div>' +
      '<div style="color:#6b7280;font-size:11px;margin-bottom:10px">📐 ' + all.length + ' blueprints · Bao gồm ' + mine.length + ' của bạn</div>' +
      all.map(function(bp) { return renderBPCard(bp, !mine.some(function(m) { return m.id === bp.id; })); }).join("") +
    '</div>';
  }

  function renderByType(typeId, typeName, typeIcon) {
    var assets = typeof window.ca74GetByType === "function" ? window.ca74GetByType(typeId) : [];
    return '<div style="padding:12px">' +
      '<div style="color:#6b7280;font-size:11px;margin-bottom:10px">' + typeIcon + ' ' + assets.length + ' ' + typeName + ' · Từ tất cả thế giới</div>' +
      (assets.length === 0
        ? '<div style="text-align:center;padding:40px;color:#6b7280"><div style="font-size:32px;margin-bottom:10px">' + typeIcon + '</div><div>Chưa có ' + typeName + ' nào</div></div>'
        : assets.map(function(a) { return renderAssetCard(a, true); }).join("")) +
      '<div style="margin-top:12px">' +
        '<button onclick="ca74RegCreate(\'' + typeId + '\')" style="width:100%;padding:10px;border-radius:8px;border:1px dashed #8b5cf6;background:transparent;color:#a78bfa;font-size:12px;cursor:pointer">+ Tạo ' + typeName + ' Mới</button>' +
      '</div>' +
    '</div>';
  }

  function renderImports() {
    var imported = typeof window.ca74GetImported === "function" ? window.ca74GetImported() : [];
    var impBP = typeof window.wbp74GetImported === "function" ? window.wbp74GetImported() : [];
    var myAssets = typeof window.ca74GetMyAssets === "function" ? window.ca74GetMyAssets() : [];
    var myBP = typeof window.wbp74GetMine === "function" ? window.wbp74GetMine() : [];
    var stats = typeof window.ca74GetStats === "function" ? window.ca74GetStats() : {};
    var bpStats = typeof window.wbp74GetStats === "function" ? window.wbp74GetStats() : {};
    return '<div style="padding:12px">' +
      '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:14px">' +
        renderStatBox("📦", "Assets Đã Import", imported.length, "#8b5cf6") +
        renderStatBox("📐", "Blueprints Đã Import", impBP.length, "#3b82f6") +
        renderStatBox("✍️", "Assets Tự Tạo", myAssets.length, "#10b981") +
        renderStatBox("🌍", "Blueprints Tự Xuất", myBP.length, "#f59e0b") +
      '</div>' +
      (imported.length === 0 && impBP.length === 0
        ? '<div style="text-align:center;padding:40px;color:#6b7280"><div style="font-size:32px;margin-bottom:10px">📥</div><div>Chưa có gì được import</div><div style="font-size:11px;margin-top:8px">Vào tab Assets hoặc Blueprints để import nội dung</div></div>'
        : '') +
      (imported.length > 0 ? '<div style="font-weight:600;color:#a78bfa;font-size:12px;margin-bottom:8px">🧬 Assets Đã Import (' + imported.length + ')</div>' + imported.map(function(a) { return renderAssetCard(a, false); }).join("") : '') +
      (impBP.length > 0 ? '<div style="font-weight:600;color:#3b82f6;font-size:12px;margin:12px 0 8px">📐 Blueprints Đã Import (' + impBP.length + ')</div>' + impBP.map(function(bp) { return renderBPCard(bp, false); }).join("") : '') +
    '</div>';
  }

  function renderStatBox(icon, label, val, color) {
    return '<div style="background:#0f0f1e;border:1px solid ' + color + '44;border-radius:8px;padding:12px;text-align:center">' +
      '<div style="font-size:20px;margin-bottom:4px">' + icon + '</div>' +
      '<div style="font-size:22px;font-weight:700;color:' + color + '">' + val + '</div>' +
      '<div style="font-size:10px;color:#9ca3af;margin-top:2px">' + label + '</div>' +
    '</div>';
  }

  // ─── Main Render ────────────────────────────────────────────
  function renderAssetSection() {
    var tab = state.activeTab;
    var content = "";
    if (!tab || tab === "assets74") content = renderAssets();
    else if (tab === "blueprints74") content = renderBlueprints();
    else if (tab === "races74")      content = renderByType("race", "Chủng Tộc", "🧬");
    else if (tab === "creatures74")  content = renderByType("creature", "Sinh Vật", "🐉");
    else if (tab === "lore74")       content = renderByType("lore", "Truyền Thuyết", "📜");
    else if (tab === "imports74")    content = renderImports();

    return '<div id="uhub74-asset-section" style="background:#050510;border-top:2px solid #8b5cf644;height:100%;display:flex;flex-direction:column">' +
      '<div style="background:#0a0a1a;padding:10px 12px 0;border-bottom:1px solid #1e1e3a;flex-shrink:0">' +
        '<div style="font-size:10px;color:#6b7280;margin-bottom:6px;letter-spacing:1px">▼ ASSET ECONOMY V74</div>' +
        '<div style="display:flex;gap:4px;flex-wrap:wrap">' +
          ASSET_TABS.map(function(t) {
            var active = tab === t.id || (!tab && t.id === "assets74");
            return '<button onclick="ca74RegSwitchTab(\'' + t.id + '\')" style="padding:5px 10px;border-radius:6px 6px 0 0;border:1px solid ' + (active ? "#8b5cf6" : "#1e1e3a") + ';background:' + (active ? "#1a0a3a" : "transparent") + ';color:' + (active ? "#a78bfa" : "#9ca3af") + ';cursor:pointer;font-size:11px;white-space:nowrap">' + t.icon + ' ' + t.label + '</button>';
          }).join("") +
        '</div>' +
      '</div>' +
      '<div style="flex:1;overflow-y:auto">' + content + '</div>' +
    '</div>';
  }

  // ─── Public render (injected into Universe Hub) ─────────────
  window.uhub74RenderAssets = function() {
    var el = document.getElementById("uhub74-asset-section");
    if (el) { el.outerHTML = renderAssetSection(); return; }
    // Inject below existing hub content
    var panel = document.getElementById("panel-universe-hub-v73");
    if (!panel) return;
    var wrapper = document.getElementById("uhub74-wrapper");
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.id = "uhub74-wrapper";
      wrapper.style.cssText = "height:100%;display:flex;flex-direction:column;overflow:hidden";
      // Move existing hub content into top of wrapper
      var existingContent = panel.innerHTML;
      panel.innerHTML = "";
      var topDiv = document.createElement("div");
      topDiv.id = "uhub74-top";
      topDiv.style.cssText = "flex:1;overflow-y:auto;min-height:0";
      topDiv.innerHTML = existingContent;
      var botDiv = document.createElement("div");
      botDiv.id = "uhub74-bottom";
      botDiv.style.cssText = "height:260px;flex-shrink:0;overflow:hidden";
      botDiv.innerHTML = renderAssetSection();
      wrapper.appendChild(topDiv);
      wrapper.appendChild(botDiv);
      panel.appendChild(wrapper);
    } else {
      var bot = document.getElementById("uhub74-bottom");
      if (bot) bot.innerHTML = renderAssetSection();
    }
  };

  window.ca74RegSwitchTab = function(tabId) {
    state.activeTab = tabId;
    save();
    var bot = document.getElementById("uhub74-bottom");
    if (bot) bot.innerHTML = renderAssetSection();
    else window.uhub74RenderAssets();
  };

  window.ca74RegFilter = function(typeId) {
    state.assetFilter = typeId;
    save();
    var bot = document.getElementById("uhub74-bottom");
    if (bot) bot.innerHTML = renderAssetSection();
  };

  window.ca74RegistryImport = function(assetId) {
    if (typeof window.ca74ImportAsset !== "function") return;
    var res = window.ca74ImportAsset(assetId);
    showToast(res.msg, res.ok ? "#10b981" : "#ef4444");
    var bot = document.getElementById("uhub74-bottom");
    if (bot) bot.innerHTML = renderAssetSection();
  };

  window.ca74RegistryImportBP = function(bpId) {
    if (typeof window.wbp74ImportBlueprint !== "function") return;
    var res = window.wbp74ImportBlueprint(bpId);
    showToast(res.msg, res.ok ? "#10b981" : "#ef4444");
    var bot = document.getElementById("uhub74-bottom");
    if (bot) bot.innerHTML = renderAssetSection();
  };

  window.ca74RegExportWorld = function() {
    if (typeof window.wbp74ExportWorld !== "function") return;
    var res = window.wbp74ExportWorld();
    showToast(res.msg, res.ok ? "#8b5cf6" : "#ef4444");
    if (res.ok) {
      state.activeTab = "blueprints74";
      var bot = document.getElementById("uhub74-bottom");
      if (bot) bot.innerHTML = renderAssetSection();
    }
  };

  window.ca74RegExportCountry = function(idx) {
    if (typeof window.wbp74ExportCountry !== "function") return;
    var res = window.wbp74ExportCountry(idx);
    showToast(res.msg, res.ok ? "#8b5cf6" : "#ef4444");
    if (res.ok) {
      state.activeTab = "blueprints74";
      var bot = document.getElementById("uhub74-bottom");
      if (bot) bot.innerHTML = renderAssetSection();
    }
  };

  window.ca74RegistryRate = function(assetId) {
    var score = parseInt(prompt("Đánh giá (1-5):") || "0", 10);
    if (score >= 1 && score <= 5) {
      if (typeof window.ca74RateAsset === "function") {
        var res = window.ca74RateAsset(assetId, score);
        showToast(res.msg, res.ok ? "#f59e0b" : "#ef4444");
        var bot = document.getElementById("uhub74-bottom");
        if (bot) bot.innerHTML = renderAssetSection();
      }
    }
  };

  window.ca74RegCreate = function(typeId) {
    var types = typeof window.ca74GetTypes === "function" ? window.ca74GetTypes() : [];
    var t = types.find(function(x) { return x.id === typeId; });
    if (!t) return;
    var name = prompt(t.icon + " Nhập tên " + t.name + " mới:");
    if (!name) return;
    var desc = prompt("Mô tả ngắn (tùy chọn):") || "";
    if (typeof window.ca74CreateAsset === "function") {
      var res = window.ca74CreateAsset(typeId, name, desc, [typeId]);
      showToast(res.msg, res.ok ? "#8b5cf6" : "#ef4444");
      var bot = document.getElementById("uhub74-bottom");
      if (bot) bot.innerHTML = renderAssetSection();
    }
  };

  function showToast(msg, color) {
    var banner = document.createElement("div");
    banner.style.cssText = "position:fixed;top:20px;right:20px;z-index:9999;background:#0a0a1a;border:1px solid " + (color || "#8b5cf6") + ";border-radius:10px;padding:12px 16px;color:" + (color || "#a78bfa") + ";font-size:12px;font-weight:600;max-width:280px;box-shadow:0 4px 20px rgba(0,0,0,0.5);white-space:pre-line";
    banner.textContent = msg;
    document.body.appendChild(banner);
    setTimeout(function() { if (banner.parentNode) banner.parentNode.removeChild(banner); }, 4000);
  }

  // ─── Hook Universe Hub render ───────────────────────────────
  function hookUniverseHub() {
    if (typeof window.uhubV73Render !== "function") return false;
    if (window._uhub74Hooked) return true;
    var _origRender = window.uhubV73Render;
    window.uhubV73Render = function() {
      if (typeof _origRender === "function") _origRender();
      setTimeout(function() { window.uhub74RenderAssets(); }, 50);
    };
    // Also hook the sidebar button
    var btn = document.getElementById("btn-universe-hub-v73");
    if (btn) {
      var _origClick = btn.onclick;
      btn.onclick = function() {
        if (typeof _origClick === "function") _origClick();
        setTimeout(function() { window.uhub74RenderAssets(); }, 100);
      };
    }
    window._uhub74Hooked = true;
    return true;
  }

  function tryHookWithRetry(attempts) {
    if (hookUniverseHub()) return;
    if (attempts <= 0) {
      console.warn("[AssetRegistry V74] Universe Hub chưa sẵn sàng sau nhiều lần thử.");
      return;
    }
    setTimeout(function() { tryHookWithRetry(attempts - 1); }, 500);
  }

  function init() {
    load();
    tryHookWithRetry(20);
    console.log("[CreatorAssetRegistry V74] 🏪 Asset Economy Registry khởi động — 6 tabs (Assets/Blueprints/Races/Creatures/Lore/Imports) · inject vào Universe Hub sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 18300); });
  } else { setTimeout(init, 18300); }
})();
