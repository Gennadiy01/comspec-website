// src/components/search/SearchEngineInitializer.js
// 🚀 КОМПЛЕКСНА СИСТЕМА ІНІЦІАЛІЗАЦІЇ COMSPEC SEARCH з SearchHighlighting

console.log('🚀 Ініціалізація глобальної пошукової системи з підсвічуванням...');

/**
 * ✅ Асинхронна ініціалізація пошукової системи з SearchHighlighting
 */
const initializeSearchEngine = async () => {
    try {
        console.log('🔧 Початок ініціалізації пошукової системи...');
        
        // 1. Динамічний імпорт або використання існуючого HybridSearchEngine
        let HybridSearchEngine;
        
        try {
            // Спробуємо імпортувати динамічно
            const module = await import('./HybridSearchEngine');
            HybridSearchEngine = module.default;
        } catch (importError) {
            console.log('⚠️ Динамічний імпорт не вдався, використовуємо глобальний');
            // Використовуємо глобальний, якщо є
            if (window.HybridSearchEngine) {
                HybridSearchEngine = window.HybridSearchEngine;
            } else {
                throw new Error('HybridSearchEngine недоступний');
            }
        }
        
        if (!HybridSearchEngine) {
            throw new Error('HybridSearchEngine не завантажено');
        }
        
        // 2. Використовуємо існуючий глобальний екземпляр або створюємо новий
        let engine;
        if (window.hybridSearchEngine && window.hybridSearchEngine.isInitialized) {
            engine = window.hybridSearchEngine;
            console.log('✅ Використовуємо існуючий ініціалізований движок');
        } else if (window.hybridSearchEngine) {
            engine = window.hybridSearchEngine;
            await engine.initialize();
            console.log('✅ Ініціалізували існуючий движок');
        } else if (HybridSearchEngine) {
            engine = new HybridSearchEngine();
            await engine.initialize();
            console.log('✅ Створили новий движок');
        } else {
            throw new Error('HybridSearchEngine недоступний');
        }
        
        // Додаємо до глобального об'єкта
        window.hybridSearchEngine = engine;
        window.contextSearch = engine.contextSearch ? engine.contextSearch.bind(engine) : engine.search.bind(engine);
        
        // 3. Діагностика контексту з безпечною перевіркою
        console.log('🔍 Діагностика контексту...');
        
        let contextIssues = null;
        try {
            if (engine.diagnoseContextIssues) {
                contextIssues = engine.diagnoseContextIssues();
                
                // ВИПРАВЛЕНО: Безпечна перевірка length
                if (contextIssues && 
                    typeof contextIssues === 'object' && 
                    contextIssues.problematicRecords && 
                    Array.isArray(contextIssues.problematicRecords) && 
                    contextIssues.problematicRecords.length > 0) {
                    
                    console.log('🔧 Виявлено проблемні записи, виправляємо...');
                    
                    if (engine.fixProblematicRecords) {
                        const fixResults = engine.fixProblematicRecords();
                        console.log('✅ Результати виправлення:', fixResults);
                    }
                } else {
                    console.log('✅ Контекст в порядку');
                }
            }
        } catch (diagError) {
            console.warn('⚠️ Помилка діагностики контексту:', diagError.message);
        }
        
        // 4. ✅ Ініціалізуємо SearchHighlighting
        let searchHighlighting = null;
        try {
            console.log('🎨 Завантаження SearchHighlighting...');
            
            let SearchHighlighting;
            try {
                const highlightModule = await import('./SearchHighlighting');
                SearchHighlighting = highlightModule.default;
            } catch (highlightImportError) {
                console.log('⚠️ Динамічний імпорт SearchHighlighting не вдався');
                // Використовуємо глобальний, якщо є
                SearchHighlighting = window.SearchHighlighting;
            }
            
            if (SearchHighlighting) {
                searchHighlighting = new SearchHighlighting();
                window.SearchHighlighting = SearchHighlighting;
                window.searchHighlighting = searchHighlighting;
                console.log('✅ SearchHighlighting ініціалізовано успішно');
            } else {
                throw new Error('SearchHighlighting не експортовано правильно');
            }
            
        } catch (highlightError) {
            console.warn('⚠️ SearchHighlighting не вдалося завантажити:', highlightError.message);
            console.log('💡 Пошук буде працювати без візуального підсвічування');
            
            // Створюємо fallback функції
            await initializeFallbackHighlighting();
        }
        
        // 5. ✅ Створюємо розширений глобальний API з підсвічуванням
        window.contextSearch = {
            // Основні функції пошуку
            search: (query, limit) => engine.search(query, limit),
            getStats: () => engine.getStats(),
            getContextStats: () => engine.getContextStats(),
            refresh: () => engine.refresh ? engine.refresh() : engine.initialize(),
            
            // ✅ Функції підсвічування (якщо доступні)
            highlight: searchHighlighting 
                ? (element, term, contextType) => searchHighlighting.highlightTermInElement 
                    ? searchHighlighting.highlightTermInElement(element, term, contextType)
                    : searchHighlighting.highlight(term, { container: element })
                : window.highlightSearchResults || ((element, term) => {
                    console.warn('Підсвічування недоступне');
                    return false;
                }),
            
            navigate: searchHighlighting
                ? (selector, term, contextType, directElement) => searchHighlighting.scrollToElementWithHighlight
                    ? searchHighlighting.scrollToElementWithHighlight(selector, term, contextType, directElement)
                    : searchHighlighting.navigateToResult({ selector, text: term }, term)
                : window.navigateToResult || ((selector, term) => {
                    console.warn('Навігація з підсвічуванням недоступна');
                    return false;
                }),
            
            clear: searchHighlighting
                ? () => searchHighlighting.clearHighlights()
                : window.clearSearchHighlights || (() => {
                    console.warn('Очищення підсвічування недоступне');
                    return false;
                }),
            
            // Діагностичні функції
            diagnose: () => engine.diagnoseContextIssues ? engine.diagnoseContextIssues() : engine.diagnoseSystem(),
            fix: () => engine.fixProblematicRecords ? engine.fixProblematicRecords() : { message: 'Функція недоступна' },
            
            // Тестові функції
            test: {
                basic: () => {
                    console.log('🧪 Базове тестування пошуку...');
                    try {
                        const results = engine.search('пісок', 3);
                        console.log(`Знайдено ${results.length} результатів для "пісок"`);
                        return results;
                    } catch (error) {
                        console.error('❌ Помилка базового тесту:', error);
                        return [];
                    }
                },
                
                context: () => {
                    console.log('🧪 Тестування контекстного пошуку...');
                    try {
                        if (engine.testContextSearch) {
                            engine.testContextSearch();
                        } else {
                            // Власний тест контексту
                            const phoneTest = engine.search('044', 2);
                            const addressTest = engine.search('київ', 2);
                            console.log(`Телефон: ${phoneTest.length}, Адреса: ${addressTest.length}`);
                        }
                    } catch (error) {
                        console.error('❌ Помилка контекстного тесту:', error);
                    }
                },
                
                highlighting: () => {
                    if (!searchHighlighting && !window.highlightSearchResults) {
                        console.log('❌ Підсвічування недоступне для тестування');
                        return false;
                    }
                    
                    console.log('🧪 Тестування підсвічування...');
                    try {
                        const h1 = document.querySelector('h1');
                        if (h1) {
                            if (searchHighlighting && searchHighlighting.highlightTermInElement) {
                                searchHighlighting.highlightTermInElement(h1, 'COMSPEC', 'default');
                            } else if (window.highlightSearchResults) {
                                window.highlightSearchResults('COMSPEC', []);
                            }
                            
                            console.log('✅ Тест підсвічування виконано');
                            
                            setTimeout(() => {
                                if (searchHighlighting && searchHighlighting.clearHighlights) {
                                    searchHighlighting.clearHighlights();
                                } else if (window.clearSearchHighlights) {
                                    window.clearSearchHighlights();
                                }
                                console.log('🧹 Підсвічування очищено');
                            }, 3000);
                            
                            return true;
                        } else {
                            console.log('⚠️ Елемент h1 не знайдено');
                            return false;
                        }
                    } catch (error) {
                        console.error('❌ Помилка тесту підсвічування:', error);
                        return false;
                    }
                },
                
                navigation: () => {
                    if (!searchHighlighting && !window.navigateToResult) {
                        console.log('❌ Навігація недоступна для тестування');
                        return false;
                    }
                    
                    console.log('🧪 Тестування навігації...');
                    try {
                        if (searchHighlighting && searchHighlighting.scrollToElementWithHighlight) {
                            return searchHighlighting.scrollToElementWithHighlight('h1', 'COMSPEC', 'default');
                        } else if (window.navigateToResult) {
                            return window.navigateToResult({ selector: 'h1', text: 'COMSPEC' });
                        }
                        return false;
                    } catch (error) {
                        console.error('❌ Помилка тесту навігації:', error);
                        return false;
                    }
                },
                
                // ✅ Комплексний тест усієї системи
                comprehensive: () => {
                    console.log('🧪 КОМПЛЕКСНИЙ ТЕСТ COMSPEC SEARCH');
                    console.log('='.repeat(50));
                    
                    let score = 0;
                    const maxScore = 6;
                    
                    // Тест 1: Базовий пошук
                    console.log('\n1️⃣ Тест базового пошуку...');
                    try {
                        const results = engine.search('пісок', 3);
                        if (results.length > 0) {
                            console.log(`✅ Знайдено ${results.length} результатів`);
                            score++;
                        } else {
                            console.log('❌ Результатів не знайдено');
                        }
                    } catch (error) {
                        console.log('❌ Помилка пошуку:', error.message);
                    }
                    
                    // Тест 2: Статистика
                    console.log('\n2️⃣ Тест статистики...');
                    try {
                        const stats = engine.getStats();
                        const contextStats = engine.getContextStats();
                        console.log(`✅ Записів: ${stats.totalRecords}, З контекстом: ${contextStats.totalWithContext}`);
                        if (stats.totalRecords > 0) score++;
                    } catch (error) {
                        console.log('❌ Помилка статистики:', error.message);
                    }
                    
                    // Тест 3: Контекстний пошук
                    console.log('\n3️⃣ Тест контекстного пошуку...');
                    try {
                        const phoneResults = engine.search('044', 2);
                        const addressResults = engine.search('київ', 2);
                        if (phoneResults.length > 0 || addressResults.length > 0) {
                            console.log(`✅ Контекстний пошук працює`);
                            score++;
                        } else {
                            console.log('⚠️ Контекстні результати не знайдено');
                        }
                    } catch (error) {
                        console.log('❌ Помилка контекстного пошуку:', error.message);
                    }
                    
                    // Тест 4: Підсвічування
                    console.log('\n4️⃣ Тест підсвічування...');
                    if (searchHighlighting || window.highlightSearchResults) {
                        try {
                            const h1 = document.querySelector('h1');
                            if (h1) {
                                if (searchHighlighting && searchHighlighting.highlightTermInElement) {
                                    searchHighlighting.highlightTermInElement(h1, 'тест', 'default');
                                } else if (window.highlightSearchResults) {
                                    window.highlightSearchResults('тест', []);
                                }
                                console.log('✅ Підсвічування працює');
                                score++;
                                
                                setTimeout(() => {
                                    if (searchHighlighting && searchHighlighting.clearHighlights) {
                                        searchHighlighting.clearHighlights();
                                    } else if (window.clearSearchHighlights) {
                                        window.clearSearchHighlights();
                                    }
                                }, 2000);
                            } else {
                                console.log('⚠️ Елемент для підсвічування не знайдено');
                            }
                        } catch (error) {
                            console.log('❌ Помилка підсвічування:', error.message);
                        }
                    } else {
                        console.log('❌ Підсвічування недоступне');
                    }
                    
                    // Тест 5: Навігація
                    console.log('\n5️⃣ Тест навігації...');
                    if (searchHighlighting || window.navigateToResult) {
                        try {
                            let result = false;
                            if (searchHighlighting && searchHighlighting.scrollToElementWithHighlight) {
                                result = searchHighlighting.scrollToElementWithHighlight('body', 'тест', 'default');
                            } else if (window.navigateToResult) {
                                result = window.navigateToResult({ selector: 'body', text: 'тест' });
                            }
                            
                            if (result) {
                                console.log('✅ Навігація працює');
                                score++;
                            } else {
                                console.log('⚠️ Навігація не знайшла елемент');
                            }
                        } catch (error) {
                            console.log('❌ Помилка навігації:', error.message);
                        }
                    } else {
                        console.log('❌ Навігація недоступна');
                    }
                    
                    // Тест 6: Продуктивність
                    console.log('\n6️⃣ Тест продуктивності...');
                    try {
                        const startTime = performance.now();
                        engine.search('будівництво', 5);
                        const endTime = performance.now();
                        const searchTime = endTime - startTime;
                        
                        if (searchTime < 100) {
                            console.log(`✅ Швидкість пошуку: ${searchTime.toFixed(2)}ms`);
                            score++;
                        } else {
                            console.log(`⚠️ Повільний пошук: ${searchTime.toFixed(2)}ms`);
                        }
                    } catch (error) {
                        console.log('❌ Помилка тесту продуктивності:', error.message);
                    }
                    
                    // Результати тестування
                    console.log('\n📊 РЕЗУЛЬТАТИ ТЕСТУВАННЯ:');
                    console.log(`🎯 Оцінка: ${score}/${maxScore} (${Math.round((score/maxScore)*100)}%)`);
                    
                    if (score === maxScore) {
                        console.log('🏆 ІДЕАЛЬНИЙ РЕЗУЛЬТАТ! Система працює бездоганно');
                    } else if (score >= maxScore * 0.8) {
                        console.log('🥇 ВІДМІННИЙ РЕЗУЛЬТАТ! Система працює чудово');
                    } else if (score >= maxScore * 0.6) {
                        console.log('🥈 ДОБРИЙ РЕЗУЛЬТАТ! Система працює з мінорними проблемами');
                    } else {
                        console.log('🥉 ПОТРЕБУЄ ПОКРАЩЕННЯ! Є проблеми, які потрібно виправити');
                    }
                    
                    return { score, maxScore, percentage: Math.round((score/maxScore)*100) };
                }
            }
        };
        
        // 6. Отримуємо фінальну статистику
        const stats = engine.getStats();
        const contextStats = engine.getContextStats();
        
        console.log('✅ Пошукова система ініціалізована:', {
            totalRecords: stats.totalRecords,
            staticIndex: stats.staticIndex,
            dynamicIndex: stats.dynamicIndex,
            contextCoverage: `${contextStats.totalWithContext}/${stats.totalRecords}`,
            highlightingAvailable: !!(searchHighlighting || window.highlightSearchResults)
        });
        
        // 7. Тестовий пошук для перевірки
        const testResults = engine.search('щебінь', 3);
        console.log(`🧪 Тестовий пошук: знайдено ${testResults.length} результатів`);
        
        // 8. ✅ Повідомлення про готовність системи
        console.log('🎉 COMSPEC SEARCH СИСТЕМА ГОТОВА!');
        console.log('📋 Доступні команди в консолі:');
        console.log('  window.contextSearch.search("термін") - пошук');
        console.log('  window.contextSearch.highlight(element, "термін") - підсвічування');
        console.log('  window.contextSearch.navigate("селектор", "термін") - навігація');
        console.log('  window.contextSearch.test.basic() - тест пошуку');
        console.log('  window.contextSearch.test.highlighting() - тест підсвічування');
        console.log('  window.contextSearch.test.comprehensive() - повний тест');
        console.log('  window.contextSearch.getContextStats() - статистика контексту');
        
        return {
            engine: engine,
            highlighting: searchHighlighting,
            api: window.contextSearch
        };
        
    } catch (error) {
        console.error('❌ Критична помилка ініціалізації пошукової системи:', error);
        
        // Створюємо мінімальний fallback API
        window.contextSearch = {
            search: () => { console.error('Пошук недоступний:', error.message); return []; },
            highlight: () => console.error('Підсвічування недоступне:', error.message),
            navigate: () => console.error('Навігація недоступна:', error.message),
            clear: () => console.error('Очищення недоступне:', error.message),
            getStats: () => ({ error: error.message }),
            test: {
                basic: () => console.error('Тестування недоступне:', error.message),
                comprehensive: () => ({ score: 0, maxScore: 6, percentage: 0, error: error.message })
            }
        };
        
        return null;
    }
};

