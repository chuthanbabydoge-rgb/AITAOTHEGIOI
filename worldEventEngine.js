'use strict';
/* ============================================================
   WORLD EVENT ENGINE V1 — Creator God V6
   Thiên Hạ Đại Sự — Sự Kiện Thế Giới

   30+ curated world events across 6 categories:
   🌌 Thiên Tượng  · 🌍 Địa Biến  · 🦠 Dịch Họa
   📜 Khải Huyền  · ⚔️ Chính Biến · 🌸 Thịnh Thế
   ============================================================ */

// ─── CONSTANTS ────────────────────────────────────────────────

const WEE_CATEGORIES = {
  celestial:  { id:'celestial',  icon:'🌌', name:'Thiên Tượng',  color:'#818cf8', bg:'#1e1b4b' },
  earth:      { id:'earth',      icon:'🌍', name:'Địa Biến',     color:'#34d399', bg:'#064e3b' },
  plague:     { id:'plague',     icon:'🦠', name:'Dịch Họa',     color:'#f87171', bg:'#450a0a' },
  prophecy:   { id:'prophecy',   icon:'📜', name:'Khải Huyền',   color:'#fbbf24', bg:'#451a03' },
  political:  { id:'political',  icon:'⚔️', name:'Chính Biến',   color:'#f97316', bg:'#431407' },
  prosperity: { id:'prosperity', icon:'🌸', name:'Thịnh Thế',    color:'#e879f9', bg:'#3b0764' },
};

const WEE_RARITY = {
  common:    { label:'Thường',    color:'#9ca3af', weight:40 },
  rare:      { label:'Hiếm',     color:'#60a5fa', weight:25 },
  epic:      { label:'Sử Thi',   color:'#c084fc', weight:20 },
  legendary: { label:'Huyền Thoại', color:'#fbbf24', weight:10 },
  mythic:    { label:'Thần Thoại',  color:'#f43f5e', weight:5  },
};

