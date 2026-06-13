(function() {
"use strict";
// ============================================================
// PLAYER REGISTRY V50 — Creator God V6
// Hub UI: Patches player-hub-v28 with 7 new tabs
// Hồ Sơ · Nghề Nghiệp · Thành Tựu · Danh Vọng · Liên Kết · Ảnh Hưởng · Jarvis
// KHÔNG GHI ĐÈ bất kỳ file cũ — chỉ thêm tabs vào HUB_CONFIGS
// ============================================================
const INIT_DELAY = 6100;

// ─── PATCH HUB_CONFIGS ─────────────────────────────────────────
// Adds 7 new tabs to the existing player-hub-v28 hub definition
function patchHubConfigs(){
  // Find the hubEngine's HUB_CONFIGS via window.hubRenderPanel closure
  // We do it by re-calling hubRenderPanel after patching its internal state
  // Safe approach: store render funcs globally, then add tabs to hub config
  const V50_TABS = [
    { id:"career-v50",      icon:"🌟", label:"Hành Trình",  fn:"preg50RenderCareer"   },
    { id:"profession-v50",  icon:"⚒️", label:"Nghề Nghiệp", fn:"preg50RenderProfession" },
    { id:"achievement-v50", icon:"🏆", label:"Thành Tựu",   fn:"preg50RenderAchievement" },
    { id:"reputation-v50",  icon:"🌍", label:"Danh Vọng",   fn:"preg50RenderReputation" },
    { id:"affiliation-v50", icon:"🔗", label:"Liên Kết",    fn:"preg50RenderAffiliation" },
    { id:"world-impact-v50",icon:"⚔️", label:"Ảnh Hưởng",  fn:"preg50RenderWorldImpact" },
    { id:"jarvis-v50",      icon:"🤖", label:"Jarvis V50",  fn:"preg50RenderJarvis"   },
  ];

  // Try to patch the hub config via internal reference
  // hubEngine.js stores HUB_CONFIGS in closure — we patch by intercepting hubRenderPanel
  const _origHubRender = window.hubRenderPanel;
  if(typeof _origHubRender !== "function") return;

  // Store V50 tabs for injection
  window._playerV50Tabs = V50_TABS;

  // Wrap hubRenderPanel to inject V50 tabs into player-hub-v28 render
  window.hubRenderPanel = function(hubId){
    _origHubRender(hubId);
    if(hubId !== "player-hub-v28") return;

    // After original render, check if V50 tabs are in the tab bar
    const panel = document.getElementById("panel-player-hub-v28");
    if(!panel) return;

    // Find the tab bar div and append V50 tabs if not present
    const tabBars = panel.querySelectorAll("div button");
    let hasV50 = false;
    tabBars.forEach(btn => { if(btn.onclick && btn.onclick.toString().includes("v50")) hasV50 = true; });

    // If V50 tabs not yet shown, re-render with merged tab list
    if(!hasV50){
      const tabBar = panel.querySelector("div > div:first-child");
      if(tabBar){
        V50_TABS.forEach(t => {
          const btn = document.createElement("button");
          btn.innerHTML = t.icon + " " + t.label;
          btn.style.cssText = "padding:5px 8px;background:transparent;border:none;border-bottom:2px solid transparent;color:#64748b;cursor:pointer;font-size:11px;white-space:nowrap;transition:all 0.2s;font-family:'Noto Serif SC',serif";
          btn.onclick = function(){
            // Switch to V50 sub-panel
            const allPanels = panel.querySelectorAll(".hub-content-area, [id^='panel-']");
            document.querySelectorAll("[id^='panel-'][id$='-v50']").forEach(p => p.style.display="none");
            const targetPanel = document.getElementById("panel-" + t.id);
            if(targetPanel) { targetPanel.style.display="block"; }
            // Call render function
            if(typeof window[t.fn] === "function") window[t.fn]();
          };
          tabBar.appendChild(btn);
        });
      }
    }
  };

  console.log("[PlayerRegistryV50] Hub tabs patched — 7 tabs V50 thêm vào player-hub-v28.");
}

// ─── HELPERS ──────────────────────────────────────────────────
function _rarity(r){ return {common:"Bình Thường",uncommon:"Không Phổ Biến",rare:"Hiếm",epic:"Sử Thi",legendary:"Huyền Thoại"}[r]||r; }
function _rarityColor(r){ return {common:"#94a3b8",uncommon:"#4ade80",rare:"#60a5fa",epic:"#c084fc",legendary:"#fde68a"}[r]||"#94a3b8"; }
function _card(title, icon, color, body){
  return `<div style="background:#0f172a;border:1px solid ${color}44;border-left:3px solid ${color};border-radius:8px;padding:12px;margin-bottom:8px">
    <div style="color:${color};font-weight:bold;font-size:13px;margin-bottom:6px">${icon} ${title}</div>
    <div style="color:#cbd5e1;font-size:12px;line-height:1.5">${body}</div>
  </div>`;
}
function _progress(val, max, color){
  const pct = Math.min(100, Math.floor((val/Math.max(1,max))*100));
  return `<div style="background:#1e293b;border-radius:4px;height:6px;margin:4px 0">
    <div style="background:${color};height:100%;border-radius:4px;width:${pct}%;transition:width 0.3s"></div>
  </div><div style="color:#64748b;font-size:10px;text-align:right">${val}/${max} (${pct}%)</div>`;
}
function _renderIntoPanel(panelId, html){
  const p = document.getElementById(panelId);
  if(p) p.innerHTML = `<div style="padding:12px;overflow-y:auto;height:100%;font-family:'Noto Serif SC',serif;color:#e2e8f0;box-sizing:border-box">${html}</div>`;
}

// ─── CAREER PANEL ─────────────────────────────────────────────
window.preg50RenderCareer = function(){
  const data = window.playerCoreV50Data || {};
  const v28 = window.playerV28Data || {};
  const careers = typeof window.pv50GetAllCareers === "function" ? window.pv50GetAllCareers() : [];
  const curTier = data.career ? data.career.currentTier : 1;
  const mvTier = typeof window.pv50GetMvRepTier === "function" ? window.pv50GetMvRepTier() : {};

  const name = v28.name || "Chưa có nhân vật";
  const careerCards = careers.map(c => {
    const active = c.tier === curTier;
    const done = c.tier < curTier;
    const locked = c.tier > curTier;
    const bdr = active ? c.color : (done ? "#1e293b" : "#0f172a");
    const opacity = locked ? "opacity:0.4;" : "";
    return `<div style="background:#0f172a;border:2px solid ${active?c.color:"#1e293b"};border-radius:8px;padding:10px;margin-bottom:6px;${opacity}display:flex;align-items:center;gap:8px">
      <span style="font-size:20px">${c.icon}</span>
      <div style="flex:1">
        <div style="color:${active?c.color:(done?"#4ade80":"#475569")};font-weight:bold;font-size:13px">
          ${done?"✅ ":active?"▶ ":"🔒 "}${c.name} <span style="color:#475569;font-size:10px">(Tier ${c.tier})</span>
        </div>
        <div style="color:#64748b;font-size:11px">${c.desc}</div>
        ${active?`<div style="color:#fbbf24;font-size:10px;margin-top:4px">🌟 ${c.perks.join(" · ")}</div>`:""}
        ${locked?`<div style="color:#475569;font-size:10px">Yêu cầu: Danh tiếng ${c.req.fame.toLocaleString()} · Vàng ${c.req.wealth.toLocaleString()} · Cấp bậc ${c.req.rank}</div>`:""}
      </div>
    </div>`;
  }).join("");

  const historyHtml = (data.career && data.career.history || []).slice(-5).reverse().map(h =>
    `<div style="color:#64748b;font-size:11px;padding:2px 0">${h.year||0}년 · ${h.icon} ${h.name}</div>`
  ).join("") || "<div style='color:#475569;font-size:11px'>Chưa có lịch sử.</div>";

  const html = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div style="color:#fbbf24;font-size:16px;font-weight:bold">🌟 Hành Trình: ${name}</div>
      <div style="background:${mvTier.color||"#475569"}22;border:1px solid ${mvTier.color||"#475569"};border-radius:12px;padding:3px 10px;color:${mvTier.color||"#475569"};font-size:11px">${mvTier.icon||""} ${mvTier.name||"Vô Danh"}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">
      ${_card("Cấp Bậc Hiện Tại","🌟","#fbbf24",`Tier ${curTier}/10`)}
      ${_card("Danh Tiếng Đa Vũ Trụ","🌌","#c084fc",(data.multiverseRep||0).toLocaleString())}
      ${_card("Ảnh Hưởng Thế Giới","🌍","#4ade80",(data.worldRep||0).toLocaleString())}
    </div>
    <div style="color:#fbbf24;font-size:13px;font-weight:bold;margin-bottom:8px">📋 Con Đường Sự Nghiệp</div>
    ${careerCards}
    <div style="color:#60a5fa;font-size:13px;font-weight:bold;margin:12px 0 6px">📜 Lịch Sử Thăng Tiến</div>
    ${historyHtml}
  `;
  _renderIntoPanel("panel-career-v50", html);
};

// ─── PROFESSION PANEL ─────────────────────────────────────────
window.preg50RenderProfession = function(){
  const profs = typeof window.prof50GetAll === "function" ? window.prof50GetAll() : [];
  const cur = typeof window.prof50GetCurrent === "function" ? window.prof50GetCurrent() : null;
  const stats = typeof window.prof50GetStats === "function" ? window.prof50GetStats() : {};
  const log = typeof window.prof50GetLog === "function" ? window.prof50GetLog() : [];

  const profCards = profs.map(p => {
    const pd = typeof window.prof50GetData === "function" ? window.prof50GetData(p.id) : {};
    const active = cur && cur.id === p.id;
    const xp = pd.xp||0;
    const skills = pd.unlockedSkills||[];
    return `<div style="background:#0f172a;border:2px solid ${active?p.color:"#1e293b"};border-radius:8px;padding:10px;margin-bottom:6px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="color:${active?p.color:"#94a3b8"};font-weight:bold;font-size:13px">${p.icon} ${p.name} ${active?"▶":""}</div>
        <div style="display:flex;gap:4px">
          ${active ? "" : `<button onclick="window.prof50Choose('${p.id}');window.preg50RenderProfession();"
            style="background:${p.color}22;border:1px solid ${p.color};color:${p.color};padding:2px 8px;border-radius:4px;cursor:pointer;font-size:10px">Chọn</button>`}
          ${active ? p.actions.map(a => `<button onclick="var r=window.prof50DoAction('${p.id}','${a.id}');alert(r.success?'✅ '+JSON.stringify(r.reward):'❌ '+r.reason)"
            style="background:#1e293b;border:1px solid #334155;color:#cbd5e1;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:10px" title="${a.desc}">${a.name}</button>`).join("") : ""}
        </div>
      </div>
      <div style="color:#475569;font-size:11px;margin:4px 0">${p.desc}</div>
      ${active ? `<div style="margin:6px 0">${_progress(xp, p.skills[p.skills.length-1].req, p.color)}</div>` : ""}
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">
        ${p.skills.map(s => {
          const unlocked = skills.includes(s.id);
          return `<div style="background:${unlocked?p.color+"22":"#0a0f1a"};border:1px solid ${unlocked?p.color:"#1e293b"};border-radius:4px;padding:2px 6px;font-size:10px;color:${unlocked?p.color:"#475569"}" title="${s.effect}">
            ${s.icon} ${s.name} ${unlocked?"✅":"🔒("+s.req+")"}
          </div>`;
        }).join("")}
      </div>
    </div>`;
  }).join("");

  const logHtml = log.slice(0,8).map(l => `<div style="color:#64748b;font-size:11px;padding:2px 0">• ${l.msg}</div>`).join("") || "<div style='color:#475569;font-size:11px'>Chưa có hoạt động.</div>";

  const html = `
    <div style="color:#fbbf24;font-size:16px;font-weight:bold;margin-bottom:12px">⚒️ Nghề Nghiệp</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      ${_card("Nghề Hiện Tại","⚒️","#fb923c", cur ? `${cur.icon} ${cur.name}` : "Chưa chọn nghề")}
      ${_card("Kỹ Năng Đã Mở","🌟","#4ade80", (stats.skillsUnlocked||0) + " kỹ năng")}
    </div>
    ${profCards}
    <div style="color:#60a5fa;font-size:13px;font-weight:bold;margin:12px 0 6px">📋 Nhật Ký Hoạt Động</div>
    ${logHtml}
  `;
  _renderIntoPanel("panel-profession-v50", html);
};

// ─── ACHIEVEMENT PANEL ────────────────────────────────────────
window.preg50RenderAchievement = function(){
  const cats = typeof window.ach50GetCategories === "function" ? window.ach50GetCategories() : {};
  const stats = typeof window.ach50GetStats === "function" ? window.ach50GetStats() : {};
  const unlocked = typeof window.ach50GetUnlocked === "function" ? window.ach50GetUnlocked() : [];
  const all = typeof window.ach50GetAll === "function" ? window.ach50GetAll() : [];

  const catCards = Object.entries(cats).map(([cid, cat]) => {
    const cs = stats.byCat && stats.byCat[cid] || { total:0, unlocked:0 };
    return `<div style="background:#0f172a;border:1px solid ${cat.color}44;border-radius:6px;padding:8px;text-align:center">
      <div style="font-size:16px">${cat.icon}</div>
      <div style="color:${cat.color};font-size:11px;font-weight:bold">${cat.name}</div>
      <div style="color:#64748b;font-size:10px">${cs.unlocked}/${cs.total}</div>
      ${_progress(cs.unlocked, cs.total, cat.color)}
    </div>`;
  }).join("");

  const recentHtml = unlocked.slice(-6).reverse().map(u => {
    const ach = all.find(a => a.id === u.id);
    if(!ach) return "";
    return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #1e293b">
      <span style="font-size:18px">${ach.icon}</span>
      <div>
        <div style="color:${ach.color};font-size:12px;font-weight:bold">${ach.name}</div>
        <div style="color:#475569;font-size:10px">${ach.desc}</div>
      </div>
      <div style="margin-left:auto;color:#64748b;font-size:10px">Năm ${u.year||0}</div>
    </div>`;
  }).join("") || "<div style='color:#475569;font-size:11px'>Chưa mở khoá thành tựu nào.</div>";

  const allHtml = all.map(ach => {
    const done = unlocked.find(u => u.id === ach.id);
    return `<div style="display:flex;align-items:center;gap:6px;padding:5px;border-radius:4px;background:${done?"#0f172a":"transparent"};opacity:${done?1:0.5};margin-bottom:4px">
      <span style="font-size:16px">${ach.icon}</span>
      <div style="flex:1">
        <div style="color:${_rarityColor(ach.rare)};font-size:11px;font-weight:bold">${ach.name} <span style="color:#475569;font-size:9px">[${_rarity(ach.rare)}]</span></div>
        <div style="color:#64748b;font-size:10px">${ach.desc}</div>
      </div>
      <div style="color:${done?"#4ade80":"#475569"};font-size:12px">${done?"✅":"🔒"}</div>
    </div>`;
  }).join("");

  const html = `
    <div style="color:#fbbf24;font-size:16px;font-weight:bold;margin-bottom:12px">🏆 Thành Tựu (${stats.unlocked||0}/${stats.total||0} · ${stats.percent||0}%)</div>
    <div style="margin-bottom:12px">${_progress(stats.unlocked||0, stats.total||1, "#fbbf24")}</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px">${catCards}</div>
    <div style="color:#60a5fa;font-size:13px;font-weight:bold;margin-bottom:8px">🆕 Vừa Mở Khoá</div>
    ${recentHtml}
    <div style="color:#60a5fa;font-size:13px;font-weight:bold;margin:12px 0 6px">📋 Tất Cả Thành Tựu</div>
    <div style="max-height:300px;overflow-y:auto">${allHtml}</div>
  `;
  _renderIntoPanel("panel-achievement-v50", html);
};