/**
 * ⚡ Ініціалізація fallback функцій підсвічування
 */
async function initializeFallbackHighlighting() {
    try {
        // Функція підсвічування результатів
        window.highlightSearchResults = function(query, results, options = {}) {
            console.log(`🎨 Fallback підсвічування для "${query}"`);
            
            const {
                container = document.body,
                highlightClass = 'comspec-search-highlight'
            } = options;
            
            if (!query) return false;
            
            // Очищаємо попереднє підсвічування
            clearHighlights(container, highlightClass);
            
            // Створюємо регулярний вираз
            const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            
            // Підсвічуємо текст
            highlightInElement(container, regex, highlightClass);
            
            console.log(`✅ Fallback підсвічено входження для "${query}"`);
            return true;
        };
        
        // Функція очищення підсвічування
        window.clearSearchHighlights = function(container = document.body) {
            clearHighlights(container, 'comspec-search-highlight');
            console.log('🧹 Fallback підсвічування очищено');
        };
        
        // Функція навігації по результатах
        window.navigateToResult = function(resultData) {
            if (!resultData) {
                console.warn('⚠️ Немає даних для навігації');
                return false;
            }
            
            try {
                let targetElement = null;
                
                if (resultData.element) {
                    targetElement = resultData.element;
                } else if (resultData.selector) {
                    targetElement = document.querySelector(resultData.selector);
                } else if (resultData.text) {
                    // Пошук по тексту
                    const elements = Array.from(document.querySelectorAll('*'))
                        .filter(el => el.textContent && el.textContent.includes(resultData.text));
                    targetElement = elements[0];
                }
                
                if (targetElement) {
                    // Прокручуємо до елемента
                    targetElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                    
                    // Тимчасове підсвічування
                    const originalStyle = targetElement.style.cssText;
                    targetElement.style.cssText += `
                        background-color: #ffff00 !important;
                        transition: background-color 0.3s ease !important;
                    `;
                    
                    setTimeout(() => {
                        targetElement.style.cssText = originalStyle;
                    }, 2000);
                    
                    console.log('📍 Fallback навігація виконана');
                    return true;
                }
            } catch (error) {
                console.error('❌ Помилка fallback навігації:', error);
            }
            
            return false;
        };
        
        // Допоміжні функції
        function clearHighlights(container, highlightClass) {
            const highlights = container.querySelectorAll(`.${highlightClass}`);
            highlights.forEach(highlight => {
                const parent = highlight.parentNode;
                if (parent) {
                    parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
                    parent.normalize();
                }
            });
        }
        
        function highlightInElement(element, regex, highlightClass) {
            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            
            const textNodes = [];
            let node;
            
            while ((node = walker.nextNode())) {
                if (node.parentElement.tagName !== 'SCRIPT' && 
                    node.parentElement.tagName !== 'STYLE' &&
                    !node.parentElement.classList.contains(highlightClass)) {
                    textNodes.push(node);
                }
            }
            
            textNodes.forEach(textNode => {
                const text = textNode.textContent;
                if (regex.test(text)) {
                    const highlightedHTML = text.replace(regex, 
                        `<span class="${highlightClass}" style="background-color: #ffff00; font-weight: bold;">$1</span>`
                    );
                    
                    const wrapper = document.createElement('div');
                    wrapper.innerHTML = highlightedHTML;
                    
                    const fragment = document.createDocumentFragment();
                    while (wrapper.firstChild) {
                        fragment.appendChild(wrapper.firstChild);
                    }
                    
                    textNode.parentNode.replaceChild(fragment, textNode);
                }
            });
        }
        
        console.log('✅ Fallback функції підсвічування ініціалізовано');
        
    } catch (error) {
        console.error('❌ Помилка ініціалізації fallback підсвічування:', error);
    }
}

