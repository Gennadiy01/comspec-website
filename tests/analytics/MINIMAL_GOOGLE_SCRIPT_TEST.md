# 🧪 Мінімальний тест Google Apps Script

## 📋 Інструкції для діагностики проблеми з правами доступу:

### Крок 1: Створити новий тестовий скрипт

1. Відкрийте **Google Apps Script**: https://script.google.com
2. Натисніть **+ Новий проект**
3. Замініть весь код цим **мінімальним тестом**:

```javascript
/**
 * Мінімальний тест для діагностики проблеми доступу
 */
function doPost(e) {
  console.log('POST запит отримано');
  return ContentService.createTextOutput('POST працює!')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doGet(e) {
  console.log('GET запит отримано');
  return ContentService.createTextOutput('GET працює!')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doOptions(e) {
  return ContentService.createTextOutput('');
}

// Функція для ручного тестування
function testFunction() {
  console.log('Ручний тест працює');
  return 'Скрипт працює правильно';
}
```

### Крок 2: Тестування в редакторі

1. Виберіть функцію `testFunction`
2. Натисніть **Run**
3. Переконайтеся що з'являється: **"Скрипт працює правильно"**

### Крок 3: Deployment

1. **Deploy** → **New deployment**
2. **Type**: Web app
3. **Execute as**: Me (ваш email)
4. **Who has access**: Anyone
5. **Deploy** → скопіювати URL

### Крок 4: Тестування

URL буде схожий на:
```
https://script.google.com/macros/s/НОВИЙ_ID/exec
```

**Надішліть цей URL** - я протестую чи буде він працювати без 401/302 помилок.

## 🎯 Мета тесту:

- ✅ Якщо мінімальний скрипт працює - проблема в складному коді
- ❌ Якщо мінімальний скрипт не працює - проблема в налаштуваннях Google

Це допоможе точно визначити де саме проблема.

**Будь ласка, створіть цей простий тест і надішліть новий URL.**