// tests/manual-node/test-sampling-rate.js
/**
 * 🎲 Тест sampling rate функціоналу
 * Перевірка детермінованого sampling на основі user ID
 */

// Імітуємо localStorage для тестування
global.localStorage = {
  _storage: {},
  getItem: function(key) {
    return this._storage[key] || null;
  },
  setItem: function(key, value) {
    this._storage[key] = value;
  },
  clear: function() {
    this._storage = {};
  }
};

// Імітуємо window об'єкт
global.window = {
  location: { hostname: 'comspec.github.io' },
  RUNTIME_CONFIG: {
    ANALYTICS_LEVEL: 'PRODUCTION',
    ANALYTICS_SAMPLING_RATE: 30
  }
};

const { getSamplingRate, shouldTrackUser } = require('../../src/config/analytics-config.js');

console.log('🎲 Тест sampling rate функціоналу');
console.log('='.repeat(50));

// Тест 1: Перевірка sampling rate
console.log('\n1️⃣ Перевірка sampling rate:');
const samplingRate = getSamplingRate();
console.log(`   Поточний sampling rate: ${samplingRate}%`);

// Тест 2: Тестування без user ID (випадковий sampling)
console.log('\n2️⃣ Тест випадкового sampling (без user ID):');
global.localStorage.clear();

const randomResults = [];
for (let i = 0; i < 1000; i++) {
  const shouldTrack = shouldTrackUser();
  randomResults.push(shouldTrack);
}

const randomTrackedCount = randomResults.filter(x => x).length;
const randomTrackedPercent = (randomTrackedCount / 1000 * 100).toFixed(1);

console.log(`   З 1000 спроб: ${randomTrackedCount} відслідковано (${randomTrackedPercent}%)`);
console.log(`   Очікувалось: ~${samplingRate}% (±5%)`);

if (Math.abs(randomTrackedPercent - samplingRate) <= 10) {
  console.log('   ✅ Випадковий sampling працює коректно');
} else {
  console.log('   ❌ Випадковий sampling не в межах очікувань');
}

// Тест 3: Детермінований sampling з різними user ID
console.log('\n3️⃣ Тест детермінованого sampling:');

function testUserSampling(userId) {
  global.localStorage.clear();
  global.localStorage.setItem('comspec_analytics_user_id', userId);
  
  // Тестуємо 10 разів для одного користувача - повинно бути консистентно
  const results = [];
  for (let i = 0; i < 10; i++) {
    results.push(shouldTrackUser());
  }
  
  const unique = [...new Set(results)];
  const isConsistent = unique.length === 1;
  const isTracked = unique[0];
  
  return { userId, isTracked, isConsistent, results: results.slice(0, 3) };
}

const testUsers = [
  'user_1234567890_abcd',
  'user_9876543210_zyxw', 
  'user_5555555555_mmmm',
  'user_1111111111_aaaa',
  'user_9999999999_zzzz',
  'user_3333333333_cccc',
  'user_7777777777_gggg',
  'user_2222222222_bbbb',
  'user_8888888888_hhhh',
  'user_4444444444_dddd'
];

const determinedResults = testUsers.map(testUserSampling);

determinedResults.forEach(result => {
  const status = result.isTracked ? '✅ Track' : '❌ Skip';
  const consistency = result.isConsistent ? '(Консистентно)' : '(Непослідовно!)';
  console.log(`   ${result.userId}: ${status} ${consistency}`);
});

const trackedUsers = determinedResults.filter(r => r.isTracked).length;
const trackedPercent = (trackedUsers / testUsers.length * 100).toFixed(1);
const allConsistent = determinedResults.every(r => r.isConsistent);

console.log(`\n   📊 Результат детермінованого sampling:`);
console.log(`      - Відслідковано користувачів: ${trackedUsers}/${testUsers.length} (${trackedPercent}%)`);
console.log(`      - Очікуваний відсоток: ~${samplingRate}%`);
console.log(`      - Всі користувачі консистентні: ${allConsistent ? '✅ Так' : '❌ Ні'}`);

// Тест 4: Різні sampling rates
console.log('\n4️⃣ Тест різних sampling rates:');

const testSamplingRates = [10, 50, 75, 100];

testSamplingRates.forEach(rate => {
  global.window.RUNTIME_CONFIG.ANALYTICS_SAMPLING_RATE = rate;
  
  const results = [];
  for (let i = 0; i < 200; i++) {
    global.localStorage.clear();
    global.localStorage.setItem('comspec_analytics_user_id', `user_${i}_test`);
    results.push(shouldTrackUser());
  }
  
  const tracked = results.filter(x => x).length;
  const percent = (tracked / 200 * 100).toFixed(1);
  
  console.log(`   ${rate}% rate: ${tracked}/200 користувачів (${percent}%)`);
});

// Тест 5: Edge cases
console.log('\n5️⃣ Тест граничних випадків:');

// 0% sampling
global.window.RUNTIME_CONFIG.ANALYTICS_SAMPLING_RATE = 0;
global.localStorage.setItem('comspec_analytics_user_id', 'user_test_0');
const zeroPercent = shouldTrackUser();
console.log(`   0% sampling: ${zeroPercent ? '✅ Track' : '❌ Skip'} (очікується Skip)`);

// 100% sampling  
global.window.RUNTIME_CONFIG.ANALYTICS_SAMPLING_RATE = 100;
global.localStorage.setItem('comspec_analytics_user_id', 'user_test_100');
const hundredPercent = shouldTrackUser();
console.log(`   100% sampling: ${hundredPercent ? '✅ Track' : '❌ Skip'} (очікується Track)`);

// Некоректний user ID
global.window.RUNTIME_CONFIG.ANALYTICS_SAMPLING_RATE = 30;
global.localStorage.setItem('comspec_analytics_user_id', 'invalid_format');
const invalidId = shouldTrackUser();
console.log(`   Некоректний ID: ${invalidId ? '✅ Track' : '❌ Skip'} (fallback до випадкового)`);

// Відсутній RUNTIME_CONFIG
const originalConfig = global.window.RUNTIME_CONFIG;
global.window.RUNTIME_CONFIG = undefined;
global.localStorage.setItem('comspec_analytics_user_id', 'user_no_config');
const noConfig = shouldTrackUser();
global.window.RUNTIME_CONFIG = originalConfig;
console.log(`   Без RUNTIME_CONFIG: ${noConfig ? '✅ Track' : '❌ Skip'} (fallback 100%)`);

console.log('\n🎉 Тестування sampling завершено!');