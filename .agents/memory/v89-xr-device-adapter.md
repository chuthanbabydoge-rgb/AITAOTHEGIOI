---
name: V89 XR Device Adapter Architecture
description: 3 files adapter layer cho Meta Quest + Apple Vision Pro + WebXR — extends webxrSystem.js (KHÔNG ghi đè)
---

# V89 XR Device Adapter Architecture

## Rule
Adapter layer thuần, KHÔNG ghi đè webxrSystem.js, xrEngine.js, hay bất kỳ XR file cũ nào.

**Why:** webxrSystem.js (V1) là core XR renderer dùng Three.js — V89 chỉ detect thiết bị, route session, và bridge device-specific APIs.

**How to apply:** questBridgeOnSessionStart(session) và visionProBridgeOnSessionStart(session) được gọi tự động từ xrda89RequestSession(). Không cần gọi thủ công.

## 3 Files

| File | Chức Năng | Save Key | Init |
|---|---|---|---|
| `xrDeviceAdapter.js` | Device detection · Session manager · Render quality · Input profile | `cgv6_xr_device_adapter_v89` | 23700ms |
| `questBridge.js` | Meta Quest · Hand tracking 25 joints · Passthrough 3 modes · Haptics 2ch · Foveation L1-10 | `cgv6_quest_bridge_v89` | 23800ms |
| `visionProBridge.js` | Apple Vision Pro · Eye tracking binocular · Hand gestures · Spatial audio · Volume windows · Anchors | `cgv6_vision_pro_bridge_v89` | 23900ms |

## Public API

### xrDeviceAdapter
- `xrda89DetectDevice()` → Promise<deviceId string>
- `xrda89RequestSession(mode?)` → Promise<XRSession> — auto-routes đến questBridge hoặc visionProBridge
- `xrda89GetDevice()` → "meta_quest" | "apple_vision_pro" | "steamvr" | "hololens" | "desktop_webxr"
- `xrda89GetCaps()` → capability object
- `xrda89GetFeatures()` → {handTracking, eyeTracking, haptics, passthrough, spatialAudio, ...}
- `xrda89GetRenderQuality()` → {pixelRatio, targetFPS, foveatedRendering, ...}
- `xrda89GetInputProfile()` → {primaryInput, gestures, hapticChannels}

### questBridge
- `questBridgeOnSessionStart(session)` — lifecycle hook từ adapter
- `questBridgeProcessFrame(frame, refSpace)` — gọi mỗi frame từ render loop
- `qb89IsConnected()`, `qb89GetModel()`, `qb89GetHandState(hand)`, `qb89GetControllerState(hand)`
- `qb89SetPassthrough("disabled"|"overlay"|"full")`
- `qb89SetPerformance("battery"|"balanced"|"performance")`
- `qb89TriggerHaptic(hand, intensity, duration)` → Promise

### visionProBridge
- `visionProBridgeOnSessionStart(session)` — lifecycle hook từ adapter
- `visionProProcessFrame(frame, refSpace)` — gọi mỗi frame từ render loop
- `vpb89IsDetected()`, `vpb89GetEyeState()`, `vpb89GetHandState(hand)`
- `vpb89CreateAnchor(position, label)` → SpatialAnchor
- `vpb89OpenVolume(worldId, position)` → VolumeWindow
- `vpb89SetOrnament(enabled)` — 2D companion overlay
- `vpb89PlaySpatialAudio(soundId, position)`

## Device Routing
```
xrda89RequestSession()
  → Quest   → questBridgeOnSessionStart() → hand tracking, passthrough, haptics, foveation
  → VisionP → visionProBridgeOnSessionStart() → eye tracking, world understanding, light estimation
  → Others  → raw WebXR session, no bridge
```

## Pinch Gesture → God Intervention
Khi Quest/Vision Pro detect pinch gesture, tự động log và có thể gọi cgv51CastMiracle() nếu có.
