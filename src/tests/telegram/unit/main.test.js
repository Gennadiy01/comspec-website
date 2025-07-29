/**
 * 🧪 ТЕСТ TELEGRAM ПІДКЛЮЧЕННЯ
 * Простий Node.js скрипт для тестування Telegram Bot API
 */

const https = require('https');

// Конфігурація з вашої environment.js
const BOT_TOKEN = '8472229536:AAEquKfaV_nIa5opQAbb6Io2RSm3HRRFgO4';
const API_URL = 'https://api.telegram.org/bot';

/**
 * Функція для HTTP запиту
 */
function makeRequest(method, data = null) {
  return new Promise((resolve, reject) => {
    const url = `${API_URL}${BOT_TOKEN}/${method}`;
    
    console.log(`📡 Запит: ${method}`);
    console.log(`🌐 URL: ${url}`);
    
    const options = {
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'COMSPEC-Bot-Test/1.0'
      }
    };
    
    const req = https.request(url, options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseBody);
          if (result.ok) {
            resolve(result.result);
          } else {
            reject(new Error(`Telegram API помилка: ${result.description}`));
          }
        } catch (error) {
          reject(new Error(`Помилка парсингу JSON: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`HTTP помилка: ${error.message}`));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Тест підключення до бота
 */
async function testBotConnection() {
  try {
    console.log('🤖 Тестування підключення до Telegram Bot...');
    console.log('=' .repeat(50));
    
    const botInfo = await makeRequest('getMe');
    
    console.log('✅ ПІДКЛЮЧЕННЯ УСПІШНЕ!');
    console.log('🤖 Інформація про бота:');
    console.log(`   ID: ${botInfo.id}`);
    console.log(`   Username: @${botInfo.username}`);
    console.log(`   Ім'я: ${botInfo.first_name}`);
    console.log(`   Підтримує групи: ${botInfo.can_join_groups ? 'Так' : 'Ні'}`);
    console.log(`   Читає всі повідомлення: ${botInfo.can_read_all_group_messages ? 'Так' : 'Ні'}`);
    
    return {
      success: true,
      bot: botInfo
    };
    
  } catch (error) {
    console.error('❌ ПОМИЛКА ПІДКЛЮЧЕННЯ!');
    console.error(`   Деталі: ${error.message}`);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Отримання оновлень (останні повідомлення)
 */
async function getUpdates() {
  try {
    console.log('📨 Отримання останніх оновлень...');
    
    const updates = await makeRequest('getUpdates');
    
    console.log(`📋 Знайдено ${updates.length} оновлень`);
    
    if (updates.length > 0) {
      console.log('📝 Останні чати:');
      
      const chats = new Set();
      updates.forEach(update => {
        if (update.message && update.message.chat) {
          const chat = update.message.chat;
          chats.add(JSON.stringify({
            id: chat.id,
            type: chat.type,
            title: chat.title || `${chat.first_name} ${chat.last_name}`.trim()
          }));
        }
      });
      
      Array.from(chats).forEach(chatStr => {
        const chat = JSON.parse(chatStr);
        console.log(`   ${chat.type}: ${chat.title} (ID: ${chat.id})`);
      });
    }
    
    return {
      success: true,
      updates: updates
    };
    
  } catch (error) {
    console.error('❌ Помилка отримання оновлень:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Головна функція тестування
 */
async function runTests() {
  console.log('🧪 COMSPEC TELEGRAM BOT TEST');
  console.log('=' .repeat(50));
  console.log(`🕒 Час: ${new Date().toLocaleString('uk-UA')}`);
  console.log('=' .repeat(50));
  
  // Тест 1: Підключення до бота
  const connectionTest = await testBotConnection();
  
  if (!connectionTest.success) {
    console.log('\n❌ Тестування зупинено через помилку підключення');
    process.exit(1);
  }
  
  console.log('\n' + '=' .repeat(50));
  
  // Тест 2: Отримання оновлень
  await getUpdates();
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ ВСІ ТЕСТИ ЗАВЕРШЕНО!');
  console.log('\nНаступні кроки:');
  console.log('1. Отримайте Chat ID від групи менеджерів');
  console.log('2. Додайте Chat ID в environment.js');
  console.log('3. Протестуйте відправку повідомлень');
  console.log('=' .repeat(50));
}

// Запуск тестів
runTests().catch(error => {
  console.error('💥 Критична помилка:', error);
  process.exit(1);
});