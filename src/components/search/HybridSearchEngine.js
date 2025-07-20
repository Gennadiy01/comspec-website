// HybridSearchEngine.js
// Версія 3.1 - Оптимізована версія з покращеною релевантністю
// 🎯 Цільовий результат: Точні та релевантні результати пошуку

import { getAllStaticData, getDynamicScanConfig, getContextPatterns } from '../../data/UnifiedSearchIndex.js';

/**
 * 🔍 COMSPEC Hybrid Search Engine v3.1
 * Інтелектуальна система пошуку з покращеною релевантністю
 * Оптимізовано для точних та релевантних результатів
 */
class HybridSearchEngine {
  constructor() {
    this.staticIndex = new Map();
    this.dynamicIndex = new Map();
    this.contextualIndex = new Map();
    this.isInitialized = false;
    this.stats = {
      staticIndex: 0,
      dynamicIndex: 0,
      totalRecords: 0,
      staticWithContext: 0,
      dynamicWithContext: 0
    };
    
    // Оптимізовані налаштування для якісного пошуку
    this.searchConfig = {
      maxDynamicElements: 200,          // Обмежено для продуктивності
      scanDepth: 5,                     // Оптимальна глибина сканування
      minTextLength: 3,                 // Мінімальна довжина тексту
      includeHiddenElements: false,     // Не включати приховані елементи
      includeMetaElements: true,        // Включати meta елементи
      enhancedContentScan: true         // Розширене сканування контенту
    };
    
    // Селектори для динамічного сканування (розширені)
    this.dynamicSelectors = {
      mainContent: 'main, .container, section, article',
      headings: 'h1, h2, h3, h4, h5, h6',
      textContent: 'p, span, div, li, td, th',
      cards: '.card, .achievement-item, .timeline-item, .product-card, .service-card',
      contactInfo: '.contact-section, .contacts-page, .contact-info',
      contactAddresses: '.contact-address, .address, [class*="address"]',
      contactPhones: '.contact-phone, .phone, [href^="tel:"], [class*="phone"]',
      contactEmails: '.contact-email, .email, [href^="mailto:"], [class*="email"]',
      navigation: 'nav a, .menu a, .footer a',
      buttons: 'button, .btn, .button, input[type="submit"]',
      forms: 'form, .form, input, textarea, select',
      meta: 'meta[name], meta[property], [data-*]',
      hidden: '[style*="display: none"], [hidden]'
    };
    
    // Ваги для різних типів контенту
    this.contentWeights = {
      h1: 10, h2: 8, h3: 6, h4: 4, h5: 3, h6: 2,
      'p': 3, 'span': 1, 'div': 2, 'li': 2,
      'button': 4, '.btn': 4, 'a': 3, 'meta': 2
    };
    
    // Шаблони для розпізнавання типів контенту (розширені)
    this.contextPatterns = {
      address: [
        /вул\.|вулиця|проспект|пр\.|площа|пл\.|бульвар|б-р/i,
        /київ|одеса|харків|дніпро|львів|запоріжжя|буча|бровари/i,
        /промислова|перемоги|хрещатик|незалежності|будівельна|заводська/i,
        /область|місто|м\.|смт\.|село|с\./i
      ],
      phone: [
        /\+?\d{2,3}[\s-()]*\d{2,3}[\s-()]*\d{2,3}[\s-()]*\d{2,3}/,
        /телефон|тел\.|phone|моб\.|мобільний|зв'язок/i,
        /073|067|050|063|066|068|096|097|098|099|044|032/
      ],
      email: [
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
        /email|пошта|mail|е-mail|@/i,
        /@comspec\.ua|@gmail\.com|@ukr\.net|info@|support@/i
      ],
      product: [
        /щебінь|пісок|бетон|асфальт|матеріал|будівельн/i,
        /гранітний|вапняковий|річковий|кар'єрний|товарний/i,
        /фракція|марка|якість|сертифікат/i
      ],
      service: [
        /доставка|послуг|сервіс|оренда|консультац/i,
        /лабораторн|контроль|розробка|логістик/i,
        /буріння|вибух|маркшейдер|рекультивац/i
      ]
    };
    
    // Завантажуємо конфігурацію з UnifiedSearchIndex
    this.loadUnifiedConfig();
    
    // Збагачуємо статичний індекс з розширеним контентом
    this.initializeStaticIndex();
    
    // console.log('🔧 HybridSearchEngine v3.0 ініціалізовано (з UnifiedSearchIndex)');
  }

