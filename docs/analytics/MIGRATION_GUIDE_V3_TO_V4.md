# 🚀 Міграція аналітики з v3.2 на v4.0 SESSION TRACKING

**Дата:** 21 серпня 2025  
**Версії:** v3.2 → v4.0  
**Тип:** Покроковий гайд міграції  
**Складність:** ⭐⭐⭐ Середня

---

## 📋 Огляд міграції

### Що змінюється:

**З v3.2 (базова аналітика):**
- ✅ Відстеження переглядів сторінок  
- ✅ Події товарів (product events)
- ✅ Популярні товари
- 📊 2 аркуші: `PageViews`, `ProductEvents`

**На v4.0 (повний session tracking):**
- ✅ Все з v3.2 +
- 🔥 Відстеження сесій користувачів  
- 🌐 IP адреси та геолокація
- 📱 Device fingerprinting
- ⏱️ Час на сторінках та взаємодії
- 😴 Bounce rate аналіз
- 📊 4 аркуші: `PageViews`, `ProductEvents`, `UserSessions`, `PageViewsDetailed`

---

## ⚠️ ВАЖЛИВО: Backup перед міграцією

### 1️⃣ Створити резервну копію Google Sheets:
1. Відкрийте поточну таблицю: https://docs.google.com/spreadsheets/d/1SQg9vNBhIKzi288HjClKbatLoSqAdeC9CaFzYOA-nlM
2. **File → Make a copy**
3. Назвіть: `COMSPEC Analytics BACKUP v3.2 - ${today}`
4. Збережіть URL копії

### 2️⃣ Записати поточні налаштування:
```javascript
// Запишіть поточні URL та налаштування
Поточний Apps Script URL: _________________
Поточний Spreadsheet ID: 1SQg9vNBhIKzi288HjClKbatLoSqAdeC9CaFzYOA-nlM
Analytics Level: _________________
Sampling Rate: _________________
```

---

## 🔧 КРОК 1: Оновлення Google Apps Script

### 1.1 Відкрити Apps Script редактор

