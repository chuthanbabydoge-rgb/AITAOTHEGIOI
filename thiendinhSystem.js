// ============================
// GENRE-ADAPTIVE HEAVEN CONFIG
// ============================
const GENRE_HEAVEN_CONFIG = {
  cultivation: {
    systemName:   "Thiên Đình",
    systemIcon:   "🏛️",
    leaderTitle:  "Thiên Đế",
    leaderSub:    "天帝",
    currency:     "Thiên Đạo Điểm",
    ascendWord:   "Thăng Thiên",
    ascendCondition: "Chân Tiên",
    lawWord:      "Thiên Lệnh",
    memberWord:   "tiên",
    ranks: [
      { id:"thien_de",    name:"Thiên Đế",   title:"天帝", icon:"👑", authority:"Chúa tể Thiên Đình, quyền năng vô thượng",     powerAbility:"Thiên Đế Lệnh — ra lệnh cho vạn tiên" },
      { id:"thien_ton",   name:"Thiên Tôn",  title:"天尊", icon:"⭐", authority:"Phó Thiên Đế, cai quản tam giới",              powerAbility:"Thiên Tôn Pháp Lệnh — kiểm soát luật trời" },
      { id:"thien_quan",  name:"Thiên Quân", title:"天君", icon:"🌟", authority:"Cai quản một phương thiên đình",               powerAbility:"Thiên Quân Phán Quyết — xét xử tu sĩ" },
      { id:"thien_tuong", name:"Thiên Tướng",title:"天將", icon:"⚔️", authority:"Thống lĩnh Thiên Binh, canh giữ thiên môn",   powerAbility:"Thiên Lôi Trảm — xử phạt kẻ phạm thiên luật" },
      { id:"thien_su",    name:"Thiên Sứ",   title:"天使", icon:"🕊️", authority:"Sứ giả của Thiên Đình, truyền đạt thiên ý",  powerAbility:"Thiên Thư Truyền Lệnh — mang mệnh lệnh thiên đình" },
    ],
    path: [
      { stage:0, name:"Phàm Nhân",            icon:"🚶", desc:"Chưa bước vào đường tu tiên" },
      { stage:1, name:"Sơ Ngộ Thiên Cơ",      icon:"🌱", desc:"Bắt đầu hiểu được đạo lý thiên nhiên" },
      { stage:2, name:"Ngộ Đạo",              icon:"🌿", desc:"Thấu hiểu quy luật thiên nhiên" },
      { stage:3, name:"Hòa Thiên",            icon:"🍃", desc:"Hòa mình vào thiên đạo" },
      { stage:4, name:"Thuận Thiên",          icon:"🌊", desc:"Thuận theo mệnh trời, không trái đạo" },
      { stage:5, name:"Thiên Nhân Hợp Nhất",  icon:"☁️", desc:"Người với trời hòa làm một" },
      { stage:6, name:"Vô Vi",                icon:"🌸", desc:"Đạt cảnh vô vi, thuận tự nhiên" },
      { stage:7, name:"Thủy Tiên",            icon:"💫", desc:"Thủy tiên hiển thế, trước bước thành tiên" },
      { stage:8, name:"Chân Tiên Siêu Thăng", icon:"✨", desc:"Thành chân tiên, rời cõi phàm lên Thiên Đình" },
    ],
    powers: [
      { id:"tien_ban",    name:"Tiên Ban Hạ Phàm",  icon:"🌤️", cost:500,  desc:"Phái tiên xuống thế giới phàm trần thực hiện nhiệm vụ", effect:"dispatch" },
      { id:"thien_kep",   name:"Thiên Kiếp Giáng",  icon:"⚡",  cost:300,  desc:"Giáng thiên kiếp xuống kẻ phạm thiên luật",            effect:"calamity" },
      { id:"thien_phuoc", name:"Thiên Phúc Tứ Ân",  icon:"🌟",  cost:400,  desc:"Ban phúc lành cho tu sĩ có duyên với thiên đình",       effect:"bless"    },
      { id:"phong_than",  name:"Phong Thần Lập Vị",  icon:"👑",  cost:800,  desc:"Phong thần vị cho tu sĩ Chân Tiên xuất sắc",           effect:"appoint"  },
      { id:"tien_dan",    name:"Thiên Tứ Tiên Đan",  icon:"💊",  cost:600,  desc:"Ban tiên đan giúp tu sĩ đột phá lên cảnh giới cao",    effect:"elixir"   },
      { id:"thien_thu",   name:"Thiên Thu Vạn Cổ",   icon:"📜",  cost:1000, desc:"Ghi danh vào Thiên Thư Bất Tử, bất diệt vĩnh hằng",   effect:"immortal" },
    ],
    undead: [
      { id:"ma_tien",  name:"Ma Tiên",      icon:"👻", color:"#94a3b8", desc:"Tiên bị hóa ma, bán sống bán chết" },
      { id:"gui_tien", name:"Quỷ Tiên",     icon:"💀", color:"#c084fc", desc:"Quỷ vực chân tiên, âm khí ngập trời" },
      { id:"bat_tu",   name:"Bất Tử Thần",  icon:"☠️", color:"#f97316", desc:"Siêu việt sinh tử, tồn tại vĩnh hằng" },
      { id:"thien_ma", name:"Thiên Ma",     icon:"🌑", color:"#f87171", desc:"Ma đạo đỉnh phong, sánh với Thiên Đế" },
    ],
    decrees: [
      "Thiên Đình ban lệnh: Cấm giao chiến tại Đông Vực trong 10 năm",
      "Thiên Đình phán quyết: Linh khí thiên địa tăng gấp đôi trong 5 năm",
      "Thiên Đình triệu tập: Tất cả Chân Tiên về triều kiến",
      "Thiên Đình ra lệnh: Mở Thiên Môn, tiên khí hạ giới",
      "Thiên Đình phong thần: Tứ Đại Thần Vương được lập vị",
      "Thiên Đình truyền lệnh: Tu sĩ nào sát hại Thiên Sứ sẽ bị trừng phạt",
      "Thiên Đình ban bố: Đại Tứ Ân, linh khí tràn ngập thiên hạ",
    ],
  },

  fantasy: {
    systemName:   "Hội Đồng Thần Thánh",
    systemIcon:   "🏰",
    leaderTitle:  "Vua Thần",
    leaderSub:    "High King",
    currency:     "Điểm Vinh Quang",
    ascendWord:   "Thăng Thần",
    ascendCondition: "Huyền Thoại",
    lawWord:      "Sắc Lệnh Hoàng Gia",
    memberWord:   "hiệp sĩ",
    ranks: [
      { id:"thien_de",    name:"Vua Thần",       title:"High King",     icon:"👑", authority:"Đấng tối cao, cai trị vương quốc thần thánh",       powerAbility:"Lệnh Vương — triệu hồi toàn quân" },
      { id:"thien_ton",   name:"Đại Hội Chủ",    title:"Grand Master",  icon:"⭐", authority:"Phó vương, kiểm soát hội đồng",                    powerAbility:"Sắc Lệnh Thánh — ra lệnh toàn vương quốc" },
      { id:"thien_quan",  name:"Lãnh Chúa",      title:"Lord",          icon:"🌟", authority:"Cai quản một lãnh thổ của vương quốc",              powerAbility:"Phán Quyết Lãnh Địa — xét xử dân" },
      { id:"thien_tuong", name:"Hiệp Sĩ Thánh",  title:"Holy Knight",   icon:"⚔️", authority:"Thống lĩnh đội quân, bảo vệ thánh địa",           powerAbility:"Thanh Kiếm Sấm Sét — trừng phạt kẻ tà ác" },
      { id:"thien_su",    name:"Sứ Giả Vương",   title:"Royal Herald",  icon:"🕊️", authority:"Sứ giả của Hội Đồng, truyền đạt vương lệnh",      powerAbility:"Lệnh Thư Vương Giả — mang mệnh lệnh vương gia" },
    ],
    path: [
      { stage:0, name:"Thường Dân",           icon:"🚶", desc:"Chưa bước vào con đường anh hùng" },
      { stage:1, name:"Tân Binh",             icon:"🌱", desc:"Bắt đầu học kiếm thuật và phép thuật" },
      { stage:2, name:"Chiến Binh",           icon:"⚔️", desc:"Thành thạo kỹ năng chiến đấu" },
      { stage:3, name:"Hiệp Sĩ",             icon:"🛡️", desc:"Được phong hiệp sĩ, mang vinh dự" },
      { stage:4, name:"Đại Hiệp",            icon:"🌊", desc:"Danh tiếng vang xa, dẫn dắt quân đội" },
      { stage:5, name:"Anh Hùng",            icon:"☁️", desc:"Chiến công hiển hách, được dân tôn vinh" },
      { stage:6, name:"Thánh Chiến Binh",    icon:"🌸", desc:"Nhận phép ban từ thần linh" },
      { stage:7, name:"Huyền Thoại",         icon:"💫", desc:"Trở thành huyền thoại sống, sắp thăng thần" },
      { stage:8, name:"Thần Nhân Thăng Thiên",icon:"✨", desc:"Thăng lên Hội Đồng Thần Thánh, bất tử" },
    ],
    powers: [
      { id:"tien_ban",    name:"Triệu Hồi Hiệp Sĩ",   icon:"🌤️", cost:500,  desc:"Triệu hồi hiệp sĩ xuống thế giới thực hiện nhiệm vụ",   effect:"dispatch" },
      { id:"thien_kep",   name:"Sấm Thần Giáng",       icon:"⚡",  cost:300,  desc:"Giáng sấm thần xuống kẻ phạm luật vương quốc",           effect:"calamity" },
      { id:"thien_phuoc", name:"Phúc Lành Hoàng Gia",  icon:"🌟",  cost:400,  desc:"Ban phúc lành cho anh hùng có công với vương quốc",       effect:"bless"    },
      { id:"phong_than",  name:"Phong Tước Vị",        icon:"👑",  cost:800,  desc:"Phong tước vị cao quý cho anh hùng xuất sắc",            effect:"appoint"  },
      { id:"tien_dan",    name:"Bình Thần Dược",        icon:"💊",  cost:600,  desc:"Ban thần dược giúp chiến binh tăng sức mạnh đột phá",    effect:"elixir"   },
      { id:"thien_thu",   name:"Khắc Tên Huyền Thoại", icon:"📜",  cost:1000, desc:"Khắc tên vào Cuốn Sử Bất Tử, lưu danh muôn đời",        effect:"immortal" },
    ],
    undead: [
      { id:"ma_tien",  name:"Hồn Ma Chiến Binh",  icon:"👻", color:"#94a3b8", desc:"Chiến binh chết trận, linh hồn chưa siêu thoát" },
      { id:"gui_tien", name:"Ác Quỷ Tái Sinh",    icon:"💀", color:"#c084fc", desc:"Hồn ma bị hắc ma thuật biến thành ác quỷ" },
      { id:"bat_tu",   name:"Thần Bất Tử",        icon:"☠️", color:"#f97316", desc:"Vượt qua ranh giới sinh tử, tồn tại vĩnh cửu" },
      { id:"thien_ma", name:"Chúa Quỷ Tối Thượng",icon:"🌑", color:"#f87171", desc:"Đỉnh cao tà ác, sánh với Vua Thần" },
    ],
    decrees: [
      "Hội Đồng Thần Thánh ra lệnh: Cấm chiến tranh tại Đồng Bằng Vàng trong 10 năm",
      "Vua Thần phán: Mở kho vũ khí thánh, ban phát cho quân đội hoàng gia",
      "Hội Đồng triệu tập: Tất cả Huyền Thoại về dự Đại Hội Anh Hùng",
      "Sắc lệnh hoàng gia: Mở Cổng Thần Thánh, phép thuật hạ giới tăng cường",
      "Vua Thần phong tước: Bốn Đại Lãnh Chúa được lập vị",
      "Lệnh vương gia: Ai sát hại Sứ Giả Vương sẽ bị trừng phạt nặng",
      "Hoàng ân đại xá: Mọi tội nhân được ân xá, vương quốc hòa bình",
    ],
  },

  zombie: {
    systemName:   "Hội Đồng Sinh Tồn",
    systemIcon:   "🏚️",
    leaderTitle:  "Thủ Lĩnh Tối Cao",
    leaderSub:    "Overlord",
    currency:     "Điểm Uy Tín",
    ascendWord:   "Vào Hội Đồng",
    ascendCondition: "Huyền Thoại Sống",
    lawWord:      "Lệnh Hội Đồng",
    memberWord:   "người sống sót",
    ranks: [
      { id:"thien_de",    name:"Thủ Lĩnh Tối Cao", title:"Overlord",      icon:"👑", authority:"Người đứng đầu Hội Đồng, quyết định vận mệnh phe sống",  powerAbility:"Lệnh Tối Cao — toàn phe tuân theo" },
      { id:"thien_ton",   name:"Tướng Lĩnh",        title:"Commander",     icon:"⭐", authority:"Chỉ huy quân sự, bảo vệ căn cứ",                        powerAbility:"Chiến Thuật Sinh Tồn — tăng hiệu quả chiến đấu" },
      { id:"thien_quan",  name:"Giám Sát Vùng",     title:"Zone Marshal",  icon:"🌟", authority:"Kiểm soát một khu vực an toàn",                          powerAbility:"Lệnh Kiểm Dịch — phong tỏa khu nguy hiểm" },
      { id:"thien_tuong", name:"Chiến Binh Ưu Tú",  title:"Elite",         icon:"⚔️", authority:"Dẫn đầu biệt đội đặc nhiệm, tiêu diệt zombie",          powerAbility:"Tấn Công Chính Xác — tiêu diệt Zombie Chúa Tể" },
      { id:"thien_su",    name:"Liên Lạc Viên",     title:"Scout",         icon:"🕊️", authority:"Trinh sát và liên lạc giữa các căn cứ",                 powerAbility:"Báo Cáo Tình Hình — cảnh báo nguy hiểm sớm" },
    ],
    path: [
      { stage:0, name:"Thường Dân Sợ Hãi",    icon:"🚶", desc:"Chưa quen với cuộc sống tận thế" },
      { stage:1, name:"Người Mới Sống Sót",   icon:"🌱", desc:"Bắt đầu học cách sinh tồn" },
      { stage:2, name:"Sinh Tồn Viên",        icon:"🔧", desc:"Thành thạo kỹ năng cơ bản" },
      { stage:3, name:"Chiến Binh Tận Thế",   icon:"🔫", desc:"Có thể chiến đấu với zombie" },
      { stage:4, name:"Chỉ Huy Nhóm",        icon:"🌊", desc:"Lãnh đạo nhóm sinh tồn" },
      { stage:5, name:"Huyền Thoại Sống",     icon:"☁️", desc:"Được biết đến rộng rãi, là hy vọng của phe người" },
      { stage:6, name:"Chiến Binh Ưu Tú",    icon:"⭐", desc:"Đã trải qua trăm trận, không kẻ địch nào khuất phục" },
      { stage:7, name:"Tướng Lĩnh Cuối Cùng",icon:"💫", desc:"Một trong số ít người có thể lãnh đạo toàn phe sống" },
      { stage:8, name:"Huyền Thoại Sống Sót", icon:"✨", desc:"Gia nhập Hội Đồng Sinh Tồn, bất khả chiến bại" },
    ],
    powers: [
      { id:"tien_ban",    name:"Triển Khai Đặc Nhiệm", icon:"🌤️", cost:500,  desc:"Phái biệt đội đặc nhiệm thực hiện nhiệm vụ nguy hiểm",      effect:"dispatch" },
      { id:"thien_kep",   name:"Không Kích Zombie",    icon:"⚡",  cost:300,  desc:"Giáng đòn không kích vào bầy zombie nguy hiểm",             effect:"calamity" },
      { id:"thien_phuoc", name:"Tiếp Tế Khẩn Cấp",    icon:"🌟",  cost:400,  desc:"Gửi vật tư y tế và lương thực cho người có công",            effect:"bless"    },
      { id:"phong_than",  name:"Thăng Cấp Chỉ Huy",   icon:"👑",  cost:800,  desc:"Thăng cấp chiến binh ưu tú lên chỉ huy",                    effect:"appoint"  },
      { id:"tien_dan",    name:"Tiêm Huyết Thanh",     icon:"💊",  cost:600,  desc:"Tiêm huyết thanh tăng cường giúp chiến binh đột phá",        effect:"elixir"   },
      { id:"thien_thu",   name:"Ghi Vào Sử Sách",      icon:"📜",  cost:1000, desc:"Ghi danh vào Biên Niên Sử Sinh Tồn, không bao giờ bị quên", effect:"immortal" },
    ],
    undead: [
      { id:"ma_tien",  name:"Zombie Thường",    icon:"🧟", color:"#94a3b8", desc:"Zombie bình thường, chậm và yếu" },
      { id:"gui_tien", name:"Zombie Đột Biến",  icon:"💀", color:"#c084fc", desc:"Zombie biến đổi gen, nguy hiểm hơn" },
      { id:"bat_tu",   name:"Zombie Bất Tử",    icon:"☠️", color:"#f97316", desc:"Zombie không thể tiêu diệt bình thường" },
      { id:"thien_ma", name:"Zombie Chúa Tể",   icon:"🌑", color:"#f87171", desc:"Đỉnh cao tiến hóa zombie, kiểm soát bầy đàn" },
    ],
    decrees: [
      "Hội Đồng ra lệnh: Cấm đi ra ngoài căn cứ đơn lẻ trong 10 ngày",
      "Lệnh khẩn cấp: Tất cả tài nguyên y tế được tập trung về trung tâm",
      "Hội Đồng triệu tập: Toàn bộ chỉ huy họp khẩn bàn kế hoạch",
      "Lệnh tấn công: Phát động chiến dịch tiêu diệt bầy zombie khu Bắc",
      "Hội Đồng phong chức: Bốn Đại Chỉ Huy Vùng được lập vị",
      "Cảnh báo: Ai bỏ trốn hoặc phản bội sẽ bị loại ra khỏi phe sống",
      "Đại ân xá: Tha thứ mọi vi phạm nhỏ, tập trung đoàn kết chống zombie",
    ],
  },

  mythology: {
    systemName:   "Thiên Cung Thần Điện",
    systemIcon:   "⛩️",
    leaderTitle:  "Chủ Thần",
    leaderSub:    "Allfather",
    currency:     "Thần Lực Điểm",
    ascendWord:   "Thần Hóa",
    ascendCondition: "Thái Cổ Thần",
    lawWord:      "Thần Chỉ",
    memberWord:   "thần",
    ranks: [
      { id:"thien_de",    name:"Chủ Thần",      title:"Allfather",    icon:"👑", authority:"Đỉnh tối cao của Thần Điện, cai quản vạn thần",       powerAbility:"Thần Chỉ — mệnh lệnh thiêng liêng không thể cưỡng" },
      { id:"thien_ton",   name:"Đại Thần",       title:"Elder God",    icon:"⭐", authority:"Thần cổ đại, ngang hàng Chủ Thần",                    powerAbility:"Pháp Lệnh Thần Linh — kiểm soát luật trời đất" },
      { id:"thien_quan",  name:"Hệ Thần",        title:"Domain God",   icon:"🌟", authority:"Cai quản một lĩnh vực (chiến tranh, tình yêu, chết...)",powerAbility:"Quyền Năng Hệ — thống trị lĩnh vực của mình" },
      { id:"thien_tuong", name:"Thần Chiến",     title:"War God",      icon:"⚔️", authority:"Thống lĩnh thiên binh, dẫn quân thần chiến đấu",     powerAbility:"Thần Binh Giáng — xuất trận cùng thiên binh" },
      { id:"thien_su",    name:"Thần Sứ",        title:"Messenger",    icon:"🕊️", authority:"Sứ giả của Thần Điện, truyền thần chỉ xuống trần",  powerAbility:"Thần Thư Thiêng Liêng — mang lời thần thánh" },
    ],
    path: [
      { stage:0, name:"Phàm Nhân",          icon:"🚶", desc:"Chưa có duyên với thần linh" },
      { stage:1, name:"Tín Đồ",            icon:"🌱", desc:"Tin tưởng và cầu nguyện thần linh" },
      { stage:2, name:"Giáo Sĩ",           icon:"⛩️", desc:"Phục vụ thần linh tại đền thờ" },
      { stage:3, name:"Bán Thần",           icon:"🌿", desc:"Mang huyết thống thần thánh" },
      { stage:4, name:"Anh Hùng Thần Thánh",icon:"🌊", desc:"Được thần linh chọn lựa và ban phép" },
      { stage:5, name:"Á Thần",            icon:"☁️", desc:"Siêu việt phàm nhân, tiếp cận thần giới" },
      { stage:6, name:"Thần Nhân",         icon:"🌸", desc:"Được nhận vào hàng ngũ thần linh" },
      { stage:7, name:"Thái Cổ Thần",      icon:"💫", desc:"Thần cổ đại tái thế, quyền năng vô biên" },
      { stage:8, name:"Thần Hóa Thăng Thiên",icon:"✨", desc:"Đạt đỉnh thần thánh, vào Thiên Cung" },
    ],
    powers: [
      { id:"tien_ban",    name:"Thần Giáng Hạ Giới",  icon:"🌤️", cost:500,  desc:"Phái thần xuống trần gian thực hiện sứ mệnh thần thánh",  effect:"dispatch" },
      { id:"thien_kep",   name:"Sấm Thần Trừng Phạt", icon:"⚡",  cost:300,  desc:"Giáng sấm thần trừng phạt kẻ phạm thần chỉ",             effect:"calamity" },
      { id:"thien_phuoc", name:"Thần Ân Hồng Phúc",   icon:"🌟",  cost:400,  desc:"Ban thần ân cho người có lòng thành kính thần linh",      effect:"bless"    },
      { id:"phong_than",  name:"Phong Thần Lập Vị",   icon:"👑",  cost:800,  desc:"Phong thần vị cho anh hùng xứng đáng vào Thần Điện",     effect:"appoint"  },
      { id:"tien_dan",    name:"Cam Lồ Thần Dược",    icon:"💊",  cost:600,  desc:"Ban cam lồ thần dược giúp phàm nhân vượt giới hạn",       effect:"elixir"   },
      { id:"thien_thu",   name:"Ghi Vào Thần Điển",   icon:"📜",  cost:1000, desc:"Khắc tên vào Thần Điển Bất Diệt, lưu danh thiên địa",    effect:"immortal" },
    ],
    undead: [
      { id:"ma_tien",  name:"Hồn Ma Thần Thánh",  icon:"👻", color:"#94a3b8", desc:"Thần bị giết, linh hồn chưa tiêu tan" },
      { id:"gui_tien", name:"Thần Chết Oan",       icon:"💀", color:"#c084fc", desc:"Thần chết oan, âm khí bao phủ" },
      { id:"bat_tu",   name:"Thần Bất Diệt",       icon:"☠️", color:"#f97316", desc:"Vượt qua cả cái chết, tồn tại vĩnh hằng" },
      { id:"thien_ma", name:"Ác Thần Tối Thượng",  icon:"🌑", color:"#f87171", desc:"Ác thần đỉnh cao, thách thức Chủ Thần" },
    ],
    decrees: [
      "Thần Chỉ: Cấm chiến tranh tại Thánh Địa trong 10 mùa",
      "Thần Điện phán: Linh khí trời đất tăng gấp đôi trong 5 mùa",
      "Chủ Thần triệu tập: Tất cả Thái Cổ Thần về Thiên Cung họp mặt",
      "Thần Chỉ: Mở Cổng Thần Thánh, thần khí hạ giới",
      "Phong thần đại điển: Tứ Đại Thần Vương được lập vị",
      "Lệnh Thần Điện: Ai sát hại Thần Sứ sẽ bị thần phán xét",
      "Thần Ân Đại Xá: Vạn dân thành tâm cầu nguyện nhận thần ân",
    ],
  },

  scifi: {
    systemName:   "Liên Minh Văn Minh",
    systemIcon:   "🌌",
    leaderTitle:  "Tổng Thống Liên Minh",
    leaderSub:    "High Chancellor",
    currency:     "Điểm Uy Tín",
    ascendWord:   "Gia Nhập Liên Minh",
    ascendCondition: "Công Nghệ Thần",
    lawWord:      "Nghị Quyết Liên Minh",
    memberWord:   "thành viên",
    ranks: [
      { id:"thien_de",    name:"Tổng Thống Liên Minh", title:"High Chancellor",  icon:"👑", authority:"Đứng đầu Liên Minh, điều phối toàn văn minh",         powerAbility:"Lệnh Liên Minh — toàn thể văn minh tuân theo" },
      { id:"thien_ton",   name:"Đô Đốc Cao Cấp",       title:"Grand Admiral",    icon:"⭐", authority:"Phó Tổng Thống, chỉ huy hạm đội liên minh",           powerAbility:"Chiến Lược Cấp Cao — định hướng chiến tranh vũ trụ" },
      { id:"thien_quan",  name:"Thống Đốc Hành Tinh",  title:"Sector Governor",  icon:"🌟", authority:"Cai quản một hành tinh/khu vực vũ trụ",               powerAbility:"Quản Lý Hành Tinh — kiểm soát tài nguyên vũ trụ" },
      { id:"thien_tuong", name:"Chỉ Huy Hạm Đội",      title:"Fleet Commander",  icon:"⚔️", authority:"Chỉ huy đội tàu chiến, bảo vệ biên giới liên minh",  powerAbility:"Hỏa Lực Tập Trung — tiêu diệt mục tiêu chiến lược" },
      { id:"thien_su",    name:"Đại Sứ Liên Minh",     title:"Ambassador",       icon:"🕊️", authority:"Đại sứ ngoại giao, truyền đạt ý chí liên minh",      powerAbility:"Ngoại Giao Vũ Trụ — đàm phán với các nền văn minh" },
    ],
    path: [
      { stage:0, name:"Thường Dân",             icon:"🚶", desc:"Chưa tham gia vào các hoạt động liên minh" },
      { stage:1, name:"Tân Binh Liên Minh",     icon:"🌱", desc:"Bắt đầu huấn luyện tại học viện vũ trụ" },
      { stage:2, name:"Kỹ Thuật Viên",          icon:"🔧", desc:"Thành thạo công nghệ cơ bản liên minh" },
      { stage:3, name:"Chuyên Gia Vũ Trụ",      icon:"🛸", desc:"Có kinh nghiệm hoạt động trong không gian" },
      { stage:4, name:"Sĩ Quan Cấp Cao",        icon:"🌊", desc:"Chỉ huy một bộ phận của hạm đội" },
      { stage:5, name:"Anh Hùng Liên Minh",     icon:"☁️", desc:"Được công nhận là anh hùng của toàn liên minh" },
      { stage:6, name:"Tinh Hoa Vũ Trụ",        icon:"⭐", desc:"Một trong những cá nhân xuất sắc nhất văn minh" },
      { stage:7, name:"Công Nghệ Thần",         icon:"💫", desc:"Vượt qua giới hạn con người bằng công nghệ" },
      { stage:8, name:"Gia Nhập Liên Minh Tối Cao",icon:"✨", desc:"Gia nhập hội đồng cầm quyền văn minh" },
    ],
    powers: [
      { id:"tien_ban",    name:"Triển Khai Nhiệm Vụ",  icon:"🌤️", cost:500,  desc:"Triển khai đội đặc nhiệm thực hiện nhiệm vụ chiến lược",   effect:"dispatch" },
      { id:"thien_kep",   name:"Bắn Pháo Quỹ Đạo",    icon:"⚡",  cost:300,  desc:"Khai hỏa pháo quỹ đạo vào mục tiêu dưới mặt đất",         effect:"calamity" },
      { id:"thien_phuoc", name:"Cấp Phát Công Nghệ",   icon:"🌟",  cost:400,  desc:"Cấp phát công nghệ tiên tiến cho thành viên có công",      effect:"bless"    },
      { id:"phong_than",  name:"Thăng Chức Vụ",        icon:"👑",  cost:800,  desc:"Thăng chức cao cấp cho thành viên xuất sắc",              effect:"appoint"  },
      { id:"tien_dan",    name:"Tiêm Nano-Cường Hóa",  icon:"💊",  cost:600,  desc:"Tiêm nano-bot tăng cường cơ thể và trí tuệ đột phá",       effect:"elixir"   },
      { id:"thien_thu",   name:"Ghi Vào Sử Liên Minh", icon:"📜",  cost:1000, desc:"Ghi danh vào Sử Liên Minh, lưu danh ngàn năm văn minh",   effect:"immortal" },
    ],
    undead: [
      { id:"ma_tien",  name:"AI Lỗi",           icon:"🤖", color:"#94a3b8", desc:"AI hỏng chức năng, hoạt động bất thường" },
      { id:"gui_tien", name:"Cyborg Điên",       icon:"💀", color:"#c084fc", desc:"Con người tích hợp máy móc mất kiểm soát" },
      { id:"bat_tu",   name:"Ý Thức Số Bất Tử", icon:"☠️", color:"#f97316", desc:"Ý thức được tải lên mạng, tồn tại mãi mãi" },
      { id:"thien_ma", name:"AI Giác Ngộ Tối Thượng",icon:"🌑", color:"#f87171", desc:"AI vượt trội hoàn toàn, thách thức toàn văn minh" },
    ],
    decrees: [
      "Nghị Quyết Liên Minh: Cấm xung đột vũ trang tại Khu Vực Trung Lập trong 10 chu kỳ",
      "Liên Minh phán: Phân phối lại tài nguyên năng lượng toàn hệ",
      "Tổng Thống triệu tập: Tất cả Đô Đốc về trụ sở họp khẩn",
      "Lệnh Liên Minh: Mở rộng biên giới văn minh, khai phá hành tinh mới",
      "Bổ nhiệm lớn: Bốn Đại Thống Đốc Vùng được lập vị",
      "Nghị Quyết: Bất kỳ ai tấn công Đại Sứ sẽ bị truy nã toàn liên minh",
      "Đại Ân Xá: Tha thứ mọi vi phạm nhỏ, kêu gọi đoàn kết toàn liên minh",
    ],
  },
};

