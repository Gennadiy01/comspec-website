// src/components/search/GlobalSearch.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import searchEngine from './SearchEngine';

const GlobalSearch = ({ isActive, onResultSelect, searchQuery, onSearchChange }) => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [indexStats, setIndexStats] = useState(null);
  const [searchOptions, setSearchOptions] = useState({
    category: null,
    minRelevance: 5,
    exactMatch: false
  });
  
  const searchTimeoutRef = useRef();
  const hasIndexedRef = useRef(false);

  // Винесемо performGlobalSearch в useCallback
  const performGlobalSearch = useCallback((query) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    // Скасовуємо попередній таймер
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Встановлюємо новий таймер (debounce)
    searchTimeoutRef.current = setTimeout(() => {
      setIsLoading(true);
      
      try {
        const searchResults = searchEngine.search(query, searchOptions);
        
        // Групуємо результати по категоріях
        const groupedResults = groupResultsByCategory(searchResults);
        
        setResults(groupedResults);
        
        console.log(`🔍 Знайдено ${searchResults.length} результатів для "${query}"`);
        
      } catch (error) {
        console.error('❌ Помилка пошуку:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, [searchOptions]);

  // Ініціалізація індексу при першому завантаженні
  useEffect(() => {
    if (isActive && !hasIndexedRef.current) {
      initializeIndex();
    }
  }, [isActive]);

  // Виконання пошуку при зміні запиту
  useEffect(() => {
    if (isActive && searchQuery) {
      performGlobalSearch(searchQuery);
    } else {
      setResults([]);
    }
  }, [searchQuery, searchOptions, isActive, performGlobalSearch]);

  // Ініціалізація індексу
  const initializeIndex = async () => {
    if (hasIndexedRef.current) return;
    
    setIsLoading(true);
    hasIndexedRef.current = true; // Встановлюємо прапор одразу
    
    try {
      // Даємо час на рендер сторінки
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('🚀 Ініціалізація глобального пошуку...');
      
      searchEngine.indexContent();
      const stats = searchEngine.getIndexStats();
      
      setIndexStats(stats);
      
      console.log('✅ Глобальний пошук готовий:', stats);
      
    } catch (error) {
      console.error('❌ Помилка ініціалізації пошуку:', error);
      hasIndexedRef.current = false; // Скидаємо прапор при помилці
    } finally {
      setIsLoading(false);
    }
  };

  // Групування результатів по категоріях
  const groupResultsByCategory = (searchResults) => {
    const grouped = {};
    
    searchResults.forEach(result => {
      const category = result.category || 'Інше';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(result);
    });

    // Сортуємо категорії за важливістю
    const categoryOrder = ['Продукція', 'Послуги', 'Головна', 'Про нас', 'Контакти', 'Навігація', 'Інше'];
    
    const sortedGrouped = {};
    categoryOrder.forEach(category => {
      if (grouped[category]) {
        sortedGrouped[category] = grouped[category].slice(0, 5); // Максимум 5 на категорію
      }
    });

    return sortedGrouped;
  };

  // Обробка вибору результату
  const handleResultClick = (result) => {
    console.log('📍 Навігація до:', result);
    
    // Спочатку перевіряємо чи потрібна навігація по роутах
    if (result.url && result.url.startsWith('#')) {
      // Це anchor link, можемо обробити напряму
      const targetElement = document.querySelector(result.url);
      if (targetElement) {
        targetElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }
    
    // Навігуємо до конкретного елемента
    const success = searchEngine.navigateToElement(result);
    
    if (success) {
      // Передаємо результат батьківському компоненту
      onResultSelect(result);
      
      // Зберігаємо в історію пошуку
      saveToSearchHistory(result);
    }
  };

  // Збереження в історію пошуку
  const saveToSearchHistory = (result) => {
    try {
      const history = JSON.parse(localStorage.getItem('comspec_search_history') || '[]');
      const newItem = {
        query: searchQuery,
        result: {
          text: result.text,
          category: result.category,
          url: result.url
        },
        timestamp: Date.now()
      };
      
      // Додаємо в початок та обмежуємо до 20 записів
      const updatedHistory = [newItem, ...history.filter(item => 
        item.result.text !== result.text
      )].slice(0, 20);
      
      localStorage.setItem('comspec_search_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.warn('Не вдалося зберегти історію пошуку:', error);
    }
  };

  // Зміна опцій пошуку
  const handleOptionChange = (option, value) => {
    setSearchOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  // Рендер результатів
  const renderResults = () => {
    if (isLoading) {
      return (
        <div className="global-search-loading">
          <div className="search-spinner"></div>
          <p>Пошук по сайту...</p>
        </div>
      );
    }

    if (!searchQuery || searchQuery.length < 2) {
      return (
        <div className="global-search-info">
          <h4>Глобальний пошук</h4>
          <p>Введіть мінімум 2 символи для пошуку по всьому сайту</p>
          {indexStats && (
            <div className="index-stats">
              <small>
                Проіндексовано: <strong>{indexStats.total}</strong> елементів
              </small>
            </div>
          )}
        </div>
      );
    }

    const totalResults = Object.values(results).reduce((sum, category) => sum + category.length, 0);

    if (totalResults === 0) {
      return (
        <div className="global-search-empty">
          <h4>Нічого не знайдено</h4>
          <p>Спробуйте змінити пошуковий запит або зніміть фільтри</p>
          <button 
            className="btn-reindex"
            onClick={() => {
              hasIndexedRef.current = false;
              initializeIndex();
            }}
          >
            Переіндексувати
          </button>
        </div>
      );
    }

    return (
      <div className="global-search-results">
        <div className="results-header">
          <h4>Результати ({totalResults})</h4>
        </div>
        
        {Object.entries(results).map(([category, categoryResults]) => (
          <div key={category} className="result-category">
            <h5 className="category-title">
              {category} ({categoryResults.length})
            </h5>
            
            <div className="category-results">
              {categoryResults.map((result, index) => (
                <div 
                  key={`${result.id}_${index}`}
                  className="global-result-item"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="result-content">
                    <div className="result-text">
                      {highlightMatch(result.text, searchQuery)}
                    </div>
                    <div className="result-meta">
                      <span className="result-tag">{result.tagName}</span>
                      <span className="result-relevance">
                        {Math.round(result.relevance)}%
                      </span>
                    </div>
                  </div>
                  <div className="result-arrow">→</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Підсвічування співпадінь
  const highlightMatch = (text, query) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="search-highlight-text">{part}</mark> : 
        part
    );
  };

  // Рендер фільтрів
  const renderFilters = () => (
    <div className="global-search-filters">
      <div className="filter-group">
        <label>Категорія:</label>
        <select 
          value={searchOptions.category || ''}
          onChange={(e) => handleOptionChange('category', e.target.value || null)}
        >
          <option value="">Всі категорії</option>
          <option value="Продукція">Продукція</option>
          <option value="Послуги">Послуги</option>
          <option value="Про нас">Про нас</option>
          <option value="Контакти">Контакти</option>
          <option value="Навігація">Навігація</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>
          <input
            type="checkbox"
            checked={searchOptions.exactMatch}
            onChange={(e) => handleOptionChange('exactMatch', e.target.checked)}
          />
          Точне співпадіння
        </label>
      </div>
    </div>
  );

  return (
    <div className="global-search-container">
      {renderFilters()}
      <div className="global-search-content">
        {renderResults()}
      </div>
    </div>
  );
};

export default GlobalSearch;