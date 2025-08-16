import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOrderModal } from '../context/OrderModalContext';
import ProductsAPI, { formatProductPriceParts, getImageUrl } from '../data/products/productsAPI.js';
import ProductTitle from '../components/ProductTitle';

const ProductDetail = () => {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const { openOrderModal } = useOrderModal();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Знаходимо товар по категорії та ID
      const foundProduct = ProductsAPI.getAllProducts().find(p => 
        p.category === category && p.id === id
      );

      if (foundProduct) {
        setProduct(foundProduct);
        
        // Оновлюємо метадані для SEO
        if (foundProduct.seo) {
          document.title = foundProduct.seo.metaTitle || `${foundProduct.title} | COMSPEC`;
          
          // Оновлюємо meta description
          const metaDescription = document.querySelector('meta[name="description"]');
          if (metaDescription && foundProduct.seo.metaDescription) {
            metaDescription.setAttribute('content', foundProduct.seo.metaDescription);
          }
        }
      } else {
        // Товар не знайдено - перенаправляємо на сторінку товарів
        navigate('/products', { replace: true });
        return;
      }
    } catch (error) {
      console.error('Помилка завантаження товару:', error);
      navigate('/products', { replace: true });
      return;
    }
    
    setLoading(false);
  }, [category, id, navigate]);

  const handleOrderClick = () => {
    if (product) {
      openOrderModal({
        product: product.title,
        productTitle: product.title,
        source: 'product-detail-page'
      });
    }
  };

  const handleBackClick = () => {
    navigate('/products');
  };

  if (loading) {
    return (
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
        <p>Завантаження товару...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '2rem 2rem' }}>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
          <h2>Товар не знайдено</h2>
          <p>Вибачте, запитуваний товар не існує або був видалений.</p>
          <Link to="/products" className="btn btn-primary">
            Повернутись до каталогу
          </Link>
        </div>
      </div>
    );
  }

  const priceParts = formatProductPriceParts(product);

  return (
    <div className="container" style={{ padding: '2rem 2rem' }}>
      {/* Навігаційна панель */}
      <div className="breadcrumb-nav">
        <Link to="/" className="breadcrumb-link">Головна</Link>
        <span style={{ color: '#6c757d' }}>›</span>
        <Link to="/products" className="breadcrumb-link">Продукція</Link>
        <span style={{ color: '#6c757d' }}>›</span>
        <Link 
          to={`/products?category=${product.category}`} 
          className="breadcrumb-link"
        >
          {product.categoryName}
        </Link>
        <span style={{ color: '#6c757d' }}>›</span>
        <ProductTitle 
          title={product.shortTitle || product.title}
          tag="span"
          style={{ color: '#6c757d' }}
        />
      </div>

      {/* Кнопка назад */}
      <button 
        onClick={handleBackClick}
        className="back-button"
      >
        ← Назад до каталогу
      </button>

      {/* Основний контент товару */}
      <div className="product-content">
        {/* Зображення товару */}
        <div>
          <div 
            className="product-image"
          >
            {product.image ? (
              <img 
                src={getImageUrl(product.image)} 
                alt={product.imageAlt || product.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                <p>Фото товару</p>
              </div>
            )}
          </div>
        </div>

        {/* Інформація про товар */}
        <div>
          <ProductTitle 
            title={product.title}
            tag="h1"
            className="product-title"
          />

          {/* Ціна */}
          <div className="product-price">
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
          </div>

          {/* Наявність */}
          <div style={{
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            display: 'inline-block',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            fontWeight: '500',
            backgroundColor: product.inStock ? '#d4edda' : '#f8d7da',
            color: product.inStock ? '#155724' : '#721c24'
          }}>
            {product.inStock ? '✓ В наявності' : '✗ Немає в наявності'}
          </div>

          {/* Короткий опис */}
          <p style={{ 
            fontSize: '1.1rem', 
            lineHeight: '1.6',
            marginBottom: '2rem',
            color: '#2c3e50'
          }}>
            {product.description}
          </p>

          {/* Властивості */}
          {product.properties && product.properties.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Ключові особливості:</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {product.properties.map((prop, index) => (
                  <span
                    key={index}
                    style={{
                      display: 'inline-block',
                      background: '#e9ecef',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem'
                    }}
                  >
                    {prop}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Кнопки дій */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <button 
              className="btn btn-accent"
              onClick={handleOrderClick}
              style={{
                fontSize: '1.1rem',
                padding: '0.8rem 2rem'
              }}
            >
              Замовити товар
            </button>
            <Link 
              to={`/certificates/${product.category}`} 
              className="btn btn-primary"
              style={{
                fontSize: '1.1rem',
                padding: '0.8rem 2rem',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Сертифікати
            </Link>
          </div>

          {/* Сертифікати */}
          {product.certificates && product.certificates.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#2c3e50' }}>Сертифікати:</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {product.certificates.map((cert, index) => (
                  <span
                    key={index}
                    style={{
                      display: 'inline-block',
                      background: '#008080',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '15px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}
                  >
                    {cert.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Детальний опис */}
      {product.detailedDescription && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '2rem',
          borderRadius: '8px',
          marginBottom: '3rem'
        }}>
          <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Детальний опис</h2>
          <div style={{ 
            fontSize: '1rem', 
            lineHeight: '1.8',
            color: '#2c3e50'
          }}>
            {product.detailedDescription.split('\n').map((paragraph, index) => (
              <p key={index} style={{ marginBottom: '1rem' }}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Технічні характеристики */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '3rem'
        }}>
          <div style={{
            backgroundColor: '#008080',
            color: 'white',
            padding: '1rem 1.5rem',
            fontWeight: '600',
            fontSize: '1.1rem'
          }}>
            Технічні характеристики
          </div>
          <div style={{ padding: '0' }}>
            {Object.entries(product.specifications).map(([key, value], index) => (
              <div 
                key={key}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  padding: '1rem 1.5rem',
                  borderBottom: index < Object.keys(product.specifications).length - 1 ? '1px solid #e9ecef' : 'none',
                  backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff'
                }}
              >
                <div style={{ fontWeight: '500', color: '#2c3e50' }}>
                  {getSpecificationLabel(key)}:
                </div>
                <div style={{ color: '#2c3e50' }}>
                  {getSpecificationValue(key, value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Кнопка назад внизу */}
      <button 
        onClick={handleBackClick}
        className="back-button"
        style={{ marginTop: '3rem', marginBottom: '2rem' }}
      >
        ← Назад до каталогу
      </button>

      {/* CSS стилі */}
      <style>{`
        .breadcrumb-nav {
          margin-bottom: 2rem;
          padding: 1rem;
          background-color: #f8f9fa;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          flex-wrap: wrap;
        }
        
        .breadcrumb-link {
          color: #008080;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        
        .breadcrumb-link:hover {
          color: #006666;
          text-decoration: underline;
        }
        
        .back-button {
          background: none;
          border: 1px solid #008080;
          color: #008080;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }
        
        .back-button:hover {
          background-color: #008080;
          color: white;
        }
        
        .product-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }
        
        .product-image {
          position: relative;
          height: 400px;
          background-color: #f8f9fa;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
          overflow: hidden;
        }
        
        .product-title {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #2c3e50;
        }
        
        .product-price {
          font-size: 1.5rem;
          font-weight: 600;
          color: #008080;
          margin-bottom: 1.5rem;
          line-height: 1.4;
        }
        
        /* Планшети */
        @media (max-width: 1024px) {
          .container {
            padding: 2rem 1.5rem;
          }
          
          .product-content {
            gap: 2rem;
          }
          
          .breadcrumb-nav {
            padding: 0.75rem;
            font-size: 0.85rem;
          }
          
          .product-image {
            height: 300px;
          }
          
          .product-title {
            font-size: 1.8rem;
          }
          
          .product-price {
            font-size: 1.4rem;
          }
        }
        
        /* Мобільні */
        @media (max-width: 768px) {
          .container {
            padding: 1.5rem 1rem;
          }
          
          .product-content {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .breadcrumb-nav {
            padding: 0.5rem;
            font-size: 0.8rem;
            gap: 0.25rem;
          }
          
          .back-button {
            width: 100%;
            justify-content: center;
            padding: 0.75rem;
          }
          
          .product-image {
            height: 250px;
          }
          
          .product-title {
            font-size: 1.5rem;
          }
          
          .product-price {
            font-size: 1.3rem;
          }
        }
        
        /* Дуже маленькі екрани */
        @media (max-width: 480px) {
          .container {
            padding: 1rem 1rem !important;
          }
          
          .breadcrumb-nav {
            margin-bottom: 1rem;
          }
          
          .product-image {
            height: 200px;
          }
          
          .product-title {
            font-size: 1.3rem;
          }
          
          .product-price {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
};

// Допоміжна функція для отримання зрозумілих назв характеристик
const getSpecificationLabel = (key) => {
  const labels = {
    fraction: 'Фракція',
    density: 'Щільність',
    strength: 'Міцність',
    frost_resistance: 'Морозостійкість',
    rock_type: 'Тип породи',
    sand_type: 'Тип піску',
    module_size: 'Модуль крупності',
    clay_content: 'Вміст глинистих частинок',
    moisture: 'Вологість',
    bulk_density: 'Насипна щільність',
    concrete_grade: 'Марка бетону',
    concrete_class: 'Клас бетону',
    workability: 'Рухливість',
    asphalt_type: 'Тип асфальту',
    asphalt_grade: 'Марка асфальту',
    max_grain_size: 'Максимальний розмір зерен'
  };
  
  return labels[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
};

// Функція для перекладу значень характеристик
const getSpecificationValue = (key, value) => {
  // Переклади для типу породи
  if (key === 'rock_type') {
    const rockTypeTranslations = {
      'granite': 'граніт'
    };
    return rockTypeTranslations[value] || value;
  }
  
  // Переклади для типу піску
  if (key === 'sand_type') {
    const sandTypeTranslations = {
      'river': 'річковий',
      'ravine': 'яружний'
    };
    return sandTypeTranslations[value] || value;
  }
  
  // Для інших характеристик повертаємо оригінальне значення
  return value;
};

export default ProductDetail;