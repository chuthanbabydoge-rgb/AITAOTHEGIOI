'use strict';
/* ============================================================
   CONTINENT ENGINE V2 — Creator God V6
   Đại Lục Hệ Thống V2 — 6 Đại Lục · Ngoại Giao · Liên Minh
   Thương Mại · Chiến Tranh Nhiều Vòng · Thần Can Thiệp
   Thảm Họa · Xếp Hạng Cường Quốc · Di Dân · Khám Phá
   ============================================================ */

// ─── CONTINENT DEFINITIONS ────────────────────────────────────

const CONTINENT_DEFS = [
  {
    id: 'tianshan', name: 'Thiên Sơn Đại Lục', icon: '🗻', color: '#a78bfa', bg: '#1a1535',
    climate: 'Sơn Nhạc · Khắc Nghiệt',
    desc: 'Núi non trùng điệp, linh khí cực kỳ dày đặc — thiên đường của tu sĩ nhưng địa ngục của kẻ yếu.',
    regionKeywords: ['bắc', 'sơn', 'đỉnh', 'đông vực', 'bắc châu', 'đông'],
    bonuses: { cultivationMult: 1.5, warMult: 1.2, econMult: 0.8, cultureMult: 1.0, birthMult: 0.9 },
    resourceProfile: { spiritStones: 120, ironOre: 60, herbs: 80, artifacts: 40 },
    wonder: { id: 'thienlongthanh', name: 'Thiên Long Bảo Tháp', icon: '🏯', built: false, cost: { spiritStones: 80, ironOre: 40 }, bonus: { cultivationMult: 0.3 }, desc: 'Tháp chín tầng xuyên mây — tu sĩ luyện công tại đây đột phá nhanh gấp đôi.' },
    events: ['avalanche_purge','spirit_peak_open','dragon_vein_pulse','celestial_gate','thunder_trial'],
    tradeGoods: ['Linh Thạch Thiên Sơn','Tuyết Liên Hoa','Long Cốt Khoáng'],
    cultureTrait: 'Tu Luyện',
  },
  {
    id: 'namminh', name: 'Nam Minh Hải Châu', icon: '🌊', color: '#38bdf8', bg: '#071a2e',
    climate: 'Hải Dương · Ôn Hòa',
    desc: 'Chuỗi đảo và vịnh hải vô tận — thương nhân giàu có, hải tặc hùng mạnh, bí kíp chìm đáy biển.',
    regionKeywords: ['nam', 'hải', 'đảo', 'vịnh', 'nam hải', 'đông hải', 'biển'],
    bonuses: { cultivationMult: 1.0, warMult: 0.9, econMult: 1.6, cultureMult: 1.2, birthMult: 1.1 },
    resourceProfile: { spiritStones: 60, ironOre: 30, herbs: 100, artifacts: 80 },
    wonder: { id: 'haithanthi', name: 'Hải Thần Cự Tượng', icon: '🗽', built: false, cost: { spiritStones: 60, herbs: 60 }, bonus: { econMult: 0.5 }, desc: 'Pho tượng thần biển khổng lồ — thương thuyền từ khắp thiên hạ tự nhiên hội tụ về đây.' },
    events: ['tsunami_trial','sea_gate_open','pirates_coalition','pearl_tide','merchant_summit'],
    tradeGoods: ['Hải Thần Ngọc','Sâm Hải Thần','Châu Cổ Đại'],
    cultureTrait: 'Thương Mại',
  },
  {
    id: 'huanbac', name: 'Huyền Bắc Tuyết Nguyên', icon: '❄️', color: '#67e8f9', bg: '#051820',
    climate: 'Băng Tuyết · Hắc Ám',
    desc: 'Đồng bằng tuyết trắng bạt ngàn — nơi ẩn náu của tà phái và những bí thuật hắc ám xa xưa.',
    regionKeywords: ['bắc nguyên', 'băng', 'tuyết', 'hắc', 'bắc cực', 'huyền'],
    bonuses: { cultivationMult: 1.1, warMult: 1.4, econMult: 0.7, cultureMult: 0.8, birthMult: 0.7 },
    resourceProfile: { spiritStones: 80, ironOre: 100, herbs: 40, artifacts: 60 },
    wonder: { id: 'bangcung', name: 'Băng Cung Vĩnh Cửu', icon: '🏔️', built: false, cost: { ironOre: 80, spiritStones: 50 }, bonus: { warMult: 0.4 }, desc: 'Cung điện băng thiên cổ — chiến binh luyện tại đây, khí phách lạnh như băng không gì phá được.' },
    events: ['blizzard_siege','dark_art_revival','frozen_ancient_wake','shadow_cult_rise','ice_age_echo'],
    tradeGoods: ['Hàn Băng Thiết','Hắc Ngọc Tuyết','Âm Linh Tinh'],
    cultureTrait: 'Hắc Đạo',
  },
  {
    id: 'viemdia', name: 'Viêm Địa Hoang Nguyên', icon: '🔥', color: '#fb923c', bg: '#1f0800',
    climate: 'Hỏa Diệm · Cuồng Bạo',
    desc: 'Núi lửa phun trào bất tận — khoáng thạch quý hiếm vô số, nhưng chỉ kẻ mạnh mới sống sót.',
    regionKeywords: ['tây', 'hoang', 'lửa', 'hỏa', 'tây hoang', 'viêm', 'sa mạc'],
    bonuses: { cultivationMult: 0.9, warMult: 1.7, econMult: 1.1, cultureMult: 0.7, birthMult: 1.0 },
    resourceProfile: { spiritStones: 50, ironOre: 150, herbs: 30, artifacts: 50 },
    wonder: { id: 'hoathanluren', name: 'Hỏa Thần Lò Luyện', icon: '⚒️', built: false, cost: { ironOre: 100, spiritStones: 40 }, bonus: { warMult: 0.4 }, desc: 'Lò luyện thần binh đặt ngay miệng núi lửa — mỗi vũ khí đúc ra mang thần lửa trời bên trong.' },
    events: ['volcanic_eruption_chain','forge_god_descent','iron_rush','ember_storm','war_god_trials'],
    tradeGoods: ['Viêm Nguyên Thạch','Hỏa Thần Khoáng','Dung Nham Tinh'],
    cultureTrait: 'Chiến Tranh',
  },
  {
    id: 'trungchau', name: 'Trung Châu Thịnh Thế', icon: '🌿', color: '#4ade80', bg: '#031a0d',
    climate: 'Ôn Đới · Phồn Thịnh',
    desc: 'Trung tâm thiên hạ — văn minh phát triển nhất, thương mại tấp nập, chính trị phức tạp nhất.',
    regionKeywords: ['trung', 'châu', 'trung châu', 'bình', 'nguyên'],
    bonuses: { cultivationMult: 1.1, warMult: 0.9, econMult: 1.3, cultureMult: 1.8, birthMult: 1.3 },
    resourceProfile: { spiritStones: 90, ironOre: 70, herbs: 90, artifacts: 70 },
    wonder: { id: 'hocung', name: 'Thiên Hạ Học Cung', icon: '🏫', built: false, cost: { herbs: 70, artifacts: 50 }, bonus: { cultureMult: 0.6 }, desc: 'Học viện đỉnh cao thiên hạ — học giả từ mọi nơi hội tụ, kiến thức và văn hóa lan tràn không ngừng.' },
    events: ['grand_congress','silk_road_boom','cultural_revolution','great_census','golden_age'],
    tradeGoods: ['Bách Thảo Đan','Trung Châu Gấm','Cổ Thư Bí Tịch'],
    cultureTrait: 'Văn Hóa',
  },
  {
    id: 'huvobidi', name: 'Hư Vô Bí Địa', icon: '🌌', color: '#e879f9', bg: '#120a1f',
    climate: 'Hư Không · Huyền Bí',
    desc: 'Không gian méo mó, thời gian hỗn loạn — nơi sinh ra của những pháp thuật cổ đại nhất còn tồn tại.',
    regionKeywords: ['hư', 'vô', 'bí', 'cổ thần', 'huyền', 'không'],
    bonuses: { cultivationMult: 1.3, warMult: 1.0, econMult: 0.9, cultureMult: 1.4, birthMult: 0.8 },
    resourceProfile: { spiritStones: 100, ironOre: 40, herbs: 70, artifacts: 120 },
    wonder: { id: 'cothantoa', name: 'Cổ Thần Toà', icon: '🗿', built: false, cost: { artifacts: 100, spiritStones: 60 }, bonus: { cultivationMult: 0.1, warMult: 0.1, econMult: 0.1, cultureMult: 0.1 }, desc: 'Ngai toà của thần linh thượng cổ — ai an toạ tại đây, được thiên hạ đại đạo đồng thuận.' },
    events: ['void_rift','ancient_god_echo','time_anomaly','dimension_merge','cosmos_pulse'],
    tradeGoods: ['Hư Không Tinh Thạch','Thời Gian Mảnh Vỡ','Cổ Thần Di Vật'],
    cultureTrait: 'Huyền Học',
  },
];

// ─── EVENT DEFINITIONS ────────────────────────────────────────

