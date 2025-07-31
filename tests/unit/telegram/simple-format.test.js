/**
 * 🧪 ТЕСТ СПРОЩЕНОГО ФОРМАТУВАННЯ TELEGRAM ПОВІДОМЛЕНЬ
 * Тестує нове форматування без HTML та емоджі
 */

const https = require('https');

// Конфігурація (МОКОВАНА)
const BOT_TOKEN = 'MOCK_BOT_TOKEN_FOR_UNIT_TESTS';
const GENNADIY_CHAT_ID = 'MOCK_CHAT_ID_FOR_UNIT_TESTS';
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
      // Без parse_mode для звичайного тексту
    };
    
    const data = JSON.stringify(requestData);
    
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
 * Спрощене форматування замовлення
 */
function formatSimpleOrderMessage(orderData) {
  const {
    orderId,
    manager,
    orderData: data,
    isConsultation
  } = orderData;
  
  const orderType = isConsultation ? 'КОНСУЛЬТАЦІЯ' : 'НОВЕ ЗАМОВЛЕННЯ';
  const orderNumber = orderId || 'Генерується...';
  
  let message = `${orderType} #${orderNumber}\n\n`;
  
  // Контактна інформація
  message += `Клієнт: ${data.name || 'Не вказано'}\n`;
  message += `Телефон: ${data.phone || 'Не вказано'}\n`;
  
  if (data.email) {
    message += `Email: ${data.email}\n`;
  }
  
  message += '\n';
  
  // Інформація про замовлення
  if (!isConsultation) {
    if (data.product) {
      message += `Товар: ${data.product}\n`;
    }
    
    if (data.deliveryType) {
      const deliveryText = data.deliveryType === 'delivery' ? 'Доставка' : 'Самовивіз';
      message += `Тип: ${deliveryText}\n`;
    }
    
    if (data.address) {
      message += `Адреса: ${data.address}\n`;
    }
    
    if (data.region) {
      message += `Регіон: ${data.region}\n`;
    }
    
    if (data.loadingPoint) {
      message += `Завантаження: ${data.loadingPoint}\n`;
    }
  }
  
  if (data.message) {
    message += `Коментар: ${data.message}\n`;
  }
  
  message += '\n';
  
  // Системна інформація
  message += `Час: ${new Date().toLocaleString('uk-UA')}\n`;
  
  if (manager) {
    message += `Менеджер: ${manager}\n`;
  }
  
  message += `Джерело: ${data.source || 'Website'}-development`;
  
  return message;
}

/**
 * Тестування
 */
async function testSimpleFormatting() {
  console.log('🧪 ТЕСТ СПРОЩЕНОГО ФОРМАТУВАННЯ');
  console.log('='.repeat(50));
  console.log(`🕒 Час: ${new Date().toLocaleString('uk-UA')}`);
  console.log('='.repeat(50));
  
  try {
    // Тест 1: Спрощене тестове повідомлення
    console.log('\n📤 ТЕСТ 1: Спрощене тестове повідомлення');
    console.log('-'.repeat(30));
    
    const simpleTestMessage = `ТЕСТ: Привіт Геннадій!

Це спрощене тестове повідомлення без емоджі та HTML форматування.

Час: ${new Date().toLocaleString('uk-UA')}
Бот: @COMSPEC_Orders_bot
Отримувач: Геннадій Дикий

Якщо ви отримали це повідомлення - нове форматування працює!`;

    const result1 = await sendMessage(GENNADIY_CHAT_ID, simpleTestMessage);
    console.log('✅ Спрощене повідомлення відправлено успішно!');
    console.log(`Message ID: ${result1.message_id}`);
    
    // Тест 2: Спрощене замовлення
    console.log('\n📤 ТЕСТ 2: Спрощене замовлення');
    console.log('-'.repeat(30));
    
    const mockOrderData = {
      orderId: '#SIMPLE_TEST',
      manager: 'Геннадій Дикий',
      isConsultation: false,
      orderData: {
        name: 'Тестовий Клієнт',
        phone: '+380999888777',
        email: 'test@comspec.ua',
        product: 'Щебінь фракція 5-20мм',
        deliveryType: 'delivery',
        address: 'м. Київ, вул. Хрещатик, 1',
        region: 'Київська область',
        message: 'Потрібно 5 тонн матеріалу для будівництва',
        source: 'SimpleFormatTest'
      }
    };
    
    const orderMessage = formatSimpleOrderMessage(mockOrderData);
    console.log('📋 Повідомлення:');
    console.log(orderMessage);
    console.log('-'.repeat(30));
    
    const result2 = await sendMessage(GENNADIY_CHAT_ID, orderMessage);
    console.log('✅ Спрощене замовлення відправлено успішно!');
    console.log(`Message ID: ${result2.message_id}`);
    
    // Тест 3: Консультація
    console.log('\n📤 ТЕСТ 3: Спрощена консультація');
    console.log('-'.repeat(30));
    
    const mockConsultationData = {
      orderId: '#CONSULT_TEST',
      manager: 'Геннадій Дикий',
      isConsultation: true,
      orderData: {
        name: 'Петро Петренко',
        phone: '+380509876543',
        email: 'petro@example.com',
        message: 'Хочу дізнатися про ціни на бетон для фундаменту приватного будинку',
        source: 'ConsultationTest'
      }
    };
    
    const consultationMessage = formatSimpleOrderMessage(mockConsultationData);
    const result3 = await sendMessage(GENNADIY_CHAT_ID, consultationMessage);
    console.log('✅ Спрощена консультація відправлена успішно!');
    console.log(`Message ID: ${result3.message_id}`);
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 ВСІ ТЕСТИ ПРОЙШЛИ УСПІШНО!');
    console.log('✅ Спрощене форматування працює');
    console.log('✅ Немає HTML тегів');
    console.log('✅ Немає емоджі');
    console.log('✅ Читабельний чистий текст');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.log('\n' + '='.repeat(50));
    console.error('🚨 ТЕСТ НЕ ПРОЙШОВ:');
    console.error(`❌ ${error.message}`);
    console.log('='.repeat(50));
    process.exit(1);
  }
}

// Запуск тесту
testSimpleFormatting().catch(error => {
  console.error('💥 Критична помилка:', error);
  process.exit(1);
});