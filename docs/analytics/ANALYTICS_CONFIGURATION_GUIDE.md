# 📊 Інструкція по налагодженню режимів аналітики

## 🎯 Огляд режимів аналітики

| Режим | Запити/користувач | Функції | Коли використовувати |
|-------|-------------------|---------|----------------------|
| **BASIC** | 1-2 | Тільки перегляди сторінок | Дуже обмежені ресурси |
| **STANDARD** | 3-5 | + Події товарів | Нормальна робота |
| **FULL** | 10+ | Всі функції | Розробка/тестування |
| **PRODUCTION** | 1 | Оптимізовано для продакшн | Стабільний продакшн |
| **PRODUCTION_FULL** | 8-10 | Повні функції + оптимізація | Детальна аналітика в продакшн |

---

## 📁 Файли конфігурації

### 1️⃣ **src/config/analytics-config.js** - Основні налаштування
Це головний файл з визначеннями всіх режимів. **Редагувати тільки для додавання нових режимів.**

```javascript
export const ANALYTICS_LEVELS = {
  BASIC: { /* мінімальні налаштування */ },
  STANDARD: { /* стандартні налаштування */ },
  FULL: { /* всі функції */ },
  PRODUCTION: { /* оптимізовано */ },
  PRODUCTION_FULL: { /* компроміс */ }
};
```

### 2️⃣ **public/config.js** - Runtime конфігурація (ГОЛОВНИЙ для продакшн)
```javascript
window.RUNTIME_CONFIG = {
  ANALYTICS_LEVEL: 'PRODUCTION',           // 🎯 ЗМІНИТИ ТУТ ДЛЯ ПРОДАКШН
  ANALYTICS_SAMPLING_RATE: 30,             // 📊 % користувачів
  ANALYTICS_DEBUG_MODE: false,             // 🐛 Debug логи
  ANALYTICS_ENABLED: true                  // 🔄 Увімкнути/вимкнути повністю
};
```

### 3️⃣ **Environment змінні** (.env файли)
```bash
# .env.development
REACT_APP_ANALYTICS_LEVEL=FULL

# .env.production  
REACT_APP_ANALYTICS_LEVEL=PRODUCTION

# .env.local (локальне перевизначення)
REACT_APP_ANALYTICS_LEVEL=STANDARD
```

---

## 🔧 Покрокові інструкції для кожного випадку

### 🏠 **Розробка на localhost**

**Файли для зміни:** Нічого! Працює автоматично.

```javascript
// Автоматично визначається як FULL режим
// src/config/analytics-config.js:72-76
if (window.location.hostname === 'localhost') {
  level = 'FULL'; // Повний режим на localhost
}
```

**Що отримуєте:**
- ✅ Всі функції увімкнені
- ✅ Session tracking з IP detection
- ✅ Debug логи в консолі
- ✅ Миттєва відправка даних (batchSize: 1)

---

### 🌐 **Продакшн (стандартний, економний)**

**Файл:** `public/config.js`
```javascript
window.RUNTIME_CONFIG = {
  ANALYTICS_LEVEL: 'PRODUCTION',           // 🎯 Економний режим
  ANALYTICS_SAMPLING_RATE: 30,             // 📉 30% користувачів
  ANALYTICS_DEBUG_MODE: false,             // ❌ Без debug
  ANALYTICS_ENABLED: true
};
```

**Що отримуєте:**
- ✅ Page views + Product events
- ❌ Session tracking вимкнений
- ❌ IP detection вимкнений  
- 📦 Великі batches (10 подій/запит)
- 📊 1,000 запитів/день на 1000 користувачів

---

### 🚀 **Продакшн з повною аналітикою**

**Файл:** `public/config.js`
```javascript
window.RUNTIME_CONFIG = {
  ANALYTICS_LEVEL: 'PRODUCTION_FULL',      // 🚀 Повна аналітика
  ANALYTICS_SAMPLING_RATE: 50,             // 📊 50% користувачів (компроміс)
  ANALYTICS_DEBUG_MODE: false,             // ❌ Debug вимкнений
  ANALYTICS_ENABLED: true
};
```

**Що отримуєте:**
- ✅ Всі функції увімкнені
- ✅ Session tracking + IP detection
- ✅ Детальна аналітика сторінок
- 📦 Середні batches (3 події/запит)
- 📊 4,000-5,000 запитів/день на 1000 користувачів

---

### 🔥 **Максимальна аналітика (тимчасово)**

**Файл:** `public/config.js`
```javascript
window.RUNTIME_CONFIG = {
  ANALYTICS_LEVEL: 'FULL',                 // 🔥 Максимум
  ANALYTICS_SAMPLING_RATE: 100,            // 📈 Всі користувачі  
  ANALYTICS_DEBUG_MODE: true,              // 🐛 З debug
  ANALYTICS_ENABLED: true
};
```