// ─── REPUTATION PANEL ─────────────────────────────────────────
window.preg50RenderReputation = function(){
  const d = window.playerCoreV50Data || {};
  const repData = window.playerRepData || {};
  const v28 = window.playerV28Data || {};
  const mvTier = typeof window.pv50GetMvRepTier === "function" ? window.pv50GetMvRepTier() : {};

  const localRep = repData.reputation || 0;
  const worldRep = d.worldRep || 0;
  const mvRep = d.multiverseRep || 0;
  const fame = (v28.fame||0) + (repData.fame||0);

  const tierHtml = typeof window.ach50GetAll === "function" ? "" : "";
  const deedsHtml = (repData.heroicDeeds||[]).slice(-5).map(deed =>
    `<div style="color:#64748b;font-size:11px;padding:2px 0">⚔️ ${deed.desc||deed.title||"Chiến công anh hùng"} (Năm ${deed.year||0})</div>`
  ).join("") || "<div style='color:#475569;font-size:11px'>Chưa có chiến công.</div>";

  const titlesHtml = (repData.titles||[]).slice(-8).map(t =>
    `<div style="display:inline-block;background:#1e293b;border-radius:4px;padding:2px 8px;margin:2px;font-size:11px;color:#fbbf24">📜 ${t.name||t}</div>`
  ).join("") || "<div style='color:#475569;font-size:11px'>Chưa có danh hiệu.</div>";

  const html = `
    <div style="color:#fbbf24;font-size:16px;font-weight:bold;margin-bottom:12px">🌍 Danh Vọng</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      ${_card("Danh Tiếng Địa Phương","📍","#4ade80",localRep.toLocaleString())}
      ${_card("Danh Tiếng Thế Giới","🌍","#60a5fa",worldRep.toLocaleString())}
      ${_card("Danh Tiếng Đa Vũ Trụ","🌌","#c084fc",mvRep.toLocaleString())}
      ${_card("Danh Vọng Tổng","⭐","#fbbf24",fame.toLocaleString())}
    </div>
    <div style="background:#0f172a;border:2px solid ${mvTier.color||"#475569"};border-radius:8px;padding:12px;margin-bottom:12px;text-align:center">
      <div style="font-size:24px">${mvTier.icon||"❓"}</div>
      <div style="color:${mvTier.color||"#475569"};font-size:16px;font-weight:bold">${mvTier.name||"Vô Danh Tiểu Tốt"}</div>
      <div style="color:#64748b;font-size:11px;margin-top:4px">Cấp bậc danh vọng đa vũ trụ hiện tại</div>
    </div>
    <div style="color:#60a5fa;font-size:13px;font-weight:bold;margin-bottom:6px">📜 Danh Hiệu</div>
    <div>${titlesHtml}</div>
    <div style="color:#60a5fa;font-size:13px;font-weight:bold;margin:12px 0 6px">⚔️ Chiến Công</div>
    ${deedsHtml}
  `;
  _renderIntoPanel("panel-reputation-v50", html);
};

