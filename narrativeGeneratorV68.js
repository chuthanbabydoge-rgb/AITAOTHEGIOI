(function() {
  "use strict";

  // ════════════════════════════════════════
  // NARRATIVE GENERATOR V68
  // Builds prompt from world data + calls /api/claude
  // Streams result into chapter book
  // ════════════════════════════════════════

  window.narrativeGenV68State = {
    generating: false,
    lastError: null,
    progress: ""
  };

  // ════ STYLE PROMPTS ════
  const STYLE_PROMPTS = {
    su_thi: `Hãy viết theo phong cách SỬ THI TIẾNG VIỆT CỔ ĐIỂN — trang trọng, hào hùng, có vần điệu khi thích hợp. Dùng những từ ngữ cổ kính như "hỡi", "ngàn thu", "giang sơn", "sơn hà xã tắc". Chia thành các đoạn có tiêu đề nhỏ. Câu văn dài, trau chuốt.`,
    truyen_ky: `Hãy viết theo phong cách TRUYỆN KỲ — kể chuyện sinh động, hấp dẫn như đọc tiểu thuyết lịch sử. Có mở đầu, diễn biến, cao trào. Dùng ngôi thứ ba. Câu văn xen kẽ ngắn-dài. Có chi tiết cụ thể.`,
    bien_nien_su: `Hãy viết theo phong cách BIÊN NIÊN SỬ — ghi chép theo trình tự thời gian, trung thực, khách quan. Mỗi sự kiện ghi rõ năm. Format: "[Năm X] — Sự kiện...". Ngôn ngữ chính xác, súc tích.`,
    su_thi_anh_hung: `Hãy viết theo phong cách SỬ THI ANH HÙNG — tập trung vào những anh hùng hào kiệt, chiến công hiển hách. Giọng văn cuồn cuộn như sóng biển, ca ngợi dũng khí. Nhân vật phải nổi bật, có cá tính riêng. Dùng ẩn dụ so sánh hùng tráng.`
  };

  const LENGTH_TOKENS = { short: 400, medium: 800, long: 1400 };

  // ════ BUILD PROMPT ════
  function buildPrompt(snap, style, customFocus) {
    const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.su_thi;
    const sections = snap.sections.map(s =>
      `**${s.heading}:**\n${s.items.map(i => `  - ${i}`).join("\n")}`
    ).join("\n\n");

    const godLine = snap.godStatus
      ? `\n**Đấng Sáng Thế:** ${snap.godStatus}`
      : "";

    return `Bạn là một nhà sử học vĩ đại của thế giới "${snap.worldName}", đang ghi chép lịch sử năm ${snap.year}, kỷ nguyên "${snap.era}".

${stylePrompt}

**DỮ LIỆU THẾ GIỚI NĂM ${snap.year}:**

${sections}${godLine}

${customFocus ? `**YÊU CẦU ĐẶC BIỆT:** ${customFocus}\n` : ""}
**NHIỆM VỤ:**
Viết một chương sử ký về thế giới này tại thời điểm năm ${snap.year}. Chương phải:
1. Có tiêu đề chương ấn tượng (bắt đầu bằng "# CHƯƠNG X — ")
2. Phản ánh chính xác các sự kiện và nhân vật trong dữ liệu trên
3. Mang không khí lịch sử huyền bí, hoành tráng
4. Viết hoàn toàn bằng tiếng Việt
5. Độ dài vừa phải, đủ ý

Bắt đầu ngay với chương sử:`;
  }

  // ════ CALL CLAUDE API ════
  async function callClaude(prompt, maxTokens) {
    const response = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error("API error: " + err);
    }
    const data = await response.json();
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    return data.content && data.content[0] && data.content[0].text
      ? data.content[0].text
      : (data.content || "");
  }

  // ════ EXTRACT TITLE FROM CONTENT ════
  function extractTitle(content) {
    const match = content.match(/^#\s+(.+)/m);
    if (match) return match[1].trim();
    const lines = content.split("\n").filter(l => l.trim());
    return lines[0] ? lines[0].substring(0, 80) : "Chương Sử Ký";
  }

  function extractTags(content, snap) {
    const tags = [];
    if (snap.era) tags.push(snap.era);
    if (window.warsActive && window.warsActive.length > 0) tags.push("chiến tranh");
    if (content.toLowerCase().includes("anh hùng")) tags.push("anh hùng");
    if (content.toLowerCase().includes("thần linh") || content.toLowerCase().includes("đấng sáng thế")) tags.push("thần linh");
    return tags;
  }

  // ════ MAIN GENERATE FUNCTION ════
  window.ng68GenerateChapter = async function(silent, customFocus) {
    const state = window.narrativeGenV68State;
    if (state.generating) {
      if (!silent) _showProgress("⏳ Đang tạo chương khác, vui lòng chờ...", "warn");
      return null;
    }

    const d = window.worldNarrativeV68Data;
    const settings = d.settings;
    state.generating = true;
    state.lastError = null;

    try {
      if (!silent) _showProgress("📊 Đang thu thập dữ liệu thế giới...", "info");

      const snap = typeof window.wn68BuildSnapshot === "function"
        ? window.wn68BuildSnapshot()
        : { year: window.year || 0, worldName: "Thế Giới", era: "Hiện Tại", sections: [] };

      if (!silent) _showProgress("✍️ Đang viết sử ký (Claude đang suy nghĩ)...", "info");

      const prompt = buildPrompt(snap, settings.style, customFocus);
      const maxTokens = LENGTH_TOKENS[settings.length] || 800;

      const rawContent = await callClaude(prompt, maxTokens);

      const title = extractTitle(rawContent);
      const tags = extractTags(rawContent, snap);

      const chapter = typeof window.wn68AddChapter === "function"
        ? window.wn68AddChapter({
            year: snap.year,
            era: snap.era,
            title,
            content: rawContent,
            style: settings.style,
            tags,
            worldName: snap.worldName
          })
        : { title, content: rawContent };

      if (!silent) {
        _showProgress("✅ Chương mới đã được viết xong!", "success");
        // Refresh book UI
        if (typeof window.nb68Render === "function") window.nb68Render(chapter.id);
        if (typeof window.nr68Refresh === "function") window.nr68Refresh();
      }

      return chapter;
    } catch(err) {
      state.lastError = err.message;
      if (!silent) _showProgress("❌ Lỗi: " + err.message, "error");
      console.error("[NarrativeGeneratorV68] Error:", err);
      return null;
    } finally {
      state.generating = false;
    }
  };

  // ════ GENERATE WITH FOCUS ════
  window.ng68GenerateWithFocus = async function(focusText) {
    return window.ng68GenerateChapter(false, focusText);
  };

  // ════ PROGRESS UI ════
  function _showProgress(msg, type) {
    window.narrativeGenV68State.progress = msg;
    const el = document.getElementById("ng68-progress");
    if (!el) return;
    const colors = { info: "#60a5fa", success: "#4ade80", error: "#f87171", warn: "#fbbf24" };
    el.style.color = colors[type] || "#94a3b8";
    el.innerHTML = msg;
  }

  function init() {
    console.log("[NarrativeGeneratorV68] ✍️ Narrative Generator khởi động — /api/claude ready.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 15300); });
  } else {
    setTimeout(init, 15300);
  }
})();
