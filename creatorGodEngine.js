/* ============================================================
   CREATOR GOD ENGINE — v1.0
   Divine Intervention Panel for Creator God V6
   Integrated into duan2 v17

   Features:
   - ⚡ Heavenly Tribulation (cast on NPC)
   - 🙏 Divine Blessing (grant talent/luck/cultivation boost)
   - 📜 Divine Revelation (send prophecy to NPC)
   - 📣 World Announcement (broadcast to all)
   - 📖 Divine History (all interventions logged)
   ============================================================ */

// ============================================================
// STATE
// ============================================================

window.creatorGodHistory = window.creatorGodHistory || [];   // Persistent log of all interventions
window.creatorGodUnlocked = window.creatorGodUnlocked || false;

// ============================================================
// SAVE / LOAD INTEGRATION
// Patch into app.js save/load so data persists
// ============================================================

(function patchSaveLoad() {
  function tryPatch() {
    // Patch save()
    const _origSave = window.save;
    if (typeof _origSave === 'function' && !window._cgSavePatched) {
      window._cgSavePatched = true;
      window.save = function() {
        _origSave.apply(this, arguments);
        try {
          localStorage.setItem('cgv6_creatorGodHistory', JSON.stringify((window.creatorGodHistory || []).slice(0, 300)));
          localStorage.setItem('cgv6_creatorGodUnlocked', window.creatorGodUnlocked ? '1' : '0');
        } catch(e) {}
      };
    }

    // Patch load()
    const _origLoad = window.load;
    if (typeof _origLoad === 'function' && !window._cgLoadPatched) {
      window._cgLoadPatched = true;
      window.load = function() {
        _origLoad.apply(this, arguments);
        try {
          const hist = localStorage.getItem('cgv6_creatorGodHistory');
          window.creatorGodHistory = hist ? JSON.parse(hist) : [];
          window.creatorGodUnlocked = localStorage.getItem('cgv6_creatorGodUnlocked') === '1';
          // Auto-show tab if was unlocked before
          if (window.creatorGodUnlocked) _showCreatorGodTab();
        } catch(e) {}
      };
    }
  }

  // Try immediately and after DOM ready
  tryPatch();
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(tryPatch, 600);
    // Also load saved state on first init
    try {
      const hist = localStorage.getItem('cgv6_creatorGodHistory');
      window.creatorGodHistory = hist ? JSON.parse(hist) : [];
      window.creatorGodUnlocked = localStorage.getItem('cgv6_creatorGodUnlocked') === '1';
      if (window.creatorGodUnlocked) setTimeout(_showCreatorGodTab, 700);
    } catch(e) {}
  });
})();


// ============================================================
// HELPERS
// ============================================================

function _cgNow() {
  return (typeof year !== 'undefined') ? year : 0;
}

function _cgNpcs() {
  return (typeof npcs !== 'undefined') ? npcs : [];
}

function _cgAddHistory(action, targetName, detail, result) {
  window.creatorGodHistory.unshift({
    id:         Date.now(),
    year:       _cgNow(),
    action,
    targetName: targetName || '天地',
    detail,
    result
  });
  if (window.creatorGodHistory.length > 300) window.creatorGodHistory.pop();
}

function _cgLog(text) {
  if (typeof addLog === 'function') addLog(text, 'important');
}

function _cgToast(text) {
  if (typeof toast === 'function') toast(text);
}

function _cgSave() {
  if (typeof save === 'function') save();
  try {
    localStorage.setItem('cgv6_creatorGodHistory', JSON.stringify((window.creatorGodHistory || []).slice(0, 300)));
    localStorage.setItem('cgv6_creatorGodUnlocked', window.creatorGodUnlocked ? '1' : '0');
  } catch(e) {}
}

function _cgAddWorldHistory(type, desc, extra) {
  if (typeof addWorldHistory === 'function') addWorldHistory(type, desc, extra || {});
}

function _showCreatorGodTab() {
  const btn = document.getElementById('btn-creator-god');
  if (btn) {
    btn.style.display = '';
    btn.classList.remove('ec-hidden');
  }
}


// ============================================================
// UNLOCK: Creator God Mode
// ============================================================

