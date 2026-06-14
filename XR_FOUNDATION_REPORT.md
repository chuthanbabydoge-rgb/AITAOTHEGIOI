# XR FOUNDATION REPORT — Creator God V6 V69
> Ngày tạo: 2026-06-14  
> Phiên bản: V69 — XR Foundation Pass  
> Triết lý: "Thế Giới Phải Chạm Được Bằng Tay"

---

## Tầm Nhìn V69

**Trước V69:** Spatial visualization 2D (holographic aesthetic, Canvas 2D).  
**Sau V69:** XR Foundation — kiến trúc nền tảng cho VR/AR/MR/XR. Thế giới xuất hiện như sa bàn sống, điều khiển bằng tay thực.

---

## 1. Hệ Thống V69 — 5 Files

| File | Hệ Thống | Init |
|---|---|---|
| `xrEngine.js` | XR Core Engine: capability detection, device profiling, session management, World Table state | 15600ms |
| `xrInteractionSystem.js` | God Hand & Spatial Interaction: Pinch/Grab/Rotate/Scale/Point, touch gestures, hand tracking | 15700ms |
| `xrInputSystem.js` | XR Input Abstraction: Keyboard/Touch/Controller/Gaze/Gamepad unified event bus | 15800ms |
| `xrCameraSystem.js` | XR Camera System: Orbit/WorldTable/GodView/Flythrough, smooth animation, XR rig | 15900ms |
| `xrFoundationRegistry.js` | UI Registry: 5 tabs trong creator-hub-v32, patches hubRenderPanel() | 16000ms |

---

## 2. 5 Sub-tabs UI (creator-hub-v32)

```
🥽 V69 — XR Foundation
 ├─ 🖥️ Tổng Quan
 │    ├─ Device detection (Quest / Vision Pro / AR Glasses / Desktop / Mobile)
 │    ├─ XR Score 0-100
 │    ├─ Capabilities: WebXR / ImmersiveVR / ImmersiveAR / HandTracking / PlaneDetection
 │    ├─ World Table readiness
 │    ├─ God Hand readiness
 │    └─ Spatial Data V67 check
 │
 ├─ 🌍 World Table
 │    ├─ Animated visualization: sa bàn sống với world ball + tay thần
 │    ├─ World Table Mode status / scale / rotation
 │    ├─ God Hand gesture guide: Pinch/Grab/Rotate/Scale/Point
 │    ├─ Activate / Deactivate / Reset buttons
 │    └─ Thực thể đang chọn
 │
 ├─ 🤚 God Hand
 │    ├─ God Hand active status
 │    ├─ Tay trái / phải kết nối (XRHand API)
 │    ├─ Gesture real-time: Pinch / Grab / Rotate / Scale
 │    ├─ Action Log (10 entries gần nhất)
 │    └─ Toggle God Hand / Đổi tay chủ đạo
 │
 ├─ 📷 Camera
 │    ├─ Mode: orbit / worldTable / godView / flythrough
 │    ├─ Orbit: theta / phi / radius
 │    ├─ 5 Presets: Top-Down / Isometric / God View / Ground Level / Close-Up
 │    ├─ World Tour Flythrough (bay qua các quốc gia)
 │    └─ Auto-rotate toggle
 │
 └─ 📊 XR Report
      ├─ Meta Quest readiness score + bar
      ├─ Apple Vision Pro readiness score + bar
      ├─ AR Glasses readiness score + bar
      ├─ FPS Benchmark + performance grade
      ├─ Library check: Three.js / webxrSystem / spatialWorldEngine V67
      └─ Keyboard shortcut reference
```

---

## 3. Kiến Trúc XR Engine (xrEngine.js)

### Device Abstraction Layer
| Device | ID | Tier | Hand Tracking | Eye Tracking | Foveated | FPS |
|---|---|---|---|---|---|---|
| Meta Quest 3 | `meta_quest` | VR | ✅ | — | ✅ | 90 |
| Apple Vision Pro | `apple_vision_pro` | MR | ✅ | ✅ | ✅ | 90 |
| AR Glasses Android | `ar_glasses` | AR | — | — | — | 60 |
| Desktop Browser | `desktop` | Flat | — | — | — | 60 |
| Mobile Browser | `mobile` | Flat | — | — | — | 60 |

