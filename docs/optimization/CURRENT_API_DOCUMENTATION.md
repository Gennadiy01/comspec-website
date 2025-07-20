# 📋 ДОКУМЕНТАЦІЯ ПОТОЧНОГО API ПОШУКОВОЇ СИСТЕМИ

## 🎯 Мета документа
Зафіксувати поточне API перед оптимізацією для забезпечення 100% сумісності.

---

## 📁 SearchModal.js

### Props:
```typescript
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

### Внутрішні методи (мають залишитися робочими):
- `determineTargetPage(result)` - визначення цільової сторінки
- `navigateWithHighlighting(targetPage, result, searchTerm)` - навігація з підсвічуванням
- `performDelayedHighlighting(result, searchTerm)` - відкладене підсвічування
- `handleResultSelect(result)` - обробка вибору результату

### Структура result об'єкта:
```typescript
interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: string;
  context: string | object;
  page?: string;
  url?: string;
  section?: string;
  selector?: string;
  element?: HTMLElement;
  relevance?: number;
  indexType?: string;
  searchableFields?: string[];
}
```

---

## 📁 QuickSearch.js

### Props:
```typescript
interface QuickSearchProps {
  searchQuery: string;
  onResultSelect: (result: SearchResult) => void;
  onSearchChange: (query: string) => void;
}
```

### Внутрішні дані:
```typescript
interface QuickSearchData {
  id: number;
  title: string;
  content: string;
  category: string;
  url: string;
  keywords: string[];
}
```

### Методи:
- `performQuickSearch(query)` - виконання швидкого пошуку
- `highlightText(text, query)` - підсвічування тексту
- `handleResultClick(result)` - обробка кліку на результат

---

## 📁 EnhancedGlobalSearch.js

### Props:
```typescript
interface EnhancedGlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onResultSelect: (result: SearchResult) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}
```

### Ключові методи:
- `performSearch(searchQuery)` - виконання пошуку
- `scrollToElementWithHighlight(section, title, result)` - навігація з підсвічуванням
- `highlightTermInElement(element, term, options)` - підсвічування терміну
- `handleResultClick(result)` - обробка кліку на результат

---

## 📁 HybridSearchEngine.js

### Публічні методи:
- `initialize()` - ініціалізація системи
- `search(query, limit = 10)` - основний пошук
- `getStats()` - отримання статистики
- `getContextStats()` - статистика контексту
- `diagnoseContextIssues()` - діагностика проблем

### Структура результату пошуку:
```typescript
interface HybridSearchResult {
  id: string;
  title: string;
  content: string;
  type: string;
  context: string;
  relevance: number;
  element?: HTMLElement;
  searchableFields: string[];
}
```

### Глобальні об'єкти:
- `window.hybridSearchEngine` - основний екземпляр
- `window.contextSearch` - утиліти для роботи з контекстом
- `window.comspecSearchUtils` - корисні утиліти

---

## 📁 SearchHighlighting.js

### Публічні методи:
- `highlightTermInElement(element, term, contextType)` - підсвічування терміну
- `scrollToElementWithHighlight(selector, term, context, directElement)` - навігація з підсвічуванням
- `clearHighlights()` - очищення підсвічувань
- `navigateHighlights(direction)` - навігація по підсвіченим результатам

### Глобальні функції:
- `window.highlightSearchResults(query, results, options)` - підсвічування результатів
- `window.clearSearchHighlights(container)` - очищення підсвічувань
- `window.navigateToResult(resultData, highlightQuery)` - навігація до результату
- `window.SearchHighlighting` - клас підсвічування
- `window.searchHighlighting` - екземпляр класу

### Конфігурація підсвічування:
```typescript
interface HighlightConfig {
  highlightClass: string; // 'comspec-search-highlight'
  contextColors: {
    phone: { bg: string, border: string };
    address: { bg: string, border: string };
    email: { bg: string, border: string };
    product: { bg: string, border: string };
    service: { bg: string, border: string };
    content: { bg: string, border: string };
  };
}
```

---

## 📁 GlobalSearch.js

### Props:
```typescript
interface GlobalSearchProps {
  isActive: boolean;
  onResultSelect: (result: SearchResult) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}
```

### Методи:
- `performGlobalSearch(query)` - виконання глобального пошуку
- `groupResultsByCategory(results)` - групування результатів
- `handleResultClick(result)` - обробка кліку на результат

---

## 📁 SearchEngine.js

### Публічні методи:
- `indexContent()` - індексація контенту
- `search(query, options)` - пошук
- `getIndexStats()` - статистика індексу
- `navigateToElement(result)` - навігація до елемента

---

## 📁 SearchEngineInitializer.js

### Методи ініціалізації:
- Автоматична ініціалізація при завантаженні
- Налаштування глобальних об'єктів
- Інтеграція з іншими компонентами

---

## 🔄 Типи пошуку

### 1. Швидкий пошук (QuickSearch)
- Статичні дані (10 записів)
- Пошук по title, content, keywords
- Миттєвий відгук

### 2. Глобальний пошук (EnhancedGlobalSearch)
- Використовує HybridSearchEngine
- 201+ записів (статичні + динамічні)
- Контекстний пошук

### 3. Режими SearchModal
- `suggestions` - підказки та швидкі дії
- `quick` - швидкий пошук
- `global` - глобальний пошук

---

## 🎨 Структура контексту

### Типи контексту:
- `address` - адреси
- `phone` - телефони
- `email` - email адреси
- `product` - продукція
- `service` - послуги
- `content` - загальний контент

### Контекстний об'єкт:
```typescript
interface Context {
  field: string;
  fieldSelector: string;
  fieldLabel: string;
  exactContent: string;
  searchableFields: Record<string, any>;
}
```

---

## 📊 Статистика системи

### Статистика HybridSearchEngine:
```typescript
interface SearchStats {
  staticIndex: number;
  dynamicIndex: number;
  totalRecords: number;
  staticWithContext: number;
  dynamicWithContext: number;
  isInitialized: boolean;
  contextualIndexSize: number;
}
```

---

## 🔍 Селектори для пошуку

### Динамічні селектори:
- `mainContent: 'main, .container, section, article'`
- `headings: 'h1, h2, h3, h4, h5, h6'`
- `textContent: 'p, span, div, li, td, th'`
- `cards: '.card, .achievement-item, .timeline-item'`
- `contactInfo: '.contact-section, .contacts-page'`

---

## ⚠️ КРИТИЧНІ ВИМОГИ ДЛЯ СУМІСНОСТІ

### 1. Всі Props залишаються незмінними
### 2. Всі публічні методи працюють як раніше
### 3. Структура результатів пошуку не змінюється
### 4. Глобальні об'єкти та функції доступні
### 5. CSS класи та стилі не торкаються
### 6. Типи контексту залишаються ті ж самі
### 7. Система навігації працює ідентично

---

## 🧪 Тестові сценарії

### Обов'язкові тести:
1. Відкриття модального вікна
2. Швидкий пошук по кожному типу
3. Глобальний пошук з різними запитами
4. Підсвічування результатів
5. Навігація до результатів
6. Історія пошуку
7. Очищення підсвічувань

### Критичні функції:
- `window.hybridSearchEngine.search('пісок')`
- `window.contextSearch.quickTest()`
- `window.searchHighlighting.test()`
- `window.comspecSearchUtils.testSearch('щебінь')`

---

**Дата створення:** 16.07.2025  
**Версія:** 1.0  
**Статус:** Базова документація для етапу 1 оптимізації