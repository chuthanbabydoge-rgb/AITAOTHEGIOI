# PRODUCTION DEPLOYMENT GUIDE — Creator God V6
> Ngày: 2026-06-14
> Architecture: Vanilla JS · Static Server · Node.js Proxy · localStorage

---

## 🏗️ KIẾN TRÚC PRODUCTION

```
[Browser / XR Headset]
        │
        ▼
[CDN / Edge Cache]  ← static JS, CSS, HTML
        │
        ▼
[Node.js serve.js]  ← port 5000 / 80 / 443
        │
        ├── GET /* → serve static files
        └── POST /api/claude → Anthropic API proxy
                    │
                    ▼
            [Anthropic Claude API]
            (AI_INTEGRATIONS_ANTHROPIC_API_KEY)
```

**Không có database. Không có backend sessions. Tất cả state trong localStorage của browser.**

---

## 🔧 SERVER SETUP

### 1. Environment Variables (Bắt Buộc)
```bash
# Anthropic API — đã có qua Replit AI Integration
AI_INTEGRATIONS_ANTHROPIC_API_KEY=<auto-provisioned>
AI_INTEGRATIONS_ANTHROPIC_BASE_URL=<auto-provisioned>

# Optional overrides
PORT=5000
NODE_ENV=production
```

### 2. `serve.js` — Server Hiện Tại
Server đã đầy đủ tính năng:
- Serve static files (HTML/JS/CSS/Images)
- Proxy `/api/claude` → Anthropic API (server-side, key không lộ ra browser)
- MIME type mapping cho tất cả asset types
- Error handling (404, 500)

### 3. Production Hardening (Thêm vào serve.js)
```javascript
// Thêm vào serve.js để production-ready:

// Rate limiting /api/claude
const claudeRateMap = new Map();
function checkRateLimit(ip) {
  const now = Date.now();
  const window = claudeRateMap.get(ip) || { count: 0, reset: now + 60000 };
  if (now > window.reset) { window.count = 0; window.reset = now + 60000; }
  window.count++;
  claudeRateMap.set(ip, window);
  return window.count <= 20; // 20 req/min per IP
}

// Security headers
res.setHeader("X-Content-Type-Options", "nosniff");
res.setHeader("X-Frame-Options", "SAMEORIGIN");
res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

// Cache control cho static assets
if (ext === '.js' || ext === '.css') {
  res.setHeader("Cache-Control", "public, max-age=3600"); // 1 hour
} else if (ext === '.html') {
  res.setHeader("Cache-Control", "no-cache");
}

// Gzip compression
const zlib = require('zlib');
// wrap res.end với zlib.gzip nếu Accept-Encoding bao gồm gzip
```

---

## 🚀 REPLIT DEPLOYMENT (Hiện Tại)

### Cấu Hình `.replit`
```toml
modules = ["nodejs-20", "web", "nix"]

[workflows]
runButton = "Project"

[[workflows.workflow]]
name = "Start application"
[[workflows.workflow.tasks]]
task = "shell.exec"
args = "node serve.js"
waitForPort = 5000

[[ports]]
localPort = 5000
externalPort = 80
```

### Publish trên Replit
1. Click **Deploy** trong Replit UI
2. Chọn "Autoscale" deployment
3. Set environment variables trong Replit Secrets
4. URL sẽ là `*.replit.app`

### Replit Secrets (Đã configured)
- `AI_INTEGRATIONS_ANTHROPIC_API_KEY` — auto-provisioned bởi Anthropic AI Integration

---

## 🌐 CUSTOM DOMAIN DEPLOYMENT

### Option A: Cloudflare + VPS
```bash
# VPS setup (Ubuntu 22.04)
apt install nodejs npm nginx certbot

# Clone repo
git clone <repo> /var/www/creatorgodv6
cd /var/www/creatorgodv6
npm install

# PM2 process manager
npm install -g pm2
pm2 start serve.js --name creatorgodv6
pm2 save
pm2 startup

# Nginx config
cat > /etc/nginx/sites-available/creatorgod << 'EOF'
server {
    listen 80;
    server_name creatorgod.app;
    
    # Gzip
    gzip on;
    gzip_types text/javascript application/javascript text/css;
    gzip_min_length 1024;
    
    # Cache static JS/CSS
    location ~* \.(js|css)$ {
        proxy_pass http://localhost:5000;
        add_header Cache-Control "public, max-age=3600";
    }
    
    # No cache HTML
    location = / {
        proxy_pass http://localhost:5000;
        add_header Cache-Control "no-cache";
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

certbot --nginx -d creatorgod.app
```

### Option B: Vercel / Cloudflare Pages
**Không khuyến nghị** — project cần Node.js server cho `/api/claude` proxy.
Nếu dùng Vercel: tách `/api/claude` thành Vercel Serverless Function.

