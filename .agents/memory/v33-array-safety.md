---
name: V33 Array Safety Pattern
description: kingdomData.kingdoms và empireData.empires có thể là Object thay vì Array — cần kiểm tra trước khi gọi .filter()
---

## Vấn đề
`window.kingdomData.kingdoms` và `window.empireData.empires` không phải lúc nào cũng là Array.
Có thể là plain Object `{ id1: {...}, id2: {...} }` thay vì `[{...}, {...}]`.

## Pattern đúng
```javascript
function _toArr(val) {
  if (!val) return [];
  return Array.isArray(val) ? val : Object.values(val);
}
const kingdoms = _toArr(window.kingdomData && window.kingdomData.kingdoms);
const kingdoms = _toArr(window.empireData && window.empireData.empires);
```

**Why:** TypeError: x.filter is not a function xuất hiện ở worldAlertEngine.js init khi game đã có save data với kingdoms là Object format. Phát hiện ở V33.

**How to apply:** Bất kỳ file engine nào đọc kingdomData.kingdoms hoặc empireData.empires phải dùng _toArr() hoặc kiểm tra Array.isArray() trước khi .filter()/.map()/.forEach().