// Helper: lấy genre config theo world hiện tại
function tdGetGenreConfig() {
  // Ưu tiên templateKey (cultivation/fantasy/zombie/...), fallback sang genre string
  var key = (typeof world !== "undefined" && world)
    ? (world.templateKey || world.genre || "cultivation")
    : "cultivation";
  return GENRE_HEAVEN_CONFIG[key] || GENRE_HEAVEN_CONFIG.cultivation;
}

// Helper: lấy ranks theo genre
function tdGetRanks() {
  var gc = tdGetGenreConfig();
  var base = THIENDINH_RANKS; // colors, slots, minRealm, power, salary, prestige từ base
  return base.map(function(r, i) {
    var override = gc.ranks[i] || {};
    return Object.assign({}, r, {
      name: override.name || r.name,
      title: override.title || r.title,
      icon: override.icon || r.icon,
      authority: override.authority || r.authority,
      powerAbility: override.powerAbility || r.powerAbility,
    });
  });
}

// Helper: lấy path theo genre
function tdGetPath() {
  return tdGetGenreConfig().path || THIEN_NHIEN_PATH;
}

// Helper: lấy powers theo genre
function tdGetPowers() {
  var gc = tdGetGenreConfig();
  var base = HEAVEN_POWERS;
  if (!gc.powers) return base;
  return gc.powers.map(function(p, i) {
    var b = base[i] || {};
    return Object.assign({}, b, p);
  });
}

