// src/utils/testingTools.js - Інструменти для тестування замовлень
// 🔧 PRODUCTION OPTIMIZATION: Умовне завантаження функціоналу

import jsonpService from '../services/JSONPGoogleSheetsService';
import telegramService from '../services/TelegramService';

// Перевірка чи дозволено тестування
const isTestingEnabled = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isManuallyEnabled = typeof window !== 'undefined' && window.COMSPEC_TESTING_ENABLED === true;
  const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');
  const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
  
  return isDevelopment || isManuallyEnabled || isDebugMode || isGitHubPages;
};

// Заглушка для production
const mockFunction = () => {
  console.warn('⚠️ Тестова функція недоступна в production. Увімкніть debug режим.');
  return Promise.resolve({ success: false, error: 'Testing disabled in production' });
};

/**
 * Генератор тестових даних
 */
export const generateTestData = isTestingEnabled() ? 
  (type = 'delivery', testId = Date.now()) => {
    const baseData = {
      name: `Тест ${testId}`,
      phone: `+38050${String(testId).slice(-7)}`,
      email: `test${testId}@example.com`,
      message: `Тестове замовлення ${testId} - ${type}`,
    };

    if (type === 'delivery') {
      return {
        ...baseData,
        name: `Тест Доставка ${testId}`,
        product: 'Щебінь',
        deliveryType: 'delivery',
        address: 'Київ, вул. Тестова, 123',
      };
    }

    if (type === 'pickup') {
      return {
        ...baseData,
        name: `Тест Самовивіз ${testId}`,
        product: 'Пісок',
        deliveryType: 'pickup',
        address: '', // Має бути пустим
        loadingPoint: "ТДВ «Ігнатпільський кар'єр»",
      };
    }

    if (type === 'consultation') {
      return {
        ...baseData,
        name: `Тест Консультація ${testId}`,
        message: `Тестова консультація ${testId}`,
      };
    }

    return baseData;
  } : mockFunction;

/**
 * Швидкий тест замовлення з доставкою
 */
export const testDeliveryOrder = isTestingEnabled() ?
  async (browserName = 'Unknown') => {
    const testId = Date.now();
    console.log(`🚚 Тестування замовлення з доставкою в ${browserName}`);
    
    try {
      const testData = generateTestData('delivery', testId);
      const result = await jsonpService.saveOrder(
        testData, 
        false, 
        `Test-Delivery-${browserName}`
      );
      
      console.log('✅ Результат тесту доставки:', result);
      return { success: true, result, testData };
    } catch (error) {
      console.error('❌ Помилка тесту доставки:', error);
      return { success: false, error, testData: null };
    }
  } : mockFunction;

/**
 * Швидкий тест замовлення самовивозу
 */
export const testPickupOrder = isTestingEnabled() ?
  async (browserName = 'Unknown') => {
    const testId = Date.now();
    console.log(`📦 Тестування замовлення самовивозу в ${browserName}`);
    
    try {
      const testData = generateTestData('pickup', testId);
      
      // КРИТИЧНА ПЕРЕВІРКА: адреса має бути пустою
      if (testData.address && testData.address !== '') {
        console.error('❌ КРИТИЧНА ПОМИЛКА: адреса не пуста для самовивозу!');
        return { success: false, error: 'Address not empty for pickup', testData };
      }
      
      const result = await jsonpService.saveOrder(
        testData, 
        false, 
        `Test-Pickup-${browserName}`
      );
      
      console.log('✅ Результат тесту самовивозу:', result);
      return { success: true, result, testData };
    } catch (error) {
      console.error('❌ Помилка тесту самовивозу:', error);
      return { success: false, error, testData: null };
    }
  } : mockFunction;

/**
 * Швидкий тест консультації
 */
export const testConsultation = isTestingEnabled() ?
  async (browserName = 'Unknown') => {
    const testId = Date.now();
    console.log(`💬 Тестування консультації в ${browserName}`);
    
    try {
      const testData = generateTestData('consultation', testId);
      const result = await jsonpService.saveOrder(
        testData, 
        true, // consultation mode
        `Test-Consultation-${browserName}`
      );
      
      console.log('✅ Результат тесту консультації:', result);
      return { success: true, result, testData };
    } catch (error) {
      console.error('❌ Помилка тесту консультації:', error);
      return { success: false, error, testData: null };
    }
  } : mockFunction;

/**
 * Тест Telegram сервісу
 */
export const testTelegramService = isTestingEnabled() ?
  async () => {
    console.log('🤖 Тестування Telegram сервісу');
    
    if (!telegramService.isEnabled()) {
      console.warn('⚠️ Telegram сервіс вимкнений');
      return { success: false, error: 'Telegram service disabled' };
    }
    
    try {
      const testData = generateTestData('delivery', 'TG-TEST');
      const telegramData = {
        orderId: 'TEST-TG-' + Date.now(),
        manager: 'Test Manager',
        orderData: testData,
        isConsultation: false,
        managerTelegramChatId: telegramService.chatId
      };
      
      const result = await telegramService.sendOrderNotification(telegramData);
      console.log('✅ Результат Telegram тесту:', result);
      return { success: true, result };
    } catch (error) {
      console.error('❌ Помилка Telegram тесту:', error);
      return { success: false, error };
    }
  } : mockFunction;

