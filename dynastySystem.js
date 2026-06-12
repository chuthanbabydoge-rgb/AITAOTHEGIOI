// ============================================================
// DYNASTY SYSTEM V2 — Family Tree Viewer, Top 100, Dynasty Life Cycle
// Tích hợp: Dashboard, NPC Detail, World History
// ============================================================

// ===== DYNASTY STATUS ENUM =====
const DYNASTY_STATUS = {
  RISING:    { id: "rising",    label: "🌅 Hưng Khởi",     color: "#4ade80" },
  THRIVING:  { id: "thriving",  label: "🌟 Hưng Thịnh",    color: "#facc15" },
  STABLE:    { id: "stable",    label: "⚖️ Ổn Định",        color: "#60a5fa" },
  DECLINING: { id: "declining", label: "🍂 Suy Tàn",        color: "#fb923c" },
  FALLEN:    { id: "fallen",    label: "💀 Đã Sụp Đổ",     color: "#f87171" },
  NATION:    { id: "nation",    label: "🏛️ Lập Quốc",      color: "#c084fc" },
  EMPIRE:    { id: "empire",    label: "👑 Hoàng Tộc",     color: "#fde047" },
};

// ===== TERRITORY TYPES for dynasties =====
const DYNASTY_TERRITORIES = [
  "🗻 Đông Vực", "🌊 Nam Hải", "🌋 Tây Hoang", "❄️ Bắc Nguyên",
  "🌲 Trung Châu", "⛰️ Thiên Sơn", "🏝️ Thần Đảo", "🌀 Hư Không Vực"
];

// ===== MIGRATE: add new dynasty fields to existing dynasties =====
function migrateDynastyV2() {
  Object.values(dynasties).forEach(d => {
    if (!d.status)       d.status     = DYNASTY_STATUS.STABLE.id;
    if (!d.territory)    d.territory  = rand(DYNASTY_TERRITORIES);
    if (!d.assets)       d.assets     = Math.floor((d.wealth || 0) * 0.3);
    if (!d.history)      d.history    = [];
    if (!d.milestones)   d.milestones = [];
    if (!d.statusHistory) d.statusHistory = [];
    if (!d.peakScore)    d.peakScore  = 0;
  });
  // Ensure all NPCs have parentIds / childrenIds
  npcs.forEach(npc => {
    if (!npc.parentIds)   npc.parentIds   = [];
    if (!npc.childrenIds) npc.childrenIds = [];
    if (!npc.generation)  npc.generation  = 1;
  });
}

// ===== DYNASTY LIFE CYCLE ENGINE =====
function computeDynastyStatus(d) {
  const score = d.power + d.wealth / 10 + d.reputation + d.generations * 500 + d.peakRealm * 1000;
  const prev  = d.prevScore || 0;
  d.prevScore = score;

  if (d.aliveMembers === 0) return DYNASTY_STATUS.FALLEN.id;
  if (d.peakRealm >= 9 && d.aliveMembers >= 5 && d.wealth >= 200000) return DYNASTY_STATUS.EMPIRE.id;
  if (d.aliveMembers >= 15 && d.wealth >= 100000 && d.reputation >= 10000) return DYNASTY_STATUS.NATION.id;

  const delta = score - prev;
  if (delta > 5000)   return DYNASTY_STATUS.THRIVING.id;
  if (delta > 1000)   return DYNASTY_STATUS.RISING.id;
  if (delta < -5000)  return DYNASTY_STATUS.DECLINING.id;
  if (delta < -1000)  {
    if (d.aliveMembers <= 2) return DYNASTY_STATUS.DECLINING.id;
  }
  return DYNASTY_STATUS.STABLE.id;
}

