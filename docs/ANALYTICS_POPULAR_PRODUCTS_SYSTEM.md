# 📊 Система аналітики та популярних товарів COMSPEC

**Дата створення:** 20.08.2025  
**Версія:** 1.0  
**Тип:** Технічна документація  
**Статус:** ✅ Повністю реалізовано та працює

---

## 📋 Огляд системи

### 🎯 Призначення
Повноцінна система відстеження поведінки користувачів та відображення популярних товарів на основі реальної аналітики переглядів.

### ✨ Основні функції:
- 👁️ **Відстеження переглядів товарів** - автоматичне збереження кожного перегляду
- 📊 **Система популярних товарів** - динамічне відображення топ-товарів за переглядами  
- 🏠 **Homepage інтеграція** - секція "Популярні товари" на головній сторінці
- 💾 **Локальне збереження** - дані зберігаються в localStorage
- ☁️ **Google Sheets інтеграція** - відправка аналітики на Google Sheets
- 📱 **Responsive дизайн** - 2-колонковий layout на desktop, adaptive на mobile

---

## 🏗️ Архітектура системи

### 📁 Структура файлів

```
src/analytics/
├── ProductAnalytics.js              # 🧠 Головний клас аналітики
├── GoogleSheetsAnalytics.js         # ☁️ Інтеграція з Google Sheets
└── components/
    └── PopularProducts.js           # 🎨 React компонент популярних товарів

src/pages/
├── Home.js                          # 🏠 Інтеграція на головній сторінці
└── ProductDetail.js                 # 👁️ Відстеження переглядів товарів

src/App.js                           # 🚀 Ініціалізація аналітики
```

### 🔄 Потік даних

```mermaid
graph TD
    A[Користувач переглядає товар] --> B[ProductDetail.js]
    B --> C[ProductAnalytics.trackProductView()]
    C --> D[Локальний кеш localStorage]
    C --> E[Черга подій для Google Sheets]
    E --> F[GoogleSheetsAnalytics.sendEvents()]
    F --> G[Google Sheets таблиця]
    
    D --> H[PopularProducts компонент]
    H --> I[Відображення на Homepage]
```

---

## 🔧 Компоненти системи

### 1️⃣ ProductAnalytics.js - Головний движок

```javascript
// Основні методи
import ProductAnalytics from './analytics/ProductAnalytics';

// Ініціалізація системи (автоматично в App.js)
ProductAnalytics.init();

// Відстеження перегляду товару
ProductAnalytics.trackProductView(productId, {
  title: 'Назва товару',
  category: 'gravel',
  price: 850
});

// Отримання популярних товарів
const popularProducts = ProductAnalytics.getPopularProducts(10);

// Відстеження подій (кліки, замовлення тощо)
ProductAnalytics.trackEvent('product_click', {
  productId: 'sand-river',
  source: 'homepage'
});

// Отримання статистики користувача
const stats = ProductAnalytics.getUserStats();
```

#### 🛡️ Захист від дублікатів
```javascript
// Автоматичний захист від React.StrictMode дублікатів
// Пропускає повторні виклики протягом 1 секунди
if (now - lastViewTime < 1000) {
  console.log('🚫 Пропускаємо дублікат перегляду');
  return;
}
```

#### 💾 Локальне збереження
```javascript
// Структура localStorage
{
  "comspec_analytics_cache": {
    "views": {
      "sand-river": 5,           // productId: кількість переглядів
      "gravel-5-20": 3,
      "sand-ravine": 8
    },
    "lastViewTime": {
      "sand-river": 1692547200000,  // timestamp останнього перегляду
      "gravel-5-20": 1692543600000
    }
  },
  "comspec_analytics_user_id": "user_abc123_1692547200000"
}
```

### 2️⃣ PopularProducts.js - React компонент

```javascript
// Використання в Home.js
import PopularProducts from '../analytics/components/PopularProducts';

<PopularProducts 
  limit={4}                    // Кількість товарів для показу
  showInHomepage={true}        // Режим homepage (з зображеннями)
  title="Популярні товари"     // Заголовок секції
  className="gray"             // Додаткові CSS класи
/>
```

#### 🎨 Режими відображення

**Homepage режим (showInHomepage={true}):**
- ✅ Показує зображення товарів
- ✅ 2-колонковий grid на desktop  
- ✅ Кнопка "Переглянути всі товари"
- ✅ Сірий фон секції

