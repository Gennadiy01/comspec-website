// src/components/AnalyticsTracker.js
/**
 * 📊 Глобальний трекер аналітики для відстеження переглядів сторінок
 * Автоматично відстежує зміни маршрутів та відправляє дані в Google Sheets
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductAnalytics from '../analytics/ProductAnalytics';

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Чекаємо трохи після зміни маршруту, щоб сторінка повністю завантажилась
    const timeoutId = setTimeout(() => {
      // Відстежуємо перегляд сторінки
      ProductAnalytics.trackPageView(location.pathname, {
        hash: location.hash,
        search: location.search,
        fullUrl: window.location.href,
        title: document.title,
        referrer: document.referrer
      });

      console.log('📊 Відстежено перегляд сторінки:', location.pathname);
      console.log('🌍 Hostname:', window.location.hostname);
      console.log('📡 Analytics URL:', window.RUNTIME_CONFIG?.ANALYTICS_SCRIPT_URL?.substring(0, 50) + '...' || 'undefined');
    }, 100); // Невелика затримка для завершення навігації

    return () => clearTimeout(timeoutId);
  }, [location.pathname, location.search, location.hash]);

  // Компонент нічого не рендерить
  return null;
};

export default AnalyticsTracker;