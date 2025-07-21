// src/components/search/SearchModal.js - ФІНАЛЬНА ВИПРАВЛЕНА ВЕРСІЯ + React.memo оптимізація
import React, { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderModal } from '../../context/OrderModalContext';
import EnhancedGlobalSearch from './EnhancedGlobalSearch';
import QuickSearch from './QuickSearch';
import { searchDebug, searchDebugWarn } from '../../utils/searchDebugUtils.js';

const SearchModal = memo(({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('suggestions');
  const [searchHistory, setSearchHistory] = useState([]);
  const [placeholder, setPlaceholder] = useState('Введіть ваш запит або оберіть з підказок...');
  
  const searchInputRef = useRef();
  const modalRef = useRef();
  const navigate = useNavigate();
  const { openOrderModal } = useOrderModal();

  // Фокус на інпут при відкритті
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
      
      loadSearchHistory();
      updatePlaceholder();
    }
  }, [isOpen]);

  // Адаптивний плейсхолдер залежно від розміру екрану
  const updatePlaceholder = () => {
    const isSmallMobile = window.innerWidth <= 480;
    
    if (isSmallMobile) {
      setPlaceholder('Введіть запит або оберіть варіант');
    } else {
      setPlaceholder('Введіть ваш запит або оберіть з підказок...');
    }
  };

  // Слухач зміни розміру екрану
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        updatePlaceholder();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Закриття на Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Автоматичний вибір типу пошуку
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setSearchType('suggestions');
    } else if (searchQuery.trim().length >= 2) {
      setSearchType('global');
    }
  }, [searchQuery]);

  // Завантаження історії пошуку
  const loadSearchHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('comspec_search_history') || '[]');
      setSearchHistory(history.slice(0, 5));
    } catch (error) {
      searchDebugWarn('Не вдалося завантажити історію пошуку:', error);
      setSearchHistory([]);
    }
  };

  // ✅ ВИПРАВЛЕНО: Функція визначення цільової сторінки для конкретного результату
  const determineTargetPage = (result) => {
    searchDebug('🎯 Визначення сторінки для конкретного результату:', result);
    
    // Спочатку перевіряємо явно вказані поля
    if (result.page) {
      searchDebug(`✅ Використовуємо вказану сторінку: ${result.page}`);
      return result.page;
    }
    if (result.url) {
      searchDebug(`✅ Використовуємо вказаний URL: ${result.url}`);
      return result.url;
    }
    
    // Визначаємо по типу конкретного результату
    if (result.type) {
      switch (result.type.toLowerCase()) {
        case 'product':
        case 'product-variant':
          searchDebug('📦 Результат - продукт, переходимо на /products');
          return '/products';
        case 'service':
          searchDebug('🔧 Результат - послуга, переходимо на /services');
          return '/services';
        case 'contact':
          searchDebug('📞 Результат - контакт, переходимо на /contacts');
          return '/contacts';
        case 'company':
        case 'mission':
        case 'about':
          searchDebug('ℹ️ Результат - про компанію, переходимо на /about');
          return '/about';
        case 'article':
        case 'blog':
          searchDebug('📰 Результат - стаття, переходимо на /articles');
          return '/articles';
        default:
          searchDebug('🤔 Невизначений тип результату, продовжуємо аналіз');
          break;
      }
    }
    
    // Визначаємо по контексту конкретного результату
    if (result.context) {
      const contextField = typeof result.context === 'object' ? result.context.field : result.context;
      
      switch (contextField?.toLowerCase()) {
        case 'phone':
        case 'email':
        case 'address':
          searchDebug('📱 Результат - контактна інформація, переходимо на /contacts');
          return '/contacts';
        case 'product':
          searchDebug('🏗️ Результат - продукція, переходимо на /products');
          return '/products';
        case 'service':
          searchDebug('⚙️ Результат - послуги, переходимо на /services');
          return '/services';
        default:
          searchDebug('🤔 Невизначений контекст результату, продовжуємо аналіз');
          break;
      }
    }
    
    // Визначаємо по змісту конкретного результату
    const content = (result.title + ' ' + (result.content || '')).toLowerCase();
    
    if (content.includes('щебінь') || content.includes('пісок') || 
        content.includes('бетон') || content.includes('асфальт') ||
        content.includes('матеріал') || content.includes('продукц')) {
      searchDebug('🏗️ За змістом - продукція, переходимо на /products');
      return '/products';
    }
    
    if (content.includes('доставка') || content.includes('послуг') || 
        content.includes('сервіс') || content.includes('оренда') ||
        content.includes('лабораторн') || content.includes('буріння')) {
      searchDebug('🚚 За змістом - послуги, переходимо на /services');
      return '/services';
    }
    
    if (content.includes('телефон') || content.includes('email') || 
        content.includes('адреса') || content.includes('контакт') ||
        content.includes('офіс') || content.includes('зв\'язок') ||
        /\+38|044|067|050|@/.test(content)) {
      searchDebug('📞 За змістом - контакти, переходимо на /contacts');
      return '/contacts';
    }
    
    if (content.includes('компан') || content.includes('про нас') || 
        content.includes('історія') || content.includes('досвід') ||
        content.includes('місія')) {
      searchDebug('ℹ️ За змістом - про нас, переходимо на /about');
      return '/about';
    }
    
    // Залишаємося на поточній сторінці
    searchDebug('🏠 Не вдалося визначити - залишаємося на поточній сторінці');
    return window.location.pathname;
  };

  // ✅ ВИПРАВЛЕНО: Функція навігації з підсвічуванням
  const navigateWithHighlighting = (targetPage, result, searchTerm) => {
    searchDebug('🚀 Навігація з підсвічуванням:', { 
      targetPage, 
      result, 
      searchTerm
    });
    
    // Зберігаємо інформацію для підсвічування після переходу
    const highlightInfo = {
      term: searchTerm,
      result: result,
      targetPage: targetPage,
      timestamp: Date.now()
    };
    
    // Зберігаємо в sessionStorage для використання після переходу
    try {
      sessionStorage.setItem('comspec_highlight_after_navigation', JSON.stringify(highlightInfo));
      searchDebug('💾 Інформація для підсвічування збережена');
    } catch (error) {
      searchDebugWarn('Не вдалося зберегти інформацію для підсвічування:', error);
    }
    
    // Виконуємо навігацію
    searchDebug(`🔄 Навігація на: ${targetPage}`);
    navigate(targetPage);
    
    // Плануємо підсвічування після завантаження нової сторінки
    setTimeout(() => {
      performDelayedHighlighting(result, searchTerm);
    }, 500);
  };

  // ✅ ВИПРАВЛЕНО: Функція відкладеного підсвічування
  const performDelayedHighlighting = (result, searchTerm) => {
    searchDebug('🎨 Виконання відкладеного підсвічування:', { 
      result, 
      searchTerm,
      currentPage: window.location.pathname
    });
    
    // Спробуємо різні методи підсвічування
    const attempts = [
      // Метод 1: Використання SearchHighlighting з точним заголовком
      () => {
        if (window.searchHighlighting && window.searchHighlighting.scrollToElementWithHighlight) {
          // Якщо є елемент - використовуємо його з точним заголовком
          if (result.element) {
            return window.searchHighlighting.scrollToElementWithHighlight(
              null, searchTerm, result.context, result.element, result.title
            );
          }
          
          // Інакше шукаємо по селектору з точним заголовком
          const selector = result.section || result.selector || 'body';
          return window.searchHighlighting.scrollToElementWithHighlight(
            selector, searchTerm, result.context, null, result.title
          );
        }
        return false;
      },
      
      // Метод 2: Пошук і фокус на найкращому результаті
      () => {
        const searchText = result.title || result.content || searchTerm;
        const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, div, span'))
          .filter(el => {
            const text = el.textContent || '';
            return text.toLowerCase().includes(searchText.toLowerCase().substring(0, 30)) && 
                   el.offsetParent !== null;
          })
          .sort((a, b) => {
            // Пріоритет для заголовків
            const aIsHeading = /^H[1-6]$/.test(a.tagName);
            const bIsHeading = /^H[1-6]$/.test(b.tagName);
            if (aIsHeading && !bIsHeading) return -1;
            if (!aIsHeading && bIsHeading) return 1;
            
            // Пріоритет для елементів ближче до початку сторінки
            return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
          });
        
        if (elements.length > 0) {
          const targetElement = elements[0];
          
          // Прокручування до елемента
          targetElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Підсвічування
          if (window.searchHighlighting && window.searchHighlighting.highlightTermInElement) {
            window.searchHighlighting.highlightTermInElement(
              targetElement, searchTerm, result.context
            );
          }
          
          // Візуальний фокус
          targetElement.classList.add('comspec-search-focus');
          setTimeout(() => {
            targetElement.classList.remove('comspec-search-focus');
          }, 3000);
          
          searchDebug('✅ Фокус та підсвічування застосовано до елемента:', targetElement.tagName);
          return true;
        }
        return false;
      },
      
      // Метод 3: Fallback підсвічування
      () => {
        if (window.highlightSearchResults) {
          return window.highlightSearchResults(searchTerm, [result]);
        }
        return false;
      }
    ];
    
    // Спробуємо всі методи по черзі
    for (let i = 0; i < attempts.length; i++) {
      try {
        if (attempts[i]()) {
          searchDebug(`✅ Підсвічування успішне методом ${i + 1}`);
          return true;
        }
      } catch (error) {
        searchDebugWarn(`⚠️ Метод ${i + 1} підсвічування не спрацював:`, error);
      }
    }
    
    searchDebug('⚠️ Жоден метод підсвічування не спрацював');
    return false;
  };

  // Обробка зміни пошукового запиту
  const handleSearchChange = (e) => {
    const value = e.target.value;
    // searchDebug('📝 SearchModal: зміна searchQuery з', searchQuery, 'на', value);
    setSearchQuery(value);
  };

  // Обробка кліку на швидкі теги
  const handleQuickTagClick = (tagText) => {
    // searchDebug('⚡ Клік на швидкий тег:', tagText);
    setSearchQuery(tagText);
    setSearchType('quick');
  };

  // Очищення пошуку
  const clearSearch = () => {
    // searchDebug('🧹 SearchModal: очищення пошуку');
    setSearchQuery('');
    setSearchType('suggestions');
    searchInputRef.current?.focus();
  };

  // ✅ ГОЛОВНЕ ВИПРАВЛЕННЯ: Обробка вибору результату для конкретного результату
  const handleResultSelect = (result) => {
    // searchDebug('🎯 SearchModal: обрано результат:', result);
    
    // Зберігаємо в історію
    saveToSearchHistory(result);
    
    // ✅ Визначаємо сторінку для конкретного результату
    const targetPage = determineTargetPage(result);
    const currentPage = window.location.pathname;
    
    searchDebug('📍 Аналіз навігації:', { 
      from: currentPage, 
      to: targetPage, 
      searchTerm: searchQuery,
      result: result
    });
    
    // Якщо потрібно перейти на іншу сторінку
    if (targetPage !== currentPage && targetPage !== '/' + currentPage.replace('/', '')) {
      searchDebug('🔄 Виконуємо навігацію на нову сторінку:', targetPage);
      
      // Закриваємо модальне вікно ПЕРЕД навігацією
      onClose();
      setSearchQuery('');
      setSearchType('suggestions');
      
      // Виконуємо навігацію з підсвічуванням
      navigateWithHighlighting(targetPage, result, searchQuery);
      
    } else {
      // Залишаємося на поточній сторінці - просто підсвічуємо
      searchDebug('📍 Залишаємося на поточній сторінці, підсвічуємо елемент');
      
      // Спробуємо підсвітити елемент на поточній сторінці
      setTimeout(() => {
        performDelayedHighlighting(result, searchQuery);
      }, 100);
      
      // Закриваємо модальне вікно з затримкою
      setTimeout(() => {
        onClose();
        setSearchQuery('');
        setSearchType('suggestions');
      }, 300);
    }
  };

  // Збереження в історію пошуку
  const saveToSearchHistory = (result) => {
    const historyItem = {
      query: searchQuery,
      result: result,
      timestamp: Date.now()
    };
    
    const newHistory = [historyItem, ...searchHistory.filter(item => 
      item.query !== searchQuery
    )].slice(0, 5);
    
    setSearchHistory(newHistory);
    try {
      localStorage.setItem('comspec_search_history', JSON.stringify(newHistory));
    } catch (error) {
      searchDebugWarn('Помилка збереження історії:', error);
    }
  };

  // Обробка кліку на історію
  const handleHistoryClick = (historyItem) => {
    // searchDebug('📚 SearchModal: клік на історію:', historyItem.query);
    setSearchQuery(historyItem.query);
    setSearchType('global');
  };

  // Очищення історії
  const clearHistory = () => {
    localStorage.removeItem('comspec_search_history');
    setSearchHistory([]);
  };

  // Закриття при кліку поза модальним вікном
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Функція закриття глобального пошуку без негайного закриття модального вікна
  const handleGlobalSearchClose = () => {
    // searchDebug('🔙 SearchModal: закриття глобального пошуку, повертаємося до підказок');
    setSearchQuery('');
    setSearchType('suggestions');
  };

  // Швидкі дії з правильною навігацією
  const quickActionsWithNavigation = [
    { 
      text: 'Каталог продукції', 
      action: () => {
        onClose();
        navigate('/products');
      }
    },
    { 
      text: 'Замовити матеріали', 
      action: () => {
        onClose();
        openOrderModal({
          source: 'search-modal',
          product: ''
        });
      }
    },
    { 
      text: 'Розрахувати вартість', 
      action: () => {
        onClose();
        navigate('/contacts#calculator');
        
        // Додаткова логіка для скролінгу до калькулятора з показом заголовка
        setTimeout(() => {
          const calculatorElement = document.getElementById('calculator');
          if (calculatorElement) {
            // Знаходимо заголовок секції калькулятора всередині секції
            const sectionTitle = calculatorElement.querySelector('h2.section-title');
            
            if (sectionTitle) {
              // Спочатку прокручуємо до секції, щоб заголовок був у DOM
              calculatorElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
              });
              
              // Потім через невеликий час корегуємо позицію для показу заголовка
              setTimeout(() => {
                const elementTop = sectionTitle.getBoundingClientRect().top + window.pageYOffset;
                const offsetTop = Math.max(0, elementTop - 150); // Відступ 150px зверху
                
                window.scrollTo({
                  top: offsetTop,
                  behavior: 'smooth'
                });
              }, 100);
            } else {
              // Fallback: прокручуємо до самої секції
              calculatorElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
              });
            }
          }
        }, 300);
      }
    },
    { 
      text: 'Контакти', 
      action: () => {
        onClose();
        // Очищуємо будь-які якорі та переходимо на початок сторінки контактів
        window.location.hash = '';
        navigate('/contacts');
        
        // Прокручуємо до початку сторінки через невеликий час
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    }
  ];

  // Швидкі теги
  const popularTags = [
    { text: 'щебінь' },
    { text: 'пісок' },
    { text: 'доставка' },
    { text: 'бетон' },
    { text: 'асфальт' },
    { text: 'оренда техніки' },
    { text: 'контакти' },
    { text: 'про нас' }
  ];

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay" onClick={handleBackdropClick}>
      <div className="search-modal-container" ref={modalRef}>
        {/* Заголовок модального вікна */}
        <div className="search-modal-header">
          <div className="search-modal-title">
            <h2>Пошук по сайту</h2>
            <button className="search-modal-close" onClick={onClose}>
              ×
            </button>
          </div>
          
          {/* Поле пошуку */}
          <div className="search-input-container">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-modal-input"
            />
            {searchQuery && (
              <button className="search-clear-btn" onClick={clearSearch}>
                ×
              </button>
            )}
          </div>
        </div>

        {/* ЄДИНИЙ КОНТЕНТ БЕЗ ВКЛАДОК */}
        <div className="search-modal-content">
          
          {/* ПІДКАЗКИ ТА ШВИДКІ ДІЇ (коли немає запиту) */}
          {searchType === 'suggestions' && (
            <div className="search-suggestions-content">
              
              {/* Популярні теги */}
              <div className="search-suggestions">
                <h4>Популярні запити</h4>
                <div className="search-tags">
                  {popularTags.map((tag, index) => (
                    <button
                      key={index}
                      className="search-suggestion-tag"
                      onClick={() => handleQuickTagClick(tag.text)}
                    >
                      <span className="tag-text">{tag.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Історія пошуку */}
              {searchHistory.length > 0 && (
                <div className="search-history">
                  <div className="search-section-header">
                    <h4>Остання історія</h4>
                    <button onClick={clearHistory} className="clear-history-btn">
                      Очистити
                    </button>
                  </div>
                  <div className="history-items">
                    {searchHistory.map((item, index) => (
                      <div 
                        key={index}
                        className="history-item"
                        onClick={() => handleHistoryClick(item)}
                      >
                        <div className="history-content">
                          <span className="history-query">{item.query}</span>
                          <span className="history-result">
                            {item.result.category || item.result.type}: {item.result.title || item.result.text}
                          </span>
                        </div>
                        <span className="history-time">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Швидкі дії */}
              <div className="search-quick-actions">
                <h4>Швидкі дії</h4>
                <div className="quick-actions-grid">
                  {quickActionsWithNavigation.map((action, index) => (
                    <button 
                      key={index}
                      className="quick-action-btn"
                      onClick={action.action}
                    >
                      <span className="action-text">{action.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ШВИДКИЙ ПОШУК */}
          {searchType === 'quick' && (
            <div className="search-quick-content">
              <QuickSearch 
                searchQuery={searchQuery}
                onResultSelect={handleResultSelect}
                onSearchChange={setSearchQuery}
              />
            </div>
          )}

          {/* ГЛОБАЛЬНИЙ ПОШУК - завжди рендериться для React.memo */}
          <div className="search-global-content" style={{
            display: searchType === 'global' ? 'block' : 'none'
          }}>
            <EnhancedGlobalSearch 
              key="enhanced-global-search" 
              isOpen={isOpen && searchType === 'global'}
              onClose={handleGlobalSearchClose}
              onResultSelect={handleResultSelect}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        </div>

        {/* Підказки */}
        <div className="search-modal-footer">
          <div className="search-tips">
            <span className="search-tip">
              <kbd>Enter</kbd> для пошуку
            </span>
            <span className="search-tip">
              <kbd>Esc</kbd> для закриття
            </span>
            {searchType === 'global' && (
              <span className="search-tip">
                ✅ Точна навігація до обраного результату ({searchQuery ? `"${searchQuery}"` : 'очікується запит'})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Кастомна функція порівняння для memo
  return (
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.onClose === nextProps.onClose
  );
});

// Додаємо displayName для кращого дебагу
SearchModal.displayName = 'SearchModal';

export default SearchModal;