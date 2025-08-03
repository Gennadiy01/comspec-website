# 🔧 Керівництво по управлінню конфігурацією COMSPEC

## 📋 Огляд системи конфігурації

Ваш проект має добре організовану систему конфігурації з автоматичним fallback та валідацією. Всі критичні параметри централізовані в `src/config/environment.js`.

---

## 🎯 Де змінювати параметри

### 1. **Для розробки (localhost)**
Файл: `.env.local` (створити з `.env.example`)
```bash
REACT_APP_GOOGLE_SCRIPT_URL=your_new_script_url
REACT_APP_GOOGLE_MAPS_API_KEY=your_new_maps_key
REACT_APP_GOOGLE_SHEETS_API_KEY=your_new_sheets_key
REACT_APP_TELEGRAM_BOT_TOKEN=your_new_bot_token
```

### 2. **Для GitHub Pages**
Файли для оновлення:
- `public/config.js` (рядки 7-10)
- `src/config/github-pages-config.js` (рядки 18-20)

### 3. **Для production хостингу**
Environment змінні сервера або Docker контейнера

### 4. **Fallback значення (останній варіант)**
Файл: `src/config/environment.js` (рядки 83-144)

---

## ⚡ Швидка заміна критичних параметрів

### Google Apps Script URL
**Місця для оновлення:**
1. `.env.local`: `REACT_APP_GOOGLE_SCRIPT_URL=`
2. `public/config.js:8`: `GOOGLE_SCRIPT_URL:`
3. `src/config/github-pages-config.js:18`: `SCRIPT_URL:`
4. `src/config/environment.js:84,109,117,142`: fallback значення

### Google Maps API Key
**Місця для оновлення:**
1. `.env.local`: `REACT_APP_GOOGLE_MAPS_API_KEY=`
2. `public/config.js:7`: `GOOGLE_MAPS_API_KEY:`
3. `src/config/github-pages-config.js:23`: `API_KEY:`
4. `src/config/environment.js:83,108,116,141`: fallback значення

### Telegram Bot Token
**Місця для оновлення:**
1. `.env.local`: `REACT_APP_TELEGRAM_BOT_TOKEN=`
2. `src/config/environment.js:89,122`: fallback значення

---

## 🔍 Перевірка після змін

### 1. **Швидка перевірка в консолі**
```javascript
// Відкрити DevTools → Console
window.COMSPEC_DEBUG.config               // Повна конфігурація

// Безпечне логування (маскує ключі)
console.table(Object.entries(window.COMSPEC_DEBUG.config).map(([key, value]) => ({
  Parameter: key,
  Value: typeof value === 'string' && (key.includes('KEY') || key.includes('URL')) 
    ? value.substring(0, 20) + '...' 
    : JSON.stringify(value).substring(0, 50)
})))

// Перевірити критичні параметри
['GOOGLE_SHEETS', 'GOOGLE_MAPS'].forEach(param => {
  console.log(`${param}:`, window.COMSPEC_DEBUG.config[param] ? '✅' : '❌');
});

// GitHub Pages специфічні функції (якщо доступні)
window.debugComspecConfig?.()
window.testConfigLoader?.()
```

### 2. **Перевірка на всіх середовищах**

#### Localhost:
```bash
npm start
# Перевірити в консолі браузера
```

#### GitHub Pages:
```bash
npm run build
# Відкрити build/index.html в браузері
# Перевірити консоль
```

#### Production:
```bash
# Після deploy перевірити на живому сайті
# Консоль браузера → window.COMSPEC_DEBUG.logConfig()
```

### 3. **Функціональні тести**

#### ✅ Google Maps:
- Відкрити сторінку з картою
- Перевірити що карта завантажується без помилок
- Перевірити пошук адреси в формі замовлення

#### ✅ Google Apps Script:
- Заповнити форму замовлення
- Натиснути "Відправити"
- Перевірити що форма відправляється без помилок
- Перевірити що дані потрапляють в Google Sheets

