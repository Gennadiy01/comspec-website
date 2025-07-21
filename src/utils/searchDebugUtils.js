// searchDebugUtils.js
// Утиліта для умовного логування в пошуковій системі
// Версія: 1.0.0

/**
 * 🔧 SEARCH DEBUG УТИЛІТА ДЛЯ ПОШУКОВОЇ СИСТЕМИ
 * 
 * Забезпечує умовне логування тільки в development режимі
 * В production всі debug повідомлення автоматично вимикаються
 */

// Перевірка режиму розробки
const isDevelopment = 
  process.env.NODE_ENV === 'development' || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost') ||
  (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1');

/**
 * Search Debug логування (тільки в development)
 */
const searchDebug = isDevelopment ? console.log : () => {};

/**
 * Search Info логування (тільки в development) 
 */
const searchDebugInfo = isDevelopment ? console.info : () => {};

/**
 * Search Warn логування (завжди активне)
 */
const searchDebugWarn = console.warn;

/**
 * Search Error логування (завжди активне)
 */
const searchDebugError = console.error;

/**
 * Групове логування для пошукових тестів (тільки в development)
 */
const searchDebugGroup = isDevelopment ? {
  start: (title) => console.group(`🔍 ${title}`),
  end: () => console.groupEnd(),
  collapsed: (title) => console.groupCollapsed(`🔧 ${title}`)
} : {
  start: () => {},
  end: () => {},
  collapsed: () => {}
};

/**
 * Експорт утилітків
 */
export {
  searchDebug,
  searchDebugInfo, 
  searchDebugWarn,
  searchDebugError,
  searchDebugGroup,
  isDevelopment
};

// Експорт за замовчуванням
export default searchDebug;