const CONTINENT_EVENTS = {
  // 🗻 THIÊN SƠN
  avalanche_purge:    { icon:'🏔️', name:'Tuyết Sơn Đại Sập',       cat:'tianshan',  desc:'Núi lửa tuyết đổ xuống — các tông môn ven núi bị xóa sổ, nhưng bí bảo lộ ra.',   duration:15, effects:{ warMult:1.3, cultivationMult:0.7 }, onStart(c){ _ceLog(c,`🏔️ Tuyết Sơn Đại Sập — Linh Khí Thiên Sơn Rối Loạn!`); } },
  spirit_peak_open:   { icon:'⛰️', name:'Linh Phong Khai Sơn',      cat:'tianshan',  desc:'Đỉnh linh phong bí ẩn mở ra — một pháp môn thất truyền xuất hiện trên đỉnh núi.',  duration:20, effects:{ cultivationMult:1.8 }, onStart(c){ _ceLog(c,`⛰️ Linh Phong Khai Sơn — Pháp Môn Thất Truyền Xuất Hiện!`); } },
  dragon_vein_pulse:  { icon:'🐉', name:'Long Mạch Xung Động',      cat:'tianshan',  desc:'Long mạch thiên sơn rung chuyển — toàn bộ tu sĩ trong đại lục cảm nhận được.',    duration:25, effects:{ cultivationMult:1.5, econMult:1.2 }, onStart(c){ _ceLog(c,`🐉 Long Mạch Thiên Sơn Xung Động!`); } },
  celestial_gate:     { icon:'🌠', name:'Thiên Môn Khai Mở',        cat:'tianshan',  desc:'Cổng trời mở ra — thiên tài từ khắp nơi đổ về Thiên Sơn tu luyện.',               duration:30, effects:{ cultivationMult:2.0, birthMult:1.5 }, onStart(c){ _ceLog(c,`🌠 Thiên Môn Khai Mở — Thiên Tài Tụ Hội!`); } },
  thunder_trial:      { icon:'⚡', name:'Thiên Lôi Thử Thách',      cat:'tianshan',  desc:'Lôi thiên giáng xuống thử thách người xứng đáng — kẻ vượt qua trở nên phi phàm.',  duration:12, effects:{ cultivationMult:1.4, warMult:1.3 }, onStart(c){ _ceLog(c,`⚡ Thiên Lôi Thử Thách Bắt Đầu!`); } },
  // 🌊 NAM MINH
  tsunami_trial:      { icon:'🌊', name:'Hải Khẩu Thần Phán',      cat:'namminh',   desc:'Sóng thần thần thánh — chỉ thuyền của người có đức hạnh mới không bị nhấn chìm.',  duration:10, effects:{ econMult:0.6, warMult:0.8 }, onStart(c){ _ceLog(c,`🌊 Hải Khẩu Thần Phán — Biển Nổi Cơn Thịnh Nộ!`); } },
  sea_gate_open:      { icon:'🌀', name:'Hải Môn Khai Mở',         cat:'namminh',   desc:'Cổng biển huyền bí mở ra — tàu thuyền tới vùng đất chứa đầy bảo vật cổ đại.',     duration:30, effects:{ econMult:1.8, artifactMult:1.5 }, onStart(c){ _ceLog(c,`🌀 Hải Môn Khai Mở — Thương Nhân Khắp Nơi Đổ Xô!`); } },
  pirates_coalition:  { icon:'🏴', name:'Hải Tặc Đại Liên Minh',   cat:'namminh',   desc:'Các băng hải tặc hợp nhất — hải lộ bị phong tỏa, thương mại sụp đổ tạm thời.',   duration:20, effects:{ econMult:0.5, warMult:1.6 }, onStart(c){ _ceLog(c,`🏴 Hải Tặc Đại Liên Minh — Hải Lộ Bị Phong Tỏa!`); } },
  pearl_tide:         { icon:'🫧', name:'Châu Báu Triều Dâng',     cat:'namminh',   desc:'Đáy biển dâng lên vô số châu báu cổ đại — ai cũng có thể giàu lên nhanh chóng.',  duration:25, effects:{ econMult:2.0, cultureMult:1.3 }, onStart(c){ _ceLog(c,`🫧 Châu Báu Triều Dâng — Của Cải Trời Cho!`); } },
  merchant_summit:    { icon:'🤝', name:'Đại Thương Hội Nghị',     cat:'namminh',   desc:'Các thương nhân lớn nhất thiên hạ hội tụ — ký kết hợp đồng thương mại trăm năm.',  duration:20, effects:{ econMult:1.5, cultureMult:1.2 }, onStart(c){ _ceLog(c,`🤝 Đại Thương Hội Nghị — Kinh Tế Bùng Phát!`); } },
  // ❄️ HUYỀN BẮC
  blizzard_siege:     { icon:'🌨️', name:'Tuyết Bạo Bao Vây',       cat:'huanbac',   desc:'Bão tuyết cực đại bao vây đại lục — mọi giao thương bị cắt đứt.',               duration:25, effects:{ warMult:0.4, econMult:0.5 }, onStart(c){ _ceLog(c,`🌨️ Tuyết Bạo Bao Vây — Huyền Bắc Bị Cô Lập!`); } },
  dark_art_revival:   { icon:'🌑', name:'Hắc Nghệ Phục Hưng',      cat:'huanbac',   desc:'Tà phái cổ đại trỗi dậy — hắc nghệ lan tràn, tu sĩ tà đạo hưng thịnh.',          duration:30, effects:{ warMult:1.5, cultivationMult:1.2 }, onStart(c){ _ceLog(c,`🌑 Hắc Nghệ Phục Hưng — Tà Phái Thiên Hạ Trỗi Dậy!`); } },
  frozen_ancient_wake:{ icon:'🧊', name:'Băng Cổ Thần Thức Tỉnh',  cat:'huanbac',   desc:'Một thực thể cổ đại bị phong ấn trong băng tỉnh giấc — nguy cơ cực độ.',         duration:20, effects:{ warMult:2.0, cultivationMult:0.8 }, onStart(c){ _ceLog(c,`🧊 Băng Cổ Thần Thức Tỉnh — Hiểm Nguy Đại Lục!`); } },
  shadow_cult_rise:   { icon:'☠️', name:'Hắc Giáo Trỗi Dậy',      cat:'huanbac',   desc:'Giáo phái bóng tối bí ẩn nổi lên — kiểm soát gián điệp và ám sát toàn đại lục.',  duration:35, effects:{ warMult:1.3, econMult:0.8 }, onStart(c){ _ceLog(c,`☠️ Hắc Giáo Xuất Hiện — Bóng Tối Lan Tràn!`); } },
  ice_age_echo:       { icon:'🌬️', name:'Băng Kỷ Âm Vang',        cat:'huanbac',   desc:'Ký ức băng kỷ thức tỉnh — sức mạnh nguyên thủy tràn ngập đại lục.',              duration:20, effects:{ warMult:1.4, cultivationMult:1.1 }, onStart(c){ _ceLog(c,`🌬️ Băng Kỷ Âm Vang — Nguyên Khí Bùng Nổ!`); } },
  // 🔥 VIÊM ĐỊA
  volcanic_eruption_chain:{ icon:'🌋', name:'Liên Hoàn Núi Lửa',  cat:'viemdia',   desc:'Hàng chục núi lửa đồng loạt phun trào — tài nguyên dồi dào nhưng chiến tranh bùng nổ.', duration:20, effects:{ warMult:1.8, econMult:1.3 }, onStart(c){ _ceLog(c,`🌋 Liên Hoàn Núi Lửa — Viêm Địa Rực Lửa!`); } },
  forge_god_descent:  { icon:'⚒️', name:'Lò Thần Giáng Thế',      cat:'viemdia',   desc:'Thần rèn giáng xuống — mọi vũ khí được rèn trong kỳ này đều có phẩm chất vượt trội.', duration:25, effects:{ warMult:1.4, econMult:1.2 }, onStart(c){ _ceLog(c,`⚒️ Lò Thần Giáng Thế — Thần Binh Ra Lò!`); } },
  iron_rush:          { icon:'⛏️', name:'Quặng Sắt Đại Phát',     cat:'viemdia',   desc:'Mỏ quặng khổng lồ được phát hiện — các thế lực đổ xô khai thác.',               duration:35, effects:{ econMult:1.7, warMult:1.2 }, onStart(c){ _ceLog(c,`⛏️ Quặng Sắt Đại Phát — Viêm Địa Mỏ Vàng Lộ Ra!`); } },
  ember_storm:        { icon:'💥', name:'Linh Hỏa Cuồng Bạo',     cat:'viemdia',   desc:'Cơn bão lửa linh khí nổ ra — tu sĩ hỏa hệ đạt đột phá hàng loạt.',              duration:18, effects:{ warMult:1.6, cultivationMult:1.3 }, onStart(c){ _ceLog(c,`💥 Linh Hỏa Cuồng Bạo — Lửa Trời Thiêu Đốt!`); } },
  war_god_trials:     { icon:'⚔️', name:'Chiến Thần Thử Thách',    cat:'viemdia',   desc:'Chiến thần giáng xuống thử thách mọi chiến binh — kẻ vượt qua nhận thần lực.',  duration:22, effects:{ warMult:2.0, birthMult:1.2 }, onStart(c){ _ceLog(c,`⚔️ Chiến Thần Giáng Thế — Thử Thách Bắt Đầu!`); } },
  // 🌿 TRUNG CHÂU
  grand_congress:     { icon:'🏛️', name:'Thiên Hạ Đại Nghị Hội',  cat:'trungchau', desc:'Tất cả các thế lực lớn ngồi họp — quyết định vận mệnh thiên hạ trong nhiều thập kỷ.', duration:30, effects:{ warMult:0.2, cultureMult:1.8, econMult:1.4 }, onStart(c){ _ceLog(c,`🏛️ Thiên Hạ Đại Nghị Hội Khai Mạc!`); } },
  silk_road_boom:     { icon:'🛤️', name:'Tơ Lụa Chi Đạo',        cat:'trungchau', desc:'Con đường thương mại mới hình thành — hàng hóa, văn hóa và ý tưởng lan tràn.',  duration:40, effects:{ econMult:1.9, cultureMult:1.4 }, onStart(c){ _ceLog(c,`🛤️ Tơ Lụa Chi Đạo — Thương Mại Bùng Nổ!`); } },
  cultural_revolution:{ icon:'🌺', name:'Văn Hóa Đại Cách Mạng',  cat:'trungchau', desc:'Tư tưởng mới trỗi dậy — cũ thay mới, văn hóa xã hội thay đổi hoàn toàn.',       duration:35, effects:{ cultureMult:2.2, warMult:0.7 }, onStart(c){ _ceLog(c,`🌺 Văn Hóa Đại Cách Mạng — Trung Châu Thay Đổi!`); } },
  great_census:       { icon:'📊', name:'Thiên Hạ Nhân Khẩu Điều Tra',cat:'trungchau',desc:'Điều tra dân số toàn thiên hạ — tiềm lực thực sự của mọi thế lực được phơi bày.',duration:15, effects:{ econMult:1.2, cultureMult:1.3 }, onStart(c){ _ceLog(c,`📊 Thiên Hạ Nhân Khẩu Điều Tra — Bí Mật Được Lộ!`); } },
  golden_age:         { icon:'✨', name:'Hoàng Kim Thời Đại',       cat:'trungchau', desc:'Thời đại hoàng kim của Trung Châu — mọi mặt đều phát triển vượt bậc.',           duration:50, effects:{ econMult:1.5, cultureMult:1.6, cultivationMult:1.2, birthMult:1.4 }, onStart(c){ _ceLog(c,`✨ Hoàng Kim Thời Đại Bắt Đầu — Thịnh Thế Vô Song!`); } },
  // 🌌 HƯ VÔ BÍ ĐỊA
  void_rift:          { icon:'🌀', name:'Hư Không Rạn Nứt',        cat:'huvobidi',  desc:'Không gian xung quanh đại lục rạn nứt — sinh vật từ hư không tràn vào.',          duration:20, effects:{ warMult:2.0, cultivationMult:1.3 }, onStart(c){ _ceLog(c,`🌀 Hư Không Rạn Nứt — Sinh Vật Bí Địa Tràn Ra!`); } },
  ancient_god_echo:   { icon:'🗿', name:'Cổ Thần Vang Vọng',       cat:'huvobidi',  desc:'Tiếng vang của thần linh thượng cổ lan khắp đại lục — đại ngộ xảy ra liên tiếp.',  duration:30, effects:{ cultivationMult:1.7, cultureMult:1.5 }, onStart(c){ _ceLog(c,`🗿 Cổ Thần Vang Vọng — Vạn Tu Sĩ Đốn Ngộ!`); } },
  time_anomaly:       { icon:'⏳', name:'Thời Gian Dị Thường',      cat:'huvobidi',  desc:'Thời gian trong đại lục chảy khác — một ngày bằng mười ngày bên ngoài.',          duration:15, effects:{ cultivationMult:2.5, birthMult:0.5 }, onStart(c){ _ceLog(c,`⏳ Thời Gian Dị Thường — Hư Vô Ngoài Vòng Thời Gian!`); } },
  dimension_merge:    { icon:'🔮', name:'Không Gian Hợp Nhất',      cat:'huvobidi',  desc:'Hai không gian chồng lên nhau — quy luật tu luyện thay đổi hoàn toàn.',           duration:25, effects:{ cultivationMult:2.0, warMult:0.8 }, onStart(c){ _ceLog(c,`🔮 Không Gian Hợp Nhất — Đại Lục Biến Dị!`); } },
  cosmos_pulse:       { icon:'💫', name:'Vũ Trụ Nhịp Đập',         cat:'huvobidi',  desc:'Nhịp đập của vũ trụ cộng hưởng — ai cảm nhận được sẽ tiến đến giới hạn mới.',     duration:20, effects:{ cultivationMult:1.8, cultureMult:1.6 }, onStart(c){ _ceLog(c,`💫 Vũ Trụ Nhịp Đập — Thiên Đạo Cộng Hưởng!`); } },
};

// ─── DIPLOMACY TYPES ──────────────────────────────────────────

const DIPLO_TYPES = {
  alliance:   { name:'Liên Minh',       icon:'🤝', color:'#4ade80', desc:'Cùng chiến đấu, chia sẻ tài nguyên, +20% chiến lực khi phối hợp.' },
  trade_pact: { name:'Hiệp Ước Thương Mại', icon:'💰', color:'#facc15', desc:'Trao đổi hàng hóa tự do, tăng 15% kinh tế hai bên.' },
  non_aggression:{ name:'Bất Xâm Phạm', icon:'🕊️', color:'#60a5fa', desc:'Cam kết không tuyên chiến trong 50 năm.' },
  vassal:     { name:'Thần Phục',        icon:'👑', color:'#c084fc', desc:'Đại lục yếu thần phục đại lục mạnh, cống nạp 10% tài nguyên/kỳ.' },
};

// ─── CATASTROPHE POOL ─────────────────────────────────────────

