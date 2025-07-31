// src/config/environment.js
import { detectHostingType, getHostingConfig } from './hosting-detector';

// Функція для безпечного отримання environment змінних
const getEnvVar = (name, fallback = null) => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      return process.env[name];
    }
    
    if (typeof window !== 'undefined' && window.process && window.process.env && window.process.env[name]) {
      return window.process.env[name];
    }
    
    return fallback;
  } catch (error) {
    console.warn(`Не вдалося отримати змінну ${name}:`, error);
    return fallback;
  }
};

// Функція для отримання runtime конфігурації
const getRuntimeConfig = () => {
  try {
    // 🆕 ДОДАНО: Перевірка universal config першим
    if (typeof window !== 'undefined' && window.COMSPEC_UNIVERSAL && window.COMSPEC_UNIVERSAL.ready) {
      console.log('🌐 Використано UNIVERSAL CONFIG');
      return window.COMSPEC_UNIVERSAL.config;
    }
    
    if (typeof window !== 'undefined' && window.RUNTIME_CONFIG) {
      console.log('📦 Завантажено RUNTIME_CONFIG');
      return window.RUNTIME_CONFIG;
    }
    
    if (typeof window !== 'undefined' && window.COMSPEC_CONFIG) {
      console.log('📦 Завантажено COMSPEC runtime конфігурацію');
      return window.COMSPEC_CONFIG;
    }
    
    if (typeof window !== 'undefined' && window.APP_CONFIG) {
      console.log('📦 Завантажено APP runtime конфігурацію');
      return window.APP_CONFIG;
    }
    
    return null;
  } catch (error) {
    console.warn('Помилка завантаження runtime конфігурації:', error);
    return null;
  }
};

// 🆕 ДОДАНО: Функція для конвертації universal config у формат який очікують існуючі компоненти
const convertUniversalConfig = (universalConfig) => {
  if (!universalConfig) return null;
  
  console.log('🔄 Конвертація universal config в існуючий формат...');
  
  return {
    // Існуючі назви в вашій системі
    MAPS_API_KEY: universalConfig.GOOGLE_MAPS?.API_KEY,
    SCRIPT_URL: universalConfig.GOOGLE_SHEETS?.SCRIPT_URL,
    SHEETS_ID: universalConfig.GOOGLE_SHEETS?.SPREADSHEET_ID,
    SHEETS_API_KEY: universalConfig.GOOGLE_SHEETS?.API_KEY,
    
    // Стандартні назви для існуючих компонентів
    GOOGLE_MAPS_API_KEY: universalConfig.GOOGLE_MAPS?.API_KEY,
    GOOGLE_SCRIPT_URL: universalConfig.GOOGLE_SHEETS?.SCRIPT_URL,
    GOOGLE_SHEETS_ID: universalConfig.GOOGLE_SHEETS?.SPREADSHEET_ID,
    GOOGLE_SHEETS_API_KEY: universalConfig.GOOGLE_SHEETS?.API_KEY,
    
    // Додаткові поля з universal config
    DEBUG_MODE: universalConfig.DEBUG || false,
    ENVIRONMENT: universalConfig.ENVIRONMENT || 'unknown',
    META: universalConfig.META || {}
  };
};

