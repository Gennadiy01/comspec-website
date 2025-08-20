/**
 * 📊 COMSPEC Website Analytics - Google Apps Script
 * Обробка аналітичних даних для таблиці "COMSPEC - Website Analytics" 
 * 
 * ВАЖЛИВО: Цей скрипт має бути налаштований в окремій Google таблиці,
 * незалежно від основної таблиці замовлень
 * 
 * ДАТА ОНОВЛЕННЯ: 20.08.2025
 * ВЕРСІЯ: 2.0 - додано CORS підтримку та JSONP fallback
 */

// === КОНФІГУРАЦІЯ ===

// Назви аркушів (мають відповідати структурі в WEBSITE_ANALYTICS_PLAN.md)
const SHEETS = {
  PAGE_VIEWS: 'PageViews',
  PRODUCT_EVENTS: 'ProductEvents', 
  DAILY_SUMMARY: 'DailySummary',
  POPULAR_PRODUCTS: 'PopularProducts',
  TRAFFIC_SOURCES: 'TrafficSources',
  SETTINGS: 'Settings'
};

// Налаштування
const CONFIG = {
  MAX_ROWS_PER_SHEET: 10000,     // Максимум рядків в одному аркуші
  DATA_RETENTION_DAYS: 365,      // Скільки днів зберігати дані
  AUTO_UPDATE_INTERVAL: 3600000,  // Інтервал автооновлення (1 година)
  DEBUG_MODE: true                // Режим відладки
};

// === ГОЛОВНІ ФУНКЦІЇ ОБРОБКИ ЗАПИТІВ ===

/**
 * Головна функція для POST запитів (стандартний API)
 */
function doPost(e) {
  return handleRequest(e, 'POST');
}

/**
 * Функція для GET запитів (JSONP fallback)
 */
function doGet(e) {
  return handleRequest(e, 'GET');
}

/**
 * Функція для OPTIONS запитів (CORS preflight)
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

/**
 * Універсальна функція обробки запитів
 */
function handleRequest(e, method) {
  const response = {
    success: true,
    data: null,
    error: null,
    timestamp: new Date().toISOString(),
    method: method
  };

  try {
    logDebug(`📨 Отримано ${method} запит`);

    let data;
    
    if (method === 'POST') {
      // POST запит - JSON в body
      if (!e.postData?.contents) {
        throw new Error('Відсутні дані в POST запиті');
      }
      data = JSON.parse(e.postData.contents);
      logDebug('📦 POST дані:', data);
    } else {
      // GET запит - параметри в URL для JSONP
      data = {
        action: e.parameter?.action || 'unknown',
        sheet: e.parameter?.sheet || 'ProductEvents',
        data: JSON.parse(e.parameter?.data || '[]')
      };
      logDebug('📦 GET параметри:', data);
    }
    
    const { action, sheet, data: requestData } = data;

    // Валідуємо запит
    if (!action) {
      throw new Error('Параметр "action" обов\'язковий');
    }

    // Маршрутизація по типу дії
    switch (action) {
      case 'analytics':
        response.data = handleAnalyticsData(sheet, requestData);
        break;
        
      case 'test':
        response.data = handleTestRequest(sheet, requestData, method);
        break;
        
      default:
        throw new Error(`Невідома дія: ${action}`);
    }

    logDebug('✅ Успішний результат:', response.data);

  } catch (error) {
    logError('❌ Помилка обробки запиту:', error);
    response.success = false;
    response.error = error.message;
  }
  
  return createResponse(response, method, e.parameter?.callback);
}

// === ОБРОБКА АНАЛІТИЧНИХ ДАНИХ ===

/**
 * Обробка аналітичних даних
 */
function handleAnalyticsData(sheetName, data) {
  if (!sheetName || !data || !Array.isArray(data)) {
    throw new Error('Невалідні дані для аналітики');
  }

  logDebug(`📊 Обробка аналітичних даних для аркуша ${sheetName}:`, data.length, 'записів');

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet(spreadsheet, sheetName);

  // Додаємо дані до аркуша
  const addedRows = addDataToSheet(sheet, sheetName, data);

  // Оновлюємо залежні аркуші
  updateDependentSheets(sheetName);

  return {
    success: true,
    sheet: sheetName,
    addedRows: addedRows,
    totalRows: sheet.getLastRow(),
    timestamp: new Date().toISOString()
  };
}

