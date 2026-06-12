// ============================================================
// HEREDITARY BLOODLINE ENGINE — HUYẾT MẠCH DI TRUYỀN V1
// Hệ thống di truyền gen, hôn nhân gia tộc, đột biến giác thức
// Tương thích 100% với bloodlineEngine.js V23
// ============================================================

const HBE_SAVE_KEY = "cgv6_hereditary_bloodline";
const HBE_VERSION  = 1;

// ── GEN LÝ THUYẾT ──────────────────────────────────────────
// Mỗi cá thể có 8 locus gen, mỗi locus có 2 alen (A/a hoặc 0)
// Dominant (A_) = biểu hiện với 1 bản copy
// Recessive (aa) = cần 2 bản copy mới biểu hiện
// 0 = không mang gen này

const HBE_GENE_LOCI = {
  DRAGON_VEIN: {
    id: "DRAGON_VEIN",
    name: "Long Mạch Huyết Thống",
    icon: "🐉",
    type: "dominant",
    rarity: "legendary",
    color: "#f97316",
    desc: "Huyết thống Long Tộc cổ xưa. Thân thể cường đại, tu luyện siêu phàm.",
    bonus: { military: 25, cultivation: 20, lifespan: 500 },
    awakeningName: "Long Hoàng Thức Giác",
  },
  PHOENIX_SOUL: {
    id: "PHOENIX_SOUL",
    name: "Phượng Hoàng Thiên Mệnh",
    icon: "🔥",
    type: "dominant",
    rarity: "legendary",
    color: "#ec4899",
    desc: "Linh hồn Phượng Hoàng bất tử. Có thể tái sinh từ tro tàn.",
    bonus: { cultivation: 30, lifespan: 800, diplomacy: 15 },
    awakeningName: "Phượng Hồn Niết Bàn",
  },
  IMMORTAL_BONE: {
    id: "IMMORTAL_BONE",
    name: "Tiên Cốt Di Truyền",
    icon: "🦴",
    type: "recessive",
    rarity: "epic",
    color: "#a78bfa",
    desc: "Xương cốt Tiên Nhân ẩn náu trong huyết mạch. Cần hai bản copy để biểu hiện.",
    bonus: { cultivation: 20, lifespan: 1000 },
    awakeningName: "Cốt Tiên Đại Thành",
  },
  WAR_SPIRIT: {
    id: "WAR_SPIRIT",
    name: "Chiến Thần Huyết Khí",
    icon: "⚔️",
    type: "dominant",
    rarity: "rare",
    color: "#f87171",
    desc: "Khí chất Chiến Thần ngàn đời. Trận trận bất bại.",
    bonus: { military: 30, economy: -5 },
    awakeningName: "Thần Chiến Giáng Thế",
  },
  HEAVEN_EYE: {
    id: "HEAVEN_EYE",
    name: "Thiên Nhãn Huyết Mạch",
    icon: "👁️",
    type: "recessive",
    rarity: "rare",
    color: "#60a5fa",
    desc: "Đôi mắt thấu thị vạn vật, xuyên suốt hư ảo. Cần hai bản copy.",
    bonus: { diplomacy: 25, cultivation: 10 },
    awakeningName: "Vạn Lý Thiên Mục",
  },
  VOID_ROOT: {
    id: "VOID_ROOT",
    name: "Hư Không Linh Căn",
    icon: "🌀",
    type: "recessive",
    rarity: "epic",
    color: "#818cf8",
    desc: "Linh căn hư không — loại thể chất hiếm nhất thiên hạ. Cần hai bản copy.",
    bonus: { cultivation: 40 },
    awakeningName: "Hư Vô Thiên Thể",
  },
  EMPEROR_MANDATE: {
    id: "EMPEROR_MANDATE",
    name: "Thiên Tử Thiên Mệnh",
    icon: "👑",
    type: "dominant",
    rarity: "mythic",
    color: "#fbbf24",
    desc: "Mệnh Trời chọn lựa. Sinh ra là Đế, không cần tranh đoạt.",
    bonus: { military: 15, economy: 15, diplomacy: 20, cultivation: 10, lifespan: 200 },
    awakeningName: "Đế Hoàng Giáng Thế",
  },
  CHAOS_BLOOD: {
    id: "CHAOS_BLOOD",
    name: "Hỗn Độn Huyết Mạch",
    icon: "☯️",
    type: "dominant",
    rarity: "mythic",
    color: "#c084fc",
    desc: "Huyết mạch Hỗn Mang khai thiên. Chỉ xuất hiện qua đột biến giác thức.",
    bonus: { military: 20, cultivation: 30, lifespan: 2000 },
    awakeningName: "Hỗn Mang Thái Thủy",
    awakeningOnly: true,
  },
};

const HBE_RARITY_ORDER = ["common","uncommon","rare","epic","legendary","mythic"];
const HBE_RARITY_COLOR = {
  common: "#9ca3af", uncommon: "#4ade80", rare: "#60a5fa",
  epic: "#c084fc", legendary: "#f97316", mythic: "#fbbf24"
};

// ── KHỞI TẠO ────────────────────────────────────────────────
function hbeInit() {
  if (!window.hbeData) {
    const saved = localStorage.getItem(HBE_SAVE_KEY);
    window.hbeData = saved ? JSON.parse(saved) : {
      members: {},       // Cá thể di truyền
      marriages: [],     // Hôn phối lịch sử
      awakenings: [],    // Giác thức sự kiện
      idCounter: 0,
      version: HBE_VERSION,
    };
  }
  if (!window.hbeData.members)   window.hbeData.members   = {};
  if (!window.hbeData.marriages) window.hbeData.marriages = [];
  if (!window.hbeData.awakenings)window.hbeData.awakenings= [];
  if (!window.hbeData.idCounter) window.hbeData.idCounter = 0;

  // Khởi tạo thành viên từ bloodlines hiện có
  _hbeMigrateFromBloodlines();
  hbeSave();
}

function hbeSave() {
  try {
    const data = JSON.stringify(window.hbeData);
    localStorage.setItem(HBE_SAVE_KEY, data);
  } catch(e) {}
}

// ── TẠO KIỂU GEN ────────────────────────────────────────────
function _hbeRandomGenotype(traitHint) {
  // Mỗi locus: "AA" | "Aa" | "aa" | "00"
  const genotype = {};
  const lociList = Object.keys(HBE_GENE_LOCI);

  lociList.forEach(locusId => {
    const locus = HBE_GENE_LOCI[locusId];
    if (locus.awakeningOnly) { genotype[locusId] = "00"; return; }

    // Dựa theo rarity: mythic hiếm hơn, common phổ biến hơn
    const rarityChance = { legendary: 0.04, mythic: 0.01, epic: 0.08, rare: 0.15, uncommon: 0.3, common: 0.5 };
    const chance = rarityChance[locus.rarity] || 0.1;

    // Gợi ý từ tên huyết mạch
    let boost = 0;
    if (traitHint && locus.name.toLowerCase().includes(traitHint.toLowerCase())) boost = 0.3;

    const roll = Math.random();
    if (roll < chance * 0.3 + boost * 0.5) genotype[locusId] = "AA"; // Thuần trội
    else if (roll < chance + boost * 0.3)  genotype[locusId] = "Aa"; // Dị hợp
    else if (roll < chance * 1.5)          genotype[locusId] = "aa"; // Thuần lặn
    else                                    genotype[locusId] = "00"; // Không mang
  });

  return genotype;
}

