// src/utils/browserDetection.js - Детекція браузерів та активація спеціальних фіксів

/**
 * Детекція браузера Edge
 */
export const isEdgeBrowser = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  
  // Перевіряємо всі можливі варіанти Edge
  const isEdge = userAgent.includes('edge/') || 
                 userAgent.includes('edg/') || 
                 userAgent.includes('edga/') || 
                 userAgent.includes('edgios/') ||
                 (userAgent.includes('chrome/') && userAgent.includes('edge'));

  if (isEdge) {
    console.log('🔧 Edge браузер детектовано, активуємо спеціальні фікси');
    console.log('🔍 User Agent:', navigator.userAgent);
  }

  return isEdge;
};

/**
 * Детекція мобільних браузерів
 */
export const isMobileBrowser = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
};

/**
 * Детекція проблемних браузерів
 */
export const isProblematicBrowser = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  return /miuibrowser|samsungbrowser|ucbrowser|oppo|vivo/i.test(userAgent);
};

/**
 * Глобальний фікс для Edge браузера
 */
export const enableEdgeFixes = () => {
  if (!isEdgeBrowser()) {
    return false;
  }

  // Додаємо глобальний індикатор Edge фіксів
  if (typeof window !== 'undefined') {
    window.COMSPEC_EDGE_FIXES_ENABLED = true;
    console.log('🔧 Edge фікси активовано глобально');
  }

  return true;
};

/**
 * Перевірка чи активовані Edge фікси
 */
export const areEdgeFixesEnabled = () => {
  return typeof window !== 'undefined' && window.COMSPEC_EDGE_FIXES_ENABLED === true;
};

// Автоматична активація фіксів при імпорті модуля
if (typeof window !== 'undefined') {
  enableEdgeFixes();
}

// Експорт для зручності
export default {
  isEdgeBrowser,
  isMobileBrowser,
  isProblematicBrowser,
  enableEdgeFixes,
  areEdgeFixesEnabled
};