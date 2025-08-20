// src/analytics/GoogleSheetsAnalytics.js
/**
 * 📊 Google Sheets Analytics Integration
 * Інтеграція з Google Sheets для збереження аналітичних даних
 * Використовує окрему таблицю "COMSPEC - Website Analytics"
 */

class GoogleSheetsAnalytics {
  constructor() {
    // Конфігурація з підтримкою існуючої системи environment.js
    this.config = {
      scriptUrl: this.getAnalyticsScriptUrl(),
      enabled: this.getAnalyticsEnabled(),
      debugMode: this.getDebugMode(),
      retryLimit: 3,
      retryDelay: 1000
    };

    // Назви аркушів в таблиці аналітики
    this.sheets = {
      PAGE_VIEWS: 'PageViews',
      PRODUCT_EVENTS: 'ProductEvents', 
      DAILY_SUMMARY: 'DailySummary',
      POPULAR_PRODUCTS: 'PopularProducts',
      TRAFFIC_SOURCES: 'TrafficSources',
      SETTINGS: 'Settings'
    };

    // Кеш для failed requests
    this.failedRequests = this.loadFailedRequests();

    this.log('GoogleSheetsAnalytics ініціалізовано');
  }

  /**
   * Відправка масиву подій в Google Sheets
   */
  static async sendEvents(events) {
    const instance = this.getInstance();
    if (!instance.config.enabled || events.length === 0) {
      return { success: true, message: 'Analytics disabled or no events' };
    }

    try {
      instance.log(`📤 Відправка ${events.length} подій...`);

      // Групуємо події по типах для різних аркушів
      const pageViews = events.filter(e => e.type === 'page_view');
      const productEvents = events.filter(e => e.type !== 'page_view');

      const results = [];

      // Відправляємо page views
      if (pageViews.length > 0) {
        const pageViewResult = await instance.sendToSheet(
          instance.sheets.PAGE_VIEWS, 
          instance.formatPageViews(pageViews)
        );
        results.push(pageViewResult);
      }

      // Відправляємо product events  
      if (productEvents.length > 0) {
        const eventsResult = await instance.sendToSheet(
          instance.sheets.PRODUCT_EVENTS,
          instance.formatProductEvents(productEvents)
        );
        results.push(eventsResult);
      }

      // Повертаємо узагальнений результат
      const allSuccessful = results.every(r => r.success);
      
      if (allSuccessful) {
        instance.log('✅ Всі події успішно відправлено');
        return { success: true, results };
      } else {
        throw new Error('Деякі події не вдалося відправити');
      }

    } catch (error) {
      instance.logError('Помилка відправки подій:', error);
      
      // Зберігаємо невдалі запити для повторної спроби
      instance.saveFailedEvents(events);
      
      throw error;
    }
  }

  /**
   * Відстеження перегляду сторінки
   */
  static async trackPageView(pathname, productId = null, additionalData = {}) {
    const instance = this.getInstance();
    
    const pageViewData = {
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      page_url: pathname,
      product_id: productId,
      user_id: instance.generateUserId(),
      source: instance.getTrafficSource(),
      device_type: instance.getDeviceType(),
      ...additionalData
    };

    return await instance.sendToSheet(instance.sheets.PAGE_VIEWS, [pageViewData]);
  }

  /**
   * Відстеження події з товаром
   */
  static async trackProductEvent(eventType, productId, extraData = {}) {
    const instance = this.getInstance();
    
    const eventData = {
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      event_type: eventType,
      product_id: productId,
      user_id: instance.generateUserId(),
      source: instance.getTrafficSource(),
      extra_data: JSON.stringify(extraData)
    };

    return await instance.sendToSheet(instance.sheets.PRODUCT_EVENTS, [eventData]);
  }

