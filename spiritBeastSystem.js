// ============================================================
//  LINH VẬT HỆ THỐNG v1.0 — Spirit Beast System
//  Tích hợp vào Creator God V6
// ============================================================

(function() {
"use strict";

// ────────────────────────────────────────────────────────────
//  CONSTANTS & CONFIG
// ────────────────────────────────────────────────────────────

const SB_VERSION = "1.0";
const SB_KEY     = "cgv6_spiritBeasts";
const SB_META_KEY= "cgv6_sbMeta";

const BEAST_TYPES = [
  { id:"long",      name:"Thanh Long",   icon:"🐉", element:"Thủy/Mộc", baseAtk:40, baseDef:30, baseSpd:20, rare:"legendary",
    desc:"Rồng Xanh — linh khí dồi dào, tăng mạnh tu luyện" },
  { id:"phuong",    name:"Hỏa Phụng",   icon:"🦅", element:"Hỏa",      baseAtk:50, baseDef:15, baseSpd:35, rare:"legendary",
    desc:"Phượng Hoàng — tái sinh từ lửa, ban sức mạnh thần hỏa" },
  { id:"kylan",     name:"Kỳ Lân",      icon:"🦄", element:"Quang",    baseAtk:25, baseDef:40, baseSpd:25, rare:"epic",
    desc:"Kỳ Lân — thuần khiết thiêng liêng, tăng phòng thủ" },
  { id:"hac_quy",   name:"Hắc Quy",     icon:"🐢", element:"Thổ",      baseAtk:10, baseDef:70, baseSpd:5,  rare:"epic",
    desc:"Huyền Vũ — mai rùa bất hoại, khiên phòng vô song" },
  { id:"bach_ho",   name:"Bạch Hổ",     icon:"🐅", element:"Kim",      baseAtk:60, baseDef:20, baseSpd:30, rare:"rare",
    desc:"Bạch Hổ — vuốt thép xé kim, sát thương bạo liệt" },
  { id:"cu_rua",    name:"Thần Ưng",    icon:"🦅", element:"Phong",    baseAtk:30, baseDef:15, baseSpd:55, rare:"rare",
    desc:"Thần Ưng — tốc độ vô song, phong tốc chi vương" },
  { id:"linh_thu",  name:"Linh Thú",    icon:"🦊", element:"Hỗn",      baseAtk:25, baseDef:25, baseSpd:25, rare:"common",
    desc:"Linh Thú thường — cân bằng, dễ thuần hóa" },
  { id:"co_long",   name:"Cổ Long",     icon:"🦎", element:"Âm",       baseAtk:35, baseDef:35, baseSpd:15, rare:"rare",
    desc:"Cổ Long — huyết mạch nguyên thủy, âm khí cực nặng" },
  { id:"ho_ly",     name:"Hồ Ly",       icon:"🦊", element:"Huyễn",    baseAtk:20, baseDef:10, baseSpd:40, rare:"uncommon",
    desc:"Hồ Ly — mê hoặc địch thủ, tăng cơ mưu trí tuệ" },
  { id:"nguyen_long",name:"Nguyên Long", icon:"🐲", element:"Hư",       baseAtk:80, baseDef:50, baseSpd:40, rare:"mythic",
    desc:"Nguyên Thủy Long — Thủy Tổ Linh Vật, quyền năng vô biên" },
  { id:"linh_lan",  name:"Lan Hoa Điểu",icon:"🦜", element:"Mộc",      baseAtk:15, baseDef:20, baseSpd:30, rare:"uncommon",
    desc:"Lan Hoa Điểu — hồi phục linh khí chủ nhân nhanh chóng" },
  { id:"thiet_hung",name:"Thiết Hùng",  icon:"🐻", element:"Thổ/Kim",  baseAtk:45, baseDef:45, baseSpd:10, rare:"rare",
    desc:"Thiết Hùng — dũng mãnh như núi, cân bằng công thủ" },
];

const BEAST_RANKS = [
  { id:"pham",     name:"Phàm Cấp",   icon:"⬜", multi:1.0,  color:"#9ca3af", xpNext:100  },
  { id:"linh",     name:"Linh Cấp",   icon:"🟢", multi:1.5,  color:"#4ade80", xpNext:300  },
  { id:"hao",      name:"Hào Cấp",    icon:"🔵", multi:2.2,  color:"#60a5fa", xpNext:800  },
  { id:"vuong",    name:"Vương Cấp",  icon:"🟣", multi:3.5,  color:"#c084fc", xpNext:2000 },
  { id:"hoang",    name:"Hoàng Cấp",  icon:"🟡", multi:5.5,  color:"#facc15", xpNext:5000 },
  { id:"than",     name:"Thần Cấp",   icon:"🔴", multi:9.0,  color:"#f87171", xpNext:12000},
  { id:"tien",     name:"Tiên Cấp",   icon:"🌟", multi:15.0, color:"#fb923c", xpNext:null },
];

const RARITY_COLOR = { common:"#9ca3af", uncommon:"#4ade80", rare:"#60a5fa", epic:"#c084fc", legendary:"#facc15", mythic:"#f87171" };
const RARITY_NAME  = { common:"Phổ Thông", uncommon:"Không Phổ", rare:"Hiếm", epic:"Sử Thi", legendary:"Huyền Thoại", mythic:"Thần Thoại" };

const SKILLS_POOL = [
  { id:"hoa_lon",    name:"Hóa Long Thuật",  icon:"🐉", desc:"Biến hình rồng, tăng 30% sát thương" },
  { id:"thien_lei",  name:"Thiên Lôi Kích",  icon:"⚡", desc:"Triệu lôi điện, sát thương diện rộng" },
  { id:"linh_khoi",  name:"Linh Khí Vô Vi",  icon:"✨", desc:"Tỏa linh khí, tăng tu tốc chủ nhân" },
  { id:"bao_linh",   name:"Bảo Linh Chi Khiên",icon:"🛡️",desc:"Thành lập khiên bảo hộ tự động" },
  { id:"tuyet_phong",name:"Tuyết Phong Trảo", icon:"❄️", desc:"Móng tuyết băng, làm chậm địch thủ" },
  { id:"hoa_luc",    name:"Hỏa Lực Chi Thân", icon:"🔥", desc:"Bao phủ ngọn lửa, đốt cháy kẻ địch" },
  { id:"am_dung",    name:"Âm Dung Ảo Thuật", icon:"🌑", desc:"Ẩn thân trong bóng tối" },
  { id:"phong_long", name:"Phong Long Sải Cánh",icon:"💨",desc:"Tốc độ di chuyển tăng vọt" },
  { id:"hoi_phuc",   name:"Linh Tuyền Hồi Khí",icon:"💧",desc:"Hồi phục sinh lực mỗi giây" },
  { id:"thien_nhan", name:"Thiên Nhãn Thông",  icon:"👁️", desc:"Nhìn thấu mọi ảo thuật địch" },
  { id:"dinh_tan",   name:"Định Thần Chú",     icon:"🌀", desc:"Miễn nhiễm mê hoặc và kiểm soát" },
  { id:"loan_khong", name:"Loạn Không Trảm",   icon:"⚔️", desc:"Chém qua không gian, xuyên phòng thủ" },
];

// ────────────────────────────────────────────────────────────
//  STATE
// ────────────────────────────────────────────────────────────

let sbState = {
  beasts: [],        // all spirit beasts in the world
  tameLog: [],       // recent taming events
  breedLog: [],      // recent breeding events
  wildSpawns: [],    // wild beasts available to tame
  lastWildRefresh: 0,
  totalTamed: 0,
  totalEvolved: 0,
  totalBred: 0,
};
let _sbIdCounter = 1;

// ────────────────────────────────────────────────────────────
//  HELPERS
// ────────────────────────────────────────────────────────────

function sbId() { return "sb_" + (_sbIdCounter++); }

function getRankIdx(rankId) { return BEAST_RANKS.findIndex(r => r.id === rankId); }
function getRank(rankId) { return BEAST_RANKS.find(r => r.id === rankId) || BEAST_RANKS[0]; }
function getType(typeId) { return BEAST_TYPES.find(t => t.id === typeId) || BEAST_TYPES[6]; }

function calcStats(beast) {
  const type  = getType(beast.typeId);
  const rank  = getRank(beast.rankId);
  const lvlM  = 1 + (beast.level - 1) * 0.05;
  const bond  = 1 + beast.bond * 0.003;
  return {
    atk: Math.round(type.baseAtk * rank.multi * lvlM * bond),
    def: Math.round(type.baseDef * rank.multi * lvlM * bond),
    spd: Math.round(type.baseSpd * rank.multi * lvlM * bond),
  };
}

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function rollRarity() {
  const r = Math.random();
  if (r < 0.01)  return "mythic";
  if (r < 0.05)  return "legendary";
  if (r < 0.12)  return "epic";
  if (r < 0.28)  return "rare";
  if (r < 0.55)  return "uncommon";
  return "common";
}

function pickSkills(count = 2) {
  const pool = [...SKILLS_POOL];
  const out = [];
  for (let i = 0; i < count; i++) {
    if (!pool.length) break;
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0].id);
  }
  return out;
}

