(function() {
  "use strict";
  const SAVE_KEY = "cgv6_lore_gen_v75";

  var GENESIS_TABS = [
    { id: "genesis75",   icon: "🤖", label: "AI Genesis" },
    { id: "builder75",   icon: "✏️",  label: "Prompt Builder" },
    { id: "preview75",   icon: "👁️",  label: "World Preview" },
    { id: "history75",   icon: "🌍",  label: "Generated Worlds" }
  ];

  var state = {
    activeTab: "genesis75",
    isGenerating: false,
    previewData: null
  };

  window.worldLoreGenV75Data = {
    generatedLore: [],
    version: "V75"
  };

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ generatedLore: window.worldLoreGenV75Data.generatedLore.slice(-20), version: "V75" })); } catch(e) {} }
  function load() { try { var d = localStorage.getItem(SAVE_KEY); if (d) { var p = JSON.parse(d); window.worldLoreGenV75Data.generatedLore = p.generatedLore || []; } } catch(e) {} }

  // ─── Style helpers ──────────────────────────────────────────
  function card(content, borderColor, bg) {
    return '<div style="background:' + (bg || "#0f0f1e") + ';border:1px solid ' + (borderColor || "#1e1e3a") + ';border-radius:10px;padding:14px;margin-bottom:10px">' + content + '</div>';
  }
  function badge(text, color) {
    return '<span style="background:' + (color || "#1e1e3a") + '33;color:' + (color || "#9ca3af") + ';padding:2px 8px;border-radius:4px;font-size:10px;border:1px solid ' + (color || "#374151") + '44">' + text + '</span>';
  }
  function statRow(label, val, color) {
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #0a0a1a">' +
      '<span style="color:#9ca3af;font-size:11px">' + label + '</span>' +
      '<span style="color:' + (color || "#e5e7eb") + ';font-size:11px;font-weight:600">' + val + '</span>' +
    '</div>';
  }
  function sectionTitle(text, color) {
    return '<div style="color:' + (color || "#a78bfa") + ';font-weight:700;font-size:12px;margin:12px 0 8px;letter-spacing:0.5px">' + text + '</div>';
  }
  function btn(label, onclick, color, bg, extraStyle) {
    return '<button onclick="' + onclick + '" style="padding:8px 14px;border-radius:8px;border:1px solid ' + (color || "#374151") + ';background:' + (bg || "transparent") + ';color:' + (color || "#9ca3af") + ';cursor:pointer;font-size:12px;' + (extraStyle || "") + '">' + label + '</button>';
  }

  // ─── TAB: AI Genesis ────────────────────────────────────────
  function renderGenesis() {
    var genres = typeof window.ag75GetGenres === "function" ? window.ag75GetGenres() : [];
    var agStats = typeof window.ag75GetStats === "function" ? window.ag75GetStats() : {};
    var pStats  = typeof window.wgp75GetStats === "function" ? window.wgp75GetStats() : {};
    var savedPrompts = typeof window.ptw75GetSaved === "function" ? window.ptw75GetSaved() : [];
    return '<div style="padding:14px">' +
      card(
        '<div style="font-size:22px;margin-bottom:8px">🤖</div>' +
        '<div style="font-weight:700;color:#e5e7eb;font-size:15px;margin-bottom:6px">AI World Genesis</div>' +
        '<div style="color:#9ca3af;font-size:12px;line-height:1.6">Mô tả thế giới bạn muốn → AI tạo trong vòng 30-60 giây.<br>Bao gồm: tên, quốc gia, chủng tộc, tôn giáo, sinh vật, anh hùng, truyền thuyết, kinh tế.</div>',
        "#8b5cf6", "#0a0a1a"
      ) +
      card(
        '<div style="font-weight:700;color:#a78bfa;margin-bottom:12px">✍️ Nhập Mô Tả Thế Giới</div>' +
        '<textarea id="wgl75-prompt-input" placeholder="Ví dụ: Tạo thế giới tu tiên hắc ám nơi ma đạo thống trị..." style="width:100%;height:80px;background:#050510;border:1px solid #374151;border-radius:8px;padding:10px;color:#e5e7eb;font-size:12px;resize:vertical;box-sizing:border-box;font-family:inherit"></textarea>' +
        '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">' +
          btn("🚀 Tạo Thế Giới", "wgl75StartGenerate()", "#8b5cf6", "#1a0a3a", "font-weight:700;width:100%") +
        '</div>' +
        '<div id="wgp75-status" style="margin-top:8px;color:#a78bfa;font-size:11px;min-height:18px"></div>' +
        '<div id="wgp75-stage-log" style="margin-top:4px;min-height:20px"></div>',
        "#374151"
      ) +
      sectionTitle("⚡ Template Nhanh") +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">' +
        (typeof window.ptw75GetTemplates === "function" ? window.ptw75GetTemplates() : []).map(function(t) {
          return '<button onclick="wgl75UseTemplate(\'' + t.id + '\')" style="padding:5px 10px;border-radius:6px;border:1px solid #374151;background:transparent;color:#9ca3af;font-size:10px;cursor:pointer;white-space:nowrap">' + t.label + '</button>';
        }).join("") +
      '</div>' +
      sectionTitle("📊 Thống Kê AI Genesis") +
      card(
        statRow("Lần gọi Claude", agStats.claudeCalls || 0, "#8b5cf6") +
        statRow("Tạo thế giới thành công", agStats.totalGenerated || 0, "#10b981") +
        statRow("Thế giới đã áp dụng", pStats.totalApplied || 0, "#f59e0b") +
        statRow("Lỗi API", agStats.failedCalls || 0, "#ef4444"),
        "#374151"
      ) +
    '</div>';
  }

  // ─── TAB: Prompt Builder ────────────────────────────────────
  function renderBuilder() {
    var analysis = typeof window.ptw75GetAnalysis === "function" ? window.ptw75GetAnalysis() : null;
    var saved    = typeof window.ptw75GetSaved === "function" ? window.ptw75GetSaved() : [];
    var templates = typeof window.ptw75GetTemplates === "function" ? window.ptw75GetTemplates() : [];
    return '<div style="padding:14px">' +
      sectionTitle("⚗️ Phân Tích Prompt Hiện Tại") +
      (analysis ? card(
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">' +
          '<span style="font-size:24px">' + (analysis.genre ? analysis.genre.emoji : "🌀") + '</span>' +
          '<div><div style="color:#e5e7eb;font-weight:700;font-size:13px">' + (analysis.genre ? analysis.genre.name : "Hybrid") + '</div>' +
          '<div style="color:#9ca3af;font-size:10px">' + analysis.wordCount + ' từ · Độ phức tạp: ' + analysis.complexity + ' · ETA: ' + analysis.estimatedTime + '</div></div>' +
        '</div>' +
        '<div style="background:#050510;border-radius:6px;padding:8px;font-size:11px;color:#d1d5db;margin-bottom:8px;font-style:italic">"' + (analysis.prompt || "").substring(0, 150) + '"</div>' +
        (analysis.features ? [
          statRow("Số quốc gia dự kiến", analysis.features.countries, "#3b82f6"),
          statRow("Tông màu", analysis.features.tone, "#8b5cf6"),
          statRow("Thời đại", analysis.features.era, "#f59e0b"),
          statRow("Trạng thái thế giới", analysis.features.state, "#10b981")
        ].join("") : "") +
        '<div style="margin-top:10px;display:flex;gap:6px">' +
          btn("💾 Lưu Prompt", "wgl75SaveCurrentPrompt()", "#10b981", "#022c22") +
          btn("🚀 Tạo Ngay", "wgl75StartGenerate()", "#8b5cf6", "#1a0a3a") +
        '</div>',
        "#8b5cf6"
      ) : card('<div style="color:#6b7280;font-size:12px;text-align:center;padding:20px">Chưa có prompt. Nhập mô tả thế giới ở tab AI Genesis.</div>', "#374151")) +
      sectionTitle("📚 Templates Chi Tiết") +
      templates.map(function(t) {
        return card(
          '<div style="font-weight:600;color:#e5e7eb;font-size:12px;margin-bottom:6px">' + t.label + '</div>' +
          '<div style="color:#9ca3af;font-size:11px;line-height:1.5;margin-bottom:8px;font-style:italic">"' + t.prompt.substring(0, 120) + '..."</div>' +
          btn("📋 Dùng Template Này", "wgl75UseTemplate(\'" + t.id + "\')", "#374151", "transparent"),
          "#1e1e3a"
        );
      }).join("") +
      sectionTitle("💾 Prompts Đã Lưu (" + saved.length + ")") +
      (saved.length === 0
        ? '<div style="color:#6b7280;font-size:11px;text-align:center;padding:16px">Chưa có prompt nào được lưu.</div>'
        : saved.map(function(s) {
          return card(
            '<div style="color:#e5e7eb;font-size:11px;margin-bottom:4px">' + s.label + '</div>' +
            '<div style="color:#6b7280;font-size:10px;margin-bottom:6px">' + s.timestamp + '</div>' +
            btn("📋 Dùng", "wgl75UseSavedPrompt(\'" + s.prompt.replace(/'/g, "\\x27") + "\')", "#374151", "transparent"),
            "#1e1e3a"
          );
        }).join("")) +
    '</div>';
  }

  // ─── TAB: World Preview ─────────────────────────────────────
  function renderPreview(worldData) {
    var wd = worldData || (typeof window.wgp75GetPending === "function" ? window.wgp75GetPending() : null);
    if (!wd) {
      return '<div style="padding:40px;text-align:center">' +
        '<div style="font-size:48px;margin-bottom:16px">🌍</div>' +
        '<div style="color:#6b7280;font-size:14px;margin-bottom:8px">Chưa có thế giới nào được tạo</div>' +
        '<div style="color:#4b5563;font-size:12px">Nhập mô tả ở tab AI Genesis → Click "Tạo Thế Giới"</div>' +
      '</div>';
    }
    var genreIcon = wd._genre ? wd._genre.emoji : "🌀";
    return '<div style="padding:14px">' +
      card(
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">' +
          '<div>' +
            '<div style="font-size:24px;margin-bottom:4px">' + genreIcon + ' ' + (wd.worldName || "Thế Giới Mới") + '</div>' +
            '<div style="color:#9ca3af;font-size:11px">' + (wd._genre ? wd._genre.name : "Hybrid") + ' · Tạo lúc ' + (wd._generatedAt || "vừa xong") + '</div>' +
          '</div>' +
          '<div style="text-align:right"><span style="color:#f59e0b;font-size:18px;font-weight:700">CivScore: ' + (wd.civScore || "?") + '</span></div>' +
        '</div>' +
        '<div style="color:#d1d5db;font-size:12px;line-height:1.6;margin-bottom:10px">' + (wd.worldDesc || "") + '</div>' +
        (wd.theme ? '<div style="margin-bottom:6px">' + badge("🎭 " + wd.theme, "#8b5cf6") + '</div>' : "") +
        (wd.magicSystem ? '<div style="color:#9ca3af;font-size:11px;margin-bottom:4px">⚡ Hệ Thống: ' + wd.magicSystem + '</div>' : "") +
        (wd.cosmology ? '<div style="color:#9ca3af;font-size:11px">🌌 Vũ Trụ Luận: ' + wd.cosmology + '</div>' : ""),
        "#8b5cf6", "#0a0a1a"
      ) +
      (wd._sourcePrompt ? card('<div style="color:#6b7280;font-size:10px;font-style:italic">Prompt: "' + wd._sourcePrompt.substring(0, 200) + '"</div>', "#1e1e3a") : "") +
      sectionTitle("🏰 Quốc Gia (" + (wd.countries ? wd.countries.length : 0) + ")") +
      (wd.countries ? wd.countries.map(function(c) {
        return card(
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">' +
            '<div style="color:#e5e7eb;font-weight:600;font-size:12px">🏰 ' + c.name + '</div>' +
            '<div style="display:flex;gap:4px">' + badge("⚡" + (c.power || 0), "#ef4444") + badge("🕊️" + (c.stability || 0), "#10b981") + '</div>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:10px;color:#9ca3af">' +
            '<div>🏛️ ' + (c.government || "-") + '</div>' +
            '<div>👥 ' + (c.population ? (c.population > 999999 ? (c.population/1000000).toFixed(1) + "M" : c.population > 999 ? Math.floor(c.population/1000) + "K" : c.population) : "-") + '</div>' +
            '<div>⛩️ ' + (c.religion || "-") + '</div>' +
            '<div>🏙️ ' + (c.capital || c.name) + '</div>' +
          '</div>',
          "#374151"
        );
      }).join("") : "") +
      sectionTitle("🧬 Chủng Tộc (" + (wd.races ? wd.races.length : 0) + ")") +
      (wd.races ? wd.races.map(function(r) {
        return card(
          '<div style="color:#a78bfa;font-weight:600;font-size:12px;margin-bottom:4px">🧬 ' + r.name + '</div>' +
          '<div style="color:#d1d5db;font-size:11px;line-height:1.5;margin-bottom:4px">' + (r.desc || "") + '</div>' +
          '<div style="color:#9ca3af;font-size:10px;font-style:italic">Đặc trưng: ' + (r.trait || "-") + '</div>' +
          '<div style="display:flex;gap:8px;margin-top:4px;font-size:10px;color:#9ca3af">' +
            '<span>⚡ ' + (r.power || 0) + '</span><span>✨ ' + (r.magic || 0) + '</span><span>📖 ' + (r.wisdom || 0) + '</span>' +
          '</div>',
          "#8b5cf644"
        );
      }).join("") : "") +
      (wd.religions && wd.religions.length > 0 ? sectionTitle("⛩️ Tôn Giáo (" + wd.religions.length + ")") +
        wd.religions.map(function(rel) {
          return card(
            '<div style="color:#f59e0b;font-weight:600;font-size:12px;margin-bottom:2px">⛩️ ' + rel.name + '</div>' +
            '<div style="color:#9ca3af;font-size:11px;margin-bottom:2px">Thần: ' + (rel.deity || "-") + '</div>' +
            '<div style="color:#d1d5db;font-size:11px">' + (rel.doctrine || "") + '</div>',
            "#f59e0b44"
          );
        }).join("") : "") +
      (wd.creatures && wd.creatures.length > 0 ? sectionTitle("🐉 Sinh Vật (" + wd.creatures.length + ")") +
        wd.creatures.map(function(cr) {
          return card(
            '<div style="color:#ef4444;font-weight:600;font-size:12px;margin-bottom:2px">🐉 ' + cr.name + ' <span style="color:#9ca3af;font-size:10px">(' + (cr.type || "") + ' · ' + (cr.rarity || "") + ')</span></div>' +
            '<div style="color:#d1d5db;font-size:11px">' + (cr.desc || "") + '</div>',
            "#ef444444"
          );
        }).join("") : "") +
      (wd.heroes && wd.heroes.length > 0 ? sectionTitle("⚔️ Anh Hùng (" + wd.heroes.length + ")") +
        wd.heroes.map(function(h) {
          return card(
            '<div style="color:#10b981;font-weight:600;font-size:12px;margin-bottom:2px">⚔️ ' + h.name + ' — ' + (h.title || "") + '</div>' +
            '<div style="color:#d1d5db;font-size:11px">' + (h.backstory || "") + '</div>' +
            '<div style="font-size:10px;color:#9ca3af;margin-top:2px">Power: ' + (h.power || 0) + '</div>',
            "#10b98144"
          );
        }).join("") : "") +
      (wd.lore ? sectionTitle("📜 Lore & Huyền Thoại") +
        card(
          (wd.lore.originMyth ? '<div style="margin-bottom:8px"><div style="color:#8b5cf6;font-size:11px;font-weight:600;margin-bottom:3px">🌌 Huyền Thoại Khai Thiên</div><div style="color:#d1d5db;font-size:11px;line-height:1.5">' + wd.lore.originMyth + '</div></div>' : "") +
          (wd.lore.firstAge ? '<div style="margin-bottom:8px"><div style="color:#f59e0b;font-size:11px;font-weight:600;margin-bottom:3px">🌅 Kỷ Nguyên Đầu</div><div style="color:#d1d5db;font-size:11px;line-height:1.5">' + wd.lore.firstAge + '</div></div>' : "") +
          (wd.lore.greatWar ? '<div style="margin-bottom:8px"><div style="color:#ef4444;font-size:11px;font-weight:600;margin-bottom:3px">⚔️ Đại Chiến</div><div style="color:#d1d5db;font-size:11px;line-height:1.5">' + wd.lore.greatWar + '</div></div>' : "") +
          (wd.lore.prophecy ? '<div style="margin-bottom:8px"><div style="color:#a78bfa;font-size:11px;font-weight:600;margin-bottom:3px">🔮 Tiên Tri</div><div style="color:#d1d5db;font-size:11px;line-height:1.5;font-style:italic">' + wd.lore.prophecy + '</div></div>' : "") +
          (wd.lore.legend ? '<div><div style="color:#10b981;font-size:11px;font-weight:600;margin-bottom:3px">📜 Truyền Thuyết</div><div style="color:#d1d5db;font-size:11px;line-height:1.5">' + wd.lore.legend + '</div></div>' : ""),
          "#374151"
        ) : "") +
      '<div style="padding:10px 0;display:flex;gap:8px;position:sticky;bottom:0;background:#050510;flex-wrap:wrap">' +
        btn("✅ Áp Dụng Vào Game", "wgl75ApplyWorld()", "#10b981", "#022c22", "font-weight:700;flex:1") +
        btn("🔁 Tạo Lại", "wgl75Regenerate()", "#f59e0b", "#1a1000", "flex:1") +
        btn("💾 Lưu Prompt", "wgl75SaveCurrentPrompt()", "#374151", "transparent") +
      '</div>' +
    '</div>';
  }

  // ─── TAB: Generated Worlds ──────────────────────────────────
  function renderHistory() {
    var history = typeof window.ag75GetHistory === "function" ? window.ag75GetHistory() : [];
    var applied = typeof window.wgp75GetApplied === "function" ? window.wgp75GetApplied() : [];
    return '<div style="padding:14px">' +
      sectionTitle("✅ Thế Giới Đã Áp Dụng (" + applied.length + ")") +
      (applied.length === 0
        ? '<div style="color:#6b7280;font-size:11px;text-align:center;padding:20px">Chưa áp dụng thế giới nào.</div>'
        : applied.map(function(w) {
          return card(
            '<div style="color:#10b981;font-weight:600;font-size:12px;margin-bottom:4px">✅ ' + w.worldName + '</div>' +
            '<div style="display:flex;gap:8px;font-size:10px;color:#9ca3af;margin-bottom:4px">' +
              badge(w.genre || "hybrid", "#8b5cf6") +
              badge(w.countries + " quốc gia", "#3b82f6") +
              badge(w.races + " chủng tộc", "#a78bfa") +
            '</div>' +
            '<div style="color:#6b7280;font-size:10px;font-style:italic">"' + (w.prompt || "").substring(0, 80) + '"</div>' +
            '<div style="color:#4b5563;font-size:10px;margin-top:2px">Áp dụng lúc: ' + w.appliedAt + '</div>',
            "#10b98144"
          );
        }).join("")) +
      sectionTitle("🕐 Lịch Sử Tạo (" + history.length + ")") +
      (history.length === 0
        ? '<div style="color:#6b7280;font-size:11px;text-align:center;padding:20px">Chưa tạo thế giới nào.</div>'
        : history.map(function(h) {
          return card(
            '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
              '<div style="flex:1">' +
                '<div style="color:#e5e7eb;font-weight:600;font-size:12px;margin-bottom:3px">' + (h.genre ? h.genre.emoji : "🌀") + ' ' + (h.worldName || "Không tên") + '</div>' +
                '<div style="color:#6b7280;font-size:10px;font-style:italic">"' + (h.prompt || "").substring(0, 80) + '"</div>' +
                '<div style="display:flex;gap:6px;margin-top:4px">' +
                  badge(h.status === "applied" ? "✅ Đã áp dụng" : "👁️ Preview", h.status === "applied" ? "#10b981" : "#f59e0b") +
                  badge(h.timestamp || "", "#374151") +
                '</div>' +
              '</div>' +
              (h.worldData ? '<button onclick="wgl75PreviewFromHistory(\'' + h.id + '\')" style="padding:5px 10px;border-radius:6px;border:1px solid #374151;background:transparent;color:#9ca3af;font-size:10px;cursor:pointer;margin-left:8px;flex-shrink:0">👁️ Xem</button>' : "") +
            '</div>',
            "#1e1e3a"
          );
        }).join("")) +
    '</div>';
  }

  // ─── Main render ────────────────────────────────────────────
  function renderGenesisSection() {
    var tab = state.activeTab;
    var content = "";
    if      (tab === "genesis75")  content = renderGenesis();
    else if (tab === "builder75")  content = renderBuilder();
    else if (tab === "preview75")  content = renderPreview(state.previewData);
    else if (tab === "history75")  content = renderHistory();

    return '<div id="wgl75-genesis-section" style="background:#050510;border-top:2px solid #8b5cf644;height:100%;display:flex;flex-direction:column">' +
      '<div style="background:#0a0a1a;padding:8px 12px 0;border-bottom:1px solid #1e1e3a;flex-shrink:0">' +
        '<div style="font-size:10px;color:#6b7280;margin-bottom:5px;letter-spacing:1px">▼ AI WORLD GENESIS V75</div>' +
        '<div style="display:flex;gap:3px;flex-wrap:nowrap;overflow-x:auto">' +
          GENESIS_TABS.map(function(t) {
            var active = tab === t.id;
            return '<button onclick="wgl75SwitchTab(\'' + t.id + '\')" style="padding:5px 10px;border-radius:6px 6px 0 0;border:1px solid ' + (active ? "#8b5cf6" : "#1e1e3a") + ';background:' + (active ? "#1a0a3a" : "transparent") + ';color:' + (active ? "#a78bfa" : "#9ca3af") + ';cursor:pointer;font-size:11px;white-space:nowrap;flex-shrink:0">' + t.icon + ' ' + t.label + '</button>';
          }).join("") +
        '</div>' +
      '</div>' +
      '<div style="flex:1;overflow-y:auto">' + content + '</div>' +
    '</div>';
  }

  // ─── Public functions ────────────────────────────────────────
  window.wgl75SwitchTab = function(tabId) {
    state.activeTab = tabId;
    var bot = document.getElementById("wgl75-bottom");
    if (bot) bot.innerHTML = renderGenesisSection();
    else window.wgl75RenderSection();
  };

  window.wgl75RenderPreview = function(worldData) {
    state.previewData = worldData;
    var bot = document.getElementById("wgl75-bottom");
    if (bot) bot.innerHTML = renderGenesisSection();
  };

  window.wgl75RenderSection = function() {
    var panel = document.getElementById("panel-creator-hub-v32");
    if (!panel) return;
    var existing = document.getElementById("wgl75-wrapper");
    if (existing) { var bot = document.getElementById("wgl75-bottom"); if (bot) bot.innerHTML = renderGenesisSection(); return; }
    var wrapper = document.createElement("div");
    wrapper.id = "wgl75-wrapper";
    wrapper.style.cssText = "height:100%;display:flex;flex-direction:column;overflow:hidden";
    var topDiv = document.createElement("div");
    topDiv.id = "wgl75-top";
    topDiv.style.cssText = "flex:1;overflow-y:auto;min-height:0";
    topDiv.innerHTML = panel.innerHTML;
    panel.innerHTML = "";
    var botDiv = document.createElement("div");
    botDiv.id = "wgl75-bottom";
    botDiv.style.cssText = "height:310px;flex-shrink:0;overflow:hidden";
    botDiv.innerHTML = renderGenesisSection();
    wrapper.appendChild(topDiv);
    wrapper.appendChild(botDiv);
    panel.appendChild(wrapper);
  };

  window.wgl75StartGenerate = async function() {
    var el = document.getElementById("wgl75-prompt-input");
    var prompt = el ? el.value.trim() : (typeof window.ptw75GetCurrent === "function" ? window.ptw75GetCurrent() : "");
    if (!prompt) { alert("Hãy nhập mô tả thế giới!"); return; }
    if (state.isGenerating) return;
    state.isGenerating = true;
    var statusEl = document.getElementById("wgp75-status");
    if (statusEl) statusEl.textContent = "⏳ Đang kết nối Claude AI...";
    try {
      if (typeof window.ptw75AnalyzePrompt === "function") window.ptw75AnalyzePrompt(prompt);
      var result = await window.wgp75Generate(prompt);
      if (!result.ok) { alert("❌ " + result.msg); if (statusEl) statusEl.textContent = "❌ Thất bại: " + result.msg; }
    } catch(e) { if (statusEl) statusEl.textContent = "❌ Lỗi: " + e.message; }
    state.isGenerating = false;
  };

  window.wgl75UseTemplate = function(templateId) {
    var templates = typeof window.ptw75GetTemplates === "function" ? window.ptw75GetTemplates() : [];
    var t = templates.find(function(x) { return x.id === templateId; });
    if (!t) return;
    var el = document.getElementById("wgl75-prompt-input");
    if (el) { el.value = t.prompt; } else {
      if (window.promptToWorldV75Data) window.promptToWorldV75Data.currentPrompt = t.prompt;
    }
    if (typeof window.ptw75AnalyzePrompt === "function") window.ptw75AnalyzePrompt(t.prompt);
    var bot = document.getElementById("wgl75-bottom");
    if (bot) bot.innerHTML = renderGenesisSection();
    showToast("📋 Template đã nạp: " + t.label, "#8b5cf6");
  };

  window.wgl75UseSavedPrompt = function(prompt) {
    var el = document.getElementById("wgl75-prompt-input");
    if (el) el.value = prompt;
    if (typeof window.ptw75AnalyzePrompt === "function") window.ptw75AnalyzePrompt(prompt);
    wgl75SwitchTab("genesis75");
    showToast("📋 Prompt đã nạp!", "#8b5cf6");
  };

  window.wgl75SaveCurrentPrompt = function() {
    var el = document.getElementById("wgl75-prompt-input");
    var prompt = el ? el.value.trim() : (typeof window.ptw75GetCurrent === "function" ? window.ptw75GetCurrent() : "");
    if (!prompt) { showToast("Chưa có prompt để lưu!", "#ef4444"); return; }
    if (typeof window.ptw75SavePrompt === "function") {
      var r = window.ptw75SavePrompt(prompt);
      showToast(r.msg, "#10b981");
      var bot = document.getElementById("wgl75-bottom");
      if (bot) bot.innerHTML = renderGenesisSection();
    }
  };

  window.wgl75ApplyWorld = function() {
    if (typeof window.wgp75ApplyWorld !== "function") return;
    var r = window.wgp75ApplyWorld(state.previewData || null);
    showToast(r.msg, r.ok ? "#10b981" : "#ef4444");
    if (r.ok) {
      state.activeTab = "history75";
      var bot = document.getElementById("wgl75-bottom");
      if (bot) bot.innerHTML = renderGenesisSection();
    }
  };

  window.wgl75Regenerate = function() {
    state.activeTab = "genesis75";
    var bot = document.getElementById("wgl75-bottom");
    if (bot) bot.innerHTML = renderGenesisSection();
    setTimeout(function() { window.wgl75StartGenerate(); }, 100);
  };

  window.wgl75PreviewFromHistory = function(historyId) {
    var history = typeof window.ag75GetHistory === "function" ? window.ag75GetHistory() : [];
    var entry = history.find(function(h) { return h.id === historyId; });
    if (!entry || !entry.worldData) return;
    state.previewData = entry.worldData;
    state.activeTab = "preview75";
    var bot = document.getElementById("wgl75-bottom");
    if (bot) bot.innerHTML = renderGenesisSection();
  };

  function showToast(msg, color) {
    var banner = document.createElement("div");
    banner.style.cssText = "position:fixed;top:20px;right:20px;z-index:9999;background:#0a0a1a;border:1px solid " + (color || "#8b5cf6") + ";border-radius:10px;padding:12px 16px;color:" + (color || "#a78bfa") + ";font-size:12px;font-weight:600;max-width:300px;box-shadow:0 4px 20px rgba(0,0,0,0.6);white-space:pre-line";
    banner.textContent = msg;
    document.body.appendChild(banner);
    setTimeout(function() { if (banner.parentNode) banner.parentNode.removeChild(banner); }, 4000);
  }

  // ─── Hook creator-hub-v32 hubRenderPanel ───────────────────
  function hookCreatorHub() {
    if (typeof window.hubRenderPanel !== "function") return false;
    if (window._wgl75Hooked) return true;
    var _orig = window.hubRenderPanel;
    window.hubRenderPanel = function(panelId) {
      if (typeof _orig === "function") _orig(panelId);
      if (panelId === "creator-hub-v32") {
        setTimeout(function() { window.wgl75RenderSection(); }, 60);
      }
    };
    window._wgl75Hooked = true;
    return true;
  }

  function tryHookWithRetry(attempts) {
    if (hookCreatorHub()) return;
    if (attempts <= 0) { console.warn("[WorldLoreGenerator V75] creator-hub-v32 hubRenderPanel chưa sẵn sàng."); return; }
    setTimeout(function() { tryHookWithRetry(attempts - 1); }, 500);
  }

  function init() {
    load();
    tryHookWithRetry(20);
    console.log("[WorldLoreGenerator V75] 📜 AI Lore Generator & UI Registry khởi động — 4 tabs (AI Genesis/Prompt Builder/World Preview/Generated Worlds) · inject vào creator-hub-v32 sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 18700); });
  } else { setTimeout(init, 18700); }
})();
