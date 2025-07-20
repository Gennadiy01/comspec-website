// src/components/search/SearchEngine.js
class SearchEngine {
  constructor() {
    this.indexedContent = [];
    this.isIndexed = false;
    
    // Селектори для сканування контенту
    this.selectors = {
      headers: 'h1, h2, h3, h4, h5, h6',
      cards: '.product-card, .service-card, .about-feature, .stat-item',
      paragraphs: 'p, .product-description, .service-content p, .about-text p',
      navigation: 'nav a, .footer-section a',
      contacts: '.contact-item, .contact-info, .header-phone',
      buttons: '.btn, .product-link, .feature-tag',
      lists: 'li, .footer-section ul li'
    };

    // Категорії контенту
    this.categories = {
      'Продукція': ['#products', '.product-card', '.products'],
      'Послуги': ['#services', '.service-card', '.services'],
      'Про нас': ['#about', '.about', '.about-content'],
      'Контакти': ['#contacts', 'footer', '.contact-info'],
      'Навігація': ['header', 'nav', '.header-content'],
      'Головна': ['#home', '.hero', '.stats-bar']
    };

    // Бусти релевантності
    this.relevanceBoosts = {
      'h1': 10,
      'h2': 8,
      'h3': 6,
      'h4': 4,
      '.product-name': 8,
      '.service-content h3': 8,
      '.stat-label': 6,
      '.contact-item': 7,
      'nav a': 5,
      'p': 3,
      '.feature-tag': 4,
      'default': 1
    };
  }

  // Основний метод індексації
  indexContent() {
    console.log('🔍 Початок індексації контенту...');
    this.indexedContent = [];
    
    // Індексуємо контент по категоріях
    Object.entries(this.categories).forEach(([category, selectors]) => {
      selectors.forEach(selector => {
        const section = document.querySelector(selector);
        if (section) {
          this.indexSection(section, category);
        }
      });
    });

    // Додатково індексуємо елементи по типах
    Object.entries(this.selectors).forEach(([type, selector]) => {
      this.indexBySelector(selector, type);
    });

    this.isIndexed = true;
    console.log(`✅ Індексація завершена. Знайдено ${this.indexedContent.length} елементів`);
    
    return this.indexedContent;
  }

  // Індексація секції
  indexSection(section, category) {
    const elements = section.querySelectorAll('*');
    
    elements.forEach(element => {
      const text = this.extractText(element);
      if (text && text.length > 2) {
        const item = this.createIndexItem(element, text, category);
        if (item && !this.isDuplicate(item)) {
          this.indexedContent.push(item);
        }
      }
    });
  }

  // Індексація по селектору
  indexBySelector(selector, type) {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(element => {
      const text = this.extractText(element);
      if (text && text.length > 2) {
        const category = this.determineCategory(element);
        const item = this.createIndexItem(element, text, category, type);
        if (item && !this.isDuplicate(item)) {
          this.indexedContent.push(item);
        }
      }
    });
  }

  // Створення елемента індексу
  createIndexItem(element, text, category, type = null) {
    const tagName = element.tagName.toLowerCase();
    const boost = this.getRelevanceBoost(element, tagName);
    
    return {
      id: this.generateId(element, text),
      element: element,
      text: text.trim(),
      cleanText: this.cleanText(text),
      category: category,
      type: type,
      tagName: tagName,
      relevanceBoost: boost,
      url: this.generateUrl(element, category),
      keywords: this.extractKeywords(text),
      className: element.className || '',
      elementId: element.id || ''
    };
  }

