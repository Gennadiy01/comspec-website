// src/components/search/SearchHighlighting.js
// Гібридна версія: найкраще з обох варіантів
// Версія: 2.0.0

class SearchHighlighting {
    constructor() {
        this.highlightClass = 'comspec-search-highlight';
        this.currentHighlights = [];
        this.isInitialized = false;
        
        this.init();
    }
    
    /**
     * Ініціалізація системи підсвічування
     */
    init() {
        try {
            this.initializeStyles();
            this.setupGlobalFunctions();
            this.setupKeyboardShortcuts();
            this.isInitialized = true;
            // console.log('🎨 SearchHighlighting ініціалізовано');
        } catch (error) {
            console.error('❌ Помилка ініціалізації SearchHighlighting:', error);
        }
    }
    
    /**
     * Ініціалізація стилів підсвічування (з вашого файлу + покращення)
     */
    initializeStyles() {
        const styleId = 'comspec-search-highlighting-styles';
        
        // Перевіряємо чи стилі вже додані
        if (document.getElementById(styleId)) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .${this.highlightClass} {
                background: #ffeb3b !important;
                padding: 2px 4px !important;
                border-radius: 3px !important;
                font-weight: 600 !important;
                animation: comspec-pulse 1s ease-in-out !important;
                box-shadow: 0 0 0 2px rgba(255, 235, 59, 0.3) !important;
                color: #000 !important;
                transition: all 0.3s ease !important;
            }
            
            .${this.highlightClass}:hover {
                background: #ffcc00 !important;
                transform: scale(1.05) !important;
            }
            
            .${this.highlightClass}.phone {
                background: #03a9f4 !important;
                color: white !important;
                box-shadow: 0 0 0 2px rgba(3, 169, 244, 0.3) !important;
            }
            
            .${this.highlightClass}.address {
                background: #ff9800 !important;
                color: white !important;
                box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.3) !important;
            }
            
