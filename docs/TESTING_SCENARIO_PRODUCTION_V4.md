# 🧪 ТЕСТОВИЙ СЦЕНАРІЙ Session Tracking v4.0 на PRODUCTION

## 📋 Загальна інформація

**Дата створення:** 2025-08-24  
**Версія:** Session Tracking v4.0  
**Production URL:** https://gennadiy01.github.io/comspec-website/  
**Google Sheets:** https://docs.google.com/spreadsheets/d/1SQg9vNBhIKzi288HjClKbatLoSqAdeC9CaFzYOA-nlM/  

---

## 🎯 ЕТАП 1: Підготовка до тестування

### 1.1 Перевірка деплою
- [ ] Зачекати 5 хвилин після push для завершення GitHub Pages deployment
- [ ] Відкрити https://gennadiy01.github.io/comspec-website/
- [ ] Перевірити що сайт завантажується без помилок

### 1.2 Підготовка браузера
- [ ] Відкрити Developer Tools (F12)
- [ ] Перейти на вкладку Console
- [ ] Очистити консоль (Ctrl+L або Clear button)
- [ ] Перейти на вкладку Network для моніторингу запитів

---

## 🔍 ЕТАП 2: Перевірка конфігурації

### 2.1 Перевірка RUNTIME_CONFIG
**Очікуваний результат:** Повинні з'явитися логи конфігурації

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

### 2.2 Перевірка Analytics Level
```javascript
// Виконати в консолі:
console.log('📊 Analytics активність:', {
  sessionTracking: window.isFeatureEnabled?.('sessionTracking'),
  ipDetection: window.isFeatureEnabled?.('ipDetection'),
  userSessions: window.isFeatureEnabled?.('userSessions')
});
```

**✅ Успішно якщо всі значення `true`**

---

## 🎯 ЕТАП 3: Тестування Session Tracking

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

## 🛒 ЕТАП 4: Тестування переглядів товарів

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

## 📋 ЕТАП 5: Тестування замовлень

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

## 📊 ЕТАП 6: Перевірка Google Sheets

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

### 6.4 Аркуш PopularProducts
**✅ Очікується записи з:**
- Список переглянутих товарів
- Кількість переглядів для кожного
- Дата останнього перегляду

---

## 🚀 ЕТАП 7: Додаткові тести

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

### 7.3 Тест популярних товарів
```javascript
// Виконати в консолі:
if (window.testPopularProducts) {
  const result = window.testPopularProducts.getAll();
  console.log('📊 Популярні товари:', result);
} else {
  console.log('❌ window.testPopularProducts недоступна');
}
```

---

## ✅ ЧЕКЛІСТ УСПІШНОГО ТЕСТУВАННЯ

### Основні функції
- [ ] RUNTIME_CONFIG завантажується з PRODUCTION_FULL
- [ ] Session Tracking ініціалізується автоматично
- [ ] IP адреса визначається правильно
- [ ] Перегляди товарів відстежуються як product_view
- [ ] Замовлення відстежуються як product_order (не product_view!)
- [ ] PopularProducts синхронізується після кожних 5 переглядів

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

### Якщо PopularProducts не оновлюються:
1. Переглянути 5+ товарів для тригера синхронізації
2. Перевірити лог `📈 Синхронізовано ... популярних товарів`
3. Зачекати 2 хвилини для періодичної синхронізації

---

**📝 Результат тестування записати у `docs/CURRENT_SESSION_STATUS.md`**