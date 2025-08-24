// src/analytics/SessionAnalytics.js
/**
 * 📊 Session Analytics - Система аналітики користувацьких сесій
 * 
 * Збирає та відправляє дані про:
 * - Тривалість сесій
 * - Час проведений на кожній сторінці  
 * - Активність користувача
 * - IP адреси та геолокацію
 * - Bounce rate та engagement metrics
 */

import GoogleSheetsAnalytics from './GoogleSheetsAnalytics';

class SessionAnalytics {
  constructor() {
    this.currentSession = null;
    this.pageViews = new Map(); // Зберігаємо активні перегляди сторінок
    this.ipServices = [
      'https://api.ipify.org?format=json',
      'https://httpbin.org/ip',
      'https://api.myip.com',
      'https://ipapi.co/json/'
    ];
  }

  /**
   * 🆔 Генерація унікального ID сесії
   */
  generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `session_${timestamp}_${random}`;
  }

  /**
   * 🌐 Отримання IP адреси користувача
   */
  async getUserIP() {
    for (const service of this.ipServices) {
      try {
        console.log(`🔍 Спроба отримати IP через ${service}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(service, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) continue;

        const data = await response.json();
        
        // Різні сервіси повертають IP в різних форматах
        const ip = data.ip || data.origin || data.query || 
                  (typeof data === 'string' ? data : null);
        
        if (ip && this.isValidIP(ip)) {
          console.log(`✅ IP отримано через ${service}: ${ip}`);
          return ip;
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log(`⏱️ Timeout ${service}`);
        } else {
          console.log(`❌ Помилка ${service}:`, error.message);
        }
        continue;
      }
    }

    console.warn('⚠️ Не вдалося отримати IP адресу');
    return 'unknown';
  }

  /**
   * ✅ Валідація IP адреси
   */
  isValidIP(ip) {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * 🎯 Початок нової сесії
   */
  startSession(sessionData) {
    this.currentSession = {
      sessionId: sessionData.sessionId,
      startTime: sessionData.startTime,
      endTime: null,
      duration: null,
      ipAddress: sessionData.ipAddress,
      userAgent: sessionData.userAgent,
      totalPages: 0,
      totalInteractions: 0,
      maxScrollDepth: 0,
      bounced: false, // Чи користувач швидко пішов
      device: this.getDeviceInfo(),
      browser: this.getBrowserInfo(),
      location: this.getLocationInfo(),
      referrer: document.referrer || 'direct'
    };

    console.log('🎯 Розпочато нову сесію:', this.currentSession.sessionId);
  }

  /**
   * 🏁 Завершення сесії
   */
  endSession(sessionRef) {
    if (!this.currentSession) return;

    const endTime = Date.now();
    const duration = endTime - this.currentSession.startTime;

    this.currentSession.endTime = endTime;
    this.currentSession.duration = duration;
    this.currentSession.totalPages = sessionRef.totalPages;

    // Визначаємо bounce (швидкий вихід без взаємодії)
    this.currentSession.bounced = (
      duration < 30000 && // Менше 30 секунд
      this.currentSession.totalPages <= 1 && // Тільки одна сторінка
      this.currentSession.totalInteractions < 5 // Мало взаємодій
    );

    // Відправляємо дані сесії
    this.sendSessionData();

    console.log(`🏁 Сесія завершена: ${Math.round(duration/1000)}с, сторінок: ${this.currentSession.totalPages}`);
  }

  /**
   * 📄 Початок перегляду сторінки
   */
  startPageView(path, options = {}) {
    const pageViewData = {
      sessionId: this.currentSession?.sessionId,
      path: path,
      startTime: Date.now(),
      endTime: null,
      duration: null,
      interactions: 0,
      scrollDepth: 0,
      isActive: true,
      title: options.title || document.title,
      referrer: options.referrer || '',
      pageNumber: options.pageNumber || 1
    };

    this.pageViews.set(path, pageViewData);

    if (this.currentSession) {
      this.currentSession.totalPages++;
    }
  }

  /**
   * 🔄 Оновлення активного перегляду сторінки
   */
  updatePageView(path, updates) {
    const pageView = this.pageViews.get(path);
    if (!pageView) return;

    Object.assign(pageView, updates);
    
    // Оновлюємо загальну статистику сесії
    if (this.currentSession) {
      this.currentSession.totalInteractions += updates.interactions || 0;
      this.currentSession.maxScrollDepth = Math.max(
        this.currentSession.maxScrollDepth,
        updates.scrollDepth || 0
      );
    }
  }

  /**
   * 📄 Завершення перегляду сторінки
   */
  endPageView(path, startTime, interactions, scrollDepth, duration = null) {
    const pageView = this.pageViews.get(path);
    if (!pageView) return;

    const endTime = Date.now();
    const actualDuration = duration || (endTime - startTime);

    pageView.endTime = endTime;
    pageView.duration = actualDuration;
    pageView.interactions = interactions;
    pageView.scrollDepth = scrollDepth;
    pageView.isActive = false;

    // Відправляємо дані перегляду сторінки
    this.sendPageViewData(pageView);

    this.pageViews.delete(path);
    
    console.log(`📄 Завершено ${path}: ${Math.round(actualDuration/1000)}с`);
  }

  /**
   * 📊 Відправка даних сесії в Google Sheets
   */
  sendSessionData() {
    if (!this.currentSession) return;

    const sessionData = {
      timestamp: this.currentSession.startTime,
      date: new Date(this.currentSession.startTime).toISOString().split('T')[0],
      session_id: this.currentSession.sessionId,
      ip_address: this.currentSession.ipAddress,
      user_agent: this.currentSession.userAgent,
      duration_seconds: Math.round(this.currentSession.duration / 1000),
      total_pages: this.currentSession.totalPages,
      total_interactions: this.currentSession.totalInteractions,
      max_scroll_depth: this.currentSession.maxScrollDepth,
      bounced: this.currentSession.bounced,
      device_type: this.currentSession.device.type,
      browser_name: this.currentSession.browser.name,
      browser_version: this.currentSession.browser.version,
      screen_resolution: this.currentSession.device.screenResolution,
      referrer: this.currentSession.referrer,
      start_time: new Date(this.currentSession.startTime).toISOString(),
      end_time: new Date(this.currentSession.endTime).toISOString()
    };

    // Додаємо до batch черги для відправки
    GoogleSheetsAnalytics.addEventToBatch({
      sheet: 'UserSessions',
      data: [sessionData]
    });

    console.log('📊 Дані сесії відправлено:', sessionData);
  }

  /**
   * 📄 Відправка даних перегляду сторінки
   */
  sendPageViewData(pageViewData) {
    const data = {
      timestamp: pageViewData.startTime,
      date: new Date(pageViewData.startTime).toISOString().split('T')[0],
      session_id: pageViewData.sessionId,
      page_path: pageViewData.path,
      page_title: pageViewData.title,
      duration_seconds: Math.round(pageViewData.duration / 1000),
      interactions: pageViewData.interactions,
      scroll_depth: pageViewData.scrollDepth,
      page_number: pageViewData.pageNumber,
      referrer: pageViewData.referrer,
      start_time: new Date(pageViewData.startTime).toISOString(),
      end_time: new Date(pageViewData.endTime).toISOString()
    };

    // Додаємо до існуючого PageViews аркуша з додатковими даними
    GoogleSheetsAnalytics.addEventToBatch({
      sheet: 'PageViewsDetailed',
      data: [data]
    });

    console.log('📄 Детальні дані перегляду відправлено:', data);
  }

  /**
   * 📱 Отримання інформації про пристрій
   */
  getDeviceInfo() {
    const width = window.innerWidth;
    let type = 'desktop';
    
    if (width <= 768) type = 'mobile';
    else if (width <= 1024) type = 'tablet';

    return {
      type,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      pixelRatio: window.devicePixelRatio || 1,
      touchEnabled: 'ontouchstart' in window
    };
  }

  /**
   * 🌐 Отримання інформації про браузер
   */
  getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = { name: 'unknown', version: 'unknown' };

    if (ua.includes('Chrome') && !ua.includes('Edge')) {
      browser.name = 'Chrome';
      browser.version = ua.match(/Chrome\/([0-9.]+)/)?.[1] || 'unknown';
    } else if (ua.includes('Firefox')) {
      browser.name = 'Firefox';
      browser.version = ua.match(/Firefox\/([0-9.]+)/)?.[1] || 'unknown';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      browser.name = 'Safari';
      browser.version = ua.match(/Version\/([0-9.]+)/)?.[1] || 'unknown';
    } else if (ua.includes('Edge')) {
      browser.name = 'Edge';
      browser.version = ua.match(/Edge\/([0-9.]+)/)?.[1] || 'unknown';
    }

    return browser;
  }

  /**
   * 🌍 Отримання інформації про локацію (базова)
   */
  getLocationInfo() {
    return {
      language: navigator.language || 'unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
      cookieEnabled: navigator.cookieEnabled
    };
  }

  /**
   * 📈 Статичні методи для зручного використання
   */
  static getInstance() {
    if (!SessionAnalytics._instance) {
      SessionAnalytics._instance = new SessionAnalytics();
    }
    return SessionAnalytics._instance;
  }

  static generateSessionId() {
    return SessionAnalytics.getInstance().generateSessionId();
  }

  static async getUserIP() {
    return SessionAnalytics.getInstance().getUserIP();
  }

  static startSession(sessionData) {
    return SessionAnalytics.getInstance().startSession(sessionData);
  }

  static endSession(sessionRef) {
    return SessionAnalytics.getInstance().endSession(sessionRef);
  }

  static startPageView(path, options) {
    return SessionAnalytics.getInstance().startPageView(path, options);
  }

  static updatePageView(path, updates) {
    return SessionAnalytics.getInstance().updatePageView(path, updates);
  }

  static endPageView(path, startTime, interactions, scrollDepth, duration) {
    return SessionAnalytics.getInstance().endPageView(path, startTime, interactions, scrollDepth, duration);
  }

  /**
   * 📤 Завершення сесії через sendBeacon (надійне при закритті сторінки)
   */
  static endSessionWithBeacon(sessionRef) {
    const instance = SessionAnalytics.getInstance();
    if (!instance.currentSession) return;

    const endTime = Date.now();
    const duration = endTime - instance.currentSession.startTime;
    
    instance.currentSession.endTime = endTime;
    instance.currentSession.duration = duration;
    instance.currentSession.totalPages = sessionRef.totalPages || 1;
    
    // Визначаємо bounce
    instance.currentSession.bounced = (
      duration < 30000 && 
      instance.currentSession.totalPages <= 1 && 
      instance.currentSession.totalInteractions < 5
    );

    const sessionData = {
      timestamp: instance.currentSession.startTime,
      date: new Date(instance.currentSession.startTime).toISOString().split('T')[0],
      session_id: instance.currentSession.sessionId,
      ip_address: instance.currentSession.ipAddress,
      user_agent: instance.currentSession.userAgent,
      duration_seconds: Math.round(duration / 1000),
      total_pages: instance.currentSession.totalPages,
      total_interactions: instance.currentSession.totalInteractions,
      max_scroll_depth: instance.currentSession.maxScrollDepth,
      bounced: instance.currentSession.bounced,
      device_type: instance.currentSession.device.type,
      browser_name: instance.currentSession.browser.name,
      browser_version: instance.currentSession.browser.version,
      screen_resolution: instance.currentSession.device.screenResolution,
      referrer: instance.currentSession.referrer,
      start_time: new Date(instance.currentSession.startTime).toISOString(),
      end_time: new Date(endTime).toISOString()
    };

    // Використовуємо sendBeacon для надійної відправки
    if (navigator.sendBeacon) {
      const url = process.env.REACT_APP_ANALYTICS_SCRIPT_URL || 
                 (typeof window !== 'undefined' && window.RUNTIME_CONFIG?.ANALYTICS_SCRIPT_URL);
      
      if (url) {
        const formData = new FormData();
        formData.append('action', 'analytics');
        formData.append('sheet', 'UserSessions');
        formData.append('data', JSON.stringify([sessionData]));
        
        const success = navigator.sendBeacon(url, formData);
        console.log(`📤 Session data відправлено через sendBeacon: ${success ? 'успішно' : 'помилка'}`);
        
        if (success) {
          localStorage.setItem('comspec_last_session_data', JSON.stringify({
            sessionId: sessionData.session_id,
            duration: sessionData.duration_seconds,
            pages: sessionData.total_pages,
            timestamp: Date.now()
          }));
        }
      }
    } else {
      console.warn('⚠️ sendBeacon не підтримується, використовуємо fallback');
      instance.sendSessionData();
    }

    console.log(`📤 Сесія завершена через sendBeacon: ${Math.round(duration/1000)}с`);
  }

  /**
   * 💾 Збереження стану сесії (для visibilitychange)
   */
  static saveSessionState(sessionRef, currentPageRef) {
    const instance = SessionAnalytics.getInstance();
    if (!instance.currentSession || !currentPageRef) return;

    const now = Date.now();
    const sessionDuration = now - instance.currentSession.startTime;
    const pageDuration = currentPageRef.startTime ? now - currentPageRef.startTime : 0;

    const stateData = {
      sessionId: instance.currentSession.sessionId,
      totalPages: sessionRef.totalPages || 1,
      sessionDuration: Math.round(sessionDuration / 1000),
      currentPage: currentPageRef.path,
      pageDuration: Math.round(pageDuration / 1000),
      interactions: currentPageRef.interactions || 0,
      scrollDepth: currentPageRef.scrollDepth || 0,
      timestamp: now
    };

    // Зберігаємо в localStorage як backup
    localStorage.setItem('comspec_session_state', JSON.stringify(stateData));
    
    console.log('💾 Стан сесії збережено:', stateData);
  }

  /**
   * 🔄 Принудительне збереження поточної сесії (для тестування)
   */
  static forceSessionSave() {
    const instance = SessionAnalytics.getInstance();
    if (!instance.currentSession) {
      console.warn('⚠️ Немає активної сесії для збереження');
      return false;
    }

    console.log('🔄 Принудительне збереження сесії...');
    
    // Оновлюємо дані сесії
    const endTime = Date.now();
    const duration = endTime - instance.currentSession.startTime;
    
    instance.currentSession.endTime = endTime;
    instance.currentSession.duration = duration;

    // Зберігаємо через звичайний API
    instance.sendSessionData();
    
    console.log('✅ Сесія збережена принудительно');
    return true;
  }
}

// 🧪 Глобальні тестові функції для console
if (typeof window !== 'undefined') {
  window.sessionTest = async () => {
    console.log('🧪 Тестування session tracking...');
    
    try {
      const instance = SessionAnalytics.getInstance();
      
      // Тест отримання IP
      console.log('1. Тестування IP detection...');
      const ip = await instance.getUserIP();
      console.log('✅ IP отримано:', ip);
      
      // Тест device info
      console.log('2. Тестування device detection...');
      const device = instance.getDeviceInfo();
      console.log('✅ Device info:', device);
      
      // Тест browser info
      console.log('3. Тестування browser detection...');
      const browser = instance.getBrowserInfo();
      console.log('✅ Browser info:', browser);
      
      // Симуляція сесії
      console.log('4. Симуляція короткої сесії...');
      const sessionId = instance.generateSessionId();
      const sessionData = {
        sessionId,
        startTime: Date.now(),
        ipAddress: ip,
        userAgent: navigator.userAgent
      };
      
      instance.startSession(sessionData);
      console.log('✅ Сесія створена:', sessionId);
      
      // Симуляція перегляду сторінки
      instance.startPageView('/test-page', { 
        title: 'Test Page',
        pageNumber: 1 
      });
      console.log('✅ Page view створено');
      
      // Симуляція активності
      setTimeout(() => {
        instance.updatePageView('/test-page', {
          interactions: 15,
          scrollDepth: 75,
          duration: 5000
        });
        console.log('✅ Page view оновлено');
        
        // Завершення
        instance.endPageView('/test-page', Date.now() - 5000, 15, 75, 5000);
        instance.endSession({ totalPages: 1 });
        console.log('✅ Сесія завершена');
        
        console.log('🎉 Session tracking тест завершений успішно!');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Помилка тестування:', error);
    }
  };
  
  window.sessionStats = () => {
    console.log('📊 Session Analytics Statistics:');
    const instance = SessionAnalytics.getInstance();
    console.log('Current session:', instance.currentSession);
    console.log('Active page views:', instance.pageViews);
    console.log('Available IP services:', instance.ipServices.length);
    
    // Показуємо збережені дані
    const savedState = localStorage.getItem('comspec_session_state');
    const lastSession = localStorage.getItem('comspec_last_session_data');
    console.log('Saved session state:', savedState ? JSON.parse(savedState) : 'none');
    console.log('Last completed session:', lastSession ? JSON.parse(lastSession) : 'none');
  };

  window.sessionSave = () => {
    console.log('💾 Принудительне збереження сесії...');
    return SessionAnalytics.forceSessionSave();
  };

  window.sessionEndTest = () => {
    console.log('🏁 Тестування завершення сесії...');
    const instance = SessionAnalytics.getInstance();
    if (instance.currentSession) {
      SessionAnalytics.endSessionWithBeacon({ 
        totalPages: instance.currentSession.totalPages || 1 
      });
      return true;
    } else {
      console.warn('⚠️ Немає активної сесії');
      return false;
    }
  };
}

export default SessionAnalytics;