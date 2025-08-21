// simulate-analytics.js - Симуляція аналітичних подій для тестування
const https = require('https');
const querystring = require('querystring');

const ANALYTICS_URL = 'https://script.google.com/macros/s/AKfycbwOpFp2GGUucDkVT_H8pV-C4VPReeXjkRD4PdNx2WJMiBadl6lzrqO4uQcTihIgY2pj3w/exec';

// Тестові продукти для симуляції
const testProducts = [
  'gravel-0516', 'gravel-0820', 'gravel-1020', 'gravel-2040',
  'sand-river', 'sand-construction', 'crushed-stone-5-20',
  'concrete-m200', 'concrete-m300', 'asphalt-mix'
];

// Симуляція користувачів
const testUsers = [
  'user_test_001', 'user_test_002', 'user_test_003', 
  'user_test_004', 'user_test_005'
];

console.log('🎯 Симуляція аналітичних подій...');
console.log('📊 Продукти:', testProducts.length);
console.log('👥 Користувачі:', testUsers.length);

// Функція для створення випадкової події
function createRandomEvent() {
  const eventTypes = ['product_view', 'product_detail', 'add_to_cart', 'contact_inquiry'];
  const sources = ['organic_search', 'direct', 'social_media', 'referral'];
  
  return {
    timestamp: Date.now() - Math.random() * 86400000, // Випадковий час за останню добу
    date: new Date().toISOString().split('T')[0],
    event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    product_id: testProducts[Math.floor(Math.random() * testProducts.length)],
    user_id: testUsers[Math.floor(Math.random() * testUsers.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    extra_data: JSON.stringify({
      simulation: true,
      browser: 'NodeJS-Simulation',
      timestamp: new Date().toISOString(),
      session_duration: Math.floor(Math.random() * 600) + 30 // 30-630 секунд
    })
  };
}

// Функція відправки через JSONP
function sendEventViaJSONP(eventData) {
  return new Promise((resolve, reject) => {
    const callbackName = 'sim_callback_' + Date.now();
    
    const params = querystring.stringify({
      action: 'analytics',
      sheet: 'ProductEvents',
      data: JSON.stringify([eventData]),
      callback: callbackName
    });
    
    const url = `${ANALYTICS_URL}?${params}`;
    
    console.log(`📡 Відправка події: ${eventData.event_type} для ${eventData.product_id}`);
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ Успішна відправка: ${eventData.event_type}`);
          resolve({ success: true, data: data.substring(0, 200) });
        } else {
          console.log(`⚠️ Redirect ${res.statusCode} для: ${eventData.event_type}`);
          resolve({ success: false, statusCode: res.statusCode });
        }
      });
    }).on('error', (error) => {
      console.error(`❌ Помилка: ${eventData.event_type} - ${error.message}`);
      reject(error);
    });
  });
}

// Функція симуляції пакету подій
async function simulateEventBatch(eventCount = 5) {
  console.log(`\n🎯 Симуляція ${eventCount} подій...`);
  
  const events = [];
  for (let i = 0; i < eventCount; i++) {
    events.push(createRandomEvent());
  }
  
  console.log('📋 Створені події:');
  events.forEach((event, index) => {
    console.log(`  ${index + 1}. ${event.event_type} - ${event.product_id} (${event.user_id})`);
  });
  
  const results = [];
  
  // Відправляємо події з затримкою
  for (const event of events) {
    try {
      const result = await sendEventViaJSONP(event);
      results.push(result);
      
      // Затримка між відправками (1-3 секунди)
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
    } catch (error) {
      console.error(`❌ Помилка відправки: ${error.message}`);
      results.push({ success: false, error: error.message });
    }
  }
  
  return results;
}

// Головна функція
async function main() {
  console.log('\n🚀 Початок симуляції аналітики...');
  
  try {
    // Симулюємо 3 пакети по 5 подій
    for (let batch = 1; batch <= 3; batch++) {
      console.log(`\n📦 Пакет ${batch}/3`);
      const results = await simulateEventBatch(5);
      
      const successful = results.filter(r => r.success).length;
      const failed = results.length - successful;
      
      console.log(`📊 Результати пакету ${batch}: ✅ ${successful}, ❌ ${failed}`);
      
      // Пауза між пакетами
      if (batch < 3) {
        console.log('⏳ Пауза 5 секунд між пакетами...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    console.log('\n🎉 Симуляція завершена!');
    console.log('💡 Перевірте Google Sheets таблицю на наявність нових записів.');
    
  } catch (error) {
    console.error('\n❌ Критична помилка симуляції:', error);
  }
}

// Запуск при виклику з командного рядка
if (require.main === module) {
  main();
}