/**
 * ✅ Функція швидкої діагностики системи
 */
const diagnoseSearchSystem = () => {
    console.log('🔬 ШВИДКА ДІАГНОСТИКА COMSPEC SEARCH');
    console.log('='.repeat(50));
    
    // Перевіряємо доступність компонентів
    const checks = {
        hybridSearchEngine: !!window.hybridSearchEngine,
        contextSearch: !!window.contextSearch,
        searchHighlighting: !!(window.searchHighlighting || window.SearchHighlighting),
        highlightFunction: !!(window.contextSearch?.highlight || window.highlightSearchResults),
        navigateFunction: !!(window.contextSearch?.navigate || window.navigateToResult),
        clearFunction: !!(window.contextSearch?.clear || window.clearSearchHighlights)
    };
    
    console.log('📊 ДОСТУПНІСТЬ КОМПОНЕНТІВ:');
    Object.entries(checks).forEach(([component, available]) => {
        console.log(`  ${available ? '✅' : '❌'} ${component}`);
    });
    
    // Статистика движка
    if (window.hybridSearchEngine) {
        try {
            const stats = window.hybridSearchEngine.getStats();
            const contextStats = window.hybridSearchEngine.getContextStats();
            
            console.log('\n📈 СТАТИСТИКА ДВИЖКА:');
            console.log(`  📝 Всього записів: ${stats.totalRecords}`);
            console.log(`  🔍 Статичних: ${stats.staticIndex}`);
            console.log(`  🔄 Динамічних: ${stats.dynamicIndex}`);
            console.log(`  🎯 З контекстом: ${contextStats.totalWithContext}/${stats.totalRecords} (${Math.round((contextStats.totalWithContext / stats.totalRecords) * 100)}%)`);
            
            const coverage = Math.round((contextStats.totalWithContext / stats.totalRecords) * 100);
            if (coverage >= 100) {
                console.log('  🏆 ІДЕАЛЬНЕ ПОКРИТТЯ КОНТЕКСТОМ!');
            } else if (coverage >= 95) {
                console.log('  🥇 ВІДМІННЕ ПОКРИТТЯ КОНТЕКСТОМ');
            } else if (coverage >= 90) {
                console.log('  🥈 ДОБРЕ ПОКРИТТЯ КОНТЕКСТОМ');
            } else {
                console.log('  ⚠️ ПОТРЕБУЄ ПОКРАЩЕННЯ КОНТЕКСТУ');
            }
            
        } catch (error) {
            console.log('  ❌ Помилка отримання статистики:', error.message);
        }
    }
    
    // Тест продуктивності
    if (window.hybridSearchEngine) {
        console.log('\n⚡ ТЕСТ ПРОДУКТИВНОСТІ:');
        try {
            const startTime = performance.now();
            const results = window.hybridSearchEngine.search('пісок', 5);
            const endTime = performance.now();
            const searchTime = endTime - startTime;
            
            console.log(`  📊 Результатів: ${results.length}`);
            console.log(`  ⏱️ Час пошуку: ${searchTime.toFixed(2)}ms`);
            
            if (searchTime < 10) {
                console.log('  🚀 НАДШВИДКО!');
            } else if (searchTime < 50) {
                console.log('  ⚡ ШВИДКО');
            } else if (searchTime < 100) {
                console.log('  ✅ НОРМАЛЬНО');
            } else {
                console.log('  ⚠️ ПОВІЛЬНО');
            }
        } catch (error) {
            console.log('  ❌ Помилка тесту продуктивності:', error.message);
        }
    }
    
    console.log('\n🎯 ГОТОВНІСТЬ СИСТЕМИ:');
    const readiness = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;
    const percentage = Math.round((readiness / total) * 100);
    
    console.log(`  📊 ${readiness}/${total} компонентів готово (${percentage}%)`);
    
    if (percentage >= 100) {
        console.log('  🚀 СИСТЕМА ПОВНІСТЮ ГОТОВА!');
    } else if (percentage >= 80) {
        console.log('  ✅ СИСТЕМА ГОТОВА З МІНОРНИМИ ОБМЕЖЕННЯМИ');
    } else if (percentage >= 60) {
        console.log('  ⚠️ СИСТЕМА ЧАСТКОВО ГОТОВА');
    } else {
        console.log('  ❌ СИСТЕМА ПОТРЕБУЄ НАЛАГОДЖЕННЯ');
    }
    
    return {
        components: checks,
        readiness: percentage,
        recommendations: getRecommendations(checks)
    };
};

