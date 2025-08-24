# 📊 Документація системи аналітики COMSPEC

Ця папка містить всю документацію по системі аналітики сайту COMSPEC.

## 📚 Документи

### 📋 [ANALYTICS_CONFIGURATION_GUIDE.md](./ANALYTICS_CONFIGURATION_GUIDE.md)
**Інструкція по налагодженню режимів аналітики**
- 🎯 Огляд всіх режимів аналітики (BASIC, STANDARD, FULL, PRODUCTION, PRODUCTION_FULL)
- 📁 Файли конфігурації та їх пріоритети
- 🔧 Покрокові інструкції для різних сценаріїв
- 🔍 Debug команди та діагностика
- 🚨 Екстрені команди для швидкого відключення

### 📊 [ANALYTICS_POPULAR_PRODUCTS_SYSTEM.md](./ANALYTICS_POPULAR_PRODUCTS_SYSTEM.md)  
**Повна документація системи аналітики та популярних товарів**
- 🏗️ Архітектура системи та потік даних
- 🔧 Компоненти (ProductAnalytics, SessionAnalytics, PopularProducts)
- 🎨 UI/UX інтеграція та responsive дизайн
- ☁️ Google Sheets інтеграція
- 🔥 Session Tracking v4.0 з IP detection
- 🐛 Відладка та діагностика

---

## 🚀 Швидкий старт

### Для розробки:
1. Запустіть `npm start`
2. Система автоматично переключиться в режим FULL
3. Всі функції будуть увімкнені

### Для продакшн:
1. Відредагуйте `public/config.js`:
```javascript
window.RUNTIME_CONFIG = {
  ANALYTICS_LEVEL: 'PRODUCTION',      // або 'PRODUCTION_FULL'
  ANALYTICS_SAMPLING_RATE: 30,        // 30% користувачів
  ANALYTICS_DEBUG_MODE: false
};
```

### Debug команди:
```javascript
// В консолі браузера
window.analyticsDebug()     // Стан аналітики
window.sessionTest()        // Тест session tracking
window.sessionStats()       // Статистика сесії
```

---

## 📈 Режими аналітики (коротко)

| Режим | Запити/день (1000 users) | Функції |
|-------|--------------------------|---------|
| **BASIC** | ~2,000 | Тільки page views |
| **STANDARD** | ~5,000 | + Product events |
| **FULL** | ~26,000 | Всі функції |
| **PRODUCTION** | ~1,000 | Оптимізовано |
| **PRODUCTION_FULL** | ~5,000 | Баланс функцій і лімітів |

**Google Apps Script ліміт:** 20,000 запитів/день (безкоштовно)

---

## 🎯 Рекомендації

- **Розробка:** Використовуйте автоматичний FULL режим
- **Продакшн (стандартний):** PRODUCTION режим
- **Потрібна детальна аналітика:** PRODUCTION_FULL режим
- **Тестування функцій:** Тимчасово FULL через консоль браузера

---

*Останнє оновлення: 21 серпня 2025*  
*Версія системи аналітики: v4.0 (Session Tracking)*