// ─── AFFILIATION PANEL ────────────────────────────────────────
window.preg50RenderAffiliation = function(){
  const d = window.playerCoreV50Data || {};
  const affs = d.affiliations || {};
  const founded = d.founded || {};
  const affTypes = typeof window.pv50GetAffiliationTypes === "function" ? window.pv50GetAffiliationTypes() : {};

  const affCards = Object.entries(affTypes).map(([tid, t]) => {
    const aff = affs[tid];
    return `<div style="background:#0f172a;border:1px solid ${aff?t.color+"44":"#1e293b"};border-radius:8px;padding:10px;margin-bottom:6px;display:flex;align-items:center;gap:10px">
      <span style="font-size:18px">${t.icon}</span>
      <div style="flex:1">
        <div style="color:${t.color};font-size:12px;font-weight:bold">${t.name}</div>
        ${aff ?
          `<div style="color:#e2e8f0;font-size:13px">${aff.name}</div>
           <div style="color:#64748b;font-size:10px">Tham gia: Năm ${aff.joined||0}</div>` :
          `<div style="color:#475569;font-size:11px">Chưa gia nhập</div>`
        }
      </div>
      ${aff ?
        `<button onclick="window.pv50LeaveAffiliation('${tid}');window.preg50RenderAffiliation();"
          style="background:#f8717122;border:1px solid #f87171;color:#f87171;padding:3px 8px;border-radius:4px;cursor:pointer;font-size:10px">Rời</button>` :
        `<button onclick="var n=prompt('Tên ${t.name} muốn gia nhập?');if(n){window.pv50JoinAffiliation('${tid}',n);window.preg50RenderAffiliation();}"
          style="background:${t.color}22;border:1px solid ${t.color};color:${t.color};padding:3px 8px;border-radius:4px;cursor:pointer;font-size:10px">Gia Nhập</button>`
      }
    </div>`;
  }).join("");

  const foundedHtml = Object.entries(founded).map(([type, items]) => {
    if(!items || items.length === 0) return "";
    return items.map(item => `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;color:#e2e8f0">
      <span>⚡</span>
      <div><div style="font-size:12px;color:#fbbf24">${item.name}</div>
      <div style="font-size:10px;color:#64748b">Thành lập: Năm ${item.founded||0} · Loại: ${type.replace("s","")}</div></div>
    </div>`).join("");
  }).join("") || "<div style='color:#475569;font-size:11px'>Chưa thành lập tổ chức nào.</div>";

  const html = `
    <div style="color:#fbbf24;font-size:16px;font-weight:bold;margin-bottom:12px">🔗 Liên Kết</div>
    ${affCards}
    <div style="color:#60a5fa;font-size:13px;font-weight:bold;margin:12px 0 6px">⚡ Tổ Chức Đã Thành Lập</div>
    ${foundedHtml}
  `;
  _renderIntoPanel("panel-affiliation-v50", html);
};