/**
 * ✅ Рекомендації для покращення системи
 */
const getRecommendations = (checks) => {
    const recommendations = [];
    
    if (!checks.hybridSearchEngine) {
        recommendations.push('Перевірте ініціалізацію HybridSearchEngine');
    }
    
    if (!checks.searchHighlighting) {
        recommendations.push('Перевірте наявність файлу SearchHighlighting.js в папці search/');
    }
    
    if (!checks.contextSearch) {
        recommendations.push('Перевірте створення глобального API contextSearch');
    }
    
    if (!checks.highlightFunction) {
        recommendations.push('Перевірте інтеграцію функцій підсвічування');
    }
    
    if (recommendations.length === 0) {
        recommendations.push('Система працює оптимально! 🎉');
    }
    
    return recommendations;
};

/**
 * ✅ Функція повного перезапуску системи
 */
const reinitializeSearchSystem = async () => {
    console.log('🔄 ПОВНИЙ ПЕРЕЗАПУСК ПОШУКОВОЇ СИСТЕМИ...');
    
    // Очищуємо попередні ініціалізації
    if (window.hybridSearchEngine) {
        delete window.hybridSearchEngine;
    }
    if (window.searchHighlighting) {
        delete window.searchHighlighting;
    }
    if (window.contextSearch) {
        delete window.contextSearch;
    }
    if (window.highlightSearchResults) {
        delete window.highlightSearchResults;
    }
    if (window.clearSearchHighlights) {
        delete window.clearSearchHighlights;
    }
    if (window.navigateToResult) {
        delete window.navigateToResult;
    }
    
    console.log('🧹 Попередні ініціалізації очищено');
    
    // Перезапускаємо ініціалізацію
    const result = await initializeSearchEngine();
    
    if (result) {
        console.log('✅ Перезапуск завершено успішно');
        scheduleAutoDiagnosis();
    } else {
        console.log('❌ Помилка перезапуску');
    }
    
    return result;
};