  /**
   * 🔧 Завантаження конфігурації з UnifiedSearchIndex
   */
  loadUnifiedConfig() {
    // console.log('📦 Завантаження конфігурації з UnifiedSearchIndex...');
    
    // Завантажуємо конфігурацію динамічного сканування
    const dynamicConfig = getDynamicScanConfig();
    if (dynamicConfig) {
      this.dynamicSelectors = dynamicConfig.selectors;
      this.contentWeights = dynamicConfig.contentWeights;
      this.searchConfig = { ...this.searchConfig, ...dynamicConfig.config };
    }
    
    // Завантажуємо контекстні шаблони
    const contextPatterns = getContextPatterns();
    if (contextPatterns) {
      this.contextPatterns = contextPatterns;
    }
    
    // console.log('✅ Конфігурація з UnifiedSearchIndex завантажена');
  }

  /**
   * 🚀 Ініціалізація статичного індексу з розширеним контентом
   */
  initializeStaticIndex() {
    // console.log('📚 Ініціалізація розширеного статичного індексу...');
    
    // Базові дані з UnifiedSearchIndex
    const baseStaticData = getAllStaticData();
    
    // Розширені дані вже включені в baseStaticData з UnifiedSearchIndex
    // console.log(`📊 Завантажено ${baseStaticData.length} записів з UnifiedSearchIndex`);
    
    // Додаємо до статичного індексу
    baseStaticData.forEach(item => {
      if (item && (item.title || item.content)) {
        const enrichedItem = this.enrichStaticItemWithContext(item);
        this.staticIndex.set(enrichedItem.id, enrichedItem);
      }
    });
    
    this.stats.staticIndex = this.staticIndex.size;
    // console.log(`📚 Статичний індекс створено: ${this.staticIndex.size} записів`);
  }

  /**
   * 🔧 Збагачення статичного елемента контекстом
   */
  enrichStaticItemWithContext(item) {
    const enrichedItem = {
      ...item,
      searchableFields: [],
      elementType: 'static',
      timestamp: new Date().toISOString()
    };
    
    // Створюємо контекст
    enrichedItem.context = this.createStaticContext(item);
    
    // Створюємо пошукові поля
    enrichedItem.searchableFields = this.createSearchableFields(enrichedItem);
    
    return enrichedItem;
  }

  /**
   * ⚡ Асинхронна ініціалізація
   */
  async initialize() {
    try {
      // console.log('🚀 Ініціалізація HybridSearchEngine v3.0...');
      
      // Спочатку статичні дані (вже ініціалізовані)
      // console.log(`📚 Статичний індекс: ${this.staticIndex.size} записів`);
      
      // Розширене динамічне сканування
      // console.log('🔍 Початок розширеного сканування динамічного контенту...');
      await this.performEnhancedDynamicScan();
      
      // Фінальна індексація контексту
      this.indexContextualData();
      
      this.isInitialized = true;
      
      const finalStats = this.getStats();
      // console.log('📊 Фінальна статистика після ініціалізації:', finalStats);
      
      return true;
      
    } catch (error) {
      console.error('❌ Помилка ініціалізації HybridSearchEngine:', error);
      throw error;
    }
  }

  /**
   * 🔄 Розширене динамічне сканування
   */
  async performEnhancedDynamicScan() {
    const scannedElements = new Set();
    const foundItems = new Map();
    
    // Розширені селектори для більш глибокого сканування
    const selectors = [
      'h1, h2, h3, h4, h5, h6',
      'p, span, div, section, article',
      'a[href], button, .btn',
      'input, textarea, select, form',
      'li, td, th, dl, dt, dd',
      '[data-title], [data-content], [data-id]',
      '[class*="product"], [class*="service"]',
      '[class*="contact"], [class*="info"], [class*="about"]',
      '[class*="hero"], [class*="cta"], [class*="stats"]',
      '[class*="card"], [class*="item"], [class*="feature"]',
      '.modal, .form, .footer',
      '[id*="nav"], [id*="menu"], [id*="header"]',
      '[aria-label], [title], [alt]'
    ];
    
    for (const selector of selectors) {
      try {
        const elements = document.querySelectorAll(selector);
        console.log(`🔍 Сканування "${selector}": знайдено ${elements.length} елементів`);
        
        elements.forEach((element, index) => {
          try {
            if (scannedElements.has(element)) return;
            scannedElements.add(element);
            
            const itemData = this.extractEnhancedElementData(element, selector, index);
            if (itemData && this.isValidItemData(itemData)) {
              const uniqueId = itemData.id || `${selector.replace(/[^a-zA-Z0-9]/g, '_')}_${index}`;
              
              if (!foundItems.has(uniqueId)) {
                foundItems.set(uniqueId, itemData);
              }
            }
          } catch (elementError) {
            console.warn(`⚠️ Помилка обробки елемента в "${selector}":`, elementError);
          }
        });
      } catch (selectorError) {
        console.warn(`⚠️ Помилка селектора "${selector}":`, selectorError);
      }
    }
    
    // Додаємо знайдені елементи до динамічного індексу
    foundItems.forEach((item, id) => {
      this.dynamicIndex.set(id, {
        ...item,
        elementType: 'dynamic',
        timestamp: new Date().toISOString(),
        searchableFields: this.createSearchableFields(item)
      });
    });
    
    this.stats.dynamicIndex = this.dynamicIndex.size;
    
    console.log(`✅ Розширене динамічне сканування завершено:
  📊 Оброблено елементів: ${scannedElements.size}
  📊 Унікальних записів: ${foundItems.size}`);
    
    return foundItems;
  }