### Capability Detection
```javascript
navigator.xr.isSessionSupported("immersive-vr")  // VR
navigator.xr.isSessionSupported("immersive-ar")  // AR
window.XRHand                                     // Hand tracking API
window.XRPlane                                    // Plane detection
window.XRMesh                                     // Mesh detection
```

### World Table Mode
```
Scale:       0.01 (thế giới thu nhỏ xuống còn 1% để đặt lên bàn)
TableHeight: 0.8m (chiều cao bàn chuẩn AR)
TableRadius: 0.3m (bán kính sa bàn)
RotationY:   0 → 2π (xoay tự do)
GodHand:     true/false (chế độ tay thần)
```

### XR Readiness Score (0–100)
| Capability | Điểm |
|---|---|
| WebXR API | +20 |
| Immersive VR | +25 |
| Immersive AR | +25 |
| Hand Tracking | +15 |
| Plane Detection | +10 |
| Eye Tracking | +5 |

---

## 4. God Hand & Spatial Interaction (xrInteractionSystem.js)

### 5 Gesture Types
| Cử Chỉ | Mô Tả | API |
|---|---|---|
| 👌 **Pinch** | Ngón cái + trỏ chạm nhau (< 3cm) → Chọn / kích hoạt | `XRHand.get("thumb-tip")` + `index-finger-tip` |
| ✊ **Grab** | Ngón cái + giữa chạm nhau (< 6cm) → Nắm thế giới, di chuyển | `XRHand.get("middle-finger-tip")` |
| 🔄 **Rotate** | 2 tay xoay → Xoay sa bàn | Touch: `atan2(dy, dx)` delta |
| ↔️ **Scale** | 2 tay kéo/đẩy → Phóng to / Thu nhỏ | Touch: pinch distance ratio |
| 👆 **Point** | Controller ray → Nhắm entity | XR Controller ray cast |

### Touch Gesture Bridge (Mobile / Vision Pro)
```
2 ngón: pinch distance → scale (0.1× → 5.0×)
2 ngón: rotate angle → worldTable.rotation
1 ngón: drag → orbit camera yaw
```

### Mouse Fallback (Desktop)
```
Drag:          xoay sa bàn (orbit theta)
Ctrl + Drag:   di chuyển sa bàn (offset X/Z)
Scroll:        scale (0.9× / 1.1× per tick)
```

### Entity Selection Flow
```
User pinch / click / select trigger
  → xr69OnEntitySelect(entity, source) called
  → D.worldTable.selectedEntity updated
  → entitySelectCallbacks[] notified
  → sge67OnEntitySelect() called (V67 bridge)
  → God Mode tab reflects selected entity
```

---

## 5. XR Input System (xrInputSystem.js)

### Unified Event Bus
```javascript
xr69InputOn("selectStart", fn)    // XR controller trigger pressed
xr69InputOn("grabStart", fn)      // XR controller squeeze pressed
xr69InputOn("thumbstick", fn)     // Thumbstick axis movement
xr69InputOn("triggerPress", fn)   // Gamepad button 0
xr69InputOn("gazeReady", fn)      // Eye tracking (Vision Pro)
xr69InputOn("rotate", fn)         // Any rotate gesture
xr69InputOn("scale", fn)          // Any scale gesture
xr69InputOn("resetWorldTable", fn)
xr69InputOn("enterVR", fn)
xr69InputOn("enterAR", fn)
xr69InputOn("exitXR", fn)
```

### Keyboard Shortcuts
| Key | Action |
|---|---|
| W | Kích hoạt World Table Mode |
| V | Vào VR (immersive-vr) |
| A | Vào AR (immersive-ar) |
| G | Toggle God Hand |
| R | Reset World Table |
| F | Flat Mode |
| Esc | Thoát XR Session |
| ← → | Xoay sa bàn trái/phải |
| ↑ ↓ | Scale lên/xuống |

