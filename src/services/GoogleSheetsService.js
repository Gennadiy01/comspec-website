// src/services/GoogleSheetsService.js
/**
 * COMSPEC Google Sheets Integration Service - Виправлена версія
 * Використовує API Key для читання та Google Apps Script для запису
 */

class GoogleSheetsService {
  constructor() {
    // Конфігурація з environment variables
    this.config = {
      sheetsId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
      apiKey: process.env.REACT_APP_GOOGLE_SHEETS_API_KEY,
      scriptUrl: process.env.REACT_APP_GOOGLE_SCRIPT_URL,
      debugMode: process.env.REACT_APP_DEBUG_MODE === 'true'
    };

    // Назви листів у Google Sheets
    this.sheets = {
      ORDERS: 'Orders',
      MANAGERS: 'Managers', 
      LOADING_POINTS: 'Loading_Points',
      DELIVERY_ZONES: 'Delivery_Zones'
    };
    
    // Кеш для оптимізації
    this.cache = {
      managers: null,
      loadingPoints: null,
      deliveryZones: null,
      lastUpdate: null,
      cacheTimeout: 5 * 60 * 1000 // 5 хвилин
    };

    // Base URL для Google Sheets API
    this.baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

    // Валідація конфігурації
    this.validateConfig();

    this.log('GoogleSheetsService ініціалізовано');
  }

  /**
   * Валідація конфігурації
   */
  validateConfig() {
    if (!this.config.sheetsId) {
      throw new Error('Відсутній REACT_APP_GOOGLE_SHEETS_ID');
    }

    if (!this.config.apiKey) {
      console.warn('⚠️ Відсутній API ключ, використовується fallback режим');
    }

    this.log('✅ Конфігурація валідна');
  }

  /**
   * Збереження нового замовлення - ГОЛОВНИЙ МЕТОД
   */
  async saveOrder(formData, isConsultationMode = false, source = 'website') {
    try {
      this.log('🚀 Початок збереження замовлення:', { formData, isConsultationMode, source });

      // 1. Валідуємо дані форми
      this.validateFormData(formData, isConsultationMode);

      // 2. Підготовуємо дані для збереження
      const orderData = this.buildOrderData(formData, isConsultationMode, source);

      // 3. Зберігаємо через Google Apps Script
      const result = await this.saveViaScript(orderData);

      this.log('✅ Замовлення успішно збережено:', result);

      return {
        success: true,
        orderId: result.orderId,
        manager: result.manager,
        message: 'Замовлення успішно збережено'
      };

    } catch (error) {
      this.logError('❌ Помилка збереження замовлення:', error);
      
      // Fallback: зберігаємо в localStorage для відновлення
      this.saveFallbackOrder(formData, isConsultationMode, source);
      
      throw new Error(`Не вдалося зберегти замовлення: ${error.message}`);
    }
  }

