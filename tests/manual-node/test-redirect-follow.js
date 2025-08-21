// test-redirect-follow.js - Слідуємо за redirect щоб побачити що насправді повертається
const https = require('https');

console.log('🔍 Тестування redirect від Google Apps Script v3.2...');

const ANALYTICS_URL = 'https://script.google.com/macros/s/AKfycbwOpFp2GGUucDkVT_H8pV-C4VPReeXjkRD4PdNx2WJMiBadl6lzrqO4uQcTihIgY2pj3w/exec?action=test';

function followRedirect() {
  return new Promise((resolve, reject) => {
    console.log('📡 Запит до:', ANALYTICS_URL);
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    https.get(ANALYTICS_URL, options, (res) => {
      console.log(`📊 Початковий статус: ${res.statusCode}`);
      
      if (res.statusCode === 302 && res.headers.location) {
        console.log('🔄 Знайдено redirect на:', res.headers.location);
        console.log('⏳ Слідуємо за redirect...');
        
        // Слідуємо за redirect
        https.get(res.headers.location, (redirectRes) => {
          console.log(`📊 Redirect статус: ${redirectRes.statusCode}`);
          
          let data = '';
          redirectRes.on('data', (chunk) => data += chunk);
          
          redirectRes.on('end', () => {
            console.log(`📦 Redirect response (${data.length} chars):`, data.substring(0, 500));
            
            // Перевіряємо чи є це JSON з нашим кодом
            try {
              const parsed = JSON.parse(data);
              if (parsed.version === 'v3.2') {
                console.log('🎉 SUCCESS! Знайшли працюючий v3.2 код через redirect!');
                console.log('📋 Response:', JSON.stringify(parsed, null, 2));
              } else {
                console.log('⚠️ JSON response, але не наш код:', parsed);
              }
            } catch (error) {
              console.log('⚠️ Redirect response не є JSON');
              
              // Перевіряємо чи є текст "v3.2" в response
              if (data.includes('v3.2')) {
                console.log('✅ Знайшли згадку v3.2 в response!');
              } else {
                console.log('❌ Немає згадки v3.2 в response');
              }
            }
            
            resolve({ 
              originalStatus: res.statusCode, 
              redirectStatus: redirectRes.statusCode, 
              hasV32: data.includes('v3.2'),
              dataSnippet: data.substring(0, 200)
            });
          });
          
        }).on('error', (error) => {
          console.error('❌ Redirect Error:', error.message);
          reject(error);
        });
        
      } else {
        console.log('❌ Немає redirect або status не 302');
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          resolve({ 
            originalStatus: res.statusCode, 
            redirectStatus: null, 
            hasV32: data.includes('v3.2'),
            dataSnippet: data.substring(0, 200)
          });
        });
      }
      
    }).on('error', (error) => {
      console.error('❌ Request Error:', error.message);
      reject(error);
    });
  });
}

// Запуск
followRedirect().then(result => {
  console.log('\n' + '='.repeat(40));
  console.log('📊 РЕЗУЛЬТАТ ТЕСТУ REDIRECT:');
  console.log('='.repeat(40));
  console.log(`Початковий статус: ${result.originalStatus}`);
  console.log(`Redirect статус: ${result.redirectStatus || 'N/A'}`);
  console.log(`Містить v3.2: ${result.hasV32 ? '✅ Так' : '❌ Ні'}`);
  console.log(`Фрагмент даних: ${result.dataSnippet}`);
}).catch(error => {
  console.error('💥 Тест провалився:', error);
});