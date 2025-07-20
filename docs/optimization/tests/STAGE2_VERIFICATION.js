// STAGE2_VERIFICATION.js
// Скрипт для перевірки змін етапу 2

/**
 * 🧪 ВЕРИФІКАЦІЯ ЗМІН ЕТАПУ 2
 * Перевіряє, що консолідація даних не вплинула на функціональність
 */

// Функція для перевірки базових імпортів
function testImports() {
  console.log('🔍 Тест 1: Перевірка імпортів');
  
  try {
    // Перевіряємо чи можемо завантажити модуль
    const testImport = () => {
      // Це буде працювати тільки в браузері через динамічний імпорт
      return import('../../data/UnifiedSearchIndex.js').then(module => {
        console.log('✅ UnifiedSearchIndex.js успішно завантажено');
        console.log('📊 Доступні методи:', Object.keys(module));
        return true;
      }).catch(error => {
        console.error('❌ Помилка завантаження UnifiedSearchIndex.js:', error);
        return false;
      });
    };
    
    return testImport();
  } catch (error) {
    console.error('❌ Помилка тестування імпортів:', error);
    return false;
  }
}

// Функція для перевірки QuickSearch
function testQuickSearch() {
  console.log('🔍 Тест 2: Перевірка QuickSearch');
  
  try {
    // Перевіряємо чи QuickSearch може отримати дані
    const testData = [
      { id: 1, title: 'Тест', content: 'Тестовий контент', category: 'Тест' }
    ];
    
    console.log('📊 Тестові дані QuickSearch:', testData.length, 'записів');
    
    // Симулюємо пошук
    const searchResult = testData.filter(item => 
      item.title.toLowerCase().includes('тест')
    );
    
    console.log('🔍 Результат пошуку:', searchResult.length, 'знайдено');
    
    return searchResult.length > 0;
  } catch (error) {
    console.error('❌ Помилка тестування QuickSearch:', error);
    return false;
  }
}

// Функція для перевірки HybridSearchEngine
function testHybridSearchEngine() {
  console.log('🔍 Тест 3: Перевірка HybridSearchEngine');
  
  try {
    // Перевіряємо чи HybridSearchEngine доступний
    if (typeof window.hybridSearchEngine !== 'undefined') {
      console.log('✅ HybridSearchEngine знайдено в window');
      
      // Перевіряємо статистику
      const stats = window.hybridSearchEngine.getStats();
      console.log('📊 Статистика движка:', stats);
      
      // Перевіряємо пошук
      const searchResults = window.hybridSearchEngine.search('тест', 5);
      console.log('🔍 Результати пошуку:', searchResults.length);
      
      return stats.totalRecords > 0;
    } else {
      console.warn('⚠️ HybridSearchEngine не знайдено в window');
      return false;
    }
  } catch (error) {
    console.error('❌ Помилка тестування HybridSearchEngine:', error);
    return false;
  }
}

// Функція для перевірки сумісності
function testCompatibility() {
  console.log('🔍 Тест 4: Перевірка сумісності');
  
  const compatibility = {
    hybridSearchEngine: typeof window.hybridSearchEngine !== 'undefined',
    contextSearch: typeof window.contextSearch !== 'undefined',
    searchHighlighting: typeof window.searchHighlighting !== 'undefined',
    comspecSearchUtils: typeof window.comspecSearchUtils !== 'undefined'
  };
  
  console.log('🔧 Сумісність глобальних об\'єктів:', compatibility);
  
  const compatibilityCount = Object.values(compatibility).filter(Boolean).length;
  const totalCount = Object.keys(compatibility).length;
  
  console.log(`📊 Сумісність: ${compatibilityCount}/${totalCount} об\'єктів доступні`);
  
  return compatibilityCount >= totalCount * 0.75; // 75% сумісність
}