// Конфігурації для різних хостингів (ЗБЕРЕЖЕНО ВАШ КОД)
const configs = {
  development: {
    // ✅ ПІДЛАШТОВАНО під існуючі змінні в .env.local
    MAPS_API_KEY: getEnvVar('REACT_APP_GOOGLE_MAPS_API_KEY', 'AIzaSyBge_xIIrIbmc9Y7hPG5Fqkgkd5H4y5EUI'),
    SCRIPT_URL: getEnvVar('REACT_APP_GOOGLE_SCRIPT_URL', 'https://script.google.com/macros/s/AKfycbxpeWfinzQLOkuKFKlwjLt-cb9c8TTXt4WGq9tFrtYkaZ4Xc5H68-NND-AwTsW9DDDp/exec'),
    SHEETS_ID: getEnvVar('REACT_APP_GOOGLE_SHEETS_ID', '1xJzmIKJ8vv7IY8Or5eiRmXbsfVbQL8ejZNqXP9OnTDY'),
    SHEETS_API_KEY: getEnvVar('REACT_APP_GOOGLE_SHEETS_API_KEY', 'AIzaSyC9sM0GgS6XdzV2H5hqNXahzZ34Jfo58mU'),
    
    // 🆕 TELEGRAM КОНФІГУРАЦІЯ
    TELEGRAM_BOT_TOKEN: getEnvVar('REACT_APP_TELEGRAM_BOT_TOKEN', '8472229536:AAEquKfaV_nIa5opQAbb6Io2RSm3HRRFgO4'),
    TELEGRAM_CHAT_ID: getEnvVar('REACT_APP_TELEGRAM_CHAT_ID', null),
    TELEGRAM_ENABLED: getEnvVar('REACT_APP_TELEGRAM_ENABLED', 'true') === 'true',
    TELEGRAM_API_URL: 'https://api.telegram.org/bot',
    TELEGRAM_TIMEOUT: 10000,
    
    // 🆕 МАПІНГ МЕНЕДЖЕРІВ (ТИМЧАСОВИЙ - буде замінено на Google Sheets)
    TELEGRAM_MANAGERS: {
      "Ігор Калінкін": null,
      "Олександра Морожик": null,
      "Вікторія Лінкевич": null,
      "Ірина Єрмак": null,
      "Анна Гурська": null,
      "Тетяна Горобівська": null,
      "Володимир Максимук": null,
      "Геннадій Дикий": "1559533342"
    },
    
    // Стандартні назви для сумісності з компонентами
    GOOGLE_MAPS_API_KEY: getEnvVar('REACT_APP_GOOGLE_MAPS_API_KEY', 'AIzaSyBge_xIIrIbmc9Y7hPG5Fqkgkd5H4y5EUI'),
    GOOGLE_SCRIPT_URL: getEnvVar('REACT_APP_GOOGLE_SCRIPT_URL', 'https://script.google.com/macros/s/AKfycbxpeWfinzQLOkuKFKlwjLt-cb9c8TTXt4WGq9tFrtYkaZ4Xc5H68-NND-AwTsW9DDDp/exec'),
    GOOGLE_SHEETS_ID: getEnvVar('REACT_APP_GOOGLE_SHEETS_ID', '1xJzmIKJ8vv7IY8Or5eiRmXbsfVbQL8ejZNqXP9OnTDY'),
    GOOGLE_SHEETS_API_KEY: getEnvVar('REACT_APP_GOOGLE_SHEETS_API_KEY', 'AIzaSyC9sM0GgS6XdzV2H5hqNXahzZ34Jfo58mU')
  },
  
  github: {
    // ✅ Використовує ті самі назви що і в .env.local
    MAPS_API_KEY: 'AIzaSyBge_xIIrIbmc9Y7hPG5Fqkgkd5H4y5EUI',
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbz3XE8u5O2Q9ez4OpKcyPB6TtrGp0ul6hPJsud4Dethj0fA2ixU7t4XCwJefl4EIgAd/exec',
    SHEETS_ID: '1xJzmIKJ8vv7IY8Or5eiRmXbsfVbQL8ejZNqXP9OnTDY',
    SHEETS_API_KEY: 'AIzaSyC9sM0GgS6XdzV2H5hqNXahzZ34Jfo58mU',
    
    // 🆕 TELEGRAM КОНФІГУРАЦІЯ ДЛЯ GITHUB PAGES
    TELEGRAM_BOT_TOKEN: '8472229536:AAEquKfaV_nIa5opQAbb6Io2RSm3HRRFgO4',
    TELEGRAM_CHAT_ID: null,
    TELEGRAM_ENABLED: true,
    TELEGRAM_API_URL: 'https://api.telegram.org/bot',
    TELEGRAM_TIMEOUT: 10000,
    
    // 🆕 МАПІНГ МЕНЕДЖЕРІВ (GITHUB PAGES)
    TELEGRAM_MANAGERS: {
      "Ігор Калінкін": null,
      "Олександра Морожик": null,
      "Вікторія Лінкевич": null,
      "Ірина Єрмак": null,
      "Анна Гурська": null,
      "Тетяна Горобівська": null,
      "Володимир Максимук": null,
      "Геннадій Дикий": "1559533342"
    },
    
    // Стандартні назви для існуючих файлів
    GOOGLE_MAPS_API_KEY: 'AIzaSyBge_xIIrIbmc9Y7hPG5Fqkgkd5H4y5EUI',
    GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbz3XE8u5O2Q9ez4OpKcyPB6TtrGp0ul6hPJsud4Dethj0fA2ixU7t4XCwJefl4EIgAd/exec',
    GOOGLE_SHEETS_ID: '1xJzmIKJ8vv7IY8Or5eiRmXbsfVbQL8ejZNqXP9OnTDY',
    GOOGLE_SHEETS_API_KEY: 'AIzaSyC9sM0GgS6XdzV2H5hqNXahzZ34Jfo58mU'
  },
  
  shared: {
    MAPS_API_KEY: null,
    SCRIPT_URL: null,
    SHEETS_ID: null,
    SHEETS_API_KEY: null,
    TELEGRAM_BOT_TOKEN: null,
    TELEGRAM_CHAT_ID: null,
    TELEGRAM_ENABLED: false,
    TELEGRAM_API_URL: 'https://api.telegram.org/bot',
    TELEGRAM_TIMEOUT: 10000,
    GOOGLE_MAPS_API_KEY: null,
    GOOGLE_SCRIPT_URL: null,
    GOOGLE_SHEETS_ID: null,
    GOOGLE_SHEETS_API_KEY: null
  },
  
  vps: {
    MAPS_API_KEY: null,
    SCRIPT_URL: null,
    SHEETS_ID: null,
    SHEETS_API_KEY: null,
    TELEGRAM_BOT_TOKEN: null,
    TELEGRAM_CHAT_ID: null,
    TELEGRAM_ENABLED: false,
    TELEGRAM_API_URL: 'https://api.telegram.org/bot',
    TELEGRAM_TIMEOUT: 10000,
    GOOGLE_MAPS_API_KEY: null,
    GOOGLE_SCRIPT_URL: null,
    GOOGLE_SHEETS_ID: null,
    GOOGLE_SHEETS_API_KEY: null
  }
};

