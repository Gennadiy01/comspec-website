/**
 * 🤖 TELEGRAM SERVICE ДЛЯ COMSPEC
 * Сервіс для відправки замовлень в Telegram через Bot API
 * 
 * Етап 1: Базове підключення та тестування
 */

import config from '../config/environment';

class TelegramService {
  constructor() {
    this.botToken = config.TELEGRAM_BOT_TOKEN;
    this.chatId = config.TELEGRAM_CHAT_ID; // Fallback чат
    this.enabled = config.TELEGRAM_ENABLED;
    this.apiUrl = config.TELEGRAM_API_URL;
    this.timeout = config.TELEGRAM_TIMEOUT || 10000;
    this.managers = config.TELEGRAM_MANAGERS || {};
    
    // Логування ініціалізації
    console.log('[TelegramService] ✅ Ініціалізовано');
    console.log('[TelegramService] 🤖 Bot enabled:', this.enabled);
    console.log('[TelegramService] 🌐 Середовище:', config.ENVIRONMENT);
    
    // Перевірка конфігурації
    if (!this.botToken) {
      console.warn('[TelegramService] ⚠️ Bot token не налаштований');
    }
    
    if (!this.chatId) {
      console.warn('[TelegramService] ⚠️ Chat ID не налаштований');
    }
    
    // Додаємо сервіс до window для тестування
    if (typeof window !== 'undefined') {
      window.telegramService = this;
    }
  }

  /**
   * Перевірка чи Telegram сервіс увімкнений
   */
  isEnabled() {
    return this.enabled && this.botToken;
  }

  /**
   * 🆕 ЕТАП 3: Пошук Chat ID менеджера по імені
   */
  findManagerChatId(managerName) {
    if (!managerName || typeof managerName !== 'string') {
      return null;
    }
    
    // Точна відповідність імені
    if (this.managers[managerName]) {
      return this.managers[managerName];
    }
    
    // Пошук по частині імені (якщо в Google Sheets інший формат)
    const normalizedName = managerName.toLowerCase().trim();
    
    for (const [name, chatId] of Object.entries(this.managers)) {
      if (name.toLowerCase().includes(normalizedName) || 
          normalizedName.includes(name.toLowerCase())) {
        console.log(`[TelegramService] 🔍 Знайдено менеджера: "${managerName}" → "${name}" (${chatId})`);
        return chatId;
      }
    }
    
    console.warn(`[TelegramService] ⚠️ Chat ID для менеджера "${managerName}" не знайдено`);
    return null;
  }

  /**
   * 🆕 ЕТАП 3: Відправка персонального повідомлення менеджеру
   */
  async sendPersonalMessage(managerName, message) {
    const chatId = this.findManagerChatId(managerName);
    
    if (chatId) {
      console.log(`[TelegramService] 📤 Персональне повідомлення для ${managerName} (${chatId})`);
      return await this.sendMessage(message, chatId);
    } else {
      console.warn(`[TelegramService] ⚠️ Fallback: відправляємо в загальний чат`);
      return await this.sendMessage(message, this.chatId);
    }
  }