function npcNameStr(npc) {
  if (!npc) return "Không Rõ";
  return npc.name || ("NPC#" + npc.id);
}

function logEvent(msg, type = "tame") {
  const entry = { year: window.year || 0, msg, type };
  if (type === "breed") sbState.breedLog.unshift(entry);
  else sbState.tameLog.unshift(entry);
  if (sbState.tameLog.length  > 60) sbState.tameLog.pop();
  if (sbState.breedLog.length > 60) sbState.breedLog.pop();
}

// ────────────────────────────────────────────────────────────
//  CORE FUNCTIONS
// ────────────────────────────────────────────────────────────

function createBeast(typeId, ownerId = null, options = {}) {
  const type = getType(typeId);
  const beast = {
    id:       sbId(),
    typeId,
    name:     options.name || type.name,
    icon:     type.icon,
    rankId:   options.rankId   || "pham",
    level:    options.level    || 1,
    xp:       0,
    bond:     options.bond     || 0,
    ownerId:  ownerId,
    skills:   options.skills   || pickSkills(Math.random() < 0.3 ? 2 : 1),
    age:      0,
    wild:     options.wild     || false,
    bornYear: window.year      || 0,
    parents:  options.parents  || [],
    rare:     options.rare     || type.rare,
    evolved:  false,
    dead:     false,
    deathYear: null,
    kills:    0,
    wins:     0,
  };
  return beast;
}

