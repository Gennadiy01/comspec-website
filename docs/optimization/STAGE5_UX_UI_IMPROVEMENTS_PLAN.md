# 🎨 ЕТАП 5: ПЛАН ПОКРАЩЕНЬ UX/UI ПОШУКОВОЇ СИСТЕМИ

**📅 Дата створення:** 20.07.2025  
**🎯 Статус:** Аналіз завершено, готово до реалізації  
**⏱️ Очікуваний час виконання:** 4 тижні  
**👥 Команда:** Frontend розробка + UX/UI дизайн  

---

## 📊 РЕЗУЛЬТАТИ АНАЛІЗУ ПОТОЧНОГО СТАНУ

### ✅ **Сильні сторони системи:**

#### **1. Функціональна досконалість**
- 🎯 **Точність пошуку**: >95% релевантних результатів
- ⚡ **Швидкість**: <50ms середній час (0.4ms з кешем)
- 🗄️ **Кешування**: прискорення у 10+ разів для повторних запитів
- 🎨 **Підсвічування**: точне підсвічування обраних результатів

#### **2. Технічна оптимізація**
- ⚛️ **React.memo**: правильні порівняння, без зайвих ререндерів
- 🔄 **Debouncing**: оптимізація пошукових запитів (300ms)
- 📱 **Responsiveness**: швидкий відгук інтерфейсу
- 🧹 **Memory management**: відсутність витоків пам'яті

#### **3. Сучасний дизайн**
- 🎭 **Анімації**: backdrop-filter, cubic-bezier переходи
- 🌙 **Темна тема**: підтримка `prefers-color-scheme: dark`
- 📱 **Адаптивність**: детальні медіа-запити (768px, 480px)
- 🎨 **Візуальна ієрархія**: консистентна кольорова схема

### ❌ **Критичні проблеми для вирішення:**

#### **1. Accessibility (КРИТИЧНО)**
- ❌ **ARIA live regions**: відсутні оголошення результатів для screen readers
- ❌ **prefers-reduced-motion**: немає підтримки для користувачів з епілепсією
- ❌ **Keyboard navigation**: неповна підтримка стрілок та Enter
- ❌ **Skip links**: відсутні швидкі переходи
- ❌ **Landmark roles**: немає структурної семантики
- ❌ **Focus management**: не всі інтерактивні елементи accessible

#### **2. Код та архітектура (СЕРЕДНЬО)**
- ⚠️ **Дублювання CSS**: 1315+ рядків з повтореннями у файлах
- ⚠️ **Великі компоненти**: SearchModal.js (658 рядків), EnhancedGlobalSearch.js (1041+ рядків)
- ⚠️ **Console.log**: залишки debug коду в продакшн
- ⚠️ **Bundle size**: відсутність code splitting

#### **3. UX покращення (СЕРЕДНЬО)**
- ⚠️ **Прогресивне завантаження**: немає індикаторів прогресу
- ⚠️ **Статистика пошуку**: відсутність часу та метрик
- ⚠️ **Voice search**: немає голосового пошуку
- ⚠️ **Auto-suggestions**: тільки локальні дані
- ⚠️ **Персоналізація**: немає користувацьких налаштувань

---

## 🚀 ДЕТАЛЬНИЙ ПЛАН ПОКРАЩЕНЬ

### **ФАЗА 1: КРИТИЧНІ ACCESSIBILITY ВИПРАВЛЕННЯ** ⭐ **НАЙВИЩИЙ ПРІОРИТЕТ**

#### **1.1 ARIA атрибути та семантика**

**Файли для редагування:**
- `src/components/search/SearchModal.js`
- `src/components/search/EnhancedGlobalSearch.js`

