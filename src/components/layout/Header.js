import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/search.css';

// Тимчасові дані для пошуку (потім замініть на реальні дані з вашого API)
const siteData = [
  {
    id: 1,
    title: 'Щебінь',
    content: 'Гранітний та вапняковий щебінь різних фракцій. Сертифікована якість для будь-яких робіт.',
    category: 'Продукція',
    url: '/products/gravel',
    keywords: ['щебінь', 'граніт', 'вапняк', 'фракції', 'будівництво']
  },
  {
    id: 2,
    title: 'Пісок',
    content: 'Річковий та кар\'єрний пісок. Митий та немитий. Ідеально підходить для бетону та розчинів.',
    category: 'Продукція',
    url: '/products/sand',
    keywords: ['пісок', 'річковий', 'кар\'єрний', 'бетон', 'розчин']
  },
  {
    id: 3,
    title: 'Асфальт',
    content: 'Асфальтобетонні суміші для доріг та майданчиків. Довговічність та стійкість до навантажень.',
    category: 'Продукція',
    url: '/products/asphalt',
    keywords: ['асфальт', 'дороги', 'майданчики', 'довговічність']
  },
  {
    id: 4,
    title: 'Бетон',
    content: 'Товарний бетон усіх марок. Доставка міксерами. Лабораторний контроль кожної партії.',
    category: 'Продукція',
    url: '/products/concrete',
    keywords: ['бетон', 'товарний', 'міксери', 'лабораторний контроль']
  },
  {
    id: 5,
    title: 'Доставка матеріалів',
    content: 'Оперативна доставка будівельних матеріалів власним автопарком. Залізничні перевезення для великих обсягів.',
    category: 'Послуги',
    url: '/services/delivery',
    keywords: ['доставка', 'автопарк', 'залізничні перевезення', 'логістика']
  },
  {
    id: 6,
    title: 'Розробка кар\'єрів',
    content: 'Професійні послуги з розробки та експлуатації кар\'єрів. Сучасна техніка та досвідчені фахівці.',
    category: 'Послуги',
    url: '/services/quarry',
    keywords: ['кар\'єр', 'розробка', 'експлуатація', 'техніка', 'фахівці']
  },
  {
    id: 7,
    title: 'Оренда спецтехніки',
    content: 'Екскаватори, навантажувачі, самоскиди та інша техніка для ваших проєктів. З водієм або без.',
    category: 'Послуги',
    url: '/services/rental',
    keywords: ['оренда', 'екскаватори', 'навантажувачі', 'самоскиди', 'спецтехніка']
  },
  {
    id: 8,
    title: 'Лабораторний контроль',
    content: 'Власна лабораторія для контролю якості продукції. Сертифікація та паспорти якості на кожну партію.',
    category: 'Послуги',
    url: '/services/laboratory',
    keywords: ['лабораторія', 'контроль якості', 'сертифікація', 'паспорти якості']
  },
  {
    id: 9,
    title: 'Про COMSPEC',
    content: 'COMSPEC об\'єднує кращих експертів галузі, щоб забезпечити комплексні будівельні рішення від кар\'єру до вашого об\'єкта.',
    category: 'Про нас',
    url: '/about',
    keywords: ['експерти', 'комплексні рішення', 'будівельні', 'досвід', 'партнери']
  },
  {
    id: 10,
    title: 'Контакти',
    content: 'Зв\'яжіться з нами для отримання консультації та розрахунку вартості матеріалів.',
    category: 'Контакти',
    url: '/contacts',
    keywords: ['контакти', 'консультація', 'розрахунок', 'вартість']
  }
];

