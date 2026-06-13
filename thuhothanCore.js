(function() {
  "use strict";
  const SAVE_KEY = "cgv6_thuhothan_core_v33";

  window.thuhothanCoreData = {
    chatHistory: [],
    lastGreetYear: -1,
    initialized: false,
    version: "V33"
  };

  function save() {
    try {
      const toSave = Object.assign({}, window.thuhothanCoreData);
      toSave.chatHistory = toSave.chatHistory.slice(0, 100);
      localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
    } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) {
        const parsed = JSON.parse(d);
        window.thuhothanCoreData = Object.assign(window.thuhothanCoreData, parsed);
      }
    } catch(e) {}
  }

  // ─── HỆ THỐNG Q&A (keyword-based, không cần LLM) ─────────────────────────
  window.thtQuery = function(question) {
    const q = (question || "").toLowerCase().trim();
    if (!q) return "Tạo Hóa muốn hỏi điều gì? Xin hãy đặt câu hỏi.";

    const yr = window.year || 0;
    const fmt = window.thtFormatNum || (n=>n);

    // Vương quốc mạnh nhất
    if (q.includes("vương quốc mạnh") || q.includes("kingdom mạnh") || q.includes("vương quốc nào mạnh")) {
      const k = window.waGetStrongestKingdom ? window.waGetStrongestKingdom() : null;
      if (!k) return "📜 Chưa có vương quốc nào hình thành trong thế giới này.";
      return `🏯 Vương quốc mạnh nhất hiện tại là **${k.name}**, giai đoạn ${k.stage||"?"}, sức mạnh ${fmt(k.power||0)}, dân số ${fmt(k.population||0)}.`;
    }

    // Đế chế mạnh nhất
    if (q.includes("đế chế mạnh") || q.includes("empire mạnh") || q.includes("đế chế nào mạnh")) {
      const e = window.waGetStrongestEmpire ? window.waGetStrongestEmpire() : null;
      if (!e) return "📜 Chưa có đế chế nào ra đời trong thế giới này.";
      return `👑 Đế chế hùng mạnh nhất là **${e.name}**, kiểm soát ${(e.territories||[]).length} lãnh thổ, sức mạnh ${fmt(e.power||0)}.`;
    }

    // Vương quốc giàu nhất
    if (q.includes("giàu nhất") || q.includes("giàu") || q.includes("kho báu")) {
      const k = window.waGetRichestKingdom ? window.waGetRichestKingdom() : null;
      if (!k) return "📜 Chưa có thông tin kinh tế vương quốc.";
      return `💰 Vương quốc giàu nhất là **${k.name}** với kho bạc ${fmt(k.wealth||k.treasury||0)} vàng.`;
    }

    // Chiến tranh
    if (q.includes("chiến tranh") || q.includes("war") || q.includes("tuyên chiến") || q.includes("đang đánh")) {
      const wars = window.warsActive || [];
      if (!wars.length) return "⚔️ Hiện tại không có cuộc chiến tranh nào đang diễn ra. Thế giới đang hòa bình.";
      const warList = wars.slice(0,5).map(w=>`${w.attacker||"?"} VS ${w.defender||"?"}`).join("; ");
      return `⚔️ Có **${wars.length}** cuộc chiến đang diễn ra: ${warList}.`;
    }

    // Thần mạnh nhất / thần lửa v.v.
    if (q.includes("thần") && (q.includes("mạnh") || q.includes("lửa") || q.includes("nước") || q.includes("gió") || q.includes("đất") || q.includes("chiến") || q.includes("trí tuệ"))) {
      const deities = (window.divineBeingData && window.divineBeingData.deities) || [];
      if (!deities.length) return "⚡ Chưa có thần nào thức tỉnh trong thế giới này.";
      // Tìm theo domain keyword
      const domains = { "lửa":["lửa","hỏa","fire"], "nước":["nước","thủy","water"], "gió":["gió","phong","wind"], "đất":["đất","thổ","earth"], "chiến":["chiến","chiến tranh","war"], "trí tuệ":["trí tuệ","wisdom","tri"] };
      let found = null;
      for (const [kw, variants] of Object.entries(domains)) {
        if (variants.some(v => q.includes(v))) {
          found = deities.find(d => variants.some(v => (d.domain||"").toLowerCase().includes(v)));
          break;
        }
      }
      if (found) return `⚡ Thần cai quản lĩnh vực đó là **${found.name}** — Lĩnh vực: ${found.domain}, Cấp bậc: ${found.tier||"?"}.`;
      const strongest = deities.sort((a,b)=>(b.power||0)-(a.power||0))[0];
      return `⚡ Có **${deities.length}** vị thần đã thức tỉnh. Mạnh nhất là **${strongest.name||"?"}** — Lĩnh vực: ${strongest.domain||"?"}.`;
    }

    // 100 năm qua / lịch sử
    if (q.includes("100 năm") || q.includes("gần đây") || q.includes("vừa xảy ra") || q.includes("sự kiện")) {
      const years = q.includes("50 năm") ? 50 : q.includes("200 năm") ? 200 : q.includes("500 năm") ? 500 : 100;
      const memories = window.thtGetMemoriesInYears ? window.thtGetMemoriesInYears(years) : [];
      if (!memories.length) {
        const worldHistory = (window.worldHistory||[]).filter(e=>e.year>=(yr-years));
        if (!worldHistory.length) return `📜 Không tìm thấy sự kiện đáng chú ý trong ${years} năm gần đây.`;
        return `📜 Trong ${years} năm qua: ` + worldHistory.slice(0,5).map(e=>e.title||e.text||"").join("; ") + ".";
      }
      return `📜 Trong ${years} năm qua có **${memories.length}** sự kiện đáng nhớ: ` + memories.slice(0,4).map(m=>m.title).join("; ") + ".";
    }

    // Boss
    if (q.includes("boss") || q.includes("quái vật") || q.includes("demon")) {
      const bosses = (window.wbv31Data && window.wbv31Data.activeBosses) || [];
      if (!bosses.length) return "👹 Hiện không có Boss nguy hiểm nào đang hoạt động.";
      const top = bosses.sort((a,b)=>(b.maxHp||0)-(a.maxHp||0)).slice(0,3);
      return `👹 Có **${bosses.length}** Boss đang hoạt động. Nguy hiểm nhất: ${top.map(b=>`${b.name||"?"} (${b.tier||"?"})`).join(", ")}.`;
    }

    // NPC mạnh nhất
    if (q.includes("npc mạnh") || q.includes("tu sĩ mạnh") || q.includes("mạnh nhất")) {
      const npcs = window.npcs || [];
      const alive = npcs.filter(n=>n.alive||n.alive===undefined);
      if (!alive.length) return "👥 Chưa có sinh linh trong thế giới.";
      const top = alive.sort((a,b)=>(b.power||b.qi||0)-(a.power||a.qi||0)).slice(0,3);
      return `🧘 Tu sĩ mạnh nhất: ${top.map(n=>`**${n.name||"?"}** (${n.realm||"?"})`).join(", ")}.`;
    }

    // Ổn định / tình hình
    if (q.includes("ổn định") || q.includes("tình hình") || q.includes("thế giới như thế nào")) {
      const report = window.caGetWorldStabilityReport ? window.caGetWorldStabilityReport() : {score:50,status:"Không rõ",recommendation:""};
      return `⚖️ Thế giới hiện ở trạng thái **${report.status}** (${report.score}/100). ${report.recommendation}`;
    }

    // Dân số
    if (q.includes("dân số") || q.includes("bao nhiêu người") || q.includes("sinh linh")) {
      const npcs = window.npcs || [];
      const alive = npcs.filter(n=>n.alive||n.alive===undefined).length;
      return `👥 Thế giới hiện có **${fmt(alive)}** sinh linh đang sống.`;
    }

    // Đại dịch
    if (q.includes("đại dịch") || q.includes("dịch bệnh") || q.includes("plague")) {
      const plagues = (window.plagueData && window.plagueData.activePlagues) || [];
      if (!plagues.length) return "💉 Hiện không có đại dịch nào. Sức khỏe thế giới ổn định.";
      return `💀 Có **${plagues.length}** đại dịch đang bùng phát: ${plagues.map(p=>p.name||"?").join(", ")}.`;
    }

    // Xâm lược
    if (q.includes("xâm lược") || q.includes("invasion")) {
      const invasions = (window.iev31Data && window.iev31Data.activeInvasions) || [];
      if (!invasions.length) return "🛡️ Không có làn sóng xâm lược nào đang diễn ra.";
      return `🌋 Có **${invasions.length}** làn sóng xâm lược đang tấn công thế giới!`;
    }

    // Kinh tế
    if (q.includes("kinh tế") || q.includes("economy") || q.includes("thương mại")) {
      const issues = window.waGetEconomicIssues ? window.waGetEconomicIssues() : [];
      if (!issues.length) return "💰 Kinh tế thế giới đang ổn định. Không có vấn đề nghiêm trọng.";
      return `💹 Vấn đề kinh tế: ${issues.map(i=>i.detail).join("; ")}.`;
    }

    // Năm hiện tại
    if (q.includes("năm") && (q.includes("bao nhiêu") || q.includes("hiện tại") || q.includes("mấy"))) {
      return `📅 Thế giới hiện đang ở Năm **${yr}** của lịch sử.`;
    }

    // Default
    const greeting = window.thtGetGreeting ? window.thtGetGreeting() : "Thần đang lắng nghe.";
    return `🔮 ${greeting}\n\nThần chưa hiểu câu hỏi của Tạo Hóa. Hãy thử hỏi về: vương quốc mạnh nhất, đế chế, chiến tranh, boss, thần thánh, dân số, ổn định, kinh tế, hoặc "100 năm qua".`;
  };

  // Thêm tin nhắn vào chat
  function addChat(sender, text, type) {
    window.thuhothanCoreData.chatHistory.unshift({
      sender: sender || "system",
      text: text || "",
      type: type || "normal",
      year: window.year || 0,
      ts: Date.now()
    });
    if (window.thuhothanCoreData.chatHistory.length > 100) {
      window.thuhothanCoreData.chatHistory = window.thuhothanCoreData.chatHistory.slice(0, 100);
    }
    save();
  }

  // ─── RENDER PANEL CHÍNH: THỦ HỘ THẦN ─────────────────────────────────────
  window.thtRenderPanel = function() {
    const panel = document.getElementById("panel-thuhothan");
    if (!panel) return;

    const yr = window.year || 0;
    const world = window.world || {};
    const unread = (window.worldAlertData && window.worldAlertData.unreadCount) || 0;
    const stability = typeof window.waGetWorldStabilityScore === 'function' ? window.waGetWorldStabilityScore() : 50;
    const sColor = stability > 66 ? "#22c55e" : stability > 33 ? "#eab308" : "#ef4444";
    const greeting = window.thtGetGreeting ? window.thtGetGreeting() : "Chào mừng Đấng Tạo Hóa.";
    const memCount = (window.thuhothanMemoryData && window.thuhothanMemoryData.memories.length) || 0;
    const feedCount = (window.eventFeedData && window.eventFeedData.items.length) || 0;
    const chatHistory = window.thuhothanCoreData.chatHistory || [];

    // Nhanh chóng lấy dữ liệu
    const wars = (window.warsActive||[]).length;
    const bosses = ((window.wbv31Data && window.wbv31Data.activeBosses)||[]).length;
    const deities = ((window.divineBeingData && window.divineBeingData.deities)||[]).length;
    const npcs = (window.npcs||[]).filter(n=>n.alive||n.alive===undefined).length;

    let html = `<div style="padding:0;font-family:'Noto Serif SC',serif;color:#e2e8f0;height:100%;display:flex;flex-direction:column">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#0f172a,#1e1b4b);padding:16px 20px;border-bottom:1px solid #312e81">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:48px;height:48px;background:linear-gradient(135deg,#6366f1,#a855f7);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 0 20px #6366f155">🤖</div>
          <div>
            <div style="font-size:18px;font-weight:bold;color:#e0e7ff">Thủ Hộ Thần</div>
            <div style="font-size:12px;color:#818cf8">Cố Vấn Thiên Giới · ${world.name||"Chưa có thế giới"} · Năm ${yr}</div>
          </div>
          <div style="margin-left:auto;text-align:right">
            <div style="font-size:20px;font-weight:bold;color:${sColor}">${stability}%</div>
            <div style="font-size:11px;color:#64748b">Ổn Định</div>
          </div>
        </div>
      </div>

      <!-- Status Bar -->
      <div style="background:#0f172a;padding:10px 20px;display:flex;gap:20px;font-size:12px;border-bottom:1px solid #1e293b;flex-wrap:wrap">
        <span>⚔️ Chiến tranh: <b style="color:#f87171">${wars}</b></span>
        <span>👹 Boss: <b style="color:#ef4444">${bosses}</b></span>
        <span>⚡ Thần: <b style="color:#818cf8">${deities}</b></span>
        <span>👥 Sinh linh: <b style="color:#60a5fa">${npcs}</b></span>
        ${unread > 0 ? `<span style="color:#fbbf24">🚨 Cảnh báo mới: <b>${unread}</b></span>` : ""}
      </div>

      <div style="flex:1;overflow:auto;padding:16px 20px">

        <!-- Lời chào -->
        <div style="background:linear-gradient(135deg,#1e1b4b,#0f172a);border:1px solid #312e81;border-radius:10px;padding:14px;margin-bottom:16px">
          <div style="font-size:13px;color:#c7d2fe;line-height:1.6">"${greeting}"</div>
          <div style="font-size:11px;color:#475569;margin-top:6px">— Thủ Hộ Thần · Năm ${yr}</div>
        </div>

        <!-- Cố vấn Tạo Hóa nhúng vào đây -->
        <div style="margin-bottom:16px">
          <div style="font-size:13px;color:#94a3b8;font-weight:bold;margin-bottom:10px">📊 BÁO CÁO TỪ CỐ VẤN THẦN</div>
          <div id="tht-creator-advisor"></div>
        </div>

        <!-- Hỏi đáp AI -->
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:14px;margin-bottom:16px">
          <div style="font-size:13px;color:#60a5fa;font-weight:bold;margin-bottom:10px">🔮 HỎI THẦN (Thủ Hộ Thần Q&A)</div>
          <div style="margin-bottom:10px;display:flex;gap:8px">
            <input id="tht-question-input" type="text" placeholder='Ví dụ: "Vương quốc nào mạnh nhất?"'
              style="flex:1;padding:8px 12px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:12px;font-family:'Noto Serif SC',serif"
              onkeydown="if(event.key==='Enter')thtSubmitQuestion()"
              value="">
            <button onclick="thtSubmitQuestion()"
              style="padding:8px 14px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;border-radius:6px;color:white;cursor:pointer;font-size:12px;white-space:nowrap">
              Hỏi Thần ✦
            </button>
          </div>

          <!-- Câu hỏi gợi ý -->
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
            ${["Vương quốc mạnh nhất?","Đế chế mạnh nhất?","Chiến tranh đang diễn ra?","Boss nguy hiểm nhất?","100 năm qua có gì?","Thần nào mạnh nhất?","Tình hình thế giới?","Dân số bao nhiêu?"].map(q=>
              `<button onclick="thtAskPreset(this)" data-q="${q}" style="padding:3px 8px;background:#1e293b;border:1px solid #334155;border-radius:12px;color:#94a3b8;cursor:pointer;font-size:11px;transition:all 0.2s" onmouseover="this.style.borderColor='#6366f1';this.style.color='#a5b4fc'" onmouseout="this.style.borderColor='#334155';this.style.color='#94a3b8'">${q}</button>`
            ).join("")}
          </div>

          <!-- Hộp trả lời -->
          <div id="tht-answer-box" style="display:none;background:#1e1b4b;border:1px solid #312e81;border-radius:8px;padding:12px;font-size:13px;color:#e0e7ff;line-height:1.7;min-height:40px;white-space:pre-line"></div>
        </div>

        <!-- Lịch sử trò chuyện gần đây -->
        ${chatHistory.length > 0 ? `<div style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:14px;margin-bottom:16px">
          <div style="font-size:12px;color:#64748b;font-weight:bold;margin-bottom:10px">📜 LỊCH SỬ HỎI ĐÁP (${chatHistory.length})</div>
          ${chatHistory.slice(0,5).map(c=>`<div style="margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #0f172a">
            <div style="font-size:11px;color:#475569">Năm ${c.year||0} · ${c.sender==="user"?"🧑 Tạo Hóa":"🤖 Thủ Hộ Thần"}</div>
            <div style="font-size:12px;color:${c.sender==="user"?"#93c5fd":"#c7d2fe"};margin-top:2px">${(c.text||"").substring(0,150)}${(c.text||"").length>150?"...":""}</div>
          </div>`).join("")}
        </div>` : ""}

        <!-- Thống kê hệ thống -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">
          <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;text-align:center">
            <div style="font-size:18px;font-weight:bold;color:#818cf8">${memCount}</div>
            <div style="font-size:11px;color:#475569">🧠 Ký Ức</div>
          </div>
          <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;text-align:center">
            <div style="font-size:18px;font-weight:bold;color:#60a5fa">${feedCount}</div>
            <div style="font-size:11px;color:#475569">📰 Tin Tức</div>
          </div>
          <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;text-align:center">
            <div style="font-size:18px;font-weight:bold;color:#fbbf24">${unread}</div>
            <div style="font-size:11px;color:#475569">🚨 Cảnh Báo</div>
          </div>
        </div>

        <!-- Navigation nhanh -->
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          <button onclick="showPanel('world-news');efRenderPanel()" style="padding:6px 12px;background:#0f172a;border:1px solid #1e40af;border-radius:6px;color:#60a5fa;cursor:pointer;font-size:12px">📢 Tin Tức</button>
          <button onclick="showPanel('alerts');waeRenderPanel()" style="padding:6px 12px;background:#0f172a;border:1px solid #7f1d1d;border-radius:6px;color:#f87171;cursor:pointer;font-size:12px">🚨 Cảnh Báo ${unread>0?`(${unread})`:""}</button>
          <button onclick="showPanel('advisor');paRenderPanel()" style="padding:6px 12px;background:#0f172a;border:1px solid #1e3a5f;border-radius:6px;color:#818cf8;cursor:pointer;font-size:12px">📊 Cố Vấn</button>
          <button onclick="showPanel('world-report');waRenderReportPanel()" style="padding:6px 12px;background:#0f172a;border:1px solid #14532d;border-radius:6px;color:#34d399;cursor:pointer;font-size:12px">📖 Báo Cáo TG</button>
        </div>

      </div>
    </div>`;

    panel.innerHTML = html;

    // Render creator advisor vào đúng vị trí
    if (typeof window.caRenderCreatorPanel === 'function') {
      window.caRenderCreatorPanel();
    }
  };

  // Gửi câu hỏi
  window.thtSubmitQuestion = function() {
    const input = document.getElementById("tht-question-input");
    const answerBox = document.getElementById("tht-answer-box");
    if (!input || !answerBox) return;
    const q = (input.value || "").trim();
    if (!q) return;

    addChat("user", q, "question");
    const answer = window.thtQuery(q);
    addChat("thuhothan", answer, "answer");

    // Render trả lời
    answerBox.style.display = "block";
    answerBox.innerHTML = `<div style="font-size:11px;color:#475569;margin-bottom:6px">🧑 Tạo Hóa hỏi: "${q}"</div>
      <div style="color:#e0e7ff">${(answer||"").replace(/\*\*(.*?)\*\*/g, '<b style="color:#a5b4fc">$1</b>').replace(/\n/g,'<br>')}</div>`;
    input.value = "";
  };

  window.thtAskPreset = function(btn) {
    const q = btn.getAttribute("data-q") || "";
    const input = document.getElementById("tht-question-input");
    if (input) { input.value = q; }
    window.thtSubmitQuestion();
  };

  // Tick — cập nhật thông tin
  let _thtTickCount = 0;
  function thtCoreTick() {
    _thtTickCount++;
    // Cứ 5 tick thì ghi nhớ trạng thái
    if (_thtTickCount % 5 === 0 && window.world && window.world.name) {
      const yr = window.year || 0;
      const wars = (window.warsActive||[]).length;
      if (wars > 0 && _thtTickCount % 20 === 0) {
        if (typeof window.thtAddMemory === 'function') {
          window.thtAddMemory("war", `${wars} Cuộc Chiến Đang Diễn Ra`, `Năm ${yr}: Thế giới có ${wars} cuộc chiến tranh.`, yr);
        }
      }
    }
    save();
  }

  // ─── INIT ─────────────────────────────────────────────────────────────────
  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      thtCoreTick();
    };
    window.thuhothanCoreData.initialized = true;
    save();
    console.log("[ThuHoThanCore V33] 🤖 Thủ Hộ Thần khởi động — Cố Vấn AI · Q&A · Bộ Nhớ · Cảnh Báo · Tin Tức sẵn sàng phụng sự Đấng Tạo Hóa.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 2200); });
  } else {
    setTimeout(init, 2200);
  }
})();