function updateDynastyLifeCycle(surname) {
  const d = dynasties[surname];
  if (!d) return;

  const newStatus = computeDynastyStatus(d);
  const oldStatus = d.status;

  if (newStatus !== oldStatus) {
    d.status = newStatus;
    const st = DYNASTY_STATUS[newStatus.toUpperCase()] || {};
    const ev = `Gia tộc ${surname} chuyển trạng thái: ${st.label || newStatus}`;
    d.history.push({ year, event: ev });
    d.statusHistory = d.statusHistory || [];
    d.statusHistory.push({ year, from: oldStatus, to: newStatus });

    if (newStatus === "empire") {
      addLog(`👑 Gia tộc ${surname} trở thành HOÀNG TỘC thiên hạ!`, "important");
      addWorldHistory("civilization", `Gia tộc ${surname} lập đế quốc, trở thành Hoàng Tộc!`, { dynastySurname: surname });
    } else if (newStatus === "nation") {
      addLog(`🏛️ Gia tộc ${surname} đã LẬP QUỐC — một thế lực mới ra đời!`, "important");
      addWorldHistory("civilization", `Gia tộc ${surname} lập quốc xưng vương`, { dynastySurname: surname });
    } else if (newStatus === "fallen") {
      addLog(`💀 Gia tộc ${surname} đã SUY TÀN hoàn toàn — đoạn tuyệt huyết mạch!`, "death");
      addWorldHistory("tragedy", `Gia tộc ${surname} đã sụp đổ và biến mất khỏi lịch sử`, { dynastySurname: surname });
    } else if (newStatus === "thriving") {
      addLog(`🌟 Gia tộc ${surname} đang HƯNG THỊNH vượng bậc!`, "breakthrough");
    }
  }

  // Assets grow with wealth
  d.assets = Math.floor((d.wealth || 0) * 0.4 + (d.peakRealm * 5000) + (d.generations * 2000));
}

// ===== FAMILY TREE — TRUE GRAPH-BASED =====
function buildFamilyTreeGraph(surname) {
  const allMembers = getDynastyMembers(surname);
  if (!allMembers.length) {
    return `<div style='color:var(--white-dim);font-style:italic;padding:20px;text-align:center'>Không có thành viên nào.</div>`;
  }

  // Build adjacency: parentId → [childId]
  const childMap = {}; // parentId → [child npc]

  allMembers.forEach(npc => {
    (npc.parentIds || []).forEach(pid => {
      if (!childMap[pid]) childMap[pid] = [];
      childMap[pid].push(npc);
    });
  });

  // Roots = members with no parent in this dynasty
  const roots = allMembers.filter(n => {
    const parents = (n.parentIds || []);
    return parents.length === 0 || !parents.some(pid => allMembers.find(m => m.id === pid));
  });

  function renderNodeBox(npc) {
    const isAlive   = npc.status === "alive";
    const rc        = typeof realmColor === "function" ? realmColor(npc.realm) : "#facc15";
    const realmName = (typeof REALMS !== "undefined" && REALMS[npc.realm]) ? REALMS[npc.realm].name : "?";
    const gIcon     = npc.gender === "Nam" ? "♂" : "♀";
    return `<div class="dyn-tree-node ${isAlive ? "alive" : "dead"}"
              onclick="openNPCModal(${npc.id})"
              style="border-color:${rc}55;background:${rc}12"
              title="${npc.name} — ${realmName} — Đời ${npc.generation || 1}">
      <span style="color:${rc}">${gIcon}</span>
      <span class="dyn-tree-name" style="color:${isAlive ? "var(--white-main)" : "var(--white-dim)"}">${npc.name}</span>
      <span class="dyn-tree-realm" style="color:${rc}">${realmName}</span>
      ${!isAlive ? '<span class="dyn-tree-dead">☠</span>' : ''}
    </div>`;
  }

  let nodeCounter = 0;

  // Render a subtree: node box on left, connector lines, then column of children subtrees on the right
  function renderSubtree(npc, depth = 0) {
    if (depth > 10) return "";
    const children = (childMap[npc.id] || []).sort((a,b) => (a.generation||1) - (b.generation||1));
    const uid = `dt${++nodeCounter}`;

    let out = `<div class="dyn-tree-branch">`;
    out += `<div class="dyn-tree-self">${renderNodeBox(npc)}`;
    if (children.length) {
      out += `<button class="dyn-tree-toggle" onclick="dynTreeToggle('${uid}',this)" title="Thu gọn / Mở rộng">−</button>`;
    }
    out += `</div>`;

    if (children.length) {
      out += `<div class="dyn-tree-children" id="${uid}">`;
      children.forEach(child => {
        out += `<div class="dyn-tree-child-row">`;
        out += renderSubtree(child, depth + 1);
        out += `</div>`;
      });
      out += `</div>`;
    }

    out += `</div>`;
    return out;
  }

  let html = `<div class="dyn-tree-graph">`;

  // Show top roots (founders first)
  const sortedRoots = roots.sort((a, b) => (a.generation || 1) - (b.generation || 1));
  sortedRoots.slice(0, 15).forEach(root => {
    html += `<div class="dyn-tree-root-group">${renderSubtree(root, 0)}</div>`;
  });

  if (sortedRoots.length > 15) {
    html += `<div style="color:var(--white-dim);font-size:12px;padding:8px">…+${sortedRoots.length - 15} nhánh khác</div>`;
  }

  html += `</div>`;
  return html;
}

