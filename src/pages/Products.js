import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useOrderModal } from '../context/OrderModalContext';
import ProductsAPI, { formatProductPriceParts } from '../data/products/productsAPI.js';
import ProductTitle from '../components/ProductTitle';

const Products = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { openOrderModal } = useOrderModal();

  // Обробка URL параметрів при завантаженні компонента
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const categoryParam = urlParams.get('category');
    
    if (categoryParam && ['gravel', 'sand', 'asphalt', 'concrete'].includes(categoryParam)) {
      setActiveCategory(categoryParam);
    } else {
      setActiveCategory('all');
    }
  }, [location.search]);

  // Завантаження товарів з нової системи
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Завантаження товарів при ініціалізації компонента
  useEffect(() => {
    try {
      // Поки що завантажуємо тільки щебінь (інші категорії будуть додані пізніше)
      const productsData = ProductsAPI.getProductsForLegacyCode();
      setAllProducts(productsData);
      setLoading(false);
    } catch (error) {
      console.error('Помилка завантаження товарів:', error);
      // Fallback до пустого масиву при помилці
      setAllProducts([]);
      setLoading(false);
    }
  }, []);

  // Отримання категорій з API
  const categories = ProductsAPI.CATEGORIES_LIST;

  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Функція для отримання назви активної категорії
  const getActiveCategoryName = () => {
    const category = categories.find(cat => cat.id === activeCategory);
    return category ? category.name : 'Всі категорії';
  };

  // Обробник зміни категорії з оновленням URL
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    
    // Оновлюємо URL без перезавантаження сторінки
    const newUrl = categoryId === 'all' 
      ? '/products' 
      : `/products?category=${categoryId}`;
    
    window.history.pushState(null, '', newUrl);
  };

  // Функція очищення пошуку
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Функція обробки замовлення
  const handleOrderClick = (e, product) => {
    e.stopPropagation(); // Запобігаємо переходу на сторінку товару при кліку на кнопку
    openOrderModal({
      product: product.title,
      productTitle: product.title,
      source: 'products-page'
    });
  };

  // Функція переходу на сторінку товару
  const handleProductClick = (product) => {
    // Знаходимо оригінальний продукт для отримання категорії
    const originalProduct = ProductsAPI.getAllProducts().find(p => p.id === product.id);
    if (originalProduct) {
      navigate(`/products/${originalProduct.category}/${originalProduct.id}`);
    }
  };

  return (
    <div className="products-page">
      <section className="section">
        <div className="container">
          <h1 className="section-title">Продукція</h1>
          
          {/* Показуємо обрану категорію */}
          {activeCategory !== 'all' && (
            <div style={{
              textAlign: 'center',
              marginBottom: '1.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#e6f3f3',
              borderRadius: '8px',
              color: '#008080',
              fontWeight: '600'
            }}>
              Обрана категорія: {getActiveCategoryName()}
            </div>
          )}
          
          {/* Filters */}
          <div className="filters" style={{marginBottom: '2rem'}}>
            <div className="category-filters" style={{marginBottom: '1rem'}}>
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`btn ${activeCategory === category.id ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleCategoryChange(category.id)}
                  style={{
                    marginRight: '0.5rem', 
                    marginBottom: '0.5rem',
                    backgroundColor: activeCategory === category.id ? '#008080' : 'transparent',
                    color: activeCategory === category.id ? '#ffffff' : '#008080',
                    borderColor: '#008080'
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            <div className="search-filter">
              <div style={{
                position: 'relative',
                display: 'inline-block',
                width: '300px',
                maxWidth: '100%'
              }}>
                {/* Іконка пошуку */}
                <div style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#008080',
                  pointerEvents: 'none',
                  zIndex: 1,
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: '100%', height: '100%' }}>
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                
                <input
                  type="text"
                  placeholder="Пошук продукції..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    paddingRight: searchTerm ? '2.5rem' : '0.75rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '6px',
                    width: '100%',
                    fontSize: '1rem',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#008080';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 128, 128, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                
                {/* Кнопка очищення */}
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#6c757d',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      padding: '0',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      transition: 'color 0.2s ease, background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#008080';
                      e.target.style.backgroundColor = 'rgba(0, 128, 128, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#6c757d';
                      e.target.style.backgroundColor = 'transparent';
                    }}
                    title="Очистити пошук"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6c757d'
            }}>
              <div style={{
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #008080',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '1rem'
              }}></div>
              <p>Завантаження товарів...</p>
            </div>
          )}

          {/* Products Grid */}
          {!loading && (
            <div className="grid grid-3">
              {filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="card"
                onClick={() => handleProductClick(product)}
                style={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '';
                }}
              >
                <div style={{
                  height: '200px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6c757d',
                  overflow: 'hidden'
                }}>
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.imageAlt || product.title}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
                      <p>Фото товару</p>
                    </div>
                  )}
                </div>
                
                <ProductTitle title={product.title} />
                <div className="price" style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#008080',
                  marginBottom: '1rem',
                  lineHeight: '1.4'
                }}>
                  {(() => {
                    // Знаходимо оригінальний продукт з JSON для отримання priceValidUntil
                    const originalProduct = ProductsAPI.getAllProducts().find(p => p.id === product.id);
                    if (originalProduct) {
                      const priceParts = formatProductPriceParts(originalProduct);
                      return (
                        <>
                          <span style={{ whiteSpace: 'nowrap' }}>
                            {priceParts.priceNumber} {priceParts.currency}
                          </span>
                          {priceParts.validUntil && (
                            <>
                              {' '}
                              <span style={{ whiteSpace: 'nowrap' }}>
                                {priceParts.validUntil}
                              </span>
                            </>
                          )}
                        </>
                      );
                    }
                    return product.price;
                  })()}
                </div>
                
                <p>{product.description}</p>
                
                <div className="properties" style={{marginBottom: '1.5rem'}}>
                  {product.properties.map((prop, index) => (
                    <span
                      key={index}
                      style={{
                        display: 'inline-block',
                        background: '#e9ecef',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                        marginRight: '0.5rem',
                        marginBottom: '0.5rem'
                      }}
                    >
                      {prop}
                    </span>
                  ))}
                </div>
                
                <div className="card-actions" style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  <button 
                    className="btn btn-accent"
                    onClick={(e) => handleOrderClick(e, product)}
                  >
                    Замовити
                  </button>
                  <Link 
                    to={`/certificates/${product.category}`} 
                    className="btn btn-primary"
                    style={{fontSize: '0.875rem'}}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Сертифікати
                  </Link>
                </div>
              </div>
              ))}
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div style={{textAlign: 'center', padding: '3rem', color: '#6c757d'}}>
              <h3>Продукцію не знайдено</h3>
              <p>Спробуйте змінити фільтри або пошукову фразу</p>
            </div>
          )}

          {/* Повернення до всіх категорій */}
          {activeCategory !== 'all' && (
            <div style={{textAlign: 'center', marginTop: '2rem'}}>
              <button 
                onClick={() => handleCategoryChange('all')}
                className="btn btn-primary"
                style={{padding: '0.75rem 2rem'}}
              >
                Показати всі продукти
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// Додаємо CSS стилі для анімації завантаження
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
if (!document.head.querySelector('style[data-products-spinner]')) {
  style.setAttribute('data-products-spinner', 'true');
  document.head.appendChild(style);
}

export default Products;