// Головна функція отримання конфігурації (МОДИФІКОВАНА)
const getConfig = () => {
  // 🆕 ДОДАНО: Спочатку перевіряємо universal config
  const runtimeConfig = getRuntimeConfig();
  if (runtimeConfig && typeof window !== 'undefined' && window.COMSPEC_UNIVERSAL) {
    const convertedConfig = convertUniversalConfig(runtimeConfig);
    if (convertedConfig) {
      console.log('✅ Використано конвертований universal config');
      
      // Додаємо додаткові поля які очікує ваша система
      convertedConfig.ENVIRONMENT = window.COMSPEC_UNIVERSAL.hosting?.type || 'universal';
      convertedConfig.DEBUG_MODE = convertedConfig.DEBUG_MODE || (window.COMSPEC_UNIVERSAL.hosting?.type === 'development');
      convertedConfig.HOSTING_INFO = window.COMSPEC_UNIVERSAL.hosting || {};
      
      return convertedConfig;
    }
  }
  
  // 🔄 ЗБЕРЕЖЕНО: Ваша існуюча логіка як fallback
  const hostingType = detectHostingType();
  const hostingConfig = getHostingConfig();
  
  console.log(`🌐 Виявлено тип хостингу: ${hostingType}`);
  
  let config = {};
  
  switch (hostingType) {
    case 'development':
      config = configs.development;
      console.log('🔧 Використано development конфігурацію');
      break;
      
    case 'vps':
    case 'dedicated':
      config = {
        MAPS_API_KEY: getEnvVar('REACT_APP_GOOGLE_MAPS_API_KEY'),
        SCRIPT_URL: getEnvVar('REACT_APP_GOOGLE_SCRIPT_URL'),
        SHEETS_ID: getEnvVar('REACT_APP_GOOGLE_SHEETS_ID'),
        SHEETS_API_KEY: getEnvVar('REACT_APP_GOOGLE_SHEETS_API_KEY'),
        // Стандартні назви
        GOOGLE_MAPS_API_KEY: getEnvVar('REACT_APP_GOOGLE_MAPS_API_KEY'),
        GOOGLE_SCRIPT_URL: getEnvVar('REACT_APP_GOOGLE_SCRIPT_URL'),
        GOOGLE_SHEETS_ID: getEnvVar('REACT_APP_GOOGLE_SHEETS_ID'),
        GOOGLE_SHEETS_API_KEY: getEnvVar('REACT_APP_GOOGLE_SHEETS_API_KEY')
      };
      
      const fallbackRuntimeConfig = getRuntimeConfig();
      if (fallbackRuntimeConfig && !config.MAPS_API_KEY) {
        config = { ...config, ...fallbackRuntimeConfig };
        console.log('🔄 Використано runtime конфігурацію як fallback');
      }
      
      if (!config.MAPS_API_KEY) {
        config = { ...config, ...configs.github };
        console.log('⚠️ Використано hardcoded конфігурацію як fallback');
      }
      break;
      
    case 'shared':
      const runtime = getRuntimeConfig();
      if (runtime) {
        config = runtime;
        console.log('✅ Використано runtime конфігурацію');
      } else {
        config = configs.github;
        console.log('⚠️ Runtime конфігурація недоступна, використано hardcoded');
      }
      break;
      
    case 'github':
    default:
      config = configs.github;
      console.log('📄 Використано GitHub Pages конфігурацію');
      break;
  }
  
  config.ENVIRONMENT = hostingType;
  config.DEBUG_MODE = hostingType === 'development' || getEnvVar('REACT_APP_DEBUG_MODE') === 'true';
  config.HOSTING_INFO = hostingConfig;
  
  return config;
};