**Каталог режим (showInHomepage={false}):**
- ❌ Без зображень
- ✅ Компактний список
- ✅ Показує статистику переглядів
- ✅ Кнопки "Детальніше"

#### 🧩 Логіка fallback товарів

```javascript
// Якщо недостатньо товарів з переглядами - додаються рекомендовані
const recommendedIds = [
  'gravel-5-10',      // Щебінь 5-10 
  'sand-river',       // Пісок річковий
  'gravel-5-20',      // Щебінь 5-20
  'gravel-20-40',     // Щебінь 20-40
  'sand-ravine',      // Пісок яружний
  // ... та інші
];

// Завжди показується точно limit товарів
const products = [];
// 1. Спочатку товари з переглядами (відсортовані за популярністю)
// 2. Потім рекомендовані товари для заповнення до limit
```

### 3️⃣ GoogleSheetsAnalytics.js - Хмарна інтеграція

```javascript
// Автоматична відправка подій
const events = [
  {
    type: 'product_view',
    productId: 'sand-river',
    timestamp: 1692547200000,
    data: {
      title: 'Пісок річковий',
      category: 'sand',
      price: 450,
      userId: 'user_abc123',
      source: 'direct',
      deviceType: 'desktop'
    }
  }
];

await GoogleSheetsAnalytics.sendEvents(events);
```

#### ☁️ Структура Google Sheets таблиці

**Аркуш "PageViews":**
- timestamp, date, page_url, product_id, user_id, source, device_type

**Аркуш "ProductEvents":**  
- timestamp, date, event_type, product_id, user_id, source, extra_data

**Аркуш "PopularProducts":**
- product_id, total_views, last_viewed, rank

#### 🔄 Система черг та retry

```javascript
// Черга подій для batch відправки
this.eventQueue = [];

// Обробка кожні 30 секунд
setInterval(() => {
  this.processQueue();
}, 30000);

// Retry логіка для невдалих запитів
this.failedRequests = [];
// Автоматичні повторні спроби з експоненційним backoff
```

---

## 🎨 UI/UX компоненти

### 🏠 Homepage інтеграція

```scss
// Стилі для секції популярних товарів
.popular-products {
  &.homepage-version {
    .popular-products__list {
      display: grid;
      grid-template-columns: 1fr 1fr;  // 2 колонки на desktop
      gap: 1rem;
    }
  }
}

.popular-product-img {
  width: 100%;
  height: 100px;           // Desktop
  object-fit: cover;
  border-radius: 8px;
  
  @media (max-width: 1024px) {
    height: 80px;          // Tablet
  }
  
  @media (max-width: 768px) {
    height: 80px;          // Mobile
  }
}
```

### 📱 Responsive breakpoints

```scss
// Desktop (>1024px): 2 колонки, зображення 100x100px
// Tablet (≤1024px): 2 колонки, зображення 80x80px  
// Mobile (≤768px): 1 колонка, зображення 80x80px

@media (max-width: 1024px) {
  .popular-product-img { height: 80px; }
}

@media (max-width: 768px) {
  .popular-products__list {
    grid-template-columns: 1fr;  // 1 колонка на mobile
  }
}
```

### 🏷️ Бейджі статусу

```javascript
// Відображення статусу товару
{product.isRecommended ? (
  <span className="recommended-badge">Рекомендовано</span>
) : (
  <span className="view-count">{product.views} переглядів</span>
)}
```

---

## ⚙️ Конфігурація системи

### 🌍 Environment змінні

```javascript
// .env (для localhost)
REACT_APP_ANALYTICS_ENABLED=true
REACT_APP_ANALYTICS_DEBUG_MODE=true
REACT_APP_ANALYTICS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
REACT_APP_ANALYTICS_SAMPLING_RATE=100
REACT_APP_DISABLE_ANALYTICS_LOCALHOST=false
```

### 🚀 Runtime конфігурація (GitHub Pages)

```javascript
// public/config.js
window.RUNTIME_CONFIG = {
  ANALYTICS_ENABLED: true,
  ANALYTICS_SCRIPT_URL: 'https://script.google.com/macros/s/.../exec',
  ANALYTICS_SAMPLING_RATE: 100,
  ANALYTICS_DEBUG_MODE: false,
  DISABLE_ANALYTICS_LOCALHOST: false
};
```

