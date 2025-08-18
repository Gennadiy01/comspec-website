# 🗄️ Система збереження даних товарів COMSPEC

**Дата створення:** 12.08.2025  
**Дата оновлення:** 18.08.2025  
**Версія:** 3.0  
**Тип:** Технічна документація  

---

## 📋 Огляд системи

### 🎯 Призначення
Гнучка система збереження та управління даними товарів, яка дозволяє:
- Легко додавати нові товари та категорії
- Фільтрувати товари по різних характеристиках
- Підтримувати консистентність даних
- Масштабувати систему в майбутньому
- Інтеграцію з GitHub Pages та статичним хостингом

### 🏗️ Архітектура
Система побудована на JavaScript файлах з ES6 експортом та централізованими утилітами для роботи з даними.

---

## 📁 Структура файлів

```
src/data/products/
├── productsAPI.js              # 🔗 Головний API для роботи з товарами
├── categories/                 # 📂 JavaScript файли товарів по категоріях
│   ├── gravel.js              # ✅ Щебінь та нерудні матеріали (13 товарів)
│   ├── gravel.json            # 📄 JSON версія (застаріла, не використовується)
│   ├── sand.js                # ⏳ Пісок (планується)
│   ├── asphalt.js             # ⏳ Асфальт (планується)
│   └── concrete.js            # ⏳ Бетон (планується)
├── schemas/                    # 📐 Схеми та валідація
│   └── productSchema.js       # ✅ Повна схема товару з усіма полями
└── helpers/                    # 🔧 Утиліти та допоміжні функції
    └── productHelpers.js      # ✅ Основні функції роботи з товарами
```

### 🆕 Додаткові компоненти:
```
src/components/
└── ProductTitle.js             # ✅ Захист фракцій від розривів

src/data/
└── productExclusions.js        # ✅ Правила фільтрації пунктів навантаження
```

### 🎯 **Фактичний стан на 18.08.2025:**
- ✅ **gravel.js** - 13 товарів: щебінь гранітний, суміші, пісок, бутовий камінь
- ✅ **Детальні сторінки товарів** - повноцінні URL `/products/{category}/{id}`
- ✅ **Монолітна структура** - всі товари категорії "Щебінь та нерудні матеріали" в одному файлі
- ✅ **JavaScript формат** - ES6 експорт замість JSON для кращої гнучкості
- ✅ **Система готова до продакшену** - всі функції працюють стабільно

---

## 🔧 Структура даних товару

### 📝 Фактична схема товару (актуальна на 18.08.2025):

**Формат файлу:** JavaScript з ES6 експортом  
**Файл:** `src/data/products/categories/gravel.js`  
**Товарів:** 13 (щебінь, суміші, пісок, бутовий камінь)