const WEE_EVENTS = {
  // ── CELESTIAL ──────────────────────────────────────────────
  solar_eclipse: {
    id:'solar_eclipse', cat:'celestial', rarity:'rare', duration:20, cooldown:60,
    icon:'🌑', name:'Nhật Thực Huyền Bí',
    desc:'Mặt trời bị che khuất, linh lực thiên địa rối loạn. Tu sĩ tà đạo hưng thịnh.',
    flavor:'"Thiên nhật ẩn, tà ma xuất, vạn linh bất an."',
    effects: { cultivationMult:0.7, warMult:1.3, spawnMult:1.5 },
    onStart(st){ weeLog(`🌑 Nhật Thực Huyền Bí giáng xuống — Linh lực rối loạn!`); weeFlash('celestial'); },
    onEnd(st)  { weeLog(`☀️ Nhật Thực kết thúc — Thiên địa bình phục.`); },
  },
  meteor_shower: {
    id:'meteor_shower', cat:'celestial', rarity:'epic', duration:0, cooldown:80,
    icon:'☄️', name:'Mưa Sao Băng Thiên Thạch',
    desc:'Hàng trăm thiên thạch rơi xuống — một số mang theo cổ kim bí bảo, số khác hủy diệt.',
    flavor:'"Trời rơi lửa đá, đất nứt vàng bạc, kẻ may mắn phát tài, kẻ vận đen tan xác."',
    effects: {},
    onStart(st){
      weeLog(`☄️ Mưa Sao Băng Thiên Thạch giáng xuống!`);
      weeFlash('celestial');
      _weeBoostRandom('tech', 15, 30);
      _weeDamageRandom(0.05, 0.15);
    },
    onEnd(st){},
  },
  twin_moons: {
    id:'twin_moons', cat:'celestial', rarity:'legendary', duration:40, cooldown:150,
    icon:'🌕', name:'Song Nguyệt Xuất Hiện',
    desc:'Hai vầng trăng cùng sáng — thiên địa linh lực tụ hội, đột phá dễ như thở.',
    flavor:'"Song Nguyệt Giao Huy — Thiên Địa Mở Cửa, Vạn Tu Sĩ Đốn Ngộ."',
    effects: { cultivationMult:2.0, birthMult:1.5 },
    onStart(st){ weeLog(`🌕 Song Nguyệt Xuất Hiện — Thiên Địa Cửa Mở, Linh Lực Cuồn Cuộn!`); weeFlash('celestial'); },
    onEnd(st)  { weeLog(`🌙 Song Nguyệt ẩn mất, thiên địa trở lại bình thường.`); },
  },
  heavenly_rift: {
    id:'heavenly_rift', cat:'celestial', rarity:'mythic', duration:30, cooldown:200,
    icon:'🌀', name:'Thiên Địa Rạn Nứt',
    desc:'Kết giới giữa các cõi vỡ toang — quái vật dị giới tràn vào, cơ hội và nguy hiểm đồng hành.',
    flavor:'"Khi thiên địa rạn, vạn cõi giao hòa — anh hùng xuất thế hay ác quỷ lên ngôi?"',
    effects: { spawnMult:3.0, warMult:1.8, cultivationMult:1.5 },
    onStart(st){ weeLog(`🌀 THIÊN ĐỊA RẠN NỨT — Dị Giới Quái Vật Tràn Vào!`); weeFlash('celestial'); },
    onEnd(st)  { weeLog(`🌀 Thiên địa hàn gắn — vết rạn đóng lại.`); },
  },
  golden_sun: {
    id:'golden_sun', cat:'celestial', rarity:'rare', duration:25, cooldown:70,
    icon:'☀️', name:'Mặt Trời Kim Ô Hiện Thế',
    desc:'Mặt trời phát hào quang vàng rực — nông nghiệp bội thu, dân số tăng trưởng mạnh.',
    flavor:'"Kim Ô Giáng Hạ, Vạn Vật Sinh Trưởng."',
    effects: { birthMult:1.6, econMult:1.4, cultivationMult:1.2 },
    onStart(st){ weeLog(`☀️ Mặt Trời Kim Ô Hiện Thế — Thiên Địa Phú Túc!`); },
    onEnd(st)  { weeLog(`☀️ Kim Ô ẩn mây, cuộc sống trở lại bình thường.`); },
  },

  // ── EARTH CHANGES ──────────────────────────────────────────
  spirit_vein: {
    id:'spirit_vein', cat:'earth', rarity:'rare', duration:50, cooldown:90,
    icon:'💎', name:'Linh Mạch Mới Khai',
    desc:'Một linh mạch cổ đại trồi lên từ lòng đất — linh khí tụ hội, mọi thế lực tranh đoạt.',
    flavor:'"Đất nứt linh quang, vạn lý tụ khí — ai chiếm được, bá nghiệp trong tay."',
    effects: { cultivationMult:1.4, econMult:1.3, warMult:1.2 },
    onStart(st){ weeLog(`💎 Linh Mạch Mới Khai — Linh Khí Cuồn Cuộn!`); _weeBoostRandom('culture', 10, 20); },
    onEnd(st)  { weeLog(`💎 Linh mạch suy giảm, linh khí rút dần.`); },
  },
  great_migration: {
    id:'great_migration', cat:'earth', rarity:'common', duration:0, cooldown:40,
    icon:'🚶', name:'Đại Di Cư Thiên Hạ',
    desc:'Hàng vạn người dân bỏ xứ di cư — dân số phân bổ lại, văn hóa giao thoa.',
    flavor:'"Khi đất không nuôi người, người phải tìm đất mới."',
    effects: {},
    onStart(st){ weeLog(`🚶 Đại Di Cư Thiên Hạ — Dân Chúng Phiêu Bạt!`); _weeShiftPop(); },
    onEnd(st){},
  },
  ancient_ruins: {
    id:'ancient_ruins', cat:'earth', rarity:'epic', duration:0, cooldown:100,
    icon:'🏛️', name:'Bí Tích Thượng Cổ Xuất Thế',
    desc:'Một tàn tích cổ đại trồi lên từ dưới đất — bảo vật, kỹ thuật, và nguy hiểm chờ đợi.',
    flavor:'"Cổ tích hiện, vạn pháp đổi, ai đọc được thiên thư, trời đất phải nhường."',
    effects: {},
    onStart(st){
      weeLog(`🏛️ Bí Tích Thượng Cổ Xuất Thế — Kho Báu Cổ Đại Hiện Ra!`);
      weeFlash('earth');
      _weeBoostRandom('tech', 20, 40);
      _weeBoostRandom('culture', 15, 30);
    },
    onEnd(st){},
  },
  earth_pulse: {
    id:'earth_pulse', cat:'earth', rarity:'rare', duration:30, cooldown:75,
    icon:'🌐', name:'Địa Mạch Xung Động',
    desc:'Địa mạch trên toàn thế giới rung chuyển — mọi nơi tu luyện đều linh động hơn.',
    flavor:'"Địa mạch liên thông, thiên hạ đồng nhịp — tu sĩ khắp nơi đều thụ hưởng."',
    effects: { cultivationMult:1.5 },
    onStart(st){ weeLog(`🌐 Địa Mạch Xung Động — Tu Luyện Khắp Nơi Thuận Lợi!`); },
    onEnd(st)  { weeLog(`🌐 Địa mạch ổn định trở lại.`); },
  },
  sea_route: {
    id:'sea_route', cat:'earth', rarity:'common', duration:60, cooldown:55,
    icon:'⛵', name:'Hải Lộ Thiên Hạ Mở Ra',
    desc:'Tuyến đường biển mới được phát hiện — thương mại bùng nổ, văn hóa giao lưu mạnh.',
    flavor:'"Biển mở, đường thông, vàng bạc chảy về như nước lũ."',
    effects: { econMult:1.5, cultureMult:1.3 },
    onStart(st){ weeLog(`⛵ Hải Lộ Thiên Hạ Mở Ra — Thương Mại Bùng Nổ!`); },
    onEnd(st)  { weeLog(`⛵ Hải lộ đóng cửa theo mùa.`); },
  },

  // ── PLAGUE ─────────────────────────────────────────────────
  black_plague: {
    id:'black_plague', cat:'plague', rarity:'epic', duration:35, cooldown:120,
    icon:'💀', name:'Hắc Tử Ôn Dịch',
    desc:'Bệnh dịch chết người lan rộng — dân số suy giảm nặng nề, kinh tế tê liệt.',
    flavor:'"Đen tối phủ xuống, người người gục ngã — y sĩ bó tay, thần linh im lặng."',
    effects: { birthMult:0.3, econMult:0.6, warMult:0.7 },
    onStart(st){
      weeLog(`💀 HẮC TỬ ÔN DỊCH BÙng PHÁT — Dân Số Suy Giảm!`);
      weeFlash('plague');
      _weeDamageRandom(0.15, 0.25);
    },
    onEnd(st){ weeLog(`💊 Ôn dịch qua đi — thiên hạ đếm tử thi và tái thiết.`); },
  },
  cultivator_blight: {
    id:'cultivator_blight', cat:'plague', rarity:'rare', duration:20, cooldown:80,
    icon:'🧟', name:'Tu Sĩ Tà Độc',
    desc:'Một thứ tà khí lây lan trong giới tu luyện — tu sĩ cao cấp bị suy yếu đột ngột.',
    flavor:'"Tà độc vô hình, xâm nhập kinh mạch — đại năng cũng phải khóc."',
    effects: { cultivationMult:0.4, warMult:0.8 },
    onStart(st){ weeLog(`🧟 Tu Sĩ Tà Độc Bùng Phát — Cao Thủ Suy Yếu!`); weeFlash('plague'); },
    onEnd(st)  { weeLog(`✨ Tà độc được tẩy trừ — giới tu luyện hồi phục.`); },
  },
  spirit_rot: {
    id:'spirit_rot', cat:'plague', rarity:'rare', duration:25, cooldown:90,
    icon:'☠️', name:'Linh Lực Ô Nhiễm',
    desc:'Nguồn linh lực thiên địa bị ô nhiễm bởi một thế lực ẩn — tu luyện cực kỳ khó khăn.',
    flavor:'"Khi linh khí hóa độc, ai còn dám hít thở?"',
    effects: { cultivationMult:0.3 },
    onStart(st){ weeLog(`☠️ Linh Lực Ô Nhiễm — Tu Luyện Gần Như Dừng Lại!`); weeFlash('plague'); },
    onEnd(st)  { weeLog(`🌿 Linh lực được tịnh hóa — thiên địa trong sáng trở lại.`); },
  },
  great_famine: {
    id:'great_famine', cat:'plague', rarity:'common', duration:30, cooldown:60,
    icon:'🌵', name:'Đại Hạn Hán Khắc Nghiệt',
    desc:'Trời không mưa, đất nứt toác — mùa màng thất bát, dân chúng đói khổ.',
    flavor:'"Ba năm không mưa, vạn người không cơm — đất thiếu nước, dân thiếu đường sống."',
    effects: { birthMult:0.5, econMult:0.5, warMult:1.2 },
    onStart(st){ weeLog(`🌵 Đại Hạn Hán — Mùa Màng Thất Bát, Dân Đói Khổ!`); },
    onEnd(st)  { weeLog(`🌧️ Mưa xuống — đất đai hồi sinh.`); },
  },
  madness_curse: {
    id:'madness_curse', cat:'plague', rarity:'epic', duration:20, cooldown:100,
    icon:'🌪️', name:'Tâm Ma Tán Loạn',
    desc:'Tâm ma xâm nhập tư duy mọi người — xung đột nổ ra khắp nơi vô cớ.',
    flavor:'"Khi lý trí tan vỡ, chỉ còn bạo lực và hỗn loạn."',
    effects: { warMult:2.5, cultureMult:0.5, cultivationMult:0.6 },
    onStart(st){ weeLog(`🌪️ Tâm Ma Tán Loạn — Xung Đột Bùng Phát Khắp Nơi!`); weeFlash('plague'); },
    onEnd(st)  { weeLog(`🕊️ Tâm ma bị tẩy trừ — mọi người tỉnh lại.`); },
  },

  // ── PROPHECY / DISCOVERY ───────────────────────────────────
  ancient_codex: {
    id:'ancient_codex', cat:'prophecy', rarity:'epic', duration:0, cooldown:90,
    icon:'📖', name:'Thiên Thư Xuất Thế',
    desc:'Một cuốn thiên thư cổ đại rơi xuống từ trời — chứa đựng kiến thức của muôn vạn thế hệ.',
    flavor:'"Sách trời mở, vạn pháp rõ — người người được soi đường."',
    effects: {},
    onStart(st){
      weeLog(`📖 Thiên Thư Xuất Thế — Kiến Thức Cổ Đại Được Truyền Bá!`);
      weeFlash('prophecy');
      _weeBoostRandom('tech', 30, 50);
      _weeBoostRandom('culture', 20, 35);
    },
    onEnd(st){},
  },
  divine_oracle: {
    id:'divine_oracle', cat:'prophecy', rarity:'legendary', duration:50, cooldown:130,
    icon:'🔮', name:'Thần Sấm Phán Truyền',
    desc:'Thần linh hiển linh phán sấm — một lời tiên tri định hướng thiên hạ cả trăm năm.',
    flavor:'"Thần ngôn chưa dứt, vạn người đã quỳ — ai dám cãi trời?"',
    effects: { cultureMult:1.6, cultivationMult:1.3 },
    onStart(st){ weeLog(`🔮 Thần Sấm Phán Truyền — Lời Tiên Tri Chấn Động Thiên Hạ!`); weeFlash('prophecy'); },
    onEnd(st)  { weeLog(`🔮 Lời thần sấm hoàn thành sứ mệnh.`); },
  },
  lost_technique: {
    id:'lost_technique', cat:'prophecy', rarity:'legendary', duration:0, cooldown:150,
    icon:'🌟', name:'Thất Truyền Công Pháp Tái Hiện',
    desc:'Một công pháp đã thất truyền ngàn năm đột ngột xuất hiện — mọi tu sĩ đều cảm nhận được.',
    flavor:'"Pháp tổ tái lâm, thiên hạ sôi sục — ai lĩnh hội được, bá đạo trong tầm tay."',
    effects: {},
    onStart(st){
      weeLog(`🌟 Thất Truyền Công Pháp Tái Hiện — Tu Luyện Đột Phá Toàn Cầu!`);
      weeFlash('prophecy');
      _weeBoostRandom('cultivation', 40, 80);
    },
    onEnd(st){},
  },
  golden_art: {
    id:'golden_art', cat:'prophecy', rarity:'rare', duration:40, cooldown:80,
    icon:'🎨', name:'Nghệ Thuật Hoàng Kim',
    desc:'Một làn sóng sáng tạo nghệ thuật bùng nổ khắp thiên hạ — văn hóa thăng hoa.',
    flavor:'"Khi kiếm gươm gác xuống, ngọn bút lên ngôi — văn minh rực sáng."',
    effects: { cultureMult:2.0, econMult:1.2 },
    onStart(st){ weeLog(`🎨 Nghệ Thuật Hoàng Kim — Văn Hóa Toàn Thiên Hạ Thăng Hoa!`); },
    onEnd(st)  { weeLog(`🖼️ Làn sóng nghệ thuật lắng xuống — di sản lưu lại muôn đời.`); },
  },
  trade_boom: {
    id:'trade_boom', cat:'prophecy', rarity:'common', duration:35, cooldown:50,
    icon:'💰', name:'Thương Đạo Hưng Thịnh',
    desc:'Thương mại toàn thế giới bùng nổ — hàng hóa chạy khắp tứ phương, ai cũng giàu.',
    flavor:'"Tiền bạc chảy như nước — người khôn nắm luồng, kẻ dại chỉ nhìn."',
    effects: { econMult:1.8, cultureMult:1.2 },
    onStart(st){ weeLog(`💰 Thương Đạo Hưng Thịnh — Kinh Tế Bùng Nổ Toàn Cầu!`); },
    onEnd(st)  { weeLog(`💰 Thị trường ổn định — kinh tế trở về mức bình thường.`); },
  },

  // ── POLITICAL ──────────────────────────────────────────────
  grand_alliance: {
    id:'grand_alliance', cat:'political', rarity:'epic', duration:40, cooldown:100,
    icon:'🤝', name:'Thiên Hạ Đại Liên Minh',
    desc:'Các thế lực lớn bất ngờ liên minh chống lại một mối đe dọa chung — thế giới tạm hòa bình.',
    flavor:'"Khi kẻ thù chung xuất hiện, cựu thù trở thành chiến hữu."',
    effects: { warMult:0.3, econMult:1.4, cultureMult:1.2 },
    onStart(st){ weeLog(`🤝 Thiên Hạ Đại Liên Minh Hình Thành — Hòa Bình Tạm Thời!`); weeFlash('political'); },
    onEnd(st)  { weeLog(`⚔️ Liên minh tan vỡ — các thế lực lại tranh giành.`); },
  },
  assassination_wave: {
    id:'assassination_wave', cat:'political', rarity:'epic', duration:0, cooldown:90,
    icon:'🗡️', name:'Ám Sát Phong Trào',
    desc:'Một làn sóng ám sát bí ẩn quét qua thiên hạ — nhiều lãnh đạo chết bất ngờ.',
    flavor:'"Trong bóng tối, dao kề cổ — quyền lực thay tay chỉ trong một đêm."',
    effects: {},
    onStart(st){
      weeLog(`🗡️ Ám Sát Phong Trào — Lãnh Đạo Các Thế Lực Bị Đe Dọa!`);
      weeFlash('political');
      _weeKillLeaders(0.2);
    },
    onEnd(st){},
  },
  rebel_tide: {
    id:'rebel_tide', cat:'political', rarity:'common', duration:25, cooldown:55,
    icon:'✊', name:'Khởi Nghĩa Dâng Trào',
    desc:'Dân chúng nổi dậy khắp nơi — các nước yếu bị lung lay, trật tự đảo lộn.',
    flavor:'"Khi bất công chất chồng, tức giận của dân là lửa thiêu trời."',
    effects: { warMult:1.7, econMult:0.7, birthMult:0.8 },
    onStart(st){ weeLog(`✊ Khởi Nghĩa Dâng Trào — Loạn Lạc Khắp Thiên Hạ!`); },
    onEnd(st)  { weeLog(`🕊️ Khởi nghĩa được dẹp yên — trật tự tạm phục hồi.`); },
  },
  hegemon_challenge: {
    id:'hegemon_challenge', cat:'political', rarity:'legendary', duration:50, cooldown:140,
    icon:'👑', name:'Bá Quyền Thách Thức',
    desc:'Các thế lực yếu hơn liên kết thách thức bá chủ — cuộc đối đầu định hình lại bản đồ thiên hạ.',
    flavor:'"Một bá chủ không thể tồn tại mãi — ngày nào đó, tất cả sẽ cùng nhau lật đổ."',
    effects: { warMult:2.2, cultivationMult:1.3 },
    onStart(st){ weeLog(`👑 BÁ QUYỀN THÁCH THỨC — Chiến Tranh Định Mệnh Bắt Đầu!`); weeFlash('political'); },
    onEnd(st)  { weeLog(`🏆 Thách thức kết thúc — bá quyền được định đoạt.`); },
  },
  peace_summit: {
    id:'peace_summit', cat:'political', rarity:'rare', duration:30, cooldown:70,
    icon:'🕊️', name:'Thiên Hạ Hội Nghị Hòa Bình',
    desc:'Các đại thế lực ngồi lại đàm phán — chiến tranh tạm dừng, ngoại giao thống trị.',
    flavor:'"Bàn tròn thay chiến trường — lời nói sắc bén hơn gươm đao."',
    effects: { warMult:0.1, econMult:1.3, cultureMult:1.4 },
    onStart(st){ weeLog(`🕊️ Thiên Hạ Hội Nghị Hòa Bình — Chiến Tranh Tạm Dừng!`); },
    onEnd(st)  { weeLog(`📜 Hội nghị kết thúc — tờ hiệp ước ký xong.`); },
  },

  // ── PROSPERITY ─────────────────────────────────────────────
  cultural_renaissance: {
    id:'cultural_renaissance', cat:'prosperity', rarity:'epic', duration:50, cooldown:110,
    icon:'🌺', name:'Văn Hóa Phục Hưng Đại Thời Đại',
    desc:'Một thời đại phục hưng văn hóa bùng nổ — nghệ thuật, khoa học, và triết học đều thăng hoa.',
    flavor:'"Thiên hạ mặc dù loạn, nhưng văn minh không bao giờ tắt."',
    effects: { cultureMult:2.5, econMult:1.3, cultivationMult:1.2 },
    onStart(st){
      weeLog(`🌺 Văn Hóa Phục Hưng Đại Thời Đại — Văn Minh Rực Sáng!`);
      weeFlash('prosperity');
      if (typeof chTick === 'function') { _weeBoostRandom('culture', 25, 40); }
    },
    onEnd(st){ weeLog(`🌿 Thời đại phục hưng khép lại, để lại di sản vĩ đại.`); },
  },
  spiritual_spring: {
    id:'spiritual_spring', cat:'prosperity', rarity:'rare', duration:30, cooldown:65,
    icon:'🌱', name:'Thiên Xuân Giáng Thế',
    desc:'Mùa xuân thiên địa đến — vạn vật sinh sôi, tu sĩ đột phá dễ hơn, dân số tăng vọt.',
    flavor:'"Xuân đến vạn hoa nở — đất trời hào phóng, ban phát ân huệ."',
    effects: { cultivationMult:1.5, birthMult:2.0, econMult:1.3 },
    onStart(st){ weeLog(`🌱 Thiên Xuân Giáng Thế — Vạn Vật Sinh Trưởng!`); },
    onEnd(st)  { weeLog(`🍂 Thiên xuân qua đi — thu đến, vàng lá.`); },
  },
  hero_age: {
    id:'hero_age', cat:'prosperity', rarity:'legendary', duration:60, cooldown:160,
    icon:'⚡', name:'Anh Hùng Xuất Thế Đại Thời',
    desc:'Thiên hạ xuất hiện hàng loạt nhân tài kiệt xuất — thời đại anh hùng thực sự bắt đầu.',
    flavor:'"Loạn thế xuất anh hùng — khi thử thách lớn nhất đến, người vĩ đại cũng xuất hiện."',
    effects: { cultivationMult:1.8, birthMult:1.6, warMult:1.3 },
    onStart(st){
      weeLog(`⚡ ANH HÙNG XUẤT THẾ ĐẠI THỜI — Nhân Tài Kiệt Xuất Đồng Loạt Xuất Hiện!`);
      weeFlash('prosperity');
      _weeSpawnHeroes(3, 5);
    },
    onEnd(st){ weeLog(`📜 Thời đại anh hùng kết thúc — tên tuổi họ được ghi vào sử sách.`); },
  },
  world_peace: {
    id:'world_peace', cat:'prosperity', rarity:'mythic', duration:70, cooldown:200,
    icon:'☮️', name:'Thái Bình Thịnh Thế',
    desc:'Toàn thiên hạ bước vào kỳ thịnh trị hiếm có — không chiến tranh, chỉ phát triển.',
    flavor:'"Khi gươm đao im tiếng, lời ca và tiếng cười mới được nghe."',
    effects: { warMult:0.0, econMult:2.0, cultureMult:2.0, birthMult:1.8, cultivationMult:1.5 },
    onStart(st){ weeLog(`☮️ THÁI BÌNH THỊNH THẾ — Thiên Hạ Bước Vào Kỷ Nguyên Vàng Son!`); weeFlash('prosperity'); },
    onEnd(st)  { weeLog(`⚔️ Thái bình kết thúc — chiến trống lại vang lên.`); },
  },
  grand_tournament: {
    id:'grand_tournament', cat:'prosperity', rarity:'epic', duration:0, cooldown:85,
    icon:'🏆', name:'Thiên Hạ Võ Đài Đại Hội',
    desc:'Một cuộc thi đấu toàn thiên hạ được tổ chức — thế lực chiến thắng nhận danh hiệu bá chủ.',
    flavor:'"Một đấu trường, vạn người tranh — kẻ thắng lấy danh, kẻ thua rút lui trong tủi nhục."',
    effects: {},
    onStart(st){
      weeLog(`🏆 Thiên Hạ Võ Đài Đại Hội — Cuộc Thi Định Bá Chủ Bắt Đầu!`);
      weeFlash('prosperity');
      _weeTournament();
    },
    onEnd(st){},
  },
};

