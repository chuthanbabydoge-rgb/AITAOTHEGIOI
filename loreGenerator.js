(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // LORE GENERATOR V41 — Sinh Truyền Thuyết & Sử Thi
  // Truyền Thuyết · Sử Thi · Huyền Thoại · Biên Niên Sử
  // ═══════════════════════════════════════════════════════════════════════════

  const SAVE_KEY = "cgv6_lore_v41";

  const LORE_TYPES = [
    { id:"legend",    name:"Truyền Thuyết", icon:"📜", color:"#fbbf24" },
    { id:"epic",      name:"Sử Thi",        icon:"⚔️", color:"#ef4444" },
    { id:"myth",      name:"Huyền Thoại",   icon:"🌟", color:"#a78bfa" },
    { id:"chronicle", name:"Biên Niên Sử",  icon:"📚", color:"#60a5fa" },
    { id:"prophecy",  name:"Lời Tiên Tri",  icon:"🔮", color:"#22c55e" },
    { id:"war",       name:"Chiến Sử",      icon:"🗡️", color:"#f97316" },
  ];

  var _LEGEND_PARTS = {
    hero: ["Vị anh hùng vô danh","Đấng chiến thần huyền thoại","Thiên tài tu luyện","Kẻ lang thang số phận","Người được trời chọn","Đứa trẻ không cha","Kẻ phản bội đã cải tà"],
    event: ["đã chinh phục đại lục","phá vỡ lời nguyền muôn đời","ngăn chặn sự sụp đổ của thiên đình","tìm ra bí mật của hư không","thức tỉnh con rồng ngủ ngàn năm","khai mở cánh cổng đến vũ trụ khác","đánh bại ác thần trong bóng tối"],
    reward: ["Từ đó,","Và thế giới từ đó","Huyền sử kể rằng sau đó","Thiên cơ xoay chuyển,"],
    ending: ["hòa bình ngự trị ngàn năm.","sức mạnh thần linh lan tỏa khắp nơi.","tộc người vươn lên cai trị các vì sao.","đại chiến bắt đầu kéo theo cả trời đất.","một kỷ nguyên mới bắt đầu từ đây."],
    place: ["Trên đỉnh Thái Hư Sơn","Dưới vực sâu Hư Không","Tại cánh cổng Thiên Môn","Nơi hai vũ trụ va chạm","Trong lòng đại dương không đáy","Tại điểm giao nhau của mười hai mạch linh"],
  };

  var _EPIC_TEMPLATES = [
    "Đại Chiến {place}: {hero} {event}. {reward} {ending}",
    "Huyền Sử {place}: Khi {hero} xuất hiện, {event}. {reward} {ending}",
    "{place} — {hero} đơn thương độc mã {event}. {reward} {ending}",
  ];

  var _PROPHECY_TEMPLATES = [
    "Khi bầu trời rơi màu máu, {hero} sẽ xuất hiện và {event}.",
    "Lời tiên tri cổ xưa nói rằng: {place}, {hero} sẽ {event}.",
    "Trước khi mặt trời lặn lần cuối, {hero} sẽ {event} — {ending}",
  ];

  var _CHRONICLE_TEMPLATES = [
    "Năm {year}: {place}. {hero} {event}. {reward} {ending}",
    "Biên niên sử năm {year} ghi chép: {hero} xuất hiện tại {place} và {event}.",
  ];

  function _pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
  function _now() { return typeof window.year!=="undefined"?window.year:0; }

  function _fillTemplate(tpl) {
    return tpl
      .replace("{hero}",   _pick(_LEGEND_PARTS.hero))
      .replace("{event}",  _pick(_LEGEND_PARTS.event))
      .replace("{reward}", _pick(_LEGEND_PARTS.reward))
      .replace("{ending}", _pick(_LEGEND_PARTS.ending))
      .replace("{place}",  _pick(_LEGEND_PARTS.place))
      .replace("{year}",   String(_now()));
  }

  function _getWorldContext() {
    var ctx = { kingdoms:[], empires:[], npcs:[], gods:[] };
    if (window.kingdomData && window.kingdomData.kingdoms) {
      var arr = Array.isArray(window.kingdomData.kingdoms)?window.kingdomData.kingdoms:Object.values(window.kingdomData.kingdoms||{});
      ctx.kingdoms = arr.map(function(k){return k.name||"Vương Quốc";});
    }
    if (typeof npcs!=="undefined" && Array.isArray(npcs)) {
      var alive = npcs.filter(function(n){return n.status==="alive"&&n.name;});
      ctx.npcs = alive.slice(0,5).map(function(n){return n.name;});
    }
    return ctx;
  }

  function defaultData() { return { lores: [], totalGenerated: 0 }; }
  window.lgData = window.lgData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ lores: window.lgData.lores.slice(0,50), totalGenerated: window.lgData.totalGenerated })); } catch(e) {} }
  function load() { try { var r=localStorage.getItem(SAVE_KEY); if(r){var p=JSON.parse(r);if(p)window.lgData=Object.assign(defaultData(),p);} } catch(e) {} }

  var _ctr = 1;

  window.lgGenerateLore = function(opts) {
    opts = opts || {};
    var ltype = LORE_TYPES.find(function(t){return t.id===(opts.type||"legend");}) || LORE_TYPES[0];
    var ctx   = _getWorldContext();

    var templatePool = ltype.id==="prophecy" ? _PROPHECY_TEMPLATES : ltype.id==="chronicle" ? _CHRONICLE_TEMPLATES : _EPIC_TEMPLATES;
    var tpl = _pick(templatePool);
    var text = _fillTemplate(tpl);

    // Thêm tên thực nếu có
    if (ctx.kingdoms.length>0) text = text.replace("đại lục", ctx.kingdoms[0]||"đại lục");
    if (ctx.npcs.length>0) text = text.replace("Vị anh hùng vô danh", ctx.npcs[0]||"Vị anh hùng vô danh");

    var lore = {
      id: "lore_v41_" + Date.now() + "_" + (_ctr++),
      type: ltype.id, typeName: ltype.name, typeIcon: ltype.icon, typeColor: ltype.color,
      title: opts.title || (ltype.name + " #" + (window.lgData.totalGenerated+1)),
      text: text, year: _now(), ts: Date.now(),
      tags: opts.tags || [ltype.id],
    };

    window.lgData.lores.unshift(lore);
    window.lgData.totalGenerated++;
    if (window.lgData.lores.length > 50) window.lgData.lores.pop();

    if (typeof window.wmeAddMemory==="function") window.wmeAddMemory({ year:_now(), category:"lore", title:lore.typeName + ": " + lore.title, content:lore.text.slice(0,120) });
    if (typeof window.htAddEvent  ==="function") window.htAddEvent({ year:_now(), type:"lore", title:"[Lore] " + lore.title, color:ltype.color });
    save();
    return lore;
  };

  window.lgRenderPanel = function() {
    var el = document.getElementById("panel-creator-lore-v41");
    if (!el) return;
    var lores = window.lgData.lores;

    var typeButtons = LORE_TYPES.map(function(t) {
      return '<button onclick="lgGenerateLore({type:\'' + t.id + '\'});lgRenderPanel()" '
        + 'style="flex:1;padding:10px 4px;background:#0f172a;border:1px solid ' + t.color + '44;border-radius:8px;color:' + t.color + ';cursor:pointer;font-size:10px;font-family:\'Noto Serif SC\',serif;text-align:center">'
        + '<div style="font-size:16px">' + t.icon + '</div>'
        + '<div style="font-weight:600">' + t.name + '</div>'
        + '</button>';
    }).join("");

    var loreCards = lores.length===0
      ? '<div style="text-align:center;padding:30px;color:#475569">Chưa có lore nào. Hãy tạo truyền thuyết đầu tiên!</div>'
      : lores.slice(0,20).map(function(l) {
          return '<div style="background:#0f172a;border:1px solid ' + l.typeColor + '33;border-radius:10px;padding:14px;margin-bottom:8px">'
            + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
            + '<span style="font-size:18px">' + l.typeIcon + '</span>'
            + '<div style="flex:1">'
            + '<div style="font-size:12px;font-weight:700;color:' + l.typeColor + '">' + l.title + '</div>'
            + '<div style="font-size:10px;color:#475569">' + l.typeName + ' · Năm ' + l.year + '</div>'
            + '</div></div>'
            + '<div style="font-size:11px;color:#94a3b8;line-height:1.6;font-style:italic">"' + l.text + '"</div>'
            + '</div>';
        }).join("");

    el.innerHTML = '<div style="padding:16px;font-family:\'Noto Serif SC\',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">'
      + '<div style="margin-bottom:14px"><h3 style="margin:0 0 3px;font-size:17px;color:#fbbf24;font-family:Cinzel,serif">📜 Lore Generator</h3>'
      + '<div style="font-size:11px;color:#475569">6 thể loại · ' + lores.length + ' lore · ' + window.lgData.totalGenerated + ' tổng cộng</div></div>'
      + '<div style="display:flex;gap:4px;margin-bottom:14px">' + typeButtons + '</div>'
      + '<button onclick="lgGenerateLore({});lgRenderPanel()" style="width:100%;padding:8px;background:linear-gradient(135deg,#78350f,#92400e);border:none;border-radius:7px;color:#fbbf24;cursor:pointer;font-size:12px;margin-bottom:14px;font-family:\'Noto Serif SC\',serif">🎲 Sinh Lore Ngẫu Nhiên</button>'
      + '<div style="font-size:12px;color:#64748b;font-weight:600;margin-bottom:8px">📚 KHÁNH SỬ SÁNG TẠO (' + lores.length + ')</div>'
      + loreCards + '</div>';
  };

  function init() {
    load();
    console.log("[LoreGenerator V41] 📜 6 thể loại lore · " + window.lgData.totalGenerated + " đã sinh.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 5300); });
  } else {
    setTimeout(init, 5300);
  }
})();
