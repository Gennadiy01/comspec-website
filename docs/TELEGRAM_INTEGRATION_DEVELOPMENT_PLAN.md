# 🚀 ПЛАН РОЗРОБКИ TELEGRAM ІНТЕГРАЦІЇ COMSPEC

**Дата створення:** 25 липня 2025  
**Мета:** Додання функціоналу відправки заявок в Telegram  
**Тип документу:** Тимчасовий план розробки  

---

## 🎯 ЗАГАЛЬНА МЕТА

Інтегрувати Telegram Bot API для автоматичного надсилання повідомлень про нові замовлення відповідальним менеджерам, зберігаючи повну сумісність з існуючою системою.

---

## 📋 ЕТАПИ РОЗРОБКИ

### 🔧 **ЕТАП 1: ПІДГОТОВКА ТА НАЛАШТУВАННЯ** (1-2 дні)

#### **Завдання:**
1. **Створення Telegram Bot**
   - Реєстрація бота через @BotFather
   - Отримання Bot Token
   - Налаштування базових команд

2. **Налаштування середовища**
   - Додавання Telegram конфігурації в environment.js
   - Створення .env змінних для токенів
   - Налаштування для різних середовищ (dev/prod)

3. **Створення базової структури**
   - TelegramService.js - основний сервіс
   - Telegram утиліти та хелпери
   - Базові типи та інтерфейси

#### **Необхідні дані:**
```javascript
// Конфігурація
TELEGRAM_BOT_TOKEN: "123456789:ABCDEF..." // від @BotFather
TELEGRAM_ENABLED: true/false              // можливість вимкнути
TELEGRAM_API_URL: "https://api.telegram.org/bot"

// Менеджери та чати
TELEGRAM_MAIN_CHAT_ID: "-1001234567890"  // Основна група менеджерів
TELEGRAM_MANAGERS: [
  {
    name: "Олександр Петренко",
    chatId: "123456789",
    phone: "+380671234567",
    specialization: ["Київ", "Київська область"]
  },
  // ... інші менеджери
]
```

#### **Очікувані результати:**
- ✅ Працюючий Telegram Bot
- ✅ Базова конфігурація в проекті
- ✅ TelegramService.js з методами підключення
- ✅ Тестове повідомлення відправляється успішно

---

### 💻 **ЕТАП 2: FRONTEND ІНТЕГРАЦІЯ** (1 день)

#### **Завдання:**
1. **Розширення TelegramService**
   ```javascript
   class TelegramService {
     async sendOrderNotification(orderData)
     async sendManagerNotification(managerId, orderData)
     async testConnection()
     formatOrderMessage(orderData)
   }
   ```

2. **Інтеграція в OrderModal**
   - Додавання Telegram відправки в handleSubmit()
   - Обробка помилок Telegram API
   - Fallback механізми при недоступності

3. **Конфігурація та налаштування**
   - Розширення environment.js
   - Додавання Telegram налаштувань
   - Feature flags для увімкнення/вимкнення

#### **Зміни в коді:**
```javascript
// OrderModal.js - handleSubmit()
try {
  // ✅ Існуюче: збереження в Google Sheets
  const result = await jsonpService.saveOrder(orderDataForSheets, isConsultationMode, source);
  
  if (result.success) {
    // 🆕 НОВИЙ: відправка в Telegram
    if (config.TELEGRAM_ENABLED) {
      try {
        await telegramService.sendOrderNotification({
          orderId: result.orderId,
          manager: result.manager,
          orderData: result.data,
          isConsultation: isConsultationMode
        });
        console.log('✅ Telegram повідомлення відправлено');
      } catch (telegramError) {
        console.warn('⚠️ Помилка Telegram (замовлення збережено):', telegramError);
        // Не блокуємо основний процес
      }
    }
    
    setSubmitResult(result);
    setShowSuccess(true);
  }
} catch (error) {
  // Обробка основних помилок
}
```

#### **Очікувані результати:**
- ✅ TelegramService інтегрований в OrderModal
- ✅ Повідомлення відправляються при створенні замовлення
- ✅ Система працює стабільно навіть при відключеному Telegram
- ✅ Детальне логування Telegram операцій

