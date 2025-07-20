// src/hooks/useSearchNavigation.js - Хуки для пошуку + навігації + debouncing
import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * 🔥 Custom hook для debounced пошуку (Етап 4 - оптимізація)
 * @param {string} value - поточне значення пошуку
 * @param {number} delay - затримка debouncing в мілісекундах
 * @returns {string} - debounced значення
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * 🔥 Hook для оптимізованого пошуку з кешуванням результатів (Етап 4)
 * @param {function} searchFunction - функція пошуку
 * @param {number} cacheSize - максимальний розмір кешу
 * @returns {object} - об'єкт з методами пошуку
 */
export const useOptimizedSearch = (searchFunction, cacheSize = 50) => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const cacheRef = useRef(new Map());
  const abortControllerRef = useRef(null);

  // Функція виконання пошуку
  const performSearch = useCallback(async (query, options = {}) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Перевіряємо кеш
    const cacheKey = JSON.stringify({ query, options });
    if (cacheRef.current.has(cacheKey)) {
      const cachedResults = cacheRef.current.get(cacheKey);
      setResults(cachedResults);
      console.log('🗄️ Результати з кешу хука:', cachedResults.length);
      return cachedResults;
    }

    // Скасовуємо попередній запит
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Створюємо новий контролер для скасування
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const searchResults = await searchFunction(query, {
        ...options,
        signal: abortControllerRef.current.signal
      });

      setResults(searchResults);

      // Зберігаємо в кеш
      if (cacheRef.current.size >= cacheSize) {
        // Видаляємо найстарший запис
        const firstKey = cacheRef.current.keys().next().value;
        cacheRef.current.delete(firstKey);
      }
      cacheRef.current.set(cacheKey, searchResults);

      console.log('🔍 Пошук виконано:', searchResults.length, 'результатів');
      return searchResults;

    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        console.error('❌ Помилка пошуку:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchFunction, cacheSize]);

  // Функція очищення кешу
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    console.log('🧹 Кеш пошуку очищено');
  }, []);

  // Cleanup при демонтуванні
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    results,
    isLoading,
    error,
    performSearch,
    clearCache,
    cacheSize: cacheRef.current.size
  };
};

/**
 * 🎯 Хук для автоматичного підсвічування після навігації
 * Використовувати в кожному компоненті сторінки (Home, Products, Services тощо)
 */
