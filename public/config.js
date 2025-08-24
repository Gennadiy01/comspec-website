// public/config.js
// Конфігурація для GitHub Pages
// Цей файл опціональний і може бути відсутнім

window.RUNTIME_CONFIG = {
  // GitHub Pages налаштування
  GOOGLE_MAPS_API_KEY: 'AIzaSyBge_xIIrIbmc9Y7hPG5Fqkgkd5H4y5EUI',
  GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxpeWfinzQLOkuKFKlwjLt-cb9c8TTXt4WGq9tFrtYkaZ4Xc5H68-NND-AwTsW9DDDp/exec',
  GOOGLE_SHEETS_ID: '1xJzmIKJ8vv7IY8Or5eiRmXbsfVbQL8ejZNqXP9OnTDY',
  GOOGLE_SHEETS_API_KEY: 'AIzaSyC9sM0GgS6XdzV2H5hqNXahzZ34Jfo58mU',
  
  // 🚀 АНАЛІТИКА v4.0 SESSION TRACKING - PRODUCTION НАЛАШТУВАННЯ (UPDATED)
  ANALYTICS_ENABLED: true,
  ANALYTICS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxoVGsb41EeQ1KOixNhq9qK_fC5z5k7yG6DdpS83gn2hhFCOVOoWuQVyTArM0mLAEs/exec',
  ANALYTICS_FORCE_RELOAD: true,        // 🔄 Примусове оновлення cache
  
  // ⚙️ КОНФІГУРАЦІЯ v4.0 ДЛЯ PRODUCTION
  ANALYTICS_LEVEL: 'PRODUCTION_FULL',      // 🚀 Повна аналітика + оптимізація
  ANALYTICS_SAMPLING_RATE: 50,             // 📊 50% користувачів (баланс функцій/ресурсів)
  ANALYTICS_DEBUG_MODE: false,             // ❌ Без debug на production
  DISABLE_ANALYTICS_LOCALHOST: false,
  
  // GitHub Pages налаштування
  DEBUG_MODE: false,
  ENVIRONMENT: 'github-pages',
  BASE_PATH: '/comspec-website'
};

console.log('📦 Runtime конфігурація завантажена для GitHub Pages v4.0 (UPDATED)');
console.log('🔧 ANALYTICS_SCRIPT_URL:', window.RUNTIME_CONFIG.ANALYTICS_SCRIPT_URL);
console.log('🎛️ ANALYTICS_LEVEL:', window.RUNTIME_CONFIG.ANALYTICS_LEVEL);