### 🎛️ Налаштування аналітики

```javascript
// Конфігурація ProductAnalytics
this.config = {
  enabled: true,              // Увімкнено/вимкнено
  debugMode: true,            // Debug логи (автоматично на localhost)
  samplingRate: 100,          // % користувачів для відстеження (100 = всі)
  retryLimit: 3,              // Кількість повторних спроб
  batchSize: 10               // Розмір batch для відправки
};
```

---

## 🔧 Налаштування та встановлення

### 1️⃣ Ініціалізація в App.js

```javascript
// src/App.js
import ProductAnalytics from './analytics/ProductAnalytics';

function App() {
  // Ініціалізуємо систему аналітики при завантаженні App
  React.useEffect(() => {
    ProductAnalytics.init();
  }, []);

  return (
    // ... решта компонентів
  );
}
```

### 2️⃣ Додавання відстеження на сторінку товару

```javascript
// src/pages/ProductDetail.js
import ProductAnalytics from '../analytics/ProductAnalytics';

const ProductDetail = () => {
  useEffect(() => {
    if (foundProduct) {
      // 📊 Відстежуємо перегляд товару
      ProductAnalytics.trackProductView(foundProduct.id, {
        title: foundProduct.title,
        category: foundProduct.category,
        price: foundProduct.price
      });
    }
  }, [foundProduct]);
  
  // ... решта компонента
};
```

### 3️⃣ Додавання секції на Homepage

```javascript
// src/pages/Home.js
import PopularProducts from '../analytics/components/PopularProducts';

return (
  <div className="home">
    {/* ... інші секції */}
    
    {/* Популярні товари */}
    <section className="section popular-section gray">
      <div className="container">
        <PopularProducts 
          limit={4}
          showInHomepage={true}
          title="Популярні товари"
        />
      </div>
    </section>
  </div>
);
```

### 4️⃣ Стилізація секції

```scss
// src/styles/main.scss
.popular-section {
  background-color: #f8f9fa;  // Сірий фон як у секції "Пропозиції"
  margin-top: 2rem;           // Зменшений відступ зверху
}

.popular-products.homepage-version {
  margin-top: 0;              // Видалений верхній margin компонента
}
```

---

## 🐛 Відладка та діагностика

### 🔍 Debug команди (localhost)

```javascript
// Консоль браузера - доступні команди:

// Показати стан аналітики
window.analyticsDebug()

// Показати популярні товари
window.testPopularProducts.showState()

// Очистити всі дані
window.testPopularProducts.clearAll()

// Додати тестові перегляди
window.testPopularProducts.addOneView('sand-river')
window.testPopularProducts.addTwoViews()

// Тестування Google Sheets
window.analyticsTest()        // Тест підключення
window.analyticsRetry()       // Повторити невдалі запити
window.analyticsStats()       // Статистика невдалих запитів
```

### 📊 Типові проблеми та рішення

**1. Не показуються зображення товарів:**
```javascript
// Перевірити імпорт getImageUrl
import ProductsAPI, { getImageUrl } from '../../data/products/productsAPI';

// Використання в компоненті
<img src={getImageUrl(product.image)} alt={product.title} />
```

**2. Показується менше товарів ніж limit:**
```javascript
// Логіка виправлена - цикл продовжується доки не знайде limit товарів
for (let i = 0; i < popularItems.length && products.length < limit; i++) {
  const product = ProductsAPI.getProductById(item.productId);
  if (product) {
    products.push(product);  // Додаємо тільки знайдені товари
  }
  // Продовжуємо пошук якщо productId не знайдено
}
```

**3. Аналітика не відстежує перегляди:**
```javascript
// Перевірити ініціалізацію в App.js
React.useEffect(() => {
  ProductAnalytics.init();
}, []);

// Перевірити виклик на сторінці товару
ProductAnalytics.trackProductView(productId, data);
```

**4. Дані не відправляються на Google Sheets:**
```javascript
// Перевірити конфігурацію
window.RUNTIME_CONFIG.ANALYTICS_SCRIPT_URL  // має бути URL
window.RUNTIME_CONFIG.ANALYTICS_ENABLED     // має бути true

// Перевірити невдалі запити
window.analyticsStats()
```

