(function() {
  "use strict";
  // ═══════════════════════════════════════════════════════════════════════════
  // PLAYER TAKEOVER PASS V126
  // Kích hoạt 5 hệ thống vô hình thành UI player có thể tương tác:
  //   1. AutoPlayerAI toggle (default OFF) trong PUOS Settings
  //   2. Player Civilization V58 — 6 tabs trong PUOS Civilization
  //   3. Memory System V64    — 3 tabs trong PUOS My Universe
  //   4. Digital Life V78     — NPC Profile modal (Personality/Goals/Beliefs/InnerLife)
  //   5. Sentient Civ V79     — 4 tabs thêm vào PUOS Civilization
  // IIFE · EXPAND ONLY · Không tạo engine mới · Init 30700ms
  // ═══════════════════════════════════════════════════════════════════════════

  const INIT_DELAY = 30700;

  // ─── TRẠNG THÁI ─────────────────────────────────────────────────────────
  var _civSection = null;   // null = show original tabs; string = show our section
  var _memTab     = 'personal';

  // ─── HELPERS ─────────────────────────────────────────────────────────────
  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function pCard(title, body, accent) {
    return '<div style="background:#0a0f1a;border:1px solid '+(accent||'#1e293b')+';border-radius:8px;padding:12px;margin-bottom:10px">'
      + '<div style="font-size:11px;font-weight:700;color:'+(accent||'#94a3b8')+';margin-bottom:8px;letter-spacing:0.5px">'+title+'</div>'
      + body + '</div>';
  }
  function pRow(label, val, color) {
    return '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11px;border-bottom:1px solid #0f172a55">'
      + '<span style="color:#64748b">'+label+'</span>'
      + '<span style="color:'+(color||'#e2e8f0')+';font-weight:600">'+esc(String(val||'—'))+'</span></div>';
  }
  function pBar(pct, color) {
    var w = Math.min(100, Math.max(0, pct || 0));
    return '<div style="background:#1e293b;border-radius:3px;height:5px;margin:2px 0">'
      + '<div style="background:'+(color||'#facc15')+';width:'+w+'%;height:100%;border-radius:3px"></div></div>';
  }
  function pTag(text, color) {
    return '<span style="background:'+(color||'#1e293b')+'22;color:'+(color||'#94a3b8')+';border:1px solid '+(color||'#94a3b8')+'44;border-radius:4px;padding:1px 6px;font-size:10px;margin:2px;display:inline-block">'+esc(text)+'</span>';
  }
  function myTabBtn(label, isActive, onclick) {
    return '<button onclick="'+onclick+'" style="padding:5px 11px;background:'+(isActive?'#1d4ed8':'transparent')+';border:1px solid '+(isActive?'#3b82f6':'#1e293b')+';border-radius:5px;color:'+(isActive?'#fff':'#64748b')+';cursor:pointer;font-size:10px;margin:2px;font-family:\'Noto Serif SC\',serif">'+label+'</button>';
  }
  function backBtn(fn) {
    return '<button onclick="'+fn+'" style="margin-bottom:12px;padding:4px 12px;background:transparent;border:1px solid #334155;border-radius:5px;color:#64748b;cursor:pointer;font-size:10px;font-family:\'Noto Serif SC\',serif">← Quay Lại</button>';
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 1. AUTO PLAYER AI — DEFAULT OFF + SETTINGS TOGGLE
  // ══════════════════════════════════════════════════════════════════════════

  window.v126ToggleAutoAI = function() {
    if (!window.autoPlayerAI) return;
    var nowEnabled = window.autoPlayerAI._v126Enabled !== false;
    if (nowEnabled) {
      window.autoPlayerAI.disable();
      window.autoPlayerAI._v126Enabled = false;
    } else {
      window.autoPlayerAI.enable();
      window.autoPlayerAI._v126Enabled = true;
    }
    // Re-render settings nếu đang mở
    var main = document.getElementById('puos-main');
    if (main && typeof window.puosRenderSettings === 'function') {
      if (main.textContent.includes('Bộ Nhớ Đang Dùng')) {
        window.puosRenderSettings(main);
      }
    }
  };

  window.v126IsAutoAIEnabled = function() {
    return window.autoPlayerAI && window.autoPlayerAI._v126Enabled !== false
           && window.autoPlayerAI._v126Enabled !== undefined
           ? window.autoPlayerAI._v126Enabled : false;
  };

  function patchSettings() {
    var _origSettings = window.puosRenderSettings;
    if (!_origSettings) { setTimeout(patchSettings, 2000); return; }
    window.puosRenderSettings = function(container) {
      _origSettings.call(this, container);
      setTimeout(function() {
        if (!container) return;
        if (!container.textContent.includes('Bộ Nhớ Đang Dùng')) return;
        if (container.querySelector('#v126-ai-toggle-card')) return;
        var targetDiv = container.querySelector('div[style*="max-width:720px"]');
        if (!targetDiv) return;
        var enabled = window.v126IsAutoAIEnabled();
        var el = document.createElement('div');
        el.id = 'v126-ai-toggle-card';
        el.className = 'puos-card';
        el.innerHTML = '<div class="puos-card-title">🤖 Trợ Lý AI Người Chơi</div>'
          + '<div class="puos-row">'
          + '<div><div class="puos-row-lbl">Auto Player AI</div>'
          + '<div style="font-size:10px;color:#334155">Tự động hóa hành động (quests, tu luyện, lãnh địa, tông môn)</div></div>'
          + '<button id="v126-ai-btn" onclick="v126ToggleAutoAI()" style="padding:6px 18px;background:'+(enabled?'#10b98122':'#1e293b')+';border:1px solid '+(enabled?'#10b981':'#334155')+';border-radius:6px;color:'+(enabled?'#10b981':'#64748b')+';cursor:pointer;font-size:11px;font-weight:700;font-family:\'Noto Serif SC\',serif;min-width:72px">'+(enabled?'✅ BẬT':'❌ TẮT')+'</button>'
          + '</div>'
          + '<div style="margin-top:6px;font-size:10px;color:#334155">💡 Khi <b style="color:#64748b">TẮT</b>: người chơi tự kiểm soát hoàn toàn tiến trình — quests, tu luyện, chinh phạt, lãnh địa.</div>';
        targetDiv.appendChild(el);
      }, 0);
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 2. PLAYER CIVILIZATION V58 — TABS TRONG PUOS CIVILIZATION
  // ══════════════════════════════════════════════════════════════════════════

  window.v126CivShow = function(section) {
    _civSection = section;
    var main = document.getElementById('puos-main');
    if (main && typeof window.puosRenderCivilization === 'function') {
      window.puosRenderCivilization(main);
    }
  };
  window.v126CivReset = function() {
    _civSection = null;
    if (typeof window.puosCivTab === 'function') window.puosCivTab('overview');
  };

  // Render V58 section bằng cách tạm thời redirect #player-hub-v28-content
  function renderV58Redirect(fnName, container) {
    var existing = document.getElementById('player-hub-v28-content');
    var tempId = 'v126-v58-temp-area';
    var tempDiv = document.createElement('div');
    tempDiv.id = 'player-hub-v28-content';
    document.body.appendChild(tempDiv);

    // Tạm ẩn element gốc nếu có
    if (existing) existing.setAttribute('data-v126-hidden', 'true');
    var origId = existing ? existing.id : null;
    if (existing) existing.id = 'player-hub-v28-content-bak';

    try {
      if (typeof window[fnName] === 'function') window[fnName]();
      if (container) container.innerHTML = tempDiv.innerHTML;
    } catch(e) {}

    document.body.removeChild(tempDiv);
    if (existing) {
      existing.id = 'player-hub-v28-content';
      existing.removeAttribute('data-v126-hidden');
    }
  }

  function renderV58Section(section) {
    var html = backBtn("v126CivReset()");
    html += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px">';
    html += myTabBtn('🏛 Văn Minh', section==='v58-core',    "v126CivShow('v58-core')");
    html += myTabBtn('🎨 Văn Hóa',  section==='v58-culture', "v126CivShow('v58-culture')");
    html += myTabBtn('⚖️ Luật & Tư Tưởng', section==='v58-law', "v126CivShow('v58-law')");
    html += myTabBtn('📜 Lịch Sử',  section==='v58-history', "v126CivShow('v58-history')");
    html += myTabBtn('🌐 Ảnh Hưởng',section==='v58-influence',"v126CivShow('v58-influence')");
    html += '</div>';
    html += '<div id="v126-v58-render-zone" style="overflow-y:auto;max-height:calc(100vh - 260px)"></div>';
    return html;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 3. SENTIENT CIV V79 — TABS TRONG PUOS CIVILIZATION
  // ══════════════════════════════════════════════════════════════════════════

  function renderV79Philosophy() {
    var philData  = window.philosophyV79Data  || {};
    var acadData  = window.academyV79Data     || {};
    var civSchools = philData.civSchools || {};
    var debates   = (philData.debates || []).slice(-8).reverse();
    var academies = (acadData.academies || []).slice(-6);

    var html = backBtn("v126CivReset()");

    var entries = Object.entries(civSchools);
    if (entries.length > 0) {
      var schBody = entries.slice(-8).map(function(e) {
        var civName = e[0], d = e[1];
        var schools = (d.schools || []);
        if (schools.length === 0) return '';
        return '<div style="margin-bottom:6px"><div style="font-size:11px;color:#facc15;margin-bottom:2px">'+esc(civName)+'</div>'
          + schools.map(function(s){ return pTag((s.icon||'')+' '+(s.label||s.id||'?'), '#7c3aed'); }).join('')
          + '</div>';
      }).join('');
      html += pCard('🎭 TRIẾT HỌC VĂN MINH', schBody || '<div style="color:#334155;font-size:11px">Chưa có học phái.</div>', '#7c3aed');
    } else {
      html += pCard('🎭 TRIẾT HỌC VĂN MINH', '<div style="color:#334155;font-size:11px">Chưa có học phái triết học nào hình thành.</div>', '#7c3aed');
    }

    if (debates.length > 0) {
      var dbBody = debates.map(function(d) {
        return '<div style="font-size:11px;color:#c4b5fd;padding:2px 0;border-bottom:1px solid #1e293b33">Năm '+(d.year||'?')+': '+esc(d.civA||'?')+' ↔ '+esc(d.civB||'?')+'</div>';
      }).join('');
      html += pCard('💬 TRANH LUẬN TƯ TƯỞNG GẦN ĐÂY', dbBody, '#7c3aed');
    }

    if (academies.length > 0) {
      var acBody = academies.map(function(a) {
        return pRow((a.icon||'🏫')+' '+(a.name||'?'), a.countryName||'?', '#3b82f6');
      }).join('');
      html += pCard('🏫 HỌC VIỆN ĐANG HOẠT ĐỘNG ('+academies.length+')', acBody, '#3b82f6');
    }
    return html;
  }

  function renderV79CollectiveMemory() {
    var ctrs = (window.countries || []).filter(function(c){ return c && c.population > 0; }).slice(0, 7);
    var html = backBtn("v126CivReset()");
    if (ctrs.length === 0) {
      return html + pCard('🧠 KÝ ỨC TẬP THỂ', '<div style="color:#334155;font-size:11px">Chưa có văn minh nào.</div>', '#06b6d4');
    }
    ctrs.forEach(function(c) {
      if (!c || !c.name) return;
      var mems = typeof window.cmem79GetTopMemories === 'function' ? window.cmem79GetTopMemories(c.name, 4) : [];
      var body = mems.length > 0
        ? mems.map(function(m) {
            return '<div style="font-size:11px;color:#a5f3fc;padding:2px 0;border-bottom:1px solid #0f172a55">Năm '+(m.year||'?')+': '+esc(m.title||'?')+'</div>';
          }).join('')
        : '<div style="font-size:10px;color:#334155">Chưa có ký ức tập thể.</div>';
      html += pCard((c.flag||'🌐')+' '+esc(c.name), body, '#06b6d4');
    });
    return html;
  }

  function renderV79CulturalIdentity() {
    var ctrs = (window.countries || []).filter(function(c){ return c && c.population > 0; }).slice(0, 6);
    var html = backBtn("v126CivReset()");
    if (ctrs.length === 0) {
      return html + pCard('🌸 BẢN SẮC VĂN HÓA', '<div style="color:#334155;font-size:11px">Chưa có văn minh nào.</div>', '#f59e0b');
    }
    ctrs.forEach(function(c) {
      if (!c || !c.name) return;
      var p = typeof window.cce79GetProfile === 'function' ? window.cce79GetProfile(c.name) : null;
      var body = '';
      if (p) {
        var cohesion = p.cohesion || 50;
        body += pRow('🤝 Đoàn Kết', cohesion + '%', cohesion >= 60 ? '#10b981' : '#ef4444');
        body += pBar(cohesion, cohesion >= 60 ? '#10b981' : '#ef4444');
        body += pRow('🌟 Bản Sắc', p.collectiveIdentity || 'Đang hình thành', '#f59e0b');
        var goals = p.nationalGoals || [];
        if (goals.length > 0) {
          body += '<div style="margin-top:4px">'
            + goals.slice(0, 3).map(function(g) {
                return pTag((g.icon||'🎯')+' '+(g.label||g), '#10b981');
              }).join('') + '</div>';
        }
        if (p.ideologicalConflicts > 0) {
          body += pRow('⚡ Xung Đột Tư Tưởng', p.ideologicalConflicts, '#ef4444');
        }
      } else {
        body = '<div style="font-size:10px;color:#334155">Chưa có dữ liệu bản sắc.</div>';
      }
      html += pCard((c.flag||'🌐')+' '+esc(c.name), body, '#f59e0b');
    });
    return html;
  }

  function renderV79LongTermGoals() {
    var ctrs = (window.countries || []).filter(function(c){ return c && c.population > 0; }).slice(0, 8);
    var html = backBtn("v126CivReset()");
    if (ctrs.length === 0) {
      return html + pCard('🎯 MỤC TIÊU DÀI HẠN', '<div style="color:#334155;font-size:11px">Chưa có văn minh nào.</div>', '#ef4444');
    }
    var goalDefs = window.CCE79_GOALS || {};
    ctrs.forEach(function(c) {
      if (!c || !c.name) return;
      var p = typeof window.cce79GetProfile === 'function' ? window.cce79GetProfile(c.name) : null;
      var goals = (p && p.nationalGoals) ? p.nationalGoals : [];
      var body = goals.length > 0
        ? goals.slice(0, 5).map(function(g) {
            var def = goalDefs[g] || {};
            return '<div style="font-size:11px;padding:3px 0;border-bottom:1px solid #0f172a55;color:#e2e8f0">'
              + (def.icon||g.icon||'🎯') + ' ' + esc(def.label || g.label || g) + '</div>';
          }).join('')
        : '<div style="font-size:10px;color:#334155">Chưa có mục tiêu dài hạn.</div>';
      html += pCard('🎯 '+esc(c.name), body, '#ef4444');
    });
    return html;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PATCH PUOS CIVILIZATION PANEL — thêm V58 + V79 tabs
  // ══════════════════════════════════════════════════════════════════════════

  function patchCivilizationPanel() {
    var _origCivRender = window.puosRenderCivilization;
    var _origCivTab    = window.puosCivTab;
    if (!_origCivRender) { setTimeout(patchCivilizationPanel, 2000); return; }

    // Khi bấm tab gốc → reset về original mode
    window.puosCivTab = function(tabId) {
      _civSection = null;
      if (_origCivTab) _origCivTab.call(this, tabId);
    };

    window.puosRenderCivilization = function(container) {
      if (_civSection) {
        // ─── MY SECTION ACTIVE ───────────────────────────────────────────
        var v58Sections = ['v58-core','v58-culture','v58-law','v58-history','v58-influence'];
        var isV58 = v58Sections.indexOf(_civSection) !== -1;

        var html = '<div class="puos-fade">';
        html += '<div style="padding:24px 32px 0">';
        html += '<div style="font-size:10px;color:#10b981;letter-spacing:3px;margin-bottom:6px">CIVILIZATION</div>';
        html += '<h1 style="font-size:22px;color:#e2e8f0;margin:0 0 14px;font-weight:400">🏛 Civilization</h1>';
        html += '</div>';

        // Full tab bar — original + thêm mới
        html += '<div class="puos-tab-bar" style="flex-wrap:wrap;gap:2px">';
        // Original tabs (click sẽ reset _civSection về null)
        ['overview','cultures','religions','knowledge','history'].forEach(function(id, i) {
          var labels = ['🌟 Tổng Quan','🎨 Văn Hóa','🛕 Tôn Giáo','📚 Tri Thức','📜 Lịch Sử'];
          html += '<button class="puos-tab" onclick="v126CivReset();setTimeout(function(){puosCivTab(\''+id+'\')},30)">'+labels[i]+'</button>';
        });
        // V58 tabs
        html += '<button class="puos-tab'+(isV58?' active':'')+'" onclick="v126CivShow(\'v58-core\')">🏛 Văn Minh Tôi</button>';
        // V79 tabs
        html += '<button class="puos-tab'+(_civSection==='v79-philosophy'?' active':'')+'" onclick="v126CivShow(\'v79-philosophy\')">🎭 Tư Tưởng</button>';
        html += '<button class="puos-tab'+(_civSection==='v79-collective-memory'?' active':'')+'" onclick="v126CivShow(\'v79-collective-memory\')">🧠 Ký Ức</button>';
        html += '<button class="puos-tab'+(_civSection==='v79-cultural-identity'?' active':'')+'" onclick="v126CivShow(\'v79-cultural-identity\')">🌸 Bản Sắc</button>';
        html += '<button class="puos-tab'+(_civSection==='v79-goals'?' active':'')+'" onclick="v126CivShow(\'v79-goals\')">🎯 Mục Tiêu</button>';
        html += '</div>';

        html += '<div style="padding:16px 32px;max-height:calc(100vh - 200px);overflow-y:auto">';
        if (isV58) {
          html += renderV58Section(_civSection);
        } else if (_civSection === 'v79-philosophy') {
          html += renderV79Philosophy();
        } else if (_civSection === 'v79-collective-memory') {
          html += renderV79CollectiveMemory();
        } else if (_civSection === 'v79-cultural-identity') {
          html += renderV79CulturalIdentity();
        } else if (_civSection === 'v79-goals') {
          html += renderV79LongTermGoals();
        }
        html += '</div></div>';
        container.innerHTML = html;

        // Sau khi render V58, gọi render function vào zone
        if (isV58) {
          setTimeout(function() {
            var zone = document.getElementById('v126-v58-render-zone');
            if (!zone) return;
            var fnMap = {
              'v58-core':'cr58RenderCore', 'v58-culture':'cr58RenderCulture',
              'v58-law':'cr58RenderLaw',   'v58-history':'cr58RenderHistory',
              'v58-influence':'cr58RenderInfluence'
            };
            renderV58Redirect(fnMap[_civSection], zone);
          }, 20);
        }

      } else {
        // ─── ORIGINAL RENDER ─────────────────────────────────────────────
        _origCivRender.call(this, container);
        // Inject extra tab buttons vào tab bar sau render
        setTimeout(function() {
          var bar = container.querySelector('.puos-tab-bar');
          if (!bar || bar.querySelector('[data-v126-tab]')) return;
          var extraTabs = [
            {label:'🏛 Văn Minh Tôi',  fn:"v126CivShow('v58-core')"},
            {label:'🎭 Tư Tưởng',      fn:"v126CivShow('v79-philosophy')"},
            {label:'🧠 Ký Ức Tập Thể', fn:"v126CivShow('v79-collective-memory')"},
            {label:'🌸 Bản Sắc',       fn:"v126CivShow('v79-cultural-identity')"},
            {label:'🎯 Mục Tiêu Dài Hạn',fn:"v126CivShow('v79-goals')"}
          ];
          extraTabs.forEach(function(t) {
            var btn = document.createElement('button');
            btn.className = 'puos-tab';
            btn.setAttribute('data-v126-tab', '1');
            btn.textContent = t.label;
            btn.onclick = new Function(t.fn);
            bar.appendChild(btn);
          });
        }, 0);
      }
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 4. MEMORY V64 — 3 TABS TRONG PUOS MY UNIVERSE
  // ══════════════════════════════════════════════════════════════════════════

  window.v126MemSwitch = function(tab) {
    _memTab = tab;
    var content = document.getElementById('v126-mem-body');
    if (content) content.innerHTML = buildMemContent(tab);
    ['personal','civilization','relationship'].forEach(function(t) {
      var btn = document.getElementById('v126-mtab-'+t);
      if (!btn) return;
      var active = t === tab;
      btn.style.background   = active ? '#1d4ed8' : 'transparent';
      btn.style.color        = active ? '#fff'    : '#64748b';
      btn.style.borderColor  = active ? '#3b82f6' : '#1e293b';
    });
  };

  function buildMemContent(tab) {
    var html = '';
    if (tab === 'personal') {
      var allProfs = typeof window.dl78GetAll === 'function' ? window.dl78GetAll() : [];
      if (allProfs.length === 0) {
        return '<div style="color:#334155;font-size:11px;padding:6px">Chưa có ký ức cá nhân nào.</div>';
      }
      allProfs.slice(0, 6).forEach(function(p) {
        var exps = (p.lifeExperiences || []).slice(0, 3);
        if (!p.name || exps.length === 0) return;
        html += '<div style="margin-bottom:8px">'
          + '<div style="font-size:11px;color:#facc15;font-weight:600">'+esc(p.name)+'</div>'
          + exps.map(function(e) {
              return '<div style="font-size:10px;color:#94a3b8;padding:1px 0">• Năm '+(e.year||'?')+': '+esc(e.title||'?')+'</div>';
            }).join('') + '</div>';
      });
      return html || '<div style="color:#334155;font-size:11px">Chưa có trải nghiệm nào được ghi lại.</div>';
    }
    if (tab === 'civilization') {
      var mems = typeof window.mem64GetRecent === 'function' ? window.mem64GetRecent(15) : [];
      if (mems.length === 0) return '<div style="color:#334155;font-size:11px;padding:6px">Chưa có ký ức văn minh nào.</div>';
      return mems.map(function(m) {
        return '<div style="font-size:11px;padding:3px 0;border-bottom:1px solid #0f172a33;color:#a5f3fc">'
          + '<span style="color:#334155">Năm '+(m.year||'?')+': </span>'+esc(m.title||'?')+'</div>';
      }).join('');
    }
    if (tab === 'relationship') {
      var d65 = window.npcLifeV65Data || {};
      var profList = Object.values(d65.profiles || {}).filter(function(p) {
        return p && p.relationships && Object.keys(p.relationships).length > 0;
      }).slice(0, 7);
      if (profList.length === 0) return '<div style="color:#334155;font-size:11px;padding:6px">Chưa có dữ liệu quan hệ NPC.</div>';
      return profList.map(function(p) {
        var rels = Object.values(p.relationships || {}).slice(0, 3);
        return '<div style="margin-bottom:6px">'
          + '<div style="font-size:11px;color:#facc15;font-weight:600">'+esc(p.name||'?')+'</div>'
          + rels.map(function(r) {
              return '<div style="font-size:10px;color:#94a3b8">• '+esc(r.type||'quan hệ')+' với '+esc(r.targetName||'?')+'</div>';
            }).join('') + '</div>';
      }).join('');
    }
    return '';
  }

  function injectMemorySection(container) {
    setTimeout(function() {
      if (!container || container.querySelector('#v126-mem-section')) return;
      var memStats = typeof window.mem64GetStats === 'function' ? window.mem64GetStats() : {};
      var total = memStats.total || 0;

      var el = document.createElement('div');
      el.id = 'v126-mem-section';
      el.style.cssText = 'padding:0 32px 20px';
      el.innerHTML = '<div style="font-size:10px;color:#4a5568;letter-spacing:2px;margin-bottom:8px;margin-top:12px">KÝ ỨC THẾ GIỚI · V64 MEMORY SYSTEM</div>'
        + '<div style="background:#0a0f1a;border:1px solid #1e293b;border-radius:8px;padding:12px">'
        + '<div style="display:flex;gap:6px;margin-bottom:10px;align-items:center">'
        + '<button id="v126-mtab-personal" onclick="v126MemSwitch(\'personal\')" style="padding:4px 10px;background:#1d4ed8;border:1px solid #3b82f6;border-radius:5px;color:#fff;cursor:pointer;font-size:10px;font-family:\'Noto Serif SC\',serif">👤 Cá Nhân</button>'
        + '<button id="v126-mtab-civilization" onclick="v126MemSwitch(\'civilization\')" style="padding:4px 10px;background:transparent;border:1px solid #1e293b;border-radius:5px;color:#64748b;cursor:pointer;font-size:10px;font-family:\'Noto Serif SC\',serif">🏛 Văn Minh</button>'
        + '<button id="v126-mtab-relationship" onclick="v126MemSwitch(\'relationship\')" style="padding:4px 10px;background:transparent;border:1px solid #1e293b;border-radius:5px;color:#64748b;cursor:pointer;font-size:10px;font-family:\'Noto Serif SC\',serif">🤝 Quan Hệ</button>'
        + '<span style="margin-left:auto;font-size:10px;color:#334155">'+total+' ký ức</span>'
        + '</div>'
        + '<div id="v126-mem-body" style="max-height:180px;overflow-y:auto">'+buildMemContent('personal')+'</div>'
        + '</div>';
      container.appendChild(el);
    }, 60);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 5. DIGITAL LIFE V78 — NPC PROFILE MODAL + LIST TRONG MY UNIVERSE
  // ══════════════════════════════════════════════════════════════════════════

  window.v126OpenNpcProfile = function(npcName) {
    var existing = document.getElementById('v126-npc-modal');
    if (existing) existing.remove();

    var npc   = (window.npcs||[]).find(function(n){ return n && n.name === npcName; }) || { name: npcName };
    var dl    = typeof window.dl78GetProfile    === 'function' ? window.dl78GetProfile(npcName)    : null;
    var pe    = typeof window.pe78GetDimensions === 'function' ? window.pe78GetDimensions(npcName) : null;
    var sr    = typeof window.sr78GetReflections=== 'function' ? window.sr78GetReflections(npcName): [];
    var cs    = typeof window.cs78GetState      === 'function' ? window.cs78GetState(npcName)      : null;
    var ideo  = typeof window.ideo78GetNPCIdeology==='function'? window.ideo78GetNPCIdeology(npcName): null;
    var life  = (window.npcLifeV65Data||{}).profiles ? window.npcLifeV65Data.profiles['npc_'+npcName] : null;

    var html = '';

    // ─── Header ─────────────────────────────────────────────────────────
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">';
    html += '<div>';
    html += '<div style="font-size:20px;font-weight:700;color:#facc15">'+esc(npcName)+'</div>';
    html += '<div style="font-size:11px;color:#64748b;margin-top:2px">';
    if (npc.realm !== undefined) html += 'Tu Vi: '+npc.realm+' · ';
    if (life && life.career) html += 'Nghề: '+esc(life.career)+' · ';
    if (life && life.dream) html += 'Ước Mơ: '+esc(life.dream)+' · ';
    html += 'Năm '+(window.year||1);
    html += '</div></div>';
    html += '<button onclick="document.getElementById(\'v126-npc-modal\').remove()" '
      + 'style="padding:5px 14px;background:transparent;border:1px solid #334155;border-radius:6px;color:#64748b;cursor:pointer;font-size:12px">✕ Đóng</button>';
    html += '</div>';

    // ─── Triết Học & Niềm Tin ───────────────────────────────────────────
    if (dl) {
      var goalsArr = dl.personalGoals || [];
      var valArr   = dl.coreValues    || [];
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">';

      var philBody = pRow('Triết Học', (dl.philosophy ? (dl.philosophy.icon||'')+' '+(dl.philosophy.label||dl.philosophy) : '—'), '#c4b5fd')
        + pRow('Nhận Thức', (dl.awareness||0)+'%', '#c4b5fd')
        + pBar(dl.awareness||0, '#7c3aed')
        + (valArr.length > 0
          ? '<div style="margin-top:4px">'+valArr.slice(0,5).map(function(v){ return pTag(v.icon||v, '#f59e0b'); }).join('')+'</div>'
          : '');
      html += '<div>' + pCard('🧠 TRIẾT HỌC & NIỀM TIN', philBody, '#7c3aed') + '</div>';

      var goalBody = goalsArr.length > 0
        ? goalsArr.slice(0,5).map(function(g){
            return '<div style="font-size:11px;color:#86efac;padding:2px 0">🎯 '+esc(g.label||g.goal||g)+'</div>';
          }).join('')
        : '<div style="color:#334155;font-size:11px">Chưa có mục tiêu rõ ràng.</div>';
      html += '<div>' + pCard('🎯 MỤC TIÊU CÁ NHÂN', goalBody, '#10b981') + '</div>';
      html += '</div>';
    }

    // ─── Tính Cách (V78 Personality Dimensions) ─────────────────────────
    if (pe && typeof pe === 'object') {
      var dims = Object.entries(pe);
      if (dims.length > 0) {
        var dimHtml = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">'
          + dims.slice(0,10).map(function(entry) {
              var k = entry[0], v = entry[1];
              var pct = Math.round(((v + 50) / 100) * 100);
              return '<div style="font-size:10px">'
                + '<div style="display:flex;justify-content:space-between;color:#94a3b8"><span>'+esc(k)+'</span><span style="color:'+(v>0?'#10b981':'#ef4444')+'">'+v+'</span></div>'
                + pBar(pct, v > 0 ? '#10b981' : '#ef4444') + '</div>';
            }).join('')
          + '</div>';
        html += pCard('🎭 TÍNH CÁCH (Personality Matrix)', dimHtml, '#3b82f6');
      }
    }

    // ─── Suy Nghĩ Nội Tâm (V78 Consciousness) ──────────────────────────
    if (cs) {
      var innerStates = window.CS78_INNER_STATES || {};
      var stDef = innerStates[cs.innerState] || {};
      var innerVoice = typeof window.cs78GenerateInnerVoice === 'function' ? window.cs78GenerateInnerVoice(npcName) : '';
      var thoughts = (cs.recentThoughts || []).slice(0, 4);
      var csBody = pRow('Trạng Thái Nội Tâm', (stDef.icon||'')+' '+(stDef.label||cs.innerState||'?'), '#f59e0b')
        + pRow('Động Lực Cốt Lõi', cs.motivationCore||'?', '#94a3b8');
      if (innerVoice) {
        csBody += '<div style="font-size:10px;color:#94a3b8;font-style:italic;margin:6px 0;padding:6px;background:#0f172a;border-radius:4px;border-left:2px solid #f59e0b">"'+esc(innerVoice)+'"</div>';
      }
      if (thoughts.length > 0) {
        csBody += '<div style="margin-top:4px">'
          + thoughts.map(function(t){ return '<div style="font-size:10px;color:#64748b;padding:1px 0">• '+esc(t.text||t)+'</div>'; }).join('')
          + '</div>';
      }
      html += pCard('💭 SUY NGHĨ NỘI TÂM', csBody, '#f59e0b');
    }

    // ─── Hệ Tư Tưởng ────────────────────────────────────────────────────
    if (ideo) {
      var idBody = pRow('Tư Tưởng', (ideo.icon||'')+' '+esc(ideo.label||ideo.id||'?'), '#ef4444')
        + pRow('Năm Tiếp Nhận', ideo.adoptedYear||'?', '#64748b')
        + (ideo.description ? '<div style="font-size:10px;color:#64748b;margin-top:4px">'+esc(ideo.description)+'</div>' : '');
      html += pCard('⚖️ HỆ TƯ TƯỞNG', idBody, '#ef4444');
    }

    // ─── Nhật Ký Tự Chiếu (Self Reflection) ─────────────────────────────
    if (sr && sr.length > 0) {
      var srHtml = sr.slice(0, 4).map(function(r) {
        return '<div style="padding:4px 0;border-bottom:1px solid #0f172a44">'
          + '<div style="font-size:11px;color:#a78bfa;font-weight:600">Năm '+(r.year||'?')+': '+esc(r.title||'Phản Chiếu')+'</div>'
          + '<div style="font-size:10px;color:#64748b;margin-top:1px">'+esc(r.content||r.text||'')+'</div>'
          + '</div>';
      }).join('');
      html += pCard('📔 NHẬT KÝ TỰ CHIẾU', srHtml, '#8b5cf6');
    }

    // ─── Trải Nghiệm Cuộc Đời ────────────────────────────────────────────
    if (dl && (dl.lifeExperiences||[]).length > 0) {
      var expHtml = dl.lifeExperiences.slice(0, 6).map(function(e) {
        return '<div style="font-size:10px;color:#94a3b8;padding:2px 0;border-bottom:1px solid #0f172a33">'
          + '<span style="color:#334155">Năm '+(e.year||'?')+':</span> '+esc(e.title||'?')+'</div>';
      }).join('');
      html += pCard('✨ TRẢI NGHIỆM CUỘC ĐỜI', expHtml, '#06b6d4');
    }

    if (!dl && !cs && !ideo && (!sr || sr.length === 0)) {
      html += pCard('ℹ️ THÔNG TIN', '<div style="color:#334155;font-size:11px">Digital Life V78 chưa khởi tạo profile cho NPC này. Hệ thống sẽ tạo sau vài tick.</div>', '#334155');
    }

    // ─── Modal Wrapper ────────────────────────────────────────────────────
    var modal = document.createElement('div');
    modal.id = 'v126-npc-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,5,0.87);z-index:99999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)';
    modal.innerHTML = '<div style="width:min(700px,95vw);max-height:88vh;overflow-y:auto;background:#0d1117;border:1px solid #1e3a5f;border-radius:12px;padding:24px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0;box-shadow:0 0 60px rgba(30,58,95,0.6)">'
      + html + '</div>';
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
  };

  function injectNpcDigitalLifeSection(container) {
    setTimeout(function() {
      if (!container || container.querySelector('#v126-npc-dl-section')) return;
      var npcs = (window.npcs || []).filter(function(n){ return n && n.name; }).slice(0, 12);
      if (npcs.length === 0) return;

      var listHtml = npcs.map(function(n) {
        var dl = typeof window.dl78GetProfile === 'function' ? window.dl78GetProfile(n.name) : null;
        var philLabel = (dl && dl.philosophy) ? (dl.philosophy.icon||'') + ' ' + (dl.philosophy.label||dl.philosophy) : '—';
        var cs = typeof window.cs78GetState === 'function' ? window.cs78GetState(n.name) : null;
        var stIcon = '';
        if (cs && cs.innerState && window.CS78_INNER_STATES && window.CS78_INNER_STATES[cs.innerState]) {
          stIcon = window.CS78_INNER_STATES[cs.innerState].icon + ' ';
        }
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #0f172a44;font-size:11px">'
          + '<div><span style="color:#e2e8f0">'+stIcon+esc(n.name)+'</span>'
          + '<span style="color:#334155;font-size:10px;margin-left:6px">'+esc(philLabel)+'</span></div>'
          + '<button onclick="v126OpenNpcProfile(\''+esc(n.name)+'\')" style="padding:2px 9px;background:#7c3aed22;border:1px solid #7c3aed44;border-radius:4px;color:#c4b5fd;cursor:pointer;font-size:9px;font-family:\'Noto Serif SC\',serif;white-space:nowrap">🧠 Tâm Linh</button>'
          + '</div>';
      }).join('');

      var el = document.createElement('div');
      el.id = 'v126-npc-dl-section';
      el.style.cssText = 'padding:0 32px 24px';
      el.innerHTML = '<div style="font-size:10px;color:#4a5568;letter-spacing:2px;margin-bottom:8px;margin-top:8px">NPC TÂM LINH · DIGITAL LIFE V78</div>'
        + '<div style="background:#0a0f1a;border:1px solid #1e293b;border-radius:8px;padding:10px">'
        + '<div style="font-size:10px;color:#334155;margin-bottom:8px">Nhấn 🧠 <b style="color:#7c3aed">Tâm Linh</b> để xem triết học, mục tiêu, niềm tin, suy nghĩ nội tâm và nhật ký tự chiếu của NPC</div>'
        + listHtml + '</div>';
      container.appendChild(el);
    }, 90);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PATCH PUOS MY UNIVERSE — Memory V64 + NPC Digital Life V78
  // ══════════════════════════════════════════════════════════════════════════

  function patchMyUniverse() {
    var _origMU = window.puosRenderMyUniverse;
    if (!_origMU) { setTimeout(patchMyUniverse, 2000); return; }
    window.puosRenderMyUniverse = function(container) {
      _origMU.call(this, container);
      injectMemorySection(container);
      injectNpcDigitalLifeSection(container);
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // INIT
  // ══════════════════════════════════════════════════════════════════════════

  function init() {
    // 1. Auto AI DEFAULT OFF
    setTimeout(function() {
      if (window.autoPlayerAI && typeof window.autoPlayerAI.disable === 'function') {
        window.autoPlayerAI.disable();
        window.autoPlayerAI._v126Enabled = false;
        // Ẩn nút floating cũ
        var oldBtn = document.getElementById('autoAI-toggle-btn');
        if (oldBtn) oldBtn.style.display = 'none';
        console.log('[PlayerTakeoverV126] 🤖 Auto Player AI mặc định TẮT — player tự kiểm soát tiến trình');
      }
    }, 500);

    // 2. Patch PUOS Settings
    patchSettings();

    // 3. Patch PUOS Civilization (V58 + V79)
    patchCivilizationPanel();

    // 4+5. Patch PUOS My Universe (Memory V64 + NPC Digital Life V78)
    patchMyUniverse();

    console.log('[PlayerTakeoverV126] ✅ Player Takeover Pass V126 hoàn tất:'
      + ' AI OFF · V58 Civ 5 tabs · V64 Memory 3 tabs · V78 NPC Profile modal · V79 Philosophy/Ký Ức/Bản Sắc/Mục Tiêu');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, INIT_DELAY); });
  } else {
    setTimeout(init, INIT_DELAY);
  }
})();
