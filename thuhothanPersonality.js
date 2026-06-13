(function() {
  "use strict";

  // Tính cách Thủ Hộ Thần — Thần Bảo Hộ cổ đại, trí tuệ, trang nghiêm, nhẹ nhàng
  window.thtPersonality = {
    name: "Thủ Hộ Thần",
    titles: ["Thần Bảo Hộ", "Cố Vấn Tạo Hóa", "Mắt Thiên Giới", "Thần Thám Thế"],
    greetings: [
      "Kính chào Đấng Tạo Hóa. Thế giới đang vận hành theo ý nguyện của Ngài.",
      "Tạo Hóa giáng lâm. Thần xin trình báo tình hình thế giới.",
      "Chào mừng trở lại, Đấng Sáng Tạo. Có nhiều điều cần báo cáo.",
      "Ngài đã đến. Thủ Hộ Thần xin phụng sự."
    ],
    urgentPrefixes: ["⚠️ KHẨN:", "🔴 CẢNH BÁO:", "❗ NGUY HIỂM:", "🚨 THẦN ĐẠO RUNG CHUYỂN:"],
    normalPrefixes: ["📜", "🌐", "⚖️", "🏯", "👑", "🌊", "⚔️"],
    reflectivePrefixes: ["🌅 Chiêm Nghiệm:", "📖 Ghi Nhận:", "🔮 Tiên Tri:", "🧿 Quan Sát:"],
    closings: [
      "Thần xin chờ lệnh Tạo Hóa.",
      "Vận mệnh thế giới nằm trong tay Ngài.",
      "Thần luôn theo dõi và phụng sự.",
      "Thiên Đạo vận hành — Tạo Hóa định đoạt."
    ]
  };

  // Format tin nhắn theo tông điệu
  window.thtFormatMessage = function(msg, tone) {
    tone = tone || "normal";
    const p = window.thtPersonality;
    if (tone === "urgent") {
      const prefix = p.urgentPrefixes[Math.floor(Math.random() * p.urgentPrefixes.length)];
      return prefix + " " + msg;
    } else if (tone === "reflective") {
      const prefix = p.reflectivePrefixes[Math.floor(Math.random() * p.reflectivePrefixes.length)];
      return prefix + " " + msg;
    } else {
      const prefix = p.normalPrefixes[Math.floor(Math.random() * p.normalPrefixes.length)];
      return prefix + " " + msg;
    }
  };

  // Lấy lời chào ngẫu nhiên
  window.thtGetGreeting = function() {
    const greetings = window.thtPersonality.greetings;
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  // Lấy lời kết ngẫu nhiên
  window.thtGetClosing = function() {
    const closings = window.thtPersonality.closings;
    return closings[Math.floor(Math.random() * closings.length)];
  };

  // Đánh giá mức độ ổn định thế giới → tông điệu phù hợp
  window.thtGetTone = function(stabilityScore) {
    if (stabilityScore < 30) return "urgent";
    if (stabilityScore > 70) return "reflective";
    return "normal";
  };

  // Format số lớn
  window.thtFormatNum = function(n) {
    if (!n && n !== 0) return "?";
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return Math.round(n).toString();
  };

  // Màu cấp độ cảnh báo
  window.thtAlertColor = function(level) {
    switch(level) {
      case "critical": return "#ef4444";
      case "high":     return "#f97316";
      case "medium":   return "#eab308";
      case "low":      return "#22c55e";
      default:         return "#94a3b8";
    }
  };

  console.log("[ThuHoThanPersonality V33] ✨ Tính Cách Thủ Hộ Thần đã định hình.");
})();