**Зміни:**
```javascript
// Додати до SearchModal.js:
<div 
  role="dialog" 
  aria-labelledby="search-title"
  aria-describedby="search-description"
  aria-live="polite"
  aria-modal="true"
>
  <h2 id="search-title">Пошук по сайту</h2>
  <div id="search-description" className="sr-only">
    Використовуйте це поле для пошуку контенту на сайті. 
    Навігація: стрілки вгору/вниз, Enter для вибору, Escape для закриття.
  </div>
  
  {/* Live region для оголошення результатів */}
  <div 
    aria-live="polite" 
    aria-atomic="true" 
    className="sr-only"
    id="search-status"
  >
    {searchResults.length > 0 && 
      `Знайдено ${searchResults.length} результатів для "${searchQuery}"`
    }
    {isSearching && "Виконується пошук..."}
    {hasSearched && searchResults.length === 0 && "Результатів не знайдено"}
  </div>
</div>

// Додати до поля вводу:
<input
  ref={searchInputRef}
  type="text"
  role="searchbox"
  aria-label="Поле пошуку"
  aria-describedby="search-description search-status"
  aria-expanded={searchResults.length > 0}
  aria-autocomplete="list"
  aria-controls="search-results"
  // ... інші props
/>

// Додати до списку результатів:
<div 
  id="search-results"
  role="listbox"
  aria-labelledby="search-title"
>
  {searchResults.map((result, index) => (
    <div
      key={result.id}
      role="option"
      aria-selected={focusedIndex === index}
      tabIndex={focusedIndex === index ? 0 : -1}
      id={`search-result-${index}`}
    >
      {/* контент результату */}
    </div>
  ))}
</div>
```

**CSS додатки:**
```css
/* Додати до enhanced-search.css */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus indicators */
.search-result-item:focus,
.search-suggestion-tag:focus,
.quick-action-btn:focus {
  outline: 3px solid var(--search-primary);
  outline-offset: 2px;
}
```

#### **1.2 Reduced Motion підтримка**

**Файл:** `src/styles/enhanced-search.css`

```css
/* Додати в кінець файлу: */
@media (prefers-reduced-motion: reduce) {
  /* Відключення всіх анімацій */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  /* Специфічні елементи пошуку */
  .search-modal-overlay,
  .search-modal-container,
  .search-result-item,
  .search-suggestion-tag,
  .search-modal-close {
    animation: none !important;
    transition: none !important;
  }
  
  .search-modal-close:hover {
    transform: none !important;
  }
  
  /* Залишити тільки opacity для accessibility */
  .search-modal-overlay {
    transition: opacity 0.15s ease !important;
  }
}
```

#### **1.3 Покращена клавіатурна навігація**

**Файл:** `src/components/search/SearchModal.js`

```javascript
// Додати стейт для фокусу:
const [focusedIndex, setFocusedIndex] = useState(-1);
const [navigableItems, setNavigableItems] = useState([]);

// Функції навігації:
const focusNextResult = () => {
  setFocusedIndex(prev => 
    prev < navigableItems.length - 1 ? prev + 1 : 0
  );
};

const focusPrevResult = () => {
  setFocusedIndex(prev => 
    prev > 0 ? prev - 1 : navigableItems.length - 1
  );
};

const selectFocusedResult = () => {
  if (focusedIndex >= 0 && navigableItems[focusedIndex]) {
    handleResultSelect(navigableItems[focusedIndex]);
  }
};

// Обробник клавіш:
const handleKeyDown = useCallback((e) => {
  switch(e.key) {
    case 'ArrowDown':
      e.preventDefault();
      focusNextResult();
      break;
    case 'ArrowUp':
      e.preventDefault();
      focusPrevResult();
      break;
    case 'Enter':
      if (focusedIndex >= 0) {
        e.preventDefault();
        selectFocusedResult();
      }
      break;
    case 'Escape':
      e.preventDefault();
      onClose();
      break;
    case 'Tab':
      // Дозволити природну Tab навігацію, але контролювати focus trap
      handleTabNavigation(e);
      break;
  }
}, [focusedIndex, navigableItems]);

// Focus trap для модального вікна:
const handleTabNavigation = (e) => {
  const focusableElements = modalRef.current?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (!focusableElements?.length) return;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  if (e.shiftKey && document.activeElement === firstElement) {
    e.preventDefault();
    lastElement.focus();
  } else if (!e.shiftKey && document.activeElement === lastElement) {
    e.preventDefault();
    firstElement.focus();
  }
};
```

#### **1.4 Skip Links та Landmarks**

**Файл:** `src/components/search/SearchModal.js`

```javascript
// Додати на початок модального вікна:
<div className="skip-links">
  <a href="#search-input" className="skip-link">
    Перейти до поля пошуку
  </a>
  <a href="#search-results" className="skip-link">
    Перейти до результатів
  </a>
  <a href="#search-actions" className="skip-link">
    Перейти до швидких дій
  </a>
</div>

<main role="main" aria-labelledby="search-title">
  <header role="banner">
    {/* header контент */}
  </header>
  
  <section role="search" aria-labelledby="search-title">
    {/* поле пошуку */}
  </section>
  
  <section role="region" aria-labelledby="results-heading">
    <h3 id="results-heading" className="sr-only">Результати пошуку</h3>
    {/* результати */}
  </section>
  
  <aside role="complementary" id="search-actions">
    {/* швидкі дії та історія */}
  </aside>
</main>
```