// Collapse/expand a branch in the family tree
function dynTreeToggle(uid, btn) {
  const el = document.getElementById(uid);
  if (!el) return;
  const collapsed = el.classList.toggle("dyn-tree-collapsed");
  btn.textContent = collapsed ? "+" : "−";
  btn.closest(".dyn-tree-branch")?.classList.toggle("has-collapsed-children", collapsed);
}

// ===== TOP 100 DYNASTY RANKING (extended) =====
function getDynastyRankingFull() {
  return Object.values(dynasties)
    .filter(d => d.totalMembers > 0)
    .map(d => {
      const score = d.power + d.wealth / 10 + d.reputation + d.generations * 500 + d.peakRealm * 1000;
      return { ...d, score };
    })
    .sort((a, b) => b.score - a.score);
}

// ===== RENDER TOP 100 PANEL (replaces top-10 with paged top-100) =====
function renderDynastyTop100(container, page = 0, pageSize = 20) {
  const ranking = getDynastyRankingFull();
  const total   = ranking.length;
  const start   = page * pageSize;
  const slice   = ranking.slice(start, start + pageSize);

  if (!slice.length) {
    container.innerHTML = `<div class="wh-empty">👑 Chưa có gia tộc nào.<br><small style='opacity:.4'>Triệu hồi tu sĩ và để thiên địa phát triển...</small></div>`;
    return;
  }

  const rankIcons = ["👑","🥈","🥉"];

  let html = slice.map((d, i) => {
    const globalRank = start + i + 1;
    const rIcon  = globalRank <= 3 ? rankIcons[globalRank - 1] : `<span style="color:var(--white-dim);font-size:11px">#${globalRank}</span>`;
    const pColor = typeof realmColor === "function" ? realmColor(d.peakRealm) : "#facc15";
    const st     = DYNASTY_STATUS[(d.status || "stable").toUpperCase()] || DYNASTY_STATUS.STABLE;
    const aliveBar = d.totalMembers > 0 ? Math.round(d.aliveMembers / d.totalMembers * 100) : 0;

    return `<div class="dyn-rank-card" onclick="showDynastyDetail('${d.surname}')" style="position:relative;overflow:hidden">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:${st.color};opacity:0.6"></div>
      <div class="dyn-rank-left">
        <div class="dyn-rank-num">${rIcon}</div>
        <div style="min-width:0">
          <div class="dyn-surname">${d.surname}</div>
          <div class="dyn-founded" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:2px">
            <span>Năm ${d.foundedYear}</span>
            <span>·</span>
            <span>${d.generations} đời</span>
            <span style="color:${st.color};font-size:11px">${st.label}</span>
          </div>
          <div class="dyn-titles">${(d.titles||[]).slice(0,2).map(t=>`<span class="dyn-title-chip">${t}</span>`).join("")}</div>
        </div>
      </div>
      <div class="dyn-rank-stats">
        <div class="dyn-stat"><span>👥</span><span>${d.aliveMembers}/${d.totalMembers}</span></div>
        <div class="dyn-stat"><span>🌟</span><span style="color:${pColor}">${(typeof REALMS !== "undefined" && REALMS[d.peakRealm]) ? REALMS[d.peakRealm].name : "?"}</span></div>
        <div class="dyn-stat"><span>💰</span><span>${(d.wealth/1000).toFixed(1)}k</span></div>
        <div class="dyn-stat"><span>⚡</span><span>${Math.floor(d.score).toLocaleString()}</span></div>
      </div>
      <div class="dyn-alive-bar-wrap">
        <div class="dyn-alive-bar" style="width:${aliveBar}%"></div>
      </div>
    </div>`;
  }).join("");

  // Pagination
  const totalPages = Math.ceil(total / pageSize);
  html += `<div style="display:flex;gap:8px;align-items:center;justify-content:center;margin-top:12px;flex-wrap:wrap">
    <span style="color:var(--white-dim);font-size:12px">Tổng ${total} gia tộc</span>
    ${page > 0 ? `<button class="btn-secondary small" onclick="dynastyChangePage(${page-1})">◀ Trước</button>` : ""}
    <span style="color:var(--white-dim);font-size:12px">Trang ${page+1}/${totalPages}</span>
    ${page < totalPages-1 ? `<button class="btn-secondary small" onclick="dynastyChangePage(${page+1})">Tiếp ▶</button>` : ""}
  </div>`;

  container.innerHTML = html;
}

