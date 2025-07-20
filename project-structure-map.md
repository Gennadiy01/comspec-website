# Карта структури проекту

## Структура проекту

```
D:\Нове підприємство\MG\Сайт\Новий сайт 2025\
├── README.md
├── package.json
├── package-lock.json
├── project-structure.md
├── Запуск проекту.txt
├── git
├── main
├── node_modules\                                    [excluded - contents not shown]
├── build\
│   ├── asset-manifest.json
│   ├── index.html
│   ├── manifest.json
│   ├── favicons\
│   │   ├── Logo C.svg
│   │   ├── android-chrome-192x192.png
│   │   ├── android-chrome-512x512.png
│   │   ├── apple-touch-icon.png
│   │   ├── favicon-16x16.png
│   │   ├── favicon-32x32.png
│   │   ├── favicon.ico
│   │   └── site.webmanifest
│   ├── images\
│   │   ├── logo.svg
│   │   ├── icons\
│   │   │   ├── asphalt.png
│   │   │   ├── concrete.png
│   │   │   ├── gravel.png
│   │   │   └── sand.png
│   │   └── products\
│   │       └── gravel-5-10.jpg
│   └── static\
│       ├── css\
│       │   ├── main.1306d95e.css
│       │   └── main.1306d95e.css.map
│       ├── js\
│       │   ├── main.fb775795.js
│       │   ├── main.fb775795.js.LICENSE.txt
│       │   └── main.fb775795.js.map
│       └── media\
│           ├── asphalt.d63e6899e52ebf734779.png
│           ├── concrete.75bd6f4c2dcd7d4442d9.png
│           ├── delivery.00a109a063409c9950b4.png
│           ├── expertise.165331e3ee54a1f38798.png
│           ├── gravel.298fbeb776951afa3f14.png
│           ├── price.24a2805f99842a87eb13.png
│           ├── quality.51343393d215f934310e.png
│           └── sand.69b8055ee335db73b663.png
├── public\
│   ├── config.js
│   ├── debug-collector.html
│   ├── diagnostic.html
│   ├── index.html
│   ├── manifest.json
│   ├── favicons\
│   │   ├── Logo C.svg
│   │   ├── android-chrome-192x192.png
│   │   ├── android-chrome-512x512.png
│   │   ├── apple-touch-icon.png
│   │   ├── favicon-16x16.png
│   │   ├── favicon-32x32.png
│   │   ├── favicon.ico
│   │   └── site.webmanifest
│   └── images\
│       ├── logo.svg
│       └── products\
│           └── gravel-5-10.jpg
└── src\
    ├── App.js
    ├── index.js
    ├── assets\
    │   └── icons\
    │       ├── asphalt.png
    │       ├── asphalt.svg
    │       ├── concrete.png
    │       ├── concrete.svg
    │       ├── delivery.png
    │       ├── delivery.svg
    │       ├── expertise.png
    │       ├── expertise.svg
    │       ├── gravel.png
    │       ├── gravel.svg
    │       ├── price.png
    │       ├── price.svg
    │       ├── quality.png
    │       ├── quality.svg
    │       ├── sand.png
    │       └── sand.svg
    ├── common\                                      [empty directory]
    ├── components\
    │   ├── APIKeyTest.js
    │   ├── ScrollToTop.js
    │   ├── forms\
    │   │   └── AddressSearch.js
    │   ├── layout\
    │   │   ├── Footer.js
    │   │   └── Header.js
    │   ├── modals\
    │   │   └── OrderModal.js
    │   ├── search\
    │   │   ├── EnhancedGlobalSearch.js
    │   │   ├── GlobalSearch.js
    │   │   ├── HybridSearchEngine.js
    │   │   ├── QuickSearch.js
    │   │   ├── SearchEngine.js
    │   │   ├── SearchEngineInitializer.js
    │   │   ├── SearchHighlighting.js
    │   │   └── SearchModal.js
    │   └── ui\                                      [empty directory]
    ├── config\
    │   ├── environment.js
    │   ├── github-pages-config.js
    │   ├── google-maps.js
    │   ├── hosting-detector.js
    │   └── telegram\                                [empty directory]
    ├── context\
    │   └── OrderModalContext.js
    ├── data\
    │   ├── GlobalContentIndex.js
    │   └── loadingPoints.js
    ├── hooks\                                       [empty directory]
    ├── pages\
    │   ├── About.js
    │   ├── Articles.js
    │   ├── Certificates.js
    │   ├── Contacts.js
    │   ├── Home.js
    │   ├── Products.js
    │   ├── RetailLocations.js
    │   └── Services.js
    ├── services\
    │   ├── GoogleAuthService.js
    │   ├── GoogleSheetsService.js
    │   ├── JSONPGoogleSheetsService.js
    │   └── telegram\                                [empty directory]
    ├── styles\
    │   ├── address-search.css
    │   ├── enhanced-search.css
    │   ├── header-search-integration.css
    │   ├── main — копия.scss
    │   ├── main.scss
    │   ├── order-modal.css
    │   ├── search.css
    │   └── Опис файлу стілів.txt
    └── utils\
        └── validation.js
```

## Опис проекту

Це React.js проект для сайту будівельних матеріалів з наступними характеристиками:

### Загальна структура:
- **Кореневі файли:** 7 файлів (включно з package.json, README.md, тощо)
- **Папка build:** Містить артефакти production збірки з оптимізованими ресурсами
- **Папка public:** Статичні ресурси, включно з фавіконками, зображеннями та HTML файлами
- **Папка src:** Основний код додатку, організований у логічні папки
- **Node modules:** Залежності пакетів (вміст виключено за запитом)

### Ключові директорії:

#### `src/components/` - React компоненти, організовані за типом:
- `layout/` - компоненти розмітки (Header, Footer)
- `forms/` - форми (AddressSearch)
- `modals/` - модальні вікна (OrderModal)
- `search/` - функціонал пошуку (8 різних компонентів пошуку)
- `ui/` - UI компоненти (поки пуста)

#### `src/pages/` - Компоненти сторінок для маршрутизації:
- Home.js
- About.js
- Products.js
- Services.js
- Contacts.js
- Articles.js
- Certificates.js
- RetailLocations.js

#### `src/services/` - Інтеграції з зовнішніми сервісами:
- GoogleAuthService.js
- GoogleSheetsService.js
- JSONPGoogleSheetsService.js
- telegram/ (папка для Telegram інтеграції)

#### `src/styles/` - Файли стилізації:
- main.scss (основні стилі)
- enhanced-search.css
- header-search-integration.css
- order-modal.css
- address-search.css
- search.css

#### `src/config/` - Файли конфігурації:
- environment.js
- github-pages-config.js
- google-maps.js
- hosting-detector.js

### Особливості проекту:
- Комплексний функціонал пошуку з кількома пошуковими движками
- Інтеграція з Google Maps та Telegram
- Підтримка кількох мов (видно український текст у назвах файлів)
- Система модальних вікон з контекстним управлінням
- Функціонал пошуку адреси
- Валідація форм

### Статистика:
- **Загальна кількість папок:** ~30
- **Загальна кількість файлів:** ~80+ (без node_modules)
- **Основні технології:** React.js, SCSS, Google Services
- **Тип проекту:** Бізнес-сайт компанії будівельних матеріалів

---

*Дата створення карти: 15.07.2025*
*Генеровано автоматично за допомогою Claude Code*