### 🔧 Debug режим

```javascript
// Автоматично увімкнений на localhost
getDebugMode() {
  // На localhost завжди увімкнуто для відладки
  if (typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1')) {
    return true;
  }
  return false;
}
```

---

## 📈 Моніторинг та аналітика

### 📊 Ключові метрики

```javascript
// Статистика користувача
const stats = ProductAnalytics.getUserStats();
// Повертає:
{
  userId: 'user_abc123_1692547200000',
  sessionId: 'session_xyz789_1692547200000', 
  sessionStartTime: 1692547200000,
  sessionDuration: 300000,        // 5 хвилин
  viewedProducts: 5,              // Унікальних товарів
  totalViews: 8,                  // Загальна кількість переглядів
  eventsInQueue: 3                // Подій в черзі для відправки
}
```

### 📈 Популярні товари рейтинг

```javascript
// Отримання топ-10 популярних товарів
const popularProducts = ProductAnalytics.getPopularProducts(10);
// Повертає:
[
  {
    productId: 'sand-ravine',
    views: 15,
    lastViewed: 1692547200000
  },
  {
    productId: 'sand-river', 
    views: 12,
    lastViewed: 1692543600000
  }
  // ... відсортовано за кількістю переглядів
]
```

### ☁️ Google Sheets дані

**Структура аркуша "ProductEvents":**
- `timestamp` - Unix timestamp події
- `date` - Дата у форматі YYYY-MM-DD
- `event_type` - Тип події (product_view, product_click, order_click)
- `product_id` - ID товару
- `user_id` - Унікальний ID користувача
- `source` - Джерело трафіку (direct, google, facebook тощо)
- `extra_data` - JSON з додатковими даними

---

## 🔄 Lifecycle та події

### 📅 Автоматичні процеси

```javascript
// 1. Ініціалізація при завантаженні сторінки
App.js → ProductAnalytics.init()

// 2. Відстеження переглядів на сторінках товарів  
ProductDetail.js → ProductAnalytics.trackProductView()

// 3. Оновлення популярних товарів на Homepage
PopularProducts.js → ProductAnalytics.getPopularProducts()

// 4. Відправка даних на Google Sheets (кожні 30 сек)
ProductAnalytics → GoogleSheetsAnalytics.sendEvents()

// 5. Збереження в localStorage при кожній зміні
ProductAnalytics → localStorage.setItem()
```

### 🎯 Події що відстежуються

```javascript
// Основні події
'product_view'          // Перегляд сторінки товару
'popular_product_click' // Клік по товару в секції популярних
'page_view'            // Перегляд будь-якої сторінки
'page_time'            // Час проведений на сторінці
'scroll_depth'         // Глибина прокрутки
'order_click'          // Клік по кнопці замовлення
'view_all_products_click' // Клік "Переглянути всі товари"

// Структура події
{
  type: 'product_view',
  productId: 'sand-river',
  timestamp: 1692547200000,
  data: {
    title: 'Пісок річковий',
    category: 'sand', 
    price: 450,
    userId: 'user_abc123',
    sessionId: 'session_xyz789',
    source: 'direct',           // direct, google, facebook, utm_*
    deviceType: 'desktop',      // desktop, tablet, mobile
    url: '/products/sand/sand-river'
  }
}
```

---

## 🚀 Розгортання та продакшн

### 🌐 GitHub Pages конфігурація

```javascript
// public/config.js - завантажується автоматично
window.RUNTIME_CONFIG = {
  // Увімкнути аналітику в продакшн
  ANALYTICS_ENABLED: true,
  
  // URL вашого Google Apps Script
  ANALYTICS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbx.../exec',
  
  // Відстежувати всіх користувачів (100%)
  ANALYTICS_SAMPLING_RATE: 100,
  
  // Вимкнути debug в продакшн  
  ANALYTICS_DEBUG_MODE: false,
  
  // Дозволити аналітику на localhost (для тестування)
  DISABLE_ANALYTICS_LOCALHOST: false
};
```

### 📊 Google Apps Script налаштування

1. **Створити Google Sheet** з аркушами:
   - `PageViews`
   - `ProductEvents` 
   - `PopularProducts`