// ─── STATE ────────────────────────────────────────────────────

let weeState = {
  activeEvents:   [],    // { id, eventId, startTick, endTick, ticksLeft }
  eventHistory:   [],    // { eventId, name, icon, startTick, endTick, outcome }
  cooldowns:      {},    // eventId → ticksLeft
  tickCount:      0,
  autoEnabled:    true,
  autoInterval:   15,    // ticks between auto-event checks
  lastAutoTick:   0,
  currentMults:   {},    // aggregated multipliers from all active events
};

// ─── SAVE / LOAD ──────────────────────────────────────────────

(function weePatcchSaveLoad() {
  function tryPatch() {
    const _orig = window.save;
    if (typeof _orig === 'function' && !window._weeSavePatched) {
      window._weeSavePatched = true;
      window.save = function() {
        _orig.apply(this, arguments);
        try { localStorage.setItem('cgv6_weeState', JSON.stringify({
          activeEvents: weeState.activeEvents,
          eventHistory: (weeState.eventHistory||[]).slice(0,200),
          cooldowns:    weeState.cooldowns,
          tickCount:    weeState.tickCount,
          autoEnabled:  weeState.autoEnabled,
          lastAutoTick: weeState.lastAutoTick,
        })); } catch(e) {}
      };
    }
    const _origL = window.load;
    if (typeof _origL === 'function' && !window._weeLoadPatched) {
      window._weeLoadPatched = true;
      window.load = function() {
        _origL.apply(this, arguments);
        try {
          const raw = localStorage.getItem('cgv6_weeState');
          if (raw) { const d = JSON.parse(raw); Object.assign(weeState, d); }
          _weeRecomputeMults();
        } catch(e) {}
      };
    }
  }
  tryPatch();
  document.addEventListener('DOMContentLoaded', function() { setTimeout(tryPatch, 1000); });
})();