            .${this.highlightClass}.email {
                background: #2196f3 !important;
                color: white !important;
                box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.3) !important;
            }
            
            .comspec-search-focus {
                outline: 3px solid #008080 !important;
                outline-offset: 5px !important;
                border-radius: 5px !important;
                transition: all 0.3s ease !important;
            }
            
            .comspec-search-counter {
                position: fixed !important;
                top: 10px !important;
                right: 10px !important;
                background: #008080 !important;
                color: white !important;
                padding: 8px 16px !important;
                border-radius: 20px !important;
                font-size: 14px !important;
                font-weight: bold !important;
                z-index: 10000 !important;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
                animation: slideInRight 0.3s ease !important;
            }
            
            @keyframes comspec-pulse {
                0%, 100% { 
                    background: #ffeb3b !important; 
                    transform: scale(1);
                }
                50% { 
                    background: #ff9800 !important; 
                    transform: scale(1.05);
                }
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        // console.log('🎨 Стилі підсвічування завантажено');
    }

    /**
     * Точне підсвічування термінів в елементі (з вашого файлу + покращення)
     */
    highlightTermInElement(element, term, contextType = null) {
        if (!element || !term) {
            console.warn('⚠️ Відсутній елемент або термін для підсвічування');
            return false;
        }
        
        // console.log(`🎨 Підсвічування терміну "${term}" в елементі:`, element.tagName, element.className);
        
        // Перевіряємо, чи елемент містить термін
        if (!element.textContent.toLowerCase().includes(term.toLowerCase())) {
            // console.log(`⚠️ Елемент не містить термін "${term}"`);
            return false;
        }
        
        const highlighted = this.highlightInTextNodes(element, term, contextType);
        
        if (highlighted) {
            // Додаємо до масиву поточних підсвічувань
            const highlights = element.querySelectorAll(`.${this.highlightClass}`);
            this.currentHighlights.push(...Array.from(highlights));
        }
        
        return highlighted;
    }

    /**
     * Рекурсивна функція для обробки текстових вузлів (покращена версія)
     */
    highlightInTextNodes(node, searchTerm, contextType = null) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            
            if (regex.test(text)) {
                const contextClass = contextType ? ` ${contextType}` : '';
                const highlightedHTML = text.replace(regex, 
                    `<span class="${this.highlightClass}${contextClass}" data-search-highlight="true">$1</span>`
                );
                
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = highlightedHTML;
                
                // Замінюємо текстовий вузол на підсвічені елементи
                const parent = node.parentNode;
                if (parent) {
                    while (tempDiv.firstChild) {
                        parent.insertBefore(tempDiv.firstChild, node);
                    }
                    parent.removeChild(node);
                }
                return true;
            }
        } else if (node.nodeType === Node.ELEMENT_NODE && 
                   !node.classList.contains(this.highlightClass)) {
            // Рекурсивно обробляємо дочірні елементи
            let highlighted = false;
            const children = Array.from(node.childNodes);
            children.forEach(child => {
                if (this.highlightInTextNodes(child, searchTerm, contextType)) {
                    highlighted = true;
                }
            });
            return highlighted;
        }
        return false;
    }

    /**
     * Навігація до елемента з підсвічуванням (покращена версія з точним збігом)
     */
    scrollToElementWithHighlight(selector, term, context = null, directElement = null, exactTitle = null) {
        // console.log(`🎯 scrollToElementWithHighlight викликано:`, {selector, term, context, exactTitle});
        
        // Очищаємо попереднє підсвічування
        this.clearHighlights();
        
        let targetElement = directElement;
        if (!targetElement) {
            targetElement = this.findElement(selector, term, exactTitle);
        }
        
        if (!targetElement) {
            // console.log(`❌ Елемент не знайдено для селектора: ${selector}, term: ${term}, exactTitle: ${exactTitle}`);
            return false;
        }

        // Застосовуємо підсвічування
        const highlighted = this.applyHighlighting(targetElement, term, context);
        
        // Прокручуємо до елемента
        this.scrollToElement(targetElement);
        
        // Показуємо лічильник
        if (highlighted && this.currentHighlights.length > 0) {
            this.showHighlightCounter(this.currentHighlights.length, term);
        }
        
        // console.log(`✅ Навігація завершена. Підсвічування: ${highlighted ? 'застосовано' : 'не застосовано'}`);
        
        return {
            element: targetElement,
            highlighted: highlighted,
            selector: selector,
            term: term,
            highlightCount: this.currentHighlights.length
        };
    }

    /**
     * Пошук елемента з покращеним алгоритмом точного збігу
     */
    findElement(selector, term, exactTitle = null) {
        const searchMethods = [
            // Ваші оригінальні методи
            () => document.querySelector(selector),
            () => document.getElementById(selector.replace('#', '')),
            () => document.querySelector(`[data-section="${selector.replace('#', '')}"]`),
            () => document.querySelector(`[id*="${selector.replace('#', '')}"]`),
            
            // Покращені методи з точним збігом
            () => document.querySelector(`[class*="${selector.replace('.', '')}"]`),
            
            // Новий підхід: спочатку шукаємо точний збіг заголовку
            () => {
                if (exactTitle) {
                    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
                    return headings.find(el => 
                        el.textContent.trim().toLowerCase() === exactTitle.toLowerCase()
                    );
                }
                return null;
            },
            
            () => {
                if (exactTitle) {
                    const elements = Array.from(document.querySelectorAll('p, div, span, article, section, .product-card h3, .card-title'));
                    return elements.find(el => 
                        el.textContent.trim().toLowerCase() === exactTitle.toLowerCase()
                    );
                }
                return null;
            },
            
            // Пошук з високою подібністю (якщо точний збіг не знайдено)
            () => {
                const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
                return this.findBestMatchingElement(headings, term, exactTitle);
            },
            
            () => {
                const elements = Array.from(document.querySelectorAll('p, div, span, article, section, .product-card, .card'));
                return this.findBestMatchingElement(elements, term, exactTitle);
            },
            
            // Пошук по атрибутах (залишаємо як fallback)
            () => {
                const elements = Array.from(document.querySelectorAll('[title], [alt], [aria-label]'));
                return elements.find(el => {
                    const searchText = (el.title || el.alt || el.getAttribute('aria-label') || '').toLowerCase();
                    return searchText.includes(term.toLowerCase());
                });
            }
        ];
        
        for (let i = 0; i < searchMethods.length; i++) {
            try {
                const element = searchMethods[i]();
                if (element) {
                    // console.log(`✅ Елемент знайдено методом ${i + 1}:`, element.tagName, element.className || element.id);
                    // console.log(`📍 Текст елемента: "${element.textContent.trim()}"`);
                    return element;
                }
            } catch (error) {
                // console.log(`❌ Метод ${i + 1} не спрацював:`, error.message);
            }
        }
        
        return null;
    }

    /**
     * Знаходження найкращого збігу серед елементів
     */
    findBestMatchingElement(elements, term, exactTitle) {
        if (!elements.length) return null;
        
        const candidates = elements.filter(el => {
            const text = el.textContent.toLowerCase();
            return text.includes(term.toLowerCase());
        });
        
        if (!candidates.length) return null;
        
        // Якщо маємо точний заголовок, знаходимо найкращий збіг
        if (exactTitle) {
            const exactMatch = candidates.find(el => 
                el.textContent.trim().toLowerCase() === exactTitle.toLowerCase()
            );
            if (exactMatch) return exactMatch;
            
            // Шукаємо найкращий частковий збіг
            return candidates.reduce((best, current) => {
                const bestSimilarity = this.calculateTextSimilarity(best.textContent, exactTitle);
                const currentSimilarity = this.calculateTextSimilarity(current.textContent, exactTitle);
                return currentSimilarity > bestSimilarity ? current : best;
            });
        }
        
        // Якщо немає точного заголовку, повертаємо перший збіг
        return candidates[0];
    }

    /**
     * Розрахунок подібності тексту (простий алгоритм)
     */
    calculateTextSimilarity(text1, text2) {
        const t1 = text1.toLowerCase().trim();
        const t2 = text2.toLowerCase().trim();
        
        if (t1 === t2) return 1;
        
        const words1 = t1.split(/\s+/);
        const words2 = t2.split(/\s+/);
        
        const commonWords = words1.filter(word => words2.includes(word));
        const totalWords = Math.max(words1.length, words2.length);
        
        return commonWords.length / totalWords;
    }

    /**
     * Застосування підсвічування до елемента (покращена версія)
     */
    applyHighlighting(targetElement, term, context) {
        let highlightApplied = false;

        // Визначаємо тип контексту
        const contextType = this.determineContextType(context, term);

        // Підсвічуємо основний елемент
        if (this.highlightTermInElement(targetElement, term, contextType)) {
            highlightApplied = true;
            // console.log(`✅ Підсвічено в основному елементі`);
        }
        
        // Підсвічуємо дочірні елементи
        const elementsToHighlight = targetElement.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a, li, td, th');
        let childHighlights = 0;
        
        elementsToHighlight.forEach(el => {
            if (el.textContent.toLowerCase().includes(term.toLowerCase())) {
                if (this.highlightTermInElement(el, term, contextType)) {
                    highlightApplied = true;
                    childHighlights++;
                }
            }
        });
        
        if (childHighlights > 0) {
            // console.log(`✅ Підсвічено в ${childHighlights} дочірніх елементах`);
        }
        
        return highlightApplied;
    }

    /**
     * Визначення типу контексту
     */
    determineContextType(context, term) {
        // Якщо контекст передано як рядок
        if (typeof context === 'string') {
            return context;
        }
        
        // Якщо контекст - об'єкт
        if (context && typeof context === 'object') {
            if (context.field === 'phone' || context.fieldLabel === 'Телефон') return 'phone';
            if (context.field === 'address' || context.fieldLabel === 'Адреса') return 'address';
            if (context.field === 'email' || context.fieldLabel === 'Email') return 'email';
        }
        
        // Автоматичне визначення по терміну
        if (/(\+?3?8?[\s-]?\(?0\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2})|(\d{3}[\s-]?\d{2}[\s-]?\d{2})/.test(term)) {
            return 'phone';
        }
        
        if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(term)) {
            return 'email';
        }
        
        if (term.toLowerCase().includes('київ') || term.toLowerCase().includes('україн') ||
            term.toLowerCase().includes('область') || term.toLowerCase().includes('вул.')) {
            return 'address';
        }
        
        return null;
    }

    /**
     * Прокручування до елемента (з вашого файлу)
     */
    scrollToElement(element) {
        const scrollOptions = {
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        };
        
        element.scrollIntoView(scrollOptions);
        
        // Додаємо анімацію фокуса
        element.classList.add('comspec-search-focus');
        
        setTimeout(() => {
            element.classList.remove('comspec-search-focus');
        }, 3000);
    }

    /**
     * Очищення всіх підсвічувань (з вашого файлу + покращення)
     */
    clearHighlights() {
        const highlights = document.querySelectorAll(`.${this.highlightClass}`);
        // console.log(`🧹 Очищення ${highlights.length} підсвічувань`);
        
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            if (parent) {
                const textContent = highlight.textContent;
                const textNode = document.createTextNode(textContent);
                parent.replaceChild(textNode, highlight);
                parent.normalize();
            }
        });
        
        // Очищаємо масив поточних підсвічувань
        this.currentHighlights = [];
        
        // Видаляємо лічильник
        this.hideHighlightCounter();
        
        return highlights.length;
    }

    /**
     * Показати лічильник підсвічування (відключено для чистого UI)
     */
    showHighlightCounter(count, query) {
        // Лічильник відключено для чистого інтерфейсу
        return;
    }

    /**
     * Приховати лічильник підсвічування
     */
    hideHighlightCounter() {
        const counter = document.getElementById('comspec-highlight-counter');
        if (counter) {
            counter.remove();
        }
    }

    /**
     * Навігація по підсвіченим результатам
     */
    navigateHighlights(direction = 'next') {
        if (this.currentHighlights.length === 0) {
            console.warn('⚠️ Немає підсвічених результатів для навігації');
            return false;
        }
        
        // Знаходимо поточний активний елемент
        let currentIndex = this.currentHighlights.findIndex(el => 
            el.classList.contains('comspec-search-focus')
        );
        
        // Якщо немає активного, починаємо з першого
        if (currentIndex === -1) {
            currentIndex = direction === 'next' ? -1 : this.currentHighlights.length;
        }
        
        // Обчислюємо наступний індекс
        let nextIndex;
        if (direction === 'next') {
            nextIndex = (currentIndex + 1) % this.currentHighlights.length;
        } else {
            nextIndex = currentIndex === 0 ? this.currentHighlights.length - 1 : currentIndex - 1;
        }
        
        // Видаляємо попередній фокус
        if (currentIndex >= 0 && this.currentHighlights[currentIndex]) {
            this.currentHighlights[currentIndex].classList.remove('comspec-search-focus');
        }
        
        // Переходимо до наступного елемента
        const targetElement = this.currentHighlights[nextIndex];
        if (targetElement) {
            this.scrollToElement(targetElement);
            
            // console.log(`📍 Навігація: ${nextIndex + 1}/${this.currentHighlights.length}`);
            return true;
        }
        
        return false;
    }

    /**
     * Клавіатурні скорочення
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // F3 або Ctrl+G для навігації вперед
            if (e.key === 'F3' || (e.ctrlKey && e.key === 'g')) {
                e.preventDefault();
                this.navigateHighlights('next');
            }
            
            // Shift+F3 або Ctrl+Shift+G для навігації назад
            if ((e.shiftKey && e.key === 'F3') || (e.ctrlKey && e.shiftKey && e.key === 'G')) {
                e.preventDefault();
                this.navigateHighlights('prev');
            }
            
            // Escape для очищення підсвічування
            if (e.key === 'Escape') {
                this.clearHighlights();
            }
        });
    }

    /**
     * Налаштування глобальних функцій
     */
    setupGlobalFunctions() {
        // Основні функції (зберігаємо ваші назви)
        window.highlightSearchResults = (query, results, options) => {
            return this.highlight(query, options);
        };
        
        window.clearSearchHighlights = (container) => {
            return this.clearHighlights(container);
        };
        
        window.navigateToResult = (resultData, highlightQuery) => {
            return this.scrollToElementWithHighlight(
                resultData.selector || 'body', 
                highlightQuery || resultData.text || '', 
                resultData.context,
                resultData.element
            );
        };
        
        // Додаткові функції навігації
        window.navigateNextHighlight = () => {
            return this.navigateHighlights('next');
        };
        
        window.navigatePrevHighlight = () => {
            return this.navigateHighlights('prev');
        };
        
        // Додаємо до глобального об'єкта
        window.SearchHighlighting = this;
        window.searchHighlighting = this;
        
        // console.log('🎨 Глобальні функції підсвічування налаштовано');
    }

    /**
     * Підсвічування з опціями (для сумісності)
     */
    highlight(query, options = {}) {
        const {
            container = document.body
        } = options;
        
        return this.highlightTermInElement(container, query);
    }

    /**
     * Тестування підсвічування (з вашого файлу + покращення)
     */
    test(queries = ['пісок', '044', 'доставка', 'COMSPEC']) {
        console.log('🧪 Тест підсвічування...');
        
        queries.forEach((query, index) => {
            setTimeout(() => {
                // console.log(`🔍 Тест "${query}"`);
                this.scrollToElementWithHighlight('body', query);
                
                if (index === queries.length - 1) {
                    setTimeout(() => this.clearHighlights(), 3000);
                }
            }, index * 2000);
        });
    }

    /**
     * Діагностика системи підсвічування
     */
    diagnose() {
        const diagnostics = {
            isInitialized: this.isInitialized,
            stylesInjected: !!document.getElementById('comspec-search-highlighting-styles'),
            currentHighlights: this.currentHighlights.length,
            globalFunctionsAvailable: {
                highlightSearchResults: !!window.highlightSearchResults,
                clearSearchHighlights: !!window.clearSearchHighlights,
                navigateToResult: !!window.navigateToResult
            }
        };
        
        // console.log('🔬 Діагностика SearchHighlighting:', diagnostics);
        return diagnostics;
    }
}