**CSS для skip links:**
```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--search-primary);
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 9999;
  transition: top 0.3s ease;
}

.skip-link:focus {
  top: 6px;
}
```

---

### **ФАЗА 2: ПОКРАЩЕННЯ АНІМАЦІЙ ТА ПРОГРЕСУ**

#### **2.1 Прогресивне завантаження результатів**

**Файл:** `src/components/search/EnhancedGlobalSearch.js`

```javascript
// Додати стейт для прогресу:
const [loadingProgress, setLoadingProgress] = useState(0);
const [loadingStage, setLoadingStage] = useState('');

const performSearchWithProgress = async (query) => {
  setLoadingProgress(0);
  setLoadingStage('Ініціалізація пошуку...');
  
  // Етап 1: Підготовка
  setLoadingProgress(20);
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Етап 2: Пошук в індексі
  setLoadingStage('Пошук в базі даних...');
  setLoadingProgress(40);
  const results = await searchEngine.search(query);
  
  // Етап 3: Обробка результатів
  setLoadingStage('Обробка результатів...');
  setLoadingProgress(70);
  const processedResults = await processSearchResults(results);
  
  // Етап 4: Підсвічування
  setLoadingStage('Підготовка відображення...');
  setLoadingProgress(90);
  await prepareHighlighting(processedResults, query);
  
  // Завершення
  setLoadingStage('Готово!');
  setLoadingProgress(100);
  
  setTimeout(() => {
    setLoadingProgress(0);
    setLoadingStage('');
  }, 500);
  
  return processedResults;
};

// UI компонент прогрес-бару:
const SearchProgressBar = ({ progress, stage }) => (
  <div className="search-progress-container" aria-hidden="true">
    <div className="search-progress-bar">
      <div 
        className="search-progress-fill" 
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`Прогрес пошуку: ${progress}%`}
      />
    </div>
    {stage && (
      <div className="search-progress-stage">
        {stage}
      </div>
    )}
  </div>
);
```

**CSS для прогрес-бару:**
```css
.search-progress-container {
  margin: 10px 0;
  padding: 0 5px;
}

.search-progress-bar {
  width: 100%;
  height: 4px;
  background: var(--search-border);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.search-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--search-primary), var(--search-accent));
  border-radius: 2px;
  transition: width 0.3s ease;
  position: relative;
}

.search-progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: searchProgressShimmer 1.5s infinite;
}

.search-progress-stage {
  font-size: 0.8rem;
  color: var(--search-text-light);
  margin-top: 4px;
  text-align: center;
  min-height: 20px;
}

@keyframes searchProgressShimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@media (prefers-reduced-motion: reduce) {
  .search-progress-fill::after {
    animation: none;
  }
}
```

#### **2.2 Статистика пошуку**

**Файл:** `src/components/search/SearchModal.js`

```javascript
// Додати стейт для статистики:
const [searchStats, setSearchStats] = useState({
  searchTime: 0,
  totalResults: 0,
  relevanceScore: 0,
  cacheHit: false
});

// Функція розрахунку статистики:
const calculateSearchStats = (results, startTime, fromCache = false) => {
  const searchTime = Date.now() - startTime;
  const relevanceScore = Math.round(
    results.reduce((sum, result) => sum + (result.relevance || 0), 0) / results.length
  );
  
  setSearchStats({
    searchTime,
    totalResults: results.length,
    relevanceScore: Math.min(relevanceScore, 100),
    cacheHit: fromCache
  });
};

// UI компонент статистики:
const SearchStats = ({ stats }) => (
  <div className="search-stats" role="status" aria-live="polite">
    <span className="stat-item">
      <span className="stat-icon">⏱️</span>
      <span className="stat-value">{stats.searchTime}мс</span>
    </span>
    
    <span className="stat-separator">•</span>
    
    <span className="stat-item">
      <span className="stat-icon">📊</span>
      <span className="stat-value">{stats.totalResults} результатів</span>
    </span>
    
    <span className="stat-separator">•</span>
    
    <span className="stat-item">
      <span className="stat-icon">🎯</span>
      <span className="stat-value">Релевантність: {stats.relevanceScore}%</span>
    </span>
    
    {stats.cacheHit && (
      <>
        <span className="stat-separator">•</span>
        <span className="stat-item cache-hit">
          <span className="stat-icon">⚡</span>
          <span className="stat-value">Кеш</span>
        </span>
      </>
    )}
  </div>
);
```