---

### 🔧 **ЕТАП 3: BACKEND РОЗШИРЕННЯ** (1-2 дні)

#### **Завдання:**
1. **Розширення Google Apps Script**
   ```javascript
   // Додати функції:
   function getManagerTelegramId(managerName)
   function sendTelegramNotification(chatId, orderData)
   function getTelegramConfig()
   ```

2. **База даних менеджерів**
   - Створення таблиці з Telegram ID менеджерів
   - Зв'язування імен менеджерів з їх чатами
   - Налаштування спеціалізацій та регіонів

3. **Webhook налаштування (опціонально)**
   - Налаштування Telegram Webhook для зворотного зв'язку
   - Обробка статусів доставки повідомлень

#### **Структура даних менеджерів:**
```javascript
// Google Sheets: "Managers" таблиця
[
  {
    "Name": "Олександр Петренко",
    "Phone": "+380671234567", 
    "TelegramChatId": "123456789",
    "TelegramUsername": "@alex_petenko",
    "Specialization": "Київ,Київська область",
    "WorkHours": "8:00-20:00",
    "Active": true
  }
  // ... інші менеджери
]
```

#### **Очікувані результати:**
- ✅ Google Apps Script розширений Telegram функціоналом
- ✅ База менеджерів з Telegram ID створена
- ✅ Автоматичне призначення + Telegram повідомлення
- ✅ Серверна частина готова до продакшну

---

### 📱 **ЕТАП 4: ФОРМАТУВАННЯ ПОВІДОМЛЕНЬ ТА INLINE КНОПКИ** (1-1.5 дня)

#### **Завдання:**
1. **Шаблони повідомлень**
   ```javascript
   // Для нових замовлень:
   🆕 НОВЕ ЗАМОВЛЕННЯ #12345
   
   👤 Клієнт: Іван Іваненко
   📞 Телефон: +380671234567
   📧 Email: ivan@email.com
   
   📦 Товар: Щебінь
   🚚 Доставка: м. Київ, вул. Хрещатик, 1
   💬 Коментар: Фракція 5-20мм
   
   ⏰ Час: 25.07.2025 14:30
   👨‍💼 Менеджер: Олександр Петренко
   
   ┌─────────────────────────┐
   │   📞 Зателефонувати     │  ← ПРЯМИЙ ДЗВІНОК
   ├─────────────────────────┤
   │ ✅ Прийнято │ ❌ Відхилено │
   └─────────────────────────┘
   ```

2. **Різні типи повідомлень**
   - Замовлення з доставкою
   - Замовлення самовивіз
   - Консультації
   - Тестові повідомлення

3. **🆕 Інтерактивні inline кнопки**
   ```javascript
   // Основні дії менеджера:
   [
     [
       { text: "📞 Дзвінок клієнту", url: `tel:${phone}` },
       { text: "💬 SMS", url: `sms:${phone}` }
     ],
     [
       { text: "📧 Email", url: `mailto:${email}` },
       { text: "📍 Адреса на карті", url: `https://maps.google.com/?q=${address}` }
     ],
     [
       { text: "✅ Замовлення прийнято", callback_data: `accept_${orderId}` },
       { text: "❌ Відхилити", callback_data: `reject_${orderId}` }
     ],
     [
       { text: "📞 Дзвінок завершено", callback_data: `call_completed_${orderId}` }
     ]
   ]
   ```

4. **🆕 Callback обробка (Webhook)**
   - Обробка натискань кнопок
   - Оновлення статусу замовлення
   - Логування дій менеджерів
   - Відповіді на callback_query

#### **🆕 Розширений приклад коду:**
```javascript
class TelegramMessageFormatter {
  static formatOrderMessage(orderData) {
    const { orderId, customer, product, delivery, manager } = orderData;
    
    return `
🆕 <b>НОВЕ ЗАМОВЛЕННЯ #${orderId}</b>

👤 <b>Клієнт:</b> ${customer.name}
📞 <b>Телефон:</b> <a href="tel:${customer.phone}">${customer.phone}</a>
${customer.email ? `📧 <b>Email:</b> ${customer.email}` : ''}

📦 <b>Товар:</b> ${product.name}
🚚 <b>Доставка:</b> ${delivery.address}
${delivery.comment ? `💬 <b>Коментар:</b> ${delivery.comment}` : ''}

⏰ <b>Час:</b> ${new Date().toLocaleString('uk-UA')}
👨‍💼 <b>Менеджер:</b> ${manager}
    `.trim();
  }