// ── DI TRUYỀN TỪ BỐ MẸ ──────────────────────────────────────
function _hbeInheritGenotype(parentA, parentB) {
  const offspring = {};
  const lociList  = Object.keys(HBE_GENE_LOCI);
  const mutations = [];

  lociList.forEach(locusId => {
    const a = parentA[locusId] || "00";
    const b = parentB[locusId] || "00";

    // Lấy 1 alen từ mỗi bố mẹ
    const alenFromA = _hbePickAlele(a);
    const alenFromB = _hbePickAlele(b);

    // Đột biến: 2.5% mỗi alen
    const mutatedA = _hbeMutateAlele(locusId, alenFromA, mutations);
    const mutatedB = _hbeMutateAlele(locusId, alenFromB, mutations);

    offspring[locusId] = _hbeCombineAleles(mutatedA, mutatedB);
  });

  // Cơ hội đột biến giác thức: 1.5% xuất hiện CHAOS_BLOOD
  if (Math.random() < 0.015) {
    offspring["CHAOS_BLOOD"] = "Aa";
    mutations.push({ locusId: "CHAOS_BLOOD", type: "awakening", name: HBE_GENE_LOCI.CHAOS_BLOOD.awakeningName });
  }

  return { genotype: offspring, mutations };
}

function _hbePickAlele(alleles) {
  // "AA" → "A" | "Aa" → random "A" or "a" | "aa" → "a" | "00" → "0"
  if (alleles === "AA") return "A";
  if (alleles === "aa") return "a";
  if (alleles === "00") return "0";
  return Math.random() < 0.5 ? "A" : "a"; // "Aa"
}

function _hbeMutateAlele(locusId, alele, mutations) {
  if (Math.random() > 0.025) return alele;
  const locus = HBE_GENE_LOCI[locusId];
  if (!locus) return alele;
  const newAlele = alele === "0" ? (Math.random() < 0.3 ? "a" : "0") :
                   alele === "A" ? (Math.random() < 0.5 ? "a" : "A") :
                   (Math.random() < 0.3 ? "A" : "a");
  if (newAlele !== alele) {
    mutations.push({ locusId, type: "mutation", from: alele, to: newAlele, locus: locus.name });
  }
  return newAlele;
}

function _hbeCombineAleles(a, b) {
  if (a === "0" && b === "0") return "00";
  if (a === "0") return b === "A" ? "A0" : "a0"; // Hemizygous (treated as Aa/aa for display)
  if (b === "0") return a === "A" ? "A0" : "a0";
  if (a === "A" && b === "A") return "AA";
  if (a === "a" && b === "a") return "aa";
  return "Aa";
}

// ── BIỂU HIỆN KIỂU HÌNH ─────────────────────────────────────
function _hbeGetPhenotype(genotype) {
  const expressed = [];
  Object.entries(genotype).forEach(([locusId, alleles]) => {
    const locus = HBE_GENE_LOCI[locusId];
    if (!locus || alleles === "00") return;
    const isDominant = locus.type === "dominant";
    const hasExpression = isDominant
      ? (alleles.includes("A"))      // Dominant: 1 bản là đủ
      : (alleles === "aa");          // Recessive: cần 2 bản
    if (hasExpression) expressed.push(locusId);
  });
  return expressed;
}

// ── ĐỘ THUẦN HUYẾT ──────────────────────────────────────────
function _hbeCalcPurity(genotype) {
  const lociList = Object.keys(HBE_GENE_LOCI).filter(id => !HBE_GENE_LOCI[id].awakeningOnly);
  let score = 0;
  let total = 0;

  lociList.forEach(locusId => {
    const alleles = genotype[locusId] || "00";
    if (alleles === "00") return; // Không mang không tính
    total++;
    if (alleles === "AA" || alleles === "aa") score++; // Thuần hợp = thuần huyết
    else score += 0.5; // Dị hợp = pha tạp
  });

  return total === 0 ? 0 : Math.round((score / total) * 100);
}

function _hbePurityLabel(pct) {
  if (pct >= 95) return { label: "Thánh Huyết", color: "#fbbf24", icon: "✨" };
  if (pct >= 80) return { label: "Cao Quý",    color: "#f97316", icon: "🔥" };
  if (pct >= 65) return { label: "Thuần Chính", color: "#c084fc", icon: "💜" };
  if (pct >= 50) return { label: "Hỗn Hợp",    color: "#60a5fa", icon: "💙" };
  if (pct >= 30) return { label: "Loãng Mỏng",  color: "#9ca3af", icon: "⚪" };
  return            { label: "Suy Thoái",      color: "#6b7280", icon: "💀" };
}

// ── TÍNH BONUS TỔNG HỢP ─────────────────────────────────────
function _hbeCalcTotalBonus(genotype) {
  const bonus = { military: 0, economy: 0, cultivation: 0, diplomacy: 0, lifespan: 0 };
  const phenotype = _hbeGetPhenotype(genotype);

  phenotype.forEach(locusId => {
    const locus = HBE_GENE_LOCI[locusId];
    if (!locus) return;
    const alleles = genotype[locusId];
    const multiplier = alleles === "AA" ? 1.5 : 1; // Thuần trội +50% bonus
    Object.entries(locus.bonus).forEach(([stat, val]) => {
      if (bonus[stat] !== undefined) bonus[stat] += Math.round(val * multiplier);
    });
  });

  return bonus;
}

// ── TẠO THÀNH VIÊN DI TRUYỀN ────────────────────────────────
function hbeCreateMember(opts) {
  if (!window.hbeData) hbeInit();
  const id = "hbe" + (++window.hbeData.idCounter);
  const genotype = opts.genotype || _hbeRandomGenotype(opts.traitHint);
  const phenotype = _hbeGetPhenotype(genotype);
  const purity = _hbeCalcPurity(genotype);
  const bonus  = _hbeCalcTotalBonus(genotype);

  const member = {
    id,
    name:        opts.name || "Vô Danh",
    surname:     opts.surname || "Khuyết",
    bloodlineId: opts.bloodlineId || null,
    genotype,
    phenotype,
    purity,
    bonus,
    generation:  opts.generation || 1,
    yearBorn:    opts.yearBorn || (window.year || 1),
    parentIds:   opts.parentIds || [],
    childrenIds: [],
    spouseId:    null,
    isDead:      false,
    yearDeath:   null,
    titles:      [],
    history:     [`Năm ${opts.yearBorn || window.year || 1}: ${opts.name || "Thành viên"} ra đời với ${phenotype.length} đặc tính huyết mạch.`],
  };

  window.hbeData.members[id] = member;
  return member;
}

