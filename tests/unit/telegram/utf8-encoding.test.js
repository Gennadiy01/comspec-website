/**
 * 🧪 ТЕСТ UTF-8 КОДУВАННЯ ДЛЯ TELEGRAM SERVICE
 * Тестує роботу з українськими символами
 */

// Імпортуємо fetch для Node.js
const fetch = require('node-fetch');
const { AbortController } = require('abort-controller');
global.fetch = fetch;
global.AbortController = AbortController;

// Імітуємо config (МОКОВАНИЙ)
const config = {
  TELEGRAM_BOT_TOKEN: 'MOCK_BOT_TOKEN_FOR_UNIT_TESTS',
  TELEGRAM_CHAT_ID: null,
  TELEGRAM_ENABLED: true,
  TELEGRAM_API_URL: 'https://api.telegram.org/bot',
  TELEGRAM_TIMEOUT: 10000,
  TELEGRAM_MANAGERS: {
    "Геннадій Дикий": "1559533342"
  },
  ENVIRONMENT: 'test'
};

// Імітуємо модуль
global.window = { console };

// Клас TelegramService (спрощена версія для тесту)
class TelegramService {
  constructor() {
    this.botToken = config.TELEGRAM_BOT_TOKEN;
    this.chatId = config.TELEGRAM_CHAT_ID;
    this.enabled = config.TELEGRAM_ENABLED;
    this.apiUrl = config.TELEGRAM_API_URL;
    this.timeout = config.TELEGRAM_TIMEOUT;
    this.managers = config.TELEGRAM_MANAGERS;
  }

  isEnabled() {
    return this.enabled && this.botToken;
  }

