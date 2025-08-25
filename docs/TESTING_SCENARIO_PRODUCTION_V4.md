# 🧪 ПОВНИЙ ТЕСТОВИЙ СЦЕНАРІЙ Session Tracking v4.0

## 📋 Загальна інформація

**Дата оновлення:** 2025-08-25  
**Версія:** Session Tracking v4.0 + PopularProducts v2.0  
**Localhost URL:** http://localhost:3000  
**Production URL:** https://gennadiy01.github.io/comspec-website/  
**Google Sheets:** https://docs.google.com/spreadsheets/d/1SQg9vNBhIKzi288HjClKbatLoSqAdeC9CaFzYOA-nlM/  

---

# 🏠 ТЕСТУВАННЯ НА LOCALHOST

## 🎯 ЕТАП A1: Підготовка localhost

### A1.1 Запуск проекту
```bash
npm start
```
**✅ Перевірити:** Сайт відкривається на http://localhost:3000

### A1.2 Підготовка браузера
- [ ] Відкрити Developer Tools (F12)
- [ ] Перейти на вкладку Console
- [ ] Очистити консоль (Ctrl+L)
- [ ] Перейти на вкладку Network для моніторингу запитів

### A1.3 Перевірка конфігурації localhost
```javascript
// Виконати в консолі:
console.log('🔧 Конфігурація:', {
  level: window.getAnalyticsConfig?.()?.level,
  sessionTracking: window.isFeatureEnabled?.('sessionTracking'),
  ipDetection: window.isFeatureEnabled?.('ipDetection')
});
```
**✅ Очікуваний результат:** level: "FULL", всі функції true

---

## 🎯 ЕТАП A2: Тестування Session Tracking (localhost)

### A2.1 Ініціалізація сесії
**Дії:** Перезавантажити сторінку (F5)

**✅ Очікувані логи:**
```
🏠 Localhost режим: FULL
📊 Analytics Level: FULL
🎯 Сесія ініціалізована: session_1724512345_abcd1234
🌐 IP адреса користувача: 192.168.1.100
```

### A2.2 Статистика сесії
```javascript
// Виконати в консолі:
if (window.sessionStats) {
  console.log('📊 Session Stats:', window.sessionStats());
} else {
  console.log('❌ window.sessionStats недоступна');
}
```

---

## 🛒 ЕТАП A3: Тестування продуктів (localhost)

### A3.1 Перегляд 5+ товарів
**Дії:** 
1. Перейти в "Продукція"
2. Відкрити 5 різних товарів

**✅ Очікувані логи після 5-го товару:**
```
📈 Синхронізовано 5 популярних товарів з Google Sheets
```

### A3.2 Перевірка нового формату PopularProducts
```javascript
// Виконати в консолі для перевірки версії коду:
console.log('🔍 Версія PopularProducts:', 
  window.ProductAnalytics?.prototype?.constructor?.toString?.().includes('600000')
);
```
**✅ Повинно повернути:** true (10 хвилин замість 2)

### A3.3 Тестування замовлення
**Дії:** Зробити тестове замовлення

**✅ Очікуваний лог:**
```
📊 Відстежено замовлення аналітикою: {
  event: "product_order",
  productId: "gravel-5-20"
}
```

---

# 🌐 ТЕСТУВАННЯ НА PRODUCTION

## 🎯 ЕТАП B1: Підготовка production

### B1.1 Перевірка деплою
- [ ] Перевірити статус деплою: https://github.com/Gennadiy01/comspec-website/actions
- [ ] ✅ Зелена галочка = деплой завершено
- [ ] Зачекати 5-10 хвилин після деплою
- [ ] Відкрити https://gennadiy01.github.io/comspec-website/

### B1.2 Критична перевірка версії коду
```javascript
// ОБОВ'ЯЗКОВО виконати в консолі:
console.log('🔍 Версія коду:', 
  window.ProductAnalytics?.prototype?.constructor?.toString?.().includes('600000')
);
```
**✅ Якщо true:** нова версія завантажена  
**❌ Якщо false:** стара версія, потрібно очистити кеш

