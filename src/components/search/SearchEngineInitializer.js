// src/components/search/SearchEngineInitializer.js
// 🚀 КОМПЛЕКСНА СИСТЕМА ІНІЦІАЛІЗАЦІЇ COMSPEC SEARCH з SearchHighlighting

import { searchDebug, searchDebugWarn, searchDebugError, searchDebugGroup } from '../../utils/searchDebugUtils.js';

searchDebug('🚀 Ініціалізація глобальної пошукової системи з підсвічуванням...');

/**
 * ✅ Асинхронна ініціалізація пошукової системи з SearchHighlighting
 */
const initializeSearchEngine = async () => {
    try {
        searchDebug('🔧 Початок ініціалізації пошукової системи...');
        
        // 1. Динамічний імпорт або використання існуючого HybridSearchEngine
        let HybridSearchEngine;
        
        try {
            // Спробуємо імпортувати динамічно
            const module = await import('./HybridSearchEngine');
            HybridSearchEngine = module.default;
        } catch (importError) {
            searchDebug('⚠️ Динамічний імпорт не вдався, використовуємо глобальний');
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
            searchDebug('✅ Використовуємо існуючий ініціалізований движок');
        } else if (window.hybridSearchEngine) {
            engine = window.hybridSearchEngine;
            await engine.initialize();
            searchDebug('✅ Ініціалізували існуючий движок');
        } else if (HybridSearchEngine) {
            engine = new HybridSearchEngine();
            await engine.initialize();
            searchDebug('✅ Створили новий движок');
        } else {
            throw new Error('HybridSearchEngine недоступний');
        }
        
        // Додаємо до глобального об'єкта
        window.hybridSearchEngine = engine;
        window.contextSearch = engine.contextSearch ? engine.contextSearch.bind(engine) : engine.search.bind(engine);
        
        // 3. Діагностика контексту з безпечною перевіркою
        searchDebug('🔍 Діагностика контексту...');
        
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
                    
                    searchDebug('🔧 Виявлено проблемні записи, виправляємо...');
                    
                    if (engine.fixProblematicRecords) {
                        const fixResults = engine.fixProblematicRecords();
                        searchDebug('✅ Результати виправлення:', fixResults);
                    }
                } else {
                    searchDebug('✅ Контекст в порядку');
                }
            }
        } catch (diagError) {
            searchDebugWarn('⚠️ Помилка діагностики контексту:', diagError.message);
        }
        
        // 4. ✅ Ініціалізуємо SearchHighlighting
        let searchHighlighting = null;
        try {
            searchDebug('🎨 Завантаження SearchHighlighting...');
            
            let SearchHighlighting;
            try {
                const highlightModule = await import('./SearchHighlighting');
                SearchHighlighting = highlightModule.default;
            } catch (highlightImportError) {
                searchDebug('⚠️ Динамічний імпорт SearchHighlighting не вдався');
                // Використовуємо глобальний, якщо є
                SearchHighlighting = window.SearchHighlighting;
            }
            
            if (SearchHighlighting) {
                searchHighlighting = new SearchHighlighting();
                window.SearchHighlighting = SearchHighlighting;
                window.searchHighlighting = searchHighlighting;
                searchDebug('✅ SearchHighlighting ініціалізовано успішно');
            } else {
                throw new Error('SearchHighlighting не експортовано правильно');
            }
            
        } catch (highlightError) {
            searchDebugWarn('⚠️ SearchHighlighting не вдалося завантажити:', highlightError.message);
            searchDebug('💡 Пошук буде працювати без візуального підсвічування');
            
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
                    searchDebugWarn('Підсвічування недоступне');
                    return false;
                }),
            
            navigate: searchHighlighting
                ? (selector, term, contextType, directElement) => searchHighlighting.scrollToElementWithHighlight
                    ? searchHighlighting.scrollToElementWithHighlight(selector, term, contextType, directElement)
                    : searchHighlighting.navigateToResult({ selector, text: term }, term)
                : window.navigateToResult || ((selector, term) => {
                    searchDebugWarn('Навігація з підсвічуванням недоступна');
                    return false;
                }),
            
            clear: searchHighlighting
                ? () => searchHighlighting.clearHighlights()
                : window.clearSearchHighlights || (() => {
                    searchDebugWarn('Очищення підсвічування недоступне');
                    return false;
                }),
            
            // Діагностичні функції
            diagnose: () => engine.diagnoseContextIssues ? engine.diagnoseContextIssues() : engine.diagnoseSystem(),
            fix: () => engine.fixProblematicRecords ? engine.fixProblematicRecords() : { message: 'Функція недоступна' },
            
            // Тестові функції
            test: {
                basic: () => {
                    searchDebug('🧪 Базове тестування пошуку...');
                    try {
                        const results = engine.search('пісок', 3);
                        searchDebug(`Знайдено ${results.length} результатів для "пісок"`);
                        return results;
                    } catch (error) {
                        searchDebugError('❌ Помилка базового тесту:', error);
                        return [];
                    }
                },
                
                context: () => {
                    searchDebug('🧪 Тестування контекстного пошуку...');
                    try {
                        if (engine.testContextSearch) {
                            engine.testContextSearch();
                        } else {
                            // Власний тест контексту
                            const phoneTest = engine.search('044', 2);
                            const addressTest = engine.search('київ', 2);
                            searchDebug(`Телефон: ${phoneTest.length}, Адреса: ${addressTest.length}`);
                        }
                    } catch (error) {
                        searchDebugError('❌ Помилка контекстного тесту:', error);
                    }
                },
                
                highlighting: () => {
                    if (!searchHighlighting && !window.highlightSearchResults) {
                        searchDebug('❌ Підсвічування недоступне для тестування');
                        return false;
                    }
                    
                    searchDebug('🧪 Тестування підсвічування...');
                    try {
                        const h1 = document.querySelector('h1');
                        if (h1) {
                            if (searchHighlighting && searchHighlighting.highlightTermInElement) {
                                searchHighlighting.highlightTermInElement(h1, 'COMSPEC', 'default');
                            } else if (window.highlightSearchResults) {
                                window.highlightSearchResults('COMSPEC', []);
                            }
                            
                            searchDebug('✅ Тест підсвічування виконано');
                            
                            setTimeout(() => {
                                if (searchHighlighting && searchHighlighting.clearHighlights) {
                                    searchHighlighting.clearHighlights();
                                } else if (window.clearSearchHighlights) {
                                    window.clearSearchHighlights();
                                }
                                searchDebug('🧹 Підсвічування очищено');
                            }, 3000);
                            
                            return true;
                        } else {
                            searchDebug('⚠️ Елемент h1 не знайдено');
                            return false;
                        }
                    } catch (error) {
                        searchDebugError('❌ Помилка тесту підсвічування:', error);
                        return false;
                    }
                },
                
                navigation: () => {
                    if (!searchHighlighting && !window.navigateToResult) {
                        searchDebug('❌ Навігація недоступна для тестування');
                        return false;
                    }
                    
                    searchDebug('🧪 Тестування навігації...');
                    try {
                        if (searchHighlighting && searchHighlighting.scrollToElementWithHighlight) {
                            return searchHighlighting.scrollToElementWithHighlight('h1', 'COMSPEC', 'default');
                        } else if (window.navigateToResult) {
                            return window.navigateToResult({ selector: 'h1', text: 'COMSPEC' });
                        }
                        return false;
                    } catch (error) {
                        searchDebugError('❌ Помилка тесту навігації:', error);
                        return false;
                    }
                },
                
                // ✅ Комплексний тест усієї системи
                comprehensive: () => {
                    searchDebug('🧪 КОМПЛЕКСНИЙ ТЕСТ COMSPEC SEARCH');
                    searchDebug('='.repeat(50));
                    
                    let score = 0;
                    const maxScore = 6;
                    
                    // Тест 1: Базовий пошук
                    searchDebug('\n1️⃣ Тест базового пошуку...');
                    try {
                        const results = engine.search('пісок', 3);
                        if (results.length > 0) {
                            searchDebug(`✅ Знайдено ${results.length} результатів`);
                            score++;
                        } else {
                            searchDebug('❌ Результатів не знайдено');
                        }
                    } catch (error) {
                        searchDebug('❌ Помилка пошуку:', error.message);
                    }
                    
                    // Тест 2: Статистика
                    searchDebug('\n2️⃣ Тест статистики...');
                    try {
                        const stats = engine.getStats();
                        const contextStats = engine.getContextStats();
                        searchDebug(`✅ Записів: ${stats.totalRecords}, З контекстом: ${contextStats.totalWithContext}`);
                        if (stats.totalRecords > 0) score++;
                    } catch (error) {
                        searchDebug('❌ Помилка статистики:', error.message);
                    }
                    
                    // Тест 3: Контекстний пошук
                    searchDebug('\n3️⃣ Тест контекстного пошуку...');
                    try {
                        const phoneResults = engine.search('044', 2);
                        const addressResults = engine.search('київ', 2);
                        if (phoneResults.length > 0 || addressResults.length > 0) {
                            searchDebug(`✅ Контекстний пошук працює`);
                            score++;
                        } else {
                            searchDebug('⚠️ Контекстні результати не знайдено');
                        }
                    } catch (error) {
                        searchDebug('❌ Помилка контекстного пошуку:', error.message);
                    }
                    
                    // Тест 4: Підсвічування
                    searchDebug('\n4️⃣ Тест підсвічування...');
                    if (searchHighlighting || window.highlightSearchResults) {
                        try {
                            const h1 = document.querySelector('h1');
                            if (h1) {
                                if (searchHighlighting && searchHighlighting.highlightTermInElement) {
                                    searchHighlighting.highlightTermInElement(h1, 'тест', 'default');
                                } else if (window.highlightSearchResults) {
                                    window.highlightSearchResults('тест', []);
                                }
                                searchDebug('✅ Підсвічування працює');
                                score++;
                                
                                setTimeout(() => {
                                    if (searchHighlighting && searchHighlighting.clearHighlights) {
                                        searchHighlighting.clearHighlights();
                                    } else if (window.clearSearchHighlights) {
                                        window.clearSearchHighlights();
                                    }
                                }, 2000);
                            } else {
                                searchDebug('⚠️ Елемент для підсвічування не знайдено');
                            }
                        } catch (error) {
                            searchDebug('❌ Помилка підсвічування:', error.message);
                        }
                    } else {
                        searchDebug('❌ Підсвічування недоступне');
                    }
                    
                    // Тест 5: Навігація
                    searchDebug('\n5️⃣ Тест навігації...');
                    if (searchHighlighting || window.navigateToResult) {
                        try {
                            let result = false;
                            if (searchHighlighting && searchHighlighting.scrollToElementWithHighlight) {
                                result = searchHighlighting.scrollToElementWithHighlight('body', 'тест', 'default');
                            } else if (window.navigateToResult) {
                                result = window.navigateToResult({ selector: 'body', text: 'тест' });
                            }
                            
                            if (result) {
                                searchDebug('✅ Навігація працює');
                                score++;
                            } else {
                                searchDebug('⚠️ Навігація не знайшла елемент');
                            }
                        } catch (error) {
                            searchDebug('❌ Помилка навігації:', error.message);
                        }
                    } else {
                        searchDebug('❌ Навігація недоступна');
                    }
                    
                    // Тест 6: Продуктивність
                    searchDebug('\n6️⃣ Тест продуктивності...');
                    try {
                        const startTime = performance.now();
                        engine.search('будівництво', 5);
                        const endTime = performance.now();
                        const searchTime = endTime - startTime;
                        
                        if (searchTime < 100) {
                            searchDebug(`✅ Швидкість пошуку: ${searchTime.toFixed(2)}ms`);
                            score++;
                        } else {
                            searchDebug(`⚠️ Повільний пошук: ${searchTime.toFixed(2)}ms`);
                        }
                    } catch (error) {
                        searchDebug('❌ Помилка тесту продуктивності:', error.message);
                    }
                    
                    // Результати тестування
                    searchDebug('\n📊 РЕЗУЛЬТАТИ ТЕСТУВАННЯ:');
                    searchDebug(`🎯 Оцінка: ${score}/${maxScore} (${Math.round((score/maxScore)*100)}%)`);
                    
                    if (score === maxScore) {
                        searchDebug('🏆 ІДЕАЛЬНИЙ РЕЗУЛЬТАТ! Система працює бездоганно');
                    } else if (score >= maxScore * 0.8) {
                        searchDebug('🥇 ВІДМІННИЙ РЕЗУЛЬТАТ! Система працює чудово');
                    } else if (score >= maxScore * 0.6) {
                        searchDebug('🥈 ДОБРИЙ РЕЗУЛЬТАТ! Система працює з мінорними проблемами');
                    } else {
                        searchDebug('🥉 ПОТРЕБУЄ ПОКРАЩЕННЯ! Є проблеми, які потрібно виправити');
                    }
                    
                    return { score, maxScore, percentage: Math.round((score/maxScore)*100) };
                }
            }
        };
        
        // 6. Отримуємо фінальну статистику
        const stats = engine.getStats();
        const contextStats = engine.getContextStats();
        
        searchDebug('✅ Пошукова система ініціалізована:', {
            totalRecords: stats.totalRecords,
            staticIndex: stats.staticIndex,
            dynamicIndex: stats.dynamicIndex,
            contextCoverage: `${contextStats.totalWithContext}/${stats.totalRecords}`,
            highlightingAvailable: !!(searchHighlighting || window.highlightSearchResults)
        });
        
        // 7. Тестовий пошук для перевірки
        const testResults = engine.search('щебінь', 3);
        searchDebug(`🧪 Тестовий пошук: знайдено ${testResults.length} результатів`);
        
        // 8. ✅ Повідомлення про готовність системи
        searchDebug('🎉 COMSPEC SEARCH СИСТЕМА ГОТОВА!');
        searchDebug('📋 Доступні команди в консолі:');
        searchDebug('  window.contextSearch.search("термін") - пошук');
        searchDebug('  window.contextSearch.highlight(element, "термін") - підсвічування');
        searchDebug('  window.contextSearch.navigate("селектор", "термін") - навігація');
        searchDebug('  window.contextSearch.test.basic() - тест пошуку');
        searchDebug('  window.contextSearch.test.highlighting() - тест підсвічування');
        searchDebug('  window.contextSearch.test.comprehensive() - повний тест');
        searchDebug('  window.contextSearch.getContextStats() - статистика контексту');
        
        return {
            engine: engine,
            highlighting: searchHighlighting,
            api: window.contextSearch
        };
        
    } catch (error) {
        searchDebugError('❌ Критична помилка ініціалізації пошукової системи:', error);
        
        // Створюємо мінімальний fallback API
        window.contextSearch = {
            search: () => { searchDebugError('Пошук недоступний:', error.message); return []; },
            highlight: () => searchDebugError('Підсвічування недоступне:', error.message),
            navigate: () => searchDebugError('Навігація недоступна:', error.message),
            clear: () => searchDebugError('Очищення недоступне:', error.message),
            getStats: () => ({ error: error.message }),
            test: {
                basic: () => searchDebugError('Тестування недоступне:', error.message),
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
            searchDebug(`🎨 Fallback підсвічування для "${query}"`);
            
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
            
            searchDebug(`✅ Fallback підсвічено входження для "${query}"`);
            return true;
        };
        
        // Функція очищення підсвічування
        window.clearSearchHighlights = function(container = document.body) {
            clearHighlights(container, 'comspec-search-highlight');
            searchDebug('🧹 Fallback підсвічування очищено');
        };
        
        // Функція навігації по результатах
        window.navigateToResult = function(resultData) {
            if (!resultData) {
                searchDebugWarn('⚠️ Немає даних для навігації');
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
                    
                    searchDebug('📍 Fallback навігація виконана');
                    return true;
                }
            } catch (error) {
                searchDebugError('❌ Помилка fallback навігації:', error);
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
        
        searchDebug('✅ Fallback функції підсвічування ініціалізовано');
        
    } catch (error) {
        searchDebugError('❌ Помилка ініціалізації fallback підсвічування:', error);
    }
}

/**
 * ✅ Функція швидкої діагностики системи
 */
const diagnoseSearchSystem = () => {
    searchDebug('🔬 ШВИДКА ДІАГНОСТИКА COMSPEC SEARCH');
    searchDebug('='.repeat(50));
    
    // Перевіряємо доступність компонентів
    const checks = {
        hybridSearchEngine: !!window.hybridSearchEngine,
        contextSearch: !!window.contextSearch,
        searchHighlighting: !!(window.searchHighlighting || window.SearchHighlighting),
        highlightFunction: !!(window.contextSearch?.highlight || window.highlightSearchResults),
        navigateFunction: !!(window.contextSearch?.navigate || window.navigateToResult),
        clearFunction: !!(window.contextSearch?.clear || window.clearSearchHighlights)
    };
    
    searchDebug('📊 ДОСТУПНІСТЬ КОМПОНЕНТІВ:');
    Object.entries(checks).forEach(([component, available]) => {
        searchDebug(`  ${available ? '✅' : '❌'} ${component}`);
    });
    
    // Статистика движка
    if (window.hybridSearchEngine) {
        try {
            const stats = window.hybridSearchEngine.getStats();
            const contextStats = window.hybridSearchEngine.getContextStats();
            
            searchDebug('\n📈 СТАТИСТИКА ДВИЖКА:');
            searchDebug(`  📝 Всього записів: ${stats.totalRecords}`);
            searchDebug(`  🔍 Статичних: ${stats.staticIndex}`);
            searchDebug(`  🔄 Динамічних: ${stats.dynamicIndex}`);
            searchDebug(`  🎯 З контекстом: ${contextStats.totalWithContext}/${stats.totalRecords} (${Math.round((contextStats.totalWithContext / stats.totalRecords) * 100)}%)`);
            
            const coverage = Math.round((contextStats.totalWithContext / stats.totalRecords) * 100);
            if (coverage >= 100) {
                searchDebug('  🏆 ІДЕАЛЬНЕ ПОКРИТТЯ КОНТЕКСТОМ!');
            } else if (coverage >= 95) {
                searchDebug('  🥇 ВІДМІННЕ ПОКРИТТЯ КОНТЕКСТОМ');
            } else if (coverage >= 90) {
                searchDebug('  🥈 ДОБРЕ ПОКРИТТЯ КОНТЕКСТОМ');
            } else {
                searchDebug('  ⚠️ ПОТРЕБУЄ ПОКРАЩЕННЯ КОНТЕКСТУ');
            }
            
        } catch (error) {
            searchDebug('  ❌ Помилка отримання статистики:', error.message);
        }
    }
    
    // Тест продуктивності
    if (window.hybridSearchEngine) {
        searchDebug('\n⚡ ТЕСТ ПРОДУКТИВНОСТІ:');
        try {
            const startTime = performance.now();
            const results = window.hybridSearchEngine.search('пісок', 5);
            const endTime = performance.now();
            const searchTime = endTime - startTime;
            
            searchDebug(`  📊 Результатів: ${results.length}`);
            searchDebug(`  ⏱️ Час пошуку: ${searchTime.toFixed(2)}ms`);
            
            if (searchTime < 10) {
                searchDebug('  🚀 НАДШВИДКО!');
            } else if (searchTime < 50) {
                searchDebug('  ⚡ ШВИДКО');
            } else if (searchTime < 100) {
                searchDebug('  ✅ НОРМАЛЬНО');
            } else {
                searchDebug('  ⚠️ ПОВІЛЬНО');
            }
        } catch (error) {
            searchDebug('  ❌ Помилка тесту продуктивності:', error.message);
        }
    }
    
    searchDebug('\n🎯 ГОТОВНІСТЬ СИСТЕМИ:');
    const readiness = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;
    const percentage = Math.round((readiness / total) * 100);
    
    searchDebug(`  📊 ${readiness}/${total} компонентів готово (${percentage}%)`);
    
    if (percentage >= 100) {
        searchDebug('  🚀 СИСТЕМА ПОВНІСТЮ ГОТОВА!');
    } else if (percentage >= 80) {
        searchDebug('  ✅ СИСТЕМА ГОТОВА З МІНОРНИМИ ОБМЕЖЕННЯМИ');
    } else if (percentage >= 60) {
        searchDebug('  ⚠️ СИСТЕМА ЧАСТКОВО ГОТОВА');
    } else {
        searchDebug('  ❌ СИСТЕМА ПОТРЕБУЄ НАЛАГОДЖЕННЯ');
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
    searchDebug('🔄 ПОВНИЙ ПЕРЕЗАПУСК ПОШУКОВОЇ СИСТЕМИ...');
    
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
    
    searchDebug('🧹 Попередні ініціалізації очищено');
    
    // Перезапускаємо ініціалізацію
    const result = await initializeSearchEngine();
    
    if (result) {
        searchDebug('✅ Перезапуск завершено успішно');
        scheduleAutoDiagnosis();
    } else {
        searchDebug('❌ Помилка перезапуску');
    }
    
    return result;
};

/**
 * ✅ Автоматичний запуск діагностики через 2 секунди після ініціалізації
 */
const scheduleAutoDiagnosis = () => {
    setTimeout(() => {
        searchDebug('\n🔍 АВТОМАТИЧНА ДІАГНОСТИКА ЧЕРЕЗ 2 СЕКУНДИ...\n');
        diagnoseSearchSystem();
    }, 2000);
};

/**
 * ✅ Глобальні утиліти для розробників
 */
window.comspecSearchUtils = {
    // Швидкий тест всієї системи
    quickTest: () => {
        searchDebug('🚀 ШВИДКИЙ ТЕСТ COMSPEC SEARCH');
        searchDebug('='.repeat(40));
        
        let testsPassed = 0;
        let totalTests = 0;
        
        // Тест пошуку
        totalTests++;
        if (window.contextSearch?.search) {
            try {
                const results = window.contextSearch.search('пісок', 3);
                searchDebug(`✅ Пошук: знайдено ${results.length} результатів для "пісок"`);
                if (results.length > 0) testsPassed++;
            } catch (error) {
                searchDebug(`❌ Пошук: помилка - ${error.message}`);
            }
        } else {
            searchDebug('❌ Пошук недоступний');
        }
        
        // Тест підсвічування
        totalTests++;
        if (window.contextSearch?.test?.highlighting) {
            try {
                const result = window.contextSearch.test.highlighting();
                if (result) {
                    searchDebug('✅ Підсвічування працює');
                    testsPassed++;
                } else {
                    searchDebug('⚠️ Підсвічування частково працює');
                }
            } catch (error) {
                searchDebug(`❌ Підсвічування: помилка - ${error.message}`);
            }
        } else {
            searchDebug('❌ Тест підсвічування недоступний');
        }
        
        // Статистика
        totalTests++;
        if (window.contextSearch?.getContextStats) {
            try {
                const stats = window.contextSearch.getContextStats();
                searchDebug(`✅ Контекст: ${stats.totalWithContext} записів`);
                if (stats.totalWithContext > 0) testsPassed++;
            } catch (error) {
                searchDebug(`❌ Статистика: помилка - ${error.message}`);
            }
        } else {
            searchDebug('❌ Статистика недоступна');
        }
        
        // Результат
        const percentage = Math.round((testsPassed / totalTests) * 100);
        searchDebug(`\n📊 Результат: ${testsPassed}/${totalTests} тестів пройдено (${percentage}%)`);
        
        if (percentage >= 100) {
            searchDebug('🏆 ВСЕ ІДЕАЛЬНО!');
        } else if (percentage >= 66) {
            searchDebug('✅ ДОБРЕ, Є МІНОРНІ ПРОБЛЕМИ');
        } else {
            searchDebug('⚠️ ПОТРЕБУЄ УВАГИ');
        }
        
        return { testsPassed, totalTests, percentage };
    },
    
    // Демонстрація можливостей
    demo: () => {
        searchDebug('🎬 ДЕМОНСТРАЦІЯ COMSPEC SEARCH');
        searchDebug('='.repeat(40));
        
        const queries = ['щебінь', 'пісок', 'доставка', 'контакти'];
        
        queries.forEach((query, index) => {
            setTimeout(() => {
                searchDebug(`\n🔍 Демо-запит ${index + 1}: "${query}"`);
                if (window.contextSearch?.search) {
                    try {
                        const results = window.contextSearch.search(query, 2);
                        searchDebug(`  📊 Знайдено: ${results.length} результатів`);
                        
                        if (results[0]) {
                            searchDebug(`  🥇 Найкращий: "${results[0].title || results[0].text || 'Без назви'}" (релевантність: ${results[0].relevance || 'N/A'})`);
                            
                            // Тест навігації до першого результату
                            if (window.contextSearch?.navigate && index === 0) {
                                searchDebug(`  🎯 Тестуємо навігацію...`);
                                try {
                                    window.contextSearch.navigate('h1', query, 'default');
                                    searchDebug(`  ✅ Навігація виконана`);
                                } catch (navError) {
                                    searchDebug(`  ⚠️ Навігація: ${navError.message}`);
                                }
                            }
                        }
                    } catch (error) {
                        searchDebug(`  ❌ Помилка: ${error.message}`);
                    }
                } else {
                    searchDebug(`  ❌ Пошук недоступний`);
                }
            }, index * 1500);
        });
        
        return true;
    },
    
    // Виправлення проблем
    fix: () => {
        searchDebug('🔧 АВТОМАТИЧНЕ ВИПРАВЛЕННЯ ПРОБЛЕМ');
        
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
        
        searchDebug(`✅ Виправлення завершено: ${fixesApplied} виправлень`);
        fixes.forEach(fix => searchDebug(`  • ${fix}`));
        
        return { fixesApplied, fixes };
    },
    
    // Повна перезагрузка системи
    restart: () => {
        searchDebug('🔄 ПЕРЕЗАПУСК СИСТЕМИ...');
        return reinitializeSearchSystem();
    },
    
    // Експорт статистики
    exportStats: () => {
        if (!window.hybridSearchEngine) {
            searchDebug('❌ HybridSearchEngine недоступний');
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
            
            searchDebug('📊 ЕКСПОРТ СТАТИСТИКИ COMSPEC SEARCH');
            searchDebug('=============================================');
            searchDebug(JSON.stringify(fullStats, null, 2));
            
            // Копіюємо в буфер обміну (якщо підтримується)
            if (navigator.clipboard) {
                navigator.clipboard.writeText(JSON.stringify(fullStats, null, 2))
                    .then(() => searchDebug('📋 Статистика скопійована в буфер обміну'))
                    .catch(() => searchDebug('⚠️ Не вдалося скопіювати в буфер обміну'));
            }
            
            // Зберігаємо в localStorage
            try {
                localStorage.setItem('comspec-search-stats', JSON.stringify(fullStats));
                searchDebug('💾 Статистика збережена у localStorage');
            } catch (storageError) {
                searchDebug('⚠️ Не вдалося зберегти в localStorage');
            }
            
            return fullStats;
            
        } catch (error) {
            searchDebugError('❌ Помилка експорту статистики:', error);
            return { error: error.message };
        }
    },
    
    // Тест конкретного пошуку
    testSearch: (query, limit = 5) => {
        if (!window.hybridSearchEngine) {
            searchDebugError('❌ Движок пошуку не ініціалізовано');
            return [];
        }
        
        searchDebug(`🔍 Тест пошуку: "${query}"`);
        try {
            const startTime = performance.now();
            const results = window.hybridSearchEngine.search(query, limit);
            const endTime = performance.now();
            const searchTime = endTime - startTime;
            
            searchDebug(`📊 Знайдено: ${results.length} результатів за ${searchTime.toFixed(2)}ms`);
            
            results.slice(0, 3).forEach((result, index) => {
                searchDebug(`  ${index + 1}. ${result.title || result.text || 'Без назви'} (${result.relevance || 'N/A'})`);
            });
            
            return results;
        } catch (error) {
            searchDebugError('❌ Помилка тест-пошуку:', error);
            return [];
        }
    },
    
    // Аналіз контексту
    analyzeContext: () => {
        if (!window.hybridSearchEngine) {
            searchDebugError('❌ Движок пошуку не ініціалізовано');
            return null;
        }
        
        try {
            if (window.hybridSearchEngine.analyzeContext) {
                return window.hybridSearchEngine.analyzeContext();
            } else {
                const contextStats = window.hybridSearchEngine.getContextStats();
                searchDebug('🔍 АНАЛІЗ КОНТЕКСТУ');
                searchDebug('==============================');
                searchDebug('📊 Розподіл по типах полів:');
                
                if (contextStats.byField) {
                    Object.entries(contextStats.byField).forEach(([field, count]) => {
                        if (count > 0) {
                            searchDebug(`   ${field}: ${count} записів`);
                        }
                    });
                }
                
                searchDebug(`\n🔍 Всього пошукових полів: ${contextStats.totalSearchableFields || 'N/A'}`);
                searchDebug(`📝 Записів з контекстом: ${contextStats.totalWithContext}`);
                
                return contextStats;
            }
        } catch (error) {
            searchDebugError('❌ Помилка аналізу контексту:', error);
            return null;
        }
    },
    
    // Повна діагностика
    fullDiagnosis: () => {
        searchDebug('🔬 ПОВНА ДІАГНОСТИКА СИСТЕМИ COMSPEC SEARCH');
        searchDebug('===============================================');
        
        const quickDiag = diagnoseSearchSystem();
        
        if (window.hybridSearchEngine) {
            searchDebug('\n🔧 ДЕТАЛЬНА ДІАГНОСТИКА ДВИЖКА:');
            
            if (window.hybridSearchEngine.diagnoseContextIssues) {
                try {
                    window.hybridSearchEngine.diagnoseContextIssues();
                } catch (error) {
                    searchDebug('⚠️ Помилка діагностики контексту:', error.message);
                }
            }
            
            if (window.hybridSearchEngine.exportDiagnosticData) {
                searchDebug('\n📊 ЕКСПОРТ ДІАГНОСТИЧНИХ ДАНИХ:');
                try {
                    window.hybridSearchEngine.exportDiagnosticData();
                } catch (error) {
                    searchDebug('⚠️ Помилка експорту діагностики:', error.message);
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
    searchDebug('📚 COMSPEC SEARCH UTILITIES ЗАВАНТАЖЕНО');
    searchDebug('💡 Доступні команди:');
    searchDebug('  window.diagnoseSearchSystem() - діагностика');
    searchDebug('  window.comspecSearchUtils.quickTest() - швидкий тест');
    searchDebug('  window.comspecSearchUtils.demo() - демонстрація');
    searchDebug('  window.comspecSearchUtils.fix() - виправлення проблем');
    searchDebug('  window.comspecSearchUtils.restart() - перезапуск системи');
    searchDebug('  window.comspecSearchUtils.exportStats() - експорт статистики');
    searchDebug('  window.comspecSearchUtils.testSearch("запит") - тест пошуку');
    searchDebug('  window.comspecSearchUtils.analyzeContext() - аналіз контексту');
    searchDebug('  window.comspecSearchUtils.fullDiagnosis() - повна діагностика');
}, 100);

export default initializeSearchEngine;