function tameBeast(npc, beast) {
  beast.ownerId = npc.id;
  beast.wild    = false;
  sbState.totalTamed++;
  const typeName = getType(beast.typeId).name;
  logEvent(`${npcNameStr(npc)} thuần hóa ${beast.icon}${typeName} (${RARITY_NAME[beast.rare]})`, "tame");
  sbPushHistory(`Năm ${window.year||0}: ${npcNameStr(npc)} thuần hóa ${beast.icon} ${beast.name}`);
}

function breedBeasts(beastA, beastB) {
  const typeA  = getType(beastA.typeId);
  const typeB  = getType(beastB.typeId);
  const childTypeId = Math.random() < 0.6 ? beastA.typeId : beastB.typeId;
  const childType   = getType(childTypeId);

  const rankIdxA = getRankIdx(beastA.rankId);
  const rankIdxB = getRankIdx(beastB.rankId);
  const baseRankIdx = Math.max(0, Math.min(rankIdxA, rankIdxB) + (Math.random() < 0.25 ? 1 : 0));
  const childRankId = BEAST_RANKS[Math.min(baseRankIdx, BEAST_RANKS.length - 2)].id;

  const childRare = Math.random() < 0.15 ? "legendary" :
                    Math.random() < 0.30 ? "epic"      : childType.rare;

  const inheritSkills = [
    ...(Math.random() < 0.7 ? [pickRandom(beastA.skills)] : []),
    ...(Math.random() < 0.7 ? [pickRandom(beastB.skills)] : []),
    ...(Math.random() < 0.25 ? [pickRandom(SKILLS_POOL).id] : []),
  ].filter(Boolean);
  const uniqueSkills = [...new Set(inheritSkills)].slice(0, 3);

  const child = createBeast(childTypeId, beastA.ownerId, {
    rankId: childRankId,
    rare:   childRare,
    skills: uniqueSkills.length ? uniqueSkills : pickSkills(1),
    parents: [beastA.id, beastB.id],
  });

  sbState.beasts.push(child);
  sbState.totalBred++;
  logEvent(`${beastA.icon}${beastA.name} × ${beastB.icon}${beastB.name} → ${child.icon}${child.name} (${RARITY_NAME[child.rare]})`, "breed");
  sbPushHistory(`Năm ${window.year||0}: Giao phối tạo ra ${child.icon} ${child.name}`);
  return child;
}

function evolveBeast(beast) {
  const rankIdx = getRankIdx(beast.rankId);
  if (rankIdx >= BEAST_RANKS.length - 1) return false;
  beast.rankId = BEAST_RANKS[rankIdx + 1].id;
  beast.xp = 0;
  beast.evolved = true;
  if (Math.random() < 0.4) {
    const newSkill = pickRandom(SKILLS_POOL.filter(s => !beast.skills.includes(s.id)));
    if (newSkill) beast.skills.push(newSkill.id);
  }
  sbState.totalEvolved++;
  const ownerNpc = (window.npcs || []).find(n => n.id === beast.ownerId);
  logEvent(`${beast.icon}${beast.name} tiến hóa lên ${getRank(beast.rankId).name}! Chủ: ${npcNameStr(ownerNpc)}`, "evolve");
  sbPushHistory(`Năm ${window.year||0}: ${beast.icon}${beast.name} đột phá → ${getRank(beast.rankId).name}`);
  return true;
}

function spawnWildBeasts() {
  sbState.wildSpawns = [];
  const count = 3 + Math.floor(Math.random() * 5);
  for (let i = 0; i < count; i++) {
    const typeId = pickRandom(BEAST_TYPES).id;
    const rare   = rollRarity();
    const beast  = createBeast(typeId, null, { wild: true, rare });
    sbState.wildSpawns.push(beast);
  }
  sbState.lastWildRefresh = window.year || 0;
}

function sbPushHistory(msg) {
  if (!window.worldHistory) window.worldHistory = [];
  window.worldHistory.unshift({ year: window.year||0, event: msg, type:"spirit_beast" });
  if (window.worldHistory.length > 500) window.worldHistory.pop();
}

// ────────────────────────────────────────────────────────────
//  BUFF APPLICATION (to NPC stats each tick)
// ────────────────────────────────────────────────────────────

function applyBeastBuffsToNpc(npc) {
  const beasts = sbState.beasts.filter(b => b.ownerId === npc.id && !b.dead);
  if (!beasts.length) return;
  let atkBonus = 0, defBonus = 0;
  for (const b of beasts) {
    const st = calcStats(b);
    atkBonus += st.atk;
    defBonus += st.def;
    // Special skill buffs
    if (b.skills.includes("linh_khoi")) {
      npc.cultivation = (npc.cultivation || 0) + 1;
    }
  }
  npc._sbAtkBonus = atkBonus;
  npc._sbDefBonus = defBonus;
}

// ────────────────────────────────────────────────────────────
//  YEARLY TICK
// ────────────────────────────────────────────────────────────