  async makeRequest(method, params = {}) {
    if (!this.isEnabled()) {
      throw new Error('Telegram service вимкнений або не налаштований');
    }

    const url = `${this.apiUrl}${this.botToken}/${method}`;
    
    console.log(`[TelegramService] 📡 Запит: ${method}`);
    console.log(`[TelegramService] 🔗 URL: ${url}`);
    console.log(`[TelegramService] 📋 Params:`, JSON.stringify(params, null, 2));
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(params),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const responseText = await response.text();
      console.log(`[TelegramService] 📊 HTTP Status: ${response.status}`);
      console.log(`[TelegramService] 📋 Response: ${responseText}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = JSON.parse(responseText);
      
      if (!data.ok) {
        throw new Error(`Telegram API помилка: ${data.description}`);
      }
      
      console.log(`[TelegramService] ✅ Успішний запит: ${method}`);
      return data.result;
    } catch (error) {
      console.error(`[TelegramService] ❌ Помилка ${method}:`, error);
      throw error;
    }
  }

  async sendMessage(text, chatId = null, parseMode = 'HTML') {
    const targetChatId = chatId || this.chatId;
    
    if (!targetChatId) {
      throw new Error('Chat ID не налаштований');
    }
    
    const params = {
      chat_id: parseInt(targetChatId, 10),
      text: text
    };
    
    if (parseMode) {
      params.parse_mode = parseMode;
    }
    
    try {
      const result = await this.makeRequest('sendMessage', params);
      
      return {
        success: true,
        messageId: result.message_id,
        message: 'Повідомлення відправлено успішно'
      };
    } catch (error) {
      console.error('[TelegramService] ❌ Помилка відправки повідомлення:', error);
      throw error;
    }
  }

  formatOrderMessage(orderData) {
    const {
      orderId,
      manager,
      orderData: data,
      isConsultation
    } = orderData;
    
    const orderType = isConsultation ? '💬 КОНСУЛЬТАЦІЯ' : '🆕 НОВЕ ЗАМОВЛЕННЯ';
    const orderNumber = orderId || 'Генерується...';
    
    let message = `${orderType} #${orderNumber}\\n\\n`;
    
    message += `👤 <b>Клієнт:</b> ${data.name || 'Не вказано'}\\n`;
    message += `📞 <b>Телефон:</b> <a href="tel:${data.phone}">${data.phone || 'Не вказано'}</a>\\n`;
    
    if (data.email) {
      message += `📧 <b>Email:</b> ${data.email}\\n`;
    }
    
    message += '\\n';
    
    if (!isConsultation) {
      if (data.product) {
        message += `📦 <b>Товар:</b> ${data.product}\\n`;
      }
      
      if (data.deliveryType) {
        const deliveryText = data.deliveryType === 'delivery' ? 'Доставка' : 'Самовивіз';
        message += `🚚 <b>Тип:</b> ${deliveryText}\\n`;
      }
      
      if (data.address) {
        message += `📍 <b>Адреса:</b> ${data.address}\\n`;
      }
      
      if (data.region) {
        message += `🗺️ <b>Регіон:</b> ${data.region}\\n`;
      }
    }
    
    if (data.message) {
      message += `💬 <b>Коментар:</b> ${data.message}\\n`;
    }
    
    message += '\\n';
    message += `⏰ <b>Час:</b> ${new Date().toLocaleString('uk-UA')}\\n`;
    
    if (manager) {
      message += `👨‍💼 <b>Менеджер:</b> ${manager}\\n`;
    }
    
    message += `🌐 <b>Джерело:</b> ${data.source || 'Website'}-${config.ENVIRONMENT}`;
    
    return message;
  }
}

/**
 * Тестування
 */
async function testUkrainianText() {
  console.log('🧪 ТЕСТ UTF-8 КОДУВАННЯ УКРАЇНСЬКИХ СИМВОЛІВ');
  console.log('='.repeat(60));
  console.log(`🕒 Час: ${new Date().toLocaleString('uk-UA')}`);
  console.log('='.repeat(60));
  
  const telegramService = new TelegramService();
  const testChatId = '1559533342'; // Геннадій Дикий
  
  try {
    // Тест 1: Простий український текст
    console.log('\\n🧪 ТЕСТ 1: Простий український текст');
    console.log('-'.repeat(40));
    
    const simpleUkrainianMessage = `🧪 ТЕСТ: Привіт Геннадій!
    
⏰ Час: ${new Date().toLocaleString('uk-UA')}
🤖 Бот: @COMSPEC_Orders_bot
👤 Отримувач: Геннадій Дикий

✅ Це тестове повідомлення українською мовою!`;

    console.log('📤 Відправляємо простий український текст...');
    const result1 = await telegramService.sendMessage(simpleUkrainianMessage, testChatId, null);
    console.log('✅ Результат:', result1);
    
    // Тест 2: Форматоване замовлення
    console.log('\\n🧪 ТЕСТ 2: Повідомлення про замовлення');
    console.log('-'.repeat(40));
    
    const mockOrderData = {
      orderId: '#TEST_UTF8',
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
        message: 'Потрібно 5 тонн матеріалу',
        source: 'UTF8-Test'
      }
    };
    
    console.log('📤 Відправляємо повідомлення про замовлення...');
    const orderMessage = telegramService.formatOrderMessage(mockOrderData);
    const result2 = await telegramService.sendMessage(orderMessage, testChatId, 'HTML');
    console.log('✅ Результат:', result2);
    
    console.log('\\n' + '='.repeat(60));
    console.log('🎉 ВСІ ТЕСТИ ПРОЙШЛИ УСПІШНО!');
    console.log('✅ UTF-8 кодування працює коректно');
    console.log('✅ Українські символи відправляються правильно');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.log('\\n' + '='.repeat(60));
    console.error('🚨 ТЕСТ НЕ ПРОЙШОВ:');
    console.error(`❌ ${error.message}`);
    console.log('='.repeat(60));
    process.exit(1);
  }
}

// Запуск тесту
testUkrainianText().catch(error => {
  console.error('💥 Критична помилка:', error);
  process.exit(1);
});