  // 🆕 НОВИЙ: Створення inline кнопок
  static createInlineKeyboard(orderData) {
    const { customer, orderId } = orderData;
    
    return {
      inline_keyboard: [
        [
          {
            text: "📞 Зателефонувати клієнту",
            url: `tel:${customer.phone}`
          }
        ],
        customer.email ? [
          {
            text: "📧 Написати email", 
            url: `mailto:${customer.email}`
          }
        ] : [],
        orderData.delivery?.address ? [
          {
            text: "📍 Показати на карті",
            url: `https://maps.google.com/?q=${encodeURIComponent(orderData.delivery.address)}`
          }
        ] : [],
        [
          {
            text: "✅ Замовлення прийнято",
            callback_data: `accept_${orderId}`
          },
          {
            text: "❌ Відхилити",
            callback_data: `reject_${orderId}`
          }
        ],
        [
          {
            text: "📞 Дзвінок завершено",
            callback_data: `call_completed_${orderId}`
          }
        ]
      ].filter(row => row.length > 0) // Прибираємо пусті рядки
    };
  }
}

// 🆕 НОВИЙ: Webhook обробник
class TelegramWebhookHandler {
  static async handleCallback(callbackQuery) {
    const { data, message, from } = callbackQuery;
    const [action, orderId] = data.split('_');
    
    switch (action) {
      case 'accept':
        await this.updateOrderStatus(orderId, 'accepted', from.username);
        return "✅ Замовлення прийнято в обробку";
        
      case 'reject':
        await this.updateOrderStatus(orderId, 'rejected', from.username);
        return "❌ Замовлення відхилено";
        
      case 'call':
        if (data.includes('completed')) {
          await this.logManagerAction(orderId, 'call_completed', from.username);
          return "📞 Дзвінок зафіксовано";
        }
        break;
        
      default:
        return "❓ Невідома команда";
    }
  }
}
```

#### **Очікувані результати:**
- ✅ Красиві, інформативні повідомлення
- ✅ Різні шаблони для різних типів замовлень
- ✅ **🆕 Inline кнопки з прямими дзвінками** - `tel:` посилання
- ✅ **🆕 Кнопки для email та карт** - `mailto:` та Google Maps
- ✅ **🆕 Інтерактивні кнопки статусу** - прийняти/відхилити
- ✅ **🆕 Відстеження дій менеджерів** - логування дзвінків
- ✅ **🆕 Webhook обробка** - реакція на натискання кнопок
- ✅ Підтримка HTML форматування

---

### ✅ **ЕТАП 5: ТЕСТУВАННЯ ТА ВІДЛАДКА** (1 день)

#### **Завдання:**
1. **Unit тести**
   - Тести TelegramService методів
   - Тести форматування повідомлень
   - Мок тести Telegram API

2. **Інтеграційні тести**
   - Повний цикл: форма → Google Sheets → Telegram
   - Тести різних сценаріїв замовлень
   - Тести помилок та fallback

3. **Ручне тестування**
   - Перевірка в різних браузерах
   - Тестування на мобільних пристроях
   - Перевірка всіх шаблонів повідомлень

#### **🆕 Розширені тест кейси:**
```javascript
// Основні сценарії:
✅ Звичайне замовлення з доставкою
✅ Замовлення самовивіз
✅ Консультація з сторінки послуг
✅ Замовлення без email
✅ Замовлення з довгим коментарем

// 🆕 Тести inline кнопок:
✅ Натискання "📞 Дзвінок" - відкриває дозвонювач
✅ Натискання "📧 Email" - відкриває поштовий клієнт
✅ Натискання "📍 Карта" - відкриває Google Maps
✅ Кнопка "✅ Прийнято" - оновлює статус в Google Sheets
✅ Кнопка "❌ Відхилено" - логує відхилення
✅ "📞 Дзвінок завершено" - фіксує завершення розмови