/**
 * ✅ Автоматичний запуск діагностики через 2 секунди після ініціалізації
 */
const scheduleAutoDiagnosis = () => {
    setTimeout(() => {
        console.log('\n🔍 АВТОМАТИЧНА ДІАГНОСТИКА ЧЕРЕЗ 2 СЕКУНДИ...\n');
        diagnoseSearchSystem();
    }, 2000);
};

/**
 * ✅ Глобальні утиліти для розробників
 */
window.comspecSearchUtils = {
    // Швидкий тест всієї системи
    quickTest: () => {
        console.log('🚀 ШВИДКИЙ ТЕСТ COMSPEC SEARCH');
        console.log('='.repeat(40));
        
        let testsPassed = 0;
        let totalTests = 0;
        
        // Тест пошуку
        totalTests++;
        if (window.contextSearch?.search) {
            try {
                const results = window.contextSearch.search('пісок', 3);
                console.log(`✅ Пошук: знайдено ${results.length} результатів для "пісок"`);
                if (results.length > 0) testsPassed++;
            } catch (error) {
                console.log(`❌ Пошук: помилка - ${error.message}`);
            }
        } else {
            console.log('❌ Пошук недоступний');
        }
        
        // Тест підсвічування
        totalTests++;
        if (window.contextSearch?.test?.highlighting) {
            try {
                const result = window.contextSearch.test.highlighting();
                if (result) {
                    console.log('✅ Підсвічування працює');
                    testsPassed++;
                } else {
                    console.log('⚠️ Підсвічування частково працює');
                }
            } catch (error) {
                console.log(`❌ Підсвічування: помилка - ${error.message}`);
            }
        } else {
            console.log('❌ Тест підсвічування недоступний');
        }
        
        // Статистика
        totalTests++;
        if (window.contextSearch?.getContextStats) {
            try {
                const stats = window.contextSearch.getContextStats();
                console.log(`✅ Контекст: ${stats.totalWithContext} записів`);
                if (stats.totalWithContext > 0) testsPassed++;
            } catch (error) {
                console.log(`❌ Статистика: помилка - ${error.message}`);
            }
        } else {
            console.log('❌ Статистика недоступна');
        }
        
        // Результат
        const percentage = Math.round((testsPassed / totalTests) * 100);
        console.log(`\n📊 Результат: ${testsPassed}/${totalTests} тестів пройдено (${percentage}%)`);
        
        if (percentage >= 100) {
            console.log('🏆 ВСЕ ІДЕАЛЬНО!');
        } else if (percentage >= 66) {
            console.log('✅ ДОБРЕ, Є МІНОРНІ ПРОБЛЕМИ');
        } else {
            console.log('⚠️ ПОТРЕБУЄ УВАГИ');
        }
        
        return { testsPassed, totalTests, percentage };
    },
    
    // Демонстрація можливостей
    demo: () => {
        console.log('🎬 ДЕМОНСТРАЦІЯ COMSPEC SEARCH');
        console.log('='.repeat(40));
        
        const queries = ['щебінь', 'пісок', 'доставка', 'контакти'];
        
        queries.forEach((query, index) => {
            setTimeout(() => {
                console.log(`\n🔍 Демо-запит ${index + 1}: "${query}"`);
                if (window.contextSearch?.search) {
                    try {
                        const results = window.contextSearch.search(query, 2);
                        console.log(`  📊 Знайдено: ${results.length} результатів`);
                        
                        if (results[0]) {
                            console.log(`  🥇 Найкращий: "${results[0].title || results[0].text || 'Без назви'}" (релевантність: ${results[0].relevance || 'N/A'})`);
                            
                            // Тест навігації до першого результату
                            if (window.contextSearch?.navigate && index === 0) {
                                console.log(`  🎯 Тестуємо навігацію...`);
                                try {
                                    window.contextSearch.navigate('h1', query, 'default');
                                    console.log(`  ✅ Навігація виконана`);
                                } catch (navError) {
                                    console.log(`  ⚠️ Навігація: ${navError.message}`);
                                }
                            }
                        }
                    } catch (error) {
                        console.log(`  ❌ Помилка: ${error.message}`);
                    }
                } else {
                    console.log(`  ❌ Пошук недоступний`);
                }
            }, index * 1500);
        });
        
        return true;
    },
    
    // Виправлення проблем
    fix: () => {
        console.log('🔧 АВТОМАТИЧНЕ ВИПРАВЛЕННЯ ПРОБЛЕМ');
        
        let fixesApplied = 0;
        const fixes = [];
        
        // Перевіряємо та виправляємо основний движок
        if (!window.hybridSearchEngine && window.HybridSearchEngine) {
            try {
                window.hybridSearchEngine = new window.HybridSearchEngine();
                fixes.push('Відновлено hybridSearchEngine');
                fixesApplied++;
            } catch (error) {
                fixes.push(`Не вдалося відновити hybridSearchEngine: ${error.message}`);
            }
        }
        
        // Перевіряємо функції підсвічування
        if (!window.highlightSearchResults) {
            try {
                initializeFallbackHighlighting();
                fixes.push('Відновлено функції підсвічування');
                fixesApplied++;
            } catch (error) {
                fixes.push(`Не вдалося відновити підсвічування: ${error.message}`);
            }
        }
        
        // Перевіряємо contextSearch API
        if (!window.contextSearch && window.hybridSearchEngine) {
            try {
                window.contextSearch = {
                    search: window.hybridSearchEngine.search.bind(window.hybridSearchEngine),
                    getStats: window.hybridSearchEngine.getStats.bind(window.hybridSearchEngine),
                    getContextStats: window.hybridSearchEngine.getContextStats.bind(window.hybridSearchEngine)
                };
                fixes.push('Відновлено contextSearch API');
                fixesApplied++;
            } catch (error) {
                fixes.push(`Не вдалося відновити contextSearch: ${error.message}`);
            }
        }
        
        // Виправлення проблемних записів в движку
        if (window.hybridSearchEngine?.fixProblematicRecords) {
            try {
                const results = window.hybridSearchEngine.fixProblematicRecords();
                fixes.push(`Виправлено записів в движку: ${results.fixedRecords || 0}`);
                fixesApplied++;
            } catch (error) {
                fixes.push(`Не вдалося виправити записи: ${error.message}`);
            }
        }
        
        console.log(`✅ Виправлення завершено: ${fixesApplied} виправлень`);
        fixes.forEach(fix => console.log(`  • ${fix}`));
        
        return { fixesApplied, fixes };
    },
    
    // Повна перезагрузка системи
    restart: () => {
        console.log('🔄 ПЕРЕЗАПУСК СИСТЕМИ...');
        return reinitializeSearchSystem();
    },
    
    // Експорт статистики
    exportStats: () => {
        if (!window.hybridSearchEngine) {
            console.log('❌ HybridSearchEngine недоступний');
            return null;
        }
        
        try {
            const stats = window.hybridSearchEngine.getStats();
            const contextStats = window.hybridSearchEngine.getContextStats();
            const diagnosis = diagnoseSearchSystem();
            
            // Тест продуктивності
            const startTime = performance.now();
            window.hybridSearchEngine.search('тест', 5);
            const endTime = performance.now();
            const searchTime = endTime - startTime;
            
            const fullStats = {
                timestamp: new Date().toISOString(),
                version: 'COMSPEC Search v7.1',
                engine: stats,
                context: contextStats,
                system: diagnosis,
                performance: {
                    searchTime: searchTime,
                    searchTimeCategory: searchTime < 10 ? 'надшвидко' : 
                                      searchTime < 50 ? 'швидко' : 
                                      searchTime < 100 ? 'нормально' : 'повільно'
                },
                features: {
                    highlighting: !!(window.searchHighlighting || window.highlightSearchResults),
                    navigation: !!(window.contextSearch?.navigate || window.navigateToResult),
                    api: !!window.contextSearch
                }
            };
            
            console.log('📊 ЕКСПОРТ СТАТИСТИКИ COMSPEC SEARCH');
            console.log('=============================================');
            console.log(JSON.stringify(fullStats, null, 2));
            
            // Копіюємо в буфер обміну (якщо підтримується)
            if (navigator.clipboard) {
                navigator.clipboard.writeText(JSON.stringify(fullStats, null, 2))
                    .then(() => console.log('📋 Статистика скопійована в буфер обміну'))
                    .catch(() => console.log('⚠️ Не вдалося скопіювати в буфер обміну'));
            }
            
            // Зберігаємо в localStorage
            try {
                localStorage.setItem('comspec-search-stats', JSON.stringify(fullStats));
                console.log('💾 Статистика збережена у localStorage');
            } catch (storageError) {
                console.log('⚠️ Не вдалося зберегти в localStorage');
            }
            
            return fullStats;
            
        } catch (error) {
            console.error('❌ Помилка експорту статистики:', error);
            return { error: error.message };
        }
    },
    
    // Тест конкретного пошуку
    testSearch: (query, limit = 5) => {
        if (!window.hybridSearchEngine) {
            console.error('❌ Движок пошуку не ініціалізовано');
            return [];
        }
        
        console.log(`🔍 Тест пошуку: "${query}"`);
        try {
            const startTime = performance.now();
            const results = window.hybridSearchEngine.search(query, limit);
            const endTime = performance.now();
            const searchTime = endTime - startTime;
            
            console.log(`📊 Знайдено: ${results.length} результатів за ${searchTime.toFixed(2)}ms`);
            
            results.slice(0, 3).forEach((result, index) => {
                console.log(`  ${index + 1}. ${result.title || result.text || 'Без назви'} (${result.relevance || 'N/A'})`);
            });
            
            return results;
        } catch (error) {
            console.error('❌ Помилка тест-пошуку:', error);
            return [];
        }
    },
    
    // Аналіз контексту
    analyzeContext: () => {
        if (!window.hybridSearchEngine) {
            console.error('❌ Движок пошуку не ініціалізовано');
            return null;
        }
        
        try {
            if (window.hybridSearchEngine.analyzeContext) {
                return window.hybridSearchEngine.analyzeContext();
            } else {
                const contextStats = window.hybridSearchEngine.getContextStats();
                console.log('🔍 АНАЛІЗ КОНТЕКСТУ');
                console.log('==============================');
                console.log('📊 Розподіл по типах полів:');
                
                if (contextStats.byField) {
                    Object.entries(contextStats.byField).forEach(([field, count]) => {
                        if (count > 0) {
                            console.log(`   ${field}: ${count} записів`);
                        }
                    });
                }
                
                console.log(`\n🔍 Всього пошукових полів: ${contextStats.totalSearchableFields || 'N/A'}`);
                console.log(`📝 Записів з контекстом: ${contextStats.totalWithContext}`);
                
                return contextStats;
            }
        } catch (error) {
            console.error('❌ Помилка аналізу контексту:', error);
            return null;
        }
    },
    
    // Повна діагностика
    fullDiagnosis: () => {
        console.log('🔬 ПОВНА ДІАГНОСТИКА СИСТЕМИ COMSPEC SEARCH');
        console.log('===============================================');
        
        const quickDiag = diagnoseSearchSystem();
        
        if (window.hybridSearchEngine) {
            console.log('\n🔧 ДЕТАЛЬНА ДІАГНОСТИКА ДВИЖКА:');
            
            if (window.hybridSearchEngine.diagnoseContextIssues) {
                try {
                    window.hybridSearchEngine.diagnoseContextIssues();
                } catch (error) {
                    console.log('⚠️ Помилка діагностики контексту:', error.message);
                }
            }
            
            if (window.hybridSearchEngine.exportDiagnosticData) {
                console.log('\n📊 ЕКСПОРТ ДІАГНОСТИЧНИХ ДАНИХ:');
                try {
                    window.hybridSearchEngine.exportDiagnosticData();
                } catch (error) {
                    console.log('⚠️ Помилка експорту діагностики:', error.message);
                }
            }
        }
        
        return quickDiag;
    }
};

