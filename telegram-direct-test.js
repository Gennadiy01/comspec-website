/**
 * 🎯 ПРЯМИЙ ТЕСТ ВІДПРАВКИ ПОВІДОМЛЕННЯ ГЕННАДІЮ
 * Тестує прямо Telegram API без проміжних шарів
 */

const https = require('https');

// Конфігурація
const BOT_TOKEN = '8472229536:AAEquKfaV_nIa5opQAbb6Io2RSm3HRRFgO4';
const GENNADIY_CHAT_ID = '1559533342';
const API_URL = 'https://api.telegram.org/bot';

/**
 * Відправка повідомлення
 */
function sendMessage(chatId, text) {
  return new Promise((resolve, reject) => {
    const url = `${API_URL}${BOT_TOKEN}/sendMessage`;
    
    const requestData = {
      chat_id: parseInt(chatId, 10),
      text: text
      // Прибираємо parse_mode для тесту
    };
    
    const data = JSON.stringify(requestData);
    
    console.log('📡 Запит до Telegram API:');
    console.log(`URL: ${url}`);
    console.log(`Chat ID: ${chatId}`);
    console.log(`Message length: ${text.length} символів`);
    console.log('📋 JSON payload:');
    console.log(data);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(data, 'utf8')
      }
    };
    
    const req = https.request(url, options, (res) => {
      let responseBody = '';
      
      console.log(`📊 HTTP Status: ${res.statusCode}`);
      console.log(`📊 Headers:`, res.headers);
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        console.log('📋 Повна відповідь Telegram:');
        console.log(responseBody);
        
        try {
          const result = JSON.parse(responseBody);
          if (result.ok) {
            resolve(result.result);
          } else {
            reject(new Error(`Telegram API помилка: ${result.description} (код: ${result.error_code})`));
          }
        } catch (error) {
          reject(new Error(`JSON parse помилка: ${error.message}. Відповідь: ${responseBody}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('🚨 HTTP помилка:', error);
      reject(new Error(`HTTP помилка: ${error.message}`));
    });
    
    req.write(data);
    req.end();
  });
}

/**
 * Тест підключення до бота
 */
async function testBotConnection() {
  console.log('🤖 ТЕСТ 1: Перевірка з\'єднання з ботом');
  console.log('-'.repeat(50));
  
  try {
    const url = `${API_URL}${BOT_TOKEN}/getMe`;
    
    const response = await new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
    
    if (response.ok) {
      console.log('✅ Бот працює:');
      console.log(`  ID: ${response.result.id}`);
      console.log(`  Username: @${response.result.username}`);
      console.log(`  First Name: ${response.result.first_name}`);
      return response.result;
    } else {
      throw new Error(`Бот не працює: ${response.description}`);
    }
  } catch (error) {
    console.error('❌ Помилка з\'єднання з ботом:', error.message);
    throw error;
  }
}

/**
 * Тест відправки простого повідомлення
 */
async function testSimpleMessage() {
  console.log('\n💬 ТЕСТ 2: Просте повідомлення Геннадію');
  console.log('-'.repeat(50));
  
  const simpleMessage = `🧪 ТЕСТ: Привіт Геннадій! Це тестове повідомлення українською мовою від COMSPEC бота.`;
  
  console.log('🔍 ДІАГНОСТИКА ПОВІДОМЛЕННЯ:');
  console.log(`  Довжина тексту: ${simpleMessage.length}`);
  console.log(`  Текст: "${simpleMessage}"`);
  console.log(`  Код символів: ${simpleMessage.split('').map(c => c.charCodeAt(0)).join(', ')}`.substring(0, 100) + '...');

  try {
    const result = await sendMessage(GENNADIY_CHAT_ID, simpleMessage);
    console.log('✅ Просте повідомлення відправлено успішно!');
    console.log(`Message ID: ${result.message_id}`);
    console.log(`Date: ${new Date(result.date * 1000).toLocaleString('uk-UA')}`);
    return result;
  } catch (error) {
    console.error('❌ Помилка відправки простого повідомлення:', error.message);
    throw error;
  }
}

/**
 * Тест відправки складного повідомлення (як замовлення)
 */
async function testOrderMessage() {
  console.log('\n📦 ТЕСТ 3: Повідомлення у форматі замовлення');
  console.log('-'.repeat(50));
  
  const orderMessage = `🆕 НОВЕ ЗАМОВЛЕННЯ #1753729864\n\n👤 <b>Клієнт:</b> ТЕСТ\n📞 <b>Телефон:</b> <a href="tel:+380999888777">+380999888777</a>\n📧 <b>Email:</b> test@telegram.com\n\n📦 <b>Товар:</b> Щебінь\n🚚 <b>Тип:</b> Доставка\n📍 <b>Адреса:</b> м. Київ\n🗺️ <b>Регіон:</b> м. Київ\n💬 <b>Коментар:</b> Тест Telegram інтеграції\n\n⏰ <b>Час:</b> 28-07-2025 22:11:04\n👨‍💼 <b>Менеджер:</b> Геннадій Дикий\n🌐 <b>Джерело:</b> final-test-development`;

  try {
    const result = await sendMessage(GENNADIY_CHAT_ID, orderMessage);
    console.log('✅ Повідомлення про замовлення відправлено успішно!');
    console.log(`Message ID: ${result.message_id}`);
    return result;
  } catch (error) {
    console.error('❌ Помилка відправки повідомлення про замовлення:', error.message);
    throw error;
  }
}

/**
 * Перевірка чи заблокований бот
 */
async function checkIfBotBlocked() {
  console.log('\n🔍 ТЕСТ 4: Перевірка статусу чату');
  console.log('-'.repeat(50));
  
  try {
    const url = `${API_URL}${BOT_TOKEN}/getChat`;
    const data = JSON.stringify({
      chat_id: GENNADIY_CHAT_ID
    });
    
    const response = await new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(data, 'utf8')
        }
      };
      
      const req = https.request(url, options, (res) => {
        let responseBody = '';
        res.on('data', chunk => responseBody += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(responseBody));
          } catch (error) {
            reject(error);
          }
        });
      });
      
      req.on('error', reject);
      req.write(data);
      req.end();
    });
    
    if (response.ok) {
      console.log('✅ Інформація про чат:');
      console.log(`  ID: ${response.result.id}`);
      console.log(`  Type: ${response.result.type}`);
      if (response.result.first_name) {
        console.log(`  Name: ${response.result.first_name} ${response.result.last_name || ''}`);
      }
      if (response.result.username) {
        console.log(`  Username: @${response.result.username}`);
      }
      return response.result;
    } else {
      console.error('❌ Помилка отримання інформації про чат:');
      console.error(`  Код: ${response.error_code}`);
      console.error(`  Опис: ${response.description}`);
      
      if (response.error_code === 403) {
        console.error('🚫 БОТ ЗАБЛОКОВАНИЙ КОРИСТУВАЧЕМ АБО НЕ МОЖЕ НАДІСЛАТИ ПОВІДОМЛЕННЯ');
      }
      
      throw new Error(`${response.description} (код: ${response.error_code})`);
    }
  } catch (error) {
    console.error('❌ Помилка перевірки чату:', error.message);
    throw error;
  }
}

