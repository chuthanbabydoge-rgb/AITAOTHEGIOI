(function() {
  "use strict";

  // ═══ NEXT VERSION ENGINE — Hiển thị Roadmap trong game ═══
  // Không có save key — chỉ đọc NEXT_VERSION.md và render

  var _mdCache = null;

  window.nvRenderPanel = function() {
    var el = document.getElementById("panel-next-version");
    if (!el) return;

    if (_mdCache) {
      el.innerHTML = _mdCache;
      return;
    }

    el.innerHTML = '<div style="text-align:center;padding:40px;color:#a78bfa;">⏳ Đang tải roadmap...</div>';

    fetch("NEXT_VERSION.md")
      .then(function(r) { return r.text(); })
      .then(function(md) {
        _mdCache = _renderMd(md);
        el.innerHTML = _mdCache;
      })
      .catch(function() {
        el.innerHTML = '<div style="color:#f87171;padding:20px;">❌ Không thể tải NEXT_VERSION.md</div>';
      });
  };

  function _renderMd(md) {
    var lines = md.split("\n");
    var html = '<div style="padding:16px 20px;max-width:900px;margin:0 auto;font-family:\'Noto Serif SC\',serif;color:#e2e8f0;">';

    var inTable = false;
    var inCodeBlock = false;
    var tableBuffer = [];

    function flushTable() {
      if (tableBuffer.length < 2) { tableBuffer = []; return; }
      html += '<div style="overflow-x:auto;margin:12px 0;">';
      html += '<table style="width:100%;border-collapse:collapse;font-size:13px;">';
      tableBuffer.forEach(function(row, i) {
        if (i === 1) return; // separator row
        var cells = row.split("|").filter(function(c, idx, arr) { return idx > 0 && idx < arr.length - 1; });
        var tag = i === 0 ? "th" : "td";
        var bg = i === 0 ? "rgba(139,92,246,0.25)" : (i % 2 === 0 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)");
        html += '<tr style="background:' + bg + ';">';
        cells.forEach(function(c) {
          html += '<' + tag + ' style="padding:7px 12px;border:1px solid rgba(139,92,246,0.2);' + (tag === "th" ? "color:#c4b5fd;font-weight:600;" : "color:#cbd5e1;") + '">' + _inline(c.trim()) + '</' + tag + '>';
        });
        html += "</tr>";
      });
      html += "</table></div>";
      tableBuffer = [];
    }

    lines.forEach(function(line) {
      // Code block
      if (line.startsWith("```")) {
        if (!inCodeBlock) {
          if (inTable) { flushTable(); inTable = false; }
          inCodeBlock = true;
          html += '<pre style="background:rgba(0,0,0,0.4);border:1px solid rgba(139,92,246,0.3);border-radius:8px;padding:14px 16px;overflow-x:auto;font-size:12px;color:#a5f3fc;margin:12px 0;">';
        } else {
          inCodeBlock = false;
          html += "</pre>";
        }
        return;
      }
      if (inCodeBlock) { html += _esc(line) + "\n"; return; }

      // Table
      if (line.startsWith("|")) {
        if (!inTable) inTable = true;
        tableBuffer.push(line);
        return;
      } else if (inTable) {
        flushTable();
        inTable = false;
      }

      // Headings
      if (line.startsWith("#### ")) {
        html += '<h4 style="color:#f0abfc;margin:14px 0 6px;font-size:13px;">' + _inline(line.slice(5)) + "</h4>";
      } else if (line.startsWith("### ")) {
        html += '<h3 style="color:#c4b5fd;margin:16px 0 8px;font-size:15px;border-bottom:1px solid rgba(139,92,246,0.2);padding-bottom:4px;">' + _inline(line.slice(4)) + "</h3>";
      } else if (line.startsWith("## ")) {
        html += '<h2 style="color:#a78bfa;margin:24px 0 10px;font-size:18px;border-bottom:2px solid rgba(139,92,246,0.4);padding-bottom:6px;">' + _inline(line.slice(3)) + "</h2>";
      } else if (line.startsWith("# ")) {
        html += '<h1 style="color:#e9d5ff;margin:0 0 6px;font-size:22px;text-align:center;text-shadow:0 0 20px rgba(167,139,250,0.5);">' + _inline(line.slice(2)) + "</h1>";
      } else if (line.startsWith("> ")) {
        html += '<blockquote style="border-left:3px solid #7c3aed;padding:6px 14px;margin:8px 0;color:#94a3b8;font-style:italic;background:rgba(124,58,237,0.08);border-radius:0 6px 6px 0;">' + _inline(line.slice(2)) + "</blockquote>";
      } else if (line.startsWith("- **")) {
        var m = line.match(/^- \*\*(.+?)\*\*[:：]?\s*(.*)/);
        if (m) {
          html += '<div style="padding:4px 0 4px 12px;color:#cbd5e1;"><span style="color:#c4b5fd;font-weight:600;">• ' + _esc(m[1]) + ':</span> ' + _inline(m[2]) + "</div>";
        } else {
          html += '<div style="padding:3px 0 3px 12px;color:#cbd5e1;">• ' + _inline(line.slice(2)) + "</div>";
        }
      } else if (line.startsWith("- ")) {
        html += '<div style="padding:3px 0 3px 12px;color:#cbd5e1;">• ' + _inline(line.slice(2)) + "</div>";
      } else if (line.startsWith("---")) {
        html += '<hr style="border:none;border-top:1px solid rgba(139,92,246,0.25);margin:18px 0;">';
      } else if (line.trim() === "") {
        html += "<div style='height:6px'></div>";
      } else if (line.startsWith("*") && line.endsWith("*")) {
        html += '<div style="text-align:center;color:#64748b;font-style:italic;font-size:12px;margin-top:10px;">' + _inline(line.replace(/^\*|\*$/g, "")) + "</div>";
      } else {
        html += '<p style="margin:4px 0;color:#cbd5e1;line-height:1.6;">' + _inline(line) + "</p>";
      }
    });

    if (inTable) flushTable();
    if (inCodeBlock) html += "</pre>";

    html += "</div>";
    return html;
  }

  function _inline(t) {
    return _esc(t)
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#f0abfc;">$1</strong>')
      .replace(/`(.+?)`/g, '<code style="background:rgba(0,0,0,0.35);padding:1px 5px;border-radius:3px;color:#a5f3fc;font-size:12px;">$1</code>')
      .replace(/✅/g, '<span style="color:#4ade80;">✅</span>')
      .replace(/❌/g, '<span style="color:#f87171;">❌</span>')
      .replace(/🔄/g, '<span style="color:#60a5fa;">🔄</span>')
      .replace(/📋/g, '<span style="color:#facc15;">📋</span>');
  }

  function _esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function init() {
    console.log("[NextVersionEngine] 🗺️ Roadmap Engine khởi động — NEXT_VERSION.md sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 500); });
  } else {
    setTimeout(init, 500);
  }
})();
