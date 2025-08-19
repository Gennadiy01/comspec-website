// src/utils/logger.js
// Утіліта для контролю логування

const shouldLog = () => {
  // В production - ніколи не логуємо
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  
  // Перевіряємо SILENT_MODE
  if (window.RUNTIME_CONFIG?.SILENT_MODE === true) {
    return false;
  }
  
  // Перевіряємо localStorage для швидкого переключення
  if (localStorage.getItem('SILENT_LOGS') === 'true') {
    return false;
  }
  
  return true;
};

// Wrapper для console.log
export const log = (...args) => {
  if (shouldLog()) {
    console.log(...args);
  }
};

// Wrapper для console.error (завжди показуємо помилки)
export const error = (...args) => {
  console.error(...args);
};

// Wrapper для console.warn
export const warn = (...args) => {
  if (shouldLog()) {
    console.warn(...args);
  }
};

// Функція для переключення тихого режиму
export const toggleSilentMode = () => {
  const current = localStorage.getItem('SILENT_LOGS') === 'true';
  localStorage.setItem('SILENT_LOGS', (!current).toString());
  console.log(`🔇 Логи ${!current ? 'ВИМКНЕНО' : 'УВІМКНЕНО'}`);
  if (!current) {
    console.log('💡 Для увімкнення: window.toggleLogs()');
  }
  return !current;
};

// Додаємо до window для швидкого доступу
if (typeof window !== 'undefined') {
  window.toggleLogs = toggleSilentMode;
}

export default { log, error, warn, shouldLog, toggleSilentMode };