### B1.3 Очистка кешу (якщо версія false)
**Спосіб 1:** Developer Tools → Application → Storage → Clear Storage → Clear site data  
**Спосіб 2:** Network tab → ✅ Disable cache → F5  
**Спосіб 3:** Ctrl+Shift+Delete → Clear all

### B1.4 Підготовка браузера
- [ ] Developer Tools (F12) → Console
- [ ] Очистити консоль (Ctrl+L)
- [ ] Network tab для моніторингу запитів

---

## 🔍 ЕТАП B2: Перевірка конфігурації production

### B2.1 Перевірка RUNTIME_CONFIG
```javascript
// Виконати в консолі:
console.log('🔧 RUNTIME_CONFIG:', window.RUNTIME_CONFIG);
```

**✅ Успішно якщо побачите:**
```
🔧 RUNTIME_CONFIG: {
  ANALYTICS_LEVEL: "PRODUCTION_FULL",
  ANALYTICS_SAMPLING_RATE: 50,
  ANALYTICS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxoVGsb41EeQ1KOixNhq9qK_fC5z5k7yG6DdpS83gn2hhFCOVOoWuQVyTArM0mLAEs/exec"
}
```

### B2.2 Перевірка Analytics Level
```javascript
// Виконати в консолі:
console.log('📊 Analytics активність:', {
  level: window.getAnalyticsConfig?.()?.level,
  sessionTracking: window.isFeatureEnabled?.('sessionTracking'),
  ipDetection: window.isFeatureEnabled?.('ipDetection'),
  userSessions: window.isFeatureEnabled?.('userSessions')
});
```

**✅ Успішно:** level: "PRODUCTION_FULL", всі значення true

### B2.3 КРИТИЧНА перевірка PopularProducts інтервалу
```javascript
// Перевірити чи працює новий 10-хвилинний інтервал:
console.log('⏰ PopularProducts інтервал:', 
  window.ProductAnalytics?.prototype?.constructor?.toString?.().match(/\d{6,}/g)
);
```
**✅ Повинно показувати:** ["600000"] (10 хвилин)  
**❌ Якщо ["120000"]:** стара версія (2 хвилини)

---

## 🎯 ЕТАП B3: Тестування Session Tracking (production)

### 3.1 Ініціалізація сесії
**Дії:** Перезавантажити сторінку (F5)

**✅ Очікувані логи:**
```
🔧 Використовую RUNTIME_CONFIG level: PRODUCTION_FULL
📊 Analytics Level: PRODUCTION_FULL
🎯 Сесія ініціалізована: session_1724512345_abcd1234
🌐 IP адреса користувача: 192.168.1.100
```

### 3.2 Перевірка статистики сесії
```javascript
// Виконати в консолі:
if (window.sessionStats) {
  console.log('📊 Session Stats:', window.sessionStats());
} else {
  console.log('❌ window.sessionStats недоступна');
}
```

**✅ Успішно якщо побачите:**
```json
{
  "sessionId": "session_1724512345_abcd1234",
  "startTime": 1724512345000,
  "duration": 15000,
  "totalPages": 1,
  "isActive": true,
  "currentPage": "/comspec-website/",
  "hasLocalStorage": true
}
```

---

## 🛒 ЕТАП B4: Тестування переглядів товарів (production)

### 4.1 Перегляд товару
**Дії:** 
1. Натиснути "Продукція" у меню
2. Обрати будь-який товар (наприклад, "Щебінь 5-20")
3. Перейти на сторінку товару

**✅ Очікувані логи:**
```
📄 Почато перегляд /comspec-website/products/stone/gravel-5-20
👁️ Відстежено перегляд товару: gravel-5-20
📤 Відправлено 1 подій
```

