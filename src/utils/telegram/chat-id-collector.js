/**
 * 🆔 ЗБІР TELEGRAM CHAT ID МЕНЕДЖЕРІВ
 * Скрипт для отримання Chat ID всіх хто писав боту
 */

const https = require('https');

// Конфігурація
const BOT_TOKEN = '8472229536:AAEquKfaV_nIa5opQAbb6Io2RSm3HRRFgO4';
const API_URL = 'https://api.telegram.org/bot';

/**
 * HTTP запит до Telegram API
 */
function makeRequest(method, params = {}) {
  return new Promise((resolve, reject) => {
    const url = `${API_URL}${BOT_TOKEN}/${method}`;
    
    const options = {
      method: params ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json'
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
            reject(new Error(`Telegram API: ${result.description}`));
          }
        } catch (error) {
          reject(new Error(`JSON parse: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`HTTP: ${error.message}`));
    });
    
    if (params) {
      req.write(JSON.stringify(params));
    }
    
    req.end();
  });
}

/**
 * Отримання всіх оновлень (повідомлень)
 */
async function getUpdates() {
  try {
    const updates = await makeRequest('getUpdates');
    return updates;
  } catch (error) {
    throw new Error(`Помилка getUpdates: ${error.message}`);
  }
}

/**
 * Відправка повідомлення для збору Chat ID
 */
async function sendCollectionMessage(chatId) {
  const message = `🆔 ЗБІР CHAT ID МЕНЕДЖЕРІВ COMSPEC

Привіт! 👋

Це бот для сповіщень про замовлення.
Ваш Chat ID: <code>${chatId}</code>

📋 Інструкція:
1. Скопіюйте ваш Chat ID
2. Надішліть його адміністратору
3. Після налаштування ви отримуватимете персональні сповіщення про замовлення

✅ Chat ID автоматично збережено в системі.`;

  try {
    await makeRequest('sendMessage', {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    });
    return true;
  } catch (error) {
    console.error(`Помилка відправки в ${chatId}:`, error.message);
    return false;
  }
}

/**
 * Головна функція збору Chat ID
 */
async function collectChatIds() {
  console.log('🆔 ЗБІР TELEGRAM CHAT ID МЕНЕДЖЕРІВ');
  console.log('=' .repeat(60));
  console.log(`🕒 Час: ${new Date().toLocaleString('uk-UA')}`);
  console.log('=' .repeat(60));
  
  try {
    // Отримуємо всі оновлення
    console.log('📨 Отримання оновлень від бота...');
    const updates = await getUpdates();
    
    console.log(`📋 Знайдено ${updates.length} оновлень`);
    
    if (updates.length === 0) {
      console.log('\n❌ Немає повідомлень від менеджерів!');
      console.log('\n💡 Інструкція:');
      console.log('1. Попросіть менеджерів написати боту @COMSPEC_Orders_bot');
      console.log('2. Вони можуть написати будь-що, наприклад: "Привіт"');
      console.log('3. Запустіть цей скрипт знову');
      return;
    }
    
    // Збираємо унікальні чати
    const uniqueChats = new Map();
    
    updates.forEach(update => {
      if (update.message && update.message.from) {
        const user = update.message.from;
        const chat = update.message.chat;
        
        // Зберігаємо інформацію про користувача
        uniqueChats.set(chat.id, {
          chatId: chat.id,
          firstName: user.first_name,
          lastName: user.last_name || '',
          username: user.username ? `@${user.username}` : '',
          fullName: `${user.first_name} ${user.last_name || ''}`.trim(),
          lastMessage: update.message.text || '(медіа)',
          date: new Date(update.message.date * 1000).toLocaleString('uk-UA')
        });
      }
    });
    
    console.log(`\n👥 Знайдено ${uniqueChats.size} унікальних користувачів:`);
    console.log('=' .repeat(60));
    
    // Виводимо таблицю з Chat ID
    console.log('| Chat ID    | Ім\'я                | Username        | Останнє повідомлення');
    console.log('|------------|---------------------|-----------------|--------------------');
    
    const chatArray = Array.from(uniqueChats.values());
    
    for (const user of chatArray) {
      const shortMessage = user.lastMessage.length > 15 
        ? user.lastMessage.substring(0, 15) + '...' 
        : user.lastMessage;
        
      console.log(`| ${user.chatId.toString().padEnd(10)} | ${user.fullName.padEnd(19)} | ${user.username.padEnd(15)} | ${shortMessage}`);
    }
    
    console.log('=' .repeat(60));
    
    // Відправляємо повідомлення з Chat ID кожному
    console.log('\n📤 Відправляємо Chat ID кожному користувачу...');
    
    let successCount = 0;
    for (const user of chatArray) {
      const success = await sendCollectionMessage(user.chatId);
      if (success) {
        successCount++;
        console.log(`✅ ${user.fullName} (${user.chatId})`);
      } else {
        console.log(`❌ ${user.fullName} (${user.chatId})`);
      }
      
      // Затримка між повідомленнями
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log(`✅ ЗБІР ЗАВЕРШЕНО! Надіслано ${successCount}/${chatArray.length} повідомлень`);
    
    // Створюємо готовий мапінг для Google Sheets
    console.log('\n📋 ГОТОВИЙ МАПІНГ ДЛЯ GOOGLE SHEETS:');
    console.log('(Скопіюйте та вставте в таблицю)');
    console.log('-' .repeat(40));
    
    chatArray.forEach(user => {
      console.log(`${user.fullName}: ${user.chatId}`);
    });
    
    // Створюємо JSON для environment.js (як backup)
    console.log('\n💾 BACKUP МАПІНГ ДЛЯ ENVIRONMENT.JS:');
    console.log('-' .repeat(40));
    console.log('TELEGRAM_MANAGERS: {');
    chatArray.forEach((user, index) => {
      const comma = index < chatArray.length - 1 ? ',' : '';
      console.log(`  "${user.fullName}": "${user.chatId}"${comma}`);
    });
    console.log('}');
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎯 НАСТУПНІ КРОКИ:');
    console.log('1. Додайте Chat ID в Google Sheets колонку "Telegram_Chat_ID"');
    console.log('2. Зіставте імена з вашою таблицею менеджерів');
    console.log('3. Запустіть тест персональних повідомлень');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('💥 Помилка:', error.message);
    process.exit(1);
  }
}

// Запуск
collectChatIds();