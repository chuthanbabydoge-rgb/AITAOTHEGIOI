(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTIVERSE ECONOMY V35 — Kinh Tế Liên Vũ Trụ
  // ═══════════════════════════════════════════════════════════════════════════
  const SAVE_KEY = "cgv6_multiverse_economy_v35";

  const TRADE_GOODS = [
    { id:"lingqi",     name:"💎 Linh Khí Tinh",    color:"#06b6d4", baseValue:100,  rarity:"common"    },
    { id:"divine_ore", name:"✨ Thần Kim Sa",        color:"#fbbf24", baseValue:500,  rarity:"rare"      },
    { id:"chaos_gem",  name:"🌑 Hắc Ám Bảo Thạch",  color:"#6366f1", baseValue:2000, rarity:"epic"      },
    { id:"tech_core",  name:"⚙️ Lõi Công Nghệ",     color:"#3b82f6", baseValue:300,  rarity:"uncommon"  },
    { id:"myth_relic", name:"📜 Thần Thoại Thánh Khí",color:"#f97316",baseValue:5000, rarity:"legendary" },
    { id:"void_shard", name:"⚡ Mảnh Hư Không",      color:"#8b5cf6", baseValue:1500, rarity:"epic"      }
  ];

  function defaultData() {
    return {
      trades:   [],
      listings: [],
      auctions: [],
      market:   {},
      tick:     0,
      totalTrades: 0,
      totalVolume:  0
    };
  }

  window.meData = window.meData || defaultData();

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.meData)); } catch(e) {} }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { const p = JSON.parse(raw); if (p && p.trades) window.meData = Object.assign(defaultData(), p); }
    } catch(e) {}
  }

  let _idCtr = 1;
  function newId() { return "mtrd_" + Date.now() + "_" + (_idCtr++); }

  // Khởi tạo market prices
  function initMarket() {
    TRADE_GOODS.forEach(function(g) {
      if (!window.meData.market[g.id]) {
        window.meData.market[g.id] = { price: g.baseValue, trend: 0, supply: 100, demand: 100 };
      }
    });
  }

  // ─── Đăng bán hàng ────────────────────────────────────────────────────────
  window.meListItem = function(sellerUid, goodId, qty, price) {
    const seller = window.mvGetUniverseById && window.mvGetUniverseById(sellerUid);
    const good   = TRADE_GOODS.find(g => g.id === goodId);
    if (!seller || !good) return null;

    const listing = {
      id:         newId(),
      sellerUid,
      sellerName: seller.name,
      goodId,
      goodName:   good.name,
      goodColor:  good.color,
      qty:        qty || 10,
      price:      price || window.meData.market[goodId].price,
      status:     "active",
      listedAt:   window.year || 0
    };

    window.meData.listings.push(listing);
    meLog(`📦 "${seller.name}" đăng bán ${qty}x ${good.name} giá ${price.toLocaleString()}/đơn`);
    save(); return listing;
  };

  // ─── Mua hàng ─────────────────────────────────────────────────────────────
  window.meBuyItem = function(buyerUid, listingId) {
    const listing = window.meData.listings.find(l => l.id === listingId && l.status === "active");
    const buyer   = window.mvGetUniverseById && window.mvGetUniverseById(buyerUid);
    if (!listing || !buyer) return false;
    if (listing.sellerUid === buyerUid) return false;

    listing.status  = "sold";
    listing.buyerUid  = buyerUid;
    listing.buyerName = buyer.name;
    listing.soldAt  = window.year || 0;
    const total = listing.price * listing.qty;

    window.meData.trades.unshift({
      id: newId(), listingId, buyerUid, buyerName: buyer.name,
      sellerUid: listing.sellerUid, sellerName: listing.sellerName,
      goodId: listing.goodId, goodName: listing.goodName,
      qty: listing.qty, price: listing.price, total, year: window.year||0
    });
    if (window.meData.trades.length > 200) window.meData.trades.length = 200;

    window.meData.totalTrades++;
    window.meData.totalVolume += total;

    // Cập nhật giá thị trường
    const mkt = window.meData.market[listing.goodId];
    if (mkt) { mkt.demand += 1; mkt.price = Math.floor(mkt.price * 1.01); }

    meLog(`🤝 "${buyer.name}" mua ${listing.qty}x ${listing.goodName} từ "${listing.sellerName}" · Giá: ${total.toLocaleString()}`);
    if (typeof window.htAddEvent === "function") window.htAddEvent({ year: window.year||0, desc:`Giao dịch liên vũ trụ: ${listing.goodName} từ "${listing.sellerName}" → "${buyer.name}"`, type:"universe_trade", source:"multiverse_economy" });
    save(); return true;
  };

  // ─── Tự động giao dịch ────────────────────────────────────────────────────
  window.meAutoTrade = function() {
    if (!window.mvData || !window.mvData.universes) return;
    const active = window.mvData.universes.filter(u => u.status === "active");
    if (active.length < 2) return;

    const seller = active[Math.floor(Math.random()*active.length)];
    const goods  = TRADE_GOODS;
    const good   = goods[Math.floor(Math.random()*goods.length)];
    const qty    = Math.floor(Math.random()*50)+5;
    const price  = Math.floor((window.meData.market[good.id] ? window.meData.market[good.id].price : good.baseValue) * (0.8 + Math.random()*0.4));
    window.meListItem(seller.id, good.id, qty, price);

    const activeListings = window.meData.listings.filter(l => l.status === "active");
    if (activeListings.length > 0) {
      const buyer = active.find(u => u.id !== seller.id);
      if (buyer) {
        const listing = activeListings[Math.floor(Math.random()*activeListings.length)];
        if (listing.sellerUid !== buyer.id) window.meBuyItem(buyer.id, listing.id);
      }
    }
  };

  function meLog(msg) {
    if (typeof window.addLog === "function") window.addLog("[MV-ECO] " + msg);
    if (typeof window.mvLog === "function") window.mvLog(msg);
  }

  window.meGetGoods    = function() { return TRADE_GOODS; };
  window.meGetListings = function() { return window.meData.listings.filter(l=>l.status==="active"); };
  window.meGetTrades   = function() { return window.meData.trades; };
  window.meGetMarket   = function() { return window.meData.market; };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  window.meRenderPanel = function() {
    const el = document.getElementById("panel-multiverse-economy");
    if (!el) return;
    const listings = window.meGetListings().slice(0, 30);
    const trades   = window.meGetTrades().slice(0, 20);
    const market   = window.meGetMarket();
    const goods    = TRADE_GOODS;
    const universes= (window.mvData && window.mvData.universes) ? window.mvData.universes.filter(u=>u.status==="active") : [];

    initMarket();

    el.innerHTML = `
<div style="padding:16px;font-family:'Noto Serif SC',serif;background:#0a0a1a;min-height:100%;color:#e2e8f0">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
    <div>
      <h2 style="margin:0;font-size:20px;color:#10b981;font-family:Cinzel,serif">💰 Kinh Tế Liên Vũ Trụ V35</h2>
      <div style="font-size:11px;color:#64748b;margin-top:2px">${listings.length} mặt hàng đang bán · ${window.meData.totalTrades} giao dịch · Doanh thu: ${window.meData.totalVolume.toLocaleString()}</div>
    </div>
    <div style="display:flex;gap:8px">
      <button onclick="meAutoTrade();meRenderPanel()" style="padding:6px 14px;background:linear-gradient(135deg,#10b981,#059669);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:12px">🔄 Tự Động Giao Dịch</button>
      <button onclick="meRenderListModal()" style="padding:6px 14px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:12px">+ Đăng Bán</button>
    </div>
  </div>

  <div style="margin-bottom:20px">
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:8px">📊 GIÁ THỊ TRƯỜNG</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px">
      ${goods.map(g => {
        const mkt = market[g.id] || { price: g.baseValue, trend: 0 };
        const trend = mkt.trend > 0 ? "▲" : mkt.trend < 0 ? "▼" : "—";
        const tcolor= mkt.trend > 0 ? "#34d399" : mkt.trend < 0 ? "#ef4444" : "#64748b";
        return `<div style="background:#0f172a;border:1px solid ${g.color}44;border-radius:8px;padding:10px">
          <div style="font-size:11px;color:${g.color};font-weight:600;margin-bottom:4px">${g.name}</div>
          <div style="font-size:16px;font-weight:700;color:#e2e8f0">${mkt.price.toLocaleString()}</div>
          <div style="font-size:10px;color:${tcolor}">${trend} <span style="color:#64748b">${g.rarity}</span></div>
        </div>`;
      }).join("")}
    </div>
  </div>

  ${listings.length > 0 ? `
  <div style="margin-bottom:20px">
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:8px">🏪 ĐANG RAO BÁN (${listings.length})</div>
    <div style="display:grid;gap:8px">
      ${listings.map(l=>`
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <div>
          <span style="font-size:12px;font-weight:600;color:${l.goodColor}">${l.goodName}</span>
          <div style="font-size:11px;color:#64748b;margin-top:2px">Người bán: ${l.sellerName} · Số lượng: ${l.qty}</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <div style="text-align:right">
            <div style="font-size:13px;font-weight:700;color:#fbbf24">${l.price.toLocaleString()}/đơn</div>
            <div style="font-size:10px;color:#64748b">Tổng: ${(l.price*l.qty).toLocaleString()}</div>
          </div>
          ${universes.length > 1 ? `<button onclick="const buyer=window.mvData.universes.find(u=>u.id!=='${l.sellerUid}'&&u.status==='active');if(buyer){meBuyItem(buyer.id,'${l.id}');meRenderPanel()}" style="padding:6px 12px;background:#0f172a;border:1px solid #10b981;border-radius:5px;color:#10b981;cursor:pointer;font-size:11px">Mua</button>` : ""}
        </div>
      </div>`).join("")}
    </div>
  </div>` : `<div style="text-align:center;padding:30px;color:#475569;background:#0f172a;border-radius:8px;margin-bottom:20px"><div style="font-size:40px;margin-bottom:8px">💰</div><div>Chưa có hàng hóa nào đang rao bán</div></div>`}

  ${trades.length > 0 ? `
  <div>
    <div style="font-size:13px;color:#94a3b8;font-weight:600;margin-bottom:8px">📋 LỊCH SỬ GIAO DỊCH</div>
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px;max-height:200px;overflow-y:auto">
      ${trades.map(t=>`
      <div style="font-size:11px;color:#64748b;padding:4px 0;border-bottom:1px solid #1e293b">
        Năm ${t.year}: ${t.goodName} · ${t.sellerName} → ${t.buyerName} · ${t.total.toLocaleString()}
      </div>`).join("")}
    </div>
  </div>` : ""}
</div>`;
  };

  window.meRenderListModal = function() {
    const universes = (window.mvData && window.mvData.universes) ? window.mvData.universes.filter(u=>u.status==="active") : [];
    const goods = TRADE_GOODS;
    if (universes.length === 0) { alert("Cần ít nhất 1 vũ trụ hoạt động!"); return; }
    initMarket();
    const modal = document.createElement("div");
    modal.id = "me-list-modal";
    modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:#000000cc;z-index:9999;display:flex;align-items:center;justify-content:center";
    modal.innerHTML = `
<div style="background:#0f172a;border:1px solid #10b981;border-radius:12px;padding:24px;width:400px;max-width:90vw;font-family:'Noto Serif SC',serif">
  <h3 style="margin:0 0 16px;color:#10b981;font-family:Cinzel,serif">📦 Đăng Bán Hàng Hóa</h3>
  <div style="margin-bottom:10px">
    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Vũ trụ bán</label>
    <select id="me-seller-sel" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px">
      ${universes.map(u=>`<option value="${u.id}">${u.name}</option>`).join("")}
    </select>
  </div>
  <div style="margin-bottom:10px">
    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Hàng hóa</label>
    <select id="me-good-sel" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px">
      ${goods.map(g=>`<option value="${g.id}">${g.name} (Giá hiện tại: ${window.meData.market[g.id]?window.meData.market[g.id].price.toLocaleString():g.baseValue})</option>`).join("")}
    </select>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
    <div>
      <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Số lượng</label>
      <input id="me-qty-inp" type="number" value="10" min="1" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px;box-sizing:border-box">
    </div>
    <div>
      <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Đơn giá</label>
      <input id="me-price-inp" type="number" value="100" min="1" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px;box-sizing:border-box">
    </div>
  </div>
  <div style="display:flex;gap:10px">
    <button onclick="const s=document.getElementById('me-seller-sel').value;const g=document.getElementById('me-good-sel').value;const q=parseInt(document.getElementById('me-qty-inp').value)||10;const p=parseInt(document.getElementById('me-price-inp').value)||100;meListItem(s,g,q,p);document.getElementById('me-list-modal').remove();meRenderPanel()" style="flex:1;padding:10px;background:linear-gradient(135deg,#10b981,#059669);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:13px">💰 Đăng Bán</button>
    <button onclick="document.getElementById('me-list-modal').remove()" style="padding:10px 16px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#94a3b8;cursor:pointer;font-size:13px">Hủy</button>
  </div>
</div>`;
    document.body.appendChild(modal);
  };

  // ─── gameTick ─────────────────────────────────────────────────────────────
  const _prevTick = window.gameTick;
  window.gameTick = function() {
    if (typeof _prevTick === "function") _prevTick();
    window.meData.tick++;
    if (window.meData.tick % 10 === 0) {
      initMarket();
      TRADE_GOODS.forEach(function(g) {
        const mkt = window.meData.market[g.id];
        if (!mkt) return;
        const delta = (Math.random()-0.5) * g.baseValue * 0.05;
        mkt.trend = delta;
        mkt.price = Math.max(1, Math.floor(mkt.price + delta));
      });
    }
    if (window.meData.tick % 200 === 0) window.meAutoTrade();
    if (window.meData.tick % 30 === 0) save();
  };

  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
      load();
      initMarket();
      console.log("[MultiverseEconomy V35] 💰 Kinh tế đa vũ trụ sẵn sàng.");
    }, 2900);
  });

})();
