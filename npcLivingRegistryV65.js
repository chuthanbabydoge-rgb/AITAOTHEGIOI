(function() {
  "use strict";

  // ════ TAB RENDERERS ════

  function renderNpcTab() {
    const stats = typeof window.npcLife65GetStats === "function" ? window.npcLife65GetStats() : {};
    const top = typeof window.npcLife65GetTopProfiles === "function" ? window.npcLife65GetTopProfiles(12) : [];
    const deaths = typeof window.npcLife65GetDeaths === "function" ? window.npcLife65GetDeaths(5) : [];
    const npcs = window.npcs || [];
    const CAREERS = window.npcLife65Careers || [];

    let html = `<div style="padding:14px;font-family:'Cinzel',serif;color:#e2e8f0">
      <h3 style="color:#4ade80;margin:0 0 12px">👤 Sinh Linh Đang Sống</h3>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px">
        <div style="background:#1e293b;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:20px;color:#4ade80">${stats.totalProfiles||0}</div>
          <div style="font-size:10px;color:#94a3b8">Hồ Sơ</div>
        </div>
        <div style="background:#1e293b;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:20px;color:#facc15">${stats.births||0}</div>
          <div style="font-size:10px;color:#94a3b8">Sinh Ra</div>
        </div>
        <div style="background:#1e293b;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:20px;color:#f87171">${stats.deaths||0}</div>
          <div style="font-size:10px;color:#94a3b8">Qua Đời</div>
        </div>
        <div style="background:#1e293b;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:20px;color:#60a5fa">${stats.avgHappiness||0}%</div>
          <div style="font-size:10px;color:#94a3b8">Hạnh Phúc</div>
        </div>
      </div>`;

    // Career distribution
    if (stats.careerCounts && CAREERS.length > 0) {
      html += `<div style="margin-bottom:12px">
        <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Phân Bổ Nghề Nghiệp</div>
        <div style="display:flex;flex-wrap:wrap;gap:5px">`;
      CAREERS.forEach(c => {
        const count = stats.careerCounts[c.id] || 0;
        if (count === 0) return;
        html += `<span style="background:#0f172a;border:1px solid #334155;padding:3px 7px;border-radius:10px;font-size:11px;color:#94a3b8">${c.icon} ${c.label}: ${count}</span>`;
      });
      html += `</div></div>`;
    }

    // Top NPC profiles
    html += `<div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Sinh Linh Nổi Bật</div>
      <div style="max-height:280px;overflow-y:auto">`;

    top.forEach(prof => {
      const npc = npcs.find(n => (n.id||n.name) === prof.npcId);
      if (!npc) return;
      const career = CAREERS.find(c => c.id === prof.career) || { icon:"❓", label:"?" };
      const emotionColors = { happy:"#4ade80", angry:"#f87171", fearful:"#fb923c", hopeful:"#60a5fa", desperate:"#94a3b8", proud:"#facc15", sad:"#818cf8", content:"#34d399" };
      const emotColor = emotionColors[prof.emotions?.primary] || "#94a3b8";

      html += `<div style="background:#1e293b;border-radius:8px;padding:10px;margin-bottom:7px;border:1px solid #334155;cursor:pointer"
        onclick="if(typeof npcLiving65_showBio==='function')npcLiving65_showBio('${prof.npcId}')">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <span style="color:#4ade80;font-size:13px;font-weight:bold">${npc.name}</span>
            <span style="color:#475569;font-size:11px;margin-left:8px">${npc.realm||'?'} · ${npc.age||0}t</span>
          </div>
          <div style="font-size:12px">${career.icon} <span style="color:#64748b;font-size:11px">${career.label}</span></div>
        </div>
        <div style="display:flex;gap:10px;margin-top:5px;font-size:11px">
          <span style="color:${emotColor}">● ${prof.emotions?.primary||'content'}</span>
          <span style="color:#475569">${prof.lifeEvents.length} sự kiện</span>
          ${prof.dream ? `<span style="color:#475569;font-style:italic">💭 ${prof.dream.substring(0,30)}...</span>` : ''}
        </div>
      </div>`;
    });

    html += `</div>`;

    // Recent deaths
    if (deaths.length > 0) {
      html += `<div style="margin-top:10px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">⚰️ Mới Qua Đời</div>
        <div style="max-height:100px;overflow-y:auto">`;
      deaths.forEach(d => {
        html += `<div style="font-size:11px;color:#475569;padding:3px 0;border-bottom:1px solid #1e293b">
          ⚰️ <span style="color:#94a3b8">${d.name}</span> · Năm ${d.year} · ${d.career||'?'}
          ${d.dream ? `<span style="font-style:italic;color:#334155"> — "${d.dream.substring(0,25)}..."</span>` : ''}
        </div>`;
      });
      html += `</div>`;
    }

    // Bio modal area
    html += `<div id="nlv65-bio-modal" style="display:none;margin-top:12px;background:#0f172a;border-radius:8px;padding:12px;border:1px solid #334155"></div>`;
    html += `</div>`;
    return html;
  }

  function renderFamilyTab() {
    const families = typeof window.npcFam65GetAllFamilies === "function" ? window.npcFam65GetAllFamilies() : [];
    const stats = typeof window.npcFam65GetStats === "function" ? window.npcFam65GetStats() : {};
    const npcs = window.npcs || [];

    let html = `<div style="padding:14px;font-family:'Cinzel',serif;color:#e2e8f0">
      <h3 style="color:#fbbf24;margin:0 0 12px">👨‍👩‍👧‍👦 Gia Tộc & Gia Phả</h3>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
        <div style="background:#1e293b;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:20px;color:#fbbf24">${stats.familyCount||0}</div>
          <div style="font-size:10px;color:#94a3b8">Gia Tộc</div>
        </div>
        <div style="background:#1e293b;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:20px;color:#34d399">${stats.totalMembers||0}</div>
          <div style="font-size:10px;color:#94a3b8">Thành Viên</div>
        </div>
        <div style="background:#1e293b;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:20px;color:#818cf8">${stats.maxGenerations||0}</div>
          <div style="font-size:10px;color:#94a3b8">Max Thế Hệ</div>
        </div>
      </div>`;

    if (families.length === 0) {
      html += `<div style="color:#475569;text-align:center;padding:30px;font-style:italic">
        Chưa có gia tộc nào được ghi chép. NPC cần có trường <em>family</em> hoặc <em>dynasty</em>...
      </div>`;
    } else {
      html += `<div style="max-height:380px;overflow-y:auto">`;
      families.slice(0,12).forEach(fam => {
        const alive = fam.members.filter(id => {
          const n = npcs.find(x => (x.id||x.name)===id);
          return n && n.status !== "dead";
        }).length;
        const patriarch = fam.patriarch ? npcs.find(n=>(n.id||n.name)===fam.patriarch) : null;
        html += `<div style="background:#1e293b;border-radius:8px;padding:10px;margin-bottom:8px;border:1px solid #334155">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <div style="color:#fbbf24;font-size:14px;font-weight:bold">⚔️ ${fam.name}</div>
            <div style="font-size:11px;color:#475569">${fam.generationCount||1} thế hệ · ${alive}/${fam.members.length} còn sống</div>
          </div>
          ${patriarch ? `<div style="font-size:12px;color:#94a3b8">👑 Thủy Tổ: ${patriarch.name} · Lập năm ${fam.founded}</div>` : `<div style="font-size:12px;color:#475569">Lập năm ${fam.founded}</div>`}
          <div style="margin-top:4px;font-size:11px;color:#64748b">Sinh: ${fam.totalBorn} · Mất: ${fam.totalDied}</div>
          <button onclick="
            const n=typeof window.npcFam65GetFamilyNarrative==='function'?window.npcFam65GetFamilyNarrative('${fam.id}'):'';
            const el=document.getElementById('fam65-detail-${fam.id.replace(/[^a-zA-Z0-9]/g,'_')}');
            if(el){el.style.display=el.style.display==='none'?'block':'none';el.textContent=n;}
          " style="background:transparent;border:1px solid #334155;color:#64748b;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:10px;margin-top:6px">Biên Niên Gia Tộc</button>
          <pre id="fam65-detail-${fam.id.replace(/[^a-zA-Z0-9]/g,'_')}" style="display:none;background:#0f172a;color:#94a3b8;padding:8px;border-radius:4px;font-size:11px;margin-top:6px;white-space:pre-wrap;max-height:150px;overflow-y:auto"></pre>
        </div>`;
      });
      html += `</div>`;
    }
    html += `</div>`;
    return html;
  }

  function renderRelationTab() {
    const topSocial = typeof window.npcRel65GetTopSocial === "function" ? window.npcRel65GetTopSocial(12) : [];
    const loveStories = typeof window.npcRel65GetLoveStories === "function" ? window.npcRel65GetLoveStories(5) : [];
    const rivalries = typeof window.npcRel65GetRivalries === "function" ? window.npcRel65GetRivalries(5) : [];
    const relStats = typeof window.npcRel65GetStats === "function" ? window.npcRel65GetStats() : {};
    const npcs = window.npcs || [];

    function getName(id) { const n = npcs.find(x=>(x.id||x.name)===id); return n?n.name:id; }

    let html = `<div style="padding:14px;font-family:'Cinzel',serif;color:#e2e8f0">
      <h3 style="color:#f472b6;margin:0 0 12px">💕 Mạng Lưới Quan Hệ</h3>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px">
        <div style="background:#1e293b;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:18px;color:#4ade80">${relStats.totalRelationships||0}</div>
          <div style="font-size:10px;color:#94a3b8">Mối Quan Hệ</div>
        </div>
        <div style="background:#1e293b;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:18px;color:#f472b6">${relStats.loveStories||0}</div>
          <div style="font-size:10px;color:#94a3b8">Tình Yêu</div>
        </div>
        <div style="background:#1e293b;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:18px;color:#f87171">${relStats.rivalries||0}</div>
          <div style="font-size:10px;color:#94a3b8">Đối Địch</div>
        </div>
        <div style="background:#1e293b;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:18px;color:#60a5fa">${relStats.npcWithRels||0}</div>
          <div style="font-size:10px;color:#94a3b8">NPC Hoạt Động</div>
        </div>
      </div>`;

    // Love stories
    if (loveStories.length > 0) {
      html += `<div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">💕 Chuyện Tình Yêu</div>
        <div style="margin-bottom:12px">`;
      loveStories.forEach(love => {
        const nameA = getName(love.a), nameB = getName(love.b);
        html += `<div style="background:#1e293b;border-radius:6px;padding:8px;margin-bottom:5px;border-left:3px solid #f472b6">
          <span style="color:#f472b6;font-size:12px">💒 ${nameA} ❤️ ${nameB}</span>
          <span style="color:#475569;font-size:11px;margin-left:8px">Từ năm ${love.startYear} · ${love.outcome==='ongoing'?'Đang diễn ra':'Kết thúc'}</span>
        </div>`;
      });
      html += `</div>`;
    }

    // Rivalries
    if (rivalries.length > 0) {
      html += `<div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">⚔️ Mối Thù Địch</div>
        <div style="margin-bottom:12px">`;
      rivalries.forEach(r => {
        const nameA = getName(r.a), nameB = getName(r.b);
        html += `<div style="background:#1e293b;border-radius:6px;padding:8px;margin-bottom:5px;border-left:3px solid #f87171">
          <span style="color:#f87171;font-size:12px">⚔️ ${nameA} vs ${nameB}</span>
          <span style="color:#475569;font-size:11px;margin-left:8px">Năm ${r.startYear} · ${r.reason||'Mâu thuẫn'}</span>
        </div>`;
      });
      html += `</div>`;
    }

    // Top social NPCs
    html += `<div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">🌐 NPC Có Quan Hệ Nhiều Nhất</div>
      <div style="max-height:200px;overflow-y:auto">`;
    topSocial.forEach(({ id, count, friends }) => {
      const npc = npcs.find(n=>(n.id||n.name)===id);
      if (!npc) return;
      html += `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #1e293b">
        <span style="color:#e2e8f0;font-size:12px">${npc.name}</span>
        <span style="color:#64748b;font-size:11px">${count} quan hệ · ${friends} bạn bè</span>
      </div>`;
    });
    html += `</div></div>`;
    return html;
  }

  function renderSocialTab() {
    const npcs = window.npcs || [];
    const alive = npcs.filter(n => n.status !== "dead");
    const year = window.year || 0;

    // Group by country
    const byCountry = {};
    alive.forEach(npc => {
      const loc = npc.country || npc.location || "Không Rõ";
      if (!byCountry[loc]) byCountry[loc] = [];
      byCountry[loc].push(npc);
    });

    // Group by career
    const byCareer = {};
    const CAREERS = window.npcLife65Careers || [];
    alive.forEach(npc => {
      const prof = typeof window.npcLife65GetProfile === "function" ? window.npcLife65GetProfile(npc.id||npc.name) : null;
      const career = prof ? prof.career : "unknown";
      if (!byCareer[career]) byCareer[career] = [];
      byCareer[career].push(npc);
    });

    let html = `<div style="padding:14px;font-family:'Cinzel',serif;color:#e2e8f0">
      <h3 style="color:#67e8f9;margin:0 0 12px">🌐 Xã Hội Thế Giới</h3>
      <div style="font-size:13px;color:#64748b;margin-bottom:12px">Năm ${year} · ${alive.length} sinh linh đang tồn tại</div>`;

    // By location
    html += `<div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">📍 Phân Bổ Địa Lý</div>
      <div style="max-height:160px;overflow-y:auto;margin-bottom:14px">`;
    Object.entries(byCountry).sort((a,b)=>b[1].length-a[1].length).slice(0,10).forEach(([loc, members]) => {
      const pct = alive.length > 0 ? Math.round(members.length/alive.length*100) : 0;
      html += `<div style="margin-bottom:5px">
        <div style="display:flex;justify-content:space-between;font-size:12px;color:#94a3b8;margin-bottom:2px">
          <span>📍 ${loc}</span><span>${members.length} (${pct}%)</span>
        </div>
        <div style="height:4px;background:#1e293b;border-radius:2px"><div style="height:4px;background:#60a5fa;border-radius:2px;width:${pct}%"></div></div>
      </div>`;
    });
    html += `</div>`;

    // By career
    html += `<div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">⚙️ Phân Bổ Nghề Nghiệp</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">`;
    CAREERS.forEach(c => {
      const members = byCareer[c.id] || [];
      if (members.length === 0) return;
      html += `<div style="background:#1e293b;border-radius:6px;padding:6px 10px;text-align:center;min-width:70px">
        <div style="font-size:16px">${c.icon}</div>
        <div style="font-size:10px;color:#94a3b8">${c.label}</div>
        <div style="font-size:13px;color:#e2e8f0">${members.length}</div>
      </div>`;
    });
    html += `</div>`;

    // Emotion snapshot
    html += `<div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">😊 Trạng Thái Cảm Xúc Thế Giới</div>
      <div style="background:#1e293b;border-radius:8px;padding:10px;font-size:12px;color:#94a3b8">`;
    const emotionCounts = {};
    alive.slice(0, 100).forEach(npc => {
      const prof = typeof window.npcLife65GetProfile === "function" ? window.npcLife65GetProfile(npc.id||npc.name) : null;
      const em = prof ? (prof.emotions?.primary || "content") : "content";
      emotionCounts[em] = (emotionCounts[em]||0) + 1;
    });
    const emotIcons = { happy:"😊", angry:"😠", fearful:"😨", hopeful:"🌟", desperate:"😰", proud:"😤", sad:"😢", content:"😌" };
    Object.entries(emotionCounts).sort((a,b)=>b[1]-a[1]).forEach(([em, cnt]) => {
      html += `<span style="margin-right:12px">${emotIcons[em]||'●'} ${em}: ${cnt}</span>`;
    });
    html += `</div></div>`;
    return html;
  }

  function renderLifeTab() {
    // Detailed life timeline of selected NPC
    const npcs = window.npcs || [];
    const alive = npcs.filter(n => n.status !== "dead");
    const year = window.year || 0;

    // Pick most interesting NPC
    let html = `<div style="padding:14px;font-family:'Cinzel',serif;color:#e2e8f0">
      <h3 style="color:#c084fc;margin:0 0 12px">📅 Cuộc Đời NPC</h3>
      <div style="margin-bottom:10px">
        <label style="font-size:12px;color:#64748b">Chọn NPC để xem cuộc đời:</label>
        <select id="nlv65-select-npc" onchange="if(typeof npcLiving65_showBio==='function')npcLiving65_showBio(this.value)"
          style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:4px;padding:4px 8px;font-size:12px;margin-left:8px;max-width:200px">
          <option value="">-- Chọn sinh linh --</option>`;

    alive.slice(0, 50).forEach(npc => {
      const id = npc.id || npc.name;
      html += `<option value="${id}">${npc.name} (${npc.realm||'?'} · ${npc.age||0}t)</option>`;
    });

    html += `</select></div>
      <div id="nlv65-bio-detail" style="min-height:200px">
        <div style="color:#475569;text-align:center;padding:40px;font-style:italic">Chọn một sinh linh để xem tiểu sử đầy đủ và dòng thời gian cuộc đời...</div>
      </div>
    </div>`;
    return html;
  }

  // ════ BIO DETAIL ════
  window.npcLiving65_showBio = function(npcId) {
    if (!npcId) return;
    const bioData = typeof window.npcLife65GetBiography === "function" ? window.npcLife65GetBiography(npcId) : null;
    const genealogy = typeof window.npcFam65GetNpcGenealogy === "function" ? window.npcFam65GetNpcGenealogy(npcId) : null;
    const socialProfile = typeof window.npcRel65GetSocialProfile === "function" ? window.npcRel65GetSocialProfile(npcId) : null;
    const rels = typeof window.npcRel65GetRelationships === "function" ? window.npcRel65GetRelationships(npcId) : [];

    const targets = ["nlv65-bio-modal", "nlv65-bio-detail"];
    targets.forEach(targetId => {
      const el = document.getElementById(targetId);
      if (!el) return;

      if (!bioData) {
        el.style.display = "block";
        el.innerHTML = `<div style="color:#475569;font-size:12px">Chưa có hồ sơ cuộc đời cho sinh linh này.</div>`;
        return;
      }

      const npc = bioData.npc;
      const career = bioData.career;
      const emotionColors = { happy:"#4ade80", angry:"#f87171", fearful:"#fb923c", hopeful:"#60a5fa", desperate:"#94a3b8", proud:"#facc15", sad:"#818cf8", content:"#34d399" };
      const emotColor = emotionColors[bioData.emotions?.primary] || "#94a3b8";

      let bioHtml = `<div style="font-family:'Cinzel',serif">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div>
            <div style="font-size:15px;color:#4ade80;font-weight:bold">${npc.name}</div>
            <div style="font-size:11px;color:#64748b">${npc.realm||'?'} · ${npc.age||0} tuổi · Sinh năm ${bioData.birthYear}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:14px">${career.icon} <span style="color:#94a3b8;font-size:12px">${career.label}</span></div>
            <div style="color:${emotColor};font-size:11px">● ${bioData.emotions?.primary||'content'}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px">
          <div style="background:#0f172a;border-radius:6px;padding:7px">
            <div style="font-size:10px;color:#64748b">💭 Ước Mơ</div>
            <div style="font-size:11px;color:#fde68a;margin-top:2px">${bioData.dream||'Chưa xác định'}</div>
          </div>
          <div style="background:#0f172a;border-radius:6px;padding:7px">
            <div style="font-size:10px;color:#64748b">😨 Nỗi Sợ</div>
            <div style="font-size:11px;color:#f87171;margin-top:2px">${bioData.fear||'Không rõ'}</div>
          </div>
        </div>`;

      // Genealogy
      if (genealogy) {
        html_gen = `<div style="background:#0f172a;border-radius:6px;padding:7px;margin-bottom:8px;font-size:11px">
          <div style="color:#64748b;margin-bottom:4px">👨‍👩‍👧 Gia Đình · Thế hệ ${genealogy.generation}</div>`;
        if (genealogy.parentA) html_gen += `<div style="color:#94a3b8">🧑 Cha/Mẹ A: ${genealogy.parentA.name}</div>`;
        if (genealogy.parentB) html_gen += `<div style="color:#94a3b8">🧑 Cha/Mẹ B: ${genealogy.parentB.name}</div>`;
        if (genealogy.spouse) html_gen += `<div style="color:#f472b6">💒 Bạn Đời: ${genealogy.spouse.name}</div>`;
        if (genealogy.children.length > 0) html_gen += `<div style="color:#4ade80">🌱 Con Cái (${genealogy.children.length}): ${genealogy.children.slice(0,4).map(c=>c.name).join(", ")}</div>`;
        if (genealogy.siblings.length > 0) html_gen += `<div style="color:#fbbf24">👫 Anh/Chị/Em: ${genealogy.siblings.slice(0,3).map(s=>s.name).join(", ")}</div>`;
        html_gen += `</div>`;
        bioHtml += html_gen;
      }

      // Relationships
      if (rels.length > 0) {
        bioHtml += `<div style="margin-bottom:8px;font-size:11px">
          <div style="color:#64748b;margin-bottom:4px">🤝 Quan Hệ (${rels.length})</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px">`;
        const REL_TYPES = window.npcRelV65Types || {};
        rels.slice(0,8).forEach(r => {
          const meta = REL_TYPES[r.type] || { icon:"•", color:"#94a3b8", label:r.type };
          bioHtml += `<span style="background:#1e293b;border:1px solid ${meta.color}33;color:${meta.color};padding:2px 6px;border-radius:10px;font-size:10px">${meta.icon} ${r.targetId}</span>`;
        });
        bioHtml += `</div></div>`;
      }

      // Life events timeline
      if (bioData.lifeEvents.length > 0) {
        bioHtml += `<div style="font-size:11px;color:#64748b;margin-bottom:4px">📅 Dòng Thời Gian Cuộc Đời</div>
          <div style="max-height:180px;overflow-y:auto">`;
        bioData.lifeEvents.forEach(ev => {
          const imp = ev.importance || 3;
          const col = imp >= 5 ? "#facc15" : imp >= 4 ? "#4ade80" : "#94a3b8";
          bioHtml += `<div style="border-left:2px solid ${col};padding:4px 8px;margin-bottom:4px;background:#0f172a;border-radius:0 4px 4px 0">
            <div style="font-size:10px;color:#475569">Năm ${ev.year||0}</div>
            <div style="font-size:12px;color:#e2e8f0">${ev.title}</div>
            <div style="font-size:10px;color:#64748b">${(ev.content||'').substring(0,80)}${(ev.content||'').length>80?'...':''}</div>
          </div>`;
        });
        bioHtml += `</div>`;
      }

      // Goals
      if (bioData.goals.length > 0) {
        bioHtml += `<div style="margin-top:8px;font-size:11px;color:#64748b;margin-bottom:4px">🎯 Mục Tiêu Hiện Tại</div>`;
        bioData.goals.forEach(g => {
          bioHtml += `<div style="background:#0f172a;border-radius:4px;padding:5px 8px;margin-bottom:4px;font-size:11px;color:#94a3b8">• ${g.title}</div>`;
        });
      }

      bioHtml += `</div>`;
      el.style.display = "block";
      el.innerHTML = bioHtml;
    });
  };

  // ════ TAB CONTROLLER ════
  window.nlv65_currentTab = "npc";

  window.nlv65_showTab = function(tabId) {
    window.nlv65_currentTab = tabId;
    const content = document.getElementById("nlv65-tab-content");
    if (!content) return;

    const renderers = {
      "npc":       renderNpcTab,
      "family":    renderFamilyTab,
      "relation":  renderRelationTab,
      "social":    renderSocialTab,
      "life":      renderLifeTab
    };

    ["npc","family","relation","social","life"].forEach(id => {
      const btn = document.getElementById("nlv65-tab-" + id);
      if (btn) {
        btn.style.borderBottom = id === tabId ? "2px solid #4ade80" : "2px solid transparent";
        btn.style.color = id === tabId ? "#4ade80" : "#64748b";
      }
    });

    const renderer = renderers[tabId];
    content.innerHTML = renderer ? renderer() : "";
  };

  window.nlv65_refreshUI = function() { window.nlv65_showTab(window.nlv65_currentTab || "npc"); };

  // ════ INJECT INTO PLAYER HUB ════
  function buildLivingNpcSection() {
    return `<div id="nlv65-section-wrapper" style="margin-top:20px;border-top:1px solid #1e293b;padding-top:16px">
      <div style="font-family:'Cinzel',serif;font-size:15px;color:#4ade80;margin-bottom:10px;display:flex;align-items:center;gap:8px">
        🧬 V65 — Living NPC
        <span style="font-size:11px;color:#475569;font-family:monospace">Dân Cư Thực Sự Sống</span>
      </div>
      <div style="display:flex;gap:0;margin-bottom:12px;border-bottom:1px solid #1e293b;overflow-x:auto">
        ${[
          {id:"npc",      icon:"👤", label:"NPC"},
          {id:"family",   icon:"👨‍👩‍👧‍👦", label:"Gia Tộc"},
          {id:"relation", icon:"💕", label:"Quan Hệ"},
          {id:"social",   icon:"🌐", label:"Xã Hội"},
          {id:"life",     icon:"📅", label:"Cuộc Đời"}
        ].map(t => `<button id="nlv65-tab-${t.id}" onclick="window.nlv65_showTab('${t.id}')"
          style="background:transparent;border:none;border-bottom:2px solid transparent;padding:7px 11px;cursor:pointer;font-family:'Cinzel',serif;font-size:11px;color:#64748b;white-space:nowrap">
          ${t.icon} ${t.label}
        </button>`).join('')}
      </div>
      <div id="nlv65-tab-content" style="min-height:200px"></div>
    </div>`;
  }

  function patchPlayerHub() {
    const _origHub = window.hubRenderPanel;
    window.hubRenderPanel = function(panelId) {
      if (_origHub) _origHub(panelId);
      if (panelId !== "player-hub-v28") return;

      setTimeout(function() {
        const panel = document.getElementById("panel-player-hub-v28");
        if (!panel) return;
        if (document.getElementById("nlv65-section-wrapper")) return;
        const wrapper = document.createElement("div");
        wrapper.innerHTML = buildLivingNpcSection();
        panel.appendChild(wrapper.firstElementChild);
        setTimeout(function() { window.nlv65_showTab("npc"); }, 100);
      }, 80);
    };
  }

  function init() {
    patchPlayerHub();
    console.log("[NpcLivingRegistryV65] ✅ Living NPC UI tích hợp vào Player Hub — 5 tabs: NPC/Gia Tộc/Quan Hệ/Xã Hội/Cuộc Đời.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 13700); });
  } else {
    setTimeout(init, 13700);
  }
})();