const CONTINENTAL_CATASTROPHES = [
  { id:'plague_wave',    icon:'☣️', name:'Đại Dịch Toàn Cầu',    desc:'Bệnh dịch lan khắp thiên hạ — dân số tất cả đại lục giảm mạnh.', severity:'extreme', effect(){ ceState.continents.forEach(c=>{ c.stability=Math.max(5,c.stability-20); _ceLog(c.id,'☣️ Đại Dịch Toàn Cầu Tàn Phá!'); }); } },
  { id:'void_incursion', icon:'👾', name:'Hư Không Đại Xâm Lăng', desc:'Quái vật từ hư không đồng loạt tấn công tất cả đại lục.',       severity:'extreme', effect(){ ceState.continents.forEach(c=>{ c.resources.ironOre=Math.max(0,(c.resources.ironOre||0)-50); _ceLog(c.id,'👾 Hư Không Quái Vật Xâm Lăng!'); }); } },
  { id:'heaven_rupture', icon:'💥', name:'Thiên Đạo Rạn Nứt',    desc:'Thiên đạo bị phá vỡ — tu luyện trở nên vô cùng khó khăn.',      severity:'severe',  effect(){ ceState.continents.forEach(c=>{ c.bonuses.cultivationMult=Math.max(0.1,(c.bonuses.cultivationMult||1)*0.6); }); setTimeout(()=>ceState.continents.forEach(c=>c.bonuses=JSON.parse(JSON.stringify(CONTINENT_DEFS.find(d=>d.id===c.id).bonuses))),200*1000); _ceAddGlobalLog('💥 Thiên Đạo Rạn Nứt — Tu Luyện Bị Ảnh Hưởng Toàn Thiên Hạ!'); } },
  { id:'resource_drought',icon:'🌵',name:'Linh Khí Đại Hạn',      desc:'Linh khí thiên địa cạn kiệt — mọi tài nguyên sản xuất giảm 50%.',severity:'severe',  effect(){ ceState.continents.forEach(c=>{ Object.keys(c.resources).forEach(k=>c.resources[k]=Math.floor((c.resources[k]||0)*0.5)); }); _ceAddGlobalLog('🌵 Linh Khí Đại Hạn — Thiên Địa Linh Khí Cạn Kiệt!'); } },
  { id:'war_fever',      icon:'⚔️', name:'Thiên Hạ Đại Loạn',    desc:'Toàn bộ đại lục chìm vào chiến tranh — không thể ngăn cản.',     severity:'moderate',effect(){ ceState.continents.forEach((c,i)=>{ const next=ceState.continents[(i+1)%ceState.continents.length]; if(c.id!==next.id)ceLaunchWar(c.id,next.id); }); _ceAddGlobalLog('⚔️ Thiên Hạ Đại Loạn — Các Đại Lục Tuyên Chiến Nhau!'); } },
  { id:'golden_meteor',  icon:'☄️', name:'Hoàng Kim Thiên Thạch', desc:'Thiên thạch vàng rơi xuống — mang theo nguồn tài nguyên vô tận.', severity:'blessing',effect(){ ceState.continents.forEach(c=>{ Object.keys(c.resources).forEach(k=>c.resources[k]=(c.resources[k]||0)+100); c.stability=Math.min(100,c.stability+15); }); _ceAddGlobalLog('☄️ Hoàng Kim Thiên Thạch Giáng Thế — Của Cải Trời Cho Toàn Thiên Hạ!'); } },
];

// ─── STATE ────────────────────────────────────────────────────

let ceState = {
  continents:    [],
  wars:          [],
  diplo:         [],      // diplomatic relations: { id, typeId, a, b, startTick, duration }
  tradeRoutes:   [],      // active trade routes: { id, from, to, good, volume, startTick }
  globalLog:     [],
  powerHistory:  [],      // [ { tick, powers: { continentId: score } } ] — for chart
  discoveries:   [],      // [ { continentId, name, icon, year, desc } ]
  tickCount:     0,
  lastAutoTick:  0,
  autoInterval:  12,
  initialized:   false,
};

// ─── HELPERS ─────────────────────────────────────────────────

function _ceLog(continentId, msg) {
  const cont = ceState.continents.find(c => c.id === continentId);
  const entry = { tick: ceState.tickCount, year: window.year || 0, msg, continent: continentId };
  if (cont) { cont.history = cont.history || []; cont.history.unshift(entry); if (cont.history.length > 200) cont.history.pop(); }
  ceState.globalLog.unshift(entry);
  if (ceState.globalLog.length > 600) ceState.globalLog.pop();
  if (typeof addLog === 'function') addLog(`[${cont?.name || continentId}] ${msg}`);
}

function _ceAddGlobalLog(msg) {
  const entry = { tick: ceState.tickCount, year: window.year || 0, msg, continent: 'global' };
  ceState.globalLog.unshift(entry);
  if (ceState.globalLog.length > 600) ceState.globalLog.pop();
  if (typeof addLog === 'function') addLog(`[天下] ${msg}`);
}

function _cePower(cid, cArr) {
  const cont = ceState.continents.find(c => c.id === cid);
  if (!cont) return 0;
  const baseRes = Object.values(cont.resources || {}).reduce((a,v) => a + v, 0);
  const countryPow = (cont.countryIds || []).reduce((s, id) => {
    const c = cArr.find(x => (x.name || x.id) === id);
    return s + (c ? (c.population||0)*0.3 + (c.army||0)*0.5 + (c.techLevel||0)*5 + (c.economy||0)*0.2 : 0);
  }, 0);
  const wonderBonus = cont.wonder?.built ? 3000 : 0;
  const allianceBonus = ceState.diplo.filter(d => d.typeId === 'alliance' && (d.a === cid || d.b === cid)).length * 500;
  return Math.round(countryPow + baseRes * 0.5 + (cont.stability || 50) * 20 + wonderBonus + allianceBonus);
}

function _ceTransferResources(fromId, toId, pct) {
  const from = ceState.continents.find(c => c.id === fromId);
  const to   = ceState.continents.find(c => c.id === toId);
  if (!from || !to) return;
  ['spiritStones','ironOre','herbs','artifacts'].forEach(k => {
    const amt = Math.floor((from.resources[k] || 0) * pct);
    from.resources[k] = Math.max(0, (from.resources[k] || 0) - amt);
    to.resources[k]   = (to.resources[k] || 0) + amt;
  });
}

function _ceRandId() { return 'ce_' + Date.now() + '_' + Math.floor(Math.random() * 9999); }

// ─── INIT ─────────────────────────────────────────────────────

function ceInit() {
  if (ceState.initialized) return;
  ceState.continents = CONTINENT_DEFS.map(def => ({
    ...def,
    wonder:          { ...def.wonder },
    bonuses:         { ...def.bonuses },
    resourceProfile: { ...def.resourceProfile },
    resources:       { spiritStones: def.resourceProfile.spiritStones, ironOre: def.resourceProfile.ironOre, herbs: def.resourceProfile.herbs, artifacts: def.resourceProfile.artifacts },
    countryIds:      [],
    activeEvents:    [],
    eventCooldowns:  {},
    stability:       75 + Math.floor(Math.random() * 20),
    hegemon:         null,
    history:         [],
    cultureInfluence: 0,
    migrationIn:     0,
    discoveryCount:  0,
  }));
  ceState.initialized = true;
  ceAssignCountries();
  console.log('[ContinentEngine V2] Initialized ✓');
}

// ─── SAVE / LOAD ──────────────────────────────────────────────

(function cePatchSaveLoad() {
  function tryPatch() {
    if (typeof window.save === 'function' && !window._ceSavePatched) {
      window._ceSavePatched = true;
      const _os = window.save;
      window.save = function() {
        _os.apply(this, arguments);
        try { localStorage.setItem('cgv6_ceState', JSON.stringify({
          continents:   ceState.continents.map(c => ({ id:c.id, wonder:c.wonder, resources:c.resources, countryIds:c.countryIds, stability:c.stability, bonuses:c.bonuses, history:(c.history||[]).slice(0,100), activeEvents:c.activeEvents, eventCooldowns:c.eventCooldowns, hegemon:c.hegemon, cultureInfluence:c.cultureInfluence||0, migrationIn:c.migrationIn||0 })),
          wars:         ceState.wars.slice(0,60),
          diplo:        ceState.diplo.slice(0,40),
          tradeRoutes:  ceState.tradeRoutes.slice(0,30),
          globalLog:    ceState.globalLog.slice(0,200),
          powerHistory: ceState.powerHistory.slice(0,100),
          discoveries:  ceState.discoveries.slice(0,50),
          tickCount:    ceState.tickCount,
        })); } catch(e) {}
      };
    }
    if (typeof window.load === 'function' && !window._ceLoadPatched) {
      window._ceLoadPatched = true;
      const _ol = window.load;
      window.load = function() {
        _ol.apply(this, arguments);
        try {
          const raw = localStorage.getItem('cgv6_ceState');
          if (raw) {
            const d = JSON.parse(raw);
            ceInit();
            (d.continents || []).forEach(saved => {
              const c = ceState.continents.find(x => x.id === saved.id);
              if (c) Object.assign(c, saved);
            });
            ceState.wars         = d.wars         || [];
            ceState.diplo        = d.diplo        || [];
            ceState.tradeRoutes  = d.tradeRoutes  || [];
            ceState.globalLog    = d.globalLog    || [];
            ceState.powerHistory = d.powerHistory || [];
            ceState.discoveries  = d.discoveries  || [];
            ceState.tickCount    = d.tickCount    || 0;
          }
        } catch(e) {}
      };
    }
  }
  tryPatch();
  document.addEventListener('DOMContentLoaded', () => setTimeout(tryPatch, 1200));
})();

// ─── COUNTRY ASSIGNMENT ───────────────────────────────────────

function ceAssignCountries() {
  if (!ceState.initialized) ceInit();
  const cArr = (typeof countries !== 'undefined' && Array.isArray(countries)) ? countries : [];
  ceState.continents.forEach(c => c.countryIds = []);
  cArr.forEach((country, idx) => {
    const territory = (country.territory || country.region || '').toLowerCase();
    let matched = null;
    for (const cont of ceState.continents) {
      if (cont.regionKeywords.some(kw => territory.includes(kw.toLowerCase()))) { matched = cont; break; }
    }
    if (!matched) matched = ceState.continents[idx % ceState.continents.length];
    if (country.continentId) {
      const pinned = ceState.continents.find(c => c.id === country.continentId);
      if (pinned) matched = pinned;
    }
    const key = country.name || country.id || `#${idx}`;
    if (!matched.countryIds.includes(key)) matched.countryIds.push(key);
    country.continentId = matched.id;
  });
  ceUpdateHegemons();
}

function ceUpdateHegemons() {
  const cArr = (typeof countries !== 'undefined' && Array.isArray(countries)) ? countries : [];
  ceState.continents.forEach(cont => {
    let best = null, bestScore = -1;
    (cont.countryIds || []).forEach(cid => {
      const c = cArr.find(x => (x.name || x.id) === cid);
      if (!c || c.collapsed) return;
      const score = (c.population||0)*0.4 + (c.army||0)*0.4 + (c.techLevel||0)*10 + (c.economy||0)*0.2;
      if (score > bestScore) { bestScore = score; best = c; }
    });
    const prev = cont.hegemon;
    cont.hegemon = best ? (best.name || best.id) : null;
    if (best && prev !== cont.hegemon)
      _ceLog(cont.id, `👑 ${cont.hegemon} trở thành Bá Chủ của ${cont.name}`);
  });
}

// ─── WONDER BUILDING ──────────────────────────────────────────

function ceBuildWonder(continentId) {
  const cont = ceState.continents.find(c => c.id === continentId);
  if (!cont) return { ok: false, msg: 'Đại lục không tồn tại' };
  if (cont.wonder.built) return { ok: false, msg: `${cont.wonder.name} đã được xây dựng` };
  for (const [res, amt] of Object.entries(cont.wonder.cost)) {
    if ((cont.resources[res] || 0) < amt) return { ok: false, msg: `Thiếu ${res}: cần ${amt}, có ${Math.floor(cont.resources[res]||0)}` };
  }
  for (const [res, amt] of Object.entries(cont.wonder.cost)) cont.resources[res] -= amt;
  cont.wonder.built = true;
  _ceLog(continentId, `🏛️ ${cont.wonder.name} đã hoàn thành tại ${cont.name}!`);
  if (typeof addLog === 'function') addLog(`[Đại Lục] 🏛️ KỲ QUAN ${cont.wonder.name} — ${cont.name} rung chuyển thiên hạ!`);
  return { ok: true };
}

// ─── WAR SYSTEM ───────────────────────────────────────────────

function ceLaunchWar(attackerId, defenderId) {
  if (attackerId === defenderId) return { ok: false, msg: 'Không thể tuyên chiến với chính mình' };
  const att = ceState.continents.find(c => c.id === attackerId);
  const def = ceState.continents.find(c => c.id === defenderId);
  if (!att || !def) return { ok: false, msg: 'Đại lục không hợp lệ' };
  if (ceState.wars.find(w => w.phase === 'ongoing' && ((w.attacker === attackerId && w.defender === defenderId)||(w.attacker === defenderId && w.defender === attackerId))))
    return { ok: false, msg: 'Hai đại lục này đang trong chiến tranh' };
  // Check non-aggression pact
  if (ceState.diplo.find(d => d.typeId === 'non_aggression' && ((d.a===attackerId&&d.b===defenderId)||(d.a===defenderId&&d.b===attackerId))))
    return { ok: false, msg: 'Có Hiệp Ước Bất Xâm Phạm đang hiệu lực!' };

  const totalDuration = 30 + Math.floor(Math.random() * 30);
  const war = { id: _ceRandId(), attacker: attackerId, defender: defenderId, tick: ceState.tickCount, phase: 'ongoing', duration: totalDuration, ticksLeft: totalDuration, rounds: [], attPow: 0, defPow: 0, outcome: null };
  ceState.wars.push(war);
  att.stability = Math.max(10, att.stability - 10);
  def.stability = Math.max(10, def.stability - 10);
  const msg = `⚔️ LỤC ĐỊA CHIẾN TRANH — ${att.icon}${att.name} tuyên chiến với ${def.icon}${def.name}!`;
  _ceLog(attackerId, msg); _ceLog(defenderId, msg);
  return { ok: true, war };
}