### 4.2 Перегляд ще 4 товарів
**Дії:** Переглянути ще 4 різні товари

**✅ Очікуваний лог після 5-го перегляду:**
```
📈 Синхронізовано 5 популярних товарів з Google Sheets
```

---

## 📋 ЕТАП B5: Тестування замовлень (production)

### 5.1 Створення замовлення
**Дії:**
1. На сторінці товару натиснути "Замовити"
2. Заповнити форму:
   - Ім'я: "Тест Юзер"
   - Телефон: "+380123456789"
   - Продукт: (автоматично)
   - Тип доставки: "Доставка"
   - Адреса: "м. Київ, вул. Тестова, 1"
3. Натиснути "Надіслати замовлення"

**✅ Очікувані логи:**
```
Замовлення успішно збережено: {orderId: "ORD-20250824-001", ...}
📊 Відстежено замовлення аналітикою: {
  event: "product_order",
  productId: "gravel-5-20",
  orderId: "ORD-20250824-001"
}
```

---

# 📊 ЕТАП C: Перевірка Google Sheets (для localhost та production)

## C1: Нові заголовки PopularProducts
**ВАЖЛИВО:** Перед тестуванням оновіть заголовки в PopularProducts:
```
timestamp | date | time | rank | product_id | views_count | last_viewed_date | last_viewed_time
```

## C2: Очистка старих даних
- [ ] Видаліть всі записи з довгими JSON рядками
- [ ] Залиште тільки записи з нормальними колонками

## 📊 ЕТАП C3: Перевірка записів у всіх аркушах

### 6.1 Аркуш UserSessions
**Перейти:** https://docs.google.com/spreadsheets/d/1SQg9vNBhIKzi288HjClKbatLoSqAdeC9CaFzYOA-nlM/edit#gid=0

**✅ Очікується новий запис з:**
- `session_id`: session_1724512345_abcd1234
- `start_time`: 2025-08-24 15:45:45
- `ip_address`: ваша IP адреса
- `total_pages`: кількість переглянутих сторінок
- `user_agent`: інформація про браузер

### 6.2 Аркуш PageViewsDetailed
**✅ Очікується записи з:**
- Детальна інформація про кожну переглянуту сторінку
- IP адреси та device info
- Тривалість перебування на сторінці

### 6.3 Аркуш ProductEvents
**✅ Очікується записи з:**
- `event_type`: "product_view" для переглядів
- `event_type`: "product_order" для замовлення (НЕ product_view!)
- Всі переглянуті товари

### C3.4 Аркуш PopularProducts (НОВИЙ ФОРМАТ)
**✅ Очікується записи з:**
- `timestamp`: часова мітка
- `date`: дата у форматі YYYY-MM-DD  
- `time`: час у форматі HH:MM:SS
- `rank`: позиція у топі (1, 2, 3...)
- `product_id`: ID товару
- `views_count`: кількість переглядів
- `last_viewed_date`: дата останнього перегляду
- `last_viewed_time`: час останнього перегляду

**❌ НЕ повинно бути:**
- Довгих JSON рядків
- Записів кожні 2 хвилини (тільки кожні 10 хвилин)
- Дублікатів без змін

---

# 🚀 ЕТАП D: Додаткові тести та валідація

## D1: Тести функцій

### 7.1 Тест sendBeacon при закритті
```javascript
// Виконати в консолі:
if (window.sessionEndTest) {
  window.sessionEndTest();
  console.log('✅ Тест sendBeacon виконано');
} else {
  console.log('❌ window.sessionEndTest недоступна');
}
```

### 7.2 Тест повного циклу сесії
```javascript
// Виконати в консолі:
if (window.sessionTest) {
  window.sessionTest();
  console.log('✅ Повний тест сесії виконано');
} else {
  console.log('❌ window.sessionTest недоступна');
}
```

