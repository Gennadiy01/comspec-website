# 📊 Інструкції з налаштування аналітичного Google Apps Script

## 🚀 Крок 1: Створення аналітичної Google Sheets таблиці

### 1️⃣ Створити нову таблицю
1. Відкрити https://sheets.google.com
2. Створити **нову таблицю**
3. Назвати її: **"COMSPEC - Website Analytics"**

### 2️⃣ Створити аркуші відповідно до документації

Створити **7 аркушів** з точними назвами:

#### 📋 PageViews
Заголовки: `timestamp | date | page_url | product_id | user_id | source | device_type`

#### 📋 ProductEvents  
Заголовки: `timestamp | date | event_type | product_id | user_id | source | extra_data`

#### 📋 DailySummary
Заголовки: `date | total_pageviews | unique_users | product_views | popular_product_clicks | order_clicks`

#### 📋 PopularProducts
Заголовки: `product_id | total_views | last_viewed | rank | updated_at`

#### 📋 TrafficSources
Заголовки: `date | source | visits | unique_users | avg_session_duration | bounce_rate`

#### 📋 Settings
Заголовки: `setting_name | value | description | updated_at`

#### 📋 ErrorLog
Заголовки: `timestamp | function_name | error_message | stack_trace | params`

### 3️⃣ Отримати ID таблиці
З URL таблиці скопіювати ID:
```
https://docs.google.com/spreadsheets/d/1ABC123XYZ_TABLE_ID_HERE/edit
                                 ↑ Це ваш TABLE_ID
```

---

## 🔧 Крок 2: Створення Google Apps Script

### 1️⃣ Створити новий проект
1. Відкрити https://script.google.com
2. **+ Новий проект**
3. Назвати: **"COMSPEC Analytics Script"**

### 2️⃣ Замінити код
1. **Видалити** весь існуючий код
2. **Скопіювати** весь код з файлу `security-backup/google-analytics-script-FINAL.js`
3. **Вставити** в редактор
4. **Замінити** на початку файлу:
   ```javascript
   const ANALYTICS_SPREADSHEET_ID = 'YOUR_TABLE_ID_HERE';
   ```
   на:
   ```javascript
   const ANALYTICS_SPREADSHEET_ID = '1SQg9vNBhIKzi288HjClKbatLoSqAdeC9CaFzYOA-nlM';
   ```

### 3️⃣ Зберегти проект
**Ctrl+S** або **File → Save**

---

## 🧪 Крок 3: Тестування в редакторі

### 1️⃣ Запустити ручний тест
1. Вибрати функцію **`manualTest`**
2. Натиснути **"Run"**
3. **Авторизувати** скрипт (дозволити доступ до Google Sheets)

### 2️⃣ Перевірити результати
У логах має з'явитися:
```
✅ Тест підключення: ПРОЙШОВ
✅ Тест аналітики: ПРОЙШОВ
```

### 3️⃣ Перевірити таблицю
В аркуші **ProductEvents** має з'явитися тестовий запис з `event_type: manual_test`

---

## 🌐 Крок 4: Deployment

### 1️⃣ Створити Web App deployment
1. **Deploy** → **New deployment**
2. **Type**: Web app
3. **Description**: `COMSPEC Analytics v1.0`
4. **Execute as**: **Me**
5. **Who has access**: **Anyone**
6. **Deploy**

### 2️⃣ Скопіювати URL
Отримаєте URL схожий на:
```
https://script.google.com/macros/s/AKfycbxXXX...XXXX/exec
```

---

## ⚙️ Крок 5: Налаштування фронтенду

### 1️⃣ Оновити config.js
Змінити в `public/config.js`:
```javascript
ANALYTICS_SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_NEW_SCRIPT_ID/exec',
```

### 2️⃣ Тестувати через Node.js
```bash
node test-analytics-node.js
```

Очікуваний результат:
```
📊 Status Code: 200
📦 Response Body: {"success":true,"message":"Analytics тест успішний"}
```

---

## 🔧 Крок 6: Додаткові функції

### 🧪 Тестові команди для перевірки

#### В Google Apps Script редакторі:
```javascript
manualTest()              // Повний тест системи
testAnalyticsConnection() // Тест підключення до таблиці
clearOldAnalyticsData()   // Очищення старих даних
```

#### В браузері на сайті:
```javascript
window.analyticsTest()    // Тест підключення фронтенду
window.analyticsDebug()   // Показати стан аналітики
```

### 📊 Корисні URL для тестування

**Тест GET запиту:**
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=test
```

**Тест аналітики:**
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=testConnection
```

---

## ✅ Чеклист готовності

### 📋 Google Sheets
- ✅ Створена таблиця "COMSPEC - Website Analytics"
- ✅ Створено 7 аркушів з правильними назвами
- ✅ Додано заголовки до кожного аркуша
- ✅ Скопійовано ID таблиці

### 📋 Google Apps Script  
- ✅ Створено новий проект "COMSPEC Analytics Script"
- ✅ Вставлено код з `google-analytics-script-FINAL.js`
- ✅ Замінено `ANALYTICS_SPREADSHEET_ID` на реальний ID
- ✅ Запущено `manualTest()` успішно
- ✅ Створено Web App deployment
- ✅ Скопійовано deployment URL

### 📋 Фронтенд
- ✅ Оновлено URL в `public/config.js`
- ✅ Тест `node test-analytics-node.js` повертає 200
- ✅ В браузері `window.analyticsTest()` працює
- ✅ На сайті відстежуються перегляди товарів

### 📋 Аналітичні дані
- ✅ В аркуші **ProductEvents** з'являються записи від користувачів
- ✅ В аркуші **PopularProducts** оновлюються топ товари
- ✅ Секція "Популярні товари" показує реальні дані

---

## 🚨 Вирішення проблем

### ❌ 302 Redirect
- Перевірити налаштування deployment: **Execute as: Me**, **Who has access: Anyone**
- Створити новий deployment (не оновлювати існуючий)

### ❌ Помилка доступу до таблиці
- Перевірити правильність `ANALYTICS_SPREADSHEET_ID`
- Перевірити що скрипт має доступ до таблиці
- Запустити `manualTest()` в редакторі

### ❌ Дані не з'являються в таблиці
- Перевірити що аркуші створені з правильними назвами
- Перевірити заголовки аркушів
- Перевірити логи в Google Apps Script редакторі

### ❌ Популярні товари не оновлюються
- Перевірити що є записи в аркуші **ProductEvents**
- Записи мають мати `event_type: product_view`
- Запустити `updatePopularProductsFromEvents()` вручну

---

## 🎯 Результат

Після виконання всіх кроків ви матимете:
- ✅ **Окремий аналітичний Google Apps Script** що працює зі своєю таблицею
- ✅ **Повну систему аналітики** відповідно до документації
- ✅ **7 аркушів** для різних типів даних
- ✅ **Автоматичне оновлення популярних товарів** на основі реальних переглядів
- ✅ **Систему логування помилок** в ErrorLog аркуш
- ✅ **Функції тестування та діагностики**

**🚀 Система готова до продакшн використання!**