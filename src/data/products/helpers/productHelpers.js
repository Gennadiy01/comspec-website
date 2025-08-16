// Утиліти для роботи з товарами COMSPEC
import { gravelData } from '../categories/gravel.js';
import { sandData } from '../categories/sand.js';
// import { asphaltData } from '../categories/asphalt.js';
// import { concreteData } from '../categories/concrete.js';

// Завантажуємо щебінь та пісок, інші категорії додамо пізніше
const categoriesData = {
  gravel: gravelData,
  sand: sandData
  // asphalt: asphaltData,
  // concrete: concreteData
};

// === БАЗОВІ ФУНКЦІЇ ОТРИМАННЯ ДАНИХ ===

/**
 * Отримання всіх товарів з усіх категорій
 * @returns {Array} Масив всіх товарів
 */
export const getAllProducts = () => {
  const allProducts = [];
  
  Object.keys(categoriesData).forEach(categoryKey => {
    const categoryData = categoriesData[categoryKey];
    if (categoryData && categoryData.products) {
      allProducts.push(...categoryData.products);
    }
  });
  
  return allProducts;
};

/**
 * Отримання товарів по категорії
 * @param {string} category - Ключ категорії (gravel, sand, asphalt, concrete)
 * @returns {Array} Масив товарів категорії
 */
export const getProductsByCategory = (category) => {
  const categoryData = categoriesData[category];
  return categoryData ? categoryData.products || [] : [];
};

/**
 * Отримання товару по ID
 * @param {string} productId - ID товару
 * @returns {Object|null} Товар або null якщо не знайдено
 */
export const getProductById = (productId) => {
  const allProducts = getAllProducts();
  return allProducts.find(product => product.id === productId) || null;
};

/**
 * Отримання товару по категорії та ID
 * @param {string} category - Категорія товару  
 * @param {string} productId - ID товару
 * @returns {Object|null} Товар або null якщо не знайдено
 */
export const getProductByCategoryAndId = (category, productId) => {
  const categoryProducts = getProductsByCategory(category);
  return categoryProducts.find(product => product.id === productId) || null;
};

/**
 * Отримання інформації про категорію
 * @param {string} category - Ключ категорії
 * @returns {Object|null} Дані категорії або null
 */
export const getCategoryInfo = (category) => {
  const categoryData = categoriesData[category];
  if (!categoryData) return null;
  
  return {
    category: categoryData.category,
    categoryName: categoryData.categoryName,
    description: categoryData.description,
    totalProducts: categoryData.products ? categoryData.products.length : 0
  };
};

/**
 * Отримання списку всіх категорій
 * @returns {Array} Масив об'єктів категорій
 */
export const getAllCategories = () => {
  return Object.keys(categoriesData).map(categoryKey => {
    const categoryData = categoriesData[categoryKey];
    return {
      id: categoryKey,
      name: categoryData.categoryName,
      description: categoryData.description,
      productsCount: categoryData.products ? categoryData.products.length : 0
    };
  });
};

// === ФУНКЦІЇ ПОШУКУ ===

/**
 * Пошук товарів по назві та опису
 * @param {string} query - Пошуковий запит
 * @param {string} category - Опціонально: категорія для пошуку
 * @returns {Array} Масив знайдених товарів
 */
export const searchProducts = (query, category = null) => {
  if (!query || query.trim().length === 0) {
    return category ? getProductsByCategory(category) : getAllProducts();
  }
  
  const searchTerm = query.toLowerCase().trim();
  const productsToSearch = category ? getProductsByCategory(category) : getAllProducts();
  
  return productsToSearch.filter(product => {
    const searchableText = [
      product.title,
      product.shortTitle || '',
      product.description,
      product.detailedDescription || '',
      ...product.properties,
      ...Object.values(product.specifications || {}),
      ...(product.tags || [])
    ].join(' ').toLowerCase();
    
    return searchableText.includes(searchTerm);
  });
};

/**
 * Розширений пошук товарів з фільтрами
 * @param {Object} searchParams - Параметри пошуку
 * @returns {Array} Масив відфільтрованих товарів
 */
export const advancedSearchProducts = (searchParams = {}) => {
  const {
    query = '',
    category = null,
    priceMin = null,
    priceMax = null,
    inStock = null,
    isPopular = null,
    isNew = null,
    specifications = {},
    tags = []
  } = searchParams;
  
  let products = searchProducts(query, category);
  
  // Фільтр по ціні
  if (priceMin !== null || priceMax !== null) {
    products = filterProductsByPrice(products, priceMin, priceMax);
  }
  
  // Фільтр по наявності
  if (inStock !== null) {
    products = products.filter(product => product.inStock === inStock);
  }
  
  // Фільтр по популярності
  if (isPopular !== null) {
    products = products.filter(product => product.isPopular === isPopular);
  }
  
  // Фільтр по новинкам
  if (isNew !== null) {
    products = products.filter(product => product.isNew === isNew);
  }
  
  // Фільтр по характеристикам
  if (specifications && Object.keys(specifications).length > 0) {
    products = filterProductsBySpecifications(products, specifications);
  }
  
  // Фільтр по тегам
  if (tags && tags.length > 0) {
    products = products.filter(product => 
      product.tags && tags.some(tag => product.tags.includes(tag))
    );
  }
  
  return products;
};

