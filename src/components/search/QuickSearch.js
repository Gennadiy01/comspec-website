// src/components/search/QuickSearch.js + React.memo оптимізація
import React, { useState, useEffect, useCallback, memo } from 'react';
import searchEngineManager from './SearchEngineManager.js';

// Використовуємо SearchEngineManager для централізованого пошуку

const QuickSearch = memo(({ searchQuery, onResultSelect, onSearchChange }) => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Популярні теги для швидкого пошуку (з SearchEngineManager)
  const [popularTags, setPopularTags] = useState([]);

  // Завантаження популярних тегів при ініціалізації
  useEffect(() => {
    const loadPopularTags = async () => {
      try {
        await searchEngineManager.initialize();
        const tags = searchEngineManager.getPopularTags();
        setPopularTags(tags);
      } catch (error) {
        console.error('Помилка завантаження популярних тегів:', error);
        setPopularTags([]);
      }
    };
    
    loadPopularTags();
  }, []);

  // Швидкий пошук через SearchEngineManager
  const performQuickSearch = useCallback(async (query) => {
    if (!query || query.length === 0) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    try {
      // Використовуємо SearchEngineManager для швидкого пошуку
      const searchResults = searchEngineManager.search(query, {
        type: 'quick',
        limit: 10,
        includeContext: true,
        sortBy: 'relevance'
      });

      // Мінімальна затримка для UX
      setTimeout(() => {
        setResults(searchResults);
        setIsLoading(false);
      }, 150);

    } catch (error) {
      console.error('Помилка швидкого пошуку:', error);
      setResults([]);
      setIsLoading(false);
    }
  }, []);

  // Виконання пошуку при зміні запиту
  useEffect(() => {
    if (searchQuery && searchQuery.length > 0) {
      performQuickSearch(searchQuery);
    } else {
      setResults([]);
    }
  }, [searchQuery, performQuickSearch]);

  // Обробка кліку на тег
  const handleTagClick = (tag) => {
    onSearchChange(tag);
  };

  // Обробка вибору результату
  const handleResultClick = (result) => {
    // Навігуємо до секції
    if (result.url) {
      const element = document.querySelector(result.url);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    
    // Передаємо результат батьківському компоненту
    onResultSelect(result);
  };

  // Підсвічування тексту (покращена версія)
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    
    // Якщо результат уже містить HTML підсвічування з SearchEngineManager
    if (text.includes('<mark>')) {
      return <span dangerouslySetInnerHTML={{ __html: text }} />;
    }
    
    // Стандартне підсвічування
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="search-highlight-text">{part}</mark> : 
        part
    );
  };

  return (
    <div className="quick-search-container">
      {/* Популярні теги */}
      {!searchQuery && (
        <div className="search-suggestions">
          <h4>Популярні запити</h4>
          <div className="search-tags">
            {popularTags.map((tag, index) => (
              <button
                key={index}
                className="search-suggestion-tag"
                onClick={() => handleTagClick(tag.text)}
              >
                <span className="tag-text">{tag.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Результати пошуку */}
      {searchQuery && (
        <div className="quick-search-results">
          {isLoading ? (
            <div className="search-loading">
              <div className="search-spinner"></div>
              <p>Швидкий пошук...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="search-results-list">
              <div className="results-header">
                <h4>Швидкі результати ({results.length})</h4>
              </div>
              
              {results.map((result) => (
                <div
                  key={result.id}
                  className="search-result-item quick-result"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="result-content">
                    <div className="result-title">
                      {highlightText(result.title, searchQuery)}
                    </div>
                    <div className="result-description">
                      {highlightText(result.content, searchQuery)}
                    </div>
                    <div className="result-meta">
                      <span className="result-category">{result.category}</span>
                    </div>
                  </div>
                  
                  <div className="result-arrow">→</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="search-no-results">
              <h4>Нічого не знайдено</h4>
              <p>Спробуйте використати інші ключові слова або перейдіть на глобальний пошук</p>
              <div className="no-results-suggestions">
                <p>Популярні запити:</p>
                <div className="suggestion-chips">
                  {popularTags.slice(0, 4).map((tag, index) => (
                    <button
                      key={index}
                      className="suggestion-chip"
                      onClick={() => handleTagClick(tag.text)}
                    >
                      {tag.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Підказка для переходу на глобальний пошук */}
      {searchQuery && searchQuery.length >= 3 && (
        <div className="global-search-hint">
          <p>Для більш детального пошуку перейдіть на вкладку "Глобальний пошук"</p>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Кастомна функція порівняння для memo
  return (
    prevProps.searchQuery === nextProps.searchQuery &&
    prevProps.onResultSelect === nextProps.onResultSelect &&
    prevProps.onSearchChange === nextProps.onSearchChange
  );
});

// Додаємо displayName для кращого дебагу
QuickSearch.displayName = 'QuickSearch';

export default QuickSearch;