// Компонент модального вікна пошуку
const SearchModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchInputRef = useRef(null);

  // Функція пошуку
  const performSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    
    // Симуляція затримки пошуку
    setTimeout(() => {
      const lowercaseQuery = query.toLowerCase();
      const results = siteData.filter(item => {
        return (
          item.title.toLowerCase().includes(lowercaseQuery) ||
          item.content.toLowerCase().includes(lowercaseQuery) ||
          item.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
        );
      });

      setSearchResults(results);
      setIsSearching(false);
      setHasSearched(true);
    }, 300);
  };

  // Обробка введення в поле пошуку
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    performSearch(value);
  };

  // Виділення знайденого тексту
  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => (
      regex.test(part) ? (
        <mark key={index}>
          {part}
        </mark>
      ) : part
    ));
  };

  // Закриття модального вікна
  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    onClose();
  };

  // Обробка натискання Escape
/* eslint-disable react-hooks/exhaustive-deps */
useEffect(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (isOpen) {
    document.addEventListener('keydown', handleEscape);
    searchInputRef.current?.focus();
  }

  return () => {
    document.removeEventListener('keydown', handleEscape);
  };
}, [isOpen]);
/* eslint-enable react-hooks/exhaustive-deps */
  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay" onClick={handleClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header пошукового модального вікна */}
        <div className="search-modal-header">
          <div className="search-input-container">
            <svg className="search-input-icon" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Введіть запит для пошуку..."
              value={searchQuery}
              onChange={handleInputChange}
              className="search-input"
            />
            
            <button onClick={handleClose} className="search-close-btn">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Тіло модального вікна */}
        <div className="search-modal-body">
          {/* Стан завантаження */}
          {isSearching && (
            <div className="search-loading">
              <div className="search-spinner"></div>
              <span>Пошук...</span>
            </div>
          )}

          {/* Відсутність результатів */}
          {!isSearching && hasSearched && searchResults.length === 0 && (
            <div className="search-no-results">
              <svg className="no-results-icon" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="11" y1="8" x2="11" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="11" y1="16" x2="11" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <h3>Нічого не знайдено</h3>
              <p>Спробуйте змінити запит або використайте інші ключові слова</p>
            </div>
          )}

          {/* Результати пошуку */}
          {!isSearching && searchResults.length > 0 && (
            <div>
              <div className="search-results-header">
                <span>Знайдено результатів: {searchResults.length}</span>
              </div>
              
              {searchResults.map((result) => (
                <div key={result.id} className="search-result-item">
                  <div className="search-result-category">
                    {result.category}
                  </div>
                  
                  <h3 className="search-result-title">
                    {highlightText(result.title, searchQuery)}
                  </h3>
                  
                  <p className="search-result-content">
                    {highlightText(result.content, searchQuery)}
                  </p>
                  
                  <Link 
                    to={result.url} 
                    className="search-result-link"
                    onClick={handleClose}
                  >
                    Перейти до сторінки →
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Початковий стан - популярні запити */}
          {!hasSearched && !isSearching && (
            <div className="search-suggestions">
              <h3>Популярні запити:</h3>
              <div className="search-suggestion-tags">
                {['щебінь', 'пісок', 'доставка', 'бетон', 'асфальт', 'оренда техніки'].map((suggestion) => (
                  <button
                    key={suggestion}
                    className="search-suggestion-tag"
                    onClick={() => {
                      setSearchQuery(suggestion);
                      performSearch(suggestion);
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Основний компонент Header
const Header = () => {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path || location.hash === `#${path}`;
  };

  return (
    <>
      <header className="header">
        <div className="container">
          {/* Основний блок header */}
          <div className="header-main">
            <Link to="/" className="logo-link">
              <img 
                src={process.env.PUBLIC_URL + '/images/logo.svg'} 
                alt="COMSPEC" 
                className="logo"
              />
            </Link>
            
            <div className="nav-section">
              <nav className="nav">
                <Link 
                  to="/" 
                  className={isActive('/') ? 'active' : ''}
                >
                  Головна
                </Link>
                <Link 
                  to="/products" 
                  className={isActive('/products') ? 'active' : ''}
                >
                  Продукція
                </Link>
                <Link 
                  to="/services" 
                  className={isActive('/services') ? 'active' : ''}
                >
                  Послуги
                </Link>
                <Link 
                  to="/about" 
                  className={isActive('/about') ? 'active' : ''}
                >
                  Про нас
                </Link>
                <Link 
                  to="/contacts" 
                  className={isActive('/contacts') ? 'active' : ''}
                >
                  Контакти
                </Link>
                <Link 
                  to="/articles" 
                  className={isActive('/articles') ? 'active' : ''}
                >
                  Статті
                </Link>
              </nav>
              
              <button 
                className="search-button" 
                aria-label="Пошук по сайту"
                onClick={() => setIsSearchOpen(true)}
              >
                <svg className="search-icon" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Нижній блок з контактами */}
          <div className="header-contacts">
            <div className="phone-section">
              <svg className="phone-icon" viewBox="0 0 24 24" fill="none">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <a href="tel:+380739272700" className="phone">
                073 927 27 00
              </a>
            </div>
            
            <div className="social-icons">
              <a href="viber://chat?number=380739272700" className="social-link">
                <svg className="social-icon" viewBox="0 0 52.511 52.511" fill="none">
                  <path d="M31.256,0H21.254C10.778,0,2.255,8.521,2.255,18.995v9.01c0,7.8,4.793,14.81,12,17.665v5.841
                    c0,0.396,0.233,0.754,0.595,0.914c0.13,0.058,0.268,0.086,0.405,0.086c0.243,0,0.484-0.089,0.671-0.259L21.725,47h9.531
                    c10.476,0,18.999-8.521,18.999-18.995v-9.01C50.255,8.521,41.732,0,31.256,0z M48.255,28.005C48.255,37.376,40.63,45,31.256,45
                    h-9.917c-0.248,0-0.487,0.092-0.671,0.259l-4.413,3.997v-4.279c0-0.424-0.267-0.802-0.667-0.942
                    C8.81,41.638,4.255,35.196,4.255,28.005v-9.01C4.255,9.624,11.881,2,21.254,2h10.002c9.374,0,16.999,7.624,16.999,16.995V28.005z" 
                    fill="#008080"/>
                  <path d="M39.471,30.493l-6.146-3.992c-0.672-0.437-1.472-0.585-2.255-0.423c-0.784,0.165-1.458,0.628-1.895,1.303l-0.289,0.444
                    c-2.66-0.879-5.593-2.002-7.349-7.085l0.727-0.632h0c1.248-1.085,1.379-2.983,0.294-4.233l-4.808-5.531
                    c-0.362-0.417-0.994-0.46-1.411-0.099l-3.019,2.624c-2.648,2.302-1.411,5.707-1.004,6.826c0.018,0.05,0.04,0.098,0.066,0.145
                    c0.105,0.188,2.612,4.662,6.661,8.786c4.065,4.141,11.404,7.965,11.629,8.076c0.838,0.544,1.781,0.805,2.714,0.805
                    c1.638,0,3.244-0.803,4.202-2.275l2.178-3.354C40.066,31.413,39.934,30.794,39.471,30.493z M35.91,34.142
                    c-0.901,1.388-2.763,1.782-4.233,0.834c-0.073-0.038-7.364-3.835-11.207-7.75c-3.592-3.659-5.977-7.724-6.302-8.291
                    c-0.792-2.221-0.652-3.586,0.464-4.556l2.265-1.968l4.152,4.776c0.369,0.424,0.326,1.044-0.096,1.411l-1.227,1.066
                    c-0.299,0.26-0.417,0.671-0.3,1.049c2.092,6.798,6.16,8.133,9.13,9.108l0.433,0.143c0.433,0.146,0.907-0.021,1.155-0.403
                    l0.709-1.092c0.146-0.226,0.37-0.379,0.63-0.434c0.261-0.056,0.527-0.004,0.753,0.143l5.308,3.447L35.91,34.142z" 
                    fill="#008080"/>
                </svg>
                <span>Viber</span>
              </a>
              
              <a href="https://t.me/comspec_ua" className="social-link">
                <svg className="social-icon" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M18 8L5 12.5L9.5 14M18 8L9.5 14M18 8L14 18.5L9.5 14" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Telegram</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Модальне вікно пошуку */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
};

export default Header;