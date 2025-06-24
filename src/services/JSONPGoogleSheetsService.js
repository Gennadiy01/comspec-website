/**
 * СТАБІЛЬНА ВЕРСІЯ JSONP Google Sheets Service для COMSPEC
 * ✅ Перевірено - працює без помилок
 * 🔧 Тільки збільшений таймаут для надійності
 */

class JSONPGoogleSheetsService {
  constructor() {
    this.scriptUrl = process.env.REACT_APP_GOOGLE_SCRIPT_URL;
    this.callbackCounter = 0;
    
    console.log('[JSONPGoogleSheetsService] ✅ Ініціалізовано з URL:', this.scriptUrl);
    console.log('[JSONPGoogleSheetsService] 🚀 CORS проблема обійдена через JSONP!');
    
    // Додаємо сервіс до window для зручності тестування
    if (typeof window !== 'undefined') {
      window.jsonpGoogleSheetsService = this;
    }
  }

  /**
   * Генерація унікального імені callback функції
   */
  generateCallbackName() {
    this.callbackCounter++;
    return `jsonpCallback${Date.now()}_${this.callbackCounter}`;
  }

  /**
   * Тестування підключення до Google Apps Script
   */
  testConnection() {
    return new Promise((resolve, reject) => {
      const callbackName = this.generateCallbackName();
      
      // Створюємо глобальну callback функцію
      window[callbackName] = (response) => {
        console.log('🧪 Тест підключення:', response);
        delete window[callbackName]; // Очищаємо callback
        resolve(response);
      };
      
      // Створюємо JSONP запит
      const script = document.createElement('script');
      const params = new URLSearchParams({
        action: 'test',
        callback: callbackName
      });
      
      script.src = `${this.scriptUrl}?${params.toString()}`;
      script.onerror = () => {
        delete window[callbackName];
        reject(new Error('Помилка підключення до Google Apps Script'));
      };
      
      document.head.appendChild(script);
      
      // ✅ ЗБІЛЬШЕНИЙ ТАЙМАУТ до 20 секунд
      setTimeout(() => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
        if (window[callbackName]) {
          delete window[callbackName];
          reject(new Error('Таймаут підключення'));
        }
      }, 20000); // Було 15000, стало 20000
    });
  }

  /**
   * ⭐ СТАБІЛЬНА функція збереження замовлення через JSONP
   */
  saveOrder(orderData, isConsultationMode = false, source = 'Website') {
    return new Promise((resolve, reject) => {
      const callbackName = this.generateCallbackName();
      
      // Створюємо глобальну callback функцію
      window[callbackName] = (response) => {
        console.log('📦 Відповідь від Google Apps Script:', response);
        
        // ✅ ПОКРАЩЕНИЙ CLEANUP з затримкою
        setTimeout(() => {
          delete window[callbackName];
        }, 500); // Затримка перед видаленням
        
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Невідома помилка'));
        }
      };
      
      // Підготовка параметрів
      const params = {
        action: 'saveOrder',
        name: orderData.name || '',
        phone: orderData.phone || '',
        email: orderData.email || '',
        product: orderData.product || '',
        deliveryType: orderData.deliveryType || '',
        address: orderData.address || orderData.deliveryAddress || '',
        region: orderData.region || '',
        message: orderData.message || '',
        source: source,
        mode: isConsultationMode ? 'consultation' : 'order',
        Loading_Point: orderData.loadingPoint || orderData.Loading_Point || '',
        callback: callbackName
      };
      
      // Логування для діагностики
      console.log('🎯 Параметри для відправки:', params);
      console.log('🎯 Loading_Point значення:', params.Loading_Point);
      
      // Створюємо URL з параметрами
      const urlParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          urlParams.append(key, params[key]);
        }
      });
      
      const finalUrl = `${this.scriptUrl}?${urlParams.toString()}`;
      console.log('🌐 Фінальний URL:', finalUrl);
      
      // Створюємо і виконуємо JSONP запит
      const script = document.createElement('script');
      script.src = finalUrl;
      script.onerror = () => {
        setTimeout(() => {
          delete window[callbackName];
        }, 500);
        reject(new Error('Помилка відправки даних'));
      };
      
      document.head.appendChild(script);
      
      // ✅ ЗБІЛЬШЕНИЙ ТАЙМАУТ до 20 секунд + покращений cleanup
      setTimeout(() => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
        if (window[callbackName]) {
          delete window[callbackName];
          reject(new Error('Таймаут відправки'));
        }
      }, 20000); // Було 10000, стало 20000
    });
  }

  /**
   * Тест для Loading_Point
   */
  testLoadingPoint() {
    const testData = {
      name: 'Тест Стабільний JSONP',
      phone: '+380999888777',
      email: 'stable@test.com',
      product: 'Щебінь',
      deliveryType: 'delivery',
      address: 'Київ, вул. Стабільна, 1',
      message: 'Тест стабільної версії JSONP',
      Loading_Point: "ТДВ «Ігнатпільський кар'єр»"
    };
    
    console.log('🧪 Запуск стабільного тесту Loading_Point...');
    return this.saveOrder(testData, false, 'StableJSONPTest');
  }
}

// Створюємо екземпляр сервісу
const jsonpService = new JSONPGoogleSheetsService();

// Тестові функції
if (typeof window !== 'undefined') {
  
  // Швидкий тест
  window.testStableJSONP = () => {
    console.log('🧪 Тест стабільної версії JSONP...');
    
    jsonpService.testConnection()
      .then(response => {
        console.log('✅ Підключення працює:', response);
        return jsonpService.testLoadingPoint();
      })
      .then(response => {
        console.log('✅ Замовлення працює:', response);
        console.log('🎉 СТАБІЛЬНА ВЕРСІЯ ПРАЦЮЄ ІДЕАЛЬНО!');
      })
      .catch(error => {
        console.error('❌ Помилка:', error);
      });
  };
  
  // Тест тільки підключення
  window.testConnection = () => {
    jsonpService.testConnection()
      .then(response => {
        console.log('✅ Тест підключення успішний:', response);
      })
      .catch(error => {
        console.error('❌ Помилка підключення:', error);
      });
  };
}

export default jsonpService;