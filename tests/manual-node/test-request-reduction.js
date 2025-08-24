// tests/manual-node/test-request-reduction.js
/**
 * 🧪 Тест зменшення кількості запитів до Google Apps Script
 * Порівняння FULL режиму з PRODUCTION режимом
 */

console.log('📊 Тест зменшення запитів до Google Apps Script');
console.log('='.repeat(60));

// Імітуємо різні режими аналітики
const ANALYTICS_LEVELS = {
  FULL: {
    pageViews: true,
    productEvents: true,
    sessionTracking: true,
    ipDetection: true,
    detailedPageViews: true,
    userSessions: true,
    batchSize: 1,
    batchTimeout: 5000,
    samplingRate: 100
  },
  PRODUCTION: {
    pageViews: true,
    productEvents: true,
    sessionTracking: false,
    ipDetection: false,
    detailedPageViews: false,
    batchSize: 10,
    batchTimeout: 15000,
    samplingRate: 30
  }
};

// Симуляція користувацької сесії
function simulateUserSession(mode) {
  console.log(`\n🎯 Симуляція сесії в режимі ${mode}:`);
  const config = ANALYTICS_LEVELS[mode];
  let requestCount = 0;
  let dataPoints = 0;
  
  console.log('   Конфігурація:', config);
  
  // 1. Page Views (завжди активні)
  if (config.pageViews) {
    requestCount += Math.ceil(5 / config.batchSize); // 5 переходів по сторінках
    dataPoints += 5;
    console.log(`   📄 Page views: 5 переходів → ${Math.ceil(5 / config.batchSize)} запитів`);
  }
  
  // 2. Product Events
  if (config.productEvents) {
    requestCount += Math.ceil(8 / config.batchSize); // 8 взаємодій з товарами
    dataPoints += 8;
    console.log(`   🛍️ Product events: 8 взаємодій → ${Math.ceil(8 / config.batchSize)} запитів`);
  }
  
  // 3. Session Tracking
  if (config.sessionTracking) {
    requestCount += 1; // 1 запит на завершення сесії
    requestCount += Math.ceil(5 / config.batchSize); // 5 оновлень сторінок
    dataPoints += 6;
    console.log(`   ⏱️ Session tracking: сесія + оновлення → ${1 + Math.ceil(5 / config.batchSize)} запитів`);
  }
  
  // 4. IP Detection
  if (config.ipDetection) {
    requestCount += 1; // Один запит для IP (через зовнішні сервіси, не GAS)
    console.log(`   🌐 IP detection: 1 запит (зовнішній сервіс)`);
  }
  
  // 5. Detailed Page Views
  if (config.detailedPageViews) {
    requestCount += Math.ceil(5 / config.batchSize); // Детальні дані сторінок
    dataPoints += 5;
    console.log(`   📊 Detailed page views: 5 записів → ${Math.ceil(5 / config.batchSize)} запитів`);
  }
  
  // 6. User Sessions
  if (config.userSessions) {
    requestCount += 1; // Дані користувацької сесії
    dataPoints += 1;
    console.log(`   👤 User sessions: 1 запис → 1 запит`);
  }
  
  // Sampling rate effect
  const effectiveRequests = Math.ceil(requestCount * (config.samplingRate / 100));
  
  console.log(`   📈 Загальна статистика:`);
  console.log(`      - Точок даних: ${dataPoints}`);
  console.log(`      - Запитів до GAS (100%): ${requestCount}`);
  console.log(`      - Запитів до GAS (з sampling ${config.samplingRate}%): ${effectiveRequests}`);
  console.log(`      - Batch розмір: ${config.batchSize}`);
  console.log(`      - Batch timeout: ${config.batchTimeout / 1000}с`);
  
  return {
    mode,
    totalRequests: requestCount,
    effectiveRequests,
    dataPoints,
    config
  };
}

// Запускаємо симуляції
const fullResults = simulateUserSession('FULL');
const productionResults = simulateUserSession('PRODUCTION');

// Порівняння результатів
console.log('\n📊 ПОРІВНЯННЯ РЕЖИМІВ:');
console.log('='.repeat(40));

const requestReduction = ((fullResults.totalRequests - productionResults.totalRequests) / fullResults.totalRequests * 100).toFixed(1);
const effectiveReduction = ((fullResults.effectiveRequests - productionResults.effectiveRequests) / fullResults.effectiveRequests * 100).toFixed(1);

console.log(`🔥 FULL режим:`);
console.log(`   - Запитів: ${fullResults.totalRequests}`);
console.log(`   - Ефективних запитів: ${fullResults.effectiveRequests}`);
console.log(`   - Точок даних: ${fullResults.dataPoints}`);

console.log(`🎯 PRODUCTION режим:`);
console.log(`   - Запитів: ${productionResults.totalRequests}`);
console.log(`   - Ефективних запитів: ${productionResults.effectiveRequests}`);
console.log(`   - Точок даних: ${productionResults.dataPoints}`);

console.log(`📉 ЕКОНОМІЯ:`);
console.log(`   - Зменшення запитів: ${requestReduction}%`);
console.log(`   - Ефективна економія: ${effectiveReduction}%`);
console.log(`   - Збережені функції: Page Views, Product Events`);
console.log(`   - Вимкнені функції: Session Tracking, IP Detection, Detailed Analytics`);

// Розрахунок для великої кількості користувачів
console.log('\n🌍 РОЗРАХУНОК ДЛЯ 1000 КОРИСТУВАЧІВ НА ДЕНЬ:');
console.log('='.repeat(50));

const dailyUsersFull = fullResults.effectiveRequests * 1000;
const dailyUsersProduction = productionResults.effectiveRequests * 1000;
const dailySavings = dailyUsersFull - dailyUsersProduction;

console.log(`FULL режим: ${dailyUsersFull.toLocaleString()} запитів/день`);
console.log(`PRODUCTION режим: ${dailyUsersProduction.toLocaleString()} запитів/день`);
console.log(`💰 ЕКОНОМІЯ: ${dailySavings.toLocaleString()} запитів/день (${effectiveReduction}%)`);

// Google Apps Script ліміти
console.log('\n⚠️ GOOGLE APPS SCRIPT ЛІМІТИ:');
console.log('='.repeat(35));
console.log('📋 Безкоштовний план:');
console.log('   - 6 хвилин виконання/день');
console.log('   - 20,000 запитів/день');
console.log('   - 100MB даних/день');

if (dailyUsersProduction > 20000) {
  console.log('❌ PRODUCTION режим перевищує денний ліміт!');
  console.log(`   Потрібно збільшити sampling до ${Math.ceil(20000 / dailyUsersFull * 100)}%`);
} else {
  console.log('✅ PRODUCTION режим в межах денного ліміту');
  console.log(`   Запас: ${(20000 - dailyUsersProduction).toLocaleString()} запитів`);
}

console.log('\n🎉 Аналіз завершено!');