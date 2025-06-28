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
  
  // Hostinger - ДОДАНО для сумісності з config-loader
  if (hostname.includes('hostinger') || 
      hostname.includes('000webhost') || 
      hostname.includes('hostingerapp')) {
    console.log('🌐 Detected: Hostinger');
    return 'hostinger';
  }
  
  // MiroHost - ДОДАНО для сумісності з config-loader
  if (hostname.includes('mirohost') || 
      hostname.includes('mirohostcdn') ||
      hostname.includes('mh-cdn')) {
    console.log('🇺🇦 Detected: MiroHost');
    return 'mirohost';
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
    // Нестандартні порти - ВИПРАВЛЕНО логіку
    port && !['80', '443', '3000', ''].includes(port),
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
 * 🔧 ВИПРАВЛЕНО: використовує правильні назви типів
 */
export const checkHostingCapabilities = () => {
  const type = detectHostingType();
  
  const capabilities = {
    // ✅ ВИПРАВЛЕНО: використовує 'development' замість 'localhost'
    environmentVariables: type === 'vps' || type === 'development',
    runtimeConfig: ['shared', 'vps', 'netlify', 'vercel', 'hostinger', 'mirohost'].includes(type),
    nodeJs: type === 'vps' || type === 'development', // ✅ ВИПРАВЛЕНО
    staticFiles: true,
    cors: type !== 'github', // ✅ ВИПРАВЛЕНО: використовує 'github' замість 'github-pages'
    ssl: window.location.protocol === 'https:',
    customDomain: !['github', 'development'].includes(type), // ✅ ВИПРАВЛЕНО
    jsonp: true, // Всі середовища підтримують JSONP
    localStorageAccess: typeof Storage !== 'undefined',
    
    // Специфічні можливості - ✅ ВИПРАВЛЕНО всі назви
    githubPages: type === 'github', // ← БУЛО: type === 'github-pages'
    development: type === 'development', // ← БУЛО: type === 'localhost'
    production: type !== 'development', // ← БУЛО: type !== 'localhost'
    
    // 🆕 ДОДАНО: Нові можливості
    hostinger: type === 'hostinger',
    mirohost: type === 'mirohost',
    ukraine: type === 'mirohost' // Оптимізація для України
  };
  
  console.log('🔧 Можливості хостингу:', capabilities);
  return capabilities;
};

/**
 * Функція для debug інформації
 * 🔧 ВИПРАВЛЕНО: безпечний доступ до process.env
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
      // ✅ ВИПРАВЛЕНО: безпечний доступ до process.env
      reactEnv: typeof process !== 'undefined' && process.env ? process.env.NODE_ENV : 'unknown',
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
// 🔧 ВИПРАВЛЕНО: безпечна перевірка process.env
if (typeof window !== 'undefined') {
  const isDevelopment = typeof process !== 'undefined' && 
                       process.env && 
                       process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    setTimeout(() => {
      logHostingDetection();
    }, 100);
  }
}