// ─── WORLD IMPACT PANEL ───────────────────────────────────────
window.preg50RenderWorldImpact = function(){
  const d = window.playerCoreV50Data || {};
  const wi = d.worldImpact || {};
  const impactTypes = typeof window.pv50GetImpactTypes === "function" ? window.pv50GetImpactTypes() : [];
  const log = typeof window.pv50GetLog === "function" ? window.pv50GetLog() : [];

  const impactCards = impactTypes.map(t => {
    const val = wi[t.id] || 0;
    return `<div style="background:#0f172a;border:1px solid #1e293b;border-radius:6px;padding:8px;text-align:center">
      <div style="font-size:16px">${t.icon}</div>
      <div style="color:#94a3b8;font-size:10px;margin:3px 0">${t.name}</div>
      <div style="color:#fbbf24;font-size:16px;font-weight:bold">${val.toLocaleString()}</div>
    </div>`;
  }).join("");

  const logHtml = log.slice(0,10).map(l => {
    const typeColors = {career:"#fbbf24",affiliation:"#818cf8",founded:"#4ade80",action:"#60a5fa"};
    return `<div style="color:${typeColors[l.type]||"#64748b"};font-size:11px;padding:2px 0;border-bottom:1px solid #0f172a">• ${l.msg}</div>`;
  }).join("") || "<div style='color:#475569;font-size:11px'>Chưa có hành động.</div>";

  const html = `
    <div style="color:#fbbf24;font-size:16px;font-weight:bold;margin-bottom:8px">⚔️ Ảnh Hưởng Thế Giới</div>
    <div style="background:#0f172a;border:1px solid #fbbf2444;border-radius:8px;padding:12px;margin-bottom:12px;text-align:center">
      <div style="color:#64748b;font-size:11px">Tổng Điểm Ảnh Hưởng</div>
      <div style="color:#fbbf24;font-size:28px;font-weight:bold">${(wi.totalScore||0).toLocaleString()}</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:12px">${impactCards}</div>
    <div style="color:#60a5fa;font-size:13px;font-weight:bold;margin-bottom:6px">📋 Nhật Ký Hành Động</div>
    ${logHtml}
  `;
  _renderIntoPanel("panel-world-impact-v50", html);
};

