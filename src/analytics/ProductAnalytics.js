// src/analytics/ProductAnalytics.js
/**
 * 📊 COMSPEC Website Analytics - Система відстеження поведінки користувачів
 * Відстежує перегляди товарів, взаємодії, джерела трафіку та конверсії
 */

import GoogleSheetsAnalytics from './GoogleSheetsAnalytics';

// Глобальний флаг для запобігання повторній ініціалізації
let isGloballyInitialized = false;

class ProductAnalytics {
  constructor() {
    this.isInitialized = false;
    this.userId = null;
    this.sessionId = null;
    this.startTime = null;
    
    // Конфігурація з підтримкою runtime config
    this.config = {
      enabled: this.getAnalyticsEnabled(),
      debugMode: this.getDebugMode(),
      samplingRate: this.getSamplingRate(),
      retryLimit: 3,
      batchSize: 10
    };

    // Черга для відправки даних
    this.eventQueue = [];
    this.isProcessingQueue = false;

    // Кеш для локального збереження
    this.localCache = {
      views: {},
      events: [],
      lastViewTime: {},
      sessionData: {}
    };

    this.log('📊 ProductAnalytics створено');
  }

  /**
   * Ініціалізація системи аналітики
   */
  static init() {
    // Подвійний захист від повторної ініціалізації
    if (isGloballyInitialized && this.instance?.isInitialized) {
      this.instance.log('⚠️ ProductAnalytics вже глобально ініціалізовано, пропускаємо');
      return this.instance;
    }

    if (this.instance?.isInitialized) {
      this.instance.log('⚠️ ProductAnalytics вже ініціалізовано, пропускаємо');
      return this.instance;
    }

    if (!this.instance) {
      this.instance = new ProductAnalytics();
    }

    // Встановлюємо флаги ініціалізації ОДРАЗУ, щоб уникнути повторних викликів
    this.instance.isInitialized = true;
    isGloballyInitialized = true;

    try {
      // Генеруємо унікальні ідентифікатори
      this.instance.userId = this.instance.getUserId();
      this.instance.sessionId = this.instance.generateSessionId();
      this.instance.startTime = Date.now();

      // Завантажуємо існуючі дані з localStorage
      this.instance.loadLocalData();

      // Відстежуємо закриття сторінки для збереження сесії
      this.instance.setupEventListeners();

      // Розпочинаємо обробку черги подій
      this.instance.startQueueProcessor();

      // НЕ відстежуємо тут перше завантаження, це буде робити AnalyticsTracker
      
      this.instance.log('✅ ProductAnalytics ініціалізовано');

      return this.instance;
    } catch (error) {
      console.error('❌ Помилка ініціалізації ProductAnalytics:', error);
      // Якщо помилка, скидаємо всі флаги ініціалізації
      this.instance.isInitialized = false;
      isGloballyInitialized = false;
      return this.instance;
    }
  }

  /**
   * Отримання поточного екземпляра
   */
  static getInstance() {
    // Якщо інстанс існує і ініціалізований - повертаємо його
    if (this.instance && this.instance.isInitialized) {
      return this.instance;
    }
    
    // Якщо інстанс не існує - ініціалізуємо
    if (!this.instance) {
      return this.init();
    }
    
    // Якщо інстанс існує але не ініціалізований - завершуємо ініціалізацію
    if (!this.instance.isInitialized) {
      return this.init();
    }
    
    return this.instance;
  }

  /**
   * Відстеження перегляду товару
   */
  static trackProductView(productId, productData = {}) {
    const instance = this.getInstance();
    if (!instance.isEnabled()) return;

    try {
      // 🚫 Захист від React.StrictMode дублікатів
      const lastViewKey = `lastView_${productId}`;
      const lastViewTime = instance[lastViewKey] || 0;
      const now = Date.now();
      
      // Якщо минуло менше 1 секунди з останнього перегляду - пропускаємо
      if (now - lastViewTime < 1000) {
        instance.log('🚫 Пропускаємо дублікат перегляду (React.StrictMode):', productId);
        return;
      }
      
      instance[lastViewKey] = now;

      // Оновлюємо локальний кеш
      const oldCount = instance.localCache.views[productId] || 0;
      instance.localCache.views[productId] = oldCount + 1;
      instance.localCache.lastViewTime[productId] = Date.now();

      // Створюємо подію для відправки
      const event = {
        type: 'product_view',
        productId,
        timestamp: Date.now(),
        data: {
          ...productData,
          viewCount: instance.localCache.views[productId],
          timeSpent: 0 // буде оновлено при виході зі сторінки
        }
      };

      // Додаємо подію до черги
      instance.addToQueue(event);

      // Зберігаємо в localStorage
      instance.saveLocalData();

      instance.log('👁️ Відстежено перегляд товару:', productId);

    } catch (error) {
      instance.logError('Помилка відстеження перегляду товару:', error);
    }
  }