  /**
   * 📝 Розширене витягування даних з елементів
   */
  extractEnhancedElementData(element, selector, index) {
    try {
      const data = {
        id: null,
        title: '',
        type: 'unknown',
        content: '',
        context: 'content',
        element: element,
        selector: selector
      };
      
      // Витягуємо ID
      data.id = element.id || 
               element.getAttribute('data-id') || 
               `${selector.replace(/[^a-zA-Z0-9]/g, '_')}_${index}`;
      
      // Витягуємо заголовок
      data.title = element.getAttribute('title') ||
                  element.getAttribute('aria-label') ||
                  element.getAttribute('alt') ||
                  element.getAttribute('data-title') ||
                  this.extractTextContent(element, 100) ||
                  `Елемент ${selector}`;
      
      // Витягуємо контент
      data.content = this.extractCompleteContent(element);
      
      // Визначаємо тип контенту
      data.type = this.determineContentType(element, data.content);
      
      // Визначаємо контекст
      data.context = this.determineContext(element, data.content);
      
      return data;
      
    } catch (error) {
      console.warn('⚠️ Помилка витягування даних:', error);
      return null;
    }
  }

  /**
   * 📄 Витягування повного контенту з елемента
   */
  extractCompleteContent(element) {
    let content = '';
    
    // Основний текст
    const textContent = element.textContent || element.innerText || '';
    if (textContent.trim()) {
      content += textContent.trim() + ' ';
    }
    
    // Атрибути
    const attributes = ['title', 'alt', 'aria-label', 'data-content', 'placeholder', 'value'];
    attributes.forEach(attr => {
      const value = element.getAttribute(attr);
      if (value && value.trim()) {
        content += value.trim() + ' ';
      }
    });
    
    // Спеціальні елементи
    if (element.tagName === 'META') {
      const metaContent = element.getAttribute('content');
      if (metaContent) {
        content += metaContent + ' ';
      }
    }
    
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      const inputValue = element.value || element.getAttribute('value');
      if (inputValue) {
        content += inputValue + ' ';
      }
    }
    