/**
 * Головна функція тестування
 */
async function runDiagnostics() {
  console.log('🎯 ДІАГНОСТИКА TELEGRAM ВІДПРАВКИ ДЛЯ ГЕННАДІЯ ДИКОГО');
  console.log('='.repeat(70));
  console.log(`🕒 Час: ${new Date().toLocaleString('uk-UA')}`);
  console.log(`🤖 Bot Token: ${BOT_TOKEN.substring(0, 10)}...`);
  console.log(`👤 Chat ID: ${GENNADIY_CHAT_ID}`);
  console.log('='.repeat(70));
  
  const results = {};
  
  try {
    // Тест 1: З'єднання з ботом
    results.botConnection = await testBotConnection();
    
    // Тест 2: Перевірка чату
    results.chatInfo = await checkIfBotBlocked();
    
    // Тест 3: Просте повідомлення
    results.simpleMessage = await testSimpleMessage();
    
    // Тест 4: Складне повідомлення
    results.orderMessage = await testOrderMessage();
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 ВСІ ТЕСТИ ПРОЙШЛИ УСПІШНО!');
    console.log('✅ Telegram інтеграція працює коректно');
    console.log('✅ Геннадій повинен отримати 2 тестових повідомлення');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.log('\n' + '='.repeat(70));
    console.error('🚨 ДІАГНОСТИКА ВИЯВИЛА ПРОБЛЕМУ:');
    console.error(`❌ ${error.message}`);
    
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      console.error('\n💡 МОЖЛИВІ ПРИЧИНИ:');
      console.error('1. Геннадій заблокував бота');
      console.error('2. Геннадій не писав боту /start');
      console.error('3. Chat ID змінився');
      console.error('\n🔧 РІШЕННЯ:');
      console.error('1. Попросіть Геннадія розблокувати бота');
      console.error('2. Попросіть написати /start боту @COMSPEC_Orders_bot');
      console.error('3. Перезберіть Chat ID через telegram-collect-chat-ids.js');
    }
    
    console.log('='.repeat(70));
    process.exit(1);
  }
}

// Запуск діагностики
runDiagnostics().catch(error => {
  console.error('💥 Критична помилка:', error);
  process.exit(1);
});