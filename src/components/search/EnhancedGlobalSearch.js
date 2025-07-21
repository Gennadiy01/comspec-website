// EnhancedGlobalSearch.js - Повна версія з SearchEngineManager інтеграцією + React.memo оптимізація + debouncing
import React, { useState, useEffect, useRef, memo, useCallback, useMemo} from 'react';
import searchEngineManager from './SearchEngineManager.js';
import { useDebounce } from '../../hooks/useSearchNavigation.js';

const EnhancedGlobalSearch = memo(({ 
  isOpen, 
  onClose, 
  onResultSelect, 
  searchQuery: externalSearchQuery = '', 
  onSearchChange 
}) => {
  // console.log('🔍 EnhancedGlobalSearch рендериться, isOpen:', isOpen, 'externalSearchQuery:', externalSearchQuery);

  const [query, setQuery] = useState(externalSearchQuery);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [stats, setStats] = useState(null);
  const [debugInfo, setDebugInfo] = useState('Компонент завантажується...');
  const [isInitialized, setIsInitialized] = useState(false);
  const prevExternalQueryRef = useRef(externalSearchQuery);
  
  // 🔥 Debounced пошук (Етап 4 - оптимізація)
  const debouncedQuery = useDebounce(query, 300); // 300ms затримка

  // ✅ НОВА ВЛАСТИВІСТЬ: Посилання на модуль підсвічування
  const [highlighting, setHighlighting] = useState(null);

  // Синхронізація зовнішнього та внутрішнього query
  useEffect(() => {
    if (externalSearchQuery !== prevExternalQueryRef.current) {
      // console.log('🔄 Синхронізація query:', prevExternalQueryRef.current, '->', externalSearchQuery);
      setQuery(externalSearchQuery);
      prevExternalQueryRef.current = externalSearchQuery;
    }
  }, [externalSearchQuery]);

  // ✅ ФУНКЦІЯ: Отримання контекстних кольорів (мемоізована)
  const contextColors = useMemo(() => ({
    'address': { bg: '#fff3cd', border: '#ffd700' },
    'phone': { bg: '#d1ecf1', border: '#17a2b8' }, 
    'email': { bg: '#cce5ff', border: '#007bff' },
    'product': { bg: '#d4edda', border: '#28a745' },
    'service': { bg: '#f8d7da', border: '#dc3545' },
    'content': { bg: '#fff2cc', border: '#ffed4e' }
  }), []);

  const getContextColors = useCallback((result) => {
    if (result && result.context) {
      return contextColors[result.context.field] || { bg: '#e6f3f3', border: '#008080' };
    }
    return { bg: '#e6f3f3', border: '#008080' };
  }, [contextColors]);

  // ✅ НОВА ФУНКЦІЯ: Ініціалізація SearchHighlighting
  const initializeHighlighting = async () => {
    try {
      // console.log('🎨 Ініціалізація SearchHighlighting...');
      
      // Спробуємо завантажити SearchHighlighting
      let SearchHighlighting = null;
      
      try {
        const module = await import('./SearchHighlighting');
        SearchHighlighting = module.default;
        // console.log('✅ SearchHighlighting завантажено через module.default');
      } catch (importError1) {
        // console.log('⚠️ Спосіб 1 не вдався, пробуємо спосіб 2...');
        
        try {
          const module = await import('./SearchHighlighting.js');
          SearchHighlighting = module.default || module.SearchHighlighting;
          // console.log('✅ SearchHighlighting завантажено через альтернативний імпорт');
        } catch (importError2) {
          // console.log('⚠️ Спосіб 2 не вдався, перевіряємо window...');
          
          if (typeof window.SearchHighlighting !== 'undefined') {
            SearchHighlighting = window.SearchHighlighting;
            // console.log('✅ SearchHighlighting знайдено в window');
          } else {
            throw new Error(`Всі способи завантаження не вдалися: ${importError2.message}`);
          }
        }
      }
      
      if (SearchHighlighting) {
        const highlightingInstance = new SearchHighlighting();
        setHighlighting(highlightingInstance);
        // console.log('✅ SearchHighlighting ініціалізовано успішно');
        
        // Експортуємо функції в глобальний API
        if (typeof window.contextSearch !== 'undefined') {
          Object.assign(window.contextSearch, {
            highlight: highlightingInstance.highlightTermInElement.bind(highlightingInstance),
            navigate: highlightingInstance.scrollToElementWithHighlight.bind(highlightingInstance),
            clear: highlightingInstance.clearHighlights.bind(highlightingInstance)
          });
          // console.log('✅ Функції підсвічування експортовано в window.contextSearch');
        }
        
        return highlightingInstance;
      } else {
        throw new Error('SearchHighlighting не знайдено');
      }
      
    } catch (error) {
      console.warn('⚠️ SearchHighlighting недоступне:', error.message);
      console.log('💡 Підсвічування буде працювати в обмеженому режимі');
      return null;
    }
  };

  // Ініціалізація при відкритті
  useEffect(() => {
    // console.log('🚀 useEffect викликано, isOpen:', isOpen, 'isInitialized:', isInitialized);
    
    if (isOpen && !isInitialized) {
      // console.log('📂 Відкриття пошукового модального вікна...');
      // setDebugInfo('Модальне вікно відкрито');
      setIsInitialized(true);
      
      const searchEngineManagerCheck = async () => {
        try {
          // console.log('📦 Ініціалізуємо SearchEngineManager...');
          
          // Ініціалізуємо SearchEngineManager
          if (!searchEngineManager.isInitialized) {
            await searchEngineManager.initialize();
          }
          
          const engineStats = searchEngineManager.getStats();
          // console.log('📊 Статистика движка:', engineStats);
          setStats(engineStats);
          // setDebugInfo(`Движок готовий. Записів: ${engineStats.totalRecords}`);
          
          // ✅ НОВЕ: Ініціалізуємо SearchHighlighting після SearchEngineManager
          await initializeHighlighting();
          
        } catch (error) {
          console.error('❌ Помилка ініціалізації SearchEngineManager:', error);
          // setDebugInfo(`❌ Помилка: ${error.message}`);
        }
      };
      
      searchEngineManagerCheck();
      loadSearchHistory();
      
      setQuickActions([
        { label: 'Щебінь', query: 'щебінь', category: 'Продукція' },
        { label: 'Пісок', query: 'пісок', category: 'Продукція' },
        { label: 'Асфальт', query: 'асфальт', category: 'Продукція' },
        { label: 'Доставка', query: 'доставка', category: 'Послуги' },
        { label: 'Контакти', query: 'контакти', category: 'Інформація' }
      ]);
      
      // console.log('🎯 Пошукове вікно готове до роботи');
    }
    
    if (!isOpen && isInitialized) {
      // console.log('🚪 Закриття модального вікна');
      setIsInitialized(false);
    }
  }, [isOpen, isInitialized]);

  // 🔥 Оптимізований пошук з debounced hook (Етап 4)
  useEffect(() => {
    // console.log('🔍 Debounced пошук, debouncedQuery:', debouncedQuery);
    
    if (!debouncedQuery.trim()) {
      setResults([]);
      setActiveIndex(-1);
      // setDebugInfo('Очікування запиту...');
      return;
    }

    setIsLoading(true);
    // setDebugInfo(`Пошук "${debouncedQuery}"...`);
    performSearch(debouncedQuery);
  }, [debouncedQuery]);

  // Виконання пошуку через SearchEngineManager
  const performSearch = async (searchQuery) => {
    // console.log(`🔍 performSearch викликано з: "${searchQuery}"`);
    
    try {
      // Ініціалізуємо SearchEngineManager якщо потрібно
      if (!searchEngineManager.isInitialized) {
        console.log('📦 Ініціалізуємо SearchEngineManager...');
        await searchEngineManager.initialize();
      }
      
      // console.log('🔍 Виконуємо реальний пошук через SearchEngineManager...');
      const startTime = performance.now();
      
      // Використовуємо гібридний пошук з SearchEngineManager
      const rawResults = searchEngineManager.search(searchQuery.trim(), {
        type: 'hybrid',
        limit: 10,
        includeContext: true,
        sortBy: 'relevance'
      });
      
      const endTime = performance.now();
      const searchTime = endTime - startTime;
      
      // console.log(`📊 Знайдено ${rawResults.length} результатів за ${searchTime.toFixed(2)}ms`);
      
      rawResults.forEach((result, index) => {
        // if (result.context) {
        //   console.log(`🎯 Результат ${index + 1} має контекст:`, result.context);
        // }
      });
      
      const formattedResults = rawResults.map((result, index) => ({
        id: result.id || `result-${index}`,
        title: result.title || result.text || 'Без назви',
        content: result.content || result.description || result.text || '',
        category: result.category || result.type || 'Загальне',
        page: result.page || '/',
        section: result.section || '#home',
        url: result.url || result.section || '#home',
        relevance: Math.round(result.score || result.relevance || 0),
        indexType: result.indexType || result.source || result.type || 'content',
        context: result.context,
        element: result.element // Зберігаємо посилання на елемент для dynamic результатів
      }));
      
      setResults(formattedResults);
      // setDebugInfo(`Знайдено ${formattedResults.length} результатів за ${searchTime.toFixed(2)}ms`);
      setActiveIndex(-1);
      
      const engineStats = searchEngineManager.getStats();
      setStats(engineStats);
      
    } catch (error) {
      console.error('❌ Помилка в performSearch:', error);
      setResults([]);
      // setDebugInfo(`Помилка: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ НОВА ФУНКЦІЯ: Точне підсвічування терміну в елементі
  const highlightTermInElement = React.useCallback((element, searchTerm, options = {}) => {
    const {
      backgroundColor = '#fff3cd',
      borderColor = '#ffd700',
      highlightClass = 'comspec-search-highlight',
      duration = 5000
    } = options;

    console.log(`🎨 Підсвічування терміну "${searchTerm}" в елементі:`, element);

    // Очищаємо попередні підсвічування
    element.querySelectorAll(`.${highlightClass}`).forEach(highlight => {
      const parent = highlight.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        parent.normalize();
      }
    });

    // Створюємо TreeWalker для пошуку текстових вузлів
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          return node.textContent.toLowerCase().includes(searchTerm.toLowerCase()) 
            ? NodeFilter.FILTER_ACCEPT 
            : NodeFilter.FILTER_REJECT;
        }
      }
    );

    const nodesToProcess = [];
    let node = walker.nextNode();
    while (node) {
      nodesToProcess.push(node);
      node = walker.nextNode();
    }

    let highlightCount = 0;

    nodesToProcess.forEach(textNode => {
      const text = textNode.textContent;
      const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      
      if (regex.test(text)) {
        const parent = textNode.parentNode;
        const fragment = document.createDocumentFragment();
        
        let lastIndex = 0;
        text.replace(regex, (match, p1, offset) => {
          // Додаємо текст перед збігом
          if (offset > lastIndex) {
            fragment.appendChild(document.createTextNode(text.substring(lastIndex, offset)));
          }
          
          // Створюємо підсвічений span
          const highlight = document.createElement('span');
          highlight.className = highlightClass;
          highlight.style.backgroundColor = backgroundColor;
          highlight.style.border = `2px solid ${borderColor}`;
          highlight.style.borderRadius = '3px';
          highlight.style.padding = '1px 3px';
          highlight.style.fontWeight = 'bold';
          highlight.style.transition = 'all 0.3s ease';
          highlight.style.boxShadow = `0 0 5px ${borderColor}`;
          highlight.textContent = match;
          fragment.appendChild(highlight);
          
          lastIndex = offset + match.length;
          highlightCount++;
          return match;
        });
        
        // Додаємо залишок тексту
        if (lastIndex < text.length) {
          fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
        }
        
        // Замінюємо оригінальний текстовий вузол
        parent.replaceChild(fragment, textNode);
      }
    });

    // console.log(`✅ Підсвічено ${highlightCount} входжень терміну "${searchTerm}"`);

    // Автоматично очищаємо через вказаний час
    if (duration > 0) {
      setTimeout(() => {
        element.querySelectorAll(`.${highlightClass}`).forEach(highlight => {
          const parent = highlight.parentNode;
          if (parent) {
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
          }
        });
        console.log(`🧹 Підсвічування "${searchTerm}" очищено`);
      }, duration);
    }

    return highlightCount;
  }, []);

  // ✅ ОНОВЛЕНА ФУНКЦІЯ: Навігація з використанням SearchHighlighting
  const scrollToElementWithHighlight = (section, title, result) => {
    // console.log('🎯 scrollToElementWithHighlight викликано:', { section, title, result });
    
    const searchTerm = query.trim().toLowerCase();
    
    // ✅ НОВЕ: Використовуємо SearchHighlighting якщо доступний
    if (highlighting) {
      // console.log('🎨 Використовуємо SearchHighlighting для навігації');
      
      // Визначаємо селектор для пошуку
      let selector = section;
      
      // Для dynamic результатів використовуємо елемент напряму
      if (result.indexType === 'dynamic' && result.element) {
        const success = highlighting.scrollToElementWithHighlight(null, searchTerm, 'default', result.element, result.title);
        if (success) {
          console.log('✅ Навігація до dynamic елемента успішна');
          return true;
        }
      }
      
      // Для static результатів використовуємо селектор з точним заголовком
      if (selector) {
        const contextType = result.context ? result.context.field : 'default';
        const success = highlighting.scrollToElementWithHighlight(selector, searchTerm, contextType, null, result.title);
        if (success) {
          console.log('✅ Навігація до static елемента успішна з точним заголовком:', result.title);
          return true;
        }
      }
      
      // Fallback: пошук по заголовку з точним збігом
      if (title) {
        const success = highlighting.scrollToElementWithHighlight('h1, h2, h3, h4, h5, h6', searchTerm, 'default', null, result.title);
        if (success) {
          console.log('✅ Fallback навігація по заголовкам успішна з точним заголовком:', result.title);
          return true;
        }
      }
      
      console.log('⚠️ SearchHighlighting не зміг знайти елемент, використовуємо fallback');
    }
    
    // ✅ FALLBACK: Стара логіка як резервна з контекстними кольорами
    console.log('🔄 Використовуємо fallback навігацію');
    
    // Очищаємо всі попередні підсвічування на сторінці
    document.querySelectorAll('.comspec-search-highlight').forEach(highlight => {
      const parent = highlight.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        parent.normalize();
      }
    });

    let targetElement = null;
    let highlightElement = null;
    
    // Методи пошуку елемента
    if (result.indexType === 'dynamic' && result.element) {
      targetElement = result.element;
      highlightElement = result.element;
      
      // Скролимо до елемента
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Підсвічуємо термін після невеликої затримки з контекстними кольорами
      setTimeout(() => {
        const highlightColors = getContextColors(result);
        highlightTermInElement(highlightElement, searchTerm, {
          backgroundColor: highlightColors.bg,
          borderColor: highlightColors.border
        });
      }, 500);
      
      return true;
    }
    
    if (section && section.startsWith('#')) {
      const sectionId = section.substring(1);
      targetElement = document.getElementById(sectionId);
      console.log('🔍 Пошук по ID:', sectionId, 'знайдено:', !!targetElement);
    }
    
    if (!targetElement && section) {
      try {
        targetElement = document.querySelector(section);
        console.log('🔍 Пошук по селектору:', section, 'знайдено:', !!targetElement);
      } catch (e) {
        console.warn('⚠️ Невалідний CSS селектор:', section);
      }
    }
    
    // Пошук по заголовкам якщо елемент не знайдено
    if (!targetElement && title) {
      console.log('🔍 Пошук по заголовкам з терміном:', title);
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      // Спочатку точний збіг
      targetElement = Array.from(headings).find(h => {
        const text = h.textContent.toLowerCase().trim();
        return text === title.toLowerCase().trim();
      });
      
      // Потім часткове включення
      if (!targetElement) {
        targetElement = Array.from(headings).find(h => {
          const text = h.textContent.toLowerCase();
          return text.includes(title.toLowerCase()) || title.toLowerCase().includes(text);
        });
      }
      
      console.log('🔍 Пошук по заголовкам:', !!targetElement);
      
      if (targetElement) {
        // Для заголовків шукаємо батьківський контейнер для підсвічування
        highlightElement = targetElement.closest('.card, .section, .product-item, article, section') || targetElement.parentElement;
        if (!highlightElement) highlightElement = targetElement;
      }
    }
    
    // Загальний пошук по тексту з пошуковим терміном
    if (!targetElement && searchTerm) {
      console.log('🔍 Загальний пошук по тексту з терміном:', searchTerm);
      
      const allElements = document.querySelectorAll('p, div, span, section, article, h1, h2, h3, h4, h5, h6');
      targetElement = Array.from(allElements).find(el => {
        const text = el.textContent.toLowerCase();
        return text.includes(searchTerm) && el.offsetHeight > 0 && 
               !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName);
      });
      
      if (targetElement) {
        highlightElement = targetElement;
      }
      
      console.log('🔍 Загальний пошук по тексту:', !!targetElement);
    }
    
    // Виконання навігації та підсвічування
    if (targetElement) {
      console.log('✅ Елемент знайдено:', {
        tagName: targetElement.tagName,
        id: targetElement.id,
        className: targetElement.className,
        text: targetElement.textContent.substring(0, 100)
      });
      
      // Скролимо до елемента
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
      
      // Підсвічуємо після скролу з контекстними кольорами
      setTimeout(() => {
        const elementToHighlight = highlightElement || targetElement;
        const highlightColors = getContextColors(result);
        const originalOutline = elementToHighlight.style.outline;
        const originalBackground = elementToHighlight.style.backgroundColor;
        const originalTransition = elementToHighlight.style.transition;
        
        elementToHighlight.style.outline = `4px solid ${highlightColors.border}`;
        elementToHighlight.style.backgroundColor = highlightColors.bg;
        elementToHighlight.style.transition = 'all 0.3s ease';
        
        // Потім підсвічуємо конкретний термін з контекстними кольорами
        setTimeout(() => {
          const highlightColors = getContextColors(result);
          highlightTermInElement(elementToHighlight, searchTerm, {
            backgroundColor: highlightColors.bg,
            borderColor: highlightColors.border,
            duration: 8000
          });
        }, 300);
        
        // Очищаємо загальне підсвічування
        setTimeout(() => {
          elementToHighlight.style.outline = originalOutline;
          elementToHighlight.style.backgroundColor = originalBackground;
          elementToHighlight.style.transition = originalTransition;
        }, 3000);
        
        console.log('🎨 Підсвічування застосовано');
      }, 500);
      
      return true;
    } else {
      console.warn('⚠️ Елемент не знайдено для:', { section, title, searchTerm });
      
      // Fallback: скрол до верху сторінки з підсвічуванням усіх входжень терміну
      if (searchTerm) {
        console.log('🔍 Fallback: підсвічуємо всі входження терміну на сторінці');
        
        setTimeout(() => {
          const highlightColors = getContextColors(result);
          highlightTermInElement(document.body, searchTerm, {
            backgroundColor: highlightColors.bg,
            borderColor: highlightColors.border,
            duration: 5000
          });
        }, 100);
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.log('⬆️ Скрол до верху сторінки');
      return false;
    }
  };

  // Обробка кліку на результат
  const handleResultClick = (result) => {
    console.log('🌐 Клік на результат:', result);
    const highlightColors = getContextColors(result);
    console.log('🎨 Використовуватимуться кольори:', highlightColors);
    // setDebugInfo(`Навігація до: ${result.title}`);
    
    const currentPath = window.location.pathname;
    
    if (result.page && result.page !== currentPath && result.page !== '/') {
      console.log(`🚀 Навігація з ${currentPath} на ${result.page}`);
      window.location.hash = result.page;
      
      setTimeout(() => {
        scrollToElementWithHighlight(result.section, result.title, result);
      }, 500);
    } else {
      scrollToElementWithHighlight(result.section, result.title, result);
    }
    
    saveToSearchHistory(result);
    if (onResultSelect) onResultSelect(result);
    onClose();
  };

  // Обробка швидких дій
  const handleQuickAction = (action) => {
    console.log('⚡ Швидка дія:', action);
    setQuery(action.query);
    if (onSearchChange) {
      onSearchChange(action.query);
    }
  };

  // Збереження в історію пошуку
  const saveToSearchHistory = (result) => {
    const historyItem = {
      query: query,
      result: result,
      timestamp: Date.now()
    };
    
    const newHistory = [historyItem, ...searchHistory.filter(item => 
      item.query !== query
    )].slice(0, 5);
    
    setSearchHistory(newHistory);
    try {
      localStorage.setItem('comspec_search_history', JSON.stringify(newHistory));
    } catch (error) {
      console.warn('Помилка збереження історії:', error);
    }
  };

  // Завантаження історії пошуку
  const loadSearchHistory = () => {
    try {
      const saved = localStorage.getItem('comspec_search_history');
      if (saved) {
        setSearchHistory(JSON.parse(saved));
        console.log('📚 Історія пошуку завантажена');
      }
    } catch (error) {
      console.warn('Помилка завантаження історії пошуку:', error);
    }
  };

  // ✅ НОВА ФУНКЦІЯ: Тестування підсвічування
  const testHighlighting = () => {
    if (!highlighting) {
      console.log('❌ Підсвічування недоступне для тестування');
      return false;
    }
    
    try {
      // Тест підсвічування в заголовку
      const h1 = document.querySelector('h1');
      if (h1) {
        highlighting.highlightTermInElement(h1, 'COMSPEC', 'default');
        console.log('✅ Тест підсвічування пройдено');
        
        // Очищення через 3 секунди
        setTimeout(() => {
          highlighting.clearHighlights();
          console.log('🧹 Підсвічування очищено');
        }, 3000);
        
        return true;
      } else {
        console.log('⚠️ Елемент h1 не знайдено для тестування');
        return false;
      }
    } catch (error) {
      console.error('❌ Помилка тестування підсвічування:', error);
      return false;
    }
  };

  // Рендер результату пошуку з контекстними мітками
  const renderSearchResult = (result, index) => {
    const isActive = index === activeIndex;
    
    // Визначаємо контекст для результату
    let contextLabel = null;
    if (result.context && result.context.searchableFields) {
      const queryLower = query.toLowerCase();
      const contextMatch = result.context.searchableFields[queryLower];
      
      if (contextMatch) {
        const contextColors = {
          'address': { bg: '#fff3cd', color: '#856404' },
          'phone': { bg: '#d1ecf1', color: '#0c5460' },
          'email': { bg: '#cce5ff', color: '#0056b3' },
          'product': { bg: '#d4edda', color: '#155724' },
          'service': { bg: '#f8d7da', color: '#721c24' },
          'content': { bg: '#fff2cc', color: '#664d03' }
        };
        
        const colors = contextColors[contextMatch.field] || { bg: '#fff2cc', color: '#664d03' };
        
        contextLabel = (
          <span style={{
            fontSize: '10px',
            color: colors.color,
            backgroundColor: colors.bg,
            padding: '2px 6px',
            borderRadius: '10px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            marginLeft: '8px'
          }}>
            {contextMatch.label}
          </span>
        );
      }
    }
    
    return (
      <div
        key={result.id || index}
        className={`search-result ${isActive ? 'active' : ''}`}
        onClick={() => handleResultClick(result)}
        onMouseEnter={() => setActiveIndex(index)}
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e9ecef',
          cursor: 'pointer',
          backgroundColor: isActive ? '#f8f9fa' : 'transparent',
          transition: 'background-color 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ 
              margin: '0 0 4px 0', 
              fontSize: '14px', 
              fontWeight: '600',
              color: '#333f4f',
              display: 'flex',
              alignItems: 'center'
            }}>
              {result.title}
              {contextLabel}
              {result.indexType === 'dynamic' && (
                <span style={{
                  fontSize: '10px',
                  color: '#28a745',
                  backgroundColor: '#d4edda',
                  padding: '1px 4px',
                  borderRadius: '8px',
                  marginLeft: '8px'
                }}>
                  LIVE
                </span>
              )}
            </h4>
            
            {result.content && (
              <p style={{ 
                margin: '0 0 8px 0', 
                fontSize: '13px', 
                color: '#6c757d',
                lineHeight: '1.4'
              }}>
                {result.content.length > 120 
                  ? `${result.content.substring(0, 120)}...` 
                  : result.content
                }
              </p>
            )}
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{
                fontSize: '11px',
                color: '#008080',
                backgroundColor: '#e6f3f3',
                padding: '2px 6px',
                borderRadius: '10px',
                fontWeight: '500'
              }}>
                {result.category || 'Загальне'}
              </span>
              
              {result.page && (
                <span style={{
                  fontSize: '11px',
                  color: '#6c757d'
                }}>
                  {result.page === '/' ? 'Головна' : result.page.replace('/', '')}
                </span>
              )}
            </div>
          </div>
          
          <div style={{
            fontSize: '11px',
            color: '#adb5bd',
            marginLeft: '12px',
            flexShrink: 0
          }}>
            {Math.round(result.relevance || 0)}
          </div>
        </div>
      </div>
    );
  };

  console.log('🎨 Рендер компонента, isOpen:', isOpen, 'query:', query, 'results:', results.length);

  if (!isOpen) {
    console.log('❌ Не рендеримо - модальне вікно закрите');
    return null;
  }

  return (
    <div style={{ padding: '0' }}>
      <div style={{ maxHeight: 'calc(80vh - 160px)', overflowY: 'auto' }}>

        {isLoading && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6c757d'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '2px solid #e9ecef',
              borderTop: '2px solid #008080',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 12px'
            }}></div>
            Пошук...
          </div>
        )}

        {!isLoading && query && results.length === 0 && (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#6c757d'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#333f4f' }}>
              Нічого не знайдено
            </h3>
            <p style={{ margin: '0 0 16px 0' }}>
              Запит: "{query}"
            </p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div>
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#f8f9fa',
              fontSize: '12px',
              color: '#6c757d',
              borderBottom: '1px solid #e9ecef'
            }}>
              Знайдено {results.length} результатів для "{query}"
            </div>
            
            {results.map((result, index) => renderSearchResult(result, index))}
          </div>
        )}

        {!query && (
          <div style={{ padding: '20px' }}>
            {/* Швидкі дії */}
            {quickActions.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  color: '#333f4f'
                }}>
                  Швидкий пошук
                </h4>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action)}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #e9ecef',
                        borderRadius: '16px',
                        backgroundColor: 'transparent',
                        color: '#333f4f',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Історія пошуку */}
            {searchHistory.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  color: '#333f4f'
                }}>
                  Останні пошуки
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {searchHistory.slice(0, 3).map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(item.query);
                        if (onSearchChange) {
                          onSearchChange(item.query);
                        }
                      }}
                      style={{
                        padding: '8px 12px',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: '#f8f9fa',
                        color: '#333f4f',
                        fontSize: '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {item.query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Статистика */}
            {stats && (
              <div style={{
                marginTop: '24px',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                fontSize: '11px',
                color: '#6c757d'
              }}>
                <div>Індексовано: {stats.totalRecords} записів</div>
                <div>Статичних: {stats.staticIndex} | Динамічних: {stats.dynamicIndex}</div>
                {highlighting && <div>Підсвічування: активне</div>}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .search-result:hover {
          background-color: #f8f9fa !important;
        }

        .search-result.active {
          background-color: #e6f3f3 !important;
          border-left: 3px solid #008080;
        }

        .comspec-search-highlight {
          animation: searchHighlightPulse 1s ease-in-out;
        }

        @keyframes searchHighlightPulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 5px rgba(255, 152, 0, 0.5);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 15px rgba(255, 152, 0, 0.8);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 5px rgba(255, 152, 0, 0.5);
          }
        }
      `}</style>
    </div>
  );
}, (prevProps, nextProps) => {
  // Детальна діагностика React.memo
  console.log('🔬 React.memo порівняння викликано:', {
    'prevProps.isOpen': prevProps.isOpen,
    'nextProps.isOpen': nextProps.isOpen,
    'prevProps.searchQuery': prevProps.searchQuery,
    'nextProps.searchQuery': nextProps.searchQuery,
    'isOpen змінився': prevProps.isOpen !== nextProps.isOpen,
    'searchQuery змінився': prevProps.searchQuery !== nextProps.searchQuery
  });
  
  const shouldSkipRender = (
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.searchQuery === nextProps.searchQuery
  );
  
  if (shouldSkipRender) {
    console.log('🚫 EnhancedGlobalSearch: ререндер ПРОПУЩЕНО через memo');
    return true; // Пропускаємо ререндер
  }
  
  console.log('✅ EnhancedGlobalSearch: ререндер ДОЗВОЛЕНО, props змінились');
  return false; // Дозволяємо ререндер
});

// Додаємо displayName для кращого дебагу
EnhancedGlobalSearch.displayName = 'EnhancedGlobalSearch';

export default EnhancedGlobalSearch;