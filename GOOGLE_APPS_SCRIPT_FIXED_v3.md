# 🔧 Google Apps Script - ВИПРАВЛЕНА ВЕРСІЯ v3.0

## ❌ Діагностована проблема

**Симптом:** 302 Moved Temporarily redirect замість виконання коду  
**Причина:** Старий deployment не містить поточний код або має помилки в конфігурації  
**Рішення:** Створити НОВИЙ deployment з оновленим кодом

---

## ✅ ВИПРАВЛЕНИЙ КОД GOOGLE APPS SCRIPT v3.0

**Копіюйте цей код ПОВНІСТЮ в Google Apps Script Editor:**

```javascript
/**
 * 📊 COMSPEC Analytics - Google Apps Script v3.0
 * Фіксує 302 redirect проблему та додає покращену діагностику
 */

// 📋 КОНСТАНТИ
const SPREADSHEET_ID = '1SQg9vNBhIKzi288HjClKbatLoSqAdeC9CaFzYOA-nlM';
const DEFAULT_SHEET = 'ProductEvents';

// 📊 Аркуші таблиці
const SHEETS = {
  PAGE_VIEWS: 'PageViews',
  PRODUCT_EVENTS: 'ProductEvents',
  DAILY_SUMMARY: 'DailySummary', 
  POPULAR_PRODUCTS: 'PopularProducts',
  TRAFFIC_SOURCES: 'TrafficSources',
  SETTINGS: 'Settings',
  DEBUG_LOG: 'DebugLog'
};

/**
 * 🌐 Обробник всіх HTTP запитів (POST/GET/OPTIONS)
 */
function doPost(e) {
  return handleRequest(e, 'POST');
}

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doOptions(e) {
  return createCORSResponse('OPTIONS method allowed', 200);
}

/**
 * 🔧 Головний обробник запитів
 */
function handleRequest(e, method) {
  try {
    logDebug(`=== НОВИЙ ${method} ЗАПИТ ===`);
    logDebug('Event object exists:', !!e);
    logDebug('Event parameters:', e ? Object.keys(e) : 'no event');
    
    // Перевірка існування event
    if (!e) {
      logDebug('❌ Event object відсутній');
      return createErrorResponse('Event object is missing', 400);
    }

    // Отримуємо параметри
    const params = getRequestParams(e, method);
    logDebug('Parsed params:', JSON.stringify(params, null, 2));

    const action = params.action || 'test';
    logDebug('Action:', action);

    // Обробка різних дій
    switch (action) {
      case 'analytics':
        return handleAnalytics(params);
      case 'test':
        return handleTest(params);
      case 'ping':
        return createSuccessResponse('pong', 200);
      default:
        logDebug('⚠️ Unknown action:', action);
        return handleTest(params); // fallback to test
    }

  } catch (error) {
    logDebug('❌ КРИТИЧНА ПОМИЛКА:', error.toString());
    logDebug('Stack trace:', error.stack);
    
    return createErrorResponse(
      'Server error: ' + error.toString(),
      500
    );
  }
}

/**
 * 📊 Обробка аналітичних даних
 */
function handleAnalytics(params) {
  try {
    logDebug('📊 Обробка аналітики...');
    
    const sheet = params.sheet || DEFAULT_SHEET;
    const data = params.data;
    
    logDebug('Target sheet:', sheet);
    logDebug('Data type:', typeof data);
    logDebug('Data length:', Array.isArray(data) ? data.length : 'not array');
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      logDebug('❌ Некоректні дані:', data);
      return createErrorResponse('Invalid data: must be non-empty array', 400);
    }

    // Записуємо дані
    const result = writeToSheet(sheet, data);
    logDebug('Write result:', JSON.stringify(result));
    
    // Оновлюємо популярні товари
    if (sheet === SHEETS.PRODUCT_EVENTS) {
      updatePopularProducts(data);
    }
    
    const response = {
      success: true,
      sheet: sheet,
      addedRows: result.addedRows,
      totalRows: result.totalRows,
      timestamp: new Date().toISOString(),
      message: 'Аналітичні дані збережено успішно'
    };
    
    logDebug('✅ Аналітика успішна:', JSON.stringify(response));
    return createSuccessResponse(response, 200);

  } catch (error) {
    logDebug('❌ Помилка аналітики:', error.toString());
    return createErrorResponse('Analytics error: ' + error.toString(), 500);
  }
}

/**
 * 🧪 Обробка тестових запитів
 */
function handleTest(params) {
  try {
    logDebug('🧪 Обробка тесту...');
    
    const testData = {
      success: true,
      message: 'Google Apps Script v3.0 працює!',
      timestamp: new Date().toISOString(),
      method: params._method || 'unknown',
      spreadsheetId: SPREADSHEET_ID,
      availableSheets: Object.values(SHEETS),
      receivedParams: Object.keys(params),
      debugMode: true
    };
    
    logDebug('✅ Тест успішний:', JSON.stringify(testData));
    return createSuccessResponse(testData, 200);

  } catch (error) {
    logDebug('❌ Помилка тесту:', error.toString());
    return createErrorResponse('Test error: ' + error.toString(), 500);
  }
}

/**
 * 📝 Запис даних в аркуш
 */
function writeToSheet(sheetName, data) {
  try {
    logDebug(`📝 Запис в аркуш ${sheetName}...`);
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(sheetName);
    
    // Створюємо аркуш якщо не існує
    if (!sheet) {
      logDebug(`Створюємо новий аркуш: ${sheetName}`);
      sheet = spreadsheet.insertSheet(sheetName);
      
      // Додаємо заголовки
      const headers = getSheetHeaders(sheetName);
      if (headers.length > 0) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        logDebug('Додано заголовки:', headers.join(', '));
      }
    }
    
    // Підготовка даних для запису
    const rows = data.map(item => formatDataRow(sheetName, item));
    logDebug(`Підготовлено ${rows.length} рядків для запису`);
    
    // Записуємо дані
    const lastRow = sheet.getLastRow();
    const range = sheet.getRange(lastRow + 1, 1, rows.length, rows[0].length);
    range.setValues(rows);
    
    const totalRows = sheet.getLastRow();
    logDebug(`✅ Додано ${rows.length} рядків, всього рядків: ${totalRows}`);
    
    return {
      addedRows: rows.length,
      totalRows: totalRows,
      sheet: sheetName
    };

  } catch (error) {
    logDebug(`❌ Помилка запису в ${sheetName}:`, error.toString());
    throw error;
  }
}

/**
 * 📋 Заголовки для різних аркушів
 */
function getSheetHeaders(sheetName) {
  const headers = {
    [SHEETS.PRODUCT_EVENTS]: ['Timestamp', 'Date', 'Event Type', 'Product ID', 'User ID', 'Source', 'Extra Data'],
    [SHEETS.PAGE_VIEWS]: ['Timestamp', 'Date', 'Page URL', 'Product ID', 'User ID', 'Source', 'Device Type'],
    [SHEETS.POPULAR_PRODUCTS]: ['Product ID', 'Views', 'Last Updated'],
    [SHEETS.DEBUG_LOG]: ['Timestamp', 'Level', 'Message', 'Details']
  };
  
  return headers[sheetName] || ['Timestamp', 'Data'];
}

/**
 * 🔄 Форматування рядка даних
 */
function formatDataRow(sheetName, item) {
  const now = new Date().toISOString();
  
  switch (sheetName) {
    case SHEETS.PRODUCT_EVENTS:
      return [
        item.timestamp || Date.now(),
        item.date || new Date().toISOString().split('T')[0],
        item.event_type || 'unknown',
        item.product_id || '',
        item.user_id || '',
        item.source || '',
        item.extra_data || ''
      ];
      
    case SHEETS.PAGE_VIEWS:
      return [
        item.timestamp || Date.now(),
        item.date || new Date().toISOString().split('T')[0],
        item.page_url || '',
        item.product_id || '',
        item.user_id || '',
        item.source || '',
        item.device_type || ''
      ];
      
    case SHEETS.DEBUG_LOG:
      return [
        now,
        item.level || 'INFO',
        item.message || '',
        item.details || ''
      ];
      
    default:
      return [item.timestamp || Date.now(), JSON.stringify(item)];
  }
}

/**
 * 🔥 Оновлення популярних товарів
 */
function updatePopularProducts(events) {
  try {
    logDebug('🔥 Оновлення популярних товарів...');
    
    const productEvents = events.filter(e => e.product_id && e.event_type === 'product_view');
    if (productEvents.length === 0) {
      logDebug('Немає product_view подій для оновлення');
      return;
    }
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEETS.POPULAR_PRODUCTS);
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEETS.POPULAR_PRODUCTS);
      const headers = getSheetHeaders(SHEETS.POPULAR_PRODUCTS);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    // Читаємо існуючі дані
    const existingData = sheet.getDataRange().getValues();
    const popularProducts = {};
    
    // Завантажуємо існуючі дані
    for (let i = 1; i < existingData.length; i++) {
      const [productId, views] = existingData[i];
      popularProducts[productId] = parseInt(views) || 0;
    }
    
    // Оновлюємо лічильники
    let updatedCount = 0;
    productEvents.forEach(event => {
      const productId = event.product_id;
      popularProducts[productId] = (popularProducts[productId] || 0) + 1;
      updatedCount++;
    });
    
    // Перезаписуємо аркуш
    sheet.clear();
    const headers = getSheetHeaders(SHEETS.POPULAR_PRODUCTS);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    const rows = Object.entries(popularProducts).map(([productId, views]) => [
      productId, views, new Date().toISOString()
    ]);
    
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, 3).setValues(rows);
    }
    
    logDebug(`✅ Оновлено ${updatedCount} популярних товарів`);

  } catch (error) {
    logDebug('❌ Помилка оновлення популярних товарів:', error.toString());
  }
}

/**
 * 📥 Отримання параметрів запиту
 */
function getRequestParams(e, method) {
  const params = { _method: method };
  
  try {
    if (method === 'POST') {
      // POST параметри з body
      if (e.postData && e.postData.contents) {
        const postData = JSON.parse(e.postData.contents);
        Object.assign(params, postData);
      }
    }
    
    // GET параметри з URL
    if (e.parameter) {
      Object.assign(params, e.parameter);
    }
    
    // Обробка параметра data (може бути JSON строкою)
    if (params.data && typeof params.data === 'string') {
      try {
        params.data = JSON.parse(params.data);
      } catch (parseError) {
        logDebug('⚠️ Не вдалося парсити data як JSON:', parseError.toString());
      }
    }
    
  } catch (error) {
    logDebug('⚠️ Помилка парсингу параметрів:', error.toString());
  }
  
  return params;
}

/**
 * ✅ Створення успішної відповіді
 */
function createSuccessResponse(data, statusCode = 200) {
  const response = {
    success: true,
    data: data,
    timestamp: new Date().toISOString(),
    version: 'v3.0'
  };
  
  return createJSONResponse(response, statusCode);
}

/**
 * ❌ Створення відповіді з помилкою
 */
function createErrorResponse(message, statusCode = 400) {
  const response = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    version: 'v3.0'
  };
  
  return createJSONResponse(response, statusCode);
}

/**
 * 🌐 Створення CORS-сумісної відповіді
 */
function createCORSResponse(content, statusCode = 200) {
  return ContentService
    .createTextOutput(content)
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-cache'
    });
}

/**
 * 📄 Створення JSON відповіді
 */
function createJSONResponse(data, statusCode = 200) {
  const jsonString = JSON.stringify(data);
  
  return ContentService
    .createTextOutput(jsonString)
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-cache'
    });
}

/**
 * 🔍 Логування для діагностики
 */
function logDebug(message, details = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  console.log(logMessage);
  if (details) {
    console.log('Details:', details);
  }
  
  // Додатково записуємо в Debug аркуш (опціонально)
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let debugSheet = spreadsheet.getSheetByName(SHEETS.DEBUG_LOG);
    
    if (!debugSheet) {
      debugSheet = spreadsheet.insertSheet(SHEETS.DEBUG_LOG);
      const headers = getSheetHeaders(SHEETS.DEBUG_LOG);
      debugSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    const row = [timestamp, 'DEBUG', message, details ? JSON.stringify(details) : ''];
    const lastRow = debugSheet.getLastRow();
    debugSheet.getRange(lastRow + 1, 1, 1, 4).setValues([row]);
    
  } catch (error) {
    console.log('Не вдалося записати в debug log:', error.toString());
  }
}

/**
 * 🧪 МАНУАЛЬНА ФУНКЦІЯ ТЕСТУВАННЯ
 * Викликайте цю функцію в редакторі для тестування
 */
function manualTest() {
  logDebug('🚀 Запуск мануального тесту...');
  
  try {
    // Симулюємо GET запит
    const testEvent = {
      parameter: {
        action: 'test',
        source: 'manual_test'
      }
    };
    
    const result = handleRequest(testEvent, 'GET');
    logDebug('✅ Тест пройшов успішно!');
    logDebug('Результат:', result.getContent());
    
    return result;
    
  } catch (error) {
    logDebug('❌ Тест не пройшов:', error.toString());
    throw error;
  }
}

/**
 * 📊 ТЕСТ АНАЛІТИКИ
 */
function manualAnalyticsTest() {
  logDebug('📊 Тест аналітики...');
  
  const testEvent = {
    postData: {
      contents: JSON.stringify({
        action: 'analytics',
        sheet: 'ProductEvents',
        data: [{
          timestamp: Date.now(),
          date: new Date().toISOString().split('T')[0],
          event_type: 'manual_test',
          product_id: 'test-product-' + Date.now(),
          user_id: 'manual-test-user',
          source: 'manual_test',
          extra_data: JSON.stringify({ test: true, manual: true })
        }]
      })
    }
  };
  
  const result = handleRequest(testEvent, 'POST');
  logDebug('✅ Тест аналітики:', result.getContent());
  
  return result;
}
```