**CSS для статистики:**
```css
.search-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--search-bg-light);
  border-radius: var(--search-radius-small);
  font-size: 0.8rem;
  color: var(--search-text-light);
  margin-top: 12px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  font-size: 0.9em;
  opacity: 0.8;
}

.stat-value {
  font-weight: 500;
}

.stat-separator {
  color: var(--search-border);
  font-weight: bold;
}

.cache-hit {
  color: var(--search-primary);
  font-weight: 600;
}

.cache-hit .stat-icon {
  animation: cachePulse 1s ease-in-out;
}

@keyframes cachePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@media (max-width: 480px) {
  .search-stats {
    font-size: 0.75rem;
    gap: 6px;
    padding: 6px 12px;
  }
  
  .stat-item {
    gap: 2px;
  }
}
```

#### **2.3 Stagger анімації для результатів**

**CSS анімації:** `src/styles/enhanced-search.css`

```css
/* Stagger анімація для результатів */
.search-result-item {
  opacity: 0;
  transform: translateY(20px);
  animation: searchResultSlideIn 0.4s ease forwards;
  animation-delay: calc(var(--item-index, 0) * 0.05s);
}

.search-result-item:nth-child(1) { --item-index: 0; }
.search-result-item:nth-child(2) { --item-index: 1; }
.search-result-item:nth-child(3) { --item-index: 2; }
.search-result-item:nth-child(4) { --item-index: 3; }
.search-result-item:nth-child(5) { --item-index: 4; }
.search-result-item:nth-child(6) { --item-index: 5; }
.search-result-item:nth-child(7) { --item-index: 6; }
.search-result-item:nth-child(8) { --item-index: 7; }
.search-result-item:nth-child(9) { --item-index: 8; }
.search-result-item:nth-child(10) { --item-index: 9; }

@keyframes searchResultSlideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Skeleton loading для результатів */
.search-loading-skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-item {
  background: linear-gradient(90deg, 
    var(--search-bg-light) 25%, 
    var(--search-border) 50%, 
    var(--search-bg-light) 75%
  );
  background-size: 200% 100%;
  animation: skeletonPulse 1.5s infinite;
  border-radius: var(--search-radius-small);
}

.skeleton-title {
  height: 20px;
  width: 70%;
  margin-bottom: 8px;
}

.skeleton-content {
  height: 14px;
  width: 90%;
  margin-bottom: 4px;
}

.skeleton-content:last-child {
  width: 60%;
}

@keyframes skeletonPulse {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Покращені hover ефекти */
.search-result-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-result-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 128, 128, 0.15);
}

.search-result-item:hover .result-arrow {
  transform: translateX(4px);
}

/* Micro-animations для інтерактивних елементів */
.search-suggestion-tag {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-suggestion-tag:hover {
  transform: scale(1.05);
}

.search-suggestion-tag:active {
  transform: scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .search-result-item,
  .skeleton-item,
  .search-suggestion-tag {
    animation: none !important;
    transition: opacity 0.15s ease !important;
  }
  
  .search-result-item:hover,
  .search-suggestion-tag:hover {
    transform: none !important;
  }
}
```

---

### **ФАЗА 3: ДОДАТКОВІ UX ФІЧІ**

#### **3.1 Voice Search інтеграція**

**Новий файл:** `src/components/search/VoiceSearch.js`