/**
 * Додавання даних до конкретного аркуша
 */
function addDataToSheet(sheet, sheetName, data) {
  // Створюємо заголовки якщо аркуш порожній
  if (sheet.getLastRow() === 0) {
    const headers = getSheetHeaders(sheetName);
    sheet.appendRow(headers);
    logDebug(`📋 Створено заголовки для ${sheetName}:`, headers);
  }

  let addedRows = 0;

  // Додаємо кожен запис
  data.forEach(record => {
    try {
      const row = formatDataForSheet(sheetName, record);
      sheet.appendRow(row);
      addedRows++;
    } catch (error) {
      logError(`Помилка додавання запису до ${sheetName}:`, error, record);
    }
  });

  // Перевіряємо ліміт рядків
  checkRowLimit(sheet, sheetName);

  logDebug(`✅ Додано ${addedRows} рядків до ${sheetName}`);
  return addedRows;
}

/**
 * Отримання або створення аркуша
 */
function getOrCreateSheet(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    logDebug(`📄 Створено новий аркуш: ${sheetName}`);
  }
  
  return sheet;
}

/**
 * Отримання заголовків для різних типів аркушів
 */
function getSheetHeaders(sheetName) {
  const headers = {
    [SHEETS.PAGE_VIEWS]: [
      'timestamp', 'date', 'page_url', 'product_id', 'user_id', 'source', 'device_type'
    ],
    [SHEETS.PRODUCT_EVENTS]: [
      'timestamp', 'date', 'event_type', 'product_id', 'user_id', 'source', 'extra_data'
    ],
    [SHEETS.DAILY_SUMMARY]: [
      'date', 'total_pageviews', 'unique_users', 'product_views', 'orders_started', 'orders_completed'
    ],
    [SHEETS.POPULAR_PRODUCTS]: [
      'product_id', 'product_title', 'views', 'orders', 'conversion', 'last_updated'
    ],
    [SHEETS.TRAFFIC_SOURCES]: [
      'date', 'source', 'visits', 'unique_users', 'avg_time', 'conversion_rate'
    ],
    [SHEETS.SETTINGS]: [
      'setting_name', 'value', 'description'
    ]
  };

  return headers[sheetName] || ['timestamp', 'data'];
}

/**
 * Форматування даних для конкретного аркуша
 */
function formatDataForSheet(sheetName, record) {
  switch (sheetName) {
    case SHEETS.PAGE_VIEWS:
      return [
        record.timestamp || Date.now(),
        record.date || new Date().toISOString().split('T')[0],
        record.page_url || '',
        record.product_id || '',
        record.user_id || '',
        record.source || 'unknown',
        record.device_type || 'unknown'
      ];

    case SHEETS.PRODUCT_EVENTS:
      return [
        record.timestamp || Date.now(),
        record.date || new Date().toISOString().split('T')[0],
        record.event_type || '',
        record.product_id || '',
        record.user_id || '',
        record.source || 'unknown',
        record.extra_data || ''
      ];

    default:
      // Загальний формат для інших аркушів
      return Object.values(record);
  }
}

// === ОНОВЛЕННЯ ЗАЛЕЖНИХ АРКУШІВ ===

/**
 * Оновлення залежних аркушів після додавання нових даних
 */
function updateDependentSheets(changedSheet) {
  logDebug(`🔄 Оновлення залежних аркушів для ${changedSheet}`);

  try {
    // Оновлюємо Popular Products при зміні Product Events
    if (changedSheet === SHEETS.PRODUCT_EVENTS) {
      updatePopularProducts();
    }

    // Оновлюємо Daily Summary при зміні Page Views або Product Events
    if ([SHEETS.PAGE_VIEWS, SHEETS.PRODUCT_EVENTS].includes(changedSheet)) {
      updateDailySummary();
    }

    // Оновлюємо Traffic Sources при зміні Page Views
    if (changedSheet === SHEETS.PAGE_VIEWS) {
      updateTrafficSources();
    }

  } catch (error) {
    logError('Помилка оновлення залежних аркушів:', error);
  }
}