```javascript
// Фактична структура категорії в gravel.js:
export const gravelData = {
  "category": "gravel",
  "categoryName": "Щебінь та нерудні матеріали",
  "description": "Гранітний щебінь, суміші, пісок та бутовий камінь...",
  "products": [
    {
      "id": "gravel-granite-5-20",                // ✅ Унікальний ID
      "title": "Щебінь гранітний 5-20",           // ✅ Повна назва
      "shortTitle": "Щебінь 5-20",                // 📱 Скорочена назва для карток
      "category": "gravel",                       // ✅ Англійська категорія
      "categoryName": "Щебінь",                   // ✅ Українська категорія
      "subcategory": "granite",                   // 🔍 Підкategорія (granite, limestone)
  
      
      // === ЦІНА ТА НАЯВНІСТЬ ===
      "price": 850,                               // ✅ Ціна (число)
      "currency": "грн/т",                        // ✅ Валюта з одиницями
      "priceValidUntil": null,                    // 📅 Дата закінчення акції
      "inStock": true,                            // ✅ Наявність
      "availability": "in_stock",                 // 🟢 Статус наявності
  
      
      // === ХАРАКТЕРИСТИКИ ДЛЯ ФІЛЬТРАЦІЇ ===
      "specifications": {
        // УНІВЕРСАЛЬНІ (всі категорії)
        "fraction": "5-20 мм",                   // 🔍 Фракція
        "density": "1.4-1.5 т/м³",              // 🔍 Щільність
        
        // ЩЕБІНЬ
        "strength": "М1200",                     // 🔍 Міцність
        "frost_resistance": "F300",              // 🔍 Морозостійкість
        "rock_type": "granite",                  // 🔍 Тип каменю
    
    // ПІСОК (буде додано)
    "sand_type": "river",                        // 🔍 Тип піску
    "module_size": 2.5,                         // 🔍 Модуль крупності
    "clay_content": "< 3%",                     // 🔍 Вміст глини
    
    // БЕТОН (буде додано)
    "concrete_grade": "М200",                    // 🔍 Марка бетону
    "concrete_class": "B15",                     // 🔍 Клас бетону
    "workability": "П3",                        // 🔍 Рухливість
    
    // АСФАЛЬТ (буде додано)
    "asphalt_type": "hot",                      // 🔍 Тип асфальту
    "asphalt_grade": "Тип А",                   // 🔍 Марка асфальту
    "max_grain_size": "20 мм"                   // 🔍 Макс. розмір зерна
  },
  
      },
      
      // === ВІДОБРАЖЕННЯ ===
      "properties": ["Морозостійкий", "Високої міцності", "Фракція 5-20 мм"],
      "description": "Високоміцний щебінь для будівництва доріг та фундаментів",
      "detailedDescription": "Детальний опис для сторінки товару...",
      
      // === ЗОБРАЖЕННЯ ===
      "image": "/images/products/gravel-5-20.jpg", // 🖼️ Повний шлях до файлу
      "imageAlt": "Щебінь гранітний фракції 5-20 мм",
      
      // === ДОДАТКОВІ ПОЛЯ ===
      "certificates": ["dstu", "iso_9001"],      // 🔍 Сертифікати
      "tags": ["premium", "popular"],           // 🔍 Теги
      "isPopular": true,                        // 🔍 Популярний товар
      "isNew": false,                           // 🔍 Новинка
      "isRecommended": true,                    // 🔍 Рекомендований
      
      // === SEO ===
      "seo": {
        "metaTitle": "Щебінь гранітний 5-20 - купити в Києві | COMSPEC",
        "metaDescription": "Високоякісний щебінь гранітний фракції 5-20 мм...",
        "keywords": ["щебінь", "гранітний", "5-20", "будівельний матеріал"]
      }
    }
  ]
};
```
```

---

## 🔍 Система фільтрації

### 📊 Конфігурація фільтрів (`ProductSchema.js`):

```javascript
export const FilterConfig = {
  // Глобальні фільтри (для всіх категорій)
  global: [
    "price",           // Ціна (слайдер мін-макс)
    "inStock",         // Наявність (чекбокс)
    "availability",    // Статус наявності (селект)
    "deliveryZones",   // Зони доставки (чекбокси)
    "isPopular",       // Популярні (чекбокс)
    "isNew"            // Новинки (чекбокс)
  ],

  // Фільтри специфічні для категорій
  byCategory: {
    gravel: [
      "specifications.fraction",        // Фракція
      "specifications.strength",        // Міцність
      "specifications.frost_resistance", // Морозостійкість
      "specifications.rock_type",       // Тип каменю
      "subcategory"                     // Підкategorія
    ],
    sand: [
      "specifications.fraction",
      "specifications.sand_type",
      "specifications.module_size",
      "specifications.clay_content"
    ],
    // ... інші категорії
  }
};
```

### 🎛️ Приклади фільтрації:

```javascript
// Фільтрація по ціні
const products = filterProductsByPrice(allProducts, 500, 1000);

// Фільтрація по характеристикам
const graniteProducts = filterProductsBySpecifications(products, {
  'specifications.rock_type': 'granite',
  'specifications.strength': 'М1200'
});

// Розширений пошук з множинними фільтрами
const results = advancedSearchProducts({
  query: 'щебінь',
  category: 'gravel',
  priceMin: 800,
  priceMax: 1000,
  specifications: {
    'rock_type': 'granite',
    'frost_resistance': 'F300'
  },
  inStock: true
});
```

---

## 🔌 API функції (оновлено 18.08.2025)

### 📚 Основні функції (`productsAPI.js`):

```javascript
// Імпорт API - централізований експорт
import {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  searchProducts,
  formatProductPriceParts,
  getImageUrl,
  convertCategoryToUkrainian
} from '../data/products/productsAPI.js';

