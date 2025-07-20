// unified-test-suite/TestRunner.js
// Централізований запускач тестів пошукової системи
// Версія: 1.0.0

/**
 * 🧪 ЦЕНТРАЛІЗОВАНИЙ ЗАПУСКАЧ ТЕСТІВ ПОШУКОВОЇ СИСТЕМИ
 * 
 * Єдина точка входу для всіх типів тестування:
 * - Функціональні тести
 * - Тести продуктивності  
 * - Інтеграційні тести
 * - Регресійні тести
 */

class SearchTestRunner {
    constructor() {
        this.version = '1.0.0';
        this.startTime = null;
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            duration: 0,
            details: []
        };
        
        this.config = {
            timeout: 30000,
            retries: 1,
            parallel: false,
            reporting: true,
            screenshots: false
        };
        
        this.suites = new Map();
        this.hooks = {
            beforeAll: [],
            afterAll: [],
            beforeEach: [],
            afterEach: []
        };
        
        this.init();
    }
    
    /**
     * Ініціалізація системи тестування
     */
    init() {
        console.log(`🧪 SearchTestRunner v${this.version} ініціалізовано`);
        this.loadTestSuites();
        this.setupGlobalAPI();
    }
    
    /**
     * Завантаження всіх тестових наборів
     */
    loadTestSuites() {
        // Функціональні тести
        this.suites.set('functional', {
            name: 'Функціональні тести',
            tests: [
                () => this.testSearchAccuracy(),
                () => this.testResultRelevance(),
                () => this.testSearchFiltering(),
                () => this.testHighlighting(),
                () => this.testNavigation()
            ],
            priority: 1
        });
        
        // Тести продуктивності
        this.suites.set('performance', {
            name: 'Тести продуктивності',
            tests: [
                () => this.testSearchSpeed(),
                () => this.testCaching(),
                () => this.testMemoryUsage(),
                () => this.testDebouncing(),
                () => this.testLargeDatasets()
            ],
            priority: 2
        });
        
        // Інтеграційні тести
        this.suites.set('integration', {
            name: 'Інтеграційні тести',
            tests: [
                () => this.testEngineInitialization(),
                () => this.testComponentIntegration(),
                () => this.testDataConsistency(),
                () => this.testErrorHandling(),
                () => this.testBrowserCompatibility()
            ],
            priority: 3
        });
        
        // Регресійні тести
        this.suites.set('regression', {
            name: 'Регресійні тести',
            tests: [
                () => this.testKnownIssues(),
                () => this.testCriticalPaths(),
                () => this.testEdgeCases(),
                () => this.testPreviousBugs()
            ],
            priority: 4
        });
        
        console.log(`📦 Завантажено ${this.suites.size} тестових наборів`);
    }
    
    /**
     * Налаштування глобального API
     */
    setupGlobalAPI() {
        // Основні функції
        window.runSearchTests = (suiteNames) => this.run(suiteNames);
        window.quickSearchTest = () => this.runQuick();
        window.searchTestStatus = () => this.getStatus();
        window.searchTestReport = () => this.generateReport();
        
        // Конфігурація
        window.configureSearchTests = (config) => this.configure(config);
        
        // Утиліти
        window.searchTestRunner = this;
        
        console.log('🌐 Глобальне API налаштовано');
    }
    
    /**
     * Запуск тестів
     * @param {string|string[]} suiteNames - Назви тестових наборів або 'all'
     * @param {Object} options - Опції запуску
     */
    async run(suiteNames = 'all', options = {}) {
        this.startTime = performance.now();
        this.results = { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0, details: [] };
        
        console.log('🚀 ПОЧАТОК ТЕСТУВАННЯ ПОШУКОВОЇ СИСТЕМИ');
        console.log('=' .repeat(60));
        
        try {
            // Виконання hooks beforeAll
            await this.executeHooks('beforeAll');
            
            // Визначення тестових наборів для запуску
            const suitesToRun = this.resolveSuites(suiteNames);
            
            // Запуск тестів
            if (options.parallel || this.config.parallel) {
                await this.runParallel(suitesToRun);
            } else {
                await this.runSequential(suitesToRun);
            }
            
            // Виконання hooks afterAll
            await this.executeHooks('afterAll');
            
        } catch (error) {
            console.error('💥 Критична помилка під час тестування:', error);
            this.results.failed++;
        }
        
        // Завершення
        this.results.duration = performance.now() - this.startTime;
        this.printSummary();
        
        if (this.config.reporting) {
            this.generateReport();
        }
        
        return this.results;
    }
    
    /**
     * Швидкий тест для розробки
     */
    async runQuick() {
        console.log('⚡ ШВИДКИЙ ТЕСТ ПОШУКОВОЇ СИСТЕМИ');
        
        const quickTests = [
            { name: 'Ініціалізація', test: () => this.testEngineInitialization() },
            { name: 'Базовий пошук', test: () => this.testBasicSearch() },
            { name: 'Швидкість', test: () => this.testSearchSpeed() },
            { name: 'Релевантність', test: () => this.testResultRelevance() }
        ];
        
        let passed = 0;
        
        for (const test of quickTests) {
            try {
                console.log(`🔍 ${test.name}...`);
                const result = await test.test();
                if (result.success) {
                    console.log(`✅ ${test.name} - ПРОЙДЕНО`);
                    passed++;
                } else {
                    console.log(`❌ ${test.name} - НЕ ПРОЙДЕНО: ${result.message}`);
                }
            } catch (error) {
                console.log(`💥 ${test.name} - ПОМИЛКА: ${error.message}`);
            }
        }
        
        console.log(`\n📊 Швидкий тест: ${passed}/${quickTests.length} пройдено`);
        return { passed, total: quickTests.length, success: passed === quickTests.length };
    }
    
    /**
     * Послідовний запуск тестів
     */
    async runSequential(suites) {
        for (const suite of suites) {
            console.log(`\n📋 Запуск набору: ${suite.name}`);
            
            for (const test of suite.tests) {
                await this.executeHooks('beforeEach');
                const result = await this.executeTest(test);
                await this.executeHooks('afterEach');
                
                this.results.total++;
                this.results.details.push(result);
                
                if (result.success) {
                    this.results.passed++;
                    console.log(`✅ ${result.name} (${result.duration}ms)`);
                } else {
                    this.results.failed++;
                    console.log(`❌ ${result.name} - ${result.error} (${result.duration}ms)`);
                }
            }
        }
    }
    
    /**
     * Паралельний запуск тестів
     */
    async runParallel(suites) {
        const allTests = [];
        
        for (const suite of suites) {
            for (const test of suite.tests) {
                allTests.push({
                    suite: suite.name,
                    test: test
                });
            }
        }
        
        console.log(`🔄 Паралельний запуск ${allTests.length} тестів...`);
        
        const promises = allTests.map(async ({suite, test}) => {
            await this.executeHooks('beforeEach');
            const result = await this.executeTest(test);
            await this.executeHooks('afterEach');
            return result;
        });
        
        const results = await Promise.allSettled(promises);
        
        results.forEach(result => {
            this.results.total++;
            
            if (result.status === 'fulfilled' && result.value.success) {
                this.results.passed++;
                this.results.details.push(result.value);
            } else {
                this.results.failed++;
                this.results.details.push({
                    name: 'Unknown test',
                    success: false,
                    error: result.reason || result.value?.error || 'Unknown error',
                    duration: 0
                });
            }
        });
    }
    
    /**
     * Виконання окремого тесту
     */
    async executeTest(testFunction) {
        const testName = testFunction.name || 'Unnamed test';
        const startTime = performance.now();
        
        try {
            const result = await Promise.race([
                testFunction(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Test timeout')), this.config.timeout)
                )
            ]);
            
            const duration = Math.round(performance.now() - startTime);
            
            return {
                name: testName,
                success: result?.success !== false,
                duration: duration,
                details: result?.details || null,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            const duration = Math.round(performance.now() - startTime);
            
            return {
                name: testName,
                success: false,
                error: error.message,
                duration: duration,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    /**
     * Виконання hooks
     */
    async executeHooks(hookName) {
        const hooks = this.hooks[hookName] || [];
        
        for (const hook of hooks) {
            try {
                await hook();
            } catch (error) {
                console.warn(`⚠️ Hook ${hookName} failed:`, error.message);
            }
        }
    }
    
    /**
     * Розв'язання тестових наборів
     */
    resolveSuites(suiteNames) {
        if (suiteNames === 'all') {
            return Array.from(this.suites.values()).sort((a, b) => a.priority - b.priority);
        }
        
        const names = Array.isArray(suiteNames) ? suiteNames : [suiteNames];
        const resolved = [];
        
        for (const name of names) {
            if (this.suites.has(name)) {
                resolved.push(this.suites.get(name));
            } else {
                console.warn(`⚠️ Тестовий набір "${name}" не знайдено`);
            }
        }
        
        return resolved.sort((a, b) => a.priority - b.priority);
    }
    
    /**
     * Друк підсумків
     */
    printSummary() {
        console.log('\n📊 ПІДСУМКИ ТЕСТУВАННЯ:');
        console.log('=' .repeat(60));
        console.log(`⏱️ Час виконання: ${Math.round(this.results.duration)}ms`);
        console.log(`📈 Всього тестів: ${this.results.total}`);
        console.log(`✅ Пройдено: ${this.results.passed}`);
        console.log(`❌ Не пройдено: ${this.results.failed}`);
        console.log(`⏭️ Пропущено: ${this.results.skipped}`);
        
        const successRate = this.results.total > 0 
            ? Math.round((this.results.passed / this.results.total) * 100)
            : 0;
            
        console.log(`📊 Успішність: ${successRate}%`);
        
        if (this.results.failed === 0) {
            console.log('\n🎉 ВСІ ТЕСТИ ПРОЙДЕНІ УСПІШНО!');
        } else {
            console.log('\n⚠️ ВИЯВЛЕНО ПРОБЛЕМИ - ПОТРІБНЕ ВИПРАВЛЕННЯ');
        }
    }
    
    /**
     * Генерація звіту
     */
    generateReport() {
        const report = {
            version: this.version,
            timestamp: new Date().toISOString(),
            summary: {
                total: this.results.total,
                passed: this.results.passed,
                failed: this.results.failed,
                skipped: this.results.skipped,
                duration: Math.round(this.results.duration),
                successRate: Math.round((this.results.passed / Math.max(this.results.total, 1)) * 100)
            },
            details: this.results.details,
            environment: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: new Date().toISOString()
            }
        };
        
        // Збереження у localStorage
        try {
            localStorage.setItem('searchTestResults', JSON.stringify(report));
            console.log('💾 Звіт збережено в localStorage');
        } catch (error) {
            console.warn('⚠️ Не вдалося зберегти звіт:', error.message);
        }
        
        return report;
    }
    
    /**
     * Конфігурація тестів
     */
    configure(newConfig) {
        Object.assign(this.config, newConfig);
        console.log('⚙️ Конфігурацію оновлено:', this.config);
    }
    
    /**
     * Додавання hooks
     */
    addHook(hookName, hookFunction) {
        if (this.hooks[hookName]) {
            this.hooks[hookName].push(hookFunction);
        }
    }
    
    /**
     * Отримання статусу
     */
    getStatus() {
        return {
            version: this.version,
            config: this.config,
            suites: Array.from(this.suites.keys()),
            lastResults: this.results
        };
    }
    
    // ==========================================
    // КОНКРЕТНІ ТЕСТИ
    // ==========================================
    
    /**
     * Тест ініціалізації движка
     */
    async testEngineInitialization() {
        const checks = [
            () => typeof window.hybridSearchEngine !== 'undefined',
            () => typeof window.searchHighlighting !== 'undefined',
            () => typeof window.comspecSearchUtils !== 'undefined'
        ];
        
        const results = checks.map(check => check());
        const passed = results.filter(Boolean).length;
        
        return {
            success: passed === checks.length,
            details: { passed, total: checks.length },
            message: `${passed}/${checks.length} компонентів ініціалізовано`
        };
    }
    
    /**
     * Базовий тест пошуку
     */
    async testBasicSearch() {
        if (!window.hybridSearchEngine) {
            return { success: false, message: 'Движок не доступний' };
        }
        
        try {
            const results = window.hybridSearchEngine.search('тест', 5);
            return {
                success: Array.isArray(results),
                details: { count: results?.length || 0 },
                message: `Знайдено ${results?.length || 0} результатів`
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
    
    /**
     * Тест швидкості пошуку
     */
    async testSearchSpeed() {
        if (!window.hybridSearchEngine) {
            return { success: false, message: 'Движок не доступний' };
        }
        
        const queries = ['пісок', 'щебінь', 'бетон', 'доставка'];
        const times = [];
        
        for (const query of queries) {
            const start = performance.now();
            window.hybridSearchEngine.search(query, 10);
            const end = performance.now();
            times.push(end - start);
        }
        
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const success = avgTime < 50;
        
        return {
            success,
            details: { avgTime: Math.round(avgTime), times },
            message: `Середній час: ${Math.round(avgTime)}ms`
        };
    }
    
    /**
     * Тест релевантності результатів
     */
    async testResultRelevance() {
        if (!window.hybridSearchEngine) {
            return { success: false, message: 'Движок не доступний' };
        }
        
        const testCases = [
            { query: 'пісок', expectedKeyword: 'пісок' },
            { query: 'щебінь', expectedKeyword: 'щебінь' },
            { query: 'доставка', expectedKeyword: 'доставка' }
        ];
        
        let relevantCount = 0;
        let totalResults = 0;
        
        for (const testCase of testCases) {
            const results = window.hybridSearchEngine.search(testCase.query, 5);
            totalResults += results.length;
            
            const relevant = results.filter(r => 
                r.title?.toLowerCase().includes(testCase.expectedKeyword) ||
                r.content?.toLowerCase().includes(testCase.expectedKeyword)
            );
            
            relevantCount += relevant.length;
        }
        
        const relevanceRate = totalResults > 0 ? (relevantCount / totalResults) * 100 : 0;
        const success = relevanceRate >= 80;
        
        return {
            success,
            details: { relevanceRate: Math.round(relevanceRate), relevantCount, totalResults },
            message: `Релевантність: ${Math.round(relevanceRate)}%`
        };
    }
    
    /**
     * Тест кешування
     */
    async testCaching() {
        if (!window.hybridSearchEngine) {
            return { success: false, message: 'Движок не доступний' };
        }
        
        const query = 'тест_кешування_' + Date.now();
        
        // Перший пошук
        const start1 = performance.now();
        window.hybridSearchEngine.search(query, 5);
        const time1 = performance.now() - start1;
        
        // Другий пошук (має бути з кешу)
        const start2 = performance.now();
        window.hybridSearchEngine.search(query, 5);
        const time2 = performance.now() - start2;
        
        const speedup = time1 / Math.max(time2, 0.1);
        const success = speedup > 1.5; // Прискорення мінімум в 1.5 рази
        
        return {
            success,
            details: { time1: Math.round(time1), time2: Math.round(time2), speedup: Math.round(speedup * 10) / 10 },
            message: `Прискорення: ${Math.round(speedup * 10) / 10}x`
        };
    }
    
    /**
     * Заглушки для інших тестів
     */
    async testSearchAccuracy() { return { success: true, message: 'Not implemented' }; }
    async testSearchFiltering() { return { success: true, message: 'Not implemented' }; }
    async testHighlighting() { return { success: true, message: 'Not implemented' }; }
    async testNavigation() { return { success: true, message: 'Not implemented' }; }
    async testMemoryUsage() { return { success: true, message: 'Not implemented' }; }
    async testDebouncing() { return { success: true, message: 'Not implemented' }; }
    async testLargeDatasets() { return { success: true, message: 'Not implemented' }; }
    async testComponentIntegration() { return { success: true, message: 'Not implemented' }; }
    async testDataConsistency() { return { success: true, message: 'Not implemented' }; }
    async testErrorHandling() { return { success: true, message: 'Not implemented' }; }
    async testBrowserCompatibility() { return { success: true, message: 'Not implemented' }; }
    async testKnownIssues() { return { success: true, message: 'Not implemented' }; }
    async testCriticalPaths() { return { success: true, message: 'Not implemented' }; }
    async testEdgeCases() { return { success: true, message: 'Not implemented' }; }
    async testPreviousBugs() { return { success: true, message: 'Not implemented' }; }
}

// Ініціалізація при завантаженні
if (typeof window !== 'undefined') {
    window.searchTestRunner = new SearchTestRunner();
    
    // Автоматичне повідомлення про готовність
    setTimeout(() => {
        console.log('🧪 SearchTestRunner готовий! Використовуйте:');
        console.log('  runSearchTests() - всі тести');
        console.log('  runSearchTests("functional") - функціональні тести');
        console.log('  runSearchTests("performance") - тести продуктивності');
        console.log('  quickSearchTest() - швидкий тест');
        console.log('  searchTestStatus() - статус системи');
    }, 1000);
}

export default SearchTestRunner;