// ============================================================
// BLOODLINE ENGINE V23
// CREATOR GOD — V23 EMPIRE & KINGDOM ENGINE
// Hệ thống Huyết Mạch — Gia Phả, Di Truyền, Truyền Thừa
// Tương thích 100% save cũ — KHÔNG xóa dữ liệu
// ============================================================

const BL_SAVE_KEY = "cgv6_bloodlines";
const BL_VERSION  = 23;

const BL_TRAITS_POOL = [
  "Thiên Tài Quân Sự","Huyết Thống Hoàng Gia","Di Truyền Mãnh Linh","Trí Tuệ Siêu Phàm",
  "Thể Chất Phi Thường","Tài Năng Ngoại Giao","Thiên Bẩm Kinh Doanh","Dũng Khí Vô Song",
  "Huyết Mạch Long Tộc","Hồn Thiêng Bất Tử","Thiên Mệnh Đế Vương","Truyền Thừa Thần Kiếm",
  "Di Sản Tiên Nhân","Huyết Thống Phượng Hoàng","Thiên Tư Trác Việt",
];

const BL_SURNAMES = [
  "Long","Phượng","Hắc","Kim","Ngọc","Thiên","Huyền","Minh","Thanh","Tử",
  "Bạch","Lôi","Hỏa","Băng","Phong","Lâm","Vũ","Hàn","Tiêu","Thẩm",
];

// ── INIT ──
function blInit() {
  if (!window.bloodlineData) {
    const saved = localStorage.getItem(BL_SAVE_KEY);
    window.bloodlineData = saved ? JSON.parse(saved) : {
      bloodlines: {},
      idCounter:  0,
      version:    BL_VERSION,
    };
  }
  if (!window.bloodlineData.bloodlines) window.bloodlineData.bloodlines = {};
  if (!window.bloodlineData.idCounter)  window.bloodlineData.idCounter  = 0;

  // Sinh huyết mạch từ dynasties/countries nếu chưa có
  _blMigrateFromExisting();
}

function blSave() {
  try { localStorage.setItem(BL_SAVE_KEY, JSON.stringify(window.bloodlineData)); } catch(e) {}
}

function _blMigrateFromExisting() {
  // Tạo bloodline từ countries hiện có
  (window.countries || []).slice(0, 8).forEach(c => {
    if (c.collapsed) return;
    const existsBL = Object.values(window.bloodlineData.bloodlines).find(bl => bl.countryId === c.id);
    if (!existsBL) {
      blCreateBloodline({
        surname:   (c.founderName || c.name || "").split(" ")[0] || _blRandItem(BL_SURNAMES),
        countryId: c.id,
        founder:   c.founderName || c.name || "Khuyết Danh",
        yearFounded: c.yearFounded || (window.year || 1),
      });
    }
  });

  // Tạo từ kingdoms
  if (window.kingdomData) {
    Object.values(window.kingdomData.kingdoms).slice(0, 5).forEach(k => {
      if (k.isCollapsed) return;
      const existsBL = Object.values(window.bloodlineData.bloodlines).find(bl => bl.kingdomId === k.kingdomId);
      if (!existsBL) {
        blCreateBloodline({
          surname:    (k.ruler ? k.ruler.name : k.kingdomName).split(" ")[0] || _blRandItem(BL_SURNAMES),
          kingdomId:  k.kingdomId,
          founder:    k.ruler ? k.ruler.name : k.kingdomName,
          yearFounded: k.yearFounded || (window.year || 1),
        });
      }
    });
  }

  // Sinh ngẫu nhiên nếu chưa đủ 5
  const count = Object.keys(window.bloodlineData.bloodlines).length;
  for (let i = count; i < 5; i++) {
    blCreateBloodline({});
  }
}