// Автоматична ініціалізація при завантаженні
let searchHighlightingInstance = null;

function initializeSearchHighlighting() {
    if (!searchHighlightingInstance) {
        searchHighlightingInstance = new SearchHighlighting();
        
        // Додавання до глобального contextSearch (якщо існує)
        if (window.contextSearch) {
            Object.assign(window.contextSearch, {
                highlightTermInElement: searchHighlightingInstance.highlightTermInElement.bind(searchHighlightingInstance),
                scrollToElementWithHighlight: searchHighlightingInstance.scrollToElementWithHighlight.bind(searchHighlightingInstance),
                clearHighlights: searchHighlightingInstance.clearHighlights.bind(searchHighlightingInstance),
                testHighlighting: searchHighlightingInstance.test.bind(searchHighlightingInstance),
                
                // Псевдоніми (зберігаємо ваші)
                highlight: searchHighlightingInstance.highlightTermInElement.bind(searchHighlightingInstance),
                navigate: searchHighlightingInstance.scrollToElementWithHighlight.bind(searchHighlightingInstance),
                clear: searchHighlightingInstance.clearHighlights.bind(searchHighlightingInstance)
            });
        }
        
        // console.log('✅ SearchHighlighting готовий до використання');
    }
    return searchHighlightingInstance;
}

// Ініціалізація при завантаженні DOM
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSearchHighlighting);
    } else {
        initializeSearchHighlighting();
    }
}

// Експорт для модульної системи (зберігаємо ваші)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchHighlighting;
}

// ES6 експорт
export default SearchHighlighting;
export { initializeSearchHighlighting };

// console.log('✅ SearchHighlighting модуль завантажено успішно!');