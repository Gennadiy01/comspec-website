// API для роботи з товарами COMSPEC
// Головний файл для імпорту всіх функцій управління товарами

// Імпорт допоміжних функцій
import productHelpers, { wrapFractionsInTitle } from './helpers/productHelpers.js';

// Імпорт схеми товару
import { ProductSchema, FilterConfig, ExampleProducts } from './schemas/productSchema.js';

// === ОСНОВНІ ЕКСПОРТИ ===

// Функції роботи з товарами
export const {
  // Базові функції
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
} = productHelpers;

// Експорт окремих функцій
export { wrapFractionsInTitle };

// Експорт схеми та конфігурації
export { ProductSchema, FilterConfig, ExampleProducts };

// === КОНСТАНТИ ===

// Мапінг категорій (для сумісності з існуючим кодом)
export const CATEGORY_MAPPING = {
  'gravel': 'Щебінь',
  'sand': 'Пісок', 
  'asphalt': 'Асфальт',
  'concrete': 'Бетон'
};

// Зворотний мапінг (українською → англійською)
export const REVERSE_CATEGORY_MAPPING = {
  'Щебінь': 'gravel',
  'Пісок': 'sand',
  'Асфальт': 'asphalt',
  'Бетон': 'concrete'
};

// Список категорій для фільтрів (сумісність з Products.js)
export const CATEGORIES_LIST = [
  { id: 'all', name: 'Всі категорії' },
  { id: 'gravel', name: 'Щебінь' },
  { id: 'sand', name: 'Пісок' },
  { id: 'asphalt', name: 'Асфальт' },
  { id: 'concrete', name: 'Бетон' }
];

// === УТИЛІТАРНІ ФУНКЦІЇ ===

/**
 * Отримання правильного URL для зображень з врахуванням базового шляху
 * @param {string} imagePath - Шлях до зображення
 * @returns {string} Повний URL зображення
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Якщо вже повний URL - повертаємо як є
  if (imagePath.startsWith('http')) return imagePath;
  
  // Додаємо базовий URL для GitHub Pages
  const baseUrl = process.env.PUBLIC_URL || '';
  return `${baseUrl}${imagePath}`;
};

// === ФУНКЦІЇ СУМІСНОСТІ ===

/**
 * Отримання товарів у форматі, сумісному з поточним Products.js
 * @returns {Array} Масив товарів у старому форматі
 */
export const getProductsForLegacyCode = () => {
  const allProducts = getAllProducts();
  
  return allProducts.map(product => ({
    id: product.id,
    title: product.title,
    category: product.category,
    price: formatProductPrice(product),
    description: product.description,
    properties: product.properties || [],
    image: getImageUrl(product.image),
    imageAlt: product.imageAlt
  }));
};

/**
 * Конвертація категорії з англійської на українську (для OrderModal)
 * @param {string} englishCategory - Англійська назва категорії
 * @returns {string} Українська назва категорії
 */
export const convertCategoryToUkrainian = (englishCategory) => {
  return CATEGORY_MAPPING[englishCategory] || englishCategory;
};

// === ЕКСПОРТ ЗА ЗАМОВЧУВАННЯМ ===
const ProductsAPI = {
  // Основні функції
  getAllProducts,
  getProductsByCategory,
  getProductById,
  
  // Функції сумісності
  getProductsForLegacyCode,
  convertCategoryToUkrainian,
  
  // Константи
  CATEGORY_MAPPING,
  CATEGORIES_LIST
};

export default ProductsAPI;