// ── Tạo bloodline mới ──
function blCreateBloodline(opts) {
  if (!window.bloodlineData) blInit();
  const blId   = "bl" + (++window.bloodlineData.idCounter);
  const surname = opts.surname || _blRandItem(BL_SURNAMES);
  const founder = opts.founder || surname + " Thủy Tổ";
  const yearFounded = opts.yearFounded || ((window.year || 1) - Math.floor(Math.random() * 300));

  const traits = [];
  const traitCount = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < traitCount; i++) {
    const t = _blRandItem(BL_TRAITS_POOL.filter(tr => !traits.includes(tr)));
    if (t) traits.push(t);
  }

  const bl = {
    bloodlineId:     blId,
    surname,
    founder,
    countryId:       opts.countryId || null,
    kingdomId:       opts.kingdomId || null,
    yearFounded,
    prestige:        Math.floor(Math.random() * 50 + 10),
    geneticTraits:   traits,
    generation:      1,
    totalDescendants:Math.floor(Math.random() * 20 + 5),
    livingDescendants:Math.floor(Math.random() * 10 + 2),
    famousAncestors: [],
    familyTree:      [{
      name:       founder,
      generation: 1,
      role:       "Thủy Tổ",
      year:       yearFounded,
      isDead:     true,
      traits,
    }],
    bonus:           _blComputeBonus(traits),
    isExtinct:       false,
    history:         [`Năm ${yearFounded}: ${founder} khai lập huyết mạch ${surname} tộc.`],
  };

  // Sinh các thế hệ tiếp theo
  const genCount = Math.floor(Math.random() * 3) + 1;
  for (let g = 2; g <= genCount + 1; g++) {
    bl.generation = g;
    const memberCount = Math.floor(Math.random() * 4) + 1;
    for (let m = 0; m < memberCount; m++) {
      bl.familyTree.push({
        name:       surname + " " + _blRandName(),
        generation: g,
        role:       g === genCount + 1 ? "Đương Thế" : "Tổ Tiên",
        year:       yearFounded + (g - 1) * 30,
        isDead:     g < genCount + 1,
        traits:     traits.slice(0, Math.floor(Math.random() * traits.length + 1)),
      });
    }
  }

  window.bloodlineData.bloodlines[blId] = bl;
  return bl;
}

function _blComputeBonus(traits) {
  const bonus = { military: 0, economy: 0, cultivation: 0, diplomacy: 0, lifespan: 0 };
  traits.forEach(t => {
    if (t.includes("Quân Sự") || t.includes("Dũng Khí"))  bonus.military    += 10;
    if (t.includes("Kinh Doanh") || t.includes("Ngoại Giao")) { bonus.economy  += 10; bonus.diplomacy += 10; }
    if (t.includes("Linh") || t.includes("Tiên"))         bonus.cultivation += 15;
    if (t.includes("Bất Tử") || t.includes("Thể Chất"))  bonus.lifespan    += 200;
    if (t.includes("Long") || t.includes("Phượng"))       { bonus.military  += 15; bonus.cultivation += 10; }
  });
  return bonus;
}

function _blRandName() {
  const parts = ["Phàm","Vũ","Kiếm","Long","Thiên","Hào","Phong","Đế","Vương","Tôn","Hải","Lâm"];
  return _blRandItem(parts);
}