let _dynastyPage = 0;
function dynastyChangePage(p) {
  _dynastyPage = p;
  const el = document.getElementById("dynastyRanking");
  if (el) renderDynastyTop100(el, p);
}

// ===== OVERRIDE renderDynastyPanel to use new system =====
const _origRenderDynastyPanel = typeof renderDynastyPanel === "function" ? renderDynastyPanel : null;

function renderDynastyPanel() {
  if (!document.getElementById("panel-dynasty")?.classList.contains("active")) return;

  migrateDynastyV2();

  // World stats
  const statsEl = document.getElementById("dynastyWorldStats");
  if (statsEl) {
    const ranking = getDynastyRankingFull();
    const totalAlive = ranking.reduce((s, d) => s + d.aliveMembers, 0);
    const empires    = ranking.filter(d => d.status === "empire").length;
    const nations    = ranking.filter(d => d.status === "nation").length;
    const fallen     = ranking.filter(d => d.status === "fallen").length;
    const oldest     = [...ranking].sort((a,b) => a.foundedYear - b.foundedYear)[0];
    const strongest  = [...ranking].sort((a,b) => b.peakRealm - a.peakRealm)[0];

    statsEl.innerHTML = [
      { icon:"🏰", label:"Tổng Gia Tộc",   value: ranking.length },
      { icon:"👥", label:"Đang Sống",       value: totalAlive },
      { icon:"👑", label:"Hoàng Tộc",       value: empires },
      { icon:"🏛️", label:"Lập Quốc",       value: nations },
      { icon:"📜", label:"Lâu Đời Nhất",    value: oldest ? oldest.surname : "—" },
      { icon:"💀", label:"Đã Sụp Đổ",      value: fallen },
    ].map(s => `<div class="dyn-world-stat">
      <div class="dyn-ws-icon">${s.icon}</div>
      <div class="dyn-ws-val">${s.value}</div>
      <div class="dyn-ws-label">${s.label}</div>
    </div>`).join("");
  }

  // Top 100 ranking
  const rankEl = document.getElementById("dynastyRanking");
  if (rankEl) {
    // Update title
    const titleEl = rankEl.closest(".card")?.querySelector(".card-title");
    if (titleEl) titleEl.textContent = "🏆 Top 100 Gia Tộc Thiên Hạ";
    renderDynastyTop100(rankEl, _dynastyPage);
  }

  // If a dynasty is selected, re-render detail
  const selected = document.getElementById("dynastyDetailSurname")?.dataset?.surname;
  if (selected) showDynastyDetail(selected, false);
}

// ===== OVERRIDE showDynastyDetail with enhanced version =====
const _origShowDynastyDetail = typeof showDynastyDetail === "function" ? showDynastyDetail : null;