```javascript
import React, { useState, useEffect, useCallback } from 'react';

const VoiceSearch = ({ onVoiceResult, isOpen }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  const [recognition, setRecognition] = useState(null);

  // Перевірка підтримки
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'uk-UA';
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
        setError(null);
      };
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onVoiceResult(transcript);
        setIsListening(false);
      };
      
      recognitionInstance.onerror = (event) => {
        setError(getErrorMessage(event.error));
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, [onVoiceResult]);

  const getErrorMessage = (error) => {
    switch(error) {
      case 'no-speech':
        return 'Голос не розпізнано. Спробуйте ще раз.';
      case 'audio-capture':
        return 'Мікрофон недоступний.';
      case 'not-allowed':
        return 'Доступ до мікрофона заборонено.';
      default:
        return 'Помилка розпізнавання голосу.';
    }
  };

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      recognition.start();
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
    }
  }, [recognition, isListening]);

  if (!isSupported) {
    return null; // Graceful degradation
  }

  return (
    <div className="voice-search">
      <button
        className={`voice-search-btn ${isListening ? 'listening' : ''}`}
        onClick={isListening ? stopListening : startListening}
        aria-label={isListening ? 'Зупинити голосовий пошук' : 'Розпочати голосовий пошук'}
        title={isListening ? 'Слухаю...' : 'Голосовий пошук'}
        disabled={!isOpen}
      >
        <svg 
          className="voice-icon" 
          viewBox="0 0 24 24" 
          fill="none"
          aria-hidden="true"
        >
          {isListening ? (
            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2"/>
          ) : (
            <path 
              d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" 
              stroke="currentColor" 
              strokeWidth="2"
            />
          )}
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2"/>
          <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2"/>
          <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2"/>
        </svg>
        
        {isListening && (
          <div className="voice-pulse-indicator" aria-hidden="true">
            <div className="pulse-ring"></div>
            <div className="pulse-ring"></div>
            <div className="pulse-ring"></div>
          </div>
        )}
      </button>
      
      {error && (
        <div className="voice-error" role="alert">
          {error}
        </div>
      )}
      
      {isListening && (
        <div className="voice-status" role="status" aria-live="polite">
          Слухаю... Говоріть зараз
        </div>
      )}
    </div>
  );
};

export default VoiceSearch;
```

**CSS для Voice Search:**
```css
.voice-search {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.voice-search-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: var(--search-bg-light);
  color: var(--search-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.voice-search-btn:hover:not(:disabled) {
  background: var(--search-primary-light);
  color: var(--search-primary);
  transform: scale(1.05);
}

.voice-search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.voice-search-btn.listening {
  background: var(--search-primary);
  color: white;
  animation: voicePulse 1.5s infinite;
}

.voice-icon {
  width: 20px;
  height: 20px;
  z-index: 2;
}

.voice-pulse-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.pulse-ring {
  position: absolute;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: voiceRipple 1.5s infinite;
}

.pulse-ring:nth-child(1) {
  width: 44px;
  height: 44px;
  animation-delay: 0s;
}

.pulse-ring:nth-child(2) {
  width: 60px;
  height: 60px;
  animation-delay: 0.5s;
}

.pulse-ring:nth-child(3) {
  width: 76px;
  height: 76px;
  animation-delay: 1s;
}

.voice-error,
.voice-status {
  font-size: 0.8rem;
  text-align: center;
  padding: 4px 8px;
  border-radius: var(--search-radius-small);
  max-width: 200px;
}

.voice-error {
  color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
}

.voice-status {
  color: var(--search-primary);
  background: var(--search-primary-light);
}

@keyframes voicePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes voiceRipple {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .voice-search-btn.listening,
  .pulse-ring {
    animation: none !important;
  }
  
  .voice-search-btn:hover {
    transform: none !important;
  }
}
```

#### **3.2 Server-side автокомпліт**

**Файл:** `src/hooks/useAutocomplete.js`

```javascript
import { useState, useEffect, useMemo } from 'react';

const useAutocomplete = (query, delay = 300) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounced fetch функція
  const debouncedFetch = useMemo(
    () => {
      let timeoutId;
      
      return async (searchQuery) => {
        clearTimeout(timeoutId);
        
        timeoutId = setTimeout(async () => {
          if (searchQuery.length < 2) {
            setSuggestions([]);
            return;
          }
          
          setIsLoading(true);
          setError(null);
          
          try {
            // Спочатку локальні дані
            const localSuggestions = getLocalSuggestions(searchQuery);
            setSuggestions(localSuggestions);
            
            // Потім з сервера (якщо доступний)
            const response = await fetch(`/api/search/suggest?q=${encodeURIComponent(searchQuery)}`, {
              signal: AbortController.signal,
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const serverSuggestions = await response.json();
              // Об'єднати та дедуплікувати
              const combinedSuggestions = mergeSuggestions(localSuggestions, serverSuggestions);
              setSuggestions(combinedSuggestions);
            }
          } catch (err) {
            if (err.name !== 'AbortError') {
              setError('Помилка завантаження пропозицій');
              console.warn('Autocomplete error:', err);
            }
          } finally {
            setIsLoading(false);
          }
        }, delay);
      };
    },
    [delay]
  );

  // Локальні пропозиції як fallback
  const getLocalSuggestions = (searchQuery) => {
    const localData = [
      { text: 'щебінь гранітний', category: 'Продукція' },
      { text: 'щебінь вапняковий', category: 'Продукція' },
      { text: 'пісок річковий', category: 'Продукція' },
      { text: 'пісок кар\'єрний', category: 'Продукція' },
      { text: 'асфальт гарячий', category: 'Продукція' },
      { text: 'бетон М200', category: 'Продукція' },
      { text: 'доставка матеріалів', category: 'Послуги' },
      { text: 'оренда техніки', category: 'Послуги' },
      { text: 'лабораторний контроль', category: 'Послуги' },
      { text: 'контактна інформація', category: 'Контакти' }
    ];
    
    return localData
      .filter(item => item.text.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5)
      .map(item => ({
        ...item,
        source: 'local'
      }));
  };

  // Об'єднання локальних та серверних пропозицій
  const mergeSuggestions = (local, server) => {
    const combined = [...local];
    
    server.forEach(serverItem => {
      const exists = combined.find(localItem => 
        localItem.text.toLowerCase() === serverItem.text.toLowerCase()
      );
      
      if (!exists) {
        combined.push({
          ...serverItem,
          source: 'server'
        });
      }
    });
    
    return combined.slice(0, 8); // Максимум 8 пропозицій
  };

  useEffect(() => {
    debouncedFetch(query);
  }, [query, debouncedFetch]);

  return {
    suggestions,
    isLoading,
    error
  };
};

export default useAutocomplete;
```

