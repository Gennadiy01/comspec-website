import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useOrderModal } from '../context/OrderModalContext';

const Products = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
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

  const products = [
    {
      id: 1,
      title: 'Щебінь гранітний 5-20',
      category: 'gravel',
      price: '850 грн/тонна',
      description: 'Високоміцний щебінь для будівництва доріг та фундаментів',
      properties: ['Морозостійкий', 'Високої міцності', 'Фракція 5-20 мм'],
      image: '/images/gravel-5-20.jpg'
    },
    {
      id: 12,
      title: 'Щебінь гранітний 5-10',
      category: 'gravel',
      price: '350 грн/тонна',
      description: 'Високоміцний щебінь для будівництва доріг та фундаментів',
      properties: ['Морозостійкий', 'Високої міцності', 'Фракція 5-10 мм'],
      image: '/images/products/gravel-5-10.jpg'
    },
    {
      id: 2,
      title: 'Щебінь гранітний 20-40',
      category: 'gravel',
      price: '820 грн/тонна',
      description: 'Крупний щебінь для масивних конструкцій',
      properties: ['Морозостійкий', 'Високої міцності', 'Фракція 20-40 мм'],
      image: '/images/gravel-20-40.jpg'
    },
    {
      id: 3,
      title: 'Щебінь вапняковий 10-20',
      category: 'gravel',
      price: '750 грн/тонна',
      description: 'Вапняковий щебінь для дорожнього будівництва',
      properties: ['Економний', 'Середньої міцності', 'Фракція 10-20 мм'],
      image: '/images/gravel-limestone.jpg'
    },
    {
      id: 4,
      title: 'Пісок річковий митий',
      category: 'sand',
      price: '420 грн/тонна',
      description: 'Чистий річковий пісок для будівельних робіт',
      properties: ['Митий', 'Без глинистих домішок', 'Фракція 0-5 мм'],
      image: '/images/sand-river.jpg'
    },
    {
      id: 5,
      title: 'Пісок кар\'єрний',
      category: 'sand',
      price: '380 грн/тонна',
      description: 'Кар\'єрний пісок для різних видів робіт',
      properties: ['Природний', 'Економний', 'Фракція 0-5 мм'],
      image: '/images/sand-quarry.jpg'
    },
    {
      id: 6,
      title: 'Пісок будівельний',
      category: 'sand',
      price: '400 грн/тонна',
      description: 'Універсальний будівельний пісок',
      properties: ['Сертифікований', 'Універсальний', 'Фракція 0-3 мм'],
      image: '/images/sand-construction.jpg'
    },
    {
      id: 7,
      title: 'Асфальт гарячий',
      category: 'asphalt',
      price: '1200 грн/тонна',
      description: 'Гаряча асфальтобетонна суміш для дорожнього покриття',
      properties: ['Тип А', 'Гарячий', 'Високої якості'],
      image: '/images/asphalt-hot.jpg'
    },
    {
      id: 8,
      title: 'Асфальт холодний',
      category: 'asphalt',
      price: '1100 грн/тонна',
      description: 'Холодна асфальтобетонна суміш для ремонтних робіт',
      properties: ['Тип Б', 'Холодний', 'Для ремонту'],
      image: '/images/asphalt-cold.jpg'
    },
    {
      id: 9,
      title: 'Бетон М200',
      category: 'concrete',
      price: '1800 грн/м³',
      description: 'Товарний бетон марки М200 для загального будівництва',
      properties: ['Марка М200', 'B15', 'Морозостійкий F100'],
      image: '/images/concrete-m200.jpg'
    },
    {
      id: 10,
      title: 'Бетон М300',
      category: 'concrete',
      price: '2000 грн/м³',
      description: 'Товарний бетон марки М300 для відповідальних конструкцій',
      properties: ['Марка М300', 'B22.5', 'Морозостійкий F150'],
      image: '/images/concrete-m300.jpg'
    },
    {
      id: 11,
      title: 'Бетон М400',
      category: 'concrete',
      price: '2200 грн/м³',
      description: 'Високоміцний бетон для спеціальних конструкцій',
      properties: ['Марка М400', 'B30', 'Морозостійкий F200'],
      image: '/images/concrete-m400.jpg'
    }
  ];

  const categories = [
    { id: 'all', name: 'Всі категорії' },
    { id: 'gravel', name: 'Щебінь' },
    { id: 'sand', name: 'Пісок' },
    { id: 'asphalt', name: 'Асфальт' },
    { id: 'concrete', name: 'Бетон' }
  ];

  const filteredProducts = products.filter(product => {
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
  const handleOrderClick = (product) => {
    openOrderModal({
      product: product.category,
      preSelectedProduct: product.title,
      source: 'product-page'
    });
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
                  height: '16px'
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

          {/* Products Grid */}
          <div className="grid grid-3">
            {filteredProducts.map(product => (
              <div key={product.id} className="card">
                <div style={{
                  height: '200px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6c757d'
                }}>
                  Фото товару
                </div>
                
                <h3>{product.title}</h3>
                <p className="price" style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#008080',
                  marginBottom: '1rem'
                }}>
                  {product.price}
                </p>
                
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
                    onClick={() => handleOrderClick(product)}
                  >
                    Замовити
                  </button>
                  <Link 
                    to={`/certificates/${product.category}`} 
                    className="btn btn-primary"
                    style={{fontSize: '0.875rem'}}
                  >
                    Сертифікати
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
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

export default Products;