export const useSearchNavigation = () => {
  useEffect(() => {
    // Перевіряємо чи є збережена інформація для підсвічування після навігації
    const handleNavigationHighlighting = () => {
      try {
        const highlightInfo = sessionStorage.getItem('comspec_highlight_after_navigation');
        
        if (highlightInfo) {
          const info = JSON.parse(highlightInfo);
          console.log('🎨 Виявлено інформацію для підсвічування після навігації:', info);
          
          // Видаляємо інформацію після використання
          sessionStorage.removeItem('comspec_highlight_after_navigation');
          
          // Виконуємо підсвічування з затримкою для завантаження DOM
          setTimeout(() => {
            performHighlighting(info);
          }, 1000);
        }
      } catch (error) {
        console.warn('⚠️ Помилка обробки навігаційного підсвічування:', error);
      }
    };
    
    // Функція виконання підсвічування
    const performHighlighting = (info) => {
      const { term, result } = info;
      let highlighted = false;
      
      console.log('🔍 Спроба підсвічування:', { term, result });
      
      // Метод 1: Використання SearchHighlighting з точним заголовком
      if (window.searchHighlighting && window.searchHighlighting.scrollToElementWithHighlight) {
        try {
          const highlightResult = window.searchHighlighting.scrollToElementWithHighlight(
            'body', term, result.context, null, result.title
          );
          if (highlightResult && highlightResult.highlighted) {
            console.log('✅ Підсвічування успішне через SearchHighlighting з точним заголовком:', result.title);
            highlighted = true;
          }
        } catch (error) {
          console.warn('⚠️ Помилка SearchHighlighting:', error);
        }
      }
      
      // Метод 2: Використання глобальних функцій
      if (!highlighted && window.highlightSearchResults) {
        try {
          if (window.highlightSearchResults(term, [result])) {
            console.log('✅ Підсвічування успішне через глобальні функції');
            highlighted = true;
          }
        } catch (error) {
          console.warn('⚠️ Помилка глобальних функцій підсвічування:', error);
        }
      }
      
      // Метод 3: Покращений пошук з точним збігом
      if (!highlighted) {
        try {
          // Спочатку шукаємо точний збіг заголовку
          let targetElement = null;
          
          if (result.title) {
            const exactMatches = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, div, span, li'))
              .filter(el => {
                const text = el.textContent.trim();
                return text.toLowerCase() === result.title.toLowerCase() && 
                       el.offsetParent !== null; // Елемент видимий
              });
            
            if (exactMatches.length > 0) {
              targetElement = exactMatches[0];
              console.log('🎯 Знайдено точний збіг заголовку:', result.title);
            }
          }
          
          // Якщо точний збіг не знайдено, шукаємо найкращий частковий збіг
          if (!targetElement) {
            const partialMatches = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, div, span, li'))
              .filter(el => {
                const text = el.textContent || '';
                return text.toLowerCase().includes(term.toLowerCase()) && 
                       el.offsetParent !== null; // Елемент видимий
              });
            
            if (partialMatches.length > 0) {
              // Вибираємо найкращий збіг за подібністю
              targetElement = findBestMatch(partialMatches, result.title || term);
              console.log('🔍 Використовуємо найкращий частковий збіг');
            }
          }
          
          if (targetElement) {
            
            // Прокручуємо до елемента
            targetElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            
            // Підсвічуємо тимчасово
            const originalStyle = targetElement.style.cssText;
            targetElement.style.cssText += `
              background-color: #ffeb3b !important;
              transition: background-color 0.3s ease !important;
              padding: 4px !important;
              border-radius: 4px !important;
            `;
            
            setTimeout(() => {
              targetElement.style.cssText = originalStyle;
            }, 3000);
            
            console.log('✅ Підсвічування успішне простим методом');
            highlighted = true;
          }
        } catch (error) {
          console.warn('⚠️ Помилка простого підсвічування:', error);
        }
      }
      
      if (!highlighted) {
        console.log('⚠️ Не вдалося виконати підсвічування жодним методом');
      }
    };
    
    // Викликаємо при завантаженні компонента
    handleNavigationHighlighting();
    
    // Також слухаємо зміни hash для SPA навігації
    const handleHashChange = () => {
      setTimeout(handleNavigationHighlighting, 500);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []); // Порожній масив залежностей - виконується тільки при mount
};

/**
 * 🔧 Хук для ініціалізації пошукової системи на сторінці
 */
export const useSearchSystemInit = () => {
  useEffect(() => {
    // Перевіряємо ініціалізацію пошукової системи
    const initializeIfNeeded = () => {
      // Якщо система не ініціалізована
      if (!window.hybridSearchEngine || !window.contextSearch) {
        console.log('🔧 Ініціалізація пошукової системи...');
        
        // Спробуємо ініціалізувати через глобальний ініціалізатор
        if (window.initializeSearchEngine) {
          window.initializeSearchEngine()
            .then(() => {
              console.log('✅ Пошукова система ініціалізована успішно');
            })
            .catch((error) => {
              console.warn('⚠️ Помилка ініціалізації пошукової системи:', error);
            });
        }
        
        // Або спробуємо прямий виклик утилітів
        if (window.comspecSearchUtils && window.comspecSearchUtils.restart) {
          window.comspecSearchUtils.restart()
            .then(() => {
              console.log('✅ Пошукова система перезапущена успішно');
            })
            .catch((error) => {
              console.warn('⚠️ Помилка перезапуску пошукової системи:', error);
            });
        }
      }
    };
    
    // Ініціалізуємо з невеликою затримкою
    setTimeout(initializeIfNeeded, 100);
  }, []);
};

/**
 * 🎯 Комбінований хук для використання в компонентах сторінок
 */
export const useComspecSearch = () => {
  useSearchSystemInit();
  useSearchNavigation();
  
  // Повертаємо корисні функції для компонентів
  return {
    // Функція для програмного виклику пошуку
    search: (query, limit = 10) => {
      if (window.hybridSearchEngine) {
        return window.hybridSearchEngine.search(query, limit);
      }
      return [];
    },
    
    // Функція для підсвічування на поточній сторінці
    highlight: (term, context = 'content') => {
      if (window.searchHighlighting && window.searchHighlighting.highlightTermInElement) {
        return window.searchHighlighting.highlightTermInElement(document.body, term, context);
      }
      if (window.highlightSearchResults) {
        return window.highlightSearchResults(term, []);
      }
      return false;
    },
    
    // Функція для очищення підсвічування
    clearHighlights: () => {
      if (window.searchHighlighting && window.searchHighlighting.clearHighlights) {
        return window.searchHighlighting.clearHighlights();
      }
      if (window.clearSearchHighlights) {
        return window.clearSearchHighlights();
      }
      return false;
    },
    
    // Функція для отримання статистики
    getStats: () => {
      if (window.hybridSearchEngine && window.hybridSearchEngine.getStats) {
        return window.hybridSearchEngine.getStats();
      }
      return null;
    },
    
    // Функція для діагностики
    diagnose: () => {
      if (window.diagnoseSearchSystem) {
        return window.diagnoseSearchSystem();
      }
      return null;
    }
  };
};

/**
 * Функція для знаходження найкращого збігу серед елементів
 */
const findBestMatch = (elements, targetText) => {
  if (!elements.length || !targetText) {
    return elements[0] || null;
  }
  
  // Розрахунок подібності для кожного елемента
  const scored = elements.map(element => {
    const elementText = element.textContent.trim();
    const similarity = calculateTextSimilarity(elementText, targetText);
    return { element, similarity, text: elementText };
  });
  
  // Сортуємо за подібністю та повертаємо найкращий
  scored.sort((a, b) => b.similarity - a.similarity);
  
  console.log('🎯 Результати подібності:', scored.map(s => ({
    text: s.text,
    similarity: s.similarity
  })));
  
  return scored[0].element;
};

/**
 * Простий алгоритм розрахунку подібності тексту
 */
const calculateTextSimilarity = (text1, text2) => {
  const t1 = text1.toLowerCase().trim();
  const t2 = text2.toLowerCase().trim();
  
  if (t1 === t2) return 1;
  
  const words1 = t1.split(/\s+/);
  const words2 = t2.split(/\s+/);
  
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = Math.max(words1.length, words2.length);
  
  return totalWords > 0 ? commonWords.length / totalWords : 0;
};

export default useComspecSearch;