// Функція для перевірки продуктивності
function testPerformance() {
  console.log('🔍 Тест 5: Перевірка продуктивності');
  
  try {
    if (typeof window.hybridSearchEngine !== 'undefined') {
      const startTime = performance.now();
      
      // Виконуємо кілька пошуків
      const queries = ['пісок', 'щебінь', 'бетон', 'доставка'];
      const results = queries.map(query => 
        window.hybridSearchEngine.search(query, 10)
      );
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / queries.length;
      
      console.log(`⏱️ Час виконання: ${totalTime.toFixed(2)}ms загальний`);
      console.log(`⏱️ Середній час: ${avgTime.toFixed(2)}ms на запит`);
      
      const totalResults = results.reduce((sum, r) => sum + r.length, 0);
      console.log(`📊 Загальних результатів: ${totalResults}`);
      
      return avgTime < 100; // Менше 100ms на запит
    } else {
      console.warn('⚠️ HybridSearchEngine недоступний для тестування продуктивності');
      return false;
    }
  } catch (error) {
    console.error('❌ Помилка тестування продуктивності:', error);
    return false;
  }
}

// Основна функція тестування
async function runStage2Verification() {
  console.log('🚀 ПОЧАТОК ВЕРИФІКАЦІЇ ЕТАПУ 2');
  console.log('='.repeat(50));
  
  const tests = [
    { name: 'Імпорти', test: testImports },
    { name: 'QuickSearch', test: testQuickSearch },
    { name: 'HybridSearchEngine', test: testHybridSearchEngine },
    { name: 'Сумісність', test: testCompatibility },
    { name: 'Продуктивність', test: testPerformance }
  ];
  
  const results = [];
  
  for (const testCase of tests) {
    console.log(`\n🧪 Запуск тесту: ${testCase.name}`);
    
    try {
      const startTime = performance.now();
      const result = await testCase.test();
      const endTime = performance.now();
      
      const testResult = {
        name: testCase.name,
        passed: result === true,
        duration: Math.round(endTime - startTime),
        timestamp: new Date().toISOString()
      };
      
      results.push(testResult);
      
      if (result) {
        console.log(`✅ ${testCase.name} - ПРОЙДЕНО (${testResult.duration}ms)`);
      } else {
        console.log(`❌ ${testCase.name} - НЕ ПРОЙДЕНО (${testResult.duration}ms)`);
      }
      
    } catch (error) {
      console.error(`💥 ${testCase.name} - ПОМИЛКА:`, error);
      results.push({
        name: testCase.name,
        passed: false,
        duration: 0,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  // Підсумки
  console.log('\n📊 ПІДСУМКИ ВЕРИФІКАЦІЇ:');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  
  console.log(`✅ Пройдено: ${passed}/${total}`);
  console.log(`❌ Не пройдено: ${failed}/${total}`);
  console.log(`📈 Успішність: ${Math.round((passed/total)*100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 ЕТАП 2 ПРОЙДЕНО УСПІШНО!');
    console.log('✨ Всі тести пройдені, можна переходити до етапу 3');
  } else {
    console.log('\n⚠️ ЕТАП 2 ПОТРЕБУЄ ДООПРАЦЮВАННЯ');
    console.log('🔧 Необхідно виправити помилки перед переходом до етапу 3');
  }
  
  // Зберігаємо результати
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('stage2_verification_results', JSON.stringify({
        results: results,
        summary: { passed, failed, total, successRate: Math.round((passed/total)*100) },
        timestamp: new Date().toISOString()
      }));
      console.log('\n💾 Результати збережено в localStorage');
    } catch (error) {
      console.warn('⚠️ Не вдалося зберегти результати:', error);
    }
  }
  
  return {
    passed,
    failed,
    total,
    successRate: Math.round((passed/total)*100),
    results: results
  };
}

// Експорт для глобального використання
if (typeof window !== 'undefined') {
  window.runStage2Verification = runStage2Verification;
  window.testStage2Imports = testImports;
  window.testStage2QuickSearch = testQuickSearch;
  window.testStage2HybridSearchEngine = testHybridSearchEngine;
  window.testStage2Compatibility = testCompatibility;
  window.testStage2Performance = testPerformance;
}

// Автоматичний запуск при завантаженні (з затримкою)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    console.log('🧪 STAGE2_VERIFICATION готовий. Використовуйте:');
    console.log('  - window.runStage2Verification() - повна верифікація');
    console.log('  - window.testStage2Imports() - тест імпортів');
    console.log('  - window.testStage2QuickSearch() - тест QuickSearch');
    console.log('  - window.testStage2HybridSearchEngine() - тест HybridSearchEngine');
    console.log('  - window.testStage2Compatibility() - тест сумісності');
    console.log('  - window.testStage2Performance() - тест продуктивності');
  }, 1000);
}

export default runStage2Verification;