// === ФУНКЦІЇ ФІЛЬТРАЦІЇ ===

/**
 * Фільтрація товарів по ціні
 * @param {Array} products - Масив товарів
 * @param {number|null} minPrice - Мінімальна ціна
 * @param {number|null} maxPrice - Максимальна ціна
 * @returns {Array} Відфільтровані товари
 */
export const filterProductsByPrice = (products, minPrice = null, maxPrice = null) => {
  return products.filter(product => {
    const price = product.price;
    if (minPrice !== null && price < minPrice) return false;
    if (maxPrice !== null && price > maxPrice) return false;
    return true;
  });
};

/**
 * Фільтрація товарів по характеристикам
 * @param {Array} products - Масив товарів
 * @param {Object} specifications - Об'єкт характеристик для фільтрації
 * @returns {Array} Відфільтровані товари
 */
export const filterProductsBySpecifications = (products, specifications) => {
  return products.filter(product => {
    const productSpecs = product.specifications || {};
    
    return Object.keys(specifications).every(specKey => {
      const filterValue = specifications[specKey];
      const productValue = productSpecs[specKey];
      
      if (!productValue) return false;
      
      // Якщо фільтр - масив значень
      if (Array.isArray(filterValue)) {
        return filterValue.includes(productValue);
      }
      
      // Якщо фільтр - конкретне значення
      return productValue === filterValue;
    });
  });
};

/**
 * Отримання унікальних значень характеристики
 * @param {string} category - Категорія товарів
 * @param {string} specificationKey - Ключ характеристики
 * @returns {Array} Масив унікальних значень
 */
export const getUniqueSpecificationValues = (category, specificationKey) => {
  const products = getProductsByCategory(category);
  const values = new Set();
  
  products.forEach(product => {
    const specValue = product.specifications?.[specificationKey];
    if (specValue) {
      values.add(specValue);
    }
  });
  
  return Array.from(values).sort();
};

/**
 * Отримання діапазону цін для категорії
 * @param {string} category - Категорія товарів (опціонально)
 * @returns {Object} Об'єкт з min та max цінами
 */
export const getPriceRange = (category = null) => {
  const products = category ? getProductsByCategory(category) : getAllProducts();
  
  if (products.length === 0) {
    return { min: 0, max: 1000 };
  }
  
  const prices = products.map(product => product.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
};

// === ДОПОМІЖНІ ФУНКЦІЇ ===

/**
 * Сортування товарів
 * @param {Array} products - Масив товарів
 * @param {string} sortBy - Поле для сортування
 * @param {string} sortOrder - Порядок сортування (asc/desc)
 * @returns {Array} Відсортовані товари
 */
export const sortProducts = (products, sortBy = 'sortOrder', sortOrder = 'asc') => {
  return [...products].sort((a, b) => {
    let valueA = a[sortBy];
    let valueB = b[sortBy];
    
    // Для числових значень
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    }
    
    // Для текстових значень
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
      if (sortOrder === 'asc') {
        return valueA.localeCompare(valueB, 'uk');
      } else {
        return valueB.localeCompare(valueA, 'uk');
      }
    }
    
    return 0;
  });
};

/**
 * Перевірка наявності товару в наявності
 * @param {string} productId - ID товару
 * @returns {boolean} true якщо товар в наявності
 */
export const isProductInStock = (productId) => {
  const product = getProductById(productId);
  return product ? product.inStock && product.availability === 'in_stock' : false;
};

/**
 * Отримання популярних товарів
 * @param {number} limit - Ліміт кількості товарів
 * @param {string} category - Опціонально: категорія
 * @returns {Array} Масив популярних товарів
 */
export const getPopularProducts = (limit = 5, category = null) => {
  const products = category ? getProductsByCategory(category) : getAllProducts();
  return products
    .filter(product => product.isPopular)
    .sort((a, b) => (b.sortOrder || 0) - (a.sortOrder || 0))
    .slice(0, limit);
};

/**
 * Отримання нових товарів
 * @param {number} limit - Ліміт кількості товарів
 * @param {string} category - Опціонально: категорія
 * @returns {Array} Масив нових товарів
 */
export const getNewProducts = (limit = 5, category = null) => {
  const products = category ? getProductsByCategory(category) : getAllProducts();
  return products
    .filter(product => product.isNew)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, limit);
};

/**
 * Форматування ціни товару
 * @param {Object} product - Об'єкт товару
 * @returns {string} Відформатована ціна
 */