    return content.trim();
  }

  /**
   * ✅ Валідація даних елемента
   */
  isValidItemData(itemData) {
    if (!itemData || typeof itemData !== 'object') return false;
    
    // Мінімальні вимоги
    if (!itemData.title && !itemData.content) return false;
    
    // Перевірка довжини
    const totalLength = (itemData.title || '').length + (itemData.content || '').length;
    if (totalLength < this.searchConfig.minTextLength) return false;
    
    // Фільтруємо спам та некорисний контент
    const spamKeywords = ['script', 'style', 'noscript', 'undefined', 'null'];
    const contentLower = (itemData.content || '').toLowerCase();
    
    if (spamKeywords.some(keyword => contentLower.includes(keyword))) {
      return false;
    }
    
    return true;
  }

  /**
   * 🔍 Індексація контекстуальних даних
   */
  indexContextualData() {
    console.log('🔍 Індексація контекстуальних даних...');
    
    const allItems = new Map([...this.staticIndex, ...this.dynamicIndex]);
    
    allItems.forEach((item, id) => {
      // Створюємо контекстуальні зв'язки
      const contextKey = `${item.type}_${item.context}`;
      
      if (!this.contextualIndex.has(contextKey)) {
        this.contextualIndex.set(contextKey, []);
      }
      
      this.contextualIndex.get(contextKey).push(id);
      
      // Оновлюємо статистику контексту
      this.updateContextStats(item);
    });
    
    console.log(`✅ Контекстуальна індексація завершена: ${this.contextualIndex.size} контекстів`);
  }

  /**
   * 📊 Оновлення статистики контексту
   */
  updateContextStats(item) {
    if (item.context) {
      if (item.elementType === 'static' || item.elementType === 'supplemental') {
        this.stats.staticWithContext = this.stats.staticWithContext || 0;
        this.stats.staticWithContext++;
      } else {
        this.stats.dynamicWithContext = this.stats.dynamicWithContext || 0;
        this.stats.dynamicWithContext++;
      }
    }
  }

  /**
   * 🔧 Створення контексту для статичних елементів
   */
  createStaticContext(item) {
    if (!item || typeof item !== 'object') {
      return this.createEmptyContext();
    }
    
    const text = `${item.title || ''} ${item.content || ''}`.toLowerCase();
    
    let field = 'content';
    let fieldLabel = 'Контент';
    let fieldSelector = null;
    
    // Визначаємо тип поля за змістом
    if (this.contextPatterns) {
      if (this.contextPatterns.address && this.contextPatterns.address.some(pattern => pattern.test(text))) {
        field = 'address';
        fieldLabel = 'Адреса';
        fieldSelector = '.contact-address, .address, [class*="address"]';
      } else if (this.contextPatterns.phone && this.contextPatterns.phone.some(pattern => pattern.test(text))) {
        field = 'phone';
        fieldLabel = 'Телефон';
        fieldSelector = '.contact-phone, .phone, [href^="tel:"]';
      } else if (this.contextPatterns.email && this.contextPatterns.email.some(pattern => pattern.test(text))) {
        field = 'email';
        fieldLabel = 'Email';
        fieldSelector = '.contact-email, .email, [href^="mailto:"]';
      } else if (this.contextPatterns.product && this.contextPatterns.product.some(pattern => pattern.test(text))) {
        field = 'product';
        fieldLabel = 'Продукція';
        fieldSelector = '.product, .product-card';
      } else if (this.contextPatterns.service && this.contextPatterns.service.some(pattern => pattern.test(text))) {
        field = 'service';
        fieldLabel = 'Послуга';
        fieldSelector = '.service, .service-card';
      }
    }
    
    return {
      field,
      fieldSelector,
      fieldLabel,
      exactContent: item.content || item.title || '',
      searchableFields: {}
    };
  }

  /**
   * 🔧 Створення порожнього контексту
   */
  createEmptyContext() {
    return {
      field: 'content',
      fieldSelector: null,
      fieldLabel: 'Контент',
      exactContent: '',
      searchableFields: {}
    };
  }

  /**
   * 🔍 Визначення типу контенту
   */
  determineContentType(element, content) {
    const tagName = element.tagName.toLowerCase();
    const className = element.className || '';
    const id = element.id || '';
    const contentLower = content.toLowerCase();
    
    // Продукція
    if ((this.contextPatterns.product && this.contextPatterns.product.some(pattern => pattern.test(contentLower))) ||
        className.includes('product') || id.includes('product')) {
      return 'product';
    }
    
    // Послуги
    if ((this.contextPatterns.service && this.contextPatterns.service.some(pattern => pattern.test(contentLower))) ||
        className.includes('service') || id.includes('service')) {
      return 'service';
    }
    
    // Контакти
    if ((this.contextPatterns.phone && this.contextPatterns.phone.some(pattern => pattern.test(contentLower))) ||
        (this.contextPatterns.email && this.contextPatterns.email.some(pattern => pattern.test(contentLower))) ||
        (this.contextPatterns.address && this.contextPatterns.address.some(pattern => pattern.test(contentLower))) ||
        className.includes('contact') || id.includes('contact')) {
      return 'contact';
    }
    
    // Навігація
    if (tagName === 'a' || className.includes('nav') || id.includes('nav') ||
        className.includes('menu') || id.includes('menu')) {
      return 'navigation';
    }
    
    // Форми
    if (tagName === 'form' || tagName === 'input' || tagName === 'button' ||
        className.includes('form') || className.includes('btn')) {
      return 'form';
    }
    
    // Заголовки
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
      return 'heading';
    }
    
    return 'content';
  }

  /**
   * 🎯 Визначення контексту
   */
  determineContext(element, content) {
    const contentLower = content.toLowerCase();
    
    // Телефон
    if (this.contextPatterns.phone && this.contextPatterns.phone.some(pattern => pattern.test(content))) {
      return 'phone';
    }
    
    // Email
    if (this.contextPatterns.email && this.contextPatterns.email.some(pattern => pattern.test(content))) {
      return 'email';
    }
    
    // Адреса
    if (this.contextPatterns.address && this.contextPatterns.address.some(pattern => pattern.test(contentLower))) {
      return 'address';
    }
    
    // Продукція
    if (this.contextPatterns.product && this.contextPatterns.product.some(pattern => pattern.test(contentLower))) {
      return 'product';
    }
    
    // Послуги
    if (this.contextPatterns.service && this.contextPatterns.service.some(pattern => pattern.test(contentLower))) {
      return 'service';
    }
    
    return 'content';
  }

  /**
   * 🔧 Створення пошукових полів
   */
  createSearchableFields(item) {
    const fields = [];
    
    if (item.title) fields.push(item.title);
    if (item.content) fields.push(item.content);
    if (item.type) fields.push(item.type);
    if (item.context) fields.push(item.context);
    
    // Додаємо keywords якщо є
    if (item.keywords && Array.isArray(item.keywords)) {
      fields.push(...item.keywords);
    }
    
    // Додаткові поля залежно від типу
    if (item.type === 'product') {
      fields.push('будівельні матеріали', 'якість', 'доставка');
    }
    
    if (item.type === 'service') {
      fields.push('послуги', 'сервіс', 'допомога');
    }
    
    if (item.context === 'phone') {
      fields.push('телефон', 'зв\'язок', 'контакт');
    }
    
    if (item.context === 'address') {
      fields.push('адреса', 'місцезнаходження', 'офіс');
    }
    
    return fields;
  }

  /**
   * 🧹 Витягування тексту з обмеженням
   */
  extractTextContent(element, maxLength = 100) {
    const text = element.textContent || element.innerText || '';
    return text.length > maxLength ? text.substring(0, maxLength).trim() + '...' : text.trim();
  }

  /**
   * 🔍 Основна функція пошуку
   */
  search(query, limit = 10) {
    if (!this.isInitialized) {
      console.warn('⚠️ Пошуковий движок не ініціалізовано, виконую ініціалізацію...');
      this.initialize();
    }
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      console.warn('⚠️ Некоректний пошуковий запит');
      return [];
    }
    
    const startTime = performance.now();
    // console.log(`🔍 Пошук: "${query}"`);
    
    try {
      const normalizedQuery = query.toLowerCase().trim();
      const queryTerms = normalizedQuery.split(/\s+/);
      
      const results = [];
      const allItems = new Map([...this.staticIndex, ...this.dynamicIndex]);
      
      // Пошук по всіх записах з фільтрацією за мінімальною релевантністю
      const minRelevanceThreshold = 50; // Мінімальний поріг релевантності
      
      allItems.forEach((item, id) => {
        const relevance = this.calculateRelevance(item, queryTerms, normalizedQuery);
        
        if (relevance >= minRelevanceThreshold) {
          results.push({
            id: id,
            title: item.title,
            content: item.content,
            type: item.type,
            context: item.context,
            relevance: relevance,
            element: item.element,
            searchableFields: item.searchableFields,
            indexType: item.elementType || 'static'
          });
        }
      });
      
      // Сортуємо за релевантністю
      results.sort((a, b) => b.relevance - a.relevance);
      
      const limitedResults = results.slice(0, limit);
      const searchTime = performance.now() - startTime;
      
      // console.log(`📊 Знайдено результатів: ${limitedResults.length}`);
      // console.log(`⏱️ Час пошуку: ${searchTime.toFixed(2)}ms`);
      
      return limitedResults;
      
    } catch (error) {
      console.error('❌ Помилка пошуку:', error);
      return [];
    }
  }

  /**
   * 🎯 Розрахунок релевантності (покращений алгоритм)
   */
  calculateRelevance(item, queryTerms, fullQuery) {
    let relevance = 0;
    
    const searchableText = (item.searchableFields || []).join(' ').toLowerCase();
    const titleText = (item.title || '').toLowerCase();
    const contentText = (item.content || '').toLowerCase();
    const keywordsText = (item.keywords || []).join(' ').toLowerCase();
    
    // Перевірка на точне співпадіння в заголовку (найвища вага)
    if (titleText === fullQuery) {
      relevance += 1000;
    } else if (titleText.includes(fullQuery)) {
      relevance += 500;
    }
    
    // Точне співпадіння в ключових словах
    if (keywordsText.includes(fullQuery)) {
      relevance += 300;
    }
    
    // Точне співпадіння в контенті
    if (contentText.includes(fullQuery)) {
      relevance += 200;
    }
    
    // Точне співпадіння в searchableFields
    if (searchableText.includes(fullQuery)) {
      relevance += 100;
    }
    
    // Аналіз окремих термінів з урахуванням важливості
    queryTerms.forEach(term => {
      if (term.length >= 2) {
        // Перевірка на точне співпадіння терміну
        const exactTitleMatch = titleText === term;
        const exactKeywordMatch = (item.keywords || []).some(keyword => 
          keyword.toLowerCase() === term
        );
        
        if (exactTitleMatch) {
          relevance += 800;
        } else if (exactKeywordMatch) {
          relevance += 600;
        } else {
          // Звичайні співпадіння
          const titleMatches = (titleText.match(new RegExp(term, 'g')) || []).length;
          const contentMatches = (contentText.match(new RegExp(term, 'g')) || []).length;
          const keywordMatches = (keywordsText.match(new RegExp(term, 'g')) || []).length;
          
          relevance += titleMatches * 50;
          relevance += contentMatches * 20;
          relevance += keywordMatches * 80;
        }
      }
    });
    
    // Бонус за тип контенту (тільки для релевантних результатів)
    if (relevance > 0) {
      const contextBonus = {
        'phone': 10,
        'email': 10,
        'address': 15,
        'product': 100,  // Підвищено для продуктів
        'service': 50,   // Підвищено для послуг
        'content': 5
      };
      
      relevance += contextBonus[item.context] || 0;
      
      // Бонус за тип елемента
      const typeBonus = {
        'product': 100,
        'service': 50,
        'contact': 20,
        'navigation': 5,
        'heading': 10
      };
      
      relevance += typeBonus[item.type] || 0;
    }
    
    return Math.round(relevance);
  }

  /**
   * 📊 Отримання статистики
   */
  getStats() {
    return {
      ...this.stats,
      totalRecords: this.staticIndex.size + this.dynamicIndex.size,
      isInitialized: this.isInitialized,
      contextualIndexSize: this.contextualIndex.size
    };
  }

  /**
   * 📈 Отримання статистики контексту
   */
  getContextStats() {
    const stats = {
      totalWithContext: 0,
      byField: {
        address: 0,
        phone: 0,
        email: 0,
        product: 0,
        service: 0,
        content: 0
      },
      totalSearchableFields: 0,
      byIndexType: {
        static: {
          total: this.stats.staticIndex,
          withContext: this.stats.staticWithContext || 0
        },
        dynamic: {
          total: this.stats.dynamicIndex,
          withContext: this.stats.dynamicWithContext || 0
        }
      }
    };
    
    // Підрахунок по всіх записах
    const allItems = new Map([...this.staticIndex, ...this.dynamicIndex]);
    
    allItems.forEach(item => {
      if (item.context) {
        stats.totalWithContext++;
        if (stats.byField[item.context] !== undefined) {
          stats.byField[item.context]++;
        } else {
          stats.byField.content++;
        }
      }
      
      if (item.searchableFields) {
        stats.totalSearchableFields += item.searchableFields.length;
      }
    });
    
    console.log('📊 Статистика контексту:', stats);
    return stats;
  }

  /**
   * 🔧 Діагностика проблем з контекстом
   */
  diagnoseContextIssues() {
    console.log('🔬 ДІАГНОСТИКА ПРОБЛЕМ З КОНТЕКСТОМ');
    console.log('==================================================');
    
    const issues = {
      nullRecords: [],
      emptyContext: [],
      emptySearchableFields: [],
      missingProperties: [],
      fixedRecords: 0
    };
    
    const allItems = new Map([...this.staticIndex, ...this.dynamicIndex]);
    
    allItems.forEach((item, id) => {
      // Перевірка на null записи
      if (!item) {
        issues.nullRecords.push(id);
        return;
      }
      
      // Перевірка порожнього контексту
      if (!item.context || item.context.trim() === '') {
        issues.emptyContext.push(id);
        // Автоматичне виправлення
        item.context = 'content';
        issues.fixedRecords++;
      }
      
      // Перевірка пошукових полів
      if (!item.searchableFields || !Array.isArray(item.searchableFields) || item.searchableFields.length === 0) {
        issues.emptySearchableFields.push(id);
        // Автоматичне виправлення
        item.searchableFields = this.createSearchableFields(item);
        issues.fixedRecords++;
      }
      
      // Перевірка обов'язкових властивостей
      if (!item.title && !item.content) {
        issues.missingProperties.push(id);
      }
    });
    
    console.log('📊 Знайдено проблем:');
    console.log(`   ❌ Null записів: ${issues.nullRecords.length}`);
    console.log(`   ❌ Порожній контекст: ${issues.emptyContext.length}`);
    console.log(`   ❌ Порожні searchableFields: ${issues.emptySearchableFields.length}`);
    console.log(`   ❌ Відсутні властивості: ${issues.missingProperties.length}`);
    console.log(`   🔧 Виправлених записів: ${issues.fixedRecords}`);
    
    if (issues.fixedRecords === 0 && 
        issues.nullRecords.length === 0 && 
        issues.emptyContext.length === 0 && 
        issues.emptySearchableFields.length === 0 && 
        issues.missingProperties.length === 0) {
      console.log('\n🎯 Загальний стан: ✅ ВСЕ ІДЕАЛЬНО');
    } else if (issues.fixedRecords > 0) {
      console.log('\n🎯 Загальний стан: 🔧 ПРОБЛЕМИ ВИПРАВЛЕНО АВТОМАТИЧНО');
    } else {
      console.log('\n🎯 Загальний стан: ⚠️ ПОТРЕБУЄ УВАГИ');
    }
    
    return issues;
  }

  /**
   * 🔄 Демонстрація можливостей
   */
  demonstrateCapabilities() {
    console.log('🎬 ДЕМОНСТРАЦІЯ ПОШУКУ COMSPEC');
    console.log('========================================');
    
    const testQueries = [
      { query: 'пісок', category: 'Продукція' },
      { query: 'телефон', category: 'Контакти' },
      { query: 'доставка', category: 'Послуги' },
      { query: '044', category: 'Контекстний пошук' },
      { query: 'київ', category: 'Адреси' }
    ];
    
    testQueries.forEach(test => {
      console.log(`\n🔍 Тест: "${test.query}" (${test.category})`);
      
      const results = this.search(test.query, 3);
      console.log(`   📊 Результатів: ${results.length}`);
      
      if (results.length > 0) {
        console.log(`   🎯 Топ результат: "${results[0].title}"`);
        console.log(`   📈 Релевантність: ${results[0].relevance}`);
      }
    });
    
    return true;
  }

  /**
   * 🔬 Діагностика системи
   */
  diagnoseSystem() {
    console.log('🔬 ДІАГНОСТИКА СИСТЕМИ ПОШУКУ COMSPEC');
    console.log('==================================================');
    
    const components = {
      hybridSearchEngine: true,
      contextSearch: true,
      searchHighlighting: !!(window.SearchHighlighting || window.searchHighlighting)
    };
    
    console.log('🔧 КОМПОНЕНТИ:');
    Object.entries(components).forEach(([name, available]) => {
      console.log(`   ${available ? '✅' : '❌'} ${name}: ${available}`);
    });
    
    const stats = this.getStats();
    const contextStats = this.getContextStats();
    
    console.log('\n📊 СТАТИСТИКА:');
    console.log(`   📝 Всього записів: ${stats.totalRecords}`);
    console.log(`   🎯 З контекстом: ${contextStats.totalWithContext}/${stats.totalRecords} (${Math.round((contextStats.totalWithContext/stats.totalRecords)*100)}%)`);
    console.log(`   🔍 Статичних з контекстом: ${contextStats.byIndexType.static.withContext}/${contextStats.byIndexType.static.total} (${Math.round((contextStats.byIndexType.static.withContext/contextStats.byIndexType.static.total)*100)}%)`);
    
    // Тест продуктивності
    const startTime = performance.now();
    const testResults = this.search('пісок', 5);
    const endTime = performance.now();
    const searchTime = endTime - startTime;
    
    console.log(`\n⚡ ТЕСТ: ${testResults.length} результатів за ${Math.round(searchTime)}ms`);
    
    const isReady = stats.totalRecords >= 201 && contextStats.totalWithContext >= stats.totalRecords * 0.95;
    console.log(`\n🎯 СТАН: ${isReady ? '✅ ГОТОВО' : '⚠️ ПОТРЕБУЄ ДООПРАЦЮВАННЯ'}`);
    
    return {
      components,
      stats,
      isReady,
      performance: Math.round(searchTime)
    };
  }

  /**
   * 📤 Експорт діагностичних даних
   */
  exportDiagnosticData() {
    const stats = this.getStats();
    const contextStats = this.getContextStats();
    
    const diagnosticData = {
      timestamp: new Date().toISOString(),
      version: 'COMSPEC Search v3.0',
      stats: stats,
      contextStats: contextStats,
      isReady: stats.totalRecords >= 201 && contextStats.totalWithContext === stats.totalRecords
    };
    
    console.log('📋 ЕКСПОРТ СТАТИСТИКИ COMSPEC SEARCH');
    console.log('=============================================');
    console.log(JSON.stringify(diagnosticData, null, 2));
    
    // Зберігаємо в localStorage
    try {
      localStorage.setItem('comspec-search-diagnostic', JSON.stringify(diagnosticData));
      console.log('\n💾 Статистика збережена у localStorage');
    } catch (error) {
      console.warn('⚠️ Не вдалося зберегти в localStorage:', error);
    }
    
    return diagnosticData;
  }
}

