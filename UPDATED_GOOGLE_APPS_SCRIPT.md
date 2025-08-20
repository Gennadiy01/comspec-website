# 📊 ОНОВЛЕНИЙ Google Apps Script - версія 2.3

## ⚠️ КРИТИЧНА ПРОБЛЕМА ВИЯВЛЕНА: 302 REDIRECT

**Дата:** 20.08.2025  
**Проблема:** Google Apps Script повертає `302 Moved Temporarily` замість виконання коду
**Симптом:** Всі POST і GET запити редиректяться на `script.googleusercontent.com`
**Причина:** Проблема з deployment або правами доступу

## 🚨 ДІАГНОСТИКА:

```bash
# Тест показав:
📊 Status Code: 302
📋 Headers: {
  'location': 'https://script.googleusercontent.com/macros/echo?user_content_key=...'
}
📦 Response Body: <HTML><HEAD><TITLE>Moved Temporarily</TITLE></HEAD>...
```

## 🔧 ПЛАН ВИПРАВЛЕННЯ:

### 1. 🚀 НОВИЙ КОД Google Apps Script (версія 2.3):

```javascript
/**
 * 📊 COMSPEC Website Analytics - Google Apps Script v2.3
 * Виправлення проблеми 302 редирект
 * ДАТА: 20.08.2025
 */

// === КОНФІГУРАЦІЯ ===
const SHEETS = {
  PRODUCT_EVENTS: 'ProductEvents',
  PAGE_VIEWS: 'PageViews', 
  DAILY_SUMMARY: 'DailySummary',
  POPULAR_PRODUCTS: 'PopularProducts'
};

const CONFIG = {
  DEBUG_MODE: true,
  MAX_ROWS_PER_SHEET: 10000
};

// === ОСНОВНІ ФУНКЦІЇ ===

/**
 * POST запити
 */
function doPost(e) {
  return handleRequest(e, 'POST');
}

/**
 * GET запити (JSONP)
 */
function doGet(e) {
  return handleRequest(e, 'GET');
}

/**
 * OPTIONS (CORS preflight)
 */
function doOptions(e) {
  const output = ContentService.createTextOutput('');
  return output;
}

/**
 * Головна функція обробки
 */
function handleRequest(e, method) {
  console.log(`📨 Отримано ${method} запит`);
  
  const response = {
    success: true,
    data: null,
    error: null,
    timestamp: new Date().toISOString(),
    method: method
  };

  try {
    let requestData;
    
    if (method === 'POST') {
      if (!e || !e.postData || !e.postData.contents) {
        console.log('⚠️ POST без даних - створюємо тестові дані');
        requestData = {
          action: 'test',
          sheet: 'ProductEvents',
          data: [{
            timestamp: Date.now(),
            date: new Date().toISOString().split('T')[0],
            event_type: 'manual_test',
            product_id: 'test_product',
            user_id: 'test_user',
            source: 'manual',
            extra_data: JSON.stringify({ test: true, method: 'POST' })
          }]
        };
      } else {
        requestData = JSON.parse(e.postData.contents);
      }
    } else {
      // GET запит
      requestData = {
        action: e.parameter?.action || 'test',
        sheet: e.parameter?.sheet || 'ProductEvents',
        data: e.parameter?.data ? JSON.parse(e.parameter.data) : [{
          timestamp: Date.now(),
          date: new Date().toISOString().split('T')[0],
          event_type: 'get_test',
          product_id: 'test_product',
          user_id: 'test_user',
          source: 'jsonp',
          extra_data: JSON.stringify({ test: true, method: 'GET' })
        }]
      };
    }

    console.log('📦 Дані запиту:', requestData);

    const { action, sheet, data } = requestData;

    switch (action) {
      case 'analytics':
        response.data = processAnalytics(sheet, data);
        break;
      case 'test':
        response.data = processTest(sheet, data, method);
        break;
      default:
        throw new Error(`Невідома дія: ${action}`);
    }

    console.log('✅ Успішний результат:', response.data);

  } catch (error) {
    console.error('❌ Помилка:', error);
    response.success = false;
    response.error = error.message;
  }

  return createResponse(response, method, e?.parameter?.callback);
}

/**
 * Обробка аналітичних даних
 */
function processAnalytics(sheetName, data) {
  console.log(`📊 Обробка аналітики для ${sheetName}:`, data.length, 'записів');
  
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  // Створюємо аркуш якщо не існує
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    console.log(`📄 Створено аркуш: ${sheetName}`);
  }
  
  // Створюємо заголовки для ProductEvents
  if (sheet.getLastRow() === 0 && sheetName === SHEETS.PRODUCT_EVENTS) {
    const headers = ['timestamp', 'date', 'event_type', 'product_id', 'user_id', 'source', 'extra_data'];
    sheet.appendRow(headers);
    console.log('📋 Створено заголовки для ProductEvents');
  }
  
  // Додаємо дані
  let addedRows = 0;
  data.forEach(record => {
    try {
      const row = [
        record.timestamp || Date.now(),
        record.date || new Date().toISOString().split('T')[0],
        record.event_type || 'unknown',
        record.product_id || '',
        record.user_id || '',
        record.source || 'unknown',
        record.extra_data || ''
      ];
      sheet.appendRow(row);
      addedRows++;
      console.log('➕ Додано запис:', record.event_type, record.product_id);
    } catch (error) {
      console.error('❌ Помилка додавання запису:', error);
    }
  });
  
  const totalRows = sheet.getLastRow();
  console.log(`✅ Додано ${addedRows} рядків. Всього: ${totalRows}`);
  
  return {
    success: true,
    sheet: sheetName,
    addedRows: addedRows,
    totalRows: totalRows,
    timestamp: new Date().toISOString()
  };
}

/**
 * Тестовий запит
 */
function processTest(sheet, data, method) {
  console.log('🧪 Обробка тестового запиту');
  
  // Також записуємо тестові дані
  const result = processAnalytics(sheet, data);
  
  return {
    success: true,
    message: `Тест ${method} запиту працює!`,
    timestamp: new Date().toISOString(),
    method: method,
    analyticsResult: result,
    availableSheets: Object.values(SHEETS)
  };
}

/**
 * Створення відповіді
 */
function createResponse(responseData, method, callback) {
  const jsonResponse = JSON.stringify(responseData, null, 2);
  
  if (method === 'GET' && callback) {
    // JSONP відповідь
    const jsonpResponse = `${callback}(${jsonResponse})`;
    return ContentService.createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    // JSON відповідь
    return ContentService.createTextOutput(jsonResponse)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// === РУЧНЕ ТЕСТУВАННЯ ===

/**
 * Функція для ручного запуску з редактора
 */
function manualTest() {
  console.log('🧪 Ручне тестування...');
  
  try {
    const result = doPost();
    console.log('✅ POST результат:', result.getContent());
    
    const getResult = doGet();
    console.log('✅ GET результат:', getResult.getContent());
    
    return 'Тест успішний';
  } catch (error) {
    console.error('❌ Помилка тесту:', error);
    return `Помилка: ${error.message}`;
  }
}
```

