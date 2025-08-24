// tests/manual-node/test-runtime-config-fix.js
/**
 * 🧪 Тест виправлення RUNTIME_CONFIG для production
 */

// Імітуємо window об'єкт для production з PRODUCTION_FULL конфігурацією
global.window = {
  location: { hostname: 'comspec.github.io' },
  RUNTIME_CONFIG: {
    ANALYTICS_LEVEL: 'PRODUCTION_FULL',
    ANALYTICS_SAMPLING_RATE: 50,
    ANALYTICS_DEBUG_MODE: false,
    ANALYTICS_ENABLED: true
  }
};

// Імітуємо process.env (без REACT_APP_ANALYTICS_LEVEL)
process.env.REACT_APP_ANALYTICS_LEVEL = '';

// Імітуємо localStorage
global.localStorage = {
  getItem: (key) => {
    if (key === 'comspec_analytics_user_id') {
      return 'user_12345_abcd';
    }
    return null;
  },
  setItem: () => {}
};

// Завантажуємо модуль
const { 
  getAnalyticsConfig, 
  isFeatureEnabled, 
  getSamplingRate, 
  shouldTrackUser,
  ANALYTICS_LEVELS 
} = require('../../src/config/analytics-config.js');

console.log('🧪 Тест виправлення RUNTIME_CONFIG для PRODUCTION_FULL');
console.log('='.repeat(60));

console.log('\n📊 RUNTIME_CONFIG налаштування:');
console.log('  ANALYTICS_LEVEL:', global.window.RUNTIME_CONFIG.ANALYTICS_LEVEL);
console.log('  ANALYTICS_SAMPLING_RATE:', global.window.RUNTIME_CONFIG.ANALYTICS_SAMPLING_RATE);
console.log('  Hostname:', global.window.location.hostname);

console.log('\n🔍 Тестування конфігурації:');
const config = getAnalyticsConfig();

console.log('\n✅ Результат конфігурації:');
console.log('  Level:', config.level);
console.log('  Session Tracking:', isFeatureEnabled('sessionTracking'));
console.log('  IP Detection:', isFeatureEnabled('ipDetection'));
console.log('  Detailed Page Views:', isFeatureEnabled('detailedPageViews'));
console.log('  User Sessions:', isFeatureEnabled('userSessions'));
console.log('  Sampling Rate:', getSamplingRate() + '%');

console.log('\n🎯 Перевірка функцій:');
if (config.level === 'PRODUCTION_FULL') {
  console.log('  ✅ PRODUCTION_FULL конфігурація працює!');
  console.log('  ✅ Session Tracking:', isFeatureEnabled('sessionTracking') ? 'УВІМКНЕНИЙ' : '❌ ВИМКНЕНИЙ');
  console.log('  ✅ User Sessions:', isFeatureEnabled('userSessions') ? 'УВІМКНЕНИЙ' : '❌ ВИМКНЕНИЙ');
} else {
  console.log(`  ❌ Очікувався PRODUCTION_FULL, отримано: ${config.level}`);
}

console.log('\n🎉 Тест завершено!');