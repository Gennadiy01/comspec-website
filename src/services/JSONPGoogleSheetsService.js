/**
 * СТАБІЛЬНА ВЕРСІЯ JSONP Google Sheets Service для COMSPEC
 * ✅ Перевірено - працює без помилок
 * 🔧 Тільки збільшений таймаут для надійності
 * 🌐 Додано підтримку універсальної конфігурації
 */

import config from '../config/environment';

class JSONPGoogleSheetsService {
  constructor() {
    this.scriptUrl = config.GOOGLE_SCRIPT_URL;
    this.callbackCounter = 0;
    
    console.log('[JSONPGoogleSheetsService] ✅ Ініціалізовано з URL:', this.scriptUrl);
    console.log('[JSONPGoogleSheetsService] 🌐 Середовище:', config.ENVIRONMENT);
    console.log('[JSONPGoogleSheetsService] 🚀 CORS проблема обійдена через JSONP!');
    
    if (!this.scriptUrl) {
      console.error('[JSONPGoogleSheetsService] ❌ Google Apps Script URL не налаштований');
      throw new Error('Google Apps Script URL не налаштований');
    }
    
    // Додаємо сервіс до window для зручності тестування
    if (typeof window !== 'undefined') {
      window.jsonpGoogleSheetsService = this;
    }
  }

  /**
   * Генерація унікального імені callback функції
   */
  generateCallbackName() {
    this.callbackCounter++;
    return `jsonpCallback${Date.now()}_${this.callbackCounter}`;
  }