function showDynastyDetail(surname, scroll = true) {
  const d = dynasties[surname];
  if (!d) return;

  // Ensure migration
  if (!d.status) migrateDynastyV2();

  const detailEl = document.getElementById("dynastyDetail");
  if (!detailEl) return;

  const tag = document.getElementById("dynastyDetailSurname");
  if (tag) tag.dataset.surname = surname;

  const members   = getDynastyMembers(surname);
  const alive     = members.filter(n => n.status === "alive");
  const peakCol   = typeof realmColor === "function" ? realmColor(d.peakRealm) : "#facc15";
  const st        = DYNASTY_STATUS[(d.status || "stable").toUpperCase()] || DYNASTY_STATUS.STABLE;

  // Generation breakdown
  const genMap = {};
  members.forEach(n => {
    const g = n.generation || 1;
    if (!genMap[g]) genMap[g] = 0;
    genMap[g]++;
  });
  const genBreakdown = Object.entries(genMap)
    .sort(([a],[b]) => +a - +b)
    .map(([g, c]) => `<span class="dyn-title-chip">Đời ${g}: ${c} người</span>`)
    .join("");

  detailEl.innerHTML = `
    <div class="dyn-detail-header">
      <div style="flex:1;min-width:0">
        <div class="dyn-detail-name" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          🏰 Gia Tộc ${surname}
          <span style="font-size:13px;color:${st.color};padding:2px 8px;border:1px solid ${st.color}44;border-radius:12px;background:${st.color}12">${st.label}</span>
        </div>
        <div class="dyn-detail-sub">Khai sáng Năm ${d.foundedYear} bởi ${d.founderName} · ${d.generations} thế hệ truyền thừa</div>
        <div style="margin-top:6px">
          <div style="color:var(--white-dim);font-size:11px;margin-bottom:4px">Lãnh Thổ: <span style="color:var(--gold)">${d.territory || "Chưa xác định"}</span></div>
          <div style="display:flex;flex-wrap:wrap;gap:4px">
            ${(d.titles||[]).map(t=>`<span class="dyn-title-chip">${t}</span>`).join("")}
          </div>
        </div>
      </div>
      <div class="dyn-detail-power-grid">
        <div class="dyn-dp-stat"><div class="dyn-dp-val" style="color:${peakCol}">${(typeof REALMS !== "undefined" && REALMS[d.peakRealm]) ? REALMS[d.peakRealm].name : "?"}</div><div class="dyn-dp-lbl">Đỉnh Cảnh</div></div>
        <div class="dyn-dp-stat"><div class="dyn-dp-val">${alive.length}</div><div class="dyn-dp-lbl">Còn Sống</div></div>
        <div class="dyn-dp-stat"><div class="dyn-dp-val">${(d.wealth/1000).toFixed(1)}k</div><div class="dyn-dp-lbl">Tài Phú</div></div>
        <div class="dyn-dp-stat"><div class="dyn-dp-val">${(d.assets/1000||0).toFixed(1)}k</div><div class="dyn-dp-lbl">Tài Sản</div></div>
        <div class="dyn-dp-stat"><div class="dyn-dp-val">${d.reputation.toLocaleString()}</div><div class="dyn-dp-lbl">Danh Vọng</div></div>
        <div class="dyn-dp-stat"><div class="dyn-dp-val">${d.totalMembers}</div><div class="dyn-dp-lbl">Tổng Thành Viên</div></div>
      </div>
    </div>

    <div style="margin:10px 0;display:flex;flex-wrap:wrap;gap:4px">${genBreakdown}</div>

    <!-- TABS -->
    <div style="display:flex;gap:8px;margin:14px 0 10px;flex-wrap:wrap">
      <button class="btn-secondary small dyn-tab-btn active" onclick="dynastyTabSwitch('tree','${surname}',this)">🌳 Gia Phả</button>
      <button class="btn-secondary small dyn-tab-btn" onclick="dynastyTabSwitch('history','${surname}',this)">📜 Lịch Sử</button>
      <button class="btn-secondary small dyn-tab-btn" onclick="dynastyTabSwitch('members','${surname}',this)">👥 Thành Viên</button>
    </div>

    <div id="dyn-tab-tree">
      <div class="card-title" style="margin-bottom:10px">🌳 Gia Phả Tộc ${surname}</div>
      <div class="dyn-tree-wrap" id="dyn-tree-content-${surname}">
        ${buildFamilyTreeGraph(surname)}
      </div>
    </div>
    <div id="dyn-tab-history" style="display:none">
      <div class="card-title" style="margin-bottom:10px">📜 Triều Đại Sử</div>
      <div class="dyn-history-list">
        ${(d.history||[]).slice().reverse().map(h => `
          <div class="dyn-hist-item">
            <span class="dyn-hist-year">Năm ${h.year}</span>
            <span class="dyn-hist-text">${h.event}</span>
          </div>`).join("") || "<div style='color:var(--white-dim);font-size:12px;padding:12px'>Chưa có sử ký.</div>"}
      </div>
    </div>
    <div id="dyn-tab-members" style="display:none">
      <div class="card-title" style="margin-bottom:10px">👥 Toàn Bộ Thành Viên (${members.length})</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${members.sort((a,b) => b.realm - a.realm).map(npc => {
          const rc = typeof realmColor === "function" ? realmColor(npc.realm) : "#facc15";
          const isAlive = npc.status === "alive";
          return `<div class="dyn-member-node ${isAlive ? "alive" : "dead"}" onclick="openNPCModal(${npc.id})" style="cursor:pointer">
            <div class="dyn-member-avatar" style="border-color:${rc}44;background:${rc}10;color:${rc}">${npc.gender==="Nam"?"♂":"♀"}</div>
            <div class="dyn-member-info">
              <div class="dyn-member-name" style="color:${isAlive ? "var(--white-main)" : "var(--white-dim)"};">${npc.name}</div>
              <div class="dyn-member-realm" style="color:${rc};font-size:10px">${(typeof REALMS !== "undefined" && REALMS[npc.realm]) ? REALMS[npc.realm].name : "?"}</div>
              <div style="color:var(--white-dim);font-size:10px">Đời ${npc.generation||1}${isAlive ? "" : " · ☠"}</div>
            </div>
          </div>`;
        }).join("")}
      </div>
    </div>
  `;

  if (scroll) detailEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function dynastyTabSwitch(tab, surname, btn) {
  ["tree","history","members"].forEach(t => {
    const el = document.getElementById(`dyn-tab-${t}`);
    if (el) el.style.display = t === tab ? "block" : "none";
  });
  document.querySelectorAll(".dyn-tab-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
}

// ===== DYNASTY MINI BADGE for NPC Modal =====
function getDynastyBadgeHTML(npc) {
  if (!npc || !npc.family) return "";
  const d = dynasties[npc.family];
  if (!d) return "";
  const st    = DYNASTY_STATUS[(d.status || "stable").toUpperCase()] || DYNASTY_STATUS.STABLE;
  const rank  = getDynastyRankingFull().findIndex(x => x.surname === npc.family) + 1;
  const rankStr = rank > 0 && rank <= 100 ? ` · #${rank} Thiên Hạ` : "";
  return `<div class="dyn-npc-badge" onclick="showPanel('dynasty');showDynastyDetail('${npc.family}')" 
    title="Xem gia tộc ${npc.family}" style="cursor:pointer;margin:6px 0;padding:6px 10px;
    border-radius:8px;border:1px solid ${st.color}44;background:${st.color}10;display:inline-flex;
    align-items:center;gap:8px;font-size:12px">
    🏰 <strong style="color:${st.color}">${npc.family}</strong>
    <span style="color:var(--white-dim)">Đời ${npc.generation||1} · ${st.label}${rankStr}</span>
  </div>`;
}

// ===== INJECT Dynasty Badge into NPC Modal =====
(function patchNPCModal() {
  if (typeof openNPCModal !== "function") return;
  const _orig = openNPCModal;
  window.openNPCModal = function(id) {
    _orig(id);
    // After modal opens, inject dynasty badge
    setTimeout(() => {
      const npc = typeof npcById === "function" ? npcById(id) : null;
      if (!npc) return;
      // Find a good injection point — look for biography or relations section
      const modal = document.getElementById("npcModal") || document.querySelector(".modal-overlay");
      if (!modal) return;
      // Find existing badge or create one
      let existing = modal.querySelector(".dyn-npc-badge");
      if (existing) existing.remove();
      if (!npc.family) return;
      const badge = document.createElement("div");
      badge.innerHTML = getDynastyBadgeHTML(npc);
      // Try to insert near the top of modal content
      const header = modal.querySelector(".modal-header, .npc-modal-header, h2, h3");
      if (header) {
        header.insertAdjacentElement("afterend", badge.firstChild || badge);
      }
    }, 50);
  };
})();

// ===== INJECT Dynasty Quick-Stats into Dashboard =====
function injectDynastyDashboard() {
  const dash = document.getElementById("panel-dashboard");
  if (!dash) return;
  let dynDashEl = document.getElementById("dynasty-dashboard-widget");
  if (!dynDashEl) {
    dynDashEl = document.createElement("div");
    dynDashEl.id = "dynasty-dashboard-widget";
    dynDashEl.className = "card";
    dynDashEl.style.cssText = "margin-top:14px";
    // Append to dashboard
    dash.appendChild(dynDashEl);
  }

  const top5 = getDynastyRankingFull().slice(0, 5);
  if (!top5.length) return;

  dynDashEl.innerHTML = `
    <div class="card-title" style="margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">
      <span>👑 Top 5 Gia Tộc</span>
      <button class="btn-secondary small" onclick="showPanel('dynasty')">Xem Tất Cả →</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px">
      ${top5.map((d, i) => {
        const st = DYNASTY_STATUS[(d.status||"stable").toUpperCase()] || DYNASTY_STATUS.STABLE;
        const pc = typeof realmColor === "function" ? realmColor(d.peakRealm) : "#facc15";
        return `<div style="display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:8px;
          background:var(--bg-hover);cursor:pointer;border:1px solid var(--border)" 
          onclick="showPanel('dynasty');showDynastyDetail('${d.surname}')">
          <span style="color:var(--gold);min-width:20px;font-size:12px">#${i+1}</span>
          <span style="font-weight:600;color:var(--white-main)">${d.surname}</span>
          <span style="color:${st.color};font-size:11px">${st.label}</span>
          <span style="color:${pc};font-size:11px;margin-left:auto">${(typeof REALMS !== "undefined" && REALMS[d.peakRealm]) ? REALMS[d.peakRealm].name : "?"}</span>
          <span style="color:var(--white-dim);font-size:11px">${d.aliveMembers}👥</span>
        </div>`;
      }).join("")}
    </div>
  `;
}

// ===== INJECT Dynasty Events into World History =====
function addDynastyWorldHistoryEvent(surname, eventText, type = "civilization") {
  addWorldHistory(type, eventText, { dynastySurname: surname });
}

// ===== ENHANCED dynastyTick (called each tick) =====
const _origDynastyTick = typeof dynastyTick === "function" ? dynastyTick : null;

let _dynastyTickRunning = false;
function dynastyTick() {
  if (_dynastyTickRunning) return; // guard against infinite recursion
  _dynastyTickRunning = true;
  try {
    // Call original tick logic
    if (_origDynastyTick) _origDynastyTick();

    // Additional: life cycle updates
    Object.keys(dynasties).forEach(surname => {
      updateDynastyLifeCycle(surname);
    });
  } finally {
    _dynastyTickRunning = false;
  }

  // Refresh dashboard widget if visible
  if (document.getElementById("panel-dashboard")?.classList.contains("active")) {
    injectDynastyDashboard();
  }
}

// ===== CSS INJECTION =====
(function injectDynastyCSS() {
  const style = document.createElement("style");
  style.textContent = `
/* Dynasty Tree Graph */
.dyn-tree-graph { font-family: 'Noto Serif SC', monospace; font-size: 13px; }
.dyn-tree-row { display: flex; align-items: center; gap: 4px; padding: 2px 0; min-height: 28px; }
.dyn-tree-connector { color: var(--white-dim); font-family: monospace; white-space: pre; font-size: 12px; }
.dyn-tree-node {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 8px; border-radius: 6px; border: 1px solid;
  transition: all 0.15s; white-space: nowrap;
}
.dyn-tree-node:hover { filter: brightness(1.3); transform: translateX(2px); }
.dyn-tree-node.dead { opacity: 0.55; }
.dyn-tree-name { font-size: 12px; font-weight: 600; }
.dyn-tree-realm { }

/* Dynasty Rank Card enhanced */
.dyn-rank-card { transition: all 0.15s; }
.dyn-rank-card:hover { border-color: rgba(250,204,21,0.4) !important; transform: translateX(2px); }

/* Dynasty tab buttons */
.dyn-tab-btn.active { background: var(--gold-faint) !important; border-color: var(--gold) !important; color: var(--gold) !important; }

/* Dynasty NPC badge */
.dyn-npc-badge:hover { filter: brightness(1.2); }

/* Dynasty world stat enhanced */
.dyn-world-stat { text-align: center; padding: 8px 4px; border-radius: 8px; background: var(--bg-hover); border: 1px solid var(--border); }
.dyn-ws-icon { font-size: 18px; margin-bottom: 2px; }
.dyn-ws-val { font-size: 14px; font-weight: 700; color: var(--gold); }
.dyn-ws-label { font-size: 10px; color: var(--white-dim); }
  `;
  document.head.appendChild(style);
})();

// ===== INIT =====
(function initDynastyV2() {
  // Run migration when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      migrateDynastyV2();
    });
  } else {
    migrateDynastyV2();
  }
})();
