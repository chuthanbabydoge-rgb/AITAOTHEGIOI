(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // CIV REGISTRY V58 — UI Hub
  // Patches player-hub-v28 · 6 tabs nội bộ: Văn Minh/Văn Hóa/Luật/Lịch Sử/Ảnh Hưởng/Jarvis
  // Pattern: const _orig = window.hubRenderPanel (giống V53/V54)
  // ═══════════════════════════════════════════════════════════════════════════

  const INIT_DELAY = 10600;

  const V58_TABS = [
    { id:"civ58-core",     icon:"🏛",  label:"Văn Minh",      fn:"cr58RenderCore"     },
    { id:"civ58-culture",  icon:"🎨",  label:"Văn Hóa",       fn:"cr58RenderCulture"  },
    { id:"civ58-law",      icon:"⚖️",  label:"Luật & Tư Tưởng",fn:"cr58RenderLaw"     },
    { id:"civ58-history",  icon:"📜",  label:"Lịch Sử",       fn:"cr58RenderHistory"  },
    { id:"civ58-influence",icon:"🌐",  label:"Ảnh Hưởng",     fn:"cr58RenderInfluence"},
    { id:"civ58-jarvis",   icon:"🤖",  label:"Jarvis Civ",    fn:"cr58RenderJarvis"   }
  ];

  var currentTab = "civ58-core";

  // ─── STYLE HELPERS ─────────────────────────────────────────────
  function card(content, color) {
    return '<div style="background:' + (color||"#0a0f1a") + ';border:1px solid #1e293b;border-radius:8px;padding:10px;margin-bottom:8px">' + content + '</div>';
  }
  function badge(text, color) {
    return '<span style="background:' + (color||"#1e293b") + '22;color:' + (color||"#94a3b8") + ';border:1px solid ' + (color||"#94a3b8") + '44;border-radius:4px;padding:2px 7px;font-size:10px;margin:2px">' + text + '</span>';
  }
  function btn(label, onclick, color) {
    return '<button onclick="' + onclick + '" style="padding:5px 10px;background:' + (color||"#1e293b") + ';color:#e2e8f0;border:1px solid #334155;border-radius:5px;cursor:pointer;font-size:11px;margin:3px;font-family:\'Noto Serif SC\',serif">' + label + '</button>';
  }
  function section(title, content) {
    return '<div style="margin-bottom:10px"><div style="font-size:11px;font-weight:bold;color:#94a3b8;border-bottom:1px solid #1e293b;padding-bottom:4px;margin-bottom:6px">' + title + '</div>' + content + '</div>';
  }
  function statRow(label, value, color) {
    return '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11px;border-bottom:1px solid #0f172a"><span style="color:#64748b">' + label + '</span><span style="color:' + (color||"#e2e8f0") + ';font-weight:bold">' + value + '</span></div>';
  }
  function bar(value, max, color) {
    var pct = Math.round(Math.min(100, (value / (max||1)) * 100));
    return '<div style="background:#1e293b;border-radius:4px;height:6px;margin:2px 0"><div style="background:' + (color||"#facc15") + ';width:' + pct + '%;height:100%;border-radius:4px"></div></div>';
  }

  // ─── RENDER: VĂN MINH CORE ─────────────────────────────────────
  window.cr58RenderCore = function() {
    var d = typeof window.pc58GetStats === "function" ? window.pc58GetStats() : {};
    var lawSt = typeof window.cl58GetStats === "function" ? window.cl58GetStats() : {};
    var area = document.getElementById("player-hub-v28-content");
    if (!area) return;

    var html = '<div style="padding:10px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0;overflow-y:auto;max-height:calc(100vh - 160px)">';
    html += '<div style="font-size:16px;font-weight:bold;color:#facc15;margin-bottom:12px">🏛 Văn Minh Người Chơi V58</div>';

    if (!d.founded) {
      // THÀNH LẬP VĂN MINH FORM
      html += card('<div style="text-align:center;padding:10px">' +
        '<div style="font-size:24px;margin-bottom:8px">🌟</div>' +
        '<div style="font-size:13px;color:#facc15;margin-bottom:4px">Khai Sáng Nền Văn Minh</div>' +
        '<div style="font-size:11px;color:#64748b;margin-bottom:12px">Định hình chủng tộc, văn hóa, và vận mệnh văn minh bạn.</div>' +
        '</div>' +

        section("✏️ Thông Tin Khai Quốc",
          '<label style="font-size:11px;color:#94a3b8">Tên Văn Minh</label>' +
          '<input id="v58-civ-name" type="text" placeholder="Vd: Thiên Long Đế Quốc" style="width:100%;margin:4px 0 8px;padding:6px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:4px;font-size:12px;box-sizing:border-box">' +
          '<label style="font-size:11px;color:#94a3b8">Biểu Tượng (emoji)</label>' +
          '<input id="v58-civ-symbol" type="text" placeholder="🏛" maxlength="4" style="width:80px;margin:4px 8px 8px 4px;padding:6px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:4px;font-size:16px">' +
          '<br><label style="font-size:11px;color:#94a3b8">Khẩu Hiệu</label>' +
          '<input id="v58-civ-motto" type="text" placeholder="Vd: Trường Tồn Cùng Thiên Địa" style="width:100%;margin:4px 0 8px;padding:6px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:4px;font-size:12px;box-sizing:border-box">' +

          '<label style="font-size:11px;color:#94a3b8">Chủng Tộc Chính</label>' +
          '<select id="v58-civ-race" style="width:100%;margin:4px 0 8px;padding:6px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:4px;font-size:11px">' +
          (typeof window.pc58GetRaces === "function" ? window.pc58GetRaces().map(function(r){ return '<option value="'+r.id+'">'+r.icon+' '+r.name+' ('+r.bonus+')</option>'; }).join("") : "") +
          '</select>' +

          '<label style="font-size:11px;color:#94a3b8">Văn Hóa Chính</label>' +
          '<select id="v58-civ-culture" style="width:100%;margin:4px 0 10px;padding:6px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:4px;font-size:11px">' +
          (typeof window.pc58GetCultures === "function" ? window.pc58GetCultures().map(function(c){ return '<option value="'+c.id+'">'+c.icon+' '+c.name+'</option>'; }).join("") : "") +
          '</select>' +

          btn("✨ Khai Quốc!",
            "(function(){var n=document.getElementById('v58-civ-name').value;var s=document.getElementById('v58-civ-symbol').value;var m=document.getElementById('v58-civ-motto').value;var r=document.getElementById('v58-civ-race').value;var c=document.getElementById('v58-civ-culture').value;if(!n.trim()){alert('Nhập tên văn minh!');return;}var res=window.pc58FoundCivilization(n,s,m,r,c);alert(res.msg);if(res.ok)window.cr58RenderCore();})()",
            "#7c3aed")
        )
      );
    } else {
      // OVERVIEW CIV
      html += card(
        '<div style="text-align:center;margin-bottom:10px">' +
          '<div style="font-size:36px">' + (d.symbol||"🏛") + '</div>' +
          '<div style="font-size:15px;font-weight:bold;color:#facc15">' + d.name + '</div>' +
          '<div style="font-size:11px;color:#94a3b8;font-style:italic">"' + (d.motto||"") + '"</div>' +
        '</div>' +
        statRow("Chủng Tộc", typeof window.pc58GetRaceName === "function" ? window.pc58GetRaceName(d.mainRace) : d.mainRace, "#e2e8f0") +
        statRow("Văn Hóa", typeof window.pc58GetCultureName === "function" ? window.pc58GetCultureName(d.mainCulture) : d.mainCulture, "#e2e8f0") +
        statRow("Năm Khai Quốc", "Năm " + d.foundingYear, "#facc15") +
        statRow("Dân Số", (d.population||0).toLocaleString(), "#22c55e") +
        statRow("Danh Tiếng", d.prestige + "/100", "#f59e0b") +
        bar(d.prestige, 100, "#f59e0b") +
        statRow("Hệ Tư Tưởng", lawSt.ideologyName || "Chưa chọn", "#c084fc")
      );

      html += section("📖 Câu Chuyện Khai Quốc",
        '<textarea id="v58-story-txt" rows="3" placeholder="Viết câu chuyện thành lập văn minh..." style="width:100%;padding:6px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:4px;font-size:11px;box-sizing:border-box">' +
        (d.foundingStory||"") + '</textarea>' +
        btn("💾 Lưu", "(function(){var t=document.getElementById('v58-story-txt').value;window.pc58SetFoundingStory(t);alert('✅ Đã lưu!');})()","#0f172a")
      );

      html += section("🤖 Tương Tác AI Văn Minh",
        '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">' +
        (typeof window.pc58GetInteractTypes === "function" ? window.pc58GetInteractTypes().map(function(t){
          return btn(t.icon + " " + t.name,
            "(function(){var e=prompt('Tên thực thể AI muốn '+'" + t.name + "':');if(e){var r=window.pc58InteractWithAI(e,'"+t.id+"');alert(r.msg);window.cr58RenderCore();}})()", "#0f172a");
        }).join("") : "") +
        '</div>' +
        '<div style="font-size:10px;color:#475569">' + (d.aiRelations||[]).length + ' quan hệ đã thiết lập</div>'
      );
    }

    html += '</div>';
    area.innerHTML = html;
  };

  // ─── RENDER: VĂN HÓA & NGÔN NGỮ ─────────────────────────────────
  window.cr58RenderCulture = function() {
    var d = window.civCultureData || {};
    var st = typeof window.cc58GetStats === "function" ? window.cc58GetStats() : {};
    var area = document.getElementById("player-hub-v28-content");
    if (!area) return;

    var html = '<div style="padding:10px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0;overflow-y:auto;max-height:calc(100vh - 160px)">';
    html += '<div style="font-size:15px;font-weight:bold;color:#c084fc;margin-bottom:10px">🎨 Văn Hóa & Ngôn Ngữ</div>';

    // THỐNG KÊ
    html += card(
      badge("🎭 " + st.customCount + " Phong Tục","#c084fc") +
      badge("🎪 " + st.festivalCount + " Lễ Hội","#f59e0b") +
      badge("📖 " + (st.hasPhilosophy ? "Có Triết Học" : "Chưa có"),"#60a5fa") +
      badge("🌐 " + (st.hasLanguage ? (d.langName||"?") : "Chưa có ngôn ngữ"),"#22c55e")
    );

    // PHONG TỤC
    html += section("🎭 Phong Tục Tập Quán",
      '<div style="display:flex;gap:4px;margin-bottom:6px">' +
      '<input id="v58-custom-name" type="text" placeholder="Tên phong tục" style="flex:1;padding:5px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:4px;font-size:11px">' +
      '<select id="v58-custom-val" style="padding:5px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:4px;font-size:11px">' +
      (typeof window.cc58GetPresets === "function" ? window.cc58GetPresets().map(function(v){ return '<option value="'+v.id+'">'+v.icon+' '+v.name+'</option>'; }).join("") : "") +
      '</select>' +
      btn("➕",
        "(function(){var n=document.getElementById('v58-custom-name').value;var v=document.getElementById('v58-custom-val').value;var r=window.cc58AddCustom(n,'',v);alert(r.msg);window.cr58RenderCulture();})()",
        "#7c3aed") +
      '</div>' +
      (d.customs||[]).slice(-5).map(function(c){ return '<div style="font-size:10px;color:#94a3b8;padding:2px 0">' + c.valueIcon + ' <b style="color:#e2e8f0">' + c.name + '</b> — ' + c.value + '</div>'; }).join("") +
      '<div style="font-size:10px;color:#475569;margin-top:4px">Tổng: ' + (d.customs||[]).length + ' phong tục</div>'
    );

    // LỄ HỘI
    html += section("🎪 Lễ Hội",
      '<div style="display:flex;gap:4px;margin-bottom:6px">' +
      '<input id="v58-fest-name" type="text" placeholder="Tên lễ hội" style="flex:1;padding:5px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:4px;font-size:11px">' +
      '<select id="v58-fest-season" style="padding:5px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:4px;font-size:11px">' +
      '<option value="spring">Mùa Xuân</option><option value="harvest">Thu Hoạch</option><option value="war">Chiến Binh</option><option value="moon">Trăng Rằm</option><option value="fire">Lửa Thiêng</option><option value="ancestor">Tổ Tiên</option>' +
      '</select>' +
      btn("➕",
        "(function(){var n=document.getElementById('v58-fest-name').value;var s=document.getElementById('v58-fest-season').value;var r=window.cc58AddFestival(n,s);alert(r.msg);window.cr58RenderCulture();})()",
        "#7c3aed") +
      '</div>' +
      (d.festivals||[]).slice(-4).map(function(f){ return '<div style="font-size:10px;color:#94a3b8;padding:2px 0">🎪 <b style="color:#e2e8f0">' + f.name + '</b> — ' + (f.effect&&f.effect.desc||"") + '</div>'; }).join("")
    );

    // TRIẾT HỌC & NGHỆ THUẬT
    html += section("📖 Triết Học & Nghệ Thuật",
      '<input id="v58-philo" type="text" placeholder="Triết học (vd: Vạn vật quy nhất)" style="width:100%;margin-bottom:5px;padding:5px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:4px;font-size:11px;box-sizing:border-box" value="' + (d.philosophy||"").replace(/"/g,"&quot;") + '">' +
      btn("💾 Lưu Triết Học", "(function(){var t=document.getElementById('v58-philo').value;var r=window.cc58SetPhilosophy(t);alert(r.msg);})()", "#0f172a") +
      '<input id="v58-art" type="text" placeholder="Phong cách nghệ thuật (vd: Thư Pháp Cổ Điển)" style="width:100%;margin:5px 0;padding:5px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:4px;font-size:11px;box-sizing:border-box" value="' + (d.artStyle||"").replace(/"/g,"&quot;") + '">' +
      btn("💾 Lưu Nghệ Thuật", "(function(){var t=document.getElementById('v58-art').value;var r=window.cc58SetArtStyle(t);alert(r.msg);})()", "#0f172a")
    );

    // NGÔN NGỮ
    html += section("🌐 Ngôn Ngữ Riêng",
      (d.langName ? '<div style="font-size:11px;color:#22c55e;margin-bottom:4px">✅ Ngôn Ngữ: <b>' + d.langName + '</b></div>' : '') +
      '<div style="display:flex;gap:4px;margin-bottom:4px">' +
      '<input id="v58-lang-name" type="text" placeholder="Tên ngôn ngữ" style="flex:1;padding:5px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:4px;font-size:11px" value="' + (d.langName||"").replace(/"/g,"&quot;") + '">' +
      '<input id="v58-lang-alpha" type="text" placeholder="Chữ cái / Ký tự" style="flex:1;padding:5px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:4px;font-size:11px" value="' + (d.langAlphabet||"").replace(/"/g,"&quot;") + '">' +
      btn("💾", "(function(){var n=document.getElementById('v58-lang-name').value;var a=document.getElementById('v58-lang-alpha').value;var r=window.cc58SetLanguage(n,a);alert(r.msg);window.cr58RenderCulture();})()", "#0f172a") +
      '</div>' +
      '<div style="display:flex;gap:4px;margin-bottom:4px">' +
      '<input id="v58-lang-greet" type="text" placeholder="Câu chào (vd: Thiên Bình Vạn Tuế)" style="flex:1;padding:5px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:4px;font-size:11px">' +
      btn("➕ Câu Chào", "(function(){var t=document.getElementById('v58-lang-greet').value;var r=window.cc58AddGreeting(t);alert(r.msg);})()", "#0f172a") +
      '</div>' +
      '<div style="font-size:10px;color:#475569">' + (d.langGreetings||[]).slice(-3).join(" · ") + '</div>' +

      '<div style="margin-top:6px;font-size:11px;color:#94a3b8;margin-bottom:4px">Danh Xưng:</div>' +
      Object.entries(d.langTitles||{}).map(function(e){ return statRow(e[0], e[1], "#facc15"); }).join("") +
      '<div style="display:flex;gap:4px;margin-top:4px">' +
      '<input id="v58-title-role" type="text" placeholder="Vai trò (ruler/general...)" style="flex:1;padding:5px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:4px;font-size:11px">' +
      '<input id="v58-title-val" type="text" placeholder="Danh xưng" style="flex:1;padding:5px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:4px;font-size:11px">' +
      btn("💾", "(function(){var r=document.getElementById('v58-title-role').value;var v=document.getElementById('v58-title-val').value;window.cc58SetTitle(r,v);window.cr58RenderCulture();})()", "#0f172a") +
      '</div>'
    );

    html += '</div>';
    area.innerHTML = html;
  };

  // ─── RENDER: LUẬT & TƯ TƯỞNG ─────────────────────────────────
  window.cr58RenderLaw = function() {
    var d = window.civLawData || {};
    var st = typeof window.cl58GetStats === "function" ? window.cl58GetStats() : {};
    var ideos = typeof window.cl58GetIdeologies === "function" ? window.cl58GetIdeologies() : [];
    var cats = typeof window.cl58GetCategories === "function" ? window.cl58GetCategories() : [];
    var area = document.getElementById("player-hub-v28-content");
    if (!area) return;

    var html = '<div style="padding:10px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0;overflow-y:auto;max-height:calc(100vh - 160px)">';
    html += '<div style="font-size:15px;font-weight:bold;color:#a78bfa;margin-bottom:10px">⚖️ Luật Pháp & Hệ Tư Tưởng</div>';

    // HỆ TƯ TƯỞNG
    var curIdeo = typeof window.cl58GetCurrentIdeology === "function" ? window.cl58GetCurrentIdeology() : null;
    html += section("📋 Hệ Tư Tưởng",
      (curIdeo ? card('<div style="text-align:center"><div style="font-size:24px">' + curIdeo.icon + '</div><div style="font-size:13px;color:#facc15">' + curIdeo.name + '</div><div style="font-size:10px;color:#94a3b8">' + curIdeo.desc + '</div>' +
        (curIdeo.effects ? '<div style="margin-top:6px">' + Object.entries(curIdeo.effects).map(function(e){ return badge((e[1]>0?"+":" ")+e[1]+" "+e[0], e[1]>0?"#22c55e":"#ef4444"); }).join("") + '</div>' : '') +
        '</div>') : '<div style="font-size:11px;color:#64748b;margin-bottom:6px">Chưa chọn hệ tư tưởng.</div>') +
      '<div style="display:flex;flex-wrap:wrap;gap:4px">' +
      ideos.map(function(i){
        var active = curIdeo && curIdeo.id === i.id;
        return btn(i.icon + " " + i.name,
          "(function(){" + (i.id === "custom" ?
            "var n=prompt('Tên tư tưởng:');var d=prompt('Mô tả:');if(n){var r=window.cl58SetIdeology('custom',n,d);alert(r.msg);window.cr58RenderLaw();}" :
            "var r=window.cl58SetIdeology('"+i.id+"');alert(r.msg);window.cr58RenderLaw();") + "})()",
          active ? "#7c3aed" : "#0f172a");
      }).join("") +
      '</div>'
    );

    // BAN HÀNH LUẬT
    html += section("📜 Ban Hành Luật",
      '<div style="display:flex;gap:4px;margin-bottom:6px;flex-wrap:wrap">' +
      '<input id="v58-law-name" type="text" placeholder="Tên luật" style="flex:2;min-width:120px;padding:5px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:4px;font-size:11px">' +
      '<select id="v58-law-cat" style="flex:1;min-width:100px;padding:5px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:4px;font-size:11px">' +
      cats.map(function(c){ return '<option value="'+c.id+'">'+c.icon+' '+c.name+'</option>'; }).join("") +
      '</select>' +
      '</div>' +
      '<input id="v58-law-desc" type="text" placeholder="Nội dung luật" style="width:100%;margin-bottom:5px;padding:5px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:4px;font-size:11px;box-sizing:border-box">' +
      btn("📜 Ban Hành",
        "(function(){var n=document.getElementById('v58-law-name').value;var c=document.getElementById('v58-law-cat').value;var d=document.getElementById('v58-law-desc').value;var r=window.cl58EnactLaw(n,c,d,'');alert(r.msg);window.cr58RenderLaw();})()",
        "#1e3a5f") +

      '<div style="margin-top:8px">' +
      (d.laws||[]).slice(-5).reverse().map(function(l){
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px;background:#0a0f1a;border-radius:4px;margin-bottom:3px">' +
          '<span style="font-size:10px">' + l.categoryIcon + ' <b>' + l.name + '</b> <span style="color:#475569">Năm ' + l.year + '</span></span>' +
          btn("🗑", "(function(){var r=window.cl58RepealLaw('"+l.id+"');alert(r.msg);window.cr58RenderLaw();})()", "#1a0d0d") +
          '</div>';
      }).join("") +
      '<div style="font-size:10px;color:#475569">Tổng: ' + (d.laws||[]).length + ' luật</div>' +
      '</div>'
    );

    // QUYỀN CÔNG DÂN
    html += section("🤝 Quyền Công Dân",
      (typeof window.cl58GetDefaultRights === "function" ? window.cl58GetDefaultRights().slice(0, 8).map(function(r){
        var has = (d.rights||[]).indexOf(r.id) !== -1;
        return '<div style="display:flex;align-items:center;gap:6px;padding:3px 0;font-size:10px">' +
          '<span style="color:' + (has?"#22c55e":"#475569") + '">' + (has?"✅":"⬜") + '</span>' +
          '<span style="color:' + (has?"#e2e8f0":"#64748b") + '">' + r.name + '</span>' +
          '</div>';
      }).join("") : "") +
      btn("➕ Thêm Quyền",
        "(function(){var n=prompt('Tên quyền:');var d=prompt('Mô tả:');if(n){var r=window.cl58AddRight(n,d);alert(r.msg);window.cr58RenderLaw();}})()","#0f172a")
    );

    // HÌNH PHẠT
    html += section("🔒 Hình Phạt",
      Object.entries(d.punishments||{}).map(function(e){ return statRow(e[0], e[1], "#f87171"); }).join("") +
      btn("✏️ Sửa Hình Phạt",
        "(function(){var c=prompt('Tội danh:');var p=prompt('Hình phạt:');if(c&&p){window.cl58SetPunishment(c,p);window.cr58RenderLaw();}})()",
        "#1a0d0d")
    );

    html += '</div>';
    area.innerHTML = html;
  };

  // ─── RENDER: LỊCH SỬ ─────────────────────────────────────────
  window.cr58RenderHistory = function() {
    var area = document.getElementById("player-hub-v28-content");
    if (!area) return;
    var events = typeof window.ch58GetTimeline === "function" ? window.ch58GetTimeline() : [];
    var evTypes = typeof window.ch58GetEventTypes === "function" ? window.ch58GetEventTypes() : [];

    var html = '<div style="padding:10px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0;overflow-y:auto;max-height:calc(100vh - 160px)">';
    html += '<div style="font-size:15px;font-weight:bold;color:#fbbf24;margin-bottom:10px">📜 Biên Niên Sử Văn Minh</div>';

    html += section("✍️ Ghi Sự Kiện Thủ Công",
      '<div style="display:flex;gap:4px;margin-bottom:5px">' +
      '<input id="v58-hist-title" type="text" placeholder="Tên sự kiện" style="flex:2;padding:5px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:4px;font-size:11px">' +
      '<select id="v58-hist-type" style="flex:1;padding:5px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:4px;font-size:11px">' +
      evTypes.filter(function(t){ return t.id !== "founding" && t.id !== "ai_interact"; }).map(function(t){ return '<option value="'+t.id+'">'+t.icon+' '+t.name+'</option>'; }).join("") +
      '</select></div>' +
      '<input id="v58-hist-desc" type="text" placeholder="Mô tả chi tiết" style="width:100%;margin-bottom:5px;padding:5px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:4px;font-size:11px;box-sizing:border-box">' +
      btn("📜 Ghi Vào Sử",
        "(function(){var t=document.getElementById('v58-hist-title').value;var y=document.getElementById('v58-hist-type').value;var d=document.getElementById('v58-hist-desc').value;if(!t.trim()){alert('Nhập tên sự kiện!');return;}window.ch58RecordEvent(y,t,d,20);alert('✅ Đã ghi vào sử!');window.cr58RenderHistory();})()",
        "#1e3a1e")
    );

    html += '<div style="margin-bottom:6px;font-size:11px;font-weight:bold;color:#94a3b8">📖 ' + events.length + ' Sự Kiện Đã Ghi</div>';

    if (events.length === 0) {
      html += '<div style="text-align:center;color:#475569;font-size:11px;padding:20px">Chưa có sự kiện nào. Hãy thành lập văn minh và ghi lại lịch sử!</div>';
    } else {
      events.slice(0, 20).forEach(function(ev) {
        html += '<div style="display:flex;gap:8px;align-items:flex-start;padding:6px;background:#0a0f1a;border-left:3px solid ' + (ev.color||"#facc15") + ';border-radius:0 6px 6px 0;margin-bottom:5px">' +
          '<div style="min-width:24px;font-size:14px;text-align:center">' + (ev.typeIcon||"📌") + '</div>' +
          '<div style="flex:1">' +
            '<div style="font-size:11px;font-weight:bold;color:#e2e8f0">' + ev.title + '</div>' +
            '<div style="font-size:10px;color:#64748b">' + ev.typeName + ' · Năm ' + ev.year + (ev.desc ? ' · ' + ev.desc.substring(0,60) + (ev.desc.length>60?"...":"") : "") + '</div>' +
          '</div>' +
          '<div style="font-size:10px;color:' + (ev.impact>0?"#22c55e":"#f87171") + '">' + (ev.impact>0?"+":"") + ev.impact + '</div>' +
        '</div>';
      });
    }

    html += '</div>';
    area.innerHTML = html;
  };

  // ─── RENDER: ẢNH HƯỞNG ─────────────────────────────────────────
  window.cr58RenderInfluence = function() {
    var area = document.getElementById("player-hub-v28-content");
    if (!area) return;
    var inf = typeof window.ch58GetInfluenceReport === "function" ? window.ch58GetInfluenceReport() : { military:0,economic:0,cultural:0,religious:0,total:0 };
    var peak = (window.civHistoryData && window.civHistoryData.peakInfluence) || {};

    var html = '<div style="padding:10px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0;overflow-y:auto;max-height:calc(100vh - 160px)">';
    html += '<div style="font-size:15px;font-weight:bold;color:#38bdf8;margin-bottom:10px">🌐 Điểm Ảnh Hưởng</div>';

    html += card(
      '<div style="text-align:center;margin-bottom:8px"><div style="font-size:24px;font-weight:bold;color:#facc15">' + Math.round(inf.total) + '</div><div style="font-size:10px;color:#64748b">Tổng Ảnh Hưởng</div></div>' +
      statRow("Thế Lực Chủ Đạo", "🌟 " + inf.dominantName, "#facc15") +
      statRow("AI Đã Học Hỏi", inf.aiLearners + " thực thể", "#22c55e") +
      statRow("Đã Đồng Hóa", inf.assimilated + " cộng đồng", "#c084fc")
    );

    var infItems = [
      { key:"military",  name:"Quân Sự",  icon:"⚔️", color:"#ef4444" },
      { key:"economic",  name:"Kinh Tế",  icon:"💰", color:"#22c55e" },
      { key:"cultural",  name:"Văn Hóa",  icon:"🎨", color:"#c084fc" },
      { key:"religious", name:"Tôn Giáo", icon:"⛩️", color:"#60a5fa" }
    ];

    html += section("📊 Chỉ Số Ảnh Hưởng",
      infItems.map(function(it) {
        var val = Math.round(inf[it.key] || 0);
        var pk = Math.round(peak[it.key] || 0);
        return '<div style="margin-bottom:8px">' +
          '<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px">' +
            '<span style="color:' + it.color + '">' + it.icon + ' ' + it.name + '</span>' +
            '<span><b style="color:#e2e8f0">' + val + '</b><span style="color:#475569;font-size:10px">/100 (đỉnh: ' + pk + ')</span></span>' +
          '</div>' +
          bar(val, 100, it.color) +
        '</div>';
      }).join("")
    );

    html += section("⚡ Tăng Ảnh Hưởng Thủ Công",
      '<div style="display:flex;flex-wrap:wrap;gap:4px">' +
      infItems.map(function(it){
        return btn(it.icon + " +" + it.name,
          "(function(){window.ch58UpdateInfluence('"+it.key+"',5);window.cr58RenderInfluence();})()",
          "#0f172a");
      }).join("") +
      '</div>' +
      '<div style="font-size:10px;color:#475569;margin-top:4px">Ảnh hưởng tăng tự động khi ban hành luật, thêm phong tục, tương tác AI.</div>'
    );

    // AI LEARNERS LIST
    var learners = (window.civHistoryData && window.civHistoryData.aiLearners) || [];
    if (learners.length > 0) {
      html += section("🤖 Thực Thể AI Đã Học Hỏi",
        learners.slice(0, 10).map(function(l){ return badge("🤖 "+l, "#22c55e"); }).join("") +
        (learners.length > 10 ? '<div style="font-size:10px;color:#475569;margin-top:4px">...và ' + (learners.length-10) + ' thực thể khác</div>' : "")
      );
    }

    html += '</div>';
    area.innerHTML = html;
  };

  // ─── RENDER: JARVIS CIV ─────────────────────────────────────────
  window.cr58RenderJarvis = function() {
    var area = document.getElementById("player-hub-v28-content");
    if (!area) return;
    var civJ = typeof window.pc58GetJarvisAnalysis === "function" ? window.pc58GetJarvisAnalysis() : { msg:"Đang khởi động...", tips:[] };
    var histJ = typeof window.ch58GetJarvisAnalysis === "function" ? window.ch58GetJarvisAnalysis() : { tips:[], warnings:[], predictions:[], influenceReport:{} };
    var lawSt = typeof window.cl58GetStats === "function" ? window.cl58GetStats() : {};
    var cultSt = typeof window.cc58GetStats === "function" ? window.cc58GetStats() : {};

    var html = '<div style="padding:10px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0;overflow-y:auto;max-height:calc(100vh - 160px)">';
    html += '<div style="font-size:15px;font-weight:bold;color:#34d399;margin-bottom:10px">🤖 Jarvis — Cố Vấn Văn Minh</div>';

    // OVERVIEW
    var d = typeof window.pc58GetStats === "function" ? window.pc58GetStats() : {};
    if (d.founded) {
      html += card(
        '<div style="font-size:11px;color:#94a3b8;margin-bottom:4px">🏛 ' + d.name + '</div>' +
        badge(typeof window.pc58GetRaceName === "function" ? window.pc58GetRaceName(d.mainRace) : d.mainRace, "#60a5fa") +
        badge(typeof window.pc58GetCultureName === "function" ? window.pc58GetCultureName(d.mainCulture) : d.mainCulture, "#c084fc") +
        badge(lawSt.ideologyName || "Chưa có tư tưởng", "#facc15") +
        '<div style="margin-top:6px">' +
        badge("🎭 " + cultSt.customCount + " phong tục","#94a3b8") +
        badge("📜 " + lawSt.lawCount + " luật","#94a3b8") +
        badge("🌐 " + (histJ.influenceReport ? Math.round(histJ.influenceReport.total) : 0) + " ảnh hưởng","#94a3b8") +
        '</div>'
      );
    }

    // CỐ VẤN CHUNG
    if ((civJ.tips||[]).length > 0) {
      html += section("💡 Đề Xuất Phát Triển",
        civJ.tips.map(function(t){ return '<div style="font-size:11px;color:#e2e8f0;padding:5px;background:#0a0f1a;border-left:3px solid #facc15;border-radius:0 4px 4px 0;margin-bottom:4px">💡 ' + t + '</div>'; }).join("")
      );
    }

    // CẢNH BÁO
    if ((histJ.warnings||[]).length > 0) {
      html += section("⚠️ Cảnh Báo",
        histJ.warnings.map(function(w){ return '<div style="font-size:11px;color:#fca5a5;padding:5px;background:#1a0d0d;border-left:3px solid #ef4444;border-radius:0 4px 4px 0;margin-bottom:4px">⚠️ ' + w + '</div>'; }).join("")
      );
    }

    // DỰ ĐOÁN
    if ((histJ.predictions||[]).length > 0) {
      html += section("🔮 Dự Đoán Tương Lai",
        histJ.predictions.map(function(p){ return '<div style="font-size:11px;color:#c4b5fd;padding:5px;background:#120d1a;border-left:3px solid #c084fc;border-radius:0 4px 4px 0;margin-bottom:4px">🔮 ' + p + '</div>'; }).join("")
      );
    }

    if (!d.founded) {
      html += '<div style="text-align:center;color:#475569;font-size:11px;padding:30px">🤖 ' + civJ.msg + '</div>';
    }

    html += btn("🔄 Cập Nhật Phân Tích", "window.cr58RenderJarvis()", "#0f172a");

    html += '</div>';
    area.innerHTML = html;
  };

  // ─── PATCH PLAYER HUB V28 ─────────────────────────────────────
  function patchPlayerHub() {
    var _origHub = window.hubRenderPanel;
    if (typeof _origHub !== "function") return;

    window.hubRenderPanel = function(hubId) {
      _origHub(hubId);
      if (hubId !== "player-hub-v28") return;

      var panel = document.getElementById("panel-player-hub-v28");
      if (!panel) return;
      var topBar = panel.querySelector("div > div:nth-child(1) > div:nth-child(2)");
      if (!topBar) return;
      if (topBar.querySelector("[data-v58tab]")) return;

      V58_TABS.forEach(function(t) {
        var b = document.createElement("button");
        b.setAttribute("data-v58tab", t.id);
        b.innerHTML = t.icon + " " + t.label;
        b.style.cssText = "padding:5px 8px;background:transparent;border:none;border-bottom:2px solid transparent;color:#64748b;cursor:pointer;font-size:11px;white-space:nowrap;transition:all 0.2s;font-family:'Noto Serif SC',serif";
        b.onclick = function() {
          topBar.querySelectorAll("button").forEach(function(x){ x.style.borderBottomColor = "transparent"; x.style.color = "#64748b"; });
          b.style.borderBottomColor = "#facc15";
          b.style.color = "#facc15";
          currentTab = t.id;
          if (typeof window[t.fn] === "function") window[t.fn]();
        };
        topBar.appendChild(b);
      });
    };
  }

  // ─── HUB WIDGET ───────────────────────────────────────────────
  window.civV58HubRenderPanel = function() {
    var d = typeof window.pc58GetStats === "function" ? window.pc58GetStats() : {};
    var inf = typeof window.ch58GetInfluenceReport === "function" ? window.ch58GetInfluenceReport() : {};
    var html = '<div style="background:#0a0f1a;border:1px solid #1e293b;border-radius:8px;padding:10px;margin-top:8px">';
    html += '<div style="font-size:11px;font-weight:bold;color:#facc15;margin-bottom:6px">🏛 Văn Minh V58</div>';
    if (d.founded) {
      html += '<div style="display:flex;gap:4px;flex-wrap:wrap">' +
        badge(d.symbol + " " + d.name,"#facc15") +
        badge("👥 " + (d.population||0).toLocaleString(),"#22c55e") +
        badge("🌐 Inf: " + Math.round(inf.total||0),"#38bdf8") +
        badge("⭐ " + (d.prestige||0),"#f59e0b") +
      '</div>';
    } else {
      html += '<div style="font-size:10px;color:#475569">Chưa thành lập văn minh. Vào tab 🏛 Văn Minh để khai quốc.</div>';
    }
    html += '</div>';
    return html;
  };

  // ─── INIT ────────────────────────────────────────────────────
  function init() {
    patchPlayerHub();
    console.log("[CivRegistryV58] 🏛 Văn Minh V58 — 6 tabs (Văn Minh/Văn Hóa/Luật/Lịch Sử/Ảnh Hưởng/Jarvis) trong player-hub-v28 sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, INIT_DELAY); });
  } else {
    setTimeout(init, INIT_DELAY);
  }
})();
