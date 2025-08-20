# 🧪 Тестування проекту COMSPEC

## Структура тестів

```
tests/
├── analytics/              # Аналітика та Google Sheets тести
│   ├── test-analytics.html # Базовий браузерний тест аналітики
│   └── MINIMAL_GOOGLE_SCRIPT_TEST.md # Документація тестування
├── e2e/                    # E2E тести (end-to-end)
├── integration-manual/     # Тести з реальними API (gitignored)
│   ├── google-services/    # Тести Google APIs  
│   └── telegram/          # Тести Telegram Bot API
├── integration/           # Безпечні інтеграційні тести
├── manual-browser/        # Мануальні браузерні тести
│   ├── test-live-order.html     # Тест системи замовлень
│   ├── test-new-analytics.html  # Розширений тест аналітики
│   ├── test-popular-products.html # Тест популярних товарів
│   └── test-real-analytics.html # Реальний тест production
├── manual-node/           # Мануальні Node.js тести
│   └── test-analytics-node.js   # Node.js тест Google Apps Script
└── unit/                  # Unit тести
    ├── forms/             # Тести форм
    ├── telegram/          # Тести логіки Telegram (мокована)
    └── utils/             # Тести утиліт
```

## Типи тестів

### Analytics тести (`tests/analytics/`)
- Спеціалізовані тести системи аналітики
- Тестування Google Sheets інтеграції
- Документація по налаштуванню Google Apps Script
- Базові браузерні тести без реальних API ключів

### Мануальні браузерні тести (`tests/manual-browser/`)
- HTML сторінки для тестування в браузері
- Інтерактивні тести з UI
- Тестування популярних товарів, замовлень, аналітики
- Запускаються через локальний веб-сервер

### Мануальні Node.js тести (`tests/manual-node/`)
- Скрипти для запуску з командного рядка
- Тестування HTTP/HTTPS з'єднань
- Діагностика мережевих проблем
- Тестування Google Apps Script API
- Локальна симуляція аналітики через localStorage
- HTTP сервер для браузерних тестів

### Unit тести (`tests/unit/`)
- Тестують окремі функції та компоненти
- Використовують мокованi API ключі та токени
- Безпечні для Git репозиторію
- Фокус на логіці форматування, валідації, утилітах

### Інтеграційні тести (`tests/integration/`)  
- Тестують взаємодію між компонентами
- Без реальних API викликів
- Безпечні для Git репозиторію

### Мануальні інтеграційні тести (`tests/integration-manual/`)
- ⚠️ **ВИКЛЮЧЕНІ З GIT** через `.gitignore`
- Містять реальні API ключі та токени
- Тестують справжні API виклики
- Використовувати тільки для локального тестування

### E2E тести (`tests/e2e/`)
- Тестують повний user flow
- Тестування в браузері

## 🔐 Безпека

### Файли з реальними API ключами
```bash
# ЦІ ФАЙЛИ ВИКЛЮЧЕНІ З GIT:
tests/integration-manual/telegram/
tests/integration-manual/google-services/
```

### Мокованi токени в unit тестах
```javascript
// ✅ Безпечно для Git
const BOT_TOKEN = 'MOCK_BOT_TOKEN_FOR_UNIT_TESTS';
const CHAT_ID = 'MOCK_CHAT_ID_FOR_UNIT_TESTS';
```

## 🚀 Запуск тестів

### Analytics тести
```bash
# Базовий тест аналітики (браузер)
# Відкрити: http://localhost:3000/comspec-website
# Потім відкрити: tests/analytics/test-analytics.html
```

### Мануальні браузерні тести
```bash
# Запустити локальний сервер
npm start

# Відкрити в браузері:
# http://localhost:3000/tests/manual-browser/test-live-order.html          # Тест замовлень
# http://localhost:3000/tests/manual-browser/test-new-analytics.html       # Розширений тест аналітики  
# http://localhost:3000/tests/manual-browser/test-popular-products.html    # Тест популярних товарів
# http://localhost:3000/tests/manual-browser/test-real-analytics.html      # Production тест
```

### Мануальні Node.js тести  
```bash
# Тест Google Apps Script з командного рядка
node tests/manual-node/test-analytics-node.js

# Тестування локальної аналітики з симуляцією даних
node tests/manual-node/test-local-analytics.js

# Симуляція відправки подій в Google Sheets
node tests/manual-node/simulate-analytics.js

# HTTP сервер для браузерних тестів
node tests/manual-node/serve-tests.js --open
```

### Unit тести
```bash
# Telegram форматування
node tests/unit/telegram/formatting.test.js

# UTF-8 кодування  
node tests/unit/telegram/utf8-encoding.test.js

# Спрощене форматування
node tests/unit/telegram/simple-format.test.js
```

### Manual Integration тести (локально)
```bash
# ⚠️ Тільки з реальними токенами
node tests/integration-manual/telegram/api-direct.test.js
node tests/integration-manual/telegram/main.test.js
node tests/integration-manual/google-services/test-google-script-response.js
```

## 📝 Додавання нових тестів

### Unit тест
1. Створіть файл в `tests/unit/відповідна-папка/`
2. Використовуйте мокованi API ключі
3. Фокусуйтесь на логіці, не на API викликах

### Manual Integration тест  
1. Створіть файл в `tests/integration-manual/відповідна-папка/`
2. Файл автоматично виключиться з Git
3. Можете використовувати реальні API ключі

## 🔍 Моніторинг

- Unit тести повинні працювати без інтернету
- Manual integration тести потребують активного з'єднання
- Перевіряйте що мокованi токени не потрапляють в production код

## 📚 Документація тестів

Кожен тест містить:
- 🎯 Опис мети тестування
- 📋 Очікувані результати  
- ⚠️ Попередження про безпеку (якщо потрібно)