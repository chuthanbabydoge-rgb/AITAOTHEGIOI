/* ============================
   CREATOR GOD V6 — WORLD STORY SYSTEM
   Công Cụ Kịch Bản AI
   worldStorySystem.js
   ============================ */

// ============================
// STORY DATA STORE
// ============================

let worldStory = [];           // [{id, year, type, title, body, tags, npcs, sects, countries}]
let storyChapters = [];        // [{id, title, yearStart, yearEnd, summary, eventIds}]
let storyBiographies = {};     // key = npcId, value = bio object
let storySectHistory = {};     // key = sectId, value = history object
let storyCountryHistory = {};  // key = countryId, value = history object

const STORY_VERSION = 1;

// Story event categories — expand on top of HISTORY_EVENT_TYPES
const STORY_EVENT_META = {
  breakthrough: { label:"Đột Phá Cảnh Giới", icon:"✨", color:"#facc15", chapter: true },
  war:          { label:"Tông Môn Chiến",     icon:"⚔️",  color:"#f87171", chapter: true },
  marriage:     { label:"Kết Đạo Lữ",         icon:"💑",  color:"#f472b6", chapter: false },
  death:        { label:"Tử Vong",            icon:"☠️",  color:"#94a3b8", chapter: false },
  sect:         { label:"Lập Tông Môn",       icon:"🏯",  color:"#fb923c", chapter: true },
  boss:         { label:"Boss Chiến",         icon:"🐉",  color:"#c084fc", chapter: true },
  heavenly:     { label:"Thiên Đạo Sự Kiện",  icon:"🌌",  color:"#60a5fa", chapter: true },
  civilization: { label:"Văn Minh Gia Tộc",   icon:"🌟",  color:"#4ade80", chapter: false },
  era:          { label:"Kỷ Nguyên Mới",      icon:"🌐",  color:"#67e8f9", chapter: true },
  realm:        { label:"Bí Cảnh Khai Mở",    icon:"🌀",  color:"#a78bfa", chapter: false },
  birth:        { label:"Xuất Thế",           icon:"🌱",  color:"#86efac", chapter: false },
  nation_war:   { label:"Quốc Chiến",         icon:"🏴",  color:"#fca5a5", chapter: true },
  ascend:       { label:"Phi Thăng",          icon:"🌠",  color:"#fde68a", chapter: true },
};

// ============================
// STORY PERSISTENCE
// ============================

function saveStory() {
  try {
    localStorage.setItem("cgv6_worldStory",          JSON.stringify(worldStory.slice(0, 2000)));
    localStorage.setItem("cgv6_storyChapters",       JSON.stringify(storyChapters));
    localStorage.setItem("cgv6_storyBiographies",    JSON.stringify(storyBiographies));
    localStorage.setItem("cgv6_storySectHistory",    JSON.stringify(storySectHistory));
    localStorage.setItem("cgv6_storyCountryHistory", JSON.stringify(storyCountryHistory));
  } catch(e) { console.warn("Story save failed:", e); }
}

function loadStory() {
  try {
    worldStory          = JSON.parse(localStorage.getItem("cgv6_worldStory"))          || [];
    storyChapters       = JSON.parse(localStorage.getItem("cgv6_storyChapters"))       || [];
    storyBiographies    = JSON.parse(localStorage.getItem("cgv6_storyBiographies"))    || {};
    storySectHistory    = JSON.parse(localStorage.getItem("cgv6_storySectHistory"))    || {};
    storyCountryHistory = JSON.parse(localStorage.getItem("cgv6_storyCountryHistory")) || {};
  } catch(e) {
    worldStory = []; storyChapters = []; storyBiographies = {};
    storySectHistory = {}; storyCountryHistory = {};
  }
}

// ============================
// STORY EVENT INJECTION
// Gọi mỗi khi addWorldHistory được gọi
// ============================

// Patch addWorldHistory to also feed worldStory (called after original loads)
function patchWorldHistoryForStory() {
  const _orig = window._origAddWorldHistory || addWorldHistory;
  window._origAddWorldHistory = _orig;

  window.addWorldHistory = function(eventType, description, extra = {}) {
    // Call original
    _orig(eventType, description, extra);
    // Also push to worldStory
    addStoryEvent(eventType, description, extra);
  };
}

let _storyIdCounter = 1;