/**
 * Оновлення аркуша Popular Products
 */
function updatePopularProducts() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const eventsSheet = spreadsheet.getSheetByName(SHEETS.PRODUCT_EVENTS);
  const popularSheet = getOrCreateSheet(spreadsheet, SHEETS.POPULAR_PRODUCTS);

  if (!eventsSheet || eventsSheet.getLastRow() <= 1) {
    logDebug('📊 Немає даних для обчислення популярних товарів');
    return;
  }

  // Отримуємо всі події
  const eventsData = eventsSheet.getDataRange().getValues();
  const headers = eventsData[0];
  const rows = eventsData.slice(1);

  // Знаходимо індекси потрібних колонок
  const eventTypeIndex = headers.indexOf('event_type');
  const productIdIndex = headers.indexOf('product_id');

  // Підраховуємо статистику
  const productStats = {};

  rows.forEach(row => {
    const eventType = row[eventTypeIndex];
    const productId = row[productIdIndex];

    if (!productId) return;

    if (!productStats[productId]) {
      productStats[productId] = { views: 0, orders: 0 };
    }

    if (eventType === 'product_view') {
      productStats[productId].views++;
    } else if (eventType === 'order_click' || eventType === 'order_sent') {
      productStats[productId].orders++;
    }
  });

  // Очищуємо та оновлюємо Popular Products
  popularSheet.clear();
  popularSheet.appendRow(getSheetHeaders(SHEETS.POPULAR_PRODUCTS));

  // Сортуємо товари по популярності
  const sortedProducts = Object.entries(productStats)
    .sort(([,a], [,b]) => b.views - a.views)
    .slice(0, 50); // Топ 50 товарів

  sortedProducts.forEach(([productId, stats]) => {
    const conversion = stats.views > 0 ? 
      ((stats.orders / stats.views) * 100).toFixed(2) + '%' : '0%';
    
    const productTitle = getProductTitle(productId);
    
    popularSheet.appendRow([
      productId,
      productTitle,
      stats.views,
      stats.orders,
      conversion,
      new Date().toISOString().split('T')[0]
    ]);
  });

  logDebug(`✅ Оновлено ${sortedProducts.length} популярних товарів`);
}

/**
 * Оновлення щоденної статистики
 */
function updateDailySummary() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const pageViewsSheet = spreadsheet.getSheetByName(SHEETS.PAGE_VIEWS);
  const eventsSheet = spreadsheet.getSheetByName(SHEETS.PRODUCT_EVENTS);
  const summarySheet = getOrCreateSheet(spreadsheet, SHEETS.DAILY_SUMMARY);

  const today = new Date().toISOString().split('T')[0];

  // Підраховуємо статистику за сьогодні
  const stats = {
    totalPageViews: 0,
    uniqueUsers: new Set(),
    productViews: 0,
    ordersStarted: 0,
    ordersCompleted: 0
  };

  // Обробляємо Page Views
  if (pageViewsSheet && pageViewsSheet.getLastRow() > 1) {
    const pageViewsData = pageViewsSheet.getDataRange().getValues();
    const headers = pageViewsData[0];
    const dateIndex = headers.indexOf('date');
    const userIdIndex = headers.indexOf('user_id');

    pageViewsData.slice(1).forEach(row => {
      if (row[dateIndex] === today) {
        stats.totalPageViews++;
        if (row[userIdIndex]) {
          stats.uniqueUsers.add(row[userIdIndex]);
        }
      }
    });
  }

  // Обробляємо Product Events
  if (eventsSheet && eventsSheet.getLastRow() > 1) {
    const eventsData = eventsSheet.getDataRange().getValues();
    const headers = eventsData[0];
    const dateIndex = headers.indexOf('date');
    const eventTypeIndex = headers.indexOf('event_type');

    eventsData.slice(1).forEach(row => {
      if (row[dateIndex] === today) {
        const eventType = row[eventTypeIndex];
        
        if (eventType === 'product_view') {
          stats.productViews++;
        } else if (eventType === 'order_click') {
          stats.ordersStarted++;
        } else if (eventType === 'order_sent') {
          stats.ordersCompleted++;
        }
      }
    });
  }

  // Створюємо заголовки якщо потрібно
  if (summarySheet.getLastRow() === 0) {
    summarySheet.appendRow(getSheetHeaders(SHEETS.DAILY_SUMMARY));
  }

  // Перевіряємо чи є запис за сьогодні
  const summaryData = summarySheet.getDataRange().getValues();
  const todayRowIndex = summaryData.findIndex(row => row[0] === today);

  const summaryRow = [
    today,
    stats.totalPageViews,
    stats.uniqueUsers.size,
    stats.productViews,
    stats.ordersStarted,
    stats.ordersCompleted
  ];

  if (todayRowIndex > 0) {
    // Оновлюємо існуючий запис
    summarySheet.getRange(todayRowIndex + 1, 1, 1, summaryRow.length).setValues([summaryRow]);
  } else {
    // Додаємо новий запис
    summarySheet.appendRow(summaryRow);
  }

  logDebug('✅ Оновлено щоденну статистику:', stats);
}

