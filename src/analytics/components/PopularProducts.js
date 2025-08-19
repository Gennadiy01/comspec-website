// src/analytics/components/PopularProducts.js
/**
 * 🔥 Компонент популярних товарів на основі аналітики
 * Показує товари з найбільшою кількістю переглядів
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ProductAnalytics from '../ProductAnalytics';
import ProductsAPI, { formatProductPriceParts } from '../../data/products/productsAPI';

const PopularProducts = ({ 
  limit = 5, 
  showInHomepage = false, 
  title = "Популярні товари",
  className = ""
}) => {
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPopularProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Отримуємо популярні товари з аналітики - завжди просимо більше ніж потрібно
      const popularItems = ProductAnalytics.getPopularProducts(50);

      // Починаємо з порожнього масиву і завжди заповнюємо до limit
      const products = [];

      // Спочатку додаємо товари з переглядами (якщо є)
      for (let i = 0; i < Math.min(popularItems.length, limit); i++) {
        const item = popularItems[i];
        const product = ProductsAPI.getProductById(item.productId);
        if (product) {
          products.push({
            ...product,
            views: item.views,
            lastViewed: item.lastViewed,
            isRecommended: false
          });
        }
      }

      // Завжди заповнюємо до limit рекомендованими товарами
      if (products.length < limit) {
        const remainingSlots = limit - products.length;
        const usedProductIds = products.map(p => p.id);
        
        // Отримуємо рекомендовані товари і фільтруємо вже використані
        const fallbackProducts = getFallbackProducts(remainingSlots + 5) // +5 щоб мати запас
          .filter(product => !usedProductIds.includes(product.id))
          .slice(0, remainingSlots); // Точно remainingSlots товарів
        
        products.push(...fallbackProducts);
      }

      setPopularProducts(products);

    } catch (error) {
      console.error('Помилка завантаження популярних товарів:', error);
      setError('Не вдалося завантажити популярні товари');
      
      // Показуємо fallback товари при помилці
      const fallbackProducts = getFallbackProducts(limit);
      setPopularProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadPopularProducts();
  }, [loadPopularProducts]);

  // Fallback товари якщо немає даних аналітики
  const getFallbackProducts = (limit) => {
    const allProducts = ProductsAPI.getAllProducts();
    
    // Розширений список рекомендованих товарів
    const recommendedIds = [
      'gravel-5-10',      // Щебінь 5-10 
      'sand-river',       // Пісок річковий
      'gravel-5-20',      // Щебінь 5-20
      'gravel-20-40',     // Щебінь 20-40
      'sand-ravine',      // Пісок яружний
      'gravel-10-20',     // Щебінь 10-20
      'mixture-0-40',     // Суміш 0-40
      'gravel-40-70',     // Щебінь 40-70
      'sand-washed-0-2',  // Пісок мийений 0-2
      'stone-raw'         // Камінь бут
    ];

    return recommendedIds
      .slice(0, limit)
      .map(id => allProducts.find(p => p.id === id))
      .filter(Boolean)
      .map(product => ({
        ...product,
        views: 0,
        isRecommended: true
      }));
  };

  const handleProductClick = (product, index) => {
    // Відстежуємо клік по популярному товару
    ProductAnalytics.trackEvent('popular_product_click', {
      productId: product.id,
      rank: index + 1,
      views: product.views,
      source: showInHomepage ? 'homepage' : 'catalog',
      isRecommended: product.isRecommended || false
    });
  };

  if (loading) {
    return (
      <div className={`popular-products ${className}`}>
        <h3 className="popular-products__title">{title}</h3>
        <div className="popular-products__loading">
          <div className="spinner"></div>
          <span>Завантаження...</span>
        </div>
      </div>
    );
  }

  if (error && popularProducts.length === 0) {
    return (
      <div className={`popular-products ${className}`}>
        <h3 className="popular-products__title">{title}</h3>
        <div className="popular-products__error">
          <span>❌ {error}</span>
        </div>
      </div>
    );
  }

  if (popularProducts.length === 0) {
    return null;
  }

  return (
    <div className={`popular-products ${showInHomepage ? 'homepage-version' : ''} ${className}`}>
      <div className="popular-products__header">
        <h3 className="popular-products__title">{title}</h3>
        {!showInHomepage && (
          <div className="popular-products__info">
            <span className="info-text">
              На основі {ProductAnalytics.getUserStats().totalViews} переглядів
            </span>
          </div>
        )}
      </div>
      
      <div className="popular-products__list">
        {popularProducts.map((product, index) => {
          const priceParts = formatProductPriceParts(product);
          
          return (
            <div key={product.id} className="popular-product-item">
              <div className="popular-product-rank">
                {index + 1}
              </div>
              
              {showInHomepage && (
                <div className="popular-product-image">
                  <Link 
                    to={`/products/${product.category}/${product.id}`}
                    onClick={() => handleProductClick(product, index)}
                  >
                    {product.image ? (
                      <img 
                        src={`${product.image}?_t=${Date.now()}`}
                        alt={product.title}
                        className="popular-product-img"
                      />
                    ) : (
                      <div className="popular-product-placeholder">
                        Немає фото
                      </div>
                    )}
                  </Link>
                </div>
              )}

              <div className="popular-product-info">
                <Link 
                  to={`/products/${product.category}/${product.id}`}
                  className="popular-product-title"
                  onClick={() => handleProductClick(product, index)}
                >
                  {product.title}
                </Link>
                
                <div className="popular-product-details">
                  <div className="popular-product-price">
                    {priceParts.priceNumber} {priceParts.currency}
                  </div>
                  
                  <div className="popular-product-stats">
                    {product.isRecommended ? (
                      <span className="recommended-badge">Рекомендовано</span>
                    ) : (
                      <span className="view-count">{product.views} переглядів</span>
                    )}
                    
                    {product.inStock && (
                      <span className="in-stock">В наявності</span>
                    )}
                  </div>
                </div>
              </div>

              {!showInHomepage && (
                <div className="popular-product-actions">
                  <Link 
                    to={`/products/${product.category}/${product.id}`}
                    className="btn btn-sm btn-primary"
                    onClick={() => handleProductClick(product, index)}
                  >
                    Детальніше
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showInHomepage && (
        <div className="popular-products__footer">
          <Link 
            to="/products" 
            className="popular-products__view-all btn btn-outline"
            onClick={() => ProductAnalytics.trackEvent('view_all_products_click', {
              source: 'homepage_popular_products'
            })}
          >
            Переглянути всі товари →
          </Link>
        </div>
      )}

    </div>
  );
};

export default PopularProducts;