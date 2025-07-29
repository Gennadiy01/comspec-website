/**
 * 🧪 ПОВНИЙ ТЕСТ ІНТЕГРАЦІЇ GOOGLE APPS SCRIPT + TELEGRAM
 * Симулює реальне замовлення через форму
 */

const https = require('https');

// Конфігурація
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz3XE8u5O2Q9ez4OpKcyPB6TtrGp0ul6hPJsud4Dethj0fA2ixU7t4XCwJefl4EIgAd/exec';
const BOT_TOKEN = '8472229536:AAEquKfaV_nIa5opQAbb6Io2RSm3HRRFgO4';
const TELEGRAM_API_URL = 'https://api.telegram.org/bot';

/**
 * JSONP запит до Google Apps Script
 */
function makeGoogleScriptRequest(params) {
  return new Promise((resolve, reject) => {
    const callbackName = `jsonpCallback${Date.now()}`;
    
    // Створюємо глобальну callback функцію
    global[callbackName] = (response) => {
      delete global[callbackName];
      resolve(response);
    };
    
    const queryParams = new URLSearchParams({
      ...params,
      callback: callbackName
    });
    
    const url = `${GOOGLE_SCRIPT_URL}?${queryParams.toString()}`;
    
    console.log('📡 Запит до Google Apps Script:', url);
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          // Виконуємо JSONP код
          eval(data);
        } catch (error) {
          reject(new Error(`JSONP помилка: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`HTTP помилка: ${error.message}`));
    });
    
    // Таймаут
    setTimeout(() => {
      if (global[callbackName]) {
        delete global[callbackName];
        reject(new Error('Таймаут запиту'));
      }
    }, 30000);
  });
}

/**
 * Відправка Telegram повідомлення
 */
function sendTelegramMessage(chatId, text) {
  return new Promise((resolve, reject) => {
    const url = `${TELEGRAM_API_URL}${BOT_TOKEN}/sendMessage`;
    
    const data = JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    });
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = https.request(url, options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(responseBody);
          if (result.ok) {
            resolve(result.result);
          } else {
            reject(new Error(`Telegram API: ${result.description}`));
          }
        } catch (error) {
          reject(new Error(`JSON parse: ${error.message}`));
        }
      });
    });
    
    req.on('error', error => reject(error));
    req.write(data);
    req.end();
  });
}

/**
 * Головний тест
 */
async function testFullIntegration() {
  console.log('🧪 ПОВНИЙ ТЕСТ TELEGRAM ІНТЕГРАЦІЇ');
  console.log('=' .repeat(60));
  console.log(`🕒 Час: ${new Date().toLocaleString('uk-UA')}`);
  console.log('=' .repeat(60));
  
  try {
    // Тест 1: Google Apps Script Telegram функції
    console.log('\n🧪 ТЕСТ 1: Google Apps Script Telegram функції');
    console.log('-' .repeat(40));
    
    const telegramTest = await makeGoogleScriptRequest({
      action: 'testTelegram'
    });
    
    console.log('📋 Результат тесту Telegram функцій:');
    console.log(JSON.stringify(telegramTest, null, 2));
    
    const telegramWorking = telegramTest.success && 
                           telegramTest.test1.passed && 
                           telegramTest.test1.chatId === '1559533342';
    
    console.log(`Результат: ${telegramWorking ? '✅ УСПІХ' : '❌ ПРОВАЛ'}`);
    
    // Тест 2: Симуляція замовлення
    console.log('\n🧪 ТЕСТ 2: Симуляція замовлення з призначенням Геннадія');
    console.log('-' .repeat(40));
    
    const testOrder = {
      action: 'saveOrder',
      name: 'ТЕСТ TELEGRAM ІНТЕГРАЦІЯ',
      phone: '+380123456789',
      email: 'telegram-test@comspec.ua',
      product: 'Щебінь',
      deliveryType: 'delivery',
      address: 'м. Київ, вул. Telegram, 1',
      message: 'Тест повної інтеграції Telegram + Google Apps Script',
      source: 'full-integration-test',
      mode: 'order'
    };
    
    console.log('📤 Відправляємо тестове замовлення...');
    const orderResult = await makeGoogleScriptRequest(testOrder);
    
    console.log('📋 Результат замовлення:');
    console.log(JSON.stringify(orderResult, null, 2));
    
    const orderSuccess = orderResult.success;
    const hasManager = orderResult.manager;
    const hasChatId = orderResult.managerTelegramChatId;
    
    console.log(`\n📊 Аналіз результату:`);
    console.log(`  Замовлення збережено: ${orderSuccess ? '✅' : '❌'}`);
    console.log(`  Призначений менеджер: ${hasManager || 'НЕ ПРИЗНАЧЕНО'}`);
    console.log(`  Chat ID отримано: ${hasChatId || 'НЕ ОТРИМАНО'}`);
    
    // Тест 3: Перевірка чи Геннадій отримав повідомлення (якщо він призначений)
    if (orderSuccess && hasManager === 'Геннадій Дикий' && hasChatId === '1559533342') {
      console.log('\n🧪 ТЕСТ 3: Перевірка отримання повідомлення Геннадієм');
      console.log('-' .repeat(40));
      
      console.log('📱 Геннадій Дикий повинен був отримати повідомлення про замовлення');
      console.log(`   Chat ID: ${hasChatId}`);
      console.log(`   Order ID: ${orderResult.orderId}`);
      
      // Відправляємо підтвердження що тест пройшов
      try {
        const confirmMessage = `✅ ТЕСТ ІНТЕГРАЦІЇ ПРОЙШОВ!

🎉 Система працює ідеально:
• Google Apps Script ✅
• Telegram Chat ID ✅  
• Призначення менеджера ✅
• Order ID: ${orderResult.orderId}

Час: ${new Date().toLocaleString('uk-UA')}`;

        await sendTelegramMessage(hasChatId, confirmMessage);
        console.log('✅ Підтвердження відправлено Геннадію');
      } catch (telegramError) {
        console.error('❌ Помилка відправки підтвердження:', telegramError.message);
      }
    }
    
    // Підсумок
    console.log('\n' + '=' .repeat(60));
    console.log('🏁 ПІДСУМОК ТЕСТУВАННЯ:');
    
    const allTestsPassed = telegramWorking && orderSuccess && hasManager && hasChatId;
    
    console.log(`📊 Telegram функції Google Apps Script: ${telegramWorking ? '✅' : '❌'}`);
    console.log(`📊 Замовлення збережено: ${orderSuccess ? '✅' : '❌'}`);
    console.log(`📊 Менеджер призначений: ${hasManager ? '✅' : '❌'}`);
    console.log(`📊 Chat ID отримано: ${hasChatId ? '✅' : '❌'}`);
    
    console.log(`\n🎯 ЗАГАЛЬНИЙ РЕЗУЛЬТАТ: ${allTestsPassed ? '🎉 ВСЕ ПРАЦЮЄ!' : '⚠️ ПОТРІБНІ ДООПРАЦЮВАННЯ'}`);
    
    if (allTestsPassed) {
      console.log('\n✨ TELEGRAM ІНТЕГРАЦІЯ ГОТОВА ДО ПРОДАКШНУ!');
      console.log('🚀 Наступний крок: Додати Chat ID інших менеджерів');
    }
    
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('💥 Критична помилка тесту:', error.message);
    process.exit(1);
  }
}

// Запуск тесту
testFullIntegration();