  /**
   * Тестування підключення до Google Apps Script
   */
  testConnection() {
    return new Promise((resolve, reject) => {
      const callbackName = this.generateCallbackName();
      
      // Створюємо глобальну callback функцію
      window[callbackName] = (response) => {
        console.log('🧪 Тест підключення:', response);
        delete window[callbackName]; // Очищаємо callback
        resolve(response);
      };
      
      // Створюємо JSONP запит
      const script = document.createElement('script');
      const params = new URLSearchParams({
        action: 'test',
        callback: callbackName
      });
      
      script.src = `${this.scriptUrl}?${params.toString()}`;
      script.onerror = () => {
        delete window[callbackName];
        reject(new Error('Помилка підключення до Google Apps Script'));
      };
      
      document.head.appendChild(script);
      
      // ✅ ЗБІЛЬШЕНИЙ ТАЙМАУТ до 20 секунд
      setTimeout(() => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
        if (window[callbackName]) {
          delete window[callbackName];
          reject(new Error('Таймаут підключення'));
        }
      }, 20000); // Було 15000, стало 20000
    });
  }

  /**
   * Відправка повідомлення зворотного зв'язку через JSONP
   * @param {Object} feedbackData - Дані повідомлення {name, phone, email, message}
   * @param {string} source - Джерело повідомлення
   * @returns {Promise<Object>} - Результат операції
   */
  saveFeedback(feedbackData, source = 'contact-form') {
    return new Promise((resolve, reject) => {
      const callbackName = this.generateCallbackName();
      
      if (config.DEBUG_MODE) {
        console.log('🔧 Створюємо callback для feedback:', callbackName);
      }
      
      // Створюємо глобальну callback функцію
      window[callbackName] = (response) => {
        console.log('📦 Відповідь від Google Apps Script (feedback):', response);
        delete window[callbackName];
        
        if (response && response.success) {
          resolve(response);
        } else {
          reject(new Error(response?.error || 'Невідома помилка при відправці повідомлення'));
        }
      };
      
      // Підготовка параметрів для feedback
      const params = {
        action: 'saveFeedback',
        name: feedbackData.name || '',
        phone: feedbackData.phone || '',
        email: feedbackData.email || '',
        message: feedbackData.message || '',
        source: `${source}-${config.ENVIRONMENT}`,
        mode: 'feedback',
        callback: callbackName
      };
      
      // Логування для діагностики
      if (config.DEBUG_MODE) {
        console.log('🎯 Параметри для відправки (feedback):', params);
      }
      
      // Створюємо URL з параметрами
      const urlParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          urlParams.append(key, params[key]);
        }
      });
      
      const finalUrl = `${this.scriptUrl}?${urlParams.toString()}`;
      
      if (config.DEBUG_MODE) {
        console.log('🌐 Фінальний URL (feedback):', finalUrl);
      }
      
      // Створюємо script елемент для JSONP запиту
      const script = document.createElement('script');
      script.src = finalUrl;
      script.onload = () => document.body.removeChild(script);
      script.onerror = () => {
        delete window[callbackName];
        document.body.removeChild(script);
        reject(new Error('Помилка мережі при відправці повідомлення'));
      };
      
      console.log('📤 Відправляємо JSONP запит (feedback):', finalUrl);
      console.log('🔗 Callback функція готова:', typeof window[callbackName]);
      
      document.body.appendChild(script);
    });
  }

  /**
   * ⭐ СТАБІЛЬНА функція збереження замовлення через JSONP
   */
  saveOrder(orderData, isConsultationMode = false, source = 'Website') {
    return new Promise((resolve, reject) => {
      const callbackName = this.generateCallbackName();
      
      // ✅ ВИПРАВЛЕННЯ ДЛЯ EDGE: створюємо callback раніше
      if (config.DEBUG_MODE) {
        console.log('🔧 Створюємо callback:', callbackName);
      }
      
      // Створюємо глобальну callback функцію
      window[callbackName] = (response) => {
        if (config.DEBUG_MODE) {
          console.log('📦 Відповідь від Google Apps Script:', response);
        }
        
        // ✅ ПОКРАЩЕНИЙ CLEANUP з затримкою
        setTimeout(() => {
          delete window[callbackName];
        }, 500); // Затримка перед видаленням
        
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Невідома помилка'));
        }
      };
      
      // 🔧 PRODUCTION FIX: Спеціальна обробка для самовивозу (ЗАВЖДИ, не тільки для Edge)
      let addressValue = '';
      let regionValue = '';
      
      if (orderData.deliveryType === 'pickup') {
        // Для самовивозу гарантовано очищаємо адресу
        addressValue = '';
        regionValue = '';
        console.log('🔧 Production Fix: Примусово очищено адресу для самовивозу в JSONP сервісі');
      } else {
        // Для доставки використовуємо звичайну логіку
        addressValue = orderData.address || orderData.deliveryAddress || '';
        regionValue = orderData.region || '';
      }
      
      // Підготовка параметрів
      const params = {
        action: 'saveOrder',
        name: orderData.name || '',
        phone: orderData.phone || '',
        email: orderData.email || '',
        product: orderData.product || '',
        deliveryType: orderData.deliveryType || '',
        address: addressValue,
        region: regionValue,
        message: orderData.message || '',
        source: `${source}-${config.ENVIRONMENT}`,
        mode: isConsultationMode ? 'consultation' : 'order',
        Loading_Point: orderData.loadingPoint || orderData.Loading_Point || '',
        callback: callbackName
      };
      
      // Логування для діагностики (тільки в debug режимі)
      if (config.DEBUG_MODE) {
        console.log('🎯 Параметри для відправки:', params);
        console.log('🎯 Loading_Point значення:', params.Loading_Point);
      }
      
      // Створюємо URL з параметрами
      const urlParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          urlParams.append(key, params[key]);
        }
      });
      
      const finalUrl = `${this.scriptUrl}?${urlParams.toString()}`;
      
      if (config.DEBUG_MODE) {
        console.log('🌐 Фінальний URL:', finalUrl);
      }
      
      // ✅ ВИПРАВЛЕННЯ ДЛЯ EDGE: переконуємось що callback існує
      if (!window[callbackName]) {
        console.error('❌ Callback функція не створена:', callbackName);
        reject(new Error('Помилка створення callback функції'));
        return;
      }
      
      // Створюємо і виконуємо JSONP запит
      const script = document.createElement('script');
      script.src = finalUrl;
      script.onerror = () => {
        console.error('❌ Помилка завантаження JSONP script:', finalUrl);
        setTimeout(() => {
          if (window[callbackName]) {
            delete window[callbackName];
          }
        }, 500);
        reject(new Error('Помилка відправки даних'));
      };
      
      // ✅ ДОДАНО: логування для Edge
      if (config.DEBUG_MODE) {
        console.log('📤 Відправляємо JSONP запит:', finalUrl);
        console.log('🔗 Callback функція готова:', typeof window[callbackName]);
      }
      
      document.head.appendChild(script);
      
      // ✅ ЗБІЛЬШЕНИЙ ТАЙМАУТ до 30 секунд для Edge
      const timeoutId = setTimeout(() => {
        console.warn('⏰ Таймаут JSONP запиту через 30 секунд');
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
        if (window[callbackName]) {
          console.error('❌ Callback існує при таймауті:', callbackName);
          delete window[callbackName];
          reject(new Error('Таймаут відправки'));
        }
      }, 30000); // Збільшено до 30 секунд для Edge
      
      // ✅ ДОДАНО: очищення timeoutId при успішному callback
      const originalCallback = window[callbackName];
      window[callbackName] = (response) => {
        clearTimeout(timeoutId);
        originalCallback(response);
      };
    });
  }

  /**
   * Тест для Loading_Point
   */
  testLoadingPoint() {
    const testData = {
      name: 'Тест Стабільний JSONP',
      phone: '+380999888777',
      email: 'stable@test.com',
      product: 'Щебінь',
      deliveryType: 'delivery',
      address: 'Київ, вул. Стабільна, 1',
      message: 'Тест стабільної версії JSONP',
      Loading_Point: "ТДВ «Ігнатпільський кар'єр»"
    };
    
    console.log('🧪 Запуск стабільного тесту Loading_Point...');
    return this.saveOrder(testData, false, 'StableJSONPTest');
  }

  /**
   * Нова функція для відправки замовлень з OrderModal
   */
  async submitOrder(orderData) {
    try {
      const cleanData = this.cleanOrderData(orderData);
      return await this.saveOrder(cleanData, false, 'ReactWebsite');
    } catch (error) {
      console.error('[JSONPGoogleSheetsService] Помилка відправки замовлення:', error);
      throw error;
    }
  }

  /**
   * Очищення та нормалізація даних замовлення
   */
  cleanOrderData(orderData) {
    return {
      name: (orderData.name || '').trim(),
      phone: this.normalizePhone(orderData.phone || ''),
      email: (orderData.email || '').trim(),
      product: orderData.product || '',
      deliveryType: orderData.deliveryType || 'delivery',
      address: (orderData.address || '').trim(),
      loadingPoint: orderData.loadingPoint || '',
      message: (orderData.message || '').trim(),
      region: orderData.region || ''
    };
  }

  /**
   * Нормалізація телефонного номера
   */
  normalizePhone(phone) {
    if (!phone) return '';
    
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    if (cleanPhone.startsWith('+380')) {
      return cleanPhone;
    } else if (cleanPhone.startsWith('380')) {
      return '+' + cleanPhone;
    } else if (cleanPhone.startsWith('0')) {
      return '+38' + cleanPhone;
    } else if (cleanPhone.length === 9) {
      return '+380' + cleanPhone;
    }
    
    return cleanPhone;
  }
}

