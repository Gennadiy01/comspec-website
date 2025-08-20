// test-analytics-node.js
// Node.js скрипт для тестування Google Apps Script аналітики

const https = require('https');
const querystring = require('querystring');

const ANALYTICS_URL = 'https://script.google.com/macros/s/AKfycbx9bq9eW_d6zJHDKp67IIZ3Mo5HT-Nte2jAnXFfmUmIVqt-ydn4dwuS1cLkIaItGX5uFw/exec';

console.log('🧪 Тестування Google Apps Script для аналітики...');
console.log('🔗 URL:', ANALYTICS_URL);

// Тестові дані
const testData = {
    action: 'test',
    sheet: 'ProductEvents',
    data: [{
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0],
        event_type: 'connection_test',
        product_id: 'test',
        user_id: 'test_user',
        source: 'test',
        extra_data: JSON.stringify({ test: true, from: 'node.js' })
    }]
};

// Функція для POST запиту
function testPOST() {
    console.log('\n📡 Тестуємо POST запит...');
    
    const postData = JSON.stringify(testData);
    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    const req = https.request(ANALYTICS_URL, options, (res) => {
        console.log(`📊 Status Code: ${res.statusCode}`);
        console.log(`📋 Headers:`, res.headers);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('📦 Response Body:', data);
            
            try {
                const parsed = JSON.parse(data);
                console.log('✅ Parsed JSON:', JSON.stringify(parsed, null, 2));
            } catch (error) {
                console.log('⚠️ Response не є валідним JSON');
            }
            
            console.log('\n' + '='.repeat(50));
            testGET();
        });
    });
    
    req.on('error', (error) => {
        console.error('❌ POST Error:', error);
        console.log('\n' + '='.repeat(50));
        testGET();
    });
    
    req.write(postData);
    req.end();
}

// Функція для GET запиту (JSONP simulation)
function testGET() {
    console.log('\n🔄 Тестуємо GET запит (JSONP симуляція)...');
    
    const params = querystring.stringify({
        action: testData.action,
        sheet: testData.sheet,
        data: JSON.stringify(testData.data),
        callback: 'test_callback'
    });
    
    const getUrl = `${ANALYTICS_URL}?${params}`;
    console.log('🔗 GET URL:', getUrl);
    console.log('📏 URL Length:', getUrl.length);
    
    https.get(getUrl, (res) => {
        console.log(`📊 GET Status Code: ${res.statusCode}`);
        console.log(`📋 GET Headers:`, res.headers);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('📦 GET Response Body:', data);
            
            // Перевіряємо чи це JSONP callback
            if (data.includes('test_callback(')) {
                console.log('✅ JSONP callback виявлено!');
                
                // Спробуємо витягти JSON з callback
                const match = data.match(/test_callback\((.*)\)/);
                if (match) {
                    try {
                        const jsonData = JSON.parse(match[1]);
                        console.log('✅ JSONP JSON:', JSON.stringify(jsonData, null, 2));
                    } catch (error) {
                        console.log('⚠️ Не вдалося парсити JSONP JSON:', error.message);
                    }
                }
            } else {
                console.log('⚠️ Не схоже на JSONP callback');
            }
            
            console.log('\n🏁 Тестування завершено!');
        });
    }).on('error', (error) => {
        console.error('❌ GET Error:', error);
        console.log('\n🏁 Тестування завершено з помилкою!');
    });
}

// Запуск тестування
testPOST();