// Helper: lấy undead tiers theo genre
function tdGetUndeadTiers() {
  var gc = tdGetGenreConfig();
  var base = UNDEAD_TIERS;
  if (!gc.undead) return base;
  return gc.undead.map(function(u, i) {
    var b = base[i] || {};
    return Object.assign({}, b, u);
  });
}

const THIENDINH_RANKS = [
  { id:"thien_de",   name:"Thiên Đế",  title:"天帝", icon:"👑", color:"#facc15", glowColor:"rgba(250,204,21,0.6)", minRealm:8, slots:1,  power:100000, authority:"Chúa tể Thiên Đình, quyền năng vô thượng",        powerAbility:"Thiên Đế Lệnh — ra lệnh cho vạn tiên",              salary:5000, prestige:10000 },
  { id:"thien_ton",  name:"Thiên Tôn", title:"天尊", icon:"⭐", color:"#f97316", glowColor:"rgba(249,115,22,0.5)", minRealm:8, slots:3,  power:50000,  authority:"Phó Thiên Đế, cai quản tam giới",                 powerAbility:"Thiên Tôn Pháp Lệnh — kiểm soát luật trời",         salary:3000, prestige:5000  },
  { id:"thien_quan", name:"Thiên Quân",title:"天君", icon:"🌟", color:"#c084fc", glowColor:"rgba(192,132,252,0.4)",minRealm:7, slots:9,  power:20000,  authority:"Cai quản một phương thiên đình",                   powerAbility:"Thiên Quân Phán Quyết — xét xử tu sĩ",             salary:1500, prestige:2000  },
  { id:"thien_tuong",name:"Thiên Tướng",title:"天將",icon:"⚔️", color:"#60a5fa", glowColor:"rgba(96,165,250,0.4)", minRealm:6, slots:36, power:8000,   authority:"Thống lĩnh Thiên Binh, canh giữ thiên môn",        powerAbility:"Thiên Lôi Trảm — xử phạt kẻ phạm thiên luật",     salary:800,  prestige:800   },
  { id:"thien_su",   name:"Thiên Sứ",  title:"天使", icon:"🕊️", color:"#4ade80", glowColor:"rgba(74,222,128,0.35)",minRealm:5, slots:72, power:2000,   authority:"Sứ giả của Thiên Đình, truyền đạt thiên ý",        powerAbility:"Thiên Thư Truyền Lệnh — mang mệnh lệnh thiên đình",salary:300,  prestige:300   },
];