// === БАЗОВІ ОПЕРАЦІЇ ===
const allProducts = getAllProducts();                    // ✅ Реалізовано
const gravelProducts = getProductsByCategory('gravel');  // ✅ Реалізовано
const product = getProductById('gravel-granite-5-20');   // ✅ Реалізовано

// === ПОШУК ===
const searchResults = searchProducts('гранітний');       // ✅ Реалізовано
const multiWordSearch = searchProducts('щебінь 5-20');   // ✅ НОВИНКА: пошук по кількох словах
// advancedSearchProducts - поки не реалізовано в UI

// === ФІЛЬТРАЦІЯ ===
// getPriceRange, getUniqueSpecificationValues - поки не реалізовано

// === ДОПОМІЖНІ ФУНКЦІЇ ===
const formattedPrice = formatProductPriceParts(product); // ✅ Реалізовано
const imageUrl = getImageUrl('gravel-5-10.jpg');        // ✅ Реалізовано
const ukrainianCategory = convertCategoryToUkrainian('gravel'); // ✅ Реалізовано

// === СУМІСНІСТЬ З ІСНУЮЧИМ КОДОМ ===
const legacyProducts = getProductsForLegacyCode();      // ✅ Реалізовано
```

### 🆕 Додаткові утилітарні функції (НОВИНКИ 18.08.2025):

```javascript
// 1. Захист фракцій від розривів (НОВИНКА!)
import { wrapFractionsInTitle } from '../components/ProductTitle.js';
const safeTitle = wrapFractionsInTitle("Щебінь 5-10"); 
// Повертає масив частин для рендеру з no-wrap обгортками

// 2. Фільтрація пунктів навантаження (НОВИНКА!)
import { 
  getProductRules,
  isProductAvailableAtPoint,
  isProductAvailableForPickup 
} from '../data/productExclusions.js';

const rules = getProductRules('sand-washed-0-2');
const isAvailable = isProductAvailableAtPoint('sand-washed-2-5', 'korosten');
const canPickup = isProductAvailableForPickup('sand-washed-0-2'); // false

// 3. Покращений getImageUrl для GitHub Pages (НОВИНКА!)
import { getImageUrl } from '../data/products/productsAPI.js';
const imageUrl = getImageUrl('/images/products/gravel-5-10.jpg');
// Автоматично додає process.env.PUBLIC_URL для GitHub Pages
```

---

## 📈 Додавання нових товарів

### 1️⃣ Додавання товару в існуючу категорію:

```javascript
// В файлі gravel.js додати новий об'єкт в масив products:
{
  "id": "gravel-granite-40-70",
  "title": "Щебінь гранітний 40-70",
  "shortTitle": "Щебінь 40-70",
  "category": "gravel",
  "categoryName": "Щебінь",
  "subcategory": "granite",
  "price": 780,
  "currency": "грн/тонна",
  "inStock": true,
  "availability": "in_stock",
  "specifications": {
    "fraction": "40-70 мм",
    "density": "1.4-1.5 т/м³",
    "strength": "М1200",
    "frost_resistance": "F300",
    "rock_type": "granite"
  },
  "properties": ["Морозостійкий", "Високої міцності", "Фракція 40-70 мм"],
  "description": "Крупний щебінь для дренажних систем",
  "image": "/images/products/gravel-granite-40-70.jpg",
  "minOrder": "1 машина",
  "deliveryZones": ["kyiv", "kyiv_region"],
  "certificates": ["dstu", "iso_9001"],
  "isPopular": false,
  "isNew": true,
  "sortOrder": 50
}
```

### 2️⃣ Додавання нової характеристики для фільтрації:

1. **Додати в `ProductSchema.js`:**
```javascript
// В specifications
"surface_treatment": {
  type: "string",
  example: "polished",
  filterable: true,
  category: "gravel",
  enum: ["natural", "polished", "crushed"]
}
```

2. **Додати в `FilterConfig`:**
```javascript
byCategory: {
  gravel: [
    // ... існуючі фільтри
    "specifications.surface_treatment"  // Новий фільтр
  ]
}
```

3. **Додати в товари:**
```json
"specifications": {
  // ... існуючі характеристики
  "surface_treatment": "natural"
}
```

---

## 🔧 Розширення системи

### 📝 Додавання нової категорії:

1. **Створити JavaScript файл:** `src/data/products/categories/bricks.js`
2. **Додати імпорт в `productHelpers.js`:**
```javascript
import { bricksData } from '../categories/bricks.js';