// ── HÔN PHỐI ────────────────────────────────────────────────
function hbeMarry(memberIdA, memberIdB) {
  if (!window.hbeData) return null;
  const A = window.hbeData.members[memberIdA];
  const B = window.hbeData.members[memberIdB];
  if (!A || !B) return null;
  if (A.spouseId || B.spouseId) return null;

  A.spouseId = memberIdB;
  B.spouseId = memberIdA;

  const year = window.year || 1;
  const marriage = {
    id:    "mar" + Date.now(),
    memberIdA, memberIdB,
    nameA: A.name, nameB: B.name,
    surnameA: A.surname, surnameB: B.surname,
    year,
    offspring: [],
  };

  window.hbeData.marriages.push(marriage);
  A.history.push(`Năm ${year}: Kết hôn với ${B.name} (${B.surname} tộc).`);
  B.history.push(`Năm ${year}: Kết hôn với ${A.name} (${A.surname} tộc).`);

  if (typeof addLog === "function") {
    addLog(`💒 ${A.name} (${A.surname} tộc) ↔ ${B.name} (${B.surname} tộc) — Hôn phối liên gia!`, "important");
  }

  hbeSave();
  return marriage;
}

// ── SINH CON ─────────────────────────────────────────────────
function hbeHaveChild(memberIdA, memberIdB, opts) {
  if (!window.hbeData) return null;
  const A = window.hbeData.members[memberIdA];
  const B = window.hbeData.members[memberIdB];
  if (!A || !B) return null;

  const { genotype, mutations } = _hbeInheritGenotype(A.genotype, B.genotype);
  const year = opts?.year || window.year || 1;
  const generation = Math.max(A.generation, B.generation) + 1;

  // Tên theo họ cha hoặc họ mẹ (50/50), họ con kết hợp đặc biệt nếu có đột biến
  const hasMythicMutation = mutations.some(m => m.type === "awakening");
  const childSurname = hasMythicMutation
    ? A.surname + "-" + B.surname
    : (Math.random() < 0.6 ? A.surname : B.surname);

  const childName = childSurname + " " + _hbeRandGivenName();

  const child = hbeCreateMember({
    name: childName,
    surname: childSurname,
    bloodlineId: A.bloodlineId || B.bloodlineId,
    genotype,
    generation,
    yearBorn: year,
    parentIds: [memberIdA, memberIdB],
    traitHint: "",
  });

  A.childrenIds.push(child.id);
  B.childrenIds.push(child.id);

  // Đột biến lịch sử
  if (mutations.length > 0) {
    mutations.forEach(mut => {
      if (mut.type === "awakening") {
        const awakening = {
          id:     "awk" + Date.now(),
          memberId: child.id,
          memberName: childName,
          locusId:  mut.locusId,
          name:     mut.name,
          year,
          parentNames: [A.name, B.name],
        };
        window.hbeData.awakenings.push(awakening);
        child.titles.push("⚡ " + mut.name);
        child.history.push(`Năm ${year}: GIÁC THỨC — ${mut.name}! Huyết mạch đột biến phi thường!`);

        if (typeof addLog === "function") {
          addLog(`⚡ GIÁC THỨC! ${childName} — ${mut.name}! Huyết mạch đột biến kỳ diệu!`, "important");
        }
        if (typeof htAddEvent === "function") {
          htAddEvent({ year, type: "bloodline_awakening", text: `⚡ GIÁC THỨC: ${childName} (${mut.name})` });
        }
      } else {
        child.history.push(`Năm ${year}: Đột biến gen ${HBE_GENE_LOCI[mut.locusId]?.name || mut.locusId}.`);
      }
    });
  }

  // Cập nhật hôn nhân
  const marriage = window.hbeData.marriages.find(
    m => (m.memberIdA === memberIdA && m.memberIdB === memberIdB) ||
         (m.memberIdA === memberIdB && m.memberIdB === memberIdA)
  );
  if (marriage) marriage.offspring.push(child.id);

  if (typeof addLog === "function" && mutations.length === 0) {
    const phenoNames = child.phenotype.map(id => HBE_GENE_LOCI[id]?.icon + " " + HBE_GENE_LOCI[id]?.name).join(", ");
    addLog(`👶 ${childName} ra đời — Thế hệ ${generation} · Độ thuần ${child.purity}%${phenoNames ? " · " + phenoNames : ""}`, "info");
  }

  hbeSave();
  return child;
}

// ── KHỞI TẠO TỪ BLOODLINE HIỆN CÓ ─────────────────────────
function _hbeMigrateFromBloodlines() {
  if (!window.bloodlineData) return;
  Object.values(window.bloodlineData.bloodlines).forEach(bl => {
    if (bl.isExtinct) return;
    // Kiểm tra đã tạo ancestor chưa
    const existing = Object.values(window.hbeData.members).find(m => m.bloodlineId === bl.bloodlineId);
    if (existing) return;

    // Tạo thành viên sáng lập
    const founder = hbeCreateMember({
      name: bl.founder,
      surname: bl.surname,
      bloodlineId: bl.bloodlineId,
      generation: 1,
      yearBorn: bl.yearFounded,
      traitHint: bl.surname,
    });

    // Tạo các thành viên hiện tại từ family tree
    const current = bl.familyTree.filter(m => !m.isDead).slice(0, 4);
    let prevId = founder.id;
    current.forEach((ftMember, i) => {
      const m = hbeCreateMember({
        name: ftMember.name,
        surname: bl.surname,
        bloodlineId: bl.bloodlineId,
        generation: ftMember.generation,
        yearBorn: ftMember.year || (bl.yearFounded + ftMember.generation * 30),
        parentIds: i === 0 ? [founder.id] : [prevId],
        traitHint: bl.surname,
      });
      if (i > 0) {
        const prev = window.hbeData.members[prevId];
        if (prev) prev.childrenIds.push(m.id);
      }
      prevId = m.id;
    });
  });
}

// ── TICK ────────────────────────────────────────────────────
function hbeTick() {
  if (!window.hbeData) return;
  const year = window.year || 0;

  if (year > 0 && year % 40 === 0) {
    // Hôn phối tự động giữa các thành viên cùng thế hệ
    _hbeAutoMarryTick(year);
    hbeSave();
  }

  if (year > 0 && year % 25 === 0) {
    // Sinh con tự động
    _hbeAutoChildTick(year);
    // Sync lại migration
    _hbeMigrateFromBloodlines();
    hbeSave();
  }
}

function _hbeAutoMarryTick(year) {
  const singles = Object.values(window.hbeData.members).filter(m => !m.spouseId && !m.isDead);
  // Ghép đôi ngẫu nhiên từ các bloodline khác nhau
  const shuffled = singles.sort(() => Math.random() - 0.5);
  for (let i = 0; i < shuffled.length - 1; i += 2) {
    const a = shuffled[i], b = shuffled[i + 1];
    if (a.bloodlineId !== b.bloodlineId && Math.random() < 0.35) {
      hbeMarry(a.id, b.id);
    }
  }
}

function _hbeAutoChildTick(year) {
  const couples = window.hbeData.marriages.filter(m => m.offspring.length < 3);
  couples.slice(0, 4).forEach(mar => {
    if (Math.random() < 0.5) {
      hbeHaveChild(mar.memberIdA, mar.memberIdB, { year });
    }
  });
}

// ── HELPER ──────────────────────────────────────────────────
function _hbeRandGivenName() {
  const pool = ["Phong","Vũ","Long","Thiên","Đế","Thánh","Hào","Linh","Kiếm","Huyền",
                "Minh","Tử","Bạch","Hắc","Khải","Ngọc","Thiên","Vân","Hải","Lôi",
                "Băng","Hỏa","Phàm","Tôn","Vương","Xuân","Tuấn","Anh","Kiệt","Hùng"];
  return pool[Math.floor(Math.random() * pool.length)];
}