function addStoryEvent(eventType, description, extra = {}) {
  const currentYear = (typeof year !== "undefined") ? year : 0;
  const meta = STORY_EVENT_META[eventType] || { label: eventType, icon: "📌", color: "#facc15" };

  // Build a richer narrative line
  const narrativeLine = buildNarrativeLine(eventType, description, extra, currentYear);

  const storyEvent = {
    id:          _storyIdCounter++,
    year:        currentYear,
    eventType,
    description,
    narrative:   narrativeLine,
    tags:        buildTags(eventType, extra),
    npcNames:    extra.npcName   ? [extra.npcName, extra.partner].filter(Boolean) : [],
    sectNames:   extra.sectName  ? [extra.sectName, extra.winner, extra.loser].filter(Boolean) : [],
    countryNames:[],
    extra,
  };

  worldStory.push(storyEvent);
  if (worldStory.length > 2000) worldStory.shift();

  // Update biographies
  updateBiographies(storyEvent);
  // Update sect history
  updateSectHistory(storyEvent);
  // Auto-generate chapters every 50 chapter-worthy events
  maybeAutoChapter();

  saveStory();
}

function buildNarrativeLine(type, desc, extra, yr) {
  const realmName = (r) => {
    if (typeof REALMS !== "undefined" && REALMS[r]) return REALMS[r].name;
    return `cảnh giới ${r}`;
  };
  switch(type) {
    case "breakthrough":
      return `Năm ${yr}: ${extra.npcName || "Một tu sĩ"} đột phá thành công ${realmName(extra.realm)}, chấn động thiên hạ.`;
    case "war":
      return `Năm ${yr}: ${extra.winner || "?"} đại thắng ${extra.loser || "?"} trong cuộc tông môn chiến, ${extra.casualties || 0} người tử vong.`;
    case "marriage":
      return `Năm ${yr}: ${extra.npcName || "?"} và ${extra.partner || "?"} kết thành đạo lữ, thiên địa chúc mừng.`;
    case "death":
      return `Năm ${yr}: ${extra.npcName || "?"} [${realmName(extra.realm)}] đã tử vong — ${extra.reason || desc}.`;
    case "sect":
      return `Năm ${yr}: Tông môn [${extra.sectName || "?"}] được thành lập tại ${extra.territory || "vùng đất mới"}.`;
    case "boss":
      return `Năm ${yr}: ${extra.hero || "?"} [${realmName(extra.heroRealm)}] đã tiêu diệt ${extra.boss || "đại boss"}, lưu danh thiên cổ.`;
    case "heavenly":
      return `Năm ${yr}: Thiên đạo giáng ${extra.eventName || desc}. ${extra.deathCount ? extra.deathCount + " tu sĩ tử vong." : ""}`;
    case "era":
      return `Năm ${yr}: Thiên địa chuyển vào kỷ nguyên mới — ${extra.era || desc}.`;
    default:
      return `Năm ${yr}: ${desc}`;
  }
}

function buildTags(type, extra) {
  const tags = [type];
  if (extra.npcName)    tags.push(extra.npcName);
  if (extra.partner)    tags.push(extra.partner);
  if (extra.sectName)   tags.push(extra.sectName);
  if (extra.winner)     tags.push(extra.winner);
  if (extra.loser)      tags.push(extra.loser);
  if (extra.hero)       tags.push(extra.hero);
  if (extra.boss)       tags.push(extra.boss);
  if (extra.era)        tags.push(extra.era);
  return [...new Set(tags)];
}

function updateBiographies(storyEvent) {
  const { extra, eventType, year: yr, narrative } = storyEvent;
  const npcName = extra.npcName || extra.hero;
  if (!npcName) return;

  if (!storyBiographies[npcName]) {
    storyBiographies[npcName] = {
      name: npcName,
      events: [],
      born: yr,
      died: null,
      peakRealm: 0,
      titles: [],
    };
  }
  const bio = storyBiographies[npcName];
  bio.events.push({ year: yr, type: eventType, text: narrative });

  if (eventType === "death") bio.died = yr;
  if (eventType === "breakthrough" && extra.realm > (bio.peakRealm || 0)) bio.peakRealm = extra.realm;
  if (eventType === "boss") bio.titles.push("🐉 Đồ Long Giả");
  if (eventType === "marriage") bio.titles.push("💑 Đạo Lữ");

  // Keep max 50 events per bio
  if (bio.events.length > 50) bio.events.shift();
}

function updateSectHistory(storyEvent) {
  const { extra, eventType, year: yr, narrative } = storyEvent;
  const sectKey = extra.sectName || extra.winner;
  if (!sectKey) return;

  if (!storySectHistory[sectKey]) {
    storySectHistory[sectKey] = { name: sectKey, events: [], founded: yr, wars: 0, victories: 0 };
  }
  const sh = storySectHistory[sectKey];
  sh.events.push({ year: yr, type: eventType, text: narrative });
  if (eventType === "war") { sh.wars++; sh.victories++; }
  if (sh.events.length > 100) sh.events.shift();

  // Also track loser
  if (extra.loser && extra.loser !== sectKey) {
    if (!storySectHistory[extra.loser]) {
      storySectHistory[extra.loser] = { name: extra.loser, events: [], founded: yr, wars: 0, victories: 0 };
    }
    storySectHistory[extra.loser].events.push({ year: yr, type: "war", text: `Năm ${yr}: ${extra.loser} bại trận trước ${extra.winner}.` });
    storySectHistory[extra.loser].wars++;
  }
}