  /**
   * Збереження через Google Apps Script
   */
  async saveViaScript(orderData) {
    if (!this.config.scriptUrl) {
      throw new Error('Google Apps Script URL не налаштований');
    }

    try {
      const response = await fetch(this.config.scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'saveOrder',
          data: orderData
        })
      });

      if (!response.ok) {
        throw new Error(`Script API помилка: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Невідома помилка скрипта');
      }

      return result;

    } catch (error) {
      this.logError('Помилка Google Apps Script:', error);
      throw error;
    }
  }

  /**
   * Побудова об'єкта даних замовлення
   */
  buildOrderData(formData, isConsultationMode, source) {
    const now = new Date();
    
    return {
      // Основні дані клієнта
      name: formData.name?.trim() || '',
      phone: formData.phone?.trim() || '',
      email: formData.email?.trim() || '',
      message: formData.message?.trim() || '',
      
      // Дані замовлення (тільки для режиму замовлення)
      product: isConsultationMode ? '' : (formData.product || ''),
      deliveryType: isConsultationMode ? '' : (formData.deliveryType || ''),
      address: isConsultationMode ? '' : (formData.address || ''),
      region: isConsultationMode ? '' : (formData.region || ''),
      loadingPoint: isConsultationMode ? '' : (formData.loadingPoint || ''),
      
      // Системні поля
      source: source,
      mode: isConsultationMode ? 'consultation' : 'order',
      timestamp: now.toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }

  /**
   * Валідація даних форми - ✅ ВИПРАВЛЕНО
   */
  validateFormData(formData, isConsultationMode) {
    const errors = [];

    // Обов'язкові поля для всіх режимів
    if (!formData.name?.trim()) {
      errors.push('Не вказано ім\'я');
    }

    if (!formData.phone?.trim()) {
      errors.push('Не вказано телефон');
    }

    // Валідація телефону - ✅ ВИПРАВЛЕНО (без зайвих екранувань)
    const phoneRegex = /^\+380\d{9}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/[\s\-()]/g, ''))) {
      errors.push('Неправильний формат телефону (має бути +380XXXXXXXXX)');
    }

    // Валідація email (якщо вказано)
    if (formData.email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.push('Неправильний формат email');
      }
    }

    // Додаткова валідація для режиму замовлення
    if (!isConsultationMode) {
      if (!formData.product) {
        errors.push('Не обрано продукт');
      }

      if (!formData.deliveryType) {
        errors.push('Не обрано тип доставки');
      }

      if (formData.deliveryType === 'delivery' && !formData.address?.trim()) {
        errors.push('Не вказано адресу доставки');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Помилки валідації: ${errors.join(', ')}`);
    }

    this.log('✅ Валідація форми пройшла успішно');
  }

  /**
   * Fallback збереження в localStorage
   */
  saveFallbackOrder(formData, isConsultationMode, source) {
    try {
      const fallbackData = {
        ...formData,
        isConsultationMode,
        source,
        timestamp: new Date().toISOString(),
        status: 'pending_sync'
      };

      const existingOrders = JSON.parse(localStorage.getItem('comspec_fallback_orders') || '[]');
      existingOrders.push(fallbackData);
      
      localStorage.setItem('comspec_fallback_orders', JSON.stringify(existingOrders));
      
      this.log('💾 Замовлення збережено у fallback режимі');
    } catch (error) {
      this.logError('Помилка fallback збереження:', error);
    }
  }

  /**
   * Читання даних з Google Sheets через API Key
   */
  async readSheet(sheetName, range = 'A:Z') {
    if (!this.config.apiKey) {
      throw new Error('API ключ не налаштований');
    }

    try {
      const url = `${this.baseUrl}/${this.config.sheetsId}/values/${sheetName}!${range}?key=${this.config.apiKey}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Немає доступу до Google Sheets (перевірте API ключ та дозволи)');
        }
        throw new Error(`API помилка: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.log(`✅ Дані отримано з листа ${sheetName}:`, data.values?.length || 0, 'рядків');
      
      return data;

    } catch (error) {
      this.logError(`Помилка читання листа ${sheetName}:`, error);
      throw error;
    }
  }

  /**
   * Отримання списку менеджерів - ✅ ВИПРАВЛЕНО
   */
  async getManagers() {
    try {
      // Перевіряємо кеш
      if (this.cache.managers && this.isCacheValid()) {
        this.log('📦 Менеджери взято з кешу');
        return this.cache.managers;
      }

      // Читаємо з Google Sheets
      const data = await this.readSheet(this.sheets.MANAGERS, 'A:G');
      
      if (!data.values || data.values.length <= 1) {
        throw new Error('Не знайдено менеджерів у базі даних');
      }

      // ✅ ВИДАЛЕНО невикористану змінну headers
      const managers = data.values.slice(1).map((row, index) => ({
        id: parseInt(row[0]) || (index + 1),
        name: row[1] || `Менеджер ${index + 1}`,
        telegramId: row[2] || '',
        email: row[3] || '',
        active: row[4] === 'TRUE' || row[4] === true,
        lastOrder: row[5] || null,
        ordersToday: parseInt(row[6]) || 0
      }));

      // Оновлюємо кеш
      this.cache.managers = managers;
      this.cache.lastUpdate = Date.now();

      this.log('✅ Менеджери завантажено:', managers.length);
      return managers;

    } catch (error) {
      this.logError('Помилка отримання менеджерів:', error);
      
      // Fallback менеджери
      return this.getFallbackManagers();
    }
  }

  /**
   * Fallback менеджери на випадок недоступності API
   */
  getFallbackManagers() {
    return [
      { id: 1, name: 'Ігор Калінкін', active: true, ordersToday: 0 },
      { id: 2, name: 'Марина Коваленко', active: true, ordersToday: 0 },
      { id: 3, name: 'Олександр Петров', active: true, ordersToday: 0 }
    ];
  }

  /**
   * Тестування підключення
   */
  async testConnection() {
    const results = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    // Тест 1: Читання менеджерів
    try {
      const managers = await this.getManagers();
      results.tests.push({
        name: 'Читання менеджерів',
        success: true,
        data: { count: managers.length, active: managers.filter(m => m.active).length }
      });
    } catch (error) {
      results.tests.push({
        name: 'Читання менеджерів',
        success: false,
        error: error.message
      });
    }

    // Тест 2: Google Apps Script (якщо налаштований)
    if (this.config.scriptUrl) {
      try {
        const testData = {
          name: 'Тест підключення',
          phone: '+380000000000',
          email: 'test@example.com',
          mode: 'test'
        };

        const response = await fetch(this.config.scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'test', data: testData })
        });

        const result = await response.json();
        
        results.tests.push({
          name: 'Google Apps Script',
          success: result.success || response.ok,
          data: result
        });
      } catch (error) {
        results.tests.push({
          name: 'Google Apps Script',
          success: false,
          error: error.message
        });
      }
    } else {
      results.tests.push({
        name: 'Google Apps Script',
        success: false,
        error: 'Script URL не налаштований'
      });
    }

    // Загальний результат
    results.success = results.tests.every(test => test.success);
    results.summary = `${results.tests.filter(t => t.success).length}/${results.tests.length} тестів пройшли успішно`;

    this.log('🧪 Результати тестування:', results);
    return results;
  }

  /**
   * Отримання fallback замовлень з localStorage
   */
  getFallbackOrders() {
    try {
      const orders = JSON.parse(localStorage.getItem('comspec_fallback_orders') || '[]');
      return orders;
    } catch (error) {
      this.logError('Помилка отримання fallback замовлень:', error);
      return [];
    }
  }

  /**
   * Перевірка актуальності кешу
   */
  isCacheValid() {
    return this.cache.lastUpdate && 
           (Date.now() - this.cache.lastUpdate) < this.cache.cacheTimeout;
  }

  /**
   * Очищення кешу
   */
  clearCache() {
    this.cache = {
      managers: null,
      loadingPoints: null,
      deliveryZones: null,
      lastUpdate: null
    };
    this.log('🗑️ Кеш очищено');
  }

  /**
   * Логування для відладки
   */
  log(message, ...args) {
    if (this.config.debugMode) {
      console.log(`[GoogleSheetsService] ${message}`, ...args);
    }
  }

  /**
   * Логування помилок
   */
  logError(message, error) {
    console.error(`[GoogleSheetsService] ${message}`, error);
    
    // Відправка помилки в аналітику (якщо налаштовано)
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: `GoogleSheetsService: ${message}`,
        fatal: false
      });
    }
  }

  /**
   * Метод для ручного тестування з консолі браузера
   */
  async runManualTest() {
    console.log('🧪 Запуск ручного тестування GoogleSheetsService...');
    
    try {
      // 1. Тест конфігурації
      console.log('1️⃣ Тест конфігурації:');
      console.log('Config:', this.config);
      
      // 2. Тест читання менеджерів
      console.log('2️⃣ Тест читання менеджерів:');
      const managers = await this.getManagers();
      console.log('Managers:', managers);
      
      // 3. Тест валідації форми
      console.log('3️⃣ Тест валідації форми:');
      const testFormData = {
        name: 'Тест Тестович',
        phone: '+380671234567',
        email: 'test@example.com',
        product: 'Щебінь',
        deliveryType: 'delivery',
        address: 'Київ, вул. Хрещатик, 1',
        message: 'Тестове повідомлення'
      };
      
      this.validateFormData(testFormData, false);
      console.log('✅ Валідація пройшла успішно');
      
      // 4. Тест побудови даних замовлення
      console.log('4️⃣ Тест побудови даних:');
      const orderData = this.buildOrderData(testFormData, false, 'manual-test');
      console.log('Order data:', orderData);
      
      // 5. Тест загального підключення
      console.log('5️⃣ Тест підключення:');
      const connectionTest = await this.testConnection();
      console.log('Connection test:', connectionTest);
      
      console.log('✅ Ручне тестування завершено успішно!');
      
      return {
        success: true,
        managers: managers.length,
        connectionTest
      };
      
    } catch (error) {
      console.error('❌ Помилка ручного тестування:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Експорт singleton екземпляра
const googleSheetsService = new GoogleSheetsService();

// Додаємо до window для тестування з консолі
if (typeof window !== 'undefined') {
  window.googleSheetsService = googleSheetsService;
  window.testGoogleSheets = () => googleSheetsService.runManualTest();
}

export default googleSheetsService;