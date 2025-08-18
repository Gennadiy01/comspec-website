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
 * Отримання правильного URL для зображень з врахуванням базового шляху та нової структури папок
 * @param {string} imagePath - Шлях до зображення
 * @param {string} size - Розмір зображення ('desktop', 'mobile', 'placeholder')
 * @returns {string} Повний URL зображення
 */
export const getImageUrl = (imagePath, size = 'desktop') => {
  if (!imagePath) return null;
  
  // Якщо вже повний URL - повертаємо як є
  if (imagePath.startsWith('http')) return imagePath;
  
  // Базовий URL для GitHub Pages
  const baseUrl = process.env.PUBLIC_URL || '';
  
  // Перевіряємо чи шлях вже містить baseUrl
  const cleanImagePath = imagePath.startsWith(baseUrl) ? imagePath.replace(baseUrl, '') : imagePath;
  
  // Якщо шлях вказує на /images/products/ - оновлюємо структуру
  if (cleanImagePath.includes('/images/products/') && !cleanImagePath.includes('/desktop/') && !cleanImagePath.includes('/mobile/') && !cleanImagePath.includes('/placeholders/')) {
    // Витягуємо назву файлу
    const fileName = cleanImagePath.split('/').pop();
    
    // Формуємо новий шлях залежно від розміру
    switch (size) {
      case 'mobile':
        // Для mobile версії додаємо -mobile перед розширенням
        const mobileFileName = fileName.replace(/\.(jpg|jpeg|png)$/i, '-mobile.$1');
        return `${baseUrl}/images/products/mobile/${mobileFileName}`;
        
      case 'placeholder':
        // Для placeholder додаємо -placeholder перед розширенням та змінюємо на SVG
        const placeholderFileName = fileName.replace(/\.(jpg|jpeg|png)$/i, '-placeholder.svg');
        return `${baseUrl}/images/products/placeholders/${placeholderFileName}`;
        
      case 'desktop':
      default:
        // Для desktop версії використовуємо папку desktop
        return `${baseUrl}/images/products/desktop/${fileName}`;
    }
  }
  
  // Якщо шлях вже містить структуру папок - повертаємо як є
  return `${baseUrl}${imagePath}`;
};

/**
 * Допоміжні функції для отримання зображень різних розмірів
 */
export const getDesktopImageUrl = (imagePath) => getImageUrl(imagePath, 'desktop');
export const getMobileImageUrl = (imagePath) => getImageUrl(imagePath, 'mobile');  
export const getPlaceholderImageUrl = (imagePath) => getImageUrl(imagePath, 'placeholder');

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
    image: product.image, // LazyImage сама викличе getImageUrl()
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