// ─── CORE LOGIC ───────────────────────────────────────────────

function weeTriggerEvent(eventId, forced) {
  const def = WEE_EVENTS[eventId];
  if (!def) return { ok:false, msg:'Sự kiện không tồn tại' };
  if (!forced && weeState.cooldowns[eventId] > 0)
    return { ok:false, msg:`Cần ${weeState.cooldowns[eventId]} tích tắc nữa` };
  const already = weeState.activeEvents.find(e => e.eventId === eventId);
  if (already) return { ok:false, msg:'Sự kiện đang diễn ra' };

  const entry = { id: `we_${Date.now()}`, eventId, startTick: weeState.tickCount, ticksLeft: def.duration, endTick: weeState.tickCount + def.duration };
  weeState.activeEvents.push(entry);
  weeState.cooldowns[eventId] = def.cooldown;
  try { def.onStart(weeState); } catch(e) {}
  _weeRecomputeMults();
  if (def.duration === 0) { _weeEndEvent(entry); }
  if (typeof weeRenderPanel === 'function' && document.getElementById('panel-world-event')?.classList.contains('active')) weeRenderPanel();
  return { ok:true, entry };
}

function _weeEndEvent(entry) {
  const def = WEE_EVENTS[entry.eventId];
  try { if (def) def.onEnd(weeState); } catch(e) {}
  weeState.activeEvents = weeState.activeEvents.filter(e => e.id !== entry.id);
  weeState.eventHistory.unshift({ eventId: entry.eventId, name: def?.name||'?', icon: def?.icon||'❓', cat: def?.cat||'?', rarity: def?.rarity||'common', startTick: entry.startTick, endTick: weeState.tickCount });
  if (weeState.eventHistory.length > 200) weeState.eventHistory.pop();
  _weeRecomputeMults();
}