function spiritBeastTick() {
  if (!window.world) return;

  const npcs = window.npcs || [];
  const yr   = window.year || 0;

  // Refresh wild beasts every 10 years
  if (yr - sbState.lastWildRefresh >= 10 || sbState.wildSpawns.length === 0) {
    spawnWildBeasts();
  }

  // --- NPC interactions ---
  for (const npc of npcs) {
    if (npc.dead || npc.hp <= 0) continue;
    const myBeasts = sbState.beasts.filter(b => b.ownerId === npc.id && !b.dead);

    // Chance to tame a wild beast if NPC has none or is powerful
    if (myBeasts.length === 0 && sbState.wildSpawns.length > 0 && Math.random() < 0.04) {
      const wildBeast = sbState.wildSpawns.splice(0, 1)[0];
      sbState.beasts.push(wildBeast);
      tameBeast(npc, wildBeast);
    }

    // Powerful NPCs can tame more beasts
    if (myBeasts.length < 2 && sbState.wildSpawns.length > 0 &&
        (npc.realm || 0) >= 5 && Math.random() < 0.02) {
      const wildBeast = sbState.wildSpawns.splice(0, 1)[0];
      sbState.beasts.push(wildBeast);
      tameBeast(npc, wildBeast);
    }

    // Apply buffs
    applyBeastBuffsToNpc(npc);

    // Beast aging & XP gain
    for (const beast of myBeasts) {
      beast.age++;
      beast.bond = Math.min(100, beast.bond + (Math.random() < 0.5 ? 1 : 0));
      beast.level = Math.min(100, beast.level + (Math.random() < 0.3 ? 1 : 0));

      const rank = getRank(beast.rankId);
      if (rank.xpNext) {
        beast.xp += Math.floor(10 + Math.random() * 20 + (npc.realm || 0) * 2);
        if (beast.xp >= rank.xpNext) {
          evolveBeast(beast);
        }
      }

      // Rare chance: beast dies of old age
      if (beast.age > 200 + Math.random() * 300 && Math.random() < 0.01) {
        beast.dead = true;
        beast.deathYear = yr;
        logEvent(`${beast.icon}${beast.name} của ${npcNameStr(npc)} đã qua đời (tuổi ${beast.age})`, "death");
      }
    }
  }

  // --- Wild beasts: spontaneous breeding in wild ---
  if (sbState.wildSpawns.length >= 2 && Math.random() < 0.15) {
    const a = pickRandom(sbState.wildSpawns);
    const b = pickRandom(sbState.wildSpawns.filter(x => x.id !== a.id));
    if (a && b) {
      const child = breedBeasts(a, b);
      child.ownerId = null;
      child.wild = true;
      sbState.wildSpawns.push(child);
      // Remove from main beasts (it's wild)
      sbState.beasts = sbState.beasts.filter(bx => bx.id !== child.id);
      sbState.wildSpawns = sbState.wildSpawns.slice(-8);
    }
  }

  // --- NPC pair breeding ---
  if (Math.random() < 0.05) {
    const npcWithBeast = npcs.filter(n => !n.dead && sbState.beasts.some(b => b.ownerId === n.id && !b.dead));
    if (npcWithBeast.length >= 2) {
      const n1 = pickRandom(npcWithBeast);
      const n2 = pickRandom(npcWithBeast.filter(n => n.id !== n1.id));
      if (n1 && n2) {
        const b1 = sbState.beasts.find(b => b.ownerId === n1.id && !b.dead);
        const b2 = sbState.beasts.find(b => b.ownerId === n2.id && !b.dead);
        if (b1 && b2 && b1.id !== b2.id) {
          breedBeasts(b1, b2);
        }
      }
    }
  }

  // Cleanup: cap total beasts at 500
  if (sbState.beasts.filter(b => !b.dead).length > 500) {
    const weak = sbState.beasts
      .filter(b => !b.dead && getRankIdx(b.rankId) === 0)
      .slice(0, 20);
    for (const w of weak) w.dead = true;
  }

  // Render badge
  _updateSbBadge();
}

function _updateSbBadge() {
  const btn = document.getElementById("btn-spirit-beast");
  if (!btn) return;
  const alive = sbState.beasts.filter(b => !b.dead).length;
  let badge = btn.querySelector(".sb-badge");
  if (!badge) {
    badge = document.createElement("span");
    badge.className = "sb-badge";
    badge.style.cssText = "margin-left:auto;background:rgba(250,204,21,0.18);border-radius:999px;padding:1px 7px;font-size:10px;color:var(--gold);font-weight:700;";
    btn.appendChild(badge);
  }
  badge.textContent = alive;
}

// ────────────────────────────────────────────────────────────
//  SAVE / LOAD
// ────────────────────────────────────────────────────────────

function spiritBeastSystem_save() {
  try {
    localStorage.setItem(SB_KEY, JSON.stringify({
      beasts:   sbState.beasts.slice(0, 500),
      tameLog:  sbState.tameLog.slice(0, 60),
      breedLog: sbState.breedLog.slice(0, 60),
      wildSpawns: sbState.wildSpawns.slice(0, 12),
      lastWildRefresh: sbState.lastWildRefresh,
      totalTamed:  sbState.totalTamed,
      totalEvolved:sbState.totalEvolved,
      totalBred:   sbState.totalBred,
    }));
    localStorage.setItem(SB_META_KEY, JSON.stringify({ idCounter: _sbIdCounter }));
  } catch(e) { console.warn("[SpiritBeast] save failed:", e); }
}

function spiritBeastSystem_load() {
  try {
    const raw = localStorage.getItem(SB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.assign(sbState, parsed);
    }
    const meta = localStorage.getItem(SB_META_KEY);
    if (meta) {
      const m = JSON.parse(meta);
      _sbIdCounter = m.idCounter || 1;
    }
  } catch(e) { console.warn("[SpiritBeast] load failed:", e); }
}

// ────────────────────────────────────────────────────────────
//  UI — PANEL RENDER
// ────────────────────────────────────────────────────────────