### Option C: Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "serve.js"]
```

```bash
docker build -t creatorgodv6 .
docker run -p 5000:5000 \
  -e AI_INTEGRATIONS_ANTHROPIC_API_KEY=$KEY \
  creatorgodv6
```

---

## 📱 XR DEPLOYMENT

### Meta Quest (App Lab)
1. Build không cần thay đổi — WebXR chạy trực tiếp trong Quest Browser
2. Submit URL lên Meta App Lab tại `developers.meta.com`
3. Yêu cầu: HTTPS + valid SSL cert
4. QA: Test với Quest 2, Quest 3, Quest Pro
5. Thêm `questBridge.js` + `xrDeviceAdapter.js` vào index.html ✅ (đã làm)

### Apple Vision Pro (TestFlight)
1. Cần Apple Developer Account ($99/năm)
2. Safari trên visionOS hỗ trợ WebXR (flag)
3. Hoặc build wrapper app với WKWebView + WebXR entitlement
4. `visionProBridge.js` tự động detect visionOS UA ✅ (đã làm)

### WebXR URL Requirements
- HTTPS bắt buộc (không chạy trên HTTP với WebXR)
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

---

## 🔒 SECURITY CHECKLIST PRODUCTION

```nginx
# Security headers (Nginx)
add_header X-Content-Type-Options "nosniff";
add_header X-Frame-Options "SAMEORIGIN";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Permissions-Policy "xr-spatial-tracking=(*), camera=()";

# Content Security Policy (điều chỉnh theo CDN dùng)
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'unsafe-inline' cdnjs.cloudflare.com cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  font-src fonts.gstatic.com;
  connect-src 'self' api.anthropic.com;
  img-src 'self' data:;
  worker-src 'self' blob:;
";
```

---

## 📊 MONITORING & OBSERVABILITY

### Uptime Monitoring (Miễn Phí)
```javascript
// Thêm health endpoint vào serve.js
if (req.url === '/health') {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({
    status: 'ok',
    version: 'V89',
    uptime: process.uptime(),
    memory: process.memoryUsage().heapUsed,
    timestamp: Date.now()
  }));
  return;
}
```

Dùng **UptimeRobot** (free) ping `/health` mỗi 5 phút.

### Error Tracking
```html
<!-- Thêm vào index.html trước </head> -->
<script>
window.addEventListener('error', function(evt) {
  fetch('/api/log-error', {
    method: 'POST',
    body: JSON.stringify({
      message: evt.message,
      filename: evt.filename,
      line: evt.lineno,
      col: evt.colno,
      version: 'V89'
    })
  }).catch(() => {});
});
</script>
```

### Analytics (Built-in V88)
- `ae88GetDashboard()` — full analytics dashboard
- Metrics: World Growth, NPC Activity, XR Usage, Creator Activity
- Time series, trends, session tracking — tất cả trong localStorage

---

## 💰 CHI PHÍ VẬN HÀNH ƯỚC TÍNH

| Hạng Mục | Miễn Phí | Trả Tiền |
|---|---|---|
| Hosting (Replit Autoscale) | Free tier < 1GB RAM | $7/tháng |
| Hosting (VPS) | — | $6-20/tháng |
| Anthropic API | — | ~$0.03-0.15/call |
| CDN (Cloudflare) | Free (100GB/tháng) | $20/tháng |
| Domain | — | $12/năm |
| SSL (Let's Encrypt) | Free | — |
| Monitoring (UptimeRobot) | Free | — |
| **Tổng (100 DAU)** | **~$0** | **~$30-50/tháng** |
| **Tổng (1000 DAU)** | — | **~$150-300/tháng** |
| **Tổng (10000 DAU)** | — | **~$800-2000/tháng** |

**Chi phí lớn nhất: Anthropic API.** Với V84 AI Cost Manager (cache + routing), giảm được ~80-94%.

---

## 🔄 DEPLOYMENT RUNBOOK

```bash
# Deploy mới (manual)
git pull origin main
npm install
pm2 restart creatorgodv6

# Rollback
git checkout v88-stable
pm2 restart creatorgodv6

# Check logs
pm2 logs creatorgodv6 --lines 100

# Health check
curl https://creatorgod.app/health
```

---

## 📋 POST-DEPLOY VERIFICATION

1. `https://domain.com/` → index.html load OK
2. `https://domain.com/health` → `{"status":"ok"}`
3. `POST https://domain.com/api/claude` → Anthropic response OK
4. localStorage set/get hoạt động trong browser
5. gameTick() chạy mượt (không crash sau 100 tick)
6. WebXR: `navigator.xr.isSessionSupported("immersive-vr")` → true (trên headset)
7. Backup engine auto-backup sau 500 tick
8. Analytics engine ghi metrics