**Компонент AutocompleteDropdown:**
```javascript
// src/components/search/AutocompleteDropdown.js
import React from 'react';

const AutocompleteDropdown = ({ 
  suggestions, 
  isLoading, 
  onSuggestionSelect, 
  selectedIndex,
  query 
}) => {
  if (!suggestions.length && !isLoading) {
    return null;
  }

  return (
    <div 
      className="autocomplete-dropdown"
      role="listbox"
      aria-label="Пропозиції автозаповнення"
    >
      {isLoading && (
        <div className="autocomplete-loading" role="status" aria-live="polite">
          <span className="loading-spinner" aria-hidden="true"></span>
          Завантаження пропозицій...
        </div>
      )}
      
      {suggestions.map((suggestion, index) => (
        <div
          key={`${suggestion.text}-${index}`}
          className={`autocomplete-item ${selectedIndex === index ? 'selected' : ''}`}
          role="option"
          aria-selected={selectedIndex === index}
          onClick={() => onSuggestionSelect(suggestion)}
          tabIndex={-1}
        >
          <div className="suggestion-content">
            <span className="suggestion-text">
              {highlightMatch(suggestion.text, query)}
            </span>
            <span className="suggestion-category">
              {suggestion.category}
            </span>
          </div>
          
          {suggestion.source === 'server' && (
            <div className="suggestion-badge" title="Пропозиція з сервера">
              <span aria-hidden="true">🌐</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Функція підсвічування збігу
const highlightMatch = (text, query) => {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="autocomplete-highlight">
        {part}
      </mark>
    ) : part
  );
};

export default AutocompleteDropdown;
```

#### **3.3 User Preferences система**

**Файл:** `src/hooks/useUserPreferences.js`

```javascript
import { useState, useEffect } from 'react';

const DEFAULT_PREFERENCES = {
  animationsEnabled: true,
  compactMode: false,
  resultsPerPage: 10,
  colorScheme: 'auto', // 'light', 'dark', 'auto'
  voiceEnabled: true,
  autocompletionEnabled: true,
  searchHistory: true,
  keyboardShortcuts: true
};

const useUserPreferences = () => {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Завантаження з localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('comspec_search_preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (error) {
      console.warn('Помилка завантаження налаштувань:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Збереження в localStorage
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('comspec_search_preferences', JSON.stringify(preferences));
      } catch (error) {
        console.warn('Помилка збереження налаштувань:', error);
      }
    }
  }, [preferences, isLoading]);

  // Застосування CSS змінних для colorScheme
  useEffect(() => {
    const root = document.documentElement;
    
    if (preferences.colorScheme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else if (preferences.colorScheme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [preferences.colorScheme]);

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  return {
    preferences,
    updatePreference,
    resetPreferences,
    isLoading
  };
};

export default useUserPreferences;
```

