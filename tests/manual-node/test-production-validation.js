// tests/manual-node/test-production-validation.js
/**
 * ✅ Валідація PRODUCTION режиму
 * Перевірка що session tracking вимкнений, а базові функції працюють
 */

// Імітуємо window об'єкт для production
global.window = {
  location: { hostname: 'comspec.github.io' }, // Production домен
  RUNTIME_CONFIG: {
    ANALYTICS_LEVEL: 'PRODUCTION',
    ANALYTICS_SAMPLING_RATE: 30,
    ANALYTICS_ENABLED: true,
    ANALYTICS_DEBUG_MODE: false
  }
};

const { 
  getAnalyticsConfig, 
  isFeatureEnabled, 
  getSamplingRate 
} = require('../../src/config/analytics-config.js');

console.log('✅ Валідація PRODUCTION режиму');
console.log('='.repeat(40));

// Отримуємо конфігурацію
const config = getAnalyticsConfig();

console.log('\n📋 КОНФІГУРАЦІЯ PRODUCTION:');
console.log(`   Level: ${config.level}`);
console.log(`   Sampling Rate: ${getSamplingRate()}%`);

console.log('\n🔍 ПЕРЕВІРКА ФУНКЦІЙ:');

// Перевіряємо що основні функції увімкнені
const basicFeatures = [
  'pageViews',
  'productEvents'
];

basicFeatures.forEach(feature => {
  const enabled = isFeatureEnabled(feature);
  const status = enabled ? '✅ Увімкнено' : '❌ Вимкнено';
  console.log(`   ${feature}: ${status}`);
});

// Перевіряємо що ресурсомістка аналітика вимкнена
const advancedFeatures = [
  'sessionTracking',
  'ipDetection', 
  'detailedPageViews',
  'userSessions'
];

console.log('\n🚫 ВИМКНЕНІ ФУНКЦІЇ (для економії запитів):');
advancedFeatures.forEach(feature => {
  const enabled = isFeatureEnabled(feature);
  const status = enabled ? '❌ УВІМКНЕНО (помилка!)' : '✅ Вимкнено';
  const icon = enabled ? '⚠️' : '✅';
  console.log(`   ${icon} ${feature}: ${status}`);
});

// Перевірка batch налаштувань
console.log('\n⚙️ BATCH НАЛАШТУВАННЯ:');
console.log(`   Batch Size: ${config.batchSize} (більший = менше запитів)`);
console.log(`   Batch Timeout: ${config.batchTimeout / 1000}с (довший = менше запитів)`);

// Симуляція роботи в production
console.log('\n🎯 СИМУЛЯЦІЯ PRODUCTION РОБОТИ:');

// Перевірка що SessionTracker буде вимкнений
const sessionTrackingEnabled = isFeatureEnabled('sessionTracking');
if (sessionTrackingEnabled) {
  console.log('   ❌ ПОМИЛКА: Session tracking увімкнений в PRODUCTION!');
  console.log('   ⚠️  Це призведе до занадто великої кількості запитів');
} else {
  console.log('   ✅ Session tracking правильно вимкнений');
  console.log('   💰 Це економить ~20 запитів на користувача');
}

// Перевірка IP detection
const ipDetectionEnabled = isFeatureEnabled('ipDetection');
if (ipDetectionEnabled) {
  console.log('   ❌ ПОМИЛКА: IP detection увімкнений в PRODUCTION!');
} else {
  console.log('   ✅ IP detection правильно вимкнений');
  console.log('   💰 Це уникає зовнішніх API запитів');
}

// Розрахунок запитів для типової сесії
console.log('\n📊 РОЗРАХУНОК ЗАПИТІВ НА СЕСІЮ:');
const pageViews = 5; // Типова кількість переходів
const productInteractions = 8; // Типова кількість взаємодій з товарами

let totalRequests = 0;

if (config.pageViews) {
  const pageViewRequests = Math.ceil(pageViews / config.batchSize);
  totalRequests += pageViewRequests;
  console.log(`   Page Views: ${pageViews} переходів → ${pageViewRequests} запитів`);
}

if (config.productEvents) {
  const productRequests = Math.ceil(productInteractions / config.batchSize);
  totalRequests += productRequests;
  console.log(`   Product Events: ${productInteractions} взаємодій → ${productRequests} запитів`);
}

const samplingRate = getSamplingRate();
const effectiveRequests = Math.ceil(totalRequests * (samplingRate / 100));

console.log(`   📈 Загальна кількість запитів: ${totalRequests}`);
console.log(`   📉 З урахуванням sampling (${samplingRate}%): ${effectiveRequests}`);

// Фінальна оцінка
console.log('\n🎉 ФІНАЛЬНА ОЦІНКА PRODUCTION РЕЖИМУ:');

let score = 0;
let maxScore = 0;

// Основні функції повинні працювати
maxScore += 2;
if (isFeatureEnabled('pageViews') && isFeatureEnabled('productEvents')) {
  score += 2;
  console.log('   ✅ Основні функції аналітики працюють (+2)');
} else {
  console.log('   ❌ Основні функції аналітики не працюють (0)');
}

// Ресурсомістка аналітика повинна бути вимкнена
maxScore += 3;
const resourceIntensiveDisabled = !isFeatureEnabled('sessionTracking') && 
                                  !isFeatureEnabled('ipDetection') && 
                                  !isFeatureEnabled('detailedPageViews');
if (resourceIntensiveDisabled) {
  score += 3;
  console.log('   ✅ Ресурсомістка аналітика вимкнена (+3)');
} else {
  console.log('   ❌ Ресурсомістка аналітика не вимкнена (0)');
}

// Batch налаштування оптимізовані
maxScore += 2;
if (config.batchSize >= 5 && config.batchTimeout >= 10000) {
  score += 2;
  console.log('   ✅ Batch налаштування оптимізовані (+2)');
} else {
  console.log('   ❌ Batch налаштування не оптимізовані (0)');
}

// Sampling увімкнений
maxScore += 1;
if (samplingRate < 100) {
  score += 1;
  console.log('   ✅ Sampling активний для економії (+1)');
} else {
  console.log('   ❌ Sampling не активний (0)');
}

// Кількість запитів прийнятна
maxScore += 2;
if (effectiveRequests <= 5) {
  score += 2;
  console.log('   ✅ Кількість запитів прийнятна (+2)');
} else if (effectiveRequests <= 10) {
  score += 1;
  console.log('   ⚠️ Кількість запитів приграничная (+1)');
} else {
  console.log('   ❌ Занадто багато запитів (0)');
}

const percentage = (score / maxScore * 100).toFixed(0);
console.log(`\n📊 ЗАГАЛЬНА ОЦІНКА: ${score}/${maxScore} (${percentage}%)`);

if (percentage >= 90) {
  console.log('🏆 ВІДМІННО: Production режим оптимально налаштований!');
} else if (percentage >= 70) {
  console.log('👍 ДОБРЕ: Production режим працює коректно з мінорними проблемами');
} else if (percentage >= 50) {
  console.log('⚠️ ЗАДОВІЛЬНО: Потрібні покращення в production налаштуваннях');
} else {
  console.log('❌ ПОГАНО: Production режим потребує серйозних змін');
}

console.log('\n🎯 Валідація завершена!');