/* ============================================================
   GLOBAL SEARCH SYSTEM V1 — Creator God V6
   THANH TÌM KIẾM TOÀN HỆ THỐNG
   ------------------------------------------------------------
   - Additive, không xóa/sửa dữ liệu nào.
   - Index: NPC, Sect, Country, Dynasty, Region, Boss,
            Emergent Quest, Artifact (legendary), World History.
   - Gõ vài chữ cái đầu (có dấu hoặc không dấu) → gợi ý realtime.
   - Click gợi ý → mở modal / chuyển panel tương ứng.
   ============================================================ */

(function () {

// ============================================================
// 1. HELPERS
// ============================================================

function normalize(str) {
  if (!str) return "";
  return str
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/đ/g, "d")
    .trim();
}

function curYear() { return (typeof year !== "undefined") ? year : 0; }

// ============================================================
// 2. BUILD SEARCH INDEX
// ============================================================

function buildSearchIndex() {
  const index = [];

  // ---- NPCs ----
  if (typeof npcs !== "undefined") {
    npcs.forEach(npc => {
      index.push({
        type: "npc",
        icon: npc.status === "alive" ? "🧙" : "💀",
        label: npc.name,
        sub: `${npc.status === "alive" ? "Còn sống" : "Đã mất"} · ${(typeof REALMS !== "undefined" && REALMS[npc.realm]) ? REALMS[npc.realm].name : "?"} · ${npc.region || ""}`,
        searchText: normalize(npc.name + " " + (npc.region || "") + " " + (npc.family || "")),
        action: () => { if (typeof openNPCModal === "function") openNPCModal(npc.id); },
      });
    });
  }

  // ---- Sects ----
  if (typeof sects !== "undefined") {
    sects.forEach(sect => {
      index.push({
        type: "sect",
        icon: "🏯",
        label: sect.name,
        sub: `Tông Môn · Cấp ${sect.level || 1} · ${sect.territory || ""} · ${(sect.members||[]).length} đệ tử`,
        searchText: normalize(sect.name + " " + (sect.territory || "")),
        action: () => openEntityInfoModal("🏯 " + sect.name, [
          `Lãnh thổ: ${sect.territory || "?"}`,
          `Cấp độ: ${sect.level || 1}`,
          `Uy danh: ${sect.prestige || 0}`,
          `Tài sản: ${sect.treasury || 0}`,
          `Đệ tử: ${(sect.members||[]).length} · Trưởng lão: ${(sect.elders||[]).length}`,
          sect.leader ? `Chưởng môn: ${npcLink(sect.leader)}` : "",
        ]),
      });
    });
  }

  // ---- Countries ----
  if (typeof countries !== "undefined") {
    countries.forEach(c => {
      index.push({
        type: "country",
        icon: "🏰",
        label: c.name,
        sub: `Quốc Gia · ${c.govType || ""} · Dân số ~${c.population || "?"}`,
        searchText: normalize(c.name),
        action: () => openEntityInfoModal("🏰 " + c.name, [
          `Loại chính thể: ${c.govType || "?"}`,
          `Dân số: ${c.population || "?"}`,
          `Quân sự: ${c.military || "?"}`,
          `Ngân khố: ${c.treasury || "?"}`,
          c.emperorId ? `Hoàng đế: ${npcLink(c.emperorId)}` : "",
        ]),
      });
    });
  }

  // ---- Dynasties ----
  if (typeof dynasties !== "undefined") {
    Object.entries(dynasties).forEach(([surname, d]) => {
      index.push({
        type: "dynasty",
        icon: "👑",
        label: `Gia Tộc ${surname}`,
        sub: `Vương Triều · ${d.generations || 1} thế hệ${d.title ? " · " + d.title : ""}`,
        searchText: normalize("gia toc " + surname + " " + (d.title || "")),
        action: () => openEntityInfoModal("👑 Gia Tộc " + surname, [
          `Số thế hệ: ${d.generations || 1}`,
          `Tước hiệu: ${d.title || "?"}`,
          `Năm thành lập: ${d.startYear ?? "?"}`,
          `Tổng tài sản: ${d.wealth ?? "?"}`,
          `Uy danh: ${d.reputation ?? "?"}`,
        ]),
      });
    });
  }

  // ---- Regions ----
  if (typeof regions !== "undefined") {
    regions.forEach(r => {
      index.push({
        type: "region",
        icon: "🗺️",
        label: r.name,
        sub: `Khu Vực${r.terrain ? " · " + r.terrain : ""}`,
        searchText: normalize(r.name),
        action: () => openEntityInfoModal("🗺️ " + r.name, [
          r.terrain ? `Địa hình: ${r.terrain}` : "",
          r.climate ? `Khí hậu: ${r.climate}` : "",
          r.dangerLevel != null ? `Mức độ nguy hiểm: ${r.dangerLevel}` : "",
        ]),
      });
    });
  }

  // ---- Bosses ----
  if (typeof bosses !== "undefined") {
    bosses.forEach(b => {
      index.push({
        type: "boss",
        icon: "🐉",
        label: b.name,
        sub: `Hung Thú${b.region ? " · " + b.region : ""}${b.defeated ? " · Đã bị diệt" : ""}`,
        searchText: normalize(b.name + " " + (b.region || "")),
        action: () => openEntityInfoModal("🐉 " + b.name, [
          b.region ? `Khu vực: ${b.region}` : "",
          b.power != null ? `Sức mạnh: ${b.power}` : "",
          b.defeated ? `Trạng thái: Đã bị tiêu diệt` : `Trạng thái: Đang hoạt động`,
        ]),
      });
    });
  }

  // ---- Emergent Quests ----
  if (typeof emergentQuests !== "undefined") {
    ["active", "completed", "failed", "epic"].forEach(group => {
      (emergentQuests[group] || []).forEach(q => {
        const titleTxt = q.isEpic && q.epicId ? (EPIC_NAME(q.epicId) || q.title) : (q.title || q.title2 || "Nhiệm Vụ");
        index.push({
          type: "quest",
          icon: q.isEpic ? "🌟" : "📜",
          label: titleTxt,
          sub: `Thiên Thời Vụ · ${statusLabel(q.status)}${q.location ? " · " + q.location : ""}`,
          searchText: normalize("nhiem vu " + titleTxt + " " + (q.location || "")),
          action: () => {
            if (typeof showPanel === "function") showPanel("emergent-quests");
            if (typeof filterEmergentQuests === "function") {
              var f = q.isEpic ? "epic" : (q.status === "active" ? "active" : q.status === "success" ? "completed" : "failed");
              filterEmergentQuests(f, document.querySelector(`#eqFilterBar [data-eqf="${f}"]`));
            }
          },
        });
      });
    });
  }

  // ---- Legendary Artifacts ----
  if (typeof legendaryArtifacts !== "undefined") {
    (legendaryArtifacts || []).forEach(a => {
      index.push({
        type: "artifact",
        icon: "⚔️",
        label: a.name,
        sub: `Bảo Vật${a.rarity ? " · " + a.rarity : ""}${a.ownerId ? " · Chủ nhân: " + (npcById(a.ownerId)?.name || "?") : " · Chưa có chủ"}`,
        searchText: normalize(a.name),
        action: () => openEntityInfoModal("⚔️ " + a.name, [
          a.rarity ? `Độ hiếm: ${a.rarity}` : "",
          a.description ? a.description : "",
          a.ownerId ? `Chủ nhân hiện tại: ${npcLink(a.ownerId)}` : `Chủ nhân: Chưa có`,
        ]),
      });
    });
  }

  // ---- World History (recent major events) ----
  if (typeof worldHistory !== "undefined") {
    worldHistory.slice(0, 100).forEach((e, i) => {
      index.push({
        type: "history",
        icon: "📖",
        label: (e.description || "").slice(0, 60),
        sub: `Lịch Sử · Năm ${e.year ?? "?"} · ${e.eventType || ""}`,
        searchText: normalize((e.description || "") + " " + (e.eventType || "")),
        action: () => { if (typeof showPanel === "function") showPanel("history"); },
      });
    });
  }

  return index;
}

function EPIC_NAME(epicId) {
  const map = {
    unify_world:   "🌍 Thống Nhất Thiên Hạ",
    demon_emperor: "👹 Diệt Ma Đế",
    apocalypse:    "☄️ Ngăn Chặn Tận Thế",
    chaos_gate:    "🌀 Phong Ấn Hỗn Loạn Môn",
  };
  return map[epicId];
}

function statusLabel(status) {
  if (status === "active") return "Đang diễn ra";
  if (status === "success") return "Hoàn thành";
  if (status === "fail") return "Thất bại";
  return status || "";
}

function npcLink(id) {
  const n = (typeof npcById === "function") ? npcById(id) : null;
  return n ? `<span onclick="closeModalBtn();openNPCModal(${id})" style="cursor:pointer;text-decoration:underline;color:var(--gold)">${n.name}</span>` : "?";
}

// ============================================================
// 3. GENERIC ENTITY INFO MODAL (cho sect/country/dynasty/region/boss/artifact)
// ============================================================

function openEntityInfoModal(title, lines) {
  if (typeof openModal !== "function") return;
  const body = lines.filter(Boolean).map(l => `<div style="padding:6px 0;border-bottom:1px solid var(--border);font-size:13px;color:var(--white-dim)">${l}</div>`).join("");
  openModal(`
    <div class="modal-header">
      <div class="modal-avatar">${title.split(" ")[0]}</div>
      <div>
        <div class="modal-npc-title">${title.replace(/^\S+\s/, "")}</div>
      </div>
    </div>
    <div style="margin-top:10px">${body || "<div style='opacity:.6'>Không có thông tin chi tiết.</div>"}</div>
  `);
}

// ============================================================
// 4. UI — SEARCH BAR
// ============================================================

function injectSearchBar() {
  if (document.getElementById("globalSearchWrap")) return;
  var left = document.querySelector(".top-bar-left");
  if (!left) return;

  var wrap = document.createElement("div");
  wrap.id = "globalSearchWrap";
  wrap.style.position = "relative";
  wrap.style.marginLeft = "16px";
  wrap.style.flex = "1";
  wrap.style.maxWidth = "420px";
  wrap.innerHTML = `
    <div style="display:flex;align-items:center;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:10px;padding:6px 10px;gap:6px">
      <span style="opacity:.6">🔍</span>
      <input id="globalSearchInput" type="text" placeholder="Tìm NPC, tông môn, quốc gia, bảo vật, nhiệm vụ..."
        style="background:transparent;border:none;outline:none;color:var(--white-main);font-size:12px;width:100%;font-family:var(--font-cjk),serif" />
      <span id="globalSearchClear" style="opacity:.5;cursor:pointer;display:none;font-size:12px">✖</span>
    </div>
    <div id="globalSearchResults" style="display:none;position:absolute;top:calc(100% + 6px);left:0;right:0;max-height:420px;overflow-y:auto;background:#0d1018;border:1px solid var(--border);border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,0.6);z-index:500"></div>
  `;
  left.appendChild(wrap);

  var input   = wrap.querySelector("#globalSearchInput");
  var results = wrap.querySelector("#globalSearchResults");
  var clearBtn = wrap.querySelector("#globalSearchClear");

  input.addEventListener("input", function () {
    var q = normalize(input.value);
    clearBtn.style.display = input.value ? "block" : "none";
    if (!q) { results.style.display = "none"; results.innerHTML = ""; return; }
    runSearch(q, results);
  });

  input.addEventListener("focus", function () {
    if (input.value) runSearch(normalize(input.value), results);
  });

  clearBtn.addEventListener("click", function () {
    input.value = "";
    clearBtn.style.display = "none";
    results.style.display = "none";
    results.innerHTML = "";
    input.focus();
  });

  document.addEventListener("click", function (e) {
    if (!wrap.contains(e.target)) results.style.display = "none";
  });

  document.addEventListener("keydown", function (e) {
    // Ctrl+K / "/" focus shortcut
    if ((e.ctrlKey && e.key.toLowerCase() === "k") || (e.key === "/" && document.activeElement.tagName !== "INPUT")) {
      e.preventDefault();
      input.focus();
    }
    if (e.key === "Escape") { results.style.display = "none"; input.blur(); }
  });
}

const TYPE_LABEL = {
  npc: "Nhân Vật", sect: "Tông Môn", country: "Quốc Gia", dynasty: "Vương Triều",
  region: "Khu Vực", boss: "Hung Thú", quest: "Nhiệm Vụ", artifact: "Bảo Vật", history: "Lịch Sử",
};

function runSearch(q, results) {
  const index = buildSearchIndex();

  // Ưu tiên: match đầu chuỗi > match từ nào đó bắt đầu bằng q > chứa q
  const scored = [];
  index.forEach(item => {
    if (!item.searchText) return;
    let score = -1;
    if (item.searchText.startsWith(q)) score = 3;
    else if (item.searchText.split(" ").some(w => w.startsWith(q))) score = 2;
    else if (item.searchText.includes(q)) score = 1;
    if (score >= 0) scored.push({ item, score });
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 30).map(s => s.item);

  if (!top.length) {
    results.style.display = "block";
    results.innerHTML = `<div style="padding:14px;text-align:center;font-size:12px;color:var(--white-dim)">Không tìm thấy kết quả cho "${q}"</div>`;
    return;
  }

  results.style.display = "block";
  results.innerHTML = top.map((item, i) => `
    <div class="gsr-item" data-idx="${i}" style="display:flex;align-items:center;gap:10px;padding:9px 12px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.04)">
      <div style="font-size:18px;flex-shrink:0">${item.icon}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;font-weight:700;color:var(--white-main);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.label}</div>
        <div style="font-size:10px;color:var(--white-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.sub || ""}</div>
      </div>
      <div style="font-size:9px;color:var(--gold-dim);border:1px solid var(--border);border-radius:8px;padding:2px 7px;flex-shrink:0">${TYPE_LABEL[item.type] || item.type}</div>
    </div>
  `).join("");

  results.querySelectorAll(".gsr-item").forEach((el, i) => {
    el.addEventListener("mouseenter", () => el.style.background = "rgba(255,255,255,0.05)");
    el.addEventListener("mouseleave", () => el.style.background = "transparent");
    el.addEventListener("click", () => {
      try { top[i].action(); } catch (e) { console.warn("Search action error:", e); }
      results.style.display = "none";
    });
  });
}

// ============================================================
// 5. INIT
// ============================================================

function init() {
  function tryUI() {
    if (document.querySelector(".top-bar-left")) {
      injectSearchBar();
      return true;
    }
    return false;
  }
  if (!tryUI()) {
    document.addEventListener("DOMContentLoaded", tryUI);
    var iv = setInterval(function () { if (tryUI()) clearInterval(iv); }, 300);
  }
  console.log("🔍 Global Search System V1 loaded!");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

})();
