(function () {
  "use strict";

  const SECTION_ID = "xrf69-section-wrapper";

  function injectCSS() {
    if (document.getElementById("xrf69-css")) return;
    const s = document.createElement("style");
    s.id = "xrf69-css";
    s.textContent = `
      #xrf69-section-wrapper {
        margin-top: 18px;
        border-top: 1px solid rgba(192,132,252,0.2);
        padding-top: 14px;
      }
      .xrf69-header {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 12px; flex-wrap: wrap; gap: 8px;
      }
      .xrf69-title {
        font-size: 15px; font-weight: 700; color: #c084fc;
        text-shadow: 0 0 14px rgba(192,132,252,0.4);
        letter-spacing: 1px;
      }
      .xrf69-tab-bar {
        display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px;
      }
      .xrf69-tab {
        padding: 5px 14px; border-radius: 6px; font-size: 11px; cursor: pointer;
        border: 1px solid rgba(255,255,255,0.12); color: #94a3b8;
        background: rgba(255,255,255,0.04); transition: all 0.2s;
        font-family: var(--font-cjk, serif);
      }
      .xrf69-tab:hover { border-color: rgba(192,132,252,0.5); color: #c084fc; }
      .xrf69-tab.active {
        border-color: rgba(192,132,252,0.7); color: #c084fc;
        background: rgba(192,132,252,0.12);
      }
      .xrf69-panel { display: none; }
      .xrf69-panel.active { display: block; }
      .xrf69-card {
        background: rgba(192,132,252,0.06);
        border: 1px solid rgba(192,132,252,0.15);
        border-radius: 10px; padding: 14px; margin-bottom: 10px;
      }
      .xrf69-card-title {
        font-size: 12px; color: #c084fc; font-weight: 700;
        margin-bottom: 8px; letter-spacing: 0.5px;
      }
      .xrf69-row {
        display: flex; justify-content: space-between; align-items: center;
        padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
        font-size: 11px;
      }
      .xrf69-label { color: #64748b; }
      .xrf69-val { color: #e2e8f0; font-weight: 600; }
      .xrf69-badge {
        display: inline-block; padding: 2px 8px; border-radius: 12px;
        font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
      }
      .xrf69-badge-ready { background: rgba(74,222,128,0.15); border: 1px solid rgba(74,222,128,0.4); color: #4ade80; }
      .xrf69-badge-partial { background: rgba(250,204,21,0.12); border: 1px solid rgba(250,204,21,0.4); color: #facc15; }
      .xrf69-badge-no { background: rgba(248,113,113,0.12); border: 1px solid rgba(248,113,113,0.4); color: #f87171; }
      .xrf69-btn {
        padding: 7px 16px; border-radius: 7px; font-size: 12px; cursor: pointer;
        border: 1px solid rgba(192,132,252,0.4); color: #c084fc;
        background: rgba(192,132,252,0.1); transition: all 0.2s;
        font-family: var(--font-cjk, serif); margin: 3px;
      }
      .xrf69-btn:hover {
        background: rgba(192,132,252,0.2);
        box-shadow: 0 0 12px rgba(192,132,252,0.3);
      }
      .xrf69-btn-green {
        border-color: rgba(74,222,128,0.4); color: #4ade80;
        background: rgba(74,222,128,0.08);
      }
      .xrf69-btn-green:hover { background: rgba(74,222,128,0.18); }
      .xrf69-btn-gold {
        border-color: rgba(245,158,11,0.4); color: #f59e0b;
        background: rgba(245,158,11,0.08);
      }
      .xrf69-btn-gold:hover { background: rgba(245,158,11,0.18); }
      .xrf69-log-box {
        background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06);
        border-radius: 8px; padding: 10px; max-height: 180px; overflow-y: auto;
        font-size: 10px; color: #64748b; font-family: monospace;
      }
      .xrf69-log-entry { padding: 2px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
      .xrf69-world-table-vis {
        width: 100%; height: 200px; position: relative;
        background: radial-gradient(circle at 50% 60%, rgba(192,132,252,0.08), transparent 70%);
        border: 1px solid rgba(192,132,252,0.15); border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        overflow: hidden; margin-bottom: 10px;
      }
      .xrf69-table-surface {
        width: 120px; height: 12px; background: rgba(192,132,252,0.2);
        border-radius: 60px; position: absolute; bottom: 50px;
        box-shadow: 0 0 20px rgba(192,132,252,0.3);
      }
      .xrf69-world-ball {
        width: 60px; height: 60px; border-radius: 50%;
        background: radial-gradient(circle at 35% 35%, #00f5ff, #0a0a40);
        position: absolute; bottom: 55px;
        box-shadow: 0 0 30px rgba(0,245,255,0.4), 0 0 60px rgba(0,245,255,0.15);
        animation: xrf69Float 3s ease-in-out infinite;
      }
      @keyframes xrf69Float {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-8px) rotate(3deg); }
      }
      .xrf69-hand-left, .xrf69-hand-right {
        position: absolute; bottom: 20px; font-size: 28px;
        animation: xrf69Reach 2.5s ease-in-out infinite;
      }
      .xrf69-hand-left { left: 20%; }
      .xrf69-hand-right { right: 20%; animation-delay: 0.4s; }
      @keyframes xrf69Reach {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      .xrf69-grid {
        display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
      }
      .xrf69-shortcut {
        display: flex; justify-content: space-between; padding: 4px 0;
        border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 11px;
      }
      .xrf69-key {
        background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
        border-radius: 4px; padding: 1px 6px; font-size: 10px;
        color: #94a3b8; font-family: monospace;
      }
    `;
    document.head.appendChild(s);
  }

  function getCapBadge(val) {
    if (val === true) return '<span class="xrf69-badge xrf69-badge-ready">✓ SẴN SÀNG</span>';
    if (val === false) return '<span class="xrf69-badge xrf69-badge-no">✗ KHÔNG HỖ TRỢ</span>';
    return '<span class="xrf69-badge xrf69-badge-partial">~ KIỂM TRA</span>';
  }

  function renderOverview() {
    const report = typeof xr69GetReadinessReport === "function" ? xr69GetReadinessReport() : null;
    const profile = report ? report.device : { name: "Đang phát hiện...", icon: "🔍", tier: "unknown" };
    const caps = report ? report.caps : {};
    const score = report ? report.score : 0;
    const grade = report ? report.grade : "UNKNOWN";

    const gradeColor = grade === "XR-READY" ? "#4ade80" : grade === "PARTIAL" ? "#facc15" : grade === "FLAT-MODE" ? "#38bdf8" : "#64748b";

    return `
      <div class="xrf69-card">
        <div class="xrf69-card-title">🥽 Thiết Bị Hiện Tại</div>
        <div style="text-align:center;padding:10px 0">
          <div style="font-size:36px">${profile.icon || "🖥️"}</div>
          <div style="color:#e2e8f0;font-size:14px;font-weight:700;margin:6px 0">${profile.name || "Desktop"}</div>
          <div style="color:${gradeColor};font-size:12px;font-weight:700;letter-spacing:1px">${grade}</div>
          <div style="margin:8px auto;width:80%;background:rgba(255,255,255,0.06);border-radius:10px;height:8px;overflow:hidden">
            <div style="width:${score}%;height:100%;background:${gradeColor};border-radius:10px;transition:width 0.5s"></div>
          </div>
          <div style="color:#64748b;font-size:10px">XR Score: ${score}/100</div>
        </div>
      </div>
      <div class="xrf69-card">
        <div class="xrf69-card-title">⚙️ Khả Năng XR</div>
        <div class="xrf69-row"><span class="xrf69-label">WebXR API</span>${getCapBadge(caps.webxr)}</div>
        <div class="xrf69-row"><span class="xrf69-label">Immersive VR</span>${getCapBadge(caps.immersiveVR)}</div>
        <div class="xrf69-row"><span class="xrf69-label">Immersive AR</span>${getCapBadge(caps.immersiveAR)}</div>
        <div class="xrf69-row"><span class="xrf69-label">Hand Tracking</span>${getCapBadge(caps.handTracking)}</div>
        <div class="xrf69-row"><span class="xrf69-label">Plane Detection</span>${getCapBadge(caps.planeDetection)}</div>
        <div class="xrf69-row"><span class="xrf69-label">World Table Mode</span>${getCapBadge(report ? report.worldTableReady : false)}</div>
        <div class="xrf69-row"><span class="xrf69-label">God Hand System</span>${getCapBadge(report ? report.godHandReady : false)}</div>
        <div class="xrf69-row"><span class="xrf69-label">Spatial Data V67</span>${getCapBadge(report ? report.spatialDataReady : !!(window.xrEngineV69Data))}</div>
      </div>
      <div style="text-align:center">
        <button class="xrf69-btn xrf69-btn-green" onclick="xr69MeasurePerformance&&xr69MeasurePerformance();setTimeout(xrf69RefreshPanel,2000)">⚡ Đo FPS</button>
        <button class="xrf69-btn" onclick="xrf69ShowTab('worldtable')">🌍 World Table</button>
        <button class="xrf69-btn" onclick="xrf69ShowTab('report')">📊 Báo Cáo XR</button>
      </div>
    `;
  }

  function renderWorldTable() {
    const wt = window.xrInteractionV69Data ? window.xrInteractionV69Data.worldTable : {};
    const wtActive = window.xrEngineV69Data ? window.xrEngineV69Data.worldTableMode.active : false;

    return `
      <div class="xrf69-card">
        <div class="xrf69-card-title">🌍 World Table Mode — Sa Bàn Sống</div>
        <div class="xrf69-world-table-vis">
          <div class="xrf69-table-surface"></div>
          <div class="xrf69-world-ball"></div>
          <div class="xrf69-hand-left">🤚</div>
          <div class="xrf69-hand-right">🤚</div>
          <div style="position:absolute;top:10px;left:0;right:0;text-align:center;font-size:10px;color:rgba(192,132,252,0.5)">
            Sa bàn sống — Thế giới trên bàn
          </div>
        </div>
        <div class="xrf69-row">
          <span class="xrf69-label">Trạng thái</span>
          <span class="xrf69-val">${wtActive ? "🟢 ĐANG HOẠT ĐỘNG" : "⚫ Tắt"}</span>
        </div>
        <div class="xrf69-row">
          <span class="xrf69-label">Tỷ lệ thu nhỏ</span>
          <span class="xrf69-val">${wt.scale !== undefined ? wt.scale.toFixed(3) : "1.000"}</span>
        </div>
        <div class="xrf69-row">
          <span class="xrf69-label">Góc xoay (Y)</span>
          <span class="xrf69-val">${wt.rotation !== undefined ? (wt.rotation * 180 / Math.PI).toFixed(1) + "°" : "0.0°"}</span>
        </div>
        <div class="xrf69-row">
          <span class="xrf69-label">Thực thể đã chọn</span>
          <span class="xrf69-val">${wt.selectedEntity ? (wt.selectedEntity.name || "?") : "—"}</span>
        </div>
      </div>
      <div class="xrf69-card">
        <div class="xrf69-card-title">🤚 God Hand Controls</div>
        <div style="font-size:11px;color:#64748b;margin-bottom:8px">Cử chỉ tay để điều khiển thế giới:</div>
        <div class="xrf69-row"><span class="xrf69-label">👌 Pinch</span><span class="xrf69-val">Chọn / Kích hoạt thực thể</span></div>
        <div class="xrf69-row"><span class="xrf69-label">✊ Grab</span><span class="xrf69-val">Nắm & Di chuyển thế giới</span></div>
        <div class="xrf69-row"><span class="xrf69-label">🔄 2 tay xoay</span><span class="xrf69-val">Xoay sa bàn</span></div>
        <div class="xrf69-row"><span class="xrf69-label">↔️ 2 tay kéo</span><span class="xrf69-val">Phóng to / Thu nhỏ</span></div>
        <div class="xrf69-row"><span class="xrf69-label">👆 Point</span><span class="xrf69-val">Nhắm mục tiêu để tác động</span></div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">
        <button class="xrf69-btn xrf69-btn-green" onclick="xr69ActivateWorldTable&&xr69ActivateWorldTable({});xrf69RefreshPanel()">🌍 Kích Hoạt World Table</button>
        <button class="xrf69-btn" onclick="xr69DeactivateWorldTable&&xr69DeactivateWorldTable();xrf69RefreshPanel()">✗ Tắt</button>
        <button class="xrf69-btn xrf69-btn-gold" onclick="xr69ResetWorldTable&&xr69ResetWorldTable();xrf69RefreshPanel()">↺ Reset</button>
      </div>
    `;
  }

  function renderGodHand() {
    const gh = window.xrInteractionV69Data ? window.xrInteractionV69Data.godHand : {};
    const gs = window.xrInteractionV69Data ? window.xrInteractionV69Data.gestureState : {};
    const log = typeof xr69GetActionLog === "function" ? xr69GetActionLog().slice(-10).reverse() : [];

    return `
      <div class="xrf69-card">
        <div class="xrf69-card-title">⚡ Trạng Thái God Hand</div>
        <div class="xrf69-row"><span class="xrf69-label">God Hand</span><span class="xrf69-val">${gh.active ? "🟢 BẬT" : "⚫ TẮT"}</span></div>
        <div class="xrf69-row"><span class="xrf69-label">Tay chủ đạo</span><span class="xrf69-val">${gh.dominantHand === "right" ? "Phải ✋" : "Trái 🤚"}</span></div>
        <div class="xrf69-row"><span class="xrf69-label">Tay trái</span><span class="xrf69-val">${gh.leftHand ? "🟢 Kết nối" : "—"}</span></div>
        <div class="xrf69-row"><span class="xrf69-label">Tay phải</span><span class="xrf69-val">${gh.rightHand ? "🟢 Kết nối" : "—"}</span></div>
      </div>
      <div class="xrf69-card">
        <div class="xrf69-card-title">✋ Cử Chỉ Hiện Tại</div>
        <div class="xrf69-row"><span class="xrf69-label">Pinch</span><span class="xrf69-val">${gs.pinch && gs.pinch.active ? "🟢 ĐANG PINCH" : "—"}</span></div>
        <div class="xrf69-row"><span class="xrf69-label">Grab</span><span class="xrf69-val">${gs.grab && gs.grab.active ? "🟢 ĐANG GỌN" : "—"}</span></div>
        <div class="xrf69-row"><span class="xrf69-label">Rotate</span><span class="xrf69-val">${gs.rotate && gs.rotate.active ? "🟢 ĐANG XOAY" : "—"}</span></div>
        <div class="xrf69-row"><span class="xrf69-label">Scale</span><span class="xrf69-val">${gs.scale && gs.scale.active ? "🟢 ĐANG SCALE" : "—"}</span></div>
        <div class="xrf69-row"><span class="xrf69-label">Scale factor</span><span class="xrf69-val">${window.xrInteractionV69Data ? window.xrInteractionV69Data.worldTable.scale.toFixed(2) : "1.00"}×</span></div>
      </div>
      <div class="xrf69-card">
        <div class="xrf69-card-title">📋 Action Log</div>
        <div class="xrf69-log-box">
          ${log.length ? log.map(function (l) {
            return '<div class="xrf69-log-entry"><span style="color:#334155">' + new Date(l.t).toLocaleTimeString() + '</span> ' + l.msg + '</div>';
          }).join("") : '<div style="color:#334155">Chưa có hành động.</div>'}
        </div>
      </div>
      <div>
        <button class="xrf69-btn" onclick="if(window.xrInteractionV69Data)window.xrInteractionV69Data.godHand.active=!window.xrInteractionV69Data.godHand.active;xrf69RefreshPanel()">🤚 Toggle God Hand</button>
        <button class="xrf69-btn xrf69-btn-gold" onclick="if(window.xrInteractionV69Data)window.xrInteractionV69Data.godHand.dominantHand=window.xrInteractionV69Data.godHand.dominantHand==='right'?'left':'right';xrf69RefreshPanel()">🔄 Đổi Tay</button>
      </div>
    `;
  }

  function renderReport() {
    const report = typeof xr69GetReadinessReport === "function" ? xr69GetReadinessReport() : null;
    const profile = report ? report.device : { name: "Unknown", notes: "" };
    const xrD = window.xrEngineV69Data || {};
    const fps = xrD.lastFPS || 0;
    const perfGrade = xrD.performanceGrade || "unknown";

    const metaScore = (report && report.caps.webxr && report.caps.immersiveVR) ? 85 : 30;
    const visionScore = (report && report.caps.webxr && report.caps.immersiveAR) ? 90 : 25;
    const arScore = (report && report.caps.webxr && report.caps.immersiveAR) ? 75 : 20;

    function scoreBar(val) {
      const color = val >= 80 ? "#4ade80" : val >= 50 ? "#facc15" : "#ef4444";
      return `<div style="width:100%;background:rgba(255,255,255,0.06);border-radius:6px;height:6px;margin-top:3px;overflow:hidden">
        <div style="width:${val}%;height:100%;background:${color};border-radius:6px"></div></div>`;
    }

    return `
      <div class="xrf69-card">
        <div class="xrf69-card-title">📊 Báo Cáo Tương Thích XR</div>
        <div style="font-size:10px;color:#334155;margin-bottom:10px">Phân tích khả năng XR của môi trường hiện tại</div>

        <div class="xrf69-card-title" style="margin-top:8px">🥽 Meta Quest</div>
        <div style="font-size:11px;color:#94a3b8;margin:4px 0">WebXR immersive-vr · Hand tracking · World Table Passthrough</div>
        ${scoreBar(metaScore)}
        <div style="font-size:10px;color:#64748b;margin-top:4px">${metaScore >= 80 ? "✅ Sẵn sàng — Yêu cầu Meta Browser / WebXR Origin Trial" : "⚠️ Cần thiết bị Meta Quest thực tế"}</div>

        <div class="xrf69-card-title" style="margin-top:12px">🍎 Apple Vision Pro</div>
        <div style="font-size:11px;color:#94a3b8;margin:4px 0">visionOS WebXR · Eye tracking · Plane detection · World Table</div>
        ${scoreBar(visionScore)}
        <div style="font-size:10px;color:#64748b;margin-top:4px">${visionScore >= 80 ? "✅ Sẵn sàng — Yêu cầu visionOS Safari" : "⚠️ Cần Apple Vision Pro thực tế"}</div>

        <div class="xrf69-card-title" style="margin-top:12px">👓 AR Glasses</div>
        <div style="font-size:11px;color:#94a3b8;margin:4px 0">WebXR immersive-ar · Plane detection · World Table trên bàn thật</div>
        ${scoreBar(arScore)}
        <div style="font-size:10px;color:#64748b;margin-top:4px">${arScore >= 70 ? "✅ Sẵn sàng" : "⚠️ Cần thiết bị AR"}</div>
      </div>
      <div class="xrf69-card">
        <div class="xrf69-card-title">⚡ Performance Report</div>
        <div class="xrf69-row"><span class="xrf69-label">FPS Benchmark</span><span class="xrf69-val">${fps > 0 ? fps + " FPS" : "Chưa đo"}</span></div>
        <div class="xrf69-row"><span class="xrf69-label">Performance Grade</span><span class="xrf69-val">${perfGrade}</span></div>
        <div class="xrf69-row"><span class="xrf69-label">Three.js</span><span class="xrf69-val">${typeof THREE !== "undefined" ? "✅ Loaded" : "⚠️ Chưa load"}</span></div>
        <div class="xrf69-row"><span class="xrf69-label">webxrSystem.js (V1)</span><span class="xrf69-val">${typeof XRSystem !== "undefined" ? "✅ Loaded" : "—"}</span></div>
        <div class="xrf69-row"><span class="xrf69-label">spatialWorldEngine V67</span><span class="xrf69-val">${typeof swe67Render !== "undefined" ? "✅ Active" : "—"}</span></div>
        <div class="xrf69-row"><span class="xrf69-label">Thiết bị</span><span class="xrf69-val">${profile.name || "Unknown"}</span></div>
      </div>
      <div class="xrf69-card">
        <div class="xrf69-card-title">⌨️ Phím Tắt XR</div>
        <div class="xrf69-shortcut"><span class="xrf69-label">Vào World Table</span><span class="xrf69-key">W</span></div>
        <div class="xrf69-shortcut"><span class="xrf69-label">Vào VR</span><span class="xrf69-key">V</span></div>
        <div class="xrf69-shortcut"><span class="xrf69-label">Vào AR</span><span class="xrf69-key">A</span></div>
        <div class="xrf69-shortcut"><span class="xrf69-label">Thoát XR</span><span class="xrf69-key">Esc</span></div>
        <div class="xrf69-shortcut"><span class="xrf69-label">Reset bàn</span><span class="xrf69-key">R</span></div>
        <div class="xrf69-shortcut"><span class="xrf69-label">Xoay trái / phải</span><span class="xrf69-key">← →</span></div>
        <div class="xrf69-shortcut"><span class="xrf69-label">Phóng to / Thu nhỏ</span><span class="xrf69-key">↑ ↓</span></div>
        <div class="xrf69-shortcut"><span class="xrf69-label">God Hand toggle</span><span class="xrf69-key">G</span></div>
        <div style="font-size:10px;color:#334155;margin-top:6px">Giữ Ctrl + kéo chuột = Di chuyển bàn</div>
      </div>
      <div style="text-align:center;margin-top:8px">
        <button class="xrf69-btn xrf69-btn-green" onclick="xr69MeasurePerformance&&xr69MeasurePerformance();setTimeout(xrf69RefreshPanel,3000)">⚡ Chạy FPS Benchmark</button>
      </div>
    `;
  }

  function renderCamera() {
    const cam = window.xrCameraV69Data || {};
    const orbit = cam.orbit || {};
    const anim = cam.animation || {};

    return `
      <div class="xrf69-card">
        <div class="xrf69-card-title">📷 Camera System</div>
        <div class="xrf69-row"><span class="xrf69-label">Mode</span><span class="xrf69-val">${cam.mode || "orbit"}</span></div>
        <div class="xrf69-row"><span class="xrf69-label">Theta (Yaw)</span><span class="xrf69-val">${orbit.theta !== undefined ? orbit.theta.toFixed(2) : "0.00"} rad</span></div>
        <div class="xrf69-row"><span class="xrf69-label">Phi (Pitch)</span><span class="xrf69-val">${orbit.phi !== undefined ? orbit.phi.toFixed(2) : "0.79"} rad</span></div>
        <div class="xrf69-row"><span class="xrf69-label">Radius</span><span class="xrf69-val">${orbit.radius !== undefined ? orbit.radius.toFixed(1) : "8.0"}</span></div>
        <div class="xrf69-row"><span class="xrf69-label">Auto-rotate</span><span class="xrf69-val">${anim.autoRotate ? "🟢 BẬT" : "⚫ Tắt"}</span></div>
        <div class="xrf69-row"><span class="xrf69-label">Flythrough</span><span class="xrf69-val">${cam.flythrough && cam.flythrough.active ? "🟢 ĐANG CHẠY" : "—"}</span></div>
      </div>
      <div class="xrf69-card">
        <div class="xrf69-card-title">📐 Camera Presets</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          <button class="xrf69-btn" onclick="xr69SetCameraPreset&&xr69SetCameraPreset('topDown');xrf69RefreshPanel()">⬆️ Top-Down</button>
          <button class="xrf69-btn" onclick="xr69SetCameraPreset&&xr69SetCameraPreset('isometric');xrf69RefreshPanel()">📐 Isometric</button>
          <button class="xrf69-btn xrf69-btn-gold" onclick="xr69SetCameraPreset&&xr69SetCameraPreset('godView');xrf69RefreshPanel()">👁️ God View</button>
          <button class="xrf69-btn" onclick="xr69SetCameraPreset&&xr69SetCameraPreset('groundLevel');xrf69RefreshPanel()">🏔️ Ground</button>
          <button class="xrf69-btn" onclick="xr69SetCameraPreset&&xr69SetCameraPreset('closeUp');xrf69RefreshPanel()">🔍 Close-Up</button>
        </div>
      </div>
      <div class="xrf69-card">
        <div class="xrf69-card-title">🎬 Flythrough</div>
        <div style="font-size:11px;color:#64748b;margin-bottom:8px">Bay qua tất cả quốc gia trong thế giới</div>
        <button class="xrf69-btn xrf69-btn-green" onclick="xr69BuildWorldFlythrough&&xr69StartFlythrough(xr69BuildWorldFlythrough());xrf69RefreshPanel()">🚀 Bắt Đầu World Tour</button>
        <button class="xrf69-btn" onclick="xr69ToggleAutoRotate&&xr69ToggleAutoRotate();xrf69RefreshPanel()">🔄 Toggle Auto-Rotate</button>
      </div>
    `;
  }

  let currentTab = "overview";

  window.xrf69ShowTab = function (tab) {
    currentTab = tab;
    const tabs = document.querySelectorAll(".xrf69-tab");
    tabs.forEach(function (t) { t.classList.toggle("active", t.dataset.tab === tab); });
    const panels = document.querySelectorAll(".xrf69-panel");
    panels.forEach(function (p) { p.classList.toggle("active", p.dataset.panel === tab); });
  };

  window.xrf69RefreshPanel = function () {
    const wrapper = document.getElementById(SECTION_ID);
    if (!wrapper) return;
    const overviewPanel = wrapper.querySelector('[data-panel="overview"]');
    const worldtablePanel = wrapper.querySelector('[data-panel="worldtable"]');
    const godhandPanel = wrapper.querySelector('[data-panel="godhand"]');
    const cameraPanel = wrapper.querySelector('[data-panel="camera"]');
    const reportPanel = wrapper.querySelector('[data-panel="report"]');
    if (overviewPanel) overviewPanel.innerHTML = renderOverview();
    if (worldtablePanel) worldtablePanel.innerHTML = renderWorldTable();
    if (godhandPanel) godhandPanel.innerHTML = renderGodHand();
    if (cameraPanel) cameraPanel.innerHTML = renderCamera();
    if (reportPanel) reportPanel.innerHTML = renderReport();
  };

  function buildUI() {
    const creatorPanel = document.getElementById("panel-creator-hub-v32");
    if (!creatorPanel) return;
    if (document.getElementById(SECTION_ID)) return;

    const wrapper = document.createElement("div");
    wrapper.id = SECTION_ID;
    wrapper.innerHTML = `
      <div class="xrf69-header">
        <div class="xrf69-title">🥽 XR Foundation V69</div>
        <div style="font-size:10px;color:#64748b">VR · AR · MR · Spatial Computing</div>
      </div>
      <div class="xrf69-tab-bar">
        <button class="xrf69-tab active" data-tab="overview" onclick="xrf69ShowTab('overview')">🖥️ Tổng Quan</button>
        <button class="xrf69-tab" data-tab="worldtable" onclick="xrf69ShowTab('worldtable')">🌍 World Table</button>
        <button class="xrf69-tab" data-tab="godhand" onclick="xrf69ShowTab('godhand')">🤚 God Hand</button>
        <button class="xrf69-tab" data-tab="camera" onclick="xrf69ShowTab('camera')">📷 Camera</button>
        <button class="xrf69-tab" data-tab="report" onclick="xrf69ShowTab('report')">📊 XR Report</button>
      </div>
      <div class="xrf69-panel active" data-panel="overview">${renderOverview()}</div>
      <div class="xrf69-panel" data-panel="worldtable">${renderWorldTable()}</div>
      <div class="xrf69-panel" data-panel="godhand">${renderGodHand()}</div>
      <div class="xrf69-panel" data-panel="camera">${renderCamera()}</div>
      <div class="xrf69-panel" data-panel="report">${renderReport()}</div>
    `;
    creatorPanel.appendChild(wrapper);
  }

  const _origHub = window.hubRenderPanel;
  window.hubRenderPanel = function (id) {
    if (_origHub) _origHub(id);
    if (id === "creator-hub-v32") {
      setTimeout(function () {
        buildUI();
        xrf69ShowTab(currentTab);
      }, 50);
    }
  };

  function init() {
    injectCSS();

    setTimeout(function () {
      buildUI();
      console.log("[xrFoundationRegistry V69] 🥽 XR Foundation UI sẵn sàng trong creator-hub-v32.");
    }, 500);

    if (typeof window.gameTick !== "undefined") {
      const _orig = window.gameTick;
      window.gameTick = function () {
        if (_orig) _orig();
      };
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 16000); });
  } else {
    setTimeout(init, 16000);
  }
})();