**Компонент налаштувань SearchSettings:**
```javascript
// src/components/search/SearchSettings.js
import React from 'react';
import useUserPreferences from '../../hooks/useUserPreferences';

const SearchSettings = ({ isOpen, onClose }) => {
  const { preferences, updatePreference, resetPreferences } = useUserPreferences();

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h3>Налаштування пошуку</h3>
          <button 
            className="settings-close" 
            onClick={onClose}
            aria-label="Закрити налаштування"
          >
            ×
          </button>
        </div>
        
        <div className="settings-content">
          <div className="setting-group">
            <h4>Зовнішній вигляд</h4>
            
            <label className="setting-item">
              <span>Кольорова схема:</span>
              <select 
                value={preferences.colorScheme}
                onChange={e => updatePreference('colorScheme', e.target.value)}
              >
                <option value="auto">Автоматично</option>
                <option value="light">Світла</option>
                <option value="dark">Темна</option>
              </select>
            </label>
            
            <label className="setting-item">
              <input
                type="checkbox"
                checked={preferences.animationsEnabled}
                onChange={e => updatePreference('animationsEnabled', e.target.checked)}
              />
              <span>Анімації</span>
            </label>
            
            <label className="setting-item">
              <input
                type="checkbox"
                checked={preferences.compactMode}
                onChange={e => updatePreference('compactMode', e.target.checked)}
              />
              <span>Компактний режим</span>
            </label>
          </div>
          
          <div className="setting-group">
            <h4>Функціональність</h4>
            
            <label className="setting-item">
              <input
                type="checkbox"
                checked={preferences.voiceEnabled}
                onChange={e => updatePreference('voiceEnabled', e.target.checked)}
              />
              <span>Голосовий пошук</span>
            </label>
            
            <label className="setting-item">
              <input
                type="checkbox"
                checked={preferences.autocompletionEnabled}
                onChange={e => updatePreference('autocompletionEnabled', e.target.checked)}
              />
              <span>Автозаповнення</span>
            </label>
            
            <label className="setting-item">
              <input
                type="checkbox"
                checked={preferences.searchHistory}
                onChange={e => updatePreference('searchHistory', e.target.checked)}
              />
              <span>Історія пошуку</span>
            </label>
            
            <label className="setting-item">
              <span>Результатів на сторінку:</span>
              <select 
                value={preferences.resultsPerPage}
                onChange={e => updatePreference('resultsPerPage', parseInt(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>
          </div>
        </div>
        
        <div className="settings-footer">
          <button 
            className="btn-reset" 
            onClick={resetPreferences}
          >
            Скинути до базових
          </button>
          <button 
            className="btn-primary" 
            onClick={onClose}
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchSettings;
```

---

### **ФАЗА 4: ОПТИМІЗАЦІЯ ТА РЕФАКТОРИНГ**

#### **4.1 CSS рефакторинг**

**План дій:**
1. Створити єдиний файл змінних `search-variables.css`
2. Винести спільні стилі у `search-base.css`
3. Розділити enhanced-search.css на модулі
4. Видалити дублювання коду

**Структура нових файлів:**
```
src/styles/search/
├── search-variables.css    # Всі CSS змінні
├── search-base.css        # Базові стилі
├── search-modal.css       # Стилі модального вікна
├── search-results.css     # Стилі результатів
├── search-animations.css  # Всі анімації
├── search-responsive.css  # Медіа-запити
└── index.css             # Імпорт всіх файлів
```

#### **4.2 Code Splitting**

**React.lazy компоненти:**
```javascript
// src/components/search/index.js
import { lazy } from 'react';

export const SearchModal = lazy(() => import('./SearchModal'));
export const VoiceSearch = lazy(() => import('./VoiceSearch'));
export const SearchSettings = lazy(() => import('./SearchSettings'));
```

#### **4.3 Performance оптимізація**

**Web Workers для пошуку:**
```javascript
// src/workers/searchWorker.js
self.onmessage = function(e) {
  const { query, data, options } = e.data;
  
  // Виконати пошук в окремому потоці
  const results = performHeavySearch(query, data, options);
  
  self.postMessage({
    type: 'SEARCH_RESULTS',
    results,
    query
  });
};
```

---

## 📋 ПЛАН ВИКОНАННЯ ПО ТИЖНЯХ

### **Тиждень 1: Accessibility (КРИТИЧНО)** ⭐
- **День 1-2**: ARIA атрибути та семантика
- **День 3**: prefers-reduced-motion підтримка
- **День 4-5**: Покращена клавіатурна навігація
- **День 6-7**: Skip links, landmarks, тестування