let _chapterEventCount = 0;
function maybeAutoChapter() {
  _chapterEventCount++;
  // Auto-chapter every 20 chapter-worthy events
  const chapterWorthy = worldStory.filter(e => STORY_EVENT_META[e.eventType]?.chapter).length;
  const lastChapter = storyChapters[storyChapters.length - 1];
  const lastChapterYear = lastChapter ? lastChapter.yearEnd : 0;
  const currentYear = (typeof year !== "undefined") ? year : 0;

  if (chapterWorthy > 0 && chapterWorthy % 20 === 0 && currentYear > lastChapterYear + 5) {
    autoGenerateChapter();
  }
}

function autoGenerateChapter() {
  const currentYear = (typeof year !== "undefined") ? year : 0;
  const lastChapter = storyChapters[storyChapters.length - 1];
  const fromYear = lastChapter ? lastChapter.yearEnd + 1 : 1;

  const periodEvents = worldStory.filter(e => e.year >= fromYear && e.year <= currentYear);
  if (!periodEvents.length) return;

  const chapterNum = storyChapters.length + 1;
  const title = generateChapterTitle(periodEvents, chapterNum);
  const summary = generateChapterSummary(periodEvents);

  storyChapters.push({
    id: chapterNum,
    title,
    yearStart: fromYear,
    yearEnd: currentYear,
    summary,
    eventCount: periodEvents.length,
    eventIds: periodEvents.map(e => e.id),
    generatedAt: currentYear,
  });

  if (storyChapters.length > 200) storyChapters.shift();
  saveStory();
}

function generateChapterTitle(events, num) {
  const romanNums = ["I","II","III","IV","V","VI","VII","VIII","IX","X",
                     "XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX"];
  const chapterTitles = [
    "Hồng Hoang Truyền Thuyết", "Thiên Kiêu Xuất Thế", "Đại Chiến Sơn Hà",
    "Lập Tông Khai Phái", "Phong Vân Biến Đổi", "Thiên Địa Đổi Màu",
    "Anh Hùng Mạt Nhật", "Đạo Lữ Thiên Duyên", "Boss Giáng Thế",
    "Kỷ Nguyên Hỗn Loạn", "Phi Thăng Chi Lộ", "Thịnh Suy Luân Hồi",
  ];

  // Pick title based on dominant event type
  const typeCounts = {};
  events.forEach(e => { typeCounts[e.eventType] = (typeCounts[e.eventType] || 0) + 1; });
  const dominant = Object.entries(typeCounts).sort((a,b) => b[1]-a[1])[0]?.[0];

  const typeTitle = {
    breakthrough: "Đột Phá Truyền Kỳ",
    war:          "Tông Môn Đại Chiến",
    marriage:     "Thiên Duyên Hội Ngộ",
    boss:         "Đồ Long Chi Chiến",
    era:          "Kỷ Nguyên Biến Thiên",
    sect:         "Lập Tông Khai Phái",
    heavenly:     "Thiên Đạo Giáng Phạt",
  };

  const base = typeTitle[dominant] || chapterTitles[num % chapterTitles.length];
  const roman = romanNums[(num - 1) % romanNums.length] || num;
  return `Chương ${roman}: ${base}`;
}

function generateChapterSummary(events) {
  const wars = events.filter(e => e.eventType === "war");
  const breakthroughs = events.filter(e => e.eventType === "breakthrough");
  const deaths = events.filter(e => e.eventType === "death");
  const marriages = events.filter(e => e.eventType === "marriage");
  const bossFights = events.filter(e => e.eventType === "boss");
  const sects = events.filter(e => e.eventType === "sect");
  const heavenly = events.filter(e => e.eventType === "heavenly");

  let parts = [];
  if (sects.length)       parts.push(`${sects.length} tông môn được thành lập`);
  if (breakthroughs.length) parts.push(`${breakthroughs.length} lần đột phá cảnh giới`);
  if (wars.length)        parts.push(`${wars.length} trận tông môn chiến`);
  if (bossFights.length)  parts.push(`${bossFights.length} đại boss bị tiêu diệt`);
  if (marriages.length)   parts.push(`${marriages.length} cặp đạo lữ kết hợp`);
  if (deaths.length)      parts.push(`${deaths.length} tu sĩ tử vong`);
  if (heavenly.length)    parts.push(`${heavenly.length} thiên đạo sự kiện giáng thế`);

  if (!parts.length) return "Thiên địa bình yên, tu sĩ âm thầm tu luyện.";

  // Pick 2-3 notable narrative lines
  const notable = events
    .filter(e => STORY_EVENT_META[e.eventType]?.chapter)
    .slice(0, 3)
    .map(e => e.narrative);

  return `${parts.join(", ")}.\n\n${notable.join(" ")}`;
}

