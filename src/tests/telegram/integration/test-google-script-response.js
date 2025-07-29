/**
 * 🧪 ТЕСТ ВІДПОВІДІ GOOGLE APPS SCRIPT
 * Перевіряє чи повертається managerTelegramChatId
 */

const https = require('https');

// Конфігурація
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz3XE8u5O2Q9ez4OpKcyPB6TtrGp0ul6hPJsud4Dethj0fA2ixU7t4XCwJefl4EIgAd/exec';

/**
 * Тест замовлення до Google Apps Script
 */
function testGoogleScript() {
  const testOrder = {
    action: 'saveOrder',
    name: 'Тест Google Script Response',
    phone: '+380123456789',
    email: 'test-response@comspec.ua',
    product: 'Щебінь',
    deliveryType: 'delivery',
    address: 'м. Київ, вул. Тестова, 1',
    message: 'Тест відповіді Google Apps Script - перевірка managerTelegramChatId',
    source: 'google-script-response-test',
    mode: 'order'
  };

  const queryParams = new URLSearchParams(testOrder);
  const url = `${GOOGLE_SCRIPT_URL}?${queryParams.toString()}`;
  
  console.log('🧪 ТЕСТ ВІДПОВІДІ GOOGLE APPS SCRIPT');
  console.log('='.repeat(60));
  console.log(`🕒 Час: ${new Date().toLocaleString('uk-UA')}`);
  console.log('='.repeat(60));
  console.log(`📡 URL: ${url}`);
  console.log('📋 Дані замовлення:', testOrder);
  console.log('='.repeat(60));

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      console.log(`📊 HTTP Status: ${res.statusCode}`);
      console.log(`📊 Headers:`, res.headers);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\n📋 Повна відповідь Google Apps Script:');
        console.log(data);
        
        try {
          const result = JSON.parse(data);
          
          console.log('\n🔍 АНАЛІЗ ВІДПОВІДІ:');
          console.log('='.repeat(40));
          console.log(`✅ Success: ${result.success}`);
          console.log(`📝 Order ID: ${result.orderId}`);
          console.log(`👨‍💼 Manager: ${result.manager}`);
          console.log(`📞 Manager Phone: ${result.managerPhone}`);
          
          // КРИТИЧНЕ: Перевіряємо наявність Chat ID
          if (result.managerTelegramChatId) {
            console.log(`✅ Manager Telegram Chat ID: ${result.managerTelegramChatId}`);
          } else {
            console.log(`❌ Manager Telegram Chat ID: ВІДСУТНІЙ!`);
            console.log(`⚠️ Це пояснює чому Telegram повідомлення не надсилається`);
          }
          
          console.log(`📅 Date: ${result.date}`);
          console.log(`⏰ Time: ${result.time}`);
          console.log(`🗺️ Region: ${result.region}`);
          
          if (result.managerStats) {
            console.log(`📊 Manager Stats: ${JSON.stringify(result.managerStats)}`);
          }
          
          console.log('\n🎯 ВИСНОВОК:');
          if (result.managerTelegramChatId) {
            console.log('✅ Google Apps Script повертає Chat ID - Telegram повинен працювати');
          } else {
            console.log('❌ Google Apps Script НЕ повертає Chat ID');
            console.log('🔧 Потрібно перевірити функцію getTelegramChatId() в Google Apps Script');
          }
          
          console.log('='.repeat(60));
          resolve(result);
          
        } catch (error) {
          console.error('❌ Помилка парсингу JSON:', error.message);
          console.log('📋 Raw response:', data);
          reject(error);
        }
      });
    }).on('error', (error) => {
      console.error('🚨 HTTP помилка:', error.message);
      reject(error);
    });
  });
}

/**
 * Тест функції getTelegramChatId
 */
function testGetTelegramChatId() {
  const testParams = {
    action: 'testTelegram'
  };

  const queryParams = new URLSearchParams(testParams);
  const url = `${GOOGLE_SCRIPT_URL}?${queryParams.toString()}`;
  
  console.log('\n🧪 ТЕСТ ФУНКЦІЇ getTelegramChatId');
  console.log('='.repeat(60));
  console.log(`📡 URL: ${url}`);

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\n📋 Відповідь тесту Telegram функцій:');
        console.log(data);
        
        try {
          const result = JSON.parse(data);
          
          console.log('\n🔍 АНАЛІЗ TELEGRAM ТЕСТУ:');
          console.log('='.repeat(40));
          
          if (result.success && result.test1) {
            console.log(`✅ Test 1 passed: ${result.test1.passed}`);
            console.log(`👤 Manager found: ${result.test1.manager}`);
            console.log(`📱 Chat ID: ${result.test1.chatId}`);
            
            if (result.test1.chatId === '1559533342') {
              console.log('✅ Chat ID для Геннадія Дикого знайдено правильно!');
            } else {
              console.log('❌ Chat ID неправильний або відсутній');
            }
          } else {
            console.log('❌ Telegram тест провалився');
          }
          
          console.log('='.repeat(60));
          resolve(result);
          
        } catch (error) {
          console.error('❌ Помилка парсингу JSON:', error.message);
          reject(error);
        }
      });
    }).on('error', (error) => {
      console.error('🚨 HTTP помилка:', error.message);
      reject(error);
    });
  });
}

/**
 * Головна функція тестування
 */
async function runTests() {
  try {
    // Тест 1: Перевірка функції getTelegramChatId
    await testGetTelegramChatId();
    
    // Невелика затримка
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Тест 2: Реальне замовлення
    await testGoogleScript();
    
  } catch (error) {
    console.error('💥 Критична помилка тестування:', error);
    process.exit(1);
  }
}

// Запуск тестів
runTests();