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
      retryDelay: 1000,
      batchSize: 10,           // Максимум подій в одному batch
      batchTimeout: 5000,      // Час очікування для збирання batch (5 сек)
      maxQueueSize: 100        // Максимум подій в черзі
    };

    // Назви аркушів в таблиці аналітики
    this.sheets = {
      PAGE_VIEWS: 'PageViews',
      PAGE_VIEWS_DETAILED: 'PageViewsDetailed',
      PRODUCT_EVENTS: 'ProductEvents', 
      USER_SESSIONS: 'UserSessions',
      DAILY_SUMMARY: 'DailySummary',
      POPULAR_PRODUCTS: 'PopularProducts',
      TRAFFIC_SOURCES: 'TrafficSources',
      SETTINGS: 'Settings'
    };

    // Кеш для failed requests
    this.failedRequests = this.loadFailedRequests();

    // Черга для batch відправки
    this.eventQueue = [];
    this.batchTimeout = null;
    this.isProcessingBatch = false;

    this.log('GoogleSheetsAnalytics ініціалізовано з batch підтримкою');
  }

  /**
   * 📦 Додавання події до batch черги (НОВИЙ МЕТОД)
   */
  static addEventToBatch(event) {
    const instance = this.getInstance();
    if (!instance.config.enabled) {
      return { success: true, message: 'Analytics disabled' };
    }

    // Перевіряємо ліміт черги
    if (instance.eventQueue.length >= instance.config.maxQueueSize) {
      instance.log('⚠️ Черга переповнена, форсуємо відправку');
      instance.processBatch();
    }

    // Додаємо подію до черги
    instance.eventQueue.push({
      ...event,
      queuedAt: Date.now()
    });

    instance.log(`📥 Додано подію до черги (${instance.eventQueue.length}/${instance.config.maxQueueSize})`);

    // Запускаємо або перезапускаємо таймер
    instance.scheduleBatchProcessing();

    // Якщо черга досягла batchSize - відправляємо негайно
    if (instance.eventQueue.length >= instance.config.batchSize) {
      instance.log('📦 Batch заповнено, відправляємо негайно');
      instance.processBatch();
    }

    return { success: true, queued: true, queueSize: instance.eventQueue.length };
  }

  /**
   * ⏰ Планування batch обробки
   */
  scheduleBatchProcessing() {
    // Скасовуємо попередній таймер
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    // Встановлюємо новий таймер
    this.batchTimeout = setTimeout(() => {
      this.log('⏰ Batch timeout досягнуто, обробляємо чергу');
      this.processBatch();
    }, this.config.batchTimeout);
  }

  /**
   * 🔄 Обробка batch черги
   */
  async processBatch() {
    if (this.isProcessingBatch) {
      this.log('⏳ Batch вже обробляється, пропускаємо');
      return;
    }

    if (this.eventQueue.length === 0) {
      this.log('📭 Черга порожня, нічого обробляти');
      return;
    }

    this.isProcessingBatch = true;
    
    // Скасовуємо таймер
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    try {
      const eventsToProcess = this.eventQueue.splice(0, this.config.batchSize);
      this.log(`🔄 Обробляємо batch з ${eventsToProcess.length} подій`);

      // Групуємо події по аркушах
      const sheetGroups = {};
      
      eventsToProcess.forEach(event => {
        const sheetName = event.sheet || 'ProductEvents'; // Default sheet
        if (!sheetGroups[sheetName]) {
          sheetGroups[sheetName] = [];
        }
        sheetGroups[sheetName].push(...event.data);
      });

      // Відправляємо в кожен аркуш окремо
      const results = [];
      for (const [sheetName, data] of Object.entries(sheetGroups)) {
        this.log(`📊 Відправляємо до ${sheetName}: ${data.length} записів`);
        const result = await this.sendToSheetWithRetry(sheetName, data);
        results.push(result);
      }
      
      this.log(`✅ Batch успішно оброблено: ${eventsToProcess.length} подій`);
      return { success: true, results };

    } catch (error) {
      this.logError('❌ Помилка обробки batch:', error);
      throw error;
    } finally {
      this.isProcessingBatch = false;

      // Якщо в черзі залишились події, плануємо наступну обробку
      if (this.eventQueue.length > 0) {
        this.log(`📋 В черзі залишилось ${this.eventQueue.length} подій, плануємо наступну обробку`);
        this.scheduleBatchProcessing();
      }
    }
  }

  /**
   * 💥 Форсована відправка всіх подій у черзі
   */
  static async flushBatch() {
    const instance = this.getInstance();
    
    if (instance.eventQueue.length === 0) {
      instance.log('📭 Немає подій для форсованої відправки');
      return { success: true, processed: 0 };
    }

    instance.log(`💥 Форсована відправка ${instance.eventQueue.length} подій`);
    
    try {
      // eslint-disable-next-line no-unused-vars
      const result = await instance.processBatch();
      
      // Продовжуємо поки черга не стане порожньою
      while (instance.eventQueue.length > 0 && !instance.isProcessingBatch) {
        await instance.processBatch();
      }
      
      return { success: true, processed: true };
      
    } catch (error) {
      instance.logError('❌ Помилка форсованої відправки:', error);
      throw error;
    }
  }

  /**
   * Відправка масиву подій в Google Sheets (ОНОВЛЕНИЙ)
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
        const pageViewResult = await instance.sendToSheetWithRetry(
          instance.sheets.PAGE_VIEWS, 
          instance.formatPageViews(pageViews)
        );
        results.push(pageViewResult);
      }

      // Відправляємо product events  
      if (productEvents.length > 0) {
        const eventsResult = await instance.sendToSheetWithRetry(
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
   * 🔄 Відправка до аркуша з retry логікою (НОВИЙ МЕТОД)
   */
  async sendToSheetWithRetry(sheetName, data, retryCount = 0) {
    try {
      const result = await this.sendToSheet(sheetName, data);
      this.log(`✅ Успішна відправка до ${sheetName} (спроба ${retryCount + 1})`);
      return result;
      
    } catch (error) {
      this.logError(`❌ Помилка відправки до ${sheetName} (спроба ${retryCount + 1}):`, error);
      
      if (retryCount < this.config.retryLimit) {
        const delay = this.config.retryDelay * Math.pow(2, retryCount); // Exponential backoff
        this.log(`⏳ Повторна спроба через ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.sendToSheetWithRetry(sheetName, data, retryCount + 1);
      } else {
        this.logError(`❌ Досягнуто ліміт retry спроб (${this.config.retryLimit}) для ${sheetName}`);
        throw error;
      }
    }
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
        mode: 'cors',  // Явно вказуємо CORS режим
        redirect: 'follow'  // ✅ ДОДАНО: автоматично слідувати за redirects
      });

      console.log('📡 Response status:', response.status, response.statusText);
      console.log('🔗 Final URL after redirects:', response.url);
      
      // ✅ ПОКРАЩЕНО: 302 redirects тепер не є помилкою
      if (!response.ok && response.status !== 302) {
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
      console.log(`❌ Fetch помилка для ${sheetName}:`, error.message);
      
      // Якщо CORS помилка - спробуємо JSONP fallback
      if (error.message.includes('CORS') || 
          error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError') ||
          error.name === 'TypeError') {
        console.log('🔄 Виявлено CORS/Network помилку, спробуємо JSONP fallback...');
        try {
          const jsonpResult = await this.sendToSheetViaJSONP(sheetName, data);
          console.log('✅ JSONP fallback спрацював:', jsonpResult);
          return jsonpResult;
        } catch (jsonpError) {
          console.error('❌ JSONP fallback також не спрацював:', jsonpError);
          this.logError('JSONP fallback помилка:', jsonpError);
        }
      }
      
      this.logError(`❌ Помилка відправки до ${sheetName}:`, error);
      
      // Зберігаємо невдалий запит
      this.saveFailedRequest(sheetName, data);
      
      throw error;
    }
  }

  /**
   * JSONP fallback для обходу CORS з підтримкою redirects
   */
  async sendToSheetViaJSONP(sheetName, data) {
    console.log(`🔄 JSONP fallback для ${sheetName} з ${data.length} записами`);
    console.log('ℹ️ JSONP автоматично підтримує redirects через браузер');
    
    return new Promise((resolve, reject) => {
      const callbackName = 'jsonp_callback_' + Math.random().toString(36).substr(2, 9);
      console.log('📞 Створено callback:', callbackName);
      
      // Створюємо глобальний callback
      window[callbackName] = function(response) {
        console.log('📊 JSONP Response отримано:', response);
        
        // Очищуємо ресурси
        delete window[callbackName];
        if (script && script.parentNode) {
          document.head.removeChild(script);
        }
        
        if (response && response.success) {
          console.log('✅ JSONP успішно:', response);
          resolve(response);
        } else {
          console.error('❌ JSONP помилка в response:', response);
          reject(new Error(response?.error || 'JSONP request failed'));
        }
      };

      // Створюємо script tag для JSONP
      const script = document.createElement('script');
      
      script.onerror = (event) => {
        console.error('❌ JSONP script loading error:', event);
        delete window[callbackName];
        if (script.parentNode) {
          document.head.removeChild(script);
        }
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
      console.log('🔗 JSONP URL створено:', script.src);
      console.log('📏 URL довжина:', script.src.length);
      
      document.head.appendChild(script);
      console.log('📜 Script додано до DOM');
      
      // Timeout після 10 секунд
      setTimeout(() => {
        if (window[callbackName]) {
          console.warn('⏰ JSONP timeout після 10 секунд');
          delete window[callbackName];
          if (script.parentNode) {
            document.head.removeChild(script);
          }
          reject(new Error('JSONP request timeout (10s)'));
        }
      }, 10000);
    });
  }

  /**
   * Форматування page views для Google Sheets
   */
  formatPageViews(events) {
    return events.map(event => {
      // ✅ ВИПРАВЛЕННЯ: Перевіряємо валідність timestamp
      const timestamp = event.timestamp || Date.now();
      const validTimestamp = (typeof timestamp === 'number' && timestamp > 0) ? timestamp : Date.now();
      
      return {
        timestamp: validTimestamp,
        date: new Date(validTimestamp).toISOString().split('T')[0],
        page_url: event.data.pathname,
        product_id: event.data.productId || '',
        user_id: event.data.userId,
        source: event.data.source,
        device_type: event.data.deviceType
      };
    });
  }

  /**
   * Форматування product events для Google Sheets
   */
  formatProductEvents(events) {
    return events.map(event => {
      // ✅ ВИПРАВЛЕННЯ: Перевіряємо валідність timestamp
      const timestamp = event.timestamp || Date.now();
      const validTimestamp = (typeof timestamp === 'number' && timestamp > 0) ? timestamp : Date.now();
      
      return {
        timestamp: validTimestamp,
        date: new Date(validTimestamp).toISOString().split('T')[0],
        event_type: event.type,
        product_id: event.productId || event.data?.productId || '',
        user_id: event.data?.userId || '',
        source: event.data?.source || '',
        extra_data: JSON.stringify(event.data || {})
      };
    });
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
      console.log('🧪 Тестування підключення до Google Sheets...');
      console.log('🔗 URL:', instance.config.scriptUrl);
      
      const testData = [{
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0],
        event_type: 'connection_test',
        product_id: 'test',
        user_id: 'test_user',
        source: 'test',
        extra_data: JSON.stringify({ test: true })
      }];

      // Використовуємо sendToSheet з новою підтримкою redirects
      // Це автоматично оброблює 302 redirects та використає JSONP fallback при потребі
      const result = await instance.sendToSheet(instance.sheets.PRODUCT_EVENTS, testData);
      
      console.log('✅ Результат тестування з redirect підтримкою:', result);
      console.log('🔗 Redirect handling працює!');

      return {
        success: result.success || true,
        data: result,
        version: result.version, // Показуємо версію скрипта
        message: result.version === 'v3.2' ? 
          '✅ Підключення до v3.2 успішне з redirect підтримкою!' : 
          'Підключення успішне, але версія не підтверджена'
      };

    } catch (error) {
      console.error('❌ Помилка тестування підключення:', error);
      instance.logError('Помилка тестування підключення:', error);
      
      return {
        success: false,
        error: error.message,
        message: `Підключення не вдалося: ${error.message}`
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

    // ✅ ДОДАНО: Через GitHub Pages config
    if (typeof window !== 'undefined' && window.COMSPEC_UNIVERSAL?.config?.ANALYTICS?.SCRIPT_URL) {
      url = window.COMSPEC_UNIVERSAL.config.ANALYTICS.SCRIPT_URL;
      console.log('🔧 Analytics URL з COMSPEC_UNIVERSAL:', url);
      return url;
    }

    // Через environment.js систему
    try {
      const { getConfig } = require('../config/environment.js');
      const config = getConfig();
      if (config.ANALYTICS_SCRIPT_URL) {
        url = config.ANALYTICS_SCRIPT_URL;
        console.log('🔧 Analytics URL з environment.js config:', url);
        return url;
      }
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

  /**
   * 📊 Статичний метод для надсилання даних до конкретного аркуша
   * (Потрібен для PopularProducts синхронізації)
   */
  static async sendToSheet(sheetName, data) {
    const instance = this.getInstance();
    return await instance.sendToSheet(sheetName, data);
  }
}

// Експорт класу
export default GoogleSheetsAnalytics;

// Глобальний доступ для відладки
if (typeof window !== 'undefined') {
  window.GoogleSheetsAnalytics = GoogleSheetsAnalytics;
  
  window.analyticsTest = () => {
    console.log('🧪 Запускаємо тест підключення до Google Sheets...');
    return GoogleSheetsAnalytics.testConnection();
  };
  
  window.analyticsRetry = () => {
    console.log('🔄 Повторюємо невдалі запити...');
    return GoogleSheetsAnalytics.retryFailedRequests();
  };
  
  window.analyticsStats = () => {
    console.log('📊 Статистика невдалих запитів:');
    const stats = GoogleSheetsAnalytics.getFailedRequestsStats();
    console.table(stats);
    return stats;
  };
  
  window.analyticsClear = () => {
    console.log('🧹 Очищуємо невдалі запити...');
    GoogleSheetsAnalytics.clearFailedRequests();
  };
  
  window.analyticsConfig = () => {
    const instance = GoogleSheetsAnalytics.getInstance();
    console.log('⚙️ Конфігурація аналітики:');
    console.table(instance.config);
    
    // Детальна діагностика джерел URL
    console.log('🔍 ДІАГНОСТИКА ДЖЕРЕЛ URL:');
    console.log('1. process.env.REACT_APP_ANALYTICS_SCRIPT_URL:', process.env.REACT_APP_ANALYTICS_SCRIPT_URL || 'undefined');
    console.log('2. RUNTIME_CONFIG:', window.RUNTIME_CONFIG?.ANALYTICS_SCRIPT_URL || 'undefined');
    console.log('3. COMSPEC_UNIVERSAL:', window.COMSPEC_UNIVERSAL?.config?.ANALYTICS?.SCRIPT_URL || 'undefined');
    
    try {
      const { getConfig } = require('../config/environment.js');
      const envConfig = getConfig();
      console.log('4. environment.js:', envConfig.ANALYTICS_SCRIPT_URL || 'undefined');
    } catch (e) {
      console.log('4. environment.js: не доступний');
    }
    
    console.log('5. Поточний URL що використовується:', instance.config.scriptUrl);
    
    return instance.config;
  };

  // === НОВІ BATCH ФУНКЦІЇ ===
  
  window.analyticsBatch = () => {
    const instance = GoogleSheetsAnalytics.getInstance();
    console.log('📦 Інформація про batch чергу:');
    const info = {
      queueSize: instance.eventQueue.length,
      maxQueueSize: instance.config.maxQueueSize,
      batchSize: instance.config.batchSize,
      batchTimeout: instance.config.batchTimeout,
      isProcessing: instance.isProcessingBatch,
      hasTimeout: !!instance.batchTimeout
    };
    console.table(info);
    return info;
  };
  
  window.analyticsFlush = () => {
    console.log('💥 Форсована відправка всіх подій у черзі...');
    return GoogleSheetsAnalytics.flushBatch();
  };
  
  window.analyticsAddTest = (count = 1) => {
    console.log(`🧪 Додаємо ${count} тестових подій до batch черги...`);
    
    for (let i = 0; i < count; i++) {
      const testEvent = {
        type: 'product_view',
        productId: `test-product-${Date.now()}-${i}`,
        timestamp: Date.now(),
        data: {
          userId: 'test-user',
          source: 'debug-console',
          extra: { test: true, batch: true, index: i }
        }
      };
      
      GoogleSheetsAnalytics.addEventToBatch(testEvent);
    }
    
    return window.analyticsBatch();
  };
  
  window.analyticsHelp = () => {
    console.log(`
🔧 ДОСТУПНІ КОМАНДИ АНАЛІТИКИ:

📊 Основні:
analyticsTest()         - Тест підключення до Google Sheets
analyticsConfig()       - Показати конфігурацію  
analyticsStats()        - Статистика невдалих запитів
analyticsRetry()        - Повторити невдалі запити
analyticsClear()        - Очистити невдалі запити

📦 Batch система:
analyticsBatch()        - Інформація про чергу
analyticsFlush()        - Форсована відправка черги
analyticsAddTest(N)     - Додати N тестових подій
analyticsHelp()         - Ця довідка

🎯 Приклади використання:
analyticsAddTest(5)     - Додати 5 тестових подій
analyticsFlush()        - Відправити всі події негайно
analyticsBatch()        - Перевірити стан черги
    `);
  };
}