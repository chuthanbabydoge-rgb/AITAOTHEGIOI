(function() {
  "use strict";
  const SAVE_KEY = "cgv6_myth_artifacts_v42";

  // ═══════════════════════════════════════════════════════════
  // MYTHOLOGY ARTIFACT SYSTEM V42 — Thánh Vật & Thần Khí
  // ═══════════════════════════════════════════════════════════

  const DEFAULT_ARTIFACTS = [
    // Việt Nam
    { id:"a_no_than",        pantheon:"vietnam",  name:"Nỏ Thần Liên Châu",   type:"Vũ Khí",   icon:"🏹", power:95, owner:"Vua An Dương Vương",  desc:"Nỏ thần bắn nghìn mũi tên một lúc, làm từ vuốt Kim Quy — bảo bối giữ nước Âu Lạc", effect:"Bắn nghìn tên, bảo vệ quốc gia" },
    { id:"a_giem_than",      pantheon:"vietnam",  name:"Kiếm Thần",            type:"Vũ Khí",   icon:"⚔️", power:90, owner:"Vua Lê Lợi",          desc:"Rùa Vàng cho Lê Lợi mượn để đánh giặc Minh, sau đòi lại tại Hồ Hoàn Kiếm", effect:"Chiến thắng giặc ngoại xâm" },
    { id:"a_roi_than",       pantheon:"vietnam",  name:"Roi Sắt Thánh Gióng",  type:"Vũ Khí",   icon:"⚡", power:92, owner:"Thánh Gióng",          desc:"Roi sắt ba tuấn mã và bó tre khổng lồ diệt giặc Ân", effect:"Diệt trăm vạn giặc" },
    // Hy Lạp
    { id:"a_mjolnir",        pantheon:"norse",    name:"Mjolnir",              type:"Búa Thần", icon:"🔨", power:97, owner:"Thor",                 desc:"Búa thần của Thor, chỉ người xứng đáng mới cầm được — sấm sét và bảo vệ Asgard", effect:"Điều khiển sấm sét, trở về tay chủ" },
    { id:"a_gungnir",        pantheon:"norse",    name:"Gungnir",              type:"Giáo Thần",icon:"🗡️", power:98, owner:"Odin",                 desc:"Giáo thần của Odin không bao giờ trật mục tiêu, tượng trưng cho kết thúc Ragnarök", effect:"Không bao giờ trượt" },
    { id:"a_excalibur",      pantheon:"celtic",   name:"Excalibur",            type:"Kiếm",     icon:"⚔️", power:93, owner:"King Arthur",          desc:"Kiếm rút từ đá của Vua Arthur, biểu tượng vương quyền Britain", effect:"Kiếm không thể bẻ gãy, ban vương quyền" },
    { id:"a_trident_pose",   pantheon:"greek",    name:"Đinh Ba Poseidon",     type:"Vũ Khí",   icon:"🔱", power:96, owner:"Poseidon",             desc:"Đinh ba ba răng của Poseidon — gây động đất và bão biển", effect:"Gây động đất, chỉ huy biển" },
    { id:"a_aegis",          pantheon:"greek",    name:"Aegis",                type:"Khiên",    icon:"🛡️", power:94, owner:"Zeus / Athena",        desc:"Khiên huyền diệu của Zeus với đầu Medusa — khiến kẻ thù khiếp sợ", effect:"Gây kinh hoàng, bảo vệ tuyệt đối" },
    { id:"a_thunderbolt",    pantheon:"greek",    name:"Sấm Sét Zeus",         type:"Vũ Khí",   icon:"⚡", power:100,owner:"Zeus",                 desc:"Vũ khí tối thượng của Zeus, đánh hạ bất kỳ kẻ thù nào", effect:"Sức mạnh tuyệt đối" },
    // Ai Cập
    { id:"a_was_scepter",    pantheon:"egypt",    name:"Phất Trần Was",        type:"Trượng",   icon:"🪄", power:88, owner:"Các Thần Ai Cập",      desc:"Trượng đầu thú Was — biểu tượng quyền năng và thống trị", effect:"Ban quyền năng thần thánh" },
    { id:"a_book_thoth",     pantheon:"egypt",    name:"Sách Thoth",           type:"Bí Kíp",   icon:"📜", power:95, owner:"Thoth",                desc:"Cuốn sách chứa tri thức tối thượng của vũ trụ, ai đọc được sẽ hiểu vạn vật", effect:"Tri thức vô hạn, ma thuật tối thượng" },
    // Trung Hoa
    { id:"a_ruyi_jingu",     pantheon:"chinese",  name:"Như Ý Kim Cô Bổng",    type:"Vũ Khí",   icon:"🪄", power:96, owner:"Tôn Ngộ Không",        desc:"Gậy thần 13.500 cân của Tôn Ngộ Không, có thể to nhỏ tùy ý", effect:"Biến hóa kích thước, sức mạnh vô song" },
    { id:"a_fan_huoyan",     pantheon:"chinese",  name:"Quạt Ba Tiêu",         type:"Bảo Vật",  icon:"🌬️", power:88, owner:"Thiết Phiến Công Chúa",desc:"Quạt thần có thể tắt Hỏa Diệm Sơn và tạo gió cuốn mọi vật", effect:"Tắt lửa, tạo bão tố" },
    { id:"a_peach_immortal", pantheon:"chinese",  name:"Đào Tiên",             type:"Bảo Vật",  icon:"🍑", power:92, owner:"Vương Mẫu Nương Nương",desc:"Đào trong Vườn Tiên — ăn vào trường sinh bất tử hàng nghìn năm", effect:"Trường sinh bất tử" },
    // Nhật Bản
    { id:"a_kusanagi",       pantheon:"japanese", name:"Kusanagi-no-Tsurugi",  type:"Kiếm",     icon:"⚔️", power:95, owner:"Yamato Takeru",        desc:"Kiếm thần lấy từ thân Yamata no Orochi — một trong ba bảo vật hoàng gia Nhật", effect:"Cắt gió, điều khiển gió" },
    { id:"a_yata_mirror",    pantheon:"japanese", name:"Gương Yata",            type:"Bảo Vật",  icon:"🪞", power:93, owner:"Amaterasu",            desc:"Gương thiêng dụ Amaterasu ra khỏi hang, một trong ba thần khí Nhật Bản", effect:"Phản chiếu sự thật tuyệt đối" },
    // Ấn Độ
    { id:"a_vajra_india",    pantheon:"hindu",    name:"Vajra",                type:"Vũ Khí",   icon:"⚡", power:95, owner:"Indra",                desc:"Kim Cương Quyền — vũ khí sét của Indra, cứng như kim cương, mạnh như sấm", effect:"Sét tuyệt đối, không thể phá hủy" },
    { id:"a_trishula",       pantheon:"hindu",    name:"Trishula",             type:"Giáo Ba",  icon:"🔱", power:98, owner:"Shiva",                desc:"Đinh ba của Shiva — biểu tượng ba khía cạnh (Tạo/Duy/Hủy), vũ khí hủy diệt tối cao", effect:"Hủy diệt mọi thứ, kể cả thần" },
    // Maya
    { id:"a_obsidian_blade", pantheon:"maya",     name:"Dao Obsidian Thiêng",  type:"Vũ Khí",   icon:"🗡️", power:85, owner:"Thầy Tế Lễ Maya",     desc:"Dao đá núi lửa dùng trong nghi lễ hiến tế — kết nối với thế giới thần linh", effect:"Mở cổng thần giới" },
    // Custom
    { id:"a_creator_orb",    pantheon:"custom",   name:"Cầu Sáng Thế",         type:"Bảo Vật",  icon:"🔮", power:100,owner:"Creator God",           desc:"Vật thể tối thượng do Creator God tạo ra — chứa đựng nguồn năng lượng ban đầu của vũ trụ", effect:"Tạo hóa và hủy diệt tùy ý" }
  ];

  window.mythologyArtifactData = window.mythologyArtifactData || { artifacts: [], filter: "all", lastId: 0 };

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.mythologyArtifactData)); } catch(e) {} }

  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.mythologyArtifactData = JSON.parse(d);
      if (!window.mythologyArtifactData.artifacts || window.mythologyArtifactData.artifacts.length === 0) {
        window.mythologyArtifactData.artifacts = DEFAULT_ARTIFACTS.slice();
        window.mythologyArtifactData.lastId = DEFAULT_ARTIFACTS.length;
      }
    } catch(e) { window.mythologyArtifactData.artifacts = DEFAULT_ARTIFACTS.slice(); }
  }

  window.masGetAll = function() { return window.mythologyArtifactData.artifacts || []; };

  window.masAddArtifact = function(obj) {
    window.mythologyArtifactData.lastId = (window.mythologyArtifactData.lastId || 0) + 1;
    const a = Object.assign({ id: "custom_artifact_" + window.mythologyArtifactData.lastId, pantheon: "custom", power: 80, type: "Bảo Vật" }, obj);
    window.mythologyArtifactData.artifacts.push(a);
    if (typeof window.mdbUpdateStats === 'function') window.mdbUpdateStats({ totalArtifacts: window.mythologyArtifactData.artifacts.length });
    save();
    if (typeof window.htAddEvent === 'function') window.htAddEvent({ year: window.year || 1, type: "artifact", title: "⚔️ Thánh Vật Mới: " + a.name, color: "#3b82f6" });
    window.masRenderPanel();
  };

  window.masDeleteArtifact = function(id) {
    window.mythologyArtifactData.artifacts = window.mythologyArtifactData.artifacts.filter(function(a) { return a.id !== id; });
    if (typeof window.mdbUpdateStats === 'function') window.mdbUpdateStats({ totalArtifacts: window.mythologyArtifactData.artifacts.length });
    save();
    window.masRenderPanel();
  };

  const TYPE_COLORS = { "Vũ Khí": "#ef4444", "Kiếm": "#ef4444", "Búa Thần": "#f97316", "Giáo Thần": "#f97316", "Giáo Ba": "#f97316", "Khiên": "#3b82f6", "Bảo Vật": "#f59e0b", "Bí Kíp": "#8b5cf6", "Trượng": "#a78bfa" };

  window.masRenderPanel = function() {
    const panel = document.getElementById("panel-myth-artifacts-v42");
    if (!panel) return;
    const data = window.mythologyArtifactData;
    const filter = data.filter || "all";
    const pantheons = typeof window.mdbGetPantheons === 'function' ? window.mdbGetPantheons() : [];
    let artifacts = data.artifacts || [];
    if (filter !== "all") artifacts = artifacts.filter(function(a) { return a.pantheon === filter; });

    const filterBtns = ['<button onclick="window.mythologyArtifactData.filter=\'all\';window.masRenderPanel()" style="padding:3px 8px;background:' + (filter==='all'?'#3b82f622':'transparent') + ';border:1px solid ' + (filter==='all'?'#3b82f6':'#1e293b') + ';color:' + (filter==='all'?'#3b82f6':'#64748b') + ';border-radius:4px;cursor:pointer;font-size:10px">Tất Cả</button>']
      .concat(pantheons.map(function(p) {
        const a = filter === p.id;
        return '<button onclick="window.mythologyArtifactData.filter=\'' + p.id + '\';window.masRenderPanel()" style="padding:3px 8px;background:' + (a?p.color+'22':'transparent') + ';border:1px solid ' + (a?p.color:'#1e293b') + ';color:' + (a?p.color:'#64748b') + ';border-radius:4px;cursor:pointer;font-size:10px">' + p.icon + ' ' + p.name.split(' ').pop() + '</button>';
      })).join(" ");

    const cards = artifacts.map(function(a) {
      const tc = TYPE_COLORS[a.type] || "#64748b";
      const pInfo = pantheons.find(function(p) { return p.id === a.pantheon; }) || {};
      const isDefault = DEFAULT_ARTIFACTS.some(function(d) { return d.id === a.id; });
      return '<div style="background:#0f172a;border:1px solid ' + tc + '33;border-left:3px solid ' + tc + ';border-radius:8px;padding:10px">' +
        '<div style="display:flex;justify-content:space-between;align-items:start">' +
          '<div style="display:flex;gap:8px;align-items:center">' +
            '<span style="font-size:20px">' + (a.icon||'⚔️') + '</span>' +
            '<div>' +
              '<div style="font-weight:bold;color:#e2e8f0;font-size:12px">' + a.name + '</div>' +
              '<div style="font-size:10px;color:' + tc + '">' + a.type + '</div>' +
              '<div style="font-size:9px;color:' + (pInfo.color||'#64748b') + '">' + (pInfo.icon||'') + ' ' + (pInfo.name||a.pantheon) + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="text-align:right">' +
            '<span style="color:#f59e0b;font-size:10px">⚡ ' + a.power + '</span>' +
            (!isDefault ? '<br><button onclick="window.masDeleteArtifact(\'' + a.id + '\')" style="margin-top:2px;background:transparent;border:none;color:#ef4444;cursor:pointer;font-size:10px">🗑</button>' : '') +
          '</div>' +
        '</div>' +
        '<div style="margin-top:5px;font-size:10px;color:#94a3b8">' + a.desc + '</div>' +
        (a.owner ? '<div style="margin-top:4px;font-size:10px;color:#60a5fa">👤 Chủ sở hữu: ' + a.owner + '</div>' : '') +
        (a.effect ? '<div style="margin-top:2px;font-size:10px;color:#a78bfa">✨ Hiệu ứng: ' + a.effect + '</div>' : '') +
      '</div>';
    }).join("");

    const addForm =
      '<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-top:12px">' +
        '<div style="font-size:11px;color:#3b82f6;font-weight:bold;margin-bottom:8px">⚔️ Thêm Thánh Vật Mới</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">' +
          '<input id="ma-name" placeholder="Tên thánh vật..." style="background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px 8px;color:#e2e8f0;font-size:11px">' +
          '<input id="ma-type" placeholder="Loại (Kiếm, Bảo Vật...)" style="background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px 8px;color:#e2e8f0;font-size:11px">' +
          '<input id="ma-icon" placeholder="Icon..." style="background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px 8px;color:#e2e8f0;font-size:11px">' +
          '<input id="ma-owner" placeholder="Chủ sở hữu..." style="background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px 8px;color:#e2e8f0;font-size:11px">' +
        '</div>' +
        '<input id="ma-desc" placeholder="Mô tả..." style="width:100%;box-sizing:border-box;background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px 8px;color:#e2e8f0;font-size:11px;margin-bottom:4px">' +
        '<input id="ma-effect" placeholder="Hiệu ứng đặc biệt..." style="width:100%;box-sizing:border-box;background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px 8px;color:#e2e8f0;font-size:11px;margin-bottom:6px">' +
        '<div style="display:flex;gap:6px">' +
          '<select id="ma-pantheon" style="flex:1;background:#1e293b;border:1px solid #334155;border-radius:4px;padding:5px;color:#e2e8f0;font-size:11px">' +
            pantheons.map(function(p){ return '<option value="'+p.id+'">'+p.icon+' '+p.name+'</option>'; }).join("") +
          '</select>' +
          '<button onclick="(function(){var n=document.getElementById(\'ma-name\').value;if(!n)return;window.masAddArtifact({name:n,type:document.getElementById(\'ma-type\').value||\'Bảo Vật\',icon:document.getElementById(\'ma-icon\').value||\'⚔️\',owner:document.getElementById(\'ma-owner\').value,desc:document.getElementById(\'ma-desc\').value,effect:document.getElementById(\'ma-effect\').value,pantheon:document.getElementById(\'ma-pantheon\').value,power:85})})()" ' +
            'style="background:#3b82f6;border:none;color:#fff;border-radius:4px;padding:5px 12px;cursor:pointer;font-size:11px;font-weight:bold">+ Tạo</button>' +
        '</div>' +
      '</div>';

    panel.innerHTML =
      '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">' +
        '<div style="font-size:13px;font-weight:bold;color:#3b82f6;margin-bottom:8px">⚔️ Thánh Vật & Thần Khí — ' + artifacts.length + ' báu vật</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">' + filterBtns + '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' + (cards || '<div style="color:#334155;text-align:center;padding:20px;grid-column:1/-1">Không có thánh vật nào</div>') + '</div>' +
        addForm +
      '</div>';
  };

  function init() {
    load();
    if (typeof window.mdbUpdateStats === 'function') window.mdbUpdateStats({ totalArtifacts: window.mythologyArtifactData.artifacts.length });
    console.log("[MythArtifactSystem V42] ⚔️ Thánh Vật — " + window.mythologyArtifactData.artifacts.length + " báu vật khởi tạo.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 2300); });
  } else {
    setTimeout(init, 2300);
  }
})();