// ─── DIPLOMACY ────────────────────────────────────────────────

function ceMakeDiplo(typeId, aId, bId) {
  if (aId === bId) return { ok: false, msg: 'Không thể ký kết với chính mình' };
  const existing = ceState.diplo.find(d => (d.a===aId&&d.b===bId)||(d.a===bId&&d.b===aId));
  if (existing) return { ok: false, msg: `Đã có quan hệ ngoại giao: ${DIPLO_TYPES[existing.typeId]?.name}` };
  const def  = DIPLO_TYPES[typeId];
  const a    = ceState.continents.find(c => c.id === aId);
  const b    = ceState.continents.find(c => c.id === bId);
  if (!def || !a || !b) return { ok: false, msg: 'Tham số không hợp lệ' };
  const duration = typeId === 'non_aggression' ? 50 : typeId === 'vassal' ? 999 : 40;
  ceState.diplo.push({ id: _ceRandId(), typeId, a: aId, b: bId, startTick: ceState.tickCount, duration });
  const msg = `${def.icon} ${def.name}: ${a.icon}${a.name} ↔ ${b.icon}${b.name}`;
  _ceLog(aId, msg); _ceLog(bId, msg);
  _ceAddGlobalLog(msg);
  return { ok: true };
}

function ceBreakDiplo(diploId) {
  const idx = ceState.diplo.findIndex(d => d.id === diploId);
  if (idx === -1) return { ok: false, msg: 'Không tìm thấy quan hệ ngoại giao' };
  const d = ceState.diplo[idx];
  const a = ceState.continents.find(c => c.id === d.a);
  const b = ceState.continents.find(c => c.id === d.b);
  ceState.diplo.splice(idx, 1);
  _ceAddGlobalLog(`💔 Quan Hệ ${DIPLO_TYPES[d.typeId]?.name} giữa ${a?.name} ↔ ${b?.name} tan vỡ!`);
  return { ok: true };
}

function ceMakeTradeRoute(fromId, toId) {
  const from = ceState.continents.find(c => c.id === fromId);
  const to   = ceState.continents.find(c => c.id === toId);
  if (!from || !to || fromId === toId) return { ok: false, msg: 'Tham số không hợp lệ' };
  if (ceState.tradeRoutes.find(r => (r.from===fromId&&r.to===toId)||(r.from===toId&&r.to===fromId)))
    return { ok: false, msg: 'Tuyến thương mại đã tồn tại' };
  const good = from.tradeGoods?.[Math.floor(Math.random() * (from.tradeGoods?.length||1))] || 'Hàng Hóa';
  ceState.tradeRoutes.push({ id: _ceRandId(), from: fromId, to: toId, good, volume: 10 + Math.floor(Math.random()*20), startTick: ceState.tickCount });
  _ceAddGlobalLog(`🛤️ Tuyến Thương Mại: ${from.icon}${from.name} → ${to.icon}${to.name} (${good})`);
  return { ok: true };
}

// ─── DISCOVERY ────────────────────────────────────────────────

const DISCOVERY_POOL = [
  { name:'Cổ Động Huyệt Bí Ẩn',icon:'🕳️',  desc:'Hang động ẩn sâu dưới lòng đất chứa đầy linh khí cổ đại.' },
  { name:'Thất Truyền Pháp Điển',icon:'📜', desc:'Bộ pháp thuật thất truyền nghìn năm được tìm thấy.' },
  { name:'Thần Thú Hóa Thạch',  icon:'🦕',  desc:'Xác của một thần thú từ thời thượng cổ được khai quật.' },
  { name:'Lơ Lửng Linh Đảo',   icon:'🏝️',  desc:'Một hòn đảo thần kỳ nổi trên không trung được phát hiện.' },
  { name:'Hư Không Khe Nứt',   icon:'🌀',  desc:'Khe nứt không gian dẫn đến một chiều không gian khác.' },
  { name:'Tinh Thần Khoáng Mạch',icon:'💎', desc:'Mạch khoáng tinh thần vô tận nằm sâu trong lòng đất.' },
  { name:'Cổ Văn Minh Phế Tích',icon:'🏛️', desc:'Tàn tích của một nền văn minh cổ xưa hơn bất kỳ ai biết.' },
  { name:'Thiên Ngoại Linh Thạch',icon:'☄️',desc:'Thiên thạch linh từ ngoài vũ trụ rơi xuống mang năng lượng vô biên.' },
];

function ceDoDiscovery(continentId) {
  const cont = ceState.continents.find(c => c.id === continentId);
  if (!cont) return;
  const pool = DISCOVERY_POOL.filter(d => !ceState.discoveries.find(x => x.name === d.name && x.continentId === continentId));
  if (!pool.length) return;
  const disc = pool[Math.floor(Math.random() * pool.length)];
  const entry = { ...disc, continentId, year: window.year || 0, tick: ceState.tickCount };
  ceState.discoveries.push(entry);
  cont.discoveryCount = (cont.discoveryCount || 0) + 1;
  // Give resource bonus
  const bonusRes = Math.floor(20 + Math.random() * 40);
  cont.resources.spiritStones = (cont.resources.spiritStones || 0) + bonusRes;
  cont.resources.artifacts    = (cont.resources.artifacts    || 0) + Math.floor(bonusRes * 0.5);
  _ceLog(continentId, `🔍 KHÁM PHÁ: ${disc.icon} ${disc.name} — ${disc.desc}`);
  return entry;
}

// ─── EVENT SYSTEM ─────────────────────────────────────────────

function ceTriggerEvent(continentId, eventId, forced) {
  const cont = ceState.continents.find(c => c.id === continentId);
  const evDef = CONTINENT_EVENTS[eventId];
  if (!cont || !evDef) return { ok: false, msg: '?' };
  if (!forced && (cont.eventCooldowns[eventId] || 0) > 0)
    return { ok: false, msg: `Hồi chiêu: ${cont.eventCooldowns[eventId]} tích tắc` };
  if (cont.activeEvents.find(e => e.eventId === eventId))
    return { ok: false, msg: 'Sự kiện đang diễn ra' };
  cont.activeEvents.push({ eventId, ticksLeft: evDef.duration });
  cont.eventCooldowns[eventId] = 50 + Math.floor(Math.random() * 30);
  try { evDef.onStart(continentId); } catch(e) {}
  return { ok: true };
}

// ─── MAIN TICK ────────────────────────────────────────────────

function ceTick() {
  if (!ceState.initialized) ceInit();
  ceState.tickCount++;
  const cArr = (typeof countries !== 'undefined' && Array.isArray(countries)) ? countries : [];

  // 1. Resource accumulation + active events
  ceState.continents.forEach(cont => {
    const base = cont.resourceProfile;
    const m = 0.05;
    const cnt = (cont.countryIds?.length || 0) + 1;
    cont.resources.spiritStones = (cont.resources.spiritStones||0) + base.spiritStones * m * cnt;
    cont.resources.ironOre      = (cont.resources.ironOre||0)      + base.ironOre      * m * cnt;
    cont.resources.herbs        = (cont.resources.herbs||0)        + base.herbs        * m * cnt;
    cont.resources.artifacts    = (cont.resources.artifacts||0)    + base.artifacts    * m * cnt;
    // Resource cap
    ['spiritStones','ironOre','herbs','artifacts'].forEach(k => { cont.resources[k] = Math.min(cont.resources[k], 9999); });

    // Active events tick
    cont.activeEvents = cont.activeEvents.filter(e => { e.ticksLeft--; return e.ticksLeft > 0; });
    for (const k in cont.eventCooldowns) { if (cont.eventCooldowns[k] > 0) cont.eventCooldowns[k]--; }

    // Stability drift
    if (Math.random() < 0.05) {
      const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
      cont.stability = Math.max(5, Math.min(100, (cont.stability||50) + delta));
    }

    // Culture influence spread
    cont.cultureInfluence = (cont.cultureInfluence || 0) + (cont.bonuses.cultureMult || 1) * 0.1;
  });

  // 2. Trade routes yield
  ceState.tradeRoutes.forEach(route => {
    const from = ceState.continents.find(c => c.id === route.from);
    const to   = ceState.continents.find(c => c.id === route.to);
    if (!from || !to) return;
    const gain = route.volume * 0.2;
    from.resources.spiritStones = (from.resources.spiritStones || 0) + gain;
    to.resources.spiritStones   = (to.resources.spiritStones   || 0) + gain;
  });

  // 3. Vassal tribute
  ceState.diplo.filter(d => d.typeId === 'vassal').forEach(d => {
    const suzerain = ceState.continents.find(c => c.id === d.a);
    const vassal   = ceState.continents.find(c => c.id === d.b);
    if (!suzerain || !vassal) return;
    const tribute = Math.floor((vassal.resources.spiritStones||0) * 0.1);
    vassal.resources.spiritStones   = Math.max(0, (vassal.resources.spiritStones||0) - tribute);
    suzerain.resources.spiritStones = (suzerain.resources.spiritStones||0) + tribute;
  });

  // 4. Diplomacy expiry
  ceState.diplo = ceState.diplo.filter(d => {
    if (d.duration && (ceState.tickCount - d.startTick) >= d.duration) {
      const a = ceState.continents.find(c => c.id === d.a);
      const b = ceState.continents.find(c => c.id === d.b);
      _ceAddGlobalLog(`⌛ ${DIPLO_TYPES[d.typeId]?.name} giữa ${a?.name} ↔ ${b?.name} hết hạn.`);
      return false;
    }
    return true;
  });

  // 5. War ticks (multi-round)
  ceState.wars.filter(w => w.phase === 'ongoing').forEach(w => {
    w.ticksLeft--;
    const attPow = _cePower(w.attacker, cArr);
    const defPow = _cePower(w.defender, cArr);
    // Record a battle round every 5 ticks
    if (ceState.tickCount % 5 === 0) {
      const roundWinner = attPow > defPow ? 'att' : defPow > attPow ? 'def' : 'draw';
      w.rounds = w.rounds || [];
      w.rounds.push({ tick: ceState.tickCount, attPow, defPow, winner: roundWinner });
      // Small resource drain per round
      _ceTransferResources(roundWinner === 'att' ? w.defender : w.attacker,
                           roundWinner === 'att' ? w.attacker : w.defender, 0.03);
    }
    if (w.ticksLeft <= 0) {
      const att = ceState.continents.find(c => c.id === w.attacker);
      const def = ceState.continents.find(c => c.id === w.defender);
      // Tally rounds
      const attWins = (w.rounds||[]).filter(r => r.winner === 'att').length;
      const defWins = (w.rounds||[]).filter(r => r.winner === 'def').length;
      if (attWins > defWins * 1.2) {
        w.outcome = 'attacker_wins';
        if (att) att.stability = Math.min(100, att.stability + 15);
        if (def) { def.stability = Math.max(5, def.stability - 25); _ceTransferResources(w.defender, w.attacker, 0.2); }
        _ceLog(w.attacker, `🏆 ${att?.icon}${att?.name} ĐẠI THẮNG — ${def?.icon}${def?.name} thất bại thảm hại!`);
      } else if (defWins > attWins * 1.2) {
        w.outcome = 'defender_wins';
        if (def) def.stability = Math.min(100, def.stability + 15);
        if (att) { att.stability = Math.max(5, att.stability - 25); _ceTransferResources(w.attacker, w.defender, 0.2); }
        _ceLog(w.defender, `🛡️ ${def?.icon}${def?.name} PHÒNG THỦ THÀNH CÔNG — ${att?.name} rút quân!`);
      } else {
        w.outcome = 'stalemate';
        _ceLog(w.attacker, `🤝 Chiến tranh ${att?.name} ↔ ${def?.name} kết thúc bất phân thắng bại.`);
      }
      w.phase = 'ended';
    }
  });

  // 6. Reassign countries periodically
  if (ceState.tickCount % 5 === 0) ceAssignCountries();

  // 7. Auto-events
  if ((ceState.tickCount - ceState.lastAutoTick) >= ceState.autoInterval) {
    ceState.lastAutoTick = ceState.tickCount;
    _ceAutoEvents();
  }

  // 8. Random discoveries
  if (ceState.tickCount % 20 === 0 && Math.random() < 0.4) {
    const cont = ceState.continents[Math.floor(Math.random() * ceState.continents.length)];
    ceDoDiscovery(cont.id);
  }

  // 9. Random catastrophe (very rare)
  if (Math.random() < 0.003) {
    const cat = CONTINENTAL_CATASTROPHES[Math.floor(Math.random() * CONTINENTAL_CATASTROPHES.length)];
    try { cat.effect(); } catch(e) {}
    _ceAddGlobalLog(`🌍 THẢM HỌA THIÊN HẠ: ${cat.icon} ${cat.name} — ${cat.desc}`);
  }

  // 10. Power history snapshot every 25 ticks
  if (ceState.tickCount % 25 === 0) {
    const snapshot = { tick: ceState.tickCount, year: window.year || 0, powers: {} };
    ceState.continents.forEach(c => { snapshot.powers[c.id] = _cePower(c.id, cArr); });
    ceState.powerHistory.push(snapshot);
    if (ceState.powerHistory.length > 100) ceState.powerHistory.shift();
  }
}

