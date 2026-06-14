(function() {
  "use strict";
  const SAVE_KEY = "cgv6_divine_artifact_v66";

  window.divineArtifactV66Data = {
    version: 66,
    artifacts: [],        // Tất cả thần khí đã tạo
    templates: [],        // Template thần khí
    totalCreated: 0
  };

  // ════ ARTIFACT TEMPLATES ════
  const ARTIFACT_TEMPLATES = [
    {
      id:"divine_sword",     icon:"⚔️", label:"Kiếm Thần",           tier:"legendary",
      color:"#fbbf24", bonusPower:300, bonusRealm:3,
      lore:"Thanh kiếm được rèn từ ánh sáng buổi khai thiên, chứa đựng ý chí của Đấng Sáng Thế.",
      effect:"Tăng sức chiến đấu +300%. Kẻ cầm kiếm có thể đối mặt mọi kẻ thù."
    },
    {
      id:"genesis_staff",    icon:"🪄", label:"Trượng Khởi Nguyên",  tier:"legendary",
      color:"#c084fc", bonusPower:200, bonusRealm:2,
      lore:"Chiếc trượng từ buổi đầu tạo thiên lập địa — mỗi lần vung lên, thực tại run rẩy.",
      effect:"Cầm giả có thể thay đổi địa hình + tăng tu luyện x5."
    },
    {
      id:"creation_stone",   icon:"💎", label:"Viên Đá Sáng Thế",    tier:"legendary",
      color:"#818cf8", bonusPower:0,   bonusRealm:5,
      lore:"Mảnh vỡ từ buổi khai thiên lập địa đầu tiên. Chứa đựng năng lượng nguyên thủy của vũ trụ.",
      effect:"Cầm giả đạt đỉnh tu luyện tức thì + không thể chết vì già."
    },
    {
      id:"divine_crown",     icon:"👑", label:"Hoàng Miện Thiên Thần", tier:"epic",
      color:"#fcd34d", bonusPower:150, bonusRealm:2,
      lore:"Vương miện được rèn từ ánh sao trời, ban quyền cai quản hợp pháp cho người đội.",
      effect:"Cầm giả được thừa nhận là vua hợp pháp. Toàn quốc gia trung thành tuyệt đối."
    },
    {
      id:"prophecy_scroll",  icon:"📜", label:"Thiên Thư Tiên Tri",   tier:"epic",
      color:"#60a5fa", bonusPower:0,   bonusRealm:0,
      lore:"Cuộn sách chứa đựng mọi lời tiên tri của Đấng Sáng Thế — đọc xong, tương lai hiện rõ.",
      effect:"Cầm giả có thể nhìn thấy một phần tương lai. Tiên tri trở thành sự thật."
    },
    {
      id:"blessing_chalice", icon:"🏆", label:"Chén Thần Ban Phước",  tier:"epic",
      color:"#34d399", bonusPower:50,  bonusRealm:1,
      lore:"Chiếc chén chứa nước từ nguồn suối thiêng của cõi thần linh.",
      effect:"Uống nước từ chén: hồi phục mọi thương tích, giải mọi nguyền rủa."
    },
    {
      id:"divine_bell",      icon:"🔔", label:"Đại Hồng Chung Thần",  tier:"rare",
      color:"#f59e0b", bonusPower:80,  bonusRealm:0,
      lore:"Tiếng chuông vang lên có thể giải trừ mọi tà ma, mở đường trời.",
      effect:"Tiếng chuông triệu tập toàn bộ tu sĩ trong vùng + xua đuổi thiên tai."
    },
    {
      id:"guardian_shield",  icon:"🛡️", label:"Thiên Thuẫn Hộ Thế",  tier:"rare",
      color:"#38bdf8", bonusPower:0,   bonusRealm:0,
      lore:"Chiếc khiên chứa đựng ý chí bảo hộ của Đấng Sáng Thế — không thể bị phá vỡ.",
      effect:"Bảo vệ người cầm khỏi mọi thảm họa tự nhiên trong 100 năm."
    },
    {
      id:"judgment_scales",  icon:"⚖️", label:"Thiên Bình Phán Xét",  tier:"rare",
      color:"#a78bfa", bonusPower:0,   bonusRealm:0,
      lore:"Chiếc cân công lý — đặt trái tim người lên cân, biết ngay thiện ác.",
      effect:"Cầm giả có thể phán xét tội lỗi + tự động trừng phạt kẻ phản bội."
    },
    {
      id:"starlight_bow",    icon:"🏹", label:"Tinh Thiên Cung",       tier:"rare",
      color:"#e879f9", bonusPower:200, bonusRealm:1,
      lore:"Cây cung rèn từ ánh sáng của một ngôi sao chết — mỗi mũi tên là một tia sao băng.",
      effect:"Bắn trúng mục tiêu bất kỳ dù ở bất kỳ khoảng cách nào."
    }
  ];
  window.div66ArtGetTemplates = function() { return ARTIFACT_TEMPLATES; };
  window.div66ArtGetTemplate = function(id) { return ARTIFACT_TEMPLATES.find(t => t.id === id) || null; };

  // ════ CREATE ARTIFACT ════
  window.div66CreateArtifact = function(templateId, customName, targetNpcName) {
    const year = window.year || 0;
    const tmpl = ARTIFACT_TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return { ok: false, msg: "Template thần khí không hợp lệ." };

    const cost = tmpl.tier === "legendary" ? 300 : tmpl.tier === "epic" ? 150 : 80;
    if (typeof window.div66SpendEnergy === "function") {
      if (!window.div66SpendEnergy(cost)) {
        return { ok: false, msg: `Thần Năng không đủ! Cần ${cost} để tạo ${tmpl.label}.` };
      }
    }

    const artifact = {
      id: Date.now(),
      templateId,
      name: customName || tmpl.label,
      icon: tmpl.icon,
      tier: tmpl.tier,
      color: tmpl.color,
      lore: tmpl.lore,
      effect: tmpl.effect,
      bonusPower: tmpl.bonusPower,
      bonusRealm: tmpl.bonusRealm,
      createdYear: year,
      holder: targetNpcName || null,
      history: []
    };

    window.divineArtifactV66Data.artifacts.push(artifact);
    window.divineArtifactV66Data.totalCreated++;

    // Grant to NPC if specified
    if (targetNpcName) {
      _grantToNpc(artifact, targetNpcName, year);
    }

    // Record
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year, type: "divine", title: `${tmpl.icon} Thần Khí Ra Đời: ${artifact.name}`, color: tmpl.color });
    }
    if (typeof window.mem64Record === "function") {
      window.mem64Record("divine", `${tmpl.icon} ${artifact.name} Ra Đời`, tmpl.lore, 5, ["divine_artifact"]);
    }
    if (typeof window.creatorLeg66Record === "function") {
      window.creatorLeg66Record("artifact", artifact.name, targetNpcName||"Thế Giới", tmpl.lore, 5);
    }

    save();
    return { ok: true, msg: `${tmpl.icon} ${artifact.name} đã được tạo ra!${targetNpcName ? ` Trao cho ${targetNpcName}.` : ''}`, artifact };
  };

  // ════ GRANT ARTIFACT ════
  window.div66GrantArtifact = function(artifactId, npcName) {
    const year = window.year || 0;
    const artifact = window.divineArtifactV66Data.artifacts.find(a => a.id === artifactId);
    if (!artifact) return { ok: false, msg: "Thần khí không tồn tại." };
    _grantToNpc(artifact, npcName, year);
    artifact.holder = npcName;
    artifact.history.push({ action: "granted", to: npcName, year });
    save();
    return { ok: true, msg: `${artifact.icon} ${artifact.name} đã được trao cho ${npcName}!` };
  };

  function _grantToNpc(artifact, npcName, year) {
    const npcs = window.npcs || [];
    const npc = npcs.find(n => n.name === npcName && n.status === "alive");
    if (!npc) return;
    npc._divineArtifact = artifact.name;
    npc._artifactId = artifact.templateId;
    if (artifact.bonusPower > 0) npc.power = (npc.power||100) + artifact.bonusPower;
    if (artifact.bonusRealm > 0) npc._realmBonus = (npc._realmBonus||0) + artifact.bonusRealm;
    if (typeof window.npcLife65RecordLifeEvent === "function") {
      window.npcLife65RecordLifeEvent(npc.id||npc.name, `Nhận Thần Khí: ${artifact.name}`, `${npc.name} được Đấng Sáng Thế ban tặng ${artifact.name}. ${artifact.lore}`, 5);
    }
    if (typeof window.npcMem64AddMemory === "function") {
      window.npcMem64AddMemory(npc.id||npc.name, "personal", `Cầm Giữ ${artifact.icon} ${artifact.name}`, `Ta được Đấng Sáng Thế tin tưởng trao cho ${artifact.name}. Nguyện không phụ lòng tin thần linh.`, 5);
    }
  }

  window.div66ArtGetAll = function() { return window.divineArtifactV66Data.artifacts; };
  window.div66ArtGetByHolder = function(npcName) {
    return window.divineArtifactV66Data.artifacts.filter(a => a.holder === npcName);
  };
  window.div66ArtGetStats = function() {
    const d = window.divineArtifactV66Data;
    return {
      total: d.totalCreated,
      legendary: d.artifacts.filter(a => a.tier === "legendary").length,
      epic: d.artifacts.filter(a => a.tier === "epic").length,
      rare: d.artifacts.filter(a => a.tier === "rare").length,
      inHands: d.artifacts.filter(a => a.holder).length
    };
  };

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ ...window.divineArtifactV66Data, artifacts: window.divineArtifactV66Data.artifacts.slice(-50) }));
    } catch(e) {}
  }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) window.divineArtifactV66Data = { ...window.divineArtifactV66Data, ...JSON.parse(raw) };
    } catch(e) {}
  }

  function init() {
    load();
    console.log("[DivineArtifactV66] 💎 Thần Khí V66 khởi động — 10 loại thần khí từ Kiếm Thần đến Thiên Bình.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 14200); });
  } else {
    setTimeout(init, 14200);
  }
})();