### **Тиждень 2: Анімації та прогрес**
- **День 1-2**: Прогресивне завантаження
- **День 3-4**: Статистика пошуку
- **День 5-6**: Stagger анімації та skeleton loading
- **День 7**: Тестування та налагодження

### **Тиждень 3: Додаткові фічі**
- **День 1-3**: Voice Search (Progressive Enhancement)
- **День 4-5**: Server-side автокомпліт
- **День 6-7**: User preferences система

### **Тиждень 4: Оптимізація**
- **День 1-3**: CSS рефакторинг та модуляризація
- **День 4-5**: Code splitting та Web Workers
- **День 6-7**: Фінальне тестування та QA

---

## 🧪 ПЛАН ТЕСТУВАННЯ

### **Accessibility тести:**
```bash
# Автоматичне тестування
npm run test:a11y

# Manual тести:
- Screen reader тестування (NVDA, JAWS)
- Keyboard-only навігація
- Color contrast перевірка
- Focus management тестування
```

### **Performance тести:**
```bash
# Lighthouse аудит
npm run audit:performance

# Bundle size аналіз
npm run analyze:bundle

# Animation performance
npm run test:animations
```

### **Cross-browser тестування:**
```bash
# Desktop: Chrome, Firefox, Safari, Edge
# Mobile: iOS Safari, Chrome Mobile, Samsung Browser
# Screen readers: NVDA, JAWS, VoiceOver
```

---

## 📊 ОЧІКУВАНІ РЕЗУЛЬТАТИ

### **Кількісні покращення:**
- ✅ **Accessibility score**: 60% → 95%
- ✅ **Performance score**: 85% → 95%
- ✅ **Bundle size**: -30% через code splitting
- ✅ **First meaningful paint**: <1s
- ✅ **Time to interactive**: <2s

### **Якісні покращення:**
- ✅ **WCAG 2.1 AA compliance**: Повна сумісність
- ✅ **Progressive Enhancement**: Graceful degradation
- ✅ **Multi-modal search**: Текст + голос
- ✅ **Персоналізація**: Налаштування користувача
- ✅ **Cross-platform**: Всі основні браузери та пристрої

### **User Experience метрики:**
- ✅ **Task completion rate**: +20%
- ✅ **User satisfaction**: +25%
- ✅ **Search success rate**: +15%
- ✅ **Accessibility complaints**: -90%

---

## 🔧 ТЕХНІЧНІ ВИМОГИ

### **Залежності:**
```json
{
  "devDependencies": {
    "@axe-core/react": "^4.7.0",
    "eslint-plugin-jsx-a11y": "^6.7.1",
    "webpack-bundle-analyzer": "^4.9.0"
  }
}
```

### **Браузерна підтримка:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- iOS Safari 14+
- Chrome Mobile 90+

### **API Requirements:**
```
GET /api/search/suggest?q={query}
Response: [
  {
    "text": "string",
    "category": "string",
    "popularity": number
  }
]
```

---

## 📝 ЧЕКЛІСТ ЗАВЕРШЕННЯ

### **Фаза 1: Accessibility** ✅
- [ ] ARIA атрибути додано
- [ ] Live regions працюють
- [ ] prefers-reduced-motion реалізовано
- [ ] Keyboard navigation покращено
- [ ] Skip links додано
- [ ] Screen reader тестування пройдено
- [ ] WCAG 2.1 AA compliance досягнуто

### **Фаза 2: Анімації** ✅
- [ ] Progress bar реалізовано
- [ ] Search statistics додано
- [ ] Stagger animations працюють
- [ ] Skeleton loading активовано
- [ ] Micro-animations додано
- [ ] Performance тестування пройдено

### **Фаза 3: Додаткові фічі** ✅
- [ ] Voice Search працює
- [ ] Server autocomplete інтегровано
- [ ] User preferences збережено
- [ ] Settings modal створено
- [ ] Progressive Enhancement перевірено

### **Фаза 4: Оптимізація** ✅
- [ ] CSS рефакторинг завершено
- [ ] Code splitting активовано
- [ ] Bundle size оптимізовано
- [ ] Web Workers інтегровано
- [ ] Cross-browser тестування пройдено
- [ ] Performance goals досягнуто

---

**🎯 СТАТУС:** Готово до початку реалізації  
**📞 КОНТАКТ:** Команда Frontend розробки  
**📅 ДЕДЛАЙН:** 4 тижні від старту  

---

*Документ створено: 20.07.2025*  
*Останнє оновлення: 20.07.2025*