// ── TICK ──
function blTick() {
  if (!window.bloodlineData) return;
  const year = window.year || 0;

  // Migrate mới mỗi 30 năm
  if (year > 0 && year % 30 === 0) _blMigrateFromExisting();

  Object.values(window.bloodlineData.bloodlines).forEach(bl => {
    if (bl.isExtinct) return;

    // Sinh con cháu theo thời gian
    if (year > 0 && year % 20 === 0) {
      bl.totalDescendants   += Math.floor(Math.random() * 3);
      bl.livingDescendants  += Math.floor(Math.random() * 2);
      bl.prestige           += Math.floor(Math.random() * 5);

      // Thêm thành viên mới
      if (Math.random() < 0.3) {
        const newMember = {
          name:       bl.surname + " " + _blRandName(),
          generation: bl.generation,
          role:       "Đương Thế",
          year,
          isDead:     false,
          traits:     bl.geneticTraits.slice(0, Math.floor(Math.random() * bl.geneticTraits.length + 1)),
        };
        bl.familyTree.push(newMember);

        // Cơ hội xuất hiện danh nhân
        if (Math.random() < 0.15) {
          bl.famousAncestors.push({ name: newMember.name, year, title: _blRandItem(["Đại Tướng","Vương Giả","Tiên Nhân","Kiếm Thánh","Đế Hoàng"]) });
          bl.prestige += 30;
          const msg = `🌟 ${newMember.name} của huyết mạch ${bl.surname} tộc xuất hiện!`;
          if (typeof addLog === "function") addLog(msg, "important");
          if (typeof htAddEvent === "function") htAddEvent({ year, type: "bloodline_hero", text: msg });
        }
      }

      // Cập nhật thế hệ mỗi 60 năm
      if (year % 60 === 0) {
        bl.generation++;
        bl.history.push(`Năm ${year}: Huyết mạch ${bl.surname} tộc tiếp nối thế hệ ${bl.generation}.`);
      }
    }

    // Tuyệt tộc nếu không còn hậu duệ
    if (bl.livingDescendants <= 0 && Math.random() < 0.1) {
      bl.isExtinct = true;
      const msg = `💀 Huyết mạch ${bl.surname} tộc tuyệt diệt!`;
      if (typeof addLog === "function") addLog(msg, "death");
      if (typeof htAddEvent === "function") htAddEvent({ year, type: "bloodline_extinct", text: msg });
    }
  });

  blSave();
}

// ── Thống kê ──
function blGetActiveBloodlines() {
  if (!window.bloodlineData) return [];
  return Object.values(window.bloodlineData.bloodlines).filter(bl => !bl.isExtinct);
}

// ── RENDER PANEL ──
function blRenderPanel() {
  const panel = document.getElementById("panel-bloodlines");
  if (!panel) return;
  if (!window.bloodlineData) blInit();

  const bloodlines = blGetActiveBloodlines();

  panel.innerHTML = `
    <div class="panel-toolbar">
      <button class="btn-primary" onclick="blCreateBloodline({});blRenderPanel()">🧬 Tạo Huyết Mạch Mới</button>
      <button class="btn-secondary" onclick="blRenderPanel()">🔄 Làm Mới</button>
      <span style="margin-left:auto;font-size:12px;color:var(--white-dim)">${bloodlines.length} huyết mạch đang tồn tại</span>
    </div>

    <div class="panel-grid">
      ${bloodlines.length === 0 ? `
        <div class="card span-full" style="text-align:center;padding:40px;color:var(--white-dim)">
          <div style="font-size:48px;margin-bottom:12px">🧬</div>
          <div>Chưa có huyết mạch nào được ghi nhận.</div>
        </div>
      ` : bloodlines.map(bl => blRenderCard(bl)).join("")}
    </div>
  `;
}

