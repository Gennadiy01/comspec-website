// public/config-loader.js
// Універсальний завантажувач конфігурації для COMSPEC
// Працює на GitHub Pages, Hostinger, MiroHost, VPS та будь-якому хостингу

(function() {
    // Removed 'use strict' - не потрібен для IIFE в сучасних браузерах
    
    console.log('🌐 COMSPEC Universal Config Loader v1.0');
    console.log('📍 Поточний URL:', window.location.href);
    
    // === АВТОДЕТЕКЦІЯ ТИПУ ХОСТИНГУ ===
    function detectHostingType() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const port = window.location.port;
        
        console.log('🔍 Аналіз хостингу:', { hostname, protocol, port });
        
        // GitHub Pages
        if (hostname.includes('github.io') || hostname.includes('github.com')) {
            return { 
                type: 'github', 
                name: 'GitHub Pages',
                features: ['static', 'https', 'cors-limited']
            };
        }
        
        // Hostinger
        if (hostname.includes('hostinger') || 
            hostname.includes('000webhost') || 
            hostname.includes('hostingerapp')) {
            return { 
                type: 'hostinger', 
                name: 'Hostinger',
                features: ['shared', 'php', 'mysql', 'ssl-optional']
            };
        }
        
        // MiroHost (український хостинг)
        if (hostname.includes('mirohost') || 
            hostname.includes('mirohostcdn') ||
            hostname.includes('mh-cdn')) {
            return { 
                type: 'mirohost', 
                name: 'MiroHost',
                features: ['shared', 'ukraine', 'php', 'mysql']
            };
        }
        
        // Netlify
        if (hostname.includes('netlify.app') || hostname.includes('netlify.com')) {
            return { 
                type: 'netlify', 
                name: 'Netlify',
                features: ['static', 'cdn', 'forms', 'functions']
            };
        }
        
        // Vercel
        if (hostname.includes('vercel.app') || hostname.includes('vercel.com')) {
            return { 
                type: 'vercel', 
                name: 'Vercel',
                features: ['static', 'serverless', 'edge']
            };
        }
        
        // Localhost (розробка)
        if (hostname === 'localhost' || 
            hostname === '127.0.0.1' || 
            hostname.includes('.local')) {
            return { 
                type: 'development', 
                name: 'Localhost',
                features: ['development', 'hot-reload', 'debug']
            };
        }
        
        // VPS (прямий IP)
        if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
            return { 
                type: 'vps', 
                name: 'VPS (Direct IP)',
                features: ['vps', 'custom', 'full-control']
            };
        }
        
        // Нестандартні порти (імовірно VPS або development)
        if (port && !['80', '443', '3000', ''].includes(port)) {
            return { 
                type: 'vps', 
                name: 'VPS (Custom Port)',
                features: ['vps', 'custom-port', 'development']
            };
        }
        
        // За замовчуванням - shared hosting
        return { 
            type: 'shared', 
            name: 'Shared Hosting',
            features: ['shared', 'basic']
        };
    }
    
    // === СТВОРЕННЯ УНІВЕРСАЛЬНОЇ КОНФІГУРАЦІЇ ===
    function createUniversalConfig(hostingInfo) {
        const baseConfig = {
            // Google Sheets - працює скрізь через JSONP/CORS
            GOOGLE_SHEETS: {
                SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbz3XE8u5O2Q9ez4OpKcyPB6TtrGp0ul6hPJsud4Dethj0fA2ixU7t4XCwJefl4EIgAd/exec',
                SPREADSHEET_ID: '1xJzmIKJ8vv7IY8Or5eiRmXbsfVbQL8ejZNqXP9OnTDY',
                API_KEY: 'AIzaSyC9sM0GgS6XdzV2H5hqNXahzZ34Jfo58mU'
            },
            
            // Google Maps - працює на всіх хостингах
            GOOGLE_MAPS: {
                API_KEY: 'AIzaSyBge_xIIrIbmc9Y7hPG5Fqkgkd5H4y5EUI',
                LIBRARIES: ['places', 'geometry'],
                LANGUAGE: 'uk',
                REGION: 'UA'
            },
            
            // Базові налаштування
            DEBUG: hostingInfo.type === 'development',
            ENVIRONMENT: hostingInfo.type,
            
            // Оптимізації для конкретних хостингів
            FEATURES: {
                // CORS налаштування
                CORS_ENABLED: !hostingInfo.features.includes('cors-limited'),
                
                // SSL
                SSL_REQUIRED: hostingInfo.features.includes('https') || window.location.protocol === 'https:',
                
                // Кешування
                CACHE_ENABLED: hostingInfo.features.includes('cdn'),
                
                // Локалізація для українських хостингів
                UKRAINE_OPTIMIZED: hostingInfo.features.includes('ukraine')
            },
            
            // Метадані для debugging
            META: {
                configVersion: '1.0.0',
                loadedAt: new Date().toISOString(),
                hosting: hostingInfo,
                loader: 'universal-config-loader',
                url: window.location.href
            }
        };
        
        // Специфічні налаштування для різних хостингів
        switch (hostingInfo.type) {
            case 'github':
                baseConfig.DEPLOYMENT = {
                    type: 'static',
                    cdn: 'github-pages',
                    cacheBusting: true
                };
                // GitHub Pages має DEBUG=true для легшого debugging
                baseConfig.DEBUG = true;
                break;
                
            case 'hostinger':
                baseConfig.DEPLOYMENT = {
                    type: 'shared',
                    provider: 'hostinger',
                    phpSupport: true
                };
                break;
                
            case 'mirohost':
                baseConfig.DEPLOYMENT = {
                    type: 'shared',
                    provider: 'mirohost',
                    region: 'ukraine',
                    phpSupport: true
                };
                // Оптимізація для України
                baseConfig.GOOGLE_MAPS.REGION = 'UA';
                baseConfig.FEATURES.UKRAINE_OPTIMIZED = true;
                break;
                
            case 'development':
                baseConfig.DEBUG = true;
                baseConfig.DEPLOYMENT = {
                    type: 'development',
                    hotReload: true,
                    sourceMap: true
                };
                break;
                
            default:
                baseConfig.DEPLOYMENT = {
                    type: 'generic',
                    provider: 'unknown'
                };
        }
        
        return baseConfig;
    }
    
    // === ІНІЦІАЛІЗАЦІЯ СЕРВІСІВ ===
    function initializeServices(config, hostingInfo) {
        const services = {
            googleSheets: null,
            googleMaps: null,
            initialized: false,
            errors: []
        };
        
        // Відкладена ініціалізація після завантаження React
        services.init = function() {
            console.log('🔧 Ініціалізація сервісів...');
            
            try {
                // Google Sheets сервіс буде ініціалізований в React компонентах
                services.googleSheetsConfig = config.GOOGLE_SHEETS;
                
                // Google Maps конфігурація
                services.googleMapsConfig = config.GOOGLE_MAPS;
                
                // Спроба динамічного імпорту сервісу (для GitHub Pages)
                if (hostingInfo.type === 'github') {
                    services.tryDynamicImport = function() {
                        // Це буде викликано з React компонентів
                        console.log('📦 Підготовка до dynamic import сервісу...');
                        return config.GOOGLE_SHEETS.SCRIPT_URL;
                    };
                }
                
                services.initialized = true;
                console.log('✅ Сервіси готові до ініціалізації');
                
                return true;
            } catch (error) {
                console.error('❌ Помилка ініціалізації сервісів:', error);
                services.errors.push(error);
                return false;
            }
        };
        
        return services;
    }
    
    // === ГОЛОВНА ІНІЦІАЛІЗАЦІЯ ===
    try {
        // Детекція хостингу
        const hostingInfo = detectHostingType();
        console.log('🏗️ Детектовано: ' + hostingInfo.name + ' (' + hostingInfo.type + ')');
        
        // Створення конфігурації
        const config = createUniversalConfig(hostingInfo);
        console.log('⚙️ Конфігурацію створено');
        
        // Ініціалізація сервісів
        const services = initializeServices(config, hostingInfo);
        
        // === ГЛОБАЛЬНИЙ ОБ'ЄКТ ДЛЯ REACT ===
        window.COMSPEC_UNIVERSAL = {
            // Основна інформація
            ready: true,
            version: '1.0.0',
            loadedAt: new Date().toISOString(),
            
            // Конфігурація
            hosting: hostingInfo,
            config: config,
            services: services,
            
            // Утиліти для React компонентів
            utils: {
                getConfig: function() { return config; },
                getHosting: function() { return hostingInfo; },
                isReady: function() { return true; },
                getGoogleSheetsUrl: function() { return config.GOOGLE_SHEETS.SCRIPT_URL; },
                getGoogleMapsKey: function() { return config.GOOGLE_MAPS.API_KEY; }
            }
        };
        
        // Backup назви для сумісності з існуючим кодом
        window.COMSPEC_DEBUG = window.COMSPEC_UNIVERSAL;
        window.COMSPEC_CONFIG = config;
        
        // === ПОДІЯ ДЛЯ REACT APP ===
        const readyEvent = new CustomEvent('comspec-config-ready', {
            detail: {
                hosting: hostingInfo,
                config: config,
                services: services,
                timestamp: new Date().toISOString()
            }
        });
        
        // Відправляємо подію зараз і через 100мс (на випадок якщо React ще не готовий)
        if (window.dispatchEvent) {
            window.dispatchEvent(readyEvent);
            setTimeout(function() {
                window.dispatchEvent(readyEvent);
            }, 100);
        }
        
        console.log('🎉 Універсальний завантажувач готовий!');
        console.log('📊 Доступно в: window.COMSPEC_UNIVERSAL');
        
        // Debug інформація
        if (config.DEBUG) {
            console.group('🔍 Debug інформація');
            console.log('Хостинг:', hostingInfo);
            console.log('Конфігурація:', config);
            console.log('Сервіси:', services);
            console.groupEnd();
        }
        
    } catch (error) {
        console.error('💥 Критична помилка універсального завантажувача:', error);
        
        // Fallback конфігурація у разі помилки
        window.COMSPEC_UNIVERSAL = {
            ready: false,
            error: error.message,
            fallback: true,
            config: {
                GOOGLE_SHEETS: {
                    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbz3XE8u5O2Q9ez4OpKcyPB6TtrGp0ul6hPJsud4Dethj0fA2ixU7t4XCwJefl4EIgAd/exec',
                    SPREADSHEET_ID: '1xJzmIKJ8vv7IY8Or5eiRmXbsfVbQL8ejZNqXP9OnTDY'
                },
                GOOGLE_MAPS: {
                    API_KEY: 'AIzaSyBge_xIIrIbmc9Y7hPG5Fqkgkd5H4y5EUI'
                },
                DEBUG: true,
                ENVIRONMENT: 'fallback'
            }
        };
        
        window.COMSPEC_DEBUG = window.COMSPEC_UNIVERSAL;
    }
    
})();