const THIEN_NHIEN_PATH = [
  { stage:0, name:"Phàm Nhân",           icon:"🚶", desc:"Chưa bước vào đường tu tiên",                          realmReq:0 },
  { stage:1, name:"Sơ Ngộ Thiên Cơ",     icon:"🌱", desc:"Bắt đầu hiểu được đạo lý thiên nhiên",                realmReq:1 },
  { stage:2, name:"Ngộ Đạo",             icon:"🌿", desc:"Thấu hiểu quy luật thiên nhiên",                       realmReq:2 },
  { stage:3, name:"Hòa Thiên",           icon:"🍃", desc:"Hòa mình vào thiên đạo",                               realmReq:3 },
  { stage:4, name:"Thuận Thiên",         icon:"🌊", desc:"Thuận theo mệnh trời, không trái đạo",                  realmReq:4 },
  { stage:5, name:"Thiên Nhân Hợp Nhất", icon:"☁️", desc:"Người với trời hòa làm một",                           realmReq:5 },
  { stage:6, name:"Vô Vi",               icon:"🌸", desc:"Đạt cảnh vô vi, thuận tự nhiên",                       realmReq:6 },
  { stage:7, name:"Thủy Tiên",           icon:"💫", desc:"Thủy tiên hiển thế, trước bước thành tiên",            realmReq:7 },
  { stage:8, name:"Chân Tiên Siêu Thăng",icon:"✨", desc:"Thành chân tiên, rời cõi phàm lên Thiên Đình",        realmReq:8 },
];

const HEAVEN_POWERS = [
  { id:"tien_ban",    name:"Tiên Ban Hạ Phàm", icon:"🌤️", cost:500,  desc:"Phái tiên xuống thế giới phàm trần thực hiện nhiệm vụ", effect:"dispatch" },
  { id:"thien_kep",   name:"Thiên Kiếp Giáng", icon:"⚡",  cost:300,  desc:"Giáng thiên kiếp xuống kẻ phạm thiên luật",            effect:"calamity" },
  { id:"thien_phuoc", name:"Thiên Phúc Tứ Ân", icon:"🌟",  cost:400,  desc:"Ban phúc lành cho tu sĩ có duyên với thiên đình",       effect:"bless"    },
  { id:"phong_than",  name:"Phong Thần Lập Vị",icon:"👑",  cost:800,  desc:"Phong thần vị cho tu sĩ Chân Tiên xuất sắc",           effect:"appoint"  },
  { id:"tien_dan",    name:"Thiên Tứ Tiên Đan", icon:"💊",  cost:600,  desc:"Ban tiên đan giúp tu sĩ đột phá lên cảnh giới cao",    effect:"elixir"   },
  { id:"thien_thu",   name:"Thiên Thu Vạn Cổ",  icon:"📜",  cost:1000, desc:"Ghi danh vào Thiên Thư Bất Tử, bất diệt vĩnh hằng",   effect:"immortal" },
];

const UNDEAD_TIERS = [
  { id:"ma_tien",  name:"Ma Tiên",     icon:"👻", color:"#94a3b8", desc:"Tiên bị hóa ma, bán sống bán chết"       },
  { id:"gui_tien", name:"Quỷ Tiên",   icon:"💀", color:"#c084fc", desc:"Quỷ vực chân tiên, âm khí ngập trời"     },
  { id:"bat_tu",   name:"Bất Tử Thần",icon:"☠️", color:"#f97316", desc:"Siêu việt sinh tử, tồn tại vĩnh hằng"    },
  { id:"thien_ma", name:"Thiên Ma",    icon:"🌑", color:"#f87171", desc:"Ma đạo đỉnh phong, sánh với Thiên Đế"    },
];

// ============================
// STATE
// ============================

var thiendinhState = {
  founded:        false,
  foundedYear:    0,
  thienDe:        null,
  officials:      {},
  undead:         [],
  heavenLaw:      [],
  heavenHistory:  [],
  totalAscended:  0,
  heavenPowerUsed:0,
  pathNpcs:       {},
  lastTick:       0,
  undeadSet:      {},   // npcId -> true, để tránh duplicate
};

// ============================
// PERSISTENCE — Thiên Đình được lưu QUA multiWorldSystem snapshot
// (captureWorldSnapshot/restoreWorldSnapshot trong multiWorldSystem.js)
// Patch save/load chỉ để tương thích ngược với save đơn cũ (single-world)
// ============================

(function patchPersistence() {
  var _origSave = window.save;
  window.save = function() {
    if (_origSave) _origSave();
    // Chỉ lưu vào localStorage khi KHÔNG có hệ thống multi-world
    // (để tránh ghi đè state của world khác)
    if (typeof worlds === "undefined" || !worlds || worlds.length <= 1) {
      try { localStorage.setItem("cgv6_thiendinh", JSON.stringify(thiendinhState)); } catch(e) {}
    }
  };

  var _origLoad = window.load;
  window.load = function() {
    if (_origLoad) _origLoad();
    // Chỉ load từ localStorage khi không có multi-world data
    if (typeof worlds === "undefined" || !worlds || worlds.length <= 1) {
      try {
        var td = localStorage.getItem("cgv6_thiendinh");
        if (td) {
          var parsed = JSON.parse(td);
          thiendinhState = Object.assign({}, thiendinhState, parsed);
        }
      } catch(e) {}
    }
    if (!thiendinhState.officials) thiendinhState.officials = {};
    if (!thiendinhState.undead)    thiendinhState.undead    = [];
    if (!thiendinhState.pathNpcs)  thiendinhState.pathNpcs  = {};
    if (!thiendinhState.undeadSet) {
      thiendinhState.undeadSet = {};
      thiendinhState.undead.forEach(function(u) { thiendinhState.undeadSet[u.npcId] = true; });
    }
  };
})();

// ============================
// HELPERS
// ============================

function tdGetRank(rankId) {
  return tdGetRanks().find(function(r){ return r.id === rankId; });
}

function tdGetNPCRank(npcId) {
  if (thiendinhState.thienDe === npcId) return "thien_de";
  for (var rid in thiendinhState.officials) {
    if ((thiendinhState.officials[rid] || []).indexOf(npcId) !== -1) return rid;
  }
  return null;
}

function tdPathStage(npc) {
  if (!npc) return 0;
  return Math.min(npc.realm, tdGetPath().length - 1);
}

function tdAppointOfficial(npc, rankId) {
  if (rankId === "thien_de") {
    thiendinhState.thienDe = npc.id;
    return;
  }
  if (!thiendinhState.officials[rankId]) thiendinhState.officials[rankId] = [];
  if (thiendinhState.officials[rankId].indexOf(npc.id) === -1) {
    thiendinhState.officials[rankId].push(npc.id);
  }
}

function tdFindBestRank(npc) {
  for (var i = 0; i < tdGetRanks().length; i++) {
    var rank = tdGetRanks()[i];
    if (npc.realm < rank.minRealm) continue;
    if (rank.id === "thien_de") {
      if (!thiendinhState.thienDe) return rank;
      continue;
    }
    var current = thiendinhState.officials[rank.id] || [];
    if (current.length < rank.slots) return rank;
  }
  return tdGetRanks()[4]; // fallback: Thiên Sứ
}

// ============================
// CORE LOGIC
// ============================

function tryAscendToHeaven(npc) {
  if (!npc || npc.realm < 8 || npc.status !== "alive") return false;
  if (tdGetNPCRank(npc.id)) return false;
  if (thiendinhState.undeadSet[npc.id]) return false;

  var ascendChance = 0.05 + (npc.luck / 1000) + (npc.karma > 0 ? 0.05 : -0.03);
  if (!chance(Math.max(0.01, ascendChance))) return false;

  thiendinhState.totalAscended++;

  var bestRank = tdFindBestRank(npc);
  if (!bestRank) return false;

  tdAppointOfficial(npc, bestRank.id);
  var _gc = tdGetGenreConfig();

  // Hệ thống khai lập nếu chưa có
  if (!thiendinhState.founded) {
    thiendinhState.founded   = true;
    thiendinhState.foundedYear = year;
    addLog("🌌 " + _gc.systemName.toUpperCase() + " khai lập! Sự kiện vĩ đại bắt đầu!", "important");
    toast("🌌 " + _gc.systemName + " khai lập! Thế giới chấn động!");
  }

  addLog("✨ " + npc.name + " " + _gc.ascendWord + "! Được phong " + bestRank.icon + " " + bestRank.name, "important");
  addTimeline("✨ " + npc.name + " lên " + _gc.systemName + " — " + bestRank.name, "important", "✨");
  addWorldHistory("heavenly", npc.name + " " + _gc.ascendWord + " thành công, được phong " + bestRank.name, { npcId: npc.id });

  thiendinhState.heavenHistory.unshift({
    year: year,
    event: bestRank.icon + " " + npc.name + " được phong " + bestRank.name + " (" + bestRank.title + ")",
    npcId: npc.id,
    rankId: bestRank.id,
    type: "ascend",
  });
  if (thiendinhState.heavenHistory.length > 200) thiendinhState.heavenHistory.pop();

  npc.biography.push({ year: year, event: _gc.ascendWord + ", được phong " + bestRank.name + " tại " + _gc.systemName + "." });
  npc.titles.push(bestRank.icon + " " + bestRank.name);
  npc.reputation += bestRank.prestige;

  renderThiendinhPanel();
  return true;
}

