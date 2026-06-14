---
name: V90 PUOS Shell Architecture
description: CSS body-class approach for full-screen overlay, why JS style manipulation fails, serve.js cache busting, init timing.
---

## Kiến trúc PUOS Shell V90

7 files: `puosShell.js` + `puosMyUniverse.js` + `puosWorldsPanel.js` + `puosCivPanel.js` + `puosHubPanel.js` + `puosJarvis.js` + `puosSettings.js`

Init timeout: **24000ms** (chạy SAU toàn bộ engine cũ).

## Rule Quan Trọng: CSS Class Approach

**KHÔNG dùng JS để ẩn body siblings** (`element.style.display = 'none'`).

Lý do: Nhiều engine (timeControlSystem, particleCanvas, animation loops) gọi `element.style.display = 'block'` định kỳ, override JS manipulation.

**ĐÚNG**: Thêm class `puos-mode` lên `document.body`, rồi dùng CSS:
```css
body.puos-mode > *:not(#puos-shell) { display:none!important; visibility:hidden!important; }
body.puos-mode { background:#050a14!important; overflow:hidden!important; }
#puos-shell { position:fixed!important; z-index:2147483647!important; ... }
```

CSS `!important` beats bất kỳ inline `element.style` nào (không có `!important`).

## Pitfall: `!important` trong `setAttribute('style', ...)`

`element.setAttribute('style', 'display:none!important')` → **VÔ HIỆU** — `!important` không hợp lệ trong inline style. CSS `!important` chỉ có tác dụng trong stylesheet (`<style>` tag hoặc CSS file).

## CSS Inject Pattern

Dùng `injectStyle()` tạo `<style id="puos-style">` tag, append vào `document.head`. Nội dung là array of CSS strings joined với newline.

## Serve.js Cache Busting

`/?v=N` cache-busting URLs chỉ hoạt động nếu `serve.js` strip query params trước khi resolve file path. Nếu không, server sẽ 404 cho `/?v=2`.

## Z-Index

Max safe z-index: **2147483647** (max 32-bit signed int). Dùng `!important` trong stylesheet để đảm bảo thắng mọi inline style.

## Init Pattern

```js
function enterPuosMode() { document.body.classList.add('puos-mode'); }
function exitPuosMode()  { document.body.classList.remove('puos-mode'); }
```

Classic Mode button gọi `exitPuosMode()` + show original panels.

**Why:** CSS engine re-evaluates selector match khi DOM thay đổi — ngay cả khi animation loop thêm element mới vào body, `body.puos-mode > *:not(#puos-shell)` tự động hide nó.
