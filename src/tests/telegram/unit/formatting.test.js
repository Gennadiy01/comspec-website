/**
 * 🧪 ТЕСТ ФОРМАТУВАННЯ TELEGRAM ПОВІДОМЛЕНЬ
 * Тестує форматування повідомлень про замовлення без React
 */

const https = require('https');

// Конфігурація
const BOT_TOKEN = '8472229536:AAEquKfaV_nIa5opQAbb6Io2RSm3HRRFgO4';
const API_URL = 'https://api.telegram.org/bot';

/**
 * Функція форматування повідомлення (скопійовано з TelegramService)
 */
function formatOrderMessage(orderData) {
  const {
    orderId,
    manager,
    orderData: data,
    isConsultation
  } = orderData;
  
  // Базова інформація
  const orderType = isConsultation ? '💬 КОНСУЛЬТАЦІЯ' : '🆕 НОВЕ ЗАМОВЛЕННЯ';
  const orderNumber = orderId || 'Генерується...';
  
  // Форматування повідомлення
  let message = `${orderType} #${orderNumber}\n\n`;
  
  // Контактна інформація
  message += `👤 <b>Клієнт:</b> ${data.name || 'Не вказано'}\n`;
  message += `📞 <b>Телефон:</b> <a href="tel:${data.phone}">${data.phone || 'Не вказано'}</a>\n`;
  
  if (data.email) {
    message += `📧 <b>Email:</b> ${data.email}\n`;
  }
  
  message += '\n';
  
  // Інформація про замовлення
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
    
    if (data.loadingPoint || data.Loading_Point) {
      message += `🏭 <b>Завантаження:</b> ${data.loadingPoint || data.Loading_Point}\n`;
    }
  }
  
  if (data.message) {
    message += `💬 <b>Коментар:</b> ${data.message}\n`;
  }
  
  message += '\n';
  
  // Системна інформація
  message += `⏰ <b>Час:</b> ${new Date().toLocaleString('uk-UA')}\n`;
  
  if (manager) {
    message += `👨‍💼 <b>Менеджер:</b> ${manager}\n`;
  }
  
  message += `🌐 <b>Джерело:</b> ${data.source || 'Website'}-development`;
  
  return message;
}

/**
 * Відправка повідомлення в Telegram
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
            reject(new Error(`Telegram API помилка: ${result.description}`));
          }
        } catch (error) {
          reject(new Error(`JSON parse помилка: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`HTTP помилка: ${error.message}`));
    });
    
    req.write(data);
    req.end();
  });
}

/**
 * Головна функція тестування
 */
async function runFormattingTests() {
  console.log('🧪 ТЕСТ ФОРМАТУВАННЯ TELEGRAM ПОВІДОМЛЕНЬ');
  console.log('=' .repeat(60));
  console.log(`🕒 Час: ${new Date().toLocaleString('uk-UA')}`);
  console.log('=' .repeat(60));
  
  // Тест 1: Звичайне замовлення
  console.log('\n📦 ТЕСТ 1: Звичайне замовлення');
  console.log('-' .repeat(40));
  
  const orderData = {
    orderId: '#12345',
    manager: 'Олександр Петренко',
    isConsultation: false,
    orderData: {
      name: 'Іван Іванович Тестенко',
      phone: '+380671234567',
      email: 'test@comspec.ua',
      product: 'Щебінь фракція 5-20мм',
      deliveryType: 'delivery',
      address: 'м. Київ, вул. Хрещатик, 1',
      region: 'Київ',
      loadingPoint: "ТДВ «Ігнатпільський кар'єр»",
      message: 'Потрібно 5 тонн, доставка до 16:00',
      source: 'Website'
    }
  };
  
  const orderMessage = formatOrderMessage(orderData);
  console.log(orderMessage);
  
  // Тест 2: Консультація
  console.log('\n\n💬 ТЕСТ 2: Консультація');
  console.log('-' .repeat(40));
  
  const consultationData = {
    orderId: '#C12345',
    manager: 'Марія Коваленко',
    isConsultation: true,
    orderData: {
      name: 'Петро Петренко',
      phone: '+380509876543',
      email: 'petro@example.com',
      message: 'Хочу дізнатися про ціни на бетон для фундаменту приватного будинку',
      source: 'Services-page'
    }
  };
  
  const consultationMessage = formatOrderMessage(consultationData);
  console.log(consultationMessage);
  
  // Тест 3: Мінімальні дані
  console.log('\n\n📋 ТЕСТ 3: Мінімальні дані');
  console.log('-' .repeat(40));
  
  const minimalData = {
    orderId: '#MIN001',
    manager: null,
    isConsultation: false,
    orderData: {
      name: 'Анонім',
      phone: '+380123456789',
      source: 'Website'
    }
  };
  
  const minimalMessage = formatOrderMessage(minimalData);
  console.log(minimalMessage);
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ ВСІ ТЕСТИ ФОРМАТУВАННЯ ЗАВЕРШЕНО!');
  
  // Пропонуємо відправити тестове повідомлення
  const chatId = process.argv[2];
  if (chatId) {
    console.log(`\n📤 Відправляємо тестове замовлення в чат: ${chatId}`);
    try {
      const result = await sendMessage(chatId, orderMessage);
      console.log('✅ Повідомлення відправлено успішно!');
      console.log(`📩 Message ID: ${result.message_id}`);
    } catch (error) {
      console.error('❌ Помилка відправки:', error.message);
    }
  } else {
    console.log('\n💡 Для відправки тестового повідомлення:');
    console.log('   node telegram-formatting-test.js YOUR_CHAT_ID');
  }
  
  console.log('=' .repeat(60));
}

// Запуск тестів
runFormattingTests().catch(error => {
  console.error('💥 Критична помилка:', error);
  process.exit(1);
});