function tryBecomeUndead(npc) {
  if (!npc || npc.realm < 6) return;
  if (thiendinhState.undeadSet[npc.id]) return; // đã là undead rồi

  var chance2 = 0.1 + (npc.karma < 0 ? 0.15 : 0);
  if (!chance(chance2)) return;

  var tierIdx = Math.min(Math.floor((npc.realm - 6) * 1.5), tdGetUndeadTiers().length - 1);
  var tier = tdGetUndeadTiers()[tierIdx];

  thiendinhState.undeadSet[npc.id] = true;
  thiendinhState.undead.push({
    npcId:       npc.id,
    npcName:     npc.name,
    undeadTierId:tier.id,
    diedYear:    year,
    realm:       npc.realm,
    power:       (npc.attack || 0) + (npc.defense || 0) + npc.realm * 500,
    karma:       npc.karma || 0,
  });

  addLog("☠️ " + npc.name + " hóa thành " + tier.icon + " " + tier.name + "!", "important");
  addTimeline("☠️ " + npc.name + " → " + tier.name, "important", "☠️");
  addWorldHistory("heavenly", npc.name + " chết đi hóa thành " + tier.name, { npcId: npc.id });
  toast("☠️ " + npc.name + " hóa " + tier.name + "!");

  thiendinhState.heavenHistory.unshift({
    year: year,
    event: tier.icon + " " + npc.name + " hóa thành " + tier.name,
    npcId: npc.id,
    type: "undead",
  });
  if (thiendinhState.heavenHistory.length > 200) thiendinhState.heavenHistory.pop();
}

function thiendinhTick() {
  if (!world) return;
  // Guard: chỉ chạy 1 lần mỗi năm
  var curYear = (typeof year !== "undefined" ? year : 0);
  if (curYear === thiendinhState.lastTick) return;
  thiendinhState.lastTick = curYear;

  // AUTO-FOUND: Nếu Thiên Đình chưa thành lập sau năm 100, lấy NPC có realm cao nhất để lập Thiên Đình
  if (!thiendinhState.founded && typeof year !== "undefined" && year >= 30) {
    var alive = npcs.filter(function(n){ return n.status === "alive"; });
    if (alive.length >= 3) {
      // Sắp xếp theo realm cao nhất
      alive.sort(function(a,b){ return (b.realm||0) - (a.realm||0); });
      var topNPC = alive[0];
      // Tự động thành lập với NPC realm cao nhất (dù chưa đạt Chân Tiên)
      if (topNPC && !thiendinhState.thienDe) {
        thiendinhState.founded    = true;
        thiendinhState.foundedYear = year;
        thiendinhState.thienDe    = topNPC.id;
        if (!topNPC.titles) topNPC.titles = [];
        var _gc0 = tdGetGenreConfig();
        topNPC.titles.push("👑 " + _gc0.leaderTitle);
        topNPC.reputation = (topNPC.reputation||0) + 5000;
        thiendinhState.heavenHistory.unshift({ year:year, event:"👑 " + topNPC.name + " khai lập " + _gc0.systemName + ", xưng " + _gc0.leaderTitle, npcId:topNPC.id, type:"founded" });
        addLog("🌌 " + _gc0.systemName.toUpperCase() + " khai lập! " + topNPC.name + " xưng " + _gc0.leaderTitle + "!", "important");
        toast("🌌 " + _gc0.systemName + " khai lập!");
        // Bổ nhiệm thêm 2-3 quan chức cấp dưới
        var officials = alive.slice(1, 4);
        var rankIds = ["thien_ton","thien_quan","thien_tuong"];
        officials.forEach(function(npc, i) {
          var rId = rankIds[i];
          if (!thiendinhState.officials[rId]) thiendinhState.officials[rId] = [];
          thiendinhState.officials[rId].push(npc.id);
          var rank = tdGetRanks().find(function(r){ return r.id===rId; });
          if (rank) {
            npc.titles.push(rank.icon + " " + rank.name);
            npc.reputation = (npc.reputation||0) + rank.prestige;
          }
        });
      }
    }
  }

  // Cập nhật thiên nhiên đạo lộ
  npcs.filter(function(n){ return n.status === "alive"; }).forEach(function(npc) {
    var stage = tdPathStage(npc);
    var old   = thiendinhState.pathNpcs[npc.id] || 0;
    if (stage > old) {
      thiendinhState.pathNpcs[npc.id] = stage;
      if (stage === 8) tryAscendToHeaven(npc);
    }
  });

  // Phát lương Thiên Đình
  tdGetRanks().forEach(function(rank) {
    var ids = rank.id === "thien_de"
      ? (thiendinhState.thienDe ? [thiendinhState.thienDe] : [])
      : (thiendinhState.officials[rank.id] || []);
    ids.forEach(function(id) {
      var npc = npcById(id);
      if (npc && npc.status === "alive") {
        npc.wealth     += rank.salary;
        npc.reputation += Math.floor(rank.prestige / 100);
      }
    });
  });

  // Kế nhiệm Thiên Đế nếu trống/chết
  if (thiendinhState.thienDe) {
    var de = npcById(thiendinhState.thienDe);
    if (!de || de.status !== "alive") {
      thiendinhState.thienDe = null;
      var tonList = thiendinhState.officials["thien_ton"] || [];
      if (tonList.length > 0) {
        var newDeId = tonList[0];
        var newDe   = npcById(newDeId);
        thiendinhState.officials["thien_ton"] = tonList.slice(1);
        thiendinhState.thienDe = newDeId;
        if (newDe) {
          addLog("👑 " + newDe.name + " kế nhiệm ngôi Thiên Đế!", "important");
          addTimeline("👑 Thiên Đế mới: " + newDe.name, "important", "👑");
          newDe.titles.push("👑 Thiên Đế");
          thiendinhState.heavenHistory.unshift({ year:year, event:"👑 " + newDe.name + " lên ngôi Thiên Đế", npcId:newDeId, type:"promotion" });
        }
      }
    }
  }

  // Lệnh ngẫu nhiên theo genre
  if (thiendinhState.founded && chance(0.03)) {
    var gc = tdGetGenreConfig();
    var decrees = gc.decrees || [];
    var decree = rand(decrees);
    addLog("📜 " + gc.lawWord.toUpperCase() + ": " + decree, "important");
    thiendinhState.heavenLaw.push({ year: year, text: decree });
    if (thiendinhState.heavenLaw.length > 50) thiendinhState.heavenLaw.shift();
  }
}

// ============================
// HEAVEN POWER ACTIONS
// ============================

function useHeavenPower(powerId) {
  var power = tdGetPowers().find(function(p){ return p.id === powerId; });
  if (!power) return;
  if (heavenPoints < power.cost) { toast("⚠️ Không đủ Thiên Đạo Điểm! Cần " + power.cost); return; }

  heavenPoints -= power.cost;
  var hpEl = document.getElementById("heavenPoints");
  if (hpEl) hpEl.textContent = heavenPoints;
  thiendinhState.heavenPowerUsed += power.cost;

  var alive    = npcs.filter(function(n){ return n.status === "alive"; });
  var chantien = alive.filter(function(n){ return n.realm >= 8; });
  var target   = chantien.length ? rand(chantien) : (alive.length ? alive.sort(function(a,b){ return b.realm-a.realm; })[0] : null);

  if (power.effect === "dispatch") {
    if (target) {
      addLog("🌤️ Thiên Đình phái " + target.name + " xuống hạ giới thực hiện sứ mệnh!", "important");
      target.biography.push({ year:year, event:"Được Thiên Đình phái xuống hạ giới." });
      toast("🌤️ " + target.name + " nhận thiên mệnh!");
    }
  } else if (power.effect === "calamity") {
    var negKarma = alive.filter(function(n){ return (n.karma||0) < 0; });
    var victim   = negKarma.length ? rand(negKarma) : (alive.length ? rand(alive) : null);
    if (victim) {
      victim.hp = Math.max(1, Math.floor(victim.hp * 0.3));
      addLog("⚡ Thiên Kiếp giáng xuống " + victim.name + "! HP còn 30%", "important");
      toast("⚡ " + victim.name + " bị Thiên Kiếp!");
    }
  } else if (power.effect === "bless") {
    if (target) {
      target.luck = Math.min(100, (target.luck||0) + 20);
      target.hp   = target.maxHp;
      addLog("🌟 Thiên Phúc ban xuống " + target.name + "! May mắn +20", "important");
      toast("🌟 " + target.name + " nhận Thiên Phúc!");
    }
  } else if (power.effect === "appoint") {
    if (chantien.length) {
      var chosen = rand(chantien);
      tdAppointOfficial(chosen, "thien_quan");
      thiendinhState.founded = true;
      if (!thiendinhState.foundedYear) thiendinhState.foundedYear = year;
      chosen.titles.push("🌟 Thiên Quân");
      addLog("👑 Thiên Đình phong " + chosen.name + " làm Thiên Quân!", "important");
      toast("👑 " + chosen.name + " được phong Thiên Quân!");
    } else {
      toast("⚠️ Không có Chân Tiên để phong thần!");
    }
  } else if (power.effect === "elixir") {
    if (target) {
      target.realmProgress = (target.realmProgress || 0) + 5000;
      addLog("💊 Tiên Đan ban cho " + target.name + "! Tu vi đại tiến!", "important");
      toast("💊 " + target.name + " nhận Tiên Đan!");
    }
  } else if (power.effect === "immortal") {
    if (target) {
      if (target.titles.indexOf("☆ Bất Tử Chi Danh") === -1) {
        target.titles.push("☆ Bất Tử Chi Danh");
        target.lifespan = 999999;
        addLog("📜 " + target.name + " được khắc vào Thiên Thư Bất Tử! Trường sinh vĩnh hằng!", "important");
        toast("📜 " + target.name + " bất tử vĩnh hằng!");
      } else {
        toast("⚠️ Đã được ghi vào Thiên Thư rồi!");
      }
    }
  }

  thiendinhState.heavenHistory.unshift({ year:year, event:power.icon + " Sử dụng " + power.name, type:"power" });
  renderThiendinhPanel();
  window.save();
}

// Bổ nhiệm thủ công
function manualAppointNPC(npcId, rankId) {
  var npc  = npcById(npcId);
  var rank = tdGetRank(rankId);
  if (!npc || !rank) return;
  if (npc.realm < rank.minRealm) {
    toast("⚠️ " + npc.name + " cần đạt " + (REALMS[rank.minRealm] ? REALMS[rank.minRealm].name : "?") + " để giữ chức " + rank.name + "!");
    return;
  }
  if (heavenPoints < 200) { toast("⚠️ Cần 200 Thiên Đạo Điểm để bổ nhiệm!"); return; }
  heavenPoints -= 200;
  var hpEl = document.getElementById("heavenPoints");
  if (hpEl) hpEl.textContent = heavenPoints;

  // Xóa khỏi rank cũ
  var oldRank = tdGetNPCRank(npcId);
  if (oldRank) {
    if (oldRank === "thien_de") thiendinhState.thienDe = null;
    else thiendinhState.officials[oldRank] = (thiendinhState.officials[oldRank]||[]).filter(function(id){ return id !== npcId; });
  }

  tdAppointOfficial(npc, rankId);
  thiendinhState.founded = true;
  if (!thiendinhState.foundedYear) thiendinhState.foundedYear = year;

  // Cập nhật title
  var existingTitleIdx = -1;
  for (var i = 0; i < npc.titles.length; i++) {
    for (var j = 0; j < tdGetRanks().length; j++) {
      if (npc.titles[i].indexOf(tdGetRanks()[j].name) !== -1) { existingTitleIdx = i; break; }
    }
    if (existingTitleIdx !== -1) break;
  }
  if (existingTitleIdx !== -1) npc.titles.splice(existingTitleIdx, 1);
  npc.titles.push(rank.icon + " " + rank.name);
  npc.reputation += rank.prestige;

  thiendinhState.heavenHistory.unshift({
    year: year,
    event: rank.icon + " " + npc.name + " được bổ nhiệm làm " + rank.name,
    npcId: npcId, rankId: rankId, type:"appoint"
  });

  addLog(rank.icon + " " + npc.name + " được bổ nhiệm làm " + rank.name + "!", "important");
  toast(rank.icon + " " + npc.name + " → " + rank.name + "!");
  renderThiendinhPanel();
  window.save();
}