// ─── JARVIS PANEL ─────────────────────────────────────────────
window.preg50RenderJarvis = function(){
  const d = window.playerCoreV50Data || {};
  const v28 = window.playerV28Data || {};
  const cur = typeof window.prof50GetCurrent === "function" ? window.prof50GetCurrent() : null;
  const career = typeof window.pv50GetCareer === "function" ? window.pv50GetCareer() : {};
  const stats = typeof window.ach50GetStats === "function" ? window.ach50GetStats() : {};
  const mvTier = typeof window.pv50GetMvRepTier === "function" ? window.pv50GetMvRepTier() : {};

  const careerTier = d.career ? d.career.currentTier : 1;
  const nextCareer = (typeof window.pv50GetAllCareers === "function" ? window.pv50GetAllCareers() : []).find(c => c.tier === careerTier + 1);

  // Generate Jarvis suggestions
  const suggestions = [];
  if(!cur) suggestions.push({ icon:"⚒️", priority:"🔴", text:"Chưa chọn nghề nghiệp! Vào tab Nghề Nghiệp và chọn ngay.", action:"preg50RenderProfession" });
  if(!v28.id) suggestions.push({ icon:"👤", priority:"🔴", text:"Chưa tạo nhân vật! Hãy click 👤 Nhân Vật để tạo nhân vật.", action:null });
  if(nextCareer) {
    const needFame = Math.max(0, nextCareer.req.fame - (v28.fame||0));
    const needGold = Math.max(0, nextCareer.req.wealth - (v28.wealth||0));
    if(needFame > 0 || needGold > 0)
      suggestions.push({ icon:"🌟", priority:"🟡", text:`Tiến lên ${nextCareer.icon} ${nextCareer.name}: cần +${needFame.toLocaleString()} danh tiếng${needGold>0?" và +"+needGold.toLocaleString()+" vàng":""}`, action:null });
  }
  if((v28.fame||0) < 100) suggestions.push({ icon:"⚔️", priority:"🟡", text:"Tham gia chiến tranh hoặc làm nhiệm vụ để tăng danh tiếng.", action:null });
  if((v28.wealth||0) < 1000) suggestions.push({ icon:"💰", priority:"🟡", text:"Tích lũy thêm vàng bằng cách chọn nghề Thương Nhân hoặc hoàn thành nhiệm vụ thương mại.", action:null });
  if(stats.percent < 30) suggestions.push({ icon:"🏆", priority:"🟢", text:`Đã mở ${stats.unlocked||0}/${stats.total||0} thành tựu (${stats.percent||0}%). Kiểm tra tab Thành Tựu!`, action:"preg50RenderAchievement" });
  const affs = d.affiliations || {};
  if(!Object.values(affs).some(a => a)) suggestions.push({ icon:"🔗", priority:"🟡", text:"Hãy gia nhập một quốc gia hoặc tông môn để tăng ảnh hưởng.", action:"preg50RenderAffiliation" });
  if((d.worldImpact||{}).totalScore < 500) suggestions.push({ icon:"🌍", priority:"🟢", text:"World Impact Score thấp. Hãy tham gia nhiều hơn vào chính trị, chiến tranh và thiên tai.", action:null });
  suggestions.push({ icon:"🎯", priority:"🟢", text:`Cấp bậc đa vũ trụ: ${mvTier.icon||"❓"} ${mvTier.name||"Vô Danh"}. Tiếp tục tăng ảnh hưởng để thăng cấp!`, action:null });

  const sugHtml = suggestions.slice(0, 8).map(s =>
    `<div style="background:#0f172a;border:1px solid #1e293b;border-radius:6px;padding:10px;margin-bottom:6px;display:flex;gap:8px;align-items:flex-start">
      <div style="font-size:14px">${s.priority}</div>
      <div style="font-size:18px">${s.icon}</div>
      <div style="flex:1;color:#cbd5e1;font-size:12px;line-height:1.5">${s.text}</div>
      ${s.action ? `<button onclick="window['${s.action}']&&window['${s.action}']();"
        style="background:#3b82f622;border:1px solid #3b82f6;color:#60a5fa;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:10px;white-space:nowrap">→ Xem</button>` : ""}
    </div>`
  ).join("");

  const statusHtml = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      ${_card("Cấp Nghề","⚒️","#fb923c", cur ? `${cur.icon} ${cur.name}` : "Chưa chọn")}
      ${_card("Thành Tựu","🏆","#fbbf24", `${stats.unlocked||0}/${stats.total||0}`)}
      ${_card("Danh Vọng MV","🌌","#c084fc", (d.multiverseRep||0).toLocaleString())}
      ${_card("Ảnh Hưởng","🌍","#4ade80", (d.worldImpact && d.worldImpact.totalScore||0).toLocaleString())}
    </div>
  `;

  const html = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <div style="font-size:24px">🤖</div>
      <div>
        <div style="color:#fbbf24;font-size:16px;font-weight:bold">Jarvis V50 — Trợ Lý Người Chơi</div>
        <div style="color:#64748b;font-size:11px">AI phân tích hành trình và đề xuất hành động tốt nhất</div>
      </div>
    </div>
    ${statusHtml}
    <div style="color:#60a5fa;font-size:13px;font-weight:bold;margin-bottom:8px">💡 Đề Xuất Hành Động</div>
    ${sugHtml}
  `;
  _renderIntoPanel("panel-jarvis-v50", html);
};

// ─── INIT ─────────────────────────────────────────────────────
function init(){
  // Patch hub configs
  setTimeout(patchHubConfigs, 500);

  console.log("[PlayerRegistryV50] 🏛️ Hub UI Kỷ Nguyên Người Chơi V50 — 7 tabs · Career · Profession · Achievement · Reputation · Affiliation · Impact · Jarvis sẵn sàng.");
}

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