/**
 * Комплексний тест всіх типів замовлень
 */
export const runFullTest = isTestingEnabled() ?
  async (browserName = 'Unknown') => {
    console.log(`🧪 Запуск комплексного тесту в ${browserName}`);
    
    const results = {
      browser: browserName,
      timestamp: new Date().toISOString(),
      tests: {}
    };
    
    // Тест доставки
    console.log('\n--- Тест 1: Доставка ---');
    results.tests.delivery = await testDeliveryOrder(browserName);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Пауза між тестами
    
    // Тест самовивозу
    console.log('\n--- Тест 2: Самовивіз ---');
    results.tests.pickup = await testPickupOrder(browserName);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Пауза між тестами
    
    // Тест консультації
    console.log('\n--- Тест 3: Консультація ---');
    results.tests.consultation = await testConsultation(browserName);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Пауза між тестами
    
    // Тест Telegram (один раз)
    if (browserName === 'Chrome' || browserName === 'Unknown') {
      console.log('\n--- Тест 4: Telegram ---');
      results.tests.telegram = await testTelegramService();
    }
    
    console.log('\n🎯 Результати комплексного тесту:', results);
    
    // Збереження результатів в localStorage для аналізу
    try {
      const existingResults = JSON.parse(localStorage.getItem('comspec_test_results') || '[]');
      existingResults.push(results);
      localStorage.setItem('comspec_test_results', JSON.stringify(existingResults));
      console.log('💾 Результати збережено в localStorage');
    } catch (error) {
      console.warn('⚠️ Не вдалося зберегти результати:', error);
    }
    
    return results;
  } : mockFunction;

/**
 * Детекція поточного браузера
 */
export const detectBrowser = () => {
  if (typeof navigator === 'undefined') return 'Unknown';
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('chrome') && !userAgent.includes('edge')) {
    return 'Chrome';
  } else if (userAgent.includes('firefox')) {
    return 'Firefox';
  } else if (userAgent.includes('edge') || userAgent.includes('edg/')) {
    return 'Edge';
  } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    return 'Safari';
  } else {
    return 'Unknown';
  }
};

// Ініціалізація та логування
if (!isTestingEnabled()) {
  console.log('🚫 Тестові інструменти вимкнені в production режимі');
  console.log('💡 Щоб увімкнути: window.COMSPEC_TESTING_ENABLED = true або ?debug=true');
  
  // Додаємо функцію увімкнення до window
  if (typeof window !== 'undefined') {
    window.enableTesting = () => {
      window.COMSPEC_TESTING_ENABLED = true;
      console.log('✅ Тестування увімкнено! Перезавантажте сторінку.');
    };
    console.log('📋 Команда для увімкнення: window.enableTesting()');
  }
} else {
  console.log('🧪 Тестові інструменти активні (development/debug режим)');
  
  // Додаємо функції до window для зручності тестування
  if (typeof window !== 'undefined') {
    window.testingTools = {
      generateTestData,
      testDeliveryOrder,
      testPickupOrder,
      testConsultation,
      testTelegramService,
      runFullTest,
      detectBrowser,
      
      // Швидкі команди
      quickDeliveryTest: () => testDeliveryOrder(detectBrowser()),
      quickPickupTest: () => testPickupOrder(detectBrowser()),
      quickConsultationTest: () => testConsultation(detectBrowser()),
      fullTest: () => runFullTest(detectBrowser()),
      
      // Очищення результатів
      clearTestResults: () => {
        localStorage.removeItem('comspec_test_results');
        console.log('🗑️ Результати тестів очищено');
      },
      
      // Перегляд результатів
      showTestResults: () => {
        const results = JSON.parse(localStorage.getItem('comspec_test_results') || '[]');
        console.table(results.map(r => ({
          browser: r.browser,
          timestamp: r.timestamp,
          delivery: r.tests.delivery?.success ? '✅' : '❌',
          pickup: r.tests.pickup?.success ? '✅' : '❌',
          consultation: r.tests.consultation?.success ? '✅' : '❌',
          telegram: r.tests.telegram?.success ? '✅' : r.tests.telegram ? '❌' : '⏸️'
        })));
        return results;
      }
    };
    
    console.log('🧪 Тестові інструменти доступні в window.testingTools');
    console.log('📋 Команди:');
    console.log('  testingTools.quickDeliveryTest() - швидкий тест доставки');
    console.log('  testingTools.quickPickupTest() - швидкий тест самовивозу'); 
    console.log('  testingTools.quickConsultationTest() - швидкий тест консультації');
    console.log('  testingTools.fullTest() - комплексний тест');
    console.log('  testingTools.showTestResults() - показати результати');
    console.log('  testingTools.clearTestResults() - очистити результати');
  }
}

const testingTools = {
  generateTestData,
  testDeliveryOrder,
  testPickupOrder,
  testConsultation,
  testTelegramService,
  runFullTest,
  detectBrowser
};

export default testingTools;