window.creatorGodUnlock = function() {
  window.creatorGodUnlocked = true;
  _showCreatorGodTab();
  _cgLog('👁 Thiên Đạo Thức Tỉnh — Đấng Tạo Hóa đã lâm thế!');
  _cgAddWorldHistory('creator_god', 'Đấng Tạo Hóa lâm thế, nắm quyền sinh sát thiên địa.', {});
  _cgAddHistory('UNLOCK', null, 'Creator God Mode được kích hoạt', 'Đấng Tạo Hóa đã lâm thế');
  _cgSave();
  if (typeof showPanel === 'function') showPanel('creator-god');
  window.renderCreatorGodPanel();
};


// ============================================================
// ⚡ HEAVENLY TRIBULATION
// ============================================================

window.cgCastTribulation = function(npcId) {
  const npc = (typeof npcById === 'function') ? npcById(parseInt(npcId)) : null;
  if (!npc || npc.status !== 'alive') {
    _cgToast('⚠️ Không tìm thấy tu sĩ này.');
    return;
  }

  const roll = Math.random();
  let resultText, resultLabel;

  if (roll < 0.20) {
    // Breakthrough
    if (npc.realm < (typeof REALMS !== 'undefined' ? REALMS.length - 1 : 8)) {
      npc.realm++;
      if (typeof applyRealmBonus === 'function') applyRealmBonus(npc);
      const rName = (typeof REALMS !== 'undefined') ? REALMS[npc.realm].name : `Cảnh Giới ${npc.realm}`;
      npc.biography && npc.biography.push({ year: _cgNow(), event: `Nhận Thiên Kiếp của Tạo Hóa — đột phá ${rName}.` });
      resultLabel = '✨ ĐỘT PHÁ';
      resultText = `${npc.name} vượt kiếp thành công, đột phá ${rName}!`;
    } else {
      resultLabel = '✨ VIÊN MÃN';
      resultText = `${npc.name} đã đạt đỉnh cảnh giới, Thiên Kiếp không lay chuyển.`;
    }
  } else if (roll < 0.45) {
    // Enlightenment — exp boost
    npc.realmProgress = (npc.realmProgress || 0) + 2000;
    npc.karma = Math.min(100, (npc.karma || 0) + 20);
    npc.biography && npc.biography.push({ year: _cgNow(), event: `Thiên Kiếp mang đến đại ngộ, công lực tăng vọt.` });
    resultLabel = '💡 ĐẠI NGỘ';
    resultText = `${npc.name} nhận đại ngộ, tu vi tiến bộ vượt bậc!`;
  } else if (roll < 0.70) {
    // Severe injury
    npc.hp = Math.max(1, Math.floor(npc.maxHp * 0.10));
    npc.biography && npc.biography.push({ year: _cgNow(), event: `Chịu Thiên Kiếp nặng nề, trọng thương gần tử.` });
    resultLabel = '🩸 TRỌNG THƯƠNG';
    resultText = `${npc.name} bị trọng thương nặng, sinh lực còn 10%!`;
  } else {
    // Death
    npc.biography && npc.biography.push({ year: _cgNow(), event: `Không vượt qua Thiên Kiếp, thân tử đạo tiêu.` });
    if (typeof killNPC === 'function') {
      killNPC(npc, 'Thiên Kiếp của Tạo Hóa giáng xuống', null, false);
    } else {
      npc.status = 'dead';
    }
    resultLabel = '☠️ TỬ VONG';
    resultText = `${npc.name} không vượt qua Thiên Kiếp, thân vẫn!`;
  }

  _cgLog(`⚡ Tạo Hóa giáng Thiên Kiếp: ${npc.name} — ${resultLabel}`);
  _cgAddWorldHistory('tribulation', `${npc.name} chịu Thiên Kiếp Tạo Hóa — ${resultLabel}`, { npcId: npc.id, npcName: npc.name });
  _cgAddHistory('⚡ THIÊN KIẾP', npc.name, `Giáng kiếp lên ${npc.name}`, `${resultLabel}: ${resultText}`);
  _cgToast(`⚡ ${resultLabel} — ${resultText}`);

  if (typeof renderAll === 'function') renderAll();
  _cgSave();
  window.renderCreatorGodPanel();
};


// ============================================================
// 🙏 DIVINE BLESSING
// ============================================================