### D1.3 Тест PopularProducts v2.0
```javascript
// Виконати в консолі:
if (window.testPopularProducts) {
  const result = window.testPopularProducts.getAll();
  console.log('📊 Популярні товари:', result);
  console.log('🔍 Версія коду:', 
    window.ProductAnalytics?.prototype?.constructor?.toString?.().includes('600000')
  );
} else {
  console.log('❌ window.testPopularProducts недоступна');
}
```

## D2: Тести тривалості та частоти

### D2.1 Тест 10-хвилинного інтервалу
**Дії:**
1. Переглянути 5 товарів (тригер синхронізації)
2. Зачекати 15 хвилин
3. Перевірити чи з'являються нові записи

**✅ Очікуваний результат:** 
- Одна синхронізація одразу після 5-го товару
- Наступна синхронізація через ~10 хвилин (тільки при змінах)
- НЕ кожні 2 хвилини

### D2.2 Тест зміни популярності
```javascript
// Перевірити localStorage:
console.log('💾 Останній sync:', {
  time: new Date(parseInt(localStorage.getItem('comspec_last_sync_time'))),
  data: localStorage.getItem('comspec_last_popular_sync')
});
```

---

# ✅ ПОВНИЙ ЧЕКЛІСТ УСПІШНОГО ТЕСТУВАННЯ

## 🏠 Localhost тести
- [ ] Analytics Level: FULL (всі функції увімкнені)
- [ ] Session Tracking працює з IP detection
- [ ] PopularProducts синхронізується (нова версія з rank)
- [ ] Замовлення створюють product_order події
- [ ] Версія коду містить 600000 (10 хвилин)

## 🌐 Production тести
- [ ] RUNTIME_CONFIG: PRODUCTION_FULL завантажується
- [ ] Версія коду містить 600000 (10 хвилин) ✅ КРИТИЧНО
- [ ] Session Tracking ініціалізується автоматически
- [ ] IP адреса визначається правильно
- [ ] PopularProducts НЕ генерує записи кожні 2 хвилини
- [ ] PopularProducts використовує новий формат колонок з rank

### Google Sheets записи
- [ ] UserSessions: записи сесій з IP та device info
- [ ] PageViewsDetailed: детальні записи сторінок
- [ ] ProductEvents: відстеження переглядів та замовлень
- [ ] PopularProducts: список популярних товарів
- [ ] PageViews: основні перегляди сторінок

### Продвинуті функції
- [ ] sendBeacon API працює для завершення сесій
- [ ] localStorage зберігає дані між сесіями
- [ ] Sampling rate 50% працює правильно
- [ ] Тестові функції доступні у window

---

## 🚨 ЩО РОБИТИ ПРИ ПОМИЛКАХ

### Якщо Session Tracking не працює:
1. Перевірити чи `ANALYTICS_LEVEL = "PRODUCTION_FULL"`
2. Перевірити Network tab на наявність запитів до Google Apps Script
3. Перевірити чи немає CORS помилок (має бути JSONP fallback)

### Якщо замовлення створюють product_view:
1. Перевірити чи додано код відстеження в OrderModal.js
2. Перевірити логи `📊 Відстежено замовлення аналітикою`

### Якщо PopularProducts генерує записи кожні 2 хвилини:
1. **КРИТИЧНО:** Перевірити версію коду (має бути 600000)
2. Якщо false - очистити кеш повністю
3. Зачекати 10-15 хвилин після деплою GitHub Pages
4. Перевірити чи оновилися заголовки таблиці

### Якщо версія коду не оновлюється:
```bash
git commit --allow-empty -m "force: примусовий деплой"
git push
```

### Якщо все ще старий формат:
1. Відкрити в іншому браузері (Chrome → Firefox)
2. Інкогніто режим
3. Мобільний браузер
4. Перевірити https://github.com/Gennadiy01/comspec-website/actions

---

**📝 Результат тестування записати у `docs/CURRENT_SESSION_STATUS.md`**