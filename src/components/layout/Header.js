import React, { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SearchModal from '../search/SearchModal';
import '../../styles/enhanced-search.css';
import '../../styles/header-search-integration.css';

// Основний компонент Header
const Header = () => {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path || location.hash === `#${path}`;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    // Прибираємо фокус з кнопки бургер-меню
    if (document.activeElement && document.activeElement.classList.contains('burger-menu')) {
      document.activeElement.blur();
    }
  };

  // Обробники для пошукового модального вікна
  const handleOpenSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

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
              {/* Десктопна навігація */}
              <nav className="nav desktop-nav">
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
              
              {/* Нова кнопка пошуку з розширеним функціоналом */}
              <button 
                className="search-button enhanced-search-btn" 
                aria-label="Пошук по сайту"
                onClick={handleOpenSearch}
                title="Натисніть для відкриття розширеного пошуку"
              >
                <svg className="search-icon" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="search-text">Пошук</span>
              </button>
              
              {/* Мобільні елементи управління */}
              <div className="mobile-controls">
                {/* Бургер-меню */}
                <button 
                  className={`burger-menu ${isMobileMenuOpen ? 'active' : ''}`}
                  aria-label="Відкрити меню"
                  onClick={(e) => {
                    if (isMobileMenuOpen) {
                      // Якщо меню відкрите, закриваємо його і прибираємо фокус
                      closeMobileMenu();
                      e.currentTarget.blur();
                    } else {
                      // Якщо меню закрите, відкриваємо його
                      toggleMobileMenu();
                    }
                  }}
                >
                  <span className="burger-line"></span>
                  <span className="burger-line"></span>
                  <span className="burger-line"></span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Нижній блок з контактами - завжди відображається */}
          <div className="header-contacts">
            <div className="phone-section">
              <svg className="phone-icon" viewBox="0 0 24 24" fill="none">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <a href="tel:+380739272700" className="phone">
                073 9 27 27 00
              </a>
            </div>
            
            <div className="social-icons">
              <a href="viber://chat?number=380739272700" className="social-link">
                <svg className="social-icon" viewBox="0 0 52.511 52.511" fill="none">
                  <path d="M31.256,0H21.254C10.778,0,2.255,8.521,2.255,18.995v9.01c0,7.8,4.793,14.81,12,17.665v5.841c0,0.396,0.233,0.754,0.595,0.914c0.13,0.058,0.268,0.086,0.405,0.086c0.243,0,0.484-0.089,0.671-0.259L21.725,47h9.531c10.476,0,18.999-8.521,18.999-18.995v-9.01C50.255,8.521,41.732,0,31.256,0z M48.255,28.005C48.255,37.376,40.63,45,31.256,45h-9.917c-0.248,0-0.487,0.092-0.671,0.259l-4.413,3.997v-4.279c0-0.424-0.267-0.802-0.667-0.942C8.81,41.638,4.255,35.196,4.255,28.005v-9.01C4.255,9.624,11.881,2,21.254,2h10.002c9.374,0,16.999,7.624,16.999,16.995V28.005z" fill="#008080"/>
                  <path d="M39.471,30.493l-6.146-3.992c-0.672-0.437-1.472-0.585-2.255-0.423c-0.784,0.165-1.458,0.628-1.895,1.303l-0.289,0.444c-2.66-0.879-5.593-2.002-7.349-7.085l0.727-0.632h0c1.248-1.085,1.379-2.983,0.294-4.233l-4.808-5.531c-0.362-0.417-0.994-0.46-1.411-0.099l-3.019,2.624c-2.648,2.302-1.411,5.707-1.004,6.826c0.018,0.05,0.04,0.098,0.066,0.145c0.105,0.188,2.612,4.662,6.661,8.786c4.065,4.141,11.404,7.965,11.629,8.076c0.838,0.544,1.781,0.805,2.714,0.805c1.638,0,3.244-0.803,4.202-2.275l2.178-3.354C40.066,31.413,39.934,30.794,39.471,30.493z M35.91,34.142c-0.901,1.388-2.763,1.782-4.233,0.834c-0.073-0.038-7.364-3.835-11.207-7.75c-3.592-3.659-5.977-7.724-6.302-8.291c-0.792-2.221-0.652-3.586,0.464-4.556l2.265-1.968l4.152,4.776c0.369,0.424,0.326,1.044-0.096,1.411l-1.227,1.066c-0.299,0.26-0.417,0.671-0.3,1.049c2.092,6.798,6.16,8.133,9.13,9.108l0.433,0.143c0.433,0.146,0.907-0.021,1.155-0.403l0.709-1.092c0.146-0.226,0.37-0.379,0.63-0.434c0.261-0.056,0.527-0.004,0.753,0.143l5.308,3.447L35.91,34.142z" fill="#008080"/>
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

          {/* Мобільне меню */}
          <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            <nav className="mobile-nav">
              <Link 
                to="/" 
                className={isActive('/') ? 'active' : ''}
                onClick={closeMobileMenu}
              >
                Головна
              </Link>
              <Link 
                to="/products" 
                className={isActive('/products') ? 'active' : ''}
                onClick={closeMobileMenu}
              >
                Продукція
              </Link>
              <Link 
                to="/services" 
                className={isActive('/services') ? 'active' : ''}
                onClick={closeMobileMenu}
              >
                Послуги
              </Link>
              <Link 
                to="/about" 
                className={isActive('/about') ? 'active' : ''}
                onClick={closeMobileMenu}
              >
                Про нас
              </Link>
              <Link 
                to="/contacts" 
                className={isActive('/contacts') ? 'active' : ''}
                onClick={closeMobileMenu}
              >
                Контакти
              </Link>
              <Link 
                to="/articles" 
                className={isActive('/articles') ? 'active' : ''}
                onClick={closeMobileMenu}
              >
                Статті
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Нове модальне вікно пошуку */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={handleCloseSearch} 
      />
    </>
  );
};

export default Header;