function renderSpiritBeastPanel() {
  const el = document.getElementById("panel-spirit-beast");
  if (!el) return;

  const alive  = sbState.beasts.filter(b => !b.dead);
  const dead   = sbState.beasts.filter(b =>  b.dead);
  const wild   = sbState.wildSpawns;
  const npcs   = window.npcs || [];

  // Sort: by rank desc then level desc
  const sorted = [...alive].sort((a, b) => {
    const rd = getRankIdx(b.rankId) - getRankIdx(a.rankId);
    return rd !== 0 ? rd : b.level - a.level;
  });

  const filterType = el._filterType || "all";
  const filterRank = el._filterRank || "all";
  const searchQ    = (el._searchQ || "").toLowerCase();

  const filtered = sorted.filter(b => {
    if (filterType !== "all" && b.typeId !== filterType) return false;
    if (filterRank !== "all" && b.rankId !== filterRank) return false;
    if (searchQ && !b.name.toLowerCase().includes(searchQ) &&
        !(getType(b.typeId).element || "").toLowerCase().includes(searchQ)) return false;
    return true;
  });

  const mythicCount    = alive.filter(b => b.rare === "mythic").length;
  const legendaryCount = alive.filter(b => b.rare === "legendary").length;
  const epicCount      = alive.filter(b => b.rare === "epic").length;
  const tianCount      = alive.filter(b => b.rankId === "tien").length;

  el.innerHTML = `
<div style="padding:0 0 16px 0;">
  <!-- HEADER -->
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap;">
    <div style="font-family:var(--font-heading);font-size:20px;color:var(--gold);text-shadow:0 0 16px rgba(250,204,21,0.5);">
      🐉 Hệ Thống Linh Vật
    </div>
    <div style="font-size:11px;color:var(--white-dim);border-left:1px solid var(--border);padding-left:12px;">
      v${SB_VERSION} · Năm ${window.year||0}
    </div>
    <button onclick="sbGodSummon()" style="margin-left:auto;padding:6px 14px;background:linear-gradient(135deg,rgba(250,204,21,0.18),rgba(250,204,21,0.06));border:1px solid rgba(250,204,21,0.4);border-radius:7px;color:var(--gold);font-size:12px;cursor:pointer;font-family:var(--font-cjk),serif;">
      ⚡ Thần Triệu (500đ)
    </button>
    <button onclick="sbRefreshWild()" style="padding:6px 14px;background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.3);border-radius:7px;color:var(--jade);font-size:12px;cursor:pointer;font-family:var(--font-cjk),serif;">
      🌿 Làm Mới Hoang Dã
    </button>
  </div>

  <!-- STATS ROW -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px;">
    ${_sbStatCard("🐉","Tổng Linh Vật",alive.length,"var(--blue)")}
    ${_sbStatCard("🌟","Tiên Cấp",tianCount,"var(--gold)")}
    ${_sbStatCard("💫","Huyền Thoại",legendaryCount+mythicCount,"#f87171")}
    ${_sbStatCard("🔮","Đã Tiến Hóa",sbState.totalEvolved,"var(--purple)")}
  </div>

  <!-- SEARCH + FILTER -->
  <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
    <input id="sb-search" type="text" placeholder="Tìm linh vật..." value="${el._searchQ||''}"
      oninput="sbSetSearch(this.value)"
      style="flex:1;min-width:140px;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:7px;color:var(--white-main);font-family:var(--font-cjk),serif;font-size:12px;padding:7px 12px;outline:none;">
    <select onchange="sbSetFilter('type',this.value)"
      style="background:#13171f;border:1px solid var(--border);border-radius:7px;color:var(--white-main);font-size:12px;padding:7px 10px;cursor:pointer;">
      <option value="all" ${filterType==='all'?'selected':''}>Tất cả loài</option>
      ${BEAST_TYPES.map(t=>`<option value="${t.id}" ${filterType===t.id?'selected':''}>${t.icon}${t.name}</option>`).join('')}
    </select>
    <select onchange="sbSetFilter('rank',this.value)"
      style="background:#13171f;border:1px solid var(--border);border-radius:7px;color:var(--white-main);font-size:12px;padding:7px 10px;cursor:pointer;">
      <option value="all" ${filterRank==='all'?'selected':''}>Tất cả cấp</option>
      ${BEAST_RANKS.map(r=>`<option value="${r.id}" ${filterRank===r.id?'selected':''}>${r.icon}${r.name}</option>`).join('')}
    </select>
  </div>

  <!-- TABS -->
  <div style="display:flex;gap:4px;margin-bottom:14px;border-bottom:1px solid var(--border);padding-bottom:10px;">
    ${_sbTab("Linh Vật ("+filtered.length+")", "beasts", el._tab)}
    ${_sbTab("Hoang Dã ("+wild.length+")",     "wild",   el._tab)}
    ${_sbTab("Nhật Ký",                         "log",    el._tab)}
    ${_sbTab("Giao Phối",                        "breed",  el._tab)}
  </div>

  <!-- TAB CONTENT -->
  ${(el._tab||"beasts") === "beasts" ? _sbTabBeasts(filtered, npcs) : ""}
  ${(el._tab||"beasts") === "wild"   ? _sbTabWild(wild)              : ""}
  ${(el._tab||"beasts") === "log"    ? _sbTabLog()                   : ""}
  ${(el._tab||"beasts") === "breed"  ? _sbTabBreed(alive, npcs)      : ""}
</div>`;
}

