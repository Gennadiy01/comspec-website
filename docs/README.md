# 📚 ДОКУМЕНТАЦІЯ ПРОЕКТУ COMSPEC WEBSITE

Цей каталог містить всю необхідну документацію для розуміння, розгортання та налаштування проекту COMSPEC Website.

---

## 📋 СПИСОК ДОКУМЕНТІВ

### 🚀 **DEPLOYMENT & SETUP**
- **[GITHUB_PAGES_DEPLOYMENT.md](./GITHUB_PAGES_DEPLOYMENT.md)** - Повна документація по розгортанню на GitHub Pages
  - Workflow налаштування
  - Конфігурація домену
  - Troubleshooting деплою

### 🔧 **DEVELOPMENT**
- **[DEVELOPMENT_GUIDELINES.md](./DEVELOPMENT_GUIDELINES.md)** - Правила та рекомендації для розробки
  - Стандарти коду
  - Архітектурні принципи
  - Best practices

### 🤖 **TELEGRAM INTEGRATION**
- **[telegram/ADMIN_GUIDE_ADDING_MANAGERS.md](./telegram/ADMIN_GUIDE_ADDING_MANAGERS.md)** - Посібник адміністратора по додаванню менеджерів до Telegram системи
  - Покрокові інструкції
  - Налаштування Chat ID
  - Troubleshooting


---

## 🎯 ДЛЯ ШВИДКОГО СТАРТУ

### 1. **Розгортання проекту**
```bash
# Клонування репозиторію
git clone https://github.com/Gennadiy01/comspec-website.git
cd comspec-website

# Встановлення залежностей
npm install

# Запуск в режимі розробки
npm start
```

### 2. **Деплой на GitHub Pages**
```bash
# Збірка та деплой
npm run deploy
```

### 3. **Основні файли конфігурації**
- `package.json` - Налаштування проекту та скрипти
- `public/config.js` - Конфігурація для GitHub Pages
- `src/config/` - Налаштування середовища та API

---

## 🏗️ АРХІТЕКТУРА ПРОЕКТУ

```
src/
├── components/          # React компоненти
│   ├── layout/         # Header, Footer
│   ├── search/         # Пошукова система
│   ├── forms/          # Форми
│   ├── modals/         # Модальні вікна
│   └── ui/             # UI компоненти
├── pages/              # Сторінки додатку
├── services/           # API сервіси
├── config/             # Конфігурація
├── context/            # React Context
├── hooks/              # Custom hooks
├── utils/              # Утиліти
├── data/               # Статичні дані
└── styles/             # SCSS стилі
```

---

## 🛠️ ТЕХНІЧНИЙ СТЕК

- **Frontend:** React 18.2.0, React Router 6.3.0
- **Стилізація:** SCSS, CSS Modules
- **API:** Google Maps API, Google Sheets API
- **Build:** React Scripts 5.0.1
- **Deployment:** GitHub Pages, GitHub Actions

---

## 🔐 БЕЗПЕКА

⚠️ **ВАЖЛИВО:** API ключі повинні бути винесені в environment variables:

```bash
# .env.local
REACT_APP_GOOGLE_MAPS_API_KEY=your_maps_key
REACT_APP_GOOGLE_SHEETS_API_KEY=your_sheets_key
```

**Не зберігайте API ключі в коді!**

---

## 📞 КОНТАКТИ ТА ПІДТРИМКА

- **Репозиторій:** https://github.com/Gennadiy01/comspec-website
- **Live сайт:** https://gennadiy01.github.io/comspec-website/
- **Issues:** https://github.com/Gennadiy01/comspec-website/issues

---

## 📝 ВИМОГИ ДО СИСТЕМИ

- **Node.js:** >= 14.x
- **npm:** >= 6.x
- **Git:** latest
- **Браузер:** Chrome, Firefox, Safari, Edge (останні версії)

---

## 🔄 ОНОВЛЕННЯ ДОКУМЕНТАЦІЇ

Ця документація останній раз оновлювалась: **25 липня 2025**

При внесенні змін у проект, будь ласка, оновлюйте відповідні розділи документації.