### XR Controller Support
```
controller.selectstart  → selectStart event
controller.selectend    → selectEnd event
controller.squeezestart → grabStart event (Grab gesture)
controller.squeezeend   → grabEnd event
gamepad.axes[2,3]       → thumbstick → auto-rotate world table
gamepad.buttons[0]      → triggerPress event
```

---

## 6. XR Camera System (xrCameraSystem.js)

### 4 Camera Modes
| Mode | Mô Tả |
|---|---|
| **orbit** | Quay quanh trung tâm — theta/phi/radius (mặc định) |
| **worldTable** | Nhìn xuống sa bàn — eye y=0.5m, lookAt y=-0.2m |
| **godView** | Thần nhìn xuống từ cao — phi 70°, radius 10+ |
| **flythrough** | Bay qua các waypoints — tự động theo quốc gia |

### 5 Camera Presets
| Preset | Phi | Radius | Dùng khi |
|---|---|---|---|
| topDown | 89° | 10 | Nhìn từ trên bản đồ |
| isometric | 45° | 8 | Góc nhìn mặc định |
| godView | 60° | 12 | Thần nhìn xuống thế giới |
| groundLevel | 11° | 6 | Nhìn ngang mực đất |
| closeUp | 36° | 3 | Zoom vào thực thể |

### XR Rig (Three.js)
```
Group "XRCameraRig"
 ├─ CircleGeometry floor (r=3, semi-transparent)
 └─ TorusGeometry ring (r=3, purple glow)
```

### World Flythrough
```
Auto-generate waypoints từ window.countries
  → Start: (0, 8, 0) — nhìn từ trên cao
  → Bay qua tối đa 6 quốc gia theo vòng tròn
  → Kết thúc: (0, 8, 0) — quay về điểm đầu
```

---

## 7. Tích Hợp Với Hệ Thống Cũ

### Extends (KHÔNG ghi đè)
| Hệ Thống | Cách Tích Hợp |
|---|---|
| `webxrSystem.js` (V1) | V69 là layer mới phía trên — không sửa XRSystem |
| `spatialWorldEngine.js` (V67) | Đọc `xrEngineV69Data.worldTableMode` → apply scale/rotation |
| `hologramMapSystem.js` (V67) | Entity select → `sge67OnEntitySelect()` bridge |
| `spatialGodModeV67.js` (V67) | Entity select propagates via `xr69OnEntitySelect()` |
| `creator-hub-v32` | Inject section, patch `hubRenderPanel()` |

### Global APIs Exposed
```javascript
// xrEngine.js
window.xr69GetCapabilities()          // Capability object
window.xr69GetDeviceProfile()         // Device profile object
window.xr69GetReadinessReport()       // Full readiness report
window.xr69RequestSession(type)       // Start VR/AR session
window.xr69EndSession()               // End active session
window.xr69ActivateWorldTable(config) // Enable World Table mode
window.xr69DeactivateWorldTable()     // Disable World Table mode
window.xr69MeasurePerformance()       // FPS benchmark

// xrInteractionSystem.js
window.xr69OnEntitySelect(entity, source)  // Handle entity select
window.xr69AttachToCanvas(canvasId)        // Setup gesture listeners
window.xr69SetupHandTracking(session)      // Setup XR hand tracking
window.xr69ProcessHandFrame(frame, refSpace) // Per-frame hand processing
window.xr69ResetWorldTable()               // Reset all interaction state
window.xr69OnGesture(type, callback)       // Register gesture handler
window.xr69OnEntitySelected(callback)      // Register entity select handler

// xrInputSystem.js
window.xr69InputOn(event, fn)             // Subscribe to input event
window.xr69InputEmit(event, data)         // Emit input event
window.xr69SetupControllers(renderer)     // Bind XR controllers
window.xr69SetupGaze(camera)             // Setup gaze input
window.xr69ProcessXRFrame(frame, refSpace, session) // Per-frame input
window.xr69MapKey(keyCode, action)        // Remap keyboard

// xrCameraSystem.js
window.xr69SetupOrbitCamera(camera)      // Init orbit camera
window.xr69ApplyOrbitSmooth(camera)      // Smooth orbit update (per frame)
window.xr69SetCameraPreset(name, camera) // Apply preset
window.xr69SetupWorldTableCamera(camera) // World Table camera config
window.xr69SetupXRRig(scene, THREE)      // Build XR camera rig
window.xr69StartFlythrough(waypoints, camera) // Start flythrough
window.xr69BuildWorldFlythrough()        // Auto-generate from countries[]
window.xr69EnableGodView(camera)         // Enable God View mode
window.xr69ToggleAutoRotate()            // Toggle auto-rotation
```