const categoriesData = {
  gravel: gravelData,
  sand: sandData,
  asphalt: asphaltData,
  concrete: concreteData,
  bricks: bricksData  // Нова категорія
};
```

3. **Оновити константи в `productsAPI.js`:**
```javascript
export const CATEGORY_MAPPING = {
  // ... існуючі
  'bricks': 'Цегла'
};

export const CATEGORIES_LIST = [
  // ... існуючі
  { id: 'bricks', name: 'Цегла' }
];
```

### 🎯 Додавання нових типів фільтрів:

```javascript
// Приклад: фільтр по рейтингу
"rating": {
  type: "number",
  min: 1,
  max: 5,
  filterable: true,
  filterType: "range"  // range, select, checkbox, multiselect
}

// Приклад: фільтр по кольору
"color": {
  type: "array",
  example: ["білий", "сірий", "чорний"],
  filterable: true,
  filterType: "multiselect"
}
```

---

## 🔄 Міграція з існуючого коду

### 📦 Поетапна міграція:

1. **Фаза 1:** Створення нової системи (✅ Завершено)
2. **Фаза 2:** Функції сумісності з існуючим кодом
3. **Фаза 3:** Поступова заміна статичних масивів на API виклики
4. **Фаза 4:** Повна міграція та видалення старого коду

### 🔗 Функції сумісності:

```javascript
// Старий код в Products.js:
const products = [
  { id: 1, title: 'Щебінь гранітний 5-20', category: 'gravel', price: '850 грн/тонна' }
];