// 🆕 Тести Webhook:
✅ Callback_query обробляється коректно
✅ Статуси оновлюються в базі даних
✅ Помилки webhook не ламають систему
✅ Логування дій менеджерів працює

// Помилки та fallback:
✅ Помилка Telegram API (система працює)
✅ Відключений Telegram (система працює)
✅ Неправильний токен (система працює)
✅ Недоступний webhook (основний функціонал працює)
```

#### **Очікувані результати:**
- ✅ Всі тести проходять успішно
- ✅ Система стабільно працює в різних умовах
- ✅ Помилки Telegram не впливають на основний функціонал
- ✅ Детальне логування для діагностики

---

### 🚀 **ЕТАП 6: ДЕПЛОЙ ТА МОНІТОРИНГ** (0.5 дня)

#### **Завдання:**
1. **Налаштування продакшн середовища**
   - Додавання Telegram токенів в GitHub Secrets
   - Налаштування environment variables
   - Конфігурація для GitHub Pages

2. **Деплой та перевірка**
   - Deploy на GitHub Pages
   - Перевірка роботи в продакшні
   - Тестування з реальними замовленнями

3. **Моніторинг та логування**
   - Налаштування алертів для помилок Telegram
   - Моніторинг успішності відправки
   - Аналітика використання

#### **🆕 Розширений Production checklist:**
```bash
# Environment variables:
✅ REACT_APP_TELEGRAM_BOT_TOKEN
✅ REACT_APP_TELEGRAM_CHAT_ID  
✅ REACT_APP_TELEGRAM_ENABLED=true
✅ REACT_APP_TELEGRAM_WEBHOOK_URL  # 🆕 для callback обробки

# GitHub Secrets:
✅ TELEGRAM_BOT_TOKEN
✅ TELEGRAM_MAIN_CHAT_ID
✅ TELEGRAM_WEBHOOK_SECRET  # 🆕 для безпеки webhook

# 🆕 Bot налаштування:
✅ Webhook URL налаштований
✅ Inline кнопки працюють
✅ Callback_query обробляється

# Verification:
✅ Bot відповідає на команди
✅ Тестове замовлення приходить в Telegram
✅ Кнопка "📞 Дзвінок" відкриває дозвонювач  # 🆕
✅ Кнопки статусу оновлюють Google Sheets     # 🆕
✅ Fallback працює при помилках
✅ Логування дій менеджерів працює
✅ Webhook працює стабільно                   # 🆕
```

#### **Очікувані результати:**
- ✅ Telegram інтеграція працює в продакшні
- ✅ Менеджери отримують повідомлення про замовлення
- ✅ **🆕 Прямі дзвінки з Telegram** - один клік = дзвінок клієнту
- ✅ **🆕 Інтерактивне управління замовленнями** - кнопки статусу
- ✅ **🆕 Логування дій менеджерів** - відстеження роботи
- ✅ Система стабільна та надійна
- ✅ Моніторинг та алерти налаштовані

---

## 📊 НЕОБХІДНІ ДАНІ ДЛЯ ІНТЕГРАЦІЇ

### 🔑 **Токени та ключі:**
```bash
# Основні
TELEGRAM_BOT_TOKEN="123456789:ABCDEF1234567890abcdef..."
TELEGRAM_MAIN_CHAT_ID="-1001234567890"

