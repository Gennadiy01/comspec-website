# 🧪 Unified Test Suite - Єдина система тестування пошуку

## 🎯 Мета проекту

Централізована система тестування пошукової функціональності з автоматизованими звітами, метриками продуктивності та зручним користувацьким інтерфейсом.

---

## 🚀 Швидкий старт

### Базове використання

```javascript
// Запуск всіх тестів
runSearchTests();

// Запуск конкретного набору
runSearchTests('functional');    // Функціональні тести
runSearchTests('performance');   // Тести продуктивності
runSearchTests('integration');   // Інтеграційні тести
runSearchTests('regression');    // Регресійні тести

// Швидкий тест для розробки
quickSearchTest();
```

### Консольні команди

```javascript
// Статус системи тестування
searchTestStatus();

// Генерація звіту
searchTestReport();

// Конфігурація
configureSearchTests({
    timeout: 60000,     // Таймаут в мс
    parallel: true,     // Паралельне виконання
    reporting: true,    // Автоматичні звіти
    screenshots: false  // Скріншоти помилок
});
```

---

## 📦 Структура проекту

```
unified-test-suite/
├── TestRunner.js           # Головний запускач
├── TestReporter.js         # Система звітності
├── TestConfig.js           # Конфігурація
├── suites/
│   ├── functional/         # Функціональні тести
│   ├── performance/        # Тести продуктивності
│   ├── integration/        # Інтеграційні тести
│   └── regression/         # Регресійні тести
├── utils/
│   ├── helpers.js          # Допоміжні функції
│   ├── mocks.js            # Тестові дані
│   └── assertions.js       # Кастомні перевірки
└── reports/
    ├── html/               # HTML звіти
    ├── json/               # JSON метрики
    └── screenshots/        # Скріншоти помилок
```

---

## 🧪 Типи тестів

### 1. Функціональні тести (functional)
- ✅ **Точність пошуку**: перевірка релевантності результатів
- ✅ **Фільтрація результатів**: робота з категоріями та типами
- ✅ **Підсвічування**: точність підсвічування знайдених термінів
- ✅ **Навігація**: перехід до результатів пошуку

### 2. Тести продуктивності (performance)
- ⚡ **Швидкість пошуку**: час відгуку < 50ms
- 🗄️ **Кешування**: прискорення повторних запитів
- 💾 **Використання пам'яті**: оптимальне споживання ресурсів
- ⏱️ **Debouncing**: затримка запитів при швидкому друкуванні
- 📊 **Великі дані**: робота з великими обсягами даних

### 3. Інтеграційні тести (integration)
- 🔧 **Ініціалізація компонентів**: перевірка завантаження всіх модулів
- 🔗 **Взаємодія компонентів**: сумісність різних частин системи
- 📋 **Консистентність даних**: відповідність даних у різних індексах
- 🚨 **Обробка помилок**: коректна реакція на помилки
- 🌐 **Сумісність браузерів**: робота в різних браузерах

### 4. Регресійні тести (regression)
- 🐛 **Відомі проблеми**: перевірка виправлення багів
- 🎯 **Критичні шляхи**: основні сценарії використання
- 🔍 **Граничні випадки**: нестандартні ситуації
- 📝 **Попередні баги**: запобігання повторенню помилок

---

## 📊 Метрики та звітність

### Автоматичні метрики
```javascript
{
    performance: {
        searchSpeed: { target: 50, current: 35, status: "✅" },
        cacheHitRate: { target: 80, current: 85, status: "✅" },
        memoryUsage: { target: 10, current: 8, status: "✅" }
    },
    functional: {
        accuracy: { target: 95, current: 97, status: "✅" },
        coverage: { target: 90, current: 88, status: "⚠️" }
    },
    overall: {
        successRate: 94,
        totalTests: 47,
        passedTests: 44,
        failedTests: 3
    }
}
```

### Звіти
- **HTML Dashboard**: візуальний інтерфейс з графіками
- **JSON Export**: дані для інтеграції з CI/CD
- **Console Output**: детальні логи в консолі браузера
- **LocalStorage**: збереження історії результатів

---

## ⚙️ Конфігурація