window.cgGrantBlessing = function(npcId, blessingType) {
  const npc = (typeof npcById === 'function') ? npcById(parseInt(npcId)) : null;
  if (!npc || npc.status !== 'alive') {
    _cgToast('⚠️ Không tìm thấy tu sĩ này.');
    return;
  }

  let desc, detail;

  switch(blessingType) {
    case 'talent':
      npc.rootPower = Math.min(8, (npc.rootPower || 1) + 2);
      npc.attack  = Math.floor((npc.attack  || 10) * 1.3);
      npc.defense = Math.floor((npc.defense || 5)  * 1.3);
      npc.maxHp   = Math.floor((npc.maxHp   || 100)* 1.3);
      npc.hp      = npc.maxHp;
      desc = '⚡ Thiên Tư Thức Tỉnh';
      detail = `Căn cơ +2, công/phòng/HP tăng 30%`;
      npc.biography && npc.biography.push({ year: _cgNow(), event: `Tạo Hóa ban Thiên Tư — căn cơ và thực lực đại tăng.` });
      break;

    case 'luck':
      npc.luck = Math.min(100, (npc.luck || 50) + 30);
      npc.fate = npc.luck > 80 ? 'Thiên Mệnh' : 'Bình Thường';
      npc.karma = Math.min(100, (npc.karma || 0) + 25);
      npc.wealth = (npc.wealth || 0) + 5000;
      desc = '🌠 Khí Vận Tăng Vọt';
      detail = `Khí Vận +30, Nghiệp Lực +25, Tài Phú +5000`;
      npc.biography && npc.biography.push({ year: _cgNow(), event: `Tạo Hóa ban khí vận — vận mệnh đổi thay, phúc lộc dồi dào.` });
      break;

    case 'cultivation':
      npc.realmProgress = (npc.realmProgress || 0) + 5000;
      // Also boost speed multiplier temporarily via flag
      npc._cgCultBoost = (_cgNow() + 50); // boost expires at year+50
      desc = '🔥 Tu Tốc Đột Phá';
      detail = `Kinh nghiệm tu luyện +5000, tốc độ tu luyện x3 trong 50 năm`;
      npc.biography && npc.biography.push({ year: _cgNow(), event: `Tạo Hóa ban tu tốc — công lực tiến bộ như vũ bão.` });
      // Try to trigger breakthrough
      if (typeof attemptBreakthrough === 'function') {
        setTimeout(() => { try { attemptBreakthrough(npc); } catch(e) {} }, 100);
      }
      break;

    default:
      _cgToast('⚠️ Loại phúc lành không hợp lệ.');
      return;
  }

  _cgLog(`🙏 Tạo Hóa ban phúc ${desc} cho ${npc.name}!`);
  _cgAddWorldHistory('divine_blessing', `${npc.name} nhận Thần Ân Tạo Hóa — ${desc}`, { npcId: npc.id, npcName: npc.name });
  _cgAddHistory('🙏 THẦN ÂN', npc.name, desc, detail);
  _cgToast(`🙏 ${desc} — ${npc.name} nhận thần ân!`);

  if (typeof renderAll === 'function') renderAll();
  _cgSave();
  window.renderCreatorGodPanel();
};


// ============================================================
// 📜 DIVINE REVELATION
// ============================================================

