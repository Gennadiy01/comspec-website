// src/config/google-maps.js
import React from 'react';
import config from './environment';

// Конфігурація Google Maps API для різних середовищ
const GOOGLE_MAPS_CONFIG = {
  development: {
    apiKey: config.GOOGLE_MAPS_API_KEY,
    restrictions: ['http://localhost:3000/*'],
    language: 'uk',
    region: 'UA'
  },
  github: {
    apiKey: config.GOOGLE_MAPS_API_KEY,
    restrictions: ['https://gennadiy01.github.io/*'],
    language: 'uk',
    region: 'UA'
  },
  production: {
    apiKey: config.GOOGLE_MAPS_API_KEY,
    restrictions: ['https://comspec.ua/*', 'https://www.comspec.ua/*'],
    language: 'uk',
    region: 'UA'
  }
};

// Функція для отримання поточної конфігурації
export const getGoogleMapsConfig = () => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return GOOGLE_MAPS_CONFIG.development;
  }
  
  if (hostname.includes('github.io')) {
    return GOOGLE_MAPS_CONFIG.github;
  }
  
  return GOOGLE_MAPS_CONFIG.production;
};

// Функція для отримання API ключа
export const getGoogleMapsApiKey = () => {
  const mapsConfig = getGoogleMapsConfig();
  
  if (!mapsConfig.apiKey) {
    console.error('Google Maps API key не знайдено');
    return null;
  }
  
  return mapsConfig.apiKey;
};

// Функція для завантаження Google Maps API
export const loadGoogleMapsAPI = () => {
  return new Promise((resolve, reject) => {
    // Перевіряємо чи вже завантажено
    if (window.google && window.google.maps) {
      resolve(window.google);
      return;
    }

    // Перевіряємо чи вже є скрипт на сторінці
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google));
      existingScript.addEventListener('error', reject);
      return;
    }

    const mapsConfig = getGoogleMapsConfig();
    const apiKey = mapsConfig.apiKey;

    if (!apiKey) {
      reject(new Error('Google Maps API key не знайдено'));
      return;
    }

    // Створюємо скрипт
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=${mapsConfig.language}&region=${mapsConfig.region}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google);
      } else {
        reject(new Error('Google Maps API не завантажено правильно'));
      }
    };

    script.onerror = () => {
      reject(new Error('Помилка завантаження Google Maps API'));
    };

    document.head.appendChild(script);
  });
};

// Хук для використання Google Maps API
export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    loadGoogleMapsAPI()
      .then(() => {
        setIsLoaded(true);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoaded(false);
      });
  }, []);

  return { isLoaded, error };
};

// Налаштування для Places API
export const PLACES_CONFIG = {
  // Обмеження тільки до України
  componentRestrictions: { 
    country: 'ua' 
  },
  
  // Мова інтерфейсу
  language: 'uk',
  
  // Типи місць для пошуку
  types: ['address', 'establishment', 'geocode'],
  
  // Поля які повертає Places API
  fields: [
    'place_id',
    'formatted_address', 
    'geometry',
    'address_components',
    'name'
  ]
};

// Налаштування для Geocoding API
export const GEOCODING_CONFIG = {
  language: 'uk',
  region: 'UA'
};

// Функція для логування використання API (для моніторингу)
export const logAPIUsage = (apiType, query = '') => {
  if (config.DEBUG_MODE) {
    console.log(`Google Maps API ${apiType} використано:`, {
      timestamp: new Date().toISOString(),
      query: query.substring(0, 50), // Обрізаємо для приватності
      hostname: window.location.hostname
    });
  }
  
  // Тут можна додати відправку статистики на сервер
  // для моніторингу використання API в production
};

// Функція для обробки помилок API
export const handleAPIError = (status, apiType = 'Unknown') => {
  const errorMessages = {
    'ZERO_RESULTS': 'За вашим запитом нічого не знайдено',
    'OVER_QUERY_LIMIT': 'Перевищено ліміт запитів. Спробуйте пізніше',
    'REQUEST_DENIED': 'Запит відхилено. Перевірте налаштування API',
    'INVALID_REQUEST': 'Некоректний запит',
    'UNKNOWN_ERROR': 'Невідома помилка сервера'
  };

  const message = errorMessages[status] || 'Помилка сервісу карт';
  
  console.error(`Google Maps ${apiType} Error:`, status, message);
  
  return {
    status,
    message,
    userMessage: message
  };
};

// Функція для валідації API ключа
export const validateAPIKey = () => {
  const apiKey = getGoogleMapsApiKey();
  
  if (!apiKey) {
    return {
      valid: false,
      message: 'API ключ не знайдено. Перевірте конфігурацію'
    };
  }
  
  if (apiKey.length < 30) {
    return {
      valid: false,
      message: 'API ключ має некоректний формат'
    };
  }
  
  return {
    valid: true,
    message: 'API ключ валідний'
  };
};

// ✅ ВИПРАВЛЕННЯ ESLint помилки: створюємо змінну перед експортом
const googleMapsUtils = {
  getGoogleMapsConfig,
  getGoogleMapsApiKey,
  loadGoogleMapsAPI,
  useGoogleMaps,
  PLACES_CONFIG,
  GEOCODING_CONFIG,
  logAPIUsage,
  handleAPIError,
  validateAPIKey
};

// Експортуємо як default
export default googleMapsUtils;