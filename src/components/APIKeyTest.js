// src/components/APIKeyTest.js
import React, { useEffect, useState } from 'react';

const APIKeyTest = () => {
  const [apiStatus, setApiStatus] = useState({
    keyExists: false,
    keyLength: 0,
    googleLoaded: false,
    error: null
  });

  useEffect(() => {
    // Перевірка API ключа
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    console.log('=== ДІАГНОСТИКА GOOGLE MAPS API ===');
    console.log('1. API Key:', apiKey ? '✅ Знайдено' : '❌ Не знайдено');
    console.log('2. API Key length:', apiKey?.length || 0);
    console.log('3. API Key preview:', apiKey ? `${apiKey.substring(0, 20)}...` : 'немає');
    console.log('4. Environment:', process.env.REACT_APP_ENVIRONMENT);
    console.log('5. Debug mode:', process.env.REACT_APP_DEBUG_MODE);
    
    setApiStatus(prev => ({
      ...prev,
      keyExists: !!apiKey,
      keyLength: apiKey?.length || 0
    }));

    // Спроба завантажити Google Maps API
    if (apiKey) {
      console.log('6. Спроба завантаження Google Maps API...');
      
      // Перевіряємо чи вже завантажено
      if (window.google && window.google.maps) {
        console.log('7. ✅ Google Maps API вже завантажено');
        setApiStatus(prev => ({ ...prev, googleLoaded: true }));
        return;
      }

      // Завантажуємо API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=uk&region=UA`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('8. ✅ Google Maps API успішно завантажено');
        console.log('9. 🎯 Places API готовий до використання');
        console.log('10. 🚀 AddressSearch компонент можна використовувати!');
        setApiStatus(prev => ({ ...prev, googleLoaded: true }));
      };
      
      script.onerror = (error) => {
        console.error('9. ❌ Помилка завантаження Google Maps API:', error);
        setApiStatus(prev => ({ ...prev, error: 'Помилка завантаження API' }));
      };
      
      document.head.appendChild(script);
      console.log('7. Скрипт Google Maps додано до сторінки');
    }
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      background: '#f0f8ff', 
      border: '2px solid #008080',
      borderRadius: '10px',
      margin: '20px',
      fontFamily: 'monospace'
    }}>
      <h2 style={{ color: '#008080', marginBottom: '15px' }}>🔍 Статус Google Maps API</h2>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>API Ключ:</strong> {apiStatus.keyExists ? '✅ Знайдено' : '❌ Не знайдено'}
        {apiStatus.keyExists && <span> (довжина: {apiStatus.keyLength})</span>}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Google Maps завантажено:</strong> {apiStatus.googleLoaded ? '✅ Так' : '⏳ Завантажується...'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Places API:</strong> {apiStatus.googleLoaded ? '✅ Готовий' : '⏳ Очікування...'}
      </div>

      {apiStatus.error && (
        <div style={{ marginBottom: '10px', color: 'red' }}>
          <strong>Помилка:</strong> {apiStatus.error}
        </div>
      )}

      {apiStatus.googleLoaded && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          background: '#d4edda', 
          borderRadius: '5px',
          color: '#155724'
        }}>
          <strong>🎉 Готово!</strong> AddressSearch компонент може працювати
        </div>
      )}
      
      <div style={{ marginTop: '15px' }}>
        <button 
          onClick={() => {
            console.clear();
            window.location.reload();
          }}
          style={{
            padding: '10px 20px',
            background: '#FFA500',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔄 Перезавантажити
        </button>
      </div>
      
      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        💡 Відкрийте консоль браузера (F12) для детальної інформації
      </div>
    </div>
  );
};

export default APIKeyTest;