### Базові налаштування
```javascript
const config = {
    // Загальні налаштування
    timeout: 30000,         // Таймаут тесту (мс)
    retries: 1,             // Кількість повторів при помилці
    parallel: false,        // Паралельне виконання
    
    // Звітність
    reporting: true,        // Автоматичні звіти
    screenshots: false,     // Скріншоти помилок
    verbose: true,          // Детальні логи
    
    // Продуктивність
    cacheTests: true,       // Тестування кешу
    performanceTargets: {
        searchSpeed: 50,    // мс
        cacheHitRate: 80,   // %
        memoryLimit: 10     // MB
    }
};
```

### Кастомні hooks
```javascript
// Додавання власних hooks
searchTestRunner.addHook('beforeAll', async () => {
    console.log('🔧 Підготовка тестового середовища...');
});

searchTestRunner.addHook('afterEach', async () => {
    // Очищення стану після кожного тесту
});
```

---

## 🛠️ Розробка та розширення

### Додавання нових тестів

```javascript
// 1. Створіть новий тест
async function testCustomFeature() {
    try {
        // Ваш код тестування
        const result = await customFunction();
        
        return {
            success: result.isValid,
            details: { value: result.value },
            message: `Результат: ${result.value}`
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}

// 2. Додайте до відповідного набору
const customSuite = {
    name: 'Кастомні тести',
    tests: [testCustomFeature],
    priority: 5
};

searchTestRunner.suites.set('custom', customSuite);
```

### Створення власних assertions

```javascript
// utils/assertions.js
export function assertSearchResults(results, expectedCount, expectedRelevance) {
    assert(results.length >= expectedCount, 
           `Очікувалось мінімум ${expectedCount} результатів, отримано ${results.length}`);
    
    const avgRelevance = results.reduce((sum, r) => sum + r.relevance, 0) / results.length;
    assert(avgRelevance >= expectedRelevance,
           `Очікувалась релевантність ${expectedRelevance}, отримано ${avgRelevance}`);
}
```

---

## 📈 Інтеграція з CI/CD

### GitHub Actions
```yaml
name: Search Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Search Tests
        run: |
          npm test:search
          npm run test:search:report
```

### Автоматичні перевірки
```javascript
// Валідація перед commit
if (searchTestResults.successRate < 95) {
    throw new Error('Тести пошуку не пройшли валідацію');
}
```

---

## 🎯 Цільові показники

### Мінімальні вимоги
- ✅ **95%** успішність тестів
- ✅ **<50ms** швидкість пошуку
- ✅ **>80%** релевантність результатів
- ✅ **0** критичних помилок

### Оптимальні показники
- 🏆 **98%** успішність тестів
- 🏆 **<30ms** швидкість пошуку
- 🏆 **>95%** релевантність результатів
- 🏆 **>90%** покриття функціональності

---

## 🆘 Troubleshooting

### Типові проблеми

#### "Движок пошуку не знайдено"
```javascript
// Перевірка ініціалізації
if (!window.hybridSearchEngine) {
    console.error('❌ HybridSearchEngine не ініціалізовано');
    // Перезавантажте сторінку або виконайте ініціалізацію
}
```

#### "Тести виконуються занадто повільно"
```javascript
// Увімкніть паралельне виконання
configureSearchTests({ parallel: true });

// Або зменшіть кількість тестів
runSearchTests('functional'); // Замість runSearchTests()
```

#### "Результати тестів непослідовні"
```javascript
// Очистіть кеш перед тестуванням
localStorage.clear();
sessionStorage.clear();

// Або використайте детермінований режим
configureSearchTests({ deterministicMode: true });
```

### Діагностичні команди

```javascript
// Статус всіх компонентів
window.diagnoseSearchSystem();

// Детальна інформація про движок
console.log(window.hybridSearchEngine.getStats());

// Перевірка глобальних об'єктів
['hybridSearchEngine', 'searchHighlighting', 'comspecSearchUtils']
    .forEach(name => console.log(`${name}:`, !!window[name]));
```

---

## 📚 Додаткові ресурси

- 📖 [Документація API пошуку](../CURRENT_API_DOCUMENTATION.md)
- 🔧 [Керівництво з розробки](../DEVELOPMENT_GUIDELINES.md)
- 📊 [Звіти про стан проекту](../reports/)
- 🧪 [Мануальні тести](stage-4/MANUAL_TESTING_GUIDE.md)

---

**📅 Створено**: ${new Date().toLocaleDateString('uk-UA')}  
**👤 Автор**: Claude Code Assistant  
**📍 Версія**: Unified Test Suite v1.0  
**🏷️ Теги**: testing, automation, search, quality-assurance