  /**
   * Відстеження подій (кліки, замовлення тощо)
   */
  static trackEvent(eventType, data = {}) {
    const instance = this.getInstance();
    if (!instance.isEnabled()) return;

    try {
      const event = {
        type: eventType,
        timestamp: Date.now(),
        data: {
          ...data,
          userId: instance.userId,
          sessionId: instance.sessionId,
          source: instance.getTrafficSource(),
          deviceType: instance.getDeviceType(),
          url: window.location.href
        }
      };

      // Додаємо подію до черги
      instance.addToQueue(event);

      // Для важливих подій відправляємо одразу
      if (['order_click', 'order_sent', 'order_form'].includes(eventType)) {
        instance.processQueue();
      }

      instance.log('📝 Відстежено подію:', eventType, data);

    } catch (error) {
      instance.logError('Помилка відстеження події:', error);
    }
  }

  /**
   * Відстеження перегляду сторінки
   */
  static trackPageView(pathname, additionalData = {}) {
    // Додаткова перевірка існування instance щоб уникнути зацикленості
    if (!this.instance || !this.instance.isInitialized) {
      // Якщо система не ініціалізована, просто логуємо і виходимо
      console.log('[ProductAnalytics] Система не ініціалізована, пропускаємо відстеження:', pathname);
      return;
    }

    const instance = this.instance;
    if (!instance.isEnabled()) return;

    try {
      // Визначаємо тип сторінки та productId
      const pageInfo = instance.parsePageInfo(pathname);

      const event = {
        type: 'page_view',
        timestamp: Date.now(),
        data: {
          pathname,
          ...pageInfo,
          ...additionalData,
          userId: instance.userId,
          sessionId: instance.sessionId,
          source: instance.getTrafficSource(),
          deviceType: instance.getDeviceType(),
          referrer: document.referrer
        }
      };

      instance.addToQueue(event);
      instance.log('📄 Відстежено перегляд сторінки:', pathname);

    } catch (error) {
      instance.logError('Помилка відстеження сторінки:', error);
    }
  }

  /**
   * Отримання популярних товарів з локального кешу
   */
  static getPopularProducts(limit = 10) {
    const instance = this.getInstance();
    
    try {
      const views = instance.localCache.views;
      
      const result = Object.entries(views)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
        .map(([productId, views]) => ({
          productId,
          views,
          lastViewed: instance.localCache.lastViewTime[productId]
        }));
        
      return result;
    } catch (error) {
      instance.logError('Помилка отримання популярних товарів:', error);
      return [];
    }
  }

  /**
   * Отримання статистики користувача
   */
  static getUserStats() {
    const instance = this.getInstance();
    
    return {
      userId: instance.userId,
      sessionId: instance.sessionId,
      sessionStartTime: instance.startTime,
      sessionDuration: Date.now() - instance.startTime,
      viewedProducts: Object.keys(instance.localCache.views).length,
      totalViews: Object.values(instance.localCache.views).reduce((sum, views) => sum + views, 0),
      eventsInQueue: instance.eventQueue.length
    };
  }

  // === ПРИВАТНІ МЕТОДИ ===

