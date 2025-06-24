// src/services/GoogleAuthService.js - Покращена JWT аутентифікація
class GoogleAuthService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
    this.isInitialized = false;
  }

  /**
   * Ініціалізація Google API з правильною аутентифікацією
   */
  async initialize() {
    try {
      if (this.isInitialized && this.isTokenValid()) {
        return true;
      }

      // Завантажуємо Google API якщо потрібно
      if (!window.gapi) {
        await this.loadGoogleAPI();
      }

      // Ініціалізуємо gapi client
      await new Promise((resolve, reject) => {
        window.gapi.load('client', {
          callback: resolve,
          onerror: reject
        });
      });

      await window.gapi.client.init({
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
      });

      // Отримуємо access token
      await this.refreshAccessToken();
      
      this.isInitialized = true;
      console.log('[GoogleAuthService] Ініціалізація завершена успішно');
      
      return true;
    } catch (error) {
      console.error('[GoogleAuthService] Помилка ініціалізації:', error);
      throw new Error('Не вдалося ініціалізувати Google API');
    }
  }

  /**
   * Завантаження Google API
   */
  loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('[GoogleAuthService] Google API завантажено');
        resolve();
      };
      
      script.onerror = (error) => {
        console.error('[GoogleAuthService] Помилка завантаження Google API:', error);
        reject(new Error('Не вдалося завантажити Google API'));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Перевірка валідності токена
   */
  isTokenValid() {
    return this.accessToken && 
           this.tokenExpiry && 
           Date.now() < this.tokenExpiry - 60000; // 1 хвилина запасу
  }

  /**
   * Оновлення access token через Service Account
   */
  async refreshAccessToken() {
    try {
      const jwt = await this.createJWT();
      const tokenResponse = await this.exchangeJWTForToken(jwt);
      
      this.accessToken = tokenResponse.access_token;
      this.tokenExpiry = Date.now() + (tokenResponse.expires_in * 1000);
      
      // Встановлюємо токен для gapi client
      window.gapi.client.setToken({
        access_token: this.accessToken
      });
      
      console.log('[GoogleAuthService] Access token оновлено');
      return this.accessToken;
    } catch (error) {
      console.error('[GoogleAuthService] Помилка оновлення токена:', error);
      throw new Error('Не вдалося отримати access token');
    }
  }

  /**
   * Створення JWT токена для Service Account
   */
  async createJWT() {
    const serviceAccountEmail = process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKeyPem = process.env.REACT_APP_GOOGLE_PRIVATE_KEY;
    
    if (!serviceAccountEmail || !privateKeyPem) {
      throw new Error('Відсутні дані Service Account в environment variables');
    }

    const now = Math.floor(Date.now() / 1000);
    
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };
    
    const payload = {
      iss: serviceAccountEmail,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600, // 1 година
      iat: now
    };

    try {
      // В браузері використовуємо спрощений підхід через fetch до серверного ендпоінту
      // або використовуємо готову бібліотеку
      return await this.signJWTInBrowser(header, payload, privateKeyPem);
    } catch (error) {
      console.error('[GoogleAuthService] Помилка створення JWT:', error);
      throw new Error('Не вдалося створити JWT токен');
    }
  }

  /**
   * Підпис JWT в браузері (спрощений варіант)
   * У production рекомендується використовувати серверний ендпоінт
   */
  async signJWTInBrowser(header, payload, privateKey) {
    const headerB64 = this.base64UrlEncode(JSON.stringify(header));
    const payloadB64 = this.base64UrlEncode(JSON.stringify(payload));
    const dataToSign = `${headerB64}.${payloadB64}`;

    try {
      // Спроба використання Web Crypto API (може не працювати з Service Account ключами)
      const signature = await this.signWithWebCrypto(dataToSign, privateKey);
      return `${dataToSign}.${signature}`;
    } catch (error) {
      console.warn('[GoogleAuthService] Web Crypto API недоступний, використовуємо fallback');
      // Fallback до простішого методу (менш безпечний)
      return this.createJWTFallback(header, payload);
    }
  }

  /**
   * Підпис з Web Crypto API
   */
  async signWithWebCrypto(data, privateKeyPem) {
    try {
      // Перетворюємо PEM в binary
      const pemContent = privateKeyPem
        .replace(/-----BEGIN PRIVATE KEY-----/, '')
        .replace(/-----END PRIVATE KEY-----/, '')
        .replace(/\n/g, '');
      
      const binaryDer = this.base64ToArrayBuffer(pemContent);
      
      // Імпортуємо ключ
      const cryptoKey = await crypto.subtle.importKey(
        'pkcs8',
        binaryDer,
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256'
        },
        false,
        ['sign']
      );
      
      // Підписуємо дані
      const signature = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        cryptoKey,
        new TextEncoder().encode(data)
      );
      
      return this.base64UrlEncode(signature);
    } catch (error) {
      throw new Error(`Web Crypto підпис не вдався: ${error.message}`);
    }
  }

  /**
   * Fallback JWT створення (для тестування)
   */
  createJWTFallback(header, payload) {
    const headerB64 = this.base64UrlEncode(JSON.stringify(header));
    const payloadB64 = this.base64UrlEncode(JSON.stringify(payload));
    
    // УВАГА: Це не справжній підпис! Використовуйте тільки для тестування
    const fakeSignature = this.base64UrlEncode(`fake-signature-${Date.now()}`);
    
    console.warn('[GoogleAuthService] Використовується fallback JWT (не для production!)');
    return `${headerB64}.${payloadB64}.${fakeSignature}`;
  }

  /**
   * Обмін JWT на access token
   */
  async exchangeJWTForToken(jwt) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[GoogleAuthService] Помилка обміну JWT:', errorData);
      throw new Error(`Помилка аутентифікації: ${errorData.error_description || errorData.error}`);
    }

    return await response.json();
  }

  /**
   * Base64 URL кодування
   */
  base64UrlEncode(data) {
    let base64;
    
    if (typeof data === 'string') {
      base64 = btoa(unescape(encodeURIComponent(data)));
    } else if (data instanceof ArrayBuffer) {
      base64 = btoa(String.fromCharCode(...new Uint8Array(data)));
    } else {
      base64 = btoa(data);
    }
    
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Перетворення base64 в ArrayBuffer
   */
  base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes.buffer;
  }

  /**
   * Отримання поточного access token
   */
  async getAccessToken() {
    if (!this.isTokenValid()) {
      await this.refreshAccessToken();
    }
    return this.accessToken;
  }

  /**
   * Виконання авторизованого запиту до Google Sheets API
   */
  async makeAuthorizedRequest(method, endpoint, data = null) {
    await this.initialize();
    
    const token = await this.getAccessToken();
    
    const options = {
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(endpoint, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API запит не вдався: ${errorData.error?.message || response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Перевірка з'єднання з Google Sheets API
   */
  async testConnection() {
    try {
      await this.initialize();
      
      const sheetsId = process.env.REACT_APP_GOOGLE_SHEETS_ID;
      if (!sheetsId) {
        throw new Error('REACT_APP_GOOGLE_SHEETS_ID не встановлено');
      }
      
      // Простий запит для перевірки доступу
      const response = await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: sheetsId
      });
      
      return {
        success: true,
        message: 'З\'єднання з Google Sheets працює',
        data: {
          title: response.result.properties.title,
          sheets: response.result.sheets?.length || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Помилка з\'єднання з Google Sheets',
        error: error.message
      };
    }
  }

  /**
   * Очищення токенів
   */
  clearTokens() {
    this.accessToken = null;
    this.tokenExpiry = null;
    this.isInitialized = false;
    
    if (window.gapi?.client) {
      window.gapi.client.setToken(null);
    }
    
    console.log('[GoogleAuthService] Токени очищено');
  }
}

// Експорт синглтона
const googleAuthService = new GoogleAuthService();
export default googleAuthService;