**⚠️ ОБЕРЕЖНО:** 26,000 запитів/день на 1000 користувачів - може перевищити ліміти!

---

### 🧪 **Тестування нових функцій**

**Файл:** `.env.local`
```bash
REACT_APP_ANALYTICS_LEVEL=STANDARD
```

**Або консоль браузера:**
```javascript
// Тимчасова зміна без перебілду
window.RUNTIME_CONFIG.ANALYTICS_LEVEL = 'STANDARD';
location.reload();
```

---

### 💤 **Вимкнути аналітику повністю**

**Файл:** `public/config.js`
```javascript
window.RUNTIME_CONFIG = {
  ANALYTICS_ENABLED: false,                // ❌ Повністю вимкнути
  // інші налаштування ігноруються
};
```

---

## 🎛️ **Додаткові опції налагодження**

### Debug режим
```javascript
window.RUNTIME_CONFIG = {
  ANALYTICS_DEBUG_MODE: true,              // 🐛 Детальні логи
  DISABLE_ANALYTICS_LOCALHOST: true       // ❌ Вимкнути на localhost
};
```

### Кастомний sampling для тестування
```javascript
window.RUNTIME_CONFIG = {
  ANALYTICS_LEVEL: 'PRODUCTION',
  ANALYTICS_SAMPLING_RATE: 100,           // 📈 Всі користувачі для тестування
};
```

---

## 🔍 **Як перевірити поточні налаштування**

### В консолі браузера:
```javascript
// Поточна конфігурація
console.log('Analytics config:', window.analyticsConfig);

// Активні функції
console.log('Session tracking:', window.isFeatureEnabled?.('sessionTracking'));
console.log('IP detection:', window.isFeatureEnabled?.('ipDetection'));

// Sampling rate
console.log('Sampling rate:', window.getSamplingRate?.() + '%');
```

### Лог при завантаженні сторінки:
```
📊 Analytics Level: PRODUCTION {
  pageViews: true,
  productEvents: true, 
  sessionTracking: false,
  samplingRate: 30
}
```

---

## 📊 **Моніторинг використання Google Apps Script**

### Перевірка лімітів:
1. **Google Apps Script Dashboard** → Executions
2. **Щоденний моніторинг:** <20,000 запитів/день
3. **Консоль браузера:** Помилки типу "Service unavailable"

### Сигнали перевищення лімітів:
```javascript
// В консолі браузера при помилках:
❌ Analytics request failed: Service unavailable
⚠️ Switching to offline mode
```

---

## 🎯 **Рекомендації для різних сценаріїв**

| Сценарій | Режим | Sampling | Файл |
|----------|-------|----------|------|
| 👨‍💻 Розробка | Авто (FULL) | 100% | - |
| 🌐 Продакшн (звичайний) | PRODUCTION | 30% | public/config.js |
| 📊 Потрібна детальна аналітика | PRODUCTION_FULL | 50% | public/config.js |
| 🔥 Важлива подія/тест | FULL | 100% | Консоль браузера |
| 💤 Технічні роботи | - | - | ANALYTICS_ENABLED: false |
| 🧪 A/B тестування | STANDARD | 100% | .env.local |

**Найкращий вибір для більшості випадків: PRODUCTION_FULL з 50% sampling** - дає баланс між функціональністю та лімітами!

---

## 🚨 **Швидкі команди для екстрених ситуацій**

### Терміново вимкнути аналітику:
```javascript
// В консолі браузера
window.RUNTIME_CONFIG.ANALYTICS_ENABLED = false;
location.reload();
```

### Зменшити навантаження на 90%:
```javascript
// В консолі браузера
window.RUNTIME_CONFIG.ANALYTICS_LEVEL = 'BASIC';
window.RUNTIME_CONFIG.ANALYTICS_SAMPLING_RATE = 10;
location.reload();
```

### Увімкнути debug для діагностики:
```javascript
// В консолі браузера
window.RUNTIME_CONFIG.ANALYTICS_DEBUG_MODE = true;
location.reload();
```

---

## 📋 **Чек-лист перед зміною конфігурації в продакшн**

- [ ] Перевірити поточне використання Google Apps Script
- [ ] Розрахувати очікувану кількість запитів
- [ ] Протестувати конфігурацію на localhost
- [ ] Зробити backup поточних налаштувань
- [ ] Запланувати час моніторингу після змін
- [ ] Підготувати план відкату (rollback)

---

*Останнє оновлення: 21 серпня 2025*
*Створено автоматично системою аналітики*