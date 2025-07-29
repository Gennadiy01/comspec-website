/**
 * 🧪 DEBUG TELEGRAM SERVICE ЛОГІВ
 * Симулює данные як з реального замовлення
 */

// Імітуємо данные з реального замовлення (Order ID: 1753731724)
const realOrderData = {
  orderId: '1753731724',
  manager: 'Геннадій Дикий',
  // ❌ КРИТИЧНО: Це поле відсутнє в реальних даних!
  // managerTelegramChatId: '1559533342',
  orderData: {
    name: 'Сергович',
    phone: '+380503864589',
    email: 'test@comspec.ua',
    product: 'Щебінь',
    address: 'Дубно, Рівненська область, Україна, 35600',
    region: 'Рівненська область',
    message: 'Щебінь 20-40 в кількості 60т',
    source: 'product-page-development'
  },
  isConsultation: false
};

console.log('🔍 DEBUG: Симуляція реального замовлення');
console.log('='.repeat(50));
console.log('📋 Данные которые отримує TelegramService:');
console.log(JSON.stringify(realOrderData, null, 2));
console.log('='.repeat(50));

// Симулюємо логіку TelegramService
console.log('\n🧪 СИМУЛЯЦІЯ ЛОГІКИ TelegramService:');
console.log('-'.repeat(40));

if (realOrderData.manager) {
    console.log(`✅ Менеджер призначений: ${realOrderData.manager}`);
    
    const managerChatId = realOrderData.managerTelegramChatId;
    
    if (managerChatId) {
        console.log(`✅ Chat ID знайдено: ${managerChatId}`);
        console.log('📤 Відправляємо персональне повідомлення...');
    } else {
        console.log('❌ Chat ID ВІДСУТНІЙ (undefined/null)');
        console.log('🔄 Система спробує fallback на загальний чат');
        console.log('⚠️ Але загальний чат також не налаштований');
        console.log('❌ РЕЗУЛЬТАТ: Повідомлення НЕ НАДСИЛАЄТЬСЯ');
    }
} else {
    console.log('❌ Менеджер не призначений');
}

console.log('\n🎯 ДІАГНОЗ:');
console.log('='.repeat(50));
console.log('❌ Google Apps Script НЕ повертає managerTelegramChatId');
console.log('❌ TelegramService не може знайти Chat ID');
console.log('❌ Повідомлення не надсилається');
console.log('');
console.log('🔧 РІШЕННЯ:');
console.log('1. Перевірити Google Apps Script функцію getTelegramChatId()');
console.log('2. Переконатися що поле managerTelegramChatId повертається');
console.log('3. Перевірити чи правильно збережені Chat ID в Google Sheets');
console.log('='.repeat(50));

// Тест правильних данних
console.log('\n✅ ТЕСТ З ПРАВИЛЬНИМИ ДАННИМИ:');
console.log('-'.repeat(40));

const correctOrderData = {
    ...realOrderData,
    managerTelegramChatId: '1559533342' // Додаємо Chat ID
};

console.log('📋 Данные з Chat ID:');
console.log(`Manager: ${correctOrderData.manager}`);
console.log(`Chat ID: ${correctOrderData.managerTelegramChatId}`);

if (correctOrderData.managerTelegramChatId) {
    console.log('✅ Chat ID присутній - повідомлення буде надіслано!');
} else {
    console.log('❌ Chat ID відсутній');
}

console.log('\n📱 Приклад повідомлення яке має надіслатися:');
console.log('-'.repeat(40));

const exampleMessage = `НОВЕ ЗАМОВЛЕННЯ #${correctOrderData.orderId}

Клієнт: ${correctOrderData.orderData.name}
Телефон: ${correctOrderData.orderData.phone}
Email: ${correctOrderData.orderData.email}

Товар: ${correctOrderData.orderData.product}
Тип: Доставка
Адреса: ${correctOrderData.orderData.address}
Регіон: ${correctOrderData.orderData.region}
Коментар: ${correctOrderData.orderData.message}

Час: ${new Date().toLocaleString('uk-UA')}
Менеджер: ${correctOrderData.manager}
Джерело: ${correctOrderData.orderData.source}`;

console.log(exampleMessage);