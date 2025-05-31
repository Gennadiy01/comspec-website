# Структура проекту COMSPEC React

## 📁 Рекомендована структура папок

```
comspec-website/
├── public/
│   ├── index.html                 ✅ Створено
│   ├── manifest.json             ✅ Створено
│   ├── robots.txt                📝 Створіть: "User-agent: *\nAllow: /"
│   ├── favicon.ico               🖼️ Додайте іконку сайту
│   ├── logo192.png               🖼️ Додайте логотип 192x192
│   └── logo512.png               🖼️ Додайте логотип 512x512
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.js         ✅ Створено
│   │   │   ├── Footer.js         ✅ Створено
│   │   │   └── Navbar.js         📝 Опціонально
│   │   ├── ui/
│   │   │   ├── Button.js         📝 Можна створити окремо
│   │   │   ├── Card.js           📝 Можна створити окремо
│   │   │   ├── Input.js          📝 Можна створити окремо
│   │   │   └── Modal.js          📝 Опціонально
│   │   └── forms/
│   │       ├── ContactForm.js    📝 Можна винести з Contacts.js
│   │       └── OrderForm.js      📝 Опціонально
│   ├── pages/
│   │   ├── Home.js               ✅ Створено
│   │   ├── Products.js           ✅ Створено
│   │   ├── Services.js           ✅ Створено
│   │   ├── About.js              ✅ Створено
│   │   ├── Contacts.js           ✅ Створено
│   │   ├── Articles.js           ✅ Створено
│   │   ├── RetailLocations.js    ✅ Створено
│   │   └── Certificates.js       ✅ Створено
│   ├── styles/
│   │   ├── main.scss             ✅ Створено
│   │   ├── components/           📁 Створіть папку
│   │   │   ├── header.scss       📝 Опціонально
│   │   │   ├── footer.scss       📝 Опціонально
│   │   │   └── cards.scss        📝 Опціонально
│   │   ├── pages/                📁 Створіть папку
│   │   │   ├── home.scss         📝 Опціонально
│   │   │   └── products.scss     📝 Опціонально
│   │   └── utils/                📁 Створіть папку
│   │       ├── variables.scss    📝 Опціонально (винести з main.scss)
│   │       ├── mixins.scss       📝 Опціонально
│   │       └── helpers.scss      📝 Опціонально
│   ├── hooks/                    📁 Створіть папку
│   │   ├── useCalculator.js      📝 Для калькулятора
│   │   ├── useForm.js            📝 Для форм
│   │   └── useLocalStorage.js    📝 Опціонально
│   ├── utils/                    📁 Створіть папку
│   │   ├── api.js                📝 Для API запитів
│   │   ├── constants.js          📝 Константи
│   │   ├── helpers.js            📝 Допоміжні функції
│   │   └── validation.js         📝 Валідація форм
│   ├── data/                     📁 Створіть папку
│   │   ├── products.js           📝 Дані про продукти
│   │   ├── services.js           📝 Дані про послуги
│   │   └── certificates.js       📝 Дані про сертифікати
│   ├── assets/                   📁 Створіть папку
│   │   ├── images/               📁 Для зображень
│   │   ├── icons/                📁 Для іконок
│   │   └── documents/            📁 Для PDF файлів
│   ├── App.js                    ✅ Створено
│   └── index.js                  ✅ Створено
├── .gitignore                    ✅ Створено
├── package.json                  ✅ Створено
└── README.md                     ✅ Створено
```

## 🚀 Інструкції по запуску

### 1. Створення структури
```bash
# Створіть головну папку
mkdir comspec-website
cd comspec-website

# Створіть структуру папок
mkdir -p public src/components/layout src/components/ui src/pages src/styles/components src/styles/pages src/hooks src/utils src/data src/assets/images
```

### 2. Розміщення файлів
- Розмістіть файли згідно структури вище
- **public/index.html** - головний HTML файл
- **src/index.js** - точка входу React
- **src/App.js** - головний компонент
- Всі інші файли в відповідні папки

### 3. Встановлення та запуск
```bash
# Встановити залежності
npm install

# Запустити проект
npm start
```

## 📝 Додаткові файли для створення

### robots.txt (в папку public/)
```
User-agent: *
Allow: /
Sitemap: https://comspec.ua/sitemap.xml
```

### .env.example
```
REACT_APP_API_URL=https://api.comspec.ua
REACT_APP_GOOGLE_MAPS_KEY=your_maps_key_here
REACT_APP_EMAIL_SERVICE_ID=your_email_service_id
```

## 🎨 Рекомендації

1. **Компоненти** - Винесіть повторювані елементи в окремі компоненти
2. **Стилі** - Розділіть SCSS на модулі для кращої організації
3. **Дані** - Винесіть статичні дані в окремі файли
4. **Хуки** - Створіть власні хуки для логіки
5. **Оптимізація** - Додайте lazy loading для сторінок

## 🔗 Корисні команди

```bash
# Збірка для продакшн
npm run build

# Запуск тестів
npm test

# Аналіз бандлу
npm run build && npx serve -s build
```