// src/config/hosting-detector.js

// Функція для визначення типу хостингу
export const detectHostingType = () => {
  if (typeof window === 'undefined') {
    return 'server'; // SSR середовище
  }
  
  const hostname = window.location.hostname;
  // ✅ ВИПРАВЛЕНО: видалено невикористану змінну protocol
  const port = window.location.port;
  
  // GitHub Pages
  if (hostname.includes('github.io') || hostname.includes('github.com')) {
    return 'github';
  }
  
  // Localhost (розробка)
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('local')) {
    return 'development';
  }
  
  // VPS індикатори
  const vpsIndicators = [
    // Прямий IP доступ
    /^\d+\.\d+\.\d+\.\d+$/.test(hostname),
    // Нестандартні порти
    port && port !== '80' && port !== '443',
    // Типові VPS піддомени
    hostname.includes('vps'),
    hostname.includes('server'),
    hostname.includes('cloud')
  ];
  
  if (vpsIndicators.some(indicator => indicator)) {
    return 'vps';
  }
  
  // Перевірка на можливість використання Node.js (через наявність спеціальних заголовків)
  const hasNodeJsFeatures = () => {
    try {
      // Перевірка чи є процес в window (інколи webpack інжектує)
      if (window.process && window.process.versions && window.process.versions.node) {
        return true;
      }
      
      // Перевірка спеціальних заголовків (якщо доступні)
      if (window.SERVER_INFO && window.SERVER_INFO.nodeSupport) {
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  };
  
  if (hasNodeJsFeatures()) {
    return 'vps';
  }
  
  // За замовчуванням - shared hosting
  return 'shared';
};

// Функція для отримання детальної інформації про хостинг
export const getHostingConfig = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  return {
    hostname,
    protocol,
    port: window.location.port,
    isSecure: protocol === 'https:',
    supportsServiceWorkers: 'serviceWorker' in navigator,
    supportsLocalStorage: typeof Storage !== 'undefined',
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language
  };
};

// Функція для перевірки можливостей хостингу
export const checkHostingCapabilities = () => {
  const type = detectHostingType();
  
  const capabilities = {
    environmentVariables: type === 'vps' || type === 'development',
    runtimeConfig: type === 'shared' || type === 'vps',
    nodeJs: type === 'vps' || type === 'development',
    staticFiles: true,
    cors: type !== 'github', // GitHub Pages має обмеження CORS
    ssl: window.location.protocol === 'https:',
    customDomain: type !== 'github' && type !== 'development'
  };
  
  console.log('🔧 Можливості хостингу:', capabilities);
  return capabilities;
};

// ✅ ВИПРАВЛЕННЯ ESLint помилки: створюємо змінну перед експортом
const hostingDetector = {
  detectHostingType,
  getHostingConfig,
  checkHostingCapabilities
};

// Експортуємо як default
export default hostingDetector;