window.cgSendRevelation = function(npcId, revelationType) {
  const npc = (typeof npcById === 'function') ? npcById(parseInt(npcId)) : null;
  if (!npc || npc.status !== 'alive') {
    _cgToast('⚠️ Không tìm thấy tu sĩ này.');
    return;
  }

  let action, desc, effect;
  const rName = (typeof REALMS !== 'undefined' && npc.realm >= 0) ? REALMS[npc.realm].name : '';

  switch(revelationType) {
    case 'found_sect': {
      // Create a new sect led by this NPC
      const sectName = `${npc.family || npc.name} Tông`;
      const newSect = {
        id:         `cg_sect_${npc.id}_${Date.now()}`,
        name:       sectName,
        founder:    npc.id,
        leader:     npc.id,
        elders:     [npc.id],
        members:    [npc.id],
        disciples:  [],
        prestige:   200 + (npc.realm || 0) * 100,
        treasury:   (npc.wealth || 0) + 1000,
        territory:  npc.region || '🗻 Đông Vực',
        level:      1,
        warCooldown: 0,
        foundedYear: _cgNow(),
        foundedBy:   npc.name,
      };
      if (typeof sects !== 'undefined') sects.push(newSect);
      npc.sectId = newSect.id;
      action = '🏛 Lập Tông';
      desc   = `${npc.name} lập ${sectName} theo Thiên Khải`;
      effect = `Tông môn ${sectName} được khai sáng tại ${npc.region}`;
      npc.biography && npc.biography.push({ year: _cgNow(), event: `Nhận Thiên Khải Tạo Hóa — lập ${sectName}.` });
      break;
    }

    case 'found_country': {
      if (typeof countries === 'undefined') { _cgToast('⚠️ Hệ thống quốc gia chưa khả dụng.'); return; }
      const ctryName = `${npc.family || npc.name} Quốc`;
      const newCountry = {
        id:           `cg_country_${npc.id}_${Date.now()}`,
        name:         ctryName,
        ruler:        npc.id,
        rulerName:    npc.name,
        territory:    npc.region || '🗻 Đông Vực',
        population:   1000,
        army:         500,
        treasury:     (npc.wealth || 0) + 5000,
        prestige:     300 + (npc.realm || 0) * 150,
        collapsed:    false,
        foundedYear:  _cgNow(),
        tech:         1,
        warCooldown:  0,
      };
      countries.push(newCountry);
      npc.country = ctryName;
      action = '👑 Lập Quốc';
      desc   = `${npc.name} lập ${ctryName} theo Thiên Khải`;
      effect = `Quốc gia ${ctryName} khai quốc tại ${npc.region}`;
      npc.biography && npc.biography.push({ year: _cgNow(), event: `Nhận Thiên Khải Tạo Hóa — lập ${ctryName}.` });
      // Trigger EC sidebar update
      if (typeof ecRenderDynamicSidebar === 'function') setTimeout(ecRenderDynamicSidebar, 200);
      break;
    }

    case 'seek_treasure': {
      // Grant a legendary artifact
      if (typeof rollArtifact === 'function' && typeof grantArtifact === 'function') {
        const artifact = rollArtifact('legendary') || rollArtifact('epic');
        if (artifact) {
          grantArtifact(npc, artifact, 'Thiên Khải Tạo Hóa');
          effect = `Nhận ${artifact.name} theo lời Thiên Khải`;
        } else {
          effect = 'Tìm được bí ẩn trong thiên địa';
        }
      } else {
        // Fallback: give wealth + exp
        npc.wealth = (npc.wealth || 0) + 10000;
        npc.realmProgress = (npc.realmProgress || 0) + 3000;
        effect = 'Nhận 10000 tài phú và 3000 tu vi kinh nghiệm';
      }
      action = '🔍 Tìm Bảo';
      desc   = `${npc.name} lên đường tìm bảo theo Thiên Khải`;
      npc.biography && npc.biography.push({ year: _cgNow(), event: `Thiên Khải Tạo Hóa dẫn đường — tìm được kỳ bảo.` });
      break;
    }

    case 'start_war': {
      if (typeof sects === 'undefined' || sects.length < 2) {
        _cgToast('⚠️ Cần ít nhất 2 tông môn để phát động chiến tranh.');
        return;
      }
      // Find a rival sect
      const mySect = sects.find(s => s.id === npc.sectId);
      const rival  = sects.find(s => s.id !== npc.sectId && !s.collapsed);
      if (!rival) { _cgToast('⚠️ Không tìm được đối thủ.'); return; }

      // Boost this NPC for war
      npc.attack  = Math.floor((npc.attack || 10) * 1.5);
      npc.karma   = Math.max(-100, (npc.karma || 0) - 20);
      const rivalName = mySect ? mySect.name : (npc.sectId || 'Thế Lực');

      if (typeof addTimeline === 'function') {
        addTimeline(`⚔️ ${npc.name} phát động chiến tranh theo Thiên Khải — tấn công ${rival.name}`, 'war', '⚔️');
      }
      action = '⚔️ Phát Chiến';
      desc   = `${npc.name} phát động chiến tranh chống ${rival.name} theo Thiên Khải`;
      effect = `Công kích +50%, karma -20. Chiến tranh bắt đầu!`;
      npc.biography && npc.biography.push({ year: _cgNow(), event: `Thiên Khải Tạo Hóa khiến ta phát chiến — tấn công ${rival.name}.` });
      break;
    }

    default:
      _cgToast('⚠️ Loại thiên khải không hợp lệ.');
      return;
  }

  _cgLog(`📜 Tạo Hóa ban Thiên Khải ${action} cho ${npc.name}!`);
  _cgAddWorldHistory('divine_revelation', `${npc.name} nhận Thiên Khải Tạo Hóa — ${action}`, { npcId: npc.id, npcName: npc.name });
  _cgAddHistory('📜 THIÊN KHẢI', npc.name, desc, effect);
  _cgToast(`📜 ${action} — ${desc}`);

  if (typeof renderAll === 'function') renderAll();
  _cgSave();
  window.renderCreatorGodPanel();
};


