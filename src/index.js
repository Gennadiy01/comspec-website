import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/main.scss';
import App from './App';

// ЗБЕРЕЖЕНО: JSONP сервіс імпорт
import './services/JSONPGoogleSheetsService.js';

// 🆕 ДОДАНО: GitHub Pages config ініціалізація
import { initGitHubPagesConfig } from './config/github-pages-config';

// 🆕 ДОДАНО: Ініціалізація пошукової системи
import './components/search/SearchEngineInitializer';

// 🌐 Ініціалізація конфігурації для GitHub Pages
if (window.location.hostname.includes('github.io')) {
    console.log('🐙 Виявлено GitHub Pages, ініціалізуємо config...');
    initGitHubPagesConfig();
} else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🏠 Виявлено localhost, використовуємо існуючу систему');
} else {
    console.log('🌍 Виявлено інший хостинг:', window.location.hostname);
    // Для інших хостингів використовуємо існуючу систему environment.js
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);