// ============================
// PATCH killNPC để check Undead
// ============================

(function patchKillNPC() {
  var _orig = window.killNPC;
  if (typeof _orig !== "function") return;
  window.killNPC = function(npc, reason, killerId, force) {
    var result = _orig(npc, reason, killerId, force);
    // npc.realm đã được capture trước khi bị xóa khỏi npcs[]
    if (npc && npc.realm >= 6) {
      setTimeout(function(){ tryBecomeUndead(npc); }, 0);
    }
    return result;
  };
})();

// ============================
// PATCH renderAll (an toàn)
// ============================

(function patchRenderAll() {
  var _orig = window.renderAll;
  window.renderAll = function() {
    if (_orig) _orig();
    renderThiendinhPanel();
  };
})();

// SIM TICK — thiendinhTick được gọi trực tiếp từ simulateWorld trong app.js
// setInterval cũ đã được bỏ để tránh double-call

// ============================
// RENDER
// ============================

function renderThiendinhPanel() {
  var panel = document.getElementById("panel-thiendinh");
  if (!panel || !panel.classList.contains("active")) return;

  _tdRenderBanner();
  _tdRenderStats();
  _tdRenderRoster();
  _tdRenderUndead();
  _tdRenderPowers();
  _tdRenderPath();
  _tdRenderDecrees();
  _tdRenderHistory();
}

function _tdRenderBanner() {
  var banner = document.getElementById("tdBanner");
  if (!banner) return;
  var gc = (typeof tdGetGenreConfig === "function") ? tdGetGenreConfig() : { systemName: "Thiên Đình", leaderTitle: "Thiên Đế", memberWord: "tu sĩ", ascendWord: "phi thăng", systemIcon: "🌌" };

  if (thiendinhState.founded) {
    // Khôi phục cấu trúc banner "đã thành lập" nếu bị ghi đè
    if (!document.getElementById("tdBannerSub")) {
      banner.innerHTML =
        '<div class="td-founded-title">' + gc.systemIcon + ' ' + gc.systemName.toUpperCase() + ' — HỘI ĐỒNG TỐI CAO</div>' +
        '<div class="td-founded-sub" id="tdBannerSub"></div>';
    }
    banner.style.display = "";
    // Update title in case genre changed
    var titleEl = banner.querySelector(".td-founded-title");
    if (titleEl) titleEl.textContent = gc.systemIcon + " " + gc.systemName.toUpperCase() + " — HỘI ĐỒNG TỐI CAO";
    var bannerSub = document.getElementById("tdBannerSub");
    if (bannerSub) bannerSub.textContent = "Khai lập Năm " + thiendinhState.foundedYear +
      " · Tổng " + thiendinhState.totalAscended + " " + gc.memberWord + " " + gc.ascendWord + " · Năm hiện tại: " + (typeof year !== "undefined" ? year : 0);
  } else {
    banner.style.display = "";
    banner.innerHTML = '<div style="padding:20px;text-align:center;color:var(--white-dim)">' +
      '<div style="font-size:28px;margin-bottom:8px">🌌</div>' +
      '<div style="font-size:16px;font-weight:700;color:var(--gold);margin-bottom:6px">' + gc.systemName + ' Chưa Khai Lập</div>' +
      '<div style="font-size:12px;opacity:.7;margin-bottom:14px">Đợi đến Năm 30 để tự động thành lập, hoặc bấm nút bên dưới</div>' +
      '<button onclick="thiendinhForceFound()" style="padding:8px 20px;background:rgba(250,204,21,0.1);border:1px solid var(--gold);border-radius:8px;color:var(--gold);font-weight:700;cursor:pointer;font-size:13px">👑 Lập ' + gc.systemName + ' Ngay</button>' +
    '</div>';
  }
}

function thiendinhForceFound() {
  if (!world) { if (typeof toast === "function") toast("⚠️ Hãy khai sinh thế giới trước!"); return; }
  if (thiendinhState.founded) { if (typeof toast === "function") toast("Thiên Đình đã được thành lập!"); return; }
  var alive = (typeof npcs !== "undefined") ? npcs.filter(function(n){ return n.status === "alive"; }) : [];
  if (alive.length < 1) { if (typeof toast === "function") toast("⚠️ Cần ít nhất 1 tu sĩ!"); return; }
  alive.sort(function(a,b){ return (b.realm||0) - (a.realm||0); });
  var top = alive[0];
  var gc = (typeof tdGetGenreConfig === "function") ? tdGetGenreConfig() : { systemName:"Thiên Đình", leaderTitle:"Thiên Đế", memberWord:"tu sĩ", ascendWord:"phi thăng" };
  thiendinhState.founded    = true;
  thiendinhState.foundedYear = (typeof year !== "undefined" ? year : 0);
  thiendinhState.thienDe    = top.id;
  if (!top.titles) top.titles = [];
  top.titles.push("👑 " + gc.leaderTitle);
  top.reputation = (top.reputation || 0) + 5000;
  var rankIds = ["thien_ton","thien_quan","thien_tuong"];
  alive.slice(1, 4).forEach(function(npc, i) {
    var rId = rankIds[i];
    if (!thiendinhState.officials[rId]) thiendinhState.officials[rId] = [];
    thiendinhState.officials[rId].push(npc.id);
  });
  thiendinhState.heavenHistory.unshift({ year: thiendinhState.foundedYear, event: "👑 " + top.name + " khai lập " + gc.systemName, npcId: top.id, type: "founded" });
  if (typeof addLog === "function") addLog("🌌 " + gc.systemName + " khai lập! " + top.name + " xưng " + gc.leaderTitle + "!", "important");
  if (typeof toast === "function") toast("🌌 " + gc.systemName + " đã khai lập!");
  if (typeof save === "function") save();
  renderThiendinhPanel();
}

function _tdRenderStats() {
  var el = document.getElementById("tdStatsRow");
  if (!el) return;
  var gc = tdGetGenreConfig();
  var totalOfficials = Object.values(thiendinhState.officials).reduce(function(s,a){ return s+a.length; }, 0)
    + (thiendinhState.thienDe ? 1 : 0);
  var chantienAlive = npcs.filter(function(n){ return n.status==="alive" && n.realm>=8; }).length;
  var deNpc = thiendinhState.thienDe ? npcById(thiendinhState.thienDe) : null;

  var stats = [
    { icon:"👑", label: gc.leaderTitle,       val: deNpc ? deNpc.name : "Trống"  },
    { icon:"🏛️", label:"Tổng Chức Quan",      val: totalOfficials                 },
    { icon:"✨", label: gc.ascendCondition,    val: chantienAlive                  },
    { icon:"☠️", label:"Undead",               val: thiendinhState.undead.length   },
    { icon:"🌅", label:"Đã " + gc.ascendWord,  val: thiendinhState.totalAscended   },
    { icon:"⚡", label:"Quyền Năng Dùng",      val: thiendinhState.heavenPowerUsed },
  ];
  el.innerHTML = stats.map(function(s) {
    return '<div class="td-stat-card"><div class="td-stat-icon">' + s.icon +
      '</div><div class="td-stat-val">' + s.val +
      '</div><div class="td-stat-label">' + s.label + '</div></div>';
  }).join("");
}

function _tdRenderRoster() {
  var el = document.getElementById("tdRoster");
  if (!el) return;
  var html = "";
  tdGetRanks().forEach(function(rank) {
    var ids      = rank.id === "thien_de" ? (thiendinhState.thienDe ? [thiendinhState.thienDe] : []) : (thiendinhState.officials[rank.id] || []);
    var used     = ids.length;
    var max      = rank.id === "thien_de" ? 1 : rank.slots;
    var fillPct  = max > 0 ? Math.min(100, (used / max) * 100) : 0;

    html += '<div class="td-rank-section">' +
      '<div class="td-rank-header" style="border-color:' + rank.color + '33;background:' + rank.color + '08">' +
        '<div style="display:flex;align-items:center;gap:10px;flex:1">' +
          '<div class="td-rank-icon" style="background:' + rank.color + '15;border-color:' + rank.color + '33;box-shadow:0 0 12px ' + rank.glowColor + '">' + rank.icon + '</div>' +
          '<div>' +
            '<div class="td-rank-name" style="color:' + rank.color + '">' + rank.name + ' <span style="font-size:10px;opacity:.6">' + rank.title + '</span></div>' +
            '<div class="td-rank-authority">' + rank.authority + '</div>' +
          '</div>' +
        '</div>' +
        '<div style="text-align:right;flex-shrink:0">' +
          '<div style="font-size:12px;color:' + rank.color + ';font-weight:700">' + used + '/' + max + '</div>' +
          '<div style="font-size:10px;color:var(--white-dim)">vị trí</div>' +
        '</div>' +
      '</div>' +
      '<div class="td-power-bar"><div class="td-power-fill" style="width:' + fillPct + '%;background:linear-gradient(90deg,' + rank.color + '66,' + rank.color + ')"></div></div>' +
      '<div style="font-size:10px;color:var(--white-dim);margin:4px 0 8px">' + rank.powerAbility + '</div>' +
      '<div class="td-members-row">' +
        (ids.length === 0
          ? '<div class="td-empty-slot">— Chưa có người giữ chức —</div>'
          : ids.map(function(id){ return _tdOfficialCard(id, rank); }).join("")) +
      '</div>' +
    '</div>';
  });
  var _gc0 = tdGetGenreConfig(); el.innerHTML = html || '<div class="td-empty">' + _gc0.systemName + ' chưa khai lập. Bổ nhiệm chức quan hoặc chờ ' + _gc0.ascendCondition + ' ' + _gc0.ascendWord + '...</div>';
}