#### ✅ Telegram Bot:
- Відправити тестове замовлення
- Перевірити що повідомлення надходить в Telegram

#### ✅ Google Sheets API:
- Перевірити завантаження даних продуктів
- Перевірити завантаження точок продажу
- Перевірити роботу пошуку

---

## 🚨 Типові помилки та вирішення

### Помилка: "Google Script URL недоступний"
**Рішення:**
1. Перевірити URL в Google Apps Script
2. Переконатись що скрипт опублікований як "Anyone can access"
3. Оновити URL у всіх місцях (див. секцію вище)

### Помилка: "Google Maps не завантажується"
**Рішення:**
1. Перевірити що API ключ активний в Google Cloud Console
2. Перевірити що домен дозволений в налаштуваннях ключа
3. Оновити ключ у всіх конфігураційних файлах

### Помилка: "Telegram повідомлення не надходять"
**Рішення:**
1. Перевірити що bot токен правильний
2. Перевірити що bot додано в групу/канал
3. Перевірити Chat ID в налаштуваннях

### Помилка: "Конфігурація не завантажується на GitHub Pages"
**Рішення:**
1. Перевірити що `public/config.js` завантажується (Network tab)
2. Перевірити що немає CORS помилок
3. Очистити кеш браузера

---

## 🔧 Debug команди

### Корисні команди для налагодження:

#### На localhost (development):
```javascript
// Функції з environment.js
window.COMSPEC_DEBUG.detectHostingType()
window.COMSPEC_DEBUG.getHostingConfig() 
window.COMSPEC_DEBUG.logConfig()
window.COMSPEC_DEBUG.validateConfig()
```

#### На GitHub Pages:
```javascript
// 1. Основна конфігурація
window.COMSPEC_DEBUG.config

// 2. Повна діагностика
window.debugComspecConfig()     // показує всю інформацію
window.testConfigLoader()       // тестує конфігурацію

// 3. Інформація про хостинг
window.COMSPEC_UNIVERSAL.hosting
window.COMSPEC_UNIVERSAL.config

// 4. Runtime конфігурації  
window.RUNTIME_CONFIG           // з public/config.js
window.COMSPEC_UNIVERSAL        // з github-pages-config.js
```

#### Універсальні команди (працюють скрізь):
```javascript
// Перевірити що завантажено
window.RUNTIME_CONFIG || window.COMSPEC_UNIVERSAL

// Environment змінні (якщо доступні)
process?.env || window.process?.env

// Базова діагностика
console.log('Хостинг:', window.COMSPEC_UNIVERSAL?.hosting?.type || 'невідомо')
```

---

## 📚 Структура конфігураційних файлів

```
src/config/
├── environment.js        ← Головний файл конфігурації
├── hosting-detector.js   ← Автодетекція хостингу
└── github-pages-config.js ← Спеціально для GitHub Pages

public/
└── config.js             ← Runtime конфігурація для GitHub Pages

.env.example              ← Шаблон для .env.local
.env.local               ← Локальні налаштування (не в git)
```

---

## 🎯 Рекомендації

### При зміні URL Google Apps Script:
1. ✅ Оновити в `.env.local` для розробки
2. ✅ Оновити в `public/config.js` для GitHub Pages  
3. ✅ Оновити fallback в `environment.js`
4. ✅ Протестувати на всіх середовищах

### При зміні API ключів:
1. ✅ Перевірити права доступу в Google Cloud Console
2. ✅ Перевірити domain restrictions
3. ✅ Оновити в усіх конфігураційних файлах
4. ✅ Очистити кеш браузера після змін

### Безпека:
- ❌ Ніколи не комітити `.env.local` в git
- ✅ Використовувати environment змінні на production
- ✅ Регулярно ротувати API ключі
- ✅ Обмежувати домени в налаштуваннях Google Cloud

---

*Останнє оновлення: 31.07.2025*