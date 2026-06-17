const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SHARED_WORLDS_DIR = path.join(__dirname, 'shared_worlds');
if (!fs.existsSync(SHARED_WORLDS_DIR)) fs.mkdirSync(SHARED_WORLDS_DIR, { recursive: true });

const PORT = 5000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {

  // ── CORS headers ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── POST /api/share — lưu world snapshot ──
  if (req.method === 'POST' && req.url === '/api/share') {
    try {
      const body = await readBody(req);
      const snap = JSON.parse(body);
      const id = crypto.randomBytes(8).toString('hex');
      const filePath = path.join(SHARED_WORLDS_DIR, id + '.json');
      fs.writeFileSync(filePath, JSON.stringify(snap));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ── GET /api/share/:id — lấy world snapshot ──
  const shareMatch = req.method === 'GET' && req.url.match(/^\/api\/share\/([a-f0-9]+)$/);
  if (shareMatch) {
    try {
      const id = shareMatch[1];
      const filePath = path.join(SHARED_WORLDS_DIR, id + '.json');
      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Không tìm thấy thế giới' }));
        return;
      }
      const data = fs.readFileSync(filePath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ── GET /view — trả về worldViewer.html ──
  if (req.method === 'GET' && req.url.startsWith('/view')) {
    try {
      const viewerPath = path.join(__dirname, 'worldViewer.html');
      const data = fs.readFileSync(viewerPath);
      res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-store' });
      res.end(data);
    } catch (err) {
      res.writeHead(404); res.end('Not Found');
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/claude') {
    try {
      const body = await readBody(req);
      const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
      const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
      if (!apiKey) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Anthropic API key not configured on server' }));
        return;
      }
      const https = require('https');
      const url = require('url');
      const target = baseURL ? url.parse(baseURL + '/v1/messages') : { hostname: 'api.anthropic.com', path: '/v1/messages' };
      const options = {
        hostname: target.hostname,
        path: target.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
      };
      const proxyReq = https.request(options, proxyRes => {
        let data = '';
        proxyRes.on('data', chunk => { data += chunk; });
        proxyRes.on('end', () => {
          res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
          res.end(data);
        });
      });
      proxyReq.on('error', err => {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      });
      proxyReq.write(body);
      proxyReq.end();
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  const cleanUrl = req.url.split('?')[0];
  let filePath = path.join(__dirname, cleanUrl === '/' ? 'index.html' : cleanUrl);

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Not Found');
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