  /**
   * Повторна відправка невдалих запитів
   */
  static async retryFailedRequests() {
    const instance = this.getInstance();
    const failed = instance.failedRequests;
    
    if (failed.length === 0) {
      instance.log('💾 Немає невдалих запитів для повторної відправки');
      return { success: true, processed: 0 };
    }

    instance.log(`🔄 Повторна відправка ${failed.length} невдалих запитів...`);
    
    const newFailed = [];
    let processed = 0;

    for (const request of failed) {
      if (request.retryCount >= instance.config.retryLimit) {
        instance.log(`❌ Запит перевищив ліміт спроб, пропускаємо:`, request);
        continue;
      }

      try {
        await instance.sendToSheet(request.sheet, request.data);
        processed++;
        instance.log(`✅ Успішно відправлено невдалий запит до ${request.sheet}`);
      } catch (error) {
        request.retryCount = (request.retryCount || 0) + 1;
        newFailed.push(request);
        instance.logError(`❌ Повторна спроба не вдалася для ${request.sheet}:`, error);
      }
    }

    // Оновлюємо список невдалих запитів
    instance.failedRequests = newFailed;
    instance.saveFailedRequests();

    return { 
      success: true, 
      processed, 
      remaining: newFailed.length,
      message: `Оброблено ${processed} запитів, залишилось ${newFailed.length}`
    };
  }

  // === ПРИВАТНІ МЕТОДИ ===

  /**
   * Отримання singleton екземпляра
   */
  static getInstance() {
    if (!this.instance) {
      this.instance = new GoogleSheetsAnalytics();
    }
    return this.instance;
  }

  /**
   * Відправка даних до конкретного аркуша
   */
  async sendToSheet(sheetName, data) {
    if (!this.config.scriptUrl) {
      console.error('❌ Analytics Script URL не налаштований');
      console.log('🔧 Поточна конфігурація:', this.config);
      throw new Error('Analytics Script URL не налаштований');
    }

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Дані для відправки порожні або некоректні');
    }

    try {
      const payload = {
        action: 'analytics',
        sheet: sheetName,
        data: data
      };

      console.log(`📡 Відправка до ${sheetName}:`, data.length, 'записів');
      console.log('🔗 URL:', this.config.scriptUrl);
      console.log('📦 Payload:', payload);

      const response = await fetch(this.config.scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        mode: 'cors'  // Явно вказуємо CORS режим
      });

      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const responseText = await response.text();
        console.error('❌ HTTP Error Response:', responseText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📊 Response data:', result);

      if (!result.success) {
        console.error('❌ Google Apps Script Error:', result.error);
        throw new Error(result.error || 'Невідома помилка Google Apps Script');
      }

      console.log(`✅ Успішно відправлено до ${sheetName}:`, result);
      return result;

    } catch (error) {
      // Якщо CORS помилка - спробуємо JSONP fallback
      if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        console.log('🔄 CORS помилка, спробуємо JSONP fallback...');
        try {
          return await this.sendToSheetViaJSONP(sheetName, data);
        } catch (jsonpError) {
          console.error('❌ JSONP fallback також не спрацював:', jsonpError);
        }
      }
      
      this.logError(`❌ Помилка відправки до ${sheetName}:`, error);
      
      // Зберігаємо невдалий запит
      this.saveFailedRequest(sheetName, data);
      