---

## 8. Đánh Giá Readiness Theo Thiết Bị

### 🥽 Meta Quest 3 — VR Readiness

| Hạng Mục | Trạng Thái | Ghi Chú |
|---|---|---|
| WebXR API | ✅ Hỗ trợ đầy đủ | Meta Browser, Oculus Browser |
| Immersive VR | ✅ Sẵn sàng | `immersive-vr` mode |
| Hand Tracking | ✅ Sẵn sàng | XRHand API, Pinch/Grab/Rotate |
| World Table | ✅ Sẵn sàng | Passthrough color MR mode |
| God Hand | ✅ Tối ưu | 2 tay hoàn toàn, 26 joints/tay |
| Controller | ✅ Sẵn sàng | Touch controller, trigger, squeeze |
| Plane Detection | ✅ Có | Đặt sa bàn lên bàn thật qua passthrough |
| Foveated Rendering | ✅ Có | Giảm tải GPU ở vùng ngoại vi |
| **Tổng Điểm** | **85/100** | **VR READY** |

### 🍎 Apple Vision Pro — MR Readiness

| Hạng Mục | Trạng Thái | Ghi Chú |
|---|---|---|
| WebXR API | ✅ Hỗ trợ | visionOS Safari |
| Immersive MR | ✅ Sẵn sàng | `immersive-ar` với passthrough |
| Hand Tracking | ✅ Tối ưu | XRHand + Eye tracking |
| Eye Tracking | ✅ Độc đáo | Gaze input → chọn thực thể bằng mắt |
| World Table | ✅ Tối ưu | Plane detection đặt lên bàn thật |
| God Hand | ✅ Tối ưu | Pinch gesture tự nhiên nhất |
| Spatial Audio | ⚠️ Chưa tích hợp | Cần V70+ |
| **Tổng Điểm** | **90/100** | **MR READY** |

### 👓 AR Glasses (Android WebXR) — AR Readiness

| Hạng Mục | Trạng Thái | Ghi Chú |
|---|---|---|
| WebXR API | ✅ Hỗ trợ | Chrome for Android |
| Immersive AR | ✅ Sẵn sàng | `immersive-ar` mode |
| Hand Tracking | ⚠️ Hạn chế | Tùy thiết bị |
| Plane Detection | ✅ Có | Đặt sa bàn lên bề mặt thật |
| God Hand | ⚠️ Touch fallback | Không có XRHand trên AR Glasses phổ thông |
| **Tổng Điểm** | **65/100** | **AR PARTIAL** |

### 🖥️ Desktop Browser — Flat Mode

| Hạng Mục | Trạng Thái | Ghi Chú |
|---|---|---|
| Canvas 2D holographic | ✅ Đầy đủ | V67 Spatial Engine |
| Mouse orbit/zoom | ✅ Đầy đủ | drag → rotate, scroll → scale |
| Keyboard shortcuts | ✅ Đầy đủ | W/V/A/G/R/Esc/←→/↑↓ |
| WebXR | ⚠️ Không | Cần browser + thiết bị XR |
| **Tổng Điểm** | **35/100** | **FLAT MODE** |

---

## 9. Roadmap Upgrade XR (Sau V69)

### V69 Foundation (HIỆN TẠI) — Đã Hoàn Thành
- ✅ Device abstraction (5 loại thiết bị)
- ✅ Capability detection (WebXR/VR/AR/Hand/Plane)
- ✅ God Hand System (Pinch/Grab/Rotate/Scale/Point)
- ✅ World Table Mode architecture
- ✅ XR Input unified event bus
- ✅ XR Camera System (4 modes, 5 presets, flythrough)
- ✅ 5 tabs UI trong creator-hub-v32
- ✅ Bridge với V67 Spatial Engine

