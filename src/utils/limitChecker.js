// src/utils/limitChecker.js - Перевірка лімітів Google Apps Script
// 🔧 PRODUCTION OPTIMIZATION: Умовне завантаження функціоналу

import jsonpService from '../services/JSONPGoogleSheetsService';

// Перевірка чи дозволено limit checking
const isLimitCheckingEnabled = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isManuallyEnabled = typeof window !== 'undefined' && window.COMSPEC_LIMIT_CHECKING_ENABLED === true;
  const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');
  const isAdminMode = typeof window !== 'undefined' && window.location.search.includes('admin=true');
  
  return isDevelopment || isManuallyEnabled || isDebugMode || isAdminMode;
};

// Заглушка для production
const mockFunction = () => {
  console.warn('⚠️ Перевірка лімітів недоступна в production. Увімкніть debug режим.');
  return Promise.resolve({ available: true, message: 'Limit checking disabled in production' });
};

/**
 * Перевірка стану лімітів Google Apps Script
 */
export const checkLimits = isLimitCheckingEnabled() ?
  async () => {
    console.log('📊 Перевірка лімітів Google Apps Script...');
    
    try {
      const result = await jsonpService.testConnection();
      
      if (result.success) {
        console.log('✅ Підключення до Google Apps Script працює');
        console.log('📊 Статус лімітів:', result.limits || 'Інформація недоступна');
        return { 
          available: true, 
          message: 'Ліміти в нормі', 
          details: result.limits 
        };
      } else {
        console.warn('⚠️ Проблеми з підключенням:', result);
        return { 
          available: false, 
          message: result.error || 'Невідома помилка' 
        };
      }
    } catch (error) {
      console.error('❌ Помилка перевірки лімітів:', error);
      
      // Аналіз типів помилок
      if (error.message.includes('OVER_QUERY_LIMIT')) {
        return {
          available: false,
          message: 'Перевищено добовий ліміт запитів Google Apps Script',
          recommendation: 'Очікуйте скидання лімітів о 00:00 PST/PDT'
        };
      } else if (error.message.includes('Service invoked too many times')) {
        return {
          available: false,
          message: 'Занадто багато викликів сервісу',
          recommendation: 'Зробіть паузу на кілька хвилин'
        };
      } else if (error.message.includes('Таймаут')) {
        return {
          available: false,
          message: 'Таймаут підключення до Google Apps Script',
          recommendation: 'Перевірте інтернет підключення'
        };
      } else {
        return {
          available: false,
          message: error.message || 'Невідома помилка',
          recommendation: 'Перевірте конфігурацію сервісу'
        };
      }
    }
  } : mockFunction;

/**
 * Швидка перевірка доступності тестування
 */
export const isTestingAvailable = isLimitCheckingEnabled() ?
  async () => {
    const result = await checkLimits();
    return result.available;
  } : () => Promise.resolve(true);

/**
 * Очікування доступності з ретраями
 */
export const waitForAvailability = isLimitCheckingEnabled() ?
  async (maxRetries = 5, retryDelay = 5000) => {
    console.log(`⏳ Очікування доступності сервісу (${maxRetries} спроб)...`);
    
    for (let i = 1; i <= maxRetries; i++) {
      console.log(`🔄 Спроба ${i}/${maxRetries}...`);
      
      const result = await checkLimits();
      
      if (result.available) {
        console.log('✅ Сервіс доступний для тестування!');
        return true;
      }
      
      if (i < maxRetries) {
        console.log(`⏳ Пауза ${retryDelay/1000}с перед наступною спробою...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    console.log('❌ Сервіс недоступний після всіх спроб');
    return false;
  } : () => Promise.resolve(true);

/**
 * Показ поточного часу та часу скидання лімітів
 */
export const showLimitResetTime = isLimitCheckingEnabled() ?
  () => {
    const now = new Date();
    const pstTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
    const nextReset = new Date(pstTime);
    nextReset.setHours(24, 0, 0, 0); // Наступний день о 00:00 PST
    
    console.log('🕒 Поточний час:');
    console.log(`   Місцевий: ${now.toLocaleString()}`);
    console.log(`   PST/PDT: ${pstTime.toLocaleString()}`);
    console.log(`🔄 Наступне скидання лімітів: ${nextReset.toLocaleString()}`);
    
    const hoursUntilReset = Math.ceil((nextReset - pstTime) / (1000 * 60 * 60));
    console.log(`⏰ До скидання: ~${hoursUntilReset} годин`);
    
    return {
      currentTime: now,
      pstTime: pstTime,
      nextReset: nextReset,
      hoursUntilReset: hoursUntilReset
    };
  } : () => ({ message: 'Limit checking disabled' });

// Ініціалізація та логування
if (!isLimitCheckingEnabled()) {
  console.log('🚫 Перевірка лімітів вимкнена в production режимі');
  console.log('💡 Щоб увімкнути: window.COMSPEC_LIMIT_CHECKING_ENABLED = true або ?debug=true');
  
  // Додаємо функцію увімкнення до window
  if (typeof window !== 'undefined') {
    window.enableLimitChecking = () => {
      window.COMSPEC_LIMIT_CHECKING_ENABLED = true;
      console.log('✅ Перевірка лімітів увімкнена! Перезавантажте сторінку.');
    };
    console.log('📋 Команда для увімкнення: window.enableLimitChecking()');
  }
} else {
  console.log('📊 Перевірка лімітів активна (development/debug режим)');
  
  // Додаємо функції до window
  if (typeof window !== 'undefined') {
    window.limitChecker = {
      checkLimits,
      isTestingAvailable,
      waitForAvailability,
      showLimitResetTime,
      
      // Швидкі команди
      check: checkLimits,
      wait: waitForAvailability,
      time: showLimitResetTime
    };
    
    console.log('📊 Перевірка лімітів доступна в window.limitChecker');
    console.log('📋 Команди:');
    console.log('  limitChecker.check() - перевірити ліміти');
    console.log('  limitChecker.wait() - очікувати доступності');
    console.log('  limitChecker.time() - показати час скидання');
  }
}

export default {
  checkLimits,
  isTestingAvailable,
  waitForAvailability,
  showLimitResetTime
};