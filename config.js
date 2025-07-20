// public/config.js
// Цей файл використовується тільки на shared хостингу (Hostinger Business, MiroHost, FreeHost)
// Для localhost та VPS він ігнорується

// ВАЖЛИВО: Цей файл НЕ включається в Git репозиторій
// Створюється вручну на кожному shared хостингу

window.COMSPEC_CONFIG = {
  // Замініть на ваші реальні значення для кожного хостингу
  GOOGLE_MAPS_API_KEY: 'AIzaSyBge_xIIrIbmc9Y7hPG5Fqkgkd5H4y5EUI',
  GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbx_7-cbRLyuxMeMFwVzuYJWkY8Y_SpfMsNjvnnrNy08U3Ntz6Z0MXf1ITu9qc5sVQRP/exec',
  GOOGLE_SHEETS_ID: '1xJzmIKJ8vv7IY8Or5eiRmXbsfVbQL8ejZNqXP9OnTDY',
  GOOGLE_SHEETS_API_KEY: 'AIzaSyC9sM0GgS6XdzV2H5hqNXahzZ34Jfo58mU',
  
  // Додаткові налаштування
  DEBUG_MODE: false,
  ENVIRONMENT: 'production'
};

// Додаткова інформація про хостинг (опціонально)
window.SERVER_INFO = {
  provider: 'hostinger', // або 'mirohost', 'freehost'
  plan: 'business',
  nodeSupport: false,
  phpSupport: true,
  sslSupport: true
};

console.log('📦 COMSPEC Runtime конфігурація завантажена для shared хостингу');