// ============================================================
// 📣 WORLD ANNOUNCEMENT
// ============================================================

window.cgWorldAnnouncement = function(message) {
  const msg = (message || '').trim();
  if (!msg) { _cgToast('⚠️ Vui lòng nhập nội dung Thiên Đạo thông điệp.'); return; }

  const fullMsg = `📣 [Thiên Đạo Thông Điệp — Năm ${_cgNow()}] ${msg}`;
  _cgLog(fullMsg);
  _cgAddWorldHistory('world_announcement', fullMsg, {});
  if (typeof addTimeline === 'function') addTimeline(fullMsg, 'important', '📣');
  _cgAddHistory('📣 THÔNG ĐIỆP', 'Thiên Địa', msg, 'Đã truyền khắp thiên hạ');
  _cgToast('📣 Thiên Đạo thông điệp đã lan khắp thiên hạ!');

  // Clear input
  const el = document.getElementById('cg-announcement-input');
  if (el) el.value = '';

  _cgSave();
  window.renderCreatorGodPanel();
};


// ============================================================
// 🎨 PANEL RENDERER
// ============================================================

window.renderCreatorGodPanel = function() {
  const container = document.getElementById('panel-creator-god');
  if (!container) return;

  const aliveNpcs = _cgNpcs().filter(n => n.status === 'alive');
  const realmName = (typeof REALMS !== 'undefined') ? (r) => REALMS[r] ? REALMS[r].name : `R${r}` : (r) => `R${r}`;

  // Sort NPCs by realm desc for dropdown
  const sortedNpcs = [...aliveNpcs].sort((a, b) => (b.realm || 0) - (a.realm || 0));

  const npcOptions = sortedNpcs.map(n =>
    `<option value="${n.id}">[${realmName(n.realm || 0)}] ${n.name}</option>`
  ).join('');

  const historyRows = (window.creatorGodHistory || []).slice(0, 50).map(h => `
    <div class="cg-hist-row">
      <span class="cg-hist-year">Năm ${h.year}</span>
      <span class="cg-hist-action">${h.action}</span>
      <span class="cg-hist-target">${h.targetName}</span>
      <span class="cg-hist-result">${h.result || h.detail || ''}</span>
    </div>
  `).join('') || '<div style="color:var(--white-dim);font-size:12px;text-align:center;padding:20px">Chưa có can thiệp nào.</div>';

  container.innerHTML = `
    <div class="cg-god-header">
      <div class="cg-god-title">👁 ĐẤNG TẠO HÓA</div>
      <div class="cg-god-subtitle">Nắm quyền sinh sát — Thiên Địa tùy ý</div>
    </div>

    <div class="cg-section-grid">

      <!-- ⚡ HEAVENLY TRIBULATION -->
      <div class="cg-card cg-tribulation">
        <div class="cg-card-title">⚡ THIÊN KIẾP</div>
        <div class="cg-card-desc">Giáng Thiên Kiếp xuống tu sĩ.<br>
          <span class="cg-prob">20% đột phá · 25% đại ngộ · 25% trọng thương · 30% tử vong</span>
        </div>
        <select id="cg-trib-npc" class="cg-select">
          <option value="">— Chọn tu sĩ —</option>
          ${npcOptions}
        </select>
        <button class="cg-btn cg-btn-trib" onclick="cgCastTribulation(document.getElementById('cg-trib-npc').value)">
          ⚡ Giáng Thiên Kiếp
        </button>
      </div>

      <!-- 🙏 DIVINE BLESSING -->
      <div class="cg-card cg-blessing">
        <div class="cg-card-title">🙏 THẦN ÂN</div>
        <div class="cg-card-desc">Ban phúc lành đặc biệt cho tu sĩ.</div>
        <select id="cg-bless-npc" class="cg-select">
          <option value="">— Chọn tu sĩ —</option>
          ${npcOptions}
        </select>
        <div class="cg-btn-row">
          <button class="cg-btn cg-btn-bless" onclick="cgGrantBlessing(document.getElementById('cg-bless-npc').value,'talent')" title="Căn cơ +2, công/phòng/HP +30%">
            ⚡ Thiên Tư
          </button>
          <button class="cg-btn cg-btn-bless" onclick="cgGrantBlessing(document.getElementById('cg-bless-npc').value,'luck')" title="Khí vận +30, Nghiệp +25, Tiền +5000">
            🌠 Khí Vận
          </button>
          <button class="cg-btn cg-btn-bless" onclick="cgGrantBlessing(document.getElementById('cg-bless-npc').value,'cultivation')" title="Kinh nghiệm +5000, tốc độ x3 50 năm">
            🔥 Tu Tốc
          </button>
        </div>
      </div>

      <!-- 📜 DIVINE REVELATION -->
      <div class="cg-card cg-revelation">
        <div class="cg-card-title">📜 THIÊN KHẢI</div>
        <div class="cg-card-desc">Gửi sấm truyền, dẫn dắt vận mệnh tu sĩ.</div>
        <select id="cg-rev-npc" class="cg-select">
          <option value="">— Chọn tu sĩ —</option>
          ${npcOptions}
        </select>
        <div class="cg-btn-row cg-btn-row-2">
          <button class="cg-btn cg-btn-rev" onclick="cgSendRevelation(document.getElementById('cg-rev-npc').value,'found_sect')" title="Tu sĩ lập tông môn mới">
            🏛 Lập Tông
          </button>
          <button class="cg-btn cg-btn-rev" onclick="cgSendRevelation(document.getElementById('cg-rev-npc').value,'found_country')" title="Tu sĩ xưng vương lập quốc">
            👑 Lập Quốc
          </button>
          <button class="cg-btn cg-btn-rev" onclick="cgSendRevelation(document.getElementById('cg-rev-npc').value,'seek_treasure')" title="Tu sĩ lên đường tìm bảo vật">
            🔍 Tìm Bảo
          </button>
          <button class="cg-btn cg-btn-rev" onclick="cgSendRevelation(document.getElementById('cg-rev-npc').value,'start_war')" title="Tu sĩ phát động chiến tranh">
            ⚔️ Phát Chiến
          </button>
        </div>
      </div>

      <!-- 📣 WORLD ANNOUNCEMENT -->
      <div class="cg-card cg-announcement">
        <div class="cg-card-title">📣 THIÊN ĐẠO THÔNG ĐIỆP</div>
        <div class="cg-card-desc">Phát ngôn của Tạo Hóa, vang vọng khắp thiên địa.</div>
        <textarea id="cg-announcement-input" class="cg-textarea" placeholder='Ví dụ: "Thiên Đạo đã phán — thời đại hỗn loạn sắp đến..."'></textarea>
        <button class="cg-btn cg-btn-announce" onclick="cgWorldAnnouncement(document.getElementById('cg-announcement-input').value)">
          📣 Truyền Khắp Thiên Hạ
        </button>
      </div>

    </div>

    <!-- 📖 DIVINE HISTORY -->
    <div class="cg-history-section">
      <div class="cg-history-title">
        📖 LỊCH SỬ CAN THIỆP
        <span class="cg-hist-count">${(window.creatorGodHistory || []).length} can thiệp</span>
      </div>
      <div class="cg-history-list">
        ${historyRows}
      </div>
    </div>
  `;
};


