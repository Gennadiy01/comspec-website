import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/main.scss';
import App from './App';

// ДОДАЙТЕ ЦЕЙ РЯДОК ДЛЯ JSONP СЕРВІСУ:
import './services/JSONPGoogleSheetsService.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);