2. **Створити Google Apps Script** для отримання даних:
```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(data.sheet);
  
  // Додати дані в таблицю
  data.data.forEach(row => {
    sheet.appendRow(Object.values(row));
  });
  
  return ContentService.createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. **Опублікувати скрипт** і отримати URL
4. **Додати URL** в `public/config.js`

### ✅ Чеклист для продакшн

- ✅ **Analytics enabled:** `ANALYTICS_ENABLED: true`
- ✅ **Script URL configured:** Правильний URL Google Apps Script
- ✅ **Debug mode off:** `ANALYTICS_DEBUG_MODE: false` 
- ✅ **Google Sheets accessible:** Таблиця доступна для запису
- ✅ **Localhost testing:** Система працює на localhost
- ✅ **Popular products visible:** Секція відображається на Homepage
- ✅ **Product views tracked:** Перегляди записуються при переході на товари
- ✅ **Responsive design:** 2 колонки на desktop, адаптивно на mobile

---

## 📚 API референс

### ProductAnalytics статичні методи

```javascript
// Ініціалізація
ProductAnalytics.init()

// Відстеження
ProductAnalytics.trackProductView(productId, data)
ProductAnalytics.trackEvent(eventType, data)
ProductAnalytics.trackPageView(pathname, data)

// Отримання даних
ProductAnalytics.getPopularProducts(limit)
ProductAnalytics.getUserStats()
ProductAnalytics.getDebugInfo()

// Управління
ProductAnalytics.clearAllData()
```

### PopularProducts пропси

```javascript
<PopularProducts
  limit={4}                     // number - кількість товарів
  showInHomepage={true}         // boolean - режим homepage
  title="Популярні товари"      // string - заголовок секції  
  className="gray"              // string - додаткові CSS класи
/>
```

### GoogleSheetsAnalytics методи

```javascript
// Відправка подій
GoogleSheetsAnalytics.sendEvents(events)

// Тестування
GoogleSheetsAnalytics.testConnection()
GoogleSheetsAnalytics.retryFailedRequests()
GoogleSheetsAnalytics.getFailedRequestsStats()

// Управління
GoogleSheetsAnalytics.clearFailedRequests()
```

---

## 🎯 Результати та метрики

### ✅ Що реалізовано

**Функціонал:**
- ✅ Відстеження переглядів товарів в реальному часі
- ✅ Динамічне відображення популярних товарів на Homepage
- ✅ Інтеграція з Google Sheets для збереження аналітики
- ✅ Система fallback товарів (рекомендовані + популярні)
- ✅ Локальне збереження даних з автоматичним очищенням
- ✅ Захист від дублікатів (React.StrictMode)
- ✅ Responsive дизайн з 2-колонковим layout

**UI/UX:**
- ✅ Секція "Популярні товари" на головній сторінці
- ✅ Зображення товарів з правильним getImageUrl()
- ✅ Відсортованість за кількістю переглядів  
- ✅ Бейджі статусу (переглядів/рекомендовано)
- ✅ Клікабельні картки з переходом на детальні сторінки
- ✅ Кнопка "Переглянути всі товари"

**Технічні особливості:**
- ✅ Singleton pattern для ProductAnalytics
- ✅ Event queue system для batch відправки
- ✅ Retry механізм для невдалих запитів
- ✅ Debug режим автоматично на localhost
- ✅ Runtime конфігурація для GitHub Pages
- ✅ Очищення старих даних (30 днів)

### 📊 Статистика системи

**Компоненти створено:** 3 (ProductAnalytics, GoogleSheetsAnalytics, PopularProducts)  
**Інтеграційних точок:** 4 (App.js, Home.js, ProductDetail.js, config.js)  
**Debug команд:** 8 (analyticsDebug, testPopularProducts.* тощо)  
**Подій відстежується:** 7 (product_view, page_view, clicks тощо)  
**Responsive breakpoints:** 3 (1024px, 768px, 480px)  
**Fallback товарів:** 10 рекомендованих ID для заповнення  

---

**✅ СИСТЕМА АНАЛІТИКИ ПОВНІСТЮ ГОТОВА ДО ПРОДАКШЕНУ!** 🚀  
**🌐 Працює на:** https://gennadiy01.github.io/comspec-website  
**📅 Реалізовано:** 20.08.2025  
**🎯 Статус:** Всі функції працюють, система стабільна