// ============================================================
// CSS INJECTION
// ============================================================

(function injectCreatorGodCSS() {
  if (document.getElementById('cg-styles')) return;
  const style = document.createElement('style');
  style.id = 'cg-styles';
  style.textContent = `
    /* ---- CREATOR GOD PANEL ---- */
    #panel-creator-god {
      background: var(--bg-main, #0a0a0f);
      color: var(--white-main, #e2e8f0);
    }

    .cg-god-header {
      text-align: center;
      padding: 20px 0 18px;
      border-bottom: 1px solid rgba(250,204,21,0.2);
      margin-bottom: 20px;
    }
    .cg-god-title {
      font-size: 22px;
      font-weight: 800;
      color: var(--gold, #facc15);
      letter-spacing: 3px;
      text-shadow: 0 0 20px rgba(250,204,21,0.4);
      margin-bottom: 4px;
    }
    .cg-god-subtitle {
      font-size: 12px;
      color: var(--white-dim, #64748b);
      letter-spacing: 1px;
    }

    .cg-section-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      margin-bottom: 20px;
    }
    @media (max-width: 900px) {
      .cg-section-grid { grid-template-columns: 1fr; }
    }

    .cg-card {
      background: var(--bg-card, #1a1a2e);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: border-color 0.2s;
    }
    .cg-tribulation  { border-color: rgba(239,68,68,0.25); }
    .cg-blessing     { border-color: rgba(250,204,21,0.20); }
    .cg-revelation   { border-color: rgba(167,139,250,0.25); }
    .cg-announcement { border-color: rgba(96,165,250,0.20); }

    .cg-tribulation:hover  { border-color: rgba(239,68,68,0.5); }
    .cg-blessing:hover     { border-color: rgba(250,204,21,0.45); }
    .cg-revelation:hover   { border-color: rgba(167,139,250,0.5); }
    .cg-announcement:hover { border-color: rgba(96,165,250,0.45); }

    .cg-card-title {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: var(--white-main, #e2e8f0);
    }
    .cg-card-desc {
      font-size: 12px;
      color: var(--white-dim, #64748b);
      line-height: 1.5;
    }
    .cg-prob {
      display: block;
      margin-top: 4px;
      color: rgba(239,68,68,0.7);
      font-size: 11px;
    }

    .cg-select {
      width: 100%;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      border-radius: 6px;
      color: var(--white-main, #e2e8f0);
      padding: 7px 10px;
      font-size: 12px;
      outline: none;
      cursor: pointer;
    }
    .cg-select:focus { border-color: var(--gold, #facc15); }

    .cg-btn {
      padding: 8px 14px;
      border-radius: 7px;
      border: 1px solid transparent;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      letter-spacing: 0.5px;
    }
    .cg-btn:hover { transform: translateY(-1px); filter: brightness(1.15); }
    .cg-btn:active { transform: translateY(0); }

    .cg-btn-trib {
      background: linear-gradient(135deg, rgba(239,68,68,0.18), rgba(185,28,28,0.25));
      border-color: rgba(239,68,68,0.4);
      color: #fca5a5;
      width: 100%;
    }
    .cg-btn-trib:hover { border-color: #ef4444; }

    .cg-btn-row {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .cg-btn-row .cg-btn { flex: 1; min-width: 80px; }
    .cg-btn-row-2 .cg-btn { flex: 1 1 calc(50% - 3px); }

    .cg-btn-bless {
      background: linear-gradient(135deg, rgba(250,204,21,0.10), rgba(196,150,30,0.16));
      border-color: rgba(250,204,21,0.3);
      color: var(--gold, #facc15);
    }
    .cg-btn-bless:hover { border-color: var(--gold, #facc15); }

    .cg-btn-rev {
      background: linear-gradient(135deg, rgba(167,139,250,0.10), rgba(109,40,217,0.18));
      border-color: rgba(167,139,250,0.3);
      color: #c4b5fd;
    }
    .cg-btn-rev:hover { border-color: #a78bfa; }

    .cg-textarea {
      width: 100%;
      min-height: 80px;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      border-radius: 6px;
      color: var(--white-main, #e2e8f0);
      padding: 8px 10px;
      font-size: 12px;
      font-family: inherit;
      resize: vertical;
      outline: none;
      box-sizing: border-box;
    }
    .cg-textarea:focus { border-color: #60a5fa; }

    .cg-btn-announce {
      background: linear-gradient(135deg, rgba(96,165,250,0.12), rgba(29,78,216,0.20));
      border-color: rgba(96,165,250,0.35);
      color: #93c5fd;
      width: 100%;
    }
    .cg-btn-announce:hover { border-color: #60a5fa; }

    /* ---- HISTORY ---- */
    .cg-history-section {
      background: var(--bg-card, #1a1a2e);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      border-radius: 12px;
      padding: 16px;
    }
    .cg-history-title {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1px;
      color: var(--white-main, #e2e8f0);
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .cg-hist-count {
      font-size: 11px;
      color: var(--white-dim, #64748b);
      font-weight: 400;
    }
    .cg-history-list {
      max-height: 360px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .cg-history-list::-webkit-scrollbar { width: 4px; }
    .cg-history-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

    .cg-hist-row {
      display: grid;
      grid-template-columns: 60px 100px 120px 1fr;
      gap: 8px;
      padding: 7px 10px;
      border-radius: 6px;
      background: rgba(255,255,255,0.02);
      font-size: 11px;
      align-items: center;
      border: 1px solid rgba(255,255,255,0.03);
    }
    .cg-hist-row:hover { background: rgba(255,255,255,0.05); }
    .cg-hist-year   { color: var(--gold-dim, #a16207); font-variant-numeric: tabular-nums; }
    .cg-hist-action { color: var(--gold, #facc15); font-weight: 600; }
    .cg-hist-target { color: #c4b5fd; }
    .cg-hist-result { color: var(--white-dim, #64748b); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    @media (max-width: 600px) {
      .cg-hist-row { grid-template-columns: 50px 1fr; }
      .cg-hist-target, .cg-hist-action { display: none; }
    }

    /* ---- NAV BTN for Creator God tab ---- */
    #btn-creator-god {
      background: linear-gradient(135deg, rgba(250,204,21,0.08), rgba(196,150,30,0.12));
      border-color: rgba(250,204,21,0.25) !important;
      color: var(--gold, #facc15) !important;
    }
    #btn-creator-god:hover {
      background: linear-gradient(135deg, rgba(250,204,21,0.18), rgba(196,150,30,0.24));
      border-color: var(--gold, #facc15) !important;
    }
    #btn-creator-god.active {
      background: linear-gradient(135deg, rgba(250,204,21,0.22), rgba(196,150,30,0.30));
    }
  `;
  document.head.appendChild(style);
})();


