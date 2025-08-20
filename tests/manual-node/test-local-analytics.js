// test-local-analytics.js - Тестування локальної аналітики через localStorage
console.log('🧪 Тестування локальної аналітики...');

// Симуляція localStorage для Node.js
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    data: {},
    getItem: function(key) {
      return this.data[key] || null;
    },
    setItem: function(key, value) {
      this.data[key] = String(value);
    },
    removeItem: function(key) {
      delete this.data[key];
    },
    clear: function() {
      this.data = {};
    }
  };
}

// Тестові продукти
const testProducts = [
  'gravel-0516', 'gravel-0820', 'gravel-1020', 'gravel-2040',
  'sand-river', 'sand-construction', 'crushed-stone-5-20',
  'concrete-m200', 'concrete-m300', 'asphalt-mix'
];

// Створення випадкових переглядів
function simulateProductViews() {
  console.log('\n📊 Створення симульованих переглядів...');
  
  const viewsKey = 'comspec_analytics_product_views';
  const views = {};
  
  // Створюємо дані переглядів
  testProducts.forEach(productId => {
    const viewCount = Math.floor(Math.random() * 50) + 1; // 1-50 переглядів
    const lastViewed = Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000; // Останній перегляд за 7 днів
    
    views[productId] = {
      views: viewCount,
      lastViewed: lastViewed
    };
  });
  
  localStorage.setItem(viewsKey, JSON.stringify(views));
  
  console.log('✅ Створено дані переглядів:');
  Object.entries(views).forEach(([productId, data]) => {
    const daysAgo = Math.floor((Date.now() - data.lastViewed) / (24 * 60 * 60 * 1000));
    console.log(`  ${productId}: ${data.views} переглядів (${daysAgo} днів тому)`);
  });
  
  return views;
}

// Симуляція логіки getPopularProducts
function getPopularProducts(limit = 4) {
  console.log(`\n🔥 Отримання ${limit} популярних товарів...`);
  
  const viewsKey = 'comspec_analytics_product_views';
  const stored = localStorage.getItem(viewsKey);
  
  if (!stored) {
    console.log('❌ Немає збережених даних переглядів');
    return [];
  }
  
  const views = JSON.parse(stored);
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  
  // Фільтруємо та сортуємо
  const popularItems = Object.entries(views)
    .filter(([_, data]) => data.lastViewed > thirtyDaysAgo)
    .map(([productId, data]) => ({
      productId,
      views: data.views,
      lastViewed: data.lastViewed,
      score: data.views * (1 + (data.lastViewed - thirtyDaysAgo) / (30 * 24 * 60 * 60 * 1000))
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  console.log('📈 Популярні товари:');
  popularItems.forEach((item, index) => {
    const daysAgo = Math.floor((Date.now() - item.lastViewed) / (24 * 60 * 60 * 1000));
    console.log(`  ${index + 1}. ${item.productId}: ${item.views} переглядів, score: ${item.score.toFixed(2)} (${daysAgo} днів тому)`);
  });
  
  return popularItems;
}

// Симуляція користувацьких сесій
function simulateUserSessions() {
  console.log('\n👥 Симуляція користувацьких сесій...');
  
  const sessionKey = 'comspec_analytics_sessions';
  const sessions = [];
  
  const userIds = ['user_001', 'user_002', 'user_003', 'user_004', 'user_005'];
  
  // Створюємо 10 випадкових сесій
  for (let i = 0; i < 10; i++) {
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    const sessionStart = Date.now() - Math.random() * 24 * 60 * 60 * 1000; // За останню добу
    const sessionDuration = Math.floor(Math.random() * 600) + 60; // 1-10 хвилин
    
    const session = {
      userId: userId,
      startTime: sessionStart,
      endTime: sessionStart + (sessionDuration * 1000),
      pageViews: Math.floor(Math.random() * 5) + 1,
      productsViewed: []
    };
    
    // Додаємо переглянуті товари
    const viewedCount = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < viewedCount; j++) {
      const randomProduct = testProducts[Math.floor(Math.random() * testProducts.length)];
      if (!session.productsViewed.includes(randomProduct)) {
        session.productsViewed.push(randomProduct);
      }
    }
    
    sessions.push(session);
  }
  
  localStorage.setItem(sessionKey, JSON.stringify(sessions));
  
  console.log('✅ Створено сесії:');
  sessions.forEach((session, index) => {
    const duration = Math.floor((session.endTime - session.startTime) / 60000); // хвилини
    console.log(`  ${index + 1}. ${session.userId}: ${duration} хв, ${session.pageViews} сторінок, товари: [${session.productsViewed.join(', ')}]`);
  });
  
  return sessions;
}

// Аналіз статистики
function analyzeLocalAnalytics() {
  console.log('\n📊 Аналіз локальної аналітики...');
  
  // Аналіз переглядів
  const viewsData = localStorage.getItem('comspec_analytics_product_views');
  if (viewsData) {
    const views = JSON.parse(viewsData);
    const totalViews = Object.values(views).reduce((sum, data) => sum + data.views, 0);
    const avgViews = totalViews / Object.keys(views).length;
    
    console.log(`📈 Загальна статистика переглядів:`);
    console.log(`   Всього переглядів: ${totalViews}`);
    console.log(`   Середнє по товару: ${avgViews.toFixed(1)}`);
    console.log(`   Унікальних товарів: ${Object.keys(views).length}`);
  }
  
  // Аналіз сесій
  const sessionsData = localStorage.getItem('comspec_analytics_sessions');
  if (sessionsData) {
    const sessions = JSON.parse(sessionsData);
    const totalSessions = sessions.length;
    const avgPageViews = sessions.reduce((sum, s) => sum + s.pageViews, 0) / totalSessions;
    const avgDuration = sessions.reduce((sum, s) => sum + (s.endTime - s.startTime), 0) / (totalSessions * 60000); // хвилини
    
    console.log(`👥 Загальна статистика сесій:`);
    console.log(`   Всього сесій: ${totalSessions}`);
    console.log(`   Середня тривалість: ${avgDuration.toFixed(1)} хв`);
    console.log(`   Середньо переглядів за сесію: ${avgPageViews.toFixed(1)}`);
  }
}

// Головна функція тестування
function main() {
  console.log('🚀 Початок тестування локальної аналітики...\n');
  
  try {
    // Очищаємо попередні дані
    localStorage.clear();
    
    // Створюємо тестові дані
    const views = simulateProductViews();
    const sessions = simulateUserSessions();
    
    // Тестуємо популярні товари
    const popular = getPopularProducts(4);
    
    // Аналізуємо статистику
    analyzeLocalAnalytics();
    
    // Перевірка роботи з різними лімітами
    console.log('\n🧪 Тестування різних лімітів популярних товарів:');
    [2, 4, 6, 10].forEach(limit => {
      const result = getPopularProducts(limit);
      console.log(`   Ліміт ${limit}: отримано ${result.length} товарів`);
    });
    
    console.log('\n✅ Тестування локальної аналітики завершено успішно!');
    console.log('💡 Дані збережено в localStorage і готові для використання в браузері.');
    
  } catch (error) {
    console.error('\n❌ Помилка тестування:', error);
  }
}

// Запуск при виклику з командного рядка
if (require.main === module) {
  main();
}

module.exports = {
  simulateProductViews,
  getPopularProducts,
  simulateUserSessions,
  analyzeLocalAnalytics
};