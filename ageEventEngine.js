// ═══════════════════════════════════════════════════════════════
// AGE EVENT ENGINE V43 — Creator God World Simulator
// Sự kiện lịch sử theo từng kỷ nguyên
// Save: cgv6_age_events_v43
// ═══════════════════════════════════════════════════════════════
(function() {
"use strict";

const SAVE_KEY = "cgv6_age_events_v43";
const FIRE_RATE = 20;
const MAX_EVENTS = 100;
var _tick = 0;

const AGE_EVENTS = {
  CHAOS: [
    { title:"Khai Nguyên", desc:"Vũ trụ ra đời từ hư không, ánh sáng đầu tiên xuất hiện.", type:"cosmology", color:"#94a3b8" },
    { title:"Đại Hỗn Mang", desc:"Vạn vật chưa định hình, năng lượng nguyên thủy cuộn tràn.", type:"cosmology", color:"#64748b" },
    { title:"Hiện Thân Đầu Tiên", desc:"Sinh vật đầu tiên xuất hiện từ màn đêm hỗn độn.", type:"life", color:"#94a3b8" }
  ],
  MYTHIC: [
    { title:"Khai Sinh Thần Linh", desc:"Các vị thần tối cao xuất hiện và tuyên bố quyền năng của mình.", type:"divine", color:"#a78bfa" },
    { title:"Trận Chiến Thần Thánh", desc:"Các thần linh giao tranh để giành quyền kiểm soát thế giới.", type:"war", color:"#8b5cf6" },
    { title:"Ban Phước Cho Loài Người", desc:"Thần linh truyền đạt tri thức và sức mạnh cho những tín đồ đầu tiên.", type:"divine", color:"#7c3aed" },
    { title:"Quái Vật Huyền Thoại Ra Đời", desc:"Những sinh vật huyền bí khổng lồ bước ra từ cõi thần.", type:"creature", color:"#a78bfa" },
    { title:"Thiên Đình Hình Thành", desc:"Các thần linh xây dựng cung điện trên tầng mây.", type:"divine", color:"#8b5cf6" }
  ],
  HEROIC: [
    { title:"Sử Thi Anh Hùng", desc:"Một chiến binh vĩ đại hoàn thành 12 kỳ công huyền thoại.", type:"hero", color:"#f97316" },
    { title:"Cuộc Chiến Mười Năm", desc:"Liên quân các vương quốc bao vây pháo đài bất khả xâm phạm.", type:"war", color:"#ea580c" },
    { title:"Lời Tiên Tri Ứng Nghiệm", desc:"Một đứa trẻ được tiên tri từ trước đứng lên lật đổ bạo chúa.", type:"hero", color:"#f97316" },
    { title:"Hội Thề Anh Hùng", desc:"Các chiến binh lừng danh thề nguyện liên minh bảo vệ thiên hạ.", type:"alliance", color:"#fb923c" },
    { title:"Kỳ Tích Đơn Độc", desc:"Một anh hùng một mình đánh bại đội quân hàng ngàn người.", type:"hero", color:"#f97316" }
  ],
  ANCIENT: [
    { title:"Xây Dựng Kỳ Quan", desc:"Công trình kiến trúc vĩ đại được hoàn thành sau hàng chục năm.", type:"culture", color:"#fbbf24" },
    { title:"Hội Đồng Triết Gia", desc:"Các nhà tư tưởng vĩ đại hội tụ đặt nền móng cho triết học.", type:"knowledge", color:"#d97706" },
    { title:"Thư Viện Vạn Thư", desc:"Tri thức của thiên hạ được tập hợp trong một thư viện khổng lồ.", type:"knowledge", color:"#fbbf24" },
    { title:"Luật Pháp Đầu Tiên", desc:"Bộ luật thành văn đầu tiên được ban hành, khai sinh nền dân trị.", type:"politics", color:"#d97706" },
    { title:"Đại Hồng Thủy", desc:"Lũ lụt hủy diệt nhiều nền văn minh, chỉ sót lại người có thuyền.", type:"disaster", color:"#ef4444" }
  ],
  IMPERIAL: [
    { title:"Thống Nhất Thiên Hạ", desc:"Một đế quốc hùng mạnh đặt dưới quyền kiểm soát toàn bộ lục địa.", type:"conquest", color:"#ef4444" },
    { title:"Sụp Đổ Đế Quốc", desc:"Đế quốc vĩ đại nhất tan vỡ thành hàng trăm quốc gia nhỏ.", type:"collapse", color:"#dc2626" },
    { title:"Chiến Dịch Viễn Chinh", desc:"Đại quân vượt sa mạc và núi tuyết chinh phục vùng đất xa xôi.", type:"war", color:"#ef4444" },
    { title:"Hòa Ước Vạn Năm", desc:"Hai đế quốc ký kết hiệp ước hòa bình lịch sử.", type:"diplomacy", color:"#10b981" },
    { title:"Cách Mạng Nội Bộ", desc:"Người dân nổi dậy lật đổ hoàng đế độc tài.", type:"revolution", color:"#f97316" }
  ],
  RENAISSANCE: [
    { title:"Bùng Nổ Nghệ Thuật", desc:"Hàng loạt kiệt tác hội họa, điêu khắc và âm nhạc được sáng tác.", type:"culture", color:"#34d399" },
    { title:"Phát Minh Máy In", desc:"Tri thức lan rộng với tốc độ chưa từng thấy nhờ máy in.", type:"technology", color:"#10b981" },
    { title:"Hải Trình Đại Phát Kiến", desc:"Thủy thủ dũng cảm vượt đại dương tìm ra lục địa mới.", type:"exploration", color:"#34d399" },
    { title:"Cách Mạng Khoa Học", desc:"Mô hình vũ trụ mới lật đổ quan niệm ngàn năm.", type:"knowledge", color:"#059669" },
    { title:"Phục Hưng Triết Học", desc:"Triết học cổ đại được tái khám phá và phát triển rực rỡ.", type:"knowledge", color:"#34d399" }
  ],
  INDUSTRIAL: [
    { title:"Cách Mạng Hơi Nước", desc:"Máy hơi nước thay thế sức người, sản lượng tăng gấp mười lần.", type:"technology", color:"#60a5fa" },
    { title:"Đường Sắt Vạn Lý", desc:"Mạng lưới đường sắt kết nối cả lục địa trong vài ngày.", type:"technology", color:"#3b82f6" },
    { title:"Đình Công Vĩ Đại", desc:"Công nhân đình công toàn quốc đòi quyền lợi lao động.", type:"politics", color:"#f97316" },
    { title:"Ô Nhiễm Đại Quy Mô", desc:"Khói nhà máy che phủ bầu trời, sông suối nhiễm độc.", type:"disaster", color:"#94a3b8" },
    { title:"Điện Khí Hóa", desc:"Điện năng thắp sáng mọi thành phố, mở ra kỷ nguyên mới.", type:"technology", color:"#fbbf24" }
  ],
  DIGITAL: [
    { title:"Kỷ Nguyên Internet", desc:"Mạng lưới thông tin toàn cầu kết nối mọi tâm hồn.", type:"technology", color:"#06b6d4" },
    { title:"AI Tỉnh Thức", desc:"Trí tuệ nhân tạo lần đầu vượt qua trí tuệ con người.", type:"ai", color:"#0891b2" },
    { title:"Thực Tế Ảo Hòa Nhập", desc:"Ranh giới giữa thế giới số và thực tế xóa nhòa.", type:"technology", color:"#06b6d4" },
    { title:"Chiến Tranh Mạng", desc:"Một quốc gia tê liệt hoàn toàn bởi tấn công số hóa.", type:"war", color:"#ef4444" },
    { title:"Sinh Học Tổng Hợp", desc:"Con người tái thiết kế bộ gen, khai sinh giống loài mới.", type:"science", color:"#34d399" }
  ],
  SPACE: [
    { title:"Đặt Chân Lên Hành Tinh Mới", desc:"Con người lần đầu đặt chân lên hành tinh khác.", type:"exploration", color:"#818cf8" },
    { title:"Tiếp Xúc Ngoài Hành Tinh", desc:"Tín hiệu trí tuệ từ thiên hà xa được giải mã.", type:"contact", color:"#6366f1" },
    { title:"Khai Thác Tiểu Hành Tinh", desc:"Nguồn tài nguyên vô tận trong không gian được khai thác.", type:"economy", color:"#818cf8" },
    { title:"Chiến Tranh Không Gian", desc:"Cuộc xung đột đầu tiên diễn ra ngoài khí quyển.", type:"war", color:"#ef4444" },
    { title:"Cổng Không Gian Đầu Tiên", desc:"Portal liên chiều được kích hoạt mở ra đa vũ trụ.", type:"discovery", color:"#a78bfa" }
  ],
  INTERVERSE: [
    { title:"Hội Nghị Liên Vũ Trụ", desc:"Đại diện các vũ trụ song song họp bàn trật tự mới.", type:"diplomacy", color:"#c084fc" },
    { title:"Đại Chiến Liên Giới", desc:"Xung đột quy mô liên vũ trụ đe dọa thực tại.", type:"war", color:"#ef4444" },
    { title:"Trao Đổi Văn Hóa Đa Chiều", desc:"Nghệ thuật và tri thức từ các vũ trụ khác nhau giao thoa.", type:"culture", color:"#c084fc" },
    { title:"Sụp Đổ Vũ Trụ Song Song", desc:"Một vũ trụ song song biến mất, gây chấn động toàn hệ.", type:"disaster", color:"#dc2626" },
    { title:"Định Lý Nhân Quả Liên Chiều", desc:"Luật nhân quả được phát hiện hoạt động xuyên vũ trụ.", type:"science", color:"#c084fc" }
  ],
  MULTIVERSE: [
    { title:"Hội Tụ Đa Vũ Trụ", desc:"Hàng nghìn vũ trụ bắt đầu hợp nhất thành một siêu thực tại.", type:"cosmology", color:"#f472b6" },
    { title:"Thần Tối Thượng Hiển Hiện", desc:"Đấng sáng tạo tối cao xuất hiện trước mọi chúng sinh.", type:"divine", color:"#ec4899" },
    { title:"Chiến Tranh Thực Tại", desc:"Cuộc xung đột quyết định bản chất của thực tại tương lai.", type:"war", color:"#ef4444" },
    { title:"Siêu Thức Tập Thể", desc:"Mọi ý thức trong đa vũ trụ kết nối thành một siêu trí tuệ.", type:"ascension", color:"#f472b6" },
    { title:"Vũ Trụ Hoàn Hảo", desc:"Mô phỏng vũ trụ hoàn hảo được tạo ra từ ý chí thuần túy.", type:"creation", color:"#fbbf24" }
  ],
  GENESIS: [
    { title:"Đại Sáng Thế Mới", desc:"Đấng Tạo Hóa viết lại quy luật vũ trụ từ đầu.", type:"creation", color:"#fde68a" },
    { title:"Hồi Sinh Vạn Linh", desc:"Mọi linh hồn từ mọi kỷ nguyên được tái sinh trong thực tại mới.", type:"rebirth", color:"#fbbf24" },
    { title:"Vòng Tuần Hoàn Hoàn Tất", desc:"Chu kỳ vũ trụ đóng lại, chuẩn bị cho hỗn mang tiếp theo.", type:"cycle", color:"#f59e0b" },
    { title:"Ánh Sáng Vĩnh Hằng", desc:"Bóng tối cuối cùng tan biến, ánh sáng tuyệt đối bao phủ.", type:"divine", color:"#fde68a" }
  ]
};

window.ageEventData = {
  recentEvents: [],
  totalFired: 0,
  byAge: {}
};

function save() {
  try {
    var compact = {
      recentEvents: window.ageEventData.recentEvents.slice(-50),
      totalFired: window.ageEventData.totalFired,
      byAge: window.ageEventData.byAge
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(compact));
  } catch(e){}
}
function load() {
  try {
    var d = localStorage.getItem(SAVE_KEY);
    if (d) { var p = JSON.parse(d); window.ageEventData = Object.assign(window.ageEventData, p); }
  } catch(e){}
}

window.aeeGetRecentEvents = function(n) {
  return (window.ageEventData.recentEvents||[]).slice(-(n||20)).reverse();
};

window.aeeGetEventsByAge = function(ageId) {
  return (window.ageEventData.recentEvents||[]).filter(function(e){ return e.age === ageId; });
};

window.aeeFireEvent = function(ageId) {
  var pool = AGE_EVENTS[ageId];
  if (!pool || pool.length === 0) return null;
  var ev = pool[Math.floor(Math.random() * pool.length)];
  var yr = window.year || 1;
  var record = {
    age: ageId, year: yr,
    title: ev.title, desc: ev.desc,
    type: ev.type, color: ev.color,
    ts: Date.now()
  };
  window.ageEventData.recentEvents.push(record);
  if (window.ageEventData.recentEvents.length > MAX_EVENTS) {
    window.ageEventData.recentEvents = window.ageEventData.recentEvents.slice(-MAX_EVENTS);
  }
  window.ageEventData.totalFired++;
  window.ageEventData.byAge[ageId] = (window.ageEventData.byAge[ageId]||0)+1;
  if (typeof window.htAddEvent === "function") {
    window.htAddEvent({ year:yr, type:"age_event", title:"[" + (ageId||"?") + "] " + ev.title, color:ev.color||"#8b5cf6" });
  }
  save();
  return record;
};

window.aeeFireCurrentAgeEvent = function() {
  var curId = (window.worldAgeData && window.worldAgeData.currentAge) ? window.worldAgeData.currentAge : "CHAOS";
  return window.aeeFireEvent(curId);
};

// ── Tick ─────────────────────────────────────────────────────
window.aeeV43Tick = function() {
  _tick++;
  if (_tick % FIRE_RATE === 0) {
    if (Math.random() < 0.15) {
      var curId = (window.worldAgeData && window.worldAgeData.currentAge) ? window.worldAgeData.currentAge : "CHAOS";
      window.aeeFireEvent(curId);
    }
  }
};

// ── Init ─────────────────────────────────────────────────────
function init() {
  load();
  var _orig = window.gameTick;
  window.gameTick = function() { if (_orig) _orig(); window.aeeV43Tick(); };
  console.log("[AgeEventEngine V43] ⚡ Sự Kiện Kỷ Nguyên khởi động — 12 bộ sự kiện · " +
    Object.values(AGE_EVENTS).reduce(function(s,a){return s+a.length;},0) + " mẫu sự kiện sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 3100); });
} else {
  setTimeout(init, 3100);
}
})();