// ============================================================
// DOM INJECTION: Add nav button + panel to index.html DOM
// ============================================================

(function injectCreatorGodDOM() {
  function _inject() {
    // 1. Nav button
    if (!document.getElementById('btn-creator-god')) {
      const nav = document.querySelector('.sidebar-nav');
      if (nav) {
        const btn = document.createElement('button');
        btn.id = 'btn-creator-god';
        btn.className = 'nav-btn ec-hidden';
        btn.setAttribute('data-panel', 'creator-god');
        btn.style.display = 'none';
        btn.setAttribute('onclick', "showPanel('creator-god');renderCreatorGodPanel();");
        btn.innerHTML = '<span>👁</span><span>Tạo Hóa</span>';
        nav.appendChild(btn);
      }
    }

    // 2. Panel div
    if (!document.getElementById('panel-creator-god')) {
      const panelsContainer = document.querySelector('.panels');
      if (panelsContainer) {
        const panel = document.createElement('div');
        panel.id = 'panel-creator-god';
        panel.className = 'panel';
        panelsContainer.appendChild(panel);
      }
    }

    // 3. Inject "Unlock Creator God" button into World panel if not present
    if (!document.getElementById('cg-unlock-btn-wrapper')) {
      const worldPanel = document.getElementById('panel-world');
      if (worldPanel) {
        const wrapper = document.createElement('div');
        wrapper.id = 'cg-unlock-btn-wrapper';
        wrapper.style.cssText = 'margin-top:16px;text-align:center;';
        wrapper.innerHTML = `
          <button
            id="cg-unlock-main-btn"
            onclick="creatorGodUnlock()"
            style="
              background: linear-gradient(135deg, rgba(250,204,21,0.12), rgba(196,150,30,0.20));
              border: 1px solid rgba(250,204,21,0.35);
              color: var(--gold, #facc15);
              border-radius: 8px;
              padding: 10px 22px;
              font-size: 13px;
              font-weight: 700;
              letter-spacing: 1px;
              cursor: pointer;
              transition: all 0.2s;
            "
            onmouseover="this.style.borderColor='var(--gold)';this.style.background='linear-gradient(135deg,rgba(250,204,21,0.22),rgba(196,150,30,0.30))'"
            onmouseout="this.style.borderColor='rgba(250,204,21,0.35)';this.style.background='linear-gradient(135deg,rgba(250,204,21,0.12),rgba(196,150,30,0.20))'"
          >
            👁 Thức Tỉnh Tạo Hóa
          </button>
          <div style="font-size:11px;color:var(--white-dim,#64748b);margin-top:6px">Mở khóa Creator God Mode — nắm quyền sinh sát thiên địa</div>
        `;
        worldPanel.appendChild(wrapper);
      }
    }

    // Auto-show if already unlocked
    if (window.creatorGodUnlocked) _showCreatorGodTab();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(_inject, 800); });
  } else {
    setTimeout(_inject, 800);
  }
})();

console.log('[Creator God Engine v1.0] Loaded — Đấng Tạo Hóa sẵn sàng lâm thế.');
