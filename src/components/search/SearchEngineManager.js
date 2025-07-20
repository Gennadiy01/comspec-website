// SearchEngineManager.js
// Версія 2.0 - Централізована система керування пошуком з оптимізацією продуктивності
// 🎯 Етап 4: Оптимізація продуктивності

import { getAllStaticData, getQuickSearchData, getPopularTags, getDynamicScanConfig, getContextPatterns } from '../../data/UnifiedSearchIndex.js';

/**
 * 🚀 COMSPEC Search Engine Manager v2.0
 * Централізований менеджер для керування всіма типами пошуку
 * Об'єднує логіку HybridSearchEngine та QuickSearch з оптимізацією продуктивності
 * 
 * ✨ Нові можливості етапу 4:
 * - Кешування результатів з TTL
 * - Індексування для швидкого пошуку
 * - Метрики продуктивності
 * - Оптимізація алгоритмів
 */
class SearchEngineManager {
  constructor() {
    this.staticIndex = new Map();
    this.dynamicIndex = new Map();
    this.contextualIndex = new Map();
    this.quickSearchData = null;
    this.popularTags = null;
    this.isInitialized = false;
    
    // 🆕 Система кешування (Етап 4)
    this.cache = new Map();
    this.cacheConfig = {
      maxSize: 100,           // Максимум 100 закешованих запитів
      ttl: 300000,           // TTL 5 хвилин
      enabled: true          // Feature flag для кешування
    };
    
    // 🆕 Індекс для швидкого пошуку (Етап 4)
    this.searchIndex = new Map();
    this.triggerIndex = new Map(); // Індекс по перших 2-3 символах
    
    // Статистика
    this.stats = {
      staticIndex: 0,
      dynamicIndex: 0,
      totalRecords: 0,
      quickSearchRecords: 0,
      popularTags: 0,
      lastUpdateTime: null,
      // 🆕 Статистика продуктивності (Етап 4)
      performance: {
        totalSearches: 0,
        cacheHits: 0,
        cacheMisses: 0,
        avgSearchTime: 0,
        searchTimes: []
      }
    };
    
    // Конфігурація з UnifiedSearchIndex
    this.config = getDynamicScanConfig();
    this.contextPatterns = getContextPatterns();
    
    // Ініціалізація
    this.initialize();
    
    console.log('🚀 SearchEngineManager v2.0 ініціалізовано з оптимізацією продуктивності');
  }

  /**
   * 🚀 Ініціалізація менеджера
   */
  async initialize() {
    try {
      // Завантажуємо статичні дані
      await this.loadStaticData();
      
      // Завантажуємо дані швидкого пошуку
      await this.loadQuickSearchData();
      
      // Завантажуємо популярні теги
      await this.loadPopularTags();
      
      // Ініціалізуємо динамічний індекс якщо є DOM
      if (typeof document !== 'undefined') {
        await this.initializeDynamicIndex();
      }
      
      this.isInitialized = true;
      this.stats.lastUpdateTime = new Date().toISOString();
      
      // 🆕 Ініціалізуємо індексування для швидкого пошуку (Етап 4)
      await this.buildSearchIndex();
      
      console.log('✅ SearchEngineManager ініціалізовано:', this.getStats());
      
    } catch (error) {
      console.error('❌ Помилка ініціалізації SearchEngineManager:', error);
    }
  }

  // 🆕 ===== МЕТОДИ КЕШУВАННЯ (Етап 4) =====
  
  /**
   * 🗄️ Отримати результат з кешу
   */
  getCacheKey(query, options) {
    return `${query.toLowerCase()}:${JSON.stringify(options)}`;
  }

  /**
   * 🗄️ Отримати з кешу
   */
  getFromCache(cacheKey) {
    if (!this.cacheConfig.enabled) return null;

    const entry = this.cache.get(cacheKey);
    if (!entry) return null;

    // Перевірка TTL
    if (Date.now() - entry.timestamp > this.cacheConfig.ttl) {
      this.cache.delete(cacheKey);
      return null;
    }

    this.stats.performance.cacheHits++;
    return entry.results;
  }

