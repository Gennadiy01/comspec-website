import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Products = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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
      title: 'Пісок річковий митий',
      category: 'sand',
      price: '420 грн/тонна',
      description: 'Чистий річковий пісок для будівельних робіт',
      properties: ['Митий', 'Без глинистих домішок', 'Фракція 0-5 мм'],
      image: '/images/sand-river.jpg'
    },
    {
      id: 4,
      title: 'Пісок кар\'єрний',
      category: 'sand',
      price: '380 грн/тонна',
      description: 'Кар\'єрний пісок для різних видів робіт',
      properties: ['Природний', 'Економний', 'Фракція 0-5 мм'],
      image: '/images/sand-quarry.jpg'
    },
    {
      id: 5,
      title: 'Асфальт гарячий',
      category: 'asphalt',
      price: '1200 грн/тонна',
      description: 'Гаряча асфальтобетонна суміш для дорожнього покриття',
      properties: ['Тип А', 'Гарячий', 'Високої якості'],
      image: '/images/asphalt-hot.jpg'
    },
    {
      id: 6,
      title: 'Бетон М200',
      category: 'concrete',
      price: '1800 грн/м³',
      description: 'Товарний бетон марки М200 для загального будівництва',
      properties: ['Марка М200', 'B15', 'Морозостійкий F100'],
      image: '/images/concrete-m200.jpg'
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

  return (
    <div className="products-page">
      <section className="section">
        <div className="container">
          <h1 className="section-title">Продукція</h1>
          
          {/* Filters */}
          <div className="filters" style={{marginBottom: '2rem'}}>
            <div className="category-filters" style={{marginBottom: '1rem'}}>
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`btn ${activeCategory === category.id ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setActiveCategory(category.id)}
                  style={{marginRight: '0.5rem', marginBottom: '0.5rem'}}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            <div className="search-filter">
              <input
                type="text"
                placeholder="Пошук продукції..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  width: '300px',
                  maxWidth: '100%'
                }}
              />
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
                  <Link to="/contacts" className="btn btn-accent">Замовити</Link>
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
        </div>
      </section>
    </div>
  );
};

export default Products;