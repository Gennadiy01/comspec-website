// src/config/github-pages-config.js
export const initGitHubPagesConfig = () => {
    if (window.COMSPEC_UNIVERSAL) {
        console.log('✅ Config вже ініціалізований');
        return;
    }
    
    console.log('🌐 Ініціалізація GitHub Pages config...');
    
    const hostingInfo = {
        type: 'github',
        name: 'GitHub Pages',
        features: ['static', 'https', 'cors-limited']
    };
    
    const config = {
        GOOGLE_SHEETS: {
            SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbz3XE8u5O2Q9ez4OpKcyPB6TtrGp0ul6hPJsud4Dethj0fA2ixU7t4XCwJefl4EIgAd/exec',
            SPREADSHEET_ID: '1xJzmIKJ8vv7IY8Or5eiRmXbsfVbQL8ejZNqXP9OnTDY',
            API_KEY: 'AIzaSyC9sM0GgS6XdzV2H5hqNXahzZ34Jfo58mU'
        },
        // ✅ ДОДАНО: Конфігурація аналітики сайту
        ANALYTICS: {
            SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwOpFp2GGUucDkVT_H8pV-C4VPReeXjkRD4PdNx2WJMiBadl6lzrqO4uQcTihIgY2pj3w/exec',
            ENABLED: true,
            DEBUG_MODE: true,
            SAMPLING_RATE: 100,
            DISABLE_LOCALHOST: false
        },
        GOOGLE_MAPS: {
            API_KEY: 'AIzaSyBge_xIIrIbmc9Y7hPG5Fqkgkd5H4y5EUI',
            LIBRARIES: ['places', 'geometry'],
            LANGUAGE: 'uk',
            REGION: 'UA'
        },
        DEBUG: true,
        ENVIRONMENT: 'github',
        FEATURES: {
            CORS_ENABLED: false,
            SSL_REQUIRED: true,
            UKRAINE_OPTIMIZED: false
        },
        META: {
            configVersion: '1.0.0-src',
            loadedAt: new Date().toISOString(),
            hosting: hostingInfo,
            loader: 'src-config-loader',
            url: window.location.href
        }
    };
    
    window.COMSPEC_UNIVERSAL = {
        ready: true,
        version: '1.0.0-src',
        loadedAt: new Date().toISOString(),
        hosting: hostingInfo,
        config: config,
        services: {
            googleSheetsConfig: config.GOOGLE_SHEETS,
            googleMapsConfig: config.GOOGLE_MAPS,
            initialized: false,
            init: function() {
                console.log('🔧 Ініціалізація сервісів...');
                this.initialized = true;
                console.log('✅ Сервіси готові');
                return true;
            }
        },
        utils: {
            getConfig: function() { return config; },
            getHosting: function() { return hostingInfo; },
            isReady: function() { return true; },
            getGoogleSheetsUrl: function() { return config.GOOGLE_SHEETS.SCRIPT_URL; },
            getGoogleMapsKey: function() { return config.GOOGLE_MAPS.API_KEY; }
        }
    };
    
    // Backup назви для сумісності
    window.COMSPEC_DEBUG = window.COMSPEC_UNIVERSAL;
    window.COMSPEC_CONFIG = config;
    
    // Debug функції
    window.debugComspecConfig = function() {
        console.group('🔍 COMSPEC Debug Info (src)');
        console.log('Config Ready:', true);
        console.log('Hosting:', window.COMSPEC_UNIVERSAL.hosting);
        console.log('Config:', window.COMSPEC_UNIVERSAL.config);
        console.log('Services:', window.COMSPEC_UNIVERSAL.services);
        console.groupEnd();
        return window.COMSPEC_UNIVERSAL;
    };
    
    window.testConfigLoader = function() {
        console.log('✅ GitHub Pages config працює з src/');
        console.log('🔗 Google Sheets URL:', config.GOOGLE_SHEETS.SCRIPT_URL);
        console.log('🗺️ Google Maps Key:', config.GOOGLE_MAPS.API_KEY.substring(0, 10) + '...');
        return true;
    };
    
    console.log('🏗️ Детектовано: ' + hostingInfo.name + ' (' + hostingInfo.type + ')');
    console.log('✅ GitHub Pages config готовий!');
    
    // Подія для React компонентів
    const event = new CustomEvent('comspec-config-ready', {
        detail: {
            hosting: hostingInfo,
            config: config,
            services: window.COMSPEC_UNIVERSAL.services,
            timestamp: new Date().toISOString()
        }
    });
    
    if (window.dispatchEvent) {
        window.dispatchEvent(event);
        setTimeout(function() {
            window.dispatchEvent(event);
        }, 100);
    }
    
    // Debug логи якщо включений DEBUG режим
    if (config.DEBUG) {
        console.group('🔍 Debug інформація');
        console.log('Хостинг:', hostingInfo);
        console.log('Конфігурація:', config);
        console.log('Сервіси:', window.COMSPEC_UNIVERSAL.services);
        console.groupEnd();
    }
};

export default initGitHubPagesConfig;