1. Перейдіть до: [Google Apps Script Console](https://script.google.com)
2. Знайдіть ваш поточний скрипт для аналітики
3. Або створіть новий проект: **New Project**

### 1.2 Замінити код скрипта

1. **Відкрити файл Code.gs**
2. **Видалити весь існуючий код**
3. **Скопіювати код з файлу:** `security-backup/google-analytics-script-v4.0-session-tracking.js`

```javascript
/**
 * 📊 COMSPEC Analytics - Google Apps Script v4.0 SESSION TRACKING
 * АДАПТОВАНО З ПРАЦЮЮЧОГО ПІДХОДУ + ДОДАНО ПОВНИЙ SESSION TRACKING
 * ID таблиці: 1SQg9vNBhIKzi288HjClKbatLoSqAdeC9CaFzYOA-nlM
 * ДАТА: 21.08.2025 - РОЗШИРЕНА ВЕРСІЯ v4.0
 * 
 * ✅ НОВІ ФУНКЦІЇ v4.0:
 * - Додано аркуш UserSessions для відстеження сесій користувачів
 * - Додано аркуш PageViewsDetailed для детального аналізу сторінок
 * - IP адреси користувачів
 * - Тривалість сесій та взаємодій
 * - Device fingerprinting та browser detection
 * - Bounce rate аналіз
 */

// ... Повний код з файлу v4.0 ...
```

### 1.3 Налаштувати дозволи

1. **Save** проект (Ctrl+S)
2. **Deploy → New deployment**
3. **Type:** Web app
4. **Description:** COMSPEC Analytics v4.0 Session Tracking
5. **Execute as:** Me (ваш email)
6. **Who has access:** Anyone
7. **Deploy**

### 1.4 Отримати новий URL

1. **Скопіювати Web app URL** - це буде ваш новий ANALYTICS_SCRIPT_URL
2. **Формат:** `https://script.google.com/macros/s/AKfycbx.../exec`

---

## 📊 КРОК 2: Підготовка Google Sheets

### 2.1 Перевірити існуючі аркуші

Ваша таблиця повинна мати:
- ✅ `PageViews` (існує)
- ✅ `ProductEvents` (існує)  
- ✅ `PopularProducts` (існує)

### 2.2 Додати нові аркуші (автоматично)

**НІЧОГО НЕ ПОТРІБНО РОБИТИ ВРУЧНУ!** 

Скрипт v4.0 **автоматично створить** нові аркуші при першому запиті:
- 🆕 `UserSessions` - інформація про сесії користувачів
- 🆕 `PageViewsDetailed` - детальний аналіз сторінок

### 2.3 Структура нових аркушів

**UserSessions** (створюється автоматично):
```
timestamp | date | session_id | ip_address | user_agent | duration_seconds | 
total_pages | total_interactions | max_scroll_depth | bounced | device_type | 
browser_name | browser_version | screen_resolution | referrer | start_time | end_time
```

**PageViewsDetailed** (створюється автоматично):
```
timestamp | date | session_id | page_path | page_title | duration_seconds | 
interactions | scroll_depth | page_number | referrer | start_time | end_time
```

---

## 🔧 КРОК 3: Оновлення конфігурації сайту

### 3.1 Оновити public/config.js

**Знайти файл:** `public/config.js`

**Замінити ANALYTICS_SCRIPT_URL:**

```javascript
// БУЛО (v3.2):
window.RUNTIME_CONFIG = {
  ANALYTICS_SCRIPT_URL: 'https://script.google.com/macros/s/OLD_URL/exec',
  // ... інші налаштування
};

// СТАЛО (v4.0):
window.RUNTIME_CONFIG = {
  ANALYTICS_SCRIPT_URL: 'https://script.google.com/macros/s/NEW_URL_FROM_STEP_1.4/exec',
  
  // 🚀 НОВІ ОПЦІЇ для v4.0:
  ANALYTICS_LEVEL: 'PRODUCTION_FULL',      // Увімкнути session tracking
  ANALYTICS_SAMPLING_RATE: 50,             // 50% користувачів (економно)
  ANALYTICS_DEBUG_MODE: false,             // Вимкнути debug в продакшн
  ANALYTICS_ENABLED: true
};
```

### 3.2 Вибрати режим аналітики

**Для тестування (короткочасно):**
```javascript
ANALYTICS_LEVEL: 'FULL',           // Всі функції
ANALYTICS_SAMPLING_RATE: 100,      // Всі користувачі
```

**Для продакшн (рекомендовано):**
```javascript  
ANALYTICS_LEVEL: 'PRODUCTION_FULL', // Повні функції + оптимізація
ANALYTICS_SAMPLING_RATE: 50,        // 50% користувачів
```

**Для економного режиму:**
```javascript
ANALYTICS_LEVEL: 'PRODUCTION',      // Без session tracking
ANALYTICS_SAMPLING_RATE: 30,        // 30% користувачів  
```

---

## 🧪 КРОК 4: Тестування міграції

### 4.1 Тест базової роботи

1. **Відкрити сайт** у браузері
2. **Відкрити Developer Tools** → Console
3. **Виконати команду:**
```javascript
window.analyticsTest()
```

**Очікуваний результат:**
```
✅ Analytics test completed successfully
📊 Analytics Level: PRODUCTION_FULL
🔄 Sending test data to Google Sheets...
✅ Data sent successfully
```

### 4.2 Тест session tracking

1. **В консолі браузера виконати:**
```javascript
window.sessionTest()
```

**Очікуваний результат:**
```
🧪 Тестування session tracking...
1. Тестування IP detection...
✅ IP отримано: 95.67.123.45
2. Тестування device detection...
✅ Device info: {type: "desktop", screenResolution: "1920x1080"}
3. Тестування browser detection...
✅ Browser info: {name: "Chrome", version: "118.0"}
4. Симуляція короткої сесії...
✅ Сесія створена: session_1755772723828_abc123
✅ Page view створено
✅ Page view оновлено
✅ Сесія завершена
🎉 Session tracking тест завершений успішно!
```

### 4.3 Перевірка даних в Google Sheets

1. **Відкрити Google Sheets таблицю**
2. **Перевірити нові аркуші:**
   - ✅ `UserSessions` - повинен з'явитися з заголовками
   - ✅ `PageViewsDetailed` - повинен з'явитися з заголовками
3. **Перевірити дані:**
   - Після `sessionTest()` повинні з'явитися тестові записи
   - Перевірити формат timestamp (Київський час UTC+3)

### 4.4 Перевірка реальних даних

1. **Походити по сайту** протягом 2-3 хвилин
2. **Переглянути кілька товарів**
3. **Зачекати 30 секунд** (час batch обробки)
4. **Перевірити аркуші:**
   - `PageViews` - мають з'явитися записи переглядів
   - `UserSessions` - має з'явитися ваша сесія з IP, тривалістю, etc.
   - `PageViewsDetailed` - детальна інформація по кожній сторінці

---

## 🚨 КРОК 5: Вирішення можливих проблем

### 5.1 Помилка "Service unavailable"

**Причина:** Apps Script недоступний або неправильно налаштований

**Рішення:**
1. Перевірити URL в `public/config.js`
2. Переконатися що скрипт **опублікований** (deployed)
3. Перевірити дозволи: "Anyone" має доступ

### 5.2 Нові аркуші не створюються

**Причина:** Недостатньо прав доступу до таблиці

**Рішення:**
1. Відкрити Google Sheets
2. **Share** → додати email Google Apps Script як Editor
3. Або зробити таблицю публічною для редагування

### 5.3 Дані не записуються

**Причина:** Неправильний Spreadsheet ID або помилки в скрипті

**Рішення:**
```javascript
// 1. Перевірити ID таблиці в Apps Script:
const SPREADSHEET_ID = '1SQg9vNBhIKzi288HjClKbatLoSqAdeC9CaFzYOA-nlM';

// 2. Тестувати в консолі браузера:
window.analyticsStats()  // Показати помилки

// 3. Перевірити невдалі запити:
window.analyticsRetry()  // Повторити невдалі запити
```

### 5.4 Session tracking не працює

**Причина:** Режим аналітики не підтримує session tracking

**Рішення:**
```javascript
// Перевірити в консолі:
console.log('Level:', window.RUNTIME_CONFIG?.ANALYTICS_LEVEL);
console.log('Session tracking:', window.isFeatureEnabled?.('sessionTracking'));

// Якщо false - змінити на:
window.RUNTIME_CONFIG.ANALYTICS_LEVEL = 'PRODUCTION_FULL';
location.reload();
```

---

## ✅ КРОК 6: Підтвердження успішної міграції

### 6.1 Чек-лист перевірки

- [ ] **Apps Script v4.0** розгорнутий та працює
- [ ] **Новий URL** додано в `public/config.js`
- [ ] **Режим аналітики** налаштований (PRODUCTION_FULL рекомендовано)
- [ ] **Аркуші створені:** UserSessions, PageViewsDetailed
- [ ] **Тести пройдені:** `analyticsTest()` та `sessionTest()`
- [ ] **Реальні дані** записуються в нові аркуші
- [ ] **Базова аналітика** продовжує працювати (PageViews, ProductEvents)

### 6.2 Фінальна перевірка статистики

**В консолі браузера:**
```javascript
// Показати поточну конфігурацію
console.log('📊 Analytics Level:', window.analyticsConfig?.level);
console.log('🎯 Session tracking:', window.isFeatureEnabled?.('sessionTracking')); 
console.log('🌐 IP detection:', window.isFeatureEnabled?.('ipDetection'));
console.log('📈 Sampling rate:', window.getSamplingRate?.() + '%');

// Показати статистику поточної сесії  
window.sessionStats();
```

**Очікуваний результат:**
```
📊 Analytics Level: PRODUCTION_FULL
🎯 Session tracking: true
🌐 IP detection: true  
📈 Sampling rate: 50%
📊 Session Analytics Statistics:
Current session: {sessionId: "session_...", startTime: ..., totalPages: 3}
Active page views: Map(1) {"/products/..." => {...}}
```

---

## 🎯 Результат міграції

### До v3.2:
- 📊 2 аркуші з базовою аналітикою
- 👁️ Тільки перегляди сторінок та події товарів
- 📈 Популярні товари на основі локального кешу

### Після v4.0:
- 📊 **4 аркуші** з повною аналітикою
- 🌐 **IP адреси** користувачів та геолокація
- ⏱️ **Час на сторінках** та тривалість сесій
- 📱 **Device fingerprinting** та браузер detection
- 😴 **Bounce rate** аналіз та engagement метрики
- 🎯 **Детальний шлях** користувача по сайту
- 📊 **Конфігуровані режими** аналітики для оптимізації ресурсів

### Нові можливості аналізу:
- 📈 **Conversion funnel** по сторінках
- ⏱️ **Heat maps** часу на сторінках  
- 🌍 **Географічна** аналітика користувачів
- 📱 **Cross-device** аналіз поведінки
- 🎯 **Bounce rate** оптимізація
- 📊 **Engagement** метрики по контенту

---

## 🚀 Поздравляємо з успішною міграцією! 

**Ваша система аналітики тепер надає найповнішу картину поведінки користувачів на сайті COMSPEC!** 🎉

---

*Створено: 21 серпня 2025*  
*Версія гайду: 1.0*  
*Статус: ✅ Готово до використання*