function _ceAutoEvents() {
  ceState.continents.forEach(cont => {
    if (Math.random() > 0.3) return;
    const candidates = cont.events.filter(evId => {
      const ev = CONTINENT_EVENTS[evId];
      return ev && !(cont.eventCooldowns[evId] > 0) && !cont.activeEvents.find(e => e.eventId === evId);
    });
    if (candidates.length) {
      const evId = candidates[Math.floor(Math.random() * candidates.length)];
      ceTriggerEvent(cont.id, evId, true);
    }
  });
}

// ─── RENDER ───────────────────────────────────────────────────

let _ceTab = 'overview';
function ceSwitchTab(t) { _ceTab = t; ceRenderPanel(); }

function ceRenderPanel() {
  if (!ceState.initialized) ceInit();
  const el = document.getElementById('panel-continent');
  if (!el) return;

  const ongoingWars    = ceState.wars.filter(w => w.phase === 'ongoing').length;
  const activeDiplo    = ceState.diplo.length;
  const activeRoutes   = ceState.tradeRoutes.length;

  const tabs = [
    { id:'overview',    label:'🗺️ Đại Lục' },
    { id:'wars',        label:`⚔️ Chiến Tranh (${ongoingWars})` },
    { id:'diplo',       label:`🤝 Ngoại Giao (${activeDiplo})` },
    { id:'trade',       label:`💰 Thương Mại (${activeRoutes})` },
    { id:'wonders',     label:'🏛️ Kỳ Quan' },
    { id:'events',      label:'⚡ Sự Kiện' },
    { id:'discoveries', label:`🔍 Khám Phá (${ceState.discoveries.length})` },
    { id:'rankings',    label:'📊 Xếp Hạng' },
    { id:'log',         label:`📜 Sử Ký` },
  ];

  el.innerHTML = `<div style="min-height:100%;background:var(--bg-primary);">
    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,rgba(168,139,250,0.1),rgba(56,189,248,0.05));border-bottom:1px solid var(--border);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
      <div>
        <div style="font-family:var(--font-heading);font-size:22px;color:var(--gold);text-shadow:0 0 20px rgba(250,204,21,0.4);">🌍 Đại Lục Hệ Thống V2</div>
        <div style="font-size:11px;color:var(--white-dim);margin-top:2px;">6 Đại Lục · Ngoại Giao · Thương Mại · Chiến Tranh · Thần Can Thiệp</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button onclick="ceGodCatastrophe()" style="padding:7px 14px;background:linear-gradient(135deg,rgba(248,113,113,0.18),rgba(248,113,113,0.06));border:1px solid rgba(248,113,113,0.4);border-radius:7px;color:var(--red);font-size:12px;cursor:pointer;font-family:var(--font-cjk),serif;">💥 Thảm Họa (300đ)</button>
        <button onclick="ceGodBless()" style="padding:7px 14px;background:linear-gradient(135deg,rgba(250,204,21,0.18),rgba(250,204,21,0.06));border:1px solid rgba(250,204,21,0.4);border-radius:7px;color:var(--gold);font-size:12px;cursor:pointer;font-family:var(--font-cjk),serif;">✨ Ban Phúc (200đ)</button>
        <button onclick="ceGodDiscover()" style="padding:7px 14px;background:linear-gradient(135deg,rgba(74,222,128,0.18),rgba(74,222,128,0.06));border:1px solid rgba(74,222,128,0.4);border-radius:7px;color:var(--jade);font-size:12px;cursor:pointer;font-family:var(--font-cjk),serif;">🔍 Tiết Lộ (150đ)</button>
      </div>
    </div>

    <!-- TABS -->
    <div style="display:flex;gap:2px;padding:10px 16px 0;border-bottom:1px solid var(--border);overflow-x:auto;flex-wrap:nowrap;">
      ${tabs.map(t => {
        const active = _ceTab === t.id;
        return `<button onclick="ceSwitchTab('${t.id}')" style="padding:7px 13px;white-space:nowrap;border-radius:7px 7px 0 0;border:1px solid ${active?'var(--gold)':'transparent'};border-bottom:none;background:${active?'linear-gradient(135deg,rgba(250,204,21,0.12),rgba(250,204,21,0.04))':'transparent'};color:${active?'var(--gold)':'var(--white-dim)'};font-size:12px;cursor:pointer;font-family:var(--font-cjk),serif;margin-bottom:-1px;">${t.label}</button>`;
      }).join('')}
    </div>

    <!-- CONTENT -->
    <div style="padding:16px;">
      ${_ceTab==='overview'    ? _ceRenderOverview()    : ''}
      ${_ceTab==='wars'        ? _ceRenderWars()        : ''}
      ${_ceTab==='diplo'       ? _ceRenderDiplo()       : ''}
      ${_ceTab==='trade'       ? _ceRenderTrade()       : ''}
      ${_ceTab==='wonders'     ? _ceRenderWonders()     : ''}
      ${_ceTab==='events'      ? _ceRenderEvents()      : ''}
      ${_ceTab==='discoveries' ? _ceRenderDiscoveries() : ''}
      ${_ceTab==='rankings'    ? _ceRenderRankings()    : ''}
      ${_ceTab==='log'         ? _ceRenderLog()         : ''}
    </div>
  </div>`;
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────

function _ceRenderOverview() {
  const cArr = (typeof countries !== 'undefined' && Array.isArray(countries)) ? countries : [];
  return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px;">
    ${ceState.continents.map(cont => {
      const war    = ceState.wars.find(w => w.phase==='ongoing' && (w.attacker===cont.id||w.defender===cont.id));
      const evCnt  = cont.activeEvents.length;
      const totPop = (cont.countryIds||[]).reduce((s,cid)=>{ const c=cArr.find(x=>(x.name||x.id)===cid); return s+(c?.population||0); },0);
      const totArmy= (cont.countryIds||[]).reduce((s,cid)=>{ const c=cArr.find(x=>(x.name||x.id)===cid); return s+(c?.army||0); },0);
      const stabC  = (cont.stability||50)>=70?'var(--jade)':(cont.stability||50)>=40?'var(--orange)':'var(--red)';
      const power  = _cePower(cont.id, cArr);
      const allies = ceState.diplo.filter(d => d.typeId==='alliance' && (d.a===cont.id||d.b===cont.id));
      return `<div style="background:var(--bg-card);border:1px solid ${cont.color}33;border-radius:12px;overflow:hidden;position:relative;">
        <div style="height:3px;background:linear-gradient(90deg,${cont.color},transparent);"></div>
        <div style="padding:14px;">
          <!-- Top row -->
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="font-size:30px;filter:drop-shadow(0 0 10px ${cont.color}80);">${cont.icon}</div>
              <div>
                <div style="font-family:var(--font-title);font-size:14px;color:${cont.color};font-weight:700;">${cont.name}</div>
                <div style="font-size:10px;color:var(--white-dim);">${cont.climate} · ${cont.cultureTrait||''}</div>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:3px;align-items:flex-end;">
              ${war?`<span style="font-size:10px;padding:2px 7px;border-radius:999px;background:rgba(248,113,113,0.15);color:var(--red);border:1px solid rgba(248,113,113,0.3);">⚔️ Chiến Tranh</span>`:''}
              ${evCnt?`<span style="font-size:10px;padding:2px 7px;border-radius:999px;background:rgba(192,132,252,0.15);color:var(--purple);border:1px solid rgba(192,132,252,0.3);">⚡ ${evCnt} sự kiện</span>`:''}
              ${cont.wonder?.built?`<span style="font-size:10px;padding:2px 7px;border-radius:999px;background:rgba(250,204,21,0.12);color:var(--gold);border:1px solid rgba(250,204,21,0.3);">🏛️ Kỳ Quan</span>`:''}
            </div>
          </div>

          <!-- Desc -->
          <div style="font-size:11px;color:var(--white-dim);line-height:1.5;margin-bottom:10px;">${cont.desc}</div>

          <!-- Power bar -->
          <div style="margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--white-dim);margin-bottom:3px;"><span>Cường Lực</span><span style="color:${cont.color};font-weight:700;">${power.toLocaleString()}</span></div>
            <div style="height:5px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;">
              <div style="height:100%;width:${Math.min(100,power/5000*100)}%;background:linear-gradient(90deg,${cont.color},${cont.color}88);border-radius:3px;"></div>
            </div>
          </div>

          <!-- Stats grid -->
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-bottom:10px;">
            ${_ceMiniStat('👥',totPop.toLocaleString(),'Dân Số')}
            ${_ceMiniStat('⚔️',totArmy.toLocaleString(),'Quân Đội')}
            ${_ceMiniStat('🏳️',(cont.countryIds?.length||0).toString(),'Thế Lực')}
            ${_ceMiniStat('🧘',(cont.stability||50)+'%','Ổn Định',stabC)}
            ${_ceMiniStat('🤝',allies.length.toString(),'Liên Minh','var(--jade)')}
            ${_ceMiniStat('🔍',(cont.discoveryCount||0).toString(),'Khám Phá','var(--blue)')}
          </div>

          <!-- Hegemon -->
          ${cont.hegemon?`<div style="background:rgba(250,204,21,0.06);border:1px solid rgba(250,204,21,0.2);border-radius:7px;padding:6px 10px;margin-bottom:8px;font-size:11px;color:var(--gold);">👑 Bá Chủ: <b>${cont.hegemon}</b></div>`:`<div style="font-size:11px;color:var(--white-dim);margin-bottom:8px;padding:6px 10px;background:var(--bg-secondary);border-radius:7px;">👑 Chưa có Bá Chủ</div>`}

          <!-- Bonuses -->
          <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:8px;">
            ${Object.entries(cont.bonuses).map(([k,v])=>{
              const label={cultivationMult:'Tu',warMult:'Chiến',econMult:'Kinh',cultureMult:'Văn',birthMult:'Sinh'}[k]||k;
              const col = v>1?'var(--jade)':v<1?'var(--red)':'var(--white-dim)';
              return `<span style="font-size:10px;padding:2px 6px;border-radius:999px;background:${v>1?'rgba(74,222,128,0.1)':'rgba(248,113,113,0.1)'};color:${col};">×${v} ${label}</span>`;
            }).join('')}
          </div>

          <!-- Resources -->
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:4px;margin-bottom:10px;">
            ${[['spiritStones','💎','Linh Thạch'],['ironOre','⚙️','Thiết Khoáng'],['herbs','🌿','Linh Thảo'],['artifacts','📿','Cổ Vật']].map(([k,icon,lbl])=>
              `<div style="background:var(--bg-secondary);border-radius:6px;padding:5px 8px;display:flex;justify-content:space-between;font-size:11px;"><span style="color:var(--white-dim);">${icon} ${lbl}</span><span style="color:${cont.color};font-weight:700;">${Math.floor(cont.resources[k]||0)}</span></div>`
            ).join('')}
          </div>

          <!-- Actions -->
          <div style="display:flex;gap:5px;flex-wrap:wrap;">
            <button onclick="ceActionBuildWonder('${cont.id}')" style="flex:1;padding:6px;border-radius:6px;border:1px solid ${cont.wonder?.built?'var(--border)':cont.color+'77'};background:${cont.wonder?.built?'transparent':`${cont.color}18`};color:${cont.wonder?.built?'var(--white-dim)':cont.color};font-size:11px;cursor:pointer;font-family:var(--font-cjk),serif;">${cont.wonder?.built?`✅ ${cont.wonder?.icon}`:`🔨 Xây ${cont.wonder?.icon||'Kỳ Quan'}`}</button>
            <button onclick="ceShowWarUI('${cont.id}')" style="padding:6px 10px;border-radius:6px;border:1px solid rgba(248,113,113,0.4);background:rgba(248,113,113,0.1);color:var(--red);font-size:11px;cursor:pointer;font-family:var(--font-cjk),serif;">⚔️</button>
            <button onclick="ceActionDiscover('${cont.id}')" style="padding:6px 10px;border-radius:6px;border:1px solid rgba(74,222,128,0.4);background:rgba(74,222,128,0.1);color:var(--jade);font-size:11px;cursor:pointer;font-family:var(--font-cjk),serif;">🔍</button>
          </div>
        </div>
      </div>`;
    }).join('')}
  </div>

  <!-- WAR UI -->
  <div id="ce-war-ui" style="display:none;margin-top:16px;background:var(--bg-card);border:1px solid rgba(248,113,113,0.3);border-radius:12px;padding:16px;">
    <div style="font-family:var(--font-title);font-size:14px;color:var(--red);margin-bottom:12px;">⚔️ Phát Động Lục Địa Chiến Tranh</div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px;">
      <select id="ce-war-att" style="flex:1;padding:7px 10px;border-radius:7px;background:var(--bg-secondary);color:var(--white-main);border:1px solid var(--border);font-size:12px;min-width:120px;">
        ${ceState.continents.map(c=>`<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
      </select>
      <span style="color:var(--red);font-size:16px;font-weight:700;">⚔️</span>
      <select id="ce-war-def" style="flex:1;padding:7px 10px;border-radius:7px;background:var(--bg-secondary);color:var(--white-main);border:1px solid var(--border);font-size:12px;min-width:120px;">
        ${ceState.continents.map(c=>`<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
      </select>
      <button onclick="ceActionLaunchWar()" style="padding:7px 16px;border-radius:7px;border:1px solid rgba(248,113,113,0.5);background:rgba(248,113,113,0.15);color:var(--red);font-size:12px;cursor:pointer;font-family:var(--font-cjk),serif;font-weight:700;">TUYÊN CHIẾN</button>
      <button onclick="document.getElementById('ce-war-ui').style.display='none'" style="padding:7px 10px;border-radius:7px;border:1px solid var(--border);background:transparent;color:var(--white-dim);font-size:12px;cursor:pointer;">✕</button>
    </div>
    <div id="ce-war-msg" style="font-size:11px;min-height:16px;"></div>
  </div>`;
}

function _ceMiniStat(icon, val, label, color = 'var(--white-main)') {
  return `<div style="background:var(--bg-secondary);border-radius:6px;padding:5px;text-align:center;">
    <div style="font-size:11px;color:var(--white-dim);">${icon} ${label}</div>
    <div style="font-size:12px;font-weight:700;color:${color};margin-top:1px;">${val}</div>
  </div>`;
}

// ─── WARS TAB ─────────────────────────────────────────────────

function _ceRenderWars() {
  const ongoing = ceState.wars.filter(w => w.phase === 'ongoing');
  const ended   = ceState.wars.filter(w => w.phase === 'ended').slice(0,20);
  const cn = id => { const c = ceState.continents.find(x=>x.id===id); return c?`${c.icon} ${c.name}`:id; };
  const oc = o => ({ attacker_wins:'🏆 Tấn Công Thắng', defender_wins:'🛡️ Phòng Thủ Thắng', stalemate:'🤝 Bất Phân' })[o]||o;

  return `
  <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
    <div style="flex:1;min-width:280px;">
      <div style="font-family:var(--font-title);font-size:13px;color:var(--red);margin-bottom:10px;letter-spacing:1px;">⚔️ ĐANG DIỄN RA (${ongoing.length})</div>
      ${ongoing.length ? ongoing.map(w => {
        const att  = ceState.continents.find(c=>c.id===w.attacker);
        const def  = ceState.continents.find(c=>c.id===w.defender);
        const pct  = Math.round((1 - w.ticksLeft / w.duration) * 100);
        const aWins= (w.rounds||[]).filter(r=>r.winner==='att').length;
        const dWins= (w.rounds||[]).filter(r=>r.winner==='def').length;
        return `<div style="background:var(--bg-card);border:1px solid rgba(248,113,113,0.25);border-radius:10px;padding:13px;margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div style="font-family:var(--font-title);font-size:13px;color:var(--white-main);">${att?.icon} ${att?.name} <span style="color:var(--red);">⚔️</span> ${def?.icon} ${def?.name}</div>
            <span style="font-size:10px;color:var(--white-dim);">Còn ${w.ticksLeft} tick</span>
          </div>
          <div style="height:5px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;margin-bottom:8px;">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--red),rgba(248,113,113,0.5));border-radius:3px;"></div>
          </div>
          <div style="display:flex;gap:8px;font-size:11px;">
            <span style="color:${att?.color||'var(--red)'};">🔥 Tấn Công: ${aWins} vòng thắng</span>
            <span style="color:var(--white-dim);">|</span>
            <span style="color:${def?.color||'var(--blue)'};">🛡️ Phòng Thủ: ${dWins} vòng thắng</span>
          </div>
        </div>`;
      }).join('') : `<div style="text-align:center;padding:30px;color:var(--white-dim);font-style:italic;">Thiên hạ đang hòa bình.</div>`}
    </div>
    <div style="flex:1;min-width:280px;">
      <div style="font-family:var(--font-title);font-size:13px;color:var(--white-dim);margin-bottom:10px;letter-spacing:1px;">📜 LỊCH SỬ (${ended.length})</div>
      ${ended.map(w => `<div style="display:flex;justify-content:space-between;background:var(--bg-card);border:1px solid var(--border);border-left:3px solid ${w.outcome==='stalemate'?'var(--white-dim)':w.outcome==='attacker_wins'?'var(--red)':'var(--jade)'};border-radius:8px;padding:9px 12px;margin-bottom:6px;">
        <div style="font-size:11px;color:var(--white-dim);">${cn(w.attacker)} ↔ ${cn(w.defender)}</div>
        <div style="font-size:11px;color:var(--white-main);">${oc(w.outcome)}</div>
      </div>`).join('') || `<div style="text-align:center;padding:30px;color:var(--white-dim);font-style:italic;">Chưa có chiến tranh nào kết thúc.</div>`}
    </div>
  </div>
  <!-- Launch war panel -->
  <div style="background:var(--bg-card);border:1px solid rgba(248,113,113,0.25);border-radius:10px;padding:14px;">
    <div style="font-family:var(--font-title);font-size:13px;color:var(--red);margin-bottom:10px;">⚔️ Phát Động Chiến Tranh</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
      <select id="ce-war-att2" style="flex:1;padding:7px 10px;border-radius:7px;background:var(--bg-secondary);color:var(--white-main);border:1px solid var(--border);font-size:12px;">
        ${ceState.continents.map(c=>`<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
      </select>
      <span style="color:var(--red);font-size:14px;">⚔️</span>
      <select id="ce-war-def2" style="flex:1;padding:7px 10px;border-radius:7px;background:var(--bg-secondary);color:var(--white-main);border:1px solid var(--border);font-size:12px;">
        ${ceState.continents.map(c=>`<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
      </select>
      <button onclick="ceActionLaunchWar2()" style="padding:7px 16px;border-radius:7px;border:1px solid rgba(248,113,113,0.5);background:rgba(248,113,113,0.15);color:var(--red);font-size:12px;cursor:pointer;font-family:var(--font-cjk),serif;font-weight:700;">TUYÊN CHIẾN</button>
    </div>
    <div id="ce-war-msg2" style="font-size:11px;margin-top:8px;min-height:16px;"></div>
  </div>`;
}

// ─── DIPLOMACY TAB ────────────────────────────────────────────

function _ceRenderDiplo() {
  const getName = id => { const c = ceState.continents.find(x=>x.id===id); return c?`${c.icon} ${c.name}`:id; };
  return `
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
    <!-- Current Relations -->
    <div>
      <div style="font-family:var(--font-title);font-size:13px;color:var(--gold);margin-bottom:10px;letter-spacing:1px;">📋 QUAN HỆ HIỆN TẠI (${ceState.diplo.length})</div>
      ${ceState.diplo.length ? ceState.diplo.map(d => {
        const def = DIPLO_TYPES[d.typeId] || {};
        const remaining = d.duration ? Math.max(0, d.duration - (ceState.tickCount - d.startTick)) : '∞';
        return `<div style="background:var(--bg-card);border:1px solid ${def.color||'var(--border)'}33;border-radius:9px;padding:11px;margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
            <div style="font-size:13px;">${def.icon||'🤝'} <span style="color:${def.color||'var(--white-main)'};font-weight:600;">${def.name}</span></div>
            <button onclick="ceActionBreakDiplo('${d.id}')" style="padding:2px 8px;border-radius:5px;border:1px solid rgba(248,113,113,0.3);background:rgba(248,113,113,0.08);color:var(--red);font-size:10px;cursor:pointer;">Hủy</button>
          </div>
          <div style="font-size:11px;color:var(--white-dim);">${getName(d.a)} ↔ ${getName(d.b)}</div>
          <div style="font-size:10px;color:var(--white-dim);margin-top:3px;">Còn lại: ${remaining} tick</div>
        </div>`;
      }).join('') : `<div style="text-align:center;padding:30px;color:var(--white-dim);font-style:italic;">Chưa có quan hệ ngoại giao.</div>`}
    </div>

    <!-- Create Diplomacy -->
    <div>
      <div style="font-family:var(--font-title);font-size:13px;color:var(--gold);margin-bottom:10px;letter-spacing:1px;">✍️ KÝ KẾT QUAN HỆ</div>
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px;">
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div>
            <div style="font-size:11px;color:var(--white-dim);margin-bottom:4px;">Loại Quan Hệ</div>
            <select id="ce-diplo-type" style="width:100%;padding:7px 10px;border-radius:7px;background:var(--bg-secondary);color:var(--white-main);border:1px solid var(--border);font-size:12px;cursor:pointer;">
              ${Object.entries(DIPLO_TYPES).map(([k,v])=>`<option value="${k}">${v.icon} ${v.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <div style="font-size:11px;color:var(--white-dim);margin-bottom:4px;">Đại Lục A</div>
            <select id="ce-diplo-a" style="width:100%;padding:7px 10px;border-radius:7px;background:var(--bg-secondary);color:var(--white-main);border:1px solid var(--border);font-size:12px;cursor:pointer;">
              ${ceState.continents.map(c=>`<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <div style="font-size:11px;color:var(--white-dim);margin-bottom:4px;">Đại Lục B</div>
            <select id="ce-diplo-b" style="width:100%;padding:7px 10px;border-radius:7px;background:var(--bg-secondary);color:var(--white-main);border:1px solid var(--border);font-size:12px;cursor:pointer;">
              ${ceState.continents.map(c=>`<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
            </select>
          </div>
          <button onclick="ceActionMakeDiplo()" style="padding:9px;border-radius:7px;border:1px solid rgba(250,204,21,0.4);background:rgba(250,204,21,0.1);color:var(--gold);font-size:12px;cursor:pointer;font-family:var(--font-cjk),serif;font-weight:700;">🤝 Ký Kết</button>
          <div id="ce-diplo-msg" style="font-size:11px;min-height:16px;"></div>
        </div>
        <!-- Type descriptions -->
        <div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border);">
          ${Object.values(DIPLO_TYPES).map(v=>`<div style="font-size:10px;color:var(--white-dim);margin-bottom:4px;">${v.icon} <b style="color:${v.color};">${v.name}</b> — ${v.desc}</div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

// ─── TRADE TAB ────────────────────────────────────────────────

function _ceRenderTrade() {
  const getName = id => { const c = ceState.continents.find(x=>x.id===id); return c?`${c.icon} ${c.name}`:id; };
  return `
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
    <div>
      <div style="font-family:var(--font-title);font-size:13px;color:var(--gold);margin-bottom:10px;letter-spacing:1px;">🛤️ TUYẾN THƯƠNG MẠI (${ceState.tradeRoutes.length})</div>
      ${ceState.tradeRoutes.length ? ceState.tradeRoutes.map(r => {
        const from = ceState.continents.find(c=>c.id===r.from);
        const to   = ceState.continents.find(c=>c.id===r.to);
        return `<div style="background:var(--bg-card);border:1px solid rgba(250,204,21,0.2);border-radius:9px;padding:11px;margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:12px;color:var(--white-main);">${from?.icon} ${from?.name} → ${to?.icon} ${to?.name}</div>
              <div style="font-size:11px;color:var(--gold);margin-top:3px;">💰 ${r.good} · ${r.volume} đơn vị/tick</div>
            </div>
            <button onclick="ceActionRemoveTrade('${r.id}')" style="padding:2px 8px;border-radius:5px;border:1px solid rgba(248,113,113,0.3);background:rgba(248,113,113,0.08);color:var(--red);font-size:10px;cursor:pointer;">Hủy</button>
          </div>
        </div>`;
      }).join('') : `<div style="text-align:center;padding:30px;color:var(--white-dim);font-style:italic;">Chưa có tuyến thương mại.</div>`}

      <!-- Trade goods list -->
      <div style="margin-top:16px;">
        <div style="font-family:var(--font-title);font-size:12px;color:var(--white-dim);margin-bottom:8px;letter-spacing:1px;">📦 HÀNG HÓA ĐẶC SẢN</div>
        ${ceState.continents.map(c=>`<div style="background:var(--bg-card);border:1px solid ${c.color}22;border-radius:7px;padding:8px 11px;margin-bottom:5px;display:flex;gap:8px;align-items:center;font-size:11px;">
          <span style="font-size:14px;">${c.icon}</span>
          <span style="color:${c.color};font-weight:600;">${c.name}</span>
          <span style="color:var(--white-dim);">— ${(c.tradeGoods||[]).join(', ')}</span>
        </div>`).join('')}
      </div>
    </div>

    <div>
      <div style="font-family:var(--font-title);font-size:13px;color:var(--gold);margin-bottom:10px;letter-spacing:1px;">🤝 MỞ TUYẾN THƯƠNG MẠI</div>
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px;">
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div>
            <div style="font-size:11px;color:var(--white-dim);margin-bottom:4px;">Từ Đại Lục</div>
            <select id="ce-trade-from" style="width:100%;padding:7px 10px;border-radius:7px;background:var(--bg-secondary);color:var(--white-main);border:1px solid var(--border);font-size:12px;cursor:pointer;">
              ${ceState.continents.map(c=>`<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <div style="font-size:11px;color:var(--white-dim);margin-bottom:4px;">Đến Đại Lục</div>
            <select id="ce-trade-to" style="width:100%;padding:7px 10px;border-radius:7px;background:var(--bg-secondary);color:var(--white-main);border:1px solid var(--border);font-size:12px;cursor:pointer;">
              ${ceState.continents.map(c=>`<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
            </select>
          </div>
          <button onclick="ceActionMakeTrade()" style="padding:9px;border-radius:7px;border:1px solid rgba(250,204,21,0.4);background:rgba(250,204,21,0.1);color:var(--gold);font-size:12px;cursor:pointer;font-family:var(--font-cjk),serif;font-weight:700;">🛤️ Mở Tuyến Thương Mại</button>
          <div id="ce-trade-msg" style="font-size:11px;min-height:16px;"></div>
        </div>
      </div>

      <!-- Manual resource transfer -->
      <div style="margin-top:14px;background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px;">
        <div style="font-family:var(--font-title);font-size:12px;color:var(--gold);margin-bottom:10px;letter-spacing:1px;">💸 CHUYỂN TÀI NGUYÊN</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <select id="ce-xfer-from" style="width:100%;padding:7px;border-radius:7px;background:var(--bg-secondary);color:var(--white-main);border:1px solid var(--border);font-size:12px;cursor:pointer;">
            ${ceState.continents.map(c=>`<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
          </select>
          <span style="text-align:center;color:var(--white-dim);font-size:12px;">→ Chuyển 20% →</span>
          <select id="ce-xfer-to" style="width:100%;padding:7px;border-radius:7px;background:var(--bg-secondary);color:var(--white-main);border:1px solid var(--border);font-size:12px;cursor:pointer;">
            ${ceState.continents.map(c=>`<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
          </select>
          <button onclick="ceActionTransfer()" style="padding:9px;border-radius:7px;border:1px solid rgba(96,165,250,0.4);background:rgba(96,165,250,0.1);color:var(--blue);font-size:12px;cursor:pointer;font-family:var(--font-cjk),serif;">💸 Thực Hiện</button>
          <div id="ce-xfer-msg" style="font-size:11px;min-height:16px;"></div>
        </div>
      </div>
    </div>
  </div>`;
}

// ─── WONDERS TAB ──────────────────────────────────────────────

function _ceRenderWonders() {
  return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:12px;">
    ${ceState.continents.map(cont => {
      const w = cont.wonder;
      return `<div style="background:var(--bg-card);border:1px solid ${cont.color}${w.built?'66':'22'};border-radius:12px;padding:16px;${w.built?`box-shadow:0 0 20px ${cont.color}22`:''};position:relative;overflow:hidden;">
        ${w.built?`<div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,${cont.color},transparent);"></div>`:''}
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <span style="font-size:36px;filter:${w.built?`drop-shadow(0 0 12px ${cont.color})`:'none'};">${w.icon}</span>
          <div>
            <div style="font-family:var(--font-title);font-size:15px;color:${w.built?'var(--gold)':cont.color};font-weight:700;">${w.name}</div>
            <div style="font-size:11px;color:var(--white-dim);">${cont.icon} ${cont.name}</div>
          </div>
        </div>
        <p style="font-size:11px;color:var(--white-dim);line-height:1.6;margin-bottom:12px;">${w.desc}</p>
        ${!w.built ? `<div style="font-size:11px;color:var(--white-dim);margin-bottom:6px;">Chi phí xây dựng:</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">
          ${Object.entries(w.cost).map(([k,v])=>{
            const icons={spiritStones:'💎',ironOre:'⚙️',herbs:'🌿',artifacts:'📿'};
            const have = Math.floor(cont.resources[k]||0);
            const ok   = have >= v;
            return `<span style="font-size:11px;padding:3px 9px;border-radius:999px;background:${ok?'rgba(74,222,128,0.12)':'rgba(248,113,113,0.12)'};color:${ok?'var(--jade)':'var(--red)'};border:1px solid ${ok?'rgba(74,222,128,0.3)':'rgba(248,113,113,0.3)'};">${icons[k]} ${v} <span style="opacity:0.6;">(có ${have})</span></span>`;
          }).join('')}
        </div>` : `<div style="font-size:11px;color:var(--gold);margin-bottom:10px;font-weight:600;padding:6px 10px;background:rgba(250,204,21,0.08);border-radius:6px;">✅ ĐÃ XÂY DỰNG — Buff Vĩnh Viễn Hoạt Động</div>`}
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px;">
          ${Object.entries(w.bonus).map(([k,v])=>{
            const label={cultivationMult:'Tu Luyện',warMult:'Chiến Tranh',econMult:'Kinh Tế',cultureMult:'Văn Hóa'}[k]||k;
            return `<span style="font-size:11px;padding:3px 9px;border-radius:999px;background:rgba(74,222,128,0.1);color:var(--jade);border:1px solid rgba(74,222,128,0.25);">+${Math.round(v*100)}% ${label}</span>`;
          }).join('')}
        </div>
        ${!w.built ? `<button onclick="ceActionBuildWonder('${cont.id}')" style="width:100%;padding:9px;border-radius:8px;border:1px solid ${cont.color}55;background:${cont.color}18;color:${cont.color};font-size:12px;cursor:pointer;font-family:var(--font-cjk),serif;font-weight:700;">🔨 Xây Dựng Kỳ Quan</button>` : ''}
      </div>`;
    }).join('')}
  </div>`;
}

// ─── EVENTS TAB ───────────────────────────────────────────────

function _ceRenderEvents() {
  return `<div>
    <div style="font-size:11px;color:var(--white-dim);margin-bottom:14px;">Kích hoạt sự kiện đặc trưng của từng đại lục. AI cũng tự động trigger 30% mỗi chu kỳ 12 tick.</div>
    ${ceState.continents.map(cont => `
    <div style="margin-bottom:16px;background:var(--bg-card);border:1px solid ${cont.color}22;border-radius:10px;padding:12px;">
      <div style="font-family:var(--font-title);font-size:13px;color:${cont.color};margin-bottom:10px;display:flex;align-items:center;gap:6px;">
        <span>${cont.icon}</span><span>${cont.name}</span>
        ${cont.activeEvents.length?`<span style="margin-left:auto;font-size:10px;padding:2px 8px;border-radius:999px;background:rgba(192,132,252,0.15);color:var(--purple);border:1px solid rgba(192,132,252,0.3);">⚡ ${cont.activeEvents.length} đang hoạt động</span>`:''}
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:7px;">
        ${cont.events.map(evId => {
          const ev  = CONTINENT_EVENTS[evId] || {};
          const act = cont.activeEvents.find(e => e.eventId === evId);
          const cd  = cont.eventCooldowns[evId] || 0;
          return `<div style="background:var(--bg-secondary);border:1px solid ${act?cont.color+'55':'var(--border)'};border-radius:8px;padding:10px;">
            <div style="font-size:18px;margin-bottom:4px;">${ev.icon||'❓'}</div>
            <div style="font-size:11px;font-weight:600;color:${cont.color};margin-bottom:3px;">${ev.name||evId}</div>
            <div style="font-size:10px;color:var(--white-dim);margin-bottom:6px;line-height:1.3;">${(ev.desc||'').slice(0,55)}${(ev.desc||'').length>55?'…':''}</div>
            <div style="font-size:10px;color:${act?'var(--jade)':cd>0?'var(--orange)':'var(--white-dim)'};margin-bottom:5px;">${act?`🟢 Còn ${act.ticksLeft}`:cd>0?`⏳ CD: ${cd}`:'✅ Sẵn Sàng'}</div>
            <button onclick="ceActionTriggerEvent('${cont.id}','${evId}')" style="width:100%;padding:5px;border-radius:6px;border:1px solid ${act?'var(--border)':cont.color+'55'};background:${act?'transparent':`${cont.color}18`};color:${act?'var(--white-dim)':cont.color};font-size:10px;cursor:pointer;font-family:var(--font-cjk),serif;">${act?'Đang Xảy Ra':'Kích Hoạt'}</button>
          </div>`;
        }).join('')}
      </div>
    </div>`).join('')}
  </div>`;
}

// ─── DISCOVERIES TAB ──────────────────────────────────────────

function _ceRenderDiscoveries() {
  const sorted = [...ceState.discoveries].sort((a,b) => (b.tick||0) - (a.tick||0));
  return `<div>
    <div style="font-size:11px;color:var(--white-dim);margin-bottom:14px;">Những bí mật và kỳ tích được khám phá theo thời gian. Tự động xảy ra và có thể kích hoạt thủ công.</div>
    ${sorted.length ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;">
      ${sorted.map(d => {
        const cont = ceState.continents.find(c=>c.id===d.continentId);
        return `<div style="background:var(--bg-card);border:1px solid ${cont?.color||'var(--border)'}33;border-radius:10px;padding:13px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <span style="font-size:26px;">${d.icon}</span>
            <div>
              <div style="font-family:var(--font-title);font-size:13px;color:var(--white-main);">${d.name}</div>
              <div style="font-size:10px;color:${cont?.color||'var(--white-dim)'};">${cont?.icon} ${cont?.name} · Năm ${d.year||0}</div>
            </div>
          </div>
          <div style="font-size:11px;color:var(--white-dim);line-height:1.5;">${d.desc}</div>
        </div>`;
      }).join('')}
    </div>` : `<div style="text-align:center;padding:50px;color:var(--white-dim);font-style:italic;">Chưa có khám phá nào. Bấm 🔍 trên mỗi đại lục hoặc dùng "Tiết Lộ" ở trên.</div>`}
  </div>`;
}

// ─── RANKINGS TAB ─────────────────────────────────────────────

function _ceRenderRankings() {
  const cArr = (typeof countries !== 'undefined' && Array.isArray(countries)) ? countries : [];
  const ranked = [...ceState.continents]
    .map(c => ({ ...c, power: _cePower(c.id, cArr) }))
    .sort((a,b) => b.power - a.power);
  const maxPow = ranked[0]?.power || 1;

  const last5 = ceState.powerHistory.slice(-5);
  return `<div>
    <div style="font-family:var(--font-title);font-size:13px;color:var(--gold);margin-bottom:14px;letter-spacing:1px;">🏆 BẢNG XẾP HẠNG CƯỜNG QUỐC</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px;">
      ${ranked.map((c,i) => {
        const pct = Math.round(c.power / maxPow * 100);
        const medals = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣'];
        const allies = ceState.diplo.filter(d=>d.typeId==='alliance'&&(d.a===c.id||d.b===c.id)).length;
        return `<div style="background:var(--bg-card);border:1px solid ${c.color}33;border-radius:10px;padding:12px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <span style="font-size:20px;">${medals[i]||''}</span>
            <span style="font-size:22px;">${c.icon}</span>
            <div style="flex:1;">
              <div style="font-family:var(--font-title);font-size:13px;color:${c.color};">${c.name}</div>
              <div style="font-size:10px;color:var(--white-dim);">${c.cultureTrait} · ${allies} liên minh${c.wonder?.built?' · 🏛️ Kỳ Quan':''}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:16px;font-weight:700;color:${c.color};font-family:var(--font-heading);">${c.power.toLocaleString()}</div>
              <div style="font-size:10px;color:var(--white-dim);">cường lực</div>
            </div>
          </div>
          <div style="height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,${c.color},${c.color}66);border-radius:3px;transition:width 0.5s;"></div>
          </div>
        </div>`;
      }).join('')}
    </div>

    ${last5.length > 1 ? `<div style="font-family:var(--font-title);font-size:13px;color:var(--gold);margin-bottom:10px;letter-spacing:1px;">📈 LỊCH SỬ CƯỜNG LỰC</div>
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px;overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        <thead>
          <tr>
            <th style="text-align:left;color:var(--white-dim);padding:4px 8px;border-bottom:1px solid var(--border);">Năm</th>
            ${ceState.continents.map(c=>`<th style="color:${c.color};padding:4px 8px;border-bottom:1px solid var(--border);">${c.icon}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${last5.map(snap=>`<tr>
            <td style="color:var(--white-dim);padding:4px 8px;">${snap.year||snap.tick}</td>
            ${ceState.continents.map(c=>`<td style="color:${c.color};padding:4px 8px;text-align:center;">${((snap.powers||{})[c.id]||0).toLocaleString()}</td>`).join('')}
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : `<div style="text-align:center;padding:30px;color:var(--white-dim);font-style:italic;">Lịch sử cường lực sẽ xuất hiện sau 25 tick.</div>`}
  </div>`;
}

// ─── LOG TAB ──────────────────────────────────────────────────

function _ceRenderLog() {
  if (!ceState.globalLog.length) return `<div style="text-align:center;padding:50px;color:var(--white-dim);font-style:italic;">Lịch sử đại lục trống.</div>`;
  const searchVal = (document.getElementById('ce-log-search')?.value || '').toLowerCase();
  const filteredLog = searchVal
    ? ceState.globalLog.filter(e => e.msg.toLowerCase().includes(searchVal))
    : ceState.globalLog;

  return `<div>
    <div style="display:flex;gap:8px;margin-bottom:12px;">
      <input id="ce-log-search" type="text" placeholder="🔍 Tìm kiếm sử ký..." oninput="ceRenderPanel()"
        style="flex:1;background:var(--bg-card);border:1px solid var(--border);border-radius:7px;color:var(--white-main);font-family:var(--font-cjk),serif;font-size:12px;padding:7px 12px;outline:none;">
      <button onclick="document.getElementById('ce-log-search').value='';ceRenderPanel();" style="padding:7px 12px;border-radius:7px;border:1px solid var(--border);background:transparent;color:var(--white-dim);font-size:12px;cursor:pointer;">✕</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;">
      ${filteredLog.slice(0,80).map(entry => {
        const cont = ceState.continents.find(c => c.id === entry.continent);
        return `<div style="display:flex;gap:8px;padding:8px 12px;background:var(--bg-card);border-left:3px solid ${cont?.color||'var(--border)'};border-radius:6px;align-items:flex-start;">
          <span style="font-size:14px;flex-shrink:0;">${cont?.icon||'🌍'}</span>
          <div style="flex:1;min-width:0;">
            <div style="font-size:10px;color:var(--white-dim);margin-bottom:2px;">${cont?.name||'Thiên Hạ'} · Năm ${entry.year||entry.tick}</div>
            <div style="font-size:12px;color:var(--white-main);">${entry.msg}</div>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

// ─── GOD ACTIONS ──────────────────────────────────────────────

window.ceGodCatastrophe = function() {
  if ((window.heavenPoints || 0) < 300) { alert('Cần 300 Thiên Đạo Điểm!'); return; }
  const cat = CONTINENTAL_CATASTROPHES.filter(c => c.severity !== 'blessing')[Math.floor(Math.random() * 4)];
  if (!cat) return;
  window.heavenPoints -= 300;
  try { cat.effect(); } catch(e) {}
  _ceAddGlobalLog(`🌍 THIÊN ĐẠO CAN THIỆP: ${cat.icon} ${cat.name} — ${cat.desc}`);
  if (typeof window.updateUI === 'function') window.updateUI();
  alert(`${cat.icon} ${cat.name} đã được phát động!\n${cat.desc}`);
  ceRenderPanel();
};

window.ceGodBless = function() {
  if ((window.heavenPoints || 0) < 200) { alert('Cần 200 Thiên Đạo Điểm!'); return; }
  window.heavenPoints -= 200;
  const gold = CONTINENTAL_CATASTROPHES.find(c => c.id === 'golden_meteor');
  if (gold) { try { gold.effect(); } catch(e) {} }
  else ceState.continents.forEach(c => { Object.keys(c.resources).forEach(k => c.resources[k] = (c.resources[k]||0) + 80); c.stability = Math.min(100, c.stability + 10); });
  _ceAddGlobalLog('✨ Thiên Đạo Ban Phúc — Toàn Thiên Hạ Được Hưởng Ân Huệ!');
  if (typeof window.updateUI === 'function') window.updateUI();
  ceRenderPanel();
};

window.ceGodDiscover = function() {
  if ((window.heavenPoints || 0) < 150) { alert('Cần 150 Thiên Đạo Điểm!'); return; }
  window.heavenPoints -= 150;
  const cont = ceState.continents[Math.floor(Math.random() * ceState.continents.length)];
  const disc = ceDoDiscovery(cont.id);
  if (typeof window.updateUI === 'function') window.updateUI();
  alert(disc ? `🔍 Khám Phá: ${disc.icon} ${disc.name}\n${disc.desc}` : 'Không tìm thấy gì thêm!');
  ceRenderPanel();
};

// ─── CALLBACKS ────────────────────────────────────────────────

window.ceSwitchTab = ceSwitchTab;

window.ceShowWarUI = function(continentId) {
  const ui = document.getElementById('ce-war-ui');
  if (!ui) return;
  ui.style.display = ui.style.display === 'none' ? 'block' : 'none';
  const sel = document.getElementById('ce-war-att');
  if (sel) sel.value = continentId;
};

window.ceActionBuildWonder = function(continentId) {
  const r = ceBuildWonder(continentId);
  const msg = r.ok ? `✅ Kỳ Quan hoàn thành!` : `⚠️ ${r.msg}`;
  if (!r.ok) alert(msg);
  setTimeout(() => { ceRenderPanel(); if (r.ok) ceSwitchTab('wonders'); }, 200);
};

window.ceActionLaunchWar = function() {
  const att = document.getElementById('ce-war-att')?.value;
  const def = document.getElementById('ce-war-def')?.value;
  const msgEl = document.getElementById('ce-war-msg');
  const r = ceLaunchWar(att, def);
  if (msgEl) { msgEl.style.color = r.ok ? 'var(--jade)' : 'var(--red)'; msgEl.textContent = r.ok ? '⚔️ Tuyên chiến thành công!' : `⚠️ ${r.msg}`; }
  if (r.ok) setTimeout(() => { ceRenderPanel(); ceSwitchTab('wars'); }, 400);
};

window.ceActionLaunchWar2 = function() {
  const att = document.getElementById('ce-war-att2')?.value;
  const def = document.getElementById('ce-war-def2')?.value;
  const msgEl = document.getElementById('ce-war-msg2');
  const r = ceLaunchWar(att, def);
  if (msgEl) { msgEl.style.color = r.ok ? 'var(--jade)' : 'var(--red)'; msgEl.textContent = r.ok ? '⚔️ Tuyên chiến thành công!' : `⚠️ ${r.msg}`; }
  if (r.ok) setTimeout(ceRenderPanel, 400);
};

window.ceActionMakeDiplo = function() {
  const typeId = document.getElementById('ce-diplo-type')?.value;
  const aId    = document.getElementById('ce-diplo-a')?.value;
  const bId    = document.getElementById('ce-diplo-b')?.value;
  const msgEl  = document.getElementById('ce-diplo-msg');
  const r = ceMakeDiplo(typeId, aId, bId);
  if (msgEl) { msgEl.style.color = r.ok ? 'var(--jade)' : 'var(--red)'; msgEl.textContent = r.ok ? '✅ Ký kết thành công!' : `⚠️ ${r.msg}`; }
  if (r.ok) setTimeout(ceRenderPanel, 400);
};

window.ceActionBreakDiplo = function(id) {
  const r = ceBreakDiplo(id);
  if (!r.ok) alert(`⚠️ ${r.msg}`);
  else ceRenderPanel();
};

window.ceActionMakeTrade = function() {
  const from  = document.getElementById('ce-trade-from')?.value;
  const to    = document.getElementById('ce-trade-to')?.value;
  const msgEl = document.getElementById('ce-trade-msg');
  const r = ceMakeTradeRoute(from, to);
  if (msgEl) { msgEl.style.color = r.ok ? 'var(--jade)' : 'var(--red)'; msgEl.textContent = r.ok ? '✅ Tuyến thương mại mở thành công!' : `⚠️ ${r.msg}`; }
  if (r.ok) setTimeout(ceRenderPanel, 400);
};

window.ceActionRemoveTrade = function(id) {
  ceState.tradeRoutes = ceState.tradeRoutes.filter(r => r.id !== id);
  ceRenderPanel();
};

window.ceActionTransfer = function() {
  const from  = document.getElementById('ce-xfer-from')?.value;
  const to    = document.getElementById('ce-xfer-to')?.value;
  const msgEl = document.getElementById('ce-xfer-msg');
  if (from === to) { if (msgEl) { msgEl.style.color = 'var(--red)'; msgEl.textContent = '⚠️ Chọn 2 đại lục khác nhau!'; } return; }
  _ceTransferResources(from, to, 0.2);
  const f = ceState.continents.find(c=>c.id===from);
  const t = ceState.continents.find(c=>c.id===to);
  if (msgEl) { msgEl.style.color = 'var(--jade)'; msgEl.textContent = `✅ Chuyển 20% tài nguyên từ ${f?.name} → ${t?.name}`; }
  setTimeout(ceRenderPanel, 400);
};

window.ceActionDiscover = function(continentId) {
  const disc = ceDoDiscovery(continentId);
  if (disc) { alert(`🔍 Khám Phá Mới!\n${disc.icon} ${disc.name}\n${disc.desc}`); ceRenderPanel(); }
  else alert('Không còn gì để khám phá ở đây hiện tại!');
};

window.ceActionTriggerEvent = function(continentId, eventId) {
  const r = ceTriggerEvent(continentId, eventId, true);
  if (!r.ok && typeof addLog === 'function') addLog(`[Đại Lục] ⚠️ ${r.msg}`);
  setTimeout(ceRenderPanel, 150);
};

// ─── EXPOSE GLOBALS ───────────────────────────────────────────

window.ceTick            = ceTick;
window.ceRenderPanel     = ceRenderPanel;
window.ceInit            = ceInit;
window.ceState           = ceState;
window.ceAssignCountries = ceAssignCountries;

// ─── HOOK INTO MAIN TICK ──────────────────────────────────────

(function ceHookTick() {
  const tryHook = () => {
    if (typeof window.simulateWorld === 'function' && !window._ceSimHooked) {
      window._ceSimHooked = true;
      const _orig = window.simulateWorld;
      window.simulateWorld = function() {
        _orig.apply(this, arguments);
        try { ceTick(); } catch(e) {}
      };
    }
    // Also try advanceTime as backup
    if (typeof window.advanceTime === 'function' && !window._ceTickHooked) {
      window._ceTickHooked = true;
      const _oa = window.advanceTime;
      window.advanceTime = function() {
        _oa.apply(this, arguments);
        try { if (!window._ceSimHooked) ceTick(); } catch(e) {}
      };
    }
  };
  tryHook();
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(tryHook, 2000);
    // Fallback interval
    setInterval(() => { try { if (!window._ceSimHooked && !window._ceTickHooked) ceTick(); } catch(e){} }, 6000);
  });
})();

// ─── AUTO-INIT ────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => setTimeout(ceInit, 1200));

console.log('[ContinentEngine V2] 🌍 Đại Lục Hệ Thống V2 khởi động — 6 Đại Lục · 30 Sự Kiện · Ngoại Giao · Thương Mại · Chiến Tranh Nhiều Vòng · Thần Can Thiệp ✓');