/**
 * Оновлення джерел трафіку
 */
function updateTrafficSources() {
  // Реалізація оновлення статистики джерел трафіку
  logDebug('🔄 Оновлення джерел трафіку (TODO)');
}

// === ДОПОМІЖНІ ФУНКЦІЇ ===

/**
 * Отримання назви товару по ID
 */
function getProductTitle(productId) {
  // Мапінг найпопулярніших товарів
  const productTitles = {
    'gravel-granite-5-10': 'Щебінь гранітний 5-10',
    'gravel-granite-5-20': 'Щебінь гранітний 5-20', 
    'gravel-granite-10-20': 'Щебінь гранітний 10-20',
    'gravel-granite-20-40': 'Щебінь гранітний 20-40',
    'gravel-granite-40-70': 'Щебінь гранітний 40-70',
    'gravel-5-10': 'Щебінь 5-10',
    'gravel-5-20': 'Щебінь 5-20',
    'gravel-10-20': 'Щебінь 10-20',
    'gravel-20-40': 'Щебінь 20-40',
    'gravel-40-70': 'Щебінь 40-70',
    'sand-river': 'Пісок річковий',
    'sand-ravine': 'Пісок яружний',
    'sand-0-5': 'Пісок фракції 0-5',
    'sand-washed-0-2': 'Пісок мийений 0-2',
    'sand-washed-2-5': 'Пісок мийений 2-5',
    'mixture-0-40': 'Суміш 0-40',
    'mixture-0-70': 'Суміш 0-70',
    'stone-raw': 'Камінь бутовий'
  };
  
  return productTitles[productId] || productId;
}

/**
 * Отримання інформації про доступні аркуші
 */
function getSheetsInfo() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = spreadsheet.getSheets();
    
    return sheets.map(sheet => ({
      name: sheet.getName(),
      rows: sheet.getLastRow(),
      columns: sheet.getLastColumn()
    }));
  } catch (error) {
    logError('Помилка отримання інформації про аркуші:', error);
    return ['Помилка отримання інформації про аркуші'];
  }
}

/**
 * Створення відповіді з правильними заголовками
 */
function createResponse(responseData, method, callback) {
  const jsonResponse = JSON.stringify(responseData, null, 2);
  
  if (method === 'GET' && callback) {
    // JSONP відповідь для обходу CORS
    const jsonpResponse = `${callback}(${jsonResponse})`;
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT)
      .setHeaders({
        'Access-Control-Allow-Origin': '*'
      });
  } else {
    // Звичайний JSON з CORS заголовками
    return ContentService
      .createTextOutput(jsonResponse)
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  }
}

/**
 * Перевірка ліміту рядків в аркуші
 */