      throw error;
    }
  }

  /**
   * JSONP fallback для обходу CORS
   */
  async sendToSheetViaJSONP(sheetName, data) {
    return new Promise((resolve, reject) => {
      const callbackName = 'jsonp_callback_' + Math.random().toString(36).substr(2, 9);
      
      // Створюємо глобальний callback
      window[callbackName] = function(response) {
        console.log('📊 JSONP Response:', response);
        delete window[callbackName];
        document.head.removeChild(script);
        
        if (response && response.success) {
          resolve(response);
        } else {
          reject(new Error(response?.error || 'JSONP request failed'));
        }
      };

      // Створюємо script tag для JSONP
      const script = document.createElement('script');
      script.onerror = () => {
        delete window[callbackName];
        document.head.removeChild(script);
        reject(new Error('JSONP script loading failed'));
      };
      
      // Параметри для GET запиту
      const params = new URLSearchParams({
        action: 'analytics',
        sheet: sheetName,
        data: JSON.stringify(data),
        callback: callbackName
      });
      
      script.src = `${this.config.scriptUrl}?${params.toString()}`;
      console.log('🔗 JSONP URL:', script.src);
      
      document.head.appendChild(script);
      
      // Timeout після 10 секунд
      setTimeout(() => {
        if (window[callbackName]) {
          delete window[callbackName];
          document.head.removeChild(script);
          reject(new Error('JSONP request timeout'));
        }
      }, 10000);
    });
  }

  /**
   * Форматування page views для Google Sheets
   */
  formatPageViews(events) {
    return events.map(event => ({
      timestamp: event.timestamp,
      date: new Date(event.timestamp).toISOString().split('T')[0],
      page_url: event.data.pathname,
      product_id: event.data.productId || '',
      user_id: event.data.userId,
      source: event.data.source,
      device_type: event.data.deviceType
    }));
  }

  /**
   * Форматування product events для Google Sheets
   */
  formatProductEvents(events) {
    return events.map(event => ({
      timestamp: event.timestamp,
      date: new Date(event.timestamp).toISOString().split('T')[0],
      event_type: event.type,
      product_id: event.productId || event.data?.productId || '',
      user_id: event.data?.userId || '',
      source: event.data?.source || '',
      extra_data: JSON.stringify(event.data || {})
    }));
  }

  /**
   * Генерація User ID (використовуємо той самий метод що й ProductAnalytics)
   */
  generateUserId() {
    let userId = localStorage.getItem('comspec_analytics_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('comspec_analytics_user_id', userId);
    }
    return userId;
  }

  /**
   * Визначення джерела трафіку
   */
  getTrafficSource() {
    const referrer = document.referrer;
    const utm_source = new URLSearchParams(window.location.search).get('utm_source');
    
    if (utm_source) return `utm_${utm_source}`;
    if (!referrer) return 'direct';
    if (referrer.includes('google.com')) return 'google';
    if (referrer.includes('facebook.com')) return 'facebook';
    if (referrer.includes('instagram.com')) return 'instagram';
    if (referrer.includes('t.me')) return 'telegram';
    if (referrer.includes(window.location.hostname)) return 'internal';
    
    return 'referral';
  }

  /**
   * Визначення типу пристрою
   */
  getDeviceType() {
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Збереження невдалого запиту
   */
  saveFailedRequest(sheetName, data) {
    const failedRequest = {
      timestamp: Date.now(),
      sheet: sheetName,
      data: data,
      retryCount: 0
    };

    this.failedRequests.push(failedRequest);
    
    // Обмежуємо кількість збережених невдалих запитів
    if (this.failedRequests.length > 100) {
      this.failedRequests = this.failedRequests.slice(-50);
    }

    this.saveFailedRequests();
  }

  /**
   * Збереження невдалих подій
   */
  saveFailedEvents(events) {
    events.forEach(event => {
      // Визначаємо до якого аркуша належить подія
      const sheetName = event.type === 'page_view' ? 
        this.sheets.PAGE_VIEWS : 
        this.sheets.PRODUCT_EVENTS;
      
      this.saveFailedRequest(sheetName, [event]);
    });
  }

  /**
   * Завантаження невдалих запитів з localStorage
   */
  loadFailedRequests() {
    try {
      const stored = localStorage.getItem('comspec_analytics_failed_requests');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      this.logError('Помилка завантаження невдалих запитів:', error);
      return [];
    }
  }

  /**
   * Збереження невдалих запитів в localStorage
   */
  saveFailedRequests() {
    try {
      localStorage.setItem('comspec_analytics_failed_requests', JSON.stringify(this.failedRequests));
    } catch (error) {
      this.logError('Помилка збереження невдалих запитів:', error);
    }
  }

  /**
   * Очищення невдалих запитів
   */
  static clearFailedRequests() {
    const instance = this.getInstance();
    instance.failedRequests = [];
    localStorage.removeItem('comspec_analytics_failed_requests');
    instance.log('🧹 Невдалі запити очищено');
  }

  /**
   * Тестування підключення до Google Sheets
   */
  static async testConnection() {
    const instance = this.getInstance();
    
    if (!instance.config.scriptUrl) {
      return { 
        success: false, 
        error: 'Analytics Script URL не налаштований' 
      };
    }

    try {
      const testData = [{
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0],
        event_type: 'connection_test',
        product_id: 'test',
        user_id: 'test_user',
        source: 'test',
        extra_data: JSON.stringify({ test: true })
      }];

      const response = await fetch(instance.config.scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test',
          sheet: instance.sheets.PRODUCT_EVENTS,
          data: testData
        })
      });

      const result = await response.json();

      return {
        success: result.success || response.ok,
        status: response.status,
        data: result,
        message: result.success ? 'Підключення успішне' : (result.error || 'Помилка підключення')
      };

    } catch (error) {
      instance.logError('Помилка тестування підключення:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Отримання статистики невдалих запитів
   */
  static getFailedRequestsStats() {
    const instance = this.getInstance();
    
    const stats = {
      total: instance.failedRequests.length,
      bySheet: {},
      oldestRequest: null,
      newestRequest: null
    };

    instance.failedRequests.forEach(request => {
      const sheetName = request.sheet;
      stats.bySheet[sheetName] = (stats.bySheet[sheetName] || 0) + 1;
      
      if (!stats.oldestRequest || request.timestamp < stats.oldestRequest.timestamp) {
        stats.oldestRequest = request;
      }
      
      if (!stats.newestRequest || request.timestamp > stats.newestRequest.timestamp) {
        stats.newestRequest = request;
      }
    });

    return stats;
  }

  /**
   * Логування для відладки
   */
  log(message, ...args) {
    if (this.config.debugMode) {
      console.log(`[GoogleSheetsAnalytics] ${message}`, ...args);
    }
  }

  /**
   * Логування помилок
   */
  logError(message, error) {
    console.error(`[GoogleSheetsAnalytics] ${message}`, error);
  }

  /**
   * Інтеграція з існуючою системою environment.js
   */
  getAnalyticsScriptUrl() {
    let url = null;
    
    // Спробуємо через .env змінні
    if (process.env.REACT_APP_ANALYTICS_SCRIPT_URL) {
      url = process.env.REACT_APP_ANALYTICS_SCRIPT_URL;
      console.log('🔧 Analytics URL з .env:', url);
      return url;
    }

    // Через runtime конфігурацію (GitHub Pages)
    if (typeof window !== 'undefined' && window.RUNTIME_CONFIG?.ANALYTICS_SCRIPT_URL) {
      url = window.RUNTIME_CONFIG.ANALYTICS_SCRIPT_URL;
      console.log('🔧 Analytics URL з RUNTIME_CONFIG:', url);
      return url;
    }

    // Через environment.js систему
    try {
      const config = require('../config/environment.js').default;
      url = config.ANALYTICS_SCRIPT_URL;
      console.log('🔧 Analytics URL з environment.js:', url);
      return url;
    } catch (error) {
      console.log('⚠️ Не вдалося завантажити з environment.js:', error.message);
    }

    console.error('❌ Analytics Script URL не знайдено в жодному джерелі конфігурації');
    return null;
  }

  getAnalyticsEnabled() {
    // Через .env
    if (process.env.REACT_APP_ANALYTICS_ENABLED !== undefined) {
      return process.env.REACT_APP_ANALYTICS_ENABLED !== 'false';
    }

    // Через runtime
    if (typeof window !== 'undefined' && window.RUNTIME_CONFIG?.ANALYTICS_ENABLED !== undefined) {
      return window.RUNTIME_CONFIG.ANALYTICS_ENABLED;
    }

    // За замовчуванням увімкнено
    return true;
  }

  getDebugMode() {
    // Через .env
    if (process.env.REACT_APP_DEBUG_MODE !== undefined) {
      return process.env.REACT_APP_DEBUG_MODE === 'true';
    }

    // Через runtime
    if (typeof window !== 'undefined' && window.RUNTIME_CONFIG?.DEBUG_MODE !== undefined) {
      return window.RUNTIME_CONFIG.DEBUG_MODE;
    }

    // На localhost завжди увімкнуто для відладки
    if (typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return true;
    }

    // Через environment.js
    try {
      const config = require('../config/environment.js').default;
      return config.DEBUG_MODE || false;
    } catch (error) {
      return false;
    }
  }
}

// Експорт класу
export default GoogleSheetsAnalytics;

// Глобальний доступ для відладки
if (typeof window !== 'undefined') {
  window.GoogleSheetsAnalytics = GoogleSheetsAnalytics;
  window.analyticsTest = () => GoogleSheetsAnalytics.testConnection();
  window.analyticsRetry = () => GoogleSheetsAnalytics.retryFailedRequests();
  window.analyticsStats = () => GoogleSheetsAnalytics.getFailedRequestsStats();
}