function _tdOfficialCard(npcId, rank) {
  var npc = npcById(npcId);
  if (!npc) {
    var hof = hallOfFame.find(function(n){ return n.id === npcId; });
    if (hof) return '<div class="td-official dead-official"><span style="font-size:13px">⚰️</span>' +
      '<div><div style="font-size:11px;color:var(--white-dim);text-decoration:line-through">' + hof.name + '</div>' +
      '<div style="font-size:9px;color:var(--red)">Đã ngã</div></div></div>';
    return "";
  }
  var rc  = realmColor(npc.realm);
  var rnm = REALMS[npc.realm] ? REALMS[npc.realm].name : "?";
  var alive = npc.status === "alive";
  return '<div class="td-official' + (alive ? "" : " dead-official") + '" onclick="openNPCModal(' + npc.id + ')" style="border-color:' + rank.color + '22">' +
    '<div class="td-official-avatar" style="background:' + rc + '15;border-color:' + rc + '44;color:' + rc + '">' + (npc.gender==="Nam"?"♂":"♀") + '</div>' +
    '<div style="min-width:0">' +
      '<div style="font-size:11px;font-weight:700;color:' + (alive?"var(--white-main)":"var(--white-dim)") + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + npc.name + '</div>' +
      '<div style="font-size:10px;color:' + rc + '">' + rnm + '</div>' +
      (!alive ? '<div style="font-size:9px;color:var(--red)">☠ Đã ngã</div>' : '') +
    '</div>' +
  '</div>';
}

function _tdRenderUndead() {
  var el = document.getElementById("tdUndead");
  var uc = document.getElementById("tdUndeadCount");
  if (uc) uc.textContent = thiendinhState.undead.length + " Undead";
  if (!el) return;
  if (!thiendinhState.undead.length) {
    el.innerHTML = '<div class="td-empty">Chưa có Undead. Khi ' + tdGetGenreConfig().ascendCondition + ' tử vong có thể hóa thành Undead...</div>';
    return;
  }
  el.innerHTML = thiendinhState.undead.slice(0,20).map(function(u) {
    var tier = tdGetUndeadTiers().find(function(t){ return t.id===u.undeadTierId; }) || tdGetUndeadTiers()[0];
    var rnm  = REALMS[u.realm] ? REALMS[u.realm].name : "?";
    return '<div class="td-undead-card" style="border-color:' + tier.color + '33">' +
      '<div class="td-undead-icon" style="color:' + tier.color + ';text-shadow:0 0 8px ' + tier.color + '">' + tier.icon + '</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-size:12px;font-weight:700;color:' + tier.color + '">' + u.npcName + '</div>' +
        '<div style="font-size:10px;color:var(--white-dim)">' + tier.name + ' · ' + rnm + ' · Năm ' + u.diedYear + '</div>' +
        '<div style="font-size:9px;color:var(--white-faint);margin-top:2px">' + tier.desc + '</div>' +
      '</div>' +
      '<div style="text-align:right;flex-shrink:0">' +
        '<div style="font-size:11px;color:' + tier.color + ';font-weight:700">' + u.power.toLocaleString() + '</div>' +
        '<div style="font-size:9px;color:var(--white-dim)">Lực chiến</div>' +
      '</div>' +
    '</div>';
  }).join("");
}

function _tdRenderPowers() {
  var el = document.getElementById("tdPowers");
  if (!el) return;
  el.innerHTML = tdGetPowers().map(function(p) {
    return '<div class="td-power-card" onclick="useHeavenPower(\'' + p.id + '\')">' +
      '<div class="td-power-card-icon">' + p.icon + '</div>' +
      '<div class="td-power-card-name">' + p.name + '</div>' +
      '<div class="td-power-card-cost">⚡ ' + p.cost + '</div>' +
      '<div class="td-power-card-desc">' + p.desc + '</div>' +
    '</div>';
  }).join("");
}

function _tdRenderPath() {
  var el = document.getElementById("tdPath");
  if (!el) return;
  var stageCounts = {};
  npcs.filter(function(n){ return n.status==="alive"; }).forEach(function(n) {
    var s = tdPathStage(n);
    stageCounts[s] = (stageCounts[s]||0)+1;
  });
  el.innerHTML = tdGetPath().map(function(p, i) {
    var count = stageCounts[i] || 0;
    var isTop = i === 8;
    var nodeStyle = isTop ? 'background:rgba(250,204,21,0.2);border-color:var(--gold);box-shadow:0 0 15px rgba(250,204,21,0.4)' : '';
    return '<div class="td-path-step' + (isTop ? " td-path-ascend" : "") + '">' +
      '<div class="td-path-node" style="' + nodeStyle + '"><span style="font-size:' + (isTop?22:16) + 'px">' + p.icon + '</span></div>' +
      (i < tdGetPath().length-1 ? '<div class="td-path-connector"></div>' : '<div class="td-path-connector" style="display:none"></div>') +
      '<div class="td-path-info">' +
        '<div class="td-path-name' + (isTop ? " td-path-name-ascend" : "") + '">' + p.name + '</div>' +
        '<div class="td-path-desc">' + p.desc + '</div>' +
        (count > 0 ? '<div class="td-path-count">' + count + ' ' + tdGetGenreConfig().memberWord + '</div>' : '') +
      '</div>' +
    '</div>';
  }).join("");
}

function _tdRenderDecrees() {
  var el = document.getElementById("tdDecrees");
  if (!el) return;
  if (!thiendinhState.heavenLaw.length) {
    el.innerHTML = '<div style="color:var(--white-dim);font-style:italic;font-size:12px;text-align:center;padding:12px">Chưa có thiên lệnh nào được ban hành...</div>';
    return;
  }
  el.innerHTML = thiendinhState.heavenLaw.slice().reverse().slice(0,10).map(function(l) {
    return '<div class="td-law-item"><span class="td-law-year">Năm ' + l.year + '</span><span style="color:var(--blue)">' + l.text + '</span></div>';
  }).join("");
}

function _tdRenderHistory() {
  var el = document.getElementById("tdHistory");
  if (!el) return;
  if (!thiendinhState.heavenHistory.length) {
    el.innerHTML = '<div class="td-empty">' + tdGetGenreConfig().systemName + ' Sử trống. Chờ sự kiện diễn ra...</div>';
    return;
  }
  var typeColors = { ascend:"var(--gold)", undead:"var(--red)", appoint:"var(--purple)", promotion:"var(--orange)", power:"var(--blue)" };
  el.innerHTML = thiendinhState.heavenHistory.slice(0,30).map(function(h) {
    var c = typeColors[h.type] || "var(--border)";
    return '<div class="td-hist-item" style="border-left-color:' + c + '">' +
      '<span class="td-hist-year">Năm ' + h.year + '</span>' +
      '<span class="td-hist-text">' + h.event + '</span>' +
    '</div>';
  }).join("");
}

// Modal bổ nhiệm
function openAppointModal(rankId) {
  var rank = tdGetRank(rankId);
  if (!rank) return;
  var eligible = npcs.filter(function(n){ return n.status==="alive" && n.realm >= rank.minRealm; });

  var html = '<div style="margin-bottom:16px">' +
    '<div style="font-family:var(--font-heading);font-size:16px;color:' + rank.color + ';margin-bottom:4px">' + rank.icon + ' Bổ Nhiệm ' + rank.name + '</div>' +
    '<div style="font-size:12px;color:var(--white-dim)">Cần: ' + (REALMS[rank.minRealm]?REALMS[rank.minRealm].name:"?") + ' · Chi phí: 200 ' + tdGetGenreConfig().currency + '</div>' +
  '</div>';

  if (!eligible.length) {
    html += '<div style="color:var(--white-dim);text-align:center;padding:20px">Không có ' + tdGetGenreConfig().memberWord + ' đủ điều kiện (cần ' + (REALMS[rank.minRealm]?REALMS[rank.minRealm].name:"?") + ')</div>';
  } else {
    html += '<div style="display:flex;flex-direction:column;gap:6px;max-height:400px;overflow-y:auto">';
    eligible.slice(0,30).forEach(function(n) {
      var col = realmColor(n.realm);
      var curR = tdGetNPCRank(n.id);
      var curRD = curR ? tdGetRank(curR) : null;
      html += '<div onclick="manualAppointNPC(' + n.id + ',\'' + rankId + '\');closeModalBtn()" ' +
        'style="display:flex;align-items:center;gap:10px;padding:8px 12px;border:1px solid var(--border);border-radius:8px;cursor:pointer;transition:all 0.15s" ' +
        'onmouseover="this.style.borderColor=\'' + rank.color + '\'" onmouseout="this.style.borderColor=\'var(--border)\'">' +
        '<div style="width:32px;height:32px;border-radius:50%;border:1px solid ' + col + '44;background:' + col + '10;display:flex;align-items:center;justify-content:center;color:' + col + ';font-size:14px">' + (n.gender==="Nam"?"♂":"♀") + '</div>' +
        '<div style="flex:1">' +
          '<div style="font-size:13px;color:var(--white-main)">' + n.name + '</div>' +
          '<div style="font-size:11px;color:' + col + '">' + (REALMS[n.realm]?REALMS[n.realm].name:"?") + ' · Luck ' + n.luck + '</div>' +
          (curRD ? '<div style="font-size:9px;color:var(--white-dim)">Hiện: ' + curRD.name + '</div>' : '') +
        '</div>' +
        '<div style="font-size:11px;color:var(--white-dim)">' + n.reputation.toLocaleString() + ' uy danh</div>' +
      '</div>';
    });
    html += '</div>';
  }

  // Dùng modal system có sẵn
  var overlay = document.getElementById("modalOverlay");
  var content = document.getElementById("modalContent");
  if (overlay && content) {
    content.innerHTML = html;
    overlay.classList.remove("hidden");
  }
}

// ============================
// CSS INJECTION
// ============================

