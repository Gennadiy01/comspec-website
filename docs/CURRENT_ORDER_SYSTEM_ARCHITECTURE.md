# 📋 АРХІТЕКТУРА ІСНУЮЧОЇ СИСТЕМИ ЗАМОВЛЕНЬ COMSPEC

**Дата аналізу:** 25 липня 2025  
**Мета:** Підготовка до інтеграції Telegram Bot

---

## 🔍 ЗАГАЛЬНИЙ ОГЛЯД СИСТЕМИ

Існуюча система оформлення заявок працює через **Google Apps Script** як backend і **React OrderModal** як frontend. Заявки зберігаються в **Google Sheets** з автоматичним призначенням менеджерів.

---

## 🏗️ АРХІТЕКТУРА КОМПОНЕНТІВ

### 📱 **FRONTEND (React)**

#### 1. **OrderModalContext.js** - Управління станом
```javascript
// Функції контексту:
- openOrderModal(data) // Відкриття з передачею даних
- closeOrderModal()    // Закриття та очищення
- orderData: { product, source, preSelectedProduct }
```

#### 2. **OrderModal.js** - Головний компонент (1008 рядків)
```javascript
// Режими роботи:
- isConsultationMode = orderData?.source === 'services-page'
- Звичайний режим замовлення (з продуктами)

// Поля форми:
- name (обов'язкове) - українські літери + валідація
- phone (обов'язкове) - автоформатування +380
- email (опціональне) - валідація формату
- product - автозаповнення з мапінгу категорій
- deliveryType - 'delivery' | 'pickup'
- address - з AddressSearch компонентом
- loadingPoint - залежить від продукту
- message - до 1000 символів
```

#### 3. **AddressSearch.js** - Пошук адрес
```javascript
// Функції:
- Google Places API інтеграція
- Валідація зон доставки
- Автокомпліт адрес
- Визначення регіону доставки
```

#### 4. **ValidationUtils** - Валідація даних
```javascript
// Функції валідації:
- validatePhone() - українські номери
- validateName() - українські літери
- validateEmail() - стандартна валідація
- validateOrderForm() - комплексна валідація
- prepareDataForSheets() - підготовка для відправки
```

---

### 🔧 **BACKEND (Google Apps Script)**

#### 1. **JSONPGoogleSheetsService.js** - JSONP клієнт
```javascript
// URL: https://script.google.com/macros/s/AKfycbz3X.../exec
// Методи:
- saveOrder(orderData, isConsultationMode, source)
- testConnection() - перевірка з'єднання
- Таймаут: 20 секунд
- Обхід CORS через JSONP
```

#### 2. **Google Apps Script** (серверна частина)
```javascript
// Функції (передбачувані):
- saveOrder() - збереження в Google Sheets
- assignManager() - призначення менеджера
- generateOrderId() - генерація ID замовлення
- validateData() - серверна валідація
```

---

### 📊 **DATABASE (Google Sheets)**

#### Структура таблиці замовлень:
```
Колонки:
- Date, Time - дата і час
- Order_ID - унікальний ідентифікатор  
- Name, Phone, Email - контактні дані
- Product - назва товару
- Delivery_Type - тип доставки
- Address, Region - адреса та регіон
- Loading_Point - пункт навантаження
- Message - повідомлення клієнта
- Manager - призначений менеджер
- Source - джерело замовлення
- Mode - consultation | order
```

---

## 🔄 ПОТІК ДАНИХ

### 1. **Ініціація замовлення:**
```
Користувач натискає кнопку → openOrderModal({
  product: 'gravel',
  source: 'product-page'
})
```

### 2. **Заповнення форми:**
```
OrderModal → Валідація в реальному часі → 
ValidationUtils.validateOrderForm() → 
Очищення даних
```

### 3. **Відправка замовлення:**
```
handleSubmit() → 
ValidationUtils.prepareDataForSheets() → 
JSONPGoogleSheetsService.saveOrder() → 
Google Apps Script → 
Google Sheets
```

### 4. **Відповідь системи:**
```
Google Apps Script response: {
  success: true,
  orderId: "#12345",
  manager: "Олександр Петренко",
  data: { /* збережені дані */ }
}
```

---

## 🎯 АЛГОРИТМ ПРИЗНАЧЕННЯ МЕНЕДЖЕРІВ

**❗ ВАЖЛИВО:** Алгоритм призначення менеджерів знаходиться в **Google Apps Script** (серверна частина).

### Передбачувана логіка:
1. **Черговість** - по колу між активними менеджерами
2. **Робочий час** - 8:00-20:00, пн-сб
3. **Навантаження** - рівномірний розподіл
4. **Спеціалізація** - можливо по регіонах/продуктах

### Поля в відповіді:
```javascript
{
  manager: "Ім'я Прізвище", // Призначений менеджер
  managerId: "unique_id",    // ID менеджера (можливо)
  managerPhone: "+380...",   // Телефон (можливо)
  managerTelegram: "@user"   // Telegram (для майбутньої інтеграції)
}
```