# Додаткові
TELEGRAM_API_URL="https://api.telegram.org/bot"
TELEGRAM_ENABLED="true"
TELEGRAM_TIMEOUT="10000"
```

### 👥 **Дані менеджерів:**
```json
[
  {
    "id": 1,
    "name": "Олександр Петренко",
    "phone": "+380671234567",
    "telegramChatId": "123456789",
    "telegramUsername": "@alex_petenko", 
    "email": "alex@comspec.ua",
    "specialization": ["Київ", "Київська область"],
    "workHours": "8:00-20:00",
    "timezone": "Europe/Kiev",
    "active": true
  }
]
```

### 🏗️ **Конфігурація бота:**
```json
{
  "name": "COMSPEC Orders Bot",
  "username": "@comspec_orders_bot",
  "commands": [
    {"command": "start", "description": "Запуск бота"},
    {"command": "status", "description": "Статус системи"},
    {"command": "test", "description": "Тестове повідомлення"}
  ],
  "settings": {
    "group_privacy": false,
    "join_groups": true,
    "read_messages": true
  }
}
```

---

## 🎯 ОЧІКУВАНІ РЕЗУЛЬТАТИ

### 🚀 **Після завершення розробки:**

1. **Функціональність:**
   - ✅ Автоматичні Telegram повідомлення при кожному замовленні
   - ✅ Персоналізовані повідомлення для кожного менеджера
   - ✅ Красиве форматування з inline кнопками
   - ✅ Повна сумісність з існуючою системою

2. **Надійність:**
   - ✅ Система працює навіть при відключеному Telegram
   - ✅ Автоматичний fallback при помилках
   - ✅ Детальне логування для діагностики
   - ✅ Graceful degradation

3. **Зручність:**
   - ✅ Миттєві сповіщення менеджерів
   - ✅ Вся інформація про замовлення в одному повідомленні
   - ✅ Прямі посилання для дзвінків клієнтам
   - ✅ Можливість швидкого реагування

4. **Масштабованість:**
   - ✅ Легко додавати нових менеджерів
   - ✅ Гнучка конфігурація спеціалізацій
   - ✅ Підтримка множинних чатів
   - ✅ Готовність до розширення функціоналу

---

## ⚡ КРИТИЧНІ МОМЕНТИ

### ❗ **Безпека:**
- Telegram токени ТІЛЬКИ в environment variables
- Ніколи не комітити токени в Git
- Валідація всіх вхідних даних
- Обмеження доступу до бота

### ❗ **Продуктивність:**
- Асинхронна відправка (не блокувати UI)
- Таймаути для Telegram API (10 секунд)
- Retry механізм при тимчасових помилках
- Rate limiting для запобігання спаму

### ❗ **UX:**
- Telegram помилки НЕ мають блокувати замовлення
- Прозоре логування для діагностики
- Повідомлення користувачу при успішній відправці
- Fallback повідомлення при помилках

---

## 📅 РОЗКЛАД ВИКОНАННЯ

| Етап | Тривалість | Відповідальний | Результат |
|------|------------|----------------|-----------|
| **1. Підготовка** | 1-2 дні | Developer | Bot створений, базова структура |
| **2. Frontend** | 1 день | Developer | TelegramService інтегрований |
| **3. Backend** | 1-2 дні | Developer | Google Apps Script розширений |
| **4. 🆕 Форматування + Inline кнопки** | 1-1.5 дня | Developer | Повідомлення + кнопки дзвінків |
| **5. Тестування** | 1 день | Developer + QA | Всі тести + кнопки проходять |
| **6. Деплой + Webhook** | 0.5-1 день | DevOps | Працює в продакшні з кнопками |

**🆕 Загальна тривалість: 6-8.5 днів** (збільшено через inline кнопки та webhook)

---

## 🎯 SUCCESS CRITERIA

Інтеграція вважається успішною, якщо:

1. ✅ Кожне замовлення автоматично потрапляє в Telegram
2. ✅ Менеджери отримують повідомлення протягом 10 секунд
3. ✅ **🆕 Кнопка "📞 Дзвінок" відкриває дозвонювач одним кліком**
4. ✅ **🆕 Кнопки статусу ("✅ Прийнято", "❌ Відхилено") працюють**
5. ✅ **🆕 Webhook обробляє callback_query без помилок**
6. ✅ **🆕 Дії менеджерів логуються в Google Sheets**
7. ✅ Система працює стабільно 99.9% часу
8. ✅ Помилки Telegram НЕ впливають на основний процес
9. ✅ Усі тести проходять успішно (включно з inline кнопками)
10. ✅ Менеджери задоволені новим функціоналом та зручністю дзвінків

---

*Документ буде оновлюватися по мірі прогресу розробки*  
*Статус: **План затверджений, готовий до реалізації***