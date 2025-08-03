export const handleError = (error, context = '') => {
  console.error(`Error in ${context}:`, error);
  
  // Опціонально - відправити в існуючий Google Sheets
  if (window.COMSPEC_DEBUG?.config?.GOOGLE_SCRIPT_URL) {
    fetch(window.COMSPEC_DEBUG.config.GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'logError',
        data: {
          message: error.message,
          context: context,
          timestamp: new Date().toISOString(),
          url: window.location.href
        }
      })
    }).catch(() => {}); // Тихо ігнорувати помилки логування
  }
};