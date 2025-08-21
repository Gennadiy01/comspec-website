// test-deployment-v32.js - Тест нового deployment v3.2
const https = require('https');

const ANALYTICS_URL = 'https://script.google.com/macros/s/AKfycbwOpFp2GGUucDkVT_H8pV-C4VPReeXjkRD4PdNx2WJMiBadl6lzrqO4uQcTihIgY2pj3w/exec';

console.log('🧪 Тест Google Apps Script v3.2 deployment...');
console.log('🔗 URL:', ANALYTICS_URL);
console.log('⏰ Час:', new Date().toISOString());
console.log('========================================');

// Тест 1: Простий GET без параметрів
function testSimpleGet() {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 ТЕСТ 1: Простий GET без параметрів');
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    };

    https.get(ANALYTICS_URL, options, (res) => {
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`📋 Headers: ${JSON.stringify(res.headers, null, 2)}`);
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      
      res.on('end', () => {
        console.log(`📦 Response (${data.length} chars):`, data.substring(0, 500));
        resolve({ test: 1, status: res.statusCode, data: data.substring(0, 200) });
      });
      
    }).on('error', (error) => {
      console.error('❌ Error:', error.message);
      reject(error);
    });
  });
}

// Тест 2: GET з action=test
function testGetWithAction() {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 ТЕСТ 2: GET з action=test');
    
    const testUrl = `${ANALYTICS_URL}?action=test&_v32=${Date.now()}`;
    console.log('🔗 Test URL:', testUrl);
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cache-Control': 'no-cache'
      }
    };

    https.get(testUrl, options, (res) => {
      console.log(`📊 Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      
      res.on('end', () => {
        console.log(`📦 Response:`, data.substring(0, 300));
        
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            if (parsed.version === 'v3.2') {
              console.log('✅ SUCCESS! Версія v3.2 працює!');
              console.log('📋 Parsed:', JSON.stringify(parsed, null, 2));
            } else {
              console.log('⚠️ Response OK, але версія не v3.2:', parsed.version);
            }
          } catch (error) {
            console.log('⚠️ Response 200, але не JSON');
          }
        } else {
          console.log('❌ Status не 200');
        }
        
        resolve({ test: 2, status: res.statusCode, hasVersion32: data.includes('v3.2') });
      });
      
    }).on('error', (error) => {
      console.error('❌ Error:', error.message);
      reject(error);
    });
  });
}

// Тест 3: POST з базовими даними
function testPostBasic() {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 ТЕСТ 3: POST з базовими даними');
    
    const postData = JSON.stringify({
      action: 'test',
      version: 'v3.2',
      timestamp: Date.now()
    });
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    console.log('📤 POST Data:', postData);
    
    const req = https.request(ANALYTICS_URL, options, (res) => {
      console.log(`📊 POST Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      
      res.on('end', () => {
        console.log(`📦 POST Response:`, data.substring(0, 300));
        resolve({ test: 3, status: res.statusCode, hasVersion32: data.includes('v3.2') });
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ POST Error:', error.message);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// Головна функція
async function main() {
  try {
    console.log('🚀 Початок комплексного тестування v3.2...\n');
    
    const results = [];
    
    // Виконуємо тести послідовно з затримками
    console.log('⏳ Тест 1...');
    const result1 = await testSimpleGet();
    results.push(result1);
    
    console.log('\n⏳ Затримка 3 секунди...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('⏳ Тест 2...');
    const result2 = await testGetWithAction();
    results.push(result2);
    
    console.log('\n⏳ Затримка 3 секунди...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('⏳ Тест 3...');
    const result3 = await testPostBasic();
    results.push(result3);
    
    // Підсумок
    console.log('\n' + '='.repeat(50));
    console.log('📊 ПІДСУМОК ТЕСТУВАННЯ:');
    console.log('='.repeat(50));
    
    results.forEach((result, index) => {
      const status = result.status === 200 ? '✅' : result.status === 302 ? '🔄' : '❌';
      const version = result.hasVersion32 ? '✅ v3.2' : '❌ не v3.2';
      console.log(`Тест ${result.test}: ${status} Status ${result.status}, ${version}`);
    });
    
    const successCount = results.filter(r => r.status === 200).length;
    const redirectCount = results.filter(r => r.status === 302).length;
    
    console.log(`\n📈 Результат: ${successCount}/3 успішних, ${redirectCount}/3 redirects`);
    
    if (successCount > 0) {
      console.log('🎉 Deployment v3.2 частково працює!');
    } else if (redirectCount === 3) {
      console.log('⚠️ Всі тести дають 302 - можливо треба більше часу для кеша');
    } else {
      console.log('❌ Проблеми з deployment v3.2');
    }
    
  } catch (error) {
    console.error('💥 Критична помилка тестування:', error);
  }
}

// Запуск
main();