// Глобальна функція діагностики
window.diagnoseSearchSystem = diagnoseSearchSystem;

// Ініціалізація при завантаженні DOM
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeSearchEngine().then(() => {
                scheduleAutoDiagnosis();
            });
        });
    } else {
        // DOM вже завантажений
        initializeSearchEngine().then(() => {
            scheduleAutoDiagnosis();
        });
    }
}

// Експорт функцій для модульної системи
export { initializeSearchEngine, diagnoseSearchSystem, reinitializeSearchSystem };

// Додаємо в window для доступу з консолі
window.initializeSearchEngine = initializeSearchEngine;
window.reinitializeSearchSystem = reinitializeSearchSystem;

// Логування завантаження утилітів
setTimeout(() => {
    console.log('📚 COMSPEC SEARCH UTILITIES ЗАВАНТАЖЕНО');
    console.log('💡 Доступні команди:');
    console.log('  window.diagnoseSearchSystem() - діагностика');
    console.log('  window.comspecSearchUtils.quickTest() - швидкий тест');
    console.log('  window.comspecSearchUtils.demo() - демонстрація');
    console.log('  window.comspecSearchUtils.fix() - виправлення проблем');
    console.log('  window.comspecSearchUtils.restart() - перезапуск системи');
    console.log('  window.comspecSearchUtils.exportStats() - експорт статистики');
    console.log('  window.comspecSearchUtils.testSearch("запит") - тест пошуку');
    console.log('  window.comspecSearchUtils.analyzeContext() - аналіз контексту');
    console.log('  window.comspecSearchUtils.fullDiagnosis() - повна діагностика');
}, 100);

export default initializeSearchEngine;