// ============================
// AI SUMMARY GENERATOR (using Anthropic API in-artifact style)
// ============================

async function generateAISummary(context, targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;
  el.innerHTML = `<div class="story-ai-loading"><span class="spin">⚙️</span> AI đang soạn kịch bản...</div>`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: context }],
      }),
    });
    const data = await response.json();
    const text = (data.content || []).map(b => b.text || "").join("");
    el.innerHTML = `<div class="story-ai-result">${text.replace(/\n/g, "<br>")}</div>`;
  } catch(err) {
    el.innerHTML = `<div class="story-ai-error">❌ Lỗi kết nối AI: ${err.message}</div>`;
  }
}

// ============================
// EXPORT FUNCTIONS
// ============================

function exportStoryJSON() {
  const currentYear = (typeof year !== "undefined") ? year : 0;
  const worldName = (typeof world !== "undefined" && world) ? world.name : "Thế Giới Không Tên";

  const exportData = {
    version: STORY_VERSION,
    exportedAt: new Date().toISOString(),
    worldName,
    currentYear,
    totalEvents: worldStory.length,
    totalChapters: storyChapters.length,
    worldStory,
    storyChapters,
    storyBiographies,
    storySectHistory,
    storyCountryHistory,
    worldHistory: (typeof worldHistory !== "undefined") ? worldHistory : [],
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${worldName.replace(/\s+/g,"_")}_story_year${currentYear}.json`;
  a.click();
  URL.revokeObjectURL(url);
  if (typeof toast === "function") toast("📥 Đã xuất kịch bản JSON thành công!");
}

function exportStoryText() {
  const currentYear = (typeof year !== "undefined") ? year : 0;
  const worldName = (typeof world !== "undefined" && world) ? world.name : "Thế Giới Không Tên";

  let txt = `╔══════════════════════════════════╗\n`;
  txt += `║  ${worldName.toUpperCase()}  ║\n`;
  txt += `║  BIÊN NIÊN SỬ — NĂM ${currentYear}  ║\n`;
  txt += `╚══════════════════════════════════╝\n\n`;

  // Chapters
  if (storyChapters.length) {
    txt += `════ CÁC CHƯƠNG TRUYỆN (${storyChapters.length}) ════\n\n`;
    storyChapters.forEach(ch => {
      txt += `【${ch.title}】\n`;
      txt += `  Năm ${ch.yearStart} – ${ch.yearEnd} | ${ch.eventCount} sự kiện\n`;
      txt += `  ${ch.summary}\n\n`;
    });
  }

  // Timeline
  txt += `════ DÒNG THỜI GIAN (${worldStory.length} sự kiện) ════\n\n`;
  const sorted = worldStory.slice().sort((a,b) => a.year - b.year);
  sorted.forEach(e => {
    const meta = STORY_EVENT_META[e.eventType] || { icon:"📌" };
    txt += `${meta.icon} ${e.narrative}\n`;
  });

  // Biographies
  const bioKeys = Object.keys(storyBiographies);
  if (bioKeys.length) {
    txt += `\n════ TIỂU SỬ NHÂN VẬT (${bioKeys.length}) ════\n\n`;
    bioKeys.forEach(name => {
      const bio = storyBiographies[name];
      txt += `▶ ${bio.name}`;
      if (bio.born) txt += ` (Năm ${bio.born}`;
      if (bio.died) txt += ` – ${bio.died})`;
      else if (bio.born) txt += ")";
      txt += "\n";
      if (bio.titles?.length) txt += `  Danh hiệu: ${bio.titles.join(", ")}\n`;
      bio.events.slice(-5).forEach(ev => { txt += `  • ${ev.text}\n`; });
      txt += "\n";
    });
  }

  // Sect histories
  const sectKeys = Object.keys(storySectHistory);
  if (sectKeys.length) {
    txt += `════ LỊCH SỬ TÔNG MÔN (${sectKeys.length}) ════\n\n`;
    sectKeys.forEach(sn => {
      const sh = storySectHistory[sn];
      txt += `▶ ${sh.name} (Thành lập năm ${sh.founded}) | ${sh.wars} trận chiến, ${sh.victories} chiến thắng\n`;
      sh.events.slice(-5).forEach(ev => { txt += `  • ${ev.text}\n`; });
      txt += "\n";
    });
  }

  const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${worldName.replace(/\s+/g,"_")}_story_year${currentYear}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  if (typeof toast === "function") toast("📄 Đã xuất kịch bản TXT thành công!");
}

// ============================
// SYNC: Import existing worldHistory into worldStory on init
// ============================

function syncWorldHistoryToStory() {
  if (typeof worldHistory === "undefined" || !worldHistory.length) return;
  // Only add events not already in worldStory
  const existingYears = new Set(worldStory.map(e => `${e.year}_${e.description}`));
  const toAdd = worldHistory.filter(e => !existingYears.has(`${e.year}_${e.description}`));
  if (!toAdd.length) return;

  toAdd.forEach(e => {
    const meta = STORY_EVENT_META[e.eventType] || { label: e.eventType, icon: "📌", color: "#facc15" };
    const narrativeLine = buildNarrativeLine(e.eventType, e.description, e, e.year);
    worldStory.push({
      id: _storyIdCounter++,
      year: e.year,
      eventType: e.eventType,
      description: e.description,
      narrative: narrativeLine,
      tags: buildTags(e.eventType, e),
      npcNames: [],
      sectNames: [],
      extra: e,
    });
  });
  worldStory.sort((a,b) => a.year - b.year);
  if (worldStory.length > 2000) worldStory.splice(0, worldStory.length - 2000);
  saveStory();
}

// ============================
// RENDER: STORY PANEL
// ============================

function renderStoryPanel() {
  if (!document.getElementById("panel-story")?.classList.contains("active")) return;

  const currentYear = (typeof year !== "undefined") ? year : 0;
  const worldName = (typeof world !== "undefined" && world) ? world.name : "Thế Giới Không Tên";

  renderStoryTimeline();
  renderStoryChapters();
  renderStoryBiographies();
  renderStorySectHistory();
  renderStoryCountryOverview();

  const headerEl = document.getElementById("storyWorldHeader");
  if (headerEl) {
    headerEl.innerHTML = `
      <span style="color:var(--gold);font-family:var(--font-heading)">${worldName}</span>
      <span style="color:var(--white-dim);font-size:12px">Năm ${currentYear} · ${worldStory.length} sự kiện · ${storyChapters.length} chương</span>
    `;
  }
}

function renderStoryTimeline() {
  const el = document.getElementById("storyTimelineList");
  if (!el) return;

  const filterType   = document.getElementById("storyFilterType")?.value || "";
  const filterSearch = document.getElementById("storyFilterSearch")?.value.trim().toLowerCase() || "";
  const filterYear   = document.getElementById("storyFilterYear")?.value.trim() || "";

  let events = worldStory.slice().sort((a,b) => b.year - a.year);
  if (filterType)   events = events.filter(e => e.eventType === filterType);
  if (filterYear)   events = events.filter(e => String(e.year).includes(filterYear));
  if (filterSearch) events = events.filter(e =>
    e.narrative.toLowerCase().includes(filterSearch) ||
    e.tags.some(t => t.toLowerCase().includes(filterSearch))
  );

  const shown = events.slice(0, 200);

  if (!shown.length) {
    el.innerHTML = `<div class="story-empty">📜 Chưa có sự kiện nào. Thiên địa đang hình thành...</div>`;
    return;
  }

  el.innerHTML = shown.map((e, idx) => {
    const meta = STORY_EVENT_META[e.eventType] || { icon:"📌", color:"#facc15", label: e.eventType };
    const side = idx % 2 === 0 ? "left" : "right";
    return `
      <div class="wh-timeline-row wh-${side}">
        <div class="wh-timeline-node" style="background:${meta.color};box-shadow:0 0 8px ${meta.color}55"></div>
        <div class="wh-entry" style="border-color:${meta.color}33">
          <div class="wh-entry-header">
            <span class="wh-type-pill" style="background:${meta.color}15;color:${meta.color};border-color:${meta.color}44">${meta.icon} ${meta.label}</span>
            <span class="wh-year-badge">📅 Năm ${e.year}</span>
          </div>
          <div class="wh-entry-desc">${e.narrative}</div>
          ${e.tags.length > 1 ? `<div class="story-tags">${e.tags.slice(1).map(t=>`<span class="story-tag">${t}</span>`).join("")}</div>` : ""}
        </div>
      </div>`;
  }).join("");

  const countEl = document.getElementById("storyTimelineCount");
  if (countEl) countEl.textContent = `${shown.length} / ${worldStory.length} sự kiện`;
}

function renderStoryChapters() {
  const el = document.getElementById("storyChapterList");
  if (!el) return;

  if (!storyChapters.length) {
    el.innerHTML = `<div class="story-empty">📖 Chưa có chương nào. Cần thêm nhiều sự kiện quan trọng để tạo chương tự động.<br><small>Hoặc bấm "Tạo Chương Thủ Công" bên trên.</small></div>`;
    return;
  }

  el.innerHTML = storyChapters.slice().reverse().map(ch => `
    <div class="story-chapter-card" onclick="expandChapter(${ch.id})">
      <div class="story-chapter-header">
        <span class="story-chapter-title">${ch.title}</span>
        <span class="story-chapter-years">Năm ${ch.yearStart}–${ch.yearEnd}</span>
      </div>
      <div class="story-chapter-meta">${ch.eventCount} sự kiện · Soạn năm ${ch.generatedAt || ch.yearEnd}</div>
      <div class="story-chapter-summary" id="chExpand_${ch.id}" style="display:none">
        ${ch.summary.replace(/\n/g,"<br>")}
        <div style="margin-top:8px">
          <button class="btn-secondary" style="font-size:11px;padding:4px 10px"
            onclick="event.stopPropagation();generateAIChapterSummary(${ch.id})">
            🤖 AI Viết Lại Chương
          </button>
        </div>
        <div id="aiChapter_${ch.id}" style="margin-top:8px"></div>
      </div>
    </div>
  `).join("");
}

function expandChapter(id) {
  const el = document.getElementById(`chExpand_${id}`);
  if (!el) return;
  el.style.display = el.style.display === "none" ? "block" : "none";
}

function generateAIChapterSummary(chapterId) {
  const ch = storyChapters.find(c => c.id === chapterId);
  if (!ch) return;

  const events = worldStory.filter(e => ch.eventIds?.includes(e.id)).slice(0, 30);
  const lines = events.map(e => `- ${e.narrative}`).join("\n");

  const prompt = `Bạn là một nhà văn tiểu thuyết tu tiên Trung Quốc. Hãy viết lại "${ch.title}" (Năm ${ch.yearStart}–${ch.yearEnd}) thành một đoạn văn kịch tính, hào hùng theo phong cách truyện tiên hiệp, khoảng 150–200 chữ tiếng Việt. Không liệt kê, hãy kể thành câu chuyện liền mạch.\n\nCác sự kiện chính:\n${lines}`;

  generateAISummary(prompt, `aiChapter_${chapterId}`);
}

function renderStoryBiographies() {
  const el = document.getElementById("storyBioList");
  if (!el) return;

  const bios = Object.values(storyBiographies).sort((a,b) => (b.events?.length||0) - (a.events?.length||0));

  if (!bios.length) {
    el.innerHTML = `<div class="story-empty">👤 Chưa có tiểu sử nhân vật nào được ghi chép.</div>`;
    return;
  }

  const searchVal = document.getElementById("storyBioSearch")?.value.trim().toLowerCase() || "";
  const filtered = searchVal ? bios.filter(b => b.name.toLowerCase().includes(searchVal)) : bios;

  el.innerHTML = filtered.slice(0,50).map(bio => {
    const lifespan = bio.died ? `Năm ${bio.born||"?"} – ${bio.died}` : `Sinh năm ${bio.born||"?"}`;
    const realmName = (r) => {
      if (r && typeof REALMS !== "undefined" && REALMS[r]) return REALMS[r].name;
      return r ? `Cảnh giới ${r}` : "Chưa rõ";
    };
    return `
      <div class="story-bio-card" onclick="expandBio('${encodeURIComponent(bio.name)}')">
        <div class="story-bio-header">
          <div class="story-bio-avatar">${bio.name[0]}</div>
          <div>
            <div class="story-bio-name">${bio.name}</div>
            <div class="story-bio-meta">${lifespan} · Đỉnh cao: ${realmName(bio.peakRealm)}</div>
            ${bio.titles?.length ? `<div class="story-bio-titles">${bio.titles.slice(0,3).map(t=>`<span class="story-tag">${t}</span>`).join("")}</div>` : ""}
          </div>
          <button class="btn-secondary" style="margin-left:auto;font-size:10px;padding:3px 8px"
            onclick="event.stopPropagation();generateAIBio('${encodeURIComponent(bio.name)}')">🤖 AI Tiểu Sử</button>
        </div>
        <div class="story-bio-events" id="bioExpand_${encodeURIComponent(bio.name)}" style="display:none">
          ${bio.events.slice(-8).reverse().map(ev => `<div class="story-bio-event">• ${ev.text}</div>`).join("")}
          <div id="aiBio_${encodeURIComponent(bio.name)}" style="margin-top:6px"></div>
        </div>
      </div>`;
  }).join("");
}

function expandBio(encodedName) {
  const el = document.getElementById(`bioExpand_${encodedName}`);
  if (!el) return;
  el.style.display = el.style.display === "none" ? "block" : "none";
}

function generateAIBio(encodedName) {
  const name = decodeURIComponent(encodedName);
  const bio = storyBiographies[name];
  if (!bio) return;

  const lines = bio.events.slice(-15).map(e => `- ${e.text}`).join("\n");
  const realmName = (r) => (typeof REALMS !== "undefined" && REALMS[r]) ? REALMS[r].name : `Cảnh ${r}`;

  const prompt = `Bạn là nhà văn tiên hiệp. Hãy viết tiểu sử nhân vật "${name}" theo phong cách truyện tu tiên Trung Quốc, khoảng 120 chữ tiếng Việt. Đỉnh cao cảnh giới: ${realmName(bio.peakRealm)}. ${bio.died ? `Đã tử vong năm ${bio.died}.` : "Còn sống."} ${bio.titles?.length ? `Danh hiệu: ${bio.titles.join(", ")}.` : ""}\n\nSự kiện cuộc đời:\n${lines}`;

  generateAISummary(prompt, `aiBio_${encodedName}`);
}

function renderStorySectHistory() {
  const el = document.getElementById("storySectHistoryList");
  if (!el) return;

  const sects_list = Object.values(storySectHistory).sort((a,b) => (b.wars||0) - (a.wars||0));

  if (!sects_list.length) {
    el.innerHTML = `<div class="story-empty">🏯 Chưa có lịch sử tông môn nào được ghi chép.</div>`;
    return;
  }

  el.innerHTML = sects_list.slice(0, 30).map(sh => `
    <div class="story-sect-card" onclick="expandSectHistory('${encodeURIComponent(sh.name)}')">
      <div class="story-sect-header">
        <span class="story-sect-name">🏯 ${sh.name}</span>
        <span class="story-sect-meta">Lập năm ${sh.founded} · ⚔️ ${sh.wars} trận · 🏆 ${sh.victories} thắng</span>
        <button class="btn-secondary" style="margin-left:auto;font-size:10px;padding:3px 8px"
          onclick="event.stopPropagation();generateAISectHistory('${encodeURIComponent(sh.name)}')">🤖 AI Tông Sử</button>
      </div>
      <div id="sectExpand_${encodeURIComponent(sh.name)}" style="display:none;margin-top:8px">
        ${sh.events.slice(-8).reverse().map(ev => `<div class="story-bio-event">• ${ev.text}</div>`).join("")}
        <div id="aiSect_${encodeURIComponent(sh.name)}" style="margin-top:6px"></div>
      </div>
    </div>
  `).join("");
}

function expandSectHistory(encodedName) {
  const el = document.getElementById(`sectExpand_${encodedName}`);
  if (!el) return;
  el.style.display = el.style.display === "none" ? "block" : "none";
}

function generateAISectHistory(encodedName) {
  const name = decodeURIComponent(encodedName);
  const sh = storySectHistory[name];
  if (!sh) return;

  const lines = sh.events.slice(-12).map(e => `- ${e.text}`).join("\n");

  const prompt = `Bạn là sử quan trong thế giới tu tiên. Hãy viết tông sử của môn phái "${name}" theo phong cách truyện tiên hiệp, khoảng 120 chữ tiếng Việt. Được lập năm ${sh.founded}, đã trải qua ${sh.wars} trận chiến với ${sh.victories} chiến thắng.\n\nCác sự kiện:\n${lines}`;

  generateAISummary(prompt, `aiSect_${encodedName}`);
}

function renderStoryCountryOverview() {
  const el = document.getElementById("storyCountryList");
  if (!el) return;

  const countries_list = (typeof countries !== "undefined") ? countries : [];
  if (!countries_list.length) {
    el.innerHTML = `<div class="story-empty">🌐 Chưa có dữ liệu quốc gia.</div>`;
    return;
  }

  el.innerHTML = countries_list.map(c => {
    const history = storyCountryHistory[c.id] || storyCountryHistory[c.name] || { events: [] };
    return `
      <div class="story-sect-card" onclick="generateAICountryHistory('${c.id}','${encodeURIComponent(c.name)}')">
        <div class="story-sect-header">
          <span class="story-sect-name">🏴 ${c.name}</span>
          <span class="story-sect-meta">${c.territory} · Dân số: ${(c.population||0).toLocaleString()} · Kinh tế: ${(c.economy||0).toLocaleString()}</span>
          <button class="btn-secondary" style="margin-left:auto;font-size:10px;padding:3px 8px">🤖 AI Quốc Sử</button>
        </div>
        <div id="aiCountry_${c.id}" style="margin-top:6px"></div>
      </div>`;
  }).join("");
}

function generateAICountryHistory(countryId, encodedName) {
  const name = decodeURIComponent(encodedName);
  const c = (typeof countries !== "undefined") ? countries.find(x => x.id === countryId) : null;
  if (!c) return;

  const currentYear = (typeof year !== "undefined") ? year : 0;
  const relevantEvents = worldStory
    .filter(e => e.narrative.includes(name))
    .slice(-10)
    .map(e => `- ${e.text || e.narrative}`)
    .join("\n");

  const prompt = `Bạn là sử quan. Viết quốc sử của "${name}" trong thế giới tu tiên, khoảng 120 chữ tiếng Việt theo phong cách tiên hiệp. Năm hiện tại: ${currentYear}. Dân số: ${(c.population||0).toLocaleString()}. Kinh tế: ${(c.economy||0).toLocaleString()}. Quân sự: ${(c.military||0).toLocaleString()}. Vùng: ${c.territory}.\n${relevantEvents ? `\nSự kiện liên quan:\n${relevantEvents}` : ""}`;

  generateAISummary(prompt, `aiCountry_${countryId}`);
}

// ============================
// MANUAL CHAPTER CREATION
// ============================

function openManualChapterModal() {
  const currentYear = (typeof year !== "undefined") ? year : 0;
  const lastCh = storyChapters[storyChapters.length - 1];
  const fromY = lastCh ? lastCh.yearEnd + 1 : 1;

  const modal = document.getElementById("storyChapterModal");
  if (!modal) return;
  document.getElementById("scmYearStart").value = fromY;
  document.getElementById("scmYearEnd").value = currentYear;
  document.getElementById("scmTitle").value = "";
  document.getElementById("scmSummary").value = "";
  modal.style.display = "flex";
}

function closeChapterModal() {
  const modal = document.getElementById("storyChapterModal");
  if (modal) modal.style.display = "none";
}

function saveManualChapter() {
  const title   = document.getElementById("scmTitle").value.trim();
  const yearS   = parseInt(document.getElementById("scmYearStart").value) || 1;
  const yearE   = parseInt(document.getElementById("scmYearEnd").value) || 1;
  const summary = document.getElementById("scmSummary").value.trim();

  if (!title) { alert("Vui lòng nhập tiêu đề chương!"); return; }

  const periodEvents = worldStory.filter(e => e.year >= yearS && e.year <= yearE);

  storyChapters.push({
    id: storyChapters.length + 1,
    title,
    yearStart: yearS,
    yearEnd: yearE,
    summary: summary || generateChapterSummary(periodEvents),
    eventCount: periodEvents.length,
    eventIds: periodEvents.map(e => e.id),
    generatedAt: (typeof year !== "undefined") ? year : yearE,
    manual: true,
  });

  saveStory();
  closeChapterModal();
  renderStoryChapters();
  if (typeof toast === "function") toast("📖 Đã tạo chương mới!");
}

async function generateAIWorldSummary() {
  const currentYear = (typeof year !== "undefined") ? year : 0;
  const worldName = (typeof world !== "undefined" && world) ? world.name : "Thế Giới";

  const recentEvents = worldStory.slice(-30).map(e => `- ${e.narrative}`).join("\n");
  const totalWars = worldStory.filter(e => e.eventType === "war").length;
  const totalBreak = worldStory.filter(e => e.eventType === "breakthrough").length;
  const totalDeaths = worldStory.filter(e => e.eventType === "death").length;

  const prompt = `Bạn là một nhà văn tiên hiệp tài ba. Hãy viết tóm tắt toàn bộ biên niên sử của thế giới "${worldName}" đến năm ${currentYear} theo phong cách sử thi hùng tráng tiếng Việt, khoảng 200 chữ. Tổng cộng: ${worldStory.length} sự kiện, ${totalWars} trận chiến, ${totalBreak} lần đột phá, ${totalDeaths} tử vong.\n\nCác sự kiện gần đây:\n${recentEvents}`;

  generateAISummary(prompt, "storyWorldSummaryAI");
}

// ============================
// INIT — called from main app after load()
// ============================

function initStorySystem() {
  loadStory();
  syncWorldHistoryToStory();
  patchWorldHistoryForStory();
  console.log(`[Story System] Loaded ${worldStory.length} story events, ${storyChapters.length} chapters.`);
}