function _weeRecomputeMults() {
  const mults = { cultivationMult:1, warMult:1, econMult:1, cultureMult:1, birthMult:1, spawnMult:1 };
  for (const entry of weeState.activeEvents) {
    const def = WEE_EVENTS[entry.eventId];
    if (!def?.effects) continue;
    for (const [k, v] of Object.entries(def.effects)) { if (mults[k] !== undefined) mults[k] *= v; }
  }
  weeState.currentMults = mults;
}

function weeTick() {
  weeState.tickCount++;
  // Countdown cooldowns
  for (const id in weeState.cooldowns) { if (weeState.cooldowns[id] > 0) weeState.cooldowns[id]--; }
  // Tick active events
  for (const entry of [...weeState.activeEvents]) {
    if (entry.ticksLeft > 0) {
      entry.ticksLeft--;
      if (entry.ticksLeft <= 0) _weeEndEvent(entry);
    }
  }
  // Auto-trigger
  if (weeState.autoEnabled && (weeState.tickCount - weeState.lastAutoTick) >= weeState.autoInterval) {
    weeState.lastAutoTick = weeState.tickCount;
    _weeAutoTrigger();
  }
  _weeRecomputeMults();
}

function _weeAutoTrigger() {
  if (weeState.activeEvents.length >= 3) return;
  const available = Object.values(WEE_EVENTS).filter(def =>
    !weeState.cooldowns[def.id] || weeState.cooldowns[def.id] <= 0 &&
    !weeState.activeEvents.find(e => e.eventId === def.id)
  );
  if (!available.length) return;
  const totalWeight = available.reduce((s,d) => s + (WEE_RARITY[d.rarity]?.weight||10), 0);
  let roll = Math.random() * totalWeight;
  // 40% chance to actually trigger anything on an auto-check
  if (Math.random() > 0.40) return;
  for (const def of available) {
    roll -= WEE_RARITY[def.rarity]?.weight || 10;
    if (roll <= 0) { weeTriggerEvent(def.id, false); break; }
  }
}

