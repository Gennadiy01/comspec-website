// tests/manual-node/test-analytics-config.js
/**
 * 🧪 Тест системи конфігурації аналітики
 */

// Імітуємо window об'єкт для Node.js тестування
global.window = {
  location: { hostname: 'localhost' },
  RUNTIME_CONFIG: {
    ANALYTICS_LEVEL: 'PRODUCTION',
    ANALYTICS_SAMPLING_RATE: 30
  }
};

// Імітуємо process.env
process.env.REACT_APP_ANALYTICS_LEVEL = '';

// Імітуємо localStorage
global.localStorage = {
  getItem: (key) => {
    if (key === 'comspec_analytics_user_id') {
      return 'user_12345_abcd'; // Тестовий користувач
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

console.log('🧪 Тестування системи конфігурації аналітики');
console.log('='.repeat(50));

// Тест 1: Перевірка рівнів конфігурації
console.log('\n1️⃣ Тест рівнів конфігурації:');
Object.keys(ANALYTICS_LEVELS).forEach(level => {
  console.log(`   ${level}:`, ANALYTICS_LEVELS[level]);
});

// Тест 2: Конфігурація для localhost (повинна бути FULL)
console.log('\n2️⃣ Тест конфігурації для localhost:');
const localhostConfig = getAnalyticsConfig();
console.log('   Конфігурація:', localhostConfig);
console.log('   Session tracking:', isFeatureEnabled('sessionTracking'));
console.log('   IP detection:', isFeatureEnabled('ipDetection'));

// Тест 3: Конфігурація для production
console.log('\n3️⃣ Тест конфігурації для production:');
global.window.location.hostname = 'comspec.github.io';
const productionConfig = getAnalyticsConfig();
console.log('   Конфігурація:', productionConfig);
console.log('   Session tracking:', isFeatureEnabled('sessionTracking'));
console.log('   IP detection:', isFeatureEnabled('ipDetection'));

// Тест 4: Sampling rate
console.log('\n4️⃣ Тест sampling rate:');
const samplingRate = getSamplingRate();
console.log('   Sampling rate:', samplingRate + '%');

// Тест 5: Перевірка sampling для користувача
console.log('\n5️⃣ Тест user sampling:');
for (let i = 0; i < 10; i++) {
  const shouldTrack = shouldTrackUser();
  console.log(`   Спроба ${i + 1}: ${shouldTrack ? '✅ Track' : '❌ Skip'}`);
}

// Тест 6: Перевірка різних environment variables
console.log('\n6️⃣ Тест environment variables:');
process.env.REACT_APP_ANALYTICS_LEVEL = 'BASIC';
global.window.location.hostname = 'example.com';
global.window.RUNTIME_CONFIG = undefined;

const envConfig = getAnalyticsConfig();
console.log('   BASIC config:', envConfig);
console.log('   Page views:', isFeatureEnabled('pageViews'));
console.log('   Product events:', isFeatureEnabled('productEvents'));

console.log('\n🎉 Тестування завершено!');