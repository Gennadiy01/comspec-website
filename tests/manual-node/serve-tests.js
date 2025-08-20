// serve-tests.js - Простий HTTP сервер для тестових файлів
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8080;

// MIME типи для різних файлів
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.md': 'text/markdown'
};

function serveFile(filePath, res) {
  const ext = path.extname(filePath);
  const mimeType = mimeTypes[ext] || 'text/plain';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // Додаємо CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  const urlPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(__dirname, 'tests', urlPath.substring(1));
  
  console.log(`📄 Request: ${req.method} ${req.url}`);
  console.log(`📁 Looking for: ${filePath}`);
  
  if (req.url === '/') {
    // Головна сторінка тестів
    const indexHtml = `
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🧪 COMSPEC Test Suite</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; }
        .category { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .test-link { display: block; margin: 10px 0; padding: 10px; background: #007cba; color: white; text-decoration: none; border-radius: 4px; }
        .test-link:hover { background: #005a8b; }
    </style>
</head>
<body>
    <h1>🧪 COMSPEC Test Suite</h1>
    
    <div class="category">
        <h2>📊 Analytics Tests</h2>
        <a href="/analytics/test-analytics.html" class="test-link">Basic Analytics Test</a>
    </div>
    
    <div class="category">
        <h2>🖥️ Manual Browser Tests</h2>
        <a href="/manual-browser/test-new-analytics.html" class="test-link">Advanced Analytics Test</a>
        <a href="/manual-browser/test-popular-products.html" class="test-link">Popular Products Test</a>
        <a href="/manual-browser/test-live-order.html" class="test-link">Live Order Test</a>
        <a href="/manual-browser/test-real-analytics.html" class="test-link">Real Analytics Test</a>
    </div>
    
    <div class="category">
        <h2>📁 Documentation</h2>
        <a href="/analytics/MINIMAL_GOOGLE_SCRIPT_TEST.md" class="test-link">Google Script Test Documentation</a>
        <a href="/README.md" class="test-link">Tests README</a>
    </div>
    
    <h3>ℹ️ Instructions</h3>
    <p>1. Ensure main site is running on <strong>http://localhost:3000</strong></p>
    <p>2. Click any test above to run it</p>
    <p>3. Most tests will interact with the main site for full functionality</p>
</body>
</html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(indexHtml);
    return;
  }
  
  // Перевіряємо чи файл існує
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404);
      res.end(`File not found: ${filePath}`);
      return;
    }
    
    serveFile(filePath, res);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Test server started on http://localhost:${PORT}`);
  console.log(`📊 Available tests:`);
  console.log(`   Analytics: http://localhost:${PORT}/analytics/test-analytics.html`);
  console.log(`   Advanced:  http://localhost:${PORT}/manual-browser/test-new-analytics.html`);
  console.log(`   Products:  http://localhost:${PORT}/manual-browser/test-popular-products.html`);
  console.log('');
  console.log(`💡 Make sure main site is running on http://localhost:3000`);
  
  // Автоматично відкриваємо браузер (опціонально)
  if (process.argv.includes('--open')) {
    const start = process.platform === 'win32' ? 'start' : 'open';
    spawn(start, [`http://localhost:${PORT}`], { shell: true });
  }
});