// ─── INTEGRATION HELPERS ──────────────────────────────────────

function weeLog(msg) {
  if (typeof addLog === 'function') addLog(`[Thiên Hạ Đại Sự] ${msg}`);
  if (typeof htAddEvent === 'function') htAddEvent(msg, 'event');
}

function weeFlash(cat) {
  const colors = { celestial:'#818cf8', earth:'#34d399', plague:'#f87171', prophecy:'#fbbf24', political:'#f97316', prosperity:'#e879f9' };
  const c = colors[cat] || '#ffffff';
  const flash = document.createElement('div');
  flash.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:${c};opacity:0.18;z-index:9999;pointer-events:none;transition:opacity 1.2s;`;
  document.body.appendChild(flash);
  setTimeout(() => { flash.style.opacity = '0'; setTimeout(() => flash.remove(), 1200); }, 100);
}

function _weeBoostRandom(type, min, max) {
  const val = min + Math.random() * (max - min);
  if (type === 'tech' && Array.isArray(window.countries)) {
    const c = window.countries[Math.floor(Math.random() * window.countries.length)];
    if (c) { c.techLevel = (c.techLevel || 0) + val; weeLog(`📈 ${c.name || 'Một thế lực'} nhận +${Math.round(val)} công nghệ từ sự kiện`); }
  } else if (type === 'culture') {
    if (typeof window.chSpreadCulture === 'function' && Array.isArray(window.countries)) {
      const c = window.countries[Math.floor(Math.random() * window.countries.length)];
      if (c?.name) weeLog(`🎨 Văn hóa ${c.name} được tăng cường bởi sự kiện thế giới`);
    }
  } else if (type === 'cultivation') {
    if (Array.isArray(window.npcs)) {
      const lucky = window.npcs.filter(n => n.status === 'alive').slice(0, Math.floor(3 + Math.random()*5));
      lucky.forEach(n => { if (n.cultivation !== undefined) n.cultivation = (n.cultivation||0) + val * 0.5; });
      if (lucky.length) weeLog(`✨ ${lucky.length} tu sĩ nhận được linh khí đột phá từ sự kiện`);
    }
  }
}

function _weeDamageRandom(minPct, maxPct) {
  const pct = minPct + Math.random() * (maxPct - minPct);
  if (Array.isArray(window.countries)) {
    window.countries.forEach(c => {
      if (c.population) c.population = Math.max(1, Math.floor(c.population * (1 - pct * Math.random())));
    });
    weeLog(`💀 Dân số các thế lực sụt giảm ${Math.round(pct*100)}% do sự kiện`);
  }
}

function _weeShiftPop() {
  if (!Array.isArray(window.countries) || window.countries.length < 2) return;
  const from = window.countries[Math.floor(Math.random() * window.countries.length)];
  const to   = window.countries[Math.floor(Math.random() * window.countries.length)];
  if (from === to || !from.population) return;
  const shift = Math.floor(from.population * (0.05 + Math.random() * 0.15));
  from.population = Math.max(1, from.population - shift);
  to.population   = (to.population || 0) + shift;
  weeLog(`🚶 ${shift} người di cư từ ${from.name||'?'} sang ${to.name||'?'}`);
}

function _weeKillLeaders(chance) {
  if (!Array.isArray(window.npcs)) return;
  const leaders = window.npcs.filter(n => n.status === 'alive' && (n.isKing || n.isLeader || n.role === 'king' || n.role === 'leader'));
  leaders.forEach(n => {
    if (Math.random() < chance) {
      n.status = 'dead'; n.deathCause = 'assassination_wave';
      weeLog(`🗡️ ${n.name||'Lãnh đạo'} bị ám sát trong làn sóng ám sát thiên hạ`);
    }
  });
}

function _weeSpawnHeroes(minN, maxN) {
  const n = minN + Math.floor(Math.random() * (maxN - minN + 1));
  if (typeof window.chBornIcon === 'function' && Array.isArray(window.countries)) {
    let spawned = 0;
    for (let i = 0; i < n && spawned < n; i++) {
      const c = window.countries[Math.floor(Math.random() * window.countries.length)];
      if (c?.name) { window.chBornIcon(c.name); spawned++; }
    }
    if (spawned) weeLog(`⚡ ${spawned} Vĩ Nhân mới xuất hiện trong Anh Hùng Thời Đại`);
  }
}

function _weeTournament() {
  if (!Array.isArray(window.countries) || !window.countries.length) {
    weeLog(`🏆 Thiên Hạ Võ Đài — Chưa có thế lực nào tranh tài`);
    return;
  }
  const scores = window.countries.map(c => ({
    c, score: (c.population||0)*0.3 + (c.army||0)*0.5 + (c.techLevel||0)*0.2 + Math.random()*200
  })).sort((a,b) => b.score - a.score);
  const winner = scores[0]?.c;
  if (winner) {
    if (winner.prestige !== undefined) winner.prestige = (winner.prestige||0) + 500;
    weeLog(`🏆 ${winner.name||'Thế lực vô danh'} giành chiến thắng Thiên Hạ Võ Đài — Bá Chủ Thiên Hạ!`);
  }
}

// ─── RENDER ───────────────────────────────────────────────────

let _weeTab = 'active';
function weeSwitchTab(t) { _weeTab = t; weeRenderPanel(); }

function weeRenderPanel() {
  const el = document.getElementById('panel-world-event');
  if (!el) return;
  const activeCount = weeState.activeEvents.length;
  const histCount   = weeState.eventHistory.length;

  const tabs = [
    { id:'active',   label:`🌊 Đang Diễn Ra (${activeCount})` },
    { id:'history',  label:`📜 Lịch Sử (${histCount})` },
    { id:'trigger',  label:`⚡ Kích Hoạt` },
    { id:'effects',  label:`📊 Hiệu Ứng` },
  ];

  el.innerHTML = `
    <div style="padding:12px 16px;background:linear-gradient(135deg,#0f172a,#1e1b4b,#0f172a);min-height:100%;font-family:'Segoe UI',sans-serif;color:#e2e8f0;">
      <h2 style="margin:0 0 4px;font-size:20px;color:#a78bfa;text-shadow:0 0 12px #818cf8;">🌌 Thiên Hạ Đại Sự</h2>
      <p style="margin:0 0 12px;font-size:12px;color:#7c3aed;font-style:italic;">World Event Engine V1 — Biến cố định hình lịch sử thiên hạ</p>

      <!-- TABS -->
      <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;">
        ${tabs.map(t => `<button onclick="weeSwitchTab('${t.id}')" style="padding:6px 12px;border-radius:8px;border:none;cursor:pointer;font-size:12px;font-weight:600;background:${_weeTab===t.id?'#4c1d95':'#1e1b4b'};color:${_weeTab===t.id?'#e9d5ff':'#94a3b8'};border:1px solid ${_weeTab===t.id?'#7c3aed':'#374151'};">${t.label}</button>`).join('')}
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#94a3b8;margin-left:auto;cursor:pointer;">
          <input type="checkbox" id="wee-auto" ${weeState.autoEnabled?'checked':''} onchange="weeState.autoEnabled=this.checked;window.weeState=weeState;">
          AI tự động
        </label>
      </div>

      <!-- CONTENT -->
      ${_weeTab === 'active'   ? _weeRenderActive()   : ''}
      ${_weeTab === 'history'  ? _weeRenderHistory()  : ''}
      ${_weeTab === 'trigger'  ? _weeRenderTrigger()  : ''}
      ${_weeTab === 'effects'  ? _weeRenderEffects()  : ''}
    </div>`;
}

function _weeRenderActive() {
  if (!weeState.activeEvents.length) return `
    <div style="text-align:center;padding:40px 20px;color:#6b7280;">
      <div style="font-size:48px;margin-bottom:12px;">🌤️</div>
      <div style="font-size:15px;">Thiên hạ đang yên bình...</div>
      <div style="font-size:12px;margin-top:4px;">Chưa có biến cố nào đang diễn ra</div>
    </div>`;

  return weeState.activeEvents.map(entry => {
    const def = WEE_EVENTS[entry.eventId] || {};
    const cat = WEE_CATEGORIES[def.cat] || WEE_CATEGORIES.celestial;
    const rar = WEE_RARITY[def.rarity] || WEE_RARITY.common;
    const total = def.duration || 1;
    const pct = total > 0 ? Math.round((1 - entry.ticksLeft / total) * 100) : 100;

    return `
      <div style="background:${cat.bg};border:1px solid ${cat.color}44;border-radius:12px;padding:14px;margin-bottom:12px;box-shadow:0 0 16px ${cat.color}22;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
          <div>
            <span style="font-size:22px;">${def.icon||'❓'}</span>
            <span style="font-size:15px;font-weight:700;color:${cat.color};margin-left:8px;">${def.name||entry.eventId}</span>
          </div>
          <div>
            <span style="font-size:10px;padding:2px 8px;border-radius:20px;background:${rar.color}33;color:${rar.color};border:1px solid ${rar.color}66;">${rar.label}</span>
            <span style="font-size:10px;padding:2px 8px;border-radius:20px;background:${cat.color}22;color:${cat.color};border:1px solid ${cat.color}44;margin-left:4px;">${cat.icon} ${cat.name}</span>
          </div>
        </div>
        <p style="font-size:12px;color:#cbd5e1;margin:0 0 10px;line-height:1.5;">${def.desc||''}</p>
        <p style="font-size:11px;color:${cat.color};font-style:italic;margin:0 0 10px;">${def.flavor||''}</p>
        ${def.duration > 0 ? `
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#9ca3af;margin-bottom:4px;">
            <span>Tiến độ</span>
            <span>${entry.ticksLeft > 0 ? `Còn ${entry.ticksLeft} tích tắc` : 'Kết thúc'}</span>
          </div>
          <div style="height:6px;background:#1f2937;border-radius:4px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,${cat.color}88,${cat.color});border-radius:4px;transition:width 0.3s;"></div>
          </div>
        ` : ''}
        ${def.effects && Object.keys(def.effects).length ? `
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">
            ${Object.entries(def.effects).map(([k,v]) => {
              const label = { cultivationMult:'Tu Luyện', warMult:'Chiến Tranh', econMult:'Kinh Tế', cultureMult:'Văn Hóa', birthMult:'Sinh Sản', spawnMult:'Quái Vật' }[k]||k;
              const positive = v > 1;
              return `<span style="font-size:10px;padding:2px 8px;border-radius:20px;background:${positive?'#14532d':'#450a0a'};color:${positive?'#4ade80':'#f87171'};border:1px solid ${positive?'#166534':'#7f1d1d'};">${label}: ×${v}</span>`;
            }).join('')}
          </div>
        ` : ''}
      </div>`;
  }).join('');
}

function _weeRenderHistory() {
  if (!weeState.eventHistory.length) return `<div style="text-align:center;padding:40px;color:#6b7280;">Chưa có sự kiện nào trong lịch sử.</div>`;
  return `<div style="max-height:500px;overflow-y:auto;">
    ${weeState.eventHistory.slice(0, 50).map(h => {
      const cat = WEE_CATEGORIES[h.cat] || WEE_CATEGORIES.celestial;
      const rar = WEE_RARITY[h.rarity] || WEE_RARITY.common;
      return `<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#0f172a;border-left:3px solid ${cat.color};border-radius:8px;margin-bottom:6px;">
        <span style="font-size:20px;">${h.icon}</span>
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:600;color:${cat.color};">${h.name}</div>
          <div style="font-size:11px;color:#6b7280;">Tích tắc ${h.startTick}–${h.endTick} · <span style="color:${rar.color};">${rar.label}</span> · ${cat.icon} ${cat.name}</div>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function _weeRenderTrigger() {
  const cats = Object.keys(WEE_CATEGORIES);
  return `
    <div>
      <div style="font-size:12px;color:#94a3b8;margin-bottom:10px;">🔱 Với tư cách Đấng Tạo Hóa, ngươi có thể cưỡng chế kích hoạt bất kỳ biến cố nào.</div>
      ${cats.map(catId => {
        const catDef = WEE_CATEGORIES[catId];
        const events = Object.values(WEE_EVENTS).filter(e => e.cat === catId);
        return `
          <div style="margin-bottom:14px;">
            <div style="font-size:13px;font-weight:700;color:${catDef.color};margin-bottom:8px;border-bottom:1px solid ${catDef.color}33;padding-bottom:4px;">${catDef.icon} ${catDef.name}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              ${events.map(def => {
                const rar = WEE_RARITY[def.rarity]||WEE_RARITY.common;
                const cd = weeState.cooldowns[def.id] || 0;
                const active = weeState.activeEvents.find(e => e.eventId === def.id);
                const disabled = active || (cd > 0 && false); // always allow force
                return `
                  <div style="background:${catDef.bg};border:1px solid ${catDef.color}33;border-radius:8px;padding:10px;display:flex;flex-direction:column;gap:6px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-size:13px;font-weight:600;color:${catDef.color};">${def.icon} ${def.name}</span>
                      <span style="font-size:10px;color:${rar.color};">${rar.label}</span>
                    </div>
                    <div style="font-size:11px;color:#9ca3af;line-height:1.4;">${def.desc}</div>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;">
                      <span style="font-size:10px;color:#6b7280;">${active ? '🟢 Đang diễn ra' : cd > 0 ? `⏳ CD: ${cd}` : '✅ Sẵn sàng'}</span>
                      <button onclick="weeActionTrigger('${def.id}',true)" style="padding:4px 10px;border-radius:6px;border:none;cursor:pointer;font-size:11px;font-weight:600;background:${active?'#374151':catDef.color+'bb'};color:${active?'#6b7280':'#fff'};">${active ? 'Đang xảy ra' : 'Kích Hoạt'}</button>
                    </div>
                  </div>`;
              }).join('')}
            </div>
          </div>`;
      }).join('')}
    </div>`;
}

function _weeRenderEffects() {
  const mults = weeState.currentMults;
  const keys = [
    { k:'cultivationMult', label:'Tu Luyện Tốc Độ',   icon:'⚗️' },
    { k:'warMult',         label:'Chiến Tranh',         icon:'⚔️' },
    { k:'econMult',        label:'Kinh Tế',             icon:'💰' },
    { k:'cultureMult',     label:'Văn Hóa',             icon:'🎨' },
    { k:'birthMult',       label:'Sinh Sản',            icon:'👶' },
    { k:'spawnMult',       label:'Quái Vật Xuất Hiện',  icon:'👹' },
  ];
  const hasActive = weeState.activeEvents.length > 0;

  return `
    <div>
      <div style="font-size:12px;color:#94a3b8;margin-bottom:12px;">Hiệu ứng tổng hợp từ tất cả sự kiện đang diễn ra.</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
        ${keys.map(({k, label, icon}) => {
          const v = mults[k] ?? 1;
          const diff = v - 1;
          const color = diff > 0.05 ? '#4ade80' : diff < -0.05 ? '#f87171' : '#94a3b8';
          const bar = Math.min(Math.max(v, 0), 3) / 3 * 100;
          return `
            <div style="background:#0f172a;border:1px solid #1f2937;border-radius:10px;padding:12px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <span style="font-size:12px;color:#94a3b8;">${icon} ${label}</span>
                <span style="font-size:15px;font-weight:700;color:${color};">×${v.toFixed(2)}</span>
              </div>
              <div style="height:5px;background:#1f2937;border-radius:4px;overflow:hidden;">
                <div style="height:100%;width:${bar}%;background:${color};border-radius:4px;"></div>
              </div>
            </div>`;
        }).join('')}
      </div>
      ${!hasActive ? '<div style="text-align:center;font-size:12px;color:#6b7280;padding:12px;">Không có sự kiện nào đang hoạt động — tất cả nhân tố ở mức bình thường (×1.00).</div>' : ''}
      <div style="font-size:12px;color:#7c3aed;font-style:italic;margin-top:8px;border-top:1px solid #1f2937;padding-top:8px;">💡 Những hệ số này ảnh hưởng trực tiếp đến tất cả tính toán trong game khi các engine khác gọi <code>weeGetMults()</code>.</div>
    </div>`;
}

// ─── PUBLIC API ───────────────────────────────────────────────

function weeGetMults() { return { ...weeState.currentMults }; }
function weeGetActiveEvents() { return [...weeState.activeEvents]; }

window.weeActionTrigger = function(eventId, forced) {
  const r = weeTriggerEvent(eventId, !!forced);
  if (!r.ok && typeof addLog === 'function') addLog(`[Thiên Hạ Đại Sự] ⚠️ ${r.msg}`);
  setTimeout(weeRenderPanel, 100);
};

window.weeSwitchTab    = weeSwitchTab;
window.weeRenderPanel  = weeRenderPanel;
window.weeTick         = weeTick;
window.weeGetMults     = weeGetMults;
window.weeGetActiveEvents = weeGetActiveEvents;
window.weeState        = weeState;
window.WEE_EVENTS      = WEE_EVENTS;

// ─── HOOK INTO MAIN TICK ──────────────────────────────────────

(function weeHookTick() {
  function tryHook() {
    const _orig = window.advanceTime || window.onYearTick || null;
    // Try to patch the global year-tick if it exists
    if (typeof window.advanceTime === 'function' && !window._weeTickHooked) {
      window._weeTickHooked = true;
      const _oa = window.advanceTime;
      window.advanceTime = function() {
        _oa.apply(this, arguments);
        try { weeTick(); } catch(e) {}
      };
      return;
    }
  }
  // Fallback: run on its own 4s interval (≈ 1 tick per 4 seconds of real time)
  tryHook();
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(tryHook, 2000);
    setInterval(() => { try { weeTick(); } catch(e){} }, 4000);
  });
})();

// ─── SELF-INJECT UI ───────────────────────────────────────────

(function weeInjectUI() {
  function inject() {
    // Nav button
    if (!document.getElementById('btn-world-event')) {
      const nav = document.querySelector('.nav-buttons') || document.querySelector('nav') || document.querySelector('.sidebar');
      if (nav) {
        const btn = document.createElement('button');
        btn.id = 'btn-world-event';
        btn.className = 'nav-btn ec-hidden';
        btn.setAttribute('data-panel', 'world-event');
        btn.style.display = 'none';
        btn.onclick = function() {
          if (typeof showPanel === 'function') showPanel('world-event');
          weeRenderPanel();
        };
        btn.textContent = '🌌 Thiên Hạ Đại Sự';
        nav.appendChild(btn);
      }
    }
    // Panel div
    if (!document.getElementById('panel-world-event')) {
      const container = document.getElementById('panel-culture-heritage')?.parentNode
                     || document.querySelector('.panels-container')
                     || document.querySelector('main')
                     || document.body;
      const div = document.createElement('div');
      div.id = 'panel-world-event';
      div.className = 'panel';
      container.appendChild(div);
    }
    // Show nav button if world has started
    const btn = document.getElementById('btn-world-event');
    if (btn) {
      btn.style.display = '';
      btn.classList.remove('ec-hidden');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(inject, 500));
  else setTimeout(inject, 500);
})();

console.log('[WorldEventEngine V1] 🌌 Thiên Hạ Đại Sự khởi động — 30 biến cố · 6 loại · AI tự động sẵn sàng.');
