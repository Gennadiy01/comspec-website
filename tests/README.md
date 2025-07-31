# 🧪 Тестування проекту COMSPEC

## Структура тестів

```
tests/
├── e2e/                    # E2E тести (end-to-end)
├── integration-manual/     # Тести з реальними API (gitignored)
│   ├── google-services/    # Тести Google APIs  
│   └── telegram/          # Тести Telegram Bot API
├── integration/           # Безпечні інтеграційні тести
└── unit/                  # Unit тести
    ├── forms/             # Тести форм
    ├── telegram/          # Тести логіки Telegram (мокована)
    └── utils/             # Тести утиліт
```

## Типи тестів

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