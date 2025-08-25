// tests/manual-node/clean-popular-products-v2.js
/**
 * 🧹 Інструкції для очищення PopularProducts після v4.0
 */

console.log('🧹 Очищення PopularProducts після оновлення v4.0...');
console.log('');
console.log('📋 Інструкції:');
console.log('1. Відкрийте Google Sheets: https://docs.google.com/spreadsheets/d/1SQg9vNBhIKzi288HjClKbatLoSqAdeC9CaFzYOA-nlM/');
console.log('2. Перейдіть на аркуш "PopularProducts"');
console.log('');

console.log('🔄 КРОК 1: Оновіть заголовки колонок');
console.log('Заміните існуючі заголовки на:');
console.log('   timestamp | date | time | rank | product_id | views_count | last_viewed_date | last_viewed_time');
console.log('');

console.log('🗑️  КРОК 2: Видаліть старі JSON записи');
console.log('Видаліть всі рядки з довгими JSON даними типу:');
console.log('   {"timestamp":1234567890,"data":[{"productId":"..."}]}');
console.log('');

console.log('⏰ КРОК 3: Примусово оновіть кеш');
console.log('Для користувачів, щоб отримали нову версію:');
console.log('   - Ctrl+F5 (жорстке перезавантаження)');
console.log('   - Або очистіть кеш браузера');
console.log('');

console.log('✅ Після цього PopularProducts буде:');
console.log('   - Синхронізуватися кожні 10 хвилин (замість 2)');
console.log('   - Використовувати компактний формат колонок');
console.log('   - Включати колонку rank для сортування');
console.log('   - Тільки при наявності змін у популярності');
console.log('');

console.log('🔍 Перевірка роботи:');
console.log('   - Відкрийте консоль браузера');
console.log('   - Шукайте повідомлення "📊 Синхронізовано X популярних товарів"');
console.log('   - Час між синхронізаціями повинен бути ~10 хвилин');