  /**
   * 🗄️ Зберегти в кеш
   */
  saveToCache(cacheKey, results) {
    if (!this.cacheConfig.enabled) return;

    // Перевірка розміру кешу
    if (this.cache.size >= this.cacheConfig.maxSize) {
      // Видаляємо найстарший запис
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(cacheKey, {
      results: results,
      timestamp: Date.now()
    });
  }

  /**
   * 🧹 Очистити кеш
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 Кеш очищено');
  }

  /**
   * 📊 Статистика кешу (виправлена)
   */
  getCacheStats() {
    const totalSearches = this.stats.performance.totalSearches;
    const cacheHits = this.stats.performance.cacheHits;
    const cacheMisses = this.stats.performance.cacheMisses;
    
    // Виправляємо розрахунок hitRate
    const hitRate = totalSearches > 0 
      ? Math.min((cacheHits / totalSearches * 100), 100).toFixed(2) + '%'
      : '0%';
    
    return {
      size: this.cache.size,
      maxSize: this.cacheConfig.maxSize,
      hitRate,
      enabled: this.cacheConfig.enabled,
      // Додаткова діагностична інформація
      debug: {
        totalSearches,
        cacheHits,
        cacheMisses,
        calculation: `${cacheHits}/${totalSearches} = ${hitRate}`
      }
    };
  }

  // 🆕 ===== МЕТОДИ ІНДЕКСУВАННЯ (Етап 4) =====

  /**
   * 🔍 Побудувати індекс для швидкого пошуку
   */
  async buildSearchIndex() {
    console.log('🔍 Побудова індексу для швидкого пошуку...');
    
    try {
      // Очищуємо існуючі індекси
      this.searchIndex.clear();
      this.triggerIndex.clear();

      // Індексуємо статичні дані
      for (const item of this.staticIndex.values()) {
        this.addToSearchIndex(item);
      }

      // Індексуємо дані швидкого пошуку
      if (this.quickSearchData) {
        for (const item of this.quickSearchData) {
          this.addToSearchIndex(item);
        }
      }

      console.log(`✅ Індекс побудовано: ${this.searchIndex.size} записів, ${this.triggerIndex.size} тригерів`);

    } catch (error) {
      console.error('❌ Помилка побудови індексу:', error);
    }
  }

  /**
   * 📝 Додати елемент до індексу
   */
  addToSearchIndex(item) {
    if (!item.title && !item.content) return;

    const text = [
      item.title || '',
      item.content || '',
      item.category || '',
      ...(item.keywords || [])
    ].join(' ').toLowerCase();

    const words = text.split(/\s+/).filter(word => word.length >= 2);

    // Додаємо до основного індексу
    for (const word of words) {
      if (!this.searchIndex.has(word)) {
        this.searchIndex.set(word, new Set());
      }
      this.searchIndex.get(word).add(item.id || item.title);
    }

    // Додаємо до тригерного індексу (перші 2-3 символи)
    for (const word of words) {
      if (word.length >= 2) {
        const trigger = word.substring(0, 3);
        if (!this.triggerIndex.has(trigger)) {
          this.triggerIndex.set(trigger, new Set());
        }
        this.triggerIndex.get(trigger).add(item.id || item.title);
      }
    }
  }

  /**
   * 📊 Завантаження статичних даних
   */
  async loadStaticData() {
    try {
      const staticData = getAllStaticData();
      
      staticData.forEach(item => {
        const searchableContent = this.createSearchableContent(item);
        this.staticIndex.set(item.id, {
          ...item,
          searchableContent,
          context: this.detectContext(searchableContent),
          weight: this.calculateWeight(item)
        });
      });
      
      this.stats.staticIndex = this.staticIndex.size;
      console.log(`📊 Завантажено ${this.stats.staticIndex} статичних записів`);
      
    } catch (error) {
      console.error('❌ Помилка завантаження статичних даних:', error);
      throw error;
    }
  }

  /**
   * ⚡ Завантаження даних швидкого пошуку
   */
  async loadQuickSearchData() {
    try {
      this.quickSearchData = getQuickSearchData();
      this.stats.quickSearchRecords = this.quickSearchData.length;
      console.log(`⚡ Завантажено ${this.stats.quickSearchRecords} записів швидкого пошуку`);
      
    } catch (error) {
      console.error('❌ Помилка завантаження швидкого пошуку:', error);
      throw error;
    }
  }

  /**
   * 🏷️ Завантаження популярних тегів
   */
  async loadPopularTags() {
    try {
      this.popularTags = getPopularTags();
      this.stats.popularTags = this.popularTags.length;
      console.log(`🏷️ Завантажено ${this.stats.popularTags} популярних тегів`);
      
    } catch (error) {
      console.error('❌ Помилка завантаження популярних тегів:', error);
      throw error;
    }
  }

  /**
   * 🔄 Ініціалізація динамічного індексу
   */
  async initializeDynamicIndex() {
    try {
      if (!document) return;
      
      const elements = this.scanDynamicContent();
      
      elements.forEach((element, index) => {
        const id = `dynamic-${index}`;
        const content = this.extractElementContent(element);
        
        if (content && content.length >= this.config.config.minTextLength) {
          this.dynamicIndex.set(id, {
            id,
            type: 'dynamic',
            content,
            element,
            context: this.detectContext(content),
            weight: this.calculateElementWeight(element)
          });
        }
      });
      
      this.stats.dynamicIndex = this.dynamicIndex.size;
      console.log(`🔄 Завантажено ${this.stats.dynamicIndex} динамічних записів`);
      
    } catch (error) {
      console.error('❌ Помилка ініціалізації динамічного індексу:', error);
    }
  }

  /**
   * 🚀 Основний метод пошуку (оптимізований - Етап 4)
   */
  search(query, options = {}) {
    if (!this.isInitialized) {
      console.warn('⚠️ SearchEngineManager не ініціалізовано');
      return [];
    }

    const {
      type = 'hybrid',        // 'quick', 'static', 'dynamic', 'hybrid'
      limit = 10,
      includeContext = true,
      sortBy = 'relevance'
    } = options;

    // 🆕 Генеруємо ключ для кешу (Етап 4)
    const cacheKey = this.getCacheKey(query, { type, limit, includeContext, sortBy });
    
    // 🆕 Спробуємо отримати з кешу (Етап 4)
    const cachedResults = this.getFromCache(cacheKey);
    if (cachedResults) {
      console.log(`🗄️ Кеш HIT для "${query}" (${type})`);
      return cachedResults;
    }

    this.stats.performance.cacheMisses++;
    const startTime = performance.now();
    let results = [];

    try {
      switch (type) {
        case 'quick':
          results = this.quickSearch(query, limit);
          break;
        case 'static':
          results = this.staticSearch(query, limit);
          break;
        case 'dynamic':
          results = this.dynamicSearch(query, limit);
          break;
        case 'hybrid':
        default:
          results = this.hybridSearch(query, limit);
          break;
      }

      // Сортування результатів
      results = this.sortResults(results, sortBy, query);

      // Додавання контексту
      if (includeContext) {
        results = this.addContextToResults(results, query);
      }

      const endTime = performance.now();
      const searchTime = endTime - startTime;

      // 🆕 Оновлення статистики продуктивності (Етап 4)
      this.updatePerformanceStats(searchTime);

      // 🆕 Зберігаємо результат в кеш (Етап 4)
      this.saveToCache(cacheKey, results);

      console.log(`🔍 Пошук "${query}" (${type}): ${results.length} результатів за ${searchTime.toFixed(2)}ms`);

      return results;

    } catch (error) {
      console.error('❌ Помилка пошуку:', error);
      return [];
    }
  }

  /**
   * 📊 Оновлення статистики продуктивності
   */
  updatePerformanceStats(searchTime) {
    this.stats.performance.totalSearches++;
    this.stats.performance.searchTimes.push(searchTime);

    // Зберігаємо тільки останні 100 записів
    if (this.stats.performance.searchTimes.length > 100) {
      this.stats.performance.searchTimes.shift();
    }

    // Обчислюємо середній час
    const sum = this.stats.performance.searchTimes.reduce((a, b) => a + b, 0);
    this.stats.performance.avgSearchTime = sum / this.stats.performance.searchTimes.length;
  }

  /**
   * ⚡ Швидкий пошук
   */
  quickSearch(query, limit = 10) {
    if (!this.quickSearchData) return [];

    const searchText = query.toLowerCase();
    const results = [];

    for (const item of this.quickSearchData) {
      const score = this.calculateQuickSearchScore(item, searchText);
      if (score > 0) {
        results.push({
          ...item,
          score,
          type: 'quick'
        });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * 📊 Статичний пошук
   */
  staticSearch(query, limit = 10) {
    const searchText = query.toLowerCase();
    const results = [];

    for (const item of this.staticIndex.values()) {
      const score = this.calculateStaticSearchScore(item, searchText);
      if (score > 0) {
        results.push({
          ...item,
          score,
          type: 'static'
        });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * 🔄 Динамічний пошук
   */
  dynamicSearch(query, limit = 10) {
    const searchText = query.toLowerCase();
    const results = [];

    for (const item of this.dynamicIndex.values()) {
      const score = this.calculateDynamicSearchScore(item, searchText);
      if (score > 0) {
        results.push({
          ...item,
          score,
          type: 'dynamic'
        });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * 🎯 Гібридний пошук (комбінований)
   */
  hybridSearch(query, limit = 10) {
    const results = [];
    
    // Отримуємо результати з усіх джерел
    const quickResults = this.quickSearch(query, Math.ceil(limit * 0.3));
    const staticResults = this.staticSearch(query, Math.ceil(limit * 0.5));
    const dynamicResults = this.dynamicSearch(query, Math.ceil(limit * 0.2));
    
    // Об'єднуємо результати
    results.push(...quickResults);
    results.push(...staticResults);
    results.push(...dynamicResults);
    
    // Видаляємо дублікати
    const uniqueResults = this.removeDuplicates(results);
    
    return uniqueResults
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * 📊 Розрахунок очок для швидкого пошуку
   */
  calculateQuickSearchScore(item, searchText) {
    let score = 0;
    
    // Точне співпадіння в заголовку
    if (item.title.toLowerCase() === searchText) {
      score += 100;
    }
    
    // Співпадіння в заголовку
    if (item.title.toLowerCase().includes(searchText)) {
      score += 80;
    }
    
    // Співпадіння в контенті
    if (item.content.toLowerCase().includes(searchText)) {
      score += 60;
    }
    
    // Співпадіння в ключових словах
    if (item.keywords?.some(keyword => keyword.toLowerCase().includes(searchText))) {
      score += 40;
    }
    
    return score;
  }

  /**
   * 📊 Розрахунок очок для статичного пошуку
   */
  calculateStaticSearchScore(item, searchText) {
    let score = 0;
    
    // Базовий пошук в контенті
    if (item.searchableContent?.toLowerCase().includes(searchText)) {
      score += 50;
    }
    
    // Додаткові очки за тип контенту
    if (item.context) {
      score += item.context.length * 10;
    }
    
    // Вага елемента
    if (item.weight) {
      score += item.weight * 5;
    }
    
    return score;
  }

  /**
   * 📊 Розрахунок очок для динамічного пошуку
   */
  calculateDynamicSearchScore(item, searchText) {
    let score = 0;
    
    // Базовий пошук в контенті
    if (item.content.toLowerCase().includes(searchText)) {
      score += 30;
    }
    
    // Додаткові очки за вагу елемента
    if (item.weight) {
      score += item.weight * 3;
    }
    
    return score;
  }

  /**
   * 🔧 Допоміжні методи
   */
  
  createSearchableContent(item) {
    return [
      item.title,
      item.content,
      item.category,
      item.page,
      ...(item.keywords || [])
    ].filter(Boolean).join(' ');
  }

  detectContext(content) {
    const contexts = [];
    
    for (const [contextType, patterns] of Object.entries(this.contextPatterns)) {
      if (patterns.some(pattern => pattern.test(content))) {
        contexts.push(contextType);
      }
    }
    
    return contexts;
  }

  calculateWeight(item) {
    let weight = 1;
    
    // Вага по типу
    if (item.type === 'product') weight += 3;
    if (item.type === 'service') weight += 2;
    if (item.type === 'contact') weight += 4;
    
    return weight;
  }

  calculateElementWeight(element) {
    const tagName = element.tagName.toLowerCase();
    return this.config.contentWeights[tagName] || 1;
  }

  scanDynamicContent() {
    const elements = [];
    
    for (const [selectorType, selector] of Object.entries(this.config.selectors)) {
      try {
        const found = document.querySelectorAll(selector);
        elements.push(...Array.from(found));
      } catch (error) {
        console.warn(`⚠️ Помилка сканування ${selectorType}:`, error);
      }
    }
    
    return elements;
  }

  extractElementContent(element) {
    return element.textContent?.trim() || element.innerText?.trim() || '';
  }

  sortResults(results, sortBy, query) {
    switch (sortBy) {
      case 'relevance':
        return results.sort((a, b) => b.score - a.score);
      case 'type':
        return results.sort((a, b) => a.type.localeCompare(b.type));
      case 'alphabetical':
        return results.sort((a, b) => a.title?.localeCompare(b.title) || 0);
      default:
        return results;
    }
  }

  addContextToResults(results, query) {
    return results.map(result => ({
      ...result,
      highlightedContent: this.highlightSearchTerms(result.content || result.title, query)
    }));
  }

  highlightSearchTerms(text, query) {
    if (!text || !query) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  removeDuplicates(results) {
    const seen = new Set();
    return results.filter(result => {
      const key = result.id || result.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * 📊 Отримання статистики (розширена - Етап 4)
   */
  getStats() {
    this.stats.totalRecords = this.stats.staticIndex + this.stats.dynamicIndex;
    
    return {
      ...this.stats,
      isInitialized: this.isInitialized,
      version: '2.0.0',
      // 🆕 Статистика кешування та продуктивності (Етап 4)
      cache: this.getCacheStats(),
      indexing: {
        searchIndexSize: this.searchIndex.size,
        triggerIndexSize: this.triggerIndex.size,
        indexingEnabled: true
      },
      performance: {
        ...this.stats.performance,
        avgSearchTimeFormatted: `${this.stats.performance.avgSearchTime.toFixed(2)}ms`,
        cacheHitRate: this.stats.performance.totalSearches > 0 
          ? `${((this.stats.performance.cacheHits / this.stats.performance.totalSearches) * 100).toFixed(2)}%`
          : '0%'
      }
    };
  }

  /**
   * 🏷️ Отримання популярних тегів
   */
  getPopularTags() {
    return this.popularTags || [];
  }

  /**
   * 🔄 Оновлення індексу
   */
  async refresh() {
    console.log('🔄 Оновлення SearchEngineManager...');
    
    // Очищуємо індекси
    this.staticIndex.clear();
    this.dynamicIndex.clear();
    
    // Повторна ініціалізація
    await this.initialize();
    
    console.log('✅ SearchEngineManager оновлено');
  }

  /**
   * 🧹 Очищення ресурсів
   */
  destroy() {
    this.staticIndex.clear();
    this.dynamicIndex.clear();
    this.contextualIndex.clear();
    this.quickSearchData = null;
    this.popularTags = null;
    this.isInitialized = false;
    
    console.log('🧹 SearchEngineManager знищено');
  }
}

// Створюємо глобальний екземпляр
const searchEngineManager = new SearchEngineManager();

// Експортуємо для використання в компонентах
export default searchEngineManager;
export { SearchEngineManager };

// Експортуємо методи для зворотної сумісності
export const quickSearch = (query, limit) => searchEngineManager.quickSearch(query, limit);
export const hybridSearch = (query, limit) => searchEngineManager.hybridSearch(query, limit);
export const getStats = () => searchEngineManager.getStats();
export const getPopularSearchTags = () => searchEngineManager.getPopularTags();

// Глобальний доступ для зворотної сумісності
if (typeof window !== 'undefined') {
  window.searchEngineManager = searchEngineManager;
  window.SearchEngineManager = SearchEngineManager;
}

console.log('📦 SearchEngineManager завантажено та готовий до використання');