function blRenderCard(bl) {
  return `
    <div class="card" style="border-left:3px solid #c084fc">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <div>
          <div style="font-family:var(--font-title);font-size:15px;color:var(--white-main)">🧬 ${bl.surname} Tộc</div>
          <div style="font-size:10px;color:var(--white-dim)">Thủy tổ: ${bl.founder}</div>
          <div style="font-size:10px;color:var(--white-dim)">Khai lập: Năm ${bl.yearFounded} · Thế hệ ${bl.generation}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:18px;font-weight:800;color:#c084fc">${bl.prestige}</div>
          <div style="font-size:9px;color:var(--white-dim)">Uy Danh</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px">
        ${[
          ["👥","Hậu duệ",bl.totalDescendants],
          ["🌱","Còn sống",bl.livingDescendants],
          ["🌟","Danh nhân",bl.famousAncestors.length],
        ].map(([icon,label,val]) => `
          <div style="background:rgba(192,132,252,0.06);border:1px solid rgba(192,132,252,0.15);border-radius:8px;padding:8px;text-align:center">
            <div style="font-size:14px;margin-bottom:2px">${icon}</div>
            <div style="font-size:14px;font-weight:800;color:#c084fc">${val}</div>
            <div style="font-size:9px;color:var(--white-dim)">${label}</div>
          </div>
        `).join("")}
      </div>

      <div style="margin-bottom:10px">
        <div style="font-size:10px;color:var(--white-dim);margin-bottom:5px;letter-spacing:1px">🧬 ĐẶC TÍNH HUYẾT MẠCH</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">
          ${bl.geneticTraits.map(t => `
            <span style="font-size:9px;padding:2px 8px;border-radius:10px;background:rgba(192,132,252,0.1);border:1px solid rgba(192,132,252,0.25);color:#c084fc">${t}</span>
          `).join("")}
        </div>
      </div>

      ${Object.entries(bl.bonus).some(([,v]) => v > 0) ? `
        <div style="margin-bottom:8px">
          <div style="font-size:10px;color:var(--white-dim);margin-bottom:5px;letter-spacing:1px">⭐ BONUS HUYẾT THỐNG</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px">
            ${bl.bonus.military > 0 ? `<span style="font-size:9px;padding:2px 8px;border-radius:10px;background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.2);color:#f87171">+${bl.bonus.military}% Quân sự</span>` : ""}
            ${bl.bonus.economy > 0 ? `<span style="font-size:9px;padding:2px 8px;border-radius:10px;background:rgba(250,204,21,0.1);border:1px solid rgba(250,204,21,0.2);color:var(--gold)">+${bl.bonus.economy}% Kinh tế</span>` : ""}
            ${bl.bonus.cultivation > 0 ? `<span style="font-size:9px;padding:2px 8px;border-radius:10px;background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.2);color:#4ade80">+${bl.bonus.cultivation}% Tu luyện</span>` : ""}
            ${bl.bonus.lifespan > 0 ? `<span style="font-size:9px;padding:2px 8px;border-radius:10px;background:rgba(96,165,250,0.1);border:1px solid rgba(96,165,250,0.2);color:#60a5fa">+${bl.bonus.lifespan} Thọ mạng</span>` : ""}
          </div>
        </div>
      ` : ""}

      ${bl.famousAncestors.length > 0 ? `
        <div style="border-top:1px solid var(--border);padding-top:8px">
          <div style="font-size:10px;color:var(--white-dim);margin-bottom:5px">🌟 DANH NHÂN</div>
          ${bl.famousAncestors.slice(-3).map(a => `
            <div style="font-size:10px;color:var(--white-main);padding:2px 0">🏅 ${a.name} — ${a.title} (Năm ${a.year})</div>
          `).join("")}
        </div>
      ` : ""}

      <div style="margin-top:8px;border-top:1px solid var(--border);padding-top:8px">
        <div style="font-size:10px;color:var(--white-dim);margin-bottom:4px">📜 CÂY GIA PHẢ (${bl.familyTree.length} thành viên)</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;max-height:60px;overflow:hidden">
          ${bl.familyTree.filter(m => !m.isDead).slice(0,8).map(m => `
            <span style="font-size:9px;padding:2px 7px;border-radius:8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);color:var(--white-dim)">${m.name}</span>
          `).join("")}
          ${bl.familyTree.filter(m => !m.isDead).length > 8 ? `<span style="font-size:9px;color:var(--white-dim);padding:2px 0">+${bl.familyTree.filter(m => !m.isDead).length - 8} người nữa...</span>` : ""}
        </div>
      </div>
    </div>
  `;
}

function _blRandItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function blShowNavBtn() {
  const btn = document.querySelector('.nav-btn[data-panel="bloodlines"]');
  if (btn) { btn.style.display = ""; btn.classList.remove("ec-hidden"); }
}

document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    blInit();
    blShowNavBtn();
    setInterval(function() {
      if (window.world) {
        blTick();
        const active = document.querySelector('.nav-btn.active[data-panel="bloodlines"]');
        if (active) blRenderPanel();
      }
    }, 11000);
  }, 2200);
});