// Створюємо екземпляр
const hybridSearchEngine = new HybridSearchEngine();

// Утиліти для тестування та інтеграції
hybridSearchEngine.contextUtils = {
  
  quickTest: (searchTerm = 'пісок') => {
    console.log(`🚀 Швидкий тест: "${searchTerm}"`);
    const results = hybridSearchEngine.search(searchTerm, 5);
    
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.title} (${result.indexType || 'unknown'})`);
      console.log(`   📊 Релевантність: ${result.relevance}`);
    });
    
    return results;
  },
  
  fix: () => {
    return hybridSearchEngine.diagnoseContextIssues();
  },
  
  restart: () => {
    console.log('🔄 Перезапуск системи');
    hybridSearchEngine.staticIndex.clear();
    hybridSearchEngine.dynamicIndex.clear();
    hybridSearchEngine.contextualIndex.clear();
    hybridSearchEngine.isInitialized = false;
    
    hybridSearchEngine.initializeStaticIndex();
    hybridSearchEngine.initialize();
    
    return hybridSearchEngine.getStats();
  },

  demo: () => {
    return hybridSearchEngine.demonstrateCapabilities();
  },

  fullDiagnosis: () => {
    console.log('🔬 ПОВНА ДІАГНОСТИКА СИСТЕМИ');
    console.log('='.repeat(40));
    
    const stats = hybridSearchEngine.getStats();
    const contextStats = hybridSearchEngine.getContextStats();
    const issues = hybridSearchEngine.diagnoseContextIssues();
    
    console.log('📊 СТАТИСТИКА:');
    console.log(`   📝 Всього записів: ${stats.totalRecords}`);
    console.log(`   🎯 З контекстом: ${stats.totalWithContext}/${stats.totalRecords} (${Math.round((contextStats.totalWithContext/stats.totalRecords)*100)}%)`);
    
    const isReady = stats.totalRecords >= 201 && contextStats.totalWithContext >= stats.totalRecords * 0.90;
    console.log(`\n🎯 СТАН: ${isReady ? '✅ ГОТОВО' : '⚠️ ПОТРЕБУЄ НАЛАШТУВАННЯ'}`);
    
    return { stats, contextStats, issues, isReady };
  },

  getIssuesArray: () => {
    const issues = hybridSearchEngine.diagnoseContextIssues();
    return [
      ...issues.nullRecords,
      ...issues.emptyContext,
      ...issues.emptySearchableFields,
      ...issues.missingProperties
    ];
  }
};

// Глобальні утиліти для браузера
if (typeof window !== 'undefined') {
  window.hybridSearchEngine = hybridSearchEngine;
  window.contextSearch = hybridSearchEngine.contextUtils;
  
  window.diagnoseSearchSystem = () => {
    return hybridSearchEngine.diagnoseSystem();
  };
  
  window.comspecSearchUtils = {
    quickTest: () => window.diagnoseSearchSystem(),
    fix: () => window.contextSearch.fix(),
    restart: () => window.contextSearch.restart(),
    getStats: () => hybridSearchEngine.getStats(),
    
    testSearch: (query = 'пісок', limit = 5) => {
      console.log(`🔍 Тест пошуку: "${query}"`);
      const start = performance.now();
      const results = hybridSearchEngine.search(query, limit);
      const end = performance.now();
      
      console.log(`📊 Результатів: ${results.length}`);
      console.log(`⚡ Час: ${Math.round(end - start)}ms`);
      
      results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.title} (релевантність: ${result.relevance})`);
      });
      
      return results;
    },

    demo: () => hybridSearchEngine.contextUtils.demo(),
    fullDiagnosis: () => hybridSearchEngine.contextUtils.fullDiagnosis(),
    
    exportStats: () => {
      return hybridSearchEngine.exportDiagnosticData();
    },

    analyzeContext: () => {
      console.log('🔍 АНАЛІЗ КОНТЕКСТУ');
      console.log('='.repeat(30));
      
      const contextStats = hybridSearchEngine.getContextStats();
      
      console.log('📊 Розподіл по типах полів:');
      Object.entries(contextStats.byField).forEach(([field, count]) => {
        if (count > 0) {
          console.log(`   ${field}: ${count} записів`);
        }
      });
      
      console.log(`\n🔍 Всього пошукових полів: ${contextStats.totalSearchableFields}`);
      console.log(`📝 Записів з контекстом: ${contextStats.totalWithContext}`);
      
      return contextStats;
    },

    getIssuesArray: () => hybridSearchEngine.contextUtils.getIssuesArray()
  };
}

// Експорт для ES6 модулів
export default hybridSearchEngine;