// Новий код з API:
import ProductsAPI from '../data/products/productsAPI.js';
const products = ProductsAPI.getProductsForLegacyCode();
// Повертає той самий формат!
```

---

## 📊 Переваги нової системи

### ✅ Гнучкість:
- Легко додавати нові товари та характеристики
- Конфігурабельні фільтри для кожної категорії
- Розширювана архітектура

### ⚡ Продуктивність:
- JSON файли завантажуються швидко
- Клієнтська фільтрація без API запитів
- Можливість кешування

### 🔧 Зручність розробки:
- Типізована схема даних
- Валідація товарів
- Автоматична генерація фільтрів

### 🚀 Масштабованість:
- Підготовка до CMS системи
- Можливість додавання API backend
- Готовність до інтеграції з базами даних

---

## ✅ Поточний стан реалізації (18.08.2025)

### 🎯 Що реалізовано:
- ✅ **Категорія Щебінь:** 13 товарів з повними характеристиками (щебінь, суміші, пісок, бутовий камінь)
- ✅ **API система:** Централізований експорт всіх функцій через productsAPI.js
- ✅ **Сторінки товарів:** Products.js (каталог) та ProductDetail.js (повноцінні детальні сторінки)
- ✅ **URL структура:** `/products/{category}/{id}` з breadcrumbs навігацією
- ✅ **Покращений пошук:** Багатослівний пошук по назві, опису та властивостях ("щебінь 5-10")
- ✅ **Зображення товарів:** 13 реальних зображень з getImageUrl() та GitHub Pages підтримкою
- ✅ **Zoom ефект:** Збільшення зображень при наведенні на детальних сторінках
- ✅ **SEO оптимізація:** Динамічні meta теги для кожного товару з JSON даних
- ✅ **Адаптивний дизайн:** Responsive дизайн для всіх екранів (1024px, 768px, 480px)
- ✅ **Клікабельні картки:** Перехід на детальні сторінки з hover-ефектами
- ✅ **Система замовлень:** Повна інтеграція з модальним вікном замовлення
- ✅ **Фільтрація пунктів навантаження:** Правила виключення/включення пунктів для товарів
- ✅ **Захист фракцій:** ProductTitle.js компонент для no-wrap фракцій
- ✅ **GitHub Pages інтеграція:** Повна підтримка статичного хостингу
- ✅ **Розбиття ціни:** formatProductPriceParts() для коректного відображення цін з термінами дії

### 🔮 Потенціальні наступні кроки (за межами основного scope):
1. **Додати інші категорії товарів:** Створити sand.js, asphalt.js, concrete.js
2. **Розширити UI фільтри:** PriceRangeFilter, SpecificationFilters компоненти (не потрібно для 13 товарів)
3. **Додати сортування:** За ціною, популярністю, алфавітом в UI
4. **Калькулятор матеріалів:** Окремий проект для розрахунку потреб
5. **Админ-панель:** Для управління товарами без редагування коду

---

---

## 🆕 Ключові відмінності фактичної реалізації (18.08.2025)

### 🔄 Відмінності від початкового плану:

1. **✅ Формат файлів:** Використовується JavaScript з ES6 експортом замість JSON
   - **Переваги:** Краща читабельність, можливість коментарів, валідація IDE
   - **Файл:** `gravel.js` замість `gravel.json`

2. **✅ Монолітна структура категорій:** Всі товари "Щебінь та нерудні матеріали" в одному файлі
   - **Включає:** щебінь гранітний, суміші, пісок з відсівів, бутовий камінь
   - **Переваги:** Простіше управління, менше імпортів

3. **✅ Детальні сторінки товарів:** Повноцінна реалізація з URL `/products/{category}/{id}`
   - **URL-маршрутизація** через React Router
   - **Breadcrumbs навігація** для кращого UX
   - **Zoom ефект** зображень при наведенні
   - **SEO метадані** для кожного товару

4. **✅ Додаткові компоненти (не планувалися спочатку):**
   - **ProductTitle.js** - захист фракцій від розривів рядків
   - **productExclusions.js** - правила фільтрації пунктів навантаження
   - **getImageUrl()** - підтримка GitHub Pages
   - **formatProductPriceParts()** - розбиття ціни для UI

5. **✅ Покращена функціональність:**
   - Багатослівний пошук ("щебінь 5-10" знайде "Щебінь гранітний 5-10")
   - Система фільтрації пунктів навантаження
   - Клікабельні картки з hover-ефектами
   - Адаптивність на всіх екранах (1024px, 768px, 480px)
   - SEO оптимізація з динамічними meta тегами

### 🚀 Переваги фактичного підходу:
- **✅ Готовність до продакшену:** Повноцінна робоча система
- **✅ Простота управління:** Менше файлів, зрозуміла структура  
- **✅ GitHub Pages сумісність:** Повна підтримка статичного хостингу
- **✅ UX/UI фокус:** Захист фракцій, адаптивність, покращений пошук
- **✅ Реальні дані:** 13 товарів з реальними характеристиками та цінами

### 📊 Статистика реалізації:
- **Товарів створено:** 13 (щебінь, суміші, пісок, камінь)
- **Зображень додано:** 13 реальних фото товарів  
- **Компонентів додано:** 4 нових (ProductTitle, productExclusions, getImageUrl, formatProductPriceParts)
- **Функцій API:** 25+ (пошук, фільтрація, форматування, SEO)
- **Сторінок:** 2 (Products каталог, ProductDetail детальні сторінки)
- **URL маршрутів:** `/products/{category}/{id}` структура
- **Адаптивних breakpoints:** 3 (1024px, 768px, 480px)
- **SEO покриття:** 100% товарів з meta тегами

---

**✅ СИСТЕМА ТОВАРІВ ПОВНІСТЮ ГОТОВА ДО ПРОДАКШЕНУ!** 🚀  
**🌐 Доступна на:** https://gennadiy01.github.io/comspec-website  
**📅 Завершено:** 18.08.2025 за 6 робочих днів  
**🎯 Статус:** Основний функціонал готовий, всі поставлені цілі досягнуті