  /**
   * Перевірка чи увімкнена аналітика
   */
  isEnabled() {
    if (!this.config.enabled) return false;
    
    // Sampling rate - відстежуємо лише частину користувачів
    if (this.config.samplingRate < 100) {
      const userHash = this.getUserId().split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      if (userHash % 100 >= this.config.samplingRate) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Генерація або отримання User ID
   */
  getUserId() {
    let userId = localStorage.getItem('comspec_analytics_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('comspec_analytics_user_id', userId);
    }
    return userId;
  }

  /**
   * Генерація Session ID
   */
  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
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
   * Парсинг інформації зі сторінки
   */
  parsePageInfo(pathname) {
    // Розпізнаємо сторінки товарів: /products/category/id
    const productMatch = pathname.match(/^\/products\/([^/]+)\/([^/]+)$/);
    if (productMatch) {
      return {
        pageType: 'product',
        category: productMatch[1],
        productId: productMatch[2]
      };
    }

    // Розпізнаємо каталог товарів: /products
    if (pathname === '/products' || pathname.startsWith('/products?')) {
      return { pageType: 'catalog' };
    }

    // Інші сторінки
    const pageTypeMap = {
      '/': 'home',
      '/about': 'about',
      '/contacts': 'contacts',
      '/services': 'services'
    };

    return {
      pageType: pageTypeMap[pathname] || 'other'
    };
  }

  /**
   * Додавання події до черги
   */
  addToQueue(event) {
    this.eventQueue.push(event);
    
    // Якщо черга переповнена - видаляємо старі події
    if (this.eventQueue.length > 100) {
      this.eventQueue = this.eventQueue.slice(-50);
    }
  }

  /**
   * Запуск обробника черги
   */
  startQueueProcessor() {
    // Перевіряємо чи потрібно відключити аналітику на localhost
    if (this.getDisableLocalhostAnalytics() && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      this.log('🚫 Аналітика відключена для localhost');
      return;
    }

    // Обробляємо чергу кожні 30 секунд
    setInterval(() => {
      this.processQueue();
    }, 30000);

    // Обробляємо чергу при виході з сторінки
    window.addEventListener('beforeunload', () => {
      this.processQueue();
      this.saveLocalData();
    });
  }

  /**
   * Обробка черги подій
   */
  async processQueue() {
    if (this.isProcessingQueue || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      // Беремо події батчами
      const batch = this.eventQueue.splice(0, this.config.batchSize);
      
      // Відправляємо через GoogleSheetsAnalytics
      await GoogleSheetsAnalytics.sendEvents(batch);
      
      this.log(`📤 Відправлено ${batch.length} подій`);

    } catch (error) {
      // Повертаємо події назад у чергу при помилці
      this.eventQueue.unshift(...this.eventQueue.splice(0, this.config.batchSize));
      this.logError('Помилка обробки черги:', error);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Налаштування слухачів подій
   */
  setupEventListeners() {
    // Відстеження часу на сторінці
    let pageStartTime = Date.now();

    window.addEventListener('beforeunload', () => {
      const timeSpent = Date.now() - pageStartTime;
      
      // Зберігаємо час перебування на сторінці
      if (timeSpent > 1000) { // більше 1 секунди
        ProductAnalytics.trackEvent('page_time', {
          pathname: window.location.pathname,
          timeSpent: Math.round(timeSpent / 1000)
        });
      }
    });

    // Відстеження scroll
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
      }
    });

    window.addEventListener('beforeunload', () => {
      if (maxScroll > 25) { // скролили більше 25%
        ProductAnalytics.trackEvent('scroll_depth', {
          pathname: window.location.pathname,
          maxScrollPercent: maxScroll
        });
      }
    });
  }

  /**
   * Завантаження даних з localStorage
   */
  loadLocalData() {
    try {
      const stored = localStorage.getItem('comspec_analytics_cache');
      if (stored) {
        const data = JSON.parse(stored);
        this.localCache = { ...this.localCache, ...data };
      }
    } catch (error) {
      this.logError('Помилка завантаження локальних даних:', error);
    }
  }

  /**
   * Збереження даних в localStorage
   */
  saveLocalData() {
    try {
      // Зберігаємо лише останні 30 днів даних
      const cutoffTime = Date.now() - (30 * 24 * 60 * 60 * 1000);
      
      // Очищуємо старі дані
      Object.keys(this.localCache.lastViewTime).forEach(productId => {
        if (this.localCache.lastViewTime[productId] < cutoffTime) {
          delete this.localCache.views[productId];
          delete this.localCache.lastViewTime[productId];
        }
      });

      localStorage.setItem('comspec_analytics_cache', JSON.stringify(this.localCache));
    } catch (error) {
      this.logError('Помилка збереження локальних даних:', error);
    }
  }

  /**
   * Логування для відладки
   */
  log(message, ...args) {
    if (this.config.debugMode) {
      console.log(`[ProductAnalytics] ${message}`, ...args);
    }
  }

  /**
   * Логування помилок
   */
  logError(message, error) {
    console.error(`[ProductAnalytics] ${message}`, error);
  }

  /**
   * Очищення всіх даних аналітики
   */
  static clearAllData() {
    const instance = this.getInstance();
    
    // Очищуємо localStorage
    localStorage.removeItem('comspec_analytics_user_id');
    localStorage.removeItem('comspec_analytics_cache');
    
    // Очищуємо кеш
    instance.localCache = {
      views: {},
      events: [],
      lastViewTime: {},
      sessionData: {}
    };
    
    // Очищуємо чергу
    instance.eventQueue = [];
    
    instance.log('🧹 Всі дані аналітики очищено');
  }

  /**
   * Отримання поточного стану для відладки
   */
  static getDebugInfo() {
    const instance = this.getInstance();
    
    return {
      isInitialized: instance.isInitialized,
      isEnabled: instance.isEnabled(),
      config: instance.config,
      userId: instance.userId,
      sessionId: instance.sessionId,
      cacheSize: Object.keys(instance.localCache.views).length,
      queueSize: instance.eventQueue.length,
      localCache: instance.localCache,
      userStats: this.getUserStats()
    };
  }

  /**
   * Методи для отримання конфігурації з різних джерел
   */
  getAnalyticsEnabled() {
    // Через .env
    if (process.env.REACT_APP_ANALYTICS_ENABLED !== undefined) {
      return process.env.REACT_APP_ANALYTICS_ENABLED !== 'false';
    }

    // Через runtime config (GitHub Pages)
    if (typeof window !== 'undefined' && window.RUNTIME_CONFIG?.ANALYTICS_ENABLED !== undefined) {
      return window.RUNTIME_CONFIG.ANALYTICS_ENABLED;
    }

    // За замовчуванням увімкнено
    return true;
  }

  getDebugMode() {
    // Через .env
    if (process.env.REACT_APP_ANALYTICS_DEBUG_MODE !== undefined) {
      return process.env.REACT_APP_ANALYTICS_DEBUG_MODE === 'true';
    }

    // Через runtime config
    if (typeof window !== 'undefined' && window.RUNTIME_CONFIG?.ANALYTICS_DEBUG_MODE !== undefined) {
      return window.RUNTIME_CONFIG.ANALYTICS_DEBUG_MODE;
    }

    // На localhost завжди увімкнуто для відладки
    if (typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return true;
    }

    return false;
  }

  getSamplingRate() {
    // Через .env
    if (process.env.REACT_APP_ANALYTICS_SAMPLING_RATE) {
      return parseInt(process.env.REACT_APP_ANALYTICS_SAMPLING_RATE) || 100;
    }

    // Через runtime config
    if (typeof window !== 'undefined' && window.RUNTIME_CONFIG?.ANALYTICS_SAMPLING_RATE !== undefined) {
      return window.RUNTIME_CONFIG.ANALYTICS_SAMPLING_RATE;
    }

    return 100;
  }

  getDisableLocalhostAnalytics() {
    // Через .env
    if (process.env.REACT_APP_DISABLE_ANALYTICS_LOCALHOST !== undefined) {
      return process.env.REACT_APP_DISABLE_ANALYTICS_LOCALHOST === 'true';
    }

    // Через runtime config
    if (typeof window !== 'undefined' && window.RUNTIME_CONFIG?.DISABLE_ANALYTICS_LOCALHOST !== undefined) {
      return window.RUNTIME_CONFIG.DISABLE_ANALYTICS_LOCALHOST;
    }

    return false;
  }
}

// Експорт статичного класу
export default ProductAnalytics;

// Глобальний доступ для відладки
if (typeof window !== 'undefined') {
  window.ProductAnalytics = ProductAnalytics;
  window.analyticsDebug = () => console.log(ProductAnalytics.getDebugInfo());
  
  // 🧪 Функції для тестування PopularProducts
  window.testPopularProducts = {
    // Очистити всі дані
    clearAll: () => {
      ProductAnalytics.clearAllData();
      console.log('✅ Всі дані аналітики очищено');
      window.location.reload();
    },
    
    // Показати тільки рекомендовані (0 переглядів)
    showOnlyRecommended: () => {
      localStorage.removeItem('productAnalytics');
      localStorage.removeItem('userStats');
      console.log('✅ Дані очищено - перезавантажте сторінку, щоб побачити тільки рекомендовані товари');
    },
    
    // Додати 1 перегляд товару
    addOneView: (productId = 'sand-river') => {
      ProductAnalytics.trackProductView(productId);
      console.log(`✅ Додано 1 перегляд для ${productId}`);
      setTimeout(() => window.location.reload(), 500);
    },
    
    // Додати 2 перегляди різних товарів
    addTwoViews: () => {
      ProductAnalytics.trackProductView('sand-river');
      setTimeout(() => ProductAnalytics.trackProductView('gravel-5-20'), 100);
      console.log('✅ Додано перегляди для sand-river та gravel-5-20');
      setTimeout(() => window.location.reload(), 1000);
    },
    
    // Показати поточний стан
    showState: () => {
      const popular = ProductAnalytics.getPopularProducts(10);
      console.log('📊 Поточні популярні товари:', popular);
      console.log('📊 Debug info:', ProductAnalytics.getDebugInfo());
    }
  };
  
  console.log('🧪 Debug команди доступні: window.testPopularProducts');
}