### V70 — World Table VR (Tiếp Theo)
- Three.js world rendering trong WebXR session
- World Table on floor plane (AR plane detection)
- God Hand picks up countries → divine actions
- Spatial audio: nghe tiếng chiến trận từ vùng đang chọn

### V71 — Vision Pro Experience
- Eye tracking entity selection (nhìn vào quốc gia = chọn)
- Pinch gesture → mở menu quốc gia
- Spatial text labels (floating above countries)
- SharePlay / FaceTime world viewing

### V72 — Collaborative XR
- 2+ người cùng nhìn 1 World Table
- Mỗi người là 1 thần linh với tay riêng
- Shared divine actions visible to all

---

## 10. Save Keys

V69 là architecture foundation — **không có save key riêng** (tương tự V67 pure visual layer).  
State đọc từ và ghi vào các hệ thống cũ qua global objects.

Exception: `xrEngine.js` lưu một slim state vào `cgv6_xr_engine_v69` (device profile + log).

---

## 11. Checklist Yêu Cầu

| Yêu Cầu | File | Đáp Ứng |
|---|---|---|
| xrEngine.js | xrEngine.js | ✅ Device detection + session management |
| xrInteractionSystem.js | xrInteractionSystem.js | ✅ Pinch/Grab/Rotate/Scale/Point |
| xrInputSystem.js | xrInputSystem.js | ✅ Keyboard/Touch/Controller/Gaze |
| xrCameraSystem.js | xrCameraSystem.js | ✅ Orbit/WorldTable/GodView/Flythrough |
| Meta Quest support | xrEngine.js | ✅ Device profile + WebXR session |
| Apple Vision Pro | xrEngine.js | ✅ Eye tracking + visionOS detection |
| AR Glasses | xrEngine.js | ✅ AR profile + plane detection flag |
| Future XR Devices | xrEngine.js | ✅ Extensible profile system |
| Pinch gesture | xrInteractionSystem.js | ✅ XRHand + touch fallback |
| Grab gesture | xrInteractionSystem.js | ✅ XRHand + Ctrl+drag fallback |
| Rotate gesture | xrInteractionSystem.js | ✅ 2-finger + mouse drag |
| Scale gesture | xrInteractionSystem.js | ✅ 2-finger pinch + scroll wheel |
| Point gesture | xrInteractionSystem.js | ✅ Controller ray + mouse |
| World Table Mode | xrEngine.js + xrInteractionSystem.js | ✅ Scale 1% + rotate + offset |
| God Hand System | xrInteractionSystem.js | ✅ Pinch threshold + gesture detection |
| Không build gameplay mới | All | ✅ Pure foundation layer |
| Không build MMO | All | ✅ |
| Không tạo sidebar tab mới | xrFoundationRegistry.js | ✅ Inject creator-hub-v32 |
| EXPAND ONLY | All | ✅ Không ghi đè bất kỳ file cũ |
| XR_FOUNDATION_REPORT.md | XR_FOUNDATION_REPORT.md | ✅ |

---

## 12. Technical: Coordinate System Compatibility

```
V67 Spatial Engine:     normalized (-0.5 to 0.5) world coords
Three.js WebGL:         same XYZ with SCALE factor (0.05 default)
WebXR Reference Space:  local-floor (Y=0 là sàn nhà)
World Table:            world scaled × 0.01 → đặt trong radius 0.3m

Upgrade Path V67 → V70 Full XR:
  swe67BuildWorldNodes() → nodes[] có x,y,z normalized
  → multiply by SCALE (0.05) → Three.js world units
  → render as mesh spheres in WebXR scene
  → World Table: multiply by 0.01 → table-scale (3cm per unit)
```

---

*XR_FOUNDATION_REPORT V69 — 2026-06-14*  
*"Thế Giới Phải Chạm Được Bằng Tay"*  
*"Từ Spatial 2D → XR Foundation → Full VR/AR/MR"*
