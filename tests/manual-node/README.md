# 🖥️ Manual Node.js Tests

Мануальні Node.js тести для системи аналітики COMSPEC.

## 📋 Доступні скрипти

### 🌐 `test-analytics-node.js`
**Призначення:** Тестування Google Apps Script через HTTP запити  
**Що робить:**
- Відправляє POST та GET запити до Google Apps Script
- Діагностує CORS та redirect проблеми  
- Перевіряє JSONP callback функціональність
- Аналізує response headers та status codes

```bash
node test-analytics-node.js
```

**Очікуваний результат:** 200 OK з JSON response  
**Поточна проблема:** 302 redirect (потрібно оновити Google Apps Script deployment)

---

### 📊 `test-local-analytics.js`  
**Призначення:** Тестування локальної аналітики без Google Sheets  
**Що робить:**
- Симулює localStorage для Node.js середовища
- Створює випадкові дані переглядів товарів (1-50 переглядів)
- Генерує користувацькі сесії з реальними метриками
- Тестує логіку популярних товарів з різними лімітами
- Аналізує статистику переглядів та сесій

```bash
node test-local-analytics.js
```

**Результат:** Повний звіт з аналітикою та статистикою  
**Виводить:**
- Топ популярних товарів з scoring
- Загальну статистику переглядів  
- Аналіз користувацьких сесій
- Тестування різних лімітів (2, 4, 6, 10 товарів)

---

### 🚀 `simulate-analytics.js`
**Призначення:** Симуляція реальних аналітичних подій  
**Що робить:**
- Відправляє пакети подій до Google Apps Script
- Симулює різні типи подій: product_view, add_to_cart, contact_inquiry
- Використовує випадкових користувачів та продукти
- Імітує реальні джерела трафіку
- Додає затримки між запитами для реалістичності

```bash
node simulate-analytics.js
```

**Параметри симуляції:**
- 15 подій в 3 пакети по 5
- Затримка 1-3 секунди між запитами  
- 5 секунд пауза між пакетами
- 10 тестових продуктів, 5 користувачів

---

### 🌐 `serve-tests.js`
**Призначення:** HTTP сервер для браузерних тестів  
**Що робить:**
- Запускає HTTP сервер на порту 8080
- Обслуговує файли з папки tests/
- Створює головну сторінку зі списком всіх тестів
- Додає CORS headers для cross-origin запитів
- Автоматично відкриває браузер (з --open флагом)

```bash
node serve-tests.js --open
```

**Доступні URL:**
- `http://localhost:8080/` - головна сторінка тестів
- `http://localhost:8080/analytics/test-analytics.html`
- `http://localhost:8080/manual-browser/test-new-analytics.html`
- `http://localhost:8080/manual-browser/test-popular-products.html`
- та інші тести з папки tests/

---

## 🔧 Налаштування

### Передумови
1. **Node.js** встановлено
2. **Головний сайт** запущено на `http://localhost:3000`
3. **Google Apps Script** розгорнуто (для тестів з Sheets)

### Послідовність запуску для повного тестування:

```bash
# 1. Запустити головний сайт
npm start

# 2. Запустити тестовий HTTP сервер  
node tests/manual-node/serve-tests.js --open

# 3. Протестувати локальну аналітику
node tests/manual-node/test-local-analytics.js

# 4. Діагностувати Google Sheets підключення
node tests/manual-node/test-analytics-node.js

# 5. Симулювати реальні події (якщо Sheets працює)
node tests/manual-node/simulate-analytics.js
```

## 📈 Результати тестування

### ✅ Локальна аналітика (test-local-analytics.js):
- **Статус:** Працює на 100%
- **Функції:** Популярні товари, scoring, статистика
- **Дані:** 303 перегляди, 10 товарів, 10 сесій

### ⚠️ Google Sheets (test-analytics-node.js):  
- **Статус:** 302 redirect проблема
- **Потрібно:** Оновити Google Apps Script deployment
- **Fallback:** JSONP також не працює через redirect

### 🌐 HTTP сервер (serve-tests.js):
- **Статус:** Працює коректно
- **Порт:** 8080  
- **Функції:** Обслуговування всіх браузерних тестів

## 🔍 Troubleshooting

### Проблема: "ECONNREFUSED localhost:3000"
**Рішення:** Переконайтесь що головний сайт запущено з `npm start`

### Проблема: "Port 8080 already in use" 
**Рішення:** Змініть PORT в serve-tests.js або завершіть процес на 8080

### Проблема: "302 redirect з Google Apps Script"
**Рішення:** Користувач повинен оновити deployment скрипта в Google Apps Script консолі

## 📝 Логи та Debug

Всі скрипти виводять детальні логи:
- ✅ Успішні операції  
- ⚠️ Попередження
- ❌ Помилки  
- 📊 Статистика та метрики

Для додаткового debug інформації використовуйте браузерні тести які мають консольні команди.