  // Очищення тексту
  cleanText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s\u0400-\u04FF]/g, ' ') // Зберігаємо кирилицю
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Витягування тексту з елемента
  extractText(element) {
    // Пропускаємо скрипти та стилі
    if (['script', 'style', 'noscript'].includes(element.tagName.toLowerCase())) {
      return '';
    }

    // Для елементів з прямим текстом
    const directText = Array.from(element.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent.trim())
      .join(' ');

    if (directText && directText.length > 2) {
      return directText;
    }

    // Для елементів з вкладеним контентом
    return element.textContent?.trim() || '';
  }

  // Визначення категорії елемента
  determineCategory(element) {
    // Шукаємо найближчу секцію
    let current = element;
    while (current && current !== document.body) {
      if (current.id) {
        switch (current.id) {
          case 'products': return 'Продукція';
          case 'services': return 'Послуги';
          case 'about': return 'Про нас';
          case 'contacts': return 'Контакти';
          case 'home': return 'Головна';
          default: break; // Продовжуємо пошук
        }
      }
      
      if (current.className) {
        if (current.className.includes('hero')) return 'Головна';
        if (current.className.includes('product')) return 'Продукція';
        if (current.className.includes('service')) return 'Послуги';
        if (current.className.includes('about')) return 'Про нас';
        if (current.className.includes('contact') || current.tagName === 'FOOTER') return 'Контакти';
      }
      
      current = current.parentElement;
    }
    
    return 'Загальне';
  }

  // Генерація URL для навігації
  generateUrl(element, category) {
    const section = this.findNearestSection(element);
    if (section?.id) {
      return `#${section.id}`;
    }
    
    switch (category) {
      case 'Продукція': return '#products';
      case 'Послуги': return '#services';
      case 'Про нас': return '#about';
      case 'Контакти': return '#contacts';
      case 'Головна': return '#home';
      case 'Навігація': return '#home';
      case 'Загальне': return '#home';
      default: return '#home';
    }
  }

  // Пошук найближчої секції
  findNearestSection(element) {
    let current = element;
    while (current && current !== document.body) {
      if (['section', 'main', 'article'].includes(current.tagName.toLowerCase()) && current.id) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  // Витягування ключових слів
  extractKeywords(text) {
    const words = this.cleanText(text).split(' ');
    return words.filter(word => word.length > 2);
  }

  // Отримання бусту релевантності
  getRelevanceBoost(element, tagName) {
    // Перевіряємо спеціальні класи
    const className = element.className || '';
    
    if (className.includes('product-name')) return this.relevanceBoosts['.product-name'];
    if (className.includes('service-content') && tagName === 'h3') return this.relevanceBoosts['.service-content h3'];
    if (className.includes('stat-label')) return this.relevanceBoosts['.stat-label'];
    if (className.includes('contact-item')) return this.relevanceBoosts['.contact-item'];
    if (className.includes('feature-tag')) return this.relevanceBoosts['.feature-tag'];
    
    // Стандартні теги
    return this.relevanceBoosts[tagName] || this.relevanceBoosts.default;
  }

  // Генерація унікального ID
  generateId(element, text) {
    const position = Array.from(document.querySelectorAll('*')).indexOf(element);
    return `${element.tagName.toLowerCase()}_${position}_${text.slice(0, 10).replace(/\s/g, '')}_${Date.now()}`;
  }

  // Перевірка на дублікати
  isDuplicate(newItem) {
    return this.indexedContent.some(item => 
      item.text === newItem.text && 
      item.category === newItem.category &&
      item.tagName === newItem.tagName
    );
  }

  // Пошук по індексу
  search(query, options = {}) {
    if (!this.isIndexed) {
      this.indexContent();
    }

    const {
      category = null,
      minRelevance = 0,
      limit = 50,
      exactMatch = false
    } = options;

    const cleanQuery = this.cleanText(query);
    const queryWords = cleanQuery.split(' ').filter(word => word.length > 1);
    
    if (queryWords.length === 0) return [];

    let results = this.indexedContent
      .map(item => ({
        ...item,
        relevance: this.calculateRelevance(item, cleanQuery, queryWords, exactMatch)
      }))
      .filter(item => {
        if (item.relevance < minRelevance) return false;
        if (category && item.category !== category) return false;
        return true;
      })
      .sort((a, b) => b.relevance - a.relevance);

    return results.slice(0, limit);
  }

  // Розрахунок релевантності
  calculateRelevance(item, cleanQuery, queryWords, exactMatch) {
    let score = 0;
    const itemText = item.cleanText;

    if (exactMatch) {
      if (itemText.includes(cleanQuery)) {
        score = 100 * item.relevanceBoost;
      }
    } else {
      // Повне співпадіння запиту
      if (itemText.includes(cleanQuery)) {
        score += 50 * item.relevanceBoost;
      }

      // Співпадіння окремих слів
      queryWords.forEach(word => {
        if (itemText.includes(word)) {
          score += 10 * item.relevanceBoost;
          
          // Бонус за співпадіння на початку
          if (itemText.startsWith(word)) {
            score += 5 * item.relevanceBoost;
          }
        }
      });

      // Бонус за кількість співпадань
      const matchCount = queryWords.filter(word => itemText.includes(word)).length;
      const matchRatio = matchCount / queryWords.length;
      score += matchRatio * 20 * item.relevanceBoost;
    }

    return Math.round(score);
  }

  // Навігація до елемента
  navigateToElement(item) {
    if (!item.element) return false;

    try {
      // Спочатку прокручуємо до секції, якщо є URL
      if (item.url && item.url !== '#home') {
        const targetSection = document.querySelector(item.url);
        if (targetSection) {
          targetSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }

      // Потім прокручуємо до конкретного елемента з затримкою
      setTimeout(() => {
        if (item.element && typeof item.element.scrollIntoView === 'function') {
          item.element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
          
          // Підсвічуємо елемент
          this.highlightElement(item.element);
        }
      }, item.url && item.url !== '#home' ? 500 : 100);
      
      return true;
    } catch (error) {
      console.error('Помилка навігації:', error);
      return false;
    }
  }

  // Підсвічування елемента
  highlightElement(element) {
    // Видаляємо попереднє підсвічування
    document.querySelectorAll('.search-highlight').forEach(el => {
      el.classList.remove('search-highlight');
    });

    // Додаємо підсвічування
    element.classList.add('search-highlight');
    
    console.log('✨ Підсвічено елемент:', element.tagName, element.textContent?.slice(0, 50));
    
    // Видаляємо через 5 секунд
    setTimeout(() => {
      element.classList.remove('search-highlight');
      console.log('🔄 Підсвічування знято');
    }, 5000);
  }

  // Отримання статистики індексу
  getIndexStats() {
    if (!this.isIndexed) return null;

    const stats = {
      total: this.indexedContent.length,
      byCategory: {},
      byType: {},
      byTag: {}
    };

    this.indexedContent.forEach(item => {
      // По категоріях
      stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
      
      // По типах
      if (item.type) {
        stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
      }
      
      // По тегах
      stats.byTag[item.tagName] = (stats.byTag[item.tagName] || 0) + 1;
    });

    return stats;
  }

  // Переіндексація (для динамічного контенту)
  reindex() {
    console.log('🔄 Переіндексація контенту...');
    this.isIndexed = false;
    return this.indexContent();
  }
}

// Експорт синглтона
const searchEngine = new SearchEngine();

// Додаємо в глобальний scope для налагодження
if (typeof window !== 'undefined') {
  window.searchEngine = searchEngine;
}

export default searchEngine;