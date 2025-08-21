// test-simple-get.js - Простий GET тест для нового deployment
const https = require('https');

const ANALYTICS_URL = 'https://script.google.com/macros/s/AKfycbwOpFp2GGUucDkVT_H8pV-C4VPReeXjkRD4PdNx2WJMiBadl6lzrqO4uQcTihIgY2pj3w/exec';

console.log('🧪 Простий GET тест нового deployment...');
console.log('🔗 URL:', ANALYTICS_URL);

// Додаємо cache buster для уникнення кешування
const testUrl = `${ANALYTICS_URL}?action=test&_t=${Date.now()}`;

console.log('📡 Тест URL:', testUrl);

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
};

https.get(testUrl, options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, JSON.stringify(res.headers, null, 2));
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📦 Response Body:', data);
    
    if (res.statusCode === 200) {
      try {
        const parsed = JSON.parse(data);
        console.log('✅ SUCCESS! Parsed JSON:', JSON.stringify(parsed, null, 2));
      } catch (error) {
        console.log('⚠️ Response не JSON, але статус 200');
      }
    } else {
      console.log(`❌ Status ${res.statusCode} - все ще redirect або помилка`);
    }
  });
  
}).on('error', (error) => {
  console.error('❌ Request Error:', error.message);
});