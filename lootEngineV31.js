/* ============================================================
   LOOT ENGINE V31 — Hệ Thống Chiến Lợi Phẩm
   lootEngineV31.js
   Load AFTER: app.js, artifactSystem.js
   EXPAND ONLY — NEVER DELETE — NEVER REPLACE
   ============================================================ */
(function () {
  "use strict";

  const SAVE_KEY = "cgv6_loot_v31";

  // ── Loot Tables ──
  const LOOT_POOLS = {
    gold: [
      { name:"Linh Tiền Thông Bảo",  icon:"🪙", value:500,   desc:"Tiền tệ cơ bản của tu giới." },
      { name:"Thiên Kim Phiếu",       icon:"💰", value:5000,  desc:"Phiếu đổi vàng thiên giới." },
      { name:"Vạn Lượng Vàng Khối",  icon:"🏅", value:50000, desc:"Khối vàng lớn, quý hiếm." },
    ],
    spirit_stones: [
      { name:"Linh Thạch Hạ Phẩm",  icon:"💎", grade:1, desc:"Linh thạch cấp thấp, tu sĩ sơ giai dùng." },
      { name:"Linh Thạch Trung Phẩm",icon:"💎", grade:2, desc:"Linh thạch cấp trung, rất phổ biến." },
      { name:"Linh Thạch Thượng Phẩm",icon:"💎",grade:3, desc:"Linh thạch cấp cao, tu sĩ cao cấp cần." },
      { name:"Tiên Tinh Thạch",       icon:"✨", grade:5, desc:"Tinh thạch cõi tiên, vô cùng hiếm." },
      { name:"Thần Tinh Thạch",       icon:"🌟", grade:9, desc:"Tinh thạch thánh thần, truyền thuyết." },
    ],
    artifacts: [
      { name:"Linh Kiếm Thượng Phẩm",icon:"⚔️", rarity:"rare",      desc:"Kiếm chứa linh khí, sắc bén vô song." },
      { name:"Hộ Thân Linh Giáp",    icon:"🛡️", rarity:"epic",      desc:"Giáp trụ linh khí, phòng thủ tuyệt vời." },
      { name:"Thiên Địa Linh Nhẫn",  icon:"💍", rarity:"epic",      desc:"Nhẫn chứa sức mạnh thiên địa." },
      { name:"Bá Vương Phủ Việt",    icon:"🪓", rarity:"legendary", desc:"Phủ việt truyền thuyết, một chưởng phá sơn." },
      { name:"Phụng Hoàng Linh Tiêu",icon:"🪈", rarity:"legendary", desc:"Tiêu thiêng, tiếng nhạc có thể điều khiển vạn vật." },
    ],
    divine_relics: [
      { name:"Thiên Đế Bảo Ấn",    icon:"🔮", power:100, desc:"Bảo ấn của Thiên Đế, đại diện quyền năng tối thượng." },
      { name:"Vạn Pháp Thiên Thư",  icon:"📚", power:150, desc:"Sách ghi chép mọi pháp thuật trong thiên hạ." },
      { name:"Hỗn Độn Thần Châu",  icon:"🌐", power:200, desc:"Ngọc châu từ thời hỗn độn, ẩn vô hạn sức mạnh." },
      { name:"Khai Thiên Thần Phủ", icon:"⛏️", power:500, desc:"Phủ đã khai thiên tịch địa từ buổi đầu vũ trụ." },
      { name:"Thái Cổ Ngọc Tiêu",  icon:"🪈", power:999, desc:"Tiêu thiêng thái cổ, tiếng vang vọng khắp vũ trụ." },
    ],
    techniques: [
      { name:"Tru Tiên Kiếm Quyết",   icon:"📖", realm:3, element:"kiếm",  desc:"Kiếm pháp truyền thuyết, chém tiên giết thần." },
      { name:"Cửu Âm Chân Kinh",      icon:"📖", realm:4, element:"âm",    desc:"Chân kinh huyền thoại, khí âm tuyệt đỉnh." },
      { name:"Hỗn Độn Công",          icon:"📖", realm:5, element:"hỗn độn",desc:"Công pháp thái cổ, nuốt thiên hạ." },
      { name:"Thiên Ma Vô Cực Công",  icon:"📖", realm:5, element:"ma",    desc:"Ma công đệ nhất thiên hạ, vô địch ma đạo." },
      { name:"Cửu Thiên Lôi Pháp",    icon:"📖", realm:6, element:"lôi",   desc:"Lôi pháp chín tầng trời, uy lực kinh thiên." },
      { name:"Vô Thượng Chứng Đạo Quyết",icon:"📖",realm:8,element:"đạo", desc:"Bí quyết tối thượng để chứng đạo thần thánh." },
    ],
    rare_materials: [
      { name:"Long Cốt Tinh",        icon:"🦴", quality:"rare",   desc:"Xương long tinh luyện, nguyên liệu chế khí tuyệt hảo." },
      { name:"Tinh Thiết Vẫn Thạch", icon:"🪨", quality:"epic",   desc:"Sắt trời từ vũ trụ, cứng hơn mọi kim loại." },
      { name:"Thần Hỏa Tinh Anh",   icon:"🔥", quality:"epic",   desc:"Tinh anh thần hỏa, dùng để luyện đan hoặc luyện khí." },
      { name:"Hư Vô Linh Ngọc",     icon:"💎", quality:"legendary",desc:"Ngọc từ hư không, lưu chứa vô hạn linh khí." },
      { name:"Thái Cổ Thần Kim",    icon:"✨", quality:"legendary",desc:"Kim loại thái cổ, chỉ tồn tại trong truyền thuyết." },
    ],
  };

  // ── Rarity Weights per boss tier ──
  const TIER_WEIGHTS = {
    rare:      { gold:0.55, spirit_stones:0.30, artifacts:0.10, techniques:0.04, rare_materials:0.01, divine_relics:0 },
    epic:      { gold:0.30, spirit_stones:0.30, artifacts:0.20, techniques:0.12, rare_materials:0.06, divine_relics:0.02 },
    legendary: { gold:0.15, spirit_stones:0.20, artifacts:0.25, techniques:0.20, rare_materials:0.12, divine_relics:0.08 },
    mythic:    { gold:0.05, spirit_stones:0.15, artifacts:0.20, techniques:0.25, rare_materials:0.20, divine_relics:0.15 },
    divine:    { gold:0.02, spirit_stones:0.08, artifacts:0.15, techniques:0.25, rare_materials:0.25, divine_relics:0.25 },
    creator:   { gold:0.01, spirit_stones:0.04, artifacts:0.10, techniques:0.25, rare_materials:0.30, divine_relics:0.30 },
  };

  // ── State ──
  let _history = [];

  // ── Core: Generate Loot ──
  function wbv31GenerateLoot(lootTier, bossTier) {
    const weights = TIER_WEIGHTS[bossTier] || TIER_WEIGHTS.rare;
    const count   = { rare:2, epic:3, legendary:4, mythic:5, divine:6, creator:8 }[bossTier] || 2;
    const items   = [];

    for (let i = 0; i < count; i++) {
      const roll = Math.random();
      let cum = 0;
      let picked = "gold";
      for (const [cat, w] of Object.entries(weights)) {
        cum += w; if (roll < cum) { picked = cat; break; }
      }
      const pool = LOOT_POOLS[picked];
      if (!pool || !pool.length) continue;
      const item = pool[Math.floor(Math.random() * pool.length)];
      const qty  = picked === "gold" ? Math.floor((item.value || 100) * (0.8 + Math.random() * 0.4)) : 1;
      items.push({
        category: picked,
        name:     item.name,
        icon:     item.icon || "📦",
        qty,
        display:  picked === "gold" ? `${item.icon} ${item.name} x${qty.toLocaleString()}` : `${item.icon} ${item.name}`,
        ...item,
      });
    }

    // Record history
    _history.unshift({ year: window.year||0, lootTier, bossTier, items: items.map(i=>i.name) });
    if (_history.length > 500) _history.pop();

    return items;
  }

  // ── Generate Raid Loot ──
  function lev31GenerateRaidLoot(raidType, difficulty) {
    const tierMap = { solo:"rare", party:"epic", guild:"legendary", sect:"legendary", kingdom:"mythic", empire:"divine" };
    const tier = tierMap[raidType] || "rare";
    return wbv31GenerateLoot(tier, tier);
  }

  // ── Apply Loot to NPC/Player ──
  function lev31ApplyLoot(entity, items) {
    if (!entity) return;
    items.forEach(item => {
      if (item.category === "gold") {
        entity.gold = (entity.gold || 0) + (item.qty || 0);
      } else if (item.category === "spirit_stones") {
        entity.spiritStones = (entity.spiritStones || 0) + (item.qty || 1);
      } else if (item.category === "techniques") {
        entity.techniques = entity.techniques || [];
        if (!entity.techniques.includes(item.name)) entity.techniques.push(item.name);
        if (entity.techniques.length > 20) entity.techniques.shift();
      } else if (item.category === "artifacts" || item.category === "divine_relics" || item.category === "rare_materials") {
        entity.inventory = entity.inventory || [];
        entity.inventory.push({ name: item.name, icon: item.icon, type: item.category, year: window.year || 0 });
        if (entity.inventory.length > 50) entity.inventory.shift();
      }
    });
  }

  // ── Render Panel ──
  function lev31RenderPanel() {
    const el = document.getElementById("panel-loot-v31");
    if (!el) return;
    const recent = _history.slice(0, 50);
    el.innerHTML = `
    <div style="padding:12px;max-width:900px;margin:0 auto">
      <div style="font-family:var(--font-title);font-size:18px;color:var(--gold);margin-bottom:12px">🎁 Loot Engine V31 — Chiến Lợi Phẩm</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">
        ${Object.entries(LOOT_POOLS).map(([cat, pool]) => `
          <div style="background:rgba(250,204,21,0.06);border:1px solid rgba(250,204,21,0.15);border-radius:8px;padding:10px">
            <div style="color:var(--gold);font-size:11px;font-weight:700;margin-bottom:6px;text-transform:uppercase">${cat.replace("_"," ")}</div>
            ${pool.map(i=>`<div style="font-size:10px;color:var(--white-dim);margin-bottom:2px">${i.icon} ${i.name}</div>`).join("")}
          </div>
        `).join("")}
      </div>
      <div style="color:var(--gold);font-size:12px;letter-spacing:1px;margin-bottom:8px">📜 LỊCH SỬ NHẬN LOOT (${recent.length})</div>
      <div style="max-height:320px;overflow-y:auto">
        ${recent.length === 0 ? `<div style="color:var(--white-dim);font-size:12px;padding:10px">Chưa có loot nào được ghi nhận.</div>` : ""}
        ${recent.map(r=>`
          <div style="display:flex;justify-content:space-between;font-size:10px;padding:5px 8px;border-bottom:1px solid rgba(255,255,255,0.05)">
            <span style="color:var(--white-dim)">Năm ${r.year} · Boss ${r.bossTier}</span>
            <span style="color:#4ade80">${r.items.join(", ")}</span>
          </div>
        `).join("")}
      </div>
    </div>`;
  }

  // ── Expose ──
  window.wbv31GenerateLoot    = wbv31GenerateLoot;
  window.lev31GenerateRaidLoot= lev31GenerateRaidLoot;
  window.lev31ApplyLoot       = lev31ApplyLoot;
  window.lev31RenderPanel     = lev31RenderPanel;

  function _init() {
    console.log("[LootEngineV31] 🎁 Loot Engine V31 — 6 loại loot · Drop tables theo boss tier sẵn sàng.");
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(_init, 2800));
  } else {
    setTimeout(_init, 2800);
  }
})();
