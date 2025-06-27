// src/config/hosting-detector.js - ВИПРАВЛЕНА ВЕРСІЯ

/**
 * Функція для визначення типу хостингу
 * Повертає стандартизовані значення які використовуються в environment.js
 */
export const detectHostingType = () => {
  if (typeof window === 'undefined') {
    return 'server'; // SSR середовище
  }
  
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  console.log('🔍 Detecting hosting type for:', { hostname, port });
  
  // GitHub Pages - ВИПРАВЛЕНО для відповідності environment.js
  if (hostname.includes('github.io') || hostname.includes('github.com')) {
    console.log('🐙 Detected: GitHub Pages');
    return 'github'; // ← ВИПРАВЛЕНО: було 'github-pages'
  }
  
  // Netlify
  if (hostname.includes('netlify.app') || hostname.includes('netlify.com')) {
    console.log('🌐 Detected: Netlify');
    return 'netlify';
  }
  
  // Vercel
  if (hostname.includes('vercel.app') || hostname.includes('vercel.com')) {
    console.log('▲ Detected: Vercel');
    return 'vercel';
  }
  
  // Localhost (розробка)
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('local')) {
    console.log('🏠 Detected: Localhost/Development');
    return 'development'; // ← ВИПРАВЛЕНО: було 'localhost'
  }
  
  // VPS індикатори
  const vpsIndicators = [
    // Прямий IP доступ
    /^\d+\.\d+\.\d+\.\d+$/.test(hostname),
    // Нестандартні порти
    port && port !== '80' && port !== '443' && port !== '3000',
    // Типові VPS піддомени
    hostname.includes('vps'),
    hostname.includes('server'),
    hostname.includes('cloud'),
    hostname.includes('aws'),
    hostname.includes('digitalocean'),
    hostname.includes('linode')
  ];
  
  if (vpsIndicators.some(indicator => indicator)) {
    console.log('🖥️ Detected: VPS');
    return 'vps';
  }
  
  // Перевірка на можливість використання Node.js
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
    console.log('⚙️ Detected: VPS (Node.js features)');
    return 'vps';
  }
  
  // За замовчуванням - shared hosting
  console.log('🌍 Detected: Shared hosting (fallback)');
  return 'shared';
};

/**
 * Функція для отримання детальної інформації про хостинг
 */
export const getHostingConfig = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const hostingType = detectHostingType();
  
  const config = {
    hostname,
    protocol,
    port: window.location.port,
    hostingType,
    isSecure: protocol === 'https:',
    supportsServiceWorkers: 'serviceWorker' in navigator,
    supportsLocalStorage: typeof Storage !== 'undefined',
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    timestamp: new Date().toISOString()
  };
  
  console.log('📊 Hosting config:', config);
  return config;
};

/**
 * Функція для перевірки можливостей хостингу
 */
export const checkHostingCapabilities = () => {
  const type = detectHostingType();
  
  const capabilities = {
    environmentVariables: type === 'vps' || type === 'localhost',
    runtimeConfig: type === 'shared' || type === 'vps' || type === 'netlify' || type === 'vercel',
    nodeJs: type === 'vps' || type === 'localhost',
    staticFiles: true,
    cors: type !== 'github-pages', // GitHub Pages має обмеження CORS
    ssl: window.location.protocol === 'https:',
    customDomain: type !== 'github-pages' && type !== 'localhost',
    jsonp: true, // Всі середовища підтримують JSONP
    localStorageAccess: typeof Storage !== 'undefined',
    
    // Специфічні можливості
    githubPages: type === 'github-pages',
    development: type === 'localhost',
    production: type !== 'localhost'
  };
  
  console.log('🔧 Можливості хостингу:', capabilities);
  return capabilities;
};

/**
 * Функція для debug інформації
 */
export const getDebugInfo = () => {
  const hostingType = detectHostingType();
  const config = getHostingConfig();
  const capabilities = checkHostingCapabilities();
  
  return {
    hostingType,
    config,
    capabilities,
    detectedAt: new Date().toISOString(),
    url: window.location.href,
    
    // Додаткова інформація для діагностики
    environment: {
      hasProcessEnv: typeof process !== 'undefined',
      hasWindow: typeof window !== 'undefined',
      hasNavigator: typeof navigator !== 'undefined',
      reactEnv: process.env.NODE_ENV,
      userAgent: navigator.userAgent.substring(0, 100) + '...'
    }
  };
};

/**
 * Функція для логування стану детекції
 */
export const logHostingDetection = () => {
  const debugInfo = getDebugInfo();
  
  console.group('🔍 Hosting Detection Summary');
  console.log('📍 Type:', debugInfo.hostingType);
  console.log('🌐 Hostname:', debugInfo.config.hostname);
  console.log('🔒 Secure:', debugInfo.config.isSecure);
  console.log('⚙️ Capabilities:', debugInfo.capabilities);
  console.groupEnd();
  
  return debugInfo;
};

// Об'єднаний експорт
const hostingDetector = {
  detectHostingType,
  getHostingConfig,
  checkHostingCapabilities,
  getDebugInfo,
  logHostingDetection
};

// Єдиний default export
export default hostingDetector;

// Автоматичне логування при імпорті (тільки в development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    logHostingDetection();
  }, 100);
}