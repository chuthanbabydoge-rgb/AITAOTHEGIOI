(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════
  // WORLD SHARE ENGINE — V125
  // Chia sẻ thế giới qua link xem & mã import
  // File: worldShareEngine.js
  // Init: 30600ms (sau V124)
  // ═══════════════════════════════════════════════════════

  const SAVE_KEY = "cgv6_world_share_v125";

  window.worldShareData = {
    shares: [],      // lịch sử các lần share
    lastShareId: null,
    lastShareCode: null,
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.worldShareData)); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.worldShareData = JSON.parse(d);
    } catch(e) {}
  }

  // ─── Tạo snapshot nhỏ gọn để share ───────────────────
  function buildShareSnapshot() {
    const snap = {
      name:        (window.world && window.world.name)        || "Vô Danh",
      genre:       (window.world && window.world.genre)       || "cultivation",
      template:    (window.world && window.world.templateKey) || "cultivation",
      createdYear: (window.world && window.world.createdYear) || 1,
      currentEra:  (window.world && window.world.currentEra)  || "",
      year:        typeof window.year !== "undefined" ? window.year : 1,
      // NPC — chỉ lấy tối đa 60 NPC, bỏ các field nặng
      npcs: (window.npcs || []).slice(0, 60).map(function(n) {
        return {
          id: n.id, name: n.name, realm: n.realm, realmLevel: n.realmLevel,
          hp: n.hp, maxHp: n.maxHp, attack: n.attack, cultivation: n.cultivation,
          sectId: n.sectId, countryId: n.countryId, age: n.age,
          title: n.title || "", isAlive: n.isAlive !== false,
        };
      }),
      // Quốc gia
      countries: (window.countries || []).slice(0, 30).map(function(c) {
        return {
          id: c.id, name: c.name, population: c.population,
          power: c.power, wealth: c.wealth, tech: c.tech,
          government: c.government || "", culture: c.culture || "",
        };
      }),
      // Tông môn / Sect
      sects: (window.sects || []).slice(0, 30).map(function(s) {
        return { id: s.id, name: s.name, power: s.power, members: s.members };
      }),
      // Lịch sử gần nhất
      worldHistory: (window.worldHistory || []).slice(-100),
      eventTimeline: (window.eventTimeline || []).slice(-50),
      // Meta
      sharedAt: Date.now(),
      version: "V125",
    };
    return snap;
  }

  // ─── Nén snapshot thành mã Base64 ────────────────────
  function snapshotToCode(snap) {
    try {
      const json = JSON.stringify(snap);
      return btoa(unescape(encodeURIComponent(json)));
    } catch(e) {
      return null;
    }
  }

  // ─── Giải mã từ mã Base64 ────────────────────────────
  function codeToSnapshot(code) {
    try {
      return JSON.parse(decodeURIComponent(escape(atob(code))));
    } catch(e) {
      return null;
    }
  }
  window.wseCodeToSnapshot = codeToSnapshot;

  // ─── Upload lên server, nhận shareId ─────────────────
  async function uploadShare(snap) {
    const res = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snap),
    });
    if (!res.ok) throw new Error("Upload thất bại: " + res.status);
    const data = await res.json();
    return data.id;
  }

  // ─── Hàm chính: share thế giới ───────────────────────
  window.wseShareWorld = async function() {
    if (!window.world || !window.world.name) {
      alert("Chưa có thế giới nào để chia sẻ!");
      return;
    }
    try {
      wseShowShareModal("loading");
      const snap = buildShareSnapshot();
      const code = snapshotToCode(snap);

      // Upload lên server lấy link
      let shareId = null;
      try {
        shareId = await uploadShare(snap);
      } catch(e) {
        console.warn("[WorldShare] Server upload lỗi, chỉ dùng mã code:", e);
      }

      window.worldShareData.lastShareCode = code;
      window.worldShareData.lastShareId   = shareId;
      window.worldShareData.shares.push({
        id: shareId,
        name: snap.name,
        year: snap.year,
        sharedAt: snap.sharedAt,
      });
      save();

      wseShowShareModal("done", { code, shareId, snap });
    } catch(err) {
      wseShowShareModal("error", { msg: err.message });
    }
  };

  // ─── Import từ mã ─────────────────────────────────────
  window.wseImportFromCode = function(code) {
    const snap = codeToSnapshot(code.trim());
    if (!snap || !snap.name) {
      alert("Mã không hợp lệ!");
      return;
    }
    wseShowImportConfirm(snap, function() {
      _doImport(snap);
    });
  };

  function _doImport(snap) {
    try {
      // Dùng restoreWorldSnapshot nếu có
      if (typeof restoreWorldSnapshot === "function") {
        restoreWorldSnapshot(snap);
      } else {
        // Fallback: gán trực tiếp
        window.world     = { name: snap.name, genre: snap.genre, templateKey: snap.template, createdYear: snap.createdYear, currentEra: snap.currentEra };
        window.npcs      = snap.npcs      || [];
        window.countries = snap.countries || [];
        window.sects     = snap.sects     || [];
        window.year      = snap.year      || 1;
        window.worldHistory   = snap.worldHistory   || [];
        window.eventTimeline  = snap.eventTimeline  || [];
      }
      if (typeof save === "function") save();
      alert("✅ Đã nhập thế giới \"" + snap.name + "\" thành công!\nTải lại trang để xem đầy đủ.");
    } catch(e) {
      alert("Lỗi khi nhập thế giới: " + e.message);
    }
  }

  // ─── UI: Modal chia sẻ ───────────────────────────────
  function wseShowShareModal(state, data) {
    let modal = document.getElementById("wse-share-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "wse-share-modal";
      modal.style.cssText = [
        "position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center",
        "background:rgba(0,0,0,0.8);backdrop-filter:blur(8px)",
      ].join(";");
      document.body.appendChild(modal);
    }
    modal.style.display = "flex";

    if (state === "loading") {
      modal.innerHTML = '<div style="background:#0f172a;border:1px solid #facc1544;border-radius:16px;padding:40px;text-align:center;color:#facc15;font-family:Cinzel,serif;min-width:320px">'
        + '<div style="font-size:28px;margin-bottom:12px">⏳</div>'
        + '<div style="font-size:16px">Đang tạo link chia sẻ...</div>'
        + '</div>';
      return;
    }

    if (state === "error") {
      modal.innerHTML = '<div style="background:#0f172a;border:1px solid #ef444444;border-radius:16px;padding:32px;min-width:320px;font-family:Noto Serif,serif;color:#e8e8f0">'
        + '<div style="font-size:22px;margin-bottom:8px;color:#ef4444">❌ Lỗi</div>'
        + '<div style="color:#94a3b8;margin-bottom:20px">' + (data && data.msg || "Không rõ lỗi") + '</div>'
        + '<button onclick="document.getElementById(\'wse-share-modal\').style.display=\'none\'" style="background:#1e293b;border:1px solid #334155;color:#e8e8f0;padding:8px 20px;border-radius:8px;cursor:pointer">Đóng</button>'
        + '</div>';
      return;
    }

    // state === "done"
    const { code, shareId, snap } = data;
    const origin = window.location.origin;
    const viewUrl = shareId ? (origin + "/view?id=" + shareId) : null;
    const shortCode = code ? code.substring(0, 40) + "..." : "";

    modal.innerHTML = [
      '<div style="background:#0f172a;border:1px solid #facc1533;border-radius:16px;padding:28px;min-width:360px;max-width:520px;font-family:Noto Serif,serif;color:#e8e8f0;position:relative">',

      // Close
      '<button onclick="document.getElementById(\'wse-share-modal\').style.display=\'none\'" style="position:absolute;top:12px;right:16px;background:none;border:none;color:#64748b;font-size:20px;cursor:pointer">✕</button>',

      // Title
      '<div style="font-family:Cinzel Decorative,serif;font-size:18px;color:#facc15;margin-bottom:4px">🌍 Chia Sẻ Thế Giới</div>',
      '<div style="font-size:12px;color:#64748b;margin-bottom:20px">' + snap.name + ' · Năm ' + snap.year + '</div>',

      // ── Link xem (nếu có)
      viewUrl ? [
        '<div style="margin-bottom:18px">',
        '<div style="font-size:12px;color:#94a3b8;margin-bottom:6px;font-weight:600;letter-spacing:.05em">🔗 LINK XEM (chỉ đọc)</div>',
        '<div style="display:flex;gap:8px;align-items:center">',
        '<input id="wse-link-input" readonly value="' + viewUrl + '" style="flex:1;background:#1e293b;border:1px solid #334155;border-radius:8px;padding:8px 10px;color:#facc15;font-size:12px;font-family:monospace;outline:none">',
        '<button onclick="navigator.clipboard.writeText(\'' + viewUrl + '\');this.textContent=\'✓ Đã chép\';setTimeout(()=>this.textContent=\'📋 Copy\',2000)" style="background:#facc1522;border:1px solid #facc1544;color:#facc15;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:13px;white-space:nowrap">📋 Copy</button>',
        '</div>',
        '</div>',
      ].join("") : '<div style="background:#1e293b;border-radius:8px;padding:10px 14px;margin-bottom:18px;font-size:12px;color:#64748b">⚠️ Không tạo được link server — chỉ dùng mã import bên dưới</div>',

      // ── Mã import
      '<div style="margin-bottom:20px">',
      '<div style="font-size:12px;color:#94a3b8;margin-bottom:6px;font-weight:600;letter-spacing:.05em">📥 MÃ IMPORT (để người khác nhập vào game)</div>',
      '<textarea id="wse-code-area" readonly rows="4" style="width:100%;background:#1e293b;border:1px solid #334155;border-radius:8px;padding:8px 10px;color:#4ade80;font-size:11px;font-family:monospace;resize:none;outline:none">' + code + '</textarea>',
      '<button onclick="navigator.clipboard.writeText(document.getElementById(\'wse-code-area\').value);this.textContent=\'✓ Đã chép mã\';setTimeout(()=>this.textContent=\'📋 Sao chép mã\',2000)" style="margin-top:6px;background:#4ade8022;border:1px solid #4ade8044;color:#4ade80;padding:7px 14px;border-radius:8px;cursor:pointer;font-size:13px;width:100%">📋 Sao chép mã</button>',
      '</div>',

      // Footer
      '<div style="font-size:11px;color:#475569;text-align:center">Người nhận dùng nút <b style="color:#e8e8f0">Nhập Thế Giới</b> trong game để import</div>',

      '</div>',
    ].join("");
  }

  // ─── UI: Xác nhận import ─────────────────────────────
  function wseShowImportConfirm(snap, onConfirm) {
    let modal = document.getElementById("wse-import-confirm-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "wse-import-confirm-modal";
      modal.style.cssText = "position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px)";
      document.body.appendChild(modal);
    }
    modal.style.display = "flex";
    modal.innerHTML = [
      '<div style="background:#0f172a;border:1px solid #facc1533;border-radius:16px;padding:28px;min-width:340px;max-width:460px;font-family:Noto Serif,serif;color:#e8e8f0">',
      '<div style="font-family:Cinzel,serif;font-size:16px;color:#facc15;margin-bottom:14px">📥 Nhập Thế Giới</div>',

      '<div style="background:#1e293b;border-radius:10px;padding:14px;margin-bottom:16px">',
      '<div style="font-size:15px;font-weight:600;color:#facc15;margin-bottom:6px">' + snap.name + '</div>',
      '<div style="font-size:12px;color:#94a3b8;line-height:1.7">',
      '📅 Năm: <b style="color:#e8e8f0">' + snap.year + '</b><br>',
      '⚔️ Thể loại: <b style="color:#e8e8f0">' + (snap.genre || snap.template) + '</b><br>',
      '👤 NPC: <b style="color:#e8e8f0">' + (snap.npcs ? snap.npcs.length : 0) + '</b><br>',
      '🏳️ Quốc gia: <b style="color:#e8e8f0">' + (snap.countries ? snap.countries.length : 0) + '</b><br>',
      '🌅 Kỷ nguyên: <b style="color:#e8e8f0">' + (snap.currentEra || "—") + '</b>',
      '</div></div>',

      '<div style="background:#7f1d1d33;border:1px solid #ef444444;border-radius:8px;padding:10px 14px;font-size:12px;color:#fca5a5;margin-bottom:20px">',
      '⚠️ Thao tác này sẽ <b>ghi đè thế giới hiện tại</b> trong trình duyệt của bạn.',
      '</div>',

      '<div style="display:flex;gap:10px">',
      '<button id="wse-confirm-btn" style="flex:1;background:#facc1522;border:1px solid #facc1566;color:#facc15;padding:10px;border-radius:10px;cursor:pointer;font-size:14px;font-family:Cinzel,serif">✅ Xác nhận nhập</button>',
      '<button onclick="document.getElementById(\'wse-import-confirm-modal\').style.display=\'none\'" style="flex:1;background:#1e293b;border:1px solid #334155;color:#94a3b8;padding:10px;border-radius:10px;cursor:pointer;font-size:14px">Huỷ</button>',
      '</div>',
      '</div>',
    ].join("");

    document.getElementById("wse-confirm-btn").onclick = function() {
      modal.style.display = "none";
      onConfirm();
    };
  }

  // ─── UI: Panel nút trong game ─────────────────────────
  window.wseRenderSharePanel = function() {
    return [
      '<div style="background:linear-gradient(135deg,#0f172a,#1e1040);border:1px solid #facc1533;border-radius:14px;padding:18px;margin-bottom:16px">',
      '<div style="font-family:Cinzel Decorative,serif;font-size:15px;color:#facc15;margin-bottom:4px">🌍 Chia Sẻ Thế Giới</div>',
      '<div style="font-size:12px;color:#64748b;margin-bottom:16px">Tạo link xem hoặc mã import cho người khác</div>',

      // Nút share
      '<button onclick="window.wseShareWorld()" style="width:100%;background:linear-gradient(135deg,#facc1522,#f59e0b22);border:1px solid #facc1566;color:#facc15;padding:11px;border-radius:10px;cursor:pointer;font-size:14px;font-family:Cinzel,serif;margin-bottom:10px">',
      '🔗 Tạo Link & Mã Chia Sẻ',
      '</button>',

      // Ô nhập mã import
      '<div style="font-size:12px;color:#94a3b8;margin-bottom:6px">📥 Nhập mã từ người khác:</div>',
      '<div style="display:flex;gap:8px">',
      '<input id="wse-import-input" placeholder="Dán mã import vào đây..." style="flex:1;background:#1e293b;border:1px solid #334155;border-radius:8px;padding:8px 10px;color:#4ade80;font-size:11px;font-family:monospace;outline:none">',
      '<button onclick="window.wseImportFromCode(document.getElementById(\'wse-import-input\').value)" style="background:#4ade8022;border:1px solid #4ade8066;color:#4ade80;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:13px;white-space:nowrap">Nhập</button>',
      '</div>',

      '</div>',
    ].join("");
  };

  // ─── Inject vào multiplayer panel (hook mpRenderPanel) ──
  function injectIntoMultiplayer() {
    // Hook vào mpRenderPanel (multiplayerEngine.js dùng tên này)
    const _origMp = window.mpRenderPanel;
    window.mpRenderPanel = function() {
      if (_origMp) _origMp.apply(this, arguments);
      // Sau khi mpRenderPanel ghi innerHTML, chèn thêm share section vào đầu
      const panel = document.getElementById("panel-multiplayer");
      if (!panel) return;
      const shareDiv = document.createElement("div");
      shareDiv.id = "wse-share-inject";
      shareDiv.innerHTML = window.wseRenderSharePanel();
      // Tránh chèn trùng
      const existing = panel.querySelector("#wse-share-inject");
      if (!existing) {
        panel.insertBefore(shareDiv, panel.firstChild);
      }
    };
    console.log("[WorldShareEngine V125] 🌍 Đã hook mpRenderPanel — nút chia sẻ sẵn sàng trong tab Multiplayer.");
  }

  function init() {
    load();
    injectIntoMultiplayer();
    console.log("[WorldShareEngine V125] 🌍 Chia sẻ thế giới — Link xem & Mã import sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 30600); });
  } else {
    setTimeout(init, 30600);
  }
})();
