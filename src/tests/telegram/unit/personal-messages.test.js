/**
 * 🧪 ТЕСТ ПЕРСОНАЛЬНИХ ПОВІДОМЛЕНЬ МЕНЕДЖЕРАМ
 * Тестує логіку відправки персональних повідомлень
 */

const https = require('https');

// Конфігурація
const BOT_TOKEN = '8472229536:AAEquKfaV_nIa5opQAbb6Io2RSm3HRRFgO4';
const API_URL = 'https://api.telegram.org/bot';

// Тимчасовий мапінг менеджерів (буде заповнено реальними Chat ID)
const TELEGRAM_MANAGERS = {
  "Ігор Калінкін": null,              // Буде заповнено після отримання Chat ID
  "Олександра Морожик": null,          // Буде заповнено після отримання Chat ID
  "Вікторія Лінкевич": null,          // Буде заповнено після отримання Chat ID
  "Ірина Єрмак": null,                // Буде заповнено після отримання Chat ID
  "Анна Гурська": null,               // Буде заповнено після отримання Chat ID
  "Тетяна Горобівська": null,         // Буде заповнено після отримання Chat ID
  "Володимир Максимук": null,         // Буде заповнено після отримання Chat ID
  "Геннадій Дикий": null              // Буде заповнено після отримання Chat ID
};

// Fallback чат (загальна група)
const FALLBACK_CHAT_ID = process.argv[2]; // Передається як аргумент

/**
 * Відправка повідомлення
 */
function sendMessage(chatId, text) {
  return new Promise((resolve, reject) => {
    const url = `${API_URL}${BOT_TOKEN}/sendMessage`;
    
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
    
    req.write(data);
    req.end();
  });
}

/**
 * Пошук Chat ID менеджера
 */
function findManagerChatId(managerName) {
  if (!managerName || typeof managerName !== 'string') {
    return null;
  }
  
  // Точна відповідність імені
  if (TELEGRAM_MANAGERS[managerName]) {
    return TELEGRAM_MANAGERS[managerName];
  }
  
  // Пошук по частині імені
  const normalizedName = managerName.toLowerCase().trim();
  
  for (const [name, chatId] of Object.entries(TELEGRAM_MANAGERS)) {
    if (name.toLowerCase().includes(normalizedName) || 
        normalizedName.includes(name.toLowerCase())) {
      console.log(`🔍 Знайдено менеджера: "${managerName}" → "${name}" (${chatId})`);
      return chatId;
    }
  }
  
  console.warn(`⚠️ Chat ID для менеджера "${managerName}" не знайдено`);
  return null;
}

/**
 * Відправка персонального повідомлення з fallback
 */
async function sendPersonalMessage(managerName, message) {
  const chatId = findManagerChatId(managerName);
  
  if (chatId) {
    console.log(`📤 Персональне повідомлення для ${managerName} (${chatId})`);
    try {
      const result = await sendMessage(chatId, message);
      return {
        success: true,
        target: 'personal',
        manager: managerName,
        chatId: chatId,
        messageId: result.message_id
      };
    } catch (error) {
      console.error(`❌ Помилка персонального повідомлення:`, error.message);
      throw error;
    }
  } else {
    // Fallback на загальний чат
    if (FALLBACK_CHAT_ID) {
      console.warn(`🔄 Fallback: відправляємо в загальний чат (${FALLBACK_CHAT_ID})`);
      const result = await sendMessage(FALLBACK_CHAT_ID, message);
      return {
        success: true,
        target: 'fallback',
        manager: managerName,
        chatId: FALLBACK_CHAT_ID,
        messageId: result.message_id,
        reason: 'manager_not_found'
      };
    } else {
      throw new Error('Немає Chat ID менеджера і немає fallback чату');
    }
  }
}

/**
 * Форматування тестового замовлення
 */
function createTestOrder(managerName) {
  return {
    orderId: `#TEST_${Date.now()}`,
    manager: managerName,
    isConsultation: false,
    orderData: {
      name: 'Тест Персональних Повідомлень',
      phone: '+380123456789',
      email: 'test@comspec.ua',
      product: 'Щебінь фракція 5-20мм',
      deliveryType: 'delivery',
      address: 'м. Київ, вул. Тестова, 1',
      region: 'Київ',
      loadingPoint: "ТДВ «Ігнатпільський кар'єр»",
      message: `Тестове замовлення для менеджера ${managerName}`,
      source: 'PersonalTest'
    }
  };
}

/**
 * Форматування повідомлення
 */
