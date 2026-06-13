(function() {
  "use strict";
  const SAVE_KEY = "cgv6_mp_market_v34";
  const MAX_LISTINGS = 100;

  window.mpMarketData = {
    listings: [],
    transactions: [],
    version: "V34"
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.mpMarketData)); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.mpMarketData = Object.assign(window.mpMarketData, JSON.parse(d));
    } catch(e) {}
  }

  const ITEM_TYPES = [
    { type:"linh_dan", name:"Linh Đan", icon:"💊", category:"Dược Phẩm" },
    { type:"linh_thach", name:"Linh Thạch", icon:"💎", category:"Khoáng Thạch" },
    { type:"bi_thuat", name:"Bí Thuật", icon:"📜", category:"Pháp Bảo" },
    { type:"vu_khi", name:"Vũ Khí Thần", icon:"⚔️", category:"Vũ Khí" },
    { type:"phong_than", name:"Phong Thần Quả", icon:"🍑", category:"Thiên Tài" },
    { type:"vo_vi", name:"Vô Vi Thảo", icon:"🌿", category:"Thảo Dược" },
    { type:"tho_dia", name:"Thổ Địa", icon:"🏔️", category:"Lãnh Thổ" },
    { type:"nhan_vat", name:"Đệ Tử", icon:"🧙", category:"Nhân Vật" }
  ];

  // Đăng bán
  window.mpListItem = function(itemType, itemName, price, quantity, description) {
    const acc = window.mpAccountData && window.mpAccountData.currentUser;
    const sellerName = typeof window.mpGetCurrentPlayerName === 'function' ? window.mpGetCurrentPlayerName() : "Ẩn Danh";
    const itemInfo = ITEM_TYPES.find(i => i.type === itemType) || ITEM_TYPES[0];
    load();
    const listing = {
      id: "lst_" + Date.now().toString(36),
      sellerId: acc ? acc.id : null,
      sellerName: sellerName,
      sessionId: window.mpData && window.mpData.sessionId,
      itemType: itemType,
      itemName: itemName || itemInfo.name,
      icon: itemInfo.icon,
      category: itemInfo.category,
      price: Math.max(1, Math.floor(Number(price) || 100)),
      quantity: Math.max(1, Math.floor(Number(quantity) || 1)),
      description: (description || "").substring(0, 100),
      year: window.year || 0,
      ts: Date.now(),
      status: "active"
    };
    window.mpMarketData.listings.unshift(listing);
    if (window.mpMarketData.listings.length > MAX_LISTINGS) {
      window.mpMarketData.listings = window.mpMarketData.listings.slice(0, MAX_LISTINGS);
    }
    save();
    if (typeof window.mpBroadcast === 'function') window.mpBroadcast("market", { action:"list", listing });
    if (typeof window.efAddFeedItem === 'function') {
      window.efAddFeedItem("market", itemInfo.icon, `${sellerName} đăng bán ${listing.itemName}`, `Giá: ${listing.price} linh thạch · SL: ${listing.quantity}`, "normal");
    }
    return listing;
  };

  // Mua
  window.mpBuyItem = function(listingId) {
    load();
    const listing = window.mpMarketData.listings.find(l => l.id === listingId && l.status === "active");
    if (!listing) return { ok: false, msg: "Mặt hàng không còn." };
    const buyerName = typeof window.mpGetCurrentPlayerName === 'function' ? window.mpGetCurrentPlayerName() : "Ẩn Danh";
    const mySid = window.mpData && window.mpData.sessionId;
    if (listing.sessionId === mySid) return { ok: false, msg: "Không thể mua hàng của chính mình." };

    listing.status = "sold";
    listing.buyerName = buyerName;
    listing.soldAt = Date.now();
    window.mpMarketData.transactions.unshift({
      listingId, sellerName: listing.sellerName, buyerName, itemName: listing.itemName,
      icon: listing.icon, price: listing.price, year: window.year || 0, ts: Date.now()
    });
    if (window.mpMarketData.transactions.length > 50) window.mpMarketData.transactions = window.mpMarketData.transactions.slice(0, 50);
    save();
    if (typeof window.mpBroadcast === 'function') window.mpBroadcast("market", { action:"sold", listingId, buyerName });
    if (typeof window.efAddFeedItem === 'function') {
      window.efAddFeedItem("market", listing.icon, `Giao dịch thành công!`, `${buyerName} mua ${listing.itemName} từ ${listing.sellerName} với giá ${listing.price} linh thạch.`, "normal");
    }
    if (typeof window.mpSystemMsg === 'function') {
      window.mpSystemMsg("global", `${listing.icon} ${buyerName} vừa mua ${listing.itemName} từ ${listing.sellerName} — ${listing.price} linh thạch`);
    }
    return { ok: true, listing };
  };

  // Nhận update market từ tab khác
  window.mpReceiveMarket = function(msg) {
    if (!msg || !msg.data) return;
    load();
    const { action, listing, listingId, buyerName } = msg.data;
    if (action === "list" && listing) {
      if (!window.mpMarketData.listings.find(l => l.id === listing.id)) {
        window.mpMarketData.listings.unshift(listing);
        save();
      }
    } else if (action === "sold" && listingId) {
      const l = window.mpMarketData.listings.find(l => l.id === listingId);
      if (l) { l.status = "sold"; l.buyerName = buyerName; save(); }
    }
  };

  // Render panel marketplace
  window.mpMarketRenderPanel = function() {
    const panel = document.getElementById("panel-player-market");
    if (!panel) return;
    load();
    const active = window.mpMarketData.listings.filter(l => l.status === "active");
    const transactions = window.mpMarketData.transactions;
    const mySid = window.mpData && window.mpData.sessionId;
    const yr = window.year || 0;

    let html = `<div style="padding:16px;font-family:'Noto Serif SC',serif;color:#e2e8f0">
      <h2 style="color:#34d399;margin:0 0 4px">🏪 Chợ Người Chơi</h2>
      <p style="color:#94a3b8;margin:0 0 16px;font-size:13px">Năm ${yr} · ${active.length} mặt hàng đang bán</p>

      <!-- Đăng bán -->
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:14px;margin-bottom:16px">
        <div style="font-size:12px;color:#34d399;font-weight:bold;margin-bottom:10px">➕ ĐĂNG BÁN</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
          <select id="mp-market-type" style="padding:7px 10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:12px">
            ${ITEM_TYPES.map(t => `<option value="${t.type}">${t.icon} ${t.name}</option>`).join("")}
          </select>
          <input id="mp-market-name" type="text" placeholder="Tên vật phẩm..." style="padding:7px 10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:12px">
          <input id="mp-market-price" type="number" placeholder="Giá (linh thạch)" min="1" style="padding:7px 10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:12px">
          <input id="mp-market-qty" type="number" placeholder="Số lượng" min="1" value="1" style="padding:7px 10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:12px">
        </div>
        <input id="mp-market-desc" type="text" placeholder="Mô tả (tùy chọn)..." style="width:100%;padding:7px 10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:12px;box-sizing:border-box;margin-bottom:8px">
        <button onclick="mpDoListItem()" style="padding:7px 16px;background:linear-gradient(135deg,#34d399,#059669);border:none;border-radius:6px;color:white;cursor:pointer;font-size:12px">Đăng Bán</button>
        <span id="mp-market-msg" style="font-size:11px;color:#f87171;margin-left:10px"></span>
      </div>

      <!-- Danh sách bán -->
      <div style="margin-bottom:16px">
        <div style="font-size:12px;color:#94a3b8;font-weight:bold;margin-bottom:8px">📦 MẶT HÀNG ĐANG BÁN (${active.length})</div>
        ${active.length === 0 ? `<div style="text-align:center;padding:20px;color:#475569;font-size:13px">Chợ trống. Hãy đăng bán vật phẩm đầu tiên!</div>` :
          active.slice(0,20).map(l => `<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px 14px;margin-bottom:8px;display:flex;align-items:center;gap:10px">
            <span style="font-size:24px">${l.icon||"📦"}</span>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:bold;color:#e2e8f0">${l.itemName||"?"}</div>
              <div style="font-size:11px;color:#64748b">Người bán: ${l.sellerName||"?"} · SL: ${l.quantity||1} · Năm ${l.year||0}</div>
              ${l.description ? `<div style="font-size:11px;color:#475569">${l.description}</div>` : ""}
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div style="font-size:14px;font-weight:bold;color:#fbbf24">${l.price}💎</div>
              ${l.sessionId !== mySid ? `<button onclick="mpDoBuy('${l.id}')" style="margin-top:4px;padding:4px 10px;background:linear-gradient(135deg,#34d399,#059669);border:none;border-radius:4px;color:white;cursor:pointer;font-size:11px">Mua</button>` :
                `<span style="font-size:11px;color:#475569">Của bạn</span>`}
            </div>
          </div>`).join("")}
      </div>

      <!-- Lịch sử giao dịch -->
      ${transactions.length > 0 ? `<div>
        <div style="font-size:12px;color:#94a3b8;font-weight:bold;margin-bottom:8px">📋 GIAO DỊCH GẦN ĐÂY</div>
        ${transactions.slice(0,5).map(t => `<div style="font-size:12px;color:#64748b;padding:4px 0;border-bottom:1px solid #0f172a">
          ${t.icon||"📦"} ${t.buyerName} mua <b style="color:#e2e8f0">${t.itemName}</b> từ ${t.sellerName} — <span style="color:#fbbf24">${t.price}💎</span>
        </div>`).join("")}
      </div>` : ""}
    </div>`;
    panel.innerHTML = html;
  };

  window.mpDoListItem = function() {
    const type = (document.getElementById("mp-market-type")||{}).value || "linh_thach";
    const name = (document.getElementById("mp-market-name")||{}).value || "";
    const price = (document.getElementById("mp-market-price")||{}).value || 100;
    const qty = (document.getElementById("mp-market-qty")||{}).value || 1;
    const desc = (document.getElementById("mp-market-desc")||{}).value || "";
    const result = window.mpListItem(type, name, price, qty, desc);
    const msg = document.getElementById("mp-market-msg");
    if (result) { if (msg) msg.textContent = "✅ Đã đăng bán!"; window.mpMarketRenderPanel(); }
  };
  window.mpDoBuy = function(id) {
    const result = window.mpBuyItem(id);
    if (result.ok) { window.mpMarketRenderPanel(); }
    else { alert(result.msg); }
  };

  function init() {
    load();
    console.log("[PlayerMarketplace V34] 🏪 Chợ Người Chơi khởi động —", window.mpMarketData.listings.filter(l=>l.status==="active").length, "mặt hàng đang bán.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 2650); });
  } else {
    setTimeout(init, 2650);
  }
})();
