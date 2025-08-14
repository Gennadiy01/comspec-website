# 🗄️ Система збереження даних товарів COMSPEC

**Дата створення:** 12.08.2025  
**Версія:** 1.0  
**Тип:** Технічна документація  

---

## 📋 Огляд системи

### 🎯 Призначення
Гнучка система збереження та управління даними товарів, яка дозволяє:
- Легко додавати нові товари та категорії
- Фільтрувати товари по різних характеристиках
- Підтримувати консистентність даних
- Масштабувати систему в майбутньому

### 🏗️ Архітектура
Система побудована на JSON файлах з централізованими утилітами для роботи з даними.

---

## 📁 Структура файлів

```
src/data/products/
├── productsAPI.js              # 🔗 Головний API для роботи з товарами
├── categories/                 # 📂 JSON файли товарів по категоріях
│   ├── gravel.json            # Щебінь (5+ товарів)
│   ├── sand.json              # Пісок (буде додано)
│   ├── asphalt.json           # Асфальт (буде додано)
│   └── concrete.json          # Бетон (буде додано)
├── schemas/                    # 📐 Схеми та валідація
│   └── productSchema.js       # Повна схема товару з усіма полями
└── helpers/                    # 🔧 Утилити та допоміжні функції
    ├── productHelpers.js      # Основні функції роботи з товарами
    ├── filterHelpers.js       # Логіка фільтрації (буде додано)
    └── validationHelpers.js   # Валідація даних (буде додано)
```

---

## 🔧 Структура JSON товару

### 📝 Повна схема товару:

```json
{
  "id": "gravel-granite-5-20",                    // ✅ Унікальний ID
  "title": "Щебінь гранітний 5-20",               // ✅ Повна назва
  "shortTitle": "Щебінь 5-20",                    // 📱 Скорочена назва для карток
  "category": "gravel",                           // ✅ Англійська категорія
  "categoryName": "Щебінь",                       // ✅ Українська категорія
  "subcategory": "granite",                       // 🔍 Підкategорія (granite, limestone)
  
  // === ЦІНА ТА НАЯВНІСТЬ ===
  "price": 850,                                   // ✅ Ціна (число)
  "currency": "грн/тонна",                        // ✅ Валюта з одиницями
  "priceOld": 900,                               // 💰 Стара ціна (для знижок)
  "inStock": true,                               // ✅ Наявність
  "availability": "in_stock",                    // 🟢 Статус наявності
  
  // === ХАРАКТЕРИСТИКИ ДЛЯ ФІЛЬТРАЦІЇ ===
  "specifications": {
    // УНІВЕРСАЛЬНІ (всі категорії)
    "fraction": "5-20 мм",                       // 🔍 Фракція
    "density": "1.4-1.5 т/м³",                  // 🔍 Щільність
    
    // ЩЕБІНЬ
    "strength": "М1200",                         // 🔍 Міцність
    "frost_resistance": "F300",                  // 🔍 Морозостійкість
    "rock_type": "granite",                      // 🔍 Тип каменю
    
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
  
  // === ВІДОБРАЖЕННЯ ===
  "properties": ["Морозостійкий", "Високої міцності", "Фракція 5-20 мм"],
  "description": "Високоміцний щебінь для будівництва доріг та фундаментів",
  "detailedDescription": "Детальний опис для сторінки товару...",
  
  // === ЗОБРАЖЕННЯ ===
  "image": "/images/products/gravel-granite-5-20.jpg",
  "imageAlt": "Щебінь гранітний фракції 5-20 мм",
  
  // === ЛОГІСТИКА ===
  "minOrder": "1 машина",
  "deliveryZones": ["kyiv", "kyiv_region", "cherkasy"],
  "loadingPoints": ["point_1", "point_2"],
  
  // === ДОДАТКОВІ ФІЛЬТРИ ===
  "certificates": ["dstu", "iso_9001"],          // 🔍 Сертифікати
  "tags": ["premium", "popular"],               // 🔍 Теги
  "isPopular": true,                            // 🔍 Популярний товар
  "isNew": false,                               // 🔍 Новинка
  "isRecommended": true,                        // 🔍 Рекомендований
  
  // === МЕТАДАНІ ===
  "createdAt": "2025-08-12T10:00:00Z",
  "updatedAt": "2025-08-12T10:00:00Z",
  "sortOrder": 100,                             // Порядок відображення
  
  // === SEO ===
  "seo": {
    "metaTitle": "Щебінь гранітний 5-20 - купити в Києві | COMSPEC",
    "metaDescription": "Високоякісний щебінь гранітний фракції 5-20 мм...",
    "keywords": ["щебінь", "гранітний", "5-20", "будівельний матеріал"]
  }
}
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

## 🔌 API функції

### 📚 Основні функції (`productsAPI.js`):

```javascript
// Імпорт API
import ProductsAPI from '../data/products/productsAPI.js';

// === БАЗОВІ ОПЕРАЦІЇ ===
const allProducts = ProductsAPI.getAllProducts();
const gravelProducts = ProductsAPI.getProductsByCategory('gravel');
const product = ProductsAPI.getProductById('gravel-granite-5-20');

// === ПОШУК ===
const searchResults = ProductsAPI.searchProducts('гранітний');
const advancedResults = ProductsAPI.advancedSearchProducts({
  query: 'щебінь',
  priceMin: 500,
  priceMax: 1000
});

// === ФІЛЬТРАЦІЯ ===
const priceRange = ProductsAPI.getPriceRange('gravel');
const uniqueStrengths = ProductsAPI.getUniqueSpecificationValues('gravel', 'strength');

// === ДОПОМІЖНІ ===
const popularProducts = ProductsAPI.getPopularProducts(5);
const formattedPrice = ProductsAPI.formatProductPrice(product);
const productUrl = ProductsAPI.generateProductUrl(product);

// === СУМІСНІСТЬ З ІСНУЮЧИМ КОДОМ ===
const legacyProducts = ProductsAPI.getProductsForLegacyCode();
const ukrainianCategory = ProductsAPI.convertCategoryToUkrainian('gravel');
```

---

## 📈 Додавання нових товарів

### 1️⃣ Додавання товару в існуючу категорію:

```json
// В файлі gravel.json додати новий об'єкт в масив products:
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

1. **Створити JSON файл:** `src/data/products/categories/bricks.json`
2. **Додати імпорт в `productHelpers.js`:**
```javascript
import bricksData from '../categories/bricks.json';

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

## 🎯 Наступні кроки

1. **Завершити базові категорії:** sand.json, asphalt.json, concrete.json
2. **Рефакторити Products.js** для використання нової системи
3. **Додати компоненти фільтрів** (PriceRangeFilter, SpecificationFilters)
4. **Створити детальні сторінки товарів**
5. **Інтегрувати з глобальним пошуком**

---

**Система готова до розширення та активного використання!** 🚀