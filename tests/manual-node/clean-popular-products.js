// tests/manual-node/clean-popular-products.js
/**
 * 🧹 Скрипт для очищення дублікатів у PopularProducts
 */

console.log('🧹 Очищення PopularProducts від дублікатів...');
console.log('');
console.log('📋 Інструкції:');
console.log('1. Відкрийте Google Sheets: https://docs.google.com/spreadsheets/d/1SQg9vNBhIKzi288HjClKbatLoSqAdeC9CaFzYOA-nlM/');
console.log('2. Перейдіть на аркуш "PopularProducts"');
console.log('3. Виділіть всі записи з JSON форматом (довгі рядки)');
console.log('4. Видаліть їх');
console.log('5. Залиште тільки записи з нормальними колонками:');
console.log('   - timestamp');
console.log('   - date'); 
console.log('   - time');
console.log('   - product_id');
console.log('   - views_count');
console.log('   - last_viewed_date');
console.log('   - last_viewed_time');
console.log('');
console.log('✅ Після очищення PopularProducts буде працювати правильно!');
console.log('');
console.log('💡 Нова логіка:');
console.log('   - Синхронізація кожні 10 хвилин (замість 2)');
console.log('   - Тільки при наявності змін');
console.log('   - Компактний формат замість JSON');
console.log('   - Менше навантаження на Google Sheets');