---

## 📍 ТОЧКИ ІНТЕГРАЦІЇ ДЛЯ TELEGRAM

### 1. **Клієнтська частина (React):**
```javascript
// У handleSubmit() OrderModal.js після успішного збереження:
if (result.success) {
  // ✅ Існуюче: збереження в Google Sheets
  
  // 🆕 ДОДАТИ: відправка в Telegram
  await telegramService.sendOrderNotification({
    orderId: result.orderId,
    manager: result.manager,
    orderData: result.data
  });
}
```

### 2. **Серверна частина (Google Apps Script):**
```javascript
// У функції saveOrder():
// ✅ Існуюче: призначення менеджера

// 🆕 ДОДАТИ: отримання Telegram ID менеджера
const telegramId = getManagerTelegramId(assignedManager);

// 🆕 ДОДАТИ: відправка повідомлення
sendTelegramNotification(telegramId, orderData);
```

### 3. **Конфігурація:**
```javascript
// Додати в environment.js:
TELEGRAM_BOT_TOKEN: 'your_bot_token',
TELEGRAM_CHAT_ID: 'manager_group_id'
```

---

## 🔒 БЕЗПЕКА ТА АУТЕНТИФІКАЦІЯ

### Поточні методи:
- **Google Apps Script** - публічний endpoint
- **JSONP** - обхід CORS обмежень  
- **Валідація** - тільки на frontend

### Для Telegram інтеграції потрібно:
- **Bot Token** захищений
- **Webhook** або **Polling**
- **Whitelist** дозволених чатів

---

## 📈 МЕТРИКИ ТА ВІДСТЕЖЕННЯ

### Поточне логування:
```javascript
// OrderModal.js - детальне логування
console.log('Відправляємо замовлення:', orderData);
console.log('Замовлення збережено:', result);

// JSONPGoogleSheetsService.js - діагностика
if (config.DEBUG_MODE) {
  console.log('Параметри відправки:', params);
}
```

### Для Telegram потрібно додати:
- Логування відправлених повідомлень
- Статус доставки в Telegram
- Помилки Telegram API

---

## 🎛️ НАЛАШТУВАННЯ СЕРЕДОВИЩА

### Поточна конфігурація:
```javascript
// environment.js
development: {
  GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbz3X.../exec',
  GOOGLE_MAPS_API_KEY: 'AIzaSyBge_xII...',
  DEBUG_MODE: true
}

github: {
  // Ті самі значення для GitHub Pages
}
```

### Для Telegram додати:
```javascript
TELEGRAM_BOT_TOKEN: getEnvVar('REACT_APP_TELEGRAM_BOT_TOKEN'),
TELEGRAM_CHAT_ID: getEnvVar('REACT_APP_TELEGRAM_CHAT_ID'),
TELEGRAM_ENABLED: getEnvVar('REACT_APP_TELEGRAM_ENABLED', 'false')
```

---

## 🔧 ТЕХНІЧНІ ОСОБЛИВОСТІ

### 1. **JSONP замість AJAX:**
- Обходить CORS обмеження
- Таймаут 20 секунд
- Автоматичний cleanup

### 2. **Двоходова валідація:**
- Frontend - ValidationUtils
- Backend - Google Apps Script

### 3. **Мапінг категорій:**
```javascript
const categoryMapping = {
  'gravel': 'Щебінь',
  'sand': 'Пісок', 
  'asphalt': 'Асфальт',
  'concrete': 'Бетон'
};
```

### 4. **Режими форми:**
- **Consultation** - тільки контакти + повідомлення
- **Order** - повна форма з продуктами та доставкою

---

## 🚀 РЕКОМЕНДАЦІЇ ДЛЯ TELEGRAM ІНТЕГРАЦІЇ

### 1. **Мінімальні зміни:**
- Додати TelegramService.js
- Інтегрувати в OrderModal.handleSubmit()
- Розширити Google Apps Script

### 2. **Поетапна реалізація:**
1. **Фаза 1:** Прості повідомлення в групу
2. **Фаза 2:** Персональні повідомлення менеджерам  
3. **Фаза 3:** Інтерактивні кнопки в Telegram

### 3. **Збереження сумісності:**
- Система має працювати БЕЗ Telegram
- Telegram як додатковий канал
- Fallback на email при помилках

---

## 📞 ВИСНОВКИ

Існуюча система замовлень **добре структурована** та **стабільна**. Вона готова для інтеграції з Telegram з мінімальними змінами:

✅ **Готові компоненти:** OrderModal, валідація, Google Sheets інтеграція  
✅ **Гнучка архітектура:** Легко додати Telegram сервіс  
✅ **Детальне логування:** Простий debugging нових функцій  

❗ **Потрібно дослідити:** Точний алгоритм призначення менеджерів в Google Apps Script для коректної інтеграції з Telegram.

---

*Документ створено для підготовки до імплементації Telegram Bot інтеграції*