export const formatProductPrice = (product) => {
  if (!product || !product.price) return 'Ціна не вказана';
  
  const price = Number(product.price).toLocaleString('uk-UA');
  const currency = product.currency || 'грн';
  
  // Додаємо "від" перед ціною для категорії щебінь
  const pricePrefix = product.category === 'gravel' ? 'від ' : '';
  
  if (product.priceValidUntil) {
    const validUntilDate = new Date(product.priceValidUntil);
    const formattedDate = validUntilDate.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return `${pricePrefix}${price} ${currency} <span style="white-space: nowrap;">(до ${formattedDate})</span>`;
  }
  
  return `${pricePrefix}${price} ${currency}`;
};

/**
 * Форматування ціни товару як об'єкт з окремими частинами
 * @param {Object} product - Об'єкт товару
 * @returns {Object} Об'єкт з основною ціною та датою
 */
export const formatProductPriceParts = (product) => {
  if (!product || !product.price) {
    return {
      priceNumber: 'Ціна не вказана',
      currency: null,
      validUntil: null
    };
  }
  
  const price = Number(product.price).toLocaleString('uk-UA');
  const currency = product.currency || 'грн';
  
  // Додаємо "від" перед ціною для категорії щебінь
  const pricePrefix = product.category === 'gravel' ? 'від ' : '';
  
  let validUntil = null;
  if (product.priceValidUntil) {
    const validUntilDate = new Date(product.priceValidUntil);
    const formattedDate = validUntilDate.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    validUntil = `(до ${formattedDate})`;
  }
  
  return {
    priceNumber: `${pricePrefix}${price}`,        // "від 850" для щебеню або "850" для інших
    currency: currency,        // "грн/т" для щебеню
    validUntil: validUntil    // "(до 01.09.2025)" або null
  };
};

/**
 * Генерація URL для сторінки товару
 * @param {Object} product - Об'єкт товару
 * @returns {string} URL сторінки товару
 */
export const generateProductUrl = (product) => {
  if (!product) return '/products';
  return `/products/${product.category}/${product.id}`;
};

// === ЕКСПОРТ ===
const ProductHelpers = {
  // Основні функції
  getAllProducts,
  getProductsByCategory,
  getProductById,
  getProductByCategoryAndId,
  getCategoryInfo,
  getAllCategories,
  
  // Пошук
  searchProducts,
  advancedSearchProducts,
  
  // Фільтрація
  filterProductsByPrice,
  filterProductsBySpecifications,
  getUniqueSpecificationValues,
  getPriceRange,
  
  // Допоміжні
  sortProducts,
  isProductInStock,
  getPopularProducts,
  getNewProducts,
  formatProductPrice,
  formatProductPriceParts,
  generateProductUrl
};

/**
 * Обгортає фракції у заголовку товару в no-wrap для запобігання розривам
 * @param {string} title - Заголовок товару
 * @returns {JSX.Element|string} JSX з обгорнутими фракціями або оригінальний заголовок
 */
export const wrapFractionsInTitle = (title) => {
  if (!title || typeof title !== 'string') return title;
  
  // Регулярний вираз для пошуку фракцій з можливими пробілами навколо: 0-5, 20-40, 0,05-70, 0,63-2,00 тощо
  const fractionRegex = /(\s*)(\d+(?:,\d+)?-\d+(?:,\d+)?)(\s*)/g;
  
  // Перевіряємо чи є фракції в заголовку (простіший регекс для тесту)
  const testRegex = /\d+(?:,\d+)?-\d+(?:,\d+)?/g;
  if (!testRegex.test(title)) {
    return title;
  }
  
  // Розбиваємо заголовок на частини та обгортаємо фракції
  const parts = [];
  let lastIndex = 0;
  let match;
  
  // Скидаємо регекс для нового пошуку
  fractionRegex.lastIndex = 0;
  
  while ((match = fractionRegex.exec(title)) !== null) {
    const [fullMatch, spaceBefore, fraction, spaceAfter] = match;
    
    // Додаємо текст перед фракцією (з пробілами перед)
    if (match.index > lastIndex) {
      parts.push(title.slice(lastIndex, match.index));
    }
    
    // Додаємо пробіли перед фракцією (якщо є)
    if (spaceBefore) {
      parts.push(spaceBefore);
    }
    
    // Додаємо фракцію з no-wrap
    parts.push({
      type: 'nowrap',
      content: fraction
    });
    
    // Додаємо пробіли після фракції (якщо є)
    if (spaceAfter) {
      parts.push(spaceAfter);
    }
    
    lastIndex = match.index + fullMatch.length;
  }
  
  // Додаємо залишок тексту
  if (lastIndex < title.length) {
    parts.push(title.slice(lastIndex));
  }
  
  return parts;
};

export default ProductHelpers;