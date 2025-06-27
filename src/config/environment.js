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

// Конфігурації для різних хостингів
const configs = {
  development: {
    // ✅ ПІДЛАШТОВАНО під існуючі змінні в .env.local
    MAPS_API_KEY: getEnvVar('REACT_APP_GOOGLE_MAPS_API_KEY', 'AIzaSyBge_xIIrIbmc9Y7hPG5Fqkgkd5H4y5EUI'),
    SCRIPT_URL: getEnvVar('REACT_APP_GOOGLE_SCRIPT_URL', 'https://script.google.com/macros/s/AKfycbz3XE8u5O2Q9ez4OpKcyPB6TtrGp0ul6hPJsud4Dethj0fA2ixU7t4XCwJefl4EIgAd/exec'),
    SHEETS_ID: getEnvVar('REACT_APP_GOOGLE_SHEETS_ID', '1xJzmIKJ8vv7IY8Or5eiRmXbsfVbQL8ejZNqXP9OnTDY'),
    SHEETS_API_KEY: getEnvVar('REACT_APP_GOOGLE_SHEETS_API_KEY', 'AIzaSyC9sM0GgS6XdzV2H5hqNXahzZ34Jfo58mU'),
    
    // Стандартні назви для сумісності з компонентами
    GOOGLE_MAPS_API_KEY: getEnvVar('REACT_APP_GOOGLE_MAPS_API_KEY', 'AIzaSyBge_xIIrIbmc9Y7hPG5Fqkgkd5H4y5EUI'),
    GOOGLE_SCRIPT_URL: getEnvVar('REACT_APP_GOOGLE_SCRIPT_URL', 'https://script.google.com/macros/s/AKfycbz3XE8u5O2Q9ez4OpKcyPB6TtrGp0ul6hPJsud4Dethj0fA2ixU7t4XCwJefl4EIgAd/exec'),
    GOOGLE_SHEETS_ID: getEnvVar('REACT_APP_GOOGLE_SHEETS_ID', '1xJzmIKJ8vv7IY8Or5eiRmXbsfVbQL8ejZNqXP9OnTDY'),
    GOOGLE_SHEETS_API_KEY: getEnvVar('REACT_APP_GOOGLE_SHEETS_API_KEY', 'AIzaSyC9sM0GgS6XdzV2H5hqNXahzZ34Jfo58mU')
  },
  
  github: {
    // ✅ Використовує ті самі назви що і в .env.local
    MAPS_API_KEY: 'AIzaSyBge_xIIrIbmc9Y7hPG5Fqkgkd5H4y5EUI',
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbz3XE8u5O2Q9ez4OpKcyPB6TtrGp0ul6hPJsud4Dethj0fA2ixU7t4XCwJefl4EIgAd/exec',
    SHEETS_ID: '1xJzmIKJ8vv7IY8Or5eiRmXbsfVbQL8ejZNqXP9OnTDY',
    SHEETS_API_KEY: 'AIzaSyC9sM0GgS6XdzV2H5hqNXahzZ34Jfo58mU',
    
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
    GOOGLE_MAPS_API_KEY: null,
    GOOGLE_SCRIPT_URL: null,
    GOOGLE_SHEETS_ID: null,
    GOOGLE_SHEETS_API_KEY: null
  }
};

// Головна функція отримання конфігурації
const getConfig = () => {
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
      
      const runtimeConfig = getRuntimeConfig();
      if (runtimeConfig && !config.MAPS_API_KEY) {
        config = { ...config, ...runtimeConfig };
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

// Валідація конфігурації
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

// Безпечне логування
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

// ✅ ДОДАНО: Функція для сумісності з існуючими компонентами
export const getEnvironmentConfig = () => {
  return getConfig();
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

// Глобальний доступ для налагодження
if (typeof window !== 'undefined') {
  window.COMSPEC_DEBUG = {
    config: config,
    logConfig: () => logConfig(config),
    validateConfig: () => validateConfig(config),
    detectHostingType,
    getHostingConfig,
    getConfig,
    getEnvironmentConfig
  };
}

export default config;
export { getConfig };