function formatOrderMessage(orderData) {
  const {
    orderId,
    manager,
    orderData: data,
    isConsultation
  } = orderData;
  
  const orderType = isConsultation ? '💬 КОНСУЛЬТАЦІЯ' : '🆕 НОВЕ ЗАМОВЛЕННЯ';
  
  let message = `${orderType} ${orderId}\n\n`;
  message += `👤 <b>Клієнт:</b> ${data.name}\n`;
  message += `📞 <b>Телефон:</b> <a href="tel:${data.phone}">${data.phone}</a>\n`;
  
  if (data.email) {
    message += `📧 <b>Email:</b> ${data.email}\n`;
  }
  
  message += '\n';
  
  if (!isConsultation) {
    if (data.product) {
      message += `📦 <b>Товар:</b> ${data.product}\n`;
    }
    
    if (data.deliveryType) {
      const deliveryText = data.deliveryType === 'delivery' ? 'Доставка' : 'Самовивіз';
      message += `🚚 <b>Тип:</b> ${deliveryText}\n`;
    }
    
    if (data.address) {
      message += `📍 <b>Адреса:</b> ${data.address}\n`;
    }
    
    if (data.region) {
      message += `🗺️ <b>Регіон:</b> ${data.region}\n`;
    }
    
    if (data.loadingPoint) {
      message += `🏭 <b>Завантаження:</b> ${data.loadingPoint}\n`;
    }
  }
  
  if (data.message) {
    message += `💬 <b>Коментар:</b> ${data.message}\n`;
  }
  
  message += '\n';
  message += `⏰ <b>Час:</b> ${new Date().toLocaleString('uk-UA')}\n`;
  
  if (manager) {
    message += `👨‍💼 <b>Менеджер:</b> ${manager}\n`;
  }
  
  message += `🌐 <b>Джерело:</b> ${data.source}-development`;
  
  return message;
}

/**
 * Головна функція тестування
 */
async function testPersonalMessages() {
  console.log('🧪 ТЕСТ ПЕРСОНАЛЬНИХ ПОВІДОМЛЕНЬ МЕНЕДЖЕРАМ');
  console.log('=' .repeat(60));
  console.log(`🕒 Час: ${new Date().toLocaleString('uk-UA')}`);
  console.log(`🔄 Fallback чат: ${FALLBACK_CHAT_ID || 'НЕ ВКАЗАНО'}`);
  console.log('=' .repeat(60));
  
  // Показуємо поточний мапінг
  console.log('\n📋 ПОТОЧНИЙ МАПІНГ МЕНЕДЖЕРІВ:');
  Object.entries(TELEGRAM_MANAGERS).forEach(([name, chatId]) => {
    const status = chatId ? `✅ ${chatId}` : '❌ немає Chat ID';
    console.log(`  ${name}: ${status}`);
  });
  
  console.log('\n' + '=' .repeat(60));
  
  // Тест 1: Менеджер з Chat ID (коли буде заповнено)
  console.log('\n🧪 ТЕСТ 1: Менеджер з Chat ID');
  console.log('-' .repeat(40));
  
  const testManager1 = "Ігор Калінкін";
  const order1 = createTestOrder(testManager1);
  const message1 = formatOrderMessage(order1);
  
  console.log(`👨‍💼 Тестуємо менеджера: ${testManager1}`);
  console.log(`📋 Повідомлення:\n${message1.substring(0, 200)}...`);
  
  try {
    const result1 = await sendPersonalMessage(testManager1, message1);
    console.log(`✅ Результат: ${result1.target} (ID: ${result1.messageId})`);
  } catch (error) {
    console.error(`❌ Помилка: ${error.message}`);
  }
  
  // Тест 2: Неіснуючий менеджер
  console.log('\n🧪 ТЕСТ 2: Неіснуючий менеджер');
  console.log('-' .repeat(40));
  
  const testManager2 = "Неіснуючий Менеджер";
  const order2 = createTestOrder(testManager2);
  const message2 = formatOrderMessage(order2);
  
  console.log(`👨‍💼 Тестуємо менеджера: ${testManager2}`);
  
  try {
    const result2 = await sendPersonalMessage(testManager2, message2);
    console.log(`✅ Результат: ${result2.target} (${result2.reason || 'success'})`);
  } catch (error) {
    console.error(`❌ Помилка: ${error.message}`);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ ТЕСТИ ЗАВЕРШЕНО!');
  
  console.log('\n🎯 НАСТУПНІ КРОКИ:');
  console.log('1. Попросіть менеджерів написати боту @COMSPEC_Orders_bot');
  console.log('2. Запустіть: node telegram-collect-chat-ids.js');
  console.log('3. Заповніть Chat ID в environment.js');
  console.log('4. Запустіть цей тест знову');
  console.log('=' .repeat(60));
}

// Перевірка аргументів
if (!FALLBACK_CHAT_ID) {
  console.log('❌ Потрібен fallback Chat ID!');
  console.log('Використання: node telegram-personal-test.js YOUR_FALLBACK_CHAT_ID');
  process.exit(1);
}

// Запуск тестів
testPersonalMessages().catch(error => {
  console.error('💥 Критична помилка:', error);
  process.exit(1);
});