function _sbStatCard(icon, label, val, color) {
  return `<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:12px 14px;text-align:center;">
    <div style="font-size:20px;margin-bottom:4px;">${icon}</div>
    <div style="font-size:22px;font-weight:700;color:${color};font-family:var(--font-heading);">${val}</div>
    <div style="font-size:10px;color:var(--white-dim);margin-top:2px;">${label}</div>
  </div>`;
}

function _sbTab(label, id, active) {
  const isActive = (active || "beasts") === id;
  return `<button onclick="sbSetTab('${id}')"
    style="padding:6px 14px;border-radius:7px 7px 0 0;border:1px solid ${isActive?'var(--gold)':'transparent'};
    background:${isActive?'linear-gradient(135deg,rgba(250,204,21,0.12),rgba(250,204,21,0.04))':'transparent'};
    color:${isActive?'var(--gold)':'var(--white-dim)'};font-size:12px;cursor:pointer;font-family:var(--font-cjk),serif;">
    ${label}
  </button>`;
}

function _sbTabBeasts(beasts, npcs) {
  if (!beasts.length) return `<div style="text-align:center;padding:40px;color:var(--white-dim);font-style:italic;">Chưa có linh vật nào.</div>`;
  return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;">
    ${beasts.slice(0, 60).map(b => _sbBeastCard(b, npcs)).join("")}
  </div>`;
}

function _sbBeastCard(beast, npcs) {
  const type  = getType(beast.typeId);
  const rank  = getRank(beast.rankId);
  const stats = calcStats(beast);
  const owner = npcs.find(n => n.id === beast.ownerId);
  const rc    = RARITY_COLOR[beast.rare] || "#9ca3af";
  const rn    = RARITY_NAME[beast.rare]  || "Thường";
  const skillNames = beast.skills.map(sid => {
    const sk = SKILLS_POOL.find(s => s.id === sid);
    return sk ? `${sk.icon}${sk.name}` : sid;
  });

  const rankIdx = getRankIdx(beast.rankId);
  const rankDef = BEAST_RANKS[rankIdx];
  const xpPct = rankDef.xpNext ? Math.min(100, Math.round(beast.xp / rankDef.xpNext * 100)) : 100;

  return `<div style="background:var(--bg-card);border:1px solid ${rc}33;border-radius:11px;padding:13px;position:relative;overflow:hidden;">
    <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,${rc},transparent);"></div>
    <div style="display:flex;align-items:flex-start;gap:10px;">
      <div style="font-size:34px;line-height:1;filter:drop-shadow(0 0 8px ${rc}80);">${beast.icon}</div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <span style="font-family:var(--font-title);font-size:14px;color:var(--white-main);font-weight:600;">${beast.name}</span>
          <span style="font-size:10px;padding:1px 7px;border-radius:999px;background:${rc}22;color:${rc};border:1px solid ${rc}44;">${rn}</span>
          <span style="font-size:11px;color:${rank.color};">${rank.icon}${rank.name}</span>
        </div>
        <div style="font-size:11px;color:var(--white-dim);margin-top:3px;">
          ${type.element} · Lv.${beast.level} · Gắn kết: ${beast.bond}%
        </div>
        <div style="font-size:11px;color:var(--blue);margin-top:2px;">
          Chủ: ${owner ? npcNameStr(owner) : "<span style='color:var(--white-dim);font-style:italic;'>Hoang Dã</span>"}
        </div>
      </div>
    </div>

    <!-- XP bar -->
    ${rankDef.xpNext ? `<div style="margin:9px 0 4px;">
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--white-dim);margin-bottom:3px;">
        <span>Kinh Nghiệm</span><span>${beast.xp}/${rankDef.xpNext}</span>
      </div>
      <div style="height:4px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden;">
        <div style="height:100%;width:${xpPct}%;background:linear-gradient(90deg,${rank.color},${rank.color}88);border-radius:2px;transition:width 0.4s;"></div>
      </div>
    </div>` : `<div style="margin:9px 0 4px;font-size:11px;color:var(--gold);font-style:italic;">⭐ Tiến Hóa Tối Thượng</div>`}

    <!-- Stats -->
    <div style="display:flex;gap:8px;margin:8px 0 6px;font-size:11px;">
      <span style="color:var(--red);">⚔️${stats.atk}</span>
      <span style="color:var(--blue);">🛡️${stats.def}</span>
      <span style="color:var(--jade);">💨${stats.spd}</span>
      <span style="color:var(--white-dim);margin-left:auto;">Tuổi ${beast.age}</span>
    </div>

    <!-- Skills -->
    <div style="display:flex;gap:4px;flex-wrap:wrap;">
      ${skillNames.map(s => `<span style="font-size:10px;padding:2px 7px;background:rgba(192,132,252,0.1);border:1px solid rgba(192,132,252,0.25);border-radius:999px;color:var(--purple);">${s}</span>`).join("")}
    </div>
  </div>`;
}

function _sbTabWild(wild) {
  if (!wild.length) return `<div style="text-align:center;padding:40px;color:var(--white-dim);font-style:italic;">
    Không có linh vật hoang dã. Nhấn "Làm Mới Hoang Dã" để tạo mới.
  </div>`;
  const npcs = window.npcs || [];
  return `<div style="margin-bottom:10px;font-size:12px;color:var(--white-dim);">
    Linh vật hoang dã chờ được thuần hóa. NPC sẽ tự động thuần hóa theo thời gian, hoặc bạn có thể chỉ định:
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;">
  ${wild.map(b => {
    const type = getType(b.typeId);
    const rank = getRank(b.rankId);
    const rc   = RARITY_COLOR[b.rare] || "#9ca3af";
    const st   = calcStats(b);
    return `<div style="background:var(--bg-card);border:1px solid ${rc}44;border-radius:10px;padding:12px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <span style="font-size:28px;">${b.icon}</span>
        <div>
          <div style="font-family:var(--font-title);font-size:13px;color:var(--white-main);">${b.name}</div>
          <div style="font-size:10px;color:${rc};">${RARITY_NAME[b.rare]} · ${rank.icon}${rank.name}</div>
          <div style="font-size:10px;color:var(--white-dim);">${type.element}</div>
        </div>
      </div>
      <div style="font-size:11px;color:var(--white-dim);margin-bottom:8px;">⚔️${st.atk} 🛡️${st.def} 💨${st.spd}</div>
      <select id="tame-select-${b.id}" style="width:100%;background:#13171f;border:1px solid var(--border);border-radius:6px;color:var(--white-main);font-size:11px;padding:5px 8px;margin-bottom:6px;cursor:pointer;">
        <option value="">— Chọn NPC thuần hóa —</option>
        ${npcs.filter(n=>!n.dead).slice(0,50).map(n=>`<option value="${n.id}">${npcNameStr(n)} (Realm ${n.realm||0})</option>`).join("")}
      </select>
      <button onclick="sbTameWild('${b.id}')" style="width:100%;padding:6px;background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.3);border-radius:6px;color:var(--jade);font-size:11px;cursor:pointer;font-family:var(--font-cjk),serif;">
        🌿 Thuần Hóa
      </button>
    </div>`;
  }).join("")}
  </div>`;
}

function _sbTabLog() {
  const all = [
    ...sbState.tameLog.map(e => ({ ...e, color: e.type === "death" ? "var(--red)" : e.type === "evolve" ? "var(--gold)" : "var(--jade)" })),
  ].sort((a,b) => (b.year||0) - (a.year||0));
  if (!all.length) return `<div style="text-align:center;padding:40px;color:var(--white-dim);font-style:italic;">Chưa có sự kiện nào.</div>`;
  return `<div style="display:flex;flex-direction:column;gap:5px;">
  ${all.slice(0,50).map(e => `<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:9px 13px;display:flex;gap:10px;align-items:flex-start;">
    <span style="font-size:11px;color:var(--gold-dim);white-space:nowrap;min-width:55px;">Năm ${e.year}</span>
    <span style="font-size:12px;color:${e.color||'var(--white-main)'};">${e.msg}</span>
  </div>`).join("")}
  </div>`;
}

function _sbTabBreed(alive, npcs) {
  const eligible = alive.filter(b => !b.wild);
  const html = sbState.breedLog.length ? `
    <div style="margin-top:18px;">
      <div style="font-family:var(--font-title);font-size:12px;color:var(--gold);margin-bottom:8px;letter-spacing:1px;">LỊCH SỬ GIAO PHỐI</div>
      <div style="display:flex;flex-direction:column;gap:5px;">
        ${sbState.breedLog.slice(0,20).map(e=>`
          <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:9px 13px;display:flex;gap:10px;">
            <span style="font-size:11px;color:var(--gold-dim);min-width:55px;">Năm ${e.year}</span>
            <span style="font-size:12px;color:var(--purple);">${e.msg}</span>
          </div>`).join("")}
      </div>
    </div>` : "";

  if (eligible.length < 2) return `<div style="text-align:center;padding:30px;color:var(--white-dim);">
    Cần ít nhất 2 linh vật đã thuần hóa để tiến hành giao phối.
  </div>${html}`;

  return `<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px;max-width:480px;">
    <div style="font-family:var(--font-title);font-size:13px;color:var(--gold);margin-bottom:12px;">⚗️ Giao Phối Linh Vật</div>
    <div style="display:flex;flex-direction:column;gap:8px;">
      <div>
        <div style="font-size:11px;color:var(--white-dim);margin-bottom:4px;">Linh Vật A</div>
        <select id="breed-a" style="width:100%;background:#13171f;border:1px solid var(--border);border-radius:7px;color:var(--white-main);font-size:12px;padding:7px 10px;cursor:pointer;">
          ${eligible.map(b=>`<option value="${b.id}">${b.icon}${b.name} [${getRank(b.rankId).name}·Lv${b.level}]</option>`).join("")}
        </select>
      </div>
      <div>
        <div style="font-size:11px;color:var(--white-dim);margin-bottom:4px;">Linh Vật B</div>
        <select id="breed-b" style="width:100%;background:#13171f;border:1px solid var(--border);border-radius:7px;color:var(--white-main);font-size:12px;padding:7px 10px;cursor:pointer;">
          ${eligible.map(b=>`<option value="${b.id}">${b.icon}${b.name} [${getRank(b.rankId).name}·Lv${b.level}]</option>`).join("")}
        </select>
      </div>
      <button onclick="sbDoBreed()" style="margin-top:4px;padding:9px;background:linear-gradient(135deg,rgba(192,132,252,0.18),rgba(192,132,252,0.06));border:1px solid rgba(192,132,252,0.4);border-radius:7px;color:var(--purple);font-size:13px;cursor:pointer;font-family:var(--font-cjk),serif;font-weight:600;">
        💜 Tiến Hành Giao Phối
      </button>
    </div>
    <div style="font-size:10px;color:var(--white-dim);margin-top:10px;font-style:italic;">
      Kết quả con giống được thừa hưởng cấp độ, kỹ năng và có thể đột biến hiếm hơn.
    </div>
  </div>${html}`;
}

// ────────────────────────────────────────────────────────────
//  GLOBAL ACTIONS (called from HTML)
// ────────────────────────────────────────────────────────────

window.sbSetTab = function(tab) {
  const el = document.getElementById("panel-spirit-beast");
  if (el) { el._tab = tab; renderSpiritBeastPanel(); }
};

window.sbSetFilter = function(key, val) {
  const el = document.getElementById("panel-spirit-beast");
  if (!el) return;
  if (key === "type") el._filterType = val;
  if (key === "rank") el._filterRank = val;
  renderSpiritBeastPanel();
};

window.sbSetSearch = function(q) {
  const el = document.getElementById("panel-spirit-beast");
  if (el) { el._searchQ = q; renderSpiritBeastPanel(); }
};

window.sbRefreshWild = function() {
  spawnWildBeasts();
  renderSpiritBeastPanel();
};

window.sbTameWild = function(beastId) {
  const beastIdx = sbState.wildSpawns.findIndex(b => b.id === beastId);
  if (beastIdx === -1) return;
  const sel = document.getElementById("tame-select-" + beastId);
  const npcId = sel ? sel.value : "";
  const npc   = npcId ? (window.npcs||[]).find(n => n.id == npcId) : null;
  if (!npc) { alert("Vui lòng chọn NPC!"); return; }
  const beast = sbState.wildSpawns.splice(beastIdx, 1)[0];
  sbState.beasts.push(beast);
  tameBeast(npc, beast);
  renderSpiritBeastPanel();
};

window.sbDoBreed = function() {
  const selA = document.getElementById("breed-a");
  const selB = document.getElementById("breed-b");
  if (!selA || !selB) return;
  const bA = sbState.beasts.find(b => b.id === selA.value);
  const bB = sbState.beasts.find(b => b.id === selB.value);
  if (!bA || !bB) { alert("Không tìm thấy linh vật!"); return; }
  if (bA.id === bB.id) { alert("Cần chọn 2 linh vật KHÁC NHAU!"); return; }
  breedBeasts(bA, bB);
  renderSpiritBeastPanel();
};

window.sbGodSummon = function() {
  if ((window.heavenPoints || 0) < 500) {
    alert("Không đủ Thiên Đạo Điểm! Cần 500đ.");
    return;
  }
  window.heavenPoints -= 500;
  const typeId = pickRandom(BEAST_TYPES.filter(t => t.rare === "legendary" || t.rare === "mythic")).id;
  const rankId = Math.random() < 0.3 ? "hoang" : "vuong";
  const beast  = createBeast(typeId, null, { rankId, rare: "legendary", wild: true, skills: pickSkills(3) });
  sbState.wildSpawns.push(beast);
  sbPushHistory(`Năm ${window.year||0}: Thần Triệu giáng thế — ${beast.icon}${beast.name} xuất hiện!`);
  if (typeof window.updateUI === "function") window.updateUI();
  renderSpiritBeastPanel();
  alert(`⚡ Thần Triệu thành công!\n${beast.icon} ${beast.name} (Huyền Thoại) xuất hiện trong vùng hoang dã!`);
};

// ────────────────────────────────────────────────────────────
//  PATCH simulateWorld
// ────────────────────────────────────────────────────────────

function _patchSim() {
  if (window._sbSimPatched) return;
  if (typeof window.simulateWorld !== "function") return;
  window._sbSimPatched = true;
  const orig = window.simulateWorld;
  window.simulateWorld = function() {
    orig.apply(this, arguments);
    try { spiritBeastTick(); } catch(e) { console.warn("[SpiritBeast] tick error:", e); }
    try { spiritBeastSystem_save(); } catch(e) {}
  };
  // Copy flags from original
  if (orig._questPatched)  window.simulateWorld._questPatched  = true;
  if (orig._eqPatched)     window.simulateWorld._eqPatched     = true;
  if (orig._hle_patched)   window.simulateWorld._hle_patched   = true;
  console.log("[SpiritBeast] simulateWorld patched ✓");
}

// ────────────────────────────────────────────────────────────
//  EXPOSE GLOBALS
// ────────────────────────────────────────────────────────────

window.spiritBeastSystem_save    = spiritBeastSystem_save;
window.spiritBeastSystem_load    = spiritBeastSystem_load;
window.renderSpiritBeastPanel    = renderSpiritBeastPanel;
window.spiritBeastTick           = spiritBeastTick;
window.sbState                   = sbState;

// ────────────────────────────────────────────────────────────
//  INIT
// ────────────────────────────────────────────────────────────

function sbInit() {
  spiritBeastSystem_load();
  if (sbState.wildSpawns.length === 0) spawnWildBeasts();

  // Try to patch immediately, retry if not ready
  function tryPatch(attempts) {
    if (typeof window.simulateWorld === "function") {
      _patchSim();
    } else if (attempts > 0) {
      setTimeout(() => tryPatch(attempts - 1), 500);
    }
  }
  setTimeout(() => tryPatch(20), 800);

  console.log("[SpiritBeast] Hệ thống Linh Vật v" + SB_VERSION + " khởi động ✓");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", sbInit);
} else {
  sbInit();
}

})();