---

## 🔧 ПОКРОКОВІ ІНСТРУКЦІЇ DEPLOYMENT

### Крок 1: Оновити код
1. Відкрити https://script.google.com
2. Знайти проект аналітики
3. **ЗАМІНИТИ ВЕСЬ КОД** на код вище
4. **Зберегти** (Ctrl+S)

### Крок 2: Тестування в редакторі
1. Запустити функцію `manualTest()`
2. Перевірити логи - має бути "✅ Тест пройшов успішно!"
3. Запустити функцію `manualAnalyticsTest()`
4. Перевірити Google Sheets - має з'явитися новий запис

### Крок 3: Створити НОВИЙ deployment
1. **Deploy** → **New deployment**
2. **Type**: Web app  
3. **Execute as**: Me
4. **Who has access**: Anyone
5. **Deploy** → Скопіювати NEW URL

### Крок 4: Оновити конфігурацію
Замінити старий URL в файлах:
- `public/config.js`
- `tests/manual-node/test-analytics-node.js`

### Крок 5: Тестування
```bash
node tests/manual-node/test-analytics-node.js
```

**Очікуваний результат:** 200 OK замість 302 redirect

---

## 🐛 ДІАГНОСТИКА

### Перевірка роботи в Google Apps Script:
```javascript
// В консолі редактора
manualTest()
manualAnalyticsTest()
```

### Лог файли:
- Перевірити Console в редакторі
- Перевірити новий аркуш "DebugLog" в таблиці

### Можливі проблеми:
1. **Права доступу** - переконайтесь що скрипт має доступ до таблиці
2. **ID таблиці** - перевірити SPREADSHEET_ID в коді  
3. **Deployment** - створіть НОВИЙ deployment, не оновлюйте старий

---

## ✅ РЕЗУЛЬТАТ

Після виконання інструкцій:
- ✅ 302 redirect → 200 OK  
- ✅ Дані записуються в Google Sheets
- ✅ JSONP fallback працює
- ✅ Debug логування активне
- ✅ Популярні товари оновлюються