### 2. 🔧 ІНСТРУКЦІЇ З DEPLOYMENT:

1. **Відкрийте Google Apps Script:** https://script.google.com
2. **Знайдіть ваш проект аналітики**
3. **Замініть ВЕСЬ КОД** новим кодом вище
4. **Збережіть проект** (Ctrl+S)
5. **КРИТИЧНО:** Створіть НОВИЙ deployment:
   - Натисніть "Deploy" → "New deployment"
   - Тип: "Web app"
   - Description: `Analytics v2.3 - Fixed 302 redirect`
   - Execute as: **Me (your email)**
   - Who has access: **Anyone**
6. **Скопіюйте НОВИЙ URL**

### 3. 🧪 ОБОВ'ЯЗКОВЕ ТЕСТУВАННЯ В РЕДАКТОРІ:

Перед deployment:
1. Виберіть функцію `manualTest` в редакторі
2. Натисніть "Run" 
3. Переглянте логи - мають бути тільки зелені ✅

### 4. 🔗 ОНОВЛЕННЯ URL В ПРОЕКТІ:

Змініть URL в цих файлах:
```javascript
// public/config.js
ANALYTICS_SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_NEW_ID/exec',

// .env.local (якщо є)
REACT_APP_ANALYTICS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_NEW_ID/exec
```

### 5. 📋 ПЕРЕВІРКА Google Sheets:

Переконайтесь що:
- ✅ Таблиця існує і доступна
- ✅ Скрипт прив'язаний до правильної таблиці
- ✅ У вас є права редагування

### 6. 🧪 ТЕСТУВАННЯ ПІСЛЯ DEPLOYMENT:

```bash
# Тест через Node.js:
node test-analytics-node.js

# Очікуваний результат:
📊 Status Code: 200
📦 Response Body: {"success":true,"message":"Тест працює!"}
```

## ⚠️ ЯКЩО 302 ПРОБЛЕМА ЗАЛИШАЄТЬСЯ:

### Варіант 1: Створити новий Google Apps Script
1. Створіть абсолютно новий проект
2. Прив'яжіть до нової Google Sheets таблиці
3. Використайте код вище

### Варіант 2: Перевірити права доступу
1. Переконайтесь що скрипт має права до таблиці
2. Спробуйте запустити `manualTest()` в редакторі
3. Перевірте що deployment налаштований правильно

---

**🎯 МЕТА:** Виправити 302 редирект і отримати статус 200 з JSON відповіддю