  /**
   * Базовий HTTP запит до Telegram Bot API
   */
  async makeRequest(method, params = {}) {
    if (!this.isEnabled()) {
      throw new Error('Telegram service вимкнений або не налаштований');
    }

    const url = `${this.apiUrl}${this.botToken}/${method}`;
    
    console.log(`[TelegramService] 📡 Запит: ${method}`);
    
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
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
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

  /**
   * Тест підключення до Bot API
   */
  async testConnection() {
    try {
      console.log('[TelegramService] 🧪 Тестування підключення...');
      
      const result = await this.makeRequest('getMe');
      
      console.log('[TelegramService] ✅ Підключення успішне!');
      console.log('[TelegramService] 🤖 Bot info:', {
        username: result.username,
        first_name: result.first_name,
        id: result.id
      });
      
      return {
        success: true,
        bot: result,
        message: 'Підключення до Telegram Bot API успішне'
      };
    } catch (error) {
      console.error('[TelegramService] ❌ Помилка підключення:', error);
      return {
        success: false,
        error: error.message,
        message: 'Не вдалося підключитися до Telegram Bot API'
      };
    }
  }

  /**
   * Відправка тестового повідомлення
   */
  async sendTestMessage(chatId = null) {
    const targetChatId = chatId || this.chatId;
    
    if (!targetChatId) {
      throw new Error('Chat ID не налаштований');
    }
    
    const message = `🧪 ТЕСТОВЕ ПОВІДОМЛЕННЯ COMSPEC
    
🕒 Час: ${new Date().toLocaleString('uk-UA')}
🤖 Bot: @COMSPEC_Orders_bot
🌐 Середовище: ${config.ENVIRONMENT}
    
✅ Telegram інтеграція працює!`;

    try {
      const result = await this.makeRequest('sendMessage', {
        chat_id: targetChatId,
        text: message,
        parse_mode: 'HTML'
      });
      
      console.log('[TelegramService] ✅ Тестове повідомлення відправлено');
      return {
        success: true,
        messageId: result.message_id,
        message: 'Тестове повідомлення відправлено успішно'
      };
    } catch (error) {
      console.error('[TelegramService] ❌ Помилка відправки тестового повідомлення:', error);
      throw error;
    }
  }

  /**
   * Отримання інформації про чат
   */
  async getChatInfo(chatId = null) {
    const targetChatId = chatId || this.chatId;
    
    if (!targetChatId) {
      throw new Error('Chat ID не налаштований');
    }
    
    try {
      const result = await this.makeRequest('getChat', {
        chat_id: targetChatId
      });
      
      console.log('[TelegramService] ✅ Інформація про чат отримана');
      return {
        success: true,
        chat: result,
        message: 'Інформація про чат отримана успішно'
      };
    } catch (error) {
      console.error('[TelegramService] ❌ Помилка отримання інформації про чат:', error);
      throw error;
    }
  }

  /**
   * Базовий метод відправки повідомлення (буде розширено в Етапі 2)
   */
  async sendMessage(text, chatId = null, parseMode = null) {
    const targetChatId = chatId || this.chatId;
    
    if (!targetChatId) {
      throw new Error('Chat ID не налаштований');
    }
    
    const params = {
      chat_id: targetChatId,
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

  /**
   * 🆕 ЕТАП 3: Відправка повідомлення про замовлення (ОНОВЛЕНО ДЛЯ GOOGLE APPS SCRIPT)
   */
  async sendOrderNotification(orderData) {
    console.log('[TelegramService] 📋 Відправка замовлення:', orderData);
    
    if (!this.isEnabled()) {
      console.warn('[TelegramService] ⚠️ Telegram вимкнений, пропускаємо відправку');
      return {
        success: false,
        message: 'Telegram сервіс вимкнений'
      };
    }
    
    try {
      // Форматування повідомлення
      const message = this.formatOrderMessage(orderData);
      
      // 🆕 ЕТАП 3: Використовуємо Chat ID з Google Apps Script
      let results = [];
      
      if (orderData.manager) {
        console.log(`[TelegramService] 👨‍💼 Відправляємо менеджеру: ${orderData.manager}`);
        
        // 🆕 НОВИНКА: Chat ID приходить з Google Apps Script
        const managerChatId = orderData.managerTelegramChatId;
        
        if (managerChatId) {
          console.log(`[TelegramService] 📱 Chat ID з Google Apps Script: ${managerChatId}`);
          
          try {
            const personalResult = await this.sendMessage(message, managerChatId);
            results.push({
              target: 'personal',
              manager: orderData.manager,
              chatId: managerChatId,
              source: 'google_apps_script',
              ...personalResult
            });
            
            console.log(`[TelegramService] ✅ Персональне повідомлення відправлено ${orderData.manager} (${managerChatId})`);
          } catch (error) {
            console.error(`[TelegramService] ❌ Помилка персонального повідомлення:`, error);
            
            // Fallback: відправляємо в загальний чат
            if (this.chatId) {
              console.log('[TelegramService] 🔄 Fallback: відправляємо в загальний чат');
              const fallbackResult = await this.sendMessage(message, this.chatId);
              results.push({
                target: 'fallback_group',
                chatId: this.chatId,
                reason: 'personal_message_failed',
                ...fallbackResult
              });
            }
          }
        } else {
          // Немає Chat ID для менеджера - відправляємо в загальний чат
          console.warn(`[TelegramService] ⚠️ Немає Chat ID для менеджера ${orderData.manager}`);
          
          if (this.chatId) {
            console.log('[TelegramService] 🔄 Fallback: відправляємо в загальний чат (немає Chat ID)');
            const fallbackResult = await this.sendMessage(message, this.chatId);
            results.push({
              target: 'fallback_no_chatid',
              chatId: this.chatId,
              manager: orderData.manager,
              reason: 'manager_no_chatid',
              ...fallbackResult
            });
          }
        }
      } else {
        // Немає призначеного менеджера - відправляємо в загальний чат
        if (this.chatId) {
          console.log('[TelegramService] 📤 Немає менеджера, відправляємо в загальний чат');
          const result = await this.sendMessage(message, this.chatId);
          results.push({
            target: 'group_no_manager',
            chatId: this.chatId,
            ...result
          });
        }
      }
      
      return {
        success: results.length > 0,
        results: results,
        message: `Замовлення відправлено: ${results.map(r => r.target).join(', ')}`
      };
      
    } catch (error) {
      console.error('[TelegramService] ❌ Помилка відправки замовлення:', error);
      
      // НЕ кидаємо помилку - Telegram не повинен блокувати основний процес
      return {
        success: false,
        error: error.message,
        message: 'Помилка відправки в Telegram (замовлення збережено)'
      };
    }
  }

  /**
   * Відправка повідомлення про зворотний зв'язок
   */
  async sendFeedbackNotification(feedbackData) {
    console.log('[TelegramService] 📋 Відправка повідомлення зворотного зв\'язку:', feedbackData);
    
    if (!this.isEnabled()) {
      console.warn('[TelegramService] ⚠️ Telegram вимкнений, пропускаємо відправку');
      return {
        success: false,
        message: 'Telegram сервіс вимкнений'
      };
    }
    
    try {
      // Форматування повідомлення
      const message = this.formatFeedbackMessage(feedbackData);
      
      let results = [];
      
      if (feedbackData.manager && feedbackData.managerTelegramChatId) {
        console.log(`[TelegramService] 👨‍💼 Відправляємо менеджеру: ${feedbackData.manager}`);
        console.log(`[TelegramService] 📱 Chat ID: ${feedbackData.managerTelegramChatId}`);
        
        try {
          const personalResult = await this.sendMessage(message, feedbackData.managerTelegramChatId);
          results.push({
            target: 'personal',
            manager: feedbackData.manager,
            chatId: feedbackData.managerTelegramChatId,
            ...personalResult
          });
          console.log(`[TelegramService] ✅ Персональне повідомлення відправлено ${feedbackData.manager} (${feedbackData.managerTelegramChatId})`);
        } catch (error) {
          console.error(`[TelegramService] ❌ Помилка відправки персонального повідомлення: ${error.message}`);
          results.push({
            target: 'personal',
            manager: feedbackData.manager,
            error: error.message
          });
        }
      }
      
      return {
        success: results.some(r => r.success),
        results: results,
        message: results.some(r => r.success) ? 
          'Повідомлення відправлено: personal' : 
          'Помилки відправки повідомлень'
      };
      
    } catch (error) {
      console.error('[TelegramService] ❌ Загальна помилка відправки повідомлення:', error);
      return {
        success: false,
        error: error.message,
        message: 'Загальна помилка відправки в Telegram'
      };
    }
  }

  /**
   * Форматування повідомлення про зворотний зв'язок
   */
  formatFeedbackMessage(feedbackData) {
    const { feedbackData: data } = feedbackData;
    
    return `НОВЕ ПОВІДОМЛЕННЯ ЗВОРОТНОГО ЗВ'ЯЗКУ

Ім'я: ${data.name}
Телефон: ${data.phone}
Email: ${data.email || 'Не вказано'}

Повідомлення:
${data.message}

Час: ${new Date().toLocaleString('uk-UA')}
Джерело: Форма зворотного зв'язку`;
  }

  /**
   * ✅ ЕТАП 2: Форматування повідомлення про замовлення
   */
  formatOrderMessage(orderData) {
    const {
      orderId,
      manager,
      orderData: data,
      isConsultation
    } = orderData;
    
    // Безпечна перевірка даних
    if (!data || typeof data !== 'object') {
      console.error('[TelegramService] ❌ Некоректні дані замовлення:', { orderData, data });
      return `❌ ПОМИЛКА ФОРМАТУВАННЯ\nЗамовлення #${orderId || 'Невідомо'}\nМенеджер: ${manager || 'Не призначено'}`;
    }
    
    // Базова інформація
    const orderType = isConsultation ? 'КОНСУЛЬТАЦІЯ' : 'НОВЕ ЗАМОВЛЕННЯ';
    const orderNumber = orderId || 'Генерується...';
    
    // Форматування повідомлення
    let message = `${orderType} #${orderNumber}\n\n`;
    
    // Контактна інформація
    message += `Клієнт: ${data.name || 'Не вказано'}\n`;
    message += `📞 Телефон: ${data.phone || 'Не вказано'}\n`;
    
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
      
      if (data.loadingPoint || data.Loading_Point) {
        message += `Завантаження: ${data.loadingPoint || data.Loading_Point}\n`;
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
    
    message += `Джерело: Сайт (форма замовлення)`;
    
    return message;
  }
}

// Створюємо екземпляр сервісу
const telegramService = new TelegramService();

// Тестові функції для window
if (typeof window !== 'undefined') {
  
  // Базовий тест підключення
  window.testTelegramConnection = async () => {
    console.log('🧪 Тестування Telegram підключення...');
    try {
      const result = await telegramService.testConnection();
      console.log('✅ Результат тесту:', result);
      return result;
    } catch (error) {
      console.error('❌ Помилка тесту:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  // Тест відправки повідомлення (потребує Chat ID)
  window.testTelegramMessage = async (chatId) => {
    if (!chatId) {
      console.error('❌ Потрібен Chat ID для тесту. Використання: testTelegramMessage("YOUR_CHAT_ID")');
      return;
    }
    
    console.log('🧪 Тестування відправки повідомлення...');
    try {
      const result = await telegramService.sendTestMessage(chatId);
      console.log('✅ Результат тесту:', result);
      return result;
    } catch (error) {
      console.error('❌ Помилка тесту:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  // 🆕 ЕТАП 2: Тест форматування замовлення
  window.testOrderFormatting = (chatId) => {
    const mockOrderData = {
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
    
    console.log('🧪 Тестування форматування замовлення...');
    const formattedMessage = telegramService.formatOrderMessage(mockOrderData);
    console.log('📋 Відформатоване повідомлення:');
    console.log(formattedMessage);
    
    if (chatId) {
      console.log('📤 Відправляємо тестове замовлення в чат:', chatId);
      return telegramService.sendOrderNotification({
        ...mockOrderData,
        chatId: chatId
      });
    }
    
    return {
      success: true,
      formattedMessage: formattedMessage
    };
  };
  
  // 🆕 ЕТАП 2: Тест консультації
  window.testConsultationFormatting = (chatId) => {
    const mockConsultationData = {
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
    
    console.log('🧪 Тестування форматування консультації...');
    const formattedMessage = telegramService.formatOrderMessage(mockConsultationData);
    console.log('📋 Відформатоване повідомлення:');
    console.log(formattedMessage);
    
    if (chatId) {
      console.log('📤 Відправляємо тестову консультацію в чат:', chatId);
      return telegramService.sendOrderNotification({
        ...mockConsultationData,
        chatId: chatId
      });
    }
    
    return {
      success: true,
      formattedMessage: formattedMessage
    };
  };
  
  // Додаємо інформацію про сервіс
  window.TELEGRAM_SERVICE_INFO = {
    enabled: telegramService.enabled,
    hasBotToken: !!telegramService.botToken,
    hasChatId: !!telegramService.chatId,
    environment: config.ENVIRONMENT,
    version: 'Telegram Service v1.0 - Етап 1'
  };
  
  console.log('[TelegramService] 🎯 Тестові функції додано до window:');
  console.log('  - testTelegramConnection() - тест підключення');
  console.log('  - testTelegramMessage("CHAT_ID") - тест повідомлення');
  console.log('  - testOrderFormatting("CHAT_ID") - тест замовлення');
  console.log('  - testConsultationFormatting("CHAT_ID") - тест консультації');
  console.log('  - window.TELEGRAM_SERVICE_INFO - інформація про сервіс');
}

export default telegramService;