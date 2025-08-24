// src/config/analytics-config.js
/**
 * 📊 Конфігурація рівнів аналітики для управління кількістю запитів
 */

export const ANALYTICS_LEVELS = {
  // 📊 БАЗОВИЙ - мінімум запитів (1-2 запити на сесію)
  BASIC: {
    pageViews: true,              // ✅ Тільки основні перегляди сторінок
    productEvents: false,         // ❌ Без events товарів
    sessionTracking: false,       // ❌ Без session tracking
    ipDetection: false,           // ❌ Без IP запитів
    detailedPageViews: false,     // ❌ Без детальних даних сторінок
    batchSize: 5,                 // Більші batch для зменшення запитів
    batchTimeout: 10000           // Довший timeout (10 сек)
  },
  
  // 📈 СТАНДАРТНИЙ - помірне використання (3-5 запитів на сесію)
  STANDARD: {
    pageViews: true,              // ✅ Основні перегляди
    productEvents: true,          // ✅ Події товарів
    sessionTracking: false,       // ❌ Без повного session tracking
    ipDetection: false,           // ❌ Без IP запитів
    detailedPageViews: false,     // ❌ Без детальних даних
    batchSize: 3,                 // Стандартні batch
    batchTimeout: 7000            // 7 секунд
  },
  
  // 🔥 ПОВНИЙ - всі функції (10+ запитів на сесію)
  FULL: {
    pageViews: true,              // ✅ Основні перегляди
    productEvents: true,          // ✅ Події товарів
    sessionTracking: true,        // ✅ Повний session tracking
    ipDetection: true,            // ✅ IP detection
    detailedPageViews: true,      // ✅ Детальна аналітика сторінок
    userSessions: true,           // ✅ Збереження сесій користувачів
    batchSize: 1,                 // Менші batch для швидкості
    batchTimeout: 5000            // 5 секунд
  },
  
  // 🎯 PRODUCTION - оптимізований для продакшн
  PRODUCTION: {
    pageViews: true,              // ✅ Основні перегляди
    productEvents: true,          // ✅ Події товарів
    sessionTracking: false,       // ❌ Без session tracking
    ipDetection: false,           // ❌ Без IP запитів  
    detailedPageViews: false,     // ❌ Без детальних даних
    batchSize: 10,                // Великі batch
    batchTimeout: 15000,          // Довгий timeout (15 сек)
    samplingRate: 30              // 📉 Тільки 30% користувачів
  },
  
  // 🚀 PRODUCTION_FULL - повна аналітика в продакшн (обережно з лімітами!)
  PRODUCTION_FULL: {
    pageViews: true,              // ✅ Основні перегляди
    productEvents: true,          // ✅ Події товарів
    sessionTracking: true,        // ✅ Повний session tracking
    ipDetection: true,            // ✅ IP detection
    detailedPageViews: true,      // ✅ Детальна аналітика сторінок
    userSessions: true,           // ✅ Збереження сесій користувачів
    batchSize: 3,                 // Середні batch для балансу
    batchTimeout: 8000,           // 8 секунд
    samplingRate: 50              // 📊 50% користувачів (компроміс)
  }
};

/**
 * 📋 Отримання конфігурації аналітики
 */
export function getAnalyticsConfig() {
  // Пріоритет конфігурацій
  let level = 'STANDARD'; // За замовчуванням
  
  // 1. Environment змінні  
  if (process.env.REACT_APP_ANALYTICS_LEVEL) {
    level = process.env.REACT_APP_ANALYTICS_LEVEL;
  }
  
  // 2. Runtime конфігурація (для production)
  if (typeof window !== 'undefined' && 
      window.RUNTIME_CONFIG && 
      window.RUNTIME_CONFIG.ANALYTICS_LEVEL &&
      window.RUNTIME_CONFIG.ANALYTICS_LEVEL !== 'undefined') {
    level = window.RUNTIME_CONFIG.ANALYTICS_LEVEL;
    console.log(`🔧 Використовую RUNTIME_CONFIG level: ${level}`);
  }
  
  // 3. Автоматичний режим для localhost (має найвищий пріоритет)
  if (typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1')) {
    level = process.env.REACT_APP_ANALYTICS_LEVEL || 'FULL'; // Повний режим на localhost
    console.log(`🏠 Localhost режим: ${level}`);
  }
  
  const config = ANALYTICS_LEVELS[level] || ANALYTICS_LEVELS.STANDARD;
  
  console.log(`📊 Analytics Level: ${level}`, config);
  
  return {
    level,
    ...config
  };
}

/**
 * 🎯 Перевірка чи функція увімкнена
 */
export function isFeatureEnabled(featureName) {
  const config = getAnalyticsConfig();
  return config[featureName] === true;
}

/**
 * 📈 Отримання sampling rate
 */
export function getSamplingRate() {
  const config = getAnalyticsConfig();
  
  // Runtime override
  if (typeof window !== 'undefined' && window.RUNTIME_CONFIG?.ANALYTICS_SAMPLING_RATE) {
    return window.RUNTIME_CONFIG.ANALYTICS_SAMPLING_RATE;
  }
  
  return config.samplingRate || 100;
}

/**
 * 🎲 Перевірка чи користувач потрапляє в sample
 */
export function shouldTrackUser() {
  const rate = getSamplingRate();
  if (rate >= 100) return true;
  if (rate <= 0) return false;
  
  // Детермінований sampling на основі userId
  const userId = localStorage.getItem('comspec_analytics_user_id');
  if (userId) {
    const hash = userId.split('_')[1] || '0';
    const hashNum = parseInt(hash.slice(-4), 16) || 0;
    return (hashNum % 100) < rate;
  }
  
  // Fallback - випадковий sampling
  return Math.random() * 100 < rate;
}