function checkRowLimit(sheet, sheetName) {
  const lastRow = sheet.getLastRow();
  
  if (lastRow > CONFIG.MAX_ROWS_PER_SHEET) {
    logDebug(`⚠️ Аркуш ${sheetName} досяг ліміту рядків: ${lastRow}`);
    
    // Видаляємо старі рядки (залишаємо останні 80%)
    const rowsToDelete = Math.floor(CONFIG.MAX_ROWS_PER_SHEET * 0.2);
    const startRow = 2; // Пропускаємо заголовки
    
    sheet.deleteRows(startRow, rowsToDelete);
    logDebug(`🗑️ Видалено ${rowsToDelete} старих рядків з ${sheetName}`);
  }
}

/**
 * Обробка тестового запиту
 */
function handleTestRequest(sheet, data, method) {
  logDebug('🧪 Обробка тестового запиту');
  
  return {
    success: true,
    message: `Підключення до Google Apps Script працює через ${method}!`,
    timestamp: new Date().toISOString(),
    method: method,
    receivedData: data,
    availableSheets: Object.values(SHEETS),
    sheetsInfo: getSheetsInfo(),
    config: CONFIG
  };
}

// === ФУНКЦІЇ ЛОГУВАННЯ ===

/**
 * Debug логування
 */
function logDebug(message, ...args) {
  if (CONFIG.DEBUG_MODE) {
    console.log(`[Analytics] ${message}`, ...args);
  }
}

/**
 * Логування помилок
 */
function logError(message, error, ...args) {
  console.error(`[Analytics] ${message}`, error, ...args);
  
  // Можна додати відправку помилок в окремий аркуш для моніторингу
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const errorSheet = getOrCreateSheet(spreadsheet, 'ErrorLog');
    
    if (errorSheet.getLastRow() === 0) {
      errorSheet.appendRow(['timestamp', 'message', 'error', 'stack']);
    }
    
    errorSheet.appendRow([
      new Date().toISOString(),
      message,
      error.message || String(error),
      error.stack || ''
    ]);
  } catch (logError) {
    console.error('Помилка логування:', logError);
  }
}

// === АВТОМАТИЧНІ ФУНКЦІЇ ===

/**
 * Функція для автоматичного очищення старих даних
 * Запускається щотижня через тригер
 */
function cleanupOldData() {
  logDebug('🧹 Початок очищення старих даних');
  
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - CONFIG.DATA_RETENTION_DAYS);
  const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
  
  // Очищуємо основні аркуші з даними
  [SHEETS.PAGE_VIEWS, SHEETS.PRODUCT_EVENTS].forEach(sheetName => {
    try {
      const sheet = spreadsheet.getSheetByName(sheetName);
      if (sheet) {
        cleanSheetOldData(sheet, cutoffDateStr, 1); // Колонка B (date)
      }
    } catch (error) {
      logError(`Помилка очищення ${sheetName}:`, error);
    }
  });
  
  logDebug('✅ Очищення старих даних завершено');
}

/**
 * Очищення старих даних з конкретного аркуша
 */
function cleanSheetOldData(sheet, cutoffDate, dateColumn) {
  const data = sheet.getDataRange().getValues();
  
  // Знаходимо рядки для видалення
  const rowsToDelete = [];
  for (let i = 1; i < data.length; i++) { // Пропускаємо заголовок
    if (data[i][dateColumn] && data[i][dateColumn] < cutoffDate) {
      rowsToDelete.push(i + 1); // +1 бо рядки нумеруються з 1
    }
  }
  
  // Видаляємо рядки (з кінця до початку)
  rowsToDelete.reverse().forEach(rowIndex => {
    sheet.deleteRow(rowIndex);
  });
  
  logDebug(`🗑️ Видалено ${rowsToDelete.length} старих рядків з ${sheet.getName()}`);
}

// === ТРИГЕРИ ===

/**
 * Функція для налаштування автоматичних тригерів
 * Запускати вручну один раз після розгортання скрипта
 */
function setupTriggers() {
  // Видаляємо існуючі тригери
  ScriptApp.getProjectTriggers().forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });
  
  // Тригер для щотижневого очищення даних (неділя, 2:00)
  ScriptApp.newTrigger('cleanupOldData')
    .timeBased()
    .everyWeeks(1)
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(2)
    .create();
    
  logDebug('✅ Тригери налаштовано');
}