// Валідація конфігурації (ЗБЕРЕЖЕНО ВАШ КОД)
export const validateConfig = (config) => {
  const required = ['GOOGLE_SCRIPT_URL', 'GOOGLE_MAPS_API_KEY'];
  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
    console.error('❌ Відсутні обов\'язкові конфігураційні змінні:', missing);
    return false;
  }
  
  console.log('✅ Конфігурація валідна');
  return true;
};

// Безпечне логування (ЗБЕРЕЖЕНО ВАШ КОД)
export const logConfig = (config) => {
  const safeConfig = Object.entries(config).reduce((acc, [key, value]) => {
    if (key.includes('KEY') || key.includes('URL')) {
      acc[key] = value ? `${value.substring(0, 10)}...` : 'ВІДСУТНІЙ';
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
  
  console.log('📋 Конфігурація COMSPEC:', safeConfig);
  return safeConfig;
};

// ✅ ЗБЕРЕЖЕНО: Функція для сумісності з існуючими компонентами
export const getEnvironmentConfig = () => {
  return getConfig();
};

// 🆕 ДОДАНО: Функція для чекання universal config
export const waitForUniversalConfig = (timeout = 3000) => {
  return new Promise((resolve) => {
    // Якщо вже готово
    if (window.COMSPEC_UNIVERSAL?.ready) {
      resolve(getConfig());
      return;
    }
    
    // Слухаємо подію готовності
    const handleConfigReady = () => {
      cleanup();
      resolve(getConfig());
    };
    
    // Timeout
    const timeoutId = setTimeout(() => {
      cleanup();
      console.log('⏰ Timeout очікування universal config, використовуємо fallback');
      resolve(getConfig());
    }, timeout);
    
    // Cleanup
    const cleanup = () => {
      window.removeEventListener('comspec-config-ready', handleConfigReady);
      clearTimeout(timeoutId);
    };
    
    // Слухач події
    window.addEventListener('comspec-config-ready', handleConfigReady);
  });
};

// Ініціалізація конфігурації
const config = getConfig();

// Валідація при ініціалізації
if (!validateConfig(config)) {
  console.error('🚨 Критична помилка конфігурації. Деякі функції можуть не працювати.');
}

// Логування конфігурації (тільки в development)
if (config.DEBUG_MODE) {
  logConfig(config);
}

// Глобальний доступ для налагодження (РОЗШИРЕНО)
if (typeof window !== 'undefined') {
  window.COMSPEC_DEBUG = {
    config: config,
    logConfig: () => logConfig(config),
    validateConfig: () => validateConfig(config),
    detectHostingType,
    getHostingConfig,
    getConfig,
    getEnvironmentConfig,
    // 🆕 ДОДАНО: Нові debug функції
    waitForUniversalConfig,
    convertUniversalConfig,
    hasUniversalConfig: () => !!(window.COMSPEC_UNIVERSAL?.ready),
    getUniversalConfig: () => window.COMSPEC_UNIVERSAL
  };
}

export default config;
export { getConfig };