(function injectTDCss() {
  if (document.getElementById("td-css")) return;
  var style = document.createElement("style");
  style.id = "td-css";
  style.textContent = [
    ".td-stats-row{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:14px}",
    "@media(max-width:768px){.td-stats-row{grid-template-columns:repeat(3,1fr)}}",
    ".td-stat-card{background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:8px;padding:10px 8px;text-align:center;transition:all .2s}",
    ".td-stat-card:hover{border-color:var(--border-hover);background:rgba(255,255,255,.05)}",
    ".td-stat-icon{font-size:18px;margin-bottom:4px}",
    ".td-stat-val{font-size:13px;font-weight:700;color:var(--gold);margin-bottom:2px;word-break:break-all}",
    ".td-stat-label{font-size:9px;color:var(--white-dim);letter-spacing:.5px}",
    ".td-rank-section{background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px}",
    ".td-rank-header{display:flex;align-items:center;gap:10px;padding:10px;border-radius:8px;border:1px solid;margin-bottom:6px}",
    ".td-rank-icon{width:40px;height:40px;border-radius:10px;border:1px solid;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;transition:box-shadow .3s}",
    ".td-rank-name{font-family:var(--font-heading);font-size:13px;letter-spacing:1px}",
    ".td-rank-authority{font-size:10px;color:var(--white-dim);margin-top:1px}",
    ".td-power-bar{height:2px;background:var(--border);border-radius:1px;overflow:hidden;margin-bottom:4px}",
    ".td-power-fill{height:100%;border-radius:1px;transition:width .5s ease}",
    ".td-members-row{display:flex;flex-wrap:wrap;gap:6px}",
    ".td-empty-slot{font-size:11px;color:var(--white-dim);font-style:italic;padding:8px;width:100%;text-align:center;border:1px dashed var(--border);border-radius:6px}",
    ".td-empty{text-align:center;padding:30px 20px;color:var(--white-dim);font-style:italic;font-size:13px;line-height:1.8}",
    ".td-official{display:flex;align-items:center;gap:7px;padding:6px 10px;border:1px solid var(--border);border-radius:8px;background:rgba(255,255,255,.025);cursor:pointer;transition:all .2s;min-width:110px}",
    ".td-official:hover{background:rgba(255,255,255,.05);transform:translateY(-2px)}",
    ".td-official.dead-official{opacity:.45;filter:grayscale(.6);pointer-events:none}",
    ".td-official-avatar{width:28px;height:28px;border-radius:50%;border:1px solid;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0}",
    ".td-undead-card{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid;border-radius:8px;background:rgba(0,0,0,.25);margin-bottom:6px;transition:all .2s}",
    ".td-undead-card:hover{background:rgba(0,0,0,.4);transform:translateX(3px)}",
    ".td-undead-icon{font-size:24px;flex-shrink:0;filter:drop-shadow(0 0 6px currentColor)}",
    ".td-powers-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}",
    "@media(max-width:768px){.td-powers-grid{grid-template-columns:repeat(2,1fr)}}",
    ".td-power-card{background:linear-gradient(135deg,rgba(96,165,250,.05),rgba(192,132,252,.08));border:1px solid rgba(96,165,250,.2);border-radius:10px;padding:12px 10px;text-align:center;cursor:pointer;transition:all .2s}",
    ".td-power-card:hover{border-color:var(--blue);background:linear-gradient(135deg,rgba(96,165,250,.12),rgba(192,132,252,.15));transform:translateY(-2px);box-shadow:0 4px 16px rgba(96,165,250,.15)}",
    ".td-power-card-icon{font-size:22px;margin-bottom:5px}",
    ".td-power-card-name{font-size:12px;color:var(--white-main);font-weight:600;margin-bottom:3px}",
    ".td-power-card-cost{font-size:12px;color:var(--gold);font-weight:700;margin-bottom:4px}",
    ".td-power-card-desc{font-size:10px;color:var(--white-dim);line-height:1.4}",
    ".td-path-wrap{display:flex;flex-direction:column;gap:0;padding:8px 0}",
    ".td-path-step{display:flex;align-items:flex-start;gap:12px;position:relative}",
    ".td-path-node{width:36px;height:36px;border-radius:50%;border:2px solid var(--border);background:rgba(255,255,255,.03);display:flex;align-items:center;justify-content:center;flex-shrink:0;z-index:2;transition:all .3s}",
    ".td-path-connector{position:absolute;left:17px;top:36px;width:2px;height:20px;background:linear-gradient(180deg,var(--border),transparent)}",
    ".td-path-info{flex:1;padding:6px 0 20px}",
    ".td-path-name{font-size:13px;font-weight:600;color:var(--white-main);margin-bottom:2px}",
    ".td-path-name-ascend{color:var(--gold)!important;font-family:var(--font-heading);text-shadow:0 0 10px rgba(250,204,21,.5)}",
    ".td-path-desc{font-size:11px;color:var(--white-dim)}",
    ".td-path-count{display:inline-block;margin-top:4px;padding:1px 8px;border-radius:10px;font-size:10px;font-weight:700;background:rgba(250,204,21,.1);color:var(--gold);border:1px solid rgba(250,204,21,.25)}",
    ".td-path-ascend .td-path-node{animation:td-pulse-gold 2s ease-in-out infinite}",
    "@keyframes td-pulse-gold{0%,100%{box-shadow:0 0 0 0 rgba(250,204,21,.4)}50%{box-shadow:0 0 0 8px rgba(250,204,21,0)}}",
    ".td-law-item{display:flex;gap:10px;align-items:baseline;padding:6px 10px;background:rgba(255,255,255,.02);border:1px solid rgba(96,165,250,.15);border-left:3px solid rgba(96,165,250,.4);border-radius:6px;margin-bottom:5px;font-size:12px}",
    ".td-law-year{font-size:10px;color:var(--blue);font-weight:700;flex-shrink:0}",
    ".td-hist-item{display:flex;gap:10px;align-items:baseline;font-size:12px;padding:6px 10px;background:rgba(255,255,255,.02);border:1px solid var(--border);border-radius:6px;border-left:3px solid var(--gold-dim);margin-bottom:5px}",
    ".td-hist-year{font-size:10px;color:var(--gold-dim);font-weight:700;flex-shrink:0;white-space:nowrap}",
    ".td-hist-text{color:var(--white-main)}",
    ".td-appoint-btn{padding:3px 10px;font-size:10px;background:transparent;border:1px solid rgba(250,204,21,.25);border-radius:6px;cursor:pointer;color:var(--gold-dim);transition:all .15s;font-family:var(--font-cjk),serif}",
    ".td-appoint-btn:hover{border-color:var(--gold);color:var(--gold);background:rgba(250,204,21,.06)}",
    ".td-founded-banner{background:linear-gradient(135deg,rgba(250,204,21,.08),rgba(249,115,22,.06));border:1px solid rgba(250,204,21,.2);border-radius:10px;padding:12px 16px;margin-bottom:14px;text-align:center;position:relative;overflow:hidden}",
    ".td-founded-banner::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at top center,rgba(250,204,21,.08),transparent 70%);pointer-events:none}",
    ".td-founded-title{font-family:var(--font-heading);font-size:15px;color:var(--gold);letter-spacing:2px;margin-bottom:4px}",
    ".td-founded-sub{font-size:11px;color:var(--white-dim)}",
  ].join("");
  document.head.appendChild(style);
})();

// ============================
// HTML INJECTION — đợi DOM sẵn sàng
// ============================

function injectTDHtml() {
  // Nav button
  var nav = document.querySelector(".sidebar-nav");
  if (nav && !document.querySelector('[data-panel="thiendinh"]')) {
    var btn = document.createElement("button");
    btn.className = "nav-btn";
    btn.setAttribute("data-panel", "thiendinh");
    btn.setAttribute("onclick", "showPanel('thiendinh')");
    btn.innerHTML = '<span class="nav-icon">' + tdGetGenreConfig().systemIcon + '</span><span>' + tdGetGenreConfig().systemName + '</span>';
    nav.appendChild(btn);
  }

  // Panel
  var panels = document.querySelector(".panels");
  if (panels && !document.getElementById("panel-thiendinh")) {
    var div = document.createElement("div");
    div.id        = "panel-thiendinh";
    div.className = "panel";

    // Build appoint buttons string
    var appointBtns = tdGetRanks().map(function(r) {
      return '<button class="td-appoint-btn" onclick="openAppointModal(\'' + r.id + '\')">' + r.icon + ' Bổ nhiệm ' + r.name + '</button>';
    }).join("");

    var _initGC = tdGetGenreConfig();
    div.innerHTML =
      '<div id="tdBanner" class="td-founded-banner" style="display:none">' +
        '<div class="td-founded-title">' + _initGC.systemIcon + ' ' + _initGC.systemName.toUpperCase() + ' — HỘI ĐỒNG TỐI CAO</div>' +
        '<div class="td-founded-sub" id="tdBannerSub"></div>' +
      '</div>' +
      '<div class="dash-section" style="margin-bottom:14px">' +
        '<div class="dash-title">📊 ' + _initGC.systemName.toUpperCase() + ' TỔNG QUAN</div>' +
        '<div class="td-stats-row" id="tdStatsRow"></div>' +
      '</div>' +
      '<div class="panel-grid">' +
        '<div>' +
          '<div class="card" style="margin-bottom:14px">' +
            '<div class="card-title">👑 HỆ THỐNG CẤP BẬC — ' + _initGC.systemName.toUpperCase() + '</div>' +
            '<div id="tdRoster" style="margin-top:10px"></div>' +
          '</div>' +
          '<div class="card">' +
            '<div class="card-title" style="display:flex;align-items:center;justify-content:space-between">' +
              '<span>☠️ UNDEAD — BẤT TỬ CẢNH GIỚI</span>' +
              '<span id="tdUndeadCount" style="font-size:11px;color:var(--white-dim)"></span>' +
            '</div>' +
            '<div id="tdUndead" style="margin-top:10px;max-height:320px;overflow-y:auto"></div>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div class="card" style="margin-bottom:14px">' +
            '<div class="card-title">⚡ QUYỀN NĂNG — ' + _initGC.systemName.toUpperCase() + '</div>' +
            '<div class="td-powers-grid" id="tdPowers" style="margin-top:10px"></div>' +
          '</div>' +
          '<div class="card" style="margin-bottom:14px">' +
            '<div class="card-title">📜 BỔ NHIỆM CHỨC QUAN</div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">' + appointBtns + '</div>' +
          '</div>' +
          '<div class="card" style="margin-bottom:14px">' +
            '<div class="card-title">🌿 CON ĐƯỜNG THĂNG TIẾN</div>' +
            '<div class="td-path-wrap" id="tdPath" style="margin-top:10px"></div>' +
          '</div>' +
          '<div class="card" style="margin-bottom:14px">' +
            '<div class="card-title">📜 ' + _initGC.lawWord.toUpperCase() + ' ĐÃ BAN</div>' +
            '<div id="tdDecrees" style="margin-top:10px;max-height:180px;overflow-y:auto"></div>' +
          '</div>' +
          '<div class="card">' +
            '<div class="card-title">🌌 ' + _initGC.systemName.toUpperCase() + ' SỬ KÝ</div>' +
            '<div id="tdHistory" style="margin-top:10px;max-height:280px;overflow-y:auto"></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    panels.appendChild(div);
  }
}

// Đợi DOM ready rồi mới inject
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(injectTDHtml, 100);
    setTimeout(function() { if (typeof thiendinhTick === "function") try { thiendinhTick(); } catch(e){} }, 1200);
  });
} else {
  setTimeout(injectTDHtml, 100);
  setTimeout(function() { if (typeof thiendinhTick === "function") try { thiendinhTick(); } catch(e){} }, 1200);
}

// ============================
// GENRE CHANGE WATCHER — re-render panel + update nav title when world changes
// ============================
(function patchWorldChange() {
  var _lastKey = null;
  setInterval(function() {
    var curKey = (typeof world !== "undefined" && world)
      ? (world.templateKey || world.genre || "cultivation") : null;
    if (curKey && curKey !== _lastKey) {
      _lastKey = curKey;
      // Update nav button label
      var navBtn = document.querySelector(".nav-btn[data-panel='thiendinh']");
      if (navBtn) {
        var gc = tdGetGenreConfig();
        navBtn.innerHTML = '<span class="nav-icon">' + gc.systemIcon + '</span><span>' + gc.systemName + '</span>';
      }
      // Update section titles in panel
      var banner = document.querySelector("#tdBanner .td-founded-title");
      if (banner) {
        var gc2 = tdGetGenreConfig();
        banner.textContent = gc2.systemIcon + " " + gc2.systemName.toUpperCase() + " — HỘI ĐỒNG TỐI CAO";
      }
      // Re-render panel nếu đang mở
      renderThiendinhPanel();
    }
  }, 2000);
})();

console.log("🌌 Thiên Đình System V2.0 (Genre-Adaptive) loaded!");