function _hbeAllelesLabel(alleles) {
  const map = {
    "AA": { text: "AA", color: "#f97316", tip: "Thuần trội — biểu hiện mạnh nhất" },
    "Aa": { text: "Aa", color: "#fbbf24", tip: "Dị hợp — biểu hiện, mang gen lặn" },
    "A0": { text: "A°", color: "#fbbf24", tip: "Bán hợp trội" },
    "aa": { text: "aa", color: "#c084fc", tip: "Thuần lặn — biểu hiện đầy đủ" },
    "a0": { text: "a°", color: "#818cf8", tip: "Bán hợp lặn — không biểu hiện" },
    "00": { text: "——", color: "#374151", tip: "Không mang gen này" },
  };
  return map[alleles] || { text: alleles, color: "#6b7280", tip: "" };
}

// ── RENDER PANEL CHÍNH ────────────────────────────────────────
function hbeRenderPanel() {
  const panel = document.getElementById("panel-bloodlines");
  if (!panel) return;
  if (!window.hbeData) hbeInit();

  const members   = Object.values(window.hbeData.members);
  const marriages = window.hbeData.marriages;
  const awakenings= window.hbeData.awakenings;
  const totalMembers = members.length;
  const totalMarriages = marriages.length;
  const totalAwakenings = awakenings.length;

  // Thống kê nhanh
  const mythicCount = members.filter(m => m.phenotype.some(p => HBE_GENE_LOCI[p]?.rarity === "mythic")).length;
  const avgPurity = totalMembers > 0
    ? Math.round(members.reduce((s, m) => s + m.purity, 0) / totalMembers)
    : 0;

  panel.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%;overflow:hidden">

      <!-- HEADER -->
      <div style="padding:16px 20px 12px;border-bottom:1px solid rgba(192,132,252,0.2);background:rgba(0,0,0,0.3);flex-shrink:0">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div>
            <div style="font-family:var(--font-title);font-size:18px;color:#c084fc;letter-spacing:2px">🧬 HUYẾT MẠCH DI TRUYỀN</div>
            <div style="font-size:11px;color:var(--white-dim);margin-top:2px">Hệ thống gen di truyền · Hôn phối gia tộc · Đột biến giác thức</div>
          </div>
          <div style="display:flex;gap:8px">
            <button onclick="hbeAutoGenerate()" style="padding:6px 14px;border-radius:8px;border:1px solid rgba(192,132,252,0.4);background:rgba(192,132,252,0.1);color:#c084fc;cursor:pointer;font-size:11px">⚡ Tự động</button>
            <button onclick="hbeRenderPanel()" style="padding:6px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:var(--white-dim);cursor:pointer;font-size:11px">🔄</button>
          </div>
        </div>

        <!-- STATS BAR -->
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px">
          ${[
            ["👥", "Thành viên", totalMembers, "#c084fc"],
            ["💒", "Hôn phối", totalMarriages, "#ec4899"],
            ["⚡", "Giác thức", totalAwakenings, "#fbbf24"],
            ["✨", "Thần thánh", mythicCount, "#f97316"],
            ["💧", "Thuần huyết TB", avgPurity + "%", "#60a5fa"],
          ].map(([icon, label, val, color]) => `
            <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:8px;text-align:center">
              <div style="font-size:16px">${icon}</div>
              <div style="font-size:15px;font-weight:800;color:${color}">${val}</div>
              <div style="font-size:9px;color:var(--white-dim);margin-top:1px">${label}</div>
            </div>
          `).join("")}
        </div>

        <!-- TABS -->
        <div style="display:flex;gap:6px;margin-top:12px" id="hbe-tabs">
          ${["members","marriages","awakenings","simulator"].map((tab, i) => {
            const labels = ["👤 Thành Viên","💒 Hôn Phối","⚡ Giác Thức","🧪 Mô Phỏng"];
            return `<button onclick="hbeShowTab('${tab}')" id="hbe-tab-${tab}"
              style="padding:5px 14px;border-radius:6px;border:1px solid rgba(192,132,252,${i===0?'0.6':'0.2'});
              background:rgba(192,132,252,${i===0?'0.15':'0.05'});color:${i===0?'#c084fc':'var(--white-dim)'};
              cursor:pointer;font-size:11px;transition:all 0.2s">${labels[i]}</button>`;
          }).join("")}
        </div>
      </div>

      <!-- CONTENT -->
      <div id="hbe-content" style="flex:1;overflow-y:auto;padding:16px 20px">
        ${hbeRenderMembersTab()}
      </div>
    </div>
  `;
}

function hbeShowTab(tab) {
  // Update tab styles
  ["members","marriages","awakenings","simulator"].forEach(t => {
    const btn = document.getElementById("hbe-tab-" + t);
    if (!btn) return;
    const isActive = t === tab;
    btn.style.borderColor = `rgba(192,132,252,${isActive?'0.6':'0.2'})`;
    btn.style.background = `rgba(192,132,252,${isActive?'0.15':'0.05'})`;
    btn.style.color = isActive ? "#c084fc" : "var(--white-dim)";
  });

  const content = document.getElementById("hbe-content");
  if (!content) return;
  if (tab === "members")   content.innerHTML = hbeRenderMembersTab();
  if (tab === "marriages") content.innerHTML = hbeRenderMarriagesTab();
  if (tab === "awakenings")content.innerHTML = hbeRenderAwakeningsTab();
  if (tab === "simulator") content.innerHTML = hbeRenderSimulatorTab();
}

// ── TAB: THÀNH VIÊN ─────────────────────────────────────────
function hbeRenderMembersTab() {
  const members = Object.values(window.hbeData?.members || {}).filter(m => !m.isDead);
  if (members.length === 0) return `
    <div style="text-align:center;padding:60px;color:var(--white-dim)">
      <div style="font-size:48px;margin-bottom:12px">🧬</div>
      <div>Chưa có thành viên nào. Nhấn "Tự động" để khởi tạo.</div>
    </div>`;

  // Sắp xếp theo độ thuần huyết giảm dần
  const sorted = [...members].sort((a, b) => b.purity - a.purity);

  return `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:12px">
      ${sorted.map(m => hbeRenderMemberCard(m)).join("")}
    </div>`;
}

function hbeRenderMemberCard(m) {
  const purityInfo = _hbePurityLabel(m.purity);
  const bonus      = m.bonus;
  const lociList   = Object.keys(HBE_GENE_LOCI);

  // Chỉ hiển thị loci có gen khác "00"
  const activeGenotype = lociList.filter(id => m.genotype[id] && m.genotype[id] !== "00");

  const bonusStr = Object.entries(bonus)
    .filter(([, v]) => v !== 0)
    .map(([stat, v]) => {
      const colors = { military:"#f87171", economy:"#fbbf24", cultivation:"#4ade80", diplomacy:"#60a5fa", lifespan:"#c084fc" };
      const names  = { military:"Quân sự", economy:"Kinh tế", cultivation:"Tu luyện", diplomacy:"Ngoại giao", lifespan:"Thọ mạng" };
      const sign = v > 0 ? "+" : "";
      return `<span style="font-size:9px;padding:2px 6px;border-radius:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:${colors[stat]}">${sign}${v}${stat==="lifespan"?" năm":"% "+names[stat]}</span>`;
    }).join("");

  return `
    <div style="background:rgba(0,0,0,0.35);border:1px solid rgba(192,132,252,0.15);border-radius:12px;padding:14px;position:relative;overflow:hidden">
      <!-- Purity glow -->
      <div style="position:absolute;top:0;right:0;width:80px;height:80px;background:radial-gradient(circle at top right,${purityInfo.color}18 0%,transparent 70%);pointer-events:none"></div>

      <!-- Header -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <div>
          <div style="font-family:var(--font-title);font-size:14px;color:var(--white-main)">${m.name}</div>
          <div style="font-size:10px;color:var(--white-dim);margin-top:2px">Thế hệ ${m.generation} · Năm ${m.yearBorn}</div>
          ${m.spouseId && window.hbeData.members[m.spouseId]
            ? `<div style="font-size:9px;color:#ec4899;margin-top:1px">💒 Hôn phu/nhân: ${window.hbeData.members[m.spouseId].name}</div>`
            : ""}
          ${m.childrenIds.length > 0
            ? `<div style="font-size:9px;color:#4ade80;margin-top:1px">👶 ${m.childrenIds.length} hậu duệ</div>`
            : ""}
        </div>
        <div style="text-align:right">
          <div style="font-size:20px">${purityInfo.icon}</div>
          <div style="font-size:13px;font-weight:800;color:${purityInfo.color}">${m.purity}%</div>
          <div style="font-size:8px;color:${purityInfo.color}">${purityInfo.label}</div>
        </div>
      </div>

      <!-- Purity bar -->
      <div style="margin-bottom:10px">
        <div style="height:4px;border-radius:2px;background:rgba(255,255,255,0.06);overflow:hidden">
          <div style="height:100%;width:${m.purity}%;background:linear-gradient(90deg,${purityInfo.color}80,${purityInfo.color});border-radius:2px;transition:width 0.5s"></div>
        </div>
      </div>

      <!-- Phenotype (biểu hiện) -->
      ${m.phenotype.length > 0 ? `
        <div style="margin-bottom:10px">
          <div style="font-size:9px;color:var(--white-dim);letter-spacing:1px;margin-bottom:5px">✨ BIỂU HIỆN HUYẾT MẠCH</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px">
            ${m.phenotype.map(locusId => {
              const locus = HBE_GENE_LOCI[locusId];
              if (!locus) return "";
              const rarityColor = HBE_RARITY_COLOR[locus.rarity] || "#9ca3af";
              return `<span style="font-size:9px;padding:3px 8px;border-radius:10px;background:${rarityColor}18;border:1px solid ${rarityColor}40;color:${rarityColor}">
                ${locus.icon} ${locus.name}
              </span>`;
            }).join("")}
          </div>
        </div>
      ` : `<div style="margin-bottom:10px;font-size:10px;color:var(--white-dim);font-style:italic">Chưa biểu hiện huyết mạch nào</div>`}

      <!-- Genotype Map (mini) -->
      ${activeGenotype.length > 0 ? `
        <div style="margin-bottom:10px">
          <div style="font-size:9px;color:var(--white-dim);letter-spacing:1px;margin-bottom:5px">🧬 BẢN ĐỒ GEN</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px">
            ${activeGenotype.map(locusId => {
              const locus   = HBE_GENE_LOCI[locusId];
              const alleles = m.genotype[locusId];
              const aInfo   = _hbeAllelesLabel(alleles);
              const isExpressed = m.phenotype.includes(locusId);
              return `<div title="${locus.name}: ${aInfo.tip}" style="display:flex;align-items:center;gap:3px;font-size:9px;padding:2px 7px;border-radius:6px;
                background:${isExpressed ? aInfo.color + "18" : "rgba(255,255,255,0.02)"};
                border:1px solid ${isExpressed ? aInfo.color + "50" : "rgba(255,255,255,0.06)"};
                color:${isExpressed ? aInfo.color : "var(--white-dim)"}">
                <span>${locus.icon}</span>
                <span style="font-family:monospace;font-weight:800">${aInfo.text}</span>
              </div>`;
            }).join("")}
          </div>
        </div>
      ` : ""}

      <!-- Bonus -->
      ${bonusStr ? `
        <div style="margin-bottom:8px">
          <div style="font-size:9px;color:var(--white-dim);letter-spacing:1px;margin-bottom:5px">⭐ BONUS HUYẾT THỐNG</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px">${bonusStr}</div>
        </div>
      ` : ""}

      <!-- Titles -->
      ${m.titles.length > 0 ? `
        <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:8px;margin-top:6px">
          ${m.titles.map(t => `<span style="font-size:9px;color:#fbbf24">${t}</span>`).join(" · ")}
        </div>
      ` : ""}

      <!-- Actions -->
      <div style="display:flex;gap:6px;margin-top:10px;border-top:1px solid rgba(255,255,255,0.05);padding-top:8px">
        <button onclick="hbeShowGeneDetail('${m.id}')" style="flex:1;padding:5px;border-radius:6px;border:1px solid rgba(96,165,250,0.3);background:rgba(96,165,250,0.08);color:#60a5fa;cursor:pointer;font-size:10px">🔬 Chi tiết gen</button>
        ${!m.spouseId ? `<button onclick="hbeShowMarryModal('${m.id}')" style="flex:1;padding:5px;border-radius:6px;border:1px solid rgba(236,72,153,0.3);background:rgba(236,72,153,0.08);color:#ec4899;cursor:pointer;font-size:10px">💒 Hôn phối</button>` : ""}
        ${m.spouseId ? `<button onclick="hbeHaveChild('${m.id}','${m.spouseId}');hbeRenderPanel()" style="flex:1;padding:5px;border-radius:6px;border:1px solid rgba(74,222,128,0.3);background:rgba(74,222,128,0.08);color:#4ade80;cursor:pointer;font-size:10px">👶 Sinh con</button>` : ""}
      </div>
    </div>`;
}

// ── TAB: HÔN PHỐI ────────────────────────────────────────────
function hbeRenderMarriagesTab() {
  const marriages = window.hbeData?.marriages || [];
  if (marriages.length === 0) return `
    <div style="text-align:center;padding:60px;color:var(--white-dim)">
      <div style="font-size:48px;margin-bottom:12px">💒</div>
      <div>Chưa có hôn phối nào được ghi nhận.</div>
    </div>`;

  return `
    <div style="display:flex;flex-direction:column;gap:10px">
      ${[...marriages].reverse().map(mar => {
        const offspring = (mar.offspring || [])
          .map(id => window.hbeData.members[id])
          .filter(Boolean);

        return `
          <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(236,72,153,0.15);border-radius:10px;padding:14px">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
              <div style="text-align:center">
                <div style="font-size:12px;color:var(--white-main)">${mar.nameA}</div>
                <div style="font-size:9px;color:var(--white-dim)">${mar.surnameA} tộc</div>
              </div>
              <div style="color:#ec4899;font-size:18px">💒</div>
              <div style="text-align:center">
                <div style="font-size:12px;color:var(--white-main)">${mar.nameB}</div>
                <div style="font-size:9px;color:var(--white-dim)">${mar.surnameB} tộc</div>
              </div>
              <div style="margin-left:auto;font-size:10px;color:var(--white-dim)">Năm ${mar.year}</div>
            </div>

            ${offspring.length > 0 ? `
              <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:8px">
                <div style="font-size:9px;color:var(--white-dim);margin-bottom:6px">👶 HẬU DUỆ (${offspring.length})</div>
                <div style="display:flex;flex-wrap:wrap;gap:6px">
                  ${offspring.map(child => {
                    const pInfo = _hbePurityLabel(child.purity);
                    const hasAwakening = window.hbeData.awakenings.some(a => a.memberId === child.id);
                    return `<div style="padding:4px 10px;border-radius:8px;border:1px solid ${hasAwakening?'rgba(251,191,36,0.4)':'rgba(255,255,255,0.08)'};background:${hasAwakening?'rgba(251,191,36,0.08)':'rgba(255,255,255,0.03)'};font-size:10px;color:${hasAwakening?'#fbbf24':'var(--white-main)'}">
                      ${hasAwakening?"⚡ ":""}${child.name} <span style="color:${pInfo.color}">(${child.purity}%)</span>
                    </div>`;
                  }).join("")}
                </div>
              </div>
            ` : `<div style="font-size:10px;color:var(--white-dim);font-style:italic">Chưa có hậu duệ</div>`}

            <div style="margin-top:8px">
              <button onclick="hbeHaveChild('${mar.memberIdA}','${mar.memberIdB}',{year:${window.year||1}});hbeShowTab('marriages')"
                style="padding:5px 14px;border-radius:6px;border:1px solid rgba(74,222,128,0.3);background:rgba(74,222,128,0.08);color:#4ade80;cursor:pointer;font-size:10px">
                👶 Sinh con tiếp theo
              </button>
            </div>
          </div>`;
      }).join("")}
    </div>`;
}

// ── TAB: GIÁC THỨC ──────────────────────────────────────────
function hbeRenderAwakeningsTab() {
  const awakenings = window.hbeData?.awakenings || [];
  if (awakenings.length === 0) return `
    <div style="text-align:center;padding:60px;color:var(--white-dim)">
      <div style="font-size:48px;margin-bottom:12px">⚡</div>
      <div style="margin-bottom:8px">Chưa có giác thức nào xảy ra.</div>
      <div style="font-size:11px;color:var(--white-dim)">Sinh nhiều hậu duệ để tăng cơ hội đột biến giác thức (1.5% mỗi lần sinh).</div>
    </div>`;

  return `
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="padding:10px 14px;border-radius:8px;background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.2);font-size:11px;color:#fbbf24">
        ⚡ Giác thức là sự kiện cực hiếm — huyết mạch đột biến tạo ra đặc tính chưa từng có trong lịch sử gia tộc. Tỉ lệ: 1.5% mỗi lần sinh con.
      </div>
      ${[...awakenings].reverse().map(awk => {
        const locus  = HBE_GENE_LOCI[awk.locusId];
        const member = window.hbeData.members[awk.memberId];
        const rarityColor = locus ? HBE_RARITY_COLOR[locus.rarity] : "#fbbf24";
        return `
          <div style="background:linear-gradient(135deg,rgba(0,0,0,0.5),rgba(251,191,36,0.04));border:1px solid rgba(251,191,36,0.3);border-radius:12px;padding:16px;position:relative;overflow:hidden">
            <div style="position:absolute;top:-20px;right:-20px;font-size:80px;opacity:0.04">⚡</div>
            <div style="display:flex;align-items:flex-start;gap:12px">
              <div style="font-size:32px">${locus?.icon || "⚡"}</div>
              <div style="flex:1">
                <div style="font-size:13px;font-weight:800;color:#fbbf24;font-family:var(--font-title)">${awk.name}</div>
                <div style="font-size:11px;color:var(--white-main);margin-top:4px">${awk.memberName}</div>
                <div style="font-size:10px;color:var(--white-dim);margin-top:2px">
                  Năm ${awk.year} · Con của ${awk.parentNames?.join(" & ") || "Khuyết"}
                </div>
                ${locus ? `<div style="font-size:10px;color:${rarityColor};margin-top:4px;font-style:italic">"${locus.desc}"</div>` : ""}
                ${member ? `
                  <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px">
                    ${Object.entries(member.bonus).filter(([,v])=>v!==0).map(([stat,v]) => {
                      const names={military:"Quân sự",economy:"Kinh tế",cultivation:"Tu luyện",diplomacy:"Ngoại giao",lifespan:"Thọ mạng"};
                      const colors={military:"#f87171",economy:"#fbbf24",cultivation:"#4ade80",diplomacy:"#60a5fa",lifespan:"#c084fc"};
                      return `<span style="font-size:9px;padding:2px 7px;border-radius:8px;background:${colors[stat]}18;border:1px solid ${colors[stat]}40;color:${colors[stat]}">${v>0?"+":""}${v}${stat==="lifespan"?" năm":"% "+names[stat]}</span>`;
                    }).join("")}
                  </div>
                ` : ""}
              </div>
              <div style="text-align:right;flex-shrink:0">
                <div style="font-size:9px;padding:3px 8px;border-radius:8px;background:${rarityColor}18;border:1px solid ${rarityColor}40;color:${rarityColor}">${locus?.rarity?.toUpperCase() || "MYTHIC"}</div>
                <div style="font-size:9px;color:var(--white-dim);margin-top:6px">Độ thuần:<br><span style="color:${_hbePurityLabel(member?.purity||0).color}">${member?.purity||0}%</span></div>
              </div>
            </div>
          </div>`;
      }).join("")}
    </div>`;
}

// ── TAB: MÔ PHỎNG DI TRUYỀN ─────────────────────────────────
function hbeRenderSimulatorTab() {
  const members = Object.values(window.hbeData?.members || {}).filter(m => !m.isDead);
  if (members.length < 2) return `
    <div style="text-align:center;padding:40px;color:var(--white-dim)">
      <div style="font-size:36px;margin-bottom:8px">🧪</div>
      Cần ít nhất 2 thành viên để mô phỏng.
    </div>`;

  const options = members.map(m =>
    `<option value="${m.id}">${m.name} (${m.surname} tộc · ${m.purity}% thuần)</option>`
  ).join("");

  return `
    <div style="max-width:600px;margin:0 auto">
      <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(192,132,252,0.2);border-radius:12px;padding:20px;margin-bottom:16px">
        <div style="font-size:13px;color:#c084fc;font-family:var(--font-title);margin-bottom:16px">🧪 MÔ PHỎNG SINH CON</div>
        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;margin-bottom:16px">
          <div>
            <div style="font-size:10px;color:var(--white-dim);margin-bottom:5px">Thành viên A</div>
            <select id="hbe-sim-a" style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(0,0,0,0.5);color:var(--white-main);font-size:11px">
              ${options}
            </select>
          </div>
          <div style="font-size:24px;color:#ec4899">×</div>
          <div>
            <div style="font-size:10px;color:var(--white-dim);margin-bottom:5px">Thành viên B</div>
            <select id="hbe-sim-b" style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(0,0,0,0.5);color:var(--white-main);font-size:11px">
              ${members.length > 1 ? `<option value="${members[1].id}">${members[1].name} (${members[1].surname} tộc · ${members[1].purity}% thuần)</option>` : ""}
              ${options}
            </select>
          </div>
        </div>
        <button onclick="hbeRunSimulation()" style="width:100%;padding:10px;border-radius:8px;border:1px solid rgba(192,132,252,0.4);background:rgba(192,132,252,0.12);color:#c084fc;cursor:pointer;font-size:12px;font-family:var(--font-title)">
          🧬 Mô Phỏng Di Truyền (5 con)
        </button>
      </div>

      <div id="hbe-sim-result" style="display:none"></div>

      <!-- Legend -->
      <div style="background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;margin-top:12px">
        <div style="font-size:10px;color:var(--white-dim);letter-spacing:1px;margin-bottom:10px">📖 CHÚ GIẢI KIỂU GEN</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${[
            ["AA", "#f97316", "Thuần trội — biểu hiện mạnh nhất (+50% bonus)"],
            ["Aa", "#fbbf24", "Dị hợp — biểu hiện, mang gen lặn"],
            ["aa", "#c084fc", "Thuần lặn — biểu hiện đầy đủ"],
            ["——", "#374151", "Không mang gen này"],
          ].map(([allele, color, desc]) => `
            <div style="display:flex;align-items:center;gap:6px;font-size:10px;color:var(--white-dim)">
              <span style="font-family:monospace;font-weight:800;color:${color};padding:2px 8px;border-radius:4px;background:${color}15;border:1px solid ${color}40">${allele}</span>
              <span>${desc}</span>
            </div>
          `).join("")}
        </div>
        <div style="margin-top:10px;font-size:10px;color:var(--white-dim)">
          <span style="color:#f97316">●</span> Biểu hiện (dominant) &nbsp;
          <span style="color:#c084fc">●</span> Cần 2 bản copy (recessive) &nbsp;
          <span style="color:#fbbf24">⚡</span> Giác thức 1.5%/lần sinh
        </div>
      </div>
    </div>`;
}

function hbeRunSimulation() {
  const selA = document.getElementById("hbe-sim-a");
  const selB = document.getElementById("hbe-sim-b");
  if (!selA || !selB) return;

  const memberA = window.hbeData.members[selA.value];
  const memberB = window.hbeData.members[selB.value];
  if (!memberA || !memberB || memberA.id === memberB.id) return;

  const results = [];
  for (let i = 0; i < 5; i++) {
    const { genotype, mutations } = _hbeInheritGenotype(memberA.genotype, memberB.genotype);
    const phenotype = _hbeGetPhenotype(genotype);
    const purity    = _hbeCalcPurity(genotype);
    const bonus     = _hbeCalcTotalBonus(genotype);
    results.push({ genotype, phenotype, purity, bonus, mutations });
  }

  const container = document.getElementById("hbe-sim-result");
  if (!container) return;
  container.style.display = "block";
  container.innerHTML = `
    <div style="font-size:12px;color:#c084fc;font-family:var(--font-title);margin-bottom:10px">📊 KẾT QUẢ MÔ PHỎNG — ${memberA.name} × ${memberB.name}</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${results.map((r, i) => {
        const pInfo = _hbePurityLabel(r.purity);
        const activeGeno = Object.keys(HBE_GENE_LOCI).filter(id => r.genotype[id] && r.genotype[id] !== "00");
        const hasAwakening = r.mutations.some(m => m.type === "awakening");
        return `
          <div style="background:${hasAwakening?'rgba(251,191,36,0.08)':'rgba(0,0,0,0.3)'};border:1px solid ${hasAwakening?'rgba(251,191,36,0.3)':'rgba(192,132,252,0.1)'};border-radius:10px;padding:12px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <div style="font-size:11px;color:var(--white-main)">Con thứ ${i+1} ${hasAwakening?"⚡ GIÁC THỨC!":""}</div>
              <div style="font-size:12px;font-weight:800;color:${pInfo.color}">${pInfo.icon} ${r.purity}% ${pInfo.label}</div>
            </div>
            <!-- Biểu hiện -->
            ${r.phenotype.length > 0 ? `
              <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">
                ${r.phenotype.map(id => {
                  const locus = HBE_GENE_LOCI[id];
                  const rc = HBE_RARITY_COLOR[locus?.rarity] || "#9ca3af";
                  return `<span style="font-size:9px;padding:2px 7px;border-radius:8px;background:${rc}18;border:1px solid ${rc}40;color:${rc}">${locus?.icon} ${locus?.name}</span>`;
                }).join("")}
              </div>
            ` : `<div style="font-size:10px;color:var(--white-dim);margin-bottom:8px;font-style:italic">Không biểu hiện huyết mạch</div>`}
            <!-- Genotype map -->
            <div style="display:flex;flex-wrap:wrap;gap:3px">
              ${activeGeno.map(id => {
                const locus = HBE_GENE_LOCI[id];
                const alleles = r.genotype[id];
                const aInfo = _hbeAllelesLabel(alleles);
                const expressed = r.phenotype.includes(id);
                return `<div title="${locus.name}" style="font-size:8px;padding:2px 5px;border-radius:4px;
                  background:${expressed?aInfo.color+'18':'rgba(255,255,255,0.02)'};
                  border:1px solid ${expressed?aInfo.color+'40':'rgba(255,255,255,0.06)'};
                  color:${expressed?aInfo.color:'var(--white-dim)'}">
                  ${locus.icon}<span style="font-family:monospace">${aInfo.text}</span>
                </div>`;
              }).join("")}
            </div>
            ${r.mutations.length > 0 ? `
              <div style="margin-top:6px;font-size:9px;color:#fbbf24">
                ⚡ Đột biến: ${r.mutations.map(m => m.locus || m.name).join(", ")}
              </div>
            ` : ""}
          </div>`;
      }).join("")}
    </div>`;
}

// ── MODAL: CHI TIẾT GEN ──────────────────────────────────────
function hbeShowGeneDetail(memberId) {
  const m = window.hbeData?.members[memberId];
  if (!m) return;

  const lociList = Object.keys(HBE_GENE_LOCI);

  const overlay = document.createElement("div");
  overlay.id = "hbe-gene-modal";
  overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)`;
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div style="background:#0f0f1a;border:1px solid rgba(192,132,252,0.3);border-radius:16px;padding:24px;max-width:560px;width:90%;max-height:80vh;overflow-y:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div>
          <div style="font-family:var(--font-title);font-size:16px;color:#c084fc">🔬 Bản Đồ Gen — ${m.name}</div>
          <div style="font-size:10px;color:var(--white-dim);margin-top:2px">${m.surname} tộc · Thế hệ ${m.generation} · Năm ${m.yearBorn}</div>
        </div>
        <button onclick="document.getElementById('hbe-gene-modal').remove()" style="background:none;border:none;color:var(--white-dim);cursor:pointer;font-size:18px">✕</button>
      </div>

      <!-- Purity -->
      <div style="padding:10px;border-radius:8px;background:rgba(${_hbePurityLabel(m.purity).color},0.08);border:1px solid rgba(${_hbePurityLabel(m.purity).color},0.2);margin-bottom:14px;text-align:center">
        <div style="font-size:22px;color:${_hbePurityLabel(m.purity).color};font-weight:800">${m.purity}%</div>
        <div style="font-size:11px;color:${_hbePurityLabel(m.purity).color}">${_hbePurityLabel(m.purity).icon} ${_hbePurityLabel(m.purity).label}</div>
      </div>

      <!-- All loci -->
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px">
        ${lociList.map(locusId => {
          const locus   = HBE_GENE_LOCI[locusId];
          const alleles = m.genotype[locusId] || "00";
          const aInfo   = _hbeAllelesLabel(alleles);
          const expressed = m.phenotype.includes(locusId);
          const rarityColor = HBE_RARITY_COLOR[locus.rarity] || "#9ca3af";
          return `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;
              background:${expressed?rarityColor+'0a':'rgba(255,255,255,0.02)'};
              border:1px solid ${expressed?rarityColor+'30':'rgba(255,255,255,0.05)'}">
              <div style="font-size:18px;width:24px;text-align:center">${locus.icon}</div>
              <div style="flex:1">
                <div style="font-size:11px;color:${expressed?'var(--white-main)':'var(--white-dim)'}">
                  ${locus.name}
                  ${expressed?`<span style="font-size:8px;margin-left:4px;color:${rarityColor}">✓ biểu hiện</span>`:""}
                </div>
                <div style="font-size:9px;color:var(--white-dim);margin-top:1px">${locus.desc}</div>
              </div>
              <div style="text-align:center">
                <div style="font-family:monospace;font-size:13px;font-weight:800;color:${aInfo.color};padding:2px 8px;border-radius:6px;background:${aInfo.color}15;border:1px solid ${aInfo.color}30">${aInfo.text}</div>
                <div style="font-size:8px;color:var(--white-dim);margin-top:2px">${locus.type}</div>
              </div>
            </div>`;
        }).join("")}
      </div>

      <!-- History -->
      <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:12px">
        <div style="font-size:10px;color:var(--white-dim);letter-spacing:1px;margin-bottom:8px">📜 LỊCH SỬ</div>
        ${m.history.slice(-5).map(h => `<div style="font-size:10px;color:var(--white-dim);padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.03)">${h}</div>`).join("")}
      </div>
    </div>`;

  document.body.appendChild(overlay);
}

// ── MODAL: HÔN PHỐI ─────────────────────────────────────────
function hbeShowMarryModal(memberIdA) {
  const A = window.hbeData?.members[memberIdA];
  if (!A) return;

  const candidates = Object.values(window.hbeData.members)
    .filter(m => m.id !== memberIdA && !m.spouseId && !m.isDead && m.bloodlineId !== A.bloodlineId);

  if (candidates.length === 0) {
    alert("Không có ứng viên hôn phối phù hợp (khác huyết mạch, chưa có hôn phối).");
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "hbe-marry-modal";
  overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)`;
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div style="background:#0f0f1a;border:1px solid rgba(236,72,153,0.3);border-radius:16px;padding:24px;max-width:480px;width:90%;max-height:70vh;overflow-y:auto">
      <div style="font-family:var(--font-title);font-size:15px;color:#ec4899;margin-bottom:4px">💒 Hôn Phối — ${A.name}</div>
      <div style="font-size:10px;color:var(--white-dim);margin-bottom:14px">Chọn đối tượng từ huyết mạch khác để phối hợp gen tốt nhất</div>
      <div style="display:flex;flex-direction:column;gap:8px;max-height:40vh;overflow-y:auto">
        ${candidates.map(c => {
          const pInfo = _hbePurityLabel(c.purity);
          // Tính compatibility (gen complement)
          const sharedGenes = Object.keys(HBE_GENE_LOCI).filter(id =>
            (A.genotype[id] !== "00" && c.genotype[id] !== "00")
          ).length;
          const complementGenes = Object.keys(HBE_GENE_LOCI).filter(id =>
            (A.genotype[id] === "aa" && c.genotype[id] === "aa")
          ).length;
          const compat = Math.min(100, sharedGenes * 12 + complementGenes * 20);
          return `
            <div style="padding:12px;border-radius:8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);cursor:pointer;transition:all 0.2s"
              onclick="hbeMarry('${memberIdA}','${c.id}');document.getElementById('hbe-marry-modal')?.remove();hbeRenderPanel()">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div>
                  <div style="font-size:12px;color:var(--white-main)">${c.name}</div>
                  <div style="font-size:9px;color:var(--white-dim);margin-top:1px">${c.surname} tộc · Thế hệ ${c.generation}</div>
                  <div style="font-size:9px;color:${pInfo.color};margin-top:1px">${pInfo.icon} Độ thuần: ${c.purity}%</div>
                </div>
                <div style="text-align:center">
                  <div style="font-size:13px;font-weight:800;color:${compat>60?'#4ade80':compat>30?'#fbbf24':'#f87171'}">${compat}%</div>
                  <div style="font-size:8px;color:var(--white-dim)">Tương hợp</div>
                </div>
              </div>
              ${c.phenotype.length > 0 ? `
                <div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:6px">
                  ${c.phenotype.map(id => {
                    const locus = HBE_GENE_LOCI[id];
                    return `<span style="font-size:8px;padding:1px 5px;border-radius:6px;background:${HBE_RARITY_COLOR[locus?.rarity]}15;color:${HBE_RARITY_COLOR[locus?.rarity]}">${locus?.icon} ${locus?.name}</span>`;
                  }).join("")}
                </div>
              ` : ""}
            </div>`;
        }).join("")}
      </div>
      <button onclick="document.getElementById('hbe-marry-modal').remove()" style="margin-top:12px;width:100%;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:var(--white-dim);cursor:pointer">Hủy</button>
    </div>`;

  document.body.appendChild(overlay);
}

// ── TỰ ĐỘNG KHỞI TẠO ────────────────────────────────────────
function hbeAutoGenerate() {
  if (!window.hbeData) hbeInit();
  _hbeMigrateFromBloodlines();

  const year = window.year || 1;

  // Tạo thêm thành viên từ các huyết mạch
  if (window.bloodlineData) {
    const bls = Object.values(window.bloodlineData.bloodlines).filter(bl => !bl.isExtinct).slice(0, 6);
    bls.forEach(bl => {
      if (Math.random() < 0.6) {
        hbeCreateMember({
          name: bl.surname + " " + _hbeRandGivenName(),
          surname: bl.surname,
          bloodlineId: bl.bloodlineId,
          generation: bl.generation,
          yearBorn: year - Math.floor(Math.random() * 50),
          traitHint: bl.surname,
        });
      }
    });
  }

  // Tự ghép đôi 3 cặp
  _hbeAutoMarryTick(year);

  // Tự sinh con 2 cặp
  _hbeAutoChildTick(year);

  hbeSave();
  hbeRenderPanel();
}

// ── BOOT ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    hbeInit();

    // Hook vào blRenderPanel — ghi đè bằng hệ thống mới
    const origRender = window.blRenderPanel;
    window.blRenderPanel = function() {
      hbeRenderPanel();
    };

    // Tick định kỳ 15 giây
    setInterval(function() {
      if (window.world) {
        hbeTick();
        const active = document.querySelector('.nav-btn.active[data-panel="bloodlines"]');
        if (active) hbeRenderPanel();
      }
    }, 15000);

  }, 2800);
});