// Створюємо екземпляр сервісу
const jsonpService = new JSONPGoogleSheetsService();

// Тестові функції
if (typeof window !== 'undefined') {
  
  // Швидкий тест
  window.testStableJSONP = () => {
    console.log('🧪 Тест стабільної версії JSONP...');
    
    jsonpService.testConnection()
      .then(response => {
        console.log('✅ Підключення працює:', response);
        return jsonpService.testLoadingPoint();
      })
      .then(response => {
        console.log('✅ Замовлення працює:', response);
        console.log('🎉 СТАБІЛЬНА ВЕРСІЯ ПРАЦЮЄ ІДЕАЛЬНО!');
      })
      .catch(error => {
        console.error('❌ Помилка:', error);
      });
  };
  
  // Тест тільки підключення
  window.testConnection = () => {
    jsonpService.testConnection()
      .then(response => {
        console.log('✅ Тест підключення успішний:', response);
      })
      .catch(error => {
        console.error('❌ Помилка підключення:', error);
      });
  };

  // Тест нової функції submitOrder
  window.testSubmitOrder = () => {
    const testOrderData = {
      name: 'Тест SubmitOrder',
      phone: '+380501234567',
      email: 'test@submitorder.com',
      product: 'Щебінь',
      deliveryType: 'delivery',
      address: 'Київ, вул. Тестова, 123',
      loadingPoint: "ТДВ «Ігнатпільський кар'єр»",
      message: 'Тестове замовлення через submitOrder'
    };

    console.log('🧪 Тест функції submitOrder...');
    jsonpService.submitOrder(testOrderData)
      .then(response => {
        console.log('✅ submitOrder працює:', response);
      })
      .catch(error => {
        console.error('❌ Помилка submitOrder:', error);
      });
  };

  // Додаємо інформацію про конфігурацію до глобального об'єкта
  window.COMSPEC_SERVICE_INFO = {
    environment: config.ENVIRONMENT,
    debugMode: config.DEBUG_MODE,
    scriptUrl: config.GOOGLE_SCRIPT_URL ? 'Налаштовано' : 'Відсутній',
    version: 'Stable JSONP v2.0'
  };
}

export default jsonpService;